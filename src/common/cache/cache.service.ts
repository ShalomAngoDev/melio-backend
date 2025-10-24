import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Service de cache Redis pour optimiser les performances
 * - Cache des requêtes fréquentes
 * - Invalidation intelligente
 * - Compression des données
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB', 0),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Redis connecté');
    });

    this.redis.on('error', (err) => {
      this.logger.error('❌ Erreur Redis:', err);
    });
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      return JSON.parse(value);
    } catch (error) {
      this.logger.warn(`Erreur lors de la récupération du cache ${key}:`, error);
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set(
    key: string,
    value: any,
    ttlSeconds: number = 3600, // 1 heure par défaut
  ): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.warn(`Erreur lors de la mise en cache ${key}:`, error);
    }
  }

  /**
   * Supprime une clé du cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(`Erreur lors de la suppression du cache ${key}:`, error);
    }
  }

  /**
   * Supprime toutes les clés correspondant à un pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Erreur lors de la suppression du pattern ${pattern}:`, error);
    }
  }

  /**
   * Cache avec fonction de fallback
   */
  async getOrSet<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    ttlSeconds: number = 3600,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fallbackFn();
    await this.set(key, result, ttlSeconds);
    return result;
  }

  /**
   * Cache pour les listes avec pagination
   */
  async getPaginatedList<T>(
    baseKey: string,
    page: number,
    limit: number,
    fallbackFn: () => Promise<{ data: T[]; total: number }>,
    ttlSeconds: number = 1800, // 30 minutes
  ): Promise<{ data: T[]; total: number; fromCache: boolean }> {
    const cacheKey = `${baseKey}:page:${page}:limit:${limit}`;
    const countKey = `${baseKey}:total`;

    const [cachedData, cachedTotal] = await Promise.all([
      this.get<T[]>(cacheKey),
      this.get<number>(countKey),
    ]);

    if (cachedData !== null && cachedTotal !== null) {
      return {
        data: cachedData,
        total: cachedTotal,
        fromCache: true,
      };
    }

    const result = await fallbackFn();
    await Promise.all([
      this.set(cacheKey, result.data, ttlSeconds),
      this.set(countKey, result.total, ttlSeconds),
    ]);

    return {
      data: result.data,
      total: result.total,
      fromCache: false,
    };
  }

  /**
   * Invalidation intelligente par pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    await this.delPattern(pattern);
    this.logger.log(`Cache invalidé pour le pattern: ${pattern}`);
  }

  /**
   * Invalidation pour les données d'une école
   */
  async invalidateSchoolData(schoolId: string): Promise<void> {
    const patterns = [
      `school:${schoolId}:*`,
      `students:school:${schoolId}:*`,
      `alerts:school:${schoolId}:*`,
      `reports:school:${schoolId}:*`,
      `stats:school:${schoolId}:*`,
    ];

    await Promise.all(patterns.map((pattern) => this.invalidatePattern(pattern)));
  }

  /**
   * Invalidation pour les données d'un agent
   */
  async invalidateAgentData(agentId: string): Promise<void> {
    const patterns = [`agent:${agentId}:*`, `schools:agent:${agentId}:*`];

    await Promise.all(patterns.map((pattern) => this.invalidatePattern(pattern)));
  }

  /**
   * Statistiques du cache
   */
  async getStats(): Promise<{
    memory: string;
    keys: number;
    hits: number;
    misses: number;
  }> {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      const stats = await this.redis.info('stats');

      return {
        memory: this.parseRedisInfo(info, 'used_memory_human'),
        keys: this.parseRedisInfo(keyspace, 'db0:keys'),
        hits: this.parseRedisInfo(stats, 'keyspace_hits'),
        misses: this.parseRedisInfo(stats, 'keyspace_misses'),
      };
    } catch (error) {
      this.logger.warn('Erreur lors de la récupération des stats Redis:', error);
      return {
        memory: 'N/A',
        keys: 0,
        hits: 0,
        misses: 0,
      };
    }
  }

  private parseRedisInfo(info: string, key: string): any {
    const match = info.match(new RegExp(`${key}:(.+)`));
    return match ? match[1] : '0';
  }

  /**
   * Nettoyage du cache
   */
  async cleanup(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.logger.log('Cache nettoyé');
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage du cache:', error);
    }
  }

  /**
   * Fermeture de la connexion
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

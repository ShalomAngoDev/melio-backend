import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { MockRedisService } from './mock-redis.service';

@Global()
@Module({
  providers: [
    {
      provide: RedisService,
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get('NODE_ENV', 'development');

        if (nodeEnv === 'development' && !configService.get('REDIS_HOST')) {
          return new MockRedisService();
        }

        // Vérification de REDIS_URL au boot
        const raw = process.env.REDIS_URL || '';
        const safe = raw.replace(/:\/\/(.*?):(.*?)@/, '://***:***@');
        console.log('[BOOT] REDIS_URL =', safe);

        // Essayer d'abord REDIS_PUBLIC_URL
        const publicRedisUrl = configService.get('REDIS_PUBLIC_URL');
        if (publicRedisUrl && !publicRedisUrl.includes('${{')) {
          console.log('🔗 Using REDIS_PUBLIC_URL:', publicRedisUrl.replace(/:[^:@]+@/, ':***@'));

          // Parser l'URL Redis publique
          const url = new URL(publicRedisUrl);
          const host = url.hostname;
          const port = parseInt(url.port) || 6379;
          const password = url.password || undefined;

          console.log('🔍 Parsed Redis Public URL:', { host, port, hasPassword: !!password });

          return new RedisService({
            host,
            port,
            password,
            maxRetriesPerRequest: null,
            retryStrategy: (times) => Math.min(times * 500, 5000),
            enableReadyCheck: false,
            connectTimeout: 15000,
            lazyConnect: true,
          });
        }

        const redisUrl = configService.get('REDIS_URL');
        if (redisUrl && !redisUrl.includes('${{')) {
          console.log('🔗 Using REDIS_URL:', redisUrl.replace(/:[^:@]+@/, ':***@'));

          // Parser l'URL Redis manuellement
          const url = new URL(redisUrl);
          const host = url.hostname;
          const port = parseInt(url.port) || 6379;
          const password = url.password || undefined;

          console.log('🔍 Parsed Redis URL:', { host, port, hasPassword: !!password });

          return new RedisService({
            host,
            port,
            password,
            maxRetriesPerRequest: null,
            retryStrategy: (times) => Math.min(times * 500, 5000),
            enableReadyCheck: false,
            connectTimeout: 15000,
            lazyConnect: true,
          });
        }

        // Fallback: utiliser les variables individuelles
        const host = configService.get('REDISHOST') || configService.get('REDIS_HOST', 'localhost');
        const port = configService.get('REDISPORT') || configService.get('REDIS_PORT', 6379);
        const password = configService.get('REDIS_PASSWORD');

        console.log('🔗 Using individual Redis vars:', { host, port, hasPassword: !!password });

        return new RedisService({
          host,
          port: parseInt(port.toString()),
          password,
          maxRetriesPerRequest: null,
          retryStrategy: (times) => Math.min(times * 500, 5000),
          enableReadyCheck: false,
          connectTimeout: 15000,
          lazyConnect: true,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}

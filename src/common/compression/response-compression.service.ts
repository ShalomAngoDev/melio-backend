import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);
const brotliCompress = promisify(zlib.brotliCompress);

/**
 * Service de compression des réponses API
 * - Compression gzip/deflate/brotli
 * - Cache des réponses compressées
 * - Optimisation automatique
 */
@Injectable()
export class ResponseCompressionService {
  private readonly logger = new Logger(ResponseCompressionService.name);
  private compressionCache = new Map<string, Buffer>();

  /**
   * Compresse une réponse selon l'encodage accepté
   */
  async compressResponse(
    data: any,
    acceptEncoding: string,
    _contentType: string = 'application/json',
  ): Promise<{ data: Buffer; encoding: string; size: number }> {
    const serializedData = JSON.stringify(data);
    const originalSize = Buffer.byteLength(serializedData, 'utf8');

    // Si la réponse est trop petite, ne pas compresser
    if (originalSize < 1024) {
      return {
        data: Buffer.from(serializedData, 'utf8'),
        encoding: 'identity',
        size: originalSize,
      };
    }

    // Vérifier le cache
    const cacheKey = `${serializedData.slice(0, 100)}_${acceptEncoding}`;
    if (this.compressionCache.has(cacheKey)) {
      const cached = this.compressionCache.get(cacheKey)!;
      return {
        data: cached,
        encoding: this.getBestEncoding(acceptEncoding),
        size: cached.length,
      };
    }

    try {
      const encodings = this.parseAcceptEncoding(acceptEncoding);
      const compressionResult = await this.chooseBestCompression(serializedData, encodings);

      // Mettre en cache si la compression est significative
      if (compressionResult.compressionRatio > 0.3) {
        this.compressionCache.set(cacheKey, compressionResult.data);

        // Limiter la taille du cache
        if (this.compressionCache.size > 1000) {
          const firstKey = this.compressionCache.keys().next().value;
          this.compressionCache.delete(firstKey);
        }
      }

      return {
        data: compressionResult.data,
        encoding: compressionResult.encoding,
        size: compressionResult.data.length,
      };
    } catch (error) {
      this.logger.warn('Erreur lors de la compression:', error);
      return {
        data: Buffer.from(serializedData, 'utf8'),
        encoding: 'identity',
        size: originalSize,
      };
    }
  }

  /**
   * Applique la compression à une réponse Express
   */
  async applyCompression(
    res: Response,
    data: any,
    acceptEncoding: string,
    contentType: string = 'application/json',
  ): Promise<void> {
    const compressionResult = await this.compressResponse(data, acceptEncoding, contentType);

    res.set({
      'Content-Type': contentType,
      'Content-Encoding': compressionResult.encoding,
      'Content-Length': compressionResult.size.toString(),
      Vary: 'Accept-Encoding',
      'Cache-Control': 'public, max-age=300', // 5 minutes
    });

    res.send(compressionResult.data);
  }

  /**
   * Parse l'en-tête Accept-Encoding
   */
  private parseAcceptEncoding(acceptEncoding: string): string[] {
    if (!acceptEncoding) return ['identity'];

    return acceptEncoding
      .split(',')
      .map((encoding) => encoding.trim().split(';')[0])
      .filter((encoding) => ['gzip', 'deflate', 'br', 'identity'].includes(encoding));
  }

  /**
   * Détermine le meilleur encodage supporté
   */
  private getBestEncoding(acceptEncoding: string): string {
    const encodings = this.parseAcceptEncoding(acceptEncoding);

    if (encodings.includes('br')) return 'br';
    if (encodings.includes('gzip')) return 'gzip';
    if (encodings.includes('deflate')) return 'deflate';

    return 'identity';
  }

  /**
   * Choisit la meilleure compression disponible
   */
  private async chooseBestCompression(
    data: string,
    encodings: string[],
  ): Promise<{ data: Buffer; encoding: string; compressionRatio: number }> {
    const originalSize = Buffer.byteLength(data, 'utf8');
    const results: Array<{ data: Buffer; encoding: string; compressionRatio: number }> = [];

    // Tester chaque encodage supporté
    for (const encoding of encodings) {
      try {
        let compressedData: Buffer;

        switch (encoding) {
          case 'br':
            compressedData = await brotliCompress(data, {
              params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 6,
                [zlib.constants.BROTLI_PARAM_SIZE_HINT]: originalSize,
              },
            });
            break;

          case 'gzip':
            compressedData = await gzip(data, { level: 6 });
            break;

          case 'deflate':
            compressedData = await deflate(data, { level: 6 });
            break;

          case 'identity':
            compressedData = Buffer.from(data, 'utf8');
            break;

          default:
            continue;
        }

        const compressionRatio = 1 - compressedData.length / originalSize;

        results.push({
          data: compressedData,
          encoding,
          compressionRatio,
        });
      } catch (error) {
        this.logger.warn(`Erreur lors de la compression ${encoding}:`, error);
      }
    }

    // Choisir la compression avec le meilleur ratio
    if (results.length === 0) {
      return {
        data: Buffer.from(data, 'utf8'),
        encoding: 'identity',
        compressionRatio: 0,
      };
    }

    return results.reduce((best, current) =>
      current.compressionRatio > best.compressionRatio ? current : best,
    );
  }

  /**
   * Optimise les données avant compression
   */
  optimizeDataForCompression(data: any): any {
    if (Array.isArray(data)) {
      // Supprimer les propriétés vides des objets dans un tableau
      return data.map((item) => this.optimizeDataForCompression(item));
    }

    if (typeof data === 'object' && data !== null) {
      const optimized: any = {};

      for (const [key, value] of Object.entries(data)) {
        // Ignorer les propriétés vides ou null
        if (value !== null && value !== undefined && value !== '') {
          optimized[key] = this.optimizeDataForCompression(value);
        }
      }

      return optimized;
    }

    return data;
  }

  /**
   * Statistiques de compression
   */
  getCompressionStats(): {
    cacheSize: number;
    cacheHitRate: number;
    averageCompressionRatio: number;
  } {
    return {
      cacheSize: this.compressionCache.size,
      cacheHitRate: 0, // À implémenter avec un compteur
      averageCompressionRatio: 0, // À implémenter avec des métriques
    };
  }

  /**
   * Nettoie le cache de compression
   */
  clearCache(): void {
    this.compressionCache.clear();
    this.logger.log('Cache de compression nettoyé');
  }
}

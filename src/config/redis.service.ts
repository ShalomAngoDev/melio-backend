import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(options: any) {
    super(options);
    
    this.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.on('close', () => {
      this.logger.log('Redis connection closed');
    });
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Redis...');
    await this.quit();
    this.logger.log('Redis disconnected');
  }

  async setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.setex(key, ttlSeconds, value);
  }

  async getAndDelete(key: string): Promise<string | null> {
    const value = await this.get(key);
    if (value) {
      await this.del(key);
    }
    return value;
  }

  async incrementWithExpiry(key: string, ttlSeconds: number): Promise<number> {
    const pipeline = this.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, ttlSeconds);
    const results = await pipeline.exec();
    return results?.[0]?.[1] as number || 0;
  }
}

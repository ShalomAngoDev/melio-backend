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
        
        const redisUrl = configService.get('REDIS_URL');
        if (redisUrl && !redisUrl.includes('${{')) {
          console.log('🔗 Using REDIS_URL:', redisUrl.replace(/:[^:@]+@/, ':***@')); // Log sans password
          
          // Parse Redis URL
          const url = new URL(redisUrl);
          const host = url.hostname;
          const port = parseInt(url.port) || 6379;
          const password = url.password || undefined;
          
          return new RedisService({
            host,
            port,
            password,
            retryDelayOnFailover: 1000,
            enableReadyCheck: false,
            maxRetriesPerRequest: 3,
            connectTimeout: 15000,
            lazyConnect: true,
          });
        }
        
        // Try to use public Redis URL from Railway
        const publicRedisUrl = configService.get('REDIS_PUBLIC_URL');
        if (publicRedisUrl) {
          console.log('🔗 Using REDIS_PUBLIC_URL:', publicRedisUrl.replace(/:[^:@]+@/, ':***@'));
          
          // Parse Redis URL
          const url = new URL(publicRedisUrl);
          const host = url.hostname;
          const port = parseInt(url.port) || 6379;
          const password = url.password || undefined;
          
          return new RedisService({
            host,
            port,
            password,
            retryDelayOnFailover: 1000,
            enableReadyCheck: false,
            maxRetriesPerRequest: 3,
            connectTimeout: 15000,
            lazyConnect: true,
          });
        }
        
        // Use Railway individual variables
        const host = configService.get('REDISHOST') || configService.get('REDIS_HOST', 'localhost');
        const port = configService.get('REDISPORT') || configService.get('REDIS_PORT', 6379);
        const password = configService.get('REDIS_PASSWORD');
        
        console.log('🔗 Using individual Redis vars:', { host, port, hasPassword: !!password });
        
        return new RedisService({
          host,
          port: parseInt(port.toString()),
          password,
          retryDelayOnFailover: 1000,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
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

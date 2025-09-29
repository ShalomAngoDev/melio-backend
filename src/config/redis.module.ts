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
        if (redisUrl) {
          console.log('🔗 Using REDIS_URL:', redisUrl.replace(/:[^:@]+@/, ':***@')); // Log sans password
          return new RedisService({
            url: redisUrl,
            retryDelayOnFailover: 1000,
            enableReadyCheck: false,
            maxRetriesPerRequest: 3,
            connectTimeout: 15000,
            lazyConnect: true,
          });
        }
        
        // Fallback to individual variables
        const host = configService.get('REDIS_HOST', 'localhost');
        const port = configService.get('REDIS_PORT', 6379);
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

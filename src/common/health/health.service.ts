import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { RedisService } from '../../config/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async checkReadiness() {
    try {
      const services: Record<string, string> = {};
      
      // Check database connection (required)
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        services.database = 'connected';
      } catch (error) {
        services.database = 'disconnected';
        throw new Error(`Database connection failed: ${error.message}`);
      }
      
      // Check Redis connection
      try {
        await this.redis.ping();
        services.redis = 'connected';
      } catch (error) {
        services.redis = 'disconnected';
        // Don't fail readiness check if Redis is down
      }
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        services,
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async checkLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}

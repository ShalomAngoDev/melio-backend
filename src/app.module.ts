import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';

// Config
import { DatabaseModule } from './config/database.module';
import { RedisModule } from './config/redis.module';

// Common
import { LoggerModule } from './common/logger/logger.module';
import { HealthModule } from './common/health/health.module';
import { StaticModule } from './common/static/static.module';
import { CacheService } from './common/cache/cache.service';
import { QueryOptimizerService } from './common/database/query-optimizer.service';
import { ResponseCompressionService } from './common/compression/response-compression.service';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { StudentsModule } from './modules/students/students.module';
import { JournalModule } from './modules/journal/journal.module';
import { ChatModule } from './modules/chat/chat.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { LibraryModule } from './modules/library/library.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';
import { TagsModule } from './modules/tags/tags.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Queue system
    BullModule.forRoot({
      redis: (() => {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl && !redisUrl.includes('${{')) {
          // Parse Redis URL for BullModule
          const url = new URL(redisUrl);
          return {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
          };
        }
        // Fallback to individual variables
        return {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        };
      })(),
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Health checks
    TerminusModule,

    // Config modules
    DatabaseModule,
    RedisModule, // Re-enabled - Redis service exists on Railway

    // Common modules
    LoggerModule,
    HealthModule,
    StaticModule,

    // Feature modules
    AuthModule,
    SchoolsModule,
    StudentsModule,
    JournalModule,
    ChatModule,
    AlertsModule,
    ReportsModule,
    StatisticsModule,
    AnalyticsModule,
    ResourcesModule,
    LibraryModule, // V2: Bibliothèque de ressources
    NotificationsModule,
    AuditModule,
    AiModule,
    AdminModule,
    TagsModule, // V2: Système de tags
    AchievementsModule, // V2: Gamification (badges et streaks)
    UploadModule, // V2: Upload de photos
  ],
  providers: [
    CacheService,
    QueryOptimizerService,
    ResponseCompressionService,
  ],
  exports: [
    CacheService,
    QueryOptimizerService,
    ResponseCompressionService,
  ],
})
export class AppModule {}

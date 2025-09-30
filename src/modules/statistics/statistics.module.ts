import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { PrismaService } from '../../config/prisma.service';

@Module({
  providers: [StatisticsService, PrismaService],
  controllers: [StatisticsController],
  exports: [StatisticsService],
})
export class StatisticsModule {}




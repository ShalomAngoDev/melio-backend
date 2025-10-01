import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.AGENT, Role.ADMIN_SCHOOL, Role.ADMIN_MELIO)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('general')
  async getGeneralStats(
    @Query('schoolId') schoolId: string,
    @Query('period') period?: 'week' | 'month' | 'year',
  ) {
    return this.statisticsService.getGeneralStats(schoolId, period);
  }

  @Get('temporal')
  async getTemporalStats(
    @Query('schoolId') schoolId: string,
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.statisticsService.getTemporalStats(schoolId, period);
  }

  @Get('classes')
  async getClassStats(@Query('schoolId') schoolId: string) {
    return this.statisticsService.getClassStats(schoolId);
  }

  @Get('trends')
  async getTrends(@Query('schoolId') schoolId: string) {
    return this.statisticsService.getTrends(schoolId);
  }
}

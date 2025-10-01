import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Récupérer tous les badges disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des badges' })
  async findAll() {
    return this.achievementsService.findAll();
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT, Role.AGENT, Role.ADMIN_MELIO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les badges débloqués par un élève' })
  async getStudentAchievements(@Param('studentId') studentId: string) {
    return this.achievementsService.getStudentAchievements(studentId);
  }

  @Get('student/:studentId/streak')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT, Role.AGENT, Role.ADMIN_MELIO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le streak d\'un élève' })
  async getStudentStreak(@Param('studentId') studentId: string) {
    return this.achievementsService.getStudentStreak(studentId);
  }

  @Get('student/:studentId/progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT, Role.AGENT, Role.ADMIN_MELIO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les progrès complets d\'un élève' })
  async getStudentProgress(@Param('studentId') studentId: string) {
    return this.achievementsService.getStudentProgress(studentId);
  }
}


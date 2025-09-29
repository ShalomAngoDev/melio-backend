import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseEnumPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportDto, ReportResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @Request() req: any,
  ): Promise<ReportResponseDto> {
    // Pour les élèves, utiliser leur schoolId et studentId
    if (req.user.role === 'ROLE_STUDENT') {
      createReportDto.schoolId = req.user.schoolId;
      // Si le signalement n'est pas anonyme, inclure l'ID de l'étudiant
      if (!createReportDto.anonymous) {
        createReportDto.studentId = req.user.id;
      }
    }

    // Validation finale
    if (!createReportDto.schoolId) {
      throw new Error('schoolId est requis');
    }

    return this.reportsService.createReport(createReportDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ROLE_AGENT, Role.ROLE_ADMIN_SCHOOL)
  async getReports(
    @Request() req: any,
    @Query('schoolId') schoolId?: string,
    @Query('status') status?: string,
  ): Promise<ReportResponseDto[]> {
    // Pour les agents, utiliser leur schoolId
    if (req.user.role === 'ROLE_AGENT') {
      schoolId = req.user.schoolId;
    }

    if (!schoolId) {
      throw new Error('schoolId est requis');
    }

    return this.reportsService.getReports(schoolId, status);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ROLE_AGENT, Role.ROLE_ADMIN_SCHOOL)
  async getReportStats(
    @Request() req: any,
    @Query('schoolId') schoolId?: string,
  ) {
    // Pour les agents, utiliser leur schoolId
    if (req.user.role === 'ROLE_AGENT') {
      schoolId = req.user.schoolId;
    }

    if (!schoolId) {
      throw new Error('schoolId est requis');
    }

    return this.reportsService.getReportStats(schoolId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ROLE_AGENT, Role.ROLE_ADMIN_SCHOOL)
  async getReportById(
    @Param('id') id: string,
    @Request() req: any,
    @Query('schoolId') schoolId?: string,
  ): Promise<ReportResponseDto> {
    // Pour les agents, utiliser leur schoolId
    if (req.user.role === 'ROLE_AGENT') {
      schoolId = req.user.schoolId;
    }

    if (!schoolId) {
      throw new Error('schoolId est requis');
    }

    return this.reportsService.getReportById(id, schoolId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ROLE_AGENT, Role.ROLE_ADMIN_SCHOOL)
  async updateReport(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Request() req: any,
    @Query('schoolId') schoolId?: string,
  ): Promise<ReportResponseDto> {
    // Pour les agents, utiliser leur schoolId
    if (req.user.role === 'ROLE_AGENT') {
      schoolId = req.user.schoolId;
    }

    if (!schoolId) {
      throw new Error('schoolId est requis');
    }

    return this.reportsService.updateReport(id, schoolId, updateReportDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ROLE_AGENT, Role.ROLE_ADMIN_SCHOOL)
  async deleteReport(
    @Param('id') id: string,
    @Request() req: any,
    @Query('schoolId') schoolId?: string,
  ): Promise<{ message: string }> {
    // Pour les agents, utiliser leur schoolId
    if (req.user.role === 'ROLE_AGENT') {
      schoolId = req.user.schoolId;
    }

    if (!schoolId) {
      throw new Error('schoolId est requis');
    }

    await this.reportsService.deleteReport(id, schoolId);
    return { message: 'Signalement supprimé avec succès' };
  }
}

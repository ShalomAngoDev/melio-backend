import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateReportDto, UpdateReportDto, ReportResponseDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(createReportDto: CreateReportDto): Promise<ReportResponseDto> {
    const { schoolId, studentId, content, urgency, anonymous } = createReportDto;

    // Vérifier que l'école existe
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('École non trouvée');
    }

    // Si ce n'est pas anonyme, vérifier que l'élève existe et appartient à cette école
    if (!anonymous && studentId) {
      const student = await this.prisma.student.findFirst({
        where: {
          id: studentId,
          schoolId: schoolId,
        },
      });

      if (!student) {
        throw new NotFoundException('Élève non trouvé dans cette école');
      }
    }

    const report = await this.prisma.report.create({
      data: {
        schoolId,
        studentId: anonymous ? null : studentId,
        content,
        urgency,
        anonymous,
      },
    });

    return this.mapToResponseDto(report);
  }

  async getReports(schoolId: string, status?: string): Promise<ReportResponseDto[]> {
    const where: any = { schoolId };

    if (status) {
      where.status = status;
    }

    const reports = await this.prisma.report.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reports.map(report => this.mapToResponseDto(report));
  }

  async getReportById(id: string, schoolId: string): Promise<ReportResponseDto> {
    const report = await this.prisma.report.findFirst({
      where: {
        id,
        schoolId,
      },
    });

    if (!report) {
      throw new NotFoundException('Signalement non trouvé');
    }

    return this.mapToResponseDto(report);
  }

  async updateReport(id: string, schoolId: string, updateReportDto: UpdateReportDto): Promise<ReportResponseDto> {
    // Vérifier que le signalement existe et appartient à cette école
    const existingReport = await this.prisma.report.findFirst({
      where: {
        id,
        schoolId,
      },
    });

    if (!existingReport) {
      throw new NotFoundException('Signalement non trouvé');
    }

    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: updateReportDto,
    });

    return this.mapToResponseDto(updatedReport);
  }

  async deleteReport(id: string, schoolId: string): Promise<void> {
    // Vérifier que le signalement existe et appartient à cette école
    const existingReport = await this.prisma.report.findFirst({
      where: {
        id,
        schoolId,
      },
    });

    if (!existingReport) {
      throw new NotFoundException('Signalement non trouvé');
    }

    await this.prisma.report.delete({
      where: { id },
    });
  }

  async getReportStats(schoolId: string) {
    const [total, nouveau, enCours, traite] = await Promise.all([
      this.prisma.report.count({ where: { schoolId } }),
      this.prisma.report.count({ where: { schoolId, status: 'NOUVEAU' } }),
      this.prisma.report.count({ where: { schoolId, status: 'EN_COURS' } }),
      this.prisma.report.count({ where: { schoolId, status: 'TRAITE' } }),
    ]);

    return {
      total,
      nouveau,
      enCours,
      traite,
    };
  }

  private mapToResponseDto(report: any): ReportResponseDto {
    return {
      id: report.id,
      schoolId: report.schoolId,
      studentId: report.studentId,
      content: report.content,
      urgency: report.urgency,
      anonymous: report.anonymous,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AlertResponseDto } from './dto/alert-response.dto';
import { CreateAlertCommentDto, AlertCommentResponseDto } from './dto/alert-comment.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère les alertes d'un établissement
   */
  async getSchoolAlerts(
    schoolId: string,
    status?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<AlertResponseDto[]> {
    const where: any = { schoolId };
    
    if (status) {
      where.status = status;
    }

    const alerts = await this.prisma.alert.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            className: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' }, // Les plus récentes en premier
        { status: 'asc' }, // En cas d'égalité de date, NOUVELLE en premier
      ],
      take: limit,
      skip: offset,
    });

    return alerts.map(alert => this.mapToResponseDto(alert));
  }

  /**
   * Récupère une alerte spécifique
   */
  async getAlert(
    alertId: string,
    schoolId: string,
  ): Promise<AlertResponseDto> {
    const alert = await this.prisma.alert.findFirst({
      where: {
        id: alertId,
        schoolId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            className: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('Alerte non trouvée');
    }

    return this.mapToResponseDto(alert);
  }

  /**
   * Met à jour le statut d'une alerte
   */
  async updateAlertStatus(
    alertId: string,
    schoolId: string,
    status: 'NOUVELLE' | 'EN_COURS' | 'TRAITEE',
  ): Promise<AlertResponseDto> {
    const alert = await this.prisma.alert.findFirst({
      where: {
        id: alertId,
        schoolId,
      },
    });

    if (!alert) {
      throw new NotFoundException('Alerte non trouvée');
    }

    const updatedAlert = await this.prisma.alert.update({
      where: { id: alertId },
      data: { status },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            className: true,
          },
        },
      },
    });

    this.logger.log(`Alert ${alertId} status updated to ${status}`);

    return this.mapToResponseDto(updatedAlert);
  }

  /**
   * Récupère les statistiques des alertes
   */
  async getAlertStats(schoolId: string): Promise<{
    total: number;
    nouvelles: number;
    enCours: number;
    traitees: number;
    parNiveau: {
      MOYEN: number;
      ELEVE: number;
      CRITIQUE: number;
    };
  }> {
    const [total, nouvelles, enCours, traitees, parNiveau] = await Promise.all([
      this.prisma.alert.count({ where: { schoolId } }),
      this.prisma.alert.count({ where: { schoolId, status: 'NOUVELLE' } }),
      this.prisma.alert.count({ where: { schoolId, status: 'EN_COURS' } }),
      this.prisma.alert.count({ where: { schoolId, status: 'TRAITEE' } }),
      this.prisma.alert.groupBy({
        by: ['riskLevel'],
        where: { schoolId },
        _count: { riskLevel: true },
      }),
    ]);

    const parNiveauResult = {
      MOYEN: 0,
      ELEVE: 0,
      CRITIQUE: 0,
    };

    parNiveau.forEach(item => {
      if (item.riskLevel in parNiveauResult) {
        parNiveauResult[item.riskLevel] = item._count.riskLevel;
      }
    });

    return {
      total,
      nouvelles,
      enCours,
      traitees,
      parNiveau: parNiveauResult,
    };
  }

  /**
   * Mappe l'entité Prisma vers le DTO de réponse
   */
  private mapToResponseDto(alert: any): AlertResponseDto {
    return {
      id: alert.id,
      schoolId: alert.schoolId,
      student: {
        id: alert.student.id,
        firstName: alert.student.firstName,
        lastName: alert.student.lastName,
        className: alert.student.className,
      },
      sourceId: alert.sourceId,
      sourceType: alert.sourceType,
      createdAt: alert.createdAt,
      riskLevel: alert.riskLevel,
      riskScore: alert.riskScore,
      childMood: alert.childMood,
      aiSummary: alert.aiSummary,
      aiAdvice: alert.aiAdvice,
      status: alert.status,
    };
  }

  /**
   * Met à jour le statut d'une alerte avec un commentaire obligatoire
   */
  async updateAlertStatusWithComment(
    alertId: string,
    schoolId: string,
    agentId: string,
    agentName: string,
    createCommentDto: CreateAlertCommentDto,
  ): Promise<AlertResponseDto> {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.schoolId !== schoolId) {
      throw new NotFoundException(`Alert with ID ${alertId} not found or not in your school.`);
    }

    const oldStatus = alert.status;

    // Mettre à jour le statut de l'alerte
    const updatedAlert = await this.prisma.alert.update({
      where: { id: alertId },
      data: { status: createCommentDto.newStatus },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, className: true },
        },
      },
    });

    // Créer le commentaire
    await this.prisma.alertComment.create({
      data: {
        alertId,
        agentId,
        agentName,
        oldStatus,
        newStatus: createCommentDto.newStatus,
        comment: createCommentDto.comment,
      },
    });

    this.logger.log(`Alert ${alertId} status updated from ${oldStatus} to ${createCommentDto.newStatus} by agent ${agentName}`);

    return this.mapToResponseDto(updatedAlert);
  }

  /**
   * Récupère les commentaires d'une alerte
   */
  async getAlertComments(alertId: string, schoolId: string): Promise<AlertCommentResponseDto[]> {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.schoolId !== schoolId) {
      throw new NotFoundException(`Alert with ID ${alertId} not found or not in your school.`);
    }

    const comments = await this.prisma.alertComment.findMany({
      where: { alertId },
      orderBy: { createdAt: 'desc' },
    });

    return comments.map(comment => ({
      id: comment.id,
      alertId: comment.alertId,
      agentId: comment.agentId,
      agentName: comment.agentName,
      oldStatus: comment.oldStatus,
      newStatus: comment.newStatus,
      comment: comment.comment,
      createdAt: comment.createdAt,
    }));
  }
}

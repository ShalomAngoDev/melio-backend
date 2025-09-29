import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalStats(period?: 'week' | 'month' | 'year') {
    try {
      // Construire la condition where pour les dates
      let dateCondition = {};
      if (period) {
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        }
        
        dateCondition = { createdAt: { gte: startDate } };
      }

      // Compter les écoles (pas de filtre de date)
      const totalSchools = await this.prisma.school.count();
      const activeSchools = await this.prisma.school.count({
        where: { status: 'ACTIVE' }
      });

      // Compter les étudiants (pas de filtre de date)
      const totalStudents = await this.prisma.student.count();

      // Compter les agents (pas de filtre de date)
      const totalAgents = await this.prisma.agentUser.count();

      // Compter les alertes avec filtre de date (avec gestion d'erreur)
      let totalAlerts = 0;
      let criticalAlerts = 0;
      let resolvedAlerts = 0;
      let alertsByRiskLevel = { CRITIQUE: 0, ELEVE: 0, MOYEN: 0, FAIBLE: 0 };

      // Vérifier d'abord si la table existe
      try {
        // Test simple pour vérifier si la table existe
        await this.prisma.$queryRaw`SELECT 1 FROM alerts LIMIT 1`;
        
        totalAlerts = await this.prisma.alert.count({
          where: dateCondition
        });
        criticalAlerts = await this.prisma.alert.count({
          where: { ...dateCondition, riskLevel: 'CRITIQUE' }
        });
        resolvedAlerts = await this.prisma.alert.count({
          where: { ...dateCondition, status: 'TRAITEE' }
        });

        // Récupérer les alertes pour calculer la répartition par niveau de risque
        const alerts = await this.prisma.alert.findMany({
          where: dateCondition,
          select: { riskLevel: true }
        });

        // Calculer la répartition par niveau de risque des alertes
        alertsByRiskLevel = alerts.reduce((acc, alert) => {
          acc[alert.riskLevel] = (acc[alert.riskLevel] || 0) + 1;
          return acc;
        }, { CRITIQUE: 0, ELEVE: 0, MOYEN: 0, FAIBLE: 0 });
      } catch (alertError) {
        console.log('Tables alertes non disponibles:', alertError.message);
      }

      // Compter les signalements avec filtre de date (avec gestion d'erreur)
      let totalReports = 0;
      let newReports = 0;
      let resolvedReports = 0;
      let reportsByUrgency = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

      try {
        // Test simple pour vérifier si la table existe
        await this.prisma.$queryRaw`SELECT 1 FROM reports LIMIT 1`;
        
        totalReports = await this.prisma.report.count({
          where: dateCondition
        });
        newReports = await this.prisma.report.count({
          where: { ...dateCondition, status: 'NOUVEAU' }
        });
        resolvedReports = await this.prisma.report.count({
          where: { ...dateCondition, status: 'TRAITE' }
        });

        // Récupérer les signalements pour calculer la répartition par urgence
        const reports = await this.prisma.report.findMany({
          where: dateCondition,
          select: { urgency: true }
        });

        // Calculer la répartition par urgence des signalements
        reportsByUrgency = reports.reduce((acc, report) => {
          acc[report.urgency] = (acc[report.urgency] || 0) + 1;
          return acc;
        }, { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 });
      } catch (reportError) {
        console.log('Tables signalements non disponibles:', reportError.message);
      }

      return {
        totalSchools,
        totalStudents,
        totalAgents,
        totalAlerts,
        totalReports,
        activeSchools,
        criticalAlerts,
        resolvedAlerts,
        newReports,
        resolvedReports,
        alertsByRiskLevel,
        reportsByUrgency,
      };
    } catch (error) {
      console.error('Erreur dans getGlobalStats:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalSchools: 0,
        totalStudents: 0,
        totalAgents: 0,
        totalAlerts: 0,
        totalReports: 0,
        activeSchools: 0,
        criticalAlerts: 0,
        resolvedAlerts: 0,
        newReports: 0,
        resolvedReports: 0,
        alertsByRiskLevel: { CRITIQUE: 0, ELEVE: 0, MOYEN: 0, FAIBLE: 0 },
        reportsByUrgency: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      };
    }
  }

  async getGlobalTemporalStats(period: 'week' | 'month' | 'year' = 'month') {
    try {
      const now = new Date();
      let startDate: Date;
      let maxPoints: number;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          maxPoints = 7; // 7 jours
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          maxPoints = 10; // 10 points sur 30 jours (tous les 3 jours)
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          maxPoints = 12; // 12 mois
          break;
      }

      // Générer les intervalles de dates avec un nombre limité de points
      const intervals = [];
      const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      const stepDays = Math.max(1, Math.floor(totalDays / maxPoints));

      for (let i = 0; i < maxPoints; i++) {
        const intervalStart = new Date(startDate.getTime() + i * stepDays * 24 * 60 * 60 * 1000);
        const intervalEnd = new Date(intervalStart.getTime() + stepDays * 24 * 60 * 60 * 1000);
        
        // S'assurer que le dernier intervalle va jusqu'à maintenant
        if (i === maxPoints - 1) {
          intervalEnd.setTime(now.getTime());
        }
        
        intervals.push({
          start: intervalStart,
          end: intervalEnd,
          label: this.formatDateLabel(intervalStart, period)
        });
      }

      // Charger les alertes pour chaque intervalle (avec gestion d'erreur)
      const alertsData = [];
      try {
        // Vérifier d'abord si la table existe
        await this.prisma.$queryRaw`SELECT 1 FROM alerts LIMIT 1`;
        
          for (const interval of intervals) {
            const alerts = await this.prisma.alert.findMany({
              where: {
                createdAt: {
                  gte: interval.start,
                  lt: interval.end
                }
              }
            });

            const critical = alerts.filter(a => a.riskLevel === 'CRITIQUE').length;
            const high = alerts.filter(a => a.riskLevel === 'ELEVE').length;
            const medium = alerts.filter(a => a.riskLevel === 'MOYEN').length;
            const low = alerts.filter(a => a.riskLevel === 'FAIBLE').length;

            alertsData.push({
              label: interval.label,
              critical,
              high,
              medium,
              low
            });
          }
        } catch (alertError) {
          console.log('Tables alertes non disponibles pour les statistiques temporelles:', alertError.message);
          // Créer des données vides pour chaque intervalle
          for (const interval of intervals) {
            alertsData.push({
              label: interval.label,
              critical: 0,
              high: 0,
              medium: 0,
              low: 0
            });
          }
        }

        // Charger les signalements pour chaque intervalle (avec gestion d'erreur)
        const reportsData = [];
        try {
          // Vérifier d'abord si la table existe
          await this.prisma.$queryRaw`SELECT 1 FROM reports LIMIT 1`;
          
          for (const interval of intervals) {
            const reports = await this.prisma.report.findMany({
              where: {
                createdAt: {
                  gte: interval.start,
                  lt: interval.end
                }
              }
            });

            const critical = reports.filter(r => r.urgency === 'CRITICAL').length;
            const high = reports.filter(r => r.urgency === 'HIGH').length;
            const medium = reports.filter(r => r.urgency === 'MEDIUM').length;
            const low = reports.filter(r => r.urgency === 'LOW').length;

            reportsData.push({
              label: interval.label,
              critical,
              high,
              medium,
              low
            });
          }
        } catch (reportError) {
          console.log('Tables signalements non disponibles pour les statistiques temporelles:', reportError.message);
          // Créer des données vides pour chaque intervalle
          for (const interval of intervals) {
            reportsData.push({
              label: interval.label,
              critical: 0,
              high: 0,
              medium: 0,
              low: 0
            });
          }
        }

      return {
        alerts: alertsData,
        reports: reportsData
      };
    } catch (error) {
      console.error('Erreur dans getGlobalTemporalStats:', error);
      // Retourner des données vides en cas d'erreur
      return {
        alerts: [],
        reports: []
      };
    }
  }

  private formatDateLabel(date: Date, period: 'week' | 'month' | 'year'): string {
    if (period === 'week') {
      return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    } else if (period === 'month') {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    }
  }

  async getAllSchools() {
    const schools = await this.prisma.school.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        address1: true,
        address2: true,
        postalCode: true,
        city: true,
        country: true,
        level: true,
        uaiCode: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' }
    });

    return schools;
  }

  async getGlobalAlerts(status?: string, limit: number = 50, offset: number = 0) {
    const where: any = {};
    
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
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { status: 'asc' },
      ],
      take: limit,
      skip: offset,
    });

    return alerts;
  }

  async getGlobalReports(status?: string, limit: number = 50, offset: number = 0) {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const reports = await this.prisma.report.findMany({
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
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { status: 'asc' },
      ],
      take: limit,
      skip: offset,
    });

    return reports;
  }

  async getSchoolStats(schoolId: string) {
    // Vérifier que l'école existe
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true, code: true }
    });

    if (!school) {
      throw new Error('École non trouvée');
    }

    // Compter les étudiants
    const totalStudents = await this.prisma.student.count({
      where: { schoolId }
    });

    // Compter les alertes
    const totalAlerts = await this.prisma.alert.count({
      where: { schoolId }
    });

    const alertsByStatus = await this.prisma.alert.groupBy({
      by: ['status'],
      where: { schoolId },
      _count: { status: true }
    });

    const alertsByRiskLevel = await this.prisma.alert.groupBy({
      by: ['riskLevel'],
      where: { schoolId },
      _count: { riskLevel: true }
    });

    // Compter les signalements
    const totalReports = await this.prisma.report.count({
      where: { schoolId }
    });

    const reportsByStatus = await this.prisma.report.groupBy({
      by: ['status'],
      where: { schoolId },
      _count: { status: true }
    });

    const reportsByUrgency = await this.prisma.report.groupBy({
      by: ['urgency'],
      where: { schoolId },
      _count: { urgency: true }
    });

    return {
      schoolId,
      schoolName: school.name,
      schoolCode: school.code,
      totalStudents,
      totalAlerts,
      totalReports,
      alertsByStatus: alertsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      reportsByStatus: reportsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      alertsByRiskLevel: alertsByRiskLevel.reduce((acc, item) => {
        acc[item.riskLevel] = item._count.riskLevel;
        return acc;
      }, {} as Record<string, number>),
      reportsByUrgency: reportsByUrgency.reduce((acc, item) => {
        acc[item.urgency] = item._count.urgency;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async updateSchool(schoolId: string, updateData: any) {
    // Vérifier que l'école existe
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      throw new NotFoundException('École non trouvée');
    }

    // Mettre à jour l'école
    const updatedSchool = await this.prisma.school.update({
      where: { id: schoolId },
      data: {
        name: updateData.name,
        address1: updateData.address1,
        address2: updateData.address2,
        postalCode: updateData.postalCode,
        city: updateData.city,
        country: updateData.country,
        level: updateData.level,
        uaiCode: updateData.uaiCode,
        contactName: updateData.contactName,
        contactEmail: updateData.contactEmail,
        contactPhone: updateData.contactPhone,
        status: updateData.status,
        settings: updateData.settings ? JSON.stringify(updateData.settings) : school.settings,
        updatedAt: new Date(),
      }
    });

    return updatedSchool;
  }

  async deleteSchool(schoolId: string) {
    // Vérifier que l'école existe
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      throw new NotFoundException('École non trouvée');
    }

    // Supprimer l'école (cascade supprimera les données liées)
    await this.prisma.school.delete({
      where: { id: schoolId }
    });

    return { message: 'École supprimée avec succès' };
  }

  async addAgentToSchool(schoolId: string, agentData: { email: string; password: string }) {
    // Vérifier que l'école existe
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      throw new NotFoundException('École non trouvée');
    }

    // Vérifier que l'email n'est pas déjà utilisé
    const existingAgent = await this.prisma.agentUser.findUnique({
      where: { email: agentData.email }
    });

    if (existingAgent) {
      throw new BadRequestException('Un agent avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(agentData.password, 12);

    // Créer l'agent
    const agent = await this.prisma.agentUser.create({
      data: {
        email: agentData.email,
        password: hashedPassword,
        schoolId: schoolId,
        role: 'ROLE_AGENT'
      }
    });

    return {
      id: agent.id,
      email: agent.email,
      schoolId: agent.schoolId,
      role: agent.role,
      createdAt: agent.createdAt
    };
  }

  async getSchoolAgents(schoolId: string) {
    // Vérifier que l'école existe
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      throw new NotFoundException('École non trouvée');
    }

    // Récupérer les agents de l'école
    const agents = await this.prisma.agentUser.findMany({
      where: { schoolId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return agents;
  }

  async removeAgentFromSchool(schoolId: string, agentId: string) {
    // Vérifier que l'agent existe et appartient à l'école
    const agent = await this.prisma.agentUser.findFirst({
      where: {
        id: agentId,
        schoolId: schoolId
      }
    });

    if (!agent) {
      throw new NotFoundException('Agent non trouvé dans cette école');
    }

    // Supprimer l'agent
    await this.prisma.agentUser.delete({
      where: { id: agentId }
    });

    return { message: 'Agent supprimé avec succès' };
  }
}

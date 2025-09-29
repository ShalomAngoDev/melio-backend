import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getGeneralStats(schoolId: string, period?: 'week' | 'month' | 'year') {
    // Construire la condition where
    let whereCondition = schoolId ? { schoolId } : {};
    
    // Ajouter le filtre de date si une période est spécifiée
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
      
      whereCondition = { ...whereCondition, createdAt: { gte: startDate } } as any;
    }

    // Statistiques des alertes
    const alerts = await this.prisma.alert.findMany({
      where: whereCondition,
    });

    // Statistiques des signalements
    const reports = await this.prisma.report.findMany({
      where: whereCondition,
    });

    // Statistiques des étudiants (pas de filtre de date pour les étudiants)
    const students = await this.prisma.student.findMany({
      where: schoolId ? { schoolId } : {},
    });

    // Regroupement par statut
    const alertsByStatus = alerts.reduce((acc, alert) => {
      acc[alert.status] = (acc[alert.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const reportsByStatus = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Regroupement par niveau de risque
    const alertsByRiskLevel = alerts.reduce((acc, alert) => {
      acc[alert.riskLevel] = (acc[alert.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const reportsByUrgency = reports.reduce((acc, report) => {
      acc[report.urgency] = (acc[report.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAlerts: alerts.length,
      totalReports: reports.length,
      totalStudents: students.length,
      alertsByStatus,
      reportsByStatus,
      alertsByRiskLevel,
      reportsByUrgency,
    };
  }

  async getTemporalStats(schoolId: string, period: 'week' | 'month' | 'year') {
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

    // Construire la condition where
    const whereCondition = schoolId ? { schoolId, createdAt: { gte: startDate } } : { createdAt: { gte: startDate } };

    // Alertes temporelles
    const alerts = await this.prisma.alert.findMany({
      where: whereCondition,
    });

    // Signalements temporels
    const reports = await this.prisma.report.findMany({
      where: whereCondition,
    });

    // Générer les données selon la période
    const alertsData = this.generateTemporalData(alerts, period, 'riskLevel');
    const reportsData = this.generateTemporalData(reports, period, 'urgency');

    return {
      alerts: alertsData,
      reports: reportsData,
    };
  }

  async getClassStats(schoolId: string) {
    // Construire la condition where
    const whereCondition = schoolId ? { schoolId } : {};

    // Récupérer les étudiants
    const students = await this.prisma.student.findMany({
      where: whereCondition,
    });

    // Récupérer les alertes pour ces étudiants
    const studentIds = students.map(s => s.id);
    const alerts = await this.prisma.alert.findMany({
      where: {
        ...whereCondition,
        studentId: { in: studentIds },
      },
    });

    // Récupérer les signalements pour ces étudiants
    const reports = await this.prisma.report.findMany({
      where: {
        ...whereCondition,
        studentId: { in: studentIds },
      },
    });

    // Regrouper par classe
    const classStats = students.reduce((acc, student) => {
      const className = student.className;
      if (!acc[className]) {
        acc[className] = {
          className,
          studentCount: 0,
          alertCount: 0,
          reportCount: 0,
          riskLevels: [] as string[],
        };
      }
      acc[className].studentCount++;
      
      // Compter les alertes pour cet étudiant
      const studentAlerts = alerts.filter(a => a.studentId === student.id);
      acc[className].alertCount += studentAlerts.length;
      acc[className].riskLevels.push(...studentAlerts.map(a => a.riskLevel));
      
      // Compter les signalements pour cet étudiant
      const studentReports = reports.filter(r => r.studentId === student.id);
      acc[className].reportCount += studentReports.length;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculer le niveau de risque par classe
    return Object.values(classStats).map((classData: any) => {
      const riskLevels = classData.riskLevels;
      let riskLevel = 'LOW';
      
      if (riskLevels.includes('CRITIQUE')) {
        riskLevel = 'CRITICAL';
      } else if (riskLevels.includes('ELEVE')) {
        riskLevel = 'HIGH';
      } else if (riskLevels.includes('MOYEN')) {
        riskLevel = 'MEDIUM';
      }

      return {
        className: classData.className,
        studentCount: classData.studentCount,
        alertCount: classData.alertCount,
        reportCount: classData.reportCount,
        riskLevel,
      };
    });
  }

  async getTrends(schoolId: string) {
    const now = new Date();
    // Période actuelle : 15 derniers jours
    const currentPeriod = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    // Période précédente : 15 jours avant (30-15 jours)
    const previousPeriod = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Construire la condition where
    const whereCondition = schoolId ? { schoolId } : {};

    // Alertes - période précédente (30-15 jours)
    const previousAlerts = await this.prisma.alert.count({
      where: {
        ...whereCondition,
        createdAt: { gte: previousPeriod, lt: currentPeriod },
      },
    });

    // Alertes - période actuelle (15 derniers jours)
    const currentAlerts = await this.prisma.alert.count({
      where: {
        ...whereCondition,
        createdAt: { gte: currentPeriod },
      },
    });

    // Signalements - période précédente (30-15 jours)
    const previousReports = await this.prisma.report.count({
      where: {
        ...whereCondition,
        createdAt: { gte: previousPeriod, lt: currentPeriod },
      },
    });

    // Signalements - période actuelle (15 derniers jours)
    const currentReports = await this.prisma.report.count({
      where: {
        ...whereCondition,
        createdAt: { gte: currentPeriod },
      },
    });

    // Calculer les tendances avec gestion robuste des cas sans données
    let alertsPercentage = 0;
    let reportsPercentage = 0;
    
    // Pour les alertes
    if (previousAlerts > 0) {
      alertsPercentage = ((currentAlerts - previousAlerts) / previousAlerts) * 100;
      // Limiter les pourcentages extrêmes
      alertsPercentage = Math.max(-100, Math.min(100, alertsPercentage));
    } else if (currentAlerts > 0) {
      // Si pas de données précédentes mais des données actuelles, considérer comme stable
      alertsPercentage = 0;
    } else {
      // Aucune donnée, stable
      alertsPercentage = 0;
    }
    
    // Pour les signalements
    if (previousReports > 0) {
      reportsPercentage = ((currentReports - previousReports) / previousReports) * 100;
      // Limiter les pourcentages extrêmes
      reportsPercentage = Math.max(-100, Math.min(100, reportsPercentage));
    } else if (currentReports > 0) {
      // Si pas de données précédentes mais des données actuelles, considérer comme stable
      reportsPercentage = 0;
    } else {
      // Aucune donnée, stable
      reportsPercentage = 0;
    }

    return {
      alertsTrend: this.getTrendDirection(alertsPercentage),
      reportsTrend: this.getTrendDirection(reportsPercentage),
      alertsPercentage: Math.abs(alertsPercentage),
      reportsPercentage: Math.abs(reportsPercentage),
    };
  }

  private generateTemporalData(data: any[], period: string, levelField: string) {
    const now = new Date();
    let intervals: Array<{ label: string; start: Date; end: Date }> = [];

    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        intervals.push({
          label: dayName,
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        });
      }
    } else if (period === 'month') {
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        intervals.push({
          label: `Sem ${4 - i}`,
          start: weekStart,
          end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
        });
      }
    } else if (period === 'year') {
      for (let i = 3; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'short' });
        intervals.push({
          label: monthName,
          start: monthStart,
          end: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1),
        });
      }
    }

    return intervals.map(interval => {
      const intervalData = data.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= interval.start && itemDate < interval.end;
      });

      return {
        label: interval.label,
        critical: intervalData.filter(item => item[levelField] === 'CRITIQUE' || item[levelField] === 'CRITICAL').length,
        high: intervalData.filter(item => item[levelField] === 'ELEVE' || item[levelField] === 'HIGH').length,
        medium: intervalData.filter(item => item[levelField] === 'MOYEN' || item[levelField] === 'MEDIUM').length,
        low: intervalData.filter(item => item[levelField] === 'FAIBLE' || item[levelField] === 'LOW').length,
      };
    });
  }

  private getTrendDirection(percentage: number): 'up' | 'down' | 'stable' {
    // Seuil plus élevé pour éviter les tendances trop sensibles
    if (Math.abs(percentage) < 10) return 'stable';
    return percentage > 0 ? 'up' : 'down';
  }
}

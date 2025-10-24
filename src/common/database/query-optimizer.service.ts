import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

/**
 * Service d'optimisation des requêtes de base de données
 * - Index automatiques
 * - Requêtes optimisées
 * - Monitoring des performances
 */
@Injectable()
export class QueryOptimizerService {
  private readonly logger = new Logger(QueryOptimizerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crée les index optimaux pour les performances
   */
  async createOptimalIndexes(): Promise<void> {
    // Vérifier d'abord si les tables existent
    const tablesToCheck = ['alerts', 'reports', 'journal_entries', 'agent_schools', 'students', 'chat_messages'];
    const existingTables = new Set<string>();

    for (const table of tablesToCheck) {
      try {
        await this.prisma.$executeRawUnsafe(`SELECT 1 FROM ${table} LIMIT 1`);
        existingTables.add(table);
        this.logger.log(`✅ Table ${table} exists`);
      } catch (error) {
        this.logger.warn(`⚠️ Table ${table} does not exist yet, skipping related indexes`);
      }
    }

    const indexes = [
      // Index pour les alertes (noms de colonnes corrects selon le schéma)
      ...(existingTables.has('alerts') ? [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_school_status ON alerts("schoolId", status)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_created_at ON alerts("createdAt" DESC)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_risk_level ON alerts("riskLevel")',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_student_id ON alerts("studentId")',
      ] : []),

      // Index pour les signalements
      ...(existingTables.has('reports') ? [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_school_status ON reports("schoolId", status)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_created_at ON reports("createdAt" DESC)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_urgency ON reports(urgency)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_student_id ON reports("studentId")',
      ] : []),

      // Index pour les élèves
      ...(existingTables.has('students') ? [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_school_class ON students("schoolId", "className")',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_unique_id ON students("uniqueId")',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_sex ON students(sex)',
      ] : []),

      // Index pour les messages de chat
      ...(existingTables.has('chat_messages') ? [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_student_created ON chat_messages("studentId", "createdAt" DESC)',
      ] : []),

      // Index pour les entrées de journal
      ...(existingTables.has('journal_entries') ? [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_student_created ON journal_entries("studentId", "createdAt" DESC)',
      ] : []),

      // Index pour les statistiques
      ...(existingTables.has('agent_schools') ? [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_schools_agent_id ON agent_schools(agent_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_schools_school_id ON agent_schools(school_id)',
      ] : []),

      // Index composites pour les requêtes complexes
      ...(existingTables.has('alerts') ? [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_school_status_created ON alerts("schoolId", status, "createdAt" DESC)',
      ] : []),
      ...(existingTables.has('reports') ? [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_school_status_created ON reports("schoolId", status, "createdAt" DESC)',
      ] : []),
      ...(existingTables.has('students') ? [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_school_sex_class ON students("schoolId", sex, "className")',
      ] : []),
    ];

    for (const indexQuery of indexes) {
      try {
        await this.prisma.$executeRawUnsafe(indexQuery);
        this.logger.log(`✅ Index créé: ${indexQuery.split('idx_')[1]?.split(' ')[0]}`);
      } catch (error) {
        this.logger.warn(`⚠️ Erreur lors de la création de l'index: ${error.message}`);
      }
    }
  }

  /**
   * Optimise une requête de pagination
   */
  async optimizedPaginatedQuery<T>(
    model: any,
    options: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      limit: number;
      offset: number;
    },
  ): Promise<{ data: T[]; total: number }> {
    const startTime = Date.now();

    // Exécuter les requêtes en parallèle
    const [data, total] = await Promise.all([
      model.findMany({
        ...options,
        skip: options.offset,
        take: options.limit,
      }),
      model.count({ where: options.where }),
    ]);

    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      this.logger.warn(`⚠️ Requête lente détectée: ${duration}ms`);
    }

    return { data, total };
  }

  /**
   * Requête optimisée pour les alertes d'une école
   */
  async getSchoolAlertsOptimized(
    schoolId: string,
    status?: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const where = {
      schoolId,
      ...(status && { status }),
    };

    return this.optimizedPaginatedQuery(this.prisma.alert, {
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            uniqueId: true,
            className: true,
          },
        },
      },
      limit,
      offset,
    });
  }

  /**
   * Requête optimisée pour les signalements d'une école
   */
  async getSchoolReportsOptimized(
    schoolId: string,
    status?: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const where = {
      schoolId,
      ...(status && { status }),
    };

    return this.optimizedPaginatedQuery(this.prisma.report, {
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            uniqueId: true,
            className: true,
          },
        },
      },
      limit,
      offset,
    });
  }

  /**
   * Requête optimisée pour les élèves d'une école
   */
  async getSchoolStudentsOptimized(
    schoolId: string,
    className?: string,
    search?: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const where = {
      schoolId,
      ...(className && { className }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { uniqueId: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.optimizedPaginatedQuery(this.prisma.student, {
      where,
      orderBy: [
        { className: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        uniqueId: true,
        className: true,
        sex: true,
        birthdate: true,
        parentName: true,
        parentPhone: true,
        parentEmail: true,
        createdAt: true,
        updatedAt: true,
      },
      limit,
      offset,
    });
  }

  /**
   * Statistiques optimisées pour une école
   */
  async getSchoolStatsOptimized(schoolId: string) {
    const startTime = Date.now();

    // Requêtes parallèles pour les statistiques
    const [
      totalStudents,
      totalAlerts,
      totalReports,
      alertsByStatus,
      reportsByStatus,
      alertsByRiskLevel,
      reportsByUrgency,
      studentsByClass,
      studentsBySex,
    ] = await Promise.all([
      this.prisma.student.count({ where: { schoolId } }),
      this.prisma.alert.count({ where: { schoolId } }),
      this.prisma.report.count({ where: { schoolId } }),
      
      this.prisma.alert.groupBy({
        by: ['status'],
        where: { schoolId },
        _count: { status: true },
      }),
      
      this.prisma.report.groupBy({
        by: ['status'],
        where: { schoolId },
        _count: { status: true },
      }),
      
      this.prisma.alert.groupBy({
        by: ['riskLevel'],
        where: { schoolId },
        _count: { riskLevel: true },
      }),
      
      this.prisma.report.groupBy({
        by: ['urgency'],
        where: { schoolId },
        _count: { urgency: true },
      }),
      
      this.prisma.student.groupBy({
        by: ['className'],
        where: { schoolId },
        _count: { className: true },
      }),
      
      this.prisma.student.groupBy({
        by: ['sex'],
        where: { schoolId },
        _count: { sex: true },
      }),
    ]);

    const duration = Date.now() - startTime;
    
    if (duration > 2000) {
      this.logger.warn(`⚠️ Statistiques lentes: ${duration}ms`);
    }

    // Transformer les données
    const alertsByStatusMap = alertsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const reportsByStatusMap = reportsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const alertsByRiskLevelMap = alertsByRiskLevel.reduce((acc, item) => {
      acc[item.riskLevel] = item._count.riskLevel;
      return acc;
    }, {} as Record<string, number>);

    const reportsByUrgencyMap = reportsByUrgency.reduce((acc, item) => {
      acc[item.urgency] = item._count.urgency;
      return acc;
    }, {} as Record<string, number>);

    const studentsByClassMap = studentsByClass.reduce((acc, item) => {
      acc[item.className] = item._count.className;
      return acc;
    }, {} as Record<string, number>);

    const studentsBySexMap = studentsBySex.reduce((acc, item) => {
      acc[item.sex] = item._count.sex;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStudents,
      totalAlerts,
      totalReports,
      alertsByStatus: alertsByStatusMap,
      reportsByStatus: reportsByStatusMap,
      alertsByRiskLevel: alertsByRiskLevelMap,
      reportsByUrgency: reportsByUrgencyMap,
      studentsByClass: studentsByClassMap,
      studentsBySex: studentsBySexMap,
      queryTime: duration,
    };
  }

  /**
   * Analyse les performances des requêtes
   */
  async analyzeQueryPerformance(): Promise<void> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY total_time DESC 
        LIMIT 10
      `;

      this.logger.log('🔍 Top 10 des requêtes les plus lentes:');
      console.table(result);
    } catch (error) {
      this.logger.warn('Impossible d\'analyser les performances (pg_stat_statements non disponible)');
    }
  }
}

import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { JournalEntryResponseDto } from './dto/journal-entry-response.dto';
import { AIAnalysisService } from './ai-analysis.service';
import { ChatService } from '../chat/chat.service';
import { AchievementsService } from '../achievements/achievements.service';

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiAnalysis: AIAnalysisService,
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => AchievementsService))
    private readonly achievementsService: AchievementsService,
  ) {}

  /**
   * Crée une nouvelle entrée de journal pour un élève
   */
  async createJournalEntry(
    studentId: string,
    schoolId: string,
    createJournalEntryDto: CreateJournalEntryDto,
  ): Promise<JournalEntryResponseDto> {
    // Vérifier que l'élève existe et appartient à l'école
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: schoolId,
      },
    });

    if (!student) {
      throw new NotFoundException('Élève non trouvé');
    }

    // Créer l'entrée de journal
    const journalEntry = await this.prisma.journalEntry.create({
      data: {
        studentId,
        mood: createJournalEntryDto.mood,
        contentText: createJournalEntryDto.contentText,
      },
    });

    this.logger.log(`Journal entry created for student ${studentId}: ${journalEntry.id}`);

    // Récupérer les données de récurrence (mémoire 14 jours)
    const recurrenceData = await this.getRecurrenceData(studentId);

    // Analyser avec l'IA
    const aiResult = this.aiAnalysis.analyzeRisk(
      createJournalEntryDto.contentText,
      createJournalEntryDto.mood,
      recurrenceData,
    );

    // Mettre à jour l'entrée avec les résultats de l'IA
    const updatedEntry = await this.prisma.journalEntry.update({
      where: { id: journalEntry.id },
      data: {
        aiRiskScore: aiResult.riskScore,
        aiRiskLevel: aiResult.riskLevel,
        aiSummary: aiResult.summary,
        aiAdvice: aiResult.advice,
        processedAt: new Date(),
      },
    });

    this.logger.log(`AI analysis completed for entry ${journalEntry.id}: ${aiResult.riskLevel}`);

    // Si le risque est moyen, élevé ou critique, créer une alerte
    if (['MOYEN', 'ELEVE', 'CRITIQUE'].includes(aiResult.riskLevel)) {
      await this.createAlert(studentId, schoolId, journalEntry.id, aiResult);
      this.logger.log(
        `Alert created for student ${studentId} with risk level: ${aiResult.riskLevel}`,
      );
    }

    // Créer un message empathique du chatbot pour tous les niveaux de risque
    await this.chatService.createEmpatheticMessage(
      studentId,
      aiResult.riskLevel as 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE',
      aiResult.dominantCategory,
      journalEntry.id,
    );

    this.logger.log(
      `Empathetic message scheduled for student ${studentId} with risk level: ${aiResult.riskLevel}`,
    );

    // V2: Gamification - Mettre à jour le streak et vérifier les badges
    try {
      await this.achievementsService.updateStreak(studentId);
      await this.achievementsService.checkWritingAchievements(studentId);
      await this.achievementsService.checkRainbowAchievement(studentId);
      this.logger.log(`Gamification updated for student ${studentId}`);
    } catch (error) {
      this.logger.error(`Erreur gamification pour ${studentId}:`, error);
      // Ne pas faire échouer la création si la gamification échoue
    }

    return this.mapToResponseDto(updatedEntry);
  }

  /**
   * Récupère les entrées de journal d'un élève
   */
  async getStudentJournalEntries(
    studentId: string,
    schoolId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<JournalEntryResponseDto[]> {
    // Vérifier que l'élève existe et appartient à l'école
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: schoolId,
      },
    });

    if (!student) {
      throw new NotFoundException('Élève non trouvé');
    }

    const entries = await this.prisma.journalEntry.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return entries.map((entry) => this.mapToResponseDto(entry));
  }

  /**
   * Récupère une entrée de journal spécifique
   */
  async getJournalEntry(
    entryId: string,
    studentId: string,
    schoolId: string,
  ): Promise<JournalEntryResponseDto> {
    const entry = await this.prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        studentId,
        student: {
          schoolId,
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Entrée de journal non trouvée');
    }

    return this.mapToResponseDto(entry);
  }

  /**
   * Met à jour une entrée de journal
   */
  async updateJournalEntry(
    entryId: string,
    studentId: string,
    schoolId: string,
    updateJournalEntryDto: CreateJournalEntryDto,
  ): Promise<JournalEntryResponseDto> {
    // Vérifier que l'entrée existe et appartient à l'élève
    const existingEntry = await this.prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        studentId,
        student: {
          schoolId,
        },
      },
    });

    if (!existingEntry) {
      throw new NotFoundException('Entrée de journal non trouvée');
    }

    // Mettre à jour l'entrée
    const updatedEntry = await this.prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        mood: updateJournalEntryDto.mood,
        contentText: updateJournalEntryDto.contentText,
        // TODO V2: Ajouter color, coverImage, tags quand DTO sera mis à jour
      },
    });

    this.logger.log(`Journal entry updated: ${entryId}`);

    return this.mapToResponseDto(updatedEntry);
  }

  /**
   * Crée une alerte pour les agents
   */
  private async createAlert(
    studentId: string,
    schoolId: string,
    sourceId: string,
    aiResult: any,
  ): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      this.logger.error(`Student not found for alert creation: ${studentId}`);
      return;
    }

    await this.prisma.alert.create({
      data: {
        schoolId,
        studentId,
        sourceId,
        sourceType: 'JOURNAL',
        riskLevel: aiResult.riskLevel,
        riskScore: aiResult.riskScore,
        childMood: aiResult.mood || 'NEUTRE',
        aiSummary: aiResult.summary,
        aiAdvice: aiResult.advice,
        status: 'NOUVELLE',
      },
    });

    this.logger.log(`Alert created for student ${student.firstName} ${student.lastName}`);
  }

  /**
   * Récupère les données de récurrence pour un élève (14 derniers jours)
   */
  private async getRecurrenceData(studentId: string): Promise<any[]> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentEntries = await this.prisma.journalEntry.findMany({
      where: {
        studentId,
        createdAt: {
          gte: fourteenDaysAgo,
        },
        aiRiskLevel: {
          in: ['MOYEN', 'ELEVE', 'CRITIQUE'],
        },
      },
      select: {
        aiRiskLevel: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Grouper par catégorie et compter les jours distincts
    const categoryDays: Record<string, Set<string>> = {};

    for (const entry of recentEntries) {
      if (entry.aiRiskLevel) {
        if (!categoryDays[entry.aiRiskLevel]) {
          categoryDays[entry.aiRiskLevel] = new Set();
        }
        const dayKey = entry.createdAt.toISOString().split('T')[0];
        categoryDays[entry.aiRiskLevel].add(dayKey);
      }
    }

    // Convertir en format RecurrenceData
    const recurrenceData = [];
    for (const [category, days] of Object.entries(categoryDays)) {
      recurrenceData.push({
        category,
        days: days.size,
      });
    }

    return recurrenceData;
  }

  /**
   * Mappe l'entité Prisma vers le DTO de réponse
   */
  private mapToResponseDto(entry: any): JournalEntryResponseDto {
    return {
      id: entry.id,
      studentId: entry.studentId,
      mood: entry.mood,
      contentText: entry.contentText,
      createdAt: entry.createdAt,
      aiRiskScore: entry.aiRiskScore,
      aiRiskLevel: entry.aiRiskLevel,
      aiSummary: entry.aiSummary,
      aiAdvice: entry.aiAdvice,
      processedAt: entry.processedAt,
    };
  }
}

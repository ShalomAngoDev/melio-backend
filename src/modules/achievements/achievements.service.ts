import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface AchievementDto {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  threshold?: number;
  unlockedAt?: string;
}

export interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
  lastEntryDate?: string;
}

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupérer tous les badges disponibles
   */
  async findAll(): Promise<AchievementDto[]> {
    return this.prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { threshold: 'asc' }],
    });
  }

  /**
   * Récupérer les badges d'un élève
   */
  async getStudentAchievements(studentId: string): Promise<AchievementDto[]> {
    const studentAchievements = await this.prisma.studentAchievement.findMany({
      where: { studentId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    return studentAchievements.map((sa) => ({
      ...sa.achievement,
      unlockedAt: sa.unlockedAt.toISOString(),
    }));
  }

  /**
   * Récupérer le streak d'un élève
   */
  async getStudentStreak(studentId: string): Promise<StreakInfo> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: {
        currentStreak: true,
        bestStreak: true,
        lastEntryDate: true,
      },
    });

    if (!student) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    return {
      currentStreak: student.currentStreak,
      bestStreak: student.bestStreak,
      lastEntryDate: student.lastEntryDate?.toISOString(),
    };
  }

  /**
   * Calculer et mettre à jour le streak après une nouvelle entrée
   */
  async updateStreak(studentId: string): Promise<StreakInfo> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Élève introuvable');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = 1;

    if (student.lastEntryDate) {
      const lastDate = new Date(student.lastEntryDate);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Même jour, pas de changement
        newStreak = student.currentStreak;
      } else if (diffDays === 1) {
        // Jour consécutif
        newStreak = student.currentStreak + 1;
      } else {
        // Streak cassé
        newStreak = 1;
      }
    }

    // Mettre à jour le record si nécessaire
    const newBestStreak = newStreak > student.bestStreak ? newStreak : student.bestStreak;

    await this.prisma.student.update({
      where: { id: studentId },
      data: {
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        lastEntryDate: today,
      },
    });

    this.logger.log(
      `Streak mis à jour pour ${studentId}: ${newStreak} jours (record: ${newBestStreak})`,
    );

    // Vérifier les badges de streak à débloquer
    await this.checkStreakAchievements(studentId, newStreak);

    return {
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      lastEntryDate: today.toISOString(),
    };
  }

  /**
   * Vérifier et débloquer un badge
   */
  async unlockAchievement(studentId: string, achievementCode: string): Promise<boolean> {
    // Vérifier si déjà débloqué
    const existing = await this.prisma.studentAchievement.findFirst({
      where: {
        studentId,
        achievement: { code: achievementCode },
      },
    });

    if (existing) {
      return false; // Déjà débloqué
    }

    // Récupérer le badge
    const achievement = await this.prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) {
      this.logger.warn(`Badge introuvable: ${achievementCode}`);
      return false;
    }

    // Débloquer
    await this.prisma.studentAchievement.create({
      data: {
        studentId,
        achievementId: achievement.id,
      },
    });

    this.logger.log(`🏆 Badge débloqué pour ${studentId}: ${achievement.name}`);

    return true;
  }

  /**
   * Vérifier les badges liés aux entrées (nombre total, etc.)
   */
  async checkWritingAchievements(studentId: string): Promise<void> {
    const entryCount = await this.prisma.journalEntry.count({
      where: { studentId },
    });

    // Débloquer les badges selon le nombre d'entrées
    if (entryCount >= 1) {
      await this.unlockAchievement(studentId, 'first_entry');
    }
    if (entryCount >= 30) {
      await this.unlockAchievement(studentId, 'writer_30');
    }
    if (entryCount >= 100) {
      await this.unlockAchievement(studentId, 'champion_100');
    }
  }

  /**
   * Vérifier les badges de streak
   */
  private async checkStreakAchievements(studentId: string, currentStreak: number): Promise<void> {
    if (currentStreak >= 7) {
      await this.unlockAchievement(studentId, 'week_streak');
    }
    if (currentStreak >= 30) {
      await this.unlockAchievement(studentId, 'regular_30');
    }
  }

  /**
   * Vérifier le badge arc-en-ciel (toutes les humeurs)
   */
  async checkRainbowAchievement(studentId: string): Promise<void> {
    const entries = await this.prisma.journalEntry.findMany({
      where: { studentId },
      select: { mood: true },
      distinct: ['mood'],
    });

    const uniqueMoods = new Set(entries.map((e) => e.mood));
    const allMoods = ['TRES_TRISTE', 'TRISTE', 'NEUTRE', 'CONTENT', 'TRES_HEUREUX'];

    if (allMoods.every((mood) => uniqueMoods.has(mood))) {
      await this.unlockAchievement(studentId, 'rainbow');
    }
  }

  /**
   * Récupérer les progrès d'un élève
   */
  async getStudentProgress(studentId: string): Promise<{
    totalEntries: number;
    currentStreak: number;
    bestStreak: number;
    unlockedAchievements: number;
    totalAchievements: number;
    recentAchievements: AchievementDto[];
  }> {
    const [totalEntries, streak, achievements, allAchievements] = await Promise.all([
      this.prisma.journalEntry.count({ where: { studentId } }),
      this.getStudentStreak(studentId),
      this.getStudentAchievements(studentId),
      this.findAll(),
    ]);

    return {
      totalEntries,
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      unlockedAchievements: achievements.length,
      totalAchievements: allAchievements.length,
      recentAchievements: achievements.slice(0, 5),
    };
  }
}

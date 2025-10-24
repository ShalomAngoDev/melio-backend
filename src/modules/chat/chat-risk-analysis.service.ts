import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface ChatRiskAnalysis {
  riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
  riskScore: number; // 0-100
  dominantCategory: string;
  summary: string;
  advice: string;
  concerningPatterns: string[];
  conversationContext: {
    totalMessages: number;
    recentMessages: number;
    emotionalTone: string;
    escalationTrend: boolean;
  };
}

@Injectable()
export class ChatRiskAnalysisService {
  private readonly logger = new Logger(ChatRiskAnalysisService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyse une conversation de chat pour détecter les signaux de détresse
   */
  async analyzeChatRisk(
    studentId: string,
    newMessage: string,
    conversationHistory: any[] = []
  ): Promise<ChatRiskAnalysis> {
    this.logger.log(`Analyse de risque pour conversation de l'élève ${studentId}`);

    // Récupérer l'historique complet des conversations si pas fourni
    if (conversationHistory.length === 0) {
      conversationHistory = await this.getConversationHistory(studentId);
    }

    // Analyser le nouveau message
    const messageAnalysis = this.analyzeMessage(newMessage);
    
    // Analyser le contexte de la conversation
    const contextAnalysis = this.analyzeConversationContext(conversationHistory, newMessage);
    
    // Analyser les patterns préoccupants
    const patternAnalysis = this.analyzeConcerningPatterns(conversationHistory);
    
    // Calculer le score de risque global
    const riskScore = this.calculateRiskScore(messageAnalysis, contextAnalysis, patternAnalysis);
    
    // Déterminer le niveau de risque
    const riskLevel = this.determineRiskLevel(riskScore);
    
    // Générer le résumé et les conseils
    const summary = this.generateSummary(messageAnalysis, contextAnalysis, patternAnalysis);
    const advice = this.generateAdvice(riskLevel, messageAnalysis.dominantCategory);

    return {
      riskLevel,
      riskScore,
      dominantCategory: messageAnalysis.dominantCategory,
      summary,
      advice,
      concerningPatterns: patternAnalysis.patterns,
      conversationContext: {
        totalMessages: conversationHistory.length,
        recentMessages: conversationHistory.filter(m => 
          new Date(m.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        emotionalTone: contextAnalysis.emotionalTone,
        escalationTrend: patternAnalysis.escalationTrend
      }
    };
  }

  /**
   * Récupère l'historique des conversations d'un élève
   */
  private async getConversationHistory(studentId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.chatMessage.findMany({
      where: {
        studentId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  /**
   * Analyse un message individuel
   */
  private analyzeMessage(message: string): {
    dominantCategory: string;
    riskIndicators: string[];
    emotionalIntensity: number;
  } {
    const lowerMessage = message.toLowerCase();
    
    // Catégories de risque avec mots-clés
    const riskCategories = {
      violence: {
        keywords: ['frapper', 'battre', 'cogner', 'taper', 'violence', 'agression', 'blesser', 'tuer', 'mourir'],
        weight: 10
      },
      selfHarm: {
        keywords: ['suicide', 'me tuer', 'me suicider', 'se tuer', 'finir', 'en finir', 'ras le bol', 'plus envie'],
        weight: 15
      },
      bullying: {
        keywords: ['harcèlement', 'harceler', 'moquer', 'moquent', 'moque', 'insulter', 'insultent', 'insulte', 'embêter', 'embêtent', 'embête', 'taquiner', 'taquinent', 'taquine', 'exclure', 'excluent', 'rejeter', 'rejettent'],
        weight: 8
      },
      depression: {
        keywords: ['déprimé', 'triste', 'pleurer', 'malheureux', 'vide', 'rien', 'inutile', 'nul', 'raté'],
        weight: 6
      },
      anxiety: {
        keywords: ['peur', 'anxiété', 'stress', 'panique', 'crise', 'angoisse', 'inquiet', 'inquiète'],
        weight: 5
      },
      isolation: {
        keywords: ['seul', 'seule', 'personne', 'ami', 'copain', 'isolement', 'rejeté', 'abandonné'],
        weight: 4
      },
      family: {
        keywords: ['parents', 'maman', 'papa', 'famille', 'maison', 'dispute', 'crier', 'punir'],
        weight: 3
      },
      school: {
        keywords: ['école', 'classe', 'prof', 'devoir', 'examen', 'notes', 'redoubler', 'exclu'],
        weight: 2
      }
    };

    let maxScore = 0;
    let dominantCategory = 'general';
    const riskIndicators: string[] = [];

    // Analyser chaque catégorie
    for (const [category, config] of Object.entries(riskCategories)) {
      let categoryScore = 0;
      const foundKeywords: string[] = [];

      for (const keyword of config.keywords) {
        if (lowerMessage.includes(keyword)) {
          categoryScore += config.weight;
          foundKeywords.push(keyword);
        }
      }

      if (categoryScore > maxScore) {
        maxScore = categoryScore;
        dominantCategory = category;
      }

      if (foundKeywords.length > 0) {
        riskIndicators.push(`${category}: ${foundKeywords.join(', ')}`);
      }
    }

    // Calculer l'intensité émotionnelle
    const emotionalIntensity = Math.min(maxScore / 3, 25); // Augmenter encore plus le facteur

    return {
      dominantCategory,
      riskIndicators,
      emotionalIntensity
    };
  }

  /**
   * Analyse le contexte de la conversation
   */
  private analyzeConversationContext(conversationHistory: any[], _newMessage: string): {
    emotionalTone: string;
    frequency: number;
    escalationTrend: boolean;
  } {
    if (conversationHistory.length === 0) {
      return {
        emotionalTone: 'neutral',
        frequency: 0,
        escalationTrend: false
      };
    }

    // Analyser le ton émotionnel des messages récents
    const recentMessages = conversationHistory.slice(-10);
    const emotionalWords = ['triste', 'peur', 'colère', 'heureux', 'content', 'déprimé', 'anxieux'];
    
    let emotionalTone = 'neutral';
    let emotionalCount = 0;

    for (const message of recentMessages) {
      if (message.sender === 'USER') {
        const lowerContent = message.content.toLowerCase();
        for (const word of emotionalWords) {
          if (lowerContent.includes(word)) {
            emotionalCount++;
          }
        }
      }
    }

    if (emotionalCount > 5) {
      emotionalTone = 'highly_emotional';
    } else if (emotionalCount > 2) {
      emotionalTone = 'emotional';
    }

    // Calculer la fréquence des messages
    const last24Hours = conversationHistory.filter(m => 
      new Date(m.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    // Détecter une tendance d'escalade
    const escalationTrend = this.detectEscalationTrend(conversationHistory);

    return {
      emotionalTone,
      frequency: last24Hours,
      escalationTrend
    };
  }

  /**
   * Analyse les patterns préoccupants dans la conversation
   */
  private analyzeConcerningPatterns(conversationHistory: any[]): {
    patterns: string[];
    escalationTrend: boolean;
  } {
    const patterns: string[] = [];
    let escalationTrend = false;

    if (conversationHistory.length < 3) {
      return { patterns, escalationTrend };
    }

    // Pattern 1: Messages répétitifs sur le même sujet
    const userMessages = conversationHistory.filter(m => m.sender === 'USER');
    const recentTopics = userMessages.slice(-5).map(m => this.extractMainTopic(m.content));
    const uniqueTopics = new Set(recentTopics);
    
    if (uniqueTopics.size <= 2 && userMessages.length >= 5) {
      patterns.push('Répétition obsessionnelle sur un sujet');
    }

    // Pattern 2: Escalade émotionnelle
    escalationTrend = this.detectEscalationTrend(conversationHistory);
    if (escalationTrend) {
      patterns.push('Escalade émotionnelle détectée');
    }

    // Pattern 3: Messages très courts et vagues
    const shortVagueMessages = userMessages.filter(m => 
      m.content.length < 10 && 
      (m.content.includes('...') || m.content.includes('??') || m.content.includes('!!'))
    );
    
    if (shortVagueMessages.length >= 3) {
      patterns.push('Messages courts et vagues répétés');
    }

    // Pattern 4: Évitement des questions du bot
    const botQuestions = conversationHistory.filter(m => 
      m.sender === 'BOT' && m.content.includes('?')
    );
    const ignoredQuestions = botQuestions.filter((_, index) => {
      const nextUserMessage = userMessages.find(m => 
        new Date(m.createdAt) > new Date(botQuestions[index].createdAt)
      );
      return nextUserMessage && !this.isDirectAnswer(nextUserMessage.content, botQuestions[index].content);
    });

    if (ignoredQuestions.length >= 2) {
      patterns.push('Évitement des questions du bot');
    }

    return { patterns, escalationTrend };
  }

  /**
   * Calcule le score de risque global
   */
  private calculateRiskScore(
    messageAnalysis: any,
    contextAnalysis: any,
    patternAnalysis: any
  ): number {
    let score = 0;

    // Score basé sur l'analyse du message (0-80)
    // Augmenter le multiplicateur pour les messages critiques
    score += messageAnalysis.emotionalIntensity * 20;

    // Score basé sur le contexte (0-20)
    if (contextAnalysis.emotionalTone === 'highly_emotional') score += 15;
    else if (contextAnalysis.emotionalTone === 'emotional') score += 8;

    if (contextAnalysis.frequency > 10) score += 5; // Beaucoup de messages récents

    // Score basé sur les patterns (0-10)
    score += patternAnalysis.patterns.length * 3;
    if (patternAnalysis.escalationTrend) score += 5;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Détermine le niveau de risque
   */
  private determineRiskLevel(score: number): 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE' {
    if (score >= 80) return 'CRITIQUE';
    if (score >= 60) return 'ELEVE';
    if (score >= 30) return 'MOYEN';
    return 'FAIBLE';
  }

  /**
   * Génère un résumé de l'analyse
   */
  private generateSummary(messageAnalysis: any, contextAnalysis: any, patternAnalysis: any): string {
    const parts: string[] = [];

    if (messageAnalysis.dominantCategory !== 'general') {
      parts.push(`Catégorie dominante: ${messageAnalysis.dominantCategory}`);
    }

    if (contextAnalysis.emotionalTone !== 'neutral') {
      parts.push(`Ton émotionnel: ${contextAnalysis.emotionalTone}`);
    }

    if (patternAnalysis.patterns.length > 0) {
      parts.push(`Patterns détectés: ${patternAnalysis.patterns.join(', ')}`);
    }

    return parts.join('. ') || 'Conversation normale détectée';
  }

  /**
   * Génère des conseils basés sur l'analyse
   */
  private generateAdvice(riskLevel: string, _category: string): string {
    const adviceMap = {
      CRITIQUE: 'Intervention immédiate requise. Contacter les parents et les services d\'urgence si nécessaire.',
      ELEVE: 'Surveillance renforcée recommandée. Planifier un entretien avec l\'élève et les parents.',
      MOYEN: 'Suivi attentif nécessaire. Encourager l\'élève à parler à un adulte de confiance.',
      FAIBLE: 'Continuer le suivi normal. Maintenir une communication bienveillante.'
    };

    return adviceMap[riskLevel] || adviceMap.FAIBLE;
  }

  /**
   * Détecte une tendance d'escalade dans la conversation
   */
  private detectEscalationTrend(conversationHistory: any[]): boolean {
    if (conversationHistory.length < 5) return false;

    const userMessages = conversationHistory
      .filter(m => m.sender === 'USER')
      .slice(-5);

    if (userMessages.length < 3) return false;

    // Analyser l'intensité émotionnelle croissante
    const intensities = userMessages.map(m => this.analyzeMessage(m.content).emotionalIntensity);
    
    // Vérifier si l'intensité augmente
    let increasingCount = 0;
    for (let i = 1; i < intensities.length; i++) {
      if (intensities[i] > intensities[i - 1]) {
        increasingCount++;
      }
    }

    return increasingCount >= 2;
  }

  /**
   * Extrait le sujet principal d'un message
   */
  private extractMainTopic(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('école') || lowerContent.includes('classe')) return 'école';
    if (lowerContent.includes('famille') || lowerContent.includes('parents')) return 'famille';
    if (lowerContent.includes('ami') || lowerContent.includes('copain')) return 'amitié';
    if (lowerContent.includes('triste') || lowerContent.includes('pleurer')) return 'tristesse';
    if (lowerContent.includes('peur') || lowerContent.includes('stress')) return 'anxiété';
    
    return 'général';
  }

  /**
   * Vérifie si une réponse est directe à une question
   */
  private isDirectAnswer(userMessage: string, botQuestion: string): boolean {
    const questionWords = ['comment', 'quoi', 'pourquoi', 'quand', 'où', 'qui'];
    const lowerUser = userMessage.toLowerCase();
    const lowerBot = botQuestion.toLowerCase();

    return questionWords.some(word => 
      lowerBot.includes(word) && lowerUser.length > 10
    );
  }
}

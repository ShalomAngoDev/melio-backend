import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ChatAIService, ChatResponse } from './chat-ai.service';
import { ChatMessageDto, CreateChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatAI: ChatAIService,
  ) {}

  /**
   * Envoie un message de l'élève et génère une réponse du bot
   */
  async sendMessage(
    studentId: string,
    createMessageDto: CreateChatMessageDto,
  ): Promise<{ userMessage: ChatMessageDto; botResponse: ChatMessageDto }> {
    // Vérifier que l'élève existe
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Créer le message de l'élève
    const userMessage = await this.prisma.chatMessage.create({
      data: {
        studentId,
        sender: 'USER',
        content: createMessageDto.content,
      },
    });

    this.logger.log(`User message created: ${userMessage.id} for student ${studentId}`);

    // Vérifier si le message est hors sujet
    let botResponse: ChatResponse;
    if (this.chatAI.isOffTopic(createMessageDto.content)) {
      botResponse = this.chatAI.getOffTopicResponse();
      this.logger.log(`Off-topic message detected for student ${studentId}`);
    } else {
      // Analyser et générer la réponse du bot
      botResponse = this.chatAI.analyzeAndRespond(createMessageDto.content);
    }

    // Créer la réponse du bot
    const botMessage = await this.prisma.chatMessage.create({
      data: {
        studentId,
        sender: 'BOT',
        content: botResponse.content,
        resourceId: botResponse.resourceId,
      },
    });

    this.logger.log(`Bot response created: ${botMessage.id} for student ${studentId}`);

    return {
      userMessage: this.mapToDto(userMessage),
      botResponse: this.mapToDto(botMessage),
    };
  }

  /**
   * Récupère les messages de chat d'un élève
   */
  async getStudentMessages(studentId: string, limit = 50, offset = 0): Promise<ChatMessageDto[]> {
    // Vérifier que l'élève existe
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: { studentId },
      orderBy: { createdAt: 'asc' }, // Ordre chronologique (anciens en premier)
      take: limit,
      skip: offset,
    });

    return messages.map((message) => this.mapToDto(message));
  }

  /**
   * Récupère les messages de chat d'un élève (pour les agents)
   */
  async getStudentMessagesForAgent(
    studentId: string,
    limit = 50,
    offset = 0,
  ): Promise<ChatMessageDto[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }, // Ordre décroissant pour les agents
      take: limit,
      skip: offset,
    });

    return messages.map((message) => this.mapToDto(message));
  }

  /**
   * Récupère les statistiques de chat d'un élève
   */
  async getStudentChatStats(studentId: string): Promise<{
    totalMessages: number;
    userMessages: number;
    botMessages: number;
    lastActivity: Date | null;
  }> {
    const [totalMessages, userMessages, botMessages, lastMessage] = await Promise.all([
      this.prisma.chatMessage.count({ where: { studentId } }),
      this.prisma.chatMessage.count({ where: { studentId, sender: 'USER' } }),
      this.prisma.chatMessage.count({ where: { studentId, sender: 'BOT' } }),
      this.prisma.chatMessage.findFirst({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      totalMessages,
      userMessages,
      botMessages,
      lastActivity: lastMessage?.createdAt || null,
    };
  }

  /**
   * Supprime tous les messages de chat d'un élève
   */
  async deleteStudentMessages(studentId: string): Promise<void> {
    this.logger.log(`Suppression de tous les messages de chat pour l'élève ${studentId}`);

    await this.prisma.chatMessage.deleteMany({
      where: {
        studentId: studentId,
      },
    });

    this.logger.log(`Messages de chat supprimés pour l'élève ${studentId}`);
  }

  /**
   * Génère un message empathique basé sur le niveau de risque
   */
  generateEmpatheticMessage(
    riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE',
    category?: string,
  ): { content: string; resourceId?: string } {
    const messages = {
      FAIBLE: {
        content:
          "Salut 👋 merci d'avoir écrit. Écrire aide à se sentir mieux. Tu veux que je te montre un témoignage inspirant ?",
        resourceId: 'cmgb6s2sv00015h3pge3bwnb8', // Comment j'ai surmonté le harcèlement
      },
      MOYEN: {
        content:
          "Je comprends que ça puisse être difficile. Tu n'es pas seul·e, d'autres enfants sont passés par là. Veux-tu voir quelques conseils pratiques ?",
        resourceId: 'cmgb6s2tv00075h3p2wnewbk4', // Techniques de relaxation
      },
      ELEVE: {
        content:
          "Ça a l'air vraiment difficile pour toi en ce moment. Ce que tu ressens est important. En attendant que l'école t'aide, je peux te montrer une ressource qui a aidé d'autres élèves.",
        resourceId: this.getResourceByCategory(category),
      },
      CRITIQUE: {
        content:
          "Coucou 😊\nTu veux qu'on prenne un petit moment pour discuter ?\nJe suis là pour toi.\nDis-moi, comment s'est passée ta journée aujourd'hui ?",
        resourceId: 'cmgb6s2u7000b5h3p6pu35x7w', // Reconnaître les signes de dépression
      },
    };

    return messages[riskLevel];
  }

  /**
   * Obtient une ressource par catégorie
   */
  private getResourceByCategory(category?: string): string {
    const resources = {
      bullying: 'cmgb6s2sv00015h3pge3bwnb8', // Comment j'ai surmonté le harcèlement
      emotions: 'cmgb6s2ti00035h3p2oipdpny', // Gérer ses émotions au quotidien
      friendship: 'cmgb6s2tn00055h3pqzl4tz9l', // Les vrais amis
      'self-esteem': 'cmgb6s2u000095h3p8q10n3f8', // Construire sa confiance en soi
      help: 'cmgb6s2u7000b5h3p6pu35x7w', // Reconnaître les signes de dépression
      default: 'cmgb6s2ti00035h3p2oipdpny', // Gérer ses émotions au quotidien
    };

    return resources[category as keyof typeof resources] || resources.default;
  }

  /**
   * Crée un message empathique pour un élève
   */
  async createEmpatheticMessage(
    studentId: string,
    riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE',
    category?: string,
    _relatedTo?: string,
  ): Promise<ChatMessageDto> {
    const { content, resourceId } = this.generateEmpatheticMessage(riskLevel, category);

    const message = await this.prisma.chatMessage.create({
      data: {
        studentId,
        sender: 'BOT',
        content,
        resourceId,
        // Ajouter un champ pour lier au journal si nécessaire
        // relatedTo: relatedTo
      },
    });

    this.logger.log(`Message empathique créé pour l'élève ${studentId} (niveau: ${riskLevel})`);

    return this.mapToDto(message);
  }

  /**
   * Convertit un message Prisma en DTO
   */
  private mapToDto(message: any): ChatMessageDto {
    return {
      id: message.id,
      studentId: message.studentId,
      sender: message.sender as 'USER' | 'BOT',
      content: message.content,
      resourceId: message.resourceId,
      createdAt: message.createdAt,
    };
  }
}

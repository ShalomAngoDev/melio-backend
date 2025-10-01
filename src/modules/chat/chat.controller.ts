import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';
import { ChatService } from './chat.service';
import { ChatMessageDto, CreateChatMessageDto } from './dto/chat-message.dto';

@ApiTags('Chat')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':id/chat')
  @Roles(Role.ROLE_STUDENT)
  @ApiOperation({ summary: 'Envoyer un message à Mélio (élève uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Message envoyé et réponse de Mélio générée',
    schema: {
      type: 'object',
      properties: {
        userMessage: { $ref: '#/components/schemas/ChatMessageDto' },
        botResponse: { $ref: '#/components/schemas/ChatMessageDto' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Élève requis' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async sendMessage(
    @Param('id') studentId: string,
    @Body() createMessageDto: CreateChatMessageDto,
    @Request() req: any,
  ): Promise<{ userMessage: ChatMessageDto; botResponse: ChatMessageDto }> {
    // Vérifier que l'élève ne peut envoyer des messages que pour lui-même
    if (req.user.sub !== studentId) {
      throw new Error('Vous ne pouvez envoyer des messages que pour votre propre compte');
    }

    return this.chatService.sendMessage(studentId, createMessageDto);
  }

  @Get(':id/chat')
  @Roles(Role.ROLE_STUDENT)
  @ApiOperation({ summary: "Récupérer les messages de chat de l'élève connecté" })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre de messages à récupérer (défaut: 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Décalage pour la pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des messages de chat',
    type: ChatMessageDto,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Élève requis' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async getStudentMessages(
    @Param('id') studentId: string,
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ChatMessageDto[]> {
    // Vérifier que l'élève ne peut récupérer que ses propres messages
    if (req.user.sub !== studentId) {
      throw new Error('Vous ne pouvez récupérer que vos propres messages');
    }

    return this.chatService.getStudentMessages(studentId, limit || 50, offset || 0);
  }

  @Get(':id/chat/stats')
  @Roles(Role.ROLE_STUDENT)
  @ApiOperation({ summary: "Récupérer les statistiques de chat de l'élève connecté" })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des messages de chat',
    schema: {
      type: 'object',
      properties: {
        totalMessages: { type: 'number' },
        userMessages: { type: 'number' },
        botMessages: { type: 'number' },
        lastActivity: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Élève requis' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async getStudentChatStats(@Param('id') studentId: string, @Request() req: any): Promise<any> {
    // Vérifier que l'élève ne peut récupérer que ses propres statistiques
    if (req.user.sub !== studentId) {
      throw new Error('Vous ne pouvez récupérer que vos propres statistiques');
    }

    return this.chatService.getStudentChatStats(studentId);
  }

  // Endpoints pour les agents (accès aux conversations des élèves)
  @Get(':id/chat/agent')
  @Roles(Role.ROLE_AGENT)
  @ApiOperation({ summary: "Récupérer les messages de chat d'un élève (Agent uniquement)" })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre de messages à récupérer (défaut: 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Décalage pour la pagination',
  })
  @ApiResponse({
    status: 200,
    description: "Liste des messages de chat de l'élève",
    type: [ChatMessageDto],
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Agent requis' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async getStudentMessagesForAgent(
    @Param('id') studentId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ChatMessageDto[]> {
    return this.chatService.getStudentMessagesForAgent(studentId, limit || 50, offset || 0);
  }

  @Delete(':id/chat')
  @Roles(Role.ROLE_STUDENT)
  @ApiOperation({ summary: "Supprimer tous les messages de chat d'un élève" })
  @ApiResponse({ status: 200, description: 'Messages supprimés avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Élève requis' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async deleteStudentMessages(
    @Param('id') studentId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    // Vérifier que l'élève ne peut supprimer que ses propres messages
    if (req.user.sub !== studentId) {
      throw new Error('Vous ne pouvez supprimer que vos propres messages');
    }

    await this.chatService.deleteStudentMessages(studentId);
    return { message: 'Messages supprimés avec succès' };
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ description: 'ID du message' })
  id: string;

  @ApiProperty({ description: 'ID de l\'élève' })
  studentId: string;

  @ApiProperty({ description: 'Expéditeur du message', enum: ['USER', 'BOT'] })
  @IsEnum(['USER', 'BOT'])
  sender: 'USER' | 'BOT';

  @ApiProperty({ description: 'Contenu du message' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'ID de la ressource associée', required: false })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({ description: 'Date de création' })
  @IsDateString()
  createdAt: Date;
}

export class CreateChatMessageDto {
  @ApiProperty({ description: 'Contenu du message' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatStatsDto {
  @ApiProperty({ description: 'Nombre total de messages' })
  totalMessages: number;

  @ApiProperty({ description: 'Nombre de messages utilisateur' })
  userMessages: number;

  @ApiProperty({ description: 'Nombre de messages bot' })
  botMessages: number;

  @ApiProperty({ description: 'Dernière activité', required: false })
  lastActivity?: Date;
}

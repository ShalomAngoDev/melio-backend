import { IsNotEmpty, IsString, IsIn, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertCommentDto {
  @ApiProperty({
    enum: ['NOUVELLE', 'EN_COURS', 'TRAITEE'],
    description: "Nouveau statut de l'alerte",
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['NOUVELLE', 'EN_COURS', 'TRAITEE'])
  newStatus: string;

  @ApiProperty({
    description: 'Commentaire obligatoire expliquant les actions prises',
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  comment: string;
}

export class AlertCommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  alertId: string;

  @ApiProperty()
  agentId: string;

  @ApiProperty()
  agentName: string;

  @ApiProperty({ required: false })
  oldStatus?: string;

  @ApiProperty()
  newStatus: string;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  createdAt: Date;
}

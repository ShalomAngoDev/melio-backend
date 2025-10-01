import { IsString, IsNotEmpty, IsIn, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJournalEntryDto {
  @ApiProperty({
    description: "Humeur de l'élève",
    enum: ['TRES_TRISTE', 'TRISTE', 'NEUTRE', 'CONTENT', 'TRES_HEUREUX'],
    example: 'TRISTE',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['TRES_TRISTE', 'TRISTE', 'NEUTRE', 'CONTENT', 'TRES_HEUREUX'])
  mood: string;

  @ApiProperty({
    description: 'Contenu du journal (texte libre)',
    example: "Aujourd'hui encore, des camarades se sont moqués de moi en classe...",
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Le contenu ne peut pas dépasser 2000 caractères' })
  contentText: string;
}

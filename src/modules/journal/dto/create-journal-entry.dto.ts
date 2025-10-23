import { IsString, IsNotEmpty, IsIn, MaxLength, IsOptional, IsArray } from 'class-validator';
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

  // V2: Champs de personnalisation
  @ApiProperty({
    description: "Couleur de personnalisation de l'entrée",
    example: 'pink',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: "Image de couverture de l'entrée",
    example: 'sunset',
    required: false,
  })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({
    description: "Tags/catégories associés à l'entrée",
    example: ['tag_school', 'tag_friends'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: "URLs des photos associées à l'entrée",
    example: ['http://localhost:9000/melio/photos/user123/photo1.jpg'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}

import { ApiProperty } from '@nestjs/swagger';

export class JournalEntryResponseDto {
  @ApiProperty({ description: "ID de l'entrée de journal" })
  id: string;

  @ApiProperty({ description: "ID de l'élève" })
  studentId: string;

  @ApiProperty({
    description: "Humeur de l'élève",
    enum: ['TRES_TRISTE', 'TRISTE', 'NEUTRE', 'CONTENT', 'TRES_HEUREUX'],
  })
  mood: string;

  @ApiProperty({ description: 'Contenu du journal' })
  contentText: string;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Score de risque IA (0-100)', required: false })
  aiRiskScore?: number;

  @ApiProperty({
    description: 'Niveau de risque IA',
    enum: ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE'],
    required: false,
  })
  aiRiskLevel?: string;

  @ApiProperty({ description: "Résumé généré par l'IA", required: false })
  aiSummary?: string;

  @ApiProperty({ description: "Conseil stratégique de l'IA", required: false })
  aiAdvice?: string;

  @ApiProperty({ description: "Date de traitement par l'IA", required: false })
  processedAt?: Date;

  // V2: Champs de personnalisation
  @ApiProperty({ description: 'Couleur de personnalisation', required: false })
  color?: string;

  @ApiProperty({ description: 'Image de couverture', required: false })
  coverImage?: string;

  @ApiProperty({ description: 'Tags associés', required: false, type: [String] })
  tags?: string[];

  @ApiProperty({ description: 'URLs des photos', required: false, type: [String] })
  photos?: string[];
}

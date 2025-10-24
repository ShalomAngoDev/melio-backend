import { ApiProperty } from '@nestjs/swagger';

export class StudentInfoDto {
  @ApiProperty({ description: "ID de l'élève" })
  id: string;

  @ApiProperty({ description: "Prénom de l'élève" })
  firstName: string;

  @ApiProperty({ description: "Nom de l'élève" })
  lastName: string;

  @ApiProperty({ description: "Classe de l'élève" })
  className: string;
}

export class AlertResponseDto {
  @ApiProperty({ description: "ID de l'alerte" })
  id: string;

  @ApiProperty({ description: "ID de l'établissement" })
  schoolId: string;

  @ApiProperty({ description: "Informations de l'élève", type: StudentInfoDto })
  student: StudentInfoDto;

  @ApiProperty({ description: 'ID de la source (JournalEntry)' })
  sourceId: string;

  @ApiProperty({ description: 'Type de source' })
  sourceType: string;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({
    description: 'Niveau de risque',
    enum: ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE'],
  })
  riskLevel: string;

  @ApiProperty({ description: 'Score de risque (0-100)' })
  riskScore: number;

  @ApiProperty({
    description: "Humeur de l'enfant",
    enum: ['TRES_TRISTE', 'TRISTE', 'NEUTRE', 'CONTENT', 'TRES_HEUREUX'],
  })
  childMood: string;

  @ApiProperty({ description: "Résumé généré par l'IA" })
  aiSummary: string;

  @ApiProperty({ description: "Conseil stratégique de l'IA" })
  aiAdvice: string;

  @ApiProperty({
    description: "Statut de l'alerte",
    enum: ['NOUVELLE', 'EN_COURS', 'TRAITEE'],
  })
  status: string;
}

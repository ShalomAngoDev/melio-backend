import { ApiProperty } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({ description: 'ID unique de l\'élève' })
  id: string;

  @ApiProperty({ description: 'ID de l\'établissement' })
  schoolId: string;

  @ApiProperty({ description: 'Prénom' })
  firstName: string;

  @ApiProperty({ description: 'Nom de famille' })
  lastName: string;

  @ApiProperty({ description: 'Date de naissance (format ISO)' })
  birthdate: string;

  @ApiProperty({ description: 'Sexe de l\'élève', enum: ['M', 'F'] })
  sex: string;

  @ApiProperty({ description: 'Classe' })
  className: string;

  @ApiProperty({ description: 'Nom du parent/tuteur', required: false })
  parentName?: string;

  @ApiProperty({ description: 'Téléphone du parent/tuteur' })
  parentPhone: string;

  @ApiProperty({ description: 'Email du parent/tuteur', required: false })
  parentEmail?: string;

  @ApiProperty({ description: 'Identifiant secret de 6 caractères' })
  uniqueId: string;

  @ApiProperty({ description: 'Date de création' })
  createdAt: string;
}

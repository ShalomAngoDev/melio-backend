import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({
    description: "ID de l'utilisateur",
    example: 'cuid123',
  })
  id: string;

  @ApiProperty({
    description: 'Email (pour les agents)',
    example: 'admin@college-victor-hugo.fr',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Prénom',
    example: 'Marie',
  })
  firstName: string;

  @ApiProperty({
    description: 'Nom',
    example: 'Rousseau',
  })
  lastName: string;

  @ApiProperty({
    description: 'Classe (pour les élèves)',
    example: '6ème A',
    required: false,
  })
  className?: string;

  @ApiProperty({
    description: 'Rôle',
    example: 'ROLE_ADMIN_SCHOOL',
    enum: ['ROLE_ADMIN_SCHOOL', 'ROLE_AGENT', 'ROLE_STUDENT', 'ROLE_SUPERADMIN'],
  })
  role: string;

  @ApiProperty({
    description: "ID de l'établissement",
    example: 'school123',
  })
  schoolId: string;

  @ApiProperty({
    description: "Code de l'établissement",
    example: 'COLLEGE2024',
  })
  schoolCode: string;

  @ApiProperty({
    description: "Nom de l'établissement",
    example: 'Collège Victor Hugo',
  })
  schoolName: string;
}

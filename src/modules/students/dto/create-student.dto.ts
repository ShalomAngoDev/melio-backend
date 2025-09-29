import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEmail, Matches, Length, MaxLength, IsIn } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Code de l\'établissement',
    example: 'COLL-JMOULIN-75',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 20, { message: 'Le code établissement doit contenir entre 8 et 20 caractères' })
  schoolCode: string;

  @ApiProperty({
    description: 'Prénom de l\'élève',
    example: 'Emma',
    minLength: 1,
    maxLength: 80,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 80, { message: 'Le prénom doit contenir entre 1 et 80 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s\-]+$/, { message: 'Le prénom ne peut contenir que des lettres, espaces et tirets' })
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille de l\'élève',
    example: 'Durand',
    minLength: 1,
    maxLength: 80,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 80, { message: 'Le nom doit contenir entre 1 et 80 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s\-]+$/, { message: 'Le nom ne peut contenir que des lettres, espaces et tirets' })
  lastName: string;

  @ApiProperty({
    description: 'Date de naissance (format ISO YYYY-MM-DD)',
    example: '2013-05-22',
  })
  @IsDateString({}, { message: 'La date de naissance doit être au format YYYY-MM-DD' })
  birthdate: string;

  @ApiProperty({
    description: 'Sexe de l\'élève',
    example: 'F',
    enum: ['M', 'F'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['M', 'F'], { message: 'Le sexe doit être M ou F' })
  sex: string;

  @ApiProperty({
    description: 'Classe de l\'élève',
    example: '5eB',
    minLength: 1,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20, { message: 'La classe doit contenir entre 1 et 20 caractères' })
  className: string;

  @ApiProperty({
    description: 'Nom du parent/tuteur',
    example: 'Mme Durand',
    required: false,
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'Le nom du parent ne peut dépasser 80 caractères' })
  parentName?: string;

  @ApiProperty({
    description: 'Téléphone du parent/tuteur',
    example: '+33611223344',
    minLength: 9,
    maxLength: 15,
  })
  @IsString()
  @IsNotEmpty()
  @Length(9, 15, { message: 'Le téléphone doit contenir entre 9 et 15 caractères' })
  @Matches(/^[\+]?[0-9\s\-\(\)]+$/, { message: 'Format de téléphone invalide' })
  parentPhone: string;

  @ApiProperty({
    description: 'Email du parent/tuteur',
    example: 'parent@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Format d\'email invalide' })
  parentEmail?: string;
}

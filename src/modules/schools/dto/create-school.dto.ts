import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Matches,
  Length,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({
    description: "Code unique de l'établissement (utilisé pour les connexions)",
    example: 'MELIO001',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, { message: 'Le code école doit contenir entre 6 et 20 caractères' })
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Le code école ne peut contenir que des lettres majuscules et des chiffres',
  })
  code: string;

  @ApiProperty({
    description: "Nom officiel de l'établissement",
    example: 'Collège Jean Moulin',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 120, { message: 'Le nom doit contenir entre 2 et 120 caractères' })
  name: string;

  @ApiProperty({
    description: 'Adresse principale',
    example: '12 rue des Écoles',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: "L'adresse ne peut dépasser 200 caractères" })
  address1: string;

  @ApiProperty({
    description: 'Adresse complémentaire',
    example: 'Bâtiment A, 2ème étage',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: "L'adresse complémentaire ne peut dépasser 200 caractères" })
  address2?: string;

  @ApiProperty({
    description: 'Code postal',
    example: '75015',
    minLength: 5,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 10, { message: 'Le code postal doit contenir entre 5 et 10 caractères' })
  postalCode: string;

  @ApiProperty({
    description: 'Ville',
    example: 'Paris',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'La ville ne peut dépasser 100 caractères' })
  city: string;

  @ApiProperty({
    description: 'Pays (code ISO)',
    example: 'FR',
    default: 'FR',
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'Le pays doit être un code ISO de 2 caractères' })
  country?: string;

  @ApiProperty({
    description: 'Fuseau horaire',
    example: 'Europe/Paris',
    default: 'Europe/Paris',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: "Niveau d'enseignement",
    example: 'COLLEGE',
    enum: ['PRIMARY', 'COLLEGE', 'LYCEE', 'SUP', 'MIXTE'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['PRIMARY', 'COLLEGE', 'LYCEE', 'SUP', 'MIXTE'], {
    message: 'Le niveau doit être PRIMARY, COLLEGE, LYCEE, SUP ou MIXTE',
  })
  level?: string;

  @ApiProperty({
    description: 'Code UAI (identifiant Education nationale)',
    example: '0751234A',
    required: false,
    minLength: 8,
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @Length(8, 10, { message: 'Le code UAI doit contenir entre 8 et 10 caractères' })
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Le code UAI ne peut contenir que des lettres majuscules et des chiffres',
  })
  uaiCode?: string;

  @ApiProperty({
    description: 'Nom du contact principal',
    example: 'Mme Dupont',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Le nom du contact ne peut dépasser 100 caractères' })
  contactName?: string;

  @ApiProperty({
    description: 'Email du contact principal',
    example: 'direction@cj-moulin.fr',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: "Format d'email invalide" })
  contactEmail?: string;

  @ApiProperty({
    description: 'Téléphone du contact principal',
    example: '+33123456789',
    required: false,
    minLength: 9,
    maxLength: 15,
  })
  @IsOptional()
  @IsString()
  @Length(9, 15, { message: 'Le téléphone doit contenir entre 9 et 15 caractères' })
  @Matches(/^[\+]?[0-9\s\-\(\)]+$/, { message: 'Format de téléphone invalide' })
  contactPhone?: string;

  @ApiProperty({
    description: "Paramètres de l'établissement (JSON)",
    example: {
      dataRetentionMonths: 18,
      aiThresholds: { LOW: 40, MEDIUM: 65, HIGH: 85 },
      notify: { critical: 'realtime', others: 'daily' },
    },
    required: false,
  })
  @IsOptional()
  settings?: any;
}

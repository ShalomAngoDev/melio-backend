import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class StudentLoginDto {
  @ApiProperty({
    description: 'Code de l\'établissement',
    example: 'COLLEGE2024',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 20, { message: 'Le code établissement doit contenir entre 8 et 20 caractères' })
  schoolCode: string;

  @ApiProperty({
    description: 'Identifiant de l\'élève',
    example: 'ELEVE001',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, { message: 'L\'identifiant élève doit contenir entre 6 et 20 caractères' })
  studentIdentifier: string;
}
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class StaffLoginDto {
  @ApiProperty({
    description: 'Email professionnel (Agent ou Admin)',
    example: 'agent@school.fr',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  @MaxLength(255, { message: 'Email trop long' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'SecurePassword123!',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(100, { message: 'Le mot de passe est trop long' })
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class AgentLoginDto {
  @ApiProperty({
    description: 'Code de l\'établissement',
    example: 'COLLEGE2024',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  schoolCode: string;

  @ApiProperty({
    description: 'Email de l\'agent',
    example: 'agent@college-victor-hugo.fr',
  })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'agent123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}
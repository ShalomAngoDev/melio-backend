import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Email de l\'admin Melio',
    example: 'admin@melio.app',
  })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'admin123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}






import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class ListSchoolsDto {
  @ApiProperty({
    description: 'Recherche par nom ou ville',
    example: 'jean moulin',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtrer par ville',
    example: 'Paris',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Filtrer par statut',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
    message: 'Le statut doit être ACTIVE, INACTIVE ou SUSPENDED',
  })
  status?: string;

  @ApiProperty({
    description: 'Filtrer par niveau',
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
}


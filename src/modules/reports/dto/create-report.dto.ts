import { IsString, IsOptional, IsBoolean, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateReportDto {
  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Le contenu ne peut pas dépasser 2000 caractères' })
  content: string;

  @IsEnum(UrgencyLevel)
  urgency: UrgencyLevel;

  @IsBoolean()
  anonymous: boolean;
}

import { IsEnum, IsOptional } from 'class-validator';

export enum ReportStatus {
  NOUVEAU = 'NOUVEAU',
  EN_COURS = 'EN_COURS',
  TRAITE = 'TRAITE',
}

export class UpdateReportDto {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;
}

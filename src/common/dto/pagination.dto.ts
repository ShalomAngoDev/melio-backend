import { IsOptional, IsPositive, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO pour la pagination optimisée
 * Supporte la pagination offset-based et cursor-based
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(1000)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @IsOptional()
  cursor?: string;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO pour la pagination avec métadonnées
 */
export class PaginatedResponseDto<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

/**
 * Options de requête optimisées
 */
export interface QueryOptions {
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  include?: string[];
  select?: string[];
  where?: any;
}

/**
 * Helper pour calculer la pagination
 */
export class PaginationHelper {
  static calculatePagination(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  static createCursor(record: any, sortBy: string): string {
    const value = record[sortBy];
    return Buffer.from(JSON.stringify({ [sortBy]: value, id: record.id })).toString('base64');
  }

  static parseCursor(cursor: string): any {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString());
    } catch {
      return null;
    }
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListStudentsDto {
  @ApiProperty({
    description: 'Filtrer par classe',
    example: '5eB',
    required: false,
  })
  @IsOptional()
  @IsString()
  className?: string;

  @ApiProperty({
    description: 'Recherche par nom ou prénom',
    example: 'emma',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

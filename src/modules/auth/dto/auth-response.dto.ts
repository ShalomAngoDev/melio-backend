import { ApiProperty } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty({ description: 'ID de l\'élève' })
  id: string;

  @ApiProperty({ description: 'Prénom' })
  firstName: string;

  @ApiProperty({ description: 'Nom' })
  lastName: string;

  @ApiProperty({ description: 'Classe' })
  className: string;
}

export class AgentDto {
  @ApiProperty({ description: 'ID de l\'agent' })
  id: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'ID de l\'établissement' })
  schoolId: string;

  @ApiProperty({ description: 'Rôle' })
  role: string;
}

export class AdminDto {
  @ApiProperty({ description: 'ID de l\'admin' })
  id: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Rôle' })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Access token JWT' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token JWT' })
  refreshToken: string;

  @ApiProperty({ description: 'Données de l\'élève', type: StudentDto, required: false })
  student?: StudentDto;

  @ApiProperty({ description: 'Données de l\'agent', type: AgentDto, required: false })
  agent?: AgentDto;

  @ApiProperty({ description: 'Données de l\'admin', type: AdminDto, required: false })
  admin?: AdminDto;
}
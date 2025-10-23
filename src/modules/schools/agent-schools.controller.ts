import { Controller, Get, UseGuards, Request, Param, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SchoolResponseDto } from './dto/school-response.dto';
import { Role } from '../auth/decorators/role.enum';
import { PrismaService } from '../../config/prisma.service';

@ApiTags('Agent Schools')
@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AgentSchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: "Récupérer les informations de l'école de l'agent connecté" })
  @ApiResponse({ status: 200, description: "Informations de l'école", type: SchoolResponseDto })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async getMySchoolInfo(@Request() req: any): Promise<SchoolResponseDto> {
    return this.schoolsService.getSchoolById(req.user.schoolId);
  }

  @Get(':id')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: "Récupérer les informations d'une école dont l'agent est responsable" })
  @ApiResponse({ status: 200, description: "Informations de l'école", type: SchoolResponseDto })
  @ApiResponse({
    status: 403,
    description: "Accès refusé - L'agent n'est pas responsable de cette école",
  })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async getSchoolInfo(
    @Param('id') schoolId: string,
    @Request() req: any,
  ): Promise<SchoolResponseDto> {
    // Vérifier que l'agent est bien responsable de cette école
    const agentSchool = await this.prisma.agentSchool.findFirst({
      where: {
        agentId: req.user.id,
        schoolId: schoolId,
      },
    });

    if (!agentSchool) {
      throw new ForbiddenException("Vous n'êtes pas responsable de cette école");
    }

    return this.schoolsService.getSchoolById(schoolId);
  }
}

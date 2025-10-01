import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SchoolResponseDto } from './dto/school-response.dto';
import { Role } from '../auth/decorators/role.enum';

@ApiTags('Agent Schools')
@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AgentSchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get('me')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: "Récupérer les informations de l'école de l'agent connecté" })
  @ApiResponse({ status: 200, description: "Informations de l'école", type: SchoolResponseDto })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async getMySchoolInfo(@Request() req: any): Promise<SchoolResponseDto> {
    return this.schoolsService.getSchoolById(req.user.schoolId);
  }
}

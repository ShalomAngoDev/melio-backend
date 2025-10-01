import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateSchoolDto } from './dto/create-school.dto';
import { SchoolResponseDto } from './dto/school-response.dto';
import { ListSchoolsDto } from './dto/list-schools.dto';
import { Role } from '../auth/decorators/role.enum';

@ApiTags('Admin Schools')
@Controller('admin/schools')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @Roles(Role.ADMIN_MELIO)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouvel établissement' })
  @ApiResponse({
    status: 201,
    description: 'Établissement créé avec succès',
    type: SchoolResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Code UAI déjà utilisé' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async createSchool(@Body() createSchoolDto: CreateSchoolDto): Promise<SchoolResponseDto> {
    return this.schoolsService.createSchool(createSchoolDto);
  }

  @Get()
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: 'Lister les établissements' })
  @ApiQuery({ name: 'search', required: false, description: 'Rechercher par nom ou ville' })
  @ApiQuery({ name: 'city', required: false, description: 'Filtrer par ville' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'level', required: false, description: 'Filtrer par niveau' })
  @ApiResponse({ status: 200, description: 'Liste des établissements', type: [SchoolResponseDto] })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async listSchools(@Query() filters: ListSchoolsDto): Promise<SchoolResponseDto[]> {
    return this.schoolsService.listSchools(filters);
  }

  @Get(':id')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: 'Récupérer un établissement par son ID' })
  @ApiResponse({ status: 200, description: 'Établissement trouvé', type: SchoolResponseDto })
  @ApiResponse({ status: 404, description: 'Établissement non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async getSchoolById(@Param('id') schoolId: string): Promise<SchoolResponseDto> {
    return this.schoolsService.getSchoolById(schoolId);
  }
}

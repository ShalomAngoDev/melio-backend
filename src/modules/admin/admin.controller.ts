import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';

@ApiTags('Admin Global')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('statistics/global')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: 'Obtenir les statistiques globales' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'year'],
    description: 'Période de filtrage',
  })
  @ApiResponse({ status: 200, description: 'Statistiques globales' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async getGlobalStats(@Query('period') period?: 'week' | 'month' | 'year') {
    return this.adminService.getGlobalStats(period);
  }

  @Get('statistics/temporal')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: 'Obtenir les statistiques temporelles globales' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'year'],
    description: 'Période de filtrage',
  })
  @ApiResponse({ status: 200, description: 'Statistiques temporelles globales' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async getGlobalTemporalStats(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    return this.adminService.getGlobalTemporalStats(period);
  }

  @Get('schools')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: 'Obtenir toutes les écoles' })
  @ApiResponse({ status: 200, description: 'Liste de toutes les écoles' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async getAllSchools() {
    return this.adminService.getAllSchools();
  }

  @Get('alerts')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: 'Obtenir toutes les alertes de toutes les écoles' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['NOUVELLE', 'EN_COURS', 'TRAITEE'],
    description: 'Filtrer par statut',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: "Nombre d'alertes à récupérer (défaut: 50)",
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Décalage pour la pagination (défaut: 0)',
  })
  @ApiResponse({ status: 200, description: 'Liste des alertes globales' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async getGlobalAlerts(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getGlobalAlerts(status, limit || 50, offset || 0);
  }

  @Get('reports')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: 'Obtenir tous les signalements de toutes les écoles' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['NOUVEAU', 'EN_COURS', 'TRAITE'],
    description: 'Filtrer par statut',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre de signalements à récupérer (défaut: 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Décalage pour la pagination (défaut: 0)',
  })
  @ApiResponse({ status: 200, description: 'Liste des signalements globaux' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async getGlobalReports(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getGlobalReports(status, limit || 50, offset || 0);
  }

  @Get('statistics/school/:schoolId')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: "Obtenir les statistiques d'une école spécifique" })
  @ApiResponse({ status: 200, description: "Statistiques de l'école" })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async getSchoolStats(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolStats(schoolId);
  }

  @Put('schools/:schoolId')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: 'Modifier une école' })
  @ApiResponse({ status: 200, description: 'École modifiée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async updateSchool(@Param('schoolId') schoolId: string, @Body() updateData: any) {
    return this.adminService.updateSchool(schoolId, updateData);
  }

  @Delete('schools/:schoolId')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: 'Supprimer une école' })
  @ApiResponse({ status: 200, description: 'École supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async deleteSchool(@Param('schoolId') schoolId: string) {
    return this.adminService.deleteSchool(schoolId);
  }

  @Post('schools/:schoolId/agents')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: 'Ajouter un agent à une école' })
  @ApiResponse({ status: 201, description: 'Agent ajouté avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async addAgentToSchool(
    @Param('schoolId') schoolId: string,
    @Body() agentData: { email: string; password: string },
  ) {
    return this.adminService.addAgentToSchool(schoolId, agentData);
  }

  @Get('schools/:schoolId/agents')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: "Obtenir les agents d'une école" })
  @ApiResponse({ status: 200, description: "Liste des agents de l'école" })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async getSchoolAgents(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolAgents(schoolId);
  }

  @Delete('schools/:schoolId/agents/:agentId')
  @Roles(Role.ROLE_ADMIN_MELIO)
  @ApiOperation({ summary: "Supprimer un agent d'une école" })
  @ApiResponse({ status: 200, description: 'Agent supprimé avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'Agent ou école non trouvé' })
  async removeAgentFromSchool(
    @Param('schoolId') schoolId: string,
    @Param('agentId') agentId: string,
  ) {
    return this.adminService.removeAgentFromSchool(schoolId, agentId);
  }
}

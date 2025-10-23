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
  @Roles(Role.ADMIN_MELIO)
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
  @Roles(Role.ADMIN_MELIO)
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
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: 'Obtenir toutes les écoles' })
  @ApiResponse({ status: 200, description: 'Liste de toutes les écoles' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async getAllSchools() {
    return this.adminService.getAllSchools();
  }

  @Get('alerts')
  @Roles(Role.ADMIN_MELIO)
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
  @Roles(Role.ADMIN_MELIO)
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
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: "Obtenir les statistiques d'une école spécifique" })
  @ApiResponse({ status: 200, description: "Statistiques de l'école" })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async getSchoolStats(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolStats(schoolId);
  }

  @Put('schools/:schoolId')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: 'Modifier une école' })
  @ApiResponse({ status: 200, description: 'École modifiée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async updateSchool(@Param('schoolId') schoolId: string, @Body() updateData: any) {
    return this.adminService.updateSchool(schoolId, updateData);
  }

  @Delete('schools/:schoolId')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: 'Supprimer une école' })
  @ApiResponse({ status: 200, description: 'École supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async deleteSchool(@Param('schoolId') schoolId: string) {
    return this.adminService.deleteSchool(schoolId);
  }

  @Post('schools/:schoolId/agents')
  @Roles(Role.ADMIN_MELIO)
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
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: "Obtenir les agents d'une école" })
  @ApiResponse({ status: 200, description: "Liste des agents de l'école" })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  async getSchoolAgents(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolAgents(schoolId);
  }

  @Post('schools/:schoolId/agents/assign')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: 'Assigner un agent existant à une école (V2)' })
  @ApiResponse({ status: 201, description: 'Agent assigné avec succès' })
  @ApiResponse({ status: 404, description: 'Agent ou école non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async assignAgentToSchool(
    @Param('schoolId') schoolId: string,
    @Body() data: { agentId: string },
  ) {
    return this.adminService.assignExistingAgentToSchool(schoolId, data.agentId);
  }

  @Delete('schools/:schoolId/agents/:agentId')
  @Roles(Role.ADMIN_MELIO)
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

  // ===== V2: GESTION GLOBALE DES AGENTS =====

  @Get('agents')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: 'Récupérer tous les agents avec leurs écoles (V2)' })
  @ApiResponse({ status: 200, description: 'Liste de tous les agents' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async getAllAgents() {
    return this.adminService.getAllAgents();
  }

  @Post('agents')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: "Créer un agent et l'attribuer à plusieurs écoles (V2)" })
  @ApiResponse({ status: 201, description: 'Agent créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async createGlobalAgent(
    @Body()
    agentData: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      schoolIds: string[];
    },
  ) {
    return this.adminService.createGlobalAgent(agentData);
  }

  @Put('agents/:agentId')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: 'Modifier un agent (nom, prénom, écoles) (V2)' })
  @ApiResponse({ status: 200, description: 'Agent modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Agent non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async updateAgent(
    @Param('agentId') agentId: string,
    @Body()
    updateData: {
      firstName?: string;
      lastName?: string;
      schoolIds?: string[];
    },
  ) {
    return this.adminService.updateAgent(agentId, updateData);
  }

  @Delete('agents/:agentId')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: 'Supprimer un agent complètement (V2)' })
  @ApiResponse({ status: 200, description: 'Agent supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Agent non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async deleteAgent(@Param('agentId') agentId: string) {
    return this.adminService.deleteAgent(agentId);
  }

  // ===== GESTION DES ÉLÈVES PAR L'ADMIN =====
  @Get('schools/:schoolId/students')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: "Lister les élèves d'une école (Admin)" })
  @ApiQuery({ name: 'search', required: false, description: 'Rechercher par nom ou prénom' })
  @ApiQuery({ name: 'className', required: false, description: 'Filtrer par classe' })
  @ApiResponse({ status: 200, description: 'Liste des élèves de l\'école' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async getSchoolStudents(
    @Param('schoolId') schoolId: string,
    @Query('search') search?: string,
    @Query('className') className?: string,
  ) {
    return this.adminService.getSchoolStudents(schoolId, { search, className });
  }

  @Post('schools/:schoolId/students')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: "Ajouter un élève à une école (Admin)" })
  @ApiResponse({ status: 201, description: 'Élève créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async createSchoolStudent(
    @Param('schoolId') schoolId: string,
    @Body()
    studentData: {
      firstName: string;
      lastName: string;
      birthdate: string;
      sex: 'M' | 'F';
      className: string;
      parentName?: string;
      parentPhone?: string;
      parentEmail?: string;
    },
  ) {
    return this.adminService.createSchoolStudent(schoolId, studentData);
  }

  @Put('schools/:schoolId/students/:studentId')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: "Modifier un élève d'une école (Admin)" })
  @ApiResponse({ status: 200, description: 'Élève modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Élève ou école non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async updateSchoolStudent(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
    @Body()
    updateData: {
      firstName?: string;
      lastName?: string;
      birthdate?: string;
      sex?: 'M' | 'F';
      className?: string;
      parentName?: string;
      parentPhone?: string;
      parentEmail?: string;
    },
  ) {
    return this.adminService.updateSchoolStudent(schoolId, studentId, updateData);
  }

  @Delete('schools/:schoolId/students/:studentId')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: "Supprimer un élève d'une école (Admin)" })
  @ApiResponse({ status: 200, description: 'Élève supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Élève ou école non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async deleteSchoolStudent(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.adminService.deleteSchoolStudent(schoolId, studentId);
  }

  @Post('schools/:schoolId/students/import')
  @Roles(Role.ADMIN_MELIO)
  @ApiOperation({ summary: "Importer des élèves depuis Excel (Admin)" })
  @ApiResponse({ status: 201, description: 'Import réussi' })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou données incorrectes' })
  @ApiResponse({ status: 404, description: 'École non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin Melio requis' })
  async importSchoolStudents(
    @Param('schoolId') schoolId: string,
    @Body() importData: { students: any[] },
  ) {
    return this.adminService.importSchoolStudents(schoolId, importData.students);
  }
}

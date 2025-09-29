import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';
import { AlertsService } from './alerts.service';
import { AlertResponseDto } from './dto/alert-response.dto';
import { CreateAlertCommentDto, AlertCommentResponseDto } from './dto/alert-comment.dto';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @Roles(Role.ROLE_AGENT)
  @ApiOperation({ summary: 'Récupérer les alertes de l\'établissement' })
  @ApiQuery({ name: 'status', required: false, enum: ['NOUVELLE', 'EN_COURS', 'TRAITEE'], description: 'Filtrer par statut' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'alertes à récupérer (défaut: 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Décalage pour la pagination (défaut: 0)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des alertes', 
    type: [AlertResponseDto] 
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Agent requis' })
  async getSchoolAlerts(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<AlertResponseDto[]> {
    return this.alertsService.getSchoolAlerts(
      req.user.schoolId,
      status,
      limit || 50,
      offset || 0,
    );
  }

  @Get('stats')
  @Roles(Role.ROLE_AGENT)
  @ApiOperation({ summary: 'Récupérer les statistiques des alertes' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques des alertes',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        nouvelles: { type: 'number' },
        enCours: { type: 'number' },
        traitees: { type: 'number' },
        parNiveau: {
          type: 'object',
          properties: {
            MOYEN: { type: 'number' },
            ELEVE: { type: 'number' },
            CRITIQUE: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Agent requis' })
  async getAlertStats(@Request() req: any) {
    return this.alertsService.getAlertStats(req.user.schoolId);
  }

  @Get(':id')
  @Roles(Role.ROLE_AGENT)
  @ApiOperation({ summary: 'Récupérer une alerte spécifique' })
  @ApiResponse({ 
    status: 200, 
    description: 'Alerte trouvée', 
    type: AlertResponseDto 
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Agent requis' })
  @ApiResponse({ status: 404, description: 'Alerte non trouvée' })
  async getAlert(
    @Param('id') alertId: string,
    @Request() req: any,
  ): Promise<AlertResponseDto> {
    return this.alertsService.getAlert(alertId, req.user.schoolId);
  }

  @Patch(':id/status')
  @Roles(Role.ROLE_AGENT)
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une alerte' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut de l\'alerte mis à jour', 
    type: AlertResponseDto 
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Agent requis' })
  @ApiResponse({ status: 404, description: 'Alerte non trouvée' })
  async updateAlertStatus(
    @Param('id') alertId: string,
    @Body('status') status: 'NOUVELLE' | 'EN_COURS' | 'TRAITEE',
    @Request() req: any,
  ): Promise<AlertResponseDto> {
    return this.alertsService.updateAlertStatus(alertId, req.user.schoolId, status);
  }

  @Patch(':id/status-with-comment')
  @Roles(Role.ROLE_AGENT)
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une alerte avec un commentaire obligatoire' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut de l\'alerte mis à jour avec commentaire', 
    type: AlertResponseDto 
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Agent requis' })
  @ApiResponse({ status: 404, description: 'Alerte non trouvée' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async updateAlertStatusWithComment(
    @Param('id') alertId: string,
    @Body() createCommentDto: CreateAlertCommentDto,
    @Request() req: any,
  ): Promise<AlertResponseDto> {
    return this.alertsService.updateAlertStatusWithComment(
      alertId,
      req.user.schoolId,
      req.user.sub,
      req.user.email, // Utiliser l'email comme nom d'agent
      createCommentDto,
    );
  }

  @Get(':id/comments')
  @Roles(Role.ROLE_AGENT)
  @ApiOperation({ summary: 'Récupérer les commentaires d\'une alerte' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des commentaires de l\'alerte', 
    type: [AlertCommentResponseDto] 
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Agent requis' })
  @ApiResponse({ status: 404, description: 'Alerte non trouvée' })
  async getAlertComments(
    @Param('id') alertId: string,
    @Request() req: any,
  ): Promise<AlertCommentResponseDto[]> {
    return this.alertsService.getAlertComments(alertId, req.user.schoolId);
  }
}

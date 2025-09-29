import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { JournalEntryResponseDto } from './dto/journal-entry-response.dto';

@ApiTags('Journal')
@Controller('students/:studentId/journal')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @Roles(Role.ROLE_STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une entrée de journal' })
  @ApiResponse({ 
    status: 201, 
    description: 'Entrée de journal créée avec succès', 
    type: JournalEntryResponseDto 
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async createJournalEntry(
    @Param('studentId') studentId: string,
    @Body() createJournalEntryDto: CreateJournalEntryDto,
    @Request() req: any,
  ): Promise<JournalEntryResponseDto> {
    // Vérifier que l'élève peut accéder à son propre journal
    if (req.user.sub !== studentId) {
      throw new Error('Accès non autorisé à ce journal');
    }

    return this.journalService.createJournalEntry(
      studentId,
      req.user.schoolId,
      createJournalEntryDto,
    );
  }

  @Get()
  @Roles(Role.ROLE_STUDENT)
  @ApiOperation({ summary: 'Récupérer les entrées de journal de l\'élève' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'entrées à récupérer (défaut: 10)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Décalage pour la pagination (défaut: 0)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des entrées de journal', 
    type: [JournalEntryResponseDto] 
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async getStudentJournalEntries(
    @Param('studentId') studentId: string,
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<JournalEntryResponseDto[]> {
    // Vérifier que l'élève peut accéder à son propre journal
    if (req.user.sub !== studentId) {
      throw new Error('Accès non autorisé à ce journal');
    }

    return this.journalService.getStudentJournalEntries(
      studentId,
      req.user.schoolId,
      limit || 10,
      offset || 0,
    );
  }

  @Get(':entryId')
  @Roles(Role.ROLE_STUDENT)
  @ApiOperation({ summary: 'Récupérer une entrée de journal spécifique' })
  @ApiResponse({ 
    status: 200, 
    description: 'Entrée de journal trouvée', 
    type: JournalEntryResponseDto 
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Entrée de journal non trouvée' })
  async getJournalEntry(
    @Param('studentId') studentId: string,
    @Param('entryId') entryId: string,
    @Request() req: any,
  ): Promise<JournalEntryResponseDto> {
    // Vérifier que l'élève peut accéder à son propre journal
    if (req.user.sub !== studentId) {
      throw new Error('Accès non autorisé à ce journal');
    }

    return this.journalService.getJournalEntry(
      entryId,
      studentId,
      req.user.schoolId,
    );
  }
}

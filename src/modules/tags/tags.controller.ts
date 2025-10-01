import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService, TagDto, CreateTagDto } from './tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Récupérer tous les tags' })
  @ApiResponse({
    status: 200,
    description: 'Liste des tags',
  })
  async findAll(@Query('category') category?: string): Promise<TagDto[]> {
    if (category) {
      return this.tagsService.findByCategory(category);
    }
    return this.tagsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un tag par ID' })
  async findOne(@Param('id') id: string): Promise<TagDto> {
    return this.tagsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_MELIO, Role.AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau tag (admin/agent)' })
  async create(@Body() data: CreateTagDto): Promise<TagDto> {
    return this.tagsService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_MELIO, Role.AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un tag (admin/agent)' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<CreateTagDto>,
  ): Promise<TagDto> {
    return this.tagsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_MELIO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un tag (admin uniquement)' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.tagsService.remove(id);
    return { message: 'Tag supprimé avec succès' };
  }

  @Get('stats/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT, Role.ADMIN_MELIO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statistiques des tags pour un élève' })
  async getStudentStats(@Param('studentId') studentId: string) {
    return this.tagsService.getStudentTagStats(studentId);
  }
}


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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  LibraryService,
  LibraryResourceDto,
  CreateLibraryResourceDto,
  UpdateLibraryResourceDto,
  LibraryResourceFilters,
} from './library.service';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  async getResources(
    @Request() req: any,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<LibraryResourceDto[]> {
    const schoolId = req.user.schoolId;

    const filters: LibraryResourceFilters = {
      category,
      type,
      isFeatured: featured === 'true',
      search,
      tags: tags ? tags.split(',') : undefined,
    };

    return this.libraryService.getResources(
      schoolId,
      filters,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('featured')
  async getFeaturedResources(
    @Request() req: any,
    @Query('limit') limit?: string,
  ): Promise<LibraryResourceDto[]> {
    const schoolId = req.user.schoolId;
    return this.libraryService.getFeaturedResources(schoolId, limit ? parseInt(limit) : 5);
  }

  @Get('category/:category')
  async getResourcesByCategory(
    @Request() req: any,
    @Param('category') category: string,
  ): Promise<LibraryResourceDto[]> {
    const schoolId = req.user.schoolId;
    return this.libraryService.getResourcesByCategory(schoolId, category);
  }

  @Get(':id')
  async getResourceById(@Request() req: any, @Param('id') id: string): Promise<LibraryResourceDto> {
    const schoolId = req.user.schoolId;
    return this.libraryService.getResourceById(id, schoolId);
  }

  @Post()
  async createResource(
    @Request() req: any,
    @Body() data: CreateLibraryResourceDto,
  ): Promise<LibraryResourceDto> {
    const schoolId = req.user.schoolId;
    return this.libraryService.createResource(schoolId, data);
  }

  @Put(':id')
  async updateResource(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateLibraryResourceDto,
  ): Promise<LibraryResourceDto> {
    const schoolId = req.user.schoolId;
    return this.libraryService.updateResource(id, schoolId, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResource(@Request() req: any, @Param('id') id: string): Promise<void> {
    const schoolId = req.user.schoolId;
    return this.libraryService.deleteResource(id, schoolId);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recordView(@Request() req: any, @Param('id') id: string): Promise<void> {
    const studentId = req.user.sub;
    return this.libraryService.recordView(id, studentId);
  }

  @Post(':id/rate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rateResource(
    @Request() req: any,
    @Param('id') id: string,
    @Body('rating') rating: number,
  ): Promise<void> {
    const studentId = req.user.sub;
    return this.libraryService.rateResource(id, studentId, rating);
  }

  @Post(':id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addToFavorites(@Request() req: any, @Param('id') id: string): Promise<void> {
    const studentId = req.user.sub;
    return this.libraryService.addToFavorites(id, studentId);
  }

  @Delete(':id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromFavorites(@Request() req: any, @Param('id') id: string): Promise<void> {
    const studentId = req.user.sub;
    return this.libraryService.removeFromFavorites(id, studentId);
  }

  @Get('favorites/my')
  async getStudentFavorites(@Request() req: any): Promise<LibraryResourceDto[]> {
    const studentId = req.user.sub;
    const schoolId = req.user.schoolId;
    return this.libraryService.getStudentFavorites(studentId, schoolId);
  }
}

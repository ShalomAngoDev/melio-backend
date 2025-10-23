import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface LibraryResourceDto {
  id: string;
  title: string;
  type: 'video' | 'testimony' | 'book' | 'article';
  category: 'bullying' | 'emotions' | 'friendship' | 'self-esteem' | 'help';
  description: string;
  content?: string;
  duration?: string;
  author?: string;
  rating: number;
  views: number;
  thumbnail?: string;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLibraryResourceDto {
  title: string;
  type: 'video' | 'testimony' | 'book' | 'article';
  category: 'bullying' | 'emotions' | 'friendship' | 'self-esteem' | 'help';
  description: string;
  content?: string;
  duration?: string;
  author?: string;
  thumbnail?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  metadata?: any;
}

export interface UpdateLibraryResourceDto extends Partial<CreateLibraryResourceDto> {
  rating?: number;
  views?: number;
}

export interface LibraryResourceFilters {
  category?: string;
  type?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  tags?: string[];
}

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getResources(
    schoolId: string,
    filters: LibraryResourceFilters = {},
    limit: number = 20,
    offset: number = 0,
  ): Promise<LibraryResourceDto[]> {
    const where: any = {
      schoolId,
      isActive: true,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { author: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    const resources = await this.prisma.libraryResource.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    return resources.map(this.mapToDto);
  }

  async getResourceById(id: string, schoolId: string): Promise<LibraryResourceDto> {
    const resource = await this.prisma.libraryResource.findFirst({
      where: {
        id,
        schoolId,
        isActive: true,
      },
    });

    if (!resource) {
      throw new NotFoundException('Ressource non trouvée');
    }

    return this.mapToDto(resource);
  }

  async getFeaturedResources(schoolId: string, limit: number = 5): Promise<LibraryResourceDto[]> {
    const resources = await this.prisma.libraryResource.findMany({
      where: {
        schoolId,
        isActive: true,
        isFeatured: true,
      },
      orderBy: [{ rating: 'desc' }, { views: 'desc' }],
      take: limit,
    });

    return resources.map(this.mapToDto);
  }

  async getResourcesByCategory(schoolId: string, category: string): Promise<LibraryResourceDto[]> {
    const resources = await this.prisma.libraryResource.findMany({
      where: {
        schoolId,
        category,
        isActive: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }, { views: 'desc' }],
    });

    return resources.map(this.mapToDto);
  }

  async createResource(
    schoolId: string,
    data: CreateLibraryResourceDto,
  ): Promise<LibraryResourceDto> {
    const resource = await this.prisma.libraryResource.create({
      data: {
        ...data,
        schoolId,
        tags: data.tags || [],
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    return this.mapToDto(resource);
  }

  async updateResource(
    id: string,
    schoolId: string,
    data: UpdateLibraryResourceDto,
  ): Promise<LibraryResourceDto> {
    const resource = await this.prisma.libraryResource.findFirst({
      where: { id, schoolId },
    });

    if (!resource) {
      throw new NotFoundException('Ressource non trouvée');
    }

    const updatedResource = await this.prisma.libraryResource.update({
      where: { id },
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });

    return this.mapToDto(updatedResource);
  }

  async deleteResource(id: string, schoolId: string): Promise<void> {
    const resource = await this.prisma.libraryResource.findFirst({
      where: { id, schoolId },
    });

    if (!resource) {
      throw new NotFoundException('Ressource non trouvée');
    }

    await this.prisma.libraryResource.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async recordView(resourceId: string, studentId: string): Promise<void> {
    try {
      await this.prisma.studentResourceView.upsert({
        where: {
          studentId_resourceId: {
            studentId,
            resourceId,
          },
        },
        update: {
          viewedAt: new Date(),
        },
        create: {
          studentId,
          resourceId,
        },
      });

      // Incrémenter le compteur de vues
      await this.prisma.libraryResource.update({
        where: { id: resourceId },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Erreur lors de l'enregistrement de la vue: ${error.message}`);
    }
  }

  async rateResource(resourceId: string, studentId: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('La note doit être entre 1 et 5');
    }

    await this.prisma.studentResourceRating.upsert({
      where: {
        studentId_resourceId: {
          studentId,
          resourceId,
        },
      },
      update: {
        rating,
      },
      create: {
        studentId,
        resourceId,
        rating,
      },
    });

    // Recalculer la note moyenne
    await this.updateResourceRating(resourceId);
  }

  async addToFavorites(resourceId: string, studentId: string): Promise<void> {
    await this.prisma.studentResourceFavorite.upsert({
      where: {
        studentId_resourceId: {
          studentId,
          resourceId,
        },
      },
      update: {},
      create: {
        studentId,
        resourceId,
      },
    });
  }

  async removeFromFavorites(resourceId: string, studentId: string): Promise<void> {
    await this.prisma.studentResourceFavorite.deleteMany({
      where: {
        studentId,
        resourceId,
      },
    });
  }

  async getStudentFavorites(studentId: string, schoolId: string): Promise<LibraryResourceDto[]> {
    const favorites = await this.prisma.studentResourceFavorite.findMany({
      where: {
        studentId,
        resource: {
          schoolId,
          isActive: true,
        },
      },
      include: {
        resource: true,
      },
      orderBy: {
        favoritedAt: 'desc',
      },
    });

    return favorites.map((fav) => this.mapToDto(fav.resource));
  }

  private async updateResourceRating(resourceId: string): Promise<void> {
    const ratings = await this.prisma.studentResourceRating.findMany({
      where: { resourceId },
      select: { rating: true },
    });

    if (ratings.length > 0) {
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

      await this.prisma.libraryResource.update({
        where: { id: resourceId },
        data: { rating: Math.round(averageRating * 10) / 10 },
      });
    }
  }

  private mapToDto(resource: any): LibraryResourceDto {
    return {
      id: resource.id,
      title: resource.title,
      type: resource.type,
      category: resource.category,
      description: resource.description,
      content: resource.content,
      duration: resource.duration,
      author: resource.author,
      rating: resource.rating,
      views: resource.views,
      thumbnail: resource.thumbnail,
      isActive: resource.isActive,
      isFeatured: resource.isFeatured,
      tags: resource.tags,
      metadata: resource.metadata ? JSON.parse(resource.metadata) : null,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }
}

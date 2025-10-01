import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface TagDto {
  id: string;
  name: string;
  icon?: string;
  color: string;
  category?: string;
}

export interface CreateTagDto {
  name: string;
  icon?: string;
  color?: string;
  category?: string;
}

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupérer tous les tags
   */
  async findAll(): Promise<TagDto[]> {
    const tags = await this.prisma.tag.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return tags;
  }

  /**
   * Récupérer un tag par ID
   */
  async findOne(id: string): Promise<TagDto> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag ${id} introuvable`);
    }

    return tag;
  }

  /**
   * Récupérer les tags par catégorie
   */
  async findByCategory(category: string): Promise<TagDto[]> {
    return this.prisma.tag.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Créer un nouveau tag (admin uniquement)
   */
  async create(data: CreateTagDto): Promise<TagDto> {
    return this.prisma.tag.create({
      data: {
        name: data.name,
        icon: data.icon,
        color: data.color || '#ec4899',
        category: data.category,
      },
    });
  }

  /**
   * Mettre à jour un tag (admin uniquement)
   */
  async update(id: string, data: Partial<CreateTagDto>): Promise<TagDto> {
    // Vérifier que le tag existe
    await this.findOne(id);

    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  /**
   * Supprimer un tag (admin uniquement)
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.tag.delete({
      where: { id },
    });
  }

  /**
   * Récupérer les tags d'une entrée de journal
   */
  async getEntryTags(entryId: string): Promise<TagDto[]> {
    const entryTags = await this.prisma.journalEntryTag.findMany({
      where: { journalEntryId: entryId },
      include: { tag: true },
    });

    return entryTags.map((et) => et.tag);
  }

  /**
   * Associer des tags à une entrée de journal
   */
  async addTagsToEntry(entryId: string, tagIds: string[]): Promise<void> {
    // Supprimer les tags existants
    await this.prisma.journalEntryTag.deleteMany({
      where: { journalEntryId: entryId },
    });

    // Ajouter les nouveaux tags
    if (tagIds.length > 0) {
      await this.prisma.journalEntryTag.createMany({
        data: tagIds.map((tagId) => ({
          journalEntryId: entryId,
          tagId,
        })),
        skipDuplicates: true,
      });
    }

    this.logger.log(`Tags mis à jour pour l'entrée ${entryId}: ${tagIds.length} tags`);
  }

  /**
   * Retirer un tag d'une entrée
   */
  async removeTagFromEntry(entryId: string, tagId: string): Promise<void> {
    await this.prisma.journalEntryTag.delete({
      where: {
        journalEntryId_tagId: {
          journalEntryId: entryId,
          tagId,
        },
      },
    });
  }

  /**
   * Rechercher des entrées par tags
   */
  async findEntriesByTags(studentId: string, tagIds: string[]): Promise<string[]> {
    const entries = await this.prisma.journalEntryTag.findMany({
      where: {
        tagId: { in: tagIds },
        journalEntry: {
          studentId,
        },
      },
      select: {
        journalEntryId: true,
      },
      distinct: ['journalEntryId'],
    });

    return entries.map((e) => e.journalEntryId);
  }

  /**
   * Statistiques des tags pour un élève
   */
  async getStudentTagStats(studentId: string): Promise<
    Array<{
      tag: TagDto;
      count: number;
    }>
  > {
    const tagCounts = await this.prisma.journalEntryTag.groupBy({
      by: ['tagId'],
      where: {
        journalEntry: {
          studentId,
        },
      },
      _count: true,
    });

    const tagsWithCounts = await Promise.all(
      tagCounts.map(async (tc) => {
        const tag = await this.prisma.tag.findUnique({
          where: { id: tc.tagId },
        });
        return {
          tag: tag!,
          count: tc._count,
        };
      }),
    );

    return tagsWithCounts.sort((a, b) => b.count - a.count);
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { SchoolCodeGeneratorService } from './school-code-generator.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { SchoolResponseDto } from './dto/school-response.dto';
import { ListSchoolsDto } from './dto/list-schools.dto';
import * as crypto from 'crypto';

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerator: SchoolCodeGeneratorService,
  ) {}

  /**
   * Crée un nouvel établissement
   */
  async createSchool(createSchoolDto: CreateSchoolDto): Promise<SchoolResponseDto> {
    const {
      name,
      address1,
      address2,
      postalCode,
      city,
      country = 'FR',
      timezone = 'Europe/Paris',
      level,
      uaiCode,
      contactName,
      contactEmail,
      contactPhone,
      settings,
    } = createSchoolDto;

    // 1. Valider le code postal français
    if (country === 'FR' && !this.isValidFrenchPostalCode(postalCode)) {
      throw new BadRequestException('Code postal français invalide (5 chiffres requis)');
    }

    // 2. Vérifier l'unicité du code UAI si fourni
    if (uaiCode) {
      const existingUai = await this.prisma.school.findUnique({
        where: { uaiCode },
      });
      if (existingUai) {
        throw new ConflictException('Un établissement avec ce code UAI existe déjà');
      }
    }

    // 3. Récupérer les codes existants pour éviter les collisions
    const existingCodes = await this.prisma.school
      .findMany({
        select: { code: true },
      })
      .then((schools) => schools.map((s) => s.code));

    // 4. Générer un code d'établissement unique
    const schoolCode = this.codeGenerator.generateUniqueSchoolCode(name, postalCode, existingCodes);

    // 5. Générer une clé secrète pour les identifiants élèves
    const idKey = crypto.randomBytes(32).toString('base64url');

    // 6. Normaliser les données
    const normalizedData = this.normalizeSchoolData({
      name,
      address1,
      address2,
      postalCode,
      city,
      country,
      timezone,
      level,
      uaiCode,
      contactName,
      contactEmail,
      contactPhone,
      settings,
    });

    // 7. Créer l'établissement
    const school = await this.prisma.school.create({
      data: {
        code: schoolCode,
        idKey,
        idKeyVer: 1,
        ...normalizedData,
      },
    });

    // 8. Log d'audit (sans données sensibles)
    this.logger.log(`School created: ${school.id} with code ${schoolCode}`);

    return this.mapToResponseDto(school);
  }

  /**
   * Liste les établissements avec filtres optionnels
   */
  async listSchools(filters: ListSchoolsDto): Promise<SchoolResponseDto[]> {
    const where: any = {};

    // Filtre par statut
    if (filters.status) {
      where.status = filters.status;
    }

    // Filtre par niveau
    if (filters.level) {
      where.level = filters.level;
    }

    // Filtre par ville
    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    // Recherche par nom ou ville
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { city: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const schools = await this.prisma.school.findMany({
      where,
      orderBy: [{ name: 'asc' }],
    });

    return schools.map((school) => this.mapToResponseDto(school));
  }

  /**
   * Récupère un établissement par son ID
   */
  async getSchoolById(schoolId: string): Promise<SchoolResponseDto> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('Établissement non trouvé');
    }

    return this.mapToResponseDto(school);
  }

  /**
   * Valide un code postal français
   */
  private isValidFrenchPostalCode(postalCode: string): boolean {
    const digits = postalCode.replace(/\D/g, '');
    return digits.length === 5;
  }

  /**
   * Normalise les données de l'établissement
   */
  private normalizeSchoolData(data: {
    name: string;
    address1: string;
    address2?: string;
    postalCode: string;
    city: string;
    country: string;
    timezone: string;
    level?: string;
    uaiCode?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    settings?: any;
  }) {
    return {
      name: data.name.trim(),
      address1: data.address1.trim(),
      address2: data.address2?.trim() || null,
      postalCode: data.postalCode.trim(),
      city: data.city.trim(),
      country: data.country.toUpperCase(),
      timezone: data.timezone,
      level: data.level || null,
      uaiCode: data.uaiCode?.toUpperCase() || null,
      contactName: data.contactName?.trim() || null,
      contactEmail: data.contactEmail?.trim().toLowerCase() || null,
      contactPhone: data.contactPhone?.trim() || null,
      settings: data.settings ? JSON.stringify(data.settings) : null,
    };
  }

  /**
   * Mappe l'entité School vers SchoolResponseDto
   */
  private mapToResponseDto(school: any): SchoolResponseDto {
    return {
      id: school.id,
      code: school.code,
      name: school.name,
      address1: school.address1,
      address2: school.address2,
      postalCode: school.postalCode,
      city: school.city,
      country: school.country,
      timezone: school.timezone,
      level: school.level,
      uaiCode: school.uaiCode,
      contactName: school.contactName,
      contactEmail: school.contactEmail,
      contactPhone: school.contactPhone,
      settings: school.settings ? JSON.parse(school.settings) : null,
      status: school.status,
      createdAt: school.createdAt.toISOString(),
      updatedAt: school.updatedAt.toISOString(),
    };
  }
}

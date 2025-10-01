import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { StudentIdGeneratorService } from './student-id-generator.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { ListStudentsDto } from './dto/list-students.dto';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGenerator: StudentIdGeneratorService,
  ) {}

  /**
   * Crée un nouvel élève
   */
  async createStudent(
    createStudentDto: CreateStudentDto,
    agentSchoolId: string,
  ): Promise<StudentResponseDto> {
    const {
      schoolCode,
      firstName,
      lastName,
      birthdate,
      sex,
      className,
      parentName,
      parentPhone,
      parentEmail,
    } = createStudentDto;

    // 1. Vérifier que l'établissement existe et récupérer la clé secrète
    const school = await this.prisma.school.findUnique({
      where: { code: schoolCode },
    });

    if (!school) {
      throw new NotFoundException('Établissement non trouvé');
    }

    // 2. Vérifier que l'agent appartient à cet établissement
    if (school.id !== agentSchoolId) {
      throw new ForbiddenException('Vous ne pouvez créer des élèves que dans votre établissement');
    }

    // 3. Valider l'âge de l'élève (moins de 21 ans)
    const birthDate = new Date(birthdate);
    const age = this.calculateAge(birthDate);
    if (age >= 21) {
      throw new BadRequestException("L'élève doit avoir moins de 21 ans");
    }

    // 4. Normaliser les données
    const normalizedData = this.normalizeStudentData({
      firstName,
      lastName,
      birthdate,
      sex,
      className,
      parentName,
      parentPhone,
      parentEmail,
    });

    // 5. Récupérer les IDs existants pour éviter les collisions
    const existingIds = await this.prisma.student
      .findMany({
        where: { schoolId: school.id },
        select: { uniqueId: true },
      })
      .then((students) => students.map((s) => s.uniqueId));

    // 6. Générer un identifiant unique
    const uniqueId = this.idGenerator.generateUniqueStudentId(
      schoolCode,
      normalizedData.lastName,
      normalizedData.firstName,
      birthdate,
      school.idKey,
      existingIds,
    );

    // 7. Créer l'élève
    const student = await this.prisma.student.create({
      data: {
        schoolId: school.id,
        firstName: normalizedData.firstName,
        lastName: normalizedData.lastName,
        birthdate: birthDate,
        sex: normalizedData.sex,
        className: normalizedData.className,
        parentName: normalizedData.parentName,
        parentPhone: normalizedData.parentPhone,
        parentEmail: normalizedData.parentEmail,
        uniqueId,
        uniqueIdVer: school.idKeyVer,
      },
    });

    // 8. Log d'audit (sans données sensibles)
    this.logger.log(`Student created: ${student.id} in school ${schoolCode}`);

    return this.mapToResponseDto(student);
  }

  /**
   * Liste les élèves d'un établissement avec filtres optionnels
   */
  async listStudents(schoolId: string, filters: ListStudentsDto): Promise<StudentResponseDto[]> {
    const where: any = { schoolId };

    // Filtre par classe
    if (filters.className) {
      where.className = filters.className;
    }

    // Recherche par nom ou prénom
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      where.OR = [{ firstName: { contains: searchTerm } }, { lastName: { contains: searchTerm } }];
    }

    const students = await this.prisma.student.findMany({
      where,
      orderBy: [{ className: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
    });

    return students.map((student) => this.mapToResponseDto(student));
  }

  /**
   * Récupère un élève par son ID
   */
  async getStudentById(studentId: string, schoolId: string): Promise<StudentResponseDto> {
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: schoolId,
      },
    });

    if (!student) {
      throw new NotFoundException('Élève non trouvé');
    }

    return this.mapToResponseDto(student);
  }

  /**
   * Calcule l'âge à partir de la date de naissance
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Normalise les données de l'élève
   */
  private normalizeStudentData(data: {
    firstName: string;
    lastName: string;
    birthdate: string;
    sex: string;
    className: string;
    parentName?: string;
    parentPhone: string;
    parentEmail?: string;
  }) {
    return {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      birthdate: data.birthdate,
      sex: data.sex.toUpperCase(),
      className: data.className.trim(),
      parentName: data.parentName?.trim() || null,
      parentPhone: data.parentPhone.trim(),
      parentEmail: data.parentEmail?.trim() || null,
    };
  }

  /**
   * Mappe l'entité Student vers StudentResponseDto
   */
  private mapToResponseDto(student: any): StudentResponseDto {
    return {
      id: student.id,
      schoolId: student.schoolId,
      firstName: student.firstName,
      lastName: student.lastName,
      birthdate: student.birthdate.toISOString().split('T')[0], // Format YYYY-MM-DD
      sex: student.sex,
      className: student.className,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      uniqueId: student.uniqueId,
      createdAt: student.createdAt.toISOString(),
    };
  }
}

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { ListStudentsDto } from './dto/list-students.dto';
import { Role } from '../auth/decorators/role.enum';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.AGENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouvel élève' })
  @ApiResponse({ status: 201, description: 'Élève créé avec succès', type: StudentResponseDto })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Établissement non trouvé' })
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
    @Request() req: any,
  ): Promise<StudentResponseDto> {
    return this.studentsService.createStudent(createStudentDto, req.user.schoolId);
  }

  @Get()
  @Roles(Role.AGENT)
  @ApiOperation({ summary: "Lister les élèves de l'établissement" })
  @ApiQuery({ name: 'className', required: false, description: 'Filtrer par classe' })
  @ApiQuery({ name: 'search', required: false, description: 'Rechercher par nom ou prénom' })
  @ApiResponse({ status: 200, description: 'Liste des élèves', type: [StudentResponseDto] })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async listStudents(
    @Query() filters: ListStudentsDto,
    @Request() req: any,
  ): Promise<StudentResponseDto[]> {
    return this.studentsService.listStudents(req.user.schoolId, filters);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: "Récupérer le profil de l'élève connecté" })
  @ApiResponse({ status: 200, description: "Profil de l'élève", type: StudentResponseDto })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async getMyProfile(@Request() req: any): Promise<StudentResponseDto> {
    return this.studentsService.getStudentById(req.user.sub, req.user.schoolId);
  }

  @Get(':id')
  @Roles(Role.AGENT)
  @ApiOperation({ summary: 'Récupérer un élève par son ID' })
  @ApiResponse({ status: 200, description: 'Élève trouvé', type: StudentResponseDto })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Élève non trouvé' })
  async getStudentById(
    @Param('id') studentId: string,
    @Request() req: any,
  ): Promise<StudentResponseDto> {
    return this.studentsService.getStudentById(studentId, req.user.schoolId);
  }
}

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import { RedisService } from '../../config/redis.service';
import { StudentLoginDto } from './dto/student-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  // ===== STUDENT AUTHENTICATION =====
  async validateStudent(studentLoginDto: StudentLoginDto): Promise<AuthResponseDto> {
    const { schoolCode, studentIdentifier } = studentLoginDto;

    this.logger.log(
      `🔍 Tentative de connexion élève - Code école: ${schoolCode}, Identifiant: ${studentIdentifier}`,
    );

    const school = await this.prisma.school.findUnique({
      where: { code: schoolCode },
    });

    if (!school) {
      this.logger.warn(`❌ Code établissement invalide: ${schoolCode}`);
      throw new UnauthorizedException('Code établissement invalide');
    }

    this.logger.log(`✅ École trouvée: ${school.name} (ID: ${school.id})`);

    const student = await this.prisma.student.findFirst({
      where: {
        schoolId: school.id,
        uniqueId: studentIdentifier,
      },
      include: { school: true },
    });

    if (!student) {
      this.logger.warn(
        `❌ Identifiant élève invalide: ${studentIdentifier} pour l'école ${school.name}`,
      );

      // Log tous les élèves de cette école pour debug
      const allStudents = await this.prisma.student.findMany({
        where: { schoolId: school.id },
        select: { uniqueId: true, firstName: true, lastName: true },
      });
      this.logger.log(`📋 Élèves disponibles dans ${school.name}: ${JSON.stringify(allStudents)}`);

      throw new UnauthorizedException('Identifiant élève invalide');
    }

    this.logger.log(
      `✅ Élève trouvé: ${student.firstName} ${student.lastName} (ID: ${student.id})`,
    );

    const payload = {
      sub: student.id,
      type: 'student',
      role: 'ROLE_STUDENT',
      schoolId: student.schoolId,
      schoolCode: school.code,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token in Redis
    await this.redis.set(`refresh_token:${student.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    this.logger.log(`Student ${studentIdentifier} connected from school ${schoolCode}`);

    return {
      accessToken,
      refreshToken,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        className: student.className,
      },
    };
  }

  // ===== STAFF AUTHENTICATION (V2) - Agents & Admins =====
  async staffLogin(email: string, password: string, ip?: string): Promise<AuthResponseDto> {
    const logPrefix = `[StaffLogin] [${ip || 'unknown'}]`;

    // Validation préalable
    if (!email || !password) {
      this.logger.warn(`${logPrefix} Tentative de connexion avec champs vides`);
      throw new UnauthorizedException('Email et mot de passe requis');
    }

    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Chercher d'abord dans les admins
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (admin) {
      // C'est un admin
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        this.logger.warn(
          `${logPrefix} Échec de connexion admin: ${normalizedEmail} - Mot de passe invalide`,
        );
        throw new UnauthorizedException('Mot de passe invalide');
      }

      const payload = {
        sub: admin.id,
        type: 'admin',
        email: admin.email,
        role: admin.role,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      });

      await this.redis.set(`refresh_token:${admin.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

      this.logger.log(`${logPrefix} ✅ Admin connecté: ${normalizedEmail}`);

      return {
        accessToken,
        refreshToken,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
      };
    }

    // 2. Sinon, chercher dans les agents
    const agent = await this.prisma.agentUser.findUnique({
      where: { email: normalizedEmail },
      include: {
        schools: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!agent) {
      this.logger.warn(`${logPrefix} Échec de connexion: Email ${normalizedEmail} non trouvé`);
      // Ne pas révéler si c'est l'email ou le mot de passe qui est incorrect (sécurité)
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      this.logger.warn(
        `${logPrefix} Échec de connexion agent: ${normalizedEmail} - Mot de passe invalide`,
      );
      throw new UnauthorizedException('Mot de passe invalide');
    }

    // Récupérer toutes les écoles de l'agent
    const schools = agent.schools.map((as) => ({
      id: as.school.id,
      code: as.school.code,
      name: as.school.name,
    }));

    if (schools.length === 0) {
      this.logger.warn(`${logPrefix} Agent ${normalizedEmail} n'a aucune école associée`);
      throw new UnauthorizedException("Cet agent n'est associé à aucune école");
    }

    // Par défaut, utiliser la première école (l'utilisateur pourra changer ensuite)
    const defaultSchool = schools[0];

    const payload = {
      sub: agent.id,
      type: 'agent',
      email: agent.email,
      role: agent.role,
      schoolId: defaultSchool.id,
      schoolCode: defaultSchool.code,
      schools: schools.map((s) => ({ id: s.id, code: s.code })),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    await this.redis.set(`refresh_token:${agent.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    this.logger.log(
      `${logPrefix} ✅ Agent connecté: ${normalizedEmail} (${schools.length} école(s): ${schools.map((s) => s.code).join(', ')})`,
    );

    return {
      accessToken,
      refreshToken,
      agent: {
        id: agent.id,
        email: agent.email,
        role: agent.role,
        schools,
        currentSchoolId: defaultSchool.id,
      },
    };
  }

  // ===== REFRESH TOKEN =====
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token exists in Redis
      const storedToken = await this.redis.get(`refresh_token:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      // Generate new tokens
      const newAccessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          type: payload.type,
          email: payload.email,
          role: payload.role,
          schoolId: payload.schoolId,
          schoolCode: payload.schoolCode,
        },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
        },
      );

      const newRefreshToken = this.jwtService.sign(
        {
          sub: payload.sub,
          type: payload.type,
          email: payload.email,
          role: payload.role,
          schoolId: payload.schoolId,
          schoolCode: payload.schoolCode,
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      );

      // Update refresh token in Redis
      await this.redis.set(`refresh_token:${payload.sub}`, newRefreshToken, 'EX', 7 * 24 * 60 * 60);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  // ===== LOGOUT =====
  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
    this.logger.log(`User ${userId} logged out`);
  }
}

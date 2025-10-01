import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import { RedisService } from '../../config/redis.service';
import { StudentLoginDto } from './dto/student-login.dto';
import { AgentLoginDto } from './dto/agent-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
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

    const school = await this.prisma.school.findUnique({
      where: { code: schoolCode },
    });

    if (!school) {
      throw new UnauthorizedException('Code établissement invalide');
    }

    const student = await this.prisma.student.findFirst({
      where: {
        schoolId: school.id,
        uniqueId: studentIdentifier,
      },
      include: { school: true },
    });

    if (!student) {
      throw new UnauthorizedException('Identifiant élève invalide');
    }

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

  // ===== AGENT AUTHENTICATION =====
  async validateAgent(agentLoginDto: AgentLoginDto): Promise<AuthResponseDto> {
    const { schoolCode, email, password } = agentLoginDto;

    const school = await this.prisma.school.findUnique({
      where: { code: schoolCode },
    });

    if (!school) {
      throw new UnauthorizedException('Code établissement invalide');
    }

    const agent = await this.prisma.agentUser.findFirst({
      where: {
        schoolId: school.id,
        email: email,
      },
      include: { school: true },
    });

    if (!agent) {
      throw new UnauthorizedException('Email invalide');
    }

    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe invalide');
    }

    const payload = {
      sub: agent.id,
      type: 'agent',
      email: agent.email,
      role: agent.role,
      schoolId: agent.schoolId,
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
    await this.redis.set(`refresh_token:${agent.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    this.logger.log(`Agent ${email} connected from school ${schoolCode}`);

    return {
      accessToken,
      refreshToken,
      agent: {
        id: agent.id,
        email: agent.email,
        schoolId: agent.schoolId,
        role: agent.role,
      },
    };
  }

  // ===== ADMIN AUTHENTICATION =====
  async validateAdmin(adminLoginDto: AdminLoginDto): Promise<AuthResponseDto> {
    const { email, password } = adminLoginDto;

    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
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

    // Store refresh token in Redis
    await this.redis.set(`refresh_token:${admin.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    this.logger.log(`Admin ${email} connected`);

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

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { StudentLoginDto } from './dto/student-login.dto';
import { StaffLoginDto } from './dto/staff-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ===== STUDENT AUTHENTICATION =====
  @Post('student/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion élève' })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Code établissement ou identifiant invalide' })
  async studentLogin(@Body() studentLoginDto: StudentLoginDto): Promise<AuthResponseDto> {
    return this.authService.validateStudent(studentLoginDto);
  }

  // ===== STAFF AUTHENTICATION (V2) - Agents & Admins =====
  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives par minute
  @ApiOperation({
    summary: 'Connexion Staff (Agents & Admins)',
    description:
      'Authentification sécurisée pour le personnel. Détecte automatiquement le rôle (Agent/Admin). Rate limiting: 5 tentatives/minute par IP.',
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie - détecte automatiquement agent ou admin',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe invalide' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives de connexion' })
  async staffLogin(
    @Body() staffLoginDto: StaffLoginDto,
    @Request() req: any,
  ): Promise<AuthResponseDto> {
    return this.authService.staffLogin(staffLoginDto.email, staffLoginDto.password, req.ip);
  }

  // ===== REFRESH TOKEN =====
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le token' })
  @ApiResponse({ status: 200, description: 'Token rafraîchi', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token invalide' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  // ===== LOGOUT =====
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  @ApiResponse({ status: 401, description: 'Token invalide' })
  async logout(@Request() req: any): Promise<{ message: string }> {
    await this.authService.logout(req.user.sub);
    return { message: 'Déconnexion réussie' };
  }

  // ===== PROFILE =====
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Profil de l'utilisateur connecté" })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Token invalide' })
  async getProfile(@Request() req: any): Promise<any> {
    return {
      id: req.user.sub,
      type: req.user.type,
      email: req.user.email,
      role: req.user.role,
      schoolId: req.user.schoolId,
      schoolCode: req.user.schoolCode,
    };
  }
}

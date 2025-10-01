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
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { StudentLoginDto } from './dto/student-login.dto';
import { AgentLoginDto } from './dto/agent-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
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

  // ===== AGENT AUTHENTICATION =====
  @Post('agent/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Connexion agent d'établissement" })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Code établissement, email ou mot de passe invalide' })
  async agentLogin(@Body() agentLoginDto: AgentLoginDto): Promise<AuthResponseDto> {
    return this.authService.validateAgent(agentLoginDto);
  }

  // ===== ADMIN AUTHENTICATION =====
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion admin Melio' })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe invalide' })
  async adminLogin(@Body() adminLoginDto: AdminLoginDto): Promise<AuthResponseDto> {
    return this.authService.validateAdmin(adminLoginDto);
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

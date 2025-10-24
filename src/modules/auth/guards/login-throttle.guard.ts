import { Injectable, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Guard de throttling spécifique pour les connexions
 * Protège contre les attaques par force brute
 * - 5 tentatives par minute par IP
 * - 10 tentatives par heure par email
 */
@Injectable()
export class LoginThrottleGuard extends ThrottlerGuard {
  private readonly logger = new Logger(LoginThrottleGuard.name);
  private readonly emailAttempts = new Map<string, { count: number; resetAt: number }>();
  private readonly ipAttempts = new Map<string, { count: number; resetAt: number }>();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const email = request.body?.email?.toLowerCase();

    // Nettoyage périodique des anciennes entrées
    this.cleanupOldEntries();

    // Vérifier le rate limiting par IP (5 tentatives par minute)
    if (!this.checkIpLimit(ip)) {
      this.logger.warn(`⚠️ Trop de tentatives de connexion depuis l'IP: ${ip}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Vérifier le rate limiting par email si fourni (10 tentatives par heure)
    if (email && !this.checkEmailLimit(email)) {
      this.logger.warn(`⚠️ Trop de tentatives de connexion pour l'email: ${email}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Trop de tentatives de connexion pour cet email. Veuillez réessayer plus tard.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Enregistrer la tentative
    this.recordAttempt(ip, email);

    // Appeler le throttler par défaut de NestJS
    return super.canActivate(context);
  }

  private checkIpLimit(ip: string): boolean {
    const now = Date.now();
    const ipData = this.ipAttempts.get(ip);

    if (!ipData || now > ipData.resetAt) {
      return true;
    }

    return ipData.count < 5; // 5 tentatives par minute
  }

  private checkEmailLimit(email: string): boolean {
    const now = Date.now();
    const emailData = this.emailAttempts.get(email);

    if (!emailData || now > emailData.resetAt) {
      return true;
    }

    return emailData.count < 10; // 10 tentatives par heure
  }

  private recordAttempt(ip: string, email?: string): void {
    const now = Date.now();

    // Enregistrer pour l'IP (reset après 1 minute)
    const ipData = this.ipAttempts.get(ip);
    if (!ipData || now > ipData.resetAt) {
      this.ipAttempts.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    } else {
      ipData.count++;
    }

    // Enregistrer pour l'email (reset après 1 heure)
    if (email) {
      const emailData = this.emailAttempts.get(email);
      if (!emailData || now > emailData.resetAt) {
        this.emailAttempts.set(email, { count: 1, resetAt: now + 60 * 60 * 1000 });
      } else {
        emailData.count++;
      }
    }
  }

  private cleanupOldEntries(): void {
    const now = Date.now();

    // Nettoyer les IPs expirées
    for (const [ip, data] of this.ipAttempts.entries()) {
      if (now > data.resetAt) {
        this.ipAttempts.delete(ip);
      }
    }

    // Nettoyer les emails expirés
    for (const [email, data] of this.emailAttempts.entries()) {
      if (now > data.resetAt) {
        this.emailAttempts.delete(email);
      }
    }
  }
}

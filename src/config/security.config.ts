import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

/**
 * Configuration de sécurité pour l'application
 * Protège contre les vulnérabilités communes
 */
export function setupSecurity(app: INestApplication): void {
  // 1. Helmet - Headers de sécurité HTTP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 an
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny', // Empêche l'intégration dans des iframes (protection contre clickjacking)
      },
      noSniff: true, // Empêche le MIME sniffing
      xssFilter: true, // Protection XSS
    }),
  );

  // 2. Validation globale stricte
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Renvoie une erreur si propriétés non définies
      transform: true, // Transforme automatiquement les types
      transformOptions: {
        enableImplicitConversion: false, // Désactive la conversion implicite (plus sûr)
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Cache les détails en prod
    }),
  );

  // 3. Désactiver le header X-Powered-By (cache qu'on utilise NestJS)
  app.getHttpAdapter().getInstance().disable('x-powered-by');
}

/**
 * Liste des routes publiques qui ne nécessitent pas d'authentification
 */
export const PUBLIC_ROUTES = [
  '/auth/student/login',
  '/auth/staff/login', // V2: Route sécurisée pour agents & admins
  '/auth/refresh',
  '/tags', // Tags accessibles publiquement
  '/health',
  '/health/ready',
  '/health/live',
];

/**
 * Configuration du rate limiting par route
 */
export const RATE_LIMIT_CONFIG = {
  // Authentification - très strict
  auth: {
    ttl: 60000, // 1 minute
    limit: 5, // 5 tentatives
  },
  // API standard
  default: {
    ttl: 60000, // 1 minute
    limit: 100, // 100 requêtes
  },
  // Endpoints sensibles (création/modification)
  sensitive: {
    ttl: 60000, // 1 minute
    limit: 20, // 20 requêtes
  },
};

/**
 * Règles de mot de passe robustes
 */
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optionnel pour ne pas bloquer les utilisateurs
  maxLength: 100,
};

/**
 * Configuration CORS sécurisée
 */
export const CORS_CONFIG = {
  origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
      'capacitor://localhost',
    ];

    // Permettre les requêtes sans origin (comme les apps mobiles natives)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 3600, // 1 heure
};

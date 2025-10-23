import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Configuration de sécurité avancée pour Melio
 * - Headers de sécurité renforcés
 * - Rate limiting adaptatif
 * - Validation stricte
 * - Protection CSRF
 */

export const ADVANCED_SECURITY_CONFIG = {
  // Headers de sécurité renforcés
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),

  // Rate limiting adaptatif par type d'endpoint
  rateLimits: {
    // Authentification - modéré pour le développement
    auth: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'development' ? 1000 : 50, // Plus permissif en dev
      message: {
        error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
        retryAfter: 15 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true,
    }),

    // API générale - modéré
    api: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // 1000 requêtes par IP
      message: {
        error: 'Trop de requêtes. Veuillez ralentir.',
        retryAfter: 15 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),

    // Uploads - strict
    upload: rateLimit({
      windowMs: 60 * 60 * 1000, // 1 heure
      max: 50, // 50 uploads par IP
      message: {
        error: 'Limite d\'upload atteinte. Réessayez dans une heure.',
        retryAfter: 60 * 60,
      },
    }),
  },

  // Validation stricte
  validation: new ValidationPipe({
    whitelist: true, // Supprime les propriétés non définies
    forbidNonWhitelisted: true, // Rejette si propriétés non définies
    transform: true, // Transforme les types automatiquement
    disableErrorMessages: false, // Messages d'erreur détaillés en dev
    validationError: {
      target: false, // N'expose pas l'objet cible
      value: false, // N'expose pas la valeur
    },
  }),

  // Configuration CORS sécurisée
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
      
      // Autoriser les requêtes sans origin (mobile, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS: Origin non autorisé: ${origin}`);
        callback(new Error('Non autorisé par la politique CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 heures
  },
};

/**
 * Middleware de logging des tentatives suspectes
 */
export const securityLogger = (req: Request, res: Response, next: Function) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Détecter les patterns suspects
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.warn(`🚨 Tentative suspecte détectée - IP: ${ip}, UA: ${userAgent}`);
  }
  
  next();
};

/**
 * Middleware de protection contre les attaques par déni de service
 */
export const dosProtection = (req: Request, res: Response, next: Function) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Limiter la taille des requêtes
  if (req.get('content-length') && parseInt(req.get('content-length')!) > 10 * 1024 * 1024) {
    return res.status(413).json({
      error: 'Payload trop volumineux',
      maxSize: '10MB',
    });
  }
  
  next();
};


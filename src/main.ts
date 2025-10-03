import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { execSync } from 'child_process';

async function bootstrap() {
  console.log('🚀 Starting Melio Backend...');
  
  // Exécuter les migrations Prisma
  try {
    console.log('🔄 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Prisma migrations completed');
  } catch (error) {
    console.error('❌ Prisma migration failed:', error.message);
  }
  
  // Créer le compte admin si nécessaire (production et développement)
  try {
    console.log('🔄 Ensuring admin account exists...');
    execSync('node scripts/ensure-admin.js', { stdio: 'inherit' });
    console.log('✅ Admin account check completed');
  } catch (adminError) {
    console.error('⚠️ Admin account creation warning:', adminError.message);
    // Ne pas bloquer le démarrage si l'admin existe déjà
  }
  
  // NOTE: Le script force-migrate.js ne doit être exécuté QU'UNE SEULE FOIS lors de la configuration initiale
  // Il lance des scripts de seeding qui peuvent créer une boucle infinie
  // Pour l'exécuter manuellement : node scripts/force-migrate.js
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  const corsOrigins = configService.get('CORS_ORIGINS', '').split(',');
  const productionOrigins = [
    'https://www.melio-soutien.net',
    'https://melio-soutien.net',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
  ];
  
  const allowedOrigins = [...corsOrigins, ...productionOrigins].filter(Boolean);
  
  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (ex: mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // En production, autoriser seulement les domaines spécifiés
      if (configService.get('NODE_ENV') === 'production') {
        return callback(new Error('Not allowed by CORS'), false);
      }
      
      // En développement, autoriser toutes les origines
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Melio API')
    .setDescription('API sécurisée RGPD pour la lutte contre le harcèlement scolaire')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentification et autorisation')
    .addTag('Schools', 'Gestion des établissements')
    .addTag('Students', 'Gestion des élèves')
    .addTag('Journal', 'Journal intime des élèves')
    .addTag('Chat', 'Chatbot empathique')
    .addTag('Alerts', 'Système d\'alertes IA')
    .addTag('Reports', 'Signalements')
    .addTag('Analytics', 'Statistiques et rapports')
    .addTag('Resources', 'Ressources pédagogiques')
    .addTag('Notifications', 'Système de notifications')
    .addTag('Audit', 'Journal d\'audit')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT', 3000);
  const host = configService.get('HOST', '0.0.0.0'); // Écouter sur toutes les interfaces
  
  await app.listen(port, host);

  logger.log(`🚀 Application is running on: http://${host}:${port}`);
  logger.log(`📚 Swagger documentation: http://${host}:${port}/${apiPrefix}/docs`);
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV', 'development')}`);
  logger.log(`📱 Mobile API: http://192.168.1.107:${port}/${apiPrefix}`);
}

bootstrap();

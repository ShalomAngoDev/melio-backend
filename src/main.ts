import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { execSync } from 'child_process';
import { setupSecurity } from './config/security.config';
import { ADVANCED_SECURITY_CONFIG } from './config/advanced-security.config';
import { QueryOptimizerService } from './common/database/query-optimizer.service';

async function bootstrap() {
  console.log('🚀 Starting Melio Backend...');

  // Reset complet de la base de données
  try {
    console.log('🗑️ Resetting database...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    // Essayer une approche plus douce
    try {
      console.log('🔄 Trying gentle migration...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Gentle migration completed');
    } catch (migrateError) {
      console.error('⚠️ Migration warning:', migrateError.message);
    }
  }

  // Seed complet avec toutes les données
  try {
    console.log('🌱 Running complete seed...');
    execSync('node scripts/complete-seed-js.js', { stdio: 'inherit' });
    console.log('✅ Complete seed completed');
  } catch (seedError) {
    console.error('⚠️ Complete seed warning:', seedError.message);
    // Ne pas bloquer le démarrage si le seed échoue
  }

          // Admin account is already created by the complete seed script

  // NOTE: Le script force-migrate.js ne doit être exécuté QU'UNE SEULE FOIS lors de la configuration initiale
  // Il lance des scripts de seeding qui peuvent créer une boucle infinie
  // Pour l'exécuter manuellement : node scripts/force-migrate.js

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Configuration de sécurité avancée
  setupSecurity(app);
  app.use(ADVANCED_SECURITY_CONFIG.helmet);
  app.use(compression({ level: 6, threshold: 1024 }));

  // Validation globale stricte
  app.useGlobalPipes(ADVANCED_SECURITY_CONFIG.validation);

  // Rate limiting adaptatif
  app.use('/api/v1/auth', ADVANCED_SECURITY_CONFIG.rateLimits.auth);
  app.use('/api/v1/upload', ADVANCED_SECURITY_CONFIG.rateLimits.upload);
  app.use('/api/v1', ADVANCED_SECURITY_CONFIG.rateLimits.api);

  // Optimisation des requêtes de base de données
  try {
    const queryOptimizer = app.get(QueryOptimizerService);
    await queryOptimizer.createOptimalIndexes();
    logger.log('✅ Index de base de données optimisés');
  } catch (error) {
    logger.warn('⚠️ Erreur lors de l\'optimisation des index:', error.message);
  }

  // CORS sécurisé - utiliser la configuration depuis les variables d'environnement
  app.enableCors(ADVANCED_SECURITY_CONFIG.cors);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

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
    .addTag('Alerts', "Système d'alertes IA")
    .addTag('Reports', 'Signalements')
    .addTag('Analytics', 'Statistiques et rapports')
    .addTag('Resources', 'Ressources pédagogiques')
    .addTag('Notifications', 'Système de notifications')
    .addTag('Audit', "Journal d'audit")
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

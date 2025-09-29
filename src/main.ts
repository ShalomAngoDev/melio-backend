import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Starting Melio Backend...');
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  const corsOrigins = configService.get('CORS_ORIGINS', '').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
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

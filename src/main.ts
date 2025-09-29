import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { AppModule } from './app.module';

// Start a simple health check server immediately
function startHealthServer(port: number) {
  const healthServer = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/api/v1/health/basic' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  healthServer.listen(port, '0.0.0.0', () => {
    console.log(`🏥 Health check server running on port ${port}`);
    console.log(`🔍 Health endpoint: http://0.0.0.0:${port}/api/v1/health/basic`);
  });

  return healthServer;
}

async function bootstrap() {
  // Get port from environment first
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  
  // Start health check server immediately
  const healthServer = startHealthServer(port);
  
  // Now start the full NestJS application
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

  const appPort = configService.get('PORT', port);
  const host = configService.get('HOST', '0.0.0.0'); // Écouter sur toutes les interfaces
  
  // Close the health server since the main app will handle all requests
  healthServer.close();
  
  await app.listen(appPort, host);

  logger.log(`🚀 Application is running on: http://${host}:${appPort}`);
  logger.log(`📚 Swagger documentation: http://${host}:${appPort}/${apiPrefix}/docs`);
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV', 'development')}`);
  logger.log(`📱 Mobile API: http://192.168.1.107:${appPort}/${apiPrefix}`);
}

bootstrap();

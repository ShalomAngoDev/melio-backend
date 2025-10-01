#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration de l\'environnement local...');

// Variables d'environnement pour le développement local
const envContent = `# Database (Local PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/melio_local"

# Redis (Local)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# MinIO/S3 (Local)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=melio
MINIO_SECRET_KEY=melio123
MINIO_BUCKET=melio-files
MINIO_USE_SSL=false

# JWT (Production keys for consistency)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# AI Provider
AI_PROVIDER_URL=http://localhost:8000/api/analyze
AI_PROVIDER_API_KEY=your-ai-api-key
AI_PROVIDER_TIMEOUT=30000
AI_PROVIDER_RETRIES=3

# Feature Flags
FEATURE_AI_ENABLED=true
FEATURE_NOTIFICATIONS_ENABLED=true
FEATURE_PDF_EXPORT_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=pretty

# Timezone
TZ=Europe/Paris

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@melio.app

# Webhooks
WEBHOOK_SECRET=your-webhook-secret
`;

// Créer le fichier .env
const envPath = path.join(__dirname, '..', '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env existe déjà');
    console.log('   Sauvegarde en .env.backup...');
    fs.copyFileSync(envPath, envPath + '.backup');
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Fichier .env créé avec succès');
  
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env:', error);
  process.exit(1);
}

console.log('\n📋 Instructions pour continuer :');
console.log('1. Installer PostgreSQL localement');
console.log('2. Créer la base de données : createdb melio_local');
console.log('3. Installer Redis localement');
console.log('4. Lancer le développement : npm run dev');
console.log('5. Ou lancer en production : npm run prod');

console.log('\n🚀 Commandes disponibles :');
console.log('   npm run dev     - Développement local');
console.log('   npm run prod    - Production locale');
console.log('   npm run db:setup - Configuration de la base de données');
console.log('   npm run db:seed  - Chargement des données de test');

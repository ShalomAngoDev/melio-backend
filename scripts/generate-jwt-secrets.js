#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Génération des secrets JWT pour Melio\n');

// Générer des secrets JWT sécurisés
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

console.log('📋 Variables d\'environnement à configurer sur Railway :\n');

console.log('DATABASE_URL=postgresql://postgres:vBGFqLFVuRuhyflGarvCxkbITqfGCrRA@postgres.railway.internal:5432/railway');
console.log('NODE_ENV=production');
console.log('PORT=3000');
console.log('API_PREFIX=api/v1');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('BCRYPT_ROUNDS=12');
console.log('CORS_ORIGINS=https://web-6wtmkht7y-shalomdevs-projects.vercel.app,https://melio-frontend.vercel.app');
console.log('');
console.log('# Redis (pour les queues et cache)');
console.log('REDIS_HOST=redis.railway.internal');
console.log('REDIS_PORT=6379');
console.log('REDIS_PASSWORD=votre-redis-password');
console.log('');
console.log('# Minio (pour le stockage de fichiers)');
console.log('MINIO_ENDPOINT=minio.railway.internal');
console.log('MINIO_PORT=9000');
console.log('MINIO_ACCESS_KEY=votre-minio-access-key');
console.log('MINIO_SECRET_KEY=votre-minio-secret-key');
console.log('MINIO_BUCKET=melio-files');
console.log('');

console.log('🔧 Instructions :');
console.log('1. Copiez ces variables');
console.log('2. Allez sur railway.app');
console.log('3. Sélectionnez votre projet');
console.log('4. Allez dans "Variables"');
console.log('5. Ajoutez chaque variable');
console.log('6. Redéployez l\'application\n');

console.log('✅ Les secrets sont générés de manière sécurisée !');

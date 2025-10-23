#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔧 Génération des informations Redis et Minio pour Railway\n');

// Générer des clés sécurisées
const redisPassword = crypto.randomBytes(32).toString('hex');
const minioAccessKey = crypto.randomBytes(20).toString('hex');
const minioSecretKey = crypto.randomBytes(40).toString('hex');

console.log('📋 Variables Redis et Minio pour Railway :\n');

console.log('# Redis (Cache et Queues)');
console.log(`REDIS_HOST=redis.railway.internal`);
console.log(`REDIS_PORT=6379`);
console.log(`REDIS_PASSWORD=${redisPassword}`);
console.log('');

console.log('# Minio (Stockage de fichiers)');
console.log(`MINIO_ENDPOINT=minio.railway.internal`);
console.log(`MINIO_PORT=9000`);
console.log(`MINIO_ACCESS_KEY=${minioAccessKey}`);
console.log(`MINIO_SECRET_KEY=${minioSecretKey}`);
console.log(`MINIO_BUCKET=melio-files`);
console.log('');

console.log('🔧 Instructions :');
console.log('1. Copiez ces variables');
console.log('2. Allez sur railway.app');
console.log('3. Sélectionnez votre projet');
console.log('4. Allez dans "Variables"');
console.log('5. Ajoutez chaque variable');
console.log('6. Ajoutez Redis et Minio comme services');
console.log('7. Redéployez l\'application\n');

console.log('✅ Les clés sont générées de manière sécurisée !');









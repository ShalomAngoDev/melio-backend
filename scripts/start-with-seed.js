#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Melio Backend with migrations and seed...');

async function startApp() {
try {
  // Wait for database to be ready
  console.log('⏳ Waiting for database connection...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Run migrations first
  console.log('📦 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // Check if we need to seed (simple check)
  console.log('🌱 Seeding database...');
  execSync('npm run prisma:seed', { stdio: 'inherit' });
  
  console.log('✅ Database migrations and seed completed!');
  
  // Start the application
  console.log('🚀 Starting application...');
  execSync('npm run start:prod', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error during startup:', error.message);
  process.exit(1);
}
}

startApp();

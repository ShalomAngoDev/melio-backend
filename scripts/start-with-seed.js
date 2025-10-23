#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Melio Backend with seed...');

try {
  // Check if database is already seeded
  console.log('🔍 Checking if database needs seeding...');
  
  // Run migrations first
  console.log('📦 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // Check if we need to seed (simple check)
  console.log('🌱 Seeding database...');
  execSync('npm run prisma:seed', { stdio: 'inherit' });
  
  console.log('✅ Database seeded successfully!');
  
  // Start the application
  console.log('🚀 Starting application...');
  execSync('npm run start:prod', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error during startup:', error.message);
  process.exit(1);
}

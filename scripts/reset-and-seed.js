#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Resetting database and seeding fresh data...');

async function resetAndSeed() {
  try {
    // Wait for database to be ready
    console.log('⏳ Waiting for database connection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Reset database (drop all tables and recreate)
    console.log('🗑️ Resetting database...');
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    
    // Run migrations to recreate schema
    console.log('📦 Running fresh migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Seed with fresh data
    console.log('🌱 Seeding database with fresh data...');
    execSync('npm run prisma:seed', { stdio: 'inherit' });
    
    console.log('✅ Database reset and seeded successfully!');
    
    // Start the application
    console.log('🚀 Starting application...');
    execSync('npm run start:prod', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error during reset and seed:', error.message);
    process.exit(1);
  }
}

resetAndSeed();

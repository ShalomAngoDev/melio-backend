#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Force migration and seed...');

async function forceMigrateAndSeed() {
  try {
    // Wait for database to be ready
    console.log('⏳ Waiting for database connection...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Force create database schema
    console.log('📦 Creating database schema...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Seed with fresh data
    console.log('🌱 Seeding database with fresh data...');
    execSync('npm run prisma:seed', { stdio: 'inherit' });
    
    console.log('✅ Database schema created and seeded successfully!');
    
    // Start the application
    console.log('🚀 Starting application...');
    execSync('npm run start:prod', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error during force migration and seed:', error.message);
    process.exit(1);
  }
}

forceMigrateAndSeed();

#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Gentle migration and seed...');

async function gentleMigrateAndSeed() {
  try {
    // Wait for database to be ready
    console.log('⏳ Waiting for database connection...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Deploy migrations (without reset)
    console.log('📦 Deploying migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Seed with fresh data
    console.log('🌱 Seeding database with fresh data...');
    execSync('npm run prisma:seed', { stdio: 'inherit' });
    
    // Fix agent-schools relations
    console.log('🔧 Fixing agent-schools relations...');
    execSync('npm run fix:agent-schools', { stdio: 'inherit' });
    
    console.log('✅ Database schema created and seeded successfully!');
    
    // Start the application
    console.log('🚀 Starting application...');
    execSync('npm run start:prod', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error during gentle migration and seed:', error.message);
    process.exit(1);
  }
}

gentleMigrateAndSeed();

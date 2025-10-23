#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Ignore errors and seed...');

async function ignoreErrorsAndSeed() {
  try {
    // Wait for database to be ready
    console.log('⏳ Waiting for database connection...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Try to create schema, but ignore errors
    console.log('📦 Creating database schema (ignoring errors)...');
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Schema push failed, but continuing...');
    }
    
    // Seed with fresh data
    console.log('🌱 Seeding database with fresh data...');
    try {
      execSync('npm run prisma:seed', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Seed failed, but continuing...');
    }
    
    // Fix agent-schools relations
    console.log('🔧 Fixing agent-schools relations...');
    try {
      execSync('npm run fix:agent-schools', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Agent-schools fix failed, but continuing...');
    }
    
    console.log('✅ Database setup completed (with possible errors)!');
    
    // Start the application
    console.log('🚀 Starting application...');
    execSync('npm run start:prod', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error during ignore errors and seed:', error.message);
    process.exit(1);
  }
}

ignoreErrorsAndSeed();

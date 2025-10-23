#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Smart database reset and seed...');

async function smartResetAndSeed() {
  try {
    // Wait for database to be ready
    console.log('⏳ Waiting for database connection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if we need to reset (look for existing data)
    console.log('🔍 Checking if database needs reset...');
    let needsReset = false;
    
    try {
      // Try to check if there's existing data
      execSync('npx prisma db execute --stdin', { 
        input: 'SELECT COUNT(*) FROM schools;',
        stdio: 'pipe'
      });
      console.log('📊 Database has existing data, resetting...');
      needsReset = true;
    } catch (error) {
      console.log('📊 Database is empty or tables don\'t exist, proceeding with fresh setup...');
      needsReset = true;
    }
    
    if (needsReset) {
      // Reset database (drop all tables and recreate)
      console.log('🗑️ Resetting database...');
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      
      // Run migrations to recreate schema
      console.log('📦 Running fresh migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } else {
      // Just run migrations if schema is up to date
      console.log('📦 Running migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }
    
    // Seed with fresh data
    console.log('🌱 Seeding database with fresh data...');
    execSync('npm run prisma:seed', { stdio: 'inherit' });
    
    console.log('✅ Database setup completed successfully!');
    
    // Start the application
    console.log('🚀 Starting application...');
    execSync('npm run start:prod', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error during smart reset and seed:', error.message);
    process.exit(1);
  }
}

smartResetAndSeed();

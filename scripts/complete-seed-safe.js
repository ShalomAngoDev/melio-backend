#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🌱 Complete seed with safety...');

async function completeSeedSafe() {
  try {
    // Wait for database to be ready
    console.log('⏳ Waiting for database connection...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Clean database first
    console.log('🧹 Cleaning database...');
    execSync('npm run clean:db', { stdio: 'inherit' });
    
    // Run the complete seed
    console.log('🌱 Running complete seed...');
    execSync('npm run prisma:seed', { stdio: 'inherit' });
    
    console.log('✅ Complete seed completed successfully!');
    
    // Start the application
    console.log('🚀 Starting application...');
    execSync('npm run start:prod', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error during complete seed:', error.message);
    process.exit(1);
  }
}

completeSeedSafe();

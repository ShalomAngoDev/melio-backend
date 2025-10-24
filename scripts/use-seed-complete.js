#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🌱 Using seed-complete directly...');

async function useSeedComplete() {
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
    
    // Run seed-complete directly with Node.js
    console.log('🌱 Running seed-complete directly...');
    execSync('node -r ts-node/register prisma/seed-complete.ts', { stdio: 'inherit' });
    
    console.log('✅ Seed-complete completed successfully!');
    
    // Start the application
    console.log('🚀 Starting application...');
    execSync('npm run start:prod', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error during seed-complete:', error.message);
    process.exit(1);
  }
}

useSeedComplete();

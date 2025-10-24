#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🌱 Running seed-complete with Node.js...');

async function runSeedComplete() {
  try {
    // Wait for database to be ready
    console.log('⏳ Waiting for database connection...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Clean database first
    console.log('🧹 Cleaning database...');
    execSync('npm run clean:db', { stdio: 'inherit' });
    
    // Compile TypeScript to JavaScript
    console.log('🔨 Compiling TypeScript...');
    execSync('npx tsc prisma/seed-complete.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --allowSyntheticDefaultImports', { stdio: 'inherit' });
    
    // Run the compiled JavaScript
    console.log('🌱 Running compiled seed-complete...');
    execSync('node dist/prisma/seed-complete.js', { stdio: 'inherit' });
    
    console.log('✅ Seed-complete completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seed-complete:', error.message);
    process.exit(1);
  }
}

runSeedComplete();

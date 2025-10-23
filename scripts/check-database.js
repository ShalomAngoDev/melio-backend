#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database content...');
    
    // Vérifier toutes les tables
    const tables = [
      'AdminUser',
      'School', 
      'AgentUser',
      'Student',
      'Alert',
      'Report',
      'JournalEntry',
      'ChatMessage',
      'LibraryResource',
      'Tag',
      'Achievement'
    ];
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`📊 ${table}: ${count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
      }
    }
    
    // Vérifier les relations agent-école
    try {
      const agentSchools = await prisma.agentSchool.count();
      console.log(`📊 AgentSchool: ${agentSchools} relations`);
    } catch (error) {
      console.log(`❌ AgentSchool: Error - ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase()
  .then(() => {
    console.log('✅ Database check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database check failed:', error);
    process.exit(1);
  });

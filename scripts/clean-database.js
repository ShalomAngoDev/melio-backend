#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🗑️ Cleaning database...');
    
    // Supprimer toutes les données dans le bon ordre (clés étrangères)
    console.log('🧹 Deleting chat messages...');
    await prisma.chatMessage.deleteMany();
    
    console.log('🧹 Deleting journal entries...');
    await prisma.journalEntry.deleteMany();
    
    console.log('🧹 Deleting alerts...');
    await prisma.alert.deleteMany();
    
    console.log('🧹 Deleting reports...');
    await prisma.report.deleteMany();
    
    console.log('🧹 Deleting students...');
    await prisma.student.deleteMany();
    
    console.log('🧹 Deleting agent-schools...');
    await prisma.agentSchool.deleteMany();
    
    console.log('🧹 Deleting agents...');
    await prisma.agentUser.deleteMany();
    
    console.log('🧹 Deleting schools...');
    await prisma.school.deleteMany();
    
    console.log('🧹 Deleting admin users...');
    await prisma.adminUser.deleteMany();
    
    console.log('🧹 Deleting library resources...');
    await prisma.libraryResource.deleteMany();
    
    console.log('🧹 Deleting tags...');
    await prisma.tag.deleteMany();
    
    console.log('🧹 Deleting achievements...');
    await prisma.achievement.deleteMany();
    
    console.log('✅ Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase()
  .then(() => {
    console.log('🎉 Database cleaning completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database cleaning failed:', error);
    process.exit(1);
  });

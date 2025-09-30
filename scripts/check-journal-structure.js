#!/usr/bin/env node

/**
 * Script pour vérifier la structure de la table journal_entries
 */

const { PrismaClient } = require('@prisma/client');

async function checkJournalStructure() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Vérification de la structure de la table journal_entries...');
    
    // Vérifier la structure de la table
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'journal_entries'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Structure de la table journal_entries :');
    console.table(columns);
    
    // Tester un insert simple
    console.log('\n🧪 Test d\'insertion simple...');
    
    try {
      const testId = `test_${Date.now()}`;
      const testResult = await prisma.$executeRawUnsafe(`
        INSERT INTO "journal_entries" ("id", "studentId", "contentText", "mood", "createdAt")
        VALUES ('${testId}', 'test_student', 'Test content', 'NEUTRE', CURRENT_TIMESTAMP)
        RETURNING id
      `);
      
      console.log('✅ Insertion test réussie');
      
      // Nettoyer
      await prisma.$executeRawUnsafe(`DELETE FROM "journal_entries" WHERE "id" = '${testId}'`);
      console.log('🧹 Test nettoyé');
      
    } catch (testError) {
      console.error('❌ Erreur lors du test d\'insertion:', testError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJournalStructure().catch(console.error);

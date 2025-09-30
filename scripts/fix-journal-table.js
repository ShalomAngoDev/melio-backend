#!/usr/bin/env node

/**
 * Script pour corriger la table journal_entries existante
 * Ajoute le champ contentText si il manque
 */

const { PrismaClient } = require('@prisma/client');

async function fixJournalTable() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Correction de la table journal_entries...');
    
    // Vérifier si la colonne contentText existe
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'journal_entries' 
      AND column_name = 'contentText'
    `;
    
    if (columns.length === 0) {
      console.log('📝 Ajout de la colonne contentText...');
      
      // Ajouter la colonne contentText
      await prisma.$executeRaw`
        ALTER TABLE "journal_entries" 
        ADD COLUMN IF NOT EXISTS "contentText" TEXT
      `;
      
      // Copier les données de content vers contentText
      await prisma.$executeRaw`
        UPDATE "journal_entries" 
        SET "contentText" = "content" 
        WHERE "contentText" IS NULL
      `;
      
      // Rendre la colonne obligatoire
      await prisma.$executeRaw`
        ALTER TABLE "journal_entries" 
        ALTER COLUMN "contentText" SET NOT NULL
      `;
      
      console.log('✅ Colonne contentText ajoutée et données migrées');
    } else {
      console.log('✅ Colonne contentText déjà présente');
    }
    
    // Ajouter les colonnes IA si elles manquent
    const aiColumns = ['aiRiskScore', 'aiRiskLevel', 'aiSummary', 'aiAdvice', 'processedAt'];
    
    for (const column of aiColumns) {
      const columnExists = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = ${column}
      `;
      
      if (columnExists.length === 0) {
        console.log(`📝 Ajout de la colonne ${column}...`);
        
        let columnType = 'TEXT';
        if (column === 'aiRiskScore') columnType = 'INTEGER';
        if (column === 'processedAt') columnType = 'TIMESTAMP(3)';
        
        await prisma.$executeRaw`
          ALTER TABLE "journal_entries" 
          ADD COLUMN IF NOT EXISTS ${column} ${columnType}
        `;
        
        console.log(`✅ Colonne ${column} ajoutée`);
      }
    }
    
    console.log('🎉 Table journal_entries corrigée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixJournalTable().catch(console.error);

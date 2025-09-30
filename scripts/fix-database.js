#!/usr/bin/env node

/**
 * Script principal pour corriger la base de données Railway
 * Usage: node scripts/fix-database.js
 */

const { execSync } = require('child_process');
const path = require('path');

async function fixDatabase() {
  console.log('🚀 Début de la correction de la base de données...\n');

  try {
    // Étape 1: Exécuter la migration SQL
    console.log('📝 Étape 1: Exécution de la migration SQL...');
    execSync('node scripts/run-fix-migration.js', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Migration SQL terminée\n');

    // Étape 2: Générer le client Prisma
    console.log('🔧 Étape 2: Génération du client Prisma...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Client Prisma généré\n');

    // Étape 3: Initialiser les données
    console.log('🌱 Étape 3: Initialisation des données...');
    execSync('node scripts/seed-after-migration.js', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Données initialisées\n');

    console.log('🎉 Correction de la base de données terminée avec succès !');
    console.log('\n📋 Résumé:');
    console.log('  ✅ Tables créées avec les bons noms');
    console.log('  ✅ Client Prisma généré');
    console.log('  ✅ Données de test initialisées');
    console.log('\n🔑 Comptes créés:');
    console.log('  👨‍💼 Admin: admin@melio.app / admin123');
    console.log('  👨‍💼 Super Admin: superadmin@melio.app / superadmin123');
    console.log('  👩‍🏫 Agent: agent@college-victor-hugo.fr / agent123');
    console.log('  🏫 École: JMO75-01 (Collège Victor Hugo)');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
    process.exit(1);
  }
}

// Vérifier que DATABASE_URL est définie
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL n\'est pas définie dans les variables d\'environnement');
  console.log('💡 Assurez-vous que les variables Railway sont configurées');
  process.exit(1);
}

fixDatabase();

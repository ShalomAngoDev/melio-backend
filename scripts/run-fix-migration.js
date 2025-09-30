#!/usr/bin/env node

/**
 * Script pour exécuter la migration de correction des tables sur Railway
 * Usage: node scripts/run-fix-migration.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connexion réussie');

    // Lire le fichier SQL de migration
    const migrationPath = path.join(__dirname, 'fix-tables-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Exécution de la migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration exécutée avec succès');

    // Vérifier que les tables existent
    console.log('🔍 Vérification des tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('schools', 'students', 'agent_users', 'admin_users', 'alerts', 'reports')
      ORDER BY table_name;
    `);

    console.log('📋 Tables créées:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    if (result.rows.length === 6) {
      console.log('🎉 Toutes les tables ont été créées avec succès !');
    } else {
      console.log('⚠️  Certaines tables manquent encore');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

// Vérifier que DATABASE_URL est définie
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL n\'est pas définie dans les variables d\'environnement');
  process.exit(1);
}

runMigration();

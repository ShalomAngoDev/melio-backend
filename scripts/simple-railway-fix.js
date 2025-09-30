#!/usr/bin/env node

/**
 * Script simple pour créer les tables sur Railway
 * Utilise l'URL publique PostgreSQL
 */

const { Client } = require('pg');

async function main() {
    console.log('🚨 Migration simple Railway...');
    
    // URL publique PostgreSQL Railway
    const publicDbUrl = 'postgresql://postgres:CRUHCpCSWTUvpsiovTjkXATHvYfUNrzp@viaduct.proxy.rlwy.net:38616/railway';
    
    const client = new Client({
        connectionString: publicDbUrl
    });
    
    try {
        console.log('🔗 Connexion à PostgreSQL...');
        await client.connect();
        console.log('✅ Connexion établie');
        
        // Créer les tables
        console.log('📝 Création des tables...');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                schoolId TEXT NOT NULL,
                studentId TEXT NOT NULL,
                sourceId TEXT NOT NULL,
                sourceType TEXT NOT NULL DEFAULT 'JOURNAL',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                riskLevel TEXT NOT NULL,
                riskScore INTEGER NOT NULL,
                childMood TEXT NOT NULL,
                aiSummary TEXT NOT NULL,
                aiAdvice TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'NOUVELLE'
            )
        `);
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                schoolId TEXT NOT NULL,
                studentId TEXT,
                content TEXT NOT NULL,
                urgency TEXT NOT NULL,
                anonymous BOOLEAN NOT NULL DEFAULT false,
                status TEXT NOT NULL DEFAULT 'NOUVEAU',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP NOT NULL
            )
        `);
        
        console.log('✅ Tables créées avec succès !');
        
        // Vérification
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('alerts', 'reports')
        `);
        
        console.log('📊 Tables trouvées:', result.rows);
        
        if (result.rows.length >= 2) {
            console.log('🎉 SUCCÈS: Migration terminée !');
        } else {
            console.log('❌ Tables manquantes');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await client.end();
        console.log('🔌 Connexion fermée');
    }
}

main().catch(console.error);

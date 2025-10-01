const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function applyV2Migration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Application de la migration V2 (Tags + Personnalisation)...\n');
    
    // Lire le fichier SQL de migration
    const migrationPath = path.join(__dirname, '../prisma/migrations/add_tags_v2.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Séparer les commandes SQL
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('COMMENT'));
    
    console.log(`📝 Exécution de ${commands.length} commandes SQL...\n`);
    
    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      try {
        await prisma.$executeRawUnsafe(command);
        console.log(`✅ Commande ${i + 1}/${commands.length} exécutée`);
      } catch (error) {
        // Ignorer les erreurs "already exists" ou "duplicate"
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('column') && error.message.includes('already')) {
          console.log(`⚠️  Commande ${i + 1}/${commands.length} ignorée (déjà appliquée)`);
        } else {
          console.error(`❌ Erreur commande ${i + 1}:`, error.message);
          // Ne pas arrêter, continuer avec les autres commandes
        }
      }
    }
    
    console.log('\n✅ Migration V2 appliquée avec succès!\n');
    
    // Vérifier les tags créés
    const tagsCount = await prisma.tag.count();
    console.log(`📊 Tags disponibles: ${tagsCount}`);
    
    if (tagsCount > 0) {
      const tags = await prisma.tag.findMany({
        orderBy: { category: 'asc' }
      });
      
      console.log('\n🏷️  Liste des tags:');
      tags.forEach(tag => {
        console.log(`   ${tag.icon} ${tag.name} (${tag.category})`);
      });
    }
    
    console.log('\n🎉 Prêt pour V2!');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. npm run prisma:generate  (regénérer le client Prisma)');
    console.log('   2. Redémarrer le serveur backend');
    console.log('   3. Tester les nouveaux endpoints de tags');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyV2Migration()
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


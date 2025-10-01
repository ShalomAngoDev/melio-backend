const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🧹 Nettoyage de la base de données...');
    
    // Ordre de suppression (respecter les contraintes de clés étrangères)
    console.log('🗑️ Suppression des messages de chat...');
    await prisma.$executeRaw`DELETE FROM "chat_messages"`;
    
    console.log('🗑️ Suppression des entrées de journal...');
    await prisma.$executeRaw`DELETE FROM "journal_entries"`;
    
    console.log('🗑️ Suppression des alertes...');
    await prisma.$executeRaw`DELETE FROM "alerts"`;
    
    console.log('🗑️ Suppression des signalements...');
    await prisma.$executeRaw`DELETE FROM "reports"`;
    
    console.log('🗑️ Suppression des élèves...');
    await prisma.$executeRaw`DELETE FROM "students"`;
    
    console.log('🗑️ Suppression des agents...');
    await prisma.$executeRaw`DELETE FROM "agent_users"`;
    
    console.log('🗑️ Suppression des écoles...');
    await prisma.$executeRaw`DELETE FROM "schools"`;
    
    console.log('🗑️ Suppression des admins...');
    await prisma.$executeRaw`DELETE FROM "admin_users"`;
    
    console.log('✅ Base de données nettoyée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log('✅ Nettoyage terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { cleanDatabase };



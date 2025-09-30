const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixChatTable() {
  try {
    console.log('🔧 Correction de la table chat_messages...');
    
    // Vérifier si la colonne content existe
    const contentExists = await prisma.$queryRaw`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'chat_messages' AND column_name = 'content'
    `;
    
    if (!contentExists.length) {
      console.log('📝 Ajout de la colonne content...');
      await prisma.$executeRawUnsafe(`ALTER TABLE "chat_messages" ADD COLUMN "content" TEXT`);
      
      // Migrer les données de message vers content
      console.log('🔄 Migration des données message -> content...');
      await prisma.$executeRawUnsafe(`UPDATE "chat_messages" SET "content" = "message" WHERE "message" IS NOT NULL`);
      
      // Rendre content NOT NULL
      await prisma.$executeRawUnsafe(`ALTER TABLE "chat_messages" ALTER COLUMN "content" SET NOT NULL`);
      
      // Supprimer l'ancienne colonne message
      console.log('🗑️ Suppression de l\'ancienne colonne message...');
      await prisma.$executeRawUnsafe(`ALTER TABLE "chat_messages" DROP COLUMN "message"`);
      
      console.log('✅ Colonne content ajoutée et données migrées');
    } else {
      console.log('✅ Colonne content déjà présente');
    }
    
    // Vérifier si la colonne resourceId existe
    const resourceIdExists = await prisma.$queryRaw`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'chat_messages' AND column_name = 'resourceId'
    `;
    
    if (!resourceIdExists.length) {
      console.log('📝 Ajout de la colonne resourceId...');
      await prisma.$executeRawUnsafe(`ALTER TABLE "chat_messages" ADD COLUMN "resourceId" TEXT`);
      console.log('✅ Colonne resourceId ajoutée');
    } else {
      console.log('✅ Colonne resourceId déjà présente');
    }
    
    console.log('🎉 Table chat_messages corrigée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  fixChatTable()
    .then(() => {
      console.log('✅ Correction terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { fixChatTable };

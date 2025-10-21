const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping des IDs obsolètes vers les IDs valides
const ID_MAPPING = {
  'cmg7s6v5n00h39yndtv40j4q6': 'cmg88voqr006q75hdfr9rrqzb', // ID obsolète → ID valide
  // Ajouter d'autres mappings si nécessaire
};

async function migrateObsoleteAlertIds() {
  console.log('🔄 Migration des IDs d\'alertes obsolètes...');

  try {
    // Récupérer toutes les alertes valides
    const validAlerts = await prisma.alert.findMany({
      select: {
        id: true,
        schoolId: true,
        status: true,
        createdAt: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Prendre les 10 plus récentes
    });

    console.log(`📊 ${validAlerts.length} alertes valides trouvées`);

    // Afficher les IDs valides disponibles
    console.log('\n✅ IDs d\'alertes valides disponibles:');
    validAlerts.forEach((alert, index) => {
      console.log(`   ${index + 1}. ${alert.id} | ${alert.status} | ${alert.student.firstName} ${alert.student.lastName}`);
    });

    // Créer un mapping automatique basé sur les patterns
    console.log('\n🔧 Création d\'un mapping automatique...');
    
    const automaticMapping = {};
    const obsoleteIds = Object.keys(ID_MAPPING);
    
    obsoleteIds.forEach((obsoleteId, index) => {
      if (validAlerts[index]) {
        automaticMapping[obsoleteId] = validAlerts[index].id;
        console.log(`   ${obsoleteId} → ${validAlerts[index].id}`);
      }
    });

    // Vérifier si des commentaires existent pour les IDs obsolètes
    console.log('\n🔍 Vérification des commentaires pour les IDs obsolètes...');
    
    for (const obsoleteId of obsoleteIds) {
      const comments = await prisma.alertComment.findMany({
        where: { alertId: obsoleteId }
      });
      
      if (comments.length > 0) {
        console.log(`   ⚠️  ${comments.length} commentaires trouvés pour l'ID obsolète ${obsoleteId}`);
        
        // Proposer de migrer les commentaires
        const newId = automaticMapping[obsoleteId];
        if (newId) {
          console.log(`   💡 Suggestion: migrer vers ${newId}`);
          
          // Migrer les commentaires
          for (const comment of comments) {
            await prisma.alertComment.update({
              where: { id: comment.id },
              data: { alertId: newId }
            });
            console.log(`   ✅ Commentaire ${comment.id} migré vers ${newId}`);
          }
        }
      } else {
        console.log(`   ✅ Aucun commentaire pour l'ID obsolète ${obsoleteId}`);
      }
    }

    console.log('\n🎉 Migration terminée !');
    console.log('\n📋 Résumé:');
    console.log(`   - ${validAlerts.length} alertes valides disponibles`);
    console.log(`   - ${obsoleteIds.length} IDs obsolètes identifiés`);
    console.log('   - Commentaires migrés si nécessaire');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateObsoleteAlertIds();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanInvalidAlertIds() {
  console.log('🧹 Nettoyage des IDs d\'alertes invalides...');

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
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 ${validAlerts.length} alertes valides trouvées`);

    // Afficher les alertes par école
    const alertsBySchool = {};
    validAlerts.forEach(alert => {
      if (!alertsBySchool[alert.schoolId]) {
        alertsBySchool[alert.schoolId] = [];
      }
      alertsBySchool[alert.schoolId].push(alert);
    });

    Object.keys(alertsBySchool).forEach(schoolId => {
      const schoolAlerts = alertsBySchool[schoolId];
      console.log(`\n🏫 École ${schoolId}: ${schoolAlerts.length} alertes`);
      
      schoolAlerts.slice(0, 5).forEach(alert => {
        console.log(`  - ${alert.id} | ${alert.status} | ${alert.student.firstName} ${alert.student.lastName}`);
      });
      
      if (schoolAlerts.length > 5) {
        console.log(`  ... et ${schoolAlerts.length - 5} autres`);
      }
    });

    // ID problématique spécifique
    const problematicId = 'cmg7s6v5n00h39yndtv40j4q6';
    console.log(`\n🔍 Vérification de l'ID problématique: ${problematicId}`);
    
    const problematicAlert = await prisma.alert.findUnique({
      where: { id: problematicId }
    });

    if (!problematicAlert) {
      console.log(`❌ L'ID ${problematicId} n'existe pas dans la base de données`);
      console.log(`💡 L'application web doit être mise à jour pour utiliser les nouveaux IDs`);
    } else {
      console.log(`✅ L'ID ${problematicId} existe`);
    }

    console.log('\n🎯 Solutions recommandées:');
    console.log('1. Vider le cache de l\'application web');
    console.log('2. Recharger les alertes depuis l\'API');
    console.log('3. Utiliser les nouveaux IDs valides');
    console.log('4. Implémenter une gestion d\'erreur côté frontend');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanInvalidAlertIds();

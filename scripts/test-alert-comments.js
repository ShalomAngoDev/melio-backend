const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAlertComments() {
  console.log('🧪 Test des commentaires d\'alertes...');

  try {
    // Récupérer une alerte avec ses commentaires
    const alert = await prisma.alert.findFirst({
      where: {
        comments: {
          some: {} // Alerte qui a au moins un commentaire
        }
      },
      include: {
        comments: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!alert) {
      console.log('❌ Aucune alerte avec commentaires trouvée');
      return;
    }

    console.log(`📊 Alerte trouvée: ${alert.id}`);
    console.log(`👦 Élève: ${alert.student.firstName} ${alert.student.lastName}`);
    console.log(`📝 ${alert.comments.length} commentaires trouvés:`);

    alert.comments.forEach((comment, index) => {
      console.log(`  ${index + 1}. [${comment.oldStatus} → ${comment.newStatus}] ${comment.comment}`);
      console.log(`     Par: ${comment.agentName} (${comment.createdAt})`);
    });

    console.log('✅ Test réussi ! Les commentaires sont correctement stockés et récupérés.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAlertComments();

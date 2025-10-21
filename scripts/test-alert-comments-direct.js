const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAlertCommentsDirect() {
  console.log('🧪 Test direct des commentaires d\'alertes...');

  try {
    // Test avec l'ID problématique
    const problematicId = 'cmg7s6v5n00h39yndtv40j4q6';
    console.log(`🔍 Test avec l'ID problématique: ${problematicId}`);
    
    const problematicAlert = await prisma.alert.findUnique({
      where: { id: problematicId }
    });
    
    if (!problematicAlert) {
      console.log('❌ L\'ID problématique n\'existe pas (comme attendu)');
    } else {
      console.log('✅ L\'ID problématique existe (inattendu)');
    }

    // Test avec un ID valide
    const validId = 'cmg88voqr006q75hdfr9rrqzb';
    console.log(`🔍 Test avec un ID valide: ${validId}`);
    
    const validAlert = await prisma.alert.findUnique({
      where: { id: validId }
    });
    
    if (!validAlert) {
      console.log('❌ L\'ID valide n\'existe pas');
    } else {
      console.log('✅ L\'ID valide existe');
      console.log(`   - École: ${validAlert.schoolId}`);
      console.log(`   - Statut: ${validAlert.status}`);
      console.log(`   - Créé: ${validAlert.createdAt}`);
    }

    // Test des commentaires pour l'ID valide
    if (validAlert) {
      const comments = await prisma.alertComment.findMany({
        where: { alertId: validId },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`📝 ${comments.length} commentaires trouvés pour l'ID valide`);
      comments.forEach((comment, index) => {
        console.log(`   ${index + 1}. [${comment.oldStatus} → ${comment.newStatus}] ${comment.comment}`);
      });
    }

    // Test de la logique de validation
    console.log('\n🔧 Test de la logique de validation...');
    
    const testValidation = (alertId, schoolId) => {
      if (!alertId) {
        return { exists: false, alertId, error: 'Alert ID is null or undefined' };
      }
      
      if (!schoolId) {
        return { exists: false, alertId, error: 'School ID is null or undefined' };
      }
      
      return { exists: true, alertId, schoolId };
    };

    const validationResult = testValidation(problematicId, 'test-school');
    console.log('Résultat de validation:', validationResult);

    console.log('\n✅ Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAlertCommentsDirect();

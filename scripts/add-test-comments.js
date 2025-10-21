const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestComments() {
  console.log('🔄 Ajout de commentaires de test aux alertes...');

  try {
    // Récupérer quelques alertes existantes
    const alerts = await prisma.alert.findMany({
      take: 5,
      select: {
        id: true,
        schoolId: true,
        status: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (alerts.length === 0) {
      console.log('❌ Aucune alerte trouvée');
      return;
    }

    console.log(`📊 ${alerts.length} alertes trouvées`);

    // Récupérer un agent pour les commentaires
    const agent = await prisma.agentUser.findFirst({
      select: {
        id: true,
        email: true,
      },
    });

    if (!agent) {
      console.log('❌ Aucun agent trouvé');
      return;
    }

    console.log(`👨‍💼 Agent trouvé: ${agent.email}`);

    // Ajouter des commentaires de test
    for (let i = 0; i < alerts.length; i++) {
      const alert = alerts[i];
      
      // Créer 1-3 commentaires par alerte
      const commentCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < commentCount; j++) {
        const statuses = ['NOUVELLE', 'EN_COURS', 'TRAITEE'];
        const oldStatus = j === 0 ? 'NOUVELLE' : statuses[Math.floor(Math.random() * statuses.length)];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const comments = [
          `Analyse initiale de la situation de ${alert.student.firstName} ${alert.student.lastName}`,
          `Mise en place d'un suivi personnalisé pour l'élève`,
          `Rencontre prévue avec les parents la semaine prochaine`,
          `Équipe pédagogique informée de la situation`,
          `Mesures de protection mises en place`,
          `Suivi psychologique recommandé`,
          `Situation en cours de résolution`,
          `Alerte traitée avec succès`,
        ];

        const comment = comments[Math.floor(Math.random() * comments.length)];

        await prisma.alertComment.create({
          data: {
            alertId: alert.id,
            agentId: agent.id,
            agentName: agent.email.split('@')[0], // Utiliser la partie avant @ comme nom
            oldStatus,
            newStatus,
            comment,
          },
        });

        console.log(`✅ Commentaire ajouté pour l'alerte ${alert.id}`);
      }
    }

    console.log('🎉 Commentaires de test ajoutés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des commentaires:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestComments();

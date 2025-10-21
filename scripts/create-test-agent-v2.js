// Script pour créer un agent de test avec la nouvelle structure V2 (multi-écoles)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestAgent() {
  try {
    console.log('🔧 Création d\'un agent de test V2...\n');

    // 1. Récupérer la première école disponible
    const school = await prisma.school.findFirst();
    
    if (!school) {
      console.error('❌ Aucune école trouvée dans la base de données');
      console.log('💡 Créez d\'abord une école via l\'interface admin');
      return;
    }

    console.log(`✅ École trouvée: ${school.name} (${school.code})`);

    // 2. Email et mot de passe pour le test
    const testEmail = 'agent.test@melio.app';
    const testPassword = 'MelioTest2024!';

    // 3. Vérifier si un agent avec cet email existe déjà
    let agent = await prisma.agentUser.findUnique({
      where: { email: testEmail },
      include: {
        schools: {
          include: {
            school: true,
          },
        },
      },
    });

    if (agent) {
      console.log(`\n⚠️  Agent existe déjà: ${testEmail}`);
      
      // Vérifier s'il est déjà lié à l'école
      const isLinked = agent.schools.some(as => as.schoolId === school.id);
      
      if (!isLinked) {
        // Ajouter l'école à l'agent
        await prisma.agentSchool.create({
          data: {
            agentId: agent.id,
            schoolId: school.id,
          },
        });
        console.log(`✅ École ${school.code} ajoutée à l'agent`);
      } else {
        console.log(`✅ Agent déjà lié à l'école ${school.code}`);
      }
    } else {
      // 4. Créer un nouvel agent
      const hashedPassword = await bcrypt.hash(testPassword, 12);

      agent = await prisma.agentUser.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          firstName: 'Agent',
          lastName: 'Test',
          role: 'ROLE_AGENT',
          schools: {
            create: {
              schoolId: school.id,
            },
          },
        },
        include: {
          schools: {
            include: {
              school: true,
            },
          },
        },
      });

      console.log(`\n✅ Agent créé avec succès !`);
    }

    // 5. Afficher les informations de connexion
    console.log(`\n📋 Informations de connexion:`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Mot de passe: ${testPassword}`);
    console.log(`   École(s) gérée(s): ${agent.schools.map(as => `${as.school.name} (${as.school.code})`).join(', ')}`);
    console.log(`\n✅ Agent configuré et prêt à l'emploi !`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'agent:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAgent();


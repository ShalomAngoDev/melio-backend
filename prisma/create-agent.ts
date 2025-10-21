import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating agent for existing school...');

  const schoolCode = 'JMO75-01';
  const agentEmail = 'agent@college-victor-hugo.fr';
  const agentPassword = 'agent123';

  // Créer d'abord l'école si elle n'existe pas
  let school = await prisma.school.findUnique({
    where: { code: schoolCode },
  });

  if (!school) {
    console.log(`📚 Creating school with code ${schoolCode}...`);
    
    // Générer une clé secrète pour les identifiants élèves
    const idKey = require('crypto').randomBytes(32).toString('base64url');
    
    school = await prisma.school.create({
      data: {
        code: schoolCode,
        name: 'Collège Jean Moulin',
        address1: '12 rue des Écoles',
        postalCode: '75015',
        city: 'Paris',
        country: 'FR',
        timezone: 'Europe/Paris',
        level: 'COLLEGE',
        idKey,
        idKeyVer: 1,
        status: 'ACTIVE',
      },
    });
    
    console.log(`✅ School created: ${school.name} with code: ${school.code}`);
  } else {
    console.log(`✅ Found school: ${school.name} with code: ${school.code}`);
  }

  const hashedPassword = await bcrypt.hash(agentPassword, 10);

  // V2: Nouvelle structure avec agents multi-écoles
  const existingAgent = await prisma.agentUser.findUnique({
    where: { email: agentEmail },
    include: {
      schools: {
        include: {
          school: true,
        },
      },
    },
  });

  let agent;
  
  if (existingAgent) {
    // Agent existe, mettre à jour le mot de passe
    agent = await prisma.agentUser.update({
      where: { email: agentEmail },
      data: {
        password: hashedPassword,
      },
    });
    
    // Vérifier si l'agent est déjà lié à cette école
    const isLinked = existingAgent.schools.some(as => as.schoolId === school.id);
    if (!isLinked) {
      await prisma.agentSchool.create({
        data: {
          agentId: agent.id,
          schoolId: school.id,
        },
      });
      console.log(`✅ École ${school.code} ajoutée à l'agent existant`);
    }
  } else {
    // Créer un nouvel agent avec la liaison à l'école
    agent = await prisma.agentUser.create({
      data: {
        email: agentEmail,
        password: hashedPassword,
        firstName: 'Agent',
        lastName: 'Hugo',
        role: 'ROLE_AGENT',
        schools: {
          create: {
            schoolId: school.id,
          },
        },
      },
    });
  }

  console.log(`✅ Agent created/updated: ${agent.email} for school: ${school.name}`);
  console.log('\n📋 Test credentials:');
  console.log(`Agent Email: ${agent.email}`);
  console.log(`Agent Password: ${agentPassword}`);
  console.log(`School Name: ${school.name}`);
  console.log(`School Code: ${school.code}`);
  console.log(`School City: ${school.city}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

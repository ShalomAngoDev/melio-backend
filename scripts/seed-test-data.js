#!/usr/bin/env node

/**
 * Script de seed avec de vraies données de test
 * Crée 100 élèves, 10 écoles, 10 agents, 200 alertes et 100 signalements
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function seedTestData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Début du seeding avec données de test...');
    
    // Vérifier que les tables existent
    console.log('🔍 Vérification des tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('schools', 'agent_users', 'students', 'alerts', 'reports', 'journal_entries')
    `;
    
    if (tables.length < 6) {
      console.log('❌ Tables manquantes. Exécutez d\'abord force-migrate.js');
      return;
    }
    
    console.log('✅ Toutes les tables sont présentes');
    
    // Noms et données réalistes
    const firstNames = [
      'Emma', 'Lucas', 'Chloé', 'Nathan', 'Léa', 'Hugo', 'Manon', 'Gabriel', 'Camille', 'Raphaël',
      'Sarah', 'Louis', 'Océane', 'Arthur', 'Lola', 'Jules', 'Marie', 'Tom', 'Inès', 'Paul',
      'Louise', 'Noah', 'Alice', 'Ethan', 'Anna', 'Liam', 'Clara', 'Adam', 'Zoé', 'Léo',
      'Maya', 'Eliott', 'Julia', 'Lucas', 'Charlotte', 'Antoine', 'Léa', 'Maxime', 'Emma', 'Alexandre',
      'Léna', 'Théo', 'Romane', 'Mathis', 'Juliette', 'Enzo', 'Ambre', 'Pierre', 'Lola', 'Nicolas',
      'Éva', 'Baptiste', 'Lilou', 'Sacha', 'Rose', 'Romain', 'Luna', 'Alexis', 'Maëlys', 'Valentin',
      'Chloé', 'Timéo', 'Lina', 'Malo', 'Lya', 'Yanis', 'Élise', 'Gabin', 'Léonie', 'Lucien',
      'Nina', 'Axel', 'Mya', 'Naël', 'Alya', 'Éden', 'Alba', 'Lyam', 'Lila', 'Lohan',
      'Sofia', 'Kylian', 'Léna', 'Nino', 'Maëlle', 'Ilyès', 'Lou', 'Milan', 'Léna', 'Noam'
    ];
    
    const lastNames = [
      'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent',
      'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard',
      'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Lefevre', 'Faure', 'Andre',
      'Mercier', 'Blanc', 'Guerin', 'Boyer', 'Garnier', 'Chevalier', 'Francois', 'Legrand', 'Gauthier', 'Garcia',
      'Perrin', 'Robin', 'Clement', 'Morin', 'Nicolas', 'Henry', 'Roussel', 'Mathieu', 'Gautier', 'Masson',
      'Marchand', 'Duval', 'Denis', 'Dumont', 'Marie', 'Lemaire', 'Noel', 'Meyer', 'Dufour', 'Meunier',
      'Brun', 'Blanchard', 'Giraud', 'Joly', 'Riviere', 'Lucas', 'Brunet', 'Gaillard', 'Barbier', 'Arnaud',
      'Martinez', 'Roche', 'Renard', 'Schmitt', 'Roy', 'Leroux', 'Colin', 'Vidal', 'Caron', 'Picard'
    ];
    
    const cities = [
      'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
      'Rennes', 'Reims', 'Toulon', 'Le Havre', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Saint-Étienne'
    ];
    
    const schoolNames = [
      'École Primaire Victor Hugo', 'Collège Jules Verne', 'Lycée Marie Curie', 'École Maternelle Les Petits Loups',
      'Collège Jean Moulin', 'Lycée Albert Einstein', 'École Primaire Les Lilas', 'Collège Pierre et Marie Curie',
      'Lycée Louis Pasteur', 'École Maternelle Arc-en-Ciel', 'Collège Simone Veil', 'Lycée Claude Monet',
      'École Primaire Les Roses', 'Collège Antoine de Saint-Exupéry', 'Lycée Frida Kahlo', 'École Maternelle Les Étoiles',
      'Collège Léonard de Vinci', 'Lycée Nelson Mandela', 'École Primaire Les Coquelicots', 'Collège Rosa Parks'
    ];
    
    const classes = [
      'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'
    ];
    
    const moods = ['Heureux', 'Triste', 'En colère', 'Anxieux', 'Fatigué', 'Excité', 'Calme', 'Stressé', 'Content', 'Inquiet'];
    
    const riskLevels = ['FAIBLE', 'MOYEN', 'ÉLEVÉ', 'CRITIQUE'];
    
    const alertStatuses = ['NOUVELLE', 'EN_COURS', 'RÉSOLUE', 'ARCHIVÉE'];
    
    const reportStatuses = ['NOUVEAU', 'EN_COURS', 'TRAITÉ', 'CLÔTURÉ'];
    
    const urgencies = ['FAIBLE', 'MOYENNE', 'ÉLEVÉE', 'URGENTE'];
    
    // 1. Créer 10 écoles
    console.log('🏫 Création de 10 écoles...');
    const schools = [];
    for (let i = 0; i < 10; i++) {
      const school = await prisma.school.upsert({
        where: { code: `SCHOOL${String(i + 1).padStart(3, '0')}` },
        update: {},
        create: {
          code: `SCHOOL${String(i + 1).padStart(3, '0')}`,
          name: schoolNames[i],
          address1: `${Math.floor(Math.random() * 99) + 1} rue de la Paix`,
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          city: cities[Math.floor(Math.random() * cities.length)],
          country: 'FR',
          timezone: 'Europe/Paris',
          level: i < 3 ? 'PRIMAIRE' : i < 7 ? 'COLLÈGE' : 'LYCÉE',
          contactName: `Directeur ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          contactEmail: `contact@${schoolNames[i].toLowerCase().replace(/\s+/g, '')}.fr`,
          contactPhone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
          idKey: `ID${Math.random().toString(36).substring(2, 15)}`,
          idKeyVer: 1,
          status: 'ACTIVE'
        }
      });
      schools.push(school);
    }
    console.log(`✅ ${schools.length} écoles créées`);
    
    // 2. Créer 10 agents (1 par école)
    console.log('👨‍🏫 Création de 10 agents...');
    const agents = [];
    const hashedPassword = await bcrypt.hash('agent123', 12);
    
    for (let i = 0; i < 10; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      const agent = await prisma.agentUser.upsert({
        where: { email: `agent${i + 1}@${schools[i].name.toLowerCase().replace(/\s+/g, '')}.fr` },
        update: {},
        create: {
          schoolId: schools[i].id,
          email: `agent${i + 1}@${schools[i].name.toLowerCase().replace(/\s+/g, '')}.fr`,
          password: hashedPassword,
          role: 'ROLE_AGENT'
        }
      });
      agents.push(agent);
    }
    console.log(`✅ ${agents.length} agents créés`);
    
    // 3. Créer 100 élèves (10 par école)
    console.log('👶 Création de 100 élèves...');
    const students = [];
    
    for (let schoolIndex = 0; schoolIndex < 10; schoolIndex++) {
      for (let studentIndex = 0; studentIndex < 10; studentIndex++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const birthYear = 2010 + Math.floor(Math.random() * 8); // 2010-2017
        const birthMonth = Math.floor(Math.random() * 12) + 1;
        const birthDay = Math.floor(Math.random() * 28) + 1;
        const className = classes[Math.floor(Math.random() * classes.length)];
        
        const student = await prisma.student.upsert({
          where: { 
            schoolId_uniqueId: {
              schoolId: schools[schoolIndex].id,
              uniqueId: `STU${schoolIndex + 1}${String(studentIndex + 1).padStart(2, '0')}`
            }
          },
          update: {},
          create: {
            schoolId: schools[schoolIndex].id,
            firstName,
            lastName,
            birthdate: new Date(birthYear, birthMonth - 1, birthDay),
            sex: Math.random() > 0.5 ? 'M' : 'F',
            className,
            parentName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            parentPhone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
            parentEmail: `parent.${lastName.toLowerCase()}@email.com`,
            uniqueId: `STU${schoolIndex + 1}${String(studentIndex + 1).padStart(2, '0')}`,
            uniqueIdVer: 1
          }
        });
        students.push(student);
      }
    }
    console.log(`✅ ${students.length} élèves créés`);
    
    // 4. Créer 200 alertes
    console.log('🚨 Création de 200 alertes...');
    const alerts = [];
    
    for (let i = 0; i < 200; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const status = alertStatuses[Math.floor(Math.random() * alertStatuses.length)];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      
      const alert = await prisma.alert.create({
        data: {
          schoolId: student.schoolId,
          studentId: student.id,
          sourceId: `JOURNAL_${Math.random().toString(36).substring(2, 15)}`,
          sourceType: 'JOURNAL',
          riskLevel,
          riskScore: Math.floor(Math.random() * 100) + 1,
          childMood: mood,
          aiSummary: `Analyse IA : L'élève ${student.firstName} ${student.lastName} présente des signes de ${mood.toLowerCase()}. Situation à surveiller.`,
          aiAdvice: `Conseil IA : Encourager le dialogue avec l'élève et surveiller son comportement en classe.`,
          status
        }
      });
      alerts.push(alert);
    }
    console.log(`✅ ${alerts.length} alertes créées`);
    
    // 5. Créer 100 signalements
    console.log('📝 Création de 100 signalements...');
    const reports = [];
    
    for (let i = 0; i < 100; i++) {
      const school = schools[Math.floor(Math.random() * schools.length)];
      const student = Math.random() > 0.3 ? students.find(s => s.schoolId === school.id) : null;
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
      const status = reportStatuses[Math.floor(Math.random() * reportStatuses.length)];
      const anonymous = Math.random() > 0.7;
      
      const contents = [
        'Élève agressif en récréation',
        'Problème de comportement en classe',
        'Harcèlement suspecté',
        'Élève isolé et triste',
        'Conflit entre élèves',
        'Problème de concentration',
        'Élève agité et perturbateur',
        'Difficultés relationnelles',
        'Comportement inquiétant',
        'Élève en souffrance apparente'
      ];
      
      const content = contents[Math.floor(Math.random() * contents.length)];
      
      const report = await prisma.report.create({
        data: {
          schoolId: school.id,
          studentId: student ? student.id : null,
          content: `${content}${student ? ` - Élève concerné : ${student.firstName} ${student.lastName}` : ''}`,
          urgency,
          anonymous,
          status
        }
      });
      reports.push(report);
    }
    console.log(`✅ ${reports.length} signalements créés`);
    
    // 6. Créer quelques entrées de journal
    console.log('📖 Création d\'entrées de journal...');
    for (let i = 0; i < 50; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      
      const journalContents = [
        `Aujourd'hui, je me sens ${mood.toLowerCase()}.`,
        `La journée s'est bien passée. Je suis ${mood.toLowerCase()}.`,
        `J'ai eu quelques difficultés aujourd'hui. Je me sens ${mood.toLowerCase()}.`,
        `Super journée ! Je suis ${mood.toLowerCase()}.`,
        `J'ai passé une journée normale. Je me sens ${mood.toLowerCase()}.`
      ];
      
      const journalId = `journal_${Math.random().toString(36).substring(2, 15)}`;
      const content = journalContents[Math.floor(Math.random() * journalContents.length)];
      
      await prisma.$executeRawUnsafe(`
        INSERT INTO "journal_entries" ("id", "studentId", "content", "mood", "createdAt", "contentText")
        VALUES ('${journalId}', '${student.id}', '${content.replace(/'/g, "''")}', '${mood}', CURRENT_TIMESTAMP, '${content.replace(/'/g, "''")}')
      `);
    }
    console.log('✅ 50 entrées de journal créées');
    
    // 7. Créer quelques messages de chat
    console.log('💬 Création de messages de chat...');
    for (let i = 0; i < 30; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const sender = Math.random() > 0.5 ? 'STUDENT' : 'AGENT';
      
      const messages = [
        'Bonjour, comment allez-vous ?',
        'J\'ai besoin d\'aide avec mes devoirs.',
        'Je me sens un peu triste aujourd\'hui.',
        'Merci pour votre soutien.',
        'Pouvez-vous m\'aider ?',
        'Je vais bien, merci !',
        'J\'ai des questions sur l\'école.',
        'Je me sens mieux maintenant.'
      ];
      
      await prisma.chatMessage.create({
        data: {
          studentId: student.id,
          message: messages[Math.floor(Math.random() * messages.length)],
          sender
        }
      });
    }
    console.log('✅ 30 messages de chat créés');
    
    console.log('\n🎉 Seeding terminé avec succès !');
    console.log(`📊 Résumé :`);
    console.log(`   🏫 Écoles : ${schools.length}`);
    console.log(`   👨‍🏫 Agents : ${agents.length}`);
    console.log(`   👶 Élèves : ${students.length}`);
    console.log(`   🚨 Alertes : ${alerts.length}`);
    console.log(`   📝 Signalements : ${reports.length}`);
    console.log(`   📖 Entrées journal : 50`);
    console.log(`   💬 Messages chat : 30`);
    
    console.log('\n🔑 Comptes de test :');
    console.log('   Admin : admin@melio.com / admin123');
    for (let i = 0; i < 3; i++) {
      console.log(`   Agent ${i + 1} : agent${i + 1}@${schools[i].name.toLowerCase().replace(/\s+/g, '')}.fr / agent123`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData().catch(console.error);

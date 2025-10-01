import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedComplete() {
  console.log('🌱 Début du seeding complet...');
  
  try {
    // Nettoyer la base de données d'abord
    console.log('🧹 Nettoyage de la base de données...');
    await prisma.chatbotMessage.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.report.deleteMany();
    await prisma.student.deleteMany();
    await prisma.agentUser.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.school.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.achievement.deleteMany();
    console.log('✅ Base de données nettoyée');

    // 1. Créer les tags
    console.log('🏷️ Création des tags...');
    const tags = [
      { id: 'tag_school', name: 'École', icon: '🏫', color: '#3b82f6', category: 'Activité' },
      { id: 'tag_friends', name: 'Amis', icon: '👥', color: '#10b981', category: 'Social' },
      { id: 'tag_family', name: 'Famille', icon: '👨‍👩‍👧', color: '#f59e0b', category: 'Social' },
      { id: 'tag_sport', name: 'Sport', icon: '⚽', color: '#ef4444', category: 'Activité' },
      { id: 'tag_creativity', name: 'Créativité', icon: '🎨', color: '#a855f7', category: 'Activité' },
      { id: 'tag_homework', name: 'Devoirs', icon: '📚', color: '#6b7280', category: 'École' },
      { id: 'tag_thoughts', name: 'Pensées', icon: '💭', color: '#8b5cf6', category: 'Émotion' },
      { id: 'tag_emotions', name: 'Émotions', icon: '❤️', color: '#ec4899', category: 'Émotion' },
      { id: 'tag_event', name: 'Événement', icon: '🎉', color: '#f97316', category: 'Vie' },
      { id: 'tag_difficulty', name: 'Difficulté', icon: '😟', color: '#dc2626', category: 'Émotion' },
      { id: 'tag_success', name: 'Réussite', icon: '🌟', color: '#fbbf24', category: 'Vie' },
      { id: 'tag_help', name: 'Besoin d\'aide', icon: '🆘', color: '#b91c1c', category: 'Important' },
    ];

    for (const tag of tags) {
      await prisma.tag.create({ data: tag });
    }
    console.log('✅ 12 tags créés');

    // 2. Créer les achievements
    console.log('🏆 Création des achievements...');
    const achievements = [
      { code: 'first_entry', name: 'Premier Pas', description: 'Tu as écrit ta première entrée de journal !', icon: '🌱', category: 'WRITING', threshold: 1 },
      { code: 'week_streak', name: 'Semaine Parfaite', description: '7 jours consécutifs d\'écriture, bravo !', icon: '🔥', category: 'STREAK', threshold: 7 },
      { code: 'writer_30', name: 'Écrivain', description: '30 entrées dans ton journal, continue !', icon: '📖', category: 'WRITING', threshold: 30 },
      { code: 'regular_30', name: 'Régulier', description: '30 jours consécutifs, quelle persévérance !', icon: '🎯', category: 'STREAK', threshold: 30 },
      { code: 'champion_100', name: 'Champion', description: '100 entrées totales, tu es incroyable !', icon: '🌟', category: 'WRITING', threshold: 100 },
      { code: 'transformation', name: 'Transformation', description: 'Amélioration visible de ton humeur', icon: '🦋', category: 'SPECIAL', threshold: null },
      { code: 'courage', name: 'Courageux', description: 'Tu as fait un signalement, merci pour ton courage', icon: '💪', category: 'ENGAGEMENT', threshold: 1 },
      { code: 'open_heart', name: 'Cœur Ouvert', description: 'Tu as partagé tes émotions avec Mélio', icon: '❤️', category: 'ENGAGEMENT', threshold: 1 },
      { code: 'rainbow', name: 'Arc-en-ciel', description: 'Tu as exprimé toutes les humeurs', icon: '🌈', category: 'SPECIAL', threshold: null },
      { code: 'creative', name: 'Créatif', description: '10 photos ajoutées à ton journal', icon: '🎨', category: 'WRITING', threshold: 10 },
    ];

    for (const achievement of achievements) {
      await prisma.achievement.create({ data: achievement });
    }
    console.log('✅ 10 achievements créés');

    // 3. Créer l'admin
    console.log('👑 Création de l\'admin...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    await prisma.adminUser.create({
      data: {
        email: 'admin@melio.app',
        password: adminPassword,
        role: 'ROLE_ADMIN_MELIO',
      },
    });
    console.log('✅ Admin créé: admin@melio.app / admin123');

    // 4. Créer les écoles avec des codes fixes
    console.log('🏫 Création des écoles...');
    const schoolsData = [
      { code: 'SCHOOL001', name: 'Collège Victor Hugo', city: 'Paris', postalCode: '75001', level: 'COLLEGE' },
      { code: 'SCHOOL002', name: 'Lycée Louis Pasteur', city: 'Lyon', postalCode: '69001', level: 'LYCEE' },
      { code: 'SCHOOL003', name: 'École Primaire Marie Curie', city: 'Marseille', postalCode: '13001', level: 'PRIMARY' },
      { code: 'SCHOOL004', name: 'Collège Jules Verne', city: 'Toulouse', postalCode: '31000', level: 'COLLEGE' },
      { code: 'SCHOOL005', name: 'Lycée Albert Einstein', city: 'Nice', postalCode: '06000', level: 'LYCEE' },
      { code: 'SCHOOL006', name: 'École Maternelle Les Petits Loups', city: 'Nantes', postalCode: '44000', level: 'PRIMARY' },
      { code: 'SCHOOL007', name: 'Collège Jean Moulin', city: 'Strasbourg', postalCode: '67000', level: 'COLLEGE' },
      { code: 'SCHOOL008', name: 'Lycée Claude Monet', city: 'Montpellier', postalCode: '34000', level: 'LYCEE' },
      { code: 'SCHOOL009', name: 'École Primaire Les Lilas', city: 'Bordeaux', postalCode: '33000', level: 'PRIMARY' },
      { code: 'SCHOOL010', name: 'Collège Simone Veil', city: 'Lille', postalCode: '59000', level: 'COLLEGE' },
    ];

    const schools = [];
    for (const schoolData of schoolsData) {
      const school = await prisma.school.create({
        data: {
          code: schoolData.code,
          name: schoolData.name,
          address1: `${Math.floor(Math.random() * 200) + 1} rue de la République`,
          postalCode: schoolData.postalCode,
          city: schoolData.city,
          country: 'FR',
          timezone: 'Europe/Paris',
          level: schoolData.level,
          uaiCode: `${schoolData.postalCode.substring(0, 2)}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          contactName: `Directeur ${schoolData.name.split(' ')[1]}`,
          contactEmail: `contact@${schoolData.code.toLowerCase()}.fr`,
          contactPhone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
          idKey: Buffer.from(`test-key-for-${schoolData.code}-identification-123456789012`).toString('base64url'),
          idKeyVer: 1,
          settings: JSON.stringify({ theme: 'default' }),
          status: 'ACTIVE',
        },
      });
      schools.push(school);
    }
    console.log('✅ 10 écoles créées');

    // 5. Créer les agents
    console.log('👨‍💼 Création des agents...');
    const agents = [];
    for (const school of schools) {
      const hashedPassword = await bcrypt.hash('agent123', 12);
      const agent = await prisma.agentUser.create({
        data: {
          email: `agent@${school.code.toLowerCase()}.fr`,
          password: hashedPassword,
          schoolId: school.id,
          role: 'ROLE_AGENT',
        },
      });
      agents.push(agent);
    }
    console.log('✅ 10 agents créés');

    // 6. Créer les élèves
    console.log('👦👧 Création des élèves...');
    const firstNames = [
      'Emma', 'Lucas', 'Chloé', 'Nathan', 'Léa', 'Hugo', 'Manon', 'Gabriel', 'Camille', 'Raphaël',
      'Sarah', 'Louis', 'Océane', 'Arthur', 'Lola', 'Jules', 'Marie', 'Tom', 'Inès', 'Paul',
      'Louise', 'Noah', 'Alice', 'Ethan', 'Anna', 'Liam', 'Clara', 'Adam', 'Zoé', 'Léo',
      'Maya', 'Eliott', 'Julia', 'Charlotte', 'Antoine', 'Maxime', 'Alexandre', 'Léna', 'Théo', 'Romane',
      'Mathis', 'Juliette', 'Enzo', 'Ambre', 'Pierre', 'Nicolas', 'Éva', 'Baptiste', 'Lilou', 'Sacha',
      'Rose', 'Romain', 'Luna', 'Alexis', 'Maëlys', 'Valentin', 'Timéo', 'Lina', 'Malo', 'Lya',
      'Yanis', 'Élise', 'Gabin', 'Léonie', 'Lucien', 'Nina', 'Axel', 'Mya', 'Naël', 'Alya',
      'Éden', 'Alba', 'Lyam', 'Lila', 'Lohan', 'Sofia', 'Kylian', 'Nino', 'Maëlle', 'Ilyès',
      'Lou', 'Milan', 'Noam', 'Léa', 'Ethan', 'Anna', 'Liam', 'Clara', 'Adam', 'Zoé'
    ];

    const lastNames = [
      'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent',
      'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard',
      'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Lefevre', 'Faure', 'Andre',
      'Mercier', 'Blanc', 'Guerin', 'Boyer', 'Garnier', 'Chevalier', 'Francois', 'Legrand', 'Gauthier', 'Garcia',
      'Perrin', 'Robin', 'Clement', 'Morin', 'Henry', 'Roussel', 'Mathieu', 'Gautier', 'Masson', 'Marchand',
      'Duval', 'Denis', 'Dumont', 'Marie', 'Lemaire', 'Noel', 'Meyer', 'Dufour', 'Meunier', 'Brun',
      'Blanchard', 'Giraud', 'Joly', 'Riviere', 'Lucas', 'Brunet', 'Gaillard', 'Barbier', 'Arnaud', 'Martinez',
      'Roche', 'Renard', 'Schmitt', 'Roy', 'Leroux', 'Colin', 'Vidal', 'Caron', 'Picard', 'Roger'
    ];

    const classes = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6eA', '6eB', '5eA', '5eB', '4eA', '4eB', '3eA', '3eB', '2ndeA', '2ndeB', '1èreA', '1èreB', 'TermA', 'TermB'];

    // Fonction pour supprimer les accents
    const removeAccents = (str: string): string => {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    const students = [];
    for (let i = 0; i < 100; i++) {
      const school = schools[i % schools.length];
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const className = classes[i % classes.length];
      const uniqueId = `STU${(i + 1).toString().padStart(3, '0')}`; // STU001, STU002, etc. - ID fixe pour les tests

      const student = await prisma.student.create({
        data: {
          // Pas d'id spécifié - Prisma génère un ID normal
          schoolId: school.id,
          firstName,
          lastName,
          birthdate: new Date(2005 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          sex: Math.random() < 0.5 ? 'M' : 'F',
          className,
          parentName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          parentPhone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
          parentEmail: Math.random() < 0.8 ? `parent.${lastName.toLowerCase()}@email.fr` : null,
          uniqueId, // ID fixe pour les tests
          uniqueIdVer: 1,
        },
      });
      students.push(student);
    }
    console.log('✅ 100 élèves créés');

    // 7. Créer les alertes
    console.log('🚨 Création des alertes...');
    const alertContents = [
      'L\'élève semble isolé pendant les récréations et évite les interactions avec ses camarades.',
      'Incidents répétés de moqueries et d\'insultes dans la cour de récréation.',
      'L\'élève présente des signes d\'anxiété et de stress lors des examens.',
      'Conflits fréquents avec certains camarades de classe, tensions visibles.',
      'L\'élève semble déprimé et manque d\'enthousiasme pour les activités scolaires.',
      'Comportement agressif observé envers d\'autres élèves, nécessite une attention particulière.',
      'L\'élève a des difficultés à s\'intégrer dans le groupe classe.',
      'Signes de harcèlement potentiel, l\'élève semble intimidé par certains pairs.',
      'L\'élève présente des troubles de l\'attention et de la concentration.',
      'Problèmes de communication avec les enseignants et les autres élèves.',
    ];

    const alertAdvice = [
      'Rencontrer l\'élève en privé pour comprendre la situation et lui apporter du soutien.',
      'Organiser une médiation entre l\'élève et ses camarades pour résoudre les conflits.',
      'Impliquer les parents dans le suivi et la résolution de la situation.',
      'Mettre en place un système de parrainage avec un élève plus âgé et bienveillant.',
      'Proposer des activités de groupe pour favoriser l\'intégration sociale.',
      'Orienter l\'élève vers le psychologue scolaire pour un accompagnement spécialisé.',
      'Renforcer les règles de respect et de bienveillance dans la classe.',
      'Créer un environnement sécurisé et inclusif pour tous les élèves.',
      'Développer des compétences sociales et émotionnelles chez l\'élève.',
      'Mettre en place un suivi régulier et personnalisé de la situation.',
    ];

    const riskLevels = ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE'];
    const alertStatuses = ['NOUVELLE', 'EN_COURS', 'TRAITEE'];

    for (let i = 0; i < 200; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const status = alertStatuses[Math.floor(Math.random() * alertStatuses.length)];
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);

      await prisma.alert.create({
        data: {
          schoolId: student.schoolId,
          studentId: student.id,
          sourceId: `journal_${i}`,
          sourceType: 'JOURNAL',
          riskLevel,
          riskScore: Math.floor(Math.random() * 100),
          childMood: ['TRISTE', 'ANXIEUX', 'COLERE', 'PEUR', 'ISOLEMENT'][Math.floor(Math.random() * 5)],
          aiSummary: alertContents[Math.floor(Math.random() * alertContents.length)],
          aiAdvice: alertAdvice[Math.floor(Math.random() * alertAdvice.length)],
          status,
          createdAt,
        },
      });
    }
    console.log('✅ 200 alertes créées');

    // 8. Créer les signalements
    console.log('📢 Création des signalements...');
    const reportContents = [
      'J\'ai vu un camarade se faire insulter dans le bus scolaire ce matin.',
      'Un élève de ma classe est régulièrement exclu des jeux pendant la récréation.',
      'Des moqueries répétées sur l\'apparence physique d\'un élève de ma classe.',
      'Un groupe d\'élèves intimide un camarade plus jeune dans les couloirs.',
      'J\'ai entendu des propos racistes envers un élève de ma classe.',
      'Un élève de ma classe semble triste et isolé, personne ne lui parle.',
      'Des bagarres ont éclaté dans la cour de récréation, plusieurs élèves sont impliqués.',
      'Un élève de ma classe est victime de cyberharcèlement sur les réseaux sociaux.',
      'Des vols répétés dans les casiers, plusieurs élèves sont concernés.',
      'Un élève de ma classe est harcelé à cause de ses résultats scolaires.',
    ];

    const urgencies = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const reportStatuses = ['NOUVEAU', 'EN_COURS', 'TRAITE'];

    for (let i = 0; i < 100; i++) {
      const school = schools[Math.floor(Math.random() * schools.length)];
      const student = Math.random() < 0.7 ? students[Math.floor(Math.random() * students.length)] : null;
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
      const status = reportStatuses[Math.floor(Math.random() * reportStatuses.length)];
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);

      await prisma.report.create({
        data: {
          schoolId: school.id,
          studentId: student?.id || null,
          content: reportContents[Math.floor(Math.random() * reportContents.length)],
          urgency,
          anonymous: !student,
          status,
          createdAt,
          updatedAt: createdAt,
        },
      });
    }
    console.log('✅ 100 signalements créés');

    // 9. Créer des entrées de journal
    console.log('📝 Création des entrées de journal...');
    const moods = ['TRISTE', 'HEUREUX', 'ANXIEUX', 'COLERE', 'PEUR', 'ISOLEMENT', 'STRESS'];
    const journalStudents = students.slice(0, 50);

    for (const student of journalStudents) {
      const entryCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < entryCount; i++) {
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        await prisma.journalEntry.create({
          data: {
            studentId: student.id,
            mood: moods[Math.floor(Math.random() * moods.length)],
            contentText: `Entrée de journal du ${createdAt.toLocaleDateString('fr-FR')}. ${alertContents[Math.floor(Math.random() * alertContents.length)]}`,
            aiRiskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
            aiRiskScore: Math.floor(Math.random() * 100),
            aiSummary: alertContents[Math.floor(Math.random() * alertContents.length)],
            aiAdvice: alertAdvice[Math.floor(Math.random() * alertAdvice.length)],
            processedAt: createdAt,
          },
        });
      }
    }
    console.log('✅ Entrées de journal créées');

    // 10. Créer des messages de chatbot
    console.log('💬 Création des messages de chatbot...');
    const chatbotMessages = [
      'Bonjour ! Je suis là pour t\'écouter. Comment te sens-tu aujourd\'hui ?',
      'Je comprends que tu traverses une période difficile. Tu n\'es pas seul(e).',
      'C\'est courageux de partager tes sentiments. Je suis fier(e) de toi.',
      'N\'hésite pas à parler à un adulte de confiance si tu en ressens le besoin.',
      'Tu mérites d\'être respecté(e) et traité(e) avec bienveillance.',
      'Si tu as des problèmes, n\'hésite pas à en parler à tes parents ou à un enseignant.',
      'Je suis là pour t\'aider. Tu peux me faire confiance.',
      'Prends soin de toi et n\'oublie pas que tu es important(e).',
    ];

    const chatbotStudents = students.slice(0, 30);
    for (const student of chatbotStudents) {
      const messageCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < messageCount; i++) {
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        await prisma.chatbotMessage.create({
          data: {
            studentId: student.id,
            type: Math.random() < 0.5 ? 'USER' : 'BOT',
            content: chatbotMessages[Math.floor(Math.random() * chatbotMessages.length)],
            createdAt,
          },
        });
      }
    }
    console.log('✅ Messages de chatbot créés');

    console.log('🎉 Seeding complet terminé avec succès !');
    console.log('📊 Résumé :');
    console.log(`   🏫 Écoles : ${schools.length}`);
    console.log(`   👨‍💼 Agents : ${agents.length}`);
    console.log(`   👦👧 Élèves : ${students.length}`);
    console.log(`   🏷️ Tags : ${tags.length}`);
    console.log(`   🏆 Achievements : ${achievements.length}`);
    console.log(`   🚨 Alertes : 200`);
    console.log(`   📝 Signalements : 100`);
    console.log(`   📖 Entrées journal : ~50`);
    console.log(`   💬 Messages chatbot : ~30`);
    console.log('');
    console.log('🔑 Comptes de test :');
    console.log('   Admin : admin@melio.app / admin123');
    console.log('   Agents : agent@school001.fr, agent@school002.fr, etc. / agent123');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedComplete()
  .then(() => {
    console.log('🎉 Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });

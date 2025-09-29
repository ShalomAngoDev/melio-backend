import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Données réalistes pour la France
const schoolNames = [
  'Collège Victor Hugo', 'Lycée Louis Pasteur', 'École Primaire Marie Curie',
  'Collège Jean Moulin', 'Lycée Simone de Beauvoir', 'École Primaire Jules Ferry',
  'Collège Albert Camus', 'Lycée Marie Curie', 'École Primaire Victor Hugo',
  'Collège George Sand'
];

const cities = [
  { name: 'Paris', postalCode: '75001' },
  { name: 'Lyon', postalCode: '69001' },
  { name: 'Marseille', postalCode: '13001' },
  { name: 'Toulouse', postalCode: '31000' },
  { name: 'Nice', postalCode: '06000' },
  { name: 'Nantes', postalCode: '44000' },
  { name: 'Strasbourg', postalCode: '67000' },
  { name: 'Montpellier', postalCode: '34000' },
  { name: 'Bordeaux', postalCode: '33000' },
  { name: 'Lille', postalCode: '59000' }
];

const firstNames = [
  'Lucas', 'Emma', 'Liam', 'Sophia', 'Noah', 'Isabella', 'William', 'Olivia',
  'James', 'Ava', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Henry', 'Mia',
  'Alexander', 'Harper', 'Mason', 'Evelyn', 'Michael', 'Abigail', 'Ethan', 'Emily',
  'Daniel', 'Elizabeth', 'Jacob', 'Mila', 'Logan', 'Ella', 'Jackson', 'Avery',
  'Levi', 'Sofia', 'Sebastian', 'Camila', 'Mateo', 'Aria', 'Jack', 'Scarlett',
  'Owen', 'Victoria', 'Theodore', 'Madison', 'Aiden', 'Luna', 'Samuel', 'Grace',
  'Joseph', 'Chloe', 'John', 'Penelope', 'David', 'Layla', 'Wyatt', 'Riley',
  'Matthew', 'Zoey', 'Luke', 'Nora', 'Asher', 'Lily', 'Carter', 'Eleanor',
  'Julian', 'Hannah', 'Grayson', 'Lillian', 'Leo', 'Addison', 'Jayden', 'Aubrey',
  'Gabriel', 'Ellie', 'Isaac', 'Stella', 'Lincoln', 'Natalie', 'Anthony', 'Zoe',
  'Hudson', 'Leah', 'Dylan', 'Hazel', 'Ezra', 'Violet', 'Thomas', 'Aurora',
  'Charles', 'Savannah', 'Christopher', 'Audrey', 'Jaxon', 'Brooklyn', 'Maverick', 'Bella',
  'Josiah', 'Claire', 'Isaiah', 'Skylar', 'Andrew', 'Lucy', 'Elias', 'Paisley'
];

const lastNames = [
  'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois',
  'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David',
  'Bertrand', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupont', 'Lambert', 'Fontaine',
  'Rousseau', 'Vincent', 'Muller', 'Lefevre', 'Faure', 'Andre', 'Mercier', 'Blanc',
  'Guerin', 'Boyer', 'Garnier', 'Chevalier', 'Francois', 'Legrand', 'Gauthier', 'Garcia',
  'Perrin', 'Robin', 'Clement', 'Morin', 'Nicolas', 'Henry', 'Roussel', 'Mathieu',
  'Gautier', 'Masson', 'Marchand', 'Duval', 'Denis', 'Dumont', 'Marie', 'Lemaire',
  'Noel', 'Meyer', 'Dufour', 'Meunier', 'Brun', 'Blanchard', 'Giraud', 'Joly',
  'Riviere', 'Lucas', 'Brunet', 'Gaillard', 'Barbier', 'Arnaud', 'Martinez', 'Jean',
  'Renard', 'Simon', 'Moulin', 'Lopez', 'Fontaine', 'Chevalier', 'Paul', 'Dupuis'
];

const classNames = [
  '6eA', '6eB', '6eC', '6eD', '5eA', '5eB', '5eC', '5eD',
  '4eA', '4eB', '4eC', '4eD', '3eA', '3eB', '3eC', '3eD',
  '2ndeA', '2ndeB', '2ndeC', '2ndeD', '1èreA', '1èreB', '1èreC', '1èreD',
  'TermA', 'TermB', 'TermC', 'TermD', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'
];

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
  'L\'élève semble en conflit avec l\'autorité et les règles de l\'établissement.',
  'Signes de mal-être psychologique, l\'élève paraît triste et renfermé.',
  'L\'élève a des difficultés à gérer ses émotions et ses relations sociales.',
  'Comportement perturbateur en classe, impact sur l\'apprentissage des autres.',
  'L\'élève semble victime d\'exclusion sociale de la part de ses camarades.'
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
  'Mettre en place un suivi régulier et personnalisé de la situation.'
];

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
  'Des propos homophobes ont été tenus envers un élève de ma classe.',
  'Un élève de ma classe est exclu des activités de groupe de manière systématique.',
  'Des menaces ont été proférées envers un élève de ma classe.',
  'Un élève de ma classe semble victime de racket dans les toilettes.',
  'Des moqueries répétées sur le handicap d\'un élève de ma classe.'
];

// Fonction pour générer un code école (initiales + code postal)
function generateSchoolCode(name: string, postalCode: string): string {
  const words = name.split(' ');
  const initials = words.map(word => word.charAt(0)).join('').substring(0, 3);
  const codeNumber = postalCode.substring(0, 2);
  return `${initials}${codeNumber}`;
}

// Fonction pour générer un UAI fictif
function generateUAI(): string {
  const numbers = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${numbers}${letter}`;
}

// Fonction pour générer un identifiant unique d'élève
function generateStudentUniqueId(schoolCode: string, firstName: string, lastName: string, birthdate: Date): string {
  const data = `${schoolCode}${firstName}${lastName}${birthdate.toISOString()}`;
  const hash = crypto.createHmac('sha256', 'melio-secret-key').update(data).digest('hex');
  return hash.substring(0, 6).toUpperCase();
}

// Fonction pour générer une date aléatoire dans une plage
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Fonction pour choisir un élément aléatoire dans un tableau
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Fonction pour choisir plusieurs éléments aléatoires
function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function seedTestData() {
  console.log('🌱 Début de la génération des données de test...');

  try {
    // Nettoyer la base de données
    console.log('🧹 Nettoyage de la base de données...');
    try {
      // Supprimer dans l'ordre inverse des dépendances
      await prisma.alertComment.deleteMany();
      await prisma.alert.deleteMany();
      await prisma.report.deleteMany();
      await prisma.chatbotMessage.deleteMany();
      await prisma.journalEntry.deleteMany();
      await prisma.student.deleteMany();
      await prisma.agentUser.deleteMany();
      await prisma.adminUser.deleteMany();
      await prisma.school.deleteMany();
    } catch (error) {
      console.log('⚠️  Certaines données n\'ont pas pu être supprimées, continuation...');
    }

    // 1. Créer les écoles (10)
    console.log('🏫 Création des écoles...');
    const schools = [];
    for (let i = 0; i < 10; i++) {
      const city = randomChoice(cities);
      const schoolName = schoolNames[i];
      const schoolCode = generateSchoolCode(schoolName, city.postalCode);
      const uaiCode = generateUAI();
      
      const school = await prisma.school.create({
        data: {
          code: schoolCode,
          name: schoolName,
          address1: `${Math.floor(Math.random() * 200) + 1} rue de la République`,
          address2: i % 3 === 0 ? 'Bâtiment A' : null,
          postalCode: city.postalCode,
          city: city.name,
          country: 'FR',
          timezone: 'Europe/Paris',
          level: i < 3 ? 'PRIMARY' : i < 7 ? 'COLLEGE' : 'LYCEE',
          uaiCode: uaiCode,
          contactName: `Directeur ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          contactEmail: `contact@${schoolCode.toLowerCase()}.fr`,
          contactPhone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
          idKey: crypto.randomBytes(32).toString('base64url'),
          idKeyVer: 1,
          settings: JSON.stringify({
            dataRetentionMonths: 24,
            aiThresholds: {
              low: 0.3,
              medium: 0.6,
              high: 0.8,
              critical: 0.9
            },
            notify: {
              critical: 'realtime',
              others: 'daily'
            }
          }),
          status: 'ACTIVE'
        }
      });
      schools.push(school);
    }

    // 2. Créer les agents (1 par école)
    console.log('👨‍💼 Création des agents...');
    const agents = [];
    for (const school of schools) {
      const hashedPassword = await bcrypt.hash('agent123', 12);
      const agent = await prisma.agentUser.create({
        data: {
          email: `agent@${school.code.toLowerCase()}.fr`,
          password: hashedPassword,
          schoolId: school.id,
          role: 'ROLE_AGENT'
        }
      });
      agents.push(agent);
    }

    // 3. Créer les élèves (100, répartis équitablement)
    console.log('👦👧 Création des élèves...');
    const students = [];
    const studentsPerSchool = Math.floor(100 / schools.length);
    
    for (let i = 0; i < schools.length; i++) {
      const school = schools[i];
      const studentCount = i === schools.length - 1 ? 100 - (studentsPerSchool * (schools.length - 1)) : studentsPerSchool;
      
      for (let j = 0; j < studentCount; j++) {
        const firstName = randomChoice(firstNames);
        const lastName = randomChoice(lastNames);
        const birthdate = randomDate(new Date(2005, 0, 1), new Date(2015, 11, 31));
        const uniqueId = generateStudentUniqueId(school.code, firstName, lastName, birthdate);
        const className = randomChoice(classNames);
        
        const student = await prisma.student.create({
          data: {
            schoolId: school.id,
            firstName: firstName,
            lastName: lastName,
            birthdate: birthdate,
            sex: Math.random() < 0.5 ? 'M' : 'F',
            className: className,
            parentName: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
            parentPhone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
            parentEmail: Math.random() < 0.8 ? `parent.${lastName.toLowerCase()}@email.fr` : null,
            uniqueId: uniqueId,
            uniqueIdVer: 1
          }
        });
        students.push(student);
      }
    }

    // 4. Créer les alertes IA (200)
    console.log('🚨 Création des alertes IA...');
    const alertStatuses = ['NOUVELLE', 'EN_COURS', 'TRAITEE'];
    const alertStatusWeights = [0.3, 0.3, 0.4];
    const riskLevels = ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE'];
    const riskWeights = [0.4, 0.3, 0.2, 0.1];
    
    for (let i = 0; i < 200; i++) {
      const student = randomChoice(students);
      const status = weightedRandomChoice(alertStatuses, alertStatusWeights);
      const riskLevel = weightedRandomChoice(riskLevels, riskWeights);
      
      // Générer des dates avec plus d'alertes récentes
      let createdAt;
      const now = new Date();
      if (i < 50) {
        // 50 alertes des derniers 7 jours
        createdAt = randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
      } else if (i < 100) {
        // 50 alertes des derniers 30 jours
        createdAt = randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      } else {
        // 100 alertes des derniers 90 jours
        createdAt = randomDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      }
      
      await prisma.alert.create({
        data: {
          schoolId: student.schoolId,
          studentId: student.id,
          sourceId: `journal_${i}`,
          sourceType: 'JOURNAL',
          riskLevel: riskLevel,
          riskScore: Math.floor(Math.random() * 100),
          childMood: randomChoice(['TRISTE', 'ANXIEUX', 'COLERE', 'PEUR', 'ISOLEMENT']),
          aiSummary: randomChoice(alertContents),
          aiAdvice: randomChoice(alertAdvice),
          status: status,
          createdAt: createdAt
        }
      });
    }

    // 5. Créer les signalements directs (60)
    console.log('📢 Création des signalements directs...');
    const reportStatuses = ['NOUVEAU', 'EN_COURS', 'TRAITE'];
    const reportStatusWeights = [0.4, 0.3, 0.3];
    const urgencyLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const urgencyWeights = [0.3, 0.3, 0.25, 0.15];
    
    for (let i = 0; i < 60; i++) {
      const school = randomChoice(schools);
      const status = weightedRandomChoice(reportStatuses, reportStatusWeights);
      const urgency = weightedRandomChoice(urgencyLevels, urgencyWeights);
      const anonymous = Math.random() < 0.3;
      const student = anonymous ? null : randomChoice(students.filter(s => s.schoolId === school.id));
      
      // Générer des dates avec plus de signalements récents
      let createdAt;
      const now = new Date();
      if (i < 20) {
        // 20 signalements des derniers 7 jours
        createdAt = randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
      } else if (i < 40) {
        // 20 signalements des derniers 30 jours
        createdAt = randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      } else {
        // 20 signalements des derniers 90 jours
        createdAt = randomDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      }
      
      await prisma.report.create({
        data: {
          schoolId: school.id,
          studentId: student?.id || null,
          content: randomChoice(reportContents),
          urgency: urgency,
          anonymous: anonymous,
          status: status,
          createdAt: createdAt,
          updatedAt: createdAt
        }
      });
    }

    // 6. Créer quelques entrées de journal pour les élèves
    console.log('📝 Création des entrées de journal...');
    const journalStudents = randomChoices(students, 50);
    const moods = ['TRISTE', 'HEUREUX', 'ANXIEUX', 'COLERE', 'PEUR', 'ISOLEMENT', 'STRESS'];
    
    for (const student of journalStudents) {
      const entryCount = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < entryCount; i++) {
        const createdAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()); // Derniers 30 jours
        await prisma.journalEntry.create({
          data: {
            studentId: student.id,
            mood: randomChoice(moods),
            contentText: `Entrée de journal du ${createdAt.toLocaleDateString('fr-FR')}. ${randomChoice(alertContents)}`,
            aiRiskLevel: randomChoice(['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE']),
            aiRiskScore: Math.floor(Math.random() * 100),
            aiSummary: randomChoice(alertContents),
            aiAdvice: randomChoice(alertAdvice),
            processedAt: createdAt
          }
        });
      }
    }

    // 7. Créer quelques messages de chatbot
    console.log('🤖 Création des messages de chatbot...');
    const chatbotStudents = randomChoices(students, 30);
    const chatbotMessages = [
      'Bonjour ! Je suis là pour t\'écouter. Comment te sens-tu aujourd\'hui ?',
      'Je comprends que tu traverses une période difficile. Tu n\'es pas seul(e).',
      'C\'est courageux de partager tes sentiments. Je suis fier(e) de toi.',
      'N\'hésite pas à parler à un adulte de confiance si tu en ressens le besoin.',
      'Tu mérites d\'être respecté(e) et traité(e) avec bienveillance.',
      'Si tu as des problèmes, n\'hésite pas à en parler à tes parents ou à un enseignant.',
      'Je suis là pour t\'aider. Tu peux me faire confiance.',
      'Prends soin de toi et n\'oublie pas que tu es important(e).'
    ];
    
    for (const student of chatbotStudents) {
      const messageCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < messageCount; i++) {
        const createdAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()); // Derniers 30 jours
        await prisma.chatbotMessage.create({
          data: {
            studentId: student.id,
            type: Math.random() < 0.5 ? 'USER' : 'BOT',
            content: randomChoice(chatbotMessages),
            createdAt: createdAt
          }
        });
      }
    }

    console.log('✅ Données de test générées avec succès !');
    console.log(`📊 Résumé :`);
    console.log(`   - ${schools.length} écoles créées`);
    console.log(`   - ${agents.length} agents créés`);
    console.log(`   - ${students.length} élèves créés`);
    console.log(`   - 200 alertes IA créées`);
    console.log(`   - 60 signalements créés`);
    console.log(`   - Entrées de journal et messages de chatbot créés`);

  } catch (error) {
    console.error('❌ Erreur lors de la génération des données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour choisir un élément avec des poids
function weightedRandomChoice<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

// Exécuter le script
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('🎉 Script terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { seedTestData };

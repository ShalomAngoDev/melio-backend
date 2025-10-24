#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedComplete() {
  console.log('🌱 Début du seeding complet...');
  
  try {
    // Nettoyer la base de données d'abord (dans le bon ordre pour les clés étrangères)
    console.log('🧹 Nettoyage de la base de données...');
    
    await prisma.chatMessage.deleteMany();
    await prisma.chatbotMessage.deleteMany();
    await prisma.journalEntryTag.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.alertComment.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.report.deleteMany();
    await prisma.studentAchievement.deleteMany();
    await prisma.studentResourceView.deleteMany();
    await prisma.studentResourceRating.deleteMany();
    await prisma.studentResourceFavorite.deleteMany();
    await prisma.student.deleteMany();
    // agent_schools sera supprimé automatiquement par CASCADE quand on supprime les agents
    await prisma.agentUser.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.libraryResource.deleteMany();
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
      try {
        await prisma.tag.create({
          data: tag,
        });
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Tag ${tag.name} already exists, skipping...`);
        } else {
          throw error;
        }
      }
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

    // 5. Créer les agents (V2: multi-écoles)
    console.log('👨‍💼 Création des agents...');
    const agents = [];
    for (const school of schools) {
      const hashedPassword = await bcrypt.hash('agent123', 12);
      const agent = await prisma.agentUser.create({
        data: {
          email: `agent@${school.code.toLowerCase()}.fr`,
          password: hashedPassword,
          firstName: 'Agent',
          lastName: school.name.split(' ')[1] || 'Social',
          role: 'ROLE_AGENT',
          schools: {
            create: {
              schoolId: school.id,
            },
          },
        },
      });
      agents.push(agent);
    }
    console.log('✅ 10 agents créés');

    // 6. Créer les ressources de bibliothèque
    console.log('📚 Création des ressources de bibliothèque...');
    const libraryResources = [
      {
        title: 'Comment j\'ai surmonté le harcèlement',
        type: 'testimony',
        category: 'bullying',
        description: 'Témoignage de Sarah, 16 ans, qui partage son expérience et comment elle a retrouvé confiance en elle.',
        content: 'Je m\'appelle Sarah et j\'ai 16 ans. Il y a deux ans, j\'étais victime de harcèlement à l\'école...',
        duration: '8 min',
        author: 'Sarah M.',
        rating: 4.8,
        views: 1247,
        thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        isFeatured: true,
        tags: ['harcèlement', 'témoignage', 'confiance', 'adolescence'],
        metadata: JSON.stringify({ difficulty: 'beginner', language: 'fr', ageRange: '12-18' })
      },
      {
        title: 'Gérer ses émotions au quotidien',
        type: 'video',
        category: 'emotions',
        description: 'Techniques simples pour comprendre et gérer tes émotions, expliquées par une psychologue.',
        content: 'https://example.com/video/gerer-emotions',
        duration: '12 min',
        author: 'Dr. Claire Dubois',
        rating: 4.9,
        views: 2156,
        thumbnail: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        isFeatured: true,
        tags: ['émotions', 'psychologie', 'gestion', 'quotidien'],
        metadata: JSON.stringify({ difficulty: 'intermediate', language: 'fr', ageRange: '12-18', videoUrl: 'https://example.com/video/gerer-emotions' })
      },
      {
        title: 'Les vrais amis',
        type: 'book',
        category: 'friendship',
        description: 'Extrait du livre "Adolescence et amitié" - Comment reconnaître les vraies amitiés.',
        content: 'L\'amitié à l\'adolescence est un pilier fondamental de notre développement...',
        author: 'Marie Rousseau',
        rating: 4.6,
        views: 892,
        thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        isFeatured: false,
        tags: ['amitié', 'relations', 'adolescence', 'livre'],
        metadata: JSON.stringify({ difficulty: 'beginner', language: 'fr', ageRange: '12-18', isbn: '978-2-123456-78-9' })
      },
      {
        title: 'Techniques de relaxation',
        type: 'article',
        category: 'emotions',
        description: '5 exercices de respiration pour gérer le stress et l\'anxiété.',
        content: 'Voici 5 techniques de relaxation que tu peux pratiquer n\'importe où...',
        duration: '5 min',
        author: 'Dr. Pierre Martin',
        rating: 4.7,
        views: 1563,
        thumbnail: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        isFeatured: false,
        tags: ['relaxation', 'stress', 'anxiété', 'respiration'],
        metadata: JSON.stringify({ difficulty: 'beginner', language: 'fr', ageRange: '12-18', exercises: 5 })
      },
      {
        title: 'Construire sa confiance en soi',
        type: 'video',
        category: 'self-esteem',
        description: 'Exercices pratiques pour développer une image positive de soi.',
        content: 'https://example.com/video/confiance-soi',
        duration: '15 min',
        author: 'Sophie Laurent',
        rating: 4.9,
        views: 1892,
        thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        isFeatured: true,
        tags: ['confiance', 'estime', 'développement', 'exercices'],
        metadata: JSON.stringify({ difficulty: 'intermediate', language: 'fr', ageRange: '12-18', videoUrl: 'https://example.com/video/confiance-soi' })
      },
      {
        title: 'Reconnaître les signes de dépression',
        type: 'article',
        category: 'help',
        description: 'Guide pour identifier les signes de dépression chez les adolescents.',
        content: 'La dépression chez les adolescents peut se manifester de différentes façons...',
        author: 'Dr. Anne Moreau',
        rating: 4.5,
        views: 2341,
        thumbnail: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        isFeatured: false,
        tags: ['dépression', 'signes', 'aide', 'santé mentale'],
        metadata: JSON.stringify({ difficulty: 'intermediate', language: 'fr', ageRange: '12-18', warning: 'Contenu sensible' })
      },
      {
        title: 'Gérer les conflits entre amis',
        type: 'video',
        category: 'friendship',
        description: 'Techniques de communication pour résoudre les disputes entre amis.',
        content: 'https://example.com/video/conflits-amis',
        duration: '10 min',
        author: 'Thomas Bernard',
        rating: 4.4,
        views: 987,
        thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        isFeatured: false,
        tags: ['conflits', 'communication', 'amitié', 'résolution'],
        metadata: JSON.stringify({ difficulty: 'beginner', language: 'fr', ageRange: '12-18', videoUrl: 'https://example.com/video/conflits-amis' })
      },
      {
        title: 'Mon parcours de reconstruction',
        type: 'testimony',
        category: 'self-esteem',
        description: 'Témoignage de Lucas sur sa reconstruction après des années de harcèlement.',
        content: 'Bonjour, je m\'appelle Lucas et j\'ai 17 ans. Pendant 3 ans, j\'ai été harcelé...',
        duration: '6 min',
        author: 'Lucas P.',
        rating: 4.8,
        views: 1456,
        thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        isFeatured: true,
        tags: ['reconstruction', 'harcèlement', 'témoignage', 'espoir'],
        metadata: JSON.stringify({ difficulty: 'beginner', language: 'fr', ageRange: '12-18', triggerWarning: 'Harcèlement' })
      }
    ];

    for (const resourceData of libraryResources) {
      await prisma.libraryResource.create({
        data: {
          ...resourceData,
          schoolId: schools[0].id, // Associer à la première école
        },
      });
    }
    console.log('✅ 8 ressources de bibliothèque créées');

    // 7. Créer les élèves
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
    const removeAccents = (str) => {
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

    // 8. Créer les alertes
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
          sourceId: `source_${i + 1}`,
          sourceType: 'JOURNAL',
          riskLevel,
          riskScore: Math.floor(Math.random() * 100) + 1,
          childMood: ['HAPPY', 'SAD', 'ANGRY', 'WORRIED', 'EXCITED'][Math.floor(Math.random() * 5)],
          aiSummary: alertContents[Math.floor(Math.random() * alertContents.length)],
          aiAdvice: alertAdvice[Math.floor(Math.random() * alertAdvice.length)],
          createdAt,
        },
      });
    }
    console.log('✅ 200 alertes créées');

    // 9. Créer les signalements
    console.log('📝 Création des signalements...');
    const reportContents = [
      'L\'élève a été victime de moqueries répétées de la part de certains camarades.',
      'Incidents de violence physique observés dans la cour de récréation.',
      'L\'élève semble être exclu des activités de groupe par ses pairs.',
      'Problèmes de communication et d\'intégration sociale observés.',
      'L\'élève présente des signes de détresse émotionnelle et de mal-être.',
      'Conflits récurrents entre l\'élève et certains membres du personnel éducatif.',
      'L\'élève semble être la cible de harcèlement verbal et psychologique.',
      'Difficultés d\'apprentissage et de concentration liées à des problèmes sociaux.',
      'L\'élève exprime des sentiments d\'isolement et de rejet par ses camarades.',
      'Incidents de cyberharcèlement signalés par l\'élève ou ses parents.',
    ];

    const reportAdvice = [
      'Mettre en place un suivi individuel avec l\'élève pour comprendre ses besoins.',
      'Organiser une réunion avec les parents pour discuter de la situation.',
      'Impliquer le conseiller d\'orientation pour un accompagnement spécialisé.',
      'Créer un plan d\'action personnalisé pour améliorer l\'intégration sociale.',
      'Mettre en place des mesures de protection et de prévention.',
      'Orienter vers des services spécialisés si nécessaire.',
      'Renforcer la communication entre l\'école et la famille.',
      'Développer des compétences sociales et émotionnelles.',
      'Créer un environnement sécurisé et bienveillant.',
      'Assurer un suivi régulier et adapté à la situation.',
    ];

    const urgencies = ['FAIBLE', 'MOYEN', 'ELEVE', 'URGENT'];
    const reportStatuses = ['NOUVEAU', 'EN_COURS', 'TRAITE'];

    for (let i = 0; i < 100; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
      const status = reportStatuses[Math.floor(Math.random() * reportStatuses.length)];
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);

      await prisma.report.create({
        data: {
          schoolId: student.schoolId,
          studentId: student.id,
          content: reportContents[Math.floor(Math.random() * reportContents.length)],
          urgency,
          anonymous: Math.random() < 0.3, // 30% de signalements anonymes
          status,
          createdAt,
        },
      });
    }
    console.log('✅ 100 signalements créés');

    // 10. Créer des entrées de journal
    console.log('📖 Création des entrées de journal...');
    const journalContents = [
      'Aujourd\'hui j\'ai passé une bonne journée à l\'école. J\'ai eu une bonne note en maths !',
      'Je me sens un peu triste aujourd\'hui. Mes amis ne m\'ont pas parlé pendant la récréation.',
      'Super journée ! J\'ai joué au foot avec mes copains et on a gagné le match.',
      'J\'ai du mal à me concentrer en classe. Je pense trop à ce qui se passe à la maison.',
      'Aujourd\'hui j\'ai aidé un élève de ma classe qui avait des difficultés. Ça m\'a fait plaisir.',
      'Je suis content car j\'ai réussi à faire mes devoirs tout seul pour la première fois.',
      'J\'ai peur de l\'examen de demain. J\'ai l\'impression de ne rien savoir.',
      'Mes parents se disputent beaucoup en ce moment. Ça me rend triste.',
      'J\'ai fait de nouveaux amis aujourd\'hui ! Ils sont très sympas.',
      'Je me sens seul à l\'école. Personne ne veut jouer avec moi.',
    ];

    const moods = ['HAPPY', 'SAD', 'ANGRY', 'WORRIED', 'EXCITED', 'CALM', 'CONFUSED', 'PROUD'];
    const journalTags = ['tag_school', 'tag_friends', 'tag_family', 'tag_sport', 'tag_creativity', 'tag_homework', 'tag_thoughts', 'tag_emotions', 'tag_event', 'tag_difficulty', 'tag_success', 'tag_help'];

    for (let i = 0; i < 50; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const content = journalContents[Math.floor(Math.random() * journalContents.length)];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);

      const journalEntry = await prisma.journalEntry.create({
        data: {
          studentId: student.id,
          contentText: content,
          mood,
          color: ['pink', 'blue', 'green', 'yellow', 'purple', 'orange'][Math.floor(Math.random() * 6)],
          photos: Math.random() < 0.3 ? [`https://example.com/photo${i + 1}.jpg`] : [],
          aiRiskScore: Math.floor(Math.random() * 100),
          createdAt,
        },
      });

      // Ajouter des tags à certaines entrées
      if (Math.random() < 0.7) { // 70% des entrées ont des tags
        const numTags = Math.floor(Math.random() * 3) + 1; // 1 à 3 tags
        const selectedTags = journalTags.sort(() => 0.5 - Math.random()).slice(0, numTags);
        
        for (const tagId of selectedTags) {
          await prisma.journalEntryTag.create({
            data: {
              journalEntryId: journalEntry.id,
              tagId: tagId,
            },
          });
        }
      }
    }
    console.log('✅ 50 entrées de journal créées');

    // 11. Créer des messages de chatbot
    console.log('🤖 Création des messages de chatbot...');
    const chatbotMessages = [
      'Bonjour ! Comment te sens-tu aujourd\'hui ?',
      'Je suis là pour t\'écouter. Veux-tu me parler de quelque chose ?',
      'C\'est normal de ressentir ces émotions. Tu n\'es pas seul(e).',
      'As-tu parlé de cela avec un adulte de confiance ?',
      'Je comprends que ce soit difficile. Prends ton temps.',
      'Es-tu en sécurité en ce moment ?',
      'Veux-tu que je t\'aide à trouver des solutions ?',
      'Comment puis-je t\'aider aujourd\'hui ?',
      'Je suis fier(e) de toi pour avoir partagé cela.',
      'N\'hésite pas à me parler si tu as besoin.',
    ];

    for (let i = 0; i < 30; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const content = chatbotMessages[Math.floor(Math.random() * chatbotMessages.length)];
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000);

      await prisma.chatbotMessage.create({
        data: {
          studentId: student.id,
          type: 'BOT',
          content,
          resourceId: Math.random() < 0.3 ? `resource_${Math.floor(Math.random() * 8) + 1}` : null,
          relatedTo: Math.random() < 0.5 ? `journal_${Math.floor(Math.random() * 50) + 1}` : null,
          createdAt,
        },
      });
    }
    console.log('✅ 30 messages de chatbot créés');

    console.log('🎉 Seeding complet terminé avec succès!');
    
    // Résumé
    console.log('\n📊 Résumé :');
    console.log('   🏫 Écoles : 10');
    console.log('   👨‍💼 Agents : 10 (V2: multi-écoles)');
    console.log('   👦👧 Élèves : 100');
    console.log('   🏷️ Tags : 12');
    console.log('   🏆 Achievements : 10');
    console.log('   📚 Ressources bibliothèque : 8');
    console.log('   🚨 Alertes : 200');
    console.log('   📝 Signalements : 100');
    console.log('   📖 Entrées de journal : 50');
    console.log('   🤖 Messages de chatbot : 30');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seeding
seedComplete()
  .then(() => {
    console.log('✅ Seeding terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  });
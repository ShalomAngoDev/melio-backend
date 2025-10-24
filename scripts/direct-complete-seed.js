#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function directCompleteSeed() {
  try {
    console.log('🌱 Direct complete seeding...');
    
    // Nettoyer la base de données d'abord
    console.log('🧹 Nettoyage de la base de données...');
    await prisma.chatMessage.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.report.deleteMany();
    await prisma.student.deleteMany();
    await prisma.agentSchool.deleteMany();
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
      await prisma.tag.create({ data: tag });
    }
    console.log('✅ 12 tags créés');

    // 2. Créer les achievements
    console.log('🏆 Création des achievements...');
    const achievements = [
      { code: 'first_entry', name: 'Premier Pas', description: 'Tu as écrit ta première entrée de journal !', icon: '🌱', category: 'WRITING', threshold: 1 },
      { code: 'five_entries', name: 'Écrivain en Herbe', description: 'Tu as écrit 5 entrées de journal.', icon: '✍️', category: 'WRITING', threshold: 5 },
      { code: 'ten_entries', name: 'Journaliste', description: 'Tu as écrit 10 entrées de journal.', icon: '📝', category: 'WRITING', threshold: 10 },
      { code: 'first_chat', name: 'Première Discussion', description: 'Tu as parlé à Mélio pour la première fois.', icon: '💬', category: 'CHAT', threshold: 1 },
      { code: 'five_chats', name: 'Bavard', description: 'Tu as eu 5 conversations avec Mélio.', icon: '🗣️', category: 'CHAT', threshold: 5 },
      { code: 'first_resource', name: 'Première Découverte', description: 'Tu as consulté une ressource de la bibliothèque.', icon: '💡', category: 'LIBRARY', threshold: 1 },
      { code: 'five_resources', name: 'Lecteur Assidu', description: 'Tu as consulté 5 ressources de la bibliothèque.', icon: '📖', category: 'LIBRARY', threshold: 5 },
      { code: 'first_report', name: 'Premier Signalement', description: 'Tu as fait ton premier signalement.', icon: '📢', category: 'REPORT', threshold: 1 },
      { code: 'mood_tracker', name: 'Maître des Émotions', description: 'Tu as enregistré ton humeur 7 jours de suite.', icon: '🌈', category: 'MOOD', threshold: 7 },
      { code: 'positive_streak', name: 'Vibe Positive', description: 'Tu as eu une humeur positive 3 jours de suite.', icon: '☀️', category: 'MOOD', threshold: 3 },
    ];

    for (const achievement of achievements) {
      await prisma.achievement.create({ data: achievement });
    }
    console.log('✅ 10 achievements créés');

    // 3. Créer l'admin
    console.log('👑 Création du compte admin...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.adminUser.create({
      data: {
        email: 'admin@melio.com',
        password: adminPassword,
        role: 'ROLE_ADMIN_MELIO',
      },
    });
    console.log('✅ Compte admin créé (admin@melio.com / admin123)');

    // 4. Créer les écoles
    console.log('🏫 Création des écoles...');
    const schools = [
      {
        id: 'school_001',
        code: 'ECOLE001',
        name: 'École Primaire Les Petits Génies',
        address1: '12 Rue des Écoles',
        postalCode: '75001',
        city: 'Paris',
        country: 'FR',
        idKey: 'random_id_key_school_001_32_bytes_a',
        settings: JSON.stringify({ dataRetentionMonths: 12, aiThresholds: { critical: 80, high: 60, medium: 40 }, notify: { critical: "realtime", others: "daily" } }),
      },
      {
        id: 'school_002',
        code: 'COLLEGE002',
        name: 'Collège Victor Hugo',
        address1: '24 Avenue de la Liberté',
        postalCode: '69002',
        city: 'Lyon',
        country: 'FR',
        idKey: 'random_id_key_school_002_32_bytes_b',
        settings: JSON.stringify({ dataRetentionMonths: 24, aiThresholds: { critical: 75, high: 55, medium: 35 }, notify: { critical: "realtime", others: "weekly" } }),
      },
      {
        id: 'school_003',
        code: 'LYCEE003',
        name: 'Lycée Marie Curie',
        address1: '36 Boulevard des Sciences',
        postalCode: '13003',
        city: 'Marseille',
        country: 'FR',
        idKey: 'random_id_key_school_003_32_bytes_c',
        settings: JSON.stringify({ dataRetentionMonths: 36, aiThresholds: { critical: 85, high: 65, medium: 45 }, notify: { critical: "realtime", others: "monthly" } }),
      },
    ];

    for (const school of schools) {
      await prisma.school.create({ data: school });
    }
    console.log('✅ 3 écoles créées');

    // 5. Créer les agents
    console.log('👥 Création des agents...');
    const agentPassword = await bcrypt.hash('agent123', 10);
    const agents = [
      {
        id: 'agent_001',
        email: 'agent1@melio.com',
        password: agentPassword,
        firstName: 'Marie',
        lastName: 'Dubois',
        role: 'AGENT',
      },
      {
        id: 'agent_002',
        email: 'agent2@melio.com',
        password: agentPassword,
        firstName: 'Pierre',
        lastName: 'Martin',
        role: 'AGENT',
      },
      {
        id: 'agent_003',
        email: 'agent3@melio.com',
        password: agentPassword,
        firstName: 'Sophie',
        lastName: 'Leroy',
        role: 'AGENT',
      },
    ];

    for (const agent of agents) {
      await prisma.agentUser.create({ data: agent });
    }
    console.log('✅ 3 agents créés');

    // 6. Lier les agents aux écoles
    console.log('🔗 Liaison agents-écoles...');
    const agentSchools = [
      { agentId: 'agent_001', schoolId: 'school_001' },
      { agentId: 'agent_001', schoolId: 'school_002' },
      { agentId: 'agent_002', schoolId: 'school_002' },
      { agentId: 'agent_002', schoolId: 'school_003' },
      { agentId: 'agent_003', schoolId: 'school_001' },
      { agentId: 'agent_003', schoolId: 'school_003' },
    ];

    for (const agentSchool of agentSchools) {
      await prisma.agentSchool.create({ data: agentSchool });
    }
    console.log('✅ Relations agents-écoles créées');

    // 7. Créer des élèves
    console.log('👨‍🎓 Création des élèves...');
    const students = [];
    for (let i = 1; i <= 50; i++) {
      const schoolId = i <= 20 ? 'school_001' : i <= 35 ? 'school_002' : 'school_003';
      const className = i <= 20 ? '6ème A' : i <= 35 ? '4ème B' : '2nde C';
      
      students.push({
        id: `student_${String(i).padStart(3, '0')}`,
        uniqueId: `ELEVE${String(i).padStart(3, '0')}`,
        uniqueIdVer: 1,
        firstName: `Élève${i}`,
        lastName: `Nom${i}`,
        sex: i % 2 === 0 ? 'F' : 'M',
        className: className,
        birthdate: new Date(2010 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        parentPhone: `06${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        schoolId: schoolId,
      });
    }

    for (const student of students) {
      await prisma.student.create({ data: student });
    }
    console.log('✅ 50 élèves créés');

    // 8. Créer des alertes
    console.log('🚨 Création des alertes...');
    const alerts = [];
    for (let i = 1; i <= 100; i++) {
      const studentId = `student_${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`;
      const riskLevels = ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE'];
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      
      alerts.push({
        id: `alert_${String(i).padStart(3, '0')}`,
        schoolId: studentId.startsWith('student_001') || studentId.startsWith('student_002') ? 'school_001' : 
                 studentId.startsWith('student_003') || studentId.startsWith('student_004') ? 'school_002' : 'school_003',
        studentId: studentId,
        sourceId: `source_${i}`,
        sourceType: Math.random() > 0.5 ? 'JOURNAL' : 'CHAT',
        riskLevel: riskLevel,
        riskScore: Math.floor(Math.random() * 100),
        childMood: ['TRES_TRISTE', 'TRISTE', 'NEUTRE', 'CONTENT', 'TRES_HEUREUX'][Math.floor(Math.random() * 5)],
        aiSummary: `Résumé IA de l'alerte ${i}: Détection de signaux de détresse chez l'élève.`,
        aiAdvice: `Conseil IA pour l'alerte ${i}: Surveiller l'élève et organiser un entretien.`,
        status: ['NOUVELLE', 'EN_COURS', 'TRAITEE'][Math.floor(Math.random() * 3)],
      });
    }

    for (const alert of alerts) {
      await prisma.alert.create({ data: alert });
    }
    console.log('✅ 100 alertes créées');

    // 9. Créer des signalements
    console.log('📢 Création des signalements...');
    const reports = [];
    for (let i = 1; i <= 30; i++) {
      const studentId = `student_${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`;
      const urgencies = ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE'];
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
      
      reports.push({
        id: `report_${String(i).padStart(3, '0')}`,
        schoolId: studentId.startsWith('student_001') || studentId.startsWith('student_002') ? 'school_001' : 
                 studentId.startsWith('student_003') || studentId.startsWith('student_004') ? 'school_002' : 'school_003',
        studentId: studentId,
        content: `Contenu du signalement ${i}: Description détaillée du problème signalé.`,
        urgency: urgency,
        status: ['NOUVEAU', 'EN_COURS', 'TRAITE'][Math.floor(Math.random() * 3)],
      });
    }

    for (const report of reports) {
      await prisma.report.create({ data: report });
    }
    console.log('✅ 30 signalements créés');

    // 10. Créer des ressources de bibliothèque
    console.log('📚 Création des ressources...');
    const resources = [
      {
        id: 'resource_001',
        title: 'Comment gérer ses émotions',
        description: 'Guide pratique pour les adolescents',
        category: 'emotions',
        type: 'article',
        content: 'Contenu de la ressource sur la gestion des émotions...',
        isActive: true,
      },
      {
        id: 'resource_002',
        title: 'Techniques de relaxation',
        description: 'Exercices de respiration et méditation',
        category: 'wellness',
        type: 'video',
        content: 'Contenu de la ressource sur les techniques de relaxation...',
        isActive: true,
      },
      {
        id: 'resource_003',
        title: 'Prévention du harcèlement',
        description: 'Comment reconnaître et agir contre le harcèlement',
        category: 'bullying',
        type: 'article',
        content: 'Contenu de la ressource sur la prévention du harcèlement...',
        isActive: true,
      },
    ];

    for (const resource of resources) {
      await prisma.libraryResource.create({ data: resource });
    }
    console.log('✅ 3 ressources créées');

    console.log('🎉 Seeding complet terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

directCompleteSeed()
  .then(() => {
    console.log('✅ Direct complete seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Direct complete seed failed:', error);
    process.exit(1);
  });

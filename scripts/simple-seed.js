#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function simpleSeed() {
  try {
    console.log('🌱 Simple seeding...');
    
    // 1. Créer l'admin
    console.log('👑 Creating admin...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.adminUser.upsert({
      where: { email: 'admin@melio.com' },
      update: { password: adminPassword },
      create: {
        email: 'admin@melio.com',
        password: adminPassword,
        role: 'ROLE_ADMIN_MELIO',
      },
    });
    console.log('✅ Admin created');
    
    // 2. Créer une école
    console.log('🏫 Creating school...');
    const school = await prisma.school.upsert({
      where: { id: 'school_001' },
      update: {},
      create: {
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
    });
    console.log('✅ School created');
    
    // 3. Créer un agent
    console.log('👥 Creating agent...');
    const agentPassword = await bcrypt.hash('agent123', 10);
    const agent = await prisma.agentUser.upsert({
      where: { email: 'agent@melio.com' },
      update: { password: agentPassword },
      create: {
        email: 'agent@melio.com',
        password: agentPassword,
        firstName: 'Agent',
        lastName: 'Test',
        role: 'AGENT',
      },
    });
    console.log('✅ Agent created');
    
    // 4. Lier l'agent à l'école
    console.log('🔗 Linking agent to school...');
    await prisma.agentSchool.upsert({
      where: {
        agentId_schoolId: {
          agentId: agent.id,
          schoolId: school.id,
        },
      },
      update: {},
      create: {
        agentId: agent.id,
        schoolId: school.id,
      },
    });
    console.log('✅ Agent linked to school');
    
    // 5. Créer un élève
    console.log('👨‍🎓 Creating student...');
    const student = await prisma.student.upsert({
      where: { id: 'student_001' },
      update: {},
      create: {
        id: 'student_001',
        uniqueId: 'ELEVE001',
        firstName: 'Jean',
        lastName: 'Dupont',
        sex: 'M',
        className: '6ème A',
        birthdate: new Date('2010-01-01'),
        schoolId: school.id,
      },
    });
    console.log('✅ Student created');
    
    // 6. Créer quelques tags
    console.log('🏷️ Creating tags...');
    const tags = [
      { id: 'tag_school', name: 'École', icon: '🏫', color: '#3b82f6', category: 'Activité' },
      { id: 'tag_friends', name: 'Amis', icon: '👥', color: '#10b981', category: 'Social' },
      { id: 'tag_emotions', name: 'Émotions', icon: '❤️', color: '#ec4899', category: 'Émotion' },
    ];
    
    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: tag,
        create: tag,
      });
    }
    console.log('✅ Tags created');
    
    // 7. Créer quelques achievements
    console.log('🏆 Creating achievements...');
    const achievements = [
      { code: 'first_entry', name: 'Premier Pas', description: 'Tu as écrit ta première entrée de journal !', icon: '🌱', category: 'WRITING', threshold: 1 },
      { code: 'five_entries', name: 'Écrivain en Herbe', description: 'Tu as écrit 5 entrées de journal.', icon: '✍️', category: 'WRITING', threshold: 5 },
    ];
    
    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { code: achievement.code },
        update: achievement,
        create: achievement,
      });
    }
    console.log('✅ Achievements created');
    
    // 8. Créer quelques ressources
    console.log('📚 Creating library resources...');
    const resources = [
      {
        id: 'resource_001',
        title: 'Comment gérer ses émotions',
        description: 'Guide pratique pour les adolescents',
        category: 'emotions',
        type: 'article',
        content: 'Contenu de la ressource...',
        isActive: true,
      },
      {
        id: 'resource_002',
        title: 'Techniques de relaxation',
        description: 'Exercices de respiration et méditation',
        category: 'wellness',
        type: 'video',
        content: 'Contenu de la ressource...',
        isActive: true,
      },
    ];
    
    for (const resource of resources) {
      await prisma.libraryResource.upsert({
        where: { id: resource.id },
        update: resource,
        create: resource,
      });
    }
    console.log('✅ Library resources created');
    
    console.log('🎉 Simple seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during simple seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

simpleSeed()
  .then(() => {
    console.log('✅ Simple seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Simple seed failed:', error);
    process.exit(1);
  });

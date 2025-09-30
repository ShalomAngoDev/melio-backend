#!/usr/bin/env node

/**
 * Script pour initialiser les données de base après la migration
 * Usage: node scripts/seed-after-migration.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Initialisation des données de base...');

    // Créer un admin par défaut
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.adminUser.upsert({
      where: { email: 'admin@melio.app' },
      update: {},
      create: {
        email: 'admin@melio.app',
        password: hashedPassword,
        role: 'ROLE_ADMIN_MELIO'
      }
    });

    console.log('✅ Admin créé:', admin.email);

    // Créer un super admin
    const superAdminPassword = await bcrypt.hash('superadmin123', 12);
    
    const superAdmin = await prisma.adminUser.upsert({
      where: { email: 'superadmin@melio.app' },
      update: {},
      create: {
        email: 'superadmin@melio.app',
        password: superAdminPassword,
        role: 'ROLE_ADMIN_MELIO'
      }
    });

    console.log('✅ Super Admin créé:', superAdmin.email);

    // Créer une école de test
    const school = await prisma.school.upsert({
      where: { code: 'JMO75-01' },
      update: {},
      create: {
        code: 'JMO75-01',
        name: 'Collège Victor Hugo',
        address1: '123 Rue de la République',
        postalCode: '75001',
        city: 'Paris',
        country: 'FR',
        timezone: 'Europe/Paris',
        level: 'COLLEGE',
        contactName: 'Mme Dupont',
        contactEmail: 'contact@college-victor-hugo.fr',
        contactPhone: '01 23 45 67 89',
        idKey: 'test-key-123456789012345678901234567890',
        idKeyVer: 1,
        status: 'ACTIVE'
      }
    });

    console.log('✅ École créée:', school.name);

    // Créer un agent de test
    const agentPassword = await bcrypt.hash('agent123', 12);
    
    const agent = await prisma.agentUser.upsert({
      where: { email: 'agent@college-victor-hugo.fr' },
      update: {},
      create: {
        email: 'agent@college-victor-hugo.fr',
        password: agentPassword,
        role: 'ROLE_AGENT',
        schoolId: school.id
      }
    });

    console.log('✅ Agent créé:', agent.email);

    // Créer quelques élèves de test
    const students = [
      {
        firstName: 'Marie',
        lastName: 'Martin',
        birthdate: new Date('2010-05-15'),
        sex: 'F',
        className: '6ème A',
        parentName: 'M. Martin',
        parentPhone: '06 12 34 56 78',
        parentEmail: 'martin@email.com',
        uniqueId: 'MAR001',
        uniqueIdVer: 1
      },
      {
        firstName: 'Pierre',
        lastName: 'Durand',
        birthdate: new Date('2009-08-22'),
        sex: 'M',
        className: '5ème B',
        parentName: 'Mme Durand',
        parentPhone: '06 98 76 54 32',
        parentEmail: 'durand@email.com',
        uniqueId: 'DUR002',
        uniqueIdVer: 1
      }
    ];

    for (const studentData of students) {
      const student = await prisma.student.upsert({
        where: {
          schoolId_uniqueId: {
            schoolId: school.id,
            uniqueId: studentData.uniqueId
          }
        },
        update: {},
        create: {
          ...studentData,
          schoolId: school.id
        }
      });

      console.log('✅ Élève créé:', `${student.firstName} ${student.lastName} (${student.uniqueId})`);
    }

    console.log('🎉 Initialisation terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Vérifier que DATABASE_URL est définie
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL n\'est pas définie dans les variables d\'environnement');
  process.exit(1);
}

seedDatabase();

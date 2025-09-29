import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Créer un établissement de test
  const school = await prisma.school.upsert({
    where: { code: 'JMO75-01' },
    update: {
      name: 'Collège Victor Hugo',
      address1: '123 Rue de la Paix',
      address2: 'Bâtiment A',
      postalCode: '75001',
      city: 'Paris',
      country: 'FR',
      timezone: 'Europe/Paris',
      level: 'COLLEGE',
      uaiCode: '0751234A',
      contactName: 'Mme Dupont',
      contactEmail: 'contact@college-victor-hugo.fr',
      contactPhone: '+33123456789',
      settings: JSON.stringify({ theme: 'default' }),
      status: 'ACTIVE',
    },
    create: {
      code: 'JMO75-01',
      name: 'Collège Victor Hugo',
      address1: '123 Rue de la Paix',
      address2: 'Bâtiment A',
      postalCode: '75001',
      city: 'Paris',
      country: 'FR',
      timezone: 'Europe/Paris',
      level: 'COLLEGE',
      uaiCode: '0751234A',
      contactName: 'Mme Dupont',
      contactEmail: 'contact@college-victor-hugo.fr',
      contactPhone: '+33123456789',
      idKey: Buffer.from('test-key-for-school-identification-123456789012').toString('base64url'),
      idKeyVer: 1,
      settings: JSON.stringify({ theme: 'default' }),
      status: 'ACTIVE',
    },
  });

  console.log('✅ School created:', school.code);

  // 2. Créer un agent de test
  const hashedPassword = await bcrypt.hash('agent123', 10);
  const agent = await prisma.agentUser.upsert({
    where: { email: 'agent@college-victor-hugo.fr' },
    update: {},
    create: {
      email: 'agent@college-victor-hugo.fr',
      password: hashedPassword,
      schoolId: school.id,
      role: 'ROLE_AGENT',
    },
  });

  console.log('✅ Agent created:', agent.email);

  // 3. Créer des élèves de test
  const students = [
    {
      firstName: 'Emma',
      lastName: 'Durand',
      birthdate: new Date('2010-05-15'),
      sex: 'F',
      className: '5eA',
      parentName: 'Mme Durand',
      parentPhone: '+33612345678',
      parentEmail: 'parent.durand@email.com',
      uniqueId: 'EMMA01',
    },
    {
      firstName: 'Lucas',
      lastName: 'Martin',
      birthdate: new Date('2009-08-22'),
      sex: 'M',
      className: '6eB',
      parentName: 'M. Martin',
      parentPhone: '+33687654321',
      parentEmail: 'parent.martin@email.com',
      uniqueId: 'LUCA01',
    },
    {
      firstName: 'Elodie',
      lastName: 'Bernard',
      birthdate: new Date('2011-03-10'),
      sex: 'F',
      className: '4eC',
      parentName: 'Mme Bernard',
      parentPhone: '+33611223344',
      parentEmail: 'parent.bernard@email.com',
      uniqueId: 'ELOD01',
    },
    {
      firstName: 'Thomas',
      lastName: 'Petit',
      birthdate: new Date('2010-12-03'),
      sex: 'M',
      className: '5eA',
      parentName: 'M. Petit',
      parentPhone: '+33655667788',
      parentEmail: 'parent.petit@email.com',
      uniqueId: 'THOM01',
    },
  ];

  for (const studentData of students) {
    const student = await prisma.student.upsert({
      where: { 
        schoolId_uniqueId: {
          schoolId: school.id,
          uniqueId: studentData.uniqueId,
        }
      },
      update: {},
      create: {
        schoolId: school.id,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        birthdate: studentData.birthdate,
        sex: studentData.sex,
        className: studentData.className,
        parentName: studentData.parentName,
        parentPhone: studentData.parentPhone,
        parentEmail: studentData.parentEmail,
        uniqueId: studentData.uniqueId,
        uniqueIdVer: 1,
      },
    });
    console.log('✅ Student created:', student.firstName, student.lastName);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

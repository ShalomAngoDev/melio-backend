const { PrismaClient } = require('@prisma/client');

async function forceMigrate() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Creating tables manually...');
    
    // Créer la table admin_users
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ROLE_ADMIN_MELIO',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Créer la table schools
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "schools" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "address1" TEXT NOT NULL,
        "address2" TEXT,
        "postalCode" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "country" TEXT NOT NULL DEFAULT 'FR',
        "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
        "level" TEXT,
        "uaiCode" TEXT,
        "contactName" TEXT,
        "contactEmail" TEXT,
        "contactPhone" TEXT,
        "idKey" TEXT NOT NULL,
        "idKeyVer" INTEGER NOT NULL DEFAULT 1,
        "settings" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Créer la table agent_users
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "agent_users" (
        "id" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ROLE_AGENT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "agent_users_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Créer la table students
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "students" (
        "id" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "birthdate" TIMESTAMP(3) NOT NULL,
        "sex" TEXT NOT NULL,
        "className" TEXT NOT NULL,
        "parentName" TEXT,
        "parentPhone" TEXT NOT NULL,
        "parentEmail" TEXT,
        "uniqueId" TEXT NOT NULL,
        "uniqueIdVer" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "students_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Créer les index et contraintes
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_key" ON "admin_users"("email");`;
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "schools_code_key" ON "schools"("code");`;
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "agent_users_email_key" ON "agent_users"("email");`;
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "students_schoolId_uniqueId_key" ON "students"("schoolId", "uniqueId");`;
    
    console.log('✅ Tables created successfully!');
    
    // Créer l'admin par défaut
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await prisma.adminUser.upsert({
      where: { email: 'admin@melio.com' },
      update: {},
      create: {
        email: 'admin@melio.com',
        password: hashedPassword,
        role: 'ROLE_ADMIN_MELIO'
      }
    });
    
    console.log('✅ Admin user created: admin@melio.com / admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceMigrate();


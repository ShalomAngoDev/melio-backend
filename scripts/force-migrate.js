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
    
    // Créer la table alerts
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "alerts" (
        "id" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "sourceId" TEXT NOT NULL,
        "sourceType" TEXT NOT NULL DEFAULT 'JOURNAL',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "riskLevel" TEXT NOT NULL,
        "riskScore" INTEGER NOT NULL,
        "childMood" TEXT NOT NULL,
        "aiSummary" TEXT NOT NULL,
        "aiAdvice" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'NOUVELLE',
        CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Créer la table reports
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "reports" (
        "id" TEXT NOT NULL,
        "schoolId" TEXT NOT NULL,
        "studentId" TEXT,
        "content" TEXT NOT NULL,
        "urgency" TEXT NOT NULL,
        "anonymous" BOOLEAN NOT NULL DEFAULT false,
        "status" TEXT NOT NULL DEFAULT 'NOUVEAU',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Créer la table journal_entries
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "journal_entries" (
        "id" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "mood" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Créer la table chat_messages
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "sender" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Créer les index et contraintes
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_key" ON "admin_users"("email");`;
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "schools_code_key" ON "schools"("code");`;
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "agent_users_email_key" ON "agent_users"("email");`;
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "students_schoolId_uniqueId_key" ON "students"("schoolId", "uniqueId");`;
    
    // Index pour les nouvelles tables
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "alerts_schoolId_status_createdAt_idx" ON "alerts"("schoolId", "status", "createdAt");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "reports_schoolId_status_idx" ON "reports"("schoolId", "status");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "reports_studentId_createdAt_idx" ON "reports"("studentId", "createdAt");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "journal_entries_studentId_createdAt_idx" ON "journal_entries"("studentId", "createdAt");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "chat_messages_studentId_createdAt_idx" ON "chat_messages"("studentId", "createdAt");`;
    
    console.log('✅ All tables created successfully!');
    
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
    
    // Exécuter le seeding des données de test
    console.log('\n🌱 Démarrage du seeding des données de test...');
    const { spawn } = require('child_process');
    
    const seedProcess = spawn('node', ['scripts/seed-test-data.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    seedProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Seeding terminé avec succès !');
      } else {
        console.log('⚠️ Seeding terminé avec des avertissements');
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceMigrate();


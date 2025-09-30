import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding admin Melio user...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@melio.app' },
    update: {
      password: adminPassword,
      role: 'ROLE_ADMIN_MELIO',
    },
    create: {
      email: 'admin@melio.app',
      password: adminPassword,
      role: 'ROLE_ADMIN_MELIO',
    },
  });

  console.log('✅ Admin Melio user created/updated successfully!');
  console.log('Email:', admin.email);
  console.log('Role:', admin.role);
  console.log('ID:', admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




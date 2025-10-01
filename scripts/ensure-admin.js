const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function ensureAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Vérification du compte admin...');
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'admin@melio.app' }
    });
    
    if (existingAdmin) {
      console.log('✅ Compte admin déjà présent: admin@melio.app');
      return;
    }
    
    // Créer l'admin s'il n'existe pas
    console.log('🌱 Création du compte admin Melio...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.adminUser.create({
      data: {
        email: 'admin@melio.app',
        password: hashedPassword,
        role: 'ROLE_ADMIN_MELIO'
      }
    });
    
    console.log('✅ Compte admin créé avec succès!');
    console.log('   Email: admin@melio.app');
    console.log('   Mot de passe: admin123');
    console.log('   ID:', admin.id);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    // Ne pas faire échouer le démarrage si l'admin existe déjà
    if (!error.message.includes('Unique constraint')) {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

ensureAdmin();


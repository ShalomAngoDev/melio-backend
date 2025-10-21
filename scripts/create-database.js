#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🗄️  Création de la base de données locale...');

try {
  // Vérifier si la base existe déjà
  try {
    execSync('psql -U postgres -lqt | cut -d \\| -f 1 | grep -qw melio_local', { stdio: 'pipe' });
    console.log('✅ Base de données melio_local existe déjà');
  } catch (error) {
    // La base n'existe pas, la créer
    console.log('📝 Création de la base de données melio_local...');
    execSync('createdb -U postgres melio_local', { stdio: 'inherit' });
    console.log('✅ Base de données melio_local créée');
  }

  // Vérifier la connexion
  console.log('🔍 Test de connexion...');
  execSync('psql -U postgres -d melio_local -c "SELECT version();"', { stdio: 'pipe' });
  console.log('✅ Connexion à la base de données OK');

  console.log('\n🎉 Base de données prête !');
  console.log('Vous pouvez maintenant lancer:');
  console.log('   npm run db:setup  - Configuration complète');
  console.log('   npm run dev       - Développement');

} catch (error) {
  console.error('❌ Erreur lors de la création de la base de données:', error.message);
  console.log('\n💡 Solutions possibles:');
  console.log('1. Vérifiez que PostgreSQL est installé et démarré');
  console.log('2. Vérifiez que l\'utilisateur postgres existe');
  console.log('3. Créez manuellement: createdb -U postgres melio_local');
  process.exit(1);
}







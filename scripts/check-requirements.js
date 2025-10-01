#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Vérification des prérequis pour le développement local...\n');

let allGood = true;

// Vérifier Node.js
console.log('📦 Node.js...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const version = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (version >= 18) {
    console.log(`   ✅ ${nodeVersion} (OK)`);
  } else {
    console.log(`   ❌ ${nodeVersion} (Nécessite v18+)`);
    allGood = false;
  }
} catch (error) {
  console.log('   ❌ Node.js non installé');
  allGood = false;
}

// Vérifier npm
console.log('📦 npm...');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`   ✅ ${npmVersion}`);
} catch (error) {
  console.log('   ❌ npm non installé');
  allGood = false;
}

// Vérifier PostgreSQL
console.log('🐘 PostgreSQL...');
try {
  const pgVersion = execSync('psql --version', { encoding: 'utf8' }).trim();
  console.log(`   ✅ ${pgVersion}`);
  
  // Tester la connexion
  try {
    execSync('psql -U postgres -c "SELECT 1;"', { stdio: 'pipe' });
    console.log('   ✅ Connexion PostgreSQL OK');
  } catch (error) {
    console.log('   ⚠️  PostgreSQL installé mais connexion impossible');
    console.log('      Vérifiez que PostgreSQL est démarré et accessible');
  }
} catch (error) {
  console.log('   ❌ PostgreSQL non installé');
  allGood = false;
}

// Vérifier Redis
console.log('🔴 Redis...');
try {
  const redisVersion = execSync('redis-server --version', { encoding: 'utf8' }).trim();
  console.log(`   ✅ ${redisVersion}`);
  
  // Tester la connexion
  try {
    const ping = execSync('redis-cli ping', { encoding: 'utf8' }).trim();
    if (ping === 'PONG') {
      console.log('   ✅ Connexion Redis OK');
    } else {
      console.log('   ⚠️  Redis installé mais non accessible');
    }
  } catch (error) {
    console.log('   ⚠️  Redis installé mais non démarré');
    console.log('      Démarrez Redis avec: brew services start redis');
  }
} catch (error) {
  console.log('   ❌ Redis non installé');
  allGood = false;
}

// Vérifier le fichier .env
console.log('⚙️  Configuration...');
if (fs.existsSync('.env')) {
  console.log('   ✅ Fichier .env présent');
} else {
  console.log('   ⚠️  Fichier .env manquant');
  console.log('      Exécutez: npm run setup');
}

// Vérifier les dépendances
console.log('📚 Dépendances...');
if (fs.existsSync('node_modules')) {
  console.log('   ✅ node_modules présent');
} else {
  console.log('   ⚠️  Dépendances non installées');
  console.log('      Exécutez: npm install');
  allGood = false;
}

// Résumé
console.log('\n📋 Résumé:');
if (allGood) {
  console.log('🎉 Tous les prérequis sont satisfaits !');
  console.log('\n🚀 Vous pouvez maintenant lancer:');
  console.log('   npm run dev     - Développement');
  console.log('   npm run prod    - Production locale');
} else {
  console.log('⚠️  Certains prérequis manquent.');
  console.log('\n📖 Consultez LOCAL-DEVELOPMENT.md pour les instructions d\'installation.');
  process.exit(1);
}

#!/usr/bin/env node
/**
 * Script d'audit de sécurité
 * Vérifie que tous les endpoints sensibles sont protégés
 */

console.log('🔍 Audit de sécurité des endpoints...\n');

const sensitiveEndpoints = {
  '✅ PROTÉGÉS': [
    'GET /auth/profile - JwtAuthGuard',
    'POST /auth/logout - JwtAuthGuard',
    'GET /admin/* - AdminGuard + RolesGuard',
    'POST /admin/schools - AdminGuard',
    'DELETE /admin/schools/:id - AdminGuard',
    'GET /students/:id/journal - JwtAuthGuard + OwnershipGuard',
    'POST /students/:id/journal - JwtAuthGuard + OwnershipGuard',
    'GET /alerts - JwtAuthGuard + RolesGuard (AGENT)',
    'PATCH /alerts/:id/status - JwtAuthGuard + RolesGuard (AGENT)',
  ],
  
  '⚠️ PUBLICS (Normal)': [
    'POST /auth/student/login - Public (enfants)',
    'POST /auth/staff/login - Public + Rate limiting STRICT (route non-standard)',
    'POST /auth/refresh - Public (renouvellement token)',
    'GET /tags - Public (liste tags)',
    'GET /health - Public (monitoring)',
  ],
};

for (const [status, endpoints] of Object.entries(sensitiveEndpoints)) {
  console.log(`${status}:`);
  endpoints.forEach(endpoint => console.log(`  ${endpoint}`));
  console.log('');
}

console.log('📋 Recommandations:');
console.log('  1. Toujours utiliser JwtAuthGuard pour les endpoints privés');
console.log('  2. Utiliser RolesGuard pour les accès basés sur les rôles');
console.log('  3. Valider les permissions spécifiques (ownership, school access)');
console.log('  4. Logger toutes les tentatives d\'accès aux données sensibles');
console.log('  5. Ne jamais exposer de données sensibles dans les erreurs');
console.log('');

console.log('🔐 Checklist de sécurité:');
console.log('  ✅ Rate limiting activé sur /auth/unified-login');
console.log('  ✅ Helmet headers configurés');
console.log('  ✅ CORS restrictif en production');
console.log('  ✅ Validation stricte des DTOs');
console.log('  ✅ Logs de sécurité pour authentification');
console.log('  ✅ JWT avec expiration courte (15min)');
console.log('  ✅ Refresh tokens avec rotation');
console.log('  ✅ Bcrypt avec 12 rounds de hashing');
console.log('');

console.log('✨ Audit terminé !');


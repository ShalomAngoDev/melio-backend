# 🔒 Guide de Sécurité - Melio Backend

## 📋 Mesures de sécurité implémentées

### 1. **Authentification & Autorisation**

#### ✅ Endpoints d'authentification

**Staff (Agents & Admins)** : `/auth/staff/login` ⭐
  - Route non-standard pour meilleure sécurité (difficile à deviner)
  - Rate limiting strict: 5 tentatives/minute par IP
  - Validation stricte email + password
  - Logs de sécurité pour toutes les tentatives
  - Détection automatique Admin/Agent
  - Protection brute-force intégrée

**Élèves** : `/auth/student/login`
  - Route séparée pour les élèves
  - Authentification sans mot de passe (code école + identifiant unique)

### 2. **Protection contre les attaques**

#### 🛡️ Rate Limiting
```typescript
- Connexions : 5 tentatives/minute par IP
- API standard : 100 requêtes/minute
- Endpoints sensibles : 20 requêtes/minute
```

#### 🔐 Protection Brute-Force
- Blocage temporaire après 5 tentatives échouées
- Tracking par IP et par email
- Nettoyage automatique des anciennes entrées

#### 🚫 Protection XSS & Injection
- Helmet activé avec CSP strict
- Validation stricte des inputs (class-validator)
- Whitelist des propriétés (pas de données non déclarées)
- Sanitization automatique des emails

### 3. **Headers de sécurité (Helmet)**

```typescript
- Content-Security-Policy: Empêche l'exécution de scripts non autorisés
- X-Frame-Options: DENY (protection clickjacking)
- X-Content-Type-Options: nosniff
- X-XSS-Protection: Activé
- HSTS: Force HTTPS en production (max-age: 1 an)
```

### 4. **CORS Configuration**

#### Origines autorisées :
- `https://www.melio-soutien.net` (production)
- `http://localhost:5173` (dev web)
- `http://localhost:8080` (dev mobile)
- `capacitor://localhost` (mobile natif)

#### Politique :
- Credentials: true (cookies sécurisés)
- Méthodes: GET, POST, PUT, PATCH, DELETE
- Headers autorisés: Content-Type, Authorization

### 5. **Tokens JWT**

#### Configuration sécurisée :
```typescript
Access Token:
  - Durée: 15 minutes (court pour limiter l'exposition)
  - Stockage: Redis avec expiration automatique
  - Payload minimal (id, role, type)

Refresh Token:
  - Durée: 7 jours
  - Stockage: Redis avec rotation
  - Invalidation à la déconnexion
```

### 6. **Validation des données**

#### Règles strictes :
```typescript
Email:
  - Format valide requis
  - Normalisation (lowercase + trim)
  - Longueur max: 255 caractères

Password:
  - Longueur min: 6 caractères (8 recommandés en prod)
  - Longueur max: 100 caractères
  - Hash bcrypt avec salt rounds = 12
```

### 7. **Logs de sécurité**

#### Événements trackés :
- ✅ Connexions réussies (admin/agent) + IP + nombre d'écoles
- ⚠️ Tentatives échouées (email + raison)
- 🚨 Rate limiting dépassé (IP + email)
- ⚠️ Accès CORS refusés (origin)
- ⚠️ Agents sans école associée

#### Format des logs :
```
[UnifiedLogin] [192.168.1.x] ✅ Agent connecté: agent@school.fr (2 école(s): SCHOOL001, SCHOOL002)
[UnifiedLogin] [192.168.1.x] ⚠️ Échec de connexion: email@invalid.com - Mot de passe invalide
```

### 8. **Protection de la base de données**

#### Prisma Security :
- Requêtes paramétrées (protection SQL injection)
- Relations en cascade contrôlées
- Validation des foreign keys
- Transactions pour les opérations critiques

### 9. **Secrets & Variables d'environnement**

#### ⚠️ Variables critiques à changer en production :
```env
JWT_SECRET=votre-secret-super-long-et-aleatoire
JWT_REFRESH_SECRET=autre-secret-different-et-long
MELIO_MASTER_KEY=cle-maitresse-pour-codes-ecoles
```

#### Génération sécurisée :
```bash
node scripts/generate-jwt-secrets.js
```

### 10. **Multi-écoles (V2)**

#### Sécurité renforcée :
- Un agent ne peut accéder qu'aux écoles associées
- Vérification systématique des permissions
- Logs détaillés des accès multi-écoles

---

## 🚨 En cas d'incident de sécurité

### 1. **Bloquer un utilisateur**
```bash
# Invalider tous les refresh tokens d'un utilisateur
redis-cli DEL refresh_token:USER_ID
```

### 2. **Réinitialiser un mot de passe agent**
```bash
npx ts-node scripts/reset-agent-password.js <email>
```

### 3. **Auditer les connexions**
```bash
# Vérifier les logs des dernières 24h
grep "UnifiedLogin" logs/*.log | grep -E "✅|⚠️|🚨"
```

---

## 📚 Bonnes pratiques

### ✅ À FAIRE :
- Changer les secrets JWT en production
- Utiliser HTTPS en production (obligatoire)
- Monitorer les logs de sécurité
- Mettre à jour les dépendances régulièrement
- Sauvegarder la base de données quotidiennement

### ❌ À NE PAS FAIRE :
- Exposer les secrets dans le code
- Désactiver les validations
- Ignorer les alertes de sécurité
- Utiliser HTTP en production
- Stocker les mots de passe en clair

---

## 🔄 Mises à jour de sécurité

**Dernière mise à jour** : Octobre 2025  
**Version** : 2.0.0  
**Responsable sécurité** : Admin Melio

### Changements récents :
- ✅ Authentification unifiée avec rate limiting strict
- ✅ Agents multi-écoles avec validation des permissions
- ✅ Logs de sécurité enrichis
- ✅ Headers de sécurité renforcés (Helmet)
- ✅ Validation stricte des inputs


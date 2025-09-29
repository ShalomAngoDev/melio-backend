# 🚀 Guide de Déploiement Railway

## 📋 Étapes de Configuration

### 1. **Ajouter une Base de Données PostgreSQL**
1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"PostgreSQL"**
3. Railway créera automatiquement une base de données

### 2. **Configurer les Variables d'Environnement**
Dans les **Settings** → **Variables**, ajoutez :

#### **Variables Obligatoires :**
```bash
# Base de données (Railway génère automatiquement)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT (GÉNÉREZ DES CLÉS SÉCURISÉES)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# CORS (remplacez par votre domaine frontend)
CORS_ORIGINS=https://votre-frontend.vercel.app,https://votre-domaine.com

# Sécurité
BCRYPT_ROUNDS=12
```

#### **Variables Optionnelles :**
```bash
# AI Provider (si vous utilisez l'IA)
AI_PROVIDER_URL=http://localhost:8000/api/analyze
AI_PROVIDER_API_KEY=your-ai-api-key

# Feature Flags
FEATURE_AI_ENABLED=true
FEATURE_NOTIFICATIONS_ENABLED=true

# Logging
LOG_LEVEL=info
TZ=Europe/Paris
```

### 3. **Déploiement Automatique**
1. Railway détecte automatiquement le `railway.json`
2. Utilise le Dockerfile pour le build
3. Déploie automatiquement sur chaque push

### 4. **Première Migration**
Après le déploiement, connectez-vous à votre service et exécutez :

```bash
# Via Railway CLI
railway run npx prisma migrate deploy

# Ou via le terminal Railway
railway run npx prisma generate
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

## 🔧 Configuration Avancée

### **Domaine Personnalisé**
1. Dans **Settings** → **Domains**
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

### **Monitoring**
- Railway fournit des métriques automatiques
- Logs en temps réel dans le dashboard
- Alertes configurables

## 🚨 Dépannage

### **Erreurs Courantes :**

1. **Migration Failed**
   ```bash
   railway run npx prisma migrate reset
   railway run npx prisma migrate deploy
   ```

2. **Build Failed**
   - Vérifiez que toutes les variables d'environnement sont définies
   - Consultez les logs de build

3. **Database Connection**
   - Vérifiez que `DATABASE_URL` est correctement défini
   - Assurez-vous que la base PostgreSQL est active

## 📊 Vérification du Déploiement

### **Health Check**
Votre API sera disponible sur :
- **URL Railway** : `https://votre-projet.railway.app/api/v1/health`
- **Documentation** : `https://votre-projet.railway.app/api`

### **Tests de Base**
```bash
# Test de santé
curl https://votre-projet.railway.app/api/v1/health

# Test de l'API
curl https://votre-projet.railway.app/api/v1/auth/status
```

## 🔐 Sécurité

### **Clés JWT Sécurisées**
Générez des clés sécurisées :
```bash
# JWT Secret (32+ caractères)
openssl rand -base64 32

# Refresh Secret (32+ caractères)
openssl rand -base64 32
```

### **Variables Sensibles**
- Ne jamais commiter les clés de production
- Utiliser les variables d'environnement Railway
- Activer le chiffrement des données sensibles

## 📈 Optimisation

### **Performance**
- Railway met automatiquement en cache les builds
- Utilise le CDN pour les assets statiques
- Monitoring automatique des performances

### **Coûts**
- Plan gratuit : 512MB RAM, 1GB storage
- Monitoring des utilisations dans le dashboard
- Alertes de limite configurable

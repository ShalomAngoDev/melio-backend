# 🚀 Configuration Complète Railway - Melio Backend

## 📋 Checklist Complète

### ✅ **Étape 1: Ajouter PostgreSQL**
1. Dans votre projet Railway
2. Cliquez **"+ New"** → **"Database"** → **"PostgreSQL"**
3. ✅ Railway génère automatiquement `DATABASE_URL`

### ✅ **Étape 2: Variables d'Environnement Obligatoires**

Copiez et collez ces variables dans Railway → Settings → Variables :

```bash
# Base de données (Railway génère automatiquement)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secrets (GÉNÉRÉS SÉCUREMENT)
JWT_SECRET=Kj9mN2pQ8vR5sT7wX3yZ6aB1cD4eF9gH2iJ5kL8mN1pQ4rS7tU0vW3xY6zA9bC2dE5f
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=M8nP1qR4sT7uV0wX3yZ6aB9cD2eF5gH8iJ1kL4mN7pQ0rS3tU6vW9xY2zA5bC8dE1fG4h
JWT_REFRESH_EXPIRES_IN=7d

# Configuration App
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# CORS (À modifier selon votre frontend)
CORS_ORIGINS=https://melio-frontend.vercel.app,https://melio.app,http://localhost:5173

# Sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
FEATURE_AI_ENABLED=true
FEATURE_NOTIFICATIONS_ENABLED=true
FEATURE_PDF_EXPORT_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
TZ=Europe/Paris

# AI Provider (optionnel)
AI_PROVIDER_URL=http://localhost:8000/api/analyze
AI_PROVIDER_API_KEY=your-openai-api-key-here
AI_PROVIDER_TIMEOUT=30000
AI_PROVIDER_RETRIES=3
```

### ✅ **Étape 3: Déploiement Automatique**
Railway détecte automatiquement votre push GitHub et déploie !

### ✅ **Étape 4: Migrations et Seed**

Après le déploiement, exécutez :

```bash
# Installation Railway CLI (si pas déjà fait)
npm install -g @railway/cli

# Connexion et liaison
railway login
railway link

# Migrations
railway run npx prisma generate
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### ✅ **Étape 5: Vérification**

Testez votre API :

```bash
# Health Check
curl https://votre-projet.railway.app/api/v1/health

# Documentation Swagger
# Ouvrez: https://votre-projet.railway.app/api

# Test de l'API
curl https://votre-projet.railway.app/api/v1/auth/status
```

## 🔧 Configuration Avancée

### **Domaine Personnalisé**
1. Railway → Settings → Domains
2. Ajoutez votre domaine
3. Configurez les DNS

### **Monitoring**
- Métriques automatiques
- Logs en temps réel
- Alertes configurables

## 🚨 Dépannage

### **Build Failed**
- Vérifiez que toutes les variables sont définies
- Consultez les logs de build dans Railway

### **Migration Failed**
```bash
railway run npx prisma migrate reset
railway run npx prisma migrate deploy
```

### **Database Connection**
- Vérifiez `DATABASE_URL`
- Assurez-vous que PostgreSQL est actif

## 📊 Vérification Finale

### **Tests API**
```bash
# 1. Health Check
curl https://votre-projet.railway.app/api/v1/health

# 2. Créer un admin (si besoin)
railway run npm run prisma:seed

# 3. Test d'authentification
curl -X POST https://votre-projet.railway.app/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@melio.app","password":"admin123"}'
```

### **URLs Importantes**
- **API Base**: `https://votre-projet.railway.app/api/v1`
- **Health Check**: `https://votre-projet.railway.app/api/v1/health`
- **Documentation**: `https://votre-projet.railway.app/api`
- **Admin Login**: `https://votre-projet.railway.app/api/v1/auth/admin/login`

## 🎉 Félicitations !

Votre backend Melio est maintenant déployé sur Railway !

### **Prochaines Étapes**
1. ✅ Backend déployé sur Railway
2. 🔄 Configurer le frontend
3. 🔄 Tester l'intégration complète
4. 🔄 Mettre en production

### **Support**
- Documentation Railway: https://docs.railway.app
- Logs en temps réel dans Railway Dashboard
- Métriques et monitoring automatiques

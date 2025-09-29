# 🔧 Configuration des Variables Railway

## 📋 Variables Obligatoires à Configurer

### 1. **Base de Données**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
> Railway génère automatiquement cette variable quand vous ajoutez PostgreSQL

### 2. **JWT Secrets (OBLIGATOIRE - Générez des clés sécurisées)**
```bash
JWT_SECRET=melio-super-secret-jwt-key-2024-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=melio-super-secret-refresh-key-2024-production-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. **Configuration App**
```bash
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
```

### 4. **CORS (Remplacez par vos domaines frontend)**
```bash
CORS_ORIGINS=https://melio-frontend.vercel.app,https://melio.app
```

## 🔐 Comment Configurer les Variables

### **Méthode 1: Interface Railway**
1. Allez dans votre projet Railway
2. Cliquez sur votre service backend
3. Allez dans **"Variables"**
4. Cliquez **"+ New Variable"**
5. Ajoutez chaque variable une par une

### **Méthode 2: Railway CLI**
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Lier le projet
railway link

# Définir les variables
railway variables set JWT_SECRET="votre-clé-secrète"
railway variables set JWT_EXPIRES_IN="15m"
railway variables set NODE_ENV="production"
```

## 🎯 Variables Optionnelles

### **AI Provider (si vous utilisez l'IA)**
```bash
AI_PROVIDER_URL=http://localhost:8000/api/analyze
AI_PROVIDER_API_KEY=your-openai-api-key
FEATURE_AI_ENABLED=true
```

### **Notifications**
```bash
FEATURE_NOTIFICATIONS_ENABLED=true
```

### **Logging**
```bash
LOG_LEVEL=info
TZ=Europe/Paris
```

### **Sécurité**
```bash
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔑 Génération de Clés Sécurisées

### **JWT Secrets (32+ caractères)**
```bash
# Sur macOS/Linux
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **Exemple de clés générées**
```bash
JWT_SECRET=Kj9mN2pQ8vR5sT7wX3yZ6aB1cD4eF9gH2iJ5kL8mN1pQ4rS7tU0vW3xY6zA9b
JWT_REFRESH_SECRET=M8nP1qR4sT7uV0wX3yZ6aB9cD2eF5gH8iJ1kL4mN7pQ0rS3tU6vW9xY2z
```

## ✅ Vérification

### **Tester les variables**
```bash
# Vérifier que les variables sont définies
railway variables

# Tester la connexion
railway run echo $DATABASE_URL
```

### **Premier déploiement**
```bash
# Exécuter les migrations
railway run npx prisma migrate deploy

# Tester l'API
curl https://votre-projet.railway.app/api/v1/health
```

## 🚨 Sécurité

### **⚠️ IMPORTANT**
- Ne jamais commiter les clés de production
- Utiliser des clés différentes pour chaque environnement
- Régénérer les clés périodiquement
- Activer l'authentification à deux facteurs sur Railway

### **🔒 Bonnes Pratiques**
- Clés JWT d'au moins 32 caractères
- Rotation des clés tous les 6 mois
- Monitoring des accès API
- Logs d'audit activés

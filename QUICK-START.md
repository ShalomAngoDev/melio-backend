# 🚀 Démarrage Rapide - Melio Backend

## ⚡ Configuration Express (5 minutes)

### **1. Clés JWT Sécurisées**
```bash
# Exécuter le script de génération
./scripts/generate-secrets.sh
```

### **2. Configuration Railway**
```bash
# Configuration automatique complète
./scripts/setup-railway.sh
```

### **3. Test de Déploiement**
```bash
# Tester votre API
./scripts/test-deployment.sh
```

## 📋 Checklist Rapide

### ✅ **Dans Railway Dashboard :**
1. **Ajouter PostgreSQL** : `+ New` → `Database` → `PostgreSQL`
2. **Variables** : Copier depuis `generate-secrets.sh`
3. **Déploiement** : Automatique via GitHub

### ✅ **Via Railway CLI :**
```bash
# Installation et configuration complète
./scripts/setup-railway.sh
```

## 🎯 URLs Importantes

Après déploiement :
- **API** : `https://votre-projet.railway.app/api/v1`
- **Health** : `https://votre-projet.railway.app/api/v1/health`
- **Docs** : `https://votre-projet.railway.app/api`

## 🔧 Variables Obligatoires

```bash
# Base de données (Railway génère automatiquement)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT (générées par generate-secrets.sh)
JWT_SECRET=votre-clé-générée
JWT_REFRESH_SECRET=votre-clé-générée

# App
NODE_ENV=production
PORT=3000
```

## 🚨 Dépannage Rapide

### **Build Failed**
- Vérifiez toutes les variables d'environnement
- Consultez les logs Railway

### **Migration Failed**
```bash
railway run npx prisma migrate deploy
```

### **Test API**
```bash
curl https://votre-projet.railway.app/api/v1/health
```

## 📞 Support

- **Documentation complète** : `RAILWAY-COMPLETE-SETUP.md`
- **Scripts disponibles** : `scripts/`
- **Logs Railway** : Dashboard Railway

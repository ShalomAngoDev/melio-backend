# 🔧 Résolution du Problème Husky dans Docker

## ❌ Problème Résolu

**Erreur** : `sh: husky: not found` lors du build Docker

**Cause** : Le script `prepare` dans `package.json` essaie d'installer Husky, mais Husky n'est pas disponible dans l'environnement Docker de production.

## ✅ Solutions Appliquées

### **1. Modification du script prepare**
```json
// Avant (problématique)
"prepare": "husky install"

// Après (robuste)
"prepare": "husky install || true"
```

### **2. Optimisation Dockerfile**
```dockerfile
# Avant
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Après (ignore les scripts de préparation)
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts && npm cache clean --force
```

### **3. Amélioration .dockerignore**
```
# Ajout des exclusions
.husky
test
*.md
```

## 🎯 Pourquoi cette approche ?

### **Husky en production**
- Husky est un outil de développement pour les hooks Git
- Non nécessaire dans l'environnement de production
- Peut causer des erreurs dans Docker/Railway

### **--ignore-scripts**
- Évite l'exécution des scripts `prepare`, `preinstall`, etc.
- Plus sûr pour la production
- Évite les erreurs de dépendances manquantes

### **|| true**
- Permet au script de continuer même si Husky échoue
- Robuste pour différents environnements
- Pas d'impact sur le fonctionnement de l'app

## 🚀 Résultat

- ✅ Build Docker réussi
- ✅ Pas d'erreur Husky
- ✅ Déploiement Railway opérationnel
- ✅ Application fonctionne normalement

## 📋 Vérifications

### **Build Local**
```bash
docker build -t melio-backend .
# ✅ Build réussi sans erreur Husky
```

### **Test Production**
```bash
docker run -p 3000:3000 melio-backend
# ✅ Application démarre correctement
```

## 🔍 Alternative (si nécessaire)

Si vous avez besoin de Husky en production (non recommandé) :

```dockerfile
# Installer Husky explicitement
RUN npm install -g husky
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force
```

## 📞 Support

Cette solution est la meilleure pratique pour :
- ✅ Déploiements Docker/Railway
- ✅ Environnements de production
- ✅ CI/CD pipelines
- ✅ Applications Node.js/NestJS

# 🚀 Guide de Démarrage - Backend Melio

## 📋 Table des matières
- [Démarrage rapide](#démarrage-rapide)
- [Première installation](#première-installation)
- [Commandes disponibles](#commandes-disponibles)
- [Gestion de la base de données](#gestion-de-la-base-de-données)
- [Comptes de test](#comptes-de-test)
- [Dépannage](#dépannage)

---

## ⚡ Démarrage rapide

### Lancer le backend (usage quotidien)

```bash
cd backend
npm run dev:quick
```

**Cette commande lance directement le backend sans refaire toutes les vérifications.**

Le backend sera accessible sur : **http://localhost:3000**

Documentation Swagger : **http://localhost:3000/api/v1/docs**

---

## 🔧 Première installation

### 1. Prérequis

Assurez-vous que les services suivants sont installés et démarrés :

- **Node.js** v20.11.0 ou supérieur
- **PostgreSQL** 14 ou supérieur
- **Redis** 8.0 ou supérieur

### 2. Démarrer les services

```bash
# PostgreSQL
brew services start postgresql@14

# Redis
brew services start redis
```

### 3. Installer les dépendances

```bash
cd backend
npm install
```

### 4. Configuration de l'environnement

Le fichier `.env` sera créé automatiquement lors du premier lancement.
Vous pouvez aussi le copier manuellement :

```bash
cp env.example .env
```

### 5. Créer la base de données

```bash
createdb melio_local
```

### 6. Première exécution complète

```bash
npm run dev
```

Cette commande exécute automatiquement :
- ✅ Vérification des prérequis
- ✅ Configuration de l'environnement
- ✅ Génération du client Prisma
- ✅ Migrations de la base de données
- ✅ Démarrage du serveur

---

## 📦 Commandes disponibles

### Développement

| Commande | Description |
|----------|-------------|
| `npm run dev:quick` | 🚀 **Lancement rapide** (recommandé) |
| `npm run dev` | Lancement complet avec toutes les vérifications |
| `npm run start:dev` | Lancement en mode watch (utilisé par dev:quick) |
| `npm run start:debug` | Lancement en mode debug |

### Production

| Commande | Description |
|----------|-------------|
| `npm run build` | Compiler le projet |
| `npm run start:prod` | Lancer en mode production |
| `npm run prod` | Build et lancement production complet |

### Base de données

| Commande | Description |
|----------|-------------|
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:migrate` | Exécuter les migrations |
| `npm run prisma:studio` | Ouvrir l'interface Prisma Studio |
| `npm run db:setup` | Configuration complète de la BD |
| `npm run db:seed` | Charger les données de test |
| `npm run db:reset` | Nettoyer et recharger les données |

### Vérification et maintenance

| Commande | Description |
|----------|-------------|
| `npm run check` | Vérifier les prérequis système |
| `npm run setup` | Configurer l'environnement local |
| `npm test` | Lancer les tests |
| `npm run lint` | Vérifier le code avec ESLint |

---

## 🗄️ Gestion de la base de données

### Réinitialiser complètement la base de données

Si vous rencontrez des problèmes avec les migrations :

```bash
cd backend

# 1. Réinitialiser la base de données
npx prisma migrate reset --force

# 2. Charger toutes les données de test
npx ts-node prisma/seed-complete.ts

# 3. Charger les ressources de la bibliothèque
npx ts-node prisma/seed-library-resources.ts
```

### Scripts de seed disponibles

| Script | Description |
|--------|-------------|
| `seed-complete.ts` | 🌟 **Seed complet** (tags, achievements, admin, écoles, agents, élèves, alertes) |
| `seed-library-resources.ts` | Ressources de la bibliothèque pédagogique |
| `seed-admin.ts` | Créer uniquement le compte admin |
| `seed-reports.ts` | Données de signalements |
| `seed-test-data.ts` | Données de test supplémentaires |

### Fonctionnalités automatiques

**Messages automatiques du chatbot :**

Quand un élève écrit une entrée dans son journal intime, le système :
1. ✅ Analyse le contenu avec l'IA
2. ✅ Détermine le niveau de risque (FAIBLE, MOYEN, ÉLEVÉ, CRITIQUE)
3. ✅ **Crée automatiquement un message empathique du chatbot** adapté au niveau de risque
4. ✅ Suggère des ressources de la bibliothèque pertinentes

Ce message automatique apparaît dans la section Chat de l'application mobile.

### Données créées par le seed complet

Après `npx ts-node prisma/seed-complete.ts` :

- 🏷️ **12 tags** (École, Amis, Famille, Sport, Créativité, etc.)
- 🏆 **10 achievements** (Premier Pas, Semaine Parfaite, etc.)
- 👑 **1 admin** : `admin@melio.app` / `admin123`
- 🏫 **10 écoles**
- 👨‍💼 **10 agents** (1 par école)
- 👦👧 **100 élèves** répartis dans les écoles
- 🚨 **200 alertes** de différents niveaux
- 📢 **100 signalements**
- 📝 **~50 entrées de journal**
- 💬 **~30 messages de chatbot**

Après `npx ts-node prisma/seed-library-resources.ts` :

- 📚 **8 ressources pédagogiques** (articles, vidéos, témoignages)

---

## 🔑 Comptes de test

### Compte Administrateur

```
Email    : admin@melio.app
Password : admin123
```

### Comptes Agents

Format : `agent@schoolXXX.fr` / `agent123`

Exemples :
```
agent@school001.fr / agent123
agent@school002.fr / agent123
agent@school003.fr / agent123
...
```

### Comptes Élèves

Format : `student.XXX@schoolYYY.fr` / `student123`

Exemples :
```
student.001@school001.fr / student123
student.002@school001.fr / student123
...
```

---

## 🐛 Dépannage

### Problème : "Migration modified after it was applied"

**Solution :**
```bash
npx prisma migrate reset --force
npx ts-node prisma/seed-complete.ts
npx ts-node prisma/seed-library-resources.ts
```

### Problème : "Can't reach database server"

**Vérifications :**

1. PostgreSQL est-il démarré ?
```bash
brew services list
# Si non démarré :
brew services start postgresql@14
```

2. La base de données existe-t-elle ?
```bash
psql -l | grep melio_local
# Si non :
createdb melio_local
```

3. Les credentials sont-ils corrects dans `.env` ?
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/melio_local"
```

### Problème : "Can't connect to Redis"

**Solution :**
```bash
# Vérifier le statut
brew services list

# Démarrer Redis
brew services start redis

# Tester la connexion
redis-cli ping
# Doit répondre : PONG
```

### Problème : "EMFILE: too many open files"

C'est un avertissement du watcher, pas une erreur bloquante. Le backend fonctionne normalement.

**Pour le résoudre (optionnel) :**
```bash
# Augmenter la limite de fichiers ouverts
ulimit -n 10000
```

### Problème : "Port 3000 already in use"

**Solution :**
```bash
# Trouver le processus utilisant le port
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
PORT=3001
```

---

## 📊 Vérification du bon fonctionnement

### 1. Vérifier les prérequis

```bash
npm run check
```

Doit afficher :
```
✅ Node.js OK
✅ npm OK
✅ PostgreSQL OK
✅ Redis OK
✅ Configuration OK
✅ Dépendances OK
```

### 2. Tester l'API

Une fois le backend lancé :

```bash
# Test de base
curl http://localhost:3000/api/v1/docs

# Doit retourner la page Swagger
```

### 3. Accéder à Swagger

Ouvrez votre navigateur : **http://localhost:3000/api/v1/docs**

Vous devriez voir la documentation interactive de l'API.

---

## 📚 Ressources supplémentaires

- [LOCAL-DEVELOPMENT.md](./LOCAL-DEVELOPMENT.md) - Guide de développement local
- [DATABASE-FIX-GUIDE.md](./DATABASE-FIX-GUIDE.md) - Guide de résolution des problèmes de base de données
- [RAILWAY-CONFIG.md](./RAILWAY-CONFIG.md) - Configuration pour Railway (déploiement)
- [COMPTES-TEST.md](./COMPTES-TEST.md) - Liste complète des comptes de test

---

## 🎯 Workflow recommandé

### Journée type

1. **Démarrer les services** (si pas déjà fait)
   ```bash
   brew services start postgresql@14
   brew services start redis
   ```

2. **Lancer le backend**
   ```bash
   cd backend
   npm run dev:quick
   ```

3. **Développer** 🚀
   - Le serveur redémarre automatiquement à chaque modification
   - Swagger disponible sur http://localhost:3000/api/v1/docs

4. **En cas de problème de base de données**
   ```bash
   npx prisma migrate reset --force
   npx ts-node prisma/seed-complete.ts
   npx ts-node prisma/seed-library-resources.ts
   ```

### Après modification du schéma Prisma

```bash
# 1. Créer une nouvelle migration
npx prisma migrate dev --name description_changement

# 2. Regénérer le client
npm run prisma:generate

# 3. Redémarrer le backend
npm run dev:quick
```

---

## ⚙️ Configuration avancée

### Variables d'environnement importantes

```bash
# Serveur
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Base de données
DATABASE_URL="postgresql://postgres:password@localhost:5432/melio_local"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Prisma Studio

Pour explorer visuellement la base de données :

```bash
npm run prisma:studio
```

S'ouvre automatiquement dans le navigateur sur http://localhost:5555

---

## 🆘 Support

En cas de problème :

1. Vérifier les prérequis : `npm run check`
2. Consulter la section [Dépannage](#dépannage)
3. Regarder les logs du serveur
4. Vérifier que PostgreSQL et Redis sont bien démarrés

---

**Dernière mise à jour : 15 octobre 2025**


# 🚀 Développement Local - Melio Backend

Ce guide vous permet de configurer et lancer l'application Melio en local avec les mêmes configurations que la production.

## 📋 Prérequis

### 1. Logiciels requis
- **Node.js** (v18+)
- **PostgreSQL** (v13+)
- **Redis** (v6+)
- **npm** ou **yarn**

### 2. Installation des dépendances
```bash
cd backend
npm install
```

## 🗄️ Configuration de la Base de Données

### 1. Installer PostgreSQL
```bash
# macOS (avec Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

### 2. Créer la base de données
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE melio_local;

# Créer un utilisateur (optionnel)
CREATE USER melio_user WITH PASSWORD 'melio123';
GRANT ALL PRIVILEGES ON DATABASE melio_local TO melio_user;

# Quitter
\q
```

### 3. Installer Redis
```bash
# macOS (avec Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Télécharger depuis https://github.com/microsoftarchive/redis/releases
```

## ⚙️ Configuration de l'Environnement

### 1. Configuration automatique
```bash
npm run setup
```
Ce script va créer le fichier `.env` avec toutes les variables nécessaires.

### 2. Configuration manuelle (optionnel)
Si vous préférez configurer manuellement, copiez `env.example` vers `.env` :
```bash
cp env.example .env
```

## 🚀 Lancement de l'Application

### Développement Local
```bash
npm run dev
```
Cette commande va :
- ✅ Configurer l'environnement
- ✅ Générer le client Prisma
- ✅ Appliquer les migrations
- ✅ Lancer le serveur en mode watch

### Production Locale
```bash
npm run prod
```
Cette commande va :
- ✅ Configurer l'environnement
- ✅ Builder l'application
- ✅ Générer le client Prisma
- ✅ Appliquer les migrations
- ✅ Lancer le serveur en production

## 🗃️ Gestion de la Base de Données

### Configuration complète
```bash
npm run db:setup
```
Configure la base de données avec toutes les tables et l'admin par défaut.

### Chargement des données de test
```bash
npm run db:seed
```
Charge 100 élèves, 10 écoles, 200 alertes, etc.

### Reset complet
```bash
npm run db:reset
```
Supprime toutes les données et recharge les données de test.

### Interface Prisma Studio
```bash
npm run prisma:studio
```
Ouvre l'interface graphique pour explorer la base de données.

## 📊 Comptes de Test

Après le seeding, vous aurez accès à :

### Admin
- **Email** : `admin@melio.com`
- **Mot de passe** : `admin123`

### Agents (par école)
- **Email** : `agent1@ecoleprimairevictorhugo.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL001`

Voir `COMPTES-TEST.md` pour la liste complète.

## 🔧 Commandes Utiles

### Développement
```bash
npm run dev              # Développement avec watch
npm run start:debug      # Développement avec debug
npm run build            # Build de production
npm run lint             # Vérification du code
```

### Tests
```bash
npm run test             # Tests unitaires
npm run test:watch       # Tests en mode watch
npm run test:e2e         # Tests end-to-end
```

### Base de données
```bash
npm run prisma:generate  # Générer le client Prisma
npm run prisma:migrate   # Migrations de développement
npm run prisma:deploy    # Migrations de production
```

## 🌐 Accès à l'Application

- **API** : http://localhost:3000
- **Swagger** : http://localhost:3000/api/v1/docs
- **Prisma Studio** : http://localhost:5555 (après `npm run prisma:studio`)

## 🔍 Vérification

### 1. Vérifier PostgreSQL
```bash
psql -U postgres -d melio_local -c "SELECT version();"
```

### 2. Vérifier Redis
```bash
redis-cli ping
# Devrait répondre "PONG"
```

### 3. Vérifier l'API
```bash
curl http://localhost:3000/api/v1/health
```

## 🐛 Dépannage

### Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL est démarré
brew services list | grep postgresql
# ou
sudo systemctl status postgresql

# Vérifier la connexion
psql -U postgres -h localhost
```

### Erreur de connexion Redis
```bash
# Vérifier que Redis est démarré
brew services list | grep redis
# ou
sudo systemctl status redis

# Tester Redis
redis-cli ping
```

### Port déjà utilisé
```bash
# Trouver le processus qui utilise le port 3000
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)
```

## 📝 Notes Importantes

- Les variables d'environnement sont identiques à la production
- La base de données locale est séparée de la production
- Les données de test sont régénérées à chaque `npm run db:reset`
- Le mode développement inclut le hot-reload automatique

---

*Guide de développement local Melio - Mise à jour automatique*

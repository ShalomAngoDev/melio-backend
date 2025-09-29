# Melio Backend

Backend sécurisé RGPD pour l'application Melio de lutte contre le harcèlement scolaire.

## 🚀 Déploiement

### Prérequis
- Node.js 20+
- npm ou yarn
- Base de données (SQLite pour dev, PostgreSQL pour prod)

### Variables d'environnement

Copiez `env.example` vers `.env` et configurez :

```bash
# Base de données
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# API Keys (optionnel)
OPENAI_API_KEY="your-openai-key"

# Redis (optionnel pour production)
REDIS_URL="redis://localhost:6379"

# MinIO/S3 (optionnel pour fichiers)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

### Installation

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate

# Peupler la base de données (optionnel)
npm run prisma:seed
```

### Développement

```bash
# Démarrer en mode développement
npm run start:dev

# Démarrer avec Docker
npm run docker:up
```

### Production

```bash
# Build de l'application
npm run build

# Démarrer en production
npm run start:prod
```

## 🏗️ Architecture

### Modules principaux
- **Auth** : Authentification JWT et gestion des rôles
- **Schools** : Gestion des établissements scolaires
- **Students** : Gestion des élèves et identifiants anonymes
- **Journal** : Journal intime et analyse IA
- **Alerts** : Système d'alertes et commentaires
- **Chat** : Chatbot empathique et chat interactif
- **Reports** : Signalements anonymes
- **Analytics** : Statistiques et tendances

### Sécurité RGPD
- Identifiants anonymes pour les élèves
- Chiffrement des données sensibles
- Rétention automatique des données
- Audit trail complet

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Base de données

### Schéma principal
- **Schools** : Établissements scolaires
- **Students** : Élèves avec identifiants anonymes
- **AgentUser** : Agents éducatifs
- **JournalEntry** : Entrées de journal avec analyse IA
- **Alert** : Alertes générées par l'IA
- **ChatMessage** : Messages de chat
- **Report** : Signalements

### Commandes Prisma
```bash
# Visualiser la base
npm run prisma:studio

# Migration
npm run prisma:migrate

# Reset complet
npx prisma migrate reset
```

## 🐳 Docker

```bash
# Build
docker build -t melio-backend .

# Run
docker run -p 3000:3000 melio-backend
```

## 📝 API Documentation

Une fois démarré, la documentation Swagger est disponible sur :
- Développement : http://localhost:3000/api
- Production : https://your-domain.com/api

## 🔧 Scripts utiles

```bash
# Créer un admin
npm run scripts:create-admin

# Vérifier les données
npm run scripts:verify-data

# Setup complet
npm run scripts:setup
```

## 📦 Déploiement

### Railway
1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Render
1. Créez un nouveau Web Service
2. Connectez votre repo
3. Configurez les variables d'environnement

### Heroku
1. Créez une nouvelle app
2. Connectez le repo
3. Ajoutez l'addon PostgreSQL
4. Configurez les variables

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Commitez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence privée - Tous droits réservés Melio Team.
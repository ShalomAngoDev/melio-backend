# ⚙️ Melio Backend

API sécurisée RGPD pour l'application Melio de lutte contre le harcèlement scolaire.

## 🚀 Démarrage rapide

### Installation
```bash
# Dépendances
npm install

# Configuration
cp env.example .env
# Éditez .env avec vos paramètres

# Base de données
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Démarrage
npm run start:dev
```

**🌐 API :** `http://localhost:3000/api/v1`  
**📖 Documentation :** `http://localhost:3000/api/v1/docs`

## 🏗️ Architecture

### Modules principaux
- **Auth** : Authentification JWT et rôles
- **Schools** : Gestion des établissements
- **Students** : Élèves avec identifiants anonymes
- **Journal** : Journal intime et analyse IA
- **Alerts** : Système d'alertes et commentaires
- **Chat** : Chatbot empathique
- **Reports** : Signalements anonymes
- **Analytics** : Statistiques et tendances

### Sécurité RGPD
- Identifiants anonymes pour les élèves
- Chiffrement des données sensibles
- Rétention automatique des données
- Audit trail complet

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
npm run prisma:studio    # Interface graphique
npm run prisma:migrate   # Migrations
npx prisma migrate reset # Reset complet
```

## 🧪 Tests et développement

```bash
npm run test            # Tests unitaires
npm run test:e2e        # Tests end-to-end
npm run test:cov        # Coverage
npm run scripts:setup   # Configuration initiale
```

## 🐳 Déploiement

### Variables d'environnement requises
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://your-frontend.com
```

### Plateformes supportées
- **Railway** : Déploiement automatique
- **Render** : Web Service
- **Heroku** : Avec addon PostgreSQL

## 📝 API Documentation

La documentation Swagger est générée automatiquement et disponible sur `/api/v1/docs` une fois le serveur démarré.

---

Pour plus d'informations, consultez le [README principal](../README.md).
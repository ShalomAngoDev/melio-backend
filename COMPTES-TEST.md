# 🧪 Comptes de Test - Application Melio

## 🔑 Comptes Administrateur

### Admin Principal
- **Email** : `admin@melio.com`
- **Mot de passe** : `admin123`
- **Rôle** : `ROLE_ADMIN_MELIO`
- **Accès** : Toutes les fonctionnalités administratives

---

## 👨‍🏫 Comptes Agents d'École

### École 1 - École Primaire Victor Hugo
- **Email** : `agent1@ecoleprimairevictorhugo.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL001`
- **Rôle** : `ROLE_AGENT`

### École 2 - Collège Jules Verne
- **Email** : `agent2@collegejulesverne.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL002`
- **Rôle** : `ROLE_AGENT`

### École 3 - Lycée Marie Curie
- **Email** : `agent3@lyceemariecurie.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL003`
- **Rôle** : `ROLE_AGENT`

### École 4 - École Maternelle Les Petits Loups
- **Email** : `agent4@ecolematernellelespetitsloups.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL004`
- **Rôle** : `ROLE_AGENT`

### École 5 - Collège Jean Moulin
- **Email** : `agent5@collegejeanmoulin.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL005`
- **Rôle** : `ROLE_AGENT`

### École 6 - Lycée Albert Einstein
- **Email** : `agent6@lyceealberteinstein.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL006`
- **Rôle** : `ROLE_AGENT`

### École 7 - École Primaire Les Lilas
- **Email** : `agent7@ecoleprimaireleslilas.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL007`
- **Rôle** : `ROLE_AGENT`

### École 8 - Collège Pierre et Marie Curie
- **Email** : `agent8@collegepierreetmariecurie.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL008`
- **Rôle** : `ROLE_AGENT`

### École 9 - Lycée Louis Pasteur
- **Email** : `agent9@lyceelouispasteur.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL009`
- **Rôle** : `ROLE_AGENT`

### École 10 - École Maternelle Arc-en-Ciel
- **Email** : `agent10@ecolematernellearcenciel.fr`
- **Mot de passe** : `agent123`
- **Code école** : `SCHOOL010`
- **Rôle** : `ROLE_AGENT`

---

## 📊 Données de Test Disponibles

### Écoles
- **Nombre** : 10 écoles
- **Types** : Primaire, Collège, Lycée
- **Codes** : SCHOOL001 à SCHOOL010
- **Villes** : Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Strasbourg, Montpellier, Bordeaux, Lille

### Élèves
- **Nombre** : 100 élèves (10 par école)
- **IDs** : STU101 à STU110, STU201 à STU210, etc.
- **Classes** : CP, CE1, CE2, CM1, CM2, 6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Terminale
- **Âges** : 7-18 ans (dates de naissance 2010-2017)

### Alertes
- **Nombre** : 200 alertes
- **Niveaux de risque** : FAIBLE, MOYEN, ÉLEVÉ, CRITIQUE
- **Statuts** : NOUVELLE, EN_COURS, RÉSOLUE, ARCHIVÉE
- **Humeurs** : Heureux, Triste, En colère, Anxieux, Fatigué, Excité, Calme, Stressé, Content, Inquiet

### Signalements
- **Nombre** : 100 signalements
- **Urgences** : FAIBLE, MOYENNE, ÉLEVÉE, URGENTE
- **Statuts** : NOUVEAU, EN_COURS, TRAITÉ, CLÔTURÉ
- **Types** : Harcèlement, Comportement, Conflit, Isolement, etc.

### Journal & Chat
- **Entrées journal** : 50 entrées avec humeurs variées
- **Messages chat** : 30 messages entre élèves et agents

---

## 🚀 URLs de Test

### API Backend
- **Base URL** : `https://web-production-39a0b.up.railway.app/api/v1`
- **Documentation** : `https://web-production-39a0b.up.railway.app/api/v1/docs`
- **Health Check** : `https://web-production-39a0b.up.railway.app/api/v1/health`

### Endpoints Principaux
- **Login Admin** : `POST /api/v1/auth/admin/login`
- **Login Agent** : `POST /api/v1/auth/agent/login`
- **Alertes** : `GET /api/v1/alerts`
- **Signalements** : `GET /api/v1/reports`
- **Statistiques** : `GET /api/v1/statistics/general`
- **Élèves** : `GET /api/v1/students`

---

## 🔧 Instructions de Test

### 1. Test Admin
```bash
curl -X POST https://web-production-39a0b.up.railway.app/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@melio.com", "password": "admin123"}'
```

### 2. Test Agent
```bash
curl -X POST https://web-production-39a0b.up.railway.app/api/v1/auth/agent/login \
  -H "Content-Type: application/json" \
  -d '{"schoolCode": "SCHOOL001", "email": "agent1@ecoleprimairevictorhugo.fr", "password": "agent123"}'
```

### 3. Test Alertes
```bash
curl -X GET https://web-production-39a0b.up.railway.app/api/v1/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Signalements
```bash
curl -X GET https://web-production-39a0b.up.railway.app/api/v1/reports \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Notes Importantes

- Tous les mots de passe sont identiques pour faciliter les tests
- Les données sont générées de manière aléatoire mais réaliste
- Chaque école a exactement 10 élèves et 1 agent
- Les alertes et signalements sont distribués aléatoirement
- Les dates sont cohérentes (élèves nés entre 2010-2017)
- Tous les comptes sont actifs et prêts à être utilisés

---

*Fichier généré automatiquement par le script de seeding Melio*

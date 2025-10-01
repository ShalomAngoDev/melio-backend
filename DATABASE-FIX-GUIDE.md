# 🔧 Guide de correction de la base de données Railway

## 🚨 Problème identifié

**Erreur :** `relation "alerts" does not exist` et `relation "reports" does not exist`

**Cause :** Les migrations Prisma existantes créent les tables avec les noms des modèles (`Alert`, `Report`) mais le schéma actuel utilise `@@map` pour les renommer (`alerts`, `reports`).

## ✅ Solution

### 1. **Scripts créés**

- `scripts/fix-tables-migration.sql` - Migration SQL pour corriger les tables
- `scripts/run-fix-migration.js` - Script pour exécuter la migration
- `scripts/seed-after-migration.js` - Script pour initialiser les données
- `scripts/fix-database.js` - Script principal qui exécute tout

### 2. **Tables corrigées**

Les tables suivantes seront créées avec les bons noms :
- `schools` (au lieu de `School`)
- `students` (au lieu de `Student`)
- `agent_users` (au lieu de `AgentUser`)
- `admin_users` (au lieu de `AdminUser`)
- `alerts` (au lieu de `Alert`) ✅
- `reports` (au lieu de `Report`) ✅
- `journal_entries`
- `alert_comments`
- `chatbot_messages`
- `chat_messages`

## 🚀 Déploiement sur Railway

### Option 1: Via Railway CLI (Recommandé)

```bash
# 1. Se connecter à Railway
railway login

# 2. Sélectionner le projet
railway link

# 3. Exécuter le script de correction
railway run node scripts/fix-database.js
```

### Option 2: Via Railway Dashboard

1. Aller sur [Railway Dashboard](https://railway.app)
2. Sélectionner votre projet Melio
3. Aller dans l'onglet "Variables"
4. Vérifier que `DATABASE_URL` est bien configurée
5. Aller dans l'onglet "Deployments"
6. Redéployer l'application (les scripts seront exécutés automatiquement)

### Option 3: Via le terminal Railway

```bash
# Se connecter au terminal Railway
railway shell

# Exécuter les scripts
node scripts/fix-database.js
```

## 🧪 Vérification

Après l'exécution, vérifiez que :

1. **Tables créées :**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('schools', 'students', 'agent_users', 'admin_users', 'alerts', 'reports')
ORDER BY table_name;
```

2. **Données initialisées :**
```sql
SELECT email FROM admin_users;
SELECT email FROM agent_users;
SELECT name FROM schools;
```

3. **API fonctionne :**
- Testez la connexion admin : `admin@melio.app` / `admin123`
- Testez la connexion agent : `agent@college-victor-hugo.fr` / `agent123`

## 🔑 Comptes créés

- **Admin :** `admin@melio.app` / `admin123`
- **Super Admin :** `superadmin@melio.app` / `superadmin123`
- **Agent :** `agent@college-victor-hugo.fr` / `agent123`
- **École :** `JMO75-01` (Collège Victor Hugo)

## 📋 Structure finale

```
PostgreSQL Database:
├── schools (établissements)
├── students (élèves)
├── agent_users (agents sociaux)
├── admin_users (administrateurs)
├── journal_entries (entrées de journal)
├── alerts (alertes IA) ✅
├── alert_comments (commentaires d'alertes)
├── reports (signalements) ✅
├── chatbot_messages (messages chatbot)
└── chat_messages (messages chat)
```

## 🔧 Dépannage

### Erreur "relation does not exist"
- Vérifiez que `DATABASE_URL` pointe vers PostgreSQL
- Exécutez `node scripts/fix-database.js`

### Erreur de connexion
- Vérifiez les variables d'environnement Railway
- Testez la connexion : `railway run psql $DATABASE_URL`

### Tables manquantes
- Exécutez manuellement : `node scripts/run-fix-migration.js`
- Vérifiez les logs Railway

## ✅ Validation finale

1. **Backend démarre sans erreur**
2. **Tables `alerts` et `reports` existent**
3. **API répond aux requêtes**
4. **Connexions admin/agent fonctionnent**
5. **Frontend peut se connecter**

Le problème de tables manquantes devrait maintenant être résolu ! 🎉



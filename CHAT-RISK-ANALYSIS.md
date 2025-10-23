# 🚨 Analyse de Risque des Conversations de Chat

## Vue d'ensemble

Le système d'analyse de risque des conversations de chat permet de détecter automatiquement les signaux de détresse dans les échanges entre les élèves et Mélio, en plus de l'analyse des journaux intimes.

## 🔍 Fonctionnalités

### 1. **Analyse en Temps Réel**
- Chaque message de l'élève est analysé instantanément
- Prise en compte du contexte de la conversation
- Détection des patterns préoccupants

### 2. **Catégories de Risque Détectées**
- **Violence** : Mots-clés liés à la violence physique
- **Auto-mutilation** : Signaux de suicide ou d'automutilation
- **Harcèlement** : Signes de harcèlement scolaire
- **Dépression** : Indicateurs de dépression
- **Anxiété** : Signaux d'anxiété et de stress
- **Isolement** : Sentiments de solitude et d'exclusion
- **Problèmes familiaux** : Difficultés à la maison
- **Problèmes scolaires** : Difficultés à l'école

### 3. **Analyse Contextuelle**
- **Ton émotionnel** : Détection du niveau émotionnel de la conversation
- **Fréquence** : Nombre de messages récents (détection d'urgence)
- **Escalade** : Détection d'une aggravation progressive
- **Patterns** : Comportements répétitifs préoccupants

## 🎯 Niveaux de Risque

| Niveau | Score | Action |
|--------|-------|--------|
| **FAIBLE** | 0-29 | Suivi normal |
| **MOYEN** | 30-59 | Suivi attentif recommandé |
| **ÉLEVÉ** | 60-79 | Surveillance renforcée + alerte |
| **CRITIQUE** | 80-100 | Intervention immédiate + alerte |

## 🔧 Architecture Technique

### Services Impliqués

1. **`ChatRiskAnalysisService`**
   - Analyse des messages individuels
   - Analyse du contexte de conversation
   - Détection des patterns préoccupants
   - Calcul du score de risque

2. **`ChatService`** (modifié)
   - Intégration de l'analyse de risque
   - Création automatique d'alertes
   - Gestion du flux de conversation

3. **`Alert`** (base de données)
   - Stockage des alertes générées
   - Type de source : `CHAT`
   - Métadonnées d'analyse

### Flux de Données

```
Message Élève → ChatService → ChatRiskAnalysisService
     ↓
Analyse de Risque → Calcul Score → Détermination Niveau
     ↓
Si ÉLEVÉ/CRITIQUE → Création Alerte → Notification Agents
     ↓
Réponse Mélio → Retour à l'Élève
```

## 📊 Patterns Détectés

### 1. **Répétition Obsessionnelle**
- Messages répétitifs sur le même sujet
- Indicateur de fixation ou d'obsession

### 2. **Escalade Émotionnelle**
- Augmentation progressive de l'intensité émotionnelle
- Signe d'aggravation de la situation

### 3. **Messages Courts et Vagues**
- Réponses évasives répétées
- Possible évitement ou difficulté à s'exprimer

### 4. **Évitement des Questions**
- Ignorer les questions du bot
- Possible réticence à communiquer

## 🚨 Système d'Alertes

### Création Automatique
- **Déclenchement** : Niveau ÉLEVÉ ou CRITIQUE
- **Source** : `sourceType: 'CHAT'`
- **Résumé** : Analyse contextuelle + patterns détectés
- **Conseils** : Recommandations d'action

### Informations Incluses
- Niveau de risque et score
- Catégorie dominante détectée
- Patterns préoccupants identifiés
- Contexte de la conversation
- Recommandations d'intervention

## 🧪 Test du Système

### Script de Test
```bash
cd backend
node scripts/test-chat-risk-analysis.js
```

### Messages de Test
1. **FAIBLE** : "Salut Mélio, comment ça va ?"
2. **MOYEN** : "Je me sens triste aujourd'hui"
3. **ÉLEVÉ** : "Les autres se moquent de moi"
4. **CRITIQUE** : "Je veux me tuer"

## 🔒 Sécurité et Confidentialité

### Protection des Données
- Analyse locale (pas d'envoi externe)
- Logs sécurisés des analyses
- Accès restreint aux agents autorisés

### Conformité
- Respect de la vie privée des élèves
- Traçabilité des analyses
- Audit trail complet

## 📈 Métriques et Monitoring

### Indicateurs Clés
- Nombre d'alertes générées par jour
- Répartition par niveau de risque
- Temps de réponse moyen
- Taux de faux positifs/négatifs

### Tableaux de Bord
- Vue d'ensemble des alertes de chat
- Tendances temporelles
- Performance du système d'analyse

## 🚀 Améliorations Futures

### Court Terme
- [ ] Ajustement des seuils de risque
- [ ] Amélioration des patterns détectés
- [ ] Interface de monitoring pour les agents

### Moyen Terme
- [ ] Apprentissage automatique des patterns
- [ ] Intégration avec les journaux intimes
- [ ] Alertes prédictives

### Long Terme
- [ ] IA conversationnelle avancée
- [ ] Analyse multimodale (texte + émotions)
- [ ] Prédiction de crises

## 📞 Support et Maintenance

### Logs Importants
- `Chat risk analysis for student X: LEVEL (score/100)`
- `Chat alert created for student X with risk level: LEVEL`

### Dépannage
1. Vérifier les logs d'analyse
2. Contrôler la création d'alertes
3. Valider les patterns détectés
4. Tester avec des messages de référence

---

**Note** : Ce système complète l'analyse des journaux intimes pour offrir une couverture complète du bien-être des élèves à travers toutes leurs interactions avec Mélio.

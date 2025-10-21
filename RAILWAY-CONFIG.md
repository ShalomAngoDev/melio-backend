# Configuration Railway pour Melio Backend

## Variables d'environnement requises

Configurez ces variables dans le dashboard Railway :

### CORS
```
CORS_ORIGINS=https://www.melio-soutien.net,https://melio-soutien.net
```

### JWT (Générer de nouveaux secrets pour la production)
```
JWT_SECRET=your-production-jwt-secret-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-production-refresh-secret-change-this
JWT_REFRESH_EXPIRES_IN=7d
```

### Configuration de base
```
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
```

### Sécurité
```
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Logs
```
LOG_LEVEL=info
LOG_FORMAT=json
TZ=Europe/Paris
```

### Feature Flags
```
FEATURE_AI_ENABLED=true
FEATURE_NOTIFICATIONS_ENABLED=true
FEATURE_PDF_EXPORT_ENABLED=true
```

## Déploiement

1. Connectez-vous à Railway : `railway login`
2. Liez le projet : `railway link`
3. Configurez les variables d'environnement
4. Déployez : `railway up`

## URLs de production

- API : `https://web-production-39a0b.up.railway.app/api/v1`
- Documentation : `https://web-production-39a0b.up.railway.app/api/v1/docs`
- Health Check : `https://web-production-39a0b.up.railway.app/api/v1/health`

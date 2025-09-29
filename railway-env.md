# Variables d'environnement Railway

## Variables OBLIGATOIRES à configurer dans Railway :

### Base de données
```bash
DATABASE_URL=postgresql://postgres:vBGFqLFVuRuhyflGarvCxkbITqfGCrRA@postgres.railway.internal:5432/railway
```

### Application
```bash
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
```

### JWT (GÉNÉREZ DES CLÉS SÉCURISÉES)
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-for-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-for-production
JWT_REFRESH_EXPIRES_IN=7d
```

### CORS (remplacez par votre domaine frontend)
```bash
CORS_ORIGINS=https://votre-frontend.vercel.app,https://votre-domaine.com
```

### Sécurité
```bash
BCRYPT_ROUNDS=12
```

### Redis (optionnel)
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Feature Flags
```bash
FEATURE_AI_ENABLED=true
FEATURE_NOTIFICATIONS_ENABLED=true
```

### Logging
```bash
LOG_LEVEL=info
TZ=Europe/Paris
```

## Comment configurer :

1. Allez dans votre projet Railway
2. Cliquez sur "Settings" → "Variables"
3. Ajoutez chaque variable une par une
4. Cliquez sur "Deploy" pour redéployer

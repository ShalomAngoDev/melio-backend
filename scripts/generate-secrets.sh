#!/bin/bash

# 🔐 Script de Génération de Clés Sécurisées pour Melio
# Usage: ./scripts/generate-secrets.sh

echo "🔐 Génération de Clés Sécurisées pour Melio Backend"
echo "=================================================="

# Vérifier si Node.js est disponible
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Node.js détecté"

# Générer les clés JWT
echo "🔑 Génération des clés JWT..."

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

echo ""
echo "📋 VARIABLES D'ENVIRONNEMENT À COPIER DANS RAILWAY:"
echo "=================================================="
echo ""
echo "# JWT Secrets (COPIER EXACTEMENT)"
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""
echo "# Configuration App"
echo "NODE_ENV=production"
echo "PORT=3000"
echo "API_PREFIX=api/v1"
echo ""
echo "# CORS (À modifier selon votre frontend)"
echo "CORS_ORIGINS=https://melio-frontend.vercel.app,https://melio.app,http://localhost:5173"
echo ""
echo "# Sécurité"
echo "BCRYPT_ROUNDS=12"
echo "RATE_LIMIT_WINDOW_MS=900000"
echo "RATE_LIMIT_MAX_REQUESTS=100"
echo ""
echo "# Feature Flags"
echo "FEATURE_AI_ENABLED=true"
echo "FEATURE_NOTIFICATIONS_ENABLED=true"
echo "FEATURE_PDF_EXPORT_ENABLED=true"
echo ""
echo "# Logging"
echo "LOG_LEVEL=info"
echo "LOG_FORMAT=json"
echo "TZ=Europe/Paris"
echo ""
echo "🎯 INSTRUCTIONS:"
echo "1. Copiez toutes les variables ci-dessus"
echo "2. Allez dans Railway → Settings → Variables"
echo "3. Collez chaque variable (une par une)"
echo "4. N'oubliez pas DATABASE_URL=\${{Postgres.DATABASE_URL}}"
echo ""
echo "✅ Clés générées avec succès!"

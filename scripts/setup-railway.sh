#!/bin/bash

# 🚀 Script de Configuration Automatique Railway
# Usage: ./scripts/setup-railway.sh

set -e

echo "🚀 Configuration Automatique Railway - Melio Backend"
echo "==================================================="

# Vérifier si Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "📦 Installation de Railway CLI..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install railway
        else
            echo "❌ Homebrew non trouvé. Installez Railway CLI manuellement:"
            echo "   curl -fsSL https://railway.app/install.sh | sh"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://railway.app/install.sh | sh
    else
        echo "❌ OS non supporté. Installez Railway CLI manuellement:"
        echo "   https://docs.railway.app/develop/cli"
        exit 1
    fi
    
    echo "✅ Railway CLI installé"
else
    echo "✅ Railway CLI déjà installé"
fi

# Générer les clés sécurisées
echo "🔐 Génération des clés JWT sécurisées..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

echo "🔑 Clés générées avec succès"

# Se connecter à Railway
echo "🔐 Connexion à Railway..."
railway login

# Sélectionner le projet
echo "📁 Sélection du projet Railway..."
echo "ℹ️  Sélectionnez votre projet melio-backend"
railway link

# Configurer les variables d'environnement
echo "⚙️  Configuration des variables d'environnement..."

# Variables obligatoires
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
railway variables set JWT_EXPIRES_IN="15m"
railway variables set JWT_REFRESH_EXPIRES_IN="7d"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
railway variables set API_PREFIX="api/v1"

# Variables de sécurité
railway variables set BCRYPT_ROUNDS="12"
railway variables set RATE_LIMIT_WINDOW_MS="900000"
railway variables set RATE_LIMIT_MAX_REQUESTS="100"

# Feature flags
railway variables set FEATURE_AI_ENABLED="true"
railway variables set FEATURE_NOTIFICATIONS_ENABLED="true"
railway variables set FEATURE_PDF_EXPORT_ENABLED="true"

# Logging
railway variables set LOG_LEVEL="info"
railway variables set LOG_FORMAT="json"
railway variables set TZ="Europe/Paris"

# CORS (à modifier selon votre frontend)
railway variables set CORS_ORIGINS="https://melio-frontend.vercel.app,https://melio.app,http://localhost:5173"

echo "✅ Variables d'environnement configurées"

# Vérifier que PostgreSQL est configuré
echo "🗄️  Vérification de la base de données PostgreSQL..."
if railway variables get DATABASE_URL &> /dev/null; then
    echo "✅ PostgreSQL configuré"
else
    echo "❌ PostgreSQL non configuré"
    echo "📋 Instructions:"
    echo "1. Allez dans Railway Dashboard"
    echo "2. Cliquez '+ New' → 'Database' → 'PostgreSQL'"
    echo "3. Railway générera automatiquement DATABASE_URL"
    echo ""
    echo "⏸️  Appuyez sur Entrée quand PostgreSQL est configuré..."
    read
fi

# Exécuter les migrations
echo "🗄️  Exécution des migrations..."
railway run npx prisma generate
railway run npx prisma migrate deploy

# Optionnel: Seeder les données
echo ""
read -p "🌱 Voulez-vous exécuter le seeder? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Exécution du seeder..."
    railway run npx prisma db seed
    echo "✅ Seeder exécuté"
fi

# Vérifier le déploiement
echo "🔍 Vérification du déploiement..."
railway status

# Obtenir l'URL de déploiement
DEPLOY_URL=$(railway domain)
echo ""
echo "🎉 Configuration terminée!"
echo "========================="
echo "🌐 URL de votre API: $DEPLOY_URL"
echo "📚 Documentation: $DEPLOY_URL/api"
echo "💚 Health Check: $DEPLOY_URL/api/v1/health"
echo ""
echo "🧪 Test rapide:"
echo "curl $DEPLOY_URL/api/v1/health"
echo ""
echo "✅ Configuration Railway terminée avec succès!"

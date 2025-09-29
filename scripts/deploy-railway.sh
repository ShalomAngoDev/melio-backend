#!/bin/bash

# 🚀 Script de Déploiement Railway pour Melio Backend
# Usage: ./scripts/deploy-railway.sh

set -e

echo "🚀 Déploiement Railway - Melio Backend"
echo "======================================"

# Vérifier si Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "📦 Installation de Railway CLI..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install railway
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://railway.app/install.sh | sh
    else
        echo "❌ OS non supporté. Installez Railway CLI manuellement:"
        echo "   https://docs.railway.app/develop/cli"
        exit 1
    fi
fi

echo "✅ Railway CLI détecté"

# Se connecter à Railway
echo "🔐 Connexion à Railway..."
railway login

# Sélectionner le projet
echo "📁 Sélection du projet Railway..."
railway link

# Vérifier les variables d'environnement
echo "🔍 Vérification des variables d'environnement..."

# Variables obligatoires
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "NODE_ENV"
)

for var in "${REQUIRED_VARS[@]}"; do
    if railway variables get "$var" &> /dev/null; then
        echo "✅ $var est défini"
    else
        echo "❌ $var n'est pas défini"
        echo "📝 Définissez $var avec: railway variables set $var=VALUE"
    fi
done

# Exécuter les migrations
echo "🗄️ Exécution des migrations..."
railway run npx prisma generate
railway run npx prisma migrate deploy

# Optionnel: Seeder les données
read -p "🌱 Voulez-vous exécuter le seeder? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Exécution du seeder..."
    railway run npx prisma db seed
fi

# Déployer
echo "🚀 Déploiement..."
railway up

# Vérifier le statut
echo "🔍 Vérification du statut..."
railway status

echo "✅ Déploiement terminé!"
echo "🌐 Votre API est disponible sur: $(railway domain)"
echo "📚 Documentation Swagger: $(railway domain)/api"
echo "💚 Health Check: $(railway domain)/api/v1/health"

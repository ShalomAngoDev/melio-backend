#!/bin/bash

# Script de déploiement Railway avec gestion de la base de données
set -e

echo "🚀 Démarrage du déploiement Railway..."

# Vérifier que DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERREUR: DATABASE_URL n'est pas définie"
    echo "Assurez-vous d'avoir ajouté une base PostgreSQL à votre projet Railway"
    exit 1
fi

echo "✅ DATABASE_URL trouvée"

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Exécuter les migrations
echo "🗄️ Exécution des migrations de base de données..."
npx prisma migrate deploy

# Vérifier la connexion à la base
echo "🔍 Vérification de la connexion à la base de données..."
npx prisma db pull --print

# Peupler la base de données (seed)
echo "🌱 Peuplement de la base de données..."
npx prisma db seed

echo "✅ Base de données configurée et peuplée avec succès"

# Démarrer l'application
echo "🚀 Démarrage de l'application..."
npm run start:prod

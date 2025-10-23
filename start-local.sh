#!/bin/bash

echo "🚀 Starting Melio Backend locally..."

# Créer le fichier .env.local s'il n'existe pas
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Base de données locale SQLite
DATABASE_URL="file:./dev.db"

# Configuration locale
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# JWT (pour le développement)
JWT_SECRET=dev-secret-key-for-local-development-only
JWT_REFRESH_SECRET=dev-refresh-secret-key-for-local-development-only
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
EOF
fi

# Modifier temporairement le schéma Prisma pour SQLite
echo "🔄 Switching to SQLite for local development..."
sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
sed -i.bak 's|url      = env("DATABASE_URL")|url      = "file:./dev.db"|' prisma/schema.prisma

# Générer le client Prisma
echo "🔧 Generating Prisma client..."
npx prisma generate

# Créer la base de données et les tables
echo "🗄️ Creating database and tables..."
npx prisma db push

# Seeder les données
echo "🌱 Seeding database..."
npx prisma db seed

# Démarrer l'application
echo "🚀 Starting application..."
npm run start:dev









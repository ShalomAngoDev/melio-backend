#!/bin/bash

# Melio Backend Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Melio Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker $(docker --version) detected"
echo "✅ Docker Compose $(docker-compose --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please review and update the configuration."
else
    echo "✅ .env file already exists"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis minio

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are healthy
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U melio -d melio_db > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
    exit 1
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
    exit 1
fi

# Check MinIO
if curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo "✅ MinIO is ready"
else
    echo "❌ MinIO is not ready"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Run database migrations
echo "🗄️ Running database migrations..."
npm run prisma:migrate

# Seed database
echo "🌱 Seeding database..."
npm run prisma:seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review the .env file configuration"
echo "2. Start the API: npm run start:dev"
echo "3. Open Swagger docs: http://localhost:3000/api/v1/docs"
echo "4. Open MinIO console: http://localhost:9001 (melio/melio123)"
echo ""
echo "🔐 Test credentials:"
echo "Agent: admin@college-victor-hugo.fr / admin123"
echo "Student: COLLEGE2024 / ELEVE001"
echo ""
echo "Happy coding! 🚀"

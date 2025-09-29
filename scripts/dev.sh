#!/bin/bash

# Melio Backend Development Script
# This script starts the development environment

set -e

echo "🚀 Starting Melio Backend Development Environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run ./scripts/setup.sh first."
    exit 1
fi

# Start all services
echo "🐳 Starting all services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Start the API in development mode
echo "🚀 Starting API in development mode..."
npm run start:dev

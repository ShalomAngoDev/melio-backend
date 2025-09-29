#!/bin/bash

# 🧪 Script de Test de Déploiement Railway
# Usage: ./scripts/test-deployment.sh [URL]

set -e

# URL par défaut (à remplacer par votre URL Railway)
DEFAULT_URL="https://melio-backend-production.railway.app"
API_URL=${1:-$DEFAULT_URL}

echo "🧪 Test de Déploiement Railway - Melio Backend"
echo "=============================================="
echo "🌐 URL API: $API_URL"
echo ""

# Fonction de test
test_endpoint() {
    local endpoint=$1
    local description=$2
    local method=${3:-GET}
    local data=${4:-}
    
    echo "🔍 Test: $description"
    echo "   Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint" || echo "ERROR")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint" || echo "ERROR")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        echo "   ✅ SUCCESS ($http_code)"
        if [ ! -z "$body" ] && [ "$body" != "ERROR" ]; then
            echo "   📄 Response: $(echo "$body" | head -c 100)..."
        fi
    else
        echo "   ❌ FAILED ($http_code)"
        if [ ! -z "$body" ] && [ "$body" != "ERROR" ]; then
            echo "   📄 Error: $body"
        fi
    fi
    echo ""
}

# Tests de base
echo "🚀 Tests de Connectivité"
echo "========================"

test_endpoint "/api/v1/health" "Health Check"

echo "🔐 Tests d'Authentification"
echo "=========================="

test_endpoint "/api/v1/auth/status" "Auth Status"

# Test de création d'admin (si les seeds sont configurés)
test_endpoint "/api/v1/auth/admin/login" "Admin Login" "POST" '{"email":"admin@melio.app","password":"admin123"}'

echo "📊 Tests de l'API"
echo "================="

test_endpoint "/api" "Swagger Documentation"

echo "🔍 Tests de Base de Données"
echo "==========================="

# Ces tests nécessitent une authentification
echo "ℹ️  Tests de base de données nécessitent une authentification valide"
echo ""

echo "📋 Résumé des Tests"
echo "==================="
echo "✅ Tests de base terminés"
echo "🌐 URL API: $API_URL"
echo "📚 Documentation: $API_URL/api"
echo "💚 Health Check: $API_URL/api/v1/health"
echo ""
echo "🎯 Prochaines Étapes:"
echo "1. Vérifiez les logs dans Railway Dashboard"
echo "2. Testez l'authentification avec des credentials valides"
echo "3. Configurez votre frontend pour utiliser cette API"
echo ""
echo "✅ Tests terminés!"

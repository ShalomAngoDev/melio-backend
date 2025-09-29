#!/bin/bash

# 🚀 Script d'installation pour la production
# Usage: ./scripts/install-production.sh

set -e

echo "🚀 Installation des dépendances pour la production..."

# Installer les dépendances sans scripts
npm ci --omit=dev --legacy-peer-deps --ignore-scripts

# Nettoyer le cache
npm cache clean --force

echo "✅ Installation terminée avec succès!"

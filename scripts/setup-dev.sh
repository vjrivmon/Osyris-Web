#!/bin/bash

# Script de configuración inicial del entorno de desarrollo
# Grupo Scout Osyris - Sistema de Gestión

echo "⚙️ Configurando entorno de desarrollo Osyris..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar Node.js
log "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

NODE_VERSION=$(node --version)
success "Node.js detectado: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "npm no está instalado."
    exit 1
fi

NPM_VERSION=$(npm --version)
success "npm detectado: $NPM_VERSION"

# Limpiar instalaciones previas
log "Limpiando instalaciones previas..."
rm -rf node_modules
rm -rf api-osyris/node_modules
rm -f package-lock.json
rm -f api-osyris/package-lock.json

# Instalar dependencias del frontend
log "Instalando dependencias del frontend..."
npm install
if [ $? -eq 0 ]; then
    success "✅ Dependencias del frontend instaladas"
else
    error "❌ Error instalando dependencias del frontend"
    exit 1
fi

# Instalar dependencias del backend
log "Instalando dependencias del backend..."
cd api-osyris
npm install
if [ $? -eq 0 ]; then
    success "✅ Dependencias del backend instaladas"
else
    error "❌ Error instalando dependencias del backend"
    exit 1
fi
cd ..

# Crear configuración de Next.js si no existe
if [ ! -f "next.config.js" ]; then
    log "Creando configuración de Next.js..."
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  outputFileTracingRoot: __dirname,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
EOF
    success "✅ Configuración de Next.js creada"
fi

# Crear archivo .env.example si no existe
if [ ! -f ".env.example" ]; then
    log "Creando archivo .env.example..."
    cat > .env.example << 'EOF'
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Osyris Scout Management

# Backend Environment Variables (api-osyris/.env)
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=osyris_scout
JWT_SECRET=your-secret-key-here
EOF
    success "✅ Archivo .env.example creado"
fi

# Crear directorio logs
mkdir -p logs
success "✅ Directorio logs creado"

# Hacer ejecutables los scripts
chmod +x scripts/*.sh
success "✅ Scripts marcados como ejecutables"

success "🎉 Configuración completada!"
echo ""
echo "Para iniciar el desarrollo, ejecuta:"
echo "  ./scripts/dev-start.sh"
echo ""
echo "Para detener servicios:"
echo "  ./scripts/kill-services.sh"
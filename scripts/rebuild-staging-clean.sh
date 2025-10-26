#!/bin/bash

##############################################################################
# Script: rebuild-staging-clean.sh
# Descripción: Reconstrucción completa de staging con dependencias limpias
# Autor: Claude Code
# Fecha: 2025-10-25
##############################################################################

set -e

# Configuración
SERVER="root@116.203.98.142"
STAGING_DIR="/var/www/osyris-staging/current"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Reconstrucción Limpia de Staging"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🛑 Deteniendo servicios staging..."
ssh "$SERVER" << 'EOF'
pm2 stop osyris-staging-frontend osyris-staging-backend || true
pm2 delete osyris-staging-frontend osyris-staging-backend || true
EOF

echo ""
echo "🧹 Limpiando dependencias corruptas..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current

# Limpiar node_modules pero MANTENER package-lock.json
rm -rf node_modules
rm -rf api-osyris/node_modules

# Limpiar cache npm
npm cache clean --force

# Limpiar builds
rm -rf .next
rm -rf build
EOF

echo ""
echo "📦 Instalando dependencias frescas (frontend)..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current
npm install
EOF

echo ""
echo "📦 Instalando dependencias frescas (backend)..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current/api-osyris
npm install
EOF

echo ""
echo "🔨 Construyendo aplicación..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current

# Build Next.js con output detallado
NODE_ENV=production npm run build 2>&1 | tee build-staging.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Build falló - verificar errores"
    exit 1
fi
EOF

echo ""
echo "🚀 Iniciando servicios PM2..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current

# Frontend en puerto 3001
PORT=3001 pm2 start npm --name "osyris-staging-frontend" -- start

# Backend en puerto 5001 con env
cd api-osyris
PORT=5001 pm2 start src/index.js --name "osyris-staging-backend"
cd ..

pm2 save
EOF

echo ""
echo "⏳ Esperando 10 segundos para que los servicios se estabilicen..."
sleep 10

echo ""
echo "🔍 Verificando estado de servicios..."
ssh "$SERVER" "pm2 status | grep osyris-staging"

echo ""
echo "✅ Reconstrucción completada"
echo ""
echo "🌐 URLs de Staging:"
echo "  • Frontend: http://116.203.98.142:3001"
echo "  • Backend API: http://116.203.98.142:5001"
echo ""

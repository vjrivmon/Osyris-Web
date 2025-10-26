#!/bin/bash

##############################################################################
# Script: sync-local-to-staging.sh
# Descripción: Sincroniza código LOCAL con STAGING (no desde producción)
# Autor: Claude Code
# Fecha: 2025-10-25
##############################################################################

set -e

# Configuración
SERVER="root@116.203.98.142"
STAGING_PATH="/var/www/osyris-staging/current"
LOCAL_PATH="/home/vicente/RoadToDevOps/osyris/Osyris-Web"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Sincronización LOCAL → STAGING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🔍 Verificando directorio local..."
if [ ! -d "$LOCAL_PATH" ]; then
    echo "❌ Error: Directorio local no existe: $LOCAL_PATH"
    exit 1
fi
echo "✅ Directorio local encontrado"

echo ""
echo "🛑 Deteniendo servicios staging..."
ssh "$SERVER" << 'EOF'
pm2 stop osyris-staging-frontend osyris-staging-backend || true
EOF

echo ""
echo "🧹 Limpiando caché y builds antiguos en staging..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current || exit 0
rm -rf .next
rm -rf build
rm -rf node_modules/.cache
rm -rf api-osyris/.next
EOF

echo ""
echo "📤 Sincronizando código local a staging..."
echo "   Excluyendo: node_modules, .git, .next, logs, etc."

rsync -avz --progress \
  --exclude='node_modules/' \
  --exclude='.git/' \
  --exclude='.next/' \
  --exclude='build/' \
  --exclude='logs/' \
  --exclude='*.log' \
  --exclude='.env.local' \
  --exclude='api-osyris/.env' \
  --exclude='package-lock.json' \
  --exclude='npm-debug.log*' \
  --exclude='.DS_Store' \
  "$LOCAL_PATH/" "$SERVER:$STAGING_PATH/"

echo ""
echo "✅ Código sincronizado exitosamente"

echo ""
echo "🧹 Limpiando dependencias para reinstalación limpia..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current
rm -rf node_modules
rm -rf api-osyris/node_modules
npm cache clean --force
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
echo "🔨 Construyendo aplicación con código actualizado..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current

# Build limpio sin caché
NODE_ENV=production npm run build 2>&1 | tee build-staging-clean.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Build falló - verificar errores"
    tail -50 build-staging-clean.log
    exit 1
fi

echo "✅ Build completado exitosamente"
EOF

echo ""
echo "🚀 Reiniciando servicios PM2..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current

# Eliminar procesos antiguos
pm2 delete osyris-staging-frontend osyris-staging-backend || true

# Frontend en puerto 3001
pm2 start node_modules/.bin/next --name "osyris-staging-frontend" -- start -p 3001

# Backend en puerto 5001
cd api-osyris
PORT=5001 NODE_ENV=staging DB_NAME=osyris_staging_db pm2 start src/index.js --name "osyris-staging-backend"
cd ..

pm2 save
EOF

echo ""
echo "⏳ Esperando 15 segundos para que los servicios se inicien..."
sleep 15

echo ""
echo "🔍 Verificando estado de servicios..."
ssh "$SERVER" "pm2 status | grep osyris-staging"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Sincronización Completada"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URLs de Staging:"
echo "  • Frontend: http://116.203.98.142:3001"
echo "  • Backend API: http://116.203.98.142:5001"
echo ""
echo "💡 Staging ahora tiene tu código LOCAL con los cambios de familias"
echo ""

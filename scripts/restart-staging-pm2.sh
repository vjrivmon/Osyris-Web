#!/bin/bash

##############################################################################
# Script: restart-staging-pm2.sh
# Descripción: Reinicia servicios PM2 de staging con configuración correcta
# Autor: Claude Code
# Fecha: 2025-10-25
##############################################################################

SERVER="root@116.203.98.142"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Reiniciando Servicios PM2 Staging"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🛑 Deteniendo servicios antiguos..."
ssh "$SERVER" << 'EOF'
pm2 stop osyris-staging-frontend osyris-staging-backend || true
pm2 delete osyris-staging-frontend osyris-staging-backend || true
EOF

echo ""
echo "🚀 Iniciando servicios con configuración correcta..."
ssh "$SERVER" << 'EOF'
cd /var/www/osyris-staging/current

# Asegurar que existe .env con puerto correcto
echo "PORT=5001" > api-osyris/.env.staging
echo "NODE_ENV=staging" >> api-osyris/.env.staging
echo "DB_NAME=osyris_staging_db" >> api-osyris/.env.staging
echo "DB_USER=osyris_user" >> api-osyris/.env.staging
echo "DB_PASSWORD=osyris_password" >> api-osyris/.env.staging
echo "DB_HOST=localhost" >> api-osyris/.env.staging
echo "DB_PORT=5432" >> api-osyris/.env.staging

# Frontend en puerto 3001
cd /var/www/osyris-staging/current
pm2 start node_modules/.bin/next --name "osyris-staging-frontend" -- start -p 3001

# Backend en puerto 5001
cd /var/www/osyris-staging/current/api-osyris
PORT=5001 NODE_ENV=staging DB_NAME=osyris_staging_db pm2 start src/index.js --name "osyris-staging-backend"

pm2 save
EOF

echo ""
echo "⏳ Esperando 10 segundos..."
sleep 10

echo ""
echo "🔍 Estado de servicios:"
ssh "$SERVER" "pm2 status | grep osyris-staging"

echo ""
echo "✅ Reinicio completado"
echo ""
echo "🌐 URLs de Staging:"
echo "  • Frontend: http://116.203.98.142:3001"
echo "  • Backend API: http://116.203.98.142:5001"

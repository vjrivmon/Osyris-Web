#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📦 Sincronización LOCAL → PRODUCTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e  # Exit on error

SERVER="root@116.203.98.142"
LOCAL_PATH="/home/vicente/RoadToDevOps/osyris/Osyris-Web"
PRODUCTION_PATH="/var/www/osyris/current"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Sincronización LOCAL → PRODUCTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar directorio local
echo "🔍 Verificando directorio local..."
if [ ! -d "$LOCAL_PATH" ]; then
    echo "❌ Error: Directorio local no encontrado"
    exit 1
fi
echo "✅ Directorio local encontrado"
echo ""

# Detener servicios production
echo "🛑 Deteniendo servicios production..."
ssh $SERVER "pm2 stop osyris-frontend osyris-backend"
echo ""

# Limpiar caché y builds
echo "🧹 Limpiando caché y builds antiguos en production..."
ssh $SERVER "cd $PRODUCTION_PATH && rm -rf .next build node_modules/.cache"
echo ""

# Sincronizar código
echo "📤 Sincronizando código local a production..."
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
  "$LOCAL_PATH/" "$SERVER:$PRODUCTION_PATH/"

echo ""
echo "✅ Código sincronizado exitosamente"
echo ""

# Limpiar dependencias
echo "🧹 Limpiando dependencias para reinstalación limpia..."
ssh $SERVER "cd $PRODUCTION_PATH && rm -rf node_modules api-osyris/node_modules && npm cache clean --force"
echo ""

# Instalar dependencias frontend
echo "📦 Instalando dependencias frescas (frontend)..."
ssh $SERVER "cd $PRODUCTION_PATH && npm install --legacy-peer-deps"
echo ""

# Instalar dependencias backend
echo "📦 Instalando dependencias frescas (backend)..."
ssh $SERVER "cd $PRODUCTION_PATH/api-osyris && npm install"
echo ""

# Build
echo "🔨 Construyendo aplicación con código actualizado..."
ssh $SERVER "cd $PRODUCTION_PATH && npm run build"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build exitoso"
else
    echo ""
    echo "❌ Build falló - verificar errores"
    exit 1
fi
echo ""

# Reiniciar servicios
echo "🚀 Reiniciando servicios production..."
ssh $SERVER "pm2 restart osyris-frontend osyris-backend --update-env"
echo ""

# Esperar a que servicios estén listos
echo "⏳ Esperando servicios..."
sleep 10
echo ""

# Verificar estado
echo "✅ Verificando estado de servicios..."
ssh $SERVER "pm2 status | grep osyris"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MIGRACIÓN A PRODUCTION COMPLETADA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URLs de producción:"
echo "   Frontend: http://116.203.98.142:3000"
echo "   Backend:  http://116.203.98.142:5000"
echo ""

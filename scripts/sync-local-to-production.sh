#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📦 Sincronización LOCAL → PRODUCTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NOTA: El build se hace LOCALMENTE para evitar sobrecargar
#       el servidor (4GB RAM sin swap es insuficiente para Next.js build)

set -e  # Exit on error

SERVER="root@116.203.98.142"
LOCAL_PATH="/home/vicente/RoadToDevOps/osyris/Osyris-Web"
PRODUCTION_PATH="/var/www/osyris/current"

# URL de producción (SIN /api al final - el código lo añade)
PRODUCTION_API_URL="https://gruposcoutosyris.es"

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

# ═══════════════════════════════════════════════
# PASO 1: BUILD LOCAL (más seguro y rápido)
# ═══════════════════════════════════════════════
echo "🔨 Construyendo aplicación LOCALMENTE..."
echo "   📋 Usando NEXT_PUBLIC_API_URL=$PRODUCTION_API_URL"
cd "$LOCAL_PATH"
rm -rf .next
NEXT_PUBLIC_API_URL="$PRODUCTION_API_URL" npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build local falló - verificar errores"
    exit 1
fi
echo "✅ Build local exitoso"
echo ""

# ═══════════════════════════════════════════════
# PASO 2: DETENER SERVICIOS EN SERVIDOR
# ═══════════════════════════════════════════════
echo "🛑 Deteniendo servicios production..."
ssh $SERVER "pm2 stop osyris-frontend osyris-backend || true"
echo ""

# ═══════════════════════════════════════════════
# PASO 3: SINCRONIZAR CÓDIGO Y BUILD
# ═══════════════════════════════════════════════
echo "📤 Sincronizando código local a production..."
rsync -avz --progress \
  --exclude='node_modules/' \
  --exclude='.git/' \
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
echo "📤 Sincronizando build (.next)..."
rsync -avz --delete "$LOCAL_PATH/.next/" "$SERVER:$PRODUCTION_PATH/.next/"

echo ""
echo "✅ Código y build sincronizados"
echo ""

# ═══════════════════════════════════════════════
# PASO 4: INSTALAR DEPENDENCIAS EN SERVIDOR
# ═══════════════════════════════════════════════
echo "📦 Verificando dependencias en servidor..."
ssh $SERVER "cd $PRODUCTION_PATH && npm install --legacy-peer-deps --prefer-offline 2>/dev/null || npm install --legacy-peer-deps"
ssh $SERVER "cd $PRODUCTION_PATH/api-osyris && npm install --prefer-offline 2>/dev/null || npm install"
echo ""

# ═══════════════════════════════════════════════
# PASO 5: REINICIAR SERVICIOS
# ═══════════════════════════════════════════════
echo "🚀 Reiniciando servicios production..."
ssh $SERVER "pm2 restart osyris-frontend osyris-backend --update-env"
echo ""

# Esperar a que servicios estén listos
echo "⏳ Esperando servicios (10s)..."
sleep 10
echo ""

# Verificar estado
echo "✅ Verificando estado de servicios..."
ssh $SERVER "pm2 status | grep osyris"
echo ""

# ═══════════════════════════════════════════════
# VERIFICACIÓN FINAL
# ═══════════════════════════════════════════════
echo "🔍 Verificando endpoints..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://gruposcoutosyris.es/ || echo "error")
BACKEND_STATUS=$(curl -s https://gruposcoutosyris.es/api/health | grep -o '"status":"ok"' || echo "error")

echo "   Frontend: $FRONTEND_STATUS"
echo "   Backend: $BACKEND_STATUS"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = '"status":"ok"' ]; then
    echo "✅ DEPLOY A PRODUCTION COMPLETADO EXITOSAMENTE"
else
    echo "⚠️  DEPLOY COMPLETADO CON ADVERTENCIAS - verificar manualmente"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URLs de producción:"
echo "   Frontend: https://gruposcoutosyris.es"
echo "   Backend:  https://gruposcoutosyris.es/api"
echo ""

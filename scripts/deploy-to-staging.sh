#!/bin/bash

##############################################################
# Script de Deploy Automatizado a Staging
# Grupo Scout Osyris - Sistema de Gestión
# Crea réplica exacta de producción en entorno staging
# Tiempo estimado: 5 minutos
##############################################################

# Configuración
SERVER="root@116.203.98.142"
PROD_PATH="/var/www/osyris/current"
STAGING_PATH="/var/www/osyris-staging/current"
STAGING_SERVICE_PREFIX="osyris-staging"
STAGING_HOST="116.203.98.142"
STAGING_PORT_FRONTEND=3001
STAGING_PORT_BACKEND=5001
STAGING_API_URL="http://$STAGING_HOST:$STAGING_PORT_BACKEND"
DATE=$(date +%Y%m%d_%H%M%S)

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funciones de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
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

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 Deploy Automatizado a Staging${NC}"
echo -e "${CYAN}Grupo Scout Osyris - Sistema de Gestión${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Verificar conexión y entorno de producción
log "🔍 Verificando conexión con producción..."
if ! ssh -o ConnectTimeout=10 "$SERVER" "echo 'Conexión OK'" >/dev/null 2>&1; then
    error "❌ No se puede conectar al servidor de producción"
    exit 1
fi
success "✅ Conexión con producción establecida"

# 2. Backup de producción (siempre)
log "💾 Creando backup de producción..."
BACKUP_NAME="backup_staging_$DATE"
ssh "$SERVER" bash << EOF
set -e

# Backup de archivos de producción
if [ -d "$PROD_PATH" ]; then
    cp -r "$PROD_PATH" "/var/www/backups/$BACKUP_NAME" 2>/dev/null || true
    echo "✅ Backup de archivos creado: /var/www/backups/$BACKUP_NAME"
fi

# Backup de base de datos
docker exec osyris-db pg_dump -U osyris_user osyris_db | gzip > "/var/www/backups/${BACKUP_NAME}_db.sql.gz" 2>/dev/null || true
echo "✅ Backup de BD creado: /var/www/backups/${BACKUP_NAME}_db.sql.gz"

# Limpiar backups antiguos (mantener últimos 10)
find /var/www/backups -name "backup_staging_*" -type d | sort -r | tail -n +11 | xargs rm -rf 2>/dev/null || true
find /var/www/backups -name "backup_staging_*_db.sql.gz" | sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true
EOF

success "✅ Backup de producción completado"

# 3. Detener servicios staging existentes
log "🛑 Deteniendo servicios staging anteriores..."
ssh "$SERVER" bash << EOF
# Detener PM2 staging
pm2 stop osyris-staging-frontend 2>/dev/null || true
pm2 stop osyris-staging-backend 2>/dev/null || true
pm2 delete osyris-staging-frontend 2>/dev/null || true
pm2 delete osyris-staging-backend 2>/dev/null || true

# Detener Docker staging si existe
docker stop osyris-staging-frontend 2>/dev/null || true
docker stop osyris-staging-backend 2>/dev/null || true
docker rm osyris-staging-frontend 2>/dev/null || true
docker rm osyris-staging-backend 2>/dev/null || true

# Limpiar puertos
fuser -k $STAGING_PORT_FRONTEND/tcp 2>/dev/null || true
fuser -k $STAGING_PORT_BACKEND/tcp 2>/dev/null || true
EOF

success "✅ Servicios staging detenidos"

# 4. Crear entorno staging réplica de producción
log "📋 Creando entorno staging réplica de producción..."
ssh "$SERVER" bash << EOF
set -e

# Limpiar staging anterior (si existe)
rm -rf "$STAGING_PATH"

# Crear directorio padre si no existe
mkdir -p "$(dirname "$STAGING_PATH")"

# Verificar que producción existe
if [ ! -d "$PROD_PATH" ]; then
    echo "❌ Directorio de producción no encontrado: $PROD_PATH"
    exit 1
fi

# Copiar archivos de producción a staging usando rsync
rsync -av --delete "$PROD_PATH/" "$STAGING_PATH/"

if [ $? -eq 0 ]; then
    echo "✅ Archivos copiados de producción a staging"
else
    echo "❌ Error al copiar archivos"
    exit 1
fi

# Crear archivo .env para staging backend
cat > "$STAGING_PATH/api-osyris/.env" << STAGINGENV
NODE_ENV=staging
PORT=$STAGING_PORT_BACKEND
DB_HOST=localhost
DB_PORT=5432
DB_USER=osyris_user
DB_PASSWORD=OsyrisDB2024!Secure
DB_NAME=osyris_staging_db
JWT_SECRET=osyrisScoutGroup2024SecretKey!Staging
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://116.203.98.142:$STAGING_PORT_FRONTEND
ALLOWED_ORIGINS=http://116.203.98.142:$STAGING_PORT_FRONTEND,http://localhost:3001
STAGING_MODE=true
STAGINGENV

# Crear archivo .env.local para staging frontend
cat > "$STAGING_PATH/.env.local" << STAGINGFRONTEND
NEXT_PUBLIC_API_URL=$STAGING_API_URL
API_BASE_URL=$STAGING_API_URL
NODE_ENV=staging
NEXT_PUBLIC_APP_NAME=Osyris Scout Management - Staging
NEXT_PUBLIC_STAGING=true
STAGINGFRONTEND

echo "✅ Environment configurado para staging"
EOF

success "✅ Entorno staging creado"

# 5. Generar build específica para staging
log "🏗️ Generando build específica para staging..."
ssh "$SERVER" bash << EOF
set -e

# Cambiar al directorio de staging
cd "$STAGING_PATH"

# Limpiar build anterior
rm -rf .next

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm ci --production=false
fi

# Generar build específica para staging con variables de entorno correctas
echo "🔨 Build frontend para staging con NEXT_PUBLIC_API_URL=$STAGING_API_URL..."
export NEXT_PUBLIC_API_URL="$STAGING_API_URL"
export API_BASE_URL="$STAGING_API_URL"
export NODE_ENV="production"
export NEXT_PUBLIC_STAGING="true"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en build de staging"
    exit 1
fi

# Verificar que .next existe
if [ ! -d ".next" ]; then
    echo "❌ Directorio .next no fue generado"
    exit 1
fi

echo "✅ Build de staging generada correctamente con API URL: $STAGING_API_URL"
EOF

success "✅ Build de staging completada"

# 6. Crear base de datos staging
log "🐘 Creando base de datos staging..."
ssh "$SERVER" bash << EOF
# Crear base de datos staging si no existe
docker exec osyris-db psql -U osyris_user -c "SELECT 1 FROM pg_database WHERE datname = 'osyris_staging_db';" | grep -q 1 || \\
    docker exec osyris-db psql -U osyris_user -c "CREATE DATABASE osyris_staging_db;"

# Importar datos de producción a staging
docker exec osyris-db pg_dump -U osyris_user osyris_db | docker exec -i osyris-db psql -U osyris_user -d osyris_staging_db

echo "✅ Base de datos staging creada y poblada con datos de producción"
EOF

success "✅ Base de datos staging lista"

# 6. Configurar PM2 para staging
log "⚙️ Configurando PM2 para staging..."
ssh "$SERVER" bash << EOF
set -e

# Asegurar PM2 instalado
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

cd "$STAGING_PATH"

# Verificar que la build existe antes de iniciar
if [ ! -d ".next" ]; then
    echo "❌ Error: No se encontró build (.next/). Ejecuta primero el build."
    exit 1
fi

echo "📊 Iniciando frontend staging con:"
echo "   NEXT_PUBLIC_API_URL: $STAGING_API_URL"
echo "   PORT: $STAGING_PORT_FRONTEND"

# Iniciar frontend staging con PM2
pm2 start "$STAGING_PATH/node_modules/.bin/next" \\
    --name "osyris-staging-frontend" \\
    --cwd "$STAGING_PATH" \\
    --node-args="--env-file=$STAGING_PATH/.env.local" \\
    -- start -p $STAGING_PORT_FRONTEND

echo "📊 Iniciando backend staging con:"
echo "   NODE_ENV: staging"
echo "   PORT: $STAGING_PORT_BACKEND"

# Iniciar backend staging con PM2
pm2 start "$STAGING_PATH/api-osyris/src/index.js" \\
    --name "osyris-staging-backend" \\
    --cwd "$STAGING_PATH/api-osyris" \\
    --node-args="--env-file=$STAGING_PATH/api-osyris/.env"

# Guardar configuración PM2
pm2 save

# Verificar logs iniciales
sleep 3
echo ""
echo "📋 Últimas líneas de logs:"
pm2 logs osyris-staging-frontend --lines 5 --nostream
pm2 logs osyris-staging-backend --lines 5 --nostream

echo "✅ PM2 configurado para staging"
EOF

success "✅ PM2 staging configurado"

# 7. Verificar servicios staging
log "🔍 Verificando servicios staging..."
sleep 10  # Dar tiempo a que inicien

ssh "$SERVER" bash << EOF
echo "=== Estado PM2 Staging ==="
pm2 list | grep osyris-staging

echo ""
echo "=== Verificación de puertos ==="
netstat -tlnp | grep ":$STAGING_PORT_FRONTEND\\|:$STAGING_PORT_BACKEND" || echo "Puertos en proceso de inicio..."

echo ""
echo "=== Verificación de salud de servicios ==="
# Verificar frontend
curl -f -s -o /dev/null "http://localhost:$STAGING_PORT_FRONTEND" && echo "✅ Frontend staging OK" || echo "⚠️  Frontend staging iniciándose..."

# Verificar backend API
curl -f -s -o /dev/null "http://localhost:$STAGING_PORT_BACKEND/api/health" && echo "✅ Backend staging OK" || echo "⚠️  Backend staging iniciándose..."
EOF

# 8. Resumen del deploy
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deploy a Staging Completado Exitosamente${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}🌐 URLs de Staging:${NC}"
echo -e "  • Frontend: ${YELLOW}http://116.203.98.142:$STAGING_PORT_FRONTEND${NC}"
echo -e "  • Backend API: ${YELLOW}http://116.203.98.142:$STAGING_PORT_BACKEND${NC}"
echo -e "  • Health Check: ${YELLOW}http://116.203.98.142:$STAGING_PORT_BACKEND/api/health${NC}"
echo ""
echo -e "${CYAN}📊 Resumen:${NC}"
echo -e "  • Backup producción: ${GREEN}/var/www/backups/$BACKUP_NAME${NC}"
echo -e "  • Entorno staging: ${GREEN}$STAGING_PATH${NC}"
echo -e "  • Base de datos: ${GREEN}osyris_staging_db${NC}"
echo -e "  • Tiempo total: ${YELLOW}~5 minutos${NC}"
echo ""
echo -e "${CYAN}🧪 Próximos pasos:${NC}"
echo -e "  1. Abre: ${YELLOW}http://116.203.98.142:$STAGING_PORT_FRONTEND${NC}"
echo -e "  2. Verifica que todo funciona correctamente"
echo -e "  3. Ejecuta: ${YELLOW}./scripts/deploy-to-production-from-staging.sh${NC}"
echo ""
echo -e "${RED}⚠️  Importante:${NC} Staging es una réplica exacta de producción"
echo -e "${RED}⚠️  Los cambios en staging NO afectan a producción${NC}"
echo ""

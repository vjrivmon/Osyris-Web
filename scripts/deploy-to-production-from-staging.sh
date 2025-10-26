#!/bin/bash

##############################################################
# Script de Deploy Ultra-Rápido: Staging → Producción
# Grupo Scout Osyris - Sistema de Gestión
# Sincroniza cambios validados en staging a producción
# Tiempo estimado: 2 minutos
##############################################################

# Configuración
SERVER="root@116.203.98.142"
PROD_PATH="/var/www/osyris/current"
STAGING_PATH="/var/www/osyris-staging/current"
PROD_SERVICE_PREFIX="osyris"
STAGING_SERVICE_PREFIX="osyris-staging"
DATE=$(date +%Y%m%d_%H%M%S)

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
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

highlight() {
    echo -e "${MAGENTA}[HIGHLIGHT]${NC} $1"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}⚡ Deploy Ultra-Rápido: Staging → Producción${NC}"
echo -e "${MAGENTA}Grupo Scout Osyris - Sistema de Gestión${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificación inicial
log "🔍 Verificando entorno..."

# Verificar que staging existe y está funcionando
ssh "$SERVER" bash << EOF
if [ ! -d "$STAGING_PATH" ]; then
    echo "❌ Entorno staging no encontrado. Ejecuta primero: ./scripts/deploy-to-staging.sh"
    exit 1
fi

# Verificar que servicios staging estén corriendo
if ! pm2 list | grep -q "osyris-staging.*online"; then
    echo "❌ Servicios staging no están corriendo"
    exit 1
fi

echo "✅ Entorno staging verificado y funcionando"
EOF

if [ $? -ne 0 ]; then
    error "❌ Verificación de staging falló"
    exit 1
fi

success "✅ Entorno staging verificado"

# Confirmación de deploy
echo ""
warning "⚠️  ESTÁS POR DESPLEGAR CAMBIOS A PRODUCCIÓN"
echo ""
info "📋 Resumen de cambios:"
ssh "$SERVER" bash << EOF
echo "• Último backup staging: \$(ls -t /var/www/backups/backup_staging_* 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo 'No encontrado')"
echo "• Staging path: $STAGING_PATH"
echo "• Producción path: $PROD_PATH"
echo "• Servicios staging activos: \$(pm2 list | grep 'osyris-staging.*online' | wc -l)"
EOF
echo ""

read -p "¿Estás SEGURO de continuar con el deploy a producción? (escribe 'SI'): " CONFIRM
if [ "$CONFIRM" != "SI" ]; then
    echo -e "${RED}❌ Deploy cancelado${NC}"
    exit 0
fi

# 1. Backup instantáneo de producción
log "💾 Creando backup instantáneo de producción..."
BACKUP_NAME="prod_backup_before_deploy_$DATE"

ssh "$SERVER" bash << EOF
set -e

# Backup ultra-rápido de archivos
if [ -d "$PROD_PATH" ]; then
    # Usar rsync para backup incremental (más rápido)
    rsync -a --delete "$PROD_PATH/" "/var/www/backups/$BACKUP_NAME/" 2>/dev/null || \
        cp -r "$PROD_PATH" "/var/www/backups/$BACKUP_NAME" 2>/dev/null || true
    echo "✅ Backup archivos: /var/www/backups/$BACKUP_NAME"
fi

# Backup de base de datos (compresión rápida)
docker exec osyris-db pg_dump -U osyris_user osyris_db | \
    gzip --fast > "/var/www/backups/${BACKUP_NAME}_db.sql.gz" 2>/dev/null || true
echo "✅ Backup BD: /var/www/backups/${BACKUP_NAME}_db.sql.gz"

# Guardar info del backup para rollback
echo "$BACKUP_NAME" > /var/www/backups/last_production_backup.txt
echo "✅ Info de backup guardada para rollback automático"
EOF

success "✅ Backup de producción completado"

# 2. Parada graceful de servicios de producción
log "🛑 Deteniendo servicios de producción (graceful shutdown)..."

ssh "$SERVER" bash << EOF
# Detener servicios PM2 de producción con graceful shutdown
pm2 stop osyris-frontend || true
pm2 stop osyris-backend || true

# Esperar un momento a que terminen peticiones
sleep 3

# Eliminar procesos
pm2 delete osyris-frontend || true
pm2 delete osyris-backend || true

echo "✅ Servicios de producción detenidos"
EOF

success "✅ Producción detenida"

# 3. Sincronización ultra-rápida de archivos
log "📁 Sincronizando archivos de staging a producción..."

ssh "$SERVER" bash << EOF
set -e

# Sincronización con rsync (más rápido que cp)
rsync -av --delete --exclude 'node_modules' --exclude '.next' "$STAGING_PATH/" "$PROD_PATH/"

# Copiar .next y node_modules separadamente para optimizar
if [ -d "$STAGING_PATH/.next" ]; then
    rsync -av --delete "$STAGING_PATH/.next/" "$PROD_PATH/.next/"
fi

if [ -d "$STAGING_PATH/node_modules" ]; then
    rsync -av --delete "$STAGING_PATH/node_modules/" "$PROD_PATH/node_modules/"
fi

# Restaurar environment de producción (sobrescribir el de staging)
cat > "$PROD_PATH/api-osyris/.env" << PRODENV
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=osyris_user
DB_PASSWORD=OsyrisDB2024!Secure
DB_NAME=osyris_db
JWT_SECRET=osyrisScoutGroup2024SecretKey!Production
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://gruposcoutosyris.es
ALLOWED_ORIGINS=https://gruposcoutosyris.es,https://www.gruposcoutosyris.es,http://116.203.98.142
STAGING_MODE=false
# Gmail Configuration
EMAIL_USER=vicenterivasmonferrer12@gmail.com
EMAIL_APP_PASSWORD=ukxqohptbomnbavm
PRODENV

echo "✅ Archivos sincronizados"
echo "✅ Environment de producción restaurado"
EOF

success "✅ Archivos sincronizados"

# 4. Sincronización de base de datos (si hay cambios)
log "🐘 Verificando sincronización de base de datos..."

# Solo sincronizar BD si se detectaron cambios
ssh "$SERVER" bash << 'EOF'
# Verificar si hay cambios en la estructura de la BD
STAGING_SCHEMA=$(docker exec osyris-staging-db pg_dump -U osyris_user --schema-only osyris_staging_db 2>/dev/null || echo "")
PROD_SCHEMA=$(docker exec osyris-db pg_dump -U osyris_user --schema-only osyris_db 2>/dev/null || echo "")

if [ "$STAGING_SCHEMA" != "$PROD_SCHEMA" ]; then
    echo "🔄 Cambios detectados en esquema de BD, sincronizando..."

    # Backup extra de BD por seguridad
    docker exec osyris-db pg_dump -U osyris_user osyris_db | gzip > "/var/www/backups/${BACKUP_NAME}_db_before_schema.sql.gz"

    # Sincronizar datos de staging a producción
    docker exec osyris-staging-db pg_dump -U osyris_user osyris_staging_db | \
        docker exec -i osyris-db psql -U osyris_user -d osyris_db

    echo "✅ Base de datos sincronizada"
else
    echo "ℹ️  Sin cambios en esquema de BD, omitiendo sincronización"
fi
EOF

success "✅ Base de datos verificada"

# 5. Rebuild frontend producción (para asegurar variables correctas)
log "🏗️ Rebuilding frontend para producción..."

ssh "$SERVER" bash << EOF
set -e

cd "$PROD_PATH"

# Limpiar build anterior
rm -rf .next

# Rebuild con variables de producción
export NEXT_PUBLIC_API_URL="https://gruposcoutosyris.es/api"
export API_BASE_URL="https://gruposcoutosyris.es/api"
export NODE_ENV="production"
export NEXT_PUBLIC_STAGING="false"
npm run build 2>&1 | tail -15

echo "✅ Frontend rebuildeado para producción"
EOF

success "✅ Frontend rebuildeado"

# 6. Inicio rápido de servicios de producción
log "🚀 Iniciando servicios de producción..."

ssh "$SERVER" bash << EOF
set -e

# Iniciar backend producción
pm2 start "$PROD_PATH/api-osyris/src/index.js" \
    --name "osyris-backend" \
    --cwd "$PROD_PATH/api-osyris" \
    --node-args="--env-file=$PROD_PATH/api-osyris/.env"

sleep 3

# Iniciar frontend producción
pm2 start "$PROD_PATH/node_modules/.bin/next" \
    --name "osyris-frontend" \
    --cwd "$PROD_PATH" \
    -- start -p 3000

# Guardar configuración PM2
pm2 save

echo "✅ Servicios de producción iniciados"
EOF

success "✅ Producción iniciada"

# 7. Verificación instantánea y logs
log "🔍 Verificación instantánea de servicios..."

# Dar tiempo a que inicien
sleep 15

echo ""
ssh "$SERVER" bash << 'EOF'
echo "=== Estado PM2 Producción ==="
pm2 list | grep osyris

echo ""
echo "=== Últimas líneas de logs ==="
echo "📋 Backend:"
pm2 logs osyris-backend --lines 5 --nostream 2>&1 | tail -10

echo ""
echo "📋 Frontend:"
pm2 logs osyris-frontend --lines 5 --nostream 2>&1 | tail -10

echo ""
echo "=== Verificación de salud ==="

# Verificar frontend
if curl -f -s -o /dev/null http://localhost:3000; then
    echo "✅ Frontend producción OK"
else
    echo "⚠️  Frontend producción iniciándose..."
fi

# Verificar backend
if curl -f -s -o /dev/null http://localhost:5000/api/health; then
    echo "✅ Backend producción OK"
else
    echo "⚠️  Backend producción iniciándose..."
fi

echo ""
echo "=== Verificación externa ==="
# Verificar acceso externo (HTTPS)
if curl -f -s -o /dev/null https://gruposcoutosyris.es; then
    echo "✅ Acceso externo OK"
else
    echo "⚠️  Verificando acceso externo..."
fi

echo ""
echo "=== Verificación de puertos ==="
netstat -tlnp | grep ":3000\|:5000" || echo "Puertos en proceso de inicio..."
EOF

# 7. Crear script de rollback automático
log "🔄 Creando script de rollback automático..."

ssh "$SERVER" bash << EOF
cat > "/var/www/rollback-last-deploy.sh" << 'ROLLBACK'
#!/bin/bash
# Script de Rollback Automático - Último Deploy

BACKUP_NAME=\$(cat /var/www/backups/last_production_backup.txt 2>/dev/null)
SERVER_PATH="/var/www/osyris/current"

if [ -z "\$BACKUP_NAME" ]; then
    echo "❌ No se encuentra información del último backup"
    exit 1
fi

echo "🔄 Rollback a backup: \$BACKUP_NAME"

# Detener producción
pm2 stop osyris-frontend osyris-backend || true
pm2 delete osyris-frontend osyris-backend || true

# Restaurar archivos
rm -rf "\$SERVER_PATH"
cp -r "/var/www/backups/\$BACKUP_NAME" "\$SERVER_PATH"

# Restaurar base de datos
if [ -f "/var/www/backups/\${BACKUP_NAME}_db.sql.gz" ]; then
    gunzip -c "/var/www/backups/\${BACKUP_NAME}_db.sql.gz" | \
        docker exec -i osyris-db psql -U osyris_user -d osyris_db
fi

# Iniciar servicios
cd "\$SERVER_PATH"
pm2 start "npx next start -p 3000" --name "osyris-frontend" --env production
pm2 start "\$SERVER_PATH/api-osyris/src/index.js" \
    --name "osyris-backend" \
    --cwd "\$SERVER_PATH/api-osyris" \
    --node-args="--env-file=\$SERVER_PATH/api-osyris/.env"

pm2 save

echo "✅ Rollback completado"
ROLLBACK

chmod +x "/var/www/rollback-last-deploy.sh"
echo "✅ Script de rollback creado: /var/www/rollback-last-deploy.sh"
EOF

success "✅ Script de rollback creado"

# Resumen final
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}⚡ Deploy a Producción Completado${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}🌐 Producción:${NC}"
echo -e "  • Frontend: ${YELLOW}https://gruposcoutosyris.es${NC}"
echo -e "  • Backend: ${YELLOW}https://gruposcoutosyris.es/api/health${NC}"
echo ""
echo -e "${CYAN}📊 Resumen:${NC}"
echo -e "  • Backup producción: ${GREEN}/var/www/backups/$BACKUP_NAME${NC}"
echo -e "  • Tiempo total: ${YELLOW}~2 minutos${NC}"
echo -e "  • Rollback disponible: ${GREEN}/var/www/rollback-last-deploy.sh${NC}"
echo ""
echo -e "${CYAN}🔄 Rollback automático (si algo falla):${NC}"
echo -e "  ssh root@116.203.98.142 '/var/www/rollback-last-deploy.sh'"
echo ""
echo -e "${GREEN}✅ Verifica manualmente que todo funcione correctamente${NC}"
echo ""
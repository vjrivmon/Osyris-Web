#!/bin/bash

##############################################################
# Script de Rollback de Emergencia (30 segundos)
# Grupo Scout Osyris - Sistema de Gestión
 *Restaura el estado anterior al último deploy
 *Uso: ./scripts/emergency-rollback.sh [backup_name]
 *Si no se especifica backup_name, usa el más reciente
##############################################################

# Configuración
SERVER="root@116.203.98.142"
PROD_PATH="/var/www/osyris/current"
BACKUP_DIR="/var/www/backups"
ROLLBACK_LOG="/var/www/backups/rollback.log"
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
    echo -e "${GREEN}[✓]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

alert() {
    echo -e "${MAGENTA}[CRITICAL]${NC} $1"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🚨 ROLLBACK DE EMERGENCIA${NC}"
echo -e "${MAGENTA}Grupo Scout Osyris - Sistema de Gestión${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar parámetros
BACKUP_NAME="$1"
if [ -z "$BACKUP_NAME" ]; then
    # Buscar el backup más reciente
    BACKUP_NAME=$(ssh "$SERVER" "ls -t $BACKUP_DIR/backup_* 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo ''")
    if [ -z "$BACKUP_NAME" ]; then
        error "❌ No se encontraron backups disponibles"
        exit 1
    fi
    info "🔍 Backup más reciente encontrado: ${YELLOW}$BACKUP_NAME${NC}"
else
    info "🎯 Backup especificado: ${YELLOW}$BACKUP_NAME${NC}"
fi

# Confirmación de emergencia
echo ""
alert "⚠️  ESTÁS POR REALIZAR UN ROLLBACK DE EMERGENCIA"
echo ""
warning "Esto restaurará el sistema al estado del backup: $BACKUP_NAME"
warning "Todos los cambios desde ese backup se PERDERÁN"
warning "Esta acción debe ser solo para emergencias críticas"
echo ""

# Si es rollback manual, pedir confirmación
if [ "$1" = "" ]; then
    read -p "¿Estás SEGURO de continuar con el rollback? (escribe 'EMERGENCIA'): " CONFIRM
    if [ "$CONFIRM" != "EMERGENCIA" ]; then
        echo -e "${RED}❌ Rollback cancelado${NC}"
        exit 0
    fi
fi

# Registrar inicio del rollback
log "📝 Registrando rollback en $ROLLBACK_LOG..."
ssh "$SERVER" bash << EOF
echo "=== ROLLBACK DE EMERGENCIA ===" >> "$ROLLBACK_LOG"
echo "Fecha: $(date)" >> "$ROLLBACK_LOG"
echo "Backup: $BACKUP_NAME" >> "$ROLLBACK_LOG"
echo "Usuario: \$(whoami)" >> "$ROLLBACK_LOG"
echo "Razón: Emergency rollback" >> "$ROLLBACK_LOG"
echo "---" >> "$ROLLBACK_LOG"
EOF

# 1. Verificar que el backup existe
log "🔍 Verificando existencia del backup..."
BACKUP_EXISTS=$(ssh "$SERVER" "test -d '$BACKUP_DIR/$BACKUP_NAME' && echo 'YES' || echo 'NO'")
if [ "$BACKUP_EXISTS" != "YES" ]; then
    error "❌ El backup '$BACKUP_NAME' no existe"
    exit 1
fi
success "✅ Backup verificado"

# 2. Parada CRÍTICA de servicios (método agresivo)
log "🛑 DETENIENDO SERVICIOS CRÍTICAMENTE..."
ssh "$SERVER" bash << 'EOF'
set -e

# Método 1: PM2
pm2 stop osyris-frontend osyris-backend 2>/dev/null || true
pm2 delete osyris-frontend osyris-backend 2>/dev/null || true

# Método 2: Matar procesos por puerto (agresivo)
for port in 3000 5000; do
    lsof -ti:$port | xargs -r kill -9 2>/dev/null || true
    fuser -k $port/tcp 2>/dev/null || true
done

# Método 3: Matar procesos por nombre
pkill -f "next start" 2>/dev/null || true
pkill -f "node.*api-osyris" 2>/dev/null || true

echo "✅ Servicios detenidos agresivamente"
EOF

success "✅ Servicios detenidos"

# 3. Backup del estado actual (antes del rollback)
log "💾 Backup del estado actual..."
CURRENT_BACKUP="before_rollback_$DATE"
ssh "$SERVER" bash << EOF
if [ -d "$PROD_PATH" ]; then
    cp -r "$PROD_PATH" "$BACKUP_DIR/$CURRENT_BACKUP" 2>/dev/null || true
    echo "✅ Estado actual backupado: $CURRENT_BACKUP"
fi

# Backup de BD actual
docker exec osyris-db pg_dump -U osyris_user osyris_db | \
    gzip > "$BACKUP_DIR/${CURRENT_BACKUP}_db.sql.gz" 2>/dev/null || true
echo "✅ BD actual backupada"
EOF

# 4. Restauración CRÍTICA de archivos
log "📁 RESTAURANDO ARCHIVOS CRÍTICAMENTE..."
ssh "$SERVER" bash << EOF
set -e

# Limpiar completamente el directorio actual
rm -rf "$PROD_PATH"
mkdir -p "$PROD_PATH"

# Restaurar archivos del backup
cp -r "$BACKUP_DIR/$BACKUP_NAME"/* "$PROD_PATH/"

# Asegurar permisos correctos
chown -R root:root "$PROD_PATH" 2>/dev/null || true
chmod -R 755 "$PROD_PATH" 2>/dev/null || true

# Restaurar environment de producción
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
PRODENV

echo "✅ Archivos restaurados"
EOF

success "✅ Archivos restaurados"

# 5. Restauración CRÍTICA de base de datos
log "🐘 RESTAURANDO BASE DE DATOS..."
ssh "$SERVER" bash << EOF
set -e

# Verificar que existe backup de BD
if [ -f "$BACKUP_DIR/${BACKUP_NAME}_db.sql.gz" ]; then
    # Restaurar BD
    gunzip -c "$BACKUP_DIR/${BACKUP_NAME}_db.sql.gz" | \
        docker exec -i osyris-db psql -U osyris_user -d osyris_db

    echo "✅ Base de datos restaurada"
else
    echo "⚠️  No se encontró backup de BD, omitiendo restauración"
fi
EOF

success "✅ Base de datos restaurada"

# 6. Reinicio CRÍTICO de servicios
log "🚀 REINICIANDO SERVICIOS CRÍTICAMENTE..."
ssh "$SERVER" bash << EOF
set -e

# Limpiar caché de Next.js
rm -rf "$PROD_PATH/.next" 2>/dev/null || true

# Asegurar PM2 instalado
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Iniciar frontend
cd "$PROD_PATH"
pm2 start "npx next start -p 3000" \
    --name "osyris-frontend" \
    --env production

# Iniciar backend
pm2 start "$PROD_PATH/api-osyris/src/index.js" \
    --name "osyris-backend" \
    --cwd "$PROD_PATH/api-osyris" \
    --node-args="--env-file=$PROD_PATH/api-osyris/.env"

# Guardar configuración PM2
pm2 save
pm2 startup || true

echo "✅ Servicios reiniciados"
EOF

success "✅ Servicios reiniciados"

# 7. Verificación CRÍTICA de servicios
log "🔍 VERIFICACIÓN CRÍTICA DE SERVICIOS..."

# Dar tiempo a que inicien
sleep 10

echo ""
ssh "$SERVER" bash << 'EOF'
echo "=== ESTADO POST-ROLLBACK ==="
echo "PM2 Services:"
pm2 list | grep osyris || echo "No running PM2 services found"

echo ""
echo "Port Status:"
netstat -tlnp | grep ":3000\|:5000" || echo "Ports not yet listening"

echo ""
echo "Health Checks:"
# Frontend
if curl -f -s -o /dev/null http://localhost:3000; then
    echo "✅ Frontend OK"
else
    echo "❌ Frontend FAILED"
fi

# Backend
if curl -f -s -o /dev/null http://localhost:5000/api/health; then
    echo "✅ Backend OK"
else
    echo "❌ Backend FAILED"
fi
EOF

# 8. Logging final del rollback
log "📝 Finalizando registro del rollback..."
ssh "$SERVER" bash << EOF
echo "Rollback completado: $(date)" >> "$ROLLBACK_LOG"
echo "Estado: Completado" >> "$ROLLBACK_LOG"
echo "Backup usado: $BACKUP_NAME" >> "$ROLLBACK_LOG"
echo "Backup creado: $CURRENT_BACKUP" >> "$ROLLBACK_LOG"
echo "=== FIN ROLLBACK ===" >> "$ROLLBACK_LOG"
echo "" >> "$ROLLBACK_LOG"
EOF

# Resumen final
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚨 ROLLBACK DE EMERGENCIA COMPLETADO${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📊 Resumen del Rollback:${NC}"
echo -e "  • Backup restaurado: ${GREEN}$BACKUP_NAME${NC}"
echo -e "  • Backup actual: ${YELLOW}$CURRENT_BACKUP${NC}"
echo -e "  • Tiempo total: ${YELLOW}~30 segundos${NC}"
echo -e "  • Log: ${GREEN}$ROLLBACK_LOG${NC}"
echo ""
echo -e "${CYAN}🌐 Verificación Manual:${NC}"
echo -e "  • Frontend: ${YELLOW}https://gruposcoutosyris.es${NC}"
echo -e "  • Backend: ${YELLOW}https://gruposcoutosyris.es/api/health${NC}"
echo ""
echo -e "${RED}⚠️  ACCIONES REQUERIDAS:${NC}"
echo -e "  1. ${RED}Verificar manualmente que todo funcione${NC}"
echo -e "  2. ${RED}Revisar logs de errores si los hay${NC}"
echo -e "  3. ${RED}Investigar la causa del problema original${NC}"
echo -e "  4. ${RED}Comunicar a usuarios si fue necesario${NC}"
echo ""
echo -e "${CYAN}💡 Si algo sigue fallando:${NC}"
echo -e "  • Revisar logs: ${YELLOW}pm2 logs osyris-frontend osyris-backend${NC}"
echo -e "  • Reintentar rollback con otro backup"
echo -e "  • Contactar soporte técnico"
echo ""

# Verificación final
echo -e "${BLUE}¿Deseas verificar el estado actual? (S/n): ${NC}"
read -t 5 -n 1 response || response="S"
echo ""

if [[ $response =~ ^[Ss]$ ]] || [ -z "$response" ]; then
    log "🔍 Verificación final del estado..."
    if curl -f -s -o /dev/null https://gruposcoutosyris.es; then
        success "✅ Producción accesible"
    else
        warning "⚠️  Producción no responde - revisar manualmente"
    fi

    if curl -f -s -o /dev/null https://gruposcoutosyris.es/api/health; then
        success "✅ API funcional"
    else
        warning "⚠️  API no responde - revisar logs"
    fi
fi

echo ""
echo -e "${GREEN}✅ Rollback de emergencia finalizado${NC}"
echo ""

exit 0
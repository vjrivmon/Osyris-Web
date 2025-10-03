#!/bin/bash

################################################################################
# Sistema de Backup Automatizado para Osyris Scout
# Para: Osyris Scout Management System
# Autor: Vicente Rivas Monferrer
# Descripción: Backup completo de base de datos, uploads y configuración
################################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
APP_DIR="${APP_DIR:-$HOME/osyris-production}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="osyris_backup_${TIMESTAMP}"

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
clear
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║       Osyris Scout - Sistema de Backup              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Backup: $BACKUP_NAME"
echo ""

# Crear directorio de backup
log_info "Creando directorio de backup..."
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
cd "$BACKUP_DIR/$BACKUP_NAME"
log_success "Directorio creado: $BACKUP_DIR/$BACKUP_NAME"

# 1. Backup de Base de Datos PostgreSQL
log_info "Realizando backup de base de datos..."
if docker ps | grep -q osyris-db; then
    docker exec osyris-db pg_dump -U osyris_user osyris_db | gzip > database.sql.gz
    DB_SIZE=$(du -h database.sql.gz | cut -f1)
    log_success "Base de datos respaldada: $DB_SIZE"
else
    log_warning "Contenedor de base de datos no encontrado. Saltando..."
fi

# 2. Backup de Uploads
log_info "Realizando backup de archivos uploads..."
if [ -d "$APP_DIR/api-osyris/uploads" ]; then
    tar -czf uploads.tar.gz -C "$APP_DIR/api-osyris" uploads
    UPLOADS_SIZE=$(du -h uploads.tar.gz | cut -f1)
    log_success "Uploads respaldados: $UPLOADS_SIZE"
else
    log_warning "Directorio uploads no encontrado. Saltando..."
fi

# 3. Backup de Configuración
log_info "Realizando backup de configuración..."
mkdir -p config

# Variables de entorno
if [ -f "$APP_DIR/.env.production" ]; then
    cp "$APP_DIR/.env.production" config/
    log_success "Variables de entorno respaldadas"
fi

# Nginx config
if [ -f "/etc/nginx/sites-available/osyris" ]; then
    sudo cp /etc/nginx/sites-available/osyris config/nginx-osyris.conf
    log_success "Configuración Nginx respaldada"
fi

# Docker Compose
if [ -f "$APP_DIR/docker-compose.prod.yml" ]; then
    cp "$APP_DIR/docker-compose.prod.yml" config/
    log_success "Docker Compose respaldado"
fi

# Comprimir configuración
if [ -d "config" ] && [ "$(ls -A config)" ]; then
    tar -czf config.tar.gz config
    rm -rf config
    CONFIG_SIZE=$(du -h config.tar.gz | cut -f1)
    log_success "Configuración respaldada: $CONFIG_SIZE"
fi

# 4. Backup de Logs (últimos 7 días)
log_info "Realizando backup de logs recientes..."
if [ -d "$APP_DIR/api-osyris/logs" ]; then
    find "$APP_DIR/api-osyris/logs" -name "*.log" -mtime -7 -exec tar -czf logs.tar.gz {} +
    if [ -f "logs.tar.gz" ]; then
        LOGS_SIZE=$(du -h logs.tar.gz | cut -f1)
        log_success "Logs respaldados: $LOGS_SIZE"
    fi
fi

# 5. Crear manifiesto del backup
log_info "Creando manifiesto del backup..."
cat > manifest.txt << EOF
╔══════════════════════════════════════════════════════╗
║           Osyris Scout - Manifiesto de Backup       ║
╚══════════════════════════════════════════════════════╝

Fecha: $(date '+%Y-%m-%d %H:%M:%S')
Servidor: $(hostname)
Usuario: $USER

ARCHIVOS INCLUIDOS:
$(ls -lh | grep -v ^d | grep -v manifest.txt | awk '{print "  - " $9 " (" $5 ")"}')

INFORMACIÓN DEL SISTEMA:
  - Versión Docker: $(docker --version 2>/dev/null || echo "N/A")
  - Contenedores activos: $(docker ps --format '{{.Names}}' 2>/dev/null | tr '\n' ', ' || echo "N/A")
  - Espacio en disco: $(df -h / | tail -1 | awk '{print $4 " disponible de " $2}')

CHECKSUMS:
$(sha256sum * 2>/dev/null | grep -v manifest.txt)

Para restaurar este backup:
  1. Copia el directorio completo al servidor
  2. Ejecuta: ~/restore-backup.sh $BACKUP_NAME

EOF
log_success "Manifiesto creado"

# 6. Calcular tamaño total del backup
TOTAL_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)

# 7. Crear snapshot comprimido completo (opcional)
log_info "Creando snapshot completo..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
SNAPSHOT_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
log_success "Snapshot creado: ${BACKUP_NAME}.tar.gz ($SNAPSHOT_SIZE)"

# 8. Limpiar backups antiguos
log_info "Limpiando backups antiguos (>$RETENTION_DAYS días)..."
DELETED_COUNT=0
find "$BACKUP_DIR" -name "osyris_backup_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true
find "$BACKUP_DIR" -name "osyris_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -print -exec rm -f {} \; 2>/dev/null | while read line; do
    ((DELETED_COUNT++))
done

if [ $DELETED_COUNT -gt 0 ]; then
    log_success "Eliminados $DELETED_COUNT backups antiguos"
else
    log_info "No hay backups antiguos para eliminar"
fi

# 9. Verificar integridad del backup
log_info "Verificando integridad del backup..."
if tar -tzf "${BACKUP_NAME}.tar.gz" > /dev/null 2>&1; then
    log_success "Backup verificado correctamente"
else
    log_error "Error en la verificación del backup"
    exit 1
fi

# Resumen final
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✅ Backup Completado ✅                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Resumen del Backup:"
echo "  📁 Directorio: $BACKUP_DIR/$BACKUP_NAME"
echo "  📦 Snapshot: ${BACKUP_NAME}.tar.gz"
echo "  💾 Tamaño descomprimido: $TOTAL_SIZE"
echo "  🗜️  Tamaño comprimido: $SNAPSHOT_SIZE"
echo "  🗓️  Retención: $RETENTION_DAYS días"
echo ""
echo "  Archivos incluidos:"
[ -f "$BACKUP_DIR/$BACKUP_NAME/database.sql.gz" ] && echo "    ✅ Base de datos"
[ -f "$BACKUP_DIR/$BACKUP_NAME/uploads.tar.gz" ] && echo "    ✅ Archivos uploads"
[ -f "$BACKUP_DIR/$BACKUP_NAME/config.tar.gz" ] && echo "    ✅ Configuración"
[ -f "$BACKUP_DIR/$BACKUP_NAME/logs.tar.gz" ] && echo "    ✅ Logs recientes"
echo ""
log_info "Backups disponibles:"
ls -lht "$BACKUP_DIR" | grep osyris_backup_ | head -5 | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
log_success "Backup completado exitosamente"
echo ""
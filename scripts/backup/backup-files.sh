#!/bin/bash

###############################################################################
# 📁 BACKUP AUTOMÁTICO DE ARCHIVOS - OSYRIS
###############################################################################
# Descripción: Backup diario de uploads y configuraciones
# Uso: ./backup-files.sh
# Cronjob: 0 3 * * * /path/to/backup-files.sh
###############################################################################

set -e  # Salir si hay errores

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

BACKUP_DIR="/var/backups/osyris/files"
RETENTION_COUNT=2  # Mantener solo los 2 últimos backups
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="osyris_files_${DATE}.tar.gz"

# Directorios a respaldar
APP_DIR="/var/www/osyris/current"
UPLOADS_DIR="${APP_DIR}/uploads"
ENV_FILE="${APP_DIR}/api-osyris/.env"
PM2_CONFIG="${HOME}/.pm2"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCIONES
# ============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# ============================================================================
# VERIFICACIONES PREVIAS
# ============================================================================

log_info "📁 Iniciando backup de archivos..."

# Verificar que el directorio de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    log_info "📁 Creando directorio de backups: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Verificar que el directorio de la app existe
if [ ! -d "$APP_DIR" ]; then
    log_error "❌ Directorio de la aplicación no encontrado: $APP_DIR"
    exit 1
fi

# ============================================================================
# CREAR BACKUP
# ============================================================================

log_info "💾 Creando backup: $BACKUP_FILE"

# Crear archivo temporal con la lista de archivos a respaldar
TEMP_LIST=$(mktemp)

# Añadir uploads si existe
if [ -d "$UPLOADS_DIR" ]; then
    echo "$UPLOADS_DIR" >> "$TEMP_LIST"
    log_info "  ✅ Incluido: uploads/"
else
    log_warning "  ⚠️  No se encontró directorio uploads"
fi

# Añadir .env si existe
if [ -f "$ENV_FILE" ]; then
    echo "$ENV_FILE" >> "$TEMP_LIST"
    log_info "  ✅ Incluido: .env"
else
    log_warning "  ⚠️  No se encontró archivo .env"
fi

# Añadir configuración PM2 si existe
if [ -d "$PM2_CONFIG" ]; then
    echo "$PM2_CONFIG" >> "$TEMP_LIST"
    log_info "  ✅ Incluido: PM2 config"
fi

# Crear el tar.gz
if tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" -T "$TEMP_LIST" 2>/dev/null; then
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    log_info "✅ Backup creado exitosamente: ${BACKUP_SIZE}"
else
    log_error "❌ Error al crear backup"
    rm -f "$TEMP_LIST"
    exit 1
fi

# Limpiar archivo temporal
rm -f "$TEMP_LIST"

# ============================================================================
# VERIFICAR INTEGRIDAD DEL BACKUP
# ============================================================================

log_info "🔍 Verificando integridad del backup..."

if tar -tzf "${BACKUP_DIR}/${BACKUP_FILE}" > /dev/null 2>&1; then
    log_info "✅ Backup verificado correctamente"
else
    log_error "❌ El backup está corrupto"
    rm -f "${BACKUP_DIR}/${BACKUP_FILE}"
    exit 1
fi

# ============================================================================
# LIMPIAR BACKUPS ANTIGUOS (mantener solo los 2 últimos)
# ============================================================================

log_info "🧹 Limpiando backups antiguos (manteniendo últimos $RETENTION_COUNT)..."

# Contar backups actuales
CURRENT_COUNT=$(find "$BACKUP_DIR" -name "osyris_files_*.tar.gz" -type f | wc -l)

if [ "$CURRENT_COUNT" -gt "$RETENTION_COUNT" ]; then
    # Eliminar los más antiguos, manteniendo solo los últimos RETENTION_COUNT
    DELETED_COUNT=0
    find "$BACKUP_DIR" -name "osyris_files_*.tar.gz" -type f -printf "%T@ %p\n" | \
    sort -n | \
    head -n -${RETENTION_COUNT} | \
    cut -d' ' -f2- | \
    while read old_backup; do
        rm -f "$old_backup"
        DELETED_COUNT=$((DELETED_COUNT + 1))
        log_info "  🗑️  Eliminado: $(basename "$old_backup")"
    done
else
    DELETED_COUNT=0
fi

if [ $DELETED_COUNT -eq 0 ]; then
    log_info "  ℹ️  No hay backups antiguos para eliminar"
else
    log_info "  ✅ $DELETED_COUNT backup(s) antiguo(s) eliminado(s)"
fi

# ============================================================================
# RESUMEN
# ============================================================================

TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "osyris_files_*.tar.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
log_info "📊 RESUMEN DEL BACKUP"
log_info "  📅 Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
log_info "  📁 Archivo: $BACKUP_FILE"
log_info "  💾 Tamaño: $BACKUP_SIZE"
log_info "  📦 Total backups: $TOTAL_BACKUPS"
log_info "  🗄️  Espacio total: $TOTAL_SIZE"
echo ""
log_info "✅ Backup completado exitosamente"

# ============================================================================
# LOG
# ============================================================================

LOG_FILE="/var/log/osyris-backups.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup archivos creado: $BACKUP_FILE ($BACKUP_SIZE) - Total: $TOTAL_BACKUPS backups ($TOTAL_SIZE)" >> "$LOG_FILE"

exit 0

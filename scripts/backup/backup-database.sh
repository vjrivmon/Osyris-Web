#!/bin/bash

###############################################################################
# 🔄 BACKUP AUTOMÁTICO DE BASE DE DATOS POSTGRESQL - OSYRIS
###############################################################################
# Descripción: Backup diario de la base de datos PostgreSQL
# Uso: ./backup-database.sh
# Cronjob: 0 2 * * * /path/to/backup-database.sh
###############################################################################

set -e  # Salir si hay errores

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

BACKUP_DIR="/var/backups/osyris/database"
RETENTION_COUNT=2  # Mantener solo los 2 últimos backups
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="osyris_db_${DATE}.sql.gz"

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

log_info "🔄 Iniciando backup de base de datos PostgreSQL..."

# Verificar que el directorio de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    log_info "📁 Creando directorio de backups: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Verificar que Docker está corriendo
if ! docker ps > /dev/null 2>&1; then
    log_error "❌ Docker no está corriendo"
    exit 1
fi

# Verificar que el contenedor de PostgreSQL existe
if ! docker ps -a | grep -q "osyris-db"; then
    log_error "❌ Contenedor osyris-db no encontrado"
    exit 1
fi

# Verificar que el contenedor está corriendo
if ! docker ps | grep -q "osyris-db"; then
    log_error "❌ Contenedor osyris-db no está corriendo"
    exit 1
fi

# ============================================================================
# CREAR BACKUP
# ============================================================================

log_info "💾 Creando backup: $BACKUP_FILE"

# Hacer dump de la base de datos y comprimirlo
if docker exec osyris-db pg_dump -U osyris_user osyris_db | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"; then
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    log_info "✅ Backup creado exitosamente: ${BACKUP_SIZE}"
else
    log_error "❌ Error al crear backup"
    exit 1
fi

# ============================================================================
# VERIFICAR INTEGRIDAD DEL BACKUP
# ============================================================================

log_info "🔍 Verificando integridad del backup..."

if gunzip -t "${BACKUP_DIR}/${BACKUP_FILE}"; then
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
CURRENT_COUNT=$(find "$BACKUP_DIR" -name "osyris_db_*.sql.gz" -type f | wc -l)

if [ "$CURRENT_COUNT" -gt "$RETENTION_COUNT" ]; then
    # Eliminar los más antiguos, manteniendo solo los últimos RETENTION_COUNT
    DELETED_COUNT=0
    find "$BACKUP_DIR" -name "osyris_db_*.sql.gz" -type f -printf "%T@ %p\n" | \
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

TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "osyris_db_*.sql.gz" -type f | wc -l)
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

# Guardar log del backup
LOG_FILE="/var/log/osyris-backups.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup creado: $BACKUP_FILE ($BACKUP_SIZE) - Total: $TOTAL_BACKUPS backups ($TOTAL_SIZE)" >> "$LOG_FILE"

exit 0

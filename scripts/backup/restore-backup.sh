#!/bin/bash

###############################################################################
# ⚡ RESTAURACIÓN DE BACKUPS - OSYRIS
###############################################################################
# Descripción: Restaurar base de datos y archivos desde backups
# Uso: ./restore-backup.sh [database|files|all] [fecha_opcional]
# Ejemplo: ./restore-backup.sh database 20251003_020000
###############################################################################

set -e  # Salir si hay errores

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

DB_BACKUP_DIR="/var/backups/osyris/database"
FILES_BACKUP_DIR="/var/backups/osyris/files"
APP_DIR="/var/www/osyris/current"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

show_usage() {
    echo "Uso: $0 [database|files|all] [fecha_opcional]"
    echo ""
    echo "Ejemplos:"
    echo "  $0 database                  # Restaurar última BD"
    echo "  $0 files                     # Restaurar últimos archivos"
    echo "  $0 all                       # Restaurar todo"
    echo "  $0 database 20251003_020000  # Restaurar BD específica"
    echo ""
    exit 1
}

list_backups() {
    local type=$1
    local backup_dir=$2
    local pattern=$3

    echo ""
    log_info "📋 Backups disponibles de $type:"
    echo ""

    find "$backup_dir" -name "$pattern" -type f -printf "%T@ %p\n" | \
    sort -rn | \
    head -10 | \
    while read timestamp file; do
        size=$(du -h "$file" | cut -f1)
        date=$(date -d "@${timestamp%.*}" '+%Y-%m-%d %H:%M:%S')
        echo "  📦 $(basename "$file") - $size - $date"
    done

    echo ""
}

confirm_action() {
    log_warning "⚠️  Esta acción sobrescribirá los datos actuales"
    read -p "¿Estás seguro? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "❌ Restauración cancelada"
        exit 0
    fi
}

restore_database() {
    local backup_file=$1

    log_step "🔄 Restaurando base de datos..."

    # Verificar que el backup existe
    if [ ! -f "$backup_file" ]; then
        log_error "❌ Backup no encontrado: $backup_file"
        exit 1
    fi

    log_info "📁 Backup: $(basename "$backup_file")"

    # Confirmar acción
    confirm_action

    # Detener servicios
    log_info "⏸️  Deteniendo servicios..."
    pm2 stop osyris-backend || true

    # Crear backup de seguridad antes de restaurar
    log_info "💾 Creando backup de seguridad pre-restauración..."
    SAFETY_BACKUP="/var/backups/osyris/database/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
    docker exec osyris-db pg_dump -U osyris_user osyris_db | gzip > "$SAFETY_BACKUP"
    log_info "  ✅ Backup de seguridad creado: $(basename "$SAFETY_BACKUP")"

    # Restaurar
    log_info "⚡ Restaurando base de datos..."

    # Eliminar base de datos actual
    docker exec osyris-db psql -U osyris_user -c "DROP DATABASE IF EXISTS osyris_db;"

    # Crear base de datos nueva
    docker exec osyris-db psql -U osyris_user -c "CREATE DATABASE osyris_db;"

    # Restaurar desde backup
    gunzip -c "$backup_file" | docker exec -i osyris-db psql -U osyris_user -d osyris_db

    log_info "✅ Base de datos restaurada"

    # Reiniciar servicios
    log_info "▶️  Reiniciando servicios..."
    pm2 restart osyris-backend

    log_info "🎉 Restauración de base de datos completada"
}

restore_files() {
    local backup_file=$1

    log_step "📁 Restaurando archivos..."

    # Verificar que el backup existe
    if [ ! -f "$backup_file" ]; then
        log_error "❌ Backup no encontrado: $backup_file"
        exit 1
    fi

    log_info "📁 Backup: $(basename "$backup_file")"

    # Confirmar acción
    confirm_action

    # Crear backup de seguridad
    log_info "💾 Creando backup de seguridad pre-restauración..."
    SAFETY_BACKUP="/var/backups/osyris/files/pre_restore_$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$SAFETY_BACKUP" -C "$APP_DIR" uploads api-osyris/.env 2>/dev/null || true
    log_info "  ✅ Backup de seguridad creado"

    # Restaurar
    log_info "⚡ Restaurando archivos..."
    tar -xzf "$backup_file" -C /

    log_info "✅ Archivos restaurados"
    log_info "🎉 Restauración de archivos completada"
}

# ============================================================================
# MAIN
# ============================================================================

# Verificar argumentos
if [ $# -lt 1 ]; then
    show_usage
fi

TYPE=$1
DATE_PARAM=$2

echo ""
log_info "⚡ SISTEMA DE RESTAURACIÓN DE BACKUPS - OSYRIS"
echo ""

case $TYPE in
    database)
        if [ -z "$DATE_PARAM" ]; then
            # Listar backups disponibles
            list_backups "Base de Datos" "$DB_BACKUP_DIR" "osyris_db_*.sql.gz"

            # Usar el más reciente
            LATEST=$(find "$DB_BACKUP_DIR" -name "osyris_db_*.sql.gz" -type f -printf "%T@ %p\n" | sort -rn | head -1 | cut -d' ' -f2-)

            if [ -z "$LATEST" ]; then
                log_error "❌ No se encontraron backups"
                exit 1
            fi

            log_info "📦 Usando backup más reciente: $(basename "$LATEST")"
            restore_database "$LATEST"
        else
            BACKUP_FILE="${DB_BACKUP_DIR}/osyris_db_${DATE_PARAM}.sql.gz"
            restore_database "$BACKUP_FILE"
        fi
        ;;

    files)
        if [ -z "$DATE_PARAM" ]; then
            list_backups "Archivos" "$FILES_BACKUP_DIR" "osyris_files_*.tar.gz"

            LATEST=$(find "$FILES_BACKUP_DIR" -name "osyris_files_*.tar.gz" -type f -printf "%T@ %p\n" | sort -rn | head -1 | cut -d' ' -f2-)

            if [ -z "$LATEST" ]; then
                log_error "❌ No se encontraron backups"
                exit 1
            fi

            log_info "📦 Usando backup más reciente: $(basename "$LATEST")"
            restore_files "$LATEST"
        else
            BACKUP_FILE="${FILES_BACKUP_DIR}/osyris_files_${DATE_PARAM}.tar.gz"
            restore_files "$BACKUP_FILE"
        fi
        ;;

    all)
        log_step "🔄 Restauración completa (BD + Archivos)"

        # BD
        DB_LATEST=$(find "$DB_BACKUP_DIR" -name "osyris_db_*.sql.gz" -type f -printf "%T@ %p\n" | sort -rn | head -1 | cut -d' ' -f2-)
        if [ -n "$DB_LATEST" ]; then
            restore_database "$DB_LATEST"
        else
            log_warning "⚠️  No se encontraron backups de BD"
        fi

        # Archivos
        FILES_LATEST=$(find "$FILES_BACKUP_DIR" -name "osyris_files_*.tar.gz" -type f -printf "%T@ %p\n" | sort -rn | head -1 | cut -d' ' -f2-)
        if [ -n "$FILES_LATEST" ]; then
            restore_files "$FILES_LATEST"
        else
            log_warning "⚠️  No se encontraron backups de archivos"
        fi
        ;;

    *)
        log_error "❌ Tipo inválido: $TYPE"
        show_usage
        ;;
esac

echo ""
log_info "✅ Proceso de restauración completado"
echo ""

exit 0

#!/bin/bash

###############################################################################
# ☁️ BACKUP A GITHUB (OFFSITE) - OSYRIS
###############################################################################
# Descripción: Sube backups cifrados a GitHub para disaster recovery
# Uso: ./backup-to-github.sh
# Cronjob: 0 4 * * * /path/to/backup-to-github.sh
# Requiere: GPG para cifrado, GitHub CLI o SSH configurado
###############################################################################

set -e

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# Directorios locales
DB_BACKUP_DIR="/var/backups/osyris/database"
FILES_BACKUP_DIR="/var/backups/osyris/files"
TEMP_DIR="/tmp/osyris-github-backup"

# GitHub
GITHUB_REPO="vicente/osyris-backups"  # Cambiar por tu repo
GITHUB_BRANCH="main"

# Cifrado (GPG)
GPG_KEY_ID="${OSYRIS_GPG_KEY_ID:-osyris@backup}"  # Variable de entorno o default
ENCRYPT_BACKUPS=true  # true para cifrar, false para subir sin cifrar

# Retención en GitHub (días)
GITHUB_RETENTION_DAYS=30

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

check_prerequisites() {
    log_info "🔍 Verificando prerequisitos..."

    # Verificar git
    if ! command -v git &> /dev/null; then
        log_error "❌ Git no está instalado"
        exit 1
    fi

    # Verificar GPG si el cifrado está habilitado
    if [ "$ENCRYPT_BACKUPS" = true ]; then
        if ! command -v gpg &> /dev/null; then
            log_warning "⚠️  GPG no está instalado - backups NO serán cifrados"
            ENCRYPT_BACKUPS=false
        fi
    fi

    log_info "✅ Prerequisitos OK"
}

prepare_temp_dir() {
    log_info "📁 Preparando directorio temporal..."

    # Limpiar directorio temporal si existe
    rm -rf "$TEMP_DIR"
    mkdir -p "$TEMP_DIR"

    # Clonar o actualizar repo
    if [ ! -d "${TEMP_DIR}/.git" ]; then
        log_info "  📥 Clonando repositorio GitHub..."
        git clone "git@github.com:${GITHUB_REPO}.git" "$TEMP_DIR" --depth 1 --branch "$GITHUB_BRANCH" 2>/dev/null || {
            log_error "❌ Error al clonar repositorio"
            log_info "💡 Crea el repositorio privado: https://github.com/${GITHUB_REPO}"
            exit 1
        }
    fi
}

encrypt_file() {
    local input_file=$1
    local output_file=$2

    if [ "$ENCRYPT_BACKUPS" = true ]; then
        log_info "  🔐 Cifrando: $(basename "$input_file")"
        gpg --encrypt --recipient "$GPG_KEY_ID" --output "$output_file" "$input_file" 2>/dev/null
        return $?
    else
        # Si no se cifra, copiar directamente
        cp "$input_file" "$output_file"
        return $?
    fi
}

upload_backups() {
    log_info "☁️  Subiendo backups a GitHub..."

    cd "$TEMP_DIR"

    # Crear estructura de directorios
    mkdir -p database files

    # Copiar últimos backups de BD (cifrados o no)
    local latest_db=$(find "$DB_BACKUP_DIR" -name "osyris_db_*.sql.gz" -type f -printf "%T@ %p\n" | sort -rn | head -1 | cut -d' ' -f2-)

    if [ -n "$latest_db" ]; then
        local db_filename=$(basename "$latest_db")
        if [ "$ENCRYPT_BACKUPS" = true ]; then
            db_filename="${db_filename}.gpg"
        fi

        if encrypt_file "$latest_db" "database/$db_filename"; then
            log_info "  ✅ BD copiada: $db_filename"
        else
            log_error "  ❌ Error al procesar BD"
        fi
    else
        log_warning "  ⚠️  No se encontraron backups de BD"
    fi

    # Copiar últimos backups de archivos
    local latest_files=$(find "$FILES_BACKUP_DIR" -name "osyris_files_*.tar.gz" -type f -printf "%T@ %p\n" | sort -rn | head -1 | cut -d' ' -f2-)

    if [ -n "$latest_files" ]; then
        local files_filename=$(basename "$latest_files")
        if [ "$ENCRYPT_BACKUPS" = true ]; then
            files_filename="${files_filename}.gpg"
        fi

        if encrypt_file "$latest_files" "files/$files_filename"; then
            log_info "  ✅ Archivos copiados: $files_filename"
        else
            log_error "  ❌ Error al procesar archivos"
        fi
    else
        log_warning "  ⚠️  No se encontraron backups de archivos"
    fi

    # Limpiar backups antiguos en GitHub
    log_info "🧹 Limpiando backups antiguos en GitHub (>${GITHUB_RETENTION_DAYS} días)..."

    find database files -type f -mtime +${GITHUB_RETENTION_DAYS} -delete 2>/dev/null || true

    # Commit y push
    log_info "📤 Subiendo a GitHub..."

    git config user.email "backup@osyris.local"
    git config user.name "Osyris Backup Bot"

    git add .
    git commit -m "Backup automático: $(date '+%Y-%m-%d %H:%M:%S')" || log_info "  ℹ️  No hay cambios para commitear"
    git push origin "$GITHUB_BRANCH"

    log_info "✅ Backups subidos a GitHub"
}

cleanup() {
    log_info "🧹 Limpiando archivos temporales..."
    rm -rf "$TEMP_DIR"
}

# ============================================================================
# MAIN
# ============================================================================

echo ""
log_info "☁️  BACKUP OFFSITE A GITHUB - OSYRIS"
echo ""

# Verificar prerequisitos
check_prerequisites

# Preparar directorio temporal
prepare_temp_dir

# Subir backups
upload_backups

# Limpiar
cleanup

echo ""
log_info "✅ Backup offsite completado exitosamente"
echo ""
log_info "📦 Repositorio: https://github.com/${GITHUB_REPO}"
echo ""

exit 0

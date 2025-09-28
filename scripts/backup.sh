#!/bin/bash

# Osyris Project Backup Script
# Crea backups inteligentes del proyecto con compresión y versionado

set -e

echo "💾 Backup del Proyecto - Osyris Scout Management"
echo "==============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuración
BACKUP_DIR="backups"
PROJECT_NAME="osyris-scout-management"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${PROJECT_NAME}_backup_${TIMESTAMP}"

# Crear directorio de backups
setup_backup_directory() {
    log_info "Configurando directorio de backup..."

    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

    log_success "Directorio de backup creado: $BACKUP_DIR/$BACKUP_NAME"
}

# Backup del código fuente
backup_source_code() {
    log_info "Haciendo backup del código fuente..."

    local source_backup="$BACKUP_DIR/$BACKUP_NAME/source"
    mkdir -p "$source_backup"

    # Archivos esenciales del proyecto
    cp -r Osyris-Web "$source_backup/" 2>/dev/null || true
    cp -r .claude "$source_backup/" 2>/dev/null || true
    cp -r scripts "$source_backup/" 2>/dev/null || true

    # Archivos de configuración del root
    [[ -f package.json ]] && cp package.json "$source_backup/"
    [[ -f README.md ]] && cp README.md "$source_backup/"
    [[ -f .gitignore ]] && cp .gitignore "$source_backup/"
    [[ -f docker-compose.yml ]] && cp docker-compose.yml "$source_backup/"

    # Configuración de desarrollo
    [[ -d .vscode ]] && cp -r .vscode "$source_backup/"
    [[ -f .editorconfig ]] && cp .editorconfig "$source_backup/"

    # Excluir directorios pesados
    find "$source_backup" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$source_backup" -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$source_backup" -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true

    log_success "Código fuente respaldado"
}

# Backup de la base de datos
backup_database() {
    log_info "Haciendo backup de la base de datos..."

    local db_backup="$BACKUP_DIR/$BACKUP_NAME/database"
    mkdir -p "$db_backup"

    # SQLite databases
    find . -name "*.sqlite*" -type f -exec cp {} "$db_backup/" \; 2>/dev/null || true

    # MySQL dump si está configurado
    if [[ -f "Osyris-Web/api-osyris/.env" ]]; then
        source Osyris-Web/api-osyris/.env 2>/dev/null || true

        if [[ "$DB_DIALECT" == "mysql" && -n "$DB_NAME" && -n "$DB_USER" ]]; then
            log_info "Creando dump de MySQL..."

            mysqldump -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} \
                     -h "${DB_HOST:-localhost}" \
                     "$DB_NAME" > "$db_backup/${DB_NAME}_dump.sql" 2>/dev/null || \
            log_warning "No se pudo crear dump de MySQL (puede no estar configurado)"
        fi
    fi

    # Archivos de configuración de BD
    [[ -f "Osyris-Web/api-osyris/.env" ]] && cp "Osyris-Web/api-osyris/.env" "$db_backup/.env.backup"

    log_success "Base de datos respaldada"
}

# Backup de configuración personalizada
backup_configuration() {
    log_info "Haciendo backup de configuración personalizada..."

    local config_backup="$BACKUP_DIR/$BACKUP_NAME/configuration"
    mkdir -p "$config_backup"

    # Configuración de Claude Code
    [[ -d .claude ]] && cp -r .claude "$config_backup/"

    # Git configuration
    [[ -f .gitconfig ]] && cp .gitconfig "$config_backup/"
    [[ -d .git/hooks ]] && cp -r .git/hooks "$config_backup/git-hooks"

    # VS Code settings
    [[ -d .vscode ]] && cp -r .vscode "$config_backup/"

    # Environment files (sin datos sensibles)
    find . -name ".env.example" -exec cp --parents {} "$config_backup/" \; 2>/dev/null || true

    log_success "Configuración personalizada respaldada"
}

# Backup de documentación y assets
backup_documentation() {
    log_info "Haciendo backup de documentación y assets..."

    local docs_backup="$BACKUP_DIR/$BACKUP_NAME/documentation"
    mkdir -p "$docs_backup"

    # Documentación
    find . -name "*.md" -exec cp --parents {} "$docs_backup/" \; 2>/dev/null || true
    [[ -d docs ]] && cp -r docs "$docs_backup/"

    # Assets del proyecto
    [[ -d "Osyris-Web/public" ]] && cp -r "Osyris-Web/public" "$docs_backup/public"

    # Screenshots y análisis UI
    find . -name "ui-analysis-*" -type d -exec cp -r {} "$docs_backup/" \; 2>/dev/null || true

    log_success "Documentación y assets respaldados"
}

# Crear información del backup
create_backup_info() {
    log_info "Creando información del backup..."

    local info_file="$BACKUP_DIR/$BACKUP_NAME/BACKUP_INFO.md"

    cat > "$info_file" <<EOF
# Backup Information - Osyris Scout Management

## Backup Details
- **Project**: $PROJECT_NAME
- **Timestamp**: $TIMESTAMP
- **Date**: $(date +"%Y-%m-%d %H:%M:%S")
- **User**: $(whoami)
- **Host**: $(hostname)
- **Working Directory**: $(pwd)

## Git Information
- **Branch**: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A")
- **Commit**: $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
- **Status**: $(git status --porcelain 2>/dev/null | wc -l || echo "0") modified files

## System Information
- **OS**: $(uname -s)
- **Architecture**: $(uname -m)
- **Node.js**: $(node --version 2>/dev/null || echo "N/A")
- **npm**: $(npm --version 2>/dev/null || echo "N/A")

## Backup Contents

### Source Code (\`source/\`)
- Frontend (Next.js application)
- Backend (Express.js API)
- Scripts and automation tools
- Claude Code configuration

### Database (\`database/\`)
- SQLite database files
- MySQL dumps (if configured)
- Environment configuration

### Configuration (\`configuration/\`)
- Claude Code settings
- VS Code configuration
- Git hooks and settings
- Development tools configuration

### Documentation (\`documentation/\`)
- README files
- Project documentation
- UI analysis reports
- Public assets

## Restore Instructions

1. **Extract backup**: \`tar -xzf ${BACKUP_NAME}.tar.gz\`
2. **Restore source**: \`cp -r source/* /target/directory/\`
3. **Install dependencies**: \`npm install\`
4. **Configure database**: Restore from \`database/\` directory
5. **Setup development**: \`./scripts/setup-dev.sh\`

## Notes
- node_modules were excluded from backup
- Build artifacts (.next, dist) were excluded
- Sensitive data in .env files was excluded
- Only .env.example files were included

---
**Backup created automatically by Osyris backup script**
EOF

    log_success "Información del backup creada"
}

# Comprimir backup
compress_backup() {
    log_info "Comprimiendo backup..."

    cd "$BACKUP_DIR"

    # Crear archivo comprimido
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"

    # Calcular tamaños
    local original_size=$(du -sh "$BACKUP_NAME" | cut -f1)
    local compressed_size=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)

    log_success "Backup comprimido: ${BACKUP_NAME}.tar.gz"
    log_info "Tamaño original: $original_size"
    log_info "Tamaño comprimido: $compressed_size"

    # Eliminar directorio sin comprimir
    rm -rf "$BACKUP_NAME"

    cd ..
}

# Limpiar backups antiguos
cleanup_old_backups() {
    local keep_backups=${1:-5}

    log_info "Limpiando backups antiguos (manteniendo últimos $keep_backups)..."

    cd "$BACKUP_DIR"

    # Contar backups existentes
    local backup_count=$(ls -1 ${PROJECT_NAME}_backup_*.tar.gz 2>/dev/null | wc -l)

    if [[ $backup_count -gt $keep_backups ]]; then
        # Eliminar backups más antiguos
        ls -1t ${PROJECT_NAME}_backup_*.tar.gz | tail -n +$((keep_backups + 1)) | xargs rm -f

        local removed_count=$((backup_count - keep_backups))
        log_success "Eliminados $removed_count backups antiguos"
    else
        log_info "No hay backups antiguos para eliminar"
    fi

    cd ..
}

# Verificar integridad del backup
verify_backup() {
    log_info "Verificando integridad del backup..."

    local backup_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"

    if [[ -f "$backup_file" ]]; then
        # Verificar que el archivo se puede leer
        if tar -tzf "$backup_file" >/dev/null 2>&1; then
            log_success "Backup verificado: archivo íntegro"

            # Mostrar contenido resumido
            local file_count=$(tar -tzf "$backup_file" | wc -l)
            log_info "Archivos en backup: $file_count"
        else
            log_error "Backup corrupto: archivo no se puede leer"
            return 1
        fi
    else
        log_error "Archivo de backup no encontrado"
        return 1
    fi
}

# Mostrar resumen final
show_backup_summary() {
    local backup_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    local backup_size=$(du -sh "$backup_file" | cut -f1)

    echo ""
    echo "🎉 ¡Backup completado con éxito!"
    echo ""
    echo "📁 Archivo de backup: $backup_file"
    echo "📊 Tamaño: $backup_size"
    echo "📅 Fecha: $(date +"%Y-%m-%d %H:%M:%S")"
    echo ""
    echo "📋 Contenido respaldado:"
    echo "   ✅ Código fuente (sin node_modules)"
    echo "   ✅ Base de datos y configuración"
    echo "   ✅ Configuración personalizada"
    echo "   ✅ Documentación y assets"
    echo ""
    echo "🔄 Para restaurar:"
    echo "   tar -xzf $backup_file"
    echo "   cd ${BACKUP_NAME}/source"
    echo "   ./scripts/setup-dev.sh"
    echo ""
    echo "📂 Backups disponibles:"
    ls -lah "$BACKUP_DIR"/${PROJECT_NAME}_backup_*.tar.gz 2>/dev/null | tail -5 || echo "   (solo este backup)"
}

# Función principal
main() {
    local keep_backups=5
    local include_db=true

    # Procesar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --keep)
                keep_backups="$2"
                shift 2
                ;;
            --no-database)
                include_db=false
                shift
                ;;
            --help|-h)
                echo "Uso: ./scripts/backup.sh [opciones]"
                echo ""
                echo "Opciones:"
                echo "  --keep N          Mantener N backups (default: 5)"
                echo "  --no-database     No incluir backup de base de datos"
                echo "  --help, -h        Mostrar esta ayuda"
                echo ""
                echo "Descripción:"
                echo "  Crea un backup completo del proyecto incluyendo:"
                echo "  • Código fuente (sin node_modules)"
                echo "  • Base de datos y configuración"
                echo "  • Configuración personalizada"
                echo "  • Documentación y assets"
                echo ""
                echo "Ejemplos:"
                echo "  ./scripts/backup.sh                 # Backup estándar"
                echo "  ./scripts/backup.sh --keep 10       # Mantener 10 backups"
                echo "  ./scripts/backup.sh --no-database   # Sin backup de BD"
                exit 0
                ;;
            *)
                log_error "Opción desconocida: $1"
                echo "Usa --help para ver opciones disponibles"
                exit 1
                ;;
        esac
    done

    echo "🎯 Iniciando backup del proyecto Osyris..."

    setup_backup_directory
    backup_source_code

    if [[ "$include_db" == "true" ]]; then
        backup_database
    else
        log_warning "Saltando backup de base de datos (--no-database)"
    fi

    backup_configuration
    backup_documentation
    create_backup_info
    compress_backup
    cleanup_old_backups "$keep_backups"
    verify_backup
    show_backup_summary

    log_success "¡Backup completado! 💾"
}

# Verificar que estamos en el directorio correcto
if [[ ! -d "Osyris-Web" ]]; then
    log_error "Este script debe ejecutarse desde el directorio raíz del proyecto Osyris"
    echo "Directorio actual: $(pwd)"
    echo "Esperado: directorio que contenga Osyris-Web/"
    exit 1
fi

# Ejecutar función principal
main "$@"
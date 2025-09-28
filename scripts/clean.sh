#!/bin/bash

# Osyris Development Cleanup Script
# Limpia archivos temporales, caches y procesos de desarrollo

set -e

echo "🧹 Cleanup de Desarrollo - Osyris Scout Management"
echo "================================================="

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

# Detener procesos de desarrollo
stop_dev_processes() {
    log_info "Deteniendo procesos de desarrollo..."

    # Detener procesos en puertos conocidos
    local ports=(3000 3001 3333 8080)

    for port in "${ports[@]}"; do
        if lsof -i:$port >/dev/null 2>&1; then
            log_info "Deteniendo proceso en puerto $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            log_success "Puerto $port liberado"
        fi
    done

    # Procesos específicos por nombre
    pkill -f "next-dev" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    pkill -f "ts-node-dev" 2>/dev/null || true

    log_success "Procesos de desarrollo detenidos"
}

# Limpiar node_modules y caches
clean_node_modules() {
    log_info "Limpiando node_modules y caches..."

    # Root node_modules
    if [[ -d "node_modules" ]]; then
        rm -rf node_modules
        log_success "Root node_modules eliminado"
    fi

    # Frontend node_modules
    if [[ -d "Osyris-Web/node_modules" ]]; then
        rm -rf Osyris-Web/node_modules
        log_success "Frontend node_modules eliminado"
    fi

    # Backend node_modules
    if [[ -d "Osyris-Web/api-osyris/node_modules" ]]; then
        rm -rf Osyris-Web/api-osyris/node_modules
        log_success "Backend node_modules eliminado"
    fi

    # Package lock files
    find . -name "package-lock.json" -type f -delete 2>/dev/null || true
    find . -name "yarn.lock" -type f -delete 2>/dev/null || true
    find . -name "pnpm-lock.yaml" -type f -delete 2>/dev/null || true

    log_success "Lock files eliminados"
}

# Limpiar builds y archivos temporales
clean_build_files() {
    log_info "Limpiando archivos de build..."

    # Next.js build files
    if [[ -d "Osyris-Web/.next" ]]; then
        rm -rf Osyris-Web/.next
        log_success ".next eliminado"
    fi

    # Next.js cache
    if [[ -d "Osyris-Web/.next/cache" ]]; then
        rm -rf Osyris-Web/.next/cache
        log_success "Cache de Next.js eliminado"
    fi

    # TypeScript build info
    find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true

    # Dist directories
    find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true

    log_success "Archivos de build eliminados"
}

# Limpiar logs y archivos temporales
clean_temp_files() {
    log_info "Limpiando archivos temporales..."

    # Logs
    find . -name "*.log" -type f -delete 2>/dev/null || true
    find . -name "npm-debug.log*" -type f -delete 2>/dev/null || true

    # Coverage reports
    find . -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".nyc_output" -type d -exec rm -rf {} + 2>/dev/null || true

    # Test results
    find . -name "test-results" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "test-reports" -type d -exec rm -rf {} + 2>/dev/null || true

    # Screenshots de UI analysis
    find . -name "ui-analysis-*" -type d -exec rm -rf {} + 2>/dev/null || true

    # Playwright artifacts
    find . -name "playwright-report" -type d -exec rm -rf {} + 2>/dev/null || true

    log_success "Archivos temporales eliminados"
}

# Limpiar cache de herramientas
clean_tool_caches() {
    log_info "Limpiando caches de herramientas..."

    # npm cache
    npm cache clean --force 2>/dev/null || true

    # Playwright cache
    npx playwright uninstall --all 2>/dev/null || true

    # ESLint cache
    find . -name ".eslintcache" -type f -delete 2>/dev/null || true

    # Jest cache
    find . -name ".jest" -type d -exec rm -rf {} + 2>/dev/null || true

    # Next.js cache global
    if [[ -d "$HOME/.next" ]]; then
        rm -rf "$HOME/.next/cache" 2>/dev/null || true
    fi

    log_success "Caches de herramientas limpiados"
}

# Limpiar base de datos de desarrollo (opcional)
clean_development_database() {
    local clean_db=${1:-false}

    if [[ "$clean_db" == "true" ]]; then
        log_info "Limpiando base de datos de desarrollo..."

        # SQLite databases
        find . -name "*.sqlite" -type f -delete 2>/dev/null || true
        find . -name "*.sqlite3" -type f -delete 2>/dev/null || true
        find . -name "*.db" -type f -delete 2>/dev/null || true

        # Database backup files
        find . -name "*.sql.backup" -type f -delete 2>/dev/null || true

        log_success "Base de datos de desarrollo limpiada"
    else
        log_warning "Base de datos preservada (usa --database para limpiar)"
    fi
}

# Limpiar archivos de configuración temporal
clean_config_files() {
    log_info "Limpiando archivos de configuración temporal..."

    # Environment files temporales
    find . -name ".env.local" -type f -delete 2>/dev/null || true
    find . -name ".env.development.local" -type f -delete 2>/dev/null || true

    # Editor temporales
    find . -name "*.swp" -type f -delete 2>/dev/null || true
    find . -name "*.swo" -type f -delete 2>/dev/null || true
    find . -name "*~" -type f -delete 2>/dev/null || true

    # macOS files
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true

    # Windows files
    find . -name "Thumbs.db" -type f -delete 2>/dev/null || true

    log_success "Archivos de configuración temporal eliminados"
}

# Verificar espacio liberado
check_disk_space() {
    log_info "Verificando espacio liberado..."

    local project_size=$(du -sh . 2>/dev/null | cut -f1)
    echo "📊 Tamaño actual del proyecto: $project_size"

    log_success "Cleanup completado"
}

# Mostrar resumen
show_cleanup_summary() {
    echo ""
    echo "🎉 ¡Cleanup completado con éxito!"
    echo ""
    echo "🧹 Elementos limpiados:"
    echo "   ✅ Procesos de desarrollo detenidos"
    echo "   ✅ node_modules eliminados"
    echo "   ✅ Archivos de build eliminados"
    echo "   ✅ Archivos temporales eliminados"
    echo "   ✅ Caches de herramientas limpiados"
    echo "   ✅ Archivos de configuración temporal eliminados"
    echo ""
    echo "🚀 Para volver a desarrollar:"
    echo "   ./scripts/setup-dev.sh     # Setup completo"
    echo "   npm install                # Solo dependencias"
    echo "   npm run dev                # Iniciar desarrollo"
    echo ""
    echo "💡 Tip: Usa './scripts/clean.sh --database' para limpiar también la BD"
}

# Función principal
main() {
    local clean_database=false

    # Procesar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --database)
                clean_database=true
                shift
                ;;
            --help|-h)
                echo "Uso: ./scripts/clean.sh [opciones]"
                echo ""
                echo "Opciones:"
                echo "  --database    Limpiar también base de datos de desarrollo"
                echo "  --help, -h    Mostrar esta ayuda"
                echo ""
                echo "Ejemplos:"
                echo "  ./scripts/clean.sh              # Cleanup estándar"
                echo "  ./scripts/clean.sh --database   # Cleanup incluyendo BD"
                exit 0
                ;;
            *)
                log_error "Opción desconocida: $1"
                echo "Usa --help para ver opciones disponibles"
                exit 1
                ;;
        esac
    done

    echo "🎯 Iniciando cleanup de desarrollo para Osyris..."

    stop_dev_processes
    clean_node_modules
    clean_build_files
    clean_temp_files
    clean_tool_caches
    clean_development_database "$clean_database"
    clean_config_files
    check_disk_space
    show_cleanup_summary

    log_success "¡Cleanup completado! 🎉"
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
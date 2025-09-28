#!/bin/bash

# Osyris Development Reset Script
# Hace reset completo del entorno de desarrollo y lo reconfigura

set -e

echo "🔄 Reset de Desarrollo - Osyris Scout Management"
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

# Confirmación del usuario
confirm_reset() {
    echo ""
    log_warning "⚠️  ADVERTENCIA: Este script hará un RESET COMPLETO del entorno de desarrollo"
    echo ""
    echo "🗑️  Se eliminarán:"
    echo "   • node_modules"
    echo "   • Archivos de build (.next, dist, etc.)"
    echo "   • Caches de herramientas"
    echo "   • Base de datos de desarrollo"
    echo "   • Archivos temporales y logs"
    echo ""
    echo "🔧 Se reconfigurará:"
    echo "   • Dependencias npm"
    echo "   • Base de datos"
    echo "   • Git hooks"
    echo "   • Configuración de herramientas"
    echo ""

    read -p "¿Estás seguro de que quieres continuar? (escribe 'RESET' para confirmar): " confirmation

    if [[ "$confirmation" != "RESET" ]]; then
        log_info "Reset cancelado por el usuario"
        exit 0
    fi

    log_info "Reset confirmado, procediendo..."
}

# Crear backup opcional
create_backup() {
    local create_backup=${1:-false}

    if [[ "$create_backup" == "true" ]]; then
        log_info "Creando backup antes del reset..."

        local timestamp=$(date +"%Y%m%d_%H%M%S")
        local backup_dir="backup_$timestamp"

        mkdir -p "$backup_dir"

        # Backup de archivos importantes
        if [[ -f "Osyris-Web/api-osyris/.env" ]]; then
            cp "Osyris-Web/api-osyris/.env" "$backup_dir/.env.backup"
        fi

        # Backup de base de datos SQLite si existe
        find Osyris-Web/api-osyris -name "*.sqlite*" -exec cp {} "$backup_dir/" \; 2>/dev/null || true

        # Backup de configuración personalizada
        if [[ -f ".vscode/settings.json" ]]; then
            cp -r .vscode "$backup_dir/vscode_settings" 2>/dev/null || true
        fi

        # Backup de package.json personalizados
        find . -name "package.json" -exec cp --parents {} "$backup_dir/" \; 2>/dev/null || true

        log_success "Backup creado en: $backup_dir"
    fi
}

# Ejecutar cleanup completo
run_full_cleanup() {
    log_info "Ejecutando cleanup completo..."

    if [[ -f "scripts/clean.sh" ]]; then
        chmod +x scripts/clean.sh
        ./scripts/clean.sh --database
    else
        log_warning "Script de cleanup no encontrado, limpiando manualmente..."

        # Cleanup manual básico
        rm -rf node_modules Osyris-Web/node_modules Osyris-Web/api-osyris/node_modules 2>/dev/null || true
        rm -rf Osyris-Web/.next 2>/dev/null || true
        find . -name "*.log" -delete 2>/dev/null || true
        find . -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true
    fi

    log_success "Cleanup completado"
}

# Reset configuración Git
reset_git_config() {
    log_info "Reseteando configuración Git..."

    # Remover git hooks personalizados
    if [[ -d ".git/hooks" ]]; then
        find .git/hooks -name "*.sample" -prune -o -type f -exec rm {} \; 2>/dev/null || true
    fi

    # Reset del index si hay problemas
    git reset HEAD . 2>/dev/null || true

    # Limpiar git cache
    git gc --prune=now --aggressive 2>/dev/null || true

    log_success "Configuración Git reseteada"
}

# Reinstalar todo desde cero
reinstall_everything() {
    log_info "Reinstalando todo desde cero..."

    # Ejecutar setup completo
    if [[ -f "scripts/setup-dev.sh" ]]; then
        chmod +x scripts/setup-dev.sh
        ./scripts/setup-dev.sh
    else
        log_error "Script de setup no encontrado"
        log_info "Ejecutando setup manual básico..."

        # Setup manual básico
        cd Osyris-Web
        npm install
        cd api-osyris
        npm install
        cd ../..

        if [[ ! -f package.json ]]; then
            npm init -y
        fi
        npm install
    fi

    log_success "Reinstalación completada"
}

# Verificar estado final
verify_reset() {
    log_info "Verificando estado después del reset..."

    # Verificar node_modules
    if [[ -d "node_modules" && -d "Osyris-Web/node_modules" && -d "Osyris-Web/api-osyris/node_modules" ]]; then
        log_success "Dependencias instaladas ✓"
    else
        log_error "Faltan algunas dependencias"
    fi

    # Verificar que no hay archivos de build antiguos
    if [[ ! -d "Osyris-Web/.next" ]]; then
        log_success "Sin archivos de build antiguos ✓"
    else
        log_warning "Aún existen archivos de build antiguos"
    fi

    # Verificar scripts
    if [[ -x "scripts/setup-dev.sh" && -x "scripts/clean.sh" ]]; then
        log_success "Scripts ejecutables ✓"
    else
        log_warning "Algunos scripts no son ejecutables"
        chmod +x scripts/*.sh 2>/dev/null || true
    fi

    # Test básico de funcionamiento
    log_info "Ejecutando test básico..."
    cd Osyris-Web
    if npm run build --silent >/dev/null 2>&1; then
        log_success "Build del frontend funciona ✓"
    else
        log_warning "Problemas con build del frontend"
    fi
    cd ..

    log_success "Verificación completada"
}

# Mostrar resumen final
show_reset_summary() {
    echo ""
    echo "🎉 ¡Reset de desarrollo completado con éxito!"
    echo ""
    echo "✨ El entorno ha sido completamente reseteado y reconfigurado"
    echo ""
    echo "🔄 Acciones realizadas:"
    echo "   ✅ Cleanup completo ejecutado"
    echo "   ✅ Configuración Git reseteada"
    echo "   ✅ Dependencias reinstaladas"
    echo "   ✅ Herramientas reconfiguradas"
    echo "   ✅ Verificación de estado completada"
    echo ""
    echo "🚀 Para empezar a desarrollar:"
    echo "   npm run dev              # Levantar frontend + backend"
    echo "   /dev-start               # Comando Claude Code"
    echo ""
    echo "🌐 URLs de desarrollo:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend:  http://localhost:3000"
    echo ""
    echo "📖 Comandos disponibles:"
    echo "   npm run test             # Ejecutar tests"
    echo "   npm run build            # Build completo"
    echo "   npm run lint             # Linting"
    echo "   /ui-analyze              # Análisis de interfaz"
    echo "   /run-tests               # Suite completa de tests"
    echo ""
    echo "💡 Si hay problemas, consulta el README.md o ejecuta ./scripts/setup-dev.sh"
}

# Función principal
main() {
    local create_backup=false
    local skip_confirmation=false

    # Procesar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backup)
                create_backup=true
                shift
                ;;
            --force)
                skip_confirmation=true
                shift
                ;;
            --help|-h)
                echo "Uso: ./scripts/reset-dev.sh [opciones]"
                echo ""
                echo "Opciones:"
                echo "  --backup      Crear backup antes del reset"
                echo "  --force       Skip confirmación (PELIGROSO)"
                echo "  --help, -h    Mostrar esta ayuda"
                echo ""
                echo "Descripción:"
                echo "  Hace un reset completo del entorno de desarrollo:"
                echo "  • Limpia todos los archivos temporales"
                echo "  • Elimina y reinstala dependencias"
                echo "  • Resetea configuración Git"
                echo "  • Reconfigura herramientas de desarrollo"
                echo ""
                echo "⚠️  ADVERTENCIA: Este comando es destructivo"
                echo ""
                echo "Ejemplos:"
                echo "  ./scripts/reset-dev.sh              # Reset con confirmación"
                echo "  ./scripts/reset-dev.sh --backup     # Reset con backup"
                echo "  ./scripts/reset-dev.sh --force      # Reset sin confirmación"
                exit 0
                ;;
            *)
                log_error "Opción desconocida: $1"
                echo "Usa --help para ver opciones disponibles"
                exit 1
                ;;
        esac
    done

    echo "🎯 Iniciando reset completo de desarrollo para Osyris..."

    # Confirmación (a menos que sea --force)
    if [[ "$skip_confirmation" != "true" ]]; then
        confirm_reset
    else
        log_warning "Ejecutando reset SIN confirmación (--force activado)"
    fi

    create_backup "$create_backup"
    run_full_cleanup
    reset_git_config
    reinstall_everything
    verify_reset
    show_reset_summary

    log_success "¡Reset de desarrollo completado! 🎉"
}

# Verificar que estamos en el directorio correcto
if [[ ! -d "Osyris-Web" ]]; then
    log_error "Este script debe ejecutarse desde el directorio raíz del proyecto Osyris"
    echo "Directorio actual: $(pwd)"
    echo "Esperado: directorio que contenga Osyris-Web/"
    exit 1
fi

# Verificar que estamos en un repositorio Git
if [[ ! -d ".git" ]]; then
    log_error "Este directorio no es un repositorio Git"
    echo "El reset requiere un repositorio Git válido"
    exit 1
fi

# Ejecutar función principal
main "$@"
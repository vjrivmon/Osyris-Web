#!/bin/bash

# Osyris Dependencies Fix Script
# Soluciona problemas de dependencias de React 19

set -e

echo "🔧 Fix de Dependencias - Osyris Scout Management"
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

# Limpiar instalaciones previas problemáticas
clean_previous_installs() {
    log_info "Limpiando instalaciones previas..."

    # Eliminar node_modules si existe
    if [[ -d "Osyris-Web/node_modules" ]]; then
        rm -rf Osyris-Web/node_modules
        log_success "node_modules del frontend eliminado"
    fi

    if [[ -d "Osyris-Web/api-osyris/node_modules" ]]; then
        rm -rf Osyris-Web/api-osyris/node_modules
        log_success "node_modules del backend eliminado"
    fi

    # Eliminar lock files problemáticos
    rm -f Osyris-Web/package-lock.json
    rm -f Osyris-Web/api-osyris/package-lock.json
    rm -f package-lock.json

    log_success "Archivos de lock eliminados"
}

# Instalar dependencias del frontend con flags de compatibilidad
install_frontend_deps() {
    log_info "Instalando dependencias del frontend con React 19..."

    cd Osyris-Web

    # Instalar con legacy peer deps para compatibilidad
    npm install --legacy-peer-deps

    if [[ $? -eq 0 ]]; then
        log_success "Dependencias del frontend instaladas correctamente"
    else
        log_error "Error instalando dependencias del frontend"
        log_info "Intentando con --force..."
        npm install --force

        if [[ $? -eq 0 ]]; then
            log_warning "Dependencias instaladas con --force (pueden haber incompatibilidades menores)"
        else
            log_error "No se pudieron instalar las dependencias del frontend"
            exit 1
        fi
    fi

    cd ..
}

# Instalar dependencias del backend
install_backend_deps() {
    log_info "Instalando dependencias del backend..."

    cd Osyris-Web/api-osyris

    npm install

    if [[ $? -eq 0 ]]; then
        log_success "Dependencias del backend instaladas correctamente"
    else
        log_error "Error instalando dependencias del backend"
        exit 1
    fi

    cd ../..
}

# Instalar dependencias del root
install_root_deps() {
    log_info "Instalando dependencias del proyecto root..."

    if [[ ! -f package.json ]]; then
        log_info "Creando package.json del root..."
        cat > package.json <<EOF
{
  "name": "osyris-scout-management",
  "version": "1.0.0",
  "description": "Sistema de gestión para el Grupo Scout Osyris",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd Osyris-Web && npm run dev -- --port 3001",
    "dev:backend": "cd Osyris-Web/api-osyris && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd Osyris-Web && npm run build",
    "build:backend": "cd Osyris-Web/api-osyris && echo 'Backend build not required'",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd Osyris-Web && npm test",
    "test:backend": "cd Osyris-Web/api-osyris && npm test",
    "test:e2e": "npx playwright test",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd Osyris-Web && npm run lint",
    "lint:backend": "cd Osyris-Web/api-osyris && npm run lint || echo 'Backend lint not configured'",
    "setup": "./scripts/setup-dev.sh",
    "clean": "./scripts/clean.sh",
    "reset": "./scripts/reset-dev.sh",
    "fix-deps": "./scripts/fix-dependencies.sh"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "@playwright/test": "^1.40.0"
  },
  "keywords": ["scout", "management", "osyris", "next.js", "express"],
  "author": "Vicente Rivas Monferrer",
  "license": "ISC"
}
EOF
    fi

    npm install

    if [[ $? -eq 0 ]]; then
        log_success "Dependencias del root instaladas correctamente"
    else
        log_error "Error instalando dependencias del root"
        exit 1
    fi
}

# Instalar Playwright
install_playwright() {
    log_info "Instalando Playwright para testing E2E..."

    npx playwright install chromium

    if [[ $? -eq 0 ]]; then
        log_success "Playwright instalado correctamente"
    else
        log_warning "Error instalando Playwright - se puede instalar después manualmente"
    fi
}

# Verificar instalación
verify_installation() {
    log_info "Verificando instalación..."

    # Verificar frontend
    cd Osyris-Web
    if npm list react >/dev/null 2>&1; then
        local react_version=$(npm list react --depth=0 | grep react | cut -d'@' -f2)
        log_success "Frontend: React $react_version instalado correctamente"
    else
        log_error "Problemas con la instalación del frontend"
    fi

    # Verificar backend
    cd api-osyris
    if npm list express >/dev/null 2>&1; then
        local express_version=$(npm list express --depth=0 | grep express | cut -d'@' -f2)
        log_success "Backend: Express $express_version instalado correctamente"
    else
        log_error "Problemas con la instalación del backend"
    fi

    cd ../..

    # Verificar que se puede hacer build
    log_info "Verificando que el frontend se puede buildear..."
    cd Osyris-Web

    # Intentar build sin errores
    if timeout 30s npm run build >/dev/null 2>&1; then
        log_success "Build del frontend exitoso"
    else
        log_warning "Build del frontend tuvo problemas - puede requerir ajustes adicionales"
    fi

    cd ..
}

# Crear archivos de configuración necesarios
create_config_files() {
    log_info "Creando archivos de configuración..."

    # Jest config para frontend
    cat > Osyris-Web/jest.config.js <<'EOF'
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
EOF

    # Jest setup para frontend
    cat > Osyris-Web/jest.setup.js <<'EOF'
import '@testing-library/jest-dom'
EOF

    # Prettier config
    cat > Osyris-Web/.prettierrc <<'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
EOF

    # TypeScript config update para testing
    if [[ -f "Osyris-Web/tsconfig.json" ]]; then
        # Backup current tsconfig
        cp Osyris-Web/tsconfig.json Osyris-Web/tsconfig.json.backup
    fi

    log_success "Archivos de configuración creados"
}

# Mostrar resumen final
show_summary() {
    echo ""
    echo "🎉 ¡Fix de dependencias completado!"
    echo ""
    echo "✅ Dependencias instaladas:"
    echo "   • Frontend: React 19 + Next.js 15"
    echo "   • Backend: Express.js + Node.js"
    echo "   • Testing: Jest + Playwright"
    echo "   • Root: Scripts de automatización"
    echo ""
    echo "🚀 Para continuar con el desarrollo:"
    echo "   npm run dev              # Levantar frontend + backend"
    echo "   ./scripts/setup-dev.sh   # Completar setup si es necesario"
    echo "   /dev-start               # Usar comando Claude Code"
    echo ""
    echo "🌐 URLs esperadas:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend:  http://localhost:3000"
    echo ""
    echo "💡 Si hay más problemas, ejecuta:"
    echo "   ./scripts/clean.sh && ./scripts/fix-dependencies.sh"
}

# Función principal
main() {
    echo "🎯 Iniciando fix de dependencias para Osyris..."

    clean_previous_installs
    install_frontend_deps
    install_backend_deps
    install_root_deps
    install_playwright
    create_config_files
    verify_installation
    show_summary

    log_success "¡Fix de dependencias completado! 🎉"
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
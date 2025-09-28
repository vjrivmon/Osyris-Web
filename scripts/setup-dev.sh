#!/bin/bash

# Osyris Development Setup Script
# Configura todo lo necesario para desarrollar en el proyecto Osyris

set -e

echo "🚀 Setup de Desarrollo - Osyris Scout Management"
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

# Verificar prerrequisitos del sistema
check_system_requirements() {
    log_info "Verificando prerrequisitos del sistema..."

    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado"
        echo "Por favor instala Node.js 18+ desde https://nodejs.org/"
        exit 1
    fi

    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"

    if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
        log_error "Node.js version $node_version es muy antigua. Se requiere 18+"
        exit 1
    fi

    log_success "Node.js $(node --version) ✓"

    # npm
    if ! command -v npm &> /dev/null; then
        log_error "npm no está disponible"
        exit 1
    fi

    log_success "npm $(npm --version) ✓"

    # Git
    if ! command -v git &> /dev/null; then
        log_error "Git no está instalado"
        exit 1
    fi

    log_success "Git $(git --version | cut -d' ' -f3) ✓"

    # MySQL (opcional)
    if command -v mysql &> /dev/null; then
        log_success "MySQL disponible ✓"
    else
        log_warning "MySQL no está instalado - se usará SQLite para desarrollo"
    fi
}

# Configurar base de datos
setup_database() {
    log_info "Configurando base de datos..."

    cd Osyris-Web/api-osyris

    # Crear archivo .env si no existe
    if [[ ! -f .env ]]; then
        log_info "Creando archivo .env..."
        cat > .env <<EOF
# Osyris API Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=osyris_development
DB_DIALECT=sqlite

# JWT Configuration
JWT_SECRET=osyris_development_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# Google Drive API (configurar cuando esté disponible)
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REFRESH_TOKEN=

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Upload Configuration
UPLOAD_MAX_SIZE=10MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf
EOF
        log_success "Archivo .env creado"
    else
        log_success "Archivo .env ya existe"
    fi

    # Crear directorio para SQLite si no existe
    mkdir -p database

    # Si existe un script de setup de BD, ejecutarlo
    if [[ -f "scripts/setup-database.js" ]]; then
        log_info "Ejecutando setup de base de datos..."
        node scripts/setup-database.js
        log_success "Base de datos configurada"
    else
        log_warning "No se encontró script de setup de BD - crear manualmente si es necesario"
    fi

    cd ../..
}

# Instalar dependencias
install_dependencies() {
    log_info "Instalando dependencias..."

    # Frontend dependencies
    log_info "Instalando dependencias del frontend..."
    cd Osyris-Web
    npm install
    log_success "Dependencias frontend instaladas"

    # Backend dependencies
    log_info "Instalando dependencias del backend..."
    cd api-osyris
    npm install
    log_success "Dependencias backend instaladas"

    cd ../..

    # Playwright para E2E testing
    log_info "Instalando Playwright para tests E2E..."
    npx playwright install
    log_success "Playwright instalado"
}

# Configurar git hooks
setup_git_hooks() {
    log_info "Configurando git hooks..."

    # Crear directorio de hooks si no existe
    mkdir -p .git/hooks

    # Pre-commit hook para linting y formatting
    cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
echo "🔍 Ejecutando pre-commit checks..."

# Lint frontend
cd Osyris-Web
if npm run lint --silent; then
    echo "✅ Frontend lint: PASSED"
else
    echo "❌ Frontend lint: FAILED"
    echo "💡 Ejecuta 'npm run lint -- --fix' para arreglar errores automáticamente"
    exit 1
fi

# Type check frontend
if npm run type-check --silent 2>/dev/null; then
    echo "✅ TypeScript: PASSED"
else
    echo "❌ TypeScript: FAILED"
    exit 1
fi

cd ..

echo "✅ Pre-commit checks completados"
EOF

    chmod +x .git/hooks/pre-commit
    log_success "Git hooks configurados"
}

# Configurar VS Code settings (si VS Code está disponible)
setup_vscode() {
    if command -v code &> /dev/null; then
        log_info "Configurando VS Code settings..."

        mkdir -p .vscode

        # Settings
        cat > .vscode/settings.json <<EOF
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "*.tsx": "\${capture}.test.tsx,\${capture}.stories.tsx",
    "*.ts": "\${capture}.test.ts,\${capture}.spec.ts"
  }
}
EOF

        # Extensions recommendations
        cat > .vscode/extensions.json <<EOF
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "ms-vscode.vscode-typescript-next"
  ]
}
EOF

        log_success "VS Code configurado"
    else
        log_warning "VS Code no está disponible - saltando configuración"
    fi
}

# Crear scripts package.json del root si no existe
create_root_package_scripts() {
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
    "reset": "./scripts/reset-dev.sh"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  },
  "keywords": ["scout", "management", "osyris", "next.js", "express"],
  "author": "Vicente Rivas Monferrer",
  "license": "ISC"
}
EOF

        npm install
        log_success "package.json del root creado"
    fi
}

# Verificar que todo funciona
verify_setup() {
    log_info "Verificando configuración..."

    # Verificar que se pueden instalar dependencias
    cd Osyris-Web
    if npm list >/dev/null 2>&1; then
        log_success "Dependencias frontend verificadas"
    else
        log_error "Problema con dependencias frontend"
    fi

    cd api-osyris
    if npm list >/dev/null 2>&1; then
        log_success "Dependencias backend verificadas"
    else
        log_error "Problema con dependencias backend"
    fi

    cd ../..

    # Verificar scripts
    if [[ -f "scripts/dev-start.sh" ]]; then
        chmod +x scripts/*.sh
        log_success "Scripts de desarrollo configurados"
    fi
}

# Mostrar resumen final
show_summary() {
    echo ""
    echo "🎉 ¡Setup completado con éxito!"
    echo ""
    echo "📁 Estructura del proyecto:"
    echo "   ├── Osyris-Web/          # Frontend Next.js"
    echo "   │   ├── api-osyris/      # Backend Express.js"
    echo "   │   └── ...              # Componentes, páginas, etc."
    echo "   ├── scripts/             # Scripts de automatización"
    echo "   ├── .claude/             # Configuración Claude Code"
    echo "   └── .vscode/             # Configuración VS Code"
    echo ""
    echo "🚀 Comandos disponibles:"
    echo "   npm run dev              # Levantar frontend + backend"
    echo "   npm run test             # Ejecutar todos los tests"
    echo "   npm run build            # Build completo"
    echo "   npm run lint             # Linting completo"
    echo ""
    echo "🤖 Comandos de Claude Code:"
    echo "   /dev-start               # Iniciar desarrollo"
    echo "   /new-feature             # Nueva feature"
    echo "   /smart-commit            # Commit inteligente"
    echo "   /ui-analyze              # Analizar interfaz"
    echo "   /run-tests               # Suite de tests"
    echo ""
    echo "🌐 URLs de desarrollo:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend:  http://localhost:3000"
    echo "   API Docs: http://localhost:3000/api-docs"
    echo ""
    echo "📖 Próximos pasos:"
    echo "   1. Ejecutar: npm run dev"
    echo "   2. Abrir: http://localhost:3001"
    echo "   3. ¡Empezar a desarrollar!"
    echo ""
    echo "💡 Para ayuda adicional, consulta el README.md"
}

# Función principal
main() {
    echo "🎯 Iniciando setup de desarrollo para Osyris..."

    check_system_requirements
    setup_database
    install_dependencies
    setup_git_hooks
    setup_vscode
    create_root_package_scripts
    verify_setup
    show_summary

    log_success "¡Setup de desarrollo completado! 🎉"
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
#!/bin/bash
#
# Deploy Full Pipeline - Osyris Scout Management System
# Flujo completo: Commit → Staging → Verificar → Producción → Verificar
#
# Uso: ./scripts/deploy-full-pipeline.sh "feat(scope): mensaje del commit"
#

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs
STAGING_FRONTEND="http://116.203.98.142:3001"
STAGING_BACKEND="http://116.203.98.142:5001"
PROD_FRONTEND="https://gruposcoutosyris.es"
PROD_BACKEND="https://gruposcoutosyris.es"

# Tiempos de espera
STAGING_WAIT=90
PROD_WAIT=120

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

# Verificar argumento
if [ -z "$1" ]; then
    log_error "Uso: $0 \"tipo(scope): mensaje del commit\""
    log_info "Ejemplo: $0 \"feat(contacto): añadir validación de email\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           OSYRIS FULL DEPLOY PIPELINE v2.0                   ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Commit → Staging → Verificar → Producción → Verificar       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════════════════════
# PASO 0: Verificaciones Pre-Deploy
# ═══════════════════════════════════════════════════════════════════
log_info "PASO 0: Verificaciones Pre-Deploy..."

# Verificar que estamos en develop
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    log_warning "No estás en develop (actual: $CURRENT_BRANCH)"
    read -p "¿Cambiar a develop? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout develop
    else
        log_error "Abortando. Ejecuta desde la rama develop."
        exit 1
    fi
fi

# Verificar que no hay cambios sin commitear (aparte de los que vamos a añadir)
log_info "Verificando estado del repositorio..."
git status --short

# ═══════════════════════════════════════════════════════════════════
# PASO 1: Commit y Push a Develop
# ═══════════════════════════════════════════════════════════════════
echo ""
log_info "PASO 1: Commit y Push a Develop..."

# Añadir todos los cambios
git add -A

# Verificar que hay algo que commitear
if git diff --cached --quiet; then
    log_warning "No hay cambios para commitear"
    read -p "¿Continuar de todas formas? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
else
    # Crear commit
    git commit -m "$COMMIT_MESSAGE

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    log_success "Commit creado"
fi

# Pull para evitar conflictos
log_info "Sincronizando con origin..."
git pull origin develop --no-edit || true

# Push a develop
log_info "Push a develop..."
git push origin develop
log_success "Push a develop completado"

# ═══════════════════════════════════════════════════════════════════
# PASO 2: Esperar Deploy a Staging
# ═══════════════════════════════════════════════════════════════════
echo ""
log_info "PASO 2: Esperando deploy a staging (${STAGING_WAIT}s)..."

# Mostrar estado de GitHub Actions
if command -v gh &> /dev/null; then
    log_info "Últimos workflows:"
    gh run list --limit 3 2>/dev/null || true
fi

# Barra de progreso
for i in $(seq 1 $STAGING_WAIT); do
    printf "\r  Esperando: [%-50s] %d/%ds" $(printf '#%.0s' $(seq 1 $((i * 50 / STAGING_WAIT)))) $i $STAGING_WAIT
    sleep 1
done
echo ""

# ═══════════════════════════════════════════════════════════════════
# PASO 3: Verificar Staging
# ═══════════════════════════════════════════════════════════════════
echo ""
log_info "PASO 3: Verificando Staging..."

# Verificar frontend staging
STAGING_FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_FRONTEND" --max-time 10 || echo "000")
if [ "$STAGING_FRONTEND_STATUS" == "200" ]; then
    log_success "Frontend Staging: HTTP $STAGING_FRONTEND_STATUS ✓"
else
    log_error "Frontend Staging: HTTP $STAGING_FRONTEND_STATUS ✗"
    log_error "¡Staging frontend no responde! Abortando pipeline."
    exit 1
fi

# Verificar backend staging
STAGING_BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_BACKEND/api/health" --max-time 10 || echo "000")
if [ "$STAGING_BACKEND_STATUS" == "200" ]; then
    log_success "Backend Staging: HTTP $STAGING_BACKEND_STATUS ✓"
    # Mostrar detalles del health
    curl -s "$STAGING_BACKEND/api/health" 2>/dev/null | head -c 200 || true
    echo ""
else
    log_error "Backend Staging: HTTP $STAGING_BACKEND_STATUS ✗"
    log_error "¡Staging backend no responde! Abortando pipeline."
    exit 1
fi

log_success "Staging verificado correctamente"

# Preguntar antes de continuar a producción
echo ""
read -p "¿Staging OK? ¿Continuar a PRODUCCIÓN? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Pipeline pausado. Cambios están en staging."
    log_info "Para continuar manualmente:"
    log_info "  git checkout main && git merge develop && git push origin main"
    exit 0
fi

# ═══════════════════════════════════════════════════════════════════
# PASO 4: Promoción a Producción
# ═══════════════════════════════════════════════════════════════════
echo ""
log_info "PASO 4: Promoción a Producción..."

# Cambiar a main
git checkout main
git pull origin main

# Merge develop → main
log_info "Merge develop → main..."
git merge develop --no-edit

# Push a main
log_info "Push a main (activa deploy producción)..."
git push origin main
log_success "Push a main completado"

# ═══════════════════════════════════════════════════════════════════
# PASO 5: Esperar Deploy a Producción
# ═══════════════════════════════════════════════════════════════════
echo ""
log_info "PASO 5: Esperando deploy a producción (${PROD_WAIT}s)..."

for i in $(seq 1 $PROD_WAIT); do
    printf "\r  Esperando: [%-50s] %d/%ds" $(printf '#%.0s' $(seq 1 $((i * 50 / PROD_WAIT)))) $i $PROD_WAIT
    sleep 1
done
echo ""

# ═══════════════════════════════════════════════════════════════════
# PASO 6: Verificar Producción
# ═══════════════════════════════════════════════════════════════════
echo ""
log_info "PASO 6: Verificando Producción..."

# Verificar frontend producción
PROD_FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_FRONTEND" --max-time 15 || echo "000")
if [ "$PROD_FRONTEND_STATUS" == "200" ]; then
    log_success "Frontend Producción: HTTP $PROD_FRONTEND_STATUS ✓"
else
    log_error "Frontend Producción: HTTP $PROD_FRONTEND_STATUS ✗"
    log_error "¡PRODUCCIÓN FRONTEND FALLÓ!"
    log_warning "Considera ejecutar rollback: ./scripts/emergency-rollback.sh"
    exit 1
fi

# Verificar backend producción
PROD_BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_BACKEND/api/health" --max-time 15 || echo "000")
if [ "$PROD_BACKEND_STATUS" == "200" ]; then
    log_success "Backend Producción: HTTP $PROD_BACKEND_STATUS ✓"
    curl -s "$PROD_BACKEND/api/health" 2>/dev/null | head -c 200 || true
    echo ""
else
    log_error "Backend Producción: HTTP $PROD_BACKEND_STATUS ✗"
    log_error "¡PRODUCCIÓN BACKEND FALLÓ!"
    log_warning "Considera ejecutar rollback: ./scripts/emergency-rollback.sh"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════
# PASO 7: Finalización
# ═══════════════════════════════════════════════════════════════════
echo ""
log_info "PASO 7: Volviendo a develop..."
git checkout develop

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ ¡DEPLOY COMPLETO EXITOSO!                              ║"
echo "║                                                              ║"
echo "║   Staging:    $STAGING_FRONTEND                    ║"
echo "║   Producción: $PROD_FRONTEND               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

log_success "Pipeline completado. Rama actual: develop"

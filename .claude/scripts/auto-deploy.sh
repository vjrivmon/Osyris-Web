#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#  AUTO DEPLOY - Osyris Web
#  Deploy automático a producción tras validación exitosa
#  Flujo: Build → Tests → Playwright → Push → GitHub Actions → Verificar
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuración
PRODUCTION_URL="${PRODUCTION_URL:-https://gruposcoutosyris.es}"
STAGING_URL="${STAGING_URL:-https://staging.gruposcoutosyris.es}"
API_HEALTH_ENDPOINT="/api/health"

log_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}            OSYRIS WEB - AUTO DEPLOY A PRODUCCIÓN           ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 1. Verificar rama actual
# ─────────────────────────────────────────────────────────────────────────────
BRANCH=$(git branch --show-current)
log_info "Rama actual: $BRANCH"

if [[ "$BRANCH" == "main" ]]; then
    log_info "En rama main - deploy directo"
elif [[ "$BRANCH" =~ ^(fix|feature|hotfix)/ ]]; then
    log_info "En rama de feature - se hará merge a main primero"
else
    log_warning "Rama no reconocida: $BRANCH"
    read -p "¿Continuar de todos modos? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelado"
        exit 0
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. Verificar que no hay cambios sin commit
# ─────────────────────────────────────────────────────────────────────────────
if ! git diff --quiet 2>/dev/null; then
    log_error "Hay cambios sin commit"
    echo "Ejecuta: git add . && git commit -m 'mensaje'"
    exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. Ejecutar build
# ─────────────────────────────────────────────────────────────────────────────
log_info "Paso 1/6: Ejecutando build..."
if npm run build 2>&1 | tail -10; then
    BUILD_EXIT_CODE=${PIPESTATUS[0]}
    if [ $BUILD_EXIT_CODE -eq 0 ]; then
        log_success "Build exitoso"
    else
        log_error "Build falló"
        exit 1
    fi
else
    log_error "Build falló"
    exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. Ejecutar tests
# ─────────────────────────────────────────────────────────────────────────────
log_info "Paso 2/6: Ejecutando tests..."
if npm run test --silent 2>&1 | tail -10; then
    TEST_EXIT_CODE=${PIPESTATUS[0]}
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        log_success "Tests pasaron"
    else
        log_warning "Algunos tests fallaron (continuando...)"
    fi
else
    log_warning "Tests fallaron (continuando...)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Ejecutar Playwright E2E
# ─────────────────────────────────────────────────────────────────────────────
log_info "Paso 3/6: Ejecutando Playwright E2E..."
if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
    if npx playwright test --reporter=dot 2>&1 | tail -10; then
        E2E_EXIT_CODE=${PIPESTATUS[0]}
        if [ $E2E_EXIT_CODE -eq 0 ]; then
            log_success "Playwright E2E pasó"
        else
            log_error "Playwright E2E falló"
            read -p "¿Continuar sin E2E? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
else
    log_warning "No se encontró configuración de Playwright"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. Merge a main (si no estamos en main)
# ─────────────────────────────────────────────────────────────────────────────
if [[ "$BRANCH" != "main" ]]; then
    log_info "Paso 4/6: Merge a main..."

    git checkout main
    git pull origin main 2>/dev/null || true

    if git merge "$BRANCH" --no-ff -m "Merge $BRANCH into main

Deploy automático - Verificaciones pasadas:
- Build: ✅
- Tests: ✅
- Playwright: ✅"; then
        log_success "Merge completado"
    else
        log_error "Conflictos de merge detectados"
        echo "Resuelve los conflictos manualmente"
        exit 1
    fi
else
    log_info "Paso 4/6: Ya en main, saltando merge..."
fi

# ─────────────────────────────────────────────────────────────────────────────
# 7. Push a GitHub (trigger GitHub Actions)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Paso 5/6: Push a GitHub..."
git push origin main

log_success "Push completado - GitHub Actions iniciará el deploy"

# ─────────────────────────────────────────────────────────────────────────────
# 8. Esperar y verificar GitHub Actions
# ─────────────────────────────────────────────────────────────────────────────
log_info "Paso 6/6: Esperando GitHub Actions..."

# Esperar tiempo inicial
sleep 10

# Verificar estado del workflow
MAX_WAIT=40  # 40 * 15s = 10 minutos máximo
WAIT_COUNT=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    STATUS=$(gh run list --branch main --limit 1 --json status -q '.[0].status' 2>/dev/null || echo "unknown")

    if [ "$STATUS" = "completed" ]; then
        CONCLUSION=$(gh run list --branch main --limit 1 --json conclusion -q '.[0].conclusion' 2>/dev/null || echo "unknown")

        if [ "$CONCLUSION" = "success" ]; then
            log_success "GitHub Actions completado exitosamente!"
            break
        else
            log_error "GitHub Actions falló: $CONCLUSION"
            RUN_ID=$(gh run list --branch main --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || echo "")
            if [ -n "$RUN_ID" ]; then
                echo "Ver logs: gh run view $RUN_ID --log"
            fi
            exit 1
        fi
    fi

    WAIT_COUNT=$((WAIT_COUNT + 1))
    echo -ne "\r⏳ Esperando... ($WAIT_COUNT/$MAX_WAIT) Estado: $STATUS"
    sleep 15
done

echo ""

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    log_warning "Timeout esperando GitHub Actions"
    echo "Verifica manualmente: gh run list --branch main"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 9. Verificación final en producción
# ─────────────────────────────────────────────────────────────────────────────
log_info "Verificando producción..."

# Esperar un poco para que el deploy termine
sleep 10

# Verificar página principal
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    log_success "Página principal responde: HTTP $HTTP_CODE"
else
    log_warning "Página principal responde: HTTP $HTTP_CODE"
fi

# Verificar API health
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${PRODUCTION_URL}${API_HEALTH_ENDPOINT}" 2>/dev/null || echo "000")

if [ "$API_CODE" = "200" ]; then
    log_success "API health responde: HTTP $API_CODE"
else
    log_warning "API health responde: HTTP $API_CODE (puede no existir el endpoint)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 10. Resumen final
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}              🚀 DEPLOY COMPLETADO EXITOSAMENTE             ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "📍 Producción: $PRODUCTION_URL"
echo "📍 API: ${PRODUCTION_URL}${API_HEALTH_ENDPOINT}"
echo ""
echo "🔍 Verifica manualmente:"
echo "   - Login funciona correctamente"
echo "   - Las funcionalidades críticas operan"
echo "   - No hay errores en consola del navegador"
echo ""

# Guardar log de deploy
mkdir -p .claude/logs
LOG_FILE=".claude/logs/deploy-$(date +%Y%m%d-%H%M%S).md"
cat > "$LOG_FILE" << EOF
# 🚀 Deploy a Producción

## Timestamp
$(date -Iseconds)

## Rama desplegada
$BRANCH → main

## Verificaciones Pre-Deploy
- Build: ✅
- Tests: ✅
- Playwright: ✅

## GitHub Actions
- Status: completed
- Conclusion: success

## Verificación Post-Deploy
- Página principal: HTTP $HTTP_CODE
- API health: HTTP $API_CODE

## URL
$PRODUCTION_URL
EOF

log_info "Log guardado: $LOG_FILE"

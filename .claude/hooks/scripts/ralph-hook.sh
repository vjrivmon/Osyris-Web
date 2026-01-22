#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  RALPH HOOK - Osyris Web
#  Stop Hook para Ralph Wiggum Loops con verificación automática
#  Ejecuta build + tests + playwright antes de marcar como completo
# ═══════════════════════════════════════════════════════════════════════════

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
# Función: Ejecutar verificaciones (build, test, playwright)
# ─────────────────────────────────────────────────────────────────────────────
run_verifications() {
    local ERRORS=""

    echo -e "${CYAN}🔍 Ejecutando verificaciones...${NC}"

    # 1. TypeScript/ESLint Check
    echo -e "${CYAN}  → Verificando tipos y lint...${NC}"
    if ! npm run lint --silent 2>/dev/null; then
        ERRORS="$ERRORS\n- Lint falló"
    fi

    # 2. Build
    echo -e "${CYAN}  → Ejecutando build...${NC}"
    if ! npm run build --silent 2>&1; then
        ERRORS="$ERRORS\n- Build falló"
    fi

    # 3. Tests unitarios
    echo -e "${CYAN}  → Ejecutando tests...${NC}"
    if ! npm run test --silent 2>&1; then
        ERRORS="$ERRORS\n- Tests fallaron"
    fi

    # 4. Playwright E2E (solo tests relacionados si existe PROMPT.md)
    if [ -f "$PROJECT_DIR/.claude/PROMPT.md" ]; then
        TEST_PATTERN=$(grep -oP 'tests/e2e/\S+\.spec\.ts' "$PROJECT_DIR/.claude/PROMPT.md" 2>/dev/null | head -1)
        if [ -n "$TEST_PATTERN" ]; then
            echo -e "${CYAN}  → Ejecutando Playwright: $TEST_PATTERN...${NC}"
            if ! npx playwright test "$TEST_PATTERN" --reporter=dot 2>&1; then
                ERRORS="$ERRORS\n- Playwright E2E falló"
            fi
        fi
    fi

    if [ -n "$ERRORS" ]; then
        echo -e "${RED}❌ Verificaciones fallaron:${NC}"
        echo -e "$ERRORS"
        return 1
    else
        echo -e "${GREEN}✅ Todas las verificaciones pasaron${NC}"
        return 0
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Verificar si la tarea está completada
# ─────────────────────────────────────────────────────────────────────────────
if [ -f "$PROJECT_DIR/.claude/COMPLETE" ]; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}              ✅ TAREA MARCADA COMO COMPLETADA              ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    # Ejecutar verificaciones finales
    cd "$PROJECT_DIR"
    if run_verifications; then
        # Limpiar archivos de Ralph
        rm -f "$PROJECT_DIR/.claude/COMPLETE" "$PROJECT_DIR/.claude/ralph-active"
        rm -f "$PROJECT_DIR/.claude/.ralph-iteration"

        # Crear marker de éxito
        touch "$PROJECT_DIR/.claude/RALPH_SUCCESS"

        # Guardar log de sesión completada
        mkdir -p "$PROJECT_DIR/.claude/logs"
        LOG_FILE="$PROJECT_DIR/.claude/logs/ralph-complete-$(date +%Y%m%d-%H%M%S).md"
        cat > "$LOG_FILE" << EOF
# ✅ Sesión Ralph Completada Exitosamente

## Timestamp
$(date -Iseconds)

## Rama
$(git branch --show-current 2>/dev/null || echo "N/A")

## Commits de la Sesión
$(git log --oneline -10 2>/dev/null || echo "No hay commits")

## Archivos Modificados
$(git diff --stat HEAD~5 2>/dev/null || echo "No hay historial")

## Verificaciones
- Build: ✅ Pasó
- Tests: ✅ Pasó
- Playwright: ✅ Pasó

## Próximo Paso
Ejecutar: /osyris-deploy-now para desplegar a producción
EOF

        echo -e "${CYAN}📝 Log guardado: $LOG_FILE${NC}"
        echo ""
        echo -e "${GREEN}🚀 Listo para deploy!${NC}"
        echo "   Ejecuta: /osyris-deploy-now"
        echo ""
    else
        echo -e "${YELLOW}⚠️  Verificaciones fallaron - Reactivando Ralph Loop${NC}"
        rm -f "$PROJECT_DIR/.claude/COMPLETE"
        touch "$PROJECT_DIR/.claude/ralph-active"
    fi

    exit 0
fi

# ─────────────────────────────────────────────────────────────────────────────
# Verificar si Ralph está activo
# ─────────────────────────────────────────────────────────────────────────────
if [ -f "$PROJECT_DIR/.claude/ralph-active" ]; then
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}              🔄 RALPH LOOP ACTIVO                          ${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    if [ -f "$PROJECT_DIR/.claude/PROMPT.md" ]; then
        # Incrementar contador de iteraciones
        ITERATION_FILE="$PROJECT_DIR/.claude/.ralph-iteration"
        if [ -f "$ITERATION_FILE" ]; then
            ITERATION=$(cat "$ITERATION_FILE")
            ITERATION=$((ITERATION + 1))
        else
            ITERATION=1
        fi
        echo "$ITERATION" > "$ITERATION_FILE"

        # Safety: máximo 30 iteraciones
        if [ "$ITERATION" -ge 30 ]; then
            echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${RED}  ⚠️  LÍMITE DE ITERACIONES ALCANZADO (30)                  ${NC}"
            echo -e "${RED}  Pausando loop - intervención humana requerida            ${NC}"
            echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
            rm -f "$PROJECT_DIR/.claude/ralph-active"
            rm -f "$ITERATION_FILE"
            exit 0
        fi

        # Tracking de errores repetidos
        ERROR_TRACK_FILE="$PROJECT_DIR/.claude/.ralph-errors"
        LAST_ERROR=$(cat "$ERROR_TRACK_FILE" 2>/dev/null || echo "")

        echo -e "${CYAN}📊 Iteración: $ITERATION/30${NC}"
        echo ""

        # Reinyectar el prompt
        echo -e "${CYAN}Reinyectando prompt...${NC}"
        echo ""
        cat "$PROJECT_DIR/.claude/PROMPT.md"

        # Exit code 2 indica que debe continuar
        exit 2
    else
        echo -e "${RED}❌ Error: No se encontró PROMPT.md${NC}"
        rm -f "$PROJECT_DIR/.claude/ralph-active"
        exit 0
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# Sin Ralph activo - comportamiento normal
# ─────────────────────────────────────────────────────────────────────────────
exit 0

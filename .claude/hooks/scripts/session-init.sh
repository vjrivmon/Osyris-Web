#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  SESSION INIT - Osyris Web Development Environment
#  Se ejecuta al iniciar cada sesión de Claude Code
# ═══════════════════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
OSYRIS_VERSION="2.1.0"

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}       OSYRIS WEB - Sesión de Desarrollo Iniciada          ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Cargar variables de entorno
if [ -f "$PROJECT_DIR/.env" ]; then
    echo -e "${GREEN}✓${NC} Cargando .env..."
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs -d '\n' 2>/dev/null) || true
fi

if [ -f "$PROJECT_DIR/.env.local" ]; then
    echo -e "${GREEN}✓${NC} Cargando .env.local..."
    export $(grep -v '^#' "$PROJECT_DIR/.env.local" | xargs -d '\n' 2>/dev/null) || true
fi

# 2. Verificar dependencias de Node.js
if [ -f "$PROJECT_DIR/package.json" ]; then
    if [ ! -d "$PROJECT_DIR/node_modules" ]; then
        echo -e "${YELLOW}⚠${NC} Instalando dependencias frontend..."
        cd "$PROJECT_DIR" && npm install --prefer-offline --no-audit > /dev/null 2>&1 || true
        cd - > /dev/null
    else
        echo -e "${GREEN}✓${NC} Dependencias frontend OK"
    fi
fi

# 3. Verificar dependencias del backend
if [ -f "$PROJECT_DIR/api-osyris/package.json" ]; then
    if [ ! -d "$PROJECT_DIR/api-osyris/node_modules" ]; then
        echo -e "${YELLOW}⚠${NC} Instalando dependencias backend..."
        cd "$PROJECT_DIR/api-osyris" && npm install --prefer-offline --no-audit > /dev/null 2>&1 || true
        cd - > /dev/null
    else
        echo -e "${GREEN}✓${NC} Dependencias backend OK"
    fi
fi

# 4. Verificar Docker y PostgreSQL
if command -v docker &> /dev/null; then
    POSTGRES_RUNNING=$(docker ps --filter "name=osyris" --filter "status=running" -q 2>/dev/null)
    if [ -n "$POSTGRES_RUNNING" ]; then
        echo -e "${GREEN}✓${NC} PostgreSQL Docker corriendo"
    else
        echo -e "${YELLOW}⚠${NC} PostgreSQL Docker no está corriendo"
        echo "  Ejecuta: docker-compose up -d osyris-db"
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker no disponible"
fi

# 5. Estado de Git
if [ -d "$PROJECT_DIR/.git" ]; then
    BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "desconocido")
    STATUS=$(git -C "$PROJECT_DIR" status --porcelain 2>/dev/null | wc -l)
    LAST_COMMIT=$(git -C "$PROJECT_DIR" log --oneline -1 2>/dev/null | cut -c1-50)

    echo ""
    echo -e "${CYAN}Git Info:${NC}"
    echo -e "  Rama: ${GREEN}$BRANCH${NC}"
    echo -e "  Archivos modificados: $STATUS"
    echo -e "  Último commit: $LAST_COMMIT"
fi

# 6. Verificar worktrees activos
if [ -d "$PROJECT_DIR/trees" ]; then
    WORKTREE_COUNT=$(ls -1 "$PROJECT_DIR/trees" 2>/dev/null | wc -l)
    if [ "$WORKTREE_COUNT" -gt 0 ]; then
        echo ""
        echo -e "${CYAN}Worktrees activos: $WORKTREE_COUNT${NC}"
        for dir in "$PROJECT_DIR/trees"/*; do
            if [ -d "$dir" ]; then
                name=$(basename "$dir")
                if [ -f "$dir/.claude/ralph-active" ]; then
                    echo -e "  ${YELLOW}🔄${NC} $name (Ralph activo)"
                elif [ -f "$dir/.claude/COMPLETE" ]; then
                    echo -e "  ${GREEN}✅${NC} $name (Completado)"
                else
                    echo -e "  ⏸️  $name"
                fi
            fi
        done
    fi
fi

# 7. Verificar issues pendientes
if [ -d "$PROJECT_DIR/.claude/skills/issues" ]; then
    ISSUES_COUNT=$(ls -1 "$PROJECT_DIR/.claude/skills/issues" 2>/dev/null | wc -l)
    if [ "$ISSUES_COUNT" -gt 0 ]; then
        echo ""
        echo -e "${CYAN}Skills de issues disponibles: $ISSUES_COUNT${NC}"
    fi
fi

# 8. Mostrar información del proyecto
echo ""
echo -e "${CYAN}Proyecto: Osyris Scout Management System v$OSYRIS_VERSION${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Comandos disponibles:"
echo "  /osyris-workflow-start  - Ver estado y comenzar tarea"
echo "  /osyris-fix-issue       - Arreglar un issue específico"
echo "  /ralph-loop             - Iniciar loop de verificación"
echo "  /osyris-deploy-now      - Deploy a producción"
echo ""

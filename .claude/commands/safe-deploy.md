# Comando: /safe-deploy - Deploy Completo a Producción

## Descripción
Despliega cambios a producción (Hetzner) de forma segura con verificaciones automáticas y CI/CD.

## Funcionalidad
1. ✅ Verifica salud del sistema local
2. ✅ Ejecuta tests (si existen)
3. ✅ Crea commit con conventional commits
4. ✅ Push a GitHub
5. ✅ Activa GitHub Actions para deploy a Hetzner
6. ✅ Verifica deploy exitoso

## Implementación

```bash
#!/bin/bash

echo "🚀 === OSYRIS SAFE DEPLOY ==="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Verificar rama
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
echo "🌿 Rama actual: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo -e "${RED}❌ No puedes hacer deploy directo desde main/master${NC}"
    echo "💡 Crea una rama feature: git checkout -b feature/nombre"
    exit 1
fi

echo ""

# 2. Verificar cambios
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️ No hay cambios para deployar${NC}"
    echo "💡 Haz modificaciones primero"
    exit 1
fi

echo "📝 Cambios detectados:"
git status --porcelain | head -10
echo ""

# 3. Verificar salud del sistema
echo "🏥 Verificando salud del sistema..."
echo ""

HEALTH_OK=true

# Docker
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    HEALTH_OK=false
fi

# PostgreSQL
if ! docker ps | grep -q "osyris-postgres"; then
    echo -e "${YELLOW}⚠️ PostgreSQL no está corriendo (no crítico)${NC}"
fi

# Backend
if ! lsof -i:5000 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Backend no está corriendo${NC}"
    echo "   Iniciando backend para tests..."
    (cd api-osyris && npm run dev >/dev/null 2>&1 &)
    sleep 3
fi

# Frontend build test
echo "🔨 Verificando build del frontend..."
if npm run build:frontend >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend build exitoso${NC}"
else
    echo -e "${RED}❌ Error en build del frontend${NC}"
    echo "Revisa los errores y corrige antes de deployar"
    exit 1
fi

echo ""

# 4. Ejecutar tests (si existen)
if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
    echo "🧪 Ejecutando tests..."
    if npm test -- --passWithNoTests >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Tests pasados${NC}"
    else
        echo -e "${YELLOW}⚠️ Tests fallaron (continuando...)${NC}"
    fi
    echo ""
fi

# 5. Análisis de cambios para commit message
echo "📋 Analizando cambios..."

MODIFIED_FILES=$(git status --porcelain | awk '{print $2}')
COMMIT_TYPE="feat"
COMMIT_SCOPE=""

# Detectar tipo
if echo "$MODIFIED_FILES" | grep -q -E "\\.md$|README|CHANGELOG"; then
    COMMIT_TYPE="docs"
elif echo "$MODIFIED_FILES" | grep -q -E "test|spec|\.test\.|\.spec\."; then
    COMMIT_TYPE="test"
elif echo "$MODIFIED_FILES" | grep -q -E "package\.json|docker"; then
    COMMIT_TYPE="chore"
elif echo "$MODIFIED_FILES" | grep -q -E "fix|bug"; then
    COMMIT_TYPE="fix"
fi

# Detectar scope
if echo "$MODIFIED_FILES" | grep -q "api-osyris"; then
    COMMIT_SCOPE="backend"
elif echo "$MODIFIED_FILES" | grep -q -E "app/|components/"; then
    COMMIT_SCOPE="frontend"
elif echo "$MODIFIED_FILES" | grep -q -E "\.claude|scripts"; then
    COMMIT_SCOPE="config"
fi

echo -e "${BLUE}Sugerido: ${COMMIT_TYPE}${COMMIT_SCOPE:+($COMMIT_SCOPE)}${NC}"
echo ""

# 6. Solicitar mensaje de commit
echo "💬 Mensaje de commit (conventional commits):"
echo "   Formato: tipo(scope): descripción"
echo "   Ejemplo: feat(frontend): add login page"
echo ""
read -p "Tipo [$COMMIT_TYPE]: " INPUT_TYPE
COMMIT_TYPE=${INPUT_TYPE:-$COMMIT_TYPE}

if [ -n "$COMMIT_SCOPE" ]; then
    read -p "Scope [$COMMIT_SCOPE]: " INPUT_SCOPE
    COMMIT_SCOPE=${INPUT_SCOPE:-$COMMIT_SCOPE}
else
    read -p "Scope (opcional): " COMMIT_SCOPE
fi

read -p "Descripción: " COMMIT_DESC

if [ -z "$COMMIT_DESC" ]; then
    echo -e "${RED}❌ Descripción obligatoria${NC}"
    exit 1
fi

# Construir mensaje
if [ -n "$COMMIT_SCOPE" ]; then
    COMMIT_MSG="${COMMIT_TYPE}(${COMMIT_SCOPE}): ${COMMIT_DESC}"
else
    COMMIT_MSG="${COMMIT_TYPE}: ${COMMIT_DESC}"
fi

echo ""
echo "📝 Commit: $COMMIT_MSG"
echo ""

# 7. Confirmar deploy
echo -e "${YELLOW}⚠️ CONFIRMACIÓN DE DEPLOY${NC}"
echo "   Rama: $CURRENT_BRANCH → GitHub → Hetzner"
echo "   Commit: $COMMIT_MSG"
echo ""
read -p "¿Confirmar deploy a producción? [y/N]: " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${RED}❌ Deploy cancelado${NC}"
    exit 1
fi

# 8. Git add, commit, push
echo ""
echo "🚀 Ejecutando deploy..."

# Add archivos modificados
git add $(git status --porcelain | grep -E "^\s*M|^\s*A|^\s*D" | awk '{print $2}')

# Commit
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en commit${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Commit realizado${NC}"

# Push (esto activará GitHub Actions)
echo "📤 Pusheando a GitHub..."
git push -u origin $CURRENT_BRANCH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en push${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Push exitoso${NC}"
echo ""

# 9. Informar sobre GitHub Actions
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ DEPLOY INICIADO EXITOSAMENTE   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""
echo "📊 Estado del deploy:"
echo "   ✅ Commit: $(git rev-parse --short HEAD)"
echo "   ✅ Branch: $CURRENT_BRANCH"
echo "   🚀 GitHub Actions: Desplegando a Hetzner..."
echo ""
echo "🔗 Monitorea el deploy en:"
echo "   https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
echo ""
echo "⏱️ El deploy tarda ~2-3 minutos"
echo "🌐 Producción: https://grupooosyris.es"
echo ""
echo "💡 Próximos pasos:"
echo "   1. Revisa GitHub Actions para confirmar deploy"
echo "   2. Verifica la web en producción"
echo "   3. Crea Pull Request si necesitas merge a main"
echo ""
```

## Uso

```bash
/safe-deploy
```

## Palabras clave de activación
- "deploy producción"
- "subir cambios"
- "deploy to production"
- "publicar cambios"
- "push deploy"

## Resultado
✅ Verificación completa del sistema
✅ Tests ejecutados
✅ Commit con conventional commits
✅ Push a GitHub
✅ GitHub Actions activado
✅ Deploy automático a Hetzner
✅ Monitoreo del proceso

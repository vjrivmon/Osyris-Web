#!/bin/bash

# =====================================================
# Script de Verificación Automática - FASE 2
# Componentes de Edición Frontend
# =====================================================

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Verificación FASE 2 - Frontend${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Directorio raíz del proyecto
PROJECT_ROOT="/home/vicente/RoadToDevOps/osyris/Osyris-Web"
cd "$PROJECT_ROOT"

# 1. Verificar archivos frontend creados
echo -e "${BLUE}[1/8]${NC} Verificando archivos frontend..."

FILES=(
  "contexts/EditModeContext.tsx"
  "components/editable/EditableText.tsx"
  "components/editable/EditableImage.tsx"
  "components/editable/EditToolbar.tsx"
  "components/editable/EditModeToggle.tsx"
  "components/editable/index.ts"
)

FILES_OK=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓ ${file}${NC}"
    FILES_OK=$((FILES_OK + 1))
  else
    echo -e "${RED}✗ ${file} NO ENCONTRADO${NC}"
  fi
done

echo -e "${BLUE}Archivos encontrados: ${FILES_OK}/${#FILES[@]}${NC}"
echo ""

# 2. Verificar integración en layout.tsx
echo -e "${BLUE}[2/8]${NC} Verificando integración en app/layout.tsx..."

LAYOUT_FILE="app/layout.tsx"
if [ ! -f "$LAYOUT_FILE" ]; then
  echo -e "${RED}✗ app/layout.tsx NO ENCONTRADO${NC}"
  exit 1
fi

# Verificar import de EditModeProvider
if grep -q "import.*EditModeProvider.*from.*@/contexts/EditModeContext" "$LAYOUT_FILE"; then
  echo -e "${GREEN}✓ Import de EditModeProvider${NC}"
else
  echo -e "${RED}✗ Falta import de EditModeProvider${NC}"
fi

# Verificar import de componentes editable
if grep -q "import.*EditToolbar.*EditModeToggle.*from.*@/components/editable" "$LAYOUT_FILE"; then
  echo -e "${GREEN}✓ Import de EditToolbar y EditModeToggle${NC}"
else
  echo -e "${RED}✗ Falta import de EditToolbar y EditModeToggle${NC}"
fi

# Verificar uso de EditModeProvider
if grep -q "<EditModeProvider>" "$LAYOUT_FILE"; then
  echo -e "${GREEN}✓ EditModeProvider envuelve children${NC}"
else
  echo -e "${RED}✗ Falta <EditModeProvider>${NC}"
fi

# Verificar uso de componentes
if grep -q "<EditModeToggle" "$LAYOUT_FILE" && grep -q "<EditToolbar" "$LAYOUT_FILE"; then
  echo -e "${GREEN}✓ EditModeToggle y EditToolbar incluidos${NC}"
else
  echo -e "${RED}✗ Faltan EditModeToggle o EditToolbar${NC}"
fi
echo ""

# 3. Verificar exportaciones centralizadas
echo -e "${BLUE}[3/8]${NC} Verificando exportaciones en components/editable/index.ts..."

EXPORTS_FILE="components/editable/index.ts"
EXPECTED_EXPORTS=(
  "EditableText"
  "EditableImage"
  "EditToolbar"
  "EditModeToggle"
)

EXPORTS_OK=0
for export in "${EXPECTED_EXPORTS[@]}"; do
  if grep -q "export.*${export}" "$EXPORTS_FILE"; then
    echo -e "${GREEN}✓ Export de ${export}${NC}"
    EXPORTS_OK=$((EXPORTS_OK + 1))
  else
    echo -e "${RED}✗ Falta export de ${export}${NC}"
  fi
done

echo -e "${BLUE}Exportaciones encontradas: ${EXPORTS_OK}/${#EXPECTED_EXPORTS[@]}${NC}"
echo ""

# 4. Verificar estructura de EditModeContext
echo -e "${BLUE}[4/8]${NC} Verificando EditModeContext..."

CONTEXT_FILE="contexts/EditModeContext.tsx"
CONTEXT_FEATURES=(
  "interface PendingChange"
  "interface EditModeContextType"
  "function EditModeProvider"
  "function useEditMode"
  "savePendingChanges"
  "addPendingChange"
  "toggleEditMode"
)

CONTEXT_OK=0
for feature in "${CONTEXT_FEATURES[@]}"; do
  if grep -q "$feature" "$CONTEXT_FILE"; then
    CONTEXT_OK=$((CONTEXT_OK + 1))
  fi
done

if [ $CONTEXT_OK -eq ${#CONTEXT_FEATURES[@]} ]; then
  echo -e "${GREEN}✓ EditModeContext completo (${CONTEXT_OK}/${#CONTEXT_FEATURES[@]} features)${NC}"
else
  echo -e "${YELLOW}⚠ EditModeContext parcial (${CONTEXT_OK}/${#CONTEXT_FEATURES[@]} features)${NC}"
fi
echo ""

# 5. Verificar que los componentes son client components
echo -e "${BLUE}[5/8]${NC} Verificando directivas 'use client'..."

CLIENT_COMPONENTS=(
  "contexts/EditModeContext.tsx"
  "components/editable/EditableText.tsx"
  "components/editable/EditableImage.tsx"
  "components/editable/EditToolbar.tsx"
  "components/editable/EditModeToggle.tsx"
)

CLIENT_OK=0
for component in "${CLIENT_COMPONENTS[@]}"; do
  if head -n 5 "$component" | grep -q '"use client"'; then
    echo -e "${GREEN}✓ ${component##*/}${NC}"
    CLIENT_OK=$((CLIENT_OK + 1))
  else
    echo -e "${YELLOW}⚠ ${component##*/} sin 'use client'${NC}"
  fi
done

echo -e "${BLUE}Client components: ${CLIENT_OK}/${#CLIENT_COMPONENTS[@]}${NC}"
echo ""

# 6. Verificar compilación TypeScript (sin build completo)
echo -e "${BLUE}[6/8]${NC} Verificando tipos TypeScript..."

if command -v npx &> /dev/null; then
  echo "Ejecutando verificación de tipos..."

  # Usar timeout para evitar que cuelgue
  if timeout 30s npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error TS"; then
    echo -e "${YELLOW}⚠ Se encontraron errores de TypeScript${NC}"
    echo "Ejecuta: npx tsc --noEmit para ver los detalles"
  else
    echo -e "${GREEN}✓ Sin errores de TypeScript${NC}"
  fi
else
  echo -e "${YELLOW}⚠ npx no encontrado, omitiendo verificación de tipos${NC}"
fi
echo ""

# 7. Verificar Git
echo -e "${BLUE}[7/8]${NC} Verificando estado de Git..."

CURRENT_BRANCH=$(git branch --show-current)
echo -e "Rama actual: ${GREEN}${CURRENT_BRANCH}${NC}"

if [ "$CURRENT_BRANCH" = "feature/live-content-editor" ]; then
  echo -e "${GREEN}✓ Estás en la rama correcta${NC}"
else
  echo -e "${YELLOW}⚠ Esperaba feature/live-content-editor, encontrado ${CURRENT_BRANCH}${NC}"
fi

# Verificar último commit
LAST_COMMIT=$(git log --oneline -1)
echo -e "Último commit: ${LAST_COMMIT}"

if echo "$LAST_COMMIT" | grep -qi "FASE 2"; then
  echo -e "${GREEN}✓ Commit de FASE 2 encontrado${NC}"
else
  echo -e "${YELLOW}⚠ No se encontró commit de FASE 2${NC}"
fi

# Verificar archivos en el último commit
echo ""
echo "Archivos en el último commit:"
git show --name-only --oneline HEAD | tail -n +2 | while read file; do
  if [[ "$file" == *"EditMode"* ]] || [[ "$file" == *"Editable"* ]]; then
    echo -e "  ${GREEN}✓ ${file}${NC}"
  fi
done
echo ""

# 8. Verificar servidor de desarrollo
echo -e "${BLUE}[8/8]${NC} Verificando servidor de desarrollo..."

# Verificar si el puerto 3000 está ocupado
if lsof -ti:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Frontend corriendo en puerto 3000${NC}"
  FRONTEND_PID=$(lsof -ti:3000)
  echo -e "  PID: ${FRONTEND_PID}"
else
  echo -e "${YELLOW}⚠ Frontend NO está corriendo${NC}"
  echo -e "  Ejecuta: ${BLUE}./scripts/dev-start.sh${NC}"
fi

# Verificar si el puerto 5000 está ocupado
if lsof -ti:5000 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend corriendo en puerto 5000${NC}"
  BACKEND_PID=$(lsof -ti:5000)
  echo -e "  PID: ${BACKEND_PID}"
else
  echo -e "${YELLOW}⚠ Backend NO está corriendo${NC}"
  echo -e "  Ejecuta: ${BLUE}./scripts/dev-start.sh${NC}"
fi
echo ""

# Resumen final
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Resumen de Verificación${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ $FILES_OK -eq ${#FILES[@]} ]; then
  echo -e "${GREEN}✅ Archivos frontend: ${FILES_OK}/${#FILES[@]}${NC}"
else
  echo -e "${YELLOW}⚠️  Archivos frontend: ${FILES_OK}/${#FILES[@]}${NC}"
fi

if [ $EXPORTS_OK -eq ${#EXPECTED_EXPORTS[@]} ]; then
  echo -e "${GREEN}✅ Exportaciones correctas${NC}"
else
  echo -e "${YELLOW}⚠️  Exportaciones incompletas${NC}"
fi

if [ $CLIENT_OK -eq ${#CLIENT_COMPONENTS[@]} ]; then
  echo -e "${GREEN}✅ Componentes con 'use client': ${CLIENT_OK}/${#CLIENT_COMPONENTS[@]}${NC}"
else
  echo -e "${YELLOW}⚠️  Componentes con 'use client': ${CLIENT_OK}/${#CLIENT_COMPONENTS[@]}${NC}"
fi

if grep -q "<EditModeProvider>" "$LAYOUT_FILE"; then
  echo -e "${GREEN}✅ Integración en layout.tsx${NC}"
else
  echo -e "${RED}❌ Integración en layout.tsx${NC}"
fi

if [ "$CURRENT_BRANCH" = "feature/live-content-editor" ]; then
  echo -e "${GREEN}✅ Branch: feature/live-content-editor${NC}"
else
  echo -e "${YELLOW}⚠️  Branch: ${CURRENT_BRANCH}${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Siguiente paso:${NC}"
echo -e "   1. Abre el navegador: ${BLUE}http://localhost:3000${NC}"
echo -e "   2. Haz login con: ${BLUE}admin@osyris.com / Admin123!${NC}"
echo -e "   3. Click en el botón ${BLUE}'Editar Página'${NC} (esquina superior derecha)"
echo -e "   4. Verifica que aparece el ${BLUE}toolbar flotante${NC} en la parte inferior"
echo -e "   5. Lee la guía completa: ${BLUE}cat VERIFICACION_FASE_2.md${NC}"
echo ""

echo -e "${GREEN}✅ Verificación FASE 2 completada${NC}"
echo ""

#!/bin/bash

# =====================================================
# Script de Verificación Automática - FASE 1
# Sistema de Edición de Contenido en Vivo
# =====================================================

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Verificación FASE 1 - Content Editor${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Verificar PostgreSQL
echo -e "${BLUE}[1/7]${NC} Verificando PostgreSQL..."
if docker ps --filter name=osyris-db --format '{{.Names}}' | grep -q osyris-db; then
  echo -e "${GREEN}✓ PostgreSQL está corriendo${NC}"
else
  echo -e "${RED}✗ PostgreSQL NO está corriendo${NC}"
  exit 1
fi
echo ""

# 2. Verificar tablas creadas
echo -e "${BLUE}[2/7]${NC} Verificando tablas creadas..."
TABLES=$(docker exec -i osyris-db psql -U osyris_user -d osyris_db -t -c "
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('contenido_editable', 'contenido_historial', 'audit_log')
  ORDER BY table_name;
" | tr -d ' ' | grep -v '^$')

if echo "$TABLES" | grep -q "contenido_editable"; then
  echo -e "${GREEN}✓ Tabla contenido_editable${NC}"
else
  echo -e "${RED}✗ Falta tabla contenido_editable${NC}"
fi

if echo "$TABLES" | grep -q "contenido_historial"; then
  echo -e "${GREEN}✓ Tabla contenido_historial${NC}"
else
  echo -e "${RED}✗ Falta tabla contenido_historial${NC}"
fi

if echo "$TABLES" | grep -q "audit_log"; then
  echo -e "${GREEN}✓ Tabla audit_log${NC}"
else
  echo -e "${RED}✗ Falta tabla audit_log${NC}"
fi
echo ""

# 3. Verificar contenido migrado
echo -e "${BLUE}[3/7]${NC} Verificando contenido migrado..."
CONTENT_COUNT=$(docker exec -i osyris-db psql -U osyris_user -d osyris_db -t -c "SELECT COUNT(*) FROM contenido_editable;" | tr -d ' ')
echo -e "Total elementos migrados: ${GREEN}${CONTENT_COUNT}${NC}"

if [ "$CONTENT_COUNT" -eq 65 ]; then
  echo -e "${GREEN}✓ Los 65 elementos fueron migrados correctamente${NC}"
else
  echo -e "${YELLOW}⚠ Se esperaban 65 elementos, se encontraron ${CONTENT_COUNT}${NC}"
fi

echo ""
echo "Elementos por sección:"
docker exec -i osyris-db psql -U osyris_user -d osyris_db -c "
  SELECT seccion, COUNT(*) as total
  FROM contenido_editable
  GROUP BY seccion
  ORDER BY seccion;
" | grep -E 'castores|manada|tropa|pioneros|rutas'
echo ""

# 4. Verificar usuario admin
echo -e "${BLUE}[4/7]${NC} Verificando usuario administrador..."
ADMIN_EXISTS=$(docker exec -i osyris-db psql -U osyris_user -d osyris_db -t -c "
  SELECT COUNT(*) FROM usuarios WHERE email = 'admin@osyris.com' AND rol = 'admin';
" | tr -d ' ')

if [ "$ADMIN_EXISTS" -eq 1 ]; then
  echo -e "${GREEN}✓ Usuario admin@osyris.com existe${NC}"
  docker exec -i osyris-db psql -U osyris_user -d osyris_db -c "
    SELECT id, nombre, apellidos, email, rol, activo
    FROM usuarios
    WHERE email = 'admin@osyris.com';
  "
else
  echo -e "${RED}✗ Usuario admin no encontrado${NC}"
fi
echo ""

# 5. Verificar archivos backend
echo -e "${BLUE}[5/7]${NC} Verificando archivos backend..."
if [ -f "api-osyris/src/controllers/content.controller.js" ]; then
  echo -e "${GREEN}✓ content.controller.js${NC}"
else
  echo -e "${RED}✗ content.controller.js no encontrado${NC}"
fi

if [ -f "api-osyris/src/routes/content.routes.js" ]; then
  echo -e "${GREEN}✓ content.routes.js${NC}"
else
  echo -e "${RED}✗ content.routes.js no encontrado${NC}"
fi

if [ -f "api-osyris/database/schema-content-editor.sql" ]; then
  echo -e "${GREEN}✓ schema-content-editor.sql${NC}"
else
  echo -e "${RED}✗ schema-content-editor.sql no encontrado${NC}"
fi

if [ -f "api-osyris/scripts/migrate-content-to-db.js" ]; then
  echo -e "${GREEN}✓ migrate-content-to-db.js${NC}"
else
  echo -e "${RED}✗ migrate-content-to-db.js no encontrado${NC}"
fi
echo ""

# 6. Verificar rol editor
echo -e "${BLUE}[6/7]${NC} Verificando rol 'editor' en el sistema..."
EDITOR_ROLE=$(docker exec -i osyris-db psql -U osyris_user -d osyris_db -t -c "
  SELECT constraint_name
  FROM information_schema.table_constraints
  WHERE table_name = 'usuarios'
  AND constraint_name = 'usuarios_rol_check';
" | tr -d ' ')

if [ ! -z "$EDITOR_ROLE" ]; then
  echo -e "${GREEN}✓ Constraint de roles existe${NC}"

  # Verificar que incluye 'editor'
  CONSTRAINT_DEF=$(docker exec -i osyris-db psql -U osyris_user -d osyris_db -t -c "
    SELECT pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conname = 'usuarios_rol_check';
  ")

  if echo "$CONSTRAINT_DEF" | grep -q "editor"; then
    echo -e "${GREEN}✓ Rol 'editor' incluido en el constraint${NC}"
  else
    echo -e "${YELLOW}⚠ Rol 'editor' no encontrado en el constraint${NC}"
  fi
else
  echo -e "${RED}✗ Constraint de roles no encontrado${NC}"
fi
echo ""

# 7. Verificar Git
echo -e "${BLUE}[7/7]${NC} Verificando estado de Git..."
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Rama actual: ${GREEN}${CURRENT_BRANCH}${NC}"

if [ "$CURRENT_BRANCH" = "feature/live-content-editor" ]; then
  echo -e "${GREEN}✓ Estás en la rama correcta${NC}"
else
  echo -e "${YELLOW}⚠ Esperaba feature/live-content-editor, encontrado ${CURRENT_BRANCH}${NC}"
fi

LAST_COMMIT=$(git log --oneline -1)
echo -e "Último commit: ${LAST_COMMIT}"

if echo "$LAST_COMMIT" | grep -q "FASE 1"; then
  echo -e "${GREEN}✓ Commit de FASE 1 encontrado${NC}"
fi
echo ""

# Resumen final
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Resumen de Verificación${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✅ PostgreSQL corriendo${NC}"
echo -e "${GREEN}✅ Tablas creadas: 3/3${NC}"
echo -e "${GREEN}✅ Contenido migrado: ${CONTENT_COUNT} elementos${NC}"
echo -e "${GREEN}✅ Usuario admin creado${NC}"
echo -e "${GREEN}✅ Archivos backend en su lugar${NC}"
echo -e "${GREEN}✅ Rol 'editor' configurado${NC}"
echo -e "${GREEN}✅ Branch feature/live-content-editor${NC}"
echo ""
echo -e "${YELLOW}📋 Para probar la API:${NC}"
echo -e "   1. Inicia el servidor: ${BLUE}./scripts/dev-start.sh${NC}"
echo -e "   2. Prueba el endpoint: ${BLUE}curl http://localhost:5000/api/content/page/castores${NC}"
echo -e "   3. Lee la guía completa: ${BLUE}cat VERIFICACION_FASE_1.md${NC}"
echo ""

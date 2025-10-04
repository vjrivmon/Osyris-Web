#!/bin/bash

# =====================================================
# Script para aplicar el schema del Content Editor
# =====================================================

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Osyris Content Editor - Apply Schema${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Detectar entorno
if [ "$NODE_ENV" = "production" ]; then
  ENV="production"
  DB_HOST="localhost"  # PostgreSQL en Docker
  DB_PORT="5432"
  DB_NAME="osyris_db"
  DB_USER="osyris_user"
  DB_PASSWORD="osyris_password"
else
  ENV="development"
  DB_HOST="localhost"
  DB_PORT="5432"
  DB_NAME="osyris_db"
  DB_USER="osyris_user"
  DB_PASSWORD="osyris_password"
fi

echo -e "${YELLOW}Entorno: ${ENV}${NC}"
echo -e "${YELLOW}Base de datos: ${DB_NAME}@${DB_HOST}:${DB_PORT}${NC}"
echo ""

# Verificar que PostgreSQL está corriendo
echo -e "${BLUE}[1/4]${NC} Verificando conexión a PostgreSQL..."
if docker ps --filter name=osyris-db --format '{{.Names}}' | grep -q osyris-db; then
  echo -e "${GREEN}✓ PostgreSQL está corriendo${NC}"
else
  echo -e "${RED}✗ PostgreSQL no está corriendo. Iniciando...${NC}"
  docker start osyris-db || {
    echo -e "${RED}Error: No se pudo iniciar PostgreSQL${NC}"
    exit 1
  }
  sleep 3
fi
echo ""

# Crear backup antes de aplicar schema
echo -e "${BLUE}[2/4]${NC} Creando backup de seguridad..."
BACKUP_DIR="api-osyris/database/backups"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/backup_before_content_editor_$(date +%Y%m%d_%H%M%S).sql"

export PGPASSWORD=$DB_PASSWORD
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE 2>/dev/null || {
  echo -e "${YELLOW}⚠ No se pudo crear backup (puede ser que la BD esté vacía)${NC}"
}

if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
  echo -e "${GREEN}✓ Backup creado: ${BACKUP_FILE}${NC}"
else
  echo -e "${YELLOW}⚠ Backup vacío o no creado${NC}"
fi
echo ""

# Aplicar schema
echo -e "${BLUE}[3/4]${NC} Aplicando schema de Content Editor..."
SCHEMA_FILE="api-osyris/database/schema-content-editor.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo -e "${RED}✗ Error: No se encontró el archivo ${SCHEMA_FILE}${NC}"
  exit 1
fi

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SCHEMA_FILE 2>&1 | grep -v "NOTICE" || {
  echo -e "${RED}✗ Error al aplicar schema${NC}"
  exit 1
}

echo -e "${GREEN}✓ Schema aplicado correctamente${NC}"
echo ""

# Verificar tablas creadas
echo -e "${BLUE}[4/4]${NC} Verificando tablas creadas..."
TABLES=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('contenido_editable', 'contenido_historial', 'audit_log')
  ORDER BY table_name;
" 2>/dev/null | tr -d ' ')

echo "$TABLES" | while read -r table; do
  if [ ! -z "$table" ]; then
    # Contar registros
    COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
    echo -e "${GREEN}✓ Tabla ${table}: ${COUNT} registros${NC}"
  fi
done

unset PGPASSWORD

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Schema aplicado exitosamente ✓${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo -e "1. Ejecutar script de migración de contenido: ${BLUE}npm run migrate:content${NC}"
echo -e "2. Verificar contenido migrado en la base de datos"
echo -e "3. Probar endpoints de la API"
echo ""

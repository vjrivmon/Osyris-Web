#!/bin/bash

##############################################################
# Script de Verificación Post-Deploy
# Grupo Scout Osyris - Sistema de Gestión
# Verifica que la base de datos sigue intacta después del deploy
# Uso: ./scripts/verify-database-after-deploy.sh
##############################################################

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SERVER="root@116.203.98.142"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 Verificación Post-Deploy - Base de Datos${NC}"
echo -e "${CYAN}Grupo Scout Osyris${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}📊 Contando tablas en base de datos...${NC}"
TABLE_COUNT=$(ssh "$SERVER" "docker exec osyris-db psql -U osyris_user -d osyris_db -t -c \"SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';\"" | xargs)

echo -e "${GREEN}Total de tablas: $TABLE_COUNT${NC}"
echo ""

if [ "$TABLE_COUNT" -lt "13" ]; then
    echo -e "${RED}❌ ERROR: Faltan tablas!${NC}"
    echo -e "${RED}Se esperaban al menos 13 tablas, pero solo hay $TABLE_COUNT${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Listado de tablas:${NC}"
echo ""

ssh "$SERVER" "docker exec osyris-db psql -U osyris_user -d osyris_db -c \"
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
\""

echo ""
echo -e "${CYAN}🔍 Verificando tablas críticas del sistema de familias...${NC}"
echo ""

EXPECTED_TABLES=(
    "educandos"
    "familiares_educandos"
    "documentos_familia"
    "notificaciones_familia"
    "galeria_fotos_privada"
    "confirmaciones_asistencia"
)

MISSING_TABLES=()

for table in "${EXPECTED_TABLES[@]}"; do
    EXISTS=$(ssh "$SERVER" "docker exec osyris-db psql -U osyris_user -d osyris_db -t -c \"SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '$table');\"" | xargs)

    if [ "$EXISTS" == "t" ]; then
        echo -e "  ${GREEN}✅ $table${NC}"
    else
        echo -e "  ${RED}❌ $table (FALTA)${NC}"
        MISSING_TABLES+=("$table")
    fi
done

echo ""

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ VERIFICACIÓN FALLIDA${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Tablas faltantes:${NC}"
    for table in "${MISSING_TABLES[@]}"; do
        echo -e "  • $table"
    done
    echo ""
    echo -e "${YELLOW}Acción requerida:${NC}"
    echo -e "  Ejecutar: ./scripts/migrate-database-production.sh"
    echo ""
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ VERIFICACIÓN EXITOSA${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📊 La base de datos está intacta después del deploy${NC}"
echo -e "${GREEN}Todas las $TABLE_COUNT tablas están presentes${NC}"
echo ""

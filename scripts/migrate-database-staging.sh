#!/bin/bash

##############################################################
# Script de Migración de Base de Datos a STAGING
# Grupo Scout Osyris - Sistema de Gestión
# Ejecuta migraciones SQL en la base de datos PostgreSQL de staging
# Uso: ./scripts/migrate-database-staging.sh
##############################################################

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

SERVER="root@116.203.98.142"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🧪 Migración de Base de Datos a STAGING${NC}"
echo -e "${MAGENTA}Grupo Scout Osyris - Sistema de Gestión${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que existen migraciones
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}❌ Error: Directorio de migraciones no encontrado${NC}"
    echo -e "${YELLOW}Se esperaba: $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Listar migraciones disponibles
echo -e "${CYAN}📋 Migraciones disponibles:${NC}"
echo ""
MIGRATIONS=$(ls -1 $MIGRATIONS_DIR/*.sql 2>/dev/null | sort)

if [ -z "$MIGRATIONS" ]; then
    echo -e "${YELLOW}⚠️  No se encontraron archivos de migración${NC}"
    exit 0
fi

echo "$MIGRATIONS" | while read migration; do
    echo -e "  • $(basename $migration)"
done
echo ""

# Confirmación
echo -e "${YELLOW}ℹ️  Información:${NC}"
echo -e "  • Servidor: $SERVER"
echo -e "  • Base de datos: osyris_staging_db (STAGING)"
echo -e "  • Container: osyris-db"
echo -e "  • Migraciones a ejecutar: $(echo "$MIGRATIONS" | wc -l)"
echo ""
echo -e "${GREEN}✅ Medidas de seguridad:${NC}"
echo -e "  • Se creará backup automático antes de migración"
echo -e "  • Uso de CREATE TABLE IF NOT EXISTS (no sobrescribe)"
echo ""

read -p "¿Continuar con migración a STAGING? (escribe 'SI' en mayúsculas): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo -e "${RED}❌ Migración cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 1: Backup de Base de Datos STAGING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BACKUP_NAME="backup_staging_before_migration_$(date +%Y%m%d_%H%M%S)"
echo -e "${CYAN}📦 Creando backup: $BACKUP_NAME${NC}"

ssh "$SERVER" bash << EOF
set -e
mkdir -p /var/www/backups
docker exec osyris-db pg_dump -U osyris_user osyris_staging_db | \
  gzip > /var/www/backups/${BACKUP_NAME}.sql.gz

if [ -f /var/www/backups/${BACKUP_NAME}.sql.gz ]; then
    SIZE=\$(du -h /var/www/backups/${BACKUP_NAME}.sql.gz | cut -f1)
    echo "✅ Backup creado: \${SIZE}"
else
    echo "❌ Error creando backup"
    exit 1
fi
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en backup. Migración cancelada.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backup completado${NC}"
echo ""

# Ejecutar cada migración
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 2: Ejecutar Migraciones en STAGING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

MIGRATION_COUNT=0
MIGRATION_SUCCESS=0
MIGRATION_FAILED=0

# Convertir a array
MIGRATION_ARRAY=()
while IFS= read -r line; do
    MIGRATION_ARRAY+=("$line")
done <<< "$MIGRATIONS"

# Ejecutar cada migración
for migration in "${MIGRATION_ARRAY[@]}"; do
    [ -z "$migration" ] && continue

    MIGRATION_FILE=$(basename "$migration")
    ((MIGRATION_COUNT++))

    echo -e "${CYAN}📄 Ejecutando: $MIGRATION_FILE${NC}"

    # Copiar migración al servidor
    echo "  📤 Transfiriendo archivo al servidor..."
    scp -q "$migration" "$SERVER:/tmp/$MIGRATION_FILE"

    echo "  ⏳ Aplicando migración en base de datos STAGING..."

    # Ejecutar migración en staging
    if ssh "$SERVER" "docker exec -i osyris-db psql -U osyris_user -d osyris_staging_db < /tmp/${MIGRATION_FILE}" 2>&1; then
        # Limpiar archivo temporal
        ssh "$SERVER" "rm -f /tmp/${MIGRATION_FILE}"
        EXIT_STATUS=0
    else
        EXIT_STATUS=1
    fi

    if [ $EXIT_STATUS -eq 0 ]; then
        echo -e "${GREEN}✅ $MIGRATION_FILE completada${NC}"
        ((MIGRATION_SUCCESS++))
    else
        echo -e "${RED}❌ $MIGRATION_FILE falló${NC}"
        ((MIGRATION_FAILED++))
        echo ""
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}❌ ERROR EN MIGRACIÓN${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 1
    fi

    echo ""
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 3: Verificar Tablas Creadas en STAGING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}📊 Tablas en base de datos STAGING:${NC}"
echo ""

ssh "$SERVER" bash << 'EOF'
docker exec osyris-db psql -U osyris_user -d osyris_staging_db -c "
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
"
EOF

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ MIGRACIÓN A STAGING COMPLETADA EXITOSAMENTE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📊 Resumen:${NC}"
echo -e "  • Migraciones ejecutadas: $MIGRATION_COUNT"
echo -e "  • Exitosas: $MIGRATION_SUCCESS"
echo -e "  • Fallidas: $MIGRATION_FAILED"
echo ""
echo -e "${CYAN}💾 Backup guardado en:${NC}"
echo -e "  • /var/www/backups/${BACKUP_NAME}.sql.gz"
echo ""
echo -e "${GREEN}🎉 Staging está listo para testing${NC}"
echo ""
echo -e "${CYAN}Próximos pasos:${NC}"
echo -e "  1. ${YELLOW}Probar en staging: http://116.203.98.142:3001${NC}"
echo -e "  2. ${YELLOW}Si todo OK, deploy a producción${NC}"
echo ""

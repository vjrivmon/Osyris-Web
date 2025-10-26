#!/bin/bash

##############################################################
# Script de Migración de Base de Datos a Producción
# Grupo Scout Osyris - Sistema de Gestión
# Ejecuta migraciones SQL en la base de datos PostgreSQL de producción
# Uso: ./scripts/migrate-database-production.sh
##############################################################

set -e  # Detener si hay errores

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

SERVER="root@116.203.98.142"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🗄️  Migración de Base de Datos a Producción${NC}"
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
echo -e "${YELLOW}⚠️  ADVERTENCIA${NC}"
echo ""
echo -e "Estás por ejecutar migraciones en la base de datos de ${RED}PRODUCCIÓN${NC}"
echo ""
echo -e "${CYAN}ℹ️  Información:${NC}"
echo -e "  • Servidor: $SERVER"
echo -e "  • Base de datos: osyris_db"
echo -e "  • Container: osyris-db"
echo -e "  • Migraciones a ejecutar: $(echo "$MIGRATIONS" | wc -l)"
echo ""
echo -e "${GREEN}✅ Medidas de seguridad:${NC}"
echo -e "  • Se creará backup automático antes de migración"
echo -e "  • Transacciones con ROLLBACK automático si hay errores"
echo -e "  • Uso de CREATE TABLE IF NOT EXISTS (no sobrescribe)"
echo ""

read -p "¿Estás SEGURO de continuar? (escribe 'SI' en mayúsculas): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo -e "${RED}❌ Migración cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 1: Backup de Base de Datos${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BACKUP_NAME="backup_before_migration_$(date +%Y%m%d_%H%M%S)"
echo -e "${CYAN}📦 Creando backup: $BACKUP_NAME${NC}"

ssh "$SERVER" bash << EOF
set -e
mkdir -p /var/www/backups
docker exec osyris-db pg_dump -U osyris_user osyris_db | \
  gzip > /var/www/backups/${BACKUP_NAME}.sql.gz

if [ -f /var/www/backups/${BACKUP_NAME}.sql.gz ]; then
    SIZE=\$(du -h /var/www/backups/${BACKUP_NAME}.sql.gz | cut -f1)
    echo "✅ Backup creado: \${SIZE}"
    echo "${BACKUP_NAME}" > /var/www/backups/last_migration_backup.txt
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
echo -e "${CYAN}PASO 2: Ejecutar Migraciones${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

MIGRATION_COUNT=0
MIGRATION_SUCCESS=0
MIGRATION_FAILED=0

# Convertir a array para evitar problemas con subshells
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

    # Copiar migración al servidor y ejecutar
    echo "  📤 Transfiriendo archivo al servidor..."
    scp -q "$migration" "$SERVER:/tmp/$MIGRATION_FILE"

    echo "  ⏳ Aplicando migración en base de datos..."

    # Ejecutar migración directamente
    if ssh "$SERVER" "docker exec -i osyris-db psql -U osyris_user -d osyris_db < /tmp/${MIGRATION_FILE}" 2>&1; then
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
        echo ""
        echo -e "${YELLOW}🔄 Restaurando backup...${NC}"

        ssh "$SERVER" bash << ROLLBACK
BACKUP_FILE="/var/www/backups/${BACKUP_NAME}.sql.gz"
if [ -f "\$BACKUP_FILE" ]; then
    gunzip < "\$BACKUP_FILE" | docker exec -i osyris-db psql -U osyris_user osyris_db
    echo "✅ Base de datos restaurada desde backup"
else
    echo "❌ Error: Backup no encontrado"
fi
ROLLBACK
        exit 1
    fi

    echo ""
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 3: Verificar Tablas Creadas${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}📊 Tablas en base de datos:${NC}"
echo ""

ssh "$SERVER" bash << 'EOF'
docker exec osyris-db psql -U osyris_user -d osyris_db -c "
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
echo -e "${GREEN}✅ MIGRACIÓN COMPLETADA EXITOSAMENTE${NC}"
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
echo -e "${GREEN}🎉 La base de datos está lista para el deploy${NC}"
echo ""
echo -e "${CYAN}Próximo paso:${NC}"
echo -e "  ${YELLOW}./scripts/deploy-production-complete.sh${NC}"
echo ""

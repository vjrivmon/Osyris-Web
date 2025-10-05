#!/bin/bash

##############################################################
# Script de Sincronización Manual: Producción → Local
# Uso: ./scripts/sync-from-production.sh
##############################################################

# Configuración
SERVER="root@116.203.98.142"
SERVER_PATH="/home/osyris/Osyris-Web"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 Sincronización desde Producción → Local${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que el directorio backups exista
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}📁 Creando directorio de backups...${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# 1. Backup de seguridad de BD local
echo -e "${YELLOW}💾 Creando backup de seguridad de BD local...${NC}"
docker exec osyris-db pg_dump -U osyris_user osyris_db > "$BACKUP_DIR/local_before_sync_$DATE.sql" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup local guardado: local_before_sync_$DATE.sql${NC}"
else
    echo -e "${RED}⚠️  No se pudo crear backup local (¿PostgreSQL corriendo?)${NC}"
    read -p "¿Continuar de todos modos? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${RED}❌ Sincronización cancelada${NC}"
        exit 1
    fi
fi

# 2. Descargar BD del servidor
echo ""
echo -e "${BLUE}📥 Descargando base de datos de producción...${NC}"
ssh "$SERVER" "docker exec osyris-db pg_dump -U osyris_user osyris_db" > "$BACKUP_DIR/prod_$DATE.sql" 2>/dev/null

if [ $? -eq 0 ] && [ -s "$BACKUP_DIR/prod_$DATE.sql" ]; then
    SIZE=$(du -h "$BACKUP_DIR/prod_$DATE.sql" | cut -f1)
    echo -e "${GREEN}✅ Base de datos descargada: prod_$DATE.sql ($SIZE)${NC}"
else
    echo -e "${RED}❌ Error al descargar BD del servidor${NC}"
    echo -e "${YELLOW}Verifica conexión SSH y que PostgreSQL esté corriendo en producción${NC}"
    exit 1
fi

# 3. Confirmar antes de importar
echo ""
echo -e "${YELLOW}⚠️  Esto SOBRESCRIBIRÁ tu base de datos local con los datos de producción${NC}"
read -p "¿Continuar con la importación? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}🔸 Sincronización cancelada (backup guardado en $BACKUP_DIR)${NC}"
    exit 0
fi

# 4. Importar BD a local
echo ""
echo -e "${BLUE}💾 Importando base de datos a local...${NC}"
docker exec -i osyris-db psql -U osyris_user -d osyris_db < "$BACKUP_DIR/prod_$DATE.sql" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos importada correctamente${NC}"
else
    echo -e "${RED}❌ Error al importar BD${NC}"
    echo -e "${YELLOW}Puedes restaurar tu BD local con:${NC}"
    echo -e "  docker exec -i osyris-db psql -U osyris_user -d osyris_db < $BACKUP_DIR/local_before_sync_$DATE.sql"
    exit 1
fi

# 5. Sincronizar archivos uploads
echo ""
echo -e "${BLUE}🖼️  Sincronizando imágenes y archivos...${NC}"
rsync -avz --progress "$SERVER:$SERVER_PATH/api-osyris/uploads/" "./api-osyris/uploads/" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Archivos sincronizados correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Error sincronizando archivos (puede que no existan cambios)${NC}"
fi

# 6. Limpiar backups antiguos (mantener últimos 5)
echo ""
echo -e "${YELLOW}🧹 Limpiando backups antiguos...${NC}"
ls -t "$BACKUP_DIR"/prod_*.sql 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
ls -t "$BACKUP_DIR"/local_*.sql 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null

BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Mantenidos últimos 5 backups ($BACKUP_COUNT archivos totales)${NC}"

# 7. Resumen final
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Sincronización completada: $DATE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📊 Resumen:${NC}"
echo -e "  • BD local respaldada en: ${YELLOW}$BACKUP_DIR/local_before_sync_$DATE.sql${NC}"
echo -e "  • BD producción guardada: ${YELLOW}$BACKUP_DIR/prod_$DATE.sql${NC}"
echo -e "  • Datos importados a local: ${GREEN}✅${NC}"
echo -e "  • Archivos sincronizados: ${GREEN}✅${NC}"
echo ""
echo -e "${BLUE}💡 Tip: Para restaurar BD local si algo salió mal:${NC}"
echo -e "  docker exec -i osyris-db psql -U osyris_user -d osyris_db < $BACKUP_DIR/local_before_sync_$DATE.sql"
echo ""

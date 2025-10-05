#!/bin/bash

##############################################################
# Script de Sincronización Manual: Local → Producción
# Uso: ./scripts/sync-to-production.sh
# ⚠️  CUIDADO: Esto sobrescribirá datos en producción
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
echo -e "${BLUE}📤 Sincronización desde Local → Producción${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${RED}⚠️  ¡ADVERTENCIA! ⚠️${NC}"
echo -e "${YELLOW}Este script sobrescribirá la base de datos de PRODUCCIÓN${NC}"
echo -e "${YELLOW}con los datos de tu entorno LOCAL.${NC}"
echo ""
echo -e "${YELLOW}Solo usa esto si:${NC}"
echo -e "  • Estás seguro de que local tiene los datos correctos"
echo -e "  • Has coordinado con tu equipo"
echo -e "  • Entiendes que esto puede afectar a usuarios en producción"
echo ""
read -p "¿Estás SEGURO de continuar? Escribe 'SI' en mayúsculas: " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo -e "${RED}❌ Sincronización cancelada${NC}"
    exit 0
fi

# Verificar que el directorio backups exista
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
fi

# 1. Backup de BD de producción (por seguridad)
echo ""
echo -e "${YELLOW}💾 Creando backup de seguridad de BD de producción...${NC}"
ssh "$SERVER" "docker exec osyris-db pg_dump -U osyris_user osyris_db" > "$BACKUP_DIR/prod_before_sync_$DATE.sql" 2>/dev/null

if [ $? -eq 0 ] && [ -s "$BACKUP_DIR/prod_before_sync_$DATE.sql" ]; then
    SIZE=$(du -h "$BACKUP_DIR/prod_before_sync_$DATE.sql" | cut -f1)
    echo -e "${GREEN}✅ Backup de producción guardado: prod_before_sync_$DATE.sql ($SIZE)${NC}"
else
    echo -e "${RED}❌ Error al crear backup de producción${NC}"
    exit 1
fi

# 2. Crear dump de BD local
echo ""
echo -e "${BLUE}📦 Creando dump de base de datos local...${NC}"
docker exec osyris-db pg_dump -U osyris_user osyris_db > "$BACKUP_DIR/local_$DATE.sql" 2>/dev/null

if [ $? -eq 0 ] && [ -s "$BACKUP_DIR/local_$DATE.sql" ]; then
    SIZE=$(du -h "$BACKUP_DIR/local_$DATE.sql" | cut -f1)
    echo -e "${GREEN}✅ Dump local creado: local_$DATE.sql ($SIZE)${NC}"
else
    echo -e "${RED}❌ Error al crear dump de BD local${NC}"
    exit 1
fi

# 3. Subir BD a producción
echo ""
echo -e "${BLUE}📤 Subiendo base de datos a producción...${NC}"
cat "$BACKUP_DIR/local_$DATE.sql" | ssh "$SERVER" "docker exec -i osyris-db psql -U osyris_user -d osyris_db" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos importada en producción${NC}"
else
    echo -e "${RED}❌ Error al importar BD en producción${NC}"
    echo -e "${YELLOW}Puedes restaurar producción con:${NC}"
    echo -e "  cat $BACKUP_DIR/prod_before_sync_$DATE.sql | ssh $SERVER 'docker exec -i osyris-db psql -U osyris_user -d osyris_db'"
    exit 1
fi

# 4. Sincronizar archivos uploads a producción
echo ""
echo -e "${BLUE}🖼️  Sincronizando imágenes y archivos a producción...${NC}"
rsync -avz --progress "./api-osyris/uploads/" "$SERVER:$SERVER_PATH/api-osyris/uploads/" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Archivos sincronizados a producción${NC}"
else
    echo -e "${YELLOW}⚠️  Error sincronizando archivos${NC}"
fi

# 5. Resumen final
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Sincronización completada: $DATE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📊 Resumen:${NC}"
echo -e "  • Backup producción guardado: ${YELLOW}$BACKUP_DIR/prod_before_sync_$DATE.sql${NC}"
echo -e "  • BD local exportada: ${YELLOW}$BACKUP_DIR/local_$DATE.sql${NC}"
echo -e "  • Datos subidos a producción: ${GREEN}✅${NC}"
echo -e "  • Archivos sincronizados: ${GREEN}✅${NC}"
echo ""
echo -e "${BLUE}💡 Tip: Para restaurar producción si algo salió mal:${NC}"
echo -e "  cat $BACKUP_DIR/prod_before_sync_$DATE.sql | ssh $SERVER 'docker exec -i osyris-db psql -U osyris_user -d osyris_db'"
echo ""

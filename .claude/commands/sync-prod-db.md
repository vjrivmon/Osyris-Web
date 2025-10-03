# Comando: /sync-prod-db - Sincronizar BD Producción → Local

## Descripción
Descarga la base de datos de producción (Hetzner) e importa en PostgreSQL local para trabajar con datos reales.

## Funcionalidad
1. ✅ Hace backup de producción
2. ✅ Descarga a local
3. ✅ Backup de BD local actual (por seguridad)
4. ✅ Importa datos de producción
5. ✅ Verifica importación exitosa

## Implementación

```bash
#!/bin/bash

echo "🔄 === SINCRONIZAR BD PRODUCCIÓN → LOCAL ==="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROD_HOST="116.203.98.142"
PROD_CONTAINER="osyris-db"
PROD_USER="osyris_user"
PROD_DB="osyris_db"

LOCAL_CONTAINER="osyris-postgres-local"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backups
mkdir -p $BACKUP_DIR

echo "📊 Información:"
echo "   Origen: $PROD_HOST (producción)"
echo "   Destino: localhost (desarrollo)"
echo ""

# 1. Backup de BD local actual (seguridad)
echo "💾 Haciendo backup de BD local actual..."
docker exec $LOCAL_CONTAINER pg_dump -U $PROD_USER $PROD_DB > $BACKUP_DIR/local_before_sync_$TIMESTAMP.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup local guardado en: $BACKUP_DIR/local_before_sync_$TIMESTAMP.sql${NC}"
else
    echo -e "${RED}❌ Error creando backup local${NC}"
    exit 1
fi

# 2. Descargar dump de producción
echo ""
echo "📥 Descargando datos de producción..."
ssh root@$PROD_HOST "docker exec $PROD_CONTAINER pg_dump -U $PROD_USER $PROD_DB" > $BACKUP_DIR/prod_dump_$TIMESTAMP.sql

if [ $? -eq 0 ] && [ -s "$BACKUP_DIR/prod_dump_$TIMESTAMP.sql" ]; then
    SIZE=$(du -h "$BACKUP_DIR/prod_dump_$TIMESTAMP.sql" | cut -f1)
    echo -e "${GREEN}✅ Dump descargado: $SIZE${NC}"
else
    echo -e "${RED}❌ Error descargando datos de producción${NC}"
    exit 1
fi

# 3. Limpiar BD local
echo ""
echo "🧹 Limpiando base de datos local..."
docker exec $LOCAL_CONTAINER psql -U $PROD_USER -d $PROD_DB -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO $PROD_USER;
GRANT ALL ON SCHEMA public TO public;
" >/dev/null 2>&1

echo -e "${GREEN}✅ BD local limpiada${NC}"

# 4. Importar datos de producción
echo ""
echo "📊 Importando datos de producción..."
cat $BACKUP_DIR/prod_dump_$TIMESTAMP.sql | docker exec -i $LOCAL_CONTAINER psql -U $PROD_USER -d $PROD_DB >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Datos importados correctamente${NC}"
else
    echo -e "${RED}❌ Error importando datos${NC}"
    echo "Restaurando backup local..."
    cat $BACKUP_DIR/local_before_sync_$TIMESTAMP.sql | docker exec -i $LOCAL_CONTAINER psql -U $PROD_USER -d $PROD_DB
    exit 1
fi

# 5. Verificar importación
echo ""
echo "🔍 Verificando datos importados..."

USERS_COUNT=$(docker exec $LOCAL_CONTAINER psql -U $PROD_USER -d $PROD_DB -t -c "SELECT COUNT(*) FROM usuarios;")
SECTIONS_COUNT=$(docker exec $LOCAL_CONTAINER psql -U $PROD_USER -d $PROD_DB -t -c "SELECT COUNT(*) FROM secciones;")
PAGES_COUNT=$(docker exec $LOCAL_CONTAINER psql -U $PROD_USER -d $PROD_DB -t -c "SELECT COUNT(*) FROM paginas;")

echo "   Usuarios: $USERS_COUNT"
echo "   Secciones: $SECTIONS_COUNT"
echo "   Páginas: $PAGES_COUNT"

# 6. Resumen
echo ""
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ SINCRONIZACIÓN COMPLETADA     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""
echo "📊 Tu BD local ahora tiene los datos de producción"
echo "🔧 Puedes desarrollar con datos reales"
echo "🚀 Deploy con /safe-deploy subirá cambios a producción"
echo ""
echo "💾 Backups guardados en:"
echo "   Local:      $BACKUP_DIR/local_before_sync_$TIMESTAMP.sql"
echo "   Producción: $BACKUP_DIR/prod_dump_$TIMESTAMP.sql"
echo ""
```

## Uso

```bash
/sync-prod-db
```

## Palabras clave
- "sincronizar base de datos"
- "sync database"
- "descargar producción"
- "importar datos producción"

## Resultado
✅ BD local con datos exactos de producción
✅ Backups de seguridad creados
✅ Listo para desarrollo con datos reales

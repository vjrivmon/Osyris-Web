#!/bin/bash

# Script para iniciar PostgreSQL en Docker para desarrollo local
# Mantiene paridad con producción (Hetzner)

echo "🐘 Iniciando PostgreSQL 15 en Docker..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Variables de configuración
CONTAINER_NAME="osyris-db"
POSTGRES_VERSION="15-alpine"
DB_PORT=5432
DB_USER="osyris_user"
DB_PASSWORD="osyris_password"
DB_NAME="osyris_db"

# Verificar si Docker está corriendo
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Inicia Docker Desktop primero.${NC}"
    exit 1
fi

# Verificar si el contenedor ya existe
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⚠️  El contenedor ${CONTAINER_NAME} ya existe${NC}"

    # Verificar si está corriendo
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${GREEN}✅ PostgreSQL ya está corriendo${NC}"
        docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT version();" 2>/dev/null
        exit 0
    else
        echo "🔄 Iniciando contenedor existente..."
        docker start ${CONTAINER_NAME}
        sleep 3
        echo -e "${GREEN}✅ PostgreSQL iniciado${NC}"
        exit 0
    fi
fi

# Crear contenedor nuevo
echo "📦 Creando nuevo contenedor PostgreSQL..."
docker run -d \
    --name ${CONTAINER_NAME} \
    -e POSTGRES_USER=${DB_USER} \
    -e POSTGRES_PASSWORD=${DB_PASSWORD} \
    -e POSTGRES_DB=${DB_NAME} \
    -p ${DB_PORT}:5432 \
    -v osyris-db-data:/var/lib/postgresql/data \
    --restart unless-stopped \
    postgres:${POSTGRES_VERSION}

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Verificar que esté corriendo
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${GREEN}✅ PostgreSQL 15 iniciado correctamente${NC}"
    echo ""
    echo "📊 Información de conexión:"
    echo "   Host: localhost"
    echo "   Puerto: ${DB_PORT}"
    echo "   Usuario: ${DB_USER}"
    echo "   Base de datos: ${DB_NAME}"
    echo ""
    echo "🔗 Conectar con psql:"
    echo "   docker exec -it ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME}"
    echo ""
    echo "🛑 Detener PostgreSQL:"
    echo "   docker stop ${CONTAINER_NAME}"
else
    echo -e "${RED}❌ Error al iniciar PostgreSQL${NC}"
    docker logs ${CONTAINER_NAME}
    exit 1
fi

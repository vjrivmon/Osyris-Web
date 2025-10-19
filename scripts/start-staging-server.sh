#!/bin/bash

##############################################################
# Script de Inicio de Servicios de Staging con PM2
# Grupo Scout Osyris - Sistema de Gestión
# Inicia frontend y backend en puertos 3001 y 5001
# Uso: ./scripts/start-staging-server.sh
##############################################################

STAGING_HOST="116.203.98.142"
STAGING_PORT_FRONTEND=3001
STAGING_PORT_BACKEND=5001
STAGING_API_URL="http://$STAGING_HOST:$STAGING_PORT_BACKEND"
STAGING_PATH="/var/www/osyris-staging/current"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 Inicio de Servicios de Staging con PM2${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 no está instalado${NC}"
    echo -e "${CYAN}Instalando PM2...${NC}"
    npm install -g pm2
fi

# Detener servicios anteriores si existen
echo -e "${YELLOW}🛑 Deteniendo servicios anteriores...${NC}"
pm2 stop osyris-staging-frontend 2>/dev/null || true
pm2 stop osyris-staging-backend 2>/dev/null || true
pm2 delete osyris-staging-frontend 2>/dev/null || true
pm2 delete osyris-staging-backend 2>/dev/null || true

# Limpiar puertos
fuser -k $STAGING_PORT_FRONTEND/tcp 2>/dev/null || true
fuser -k $STAGING_PORT_BACKEND/tcp 2>/dev/null || true

sleep 2

# Verificar que .next existe
if [ ! -d "$STAGING_PATH/.next" ]; then
    echo -e "${RED}❌ Build no encontrado (.next/)${NC}"
    echo -e "${CYAN}Ejecuta primero: ./scripts/deploy-to-staging.sh${NC}"
    exit 1
fi

echo -e "${CYAN}📊 Iniciando backend staging...${NC}"
# Iniciar backend en puerto 5001
pm2 start "$STAGING_PATH/api-osyris/src/index.js" \
    --name "osyris-staging-backend" \
    --cwd "$STAGING_PATH/api-osyris" \
    --node-args="--env-file=$STAGING_PATH/api-osyris/.env"

sleep 3

echo -e "${CYAN}📊 Iniciando frontend staging...${NC}"
# Iniciar frontend en puerto 3001
pm2 start "$STAGING_PATH/node_modules/.bin/next" \
    --name "osyris-staging-frontend" \
    --cwd "$STAGING_PATH" \
    --node-args="--env-file=$STAGING_PATH/.env.local" \
    -- start -p $STAGING_PORT_FRONTEND

# Guardar configuración PM2
pm2 save

echo ""
echo -e "${CYAN}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 5

# Verificar estado
echo ""
echo -e "${CYAN}📋 Estado de servicios:${NC}"
pm2 list | grep osyris-staging

echo ""
echo -e "${CYAN}🔍 Verificación de puertos:${NC}"
netstat -tlnp | grep ":$STAGING_PORT_FRONTEND\|:$STAGING_PORT_BACKEND" || echo "Puertos iniciándose..."

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Servicios de Staging Iniciados${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}🌐 URLs de Staging:${NC}"
echo -e "  • Frontend: ${YELLOW}http://116.203.98.142:$STAGING_PORT_FRONTEND${NC}"
echo -e "  • Backend API: ${YELLOW}http://116.203.98.142:$STAGING_PORT_BACKEND${NC}"
echo ""
echo -e "${CYAN}📊 Comandos útiles:${NC}"
echo -e "  • Ver logs: ${YELLOW}pm2 logs osyris-staging-frontend${NC}"
echo -e "  • Ver logs: ${YELLOW}pm2 logs osyris-staging-backend${NC}"
echo -e "  • Reiniciar: ${YELLOW}pm2 restart osyris-staging-frontend${NC}"
echo -e "  • Detener: ${YELLOW}pm2 stop osyris-staging-frontend${NC}"
echo ""

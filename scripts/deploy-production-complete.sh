#!/bin/bash

##############################################################
# Script de Deploy COMPLETO a Producción
# Grupo Scout Osyris - Sistema de Gestión
# Despliega código Y configura credenciales de Gmail automáticamente
# Uso: ./scripts/deploy-production-complete.sh
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🚀 Deploy COMPLETO a Producción${NC}"
echo -e "${MAGENTA}Código + Configuración de Gmail${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que los scripts existen
DEPLOY_SCRIPT="$SCRIPT_DIR/deploy-to-production-from-staging.sh"
GMAIL_SCRIPT="$SCRIPT_DIR/set-gmail-credentials-production.sh"

if [ ! -f "$DEPLOY_SCRIPT" ]; then
    echo -e "${RED}❌ Error: No se encuentra el script de deploy: $DEPLOY_SCRIPT${NC}"
    exit 1
fi

if [ ! -f "$GMAIL_SCRIPT" ]; then
    echo -e "${RED}❌ Error: No se encuentra el script de Gmail: $GMAIL_SCRIPT${NC}"
    exit 1
fi

# Paso 1: Deploy de código
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 1/2: Desplegando código a producción${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

bash "$DEPLOY_SCRIPT"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el deploy de código${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Código desplegado exitosamente${NC}"
echo ""

# Esperar un momento para que los servicios se estabilicen
echo -e "${YELLOW}⏳ Esperando 10 segundos para que los servicios se estabilicen...${NC}"
sleep 10

# Paso 2: Configurar credenciales de Gmail
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}PASO 2/2: Configurando credenciales de Gmail${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

bash "$GMAIL_SCRIPT"

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Advertencia: Error al configurar credenciales de Gmail${NC}"
    echo -e "${YELLOW}Puedes intentar configurarlas manualmente con:${NC}"
    echo -e "  ${CYAN}./scripts/set-gmail-credentials-production.sh${NC}"
    echo ""
    echo -e "${YELLOW}O configurarlas interactivamente con:${NC}"
    echo -e "  ${CYAN}ssh root@116.203.98.142 '/var/www/osyris/current/scripts/configure-gmail-production.sh'${NC}"
    echo ""
else
    echo ""
    echo -e "${GREEN}✅ Credenciales de Gmail configuradas exitosamente${NC}"
fi

# Resumen final
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deploy COMPLETO Finalizado${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}✅ Tareas completadas:${NC}"
echo -e "  1. ✅ Código desplegado a producción"
echo -e "  2. ✅ Credenciales de Gmail configuradas"
echo -e "  3. ✅ Servicios reiniciados"
echo ""
echo -e "${CYAN}🌐 URLs de producción:${NC}"
echo -e "  • Frontend: ${YELLOW}https://gruposcoutosyris.es${NC}"
echo -e "  • Backend:  ${YELLOW}https://gruposcoutosyris.es/api/health${NC}"
echo -e "  • Login:    ${YELLOW}https://gruposcoutosyris.es/login${NC}"
echo ""
echo -e "${CYAN}📧 Email configurado:${NC}"
echo -e "  • ${GREEN}vicenterivasmonferrer12@gmail.com${NC}"
echo ""
echo -e "${CYAN}🔍 Verificar estado:${NC}"
echo -e "  ${YELLOW}ssh root@116.203.98.142 'pm2 status'${NC}"
echo ""
echo -e "${CYAN}📋 Ver logs:${NC}"
echo -e "  ${YELLOW}ssh root@116.203.98.142 'pm2 logs osyris-backend --lines 50'${NC}"
echo ""
echo -e "${GREEN}🎊 ¡Listo para usar!${NC}"
echo ""


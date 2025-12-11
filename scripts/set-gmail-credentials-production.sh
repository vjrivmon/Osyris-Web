#!/bin/bash

##############################################################
# Script Automático de Configuración de Gmail en Producción
# Grupo Scout Osyris - Sistema de Gestión
# Configura credenciales de Gmail sin interacción del usuario
# Uso: ./scripts/set-gmail-credentials-production.sh
##############################################################

set -e  # Detener si hay errores

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
SERVER="root@116.203.98.142"
ENV_PATH="/var/www/osyris/current/api-osyris/.env"
DATE=$(date +%Y%m%d_%H%M%S)

# Credenciales de Gmail (hardcoded para persistencia)
EMAIL_USER="web.osyris@gmail.com"
EMAIL_APP_PASSWORD="enzniccveckagazn"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📧 Configuración Automática de Gmail en Producción${NC}"
echo -e "${CYAN}Grupo Scout Osyris - Sistema de Gestión${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}ℹ️  Configurando credenciales de Gmail en producción...${NC}"

# Ejecutar en el servidor remoto
ssh "$SERVER" bash << EOF
set -e

# Crear backup del .env actual
if [ -f "$ENV_PATH" ]; then
    cp "$ENV_PATH" "/var/www/backups/env_backup_$DATE"
    echo "✅ Backup creado: /var/www/backups/env_backup_$DATE"
fi

# Verificar si las variables ya existen
if grep -q "^EMAIL_USER=" "$ENV_PATH" 2>/dev/null; then
    # Actualizar variables existentes
    sed -i "s|^EMAIL_USER=.*|EMAIL_USER=$EMAIL_USER|" "$ENV_PATH"
    sed -i "s|^EMAIL_APP_PASSWORD=.*|EMAIL_APP_PASSWORD=$EMAIL_APP_PASSWORD|" "$ENV_PATH"
    echo "✅ Variables de email actualizadas"
else
    # Añadir variables nuevas
    echo "" >> "$ENV_PATH"
    echo "# Gmail Configuration" >> "$ENV_PATH"
    echo "EMAIL_USER=$EMAIL_USER" >> "$ENV_PATH"
    echo "EMAIL_APP_PASSWORD=$EMAIL_APP_PASSWORD" >> "$ENV_PATH"
    echo "✅ Variables de email añadidas"
fi

# Verificar que las variables están correctamente configuradas
if grep -q "^EMAIL_USER=$EMAIL_USER" "$ENV_PATH" && grep -q "^EMAIL_APP_PASSWORD=" "$ENV_PATH"; then
    echo "✅ Verificación exitosa: Variables configuradas correctamente"
else
    echo "❌ Error: Las variables no se configuraron correctamente"
    exit 1
fi

# Reiniciar backend para aplicar cambios (forzando recarga de .env)
echo "🔄 Reiniciando backend (forzando recarga de variables de entorno)..."

# Detener y eliminar proceso actual
pm2 delete osyris-backend || true

# Esperar un momento
sleep 2

# Iniciar de nuevo con las nuevas variables de entorno
cd /var/www/osyris/current/api-osyris
pm2 start src/index.js \
    --name "osyris-backend" \
    --cwd /var/www/osyris/current/api-osyris \
    --node-args="--env-file=/var/www/osyris/current/api-osyris/.env"

# Guardar configuración PM2
pm2 save

echo "✅ Backend reiniciado con nuevas variables de entorno"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Credenciales de Gmail configuradas exitosamente${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}📋 Resumen:${NC}"
    echo -e "  • Email configurado: ${GREEN}$EMAIL_USER${NC}"
    echo -e "  • Backend reiniciado: ${GREEN}✅${NC}"
    echo -e "  • Backup .env: ${GREEN}/var/www/backups/env_backup_$DATE${NC}"
    echo ""
    echo -e "${YELLOW}🧪 Para verificar el envío de emails:${NC}"
    echo -e "  1. Ve a: ${BLUE}https://gruposcoutosyris.es/dashboard/kraal${NC}"
    echo -e "  2. Prueba enviando una invitación"
    echo -e "  3. Verifica los logs: ${CYAN}ssh root@116.203.98.142 'pm2 logs osyris-backend --lines 50'${NC}"
    echo ""
else
    echo -e "${RED}❌ Error al configurar credenciales${NC}"
    exit 1
fi


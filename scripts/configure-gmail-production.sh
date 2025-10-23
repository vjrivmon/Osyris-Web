#!/bin/bash

# Script para configurar variables de entorno de Gmail en producción
# Grupo Scout Osyris - Configuración de Email

echo "🏕️ Configuración de Email para Grupo Scout Osyris"
echo "================================================"

# Variables
BACKEND_ENV_PATH="/var/www/osyris/current/api-osyris/.env"
BACKUP_PATH="/var/www/osyris/backup_$(date +%Y%m%d_%H%M%S)_env"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📍 Ruta del backend:${NC} $BACKEND_ENV_PATH"
echo ""

# Crear backup del archivo .env actual
echo -e "${YELLOW}📦 Creando backup del archivo .env actual...${NC}"
cp $BACKEND_ENV_PATH $BACKUP_PATH
echo -e "${GREEN}✅ Backup creado en:${NC} $BACKUP_PATH"
echo ""

# Mostrar configuración actual
echo -e "${BLUE}📋 Configuración actual de email:${NC}"
grep -E "EMAIL_|GMAIL|MAIL" $BACKEND_ENV_PATH || echo -e "${RED}❌ No hay variables de email configuradas${NC}"
echo ""

# Solicitar credenciales
echo -e "${YELLOW}🔧 Por favor, introduce las credenciales de Gmail:${NC}"
echo ""

read -p "📧 Email de Gmail (ej: info@grupoosyris.es): " EMAIL_USER
read -s -p "🔐 Contraseña de Aplicación de Gmail: " EMAIL_APP_PASSWORD
echo ""
echo ""

# Validar que se hayan proporcionado las credenciales
if [[ -z "$EMAIL_USER" || -z "$EMAIL_APP_PASSWORD" ]]; then
    echo -e "${RED}❌ Error: Debes proporcionar tanto el email como la contraseña de aplicación${NC}"
    exit 1
fi

# Validar formato de email
if [[ ! $EMAIL_USER =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo -e "${RED}❌ Error: El formato del email no es válido${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Credenciales validadas correctamente${NC}"
echo ""

# Añadir variables de entorno al archivo .env
echo -e "${BLUE}📝 Añadiendo variables de entorno al archivo .env...${NC}"

# Verificar si las variables ya existen y actualizarlas
if grep -q "^EMAIL_USER=" $BACKEND_ENV_PATH; then
    sed -i "s/^EMAIL_USER=.*/EMAIL_USER=$EMAIL_USER/" $BACKEND_ENV_PATH
    echo -e "${YELLOW}🔄 Actualizada variable EMAIL_USER${NC}"
else
    echo "" >> $BACKEND_ENV_PATH
    echo "# Gmail Configuration" >> $BACKEND_ENV_PATH
    echo "EMAIL_USER=$EMAIL_USER" >> $BACKEND_ENV_PATH
    echo -e "${GREEN}➕ Añadida variable EMAIL_USER${NC}"
fi

if grep -q "^EMAIL_APP_PASSWORD=" $BACKEND_ENV_PATH; then
    sed -i "s/^EMAIL_APP_PASSWORD=.*/EMAIL_APP_PASSWORD=$EMAIL_APP_PASSWORD/" $BACKEND_ENV_PATH
    echo -e "${YELLOW}🔄 Actualizada variable EMAIL_APP_PASSWORD${NC}"
else
    echo "EMAIL_APP_PASSWORD=$EMAIL_APP_PASSWORD" >> $BACKEND_ENV_PATH
    echo -e "${GREEN}➕ Añadida variable EMAIL_APP_PASSWORD${NC}"
fi

echo ""

# Verificar la configuración
echo -e "${BLUE}🔍 Verificando configuración añadida:${NC}"
echo -e "${GREEN}EMAIL_USER:${NC} $EMAIL_USER"
echo -e "${GREEN}EMAIL_APP_PASSWORD:${NC} [OCULTO]"
echo ""

# Reiniciar el backend
echo -e "${BLUE}🔄 Reiniciando el backend para aplicar cambios...${NC}"
cd /var/www/osyris/current
pm2 restart osyris-backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend reiniciado correctamente${NC}"
else
    echo -e "${RED}❌ Error al reiniciar el backend${NC}"
    echo -e "${YELLOW}💡 Intenta reiniciarlo manualmente: cd /var/www/osyris/current && pm2 restart osyris-backend${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada exitosamente!${NC}"
echo ""
echo -e "${BLUE}📋 Resumen:${NC}"
echo -e "  • Email configurado: ${GREEN}$EMAIL_USER${NC}"
echo -e "  • Backend reiniciado: ${GREEN}✅${NC}"
echo -e "  • Backup creado: ${GREEN}$BACKUP_PATH${NC}"
echo ""
echo -e "${YELLOW}🧪 Para probar el envío de emails:${NC}"
echo -e "  1. Ve a: ${BLUE}https://gruposcoutosyris.es/admin/dashboard${NC}"
echo -e "  2. Haz clic en '${BLUE}Enviar Invitación${NC}'"
echo -e "  3. Rellena el formulario y envíalo"
echo -e "  4. Verifica que el email se reciba correctamente"
echo ""
echo -e "${BLUE}📝 Para verificar logs del backend:${NC}"
echo -e "  ${YELLOW}pm2 logs api-osyris${NC}"
echo ""
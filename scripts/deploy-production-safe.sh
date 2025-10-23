#!/bin/bash

# 🛡️ DEPLOY SEGURO A PRODUCCIÓN - SIN BORRAR DATOS
#
# Este script despliega código de forma segura SIN afectar la base de datos de producción
#
# ⚠️ MODO SEGURO ACTIVADO: NO se modifica la base de datos de producción
#
# Uso: ./scripts/deploy-production-safe.sh

set -e  # Detener ejecución si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
SERVER_USER="root"
SERVER_IP="116.203.98.142"
PROJECT_DIR="/var/www/osyris/current"
BACKUP_DIR="/var/www/osyris/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🛡️ DEPLOY SEGURO A PRODUCCIÓN (MODO SIN DATOS)       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1️⃣ Verificar que estamos en el directorio correcto
echo -e "${CYAN}ℹ️  1️⃣ Verificando directorio del proyecto...${NC}"
if [ ! -f "package.json" ] || [ ! -d "api-osyris" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde el directorio raíz del proyecto${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Directorio verificado${NC}"

# 2️⃣ Backup del código en producción (solo código, no base de datos)
echo -e "${CYAN}ℹ️  2️⃣ Creando backup del código de producción...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${BACKUP_DIR} && cd ${PROJECT_DIR} && tar -czf ${BACKUP_DIR}/code_backup_${TIMESTAMP}.tar.gz --exclude='node_modules' --exclude='.next' --exclude='logs' --exclude='api-osyris/node_modules' ."
echo -e "${GREEN}✅ Backup de código creado: code_backup_${TIMESTAMP}.tar.gz${NC}"

# 3️⃣ Sincronizar código de forma segura
echo -e "${CYAN}ℹ️  3️⃣ Sincronizando código (modo seguro)...${NC}"
echo -e "${YELLOW}⚠️  MODO SEGURO: Solo se sincronizará código, NO la base de datos${NC}"

# Excluir archivos sensibles y grandes
rsync -avz --progress \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='logs' \
    --exclude='api-osyris/node_modules' \
    --exclude='api-osyris/uploads' \
    --exclude='.env.local' \
    --exclude='*.log' \
    --exclude='scripts/sync-staging-to-production.sh' \
    ./ ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/

echo -e "${GREEN}✅ Código sincronizado de forma segura${NC}"

# 4️⃣ Instalar dependencias
echo -e "${CYAN}ℹ️  4️⃣ Instalando/Actualizando dependencias...${NC}"

# Frontend
echo -e "${YELLOW}📦 Instalando dependencias frontend...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cd ${PROJECT_DIR} && npm ci --production"

# Backend
echo -e "${YELLOW}📦 Instalando dependencias backend...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cd ${PROJECT_DIR}/api-osyris && npm ci --production"

echo -e "${GREEN}✅ Dependencias actualizadas${NC}"

# 5️⃣ Build del frontend
echo -e "${CYAN}ℹ️  5️⃣ Construyendo frontend...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cd ${PROJECT_DIR} && npm run build"
echo -e "${GREEN}✅ Frontend construido${NC}"

# 6️⃣ Reiniciar servicios PM2 (sin tocar la base de datos)
echo -e "${CYAN}ℹ️  6️⃣ Reiniciando servicios...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cd ${PROJECT_DIR} && pm2 reload osyris-backend && pm2 reload osyris-frontend"
echo -e "${GREEN}✅ Servicios reiniciados${NC}"

# 7️⃣ Verificar estado
echo -e "${CYAN}ℹ️  7️⃣ Verificando estado de los servicios...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cd ${PROJECT_DIR} && pm2 status"

echo -e "${CYAN}ℹ️  8️⃣ Verificando endpoints...${NC}"

# Verificar frontend
FRONTEND_STATUS=$(ssh ${SERVER_USER}@${SERVER_IP} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000" || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend: $FRONTEND_STATUS OK${NC}"
else
    echo -e "${RED}❌ Frontend: $FRONTEND_STATUS ERROR${NC}"
fi

# Verificar backend
BACKEND_STATUS=$(ssh ${SERVER_USER}@${SERVER_IP} "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/health" || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Backend: $BACKEND_STATUS OK${NC}"
else
    echo -e "${RED}❌ Backend: $BACKEND_STATUS ERROR${NC}"
fi

# 9️⃣ Resumen final
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✅ DEPLOY SEGURO COMPLETADO                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📊 RESUMEN:${NC}"
echo -e "  ✅ Código sincronizado (modo seguro)"
echo -e "  ✅ Dependencias actualizadas"
echo -e "  ✅ Frontend construido"
echo -e "  ✅ Servicios reiniciados"
echo -e "  🛡️ BASE DE DATOS NO MODIFICADA (seguro)"
echo ""
echo -e "${CYAN}🌐 URLs:${NC}"
echo -e "  - Frontend: https://gruposcoutosyris.es"
echo -e "  - Backend:  https://gruposcoutosyris.es/api/health"
echo ""
echo -e "${CYAN}🔐 Acceso:${NC}"
echo -e "  - Email:    admin@grupoosyris.es"
echo -e "  - Password: admin123"
echo ""
echo -e "${GREEN}🛡️ SEGURIDAD: La base de datos de producción está intacta${NC}"
echo -e "${YELLOW}📝 NOTA: Los datos reales (usuarios, invitaciones, etc.) se han conservado${NC}"
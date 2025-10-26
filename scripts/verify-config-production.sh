#!/bin/bash

##############################################################
# Script de Verificación de Configuración Pre-Deploy
# Grupo Scout Osyris - Sistema de Gestión
# Verifica todas las variables de entorno críticas en servidor
# Tiempo estimado: 30 segundos
##############################################################

# Configuración
SERVER="root@116.203.98.142"
PROD_PATH="/var/www/osyris/current"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Funciones de logging
check() {
    ((TOTAL_CHECKS++))
    echo -e "${MAGENTA}[CHECK $TOTAL_CHECKS]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_CHECKS++))
}

error() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAILED_CHECKS++))
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
    ((WARNING_CHECKS++))
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔍 Verificación de Configuración Pre-Deploy${NC}"
echo -e "${MAGENTA}Grupo Scout Osyris - Sistema de Gestión${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

info "Conectando al servidor de producción..."
echo ""

# ========================================
# SECCIÓN 1: Variables de Entorno Backend
# ========================================
echo -e "${CYAN}━━━ SECCIÓN 1: Variables de Entorno Backend ━━━${NC}"
echo ""

check "Verificando archivo .env del backend en servidor"
ssh "$SERVER" bash << 'EOF'
if [ -f /var/www/osyris/current/api-osyris/.env ]; then
    echo "✓ Archivo .env existe"
    exit 0
else
    echo "✗ Archivo .env NO encontrado"
    exit 1
fi
EOF

if [ $? -eq 0 ]; then
    success "Archivo .env backend existe"
else
    error "Archivo .env backend NO ENCONTRADO"
    echo ""
    error "CRÍTICO: Necesitas crear el archivo .env en el servidor"
    echo ""
    info "Ejecuta esto en el servidor:"
    echo "  ssh $SERVER"
    echo "  cd /var/www/osyris/current/api-osyris"
    echo "  nano .env"
    echo ""
    exit 1
fi

check "Verificando FRONTEND_URL en producción"
FRONTEND_URL=$(ssh "$SERVER" "grep '^FRONTEND_URL=' /var/www/osyris/current/api-osyris/.env 2>/dev/null | cut -d'=' -f2")

if [ "$FRONTEND_URL" = "https://gruposcoutosyris.es" ]; then
    success "FRONTEND_URL configurado correctamente: $FRONTEND_URL"
elif [ -z "$FRONTEND_URL" ]; then
    error "FRONTEND_URL NO configurado"
    echo ""
    info "Agrega esto al .env del servidor:"
    echo "  FRONTEND_URL=https://gruposcoutosyris.es"
    echo ""
else
    warning "FRONTEND_URL configurado como: $FRONTEND_URL"
    warning "Se esperaba: https://gruposcoutosyris.es"
fi

check "Verificando BACKEND_URL en producción"
BACKEND_URL=$(ssh "$SERVER" "grep '^BACKEND_URL=' /var/www/osyris/current/api-osyris/.env 2>/dev/null | cut -d'=' -f2")

if [ "$BACKEND_URL" = "https://gruposcoutosyris.es" ]; then
    success "BACKEND_URL configurado correctamente: $BACKEND_URL"
elif [ -z "$BACKEND_URL" ]; then
    error "BACKEND_URL NO configurado"
    echo ""
    info "Agrega esto al .env del servidor:"
    echo "  BACKEND_URL=https://gruposcoutosyris.es"
    echo ""
else
    warning "BACKEND_URL configurado como: $BACKEND_URL"
    warning "Se esperaba: https://gruposcoutosyris.es"
fi

check "Verificando credenciales de EMAIL"
EMAIL_USER=$(ssh "$SERVER" "grep '^EMAIL_USER=' /var/www/osyris/current/api-osyris/.env 2>/dev/null | cut -d'=' -f2")
EMAIL_PASS=$(ssh "$SERVER" "grep '^EMAIL_APP_PASSWORD=' /var/www/osyris/current/api-osyris/.env 2>/dev/null | cut -d'=' -f2")

if [ -n "$EMAIL_USER" ] && [ -n "$EMAIL_PASS" ]; then
    success "Credenciales de email configuradas"
    info "  EMAIL_USER: $EMAIL_USER"
    info "  EMAIL_APP_PASSWORD: ********** (oculto)"
else
    error "Credenciales de email NO configuradas o incompletas"
    echo ""
    info "Configura las credenciales de Gmail en el .env del servidor"
    info "O ejecuta: ./scripts/set-gmail-credentials-production.sh"
    echo ""
fi

check "Verificando configuración de base de datos"
DB_HOST=$(ssh "$SERVER" "grep '^DB_HOST=' /var/www/osyris/current/api-osyris/.env 2>/dev/null | cut -d'=' -f2")
DB_NAME=$(ssh "$SERVER" "grep '^DB_NAME=' /var/www/osyris/current/api-osyris/.env 2>/dev/null | cut -d'=' -f2")

if [ "$DB_HOST" = "localhost" ] && [ "$DB_NAME" = "osyris_db" ]; then
    success "Configuración de base de datos correcta"
    info "  DB_HOST: $DB_HOST"
    info "  DB_NAME: $DB_NAME"
else
    warning "Configuración de base de datos inusual"
    info "  DB_HOST: $DB_HOST"
    info "  DB_NAME: $DB_NAME"
fi

echo ""

# ========================================
# SECCIÓN 2: Servicios en el Servidor
# ========================================
echo -e "${CYAN}━━━ SECCIÓN 2: Servicios en el Servidor ━━━${NC}"
echo ""

check "Verificando PostgreSQL (Docker)"
ssh "$SERVER" bash << 'EOF'
if docker ps | grep -q osyris-db; then
    echo "✓ PostgreSQL corriendo en Docker"
    exit 0
else
    echo "✗ PostgreSQL NO está corriendo"
    exit 1
fi
EOF

if [ $? -eq 0 ]; then
    success "PostgreSQL operativo"
else
    error "PostgreSQL NO está corriendo"
    echo ""
    info "Inicia PostgreSQL con:"
    echo "  docker-compose up -d osyris-db"
    echo ""
fi

check "Verificando servicios PM2"
PM2_STATUS=$(ssh "$SERVER" "pm2 list 2>/dev/null")

if echo "$PM2_STATUS" | grep -q "osyris-frontend"; then
    success "PM2: osyris-frontend encontrado"
else
    warning "PM2: osyris-frontend no encontrado (se creará en deploy)"
fi

if echo "$PM2_STATUS" | grep -q "osyris-backend"; then
    success "PM2: osyris-backend encontrado"
else
    warning "PM2: osyris-backend no encontrado (se creará en deploy)"
fi

echo ""

# ========================================
# SECCIÓN 3: Configuración Nginx y SSL
# ========================================
echo -e "${CYAN}━━━ SECCIÓN 3: Nginx y SSL ━━━${NC}"
echo ""

check "Verificando Nginx"
ssh "$SERVER" bash << 'EOF'
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx activo"
    exit 0
else
    echo "✗ Nginx NO activo"
    exit 1
fi
EOF

if [ $? -eq 0 ]; then
    success "Nginx operativo"
else
    error "Nginx NO está corriendo"
fi

check "Verificando SSL"
SSL_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://gruposcoutosyris.es 2>/dev/null)

if [ "$SSL_CHECK" = "200" ] || [ "$SSL_CHECK" = "301" ] || [ "$SSL_CHECK" = "302" ]; then
    success "SSL funcionando (HTTP $SSL_CHECK)"
else
    warning "Problema con SSL o dominio (HTTP $SSL_CHECK)"
fi

echo ""

# ========================================
# SECCIÓN 4: Resumen Final
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📊 RESUMEN DE VERIFICACIÓN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Total de verificaciones: ${TOTAL_CHECKS}"
echo -e "${GREEN}✓ Exitosas: ${PASSED_CHECKS}${NC}"
echo -e "${RED}✗ Fallidas: ${FAILED_CHECKS}${NC}"
echo -e "${YELLOW}! Advertencias: ${WARNING_CHECKS}${NC}"
echo ""

# Determinar resultado final
if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ VERIFICACIÓN FALLIDA${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${RED}⚠️  NO RECOMENDADO desplegar en este momento${NC}"
    echo ""
    info "Corrige los errores críticos antes de continuar"
    exit 1
elif [ $WARNING_CHECKS -gt 0 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  VERIFICACIÓN CON ADVERTENCIAS${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Puedes desplegar, pero revisa las advertencias${NC}"
    echo ""
    exit 0
else
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ VERIFICACIÓN EXITOSA${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}🎉 Todo listo para deploy a producción${NC}"
    echo ""
    info "Próximo paso: ./scripts/deploy-production-complete.sh"
    echo ""
    exit 0
fi

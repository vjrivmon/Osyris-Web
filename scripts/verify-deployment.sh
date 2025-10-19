#!/bin/bash

##############################################################
# Dashboard de Verificación Automatizada de Deploy
# Grupo Scout Osyris - Sistema de Gestión
# Verificación completa de frontend, backend y base de datos
# Tiempo estimado: 1-2 minutos
##############################################################

# Configuración
SERVER="root@116.203.98.142"
PROD_URL="https://gruposcoutosyris.es"
PROD_API="https://gruposcoutosyris.es/api"
STAGING_URL="http://116.203.98.142:3001"
STAGING_API="http://116.203.98.142:5001"
TIMEOUT=30
DATE=$(date +%Y%m%d_%H%M%S)

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Contadores para resultados
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Funciones de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((FAILED_CHECKS++))
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_CHECKS++))
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

check() {
    ((TOTAL_CHECKS++))
    echo -e "${MAGENTA}[CHECK]${NC} $1"
}

# Función para verificar URL
check_url() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}

    check "$description"
    if curl -f -s -m $TIMEOUT -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        success "$description - OK"
        return 0
    else
        error "$description - FAILED (HTTP $expected_status expected)"
        return 1
    fi
}

# Función para verificar API endpoint
check_api() {
    local endpoint=$1
    local description=$2
    local base_url=$3
    local expected_status=${4:-200}
    local url="$base_url/$endpoint"

    check "$description"
    if curl -f -s -m $TIMEOUT -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        success "$description - OK"
        return 0
    else
        error "$description - FAILED"
        return 1
    fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 Dashboard de Verificación Automatizada${NC}"
echo -e "${CYAN}Grupo Scout Osyris - Sistema de Gestión${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar argumentos
ENVIRONMENT="all"
if [ "$1" = "production" ] || [ "$1" = "prod" ]; then
    ENVIRONMENT="production"
elif [ "$1" = "staging" ] || [ "$1" = "stage" ]; then
    ENVIRONMENT="staging"
fi

info "🎯 Entorno a verificar: ${YELLOW}$ENVIRONMENT${NC}"
echo ""

# 1. Verificación de Producción
if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${MAGENTA}━━━━━━━━ PRODUCCIÓN ━━━━━━━━${NC}"
    echo ""

    # 1.1 Verificación básica de conectividad
    check_url "$PROD_URL" "Producción Frontend - Página principal"
    check_api "api/health" "Producción API - Health check" "$PROD_URL"

    # 1.2 Verificación de endpoints clave
    check_api "api/usuarios" "Producción API - Usuarios endpoint" "$PROD_URL"
    check_api "api/actividades" "Producción API - Actividades endpoint" "$PROD_URL"
    check_api "api/secciones" "Producción API - Secciones endpoint" "$PROD_URL"

    # 1.3 Verificación de páginas específicas
    check_url "$PROD_URL/login" "Producción - Página login"
    check_url "$PROD_URL/dashboard" "Producción - Dashboard"
    check_url "$PROD_URL/secciones" "Producción - Secciones"
    check_url "$PROD_URL/calendario" "Producción - Calendario"
    check_url "$PROD_URL/contacto" "Producción - Contacto"

    # 1.4 Verificación de assets
    check_url "$PROD_URL/_next/static/chunks/main-app.js" "Producción - JS Bundle"
    check_url "$PROD_URL/favicon.ico" "Producción - Favicon"

    echo ""
fi

# 2. Verificación de Staging
if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${MAGENTA}━━━━━━━━ STAGING ━━━━━━━━${NC}"
    echo ""

    # 2.1 Verificación básica de conectividad
    check_url "$STAGING_URL" "Staging Frontend - Página principal"
    check_api "api/health" "Staging API - Health check" "$STAGING_API"

    # 2.2 Verificación de endpoints clave
    check_url "http://116.203.98.142:5001/api/usuarios" "Staging API - Usuarios endpoint" 401
    check_api "api/actividades" "Staging API - Actividades endpoint" "$STAGING_API"
    check_api "api/secciones" "Staging API - Secciones endpoint" "$STAGING_API"

    # 2.3 Verificación de páginas específicas
    check_url "$STAGING_URL/login" "Staging - Página login"
    check_url "$STAGING_URL/dashboard" "Staging - Dashboard"
    check_url "$STAGING_URL/secciones" "Staging - Secciones"

    echo ""
fi

# 3. Verificación del Servidor (si es producción o all)
if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${MAGENTA}━━━━━━━━ SERVIDOR ━━━━━━━━${NC}"
    echo ""

    # 3.1 Verificación de servicios PM2
    check "Servicios PM2 en producción"
    PM2_STATUS=$(ssh "$SERVER" "pm2 list | grep 'osyris-.*online' | wc -l" 2>/dev/null)
    if [ "$PM2_STATUS" -ge 2 ]; then
        success "PM2 - $PM2_STATUS servicios corriendo"
    else
        error "PM2 - Solo $PM2_STATUS servicios corriendo (se esperan 2)"
    fi

    # 3.2 Verificación de uso de recursos
    check "Uso de memoria del servidor"
    MEM_USAGE=$(ssh "$SERVER" "free | grep Mem | awk '{printf \"%.1f\", \$3/\$2 * 100.0}'" 2>/dev/null)
    if (( $(echo "$MEM_USAGE < 90" | bc -l) )); then
        success "Memoria - ${MEM_USAGE}% utilizado"
    else
        error "Memoria - ${MEM_USAGE}% utilizado (alto)"
    fi

    # 3.3 Verificación de espacio en disco
    check "Espacio en disco"
    DISK_USAGE=$(ssh "$SERVER" "df / | awk 'NR==2 {print \$5}' | sed 's/%//'" 2>/dev/null)
    if [ "$DISK_USAGE" -lt 85 ]; then
        success "Disco - ${DISK_USAGE}% utilizado"
    else
        error "Disco - ${DISK_USAGE}% utilizado (alto)"
    fi

    # 3.4 Verificación de base de datos
    check "Base de datos PostgreSQL"
    DB_STATUS=$(ssh "$SERVER" "docker exec osyris-db pg_isready -U osyris_user" 2>/dev/null)
    if echo "$DB_STATUS" | grep -q "accepting connections"; then
        success "PostgreSQL - Conexiones aceptadas"
    else
        error "PostgreSQL - No responde"
    fi

    echo ""
fi

# 4. Verificación de SSL y Seguridad (solo producción)
if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${MAGENTA}━━━━━━━━ SEGURIDAD ━━━━━━━━${NC}"
    echo ""

    check "Certificado SSL"
    SSL_STATUS=$(echo | openssl s_client -connect gruposcoutosyris.es:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    if echo "$SSL_STATUS" | grep -q "notAfter"; then
        success "SSL - Certificado válido"
    else
        error "SSL - Problema con certificado"
    fi

    check "Headers de seguridad"
    SECURITY_HEADERS=$(curl -s -I "$PROD_URL" 2>/dev/null)
    if echo "$SECURITY_HEADERS" | grep -qi "x-frame-options\|content-security-policy\|x-content-type-options"; then
        success "Seguridad - Headers presentes"
    else
        warning "Seguridad - Algunos headers faltantes"
    fi

    echo ""
fi

# 5. Verificación de Rendimiento
if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${MAGENTA}━━━━━━━━ RENDIMIENTO ━━━━━━━━${NC}"
    echo ""

    check "Tiempo de respuesta del frontend"
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$PROD_URL" 2>/dev/null)
    if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
        success "Frontend - ${RESPONSE_TIME}s respuesta"
    else
        warning "Frontend - ${RESPONSE_TIME}s respuesta (lento)"
    fi

    check "Tiempo de respuesta del API"
    API_RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$PROD_URL/api/health" 2>/dev/null)
    if (( $(echo "$API_RESPONSE_TIME < 1.0" | bc -l) )); then
        success "API - ${API_RESPONSE_TIME}s respuesta"
    else
        warning "API - ${API_RESPONSE_TIME}s respuesta (lento)"
    fi

    echo ""
fi

# 6. Generación de reporte
echo -e "${BLUE}━━━━━━━━ REPORTE FINAL ━━━━━━━━${NC}"
echo ""

# Calcular porcentaje de éxito
if [ $TOTAL_CHECKS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
else
    SUCCESS_RATE=0
fi

echo -e "${CYAN}📊 Estadísticas:${NC}"
echo -e "  • Total de verificaciones: ${YELLOW}$TOTAL_CHECKS${NC}"
echo -e "  • Exitosas: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "  • Fallidas: ${RED}$FAILED_CHECKS${NC}"
echo -e "  • Tasa de éxito: ${YELLOW}$SUCCESS_RATE%${NC}"
echo ""

# Evaluación final
if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELENTE - El sistema está funcionando perfectamente${NC}"
    EXIT_CODE=0
elif [ $SUCCESS_RATE -ge 75 ]; then
    echo -e "${YELLOW}⚠️  BUENO - El sistema funciona con algunos problemas menores${NC}"
    EXIT_CODE=1
else
    echo -e "${RED}❌ PROBLEMAS - Se requiere atención inmediata${NC}"
    EXIT_CODE=2
fi

# Recomendaciones
echo ""
echo -e "${CYAN}💡 Recomendaciones:${NC}"

if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "  • ${RED}Revisar las verificaciones fallidas${NC}"
    echo -e "  • ${RED}Considerar ejecutar rollback si hay problemas críticos${NC}"
fi

if [ "$ENVIRONMENT" = "staging" ] && [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "  • ${GREEN}Staging está listo para deploy a producción${NC}"
    echo -e "  • ${GREEN}Ejecutar: ./scripts/deploy-to-production-from-staging.sh${NC}"
fi

if [ "$ENVIRONMENT" = "production" ] && [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "  • ${GREEN}Producción estable y funcionando correctamente${NC}"
    echo -e "  • ${GREEN}Monitorear regularmente con: ./scripts/verify-deployment.sh${NC}"
fi

echo ""
echo -e "${CYAN}🕐 Verificación completada en: ${YELLOW}$(date +%H:%M:%S)${NC}"
echo ""

exit $EXIT_CODE
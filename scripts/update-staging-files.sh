#!/bin/bash

##############################################################
# Script de Actualización Rápida de Archivos en Staging
# Grupo Scout Osyris - Sistema de Gestión
# Copia archivos modificados localmente a staging y reinicia servicios
# Uso: ./scripts/update-staging-files.sh [archivo1] [archivo2] ...
# Tiempo estimado: 30 segundos
##############################################################

# Configuración
SERVER="root@116.203.98.142"
STAGING_PATH="/var/www/osyris-staging/current"
LOCAL_PATH="$(pwd)"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funciones de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚡ Actualización Rápida de Archivos en Staging${NC}"
echo -e "${CYAN}Grupo Scout Osyris - Sistema de Gestión${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar argumentos
if [ $# -eq 0 ]; then
    info "📝 Uso: $0 [archivo1] [archivo2] ..."
    echo ""
    info "📋 Ejemplos:"
    echo "  • Actualizar un componente:"
    echo "    $0 src/components/aula-virtual/sidebar.tsx"
    echo ""
    echo "  • Actualizar múltiples archivos:"
    echo "    $0 src/app/aula-virtual/ajustes/page.tsx api-osyris/src/controllers/usuario.controller.js"
    echo ""
    echo "  • Actualizar todo el frontend:"
    echo "    $0 --rebuild-frontend"
    echo ""
    echo "  • Actualizar y reiniciar backend:"
    echo "    $0 --restart-backend api-osyris/src/controllers/*"
    echo ""
    exit 1
fi

# Variables de control
REBUILD_FRONTEND=false
RESTART_BACKEND=false
RESTART_FRONTEND=false
FILES_TO_COPY=()

# Procesar argumentos
for arg in "$@"; do
    case $arg in
        --rebuild-frontend)
            REBUILD_FRONTEND=true
            ;;
        --restart-backend)
            RESTART_BACKEND=true
            ;;
        --restart-frontend)
            RESTART_FRONTEND=true
            ;;
        *)
            FILES_TO_COPY+=("$arg")
            ;;
    esac
done

# Verificar conexión
log "🔍 Verificando conexión con staging..."
if ! ssh -o ConnectTimeout=10 "$SERVER" "echo 'Conexión OK'" >/dev/null 2>&1; then
    error "❌ No se puede conectar al servidor de staging"
    exit 1
fi
success "✅ Conexión establecida"

# Detectar si necesitamos rebuild o reinicio basado en los archivos
for file in "${FILES_TO_COPY[@]}"; do
    # Si es un archivo de frontend (src/), marcar para posible rebuild
    if [[ "$file" == src/* ]]; then
        if [[ "$file" == src/app/* ]] || [[ "$file" == src/components/* ]]; then
            RESTART_FRONTEND=true
        fi
    fi
    
    # Si es un archivo de backend (api-osyris/), marcar para reinicio
    if [[ "$file" == api-osyris/* ]]; then
        RESTART_BACKEND=true
    fi
done

# Copiar archivos
log "📁 Copiando archivos a staging..."
COPIED_COUNT=0
for file in "${FILES_TO_COPY[@]}"; do
    if [ ! -f "$file" ]; then
        warning "⚠️  Archivo no encontrado: $file"
        continue
    fi
    
    # Calcular ruta remota
    REMOTE_FILE="$STAGING_PATH/$file"
    
    # Crear directorio remoto si no existe
    REMOTE_DIR=$(dirname "$REMOTE_FILE")
    ssh "$SERVER" "mkdir -p '$REMOTE_DIR'" 2>/dev/null
    
    # Copiar archivo
    if scp "$file" "$SERVER:$REMOTE_FILE" >/dev/null 2>&1; then
        success "✅ Copiado: $file"
        COPIED_COUNT=$((COPIED_COUNT + 1))
    else
        error "❌ Error copiando: $file"
    fi
done

if [ $COPIED_COUNT -eq 0 ]; then
    error "❌ No se copiaron archivos"
    exit 1
fi

success "✅ $COPIED_COUNT archivo(s) copiado(s)"

# Rebuild frontend si es necesario
if [ "$REBUILD_FRONTEND" = true ]; then
    log "🏗️ Rebuilding frontend en staging..."
    ssh "$SERVER" bash << EOF
set -e
cd "$STAGING_PATH"
rm -rf .next
export NEXT_PUBLIC_API_URL="http://116.203.98.142:5001"
export API_BASE_URL="http://116.203.98.142:5001"
export NODE_ENV="production"
export NEXT_PUBLIC_STAGING="true"
npm run build 2>&1 | tail -15
EOF
    
    if [ $? -eq 0 ]; then
        success "✅ Frontend rebuildeado"
        RESTART_FRONTEND=true
    else
        error "❌ Error en rebuild del frontend"
        exit 1
    fi
fi

# Reiniciar servicios
if [ "$RESTART_BACKEND" = true ] || [ "$RESTART_FRONTEND" = true ]; then
    log "🔄 Reiniciando servicios..."
    
    if [ "$RESTART_BACKEND" = true ]; then
        ssh "$SERVER" "pm2 restart osyris-staging-backend" >/dev/null 2>&1
        success "✅ Backend staging reiniciado"
    fi
    
    if [ "$RESTART_FRONTEND" = true ]; then
        ssh "$SERVER" "pm2 restart osyris-staging-frontend" >/dev/null 2>&1
        success "✅ Frontend staging reiniciado"
    fi
    
    # Esperar a que los servicios estén listos
    log "⏳ Esperando a que los servicios estén listos..."
    sleep 5
    
    # Verificar estado
    ssh "$SERVER" "pm2 list | grep osyris-staging"
fi

# Resumen final
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Actualización de Staging Completada${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📊 Resumen:${NC}"
echo -e "  • Archivos copiados: ${GREEN}$COPIED_COUNT${NC}"
echo -e "  • Backend reiniciado: ${GREEN}$([ "$RESTART_BACKEND" = true ] && echo "Sí" || echo "No")${NC}"
echo -e "  • Frontend reiniciado: ${GREEN}$([ "$RESTART_FRONTEND" = true ] && echo "Sí" || echo "No")${NC}"
echo ""
echo -e "${CYAN}🌐 Staging:${NC}"
echo -e "  • Frontend: ${YELLOW}http://116.203.98.142:3001${NC}"
echo -e "  • Backend: ${YELLOW}http://116.203.98.142:5001${NC}"
echo ""
echo -e "${CYAN}📋 Próximos pasos:${NC}"
echo -e "  1. Verifica los cambios en staging"
echo -e "  2. Si todo está OK, ejecuta: ${YELLOW}./scripts/deploy-to-production-from-staging.sh${NC}"
echo ""


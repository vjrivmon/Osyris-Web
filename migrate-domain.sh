#!/bin/bash
##############################################################################
# Script de Migración de Dominio: gruposcoutsosyris.es → gruposcoutosyris.es
# Servidor: Hetzner (116.203.98.142)
# Fecha: 2025-10-13
##############################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    log_error "docker-compose.prod.yml no encontrado. Ejecuta este script desde ~/osyris-production"
    exit 1
fi

log_info "==================================================================="
log_info "MIGRACIÓN DE DOMINIO: gruposcoutsosyris.es → gruposcoutosyris.es"
log_info "==================================================================="
echo ""

##############################################################################
# FASE 1: Backup de configuración actual
##############################################################################
log_info "FASE 1: Creando backup de configuración actual..."

BACKUP_DIR=~/backup-migration-$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Backup de Nginx
if [ -f "/etc/nginx/sites-available/osyris" ]; then
    sudo cp /etc/nginx/sites-available/osyris "$BACKUP_DIR/nginx-osyris.conf.backup"
    log_success "Backup de Nginx creado en $BACKUP_DIR"
fi

# Backup de docker-compose
cp docker-compose.prod.yml "$BACKUP_DIR/docker-compose.prod.yml.backup"
log_success "Backup de docker-compose creado"

echo ""

##############################################################################
# FASE 2: Pull de cambios del repositorio
##############################################################################
log_info "FASE 2: Actualizando código desde GitHub..."

git fetch origin
git pull origin main
log_success "Código actualizado correctamente"

# Verificar que el dominio correcto está en docker-compose
if grep -q "gruposcoutosyris.es" docker-compose.prod.yml; then
    log_success "Dominio correcto encontrado en docker-compose.prod.yml"
else
    log_error "El dominio correcto NO está en docker-compose.prod.yml"
    log_error "Verifica que hayas pusheado los cambios desde tu máquina local"
    exit 1
fi

echo ""

##############################################################################
# FASE 3: Actualizar configuración de Nginx
##############################################################################
log_info "FASE 3: Actualizando configuración de Nginx..."

# Verificar si el archivo de Nginx existe
if [ -f "/etc/nginx/sites-available/osyris" ]; then
    log_info "Reemplazando dominio en configuración de Nginx..."
    
    sudo sed -i 's/gruposcoutsosyris\.es/gruposcoutosyris.es/g' /etc/nginx/sites-available/osyris
    
    # Verificar sintaxis de Nginx
    if sudo nginx -t 2>&1; then
        log_success "Configuración de Nginx actualizada y verificada"
    else
        log_error "Error en la sintaxis de Nginx. Restaurando backup..."
        sudo cp "$BACKUP_DIR/nginx-osyris.conf.backup" /etc/nginx/sites-available/osyris
        exit 1
    fi
else
    log_warning "Archivo de Nginx no encontrado en /etc/nginx/sites-available/osyris"
    log_warning "Necesitarás configurar Nginx manualmente después"
fi

echo ""

##############################################################################
# FASE 4: Detener contenedores actuales
##############################################################################
log_info "FASE 4: Deteniendo contenedores actuales..."

docker compose -f docker-compose.prod.yml down
log_success "Contenedores detenidos"

echo ""

##############################################################################
# FASE 5: Limpiar imágenes antiguas
##############################################################################
log_info "FASE 5: Limpiando imágenes Docker antiguas..."

docker image prune -f
log_success "Imágenes antiguas eliminadas"

echo ""

##############################################################################
# FASE 6: Reconstruir imágenes con nuevo dominio
##############################################################################
log_info "FASE 6: Reconstruyendo imágenes Docker (esto puede tomar varios minutos)..."

docker compose -f docker-compose.prod.yml build --no-cache
log_success "Imágenes reconstruidas correctamente"

echo ""

##############################################################################
# FASE 7: Levantar servicios
##############################################################################
log_info "FASE 7: Levantando servicios..."

docker compose -f docker-compose.prod.yml up -d
log_success "Servicios levantados"

echo ""

##############################################################################
# FASE 8: Verificar estado de los servicios
##############################################################################
log_info "FASE 8: Verificando estado de los servicios..."

sleep 10  # Esperar a que los servicios inicien

echo ""
log_info "Estado de los contenedores:"
docker compose -f docker-compose.prod.yml ps

echo ""

# Verificar health de cada servicio
log_info "Esperando a que los servicios estén healthy (max 60s)..."

for i in {1..12}; do
    HEALTHY_COUNT=$(docker compose -f docker-compose.prod.yml ps --format json | grep -c '"Health":"healthy"' || true)
    if [ "$HEALTHY_COUNT" -eq 3 ]; then
        log_success "✅ Todos los servicios están healthy!"
        break
    fi
    
    if [ $i -eq 12 ]; then
        log_warning "⚠️  Algunos servicios pueden no estar healthy todavía"
        log_info "Verifica los logs con: docker compose -f docker-compose.prod.yml logs"
    else
        echo -n "."
        sleep 5
    fi
done

echo ""

##############################################################################
# FASE 9: Recargar Nginx
##############################################################################
log_info "FASE 9: Recargando Nginx..."

if systemctl is-active --quiet nginx; then
    sudo systemctl reload nginx
    log_success "Nginx recargado"
else
    log_warning "Nginx no está corriendo, intentando iniciar..."
    sudo systemctl start nginx
    if systemctl is-active --quiet nginx; then
        log_success "Nginx iniciado"
    else
        log_error "No se pudo iniciar Nginx. Verifica: sudo systemctl status nginx"
    fi
fi

echo ""

##############################################################################
# FASE 10: Verificaciones finales
##############################################################################
log_info "FASE 10: Verificaciones finales..."

echo ""
log_info "Verificando backend (puerto 5000)..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    log_success "✅ Backend respondiendo correctamente"
else
    log_warning "⚠️  Backend no responde en puerto 5000"
fi

echo ""
log_info "Verificando frontend (puerto 3000)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    log_success "✅ Frontend respondiendo correctamente"
else
    log_warning "⚠️  Frontend no responde en puerto 3000"
fi

echo ""
log_info "Verificando Nginx..."
if curl -s -I http://localhost | grep -q "HTTP"; then
    log_success "✅ Nginx respondiendo correctamente"
else
    log_warning "⚠️  Nginx no responde"
fi

echo ""

##############################################################################
# RESUMEN FINAL
##############################################################################
log_info "==================================================================="
log_success "MIGRACIÓN COMPLETADA"
log_info "==================================================================="
echo ""
log_info "📁 Backup guardado en: $BACKUP_DIR"
log_info "📝 Para ver logs: docker compose -f docker-compose.prod.yml logs -f"
log_info "📊 Para ver estado: docker compose -f docker-compose.prod.yml ps"
echo ""
log_warning "⚠️  IMPORTANTE: Regenerar certificados SSL"
log_info "Una vez que el DNS se haya propagado (dig gruposcoutosyris.es = 116.203.98.142):"
echo ""
echo "   1. Desactivar proxy de Cloudflare (DNS → Click en 🟠 → DNS only)"
echo "   2. Esperar 2-3 minutos"
echo "   3. Ejecutar: sudo certbot delete --cert-name gruposcoutsosyris.es"
echo "   4. Ejecutar: sudo certbot --nginx -d gruposcoutosyris.es -d www.gruposcoutosyris.es"
echo "   5. Reactivar proxy de Cloudflare (DNS → Click en ☁️ → Proxied)"
echo ""
log_info "==================================================================="


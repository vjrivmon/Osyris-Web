#!/bin/bash

################################################################################
# Script de Restauración de Backup
# Para: Osyris Scout Management System
# Autor: Vicente Rivas Monferrer
# Descripción: Restaura backup completo de la aplicación
################################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
APP_DIR="${APP_DIR:-$HOME/osyris-production}"

# Funciones de logging
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

# Banner
clear
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║     Osyris Scout - Restauración de Backup           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Listar backups disponibles
log_info "Backups disponibles:"
echo ""
BACKUPS=($(ls -1t "$BACKUP_DIR" | grep osyris_backup_))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    log_error "No se encontraron backups en $BACKUP_DIR"
    exit 1
fi

for i in "${!BACKUPS[@]}"; do
    SIZE=$(du -sh "$BACKUP_DIR/${BACKUPS[$i]}" 2>/dev/null | cut -f1 || echo "N/A")
    echo "  [$i] ${BACKUPS[$i]} ($SIZE)"
done

echo ""
read -p "Selecciona el número del backup a restaurar: " BACKUP_INDEX

if [ -z "$BACKUP_INDEX" ] || [ "$BACKUP_INDEX" -ge "${#BACKUPS[@]}" ]; then
    log_error "Selección inválida"
    exit 1
fi

BACKUP_NAME="${BACKUPS[$BACKUP_INDEX]}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

log_info "Backup seleccionado: $BACKUP_NAME"
echo ""

# Mostrar manifiesto si existe
if [ -f "$BACKUP_PATH/manifest.txt" ]; then
    cat "$BACKUP_PATH/manifest.txt"
    echo ""
fi

# Confirmación
log_warning "⚠️  ADVERTENCIA: Esta operación sobrescribirá los datos actuales"
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    log_warning "Restauración cancelada"
    exit 0
fi

echo ""
log_info "Iniciando restauración..."

# 1. Detener servicios
log_info "Deteniendo servicios Docker..."
cd "$APP_DIR"
if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml down
    log_success "Servicios detenidos"
else
    log_warning "docker-compose.prod.yml no encontrado"
fi

# 2. Restaurar base de datos
log_info "Restaurando base de datos..."
if [ -f "$BACKUP_PATH/database.sql.gz" ]; then
    # Levantar solo la base de datos
    docker-compose -f docker-compose.prod.yml up -d db
    sleep 10

    # Restaurar dump
    gunzip < "$BACKUP_PATH/database.sql.gz" | docker exec -i osyris-db psql -U osyris_user osyris_db
    log_success "Base de datos restaurada"
else
    log_warning "Backup de base de datos no encontrado"
fi

# 3. Restaurar uploads
log_info "Restaurando archivos uploads..."
if [ -f "$BACKUP_PATH/uploads.tar.gz" ]; then
    # Hacer backup del actual por si acaso
    if [ -d "$APP_DIR/api-osyris/uploads" ]; then
        mv "$APP_DIR/api-osyris/uploads" "$APP_DIR/api-osyris/uploads.old.$(date +%s)"
    fi

    # Restaurar
    tar -xzf "$BACKUP_PATH/uploads.tar.gz" -C "$APP_DIR/api-osyris/"
    log_success "Uploads restaurados"
else
    log_warning "Backup de uploads no encontrado"
fi

# 4. Restaurar configuración
log_info "Restaurando configuración..."
if [ -f "$BACKUP_PATH/config.tar.gz" ]; then
    TEMP_CONFIG=$(mktemp -d)
    tar -xzf "$BACKUP_PATH/config.tar.gz" -C "$TEMP_CONFIG"

    # .env.production
    if [ -f "$TEMP_CONFIG/config/.env.production" ]; then
        cp "$TEMP_CONFIG/config/.env.production" "$APP_DIR/.env.production"
        log_success "Variables de entorno restauradas"
    fi

    # docker-compose.prod.yml
    if [ -f "$TEMP_CONFIG/config/docker-compose.prod.yml" ]; then
        cp "$TEMP_CONFIG/config/docker-compose.prod.yml" "$APP_DIR/"
        log_success "Docker Compose restaurado"
    fi

    # Nginx config
    if [ -f "$TEMP_CONFIG/config/nginx-osyris.conf" ]; then
        sudo cp "$TEMP_CONFIG/config/nginx-osyris.conf" /etc/nginx/sites-available/osyris
        sudo nginx -t
        sudo systemctl reload nginx
        log_success "Configuración Nginx restaurada"
    fi

    rm -rf "$TEMP_CONFIG"
else
    log_warning "Backup de configuración no encontrado"
fi

# 5. Restaurar logs (opcional)
if [ -f "$BACKUP_PATH/logs.tar.gz" ]; then
    log_info "¿Deseas restaurar los logs? (y/N)"
    read -p "> " RESTORE_LOGS
    if [[ $RESTORE_LOGS =~ ^[Yy]$ ]]; then
        tar -xzf "$BACKUP_PATH/logs.tar.gz" -C "$APP_DIR/api-osyris/"
        log_success "Logs restaurados"
    fi
fi

# 6. Reiniciar servicios
log_info "Reiniciando servicios..."
cd "$APP_DIR"
docker-compose -f docker-compose.prod.yml up -d
log_success "Servicios iniciados"

# 7. Verificar estado
log_info "Verificando estado de los servicios..."
sleep 15
docker-compose -f docker-compose.prod.yml ps

# Resumen final
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ Restauración Completada ✅               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Resumen de la Restauración:"
echo "  📁 Backup: $BACKUP_NAME"
echo "  🗂️  Ubicación: $BACKUP_PATH"
echo ""
echo "  Elementos restaurados:"
[ -f "$BACKUP_PATH/database.sql.gz" ] && echo "    ✅ Base de datos"
[ -f "$BACKUP_PATH/uploads.tar.gz" ] && echo "    ✅ Archivos uploads"
[ -f "$BACKUP_PATH/config.tar.gz" ] && echo "    ✅ Configuración"
echo ""
log_warning "⚠️  Acciones Post-Restauración:"
echo "  1. Verifica que los servicios están funcionando:"
echo "     docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "  2. Prueba el acceso a la aplicación"
echo ""
echo "  3. Si hay problemas, los archivos antiguos están en:"
echo "     $APP_DIR/api-osyris/uploads.old.*"
echo ""
log_success "Restauración completada exitosamente"
echo ""
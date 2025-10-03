#!/bin/bash

################################################################################
# Script de Configuración de Backups Automáticos (Cron)
# Para: Osyris Scout Management System
# Autor: Vicente Rivas Monferrer
# Descripción: Configura backups automáticos diarios mediante cron
################################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
echo "║    Osyris Scout - Configuración de Cron Backups     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuración
SCRIPT_DIR="$HOME/osyris-production/scripts/deployment"
BACKUP_SCRIPT="$SCRIPT_DIR/04-backup-system.sh"
LOG_DIR="$HOME/logs"

# Verificar que existe el script de backup
if [ ! -f "$BACKUP_SCRIPT" ]; then
    log_error "Script de backup no encontrado: $BACKUP_SCRIPT"
    exit 1
fi

# Crear directorio de logs
mkdir -p "$LOG_DIR"
log_success "Directorio de logs: $LOG_DIR"

# Opciones de frecuencia
echo ""
log_info "Selecciona la frecuencia de backups automáticos:"
echo ""
echo "  [1] Diario a las 03:00 AM (Recomendado)"
echo "  [2] Cada 12 horas (03:00 y 15:00)"
echo "  [3] Semanal (Domingo a las 03:00 AM)"
echo "  [4] Personalizado"
echo "  [5] No configurar (solo manual)"
echo ""
read -p "Opción: " FREQ_OPTION

case $FREQ_OPTION in
    1)
        CRON_SCHEDULE="0 3 * * *"
        DESCRIPTION="Diario a las 03:00 AM"
        ;;
    2)
        CRON_SCHEDULE="0 3,15 * * *"
        DESCRIPTION="Cada 12 horas (03:00 y 15:00)"
        ;;
    3)
        CRON_SCHEDULE="0 3 * * 0"
        DESCRIPTION="Semanal (Domingo 03:00 AM)"
        ;;
    4)
        echo ""
        log_info "Formato de cron: minuto hora día mes día_semana"
        log_info "Ejemplo: 0 3 * * * (cada día a las 3:00 AM)"
        read -p "Introduce el schedule de cron: " CRON_SCHEDULE
        DESCRIPTION="Personalizado: $CRON_SCHEDULE"
        ;;
    5)
        log_info "No se configurarán backups automáticos"
        log_info "Puedes ejecutar backups manualmente con:"
        echo "  $BACKUP_SCRIPT"
        exit 0
        ;;
    *)
        log_error "Opción inválida"
        exit 1
        ;;
esac

echo ""
log_info "Configuración seleccionada: $DESCRIPTION"
log_info "Cron schedule: $CRON_SCHEDULE"
echo ""

# Configurar retención
read -p "¿Cuántos días deseas mantener los backups? (default: 30): " RETENTION_DAYS
RETENTION_DAYS=${RETENTION_DAYS:-30}
log_info "Retención configurada: $RETENTION_DAYS días"

# Crear wrapper script con logging
log_info "Creando script wrapper con logging..."
WRAPPER_SCRIPT="$HOME/run-backup.sh"

cat > "$WRAPPER_SCRIPT" << EOF
#!/bin/bash

################################################################################
# Wrapper Script para Backup Automatizado
# Generado automáticamente - No editar manualmente
################################################################################

# Configuración
export BACKUP_DIR="\$HOME/backups"
export APP_DIR="\$HOME/osyris-production"
export RETENTION_DAYS=$RETENTION_DAYS
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Logs
LOG_FILE="$LOG_DIR/backup_\$(date +%Y%m%d).log"
ERROR_LOG="$LOG_DIR/backup_errors.log"

# Función de logging
log() {
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] \$1" | tee -a "\$LOG_FILE"
}

# Inicio
log "========================================="
log "Iniciando backup automático de Osyris Scout"
log "========================================="

# Ejecutar backup
if bash "$BACKUP_SCRIPT" >> "\$LOG_FILE" 2>&1; then
    log "✅ Backup completado exitosamente"

    # Limpiar logs antiguos (mantener 60 días)
    find "$LOG_DIR" -name "backup_*.log" -mtime +60 -delete

    exit 0
else
    log "❌ Error en el backup"
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] Error en backup automático" >> "\$ERROR_LOG"

    # Opcional: Enviar notificación por email (configurar después)
    # echo "Error en backup de Osyris Scout" | mail -s "Error Backup Osyris" admin@grupooosyris.es

    exit 1
fi
EOF

chmod +x "$WRAPPER_SCRIPT"
log_success "Wrapper script creado: $WRAPPER_SCRIPT"

# Añadir a crontab
log_info "Configurando crontab..."

# Backup del crontab actual
crontab -l > /tmp/crontab_backup_$$ 2>/dev/null || true

# Eliminar entradas antiguas de backup de Osyris
crontab -l 2>/dev/null | grep -v "run-backup.sh" | grep -v "Osyris Scout Backup" > /tmp/crontab_new_$$ || true

# Añadir nueva entrada
cat >> /tmp/crontab_new_$$ << EOF

# Osyris Scout Backup Automático - $DESCRIPTION
$CRON_SCHEDULE $WRAPPER_SCRIPT

EOF

# Instalar nuevo crontab
crontab /tmp/crontab_new_$$
rm /tmp/crontab_new_$$

log_success "Crontab configurado correctamente"

# Verificar crontab
log_info "Verificando configuración de cron..."
echo ""
crontab -l | grep -A1 "Osyris Scout"
echo ""

# Crear script de monitoreo de backups
log_info "Creando script de monitoreo..."
MONITOR_SCRIPT="$HOME/monitor-backups.sh"

cat > "$MONITOR_SCRIPT" << 'MONITOR'
#!/bin/bash

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Osyris Scout - Monitor de Backups              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Directorio de backups
BACKUP_DIR="$HOME/backups"
LOG_DIR="$HOME/logs"

# Último backup
LAST_BACKUP=$(ls -1t "$BACKUP_DIR" | grep osyris_backup_ | head -1)
if [ -n "$LAST_BACKUP" ]; then
    BACKUP_DATE=$(echo "$LAST_BACKUP" | sed 's/osyris_backup_//' | sed 's/_/ /')
    BACKUP_AGE=$(find "$BACKUP_DIR/$LAST_BACKUP" -type d -mtime +1 | wc -l)

    echo -e "${GREEN}📦 Último Backup:${NC} $LAST_BACKUP"
    echo -e "${GREEN}📅 Fecha:${NC} $BACKUP_DATE"

    if [ $BACKUP_AGE -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Advertencia: El último backup tiene más de 24 horas${NC}"
    else
        echo -e "${GREEN}✅ Backup reciente (< 24 horas)${NC}"
    fi

    # Tamaño
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$LAST_BACKUP" | cut -f1)
    echo -e "${GREEN}💾 Tamaño:${NC} $BACKUP_SIZE"
else
    echo -e "${RED}❌ No se encontraron backups${NC}"
fi

echo ""
echo -e "${BLUE}📊 Estadísticas de Backups:${NC}"
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | grep osyris_backup_ | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
echo "  • Total de backups: $BACKUP_COUNT"
echo "  • Espacio utilizado: $TOTAL_SIZE"

echo ""
echo -e "${BLUE}📝 Últimos Logs:${NC}"
if [ -f "$LOG_DIR/backup_$(date +%Y%m%d).log" ]; then
    echo -e "${GREEN}✅ Log de hoy disponible${NC}"
    tail -5 "$LOG_DIR/backup_$(date +%Y%m%d).log"
else
    echo -e "${YELLOW}⚠️  No hay log de backup hoy${NC}"
fi

# Verificar errores recientes
if [ -f "$LOG_DIR/backup_errors.log" ]; then
    ERROR_COUNT=$(wc -l < "$LOG_DIR/backup_errors.log")
    if [ $ERROR_COUNT -gt 0 ]; then
        echo ""
        echo -e "${RED}❌ Errores detectados ($ERROR_COUNT):${NC}"
        tail -3 "$LOG_DIR/backup_errors.log"
    fi
fi

echo ""
echo -e "${BLUE}🗓️  Próximos Backups Programados:${NC}"
crontab -l | grep "run-backup.sh" | grep -v "^#"

echo ""
MONITOR

chmod +x "$MONITOR_SCRIPT"
log_success "Script de monitoreo creado: $MONITOR_SCRIPT"

# Test del backup
echo ""
log_warning "¿Deseas ejecutar un backup de prueba ahora? (y/N)"
read -p "> " RUN_TEST

if [[ $RUN_TEST =~ ^[Yy]$ ]]; then
    log_info "Ejecutando backup de prueba..."
    bash "$WRAPPER_SCRIPT"
fi

# Resumen final
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ Backups Automáticos Configurados ✅       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Configuración de Backups Automáticos:"
echo "  ⏰ Frecuencia: $DESCRIPTION"
echo "  🗓️  Retención: $RETENTION_DAYS días"
echo "  📁 Directorio: $HOME/backups"
echo "  📝 Logs: $LOG_DIR"
echo ""
log_info "Comandos útiles:"
echo "  • Ver backups: ls -lht ~/backups"
echo "  • Monitor: $MONITOR_SCRIPT"
echo "  • Ver logs: tail -f $LOG_DIR/backup_$(date +%Y%m%d).log"
echo "  • Backup manual: $BACKUP_SCRIPT"
echo "  • Restaurar: $SCRIPT_DIR/05-restore-backup.sh"
echo "  • Editar cron: crontab -e"
echo ""
log_success "Sistema de backups automáticos configurado correctamente"
echo ""
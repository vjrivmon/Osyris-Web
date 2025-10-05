#!/bin/bash

# Script para iniciar el servidor MCP de Playwright
# Autor: Vicente - DevOps Training
# Fecha: $(date +%Y-%m-%d)

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuración
MCP_PORT=3001
MCP_HOST="localhost"
PIDFILE="/tmp/playwright-mcp.pid"

# Función para verificar si el puerto está en uso
check_port() {
    if lsof -Pi :$MCP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Función para detener servidor existente
stop_server() {
    if [ -f "$PIDFILE" ]; then
        local pid=$(cat "$PIDFILE")
        if kill -0 "$pid" 2>/dev/null; then
            log "Deteniendo servidor MCP existente (PID: $pid)..."
            kill -TERM "$pid" 2>/dev/null || true
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                kill -KILL "$pid" 2>/dev/null || true
            fi
        fi
        rm -f "$PIDFILE"
    fi
    
    # Matar cualquier proceso en el puerto
    if check_port; then
        warning "Puerto $MCP_PORT ocupado, liberando..."
        lsof -ti:$MCP_PORT | xargs kill -TERM 2>/dev/null || true
        sleep 2
        if check_port; then
            lsof -ti:$MCP_PORT | xargs kill -KILL 2>/dev/null || true
        fi
    fi
}

# Función para iniciar servidor
start_server() {
    log "Iniciando servidor MCP de Playwright en puerto $MCP_PORT..."
    
    # Crear directorios necesarios
    mkdir -p screenshots videos traces
    
    # Iniciar servidor en background
    nohup npx -y @playwright/mcp@latest \
        --headless \
        --browser=chromium \
        --no-sandbox \
        --port=$MCP_PORT \
        --host=$MCP_HOST \
        --output-dir=./screenshots \
        --viewport-size=1280x720 \
        --timeout-action=10000 \
        --timeout-navigation=30000 \
        --ignore-https-errors \
        > /tmp/playwright-mcp.log 2>&1 &
    
    local pid=$!
    echo $pid > "$PIDFILE"
    
    # Esperar a que el servidor esté listo
    log "Esperando que el servidor esté listo..."
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if check_port; then
            success "Servidor MCP iniciado correctamente en http://$MCP_HOST:$MCP_PORT"
            success "PID: $pid"
            echo ""
            echo "📋 CONFIGURACIÓN PARA CLAUDE:"
            echo '{'
            echo '  "mcpServers": {'
            echo '    "playwright": {'
            echo "      \"url\": \"http://$MCP_HOST:$MCP_PORT/mcp\""
            echo '    }'
            echo '  }'
            echo '}'
            echo ""
            return 0
        fi
        
        sleep 1
        attempts=$((attempts + 1))
    done
    
    error "Timeout: El servidor no respondió en $max_attempts segundos"
    if [ -f "$PIDFILE" ]; then
        local pid=$(cat "$PIDFILE")
        kill -KILL "$pid" 2>/dev/null || true
        rm -f "$PIDFILE"
    fi
    return 1
}

# Función para mostrar estado
status_server() {
    if [ -f "$PIDFILE" ]; then
        local pid=$(cat "$PIDFILE")
        if kill -0 "$pid" 2>/dev/null; then
            success "Servidor MCP ejecutándose (PID: $pid)"
            if check_port; then
                success "Puerto $MCP_PORT disponible"
                echo "URL: http://$MCP_HOST:$MCP_PORT/mcp"
            else
                warning "PID existe pero puerto no disponible"
            fi
            return 0
        else
            warning "PID file existe pero proceso no está ejecutándose"
            rm -f "$PIDFILE"
        fi
    fi
    
    if check_port; then
        warning "Puerto $MCP_PORT en uso por otro proceso"
        lsof -i :$MCP_PORT
        return 1
    else
        log "Servidor MCP no está ejecutándose"
        return 1
    fi
}

# Función para mostrar logs
show_logs() {
    if [ -f "/tmp/playwright-mcp.log" ]; then
        echo "📜 ÚLTIMAS LÍNEAS DEL LOG:"
        echo "=========================="
        tail -n 20 /tmp/playwright-mcp.log
    else
        warning "No se encontró archivo de log"
    fi
}

# Función principal
main() {
    case "${1:-start}" in
        "start")
            echo "🎭 Iniciando Servidor MCP de Playwright"
            echo "======================================="
            stop_server
            start_server
            ;;
        "stop")
            echo "🛑 Deteniendo Servidor MCP de Playwright"
            echo "========================================"
            stop_server
            success "Servidor detenido"
            ;;
        "restart")
            echo "🔄 Reiniciando Servidor MCP de Playwright"
            echo "========================================="
            stop_server
            sleep 2
            start_server
            ;;
        "status")
            echo "📊 Estado del Servidor MCP de Playwright"
            echo "========================================"
            status_server
            ;;
        "logs")
            show_logs
            ;;
        *)
            echo "Uso: $0 {start|stop|restart|status|logs}"
            echo ""
            echo "Comandos:"
            echo "  start   - Iniciar servidor MCP"
            echo "  stop    - Detener servidor MCP"
            echo "  restart - Reiniciar servidor MCP"
            echo "  status  - Ver estado del servidor"
            echo "  logs    - Ver logs del servidor"
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"







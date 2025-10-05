#!/bin/bash

# Script de automatización para levantamiento de desarrollo
# Grupo Scout Osyris - Sistema de Gestión
# Autor: Vicente Rivas Monferrer

echo "🚀 Iniciando entorno de desarrollo Osyris..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
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

# FUNCIÓN COMPLETA DE LIMPIEZA DE PROCESOS
log "🛑 Matando TODOS los procesos de desarrollo previos..."

# Matar procesos específicos por puerto (ahora incluye 3000)
for port in 3000 5000; do
    # Método 1: lsof
    PIDS=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PIDS" ]; then
        warning "Matando procesos en puerto $port (lsof): $PIDS"
        echo $PIDS | xargs -r kill -9
        sleep 1
    fi

    # Método 2: fuser (más agresivo para procesos fantasma)
    fuser -k $port/tcp 2>/dev/null && warning "Forzada limpieza de puerto $port con fuser"
    sleep 1

    # Verificar que quedó libre
    if lsof -ti:$port >/dev/null 2>&1; then
        warning "Puerto $port sigue ocupado después de limpieza"
    else
        log "Puerto $port está libre"
    fi
done

# Matar procesos por nombre de forma más agresiva
log "Matando procesos de desarrollo por nombre..."
pkill -f "next dev" 2>/dev/null && warning "Procesos Next.js eliminados"
pkill -f "nodemon" 2>/dev/null && warning "Procesos nodemon eliminados"
pkill -f "concurrently" 2>/dev/null && warning "Procesos concurrently eliminados"
pkill -f "osyris" 2>/dev/null && warning "Procesos osyris eliminados"

# Esperar que se liberen completamente
sleep 3

# Limpiar caché de Next.js para forzar recompilación
log "🧹 Limpiando caché de Next.js..."
if [ -d ".next" ]; then
    rm -rf .next
    success "✅ Caché .next/ eliminado"
fi
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    success "✅ Caché node_modules/.cache/ eliminado"
fi
if [ -d ".turbopack" ]; then
    rm -rf .turbopack
    success "✅ Caché .turbopack/ eliminado"
fi

# Verificación final y forzado si es necesario
log "Verificación final de puertos..."
for port in 3000 5000; do
    attempts=0
    max_attempts=5
    while [ $attempts -lt $max_attempts ]; do
        if lsof -ti:$port >/dev/null 2>&1; then
            warning "Puerto $port sigue ocupado, forzando limpieza... (intento $((attempts + 1)))"
            # Intentar múltiples métodos
            lsof -ti:$port | xargs -r kill -9 2>/dev/null
            fuser -k $port/tcp 2>/dev/null
            pkill -9 -f ":$port" 2>/dev/null
            sleep 2
            attempts=$((attempts + 1))
        else
            success "✅ Puerto $port completamente liberado"
            break
        fi
    done

    # Si después de 5 intentos sigue ocupado, mostrar error
    if [ $attempts -eq $max_attempts ] && lsof -ti:$port >/dev/null 2>&1; then
        error "❌ No se pudo liberar el puerto $port después de $max_attempts intentos"
        error "Proceso persistente detectado. Ejecuta manualmente:"
        error "  sudo fuser -k $port/tcp"
        exit 1
    fi
done

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que existe la carpeta api-osyris
if [ ! -d "api-osyris" ]; then
    error "No se encontró el directorio api-osyris. Verifica la estructura del proyecto."
    exit 1
fi

# Instalar dependencias si es necesario
log "Verificando dependencias..."

if [ ! -d "node_modules" ]; then
    log "Instalando dependencias del frontend..."
    npm install
fi

if [ ! -d "api-osyris/node_modules" ]; then
    log "Instalando dependencias del backend..."
    cd api-osyris && npm install && cd ..
fi

# Verificar configuración de Next.js
log "Verificando configuración..."

# Crear archivo de configuración temporal si no existe
if [ ! -f "next.config.js" ]; then
    warning "Creando configuración básica de Next.js..."
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  outputFileTracingRoot: __dirname,
  // Silenciar warning de múltiples lockfiles
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
EOF
fi

# Función para verificar si un puerto está libre
wait_for_port() {
    local port=$1
    local max_attempts=30
    local attempts=0

    while [ $attempts -lt $max_attempts ]; do
        if ! lsof -ti:$port >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
    done
    return 1
}

# Iniciar PostgreSQL en Docker si no está corriendo
log "🐘 Verificando PostgreSQL..."
if ! docker ps --format '{{.Names}}' | grep -q "^osyris-db$"; then
    warning "PostgreSQL no está corriendo, iniciando..."
    ./scripts/start-postgres-local.sh
    if [ $? -ne 0 ]; then
        error "❌ No se pudo iniciar PostgreSQL"
        exit 1
    fi
else
    success "✅ PostgreSQL ya está corriendo"
fi

# Iniciar servicios
log "Iniciando servicios..."

# Crear logs directory
mkdir -p logs

# Función para limpiar al salir
cleanup() {
    log "Deteniendo servicios..."
    pkill -f "next dev" 2>/dev/null
    pkill -f "nodemon" 2>/dev/null
    pkill -f "concurrently" 2>/dev/null
    exit 0
}

# Capturar señales para limpieza
trap cleanup SIGINT SIGTERM

success "✅ Puertos liberados correctamente"
success "✅ Dependencias verificadas"
success "✅ Configuración lista"

log "Iniciando desarrollo con concurrently..."

# Ejecutar el comando de desarrollo
npm run dev

# Si llega aquí, es porque se detuvo el proceso
log "Desarrollo detenido."
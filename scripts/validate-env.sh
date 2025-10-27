#!/bin/bash

# 🔍 Script de Validación de Variables de Entorno
# Verifica que las variables de entorno críticas estén correctamente configuradas

set -e

echo "🔍 Validando variables de entorno..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para validar un archivo .env
validate_env_file() {
    local env_file=$1
    local env_name=$2
    local errors=0

    echo ""
    echo "📄 Validando ${env_name}..."

    if [ ! -f "$env_file" ]; then
        echo -e "${RED}❌ ERROR: Archivo ${env_file} no encontrado${NC}"
        return 1
    fi

    # Cargar variables del archivo
    export $(cat "$env_file" | grep -v '^#' | grep -v '^$' | xargs)

    # VALIDACIÓN CRÍTICA 1: NEXT_PUBLIC_API_URL NO debe terminar en /api
    # El código frontend ya añade /api en cada llamada (ej: ${apiUrl}/api/auth/login)
    if [ ! -z "$NEXT_PUBLIC_API_URL" ]; then
        if [[ "$NEXT_PUBLIC_API_URL" =~ /api$ ]]; then
            echo -e "${RED}❌ CRITICAL: NEXT_PUBLIC_API_URL NO debe terminar en /api${NC}"
            echo -e "${YELLOW}   Actual: ${NEXT_PUBLIC_API_URL}${NC}"
            echo -e "${YELLOW}   El código frontend ya añade /api, esto causará /api/api (doble)${NC}"
            echo -e "${YELLOW}   Correcto: ${NEXT_PUBLIC_API_URL%/api}${NC}"
            errors=$((errors + 1))
        else
            echo -e "${GREEN}✅ NEXT_PUBLIC_API_URL correcto: ${NEXT_PUBLIC_API_URL}${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  WARNING: NEXT_PUBLIC_API_URL no está definido${NC}"
    fi

    # VALIDACIÓN 2: NEXT_PUBLIC_GA_MEASUREMENT_ID debe estar presente en producción
    if [ "$env_name" == ".env.production" ]; then
        if [ -z "$NEXT_PUBLIC_GA_MEASUREMENT_ID" ]; then
            echo -e "${YELLOW}⚠️  WARNING: NEXT_PUBLIC_GA_MEASUREMENT_ID no está definido${NC}"
        else
            echo -e "${GREEN}✅ NEXT_PUBLIC_GA_MEASUREMENT_ID presente${NC}"
        fi
    fi

    # VALIDACIÓN 3: No debe haber rutas duplicadas /api/api
    if [[ "$NEXT_PUBLIC_API_URL" =~ /api/api ]]; then
        echo -e "${RED}❌ CRITICAL: URL contiene /api/api duplicado${NC}"
        errors=$((errors + 1))
    fi

    return $errors
}

# Validar archivos de entorno
total_errors=0

# Validar .env.production
if [ -f ".env.production" ]; then
    validate_env_file ".env.production" ".env.production"
    total_errors=$((total_errors + $?))
fi

# Validar .env.local si existe
if [ -f ".env.local" ]; then
    validate_env_file ".env.local" ".env.local"
    total_errors=$((total_errors + $?))
fi

echo ""
echo "═══════════════════════════════════════════════════════"

if [ $total_errors -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS VALIDACIONES PASARON CORRECTAMENTE${NC}"
    echo "═══════════════════════════════════════════════════════"
    exit 0
else
    echo -e "${RED}❌ SE ENCONTRARON ${total_errors} ERRORES CRÍTICOS${NC}"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "🔧 SOLUCIÓN:"
    echo "   Edita el archivo .env.production y asegúrate de que:"
    echo "   NEXT_PUBLIC_API_URL=https://gruposcoutosyris.es"
    echo "   (NO debe terminar en /api - el código ya lo añade)"
    echo ""
    exit 1
fi

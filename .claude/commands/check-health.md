# Comando: /check-health - Verificación Completa del Sistema

## Descripción
Verifica el estado completo del sistema Osyris: servicios, base de datos, API y frontend.

## Funcionalidad
1. ✅ Verifica Docker y PostgreSQL
2. ✅ Comprueba servicios backend/frontend
3. ✅ Prueba conectividad API
4. ✅ Valida respuestas frontend
5. ✅ Genera reporte de salud

## Implementación

```bash
#!/bin/bash

echo "🏕️ === OSYRIS HEALTH CHECK ==="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# Función de verificación
check() {
    if $1 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $2${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((FAILED++))
    fi
}

echo "📊 Verificando infraestructura..."
echo ""

# 1. Docker
check "docker info" "Docker corriendo"

# 2. PostgreSQL Container
if docker ps | grep -q "osyris-postgres"; then
    echo -e "${GREEN}✅ PostgreSQL container activo${NC}"
    ((PASSED++))

    # Verificar conexión a BD
    if docker exec osyris-postgres pg_isready -U osyris_user >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL acepta conexiones${NC}"
        ((PASSED++))

        # Verificar tablas
        TABLE_COUNT=$(docker exec osyris-postgres psql -U osyris_user -d osyris_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' \n')
        if [ "$TABLE_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✅ Base de datos inicializada ($TABLE_COUNT tablas)${NC}"
            ((PASSED++))
        else
            echo -e "${RED}❌ Base de datos vacía${NC}"
            ((FAILED++))
        fi
    else
        echo -e "${RED}❌ PostgreSQL no acepta conexiones${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ PostgreSQL container no está corriendo${NC}"
    echo "   💡 Ejecuta: /dev-local"
    ((FAILED++))
fi

echo ""
echo "🚀 Verificando servicios..."
echo ""

# 3. Backend
if lsof -i:5000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend corriendo (puerto 5000)${NC}"
    ((PASSED++))

    # Probar endpoint de salud
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ API responde correctamente${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️ API responde con código: $HTTP_CODE${NC}"
        ((FAILED++))
    fi

    # Probar autenticación
    if curl -s http://localhost:5000/api/usuarios >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Endpoints de usuarios accesibles${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️ Endpoints requieren autenticación (normal)${NC}"
    fi
else
    echo -e "${RED}❌ Backend no está corriendo${NC}"
    echo "   💡 Ejecuta: /dev-local"
    ((FAILED++))
fi

# 4. Frontend
if lsof -i:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend corriendo (puerto 3000)${NC}"
    ((PASSED++))

    # Probar página principal
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Página principal accesible${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ Frontend responde con código: $HTTP_CODE${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ Frontend no está corriendo${NC}"
    echo "   💡 Ejecuta: /dev-local"
    ((FAILED++))
fi

echo ""
echo "🔧 Verificando configuración..."
echo ""

# 5. Variables de entorno
if [ -f "api-osyris/.env.local" ]; then
    echo -e "${GREEN}✅ .env.local configurado${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ .env.local no encontrado${NC}"
    ((FAILED++))
fi

# 6. Dependencias
if [ -d "node_modules" ] && [ -d "api-osyris/node_modules" ]; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️ Faltan dependencias - ejecuta npm install${NC}"
    ((FAILED++))
fi

# 7. Git
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -n "$BRANCH" ]; then
    echo -e "${GREEN}✅ Git configurado (rama: $BRANCH)${NC}"
    ((PASSED++))
fi

echo ""
echo "═══════════════════════════════════"
echo -e "  ${GREEN}PASADAS: $PASSED${NC} | ${RED}FALLIDAS: $FAILED${NC}"
echo "═══════════════════════════════════"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════╗"
    echo "║  ✅ SISTEMA COMPLETAMENTE OK  ║"
    echo "╚═══════════════════════════════╝"
    echo -e "${NC}"
    echo "🎯 Todo listo para desarrollo"
    echo ""
    echo "📱 Accede a: http://localhost:3000"
    echo "🔧 API docs: http://localhost:5000/api-docs"
else
    echo -e "${YELLOW}"
    echo "╔═══════════════════════════════╗"
    echo "║  ⚠️ SISTEMA CON PROBLEMAS     ║"
    echo "╚═══════════════════════════════╝"
    echo -e "${NC}"
    echo "🔧 Acciones sugeridas:"
    if ! docker ps | grep -q "osyris-postgres"; then
        echo "   1. Ejecuta: /dev-local (para iniciar servicios)"
    fi
    if [ ! -d "node_modules" ]; then
        echo "   2. Ejecuta: npm install"
    fi
    if [ ! -f "api-osyris/.env.local" ]; then
        echo "   3. Ejecuta: /dev-local (creará .env.local)"
    fi
fi

echo ""
echo "📊 Logs disponibles:"
echo "   Backend:  tail -f logs/backend-dev.log"
echo "   Frontend: tail -f logs/frontend-dev.log"
echo ""
```

## Uso

```bash
/check-health
```

## Palabras clave de activación
- "verificar sistema"
- "check health"
- "estado servicios"
- "revisar sistema"
- "system status"

## Resultado
✅ Reporte completo del estado del sistema
✅ Identificación de problemas
✅ Sugerencias de solución
✅ URLs de acceso si todo está OK

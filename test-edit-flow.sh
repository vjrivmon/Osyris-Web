#!/bin/bash

echo "🧪 Probando flujo completo de edición en vivo"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paso 1: Login (directo al backend)
echo "1️⃣  Haciendo login como admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@grupoosyris.es",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login falló${NC}"
  echo "Respuesta: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login exitoso${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Paso 2: Verificar token
echo "2️⃣  Verificando token..."
VERIFY_RESPONSE=$(curl -s http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN")

USER_ROL=$(echo $VERIFY_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('user', {}).get('rol', ''))" 2>/dev/null)

if [ "$USER_ROL" != "admin" ]; then
  echo -e "${RED}❌ Verificación falló o rol incorrecto${NC}"
  echo "Respuesta: $VERIFY_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Token verificado - Rol: $USER_ROL${NC}"
echo ""

# Paso 3: Verificar que la landing carga
echo "3️⃣  Verificando que la landing carga..."
LANDING_RESPONSE=$(curl -s http://localhost:3000/)
LANDING_TITLE=$(echo "$LANDING_RESPONSE" | grep -o '<title[^>]*>.*</title>' | sed 's/<[^>]*>//g')

if [ -z "$LANDING_TITLE" ]; then
  echo -e "${RED}❌ Landing no carga${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Landing carga correctamente${NC}"
echo "Título: $LANDING_TITLE"
echo ""

# Paso 4: Verificar que existe contenido editable en BD
echo "4️⃣  Verificando contenido editable en base de datos..."
CONTENT_RESPONSE=$(curl -s http://localhost:5000/api/content/page/landing)
CONTENT_COUNT=$(echo $CONTENT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('total', 0))" 2>/dev/null)

if [ "$CONTENT_COUNT" -eq "0" ]; then
  echo -e "${YELLOW}⚠️  No hay contenido en la BD. Necesitas ejecutar:${NC}"
  echo "   docker exec -i osyris-postgres psql -U osyris_user -d osyris_db < api-osyris/database/seed-landing-content.sql"
  echo ""
else
  echo -e "${GREEN}✅ Hay $CONTENT_COUNT elementos de contenido editable${NC}"
  echo ""
fi

# Resumen
echo "================================================"
echo -e "${GREEN}✅ Sistema de autenticación funcionando${NC}"
echo ""
echo "📋 SIGUIENTE PASO:"
echo "   1. Abre el navegador en: http://localhost:3000/login"
echo "   2. Login con: admin@grupoosyris.es / admin123"
echo "   3. Ve al dashboard admin"
echo "   4. Haz click en 'Editar Contenido Web'"
echo "   5. Deberías ver la landing con botones de edición"
echo ""
echo "🐛 Si no ves los botones de edición:"
echo "   - Abre DevTools (F12)"
echo "   - Ve a Console"
echo "   - Busca errores o warnings"
echo "   - Verifica que localStorage tenga 'token'"
echo ""

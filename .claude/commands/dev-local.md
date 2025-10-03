# Comando: /dev-local - Desarrollo Local con PostgreSQL

## Descripción
Inicia el entorno de desarrollo local completo con PostgreSQL en Docker, idéntico a producción.

## Funcionalidad
1. ✅ Verifica y levanta PostgreSQL en Docker
2. ✅ Configura base de datos con tablas iniciales
3. ✅ Inicia backend (puerto 5000)
4. ✅ Inicia frontend (puerto 3000)
5. ✅ Abre navegador automáticamente

## Implementación

```bash
#!/bin/bash

echo "🏕️ === OSYRIS DEV LOCAL - PostgreSQL Docker ==="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar Docker
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    echo "Inicia Docker Desktop y vuelve a intentar"
    exit 1
fi
echo -e "${GREEN}✅ Docker corriendo${NC}"

# 2. Limpiar puertos si están ocupados
echo ""
echo "🧹 Limpiando puertos ocupados..."
lsof -ti:5000,3000 | xargs -r kill -9 2>/dev/null
echo -e "${GREEN}✅ Puertos 5000 y 3000 liberados${NC}"

# 3. Verificar/Levantar PostgreSQL
echo ""
echo "🐘 Verificando PostgreSQL Docker..."

if ! docker ps | grep -q "osyris-postgres"; then
    echo "⏳ Levantando PostgreSQL..."

    # Crear red Docker si no existe
    docker network create osyris-network 2>/dev/null || true

    # Levantar PostgreSQL
    docker run -d \
        --name osyris-postgres \
        --network osyris-network \
        -e POSTGRES_DB=osyris_db \
        -e POSTGRES_USER=osyris_user \
        -e POSTGRES_PASSWORD=osyris_pass_2024 \
        -p 5432:5432 \
        -v osyris-postgres-data:/var/lib/postgresql/data \
        postgres:15-alpine

    echo "⏳ Esperando PostgreSQL..."
    sleep 5

    # Inicializar base de datos
    echo "📊 Inicializando tablas..."
    docker exec osyris-postgres psql -U osyris_user -d osyris_db -c "
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(255),
        rol VARCHAR(50) DEFAULT 'scouter',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS secciones (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        edad_min INTEGER,
        edad_max INTEGER
    );

    INSERT INTO secciones (nombre, slug, edad_min, edad_max) VALUES
    ('Castores', 'castores', 5, 7),
    ('Lobatos', 'manada', 7, 10),
    ('Tropa', 'tropa', 10, 13),
    ('Pioneros', 'pioneros', 13, 16),
    ('Rutas', 'rutas', 16, 19)
    ON CONFLICT (slug) DO NOTHING;

    -- Usuario admin por defecto
    INSERT INTO usuarios (email, password, nombre, rol) VALUES
    ('admin@grupoosy ris.es', '\$2a\$10\$xHashed', 'Admin Osyris', 'admin')
    ON CONFLICT (email) DO NOTHING;
    "

    echo -e "${GREEN}✅ PostgreSQL configurado${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL ya corriendo${NC}"
fi

# 4. Configurar variables de entorno
echo ""
echo "⚙️ Configurando variables de entorno..."
cat > api-osyris/.env.local <<EOF
NODE_ENV=development
PORT=5000
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=osyris_user
DB_PASSWORD=osyris_pass_2024
DB_NAME=osyris_db
JWT_SECRET=osyrisScoutDev2024Secret
JWT_EXPIRES_IN=24h
EOF
echo -e "${GREEN}✅ .env.local creado${NC}"

# 5. Instalar dependencias si es necesario
if [ ! -d "node_modules" ] || [ ! -d "api-osyris/node_modules" ]; then
    echo ""
    echo "📦 Instalando dependencias..."
    npm install --silent
    cd api-osyris && npm install --silent && cd ..
fi

# 6. Iniciar servicios
echo ""
echo "🚀 Iniciando servicios..."

# Backend
cd api-osyris
npm run dev > ../logs/backend-dev.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

# Frontend
npm run dev:frontend > logs/frontend-dev.log 2>&1 &
FRONTEND_PID=$!

sleep 2

# 7. Verificar servicios
echo ""
echo "🔍 Verificando servicios..."

if lsof -i:5000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend corriendo en http://localhost:5000${NC}"
else
    echo -e "${RED}❌ Backend falló - revisa logs/backend-dev.log${NC}"
fi

if lsof -i:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend corriendo en http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend falló - revisa logs/frontend-dev.log${NC}"
fi

# 8. Abrir navegador
echo ""
echo "🌐 Abriendo navegador..."
(sleep 2 && (xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null)) &

echo ""
echo -e "${GREEN}╔══════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🏕️ OSYRIS DEV LOCAL LISTO    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════╝${NC}"
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:5000"
echo "🐘 PostgreSQL: localhost:5432"
echo ""
echo "🔑 Credenciales BD:"
echo "   Usuario: osyris_user"
echo "   Password: osyris_pass_2024"
echo "   Database: osyris_db"
echo ""
echo "🛑 Para detener: pkill -f 'node.*osyris' && docker stop osyris-postgres"
echo "💾 Ver logs: tail -f logs/backend-dev.log | tail -f logs/frontend-dev.log"
echo ""
```

## Uso

```bash
/dev-local
```

## Palabras clave de activación
- "desarrollo local"
- "iniciar desarrollo"
- "levantar entorno"
- "dev local"
- "start development"

## Resultado
✅ PostgreSQL en Docker (puerto 5432)
✅ Backend corriendo (puerto 5000)
✅ Frontend corriendo (puerto 3000)
✅ BD inicializada con tablas y datos básicos
✅ Navegador abierto automáticamente

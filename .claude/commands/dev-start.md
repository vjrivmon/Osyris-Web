# Comando: /dev-start

## Descripción
Inicia el entorno de desarrollo completo de Osyris, levantando tanto el frontend como el backend automáticamente con configuración optimizada.

## Palabras clave de activación
- `/dev-start`
- `iniciar desarrollo`
- `levantar entorno`
- `start development`

## Funcionamiento

### 1. Verificación del entorno
- Comprobar que Node.js está instalado
- Verificar que las dependencias están instaladas
- Validar configuración de base de datos
- Confirmar que los puertos están disponibles

### 2. Configuración de base de datos
- Verificar conexión a MySQL/SQLite
- Ejecutar migraciones pendientes si es necesario
- Seedear datos de prueba si la base está vacía

### 3. Inicio del backend (Puerto 3000)
```bash
cd Osyris-Web/api-osyris
npm run dev
```

### 4. Inicio del frontend (Puerto 3001)
```bash
cd Osyris-Web
npm run dev -- --port 3001
```

### 5. Verificación de servicios
- Confirmar que el backend responde en http://localhost:3000
- Confirmar que el frontend carga en http://localhost:3001
- Verificar conectividad entre frontend y backend

## Implementación

```bash
#!/bin/bash
echo "🚀 Iniciando entorno de desarrollo Osyris..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar puertos disponibles
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo "⚠️ Puerto 3000 ocupado, deteniendo proceso..."
    lsof -ti:3000 | xargs kill -9
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
    echo "⚠️ Puerto 3001 ocupado, deteniendo proceso..."
    lsof -ti:3001 | xargs kill -9
fi

# Navegar al directorio del proyecto
cd /home/vicente/RoadToDevOps/osyris/Osyris-Web

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install
fi

if [ ! -d "api-osyris/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd api-osyris
    npm install
    cd ..
fi

# Iniciar backend en background
echo "🔧 Iniciando backend en puerto 3000..."
cd api-osyris
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ Backend listo en puerto 3000"
        break
    fi
    sleep 1
done

# Iniciar frontend
echo "🎨 Iniciando frontend en puerto 3001..."
npm run dev -- --port 3001 &
FRONTEND_PID=$!

# Esperar a que el frontend esté listo
echo "⏳ Esperando a que el frontend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null; then
        echo "✅ Frontend listo en puerto 3001"
        break
    fi
    sleep 1
done

echo ""
echo "🎉 Entorno de desarrollo Osyris iniciado con éxito!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Backend: http://localhost:3000"
echo "📚 API Docs: http://localhost:3000/api-docs"
echo ""
echo "Para detener los servicios:"
echo "kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎯 ¡Listo para desarrollar! Happy coding! 🚀"
```

## Opciones adicionales

### Con base de datos limpia
- `dev-start --fresh`: Resetea la base de datos y seedea datos de prueba

### Con análisis de rendimiento
- `dev-start --profile`: Inicia con herramientas de profiling activadas

### Con tests automáticos
- `dev-start --watch-tests`: Ejecuta tests en modo watch

## Integración con agentes

### Frontend Developer Agent
- Monitorea errores de compilación
- Sugiere optimizaciones de performance
- Valida estructura de componentes

### Backend Developer Agent
- Supervisa logs de API
- Verifica conexiones de base de datos
- Monitorea endpoints de salud

### UI/UX Analyzer Agent
- Toma screenshot inicial del frontend
- Configura monitoreo de cambios visuales
- Prepara herramientas de análisis

## Troubleshooting

### Backend no inicia
1. Verificar variables de entorno (.env)
2. Comprobar conexión a base de datos
3. Revisar logs de errores

### Frontend no carga
1. Verificar que las dependencias están instaladas
2. Comprobar configuración de Next.js
3. Revisar conflictos de puertos

### Problemas de conectividad
1. Verificar configuración de CORS
2. Comprobar proxy settings en Next.js
3. Validar URLs de API

## Logs y monitoreo

El comando configura automáticamente:
- Logs estructurados en JSON
- Monitoreo de performance
- Alertas de errores críticos
- Métricas de desarrollo en tiempo real
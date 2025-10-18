# Osyris Deployment Coordinator (Updated)

**Propósito:** Coordinación experta del proceso de despliegue a producción usando el nuevo workflow optimizado para develop que garantiza builds frescos sin caché antigua.

## 🔄 Nuevo Sistema de Despliegue

### Workflow Actualizado: `deploy-develop.yml`
- **Trigger**: Push a rama `develop` (no solo main)
- **Estrategia**: Build fresco garantizado sin caché
- **Limpieza**: Completa de caché en local y servidor
- **Verificación**: Comprehensive post-deploy checks

## Fases del Nuevo Workflow

### 🧹 Fase 1: Limpieza Profunda (`cleanup`)
- Elimina toda caché local (~/.npm)
- Limpia directorios .next, build, node_modules
- Elimina package-lock.json para instalación fresca

### 🧪 Fase 2: Testing Mejorado (`test`)
- Instalación completamente fresca de dependencias
- Build forzado sin usar caché
- Verificación de builds exitosos
- Tests comprehensivos

### 🚀 Fase 3: Despliegue Optimizado (`deploy`)
- Empaquetado sin archivos de caché
- Limpieza completa en servidor
- Build fresco en servidor
- Inicio de servicios PM2 verificados

### 📢 Fase 4: Notificación (`notify`)
- Reporte detallado del despliegue
- Verificación de servicios activos

## Comandos Actualizados

### /osyris-deploy-to-production (Updated)
Inicia despliegue usando el nuevo workflow optimizado.

**Parámetros:**
- `target_branch`: Rama objetivo (default: "develop")
- `force_no_cache`: Forzar limpieza completa (default: true)
- `verify_production`: Verificar funcionamiento (default: true)
- `timeout_minutes`: Timeout para el despliegue (default: 20)

**Ejemplo:**
```
/osyris-deploy-to-production "develop" "true" "true" "25"
```

## Proceso de Ejecución Actualizado

### 1. Preparación del Despliegue
```bash
# Cambiar a rama develop
git checkout develop
git pull origin develop

# Verificar estado limpio
git status

# Push para activar workflow
git push origin develop
```

### 2. Monitorización del Workflow
```bash
# Verificar que el workflow se inició
gh run list --branch=develop

# Monitorizar en tiempo real
gh run view --branch=develop --watch
```

### 3. Verificación Post-Despliegue
```bash
# Verificar frontend
curl -f -s https://gruposcoutosyris.es

# Verificar API
curl -f -s https://gruposcoutosyris.es/api/health

# Verificar PM2 en servidor
ssh root@116.203.98.142 "pm2 list"
```

## Estrategia de Build Fresco Garantizado

### 🧹 Limpieza en GitHub Actions
```yaml
- name: 🧹 Clean workspace thoroughly
  run: |
    rm -rf ~/.npm
    rm -rf node_modules/.cache
    npm cache clean --force
    rm -rf .next build out dist
    rm -f package-lock.json
```

### 📦 Instalación Fresca
```yaml
- name: 📚 Fresh dependencies installation
  run: |
    rm -rf node_modules api-osyris/node_modules
    npm ci --prefer-offline --no-audit --no-fund
    cd api-osyris && npm ci --prefer-offline --no-audit --no-fund
```

### 🏗️ Build Sin Caché
```yaml
- name: 🔨 Fresh Build (sin caché)
  run: |
    rm -rf .next out dist build
    npx next clean
    npm run build:frontend
```

### 🚀 Limpieza en Servidor
```bash
# En servidor
rm -rf current
mkdir -p current
rm -rf node_modules .next build
npm cache clean --force
npm ci --prefer-offline
npm run build:frontend
```

## Verificaciones Automáticas Implementadas

### ✅ Frontend Verification
- 5 intentos con 10s de espera entre cada uno
- Verificación de HTTPS (Cloudflare)
- Validación de contenido específico ("Osyris")

### ✅ Backend API Verification
- 5 intentos para endpoint /api/health
- Fallback a /api/usuarios si health falla
- Verificación de respuestas JSON válidas

### ✅ PM2 Services Verification
- Confirmar que frontend está "online"
- Confirmar que backend está "online"
- Mostrar logs si hay fallos

## Estado en Memoria Actualizado

Actualiza session-state.json con:
```json
{
  "context": {
    "deployment_status": "in_progress",
    "workflow_type": "deploy-develop.yml",
    "build_strategy": "fresh_no_cache",
    "github_actions_url": "https://github.com/user/osyris-web/actions/runs/12345",
    "deployment_started_at": "2025-01-18T11:00:00Z",
    "current_step": "deploy",
    "cache_cleared": true,
    "fresh_build": true,
    "verification_enabled": true
  }
}
```

## Manejo de Errores Mejorado

### Errores de Build
```bash
# Si el build falla en GitHub Actions
1. Verificar logs del step "Fresh Build"
2. Revisar dependencias en package.json
3. Verificar TypeScript errors
4. Reintentar con --force-no-cache
```

### Errores de Servidor
```bash
# Si los servicios no inician
1. Verificar logs de PM2: pm2 logs osyris-frontend
2. Verificar contenedores Docker: docker ps
3. Revisar configuración .env
4. Verificar espacio en disco
```

### Errores de Conexión
```bash
# Si el servidor no responde
1. Esperar más tiempo (hasta 60s)
2. Verificar firewall del servidor
3. Revisar configuración de Nginx/Cloudflare
4. Verificar certificados SSL
```

## Comandos de Recuperación

### Forzar Despliegue Limpio
```bash
# Opción 1: Usar workflow manual
gh workflow run deploy-develop.yml \
  --field force_no_cache=true \
  --field verify_production=true

# Opción 2: Eliminar caché manualmente
git clean -fd
npm cache clean --force
git push origin develop --force
```

### Verificación Manual
```bash
# Acceder al servidor y verificar estado
ssh root@116.203.98.142
pm2 list
docker ps | grep osyris
curl -f http://localhost:3000
curl -f http://localhost:5000/api/health
```

### Rollback Automático
```bash
# Si algo falla, el workflow tiene backup automático
ssh root@116.203.98.142
cd /var/www/osyris
ls -la backup_*
# Restaurar backup más reciente
cp -r backup_YYYYMMDD_HHMMSS current
pm2 restart all
```

## Integración con Osyris Workflow System

Este agente se integra perfectamente con el workflow principal:

### En /osyris-workflow-start
```bash
# Después de integration-testing, invocar:
"🚀 Fase 4: Despliegue Automatizado"
"Push a develop → GitHub Actions → Build fresco → Producción verificada"
```

### Coordinación con Production Verifier
```bash
# El siguiente agente recibirá:
{
  "production_url": "https://gruposcoutosyris.es",
  "deployment_verified": true,
  "build_timestamp": "2025-01-18T11:30:00Z",
  "cache_strategy": "fresh_no_cache"
}
```

## Benefits del Nuevo Sistema

✅ **Sin problemas de caché**: Siempre build fresco
✅ **Despliegue automático**: Push a develop es suficiente
✅ **Verificación completa**: Frontend + backend + contenido
✅ **Recuperación automática**: Backup y rollback
✅ **Logs detallados**: Total visibilidad del proceso
✅ **Timeouts razonables**: Espera suficiente para servicios
✅ **Notificaciones**: Reportes completos en GitHub

---

*Coordinador de despliegue optimizado que garantiza builds frescos y sin caché antigua.*
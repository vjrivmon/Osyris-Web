# 🚀 Scripts de Automatización - Osyris Scout Management

## 📋 Descripción General

Conjunto de scripts especializados para el flujo de deploy rápido y seguro implementado en el proyecto Osyris Scout Management System.

## 🎯 Flujo Principal

```
 Desarrollo Local → Staging (5 min) → Producción (2 min) → Verificación (3 min)
```

## 🛠️ Scripts Principales

### 1. Deploy a Staging
**Archivo:** `deploy-to-staging.sh`
**Tiempo:** ~5 minutos
**Uso:** Crear réplica exacta de producción en entorno staging

```bash
./scripts/deploy-to-staging.sh
```

**Funciones:**
- ✅ Backup automático de producción
- ✅ Creación de entorno staging réplica
- ✅ Sincronización de base de datos
- ✅ Configuración PM2 para staging
- ✅ Verificación de servicios

**Resultado:**
- Frontend staging: http://116.203.98.142:3001
- Backend staging: http://116.203.98.142:5001

### 2. Deploy Ultra-Rápido a Producción
**Archivo:** `deploy-to-production-from-staging.sh`
**Tiempo:** ~2 minutos
**Uso:** Sincronizar cambios validados en staging a producción

```bash
./scripts/deploy-to-production-from-staging.sh
```

**Funciones:**
- ✅ Backup instantáneo de producción
- ✅ Sincronización staging → producción
- ✅ Restauración environment producción
- ✅ Reinicio servicios PM2
- ✅ Creación script rollback automático

### 3. Verificación Automatizada
**Archivo:** `verify-deployment.sh`
**Tiempo:** 1-2 minutos
**Uso:** Checklist completo de verificación del sistema

```bash
# Verificar producción
./scripts/verify-deployment.sh production

# Verificar staging
./scripts/verify-deployment.sh staging

# Verificar todo
./scripts/verify-deployment.sh
```

**Funciones:**
- ✅ Verificación frontend + backend
- ✅ Health checks de APIs
- ✅ Verificación SSL y seguridad
- ✅ Monitorización recursos sistema
- ✅ Reporte con métricas

### 4. Rollback de Emergencia
**Archivo:** `emergency-rollback.sh`
**Tiempo:** 30 segundos
**Uso:** Restauración instantánea al estado anterior

```bash
# Rollback automático (último backup)
./scripts/emergency-rollback.sh

# Rollback a backup específico
./scripts/emergency-rollback.sh backup_staging_20241018_143022
```

**Funciones:**
- ✅ Parada agresiva de servicios
- ✅ Restauración archivos + base de datos
- ✅ Reinicio servicios PM2
- ✅ Verificación post-rollback

## 🔄 Scripts de Sincronización

### 5. Sincronización Local → Producción
**Archivo:** `sync-to-production.sh`
**Tiempo:** Variable
**Uso:** Sincronizar datos locales con producción (con precaución)

```bash
./scripts/sync-to-production.sh
```

⚠️ **ADVERTENCIA:** Este script sobrescribe datos en producción. Usar con extremo cuidado.

### 6. Sincronización Producción → Local
**Archivo:** `sync-from-production.sh`
**Tiempo:** Variable
**Uso:** Traer datos de producción a entorno local

```bash
./scripts/sync-from-production.sh
```

## 🏗️ Scripts de Desarrollo

### 7. Inicio Desarrollo
**Archivo:** `dev-start.sh`
**Tiempo:** ~1 minuto
**Uso:** Iniciar entorno desarrollo completo

```bash
./scripts/dev-start.sh
```

**Funciones:**
- ✅ Limpieza automática de puertos
- ✅ Inicio PostgreSQL Docker
- ✅ Instalación dependencias
- ✅ Inicio frontend + backend

### 8. Configuración Inicial
**Archivo:** `setup-dev.sh`
**Tiempo:** ~5 minutos
**Uso:** Configuración inicial del proyecto

```bash
./scripts/setup-dev.sh
```

### 9. Limpieza
**Archivo:** `clean.sh`
**Tiempo:** ~1 minuto
**Uso:** Limpiar archivos temporales y caché

```bash
./scripts/clean.sh
```

## 🗃️ Scripts de Base de Datos

### 10. Inicio PostgreSQL Local
**Archivo:** `start-postgres-local.sh`
**Tiempo:** ~30 segundos
**Uso:** Iniciar PostgreSQL en Docker para desarrollo

```bash
./scripts/start-postgres-local.sh
```

### 11. Switch Base de Datos
**Archivo:** `switch-database.sh`
**Tiempo:** ~1 minuto
**Uso:** Cambiar entre diferentes bases de datos (SQLite/PostgreSQL)

```bash
./scripts/switch-database.sh postgres
./scripts/switch-database.sh sqlite
```

## 🧪 Scripts de Testing

### 12. Testing Playwright MCP
**Archivo:** `test-playwright-mcp.sh`
**Tiempo:** Variable
**Uso:** Ejecutar tests E2E con Playwright

```bash
./scripts/test-playwright-mcp.sh
```

### 13. Verificación Fases
**Archivos:** `verify-fase1.sh`, `verify-fase2.sh`
**Tiempo:** ~2 minutos cada uno
**Uso:** Verificación por fases del sistema

```bash
./scripts/verify-fase1.sh
./scripts/verify-fase2.sh
```

## 💾 Scripts de Backup

### 14. Backup Completo
**Archivo:** `backup.sh`
**Tiempo:** ~5 minutos
**Uso:** Backup completo del sistema

```bash
./scripts/backup.sh
```

### 15. Restore Backup
**Archivo:** `backup/restore-backup.sh`
**Tiempo:** ~10 minutos
**Uso:** Restaurar sistema desde backup

```bash
./scripts/backup/restore-backup.sh backup_nombre
```

## 🔧 Configuración de Scripts

### Permisos
Todos los scripts deben tener permisos de ejecución:

```bash
chmod +x scripts/*.sh
chmod +x scripts/backup/*.sh
```

### Variables de Entorno
Los scripts usan las siguientes variables:

```bash
# Servidor
SERVER="root@116.203.98.142"

# Rutas
PROD_PATH="/var/www/osyris/current"
STAGING_PATH="/var/www/osyris-staging/current"
BACKUP_DIR="/var/www/backups"

# Puertos
PROD_FRONTEND_PORT=3000
PROD_BACKEND_PORT=5000
STAGING_FRONTEND_PORT=3001
STAGING_BACKEND_PORT=5001
```

### Dependencias
- **SSH:** Acceso al servidor de producción
- **Docker:** Para gestión de contenedores
- **PM2:** Gestión de procesos en producción
- **curl:** Verificación de URLs
- **rsync:** Sincronización de archivos

## 📊 Estados y Códigos de Salida

| Código | Significado |
|--------|-------------|
| 0 | ✅ Éxito completo |
| 1 | ❌ Error general |
| 2 | ⚠️ Advertencias (verificación con problemas) |

## 🚨 Procedimientos de Emergencia

### Si un Script Falla
1. **Verificar logs:** Revisar output del script
2. **Verificar conexión:** `ssh root@116.203.98.142`
3. **Verificar servicios:** `pm2 list`
4. **Rollback:** `./scripts/emergency-rollback.sh`

### Si Producción No Responde
1. **No entrar en pánico**
2. **Rollback inmediato:** `./scripts/emergency-rollback.sh`
3. **Verificar:** `./scripts/verify-deployment.sh production`
4. **Investigar:** Revisar logs PM2

## 📈 Flujo de Trabajo Recomendado

### Desarrollo Normal
```bash
# 1. Desarrollo local
./scripts/dev-start.sh

# 2. Testing y build
npm test && npm run build

# 3. Commit
git add . && git commit -m "feat: nueva funcionalidad"

# 4. Deploy a staging
./scripts/deploy-to-staging.sh

# 5. Verificación staging
./scripts/verify-deployment.sh staging

# 6. Deploy producción (si staging OK)
./scripts/deploy-to-production-from-staging.sh

# 7. Verificación final
./scripts/verify-deployment.sh production
```

### Emergencia
```bash
# 1. Rollback inmediato
./scripts/emergency-rollback.sh

# 2. Verificación
./scripts/verify-deployment.sh production

# 3. Investigar causa
# 4. Corregir y reintentar
```

## 📞 Soporte y Contacto

- **Documentación completa:** `docs/development/FAST_DEPLOY_WORKFLOW.md`
- **Servidor producción:** root@116.203.98.142
- **Logs PM2:** `pm2 logs osyris-frontend osyris-backend`
- **Backups:** `/var/www/backups/`

---

**Última Actualización:** 2024-10-18
**Versión:** 1.0.0
**Mantenido por:** Vicente Rivas Monferrer
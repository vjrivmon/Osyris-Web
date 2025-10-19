# 🔄 Workflow de Staging y Producción

## 📋 Índice

- [Introducción](#introducción)
- [Arquitectura de Entornos](#arquitectura-de-entornos)
- [Workflow Completo](#workflow-completo)
- [Scripts Disponibles](#scripts-disponibles)
- [Solución de Problemas](#solución-de-problemas)
- [Mejores Prácticas](#mejores-prácticas)

## 🎯 Introducción

Este documento describe el flujo completo de trabajo para desplegar cambios desde desarrollo local hasta producción, utilizando un entorno de staging intermedio para validación.

### ⚠️ **Importante: Variables de Entorno en Next.js**

**Next.js compila las variables `NEXT_PUBLIC_*` durante el build**, NO en runtime. Por eso:

- ✅ **Staging debe usar `next start`** (build pre-generada con las variables correctas)
- ❌ **NO usar `next dev`** en staging (ignora las variables de entorno de build)
- ✅ **Deploy a staging SIEMPRE hace rebuild** con las variables correctas

## 🏗️ Arquitectura de Entornos

```
┌─────────────────────────────────────────────────────────────────┐
│                     SERVIDOR HETZNER                            │
│                    116.203.98.142                                │
├─────────────────────────────┬───────────────────────────────────┤
│         STAGING             │         PRODUCCIÓN                │
├─────────────────────────────┼───────────────────────────────────┤
│ Frontend: Puerto 3001       │ Frontend: Puerto 3000             │
│ Backend:  Puerto 5001       │ Backend:  Puerto 5000             │
│ BD: osyris_staging_db       │ BD: osyris_db                     │
│ PM2: osyris-staging-*       │ PM2: osyris-*                     │
│ Path: /var/www/osyris-staging/current                           │
│                             │ Path: /var/www/osyris/current     │
│ URL: http://116.203.98.142:3001                                 │
│                             │ URL: https://gruposcoutosyris.es  │
│ API: http://116.203.98.142:5001                                 │
│                             │ API: https://gruposcoutosyris.es  │
└─────────────────────────────┴───────────────────────────────────┘
```

### 🔧 Variables de Entorno por Entorno

#### **Staging** (`/var/www/osyris-staging/current/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://116.203.98.142:5001
API_BASE_URL=http://116.203.98.142:5001
NODE_ENV=staging
NEXT_PUBLIC_APP_NAME=Osyris Scout Management - Staging
NEXT_PUBLIC_STAGING=true
```

#### **Producción** (`/var/www/osyris/current/.env.production`)
```bash
NEXT_PUBLIC_API_URL=https://gruposcoutosyris.es
API_BASE_URL=https://gruposcoutosyris.es
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Osyris Scout Management
```

## 📊 Workflow Completo

### 🔄 **Flujo Normal de Deploy**

```
┌──────────────┐
│ 1. LOCAL DEV │
└──────┬───────┘
       │ git push origin develop
       ▼
┌──────────────────────────────────────────────┐
│ 2. DEPLOY A STAGING                          │
│    ./scripts/deploy-to-staging.sh            │
│                                              │
│ ✅ Crea réplica de producción                │
│ ✅ Genera .env.local para staging            │
│ ✅ Hace BUILD con NEXT_PUBLIC_API_URL correcto│
│ ✅ Inicia PM2 con next start (NO next dev)   │
│ ✅ Tiempo: ~5 minutos                        │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ 3. VERIFICAR STAGING                         │
│    ./scripts/verify-deployment.sh staging    │
│                                              │
│ ✅ Verifica frontend/backend                 │
│ ✅ Prueba endpoints API                      │
│ ✅ Valida conectividad BD                    │
│ ✅ Tiempo: ~2 minutos                        │
└──────┬───────────────────────────────────────┘
       │
       │ ¿Todo OK?
       ▼ SÍ
┌──────────────────────────────────────────────┐
│ 4. DEPLOY A PRODUCCIÓN                       │
│    ./scripts/deploy-to-production-from-staging.sh│
│                                              │
│ ✅ Backup automático de producción           │
│ ✅ Sincroniza staging → producción           │
│ ✅ Restaura .env de producción              │
│ ✅ Reinicia servicios                        │
│ ✅ Tiempo: ~2 minutos                        │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ 5. VERIFICAR PRODUCCIÓN                      │
│    ./scripts/verify-deployment.sh production │
│                                              │
│ ✅ Verifica acceso HTTPS                     │
│ ✅ Valida certificado SSL                    │
│ ✅ Comprueba rendimiento                     │
│ ✅ Tiempo: ~2 minutos                        │
└──────────────────────────────────────────────┘
```

### 🚨 **Flujo de Rollback (Emergencia)**

```
┌──────────────────────────────────────────────┐
│ ALGO FALLA EN PRODUCCIÓN                     │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ ROLLBACK DE EMERGENCIA                       │
│ ./scripts/emergency-rollback.sh              │
│                                              │
│ ✅ Detiene servicios producción              │
│ ✅ Restaura último backup                    │
│ ✅ Restaura BD                               │
│ ✅ Reinicia servicios                        │
│ ⏱️  Tiempo: ~30 segundos                     │
└──────────────────────────────────────────────┘
```

## 🔧 Scripts Disponibles

### 1️⃣ **deploy-to-staging.sh**

**Propósito:** Crear entorno de staging con réplica exacta de producción

**Uso:**
```bash
./scripts/deploy-to-staging.sh
```

**Qué hace:**
1. ✅ Backup de producción
2. ✅ Detiene staging anterior
3. ✅ Copia archivos de producción a staging
4. ✅ **Genera .env.local con `NEXT_PUBLIC_API_URL=http://116.203.98.142:5001`**
5. ✅ **Hace `npm run build` con las variables de staging**
6. ✅ Crea BD staging (`osyris_staging_db`)
7. ✅ Importa datos de producción
8. ✅ Inicia PM2 con `next start` (NO `next dev`)

**Variables configuradas:**
- `STAGING_HOST="116.203.98.142"`
- `STAGING_PORT_FRONTEND=3001`
- `STAGING_PORT_BACKEND=5001`
- `STAGING_API_URL="http://$STAGING_HOST:$STAGING_PORT_BACKEND"`

**Output esperado:**
```
✅ Backup de producción completado
✅ Servicios staging detenidos
✅ Entorno staging creado
✅ Build de staging completada
✅ Base de datos staging lista
✅ PM2 staging configurado

🌐 URLs de Staging:
  • Frontend: http://116.203.98.142:3001
  • Backend API: http://116.203.98.142:5001
```

---

### 2️⃣ **verify-deployment.sh**

**Propósito:** Verificar que un entorno funciona correctamente

**Uso:**
```bash
# Verificar staging
./scripts/verify-deployment.sh staging

# Verificar producción
./scripts/verify-deployment.sh production

# Verificar ambos
./scripts/verify-deployment.sh
```

**Qué verifica:**

#### Staging:
- Frontend accesible en puerto 3001
- Backend API respondiendo en puerto 5001
- Endpoints principales funcionando
- Páginas clave cargando

#### Producción:
- Frontend HTTPS funcionando
- Backend API accesible
- Certificado SSL válido
- Rendimiento aceptable
- Servicios PM2 corriendo

**Output esperado:**
```
📊 Estadísticas:
  • Total de verificaciones: 25
  • Exitosas: 24
  • Fallidas: 1
  • Tasa de éxito: 96%

🎉 EXCELENTE - El sistema está funcionando perfectamente
```

---

### 3️⃣ **deploy-to-production-from-staging.sh**

**Propósito:** Deploy ultra-rápido de staging validado a producción

**Uso:**
```bash
./scripts/deploy-to-production-from-staging.sh
```

**⚠️ Requiere confirmación:** Debes escribir `SI` para continuar

**Qué hace:**
1. ✅ Verifica que staging existe y funciona
2. ✅ **Backup instantáneo de producción**
3. ✅ Detiene servicios producción (graceful shutdown)
4. ✅ Sincroniza archivos staging → producción
5. ✅ **Restaura .env de producción** (sobrescribe el de staging)
6. ✅ Sincroniza BD si hay cambios
7. ✅ Inicia servicios producción
8. ✅ Crea script de rollback automático

**Output esperado:**
```
✅ Entorno staging verificado
✅ Backup de producción completado
✅ Producción detenida
✅ Archivos sincronizados
✅ Base de datos verificada
✅ Producción iniciada

⚡ Deploy a Producción Completado

🌐 Producción:
  • Frontend: https://gruposcoutosyris.es
  • Backend: https://gruposcoutosyris.es/api/health

🔄 Rollback disponible: /var/www/rollback-last-deploy.sh
```

---

### 4️⃣ **emergency-rollback.sh**

**Propósito:** Rollback crítico en caso de emergencia

**Uso:**
```bash
# Usar último backup automático
./scripts/emergency-rollback.sh

# Usar backup específico
./scripts/emergency-rollback.sh backup_staging_20250118_120000
```

**⚠️ Requiere confirmación:** Debes escribir `EMERGENCIA` para continuar

**Qué hace:**
1. 🚨 Detiene todos los servicios (método agresivo)
2. 💾 Backup del estado actual (por si acaso)
3. 📁 Restaura archivos del backup
4. 🐘 Restaura base de datos
5. 🚀 Reinicia servicios
6. 🔍 Verificación crítica

**Tiempo:** ~30 segundos

---

### 5️⃣ **start-staging-server.sh**

**Propósito:** Reiniciar servicios staging (solo en servidor)

**Uso (SSH al servidor):**
```bash
ssh root@116.203.98.142
cd /var/www/osyris-staging/current
./scripts/start-staging-server.sh
```

**⚠️ IMPORTANTE:** 
- Este script usa `next start` (NO `next dev`)
- Requiere que exista una build pre-generada en `.next/`
- Si no existe build, ejecuta primero `deploy-to-staging.sh`

---

## 🔍 Solución de Problemas

### ❌ **Problema: "Connection refused" en staging**

**Síntomas:**
- Frontend staging carga pero API no responde
- Browser console muestra error 500 o `net::ERR_CONNECTION_REFUSED`

**Causa:**
- El frontend intenta conectar al puerto 5000 en lugar de 5001
- La build se generó sin `NEXT_PUBLIC_API_URL` correcta

**Solución:**
```bash
# 1. Verificar URL actual que usa el frontend
ssh root@116.203.98.142
cd /var/www/osyris-staging/current
cat .env.local  # Debe tener NEXT_PUBLIC_API_URL=http://116.203.98.142:5001

# 2. Verificar que existe build
ls -la .next/  # Debe existir

# 3. Si no existe o está mal, regenerar:
./scripts/deploy-to-staging.sh  # Esto regenera todo correctamente
```

---

### ❌ **Problema: "Cannot find module 'next'" en staging**

**Síntomas:**
- PM2 logs muestran `Error: Cannot find module 'next'`

**Causa:**
- Faltan dependencias de Node.js

**Solución:**
```bash
ssh root@116.203.98.142
cd /var/www/osyris-staging/current
npm ci --production=false
pm2 restart osyris-staging-frontend
```

---

### ❌ **Problema: Staging funciona pero producción no**

**Síntomas:**
- Staging verificado OK
- Deploy a producción se completa
- Pero producción muestra errores

**Causa:**
- El .env de producción no se restauró correctamente

**Solución:**
```bash
# Verificar environment de producción
ssh root@116.203.98.142
cat /var/www/osyris/current/api-osyris/.env

# Debe tener:
# NODE_ENV=production
# PORT=5000
# DB_NAME=osyris_db
# FRONTEND_URL=https://gruposcoutosyris.es

# Si está mal, ejecutar rollback:
./scripts/emergency-rollback.sh
```

---

### ❌ **Problema: "Build failed" durante deploy a staging**

**Síntomas:**
- `deploy-to-staging.sh` falla con error de TypeScript o ESLint

**Causa:**
- Errores de código en la rama actual

**Solución:**
```bash
# 1. Ejecutar build localmente para ver errores
npm run build

# 2. Corregir errores de TypeScript/ESLint
npm run lint

# 3. Commit y push
git add .
git commit -m "fix: corregir errores de build"
git push origin develop

# 4. Reintentar deploy
./scripts/deploy-to-staging.sh
```

---

### ❌ **Problema: "PM2 no encuentra el proceso"**

**Síntomas:**
- `pm2 list` no muestra servicios staging
- `pm2 logs osyris-staging-frontend` muestra "process not found"

**Causa:**
- Los servicios no se iniciaron correctamente

**Solución:**
```bash
ssh root@116.203.98.142

# Verificar procesos PM2
pm2 list

# Si no hay procesos, iniciar manualmente:
cd /var/www/osyris-staging/current
pm2 start node_modules/.bin/next --name "osyris-staging-frontend" -- start -p 3001
pm2 start api-osyris/src/index.js --name "osyris-staging-backend" --cwd api-osyris

pm2 save
```

---

## 🎯 Mejores Prácticas

### ✅ **Siempre usar staging antes de producción**

```bash
# ❌ MAL: Deploy directo a producción
git push origin main
ssh root@116.203.98.142 "cd /var/www/osyris/current && git pull && npm run build"

# ✅ BIEN: Validar en staging primero
./scripts/deploy-to-staging.sh
./scripts/verify-deployment.sh staging
# Solo si staging OK:
./scripts/deploy-to-production-from-staging.sh
```

---

### ✅ **Verificar siempre después de deploy**

```bash
# Después de deploy a staging
./scripts/verify-deployment.sh staging

# Después de deploy a producción
./scripts/verify-deployment.sh production
```

---

### ✅ **Mantener backups recientes**

Los scripts automáticamente:
- Crean backup antes de cada deploy
- Mantienen últimos 10 backups
- Guardan referencia al último backup para rollback

**Verificar backups disponibles:**
```bash
ssh root@116.203.98.142
ls -lth /var/www/backups/ | head -20
```

---

### ✅ **Monitorizar logs en tiempo real**

```bash
# Logs staging
ssh root@116.203.98.142
pm2 logs osyris-staging-frontend osyris-staging-backend

# Logs producción
pm2 logs osyris-frontend osyris-backend
```

---

### ✅ **Usar rollback solo en emergencias**

El rollback es para **situaciones críticas** donde producción está caída:

```bash
# Solo si producción está completamente inoperativa
./scripts/emergency-rollback.sh
```

Para problemas menores, mejor:
1. Identificar el problema
2. Hacer hotfix en código
3. Deploy normal staging → producción

---

## 📈 Checklist de Deploy

### 🔲 **Pre-Deploy**

- [ ] Código mergeado en `develop`
- [ ] Tests locales pasando (`npm test`)
- [ ] Build local exitoso (`npm run build`)
- [ ] Sin errores de linting (`npm run lint`)

### 🔲 **Deploy a Staging**

- [ ] Ejecutar `./scripts/deploy-to-staging.sh`
- [ ] Esperar ~5 minutos
- [ ] Abrir http://116.203.98.142:3001
- [ ] Verificar que carga correctamente
- [ ] Ejecutar `./scripts/verify-deployment.sh staging`
- [ ] Verificar tasa de éxito > 90%

### 🔲 **Testing en Staging**

- [ ] Login funciona correctamente
- [ ] Dashboard carga sin errores
- [ ] API responde correctamente
- [ ] No hay errores en browser console
- [ ] Todas las funcionalidades críticas funcionan

### 🔲 **Deploy a Producción**

- [ ] Staging verificado y funcionando
- [ ] Ejecutar `./scripts/deploy-to-production-from-staging.sh`
- [ ] Confirmar con `SI`
- [ ] Esperar ~2 minutos
- [ ] Abrir https://gruposcoutosyris.es
- [ ] Ejecutar `./scripts/verify-deployment.sh production`

### 🔲 **Post-Deploy**

- [ ] Verificar tasa de éxito > 90%
- [ ] Probar login en producción
- [ ] Verificar funcionalidades críticas
- [ ] Revisar logs de PM2: `pm2 logs osyris-frontend osyris-backend`
- [ ] Documentar cualquier issue encontrado

---

## 📚 Referencias

- **Documentación Next.js Environment Variables:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **PM2 Process Management:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **PostgreSQL Docker:** https://hub.docker.com/_/postgres

---

## 🤝 Soporte

Si encuentras problemas no documentados aquí:

1. Revisar logs: `pm2 logs`
2. Verificar servicios: `pm2 list`
3. Consultar documentación en `docs/deployment/`
4. Ejecutar diagnóstico: `./scripts/verify-deployment.sh`

---

**Última actualización:** 2025-01-18
**Autor:** Vicente Rivas Monferrer
**Versión:** 1.0.0


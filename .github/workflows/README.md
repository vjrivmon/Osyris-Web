# 🚀 GitHub Actions Workflows - Osyris

## 📋 Workflows Disponibles

### 1. `deploy-develop.yml` - Deploy desde Develop a Producción ⭐

**Trigger:**
- Push a rama `develop`
- Manual (`workflow_dispatch`)

**Descripción:** Deploy completo desde develop a producción con limpieza exhaustiva de caché.

**Características:**
- ✅ Limpieza completa de caché (.next, node_modules, npm cache)
- ✅ Testing comprehensivo
- ✅ Build fresco sin caché
- ✅ Backup automático de producción y BD
- ✅ Verificación completa post-deploy
- ✅ Rollback automático si falla

**Uso manual:**
```bash
# En GitHub:
Actions → Deploy from Develop to Production → Run workflow
```

**Tiempo estimado:** ~8-10 minutos

---

### 2. `deploy-hetzner.yml` - Deploy desde Main a Producción 🚀

**Trigger:**
- Push a rama `main`
- Manual (`workflow_dispatch`)

**Descripción:** Deploy optimizado desde main (branch estable) a producción.

**Características:**
- ✅ Limpieza de caché completa
- ✅ Build fresco con variables de producción
- ✅ Backup automático
- ✅ Verificación multi-intento (5 intentos)
- ✅ Logs detallados de PM2
- ✅ Verificación de contenido

**Uso manual:**
```bash
# En GitHub:
Actions → Deploy to Hetzner Production (Main) → Run workflow
```

**Tiempo estimado:** ~5-7 minutos

---

### 3. `deploy-to-staging.yml` - Deploy a Staging 🧪 (NUEVO)

**Trigger:**
- Push a rama `develop`
- Manual (`workflow_dispatch`)

**Descripción:** Deploy automático a entorno de staging para testing.

**Características:**
- ✅ Limpieza de caché staging
- ✅ Build con variables de staging
- ✅ Puertos: 3001 (frontend), 5001 (backend)
- ✅ Base de datos: osyris_staging_db
- ✅ Verificación de servicios

**Uso manual:**
```bash
# En GitHub:
Actions → Deploy to Staging Environment → Run workflow
```

**Opciones:**
- `rebuild_frontend`: Forzar rebuild completo

**Tiempo estimado:** ~4-6 minutos

---

## 🎯 Workflow Recomendado

### Para Desarrollo Normal:

```
1. Desarrollar en local
2. Commit a rama `develop`
3. GitHub Action automático → Staging
4. Verificar en: http://116.203.98.142:3001
5. Si todo OK → Merge develop → main
6. GitHub Action automático → Producción
```

### Para Deploy Urgente:

```
1. Fix en rama `develop`
2. Trigger manual de `deploy-develop.yml`
3. Verifica directamente en producción
```

---

## 📊 Comparación de Workflows

| Workflow | Rama | Destino | Limpieza Caché | Build Fresco | Tiempo |
|----------|------|---------|----------------|--------------|--------|
| `deploy-develop.yml` | develop | Producción | ✅ Completa | ✅ Sí | ~8-10 min |
| `deploy-hetzner.yml` | main | Producción | ✅ Completa | ✅ Sí | ~5-7 min |
| `deploy-to-staging.yml` | develop | Staging | ✅ Completa | ✅ Sí | ~4-6 min |

---

## 🔧 Configuración Requerida

### Secrets de GitHub

Los siguientes secrets deben estar configurados en: `Settings → Secrets and variables → Actions`

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `HETZNER_HOST` | IP del servidor Hetzner | `116.203.98.142` |
| `HETZNER_SSH_KEY` | Clave privada SSH | `-----BEGIN RSA PRIVATE KEY-----...` |

### Permisos Requeridos

- ✅ SSH access al servidor
- ✅ PM2 instalado en servidor
- ✅ Docker con PostgreSQL corriendo
- ✅ Node.js 20.x en servidor

---

## ✅ Verificaciones Automáticas

Cada workflow realiza las siguientes verificaciones:

### Durante el Deploy:
1. ✅ Tests unitarios (con allowance de fallos)
2. ✅ Build exitoso (.next existe)
3. ✅ Backup de BD completado
4. ✅ Servicios PM2 online

### Post-Deploy:
1. ✅ Frontend responde (HTTP 200)
2. ✅ Backend API responde
3. ✅ Contenido verificado (palabra "Osyris")
4. ✅ Puertos activos (3000, 5000)
5. ✅ Logs sin errores críticos

---

## 🧹 Limpieza de Caché

Todos los workflows implementan limpieza completa de caché:

### En CI (GitHub Actions):
```bash
# Limpieza de workspace
rm -rf .next build dist node_modules/.cache
npm cache clean --force

# Build fresco
npx next clean
rm -rf .next
npm run build
```

### En Servidor:
```bash
# Limpieza completa
rm -rf .next node_modules/.cache api-osyris/.next
npm cache clean --force

# Reinstalación fresca
rm -rf node_modules
npm ci --prefer-offline

# Build con variables
export NEXT_PUBLIC_API_URL="..."
npm run build
```

---

## 📝 Logs y Debugging

### Ver Logs de Workflow en GitHub:
```
1. Ir a Actions
2. Seleccionar el workflow
3. Clic en el run específico
4. Expandir steps para ver logs detallados
```

### Ver Logs en Servidor:
```bash
# SSH al servidor
ssh root@116.203.98.142

# Logs PM2 producción
pm2 logs osyris-frontend --lines 50
pm2 logs osyris-backend --lines 50

# Logs PM2 staging
pm2 logs osyris-staging-frontend --lines 50
pm2 logs osyris-staging-backend --lines 50

# Estado de servicios
pm2 list | grep osyris
```

---

## 🆘 Troubleshooting

### Error: "Build falló - .next no existe"

**Causa:** Build de Next.js falló

**Solución:**
```bash
# Revisar logs del step "Build frontend"
# Verificar variables de entorno
# Comprobar sintaxis en código TypeScript
```

### Error: "Frontend no responde después de 5 intentos"

**Causa:** PM2 no inició correctamente

**Solución:**
```bash
ssh root@116.203.98.142
pm2 list
pm2 logs osyris-frontend --lines 100
pm2 restart osyris-frontend
```

### Error: "Backend API no responde"

**Causa:** Backend no conecta a BD o error en código

**Solución:**
```bash
ssh root@116.203.98.142
pm2 logs osyris-backend --lines 100
docker ps | grep osyris-db
docker logs osyris-db --tail 50
```

### Error: "SSH connection failed"

**Causa:** Secret `HETZNER_SSH_KEY` incorrecto

**Solución:**
1. Verificar que el secret está configurado
2. Verificar que la clave SSH es válida
3. Probar conexión manual: `ssh root@116.203.98.142`

---

## 🎯 Best Practices

### 1. Siempre probar en Staging primero
```bash
# ❌ MAL: Push directo a main
git push origin main

# ✅ BIEN: Push a develop → staging → validate → main
git push origin develop
# Esperar workflow staging
# Verificar http://116.203.98.142:3001
# Merge a main cuando esté OK
```

### 2. Usar workflow manual para urgencias
```bash
# Para fixes urgentes:
1. Hacer cambios en develop
2. Trigger manual de deploy-develop.yml
3. Evitar esperar el auto-trigger
```

### 3. Monitorear logs durante deploy
```bash
# Abrir en terminal paralelo:
ssh root@116.203.98.142 "pm2 logs --raw"

# Mientras el workflow corre en GitHub
```

### 4. Verificar antes de declarar éxito
```bash
# Después del workflow:
curl -I https://gruposcoutosyris.es
curl https://gruposcoutosyris.es/api/health
```

---

## 📚 Recursos Adicionales

- **Scripts locales:** `scripts/DEPLOYMENT_WORKFLOW.md`
- **Workflow comparison:** Este README
- **PM2 docs:** https://pm2.keymetrics.io/docs
- **Next.js build:** https://nextjs.org/docs/deployment

---

## 🔄 Actualizaciones

**Última actualización:** 2025-10-19
**Versión workflows:** 2.0
**Cambios recientes:**
- ✅ Añadido `deploy-to-staging.yml`
- ✅ Mejorada limpieza de caché en todos los workflows
- ✅ Añadida verificación multi-intento
- ✅ Logs detallados de PM2

---

**Sistema de deployment completo y listo para CI/CD profesional** 🚀


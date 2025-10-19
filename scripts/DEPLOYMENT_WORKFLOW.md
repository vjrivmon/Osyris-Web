# 🚀 Workflow Completo de Deployment - Osyris

## 📋 Índice

1. [Arquitectura de Deployment](#arquitectura-de-deployment)
2. [Scripts Disponibles](#scripts-disponibles)
3. [Workflow Completo](#workflow-completo)
4. [Casos de Uso Comunes](#casos-de-uso-comunes)
5. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura de Deployment

```
┌──────────────┐
│  DESARROLLO  │ (localhost:3000 / 5000)
│   (local)    │
└──────┬───────┘
       │ git push / manual copy
       ▼
┌──────────────┐
│   STAGING    │ (116.203.98.142:3001 / 5001)
│  (testing)   │ ← Réplica exacta de producción
└──────┬───────┘
       │ deploy-to-production-from-staging.sh
       ▼
┌──────────────┐
│  PRODUCCIÓN  │ (gruposcoutosyris.es / 116.203.98.142:3000 / 5000)
│   (public)   │
└──────────────┘
```

### Entornos

| Entorno | Frontend | Backend | Base de Datos | Uso |
|---------|----------|---------|---------------|-----|
| **Desarrollo** | localhost:3000 | localhost:5000 | PostgreSQL local | Desarrollo diario |
| **Staging** | 116.203.98.142:3001 | 116.203.98.142:5001 | osyris_staging_db | Testing pre-producción |
| **Producción** | gruposcoutosyris.es | gruposcoutosyris.es/api | osyris_db | Público |

---

## 📁 Scripts Disponibles

### 1. `deploy-to-staging.sh` ⭐ Principal

**Descripción:** Crea una réplica completa de producción en staging para testing.

**Uso:**
```bash
./scripts/deploy-to-staging.sh
```

**Qué hace:**
1. ✅ Backup automático de producción
2. ✅ Detiene servicios staging anteriores
3. ✅ Copia archivos de producción a staging
4. ✅ Crea environment de staging (.env)
5. ✅ Genera build específica con variables correctas
6. ✅ Crea/actualiza base de datos staging (réplica de producción)
7. ✅ Inicia servicios con PM2
8. ✅ Verificación de salud

**Tiempo:** ~5 minutos

**Cuándo usar:**
- Antes de desplegar cambios a producción
- Para testing completo de funcionalidades
- Después de cambios importantes en código

---

### 2. `update-staging-files.sh` ⚡ Actualización Rápida (NUEVO)

**Descripción:** Copia archivos específicos modificados a staging y reinicia servicios automáticamente.

**Uso:**
```bash
# Actualizar un archivo específico
./scripts/update-staging-files.sh src/components/aula-virtual/sidebar.tsx

# Actualizar múltiples archivos
./scripts/update-staging-files.sh \
    src/app/aula-virtual/ajustes/page.tsx \
    api-osyris/src/controllers/usuario.controller.js

# Actualizar y forzar rebuild del frontend
./scripts/update-staging-files.sh --rebuild-frontend src/app/login/page.tsx

# Actualizar solo backend y reiniciar
./scripts/update-staging-files.sh --restart-backend api-osyris/src/routes/auth.routes.js
```

**Qué hace:**
1. ✅ Verifica conexión con staging
2. ✅ Copia archivos especificados vía SCP
3. ✅ Detecta automáticamente si necesita rebuild (frontend) o reinicio (backend)
4. ✅ Reinicia servicios afectados
5. ✅ Verifica estado final

**Tiempo:** ~30 segundos

**Cuándo usar:**
- Durante desarrollo activo
- Después de cambios pequeños en código
- Para testing rápido de correcciones
- **Este es el script que he estado usando manualmente durante toda la sesión**

---

### 3. `deploy-to-production-from-staging.sh` 🚀 Deploy a Producción

**Descripción:** Sincroniza staging validado a producción con cero downtime.

**Uso:**
```bash
./scripts/deploy-to-production-from-staging.sh
```

**Qué hace:**
1. ✅ Verifica que staging esté funcionando
2. ✅ **Confirmación explícita del usuario**
3. ✅ Backup instantáneo de producción
4. ✅ Parada graceful de servicios de producción
5. ✅ Sincronización ultra-rápida (rsync)
6. ✅ Rebuild frontend con variables de producción
7. ✅ Restaura environment de producción
8. ✅ Sincroniza base de datos (si hay cambios)
9. ✅ Inicia servicios de producción
10. ✅ Verificación completa + logs
11. ✅ Crea script de rollback automático

**Tiempo:** ~2-3 minutos

**Cuándo usar:**
- **Solo después de validar completamente en staging**
- Para desplegar nuevas features
- Para aplicar fixes críticos

---

### 4. `start-staging-server.sh` 🔄 Reinicio de Staging

**Descripción:** Inicia o reinicia servicios de staging con PM2.

**Uso:**
```bash
# Ejecutar localmente
./scripts/start-staging-server.sh

# O desde el servidor
ssh root@116.203.98.142
/var/www/osyris-staging/current/scripts/start-staging-server.sh
```

**Qué hace:**
1. ✅ Verifica PM2 instalado
2. ✅ Detiene servicios anteriores
3. ✅ Limpia puertos ocupados
4. ✅ Inicia backend y frontend con PM2
5. ✅ Verifica estado

**Tiempo:** ~10 segundos

**Cuándo usar:**
- Después de un crash
- Para reiniciar servicios después de cambios
- Para verificar estado de staging

---

## 🎯 Workflow Completo

### Workflow Típico de Desarrollo → Producción

```bash
# 1️⃣ DESARROLLO LOCAL
cd /home/vicente/RoadToDevOps/osyris/Osyris-Web
npm run dev
# ... realizar cambios ...

# 2️⃣ DEPLOY A STAGING (Opción A: Completo)
./scripts/deploy-to-staging.sh
# Esperar ~5 minutos

# 2️⃣ DEPLOY A STAGING (Opción B: Actualización rápida - RECOMENDADO)
./scripts/update-staging-files.sh \
    src/components/ui/new-component.tsx \
    api-osyris/src/controllers/new-controller.js
# Esperar ~30 segundos

# 3️⃣ TESTING EN STAGING
# Abrir: http://116.203.98.142:3001
# Probar funcionalidades exhaustivamente

# 4️⃣ DEPLOY A PRODUCCIÓN (solo si staging está OK)
./scripts/deploy-to-production-from-staging.sh
# Confirmar con "SI"
# Esperar ~2-3 minutos

# 5️⃣ VERIFICACIÓN FINAL
# Abrir: https://gruposcoutosyris.es
# Verificar que todo funciona
```

---

## 💡 Casos de Uso Comunes

### Caso 1: Desarrollo Iterativo de un Componente

**Escenario:** Estás trabajando en un componente React y quieres ver los cambios en staging rápidamente.

```bash
# Editar archivo localmente
code src/components/admin/user-table.tsx

# Actualizar en staging (30 segundos)
./scripts/update-staging-files.sh src/components/admin/user-table.tsx

# Ver cambios en: http://116.203.98.142:3001
# Repetir hasta estar satisfecho

# Cuando esté todo OK, deploy a producción
./scripts/deploy-to-production-from-staging.sh
```

---

### Caso 2: Fix Urgente en Producción

**Escenario:** Hay un bug crítico en producción que necesitas arreglar YA.

```bash
# 1. Hacer fix localmente
code api-osyris/src/controllers/auth.controller.js

# 2. Probar fix en staging (30 segundos)
./scripts/update-staging-files.sh api-osyris/src/controllers/auth.controller.js

# 3. Verificar que funciona en staging
# http://116.203.98.142:3001

# 4. Deploy urgente a producción (2 minutos)
./scripts/deploy-to-production-from-staging.sh
```

---

### Caso 3: Nueva Feature Completa

**Escenario:** Has desarrollado una nueva feature con múltiples archivos.

```bash
# 1. Desarrollo local completo
npm run dev
# ... múltiples cambios ...

# 2. Deploy completo a staging
./scripts/deploy-to-staging.sh
# Esperar ~5 minutos

# 3. Testing exhaustivo en staging
# Probar todos los casos de uso

# 4. Si encuentras un bug, arréglalo y actualiza rápido
./scripts/update-staging-files.sh src/app/new-feature/page.tsx

# 5. Cuando todo esté validado, deploy a producción
./scripts/deploy-to-production-from-staging.sh
```

---

### Caso 4: Actualización de Base de Datos

**Escenario:** Necesitas añadir una columna a la tabla usuarios.

```bash
# 1. Modificar schema localmente
code api-osyris/database/migrations/add_column.sql

# 2. Deploy a staging (incluye BD)
./scripts/deploy-to-staging.sh

# 3. Verificar que la migración funcionó
ssh root@116.203.98.142
docker exec -it osyris-db psql -U osyris_user -d osyris_staging_db
\d usuarios

# 4. Deploy a producción (sincroniza BD automáticamente)
./scripts/deploy-to-production-from-staging.sh
```

---

## 🛠️ Comandos Útiles

### Ver Logs de Staging

```bash
# Logs en tiempo real
ssh root@116.203.98.142 "pm2 logs osyris-staging-frontend"
ssh root@116.203.98.142 "pm2 logs osyris-staging-backend"

# Últimas 50 líneas
ssh root@116.203.98.142 "pm2 logs osyris-staging-backend --lines 50 --nostream"
```

### Ver Estado de Servicios

```bash
# Estado PM2
ssh root@116.203.98.142 "pm2 list | grep osyris"

# Puertos abiertos
ssh root@116.203.98.142 "netstat -tlnp | grep ':3001\|:5001\|:3000\|:5000'"
```

### Reiniciar Servicios Manualmente

```bash
# Reiniciar staging
ssh root@116.203.98.142 "pm2 restart osyris-staging-frontend osyris-staging-backend"

# Reiniciar producción
ssh root@116.203.98.142 "pm2 restart osyris-frontend osyris-backend"
```

### Copiar Archivos Individuales (Manual)

```bash
# Copiar un archivo específico
scp src/components/ui/button.tsx root@116.203.98.142:/var/www/osyris-staging/current/src/components/ui/

# Copiar un controlador
scp api-osyris/src/controllers/auth.controller.js root@116.203.98.142:/var/www/osyris-staging/current/api-osyris/src/controllers/

# Rebuild frontend después de copiar
ssh root@116.203.98.142 "cd /var/www/osyris-staging/current && rm -rf .next && export NEXT_PUBLIC_API_URL='http://116.203.98.142:5001' && npm run build"

# Reiniciar servicios
ssh root@116.203.98.142 "pm2 restart osyris-staging-frontend osyris-staging-backend"
```

---

## 🆘 Troubleshooting

### Error: "No se puede conectar al servidor"

```bash
# Verificar conexión SSH
ssh root@116.203.98.142 "echo 'Conexión OK'"

# Verificar que el servidor está activo
ping 116.203.98.142
```

### Error: "Puerto ocupado"

```bash
# Liberar puertos en staging
ssh root@116.203.98.142 "fuser -k 3001/tcp 5001/tcp"

# Liberar puertos en producción
ssh root@116.203.98.142 "fuser -k 3000/tcp 5000/tcp"

# Reiniciar servicios
./scripts/start-staging-server.sh
```

### Error: "Build fallido"

```bash
# Ver logs de build
ssh root@116.203.98.142 "cd /var/www/osyris-staging/current && npm run build"

# Si node_modules está corrupto
ssh root@116.203.98.142 "cd /var/www/osyris-staging/current && rm -rf node_modules && npm ci"
```

### Error: "Base de datos no responde"

```bash
# Verificar estado de PostgreSQL
ssh root@116.203.98.142 "docker ps | grep osyris-db"

# Reiniciar PostgreSQL si es necesario
ssh root@116.203.98.142 "docker restart osyris-db"

# Verificar conexión
ssh root@116.203.98.142 "docker exec -it osyris-db psql -U osyris_user -d osyris_staging_db -c 'SELECT 1'"
```

### Rollback de Producción

```bash
# Si algo sale mal después del deploy
ssh root@116.203.98.142 "/var/www/rollback-last-deploy.sh"
```

---

## 📊 Comparación de Scripts

| Script | Tiempo | Uso | Cuándo |
|--------|--------|-----|--------|
| `deploy-to-staging.sh` | ~5 min | Deploy completo a staging | Grandes cambios, nuevas features |
| `update-staging-files.sh` | ~30 seg | Actualización rápida | Desarrollo iterativo, fixes pequeños |
| `deploy-to-production-from-staging.sh` | ~2-3 min | Staging → Producción | Solo después de validar staging |
| `start-staging-server.sh` | ~10 seg | Reinicio de servicios | Después de crash o mantenimiento |

---

## 🎓 Mejores Prácticas

1. **Nunca desplegar directamente a producción**
   - Siempre pasar por staging primero
   - Validar exhaustivamente antes de producción

2. **Usar `update-staging-files.sh` durante desarrollo**
   - Más rápido que deploy completo
   - Ideal para cambios incrementales

3. **Verificar logs después de cada deploy**
   ```bash
   ssh root@116.203.98.142 "pm2 logs osyris-staging-backend --lines 20 --nostream"
   ```

4. **Hacer backups antes de cambios grandes**
   - Los scripts lo hacen automáticamente
   - Pero puedes hacer uno manual también

5. **Probar en staging con usuarios reales si es posible**
   - Staging tiene datos reales de producción
   - Ideal para testing realista

---

## 📞 Soporte

Si encuentras problemas con los scripts:
1. Revisa los logs: `pm2 logs osyris-staging-backend`
2. Verifica el estado: `pm2 list | grep osyris`
3. Consulta esta documentación
4. En último caso, rollback: `/var/www/rollback-last-deploy.sh`

---

**Última actualización:** 2025-10-19
**Versión:** 2.0
**Autor:** Sistema de Deployment Osyris


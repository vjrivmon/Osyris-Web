# 📖 Guía de Scripts de Deployment Manual

Esta guía documenta los **scripts más importantes** para deployment manual, cuando necesitas desplegar sin usar GitHub Actions.

---

## 🎯 Scripts Esenciales (Top 6)

### 1. 🧪 `./scripts/sync-local-to-staging.sh`

**¿Qué hace?**
Sincroniza tu código local con el servidor de **STAGING** (puerto 3001/5001).

**¿Cuándo usarlo?**
- Quieres probar cambios en staging sin hacer commit
- GitHub Actions está caído
- Quieres deployment manual rápido para testing

**Uso:**
```bash
./scripts/sync-local-to-staging.sh
```

**Lo que hace paso a paso:**
1. ✅ Detiene servicios PM2 de staging (osyris-staging-frontend/backend)
2. ✅ Limpia caché (.next, node_modules/.cache)
3. ✅ Sincroniza archivos locales → /var/www/osyris-staging/current
4. ✅ Instala dependencias frescas
5. ✅ Build de Next.js
6. ✅ Configura .env para staging (puerto 5001, DB: osyris_staging_db)
7. ✅ Reinicia servicios PM2
8. ✅ Verifica que staging está online

**Rutas y puertos:**
- Ruta servidor: `/var/www/osyris-staging/current`
- Frontend: `http://116.203.98.142:3001`
- Backend: `http://116.203.98.142:5001`
- Base de datos: `osyris_staging_db`
- Servicios PM2: `osyris-staging-frontend`, `osyris-staging-backend`

---

### 2. 🚀 `./scripts/sync-local-to-production.sh`

**¿Qué hace?**
Sincroniza tu código local con el servidor de **PRODUCCIÓN** (puerto 3000/5000).

**⚠️ PELIGRO:** Este script afecta producción directamente. Úsalo con precaución.

**¿Cuándo usarlo?**
- Staging funciona perfectamente y quieres replicar en producción
- Hotfix urgente que no puede esperar a GitHub Actions
- Migración manual controlada (como hicimos hoy)

**Uso:**
```bash
./scripts/sync-local-to-production.sh
```

**Lo que hace paso a paso:**
1. ✅ **BACKUP automático** de base de datos producción
2. ✅ Detiene servicios PM2 de producción (osyris-frontend/backend)
3. ✅ Limpia caché (.next, node_modules/.cache)
4. ✅ Sincroniza archivos locales → /var/www/osyris/current
5. ✅ Instala dependencias frescas
6. ✅ Build de Next.js
7. ✅ Configura .env para producción (puerto 5000, DB: osyris_db)
8. ✅ Reinicia servicios PM2
9. ✅ Verifica que producción está online

**Rutas y puertos:**
- Ruta servidor: `/var/www/osyris/current`
- Frontend: `http://116.203.98.142:3000` (→ https://gruposcoutosyris.es)
- Backend: `http://116.203.98.142:5000`
- Base de datos: `osyris_db`
- Servicios PM2: `osyris-frontend`, `osyris-backend`

**Seguridad:**
- Crea backup de BD automáticamente en `/root/backups/production-YYYYMMDD-HHMMSS/`
- Mantiene 2 backups más recientes
- Si falla, puedes hacer rollback con `./scripts/emergency-rollback.sh`

---

### 3. 💻 `./scripts/dev-start.sh`

**¿Qué hace?**
Inicia el entorno de **desarrollo local** completo (frontend + backend + PostgreSQL).

**¿Cuándo usarlo?**
- Desarrollo diario en tu máquina local
- Testing antes de hacer commit
- Desarrollo de nuevas features

**Uso:**
```bash
./scripts/dev-start.sh
```

**Lo que hace:**
1. ✅ Mata procesos previos en puertos 3000/5000 (5 intentos automáticos)
2. ✅ Verifica que PostgreSQL Docker está corriendo
3. ✅ Inicia frontend en puerto 3000 (Next.js dev mode)
4. ✅ Inicia backend en puerto 5000 (Nodemon con hot-reload)

**Rutas locales:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Base de datos: `localhost:5432` (Docker container: osyris-db)

**Características:**
- ✅ Limpieza automática de puertos ocupados
- ✅ Hot-reload en frontend y backend
- ✅ Logging colorizado
- ✅ Gestión de errores

---

### 4. 🔄 `./scripts/restart-staging-pm2.sh`

**¿Qué hace?**
Reinicia **solo los servicios PM2 de staging** sin redesplegar código.

**¿Cuándo usarlo?**
- Staging está online pero se comporta raro
- Cambios en variables de entorno (.env)
- Memoria alta en servicios PM2

**Uso:**
```bash
./scripts/restart-staging-pm2.sh
```

**Lo que hace:**
1. ✅ Para servicios staging (osyris-staging-frontend/backend)
2. ✅ Espera 2 segundos
3. ✅ Reinicia servicios con --update-env
4. ✅ Muestra estado final con `pm2 list`

**NO hace:**
- ❌ NO sincroniza código nuevo
- ❌ NO hace build
- ❌ NO toca base de datos

---

### 5. 🆘 `./scripts/emergency-rollback.sh`

**¿Qué hace?**
Revierte producción al **último backup** disponible si algo salió mal.

**⚠️ EMERGENCIA:** Solo usar si producción está caída y necesitas volver atrás YA.

**¿Cuándo usarlo?**
- Deployment a producción rompió algo crítico
- Servicios PM2 no se levantan
- Errores graves en producción

**Uso:**
```bash
./scripts/emergency-rollback.sh
```

**Lo que hace:**
1. ✅ Lista backups disponibles
2. ✅ Te pregunta cuál restaurar
3. ✅ Para servicios PM2
4. ✅ Restaura código desde backup
5. ✅ Restaura base de datos desde backup
6. ✅ Reinicia servicios
7. ✅ Verifica que todo funciona

**Backups disponibles:**
- Código: `/var/www/osyris/backup_YYYYMMDD_HHMMSS/`
- Base de datos: `/root/backups/backup_db_YYYYMMDD_HHMMSS.sql.gz`

---

### 6. 💾 `./scripts/backup.sh`

**¿Qué hace?**
Crea **backup manual completo** de base de datos de producción.

**¿Cuándo usarlo?**
- Antes de migraciones de BD arriesgadas
- Antes de cambios estructurales importantes
- Backup adicional de seguridad

**Uso:**
```bash
./scripts/backup.sh
```

**Lo que hace:**
1. ✅ Conecta a container Docker osyris-db
2. ✅ Ejecuta pg_dump de la base de datos osyris_db
3. ✅ Comprime con gzip
4. ✅ Guarda en `/root/backups/` con timestamp

**Resultado:**
```
/root/backups/backup_db_20251025_143104.sql.gz
```

---

## 📊 Resumen de Rutas y Puertos

### Staging
| Componente      | Ruta                              | Puerto | Base de Datos        |
|----------------|-----------------------------------|--------|----------------------|
| Frontend       | `/var/www/osyris-staging/current` | 3001   | osyris_staging_db    |
| Backend        | `/var/www/osyris-staging/current` | 5001   | osyris_staging_db    |
| URL Frontend   | http://116.203.98.142:3001        | -      | -                    |
| URL Backend    | http://116.203.98.142:5001        | -      | -                    |
| PM2 Frontend   | osyris-staging-frontend           | -      | -                    |
| PM2 Backend    | osyris-staging-backend            | -      | -                    |

### Producción
| Componente      | Ruta                         | Puerto | Base de Datos |
|----------------|------------------------------|--------|---------------|
| Frontend       | `/var/www/osyris/current`    | 3000   | osyris_db     |
| Backend        | `/var/www/osyris/current`    | 5000   | osyris_db     |
| URL Frontend   | https://gruposcoutosyris.es  | -      | -             |
| URL Backend    | https://gruposcoutosyris.es/api | -   | -             |
| PM2 Frontend   | osyris-frontend              | -      | -             |
| PM2 Backend    | osyris-backend               | -      | -             |

### Desarrollo Local
| Componente      | Ruta                  | Puerto |
|----------------|----------------------|--------|
| Frontend       | `./`                 | 3000   |
| Backend        | `./api-osyris`       | 5000   |
| PostgreSQL     | Docker container     | 5432   |

---

## 🔥 Flujos de Trabajo Recomendados

### Flujo 1: Desarrollo Normal
```bash
# 1. Hacer cambios en local
code .

# 2. Iniciar entorno local
./scripts/dev-start.sh

# 3. Testear en http://localhost:3000

# 4. Cuando funciona, hacer commit
git add .
git commit -m "feat: nueva funcionalidad"
git push origin develop

# 5. GitHub Actions desplegará automáticamente a STAGING
# Verificar en: http://116.203.98.142:3001

# 6. Si staging OK, mergear a main para producción
git checkout main
git merge develop
git push origin main

# 7. GitHub Actions desplegará STAGING → PRODUCCIÓN automáticamente
```

### Flujo 2: Hotfix Urgente (Sin GitHub Actions)
```bash
# 1. Hacer fix en local
code .

# 2. Testear localmente
./scripts/dev-start.sh

# 3. Desplegar a STAGING manualmente
./scripts/sync-local-to-staging.sh

# 4. Verificar staging funciona
curl http://116.203.98.142:3001

# 5. Si OK, desplegar a PRODUCCIÓN manualmente
./scripts/sync-local-to-production.sh

# 6. Verificar producción funciona
curl https://gruposcoutosyris.es

# 7. Hacer commit para que GitHub esté actualizado
git add .
git commit -m "hotfix: ..."
git push origin develop
git push origin main
```

### Flujo 3: Rollback de Emergencia
```bash
# Si producción está rota:

# 1. Ejecutar rollback inmediato
./scripts/emergency-rollback.sh

# 2. Verificar que producción volvió a funcionar
curl https://gruposcoutosyris.es

# 3. Investigar qué salió mal en staging
ssh root@116.203.98.142
pm2 logs osyris-staging-backend --lines 100

# 4. Arreglar el problema en local

# 5. Seguir Flujo 2 (Hotfix Urgente)
```

---

## ⚠️ Advertencias Importantes

### ❌ NO HACER
- ❌ NO ejecutar `sync-local-to-production.sh` sin probar en staging primero
- ❌ NO hacer cambios directos en el servidor (siempre desde local)
- ❌ NO borrar backups manualmente sin verificar
- ❌ NO ignorar errores de staging ("ya lo arreglo en producción")
- ❌ NO saltarte el paso de verificación después de deploy

### ✅ SÍ HACER
- ✅ SIEMPRE testear en local primero
- ✅ SIEMPRE desplegar a staging antes que producción
- ✅ SIEMPRE verificar que staging funciona correctamente
- ✅ SIEMPRE hacer backup antes de cambios arriesgados
- ✅ SIEMPRE tener un plan de rollback

---

## 🔍 Comandos Útiles de Verificación

### Ver estado de servicios PM2
```bash
ssh root@116.203.98.142 "pm2 list"
```

### Ver logs en tiempo real
```bash
# Staging
ssh root@116.203.98.142 "pm2 logs osyris-staging-backend --lines 50"

# Producción
ssh root@116.203.98.142 "pm2 logs osyris-backend --lines 50"
```

### Verificar base de datos
```bash
# Staging
ssh root@116.203.98.142 "docker exec osyris-db psql -U osyris_user -d osyris_staging_db -c 'SELECT COUNT(*) FROM educandos;'"

# Producción
ssh root@116.203.98.142 "docker exec osyris-db psql -U osyris_user -d osyris_db -c 'SELECT COUNT(*) FROM educandos;'"
```

### Verificar puertos abiertos
```bash
ssh root@116.203.98.142 "netstat -tlnp | grep ':3000\\|:3001\\|:5000\\|:5001'"
```

---

## 🎓 Mejores Prácticas

1. **Siempre usa el flujo 2-fases**: Local → Staging → Producción
2. **Nunca saltarte staging**: Es tu red de seguridad
3. **Backups antes de cambios grandes**: `./scripts/backup.sh`
4. **Verifica SIEMPRE después de deploy**: No asumas que funcionó
5. **Logs son tus amigos**: Revisa logs cuando algo falla
6. **Documenta cambios manuales**: Haz commit después de deployment manual

---

**Última actualización:** 2025-10-25
**Autor:** Claude + Vicente Rivas

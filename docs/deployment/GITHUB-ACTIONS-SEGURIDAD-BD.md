# 🔒 Seguridad de Base de Datos en GitHub Actions

## Fecha: 2025-10-25
## Autor: Claude Code + Vicente Rivas

---

## ✅ CONFIRMACIÓN: GitHub Actions NO sobreescribe la base de datos

### 🛡️ Garantías de seguridad

Los workflows de GitHub Actions están **diseñados para ser seguros** con la base de datos:

#### ✅ Lo que SÍ hacen los workflows:

1. **Backup automático antes de cada deploy**
   ```yaml
   # deploy-hetzner.yml línea 122
   # deploy-develop.yml línea 244
   docker exec osyris-db pg_dump -U osyris_user osyris_db | \
     gzip > backup_db_$(date +%Y%m%d_%H%M%S).sql.gz
   ```

2. **Actualizar SOLO código**
   - Frontend (Next.js)
   - Backend (Express.js)
   - Dependencias npm
   - Builds frescos

3. **Verificar que PostgreSQL está corriendo**
   ```yaml
   docker start osyris-db || docker-compose -f docker-compose.prod.yml up -d db
   ```

#### ❌ Lo que NO hacen (y es bueno):

- ❌ NO ejecutan `init.sql`
- ❌ NO ejecutan migraciones automáticamente
- ❌ NO resetean tablas
- ❌ NO tocan los datos existentes
- ❌ Excluyen el directorio `api-osyris/database` del deploy

```yaml
# deploy-hetzner.yml línea 89
tar -czf deploy.tar.gz \
  --exclude=api-osyris/database \  # ← Esto protege la BD
  ...
```

---

## 📊 Estado actual de la base de datos

### Tablas en producción (13 total):

| Tabla | Tamaño | Estado |
|-------|--------|--------|
| educandos | 64 kB | ✅ Migrada |
| familiares_educandos | 40 kB | ✅ Migrada |
| documentos_familia | 48 kB | ✅ Migrada |
| notificaciones_familia | 48 kB | ✅ Migrada |
| galeria_fotos_privada | 48 kB | ✅ Migrada |
| confirmaciones_asistencia | 40 kB | ✅ Migrada |
| documentos | 32 kB | ✅ Actualizada |
| actividades | 48 kB | ✅ Existente |
| audit_log | 40 kB | ✅ Existente |
| mensajes | 48 kB | ✅ Existente |
| paginas | 96 kB | ✅ Existente |
| secciones | 64 kB | ✅ Existente |
| usuarios | 128 kB | ✅ Existente |

---

## 🔄 Flujo seguro de trabajo

### 1️⃣ Desarrollo Local

```bash
# Trabajar en tu máquina
cd /home/vicente/RoadToDevOps/osyris/Osyris-Web
git checkout develop
# ... hacer cambios en código ...
```

### 2️⃣ Commit y Push

```bash
git add .
git commit -m "feat: nueva funcionalidad X"
git push origin develop
```

### 3️⃣ GitHub Actions se activa automáticamente

**Lo que hace:**
- ✅ Ejecuta tests
- ✅ Hace build fresco
- ✅ Crea backup de BD
- ✅ Sube código nuevo
- ✅ Reinicia servicios PM2
- ❌ NO toca la base de datos

### 4️⃣ Verificación post-deploy

```bash
./scripts/verify-database-after-deploy.sh
```

**Resultado esperado:**
```
✅ VERIFICACIÓN EXITOSA
📊 La base de datos está intacta después del deploy
Todas las 13 tablas están presentes
```

---

## 🚀 Scripts disponibles

### Migración manual (cuando sea necesario)

```bash
./scripts/migrate-database-production.sh
```

- Ejecutar desde: **LOCAL** (tu máquina)
- Conecta por SSH al servidor
- Hace backup automático
- Ejecuta migraciones en transacciones
- Rollback automático si hay errores

### Verificación post-deploy

```bash
./scripts/verify-database-after-deploy.sh
```

- Cuenta tablas (debe ser ≥ 13)
- Lista todas las tablas y tamaños
- Verifica tablas críticas del sistema de familias
- Falla si falta alguna tabla

---

## 📝 Workflows de GitHub Actions

### `deploy-hetzner.yml` (rama main)

**Trigger:**
- Push a `main`
- Manual con `workflow_dispatch`

**Protecciones BD:**
```yaml
línea 89:  --exclude=api-osyris/database
línea 122: Backup de BD antes de deploy
línea 208: Solo verifica que PostgreSQL está corriendo
```

### `deploy-develop.yml` (rama develop)

**Trigger:**
- Push a `develop`
- Manual con `workflow_dispatch`

**Protecciones BD:**
```yaml
línea 244: Backup de BD antes de deploy
línea 344: Solo verifica que PostgreSQL está corriendo
```

---

## ⚠️ Casos especiales

### ¿Cuándo ejecutar migraciones manualmente?

Solo cuando:
1. Añadas nuevas tablas
2. Modifiques estructura de tablas existentes
3. Añadas/elimines columnas
4. Cambies constraints o índices

### ¿Cómo hacerlo de forma segura?

```bash
# 1. Crear archivo de migración
# scripts/migrations/002_nombre_descriptivo.sql

# 2. Ejecutar migración
./scripts/migrate-database-production.sh

# 3. Verificar resultado
./scripts/verify-database-after-deploy.sh

# 4. Si todo OK, hacer commit y push
git add scripts/migrations/002_nombre_descriptivo.sql
git commit -m "feat(db): añadir tabla X para funcionalidad Y"
git push origin develop
```

---

## 🎯 Conclusión

### ✅ ES SEGURO hacer commit y push

- GitHub Actions **NO** sobreescribirá tu base de datos
- Las migraciones manuales **permanecen**
- Los datos **se mantienen intactos**
- Solo se actualiza **código**

### 🛡️ Protecciones activas:

1. **Backup automático** antes de cada deploy
2. **Exclusión** del directorio de base de datos
3. **No ejecución** de scripts SQL automáticos
4. **Verificación** disponible post-deploy

---

## 📞 Contacto

**Mantenedor:** Vicente Rivas Monferrer
**Proyecto:** Osyris Scout Management System
**Última actualización:** 2025-10-25

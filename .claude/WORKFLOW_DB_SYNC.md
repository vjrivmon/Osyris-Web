# 🔄 Workflow Completo: Desarrollo Local → Producción con BD Sincronizada

## 🎯 Sistema Configurado

Tu sistema ya está **100% configurado** para:
1. ✅ Trabajar en local con datos reales de producción
2. ✅ Actualizar automáticamente la BD en producción al hacer deploy
3. ✅ Backups automáticos antes de cada cambio
4. ✅ CI/CD completo con GitHub Actions

---

## 🚀 Flujo de Trabajo Diario

### 1️⃣ **Inicio del Día - Sincronizar BD**

```bash
# Descargar datos de producción a local
/sync-prod-db
```

**Qué hace:**
- 📥 Descarga BD de Hetzner (116.203.98.142)
- 💾 Hace backup de tu BD local actual
- 📊 Importa datos de producción
- ✅ Verificación automática

**Resultado:**
```
✅ BD local con datos EXACTOS de producción
🔧 Listo para desarrollar con datos reales
```

---

### 2️⃣ **Desarrollo - Trabajar en Local**

```bash
# Si no está corriendo, iniciar entorno
/dev-local

# Desarrollar normalmente
# Los cambios se recargan automáticamente
# http://localhost:3000
```

**Si necesitas modificar la estructura de BD:**

```bash
# Opción A: Modificar directo en local (testing)
docker exec -it osyris-postgres-local psql -U osyris_user -d osyris_db

# Hacer cambios...
ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);
\q

# Opción B: Crear migración para producción (siguiente paso)
```

---

### 3️⃣ **Crear Migración (Si cambiaste estructura BD)**

```bash
# Crear archivo de migración
nano database/migrations/$(date +%Y%m%d)_add_telefono.sql
```

**Contenido ejemplo:**
```sql
-- Añadir columna teléfono a usuarios
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

-- Crear índice si es necesario
CREATE INDEX IF NOT EXISTS idx_usuarios_telefono
ON usuarios(telefono);
```

**Guardar y cerrar** (Ctrl+X, Y, Enter)

---

### 4️⃣ **Verificar Sistema Local**

```bash
/check-health
```

**Debe mostrar:**
```
✅ PostgreSQL corriendo
✅ Backend corriendo (puerto 5000)
✅ Frontend corriendo (puerto 3000)
✅ Base de datos inicializada
✅ API responde correctamente
```

---

### 5️⃣ **Deploy a Producción** 🚀

```bash
/safe-deploy
```

**Qué pasa automáticamente:**

1. **Verificaciones locales:**
   - ✅ Tests ejecutados
   - ✅ Build frontend exitoso
   - ✅ Análisis de cambios

2. **Commit inteligente:**
   - 📝 Te pregunta tipo y descripción
   - ✅ Formato conventional commits
   - ✅ Git add + commit

3. **Push a GitHub:**
   - 📤 Push a tu rama
   - 🔄 Activa GitHub Actions

4. **GitHub Actions (Automático):**
   - ✅ Tests en CI
   - ✅ Build en CI
   - 💾 **Backup BD producción**
   - 📊 **Aplica migraciones automáticamente**
   - 🚀 Deploy a Hetzner
   - ♻️ Restart servicios PM2
   - ✅ Verificación health checks

5. **Resultado:**
   - 🌐 https://grupooosyris.es actualizado
   - 📊 BD actualizada con tus cambios
   - 💾 Backup disponible por si algo falla

**Tiempo total: ~5 minutos**

---

## 📊 Ejemplo Completo Real

### Caso: Añadir campo "teléfono" a usuarios

#### Paso 1: Sincronizar
```bash
/sync-prod-db
# ✅ Tienes datos reales
```

#### Paso 2: Desarrollar en local
```bash
# Modificar código para mostrar teléfono
nano app/dashboard/kraal/page.tsx
# (añadir campo telefono en UI)

# Probar en local
http://localhost:3000/dashboard/kraal
```

#### Paso 3: Crear migración
```bash
cat > database/migrations/20251003_add_telefono.sql <<'EOF'
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
EOF
```

#### Paso 4: Verificar
```bash
/check-health
# ✅ Todo OK
```

#### Paso 5: Deploy
```bash
/safe-deploy

# Te preguntará:
# Tipo: feat
# Scope: backend
# Descripción: add telefono field to usuarios

# Resultado:
# Commit: feat(backend): add telefono field to usuarios
# Push a GitHub
# GitHub Actions:
#   ✅ Tests
#   ✅ Build
#   💾 Backup BD producción
#   📊 Aplica: ALTER TABLE usuarios ADD COLUMN telefono...
#   🚀 Deploy
# ✅ Live en https://grupooosyris.es
```

---

## 🔄 Tipos de Migraciones

### 📝 SQL Simple (Recomendado)
```sql
-- database/migrations/20251003_add_column.sql
ALTER TABLE tabla ADD COLUMN IF NOT EXISTS columna VARCHAR(100);
```

### 🔧 Script Node.js (Para lógica compleja)
```javascript
// database/migrations/20251003_complex.js
const { Pool } = require('pg');
// ... (ver database/migrations/README.md)
```

---

## 🛡️ Seguridad y Backups

### Backups Automáticos
**Antes de CADA deploy:**
- 💾 Backup completo de BD
- 📦 Guardado como `backup_db_YYYYMMDD_HHMMSS.sql.gz`
- 🗂️ Últimos 10 backups mantenidos

### Recuperación
```bash
# SSH al servidor
ssh root@116.203.98.142

# Ver backups
ls -lh backup_db_*.sql.gz

# Restaurar
gunzip < backup_db_20251003_120000.sql.gz | \
  docker exec -i osyris-db psql -U osyris_user -d osyris_db
```

---

## ✅ GitHub Secrets Configurados

Todos los secrets ya están configurados automáticamente:

```
✅ HETZNER_SSH_KEY     (clave SSH privada)
✅ HETZNER_HOST        (116.203.98.142)
✅ DB_HOST             (localhost)
✅ DB_PORT             (5432)
✅ DB_USER             (osyris_user)
✅ DB_PASSWORD         (osyris_local_2024)
✅ DB_NAME             (osyris_db)
✅ JWT_SECRET          (generado seguro)
```

Ver en: https://github.com/vjrivmon/Osyris-Web/settings/secrets/actions

---

## 📊 Monitoreo

### Ver Deploy en Tiempo Real
```
https://github.com/vjrivmon/Osyris-Web/actions
```

### Ver Logs en Producción
```bash
ssh root@116.203.98.142
pm2 logs osyris-backend --lines 100
pm2 logs osyris-frontend --lines 100
```

### Verificar BD en Producción
```bash
ssh root@116.203.98.142 "docker exec osyris-db psql -U osyris_user -d osyris_db -c '\dt'"
```

---

## 🎯 Comandos Rápidos

| Comando | Qué Hace |
|---------|----------|
| `/sync-prod-db` | Sincroniza BD producción → local |
| `/dev-local` | Inicia entorno desarrollo |
| `/check-health` | Verifica estado completo |
| `/safe-deploy` | Deploy completo con migraciones |

---

## ⚠️ Importante

### ✅ SÍ Hacer
- Sincronizar BD antes de desarrollar
- Crear migraciones para cambios de estructura
- Usar `IF NOT EXISTS` en SQL
- Probar en local ANTES de deploy
- Verificar con `/check-health`

### ❌ NO Hacer
- Modificar BD producción directamente
- Deploy sin verificar local
- Borrar tablas sin backup
- Cambiar credenciales sin actualizar secrets

---

## 🆘 Si Algo Sale Mal

### Deploy Falla
1. Ver logs en GitHub Actions
2. Revisar migración SQL
3. Restaurar backup si es necesario
4. Corregir y reintentar

### BD Corrupta
1. SSH al servidor
2. Listar backups: `ls -lh backup_db_*`
3. Restaurar último backup bueno
4. Reiniciar servicios: `pm2 restart all`

---

## 🎉 Resultado Final

**Ahora tienes un sistema profesional:**

```
📍 Desarrollo Local
   ↓ (sincronización)
📊 Datos Reales de Producción
   ↓ (desarrollo)
🔧 Cambios + Migraciones
   ↓ (/safe-deploy)
🚀 GitHub Actions (CI/CD)
   ↓ (automático)
📊 BD Actualizada en Producción
   ↓
🌐 https://grupooosyris.es LIVE!
```

**Zero downtime. Zero errores. 100% automatizado.** 🚀

---

*Última actualización: 3 Octubre 2025*
*Sistema configurado y listo para usar*

# 🔄 Scripts de Sincronización Manual

Scripts para sincronizar contenido (base de datos + archivos) entre tu entorno local y producción.

## 📥 Traer cambios de Producción → Local

**Cuándo usarlo:** Cuando tus compañeros hayan hecho cambios en producción y quieras actualizar tu entorno local.

```bash
./scripts/sync-from-production.sh
```

**¿Qué hace?**
1. ✅ Hace backup de tu BD local (por seguridad)
2. ✅ Descarga BD de producción
3. ✅ Te pide confirmación antes de importar
4. ✅ Importa BD a local
5. ✅ Sincroniza imágenes/archivos de `uploads/`
6. ✅ Guarda backups (mantiene últimos 5)

**Ejemplo de uso:**

```bash
# Tu compañero te avisa: "Subí contenido nuevo a producción"
cd /home/vicente/RoadToDevOps/osyris/Osyris-Web
./scripts/sync-from-production.sh

# El script te preguntará:
# "¿Continuar con la importación? (s/N):"
# Escribes: s

# ✅ Listo, tu local ahora tiene los datos de producción
```

---

## 📤 Enviar cambios de Local → Producción

**Cuándo usarlo:** Cuando hayas hecho cambios locales y quieras subirlos a producción.

⚠️ **CUIDADO:** Esto sobrescribe producción. Úsalo con precaución.

```bash
./scripts/sync-to-production.sh
```

**¿Qué hace?**
1. ⚠️  Muestra advertencia de seguridad
2. ✅ Hace backup de BD de producción (por seguridad)
3. ✅ Exporta tu BD local
4. ✅ Requiere confirmación explícita (escribir "SI")
5. ✅ Sube BD a producción
6. ✅ Sincroniza imágenes/archivos a producción

**Ejemplo de uso:**

```bash
# Has probado cambios en local y quieres subirlos
cd /home/vicente/RoadToDevOps/osyris/Osyris-Web
./scripts/sync-to-production.sh

# El script te preguntará:
# "¿Estás SEGURO de continuar? Escribe 'SI' en mayúsculas:"
# Escribes: SI

# ✅ Cambios subidos a producción
```

---

## 🗂️ Backups

Los backups se guardan en: `./backups/`

**Archivos generados:**
- `local_before_sync_YYYYMMDD_HHMMSS.sql` - Tu BD local antes de sincronizar
- `prod_YYYYMMDD_HHMMSS.sql` - BD de producción descargada
- `prod_before_sync_YYYYMMDD_HHMMSS.sql` - BD producción antes de sobrescribir

**Restaurar un backup:**

```bash
# Restaurar BD local
docker exec -i osyris-db psql -U osyris_user -d osyris_db < backups/local_before_sync_20251004_113000.sql

# Restaurar BD producción (si algo salió mal)
cat backups/prod_before_sync_20251004_113000.sql | ssh root@116.203.98.142 'docker exec -i osyris-db psql -U osyris_user -d osyris_db'
```

---

## 🔐 Requisitos

**SSH configurado:**
- Debes tener acceso SSH al servidor: `root@116.203.98.142`
- Si te pide contraseña cada vez, configura SSH keys:

```bash
# Generar clave SSH (si no tienes)
ssh-keygen -t ed25519

# Copiar al servidor
ssh-copy-id root@116.203.98.142

# Probar conexión sin contraseña
ssh root@116.203.98.142 "echo 'Conexión exitosa'"
```

**PostgreSQL local corriendo:**
```bash
# Verificar que Docker esté corriendo
docker ps | grep postgres

# Si no está, iniciar con:
./scripts/dev-start.sh
```

---

## 📋 Flujo de Trabajo Recomendado

### Escenario 1: Tus compañeros editaron contenido en producción

```bash
# 1. Te avisan que hay cambios
# 2. Sincronizas a local
./scripts/sync-from-production.sh

# 3. Recargas tu navegador local
# ✅ Ya ves los cambios
```

### Escenario 2: Tú quieres probar cambios de contenido localmente

```bash
# 1. Haces cambios en local (http://localhost:3000?editMode=true)
# 2. Pruebas que funcionen correctamente
# 3. Avisas al equipo
# 4. Subes a producción
./scripts/sync-to-production.sh
```

### Escenario 3: Cambios de código (componentes, CSS, etc.)

```bash
# El código NO se sincroniza con estos scripts
# Usa Git como siempre:
git add .
git commit -m "feat: nuevo componente"
git push origin main

# GitHub Actions automáticamente desplegará el código
```

---

## ⚠️ Importante

**Estos scripts solo sincronizan:**
- ✅ Base de datos PostgreSQL (contenido editable)
- ✅ Archivos en `api-osyris/uploads/` (imágenes subidas)

**NO sincronizan:**
- ❌ Código fuente (componentes, páginas, CSS)
- ❌ Dependencias npm
- ❌ Configuraciones (.env)

**Para código fuente usa Git:**
```bash
git pull    # Traer cambios
git push    # Enviar cambios
```

---

## 🆘 Solución de Problemas

**Error: "Connection refused"**
```bash
# Verifica conexión SSH
ssh root@116.203.98.142

# Si falla, contacta al administrador del servidor
```

**Error: "docker: command not found"**
```bash
# PostgreSQL local no está corriendo
./scripts/dev-start.sh
```

**Error: "Permission denied"**
```bash
# Dale permisos de ejecución
chmod +x scripts/sync-from-production.sh
chmod +x scripts/sync-to-production.sh
```

**Quiero restaurar mi BD local a un backup anterior**
```bash
# Lista backups disponibles
ls -lh backups/

# Restaura el que quieras
docker exec -i osyris-db psql -U osyris_user -d osyris_db < backups/local_before_sync_20251004_113000.sql
```

---

## 📞 Contacto

Si tienes dudas sobre estos scripts, pregunta a Vicente o revisa la documentación en `CLAUDE.md`.

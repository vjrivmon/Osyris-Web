# 🔄 Sistema de Backups Automáticos - Osyris

## 📋 Descripción

Sistema completo de backups que **reemplaza el servicio de pago de Hetzner**, ahorrándote **€3-5/mes**.

### Características:
- ✅ **Backups diarios automáticos** de BD y archivos
- ✅ **Rotación inteligente** (últimos 7 días locales)
- ✅ **Backups offsite** en GitHub (30 días)
- ✅ **Cifrado GPG** opcional para seguridad
- ✅ **Restauración con 1 comando**
- ✅ **Verificación de integridad** automática
- ✅ **100% gratuito** (usa GitHub gratis)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────┐
│           SERVIDOR HETZNER                      │
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │  PostgreSQL  │      │   Uploads/   │       │
│  │   Database   │      │    .env      │       │
│  └──────┬───────┘      └──────┬───────┘       │
│         │                     │                │
│         ├─────────────────────┤                │
│         ↓                     ↓                │
│  ┌────────────────────────────────────┐       │
│  │    Backup Scripts (Cronjobs)       │       │
│  │  - backup-database.sh (2 AM)       │       │
│  │  - backup-files.sh (3 AM)          │       │
│  │  - backup-to-github.sh (4 AM)      │       │
│  └────────────────────────────────────┘       │
│         │                     │                │
│         ↓                     ↓                │
│  ┌─────────────────┐   ┌─────────────────┐   │
│  │  Local Backups  │   │  Local Backups  │   │
│  │   /var/backups/ │   │   /var/backups/ │   │
│  │    database/    │   │     files/      │   │
│  │  (últimos 7)    │   │  (últimos 7)    │   │
│  └─────────────────┘   └─────────────────┘   │
│         │                                      │
│         └──────────────┬─────────────────────┘
│                        ↓
│              ┌──────────────────┐
│              │  Cifrado GPG     │
│              │   (opcional)     │
│              └──────┬───────────┘
│                     ↓
└─────────────────────┼───────────────────────────┘
                      ↓
            ┌──────────────────┐
            │   GITHUB         │
            │  (Offsite)       │
            │  vicente/        │
            │  osyris-backups  │
            │  (últimos 30)    │
            └──────────────────┘
```

---

## 🚀 Instalación

### Paso 1: Copiar scripts al servidor

```bash
# Desde tu máquina local
cd /home/vicente/RoadToDevOps/osyris/Osyris-Web

# Copiar a servidor
scp -r scripts/backup root@116.203.98.142:/root/

# Conectar al servidor
ssh root@116.203.98.142
```

### Paso 2: Dar permisos de ejecución

```bash
chmod +x /root/backup/*.sh
```

### Paso 3: Crear directorios de backups

```bash
mkdir -p /var/backups/osyris/database
mkdir -p /var/backups/osyris/files
```

### Paso 4: (Opcional) Configurar GPG para cifrado

```bash
# Generar clave GPG
gpg --gen-key
# Seguir wizard, usar email: osyris@backup

# Exportar ID de la clave
gpg --list-keys
# Copiar el ID de la clave generada

# Añadir a variables de entorno
echo 'export OSYRIS_GPG_KEY_ID="tu-key-id-aqui"' >> ~/.bashrc
source ~/.bashrc
```

### Paso 5: Configurar GitHub

#### Opción A: Crear repositorio privado (Recomendado)

```bash
# 1. Crear repo privado en GitHub:
# https://github.com/new
# Nombre: osyris-backups
# Tipo: Private

# 2. Configurar SSH en el servidor (si no está)
ssh-keygen -t ed25519 -C "backup@osyris"
cat ~/.ssh/id_ed25519.pub
# Copiar la clave y añadirla en: https://github.com/settings/keys

# 3. Clonar el repo vacío
cd /tmp
git clone git@github.com:tu-usuario/osyris-backups.git
cd osyris-backups
touch README.md
echo "# Backups Osyris (Privado)" > README.md
git add .
git commit -m "Initial commit"
git push origin main
```

#### Opción B: Sin GitHub (solo backups locales)

Si no quieres usar GitHub, **comenta** el cronjob de `backup-to-github.sh`.

### Paso 6: Configurar Cronjobs

```bash
# Editar crontab
crontab -e

# Añadir estas líneas:
# Backup de base de datos a las 2 AM
0 2 * * * /root/backup/backup-database.sh >> /var/log/osyris-backups.log 2>&1

# Backup de archivos a las 3 AM
0 3 * * * /root/backup/backup-files.sh >> /var/log/osyris-backups.log 2>&1

# Backup offsite (GitHub) a las 4 AM (opcional)
0 4 * * * /root/backup/backup-to-github.sh >> /var/log/osyris-backups.log 2>&1
```

### Paso 7: Probar manualmente

```bash
# Probar backup de BD
/root/backup/backup-database.sh

# Probar backup de archivos
/root/backup/backup-files.sh

# Probar backup a GitHub (si configurado)
/root/backup/backup-to-github.sh
```

---

## 📖 Uso

### Ver backups disponibles

```bash
# Backups de base de datos
ls -lh /var/backups/osyris/database/

# Backups de archivos
ls -lh /var/backups/osyris/files/

# Logs
tail -f /var/log/osyris-backups.log
```

### Restaurar backups

#### Restaurar última base de datos

```bash
/root/backup/restore-backup.sh database
```

#### Restaurar últimos archivos

```bash
/root/backup/restore-backup.sh files
```

#### Restaurar todo

```bash
/root/backup/restore-backup.sh all
```

#### Restaurar backup específico

```bash
# Listar backups disponibles
ls /var/backups/osyris/database/

# Restaurar uno específico (copiar fecha del nombre)
/root/backup/restore-backup.sh database 20251003_020000
```

### Restaurar desde GitHub (disaster recovery)

```bash
# 1. Clonar repo de backups
cd /tmp
git clone git@github.com:tu-usuario/osyris-backups.git

# 2. Si están cifrados, descifrar
cd osyris-backups/database
gpg --decrypt osyris_db_20251003_020000.sql.gz.gpg > /tmp/backup.sql.gz

# 3. Restaurar
/root/backup/restore-backup.sh database /tmp/backup.sql.gz
```

---

## 🔧 Configuración Avanzada

### Cambiar retención de backups locales

Editar `backup-database.sh` y `backup-files.sh`:

```bash
RETENTION_DAYS=7  # Cambiar a los días deseados
```

### Cambiar retención en GitHub

Editar `backup-to-github.sh`:

```bash
GITHUB_RETENTION_DAYS=30  # Cambiar a los días deseados
```

### Deshabilitar cifrado

Editar `backup-to-github.sh`:

```bash
ENCRYPT_BACKUPS=false  # Cambiar a false
```

### Cambiar horarios de backup

```bash
# Editar crontab
crontab -e

# Formato: minuto hora día mes día-semana comando
# Ejemplo: backup a las 11 PM
0 23 * * * /root/backup/backup-database.sh >> /var/log/osyris-backups.log 2>&1
```

---

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
tail -f /var/log/osyris-backups.log
```

### Ver último backup

```bash
# Base de datos
ls -lht /var/backups/osyris/database/ | head -2

# Archivos
ls -lht /var/backups/osyris/files/ | head -2
```

### Verificar espacio en disco

```bash
# Espacio usado por backups
du -sh /var/backups/osyris/

# Espacio libre en disco
df -h /var/backups
```

### Verificar cronjobs están activos

```bash
# Listar cronjobs
crontab -l

# Ver logs del sistema de cron
grep CRON /var/log/syslog | tail -20
```

---

## 💰 Ahorro de Costos

### Comparación con Hetzner Backups:

| Concepto | Hetzner Backups | Este Sistema |
|----------|----------------|--------------|
| **Costo mensual** | €3-5 | **€0** |
| **Retención local** | No especificado | 7 días |
| **Retención offsite** | No | 30 días (GitHub) |
| **Cifrado** | Sí | Sí (opcional GPG) |
| **Control total** | No | **Sí** |
| **Restauración** | Desde panel | **1 comando** |
| **Costo anual** | €36-60 | **€0** |

### Ahorro en 3 años: **€108-180** 💰

---

## ⚠️ Notas Importantes

### Seguridad:
- ✅ **Repositorio PRIVADO** en GitHub (muy importante)
- ✅ **Cifrado GPG** recomendado para datos sensibles
- ✅ **SSH keys** para acceso seguro

### Espacio en disco:
- Un backup completo (BD + archivos) ocupa ~50-100MB
- 7 días locales = ~350-700MB
- GitHub Free permite repos privados ilimitados

### Backup de .env:
- Los archivos `.env` se incluyen en backups de archivos
- **Mantener repo GitHub PRIVADO** por las credenciales

---

## 🆘 Troubleshooting

### Error: "Permission denied"
```bash
chmod +x /root/backup/*.sh
```

### Error: "Docker not running"
```bash
systemctl status docker
systemctl start docker
```

### Error: "Cannot clone GitHub repo"
```bash
# Verificar SSH key
ssh -T git@github.com

# Si falla, añadir clave SSH:
cat ~/.ssh/id_ed25519.pub
# Copiar y añadir en: https://github.com/settings/keys
```

### Backup muy grande
```bash
# Verificar tamaño de uploads
du -sh /var/www/osyris/current/uploads

# Limpiar archivos antiguos si es necesario
find /var/www/osyris/current/uploads -type f -mtime +90 -delete
```

---

## 🎉 Resumen

Con este sistema tienes:
- ✅ **Backups automáticos** diarios
- ✅ **Sin costos** adicionales
- ✅ **Disaster recovery** completo
- ✅ **Control total** del proceso
- ✅ **Restauración fácil**
- ✅ **Ahorro de €36-60/año**

**¡Tu aplicación está segura!** 🛡️

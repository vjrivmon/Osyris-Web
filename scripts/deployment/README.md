# 🚀 Scripts de Despliegue - Osyris Scout

## 📋 Descripción

Scripts automatizados para la migración y despliegue de Osyris Scout a Hetzner Cloud.

## 📁 Estructura de Scripts

```
scripts/deployment/
├── 01-server-setup.sh        # Configuración inicial del servidor
├── 02-install-docker.sh       # Instalación de Docker y stack
├── 03-configure-nginx.sh      # Configuración de Nginx + SSL
├── 04-backup-system.sh        # Sistema de backup automatizado
├── 05-restore-backup.sh       # Restauración de backups
├── 06-setup-cron.sh           # Configuración de backups automáticos
└── README.md                  # Este archivo
```

## 🔄 Orden de Ejecución

### 1️⃣ Configuración Inicial del Servidor (Como root)

```bash
# En el servidor Hetzner, como root:
bash <(curl -fsSL https://raw.githubusercontent.com/TU_USUARIO/Osyris-Web/main/scripts/deployment/01-server-setup.sh)

# O subir y ejecutar manualmente:
scp -i ~/.ssh/osyris_server scripts/deployment/01-server-setup.sh root@TU_IP:~/
ssh -i ~/.ssh/osyris_server root@TU_IP
bash 01-server-setup.sh
```

**Resultado:**
- ✅ Usuario `osyris` creado
- ✅ SSH asegurado
- ✅ Firewall configurado
- ✅ Fail2Ban activo

**⚠️ Importante:** Después de este script, cerrar sesión y reconectar como `osyris`.

---

### 2️⃣ Instalación de Docker (Como osyris)

```bash
# Conectar como usuario osyris:
ssh -i ~/.ssh/osyris_server osyris@TU_IP

# Copiar y ejecutar script:
cd ~/osyris-production
bash scripts/deployment/02-install-docker.sh

# Cerrar sesión y volver a conectar (para aplicar permisos de grupo docker)
exit
ssh -i ~/.ssh/osyris_server osyris@TU_IP

# Verificar instalación:
docker run hello-world
```

**Resultado:**
- ✅ Docker instalado
- ✅ Docker Compose instalado
- ✅ Nginx instalado
- ✅ Certbot instalado

---

### 3️⃣ Configuración de Nginx + SSL (Como osyris)

```bash
# Ejecutar script:
cd ~/osyris-production
bash scripts/deployment/03-configure-nginx.sh

# Introducir tu dominio cuando se solicite
# Ejemplo: grupooosyris.es

# Después de configurar DNS en Cloudflare, obtener SSL:
~/configure-ssl.sh
```

**Resultado:**
- ✅ Nginx configurado como reverse proxy
- ✅ SSL/TLS configurado con Let's Encrypt
- ✅ Redirección HTTP → HTTPS

---

### 4️⃣ Configurar Variables de Entorno

```bash
cd ~/osyris-production

# Copiar template de variables de entorno
cp .env.production.example .env.production

# Editar y configurar valores
nano .env.production

# Generar JWT_SECRET seguro:
openssl rand -base64 64

# Generar contraseña de base de datos segura:
openssl rand -base64 32
```

**Variables críticas a configurar:**
- `DOMAIN` - Tu dominio
- `DB_PASSWORD` - Contraseña de PostgreSQL
- `JWT_SECRET` - Clave secreta para JWT
- `SMTP_*` - Configuración de email (opcional)

---

### 5️⃣ Desplegar Aplicación

```bash
cd ~/osyris-production

# Crear directorio para volumen de PostgreSQL
mkdir -p volumes/postgres

# Levantar servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Verificar que todo está corriendo
docker-compose -f docker-compose.prod.yml ps
```

**Verificar funcionamiento:**
```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000

# Desde internet
curl https://tu-dominio.com
```

---

### 6️⃣ Configurar Backups Automáticos (Como osyris)

```bash
cd ~/osyris-production
bash scripts/deployment/06-setup-cron.sh

# Seleccionar frecuencia de backups
# Recomendado: Opción 1 (Diario a las 03:00 AM)

# Verificar configuración
crontab -l

# Monitorear backups
~/monitor-backups.sh
```

**Resultado:**
- ✅ Backups automáticos configurados
- ✅ Retención de 30 días (configurable)
- ✅ Logs de backups
- ✅ Script de monitoreo

---

## 🛠️ Comandos Útiles

### Backup Manual
```bash
~/osyris-production/scripts/deployment/04-backup-system.sh
```

### Restaurar Backup
```bash
~/osyris-production/scripts/deployment/05-restore-backup.sh
```

### Ver Estado del Servidor
```bash
~/server-info.sh
```

### Ver Estado de Docker
```bash
~/verify-docker.sh
```

### Monitorear Backups
```bash
~/monitor-backups.sh
```

### Ver Logs
```bash
# Logs de aplicación
cd ~/osyris-production
docker-compose -f docker-compose.prod.yml logs -f

# Logs de Nginx
sudo tail -f /var/log/nginx/osyris_error.log
```

### Actualizar Aplicación
```bash
cd ~/osyris-production

# Backup antes de actualizar
bash scripts/deployment/04-backup-system.sh

# Pull de cambios
git pull origin main

# Reconstruir y desplegar
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔒 Permisos de Scripts

Todos los scripts deben tener permisos de ejecución:

```bash
chmod +x scripts/deployment/*.sh
```

---

## 📝 Notas Importantes

### ⚠️ Antes de Ejecutar Scripts

1. **Leer la documentación completa:** `MIGRATION_TO_HETZNER.md`
2. **Hacer backup de datos actuales** de Supabase
3. **Tener dominio registrado** y acceso a DNS
4. **Configurar Cloudflare** antes de SSL
5. **Guardar credenciales de forma segura**

### 🔐 Seguridad

- **NUNCA** subir `.env.production` a Git
- **SIEMPRE** usar contraseñas seguras generadas aleatoriamente
- **CAMBIAR** contraseñas por defecto inmediatamente
- **GUARDAR** credenciales en gestor de contraseñas (1Password, Bitwarden)

### 📊 Monitoreo

- Revisar logs regularmente
- Verificar backups funcionan correctamente
- Monitorear uso de recursos
- Ver documentación de mantenimiento: `PRODUCTION_MAINTENANCE.md`

---

## 🆘 Troubleshooting

### Script no se ejecuta
```bash
# Verificar permisos
ls -l scripts/deployment/*.sh

# Dar permisos de ejecución
chmod +x scripts/deployment/*.sh
```

### Error de conexión SSH
```bash
# Verificar que estás usando la clave correcta
ssh -i ~/.ssh/osyris_server osyris@TU_IP -v

# Verificar permisos de la clave
chmod 600 ~/.ssh/osyris_server
```

### Docker no funciona sin sudo
```bash
# Verificar grupo docker
groups

# Si no aparece 'docker', cerrar sesión y volver a conectar
exit
ssh -i ~/.ssh/osyris_server osyris@TU_IP
```

### Nginx no arranca
```bash
# Verificar sintaxis
sudo nginx -t

# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Verificar puertos
sudo netstat -tlnp | grep -E ':(80|443)'
```

---

## 📞 Soporte

Para más información, consulta:
- **Guía Completa:** `MIGRATION_TO_HETZNER.md`
- **Mantenimiento:** `PRODUCTION_MAINTENANCE.md`
- **Documentación Proyecto:** `CLAUDE.md`

---

*Última actualización: 30 Septiembre 2025*
*Versión: 1.0*
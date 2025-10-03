# 🛠️ Guía de Mantenimiento en Producción - Osyris Scout

## 📋 Índice

1. [Comandos Esenciales](#comandos-esenciales)
2. [Monitoreo del Sistema](#monitoreo-del-sistema)
3. [Gestión de Logs](#gestión-de-logs)
4. [Actualizaciones](#actualizaciones)
5. [Backups](#backups)
6. [Troubleshooting](#troubleshooting)
7. [Optimización](#optimización)
8. [Seguridad](#seguridad)

---

## Comandos Esenciales

### 🐳 Docker

```bash
# Ver servicios activos
docker-compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f db

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Reiniciar un servicio específico
docker-compose -f docker-compose.prod.yml restart backend

# Detener servicios
docker-compose -f docker-compose.prod.yml down

# Levantar servicios
docker-compose -f docker-compose.prod.yml up -d

# Reconstruir y levantar (después de cambios)
docker-compose -f docker-compose.prod.yml up -d --build

# Ver uso de recursos
docker stats

# Limpiar recursos no usados
docker system prune -a
```

### 🌐 Nginx

```bash
# Verificar sintaxis de configuración
sudo nginx -t

# Recargar configuración (sin downtime)
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver estado
sudo systemctl status nginx

# Ver logs de error
sudo tail -f /var/log/nginx/osyris_error.log

# Ver logs de acceso
sudo tail -f /var/log/nginx/osyris_access.log

# Ver logs con filtro
sudo tail -f /var/log/nginx/osyris_error.log | grep -i error
```

### 💾 Base de Datos

```bash
# Acceder a PostgreSQL
docker exec -it osyris-db psql -U osyris_user osyris_db

# Backup manual de base de datos
docker exec osyris-db pg_dump -U osyris_user osyris_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Restaurar base de datos
gunzip < backup_20250930.sql.gz | docker exec -i osyris-db psql -U osyris_user osyris_db

# Ver tamaño de la base de datos
docker exec osyris-db psql -U osyris_user osyris_db -c "SELECT pg_size_pretty(pg_database_size('osyris_db'));"

# Ver tablas y tamaños
docker exec osyris-db psql -U osyris_user osyris_db -c "SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::text)) FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(tablename::text) DESC;"
```

---

## Monitoreo del Sistema

### 📊 Scripts de Monitoreo

```bash
# Información general del servidor
~/server-info.sh

# Estado de Docker
~/verify-docker.sh

# Estado de backups
~/monitor-backups.sh
```

### 💻 Recursos del Sistema

```bash
# Uso de CPU y memoria
htop

# Uso de disco
df -h
ncdu /home/osyris  # Análisis interactivo

# Procesos que más consumen
ps aux --sort=-%mem | head -10  # Por memoria
ps aux --sort=-%cpu | head -10  # Por CPU

# Puertos en uso
sudo netstat -tlnp | grep -E ':(80|443|3000|5000|5432)'

# Tráfico de red
iftop  # Requiere sudo
```

### 🔍 Health Checks

```bash
# Verificar frontend
curl -I http://localhost:3000

# Verificar backend API
curl http://localhost:5000/api/health

# Verificar desde internet (cambiar tu-dominio.com)
curl -I https://tu-dominio.com

# Ver tiempo de respuesta
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://tu-dominio.com
```

---

## Gestión de Logs

### 📝 Ubicaciones de Logs

```bash
# Logs de la aplicación
~/osyris-production/api-osyris/logs/

# Logs de Docker
docker-compose -f docker-compose.prod.yml logs

# Logs de Nginx
/var/log/nginx/osyris_access.log
/var/log/nginx/osyris_error.log

# Logs del sistema
sudo journalctl -u nginx
sudo journalctl -u docker
```

### 🔎 Búsqueda en Logs

```bash
# Errores en logs del backend
docker-compose -f docker-compose.prod.yml logs backend | grep -i error

# Errores HTTP 500 en Nginx
sudo grep " 500 " /var/log/nginx/osyris_access.log

# Últimas 100 líneas de logs
docker-compose -f docker-compose.prod.yml logs --tail=100

# Logs desde hace 1 hora
docker-compose -f docker-compose.prod.yml logs --since 1h

# Logs en tiempo real con filtro
docker-compose -f docker-compose.prod.yml logs -f | grep -i "error\|warning"
```

### 🧹 Limpieza de Logs

```bash
# Limpiar logs antiguos de Docker (automático por configuración)
# Ver docker-compose.prod.yml: logging.options.max-size y max-file

# Limpiar logs de Nginx manualmente
sudo truncate -s 0 /var/log/nginx/osyris_access.log
sudo truncate -s 0 /var/log/nginx/osyris_error.log

# Rotar logs de Nginx (configurado automáticamente en /etc/logrotate.d/nginx)
sudo logrotate -f /etc/logrotate.d/nginx
```

---

## Actualizaciones

### 🔄 Actualizar Aplicación

```bash
# 1. Hacer backup antes de actualizar
~/osyris-production/scripts/deployment/04-backup-system.sh

# 2. Pull de cambios desde Git
cd ~/osyris-production
git pull origin main

# 3. Actualizar variables de entorno si es necesario
nano .env.production

# 4. Reconstruir y desplegar
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Verificar logs
docker-compose -f docker-compose.prod.yml logs -f

# 6. Verificar que funciona
curl -I https://tu-dominio.com
```

### 📦 Actualizar Sistema Operativo

```bash
# Actualizar paquetes
sudo apt update
sudo apt upgrade -y

# Actualizar paquetes de seguridad solamente
sudo unattended-upgrade

# Reiniciar servidor (si es necesario)
sudo reboot
```

### 🐳 Actualizar Docker

```bash
# Ver versión actual
docker --version

# Actualizar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Reiniciar Docker
sudo systemctl restart docker

# Verificar servicios
docker-compose -f docker-compose.prod.yml ps
```

---

## Backups

### 💾 Backups Automáticos

```bash
# Ver configuración de cron
crontab -l

# Ver estado de backups
~/monitor-backups.sh

# Ver backups disponibles
ls -lht ~/backups/

# Ver logs de backups
tail -f ~/logs/backup_$(date +%Y%m%d).log
```

### 🔄 Backup Manual

```bash
# Ejecutar backup manualmente
~/osyris-production/scripts/deployment/04-backup-system.sh

# Backup rápido de base de datos
docker exec osyris-db pg_dump -U osyris_user osyris_db | gzip > ~/backups/db_manual_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 📥 Restaurar Backup

```bash
# Restaurar desde backup
~/osyris-production/scripts/deployment/05-restore-backup.sh

# Restaurar solo base de datos
gunzip < ~/backups/osyris_backup_YYYYMMDD_HHMMSS/database.sql.gz | docker exec -i osyris-db psql -U osyris_user osyris_db
```

### ☁️ Backup Externo (Recomendado)

```bash
# Sincronizar backups a otro servidor (configura SSH keys primero)
rsync -avz ~/backups/ usuario@servidor-backup:/ruta/backups/osyris/

# O usar rclone para cloud storage (Dropbox, Google Drive, etc.)
rclone sync ~/backups/ remote:osyris-backups/
```

---

## Troubleshooting

### 🚨 Problemas Comunes

#### Servicio no responde

```bash
# 1. Ver logs
docker-compose -f docker-compose.prod.yml logs

# 2. Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# 3. Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# 4. Si no funciona, recrear contenedores
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

#### Error 502 Bad Gateway

```bash
# Verificar que backend está corriendo
docker-compose -f docker-compose.prod.yml ps backend

# Ver logs del backend
docker-compose -f docker-compose.prod.yml logs backend

# Verificar puerto 5000
curl http://localhost:5000/api/health

# Reiniciar backend
docker-compose -f docker-compose.prod.yml restart backend

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

#### Base de datos no conecta

```bash
# Verificar que contenedor DB está corriendo
docker-compose -f docker-compose.prod.yml ps db

# Ver logs de la base de datos
docker-compose -f docker-compose.prod.yml logs db

# Verificar conectividad
docker exec osyris-db pg_isready -U osyris_user

# Reiniciar base de datos
docker-compose -f docker-compose.prod.yml restart db
```

#### Disco lleno

```bash
# Ver uso de disco
df -h

# Limpiar logs antiguos
~/osyris-production/scripts/deployment/cleanup-logs.sh  # Si existe

# Limpiar Docker
docker system prune -a

# Limpiar backups antiguos (>30 días)
find ~/backups -mtime +30 -delete

# Ver qué consume espacio
ncdu /home/osyris
```

#### Memoria llena

```bash
# Ver uso de memoria
free -h

# Ver procesos que más consumen
ps aux --sort=-%mem | head -10

# Reiniciar servicios (libera memoria)
docker-compose -f docker-compose.prod.yml restart

# En caso extremo, reiniciar servidor
sudo reboot
```

### 🔧 Comandos de Diagnóstico

```bash
# Verificar conectividad a base de datos
docker exec osyris-backend nc -zv db 5432

# Verificar DNS
dig tu-dominio.com

# Verificar certificado SSL
openssl s_client -connect tu-dominio.com:443 -servername tu-dominio.com < /dev/null | openssl x509 -noout -dates

# Ver tráfico HTTP
sudo tcpdump -i any port 80 or port 443

# Ver conexiones activas
sudo netstat -an | grep :443 | wc -l
```

---

## Optimización

### ⚡ Performance

```bash
# Ver métricas de contenedores
docker stats --no-stream

# Optimizar base de datos (ejecutar semanalmente)
docker exec osyris-db psql -U osyris_user osyris_db -c "VACUUM ANALYZE;"

# Limpiar caché de Nginx
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx

# Optimizar Docker (limpiar imágenes viejas)
docker image prune -a
```

### 📊 Monitoreo Avanzado (Opcional)

```bash
# Instalar Netdata (monitoreo en tiempo real)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Acceder a Netdata
# http://tu-ip-servidor:19999
```

---

## Seguridad

### 🔐 Mantenimiento de Seguridad

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Ver intentos de acceso SSH fallidos
sudo grep "Failed password" /var/log/auth.log | tail -20

# Ver reglas de firewall
sudo ufw status verbose

# Verificar usuarios con acceso
cat /etc/passwd | grep /bin/bash

# Ver últimos logins
last -10

# Renovar certificado SSL (automático, pero puedes forzar)
sudo certbot renew --dry-run
```

### 🛡️ Hardening Checklist

- [ ] Actualizar sistema regularmente
- [ ] Monitorear logs de acceso
- [ ] Verificar backups funcionan
- [ ] Revisar certificado SSL (Let's Encrypt renueva automáticamente)
- [ ] Cambiar contraseñas periódicamente
- [ ] Monitorear uso de recursos
- [ ] Verificar que fail2ban está activo: `sudo systemctl status fail2ban`
- [ ] Revisar reglas de firewall: `sudo ufw status`

---

## 📞 Contactos y Recursos

### 🆘 En Caso de Emergencia

1. **Servidor no responde:**
   - Conectar por SSH
   - Ejecutar `~/server-info.sh`
   - Ver logs: `docker-compose -f docker-compose.prod.yml logs`
   - Restaurar backup si es necesario

2. **Pérdida de datos:**
   - Detener servicios inmediatamente
   - No hacer cambios
   - Ejecutar script de restauración
   - Contactar a soporte técnico si es necesario

3. **Ataque o brecha de seguridad:**
   - Cambiar todas las contraseñas
   - Revisar logs de acceso
   - Actualizar sistema
   - Restaurar desde backup limpio

### 📚 Documentación Adicional

- **Guía de Migración:** `MIGRATION_TO_HETZNER.md`
- **Documentación de Proyecto:** `CLAUDE.md`
- **Design System:** `DESIGN_SYSTEM.md`
- **Docker Compose:** `docker-compose.prod.yml`

### 🔗 Enlaces Útiles

- **Hetzner Cloud Console:** https://console.hetzner.cloud
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Certbot Docs:** https://certbot.eff.org/docs/
- **Docker Docs:** https://docs.docker.com/
- **Nginx Docs:** https://nginx.org/en/docs/

---

## 📝 Notas Finales

### ✅ Checklist Mensual

- [ ] Verificar backups automáticos
- [ ] Actualizar sistema operativo
- [ ] Revisar logs de errores
- [ ] Verificar espacio en disco
- [ ] Optimizar base de datos
- [ ] Revisar métricas de uso
- [ ] Actualizar documentación si hay cambios

### 🔄 Actualizaciones de esta Guía

Mantén este documento actualizado cuando:
- Cambies configuraciones
- Agregues nuevas funcionalidades
- Resuelvas problemas nuevos
- Actualices versiones de software

---

*Última actualización: 30 Septiembre 2025*
*Versión: 1.0*
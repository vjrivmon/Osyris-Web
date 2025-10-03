# ⚡ Guía Rápida de Despliegue - Osyris Scout

## 🎯 Resumen en 5 Pasos

Migra Osyris Scout de Vercel a Hetzner Cloud en aproximadamente 2-3 horas.

---

## 📦 Lo que Necesitas

- [ ] Cuenta Hetzner Cloud (~€70/año)
- [ ] Dominio registrado (~€12/año)
- [ ] Cuenta Cloudflare (gratis)
- [ ] SSH Key generada
- [ ] Datos de Supabase exportados (backup)
- [ ] 2-3 horas de tiempo

**Coste Total Anual: ~€82/año** (~€7/mes)

---

## 🚀 Paso a Paso

### 1. Contratar Servicios (30 minutos)

#### A. Hetzner VPS
1. Ir a https://console.hetzner.cloud
2. Crear cuenta y proyecto "Osyris Scout"
3. Crear servidor:
   - **Ubicación:** Nuremberg
   - **Imagen:** Ubuntu 24.04
   - **Tipo:** CX22 (€5.83/mes)
   - **SSH Key:** Crear nueva (ver abajo)
4. Anotar IP del servidor

**Generar SSH Key:**
```bash
ssh-keygen -t ed25519 -C "osyris-server"
cat ~/.ssh/id_ed25519.pub  # Copiar y pegar en Hetzner
```

#### B. Dominio
1. Comprar en Namecheap o DonDominio
2. **NO configurar DNS todavía**

#### C. Cloudflare
1. Crear cuenta en https://dash.cloudflare.com
2. **NO añadir dominio todavía**

---

### 2. Configurar Servidor (30 minutos)

#### A. Conectar al Servidor
```bash
ssh root@TU_IP_HETZNER
```

#### B. Ejecutar Script de Configuración
```bash
# Copiar script desde tu máquina local:
scp scripts/deployment/01-server-setup.sh root@TU_IP:~/
ssh root@TU_IP

# Ejecutar:
bash 01-server-setup.sh
```

**Resultado:** Usuario `osyris` creado, firewall configurado, SSH asegurado.

#### C. Reconectar como `osyris`
```bash
exit
ssh osyris@TU_IP
```

#### D. Instalar Docker
```bash
# Copiar script:
# (Desde tu máquina local)
scp scripts/deployment/02-install-docker.sh osyris@TU_IP:~/

# (En el servidor)
bash 02-install-docker.sh

# Cerrar y reconectar para aplicar permisos
exit
ssh osyris@TU_IP

# Verificar:
docker run hello-world
```

---

### 3. Configurar DNS y Dominio (15 minutos)

#### A. Añadir Dominio a Cloudflare
1. Cloudflare Dashboard → Add Site
2. Introducir tu dominio
3. Copiar los nameservers que te da Cloudflare

#### B. Cambiar Nameservers del Dominio
1. Ir a Namecheap/DonDominio
2. Cambiar nameservers a los de Cloudflare
3. Esperar propagación (5-30 minutos)

#### C. Configurar DNS en Cloudflare
1. Cloudflare → DNS → Records
2. Añadir registro A:
   - Type: `A`
   - Name: `@`
   - IPv4: `TU_IP_HETZNER`
   - Proxy: **OFF** (gris) por ahora
3. Añadir registro A para www:
   - Type: `A`
   - Name: `www`
   - IPv4: `TU_IP_HETZNER`
   - Proxy: **OFF** (gris)

#### D. Verificar DNS
```bash
# Esperar 5-10 minutos y verificar:
dig tu-dominio.com +short
# Debe mostrar la IP de Hetzner
```

---

### 4. Desplegar Aplicación (45 minutos)

#### A. Copiar Código al Servidor
```bash
# Desde tu máquina local:
rsync -avz -e "ssh" /home/vicente/RoadToDevOps/osyris/Osyris-Web/ osyris@TU_IP:~/osyris-production/

# O clonar desde Git:
ssh osyris@TU_IP
cd ~/osyris-production
git clone https://github.com/TU_USUARIO/Osyris-Web.git .
```

#### B. Configurar Nginx
```bash
# En el servidor:
cd ~/osyris-production
bash scripts/deployment/03-configure-nginx.sh

# Introducir tu dominio cuando se solicite
```

#### C. Obtener Certificado SSL
```bash
# Verificar que DNS está propagado:
dig tu-dominio.com +short

# Ejecutar script helper:
~/configure-ssl.sh

# Reactivar Cloudflare Proxy (poner icono naranja)
```

#### D. Configurar Variables de Entorno
```bash
cd ~/osyris-production
cp .env.production.example .env.production
nano .env.production

# Configurar MÍNIMO:
# - DOMAIN=tu-dominio.com
# - API_URL=https://tu-dominio.com
# - DB_PASSWORD=$(openssl rand -base64 32)
# - JWT_SECRET=$(openssl rand -base64 64)
```

#### E. Crear Volumen para PostgreSQL
```bash
mkdir -p ~/osyris-production/volumes/postgres
```

#### F. Levantar Servicios
```bash
cd ~/osyris-production
docker-compose -f docker-compose.prod.yml up -d

# Ver logs:
docker-compose -f docker-compose.prod.yml logs -f
```

#### G. Importar Datos de Supabase
```bash
# Copiar backup de Supabase al servidor:
scp osyris_backup.sql osyris@TU_IP:~/

# En el servidor:
cat osyris_backup.sql | docker exec -i osyris-db psql -U osyris_user osyris_db

# Copiar uploads:
scp -r ./uploads/* osyris@TU_IP:~/osyris-production/api-osyris/uploads/
```

---

### 5. Configurar Backups (15 minutos)

```bash
cd ~/osyris-production
bash scripts/deployment/06-setup-cron.sh

# Seleccionar:
# [1] Diario a las 03:00 AM (Recomendado)
# Retención: 30 días (default)
```

---

## ✅ Verificación Final

### Checklist de Funcionamiento

```bash
# 1. Verificar servicios Docker
docker-compose -f docker-compose.prod.yml ps
# Todos deben estar "Up"

# 2. Verificar backend
curl http://localhost:5000/api/health
# Debe responder OK

# 3. Verificar frontend
curl http://localhost:3000
# Debe responder HTML

# 4. Verificar desde internet
curl -I https://tu-dominio.com
# Debe responder 200 OK

# 5. Verificar SSL
curl -I https://tu-dominio.com | grep -i "HTTP/2 200"
# Debe mostrar HTTP/2

# 6. Verificar backups
~/monitor-backups.sh
# Debe mostrar backup reciente
```

### Pruebas de Funcionalidad

1. **Login:** Ir a https://tu-dominio.com/login
2. **Dashboard:** Verificar que carga correctamente
3. **Upload:** Probar subir un archivo
4. **API:** Verificar llamadas a `/api/*`

---

## 🎉 ¡Listo!

Tu aplicación está funcionando en producción.

### Próximos Pasos

1. **Configurar Cloudflare:**
   - SSL/TLS → Full (strict)
   - Speed → Auto Minify (activar)
   - Caching → Standard

2. **Monitoreo:**
   - Revisar logs diariamente la primera semana
   - Verificar backups funcionan
   - Monitorear uso de recursos

3. **Documentación:**
   - Guardar credenciales en lugar seguro
   - Documentar cambios que hagas
   - Leer `PRODUCTION_MAINTENANCE.md`

---

## 📞 Si Algo Sale Mal

### Errores Comunes

**502 Bad Gateway:**
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml restart
```

**SSL no funciona:**
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

**Base de datos no conecta:**
```bash
docker-compose -f docker-compose.prod.yml logs db
docker-compose -f docker-compose.prod.yml restart db
```

**Necesito ayuda:**
1. Leer `MIGRATION_TO_HETZNER.md` (guía completa)
2. Leer `PRODUCTION_MAINTENANCE.md` (troubleshooting)
3. Ver logs: `docker-compose -f docker-compose.prod.yml logs`

---

## 📊 Resumen de Costes

| Servicio | Coste Anual |
|----------|-------------|
| Hetzner VPS (CX22) | ~€70 |
| Dominio (.es) | ~€12 |
| Cloudflare | €0 |
| SSL (Let's Encrypt) | €0 |
| **TOTAL** | **~€82/año** |

**Comparación con Vercel:**
- Sin límites de colaboradores
- Control total del servidor
- Mejor performance
- Datos en Europa (RGPD)

---

## 🔗 Documentación Completa

- **Guía Detallada:** `MIGRATION_TO_HETZNER.md`
- **Mantenimiento:** `PRODUCTION_MAINTENANCE.md`
- **Scripts:** `scripts/deployment/README.md`

---

*¡Felicidades por tu migración exitosa!* 🎉

*Última actualización: 30 Septiembre 2025*
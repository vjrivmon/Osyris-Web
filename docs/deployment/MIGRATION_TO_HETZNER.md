# 🚀 Guía de Migración: Vercel → Hetzner Cloud

## 📋 Índice de Contenidos

1. [Preparación](#1-preparación)
2. [Contratar Servicios](#2-contratar-servicios)
3. [Configuración Inicial del Servidor](#3-configuración-inicial-del-servidor)
4. [Instalación de Docker y Dependencias](#4-instalación-de-docker-y-dependencias)
5. [Configuración de Nginx](#5-configuración-de-nginx)
6. [Despliegue de la Aplicación](#6-despliegue-de-la-aplicación)
7. [Configuración de SSL](#7-configuración-de-ssl)
8. [Configuración de Backups](#8-configuración-de-backups)
9. [Migración de Datos](#9-migración-de-datos)
10. [Puesta en Producción](#10-puesta-en-producción)
11. [Mantenimiento](#11-mantenimiento)

---

## 1. Preparación

### ✅ Checklist Pre-Migración

- [ ] Backup completo de datos de Supabase
- [ ] Exportar variables de entorno de Vercel
- [ ] Documentar configuraciones actuales
- [ ] Preparar presupuesto (~€70/año primer año)
- [ ] Tener a mano tarjeta de crédito/débito

### 💾 Backup de Datos Actuales

```bash
# Desde tu máquina local, ejecutar:
npm run backup:supabase

# O manualmente desde Supabase Dashboard:
# 1. Ir a Settings → Database
# 2. Backups → Create backup
# 3. Descargar backup SQL
```

---

## 2. Contratar Servicios

### 🌐 Paso 1: Dominio (Namecheap/DonDominio)

**Opción A: Namecheap (~€10/año)**
1. Ir a https://www.namecheap.com
2. Buscar dominio: `grupooosyris.es` o similar
3. Añadir al carrito
4. **IMPORTANTE:** Desmarcar todos los extras (WhoisGuard gratuito está bien)
5. Pagar con tarjeta

**Opción B: DonDominio (~€12/año, español)**
1. Ir a https://www.dondominio.com
2. Buscar dominio `.es`
3. Contratar (incluye privacidad gratis)

**⏱️ Tiempo:** 15 minutos
**💰 Coste:** €10-15/año

---

### ☁️ Paso 2: Cloudflare (Gratis)

1. Ir a https://dash.cloudflare.com/sign-up
2. Crear cuenta (email del grupo)
3. **NO añadir dominio todavía** (lo haremos después)
4. Verificar email

**⏱️ Tiempo:** 5 minutos
**💰 Coste:** €0

---

### 🖥️ Paso 3: Hetzner Cloud VPS

1. Ir a https://accounts.hetzner.com/signUp
2. Crear cuenta con email del grupo
3. Verificar identidad (DNI/Pasaporte)
4. Ir a https://console.hetzner.cloud
5. **Crear nuevo proyecto:**
   - Nombre: `Osyris Scout`
6. **Crear servidor:**
   - **Ubicación:** Nuremberg, Germany (más cercano a España)
   - **Imagen:** Ubuntu 24.04 LTS
   - **Tipo:** CX22 (2 vCPU, 4GB RAM, €5.83/mes) **RECOMENDADO**
   - **Volumen:** No
   - **Redes:** No
   - **SSH Key:** Crear nueva (ver abajo)
   - **Nombre:** `osyris-production`
7. **Crear SSH Key:**
   ```bash
   # En tu terminal local:
   ssh-keygen -t ed25519 -C "osyris-server-access"
   # Guardar en: ~/.ssh/osyris_server
   # Contraseña: [elige una segura]

   # Copiar clave pública:
   cat ~/.ssh/osyris_server.pub
   # Pegar contenido en Hetzner al crear servidor
   ```
8. **Crear servidor** → Esperar 1 minuto

**⏱️ Tiempo:** 20 minutos
**💰 Coste:** €5.83/mes (~€70/año)

---

## 3. Configuración Inicial del Servidor

### 🔐 Conexión Inicial

```bash
# Obtener IP del servidor desde Hetzner Dashboard
# Aparecerá como: xxx.xxx.xxx.xxx

# Conectar por primera vez:
ssh -i ~/.ssh/osyris_server root@TU_IP_SERVIDOR
```

### 🛡️ Seguridad Inicial (Script Automatizado)

Hetzner ya te proporciona un script, pero vamos a ejecutar el nuestro personalizado:

```bash
# Una vez conectado al servidor, ejecutar:
curl -fsSL https://raw.githubusercontent.com/tu-repo/osyris-setup.sh | bash
```

**O manualmente:**

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Crear usuario no-root
adduser osyris
usermod -aG sudo osyris

# Copiar SSH keys al nuevo usuario
rsync --archive --chown=osyris:osyris ~/.ssh /home/osyris

# Configurar firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Deshabilitar login root por SSH
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd

# Salir y reconectar con nuevo usuario
exit
```

### 🔄 Reconectar con Usuario Seguro

```bash
ssh -i ~/.ssh/osyris_server osyris@TU_IP_SERVIDOR
```

**⏱️ Tiempo:** 15 minutos

---

## 4. Instalación de Docker y Dependencias

### 🐳 Script Automatizado

Guardaremos un script en el servidor para ejecutarlo:

```bash
# Conectado al servidor como osyris:
nano ~/install-docker.sh
```

Pegar este contenido:

```bash
#!/bin/bash
# Script de instalación de Docker para Osyris

set -e

echo "🐳 Instalando Docker y Docker Compose..."

# Instalar dependencias
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Añadir clave GPG de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Añadir repositorio Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar docker-compose standalone
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar herramientas adicionales
sudo apt-get install -y git nginx certbot python3-certbot-nginx

echo "✅ Docker instalado correctamente"
echo "⚠️  IMPORTANTE: Cierra sesión y vuelve a conectar para aplicar permisos de grupo docker"
docker --version
docker-compose --version
```

Ejecutar:

```bash
chmod +x ~/install-docker.sh
./install-docker.sh

# IMPORTANTE: Cerrar sesión y volver a conectar
exit
ssh -i ~/.ssh/osyris_server osyris@TU_IP_SERVIDOR

# Verificar instalación
docker run hello-world
```

**⏱️ Tiempo:** 10 minutos

---

## 5. Configuración de Nginx

### 📝 Configuración Base

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/osyris
```

Pegar este contenido (ajustar dominio):

```nginx
# Configuración Nginx para Osyris Scout
# Actualizar: TU_DOMINIO.com con tu dominio real

# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name TU_DOMINIO.com www.TU_DOMINIO.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name TU_DOMINIO.com www.TU_DOMINIO.com;

    # SSL certificates (se configurarán automáticamente con certbot)
    ssl_certificate /etc/letsencrypt/live/TU_DOMINIO.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/TU_DOMINIO.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logs
    access_log /var/log/nginx/osyris_access.log;
    error_log /var/log/nginx/osyris_error.log;

    # Tamaño máximo de archivo (para uploads)
    client_max_body_size 50M;

    # Proxy al frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy al backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers (si es necesario)
        add_header 'Access-Control-Allow-Origin' 'https://TU_DOMINIO.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }

    # Servir archivos estáticos de uploads
    location /uploads {
        alias /home/osyris/osyris-production/api-osyris/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 🔗 Activar Configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/osyris /etc/nginx/sites-enabled/

# Desactivar configuración default
sudo rm /etc/nginx/sites-enabled/default

# Verificar sintaxis
sudo nginx -t

# NO reiniciar todavía (primero configuraremos SSL)
```

**⏱️ Tiempo:** 10 minutos

---

## 6. Despliegue de la Aplicación

### 📦 Preparar Directorio

```bash
# Crear estructura de directorios
mkdir -p ~/osyris-production
cd ~/osyris-production

# Clonar repositorio (o subir archivos)
git clone https://github.com/TU_USUARIO/Osyris-Web.git .

# O si prefieres subir desde local:
# Desde tu máquina local:
# rsync -avz -e "ssh -i ~/.ssh/osyris_server" \
#   /home/vicente/RoadToDevOps/osyris/Osyris-Web/ \
#   osyris@TU_IP_SERVIDOR:~/osyris-production/
```

### 🐳 Docker Compose para Producción

Ya tienes un `docker-compose.yml`, pero vamos a crear uno optimizado para producción:

```bash
cd ~/osyris-production
nano docker-compose.prod.yml
```

**⏱️ Tiempo:** 15 minutos

---

## 7. Configuración de SSL

### 🔐 Cloudflare DNS

Antes de configurar SSL, necesitamos apuntar el dominio:

1. **Ir a tu proveedor de dominio (Namecheap/DonDominio)**
2. **Cambiar nameservers a Cloudflare:**
   - Ir a Cloudflare Dashboard
   - Add Site → Introducir tu dominio
   - Cloudflare te dará 2 nameservers (ej: `bob.ns.cloudflare.com`)
   - Copiar esos nameservers
   - En Namecheap/DonDominio, cambiar nameservers a los de Cloudflare
3. **Esperar propagación DNS** (5 minutos - 24 horas, usualmente 15 min)

### 🌐 Configurar DNS en Cloudflare

Una vez añadido el dominio en Cloudflare:

1. **Ir a DNS → Records**
2. **Añadir registro A:**
   - Type: `A`
   - Name: `@`
   - IPv4: `TU_IP_HETZNER`
   - Proxy status: **🟠 Proxied** (naranja, no gris)
   - TTL: Auto
3. **Añadir registro A para www:**
   - Type: `A`
   - Name: `www`
   - IPv4: `TU_IP_HETZNER`
   - Proxy status: **🟠 Proxied**
   - TTL: Auto
4. **Guardar**

### 🔒 Obtener Certificado SSL

```bash
# Desactivar Proxy de Cloudflare temporalmente para validación
# Cloudflare Dashboard → DNS → Click en icono naranja para que quede gris

# Obtener certificado
sudo certbot --nginx -d TU_DOMINIO.com -d www.TU_DOMINIO.com

# Seguir instrucciones:
# - Email: email del grupo
# - Aceptar términos: Y
# - Compartir email: N (opcional)
# - Redirect HTTP a HTTPS: 2 (Yes)

# Reactivar Proxy de Cloudflare (volver a poner icono naranja)

# Test de renovación automática
sudo certbot renew --dry-run
```

### ✅ Reiniciar Nginx

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

**⏱️ Tiempo:** 20 minutos (+ espera DNS)

---

## 8. Configuración de Backups

Vamos a crear un script de backup automatizado:

```bash
nano ~/backup-osyris.sh
```

**⏱️ Tiempo:** 15 minutos

---

## 9. Migración de Datos

### 📤 Exportar desde Supabase

```bash
# Desde tu máquina local:
# 1. Ir a Supabase Dashboard
# 2. Settings → Database → Connection string
# 3. Copiar connection string

# Exportar base de datos
pg_dump "postgresql://user:pass@host:5432/database" > osyris_backup.sql

# Exportar archivos de Storage
# Descargar manualmente desde Supabase Dashboard → Storage
```

### 📥 Importar a Hetzner

```bash
# Copiar backup al servidor
scp -i ~/.ssh/osyris_server osyris_backup.sql osyris@TU_IP_SERVIDOR:~/

# En el servidor:
# Esperar a que Docker esté corriendo con la base de datos
docker-compose -f docker-compose.prod.yml up -d db

# Importar datos
docker exec -i osyris-db psql -U osyris_user osyris_db < ~/osyris_backup.sql

# Copiar archivos uploads
scp -i ~/.ssh/osyris_server -r ./uploads/* osyris@TU_IP_SERVIDOR:~/osyris-production/api-osyris/uploads/
```

**⏱️ Tiempo:** 30 minutos

---

## 10. Puesta en Producción

### 🚀 Levantar Servicios

```bash
cd ~/osyris-production

# Levantar todos los servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar que todo está corriendo
docker-compose -f docker-compose.prod.yml ps
```

### ✅ Verificaciones

```bash
# 1. Verificar backend
curl http://localhost:5000/api/health

# 2. Verificar frontend
curl http://localhost:3000

# 3. Verificar desde internet
curl https://TU_DOMINIO.com
```

### 🌐 Configurar Cloudflare

1. **SSL/TLS:**
   - Cloudflare Dashboard → SSL/TLS
   - Encryption mode: **Full (strict)**
2. **Speed:**
   - Auto Minify: Activar HTML, CSS, JS
   - Brotli: Activar
3. **Caching:**
   - Caching Level: Standard
4. **Firewall:**
   - Security Level: Medium
   - Bot Fight Mode: Activar

**⏱️ Tiempo:** 20 minutos

---

## 11. Mantenimiento

### 📊 Monitoreo

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver uso de recursos
docker stats

# Ver espacio en disco
df -h
```

### 🔄 Actualizar Aplicación

```bash
cd ~/osyris-production
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### 💾 Backups

```bash
# Ejecutar backup manual
~/backup-osyris.sh

# Ver backups
ls -lh ~/backups/
```

### 🔧 Comandos Útiles

```bash
# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Parar servicios
docker-compose -f docker-compose.prod.yml down

# Ver contenedores
docker ps -a

# Ver imágenes
docker images

# Limpiar Docker
docker system prune -a
```

---

## 📞 Contacto y Soporte

### 🆘 Problemas Comunes

**Problema: No puedo conectarme por SSH**
```bash
# Verificar firewall
sudo ufw status

# Verificar servicio SSH
sudo systemctl status sshd
```

**Problema: Nginx no arranca**
```bash
# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Verificar sintaxis
sudo nginx -t
```

**Problema: Docker no arranca**
```bash
# Ver logs
sudo journalctl -u docker -f

# Reiniciar Docker
sudo systemctl restart docker
```

---

## ✅ Checklist Final

- [ ] Dominio contratado y DNS configurado
- [ ] Servidor Hetzner funcionando
- [ ] Docker y Docker Compose instalados
- [ ] Nginx configurado con SSL
- [ ] Aplicación desplegada y funcionando
- [ ] Backups automatizados configurados
- [ ] Datos migrados desde Supabase
- [ ] Cloudflare configurado
- [ ] Documentación guardada

---

## 🎉 ¡Felicidades!

Has migrado exitosamente Osyris Scout a tu propia infraestructura.

**Próximos pasos:**
1. Monitorear logs durante las primeras 24h
2. Probar todas las funcionalidades
3. Configurar alertas (opcional)
4. Documentar credenciales de forma segura

**Coste total anual estimado:**
- Dominio: €12/año
- Hetzner VPS: €70/año
- Cloudflare: €0/año
- **TOTAL: ~€82/año** (~€7/mes)

---

*Última actualización: 30 Septiembre 2025*
*Versión: 1.0*
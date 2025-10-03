#!/bin/bash

################################################################################
# Script de Configuración de Nginx con SSL
# Para: Osyris Scout Management System
# Autor: Vicente Rivas Monferrer
# Descripción: Configura Nginx como reverse proxy con SSL automático
################################################################################

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
clear
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║      Osyris Scout - Configuración de Nginx+SSL      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que se ejecuta con permisos sudo
if [[ $EUID -eq 0 ]]; then
   log_error "Este script NO debe ejecutarse como root directamente"
   log_info "Ejecuta como usuario normal: ./03-configure-nginx.sh"
   exit 1
fi

# Solicitar dominio
echo ""
log_info "Configuración de Nginx para Osyris Scout"
echo ""
read -p "Introduce tu dominio (ej: grupooosyris.es): " DOMAIN

if [ -z "$DOMAIN" ]; then
    log_error "Debes proporcionar un dominio"
    exit 1
fi

log_info "Configurando Nginx para: $DOMAIN"
echo ""

# Confirmación
read -p "¿Es correcto el dominio '$DOMAIN'? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    log_warning "Configuración cancelada"
    exit 0
fi

# 1. Crear directorio web para Let's Encrypt
log_info "Creando directorio web para verificación SSL..."
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html
log_success "Directorio creado"

# 2. Crear configuración de Nginx
log_info "Creando configuración de Nginx..."
sudo tee /etc/nginx/sites-available/osyris > /dev/null <<EOF
################################################################################
# Configuración Nginx para Osyris Scout
# Dominio: $DOMAIN
# Generado: $(date)
################################################################################

# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }

    # Redirigir todo lo demás a HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS Server (se activará después de obtener certificado)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name $DOMAIN www.$DOMAIN;
#
#     # SSL certificates
#     ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
#
#     # SSL configuration
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
#     ssl_prefer_server_ciphers off;
#     ssl_session_cache shared:SSL:10m;
#     ssl_session_timeout 10m;
#     ssl_stapling on;
#     ssl_stapling_verify on;
#
#     # Logs
#     access_log /var/log/nginx/osyris_access.log;
#     error_log /var/log/nginx/osyris_error.log;
#
#     # Tamaño máximo de archivo (para uploads)
#     client_max_body_size 50M;
#     client_body_buffer_size 128k;
#
#     # Timeouts
#     proxy_connect_timeout 90s;
#     proxy_send_timeout 90s;
#     proxy_read_timeout 90s;
#
#     # Proxy al frontend (Next.js)
#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#     }
#
#     # Proxy al backend API
#     location /api {
#         proxy_pass http://127.0.0.1:5000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#
#         # CORS headers (si es necesario)
#         add_header 'Access-Control-Allow-Origin' 'https://$DOMAIN' always;
#         add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
#         add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
#
#         # Preflight requests
#         if (\$request_method = 'OPTIONS') {
#             return 204;
#         }
#     }
#
#     # Servir archivos estáticos de uploads
#     location /uploads {
#         alias /home/osyris/osyris-production/api-osyris/uploads;
#         expires 30d;
#         add_header Cache-Control "public, immutable";
#         access_log off;
#     }
#
#     # Security headers
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header Referrer-Policy "strict-origin-when-cross-origin" always;
#     add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
#
#     # Gzip compression
#     gzip on;
#     gzip_vary on;
#     gzip_proxied any;
#     gzip_comp_level 6;
#     gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
# }
EOF
log_success "Configuración de Nginx creada"

# 3. Activar configuración
log_info "Activando configuración de Nginx..."
sudo ln -sf /etc/nginx/sites-available/osyris /etc/nginx/sites-enabled/

# Desactivar configuración default
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
    log_info "Configuración default desactivada"
fi

# 4. Verificar sintaxis de Nginx
log_info "Verificando sintaxis de Nginx..."
sudo nginx -t
log_success "Sintaxis correcta"

# 5. Recargar Nginx
log_info "Recargando Nginx..."
sudo systemctl reload nginx
log_success "Nginx recargado"

# 6. Verificar estado de Nginx
log_info "Verificando estado de Nginx..."
if sudo systemctl is-active --quiet nginx; then
    log_success "Nginx está funcionando correctamente"
else
    log_error "Nginx no está funcionando. Revisa los logs:"
    sudo journalctl -u nginx -n 50 --no-pager
    exit 1
fi

# Resumen
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✅ Nginx Configurado ✅                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Siguiente paso: Configurar SSL con Let's Encrypt"
echo ""
log_warning "⚠️  ANTES DE CONTINUAR:"
echo ""
echo "  1. Verifica que el DNS está configurado correctamente:"
echo "     dig $DOMAIN +short"
echo "     (Debe mostrar la IP de este servidor)"
echo ""
echo "  2. Verifica en Cloudflare que el proxy está DESACTIVADO (gris):"
echo "     - Cloudflare Dashboard → DNS"
echo "     - Click en el icono naranja para que quede gris"
echo "     - Esto es temporal para la validación SSL"
echo ""
echo "  3. Una vez verificado, ejecuta:"
echo "     sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "  4. Después de obtener el certificado:"
echo "     - Edita /etc/nginx/sites-available/osyris"
echo "     - Descomenta el bloque HTTPS (quita los #)"
echo "     - sudo nginx -t"
echo "     - sudo systemctl reload nginx"
echo ""
echo "  5. Reactiva el proxy de Cloudflare (volver a naranja)"
echo ""
log_success "Nginx está listo para SSL!"
echo ""

# Crear script helper para SSL
cat > ~/configure-ssl.sh << 'SSLSCRIPT'
#!/bin/bash

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Osyris Scout - Configuración SSL             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

read -p "Introduce tu dominio: " DOMAIN

echo ""
echo -e "${YELLOW}[1/5]${NC} Verificando DNS..."
IP=$(dig +short $DOMAIN | head -n1)
if [ -z "$IP" ]; then
    echo "❌ No se pudo resolver el dominio. Verifica la configuración DNS."
    exit 1
fi
echo "✅ DNS resuelve a: $IP"

echo ""
echo -e "${YELLOW}[2/5]${NC} Obteniendo certificado SSL..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN

if [ $? -ne 0 ]; then
    echo "❌ Error al obtener certificado SSL"
    exit 1
fi

echo ""
echo -e "${YELLOW}[3/5]${NC} Activando configuración HTTPS..."
sudo sed -i 's/^# server {/server {/' /etc/nginx/sites-available/osyris
sudo sed -i 's/^#     /    /' /etc/nginx/sites-available/osyris
sudo sed -i 's/^# }/}/' /etc/nginx/sites-available/osyris

echo ""
echo -e "${YELLOW}[4/5]${NC} Verificando configuración..."
sudo nginx -t

echo ""
echo -e "${YELLOW}[5/5]${NC} Recargando Nginx..."
sudo systemctl reload nginx

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ SSL Configurado ✅                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo "🌐 Tu sitio ahora está disponible en: https://$DOMAIN"
echo "🔒 Certificado SSL instalado y configurado"
echo ""
echo "⚠️  No olvides:"
echo "  1. Reactivar el proxy de Cloudflare (icono naranja)"
echo "  2. En Cloudflare → SSL/TLS → Encryption mode → Full (strict)"
echo ""
SSLSCRIPT

chmod +x ~/configure-ssl.sh
log_info "Script helper creado: ~/configure-ssl.sh"
echo ""
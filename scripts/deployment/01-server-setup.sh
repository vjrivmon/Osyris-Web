#!/bin/bash

################################################################################
# Script de Configuración Inicial del Servidor Hetzner
# Para: Osyris Scout Management System
# Autor: Vicente Rivas Monferrer
# Descripción: Configura seguridad básica, firewall, y usuario no-root
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
echo "║  Osyris Scout - Configuración Inicial del Servidor  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como root"
   exit 1
fi

# Verificar si ya existe el usuario osyris
if id "osyris" &>/dev/null; then
    log_warning "El usuario 'osyris' ya existe. Continuando..."
else
    # Configuración de variables
    log_info "Configurando variables de entorno..."
    USERNAME="osyris"
    PASSWORD=$(openssl rand -base64 32)  # Contraseña aleatoria segura
fi

# 1. Actualizar sistema
log_info "Actualizando el sistema..."
apt-get update -qq
apt-get upgrade -y -qq
log_success "Sistema actualizado"

# 2. Instalar paquetes esenciales
log_info "Instalando paquetes esenciales..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    vim \
    nano \
    ufw \
    fail2ban \
    htop \
    net-tools \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release
log_success "Paquetes instalados"

# 3. Crear usuario no-root (si no existe)
if ! id "osyris" &>/dev/null; then
    log_info "Creando usuario no-root: osyris..."
    adduser --disabled-password --gecos "" $USERNAME
    echo "$USERNAME:$PASSWORD" | chpasswd
    usermod -aG sudo $USERNAME
    log_success "Usuario 'osyris' creado"

    # Guardar contraseña temporalmente
    echo "$PASSWORD" > /root/osyris_initial_password.txt
    chmod 600 /root/osyris_initial_password.txt
    log_warning "Contraseña temporal guardada en: /root/osyris_initial_password.txt"
    log_warning "¡IMPORTANTE! Cambia esta contraseña después de la primera conexión"
fi

# 4. Configurar SSH keys para el nuevo usuario
if [ -d /root/.ssh ]; then
    log_info "Copiando SSH keys al usuario osyris..."
    mkdir -p /home/$USERNAME/.ssh
    cp /root/.ssh/authorized_keys /home/$USERNAME/.ssh/
    chown -R $USERNAME:$USERNAME /home/$USERNAME/.ssh
    chmod 700 /home/$USERNAME/.ssh
    chmod 600 /home/$USERNAME/.ssh/authorized_keys
    log_success "SSH keys configuradas"
else
    log_warning "No se encontraron SSH keys en /root/.ssh"
fi

# 5. Configurar firewall UFW
log_info "Configurando firewall UFW..."
ufw --force disable
ufw --force reset

# Reglas básicas
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH
ufw allow OpenSSH

# Permitir HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Activar firewall
ufw --force enable
log_success "Firewall configurado y activado"
ufw status verbose

# 6. Configurar Fail2Ban
log_info "Configurando Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
log_success "Fail2Ban configurado"

# 7. Configurar SSH seguro
log_info "Configurando SSH seguro..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Configuraciones de seguridad SSH
cat > /etc/ssh/sshd_config.d/99-osyris-security.conf << 'EOF'
# Configuración de seguridad SSH para Osyris

# Deshabilitar login root
PermitRootLogin no

# Deshabilitar autenticación por contraseña (solo SSH keys)
PasswordAuthentication no
PubkeyAuthentication yes

# Deshabilitar X11 forwarding
X11Forwarding no

# Usar protocolo SSH 2 únicamente
Protocol 2

# Configuración de timeouts
ClientAliveInterval 300
ClientAliveCountMax 2

# Limitar intentos de autenticación
MaxAuthTries 3
MaxSessions 5

# Log level
LogLevel VERBOSE
EOF

# Verificar configuración SSH
sshd -t
if [ $? -eq 0 ]; then
    systemctl restart sshd
    log_success "SSH configurado de forma segura"
else
    log_error "Error en configuración SSH. Revirtiendo cambios..."
    rm /etc/ssh/sshd_config.d/99-osyris-security.conf
    exit 1
fi

# 8. Configurar timezone
log_info "Configurando timezone a Europe/Madrid..."
timedatectl set-timezone Europe/Madrid
log_success "Timezone configurado"

# 9. Habilitar actualizaciones de seguridad automáticas
log_info "Configurando actualizaciones automáticas de seguridad..."
apt-get install -y -qq unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
log_success "Actualizaciones automáticas habilitadas"

# 10. Crear estructura de directorios para la aplicación
log_info "Creando estructura de directorios..."
mkdir -p /home/$USERNAME/{osyris-production,backups,logs}
chown -R $USERNAME:$USERNAME /home/$USERNAME/{osyris-production,backups,logs}
log_success "Directorios creados"

# 11. Configurar límites del sistema
log_info "Configurando límites del sistema..."
cat >> /etc/security/limits.conf << 'EOF'
# Límites para Osyris
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF
log_success "Límites del sistema configurados"

# 12. Optimizar parámetros del kernel
log_info "Optimizando parámetros del kernel..."
cat >> /etc/sysctl.conf << 'EOF'
# Optimizaciones para Osyris

# Network performance
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Security
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1

# File system
fs.file-max = 2097152
EOF
sysctl -p > /dev/null
log_success "Parámetros del kernel optimizados"

# 13. Crear script de información del sistema
log_info "Creando script de información del sistema..."
cat > /home/$USERNAME/server-info.sh << 'SCRIPT'
#!/bin/bash
echo "╔══════════════════════════════════════════════════════╗"
echo "║         Osyris Scout - Información del Servidor      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "🖥️  Hostname: $(hostname)"
echo "📍 IP Pública: $(curl -s ifconfig.me)"
echo "🕒 Uptime: $(uptime -p)"
echo "💾 Uso de Disco:"
df -h / | tail -1 | awk '{print "   Total: " $2 " | Usado: " $3 " | Disponible: " $4 " | Uso: " $5}'
echo "🧠 Memoria:"
free -h | grep Mem | awk '{print "   Total: " $2 " | Usado: " $3 " | Disponible: " $7}'
echo "⚙️  CPU:"
echo "   $(nproc) cores - $(lscpu | grep "Model name" | cut -d: -f2 | xargs)"
echo ""
echo "🐳 Docker: $(command -v docker &> /dev/null && echo "Instalado" || echo "No instalado")"
echo "🔧 Docker Compose: $(command -v docker-compose &> /dev/null && echo "Instalado" || echo "No instalado")"
echo ""
echo "🔐 Estado del Firewall:"
sudo ufw status | grep -E "Status|80/tcp|443/tcp|OpenSSH"
echo ""
SCRIPT
chmod +x /home/$USERNAME/server-info.sh
chown $USERNAME:$USERNAME /home/$USERNAME/server-info.sh
log_success "Script de información creado en ~/server-info.sh"

# 14. Mensaje de bienvenida personalizado
log_info "Configurando mensaje de bienvenida..."
cat > /etc/motd << 'EOF'
╔══════════════════════════════════════════════════════╗
║       🏕️  Osyris Scout Management System 🏕️         ║
║              Servidor de Producción                  ║
╚══════════════════════════════════════════════════════╝

📝 Comandos útiles:
   ~/server-info.sh        - Ver información del servidor
   ~/osyris-production/    - Directorio de la aplicación
   ~/backups/              - Backups de la aplicación

📚 Documentación: /home/osyris/osyris-production/MIGRATION_TO_HETZNER.md

⚠️  IMPORTANTE: Este es un servidor de producción.
   Sigue las mejores prácticas de seguridad.

EOF
log_success "Mensaje de bienvenida configurado"

# 15. Limpiar paquetes innecesarios
log_info "Limpiando paquetes innecesarios..."
apt-get autoremove -y -qq
apt-get autoclean -y -qq
log_success "Limpieza completada"

# Resumen final
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✅ Configuración Completada ✅              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Resumen de configuración:"
echo "  • Usuario creado: $USERNAME"
echo "  • Firewall configurado: UFW activo"
echo "  • SSH asegurado: Solo SSH keys, root deshabilitado"
echo "  • Fail2Ban activo"
echo "  • Timezone: Europe/Madrid"
echo "  • Actualizaciones automáticas: Habilitadas"
echo ""
log_warning "⚠️  IMPORTANTE - ACCIONES REQUERIDAS:"
echo "  1. Guarda la contraseña temporal del usuario 'osyris':"
if [ -f /root/osyris_initial_password.txt ]; then
    echo "     $(cat /root/osyris_initial_password.txt)"
    echo "     (También guardada en: /root/osyris_initial_password.txt)"
fi
echo ""
echo "  2. Cierra esta sesión SSH y reconecta como usuario 'osyris':"
echo "     ssh -i ~/.ssh/osyris_server osyris@$(curl -s ifconfig.me)"
echo ""
echo "  3. Una vez conectado, cambia la contraseña:"
echo "     passwd"
echo ""
echo "  4. Ejecuta el siguiente script para instalar Docker:"
echo "     bash <(curl -fsSL https://raw.githubusercontent.com/...)"
echo "     O copia manualmente el script 02-install-docker.sh"
echo ""
log_success "¡El servidor está listo para el siguiente paso!"
echo ""
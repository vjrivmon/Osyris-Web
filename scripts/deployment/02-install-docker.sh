#!/bin/bash

################################################################################
# Script de Instalación de Docker y Docker Compose
# Para: Osyris Scout Management System
# Autor: Vicente Rivas Monferrer
# Descripción: Instala Docker, Docker Compose, Nginx y Certbot
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
echo "║    Osyris Scout - Instalación de Docker y Stack     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que NO se ejecuta como root
if [[ $EUID -eq 0 ]]; then
   log_error "Este script NO debe ejecutarse como root"
   log_info "Ejecuta como usuario 'osyris': ./02-install-docker.sh"
   exit 1
fi

# 1. Actualizar repositorios
log_info "Actualizando repositorios..."
sudo apt-get update -qq
log_success "Repositorios actualizados"

# 2. Instalar dependencias previas
log_info "Instalando dependencias previas..."
sudo apt-get install -y -qq \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
log_success "Dependencias instaladas"

# 3. Añadir clave GPG de Docker
log_info "Añadiendo clave GPG de Docker..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
log_success "Clave GPG añadida"

# 4. Añadir repositorio Docker
log_info "Añadiendo repositorio Docker..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
log_success "Repositorio añadido"

# 5. Actualizar repositorios con Docker
log_info "Actualizando repositorios con Docker..."
sudo apt-get update -qq
log_success "Repositorios actualizados"

# 6. Instalar Docker Engine
log_info "Instalando Docker Engine..."
sudo apt-get install -y -qq \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin
log_success "Docker Engine instalado"

# 7. Añadir usuario actual al grupo docker
log_info "Añadiendo usuario '$USER' al grupo docker..."
sudo usermod -aG docker $USER
log_success "Usuario añadido al grupo docker"

# 8. Instalar Docker Compose standalone
log_info "Instalando Docker Compose standalone..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
log_success "Docker Compose standalone instalado: $DOCKER_COMPOSE_VERSION"

# 9. Verificar instalación de Docker
log_info "Verificando instalación de Docker..."
docker --version
docker-compose --version
log_success "Docker verificado correctamente"

# 10. Instalar Nginx
log_info "Instalando Nginx..."
sudo apt-get install -y -qq nginx
sudo systemctl enable nginx
log_success "Nginx instalado"

# 11. Instalar Certbot para SSL
log_info "Instalando Certbot (Let's Encrypt)..."
sudo apt-get install -y -qq certbot python3-certbot-nginx
log_success "Certbot instalado"

# 12. Configurar Docker daemon
log_info "Configurando Docker daemon..."
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "dns": ["8.8.8.8", "8.8.4.4"]
}
EOF
sudo systemctl restart docker
log_success "Docker daemon configurado"

# 13. Instalar herramientas adicionales útiles
log_info "Instalando herramientas adicionales..."
sudo apt-get install -y -qq \
    jq \
    tree \
    ncdu \
    iotop \
    iftop \
    dstat
log_success "Herramientas adicionales instaladas"

# 14. Crear alias útiles
log_info "Creando alias útiles..."
cat >> ~/.bashrc << 'EOF'

# Alias para Osyris Scout
alias dc='docker-compose'
alias dcp='docker-compose -f docker-compose.prod.yml'
alias dclogs='docker-compose -f docker-compose.prod.yml logs -f'
alias dcup='docker-compose -f docker-compose.prod.yml up -d'
alias dcdown='docker-compose -f docker-compose.prod.yml down'
alias dcrestart='docker-compose -f docker-compose.prod.yml restart'
alias dcps='docker-compose -f docker-compose.prod.yml ps'
alias osyris='cd ~/osyris-production'
alias nginx-test='sudo nginx -t'
alias nginx-reload='sudo systemctl reload nginx'
alias logs-nginx='sudo tail -f /var/log/nginx/osyris_error.log'
EOF
log_success "Alias creados en ~/.bashrc"

# 15. Crear script de verificación de Docker
log_info "Creando script de verificación..."
cat > ~/verify-docker.sh << 'SCRIPT'
#!/bin/bash
echo "╔══════════════════════════════════════════════════════╗"
echo "║       Osyris Scout - Verificación de Docker         ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

echo "🐳 Versiones instaladas:"
docker --version
docker-compose --version
nginx -v 2>&1
certbot --version
echo ""

echo "🔧 Estado de servicios:"
echo -n "Docker: "
systemctl is-active docker
echo -n "Nginx: "
systemctl is-active nginx
echo ""

echo "📦 Contenedores activos:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "No hay contenedores activos"
echo ""

echo "💾 Uso de Docker:"
docker system df
echo ""

echo "🌐 Puertos en uso:"
sudo netstat -tlnp | grep -E ':(80|443|3000|5000|5432)' || echo "Ningún puerto relevante en uso"
echo ""
SCRIPT
chmod +x ~/verify-docker.sh
log_success "Script de verificación creado en ~/verify-docker.sh"

# 16. Test de Docker (sin sudo)
log_info "Realizando test de Docker..."
log_warning "NOTA: Es posible que necesites cerrar sesión y volver a entrar para usar Docker sin sudo"
if docker run --rm hello-world > /dev/null 2>&1; then
    log_success "Docker funciona correctamente"
else
    log_warning "Docker requiere reiniciar sesión para funcionar sin sudo"
fi

# Resumen final
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✅ Instalación Completada ✅               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Software instalado:"
echo "  • Docker Engine: $(docker --version | cut -d' ' -f3)"
echo "  • Docker Compose: $(docker-compose --version | cut -d' ' -f4)"
echo "  • Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "  • Certbot: $(certbot --version | cut -d' ' -f2)"
echo ""
log_info "Alias disponibles:"
echo "  • dc, dcp         - Docker Compose shortcuts"
echo "  • dcup, dcdown    - Levantar/Parar servicios"
echo "  • dclogs          - Ver logs en tiempo real"
echo "  • osyris          - Ir a directorio de la app"
echo "  • nginx-test      - Verificar sintaxis Nginx"
echo ""
log_warning "⚠️  IMPORTANTE - ACCIONES REQUERIDAS:"
echo ""
echo "  1. Cierra esta sesión SSH y vuelve a conectar:"
echo "     exit"
echo "     ssh -i ~/.ssh/osyris_server osyris@$(curl -s ifconfig.me)"
echo ""
echo "  2. Verifica que Docker funciona sin sudo:"
echo "     docker run hello-world"
echo ""
echo "  3. Ejecuta el script de verificación:"
echo "     ./verify-docker.sh"
echo ""
echo "  4. Clona el repositorio de Osyris:"
echo "     cd ~/osyris-production"
echo "     git clone https://github.com/TU_USUARIO/Osyris-Web.git ."
echo ""
echo "  5. O copia los archivos desde tu máquina local:"
echo "     (Desde tu máquina local:)"
echo "     rsync -avz -e 'ssh -i ~/.ssh/osyris_server' \\"
echo "       /home/vicente/RoadToDevOps/osyris/Osyris-Web/ \\"
echo "       osyris@$(curl -s ifconfig.me):~/osyris-production/"
echo ""
log_success "¡Docker stack instalado correctamente!"
echo ""
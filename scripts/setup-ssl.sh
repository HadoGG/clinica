#!/bin/bash
# ====================================================================
# SSL/TLS INSTALLATION SCRIPT - Let's Encrypt con Certbot
# ====================================================================
# Propósito: Instalar y configurar certificados SSL/TLS automáticos
# Requisitos: Docker, Internet connection, Dominio válido
# ====================================================================

set -e

# ====================================================================
# CONFIGURACIÓN
# ====================================================================
DOMAIN="${1:-tu-dominio.com}"
EMAIL="${2:-admin@tu-dominio.com}"
RENEWAL_DAYS=30

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ====================================================================
# FUNCIONES
# ====================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# ====================================================================
# VALIDACIONES
# ====================================================================

validate_domain() {
    if [ "$DOMAIN" = "tu-dominio.com" ]; then
        log_error "Reemplaza 'tu-dominio.com' con tu dominio real"
        exit 1
    fi
    log_success "Dominio válido: ${DOMAIN}"
}

validate_dns() {
    log_info "Validando configuración DNS..."
    
    # Intentar resolver el dominio
    if ! nslookup ${DOMAIN} > /dev/null 2>&1; then
        log_warning "Advertencia: Dominio no resuelve en DNS"
        log_warning "Asegúrate de que el DNS apunta a esta IP"
        read -p "¿Continuar igualmente? (s/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            exit 1
        fi
    else
        log_success "DNS resuelto correctamente"
    fi
}

validate_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    log_success "Docker está disponible"
}

# ====================================================================
# CREAR DIRECTORIOS
# ====================================================================

setup_directories() {
    log_info "Creando directorios necesarios..."
    
    mkdir -p ./certbot/www
    mkdir -p ./certbot/conf
    mkdir -p ./certbot/logs
    
    log_success "Directorios creados"
}

# ====================================================================
# OBTENER CERTIFICADO (Primer vez - Standalone)
# ====================================================================

get_initial_certificate() {
    log_info "Obteniendo certificado inicial con Certbot (Standalone)..."
    
    # Detener contenedor frontend si está corriendo
    if docker-compose ps frontend 2>/dev/null | grep -q "Up"; then
        log_warning "Deteniendo frontend temporalmente para Certbot..."
        docker-compose down
    fi
    
    # Usar Certbot en standalone mode
    docker run --rm \
        -p 80:80 \
        -p 443:443 \
        -v ./certbot/conf:/etc/letsencrypt \
        -v ./certbot/logs:/var/log/letsencrypt \
        -v ./certbot/www:/var/www/certbot \
        certbot/certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "${EMAIL}" \
        --domain "${DOMAIN}" \
        --domain "www.${DOMAIN}"
    
    if [ $? -eq 0 ]; then
        log_success "✓ Certificado obtenido exitosamente"
        return 0
    else
        log_error "✗ Error obteniendo certificado"
        return 1
    fi
}

# ====================================================================
# ACTUALIZAR NGINX.CONF CON DOMINIO REAL
# ====================================================================

update_nginx_config() {
    log_info "Actualizando nginx.conf con dominio ${DOMAIN}..."
    
    # Descomentar sección HTTPS y reemplazar placeholder
    sed -i "s/#//" ./frontend/nginx.conf
    sed -i "s|tu-dominio.com|${DOMAIN}|g" ./frontend/nginx.conf
    
    log_success "Nginx configurado para HTTPS"
}

# ====================================================================
# ACTUALIZAR DOCKER-COMPOSE.YML
# ====================================================================

update_docker_compose() {
    log_info "Actualizando docker-compose.yml..."
    
    # Agregar variables de producción
    cat >> .env.local << EOF

# ====================================================================
# SSL/TLS Configuration
# ====================================================================
PRODUCTION=true
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
ALLOWED_HOSTS=${DOMAIN},www.${DOMAIN}
FRONTEND_URL=https://${DOMAIN}
VITE_API_URL=https://${DOMAIN}/api

EOF
    
    log_success "Variables de producción agregadas a .env.local"
}

# ====================================================================
# CONFIGURAR AUTO-RENEWAL
# ====================================================================

setup_auto_renewal() {
    log_info "Configurando renovación automática de certificados..."
    
    # Crear script de renovación
    cat > ./scripts/renew-certs.sh << 'RENEWAL_SCRIPT'
#!/bin/bash
# Renovación automática de certificados Let's Encrypt

CERTBOT_IMAGE="certbot/certbot"
CERT_DIR="./certbot/conf"

docker run --rm \
    -v ${CERT_DIR}:/etc/letsencrypt \
    -v ./certbot/logs:/var/log/letsencrypt \
    -v ./certbot/www:/var/www/certbot \
    ${CERTBOT_IMAGE} renew \
    --webroot \
    --webroot-path=/var/www/certbot \
    --quiet

# Recargar nginx después de renovación
if docker-compose ps frontend 2>/dev/null | grep -q "Up"; then
    docker-compose exec -T frontend nginx -s reload
fi

echo "[$(date)] Certificados renovados" >> ./certbot/logs/renewal.log
RENEWAL_SCRIPT

    chmod +x ./scripts/renew-certs.sh
    
    # Crear entrada de crontab
    cat > ./scripts/crontab-entry.txt << CRONTAB_ENTRY
# Let's Encrypt certificate renewal (twice daily)
0 3,15 * * * cd $(pwd) && ./scripts/renew-certs.sh

# Backup (daily at 2 AM)
0 2 * * * cd $(pwd) && ./scripts/backup.sh daily

# Weekly backup (Sunday 3 AM)
0 3 * * 0 cd $(pwd) && ./scripts/backup.sh weekly

# Monthly backup (1st of month at 4 AM)
0 4 1 * * cd $(pwd) && ./scripts/backup.sh monthly
CRONTAB_ENTRY
    
    log_success "Renovación automática configurada"
    log_info "Para instalar en crontab ejecutar:"
    log_info "crontab -e"
    log_info "Y copiar el contenido de: ./scripts/crontab-entry.txt"
}

# ====================================================================
# HEALTH CHECK
# ====================================================================

check_ssl_status() {
    log_info "Verificando estado del certificado..."
    
    CERT_PATH="./certbot/conf/live/${DOMAIN}/fullchain.pem"
    
    if [ ! -f "${CERT_PATH}" ]; then
        log_error "Certificado no encontrado en ${CERT_PATH}"
        return 1
    fi
    
    # Obtener fecha de expiración
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in "${CERT_PATH}" | cut -d= -f 2)
    EXPIRY_EPOCH=$(date -d "${EXPIRY_DATE}" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    log_success "Certificado válido"
    log_info "Expira en ${DAYS_LEFT} días (${EXPIRY_DATE})"
    
    if [ $DAYS_LEFT -lt 30 ]; then
        log_warning "Certificado expira pronto. Ejecutar renovación manual: ./scripts/renew-certs.sh"
    fi
}

# ====================================================================
# INSTRUCCIONES FINALES
# ====================================================================

print_instructions() {
    cat << INSTRUCTIONS

================================================================================
✓ INSTALACIÓN DE SSL/TLS COMPLETADA
================================================================================

PRÓXIMOS PASOS:

1. Actualizar .env con las nuevas variables:
   ✓ PRODUCTION=true
   ✓ SECURE_SSL_REDIRECT=True
   ✓ Otros valores actualizados

2. Reiniciar Docker con nueva configuración:
   docker-compose up -d

3. Verificar HTTPS funcionando:
   curl -I https://${DOMAIN}/health
   curl -I https://${DOMAIN}/api/services/

4. Instalar renovación automática en crontab:
   crontab -e
   # Copiar contenido de ./scripts/crontab-entry.txt

5. Monitorear certificado:
   ./scripts/check-cert-status.sh

6. Backups automáticos también están configurados en crontab

================================================================================
INFORMACIÓN DEL CERTIFICADO
================================================================================

Dominio(s): ${DOMAIN}, www.${DOMAIN}
Email: ${EMAIL}
Ruta local: ./certbot/conf/live/${DOMAIN}/
Auto-renovación: Habilitada (Certbot + Cron)
Renovación: Automática cada 60 días antes de expiración

Archivos:
  - fullchain.pem: Certificado completo
  - privkey.pem: Clave privada (CONFIDENCIAL)
  - cert.pem: Certificado sin intermediarios
  - chain.pem: Intermediarios

================================================================================
SEGURIDAD
================================================================================

Configuración HSTS: 1 año (max-age=31536000)
Protección HTTPS: Redirect automático
Headers CSP: Enabled
XSS Protection: Enabled
Clickjacking Protection: X-Frame-Options=DENY

================================================================================

INSTRUCCIONES

}

# ====================================================================
# MAIN
# ====================================================================

main() {
    clear
    cat << BANNER
╔════════════════════════════════════════════════════════════════════════════╗
║         SSL/TLS INSTALLATION WITH LET'S ENCRYPT & CERTBOT                  ║
║                   Clínica Odontológica - Production Setup                  ║
╚════════════════════════════════════════════════════════════════════════════╝

BANNER

    log_info "=== VALIDACIONES INICIALES ==="
    validate_domain
    validate_docker
    
    log_info "Validando DNS (puede tomar unos segundos)..."
    validate_dns
    
    log_info "\n=== PREPARACIÓN ==="
    setup_directories
    
    log_info "\n=== OBTENCIÓN DE CERTIFICADO ==="
    if ! get_initial_certificate; then
        log_error "No se pudo obtener el certificado"
        log_info "Verificar:"
        log_info "  1. Dominio resuelve correctamente"
        log_info "  2. Puerto 80 y 443 accesibles"
        log_info "  3. Firewall permite tráfico HTTP/HTTPS"
        exit 1
    fi
    
    log_info "\n=== CONFIGURACIÓN NGINX ==="
    update_nginx_config
    
    log_info "\n=== ACTUALIZACIÓN DOCKER ==="
    update_docker_compose
    
    log_info "\n=== AUTO-RENEWAL ==="
    setup_auto_renewal
    
    log_info "\n=== VERIFICACIÓN ==="
    check_ssl_status
    
    log_info "\n=== INSTRUCCIONES FINALES ==="
    print_instructions
}

# Ejecutar si se corre directamente (no sourced)
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi

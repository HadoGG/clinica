#!/bin/bash
# ====================================================================
# SSL Certificate Status Check
# ====================================================================
# Propósito: Monitorear estado de certificados SSL/TLS
# ====================================================================

set -e

CERT_DIR="./certbot/conf/live"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

if [ ! -d "$CERT_DIR" ]; then
    log_error "No se encontraron certificados en $CERT_DIR"
    log_info "Ejecutar: ./scripts/setup-ssl.sh tu-dominio.com"
    exit 1
fi

echo ""
log_info "================================"
log_info "SSL/TLS CERTIFICATE STATUS"
log_info "================================"
echo ""

total=0
valid=0
expiring_soon=0
expired=0

for domain_dir in $CERT_DIR/*/; do
    if [ -d "$domain_dir" ]; then
        domain=$(basename "$domain_dir")
        total=$((total + 1))
        
        cert_file="${domain_dir}fullchain.pem"
        
        if [ ! -f "$cert_file" ]; then
            log_error "$domain: Certificado no encontrado"
            continue
        fi
        
        # Extraer información
        issuer=$(openssl x509 -noout -issuer -in "$cert_file" | cut -d'=' -f 2-)
        expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d'=' -f 2)
        expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null || date -jf "%b %d %T %Z %Y" "$expiry_date" +%s)
        current_epoch=$(date +%s)
        days_left=$(( ($expiry_epoch - $current_epoch) / 86400 ))
        
        # Verificar certificado
        if [ $days_left -lt 0 ]; then
            log_error "$domain: EXPIRADO (Hace $((-days_left)) días)"
            expired=$((expired + 1))
        elif [ $days_left -lt 30 ]; then
            log_warning "$domain: Expira en ${days_left} días"
            expiring_soon=$((expiring_soon + 1))
        else
            log_success "$domain: VÁLIDO (${days_left} días)"
            valid=$((valid + 1))
        fi
        
        echo -e "  Issued by: $issuer"
        echo -e "  Expiry: $expiry_date"
        echo ""
    fi
done

echo -e "${BLUE}RESUMEN${NC}"
echo "======================================="
log_success "Total certificados: $total"
log_success "Válidos: $valid"
[ $expiring_soon -gt 0 ] && log_warning "Expirando pronto: $expiring_soon" || echo -e "${GREEN}[✓]${NC} Expirando pronto: 0"
[ $expired -gt 0 ] && log_error "Expirados: $expired" || echo -e "${GREEN}[✓]${NC} Expirados: 0"

echo ""

if [ $expired -gt 0 ]; then
    log_error "ACCIÓN REQUERIDA: Certificados expirados"
    log_info "Ejecutar renovación manual: ./scripts/renew-certs.sh"
    exit 1
elif [ $expiring_soon -gt 0 ]; then
    log_warning "Algunos certificados expiran en menos de 30 días"
    log_info "La renovación automática debería ejecutarse pronto"
    log_info "Verificar: grep certbot /var/log/syslog (Linux) o log del cron"
fi

log_success "Estado de certificados verificado"

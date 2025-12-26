#!/bin/bash
# ====================================================================
# DOCKER HELPER - Comandos útiles para gestionar la aplicación
# ====================================================================

set -e

CMD="${1:-help}"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

case "$CMD" in
    start)
        log_info "Iniciando servicios..."
        docker-compose up -d
        log_success "Servicios iniciados"
        docker-compose ps
        ;;
    stop)
        log_info "Deteniendo servicios..."
        docker-compose down
        log_success "Servicios detenidos"
        ;;
    restart)
        log_info "Reiniciando servicios..."
        docker-compose restart
        log_success "Servicios reiniciados"
        ;;
    logs)
        SERVICE="${2:-backend}"
        log_info "Mostrando logs de $SERVICE (últimas 50 líneas)..."
        docker-compose logs --tail=50 "$SERVICE"
        ;;
    logs-follow)
        SERVICE="${2:-backend}"
        log_info "Siguiendo logs de $SERVICE (Ctrl+C para detener)..."
        docker-compose logs -f --tail=20 "$SERVICE"
        ;;
    shell)
        SERVICE="${2:-backend}"
        log_info "Abriendo shell en $SERVICE..."
        docker-compose exec "$SERVICE" /bin/bash || docker-compose exec "$SERVICE" /bin/sh
        ;;
    psql)
        log_info "Conectando a Django shell..."
        docker-compose exec backend python manage.py shell
        ;;
    migrate)
        log_info "Ejecutando migraciones..."
        docker-compose exec backend python manage.py migrate
        log_success "Migraciones completadas"
        ;;
    collectstatic)
        log_info "Recolectando archivos estáticos..."
        docker-compose exec backend python manage.py collectstatic --noinput
        log_success "Estáticos recolectados"
        ;;
    createsuperuser)
        log_info "Creando superusuario..."
        docker-compose exec backend python manage.py createsuperuser
        ;;
    cache-clear)
        log_info "Limpiando cache Redis..."
        docker-compose exec redis redis-cli FLUSHDB
        log_success "Cache limpiado"
        ;;
    cache-stats)
        log_info "Estadísticas de Redis..."
        docker-compose exec redis redis-cli INFO stats
        ;;
    backup)
        TYPE="${2:-daily}"
        log_info "Ejecutando backup tipo: $TYPE..."
        ./scripts/backup.sh "$TYPE"
        ;;
    restore)
        FILE="${2:?Especifica archivo de backup}"
        log_info "Restaurando desde: $FILE"
        gunzip -c "$FILE" | docker-compose exec -T backend mysql \
            -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
        log_success "Restauración completada"
        ;;
    ssl-check)
        log_info "Verificando certificados SSL..."
        ./scripts/check-cert-status.sh
        ;;
    ssl-renew)
        log_info "Renovando certificados SSL..."
        ./scripts/renew-certs.sh
        log_success "Certificados renovados"
        ;;
    health)
        log_info "Verificando salud de servicios..."
        docker-compose ps
        echo ""
        log_info "Tests de conectividad:"
        curl -s http://localhost/health && log_success "Frontend: OK" || log_error "Frontend: FALLO"
        curl -s http://localhost:8000/api/services/ > /dev/null 2>&1 && log_success "Backend: OK" || log_error "Backend: FALLO"
        docker-compose exec redis redis-cli ping > /dev/null 2>&1 && log_success "Redis: OK" || log_error "Redis: FALLO"
        ;;
    stats)
        log_info "Estadísticas de Docker..."
        docker stats --no-stream
        ;;
    clean)
        log_info "Limpiando recursos Docker..."
        docker container prune -f
        docker image prune -f
        docker volume prune -f
        log_success "Limpieza completada"
        docker system df
        ;;
    rebuild)
        log_info "Rebuildeando imágenes Docker..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        log_success "Rebuild completado"
        ;;
    version)
        echo ""
        echo "  Clínica Odontológica - Versión Producción"
        echo ""
        docker-compose exec backend python --version
        docker-compose exec backend pip show django
        docker-compose exec frontend node --version
        echo ""
        ;;
    help)
        cat << HELP_TEXT

╔════════════════════════════════════════════════════════════════╗
║            DOCKER HELPER - Clínica Odontológica               ║
║         Comandos para gestionar la aplicación                 ║
╚════════════════════════════════════════════════════════════════╝

INICIACIÓN & PARADA:
  start              Iniciar todos los servicios
  stop               Detener todos los servicios
  restart            Reiniciar todos los servicios
  rebuild            Reconstruir imágenes y reiniciar

LOGS & DEBUGGING:
  logs [service]     Ver logs (backend, frontend, redis)
  logs-follow [srv]  Seguir logs en tiempo real
  shell [service]    Abrir shell interactivo en contenedor
  psql               Abrir Django shell (Python)

BASE DE DATOS:
  migrate            Ejecutar migraciones Django
  createsuperuser    Crear usuario administrador

ESTÁTICOS & CACHE:
  collectstatic      Recolectar archivos estáticos
  cache-clear        Limpiar caché Redis completamente
  cache-stats        Ver estadísticas de Redis

BACKUPS:
  backup [type]      Ejecutar backup (daily, weekly, monthly)
  restore <archivo>  Restaurar desde archivo de backup

SSL/TLS:
  ssl-check          Verificar estado de certificados
  ssl-renew          Renovar certificados Let's Encrypt

MONITOREO:
  health             Verificar salud de todos los servicios
  stats              Ver estadísticas de uso Docker
  version            Mostrar versiones instaladas

LIMPIEZA:
  clean              Limpiar contenedores/imágenes no usados

EJEMPLOS:
  ./scripts/docker-helper.sh start
  ./scripts/docker-helper.sh logs-follow backend
  ./scripts/docker-helper.sh shell backend
  ./scripts/docker-helper.sh migrate
  ./scripts/docker-helper.sh backup weekly
  ./scripts/docker-helper.sh health
  ./scripts/docker-helper.sh cache-clear

HELP_TEXT
        ;;
    *)
        log_error "Comando desconocido: $CMD"
        echo "Ejecuta: $0 help"
        exit 1
        ;;
esac

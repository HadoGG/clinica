# CLinica - Sistema de Gestión de Clínica Odontológica

Sistema completo para la gestión de clínicas odontológicas con módulos de atención, usuarios, profesionales, servicios, liquidaciones y reportes. Construido con Django, React, PostgreSQL y Render, con pruebas de sistema certificadas y listo para producción.

Versión: 1.0.0
Estado: APROBADO PARA PRODUCCIÓN
Cobertura de Pruebas: 92%
Tasa de Éxito: 100%

## Inicio Rápido

Solo necesitas hacer click en docker-start.bat y seleccionar opción 1

El script automáticamente:
- Verifica que Docker esté instalado
- Construye las imágenes (primera vez)
- Inicia todos los servicios
- Abre el navegador automáticamente

## Acceso a la Aplicación

Frontend
URL: http://localhost:3000
Rol: Admin (acceso a todos los módulos)

API REST
URL: http://localhost:8000/api/
Autenticación: JWT Token
Header: Authorization: Bearer {token}

Admin Django
URL: http://localhost:8000/admin/
Usuario: Crear con comando (ver Configuración)

Prometheus (Métricas)
URL: http://localhost:9090

Grafana (Dashboards)
URL: http://localhost:9091
Usuario: admin
Contraseña: admin

## Servicios Incluidos

Backend
- Django 5.2 (Framework web)
- DRF 3.16 (REST API)
- Gunicorn 21.2 (Servidor WSGI)
- Puerto: 8000

Frontend
- React 18 + Vite
- Tailwind CSS + DaisyUI
- React Hook Form (validación)
- Recharts (gráficos)
- Zustand (estado global)
- Nginx (servidor web)
- Puerto: 3000

Database
- PostgreSQL en Render
- Conexión segura por SSL
- Backups automáticos
- Escalabilidad hasta 300+ usuarios

Cache y Broker
- Redis para caché distribuido
- Broker de tareas Celery
- Mejora de performance

Tareas Asincrónicas
- Celery Worker para procesamiento
- Celery Beat para tareas programadas
- Generación de reportes

Monitoreo
- Prometheus para recolección de métricas
- Grafana para visualización
- Alertas automáticas configuradas

## Comandos Útiles

### Desde docker-start.bat

```
Opción 1: Iniciar servicios
Opción 2: Detener servicios
Opción 3: Ver logs en tiempo real
Opción 4: Abrir frontend en navegador
Opción 6: Reconstruir imágenes
Opción 7: Limpieza completa + reconstruir
Opción 8: Ver estado de servicios
```

### Desde terminal

```powershell
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener servicios
docker-compose stop

# Eliminar todo
docker-compose down -v

# Crear superuser Django
docker exec -it clinica_backend python manage.py createsuperuser
```

## Estructura del Proyecto

Backend (Django)
backend/
├── manage.py                      # Gestor de Django
├── requirements.txt               # Dependencias Python
├── clinica/                       # Configuración principal
│   ├── settings.py               # Configuración Django
│   ├── urls.py                   # Rutas principales
│   ├── celery.py                 # Configuración Celery
│   └── middleware.py             # Middleware anti-caché
├── payments/                      # App principal
│   ├── models.py                 # BD (User, Professional, Attention, etc)
│   ├── views.py                  # Lógica de negocio
│   ├── serializers.py            # Serialización DRF
│   ├── permissions.py            # Control de acceso RBAC
│   └── migrations/               # Migraciones de BD

Frontend (React)
frontend/
├── src/
│   ├── main.jsx                  # Punto entrada
│   ├── App.jsx                   # Componente principal
│   ├── App.css                   # Estilos globales (tema oscuro)
│   ├── components/               # Componentes reutilizables
│   │   ├── Sidebar.jsx           # Menú lateral
│   │   ├── Navbar.jsx            # Barra superior
│   │   ├── Table.jsx             # Tabla genérica
│   │   ├── Modal.jsx             # Modal genérico
│   │   └── Alert.jsx             # Alertas
│   ├── pages/                    # Páginas principales
│   │   ├── Login.jsx             # Autenticación
│   │   ├── Dashboard.jsx         # Panel de control
│   │   ├── UserManagement.jsx    # Gestión de Usuarios
│   │   ├── Professionals.jsx     # Gestión de Profesionales
│   │   ├── Services.jsx          # Gestión de Servicios
│   │   ├── Attentions.jsx        # Gestión de Atenciones
│   │   ├── Settlements.jsx       # Liquidaciones
│   │   ├── Discounts.jsx         # Descuentos
│   │   ├── Audit.jsx             # Auditoría
│   │   └── Reports.jsx           # Reportes
│   ├── services/
│   │   └── api.js                # Cliente Axios con interceptores
│   ├── store/
│   │   └── authStore.js          # Estado global (Zustand)
│   └── utils/
│       └── helpers.js            # Utilidades

Infraestructura
├── docker-compose.yml            # Orquestación de servicios
├── docker-start.bat              # Script de inicio (Windows)
├── Dockerfile                    # Imagen multi-stage frontend
├── frontend/Dockerfile           # Dockerfile específico frontend
├── monitoring/                   # Configuración monitoreo
│   ├── prometheus.yml            # Configuración Prometheus
│   └── grafana/                  # Dashboards Grafana
├── scripts/                      # Scripts útiles
│   ├── backup.sh                 # Backup de BD
│   ├── setup-ssl.sh              # Configuración SSL
│   └── docker-helper.sh          # Helper de Docker
├── logs/                         # Logs de aplicación
├── certbot/                      # Certificados SSL
└── PRUEBAS_SISTEMA.md            # Documento de pruebas (42 tests, 100% éxito)

## Configuración

Variables de Entorno

Editar .env para cambiar:

Django
DEBUG=False
SECRET_KEY=tu_clave_secreta_aqui
ALLOWED_HOSTS=localhost,127.0.0.1,tu_dominio.com

Database (PostgreSQL en Render)
VITE_API_URL=http://localhost:8000/api

Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

Características Principales

1. Autenticación JWT
   - Tokens con expiración de 1 hora
   - Refresh tokens para renovación automática
   - Roles basados en acceso (RBAC): Admin, Professional, Staff
   
2. Gestión de Datos
   - Usuarios: Creación, edición, cambio de contraseña
   - Profesionales: Dentistas con especialidades y licencias
   - Servicios: Catálogo de servicios odontológicos
   - Atenciones: Registro de procedimientos realizados
   - Liquidaciones: Cálculo automático de pagos
   - Descuentos: Descuentos para usuarios y seguros
   - Auditoría: Registro de cambios y accesos

3. Seguridad
   - Protección contra SQL Injection (0 vulnerabilidades críticas)
   - Protección XSS (Reflejado y Almacenado)
   - CSRF tokens validados
   - Headers de seguridad (CSP, X-Frame-Options, etc)
   - Hashing bcrypt para contraseñas
   - Datos sensibles no registrados en logs

4. Performance
   - Cache con Redis
   - Índices en base de datos
   - Response time: 245-412 ms bajo carga normal
   - Soporta 100+ usuarios concurrentes
   - Validación en cliente y servidor

5. Validación
   - Todos los campos obligatorios
   - Validación de fechas (no futuras)
   - Validación de emails
   - Validación de números de teléfono
   - Mensajes de error claros al usuario

6. Reportes
   - Generación de reportes en PDF
   - Exportación a Excel
   - Gráficos con Recharts
   - Métricas de negocio

7. Tema Visual
   - Diseño oscuro profesional
   - Responsive (Escritorio, Tablet, Móvil)
   - 8+ resoluciones soportadas
   - Accesibilidad WCAG 2.1 Level AA

## Solución de Problemas

El frontend no carga
1. Verifica que http://localhost:8000/api/ responda (HTTP 200)
2. Revisa logs: docker-compose logs backend
3. Reconstruye: Opción 7 en docker-start.bat
4. Limpia caché del navegador (Ctrl+Shift+Del)

Los servicios no inician
1. Verifica que Docker esté corriendo
2. Libera los puertos: 3000, 8000, 9090, 9091
3. Limpia volúmenes: Opción 7 en docker-start.bat
4. Verifica espacio en disco

Base de datos desconectada
1. Verifica que PostgreSQL en Render esté accesible
2. Revisa credenciales en .env
3. Comprueba conexión a internet
4. Verifica firewall/VPN

Registros no aparecen después de crearlos
1. Problema: Cache del navegador
2. Solución: Ctrl+Shift+Del para limpiar caché
3. Sistema: Implementado anti-caché middleware
4. Verificado: Timestamp parameter en GET requests

Validación: Los campos no validan
1. Todos los campos son obligatorios
2. Revisa browser console (F12)
3. Mensaje de error debe aparecer rojo
4. Envía el formulario para ver validación

Seguridad: Acceso denegado 403
1. Verifica tu rol (admin, professional, staff)
2. Solo admin accede a gestión de usuarios y profesionales
3. Professional accede a servicios y atenciones
4. Revisa token JWT en Developer Tools

## Desarrollo

Para hacer cambios:

1. Edita código en backend/ o frontend/
2. Reconstruye: Opción 6 en docker-start.bat
3. Reinicia: Opción 2 (stop) luego Opción 1 (start)

Cambios en Frontend (React)
- Vite recarga automáticamente (Hot Reload)
- Edita archivos en frontend/src/
- El navegador se actualiza automáticamente

Cambios en Backend (Django)
- Edita archivos en backend/
- Ejecuta migraciones si cambias modelos
- Reinicia Gunicorn para cargar cambios

Agregar Nueva Página
1. Crea archivo en frontend/src/pages/MiPagina.jsx
2. Agrega ruta en frontend/src/App.jsx
3. Agregar en Sidebar.jsx si requiere menú
4. Implementa validación con react-hook-form

Agregar Nuevo Endpoint
1. Crea modelo en backend/payments/models.py
2. Crea serializer en backend/payments/serializers.py
3. Crea viewset en backend/payments/views.py
4. Registra en backend/payments/urls.py
5. Ejecuta migraciones

## Monitoreo y Métricas

Prometheus
- Recolecta métricas de todos los servicios
- URL: http://localhost:9090
- Scrapes cada 15 segundos
- Retiene datos 15 días

Grafana
- Visualización en dashboards
- URL: http://localhost:9091
- Usuario: admin / Contraseña: admin
- Dashboards pre-configurados incluidos

Redis
- Broker de tareas Celery
- Caché distribuido
- Monitor en CLI: redis-cli

Logs
- Backend: docker-compose logs backend
- Frontend: Ver en browser console (F12)
- Docker: docker-compose logs

## Pruebas de Sistema

Status: APROBADO PARA PRODUCCIÓN

Pruebas Ejecutadas: 42
Pruebas Pasadas: 42
Pruebas Fallidas: 0
Tasa de Éxito: 100%

Cobertura de Requisitos: 100%
Cobertura de Código: 92%

Pruebas de Carga
- 50 usuarios: 245 ms response time
- 100 usuarios: 412 ms response time
- 200 usuarios: 780 ms response time
- 0 vulnerabilidades críticas

Pruebas de Seguridad
- 15 tests ejecutados
- 15 PASADOS
- 0 críticas, 0 altas
- OWASP Top 10 verificado

Pruebas de Compatibilidad
- Chrome: 100% compatible
- Firefox: 100% compatible
- Safari: 100% compatible
- Edge: 100% compatible
- Dispositivos: Desktop, Tablet, Mobile

Ver documento completo: PRUEBAS_SISTEMA.md

## Notas Importantes

Primera ejecución tarda ~5 minutos (construcción de imágenes)
Siguientes inicios son prácticamente instantáneos
Los datos se persisten en volúmenes de Docker
Los logs están disponibles en la carpeta logs/

Anti-Caché Implementado
- Middleware en backend elimina caché
- Timestamp en GET requests desde frontend
- Garantiza datos siempre actualizados

Validación de Formularios
- Todos los campos son obligatorios
- Mensajes de error en rojo
- Validación en cliente y servidor
- Previene datos inválidos

Seguridad
- JWT tokens con refresh automático
- RBAC para control de acceso
- Headers de seguridad configurados
- Hashing bcrypt para contraseñas
- Auditoría de cambios incluida

Base de Datos
- PostgreSQL en Render
- Escalable a 300+ usuarios
- Backups automáticos configurados
- Migraciones automáticas

Para más ayuda, ejecuta docker-start.bat y selecciona las opciones disponibles.

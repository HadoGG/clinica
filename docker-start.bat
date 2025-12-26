@echo off
REM ================================================
REM CLINICA - DOCKER START (One-Click Launcher)
REM ================================================

setlocal enabledelayedexpansion

REM Change to script directory
cd /d "%~dp0"

REM Check if docker-compose.yml exists
if not exist docker-compose.yml (
    echo.
    echo ============================================
    echo ERROR: docker-compose.yml no encontrado
    echo ============================================
    echo Asegurese de ejecutar este script desde el directorio del proyecto
    echo.
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ============================================
    echo ERROR: Docker no esta instalado
    echo ============================================
    echo Descargue Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo.
    echo ============================================
    echo ERROR: Docker no esta ejecutandose
    echo ============================================
    echo Por favor inicie Docker Desktop y vuelva a intentar
    echo.
    pause
    exit /b 1
)

REM Create .env if it doesn't exist
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [OK] Archivo .env creado desde .env.example
    )
)

REM Check if images exist, if not build them
docker images | find "clinica-backend" >nul 2>&1
if errorlevel 1 (
    echo.
    echo [INFO] Primera vez? Construyendo imagenes Docker...
    echo [INFO] Esto puede tomar 3-5 minutos...
    echo.
    docker-compose build
    if errorlevel 1 (
        echo [ERROR] Error al construir imagenes
        pause
        exit /b 1
    )
)

echo.


:menu
echo.
echo ================================================
echo.
echo   CLINICA - Docker Control Panel
echo.
echo ================================================
echo.
echo   [1] Iniciar servicios (START)
echo   [2] Detener servicios (STOP)
echo   [3] Ver logs en tiempo real
echo   [4] Abrir Frontend en navegador
echo   [5] Ver estado
echo   [6] Reconstruir imagenes
echo   [7] Limpiar todo y reconstruir
echo   [8] Salir
echo.
echo ================================================
echo.
set /p choice="Seleccionar opcion (1-8): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto logs
if "%choice%"=="4" goto browser
if "%choice%"=="5" goto status
if "%choice%"=="6" goto rebuild
if "%choice%"=="7" goto clean
if "%choice%"=="8" goto end

echo Opcion invalida
goto menu

:start
echo.
echo [INFO] Iniciando servicios...
echo.
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Error al iniciar servicios
    pause
    goto menu
)
echo.
echo [OK] Servicios iniciados exitosamente!
echo.
echo ========================================================
echo.
echo   ACCESO A LA APLICACION
echo.
echo ========================================================
echo.
echo   Servicio              URL                        Usuario
echo   ================================================================
echo   Frontend              http://localhost:3000      -
echo   API                   http://localhost:8000/api/ Token required
echo   Admin Django          http://localhost:8000/admin/ crear con comando
echo   Prometheus            http://localhost:9090      -
echo   Grafana               http://localhost:9091      admin / admin
echo   docker exec clinica_grafana grafana-cli admin reset-admin-password admin
echo   si no funciona la contraseña admin/admin inserta el comando de arriba
echo.
echo ========================================================
echo.
echo [INFO] Esperando inicializacion (20 seg)...
timeout /t 20 /nobreak
echo.
docker-compose ps
echo.
goto menu

:stop
echo.
echo [INFO] Deteniendo servicios...
docker-compose stop
echo [OK] Servicios detenidos
echo.
goto menu

:logs
echo.
echo [INFO] Mostrando logs (Presiona Ctrl+C para salir)...
echo.
docker-compose logs -f
goto menu

:browser
echo.
echo [INFO] Abriendo frontend en navegador...
start http://localhost:3000
timeout /t 3 /nobreak
goto menu

:rebuild
echo.
echo [INFO] Reconstruyendo imagenes Docker...
echo [INFO] Esto puede tomar 3-5 minutos...
echo.
docker-compose build
if errorlevel 1 (
    echo [ERROR] Error al reconstruir imagenes
    pause
    goto menu
)
echo [OK] Imagenes reconstruidas
echo.
goto menu

:clean
echo.
echo [WARNING] LIMPIEZA COMPLETA
echo [WARNING] Esto eliminara:
echo [WARNING]   - Todos los contenedores
echo [WARNING]   - Todos los volumenes
echo [WARNING]   - Base de datos
echo.
set /p confirm="Continuar? (si/no): "
if /i "%confirm%"=="si" (
    echo.
    echo [INFO] Eliminando contenedores y volumenes...
    docker-compose down -v
    echo.
    echo [INFO] Reconstruyendo imagenes sin cache...
    docker-compose build --no-cache
    echo.
    echo [INFO] Iniciando servicios nuevamente...
    docker-compose up -d
    echo.
    echo [OK] Limpieza completada!
    timeout /t 20 /nobreak
    docker-compose ps
) else (
    echo [INFO] Cancelado
)
echo.
goto menu

:status
echo.
echo [INFO] Estado de servicios:
echo.
docker-compose ps
echo.
goto menu

:end
echo.
echo [INFO] Saliendo...
echo.
echo Para iniciar luego:     docker-compose up -d
echo Para ver logs:          docker-compose logs -f
echo Para detener:           docker-compose stop
echo.
pause
exit /b 0

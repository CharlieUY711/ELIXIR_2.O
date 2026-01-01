# ------------------------ SCRIPT DE DESPLIEGUE LOCAL DEL CATÁLOGO -------------------------
# Este script está diseñado para asegurar que todo el proceso de despliegue del catálogo
# funcione correctamente en el entorno local. Asegúrate de que Docker y Docker Compose
# estén instalados antes de ejecutar el script.
#
# Uso: .\scripts\deploy-catalog-local.ps1
# -------------------------------------------------------------

$ErrorActionPreference = "Stop"

# Colores para output
function Write-Step {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Info {
    param([string]$Message)
    Write-Host "  → $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

# ============================================================
# PASO 1: Verificar Instalación de Docker y Docker Compose
# ============================================================
Write-Step "PASO 1: Verificando Docker y Docker Compose"

Write-Info "Verificando Docker..."
try {
    $dockerVersion = docker --version
    Write-Success "Docker encontrado: $dockerVersion"
} catch {
    Write-Error "Docker no está instalado. Instálalo desde https://www.docker.com/get-started"
    exit 1
}

Write-Info "Verificando Docker Compose..."
try {
    $composeVersion = docker-compose --version
    Write-Success "Docker Compose encontrado: $composeVersion"
} catch {
    Write-Error "Docker Compose no está instalado. Instálalo desde https://docs.docker.com/compose/install/"
    exit 1
}

# Verificar que Docker este corriendo
Write-Info "Verificando que Docker este corriendo..."
try {
    docker ps | Out-Null
    Write-Success "Docker esta corriendo"
} catch {
    Write-Error "Docker no esta corriendo. Inicia Docker Desktop y vuelve a intentar."
    exit 1
}

# ============================================================
# PASO 2: Verificar y Configurar el Puerto en docker-compose.prod.yml
# ============================================================
Write-Step "PASO 2: Verificando configuración del puerto"

$composeFile = "infra\docker-compose.prod.yml"
if (-not (Test-Path $composeFile)) {
    Write-Error "No se encontró el archivo $composeFile"
    exit 1
}

Write-Info "Verificando puerto en docker-compose.prod.yml..."
$composeContent = Get-Content $composeFile -Raw
if ($composeContent -match "5173:80") {
    Write-Success "El puerto 5173 esta configurado correctamente"
} else {
    Write-Info "El puerto 5173 no esta configurado. Verificando configuracion actual..."
    if ($composeContent -match '"\d+:80"') {
        Write-Info "Se encontró otro puerto configurado. El puerto 5173 debería estar configurado."
    } else {
        Write-Error "No se encontró configuración de puerto válida en docker-compose.prod.yml"
        exit 1
    }
}

# Verificar si el puerto 5173 está en uso
Write-Info "Verificando si el puerto 5173 está disponible..."
$portInUse = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Info "El puerto 5173 esta en uso. Se detendran los contenedores existentes antes de continuar."
    Push-Location "infra"
    try {
        docker-compose -f docker-compose.prod.yml down
        Write-Success "Contenedores anteriores detenidos"
    } catch {
        Write-Info "No se pudieron detener contenedores anteriores (puede ser normal si no hay contenedores corriendo)"
    }
    Pop-Location
} else {
    Write-Success "El puerto 5173 esta disponible"
}

# ============================================================
# PASO 3: Construir y Levantar el Contenedor con Docker Compose
# ============================================================
Write-Step "PASO 3: Construyendo y levantando el contenedor de catálogo"

Write-Info "Construyendo y levantando el contenedor de catálogo..."
Push-Location "infra"
try {
    docker-compose -f docker-compose.prod.yml up --build -d
    Write-Success "Contenedor construido y levantado exitosamente"
} catch {
    Write-Error "Error al construir o levantar el contenedor: $_"
    Pop-Location
    exit 1
}
Pop-Location

# Esperar a que el contenedor este listo
Write-Info 'Esperando a que el contenedor este listo (10 segundos)...'
Start-Sleep -Seconds 10

# ============================================================
# PASO 4: Verificar el Estado del Contenedor
# ============================================================
Write-Step "PASO 4: Verificando el estado del contenedor"

Write-Info "Verificando el estado del contenedor..."
$containers = docker ps --filter "publish=5173" --format "{{.Names}}"
if ($containers) {
    Write-Success "Contenedor corriendo en el puerto 5173: $containers"
    docker ps --filter "publish=5173"
} else {
    Write-Error "El contenedor no esta corriendo correctamente en el puerto 5173"
    Write-Info "Verificando todos los contenedores..."
    docker ps -a
    exit 1
}

# ============================================================
# PASO 5: Acceder al Proyecto en Local
# ============================================================
Write-Step "PASO 5: Verificando acceso al proyecto en localhost:5173"

Write-Info "Accediendo al proyecto en localhost:5173..."
$maxRetries = 5
$retryCount = 0
$success = $false

while ($retryCount -lt $maxRetries -and -not $success) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Head -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "El proyecto esta accesible (HTTP $($response.StatusCode))"
            $success = $true
        } else {
            Write-Info "El proyecto respondió con código: $($response.StatusCode). Reintentando..."
            $retryCount++
            Start-Sleep -Seconds 3
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Info "Intento ${retryCount}/${maxRetries}: El proyecto aun no esta listo. Esperando 3 segundos"
            Start-Sleep -Seconds 3
        } else {
            Write-Error "El proyecto no esta accesible despues de $maxRetries intentos"
            Write-Info "Verifica que Docker este funcionando y revisa los logs del contenedor"
            exit 1
        }
    }
}

# ============================================================
# PASO 6: Verificar Logs de Contenedor (si es necesario)
# ============================================================
Write-Step "PASO 6: Verificando logs del contenedor"

Write-Info "Obteniendo logs del contenedor..."
$containerName = docker ps --filter "publish=5173" --format "{{.Names}}" | Select-Object -First 1
if ($containerName) {
    try {
        Write-Info "Últimas 20 líneas de logs del contenedor '$containerName':"
        docker logs --tail 20 $containerName
        Write-Success "Logs obtenidos correctamente"
    } catch {
        Write-Info "No se pudieron obtener los logs del contenedor: $_"
    }
} else {
    Write-Info "No se encontró el contenedor para obtener logs"
}

# ============================================================
# PASO 7: Verificación Post-Despliegue (Pruebas de Humo)
# ============================================================
Write-Step "PASO 7: Ejecutando pruebas de humo"

Write-Info "Ejecutando pruebas de humo en localhost:5173..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Success "Pruebas de humo exitosas (HTTP $($response.StatusCode))"
        Write-Info "El catalogo esta funcionando correctamente"
    } else {
        Write-Error "Error en las pruebas de humo. El proyecto respondió con código: $($response.StatusCode)"
        exit 1
    }
} catch {
    Write-Error "Error en las pruebas de humo. El proyecto no esta funcionando correctamente: $_"
    Write-Info "Verifica los logs del contenedor para más detalles"
    exit 1
}

# ============================================================
# RESUMEN FINAL
# ============================================================
Write-Step "DESPLIEGUE COMPLETADO CON ÉXITO"

Write-Host "`n✓ Docker y Docker Compose verificados" -ForegroundColor Green
Write-Host "✓ Puerto 5173 configurado y disponible" -ForegroundColor Green
Write-Host "✓ Contenedor construido y levantado" -ForegroundColor Green
Write-Host "✓ Contenedor corriendo correctamente" -ForegroundColor Green
Write-Host "✓ Proyecto accesible en localhost:5173" -ForegroundColor Green
Write-Host "✓ Pruebas de humo exitosas" -ForegroundColor Green

Write-Host "`nEl catalogo esta funcionando en: http://localhost:5173" -ForegroundColor Cyan

Write-Host "`nPara detener el contenedor, ejecuta:" -ForegroundColor Yellow
Write-Host "  docker-compose -f infra\docker-compose.prod.yml down" -ForegroundColor White

Write-Host "`nPara ver los logs del contenedor, ejecuta:" -ForegroundColor Yellow
Write-Host "  docker logs -f $containerName" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan


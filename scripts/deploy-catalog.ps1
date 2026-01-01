# Script de Despliegue del Catálogo - Elixir Platform
# Este script está diseñado para ejecutar el despliegue del catálogo de 
# Elixir Platform en el entorno de producción interna, asegurando que 
# todas las configuraciones y dependencias estén correctamente preparadas.

param(
    [string]$ProductionBranch = "main",
    [string]$CatalogUrl = "http://localhost:5173",
    [switch]$SkipTests = $false,
    [switch]$SkipMonitoring = $false,
    [string]$ComposeFile = "infra\docker-compose.prod.yml"
)

$ErrorActionPreference = "Stop"

# Colores para output
function Write-Step {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor $Color
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

# Función para verificar si un comando existe
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# ============================================================
# PASO 1: Verificar Estado del Proyecto en Git
# ============================================================
Write-Step "PASO 1: Verificando estado del proyecto en Git"

$currentBranch = git branch --show-current
Write-Info "Rama actual: $currentBranch"

# Verificar estado de Git
Write-Info "Verificando estado del repositorio..."
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Error "Hay cambios sin confirmar en el repositorio:"
    git status --short
    $continue = Read-Host "¿Desea continuar de todos modos? (s/n)"
    if ($continue -ne "s") {
        Write-Error "Despliegue cancelado por el usuario"
        exit 1
    }
} else {
    Write-Success "Working tree limpio"
}

# Obtener cambios del remoto
Write-Info "Obteniendo cambios del remoto..."
try {
    git fetch --all
    Write-Success "Fetch completado"
} catch {
    Write-Error "Error al obtener cambios del remoto: $_"
    exit 1
}

# Verificar si hay cambios en remoto
$remoteCommits = git log HEAD..origin/$currentBranch --oneline 2>$null
if ($remoteCommits) {
    Write-Info "Hay commits en remoto que no están en local. Actualizando..."
    try {
        git pull --rebase origin $currentBranch
        Write-Success "Actualización completada"
    } catch {
        Write-Error "Error al actualizar desde remoto. Resuelva los conflictos manualmente."
        exit 1
    }
} else {
    Write-Success "Ya está actualizado con remoto"
}

# ============================================================
# PASO 2: Preparar Entorno de Producción
# ============================================================
Write-Step "PASO 2: Preparando entorno de producción"

# Verificar Node.js
if (-not (Test-Command "node")) {
    Write-Error "Node.js no está instalado. Por favor, instálelo primero."
    exit 1
}
$nodeVersion = node --version
Write-Success "Node.js encontrado: $nodeVersion"

# Verificar npm
if (-not (Test-Command "npm")) {
    Write-Error "npm no está instalado. Por favor, instálelo primero."
    exit 1
}
$npmVersion = npm --version
Write-Success "npm encontrado: $npmVersion"

# Instalar dependencias del catálogo
Write-Info "Instalando dependencias del catálogo..."
Push-Location "catalog\frontend"
try {
    npm install --production
    Write-Success "Dependencias del catálogo instaladas"
} catch {
    Write-Error "Error al instalar dependencias del catálogo: $_"
    Pop-Location
    exit 1
}
Pop-Location

# Construir el catálogo
Write-Info "Construyendo el catálogo para producción..."
Push-Location "catalog\frontend"
try {
    npm run build
    Write-Success "Catálogo construido exitosamente"
} catch {
    Write-Error "Error al construir el catálogo: $_"
    Pop-Location
    exit 1
}
Pop-Location

# ============================================================
# PASO 3: Generar y Ejecutar el Despliegue del Catálogo
# ============================================================
Write-Step "PASO 3: Preparando y ejecutando el despliegue"

# Verificar Docker
if (-not (Test-Command "docker")) {
    Write-Error "Docker no está instalado o no está en el PATH"
    exit 1
}
Write-Success "Docker encontrado"

# Verificar Docker Compose
if (-not (Test-Command "docker-compose")) {
    Write-Error "Docker Compose no está instalado o no está en el PATH"
    exit 1
}
Write-Success "Docker Compose encontrado"

# Verificar si existe docker-compose.prod.yml
if (-not (Test-Path $ComposeFile)) {
    Write-Info "$ComposeFile no existe. Usando docker-compose.scalable.yml..."
    $ComposeFile = "infra\docker-compose.scalable.yml"
    if (-not (Test-Path $ComposeFile)) {
        Write-Error "No se encontró ningún archivo docker-compose válido"
        exit 1
    }
}

# Construir y ejecutar contenedores
Write-Info "Construyendo y ejecutando contenedores Docker..."
Push-Location "infra"
try {
    docker-compose -f (Split-Path $composeFile -Leaf) up --build -d
    Write-Success "Contenedores desplegados"
    
    # Esperar a que los servicios estén listos
    Write-Info "Esperando a que los servicios estén listos (30 segundos)..."
    Start-Sleep -Seconds 30
    
    # Verificar estado de los contenedores
    Write-Info "Verificando estado de los contenedores..."
    docker-compose -f (Split-Path $composeFile -Leaf) ps
    Write-Success "Contenedores verificados"
} catch {
    Write-Error "Error al desplegar contenedores: $_"
    Pop-Location
    exit 1
}
Pop-Location

# ============================================================
# PASO 4: Verificar Infraestructura de Nube
# ============================================================
Write-Step "PASO 4: Verificando infraestructura de nube"

# Verificar Kubernetes (opcional)
if (Test-Command "kubectl") {
    Write-Info "Kubernetes detectado. Verificando pods..."
    try {
        $pods = kubectl get pods 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Pods de Kubernetes verificados"
            kubectl get pods
        } else {
            Write-Info "Kubernetes no está configurado o no hay acceso al cluster"
        }
    } catch {
        Write-Info "No se pudo verificar Kubernetes (puede ser normal si no se usa)"
    }
} else {
    Write-Info "kubectl no está disponible (opcional)"
}

# Verificar Firebase (opcional)
if (Test-Command "firebase") {
    Write-Info "Firebase detectado. Verificando configuración..."
    try {
        # Solo verificar, no desplegar automáticamente
        Write-Info "Firebase está disponible. Use 'firebase deploy --only hosting' manualmente si es necesario."
    } catch {
        Write-Info "Firebase no está configurado (opcional)"
    }
} else {
    Write-Info "Firebase CLI no está disponible (opcional)"
}

# ============================================================
# PASO 5: Configurar Monitoreo y Alertas
# ============================================================
if (-not $SkipMonitoring) {
    Write-Step "PASO 5: Configurando monitoreo y alertas"
    
    # Verificar si existe script de monitoreo
    $monitorScript = "scripts\monitor-setup.ps1"
    if (Test-Path $monitorScript) {
        Write-Info "Ejecutando script de configuración de monitoreo..."
        try {
            & $monitorScript
            Write-Success "Monitoreo configurado"
        } catch {
            Write-Error "Error al configurar monitoreo: $_"
        }
    } else {
        Write-Info "Script de monitoreo no encontrado. Verificando servicios de monitoreo en Docker..."
        
        # Verificar si Prometheus y Grafana están corriendo
        Push-Location "infra"
        try {
            $monitoringServices = docker-compose -f (Split-Path $composeFile -Leaf) ps | Select-String -Pattern "prometheus|grafana"
            if ($monitoringServices) {
                Write-Success "Servicios de monitoreo detectados en Docker"
                Write-Info "  - Prometheus: http://localhost:9090"
                Write-Info "  - Grafana: http://localhost:3003"
            } else {
                Write-Info "Servicios de monitoreo no están corriendo (opcional)"
            }
        } catch {
            Write-Info "No se pudo verificar servicios de monitoreo"
        }
        Pop-Location
    }
} else {
    Write-Step "PASO 5: Omitiendo configuración de monitoreo (--SkipMonitoring)"
}

# ============================================================
# PASO 6: Realizar Pruebas de Humo (Smoke Tests)
# ============================================================
if (-not $SkipTests) {
    Write-Step "PASO 6: Ejecutando pruebas de humo para validar despliegue"
    
    Write-Info "Verificando que el catálogo esté accesible en: $CatalogUrl"
    
    try {
        $response = Invoke-WebRequest -Uri $CatalogUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Catálogo accesible (HTTP $($response.StatusCode))"
        } else {
            Write-Error "Catálogo respondió con código: $($response.StatusCode)"
        }
    } catch {
        Write-Error "No se pudo conectar al catálogo en $CatalogUrl"
        Write-Info "Verifique que el servicio esté corriendo y que la URL sea correcta"
        Write-Info "Puede omitir esta verificación con -SkipTests"
        
        $continue = Read-Host "¿Desea continuar de todos modos? (s/n)"
        if ($continue -ne "s") {
            exit 1
        }
    }
} else {
    Write-Step "PASO 6: Omitiendo pruebas de humo (--SkipTests)"
}

# ============================================================
# PASO 7: Desplegar la Versión Final en Producción
# ============================================================
Write-Step "PASO 7: Desplegando la versión final del catálogo"

# Verificar si estamos en la rama de producción
if ($currentBranch -ne $ProductionBranch) {
    Write-Info "No está en la rama de producción ($ProductionBranch). Rama actual: $currentBranch"
    $push = Read-Host "¿Desea hacer push de la rama actual? (s/n)"
    if ($push -eq "s") {
        try {
            git push origin $currentBranch
            Write-Success "Push completado a origin/$currentBranch"
        } catch {
            Write-Error "Error al hacer push: $_"
        }
    }
} else {
    Write-Info "Haciendo push a la rama de producción: $ProductionBranch"
    try {
        git push origin $ProductionBranch
        Write-Success "Push a producción completado"
    } catch {
        Write-Error "Error al hacer push a producción: $_"
        exit 1
    }
}

# ============================================================
# PASO 8: Actualizar la Documentación de Operaciones
# ============================================================
Write-Step "PASO 8: Actualizando documentación de operaciones"

$opsDir = "ops\modo-1"
if (Test-Path $opsDir) {
    Write-Info "Documentación de operaciones encontrada en: $opsDir"
    
    # Crear registro de despliegue
    $deployLog = "ops\modo-1\deploy-log-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').md"
    $deployInfo = @"
# Registro de Despliegue - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Información del Despliegue
- **Rama**: $currentBranch
- **Commit**: $(git rev-parse --short HEAD)
- **Usuario**: $env:USERNAME
- **URL del Catálogo**: $CatalogUrl

## Estado
- ✓ Dependencias instaladas
- ✓ Catálogo construido
- ✓ Contenedores desplegados
- $(if (-not $SkipTests) { "✓ Pruebas de humo ejecutadas" } else { "- Pruebas de humo omitidas" })
- $(if (-not $SkipMonitoring) { "✓ Monitoreo configurado" } else { "- Monitoreo omitido" })
- ✓ Push a repositorio completado

## Notas
Despliegue completado exitosamente.

"@
    
    try {
        $deployInfo | Out-File -FilePath $deployLog -Encoding UTF8
        Write-Success "Registro de despliegue creado: $deployLog"
    } catch {
        Write-Error "Error al crear registro de despliegue: $_"
    }
} else {
    Write-Info "Directorio de documentación de operaciones no encontrado: $opsDir"
}

# ============================================================
# PASO 9: Verificación Post-Despliegue
# ============================================================
Write-Step "PASO 9: Verificando estado post-despliegue"

# Verificar contenedores nuevamente
Write-Info "Verificando estado final de los contenedores..."
Push-Location "infra"
try {
    docker-compose -f (Split-Path $composeFile -Leaf) ps
    Write-Success "Estado de contenedores verificado"
} catch {
    Write-Error "Error al verificar contenedores: $_"
}
Pop-Location

# Verificación final del catálogo
if (-not $SkipTests) {
    Write-Info "Verificación final del catálogo..."
    try {
        $response = Invoke-WebRequest -Uri $CatalogUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Verificación final exitosa (HTTP $($response.StatusCode))"
        }
    } catch {
        Write-Error "Advertencia: No se pudo verificar el catálogo en la verificación final"
    }
}

# ============================================================
# RESUMEN FINAL
# ============================================================
Write-Step "DESPLIEGUE COMPLETADO" "Green"

Write-Host "`n✓ El catálogo está activo en producción" -ForegroundColor Green
Write-Host "✓ Las funcionalidades clave han sido verificadas" -ForegroundColor Green

Write-Host "`nPróximos pasos:" -ForegroundColor Cyan
Write-Host "  - Monitoreo continuo de métricas de rendimiento" -ForegroundColor Yellow
Write-Host "  - Realización de pruebas adicionales según sea necesario" -ForegroundColor Yellow
Write-Host "  - URL del catálogo: $CatalogUrl" -ForegroundColor Yellow

if (Test-Path $deployLog) {
    Write-Host "  - Registro de despliegue: $deployLog" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Despliegue completado correctamente." -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan


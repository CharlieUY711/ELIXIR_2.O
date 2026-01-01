# Script de verificación de estrategias de escalabilidad (PowerShell)
# Verifica que todos los componentes estén correctamente configurados

Write-Host "=== Verificación de Estrategias de Escalabilidad ===" -ForegroundColor Cyan
Write-Host ""

$Errors = 0

# Función para verificar comando
function Test-Command {
    param([string]$Command)
    
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        Write-Host "✓ $Command está instalado" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Command no está instalado" -ForegroundColor Red
        $script:Errors++
        return $false
    }
}

# Función para verificar archivo
function Test-FileExists {
    param([string]$Path)
    
    if (Test-Path $Path) {
        Write-Host "✓ $Path existe" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Path no existe" -ForegroundColor Red
        $script:Errors++
        return $false
    }
}

# Función para verificar servicio HTTP
function Test-HttpService {
    param([string]$Url, [string]$Name)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✓ $Name está respondiendo" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "⚠ $Name no está respondiendo (puede no estar desplegado)" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "1. Verificando herramientas necesarias..." -ForegroundColor Yellow
Test-Command "kubectl" | Out-Null
Test-Command "docker" | Out-Null
Test-Command "nginx" | Out-Null
Write-Host ""

Write-Host "2. Verificando archivos de configuración..." -ForegroundColor Yellow
Test-FileExists "infra/scalability/autoscaling/kubernetes-hpa.yaml"
Test-FileExists "infra/scalability/autoscaling/docker-compose.scale.yml"
Test-FileExists "infra/scalability/load-balancer/nginx.conf"
Test-FileExists "infra/scalability/cache/redis-config.conf"
Test-FileExists "core/src/cache/CacheManager.ts"
Test-FileExists "core/src/cluster/ClusterManager.ts"
Test-FileExists "infra/scalability/database/partitioning-strategy.md"
Write-Host ""

Write-Host "3. Verificando servicios (si están desplegados)..." -ForegroundColor Yellow
$RedisHost = if ($env:REDIS_HOST) { $env:REDIS_HOST } else { "localhost" }
$RedisPort = if ($env:REDIS_PORT) { $env:REDIS_PORT } else { "6379" }

try {
    $redisTest = Test-NetConnection -ComputerName $RedisHost -Port $RedisPort -WarningAction SilentlyContinue -ErrorAction Stop
    if ($redisTest.TcpTestSucceeded) {
        Write-Host "✓ Redis está disponible en ${RedisHost}:${RedisPort}" -ForegroundColor Green
    } else {
        Write-Host "⚠ Redis no está disponible en ${RedisHost}:${RedisPort}" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ No se pudo verificar Redis" -ForegroundColor Yellow
}

Test-HttpService "http://localhost/api/core/health" "Elixir Core API" | Out-Null
Test-HttpService "http://localhost/api/whatsapp/health" "WhatsApp Edge API" | Out-Null
Test-HttpService "http://localhost/api/chat/health" "Chat Orchestrator API" | Out-Null
Write-Host ""

Write-Host "4. Verificando configuración de Kubernetes (si aplica)..." -ForegroundColor Yellow
if (Get-Command kubectl -ErrorAction SilentlyContinue) {
    try {
        $kubectlInfo = kubectl cluster-info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Kubernetes cluster está accesible" -ForegroundColor Green
            
            $hpaOutput = kubectl get hpa -n elixir-production 2>&1
            if ($LASTEXITCODE -eq 0) {
                $hpaCount = ($hpaOutput | Measure-Object -Line).Lines - 1
                if ($hpaCount -gt 0) {
                    Write-Host "✓ HPAs configurados: $hpaCount" -ForegroundColor Green
                } else {
                    Write-Host "⚠ No se encontraron HPAs en el namespace elixir-production" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "⚠ Kubernetes cluster no está accesible" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ No se pudo verificar Kubernetes" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ kubectl no disponible, saltando verificación de Kubernetes" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "5. Verificando configuración de Docker Swarm (si aplica)..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        $dockerInfo = docker info 2>&1
        if ($dockerInfo -match "Swarm: active") {
            Write-Host "✓ Docker Swarm está activo" -ForegroundColor Green
            
            $services = docker service ls 2>&1
            if ($LASTEXITCODE -eq 0) {
                $serviceCount = ($services | Measure-Object -Line).Lines - 1
                if ($serviceCount -gt 0) {
                    Write-Host "✓ Servicios en Swarm: $serviceCount" -ForegroundColor Green
                } else {
                    Write-Host "⚠ No se encontraron servicios en Swarm" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "⚠ Docker Swarm no está activo" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ No se pudo verificar Docker Swarm" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ docker no disponible, saltando verificación de Docker Swarm" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== Resumen ===" -ForegroundColor Cyan
if ($Errors -eq 0) {
    Write-Host "✓ Todas las verificaciones críticas pasaron" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Se encontraron $Errors errores" -ForegroundColor Red
    exit 1
}


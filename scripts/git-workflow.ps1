# Git Workflow Script - Elixir Platform
# Uso: .\scripts\git-workflow.ps1 -CommitMessage "fix: descripción" [-Quick]

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage,
    
    [switch]$Quick,
    
    [string]$Remote = "origin"
)

$ErrorActionPreference = "Stop"

# Obtener rama actual
$branch = git branch --show-current
if (-not $branch) {
    Write-Host "Error: No se pudo determinar la rama actual" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Git Workflow - Elixir Platform ===" -ForegroundColor Cyan
Write-Host "Rama: $branch" -ForegroundColor Yellow
Write-Host "Remoto: $remote" -ForegroundColor Yellow
Write-Host "Modo: $(if ($Quick) { 'RÁPIDO' } else { 'SEGURO' })" -ForegroundColor $(if ($Quick) { 'Yellow' } else { 'Green' })

# Paso 1: Verificar estado
Write-Host "`n[1/6] Verificando estado del repositorio..." -ForegroundColor Green
$status = git status --porcelain
if ($status) {
    Write-Host "Cambios detectados:" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "Working tree limpio" -ForegroundColor Green
}

# Paso 2: Actualizar desde remoto
Write-Host "`n[2/6] Actualizando desde remoto..." -ForegroundColor Green
try {
    git fetch $remote
    $remoteCommits = git log HEAD..$remote/$branch --oneline 2>$null
    if ($remoteCommits) {
        Write-Host "Hay commits en remoto que no tienes localmente:" -ForegroundColor Yellow
        $remoteCommits | ForEach-Object { Write-Host "  $_" }
        git pull --rebase $remote $branch
        Write-Host "Rebase completado" -ForegroundColor Green
    } else {
        Write-Host "Ya estás actualizado con remoto" -ForegroundColor Green
    }
} catch {
    Write-Host "Error durante pull/rebase: $_" -ForegroundColor Red
    Write-Host "Revisa manualmente con: git status" -ForegroundColor Yellow
    exit 1
}

# Paso 3: Revisar diferencias (solo modo seguro)
if (-not $Quick) {
    Write-Host "`n[3/6] Revisando diferencias..." -ForegroundColor Green
    $diff = git diff
    if ($diff) {
        Write-Host "Cambios no staged:" -ForegroundColor Yellow
        git diff --stat
        
        # Chequeo de seguridad: buscar posibles secrets
        $secretsPattern = "password|secret|api_key|token|credential|private_key"
        if ($diff -match $secretsPattern) {
            Write-Host "`n⚠️  ADVERTENCIA: Posibles secrets detectados en cambios!" -ForegroundColor Red
            Write-Host "Revisa manualmente antes de continuar" -ForegroundColor Yellow
            $confirm = Read-Host "¿Continuar de todas formas? (s/n)"
            if ($confirm -ne "s") { 
                Write-Host "Abortado por el usuario" -ForegroundColor Yellow
                exit 0
            }
        }
        
        $confirm = Read-Host "`n¿Continuar con staging? (s/n)"
        if ($confirm -ne "s") { 
            Write-Host "Abortado por el usuario" -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "No hay cambios para revisar" -ForegroundColor Green
    }
}

# Paso 4: Staging
Write-Host "`n[4/6] Haciendo staging de cambios..." -ForegroundColor Green
if ($Quick) {
    git add -A
    Write-Host "Todos los cambios agregados" -ForegroundColor Green
} else {
    Write-Host "Iniciando staging interactivo (git add -p)..." -ForegroundColor Yellow
    Write-Host "Comandos: y=stage, n=skip, s=split, q=quit, ?=help" -ForegroundColor Gray
    git add -p
}

# Verificar que hay algo staged
$staged = git diff --staged
if (-not $staged) {
    Write-Host "No hay cambios staged. Abortando." -ForegroundColor Yellow
    exit 0
}

Write-Host "Cambios staged:" -ForegroundColor Green
git diff --staged --stat

# Paso 5: Commit
Write-Host "`n[5/6] Creando commit..." -ForegroundColor Green

# Validar formato Conventional Commits
$commitPattern = "^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+"
if ($CommitMessage -notmatch $commitPattern) {
    Write-Host "⚠️  ADVERTENCIA: El mensaje no sigue Conventional Commits" -ForegroundColor Yellow
    Write-Host "Formato esperado: tipo: descripción" -ForegroundColor Gray
    Write-Host "Tipos: feat, fix, chore, docs, refactor, test, style, perf, ci, build, revert" -ForegroundColor Gray
    $confirm = Read-Host "¿Continuar de todas formas? (s/n)"
    if ($confirm -ne "s") { 
        Write-Host "Abortado por el usuario" -ForegroundColor Yellow
        exit 0
    }
}

git commit -m $CommitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "Commit creado exitosamente" -ForegroundColor Green
    git log -1 --stat
} else {
    Write-Host "Error al crear commit" -ForegroundColor Red
    exit 1
}

# Paso 6: Push
Write-Host "`n[6/6] Pusheando a remoto..." -ForegroundColor Green
try {
    git push $remote $branch
    Write-Host "Push exitoso" -ForegroundColor Green
} catch {
    Write-Host "Error durante push: $_" -ForegroundColor Red
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "  - Non-fast-forward (alguien más hizo push)" -ForegroundColor Gray
    Write-Host "  - Problemas de red" -ForegroundColor Gray
    Write-Host "`nSolución sugerida:" -ForegroundColor Yellow
    Write-Host "  git pull --rebase $remote $branch" -ForegroundColor Cyan
    Write-Host "  git push $remote $branch" -ForegroundColor Cyan
    exit 1
}

# Verificación final
Write-Host "`n=== Verificación Final ===" -ForegroundColor Cyan
git status
Write-Host "`nÚltimos 3 commits:" -ForegroundColor Yellow
git log --oneline -3

Write-Host "`n✅ Workflow completado exitosamente" -ForegroundColor Green


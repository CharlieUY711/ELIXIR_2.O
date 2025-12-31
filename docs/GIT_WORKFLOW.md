# Git Workflow — Procedimiento DevOps/Repo Manager

## Contexto Actual
- **Rama actual**: `post-baseline-analysis`
- **Remoto**: `origin` → `https://github.com/CharlieUY711/ELIXIR_2.O.git`
- **Último commit**: `fix: suppress core logs in decision cli output`

---

## Variante SEGURA (Recomendada)

### PASO 1: Verificar Estado del Repositorio

```powershell
# Ver rama actual y estado
git status

# Ver rama actual
git branch --show-current

# Ver remotos configurados
git remote -v

# Ver últimos commits locales
git log --oneline -5

# Ver commits que no están en remoto
git log origin/$(git branch --show-current)..HEAD --oneline
```

**Qué verificar:**
- ✅ Working tree limpio (o cambios conocidos)
- ✅ Rama correcta
- ✅ Remoto configurado
- ✅ No hay commits locales sin push

---

### PASO 2: Actualizar Rama con Remoto

```powershell
# Obtener cambios del remoto (sin modificar working tree)
git fetch origin

# Ver diferencias entre local y remoto
git log HEAD..origin/$(git branch --show-current) --oneline

# Si hay cambios en remoto, actualizar con rebase (recomendado)
git pull --rebase origin $(git branch --show-current)

# Alternativa: si prefieres merge (menos limpio)
# git pull origin $(git branch --show-current)
```

**Si hay conflictos durante rebase:**
```powershell
# Ver archivos en conflicto
git status

# Resolver conflictos manualmente, luego:
git add <archivos-resueltos>
git rebase --continue

# Si quieres abortar el rebase:
git rebase --abort
```

---

### PASO 3: Revisar Diferencias Antes de Commit

```powershell
# Ver todos los cambios no staged
git diff

# Ver cambios en archivos específicos
git diff <ruta/archivo>

# Ver cambios staged (si ya hiciste git add)
git diff --staged

# Ver resumen de cambios (más compacto)
git status --short
```

**Chequeos de seguridad:**
```powershell
# Verificar que no hay secrets en cambios
git diff | Select-String -Pattern "password|secret|api_key|token|credential" -CaseSensitive

# Verificar que no hay archivos generados
git status --short | Select-String -Pattern "dist/|node_modules/|\.log|\.env"
```

---

### PASO 4: Staging Selectivo (Preferido)

```powershell
# Staging interactivo (permite elegir hunks específicos)
git add -p

# Staging de archivo completo (si estás seguro)
git add <ruta/archivo>

# Staging de todos los cambios (solo si revisaste todo)
git add -A

# Ver qué está staged
git status
git diff --staged
```

**Durante `git add -p`:**
- `y` = stage este hunk
- `n` = no stage este hunk
- `s` = split hunk en partes más pequeñas
- `q` = salir (deja staged lo que ya elegiste)
- `?` = ayuda

---

### PASO 5: Crear Commit con Conventional Commits

```powershell
# Commit con mensaje
git commit -m "tipo: descripción breve"

# Tipos comunes:
# fix: corrección de bug
# feat: nueva funcionalidad
# chore: tareas de mantenimiento
# docs: documentación
# refactor: refactorización sin cambio funcional
# test: tests
# style: formato, punto y coma, etc.
# perf: mejora de rendimiento
```

**Ejemplos:**
```powershell
git commit -m "fix: suppress core logs in decision cli output"
git commit -m "feat: add new authorization rule for transfers"
git commit -m "chore: update dependencies"
git commit -m "docs: add git workflow procedure"
```

**Commit con descripción extendida:**
```powershell
git commit -m "fix: suppress core logs in decision cli output" -m "Temporarily suppress stdout and console methods during authorize() execution to ensure clean CLI output. Restore original handlers in finally block."
```

**Verificar commit antes de push:**
```powershell
# Ver último commit
git log -1 --stat

# Ver cambios del último commit
git show HEAD
```

---

### PASO 6: Push al Remoto

```powershell
# Push de la rama actual al remoto
git push origin $(git branch --show-current)

# Push con tracking (solo primera vez)
git push -u origin $(git branch --show-current)
```

**Si el push falla (non-fast-forward):**
```powershell
# Opción 1: Pull con rebase y push (recomendado)
git pull --rebase origin $(git branch --show-current)
git push origin $(git branch --show-current)

# Opción 2: Ver diferencias primero
git fetch origin
git log HEAD..origin/$(git branch --show-current) --oneline
# Luego decidir si hacer pull o si necesitas force (NO recomendado)
```

---

### PASO 7: Verificación Final

```powershell
# Verificar que working tree está limpio
git status

# Ver últimos commits (local y remoto)
git log --oneline -5
git log origin/$(git branch --show-current) --oneline -5

# Comparar local vs remoto
git log HEAD..origin/$(git branch --show-current) --oneline
git log origin/$(git branch --show-current)..HEAD --oneline

# Ver estado de todas las ramas
git branch -vv
```

**Verificación exitosa:**
- ✅ `git status` muestra "working tree clean"
- ✅ `git log` muestra tu commit como HEAD
- ✅ `git log origin/...` muestra tu commit en remoto
- ✅ No hay diferencias entre local y remoto

---

### PASO 8: Manejo de Errores Comunes

#### Error: Merge Conflict

```powershell
# Ver archivos en conflicto
git status

# Abrir archivos y resolver conflictos manualmente
# Buscar marcadores: <<<<<<< HEAD, =======, >>>>>>>

# Después de resolver:
git add <archivos-resueltos>
git commit  # Si estás en merge
# o
git rebase --continue  # Si estás en rebase
```

#### Error: Non-fast-forward

```powershell
# Ver qué commits están en remoto que no tienes localmente
git fetch origin
git log HEAD..origin/$(git branch --show-current) --oneline

# Actualizar con rebase (recomendado)
git pull --rebase origin $(git branch --show-current)
git push origin $(git branch --show-current)
```

#### Error: Rebase en progreso

```powershell
# Ver estado
git status

# Continuar rebase (después de resolver conflictos)
git add <archivos>
git rebase --continue

# Abortar rebase (vuelve al estado anterior)
git rebase --abort
```

#### Error: Cambios no guardados

```powershell
# Ver cambios
git status

# Opción 1: Guardar temporalmente (stash)
git stash
# ... hacer pull/rebase ...
git stash pop

# Opción 2: Commitear cambios primero
git add -p
git commit -m "WIP: cambios temporales"
# ... luego continuar con workflow ...
```

---

## Variante RÁPIDA (Solo si estás seguro)

```powershell
# 1. Verificar estado
git status

# 2. Actualizar
git pull --rebase origin $(git branch --show-current)

# 3. Agregar todos los cambios (¡revisar primero!)
git add -A

# 4. Commit
git commit -m "fix: descripción"

# 5. Push
git push origin $(git branch --show-current)

# 6. Verificar
git status
```

**⚠️ ADVERTENCIA:** Esta variante no revisa diferencias ni hace staging selectivo. Solo usar si:
- Estás 100% seguro de los cambios
- Ya revisaste `git diff` previamente
- No hay riesgo de incluir archivos no deseados

---

## Script de Automatización (Opcional)

Puedes crear un script `git-workflow.ps1`:

```powershell
# git-workflow.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage,
    
    [switch]$Quick
)

$branch = git branch --show-current
$remote = "origin"

Write-Host "=== Git Workflow ===" -ForegroundColor Cyan
Write-Host "Rama: $branch" -ForegroundColor Yellow

# Paso 1: Verificar estado
Write-Host "`n[1/6] Verificando estado..." -ForegroundColor Green
git status --short

# Paso 2: Actualizar
Write-Host "`n[2/6] Actualizando desde remoto..." -ForegroundColor Green
git fetch $remote
git pull --rebase $remote $branch

# Paso 3: Revisar diferencias
if (-not $Quick) {
    Write-Host "`n[3/6] Revisando diferencias..." -ForegroundColor Green
    git diff
    $confirm = Read-Host "¿Continuar? (s/n)"
    if ($confirm -ne "s") { exit }
}

# Paso 4: Staging
if ($Quick) {
    Write-Host "`n[4/6] Staging todos los cambios..." -ForegroundColor Green
    git add -A
} else {
    Write-Host "`n[4/6] Staging interactivo..." -ForegroundColor Green
    git add -p
}

# Paso 5: Commit
Write-Host "`n[5/6] Creando commit..." -ForegroundColor Green
git commit -m $CommitMessage

# Paso 6: Push
Write-Host "`n[6/6] Pusheando a remoto..." -ForegroundColor Green
git push $remote $branch

# Verificación
Write-Host "`n=== Verificación Final ===" -ForegroundColor Cyan
git status
git log --oneline -3
```

**Uso:**
```powershell
# Variante segura
.\git-workflow.ps1 -CommitMessage "fix: descripción"

# Variante rápida
.\git-workflow.ps1 -CommitMessage "fix: descripción" -Quick
```

---

## Checklist Pre-Commit

Antes de hacer commit, verificar:

- [ ] `git status` muestra solo archivos deseados
- [ ] No hay secrets en `git diff` (passwords, tokens, API keys)
- [ ] No hay archivos generados (dist/, node_modules/, .log)
- [ ] `.gitignore` está actualizado si es necesario
- [ ] Mensaje de commit sigue Conventional Commits
- [ ] Cambios probados localmente
- [ ] No hay conflictos pendientes

---

## Convenciones Asumidas

- **Remoto**: `origin`
- **Rama principal**: Detectar con `git branch -r | Select-String "origin/(main|master)"`
- **Rama actual**: `$(git branch --show-current)` (PowerShell)
- **Conventional Commits**: `tipo: descripción` (lowercase, sin punto final en subject)

---

## Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Rebase](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)
- [Git Workflow Best Practices](https://www.atlassian.com/git/tutorials/comparing-workflows)


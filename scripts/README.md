# Scripts

## Descripción

Este directorio contiene scripts de utilidad para desarrollo, despliegue y mantenimiento del proyecto.

## Scripts Disponibles

### `git-workflow.ps1`

Script automatizado para el workflow de Git siguiendo mejores prácticas DevOps.

**Uso básico:**
```powershell
.\scripts\git-workflow.ps1 -CommitMessage "fix: descripción del cambio"
```

**Modo rápido (sin revisión interactiva):**
```powershell
.\scripts\git-workflow.ps1 -CommitMessage "fix: descripción" -Quick
```

**Parámetros:**
- `-CommitMessage` (obligatorio): Mensaje de commit en formato Conventional Commits
- `-Quick` (opcional): Modo rápido, omite revisión interactiva
- `-Remote` (opcional): Nombre del remoto (default: "origin")

**Qué hace:**
1. Verifica estado del repositorio
2. Actualiza desde remoto (pull con rebase)
3. Revisa diferencias (modo seguro)
4. Hace staging interactivo o automático
5. Crea commit con mensaje validado
6. Pushea a remoto
7. Verifica resultado final

**Validaciones:**
- Detecta posibles secrets en cambios
- Valida formato Conventional Commits
- Maneja errores comunes (conflictos, non-fast-forward)

**Ver documentación completa:** `docs/GIT_WORKFLOW.md`

## Otros Scripts

Pendiente creación de scripts adicionales según necesidades del proyecto.


# Script de Despliegue del Catálogo - Elixir Platform

Este script automatiza el despliegue completo del catálogo de Elixir Platform en el entorno de producción interna.

## Uso

```powershell
# Despliegue básico
.\scripts\deploy-catalog.ps1

# Despliegue con parámetros personalizados
.\scripts\deploy-catalog.ps1 -ProductionBranch "main" -CatalogUrl "http://localhost:5173"

# Despliegue omitiendo pruebas
.\scripts\deploy-catalog.ps1 -SkipTests

# Despliegue omitiendo monitoreo
.\scripts\deploy-catalog.ps1 -SkipMonitoring

# Despliegue completo con todas las opciones
.\scripts\deploy-catalog.ps1 -ProductionBranch "main" -CatalogUrl "http://localhost:5173" -SkipTests -SkipMonitoring
```

## Parámetros

- `-ProductionBranch <string>`: Rama de producción (por defecto: "main")
- `-CatalogUrl <string>`: URL del catálogo para pruebas (por defecto: "http://localhost:5173")
- `-SkipTests`: Omite las pruebas de humo
- `-SkipMonitoring`: Omite la configuración de monitoreo

## Pasos del Despliegue

El script ejecuta los siguientes pasos en orden:

1. **Verificar Estado del Proyecto en Git**
   - Verifica que no haya cambios sin confirmar
   - Sincroniza con el repositorio remoto
   - Actualiza la rama local

2. **Preparar Entorno de Producción**
   - Verifica Node.js y npm
   - Instala dependencias de producción
   - Construye el catálogo para producción

3. **Generar y Ejecutar el Despliegue**
   - Verifica Docker y Docker Compose
   - Construye y despliega contenedores
   - Verifica el estado de los contenedores

4. **Verificar Infraestructura de Nube**
   - Verifica Kubernetes (si está disponible)
   - Verifica Firebase (si está disponible)

5. **Configurar Monitoreo y Alertas**
   - Configura herramientas de monitoreo
   - Verifica servicios de Prometheus y Grafana

6. **Realizar Pruebas de Humo**
   - Verifica que el catálogo esté accesible
   - Valida respuesta HTTP 200

7. **Desplegar la Versión Final**
   - Hace push de la rama al repositorio remoto

8. **Actualizar Documentación**
   - Crea registro de despliegue en `ops/modo-1/`

9. **Verificación Post-Despliegue**
   - Verificación final de contenedores
   - Verificación final del catálogo

## Requisitos Previos

- Git instalado y configurado
- Node.js 18+ y npm instalados
- Docker y Docker Compose instalados
- Acceso al repositorio remoto
- Permisos para ejecutar scripts de PowerShell

## Archivos Creados

El script crea los siguientes archivos si no existen:

- `infra/docker-compose.prod.yml`: Configuración de Docker Compose para producción
- `catalog/frontend/Dockerfile`: Dockerfile para producción
- `ops/modo-1/deploy-log-YYYY-MM-dd-HHmmss.md`: Registro de cada despliegue

## Solución de Problemas

### Error: "Node.js no está instalado"
- Instale Node.js desde [nodejs.org](https://nodejs.org/)

### Error: "Docker no está instalado"
- Instale Docker Desktop desde [docker.com](https://www.docker.com/products/docker-desktop)

### Error: "No se pudo conectar al catálogo"
- Verifique que los contenedores estén corriendo: `docker ps`
- Verifique los logs: `docker-compose -f infra/docker-compose.prod.yml logs`
- Use `-SkipTests` para omitir esta verificación

### Error: "Git conflictos"
- Resuelva los conflictos manualmente antes de ejecutar el script
- Use `git status` para ver el estado actual

## Notas

- El script está diseñado para ejecutarse en Windows PowerShell
- Todos los pasos son verificables y el script se detiene en caso de error
- Los pasos opcionales (Kubernetes, Firebase) no detienen el despliegue si fallan
- Se crea un registro de cada despliegue en `ops/modo-1/`


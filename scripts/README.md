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

### `performance/analyze-performance.ts`

Script de análisis de rendimiento del sistema (Fase 6.1) - Versión TypeScript/Node.js.

**Requisitos:**
```bash
cd scripts/performance
npm install
```

**Uso básico:**
```bash
cd scripts/performance
npm run analyze
```

**Qué hace:**
1. Recopila métricas del sistema (CPU, memoria, red, disco)
2. Mide tiempos de respuesta de cada componente
3. Genera un reporte JSON con todos los datos
4. Muestra un resumen en consola

**Métricas recopiladas:**
- **Sistema**: Plataforma, arquitectura, hostname, uptime
- **CPU**: Fabricante, modelo, núcleos, carga actual, velocidad
- **Memoria**: Total, usada, disponible, swap, porcentaje de uso
- **Red**: Interfaces activas, tráfico RX/TX, errores
- **Disco**: Sistemas de archivos, espacio usado/disponible
- **Proceso Node.js**: PID, uso de CPU/memoria, uptime
- **Tiempos de respuesta**: Métricas de latencia de recopilación

**Salida:**
- `performance_analysis_report.json` en la raíz del proyecto

**Ver documentación completa:** `scripts/performance/README.md`

### `performance_analysis.py`

Script de análisis exhaustivo de rendimiento del sistema. Mide tiempos de respuesta, utilización de CPU, memoria, tráfico de red y otros parámetros clave.

**Requisitos:**
```bash
pip install -r scripts/requirements.txt
```

**Uso básico:**
```bash
python scripts/performance_analysis.py
```

**Uso con opciones:**
```bash
# Análisis con más mediciones y mayor intervalo
python scripts/performance_analysis.py --iterations 10 --interval 5

# Incluir medición de endpoints HTTP
python scripts/performance_analysis.py --endpoints http://localhost:3000/health http://localhost:3001/api/status

# Especificar directorio de salida
python scripts/performance_analysis.py --output-dir reports/performance

# Solo generar reporte JSON
python scripts/performance_analysis.py --json-only

# Solo generar reporte CSV
python scripts/performance_analysis.py --csv-only
```

**Parámetros:**
- `--iterations`, `-i`: Número de mediciones consecutivas (default: 5)
- `--interval`, `-t`: Intervalo entre mediciones en segundos (default: 2)
- `--endpoints`, `-e`: URLs de endpoints HTTP para medir tiempos de respuesta
- `--output-dir`, `-o`: Directorio para guardar los reportes (default: performance_reports)
- `--json-only`: Solo generar reporte JSON (no CSV)
- `--csv-only`: Solo generar reporte CSV (no JSON)

**Qué hace:**
1. Recopila métricas del sistema (CPU, memoria, disco, red)
2. Mide tiempos de respuesta de endpoints HTTP (opcional)
3. Realiza múltiples mediciones con intervalo configurable
4. Calcula estadísticas agregadas (promedios, mínimos, máximos)
5. Genera reportes en formato JSON y CSV
6. Guarda los datos para futuras comparaciones

**Métricas recopiladas:**
- **CPU**: Uso porcentual, frecuencia, número de cores
- **Memoria**: Total, usado, disponible, porcentaje de uso, caché
- **Swap**: Total, usado, porcentaje de uso
- **Disco**: Total, usado, libre, porcentaje de uso
- **Red**: Bytes enviados/recibidos, paquetes, errores
- **Sistema**: Número de procesos, tiempo de arranque
- **HTTP**: Tiempo de respuesta, código de estado, éxito/fallo

**Salida:**
- Reporte JSON con todas las métricas detalladas y estadísticas
- Reporte CSV con métricas aplanadas para análisis en hojas de cálculo
- Resumen en consola con estadísticas clave

Los reportes se guardan en el directorio especificado (por defecto `performance_reports/`) con timestamps para facilitar comparaciones antes/después de optimizaciones.

### `post_optimization_monitor.py`

Script de monitoreo post-optimización para verificar si las mejoras implementadas están funcionando correctamente. Compara las métricas actuales con las métricas previas (antes de la optimización) y genera un reporte detallado de la comparación.

**Requisitos:**
```bash
pip install -r scripts/requirements.txt
```

**Uso básico:**
```bash
# Monitoreo comparando con métricas previas
python scripts/post_optimization_monitor.py --previous-metrics performance_reports/performance_analysis_report_20240101_120000.json
```

**Uso con opciones:**
```bash
# Monitoreo con más mediciones y mayor intervalo
python scripts/post_optimization_monitor.py --previous-metrics report.json --iterations 10 --interval 5

# Incluir medición de endpoints HTTP
python scripts/post_optimization_monitor.py --previous-metrics report.json --endpoints http://localhost:3000/health http://localhost:3001/api/status

# Especificar directorio de salida
python scripts/post_optimization_monitor.py --previous-metrics report.json --output-dir reports/post_optimization
```

**Parámetros:**
- `--previous-metrics`, `-p` (obligatorio): Ruta al archivo JSON con métricas previas (generado por `performance_analysis.py`)
- `--iterations`, `-i`: Número de mediciones consecutivas (default: 5)
- `--interval`, `-t`: Intervalo entre mediciones en segundos (default: 2)
- `--endpoints`, `-e`: URLs de endpoints HTTP para medir tiempos de respuesta
- `--output-dir`, `-o`: Directorio para guardar los reportes (default: performance_reports)

**Qué hace:**
1. Carga las métricas previas desde un archivo JSON (generado por `performance_analysis.py`)
2. Recopila nuevas métricas del sistema (CPU, memoria, disco, red)
3. Mide tiempos de respuesta de endpoints HTTP (opcional)
4. Realiza múltiples mediciones con intervalo configurable
5. Compara las métricas nuevas con las previas
6. Identifica mejoras, regresiones y métricas sin cambios
7. Genera un reporte detallado en formato JSON
8. Muestra un resumen en consola con la comparación

**Métricas comparadas:**
- **CPU**: Uso promedio y máximo (mejora si disminuye)
- **Memoria**: Uso promedio y máximo (mejora si disminuye)
- **HTTP**: Tiempo de respuesta promedio (mejora si disminuye)
- **Disco**: Uso promedio
- **Comparaciones detalladas**: Diferencias absolutas y porcentuales

**Salida:**
- Reporte JSON con comparación detallada antes/después
- Resumen en consola con:
  - ✅ Mejoras detectadas (métricas que mejoraron)
  - ⚠️ Regresiones detectadas (métricas que empeoraron)
  - ➡️ Métricas sin cambios significativos
  - Comparación detallada con diferencias porcentuales

**Flujo de trabajo recomendado:**
1. Ejecutar `performance_analysis.py` antes de las optimizaciones
2. Realizar las optimizaciones en el sistema
3. Ejecutar `post_optimization_monitor.py` con el reporte previo
4. Revisar el reporte de comparación para validar las mejoras

### `identify_bottlenecks.py`

Script de análisis de rendimiento para identificar cuellos de botella en el sistema.

**Requisitos:**
```bash
pip install psutil
```

**Uso básico:**
```bash
python scripts/identify_bottlenecks.py
```

**Uso avanzado:**
```bash
# Análisis de 5 minutos con muestras cada 2 segundos
python scripts/identify_bottlenecks.py --duracion 300 --intervalo 2 --salida mi_reporte.json

# Con umbrales personalizados
python scripts/identify_bottlenecks.py --umbral-cpu 70 --umbral-memoria 75
```

**Parámetros:**
- `--intervalo` (opcional): Intervalo en segundos entre muestras (default: 1.0)
- `--duracion` (opcional): Duración del análisis en segundos (default: 60.0)
- `--salida` (opcional): Archivo de salida para el informe JSON (default: bottleneck_report.json)
- `--umbral-cpu` (opcional): Umbral de CPU para considerar cuello de botella % (default: 80.0)
- `--umbral-memoria` (opcional): Umbral de memoria para considerar cuello de botella % (default: 80.0)
- `--umbral-disco` (opcional): Umbral de disco para considerar cuello de botella % (default: 80.0)

**Qué hace:**
1. Monitorea procesos, CPU, memoria, disco y red en tiempo real
2. Identifica procesos con alto consumo de recursos
3. Detecta cuellos de botella según umbrales configurados
4. Genera informe JSON detallado con métricas y sugerencias
5. Muestra resumen en consola con recomendaciones de optimización

**Métricas analizadas:**
- CPU global y por núcleo
- Memoria (total, usado, disponible, porcentaje)
- Disco (por partición: uso, espacio libre)
- Red (bytes enviados/recibidos, paquetes, errores)
- Procesos (CPU, memoria, hilos, estado)

**Salida:**
- Archivo JSON con informe completo
- Resumen en consola con sugerencias de optimización

## Otros Scripts

Pendiente creación de scripts adicionales según necesidades del proyecto.


```bash
pip install -r scripts/requirements.txt
```

**Uso básico:**
```bash
# Comparar dos reportes y generar post_optimization_report.json
python scripts/compare_performance_reports.py \
  --before performance_reports/report_before.json \
  --after performance_reports/report_after.json \
  --output scripts/performance/post_optimization_report.json
```

**Uso con opciones:**
```bash
# Solo mostrar comparación en consola (no generar archivo)
python scripts/compare_performance_reports.py \
  --before performance_reports/report_before.json \
  --after performance_reports/report_after.json \
  --console-only
```

**Parámetros:**
- `--before`, `-b` (obligatorio): Ruta al reporte JSON antes de la optimización
- `--after`, `-a` (obligatorio): Ruta al reporte JSON después de la optimización
- `--output`, `-o` (opcional): Ruta de salida para el reporte post-optimización (default: `scripts/performance/post_optimization_report.json`)
- `--console-only`: Solo mostrar comparación en consola, no generar archivo

**Qué hace:**
1. Carga los dos reportes JSON de rendimiento
2. Extrae las estadísticas de cada reporte (CPU, memoria, disco, HTTP)
3. Calcula mejoras porcentuales entre ambos reportes
4. Identifica mejoras clave y áreas que requieren atención
5. Genera un reporte post-optimización completo en formato JSON
6. Muestra un resumen comparativo en consola

**Métricas comparadas:**
- **CPU**: Reducción porcentual en uso promedio
- **Memoria**: Reducción porcentual en uso y GB ahorrados
- **HTTP**: Mejora porcentual en tiempo de respuesta y reducción en milisegundos
- **Efectividad general**: Evaluación de la efectividad de las optimizaciones

**Salida:**
- Reporte JSON completo con comparación detallada (`post_optimization_report.json`)
- Resumen en consola con mejoras calculadas y recomendaciones

Este script es especialmente útil para la **Fase 6.4: Monitoreo Post-Optimización**, permitiendo verificar la efectividad de las mejoras de rendimiento implementadas.

### `fine_tune_and_validate.py`

Script de ajustes finos y validación de resultados del sistema. Realiza ajustes adicionales en los parámetros del sistema basados en los resultados del monitoreo post-optimización y valida que el rendimiento esté dentro de los parámetros esperados.

**Requisitos:**
```bash
pip install -r scripts/requirements.txt
```

**Uso básico:**
```bash
# Usar el reporte más reciente automáticamente
python scripts/fine_tune_and_validate.py
```

**Uso con opciones:**
```bash
# Especificar un reporte específico
python scripts/fine_tune_and_validate.py --report performance_reports/performance_analysis_report_20240101_120000.json

# Ajustar umbrales personalizados
python scripts/fine_tune_and_validate.py --cpu-max 75 --memory-max 80 --http-max 400

# Especificar directorio de salida
python scripts/fine_tune_and_validate.py --output-dir reports/validation
```

**Parámetros:**
- `--report`, `-r`: Ruta al reporte JSON de rendimiento (si no se especifica, usa el más reciente)
- `--output-dir`, `-o`: Directorio para guardar el reporte de validación (default: performance_reports)
- `--cpu-max`: Umbral máximo de uso de CPU en porcentaje (default: 80.0)
- `--cpu-avg`: Umbral promedio de uso de CPU en porcentaje (default: 60.0)
- `--memory-max`: Umbral máximo de uso de memoria en porcentaje (default: 85.0)
- `--memory-avg`: Umbral promedio de uso de memoria en porcentaje (default: 70.0)
- `--disk-max`: Umbral máximo de uso de disco en porcentaje (default: 90.0)
- `--http-max`: Umbral máximo de tiempo de respuesta HTTP en ms (default: 500.0)
- `--http-avg`: Umbral promedio de tiempo de respuesta HTTP en ms (default: 200.0)

**Qué hace:**
1. Carga un reporte de análisis de rendimiento (generado por `performance_analysis.py`)
2. Analiza las métricas y determina ajustes necesarios
3. Realiza ajustes finos en parámetros del sistema:
   - Asignación de memoria
   - Prioridad de CPU
   - Uso de disco
4. Valida que el rendimiento esté dentro de parámetros esperados:
   - CPU (promedio y máximo)
   - Memoria (promedio y máximo)
   - Disco (uso)
   - HTTP (tiempos de respuesta promedio y máximo)
5. Genera un reporte de validación detallado en formato JSON
6. Muestra un resumen en consola con:
   - Ajustes realizados (por prioridad)
   - Estado de validación (PASS/FAIL)
   - Checks individuales con resultados

**Ajustes realizados:**
- **Memoria**: Recomendaciones para reducir uso si excede umbrales
- **CPU**: Recomendaciones para optimizar uso de procesador
- **Disco**: Recomendaciones para gestionar espacio en disco
- Cada ajuste incluye prioridad (alta/media/baja) y recomendaciones específicas

**Validaciones:**
- Compara métricas contra umbrales configurados
- Identifica métricas que exceden límites esperados
- Genera reporte detallado con estado de cada check
- Retorna código de salida 0 si todas las validaciones pasan, 1 si alguna falla

**Salida:**
- Reporte JSON con:
  - Metadatos (umbrales usados, reporte fuente)
  - Resumen de ajustes realizados
  - Resultados de validación detallados
  - Estadísticas del reporte analizado
- Resumen en consola con estado general y detalles

**Flujo de trabajo recomendado:**
1. Ejecutar `performance_analysis.py` para recopilar métricas iniciales
2. Realizar optimizaciones en el sistema
3. Ejecutar `post_optimization_monitor.py` para comparar mejoras
4. Ejecutar `fine_tune_and_validate.py` para ajustes finos y validación final
5. Revisar el reporte de validación y aplicar recomendaciones si es necesario

### `load_simulation.py`

Script de simulación de cargas de trabajo para evaluar la capacidad del sistema bajo diferentes escenarios de carga.

**Requisitos:**
```bash
pip install -r scripts/requirements.txt
```

**Uso básico:**
```bash
# Simulación de carga normal
python scripts/load_simulation.py --url http://localhost:3002/resolve/test123 --scenario normal

# Simulación de carga alta
python scripts/load_simulation.py --url http://localhost:3002/resolve/test123 --scenario high
```

**Ver documentación completa:** `scripts/SCALABILITY_MONITORING_README.md`

### `scalability_monitoring.py`

Script de monitoreo exhaustivo de escalabilidad que recopila métricas detalladas de recursos del sistema.

**Requisitos:**
```bash
pip install -r scripts/requirements.txt
```

**Uso básico:**
```bash
# Monitoreo durante 5 minutos
python scripts/scalability_monitoring.py --duration 300 --interval 5

# Monitoreo con filtro de procesos
python scripts/scalability_monitoring.py --duration 600 --interval 10 --process-filter node
```

**Ver documentación completa:** `scripts/SCALABILITY_MONITORING_README.md`

### `stress_test.py` (Fase 7.4)

Script de pruebas de estrés extremas para verificar la estabilidad del sistema bajo condiciones extremas.

**Requisitos:**
```bash
pip install -r scripts/requirements.txt
```

**Uso básico:**
```bash
# Estrés sostenido (10 minutos)
python scripts/stress_test.py \
  --url http://localhost:3002/resolve/test123 \
  --scenario sustained \
  --monitor

# Pico de carga (1 minuto)
python scripts/stress_test.py \
  --url http://localhost:3002/resolve/test123 \
  --scenario spike \
  --monitor
```

**Escenarios disponibles:**
- `sustained`: 500 usuarios, 10 minutos, máximo throughput
- `spike`: 1000 usuarios, 1 minuto, máximo throughput
- `gradual`: 100 usuarios, 15 minutos, máximo throughput
- `burst`: 2000 usuarios, 30 segundos, máximo throughput
- `custom`: Configuración personalizada

**Parámetros:**
- `--url`: URL del endpoint a probar (requerido)
- `--scenario`: Tipo de escenario (sustained, spike, gradual, burst, custom)
- `--users`: Número de usuarios concurrentes (para custom)
- `--duration`: Duración en segundos (default: 300)
- `--rps`: Tasa objetivo de requests/segundo (0 = máximo throughput)
- `--monitor`: Monitorear recursos del sistema durante la prueba
- `--output-dir`: Directorio para reportes (default: stress_test_reports)

**Ver documentación completa:** `docs/ETAPAS/FASE_7_4_PRUEBAS_ESCALABILIDAD.md`

### `progressive_load_test.py` (Fase 7.4)

Script orquestador que ejecuta una secuencia de pruebas de carga incrementales para identificar puntos de saturación y límites del sistema.

**Requisitos:**
```bash
pip install -r scripts/requirements.txt
```

**Uso básico:**
```bash
# Pruebas de carga progresiva
python scripts/progressive_load_test.py \
  --url http://localhost:3002/resolve/test123 \
  --type load \
  --start-users 10 \
  --max-users 1000 \
  --multiplier 1.5 \
  --baseline

# Pruebas de estrés progresivo
python scripts/progressive_load_test.py \
  --url http://localhost:3002/resolve/test123 \
  --type stress \
  --start-users 50 \
  --max-users 500 \
  --stress-duration 120
```

**Parámetros:**
- `--url`: URL del endpoint a probar (requerido)
- `--type`: Tipo de pruebas (`load` o `stress`)
- `--start-users`: Número inicial de usuarios (default: 10)
- `--max-users`: Número máximo de usuarios (default: 1000)
- `--multiplier`: Factor de incremento entre pruebas (default: 1.5)
- `--requests-per-user`: Requests por usuario para load tests (default: 20)
- `--stress-duration`: Duración en segundos para stress tests (default: 60)
- `--baseline`: Recopilar métricas baseline antes de las pruebas
- `--stop-on-degradation`: Detener si se detecta degradación (default: True)
- `--output-dir`: Directorio para reportes (default: progressive_load_reports)

**Características:**
- Incremento automático de carga
- Detección de degradación
- Recopilación de métricas baseline
- Análisis automático de resultados
- Identificación de puntos de saturación

**Ver documentación completa:** `docs/ETAPAS/FASE_7_4_PRUEBAS_ESCALABILIDAD.md`

### `compare_scalability_results.py` (Fase 7.4)

Script de análisis comparativo de resultados de escalabilidad. Compara múltiples reportes de pruebas y genera recomendaciones de ajustes.

**Requisitos:**
```bash
pip install -r scripts/requirements.txt
```

**Uso básico:**
```bash
# Comparar resultados de diferentes pruebas
python scripts/compare_scalability_results.py \
  progressive_load_reports/test1.json \
  progressive_load_reports/test2.json \
  stress_test_reports/test3.json \
  --output comparison_report.json
```

**Parámetros:**
- `reports`: Rutas a los archivos de reporte JSON a comparar (mínimo 2)
- `--output`: Archivo de salida para el reporte de comparación (default: auto-generado)

**Análisis generado:**
- Comparación por nivel de usuarios
- Tendencias de rendimiento
- Identificación de degradación
- Recomendaciones de ajustes con prioridades (ALTA, MEDIA, BAJA)
- Acciones sugeridas por recomendación

**Ver documentación completa:** `docs/ETAPAS/FASE_7_4_PRUEBAS_ESCALABILIDAD.md`

## Flujo de Trabajo Recomendado para Pruebas de Escalabilidad

### 1. Baseline
```bash
python scripts/progressive_load_test.py \
  --url http://localhost:3002/resolve/test123 \
  --type load \
  --start-users 10 \
  --max-users 50 \
  --baseline
```

### 2. Pruebas Progresivas
```bash
python scripts/progressive_load_test.py \
  --url http://localhost:3002/resolve/test123 \
  --type load \
  --start-users 10 \
  --max-users 1000 \
  --stop-on-degradation
```

### 3. Pruebas de Estrés
```bash
python scripts/stress_test.py \
  --url http://localhost:3002/resolve/test123 \
  --scenario sustained \
  --monitor
```

### 4. Análisis Comparativo
```bash
python scripts/compare_scalability_results.py \
  progressive_load_reports/*.json \
  stress_test_reports/*.json \
  --output scalability_analysis.json
```

## Otros Scripts

Pendiente creación de scripts adicionales según necesidades del proyecto.


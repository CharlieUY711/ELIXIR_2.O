# Scripts de Evaluación de Escalabilidad - Fase 7.1

Este directorio contiene scripts para la evaluación exhaustiva de escalabilidad del sistema Elixir Platform.

## Scripts Disponibles

### 1. `scalability_monitoring.py`

Script de monitoreo exhaustivo de recursos del sistema para evaluación de escalabilidad.

#### Requisitos

```bash
pip install psutil
```

#### Uso Básico

```bash
# Monitoreo durante 5 minutos con intervalos de 5 segundos
python scripts/scalability_monitoring.py --duration 300 --interval 5
```

#### Uso Avanzado

```bash
# Monitoreo durante 1 hora con intervalos de 10 segundos
python scripts/scalability_monitoring.py --duration 3600 --interval 10

# Filtrar solo procesos Node.js
python scripts/scalability_monitoring.py --process-filter node --duration 600

# Especificar directorio de salida
python scripts/scalability_monitoring.py --output-dir reports/scalability --duration 300
```

#### Parámetros

- `--duration`: Duración del monitoreo en segundos (default: 300)
- `--interval`: Intervalo entre mediciones en segundos (default: 5)
- `--process-filter`: Filtrar procesos por nombre (default: todos)
- `--output-dir`: Directorio para guardar reportes (default: scalability_reports)
- `--output-file`: Nombre del archivo de salida (default: auto-generado)

#### Métricas Recopiladas

**Sistema**:
- Plataforma, hostname, uptime
- CPU: Uso porcentual, frecuencia, número de cores, uso por core
- Memoria: Total, usado, disponible, swap, porcentaje de uso
- Disco: Espacio total/usado/disponible, I/O (lectura/escritura)
- Red: Bytes enviados/recibidos, paquetes, errores

**Procesos**:
- PID, nombre, uso de CPU/memoria
- Memoria RSS/VMS
- Número de hilos
- Estado del proceso
- Tiempos de CPU (usuario/sistema)

#### Salida

El script genera un reporte JSON con:
- Métricas agregadas (promedio, máximo, mínimo)
- Estadísticas por proceso
- Historial completo de mediciones
- Resumen en consola

**Ejemplo de salida**:
```
============================================================
RESUMEN DE MONITOREO DE ESCALABILIDAD
============================================================
Total de mediciones: 60
Duración: 300.0 segundos

CPU:
  Promedio: 25.50%
  Máximo: 45.20%
  Mínimo: 10.30%

Memoria:
  Uso promedio: 45.20%
  Uso máximo: 52.10%
  Uso promedio: 8.50 GB
  Uso máximo: 9.80 GB

Procesos más consumidores de recursos:
  node:
    CPU: 15.20% | Memoria: 20.30% (512.50 MB)
============================================================
```

---

### 2. `load_simulation.py`

Script de simulación de cargas de trabajo para evaluar la capacidad del sistema bajo diferentes escenarios de carga.

#### Requisitos

```bash
pip install aiohttp
```

#### Uso Básico

```bash
# Simulación de carga normal
python scripts/load_simulation.py --url http://localhost:3002/resolve/test123 --scenario normal

# Simulación de carga alta
python scripts/load_simulation.py --url http://localhost:3002/resolve/test123 --scenario high
```

#### Escenarios Predefinidos

**Normal**:
- 10 usuarios concurrentes
- 10 requests por usuario
- Total: 100 requests

**Medium**:
- 50 usuarios concurrentes
- 20 requests por usuario
- Total: 1,000 requests

**High**:
- 200 usuarios concurrentes
- 50 requests por usuario
- Total: 10,000 requests

**Extreme**:
- 1,000 usuarios concurrentes
- 100 requests por usuario
- Total: 100,000 requests

#### Uso Avanzado

```bash
# Escenario custom
python scripts/load_simulation.py \
  --url http://localhost:3002/resolve/test123 \
  --scenario custom \
  --users 100 \
  --requests-per-user 50

# Con método POST y datos
python scripts/load_simulation.py \
  --url http://localhost:3002/api/handoff \
  --method POST \
  --scenario medium

# Con ramp-up personalizado
python scripts/load_simulation.py \
  --url http://localhost:3002/resolve/test123 \
  --scenario high \
  --ramp-up 30
```

#### Parámetros

- `--url`: URL del endpoint a probar (requerido)
- `--scenario`: Escenario de carga (normal, medium, high, extreme, custom)
- `--users`: Número de usuarios concurrentes (solo para custom)
- `--requests-per-user`: Número de requests por usuario (solo para custom)
- `--ramp-up`: Tiempo de ramp-up en segundos (default: 10)
- `--method`: Método HTTP (GET, POST, PUT, DELETE) (default: GET)
- `--output-dir`: Directorio para guardar reportes (default: load_simulation_reports)
- `--output-file`: Nombre del archivo de salida (default: auto-generado)
- `--include-raw`: Incluir resultados raw en el reporte (puede ser muy grande)

#### Métricas Calculadas

**Por Escenario**:
- Total de requests
- Requests exitosos/fallidos
- Tasa de éxito
- Latencia: min, max, promedio, mediana, p50, p95, p99
- Throughput (requests/segundo)
- Distribución de códigos de estado
- Tipos de errores

#### Salida

El script genera un reporte JSON con:
- Estadísticas agregadas por escenario
- Latencia detallada (p50, p95, p99)
- Throughput calculado
- Distribución de códigos de estado y errores
- Resultados raw (opcional)

**Ejemplo de salida**:
```
============================================================
ESCENARIO: high
============================================================
Simulando 200 usuarios concurrentes...
  - Requests por usuario: 50
  - Ramp-up: 10 segundos

Resultados del escenario 'high':
  Total de requests: 10000
  Requests exitosos: 9850
  Requests fallidos: 150
  Tasa de éxito: 98.50%
  Latencia:
    Promedio: 125.50 ms
    p50: 110.20 ms
    p95: 250.30 ms
    p99: 450.10 ms
  Throughput: 85.50 req/s
```

---

## Flujo de Trabajo Recomendado

### 1. Monitoreo Baseline

Antes de realizar simulaciones, establecer un baseline de recursos:

```bash
# Monitoreo durante 30 minutos en condiciones normales
python scripts/scalability_monitoring.py --duration 1800 --interval 10
```

### 2. Simulación de Carga

Ejecutar simulaciones progresivas:

```bash
# Empezar con carga normal
python scripts/load_simulation.py --url http://localhost:3002/resolve/test123 --scenario normal

# Incrementar a carga media
python scripts/load_simulation.py --url http://localhost:3002/resolve/test123 --scenario medium

# Probar carga alta
python scripts/load_simulation.py --url http://localhost:3002/resolve/test123 --scenario high
```

### 3. Monitoreo Durante Simulación

Ejecutar monitoreo en paralelo durante las simulaciones:

```bash
# Terminal 1: Simulación
python scripts/load_simulation.py --url http://localhost:3002/resolve/test123 --scenario high

# Terminal 2: Monitoreo
python scripts/scalability_monitoring.py --duration 600 --interval 5 --process-filter node
```

### 4. Análisis de Resultados

Comparar resultados de diferentes escenarios y identificar:
- Puntos de saturación
- Degradación de servicio
- Cuellos de botella
- Límites del sistema

---

## Integración con Otros Scripts

Estos scripts se complementan con los scripts existentes:

- `performance_analysis.py`: Análisis exhaustivo de rendimiento
- `identify_bottlenecks.py`: Identificación de cuellos de botella
- `post_optimization_monitor.py`: Monitoreo post-optimización

---

## Notas Importantes

1. **Impacto en Producción**: Los scripts de simulación de carga pueden generar tráfico significativo. Usar con precaución en ambientes de producción.

2. **Recursos del Sistema**: El monitoreo continuo consume recursos. Ajustar intervalos según necesidades.

3. **Tamaño de Reportes**: Los reportes con resultados raw pueden ser muy grandes. Usar `--include-raw` solo cuando sea necesario.

4. **Permisos**: Algunas métricas de procesos pueden requerir permisos elevados en ciertos sistemas.

5. **Red**: Las simulaciones de carga requieren conectividad de red estable.

---

## Referencias

- [Documento de Evaluación de Escalabilidad](../docs/ETAPAS/FASE_7_1_EVALUACION_ESCALABILIDAD.md)
- [Scripts de Performance](./README.md)
- [Análisis de Cuellos de Botella](./performance/bottleneck_report.json)


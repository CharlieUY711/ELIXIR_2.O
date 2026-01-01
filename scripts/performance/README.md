# Scripts de Optimización de Rendimiento - ELIXIR 2.0

Este directorio contiene scripts para analizar y optimizar el rendimiento del sistema ELIXIR 2.0.

## Scripts Disponibles

### 1. `optimize-performance.ts`

Script principal que analiza los recursos del sistema y genera configuraciones optimizadas.

**Funcionalidades:**
- Analiza recursos del sistema (memoria, CPU, plataforma)
- Calcula configuraciones óptimas de timeouts y límites
- Genera archivos de configuración y variables de entorno
- Crea un informe detallado de optimizaciones

**Uso:**
```bash
npm run optimize
# o
ts-node optimize-performance.ts
```

**Salidas:**
- `optimization-config.json`: Configuración optimizada en formato JSON
- `optimization-report.json`: Informe completo con análisis y recomendaciones
- `.env.optimized`: Archivo de variables de entorno optimizadas

### 2. `apply-optimizations.ts`

Script que aplica las optimizaciones directamente a los archivos de configuración de los servicios.

**Funcionalidades:**
- Actualiza archivos `.env` de los servicios con valores optimizados
- Preserva configuraciones existentes
- Modo dry-run para revisar cambios antes de aplicarlos

**Uso:**
```bash
# Aplicar optimizaciones
ts-node apply-optimizations.ts

# Modo dry-run (solo mostrar qué se cambiaría)
ts-node apply-optimizations.ts --dry-run
```

## Optimizaciones Aplicadas

### Timeouts

- **Timeout del Proveedor**: Reducido de 10s a 7s
  - Mejora el throughput teórico de ~6 a ~8.5 requests/segundo por worker
  - Reduce latencia promedio

- **Timeout Total**: Reducido de 15s a 12s
  - Alineado con el nuevo timeout del proveedor

- **Timeout de Almacenamiento**: Mantenido en 2s
  - Valor óptimo para operaciones de almacenamiento rápido

### Límites Operativos

- **Límite Diario de Handoffs**: Aumentado según recursos disponibles
  - Base: 100 handoffs/día
  - Con memoria >= 8GB: 150 handoffs/día

- **Límite de Usuarios Concurrentes**: Aumentado según recursos
  - Base: 10 usuarios concurrentes
  - Con memoria >= 8GB: 15 usuarios concurrentes
  - Máximo: 20 usuarios concurrentes

### Configuración de Node.js

- **Memoria Máxima del Heap**: Calculada dinámicamente
  - 80% de la memoria disponible del sistema
  - Mínimo: 2GB
  - Se aplica mediante `NODE_OPTIONS=--max-old-space-size=<MB>`

## Proceso de Optimización

### Paso 1: Análisis

Ejecutar el script de optimización para analizar el sistema:

```bash
cd scripts/performance
npm run optimize
```

### Paso 2: Revisión

Revisar los archivos generados:
- `optimization-report.json`: Informe completo
- `optimization-config.json`: Configuración calculada
- `.env.optimized`: Variables de entorno sugeridas

### Paso 3: Aplicación

Aplicar las optimizaciones a los servicios:

```bash
# Primero en modo dry-run para revisar
ts-node apply-optimizations.ts --dry-run

# Luego aplicar realmente
ts-node apply-optimizations.ts
```

### Paso 4: Reinicio

Reiniciar los servicios para aplicar los cambios:

```bash
# Para WhatsApp Edge
cd ../../services/whatsapp-edge
npm run dev  # o el comando de inicio apropiado

# Para Core
cd ../../core
npm run dev  # o el comando de inicio apropiado
```

### Paso 5: Monitoreo

Monitorear las métricas después de aplicar las optimizaciones:

- **Latencia p95 del proveedor**: Debe mantenerse o mejorar
- **Tasa de timeouts**: Debe reducirse o mantenerse estable
- **Throughput**: Debe aumentar
- **Uso de memoria**: Debe ser más eficiente

## Métricas Clave a Monitorear

### Antes de la Optimización

- Latencia p95 del proveedor
- Tasa de timeouts del proveedor
- Throughput (requests/segundo)
- Uso de memoria del proceso Node.js
- Tasa de errores

### Después de la Optimización

Comparar las mismas métricas para validar las mejoras:

- ✅ Throughput aumentado
- ✅ Latencia reducida o mantenida
- ✅ Tasa de timeouts reducida o mantenida
- ✅ Uso de memoria más eficiente
- ✅ Tasa de errores estable o mejorada

## Variables de Entorno Optimizadas

Las siguientes variables se configuran automáticamente:

```bash
# Timeouts
PROVIDER_TIMEOUT_MS=7000
WAM_STORAGE_TIMEOUT_MS=2000
WAM_TOTAL_TIMEOUT_MS=12000

# Límites Operativos
OPERATIONAL_MAX_HANDOFFS_PER_DAY=150  # Ajustado según recursos
OPERATIONAL_MAX_CONCURRENT_USERS=15   # Ajustado según recursos
OPERATIONAL_FAILURE_THRESHOLD_PERCENT=20
OPERATIONAL_FAILURE_WINDOW_MS=3600000

# Node.js
NODE_OPTIONS=--max-old-space-size=<calculado>
```

## Troubleshooting

### Error: "No se pudo obtener la versión de Node.js"

El script continuará funcionando, pero la versión aparecerá como "unknown". Verificar que Node.js esté en el PATH.

### Los cambios no se aplican

1. Verificar que los archivos `.env` existan o que el script tenga permisos para crearlos
2. Verificar que los servicios se hayan reiniciado después de aplicar cambios
3. Verificar que las variables de entorno se estén leyendo correctamente

### Rendimiento no mejora

1. Revisar el informe de optimización para verificar que las configuraciones sean apropiadas
2. Verificar que no haya otros cuellos de botella (red, base de datos, etc.)
3. Ajustar manualmente los parámetros según observaciones específicas

## Notas Importantes

- ⚠️ **Backup**: Hacer backup de archivos `.env` antes de aplicar optimizaciones
- ⚠️ **Producción**: Revisar cuidadosamente los cambios antes de aplicar en producción
- ⚠️ **Monitoreo**: Monitorear de cerca después de aplicar optimizaciones
- ⚠️ **Rollback**: Mantener los valores anteriores para poder revertir si es necesario

## Referencias

- [Análisis de Cuellos de Botella](../performance/bottleneck_report.json)
- [Documentación del Core](../../core/README.md)
- [Documentación de WhatsApp Edge](../../services/whatsapp-edge/README.md)

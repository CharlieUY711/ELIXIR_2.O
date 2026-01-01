# Fase 7.1: Evaluación de Necesidades de Escalabilidad

## Objetivo

Analizar el sistema actual para comprender sus capacidades y limitaciones en cuanto a escalabilidad. Esto incluye la recopilación de datos sobre el rendimiento del sistema, la identificación de cuellos de botella, y la estimación de la carga futura.

## Estado

**Fecha de inicio**: Pendiente  
**Fecha de finalización**: Pendiente  
**Estado actual**: En evaluación

---

## 1. Recopilación de Datos de Rendimiento

### 1.1. Monitoreo de Recursos Actuales

#### Servidores y Procesos

**Componentes identificados**:
- **Elixir Core**: Servicio de autorización (Node.js/TypeScript)
- **WhatsApp Edge**: Servicio de handoffs (Node.js/TypeScript)
- **Catálogo Frontend**: Aplicación React/Vite (estático)
- **Chat Orchestrator**: Orquestación transaccional (pendiente de implementación)

**Métricas a recopilar**:
- CPU: Uso porcentual, frecuencia, número de cores
- Memoria: Total, usado, disponible, swap
- Disco: Espacio total, usado, disponible, I/O
- Red: Tráfico RX/TX, paquetes, errores, latencia
- Procesos: PID, uso de recursos, uptime

**Scripts disponibles**:
- `scripts/performance_analysis.py`: Análisis exhaustivo de rendimiento
- `scripts/performance/analyze-performance.ts`: Análisis TypeScript/Node.js
- `scripts/identify_bottlenecks.py`: Identificación de cuellos de botella

#### Bases de Datos y Almacenamiento

**Estado actual**:
- **TempStore**: In-memory (InMemoryTempStore) - No persistente
- **KillSwitch**: Persistente en archivo local
- **Base de datos de usuarios/modelos**: No implementada aún

**Limitaciones identificadas**:
- TempStore in-memory limita escalabilidad horizontal
- Pérdida de datos en reinicios del servicio
- Sin persistencia de handoffs más allá de TTL
- Sin base de datos centralizada

**Métricas a recopilar**:
- Tamaño de almacenamiento en memoria
- Número de handoffs activos
- Tiempo de limpieza de TTL
- Tasa de pérdida de datos en reinicios

#### Red y Conectividad

**Componentes de red**:
- Endpoints HTTP del WhatsApp Edge (puerto 3002)
- Comunicación con proveedor de WhatsApp (Twilio)
- Rate limiting implementado (10 resoluciones/min, 5 creaciones/min)

**Métricas a recopilar**:
- Latencia de endpoints HTTP
- Tiempo de respuesta del proveedor
- Tasa de errores de red
- Throughput de requests
- Conexiones concurrentes

### 1.2. Análisis de Logs de Rendimiento

#### Logs Estructurados

**Componentes con logging**:
- **Elixir Core**: Logs internos (Logger), eventos de auditoría (AuditRecorder)
- **WhatsApp Edge**: Logs estructurados JSON (ConsoleObservability)

**Eventos registrados**:
- `AUTH_REQUEST_RECEIVED`: Request recibido en Core
- `AUTH_DECISION_ALLOW`: Decisión ALLOW emitida
- `AUTH_DECISION_DENY`: Decisión DENY emitida
- `AUTH_STRESS_PRESSURE`: Sistema bajo presión
- `AUTH_ERROR`: Error en autorización
- `handoff_created`: Handoff creado
- `handoff_redeemed`: Handoff resuelto
- `handoff_expired`: Handoff expirado
- `handoff_revoked`: Handoff revocado

**Métricas agregadas**:
- `authorize_total`: Total de requests de autorización
- `authorize_allow`: Total de decisiones ALLOW
- `authorize_deny`: Total de decisiones DENY
- `authorize_error`: Total de errores
- `authorize_timeout`: Total de timeouts
- `handoffs_created_total`: Total de handoffs creados
- `handoffs_resolved_total`: Total de handoffs resueltos
- `handoffs_expired_total`: Total de handoffs expirados
- `handoff_resolution_duration_ms`: Tiempo de resolución

**Análisis requerido**:
- Patrones de uso por hora/día
- Picos de tráfico
- Tasa de errores por componente
- Latencia p50, p95, p99
- Correlación entre eventos

### 1.3. Simulación de Cargas de Trabajo

#### Escenarios de Carga

**Escenario 1: Carga Normal**
- 10 usuarios simultáneos
- 100 handoffs diarios
- 1000 requests de autorización diarios
- Distribución uniforme durante 8 horas

**Escenario 2: Carga Media**
- 50 usuarios simultáneos
- 500 handoffs diarios
- 5000 requests de autorización diarios
- Picos durante horas pico (2 horas)

**Escenario 3: Carga Alta**
- 200 usuarios simultáneos
- 2000 handoffs diarios
- 20000 requests de autorización diarios
- Picos sostenidos durante 4 horas

**Escenario 4: Carga Extrema**
- 1000 usuarios simultáneos
- 10000 handoffs diarios
- 100000 requests de autorización diarios
- Carga sostenida durante 8 horas

#### Métricas de Simulación

**Métricas a medir**:
- Throughput (requests/segundo)
- Latencia (p50, p95, p99)
- Tasa de errores
- Uso de recursos (CPU, memoria, disco, red)
- Degradación de servicio
- Punto de saturación

**Herramientas**:
- Script de simulación de carga (pendiente de crear)
- Análisis de resultados con scripts existentes

---

## 2. Identificación de Cuellos de Botella

### 2.1. Cuellos de Botella Identificados

#### BOTTLENECK-001: Elixir Core - Pipeline de Reglas

**Ubicación**: `core/src/rules/Pipeline.ts`  
**Tipo**: CPU/Procesamiento  
**Criticidad**: ALTA

**Descripción**:
El pipeline de evaluación de reglas ejecuta todas las etapas de forma secuencial y síncrona. Con múltiples reglas, esto puede convertirse en un cuello de botella significativo.

**Síntomas**:
- Latencia creciente en `authorize()` con múltiples reglas
- Alto consumo de CPU durante picos de tráfico
- Tiempo de respuesta proporcional al número de reglas

**Impacto estimado**:
- Latencia adicional por regla: 5-15ms
- Escalabilidad: Lineal negativa con número de reglas
- Punto crítico: >10 reglas activas simultáneamente

**Recomendaciones**:
1. Implementar evaluación paralela de reglas independientes
2. Cachear resultados de reglas deterministas cuando sea posible
3. Implementar short-circuit más agresivo en reglas DENY
4. Considerar evaluación lazy de reglas costosas

#### BOTTLENECK-002: WhatsApp Edge - TempStore In-Memory

**Ubicación**: `services/whatsapp-edge/src/storage/InMemoryTempStore.ts`  
**Tipo**: Memoria/Escalabilidad  
**Criticidad**: ALTA

**Descripción**:
El TempStore actual es in-memory, lo que limita la escalabilidad horizontal y puede causar pérdida de datos en reinicios. Además, la limpieza de TTL puede ser costosa con muchos handoffs activos.

**Síntomas**:
- Consumo de memoria creciente con handoffs activos
- Pérdida de handoffs en reinicios del servicio
- Limpieza de TTL bloqueante o costosa
- Imposibilidad de escalar horizontalmente

**Impacto estimado**:
- Memoria por handoff: ~1KB
- Límite estimado: ~10,000 handoffs activos antes de problemas de memoria
- Tiempo de limpieza TTL: O(n) donde n = handoffs activos

**Recomendaciones**:
1. Migrar a Redis o base de datos con TTL nativo
2. Implementar limpieza asíncrona de TTL
3. Considerar particionamiento de handoffs por timestamp
4. Implementar límite máximo de handoffs activos

#### BOTTLENECK-003: WhatsApp Edge - Timeout del Proveedor

**Ubicación**: `services/whatsapp-edge/src/sender/`  
**Tipo**: I/O/Red  
**Criticidad**: MEDIA

**Descripción**:
El timeout del proveedor está configurado en 10 segundos, lo que puede mantener conexiones abiertas durante mucho tiempo y limitar el throughput del sistema.

**Síntomas**:
- Conexiones HTTP abiertas por hasta 10 segundos
- Throughput limitado por tiempo de espera
- Acumulación de requests en espera durante fallas del proveedor

**Impacto estimado**:
- Timeout actual: 10000ms
- Throughput máximo teórico: ~6 requests/segundo por worker (con timeout de 10s)
- Tiempo perdido en fallos: Hasta 10s por request fallido

**Recomendaciones**:
1. Reducir timeout a 5-7 segundos si el proveedor lo permite
2. Implementar circuit breaker para fallas repetidas
3. Considerar timeouts diferenciados por tipo de operación
4. Monitorear latencia p95 del proveedor para ajustar timeout

#### BOTTLENECK-004: Elixir Core - Stress Detection

**Ubicación**: `core/src/stress/StressDetector.ts`  
**Tipo**: CPU/Procesamiento  
**Criticidad**: MEDIA

**Descripción**:
La detección de estrés se ejecuta en cada request y puede involucrar cálculos que añaden latencia al flujo crítico de autorización.

**Síntomas**:
- Latencia adicional en cada `authorize()`
- Consumo de CPU para cálculos de estrés
- Posible bloqueo si el cálculo es costoso

**Impacto estimado**:
- Latencia adicional: 2-5ms por request
- Frecuencia: 100% de los requests
- Costo acumulado: Significativo en alto volumen

**Recomendaciones**:
1. Optimizar algoritmo de detección de estrés
2. Considerar evaluación periódica en lugar de por-request
3. Cachear resultados de detección por ventana de tiempo
4. Mover detección a proceso separado si es necesario

#### BOTTLENECK-005: Elixir Core - Validaciones Síncronas

**Ubicación**: `core/src/runtime/validator.ts`  
**Tipo**: CPU/Procesamiento  
**Criticidad**: BAJA

**Descripción**:
Todas las validaciones (schema, deadlines, límites) se ejecutan de forma síncrona y secuencial, lo que puede añadir latencia acumulada.

**Síntomas**:
- Latencia en validación de requests complejos
- Validación de deadlines en cada request
- Validación de schema con objetos grandes

**Impacto estimado**:
- Latencia de validación: 1-3ms por request
- Impacto relativo: Bajo comparado con otros cuellos
- Mejora potencial: 10-20% de reducción de latencia

**Recomendaciones**:
1. Optimizar validación de schema (usar validadores más eficientes)
2. Validar deadlines solo cuando sea necesario
3. Considerar validación temprana de campos críticos
4. Implementar validación incremental cuando sea posible

### 2.2. Análisis por Componente

#### Elixir Core

**Cuellos identificados**: 3  
**Impacto total**: ALTO

**Componentes afectados**:
- Pipeline de Reglas
- Stress Detection
- Validaciones

**Recomendación general**: El Core requiere optimización del pipeline y evaluación de estrés para mejorar throughput.

#### WhatsApp Edge

**Cuellos identificados**: 2  
**Impacto total**: ALTO

**Componentes afectados**:
- TempStore
- Timeout del Proveedor

**Recomendación general**: Migración de TempStore a solución persistente es crítica para escalabilidad.

#### Chat Orchestrator

**Cuellos identificados**: 0  
**Impacto total**: BAJO

**Nota**: No se identificaron cuellos de botella específicos en esta fase de análisis (pendiente de implementación).

#### Catálogo Frontend

**Cuellos identificados**: 0  
**Impacto total**: BAJO

**Nota**: Frontend estático, no se identificaron cuellos de botella en esta fase.

---

## 3. Puntos Débiles y Áreas de Mejora

### 3.1. Arquitectura

**Puntos débiles**:
1. **Falta de escalabilidad horizontal**: TempStore in-memory impide escalado horizontal
2. **Sin persistencia de estado**: Pérdida de datos en reinicios
3. **Monolitos acoplados**: Componentes con dependencias fuertes
4. **Sin balanceador de carga**: No hay distribución de carga entre instancias

**Áreas de mejora**:
1. Migrar a arquitectura distribuida con almacenamiento compartido
2. Implementar persistencia de estado crítico
3. Desacoplar componentes mediante interfaces claras
4. Implementar balanceador de carga y auto-scaling

### 3.2. Infraestructura

**Puntos débiles**:
1. **Sin base de datos centralizada**: No hay persistencia de usuarios/modelos
2. **Sin sistema de caché**: No hay caché de resultados frecuentes
3. **Sin CDN**: Frontend estático sin distribución geográfica
4. **Sin monitoreo centralizado**: Logs y métricas dispersos

**Áreas de mejora**:
1. Implementar base de datos para persistencia
2. Implementar sistema de caché (Redis, Memcached)
3. Configurar CDN para frontend
4. Implementar sistema de monitoreo centralizado (Prometheus, Grafana)

### 3.3. Rendimiento

**Puntos débiles**:
1. **Procesamiento síncrono**: Muchas operaciones bloqueantes
2. **Sin paralelización**: Evaluación secuencial de reglas
3. **Timeouts largos**: Conexiones abiertas por mucho tiempo
4. **Sin optimización de consultas**: Sin índices ni optimizaciones

**Áreas de mejora**:
1. Implementar procesamiento asíncrono donde sea posible
2. Paralelizar evaluación de reglas independientes
3. Optimizar timeouts según latencia real
4. Implementar índices y optimizaciones de consultas

### 3.4. Observabilidad

**Puntos débiles**:
1. **Logs dispersos**: Sin agregación centralizada
2. **Métricas limitadas**: Solo métricas básicas
3. **Sin alertas proactivas**: Sin sistema de alertas
4. **Sin trazabilidad distribuida**: Sin correlación de requests

**Áreas de mejora**:
1. Implementar agregación centralizada de logs (ELK, Loki)
2. Expandir métricas con sistema de métricas dedicado
3. Implementar sistema de alertas (PagerDuty, Opsgenie)
4. Implementar trazabilidad distribuida (Jaeger, Zipkin)

---

## 4. Requisitos de Escalabilidad

### 4.1. Requisitos Funcionales

#### Capacidad de Usuarios

**Actual**:
- Usuarios simultáneos: 10 (límite operativo)
- Handoffs diarios: 100 (límite operativo)
- Requests de autorización diarios: ~1000

**Objetivo a corto plazo (3 meses)**:
- Usuarios simultáneos: 100
- Handoffs diarios: 1,000
- Requests de autorización diarios: 10,000

**Objetivo a medio plazo (6 meses)**:
- Usuarios simultáneos: 500
- Handoffs diarios: 5,000
- Requests de autorización diarios: 50,000

**Objetivo a largo plazo (12 meses)**:
- Usuarios simultáneos: 2,000
- Handoffs diarios: 20,000
- Requests de autorización diarios: 200,000

#### Latencia

**Actual**:
- Latencia p50 de `authorize()`: 5-50ms (depende de reglas)
- Latencia p95 de `authorize()`: 50-200ms
- Latencia p99 de `authorize()`: 100-500ms
- Latencia de handoff: 100-500ms

**Objetivo**:
- Latencia p50 de `authorize()`: < 10ms
- Latencia p95 de `authorize()`: < 50ms
- Latencia p99 de `authorize()`: < 100ms
- Latencia de handoff: < 200ms (p95)

#### Disponibilidad

**Actual**:
- Disponibilidad estimada: 95% (GO CONTROLADO)
- Sin redundancia
- Pérdida de datos en reinicios

**Objetivo**:
- Disponibilidad: 99.9% (3 nines)
- Redundancia en componentes críticos
- Sin pérdida de datos en reinicios

### 4.2. Requisitos No Funcionales

#### Escalabilidad Horizontal

**Requisitos**:
1. Sistema debe poder escalar horizontalmente agregando instancias
2. Estado compartido debe estar en almacenamiento externo
3. Sin dependencias de estado local entre instancias
4. Balanceador de carga debe distribuir tráfico equitativamente

**Acciones requeridas**:
1. Migrar TempStore a Redis o base de datos compartida
2. Implementar balanceador de carga
3. Eliminar dependencias de estado local
4. Implementar auto-scaling basado en métricas

#### Escalabilidad Vertical

**Requisitos**:
1. Sistema debe poder manejar más carga en la misma instancia
2. Optimización de uso de recursos
3. Procesamiento eficiente de requests

**Acciones requeridas**:
1. Optimizar pipeline de reglas
2. Implementar procesamiento paralelo
3. Optimizar uso de memoria y CPU
4. Implementar caché de resultados

#### Resiliencia

**Requisitos**:
1. Sistema debe recuperarse automáticamente de fallas
2. Sin pérdida de datos en fallas
3. Degradación gradual en lugar de falla total
4. Circuit breakers para servicios externos

**Acciones requeridas**:
1. Implementar reintentos automáticos
2. Persistencia de estado crítico
3. Implementar circuit breakers
4. Implementar health checks y auto-recuperación

#### Observabilidad

**Requisitos**:
1. Métricas en tiempo real de todos los componentes
2. Logs agregados y buscables
3. Alertas proactivas de problemas
4. Trazabilidad de requests end-to-end

**Acciones requeridas**:
1. Implementar sistema de métricas (Prometheus)
2. Implementar agregación de logs (ELK/Loki)
3. Implementar sistema de alertas
4. Implementar trazabilidad distribuida

### 4.3. Requisitos de Infraestructura

#### Almacenamiento

**Requisitos actuales**:
- TempStore: In-memory (1-10GB estimado)
- KillSwitch: Archivo local (< 1MB)
- Logs: Consola (sin persistencia)

**Requisitos futuros**:
- TempStore: Redis o base de datos con TTL (10-100GB)
- Base de datos de usuarios/modelos: Base de datos relacional o NoSQL (100GB-1TB)
- Logs: Sistema de logs centralizado (100GB-1TB)
- Backup: Sistema de backup automático

#### Red

**Requisitos actuales**:
- Ancho de banda: < 1 Mbps
- Latencia: < 100ms (local)
- Throughput: < 10 requests/segundo

**Requisitos futuros**:
- Ancho de banda: 10-100 Mbps
- Latencia: < 50ms (p95)
- Throughput: 100-1000 requests/segundo

#### Computación

**Requisitos actuales**:
- CPU: 2-4 cores
- Memoria: 4-8 GB
- Disco: 20-50 GB

**Requisitos futuros**:
- CPU: 4-16 cores (por instancia)
- Memoria: 8-32 GB (por instancia)
- Disco: 100-500 GB (por instancia)
- Auto-scaling: 2-10 instancias según carga

---

## 5. Plan de Acción

### 5.1. Fase 1: Monitoreo y Medición (Semanas 1-2)

**Objetivos**:
- Implementar monitoreo exhaustivo de recursos
- Recopilar métricas de rendimiento actuales
- Establecer baseline de rendimiento

**Acciones**:
1. Ejecutar scripts de monitoreo existentes
2. Configurar recopilación continua de métricas
3. Analizar logs de rendimiento
4. Documentar métricas actuales

**Entregables**:
- Reporte de métricas actuales
- Baseline de rendimiento
- Identificación de métricas faltantes

### 5.2. Fase 2: Simulación de Carga (Semanas 3-4)

**Objetivos**:
- Simular cargas de trabajo representativas
- Identificar puntos de saturación
- Medir degradación de servicio

**Acciones**:
1. Crear scripts de simulación de carga
2. Ejecutar escenarios de carga normal, media, alta y extrema
3. Analizar resultados de simulación
4. Identificar límites del sistema actual

**Entregables**:
- Reporte de simulación de carga
- Identificación de límites del sistema
- Recomendaciones de capacidad

### 5.3. Fase 3: Análisis y Documentación (Semanas 5-6)

**Objetivos**:
- Analizar cuellos de botella identificados
- Documentar puntos débiles
- Establecer requisitos de escalabilidad

**Acciones**:
1. Analizar resultados de monitoreo y simulación
2. Priorizar cuellos de botella
3. Documentar áreas de mejora
4. Establecer requisitos de escalabilidad

**Entregables**:
- Documento de evaluación de escalabilidad (este documento)
- Análisis de cuellos de botella
- Requisitos de escalabilidad

### 5.4. Fase 4: Planificación de Mejoras (Semanas 7-8)

**Objetivos**:
- Planificar mejoras de escalabilidad
- Priorizar acciones según impacto
- Estimar recursos necesarios

**Acciones**:
1. Priorizar mejoras según impacto y esfuerzo
2. Estimar recursos necesarios
3. Crear plan de implementación
4. Documentar dependencias y riesgos

**Entregables**:
- Plan de mejoras de escalabilidad
- Estimación de recursos
- Cronograma de implementación

---

## 6. Métricas y KPIs

### 6.1. Métricas de Rendimiento

**Métricas clave**:
- Throughput: Requests por segundo
- Latencia: p50, p95, p99
- Tasa de errores: Errores por total de requests
- Disponibilidad: Tiempo de actividad / tiempo total

**Objetivos**:
- Throughput: > 100 requests/segundo
- Latencia p95: < 50ms
- Tasa de errores: < 0.1%
- Disponibilidad: > 99.9%

### 6.2. Métricas de Recursos

**Métricas clave**:
- CPU: Uso porcentual promedio y pico
- Memoria: Uso en GB y porcentual
- Disco: Uso en GB y porcentual
- Red: Throughput en Mbps

**Objetivos**:
- CPU: < 70% promedio, < 90% pico
- Memoria: < 80% de uso
- Disco: < 80% de uso
- Red: Sin saturación

### 6.3. Métricas de Escalabilidad

**Métricas clave**:
- Capacidad de usuarios simultáneos
- Capacidad de handoffs diarios
- Capacidad de requests diarios
- Factor de escalabilidad horizontal

**Objetivos**:
- Escalabilidad horizontal: Factor 1:10 (1 instancia → 10 instancias)
- Capacidad de usuarios: 2,000 simultáneos
- Capacidad de handoffs: 20,000 diarios
- Capacidad de requests: 200,000 diarios

---

## 7. Riesgos y Mitigaciones

### 7.1. Riesgos Técnicos

**Riesgo 1: Pérdida de datos durante migración**
- **Mitigación**: Implementar migración gradual, mantener ambos sistemas durante transición

**Riesgo 2: Degradación de seguridad al optimizar**
- **Mitigación**: Mantener fail-closed absoluto, no relajar validaciones críticas

**Riesgo 3: Aumento de complejidad con evaluación paralela**
- **Mitigación**: Mantener tests exhaustivos, documentar cambios, validar determinismo

### 7.2. Riesgos Operativos

**Riesgo 1: Falta de recursos para implementar mejoras**
- **Mitigación**: Priorizar mejoras según impacto, implementar en fases

**Riesgo 2: Interrupciones durante implementación**
- **Mitigación**: Implementar mejoras en horarios de bajo tráfico, mantener rollback plan

**Riesgo 3: Falta de monitoreo durante transición**
- **Mitigación**: Implementar monitoreo antes de cambios, mantener alertas activas

---

## 8. Próximos Pasos

1. **Ejecutar monitoreo exhaustivo** (Fase 5.1)
   - Ejecutar scripts de monitoreo
   - Recopilar métricas durante 1-2 semanas
   - Establecer baseline

2. **Simular cargas de trabajo** (Fase 5.2)
   - Crear scripts de simulación
   - Ejecutar escenarios de carga
   - Analizar resultados

3. **Validar cuellos de botella** (Fase 5.3)
   - Validar cuellos identificados con datos reales
   - Priorizar según impacto medido
   - Documentar hallazgos

4. **Planificar mejoras** (Fase 5.4)
   - Crear plan de implementación
   - Estimar recursos necesarios
   - Definir cronograma

---

## 9. Referencias

- [Análisis de Cuellos de Botella](./scripts/performance/bottleneck_report.json)
- [Scripts de Performance](./scripts/README.md)
- [Arquitectura del Sistema](./README_ARQUITECTURA_ELIXIR.md)
- [Documentación del Core](./core/README.md)
- [Documentación del WhatsApp Edge](./services/whatsapp-edge/README.md)

---

## 10. Historial de Cambios

| Fecha | Versión | Cambios | Autor |
|-------|---------|---------|-------|
| 2024-XX-XX | 1.0 | Creación inicial del documento | Sistema |

---

**Nota**: Este documento es un documento vivo que se actualizará conforme se recopilen más datos y se identifiquen nuevos cuellos de botella o áreas de mejora.


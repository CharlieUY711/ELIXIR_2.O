# FASE 5.2 — MODELO CANÓNICO DE EVIDENCIA MÍNIMA

**Fecha**: 2025-01-XX  
**Bloque**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada  
**Fase**: 5.2  
**Estado**: CANÓNICO  
**Versión**: 1.0

---

## 1. Contexto Canónico

### 1.1. Relación con FASE 5.1

Este documento define el **MODELO CANÓNICO DE EVIDENCIA MÍNIMA** asociado a los eventos observables establecidos en **FASE 5.1 (Marco de Eventos Observables)**.

La FASE 5.1 define **qué eventos son observables** en Elixir.  
La FASE 5.2 define **qué constituye evidencia válida** de esos eventos.

### 1.2. Principios Fundamentales

Este modelo se fundamenta en:

- **Política D0 cerrada**: Elixir NO es custodio de datos personales
- **Elixir Core sellado**: El Core es inmodificable y no expone razones
- **BLOQUE 5 pasivo**: La observabilidad es estrictamente no operativa
- **Independencia de ejecución**: La evidencia no afecta el comportamiento del sistema

### 1.3. Alcance del Documento

Este documento es **conceptual y normativo**. Define:

- Qué se entiende por "evidencia mínima" en Elixir
- Qué información constituye evidencia válida
- Qué información está explícitamente prohibida
- Principios normativos del modelo de evidencia

**Este documento NO define**:
- Mecanismos de almacenamiento o retención
- Formatos técnicos (JSON, tablas, logs, etc.)
- Sistemas de auditoría activa o en tiempo real
- Herramientas o implementaciones específicas

---

## 2. Definición Formal de Evidencia Mínima

### 2.1. Definición

**Evidencia Mínima** es la información mínima necesaria e suficiente para:

1. **Confirmar la ocurrencia** de un evento observable definido en FASE 5.1
2. **Establecer el momento** en que el evento ocurrió
3. **Identificar el contexto técnico** del evento sin exponer datos sensibles
4. **Permitir trazabilidad** sin permitir reconstrucción de decisiones o inferencias de intención

### 2.2. Características Fundamentales

La evidencia mínima debe cumplir:

- **Minimalidad**: Contiene solo lo estrictamente necesario
- **Inmutabilidad conceptual**: Una vez establecida, no puede modificarse
- **Independencia**: No depende de datos externos ni de estado del sistema
- **Pasividad**: No afecta la ejecución ni el comportamiento del sistema
- **Neutralidad**: No expone razones, decisiones ni intenciones

---

## 3. Componentes Conceptuales Permitidos

### 3.1. Identificadores Técnicos

**Permitido**:
- Identificadores técnicos de eventos (event_id, trace_id)
- Identificadores técnicos de sesiones (session_id, attempt_id)
- Identificadores técnicos de componentes (component_name, gate_name)

**Restricción**: Los identificadores deben ser opacos y no permitir correlación con datos personales.

### 3.2. Marcas Temporales

**Permitido**:
- Timestamp canónico del evento (ISO 8601 o equivalente)
- Duración de operaciones técnicas (latency_ms, timeout_duration)
- Referencias temporales relativas (time_since_start, elapsed_time)

**Restricción**: Las marcas temporales no deben permitir inferir patrones de uso individual ni correlacionar con actividad externa.

### 3.3. Tipos de Eventos

**Permitido**:
- Tipo canónico del evento observable (event_type)
- Categoría del evento (event_category: REQUEST, DECISION, CONTROL, ERROR)
- Estado resultante del evento (result_state: ALLOW, DENY, PENDING, FAILED)

**Restricción**: Los tipos de eventos deben ser valores cerrados y predefinidos. No pueden contener razones ni explicaciones.

### 3.4. Códigos de Razón Genéricos

**Permitido**:
- Códigos de razón genéricos y predefinidos (reason_code)
- Códigos de error técnicos (error_code, error_type)
- Códigos de estado de componentes (component_status)

**Restricción**: Los códigos deben ser valores cerrados y no descriptivos. No pueden explicar por qué ocurrió el evento, solo clasificarlo técnicamente.

### 3.5. Métricas Agregadas

**Permitido**:
- Contadores agregados (event_count, total_requests)
- Métricas técnicas agregadas (average_latency, error_rate)
- Señales técnicas agregadas (stress_level, system_pressure)

**Restricción**: Las métricas deben ser agregadas y no desagregadas por usuario, sesión individual o contexto específico.

### 3.6. Estados de Componentes

**Permitido**:
- Estado técnico de componentes (gate_state, storage_status)
- Estado de operación (killswitch_active, limits_exceeded)
- Estado de disponibilidad (component_available, service_healthy)

**Restricción**: Los estados deben ser técnicos y no deben exponer decisiones ni razones operativas.

---

## 4. Componentes Explícitamente Prohibidos

### 4.1. Datos Personales Identificables (PII)

**Prohibido**:
- Números de teléfono en cualquier formato
- Direcciones de correo electrónico
- Nombres reales o pseudónimos
- Identificadores que permitan correlación con personas
- Cualquier dato que permita identificar a un individuo

**Principio**: La evidencia no puede contener PII bajo ninguna circunstancia. Esto es un invariante del modelo.

### 4.2. Payloads Externos

**Prohibido**:
- Contenido de mensajes de conversación
- Contenido de solicitudes HTTP
- Contenido de respuestas de proveedores externos
- Datos de entrada o salida de componentes externos
- Cualquier payload que cruce los límites del sistema

**Principio**: La evidencia no puede contener datos que provengan de fuentes externas o que crucen los límites del sistema.

### 4.3. Reconstrucción de Decisiones

**Prohibido**:
- Razones de decisiones del Core
- Reglas que se evaluaron
- Señales de Nectar o Stress que influyeron
- Contexto de evaluación de reglas
- Explicaciones de por qué se tomó una decisión
- Cualquier información que permita reconstruir la lógica decisional

**Principio**: La evidencia puede confirmar que ocurrió una decisión (ALLOW/DENY), pero no puede exponer por qué se tomó esa decisión.

### 4.4. Inferencias de Intención o Contexto

**Prohibido**:
- Patrones de uso individual
- Secuencias de eventos que revelen comportamiento
- Correlaciones temporales que expongan intención
- Contexto de operación que revele propósito
- Cualquier información que permita inferir intención del usuario o del sistema

**Principio**: La evidencia debe ser neutral y no permitir inferencias sobre intenciones, propósitos o contextos operativos.

### 4.5. Estados Internos del Core

**Prohibido**:
- Estados internos del Core no expuestos
- Configuración de reglas
- Parámetros de evaluación
- Señales internas (Nectar, Stress) en detalle
- Cualquier información que exponga la implementación interna

**Principio**: La evidencia no puede exponer la implementación interna del Core ni sus mecanismos de decisión.

### 4.6. Historiales o Secuencias Reconstruibles

**Prohibido**:
- Secuencias de eventos que permitan reconstruir flujos completos
- Historiales de sesiones individuales
- Trazas completas de operaciones
- Cualquier información que permita reconstruir el contexto completo de una operación

**Principio**: La evidencia debe ser puntual y no permitir reconstrucción de flujos o contextos completos.

---

## 5. Principios Normativos del Modelo de Evidencia

### 5.1. Principio de Minimalidad

**Enunciado**: La evidencia debe contener únicamente la información mínima necesaria para confirmar la ocurrencia de un evento observable.

**Aplicación**:
- No se incluye información redundante
- No se incluye información derivable
- No se incluye información "por si acaso"
- Cada componente de evidencia debe justificarse como necesario

### 5.2. Principio de Opacidad

**Enunciado**: Los identificadores y códigos en la evidencia deben ser opacos y no permitir correlación con datos externos o personales.

**Aplicación**:
- Los identificadores son técnicos y no descriptivos
- Los códigos son genéricos y no explicativos
- No se permite correlación con sistemas externos
- No se permite inferencia de identidad o contexto

### 5.3. Principio de Neutralidad

**Enunciado**: La evidencia no puede exponer razones, decisiones, intenciones ni explicaciones.

**Aplicación**:
- La evidencia confirma "qué" ocurrió, no "por qué"
- La evidencia clasifica técnicamente, no explica
- La evidencia es factual, no interpretativa
- La evidencia no juzga ni evalúa

### 5.4. Principio de Independencia

**Enunciado**: La evidencia debe ser independiente de la ejecución del sistema y no puede afectar su comportamiento.

**Aplicación**:
- La evidencia se genera de forma pasiva
- La evidencia no modifica el flujo de ejecución
- La evidencia no requiere estado persistente
- La evidencia no depende de servicios externos

### 5.5. Principio de Inmutabilidad Conceptual

**Enunciado**: Una vez establecida, la evidencia no puede modificarse ni corregirse.

**Aplicación**:
- La evidencia es un registro histórico inmutable
- No se permite corrección ni actualización
- No se permite anulación ni eliminación
- La evidencia es definitiva una vez generada

### 5.6. Principio de Agregación

**Enunciado**: Cuando sea posible, la evidencia debe ser agregada y no desagregada por entidad individual.

**Aplicación**:
- Las métricas son agregadas por período, no por usuario
- Los contadores son globales, no individuales
- Las señales son técnicas, no contextuales
- La evidencia no permite desagregación individual

### 5.7. Principio de Pasividad

**Enunciado**: La generación de evidencia es estrictamente pasiva y no operativa.

**Aplicación**:
- La evidencia no se usa para tomar decisiones
- La evidencia no se usa para modificar comportamiento
- La evidencia no se usa para alertas en tiempo real
- La evidencia es puramente observacional

---

## 6. Relación con Eventos Observables (FASE 5.1)

### 6.1. Correspondencia Canónica

Cada evento observable definido en FASE 5.1 tiene una **correspondencia canónica** con componentes de evidencia mínima:

- **Evento observable** → **Tipo de evento** (event_type)
- **Momento de ocurrencia** → **Marca temporal** (timestamp)
- **Contexto técnico** → **Identificadores técnicos** (trace_id, session_id)
- **Resultado técnico** → **Estado resultante** (result_state)
- **Clasificación técnica** → **Código de razón genérico** (reason_code)

### 6.2. Límites de la Evidencia

La evidencia mínima **NO puede**:

- Ampliar el alcance de los eventos observables
- Introducir nuevos eventos no definidos en FASE 5.1
- Agregar información no permitida por este modelo
- Violar los principios normativos establecidos

### 6.3. Coherencia con FASE 5.1

La evidencia mínima debe ser **coherente** con:

- El catálogo de eventos observables de FASE 5.1
- Los atributos permitidos de cada evento
- Los límites establecidos para cada tipo de evento
- La naturaleza pasiva y no operativa del BLOQUE 5

---

## 7. Ejemplos Conceptuales

### 7.1. Evidencia de Evento de Decisión

**Evento observable**: `AUTH_DECISION_ALLOW` (FASE 5.1)

**Evidencia mínima permitida**:
- `event_type: "AUTH_DECISION_ALLOW"`
- `timestamp: "2025-01-XXT10:30:00Z"`
- `trace_id: "opaque-technical-id-123"`
- `result_state: "ALLOW"`

**Evidencia prohibida**:
- Razón de la decisión
- Reglas evaluadas
- Señales de Nectar o Stress
- Datos del request
- Identidad del usuario

### 7.2. Evidencia de Evento de Control

**Evento observable**: `KILLSWITCH_ACTIVATED` (FASE 5.1)

**Evidencia mínima permitida**:
- `event_type: "KILLSWITCH_ACTIVATED"`
- `timestamp: "2025-01-XXT10:35:00Z"`
- `component_name: "killswitch"`
- `component_status: "ACTIVE"`
- `reason_code: "AUTO_TRIGGER"`

**Evidencia prohibida**:
- Razón específica de activación
- Eventos que causaron la activación
- Umbrales o configuraciones
- Impacto en usuarios o sesiones

### 7.3. Evidencia de Evento de Error

**Evento observable**: `AUTH_ERROR` (FASE 5.1)

**Evidencia mínima permitida**:
- `event_type: "AUTH_ERROR"`
- `timestamp: "2025-01-XXT10:40:00Z"`
- `trace_id: "opaque-technical-id-456"`
- `error_type: "VALIDATION_ERROR"`
- `error_code: "SCHEMA_INVALID"`

**Evidencia prohibida**:
- Mensaje de error detallado
- Stack trace o detalles técnicos
- Datos del request que causó el error
- Contexto de la operación fallida

---

## 8. Límites Explícitos del Modelo

### 8.1. Límites de Alcance

Este modelo **NO define**:

- **Mecanismos de almacenamiento**: No define dónde, cómo ni por cuánto tiempo se almacena la evidencia
- **Formatos técnicos**: No define si la evidencia es JSON, tablas, logs, eventos, etc.
- **Sistemas de retención**: No define políticas de retención, eliminación ni archivado
- **Herramientas de auditoría**: No define qué herramientas consumen o procesan la evidencia
- **Procesos de análisis**: No define cómo se analiza, agrega ni reporta la evidencia

### 8.2. Límites Operativos

Este modelo **NO permite**:

- **Auditoría activa**: No define procesos de auditoría en tiempo real
- **Alertas basadas en evidencia**: No define sistemas de alertas que usen la evidencia
- **Decisiones basadas en evidencia**: No permite que la evidencia influya en decisiones
- **Corrección de evidencia**: No permite modificar, corregir ni anular evidencia generada

### 8.3. Límites de Implementación

Este modelo **NO especifica**:

- **Dónde se genera la evidencia**: No define en qué componente o capa se genera
- **Cuándo se genera la evidencia**: No define el momento exacto de generación
- **Cómo se transmite la evidencia**: No define mecanismos de transmisión
- **Quién consume la evidencia**: No define consumidores ni destinatarios

---

## 9. Frase Canónica de Cierre

**El MODELO CANÓNICO DE EVIDENCIA MÍNIMA establece que la evidencia asociada a eventos observables en Elixir debe ser mínima, opaca, neutral, independiente, inmutable, agregada y pasiva. La evidencia confirma la ocurrencia de eventos técnicos sin exponer datos personales, payloads externos, razones de decisiones, intenciones, estados internos ni contextos reconstruibles. Este modelo es conceptual y normativo, y no define mecanismos de almacenamiento, formatos técnicos, sistemas de retención, herramientas de auditoría ni procesos de análisis. La evidencia es estrictamente observacional y no operativa, manteniendo total independencia de la ejecución del sistema y coherencia absoluta con la Política D0, el Elixir Core sellado y el carácter pasivo del BLOQUE 5.**

---

## 10. Estado y Registro

**Estado del documento**: CANÓNICO  
**Versión**: 1.0  
**Fecha de cierre**: 2025-01-XX  
**Registrado en**: Git (commit canónico)  
**Relación**: Coherente con FASE 5.1 (Marco de Eventos Observables)  
**Alcance**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada

---

**Fin del documento**


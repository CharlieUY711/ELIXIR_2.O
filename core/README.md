# Elixir Core - PR 6: audit & observability hardening

## Descripción

Estructura mínima del Elixir Core con garantía de fail-closed absoluto.

## Estructura

```
/core
  /src
    /domain
      decision.ts       # Enum Decision (ALLOW | DENY)
      request.ts        # AuthorizationRequest
      errors.ts         # Errores internos
    /runtime
      clock.ts          # Utilidad de tiempo
      deadline.ts       # Validación de deadlines
      guards.ts         # FailClosedGuard
      validator.ts      # Validación de requests
    /service
      authorize.ts      # Entrypoint único authorize()
    /rules
      Pipeline.ts       # Pipeline interno deny-only
      RuleStage.ts      # Interfaz para etapas
      RuleContext.ts   # Contexto de evaluación
      RuleResult.ts    # Resultado PASS | DENY | ALLOW
      /stages
        ExplicitAllowStage.ts  # Única regla explícita de ALLOW
    /obs
      metrics.ts        # Métricas internas
      logger.ts         # Logging seguro
    /audit
      AuditEvent.ts     # Tipo de eventos de auditoría
      AuditContext.ts   # Contexto de auditoría
      AuditRecorder.ts  # Grabador de eventos de auditoría
    /nectar
      NectarSignal.ts   # Tipo de señal interna
      NectarContext.ts  # Contexto interno de señal
      NectarCollector.ts # Colector de señal interna
    /stress
      StressMode.ts     # Tipo de modo de estrés
      StressContext.ts  # Contexto interno de estrés
      StressDetector.ts # Detector de estrés
  /tests
    authorize_fail_closed_exception.test.ts
    authorize_fail_closed_timeout.test.ts
    authorize_schema_missing_invalid.test.ts
    authorize_determinism.test.ts
    pipeline_short_circuit_deny.test.ts
    pipeline_exception_fail_closed.test.ts
    pipeline_empty_defaults_to_deny.test.ts
    explicit_allow_happy_path.test.ts
    explicit_allow_not_triggered_defaults_to_deny.test.ts
    explicit_allow_never_overrides_deny.test.ts
    explicit_allow_fail_closed.test.ts
    nectar_signal_is_computed.test.ts
    nectar_does_not_affect_decision.test.ts
    nectar_fail_closed.test.ts
    nectar_not_exposed.test.ts
    stress_mode_blocks_allow.test.ts
    stress_mode_normal_allows_flow.test.ts
    stress_mode_does_not_affect_pipeline_deny.test.ts
    stress_detector_deterministic.test.ts
    stress_fail_closed.test.ts
    audit_event_emitted_on_request.test.ts
    audit_event_emitted_on_allow.test.ts
    audit_event_emitted_on_deny.test.ts
    audit_event_emitted_on_stress.test.ts
    audit_event_emitted_on_error.test.ts
  /docs
    RUNBOOK_CORE.md     # Documentación operativa
  README.md
```

## Entrypoint

```typescript
import { authorize } from './src/service/authorize';

const decision = authorize(request);
// Retorna: Decision.ALLOW | Decision.DENY
```

## Principios

- **Fail-closed absoluto**: Cualquier error → DENY
- **Sin exposición**: No se exponen reglas, razones ni estados
- **Deadline obligatorio**: Requests sin deadline válido → DENY
- **Validación estricta**: Campos requeridos faltantes → DENY

## Rules Pipeline (internal)

Existe un pipeline interno de evaluación de reglas que permite denegaciones tempranas. Su función es permitir que las reglas nieguen solicitudes cuando corresponda, pero **no autoriza**. El Core permanece en estado default-deny: incluso si el pipeline no encuentra razones para denegar (retorna PASS), el Core igual retorna DENY.

## Explicit Allow Gate

Existe una única regla explícita de ALLOW implementada en `ExplicitAllowStage`. Esta regla es:
- **Técnica**: Condición simple y determinista (`request.action === 'ALLOW_TEST'`)
- **Mínima**: Implementación aislada y reversible
- **Sin exposición**: No expone razones, mensajes ni metadata
- **Fail-closed**: Cualquier error en la evaluación → DENY

El sistema mantiene **deny-by-default**: ALLOW solo puede ocurrir si:
1. El pipeline no niega (retorna PASS)
2. ExplicitAllowStage emite ALLOW explícitamente

**IMPORTANTE**: DENY del pipeline tiene prioridad absoluta sobre ALLOW explícito. Si el pipeline niega, el resultado es siempre DENY, independientemente de la condición de ExplicitAllowStage.

## Nectar (internal signal)

### 1. Definición

Nectar es una señal interna del Elixir Core. Es no decisional, no expuesta y no persistente.

Nectar no participa en la lógica de autorización. No influye en decisiones. No autoriza ni deniega. No se expone fuera del Core. No se persiste entre requests.

### 2. Propósito

Nectar permite observabilidad interna agregada. Prepara al Core para escenarios futuros relacionados con estrés, costo y presión del sistema. No participa en la lógica de autorización.

### 3. Modelo

NectarSignal es un tipo cerrado con tres valores: LOW, MEDIUM, HIGH. NectarContext transporta la señal internamente junto con el timestamp de cálculo.

No contiene valores numéricos. No contiene información de pricing. No contiene datos de usuario.

### 4. Integración en el flujo

El flujo de evaluación es:

Nectar → Stress → Validator → Deadline → Pipeline → Explicit Allow → Decision

Nectar se calcula al inicio. No altera ningún paso posterior. No condiciona ALLOW ni DENY. La decisión final es independiente de la señal Nectar.

### 5. Manejo de fallos

Si el cálculo de Nectar falla, el Core continúa la evaluación sin señal Nectar. El comportamiento decisional permanece intacto. La ausencia de Nectar no afecta el resultado de la autorización.

### 6. Exposición

Nectar no aparece en logs. No aparece en responses. No cruza capas del sistema. Solo se refleja en métricas agregadas internas.

## Stress & Abuse Modes

### 1. Definición

El Elixir Core opera en modos internos de estrés. Estos modos son mecanismos técnicos de protección del sistema.

### 2. Modos

Existen dos modos internos:
- **NORMAL**: El sistema opera en flujo normal
- **PRESSURE**: El sistema está bajo presión técnica

### 3. Comportamiento

Bajo presión, el sistema deniega todas las solicitudes. El modo PRESSURE deshabilita ALLOW. No importa si ExplicitAllowStage cumpliría su condición: bajo presión, el resultado es siempre DENY.

El modo de estrés no puede permitir ALLOW. Solo puede forzar DENY.

### 4. Detección

La detección de estrés es determinista y simple. Se basa en señales técnicas internas del sistema. No usa heurísticas opacas. No depende de servicios externos.

### 5. Reversibilidad

El sistema vuelve automáticamente a modo normal cuando las condiciones técnicas lo permiten. No requiere intervención manual. No se persiste estado de estrés entre requests.

### 6. Exposición

Los modos de estrés no se exponen fuera del Core. No aparecen en logs con razones. No cruzan capas del sistema. Solo se reflejan en métricas agregadas internas.

### 7. Integración en el flujo

El flujo de evaluación es:

Nectar → Stress → Validator → Deadline → Pipeline → Explicit Allow → Decision

Si StressMode es PRESSURE, el flujo se interrumpe y retorna DENY inmediatamente, saltando Validator, Deadline, Pipeline y Explicit Allow.

### 8. Manejo de fallos

Si la detección de estrés falla, el sistema asume PRESSURE y retorna DENY (fail-closed).

## Audit & Observability

### 1. Definición

El Elixir Core emite eventos de auditoría internos para observabilidad y control. Estos eventos no explican decisiones ni exponen razones.

### 2. Propósito

Los eventos de auditoría sirven para control interno, métricas agregadas y cumplimiento. No se exponen a capas externas del sistema.

### 3. Modelo

Los eventos de auditoría son tipos cerrados: AUTH_REQUEST_RECEIVED, AUTH_DECISION_ALLOW, AUTH_DECISION_DENY, AUTH_STRESS_PRESSURE, AUTH_ERROR.

Cada evento contiene traceId y timestamp. No contiene datos de request, PII ni decisiones detalladas.

### 4. Integración

Los eventos se registran en puntos clave del flujo de autorización:
- Al inicio de authorize(): AUTH_REQUEST_RECEIVED
- Antes de retornar ALLOW: AUTH_DECISION_ALLOW
- Antes de retornar DENY: AUTH_DECISION_DENY
- Cuando StressMode es PRESSURE: AUTH_STRESS_PRESSURE
- Cuando ocurre excepción: AUTH_ERROR

### 5. Observabilidad

Los eventos se reflejan en métricas agregadas internas (audit_event_count). No se persisten. No se loguean con texto explicativo.

### 6. Exposición

Los eventos de auditoría no se exponen fuera del Core. No aparecen en logs con razones. No cruzan capas del sistema. Solo se reflejan en métricas agregadas internas.

## Tests

Ejecutar tests obligatorios:
- Fail-closed por excepción
- Fail-closed por timeout
- Schema missing / invalid
- Determinismo

## Estado

PR 6 - Audit & observability hardening implementado. Se introducen eventos de auditoría internos que permiten observabilidad y control sin exponer razones ni decisiones detalladas. El sistema mantiene deny-by-default y fail-closed absoluto. Cada decisión es auditable internamente sin revelar por qué fue tomada.


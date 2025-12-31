# Elixir Core - PR 3: explicit allow gate (minimal)

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

## Tests

Ejecutar tests obligatorios:
- Fail-closed por excepción
- Fail-closed por timeout
- Schema missing / invalid
- Determinismo

## Estado

PR 3 - Explicit allow gate (minimal) implementado. Se introduce por primera vez la posibilidad de Decision.ALLOW de forma explícita, mínima y reversible. El sistema mantiene deny-by-default y fail-closed absoluto.


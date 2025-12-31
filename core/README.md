# Elixir Core - PR 2: rule-evaluation-pipeline (deny-only)

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
      RuleResult.ts    # Resultado PASS | DENY
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

## Tests

Ejecutar tests obligatorios:
- Fail-closed por excepción
- Fail-closed por timeout
- Schema missing / invalid
- Determinismo

## Estado

PR 2 - Rule evaluation pipeline (deny-only) implementado. Pipeline interno permite denegaciones tempranas pero no autoriza. Default deny mantenido.


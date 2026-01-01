# Emisión de Decisión Canónica - FASE 2.3

## Propósito

Este módulo implementa el **Emisor de Decisión Canónica** de la FASE 2.3 del BLOQUE 2.

## Objetivo Único

Emitir una única decisión canónica como salida final del BLOQUE 2, sin reinterpretar ni enriquecer resultados previos.

## Restricciones Absolutas

- NO modificar BLOQUE 1
- NO modificar Elixir Core
- NO tocar WAM
- NO introducir UI, UX ni flows visuales
- NO asumir monetización, catálogo ni permisos finales
- NO optimizar, escalar ni enriquecer lógica
- NO agregar nuevas decisiones

## Contexto Cerrado

- La FASE 2.1 ya emitió ALLOW
- La FASE 2.2 ya emitió ALLOW o HOLD o DENY
- Todas las evaluaciones previas están cerradas
- Política D0 vigente
- El sistema debe seguir siendo apagable

## Decisiones Permitidas (Únicas)

- `ALLOW`: Todas las fases previas emitieron ALLOW
- `HOLD`: La FASE 2.2 emitió HOLD
- `DENY`: Alguna fase previa emitió DENY, o hubo error/inconsistencia

## Reglas Obligatorias

1. **Si alguna fase previa emitió DENY → DENY final**
   - Si FASE 2.1 emitió DENY → DENY final
   - Si FASE 2.2 emitió DENY → DENY final

2. **Si FASE 2.2 emitió HOLD → HOLD final**
   - HOLD tiene prioridad sobre ALLOW de FASE 2.1
   - HOLD suspende la operación sin denegarla

3. **Solo si todas las fases previas emitieron ALLOW → ALLOW final**
   - FASE 2.1 debe haber emitido ALLOW
   - FASE 2.2 debe haber emitido ALLOW
   - Solo entonces se emite ALLOW final

## Entradas Permitidas

- **Resultado de FASE 2.1**: `GateDecision` (ALLOW o DENY)
- **Resultado de FASE 2.2**: `StateEvaluationDecision` (ALLOW, HOLD o DENY)

## Salida Permitida

- **Una única decisión canónica**: `CanonicalDecision` (ALLOW | HOLD | DENY)

## Comportamiento por Defecto

**Error, inconsistencia o ambigüedad → DENY**

El emisor implementa comportamiento fail-closed:
- Cualquier excepción durante la evaluación → DENY
- Cualquier inconsistencia en los resultados → DENY
- Cualquier duda o ambigüedad → DENY
- Resultados faltantes o inválidos → DENY

## Contrato de Entrada/Salida

### Entrada: `CanonicalDecisionRequest`

```typescript
interface CanonicalDecisionRequest {
  gateDecision: GateDecision;                    // Resultado de FASE 2.1
  stateEvaluationDecision: StateEvaluationDecision; // Resultado de FASE 2.2
  timestamp?: string;                             // Timestamp opcional para trazabilidad
}
```

### Salida: `CanonicalDecision`

```typescript
enum CanonicalDecision {
  ALLOW = 'ALLOW',
  HOLD = 'HOLD',
  DENY = 'DENY'
}
```

## Invariantes de Seguridad

1. **Fail-closed por defecto**: Cualquier error, inconsistencia o ambigüedad resulta en DENY.

2. **No reinterpretación**: Los resultados de las fases previas se toman como están, sin reinterpretación ni enriquecimiento.

3. **Prioridad de DENY**: DENY tiene prioridad absoluta sobre cualquier otra decisión.

4. **Prioridad de HOLD**: HOLD tiene prioridad sobre ALLOW, pero no sobre DENY.

5. **ALLOW solo con consenso**: ALLOW solo se emite cuando todas las fases previas emitieron ALLOW.

6. **Sin side-effects**: El emisor no modifica estado, no persiste datos, no genera efectos secundarios.

7. **Determinismo**: Dados los mismos resultados de entrada, siempre se emite la misma decisión.

8. **Idempotencia**: Múltiples invocaciones con los mismos resultados producen el mismo resultado.

## Ausencia de Side-Effects

El emisor de decisión canónica es una función pura:
- No modifica estado global
- No persiste datos
- No genera logs (excepto errores críticos si se requiere)
- No realiza llamadas externas
- No modifica los resultados de entrada
- No genera efectos secundarios observables

La única responsabilidad del emisor es tomar los resultados de las fases previas y emitir una decisión canónica según las reglas definidas.


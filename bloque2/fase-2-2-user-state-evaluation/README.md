# Evaluación de Estado del Usuario - FASE 2.2

## Propósito

Este módulo implementa el **Evaluador de Estado del Usuario** de la FASE 2.2 del BLOQUE 2.

## Objetivo Único

Evaluar el estado operativo del usuario y traducirlo a una decisión canónica para el resto del sistema.

## Restricciones Absolutas

- NO modificar BLOQUE 1
- NO modificar Elixir Core
- NO tocar WAM
- NO introducir UI, UX ni flows visuales
- NO asumir monetización, catálogo ni permisos finales
- NO optimizar, escalar ni enriquecer lógica
- NO agregar estados no documentados

## Contexto Cerrado

- La FASE 2.1 ya fue ejecutada y emitió ALLOW
- El usuario es válido, pero no necesariamente activo
- El sistema debe seguir siendo apagable
- Política D0 vigente: Elixir no es custodio de datos

## Estados Operativos Permitidos (Únicos)

El sistema define únicamente los siguientes estados operativos del usuario:

1. **PENDING**: Usuario en proceso de activación
2. **ACTIVE**: Usuario activo y operativo
3. **FROZEN**: Usuario congelado temporalmente
4. **DENIED**: Usuario denegado

**Regla explícita**: No se permiten estados adicionales. Cualquier estado no documentado se trata como error.

## Reglas Obligatorias de Decisión

Las siguientes reglas son obligatorias y no pueden modificarse:

- **ACTIVE** → **ALLOW**: Usuario activo puede continuar
- **PENDING** → **HOLD**: Usuario pendiente debe esperar
- **FROZEN** → **HOLD**: Usuario congelado debe esperar
- **DENIED** → **DENY**: Usuario denegado no puede continuar

## Entradas Permitidas

- **UserID válido**: UserID que ya pasó la validación de la FASE 2.1
- **Estado operativo del usuario**: Estado ya existente en el sistema (consultado internamente)

## Salidas Permitidas (Únicas)

Únicas salidas permitidas:
- `ALLOW`: Usuario puede continuar (estado ACTIVE)
- `HOLD`: Usuario debe esperar (estado PENDING o FROZEN)
- `DENY`: Usuario denegado (estado DENIED o error)

## Comportamiento por Defecto

**Ante error, inconsistencia o duda → DENY**

El evaluador implementa comportamiento fail-closed:
- Cualquier excepción durante la evaluación → DENY
- Estado desconocido o null → DENY
- Estado no documentado → DENY
- Cualquier duda o ambigüedad → DENY

## Contrato de Entrada/Salida

### Entrada: `StateEvaluationRequest`

```typescript
interface StateEvaluationRequest {
  userId: string;        // UserID válido del usuario (ya validado en FASE 2.1)
  timestamp?: string;    // Contexto mínimo de invocación (opcional)
}
```

### Salida: `StateEvaluationDecision`

```typescript
enum StateEvaluationDecision {
  ALLOW = 'ALLOW',  // Usuario puede continuar
  HOLD = 'HOLD',    // Usuario debe esperar
  DENY = 'DENY'     // Usuario denegado
}
```

### Estados Operativos: `UserOperationalState`

```typescript
enum UserOperationalState {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  DENIED = 'DENIED'
}
```

## Dependencias Externas

El evaluador requiere un proveedor externo:

1. **IUserStateProvider**: Consulta el estado operativo actual del usuario en el sistema

Este proveedor debe ser implementado e inyectado al crear una instancia del evaluador.

## Uso

```typescript
import { 
  UserStateEvaluator, 
  StateEvaluationRequest, 
  StateEvaluationDecision,
  UserOperationalState
} from './bloque2/fase-2-2-user-state-evaluation';
import { InMemoryUserStateProvider } from './bloque2/fase-2-2-user-state-evaluation/src/providers/InMemoryUserStateProvider';

// Crear proveedor (en producción, usar implementación real)
const userStateProvider = new InMemoryUserStateProvider();
userStateProvider.setUserState('Elixir_U123', UserOperationalState.ACTIVE);

// Crear instancia del evaluador
const evaluator = new UserStateEvaluator(userStateProvider);

// Evaluar estado del usuario
const request: StateEvaluationRequest = {
  userId: 'Elixir_U123'
};

const decision = await evaluator.evaluate(request);

if (decision === StateEvaluationDecision.ALLOW) {
  // Continuar a siguiente fase
} else if (decision === StateEvaluationDecision.HOLD) {
  // Usuario debe esperar
} else {
  // DENY - No continuar
}
```

## Proveedores de Ejemplo

El módulo incluye implementación de ejemplo en memoria para desarrollo y testing:

- `InMemoryUserStateProvider`: Proveedor de estado operativo en memoria

**NOTA**: Esta implementación es solo para desarrollo. En producción, debe reemplazarse por implementación que consulte el sistema real de persistencia.

## Invariantes de Seguridad

1. **Fail-Closed Absoluto**
   - Cualquier error o excepción → DENY
   - Estado desconocido o null → DENY
   - Estado no documentado → DENY
   - No se permite ALLOW ante duda o ambigüedad

2. **Validación Estricta de Estado**
   - Solo estados documentados (PENDING, ACTIVE, FROZEN, DENIED) son válidos
   - Cualquier otro estado → DENY
   - Estado null o no encontrado → DENY

3. **Reglas de Decisión Inmutables**
   - ACTIVE → ALLOW (sin excepciones)
   - PENDING → HOLD (sin excepciones)
   - FROZEN → HOLD (sin excepciones)
   - DENIED → DENY (sin excepciones)

4. **Sin Exposición de Razones**
   - El evaluador solo retorna ALLOW, HOLD o DENY
   - No expone razones, mensajes ni metadata
   - No expone el estado operativo interno

5. **Sin Persistencia**
   - El evaluador no persiste decisiones
   - Cada evaluación es independiente
   - No modifica el estado del usuario

6. **Sin Side-Effects**
   - El evaluador es puramente consultivo
   - No modifica datos del usuario
   - No modifica estado del sistema
   - No realiza operaciones externas
   - Solo lee y evalúa

7. **Dependencia de FASE 2.1**
   - Asume que el UserID ya fue validado en FASE 2.1
   - No realiza validación adicional de existencia del usuario
   - Si el usuario no existe, el proveedor retorna null → DENY

## Confirmación de Ausencia Total de Side-Effects

El evaluador garantiza ausencia total de side-effects:

- ✅ **No modifica datos**: No persiste, actualiza ni elimina información del usuario
- ✅ **No modifica estado del sistema**: No cambia flags, configuraciones ni estados globales
- ✅ **No realiza operaciones externas**: No hace llamadas HTTP, no envía mensajes, no accede a sistemas externos
- ✅ **No genera logs persistentes**: No escribe en archivos, bases de datos ni sistemas de logging
- ✅ **No emite eventos**: No publica eventos ni notificaciones
- ✅ **Puramente funcional**: Solo lee el estado operativo y retorna una decisión

**Garantía**: El método `evaluate()` es idempotente y puede llamarse múltiples veces sin efectos secundarios.

## Integración con FASE 2.1

La FASE 2.2 se ejecuta después de la FASE 2.1:

1. **FASE 2.1** valida existencia y validez del usuario → emite ALLOW o DENY
2. **FASE 2.2** (esta fase) evalúa estado operativo del usuario → emite ALLOW, HOLD o DENY

**Flujo esperado**:
- FASE 2.1: ALLOW → FASE 2.2: ALLOW → Continuar
- FASE 2.1: ALLOW → FASE 2.2: HOLD → Esperar
- FASE 2.1: ALLOW → FASE 2.2: DENY → No continuar
- FASE 2.1: DENY → No ejecutar FASE 2.2

## No Avanzar a FASE 2.3

Este evaluador NO debe:
- Sugerir mejoras futuras
- Introducir lógica de negocio
- Avanzar automáticamente a FASE 2.3
- Modificar otros módulos del sistema
- Agregar funcionalidades no especificadas

## Estado

**FASE 2.2 - Evaluación de Estado del Usuario**
- Contrato definido
- Reglas de decisión implementadas
- Comportamiento fail-closed garantizado
- Invariantes de seguridad documentados
- Ausencia total de side-effects confirmada


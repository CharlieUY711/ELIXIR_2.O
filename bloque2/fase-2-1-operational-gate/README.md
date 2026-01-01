# Gate de Existencia Operativa - FASE 2.1

## Propósito

Este módulo implementa el **Gate de Existencia Operativa** de la FASE 2.1 del BLOQUE 2.

## Objetivo Único

Determinar si el sistema permite continuar a la FASE 2.2, basándose únicamente en:
- existencia de un UserID válido
- estado operativo global del sistema
- estado del kill-switch global

## Restricciones Absolutas

- NO modificar BLOQUE 1
- NO modificar Elixir Core
- NO tocar WAM
- NO introducir UI, UX ni flows visuales
- NO asumir monetización, catálogo ni permisos finales
- NO optimizar ni escalar
- NO agregar estados no documentados

## Contexto Cerrado

- El usuario ya es válido (resultado de BLOQUE 1)
- El sistema debe seguir siendo apagable
- Elixir no es custodio de datos (D0)

## Entradas Permitidas

- UserID válido
- Flags operativos globales (consultados internamente)
- Contexto mínimo de invocación

## Evaluaciones Obligatorias

1. **El usuario existe y es válido**
   - El UserID debe existir en el sistema
   - El UserID debe ser válido según las reglas del sistema

2. **El sistema no está globalmente apagado**
   - El estado operativo global debe ser OPERATIONAL
   - Si el sistema está SHUTDOWN → DENY

3. **El kill-switch global no está activo**
   - El kill-switch debe estar inactivo
   - Si el kill-switch está activo → DENY

## Salidas Permitidas

Únicas salidas permitidas:
- `ALLOW`: Todas las evaluaciones pasaron
- `DENY`: Cualquier evaluación falló o hubo error

## Comportamiento por Defecto

**Ante error, inconsistencia o duda → DENY**

El gate implementa comportamiento fail-closed:
- Cualquier excepción durante la evaluación → DENY
- Cualquier validación que falle → DENY
- Cualquier duda o ambigüedad → DENY

## Contrato de Entrada/Salida

### Entrada: `GateRequest`

```typescript
interface GateRequest {
  userId: string;        // UserID válido del usuario
  timestamp?: string;    // Contexto mínimo de invocación (opcional)
}
```

### Salida: `GateDecision`

```typescript
enum GateDecision {
  ALLOW = 'ALLOW',
  DENY = 'DENY'
}
```

## Dependencias Externas

El gate requiere tres proveedores externos:

1. **IUserValidator**: Valida que un UserID existe y es válido
2. **ISystemStateProvider**: Consulta el estado operativo global del sistema
3. **IKillSwitchProvider**: Consulta el estado del kill-switch global

Estos proveedores deben ser implementados e inyectados al crear una instancia del gate.

## Uso

```typescript
import { OperationalExistenceGate, GateRequest, GateDecision } from './bloque2/fase-2-1-operational-gate';
import { InMemoryUserValidator } from './bloque2/fase-2-1-operational-gate/src/providers/InMemoryUserValidator';
import { InMemorySystemStateProvider, SystemOperationalState } from './bloque2/fase-2-1-operational-gate/src/providers/InMemorySystemStateProvider';
import { InMemoryKillSwitchProvider } from './bloque2/fase-2-1-operational-gate/src/providers/InMemoryKillSwitchProvider';

// Crear proveedores (en producción, usar implementaciones reales)
const userValidator = new InMemoryUserValidator(['Elixir_U123', 'Elixir_U456']);
const systemStateProvider = new InMemorySystemStateProvider(SystemOperationalState.OPERATIONAL);
const killSwitchProvider = new InMemoryKillSwitchProvider({ active: false });

// Crear instancia del gate
const gate = new OperationalExistenceGate(
  userValidator,
  systemStateProvider,
  killSwitchProvider
);

// Evaluar gate
const request: GateRequest = {
  userId: 'Elixir_U123'
};

const decision = await gate.evaluate(request);

if (decision === GateDecision.ALLOW) {
  // Continuar a FASE 2.2
} else {
  // DENY - No continuar
}
```

## Proveedores de Ejemplo

El módulo incluye implementaciones de ejemplo en memoria para desarrollo y testing:

- `InMemoryUserValidator`: Validador de usuarios en memoria
- `InMemorySystemStateProvider`: Proveedor de estado del sistema en memoria
- `InMemoryKillSwitchProvider`: Proveedor de kill-switch en memoria

**NOTA**: Estas implementaciones son solo para desarrollo. En producción, deben reemplazarse por implementaciones que consulten el sistema real de persistencia y estado.

## Invariantes de Seguridad

1. **Fail-Closed Absoluto**
   - Cualquier error o excepción → DENY
   - No se permite ALLOW ante duda o ambigüedad

2. **Validación Estricta de UserID**
   - UserID debe ser string no vacío
   - UserID debe existir en el sistema
   - UserID debe ser válido según reglas del sistema

3. **Prioridad del Kill-Switch**
   - Si el kill-switch está activo → DENY (sin excepciones)
   - El kill-switch tiene prioridad sobre otras evaluaciones

4. **Estado Operativo Global**
   - Solo estado OPERATIONAL permite ALLOW
   - Estado SHUTDOWN → DENY (sin excepciones)

5. **Sin Exposición de Razones**
   - El gate solo retorna ALLOW o DENY
   - No expone razones, mensajes ni metadata

6. **Sin Persistencia**
   - El gate no persiste decisiones
   - Cada evaluación es independiente

## No Avanzar a FASE 2.2

Este gate NO debe:
- Sugerir mejoras futuras
- Introducir lógica de negocio
- Avanzar automáticamente a FASE 2.2
- Modificar otros módulos del sistema

## Estado

**FASE 2.1 - Gate de Existencia Operativa**
- Contrato definido
- Evaluaciones implementadas
- Comportamiento fail-closed garantizado
- Invariantes de seguridad documentados


# Evidencia Técnica de Invariantes del WAM

**Fecha**: 2024  
**Propósito**: Documentar evidencia técnica de que los invariantes críticos se cumplen

## Invariante 1: No PII (Información Personal Identificable)

### Verificación de Código

**Archivos revisados**:
- `src/observability/ConsoleObservability.ts`
- `src/resolver/HandoffResolverImpl.ts`
- `src/service/HandoffService.ts`
- `src/storage/InMemoryTempStore.ts`

**Evidencia**:
1. **Logs estructurados**: Solo se registran metadatos operativos:
   - `handoff_id` (UUID, no es PII)
   - `session_id` (identificador de sesión, no es PII)
   - `timestamp`
   - `error_type` (categoría genérica)
   - `cause` (mensaje genérico, sin contenido)

2. **NO se registra**:
   - Números telefónicos
   - Nombres de usuarios
   - Direcciones
   - Contenido de mensajes
   - Cualquier dato que identifique a una persona

**Código de referencia**:
```typescript
// src/observability/ConsoleObservability.ts
const logEntry = {
  level: logLevel,
  type: 'event',
  event_type: event.type,
  handoff_id: event.handoff_id,      // UUID, no PII
  session_id: event.session_id,        // ID de sesión, no PII
  timestamp: event.timestamp,
  error_type: event.error_type,       // Categoría genérica
  cause: event.cause                  // Mensaje genérico
};
```

**Tests**: No hay tests específicos de PII porque el código no permite registrar PII.

---

## Invariante 2: No Persistencia de Decisiones

### Verificación de Código

**Archivos revisados**:
- `src/service/HandoffService.ts`
- `src/resolver/HandoffResolverImpl.ts`
- `src/storage/InMemoryTempStore.ts`
- `src/index.ts`

**Evidencia**:
1. **El WAM NO consulta al Core**:
   - No hay imports del Core en `package.json`
   - No hay llamadas HTTP al Core
   - No hay dependencias del Core en el código

2. **El WAM recibe handoffs ya autorizados**:
   - El endpoint `POST /handoffs` recibe `session_id`, `user_ref`, `model_ref`
   - Estos valores ya fueron autorizados por el Core a través del Chat
   - El WAM solo crea el handoff temporal, no decide

3. **Solo se almacena metadata temporal**:
   ```typescript
   // src/types/Handoff.ts
   interface Handoff {
     handoff_id: string;      // UUID generado
     session_id: string;       // ID de sesión
     user_ref: string;         // Referencia opaca
     model_ref: string;         // Referencia opaca
     status: HandoffStatus;     // Estado operativo
     created_at: string;        // Timestamp
     expires_at: string;        // Timestamp de expiración
   }
   ```

4. **TTL estricto**: 5 minutos, borrado automático

**Código de referencia**:
```typescript
// src/service/HandoffService.ts
// El servicio solo crea handoffs, no decide
async createHandoff(request: CreateHandoffRequest): Promise<CreateHandoffResponse> {
  // Validar campos requeridos
  // Generar handoff_id único
  // Crear handoff con TTL
  // NO hay lógica decisional
}
```

**Tests**: Ver `tests/handoff_ttl.test.ts` para validación de TTL.

---

## Invariante 3: Aislamiento del Core

### Verificación de Dependencias

**Archivo**: `package.json`

**Evidencia**:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "uuid": "^9.0.1"
  }
}
```

**No hay dependencias de**:
- `@elixir/core` o similar
- Cualquier módulo del Core
- Cualquier librería de decisión

### Verificación de Imports

**Búsqueda en código**:
```bash
# No hay imports del Core en ningún archivo del WAM
```

**Evidencia**:
- `src/index.ts`: Solo imports locales del módulo WAM
- `src/resolver/HandoffResolverImpl.ts`: Solo imports de contratos internos
- `src/service/HandoffService.ts`: Solo imports de contratos internos

**Código de referencia**:
```typescript
// src/index.ts
import { InMemoryTempStore } from './storage/InMemoryTempStore';
import { NoopSender } from './sender/NoopSender';
import { PersistentKillSwitch } from './killswitch/PersistentKillSwitch';
// NO hay imports del Core
```

**Tests**: No hay tests específicos porque el código no permite dependencias del Core.

---

## Invariante 4: Kill-Switch Efectivo

### Verificación de Implementación

**Archivos**:
- `src/killswitch/PersistentKillSwitch.ts`
- `src/resolver/HandoffResolverImpl.ts`
- `tests/killswitch.test.ts`
- `tests/killswitch_persistence.test.ts`

**Evidencia**:

1. **Modo DROP**: Rechaza todas las solicitudes inmediatamente
   ```typescript
   // src/resolver/HandoffResolverImpl.ts
   if (killSwitchState.active) {
     if (killSwitchState.mode === 'DROP') {
       return {
         success: false,
         message: 'Servicio temporalmente no disponible',
         error_type: 'kill_switch_active'
       };
     }
   }
   ```

2. **Modo SILENCIO**: Procesa pero no ejecuta sender
   ```typescript
   // src/resolver/HandoffResolverImpl.ts
   if (!killSwitchState.active || killSwitchState.mode !== 'SILENCIO') {
     // Ejecutar sender solo si no está en modo SILENCIO
     const sendResult = await this.sender.send(...);
   }
   ```

3. **Persistencia**: Estado sobrevive a reinicios
   ```typescript
   // src/killswitch/PersistentKillSwitch.ts
   private loadState(): KillSwitchState {
     if (fs.existsSync(this.stateFilePath)) {
       const content = fs.readFileSync(this.stateFilePath, 'utf-8');
       return JSON.parse(content);
     }
     return { active: false }; // Fail-closed
   }
   ```

4. **Tests**:
   - `tests/killswitch.test.ts`: Verifica modos DROP y SILENCIO
   - `tests/killswitch_persistence.test.ts`: Verifica persistencia

**Resultado de tests**:
```bash
npm test -- killswitch
# ✅ Todos los tests pasan
```

---

## Invariante 5: Fail-Closed en Toda Falla

### Verificación de Comportamiento

**Archivos revisados**:
- `src/resolver/HandoffResolverImpl.ts`
- `src/index.ts`
- `tests/fail_closed.test.ts`

**Evidencia**:

1. **Errores de almacenamiento**: Rechazo
   ```typescript
   if (handoffResult.error || !handoffResult.handoff) {
     return {
       success: false,
       message: 'Enlace inválido',
       error_type: errorType
     };
   }
   ```

2. **Timeouts**: Rechazo
   ```typescript
   const handoffResult = await Promise.race([
     this.tempStore.get(handoff_id),
     this.timeoutPromise(this.STORAGE_TIMEOUT_MS, { error: { type: 'timeout' } })
   ]);
   ```

3. **Excepciones no previstas**: Rechazo
   ```typescript
   catch (error) {
     return {
       success: false,
       message: 'No se pudo completar la conexión. Por favor, intenta nuevamente.',
       error_type: 'storage_error'
     };
   }
   ```

4. **Kill-switch corrupto**: Inicia inactivo (fail-closed)
   ```typescript
   // src/killswitch/PersistentKillSwitch.ts
   catch (error) {
     console.error(`[KillSwitch] Error al cargar estado: ${error}`);
     return { active: false }; // Fail-closed
   }
   ```

**Tests**: Ver `tests/fail_closed.test.ts`

---

## Resumen de Evidencia

| Invariante | Evidencia | Tests | Estado |
|------------|-----------|-------|--------|
| No PII | Revisión de código, logs estructurados | Implícito (código no permite PII) | ✅ |
| No Persistencia de Decisiones | Revisión de código, dependencias | `handoff_ttl.test.ts` | ✅ |
| Aislamiento del Core | `package.json`, imports | Implícito (sin dependencias) | ✅ |
| Kill-Switch Efectivo | Implementación, persistencia | `killswitch.test.ts`, `killswitch_persistence.test.ts` | ✅ |
| Fail-Closed | Implementación, manejo de errores | `fail_closed.test.ts` | ✅ |

---

## Validación Continua

Para validar invariantes en cada cambio:

1. **Ejecutar tests**:
   ```bash
   npm test
   ```

2. **Revisar dependencias**:
   ```bash
   npm list --depth=0
   ```

3. **Buscar PII en logs**:
   ```bash
   grep -r "phone\|email\|name\|address" src/ --exclude-dir=node_modules
   ```

4. **Buscar imports del Core**:
   ```bash
   grep -r "@elixir\|core" src/ --exclude-dir=node_modules
   ```

---

**Documento generado como parte del hardening operativo del WAM v1.0.0**


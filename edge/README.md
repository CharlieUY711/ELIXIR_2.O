# Edge - Adaptador para Elixir Core

## Rol del Edge

El Edge es un **adaptador tonto** (dumb adapter) que consume el Elixir Core. Su única responsabilidad es:

1. Traducir input del Chat/Edge a `AuthorizationRequest` válido para el Core
2. Llamar al Core para obtener una decisión
3. Procesar la respuesta (ALLOW/DENY) y retornar resultado al Chat/Edge

## Principios Inviolables

- **El Core es autoridad única**: El Edge NO decide, solo consume
- **Sin explicaciones**: El Edge NO explica decisiones del Core
- **Sin inferencia**: El Edge NO infiere reglas ni estados
- **Interfaz mínima**: request → ALLOW | DENY
- **Sin retries inteligentes**: Si el Core falla, se trata como DENY
- **Sin fallback permisivo**: Cualquier error → DENY

## Contrato con el Core

### Input del Edge

El Edge acepta input del Chat/Edge con los siguientes campos:

```typescript
interface EdgeInput {
  session_id?: string;  // Requerido
  user_ref?: string;    // Requerido
  model_ref?: string;   // Requerido
  action?: string;      // Opcional (default: 'chat_access')
}
```

### Output del Edge

El Edge retorna:

```typescript
interface EdgeDecisionResult {
  authorized: boolean;  // true si ALLOW, false si DENY
  message?: string;     // Solo presente en DENY, mensaje genérico
}
```

### Mapeo a AuthorizationRequest

El Edge mapea el input a `AuthorizationRequest` del Core:

- `request_id`: Generado automáticamente (`edge_${timestamp}_${random}`)
- `subject_id`: `user_ref` del input
- `resource_id`: `model_ref` del input
- `action`: `action` del input` o default `'chat_access'`
- `issued_at`: Timestamp actual
- `deadline_ms`: 30000 (30 segundos)
- `context`: `{ session_id: input.session_id }`

## Qué Hace el Edge

✅ **Traduce** input del Chat/Edge a formato del Core  
✅ **Valida** presencia de campos mínimos (si falta → DENY local)  
✅ **Llama** al Core con timeout corto (5 segundos)  
✅ **Procesa** respuesta ALLOW/DENY  
✅ **Retorna** mensaje genérico en caso de DENY  

## Qué NO Hace el Edge

❌ **NO decide**: Solo consume decisiones del Core  
❌ **NO explica**: No expone razones ni estados internos  
❌ **NO infiere**: No deduce reglas ni condiciones  
❌ **NO cachea**: No almacena decisiones  
❌ **NO retry**: Si el Core falla, se trata como DENY  
❌ **NO enriquece**: No agrega contexto adicional  
❌ **NO diferencia**: Todos los DENY tienen el mismo mensaje genérico  

## Mensajes Permitidos al Usuario

El Edge solo puede retornar un mensaje genérico en caso de DENY:

```
"No es posible continuar con esta solicitud"
```

**Prohibido** mencionar:
- Reglas o políticas
- Estados internos (stress, presión, etc.)
- Razones específicas
- Errores técnicos
- Timeouts o deadlines

## Uso

```typescript
import { authorizeEdgeRequest } from './edge';

const result = await authorizeEdgeRequest({
  session_id: 'session-123',
  user_ref: 'user-456',
  model_ref: 'model-789'
});

if (result.authorized) {
  // Continuar flujo del Chat
} else {
  // Mostrar mensaje genérico: result.message
}
```

## Estructura

```
/edge
  EdgeRequestMapper.ts    # Traduce input a AuthorizationRequest
  EdgeClient.ts           # Cliente para llamar al Core
  EdgeDecisionHandler.ts  # Procesa decisiones ALLOW/DENY
  index.ts                # Entrypoint único
  /tests
    edge_allows_on_core_allow.test.ts
    edge_denies_on_core_deny.test.ts
    edge_denies_on_core_error.test.ts
    edge_does_not_explain_decision.test.ts
  README.md
```

## Notas Importantes

- El Edge es **independiente del Core**: No modifica código del Core
- El Edge es **determinista**: Mismo input → mismo output
- El Edge es **fail-closed**: Cualquier error → DENY
- El Edge es **mínimo**: Solo traduce, llama y procesa


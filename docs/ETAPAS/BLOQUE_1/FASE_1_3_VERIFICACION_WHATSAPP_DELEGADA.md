# FASE 1.3 — Verificación WhatsApp Delegada

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Base Operativa Mínima  
**Bloque**: BLOQUE 1 — Registro Unificado  
**Fase**: FASE 1.3 — Verificación WhatsApp como gate delegado  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Contexto Normativo

### 1.1. Principios Fundamentales

Este documento define el modelo lógico canónico de la verificación WhatsApp como gate delegado en Elixir Platform. El modelo es:

- **Declarativo**: Define qué verifica y qué no verifica, no cómo se implementa
- **Normativo**: Establece reglas obligatorias que toda implementación debe respetar
- **Canónico**: Es la única fuente de verdad para el gate de verificación WhatsApp
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones
- **Delegado**: La verificación se delega a un proveedor externo (WAM), Elixir no ejecuta la verificación directamente

### 1.2. Relación con Fases Previas

Este documento se basa en:

- **FASE 1.1**: Modelo lógico y máquina de estados que define `whatsapp_gate` como gate de verificación
- **FASE 1.2**: Registro mínimo funcional que no requiere verificación WhatsApp

La FASE 1.3 extiende el modelo de FASE 1.1 agregando la definición completa del gate `whatsapp_gate` como gate delegado, sin modificar el modelo base ni invalidar FASE 1.2.

### 1.3. Invariantes Globales

El gate de verificación WhatsApp respeta los mismos invariantes fundamentales definidos en FASE 1.1:

1. **D0 (Elixir no custodia datos)**: El sistema no almacena números de teléfono en claro, solo hashes y estados binarios
2. **Default Deny**: El gate inicia en estado de denegación implícita. Solo señales explícitas pueden cambiar el estado
3. **Apagabilidad**: El gate puede ser apagado completamente mediante kill-switch sin dejar estados inconsistentes

### 1.4. Principio Rector

**"Delegar no es confiar. Delegar es controlar el resultado."**

El gate WhatsApp delega la ejecución de la verificación a un proveedor externo (WAM), pero Elixir controla:
- Qué se verifica y qué no se verifica
- Qué señales acepta del proveedor
- Cómo interpreta esas señales
- Qué impacto tiene en la máquina de estados
- Cómo se comporta ante errores o silencio

---

## 2. Qué Verifica el Gate WhatsApp

### 2.1. Enunciado Canónico

El gate `whatsapp_gate` verifica **únicamente** que:

1. **Un número de teléfono puede recibir mensajes OTP**: El número proporcionado es capaz de recibir un código OTP enviado mediante WhatsApp
2. **El código OTP recibido coincide con el enviado**: La persona que tiene acceso al número puede ingresar el código correcto

### 2.2. Qué NO Verifica el Gate WhatsApp

El gate `whatsapp_gate` **NO** verifica:

- ❌ **Identidad de la persona**: No verifica quién es la persona que tiene acceso al número
- ❌ **Propiedad del número**: No verifica que la persona sea propietaria legal del número
- ❌ **Edad de la persona**: No verifica la edad del titular del número
- ❌ **Ubicación geográfica**: No verifica dónde se encuentra la persona
- ❌ **Intención o propósito**: No verifica por qué la persona quiere registrarse
- ❌ **Historial o reputación**: No verifica historial previo del número
- ❌ **Validez legal o contractual**: No verifica que el número sea válido legalmente
- ❌ **Disponibilidad del número**: No verifica que el número esté activo más allá del momento de verificación

### 2.3. Alcance de la Verificación

**Lo que el gate verifica es mínimo y técnico**:

- El número puede recibir mensajes (capacidad técnica)
- El código puede ser ingresado correctamente (control del dispositivo/número)

**Lo que el gate NO verifica es todo lo demás**:

- No establece identidad
- No valida legitimidad
- No confirma propósito
- No garantiza comportamiento futuro

### 2.4. Implicaciones Operativas

Como consecuencia de esta definición:

- **El gate habilita**: Que el sistema pueda comunicarse con ese número mediante WhatsApp
- **El gate NO habilita**: Acceso a funcionalidades que requieren verificación de identidad, edad, o capacidad de pago
- **El gate es prerrequisito**: Para otros gates (edad, pago) pero no los reemplaza
- **El gate es delegado**: La ejecución técnica se delega a WAM, pero Elixir controla el resultado

---

## 3. Señales del Gate

### 3.1. Definición de Señal

Una **señal** es el resultado que el gate `whatsapp_gate` emite después de evaluar una solicitud de verificación. Las señales son binarias y deterministas: el gate emite una y solo una señal por solicitud.

### 3.2. Señales Posibles

El gate `whatsapp_gate` puede emitir las siguientes señales:

#### 3.2.1. PASS

**Definición**: El gate ha verificado exitosamente que el número puede recibir OTP y el código ingresado es correcto.

**Condiciones**:
- El proveedor (WAM) ha confirmado que el OTP fue enviado exitosamente
- El proveedor ha confirmado que el código ingresado coincide con el enviado
- No hay errores técnicos ni bloqueos activos

**Impacto en estado**: El gate transita a estado `VERIFIED`

**Regla explícita**: PASS solo puede ocurrir si el proveedor confirma ambas condiciones (envío exitoso y código correcto). Si falta cualquiera de las dos, el resultado NO es PASS.

#### 3.2.2. FAIL

**Definición**: El gate ha determinado que la verificación no puede completarse exitosamente.

**Condiciones**:
- El código ingresado no coincide con el enviado (después de agotar intentos permitidos)
- El proveedor reporta que el número no puede recibir mensajes
- El proveedor reporta error técnico que impide la verificación
- Se ha excedido el límite de intentos de verificación

**Impacto en estado**: El gate transita a estado `FAILED`

**Regla explícita**: FAIL es terminal. Una vez que el gate emite FAIL, no puede emitir PASS sin iniciar un nuevo intento de verificación.

#### 3.2.3. PENDING

**Definición**: El gate está esperando acción del usuario o respuesta del proveedor.

**Condiciones**:
- Se ha enviado el OTP pero aún no se ha recibido código ingresado
- Se está esperando respuesta del proveedor sobre el estado del envío
- El código ingresado está siendo validado por el proveedor

**Impacto en estado**: El gate permanece en estado `PENDING`

**Regla explícita**: PENDING es temporal. El gate debe eventualmente transicionar a PASS, FAIL, o TIMEOUT. No puede permanecer en PENDING indefinidamente.

#### 3.2.4. TIMEOUT

**Definición**: El gate ha excedido el tiempo máximo permitido para completar la verificación.

**Condiciones**:
- Ha transcurrido el tiempo máximo desde el envío del OTP sin recibir código ingresado
- Ha transcurrido el tiempo máximo esperando respuesta del proveedor
- El código OTP ha expirado según las reglas del proveedor

**Impacto en estado**: El gate transita a estado `FAILED` con `reason_code: FAILED_OTP_TIMEOUT`

**Regla explícita**: TIMEOUT es equivalente a FAIL para efectos de la máquina de estados. El gate no puede emitir PASS después de TIMEOUT sin iniciar un nuevo intento.

### 3.3. Exclusividad de Señales

**Regla fundamental**: El gate emite una y solo una señal por solicitud de verificación. No puede emitir múltiples señales simultáneamente ni señales contradictorias.

**Orden de prioridad** (si hay ambigüedad):
1. FAIL tiene prioridad sobre PENDING (si hay error, no se mantiene pendiente)
2. TIMEOUT tiene prioridad sobre PENDING (si expira, no se mantiene pendiente)
3. BLOCKED tiene prioridad sobre todas las demás (si está bloqueado, no se evalúa)

---

## 4. Estados del Gate

### 4.1. Estados Posibles

El gate `whatsapp_gate` puede estar en los siguientes estados (definidos en FASE 1.1):

- `DISABLED`: El gate no está habilitado o no aplica
- `PENDING`: El gate está pendiente de verificación
- `VERIFIED`: El gate ha sido verificado exitosamente
- `FAILED`: El gate ha fallado la verificación
- `BLOCKED`: El gate está bloqueado (por kill-switch o límites operativos)

### 4.2. Mapeo de Señales a Estados

| Señal | Estado Resultante | Condición |
|-------|-------------------|-----------|
| PASS | `VERIFIED` | Verificación exitosa |
| FAIL | `FAILED` | Verificación fallida |
| PENDING | `PENDING` | Esperando acción o respuesta |
| TIMEOUT | `FAILED` | Tiempo excedido |

**Regla explícita**: El estado `BLOCKED` no se alcanza mediante señales del gate. Solo se alcanza mediante activación explícita del kill-switch o límites operativos.

### 4.3. Transiciones de Estado

Las siguientes transiciones son las únicas permitidas:

```
DISABLED → PENDING (cuando se inicia verificación)
PENDING → VERIFIED (señal PASS)
PENDING → FAILED (señal FAIL o TIMEOUT)
VERIFIED → (terminal, no transiciona)
FAILED → PENDING (nuevo intento de verificación)
Cualquier estado → BLOCKED (kill-switch activo)
BLOCKED → DISABLED (kill-switch desactivado, pero requiere nuevo intento)
```

**Regla explícita**: Una vez que el gate alcanza `VERIFIED`, no puede retroceder a otros estados sin iniciar un nuevo `RegistroAttempt`. El estado `VERIFIED` es persistente para ese intento de registro.

---

## 5. Eventos y Reason Codes

### 5.1. Eventos del Gate

El gate `whatsapp_gate` genera los siguientes eventos (compatibles con FASE 1.1):

#### 5.1.1. Eventos de Inicio

- `WHATSAPP_GATE_INITIATED`: Se inició un intento de verificación WhatsApp
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `PENDING`

#### 5.1.2. Eventos de Proceso

- `OTP_SENT`: Se envió un código OTP al número (definido en FASE 1.1)
  - Atributos: `attempt_id`, `timestamp`, `provider_response_status`
  - Estado resultante: `PENDING`

- `OTP_VERIFICATION_ATTEMPTED`: Se intentó verificar un código OTP
  - Atributos: `attempt_id`, `timestamp`, `attempt_number`
  - Estado resultante: `PENDING` (si aún hay intentos disponibles) o `FAILED` (si se agotaron)

#### 5.1.3. Eventos de Resultado

- `OTP_VERIFIED`: Se verificó exitosamente un código OTP (definido en FASE 1.1)
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `VERIFIED`
  - Señal: PASS

- `OTP_FAILED`: Falló la verificación de un código OTP (definido en FASE 1.1)
  - Atributos: `attempt_id`, `timestamp`, `reason_code`
  - Estado resultante: `FAILED` (si se agotaron intentos) o `PENDING` (si aún hay intentos)
  - Señal: FAIL

- `OTP_TIMEOUT`: Expiró el tiempo para verificar el código OTP
  - Atributos: `attempt_id`, `timestamp`, `timeout_duration`
  - Estado resultante: `FAILED`
  - Señal: TIMEOUT

#### 5.1.4. Eventos de Control

- `WHATSAPP_GATE_BLOCKED`: El gate fue bloqueado por kill-switch o límites operativos
  - Atributos: `attempt_id`, `timestamp`, `reason_code`
  - Estado resultante: `BLOCKED`

- `WHATSAPP_GATE_UNBLOCKED`: El gate fue desbloqueado
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `DISABLED` (requiere nuevo intento)

- `GATE_STATUS_CHANGED`: Cambió el estado del gate (definido en FASE 1.1)
  - Atributos: `attempt_id`, `gate_name: 'whatsapp_gate'`, `old_state`, `new_state`, `timestamp`

### 5.2. Reason Codes Específicos

Los siguientes `reason_code` son específicos del gate WhatsApp:

#### 5.2.1. Códigos de Verificación Exitosa

- `WHATSAPP_VERIFIED_NORMAL`: Verificación exitosa normal
- `WHATSAPP_VERIFIED_RETRY`: Verificación exitosa después de reintento

#### 5.2.2. Códigos de Fallo

- `FAILED_OTP_INCORRECT`: Código OTP incorrecto (después de agotar intentos)
- `FAILED_OTP_EXPIRED`: Código OTP expirado (definido en FASE 1.1)
- `FAILED_OTP_MAX_ATTEMPTS`: Se excedió el máximo de intentos de OTP (definido en FASE 1.1)
- `FAILED_OTP_TIMEOUT`: Tiempo excedido para verificar OTP
- `FAILED_OTP_SEND_ERROR`: Error al enviar OTP (proveedor reporta error)
- `FAILED_OTP_PROVIDER_ERROR`: Error del proveedor durante verificación
- `FAILED_OTP_NUMBER_INVALID`: El número no puede recibir mensajes (según proveedor)
- `FAILED_OTP_NUMBER_BLOCKED`: El número está bloqueado por el proveedor

#### 5.2.3. Códigos de Bloqueo

- `BLOCKED_KILLSWITCH_ACTIVE`: Bloqueado por kill-switch activo
- `BLOCKED_OPERATIONAL_LIMITS`: Bloqueado por límites operativos
- `BLOCKED_PROVIDER_UNAVAILABLE`: Bloqueado porque el proveedor no está disponible

#### 5.2.4. Códigos de Estado Pendiente

- `PENDING_OTP_SENT`: OTP enviado, esperando código
- `PENDING_OTP_VERIFYING`: Verificando código ingresado
- `PENDING_PROVIDER_RESPONSE`: Esperando respuesta del proveedor

### 5.3. Uso de Reason Codes

**Reglas**:
- Todo evento de resultado (`OTP_VERIFIED`, `OTP_FAILED`, `OTP_TIMEOUT`) debe incluir un `reason_code`
- Los `reason_code` son inmutables una vez establecidos
- Los `reason_code` no exponen información sensible (invariante D0)
- Los `reason_code` permiten auditoría sin revelar detalles técnicos del proveedor

---

## 6. Impacto en la Máquina de Estados

### 6.1. Integración con FASE 1.1

El gate `whatsapp_gate` se integra con la máquina de estados definida en FASE 1.1 de la siguiente manera:

#### 6.1.1. Transición PHONE_PENDING → OTP_PENDING

**Condición**: El gate debe estar en estado `PENDING` o `DISABLED` (si se inicia por primera vez)

**Acción**: 
- Se inicia el proceso de verificación WhatsApp
- Se envía OTP mediante proveedor (WAM)
- El gate transita a estado `PENDING`
- El `RegistroAttempt` transita a estado `OTP_PENDING`

**Regla explícita**: Si el gate está en estado `BLOCKED`, la transición a `OTP_PENDING` está prohibida. El intento debe transitar a `DENIED` o `FAILED`.

#### 6.1.2. Estado OTP_PENDING

**Condiciones durante OTP_PENDING**:
- El gate puede estar en estado `PENDING` (esperando código)
- El gate puede transitar a `VERIFIED` (código correcto) → `RegistroAttempt` transita a `OTP_VERIFIED`
- El gate puede transitar a `FAILED` (código incorrecto después de intentos) → `RegistroAttempt` transita a `FAILED`
- El gate puede transitar a `FAILED` por TIMEOUT → `RegistroAttempt` transita a `FAILED`

**Regla explícita**: Mientras el `RegistroAttempt` está en `OTP_PENDING`, el gate `whatsapp_gate` NO puede estar en estado `VERIFIED` ni `FAILED` de forma permanente hasta que se complete la verificación o falle definitivamente.

#### 6.1.3. Transición OTP_PENDING → OTP_VERIFIED

**Condición**: El gate `whatsapp_gate` debe estar en estado `VERIFIED` (señal PASS recibida)

**Acción**:
- El `RegistroAttempt` transita a estado `OTP_VERIFIED`
- Se puede proceder a `ROLE_PENDING`

**Regla explícita**: Esta transición requiere que el gate esté explícitamente en estado `VERIFIED`. No hay transición automática ni implícita.

#### 6.1.4. Transición OTP_PENDING → FAILED

**Condiciones**:
- El gate `whatsapp_gate` transita a estado `FAILED` (señal FAIL o TIMEOUT)
- Se han agotado los intentos de verificación
- El proveedor reporta error que impide la verificación

**Acción**:
- El `RegistroAttempt` transita a estado `FAILED`
- El intento de registro termina

**Regla explícita**: Una vez que el `RegistroAttempt` transita a `FAILED` por fallo del gate WhatsApp, no puede continuar el registro. Se requiere crear un nuevo `RegistroAttempt`.

### 6.2. Compatibilidad con FASE 1.2

**Regla explícita**: El registro mínimo funcional (FASE 1.2) puede operar sin el gate WhatsApp. La FASE 1.3 no invalida FASE 1.2. Un `RegistroAttempt` puede:

- Aprobarse directamente sin pasar por `OTP_PENDING` (FASE 1.2)
- O requerir verificación WhatsApp y pasar por `OTP_PENDING` → `OTP_VERIFIED` (FASE 1.3)

**Determinación**: La decisión de requerir verificación WhatsApp es una regla de negocio que se evalúa en `APPROVAL_PENDING`, no en el gate mismo.

### 6.3. Prerrequisito para Otros Gates

**Regla fundamental de FASE 1.1**: El gate `whatsapp_gate` es prerrequisito para todos los demás gates (`age_gate`, `payment_gate`).

**Aplicación en FASE 1.3**:
- Si `whatsapp_gate` está en estado `VERIFIED`, los otros gates pueden evaluarse
- Si `whatsapp_gate` está en estado `FAILED`, `BLOCKED`, o `DISABLED`, los otros gates NO pueden evaluarse
- Si `whatsapp_gate` está en estado `PENDING`, los otros gates esperan hasta que el gate WhatsApp se resuelva

---

## 7. Comportamiento ante Errores y Silencio del Proveedor

### 7.1. Principio de Fail-Closed

**Regla fundamental**: Ante cualquier error o ambigüedad del proveedor, el gate debe comportarse de forma fail-closed: si no hay confirmación explícita de éxito, el resultado es FAIL.

### 7.2. Errores del Proveedor

#### 7.2.1. Error al Enviar OTP

**Situación**: El proveedor (WAM) reporta error al intentar enviar el OTP.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED`
- Se genera evento `OTP_FAILED` con `reason_code: FAILED_OTP_SEND_ERROR`
- El `RegistroAttempt` puede transitar a `FAILED` o permanecer en `OTP_PENDING` según reglas de reintento

**Regla explícita**: Si el proveedor no confirma el envío exitoso, el gate NO puede emitir PASS ni mantener PENDING indefinidamente. Debe eventualmente emitir FAIL.

#### 7.2.2. Error al Verificar OTP

**Situación**: El proveedor reporta error al intentar verificar el código ingresado.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED` (si se agotaron intentos) o permanece en `PENDING` (si hay intentos disponibles)
- Se genera evento `OTP_FAILED` con `reason_code: FAILED_OTP_PROVIDER_ERROR`
- Si hay intentos disponibles, se permite reintento. Si no, el `RegistroAttempt` transita a `FAILED`

**Regla explícita**: Los errores del proveedor no se interpretan como éxito. Solo confirmación explícita de éxito permite PASS.

#### 7.2.3. Proveedor No Disponible

**Situación**: El proveedor no responde o está completamente no disponible.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `BLOCKED` con `reason_code: BLOCKED_PROVIDER_UNAVAILABLE`
- Se genera evento `WHATSAPP_GATE_BLOCKED`
- El `RegistroAttempt` transita a `DENIED` o `FAILED` según reglas de negocio

**Regla explícita**: La no disponibilidad del proveedor bloquea el gate. No se permite verificación mientras el proveedor no esté disponible.

### 7.3. Silencio del Proveedor

#### 7.3.1. Timeout de Respuesta

**Situación**: El proveedor no responde dentro del tiempo máximo esperado.

**Comportamiento**:
- Si el timeout ocurre durante envío de OTP: El gate emite señal FAIL, transita a `FAILED` con `reason_code: FAILED_OTP_SEND_ERROR`
- Si el timeout ocurre durante verificación: El gate emite señal TIMEOUT, transita a `FAILED` con `reason_code: FAILED_OTP_TIMEOUT`
- Se genera evento `OTP_TIMEOUT` o `OTP_FAILED` según corresponda
- El `RegistroAttempt` transita a `FAILED`

**Regla explícita**: El silencio del proveedor se interpreta como fallo. No se asume éxito por defecto.

#### 7.3.2. Respuesta Ambigua

**Situación**: El proveedor responde con un estado que no es claramente éxito ni fallo.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED` con `reason_code: FAILED_OTP_PROVIDER_ERROR`
- Se genera evento `OTP_FAILED`
- El `RegistroAttempt` transita a `FAILED`

**Regla explícita**: Solo respuestas explícitas de éxito permiten PASS. Cualquier ambigüedad resulta en FAIL.

### 7.4. Límites de Reintento

**Regla fundamental**: El gate puede permitir reintentos de verificación, pero con límites estrictos:

- **Límite de intentos de código**: Máximo número de veces que se puede ingresar un código incorrecto antes de FAIL
- **Límite de reenvíos de OTP**: Máximo número de veces que se puede solicitar reenvío de OTP
- **Límite de tiempo total**: Tiempo máximo desde el primer envío hasta la verificación exitosa

**Comportamiento al exceder límites**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED` con `reason_code: FAILED_OTP_MAX_ATTEMPTS` o `FAILED_OTP_TIMEOUT`
- El `RegistroAttempt` transita a `FAILED`

**Regla explícita**: Los límites son estrictos. Una vez excedidos, no se permiten más intentos sin crear un nuevo `RegistroAttempt`.

---

## 8. Kill-Switch del Gate WhatsApp

### 8.1. Definición

El kill-switch del gate WhatsApp es un mecanismo de control que permite desactivar completamente el gate `whatsapp_gate` de forma inmediata y segura, sin dejar estados inconsistentes.

### 8.2. Estados del Kill-Switch

El kill-switch del gate puede estar en los siguientes estados:

- `INACTIVE`: El kill-switch no está activo, el gate opera normalmente
- `ACTIVE_BLOCK`: El kill-switch está activo, bloquea todas las verificaciones nuevas y en curso
- `ACTIVE_GRACEFUL`: El kill-switch está activo, bloquea verificaciones nuevas pero permite completar verificaciones en curso

### 8.3. Comportamiento del Kill-Switch

#### 8.3.1. Kill-Switch INACTIVE

**Comportamiento**: El gate opera normalmente según sus reglas.

#### 8.3.2. Kill-Switch ACTIVE_BLOCK

**Comportamiento**:
- Todas las solicitudes nuevas de verificación son rechazadas inmediatamente
- El gate transita a estado `BLOCKED` para todos los intentos nuevos
- Los intentos en curso también son bloqueados (el gate transita a `BLOCKED`)
- Se genera evento `WHATSAPP_GATE_BLOCKED` para cada intento afectado
- Los `RegistroAttempt` afectados transitan a `DENIED` con `reason_code: DENIED_WHATSAPP_GATE_BLOCKED`

**Regla explícita**: ACTIVE_BLOCK tiene prioridad absoluta. No se permite ninguna verificación mientras esté activo.

#### 8.3.3. Kill-Switch ACTIVE_GRACEFUL

**Comportamiento**:
- Las solicitudes nuevas de verificación son rechazadas
- El gate transita a estado `BLOCKED` para intentos nuevos
- Los intentos en curso pueden completarse (si están en `OTP_PENDING` y el usuario ingresa código antes de timeout)
- Una vez que un intento en curso completa o falla, no se permiten nuevos intentos
- Se genera evento `WHATSAPP_GATE_BLOCKED` solo para intentos nuevos

**Regla explícita**: ACTIVE_GRACEFUL permite completar verificaciones en curso pero bloquea nuevas. Es una transición más suave que ACTIVE_BLOCK.

### 8.4. Activación y Desactivación

**Activación**:
- Solo puede ser activado mediante mecanismos administrativos explícitos
- La activación es inmediata y afecta a todos los intentos según el modo
- Se registra evento de auditoría

**Desactivación**:
- Solo puede ser desactivado mediante mecanismos administrativos explícitos
- La desactivación no restaura intentos bloqueados
- Los intentos bloqueados requieren crear nuevo `RegistroAttempt`
- Se registra evento de auditoría

### 8.5. Persistencia

**Regla fundamental**: El estado del kill-switch es persistente y sobrevive a reinicios del sistema. Si el kill-switch está activo, permanece activo después de reinicio.

### 8.6. Prioridad

**Regla explícita**: El kill-switch del gate tiene prioridad absoluta sobre todas las demás decisiones del gate. Si el kill-switch está activo, no se evalúan señales, no se consulta al proveedor, y no se permite verificación.

---

## 9. Integración con WAM

### 9.1. WAM como Proveedor Delegado

**Definición**: WAM (WhatsApp Enmascarado) es el proveedor externo al que se delega la ejecución técnica de la verificación WhatsApp.

**Responsabilidades de WAM** (según documentación existente):
- Enviar códigos OTP mediante WhatsApp
- Validar códigos OTP ingresados
- Reportar resultados de envío y verificación

**Responsabilidades de Elixir** (este documento):
- Definir qué se verifica y qué no se verifica
- Interpretar las respuestas de WAM
- Controlar el impacto en la máquina de estados
- Gestionar errores y timeouts

### 9.2. Contrato con WAM

**Regla fundamental**: Elixir no asume comportamiento interno de WAM. Elixir solo define:

- **Qué solicita**: Envío de OTP a un número, validación de código
- **Qué acepta como respuesta**: Confirmación de envío exitoso, confirmación de código correcto, reporte de errores
- **Cómo interpreta las respuestas**: Mapeo a señales (PASS, FAIL, PENDING, TIMEOUT)

**Regla explícita**: Elixir no define cómo WAM implementa el envío ni la validación. Solo define el contrato de entrada y salida.

### 9.3. Independencia de WAM

**Regla fundamental**: El gate WhatsApp puede operar con cualquier proveedor que cumpla el contrato. WAM es el proveedor actual, pero el gate no está acoplado a WAM específicamente.

**Implicación**: Si WAM cambia o se reemplaza, el modelo lógico del gate permanece igual. Solo cambia la implementación del proveedor.

---

## 10. Invariantes del Gate

### 10.1. Invariante D0 (Elixir no custodia datos)

**Enunciado**: El gate WhatsApp no almacena números de teléfono en claro. Solo mantiene hashes y estados binarios.

**Aplicación en el gate**:
- El gate opera con `phone_number_hash`, nunca con el número en claro
- Los eventos no contienen números en claro
- Las señales no exponen información del número
- El proveedor (WAM) puede tener el número, pero Elixir no lo custodia

**Violación**: Cualquier almacenamiento de número en claro viola este invariante.

### 10.2. Invariante Default Deny

**Enunciado**: El gate inicia en estado de denegación implícita. Solo señales explícitas pueden cambiar el estado hacia verificación.

**Aplicación en el gate**:
- Estado inicial: `DISABLED` o `PENDING` (implícitamente no verificado)
- Verificación exitosa: Solo mediante señal PASS explícita
- Fallo: Cualquier error o ambigüedad resulta en FAIL

**Violación**: Cualquier verificación automática sin señal explícita viola este invariante.

### 10.3. Invariante Apagabilidad

**Enunciado**: El gate puede ser apagado completamente mediante kill-switch sin dejar estados inconsistentes.

**Aplicación en el gate**:
- Kill-switch tiene prioridad absoluta
- Activación del kill-switch bloquea todas las verificaciones
- Los intentos bloqueados transitan a estados terminales consistentes
- El kill-switch es persistente

**Violación**: Cualquier estado que no respete el kill-switch o que deje intentos inconsistentes viola este invariante.

---

## 11. Compatibilidad con FASE 1.1 y FASE 1.2

### 11.1. Compatibilidad con FASE 1.1

**Verificación**:
- ✅ El gate `whatsapp_gate` está definido en FASE 1.1 con estados compatibles
- ✅ Los estados del gate (DISABLED, PENDING, VERIFIED, FAILED, BLOCKED) son los definidos en FASE 1.1
- ✅ Las transiciones de la máquina de estados (PHONE_PENDING → OTP_PENDING → OTP_VERIFIED) son compatibles
- ✅ Los eventos (OTP_SENT, OTP_VERIFIED, OTP_FAILED) son compatibles
- ✅ El gate es prerrequisito para otros gates, como se define en FASE 1.1

**Extensión**: FASE 1.3 extiende FASE 1.1 definiendo el comportamiento específico del gate, sin modificar el modelo base.

### 11.2. Compatibilidad con FASE 1.2

**Verificación**:
- ✅ FASE 1.2 permite registro mínimo funcional sin verificación WhatsApp
- ✅ FASE 1.3 no invalida FASE 1.2: un `RegistroAttempt` puede aprobarse sin pasar por `OTP_PENDING`
- ✅ Si se requiere verificación WhatsApp, FASE 1.3 define cómo opera el gate
- ✅ Los dos modelos pueden coexistir: registro mínimo funcional (FASE 1.2) y registro con verificación WhatsApp (FASE 1.3)

**Regla explícita**: La decisión de requerir verificación WhatsApp es una regla de negocio evaluada en `APPROVAL_PENDING`, no en el gate mismo. El gate solo se activa si se requiere verificación.

---

## 12. Límites y Restricciones

### 12.1. Límites del Gate

El gate WhatsApp tiene los siguientes límites:

- **Funcionalidad mínima**: Solo verifica capacidad de recibir OTP y código correcto
- **Sin identidad**: No establece ni valida identidad
- **Sin otros verificaciones**: No reemplaza verificación de edad, pago, etc.
- **Delegado**: No ejecuta la verificación directamente, la delega a proveedor

### 12.2. Restricciones de Implementación

El modelo lógico del gate NO especifica:

- Implementación técnica del proveedor (WAM)
- Algoritmos de hash específicos
- Límites numéricos específicos (tiempos, intentos) - estos son configurables
- Detalles de UI/UX (el diseño UX está cerrado)
- Protocolo de comunicación con el proveedor (solo define contrato)

### 12.3. Restricciones Absolutas

El gate **NO puede**:

- ❌ Almacenar números de teléfono en claro (invariante D0)
- ❌ Verificar identidad, edad, o capacidad de pago
- ❌ Emitir señales contradictorias o múltiples señales simultáneas
- ❌ Operar sin kill-switch funcional
- ❌ Asumir éxito por defecto ante errores o silencio del proveedor
- ❌ Modificar el modelo de FASE 1.1 o invalidar FASE 1.2

---

## 13. Criterios de Cierre de FASE 1.3

### 13.1. Criterios Cumplidos

✅ **Concepto inequívoco**: La verificación WhatsApp como gate delegado está definida de forma canónica en las secciones 2 y 3  
✅ **Qué verifica y qué NO verifica**: Definido explícitamente en sección 2.2  
✅ **Señales del gate**: Definidas en sección 3.2 (PASS, FAIL, PENDING, TIMEOUT)  
✅ **Eventos y reason codes**: Definidos en sección 5  
✅ **Impacto en máquina de estados**: Definido en sección 6, compatible con FASE 1.1  
✅ **Comportamiento ante errores**: Definido en sección 7, fail-closed garantizado  
✅ **Kill-switch del gate**: Definido en sección 8, con prioridad absoluta  
✅ **Sistema permanece default DENY**: Establecido en sección 10.2  
✅ **Compatible con FASE 1.1 y 1.2**: Verificado en sección 11  
✅ **Registrable en Git sin ambigüedad**: Este documento es canónico y normativo, listo para registro

### 13.2. Verificación de Restricciones Absolutas

✅ **Elixir Core sellado**: No se modifica ni referencia código de Core  
✅ **WAM existe y NO se redefine**: WAM se referencia como proveedor existente, no se redefine (sección 9)  
✅ **Sin custodia de datos personales**: Invariante D0 respetado (sección 10.1)  
✅ **Diseño UX cerrado**: No se define UX en este documento (sección 12.2)  
✅ **Sin validación de identidad**: Explícitamente excluido (sección 2.2)  
✅ **Sin avance a FASE 1.4**: Este documento solo define FASE 1.3

### 13.3. Verificación de Alcance Permitido

✅ **Qué es una verificación WhatsApp válida**: Definido en sección 2.1  
✅ **Señales posibles del gate**: Definidas en sección 3.2  
✅ **Eventos y reason codes**: Definidos en sección 5  
✅ **Impacto exacto en máquina de estados**: Definido en sección 6  
✅ **Comportamiento ante errores o silencio**: Definido en sección 7  
✅ **Kill-switch del gate**: Definido en sección 8

### 13.4. Estado de Cierre

**FASE 1.3 está CERRADA** cuando:

1. Este documento es aprobado formalmente
2. Todos los criterios de cierre (13.1-13.3) están verificados
3. El documento es registrado en Git como canónico
4. No quedan ambigüedades sobre qué es la verificación WhatsApp como gate delegado

**Resultado**: El modelo lógico de la verificación WhatsApp como gate delegado queda definido, cerrado y registrable como documento canónico en Git.

---

## 14. Estado del Documento

### 14.1. Canonicidad

Este documento es **canónico y normativo**. Define la única versión válida del modelo lógico de la verificación WhatsApp como gate delegado para la FASE 1.3.

### 14.2. Inmodificabilidad

Una vez aprobado, este documento:

- No admite reinterpretaciones
- No admite extensiones sin nueva aprobación formal
- No admite modificaciones sin proceso de decisión explícito
- Es la fuente de verdad única para implementaciones

### 14.3. Relación con Implementación

Este documento:

- Define QUÉ debe existir, no CÓMO implementarlo
- Es independiente de decisiones técnicas de implementación
- Debe ser respetado por toda implementación del gate WhatsApp
- No especifica código ejecutable ni detalles de implementación
- No modifica ni referencia código de Elixir Core (que es sellado e inmodificable)
- No redefine WAM (que existe y está documentado)

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación canónica y normativa - FASE 1.3 CERRADA  
**Aprobación**: Pendiente de aprobación formal  
**Fecha**: 2025


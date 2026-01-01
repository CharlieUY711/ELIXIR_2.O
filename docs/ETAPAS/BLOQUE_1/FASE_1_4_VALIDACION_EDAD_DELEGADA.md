# FASE 1.4 — Validación de Edad Delegada

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Base Operativa Mínima  
**Bloque**: BLOQUE 1 — Registro Unificado  
**Fase**: FASE 1.4 — Validación de edad como gate delegado obligatorio con kill-switch  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Contexto Normativo

### 1.1. Principios Fundamentales

Este documento define el modelo lógico canónico de la validación de edad como gate delegado obligatorio en Elixir Platform. El modelo es:

- **Declarativo**: Define qué verifica y qué no verifica, no cómo se implementa
- **Normativo**: Establece reglas obligatorias que toda implementación debe respetar
- **Canónico**: Es la única fuente de verdad para el gate de validación de edad
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones
- **Delegado**: La validación se delega a un proveedor externo, Elixir no ejecuta la validación directamente
- **Obligatorio**: Cuando está habilitado, el gate es obligatorio y no evitable
- **Fail-closed**: Ante cualquier error o ambigüedad, el sistema deniega

### 1.2. Relación con Fases Previas

Este documento se basa en:

- **FASE 1.1**: Modelo lógico y máquina de estados que define `age_gate` como gate de verificación
- **FASE 1.2**: Registro mínimo funcional que no requiere verificación de edad
- **FASE 1.3**: Verificación WhatsApp como gate delegado (modelo de referencia)

La FASE 1.4 extiende el modelo de FASE 1.1 agregando la definición completa del gate `age_gate` como gate delegado obligatorio, sin modificar el modelo base ni invalidar FASE 1.2 o FASE 1.3.

### 1.3. Invariantes Globales

El gate de validación de edad respeta los mismos invariantes fundamentales definidos en FASE 1.1:

1. **D0 (Elixir no custodia datos)**: El sistema no almacena documentos, fechas de nacimiento, ni calcula edad internamente
2. **Default Deny**: El gate inicia en estado de denegación implícita. Solo señales explícitas pueden cambiar el estado hacia verificación
3. **Apagabilidad**: El gate puede ser apagado completamente mediante kill-switch sin dejar estados inconsistentes

### 1.4. Principio Rector

**"Si no se puede validar la edad, el sistema no debe avanzar."**

El gate de edad delega la ejecución de la validación a un proveedor externo, pero Elixir controla:
- Qué se verifica y qué no se verifica
- Qué señales acepta del proveedor
- Cómo interpreta esas señales
- Qué impacto tiene en la máquina de estados
- Cómo se comporta ante errores o silencio
- Cómo se apaga mediante kill-switch

### 1.5. Obligatoriedad del Gate

**Regla fundamental**: Cuando el gate `age_gate` está habilitado (no está en estado `DISABLED`), es **obligatorio** y **no evitable**. No existe bypass posible. El sistema no puede avanzar a `APPROVED` sin que el gate esté en estado `VERIFIED`.

**Aplicación**:
- Si `age_gate` está habilitado y no está `VERIFIED`, el registro NO puede ser aprobado
- Si `age_gate` está `DISABLED`, el registro puede proceder sin verificación de edad (según reglas de negocio)
- Si `age_gate` está `BLOCKED` (kill-switch activo), el registro NO puede ser aprobado
- Si `age_gate` está `FAILED`, el registro NO puede ser aprobado

---

## 2. Qué Significa "Edad Validada" Dentro de Elixir

### 2.1. Enunciado Canónico

**"Edad validada"** dentro de Elixir significa **únicamente** que:

1. **Un proveedor externo ha confirmado que la persona cumple el requisito de edad mínimo**: El proveedor ha verificado mediante documentos o métodos que la persona tiene al menos la edad mínima requerida para el registro
2. **La confirmación es explícita y verificable**: El proveedor ha emitido una confirmación explícita de que la validación fue exitosa, no una inferencia ni una asunción

### 2.2. Qué NO Significa "Edad Validada"

**"Edad validada"** dentro de Elixir **NO** significa:

- ❌ **Conocer la edad exacta**: Elixir no conoce ni almacena la edad exacta de la persona
- ❌ **Calcular edad internamente**: Elixir no calcula edad a partir de fechas de nacimiento
- ❌ **Almacenar documentos**: Elixir no almacena documentos de identidad ni fechas de nacimiento
- ❌ **Verificar identidad**: No verifica quién es la persona, solo que cumple el requisito de edad
- ❌ **Validar documentos**: No valida la autenticidad de documentos, solo acepta la confirmación del proveedor
- ❌ **Garantizar cumplimiento futuro**: No garantiza que la persona seguirá cumpliendo el requisito en el futuro
- ❌ **Verificar capacidad legal**: No verifica capacidad legal más allá del requisito de edad mínimo

### 2.3. Alcance de la Validación

**Lo que el gate verifica es mínimo y binario**:

- La persona cumple el requisito de edad mínimo (sí/no)
- El proveedor ha confirmado explícitamente esta condición

**Lo que el gate NO verifica es todo lo demás**:

- No establece identidad completa
- No valida legitimidad de documentos
- No confirma propósito del registro
- No garantiza comportamiento futuro
- No calcula ni almacena edad

### 2.4. Implicaciones Operativas

Como consecuencia de esta definición:

- **El gate habilita**: Que el sistema pueda considerar que la persona cumple el requisito de edad mínimo
- **El gate NO habilita**: Acceso a funcionalidades que requieren verificación de identidad completa, capacidad de pago, o otras verificaciones
- **El gate es obligatorio**: Cuando está habilitado, es prerrequisito obligatorio para aprobación
- **El gate es delegado**: La ejecución técnica se delega a un proveedor externo, pero Elixir controla el resultado
- **El gate es binario**: Solo hay dos resultados posibles: cumple el requisito (VERIFIED) o no cumple/no se puede verificar (FAILED/BLOCKED)

---

## 3. Señales del Gate

### 3.1. Definición de Señal

Una **señal** es el resultado que el gate `age_gate` emite después de evaluar una solicitud de validación. Las señales son binarias y deterministas: el gate emite una y solo una señal por solicitud.

### 3.2. Señales Posibles

El gate `age_gate` puede emitir las siguientes señales:

#### 3.2.1. PASS

**Definición**: El gate ha verificado exitosamente que la persona cumple el requisito de edad mínimo.

**Condiciones**:
- El proveedor externo ha confirmado explícitamente que la persona cumple el requisito de edad mínimo
- La confirmación es verificable y no ambigua
- No hay errores técnicos ni bloqueos activos
- El kill-switch del gate no está activo

**Impacto en estado**: El gate transita a estado `VERIFIED`

**Regla explícita**: PASS solo puede ocurrir si el proveedor confirma explícitamente que se cumple el requisito. Si falta confirmación explícita, el resultado NO es PASS.

#### 3.2.2. FAIL

**Definición**: El gate ha determinado que la validación no puede completarse exitosamente o que la persona no cumple el requisito.

**Condiciones**:
- El proveedor ha confirmado que la persona NO cumple el requisito de edad mínimo
- El proveedor reporta error técnico que impide la validación
- Se ha excedido el límite de intentos de validación
- El proveedor no puede verificar el requisito (documentos inválidos, información insuficiente, etc.)

**Impacto en estado**: El gate transita a estado `FAILED`

**Regla explícita**: FAIL es terminal para ese intento de registro. Una vez que el gate emite FAIL, no puede emitir PASS sin iniciar un nuevo `RegistroAttempt`.

#### 3.2.3. PENDING

**Definición**: El gate está esperando acción del usuario o respuesta del proveedor.

**Condiciones**:
- Se ha iniciado la validación pero aún no se ha recibido confirmación del proveedor
- Se está esperando que el usuario proporcione documentos o información necesaria
- El proveedor está procesando la validación

**Impacto en estado**: El gate permanece en estado `PENDING`

**Regla explícita**: PENDING es temporal. El gate debe eventualmente transicionar a PASS, FAIL, o TIMEOUT. No puede permanecer en PENDING indefinidamente.

#### 3.2.4. TIMEOUT

**Definición**: El gate ha excedido el tiempo máximo permitido para completar la validación.

**Condiciones**:
- Ha transcurrido el tiempo máximo desde el inicio de la validación sin recibir confirmación del proveedor
- Ha transcurrido el tiempo máximo esperando respuesta del proveedor
- El proceso de validación ha expirado según las reglas del sistema

**Impacto en estado**: El gate transita a estado `FAILED` con `reason_code: FAILED_AGE_CHECK_TIMEOUT`

**Regla explícita**: TIMEOUT es equivalente a FAIL para efectos de la máquina de estados. El gate no puede emitir PASS después de TIMEOUT sin iniciar un nuevo intento.

### 3.3. Exclusividad de Señales

**Regla fundamental**: El gate emite una y solo una señal por solicitud de validación. No puede emitir múltiples señales simultáneamente ni señales contradictorias.

**Orden de prioridad** (si hay ambigüedad):
1. BLOCKED tiene prioridad sobre todas las demás (si está bloqueado, no se evalúa)
2. FAIL tiene prioridad sobre PENDING (si hay error, no se mantiene pendiente)
3. TIMEOUT tiene prioridad sobre PENDING (si expira, no se mantiene pendiente)

---

## 4. Estados del Gate

### 4.1. Estados Posibles

El gate `age_gate` puede estar en los siguientes estados (definidos en FASE 1.1):

- `DISABLED`: El gate no está habilitado o no aplica
- `PENDING`: El gate está pendiente de validación
- `VERIFIED`: El gate ha sido verificado exitosamente
- `FAILED`: El gate ha fallado la validación
- `BLOCKED`: El gate está bloqueado (por kill-switch o límites operativos)

### 4.2. Mapeo de Señales a Estados

| Señal | Estado Resultante | Condición |
|-------|-------------------|-----------|
| PASS | `VERIFIED` | Validación exitosa |
| FAIL | `FAILED` | Validación fallida |
| PENDING | `PENDING` | Esperando acción o respuesta |
| TIMEOUT | `FAILED` | Tiempo excedido |

**Regla explícita**: El estado `BLOCKED` no se alcanza mediante señales del gate. Solo se alcanza mediante activación explícita del kill-switch o límites operativos.

### 4.3. Transiciones de Estado

Las siguientes transiciones son las únicas permitidas:

```
DISABLED → PENDING (cuando se inicia validación)
PENDING → VERIFIED (señal PASS)
PENDING → FAILED (señal FAIL o TIMEOUT)
VERIFIED → (terminal, no transiciona)
FAILED → PENDING (nuevo intento de validación)
Cualquier estado → BLOCKED (kill-switch activo)
BLOCKED → DISABLED (kill-switch desactivado, pero requiere nuevo intento)
```

**Regla explícita**: Una vez que el gate alcanza `VERIFIED`, no puede retroceder a otros estados sin iniciar un nuevo `RegistroAttempt`. El estado `VERIFIED` es persistente para ese intento de registro.

**Regla crítica**: Si el gate está en estado `VERIFIED` y el kill-switch se activa, el gate transita a `BLOCKED` y el `RegistroAttempt` debe transitar a `DENIED`, incluso si previamente estaba en camino a `APPROVED`.

---

## 5. Eventos y Reason Codes

### 5.1. Eventos del Gate

El gate `age_gate` genera los siguientes eventos (compatibles con FASE 1.1):

#### 5.1.1. Eventos de Inicio

- `AGE_GATE_INITIATED`: Se inició un intento de validación de edad
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `PENDING`

#### 5.1.2. Eventos de Proceso

- `AGE_CHECK_SUBMITTED`: Se envió información al proveedor para validación
  - Atributos: `attempt_id`, `timestamp`, `provider_response_status`
  - Estado resultante: `PENDING`

- `AGE_CHECK_VERIFICATION_ATTEMPTED`: Se intentó verificar información con el proveedor
  - Atributos: `attempt_id`, `timestamp`, `attempt_number`
  - Estado resultante: `PENDING` (si aún hay intentos disponibles) o `FAILED` (si se agotaron)

#### 5.1.3. Eventos de Resultado

- `AGE_CHECK_VERIFIED`: Se verificó exitosamente que la persona cumple el requisito de edad
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `VERIFIED`
  - Señal: PASS

- `AGE_CHECK_FAILED`: Falló la verificación de edad
  - Atributos: `attempt_id`, `timestamp`, `reason_code`
  - Estado resultante: `FAILED` (si se agotaron intentos) o `PENDING` (si aún hay intentos)
  - Señal: FAIL

- `AGE_CHECK_TIMEOUT`: Expiró el tiempo para verificar la edad
  - Atributos: `attempt_id`, `timestamp`, `timeout_duration`
  - Estado resultante: `FAILED`
  - Señal: TIMEOUT

#### 5.1.4. Eventos de Control

- `AGE_GATE_BLOCKED`: El gate fue bloqueado por kill-switch o límites operativos
  - Atributos: `attempt_id`, `timestamp`, `reason_code`
  - Estado resultante: `BLOCKED`

- `AGE_GATE_UNBLOCKED`: El gate fue desbloqueado
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `DISABLED` (requiere nuevo intento)

- `GATE_STATUS_CHANGED`: Cambió el estado del gate (definido en FASE 1.1)
  - Atributos: `attempt_id`, `gate_name: 'age_gate'`, `old_state`, `new_state`, `timestamp`

### 5.2. Reason Codes Específicos

Los siguientes `reason_code` son específicos del gate de edad:

#### 5.2.1. Códigos de Verificación Exitosa

- `AGE_VERIFIED_NORMAL`: Verificación exitosa normal
- `AGE_VERIFIED_RETRY`: Verificación exitosa después de reintento

#### 5.2.2. Códigos de Fallo

- `FAILED_AGE_CHECK_BELOW_MINIMUM`: La persona no cumple el requisito de edad mínimo
- `FAILED_AGE_CHECK_TIMEOUT`: Tiempo excedido para verificar edad
- `FAILED_AGE_CHECK_PROVIDER_ERROR`: Error del proveedor durante validación
- `FAILED_AGE_CHECK_INVALID_DOCUMENTS`: Documentos inválidos o insuficientes
- `FAILED_AGE_CHECK_INSUFFICIENT_INFO`: Información insuficiente para validar
- `FAILED_AGE_CHECK_MAX_ATTEMPTS`: Se excedió el máximo de intentos de validación

#### 5.2.3. Códigos de Bloqueo

- `BLOCKED_AGE_CHECK_KILLSWITCH_ACTIVE`: Bloqueado por kill-switch activo
- `BLOCKED_AGE_CHECK_OPERATIONAL_LIMITS`: Bloqueado por límites operativos
- `BLOCKED_AGE_CHECK_PROVIDER_UNAVAILABLE`: Bloqueado porque el proveedor no está disponible

#### 5.2.4. Códigos de Estado Pendiente

- `PENDING_AGE_CHECK_SUBMITTED`: Validación enviada, esperando confirmación
- `PENDING_AGE_CHECK_VERIFYING`: Verificando información con proveedor
- `PENDING_AGE_CHECK_PROVIDER_RESPONSE`: Esperando respuesta del proveedor

### 5.3. Uso de Reason Codes

**Reglas**:
- Todo evento de resultado (`AGE_CHECK_VERIFIED`, `AGE_CHECK_FAILED`, `AGE_CHECK_TIMEOUT`) debe incluir un `reason_code`
- Los `reason_code` son inmutables una vez establecidos
- Los `reason_code` no exponen información sensible (invariante D0)
- Los `reason_code` no revelan edad exacta ni datos personales
- Los `reason_code` permiten auditoría sin revelar detalles técnicos del proveedor

---

## 6. Impacto en la Máquina de Estados

### 6.1. Integración con FASE 1.1

El gate `age_gate` se integra con la máquina de estados definida en FASE 1.1 de la siguiente manera:

#### 6.1.1. Prerrequisito: WhatsApp Gate

**Regla fundamental de FASE 1.1**: El gate `whatsapp_gate` es prerrequisito para todos los demás gates, incluyendo `age_gate`.

**Aplicación**:
- El gate `age_gate` solo puede iniciarse si `whatsapp_gate` está en estado `VERIFIED`
- Si `whatsapp_gate` está en estado `FAILED`, `BLOCKED`, o `DISABLED`, el gate `age_gate` NO puede iniciarse
- Si `whatsapp_gate` está en estado `PENDING`, el gate `age_gate` espera hasta que el gate WhatsApp se resuelva

#### 6.1.2. Transición a APPROVAL_PENDING

**Condición**: El `RegistroAttempt` puede transitar a `APPROVAL_PENDING` solo si:
- El gate `whatsapp_gate` está en estado `VERIFIED`
- El rol ha sido seleccionado
- El gate `age_gate` puede estar en cualquier estado (según reglas de negocio)

**Regla explícita**: El gate `age_gate` puede estar en estado `PENDING` o `DISABLED` cuando se transita a `APPROVAL_PENDING`, pero NO puede estar en estado `FAILED` o `BLOCKED` si se requiere verificación de edad.

#### 6.1.3. Estado APPROVAL_PENDING

**Condiciones durante APPROVAL_PENDING**:

**Si el gate `age_gate` está habilitado (no está `DISABLED`)**:
- El gate DEBE estar en estado `VERIFIED` para que el intento pueda transitar a `APPROVED`
- Si el gate está en estado `PENDING`, el intento permanece en `APPROVAL_PENDING` esperando resolución
- Si el gate está en estado `FAILED`, el intento DEBE transitar a `DENIED` con `reason_code: DENIED_AGE_VERIFICATION_FAILED`
- Si el gate está en estado `BLOCKED`, el intento DEBE transitar a `DENIED` con `reason_code: DENIED_AGE_CHECK_BLOCKED`

**Si el gate `age_gate` está `DISABLED`**:
- El gate NO bloquea la aprobación
- El intento puede proceder a `APPROVED` si se cumplen las demás condiciones (según reglas de negocio)

**Regla explícita**: Si el gate está habilitado y no está `VERIFIED`, el intento NO puede transitar a `APPROVED`. No existe bypass posible.

#### 6.1.4. Transición APPROVAL_PENDING → APPROVED

**Condición obligatoria**: Si el gate `age_gate` está habilitado (no está `DISABLED`), DEBE estar en estado `VERIFIED`.

**Condiciones completas** (según FASE 1.1):
1. El intento está en estado `APPROVAL_PENDING`
2. El gate `whatsapp_gate` está en estado `VERIFIED`
3. El rol está seleccionado
4. El kill-switch global está `INACTIVE`
5. **El gate `age_gate` está `VERIFIED` (si está habilitado) o `DISABLED` (si no se requiere)**
6. No se han excedido límites operativos

**Regla explícita**: Si el gate `age_gate` está habilitado y no está `VERIFIED`, la transición a `APPROVED` está **prohibida**. El intento debe permanecer en `APPROVAL_PENDING` o transitar a `DENIED`.

#### 6.1.5. Transición APPROVAL_PENDING → DENIED

**Condiciones obligatorias**: El intento DEBE transitar a `DENIED` si:

1. El gate `age_gate` está habilitado y está en estado `FAILED` → `reason_code: DENIED_AGE_VERIFICATION_FAILED`
2. El gate `age_gate` está habilitado y está en estado `BLOCKED` → `reason_code: DENIED_AGE_CHECK_BLOCKED`
3. El gate `age_gate` está `DISABLED` pero el registro requiere verificación de edad (según reglas de negocio) → `reason_code: DENIED_AGE_CHECK_DISABLED`
4. El kill-switch del gate `age_gate` está activo → `reason_code: DENIED_AGE_CHECK_BLOCKED`

**Regla explícita**: El gate `age_gate` tiene prioridad en la evaluación de denegación. Si el gate está habilitado y no está `VERIFIED`, el intento NO puede ser aprobado.

### 6.2. Compatibilidad con FASE 1.2

**Regla explícita**: El registro mínimo funcional (FASE 1.2) puede operar sin el gate de edad. La FASE 1.4 no invalida FASE 1.2. Un `RegistroAttempt` puede:

- Aprobarse directamente sin pasar por validación de edad (FASE 1.2)
- O requerir validación de edad y pasar por `APPROVAL_PENDING` con gate `age_gate` en `VERIFIED` (FASE 1.4)

**Determinación**: La decisión de requerir validación de edad es una regla de negocio que se evalúa en `APPROVAL_PENDING`, no en el gate mismo.

### 6.3. Compatibilidad con FASE 1.3

**Regla explícita**: El gate `whatsapp_gate` es prerrequisito para el gate `age_gate`. La FASE 1.4 no modifica esta regla de FASE 1.1 y FASE 1.3.

**Aplicación**:
- Si `whatsapp_gate` está en estado `VERIFIED`, el gate `age_gate` puede iniciarse
- Si `whatsapp_gate` está en estado `FAILED`, `BLOCKED`, o `DISABLED`, el gate `age_gate` NO puede iniciarse
- Si `whatsapp_gate` está en estado `PENDING`, el gate `age_gate` espera hasta que el gate WhatsApp se resuelva

---

## 7. Comportamiento ante Errores y Silencio del Proveedor

### 7.1. Principio de Fail-Closed

**Regla fundamental**: Ante cualquier error o ambigüedad del proveedor, el gate debe comportarse de forma fail-closed: si no hay confirmación explícita de éxito, el resultado es FAIL.

**Aplicación explícita**:
- Si el proveedor no responde → FAIL
- Si el proveedor responde con error → FAIL
- Si el proveedor responde con ambigüedad → FAIL
- Si el proveedor no puede verificar → FAIL
- Solo confirmación explícita de éxito → PASS

### 7.2. Errores del Proveedor

#### 7.2.1. Error al Iniciar Validación

**Situación**: El proveedor reporta error al intentar iniciar la validación de edad.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED`
- Se genera evento `AGE_CHECK_FAILED` con `reason_code: FAILED_AGE_CHECK_PROVIDER_ERROR`
- El `RegistroAttempt` transita a `DENIED` con `reason_code: DENIED_AGE_VERIFICATION_FAILED`

**Regla explícita**: Si el proveedor no confirma el inicio exitoso, el gate NO puede emitir PASS ni mantener PENDING indefinidamente. Debe eventualmente emitir FAIL.

#### 7.2.2. Error durante Validación

**Situación**: El proveedor reporta error durante el proceso de validación.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED` (si se agotaron intentos) o permanece en `PENDING` (si hay intentos disponibles)
- Se genera evento `AGE_CHECK_FAILED` con `reason_code: FAILED_AGE_CHECK_PROVIDER_ERROR`
- Si hay intentos disponibles, se permite reintento. Si no, el `RegistroAttempt` transita a `DENIED`

**Regla explícita**: Los errores del proveedor no se interpretan como éxito. Solo confirmación explícita de éxito permite PASS.

#### 7.2.3. Proveedor No Disponible

**Situación**: El proveedor no responde o está completamente no disponible.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `BLOCKED` con `reason_code: BLOCKED_AGE_CHECK_PROVIDER_UNAVAILABLE`
- Se genera evento `AGE_GATE_BLOCKED`
- El `RegistroAttempt` transita a `DENIED` con `reason_code: DENIED_AGE_CHECK_BLOCKED`

**Regla explícita**: La no disponibilidad del proveedor bloquea el gate. No se permite validación mientras el proveedor no esté disponible. El sistema NO puede avanzar sin validación de edad cuando el gate está habilitado.

### 7.3. Silencio del Proveedor

#### 7.3.1. Timeout de Respuesta

**Situación**: El proveedor no responde dentro del tiempo máximo esperado.

**Comportamiento**:
- Si el timeout ocurre durante inicio de validación: El gate emite señal FAIL, transita a `FAILED` con `reason_code: FAILED_AGE_CHECK_PROVIDER_ERROR`
- Si el timeout ocurre durante validación: El gate emite señal TIMEOUT, transita a `FAILED` con `reason_code: FAILED_AGE_CHECK_TIMEOUT`
- Se genera evento `AGE_CHECK_TIMEOUT` o `AGE_CHECK_FAILED` según corresponda
- El `RegistroAttempt` transita a `DENIED` con `reason_code: DENIED_AGE_VERIFICATION_FAILED`

**Regla explícita**: El silencio del proveedor se interpreta como fallo. No se asume éxito por defecto. El sistema NO puede avanzar sin confirmación explícita.

#### 7.3.2. Respuesta Ambigua

**Situación**: El proveedor responde con un estado que no es claramente éxito ni fallo.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED` con `reason_code: FAILED_AGE_CHECK_PROVIDER_ERROR`
- Se genera evento `AGE_CHECK_FAILED`
- El `RegistroAttempt` transita a `DENIED` con `reason_code: DENIED_AGE_VERIFICATION_FAILED`

**Regla explícita**: Solo respuestas explícitas de éxito permiten PASS. Cualquier ambigüedad resulta en FAIL. El sistema NO puede avanzar con ambigüedad.

### 7.4. Límites de Reintento

**Regla fundamental**: El gate puede permitir reintentos de validación, pero con límites estrictos:

- **Límite de intentos de validación**: Máximo número de veces que se puede intentar validar antes de FAIL
- **Límite de tiempo total**: Tiempo máximo desde el primer intento hasta la validación exitosa

**Comportamiento al exceder límites**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED` con `reason_code: FAILED_AGE_CHECK_MAX_ATTEMPTS` o `FAILED_AGE_CHECK_TIMEOUT`
- El `RegistroAttempt` transita a `DENIED` con `reason_code: DENIED_AGE_VERIFICATION_FAILED`

**Regla explícita**: Los límites son estrictos. Una vez excedidos, no se permiten más intentos sin crear un nuevo `RegistroAttempt`. El sistema NO puede avanzar sin validación exitosa.

---

## 8. Kill-Switch del Gate de Edad

### 8.1. Definición

El kill-switch del gate de edad es un mecanismo de control que permite desactivar completamente el gate `age_gate` de forma inmediata y segura, sin dejar estados inconsistentes. El kill-switch tiene **prioridad absoluta** sobre todas las demás decisiones del gate.

### 8.2. Estados del Kill-Switch

El kill-switch del gate puede estar en los siguientes estados:

- `INACTIVE`: El kill-switch no está activo, el gate opera normalmente
- `ACTIVE_BLOCK`: El kill-switch está activo, bloquea todas las validaciones nuevas y en curso
- `ACTIVE_GRACEFUL`: El kill-switch está activo, bloquea validaciones nuevas pero permite completar validaciones en curso

### 8.3. Comportamiento del Kill-Switch

#### 8.3.1. Kill-Switch INACTIVE

**Comportamiento**: El gate opera normalmente según sus reglas.

#### 8.3.2. Kill-Switch ACTIVE_BLOCK

**Comportamiento**:
- Todas las solicitudes nuevas de validación son rechazadas inmediatamente
- El gate transita a estado `BLOCKED` para todos los intentos nuevos
- Los intentos en curso también son bloqueados (el gate transita a `BLOCKED`)
- Se genera evento `AGE_GATE_BLOCKED` para cada intento afectado
- Los `RegistroAttempt` afectados transitan a `DENIED` con `reason_code: DENIED_AGE_CHECK_BLOCKED`
- **Regla crítica**: Incluso si un `RegistroAttempt` estaba en camino a `APPROVED` con el gate en `VERIFIED`, la activación del kill-switch bloquea el gate y el intento debe transitar a `DENIED`

**Regla explícita**: ACTIVE_BLOCK tiene prioridad absoluta. No se permite ninguna validación mientras esté activo. El sistema NO puede avanzar a `APPROVED` si el kill-switch está activo, incluso si el gate previamente estaba `VERIFIED`.

#### 8.3.3. Kill-Switch ACTIVE_GRACEFUL

**Comportamiento**:
- Las solicitudes nuevas de validación son rechazadas
- El gate transita a estado `BLOCKED` para intentos nuevos
- Los intentos en curso pueden completarse (si están en `PENDING` y el proveedor confirma antes de timeout)
- Una vez que un intento en curso completa o falla, no se permiten nuevos intentos
- Se genera evento `AGE_GATE_BLOCKED` solo para intentos nuevos
- **Regla crítica**: Si un intento en curso completa exitosamente (gate transita a `VERIFIED`), pero el kill-switch está activo, el intento NO puede transitar a `APPROVED`. El kill-switch tiene prioridad absoluta.

**Regla explícita**: ACTIVE_GRACEFUL permite completar validaciones en curso pero bloquea nuevas. Sin embargo, incluso si una validación en curso completa exitosamente, el kill-switch bloquea la aprobación del registro.

### 8.4. Activación y Desactivación

**Activación**:
- Solo puede ser activado mediante mecanismos administrativos explícitos
- La activación es inmediata y afecta a todos los intentos según el modo
- Se registra evento de auditoría
- **Prioridad absoluta**: Una vez activado, tiene prioridad sobre cualquier estado previo del gate

**Desactivación**:
- Solo puede ser desactivado mediante mecanismos administrativos explícitos
- La desactivación no restaura intentos bloqueados
- Los intentos bloqueados requieren crear nuevo `RegistroAttempt`
- Se registra evento de auditoría

### 8.5. Persistencia

**Regla fundamental**: El estado del kill-switch es persistente y sobrevive a reinicios del sistema. Si el kill-switch está activo, permanece activo después de reinicio.

### 8.6. Prioridad Absoluta

**Regla explícita**: El kill-switch del gate tiene **prioridad absoluta** sobre todas las demás decisiones del gate y del sistema de registro. Si el kill-switch está activo:

- No se evalúan señales del proveedor
- No se consulta al proveedor
- No se permite validación
- No se permite aprobación de registros, incluso si el gate previamente estaba `VERIFIED`
- El gate transita inmediatamente a `BLOCKED`
- Los `RegistroAttempt` afectados transitan a `DENIED`

**Aplicación crítica**: Si un `RegistroAttempt` está en `APPROVAL_PENDING` con el gate `age_gate` en estado `VERIFIED`, y el kill-switch se activa, el gate transita a `BLOCKED` y el intento debe transitar a `DENIED`, incluso si todas las demás condiciones de aprobación se cumplían.

### 8.7. Relación con Kill-Switch Global

**Regla explícita**: El kill-switch del gate `age_gate` es independiente del kill-switch global del sistema (definido en FASE 1.1). Ambos pueden estar activos simultáneamente, y ambos tienen prioridad absoluta en sus respectivos ámbitos.

**Aplicación**:
- Si el kill-switch global está activo, ningún `RegistroAttempt` puede avanzar a `APPROVED` (FASE 1.1)
- Si el kill-switch del gate `age_gate` está activo, ningún `RegistroAttempt` puede avanzar a `APPROVED` si requiere validación de edad (FASE 1.4)
- Si ambos están activos, el sistema está completamente bloqueado para aprobaciones

---

## 9. Integración con Proveedor Externo

### 9.1. Proveedor como Delegado

**Definición**: El proveedor externo es el sistema al que se delega la ejecución técnica de la validación de edad.

**Responsabilidades del Proveedor** (según contrato externo):
- Recibir información necesaria para validar edad
- Verificar que la persona cumple el requisito de edad mínimo
- Reportar resultados de validación (éxito/fallo)

**Responsabilidades de Elixir** (este documento):
- Definir qué se verifica y qué no se verifica
- Interpretar las respuestas del proveedor
- Controlar el impacto en la máquina de estados
- Gestionar errores y timeouts
- Controlar el kill-switch

### 9.2. Contrato con el Proveedor

**Regla fundamental**: Elixir no asume comportamiento interno del proveedor. Elixir solo define:

- **Qué solicita**: Validación de que la persona cumple el requisito de edad mínimo
- **Qué acepta como respuesta**: Confirmación explícita de éxito, reporte de fallo, reporte de error
- **Cómo interpreta las respuestas**: Mapeo a señales (PASS, FAIL, PENDING, TIMEOUT)

**Regla explícita**: Elixir no define cómo el proveedor implementa la validación. Solo define el contrato de entrada y salida.

**Regla crítica**: Elixir NO calcula edad internamente. Elixir NO almacena documentos ni fechas de nacimiento. Elixir solo acepta la confirmación binaria del proveedor (cumple/no cumple el requisito).

### 9.3. Independencia del Proveedor

**Regla fundamental**: El gate de edad puede operar con cualquier proveedor que cumpla el contrato. El proveedor actual puede cambiar o reemplazarse, pero el modelo lógico del gate permanece igual.

**Implicación**: Si el proveedor cambia o se reemplaza, el modelo lógico del gate permanece igual. Solo cambia la implementación del proveedor.

---

## 10. Invariantes del Gate

### 10.1. Invariante D0 (Elixir no custodia datos)

**Enunciado**: El gate de edad no almacena documentos, fechas de nacimiento, ni calcula edad internamente. Solo mantiene estados binarios y referencias necesarias para orquestación.

**Aplicación en el gate**:
- El gate opera con referencias opacas al proveedor, nunca con documentos en claro
- Los eventos no contienen documentos ni fechas de nacimiento
- Las señales no exponen información de edad exacta
- El proveedor puede tener documentos, pero Elixir no los custodia
- El gate solo mantiene el estado binario: `VERIFIED` (cumple requisito) o `FAILED`/`BLOCKED` (no cumple/no se puede verificar)

**Violación**: Cualquier almacenamiento de documentos, fechas de nacimiento, o cálculo de edad viola este invariante.

### 10.2. Invariante Default Deny

**Enunciado**: El gate inicia en estado de denegación implícita. Solo señales explícitas pueden cambiar el estado hacia verificación.

**Aplicación en el gate**:
- Estado inicial: `DISABLED` o `PENDING` (implícitamente no verificado)
- Verificación exitosa: Solo mediante señal PASS explícita
- Fallo: Cualquier error o ambigüedad resulta en FAIL
- **Regla crítica**: Si no se puede validar la edad, el sistema NO puede avanzar

**Violación**: Cualquier verificación automática sin señal explícita viola este invariante.

### 10.3. Invariante Apagabilidad

**Enunciado**: El gate puede ser apagado completamente mediante kill-switch sin dejar estados inconsistentes.

**Aplicación en el gate**:
- Kill-switch tiene prioridad absoluta
- Activación del kill-switch bloquea todas las validaciones
- Los intentos bloqueados transitan a estados terminales consistentes (`DENIED`)
- El kill-switch es persistente
- **Regla crítica**: Incluso si el gate estaba `VERIFIED`, la activación del kill-switch bloquea la aprobación

**Violación**: Cualquier estado que no respete el kill-switch o que deje intentos inconsistentes viola este invariante.

### 10.4. Invariante Obligatoriedad

**Enunciado**: Cuando el gate está habilitado, es obligatorio y no evitable. No existe bypass posible.

**Aplicación en el gate**:
- Si el gate está habilitado (no está `DISABLED`), DEBE estar `VERIFIED` para aprobar
- Si el gate está `FAILED` o `BLOCKED`, el registro NO puede ser aprobado
- No existe mecanismo para aprobar sin validación cuando el gate está habilitado
- El kill-switch tiene prioridad absoluta incluso sobre estados `VERIFIED` previos

**Violación**: Cualquier aprobación sin validación cuando el gate está habilitado viola este invariante.

---

## 11. Compatibilidad con FASE 1.1, 1.2 y 1.3

### 11.1. Compatibilidad con FASE 1.1

**Verificación**:
- ✅ El gate `age_gate` está definido en FASE 1.1 con estados compatibles
- ✅ Los estados del gate (DISABLED, PENDING, VERIFIED, FAILED, BLOCKED) son los definidos en FASE 1.1
- ✅ Las reglas de aprobación y denegación son compatibles con FASE 1.1
- ✅ El gate es prerrequisito para aprobación cuando está habilitado, como se define en FASE 1.1
- ✅ La regla `age_check DISABLED ⇒ NO APPROVAL` (FASE 1.1) se respeta: si el gate está `DISABLED` pero se requiere verificación, se deniega

**Extensión**: FASE 1.4 extiende FASE 1.1 definiendo el comportamiento específico del gate, sin modificar el modelo base.

### 11.2. Compatibilidad con FASE 1.2

**Verificación**:
- ✅ FASE 1.2 permite registro mínimo funcional sin verificación de edad
- ✅ FASE 1.4 no invalida FASE 1.2: un `RegistroAttempt` puede aprobarse sin pasar por validación de edad
- ✅ Si se requiere verificación de edad, FASE 1.4 define cómo opera el gate
- ✅ Los dos modelos pueden coexistir: registro mínimo funcional (FASE 1.2) y registro con verificación de edad (FASE 1.4)

**Regla explícita**: La decisión de requerir verificación de edad es una regla de negocio evaluada en `APPROVAL_PENDING`, no en el gate mismo. El gate solo se activa si se requiere verificación.

### 11.3. Compatibilidad con FASE 1.3

**Verificación**:
- ✅ El gate `whatsapp_gate` es prerrequisito para `age_gate`, como se define en FASE 1.1
- ✅ FASE 1.4 no modifica esta regla: `age_gate` solo puede iniciarse si `whatsapp_gate` está `VERIFIED`
- ✅ Los dos gates pueden operar secuencialmente: primero WhatsApp, luego edad
- ✅ El modelo de gate delegado de FASE 1.3 sirve como referencia para FASE 1.4

**Regla explícita**: La secuencia de gates es: `whatsapp_gate` → `age_gate`. No se puede validar edad sin verificar WhatsApp primero.

---

## 12. Límites y Restricciones

### 12.1. Límites del Gate

El gate de edad tiene los siguientes límites:

- **Funcionalidad mínima**: Solo verifica que la persona cumple el requisito de edad mínimo
- **Sin identidad**: No establece ni valida identidad completa
- **Sin otros verificaciones**: No reemplaza verificación de WhatsApp, pago, etc.
- **Delegado**: No ejecuta la validación directamente, la delega a proveedor
- **Binario**: Solo hay dos resultados: cumple (VERIFIED) o no cumple/no se puede verificar (FAILED/BLOCKED)

### 12.2. Restricciones de Implementación

El modelo lógico del gate NO especifica:

- Implementación técnica del proveedor
- Algoritmos de validación específicos
- Límites numéricos específicos (tiempos, intentos) - estos son configurables
- Detalles de UI/UX (el diseño UX está cerrado)
- Protocolo de comunicación con el proveedor (solo define contrato)
- Edad mínima específica (esto es configuración de negocio)

### 12.3. Restricciones Absolutas

El gate **NO puede**:

- ❌ Almacenar documentos de identidad (invariante D0)
- ❌ Almacenar fechas de nacimiento (invariante D0)
- ❌ Calcular edad internamente (invariante D0)
- ❌ Verificar identidad completa, capacidad de pago, o otras verificaciones
- ❌ Emitir señales contradictorias o múltiples señales simultáneas
- ❌ Operar sin kill-switch funcional
- ❌ Asumir éxito por defecto ante errores o silencio del proveedor
- ❌ Permitir bypass cuando está habilitado
- ❌ Modificar el modelo de FASE 1.1 o invalidar FASE 1.2 o FASE 1.3

---

## 13. Criterios de Cierre de FASE 1.4

### 13.1. Criterios Cumplidos

✅ **Concepto inequívoco**: La validación de edad como gate delegado obligatorio está definida de forma canónica en las secciones 2 y 3  
✅ **Qué verifica y qué NO verifica**: Definido explícitamente en sección 2.2  
✅ **Señales del gate**: Definidas en sección 3.2 (PASS, FAIL, PENDING, TIMEOUT)  
✅ **Eventos y reason codes**: Definidos en sección 5  
✅ **Impacto en máquina de estados**: Definido en sección 6, compatible con FASE 1.1  
✅ **Comportamiento ante errores**: Definido en sección 7, fail-closed garantizado  
✅ **Kill-switch del gate**: Definido en sección 8, con prioridad absoluta  
✅ **Sistema permanece default DENY**: Establecido en sección 10.2  
✅ **Gate es obligatorio y no evitable**: Establecido en sección 1.5 y 10.4  
✅ **age_check DISABLED implica bloqueo efectivo**: Establecido en sección 6.1.3 y 8  
✅ **Sistema es apagable en este punto**: Kill-switch definido en sección 8  
✅ **Compatible con FASE 1.1, 1.2 y 1.3**: Verificado en sección 11  
✅ **Registrable en Git sin ambigüedad**: Este documento es canónico y normativo, listo para registro

### 13.2. Verificación de Restricciones Absolutas

✅ **Elixir Core sellado**: No se modifica ni referencia código de Core  
✅ **Sin custodia de datos personales**: Invariante D0 respetado (sección 10.1)  
✅ **No se calcula edad internamente**: Explícitamente excluido (sección 2.2)  
✅ **No se almacenan documentos ni fechas**: Explícitamente excluido (sección 2.2)  
✅ **Diseño UX cerrado**: No se define UX en este documento (sección 12.2)  
✅ **Sin validación de identidad**: Explícitamente excluido (sección 2.2)  
✅ **Sin avance a otros bloques o etapas**: Este documento solo define FASE 1.4

### 13.3. Verificación de Alcance Permitido

✅ **Qué es una validación de edad válida**: Definido en sección 2.1  
✅ **Señales posibles del gate**: Definidas en sección 3.2  
✅ **Eventos y reason codes**: Definidos en sección 5  
✅ **Impacto exacto en máquina de estados**: Definido en sección 6  
✅ **Comportamiento ante errores o indisponibilidad**: Definido en sección 7  
✅ **Kill-switch del gate y precedencia**: Definido en sección 8

### 13.4. Verificación de Principio Rector

✅ **"Si no se puede validar la edad, el sistema no debe avanzar"**: 
- Establecido en sección 1.4
- Aplicado en sección 6.1.3 (gate obligatorio en APPROVAL_PENDING)
- Aplicado en sección 7 (fail-closed ante errores)
- Aplicado en sección 8 (kill-switch bloquea aprobación)
- Aplicado en sección 10.4 (invariante de obligatoriedad)

### 13.5. Estado de Cierre

**FASE 1.4 está CERRADA** cuando:

1. Este documento es aprobado formalmente
2. Todos los criterios de cierre (13.1-13.4) están verificados
3. El documento es registrado en Git como canónico
4. No quedan ambigüedades sobre qué es la validación de edad como gate delegado obligatorio

**Resultado**: El modelo lógico de la validación de edad como gate delegado obligatorio con kill-switch queda definido, cerrado y registrable como documento canónico en Git.

---

## 14. Estado del Documento

### 14.1. Canonicidad

Este documento es **canónico y normativo**. Define la única versión válida del modelo lógico de la validación de edad como gate delegado obligatorio para la FASE 1.4.

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
- Debe ser respetado por toda implementación del gate de edad
- No especifica código ejecutable ni detalles de implementación
- No modifica ni referencia código de Elixir Core (que es sellado e inmodificable)
- No define el proveedor externo específico (solo define el contrato)

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación canónica y normativa - FASE 1.4 CERRADA  
**Aprobación**: Pendiente de aprobación formal  
**Fecha**: 2025


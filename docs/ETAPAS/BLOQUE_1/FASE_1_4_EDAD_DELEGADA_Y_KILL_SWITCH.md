# FASE 1.4 — Edad Delegada + Kill-Switch

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Base Operativa Mínima  
**Bloque**: BLOQUE 1 — Registro Unificado  
**Fase**: FASE 1.4 — Validación de edad delegada y kill-switch  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Contexto Normativo

### 1.1. Principios Fundamentales

Este documento define el modelo lógico canónico de la validación de edad como gate delegado en Elixir Platform. El modelo es:

- **Declarativo**: Define qué verifica y qué no verifica, no cómo se implementa
- **Normativo**: Establece reglas obligatorias que toda implementación debe respetar
- **Canónico**: Es la única fuente de verdad para el gate de validación de edad
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones
- **Delegado**: La validación se delega a un proveedor externo, Elixir no ejecuta la validación directamente

### 1.2. Relación con Fases Previas

Este documento se basa en:

- **FASE 1.1**: Modelo lógico y máquina de estados que define `age_gate` como gate de verificación
- **FASE 1.2**: Registro mínimo funcional que no requiere validación de edad
- **FASE 1.3**: Verificación WhatsApp como gate delegado (modelo de referencia para delegación)

La FASE 1.4 extiende el modelo de FASE 1.1 agregando la definición completa del gate `age_gate` como gate delegado, sin modificar el modelo base ni invalidar las fases anteriores.

### 1.3. Invariantes Globales

El gate de validación de edad respeta los mismos invariantes fundamentales definidos en FASE 1.1:

1. **D0 (Elixir no custodia datos)**: El sistema no almacena fechas de nacimiento, documentos, ni información de verificación de edad completa
2. **Default Deny**: El gate inicia en estado de denegación implícita. Solo señales explícitas pueden cambiar el estado
3. **Apagabilidad**: El gate puede ser apagado completamente mediante kill-switch sin dejar estados inconsistentes

### 1.4. Principio Rector

**"Delegar no es confiar. Delegar es controlar el resultado."**

El gate de edad delega la ejecución de la validación a un proveedor externo, pero Elixir controla:
- Qué se valida y qué no se valida
- Qué señales acepta del proveedor
- Cómo interpreta esas señales
- Qué impacto tiene en la máquina de estados
- Cómo se comporta ante errores o silencio
- Cómo se comporta cuando el gate está deshabilitado o no disponible

---

## 2. Qué Significa "Validación de Edad" en Elixir

### 2.1. Enunciado Canónico

La **validación de edad** en Elixir Platform es un gate binario que verifica **únicamente** que:

1. **Una persona cumple con un umbral mínimo de edad**: El proveedor externo confirma que la persona tiene al menos la edad mínima requerida según las reglas de negocio
2. **La confirmación proviene de una fuente autorizada**: El proveedor externo ha realizado la verificación mediante métodos que Elixir acepta como válidos

### 2.2. Qué NO Verifica el Gate de Edad

El gate `age_gate` **NO** verifica:

- ❌ **Identidad de la persona**: No verifica quién es la persona, solo su edad
- ❌ **Autenticidad de documentos**: No valida la autenticidad de documentos (eso lo hace el proveedor)
- ❌ **Propiedad de documentos**: No verifica que la persona sea propietaria legal de los documentos
- ❌ **Ubicación geográfica**: No verifica dónde se encuentra la persona
- ❌ **Capacidad legal**: No verifica capacidad legal más allá del umbral de edad
- ❌ **Historial o reputación**: No verifica historial previo de la persona
- ❌ **Validez legal o contractual**: No verifica que la verificación sea válida legalmente más allá de lo que el proveedor garantiza
- ❌ **Edad exacta**: No almacena ni utiliza la edad exacta, solo confirma si cumple o no el umbral mínimo

### 2.3. Alcance de la Validación

**Lo que el gate valida es mínimo y binario**:

- La persona cumple o no cumple el umbral mínimo de edad
- El proveedor ha confirmado o no ha confirmado el cumplimiento

**Lo que el gate NO valida es todo lo demás**:

- No establece identidad completa
- No valida legitimidad más allá del umbral de edad
- No confirma propósito o intención
- No garantiza comportamiento futuro
- No almacena información de edad

### 2.4. Implicaciones Operativas

Como consecuencia de esta definición:

- **El gate habilita**: Que el sistema pueda considerar que una persona cumple con requisitos de edad mínima
- **El gate NO habilita**: Acceso a funcionalidades que requieren verificación de identidad completa o capacidad de pago
- **El gate es prerrequisito**: Para aprobación mínima cuando se requiere verificación de edad según reglas de negocio
- **El gate es delegado**: La ejecución técnica se delega a un proveedor externo, pero Elixir controla el resultado
- **El gate es obligatorio**: Si está habilitado y no está en estado `DISABLED`, es obligatorio para aprobación mínima

---

## 3. Qué Implica que la Validación Sea DELEGADA

### 3.1. Definición de Delegación

**Delegación** significa que Elixir no ejecuta la validación de edad directamente. En su lugar:

- **El proveedor externo** ejecuta la validación técnica (revisión de documentos, verificación de edad, etc.)
- **Elixir** recibe el resultado de la validación como una señal binaria (PASS / FAIL / PENDING / TIMEOUT / UNAVAILABLE)
- **Elixir** controla cómo interpreta esas señales y cómo impactan en la máquina de estados

### 3.2. Responsabilidades del Proveedor Externo

El proveedor externo es responsable de:

- Recibir información necesaria para validar edad (documentos, datos, etc.)
- Ejecutar la validación técnica según sus métodos
- Reportar el resultado a Elixir mediante señales claras
- Mantener la custodia de datos personales (fechas de nacimiento, documentos, etc.)

**Regla explícita**: Elixir no define cómo el proveedor ejecuta la validación. Solo define qué señales acepta y cómo las interpreta.

### 3.3. Responsabilidades de Elixir

Elixir es responsable de:

- Definir qué se valida y qué no se valida (umbral mínimo de edad, según reglas de negocio)
- Definir qué señales acepta del proveedor (PASS, FAIL, PENDING, TIMEOUT, UNAVAILABLE)
- Interpretar las señales del proveedor
- Controlar el impacto en la máquina de estados
- Gestionar errores, timeouts y indisponibilidad del proveedor
- Gestionar el kill-switch del gate

**Regla explícita**: Elixir no custodia datos de edad (invariante D0). Solo mantiene el estado binario del gate (VERIFIED / FAILED / PENDING / BLOCKED / DISABLED).

### 3.4. Separación de Responsabilidades

**El proveedor custodia**:
- Fechas de nacimiento
- Documentos de identidad
- Información de verificación de edad completa
- Procesos técnicos de validación

**Elixir custodia**:
- Estado binario del gate (VERIFIED / FAILED / PENDING / BLOCKED / DISABLED)
- Señales recibidas del proveedor
- Eventos de auditoría (sin datos personales)
- Reason codes de resultado

**Regla explícita**: Esta separación garantiza el invariante D0: Elixir no custodia datos personales relacionados con edad.

---

## 4. Señales del Gate de Edad

### 4.1. Definición de Señal

Una **señal** es el resultado que el gate `age_gate` emite después de evaluar una solicitud de validación de edad. Las señales son binarias y deterministas: el gate emite una y solo una señal por solicitud.

### 4.2. Señales Posibles

El gate `age_gate` puede emitir las siguientes señales:

#### 4.2.1. PASS

**Definición**: El gate ha verificado exitosamente que la persona cumple con el umbral mínimo de edad requerido.

**Condiciones**:
- El proveedor externo ha confirmado que la persona cumple con el umbral mínimo de edad
- No hay errores técnicos ni bloqueos activos
- El gate no está en estado `DISABLED` ni `BLOCKED`

**Impacto en estado**: El gate transita a estado `VERIFIED`

**Regla explícita**: PASS solo puede ocurrir si el proveedor confirma explícitamente que se cumple el umbral. Si falta confirmación explícita, el resultado NO es PASS.

#### 4.2.2. FAIL

**Definición**: El gate ha determinado que la validación no puede completarse exitosamente o que la persona no cumple con el umbral mínimo de edad.

**Condiciones**:
- El proveedor confirma que la persona NO cumple con el umbral mínimo de edad
- El proveedor reporta error técnico que impide la validación
- Se ha excedido el límite de intentos de validación
- El proveedor reporta que los documentos proporcionados no son válidos o no permiten verificar edad

**Impacto en estado**: El gate transita a estado `FAILED`

**Regla explícita**: FAIL es terminal para ese intento de validación. Una vez que el gate emite FAIL, no puede emitir PASS sin iniciar un nuevo intento de validación.

#### 4.2.3. PENDING

**Definición**: El gate está esperando acción del usuario, respuesta del proveedor, o procesamiento de la validación.

**Condiciones**:
- Se ha iniciado la validación pero aún no se ha recibido resultado del proveedor
- Se está esperando que el usuario proporcione información necesaria (documentos, etc.)
- El proveedor está procesando la validación y aún no ha emitido resultado

**Impacto en estado**: El gate permanece en estado `PENDING`

**Regla explícita**: PENDING es temporal. El gate debe eventualmente transicionar a PASS, FAIL, TIMEOUT, o UNAVAILABLE. No puede permanecer en PENDING indefinidamente.

#### 4.2.4. TIMEOUT

**Definición**: El gate ha excedido el tiempo máximo permitido para completar la validación.

**Condiciones**:
- Ha transcurrido el tiempo máximo desde el inicio de la validación sin recibir resultado del proveedor
- Ha transcurrido el tiempo máximo esperando que el usuario proporcione información necesaria
- El proveedor no ha respondido dentro del tiempo esperado

**Impacto en estado**: El gate transita a estado `FAILED` con `reason_code: FAILED_AGE_VERIFICATION_TIMEOUT`

**Regla explícita**: TIMEOUT es equivalente a FAIL para efectos de la máquina de estados. El gate no puede emitir PASS después de TIMEOUT sin iniciar un nuevo intento.

#### 4.2.5. UNAVAILABLE

**Definición**: El proveedor externo no está disponible o el gate está deshabilitado, impidiendo realizar la validación.

**Condiciones**:
- El proveedor externo no responde o está completamente no disponible
- El gate está en estado `DISABLED` (kill-switch o configuración)
- El proveedor reporta que no puede procesar la solicitud en este momento

**Impacto en estado**: 
- Si el gate está `DISABLED`: El gate permanece en estado `DISABLED`
- Si el proveedor no está disponible: El gate transita a estado `BLOCKED` con `reason_code: BLOCKED_AGE_PROVIDER_UNAVAILABLE`

**Regla explícita**: UNAVAILABLE impide la validación. Si el gate está `DISABLED` o el proveedor no está disponible, no se puede realizar validación y el registro NO puede ser aprobado (ver sección 8).

### 4.3. Exclusividad de Señales

**Regla fundamental**: El gate emite una y solo una señal por solicitud de validación. No puede emitir múltiples señales simultáneamente ni señales contradictorias.

**Orden de prioridad** (si hay ambigüedad):
1. UNAVAILABLE tiene prioridad sobre PENDING (si no está disponible, no se mantiene pendiente)
2. FAIL tiene prioridad sobre PENDING (si hay error, no se mantiene pendiente)
3. TIMEOUT tiene prioridad sobre PENDING (si expira, no se mantiene pendiente)
4. BLOCKED tiene prioridad sobre todas las demás (si está bloqueado, no se evalúa)

---

## 5. Estados del Gate

### 5.1. Estados Posibles

El gate `age_gate` puede estar en los siguientes estados (definidos en FASE 1.1):

- `DISABLED`: El gate no está habilitado o no aplica
- `PENDING`: El gate está pendiente de validación
- `VERIFIED`: El gate ha sido verificado exitosamente
- `FAILED`: El gate ha fallado la validación
- `BLOCKED`: El gate está bloqueado (por kill-switch, límites operativos, o proveedor no disponible)

### 5.2. Mapeo de Señales a Estados

| Señal | Estado Resultante | Condición |
|-------|-------------------|-----------|
| PASS | `VERIFIED` | Validación exitosa |
| FAIL | `FAILED` | Validación fallida |
| PENDING | `PENDING` | Esperando acción o respuesta |
| TIMEOUT | `FAILED` | Tiempo excedido |
| UNAVAILABLE (gate DISABLED) | `DISABLED` | Gate deshabilitado |
| UNAVAILABLE (proveedor) | `BLOCKED` | Proveedor no disponible |

**Regla explícita**: El estado `BLOCKED` puede alcanzarse mediante activación explícita del kill-switch, límites operativos, o indisponibilidad del proveedor. El estado `DISABLED` se alcanza mediante configuración o kill-switch del gate.

### 5.3. Transiciones de Estado

Las siguientes transiciones son las únicas permitidas:

```
DISABLED → PENDING (cuando se inicia validación y el gate se habilita)
PENDING → VERIFIED (señal PASS)
PENDING → FAILED (señal FAIL o TIMEOUT)
PENDING → BLOCKED (señal UNAVAILABLE por proveedor, kill-switch activo)
VERIFIED → (terminal, no transiciona para ese intento)
FAILED → PENDING (nuevo intento de validación)
Cualquier estado → BLOCKED (kill-switch activo, proveedor no disponible)
BLOCKED → DISABLED (kill-switch desactivado, pero requiere nuevo intento)
DISABLED → BLOCKED (kill-switch activo mientras está deshabilitado)
```

**Regla explícita**: Una vez que el gate alcanza `VERIFIED`, no puede retroceder a otros estados sin iniciar un nuevo `RegistroAttempt`. El estado `VERIFIED` es persistente para ese intento de registro.

---

## 6. Impacto en la Máquina de Estados

### 6.1. Integración con FASE 1.1

El gate `age_gate` se integra con la máquina de estados definida en FASE 1.1 de la siguiente manera:

#### 6.1.1. Prerrequisito: WhatsApp Verificado

**Regla fundamental de FASE 1.1**: El gate `whatsapp_gate` es prerrequisito para todos los demás gates, incluyendo `age_gate`.

**Aplicación en FASE 1.4**:
- Si `whatsapp_gate` está en estado `VERIFIED`, el gate `age_gate` puede evaluarse
- Si `whatsapp_gate` está en estado `FAILED`, `BLOCKED`, o `DISABLED`, el gate `age_gate` NO puede evaluarse
- Si `whatsapp_gate` está en estado `PENDING`, el gate `age_gate` espera hasta que el gate WhatsApp se resuelva

#### 6.1.2. Transición OTP_VERIFIED → ROLE_PENDING

**Condición**: El gate `whatsapp_gate` debe estar en estado `VERIFIED` (definido en FASE 1.3).

**Acción**: 
- El `RegistroAttempt` transita a estado `ROLE_PENDING`
- El gate `age_gate` puede iniciarse si se requiere validación de edad según reglas de negocio

**Regla explícita**: El gate `age_gate` puede iniciarse en cualquier momento después de que `whatsapp_gate` esté `VERIFIED`, pero debe completarse antes de `APPROVAL_PENDING`.

#### 6.1.3. Transición ROLE_PENDING → APPROVAL_PENDING

**Condición**: 
- Rol seleccionado (`user` o `model`)
- El gate `age_gate` debe estar en un estado que permita evaluación (no puede estar en `PENDING` indefinidamente)

**Acción**:
- El `RegistroAttempt` transita a estado `APPROVAL_PENDING`
- Se evalúan todos los gates activos, incluyendo `age_gate`

**Regla explícita**: Si el gate `age_gate` está en estado `PENDING` cuando se intenta transitar a `APPROVAL_PENDING`, el sistema debe esperar hasta que el gate se resuelva (PASS, FAIL, TIMEOUT, o UNAVAILABLE) o aplicar timeout según reglas de negocio.

#### 6.1.4. Estado APPROVAL_PENDING

**Condiciones durante APPROVAL_PENDING**:

El sistema evalúa si puede aprobar el registro según las reglas definidas en FASE 1.1:

- **Gate de WhatsApp**: Debe estar en estado `VERIFIED` (prerrequisito obligatorio)
- **Gate de edad**: 
  - Si el gate está habilitado y NO está en estado `DISABLED`, debe estar en estado `VERIFIED` para aprobar
  - Si el gate está en estado `DISABLED`, NO bloquea la aprobación (según FASE 1.1, sección 4.1)
  - Si el gate está en estado `FAILED` o `BLOCKED`, bloquea la aprobación
  - Si el gate está en estado `PENDING`, el sistema debe esperar o aplicar timeout

**Regla explícita de FASE 1.4**: Si el gate `age_gate` está en estado `DISABLED` y el registro **requiere** verificación de edad según reglas de negocio, el intento debe transitar a `DENIED` con `reason_code: DENIED_AGE_CHECK_DISABLED`. Esta regla tiene prioridad sobre la regla general de FASE 1.1.

#### 6.1.5. Transición APPROVAL_PENDING → APPROVED

**Condiciones** (según FASE 1.1, sección 4.1, modificadas por FASE 1.4):

Un `RegistroAttempt` puede transitar a `APPROVED` solo si se cumplen TODAS las siguientes condiciones:

1. **Estado del intento**: El intento debe estar en estado `APPROVAL_PENDING`
2. **Gate de WhatsApp**: El gate `whatsapp_gate` debe estar en estado `VERIFIED`
3. **Rol seleccionado**: Debe existir un rol seleccionado (`user` o `model`)
4. **Kill-switch inactivo**: El `KillSwitch` global debe estar en estado `INACTIVE`
5. **Límites operativos**: No se deben haber excedido límites operativos del sistema
6. **Gate de edad**:
   - Si el gate `age_gate` está habilitado y NO está en estado `DISABLED`, debe estar en estado `VERIFIED`
   - Si el gate `age_gate` está en estado `DISABLED` y el registro NO requiere verificación de edad, no bloquea la aprobación
   - Si el gate `age_gate` está en estado `DISABLED` y el registro SÍ requiere verificación de edad, el intento debe transitar a `DENIED` (regla explícita de FASE 1.4)

**Regla explícita de FASE 1.4**: `age_gate DISABLED` + `registro requiere edad` ⇒ `NO APPROVAL` (transición a `DENIED`).

#### 6.1.6. Transición APPROVAL_PENDING → DENIED

**Condiciones** (según FASE 1.1, sección 4.2, extendidas por FASE 1.4):

Un `RegistroAttempt` debe transitar a `DENIED` si se cumple ALGUNA de las siguientes condiciones:

1. **Kill-switch activo**: El `KillSwitch` global está en estado `ACTIVE_DROP` o `ACTIVE_SILENCIO`
2. **Kill-switch del gate activo**: El kill-switch del gate `age_gate` está activo (ver sección 8)
3. **Gate de edad bloqueado o fallido**: 
   - El gate `age_gate` está habilitado, no está en estado `DISABLED`, y está en estado `FAILED` o `BLOCKED`
   - El gate `age_gate` está en estado `DISABLED` y el registro requiere verificación de edad
4. **Límites excedidos**: Se han excedido límites operativos del sistema
5. **Razón de negocio**: Existe una razón de negocio explícita para denegar

**Regla explícita de FASE 1.4**: `age_gate DISABLED` + `registro requiere edad` ⇒ `DENIED` con `reason_code: DENIED_AGE_CHECK_DISABLED`.

### 6.2. Compatibilidad con FASE 1.2

**Regla explícita**: El registro mínimo funcional (FASE 1.2) puede operar sin el gate de edad. La FASE 1.4 no invalida FASE 1.2. Un `RegistroAttempt` puede:

- Aprobarse directamente sin pasar por validación de edad (FASE 1.2)
- O requerir validación de edad y pasar por el gate `age_gate` (FASE 1.4)

**Determinación**: La decisión de requerir validación de edad es una regla de negocio que se evalúa en `APPROVAL_PENDING`, no en el gate mismo.

### 6.3. Compatibilidad con FASE 1.3

**Regla explícita**: El gate `age_gate` requiere que `whatsapp_gate` esté en estado `VERIFIED` (prerrequisito definido en FASE 1.1). La FASE 1.4 no modifica esta regla.

---

## 7. Eventos y Reason Codes

### 7.1. Eventos del Gate

El gate `age_gate` genera los siguientes eventos (compatibles con FASE 1.1):

#### 7.1.1. Eventos de Inicio

- `AGE_GATE_INITIATED`: Se inició un intento de validación de edad
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `PENDING`

#### 7.1.2. Eventos de Proceso

- `AGE_VERIFICATION_SUBMITTED`: Se envió información al proveedor para validación
  - Atributos: `attempt_id`, `timestamp`, `provider_response_status`
  - Estado resultante: `PENDING`

- `AGE_VERIFICATION_PROCESSING`: El proveedor está procesando la validación
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `PENDING`

#### 7.1.3. Eventos de Resultado

- `AGE_VERIFIED`: Se verificó exitosamente que la persona cumple con el umbral mínimo de edad
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `VERIFIED`
  - Señal: PASS

- `AGE_VERIFICATION_FAILED`: Falló la validación de edad
  - Atributos: `attempt_id`, `timestamp`, `reason_code`
  - Estado resultante: `FAILED`
  - Señal: FAIL

- `AGE_VERIFICATION_TIMEOUT`: Expiró el tiempo para completar la validación de edad
  - Atributos: `attempt_id`, `timestamp`, `timeout_duration`
  - Estado resultante: `FAILED`
  - Señal: TIMEOUT

- `AGE_VERIFICATION_UNAVAILABLE`: El proveedor no está disponible o el gate está deshabilitado
  - Atributos: `attempt_id`, `timestamp`, `reason_code`
  - Estado resultante: `BLOCKED` o `DISABLED`
  - Señal: UNAVAILABLE

#### 7.1.4. Eventos de Control

- `AGE_GATE_BLOCKED`: El gate fue bloqueado por kill-switch, límites operativos, o proveedor no disponible
  - Atributos: `attempt_id`, `timestamp`, `reason_code`
  - Estado resultante: `BLOCKED`

- `AGE_GATE_UNBLOCKED`: El gate fue desbloqueado
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `DISABLED` (requiere nuevo intento)

- `AGE_GATE_DISABLED`: El gate fue deshabilitado (kill-switch o configuración)
  - Atributos: `attempt_id`, `timestamp`, `reason_code`
  - Estado resultante: `DISABLED`

- `AGE_GATE_ENABLED`: El gate fue habilitado
  - Atributos: `attempt_id`, `timestamp`
  - Estado resultante: `DISABLED` → puede transicionar a `PENDING` en nuevo intento

- `GATE_STATUS_CHANGED`: Cambió el estado del gate (definido en FASE 1.1)
  - Atributos: `attempt_id`, `gate_name: 'age_gate'`, `old_state`, `new_state`, `timestamp`

### 7.2. Reason Codes Específicos

Los siguientes `reason_code` son específicos del gate de edad:

#### 7.2.1. Códigos de Verificación Exitosa

- `AGE_VERIFIED_NORMAL`: Validación exitosa normal
- `AGE_VERIFIED_RETRY`: Validación exitosa después de reintento

#### 7.2.2. Códigos de Fallo

- `FAILED_AGE_BELOW_THRESHOLD`: La persona no cumple con el umbral mínimo de edad
- `FAILED_AGE_VERIFICATION_TIMEOUT`: Tiempo excedido para completar validación
- `FAILED_AGE_DOCUMENTS_INVALID`: Los documentos proporcionados no son válidos o no permiten verificar edad
- `FAILED_AGE_PROVIDER_ERROR`: Error del proveedor durante validación
- `FAILED_AGE_MAX_ATTEMPTS`: Se excedió el máximo de intentos de validación

#### 7.2.3. Códigos de Bloqueo

- `BLOCKED_AGE_KILLSWITCH_ACTIVE`: Bloqueado por kill-switch del gate activo
- `BLOCKED_AGE_OPERATIONAL_LIMITS`: Bloqueado por límites operativos
- `BLOCKED_AGE_PROVIDER_UNAVAILABLE`: Bloqueado porque el proveedor no está disponible

#### 7.2.4. Códigos de Deshabilitación

- `AGE_GATE_DISABLED_BY_CONFIG`: Gate deshabilitado por configuración
- `AGE_GATE_DISABLED_BY_KILLSWITCH`: Gate deshabilitado por kill-switch
- `DENIED_AGE_CHECK_DISABLED`: Denegado porque requiere verificación de edad pero el gate está deshabilitado

#### 7.2.5. Códigos de Estado Pendiente

- `PENDING_AGE_SUBMITTED`: Validación enviada al proveedor, esperando resultado
- `PENDING_AGE_PROCESSING`: Proveedor procesando validación
- `PENDING_AGE_USER_ACTION`: Esperando que el usuario proporcione información necesaria

### 7.3. Uso de Reason Codes

**Reglas**:
- Todo evento de resultado (`AGE_VERIFIED`, `AGE_VERIFICATION_FAILED`, `AGE_VERIFICATION_TIMEOUT`, `AGE_VERIFICATION_UNAVAILABLE`) debe incluir un `reason_code`
- Los `reason_code` son inmutables una vez establecidos
- Los `reason_code` no exponen información sensible (invariante D0)
- Los `reason_code` permiten auditoría sin revelar detalles técnicos del proveedor ni datos personales

---

## 8. Comportamiento ante Error, Silencio o Indisponibilidad del Proveedor

### 8.1. Principio de Fail-Closed

**Regla fundamental**: Ante cualquier error, silencio o ambigüedad del proveedor, el gate debe comportarse de forma fail-closed: si no hay confirmación explícita de éxito, el resultado es FAIL o UNAVAILABLE.

### 8.2. Errores del Proveedor

#### 8.2.1. Error al Procesar Validación

**Situación**: El proveedor externo reporta error al intentar procesar la validación de edad.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED`
- Se genera evento `AGE_VERIFICATION_FAILED` con `reason_code: FAILED_AGE_PROVIDER_ERROR`
- El `RegistroAttempt` puede transitar a `DENIED` o `FAILED` según reglas de negocio

**Regla explícita**: Si el proveedor no confirma el éxito, el gate NO puede emitir PASS ni mantener PENDING indefinidamente. Debe eventualmente emitir FAIL.

#### 8.2.2. Documentos Inválidos

**Situación**: El proveedor reporta que los documentos proporcionados no son válidos o no permiten verificar la edad.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED`
- Se genera evento `AGE_VERIFICATION_FAILED` con `reason_code: FAILED_AGE_DOCUMENTS_INVALID`
- El `RegistroAttempt` transita a `DENIED` con `reason_code: DENIED_AGE_VERIFICATION_FAILED`

**Regla explícita**: Los documentos inválidos resultan en FAIL. No se permite reintento automático sin nueva información.

#### 8.2.3. Proveedor No Disponible

**Situación**: El proveedor no responde o está completamente no disponible.

**Comportamiento**:
- El gate emite señal UNAVAILABLE
- El gate transita a estado `BLOCKED` con `reason_code: BLOCKED_AGE_PROVIDER_UNAVAILABLE`
- Se genera evento `AGE_VERIFICATION_UNAVAILABLE`
- El `RegistroAttempt` transita a `DENIED` con `reason_code: DENIED_AGE_CHECK_DISABLED` (si requiere edad) o puede permanecer en `APPROVAL_PENDING` según reglas de negocio

**Regla explícita**: La no disponibilidad del proveedor bloquea el gate. No se permite validación mientras el proveedor no esté disponible. Si el registro requiere verificación de edad, el intento debe transitar a `DENIED`.

### 8.3. Silencio del Proveedor

#### 8.3.1. Timeout de Respuesta

**Situación**: El proveedor no responde dentro del tiempo máximo esperado.

**Comportamiento**:
- El gate emite señal TIMEOUT
- El gate transita a estado `FAILED` con `reason_code: FAILED_AGE_VERIFICATION_TIMEOUT`
- Se genera evento `AGE_VERIFICATION_TIMEOUT`
- El `RegistroAttempt` transita a `DENIED` o `FAILED` según reglas de negocio

**Regla explícita**: El silencio del proveedor se interpreta como fallo. No se asume éxito por defecto.

#### 8.3.2. Respuesta Ambigua

**Situación**: El proveedor responde con un estado que no es claramente éxito ni fallo.

**Comportamiento**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED` con `reason_code: FAILED_AGE_PROVIDER_ERROR`
- Se genera evento `AGE_VERIFICATION_FAILED`
- El `RegistroAttempt` transita a `DENIED` o `FAILED` según reglas de negocio

**Regla explícita**: Solo respuestas explícitas de éxito permiten PASS. Cualquier ambigüedad resulta en FAIL.

### 8.4. Límites de Reintento

**Regla fundamental**: El gate puede permitir reintentos de validación, pero con límites estrictos:

- **Límite de intentos de validación**: Máximo número de veces que se puede intentar validar antes de FAIL
- **Límite de tiempo total**: Tiempo máximo desde el primer intento hasta la validación exitosa

**Comportamiento al exceder límites**:
- El gate emite señal FAIL
- El gate transita a estado `FAILED` con `reason_code: FAILED_AGE_MAX_ATTEMPTS` o `FAILED_AGE_VERIFICATION_TIMEOUT`
- El `RegistroAttempt` transita a `DENIED` o `FAILED`

**Regla explícita**: Los límites son estrictos. Una vez excedidos, no se permiten más intentos sin crear un nuevo `RegistroAttempt`.

---

## 9. Kill-Switch del Gate de Edad

### 9.1. Definición

El kill-switch del gate de edad es un mecanismo de control que permite desactivar completamente el gate `age_gate` de forma inmediata y segura, sin dejar estados inconsistentes.

### 9.2. Estados del Kill-Switch del Gate

El kill-switch del gate puede estar en los siguientes estados:

- `INACTIVE`: El kill-switch no está activo, el gate opera normalmente
- `ACTIVE_BLOCK`: El kill-switch está activo, bloquea todas las validaciones nuevas y en curso
- `ACTIVE_GRACEFUL`: El kill-switch está activo, bloquea validaciones nuevas pero permite completar validaciones en curso

### 9.3. Comportamiento del Kill-Switch del Gate

#### 9.3.1. Kill-Switch INACTIVE

**Comportamiento**: El gate opera normalmente según sus reglas.

#### 9.3.2. Kill-Switch ACTIVE_BLOCK

**Comportamiento**:
- Todas las solicitudes nuevas de validación son rechazadas inmediatamente
- El gate transita a estado `BLOCKED` para todos los intentos nuevos
- Los intentos en curso también son bloqueados (el gate transita a `BLOCKED`)
- Se genera evento `AGE_GATE_BLOCKED` para cada intento afectado
- Los `RegistroAttempt` afectados transitan a `DENIED` con `reason_code: DENIED_AGE_CHECK_DISABLED` (si requieren edad) o `BLOCKED_AGE_KILLSWITCH_ACTIVE`

**Regla explícita**: ACTIVE_BLOCK tiene prioridad absoluta. No se permite ninguna validación mientras esté activo.

#### 9.3.3. Kill-Switch ACTIVE_GRACEFUL

**Comportamiento**:
- Las solicitudes nuevas de validación son rechazadas
- El gate transita a estado `BLOCKED` para intentos nuevos
- Los intentos en curso pueden completarse (si están en `PENDING` y el proveedor responde antes de timeout)
- Una vez que un intento en curso completa o falla, no se permiten nuevos intentos
- Se genera evento `AGE_GATE_BLOCKED` solo para intentos nuevos

**Regla explícita**: ACTIVE_GRACEFUL permite completar validaciones en curso pero bloquea nuevas. Es una transición más suave que ACTIVE_BLOCK.

### 9.4. Activación y Desactivación

**Activación**:
- Solo puede ser activado mediante mecanismos administrativos explícitos
- La activación es inmediata y afecta a todos los intentos según el modo
- Se registra evento de auditoría

**Desactivación**:
- Solo puede ser desactivado mediante mecanismos administrativos explícitos
- La desactivación no restaura intentos bloqueados
- Los intentos bloqueados requieren crear nuevo `RegistroAttempt`
- Se registra evento de auditoría

### 9.5. Persistencia

**Regla fundamental**: El estado del kill-switch del gate es persistente y sobrevive a reinicios del sistema. Si el kill-switch está activo, permanece activo después de reinicio.

### 9.6. Prioridad

**Regla explícita**: El kill-switch del gate tiene prioridad absoluta sobre todas las demás decisiones del gate. Si el kill-switch está activo, no se evalúan señales, no se consulta al proveedor, y no se permite validación.

---

## 10. Kill-Switch Global

### 10.1. Definición

El kill-switch global es el mecanismo de control definido en FASE 1.1 que permite detener completamente el proceso de registro en cualquier punto.

### 10.2. Estados del Kill-Switch Global

El kill-switch global puede estar en los siguientes estados (definidos en FASE 1.1):

- `INACTIVE`: El kill-switch no está activo, el sistema opera normalmente
- `ACTIVE_DROP`: El kill-switch está activo en modo DROP (rechaza todas las solicitudes)
- `ACTIVE_SILENCIO`: El kill-switch está activo en modo SILENCIO (rechaza intentos nuevos, mantiene intentos en curso)

### 10.3. Impacto en el Gate de Edad

**Regla fundamental**: El kill-switch global tiene prioridad absoluta sobre el kill-switch del gate y sobre todas las operaciones del gate.

#### 10.3.1. Kill-Switch Global ACTIVE_DROP

**Comportamiento**:
- Todos los intentos de registro son rechazados inmediatamente
- El gate `age_gate` no puede iniciarse ni continuar
- Los `RegistroAttempt` transitan a `DENIED` con `reason_code: DENIED_KILLSWITCH_ACTIVE`
- No se generan eventos del gate (el kill-switch global tiene prioridad)

#### 10.3.2. Kill-Switch Global ACTIVE_SILENCIO

**Comportamiento**:
- Los intentos nuevos son rechazados
- Los intentos en curso pueden continuar, pero no pueden transitar a `APPROVED`
- El gate `age_gate` puede operar en intentos en curso, pero el resultado no puede resultar en aprobación
- Los `RegistroAttempt` en curso pueden completar validaciones pero transitan a `DENIED` al intentar aprobar

**Regla explícita**: El kill-switch global tiene prioridad sobre el kill-switch del gate. Si el kill-switch global está activo, el kill-switch del gate no puede habilitar el gate.

---

## 11. Comportamiento Exacto ante Gate DISABLED o UNAVAILABLE

### 11.1. Gate DISABLED

#### 11.1.1. Definición

El gate `age_gate` está en estado `DISABLED` cuando:
- El kill-switch del gate está activo
- La configuración del sistema deshabilita el gate
- El gate no aplica para el tipo de registro

#### 11.1.2. Comportamiento ante Gate DISABLED

**Si el registro NO requiere verificación de edad** (según reglas de negocio):
- El gate en estado `DISABLED` no bloquea la aprobación
- El `RegistroAttempt` puede transitar a `APPROVED` si se cumplen las demás condiciones
- Se genera evento `AGE_GATE_DISABLED` con `reason_code: AGE_GATE_DISABLED_BY_CONFIG` o `AGE_GATE_DISABLED_BY_KILLSWITCH`

**Si el registro SÍ requiere verificación de edad** (según reglas de negocio):
- El gate en estado `DISABLED` **bloquea la aprobación**
- El `RegistroAttempt` **debe transitar a `DENIED`** con `reason_code: DENIED_AGE_CHECK_DISABLED`
- Se genera evento `AGE_GATE_DISABLED` con `reason_code: DENIED_AGE_CHECK_DISABLED`
- **Regla explícita y NO negociable**: `age_check DISABLED` + `registro requiere edad` ⇒ `NO APPROVAL`

#### 11.1.3. Regla Explícita: age_check DISABLED ⇒ NO APPROVAL

**Enunciado**: Si el gate de verificación de edad (`age_gate`) está en estado `DISABLED` y el registro requiere verificación de edad según reglas de negocio, el sistema NO puede aprobar el registro. El intento debe transitar a `DENIED` o `SUSPENDED`.

**Aplicación**:
- Si `age_gate` está `DISABLED` y el registro requiere verificación de edad, el intento debe transitar a `DENIED` con `reason_code: DENIED_AGE_CHECK_DISABLED`
- Si `age_gate` está `DISABLED` y el registro NO requiere verificación de edad, el intento puede proceder normalmente
- Esta regla tiene prioridad sobre la regla general de FASE 1.1 que establece que `DISABLED` no bloquea aprobación

**Justificación**: Garantiza que el sistema no apruebe registros que requieren verificación de edad cuando el mecanismo de verificación no está disponible.

**Estado resultante**: El sistema debe quedar en estado `DENIED` o `SUSPENDED`. No puede quedar en `APPROVED` ni en `APPROVAL_PENDING` indefinidamente.

### 11.2. Gate UNAVAILABLE (Proveedor No Disponible)

#### 11.2.1. Definición

El gate `age_gate` está en estado `UNAVAILABLE` cuando:
- El proveedor externo no está disponible o no responde
- El proveedor reporta que no puede procesar solicitudes en este momento
- Hay un error de conectividad con el proveedor

#### 11.2.2. Comportamiento ante Gate UNAVAILABLE

**Comportamiento**:
- El gate emite señal UNAVAILABLE
- El gate transita a estado `BLOCKED` con `reason_code: BLOCKED_AGE_PROVIDER_UNAVAILABLE`
- Se genera evento `AGE_VERIFICATION_UNAVAILABLE`
- **Si el registro requiere verificación de edad**: El `RegistroAttempt` debe transitar a `DENIED` con `reason_code: DENIED_AGE_CHECK_DISABLED` o `BLOCKED_AGE_PROVIDER_UNAVAILABLE`
- **Si el registro NO requiere verificación de edad**: El `RegistroAttempt` puede permanecer en `APPROVAL_PENDING` o transitar según otras condiciones

**Regla explícita**: La indisponibilidad del proveedor bloquea el gate. No se permite validación mientras el proveedor no esté disponible. Si el registro requiere verificación de edad, el intento debe transitar a `DENIED`.

### 11.3. Resumen de Comportamiento

| Estado del Gate | Registro Requiere Edad | Comportamiento |
|-----------------|------------------------|----------------|
| `DISABLED` | NO | No bloquea aprobación, puede transitar a `APPROVED` |
| `DISABLED` | SÍ | **Bloquea aprobación, transita a `DENIED`** |
| `UNAVAILABLE` (proveedor) | NO | Puede permanecer en `APPROVAL_PENDING` o transitar según otras condiciones |
| `UNAVAILABLE` (proveedor) | SÍ | **Bloquea aprobación, transita a `DENIED`** |
| `BLOCKED` (kill-switch) | Cualquiera | **Bloquea aprobación, transita a `DENIED`** |
| `FAILED` | Cualquiera | **Bloquea aprobación, transita a `DENIED`** |
| `VERIFIED` | Cualquiera | No bloquea aprobación, puede transitar a `APPROVED` si se cumplen demás condiciones |
| `PENDING` | Cualquiera | Espera hasta que se resuelva (PASS, FAIL, TIMEOUT, UNAVAILABLE) o aplica timeout |

**Regla explícita**: `age_gate DISABLED` + `registro requiere edad` ⇒ `NO APPROVAL` (transición a `DENIED` o `SUSPENDED`).

---

## 12. Invariantes del Gate

### 12.1. Invariante D0 (Elixir no custodia datos)

**Enunciado**: El gate de edad no almacena fechas de nacimiento, documentos, ni información de verificación de edad completa. Solo mantiene estados binarios y referencias necesarias.

**Aplicación en el gate**:
- El gate opera con referencias opacas al proveedor, nunca con datos de edad en claro
- Los eventos no contienen fechas de nacimiento ni documentos
- Las señales no exponen información de edad
- El proveedor externo puede tener los datos, pero Elixir no los custodia

**Violación**: Cualquier almacenamiento de fecha de nacimiento, documento, o información de edad en claro viola este invariante.

### 12.2. Invariante Default Deny

**Enunciado**: El gate inicia en estado de denegación implícita. Solo señales explícitas pueden cambiar el estado hacia verificación.

**Aplicación en el gate**:
- Estado inicial: `DISABLED` o `PENDING` (implícitamente no verificado)
- Verificación exitosa: Solo mediante señal PASS explícita
- Fallo: Cualquier error o ambigüedad resulta en FAIL o UNAVAILABLE

**Violación**: Cualquier verificación automática sin señal explícita viola este invariante.

### 12.3. Invariante Apagabilidad

**Enunciado**: El gate puede ser apagado completamente mediante kill-switch sin dejar estados inconsistentes.

**Aplicación en el gate**:
- Kill-switch tiene prioridad absoluta
- Activación del kill-switch bloquea todas las validaciones
- Los intentos bloqueados transitan a estados terminales consistentes (`DENIED` o `SUSPENDED`)
- El kill-switch es persistente

**Violación**: Cualquier estado que no respete el kill-switch o que deje intentos inconsistentes viola este invariante.

---

## 13. Compatibilidad con Fases Anteriores

### 13.1. Compatibilidad con FASE 1.1

**Verificación**:
- ✅ El gate `age_gate` está definido en FASE 1.1 con estados compatibles
- ✅ Los estados del gate (DISABLED, PENDING, VERIFIED, FAILED, BLOCKED) son los definidos en FASE 1.1
- ✅ Las transiciones de la máquina de estados son compatibles con FASE 1.1
- ✅ Los eventos son compatibles con FASE 1.1
- ✅ El gate es prerrequisito para aprobación cuando está habilitado, como se define en FASE 1.1
- ✅ La regla de FASE 1.4 (`age_check DISABLED` + `requiere edad` ⇒ `NO APPROVAL`) extiende pero no contradice FASE 1.1

**Extensión**: FASE 1.4 extiende FASE 1.1 definiendo el comportamiento específico del gate, sin modificar el modelo base.

### 13.2. Compatibilidad con FASE 1.2

**Verificación**:
- ✅ FASE 1.2 permite registro mínimo funcional sin validación de edad
- ✅ FASE 1.4 no invalida FASE 1.2: un `RegistroAttempt` puede aprobarse sin pasar por validación de edad
- ✅ Si se requiere validación de edad, FASE 1.4 define cómo opera el gate
- ✅ Los dos modelos pueden coexistir: registro mínimo funcional (FASE 1.2) y registro con validación de edad (FASE 1.4)

**Regla explícita**: La decisión de requerir validación de edad es una regla de negocio evaluada en `APPROVAL_PENDING`, no en el gate mismo. El gate solo se activa si se requiere validación.

### 13.3. Compatibilidad con FASE 1.3

**Verificación**:
- ✅ El gate `age_gate` requiere que `whatsapp_gate` esté en estado `VERIFIED` (prerrequisito definido en FASE 1.1)
- ✅ El modelo de delegación de FASE 1.3 sirve como referencia para FASE 1.4
- ✅ Las señales (PASS, FAIL, PENDING, TIMEOUT, UNAVAILABLE) son compatibles con el modelo de FASE 1.3
- ✅ El comportamiento ante errores y silencio del proveedor es compatible con FASE 1.3

**Regla explícita**: FASE 1.4 sigue el mismo patrón de delegación que FASE 1.3, aplicado al gate de edad.

---

## 14. Límites y Restricciones

### 14.1. Límites del Gate

El gate de edad tiene los siguientes límites:

- **Funcionalidad mínima**: Solo verifica cumplimiento de umbral mínimo de edad
- **Sin identidad**: No establece ni valida identidad completa
- **Sin otros verificaciones**: No reemplaza verificación de WhatsApp, pago, etc.
- **Delegado**: No ejecuta la validación directamente, la delega a proveedor
- **Obligatorio cuando está habilitado**: Si está habilitado y no está `DISABLED`, es obligatorio para aprobación mínima cuando se requiere según reglas de negocio

### 14.2. Restricciones de Implementación

El modelo lógico del gate NO especifica:

- Implementación técnica del proveedor externo
- Algoritmos de hash específicos
- Límites numéricos específicos (tiempos, intentos) - estos son configurables
- Detalles de UI/UX (el diseño UX está cerrado)
- Protocolo de comunicación con el proveedor (solo define contrato)

### 14.3. Restricciones Absolutas

El gate **NO puede**:

- ❌ Almacenar fechas de nacimiento, documentos, ni información de edad en claro (invariante D0)
- ❌ Calcular edad directamente (la calcula el proveedor)
- ❌ Verificar identidad completa, capacidad de pago, o otros aspectos
- ❌ Emitir señales contradictorias o múltiples señales simultáneas
- ❌ Operar sin kill-switch funcional
- ❌ Asumir éxito por defecto ante errores o silencio del proveedor
- ❌ Modificar el modelo de FASE 1.1 o invalidar FASE 1.2 o FASE 1.3
- ❌ Aprobar registros que requieren verificación de edad cuando el gate está `DISABLED` o `UNAVAILABLE`

---

## 15. Criterios de Cierre de FASE 1.4

### 15.1. Criterios Cumplidos

✅ **Concepto inequívoco**: La validación de edad como gate delegado está definida de forma canónica en las secciones 2 y 3  
✅ **Qué verifica y qué NO verifica**: Definido explícitamente en sección 2.2  
✅ **Qué implica delegación**: Definido explícitamente en sección 3  
✅ **Señales del gate**: Definidas en sección 4.2 (PASS, FAIL, PENDING, TIMEOUT, UNAVAILABLE)  
✅ **Eventos y reason codes**: Definidos en sección 7  
✅ **Impacto en máquina de estados**: Definido en sección 6, compatible con FASE 1.1  
✅ **Comportamiento ante errores/silencio/indisponibilidad**: Definido en sección 8, fail-closed garantizado  
✅ **Kill-switch del gate**: Definido en sección 9, con prioridad absoluta  
✅ **Kill-switch global**: Definido en sección 10, con prioridad sobre kill-switch del gate  
✅ **Comportamiento exacto ante DISABLED/UNAVAILABLE**: Definido en sección 11, con regla explícita `age_check DISABLED` ⇒ `NO APPROVAL`  
✅ **Sistema permanece default DENY**: Establecido en sección 12.2  
✅ **Compatible con FASE 1.1, 1.2 y 1.3**: Verificado en sección 13  
✅ **Registrable en Git sin ambigüedad**: Este documento es canónico y normativo, listo para registro

### 15.2. Verificación de Restricciones Absolutas

✅ **Elixir Core sellado**: No se modifica ni referencia código de Core  
✅ **WAM existe y NO se redefine**: WAM se referencia como existente, no se redefine  
✅ **D0 respetado**: Invariante D0 respetado (sección 12.1), Elixir NO calcula edad, NO almacena fecha de nacimiento, NO almacena documentos  
✅ **Diseño UX cerrado**: No se define UX en este documento (sección 14.2)  
✅ **Sin validación de identidad**: Explícitamente excluido (sección 2.2)  
✅ **Sin avance a fases posteriores**: Este documento solo define FASE 1.4

### 15.3. Verificación de Alcance Permitido

✅ **Qué es validación de edad en Elixir**: Definido en sección 2.1  
✅ **Qué verifica y qué NO verifica**: Definido en sección 2.2  
✅ **Qué implica delegación**: Definido en sección 3  
✅ **Señales posibles del gate**: Definidas en sección 4.2  
✅ **Eventos y reason codes**: Definidos en sección 7  
✅ **Impacto exacto en máquina de estados**: Definido en sección 6  
✅ **Comportamiento ante errores/silencio/indisponibilidad**: Definido en sección 8  
✅ **Kill-switch del gate**: Definido en sección 9  
✅ **Kill-switch global**: Definido en sección 10  
✅ **Comportamiento exacto ante DISABLED/UNAVAILABLE**: Definido en sección 11, con regla explícita

### 15.4. Estado de Cierre

**FASE 1.4 está CERRADA** cuando:

1. Este documento es aprobado formalmente
2. Todos los criterios de cierre (15.1-15.3) están verificados
3. El documento es registrado en Git como canónico
4. No quedan ambigüedades sobre qué es la validación de edad delegada y cómo opera el kill-switch

**Resultado**: El modelo lógico de la validación de edad delegada y el kill-switch queda definido, cerrado y registrable como documento canónico en Git.

---

## 16. Estado del Documento

### 16.1. Canonicidad

Este documento es **canónico y normativo**. Define la única versión válida del modelo lógico de la validación de edad delegada y el kill-switch para la FASE 1.4.

### 16.2. Inmodificabilidad

Una vez aprobado, este documento:

- No admite reinterpretaciones
- No admite extensiones sin nueva aprobación formal
- No admite modificaciones sin proceso de decisión explícito
- Es la fuente de verdad única para implementaciones

### 16.3. Relación con Implementación

Este documento:

- Define QUÉ debe existir, no CÓMO implementarlo
- Es independiente de decisiones técnicas de implementación
- Debe ser respetado por toda implementación del gate de edad
- No especifica código ejecutable ni detalles de implementación
- No modifica ni referencia código de Elixir Core (que es sellado e inmodificable)
- No redefine WAM (que existe y está documentado)
- No modifica la decisión D0 (que es cerrada e inmodificable)

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación canónica y normativa - FASE 1.4 CERRADA  
**Aprobación**: Pendiente de aprobación formal  
**Fecha**: 2025


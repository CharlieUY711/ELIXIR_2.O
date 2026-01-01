# FASE 1.1 — Modelo Lógico y Estados

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Base Operativa Mínima  
**Bloque**: BLOQUE 1 — Registro Unificado  
**Fase**: FASE 1.1 — Modelo lógico y estados  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Contexto Normativo

### 1.1. Principios Fundamentales

Este documento define el modelo lógico canónico del Registro Unificado de Elixir Platform. El modelo es:

- **Declarativo**: Define qué existe y cómo se comporta, no cómo se implementa
- **Normativo**: Establece reglas obligatorias que toda implementación debe respetar
- **Canónico**: Es la única fuente de verdad para el modelo lógico del registro
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones

### 1.2. Invariantes Globales

El modelo lógico del registro respeta tres invariantes fundamentales:

1. **D0 (Elixir no custodia datos)**: El sistema no almacena datos personales completos. Solo mantiene estados binarios y referencias necesarias para orquestación.
2. **Default Deny**: Todo intento de registro inicia en estado de denegación implícita. Solo transiciones explícitas pueden cambiar el estado.
3. **Apagabilidad**: El sistema debe poder detenerse completamente mediante mecanismos de kill-switch sin dejar estados inconsistentes.

### 1.3. Relación con Elixir Core

Elixir Core es sellado e inmodificable. El modelo lógico del registro se integra con Core mediante estados de cuenta y decisiones binarias. El registro no modifica Core ni expone su lógica interna.

---

## 2. Entidades Lógicas Mínimas

### 2.1. RegistroAttempt

**Definición**: Representa un intento único de registro en el sistema.

**Atributos mínimos**:
- `attempt_id`: Identificador único del intento (generado por el sistema)
- `phone_number_hash`: Hash del número de WhatsApp (no el número en claro)
- `state`: Estado actual del intento (ver sección 3)
- `created_at`: Timestamp de creación del intento
- `updated_at`: Timestamp de última actualización
- `completed_at`: Timestamp de finalización (si aplica)
- `role`: Rol seleccionado (`user` | `model` | `undefined`)
- `reason_code`: Código de razón del estado actual (ver sección 6)

**Reglas**:
- Un `RegistroAttempt` es efímero. Se crea al iniciar el registro y se elimina o archiva al completarse o fallar.
- El `phone_number_hash` permite verificar unicidad sin exponer el número real (invariante D0).
- Un número de WhatsApp puede tener múltiples intentos, pero solo un intento exitoso puede resultar en cuenta creada.

### 2.2. GateStatus

**Definición**: Representa el estado de un gate de verificación dentro del proceso de registro.

**Gates definidos**:
- `whatsapp_gate`: Verificación de número de WhatsApp mediante OTP
- `age_gate`: Verificación de edad (delegada a proveedor externo)
- `payment_gate`: Verificación de capacidad de pago/retiro (delegada a proveedor externo)

**Estados posibles**:
- `DISABLED`: El gate no está habilitado o no aplica
- `PENDING`: El gate está pendiente de verificación
- `VERIFIED`: El gate ha sido verificado exitosamente
- `FAILED`: El gate ha fallado la verificación
- `BLOCKED`: El gate está bloqueado (por kill-switch o límites operativos)

**Reglas**:
- Los gates son independientes entre sí, excepto que `whatsapp_gate` es prerrequisito para todos los demás.
- Un gate en estado `DISABLED` no puede resultar en `VERIFIED`.
- El estado `BLOCKED` tiene prioridad sobre todos los demás estados.

### 2.3. KillSwitch

**Definición**: Representa el mecanismo de detención inmediata del sistema de registro.

**Estados**:
- `INACTIVE`: El kill-switch no está activo, el sistema opera normalmente
- `ACTIVE_DROP`: El kill-switch está activo en modo DROP (rechaza todos los intentos nuevos)
- `ACTIVE_SILENCIO`: El kill-switch está activo en modo SILENCIO (rechaza intentos nuevos, mantiene intentos en curso)

**Reglas**:
- El kill-switch tiene prioridad absoluta sobre todas las demás decisiones.
- Cuando `KillSwitch` está `ACTIVE_DROP` o `ACTIVE_SILENCIO`, ningún `RegistroAttempt` puede avanzar a estados de aprobación.
- El kill-switch es persistente y sobrevive a reinicios del sistema.
- El kill-switch solo puede ser activado o desactivado mediante mecanismos administrativos explícitos.

### 2.4. RegistroEvent

**Definición**: Representa un evento ocurrido durante el proceso de registro.

**Tipos de eventos mínimos**:
- `ATTEMPT_CREATED`: Se creó un nuevo intento de registro
- `PHONE_SUBMITTED`: Se recibió un número de teléfono
- `OTP_SENT`: Se envió un código OTP
- `OTP_VERIFIED`: Se verificó exitosamente un código OTP
- `OTP_FAILED`: Falló la verificación de un código OTP
- `ROLE_SELECTED`: Se seleccionó un rol (user o model)
- `ACCOUNT_CREATED`: Se creó una cuenta exitosamente
- `ATTEMPT_FAILED`: El intento de registro falló
- `ATTEMPT_ABANDONED`: El intento de registro fue abandonado
- `GATE_STATUS_CHANGED`: Cambió el estado de un gate
- `KILLSWITCH_ACTIVATED`: Se activó el kill-switch
- `KILLSWITCH_DEACTIVATED`: Se desactivó el kill-switch

**Atributos mínimos**:
- `event_id`: Identificador único del evento
- `attempt_id`: Identificador del intento relacionado (si aplica)
- `event_type`: Tipo de evento
- `timestamp`: Timestamp del evento
- `reason_code`: Código de razón asociado (si aplica)

**Reglas**:
- Los eventos son inmutables una vez creados.
- Los eventos no contienen datos personales (invariante D0).
- Los eventos permiten auditoría y trazabilidad sin exponer información sensible.

---

## 3. Máquina de Estados

### 3.1. Estados del RegistroAttempt

El `RegistroAttempt` transita por los siguientes estados:

#### Estados No Terminales

1. **INITIAL**
   - Estado inicial de todo intento de registro
   - Se alcanza al crear un nuevo `RegistroAttempt`
   - No permite ninguna operación excepto transición a `PHONE_PENDING`

2. **PHONE_PENDING**
   - Se ha recibido un número de teléfono pero no se ha enviado OTP
   - Permite validación de formato y verificación de unicidad
   - Puede transicionar a `OTP_PENDING` o `FAILED`

3. **OTP_PENDING**
   - Se ha enviado un código OTP y se espera su verificación
   - Permite reintentos de envío de OTP (con límites)
   - Puede transicionar a `OTP_VERIFIED`, `OTP_FAILED`, o `FAILED`

4. **OTP_VERIFIED**
   - Se ha verificado exitosamente el código OTP
   - El gate `whatsapp_gate` está en estado `VERIFIED`
   - Puede transicionar a `ROLE_PENDING` o `FAILED`

5. **ROLE_PENDING**
   - Se requiere selección de rol (user o model)
   - El sistema espera que el usuario seleccione su tipo de cuenta
   - Puede transicionar a `APPROVAL_PENDING` o `FAILED`

6. **APPROVAL_PENDING**
   - Se ha seleccionado un rol y el sistema evalúa si puede aprobar el registro
   - Evalúa gates activos, kill-switch, y límites operativos
   - Puede transicionar a `APPROVED`, `DENIED`, o `FAILED`

#### Estados Terminales

7. **APPROVED**
   - El registro ha sido aprobado y se ha creado una cuenta
   - Estado terminal exitoso
   - No permite transiciones adicionales

8. **DENIED**
   - El registro ha sido denegado por razones de negocio o operativas
   - Estado terminal de denegación
   - No permite transiciones adicionales

9. **FAILED**
   - El registro ha fallado por errores técnicos o condiciones inválidas
   - Estado terminal de fallo
   - No permite transiciones adicionales

10. **ABANDONED**
    - El intento de registro fue abandonado por el usuario
    - Estado terminal de abandono
    - No permite transiciones adicionales

### 3.2. Transiciones Permitidas

Las siguientes transiciones son las únicas permitidas en el modelo:

```
INITIAL → PHONE_PENDING
PHONE_PENDING → OTP_PENDING
PHONE_PENDING → FAILED
OTP_PENDING → OTP_VERIFIED
OTP_PENDING → OTP_FAILED (estado intermedio, luego → FAILED)
OTP_PENDING → FAILED
OTP_VERIFIED → ROLE_PENDING
OTP_VERIFIED → FAILED
ROLE_PENDING → APPROVAL_PENDING
ROLE_PENDING → FAILED
APPROVAL_PENDING → APPROVED
APPROVAL_PENDING → DENIED
APPROVAL_PENDING → FAILED
Cualquier estado no terminal → ABANDONED
```

### 3.3. Transiciones Prohibidas

Las siguientes transiciones están explícitamente prohibidas:

- Saltar estados: No se puede transitar de `INITIAL` directamente a `OTP_PENDING` sin pasar por `PHONE_PENDING`
- Retroceso: No se puede retroceder de un estado posterior a uno anterior (excepto mediante creación de nuevo intento)
- Desde terminales: Ningún estado terminal puede transicionar a otro estado
- Aprobar sin verificación: No se puede transitar a `APPROVED` sin haber pasado por `OTP_VERIFIED`
- Aprobar sin rol: No se puede transitar a `APPROVED` sin haber pasado por `ROLE_PENDING`

### 3.4. Condiciones de Transición

Cada transición requiere condiciones específicas:

- `INITIAL → PHONE_PENDING`: Creación de `RegistroAttempt`
- `PHONE_PENDING → OTP_PENDING`: Número válido, formato correcto, unicidad verificada
- `OTP_PENDING → OTP_VERIFIED`: Código OTP correcto, no excedido límite de intentos
- `OTP_VERIFIED → ROLE_PENDING`: Gate `whatsapp_gate` en estado `VERIFIED`
- `ROLE_PENDING → APPROVAL_PENDING`: Rol seleccionado (`user` o `model`)
- `APPROVAL_PENDING → APPROVED`: Todas las condiciones de aprobación cumplidas (ver sección 4)
- `APPROVAL_PENDING → DENIED`: Condiciones de denegación cumplidas (ver sección 4)
- Cualquier estado → `FAILED`: Error técnico o condición inválida
- Cualquier estado no terminal → `ABANDONED`: Abandono explícito del usuario

---

## 4. Reglas de Aprobación y Denegación

### 4.1. Condiciones para APPROVED

Un `RegistroAttempt` puede transitar a `APPROVED` solo si se cumplen TODAS las siguientes condiciones:

1. **Estado del intento**: El intento debe estar en estado `APPROVAL_PENDING`
2. **Gate de WhatsApp**: El gate `whatsapp_gate` debe estar en estado `VERIFIED`
3. **Rol seleccionado**: Debe existir un rol seleccionado (`user` o `model`)
4. **Kill-switch inactivo**: El `KillSwitch` debe estar en estado `INACTIVE`
5. **Límites operativos**: No se deben haber excedido límites operativos del sistema
6. **Gate de edad (si aplica)**: Si el gate `age_gate` está habilitado y no está en estado `DISABLED`, debe estar en estado `VERIFIED`. Si está en estado `DISABLED`, no bloquea la aprobación.

**Regla explícita**: `age_gate DISABLED ⇒ NO bloquea APPROVAL`

### 4.2. Condiciones para DENIED

Un `RegistroAttempt` debe transitar a `DENIED` si se cumple ALGUNA de las siguientes condiciones:

1. **Kill-switch activo**: El `KillSwitch` está en estado `ACTIVE_DROP` o `ACTIVE_SILENCIO`
2. **Gate de edad bloqueado**: El gate `age_gate` está habilitado, no está en estado `DISABLED`, y está en estado `FAILED` o `BLOCKED`
3. **Límites excedidos**: Se han excedido límites operativos del sistema
4. **Razón de negocio**: Existe una razón de negocio explícita para denegar (definida por reglas de negocio)

**Regla explícita**: `age_gate DISABLED ⇒ NO causa DENIAL`

### 4.3. Regla Explícita: age_check DISABLED ⇒ NO APPROVAL

**Enunciado**: Si el gate de verificación de edad (`age_gate`) está en estado `DISABLED`, el sistema NO puede aprobar un registro que requiera verificación de edad.

**Aplicación**:
- Si `age_gate` está `DISABLED` y el registro requiere verificación de edad (según reglas de negocio), el intento debe transitar a `DENIED` con `reason_code: AGE_CHECK_DISABLED`.
- Si `age_gate` está `DISABLED` y el registro NO requiere verificación de edad, el intento puede proceder normalmente.
- Esta regla tiene prioridad sobre la regla general de que `DISABLED` no bloquea aprobación.

**Justificación**: Garantiza que el sistema no apruebe registros que requieren verificación de edad cuando el mecanismo de verificación no está disponible.

### 4.4. Default Deny

**Principio**: Todo `RegistroAttempt` inicia en estado de denegación implícita. Solo transiciones explícitas pueden cambiar el estado hacia aprobación.

**Aplicación**:
- Un intento en estado `INITIAL` está implícitamente denegado.
- Un intento solo puede alcanzar `APPROVED` mediante transición explícita desde `APPROVAL_PENDING`.
- Si cualquier condición de aprobación falla, el intento debe transitar a `DENIED` o `FAILED`.

---

## 5. Invariantes del Modelo

### 5.1. Invariante D0 (Elixir no custodia datos)

**Enunciado**: El sistema no almacena datos personales completos. Solo mantiene estados binarios, hashes, y referencias necesarias para orquestación.

**Aplicación en el modelo**:
- `RegistroAttempt.phone_number_hash`: Solo hash, nunca el número en claro
- `RegistroEvent`: No contiene datos personales, solo metadatos y códigos de razón
- Estados de gates: Solo estados binarios (`VERIFIED`, `FAILED`, etc.), no datos de verificación
- Referencias externas: Solo IDs o tokens de referencia, no datos completos

**Violación**: Cualquier almacenamiento de datos personales completos (números de teléfono en claro, documentos, etc.) viola este invariante.

### 5.2. Invariante Default Deny

**Enunciado**: El sistema opera bajo principio de denegación por defecto. Todo intento inicia denegado y solo transiciones explícitas pueden aprobar.

**Aplicación en el modelo**:
- Estado inicial: `INITIAL` (implícitamente denegado)
- Transición a aprobación: Solo mediante `APPROVAL_PENDING → APPROVED` con todas las condiciones cumplidas
- Fallo de condiciones: Cualquier fallo en condiciones de aprobación resulta en `DENIED` o `FAILED`

**Violación**: Cualquier aprobación automática sin evaluación explícita viola este invariante.

### 5.3. Invariante Apagabilidad

**Enunciado**: El sistema debe poder detenerse completamente mediante kill-switch sin dejar estados inconsistentes.

**Aplicación en el modelo**:
- `KillSwitch` tiene prioridad absoluta sobre todas las decisiones
- Cuando `KillSwitch` está activo, ningún intento puede avanzar a `APPROVED`
- Intentos en curso pueden completarse o transicionar a `DENIED` según modo del kill-switch
- El kill-switch es persistente y sobrevive a reinicios

**Violación**: Cualquier estado que no respete el kill-switch o que deje intentos en estados inconsistentes tras activación viola este invariante.

---

## 6. Reason Codes Mínimos

### 6.1. Códigos de Razón para Estados

Los siguientes `reason_code` son los mínimos requeridos para el modelo:

#### Códigos de Aprobación
- `APPROVED_NORMAL`: Aprobación normal, todas las condiciones cumplidas
- `APPROVED_WITH_DISABLED_AGE_GATE`: Aprobación con gate de edad deshabilitado (no requiere verificación)

#### Códigos de Denegación
- `DENIED_KILLSWITCH_ACTIVE`: Denegado por kill-switch activo
- `DENIED_AGE_CHECK_DISABLED`: Denegado porque requiere verificación de edad pero el gate está deshabilitado
- `DENIED_AGE_VERIFICATION_FAILED`: Denegado por fallo en verificación de edad
- `DENIED_OPERATIONAL_LIMITS`: Denegado por exceder límites operativos
- `DENIED_BUSINESS_RULE`: Denegado por regla de negocio explícita
- `DENIED_PHONE_ALREADY_REGISTERED`: Denegado porque el número ya está registrado

#### Códigos de Fallo
- `FAILED_INVALID_PHONE_FORMAT`: Fallo por formato de teléfono inválido
- `FAILED_OTP_EXPIRED`: Fallo por expiración de código OTP
- `FAILED_OTP_MAX_ATTEMPTS`: Fallo por exceder máximo de intentos de OTP
- `FAILED_TECHNICAL_ERROR`: Fallo por error técnico genérico
- `FAILED_GATE_UNAVAILABLE`: Fallo porque un gate requerido no está disponible

#### Códigos de Abandono
- `ABANDONED_USER_CANCELLED`: Abandonado por cancelación explícita del usuario
- `ABANDONED_TIMEOUT`: Abandonado por timeout de sesión

### 6.2. Uso de Reason Codes

**Reglas**:
- Todo estado terminal (`APPROVED`, `DENIED`, `FAILED`, `ABANDONED`) debe tener un `reason_code` asociado
- Los estados no terminales pueden tener `reason_code` para indicar estado intermedio
- Los `reason_code` son inmutables una vez establecidos
- Los `reason_code` no exponen información sensible (invariante D0)

---

## 7. Integración con Elixir Core

### 7.1. Punto de Integración

El modelo lógico del registro se integra con Elixir Core mediante:

- **Estados de cuenta**: Los estados resultantes del registro (`APPROVED`) se reflejan en estados de cuenta que Core puede evaluar
- **Decisiones binarias**: Core recibe solicitudes de autorización con estados de cuenta y emite decisiones binarias (`ALLOW` | `DENY`)
- **Sin modificación de Core**: El registro no modifica Core ni expone su lógica interna

### 7.2. Flujo de Integración

1. **Registro completado**: `RegistroAttempt` transita a `APPROVED`
2. **Cuenta creada**: Se crea una cuenta con estados iniciales (`provisional`, `whatsapp_verified`, etc.)
3. **Solicitud a Core**: Cuando se requiere autorización, se envía solicitud a Core con estados de cuenta
4. **Decisión de Core**: Core evalúa y emite decisión binaria
5. **Aplicación de decisión**: El sistema aplica la decisión de Core sin exponer razones internas

### 7.3. Separación de Responsabilidades

- **Registro**: Establece identidad y estados de cuenta
- **Core**: Evalúa autorizaciones basadas en estados de cuenta
- **Sin acoplamiento**: El registro no conoce la lógica interna de Core, Core no conoce los detalles del proceso de registro

---

## 8. Límites y Restricciones

### 8.1. Límites Operativos

El modelo lógico define que pueden existir límites operativos, pero no especifica sus valores. Los límites operativos son:

- Configurables externamente
- Evaluados durante `APPROVAL_PENDING`
- Pueden causar transición a `DENIED` con `reason_code: DENIED_OPERATIONAL_LIMITS`

### 8.2. Restricciones de Implementación

El modelo lógico NO especifica:

- Implementación técnica (base de datos, APIs, etc.)
- Detalles de UI/UX
- Algoritmos de hash o encriptación
- Proveedores externos específicos
- Límites numéricos específicos

---

## 9. Estado del Documento

### 9.1. Canonicidad

Este documento es **canónico y normativo**. Define la única versión válida del modelo lógico del Registro Unificado para la FASE 1.1.

### 9.2. Inmodificabilidad

Una vez aprobado, este documento:

- No admite reinterpretaciones
- No admite extensiones sin nueva aprobación formal
- No admite modificaciones sin proceso de decisión explícito
- Es la fuente de verdad única para implementaciones

### 9.3. Relación con Implementación

Este documento:

- Define QUÉ debe existir, no CÓMO implementarlo
- Es independiente de decisiones técnicas de implementación
- Debe ser respetado por toda implementación del registro
- No especifica código ejecutable ni detalles de implementación

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación canónica y normativa  
**Aprobación**: Pendiente de aprobación formal  
**Fecha**: 2025


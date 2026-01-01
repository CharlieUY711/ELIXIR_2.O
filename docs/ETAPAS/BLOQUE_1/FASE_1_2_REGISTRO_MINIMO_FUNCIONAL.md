# FASE 1.2 — Registro Mínimo Funcional

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Base Operativa Mínima  
**Bloque**: BLOQUE 1 — Registro Unificado  
**Fase**: FASE 1.2 — Registro mínimo funcional  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Contexto Normativo

### 1.1. Principios Fundamentales

Este documento define qué significa "registro mínimo funcional" en el contexto de Elixir Platform. El documento es:

- **Declarativo**: Define qué existe y qué habilita, no cómo se implementa
- **Normativo**: Establece reglas obligatorias que toda implementación debe respetar
- **Canónico**: Es la única fuente de verdad para el registro mínimo funcional
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones

### 1.2. Relación con FASE 1.1

Este documento se basa en el modelo lógico y la máquina de estados definidos en FASE 1.1. El registro mínimo funcional opera dentro de los estados y transiciones definidos en FASE 1.1, pero establece qué subconjunto mínimo de funcionalidad debe estar disponible para considerar el registro "mínimamente funcional".

### 1.3. Invariantes Globales

El registro mínimo funcional respeta los mismos invariantes fundamentales definidos en FASE 1.1:

1. **D0 (Elixir no custodia datos)**: El sistema no almacena datos personales completos
2. **Default Deny**: Todo intento de registro inicia en estado de denegación implícita
3. **Apagabilidad**: El sistema debe poder detenerse completamente mediante kill-switch

---

## 2. Definición de "Registro Mínimo Funcional"

### 2.1. Enunciado Canónico

**Registro mínimo funcional** es la capacidad del sistema de crear y mantener una identidad técnica provisional para una persona, permitiendo que esa persona "exista" en el sistema con los artefactos mínimos necesarios para operación básica, sin requerir verificaciones adicionales ni habilitar acceso a funcionalidades avanzadas.

### 2.2. Propósito Lógico

El registro mínimo funcional habilita:

- **Existencia técnica**: Una persona puede tener una representación técnica en el sistema
- **Identidad provisional**: Se crea una identidad técnica provisional que puede evolucionar
- **Referencia persistente**: El sistema puede referenciar a esa persona mediante identificadores opacos
- **Base para evolución**: La identidad provisional puede avanzar hacia estados más completos en fases posteriores

### 2.3. Límites Explícitos

El registro mínimo funcional **NO** habilita:

- **Identidad completa**: No establece identidad verificada ni completa
- **Verificación WhatsApp**: No requiere ni implica verificación de número de WhatsApp (FASE 1.3)
- **Verificación de edad**: No requiere ni implica verificación de edad (FASE 1.4)
- **Acceso a otros bloques**: No habilita acceso a funcionalidades de otros bloques (Chat, Catálogo, etc.)
- **Operaciones transaccionales**: No habilita operaciones que requieran verificación adicional
- **Almacenamiento de PII**: No almacena datos personales identificables (invariante D0)

---

## 3. Artefactos Mínimos

### 3.1. RegistroAttempt Mínimo

Un `RegistroAttempt` en estado de registro mínimo funcional debe contener:

**Atributos obligatorios**:
- `attempt_id`: Identificador único del intento (generado por el sistema)
- `state`: Estado actual del intento (ver sección 4)
- `created_at`: Timestamp de creación del intento
- `updated_at`: Timestamp de última actualización
- `reason_code`: Código de razón del estado actual

**Atributos opcionales en mínimo funcional**:
- `phone_number_hash`: Hash del número de WhatsApp (solo si se proporciona número)
- `role`: Rol seleccionado (`user` | `model` | `undefined`)
- `completed_at`: Timestamp de finalización (si aplica)

**Reglas**:
- El `RegistroAttempt` puede existir sin `phone_number_hash` en el registro mínimo funcional
- El `phone_number_hash` solo se requiere si se proporciona un número de teléfono
- El `role` puede permanecer `undefined` en el registro mínimo funcional

### 3.2. Identidad Técnica Provisional

Una **identidad técnica provisional** es el artefacto resultante del registro mínimo funcional. Debe contener:

**Atributos obligatorios**:
- `provisional_id`: Identificador único opaco de la identidad provisional (generado por el sistema)
- `attempt_id`: Referencia al `RegistroAttempt` que originó la identidad
- `state`: Estado de la identidad (`provisional`)
- `created_at`: Timestamp de creación
- `handle_opaco`: Handle opaco que permite referenciar la identidad sin exponer información

**Atributos opcionales**:
- `phone_number_hash`: Hash del número de WhatsApp (solo si se proporcionó)
- `role`: Rol seleccionado (si se seleccionó)

**Reglas**:
- La identidad técnica provisional NO contiene datos personales identificables
- El `handle_opaco` es un identificador que no expone información sobre la persona
- La identidad provisional puede evolucionar hacia estados más completos en fases posteriores

### 3.3. Tokens y Referencias Opacas

El registro mínimo funcional puede generar:

**Tokens de sesión mínimos**:
- Tokens efímeros que permiten mantener sesión durante el proceso de registro
- Tokens con TTL limitado que expiran si no se usan
- Tokens que no contienen información personal

**Referencias opacas**:
- Referencias que permiten continuar el proceso de registro sin exponer información
- Referencias que no pueden ser usadas para inferir datos personales
- Referencias que expiran si el proceso se abandona

**Reglas**:
- Los tokens y referencias NO contienen datos personales
- Los tokens y referencias tienen TTL limitado
- Los tokens y referencias pueden invalidarse mediante kill-switch

---

## 4. Estados Habilitados en Registro Mínimo Funcional

### 4.1. Estados Alcanzables

El registro mínimo funcional permite alcanzar los siguientes estados del modelo definido en FASE 1.1:

**Estados no terminales permitidos**:
- `INITIAL`: Estado inicial de todo intento
- `PHONE_PENDING`: Se recibió un número de teléfono (opcional en mínimo funcional)
- `ROLE_PENDING`: Se requiere selección de rol (opcional en mínimo funcional)

**Estados terminales permitidos**:
- `APPROVED`: El registro ha sido aprobado y se creó identidad técnica provisional
- `DENIED`: El registro ha sido denegado
- `FAILED`: El registro ha fallado
- `ABANDONED`: El intento fue abandonado

### 4.2. Estados NO Alcanzables en Mínimo Funcional

El registro mínimo funcional **NO** permite alcanzar:

- `OTP_PENDING`: Requiere verificación WhatsApp (FASE 1.3)
- `OTP_VERIFIED`: Requiere verificación WhatsApp (FASE 1.3)
- `APPROVAL_PENDING`: Requiere evaluación de gates que no están disponibles en mínimo funcional

**Regla explícita**: El registro mínimo funcional puede transitar directamente a `APPROVED` desde `INITIAL`, `PHONE_PENDING`, o `ROLE_PENDING` sin requerir estados intermedios de verificación.

### 4.3. Transiciones Permitidas en Mínimo Funcional

Las siguientes transiciones son las únicas permitidas en registro mínimo funcional:

```
INITIAL → PHONE_PENDING (opcional)
INITIAL → ROLE_PENDING (opcional)
INITIAL → APPROVED (directo, si se cumplen condiciones mínimas)
PHONE_PENDING → ROLE_PENDING (opcional)
PHONE_PENDING → APPROVED (si se cumplen condiciones mínimas)
ROLE_PENDING → APPROVED (si se cumplen condiciones mínimas)
Cualquier estado no terminal → DENIED
Cualquier estado no terminal → FAILED
Cualquier estado no terminal → ABANDONED
```

**Regla explícita**: El registro mínimo funcional puede aprobar un intento sin pasar por estados de verificación (`OTP_PENDING`, `OTP_VERIFIED`, `APPROVAL_PENDING`).

---

## 5. Eventos Generados

### 5.1. Eventos Mínimos Obligatorios

El registro mínimo funcional debe generar los siguientes eventos:

**Eventos de creación**:
- `ATTEMPT_CREATED`: Se creó un nuevo intento de registro

**Eventos opcionales**:
- `PHONE_SUBMITTED`: Se recibió un número de teléfono (solo si se proporciona)
- `ROLE_SELECTED`: Se seleccionó un rol (solo si se selecciona)

**Eventos de finalización**:
- `ACCOUNT_CREATED`: Se creó una identidad técnica provisional exitosamente
- `ATTEMPT_FAILED`: El intento de registro falló
- `ATTEMPT_ABANDONED`: El intento de registro fue abandonado

**Eventos de control**:
- `KILLSWITCH_ACTIVATED`: Se activó el kill-switch (si aplica)
- `KILLSWITCH_DEACTIVATED`: Se desactivó el kill-switch (si aplica)

### 5.2. Eventos NO Generados en Mínimo Funcional

El registro mínimo funcional **NO** genera:

- `OTP_SENT`: Requiere verificación WhatsApp (FASE 1.3)
- `OTP_VERIFIED`: Requiere verificación WhatsApp (FASE 1.3)
- `OTP_FAILED`: Requiere verificación WhatsApp (FASE 1.3)
- `GATE_STATUS_CHANGED`: Requiere gates que no están disponibles en mínimo funcional

### 5.3. Atributos de Eventos

Todos los eventos generados deben cumplir:

- **Inmutabilidad**: Los eventos son inmutables una vez creados
- **Sin PII**: Los eventos no contienen datos personales identificables (invariante D0)
- **Trazabilidad**: Los eventos permiten auditoría sin exponer información sensible
- **Reason codes**: Los eventos terminales deben incluir `reason_code` apropiado

---

## 6. Validaciones Mínimas Obligatorias

### 6.1. Validaciones de Formato

El registro mínimo funcional debe validar:

**Si se proporciona número de teléfono**:
- Formato básico de número de teléfono (estructura válida)
- El número no debe estar vacío ni contener solo espacios
- El número debe poder ser hasheado correctamente

**Si se selecciona rol**:
- El rol debe ser uno de los valores permitidos (`user` | `model`)
- El rol no puede ser `undefined` si se selecciona explícitamente

**Validaciones de sistema**:
- El `attempt_id` debe ser único
- Los timestamps deben ser válidos y coherentes
- El `reason_code` debe ser válido si se establece

### 6.2. Validaciones de Unicidad

**Si se proporciona número de teléfono**:
- El `phone_number_hash` debe ser único (no puede existir otra identidad provisional con el mismo hash)
- Si ya existe una identidad con el mismo `phone_number_hash`, el intento debe transitar a `DENIED` con `reason_code: DENIED_PHONE_ALREADY_REGISTERED`

**Regla explícita**: La validación de unicidad se realiza sobre el hash, no sobre el número en claro (invariante D0).

### 6.3. Validaciones de Estado

El registro mínimo funcional debe validar:

- **Estado del intento**: Solo se pueden realizar operaciones válidas según el estado actual
- **Transiciones permitidas**: Solo se permiten transiciones definidas en la sección 4.3
- **Kill-switch**: Si el kill-switch está activo, no se puede aprobar ningún intento

### 6.4. Validaciones NO Requeridas en Mínimo Funcional

El registro mínimo funcional **NO** requiere validar:

- Verificación de código OTP (FASE 1.3)
- Verificación de edad (FASE 1.4)
- Verificación de capacidad de pago (fases posteriores)
- Límites operativos complejos (solo kill-switch básico)

---

## 7. Condiciones de Bloqueo y Rechazo

### 7.1. Condiciones que Bloquean el Avance

Las siguientes condiciones bloquean el avance del registro mínimo funcional:

**Kill-switch activo**:
- Si `KillSwitch` está en estado `ACTIVE_DROP` o `ACTIVE_SILENCIO`, ningún intento puede avanzar a `APPROVED`
- El intento debe transitar a `DENIED` con `reason_code: DENIED_KILLSWITCH_ACTIVE`

**Número ya registrado**:
- Si el `phone_number_hash` (si se proporciona) ya existe en el sistema, el intento debe transitar a `DENIED` con `reason_code: DENIED_PHONE_ALREADY_REGISTERED`

**Formato inválido**:
- Si el número de teléfono (si se proporciona) tiene formato inválido, el intento debe transitar a `FAILED` con `reason_code: FAILED_INVALID_PHONE_FORMAT`

**Error técnico**:
- Si ocurre un error técnico que impide crear la identidad provisional, el intento debe transitar a `FAILED` con `reason_code: FAILED_TECHNICAL_ERROR`

### 7.2. Condiciones que Rechazan el Avance

Las siguientes condiciones causan rechazo explícito:

**Abandono**:
- Si el usuario abandona explícitamente el proceso, el intento debe transitar a `ABANDONED` con `reason_code: ABANDONED_USER_CANCELLED`
- Si el proceso expira por timeout, el intento debe transitar a `ABANDONED` con `reason_code: ABANDONED_TIMEOUT`

**Denegación operativa**:
- Si el sistema determina que debe denegar el registro por razones operativas, el intento debe transitar a `DENIED` con `reason_code: DENIED_OPERATIONAL_LIMITS`

### 7.3. Prioridad de Condiciones

Las condiciones se evalúan en el siguiente orden de prioridad:

1. **Kill-switch**: Tiene prioridad absoluta sobre todas las demás condiciones
2. **Unicidad**: Se evalúa antes de crear la identidad provisional
3. **Formato**: Se evalúa antes de procesar el número
4. **Errores técnicos**: Se evalúan durante el procesamiento

---

## 8. Condiciones para Aprobación en Mínimo Funcional

### 8.1. Condiciones Mínimas para APPROVED

Un `RegistroAttempt` puede transitar a `APPROVED` en registro mínimo funcional si se cumplen **TODAS** las siguientes condiciones:

1. **Estado válido**: El intento está en estado `INITIAL`, `PHONE_PENDING`, o `ROLE_PENDING`
2. **Kill-switch inactivo**: El `KillSwitch` está en estado `INACTIVE`
3. **Unicidad verificada**: Si se proporciona `phone_number_hash`, debe ser único (no existe otra identidad con el mismo hash)
4. **Formato válido**: Si se proporciona número de teléfono, debe tener formato válido
5. **Sin errores técnicos**: No hay errores técnicos que impidan crear la identidad provisional

### 8.2. Condiciones Opcionales

Las siguientes condiciones son **opcionales** en registro mínimo funcional:

- **Número de teléfono**: No es obligatorio proporcionar número de teléfono
- **Rol seleccionado**: No es obligatorio seleccionar rol
- **Verificación WhatsApp**: No se requiere (FASE 1.3)
- **Verificación de edad**: No se requiere (FASE 1.4)

**Regla explícita**: El registro mínimo funcional puede aprobar un intento con solo `attempt_id`, `state`, y timestamps, sin requerir número de teléfono ni rol.

### 8.3. Resultado de Aprobación

Cuando un intento transita a `APPROVED` en registro mínimo funcional:

1. **Identidad provisional creada**: Se crea una identidad técnica provisional con `provisional_id`, `handle_opaco`, y estado `provisional`
2. **Evento generado**: Se genera evento `ACCOUNT_CREATED` con `reason_code: APPROVED_NORMAL` o `APPROVED_MINIMAL`
3. **Referencia establecida**: El `RegistroAttempt` queda referenciado a la identidad provisional creada
4. **Estado terminal**: El intento alcanza estado terminal y no puede transicionar a otros estados

---

## 9. Integración con Modelo de FASE 1.1

### 9.1. Coherencia con Máquina de Estados

El registro mínimo funcional opera dentro de la máquina de estados definida en FASE 1.1, pero:

- **Simplifica transiciones**: Permite transiciones directas a `APPROVED` sin requerir estados intermedios de verificación
- **Respeta invariantes**: Mantiene todos los invariantes definidos en FASE 1.1 (D0, Default Deny, Apagabilidad)
- **No modifica modelo**: No añade nuevos estados ni transiciones al modelo de FASE 1.1

### 9.2. Compatibilidad con Default Deny

El registro mínimo funcional respeta el principio Default Deny:

- **Estado inicial**: Todo intento inicia en `INITIAL` (implícitamente denegado)
- **Aprobación explícita**: Solo transición explícita a `APPROVED` puede cambiar el estado
- **Denegación por defecto**: Si cualquier condición de aprobación falla, el intento transita a `DENIED` o `FAILED`

### 9.3. Compatibilidad con Apagabilidad

El registro mínimo funcional respeta el principio de apagabilidad:

- **Kill-switch**: El kill-switch tiene prioridad absoluta y bloquea todas las aprobaciones
- **Estados consistentes**: La activación del kill-switch no deja intentos en estados inconsistentes
- **Persistencia**: El kill-switch es persistente y sobrevive a reinicios

---

## 10. Qué NO es el Registro Mínimo Funcional

### 10.1. No es Identidad Completa

El registro mínimo funcional **NO** establece:

- Identidad verificada
- Identidad completa
- Identidad con datos personales
- Identidad con verificaciones externas

**Es**: Identidad técnica provisional que permite existencia básica en el sistema.

### 10.2. No Implica Verificación WhatsApp

El registro mínimo funcional **NO** requiere:

- Envío de código OTP
- Verificación de código OTP
- Confirmación de número de WhatsApp
- Estado `whatsapp_verified`

**Nota**: La verificación WhatsApp se implementa en FASE 1.3, no en FASE 1.2.

### 10.3. No Implica Validación de Edad

El registro mínimo funcional **NO** requiere:

- Verificación de edad
- Validación de documentos
- Delegación a proveedores de verificación de edad
- Estado `age_verified`

**Nota**: La validación de edad se implementa en FASE 1.4, no en FASE 1.2.

### 10.4. No Habilita Acceso a Otros Bloques

El registro mínimo funcional **NO** habilita:

- Acceso a funcionalidades de Chat (BLOQUE 2)
- Acceso a funcionalidades de Catálogo (BLOQUE 3)
- Operaciones transaccionales
- Funcionalidades que requieren verificación adicional

**Es**: Base mínima que permite existencia técnica, no funcionalidades avanzadas.

### 10.5. No Almacena PII

El registro mínimo funcional **NO** almacena:

- Números de teléfono en claro
- Nombres reales
- Documentos de identidad
- Cualquier dato personal identificable

**Almacena**: Solo hashes, identificadores opacos, y estados binarios (invariante D0).

---

## 11. Reason Codes Específicos de Mínimo Funcional

### 11.1. Códigos de Aprobación

- `APPROVED_NORMAL`: Aprobación normal en registro mínimo funcional
- `APPROVED_MINIMAL`: Aprobación con mínimos absolutos (sin número, sin rol)

### 11.2. Códigos de Denegación

- `DENIED_KILLSWITCH_ACTIVE`: Denegado por kill-switch activo
- `DENIED_PHONE_ALREADY_REGISTERED`: Denegado porque el número ya está registrado
- `DENIED_OPERATIONAL_LIMITS`: Denegado por límites operativos

### 11.3. Códigos de Fallo

- `FAILED_INVALID_PHONE_FORMAT`: Fallo por formato de teléfono inválido
- `FAILED_TECHNICAL_ERROR`: Fallo por error técnico genérico

### 11.4. Códigos de Abandono

- `ABANDONED_USER_CANCELLED`: Abandonado por cancelación explícita del usuario
- `ABANDONED_TIMEOUT`: Abandonado por timeout de sesión

---

## 12. Límites y Restricciones

### 12.1. Límites del Registro Mínimo Funcional

El registro mínimo funcional tiene los siguientes límites:

- **Funcionalidad mínima**: Solo permite crear identidad técnica provisional
- **Sin verificaciones**: No incluye verificaciones externas
- **Sin acceso avanzado**: No habilita acceso a funcionalidades de otros bloques
- **Sin PII**: No almacena datos personales identificables

### 12.2. Restricciones de Implementación

El registro mínimo funcional NO especifica:

- Implementación técnica (base de datos, APIs, etc.)
- Detalles de UI/UX (el diseño UX está cerrado y no se redefine)
- Algoritmos de hash o encriptación específicos
- Límites numéricos específicos (excepto kill-switch)

### 12.3. Evolución hacia Fases Posteriores

El registro mínimo funcional es la base para:

- **FASE 1.3**: Agregar verificación WhatsApp
- **FASE 1.4**: Agregar verificación de edad y kill-switch avanzado
- **Fases posteriores**: Evolucionar la identidad provisional hacia identidad completa

**Regla explícita**: La identidad técnica provisional creada en FASE 1.2 puede evolucionar en fases posteriores sin requerir recreación.

---

## 13. Estado del Documento

### 13.1. Canonicidad

Este documento es **canónico y normativo**. Define la única versión válida del registro mínimo funcional para la FASE 1.2.

### 13.2. Inmodificabilidad

Una vez aprobado, este documento:

- No admite reinterpretaciones
- No admite extensiones sin nueva aprobación formal
- No admite modificaciones sin proceso de decisión explícito
- Es la fuente de verdad única para implementaciones

### 13.3. Relación con Implementación

Este documento:

- Define QUÉ debe existir, no CÓMO implementarlo
- Es independiente de decisiones técnicas de implementación
- Debe ser respetado por toda implementación del registro mínimo funcional
- No especifica código ejecutable ni detalles de implementación
- No modifica ni referencia código de Elixir Core (que es sellado e inmodificable)

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación canónica y normativa  
**Aprobación**: Pendiente de aprobación formal  
**Fecha**: 2025


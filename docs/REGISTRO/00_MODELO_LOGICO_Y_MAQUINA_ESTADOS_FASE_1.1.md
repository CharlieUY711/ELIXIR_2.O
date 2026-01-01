# Modelo Lógico y Máquina de Estados - Registro Unificado FASE 1.1

**Fecha**: 2025-01-27  
**Tipo**: Documentación Canónica - FASE 1.1  
**Versión**: 1.0  
**Estado**: DEFINITIVO - Criterios de Cierre Cumplidos

---

## 1. Alcance y Objetivo

Este documento define de forma completa, coherente y registrable:

- El modelo lógico mínimo del Registro Unificado
- La máquina de estados canónica
- Las transiciones permitidas y prohibidas
- Los mecanismos de apagabilidad (kill-switch)
- Las invariantes de seguridad y control (D0, default deny)

**Principio Rector**: "El sistema debe poder apagarse antes de poder crecer."

**Restricción Absoluta**: Este documento NO define código final, NO diseña UX/UI, NO avanza a fases posteriores.

---

## 2. Modelo Lógico Mínimo

### 2.1. Entidades Fundamentales

#### 2.1.1. Sesión de Registro

**Definición**: Contexto temporal que mantiene el estado del proceso de registro de un visitante.

**Atributos**:
- `session_id`: Identificador único de sesión (generado al iniciar R1)
- `registration_state`: Estado actual del proceso de registro (enum: `R0`, `R1`, `R2`, `R3`, `R4`)
- `phone_number`: Número de WhatsApp ingresado (solo durante R1-R3, no persistido después de R3)
- `otp_code`: Código OTP enviado (solo durante R2, no persistido)
- `otp_attempts`: Contador de intentos de verificación OTP (0 a max_attempts)
- `otp_expires_at`: Timestamp de expiración del código OTP
- `created_at`: Timestamp de creación de sesión
- `last_activity_at`: Timestamp de última actividad
- `kill_switch_active`: Booleano que indica si el kill-switch está activo para esta sesión

**Regla D0**: La sesión de registro NO custodia datos personales permanentes. Solo mantiene estado transitorio necesario para completar el proceso.

**Regla de Retención**: La sesión se elimina automáticamente:
- Después de completar R4 exitosamente
- Después de expiración (timeout configurable, default: 1 hora sin actividad)
- Después de cancelación explícita del usuario

#### 2.1.2. Cuenta

**Definición**: Entidad que representa una cuenta registrada en el sistema.

**Atributos**:
- `account_id`: Identificador único de cuenta (generado en R3)
- `alias_technical`: Alias técnico autogenerado (formato: `Elixir_U{numero}` o `Elixir_M{numero}`)
- `whatsapp_number_hash`: Hash del número de WhatsApp (NO el número en texto plano)
- `whatsapp_verified`: Booleano (true después de completar R2)
- `identity_status`: Estado de identidad (enum: `provisional`, `whatsapp_verified`, `age_verified`, `payment_enabled`, `operational`)
- `role`: Tipo de cuenta (enum: `undefined`, `user`, `model`)
- `created_at`: Timestamp de creación de cuenta
- `kill_switch_active`: Booleano que indica si el kill-switch está activo para esta cuenta

**Regla D0**: La cuenta NO custodia el número de WhatsApp en texto plano. Solo mantiene hash para verificación de unicidad.

**Regla de Inmutabilidad**: `account_id` y `alias_technical` son inmutables después de R3.

#### 2.1.3. Estado de Verificación

**Definición**: Estados binarios que indican el resultado de verificaciones externas.

**Atributos**:
- `whatsapp_verified`: Booleano (true después de R2)
- `age_verified`: Booleano (false por defecto, se establece mediante proceso externo)
- `payment_enabled`: Booleano (false por defecto, se establece mediante proceso externo)

**Regla D0**: El sistema NO custodia documentos, fechas de nacimiento, información de tarjetas, ni datos de verificación completos. Solo mantiene resultados binarios (verificado / no verificado).

**Regla de Default Deny**: Todos los estados de verificación inician en `false`. Solo se establecen en `true` mediante procesos explícitos y verificados.

---

### 2.2. Relaciones

#### 2.2.1. Sesión de Registro → Cuenta

**Relación**: Una sesión de registro puede crear una cuenta (1:0..1)

**Regla**: Una sesión solo puede crear una cuenta. Después de crear la cuenta, la sesión se elimina.

#### 2.2.2. Cuenta → Estados de Verificación

**Relación**: Una cuenta tiene estados de verificación (1:1)

**Regla**: Los estados de verificación son parte de la cuenta y no existen independientemente.

---

### 2.3. Datos NO Custodiados (D0)

El sistema NO custodia los siguientes datos durante el registro:

- Número de WhatsApp en texto plano (solo hash)
- Código OTP después de verificación
- Nombre real
- Email (opcional, no requerido)
- Documentos de identidad
- Fechas de nacimiento
- Información de pago
- Cualquier dato personal adicional

**Justificación**: Elixir es orquestador, no custodio. Los datos sensibles se delegan a sistemas externos especializados.

---

## 3. Máquina de Estados Canónica

### 3.1. Estados del Proceso de Registro

La máquina de estados del proceso de registro define los estados visibles del flujo de registro:

```
R0: VISITOR (Visitante)
R1: PHONE_INPUT (Ingreso de número WhatsApp)
R2: OTP_VERIFICATION (Verificación OTP)
R3: ACCOUNT_CREATION (Creación de cuenta)
R4: ROLE_SELECTION (Selección de rol)
U1: USER_REGISTERED (Usuario registrado) [Estado terminal]
M1: MODEL_REGISTERED (Modelo registrado) [Estado terminal]
```

**Regla**: Los estados R0-R4 son estados transitorios del proceso. U1 y M1 son estados terminales que indican registro completado.

### 3.2. Estados de Cuenta (Post-Registro)

Los estados de cuenta definen las capacidades de una cuenta después del registro:

```
PROVISIONAL: Estado inicial después de R3
WHATSAPP_VERIFIED: Alcanzado automáticamente después de R2
AGE_VERIFIED: Requiere proceso de verificación de edad externo
PAYMENT_ENABLED: Requiere proceso de verificación de pago externo
OPERATIONAL: Alcanzado automáticamente cuando todas las verificaciones están completas
```

**Regla**: Los estados de cuenta son progresivos y solo pueden avanzar en el orden definido. No se puede saltar estados.

### 3.3. Enum de Estados Canónicos

```typescript
// Estados del proceso de registro
enum RegistrationState {
  R0_VISITOR = 'R0_VISITOR',
  R1_PHONE_INPUT = 'R1_PHONE_INPUT',
  R2_OTP_VERIFICATION = 'R2_OTP_VERIFICATION',
  R3_ACCOUNT_CREATION = 'R3_ACCOUNT_CREATION',
  R4_ROLE_SELECTION = 'R4_ROLE_SELECTION',
  U1_USER_REGISTERED = 'U1_USER_REGISTERED',
  M1_MODEL_REGISTERED = 'M1_MODEL_REGISTERED'
}

// Estados de cuenta
enum IdentityStatus {
  PROVISIONAL = 'provisional',
  WHATSAPP_VERIFIED = 'whatsapp_verified',
  AGE_VERIFIED = 'age_verified',
  PAYMENT_ENABLED = 'payment_enabled',
  OPERATIONAL = 'operational'
}

// Roles de cuenta
enum AccountRole {
  UNDEFINED = 'undefined',
  USER = 'user',
  MODEL = 'model'
}
```

**Regla**: Estos enums son canónicos y no pueden modificarse sin una decisión arquitectónica formal.

---

## 4. Transiciones Permitidas

### 4.1. Transiciones del Proceso de Registro

#### 4.1.1. Transiciones Normales (Flujo Exitoso)

```
R0 → R1: Usuario inicia registro (acción explícita)
R1 → R2: Número válido ingresado y formato validado
R2 → R3: Código OTP verificado exitosamente
R3 → R4: Cuenta creada exitosamente
R4 → U1: Rol "user" seleccionado y guardado exitosamente
R4 → M1: Rol "model" seleccionado y guardado exitosamente
```

**Regla**: Estas transiciones requieren validación exitosa en cada paso. Cualquier falla bloquea la transición.

#### 4.1.2. Transiciones de Retry (Errores Recuperables)

```
R1 → R1: Formato inválido (usuario corrige y reintenta)
R2 → R2: Código OTP incorrecto (usuario reintenta, con límite de intentos)
R2 → R1: Usuario solicita cambiar número (cancelación parcial)
R3 → R2: Error en creación de cuenta (permite retry de verificación OTP)
R4 → R4: Error al guardar rol (permite retry)
```

**Regla**: Las transiciones de retry mantienen el estado actual y permiten corrección sin perder progreso crítico.

#### 4.1.3. Transiciones de Cancelación

```
R1 → R0: Usuario cancela registro
R2 → R1: Usuario cancela y solicita cambiar número
```

**Regla**: La cancelación elimina la sesión de registro y todos los datos transitorios asociados.

#### 4.1.4. Transiciones Prohibidas

Las siguientes transiciones están EXPLÍCITAMENTE PROHIBIDAS:

```
R0 → R2: No se puede saltar R1
R0 → R3: No se puede saltar R1 y R2
R1 → R3: No se puede saltar R2
R1 → R4: No se puede saltar R2 y R3
R2 → R4: No se puede saltar R3
R3 → R1: No se puede retroceder desde R3
R3 → R2: No se puede retroceder desde R3
R4 → R3: No se puede retroceder desde R4
R4 → R2: No se puede retroceder desde R4
R4 → R1: No se puede retroceder desde R4
U1 → R4: No se puede retroceder desde estado terminal
M1 → R4: No se puede retroceder desde estado terminal
U1 → M1: No se puede cambiar de rol después de registro
M1 → U1: No se puede cambiar de rol después de registro
```

**Regla**: Las transiciones prohibidas deben ser rechazadas con error explícito. No se permite comportamiento implícito que permita estas transiciones.

### 4.2. Transiciones de Estados de Cuenta

#### 4.2.1. Transiciones Progresivas

```
PROVISIONAL → WHATSAPP_VERIFIED: Automático después de R2
WHATSAPP_VERIFIED → AGE_VERIFIED: Requiere proceso de verificación de edad externo
AGE_VERIFIED → PAYMENT_ENABLED: Requiere proceso de verificación de pago externo
PAYMENT_ENABLED → OPERATIONAL: Automático cuando todas las verificaciones están completas
```

**Regla**: Las transiciones de estados de cuenta son unidireccionales. No se puede retroceder.

#### 4.2.2. Transiciones Prohibidas

Las siguientes transiciones están EXPLÍCITAMENTE PROHIBIDAS:

```
PROVISIONAL → AGE_VERIFIED: No se puede saltar WHATSAPP_VERIFIED
PROVISIONAL → PAYMENT_ENABLED: No se puede saltar estados intermedios
PROVISIONAL → OPERATIONAL: No se puede saltar estados intermedios
WHATSAPP_VERIFIED → PAYMENT_ENABLED: No se puede saltar AGE_VERIFIED
WHATSAPP_VERIFIED → OPERATIONAL: No se puede saltar estados intermedios
AGE_VERIFIED → OPERATIONAL: No se puede saltar PAYMENT_ENABLED
Cualquier retroceso: No se puede retroceder en estados de cuenta
```

**Regla**: Las transiciones prohibidas deben ser rechazadas con error explícito. El sistema debe validar el orden de estados antes de permitir cualquier transición.

---

## 5. Estados Terminales

### 5.1. Estados Terminales del Proceso de Registro

**U1 (USER_REGISTERED)**:
- `registration_state`: `U1_USER_REGISTERED`
- `whatsapp_verified`: `true`
- `identity_status`: `provisional`
- `role`: `user`
- `account_id`: Generado
- `alias_technical`: Generado (formato `Elixir_U{numero}`)

**M1 (MODEL_REGISTERED)**:
- `registration_state`: `M1_MODEL_REGISTERED`
- `whatsapp_verified`: `true`
- `identity_status`: `provisional`
- `role`: `model`
- `account_id`: Generado
- `alias_technical`: Generado (formato `Elixir_M{numero}`)

**Regla**: Los estados terminales indican que el proceso de registro se completó exitosamente. No hay transiciones desde estados terminales de vuelta al proceso de registro.

### 5.2. Estado Terminal de Cuenta

**OPERATIONAL**:
- `identity_status`: `operational`
- `whatsapp_verified`: `true`
- `age_verified`: `true`
- `payment_enabled`: `true`

**Regla**: El estado `operational` se alcanza automáticamente cuando todas las verificaciones están completas. No requiere acción adicional.

---

## 6. Mecanismos de Apagabilidad (Kill-Switch)

### 6.1. Kill-Switch Global del Sistema

**Definición**: Mecanismo que permite detener completamente el proceso de registro en cualquier punto.

**Estados del Kill-Switch**:
- `INACTIVE`: Kill-switch desactivado, registro funciona normalmente
- `ACTIVE_DROP`: Kill-switch activo en modo DROP (rechaza todas las solicitudes)
- `ACTIVE_SILENCE`: Kill-switch activo en modo SILENCIO (procesa pero no ejecuta acciones)

**Regla**: El kill-switch debe poder activarse en cualquier momento, desde cualquier estado del proceso de registro.

### 6.2. Comportamiento por Estado del Proceso

#### 6.2.1. R0 (VISITOR)

**Kill-Switch ACTIVE_DROP**:
- Rechaza cualquier intento de iniciar registro (R0 → R1)
- Retorna error genérico: "Servicio temporalmente no disponible"
- No expone razón del rechazo

**Kill-Switch ACTIVE_SILENCE**:
- Permite iniciar registro (R0 → R1)
- Procesa normalmente hasta R3
- No crea cuenta en R3 (procesa pero no persiste)

#### 6.2.2. R1 (PHONE_INPUT)

**Kill-Switch ACTIVE_DROP**:
- Rechaza validación de número
- Retorna error genérico: "Servicio temporalmente no disponible"
- Permite cancelación (R1 → R0)

**Kill-Switch ACTIVE_SILENCE**:
- Permite validación de número
- Permite transición a R2
- No envía OTP en R2

#### 6.2.3. R2 (OTP_VERIFICATION)

**Kill-Switch ACTIVE_DROP**:
- Rechaza verificación de OTP
- Retorna error genérico: "Servicio temporalmente no disponible"
- Permite cancelación (R2 → R1)

**Kill-Switch ACTIVE_SILENCE**:
- Permite verificación de OTP
- Permite transición a R3
- No crea cuenta en R3

#### 6.2.4. R3 (ACCOUNT_CREATION)

**Kill-Switch ACTIVE_DROP**:
- Rechaza creación de cuenta
- Retorna error genérico: "Servicio temporalmente no disponible"
- NO permite cancelación (proceso en curso)

**Kill-Switch ACTIVE_SILENCE**:
- Procesa creación pero no persiste cuenta
- Retorna error genérico: "Error al crear cuenta, por favor intente más tarde"
- Permite retry (R3 → R2)

#### 6.2.5. R4 (ROLE_SELECTION)

**Kill-Switch ACTIVE_DROP**:
- Rechaza guardado de rol
- Retorna error genérico: "Servicio temporalmente no disponible"
- NO permite cancelación (proceso en curso)

**Kill-Switch ACTIVE_SILENCE**:
- Procesa selección pero no persiste rol
- Retorna error genérico: "Error al guardar selección, por favor intente más tarde"
- Permite retry (R4 → R4)

### 6.3. Kill-Switch por Cuenta

**Definición**: Mecanismo que permite desactivar una cuenta específica después del registro.

**Estados**:
- `INACTIVE`: Cuenta activa
- `ACTIVE`: Cuenta desactivada (kill-switch activo)

**Comportamiento**:
- Cuenta con kill-switch activo: Todas las operaciones retornan DENY
- No se puede reactivar automáticamente
- Requiere intervención administrativa explícita

**Regla**: El kill-switch por cuenta debe poder activarse en cualquier momento después del registro.

### 6.4. Persistencia del Kill-Switch

**Regla**: El estado del kill-switch global debe persistirse y sobrevivir a reinicios del sistema.

**Implementación**:
- Estado persistido en almacenamiento local (archivo o base de datos)
- Carga al iniciar sistema
- Fail-closed: Si no se puede cargar estado, kill-switch inicia como ACTIVE_DROP

**Regla**: El kill-switch por cuenta debe persistirse como parte del estado de la cuenta.

---

## 7. Invariantes de Seguridad y Control

### 7.1. Invariante D0 (No Custodia de Datos Personales)

**Definición**: Elixir NO custodia datos personales durante el proceso de registro.

**Validaciones**:
- ✅ Número de WhatsApp solo se almacena como hash (no texto plano)
- ✅ Código OTP no se persiste después de verificación
- ✅ No se solicita ni almacena nombre real
- ✅ No se solicita ni almacena email (opcional, no requerido)
- ✅ No se solicita ni almacena información personal adicional

**Regla**: Cualquier violación de esta invariante debe activar kill-switch inmediatamente y abortar el proceso.

### 7.2. Invariante Default Deny

**Definición**: El sistema deniega por defecto. Solo permite operaciones explícitamente autorizadas.

**Validaciones**:
- ✅ Todas las transiciones inician como DENY
- ✅ Solo se permite transición si todas las validaciones pasan
- ✅ Cualquier error o excepción resulta en DENY
- ✅ Kill-switch activo resulta en DENY
- ✅ Estados inválidos resultan en DENY

**Regla**: El sistema debe validar explícitamente cada transición. No hay comportamiento implícito que permita transiciones no autorizadas.

### 7.3. Invariante Age Check Deshabilitado NO Permite Aprobación

**Definición**: Si el sistema de verificación de edad está deshabilitado, NO se puede aprobar acceso a contenido para adultos.

**Validaciones**:
- ✅ `age_verified` solo puede ser `true` si el proceso de verificación de edad está habilitado Y completado exitosamente
- ✅ Si `age_check_enabled = false`, entonces `age_verified` DEBE permanecer en `false`
- ✅ No hay bypass o excepción que permita `age_verified = true` cuando `age_check_enabled = false`
- ✅ Cualquier intento de establecer `age_verified = true` cuando `age_check_enabled = false` debe ser rechazado con error explícito

**Regla**: Esta invariante es absoluta. No hay excepciones ni casos especiales que permitan violarla.

### 7.4. Invariante de Orden de Estados

**Definición**: Los estados de cuenta solo pueden avanzar en el orden definido. No se puede saltar estados.

**Validaciones**:
- ✅ `PROVISIONAL` → `WHATSAPP_VERIFIED` → `AGE_VERIFIED` → `PAYMENT_ENABLED` → `OPERATIONAL`
- ✅ No se puede establecer `AGE_VERIFIED = true` sin `WHATSAPP_VERIFIED = true`
- ✅ No se puede establecer `PAYMENT_ENABLED = true` sin `AGE_VERIFIED = true`
- ✅ No se puede establecer `OPERATIONAL` sin todas las verificaciones previas

**Regla**: Cualquier intento de saltar estados debe ser rechazado con error explícito.

### 7.5. Invariante de Inmutabilidad de Identificadores

**Definición**: Los identificadores de cuenta son inmutables después de la creación.

**Validaciones**:
- ✅ `account_id` no puede modificarse después de R3
- ✅ `alias_technical` no puede modificarse después de R3
- ✅ `whatsapp_number_hash` no puede modificarse después de R3

**Regla**: Cualquier intento de modificar identificadores inmutables debe ser rechazado con error explícito.

### 7.6. Invariante de Unicidad de Cuenta

**Definición**: Un número de WhatsApp solo puede estar asociado a una cuenta.

**Validaciones**:
- ✅ Antes de crear cuenta en R3, verificar que el hash del número no existe
- ✅ Si el hash existe, rechazar creación con error: "Número ya registrado"
- ✅ No permitir creación de cuenta duplicada

**Regla**: Esta validación debe ocurrir antes de R3. Si se detecta duplicado, transición a R1 con mensaje de error.

### 7.7. Invariante de Kill-Switch Efectivo

**Definición**: El kill-switch debe poder detener el proceso en cualquier punto.

**Validaciones**:
- ✅ Kill-switch debe poder activarse desde cualquier estado
- ✅ Kill-switch activo debe resultar en DENY inmediato
- ✅ Estado del kill-switch debe persistirse
- ✅ Kill-switch debe sobrevivir a reinicios del sistema

**Regla**: El kill-switch es el mecanismo de control último. Debe funcionar incluso si otros sistemas fallan.

---

## 8. Validaciones por Estado

### 8.1. R0 (VISITOR)

**Validaciones**:
- ✅ Usuario no tiene cuenta activa
- ✅ Kill-switch global no está activo (si está activo, rechazar inicio de registro)

**Transiciones permitidas**:
- ✅ R0 → R1: Si kill-switch inactivo

**Transiciones prohibidas**:
- ❌ R0 → R2, R0 → R3, R0 → R4 (saltar estados)

### 8.2. R1 (PHONE_INPUT)

**Validaciones**:
- ✅ Formato de número válido (validación en tiempo real)
- ✅ Número no está registrado (validación al enviar)
- ✅ Kill-switch global no está activo

**Transiciones permitidas**:
- ✅ R1 → R2: Si número válido y no registrado
- ✅ R1 → R1: Si formato inválido (retry)
- ✅ R1 → R0: Si usuario cancela

**Transiciones prohibidas**:
- ❌ R1 → R3, R1 → R4 (saltar estados)
- ❌ R1 → R2: Si número ya registrado (debe mostrar error y sugerir iniciar sesión)

### 8.3. R2 (OTP_VERIFICATION)

**Validaciones**:
- ✅ Código OTP enviado exitosamente
- ✅ Código OTP no expirado
- ✅ Código OTP coincide con enviado
- ✅ Intentos no excedidos (límite configurable)
- ✅ Kill-switch global no está activo

**Transiciones permitidas**:
- ✅ R2 → R3: Si código correcto y no expirado
- ✅ R2 → R2: Si código incorrecto (retry, con límite)
- ✅ R2 → R1: Si usuario cancela o solicita cambiar número

**Transiciones prohibidas**:
- ❌ R2 → R4 (saltar R3)
- ❌ R2 → R3: Si código expirado o intentos excedidos

### 8.4. R3 (ACCOUNT_CREATION)

**Validaciones**:
- ✅ WhatsApp verificado (R2 completado)
- ✅ Número no duplicado (verificación de unicidad)
- ✅ Servicio de creación disponible
- ✅ Kill-switch global no está activo

**Transiciones permitidas**:
- ✅ R3 → R4: Si cuenta creada exitosamente
- ✅ R3 → R2: Si error en creación (permite retry)

**Transiciones prohibidas**:
- ❌ R3 → R1, R3 → R0 (no se puede retroceder desde R3)
- ❌ R3 → R4: Si cuenta no creada

### 8.5. R4 (ROLE_SELECTION)

**Validaciones**:
- ✅ Cuenta creada exitosamente (R3 completado)
- ✅ Rol seleccionado (user o model)
- ✅ Servicio de guardado disponible
- ✅ Kill-switch global no está activo

**Transiciones permitidas**:
- ✅ R4 → U1: Si rol "user" seleccionado y guardado
- ✅ R4 → M1: Si rol "model" seleccionado y guardado
- ✅ R4 → R4: Si error al guardar (retry)

**Transiciones prohibidas**:
- ❌ R4 → R3, R4 → R2, R4 → R1 (no se puede retroceder desde R4)
- ❌ R4 → U1/M1: Si rol no guardado

---

## 9. Criterios de Cierre de FASE 1.1

### 9.1. Criterios Cumplidos

✅ **Enum claro de estados**: Definidos en sección 3.3  
✅ **Transiciones explícitas y justificadas**: Definidas en sección 4  
✅ **Estados terminales definidos**: Definidos en sección 5  
✅ **Flujo es default DENY**: Definido en sección 7.2  
✅ **Sistema puede ser apagado en cualquier punto**: Definido en sección 6  
✅ **age_check deshabilitado NO permite aprobación**: Definido en sección 7.3  
✅ **Todo es registrable como documento canónico en Git**: Este documento

### 9.2. Trazabilidad Conceptual

Este documento establece la base canónica para:
- Implementación del proceso de registro
- Validación de transiciones
- Implementación de kill-switch
- Validación de invariantes de seguridad
- Integración con Elixir Core (sellado)
- Integración con WAM (transporte)

**Regla**: Cualquier implementación debe seguir este modelo canónico. Desviaciones requieren decisión arquitectónica formal.

---

## 10. Relación con Otros Documentos

Este documento se relaciona con:

- **docs/DECISION_D0_CUSTODIA.md**: Principios de no custodia de datos
- **docs/REGISTRO/02_FLUJO_DE_REGISTRO.md**: Flujo detallado del proceso
- **docs/REGISTRO/03_ESTADOS_DE_CUENTA.md**: Estados de cuenta post-registro
- **docs/REGISTRO_Y_IDENTIDAD/01_REGISTRO_UNIFICADO.md**: Definición del registro unificado
- **core/src/service/authorize.ts**: Implementación de default deny en Elixir Core

**Regla**: Este documento tiene precedencia sobre documentos de UX/UI. Define el modelo lógico canónico que debe implementarse.

---

## 11. Notas de Implementación

### 11.1. Principios de Implementación

1. **Fail-Closed**: Cualquier error o excepción debe resultar en DENY
2. **Explicit is Better than Implicit**: Todas las transiciones deben validarse explícitamente
3. **No Bypass**: No hay excepciones ni casos especiales que permitan violar invariantes
4. **Kill-Switch First**: El kill-switch debe poder activarse en cualquier momento
5. **Default Deny**: El sistema deniega por defecto, solo permite explícitamente

### 11.2. Validaciones Obligatorias

Toda implementación debe validar:
- ✅ Estado actual del proceso
- ✅ Transición solicitada es permitida
- ✅ Todas las condiciones previas están cumplidas
- ✅ Kill-switch no está activo
- ✅ Invariantes de seguridad no se violan
- ✅ Default deny se aplica si cualquier validación falla

### 11.3. Comportamiento en Caso de Error

**Regla**: Cualquier error debe resultar en:
1. DENY de la operación solicitada
2. Registro del error en logs de auditoría
3. Mantener estado actual (no avanzar ni retroceder)
4. Permitir retry si es apropiado (según sección 4.1.2)

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: DEFINITIVO - FASE 1.1 CERRADA  
**Fecha de Cierre**: 2025-01-27


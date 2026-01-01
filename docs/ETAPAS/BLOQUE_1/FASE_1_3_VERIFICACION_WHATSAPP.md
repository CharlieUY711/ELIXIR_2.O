# FASE 1.3 — Verificación WhatsApp (delegada vía WAM)

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Base Operativa Mínima  
**Bloque**: BLOQUE 1 — Registro Unificado  
**Fase**: FASE 1.3 — Verificación WhatsApp (delegada vía WAM)  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Contexto Normativo

### 1.1. Principios Fundamentales

Este documento define qué significa "verificación WhatsApp" en el contexto de Elixir Platform y cómo se integra con el proceso de registro. El documento es:

- **Declarativo**: Define qué existe y cómo se comporta, no cómo se implementa
- **Normativo**: Establece reglas obligatorias que toda implementación debe respetar
- **Canónico**: Es la única fuente de verdad para la verificación WhatsApp
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones

### 1.2. Relación con Fases Anteriores

Este documento se basa en:
- **FASE 1.1**: La máquina de estados y el modelo lógico del registro
- **FASE 1.2**: El registro mínimo funcional que establece la base

La verificación WhatsApp opera dentro de los estados y transiciones definidos en FASE 1.1, agregando la capacidad de verificar números de WhatsApp mediante OTP delegado a WAM.

### 1.3. Invariantes Globales

La verificación WhatsApp respeta los mismos invariantes fundamentales definidos en FASE 1.1:

1. **D0 (Elixir no custodia datos)**: El sistema no almacena números de teléfono en claro ni metadatos personales
2. **Default Deny**: Todo intento de registro inicia en estado de denegación implícita
3. **Apagabilidad**: El sistema debe poder detenerse completamente mediante kill-switch

### 1.4. Relación con WAM

WAM (WhatsApp Enmascarado) existe y funciona como transporte delegado. La verificación WhatsApp en Elixir:
- **Delega** la ejecución técnica de envío y verificación de OTP a WAM
- **Recibe** señales binarias del resultado de la verificación
- **NO** conoce los detalles técnicos de cómo WAM ejecuta la verificación
- **NO** almacena datos personales relacionados con la verificación

---

## 2. Definición de "Verificación WhatsApp" en Elixir

### 2.1. Enunciado Canónico

**Verificación WhatsApp** es el proceso mediante el cual Elixir Platform establece que un número de WhatsApp proporcionado por un usuario puede recibir y verificar códigos OTP enviados a través de WAM, sin que Elixir valide la identidad del propietario del número ni almacene el número en claro.

### 2.2. Qué Verifica

La verificación WhatsApp verifica **únicamente**:

1. **Posesión del número**: Que el usuario tiene acceso al número de WhatsApp proporcionado (puede recibir y verificar el código OTP)
2. **Disponibilidad del número**: Que el número puede recibir mensajes a través de WAM
3. **Capacidad de verificación**: Que el usuario puede completar el proceso de verificación OTP

**Regla explícita**: La verificación WhatsApp es binaria: `VERIFIED` o `FAILED`. No hay estados intermedios de "parcialmente verificado".

### 2.3. Qué NO Verifica

La verificación WhatsApp **NO** verifica:

1. **Identidad del propietario**: No confirma quién es el dueño del número
2. **Validez del número**: No valida que el número sea válido en términos de formato o existencia (eso es responsabilidad de WAM)
3. **Unicidad del número**: No verifica que el número no esté ya registrado (eso es responsabilidad del sistema de registro)
4. **Edad del usuario**: No verifica la edad del propietario del número
5. **Capacidad de pago**: No verifica capacidad financiera
6. **Cualquier otro atributo personal**: No verifica ningún otro dato personal

**Regla explícita**: La verificación WhatsApp es un gate técnico de posesión, no un gate de identidad.

### 2.4. Qué NO Almacena

La verificación WhatsApp **NO** almacena:

1. **Números de teléfono en claro**: Solo almacena hash del número (invariante D0)
2. **Códigos OTP**: No almacena códigos OTP después de la verificación
3. **Metadatos personales**: No almacena información sobre el propietario del número
4. **Historial de intentos detallado**: No almacena detalles de intentos fallidos más allá de lo necesario para límites operativos
5. **Información de WAM**: No almacena detalles técnicos de cómo WAM ejecutó la verificación

**Regla explícita**: Elixir mantiene solo estados binarios (`VERIFIED`, `FAILED`, `PENDING`, `BLOCKED`) y referencias opacas necesarias para orquestación.

---

## 3. Rol de WAM como Sistema Delegado

### 3.1. Responsabilidades de WAM

WAM es responsable de:

1. **Envío de OTP**: Enviar códigos OTP a números de WhatsApp a través del proveedor de WhatsApp
2. **Verificación de OTP**: Validar códigos OTP proporcionados por el usuario
3. **Gestión de sesiones OTP**: Mantener estado temporal de sesiones OTP durante el proceso de verificación
4. **Comunicación con proveedor**: Gestionar la comunicación técnica con el proveedor de WhatsApp
5. **Reporte de resultados**: Informar a Elixir el resultado de la verificación mediante señales binarias

**Regla explícita**: WAM es ejecutor puro. No decide, no explica, no aprende. Solo ejecuta y reporta.

### 3.2. Responsabilidades de Elixir

Elixir es responsable de:

1. **Orquestación del proceso**: Coordinar el flujo de verificación dentro del proceso de registro
2. **Gestión de estados**: Mantener el estado del gate `whatsapp_gate` según señales recibidas de WAM
3. **Integración con máquina de estados**: Integrar la verificación en la máquina de estados definida en FASE 1.1
4. **Aplicación de reglas de negocio**: Aplicar reglas de negocio basadas en el resultado de la verificación
5. **Gestión de kill-switch**: Aplicar kill-switch cuando sea necesario

**Regla explícita**: Elixir orquesta, no ejecuta. WAM ejecuta, no decide.

### 3.3. Separación de Responsabilidades

**WAM NO conoce**:
- La máquina de estados del registro
- Las reglas de negocio de Elixir
- El contexto completo del proceso de registro
- Otros gates o verificaciones

**Elixir NO conoce**:
- Los detalles técnicos de cómo WAM envía OTP
- La implementación interna de WAM
- Los detalles de comunicación con el proveedor de WhatsApp
- El estado interno de WAM

**Regla explícita**: La comunicación entre Elixir y WAM es mediante señales binarias y referencias opacas, sin compartir contexto interno.

---

## 4. Señales Recibidas de WAM

### 4.1. Señales Binarias

Elixir recibe de WAM las siguientes señales sobre el resultado de la verificación:

1. **PASS**: La verificación fue exitosa. El usuario proporcionó el código OTP correcto.
2. **FAIL**: La verificación falló. El usuario proporcionó un código OTP incorrecto o se excedió el límite de intentos.
3. **PENDING**: La verificación está en curso. Se envió el código OTP pero aún no se ha verificado.
4. **TIMEOUT**: La verificación expiró. El código OTP expiró o el proceso de verificación excedió el tiempo máximo permitido.

**Regla explícita**: Estas son las únicas señales que Elixir recibe de WAM. No hay señales intermedias ni parciales.

### 4.2. Mapeo de Señales a Estados del Gate

Las señales de WAM se mapean a estados del gate `whatsapp_gate` de la siguiente manera:

- **PASS** → `VERIFIED`: El gate está verificado exitosamente
- **FAIL** → `FAILED`: El gate falló la verificación
- **PENDING** → `PENDING`: El gate está pendiente de verificación
- **TIMEOUT** → `FAILED`: El gate falló por expiración (se trata como fallo)

**Regla explícita**: El mapeo es directo y determinístico. No hay ambigüedad en cómo se mapean las señales.

### 4.3. Señales Adicionales de Error

Además de las señales binarias, WAM puede reportar errores técnicos:

- **PROVIDER_ERROR**: Error en la comunicación con el proveedor de WhatsApp
- **WAM_UNAVAILABLE**: WAM no está disponible o no puede procesar la solicitud
- **RATE_LIMIT**: Se excedió el límite de solicitudes a WAM

**Regla explícita**: Los errores técnicos se mapean a `FAILED` o `BLOCKED` según la naturaleza del error y las reglas de negocio.

---

## 5. Impacto en la Máquina de Estados

### 5.1. Estados Habilitados

La verificación WhatsApp habilita los siguientes estados del modelo definido en FASE 1.1:

**Estados no terminales**:
- `OTP_PENDING`: Se ha enviado un código OTP y se espera su verificación
- `OTP_VERIFIED`: Se ha verificado exitosamente el código OTP

**Estados del gate**:
- `whatsapp_gate.PENDING`: El gate está pendiente de verificación
- `whatsapp_gate.VERIFIED`: El gate ha sido verificado exitosamente
- `whatsapp_gate.FAILED`: El gate ha fallado la verificación
- `whatsapp_gate.BLOCKED`: El gate está bloqueado (por kill-switch o límites operativos)

### 5.2. Transiciones Habilitadas

La verificación WhatsApp habilita las siguientes transiciones:

```
PHONE_PENDING → OTP_PENDING: Se envió código OTP a través de WAM
OTP_PENDING → OTP_VERIFIED: Se verificó exitosamente el código OTP (señal PASS de WAM)
OTP_PENDING → OTP_FAILED: Falló la verificación del código OTP (señal FAIL de WAM)
OTP_PENDING → FAILED: Error técnico o timeout (señal TIMEOUT de WAM)
OTP_VERIFIED → ROLE_PENDING: El gate whatsapp_gate está VERIFIED, se puede avanzar
```

**Regla explícita**: Estas transiciones son las únicas permitidas cuando la verificación WhatsApp está habilitada.

### 5.3. Transiciones Bloqueadas

La verificación WhatsApp **bloquea** las siguientes transiciones si el gate no está verificado:

- `OTP_VERIFIED → ROLE_PENDING`: Requiere `whatsapp_gate.VERIFIED`
- `ROLE_PENDING → APPROVAL_PENDING`: Requiere `whatsapp_gate.VERIFIED` (según reglas de FASE 1.1)
- `APPROVAL_PENDING → APPROVED`: Requiere `whatsapp_gate.VERIFIED` (según reglas de FASE 1.1)

**Regla explícita**: Si `whatsapp_gate` no está en estado `VERIFIED`, el flujo NO puede avanzar a aprobación.

### 5.4. Integración con Default Deny

La verificación WhatsApp respeta el principio Default Deny:

- **Estado inicial**: El gate `whatsapp_gate` inicia en estado `PENDING` o `DISABLED` (implícitamente no verificado)
- **Aprobación explícita**: Solo señal `PASS` de WAM puede cambiar el estado a `VERIFIED`
- **Denegación por defecto**: Si la verificación falla o expira, el gate transita a `FAILED` y bloquea la aprobación

**Regla explícita**: El default deny se aplica al gate. Un gate no verificado bloquea la aprobación del registro.

---

## 6. Eventos Generados

### 6.1. Eventos Obligatorios

La verificación WhatsApp debe generar los siguientes eventos:

**Eventos de inicio**:
- `OTP_SENT`: Se envió un código OTP a través de WAM (transición a `OTP_PENDING`)

**Eventos de resultado**:
- `OTP_VERIFIED`: Se verificó exitosamente el código OTP (señal PASS de WAM, transición a `OTP_VERIFIED`)
- `OTP_FAILED`: Falló la verificación del código OTP (señal FAIL de WAM)

**Eventos de gate**:
- `GATE_STATUS_CHANGED`: Cambió el estado del gate `whatsapp_gate` (con detalles del cambio)

**Eventos de error**:
- `OTP_TIMEOUT`: La verificación expiró (señal TIMEOUT de WAM)
- `OTP_PROVIDER_ERROR`: Error en la comunicación con el proveedor de WhatsApp
- `OTP_WAM_UNAVAILABLE`: WAM no está disponible

### 6.2. Atributos de Eventos

Todos los eventos generados deben cumplir:

- **Inmutabilidad**: Los eventos son inmutables una vez creados
- **Sin PII**: Los eventos no contienen números de teléfono en claro ni datos personales (invariante D0)
- **Trazabilidad**: Los eventos permiten auditoría sin exponer información sensible
- **Reason codes**: Los eventos deben incluir `reason_code` apropiado

### 6.3. Eventos NO Generados

La verificación WhatsApp **NO** genera:

- Eventos que expongan números de teléfono en claro
- Eventos que expongan códigos OTP
- Eventos que expongan detalles técnicos internos de WAM
- Eventos que expongan información del proveedor de WhatsApp

**Regla explícita**: Los eventos solo contienen metadatos necesarios para auditoría, sin datos personales.

---

## 7. Errores y Rechazos Posibles

### 7.1. Errores Técnicos

Los siguientes errores técnicos son posibles durante la verificación WhatsApp:

**Errores de WAM**:
- `WAM_UNAVAILABLE`: WAM no está disponible o no puede procesar la solicitud
- `WAM_TIMEOUT`: WAM no respondió dentro del tiempo máximo permitido
- `WAM_RATE_LIMIT`: Se excedió el límite de solicitudes a WAM

**Errores de proveedor**:
- `PROVIDER_ERROR`: Error en la comunicación con el proveedor de WhatsApp
- `PROVIDER_UNAVAILABLE`: El proveedor de WhatsApp no está disponible
- `PROVIDER_RATE_LIMIT`: Se excedió el límite de solicitudes al proveedor

**Regla explícita**: Los errores técnicos se mapean a estados `FAILED` o `BLOCKED` del gate, según la naturaleza del error.

### 7.2. Rechazos de Negocio

Los siguientes rechazos de negocio son posibles:

**Límites operativos**:
- `MAX_OTP_ATTEMPTS_EXCEEDED`: Se excedió el número máximo de intentos de verificación OTP
- `OTP_EXPIRED`: El código OTP expiró antes de ser verificado
- `PHONE_ALREADY_VERIFIED`: El número ya está verificado en otra cuenta

**Regla explícita**: Los rechazos de negocio se mapean a estado `FAILED` del gate con `reason_code` apropiado.

### 7.3. Comportamiento ante Errores

**Errores recuperables**:
- Si WAM no está disponible temporalmente, el sistema puede reintentar (con límites)
- Si el proveedor no está disponible temporalmente, el sistema puede reintentar (con límites)

**Errores no recuperables**:
- Si se excede el límite de intentos, el gate transita a `FAILED` y no se permite más intentos
- Si el código OTP expira, el gate transita a `FAILED` y se requiere nuevo envío de OTP

**Regla explícita**: Los errores no recuperables bloquean el avance del registro. Los errores recuperables permiten reintentos con límites.

---

## 8. Comportamiento ante Silencio, Timeout o Fallo del Proveedor

### 8.1. Silencio de WAM

**Definición**: WAM no responde a una solicitud de verificación dentro del tiempo máximo permitido.

**Comportamiento**:
- El sistema espera el tiempo máximo configurado (timeout)
- Si WAM no responde, se trata como señal `TIMEOUT`
- El gate `whatsapp_gate` transita a `FAILED`
- Se genera evento `OTP_WAM_TIMEOUT`
- El intento puede transitar a `FAILED` o permanecer en `OTP_PENDING` según reglas de negocio

**Regla explícita**: El silencio de WAM se trata como fallo. No se asume éxito ni se permite avance sin confirmación.

### 8.2. Timeout del Proveedor

**Definición**: El proveedor de WhatsApp no responde a WAM dentro del tiempo máximo permitido.

**Comportamiento**:
- WAM reporta error `PROVIDER_TIMEOUT` a Elixir
- Elixir mapea el error a señal `TIMEOUT`
- El gate `whatsapp_gate` transita a `FAILED`
- Se genera evento `OTP_PROVIDER_TIMEOUT`
- El intento puede transitar a `FAILED` o permanecer en `OTP_PENDING` según reglas de negocio

**Regla explícita**: El timeout del proveedor se trata como fallo. No se permite avance sin confirmación exitosa.

### 8.3. Fallo del Proveedor

**Definición**: El proveedor de WhatsApp reporta un error o rechaza la solicitud.

**Comportamiento**:
- WAM reporta error `PROVIDER_ERROR` o `PROVIDER_FAILED` a Elixir
- Elixir mapea el error a señal `FAIL`
- El gate `whatsapp_gate` transita a `FAILED`
- Se genera evento `OTP_PROVIDER_ERROR` o `OTP_PROVIDER_FAILED`
- El intento puede transitar a `FAILED` o permanecer en `OTP_PENDING` según reglas de negocio

**Regla explícita**: El fallo del proveedor se trata como fallo de verificación. No se permite avance sin confirmación exitosa.

### 8.4. Principio Fail-Closed

**Enunciado**: Ante cualquier ambigüedad, silencio, timeout o fallo, el sistema debe fallar cerrado (denegar) en lugar de fallar abierto (permitir).

**Aplicación**:
- Silencio de WAM → `FAILED`
- Timeout del proveedor → `FAILED`
- Fallo del proveedor → `FAILED`
- Error técnico → `FAILED` o `BLOCKED`

**Regla explícita**: El principio fail-closed tiene prioridad sobre cualquier optimización o conveniencia. La seguridad prima sobre la usabilidad.

---

## 9. Apagabilidad (Kill-Switch)

### 9.1. Kill-Switch Global

**Definición**: Mecanismo que permite detener completamente el proceso de registro, incluyendo la verificación WhatsApp.

**Estados**:
- `INACTIVE`: El kill-switch no está activo, el sistema opera normalmente
- `ACTIVE_DROP`: El kill-switch está activo en modo DROP (rechaza todos los intentos nuevos)
- `ACTIVE_SILENCIO`: El kill-switch está activo en modo SILENCIO (rechaza intentos nuevos, mantiene intentos en curso)

**Comportamiento ante kill-switch global activo**:
- No se pueden iniciar nuevos procesos de verificación WhatsApp
- Los procesos en curso pueden completarse o transicionar a `FAILED` según modo del kill-switch
- El gate `whatsapp_gate` puede transitar a `BLOCKED` si el kill-switch está activo

**Regla explícita**: El kill-switch global tiene prioridad absoluta sobre todas las demás decisiones, incluyendo la verificación WhatsApp.

### 9.2. Kill-Switch del Gate WhatsApp

**Definición**: Mecanismo específico que permite deshabilitar la verificación WhatsApp sin afectar otros aspectos del registro.

**Estados del gate**:
- `DISABLED`: El gate está deshabilitado, no se puede realizar verificación WhatsApp
- `BLOCKED`: El gate está bloqueado (por kill-switch del gate o límites operativos)

**Comportamiento ante kill-switch del gate activo**:
- El gate `whatsapp_gate` transita a `DISABLED` o `BLOCKED`
- No se pueden iniciar nuevos procesos de verificación WhatsApp
- Los procesos en curso pueden completarse o transicionar a `FAILED` según configuración
- El flujo NO puede avanzar a aprobación si el gate está `DISABLED` o `BLOCKED`

**Regla explícita**: Si `whatsapp_gate` está `DISABLED` o `BLOCKED`, el flujo NO puede avanzar a `APPROVED`.

### 9.3. Regla Explícita: WhatsApp Verification DISABLED

**Enunciado**: Si la verificación WhatsApp está `DISABLED`, el flujo NO puede avanzar a aprobación.

**Aplicación**:
- Si `whatsapp_gate` está en estado `DISABLED`, ningún `RegistroAttempt` puede transitar a `APPROVED`
- Si `whatsapp_gate` está en estado `BLOCKED`, ningún `RegistroAttempt` puede transitar a `APPROVED`
- El intento debe transitar a `DENIED` con `reason_code: DENIED_WHATSAPP_VERIFICATION_DISABLED` o `DENIED_WHATSAPP_VERIFICATION_BLOCKED`

**Justificación**: Garantiza que el sistema no apruebe registros que requieren verificación WhatsApp cuando el mecanismo de verificación no está disponible.

**Regla explícita**: Esta regla tiene prioridad sobre cualquier otra regla de aprobación. No hay excepciones.

### 9.4. Persistencia del Kill-Switch

**Regla**: El estado del kill-switch (tanto global como del gate) debe persistirse y sobrevivir a reinicios del sistema.

**Comportamiento**:
- El kill-switch se carga al iniciar el sistema
- Si no se puede cargar el estado, el kill-switch inicia como `ACTIVE_DROP` (fail-closed)
- El estado del kill-switch se guarda inmediatamente después de cualquier cambio

**Regla explícita**: El kill-switch es persistente y tiene prioridad sobre cualquier estado transitorio.

---

## 10. Integración con FASE 1.1 y FASE 1.2

### 10.1. Coherencia con Máquina de Estados

La verificación WhatsApp opera dentro de la máquina de estados definida en FASE 1.1:

- **Respeta estados**: Usa los estados definidos en FASE 1.1 (`OTP_PENDING`, `OTP_VERIFIED`, etc.)
- **Respeta transiciones**: Solo permite transiciones definidas en FASE 1.1
- **Respeta invariantes**: Mantiene todos los invariantes definidos en FASE 1.1 (D0, Default Deny, Apagabilidad)

**Regla explícita**: La verificación WhatsApp no modifica la máquina de estados, solo la utiliza.

### 10.2. Compatibilidad con Registro Mínimo Funcional

La verificación WhatsApp es **opcional** respecto al registro mínimo funcional definido en FASE 1.2:

- **FASE 1.2**: Permite registro sin verificación WhatsApp
- **FASE 1.3**: Agrega verificación WhatsApp como gate adicional
- **Evolución**: La identidad técnica provisional creada en FASE 1.2 puede evolucionar agregando verificación WhatsApp en FASE 1.3

**Regla explícita**: La verificación WhatsApp es una extensión del registro mínimo funcional, no un reemplazo.

### 10.3. Condiciones de Aprobación Actualizadas

Con la verificación WhatsApp habilitada, las condiciones de aprobación de FASE 1.1 se actualizan:

**Condiciones para APPROVED** (además de las definidas en FASE 1.1):
- El gate `whatsapp_gate` debe estar en estado `VERIFIED` (si la verificación WhatsApp está habilitada)
- Si `whatsapp_gate` está `DISABLED` o `BLOCKED`, el intento NO puede transitar a `APPROVED`

**Regla explícita**: La verificación WhatsApp es un prerrequisito para aprobación cuando está habilitada.

---

## 11. Reason Codes Específicos de Verificación WhatsApp

### 11.1. Códigos de Verificación Exitosa

- `OTP_VERIFIED_SUCCESS`: Verificación OTP exitosa (señal PASS de WAM)

### 11.2. Códigos de Fallo de Verificación

- `OTP_FAILED_INCORRECT`: Código OTP incorrecto (señal FAIL de WAM)
- `OTP_FAILED_MAX_ATTEMPTS`: Se excedió el número máximo de intentos
- `OTP_FAILED_EXPIRED`: El código OTP expiró
- `OTP_FAILED_TIMEOUT`: Timeout en la verificación (señal TIMEOUT de WAM)

### 11.3. Códigos de Error Técnico

- `OTP_ERROR_WAM_UNAVAILABLE`: WAM no está disponible
- `OTP_ERROR_WAM_TIMEOUT`: WAM no respondió dentro del tiempo máximo
- `OTP_ERROR_PROVIDER_ERROR`: Error en la comunicación con el proveedor de WhatsApp
- `OTP_ERROR_PROVIDER_UNAVAILABLE`: El proveedor de WhatsApp no está disponible
- `OTP_ERROR_PROVIDER_TIMEOUT`: Timeout en la comunicación con el proveedor

### 11.4. Códigos de Bloqueo

- `OTP_BLOCKED_KILLSWITCH_GLOBAL`: Bloqueado por kill-switch global activo
- `OTP_BLOCKED_KILLSWITCH_GATE`: Bloqueado por kill-switch del gate WhatsApp activo
- `OTP_BLOCKED_RATE_LIMIT`: Bloqueado por límite de solicitudes excedido

### 11.5. Códigos de Denegación

- `DENIED_WHATSAPP_VERIFICATION_DISABLED`: Denegado porque la verificación WhatsApp está deshabilitada
- `DENIED_WHATSAPP_VERIFICATION_BLOCKED`: Denegado porque la verificación WhatsApp está bloqueada
- `DENIED_WHATSAPP_VERIFICATION_REQUIRED`: Denegado porque se requiere verificación WhatsApp pero no se completó

**Regla explícita**: Todos los estados terminales y eventos deben incluir `reason_code` apropiado.

---

## 12. Límites y Restricciones

### 12.1. Límites de la Verificación WhatsApp

La verificación WhatsApp tiene los siguientes límites:

- **Funcionalidad limitada**: Solo verifica posesión del número, no identidad
- **Dependencia de WAM**: Requiere que WAM esté disponible y funcional
- **Dependencia del proveedor**: Requiere que el proveedor de WhatsApp esté disponible
- **Sin almacenamiento de PII**: No almacena números en claro ni metadatos personales (invariante D0)

### 12.2. Restricciones de Implementación

La verificación WhatsApp NO especifica:

- Implementación técnica de WAM (WAM existe y funciona, no se redefine)
- Detalles de UI/UX (el diseño UX está cerrado y no se redefine)
- Algoritmos de hash o encriptación específicos
- Límites numéricos específicos (número máximo de intentos, tiempo de expiración, etc.)
- Proveedores específicos de WhatsApp (eso es responsabilidad de WAM)

### 12.3. No Modifica Core ni WAM

**Regla explícita**: Este documento NO modifica:
- Elixir Core (que es sellado e inmodificable)
- WAM (que existe y funciona como transporte delegado)
- El diseño UX del Registro Unificado (que está cerrado)

---

## 13. Qué NO es la Verificación WhatsApp

### 13.1. No es Verificación de Identidad

La verificación WhatsApp **NO** establece:
- Identidad verificada del usuario
- Confirmación de quién es el propietario del número
- Validación de documentos de identidad
- Verificación de edad

**Es**: Verificación técnica de posesión del número mediante OTP.

### 13.2. No es Validación de Número

La verificación WhatsApp **NO** valida:
- Que el número sea válido en términos de formato (eso es responsabilidad de WAM)
- Que el número exista realmente (eso es responsabilidad del proveedor)
- Que el número no esté ya registrado (eso es responsabilidad del sistema de registro)

**Es**: Verificación de que el usuario puede recibir y verificar códigos OTP en ese número.

### 13.3. No Habilita Acceso a Otros Bloques

La verificación WhatsApp **NO** habilita:
- Acceso a funcionalidades de Chat (BLOQUE 2)
- Acceso a funcionalidades de Catálogo (BLOQUE 3)
- Operaciones transaccionales avanzadas
- Funcionalidades que requieren verificación adicional

**Es**: Un gate técnico dentro del proceso de registro que verifica posesión del número.

### 13.4. No Almacena Datos Personales

La verificación WhatsApp **NO** almacena:
- Números de teléfono en claro
- Códigos OTP después de la verificación
- Metadatos personales sobre el propietario del número
- Información de identidad

**Almacena**: Solo estados binarios (`VERIFIED`, `FAILED`, etc.) y referencias opacas necesarias para orquestación (invariante D0).

---

## 14. Principio Rector Explícito

### 14.1. Enunciado Canónico

**"La verificación WhatsApp es un gate técnico de posesión, no un gate de identidad. Elixir delega la ejecución a WAM y recibe señales binarias del resultado."**

### 14.2. Aplicación en Verificación WhatsApp

Este principio se aplica de la siguiente manera:

- **Delegación**: Elixir delega la ejecución técnica a WAM, no la realiza directamente
- **Señales binarias**: Elixir recibe solo señales binarias (PASS/FAIL/PENDING/TIMEOUT), no detalles técnicos
- **Sin custodia**: Elixir no custodia números en claro ni metadatos personales (invariante D0)
- **Gate técnico**: La verificación es un gate técnico de posesión, no un gate de identidad completa
- **Fail-closed**: Ante cualquier ambigüedad, el sistema falla cerrado (denegar)

### 14.3. Consecuencias Operativas

Como consecuencia de este principio:

- Elixir no necesita conocer los detalles técnicos de cómo WAM ejecuta la verificación
- Elixir no necesita almacenar información personal relacionada con la verificación
- El sistema puede operar completamente delegando la ejecución a WAM
- El sistema puede ser apagado en cualquier momento sin perder información de verificación (porque no la custodia)

---

## 15. Criterios de Cierre de FASE 1.3

### 15.1. Criterios Cumplidos

✅ **Concepto inequívoco**: La "verificación WhatsApp" está definida de forma canónica en la sección 2.1  
✅ **Qué verifica y qué NO verifica**: Definido explícitamente en secciones 2.2 y 2.3  
✅ **Rol de WAM**: Definido explícitamente en sección 3  
✅ **Señales recibidas**: Definidas explícitamente en sección 4  
✅ **Impacto en máquina de estados**: Definido explícitamente en sección 5  
✅ **Eventos generados**: Definidos explícitamente en sección 6  
✅ **Errores y rechazos**: Definidos explícitamente en sección 7  
✅ **Comportamiento ante fallos**: Definido explícitamente en sección 8  
✅ **Apagabilidad**: Definida explícitamente en sección 9, con regla explícita sobre DISABLED  
✅ **Default DENY ante ambigüedad**: Establecido en sección 8.4 (principio fail-closed)  
✅ **Registrable en Git sin ambigüedad**: Este documento es canónico y normativo, listo para registro

### 15.2. Verificación de Compatibilidad con FASE 1.1

✅ **Modelo lógico respetado**: La verificación WhatsApp opera dentro del modelo de FASE 1.1 (sección 10.1)  
✅ **Estados compatibles**: Usa estados definidos en FASE 1.1, sin añadir nuevos (sección 5.1)  
✅ **Transiciones válidas**: Las transiciones permitidas son compatibles con FASE 1.1 (sección 5.2)  
✅ **Invariantes mantenidos**: D0, Default Deny y Apagabilidad se respetan (sección 1.3 y 10.1)

### 15.3. Verificación de Compatibilidad con FASE 1.2

✅ **Registro mínimo funcional respetado**: La verificación WhatsApp es extensión, no reemplazo (sección 10.2)  
✅ **Evolución permitida**: La identidad técnica provisional puede evolucionar agregando verificación (sección 10.2)  
✅ **Opcionalidad**: La verificación WhatsApp es opcional respecto al registro mínimo funcional (sección 10.2)

### 15.4. Verificación de Restricciones Absolutas

✅ **Elixir Core sellado**: No se modifica ni referencia código de Core (sección 12.3)  
✅ **WAM existente**: No se redefine WAM, solo se define cómo Elixir interactúa con él (sección 3)  
✅ **Sin custodia de datos personales**: Invariante D0 respetado (secciones 2.4, 13.4)  
✅ **Diseño UX cerrado**: No se define UX en este documento (sección 12.2)  
✅ **Regla explícita DISABLED**: Definida explícitamente en sección 9.3

### 15.5. Estado de Cierre

**FASE 1.3 está CERRADA** cuando:

1. Este documento es aprobado formalmente
2. Todos los criterios de cierre (15.1-15.4) están verificados
3. El documento es registrado en Git como canónico
4. No quedan ambigüedades sobre qué es la verificación WhatsApp y cómo opera

**Resultado**: El concepto de "verificación WhatsApp delegada vía WAM" queda definido, cerrado y registrable como documento canónico en Git.

---

## 16. Estado del Documento

### 16.1. Canonicidad

Este documento es **canónico y normativo**. Define la única versión válida de la verificación WhatsApp para la FASE 1.3.

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
- Debe ser respetado por toda implementación de la verificación WhatsApp
- No especifica código ejecutable ni detalles de implementación
- No modifica ni referencia código de Elixir Core (que es sellado e inmodificable)
- No redefine WAM (que existe y funciona como transporte delegado)

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación canónica y normativa - FASE 1.3 CERRADA  
**Aprobación**: Pendiente de aprobación formal  
**Fecha**: 2025


# Arquitectura Mínima del Canal WhatsApp Enmascarado (WAM)

## 1. Propósito del Documento

Este documento define la arquitectura mínima viable del Canal WhatsApp Enmascarado (WAM) como componente desacoplado, auditable y sustituible dentro de Elixir Platform. El WAM es una puerta de salida controlada que ejecuta handoffs autorizados sin participar en decisiones, explicaciones ni aprendizaje.

## 2. Contexto Inviolable

- **Elixir Core v1.0 está SELLADO e INMODIFICABLE**
- El Core decide únicamente ALLOW o DENY
- El Core no expone razones, metadata ni scores
- El WAM no decide, no explica y no aprende
- El WAM es ejecutor puro de handoffs autorizados

## 3. Componentes Lógicos del Canal

### 3.1. Resolver de Handoff

**Rol**: Valida y resuelve tokens de handoff recibidos desde el Chat.

**Responsabilidades**:
- Recibir solicitudes de resolución de handoff
- Validar presencia y formato del handoff_id
- Consultar estado del handoff en almacenamiento temporal
- Verificar TTL y estado del token
- Ejecutar transición de estado (CREATED → REDEEMED)
- Registrar evento de resolución para auditoría

**No hace**:
- No genera handoffs (eso es responsabilidad del Chat)
- No autoriza acceso (eso es responsabilidad del Core)
- No almacena contenido de conversación
- No expone números personales

### 3.2. Almacenamiento Temporal

**Rol**: Mantiene estado transitorio de handoffs durante su ciclo de vida.

**Responsabilidades**:
- Almacenar handoffs con estructura mínima: `{ handoff_id, session_id, user_ref, model_ref, status, created_at, expires_at }`
- Invalidar handoffs expirados automáticamente
- Bloquear reutilización de handoffs ya consumidos
- Permitir revocación explícita de handoffs activos

**No hace**:
- No persiste handoffs más allá de su TTL
- No almacena mensajes, texto, multimedia ni datos personales
- No mantiene historial de conversaciones
- No expone información sensible

### 3.3. Adaptador de Proveedor WhatsApp

**Rol**: Traduce acciones del sistema a llamadas al proveedor de WhatsApp (Twilio, Meta, etc.).

**Responsabilidades**:
- Recibir instrucción de habilitar conexión tras handoff válido
- Generar enlace o acción específica del proveedor
- Ejecutar acción final que conecta usuario con modelo en WhatsApp
- Registrar evento de ejecución para auditoría

**No hace**:
- No decide si ejecutar (eso ya fue decidido por el Core)
- No valida handoff (eso es responsabilidad del Resolver)
- No almacena respuestas del proveedor
- No intermedia conversación posterior

### 3.4. Registro de Auditoría

**Rol**: Captura eventos del canal sin almacenar contenido.

**Responsabilidades**:
- Registrar creación de handoff (handoff_id, session_id, timestamps)
- Registrar resolución de handoff (handoff_id, estado, timestamp)
- Registrar expiración de handoff (handoff_id, causa, timestamp)
- Registrar revocación de handoff (handoff_id, causa, timestamp)
- Registrar ejecución de conexión (handoff_id, timestamp)

**No hace**:
- No almacena mensajes ni contenido de conversación
- No almacena datos personales más allá de referencias abstractas
- No expone información sensible en logs
- No realiza análisis de contenido

## 4. Flujo de Mensajes Paso a Paso

### 4.1. Flujo Canónico de Handoff

**Paso 1: Recepción de Solicitud de Handoff**
- El Chat solicita handoff al WAM con: `{ session_id, user_ref, model_ref }`
- El WAM recibe la solicitud y la valida localmente (campos requeridos presentes)

**Paso 2: Consulta al Core (desde el Chat)**
- El Chat consulta al Core con contexto mínimo
- El Core responde ALLOW o DENY
- Si DENY: el Chat no genera handoff, el flujo termina

**Paso 3: Generación de Handoff (desde el Chat)**
- Si ALLOW: el Chat genera handoff_id único
- El Chat crea registro en Almacenamiento Temporal del WAM
- El Chat retorna handoff_url al usuario

**Paso 4: Resolución de Handoff**
- Usuario accede a handoff_url
- Resolver de Handoff recibe solicitud con handoff_id
- Resolver consulta Almacenamiento Temporal
- Resolver valida: existencia, TTL válido, estado CREATED
- Si válido: Resolver marca handoff como REDEEMED
- Si inválido: Resolver retorna mensaje genérico de error

**Paso 5: Ejecución de Conexión**
- Tras resolución válida, Adaptador de Proveedor recibe instrucción
- Adaptador genera acción específica del proveedor (enlace, API call, etc.)
- Adaptador ejecuta conexión usuario-modelo en WhatsApp
- Adaptador registra evento de ejecución

**Paso 6: Finalización**
- Usuario queda conectado en WhatsApp fuera del control de Elixir
- WAM no interviene en conversación posterior
- Handoff queda marcado como REDEEMED y no es reutilizable

### 4.2. Flujos de Error

**Handoff No Encontrado**:
- Resolver retorna mensaje genérico: "Enlace inválido"
- No expone información sobre causa específica
- Registra evento de error para auditoría

**Handoff Expirado**:
- Resolver detecta TTL vencido
- Marca handoff como EXPIRED
- Retorna mensaje genérico: "Este enlace ha expirado. Por favor, inicia nuevamente"
- Registra evento de expiración

**Handoff Ya Utilizado**:
- Resolver detecta estado REDEEMED
- Retorna mensaje genérico: "Este enlace ya ha sido utilizado"
- No permite reutilización
- Registra intento de reutilización

**Error del Proveedor WhatsApp**:
- Adaptador detecta fallo en llamada al proveedor
- Registra evento de error con handoff_id
- Retorna mensaje genérico al usuario
- No expone detalles técnicos del proveedor

## 5. Responsabilidades de Cada Componente

### 5.1. Resolver de Handoff

**Hace**:
- Valida formato de handoff_id
- Consulta estado en Almacenamiento Temporal
- Verifica condiciones de uso (TTL, estado)
- Transiciona estados (CREATED → REDEEMED)
- Registra eventos de resolución

**No hace**:
- No genera handoffs
- No autoriza acceso
- No almacena contenido
- No expone información sensible

### 5.2. Almacenamiento Temporal

**Hace**:
- Almacena estructura mínima de handoff
- Aplica TTL automáticamente
- Bloquea reutilización
- Permite consulta por handoff_id

**No hace**:
- No persiste más allá de TTL
- No almacena contenido de conversación
- No expone datos personales
- No mantiene historial

### 5.3. Adaptador de Proveedor WhatsApp

**Hace**:
- Traduce instrucciones a acciones del proveedor
- Ejecuta conexión usuario-modelo
- Registra eventos de ejecución
- Maneja errores del proveedor

**No hace**:
- No decide si ejecutar
- No valida handoff
- No almacena respuestas
- No intermedia conversación

### 5.4. Registro de Auditoría

**Hace**:
- Captura eventos del ciclo de vida del handoff
- Almacena referencias abstractas (handoff_id, session_id)
- Registra timestamps y estados
- Permite consulta para auditoría

**No hace**:
- No almacena contenido de mensajes
- No almacena datos personales
- No expone información sensible
- No realiza análisis

## 6. Límites Claros: Qué Hace y Qué No Hace el WAM

### 6.1. Qué Hace el WAM

✅ **Ejecuta handoffs autorizados**: El WAM recibe handoffs ya autorizados por el Core y los ejecuta.

✅ **Valida condiciones de uso**: El WAM verifica TTL, estado y condiciones antes de ejecutar.

✅ **Registra eventos**: El WAM captura eventos del ciclo de vida para auditoría.

✅ **Mantiene estado transitorio**: El WAM almacena handoffs solo durante su TTL.

✅ **Traduce a proveedor**: El WAM adapta instrucciones a la API del proveedor de WhatsApp.

### 6.2. Qué NO Hace el WAM

❌ **NO decide**: El WAM no toma decisiones de autorización. Solo ejecuta handoffs ya autorizados.

❌ **NO explica**: El WAM no expone razones de denegación ni estados internos del Core.

❌ **NO aprende**: El WAM no modifica comportamiento basado en patrones o historial.

❌ **NO almacena conversaciones**: El WAM no guarda mensajes, texto, multimedia ni contenido de conversación.

❌ **NO expone números**: El WAM nunca expone números personales de usuarios o modelos.

❌ **NO intermedia**: El WAM no participa en la conversación posterior al handoff.

❌ **NO genera handoffs**: El WAM no crea handoffs. Solo los resuelve y ejecuta.

❌ **NO valida saldo**: El WAM no consulta ni valida capacidad económica del usuario.

❌ **NO modifica Core**: El WAM no introduce cambios ni dependencias en Elixir Core.

## 7. Puntos de Falla Esperados

### 7.1. Falla en Resolución de Handoff

**Escenario**: El Resolver no puede acceder al Almacenamiento Temporal.

**Comportamiento Esperado**:
- El Resolver trata la falla como handoff inválido
- Retorna mensaje genérico de error
- Registra evento de falla para auditoría
- No expone detalles técnicos al usuario

**Impacto**: El usuario no puede completar el handoff. Debe reiniciar desde el Catálogo o Chat.

### 7.2. Falla en Ejecución de Conexión

**Escenario**: El Adaptador de Proveedor falla al ejecutar la conexión con WhatsApp.

**Comportamiento Esperado**:
- El Adaptador registra evento de error
- Retorna mensaje genérico al usuario
- El handoff queda marcado como REDEEMED (no reutilizable)
- No expone detalles del proveedor

**Impacto**: El usuario no puede conectarse. Debe solicitar nuevo handoff desde el Chat.

### 7.3. Pérdida de Estado Transitorio

**Escenario**: El Almacenamiento Temporal pierde datos (reinicio, falla de memoria).

**Comportamiento Esperado**:
- Handoffs activos se pierden
- Resoluciones futuras fallan con "handoff no encontrado"
- Sistema continúa operando sin estado previo
- No hay recuperación automática

**Impacto**: Handoffs activos quedan inválidos. Usuarios deben solicitar nuevos handoffs.

### 7.4. Falla del Proveedor WhatsApp

**Escenario**: El proveedor de WhatsApp (Twilio, Meta, etc.) no responde o rechaza la solicitud.

**Comportamiento Esperado**:
- El Adaptador detecta falla
- Registra evento de error
- Retorna mensaje genérico
- No reintenta automáticamente

**Impacto**: Conexión no se establece. Usuario debe reintentar desde el Chat.

### 7.5. Intento de Reutilización

**Escenario**: Usuario intenta usar handoff ya consumido.

**Comportamiento Esperado**:
- El Resolver detecta estado REDEEMED
- Rechaza inmediatamente
- Retorna mensaje genérico
- Registra intento de reutilización

**Impacto**: Usuario no puede reutilizar enlace. Debe solicitar nuevo handoff.

## 8. Invariantes que Deben Preservarse

### 8.1. Invariante de Autorización

**Enunciado**: El WAM nunca ejecuta handoff sin autorización previa del Core.

**Preservación**:
- El WAM solo recibe handoffs ya autorizados por el Core
- El WAM no consulta al Core directamente
- El WAM confía en que el Chat solo genera handoffs tras ALLOW del Core

**Violación**: Si el WAM ejecuta handoff sin autorización, el sistema pierde control transaccional.

### 8.2. Invariante de Uso Único

**Enunciado**: Cada handoff se consume exactamente una vez.

**Preservación**:
- El Resolver marca handoff como REDEEMED inmediatamente tras primera resolución válida
- El Resolver rechaza resolución de handoffs ya REDEEMED
- El Almacenamiento Temporal no permite transición REDEEMED → CREATED

**Violación**: Si un handoff se reutiliza, se compromete el control de acceso temporal.

### 8.3. Invariante de TTL

**Enunciado**: Handoffs expiran después de TTL definido (~5 minutos).

**Preservación**:
- El Almacenamiento Temporal marca handoffs como EXPIRED tras TTL
- El Resolver rechaza handoffs expirados
- No hay extensión automática de TTL

**Violación**: Si TTL se extiende o ignora, se compromete el control temporal.

### 8.4. Invariante de No Exposición

**Enunciado**: El WAM nunca expone números personales ni información sensible.

**Preservación**:
- El Adaptador de Proveedor usa referencias abstractas (user_ref, model_ref)
- El WAM no almacena ni transmite números telefónicos
- El WAM no expone información del Core en mensajes de error

**Violación**: Si se exponen números o información sensible, se compromete la privacidad.

### 8.5. Invariante de No Almacenamiento de Contenido

**Enunciado**: El WAM nunca almacena mensajes, texto, multimedia ni contenido de conversación.

**Preservación**:
- El Registro de Auditoría solo captura eventos y referencias abstractas
- El Almacenamiento Temporal solo mantiene estructura de handoff
- El WAM no intercepta ni almacena comunicación posterior al handoff

**Violación**: Si se almacena contenido, se viola el principio de que Elixir intermedia valor, no relaciones.

### 8.6. Invariante de Separación de Capas

**Enunciado**: El WAM no introduce dependencias ni modificaciones en Elixir Core.

**Preservación**:
- El WAM no consulta al Core directamente
- El WAM no modifica código del Core
- El WAM opera como consumidor pasivo de handoffs autorizados

**Violación**: Si el WAM depende del Core o lo modifica, se rompe la separación de capas.

### 8.7. Invariante de Fail-Closed

**Enunciado**: Cualquier falla en el WAM resulta en rechazo de handoff, no en acceso no autorizado.

**Preservación**:
- Fallas en Resolver resultan en rechazo
- Fallas en Adaptador resultan en rechazo
- Fallas en Almacenamiento Temporal resultan en rechazo
- No hay fallback permisivo

**Violación**: Si fallas resultan en acceso no autorizado, se compromete la seguridad.

## 9. Componentes Intercambiables

### 9.1. Sustitución del Canal

El WAM está diseñado para ser sustituible por otros canales (Chat directo, API REST, etc.) sin modificar capas internas.

**Interfaz Común Requerida**:
- Recepción de handoff autorizado
- Resolución de handoff con validación
- Ejecución de conexión usuario-modelo
- Registro de eventos para auditoría

**Contrato de Sustitución**:
- Nuevo canal debe implementar Resolver de Handoff
- Nuevo canal debe usar mismo Almacenamiento Temporal o equivalente
- Nuevo canal debe registrar eventos en mismo formato
- Nuevo canal no debe modificar Core ni Chat

### 9.2. Sustitución del Proveedor WhatsApp

El Adaptador de Proveedor puede reemplazarse para usar diferentes proveedores (Twilio, Meta, etc.) sin modificar otros componentes.

**Interfaz del Adaptador**:
- Recibe: `{ handoff_id, user_ref, model_ref }`
- Ejecuta: Conexión usuario-modelo en proveedor
- Retorna: Resultado de ejecución (éxito/fallo)
- Registra: Evento de ejecución

**Sustitución**:
- Nuevo adaptador implementa misma interfaz
- Nuevo adaptador traduce a API específica del proveedor
- Nuevo adaptador mantiene mismo comportamiento de error
- No requiere cambios en Resolver ni Almacenamiento

### 9.3. Sustitución del Almacenamiento Temporal

El Almacenamiento Temporal puede implementarse con diferentes tecnologías (memoria, Redis, base de datos) sin afectar otros componentes.

**Interfaz del Almacenamiento**:
- `create(handoff)`: Crea handoff con TTL
- `get(handoff_id)`: Consulta handoff por ID
- `update(handoff_id, status)`: Actualiza estado
- `expire(handoff_id)`: Marca como expirado

**Sustitución**:
- Nueva implementación mantiene misma interfaz
- Nueva implementación respeta TTL y estados
- Nueva implementación no persiste más allá de TTL
- No requiere cambios en Resolver ni Adaptador

## 10. Riesgos Abiertos

### 10.1. Riesgo: Pérdida de Handoffs Activos

**Descripción**: Si el Almacenamiento Temporal falla, handoffs activos se pierden y usuarios no pueden completar conexión.

**Mitigación Parcial**: TTL corto (~5 minutos) limita ventana de pérdida. Usuarios pueden solicitar nuevo handoff.

**Riesgo Residual**: Usuarios con handoffs activos pierden acceso temporal. No hay recuperación automática.

### 10.2. Riesgo: Falla Silenciosa del Proveedor

**Descripción**: Si el proveedor de WhatsApp falla sin notificación clara, el WAM puede no detectar el error.

**Mitigación Parcial**: El Adaptador registra eventos de ejecución. Timeouts en llamadas al proveedor.

**Riesgo Residual**: Usuario puede quedar sin conexión sin notificación clara del sistema.

### 10.3. Riesgo: Bypass del WAM

**Descripción**: Si un atacante obtiene handoff_id válido, puede intentar reutilizarlo o acceder directamente.

**Mitigación Parcial**: Uso único y TTL corto limitan ventana de ataque. Validación estricta en Resolver.

**Riesgo Residual**: Handoff_id comprometido puede usarse una vez antes de expiración.

### 10.4. Riesgo: Dependencia del Chat

**Descripción**: El WAM depende de que el Chat solo genere handoffs tras autorización del Core. Si el Chat falla en esta validación, el WAM ejecuta handoff no autorizado.

**Mitigación Parcial**: El Chat tiene responsabilidad explícita de consultar Core. Contrato formal entre Chat y WAM.

**Riesgo Residual**: Falla en Chat puede resultar en handoff no autorizado ejecutado por WAM.

### 10.5. Riesgo: Escalabilidad del Almacenamiento Temporal

**Descripción**: Si el volumen de handoffs crece, el Almacenamiento Temporal puede saturarse o degradarse.

**Mitigación Parcial**: TTL corto limita acumulación. Handoffs expirados se eliminan automáticamente.

**Riesgo Residual**: Picos de tráfico pueden saturar almacenamiento y causar rechazo de handoffs válidos.

## 11. Confirmación de Estado del Sistema

### 11.1. El Core No Aparece como Dependiente

✅ **Confirmado**: El WAM no consulta al Core directamente. El WAM recibe handoffs ya autorizados por el Core a través del Chat. El Core no tiene dependencias del WAM.

### 11.2. Separación Estricta de Capas

✅ **Confirmado**: El WAM opera como capa independiente. No modifica Core, no modifica Chat. Solo ejecuta handoffs autorizados.

### 11.3. Sustituibilidad del Canal

✅ **Confirmado**: El WAM puede sustituirse por otros canales (Chat directo, API) sin modificar capas internas. La interfaz común está definida.

### 11.4. Auditoría Sin Contenido

✅ **Confirmado**: El WAM registra eventos sin almacenar contenido de conversación. Solo captura referencias abstractas y timestamps.

### 11.5. Estado GO CONTROLADO

✅ **Confirmado**: El sistema mantiene estado GO CONTROLADO. El WAM es ejecutor puro sin lógica decisional. Todas las decisiones provienen del Core a través del Chat.

## 12. Frase Canónica del WAM

El WAM ejecuta handoffs autorizados. No decide, no explica, no aprende. Conecta una vez y desaparece.

---

**Versión del Documento**: 1.0  
**Fecha**: 2024  
**Estado**: Arquitectura Mínima Viable Definida  
**Próximos Pasos**: Implementación según esta arquitectura


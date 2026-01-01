# Fase B: Preparación de Implementación Técnica Real del WAM
## Estado: GO CONTROLADO

## 1. Propósito del Documento

Este documento prepara la **implementación técnica real** del Canal WhatsApp Enmascarado (WAM) dejando todas las decisiones técnicas necesarias listas para que la fase de coding sea mecánica, controlada y sin ambigüedades.

**PRINCIPIO RECTOR**: Este documento NO contiene código productivo. Define exclusivamente decisiones técnicas, contratos internos, límites explícitos, riesgos de implementación y plan de arranque para la fase de coding.

**ESTADO ACTUAL**: GO CONTROLADO — Preparación técnica para implementación controlada con usuarios limitados y volumen bajo.

**CONTEXTO INVIOLABLE**:
- Elixir Core v1.0 está SELLADO e INMODIFICABLE
- El Core decide únicamente ALLOW o DENY y no expone razones ni metadata
- El WAM no decide, no explica y no aprende
- El WAM es ejecutor puro de handoffs autorizados
- Todo está versionado en Git
- Estado global del sistema: GO CONTROLADO

---

## 2. Decisiones Técnicas por Categoría

### 2.1. Tipo de Runtime y Justificación

**DECISIÓN**: Runtime tipo **service** (servicio HTTP/HTTPS) con procesamiento request-driven síncrono.

**JUSTIFICACIÓN**:
- El WAM procesa solicitudes HTTP de resolución de handoff de forma síncrona
- No requiere procesamiento distribuido ni escalado automático en GO CONTROLADO
- Volumen bajo (< 100 handoffs/hora) permite procesamiento secuencial sin degradación
- Modelo request-driven es suficiente: cada solicitud es independiente, sin estado compartido
- Capacidad de reinicio controlado sin pérdida de estado crítico (handoffs activos se pierden, comportamiento esperado)

**NO es**:
- Runtime tipo edge (no requiere procesamiento en borde geográfico)
- Runtime tipo worker (no requiere procesamiento asíncrono en cola)
- Runtime tipo serverless (no requiere escalado automático por evento)

**REQUISITOS TÉCNICOS**:
- Procesamiento de solicitudes HTTP/HTTPS
- Manejo de timeouts configurables
- Capacidad de reinicio controlado
- Aislamiento de procesos
- Sin estado persistente entre solicitudes

**ASUNCIÓN OPERATIVA**: Volumen bajo, usuarios limitados, operación controlada. Si volumen crece, se activa kill-switch antes de requerir escalado.

### 2.2. Lenguaje(s) de Implementación Posibles

**CRITERIOS DE SELECCIÓN** (no elección cerrada):

1. **Criterio de Simplicidad**:
   - Lenguaje debe permitir implementación directa de contratos sin abstracciones complejas
   - Debe facilitar validación y testing de invariantes (TTL, uso único, atomicidad)
   - Debe permitir manejo explícito de timeouts y errores

2. **Criterio de Sustituibilidad**:
   - Lenguaje no debe introducir dependencias permanentes
   - Debe permitir reemplazo de componentes (almacenamiento, proveedor) sin reescribir lógica core
   - Debe facilitar testing con mocks y stubs

3. **Criterio de Observabilidad**:
   - Lenguaje debe permitir registro estructurado de eventos sin información sensible
   - Debe facilitar métricas agregadas sin exponer detalles internos
   - Debe permitir logging sin comprometer opacidad del sistema

4. **Criterio de Fail-Closed**:
   - Lenguaje debe permitir manejo explícito de errores con fall-closed garantizado
   - Debe facilitar validación estricta de inputs y estados
   - Debe permitir timeouts y cancelación de operaciones

5. **Criterio de Operación Controlada**:
   - Lenguaje debe permitir despliegue simple sin orquestación compleja
   - Debe facilitar activación/desactivación de kill-switch
   - Debe permitir configuración sin recompilación

**LENGUAJES CANDIDATOS** (ejemplos, no elección final):
- Lenguajes con tipado estático fuerte (TypeScript, Go, Rust) para validación de contratos
- Lenguajes con manejo explícito de errores (Go, Rust) para fail-closed
- Lenguajes con ecosistema HTTP maduro (Node.js/TypeScript, Go, Python) para servicio HTTP
- Lenguajes con testing robusto (cualquier lenguaje moderno con frameworks maduros)

**DECISIÓN PENDIENTE**: La elección específica del lenguaje se realiza en fase de implementación técnica considerando estos criterios y contexto operativo.

### 2.3. Modelo de Ejecución

**DECISIÓN**: Modelo de ejecución **síncrono request-driven** con procesamiento por solicitud HTTP.

**CARACTERÍSTICAS**:
- Cada solicitud HTTP se procesa de forma síncrona e independiente
- Sin estado compartido entre solicitudes
- Sin sesiones persistentes
- Sin cache de decisiones o resultados
- Procesamiento secuencial por solicitud (sin paralelismo explícito requerido en GO CONTROLADO)

**FLUJO REQUEST-DRIVEN**:
1. Solicitud HTTP llega al runtime
2. Runtime procesa solicitud de forma síncrona
3. Runtime consulta almacenamiento temporal (si aplica)
4. Runtime ejecuta acción (resolver handoff, ejecutar proveedor)
5. Runtime retorna respuesta HTTP
6. Runtime finaliza procesamiento de solicitud

**SIN PROCESAMIENTO ASÍNCRONO**:
- No requiere colas de mensajes
- No requiere workers asíncronos
- No requiere procesamiento distribuido
- No requiere sincronización entre solicitudes concurrentes

**JUSTIFICACIÓN**: Modelo request-driven es suficiente para GO CONTROLADO. Volumen bajo permite procesamiento secuencial sin degradación de rendimiento.

### 2.4. Estrategia de Empaquetado y Despliegue (Abstracta)

**MODELO DE EMPAQUETADO**:
- Aplicación se empaqueta como artefacto autocontenido (binario, contenedor, paquete)
- Artefacto incluye runtime y dependencias mínimas
- Artefacto no incluye secretos ni configuración sensible
- Artefacto es versionado y trazable

**MODELO DE DESPLIEGUE**:
- Despliegue en ambiente aislado (DEV, GO-CONTROLLED)
- Configuración externa (secretos, endpoints) se inyecta en runtime
- Despliegue permite rollback a versión anterior estable
- Despliegue no requiere orquestación compleja en GO CONTROLADO

**NO REQUIERE**:
- Escalado automático
- Balanceo de carga avanzado
- Orquestación compleja (Kubernetes, etc.)
- Múltiples instancias en paralelo

**ASUNCIÓN OPERATIVA**: Despliegue simple es suficiente. Un solo proceso/servicio puede manejar volumen bajo de GO CONTROLADO.

---

## 3. Clases de Tecnología Permitidas

### 3.1. Mensajería (Webhooks / APIs / Gateways)

**CLASES PERMITIDAS**:

1. **APIs REST/HTTP**:
   - Cliente HTTP para comunicación con proveedor de WhatsApp
   - Soporte para autenticación (API keys, tokens)
   - Soporte para timeouts configurables
   - Manejo de errores HTTP (4xx, 5xx)

2. **Webhooks (Recepción)**:
   - Receptor HTTP para webhooks del proveedor (si aplica en fase posterior)
   - Validación de firma/autenticación de webhooks
   - Procesamiento síncrono de webhooks recibidos

3. **Gateways Abstractos**:
   - Adaptador abstracto que traduce acciones del sistema a llamadas del proveedor
   - Interfaz común independiente del proveedor específico
   - Implementación concreta intercambiable

**NO PERMITE**:
- Persistencia de respuestas del proveedor
- Intermediación de conversación posterior
- Manejo de webhooks del proveedor en GO CONTROLADO (no requerido)

**CRITERIOS DE SELECCIÓN**:
- Cliente HTTP debe soportar timeouts configurables (mínimo 10 segundos para proveedor)
- Cliente HTTP debe permitir cancelación de solicitudes
- Cliente HTTP debe manejar errores sin exponer detalles técnicos
- Autenticación debe ser inyectable (no hardcodeada)

### 3.2. Almacenamiento Temporal (KV / In-Memory / Ephemeral Store)

**CLASES PERMITIDAS**:

1. **Almacenamiento en Memoria**:
   - Estructura de datos en memoria (mapa, diccionario)
   - TTL implementado mediante limpieza periódica
   - Atomicidad mediante locks o estructuras thread-safe
   - Pérdida de datos en reinicio (comportamiento esperado)

2. **Almacenamiento Key-Value Ephemeral**:
   - Base de datos KV con TTL nativo (Redis, Memcached, etc.)
   - Operaciones atómicas (GET, SET, EXPIRE)
   - Limpieza automática de registros expirados
   - Sin persistencia duradera

3. **Almacenamiento en Archivo Temporal**:
   - Archivo temporal con estructura serializada
   - TTL implementado mediante limpieza periódica
   - Atomicidad mediante locks de archivo
   - Eliminación automática tras TTL

**REQUISITOS OBLIGATORIOS**:
- Soporte para TTL automático (expiración de registros)
- Operaciones atómicas: crear, consultar, actualizar estado
- Transición CREATED → REDEEMED debe ser atómica
- Invalidación automática de handoffs expirados
- Limpieza periódica de registros expirados (cada 1 minuto)

**NO PERMITE**:
- Persistencia más allá de TTL
- Replicación de datos
- Backup de handoffs
- Recuperación de estado tras pérdida

**CRITERIOS DE SELECCIÓN**:
- Tecnología debe garantizar atomicidad de transiciones de estado
- Tecnología debe soportar TTL nativo o permitir implementación de TTL
- Tecnología debe permitir consulta rápida por handoff_id
- Tecnología no debe requerir infraestructura compleja en GO CONTROLADO

**DECISIÓN PENDIENTE**: La elección específica (memoria, Redis, archivo) se realiza en fase de implementación técnica considerando simplicidad operativa y garantías de atomicidad.

### 3.3. Observabilidad (Metrics / Logs / Alerts)

**CLASES PERMITIDAS**:

1. **Logs Estructurados**:
   - Logging estructurado (JSON, formato estructurado)
   - Niveles de log (INFO, ERROR, WARN)
   - Eventos del ciclo de vida de handoffs
   - Sin información sensible (no contenido, no PII, no números telefónicos)

2. **Métricas Agregadas**:
   - Contadores de eventos (handoffs creados, resueltos, expirados)
   - Timestamps agregados (tiempo promedio de resolución)
   - Tasas agregadas (tasa de éxito, tasa de error)
   - Agregación por períodos (hora, día)

3. **Alertas Mínimas**:
   - Alertas por fallas críticas (almacenamiento no disponible, proveedor no responde)
   - Alertas por umbrales excedidos (tasa de error > 10%, tasa de resolución fallida > 5%)
   - Alertas por activación de kill-switch
   - Formato: tipo, timestamp, componente afectado, métrica

**NO PERMITE**:
- Contenido de mensajes en logs
- Números telefónicos en logs
- Datos personales en logs
- Razones de decisiones del Core
- Estados internos del Core
- Desagregación por usuario individual
- Desagregación por modelo individual

**CRITERIOS DE SELECCIÓN**:
- Sistema de logging debe permitir estructuración sin información sensible
- Sistema de métricas debe permitir agregación sin desagregación individual
- Sistema de alertas debe permitir configuración de umbrales
- Sistema no debe requerir infraestructura compleja en GO CONTROLADO (email, logs estructurados son suficientes)

**DECISIÓN PENDIENTE**: La elección específica (stdout + agregación externa, sistema de métricas dedicado) se realiza en fase de implementación técnica considerando simplicidad operativa.

### 3.4. Gestión de Secretos

**CLASES PERMITIDAS**:

1. **Variables de Entorno**:
   - Secretos inyectados como variables de entorno
   - No almacenados en código ni repositorio
   - Rotación manual mediante actualización de configuración

2. **Sistema de Secretos Externo**:
   - Integración con sistema de secretos (Vault, AWS Secrets Manager, etc.)
   - Carga de secretos en runtime
   - Rotación mediante sistema externo

3. **Archivo de Configuración Protegido**:
   - Archivo de configuración fuera del repositorio
   - Permisos restrictivos (solo proceso WAM puede leer)
   - Rotación manual mediante actualización de archivo

**REQUISITOS OBLIGATORIOS**:
- Secretos no almacenados en código
- Secretos no almacenados en repositorio
- Secretos inyectables en runtime
- Rotación sin recompilación

**SECRETOS QUE REQUIEREN GESTIÓN**:
- Credenciales del proveedor de WhatsApp (API keys, tokens)
- Credenciales de acceso a almacenamiento temporal (si aplica)
- Certificados TLS/SSL para ingress

**CRITERIOS DE SELECCIÓN**:
- Sistema debe permitir inyección de secretos sin hardcodeo
- Sistema debe permitir rotación sin recompilación
- Sistema no debe requerir infraestructura compleja en GO CONTROLADO (variables de entorno son suficientes)

**DECISIÓN PENDIENTE**: La elección específica (variables de entorno, sistema externo) se realiza en fase de implementación técnica considerando simplicidad operativa y requisitos de seguridad.

### 3.5. Kill-Switch (Config Central / Feature Flag Manual)

**CLASES PERMITIDAS**:

1. **Configuración Central**:
   - Archivo de configuración central (JSON, YAML, etc.)
   - Estado de kill-switch (activo/inactivo) en configuración
   - Actualización de configuración activa kill-switch sin reinicio (hot-reload)
   - Lectura periódica de configuración (polling cada N segundos)

2. **Feature Flag Manual**:
   - Sistema de feature flags (API, base de datos, archivo)
   - Activación/desactivación mediante API protegida
   - Estado persistido en almacenamiento externo
   - Consulta de estado en cada solicitud

3. **Variable de Entorno**:
   - Variable de entorno que controla estado de kill-switch
   - Activación mediante actualización de variable y reinicio
   - Estado leído en inicio de aplicación

**MODOS DE OPERACIÓN**:
- **Modo DROP**: Todas las solicitudes se rechazan inmediatamente sin procesamiento
- **Modo SILENCIO**: Solicitudes se procesan pero no se ejecuta proveedor (handoffs se marcan como REDEEMED pero no hay conexión)

**REQUISITOS OBLIGATORIOS**:
- Activación manual inmediata
- Rechazo de todas las solicitudes nuevas (modo DROP)
- Registro de activación/desactivación
- Sin exposición de razón de detención

**CRITERIOS DE SELECCIÓN**:
- Mecanismo debe permitir activación inmediata sin reinicio (preferido) o con reinicio mínimo
- Mecanismo debe permitir desactivación igual de rápida
- Mecanismo debe ser control humano, no automático
- Mecanismo no debe requerir infraestructura compleja en GO CONTROLADO

**DECISIÓN PENDIENTE**: La elección específica (archivo de configuración, API, variable de entorno) se realiza en fase de implementación técnica considerando simplicidad operativa y requisitos de activación inmediata.

---

## 4. Contratos Técnicos Internos

### 4.1. Contrato del Handoff Resolver

**RESPONSABILIDAD**: Valida y resuelve tokens de handoff recibidos desde usuarios.

**INPUTS**:
- `handoff_id`: string (UUID v4 o equivalente, requerido)
- Request HTTP: `GET /resolve/{handoff_id}`

**OUTPUTS**:
- **Éxito**: Respuesta HTTP 200 con mensaje genérico de éxito (ej: "Redirigiendo a WhatsApp...")
- **Error**: Respuesta HTTP con mensaje genérico de error según caso:
  - Handoff no encontrado: "Enlace inválido"
  - Handoff expirado: "Este enlace ha expirado. Por favor, inicia nuevamente"
  - Handoff ya utilizado: "Este enlace ya ha sido utilizado"
  - Error interno: "No se pudo completar la conexión. Por favor, intenta nuevamente."

**OPERACIONES INTERNAS**:
1. Validar formato de `handoff_id` (UUID v4 o equivalente)
2. Consultar Almacenamiento Temporal con `handoff_id` (timeout: 2 segundos)
3. Verificar existencia de handoff
4. Verificar `status == CREATED`
5. Verificar `expires_at > now()`
6. Transición atómica: `CREATED → REDEEMED`
7. Invocar Sender con `{ handoff_id, user_ref, model_ref }`
8. Registrar evento `handoff_redeemed` o `handoff_resolution_failed`

**ERRORES ESPERADOS**:
- `handoff_not_found`: Handoff no existe en almacenamiento
- `handoff_expired`: Handoff tiene `expires_at <= now()`
- `handoff_already_redeemed`: Handoff tiene `status == REDEEMED`
- `storage_timeout`: Consulta a almacenamiento excede timeout (2 segundos)
- `storage_error`: Error al consultar almacenamiento (no disponible, error de conexión)
- `invalid_handoff_id`: Formato de `handoff_id` inválido

**COMPORTAMIENTO DE ERROR**:
- Todos los errores retornan mensaje genérico (no exponen causa específica)
- Todos los errores se registran en logs para auditoría
- Errores no exponen información sobre estado interno del sistema
- Errores no permiten reintentos automáticos

**TIMEOUTS**:
- Consulta a Almacenamiento Temporal: 2 segundos
- Procesamiento total de resolución: 15 segundos

**INVARIANTS**:
- Transición `CREATED → REDEEMED` es atómica (no hay condición de carrera)
- Handoffs `REDEEMED` no pueden resolverse nuevamente
- Handoffs expirados no pueden resolverse
- Mensajes de error son genéricos e invariantes

### 4.2. Contrato del Almacenamiento Temporal

**RESPONSABILIDAD**: Mantiene estado transitorio de handoffs durante su ciclo de vida.

**OPERACIONES REQUERIDAS**:

1. **`create(handoff)`**:
   - **Input**: `{ handoff_id, session_id, user_ref, model_ref, status: CREATED, created_at, expires_at }`
   - **Output**: `{ success: boolean, error?: string }`
   - **Comportamiento**: Crea handoff con TTL. Si `handoff_id` ya existe, retorna error.
   - **Timeout**: 1 segundo
   - **Atomicidad**: Operación atómica (no hay condición de carrera en creación)

2. **`get(handoff_id)`**:
   - **Input**: `handoff_id: string`
   - **Output**: `{ handoff?: { handoff_id, session_id, user_ref, model_ref, status, created_at, expires_at }, error?: string }`
   - **Comportamiento**: Consulta handoff por ID. Si no existe, retorna `handoff: undefined`.
   - **Timeout**: 2 segundos
   - **Atomicidad**: Lectura atómica (consistencia inmediata)

3. **`update(handoff_id, status)`**:
   - **Input**: `{ handoff_id: string, status: REDEEMED | EXPIRED | REVOKED }`
   - **Output**: `{ success: boolean, error?: string }`
   - **Comportamiento**: Actualiza estado de handoff. Solo permite transiciones válidas:
     - `CREATED → REDEEMED` (atómica)
     - `CREATED → EXPIRED` (automática por TTL)
     - `CREATED → REVOKED` (manual)
     - No permite `REDEEMED → CREATED`
   - **Timeout**: 1 segundo
   - **Atomicidad**: Transición debe ser atómica (no hay condición de carrera)

4. **`expire(handoff_id)`**:
   - **Input**: `handoff_id: string`
   - **Output**: `{ success: boolean, error?: string }`
   - **Comportamiento**: Marca handoff como `EXPIRED`. Solo funciona si `status == CREATED`.
   - **Timeout**: 1 segundo
   - **Atomicidad**: Operación atómica

**ESTRUCTURA DE DATOS**:
```typescript
interface Handoff {
  handoff_id: string;        // UUID v4 o equivalente, único, no predecible
  session_id: string;        // Referencia a sesión del Chat
  user_ref: string;          // Referencia abstracta al usuario (no número telefónico)
  model_ref: string;         // Referencia abstracta al modelo (no número telefónico)
  status: 'CREATED' | 'REDEEMED' | 'EXPIRED' | 'REVOKED';
  created_at: timestamp;      // ISO 8601
  expires_at: timestamp;      // ISO 8601, TTL: ~5 minutos
}
```

**TTL Y LIMPIEZA**:
- TTL estricto: ~5 minutos desde `created_at`
- Limpieza automática de handoffs expirados (cada 1 minuto)
- No hay extensión de TTL
- No hay renovación de handoffs

**ERRORES ESPERADOS**:
- `handoff_not_found`: Handoff no existe
- `invalid_transition`: Transición de estado no permitida (ej: `REDEEMED → CREATED`)
- `storage_unavailable`: Almacenamiento no disponible (falla de conexión, reinicio)
- `timeout`: Operación excede timeout
- `duplicate_handoff_id`: `handoff_id` ya existe en `create()`

**COMPORTAMIENTO DE ERROR**:
- Errores se propagan al componente que invoca (Resolver, Sender)
- Errores no exponen detalles internos del almacenamiento
- Errores se registran en logs para auditoría
- Falla de almacenamiento resulta en rechazo de handoff (fail-closed)

**INVARIANTS**:
- Transición `CREATED → REDEEMED` es atómica (no hay condición de carrera)
- No se permite transición `REDEEMED → CREATED`
- Handoffs expirados se eliminan automáticamente tras TTL
- No hay persistencia más allá de TTL
- Pérdida de almacenamiento resulta en pérdida de handoffs activos (comportamiento esperado)

### 4.3. Contrato del Sender

**RESPONSABILIDAD**: Traduce acciones del sistema a llamadas al proveedor de WhatsApp y ejecuta conexión usuario-modelo.

**INPUTS**:
- `{ handoff_id: string, user_ref: string, model_ref: string }`
- Invocación desde Handoff Resolver tras resolución válida

**OUTPUTS**:
- **Éxito**: `{ success: true, timestamp: ISO8601 }`
- **Error**: `{ success: false, error_type: string, timestamp: ISO8601 }`

**OPERACIONES INTERNAS**:
1. Recibir `{ handoff_id, user_ref, model_ref }`
2. Traducir a acción específica del proveedor (enlace, API call, etc.)
3. Ejecutar conexión usuario-modelo en WhatsApp (timeout: 10 segundos)
4. Registrar evento `provider_execution_success` o `provider_execution_failed`
5. Retornar resultado de ejecución

**ERRORES ESPERADOS**:
- `provider_timeout`: Ejecución excede timeout (10 segundos)
- `provider_error`: Proveedor retorna error (4xx, 5xx, error de conexión)
- `provider_unavailable`: Proveedor no está disponible (no responde)
- `invalid_credentials`: Credenciales del proveedor inválidas
- `invalid_user_ref`: `user_ref` no es válido para el proveedor
- `invalid_model_ref`: `model_ref` no es válido para el proveedor

**COMPORTAMIENTO DE ERROR**:
- Errores se registran en logs para auditoría
- Errores no exponen detalles técnicos del proveedor al usuario
- Errores no permiten reintentos automáticos
- Handoff queda marcado como `REDEEMED` incluso si ejecución falla (no reutilizable)

**TIMEOUTS**:
- Ejecución de proveedor: 10 segundos
- Cancelación de solicitud si timeout excede

**INVARIANTS**:
- Sender no decide si ejecutar (eso ya fue decidido por el Core a través del Chat)
- Sender no valida handoff (eso es responsabilidad del Resolver)
- Sender no almacena respuestas del proveedor
- Sender no intermedia conversación posterior
- Sender es intercambiable (diferentes proveedores implementan misma interfaz)

**OPACIDAD**:
- Sender no expone detalles técnicos del proveedor en errores
- Sender no expone información sobre estado interno del sistema
- Mensajes de error son genéricos e invariantes

### 4.4. Contrato del Kill-Switch

**RESPONSABILIDAD**: Mecanismo de detención inmediata del canal.

**INPUTS**:
- Activación manual: API protegida, archivo de configuración, variable de entorno
- Consulta de estado: Cada solicitud HTTP consulta estado de kill-switch

**OUTPUTS**:
- **Estado**: `{ active: boolean, mode: 'DROP' | 'SILENCIO', activated_at?: ISO8601 }`
- **Activación**: Registro de evento `kill_switch_activated` o `kill_switch_deactivated`

**MODOS DE OPERACIÓN**:

1. **Modo DROP**:
   - Todas las solicitudes se rechazan inmediatamente sin procesamiento
   - Handoffs activos se mantienen (no se invalidan)
   - No se generan nuevos handoffs
   - Respuesta: Error genérico "Servicio temporalmente no disponible"

2. **Modo SILENCIO**:
   - Solicitudes se procesan pero no se ejecuta proveedor
   - Handoffs se marcan como `REDEEMED` pero no hay conexión
   - No se generan nuevos handoffs
   - Respuesta: Mensaje genérico de éxito (usuario no detecta que no hubo conexión)

**OPERACIONES REQUERIDAS**:

1. **`activate(mode: 'DROP' | 'SILENCIO')`**:
   - **Input**: `{ mode: 'DROP' | 'SILENCIO' }`
   - **Output**: `{ success: boolean, error?: string }`
   - **Comportamiento**: Activa kill-switch en modo especificado. Registra evento `kill_switch_activated`.
   - **Timeout**: Inmediato (sin timeout)

2. **`deactivate()`**:
   - **Input**: Ninguno
   - **Output**: `{ success: boolean, error?: string }`
   - **Comportamiento**: Desactiva kill-switch. Registra evento `kill_switch_deactivated`.
   - **Timeout**: Inmediato (sin timeout)

3. **`isActive()`**:
   - **Input**: Ninguno
   - **Output**: `{ active: boolean, mode?: 'DROP' | 'SILENCIO' }`
   - **Comportamiento**: Consulta estado actual de kill-switch.
   - **Timeout**: < 100ms (consulta en memoria)

**ERRORES ESPERADOS**:
- `activation_failed`: No se pudo activar kill-switch (error de configuración, almacenamiento)
- `deactivation_failed`: No se pudo desactivar kill-switch
- `invalid_mode`: Modo especificado no es válido

**COMPORTAMIENTO DE ERROR**:
- Errores se registran en logs para auditoría
- Errores no exponen detalles internos del sistema
- Falla en activación debe resultar en estado seguro (fail-closed: asumir activo si no se puede determinar)

**INVARIANTS**:
- Kill-switch es control humano, no automático
- Activación es inmediata (sin delay)
- Estado de kill-switch se consulta en cada solicitud
- Kill-switch no expone razón de detención
- Kill-switch mantiene capacidad de auditoría (eventos se registran)

**INTEGRACIÓN**:
- Handoff Resolver consulta `isActive()` antes de procesar solicitud
- Si `active == true` y `mode == 'DROP'`: rechaza inmediatamente
- Si `active == true` y `mode == 'SILENCIO'`: procesa pero no ejecuta Sender
- Sender consulta `isActive()` antes de ejecutar (doble verificación)

---

## 5. Límites Técnicos Explícitos

### 5.1. Qué NO se Implementa en Esta Fase

**NO se implementa**:
- Persistencia de handoffs más allá de TTL
- Recuperación automática de estado tras fallas
- Reintentos automáticos de ejecución del proveedor
- Escalado automático de infraestructura
- Balanceo de carga avanzado
- Análisis avanzado de métricas
- Optimización de UX
- Manejo de webhooks del proveedor (no requerido en GO CONTROLADO)
- Intermediación de conversación posterior al handoff
- Notificaciones al usuario sobre estado de handoff
- Historial de handoffs por usuario
- Dashboard de administración
- API de administración avanzada
- Autenticación compleja (handoff_id es suficiente token)
- Procesamiento asíncrono en cola
- Procesamiento distribuido
- Replicación de almacenamiento
- Backup de handoffs
- Recuperación de handoffs perdidos

**RAZÓN**: Implementación mínima para GO CONTROLADO. Funcionalidades adicionales se evalúan en fases posteriores según necesidad operativa y criterios de salida a GO.

### 5.2. Qué Queda Prohibido Incluso si "Funciona"

**PROHIBICIONES ABSOLUTAS**:

1. **NO consultar al Core directamente**:
   - El WAM nunca consulta al Core
   - El WAM solo recibe handoffs ya autorizados por el Core a través del Chat
   - Incluso si es técnicamente posible, está prohibido

2. **NO almacenar contenido**:
   - El WAM nunca almacena mensajes, texto, multimedia ni contenido de conversación
   - Incluso si facilita debugging o análisis, está prohibido

3. **NO exponer información sensible**:
   - El WAM nunca expone números telefónicos, datos personales ni razones de decisiones
   - Incluso si mejora UX o debugging, está prohibido

4. **NO modificar el Core**:
   - El WAM nunca introduce cambios ni dependencias en Elixir Core
   - Incluso si simplifica implementación, está prohibido

5. **NO decidir**:
   - El WAM nunca toma decisiones de autorización
   - Solo ejecuta handoffs ya autorizados
   - Incluso si es más eficiente, está prohibido

6. **NO explicar**:
   - El WAM nunca expone razones de denegación ni estados internos del Core
   - Incluso si ayuda al usuario, está prohibido

7. **NO aprender**:
   - El WAM nunca modifica comportamiento basado en patrones o historial
   - Incluso si mejora rendimiento, está prohibido

8. **NO crear handoffs permanentes**:
   - Todos los handoffs tienen TTL y uso único
   - Incluso si es más conveniente, está prohibido

9. **NO permitir reutilización**:
   - Handoffs son de uso único, sin excepciones
   - Incluso si el usuario lo solicita, está prohibido

10. **NO optimizar UX a costa de seguridad**:
    - La seguridad y control de riesgo priman sobre UX
    - Incluso si mejora conversión, está prohibido

**PRINCIPIO**: Estas prohibiciones son innegociables. Incluso si una funcionalidad "funciona" técnicamente, si viola estas prohibiciones, queda prohibida. La implementación debe rechazar explícitamente cualquier intento de violar estas prohibiciones.

### 5.3. Qué Requeriría Volver a Fase A (Rediseño)

**CONDICIONES QUE REQUIEREN REDISEÑO**:

1. **Cambio en Separación de Capas**:
   - Si se requiere que el WAM consulte al Core directamente
   - Si se requiere que el WAM almacene contenido de conversación
   - Si se requiere que el WAM exponga información sensible
   - **ACCIÓN**: Volver a Fase A (rediseño arquitectónico)

2. **Cambio en Modelo de Handoff**:
   - Si se requiere handoffs permanentes (sin TTL)
   - Si se requiere reutilización de handoffs
   - Si se requiere extensión de TTL
   - **ACCIÓN**: Volver a Fase A (rediseño de contrato de handoff)

3. **Cambio en Modelo de Ejecución**:
   - Si se requiere procesamiento asíncrono en cola
   - Si se requiere procesamiento distribuido
   - Si se requiere escalado automático
   - **ACCIÓN**: Volver a Fase A (rediseño de runtime)

4. **Cambio en Principios Arquitectónicos**:
   - Si se requiere que el WAM decida, explique o aprenda
   - Si se requiere que el WAM modifique el Core
   - Si se requiere degradación arquitectónica para mejorar rendimiento
   - **ACCIÓN**: Volver a Fase A (rediseño de principios)

5. **Cambio en Estado del Sistema**:
   - Si se requiere pasar de GO CONTROLADO a GO sin cumplir criterios de salida
   - Si se requiere relajar invariantes sin justificación arquitectónica
   - **ACCIÓN**: Volver a Fase A (rediseño de criterios de salida)

**PRINCIPIO**: Si la implementación técnica requiere cambios que violan decisiones arquitectónicas documentadas, se debe volver a Fase A (rediseño) en lugar de comprometer principios innegociables.

---

## 6. Riesgos Técnicos de Implementación

### 6.1. Riesgos Conocidos al Pasar de Diseño a Código

**RIESGO 1: Implementación Incorrecta de Atomicidad**

**Descripción**: La transición `CREATED → REDEEMED` puede no ser atómica si la implementación del almacenamiento no garantiza atomicidad (condición de carrera permite múltiples redemptions).

**Señales Tempranas**:
- Tests de concurrencia fallan (múltiples threads resuelven mismo handoff)
- Logs muestran múltiples eventos `handoff_redeemed` para mismo `handoff_id`
- Handoffs `REDEEMED` pueden resolverse nuevamente

**Mitigación**:
- Validar que implementación de almacenamiento garantiza atomicidad (transacciones, locks)
- Tests de concurrencia explícitos (múltiples threads intentan resolver mismo handoff)
- Validación de invariante: solo un `handoff_redeemed` por `handoff_id`

**Riesgo Aceptable**: No. Violación de uso único es riesgo no aceptable que fuerza detención inmediata.

**RIESGO 2: TTL No se Aplica Correctamente**

**Descripción**: Handoffs pueden no expirar correctamente si la implementación de TTL no funciona (handoffs permanecen activos indefinidamente).

**Señales Tempranas**:
- Handoffs con `expires_at` en el pasado siguen siendo válidos
- Limpieza periódica no elimina handoffs expirados
- Tests de expiración fallan

**Mitigación**:
- Validar que implementación de almacenamiento aplica TTL correctamente
- Tests de expiración explícitos (handoff creado, esperar TTL, verificar expiración)
- Validación de invariante: handoffs con `expires_at <= now()` no pueden resolverse

**Riesgo Aceptable**: No. Violación de TTL es riesgo no aceptable que fuerza detención inmediata.

**RIESGO 3: Timeouts No se Aplican Correctamente**

**Descripción**: Operaciones pueden bloquearse indefinidamente si timeouts no se implementan correctamente (solicitudes quedan colgadas).

**Señales Tempranas**:
- Solicitudes HTTP no retornan respuesta (timeout del cliente excede timeout del servidor)
- Logs muestran operaciones que exceden timeouts definidos
- Sistema se degrada bajo carga (solicitudes acumuladas)

**Mitigación**:
- Validar que todas las operaciones externas (almacenamiento, proveedor) tienen timeouts
- Tests de timeout explícitos (simular operación lenta, verificar timeout)
- Validación de invariante: ninguna operación excede timeouts definidos

**Riesgo Aceptable**: Parcialmente. Timeouts incorrectos pueden degradar sistema pero no violan invariantes críticos. Requiere corrección pero no detención inmediata.

**RIESGO 4: Mensajes de Error Exponen Información Sensible**

**Descripción**: Mensajes de error pueden exponer información sensible (detalles técnicos, estados internos) si no se validan correctamente.

**Señales Tempranas**:
- Respuestas HTTP incluyen stack traces o mensajes de error técnicos
- Logs muestran información sensible en respuestas
- Usuarios reportan ver información técnica en errores

**Mitigación**:
- Validar que todos los mensajes de error son genéricos e invariantes
- Tests de opacidad explícitos (verificar que errores no exponen información sensible)
- Validación de invariante: mensajes de error no contienen información técnica

**Riesgo Aceptable**: No. Exposición de información sensible es riesgo no aceptable que fuerza detención inmediata.

**RIESGO 5: Kill-Switch No Funciona Inmediatamente**

**Descripción**: Kill-switch puede no activarse inmediatamente si la implementación no consulta estado en cada solicitud (activación tiene delay).

**Señales Tempranas**:
- Handoffs se procesan después de activar kill-switch
- Logs muestran procesamiento después de activación
- Tests de kill-switch fallan (handoffs procesados cuando deberían rechazarse)

**Mitigación**:
- Validar que kill-switch se consulta en cada solicitud (no cacheado)
- Tests de kill-switch explícitos (activar, enviar solicitud, verificar rechazo inmediato)
- Validación de invariante: kill-switch activo rechaza todas las solicitudes nuevas

**Riesgo Aceptable**: No. Kill-switch que no funciona inmediatamente compromete control operativo. Requiere corrección inmediata.

**RIESGO 6: Almacenamiento Temporal Almacena Información Prohibida**

**Descripción**: Implementación puede almacenar información prohibida (contenido, PII) si no se valida estructura de datos.

**Señales Tempranas**:
- Estructura de datos incluye campos prohibidos (contenido, números telefónicos)
- Logs muestran almacenamiento de información sensible
- Tests de validación fallan (campos prohibidos presentes)

**Mitigación**:
- Validar que estructura de datos solo incluye campos permitidos
- Tests de validación explícitos (intentar almacenar campos prohibidos, verificar rechazo)
- Validación de invariante: solo se almacenan metadatos permitidos

**Riesgo Aceptable**: No. Almacenamiento de información prohibida es riesgo no aceptable que fuerza detención inmediata.

### 6.2. Riesgos Aceptables vs No Aceptables

**RIESGOS ACEPTABLES** (con mitigación parcial):

1. **Pérdida de Handoffs Activos por Falla de Almacenamiento**:
   - Mitigación: TTL corto limita ventana de pérdida
   - Riesgo residual: Usuarios con handoffs activos pierden acceso temporal
   - **ACCIÓN**: Aceptado en GO CONTROLADO. Volumen bajo limita impacto.

2. **Falla Silenciosa del Proveedor**:
   - Mitigación: Timeouts en llamadas al proveedor
   - Riesgo residual: Usuario puede quedar sin conexión sin notificación clara
   - **ACCIÓN**: Aceptado en GO CONTROLADO. Operación controlada permite detección manual.

3. **Timeouts No Óptimos**:
   - Mitigación: Timeouts definidos según documentación
   - Riesgo residual: Timeouts pueden ser subóptimos para algunos casos
   - **ACCIÓN**: Aceptado en GO CONTROLADO. Ajuste fino en fase posterior si necesario.

**RIESGOS NO ACEPTABLES** (fuerzan detención inmediata):

1. **Violación de Uso Único o TTL**:
   - **ACCIÓN**: Detención inmediata, kill-switch, invalidar handoffs activos, investigar causa

2. **Exposición de Información Sensible**:
   - **ACCIÓN**: Detención inmediata, kill-switch, eliminar información expuesta, investigar causa

3. **Almacenamiento de Contenido Prohibido**:
   - **ACCIÓN**: Detención inmediata, kill-switch, eliminar contenido, investigar causa

4. **Kill-Switch No Funciona**:
   - **ACCIÓN**: Detención inmediata, corrección inmediata, validar funcionamiento

5. **Dependencia Directa del Core**:
   - **ACCIÓN**: Detención inmediata, kill-switch, revertir cambios, investigar causa

### 6.3. Señales Tempranas de Desvío

**SEÑALES TÉCNICAS**:

1. **Tests de Invariantes Fallan**:
   - Tests de atomicidad fallan
   - Tests de TTL fallan
   - Tests de uso único fallan
   - **ACCIÓN**: Detener implementación, investigar causa, corregir antes de continuar

2. **Código Introduce Dependencias al Core**:
   - Imports o llamadas directas al Core
   - Dependencias en package.json/requirements.txt que incluyen Core
   - **ACCIÓN**: Detener implementación, revertir cambios, rediseñar si necesario

3. **Estructura de Datos Incluye Campos Prohibidos**:
   - Campos para contenido, números telefónicos, PII
   - **ACCIÓN**: Detener implementación, corregir estructura, validar antes de continuar

4. **Mensajes de Error Exponen Información Técnica**:
   - Stack traces en respuestas
   - Detalles de errores internos
   - **ACCIÓN**: Detener implementación, corregir mensajes, validar antes de continuar

5. **Timeouts No se Implementan**:
   - Operaciones sin timeouts
   - Timeouts incorrectos
   - **ACCIÓN**: Detener implementación, implementar timeouts, validar antes de continuar

**SEÑALES ARQUITECTÓNICAS**:

1. **Código Mezcla Responsabilidades**:
   - Resolver decide en lugar de validar
   - Sender valida en lugar de ejecutar
   - **ACCIÓN**: Detener implementación, refactorizar, validar separación antes de continuar

2. **Código Introduce Lógica de Negocio**:
   - Validación de saldo en WAM
   - Decisión de autorización en WAM
   - **ACCIÓN**: Detener implementación, eliminar lógica, validar antes de continuar

3. **Código Optimiza UX a Costa de Seguridad**:
   - Mensajes de error detallados para "mejorar UX"
   - Handoffs reutilizables para "conveniencia"
   - **ACCIÓN**: Detener implementación, revertir optimizaciones, validar antes de continuar

---

## 7. Plan de Arranque de la Fase de Código

### 7.1. Checklist Previo a Escribir la Primera Línea

**DOCUMENTACIÓN**:
- [ ] Este documento (`FASE_B_PREPARACION_IMPLEMENTACION_TECNICA_WAM.md`) está completo y aprobado
- [ ] `ARQUITECTURA_MINIMA_CANAL_WAM.md` está revisado y alineado
- [ ] `IMPLEMENTACION_MINIMA_WAM_GO_CONTROLADO.md` está revisado y alineado
- [ ] `INFRA_Y_RUNTIME_WAM_GO_CONTROLADO.md` está revisado y alineado
- [ ] `CRITERIOS_SALIDA_GO_CONTROLADO_A_GO.md` está revisado y alineado
- [ ] `ELIXIR_CORE_CONTRATO.md` está revisado y alineado
- [ ] `ESTRES_Y_ABUSO.md` está revisado y alineado

**ARQUITECTURA**:
- [ ] Separación estricta de capas confirmada (WAM no consulta Core)
- [ ] Contratos técnicos internos definidos y documentados (Resolver, Almacenamiento, Sender, Kill-Switch)
- [ ] Estructura de datos de handoffs definida (solo metadatos permitidos)
- [ ] Flujos operativos end-to-end documentados
- [ ] Timeouts canónicos definidos (2s almacenamiento, 10s proveedor, 15s total)

**DECISIONES TÉCNICAS**:
- [ ] Tipo de runtime definido (service HTTP/HTTPS, request-driven)
- [ ] Lenguaje de implementación seleccionado (según criterios definidos)
- [ ] Modelo de ejecución definido (síncrono, request-driven)
- [ ] Estrategia de empaquetado y despliegue definida

**TECNOLOGÍAS**:
- [ ] Clase de tecnología para mensajería seleccionada (APIs REST/HTTP)
- [ ] Clase de tecnología para almacenamiento temporal seleccionada (memoria, KV, archivo)
- [ ] Clase de tecnología para observabilidad seleccionada (logs estructurados, métricas agregadas)
- [ ] Clase de tecnología para gestión de secretos seleccionada (variables de entorno, sistema externo)
- [ ] Clase de tecnología para kill-switch seleccionada (config central, feature flag, variable de entorno)

**CONTROLES**:
- [ ] Rate limiting definido (10 resoluciones/minuto por IP, 5 creaciones/minuto por sesión)
- [ ] Idempotencia definida (operaciones repetidas no tienen efectos adicionales)
- [ ] Uso único (atomicidad) definido (transición CREATED → REDEEMED es atómica)
- [ ] Timeouts end-to-end definidos (15 segundos total)
- [ ] Kill-switch definido (modos DROP y SILENCIO, activación manual)

**INVARIANTS**:
- [ ] El WAM no consulta al Core directamente
- [ ] El WAM no almacena contenido de conversación
- [ ] El WAM no expone números telefónicos o datos personales
- [ ] El WAM no modifica el Core
- [ ] El WAM no decide, no explica, no aprende
- [ ] Handoffs tienen TTL estricto (~5 minutos)
- [ ] Handoffs son de uso único (no reutilizables)
- [ ] Transiciones de estado son atómicas
- [ ] Timeouts se aplican correctamente
- [ ] Kill-switch detiene procesamiento inmediatamente

**RIESGOS**:
- [ ] Riesgos técnicos de implementación documentados
- [ ] Señales tempranas de desvío definidas
- [ ] Acciones de respuesta a riesgos definidas
- [ ] Eventos que fuerzan detención inmediata documentados

### 7.2. Reglas de PR / Revisión

**REGLAS OBLIGATORIAS**:

1. **Cada PR debe incluir**:
   - Descripción clara de cambios
   - Justificación técnica de decisiones
   - Validación de invariantes (tests o explicación)
   - Confirmación de que no introduce dependencias al Core
   - Confirmación de que no almacena información prohibida
   - Confirmación de que no expone información sensible

2. **Cada PR debe validar**:
   - Tests de invariantes pasan (atomicidad, TTL, uso único)
   - Tests de opacidad pasan (mensajes de error genéricos)
   - Tests de fail-closed pasan (errores resultan en rechazo)
   - Tests de kill-switch pasan (activación inmediata)
   - Tests de timeouts pasan (operaciones no exceden timeouts)

3. **Cada PR debe rechazarse si**:
   - Introduce dependencias al Core
   - Almacena información prohibida
   - Expone información sensible
   - Viola invariantes (uso único, TTL, atomicidad)
   - No implementa timeouts correctamente
   - Kill-switch no funciona inmediatamente

4. **Revisión debe validar**:
   - Separación estricta de capas
   - Contratos técnicos internos respetados
   - Límites técnicos explícitos respetados
   - Riesgos técnicos mitigados
   - Código alineado con documentación

**PROCESO DE REVISIÓN**:
- Mínimo 1 revisor aprobado antes de merge
- Revisor debe validar checklist completo
- Revisor debe confirmar que no hay violaciones de prohibiciones
- Revisor debe validar tests de invariantes

### 7.3. Criterios de Aceptación de la Primera Versión Técnica

**CRITERIOS OBLIGATORIOS**:

1. **Funcionalidad Core**:
   - [ ] Handoff Resolver valida y resuelve handoffs correctamente
   - [ ] Almacenamiento Temporal mantiene handoffs con TTL y uso único
   - [ ] Sender ejecuta conexión usuario-modelo en proveedor
   - [ ] Kill-switch activa/desactiva correctamente

2. **Invariantes Críticos**:
   - [ ] Transición CREATED → REDEEMED es atómica (tests de concurrencia pasan)
   - [ ] Handoffs expiran correctamente después de TTL (tests de expiración pasan)
   - [ ] Handoffs REDEEMED no pueden resolverse nuevamente (tests de uso único pasan)
   - [ ] Timeouts se aplican correctamente (tests de timeout pasan)

3. **Opacidad y Seguridad**:
   - [ ] Mensajes de error son genéricos e invariantes (tests de opacidad pasan)
   - [ ] No se almacena información prohibida (validación de estructura de datos)
   - [ ] No se expone información sensible (validación de respuestas HTTP)

4. **Fail-Closed**:
   - [ ] Errores resultan en rechazo de handoff (tests de fail-closed pasan)
   - [ ] Falla de almacenamiento resulta en rechazo (tests de falla pasan)
   - [ ] Falla de proveedor resulta en rechazo (tests de falla pasan)

5. **Kill-Switch**:
   - [ ] Kill-switch activa inmediatamente (tests de kill-switch pasan)
   - [ ] Kill-switch rechaza solicitudes en modo DROP (tests pasan)
   - [ ] Kill-switch procesa sin ejecutar en modo SILENCIO (tests pasan)

6. **Observabilidad**:
   - [ ] Eventos del ciclo de vida se registran correctamente
   - [ ] Métricas agregadas se capturan correctamente
   - [ ] Logs no contienen información sensible

7. **Separación de Capas**:
   - [ ] No hay dependencias al Core (validación de imports/dependencias)
   - [ ] No hay llamadas directas al Core (validación de código)
   - [ ] Contratos técnicos internos respetados

**CRITERIOS DE CALIDAD**:
- [ ] Código sigue estándares del lenguaje seleccionado
- [ ] Tests cubren invariantes críticos (cobertura mínima: 80% para lógica core)
- [ ] Documentación técnica actualizada (README, comentarios)
- [ ] Código es mantenible y sustituible (componentes intercambiables)

### 7.4. Condiciones para Abortar Implementación

**CONDICIONES QUE FUERZAN ABORTO**:

1. **Violación de Principios Arquitectónicos**:
   - Se requiere consultar al Core directamente
   - Se requiere almacenar contenido de conversación
   - Se requiere exponer información sensible
   - **ACCIÓN**: Abortar implementación, volver a Fase A (rediseño)

2. **Violación de Invariantes Críticos**:
   - No se puede garantizar atomicidad de transiciones
   - No se puede garantizar TTL estricto
   - No se puede garantizar uso único
   - **ACCIÓN**: Abortar implementación, investigar causa, rediseñar si necesario

3. **Dependencias Técnicas No Resueltas**:
   - Tecnología seleccionada no permite implementar contratos
   - Tecnología seleccionada introduce dependencias permanentes
   - Tecnología seleccionada no permite sustituibilidad
   - **ACCIÓN**: Abortar implementación, reevaluar decisiones técnicas, rediseñar si necesario

4. **Riesgos No Aceptables No Mitigables**:
   - Kill-switch no puede implementarse correctamente
   - Timeouts no pueden implementarse correctamente
   - Fail-closed no puede garantizarse
   - **ACCIÓN**: Abortar implementación, investigar causa, rediseñar si necesario

5. **Cambio en Requisitos Fundamentales**:
   - Se requiere cambiar modelo de handoff (permanentes, reutilizables)
   - Se requiere cambiar modelo de ejecución (asíncrono, distribuido)
   - Se requiere cambiar principios arquitectónicos
   - **ACCIÓN**: Abortar implementación, volver a Fase A (rediseño)

**PROCEDIMIENTO DE ABORTO**:
1. Documentar causa de aborto
2. Registrar estado actual de implementación
3. Identificar cambios requeridos en diseño
4. Volver a Fase A (rediseño) si es necesario
5. Actualizar documentación con lecciones aprendidas

---

## 8. Confirmación de Estado del Sistema

### 8.1. El Core No Aparece como Dependiente

✅ **Confirmado**: El WAM no consulta al Core directamente. El WAM recibe handoffs ya autorizados por el Core a través del Chat. El Core no tiene dependencias del WAM. Las decisiones técnicas y contratos internos respetan esta separación estricta.

**VALIDACIÓN**:
- Contratos técnicos internos no incluyen consultas al Core
- Decisiones técnicas no requieren dependencias al Core
- Límites técnicos explícitos prohíben dependencias al Core
- Plan de arranque incluye validación de ausencia de dependencias

### 8.2. Separación Estricta de Capas

✅ **Confirmado**: El WAM opera como capa independiente. No modifica Core, no modifica Chat. Solo ejecuta handoffs autorizados. Las decisiones técnicas y contratos internos mantienen esta separación.

**VALIDACIÓN**:
- Contratos técnicos internos definen interfaces independientes
- Decisiones técnicas no requieren modificación de otras capas
- Límites técnicos explícitos prohíben mezcla de responsabilidades
- Plan de arranque incluye validación de separación de capas

### 8.3. Estado GO CONTROLADO

✅ **Confirmado**: El sistema mantiene estado **GO CONTROLADO**. El WAM es ejecutor puro sin lógica decisional. Todas las decisiones provienen del Core a través del Chat. Las decisiones técnicas están alineadas con operación controlada con usuarios limitados y volumen bajo.

**VALIDACIÓN**:
- Decisiones técnicas priorizan simplicidad sobre escalabilidad
- Modelo de ejecución es suficiente para volumen bajo
- Tecnologías seleccionadas no requieren infraestructura compleja
- Plan de arranque incluye validación de estado GO CONTROLADO

### 8.4. Preparación Completa para Implementación

✅ **Confirmado**: Todas las decisiones técnicas necesarias están documentadas. Contratos técnicos internos están definidos. Límites técnicos explícitos están documentados. Riesgos técnicos de implementación están identificados. Plan de arranque está completo.

**VALIDACIÓN**:
- Checklist previo a coding está completo
- Reglas de PR/revisión están definidas
- Criterios de aceptación están documentados
- Condiciones para abortar están documentadas

---

## 9. Resumen Ejecutivo

### 9.1. Decisiones Técnicas Clave

- **Runtime**: Service HTTP/HTTPS con procesamiento request-driven síncrono
- **Lenguaje**: Selección según criterios de simplicidad, sustituibilidad, observabilidad, fail-closed y operación controlada
- **Modelo de Ejecución**: Síncrono request-driven sin estado compartido
- **Empaquetado**: Artefacto autocontenido con configuración externa

### 9.2. Tecnologías Permitidas

- **Mensajería**: APIs REST/HTTP con timeouts configurables
- **Almacenamiento**: Memoria, KV ephemeral o archivo temporal con TTL y atomicidad
- **Observabilidad**: Logs estructurados, métricas agregadas, alertas mínimas
- **Secretos**: Variables de entorno, sistema externo o archivo protegido
- **Kill-Switch**: Config central, feature flag manual o variable de entorno

### 9.3. Contratos Técnicos Internos

- **Handoff Resolver**: Valida y resuelve handoffs con timeouts y mensajes genéricos
- **Almacenamiento Temporal**: Mantiene handoffs con TTL, uso único y atomicidad
- **Sender**: Ejecuta conexión usuario-modelo con timeouts y opacidad
- **Kill-Switch**: Detiene procesamiento inmediatamente con modos DROP y SILENCIO

### 9.4. Límites y Riesgos

- **No se implementa**: Persistencia, recuperación, reintentos, escalado, optimización de UX
- **Prohibido**: Consultar Core, almacenar contenido, exponer información sensible, decidir, explicar, aprender
- **Riesgos no aceptables**: Violación de uso único/TTL, exposición de información, almacenamiento prohibido, kill-switch no funciona, dependencia del Core
- **Señales de desvío**: Tests de invariantes fallan, código introduce dependencias, estructura incluye campos prohibidos

### 9.5. Plan de Arranque

- **Checklist previo**: Documentación, arquitectura, decisiones técnicas, tecnologías, controles, invariantes, riesgos
- **Reglas de PR**: Validación de invariantes, ausencia de dependencias, tests obligatorios
- **Criterios de aceptación**: Funcionalidad core, invariantes críticos, opacidad, fail-closed, kill-switch, observabilidad, separación de capas
- **Condiciones de aborto**: Violación de principios, invariantes, dependencias no resueltas, riesgos no mitigables, cambio en requisitos

---

## 10. Frase Canónica de Preparación Técnica

**El WAM ejecuta handoffs autorizados. No decide, no explica, no aprende. Conecta una vez y desaparece. En GO CONTROLADO, la preparación técnica está completa: decisiones técnicas documentadas, contratos internos definidos, límites explícitos establecidos, riesgos identificados y plan de arranque listo. La implementación técnica puede comenzar sin rediseñar.**

---

**Versión del Documento**: 1.0  
**Fecha**: 2024  
**Estado**: GO CONTROLADO — Preparación Técnica Completa  
**Próximos Pasos**: Iniciar fase de implementación técnica según este documento

---

**FIN DEL DOCUMENTO**


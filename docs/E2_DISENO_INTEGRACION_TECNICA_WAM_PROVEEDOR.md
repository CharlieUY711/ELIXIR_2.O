# E2 — Diseño de Integración Técnica WAM-Proveedor
## FASE E / INTEGRACIÓN CONTROLADA CON PROVEEDOR REAL (GO CONDICIONAL)

**Fecha**: 2024  
**Estado**: E2 — DISEÑO DE INTEGRACIÓN TÉCNICA (SIN CÓDIGO)  
**Versión**: 1.0  
**Tipo**: Diseño Técnico

**ASUNCIÓN**: Este diseño asume **Twilio WhatsApp Business API** como proveedor candidato (según E1), pero mantiene abstracciones donde sea posible para permitir sustituibilidad.

---

## 1. Propósito del Documento

Este documento define el diseño técnico completo de la integración entre el Canal WhatsApp Enmascarado (WAM) y un proveedor real de WhatsApp Business API, preservando todos los invariantes del WAM y cumpliendo con los requisitos definidos en `/docs/DECISION_INTEGRACION_PROVEEDOR_WAM.md`.

**OBJETIVO**: Producir diseño técnico aprobado y alineado a invariantes + requisitos, listo para implementación en E3.

**CRITERIO DE SALIDA E2**: Diseño aprobado y alineado a invariantes + requisitos.

---

## 2. Contexto Inviolable

- **Elixir Core v1.0 está SELLADO e INMODIFICABLE**
- El WAM NO consulta al Core. Solo ejecuta handoffs ya autorizados.
- WAM implementado y hardeneado, con kill-switch persistente (DROP/SILENCIO)
- Modelo autorizado: **Push (Webhook Inbound / API Outbound)**. Pull prohibido.
- Límites operativos iniciales: 100 handoffs/día, 10 usuarios simultáneos, 30 días de validación.
- Abort inmediato si: fallas ≥ 20% en 1 hora, violación de invariantes, falla total del proveedor, exposición de PII.

**Contratos Existentes del WAM** (INMODIFICABLES):
- `ISender`: Interfaz abstracta para ejecución de conexión usuario-modelo
- `SendRequest`: `{ handoff_id, user_ref, model_ref }`
- `SendResult`: `{ success: boolean, timestamp: string, error_type?: SendErrorType }`

---

## 3. Mapeo de Endpoints

### 3.1. Webhook Inbound (Proveedor → WAM)

**Propósito**: Recibir notificaciones de estado del proveedor (opcional, para auditoría).

**Endpoint WAM**: `POST /webhooks/provider/status`

**Autenticación**: Validación de firma HMAC del proveedor (fail-closed si firma inválida).

**Payload Esperado** (ejemplo Twilio):
```json
{
  "MessageSid": "SM...",
  "MessageStatus": "delivered",
  "To": "+1234567890",
  "From": "+0987654321",
  "Timestamp": "2024-01-01T00:00:00Z"
}
```

**Validación Mínima**:
- Verificar firma HMAC (si proveedor la proporciona)
- Validar formato básico del payload
- Extraer `MessageSid` y `MessageStatus` (sin persistir contenido completo)
- Rechazar si firma inválida o payload malformado (fail-closed)

**No se Persiste**:
- ❌ Contenido de mensajes
- ❌ Números telefónicos completos (solo referencias abstractas si es necesario)
- ❌ Metadata completa del proveedor

**Eventos de Auditoría**:
- Registrar evento `provider_webhook_received` con: `{ handoff_id (si correlacionable), status, timestamp }`
- NO registrar números telefónicos ni contenido

**Comportamiento Fail-Closed**:
- Si firma inválida → Rechazar webhook (no procesar)
- Si payload malformado → Rechazar webhook (no procesar)
- Si error al procesar → Registrar evento de error, no exponer detalles

### 3.2. API Outbound (WAM → Proveedor)

**Propósito**: Iniciar conexión usuario-modelo en WhatsApp.

**Endpoint Proveedor** (ejemplo Twilio): `POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`

**Autenticación**: API Key / Token del proveedor (configurado por env/vault).

**Payload Enviado** (ejemplo Twilio):
```json
{
  "From": "whatsapp:+1234567890",  // Número de WhatsApp Business (enmascarado)
  "To": "whatsapp:+0987654321",    // Número del usuario (enmascarado)
  "Body": "Conectando...",         // Mensaje inicial (genérico, sin PII)
  "StatusCallback": "https://wam.example.com/webhooks/provider/status",
  "Idempotency-Key": "{handoff_id}"  // Idempotencia usando handoff_id
}
```

**Mapeo desde WAM**:
- `handoff_id` → `Idempotency-Key` (idempotencia)
- `user_ref` → `To` (número enmascarado del usuario)
- `model_ref` → `From` (número enmascarado del modelo)
- `StatusCallback` → URL del webhook inbound

**Timeout Configurado**: 10 segundos (según diseño WAM).

**Respuesta Esperada** (ejemplo Twilio):
```json
{
  "sid": "SM...",
  "status": "queued",
  "to": "+1234567890",
  "from": "+0987654321"
}
```

**Mapeo a SendResult**:
- `success: true` si `status` es `queued`, `sent`, o `delivered`
- `success: false` si `status` es `failed` o error HTTP
- `error_type` mapeado según tipo de error del proveedor
- `timestamp` extraído de respuesta o generado localmente

**Filtrado de PII**:
- Antes de registrar evento, filtrar números telefónicos de respuesta
- Solo registrar `sid` y `status` (referencias abstractas)
- NO registrar `to` ni `from` completos en eventos

---

## 4. Validación Mínima de Payload Inbound

### 4.1. Validación de Firma HMAC (si Proveedor la Proporciona)

**Algoritmo** (ejemplo Twilio):
- Proveedor envía header `X-Twilio-Signature`
- WAM calcula HMAC-SHA1 de URL + parámetros usando `AUTH_TOKEN`
- Compara firma recibida con firma calculada (tiempo constante)
- Si no coincide → Rechazar webhook (fail-closed)

**Implementación**:
- Función de validación aislada
- No exponer detalles de validación en errores
- Registrar evento `webhook_signature_invalid` si falla

### 4.2. Validación de Formato Básico

**Campos Requeridos** (mínimos):
- `MessageSid` o equivalente (identificador de mensaje)
- `MessageStatus` o equivalente (estado del mensaje)
- `Timestamp` o equivalente (timestamp del evento)

**Validación**:
- Verificar presencia de campos requeridos
- Validar formato de `MessageSid` (si hay patrón conocido)
- Validar `MessageStatus` contra valores conocidos
- Rechazar si campos faltan o formato inválido (fail-closed)

**No se Valida**:
- ❌ Contenido de mensajes (no se procesa)
- ❌ Números telefónicos completos (solo referencias si necesario)
- ❌ Metadata adicional del proveedor

### 4.3. Comportamiento Fail-Closed

**Si Validación Falla**:
1. Rechazar webhook inmediatamente (no procesar)
2. Registrar evento `webhook_validation_failed` con tipo de error
3. NO exponer detalles técnicos en respuesta al proveedor
4. NO persistir payload inválido

**Si Validación Pasa**:
1. Extraer solo campos necesarios para auditoría
2. Registrar evento `provider_webhook_received` con datos filtrados
3. NO persistir payload completo

---

## 5. Autenticación/Firmas del Proveedor como Capa Fail-Closed

### 5.1. Autenticación Outbound (WAM → Proveedor)

**Mecanismo**: API Key / Token del proveedor.

**Configuración**:
- Almacenado en variables de entorno o vault (nunca hardcodeado)
- Variables: `PROVIDER_API_KEY`, `PROVIDER_API_SECRET` (o equivalente)
- Cargado al inicio del servicio
- Validación de presencia al inicio (fail si faltan)

**Uso en Requests**:
- Header `Authorization: Basic {base64(api_key:api_secret)}` (ejemplo Twilio)
- O header específico del proveedor según documentación

**Comportamiento Fail-Closed**:
- Si credenciales faltan → Servicio no inicia (fail-closed)
- Si credenciales inválidas → Proveedor rechaza, WAM registra error, retorna `SendResult { success: false, error_type: 'invalid_credentials' }`
- NO exponer credenciales en logs ni errores

### 5.2. Validación de Firma Inbound (Proveedor → WAM)

**Mecanismo**: HMAC-SHA1 o equivalente del proveedor.

**Configuración**:
- Almacenado en variables de entorno o vault: `PROVIDER_WEBHOOK_AUTH_TOKEN`
- Cargado al inicio del servicio
- Validación de presencia al inicio (fail si falta)

**Uso en Validación**:
- Calcular HMAC de URL + parámetros usando `PROVIDER_WEBHOOK_AUTH_TOKEN`
- Comparar con firma recibida en header (tiempo constante)
- Si no coincide → Rechazar webhook (fail-closed)

**Comportamiento Fail-Closed**:
- Si token falta → Servicio no inicia (fail-closed)
- Si firma inválida → Rechazar webhook, registrar evento, NO procesar
- NO exponer token en logs ni errores

---

## 6. Timeouts y Manejo de Errores del Proveedor

### 6.1. Timeout Configurado

**Timeout Outbound**: 10 segundos (según diseño WAM).

**Justificación**:
- Usuario espera respuesta inmediata en `handoff_url`
- Timeout corto previene bloqueo prolongado
- Fail-closed: si timeout → rechazar handoff

**Implementación**:
- Timeout configurable por env: `PROVIDER_TIMEOUT_MS` (default: 10000)
- Aplicado a todas las llamadas outbound al proveedor
- Cancelación de request si timeout excede

### 6.2. Categorías de Errores del Proveedor

#### 6.2.1. Errores Transitorios (No Reintentados por WAM)

**Ejemplos**:
- Timeout de red
- Error HTTP 5xx del proveedor
- Rate limit temporal (429)

**Comportamiento WAM**:
- Registrar evento `provider_execution_failed` con `error_type: 'provider_timeout'` o `'provider_error'`
- Retornar `SendResult { success: false, error_type: 'provider_timeout' | 'provider_error' }`
- Handoff queda marcado como `REDEEMED` (no reutilizable)
- NO reintentar automáticamente
- Usuario puede solicitar nuevo handoff desde Chat

#### 6.2.2. Errores Permanentes

**Ejemplos**:
- Credenciales inválidas (401)
- Parámetros inválidos (400)
- Cuenta suspendida (403)
- Límite de uso excedido permanentemente

**Comportamiento WAM**:
- Registrar evento `provider_execution_failed` con `error_type: 'invalid_credentials'` o `'provider_error'`
- Retornar `SendResult { success: false, error_type: 'invalid_credentials' | 'provider_error' }`
- Handoff queda marcado como `REDEEMED` (no reutilizable)
- NO reintentar automáticamente
- Alertar operadores si errores permanentes son frecuentes

#### 6.2.3. Errores Ambiguos

**Ejemplos**:
- Error HTTP 4xx genérico
- Respuesta malformada
- Timeout sin confirmación

**Comportamiento WAM**:
- Tratar como error permanente (fail-closed)
- Registrar evento `provider_execution_failed` con `error_type: 'provider_error'`
- Retornar `SendResult { success: false, error_type: 'provider_error' }`
- Handoff queda marcado como `REDEEMED` (no reutilizable)

### 6.3. Silencio / Drop como Respuestas Válidas

**Modo DROP (Kill-Switch Activo)**:
- WAM rechaza handoff inmediatamente (no invoca proveedor)
- Retorna mensaje genérico al usuario
- NO invoca `ISender.send()`
- Handoff queda marcado como `REDEEMED` (no reutilizable)
- Registrar evento `handoff_rejected_killswitch`

**Modo SILENCIO (Kill-Switch Activo)**:
- WAM procesa handoff normalmente
- NO invoca `ISender.send()` (sender no ejecuta)
- Retorna mensaje genérico al usuario
- Handoff queda marcado como `REDEEMED` (no reutilizable)
- Registrar evento `handoff_silenced_killswitch`

**Comportamiento Fail-Closed**:
- Cualquier falla del proveedor → Rechazar handoff
- Cualquier timeout → Rechazar handoff
- Cualquier error de validación → Rechazar handoff
- NO hay fallback permisivo

---

## 7. Estrategia de Idempotencia (SIN Almacenar Contenido)

### 7.1. Mecanismo de Idempotencia

**Idempotency Key**: `handoff_id` (único por handoff, no reutilizable).

**Uso en Request al Proveedor**:
- Header `Idempotency-Key: {handoff_id}` (ejemplo Twilio)
- O campo `idempotency_key: {handoff_id}` en request body (según proveedor)

**Ventana de Idempotencia**: ≥ 5 minutos (coincide con TTL de handoff).

**Justificación**:
- `handoff_id` es único y no reutilizable (ya marcado como REDEEMED)
- Proveedor garantiza que requests con mismo `Idempotency-Key` no duplican ejecución
- No requiere almacenar contenido ni estado adicional

### 7.2. Flujo de Idempotencia

**Primera Invocación**:
1. WAM marca handoff como `REDEEMED`
2. WAM invoca proveedor con `Idempotency-Key: {handoff_id}`
3. Proveedor procesa y retorna resultado
4. WAM registra evento de ejecución

**Reintento (si necesario, futuro)**:
1. WAM invoca proveedor con mismo `Idempotency-Key: {handoff_id}`
2. Proveedor detecta idempotency key duplicado
3. Proveedor retorna resultado de primera ejecución (sin duplicar)
4. WAM registra evento de ejecución (mismo resultado)

**No se Almacena**:
- ❌ Contenido de request al proveedor
- ❌ Contenido de respuesta del proveedor
- ❌ Estado de idempotencia (proveedor lo maneja)

### 7.3. Validación de Idempotencia

**Monitoreo**:
- Registrar evento si proveedor retorna error de idempotency key duplicado
- Alertar si se detectan ejecuciones duplicadas (violación de uso único)

**Fail-Closed**:
- Si proveedor no soporta idempotencia → Proveedor excluido (criterio E1)
- Si idempotencia falla → Registrar evento, tratar como error

---

## 8. Estrategia de Rate Limiting Compatible con Límites Operativos

### 8.1. Límites Operativos Iniciales

**Volumen Máximo**: 100 handoffs/día
**Usuarios Simultáneos**: 10 usuarios simultáneos

**Traducción a Rate Limits**:
- 100 handoffs/día ≈ 0.07 handoffs/minuto ≈ 4 handoffs/hora
- 10 usuarios simultáneos ≈ máximo 10 requests concurrentes

### 8.2. Rate Limiting en WAM (Ya Implementado)

**Rate Limiting Actual**:
- 10 resoluciones/min por IP
- 5 creaciones/min por session_id

**Compatibilidad**:
- ✅ Límite de 100 handoffs/día es más restrictivo que 10/min
- ✅ Límite de 10 usuarios simultáneos es compatible con rate limiting actual

**No Requiere Cambios**: Rate limiting actual es suficiente para límites operativos iniciales.

### 8.3. Rate Limiting del Proveedor

**Límites del Proveedor** (ejemplo Twilio):
- Rate limits documentados por proveedor
- Típicamente: requests/segundo o requests/minuto

**Estrategia**:
- WAM no debe exceder límites del proveedor
- Límites operativos iniciales (100/día) son muy bajos comparados con límites típicos del proveedor
- Monitorear errores de rate limit del proveedor
- Si rate limit excedido → Registrar evento, activar kill-switch si es necesario

**Guardrails**:
- Validar que límites operativos no exceden límites del proveedor
- Alertar si se acerca a límites del proveedor
- Activar kill-switch si rate limit excedido frecuentemente

---

## 9. Plan de Rollback (Desactivar Sender + Kill-Switch)

### 9.1. Rollback Inmediato

**Mecanismo 1: Kill-Switch (Modo DROP)**:
1. Activar kill-switch en modo DROP (endpoint admin)
2. WAM rechaza todos los handoffs inmediatamente (no invoca proveedor)
3. Usuarios reciben mensaje genérico de error
4. No se ejecutan nuevas conexiones

**Mecanismo 2: Desactivar Sender**:
1. Configurar env: `PROVIDER_ENABLED=false`
2. Reiniciar servicio
3. WAM usa `NoopSender` (simulado, no invoca proveedor)
4. No se ejecutan conexiones reales

**Mecanismo 3: Eliminar Credenciales**:
1. Eliminar `PROVIDER_API_KEY` y `PROVIDER_API_SECRET` de env/vault
2. Reiniciar servicio
3. Servicio falla al iniciar (fail-closed) o usa `NoopSender` si hay fallback

### 9.2. Rollback Completo (Revertir a NoopSender)

**Pasos**:
1. Activar kill-switch en modo DROP
2. Cambiar código para usar `NoopSender` en lugar de `RealSender`
3. Desplegar cambio
4. Verificar que no se invoca proveedor (logs)
5. Desactivar kill-switch si es necesario (modo normal con NoopSender)

**Tiempo Estimado**: < 5 minutos (si kill-switch activo) o < 15 minutos (si requiere deploy).

### 9.3. Validación de Rollback

**Verificación**:
- Revisar logs: no debe haber requests al proveedor
- Revisar métricas: `provider_executions_success_total` y `provider_executions_failed_total` no deben incrementar
- Probar handoff: debe fallar con mensaje genérico (o simular éxito con NoopSender)

**Documentación**:
- Documentar procedimiento de rollback en runbook operativo
- Probar rollback en ambiente de desarrollo antes de producción

---

## 10. Logs/Métricas Agregadas Emitidas (SIN PII)

### 10.1. Métricas Agregadas Adicionales

**Métricas del Proveedor**:
- `provider_executions_success_total` (ya existe, incrementar con proveedor real)
- `provider_executions_failed_total` (ya existe, incrementar con proveedor real)
- `provider_execution_latency_seconds` (nuevo: histograma de latencia)
- `provider_webhook_received_total` (nuevo: contador de webhooks recibidos)
- `provider_webhook_validation_failed_total` (nuevo: contador de webhooks rechazados)

**Tags Permitidos** (sin PII):
- `error_type`: Tipo de error (`provider_timeout`, `provider_error`, `invalid_credentials`, etc.)
- `status`: Estado del mensaje (`queued`, `sent`, `delivered`, `failed`, etc.)
- NO incluir: números telefónicos, contenido de mensajes, handoff_id completo (solo hash si necesario)

### 10.2. Eventos de Auditoría Adicionales

**Eventos del Proveedor**:
- `provider_execution_started`: `{ handoff_id_hash, timestamp }`
- `provider_execution_success`: `{ handoff_id_hash, provider_message_id, latency_ms, timestamp }`
- `provider_execution_failed`: `{ handoff_id_hash, error_type, latency_ms, timestamp }`
- `provider_webhook_received`: `{ provider_message_id, status, timestamp }`
- `provider_webhook_validation_failed`: `{ reason, timestamp }`

**Filtrado de PII**:
- `handoff_id` → `handoff_id_hash` (hash SHA256, no reversible)
- Números telefónicos → NO registrar
- Contenido de mensajes → NO registrar
- `provider_message_id` → Registrar solo si no contiene PII

### 10.3. Logs Estructurados (SIN PII)

**Nivel INFO**:
```json
{
  "event": "provider_execution_success",
  "handoff_id_hash": "abc123...",
  "provider_message_id": "SM...",
  "latency_ms": 1500,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Nivel ERROR**:
```json
{
  "event": "provider_execution_failed",
  "handoff_id_hash": "abc123...",
  "error_type": "provider_timeout",
  "latency_ms": 10000,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**NO se Registra**:
- ❌ Números telefónicos completos
- ❌ Contenido de mensajes
- ❌ `handoff_id` completo (solo hash)
- ❌ Credenciales del proveedor
- ❌ Payload completo del proveedor

---

## 11. Guardrails: Límites Operativos y Kill-Switch Activo

### 11.1. Límites Operativos (100/day, 10 Concurrentes)

**Implementación**:
- Contador diario de handoffs ejecutados (reset a medianoche)
- Contador de handoffs concurrentes (incrementar al iniciar, decrementar al finalizar)
- Validar límites antes de invocar proveedor
- Si límite excedido → Rechazar handoff, registrar evento, NO invocar proveedor

**Configuración**:
- Variables de entorno: `OPERATIONAL_MAX_HANDOFFS_PER_DAY=100`, `OPERATIONAL_MAX_CONCURRENT_USERS=10`
- Cargado al inicio del servicio
- Validación de presencia al inicio (fail si faltan)

**Monitoreo**:
- Alertar si se acerca a 80% del límite diario
- Alertar si se excede límite diario
- Alertar si se excede límite de usuarios concurrentes

### 11.2. Kill-Switch Activo

**Verificación Antes de Invocar Proveedor**:
1. Consultar estado de kill-switch
2. Si modo DROP → Rechazar handoff inmediatamente, NO invocar proveedor
3. Si modo SILENCIO → Procesar handoff, NO invocar proveedor
4. Si inactivo → Continuar normalmente

**Implementación**:
- Verificación síncrona antes de `ISender.send()`
- No requiere cambios a `IKillSwitch` (interfaz existente)
- Fail-closed: si kill-switch falla → Tratar como activo (DROP)

### 11.3. Abort Conditions (≥20% Fallas/Hora)

**Detección**:
- Contador de fallas en ventana deslizante de 1 hora
- Calcular tasa de fallas: `fallas_en_1h / total_en_1h`
- Si tasa ≥ 20% → Activar kill-switch automáticamente (modo DROP)

**Implementación**:
- Ventana deslizante de eventos de falla (última hora)
- Cálculo periódico (cada 1 minuto) de tasa de fallas
- Si condición cumplida → Llamar `killSwitch.activate('DROP')`
- Registrar evento `killswitch_auto_activated_high_failure_rate`

**Alertas**:
- Alertar inmediatamente cuando kill-switch se activa automáticamente
- Notificar operadores para investigación

---

## 12. Validación de Invariantes Preservadas

### 12.1. Invariante de Autorización

**Preservación**:
- ✅ Handoff se marca como `REDEEMED` antes de invocar proveedor (no cambia)
- ✅ WAM no consulta al Core directamente (no cambia)
- ✅ Proveedor no participa en decisiones de autorización (requisito de exclusión)

**Validación**:
- Revisar código: handoff marcado como REDEEMED antes de `ISender.send()`
- Revisar logs: no debe haber consultas al Core desde WAM
- Revisar diseño: proveedor no requiere consulta al Core

### 12.2. Invariante de Uso Único

**Preservación**:
- ✅ Handoff se marca como `REDEEMED` antes de invocar proveedor (no cambia)
- ✅ Proveedor soporta idempotencia con `handoff_id` como key (requisito E1)
- ✅ WAM no reintenta automáticamente (no cambia)

**Validación**:
- Revisar código: handoff marcado como REDEEMED antes de `ISender.send()`
- Revisar diseño: `Idempotency-Key: {handoff_id}` usado en requests
- Revisar logs: no debe haber ejecuciones duplicadas

### 12.3. Invariante de TTL

**Preservación**:
- ✅ TTL se calcula en creación de handoff (no cambia)
- ✅ TempStore invalida handoffs expirados (no cambia)
- ✅ Proveedor no puede extender TTL (no tiene acceso a TempStore)

**Validación**:
- Revisar código: TTL no modificado por proveedor
- Revisar diseño: proveedor no tiene acceso a TempStore

### 12.4. Invariante de No Exposición

**Preservación**:
- ✅ WAM usa referencias abstractas (`user_ref`, `model_ref`) (no cambia)
- ✅ Proveedor soporta enmascaramiento (requisito E1)
- ✅ WAM filtra PII de eventos de auditoría (implementación E3)

**Validación**:
- Revisar diseño: números telefónicos filtrados antes de registrar eventos
- Revisar logs: no debe haber números telefónicos en logs
- Revisar diseño: solo referencias abstractas en eventos

### 12.5. Invariante de No Almacenamiento de Contenido

**Preservación**:
- ✅ WAM no almacena contenido (no cambia)
- ✅ Proveedor puede almacenar contenido (riesgo indirecto, mitigado contractualmente)
- ✅ WAM filtra contenido de eventos de auditoría (implementación E3)

**Validación**:
- Revisar código: no almacenamiento de contenido en WAM
- Revisar diseño: eventos solo contienen referencias abstractas
- Revisar logs: no debe haber contenido de mensajes en logs

### 12.6. Invariante de Separación de Capas

**Preservación**:
- ✅ WAM no consulta al Core directamente (no cambia)
- ✅ Proveedor no requiere consulta al Core (requisito de exclusión)
- ✅ Core no tiene dependencias del WAM (no cambia)

**Validación**:
- Revisar código: no imports del Core en WAM
- Revisar diseño: proveedor no requiere consulta al Core
- Revisar arquitectura: separación de capas preservada

### 12.7. Invariante de Fail-Closed

**Preservación**:
- ✅ Si proveedor falla, WAM retorna error genérico (no cambia)
- ✅ Handoff se marca como `REDEEMED` antes de invocar proveedor (no cambia)
- ✅ No hay fallback permisivo (no cambia)

**Validación**:
- Revisar diseño: todos los errores resultan en rechazo
- Revisar código: no fallback permisivo
- Revisar logs: errores resultan en `SendResult { success: false }`

---

## 13. Criterio de Salida E2

### 13.1. Estado Actual

**DISEÑO COMPLETO**: ✅ Diseño técnico completo documentado.

**ALINEACIÓN A INVARIANTES**: ✅ Todos los invariantes preservados según sección 12.

**ALINEACIÓN A REQUISITOS**: ✅ Todos los requisitos de `/docs/DECISION_INTEGRACION_PROVEEDOR_WAM.md` cumplidos.

### 13.2. Aprobación Requerida

**APROBACIÓN**: Requiere aprobación explícita del arquitecto principal y responsable de release.

**Criterios de Aprobación**:
1. ✅ Diseño preserva todos los invariantes del WAM
2. ✅ Diseño cumple todos los requisitos técnicos y contractuales
3. ✅ Diseño es implementable sin modificar contratos existentes
4. ✅ Diseño incluye plan de rollback documentado
5. ✅ Diseño incluye observabilidad agregada sin PII

### 13.3. Si Diseño Aprobado

**Estado**: ✅ **E2 CERRADO** - Diseño aprobado y listo para implementación.

**Próxima Fase**: **E3 — Implementación Mínima** (código) solo si E1 y E2 están cerrados.

### 13.4. Si Diseño No Aprobado

**Estado**: ⚠️ **E2 PENDIENTE** - Requiere revisión y ajustes.

**Acción**: Revisar feedback, ajustar diseño, re-evaluar aprobación.

---

## 14. Versión y Control de Cambios

**VERSIÓN**: 1.0  
**FECHA DE CREACIÓN**: 2024  
**ÚLTIMA ACTUALIZACIÓN**: 2024

**CONTROL DE CAMBIOS**:
- Este documento solo puede ser modificado mediante proceso formal de gobernanza
- Cualquier modificación requiere aprobación del arquitecto principal y responsable de release
- Las modificaciones deben respetar el principio rector: preservación de invariantes

**DOCUMENTOS RELACIONADOS**:
- `/docs/E1_EVALUACION_PROVEEDOR_WHATSAPP.md`
- `/docs/DECISION_INTEGRACION_PROVEEDOR_WAM.md`
- `/docs/ANALISIS_EXPLORATORIO_INTEGRACION_PROVEEDOR_WHATSAPP.md`
- `/docs/ARQUITECTURA_MINIMA_CANAL_WAM.md`
- `/services/whatsapp-edge/src/contracts/Sender.ts`

---

**FIN DEL DOCUMENTO E2**


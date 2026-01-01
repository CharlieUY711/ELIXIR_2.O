# Revisión Final de Riesgo — Pre FASE F

**Fecha**: 2024  
**Estado**: GO CONTROLADO — CON PROVEEDOR REAL (SANDBOX)  
**Proveedor**: Twilio WhatsApp Business API  
**Arquitecto de Riesgo y Gobernanza**: Elixir Platform  
**Versión**: 1.0

---

## Resumen Ejecutivo

Este documento evalúa los riesgos residuales del sistema Elixir Platform antes de habilitar la **FASE F (validación en campo)**. El sistema se encuentra en estado **GO CONTROLADO** con integración activa de Twilio en modo sandbox, límites operativos estrictos (100 handoffs/día, 10 usuarios simultáneos) y kill-switch persistente.

**Decisión Final**: ✅ **GO FASE F** (con condiciones)

**Justificación**: Los riesgos identificados son **aceptables en GO CONTROLADO** con mitigaciones activas implementadas. Los riesgos de nivel ALTO están controlados mediante límites operativos, kill-switch persistente y observabilidad básica. No se identifican riesgos bloqueantes que impidan la validación en campo controlada.

---

## 1. Riesgos Técnicos Residuales

### 1.1. Dependencia del Proveedor (Twilio)

**Descripción**: El sistema depende completamente de Twilio para la ejecución de handoffs. Falla del proveedor, degradación de servicio o cambios en API pueden interrumpir operación.

**Nivel**: **MEDIO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Kill-switch persistente permite detención inmediata
- ✅ Límites operativos (100/día) limitan exposición
- ✅ Auto-kill-switch activa si tasa de fallas ≥ 20% en 1 hora
- ✅ Timeout estricto (10s) previene bloqueos prolongados
- ✅ Modo sandbox limita impacto de fallas reales
- ✅ Fail-closed garantizado: errores de proveedor resultan en DENY

**Riesgo residual**: Bajo. El kill-switch y límites operativos proporcionan control suficiente para GO CONTROLADO.

---

### 1.2. Latencia y Disponibilidad

**Descripción**: Latencia alta o indisponibilidad de Twilio puede degradar experiencia de usuario o causar timeouts. Latencia de red entre WAM y Twilio puede variar.

**Nivel**: **MEDIO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Timeout configurable (10s por defecto, ajustable vía `PROVIDER_TIMEOUT_MS`)
- ✅ Métricas de latencia registradas (`outbound_latency_ms`)
- ✅ SLO técnico: p95 ≤ 5 segundos (documentado)
- ✅ Fail-closed: timeouts resultan en DENY
- ✅ Límites de concurrencia (10 usuarios simultáneos) previenen saturación

**Riesgo residual**: Bajo. Timeouts y métricas permiten detección temprana de degradación.

---

### 1.3. Errores Silenciosos

**Descripción**: Errores del proveedor que no se propagan correctamente, resultando en handoffs marcados como exitosos cuando en realidad fallaron, o viceversa.

**Nivel**: **MEDIO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Mapeo explícito de estados de Twilio a tipos de error genéricos
- ✅ Validación de respuesta de Twilio antes de marcar como éxito
- ✅ Eventos de auditoría registrados para todos los resultados (`provider_execution_success`, `provider_execution_failed`)
- ✅ Webhook de status callbacks permite validación asíncrona (opcional)
- ✅ Fail-closed: errores no mapeados resultan en `provider_error`

**Riesgo residual**: Medio. El mapeo de errores es básico pero suficiente para GO CONTROLADO. Webhooks opcionales proporcionan validación adicional.

**Recomendación**: Monitorear eventos `provider_execution_failed` durante FASE F para detectar errores no mapeados.

---

### 1.4. Idempotencia Real Bajo Estrés

**Descripción**: Bajo carga o condiciones de carrera, handoffs pueden procesarse múltiples veces, resultando en múltiples mensajes enviados al mismo usuario.

**Nivel**: **BAJO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Transición atómica CREATED → REDEEMED en almacenamiento
- ✅ Handoffs REDEEMED rechazan resoluciones posteriores (idempotencia garantizada)
- ✅ Tests de idempotencia implementados (`handoff_idempotency.test.ts`)
- ✅ Límite de concurrencia (10 usuarios simultáneos) limita condiciones de carrera
- ✅ `handoff_id` único (UUID v4) garantiza identificación única

**Riesgo residual**: Muy bajo. La transición atómica y uso único garantizan idempotencia.

**Nota**: En almacenamiento in-memory, la atomicidad es simulada. En producción con base de datos real, se requiere transacción real.

---

### 1.5. Correcta Activación de Kill-Switch

**Descripción**: Kill-switch puede no activarse correctamente, no persistir tras reinicio, o no aplicarse a todas las solicitudes concurrentes.

**Nivel**: **BAJO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Kill-switch persistente (`PersistentKillSwitch`) almacena estado en archivo
- ✅ Estado se recarga desde disco en cada consulta (`isActive()`)
- ✅ Verificación de kill-switch en múltiples puntos: `HandoffResolver`, `TwilioSender`
- ✅ Modos DROP y SILENCIO implementados y probados
- ✅ Endpoint admin protegido con autenticación y rate limiting
- ✅ Auto-kill-switch activa si tasa de fallas ≥ 20% en 1 hora

**Riesgo residual**: Muy bajo. La persistencia y verificación múltiple garantizan activación correcta.

**Nota**: En arquitectura distribuida (múltiples instancias), se requiere sincronización de kill-switch entre instancias. En GO CONTROLADO con instancia única, este riesgo no aplica.

---

## 2. Riesgos Operativos

### 2.1. Errores Humanos

**Descripción**: Operadores pueden activar kill-switch incorrectamente, desactivar límites, o modificar configuración de manera indebida.

**Nivel**: **MEDIO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Endpoint admin protegido con autenticación (`ADMIN_TOKEN`)
- ✅ Rate limiting en endpoint admin (5 req/min por IP)
- ✅ Eventos de auditoría registrados para activación/desactivación de kill-switch
- ✅ Límites operativos hardcodeados (no configurables vía API)
- ✅ Documentación operativa disponible (`RUNBOOK_INCIDENTES.md`, `WAM_HARDENING_OPERATIVO.md`)

**Riesgo residual**: Medio. La protección de endpoint admin y auditoría proporcionan control básico, pero errores humanos son inevitables.

**Recomendación**: Establecer proceso de revisión para activaciones de kill-switch durante FASE F. Considerar requerir doble confirmación para desactivación.

---

### 2.2. Mala Activación de Rollback

**Descripción**: Rollback puede no ejecutarse correctamente, dejando sistema en estado inconsistente o con proveedor activo cuando debería estar desactivado.

**Nivel**: **MEDIO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Múltiples mecanismos de rollback: kill-switch (DROP/SILENCIO), desactivar sender (`WAM_SENDER_ENABLED=false`), eliminar credenciales
- ✅ Kill-switch persistente sobrevive a reinicios
- ✅ Verificación de estado de kill-switch en cada solicitud
- ✅ Documentación de rollback disponible (`E2_DISENO_INTEGRACION_TECNICA_WAM_PROVEEDOR.md`)

**Riesgo residual**: Medio. Múltiples mecanismos proporcionan redundancia, pero requiere conocimiento operativo.

**Recomendación**: Ejecutar drill de rollback antes de FASE F para validar procedimiento.

---

### 2.3. Uso Indebido de Límites

**Descripción**: Límites operativos (100 handoffs/día, 10 usuarios simultáneos) pueden ser modificados, desactivados, o bypassados accidentalmente.

**Nivel**: **BAJO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Límites hardcodeados en `OperationalLimits` (no configurables vía API)
- ✅ Verificación de límites en cada solicitud de handoff
- ✅ Eventos de auditoría registrados cuando límites se exceden (`limit_exceeded`)
- ✅ Fail-closed: exceder límites resulta en rechazo inmediato

**Riesgo residual**: Muy bajo. Límites hardcodeados y verificación obligatoria previenen bypass.

**Nota**: Modificar límites requiere cambio de código y redeploy. En GO CONTROLADO, esto es aceptable.

---

### 2.4. Falta de Observación Activa

**Descripción**: Sistema puede no tener observación activa suficiente para detectar problemas en tiempo real, resultando en detección tardía de incidentes.

**Nivel**: **MEDIO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Métricas agregadas registradas (`limit_exceeded_total`, `auto_killswitch_armed_total`, `outbound_latency_ms`)
- ✅ Eventos de auditoría registrados para operaciones críticas
- ✅ Separación de logs: `info` (stdout) vs `error` (stderr)
- ✅ Auto-kill-switch activa si tasa de fallas ≥ 20% en 1 hora
- ✅ Alertas mínimas documentadas (requieren configuración externa)

**Riesgo residual**: Medio. Observabilidad básica está implementada, pero requiere configuración externa de alertas.

**Recomendación**: Configurar alertas básicas (email/logs) para eventos críticos antes de FASE F:
- Kill-switch activado
- Tasa de fallas ≥ 20% en 1 hora
- Límites excedidos
- Almacenamiento no disponible

---

## 3. Riesgos de Seguridad y Compliance

### 3.1. Logs

**Descripción**: Logs pueden contener información sensible, PII, o datos que violen principios de privacidad o compliance.

**Nivel**: **BAJO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Logs estructurados sin PII: solo `handoff_id`, `session_id`, `timestamp`, `error_type`, `cause` genérico
- ✅ Evidencia técnica de no-PII documentada (`EVIDENCIA_INVARIANTES.md`)
- ✅ Separación de logs operativos vs errores
- ✅ No se registra: números telefónicos, contenido de mensajes, decisiones del Core, señales de Nectar

**Riesgo residual**: Muy bajo. El código no permite registrar PII. Logs son técnicos y agregados.

**Nota**: Logs del proveedor (Twilio) pueden contener PII. Requisitos contractuales deben especificar retención y eliminación de logs del proveedor.

---

### 3.2. Retención

**Descripción**: Datos pueden retenerse más tiempo del necesario, violando principios de minimización de datos o compliance.

**Nivel**: **BAJO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ TTL estricto de handoffs: ~5 minutos desde creación
- ✅ Borrado automático de handoffs expirados (cada 1 minuto)
- ✅ No hay persistencia de contenido, PII, o decisiones
- ✅ Logs en consola (no persistidos automáticamente, dependen de infraestructura)

**Riesgo residual**: Muy bajo. TTL corto y borrado automático limitan retención.

**Nota**: Retención de logs depende de infraestructura (stdout/stderr). En producción, se requiere política de retención de logs.

---

### 3.3. PII Indirecta

**Descripción**: Referencias abstractas (`user_ref`, `model_ref`) pueden correlacionarse con PII real mediante análisis de patrones o datos externos.

**Nivel**: **BAJO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Referencias abstractas no son números telefónicos directos
- ✅ No se almacena contenido que permita correlación
- ✅ TTL corto limita ventana de correlación
- ✅ Métricas agregadas (no desagregadas por usuario)

**Riesgo residual**: Bajo. Referencias abstractas y TTL corto limitan riesgo de correlación.

**Nota**: En arquitectura completa, el Chat maneja enmascaramiento. El WAM solo recibe referencias ya enmascaradas.

---

### 3.4. Webhooks Expuestos

**Descripción**: Endpoint de webhook (`/webhooks/twilio/status`) puede ser accesible públicamente sin autenticación adecuada, permitiendo inyección de eventos falsos.

**Nivel**: **MEDIO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Validación de firma HMAC de Twilio (si configurada `TWILIO_AUTH_TOKEN` o `WAM_WEBHOOK_SECRET`)
- ✅ Fail-closed: webhooks con firma inválida se rechazan (403)
- ✅ Validación de formato básico del payload
- ✅ Validación de estados conocidos (`queued`, `sent`, `delivered`, `failed`, `undelivered`)
- ✅ No se persiste contenido ni PII del webhook

**Riesgo residual**: Medio. Validación de firma HMAC es opcional (depende de configuración). Si no está configurada, webhook es vulnerable a inyección.

**Recomendación**: **OBLIGATORIO** configurar `TWILIO_AUTH_TOKEN` o `WAM_WEBHOOK_SECRET` antes de FASE F. Validar que firma HMAC está activa.

---

## 4. Riesgos de Proceso

### 4.1. Tentación de Escalar

**Descripción**: Presión comercial o éxito inicial puede llevar a relajar límites operativos (100/día → más) o escalar prematuramente antes de validar estabilidad.

**Nivel**: **ALTO**

**¿Aceptable en GO CONTROLADO?**: **NO** (pero mitigable)

**Mitigación activa**:
- ✅ Límites hardcodeados (requieren cambio de código y redeploy)
- ✅ Documentación explícita: GO CONTROLADO no es GO
- ✅ Criterios de salida documentados (`CRITERIOS_SALIDA_GO_CONTROLADO_A_GO.md`)
- ✅ Kill-switch permite rollback inmediato

**Riesgo residual**: Alto. La tentación de escalar es riesgo de proceso, no técnico. Requiere disciplina operativa.

**Recomendación**: Establecer proceso de gobernanza explícito:
- Cualquier cambio de límites requiere revisión de arquitecto de riesgo
- Escalar límites solo después de validar estabilidad por período mínimo (ej: 1 semana)
- Documentar justificación técnica (no comercial) para cambios

---

### 4.2. Presión de Negocio

**Descripción**: Presión comercial puede llevar a bypass de kill-switch, relajar controles, o acelerar transición a GO sin validación suficiente.

**Nivel**: **ALTO**

**¿Aceptable en GO CONTROLADO?**: **NO** (pero mitigable)

**Mitigación activa**:
- ✅ Kill-switch persistente no puede ser bypassado fácilmente (requiere código)
- ✅ Límites hardcodeados previenen relajación accidental
- ✅ Documentación de principios: "control, economía y silencio antes que continuidad total" (`RUNBOOK_INCIDENTES.md`)

**Riesgo residual**: Alto. Presión de negocio es riesgo organizacional, no técnico.

**Recomendación**: Establecer principios de gobernanza explícitos:
- Kill-switch solo se desactiva con justificación técnica (no comercial)
- Transición a GO requiere cumplimiento de criterios de salida documentados
- Arquitecto de riesgo tiene autoridad para bloquear cambios que violen principios

---

### 4.3. Bypass de Kill-Switch

**Descripción**: Kill-switch puede ser bypassado mediante modificación de código, configuración incorrecta, o error en verificación.

**Nivel**: **BAJO**

**¿Aceptable en GO CONTROLADO?**: **SÍ**

**Mitigación activa**:
- ✅ Verificación de kill-switch en múltiples puntos (`HandoffResolver`, `TwilioSender`)
- ✅ Kill-switch persistente sobrevive a reinicios
- ✅ Estado se recarga desde disco en cada consulta
- ✅ Auto-kill-switch activa si tasa de fallas ≥ 20% en 1 hora

**Riesgo residual**: Muy bajo. Múltiples puntos de verificación y persistencia previenen bypass accidental.

**Nota**: Bypass intencional mediante modificación de código es posible, pero requiere conocimiento técnico y acceso al código. En GO CONTROLADO, esto es aceptable.

---

## 5. Clasificación de Riesgos

### Resumen de Riesgos por Nivel

| Nivel | Cantidad | Riesgos |
|-------|----------|---------|
| **ALTO** | 2 | Tentación de escalar, Presión de negocio |
| **MEDIO** | 7 | Dependencia del proveedor, Latencia, Errores silenciosos, Errores humanos, Mala activación de rollback, Falta de observación activa, Webhooks expuestos |
| **BAJO** | 5 | Idempotencia, Kill-switch, Uso indebido de límites, Logs, Retención, PII indirecta, Bypass de kill-switch |

### Riesgos Aceptables vs No Aceptables

**Aceptables en GO CONTROLADO**: 12 de 14 riesgos

**No Aceptables (pero mitigables)**: 2 riesgos de proceso
- Tentación de escalar
- Presión de negocio

**Justificación**: Los riesgos no aceptables son de proceso/organizacionales, no técnicos. Se mitigan mediante gobernanza explícita y disciplina operativa.

---

## 6. Condiciones para FASE F

### Condiciones Obligatorias (Bloqueantes)

1. ✅ **Kill-switch persistente activo y probado**
2. ✅ **Límites operativos hardcodeados (100/día, 10 simultáneos)**
3. ✅ **Validación de firma HMAC en webhooks configurada** ⚠️ **REQUIERE VERIFICACIÓN**
4. ✅ **Auto-kill-switch activo (tasa de fallas ≥ 20% en 1 hora)**
5. ✅ **Observabilidad básica implementada (métricas y eventos)**

### Condiciones Recomendadas (No Bloqueantes)

1. ⚠️ **Alertas básicas configuradas** (email/logs para eventos críticos)
2. ⚠️ **Drill de rollback ejecutado** (validar procedimiento de rollback)
3. ⚠️ **Proceso de gobernanza documentado** (cambios de límites requieren revisión)

---

## 7. Decisión Final

### ✅ GO FASE F (con condiciones)

**Justificación**:

1. **Riesgos técnicos controlados**: Kill-switch persistente, límites operativos, fail-closed garantizado, idempotencia validada.

2. **Riesgos operativos mitigables**: Observabilidad básica implementada, múltiples mecanismos de rollback, protección de endpoint admin.

3. **Riesgos de seguridad aceptables**: Logs sin PII, TTL corto, validación de webhooks (requiere verificación de configuración).

4. **Riesgos de proceso requieren gobernanza**: Tentación de escalar y presión de negocio son riesgos organizacionales que requieren disciplina operativa, no bloquean FASE F.

5. **Límites operativos proporcionan seguridad**: 100 handoffs/día y 10 usuarios simultáneos limitan exposición a riesgos residuales.

**Condiciones para activación**:

- ⚠️ **VERIFICAR** que `TWILIO_AUTH_TOKEN` o `WAM_WEBHOOK_SECRET` está configurado antes de exponer webhook públicamente.
- ⚠️ **CONFIGURAR** alertas básicas (email/logs) para eventos críticos.
- ⚠️ **EJECUTAR** drill de rollback para validar procedimiento.
- ⚠️ **ESTABLECER** proceso de gobernanza explícito para cambios de límites.

**No se requiere**:
- ❌ Cambios de código
- ❌ Modificaciones de arquitectura
- ❌ Relajación de límites
- ❌ Nuevas features

---

## 8. Plan de Monitoreo Durante FASE F

### Métricas Críticas a Monitorear

1. **Tasa de éxito de ejecución del proveedor**: Debe mantenerse ≥ 90%
2. **Tasa de fallas**: Si ≥ 20% en 1 hora, auto-kill-switch debe activarse
3. **Límites excedidos**: Monitorear eventos `limit_exceeded`
4. **Latencia outbound**: p95 debe mantenerse ≤ 5 segundos
5. **Kill-switch activado**: Monitorear eventos de activación (manual o automática)

### Eventos Críticos a Alertar

1. Kill-switch activado (manual o automático)
2. Tasa de fallas ≥ 20% en 1 hora
3. Límites excedidos (100/día o 10 simultáneos)
4. Almacenamiento no disponible por > 30 segundos
5. Webhook con firma inválida (posible ataque)

### Revisión Semanal

Durante FASE F, revisar semanalmente:
- Métricas agregadas
- Eventos de auditoría
- Errores no mapeados
- Intentos de bypass o uso indebido

---

## 9. Criterios para Escalar Límites

**NO escalar límites durante FASE F** sin cumplir:

1. ✅ Estabilidad operativa por mínimo 1 semana sin incidentes críticos
2. ✅ Tasa de éxito ≥ 90% mantenida consistentemente
3. ✅ Latencia p95 ≤ 5 segundos mantenida
4. ✅ Revisión y aprobación de arquitecto de riesgo
5. ✅ Justificación técnica (no comercial) documentada

**Prohibido**:
- ❌ Escalar límites por presión comercial
- ❌ Escalar límites sin validar estabilidad
- ❌ Escalar límites sin revisión de riesgo

---

## 10. Conclusión

El sistema Elixir Platform está **técnicamente preparado** para FASE F (validación en campo) en modo GO CONTROLADO. Los riesgos residuales identificados son **aceptables** con las mitigaciones implementadas, excepto dos riesgos de proceso que requieren gobernanza explícita.

**La decisión es GO FASE F**, sujeto a verificación de condiciones obligatorias (especialmente validación de firma HMAC en webhooks) y establecimiento de proceso de gobernanza para prevenir escalado prematuro o relajación de controles.

**Principio rector**: En GO CONTROLADO, "control, economía y silencio antes que continuidad total". Cualquier presión para escalar o relajar controles debe ser resistida hasta validar estabilidad operativa suficiente.

---

**Documento aprobado por**: Arquitecto de Riesgo y Gobernanza  
**Fecha de aprobación**: 2024  
**Próxima revisión**: Al finalizar FASE F o ante cambio significativo de riesgos


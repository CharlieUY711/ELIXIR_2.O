# Decisión de Integración con Proveedor Real de WhatsApp

**Fecha**: 2024  
**Estado**: GO CONTROLADO — PRE-INTEGRACIÓN CON PROVEEDOR  
**Versión**: 1.0  
**Tipo**: Decisión Humana Explícita

---

## Resumen Ejecutivo

Este documento registra la decisión humana explícita sobre si avanzar o no a la integración con un proveedor real de WhatsApp para el Canal WhatsApp Enmascarado (WAM), bajo condiciones estrictas y con límites operativos iniciales.

**DECISIÓN**: **GO CONDICIONAL** — Se autoriza avanzar a la integración con proveedor real bajo condiciones estrictas documentadas en este documento.

**CONDICIÓN ABSOLUTA**: Ninguna integración ocurre sin cumplimiento de todos los requisitos técnicos y contractuales documentados. Si existe duda razonable, la decisión debe ser NO-GO.

---

## 1. Estado Técnico Actual (Checklist)

### 1.1. Hardening Operativo Cerrado

**Estado**: ✅ **SÍ** — Completado

**Evidencia**:
- Endpoint administrativo protegido con autenticación (`ADMIN_TOKEN`)
- Rate limiting implementado (10 resoluciones/min por IP, 5 creaciones/min por session_id)
- Validación de token mediante comparación constante en tiempo
- Fail-closed en todos los controles

**Referencia**: `/services/whatsapp-edge/docs/WAM_HARDENING_OPERATIVO.md`

### 1.2. Kill-Switch Persistente Activo

**Estado**: ✅ **SÍ** — Activo y operativo

**Evidencia**:
- Implementación `PersistentKillSwitch` reemplaza `InMemoryKillSwitch`
- Estado persistido en archivo local (`data/killswitch-state.json`)
- Estado sobrevive a restarts del servicio
- Modos soportados: `DROP` (rechazo inmediato) y `SILENCIO` (procesa sin ejecutar sender)
- Comportamiento fail-closed: inicia inactivo si hay error al cargar
- Tests: `tests/killswitch.test.ts` y `tests/killswitch_persistence.test.ts` pasan

**Referencia**: `/services/whatsapp-edge/docs/WAM_HARDENING_OPERATIVO.md` sección 2

### 1.3. Observabilidad Operativa Lista

**Estado**: ✅ **SÍ** — Lista

**Evidencia**:
- Logs separados por nivel: `info` (stdout) vs `error` (stderr)
- Métricas agregadas emitidas cada 1 minuto:
  - `handoffs_created_total`
  - `handoffs_resolved_total`
  - `handoffs_expired_total`
  - `handoffs_failed_total`
  - `killswitch_activations_total`
  - `provider_executions_success_total`
  - `provider_executions_failed_total`
  - `errors_by_category_total`
- NO registra PII, contenido de mensajes, números telefónicos ni decisiones del Core

**Referencia**: `/services/whatsapp-edge/docs/WAM_HARDENING_OPERATIVO.md` sección 3

### 1.4. Evidencia de Invariantes Disponible

**Estado**: ✅ **SÍ** — Disponible

**Evidencia**:
- **No PII**: Revisión de código, logs estructurados sin PII
- **No Persistencia de Decisiones**: WAM NO consulta al Core, recibe handoffs ya autorizados
- **Aislamiento del Core**: No hay imports del Core, no hay llamadas HTTP al Core
- **Kill-Switch Efectivo**: Modos DROP y SILENCIO operativos, persistencia verificada
- **Fail-Closed**: Todas las fallas resultan en rechazo, no en acceso no autorizado

**Referencia**: `/services/whatsapp-edge/docs/EVIDENCIA_INVARIANTES.md`

---

## 2. Evaluación de Riesgo Residual

### 2.1. Riesgos Técnicos Aceptados

#### 2.1.1. Dependencia Externa del Proveedor

**Descripción**: El WAM depende completamente del proveedor de WhatsApp para ejecutar handoffs. Si el proveedor falla, el WAM no puede operar.

**Impacto**: Alto — El WAM no puede cumplir su función principal si el proveedor falla.

**Mitigaciones**:
- ✅ Kill-switch operativo permite detención inmediata si fallas son masivas
- ✅ Monitoreo proactivo con alertas cuando tasa de fallas excede umbral
- ✅ SLA del proveedor con penalizaciones por incumplimiento (requisito contractual)
- ⚠️ Proveedor alternativo es opción futura (no requerido en GO CONTROLADO)

**Riesgo Residual**: **ACEPTABLE** con mitigaciones operativas y contractuales.

#### 2.1.2. Rate Limits del Proveedor

**Descripción**: El proveedor puede imponer límites de tasa que el WAM puede exceder bajo carga.

**Impacto**: Medio — Handoffs fallan con error de rate limit durante picos de carga.

**Mitigaciones**:
- ✅ Rate limiting en WAM antes de invocar proveedor (ya implementado)
- ✅ Documentación de límites del proveedor y diseño para no excederlos
- ✅ Escalado gradual de volumen para no exceder límites
- ✅ Detección de errores de rate limit y activación de kill-switch si es necesario

**Riesgo Residual**: **ACEPTABLE** con mitigaciones técnicas y operativas.

#### 2.1.3. Latencia del Proveedor

**Descripción**: El proveedor puede tener latencia alta que exceda el timeout de 10 segundos del WAM.

**Impacto**: Medio — Handoffs fallan con timeout, degradando UX.

**Mitigaciones**:
- ✅ Requisito de latencia p95 < 2 segundos (criterio de selección de proveedor)
- ✅ SLA de disponibilidad ≥ 99.5% (requisito contractual)
- ✅ Timeout configurable en WAM (10 segundos actual)
- ✅ Manejo de timeout con fail-closed (ya implementado)

**Riesgo Residual**: **ACEPTABLE** con requisitos contractuales y técnicos.

### 2.2. Riesgos Técnicos No Aceptables

#### 2.2.1. Violación de Invariante de No Exposición

**Descripción**: El proveedor puede exponer PII (números telefónicos, datos personales) en logs, métricas o respuestas de API.

**Impacto**: **CRÍTICO** — Violación de invariante de "no exposición de números telefónicos".

**Mitigaciones Requeridas**:
- ✅ Revisión de contrato: contrato debe prohibir exposición de PII
- ✅ Configuración de proveedor: configurar para no incluir PII en respuestas
- ✅ Filtrado en WAM: filtrar PII de respuestas antes de registrar eventos
- ✅ Auditoría de logs: revisar logs del proveedor para detectar exposición

**Criterio de Exclusión**: Si el proveedor no puede garantizar no exposición de PII, queda **EXCLUIDO AUTOMÁTICAMENTE**.

#### 2.2.2. Violación de Invariante de Uso Único

**Descripción**: El proveedor puede implementar reintentos automáticos que causen ejecuciones duplicadas.

**Impacto**: **ALTO** — Violación de invariante de "uso único de handoff".

**Mitigaciones Requeridas**:
- ✅ Idempotencia del proveedor: requisito mínimo absoluto
- ✅ Idempotency key: usar `handoff_id` como idempotency key en llamadas
- ✅ Validación de proveedor: verificar que no reintenta sin idempotencia
- ✅ Monitoreo: detectar ejecuciones duplicadas mediante eventos

**Criterio de Exclusión**: Si el proveedor no soporta idempotencia, queda **EXCLUIDO AUTOMÁTICAMENTE**.

#### 2.2.3. Requisitos Incompatibles con Arquitectura

**Descripción**: El proveedor puede exigir cambios arquitectónicos incompatibles con el WAM.

**Impacto**: **CRÍTICO** — Violación de principios arquitectónicos fundamentales.

**Criterios de Exclusión Automática**:
- ❌ Requiere almacenamiento de contenido
- ❌ Requiere exposición de números reales
- ❌ Requiere consulta al Core
- ❌ Requiere retries inteligentes desde el WAM
- ❌ Modifica flujo decisional
- ❌ No soporta fail-closed
- ❌ Requiere persistencia duradera

**Criterio de Exclusión**: Si el proveedor tiene cualquier requisito incompatible, queda **EXCLUIDO AUTOMÁTICAMENTE**.

### 2.3. Riesgos Contractuales

#### 2.3.1. Logs del Proveedor

**Descripción**: El proveedor puede almacenar logs de operaciones que incluyan PII, violando principios de privacidad.

**Requisitos Contractuales Obligatorios**:
- ✅ Retención de logs: tiempo máximo ≤ 30 días (preferiblemente)
- ✅ Contenido de logs: no debe incluir PII si es posible
- ✅ Acceso a logs: quién tiene acceso y bajo qué condiciones
- ✅ Eliminación de logs: proceso para eliminar logs a solicitud
- ✅ Cumplimiento normativo: GDPR, CCPA u otras regulaciones aplicables

**Riesgo Residual**: **ACEPTABLE** con requisitos contractuales explícitos.

#### 2.3.2. Retención de Mensajes

**Descripción**: El proveedor puede retener mensajes de conversación más allá de lo necesario.

**Requisitos Contractuales Obligatorios**:
- ✅ Retención de mensajes: tiempo máximo mínimo necesario
- ✅ Eliminación automática: proceso para eliminar mensajes automáticamente
- ✅ No almacenamiento opcional: opción de no almacenar mensajes si es posible
- ✅ Acceso a mensajes: quién tiene acceso y bajo qué condiciones
- ✅ Cumplimiento normativo: GDPR, CCPA u otras regulaciones aplicables

**Riesgo Residual**: **ACEPTABLE** con requisitos contractuales explícitos.

#### 2.3.3. Términos Incompatibles con Kill-Switch

**Descripción**: El proveedor puede tener términos que requieran procesamiento de todas las solicitudes, impidiendo kill-switch.

**Requisitos Contractuales Obligatorios**:
- ✅ Cancelación de operaciones: derecho a cancelar sin efectos secundarios
- ✅ Modo de mantenimiento: capacidad de detener procesamiento temporalmente
- ✅ Sin penalizaciones: no penalizaciones por cancelar operaciones
- ✅ Control operativo: WAM tiene control total sobre cuándo ejecutar o no

**Riesgo Residual**: **ACEPTABLE** con requisitos contractuales explícitos.

#### 2.3.4. Responsabilidad Ante Fallas

**Descripción**: El proveedor puede no asumir responsabilidad por fallas que afecten al WAM.

**Requisitos Contractuales Obligatorios**:
- ✅ SLA con penalizaciones: SLA de disponibilidad con penalizaciones por incumplimiento
- ✅ Notificación de fallas: obligación de notificar fallas proactivamente
- ✅ Responsabilidad limitada: límites de responsabilidad aceptables
- ✅ Proceso de resolución: proceso claro para resolver disputas y reclamaciones

**Riesgo Residual**: **ACEPTABLE** con requisitos contractuales explícitos.

### 2.4. Riesgos Operativos

#### 2.4.1. Vendor Lock-in

**Descripción**: La integración con un proveedor específico puede crear dependencia técnica que dificulte cambio a otro proveedor.

**Mitigación**:
- ✅ Arquitectura de sustituibilidad: el WAM ya usa `ISender` como interfaz abstracta
- ✅ Implementación intercambiable: diferentes proveedores implementan misma interfaz
- ✅ Contrato documentado: contrato `ISender` está documentado y es estable
- ✅ Pruebas de sustitución: validar que cambio de proveedor no requiere cambios en otros componentes

**Riesgo Residual**: **ACEPTABLE** con arquitectura actual.

#### 2.4.2. Pérdida de Capacidad de Auditoría

**Descripción**: Si el proveedor falla, puede perderse capacidad de auditoría de operaciones.

**Mitigación**:
- ✅ WAM registra eventos antes de invocar proveedor (handoff marcado como REDEEMED)
- ✅ Eventos de falla del proveedor se registran en WAM
- ✅ Kill-switch permite detención inmediata sin pérdida de auditoría

**Riesgo Residual**: **ACEPTABLE** con arquitectura actual.

---

## 3. Modelo de Integración Autorizado

### 3.1. Modelo Push (Webhook Inbound / API Outbound)

**Modelo Autorizado**: ✅ **SÍ** — Webhook Inbound / API Outbound (Push)

**Justificación**:
- ✅ Compatible con modelo request-driven síncrono del WAM
- ✅ Preserva invariantes del WAM
- ✅ Fail-closed natural: si API falla, WAM rechaza inmediatamente
- ✅ No requiere cambios arquitectónicos
- ✅ Usuario recibe respuesta inmediata

**Flujo Autorizado**:
1. Usuario accede a `handoff_url`
2. WAM resuelve handoff y marca como `REDEEMED`
3. WAM invoca API del proveedor (outbound) para iniciar conexión
4. Proveedor responde síncronamente con estado (éxito/fallo)
5. WAM retorna respuesta al usuario
6. Proveedor envía webhook (inbound) con confirmación final (opcional, para auditoría)

**Adaptaciones Necesarias**:
- ✅ Implementar `ISender` real (reemplazar `NoopSender`)
- ✅ Configurar credenciales del proveedor (API key, tokens)
- ✅ Configurar webhook endpoint (opcional, para auditoría)
- ✅ Manejar timeouts y errores del proveedor
- ✅ Filtrar PII de respuestas del proveedor antes de registrar eventos

**Adaptaciones NO Aceptables**:
- ❌ Modificar flujo de resolución de handoff
- ❌ Almacenar respuestas del proveedor más allá de eventos de auditoría
- ❌ Exponer detalles técnicos del proveedor en mensajes de error
- ❌ Implementar lógica de retry compleja (debe ser responsabilidad del proveedor)

### 3.2. Modelos Explícitamente Prohibidos

#### 3.2.1. Modelo Pull (Polling)

**Modelo Prohibido**: ❌ **NO** — Pull (Polling)

**Razones**:
- ❌ Requiere rediseño arquitectónico del WAM
- ❌ Viola principio de "ejecutor puro" (WAM tendría que gestionar estado de polling)
- ❌ Aumenta complejidad operativa sin beneficio claro
- ❌ No compatible con modelo request-driven síncrono

**Criterio de Exclusión**: Si el proveedor solo soporta Pull, queda **EXCLUIDO AUTOMÁTICAMENTE**.

#### 3.2.2. Modelos que Requieren Cambios Arquitectónicos

**Modelos Prohibidos**:
- ❌ Modelos que requieren almacenamiento de contenido
- ❌ Modelos que requieren exposición de números reales
- ❌ Modelos que requieren consulta al Core
- ❌ Modelos que requieren retries inteligentes desde el WAM
- ❌ Modelos que modifican flujo decisional
- ❌ Modelos que no soportan fail-closed
- ❌ Modelos que requieren persistencia duradera

**Criterio de Exclusión**: Si el proveedor requiere cualquier modelo prohibido, queda **EXCLUIDO AUTOMÁTICAMENTE**.

---

## 4. Límites Operativos Iniciales

### 4.1. Volumen Máximo Permitido

**Límite Inicial**: **100 handoffs por día**

**Justificación**:
- Permite validación operativa sin exponer a alto volumen
- Facilita detección temprana de problemas
- Permite activación de kill-switch sin impacto masivo
- Compatible con rate limiting actual del WAM (10 resoluciones/min por IP)

**Escalado Gradual**:
- Semana 1-2: 100 handoffs/día
- Semana 3-4: 500 handoffs/día (si no hay incidentes)
- Semana 5+: Revisión para aumentar límite (requiere aprobación explícita)

**Monitoreo**:
- Alertar si volumen excede 80% del límite diario
- Alertar si tasa de fallas excede 5% en ventana de 1 hora
- Activar kill-switch automáticamente si tasa de fallas excede 20% en ventana de 1 hora

### 4.2. Usuarios Reales Máximos

**Límite Inicial**: **10 usuarios reales simultáneos**

**Justificación**:
- Permite validación con usuarios reales sin exponer a gran escala
- Facilita soporte y resolución de problemas
- Permite recopilación de feedback cualitativo
- Compatible con límites de rate limiting actual

**Escalado Gradual**:
- Semana 1-2: 10 usuarios simultáneos
- Semana 3-4: 50 usuarios simultáneos (si no hay incidentes)
- Semana 5+: Revisión para aumentar límite (requiere aprobación explícita)

**Monitoreo**:
- Alertar si número de usuarios simultáneos excede 80% del límite
- Alertar si tasa de fallas por usuario excede 10% en ventana de 1 hora

### 4.3. Ventana Temporal de Validación

**Duración Mínima**: **30 días consecutivos**

**Justificación**:
- Permite validación de estabilidad operativa
- Permite detección de problemas intermitentes
- Permite validación de cumplimiento de SLA del proveedor
- Permite recopilación de métricas suficientes para decisión de escalado

**Criterios de Validación**:
- ✅ Tasa de éxito ≥ 95% durante 30 días consecutivos
- ✅ No más de 3 incidentes críticos durante 30 días
- ✅ Cumplimiento de SLA del proveedor ≥ 99.5% durante 30 días
- ✅ No violaciones de invariantes durante 30 días
- ✅ Kill-switch operativo y probado durante 30 días

**Revisión Post-Validación**:
- Si todos los criterios se cumplen: autorizar escalado gradual
- Si algún criterio no se cumple: extender ventana de validación o activar kill-switch

### 4.4. Kill-Switch: Cuándo Se Activa Sin Discusión

**Activación Automática Inmediata** (sin discusión):
1. **Tasa de fallas ≥ 20%** en ventana de 1 hora
2. **Violación de invariante detectada** (exposición de PII, violación de uso único, etc.)
3. **Falla total del proveedor** (0% de disponibilidad durante 5 minutos consecutivos)
4. **Detección de ejecuciones duplicadas** (violación de uso único)
5. **Detección de exposición de PII** en logs o respuestas del proveedor
6. **Modificación no autorizada del Core** (intento de modificar Core sellado)
7. **Pérdida de capacidad de auditoría** (eventos no registrados)

**Activación Manual Inmediata** (sin discusión):
- Cualquier señal de comportamiento inesperado que comprometa seguridad o integridad
- Cualquier violación de requisitos contractuales documentados
- Cualquier degradación arquitectónica detectada

**Procedimiento de Activación**:
1. Activar kill-switch inmediatamente (modo DROP)
2. Registrar evento de activación con causa
3. Notificar a responsables operacionales
4. Investigar causa raíz
5. Documentar incidente
6. No reanudar operación hasta resolución de causa y aprobación explícita

---

## 5. Criterios de Abort Inmediato (NO-GO)

### 5.1. Violaciones Técnicas

#### 5.1.1. Violación de Invariantes

**Criterio de Abort**:
- ❌ Exposición de números telefónicos o datos personales (PII)
- ❌ Almacenamiento de contenido de conversación
- ❌ Violación de uso único de handoffs
- ❌ Extensión de TTL más allá de 5 minutos
- ❌ Consulta directa al Core desde el WAM
- ❌ Modificación del Core sellado

**Acción**: Abort inmediato, activar kill-switch, revertir cambios, investigar causa, documentar incidente.

#### 5.1.2. Degradación Arquitectónica

**Criterio de Abort**:
- ❌ Modificación de contratos entre capas sin documentación
- ❌ Pérdida de capacidad de auditoría
- ❌ Violación de separación de responsabilidades
- ❌ Introducción de dependencias permanentes con proveedor

**Acción**: Abort inmediato, activar kill-switch, revertir cambios, investigar causa, documentar incidente.

#### 5.1.3. Fallas Críticas de Seguridad

**Criterio de Abort**:
- ❌ Exposición de información sensible en respuestas de error
- ❌ Bypass de capas sin autorización
- ❌ Compromiso de autenticación del endpoint administrativo
- ❌ Pérdida de control del kill-switch

**Acción**: Abort inmediato, activar kill-switch, revertir cambios, investigar causa, documentar incidente.

### 5.2. Violaciones Contractuales

#### 5.2.1. Incumplimiento de Requisitos Contractuales

**Criterio de Abort**:
- ❌ Proveedor no cumple requisitos contractuales documentados (logs, retención, kill-switch, etc.)
- ❌ Proveedor exige cambios incompatibles con arquitectura
- ❌ Proveedor no puede garantizar no exposición de PII
- ❌ Proveedor no soporta idempotencia

**Acción**: Abort inmediato, activar kill-switch, notificar a proveedor, documentar incumplimiento, evaluar cambio de proveedor.

#### 5.2.2. Incumplimiento de SLA

**Criterio de Abort**:
- ❌ Disponibilidad del proveedor < 99.5% durante 7 días consecutivos
- ❌ Latencia p95 > 2 segundos durante 7 días consecutivos
- ❌ Tasa de fallas > 5% durante 7 días consecutivos sin resolución

**Acción**: Abort inmediato si no hay resolución, activar kill-switch, notificar a proveedor, documentar incumplimiento, evaluar cambio de proveedor.

### 5.3. Señales de Comportamiento Inesperado

#### 5.3.1. Ejecuciones Duplicadas

**Criterio de Abort**:
- ❌ Detección de ejecuciones duplicadas de handoffs (violación de uso único)
- ❌ Handoffs reutilizados después de ser marcados como REDEEMED

**Acción**: Abort inmediato, activar kill-switch, investigar causa, documentar incidente.

#### 5.3.2. Exposición de PII

**Criterio de Abort**:
- ❌ Detección de PII en logs del proveedor
- ❌ Detección de PII en respuestas de API del proveedor
- ❌ Detección de números telefónicos en eventos de auditoría

**Acción**: Abort inmediato, activar kill-switch, eliminar PII expuesto, investigar causa, documentar incidente.

#### 5.3.3. Comportamiento Inesperado del Proveedor

**Criterio de Abort**:
- ❌ Proveedor modifica comportamiento sin notificación
- ❌ Proveedor introduce cambios incompatibles sin aviso
- ❌ Proveedor no responde a solicitudes de soporte críticas

**Acción**: Abort inmediato si no hay resolución, activar kill-switch, notificar a proveedor, documentar incidente.

### 5.4. Fallas del Proveedor

#### 5.4.1. Falla Total del Proveedor

**Criterio de Abort**:
- ❌ Disponibilidad del proveedor = 0% durante 30 minutos consecutivos
- ❌ Proveedor no responde a ninguna solicitud durante 30 minutos consecutivos

**Acción**: Abort inmediato, activar kill-switch, notificar a proveedor, documentar incidente, evaluar cambio de proveedor.

#### 5.4.2. Falla Crítica Recurrente

**Criterio de Abort**:
- ❌ Misma falla crítica ocurre 3 veces en 7 días sin resolución
- ❌ Tasa de fallas > 10% durante 3 días consecutivos sin resolución

**Acción**: Abort inmediato si no hay resolución, activar kill-switch, notificar a proveedor, documentar incidente, evaluar cambio de proveedor.

---

## 6. Decisión Humana Explícita

### 6.1. Decisión

**DECISIÓN**: **GO CONDICIONAL**

**Justificación**:
- ✅ Hardening operativo completado y verificado
- ✅ Kill-switch persistente activo y operativo
- ✅ Observabilidad operativa lista y verificada
- ✅ Evidencia de invariantes disponible y validada
- ✅ Modelo Push evaluado como técnicamente apto
- ✅ Riesgos residuales identificados y mitigaciones documentadas
- ⚠️ Requisitos contractuales y técnicos del proveedor deben cumplirse antes de integración

**Condiciones Estrictas para GO**:
1. Proveedor debe cumplir todos los requisitos mínimos absolutos documentados en `/docs/ANALISIS_EXPLORATORIO_INTEGRACION_PROVEEDOR_WHATSAPP.md`
2. Contrato debe incluir todos los requisitos contractuales documentados en este documento
3. Implementación debe preservar todos los invariantes del WAM
4. Límites operativos iniciales deben respetarse estrictamente
5. Criterios de abort inmediato deben activarse sin discusión si se detectan

**Si existe duda razonable sobre cumplimiento de condiciones**: La decisión debe ser **NO-GO**.

### 6.2. Responsable(s) de la Decisión

**Arquitecto Principal y Responsable de Release**: [Nombre del responsable]

**Responsabilidades**:
- Validar cumplimiento de condiciones técnicas obligatorias
- Validar cumplimiento de requisitos contractuales
- Autorizar o rechazar paso a integración con proveedor real
- Revisar y aprobar cualquier cambio a límites operativos iniciales

**Fecha de Decisión**: 2024

**Firma/Confirmación**: [Confirmación del responsable]

### 6.3. Condiciones de Revisión

**Revisión Obligatoria**:
- **Después de 30 días** de integración: Revisar cumplimiento de criterios de validación
- **Después de cualquier incidente crítico**: Revisar decisión y considerar abort
- **Después de cualquier violación de invariante**: Revisar decisión y considerar abort
- **Antes de escalar límites operativos**: Revisar y aprobar explícitamente

**Criterios para Revisión de Decisión**:
- Si se detecta violación de invariante: Revisar inmediatamente y considerar abort
- Si se detecta incumplimiento contractual: Revisar inmediatamente y considerar abort
- Si tasa de fallas excede 10% durante 7 días: Revisar inmediatamente y considerar abort
- Si proveedor no puede garantizar requisitos: Revisar inmediatamente y considerar abort

**Proceso de Revisión**:
1. Evaluar evidencia técnica y operativa
2. Consultar con responsables técnicos y operacionales
3. Documentar revisión con justificación
4. Decidir: continuar, abort, o modificar condiciones
5. Actualizar este documento si se modifica decisión

---

## 7. Próxima Fase Habilitada (si GO)

### 7.1. FASE E — Integración Controlada con Proveedor Real

**Estado Habilitado**: ✅ **SÍ** — FASE E habilitada condicionalmente

**Alcance Permitido de FASE E**:

#### 7.1.1. Selección y Evaluación de Proveedor

**Permitido**:
- ✅ Evaluación de proveedores específicos contra criterios documentados
- ✅ Pruebas técnicas de integración en ambiente de desarrollo
- ✅ Validación de cumplimiento de requisitos mínimos absolutos
- ✅ Negociación de contrato con requisitos contractuales documentados

**Prohibido**:
- ❌ Integración con proveedor que no cumple requisitos mínimos absolutos
- ❌ Firma de contrato sin requisitos contractuales documentados
- ❌ Integración en producción sin validación en desarrollo

#### 7.1.2. Implementación de Sender Real

**Permitido**:
- ✅ Implementar `ISender` real según interfaz existente
- ✅ Configurar credenciales del proveedor (API key, tokens)
- ✅ Manejar timeouts y errores del proveedor
- ✅ Filtrar PII de respuestas del proveedor antes de registrar eventos
- ✅ Configurar webhook endpoint (opcional, para auditoría)

**Prohibido**:
- ❌ Modificar interfaz `ISender` (rompería sustituibilidad)
- ❌ Almacenar respuestas del proveedor más allá de eventos de auditoría
- ❌ Exponer detalles técnicos del proveedor en mensajes de error
- ❌ Implementar lógica de retry compleja (debe ser responsabilidad del proveedor)

#### 7.1.3. Validación de Integración

**Permitido**:
- ✅ Pruebas de integración con proveedor en ambiente de desarrollo
- ✅ Validación de preservación de invariantes
- ✅ Validación de cumplimiento de límites operativos iniciales
- ✅ Validación de kill-switch con proveedor real
- ✅ Validación de filtrado de PII en eventos

**Prohibido**:
- ❌ Integración en producción sin validación en desarrollo
- ❌ Exceder límites operativos iniciales sin aprobación explícita
- ❌ Relajar kill-switch o invariantes
- ❌ Omitir validación de preservación de invariantes

#### 7.1.4. Despliegue Controlado

**Permitido**:
- ✅ Despliegue en producción con límites operativos iniciales estrictos
- ✅ Monitoreo activo de métricas y eventos
- ✅ Activación de kill-switch si se detectan problemas
- ✅ Escalado gradual según criterios documentados

**Prohibido**:
- ❌ Despliegue sin cumplimiento de todos los requisitos técnicos y contractuales
- ❌ Exceder límites operativos iniciales sin aprobación explícita
- ❌ Relajar kill-switch o invariantes
- ❌ Omitir monitoreo o activación de kill-switch

### 7.2. Alcance Explícitamente Prohibido

#### 7.2.1. Modificaciones Arquitectónicas

**Prohibido**:
- ❌ Modificar contratos entre capas (ISender, ITempStore, IHandoffResolver)
- ❌ Modificar flujo de resolución de handoff
- ❌ Modificar Elixir Core v1.0 (sellado e inmodificable)
- ❌ Introducir dependencias permanentes con proveedor

#### 7.2.2. Relajación de Controles

**Prohibido**:
- ❌ Relajar kill-switch o hacerlo opcional
- ❌ Relajar invariantes o hacerlos opcionales
- ❌ Relajar límites operativos iniciales sin aprobación explícita
- ❌ Omitir validación de preservación de invariantes

#### 7.2.3. Integración Sin Validación

**Prohibido**:
- ❌ Integración con proveedor que no cumple requisitos mínimos absolutos
- ❌ Integración sin contrato con requisitos contractuales documentados
- ❌ Integración en producción sin validación en desarrollo
- ❌ Integración sin validación de preservación de invariantes

---

## 8. Resumen Final

### 8.1. Estado del Sistema

**Estado Actual**: **GO CONTROLADO — PRE-INTEGRACIÓN CON PROVEEDOR**

**Hardening Operativo**: ✅ Completado
**Kill-Switch**: ✅ Persistente y activo
**Observabilidad**: ✅ Lista
**Invariantes**: ✅ Evidenciados y validados

### 8.2. Decisión

**DECISIÓN**: **GO CONDICIONAL**

**Condiciones Estrictas**:
1. Proveedor debe cumplir todos los requisitos mínimos absolutos
2. Contrato debe incluir todos los requisitos contractuales
3. Implementación debe preservar todos los invariantes
4. Límites operativos iniciales deben respetarse estrictamente
5. Criterios de abort inmediato deben activarse sin discusión

### 8.3. Próxima Fase

**FASE E**: Integración Controlada con Proveedor Real

**Alcance Permitido**: Documentado en sección 7.1
**Alcance Prohibido**: Documentado en sección 7.2

### 8.4. Principios Absolutos

**Ninguna integración ocurre sin**:
- ✅ Decisión humana explícita
- ✅ Cumplimiento de requisitos técnicos y contractuales
- ✅ Validación de preservación de invariantes
- ✅ Respeto a límites operativos iniciales
- ✅ Capacidad de abort inmediato sin discusión

**Si existe duda razonable**: La decisión debe ser **NO-GO**.

---

## 9. Versión y Control de Cambios

**VERSIÓN**: 1.0  
**FECHA DE CREACIÓN**: 2024  
**ÚLTIMA ACTUALIZACIÓN**: 2024

**CONTROL DE CAMBIOS**:
- Este documento solo puede ser modificado mediante proceso formal de gobernanza
- Cualquier modificación requiere aprobación del arquitecto principal y responsable de release
- Las modificaciones deben respetar el principio rector: GO es decisión humana explícita
- Las modificaciones no pueden relajar criterios sin justificación arquitectónica explícita

**DOCUMENTOS RELACIONADOS**:
- `/services/whatsapp-edge/docs/WAM_HARDENING_OPERATIVO.md`
- `/services/whatsapp-edge/docs/EVIDENCIA_INVARIANTES.md`
- `/docs/ANALISIS_EXPLORATORIO_INTEGRACION_PROVEEDOR_WHATSAPP.md`
- `/docs/CRITERIOS_SALIDA_GO_CONTROLADO_A_GO.md`

---

**FIN DEL DOCUMENTO**


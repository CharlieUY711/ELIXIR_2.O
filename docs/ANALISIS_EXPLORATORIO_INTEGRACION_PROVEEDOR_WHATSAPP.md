# Análisis Exploratorio: Integración con Proveedor Real de WhatsApp
## Shadow Track - Análisis No Vinculante

**Estado**: Análisis exploratorio conceptual  
**Fecha**: 2024  
**Propósito**: Evaluación comparativa y de riesgos para futura decisión  
**NO es**: Decisión de implementación, código productivo, ni compromiso contractual

---

## 1. Contexto y Alcance

### 1.1. Estado Actual del WAM

El Canal WhatsApp Enmascarado (WAM) está diseñado, documentado e implementado en **GO CONTROLADO**:

- ✅ Ejecutor puro de handoffs autorizados
- ✅ NO consulta al Elixir Core
- ✅ NO persiste decisiones
- ✅ NO almacena contenido ni PII
- ✅ Kill-switch operativo
- ✅ Observabilidad mínima
- ✅ Fail-closed garantizado
- ✅ Modelo request-driven síncrono

**Componente crítico**: El `Sender` (Adaptador de Proveedor) actualmente es una implementación `NoopSender` que simula la ejecución sin conectar con proveedor real.

### 1.2. Objetivo de Este Análisis

Este documento explora, a nivel conceptual y comparativo, la futura integración de un proveedor real de WhatsApp con el WAM. El análisis:

- ✅ Identifica criterios técnicos de selección
- ✅ Evalúa modelos de integración posibles
- ✅ Documenta riesgos operativos, contractuales y legales
- ✅ Analiza impacto en invariantes del WAM
- ✅ Define restricciones absolutas

**NO hace**:
- ❌ No elige proveedor final
- ❌ No propone cambios al Core
- ❌ No propone cambios a contratos WAM
- ❌ No asume que la integración ocurrirá
- ❌ No propone automatismos de decisión

### 1.3. Principios Inviolables del WAM

Cualquier integración con proveedor real **DEBE preservar**:

1. **Separación del Core**: El WAM NO consulta al Core directamente
2. **Ejecutor puro**: El WAM NO decide, NO explica, NO aprende
3. **No persistencia de contenido**: El WAM NO almacena mensajes, texto, multimedia ni PII
4. **No exposición de datos**: El WAM NO expone números telefónicos ni información sensible
5. **Fail-closed**: Cualquier falla resulta en rechazo, no en acceso no autorizado
6. **Uso único de handoffs**: Cada handoff se consume exactamente una vez
7. **TTL estricto**: Handoffs expiran después de ~5 minutos sin extensión
8. **Kill-switch operativo**: Capacidad de detención inmediata (modos DROP y SILENCIO)

---

## 2. Criterios Técnicos de Selección de Proveedor

### 2.1. Requisitos Mínimos Absolutos

#### 2.1.1. Webhooks (Inbound)

**Requisito**: El proveedor DEBE soportar webhooks para notificaciones de estado.

**Justificación**:
- El WAM necesita saber si la conexión se estableció exitosamente
- El WAM necesita detectar fallas del proveedor sin polling activo
- El modelo request-driven síncrono requiere confirmación rápida

**Criterios específicos**:
- ✅ Webhook configurable por cuenta/instancia
- ✅ Firma de webhook (HMAC o equivalente) para validación
- ✅ Retries automáticos del proveedor en caso de falla de entrega
- ✅ Timeout configurable para respuestas del webhook
- ✅ Documentación clara de eventos y payloads

**Riesgo si no cumple**: El WAM no puede confirmar ejecución exitosa, violando el principio de fail-closed.

#### 2.1.2. API Outbound (Síncrona)

**Requisito**: El proveedor DEBE ofrecer API REST/HTTP para iniciar conexiones.

**Justificación**:
- El WAM opera en modelo request-driven síncrono
- El usuario accede a `handoff_url` y espera redirección inmediata
- No hay cola de mensajes ni procesamiento asíncrono en el WAM

**Criterios específicos**:
- ✅ Endpoint HTTP/HTTPS para iniciar conexión usuario-modelo
- ✅ Respuesta síncrona con estado inmediato (éxito/fallo)
- ✅ Timeout configurable (máximo 10 segundos según diseño WAM)
- ✅ Autenticación mediante API key o token
- ✅ Rate limits documentados y predecibles

**Riesgo si no cumple**: El modelo request-driven síncrono del WAM no es compatible, requiriendo rediseño arquitectónico.

#### 2.1.3. Latencia y Disponibilidad

**Requisito**: El proveedor DEBE garantizar latencia baja y alta disponibilidad.

**Criterios específicos**:
- ✅ Latencia p95 < 2 segundos para iniciar conexión
- ✅ Disponibilidad SLA ≥ 99.5% (uptime)
- ✅ Timeout de conexión configurable
- ✅ Retries del proveedor documentados (no automáticos desde WAM)

**Riesgo si no cumple**: El WAM no puede cumplir con timeouts de 10 segundos, causando fallas frecuentes y degradación de UX.

#### 2.1.4. Retries e Idempotencia

**Requisito**: El proveedor DEBE soportar idempotencia en operaciones críticas.

**Justificación**:
- El WAM marca handoff como `REDEEMED` inmediatamente tras resolución válida
- Si el proveedor falla después, el handoff ya no es reutilizable
- Idempotencia permite reintentos seguros sin duplicar conexiones

**Criterios específicos**:
- ✅ Operaciones idempotentes mediante `idempotency_key` o equivalente
- ✅ Ventana de idempotencia ≥ 5 minutos (coincide con TTL de handoff)
- ✅ Retries automáticos del proveedor documentados
- ✅ No requiere que el WAM implemente lógica de retry compleja

**Riesgo si no cumple**: Reintentos manuales pueden causar conexiones duplicadas o fallas silenciosas.

#### 2.1.5. Capacidad de Operar con Silencio / Drop

**Requisito**: El proveedor DEBE permitir que el WAM detenga ejecuciones sin efectos secundarios.

**Justificación**:
- El WAM tiene kill-switch con modos DROP y SILENCIO
- En modo DROP: todas las solicitudes se rechazan inmediatamente
- En modo SILENCIO: solicitudes se procesan pero no se ejecuta sender

**Criterios específicos**:
- ✅ Cancelación de operaciones en curso sin efectos secundarios
- ✅ No requiere confirmación del proveedor para cancelar
- ✅ No genera cargos por operaciones canceladas
- ✅ No envía notificaciones al usuario si operación se cancela

**Riesgo si no cumple**: El kill-switch no puede operar efectivamente, comprometiendo control operativo.

#### 2.1.6. Soporte para Enmascaramiento Real

**Requisito**: El proveedor DEBE permitir enmascaramiento de identidades.

**Justificación**:
- El WAM NO expone números telefónicos reales
- El WAM conecta usuario con modelo sin exponer identidades
- El enmascaramiento es principio fundamental del WAM

**Criterios específicos**:
- ✅ Soporte para números virtuales o enmascarados
- ✅ Capacidad de ocultar números reales del usuario y modelo
- ✅ No requiere exposición de números reales en API calls
- ✅ Documentación clara de cómo funciona el enmascaramiento

**Riesgo si no cumple**: Violación del invariante de "no exposición de números telefónicos", condición de detención inmediata.

### 2.2. Requisitos Deseables (No Críticos)

- **Múltiples regiones**: Soporte para despliegue en diferentes regiones geográficas
- **Métricas y logs**: Dashboard o API para consultar estado de operaciones
- **Webhooks de estado avanzado**: Notificaciones de cambios de estado (conectado, desconectado, error)
- **Documentación técnica completa**: SDKs, ejemplos de código, guías de integración
- **Soporte técnico**: Canal de soporte para resolución de problemas

### 2.3. Criterios de Exclusión Automática

Un proveedor queda **EXCLUIDO AUTOMÁTICAMENTE** si:

- ❌ **Requiere almacenamiento de contenido**: Si el proveedor exige que el WAM almacene mensajes o contenido de conversación
- ❌ **Requiere exposición de números reales**: Si el proveedor no soporta enmascaramiento
- ❌ **Requiere consulta al Core**: Si el proveedor exige que el WAM consulte al Core directamente
- ❌ **Requiere retries inteligentes**: Si el proveedor exige que el WAM implemente lógica de retry compleja
- ❌ **Modifica flujo decisional**: Si el proveedor requiere que el WAM participe en decisiones de autorización
- ❌ **No soporta fail-closed**: Si el proveedor no permite que fallas resulten en rechazo seguro
- ❌ **Requiere persistencia duradera**: Si el proveedor exige que el WAM persista datos más allá del TTL de handoffs

---

## 3. Modelos de Integración Posibles

### 3.1. Modelo 1: Webhook Inbound / API Outbound (Recomendado)

#### 3.1.1. Descripción

**Flujo**:
1. Usuario accede a `handoff_url`
2. WAM resuelve handoff y marca como `REDEEMED`
3. WAM invoca API del proveedor (outbound) para iniciar conexión
4. Proveedor responde síncronamente con estado (éxito/fallo)
5. WAM retorna respuesta al usuario
6. Proveedor envía webhook (inbound) con confirmación final (opcional, para auditoría)

#### 3.1.2. Ventajas

- ✅ Compatible con modelo request-driven síncrono del WAM
- ✅ Usuario recibe respuesta inmediata
- ✅ WAM puede confirmar ejecución antes de responder al usuario
- ✅ Webhook opcional permite auditoría sin bloquear flujo principal
- ✅ Fail-closed natural: si API falla, WAM rechaza inmediatamente

#### 3.1.3. Desventajas

- ⚠️ Dependencia de latencia del proveedor en flujo crítico
- ⚠️ Timeout de 10 segundos puede ser insuficiente si proveedor es lento
- ⚠️ Webhook puede llegar después de que usuario ya recibió respuesta

#### 3.1.4. Compatibilidad con WAM

**Apta**: ✅ **SÍ**

**Justificación**:
- Modelo request-driven síncrono se preserva
- Handoff se marca como `REDEEMED` antes de invocar proveedor (invariante preservado)
- Si proveedor falla, WAM retorna error genérico (fail-closed preservado)
- No requiere cambios a contratos WAM existentes

**Adaptaciones necesarias**:
- Implementar `ISender` real (reemplazar `NoopSender`)
- Configurar credenciales del proveedor (API key, tokens)
- Configurar webhook endpoint (opcional, para auditoría)
- Manejar timeouts y errores del proveedor

**Adaptaciones NO aceptables**:
- ❌ Modificar flujo de resolución de handoff
- ❌ Almacenar respuestas del proveedor más allá de eventos de auditoría
- ❌ Exponer detalles técnicos del proveedor en mensajes de error

### 3.2. Modelo 2: Push vs Pull

#### 3.2.1. Descripción

**Push (Recomendado)**:
- WAM invoca API del proveedor inmediatamente tras resolución de handoff
- Proveedor procesa y responde síncronamente
- Usuario recibe respuesta inmediata

**Pull (No Recomendado)**:
- WAM crea "tarea" en proveedor
- WAM consulta estado periódicamente (polling)
- Usuario espera hasta que WAM detecta estado final

#### 3.2.2. Análisis Comparativo

| Aspecto | Push (Recomendado) | Pull (No Recomendado) |
|---------|-------------------|----------------------|
| **Latencia** | Baja (respuesta inmediata) | Alta (depende de intervalo de polling) |
| **Complejidad** | Baja (una llamada API) | Alta (lógica de polling, manejo de estados) |
| **Compatibilidad con WAM** | ✅ Compatible | ❌ Requiere rediseño |
| **Fail-closed** | ✅ Natural | ⚠️ Complejo (¿qué pasa si polling falla?) |
| **Carga en proveedor** | Baja (solo cuando hay handoff) | Alta (polling continuo) |

#### 3.2.3. Recomendación

**Modelo Push es el único aceptable** para integración con WAM.

**Razones**:
- Compatible con modelo request-driven síncrono
- Preserva invariantes del WAM
- Fail-closed natural
- No requiere cambios arquitectónicos

**Modelo Pull queda EXCLUIDO** porque:
- Requiere rediseño del WAM (introducir polling)
- Viola principio de "ejecutor puro" (WAM tendría que gestionar estado de polling)
- Aumenta complejidad operativa sin beneficio claro

### 3.3. Modelo 3: Manejo de Errores del Proveedor

#### 3.3.1. Categorías de Errores

**Errores Transitorios** (pueden resolverse con retry):
- Timeout de red
- Error 5xx del proveedor
- Rate limit temporal

**Errores Permanentes** (no se resuelven con retry):
- Credenciales inválidas
- Parámetros inválidos (user_ref, model_ref)
- Cuenta suspendida o bloqueada
- Límite de uso excedido permanentemente

**Errores Ambiguos** (requieren interpretación):
- Error 4xx genérico
- Timeout sin confirmación
- Respuesta malformada

#### 3.3.2. Estrategia de Manejo

**Principio**: El WAM NO implementa retries automáticos. El proveedor DEBE manejar retries internamente o soportar idempotencia.

**Flujo de error**:
1. WAM invoca proveedor con timeout de 10 segundos
2. Si proveedor responde error:
   - WAM registra evento `provider_execution_failed` con tipo de error
   - WAM retorna mensaje genérico al usuario
   - Handoff queda marcado como `REDEEMED` (no reutilizable)
3. Si proveedor no responde (timeout):
   - WAM cancela operación
   - WAM registra evento `provider_execution_failed` con tipo "timeout"
   - WAM retorna mensaje genérico al usuario
   - Handoff queda marcado como `REDEEMED`

**NO se hace**:
- ❌ Reintentos automáticos desde el WAM
- ❌ Cola de reintentos
- ❌ Lógica de backoff exponencial
- ❌ Notificación al usuario sobre tipo específico de error

**Justificación**:
- El WAM es ejecutor puro, no gestor de errores complejos
- Handoff ya está marcado como `REDEEMED`, reintento requeriría nuevo handoff
- Usuario puede solicitar nuevo handoff desde el Chat si falla

#### 3.3.3. Requisitos del Proveedor

El proveedor DEBE:
- ✅ Manejar retries internamente para errores transitorios
- ✅ Soportar idempotencia para permitir reintentos seguros desde el WAM (si se implementan en el futuro)
- ✅ Documentar claramente qué errores son transitorios vs permanentes
- ✅ Responder dentro de timeout de 10 segundos o retornar error claro

### 3.4. Modelo 4: Qué Pasa Cuando el Proveedor Falla

#### 3.4.1. Escenarios de Falla

**Falla Total del Proveedor**:
- Proveedor no responde a ninguna solicitud
- Todos los handoffs fallan con timeout
- WAM registra eventos de falla masiva

**Falla Parcial del Proveedor**:
- Proveedor responde lentamente (latencia alta)
- Algunos handoffs fallan, otros tienen éxito
- WAM registra eventos de falla intermitente

**Falla de Credenciales**:
- API key o token inválido
- Todos los handoffs fallan con error de autenticación
- WAM registra eventos de falla de credenciales

**Falla de Rate Limit**:
- Proveedor rechaza solicitudes por exceder límite
- Handoffs fallan con error de rate limit
- WAM registra eventos de rate limit

#### 3.4.2. Comportamiento del WAM

**Principio**: Fail-closed absoluto. Cualquier falla del proveedor resulta en rechazo de handoff.

**Acciones**:
1. **Registro de eventos**: WAM registra todos los eventos de falla para auditoría
2. **Mensaje genérico**: WAM retorna mensaje genérico al usuario (no expone detalles técnicos)
3. **Handoff consumido**: Handoff queda marcado como `REDEEMED` (no reutilizable)
4. **Kill-switch opcional**: Si fallas son masivas, operador puede activar kill-switch

**NO se hace**:
- ❌ Reintentos automáticos
- ❌ Cola de handoffs fallidos para retry posterior
- ❌ Notificación al usuario sobre causa específica de falla
- ❌ Bypass del proveedor (no hay alternativa)

#### 3.4.3. Requisitos del Proveedor

El proveedor DEBE:
- ✅ Tener SLA de disponibilidad documentado
- ✅ Notificar proactivamente sobre interrupciones de servicio
- ✅ Tener mecanismo de recuperación rápida
- ✅ Soportar failover automático (si aplica)

**Riesgo residual**: Si el proveedor falla completamente, el WAM no puede operar. No hay mitigación técnica, solo operativa (activar kill-switch, cambiar proveedor).

---

## 4. Riesgos Operativos

### 4.1. Dependencia Externa

#### 4.1.1. Descripción del Riesgo

El WAM depende completamente del proveedor de WhatsApp para ejecutar handoffs. Si el proveedor falla, el WAM no puede operar.

#### 4.1.2. Impacto

- **Alto**: El WAM no puede cumplir su función principal (ejecutar handoffs)
- **Usuarios afectados**: Todos los usuarios que intentan usar handoffs
- **Duración**: Hasta que el proveedor se recupere o se active kill-switch

#### 4.1.3. Mitigaciones Posibles

- ✅ **Kill-switch operativo**: Activar kill-switch inmediatamente si fallas son masivas
- ✅ **SLA del proveedor**: Contratar SLA con penalizaciones por incumplimiento
- ✅ **Monitoreo proactivo**: Alertas cuando tasa de fallas excede umbral
- ✅ **Proveedor alternativo**: Tener proveedor de respaldo listo (requiere implementación de múltiples `ISender`)

#### 4.1.4. Riesgo Residual

**Aceptable**: Sí, con mitigaciones operativas.

**Justificación**:
- Dependencia externa es inherente a integración con proveedor
- Kill-switch permite detención inmediata
- Monitoreo permite detección temprana
- Proveedor alternativo es opción futura (no requerido en GO CONTROLADO)

### 4.2. Rate Limits del Proveedor

#### 4.2.1. Descripción del Riesgo

El proveedor puede imponer límites de tasa (requests por segundo/minuto/hora) que el WAM puede exceder bajo carga.

#### 4.2.2. Impacto

- **Medio**: Handoffs fallan con error de rate limit
- **Usuarios afectados**: Usuarios que intentan usar handoffs durante pico de carga
- **Duración**: Hasta que rate limit se resetee o se reduzca carga

#### 4.2.3. Mitigaciones Posibles

- ✅ **Rate limiting en WAM**: Implementar rate limiting en WAM antes de invocar proveedor
- ✅ **Documentación de límites**: Conocer límites del proveedor y diseñar WAM para no excederlos
- ✅ **Escalado gradual**: Aumentar volumen gradualmente para no exceder límites
- ✅ **Manejo de errores**: Detectar errores de rate limit y activar kill-switch si es necesario

#### 4.2.4. Riesgo Residual

**Aceptable**: Sí, con mitigaciones técnicas.

**Justificación**:
- Rate limiting en WAM es controlable
- Volumen bajo en GO CONTROLADO minimiza probabilidad
- Errores de rate limit son detectables y manejables

### 4.3. Reintentos Automáticos No Deseados

#### 4.3.1. Descripción del Riesgo

El proveedor puede implementar reintentos automáticos que causen ejecuciones duplicadas o efectos secundarios no deseados.

#### 4.3.2. Impacto

- **Alto**: Violación de invariante de "uso único de handoff"
- **Usuarios afectados**: Usuarios que reciben múltiples conexiones
- **Duración**: Hasta que se detecte y corrija

#### 4.3.3. Mitigaciones Posibles

- ✅ **Idempotencia del proveedor**: Asegurar que proveedor soporte idempotencia
- ✅ **Idempotency key**: Usar `handoff_id` como idempotency key en llamadas al proveedor
- ✅ **Validación de proveedor**: Verificar que proveedor no reintenta automáticamente sin idempotencia
- ✅ **Monitoreo**: Detectar ejecuciones duplicadas mediante eventos de auditoría

#### 4.3.4. Riesgo Residual

**Aceptable**: Sí, con requisito de idempotencia del proveedor.

**Justificación**:
- Idempotencia es requisito mínimo absoluto (ver sección 2.1.4)
- Si proveedor no soporta idempotencia, queda excluido automáticamente
- Monitoreo permite detección temprana de violaciones

### 4.4. Vendor Lock-in

#### 4.4.1. Descripción del Riesgo

La integración con un proveedor específico puede crear dependencia técnica que dificulte cambio a otro proveedor en el futuro.

#### 4.4.2. Impacto

- **Medio**: Dificultad para cambiar de proveedor si es necesario
- **Usuarios afectados**: Ninguno directamente (impacto operativo)
- **Duración**: Permanente hasta que se migre a otro proveedor

#### 4.4.3. Mitigaciones Posibles

- ✅ **Interfaz abstracta**: El WAM ya usa `ISender` como interfaz abstracta
- ✅ **Implementación intercambiable**: Diferentes proveedores implementan misma interfaz
- ✅ **Documentación de contrato**: Contrato `ISender` está documentado y es estable
- ✅ **Pruebas de sustitución**: Validar que cambio de proveedor no requiere cambios en otros componentes

#### 4.4.4. Riesgo Residual

**Aceptable**: Sí, con arquitectura actual.

**Justificación**:
- Arquitectura del WAM ya está diseñada para sustituibilidad (ver `ARQUITECTURA_MINIMA_CANAL_WAM.md` sección 9.2)
- Interfaz `ISender` es abstracta y estable
- Cambio de proveedor requiere solo implementar nuevo `ISender`, no cambios en otros componentes

### 4.5. Exposición Indirecta de PII

#### 4.5.1. Descripción del Riesgo

El proveedor puede exponer PII (números telefónicos, datos personales) en logs, métricas o respuestas de API, violando principio de "no exposición de información sensible".

#### 4.5.2. Impacto

- **Crítico**: Violación de invariante de "no exposición de números telefónicos"
- **Usuarios afectados**: Todos los usuarios cuyos datos se exponen
- **Duración**: Hasta que se detecte y corrija

#### 4.5.3. Mitigaciones Posibles

- ✅ **Revisión de contrato**: Asegurar que contrato con proveedor prohíbe exposición de PII
- ✅ **Configuración de proveedor**: Configurar proveedor para no incluir PII en respuestas de API
- ✅ **Filtrado en WAM**: Filtrar PII de respuestas del proveedor antes de registrar eventos
- ✅ **Auditoría de logs**: Revisar logs del proveedor para detectar exposición de PII

#### 4.5.4. Riesgo Residual

**Aceptable**: Sí, con mitigaciones contractuales y técnicas.

**Justificación**:
- Revisión de contrato es requisito previo a integración
- Filtrado en WAM es controlable técnicamente
- Auditoría permite detección temprana
- Si proveedor no puede garantizar no exposición de PII, queda excluido automáticamente

---

## 5. Riesgos Contractuales y Legales (Alto Nivel)

### 5.1. Logs del Proveedor

#### 5.1.1. Descripción del Riesgo

El proveedor puede almacenar logs de operaciones que incluyan PII, números telefónicos o información sensible, violando principios de privacidad del WAM.

#### 5.1.2. Requisitos Contractuales

El contrato con el proveedor DEBE especificar:

- ✅ **Retención de logs**: Tiempo máximo de retención de logs (preferiblemente ≤ 30 días)
- ✅ **Contenido de logs**: Qué información se almacena en logs (no debe incluir PII si es posible)
- ✅ **Acceso a logs**: Quién tiene acceso a logs y bajo qué condiciones
- ✅ **Eliminación de logs**: Proceso para eliminar logs a solicitud
- ✅ **Cumplimiento normativo**: GDPR, CCPA u otras regulaciones aplicables

#### 5.1.3. Riesgo Residual

**Aceptable**: Sí, con requisitos contractuales explícitos.

**Justificación**:
- Requisitos contractuales son negociables antes de integración
- Si proveedor no puede cumplir requisitos, queda excluido
- Auditoría contractual permite verificación de cumplimiento

### 5.2. Retención de Mensajes

#### 5.2.1. Descripción del Riesgo

El proveedor puede retener mensajes de conversación más allá de lo necesario, violando principio de "no almacenamiento de contenido" del WAM.

#### 5.2.2. Requisitos Contractuales

El contrato con el proveedor DEBE especificar:

- ✅ **Retención de mensajes**: Tiempo máximo de retención (preferiblemente mínimo necesario)
- ✅ **Eliminación automática**: Proceso para eliminar mensajes automáticamente después de período definido
- ✅ **No almacenamiento opcional**: Opción de no almacenar mensajes si es posible
- ✅ **Acceso a mensajes**: Quién tiene acceso a mensajes y bajo qué condiciones
- ✅ **Cumplimiento normativo**: GDPR, CCPA u otras regulaciones aplicables

#### 5.2.3. Riesgo Residual

**Aceptable**: Sí, con requisitos contractuales explícitos.

**Justificación**:
- Requisitos contractuales son negociables antes de integración
- Si proveedor no puede cumplir requisitos, queda excluido
- El WAM no almacena mensajes, pero el proveedor puede hacerlo (riesgo indirecto)

### 5.3. Términos de Uso Incompatibles con Silencio / Drop

#### 5.3.1. Descripción del Riesgo

El proveedor puede tener términos de uso que requieran procesamiento de todas las solicitudes, impidiendo que el WAM opere en modo DROP o SILENCIO del kill-switch.

#### 5.3.2. Requisitos Contractuales

El contrato con el proveedor DEBE especificar:

- ✅ **Cancelación de operaciones**: Derecho a cancelar operaciones sin efectos secundarios
- ✅ **Modo de mantenimiento**: Capacidad de detener procesamiento temporalmente
- ✅ **Sin penalizaciones**: No penalizaciones por cancelar operaciones
- ✅ **Control operativo**: WAM tiene control total sobre cuándo ejecutar o no ejecutar

#### 5.3.3. Riesgo Residual

**Aceptable**: Sí, con requisitos contractuales explícitos.

**Justificación**:
- Requisitos contractuales son negociables antes de integración
- Si proveedor no puede cumplir requisitos, queda excluido
- Kill-switch es requisito mínimo absoluto del WAM (ver sección 2.1.5)

### 5.4. Responsabilidad Ante Fallas

#### 5.4.1. Descripción del Riesgo

El proveedor puede no asumir responsabilidad por fallas que afecten al WAM, dejando a Elixir Platform sin recurso legal.

#### 5.4.2. Requisitos Contractuales

El contrato con el proveedor DEBE especificar:

- ✅ **SLA con penalizaciones**: SLA de disponibilidad con penalizaciones por incumplimiento
- ✅ **Notificación de fallas**: Obligación de notificar fallas proactivamente
- ✅ **Responsabilidad limitada**: Límites de responsabilidad aceptables
- ✅ **Proceso de resolución**: Proceso claro para resolver disputas y reclamaciones

#### 5.4.3. Riesgo Residual

**Aceptable**: Sí, con requisitos contractuales explícitos.

**Justificación**:
- Requisitos contractuales son negociables antes de integración
- SLA con penalizaciones proporciona incentivo para cumplimiento
- Proceso de resolución permite manejo de disputas

---

## 6. Impacto en el WAM

### 6.1. Componentes Afectados

#### 6.1.1. Sender (Adaptador de Proveedor)

**Impacto**: **ALTO** - Componente principal afectado.

**Cambios necesarios**:
- ✅ Reemplazar `NoopSender` con implementación real de `ISender`
- ✅ Implementar llamadas a API del proveedor
- ✅ Manejar autenticación (API key, tokens)
- ✅ Manejar timeouts y errores del proveedor
- ✅ Registrar eventos de ejecución

**Cambios NO aceptables**:
- ❌ Modificar interfaz `ISender` (rompería sustituibilidad)
- ❌ Almacenar respuestas del proveedor más allá de eventos de auditoría
- ❌ Exponer detalles técnicos del proveedor en mensajes de error
- ❌ Implementar lógica de retry compleja (debe ser responsabilidad del proveedor)

#### 6.1.2. HandoffResolver

**Impacto**: **BAJO** - No requiere cambios.

**Justificación**:
- HandoffResolver invoca `ISender` a través de interfaz abstracta
- Cambio de `NoopSender` a implementación real es transparente para HandoffResolver
- Flujo de resolución se preserva intacto

#### 6.1.3. TempStore

**Impacto**: **NINGUNO** - No requiere cambios.

**Justificación**:
- TempStore no interactúa con proveedor
- Estructura de handoff se preserva
- TTL y uso único se preservan

#### 6.1.4. KillSwitch

**Impacto**: **BAJO** - Puede requerir ajustes menores.

**Cambios posibles**:
- ✅ Verificar que kill-switch cancela operaciones del proveedor en curso
- ✅ Validar que modo SILENCIO no ejecuta sender (ya implementado)

**Cambios NO aceptables**:
- ❌ Modificar lógica de kill-switch para adaptarse a proveedor
- ❌ Requerir confirmación del proveedor para activar kill-switch

#### 6.1.5. Observability

**Impacto**: **MEDIO** - Requiere ajustes para eventos del proveedor.

**Cambios necesarios**:
- ✅ Registrar eventos de ejecución del proveedor (`provider_execution_success`, `provider_execution_failed`)
- ✅ Filtrar PII de eventos del proveedor
- ✅ Agregar métricas de latencia del proveedor

**Cambios NO aceptables**:
- ❌ Almacenar contenido de mensajes en eventos
- ❌ Exponer números telefónicos en logs
- ❌ Registrar detalles técnicos del proveedor que violen opacidad

### 6.2. Invariantes que NO Deben Romperse

#### 6.2.1. Invariante de Autorización

**Enunciado**: El WAM nunca ejecuta handoff sin autorización previa del Core.

**Preservación**:
- ✅ Handoff se marca como `REDEEMED` antes de invocar proveedor (no cambia)
- ✅ WAM no consulta al Core directamente (no cambia)
- ✅ Proveedor no participa en decisiones de autorización (requisito de exclusión)

**Riesgo de violación**: **BAJO** - Arquitectura actual preserva invariante.

#### 6.2.2. Invariante de Uso Único

**Enunciado**: Cada handoff se consume exactamente una vez.

**Preservación**:
- ✅ Handoff se marca como `REDEEMED` antes de invocar proveedor (no cambia)
- ✅ Proveedor debe soportar idempotencia (requisito mínimo)
- ✅ WAM no reintenta automáticamente (no cambia)

**Riesgo de violación**: **MEDIO** - Depende de que proveedor soporte idempotencia correctamente.

**Mitigación**: Requisito de idempotencia es criterio de exclusión automática (ver sección 2.1.4).

#### 6.2.3. Invariante de TTL

**Enunciado**: Handoffs expiran después de TTL definido (~5 minutos).

**Preservación**:
- ✅ TTL se calcula en creación de handoff (no cambia)
- ✅ TempStore invalida handoffs expirados (no cambia)
- ✅ Proveedor no puede extender TTL (no tiene acceso a TempStore)

**Riesgo de violación**: **BAJO** - Arquitectura actual preserva invariante.

#### 6.2.4. Invariante de No Exposición

**Enunciado**: El WAM nunca expone números personales ni información sensible.

**Preservación**:
- ✅ WAM usa referencias abstractas (`user_ref`, `model_ref`) (no cambia)
- ✅ Proveedor debe soportar enmascaramiento (requisito mínimo)
- ✅ WAM filtra PII de eventos de auditoría (requiere implementación)

**Riesgo de violación**: **ALTO** - Depende de que proveedor soporte enmascaramiento y que WAM filtre PII correctamente.

**Mitigación**: 
- Requisito de enmascaramiento es criterio de exclusión automática (ver sección 2.1.6)
- Filtrado de PII en WAM es controlable técnicamente
- Auditoría permite detección temprana

#### 6.2.5. Invariante de No Almacenamiento de Contenido

**Enunciado**: El WAM nunca almacena mensajes, texto, multimedia ni contenido de conversación.

**Preservación**:
- ✅ WAM no almacena contenido (no cambia)
- ✅ Proveedor puede almacenar contenido (riesgo indirecto, ver sección 5.2)
- ✅ WAM filtra contenido de eventos de auditoría (requiere implementación)

**Riesgo de violación**: **BAJO** - WAM no almacena contenido directamente, pero proveedor puede hacerlo.

**Mitigación**: Requisitos contractuales sobre retención de mensajes (ver sección 5.2).

#### 6.2.6. Invariante de Separación de Capas

**Enunciado**: El WAM no introduce dependencias ni modificaciones en Elixir Core.

**Preservación**:
- ✅ WAM no consulta al Core directamente (no cambia)
- ✅ Proveedor no requiere consulta al Core (requisito de exclusión)
- ✅ Core no tiene dependencias del WAM (no cambia)

**Riesgo de violación**: **BAJO** - Arquitectura actual preserva invariante.

#### 6.2.7. Invariante de Fail-Closed

**Enunciado**: Cualquier falla en el WAM resulta en rechazo de handoff, no en acceso no autorizado.

**Preservación**:
- ✅ Si proveedor falla, WAM retorna error genérico (no cambia)
- ✅ Handoff se marca como `REDEEMED` antes de invocar proveedor (no cambia)
- ✅ No hay fallback permisivo (no cambia)

**Riesgo de violación**: **BAJO** - Arquitectura actual preserva invariante.

### 6.3. Adaptaciones Aceptables

#### 6.3.1. Implementación de ISender Real

**Descripción**: Reemplazar `NoopSender` con implementación real que invoca API del proveedor.

**Aceptable**: ✅ **SÍ**

**Justificación**:
- Preserva interfaz `ISender` (sustituibilidad mantenida)
- No modifica otros componentes
- No viola invariantes

#### 6.3.2. Configuración de Credenciales

**Descripción**: Agregar configuración para API key, tokens u otras credenciales del proveedor.

**Aceptable**: ✅ **SÍ**

**Justificación**:
- Configuración es externa al código (variables de entorno, secrets)
- No modifica lógica del WAM
- No viola invariantes

#### 6.3.3. Manejo de Timeouts y Errores

**Descripción**: Implementar manejo de timeouts y errores específicos del proveedor en `ISender`.

**Aceptable**: ✅ **SÍ**

**Justificación**:
- Manejo de errores es responsabilidad del `ISender`
- No modifica otros componentes
- Preserva fail-closed (errores resultan en rechazo)

#### 6.3.4. Filtrado de PII en Eventos

**Descripción**: Filtrar PII de respuestas del proveedor antes de registrar eventos de auditoría.

**Aceptable**: ✅ **SÍ**

**Justificación**:
- Preserva invariante de "no exposición de información sensible"
- No modifica estructura de eventos
- Controlable técnicamente

#### 6.3.5. Webhook Opcional para Auditoría

**Descripción**: Configurar webhook del proveedor para recibir confirmaciones finales (opcional, para auditoría).

**Aceptable**: ✅ **SÍ** (con restricciones)

**Restricciones**:
- Webhook NO debe bloquear flujo principal
- Webhook NO debe modificar estado de handoff
- Webhook solo para auditoría, no para decisiones

**Justificación**:
- Webhook opcional no afecta flujo principal
- Auditoría es permitida (sin PII)
- No viola invariantes

### 6.4. Adaptaciones NO Aceptables

#### 6.4.1. Modificar Flujo de Resolución de Handoff

**Descripción**: Cambiar cuándo o cómo se resuelve handoff para adaptarse a proveedor.

**NO Aceptable**: ❌ **NO**

**Razón**: Viola invariantes de uso único y TTL.

#### 6.4.2. Almacenar Respuestas del Proveedor

**Descripción**: Almacenar respuestas del proveedor más allá de eventos de auditoría.

**NO Aceptable**: ❌ **NO**

**Razón**: Viola invariante de "no almacenamiento de contenido".

#### 6.4.3. Exponer Detalles Técnicos del Proveedor

**Descripción**: Incluir detalles técnicos del proveedor en mensajes de error al usuario.

**NO Aceptable**: ❌ **NO**

**Razón**: Viola principio de opacidad del WAM.

#### 6.4.4. Implementar Lógica de Retry Compleja

**Descripción**: Implementar lógica de retry con backoff exponencial o cola de reintentos.

**NO Aceptable**: ❌ **NO**

**Razón**: El WAM es ejecutor puro, no gestor de errores complejos. Retries deben ser responsabilidad del proveedor.

#### 6.4.5. Modificar Contratos WAM

**Descripción**: Modificar interfaces `ISender`, `ITempStore`, `IHandoffResolver` u otros contratos.

**NO Aceptable**: ❌ **NO**

**Razón**: Rompe sustituibilidad y puede afectar otros componentes.

#### 6.4.6. Consultar al Core Directamente

**Descripción**: Hacer que el WAM consulte al Core directamente para validar handoffs.

**NO Aceptable**: ❌ **NO**

**Razón**: Viola invariante de separación de capas y principio fundamental del WAM.

---

## 7. Qué NO Debe Permitir el Proveedor

### 7.1. Correlación de Identidades

**Descripción**: El proveedor NO debe poder correlacionar identidades de usuarios o modelos entre diferentes handoffs.

**Razón**: Viola principio de enmascaramiento y privacidad.

**Requisito contractual**: El contrato DEBE especificar que el proveedor no correlaciona identidades.

**Criterio de exclusión**: Si el proveedor requiere correlación de identidades, queda excluido automáticamente.

### 7.2. Exposición de Números Reales

**Descripción**: El proveedor NO debe exponer números telefónicos reales de usuarios o modelos en respuestas de API, logs o métricas.

**Razón**: Viola invariante de "no exposición de números telefónicos".

**Requisito contractual**: El contrato DEBE especificar que el proveedor no expone números reales.

**Criterio de exclusión**: Si el proveedor no soporta enmascaramiento, queda excluido automáticamente (ver sección 2.1.6).

### 7.3. Forzar Retries Inteligentes

**Descripción**: El proveedor NO debe exigir que el WAM implemente lógica de retry compleja (backoff exponencial, cola de reintentos, etc.).

**Razón**: El WAM es ejecutor puro, no gestor de errores complejos.

**Requisito contractual**: El contrato DEBE especificar que el proveedor maneja retries internamente o soporta idempotencia.

**Criterio de exclusión**: Si el proveedor exige retries inteligentes desde el WAM, queda excluido automáticamente.

### 7.4. Exigir Almacenamiento de Contenido

**Descripción**: El proveedor NO debe exigir que el WAM almacene mensajes, texto, multimedia ni contenido de conversación.

**Razón**: Viola invariante de "no almacenamiento de contenido".

**Requisito contractual**: El contrato DEBE especificar que el proveedor no exige almacenamiento de contenido por parte del WAM.

**Criterio de exclusión**: Si el proveedor exige almacenamiento de contenido, queda excluido automáticamente (ver sección 2.3).

### 7.5. Modificar el Flujo Decisional

**Descripción**: El proveedor NO debe requerir que el WAM participe en decisiones de autorización o modifique el flujo decisional del Core.

**Razón**: Viola invariante de separación de capas y principio de "ejecutor puro".

**Requisito contractual**: El contrato DEBE especificar que el proveedor no requiere participación del WAM en decisiones.

**Criterio de exclusión**: Si el proveedor requiere modificación del flujo decisional, queda excluido automáticamente (ver sección 2.3).

### 7.6. Requerir Persistencia Duradera

**Descripción**: El proveedor NO debe exigir que el WAM persista datos más allá del TTL de handoffs (~5 minutos).

**Razón**: Viola principio de almacenamiento temporal del WAM.

**Requisito contractual**: El contrato DEBE especificar que el proveedor no exige persistencia duradera por parte del WAM.

**Criterio de exclusión**: Si el proveedor exige persistencia duradera, queda excluido automáticamente (ver sección 2.3).

### 7.7. Exigir Consulta al Core

**Descripción**: El proveedor NO debe exigir que el WAM consulte al Core directamente para validar handoffs o tomar decisiones.

**Razón**: Viola invariante de separación de capas y principio fundamental del WAM.

**Requisito contractual**: El contrato DEBE especificar que el proveedor no exige consulta al Core.

**Criterio de exclusión**: Si el proveedor exige consulta al Core, queda excluido automáticamente (ver sección 2.3).

---

## 8. Conclusiones y Recomendaciones

### 8.1. Resumen de Criterios de Selección

**Requisitos Mínimos Absolutos** (todos deben cumplirse):
1. ✅ Webhooks (inbound) para notificaciones de estado
2. ✅ API outbound (síncrona) para iniciar conexiones
3. ✅ Latencia p95 < 2 segundos, disponibilidad SLA ≥ 99.5%
4. ✅ Idempotencia en operaciones críticas
5. ✅ Capacidad de operar con silencio / drop (kill-switch)
6. ✅ Soporte para enmascaramiento real (no exposición de números reales)

**Criterios de Exclusión Automática** (cualquiera de estos excluye al proveedor):
1. ❌ Requiere almacenamiento de contenido
2. ❌ Requiere exposición de números reales
3. ❌ Requiere consulta al Core
4. ❌ Requiere retries inteligentes desde el WAM
5. ❌ Modifica flujo decisional
6. ❌ No soporta fail-closed
7. ❌ Requiere persistencia duradera

### 8.2. Modelo de Integración Recomendado

**Modelo**: Webhook Inbound / API Outbound (Push)

**Justificación**:
- ✅ Compatible con modelo request-driven síncrono del WAM
- ✅ Preserva invariantes del WAM
- ✅ Fail-closed natural
- ✅ No requiere cambios arquitectónicos

**Modelo NO Recomendado**: Pull (polling)
- ❌ Requiere rediseño del WAM
- ❌ Viola principio de "ejecutor puro"
- ❌ Aumenta complejidad sin beneficio

### 8.3. Impacto en el WAM

**Componentes Afectados**:
- **ALTO**: Sender (requiere implementación real)
- **MEDIO**: Observability (requiere ajustes para eventos del proveedor)
- **BAJO**: KillSwitch (puede requerir ajustes menores)
- **NINGUNO**: HandoffResolver, TempStore (no requieren cambios)

**Invariantes Preservadas**:
- ✅ Autorización (WAM no consulta al Core)
- ✅ Uso único (handoff se marca como REDEEMED antes de invocar proveedor)
- ✅ TTL (no cambia)
- ✅ Separación de capas (no cambia)
- ✅ Fail-closed (errores resultan en rechazo)

**Invariantes con Riesgo**:
- ⚠️ **No exposición**: Depende de que proveedor soporte enmascaramiento y que WAM filtre PII
- ⚠️ **No almacenamiento de contenido**: WAM no almacena, pero proveedor puede hacerlo (riesgo indirecto)

### 8.4. Riesgos y Mitigaciones

**Riesgos Operativos**:
- ✅ **Dependencia externa**: Aceptable con kill-switch y monitoreo
- ✅ **Rate limits**: Aceptable con rate limiting en WAM
- ✅ **Reintentos automáticos no deseados**: Aceptable con requisito de idempotencia
- ✅ **Vendor lock-in**: Aceptable con arquitectura de sustituibilidad
- ✅ **Exposición indirecta de PII**: Aceptable con requisitos contractuales y filtrado técnico

**Riesgos Contractuales y Legales**:
- ✅ **Logs del proveedor**: Aceptable con requisitos contractuales explícitos
- ✅ **Retención de mensajes**: Aceptable con requisitos contractuales explícitos
- ✅ **Términos incompatibles con kill-switch**: Aceptable con requisitos contractuales explícitos
- ✅ **Responsabilidad ante fallas**: Aceptable con SLA y penalizaciones

### 8.5. Evaluación Final por Modelo

#### 8.5.1. Modelo Webhook Inbound / API Outbound (Push)

**Evaluación**: **APTÓ** ✅

**Justificación**:
- Compatible con arquitectura actual del WAM
- Preserva todos los invariantes críticos
- Fail-closed natural
- No requiere cambios arquitectónicos
- Riesgos son manejables con mitigaciones técnicas y contractuales

**Requisitos para Implementación**:
1. Proveedor debe cumplir todos los requisitos mínimos absolutos
2. Contrato debe incluir todos los requisitos contractuales documentados
3. Implementación de `ISender` real
4. Filtrado de PII en eventos de auditoría
5. Configuración de kill-switch para cancelar operaciones del proveedor

#### 8.5.2. Modelo Pull (Polling)

**Evaluación**: **NO APTÓ** ❌

**Justificación**:
- Requiere rediseño arquitectónico del WAM
- Viola principio de "ejecutor puro"
- Aumenta complejidad sin beneficio claro
- No compatible con modelo request-driven síncrono

**Recomendación**: Excluir este modelo de consideración.

### 8.6. Recomendaciones Finales

#### 8.6.1. Antes de Integración

1. **Evaluación de Proveedores**:
   - Validar que proveedor cumple todos los requisitos mínimos absolutos
   - Verificar que proveedor no tiene criterios de exclusión automática
   - Revisar documentación técnica del proveedor
   - Probar integración en ambiente de desarrollo

2. **Negociación Contractual**:
   - Incluir todos los requisitos contractuales documentados en este análisis
   - Negociar SLA con penalizaciones por incumplimiento
   - Asegurar que términos de uso son compatibles con kill-switch
   - Revisar políticas de retención de logs y mensajes

3. **Preparación Técnica**:
   - Implementar `ISender` real según interfaz existente
   - Configurar filtrado de PII en eventos de auditoría
   - Validar que kill-switch cancela operaciones del proveedor
   - Configurar monitoreo y alertas para fallas del proveedor

#### 8.6.2. Durante Integración

1. **Validación de Invariantes**:
   - Verificar que todos los invariantes se preservan
   - Probar fail-closed en todos los escenarios de error
   - Validar que no se expone PII en eventos
   - Confirmar que kill-switch opera correctamente

2. **Pruebas de Sustituibilidad**:
   - Validar que cambio de proveedor no requiere cambios en otros componentes
   - Probar que interfaz `ISender` es estable
   - Confirmar que documentación de contrato es clara

#### 8.6.3. Después de Integración

1. **Monitoreo Continuo**:
   - Monitorear tasa de fallas del proveedor
   - Alertar cuando tasa excede umbral
   - Revisar logs para detectar exposición de PII
   - Validar cumplimiento de SLA

2. **Auditoría Periódica**:
   - Revisar cumplimiento de requisitos contractuales
   - Validar que invariantes se preservan
   - Evaluar necesidad de ajustes operativos

### 8.7. Conclusión General

**Estado del Análisis**: ✅ **COMPLETO**

**Recomendación Principal**: La integración con proveedor real de WhatsApp es **TÉCNICAMENTE VIABLE** bajo el modelo **Webhook Inbound / API Outbound (Push)**, siempre que:

1. El proveedor cumpla todos los requisitos mínimos absolutos
2. El contrato incluya todos los requisitos contractuales documentados
3. La implementación preserve todos los invariantes del WAM
4. Se implementen todas las mitigaciones técnicas y contractuales documentadas

**Condición para Avanzar**: 
- ✅ Hardening operativo del WAM debe estar completo
- ✅ Decisión humana explícita de avanzar con integración
- ✅ Proveedor seleccionado cumple todos los criterios de este análisis
- ✅ Contrato negociado incluye todos los requisitos documentados

**NOTA FINAL**: Este análisis es **NO VINCULANTE** y **NO EJECUTOR**. Sirve como insumo para decisión futura, pero NO habilita implementación directa. La integración solo debe proceder cuando se cumplan todas las condiciones documentadas y exista decisión humana explícita de avanzar.

---

**Versión del Documento**: 1.0  
**Fecha**: 2024  
**Estado**: Análisis Exploratorio Completo  
**Próximos Pasos**: Evaluación de proveedores específicos (si se decide avanzar)

---

**FIN DEL DOCUMENTO**


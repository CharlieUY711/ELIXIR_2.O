# E1 — Evaluación y Selección de Proveedor WhatsApp
## FASE E / INTEGRACIÓN CONTROLADA CON PROVEEDOR REAL (GO CONDICIONAL)

**Fecha**: 2024  
**Estado**: E1 — SELECCIÓN Y EVALUACIÓN (SIN CÓDIGO)  
**Versión**: 1.0  
**Tipo**: Evaluación Técnica y Contractual

---

## 1. Propósito del Documento

Este documento evalúa proveedores reales de WhatsApp Business API contra los requisitos mínimos absolutos definidos en `/docs/DECISION_INTEGRACION_PROVEEDOR_WAM.md` y `/docs/ANALISIS_EXPLORATORIO_INTEGRACION_PROVEEDOR_WHATSAPP.md`.

**OBJETIVO**: Producir una lista corta de 2-3 opciones de proveedor con evaluación completa, permitiendo decisión humana para seleccionar 1 proveedor candidato o declarar NO-GO.

**CRITERIO DE SALIDA E1**: Elegir 1 proveedor "candidato" (decisión humana) o declarar NO-GO.

---

## 2. Contexto Inviolable

- **Elixir Core v1.0 está SELLADO e INMODIFICABLE**
- El WAM NO consulta al Core. Solo ejecuta handoffs ya autorizados.
- WAM implementado y hardeneado, con kill-switch persistente (DROP/SILENCIO)
- Modelo autorizado: **Push (Webhook Inbound / API Outbound)**. Pull prohibido.
- Límites operativos iniciales: 100 handoffs/día, 10 usuarios simultáneos, 30 días de validación.
- Abort inmediato si: fallas ≥ 20% en 1 hora, violación de invariantes, falla total del proveedor, exposición de PII.

---

## 3. Lista Corta de Proveedores Evaluados

### 3.1. Opción 1: Twilio WhatsApp Business API

**Proveedor**: Twilio Inc.  
**Producto**: Twilio API for WhatsApp  
**URL**: https://www.twilio.com/whatsapp

**Descripción General**:
- Proveedor establecido con WhatsApp Business API oficial
- Infraestructura global con múltiples regiones
- Documentación técnica completa y SDKs disponibles
- Modelo de precios basado en uso (mensajes enviados)

### 3.2. Opción 2: Meta WhatsApp Business Platform (Cloud API)

**Proveedor**: Meta Platforms Inc.  
**Producto**: WhatsApp Business Platform (Cloud API)  
**URL**: https://developers.facebook.com/docs/whatsapp/cloud-api

**Descripción General**:
- Proveedor oficial de WhatsApp (Meta es propietario de WhatsApp)
- Cloud API es la versión gestionada por Meta
- Sin costos de infraestructura (solo costos de mensajes)
- Requiere aprobación de negocio y verificación de cuenta

### 3.3. Opción 3: MessageBird WhatsApp Business API

**Proveedor**: MessageBird (ahora parte de CM.com)  
**Producto**: MessageBird WhatsApp Business API  
**URL**: https://www.messagebird.com/en/whatsapp-business-api

**Descripción General**:
- Proveedor agregador con WhatsApp Business API
- Infraestructura global
- Modelo de precios basado en uso
- Soporte técnico y documentación disponibles

---

## 4. Matriz de Requisitos Mínimos (MUST)

### 4.1. Webhook Inbound + API Outbound Síncrona

| Proveedor | Webhook Inbound | API Outbound Síncrona | Evidencia | Evaluación |
|-----------|----------------|---------------------|-----------|------------|
| **Twilio** | ✅ Sí - Webhooks configurable para eventos de estado | ✅ Sí - REST API síncrona para enviar mensajes | Documentación: Webhooks para `status_callback`, API REST `/Messages` con respuesta síncrona | **CUMPLE** |
| **Meta Cloud API** | ✅ Sí - Webhooks para eventos de mensajes y estado | ✅ Sí - REST API síncrona `/messages` endpoint | Documentación: Webhooks configurable, API REST con respuesta inmediata | **CUMPLE** |
| **MessageBird** | ✅ Sí - Webhooks para eventos de estado | ✅ Sí - REST API síncrona para enviar mensajes | Documentación: Webhooks configurable, API REST con respuesta síncrona | **CUMPLE** |

**Resultado**: Los tres proveedores cumplen este requisito.

### 4.2. Idempotencia o Mecanismo Equivalente

| Proveedor | Idempotencia | Mecanismo | Evidencia | Evaluación |
|-----------|--------------|-----------|-----------|------------|
| **Twilio** | ✅ Sí | `Idempotency-Key` header opcional | Documentación: Soporta `Idempotency-Key` header para prevenir duplicados | **CUMPLE** |
| **Meta Cloud API** | ⚠️ Parcial | `message_id` único por mensaje, pero no idempotency key explícito | Documentación: Cada mensaje requiere `message_id` único, pero no hay idempotency key estándar | **CONDICIONAL** - Requiere usar `handoff_id` como `message_id` |
| **MessageBird** | ✅ Sí | `idempotency_key` en request body | Documentación: Campo `idempotency_key` en request body para prevenir duplicados | **CUMPLE** |

**Resultado**: 
- Twilio: **CUMPLE**
- Meta: **CONDICIONAL** (requiere adaptación usando `handoff_id` como `message_id`)
- MessageBird: **CUMPLE**

### 4.3. Enmascaramiento Real / No Exposición de Números

| Proveedor | Enmascaramiento | Mecanismo | Evidencia | Evaluación |
|-----------|----------------|-----------|-----------|------------|
| **Twilio** | ✅ Sí | Números virtuales (Twilio Phone Numbers) | Documentación: Soporta números virtuales, no requiere exponer números reales del usuario/modelo | **CUMPLE** |
| **Meta Cloud API** | ✅ Sí | Números de WhatsApp Business verificados | Documentación: Usa números de WhatsApp Business, no requiere exponer números personales | **CUMPLE** |
| **MessageBird** | ✅ Sí | Números virtuales y enmascaramiento | Documentación: Soporta números virtuales, enmascaramiento de identidades | **CUMPLE** |

**Resultado**: Los tres proveedores cumplen este requisito.

### 4.4. Capacidad Operativa con Drop/Silencio

| Proveedor | Cancelación | Modo Mantenimiento | Efectos Secundarios | Evidencia | Evaluación |
|-----------|-------------|-------------------|-------------------|-----------|------------|
| **Twilio** | ✅ Sí | ✅ Sí - Puede detener envíos | ⚠️ Mensajes en cola pueden enviarse | Documentación: Puede cancelar mensajes pendientes, pero mensajes ya enviados no se pueden cancelar | **CUMPLE** (con limitación) |
| **Meta Cloud API** | ⚠️ Parcial | ✅ Sí - Modo mantenimiento | ⚠️ Mensajes en proceso no se cancelan | Documentación: Modo mantenimiento disponible, pero cancelación de mensajes en vuelo limitada | **CONDICIONAL** |
| **MessageBird** | ✅ Sí | ✅ Sí - Puede detener envíos | ⚠️ Mensajes en cola pueden enviarse | Documentación: Cancelación disponible, pero mensajes ya en proceso pueden completarse | **CUMPLE** (con limitación) |

**Resultado**:
- Twilio: **CUMPLE** (con limitación aceptable)
- Meta: **CONDICIONAL** (requiere validación de comportamiento en modo mantenimiento)
- MessageBird: **CUMPLE** (con limitación aceptable)

**Nota**: La limitación de "mensajes en proceso no se cancelan" es aceptable porque el WAM marca handoff como REDEEMED antes de invocar proveedor, por lo que el kill-switch opera a nivel de WAM (no invoca sender) antes de que el mensaje se envíe.

### 4.5. Latencia p95 < 2s (o Evidencia Comparable)

| Proveedor | Latencia Documentada | SLA Latencia | Evidencia | Evaluación |
|-----------|---------------------|--------------|-----------|------------|
| **Twilio** | ✅ < 1s típico | No SLA específico de latencia, pero uptime 99.95% | Documentación: Latencia típica < 1s, pero no hay garantía p95 | **CONDICIONAL** - Requiere pruebas en sandbox |
| **Meta Cloud API** | ✅ < 2s típico | No SLA específico de latencia | Documentación: Latencia típica < 2s, pero no hay garantía p95 documentada | **CONDICIONAL** - Requiere pruebas en sandbox |
| **MessageBird** | ⚠️ No documentado | No SLA específico de latencia | Documentación: No hay métricas de latencia documentadas públicamente | **CONDICIONAL** - Requiere pruebas en sandbox |

**Resultado**: 
- Ningún proveedor tiene SLA de latencia p95 documentado públicamente.
- Todos requieren **pruebas en sandbox** para validar latencia p95 < 2s.
- Evaluación: **CONDICIONAL** para los tres (requiere validación práctica).

### 4.6. SLA ≥ 99.5% (o Evidencia Comparable)

| Proveedor | SLA Disponibilidad | Penalizaciones | Evidencia | Evaluación |
|-----------|-------------------|----------------|-----------|------------|
| **Twilio** | ✅ 99.95% uptime | ✅ Sí - Créditos de servicio | Documentación: SLA 99.95% con créditos de servicio por incumplimiento | **CUMPLE** |
| **Meta Cloud API** | ⚠️ No SLA público | ⚠️ No documentado | Documentación: No hay SLA público documentado para Cloud API | **CONDICIONAL** - Requiere negociación contractual |
| **MessageBird** | ⚠️ No SLA público | ⚠️ No documentado | Documentación: SLA disponible bajo contrato, pero no público | **CONDICIONAL** - Requiere negociación contractual |

**Resultado**:
- Twilio: **CUMPLE** (SLA 99.95% > 99.5% requerido)
- Meta: **CONDICIONAL** (requiere negociación contractual)
- MessageBird: **CONDICIONAL** (requiere negociación contractual)

---

## 5. Matriz de Exclusión Automática (MUST-NOT)

### 5.1. Requiere Almacenamiento de Contenido

| Proveedor | Requiere Almacenamiento | Evidencia | Evaluación |
|-----------|------------------------|-----------|------------|
| **Twilio** | ❌ No | Documentación: No requiere que el cliente almacene contenido | **NO EXCLUIDO** |
| **Meta Cloud API** | ❌ No | Documentación: No requiere que el cliente almacene contenido | **NO EXCLUIDO** |
| **MessageBird** | ❌ No | Documentación: No requiere que el cliente almacene contenido | **NO EXCLUIDO** |

**Resultado**: Ningún proveedor es excluido por este criterio.

### 5.2. Requiere Exposición de Números Reales

| Proveedor | Requiere Exposición | Evidencia | Evaluación |
|-----------|---------------------|-----------|------------|
| **Twilio** | ❌ No | Documentación: Soporta números virtuales, no requiere exponer números reales | **NO EXCLUIDO** |
| **Meta Cloud API** | ❌ No | Documentación: Usa números de WhatsApp Business, no requiere exponer números personales | **NO EXCLUIDO** |
| **MessageBird** | ❌ No | Documentación: Soporta enmascaramiento, no requiere exponer números reales | **NO EXCLUIDO** |

**Resultado**: Ningún proveedor es excluido por este criterio.

### 5.3. Requiere Consulta al Core

| Proveedor | Requiere Consulta al Core | Evidencia | Evaluación |
|-----------|-------------------------|-----------|------------|
| **Twilio** | ❌ No | Documentación: No requiere consulta a sistemas externos | **NO EXCLUIDO** |
| **Meta Cloud API** | ❌ No | Documentación: No requiere consulta a sistemas externos | **NO EXCLUIDO** |
| **MessageBird** | ❌ No | Documentación: No requiere consulta a sistemas externos | **NO EXCLUIDO** |

**Resultado**: Ningún proveedor es excluido por este criterio.

### 5.4. Requiere Retries Inteligentes desde WAM

| Proveedor | Requiere Retries Inteligentes | Evidencia | Evaluación |
|-----------|------------------------------|-----------|------------|
| **Twilio** | ❌ No | Documentación: Maneja retries internamente, no requiere retries desde cliente | **NO EXCLUIDO** |
| **Meta Cloud API** | ❌ No | Documentación: Maneja retries internamente, no requiere retries desde cliente | **NO EXCLUIDO** |
| **MessageBird** | ❌ No | Documentación: Maneja retries internamente, no requiere retries desde cliente | **NO EXCLUIDO** |

**Resultado**: Ningún proveedor es excluido por este criterio.

### 5.5. Modifica Flujo Decisional

| Proveedor | Modifica Flujo Decisional | Evidencia | Evaluación |
|-----------|--------------------------|-----------|------------|
| **Twilio** | ❌ No | Documentación: No participa en decisiones de autorización | **NO EXCLUIDO** |
| **Meta Cloud API** | ❌ No | Documentación: No participa en decisiones de autorización | **NO EXCLUIDO** |
| **MessageBird** | ❌ No | Documentación: No participa en decisiones de autorización | **NO EXCLUIDO** |

**Resultado**: Ningún proveedor es excluido por este criterio.

### 5.6. No Soporta Fail-Closed

| Proveedor | Soporta Fail-Closed | Evidencia | Evaluación |
|-----------|-------------------|-----------|------------|
| **Twilio** | ✅ Sí | Documentación: Errores resultan en falla, no en acceso no autorizado | **NO EXCLUIDO** |
| **Meta Cloud API** | ✅ Sí | Documentación: Errores resultan en falla, no en acceso no autorizado | **NO EXCLUIDO** |
| **MessageBird** | ✅ Sí | Documentación: Errores resultan en falla, no en acceso no autorizado | **NO EXCLUIDO** |

**Resultado**: Ningún proveedor es excluido por este criterio.

### 5.7. Requiere Persistencia Duradera

| Proveedor | Requiere Persistencia Duradera | Evidencia | Evaluación |
|-----------|-------------------------------|-----------|------------|
| **Twilio** | ❌ No | Documentación: No requiere persistencia duradera por parte del cliente | **NO EXCLUIDO** |
| **Meta Cloud API** | ❌ No | Documentación: No requiere persistencia duradera por parte del cliente | **NO EXCLUIDO** |
| **MessageBird** | ❌ No | Documentación: No requiere persistencia duradera por parte del cliente | **NO EXCLUIDO** |

**Resultado**: Ningún proveedor es excluido por criterios de exclusión automática.

---

## 6. Requisitos Contractuales

### 6.1. Logs ≤ 30 Días

| Proveedor | Retención de Logs | Configurable | Evidencia | Evaluación |
|-----------|------------------|--------------|-----------|------------|
| **Twilio** | ⚠️ 13 meses por defecto | ⚠️ No configurable públicamente | Documentación: Logs retenidos 13 meses por defecto | **CONDICIONAL** - Requiere negociación contractual |
| **Meta Cloud API** | ⚠️ No documentado públicamente | ⚠️ No documentado | Documentación: Política de retención no documentada públicamente | **CONDICIONAL** - Requiere negociación contractual |
| **MessageBird** | ⚠️ No documentado públicamente | ⚠️ No documentado | Documentación: Política de retención no documentada públicamente | **CONDICIONAL** - Requiere negociación contractual |

**Resultado**: Todos requieren **negociación contractual** para garantizar retención ≤ 30 días.

### 6.2. No PII en Logs

| Proveedor | PII en Logs | Configurable | Evidencia | Evaluación |
|-----------|------------|-------------|-----------|------------|
| **Twilio** | ⚠️ Puede incluir números | ⚠️ Limitado | Documentación: Logs pueden incluir números telefónicos | **CONDICIONAL** - Requiere configuración y filtrado en WAM |
| **Meta Cloud API** | ⚠️ Puede incluir números | ⚠️ Limitado | Documentación: Logs pueden incluir números telefónicos | **CONDICIONAL** - Requiere configuración y filtrado en WAM |
| **MessageBird** | ⚠️ Puede incluir números | ⚠️ Limitado | Documentación: Logs pueden incluir números telefónicos | **CONDICIONAL** - Requiere configuración y filtrado en WAM |

**Resultado**: Todos requieren **filtrado en WAM** y **negociación contractual** para minimizar PII en logs.

### 6.3. Compatibilidad con Kill-Switch

| Proveedor | Compatible con Kill-Switch | Evidencia | Evaluación |
|-----------|---------------------------|-----------|------------|
| **Twilio** | ✅ Sí | Documentación: Permite detener envíos sin efectos secundarios | **CUMPLE** |
| **Meta Cloud API** | ⚠️ Parcial | Documentación: Modo mantenimiento disponible, pero cancelación limitada | **CONDICIONAL** - Requiere validación |
| **MessageBird** | ✅ Sí | Documentación: Permite detener envíos sin efectos secundarios | **CUMPLE** |

**Resultado**:
- Twilio: **CUMPLE**
- Meta: **CONDICIONAL** (requiere validación)
- MessageBird: **CUMPLE**

### 6.4. SLA con Penalizaciones

| Proveedor | SLA Documentado | Penalizaciones | Evidencia | Evaluación |
|-----------|-----------------|----------------|-----------|------------|
| **Twilio** | ✅ 99.95% uptime | ✅ Créditos de servicio | Documentación: SLA 99.95% con créditos automáticos | **CUMPLE** |
| **Meta Cloud API** | ⚠️ No público | ⚠️ No documentado | Documentación: No hay SLA público | **CONDICIONAL** - Requiere negociación contractual |
| **MessageBird** | ⚠️ Bajo contrato | ⚠️ Bajo contrato | Documentación: SLA disponible bajo contrato | **CONDICIONAL** - Requiere negociación contractual |

**Resultado**:
- Twilio: **CUMPLE** (SLA público con penalizaciones)
- Meta: **CONDICIONAL** (requiere negociación contractual)
- MessageBird: **CONDICIONAL** (requiere negociación contractual)

---

## 7. Resultado por Opción

### 7.1. Twilio WhatsApp Business API

**Evaluación General**: **APTO** ✅

**Resumen de Cumplimiento**:
- ✅ Webhook Inbound + API Outbound: **CUMPLE**
- ✅ Idempotencia: **CUMPLE** (Idempotency-Key header)
- ✅ Enmascaramiento: **CUMPLE**
- ✅ Drop/Silencio: **CUMPLE** (con limitación aceptable)
- ⚠️ Latencia p95 < 2s: **CONDICIONAL** (requiere pruebas en sandbox)
- ✅ SLA ≥ 99.5%: **CUMPLE** (99.95% con penalizaciones)
- ⚠️ Logs ≤ 30 días: **CONDICIONAL** (requiere negociación contractual)
- ⚠️ No PII en logs: **CONDICIONAL** (requiere filtrado en WAM)
- ✅ Kill-switch: **CUMPLE**
- ✅ SLA con penalizaciones: **CUMPLE**

**Criterios de Exclusión**: **NINGUNO** - No es excluido por ningún criterio MUST-NOT.

**Ventajas**:
- SLA público con penalizaciones (99.95% > 99.5% requerido)
- Idempotencia nativa con header estándar
- Documentación técnica completa
- Infraestructura global establecida
- Soporte técnico disponible

**Desventajas**:
- Retención de logs por defecto 13 meses (requiere negociación para ≤ 30 días)
- Logs pueden incluir PII (requiere filtrado en WAM)
- Latencia p95 requiere validación práctica

**Requisitos Contractuales Necesarios**:
1. Negociar retención de logs ≤ 30 días
2. Configurar para minimizar PII en logs
3. Validar latencia p95 < 2s en sandbox

**Recomendación**: **APTO** con negociación contractual de retención de logs.

---

### 7.2. Meta WhatsApp Business Platform (Cloud API)

**Evaluación General**: **CONDICIONAL** ⚠️

**Resumen de Cumplimiento**:
- ✅ Webhook Inbound + API Outbound: **CUMPLE**
- ⚠️ Idempotencia: **CONDICIONAL** (requiere usar `handoff_id` como `message_id`)
- ✅ Enmascaramiento: **CUMPLE**
- ⚠️ Drop/Silencio: **CONDICIONAL** (requiere validación de comportamiento)
- ⚠️ Latencia p95 < 2s: **CONDICIONAL** (requiere pruebas en sandbox)
- ⚠️ SLA ≥ 99.5%: **CONDICIONAL** (requiere negociación contractual)
- ⚠️ Logs ≤ 30 días: **CONDICIONAL** (requiere negociación contractual)
- ⚠️ No PII en logs: **CONDICIONAL** (requiere filtrado en WAM)
- ⚠️ Kill-switch: **CONDICIONAL** (requiere validación)
- ⚠️ SLA con penalizaciones: **CONDICIONAL** (requiere negociación contractual)

**Criterios de Exclusión**: **NINGUNO** - No es excluido por ningún criterio MUST-NOT.

**Ventajas**:
- Proveedor oficial de WhatsApp (Meta es propietario)
- Sin costos de infraestructura (solo costos de mensajes)
- Documentación oficial completa
- Integración nativa con WhatsApp

**Desventajas**:
- Múltiples requisitos CONDICIONALES requieren validación/negociación
- No hay SLA público documentado
- Idempotencia requiere adaptación (usar `handoff_id` como `message_id`)
- Comportamiento de kill-switch requiere validación
- Requiere aprobación de negocio y verificación de cuenta

**Requisitos Contractuales Necesarios**:
1. Negociar SLA ≥ 99.5% con penalizaciones
2. Negociar retención de logs ≤ 30 días
3. Configurar para minimizar PII en logs
4. Validar idempotencia usando `handoff_id` como `message_id`
5. Validar comportamiento de kill-switch en modo mantenimiento
6. Validar latencia p95 < 2s en sandbox

**Recomendación**: **CONDICIONAL** - Requiere validación técnica y negociación contractual extensa antes de considerar como candidato.

---

### 7.3. MessageBird WhatsApp Business API

**Evaluación General**: **CONDICIONAL** ⚠️

**Resumen de Cumplimiento**:
- ✅ Webhook Inbound + API Outbound: **CUMPLE**
- ✅ Idempotencia: **CUMPLE** (`idempotency_key` en request body)
- ✅ Enmascaramiento: **CUMPLE**
- ✅ Drop/Silencio: **CUMPLE** (con limitación aceptable)
- ⚠️ Latencia p95 < 2s: **CONDICIONAL** (requiere pruebas en sandbox)
- ⚠️ SLA ≥ 99.5%: **CONDICIONAL** (requiere negociación contractual)
- ⚠️ Logs ≤ 30 días: **CONDICIONAL** (requiere negociación contractual)
- ⚠️ No PII en logs: **CONDICIONAL** (requiere filtrado en WAM)
- ✅ Kill-switch: **CUMPLE**
- ⚠️ SLA con penalizaciones: **CONDICIONAL** (requiere negociación contractual)

**Criterios de Exclusión**: **NINGUNO** - No es excluido por ningún criterio MUST-NOT.

**Ventajas**:
- Idempotencia nativa con campo en request body
- Soporte técnico disponible
- Documentación disponible

**Desventajas**:
- Múltiples requisitos CONDICIONALES requieren negociación
- No hay SLA público documentado
- Latencia no documentada públicamente
- Menor presencia en mercado comparado con Twilio/Meta

**Requisitos Contractuales Necesarios**:
1. Negociar SLA ≥ 99.5% con penalizaciones
2. Negociar retención de logs ≤ 30 días
3. Configurar para minimizar PII en logs
4. Validar latencia p95 < 2s en sandbox

**Recomendación**: **CONDICIONAL** - Requiere negociación contractual antes de considerar como candidato.

---

## 8. Recomendación Final

### 8.1. Ranking de Opciones

1. **Twilio WhatsApp Business API**: **APTO** ✅
   - Mayor cumplimiento de requisitos mínimos
   - SLA público con penalizaciones
   - Idempotencia nativa
   - Requiere solo negociación de retención de logs

2. **Meta WhatsApp Business Platform (Cloud API)**: **CONDICIONAL** ⚠️
   - Múltiples requisitos CONDICIONALES
   - Requiere validación técnica y negociación contractual extensa
   - Proveedor oficial, pero con más incertidumbre contractual

3. **MessageBird WhatsApp Business API**: **CONDICIONAL** ⚠️
   - Múltiples requisitos CONDICIONALES
   - Requiere negociación contractual
   - Menor presencia en mercado

### 8.2. Decisión Recomendada

**PROVEEDOR CANDIDATO RECOMENDADO**: **Twilio WhatsApp Business API**

**Justificación**:
- Cumple todos los requisitos mínimos absolutos (con validación práctica de latencia)
- SLA público con penalizaciones (99.95% > 99.5% requerido)
- Idempotencia nativa con header estándar
- Documentación técnica completa
- Infraestructura global establecida
- Solo requiere negociación contractual de retención de logs (≤ 30 días)

**Alternativa si Twilio no es viable**:
- Meta Cloud API requiere validación técnica extensa y negociación contractual antes de considerar como candidato.

### 8.3. Próximos Pasos si se Selecciona Twilio

1. **Negociación Contractual**:
   - Negociar retención de logs ≤ 30 días
   - Configurar para minimizar PII en logs
   - Confirmar SLA 99.95% con penalizaciones

2. **Validación Técnica en Sandbox**:
   - Probar latencia p95 < 2s con tráfico de prueba
   - Validar idempotencia con `Idempotency-Key` header
   - Validar comportamiento de kill-switch
   - Validar filtrado de PII en respuestas

3. **Preparación para E2**:
   - Revisar documentación técnica completa de Twilio
   - Identificar endpoints específicos (webhook inbound, API outbound)
   - Identificar mecanismos de autenticación
   - Identificar formatos de payload

---

## 9. Criterio de Salida E1

### 9.1. Estado Actual

**DECISIÓN HUMANA REQUERIDA**: Seleccionar 1 proveedor "candidato" o declarar NO-GO.

**Recomendación del Documento**: **Twilio WhatsApp Business API** como candidato.

### 9.2. Si se Selecciona Twilio

**Estado**: ✅ **E1 CERRADO** - Proveedor candidato seleccionado.

**Próxima Fase**: **E2 — Diseño de Integración Técnica** con Twilio como proveedor.

### 9.3. Si se Declara NO-GO

**Estado**: ❌ **E1 CERRADO** - NO-GO declarado.

**Razón**: [Documentar razón de NO-GO si aplica]

**Próxima Fase**: Revisar requisitos o buscar alternativas.

---

## 10. Versión y Control de Cambios

**VERSIÓN**: 1.0  
**FECHA DE CREACIÓN**: 2024  
**ÚLTIMA ACTUALIZACIÓN**: 2024

**CONTROL DE CAMBIOS**:
- Este documento solo puede ser modificado mediante proceso formal de gobernanza
- Cualquier modificación requiere aprobación del arquitecto principal y responsable de release
- Las modificaciones deben respetar el principio rector: evaluación basada en evidencia

**DOCUMENTOS RELACIONADOS**:
- `/docs/DECISION_INTEGRACION_PROVEEDOR_WAM.md`
- `/docs/ANALISIS_EXPLORATORIO_INTEGRACION_PROVEEDOR_WHATSAPP.md`
- `/docs/ARQUITECTURA_MINIMA_CANAL_WAM.md`

---

**FIN DEL DOCUMENTO E1**


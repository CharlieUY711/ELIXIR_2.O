# Implementación Mínima Controlada del Canal WAM
## Estado: GO CONTROLADO

## 1. Propósito del Documento

Este documento define la **implementación mínima controlada** del Canal WhatsApp Enmascarado (WAM) para operación en estado **GO CONTROLADO**. El documento describe exclusivamente componentes de infraestructura, flujos operativos, controles obligatorios, observabilidad permitida, riesgos residuales y límites explícitos de esta fase.

**PRINCIPIO RECTOR**: Esta implementación es ejecutora pura de handoffs autorizados. No decide, no explica, no aprende. Conecta una vez y desaparece.

**ESTADO ACTUAL**: GO CONTROLADO — Implementación mínima para operación controlada con usuarios limitados y volumen bajo.

---

## 2. Contexto Inviolable

- **Elixir Core v1.0 está SELLADO e INMODIFICABLE**
- El Core decide únicamente ALLOW o DENY
- El Core no expone razones, metadata ni señales externas
- El WAM no consulta al Core directamente
- El WAM recibe handoffs ya autorizados por el Core a través del Chat
- El WAM es ejecutor puro sin lógica decisional
- GO sigue siendo una decisión humana explícita

---

## 3. Componentes de Infraestructura Mínimos

### 3.1. Runtime

**Descripción**: Entorno de ejecución mínimo para componentes del WAM.

**Requisitos mínimos**:
- Procesamiento de solicitudes HTTP/HTTPS
- Manejo de timeouts configurables
- Capacidad de reinicio controlado
- Aislamiento de procesos

**No requiere**:
- Escalado automático
- Balanceo de carga avanzado
- Orquestación compleja
- Persistencia de estado entre reinicios

**Asunción operativa**: Volumen bajo, usuarios limitados, operación controlada.

### 3.2. Almacenamiento Temporal

**Descripción**: Sistema de almacenamiento efímero para handoffs durante su ciclo de vida.

**Requisitos mínimos**:
- Almacenamiento en memoria o base de datos efímera
- Soporte para TTL automático (expiración de registros)
- Operaciones atómicas: crear, consultar, actualizar estado
- Invalidación automática de handoffs expirados

**Estructura mínima de handoff**:
```
{
  handoff_id: string (único, no predecible),
  session_id: string,
  user_ref: string (referencia abstracta),
  model_ref: string (referencia abstracta),
  status: CREATED | REDEEMED | EXPIRED | REVOKED,
  created_at: timestamp,
  expires_at: timestamp (TTL: ~5 minutos)
}
```

**No almacena**:
- Mensajes de conversación
- Contenido multimedia
- Números telefónicos
- Datos personales más allá de referencias abstractas
- Historial de conversaciones

**Asunción operativa**: Handoffs se eliminan automáticamente tras TTL. No hay recuperación de estado tras pérdida de almacenamiento.

### 3.3. Integración con Proveedor de Mensajería (Abstracta)

**Descripción**: Adaptador abstracto para comunicación con proveedor de WhatsApp (Twilio, Meta, etc.).

**Requisitos mínimos**:
- Interfaz abstracta para ejecución de conexión usuario-modelo
- Manejo de errores del proveedor
- Timeouts configurables en llamadas externas
- Registro de eventos de ejecución

**Contrato de interfaz**:
- **Input**: `{ handoff_id, user_ref, model_ref }`
- **Output**: Resultado de ejecución (éxito/fallo)
- **Efecto**: Conexión usuario-modelo en WhatsApp (fuera del control de Elixir)

**No requiere**:
- Persistencia de respuestas del proveedor
- Intermediación de conversación posterior
- Reintentos automáticos
- Manejo de webhooks del proveedor

**Asunción operativa**: Proveedor específico es intercambiable. La implementación concreta se define en fase de implementación técnica.

### 3.4. Observabilidad Básica

**Descripción**: Sistema mínimo de registro y métricas agregadas.

**Requisitos mínimos**:
- Registro de eventos del ciclo de vida de handoffs
- Métricas agregadas (contadores, timestamps)
- Alertas mínimas para fallas críticas
- Logs estructurados sin información sensible

**Eventos registrados**:
- `handoff_created`: handoff_id, session_id, timestamp
- `handoff_redeemed`: handoff_id, timestamp
- `handoff_expired`: handoff_id, timestamp, causa
- `handoff_revoked`: handoff_id, timestamp, causa
- `handoff_resolution_failed`: handoff_id, timestamp, tipo de error
- `provider_execution_success`: handoff_id, timestamp
- `provider_execution_failed`: handoff_id, timestamp, tipo de error

**No registra**:
- Contenido de mensajes
- Números telefónicos
- Datos personales
- Razones de decisiones del Core
- Estados internos del Core

**Asunción operativa**: Observabilidad suficiente para operación controlada, no para análisis avanzado.

### 3.5. Kill-Switch

**Descripción**: Mecanismo de detención inmediata del canal.

**Requisitos mínimos**:
- Activación manual inmediata
- Rechazo de todas las solicitudes nuevas
- Invalidación de handoffs activos (opcional, según configuración)
- Registro de activación del kill-switch

**Comportamiento**:
- Tras activación: todas las solicitudes de resolución de handoff retornan error genérico
- Handoffs activos pueden invalidarse o mantenerse según configuración
- No se generan nuevos handoffs
- Sistema registra evento de kill-switch activado

**Asunción operativa**: Kill-switch es control humano, no automático. Requiere intervención manual para activación y desactivación.

---

## 4. Flujo Operativo Real (End-to-End)

### 4.1. Flujo Canónico: Handoff Autorizado → Mensaje Enviado

**Paso 1: Recepción de Solicitud de Handoff desde Chat**
- El Chat envía solicitud al WAM: `POST /handoffs { session_id, user_ref, model_ref }`
- El WAM valida presencia de campos requeridos
- Si validación falla: retorna error 400, registra evento, flujo termina
- Si validación exitosa: continúa al Paso 2

**Paso 2: Creación de Handoff en Almacenamiento Temporal**
- El WAM genera `handoff_id` único (UUID v4 o equivalente)
- El WAM calcula `expires_at = now() + TTL` (TTL: ~5 minutos)
- El WAM crea registro en Almacenamiento Temporal con status `CREATED`
- El WAM registra evento `handoff_created`
- El WAM retorna `handoff_url` al Chat: `https://wam.example.com/resolve/{handoff_id}`

**Paso 3: Usuario Accede a Handoff URL**
- Usuario accede a `handoff_url` desde navegador o aplicación
- El WAM recibe solicitud: `GET /resolve/{handoff_id}`
- El WAM valida formato de `handoff_id`
- Si formato inválido: retorna mensaje genérico "Enlace inválido", registra evento, flujo termina
- Si formato válido: continúa al Paso 4

**Paso 4: Resolución de Handoff**
- El WAM consulta Almacenamiento Temporal con `handoff_id`
- Si handoff no encontrado: retorna mensaje genérico "Enlace inválido", registra evento, flujo termina
- Si handoff encontrado: continúa validación
- El WAM verifica `status == CREATED`
- Si status no es CREATED: retorna mensaje genérico según status (ya utilizado/expirado), registra evento, flujo termina
- El WAM verifica `expires_at > now()`
- Si expirado: marca handoff como `EXPIRED`, retorna mensaje genérico "Este enlace ha expirado", registra evento, flujo termina
- Si válido: continúa al Paso 5

**Paso 5: Transición de Estado y Ejecución**
- El WAM marca handoff como `REDEEMED` (transición atómica)
- El WAM registra evento `handoff_redeemed`
- El WAM invoca Adaptador de Proveedor con `{ handoff_id, user_ref, model_ref }`
- El Adaptador ejecuta conexión usuario-modelo en WhatsApp
- Si ejecución exitosa: registra evento `provider_execution_success`, continúa al Paso 6
- Si ejecución falla: registra evento `provider_execution_failed`, continúa al Paso 6 (handoff ya marcado como REDEEMED)

**Paso 6: Finalización**
- El WAM retorna respuesta al usuario:
  - Si ejecución exitosa: mensaje genérico de éxito (ej: "Redirigiendo a WhatsApp...")
  - Si ejecución falla: mensaje genérico de error (ej: "No se pudo completar la conexión. Por favor, intenta nuevamente.")
- Usuario queda conectado en WhatsApp (fuera del control de Elixir) o debe reintentar
- El WAM no interviene en conversación posterior
- Handoff queda marcado como `REDEEMED` y no es reutilizable

### 4.2. Flujos de Error y Timeouts

**Timeout en Consulta a Almacenamiento Temporal**:
- Si consulta a Almacenamiento Temporal excede timeout (ej: 2 segundos):
  - El WAM trata como handoff no encontrado
  - Retorna mensaje genérico "Enlace inválido"
  - Registra evento `handoff_resolution_failed` con tipo "storage_timeout"
  - Flujo termina

**Timeout en Ejecución de Proveedor**:
- Si ejecución de proveedor excede timeout (ej: 10 segundos):
  - El Adaptador cancela llamada al proveedor
  - Registra evento `provider_execution_failed` con tipo "timeout"
  - Retorna mensaje genérico de error al usuario
  - Handoff queda marcado como `REDEEMED` (no reutilizable)
  - Flujo termina

**Falla Silenciosa del Proveedor**:
- Si proveedor retorna error no esperado:
  - El Adaptador registra evento `provider_execution_failed` con tipo de error
  - Retorna mensaje genérico de error al usuario
  - No expone detalles técnicos del proveedor
  - Handoff queda marcado como `REDEEMED`
  - Flujo termina

**Pérdida de Estado Transitorio**:
- Si Almacenamiento Temporal pierde datos (reinicio, falla):
  - Handoffs activos se pierden
  - Resoluciones futuras fallan con "handoff no encontrado"
  - Sistema continúa operando sin estado previo
  - No hay recuperación automática
  - Usuarios deben solicitar nuevos handoffs desde el Chat

### 4.3. Comportamiento Bajo Kill-Switch Activado

**Activación Manual**:
- Operador activa kill-switch mediante mecanismo configurado (API, configuración, etc.)
- Sistema registra evento `kill_switch_activated`

**Comportamiento Inmediato**:
- Todas las solicitudes de resolución de handoff retornan error genérico
- No se procesan nuevas resoluciones
- Handoffs activos pueden invalidarse según configuración
- Sistema continúa registrando eventos

**Desactivación Manual**:
- Operador desactiva kill-switch
- Sistema registra evento `kill_switch_deactivated`
- Sistema reanuda procesamiento normal de handoffs

---

## 5. Controles Obligatorios

### 5.1. TTL y Expiración

**Control**: Handoffs expiran automáticamente después de TTL definido (~5 minutos).

**Implementación**:
- Cada handoff tiene `expires_at = created_at + TTL`
- Almacenamiento Temporal invalida handoffs expirados automáticamente
- Resolver rechaza handoffs con `expires_at <= now()`
- No hay extensión automática de TTL
- No hay renovación de handoffs

**Validación**:
- Verificar que todos los handoffs generados tienen `expires_at` válido
- Verificar que handoffs expirados no pueden resolverse
- Verificar que TTL no excede límite máximo (ej: 10 minutos)

### 5.2. Uso Único de Handoffs

**Control**: Cada handoff se consume exactamente una vez.

**Implementación**:
- Resolver marca handoff como `REDEEMED` inmediatamente tras primera resolución válida
- Resolver rechaza resolución de handoffs con status `REDEEMED`
- Almacenamiento Temporal no permite transición `REDEEMED → CREATED`
- Transición de estado es atómica (no hay condición de carrera)

**Validación**:
- Verificar que handoffs `REDEEMED` no pueden resolverse nuevamente
- Verificar que transición `CREATED → REDEEMED` es atómica
- Verificar que intentos de reutilización se registran

### 5.3. Rate Limiting Básico

**Control**: Límite de solicitudes por unidad de tiempo para prevenir abuso.

**Implementación**:
- Límite de resoluciones de handoff por IP o sesión (ej: 10 por minuto)
- Límite de creación de handoffs por sesión (ej: 5 por minuto)
- Exceder límite: retornar error genérico, registrar evento
- No exponer razón del rate limit en respuesta

**Validación**:
- Verificar que límites se aplican correctamente
- Verificar que exceder límite no expone información sensible
- Verificar que eventos de rate limit se registran

### 5.4. Idempotencia

**Control**: Operaciones repetidas con mismos parámetros no tienen efectos adicionales.

**Implementación**:
- Resolución de handoff ya `REDEEMED`: retornar mensaje genérico, no ejecutar proveedor nuevamente
- Creación de handoff con mismos parámetros: generar nuevo handoff_id (no reutilizar)
- Consultas de estado: idempotentes (sin efectos secundarios)

**Validación**:
- Verificar que reutilización de handoff no ejecuta proveedor múltiples veces
- Verificar que creación de handoffs genera IDs únicos

### 5.5. Kill-Switch Manual

**Control**: Mecanismo de detención inmediata activable manualmente.

**Implementación**:
- Kill-switch activable mediante API protegida o configuración
- Activación inmediata: rechazo de todas las solicitudes nuevas
- Opción de invalidar handoffs activos o mantenerlos según configuración
- Registro de activación/desactivación

**Validación**:
- Verificar que kill-switch detiene procesamiento inmediatamente
- Verificar que eventos de kill-switch se registran
- Verificar que desactivación reanuda operación normal

---

## 6. Observabilidad Permitida

### 6.1. Métricas Agregadas

**Métricas permitidas**:
- Contador de handoffs creados (por hora/día)
- Contador de handoffs resueltos (por hora/día)
- Contador de handoffs expirados (por hora/día)
- Contador de handoffs revocados (por hora/día)
- Contador de resoluciones fallidas (por tipo de error)
- Contador de ejecuciones exitosas del proveedor
- Contador de ejecuciones fallidas del proveedor (por tipo de error)
- Tiempo promedio de resolución de handoff
- Tasa de éxito de ejecución del proveedor

**Agregación**:
- Métricas se agregan por períodos (hora, día)
- No se desagregan por usuario individual
- No se desagregan por modelo individual
- No se incluyen datos personales

### 6.2. Señales Técnicas

**Señales permitidas**:
- Estado del Almacenamiento Temporal (disponible/no disponible)
- Estado del Adaptador de Proveedor (conectado/desconectado)
- Estado del kill-switch (activo/inactivo)
- Tiempo de respuesta de consultas a Almacenamiento Temporal
- Tiempo de respuesta de ejecuciones del proveedor
- Tasa de errores por componente

**Uso**:
- Señales técnicas para diagnóstico operacional
- Alertas cuando señales exceden umbrales
- No se exponen fuera del sistema de observabilidad

### 6.3. Alertas Mínimas

**Alertas configuradas**:
- Almacenamiento Temporal no disponible
- Adaptador de Proveedor no responde
- Tasa de errores de ejecución del proveedor excede umbral (ej: >10%)
- Kill-switch activado
- Tasa de resoluciones fallidas excede umbral (ej: >5%)

**Formato**:
- Alertas incluyen: tipo de alerta, timestamp, componente afectado
- No incluyen: datos personales, contenido de mensajes, razones de decisiones del Core

### 6.4. Qué NO se Observa

**Prohibido observar**:
- Contenido de mensajes de conversación
- Números telefónicos de usuarios o modelos
- Datos personales más allá de referencias abstractas
- Razones de decisiones del Core
- Estados internos del Core
- Señales de Nectar
- Reglas del Core
- Historial de conversaciones
- Patrones de uso individual de usuarios

**Principio**: Observabilidad técnica y agregada, no observabilidad de contenido ni de decisiones.

---

## 7. Riesgos Operativos Residuales

### 7.1. Riesgos Aceptados

**Riesgo 1: Pérdida de Handoffs Activos por Falla de Almacenamiento**
- **Descripción**: Si Almacenamiento Temporal falla, handoffs activos se pierden y usuarios no pueden completar conexión.
- **Mitigación parcial**: TTL corto (~5 minutos) limita ventana de pérdida. Usuarios pueden solicitar nuevo handoff.
- **Riesgo residual**: Usuarios con handoffs activos pierden acceso temporal. No hay recuperación automática.
- **Aceptación**: Riesgo aceptado en GO CONTROLADO. Volumen bajo limita impacto.

**Riesgo 2: Falla Silenciosa del Proveedor**
- **Descripción**: Si proveedor de WhatsApp falla sin notificación clara, el WAM puede no detectar el error inmediatamente.
- **Mitigación parcial**: Timeouts en llamadas al proveedor. Registro de eventos de ejecución.
- **Riesgo residual**: Usuario puede quedar sin conexión sin notificación clara del sistema.
- **Aceptación**: Riesgo aceptado en GO CONTROLADO. Operación controlada permite detección manual.

**Riesgo 3: Bypass del WAM mediante Handoff ID Comprometido**
- **Descripción**: Si atacante obtiene handoff_id válido, puede intentar reutilizarlo o acceder directamente.
- **Mitigación parcial**: Uso único y TTL corto limitan ventana de ataque. Validación estricta en Resolver.
- **Riesgo residual**: Handoff_id comprometido puede usarse una vez antes de expiración.
- **Aceptación**: Riesgo aceptado en GO CONTROLADO. Volumen bajo y usuarios limitados reducen probabilidad.

**Riesgo 4: Dependencia del Chat para Autorización**
- **Descripción**: El WAM depende de que el Chat solo genere handoffs tras autorización del Core. Si el Chat falla en esta validación, el WAM ejecuta handoff no autorizado.
- **Mitigación parcial**: Contrato formal entre Chat y WAM. El Chat tiene responsabilidad explícita de consultar Core.
- **Riesgo residual**: Falla en Chat puede resultar en handoff no autorizado ejecutado por WAM.
- **Aceptación**: Riesgo aceptado en GO CONTROLADO. Confianza en contrato formal y operación controlada.

**Riesgo 5: Escalabilidad Limitada del Almacenamiento Temporal**
- **Descripción**: Si volumen de handoffs crece, el Almacenamiento Temporal puede saturarse o degradarse.
- **Mitigación parcial**: TTL corto limita acumulación. Handoffs expirados se eliminan automáticamente.
- **Riesgo residual**: Picos de tráfico pueden saturar almacenamiento y causar rechazo de handoffs válidos.
- **Aceptación**: Riesgo aceptado en GO CONTROLADO. Volumen bajo y usuarios limitados minimizan probabilidad.

### 7.2. Riesgos No Aceptables

**Riesgo 1: Ejecución de Handoff sin Autorización del Core**
- **Descripción**: El WAM ejecuta handoff que no fue autorizado por el Core.
- **Condición de detención**: Si se detecta handoff ejecutado sin autorización del Core, el sistema debe detenerse inmediatamente.
- **Acción**: Activar kill-switch, invalidar todos los handoffs activos, investigar causa, documentar incidente.

**Riesgo 2: Exposición de Números Telefónicos o Datos Personales**
- **Descripción**: El WAM expone números telefónicos de usuarios o modelos, o datos personales más allá de referencias abstractas.
- **Condición de detención**: Si se detecta exposición de información sensible, el sistema debe detenerse inmediatamente.
- **Acción**: Activar kill-switch, revisar logs y almacenamiento, eliminar información expuesta, investigar causa, documentar incidente.

**Riesgo 3: Almacenamiento de Contenido de Conversación**
- **Descripción**: El WAM almacena mensajes, texto, multimedia o contenido de conversación.
- **Condición de detención**: Si se detecta almacenamiento de contenido, el sistema debe detenerse inmediatamente.
- **Acción**: Activar kill-switch, eliminar contenido almacenado, revisar código y configuración, investigar causa, documentar incidente.

**Riesgo 4: Violación de Uso Único o TTL**
- **Descripción**: El WAM permite reutilización de handoffs o ignora TTL.
- **Condición de detención**: Si se detecta violación de uso único o TTL, el sistema debe detenerse inmediatamente.
- **Acción**: Activar kill-switch, invalidar todos los handoffs activos, revisar lógica de validación, investigar causa, documentar incidente.

**Riesgo 5: Dependencia Directa del Core**
- **Descripción**: El WAM consulta al Core directamente o introduce dependencias en el Core.
- **Condición de detención**: Si se detecta dependencia directa del Core, el sistema debe detenerse inmediatamente.
- **Acción**: Activar kill-switch, revertir cambios que introducen dependencia, revisar arquitectura, investigar causa, documentar incidente.

### 7.3. Condiciones de Detención Inmediata

**Eventos que fuerzan detención inmediata**:
1. Ejecución de handoff sin autorización del Core
2. Exposición de números telefónicos o datos personales
3. Almacenamiento de contenido de conversación
4. Violación de uso único o TTL
5. Dependencia directa del Core
6. Modificación del Core sellado
7. Pérdida de capacidad de auditoría

**Procedimiento de detención**:
1. Activar kill-switch inmediatamente
2. Invalidar todos los handoffs activos (opcional, según riesgo)
3. Registrar evento de detención con causa
4. Notificar a responsables operacionales
5. Investigar causa raíz
6. Documentar incidente
7. No reanudar operación hasta resolución de causa

---

## 8. Límites Explícitos de Esta Fase

### 8.1. Qué NO se Implementa Todavía

**No se implementa**:
- Persistencia de handoffs más allá de TTL
- Recuperación automática de estado tras fallas
- Reintentos automáticos de ejecución del proveedor
- Escalado automático de infraestructura
- Balanceo de carga avanzado
- Análisis avanzado de métricas
- Optimización de UX
- Manejo de webhooks del proveedor
- Intermediación de conversación posterior al handoff
- Notificaciones al usuario sobre estado de handoff
- Historial de handoffs por usuario
- Dashboard de administración
- API de administración avanzada

**Razón**: Implementación mínima para GO CONTROLADO. Funcionalidades adicionales se evalúan en fases posteriores.

### 8.2. Qué Queda Prohibido Incluso si "Funciona"

**Prohibiciones absolutas**:
- **NO consultar al Core directamente**: El WAM nunca consulta al Core. Solo recibe handoffs ya autorizados.
- **NO almacenar contenido**: El WAM nunca almacena mensajes, texto, multimedia ni contenido de conversación.
- **NO exponer información sensible**: El WAM nunca expone números telefónicos, datos personales ni razones de decisiones.
- **NO modificar el Core**: El WAM nunca introduce cambios ni dependencias en Elixir Core.
- **NO decidir**: El WAM nunca toma decisiones de autorización. Solo ejecuta handoffs ya autorizados.
- **NO explicar**: El WAM nunca expone razones de denegación ni estados internos del Core.
- **NO aprender**: El WAM nunca modifica comportamiento basado en patrones o historial.
- **NO crear handoffs permanentes**: Todos los handoffs tienen TTL y uso único.
- **NO permitir reutilización**: Handoffs son de uso único, sin excepciones.
- **NO optimizar UX a costa de seguridad**: La seguridad y control de riesgo priman sobre UX.

**Principio**: Estas prohibiciones son innegociables. Incluso si una funcionalidad "funciona" técnicamente, si viola estas prohibiciones, queda prohibida.

### 8.3. Asunciones Operativas de Esta Fase

**Asunciones**:
- Volumen bajo: número limitado de handoffs por día
- Usuarios limitados: grupo controlado de usuarios
- Operación controlada: monitoreo manual y intervención cuando sea necesario
- Proveedor estable: proveedor de WhatsApp opera de forma estable
- Infraestructura simple: no requiere escalado automático ni alta disponibilidad avanzada

**Límites**:
- Si volumen excede capacidad operativa: activar kill-switch, evaluar escalado en fase posterior
- Si usuarios exceden grupo controlado: activar kill-switch, evaluar expansión en fase posterior
- Si proveedor falla frecuentemente: activar kill-switch, evaluar cambio de proveedor
- Si infraestructura no soporta carga: activar kill-switch, evaluar mejora de infraestructura

---

## 9. Confirmación de Estado del Sistema

### 9.1. El Core No Aparece como Dependiente

✅ **Confirmado**: El WAM no consulta al Core directamente. El WAM recibe handoffs ya autorizados por el Core a través del Chat. El Core no tiene dependencias del WAM. La implementación mínima respeta esta separación estricta.

### 9.2. Separación Estricta de Capas

✅ **Confirmado**: El WAM opera como capa independiente. No modifica Core, no modifica Chat. Solo ejecuta handoffs autorizados. La implementación mínima mantiene esta separación.

### 9.3. Estado GO CONTROLADO

✅ **Confirmado**: El sistema mantiene estado **GO CONTROLADO**. El WAM es ejecutor puro sin lógica decisional. Todas las decisiones provienen del Core a través del Chat. La implementación mínima está diseñada para operación controlada con usuarios limitados y volumen bajo.

### 9.4. Controles Activos

✅ **Controles implementados**:
- TTL y expiración de handoffs
- Uso único de handoffs
- Rate limiting básico
- Idempotencia de operaciones
- Kill-switch manual

### 9.5. Riesgos Documentados

✅ **Riesgos aceptados documentados**: 5 riesgos aceptados con mitigaciones parciales y riesgos residuales explícitos.

✅ **Riesgos no aceptables documentados**: 5 riesgos no aceptables con condiciones de detención inmediata.

✅ **Condiciones de detención documentadas**: 7 eventos que fuerzan detención inmediata con procedimiento explícito.

---

## 10. Próximos Pasos

### 10.1. Validación de Documento

- [ ] Revisar coherencia con `ARQUITECTURA_MINIMA_CANAL_WAM.md`
- [ ] Revisar coherencia con `CRITERIOS_SALIDA_GO_CONTROLADO_A_GO.md`
- [ ] Revisar coherencia con `ELIXIR_CORE_CONTRATO.md`
- [ ] Revisar coherencia con `ESTRES_Y_ABUSO.md`
- [ ] Confirmar que el Core no aparece como dependiente
- [ ] Confirmar que el sistema sigue en GO CONTROLADO

### 10.2. Implementación Técnica (Fase Posterior)

La implementación técnica del WAM según este documento se realizará en fase posterior. Este documento define exclusivamente la implementación mínima controlada sin código productivo.

---

## 11. Frase Canónica de Implementación Mínima

**El WAM ejecuta handoffs autorizados. No decide, no explica, no aprende. Conecta una vez y desaparece. En GO CONTROLADO, opera con controles estrictos, observabilidad mínima y riesgos documentados.**

---

**Versión del Documento**: 1.0  
**Fecha**: 2024  
**Estado**: GO CONTROLADO — Implementación Mínima Controlada Definida  
**Próximos Pasos**: Validación de coherencia y preparación para implementación técnica

---

**FIN DEL DOCUMENTO**


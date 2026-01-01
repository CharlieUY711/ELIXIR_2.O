# Diseño de Infraestructura y Runtime del Canal WAM
## Estado: GO CONTROLADO

## 1. Propósito del Documento

Este documento define el **diseño de infraestructura y runtime** del Canal WhatsApp Enmascarado (WAM) para operación en estado **GO CONTROLADO**. El documento describe exclusivamente aspectos de infraestructura, runtime, operación, observabilidad y controles sin incluir código productivo ni decisiones sobre proveedores concretos.

**PRINCIPIO RECTOR**: El WAM ejecuta handoffs autorizados. No decide, no explica, no aprende. Conecta una vez y desaparece. En GO CONTROLADO, opera con controles estrictos, observabilidad mínima y riesgos documentados.

**ESTADO ACTUAL**: GO CONTROLADO — Diseño de infraestructura y runtime para operación controlada con usuarios limitados y volumen bajo.

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

## 3. Runtime del WAM (Modelo Conceptual)

### 3.1. Tipo de Runtime

**Modelo**: Runtime tipo **service** (servicio HTTP/HTTPS) con capacidad de procesamiento request-driven.

**Características**:
- Procesamiento síncrono por solicitud HTTP
- Sin estado persistente entre solicitudes
- Ejecución aislada por mensaje/handoff
- Capacidad de reinicio controlado sin pérdida de estado crítico (handoffs activos se pierden, comportamiento esperado)

**No es**:
- Runtime tipo edge (no requiere procesamiento en borde geográfico)
- Runtime tipo worker (no requiere procesamiento asíncrono en cola)
- Runtime tipo serverless (no requiere escalado automático por evento)

**Justificación**: El WAM procesa solicitudes HTTP de resolución de handoff de forma síncrona. No requiere procesamiento distribuido ni escalado automático en GO CONTROLADO.

### 3.2. Concurrencia Esperada

**Volumen esperado**: Bajo (menos de 100 handoffs por hora en GO CONTROLADO).

**Modelo de concurrencia**:
- Procesamiento secuencial por solicitud HTTP
- Sin paralelismo explícito requerido
- Sin necesidad de sincronización entre solicitudes
- Sin estado compartido entre solicitudes

**Prevención de comportamiento no determinista**:
- Cada solicitud opera sobre datos independientes (handoff_id único)
- Transiciones de estado son atómicas (operación única en almacenamiento)
- Sin dependencias entre solicitudes concurrentes
- Sin lectura-escritura compartida que requiera locks

**Asunción operativa**: Volumen bajo permite procesamiento secuencial sin degradación de rendimiento. Si volumen crece, se activa kill-switch antes de requerir escalado.

### 3.3. Modelo de Ejecución por Mensaje

**Flujo request-driven**:
1. Solicitud HTTP llega al runtime
2. Runtime procesa solicitud de forma síncrona
3. Runtime consulta almacenamiento temporal (si aplica)
4. Runtime ejecuta acción (resolver handoff, ejecutar proveedor)
5. Runtime retorna respuesta HTTP
6. Runtime finaliza procesamiento de solicitud

**Sin estado entre solicitudes**:
- Cada solicitud es independiente
- No hay contexto compartido entre solicitudes
- No hay sesiones persistentes
- No hay cache de decisiones o resultados

**Asunción operativa**: Modelo request-driven es suficiente para GO CONTROLADO. No requiere procesamiento asíncrono ni colas de mensajes.

### 3.4. Timeouts Canónicos y Silencios

**Timeouts definidos**:

| Operación | Timeout | Comportamiento al timeout |
|-----------|---------|--------------------------|
| Consulta a Almacenamiento Temporal | 2 segundos | Tratar como handoff no encontrado, retornar error genérico |
| Ejecución de Proveedor (conexión WhatsApp) | 10 segundos | Cancelar ejecución, registrar fallo, retornar error genérico |
| Procesamiento total de resolución de handoff | 15 segundos | Abortar procesamiento, retornar error genérico |
| Creación de handoff | 3 segundos | Retornar error 500, registrar fallo |

**Silencios**:
- Timeouts no se comunican al usuario con detalles técnicos
- Timeouts se registran en logs para auditoría
- Timeouts no exponen información sobre causa interna
- Timeouts no permiten reintentos automáticos

**Justificación**: Timeouts cortos previenen bloqueos y degradación. Comportamiento silencioso mantiene opacidad del sistema.

---

## 4. Componentes de Infraestructura Mínimos (Abstractos)

### 4.1. Ingress del Proveedor (Webhook/Connector Abstracto)

**Descripción**: Punto de entrada para solicitudes HTTP del proveedor de WhatsApp (si aplica) o para resoluciones de handoff desde usuarios.

**Requisitos mínimos**:
- Receptor HTTP/HTTPS para solicitudes de resolución de handoff
- Validación básica de formato de solicitud
- Terminación TLS/SSL
- Rate limiting básico por IP o sesión

**No requiere**:
- Balanceo de carga avanzado
- CDN o edge caching
- Procesamiento de webhooks del proveedor (no en GO CONTROLADO)
- Autenticación compleja (handoff_id es suficiente token)

**Interfaz abstracta**:
- `GET /resolve/{handoff_id}`: Resolución de handoff
- `POST /handoffs`: Creación de handoff (desde Chat, no desde proveedor)
- `GET /health`: Health check básico (sin información sensible)

**Asunción operativa**: Ingress simple es suficiente. No requiere infraestructura de edge ni CDN en GO CONTROLADO.

### 4.2. Handoff Resolver (Validador/Opaco, Uso Único)

**Descripción**: Componente que valida y resuelve handoffs recibidos.

**Requisitos mínimos**:
- Validación de formato de handoff_id
- Consulta a Almacenamiento Temporal
- Verificación de TTL y estado
- Transición atómica de estado (CREATED → REDEEMED)
- Rechazo de handoffs inválidos con mensaje genérico

**Características de opacidad**:
- No expone causa de rechazo
- No expone información sobre estado interno
- No expone detalles de validación
- Mensajes de error genéricos e invariantes

**Características de uso único**:
- Transición de estado es atómica (no hay condición de carrera)
- Handoffs REDEEMED no pueden resolverse nuevamente
- No hay mecanismo de "deshacer" resolución

**Asunción operativa**: Resolver es componente interno. No requiere exposición externa ni API pública.

### 4.3. Almacenamiento Temporal (TTL, Limpieza, Atomicidad)

**Descripción**: Sistema de almacenamiento efímero para handoffs durante su ciclo de vida.

**Requisitos mínimos**:
- Almacenamiento en memoria o base de datos efímera
- Soporte para TTL automático (expiración de registros)
- Operaciones atómicas: crear, consultar, actualizar estado
- Invalidación automática de handoffs expirados
- Limpieza periódica de registros expirados

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

**Atomicidad requerida**:
- Transición CREATED → REDEEMED debe ser atómica
- No debe permitirse transición REDEEMED → CREATED
- Consulta y actualización deben ser transacción única
- No debe haber condición de carrera en resolución concurrente

**TTL y limpieza**:
- TTL estricto: ~5 minutos desde creación
- Limpieza automática de handoffs expirados (cada 1 minuto)
- No hay extensión de TTL
- No hay renovación de handoffs

**No almacena**:
- Mensajes de conversación
- Contenido multimedia
- Números telefónicos
- Datos personales más allá de referencias abstractas
- Historial de conversaciones

**Asunción operativa**: Almacenamiento temporal puede ser en memoria o base de datos efímera. No requiere persistencia duradera ni replicación en GO CONTROLADO.

### 4.4. Sender (Conector Abstracto al Proveedor)

**Descripción**: Adaptador abstracto para comunicación con proveedor de WhatsApp.

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

**Asunción operativa**: Proveedor específico es intercambiable. La implementación concreta se define en fase de implementación técnica. No se elige proveedor en este diseño.

### 4.5. Observabilidad Mínima (Métricas Agregadas)

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
- `kill_switch_activated`: timestamp
- `kill_switch_deactivated`: timestamp

**Métricas agregadas permitidas**:
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

**No registra**:
- Contenido de mensajes
- Números telefónicos
- Datos personales
- Razones de decisiones del Core
- Estados internos del Core

**Asunción operativa**: Observabilidad suficiente para operación controlada, no para análisis avanzado.

### 4.6. Kill-Switch (Manual y Central)

**Descripción**: Mecanismo de detención inmediata del canal.

**Requisitos mínimos**:
- Activación manual inmediata
- Rechazo de todas las solicitudes nuevas
- Invalidación de handoffs activos (opcional, según configuración)
- Registro de activación del kill-switch

**Modos de operación**:
- **Modo DROP**: Todas las solicitudes se rechazan inmediatamente sin procesamiento
- **Modo SILENCIO**: Solicitudes se procesan pero no se ejecuta proveedor (handoffs se marcan como REDEEMED pero no hay conexión)

**Comportamiento**:
- Tras activación: todas las solicitudes de resolución de handoff retornan error genérico
- Handoffs activos pueden invalidarse o mantenerse según configuración
- No se generan nuevos handoffs (si kill-switch está activo en creación)
- Sistema registra evento de kill-switch activado

**Efecto esperado**:
- Detención inmediata de procesamiento de handoffs
- Prevención de nuevas conexiones
- Mantenimiento de capacidad de auditoría (eventos se registran)
- Sin exposición de razón de detención

**Asunción operativa**: Kill-switch es control humano, no automático. Requiere intervención manual para activación y desactivación.

---

## 5. Modelo de Datos (Solo Metadatos Permitidos)

### 5.1. Campos Mínimos para Handoff

**Estructura obligatoria**:
```
{
  handoff_id: string (UUID v4 o equivalente, único, no predecible)
  session_id: string (referencia a sesión del Chat)
  user_ref: string (referencia abstracta al usuario, no número telefónico)
  model_ref: string (referencia abstracta al modelo, no número telefónico)
  status: CREATED | REDEEMED | EXPIRED | REVOKED
  created_at: timestamp (ISO 8601)
  expires_at: timestamp (ISO 8601, TTL: ~5 minutos)
}
```

**Campos opcionales permitidos**:
- `revoked_at`: timestamp (solo si status es REVOKED)
- `redeemed_at`: timestamp (solo si status es REDEEMED)

**Justificación de campos**:
- `handoff_id`: Identificador único e impredecible para prevenir enumeración
- `session_id`: Referencia a sesión sin exponer contenido
- `user_ref`: Referencia abstracta sin exponer número telefónico
- `model_ref`: Referencia abstracta sin exponer número telefónico
- `status`: Estado del handoff para control de uso único
- `created_at`: Timestamp para auditoría y cálculo de TTL
- `expires_at`: Timestamp para validación de TTL

### 5.2. Campos Prohibidos

**Prohibiciones absolutas**:
- ❌ **NO almacenar contenido de mensajes**: Texto, multimedia, archivos
- ❌ **NO almacenar números telefónicos**: Ni de usuarios ni de modelos
- ❌ **NO almacenar datos personales**: Nombres, emails, direcciones, etc.
- ❌ **NO almacenar decisiones del Core**: ALLOW/DENY, razones, scores
- ❌ **NO almacenar señales de Nectar**: Valores, equivalencias, precios
- ❌ **NO almacenar historial de conversación**: Mensajes previos o posteriores
- ❌ **NO almacenar metadata de proveedor**: IDs internos del proveedor, tokens, etc.

**Principio**: Solo metadatos necesarios para operación. Sin contenido, sin PII, sin decisiones.

### 5.3. Política de Retención: TTL Estricto y Borrado

**TTL estricto**:
- TTL fijo: ~5 minutos desde `created_at`
- No hay extensión de TTL
- No hay renovación de handoffs
- No hay handoffs permanentes

**Borrado automático**:
- Handoffs expirados se eliminan automáticamente tras TTL
- Handoffs REDEEMED se eliminan tras TTL (no inmediatamente, para auditoría)
- Handoffs REVOKED se eliminan tras TTL
- Limpieza periódica: cada 1 minuto se eliminan handoffs con `expires_at < now()`

**Sin recuperación**:
- Handoffs eliminados no se recuperan
- No hay backup de handoffs
- No hay replicación de handoffs
- Pérdida de almacenamiento resulta en pérdida de handoffs activos (comportamiento esperado)

**Justificación**: TTL corto limita ventana de exposición. Borrado automático previene acumulación. Sin recuperación mantiene simplicidad operativa.

---

## 6. Controles Operativos Obligatorios

### 6.1. Rate Limiting

**Control**: Límite de solicitudes por unidad de tiempo para prevenir abuso.

**Implementación**:
- Límite de resoluciones de handoff por IP: 10 por minuto
- Límite de resoluciones de handoff por handoff_id: 3 por minuto (para prevenir enumeración)
- Límite de creación de handoffs por session_id: 5 por minuto
- Ventana de tiempo: rolling window de 1 minuto

**Comportamiento al exceder límite**:
- Retornar error genérico (no exponer razón de rate limit)
- Registrar evento de rate limit excedido
- No procesar solicitud
- No exponer tiempo de espera o límite

**Validación**:
- Verificar que límites se aplican correctamente
- Verificar que exceder límite no expone información sensible
- Verificar que eventos de rate limit se registran

**Asunción operativa**: Rate limiting básico es suficiente para GO CONTROLADO. No requiere algoritmos avanzados ni adaptativos.

### 6.2. Idempotencia

**Control**: Operaciones repetidas con mismos parámetros no tienen efectos adicionales.

**Implementación**:
- Resolución de handoff ya REDEEMED: retornar mensaje genérico, no ejecutar proveedor nuevamente
- Creación de handoff con mismos parámetros: generar nuevo handoff_id (no reutilizar)
- Consultas de estado: idempotentes (sin efectos secundarios)
- Transición de estado: idempotente (múltiples intentos de transición CREATED → REDEEMED resultan en mismo estado final)

**Validación**:
- Verificar que reutilización de handoff no ejecuta proveedor múltiples veces
- Verificar que creación de handoffs genera IDs únicos
- Verificar que transiciones de estado son idempotentes

**Asunción operativa**: Idempotencia previene efectos secundarios no deseados. No requiere tokens de idempotencia explícitos.

### 6.3. Uso Único (Consumo Atómico del Handoff)

**Control**: Cada handoff se consume exactamente una vez.

**Implementación**:
- Resolver marca handoff como REDEEMED inmediatamente tras primera resolución válida
- Resolver rechaza resolución de handoffs con status REDEEMED
- Almacenamiento Temporal no permite transición REDEEMED → CREATED
- Transición de estado es atómica (no hay condición de carrera)

**Atomicidad**:
- Transición CREATED → REDEEMED debe ser operación única
- No debe permitirse lectura-escritura concurrente que resulte en múltiples redemptions
- Almacenamiento debe garantizar atomicidad (transacción única o lock)

**Validación**:
- Verificar que handoffs REDEEMED no pueden resolverse nuevamente
- Verificar que transición CREATED → REDEEMED es atómica
- Verificar que intentos de reutilización se registran

**Asunción operativa**: Uso único es invariante crítico. Atomicidad es requisito no negociable.

### 6.4. Timeouts End-to-End (Ingress → Send)

**Control**: Timeout total desde recepción de solicitud hasta ejecución de proveedor.

**Timeouts definidos**:
- Timeout total de resolución: 15 segundos
- Timeout de consulta a almacenamiento: 2 segundos
- Timeout de ejecución de proveedor: 10 segundos
- Timeout de creación de handoff: 3 segundos

**Comportamiento al timeout**:
- Abortar procesamiento inmediatamente
- No ejecutar proveedor si timeout ocurre antes
- Retornar error genérico al usuario
- Registrar evento de timeout

**Validación**:
- Verificar que timeouts se aplican correctamente
- Verificar que timeouts no exponen información sensible
- Verificar que eventos de timeout se registran

**Asunción operativa**: Timeouts cortos previenen bloqueos. No requiere timeouts adaptativos ni configurables por solicitud.

### 6.5. Kill-Switch: Modos y Efecto Esperado

**Modos de kill-switch**:

**Modo DROP**:
- Todas las solicitudes se rechazan inmediatamente sin procesamiento
- Handoffs activos se mantienen (no se invalidan)
- No se generan nuevos handoffs
- Efecto: Detención completa de procesamiento

**Modo SILENCIO**:
- Solicitudes se procesan pero no se ejecuta proveedor
- Handoffs se marcan como REDEEMED pero no hay conexión
- No se generan nuevos handoffs
- Efecto: Procesamiento sin ejecución (útil para testing o degradación controlada)

**Efecto esperado**:
- Detención inmediata de procesamiento de handoffs (modo DROP)
- O procesamiento sin ejecución (modo SILENCIO)
- Prevención de nuevas conexiones
- Mantenimiento de capacidad de auditoría (eventos se registran)
- Sin exposición de razón de detención

**Activación/Desactivación**:
- Activación manual mediante API protegida o configuración
- Desactivación manual mediante API protegida o configuración
- Registro de activación/desactivación en logs

**Validación**:
- Verificar que kill-switch detiene procesamiento inmediatamente
- Verificar que eventos de kill-switch se registran
- Verificar que desactivación reanuda operación normal

**Asunción operativa**: Kill-switch es control humano, no automático. Requiere intervención manual.

---

## 7. Observabilidad Permitida y Alertas Mínimas

### 7.1. Métricas Agregadas Permitidas

**Métricas técnicas permitidas**:
- Contador de handoffs creados (por hora/día)
- Contador de handoffs resueltos (por hora/día)
- Contador de handoffs expirados (por hora/día)
- Contador de handoffs revocados (por hora/día)
- Contador de resoluciones fallidas (por tipo de error)
- Contador de ejecuciones exitosas del proveedor
- Contador de ejecuciones fallidas del proveedor (por tipo de error)
- Tiempo promedio de resolución de handoff
- Tasa de éxito de ejecución del proveedor
- Tasa de expiración de handoffs (handoffs expirados / handoffs creados)

**Métricas de infraestructura permitidas**:
- Estado del Almacenamiento Temporal (disponible/no disponible)
- Estado del Adaptador de Proveedor (conectado/desconectado)
- Estado del kill-switch (activo/inactivo)
- Tiempo de respuesta de consultas a Almacenamiento Temporal
- Tiempo de respuesta de ejecuciones del proveedor
- Tasa de errores por componente

**Agregación**:
- Métricas se agregan por períodos (hora, día)
- No se desagregan por usuario individual
- No se desagregan por modelo individual
- No se incluyen datos personales

**No se miden**:
- Contenido de mensajes
- Números telefónicos
- Datos personales
- Razones de decisiones del Core
- Estados internos del Core
- Señales de Nectar

### 7.2. SLOs Técnicos Alineados con GO CONTROLADO

**SLOs definidos** (sin metas comerciales):

| Métrica | SLO | Justificación |
|---------|-----|---------------|
| Disponibilidad de Almacenamiento Temporal | ≥ 95% | Operación controlada permite degradación ocasional |
| Tasa de éxito de ejecución del proveedor | ≥ 90% | Proveedor puede fallar ocasionalmente, aceptable en GO CONTROLADO |
| Tiempo de respuesta de resolución de handoff (p95) | ≤ 5 segundos | Timeout total es 15 segundos, p95 debe ser menor |
| Tasa de handoffs válidos (que cumplen TTL y uso único) | 100% | Invariante crítico, no negociable |
| Tasa de errores de resolución | ≤ 5% | Errores ocasionales aceptables, pero deben ser minoría |

**Revisión de SLOs**:
- SLOs se revisan semanalmente en GO CONTROLADO
- SLOs no se usan para decisiones comerciales
- SLOs se ajustan solo si hay justificación técnica
- SLOs no se relajan para mejorar métricas comerciales

**Asunción operativa**: SLOs técnicos son guías operativas, no objetivos comerciales. No se optimizan para conversión ni retención.

### 7.3. Alertas Mínimas

**Alertas configuradas**:

| Alerta | Condición | Acción |
|--------|-----------|--------|
| Almacenamiento Temporal no disponible | Estado = no disponible por > 30 segundos | Notificar operadores, activar kill-switch si persiste |
| Adaptador de Proveedor no responde | Timeout en ejecución por > 3 intentos consecutivos | Notificar operadores, revisar conectividad |
| Tasa de errores de ejecución del proveedor excede umbral | Tasa > 10% en ventana de 1 hora | Notificar operadores, revisar proveedor |
| Kill-switch activado | Kill-switch = activo | Notificar operadores (información, no acción) |
| Tasa de resoluciones fallidas excede umbral | Tasa > 5% en ventana de 1 hora | Notificar operadores, revisar logs |
| Tasa de expiraciones anómalas | Tasa > 50% en ventana de 1 hora | Notificar operadores, revisar TTL o uso |

**Formato de alertas**:
- Tipo de alerta
- Timestamp
- Componente afectado
- Métrica que disparó alerta
- No incluyen: datos personales, contenido de mensajes, razones de decisiones del Core

**Canales de alerta**:
- Email a operadores (en GO CONTROLADO)
- Logs estructurados
- No requiere sistemas de alerta avanzados (PagerDuty, etc.) en GO CONTROLADO

**Asunción operativa**: Alertas mínimas son suficientes para operación controlada. No requiere alertas avanzadas ni on-call rotativo.

### 7.4. Qué NO se Observa

**Prohibido observar**:
- ❌ Contenido de mensajes de conversación
- ❌ Números telefónicos de usuarios o modelos
- ❌ Datos personales más allá de referencias abstractas
- ❌ Razones de decisiones del Core
- ❌ Estados internos del Core
- ❌ Señales de Nectar
- ❌ Reglas del Core
- ❌ Historial de conversaciones
- ❌ Patrones de uso individual de usuarios
- ❌ Correlación entre handoffs y personas reales

**Principio**: Observabilidad técnica y agregada, no observabilidad de contenido ni de decisiones.

---

## 8. Riesgos Operativos Residuales y Mitigaciones

### 8.1. Tabla de Riesgos

| Riesgo | Impacto | Mitigación | Señal de Detección | Acción |
|--------|---------|------------|-------------------|--------|
| **Pérdida de Handoffs Activos por Falla de Almacenamiento** | Usuarios con handoffs activos pierden acceso temporal | TTL corto (~5 minutos) limita ventana de pérdida. Usuarios pueden solicitar nuevo handoff. | Almacenamiento Temporal no disponible por > 30 segundos | Activar kill-switch si persiste. Notificar operadores. |
| **Falla Silenciosa del Proveedor** | Usuario queda sin conexión sin notificación clara | Timeouts en llamadas al proveedor (10 segundos). Registro de eventos de ejecución. | Tasa de errores de ejecución del proveedor > 10% en 1 hora | Revisar conectividad. Notificar operadores. Considerar kill-switch. |
| **Bypass del WAM mediante Handoff ID Comprometido** | Handoff comprometido puede usarse una vez antes de expiración | Uso único y TTL corto limitan ventana de ataque. Validación estricta en Resolver. | Intentos de reutilización de handoff detectados | Registrar intento. No exponer información. Handoff ya está REDEEMED. |
| **Dependencia del Chat para Autorización** | Falla en Chat puede resultar en handoff no autorizado ejecutado por WAM | Contrato formal entre Chat y WAM. El Chat tiene responsabilidad explícita de consultar Core. | Handoff ejecutado sin autorización del Core (detectable solo por auditoría externa) | **DETENCIÓN INMEDIATA**: Activar kill-switch. Invalidar todos los handoffs activos. Investigar causa. Documentar incidente. |
| **Escalabilidad Limitada del Almacenamiento Temporal** | Picos de tráfico pueden saturar almacenamiento y causar rechazo de handoffs válidos | TTL corto limita acumulación. Handoffs expirados se eliminan automáticamente. | Tasa de rechazos por almacenamiento > 5% en 1 hora | Activar kill-switch. Evaluar escalado en fase posterior. |
| **Exposición de Números Telefónicos o Datos Personales** | Violación de privacidad y principios arquitectónicos | Validación estricta de que solo se almacenan referencias abstractas. Revisión de código y logs. | Detección de números telefónicos o datos personales en almacenamiento o logs | **DETENCIÓN INMEDIATA**: Activar kill-switch. Eliminar información expuesta. Revisar código. Investigar causa. Documentar incidente. |
| **Almacenamiento de Contenido de Conversación** | Violación de principios arquitectónicos | Validación estricta de que no se almacena contenido. Revisión de código y almacenamiento. | Detección de contenido de mensajes en almacenamiento | **DETENCIÓN INMEDIATA**: Activar kill-switch. Eliminar contenido almacenado. Revisar código. Investigar causa. Documentar incidente. |
| **Violación de Uso Único o TTL** | Compromiso de control de acceso temporal | Validación estricta de atomicidad y TTL. Tests automatizados. | Detección de handoff reutilizado o TTL extendido | **DETENCIÓN INMEDIATA**: Activar kill-switch. Invalidar todos los handoffs activos. Revisar lógica. Investigar causa. Documentar incidente. |
| **Dependencia Directa del Core** | Violación de separación de capas | Validación estricta de que WAM no consulta Core directamente. Revisión de código y dependencias. | Detección de llamadas directas al Core desde WAM | **DETENCIÓN INMEDIATA**: Activar kill-switch. Revertir cambios. Revisar arquitectura. Investigar causa. Documentar incidente. |

### 8.2. Señales que Fuerzan DETENCIÓN Inmediata (Kill-Switch o NO-GO)

**Eventos que fuerzan detención inmediata**:
1. **Ejecución de handoff sin autorización del Core**: Handoff ejecutado que no fue autorizado por el Core (detectable solo por auditoría externa)
2. **Exposición de números telefónicos o datos personales**: Detección de PII en almacenamiento o logs
3. **Almacenamiento de contenido de conversación**: Detección de mensajes o contenido en almacenamiento
4. **Violación de uso único o TTL**: Handoff reutilizado o TTL extendido
5. **Dependencia directa del Core**: Llamadas directas al Core desde WAM
6. **Modificación del Core sellado**: Intentos de modificar Elixir Core v1.0
7. **Pérdida de capacidad de auditoría**: Eventos no registrados en logs

**Procedimiento de detención**:
1. Activar kill-switch inmediatamente (modo DROP)
2. Invalidar todos los handoffs activos (opcional, según riesgo)
3. Registrar evento de detención con causa
4. Notificar a responsables operacionales
5. Investigar causa raíz
6. Documentar incidente
7. No reanudar operación hasta resolución de causa

**Asunción operativa**: Detención inmediata previene escalada de riesgos. No se negocia ni se pospone detención.

---

## 9. Plan de Despliegue Controlado (Sin Proveedor)

### 9.1. Ambientes Mínimos

**Ambientes requeridos**:

**Ambiente DEV**:
- Propósito: Desarrollo y testing de componentes
- Acceso: Desarrolladores del WAM
- Datos: Datos sintéticos, no datos reales
- Proveedor: Mock o sandbox del proveedor (no producción)

**Ambiente GO-CONTROLLED**:
- Propósito: Operación controlada con usuarios limitados
- Acceso: Operadores autorizados y desarrolladores del WAM
- Datos: Datos reales de usuarios limitados
- Proveedor: Proveedor real en modo sandbox o producción controlada

**No requiere**:
- Ambiente de staging separado (GO-CONTROLLED es suficiente)
- Ambiente de producción separado (GO-CONTROLLED es producción controlada)
- Múltiples ambientes de testing

**Asunción operativa**: Dos ambientes son suficientes para GO CONTROLADO. No requiere infraestructura compleja de ambientes.

### 9.2. Acceso Restringido

**Control de acceso**:
- Acceso a ambiente DEV: Solo desarrolladores del WAM
- Acceso a ambiente GO-CONTROLLED: Operadores autorizados y desarrolladores del WAM
- Acceso a kill-switch: Solo operadores autorizados
- Acceso a logs y métricas: Solo operadores autorizados y desarrolladores del WAM
- Acceso a almacenamiento temporal: Solo sistema WAM (no acceso directo)

**Autenticación**:
- Autenticación requerida para acceso a ambientes
- Autenticación requerida para activación de kill-switch
- Autenticación requerida para acceso a logs y métricas
- No requiere autenticación compleja (usuario/contraseña es suficiente en GO CONTROLADO)

**Autorización**:
- Roles definidos: Desarrollador, Operador
- Permisos por rol: Desarrollador (lectura/escritura en DEV, lectura en GO-CONTROLLED), Operador (lectura/escritura en GO-CONTROLLED, activación kill-switch)

**Asunción operativa**: Control de acceso básico es suficiente. No requiere sistemas avanzados de IAM en GO CONTROLADO.

### 9.3. Rotación de Secretos (Sin Revelar Valores)

**Secretos que requieren rotación**:
- Credenciales del proveedor de WhatsApp (API keys, tokens)
- Credenciales de acceso a almacenamiento temporal (si aplica)
- Certificados TLS/SSL para ingress

**Frecuencia de rotación**:
- Credenciales del proveedor: Cada 90 días o según política del proveedor
- Credenciales de almacenamiento: Cada 90 días
- Certificados TLS/SSL: Según validez del certificado (típicamente 90 días)

**Procedimiento de rotación**:
1. Generar nuevos secretos
2. Actualizar configuración en ambiente (sin commitear secretos)
3. Validar que sistema opera correctamente con nuevos secretos
4. Invalidar secretos antiguos
5. Registrar evento de rotación (sin revelar valores)

**Almacenamiento de secretos**:
- Secretos no se almacenan en código
- Secretos no se almacenan en repositorio
- Secretos se almacenan en variables de entorno o sistema de secretos
- Secretos se rotan sin revelar valores en logs o documentación

**Asunción operativa**: Rotación manual es suficiente. No requiere sistemas avanzados de gestión de secretos en GO CONTROLADO.

### 9.4. Procedimiento de Rollback Operativo (No del Core)

**Rollback de componentes del WAM**:
- Rollback de código del WAM a versión anterior estable
- Rollback de configuración a versión anterior estable
- Rollback de secretos a versión anterior (si nuevo secreto causa fallas)

**No se hace rollback de**:
- Elixir Core (Core está sellado, no se modifica)
- Contratos entre capas (contratos son estables)
- Estructura de datos de handoffs (estructura es estable)

**Procedimiento de rollback**:
1. Identificar versión estable anterior
2. Detener procesamiento de handoffs (activar kill-switch)
3. Restaurar código a versión anterior
4. Restaurar configuración a versión anterior
5. Validar que sistema opera correctamente
6. Desactivar kill-switch
7. Registrar evento de rollback

**Validación post-rollback**:
- Verificar que handoffs se procesan correctamente
- Verificar que métricas están dentro de rangos normales
- Verificar que no hay errores críticos
- Verificar que capacidad de auditoría se mantiene

**Asunción operativa**: Rollback operativo es procedimiento manual. No requiere automatización avanzada en GO CONTROLADO.

---

## 10. Checklist de Preparación para Implementación Técnica

### 10.1. Requisitos Previos

**Documentación**:
- [ ] Este documento está completo y aprobado
- [ ] `ARQUITECTURA_MINIMA_CANAL_WAM.md` está revisado y alineado
- [ ] `IMPLEMENTACION_MINIMA_WAM_GO_CONTROLADO.md` está revisado y alineado
- [ ] `CRITERIOS_SALIDA_GO_CONTROLADO_A_GO.md` está revisado y alineado
- [ ] `ELIXIR_CORE_CONTRATO.md` está revisado y alineado
- [ ] `ELIXIR_CORE_ESTRES_Y_ABUSO.md` está revisado y alineado

**Arquitectura**:
- [ ] Separación estricta de capas confirmada (WAM no consulta Core)
- [ ] Contratos entre capas definidos y documentados
- [ ] Estructura de datos de handoffs definida
- [ ] Flujos operativos end-to-end documentados

**Infraestructura**:
- [ ] Tipo de runtime definido (service HTTP/HTTPS)
- [ ] Modelo de concurrencia definido (request-driven, secuencial)
- [ ] Timeouts canónicos definidos
- [ ] Componentes de infraestructura mínimos identificados

**Controles**:
- [ ] Rate limiting definido
- [ ] Idempotencia definida
- [ ] Uso único (atomicidad) definido
- [ ] Timeouts end-to-end definidos
- [ ] Kill-switch definido (modos y efecto)

**Observabilidad**:
- [ ] Métricas agregadas permitidas definidas
- [ ] SLOs técnicos definidos
- [ ] Alertas mínimas definidas
- [ ] Qué NO se observa documentado

**Riesgos**:
- [ ] Riesgos operativos residuales documentados
- [ ] Mitigaciones definidas
- [ ] Señales de detección definidas
- [ ] Acciones de respuesta definidas
- [ ] Eventos que fuerzan detención inmediata documentados

**Despliegue**:
- [ ] Ambientes mínimos definidos (DEV, GO-CONTROLLED)
- [ ] Control de acceso definido
- [ ] Rotación de secretos definida
- [ ] Procedimiento de rollback definido

### 10.2. Confirmación de Invariantes

**Invariantes arquitectónicos**:
- [ ] El WAM no consulta al Core directamente
- [ ] El WAM no almacena contenido de conversación
- [ ] El WAM no expone números telefónicos o datos personales
- [ ] El WAM no modifica el Core
- [ ] El WAM no decide, no explica, no aprende

**Invariantes operativos**:
- [ ] Handoffs tienen TTL estricto (~5 minutos)
- [ ] Handoffs son de uso único (no reutilizables)
- [ ] Transiciones de estado son atómicas
- [ ] Timeouts se aplican correctamente
- [ ] Kill-switch detiene procesamiento inmediatamente

**Invariantes de datos**:
- [ ] Solo se almacenan metadatos permitidos
- [ ] No se almacenan campos prohibidos
- [ ] TTL y borrado automático funcionan correctamente
- [ ] No hay persistencia más allá de TTL

**Invariantes de observabilidad**:
- [ ] Solo se observan métricas agregadas permitidas
- [ ] No se observa contenido, PII ni decisiones del Core
- [ ] Alertas mínimas están configuradas
- [ ] SLOs técnicos están definidos

### 10.3. Estado Final

**Confirmación de estado GO CONTROLADO**:
- [ ] Sistema mantiene estado GO CONTROLADO
- [ ] El WAM es ejecutor puro sin lógica decisional
- [ ] Todas las decisiones provienen del Core a través del Chat
- [ ] Diseño está alineado con operación controlada
- [ ] No se introducen dependencias al Core

**Confirmación de separación de capas**:
- [ ] El WAM opera como capa independiente
- [ ] El WAM no modifica Core ni Chat
- [ ] El WAM solo ejecuta handoffs autorizados
- [ ] El Core no aparece como dependiente

**Confirmación de preparación**:
- [ ] Checklist completo está verificado
- [ ] Invariantes están confirmados
- [ ] Documentación está completa
- [ ] Sistema está listo para implementación técnica (fase posterior)

---

## 11. Resumen Ejecutivo del Diseño

### 11.1. Diseño de Runtime

El WAM opera como **runtime tipo service** (servicio HTTP/HTTPS) con procesamiento **request-driven** y **concurrencia baja**. Cada solicitud se procesa de forma síncrona e independiente, sin estado compartido entre solicitudes. Timeouts canónicos previenen bloqueos: 2 segundos para almacenamiento, 10 segundos para proveedor, 15 segundos total.

### 11.2. Componentes de Infraestructura

Infraestructura mínima incluye: **Ingress** (receptor HTTP), **Handoff Resolver** (validador opaco con uso único), **Almacenamiento Temporal** (TTL estricto, limpieza automática, atomicidad), **Sender** (conector abstracto al proveedor), **Observabilidad Mínima** (métricas agregadas, alertas básicas), **Kill-Switch** (manual, modos DROP y SILENCIO).

### 11.3. Modelo de Datos

Solo metadatos permitidos: `handoff_id`, `session_id`, `user_ref`, `model_ref`, `status`, `created_at`, `expires_at`. Prohibido: contenido, números telefónicos, PII, decisiones del Core. TTL estricto: ~5 minutos. Borrado automático tras TTL. Sin recuperación.

### 11.4. Controles Operativos

**Rate limiting**: 10 resoluciones/minuto por IP, 5 creaciones/minuto por sesión. **Idempotencia**: Operaciones repetidas no tienen efectos adicionales. **Uso único**: Consumo atómico del handoff (transición CREATED → REDEEMED es atómica). **Timeouts end-to-end**: 15 segundos total. **Kill-switch**: Modos DROP y SILENCIO, activación manual.

### 11.5. Observabilidad

Métricas agregadas permitidas: contadores de handoffs, tasas de éxito, tiempos de respuesta. SLOs técnicos: disponibilidad ≥ 95%, tasa de éxito ≥ 90%, p95 ≤ 5 segundos. Alertas mínimas: almacenamiento no disponible, proveedor no responde, tasas de error exceden umbrales. Prohibido observar: contenido, PII, decisiones del Core.

### 11.6. Riesgos y Mitigaciones

Riesgos aceptados: pérdida de handoffs activos, falla silenciosa del proveedor, bypass mediante handoff ID comprometido, dependencia del Chat, escalabilidad limitada. Riesgos no aceptables (fuerzan detención inmediata): ejecución sin autorización, exposición de PII, almacenamiento de contenido, violación de uso único/TTL, dependencia directa del Core.

### 11.7. Despliegue

Ambientes mínimos: DEV (desarrollo) y GO-CONTROLLED (operación controlada). Acceso restringido: roles de Desarrollador y Operador. Rotación de secretos: cada 90 días. Rollback operativo: procedimiento manual para código y configuración del WAM (no del Core).

---

## 12. Lista de Riesgos Abiertos

### 12.1. Riesgos Aceptados (Con Mitigaciones Parciales)

1. **Pérdida de Handoffs Activos por Falla de Almacenamiento**: Mitigación parcial (TTL corto). Riesgo residual aceptado.
2. **Falla Silenciosa del Proveedor**: Mitigación parcial (timeouts). Riesgo residual aceptado.
3. **Bypass del WAM mediante Handoff ID Comprometido**: Mitigación parcial (uso único, TTL corto). Riesgo residual aceptado.
4. **Dependencia del Chat para Autorización**: Mitigación parcial (contrato formal). Riesgo residual aceptado.
5. **Escalabilidad Limitada del Almacenamiento Temporal**: Mitigación parcial (TTL corto, limpieza automática). Riesgo residual aceptado.

### 12.2. Riesgos No Aceptables (Fuerzan Detención Inmediata)

1. **Ejecución de Handoff sin Autorización del Core**: Detección por auditoría externa. Acción: kill-switch inmediato.
2. **Exposición de Números Telefónicos o Datos Personales**: Detección por revisión de almacenamiento/logs. Acción: kill-switch inmediato.
3. **Almacenamiento de Contenido de Conversación**: Detección por revisión de almacenamiento. Acción: kill-switch inmediato.
4. **Violación de Uso Único o TTL**: Detección por tests automatizados o auditoría. Acción: kill-switch inmediato.
5. **Dependencia Directa del Core**: Detección por revisión de código/dependencias. Acción: kill-switch inmediato.

### 12.3. Riesgos de Implementación (A Resolver en Fase Técnica)

1. **Selección de Proveedor Concreto**: Decisión pendiente en fase de implementación técnica.
2. **Implementación de Almacenamiento Temporal**: Tecnología específica (memoria, Redis, base de datos) pendiente.
3. **Implementación de Observabilidad**: Sistema específico de métricas/logs pendiente.
4. **Implementación de Kill-Switch**: Mecanismo específico (API, configuración) pendiente.

---

## 13. Confirmación Final

### 13.1. El Core No Aparece como Dependiente

✅ **Confirmado**: El WAM no consulta al Core directamente. El WAM recibe handoffs ya autorizados por el Core a través del Chat. El Core no tiene dependencias del WAM. El diseño de infraestructura y runtime respeta esta separación estricta.

### 13.2. Separación Estricta de Capas

✅ **Confirmado**: El WAM opera como capa independiente. No modifica Core, no modifica Chat. Solo ejecuta handoffs autorizados. El diseño de infraestructura mantiene esta separación.

### 13.3. Estado GO CONTROLADO

✅ **Confirmado**: El sistema mantiene estado **GO CONTROLADO**. El WAM es ejecutor puro sin lógica decisional. Todas las decisiones provienen del Core a través del Chat. El diseño de infraestructura está alineado con operación controlada con usuarios limitados y volumen bajo.

### 13.4. Diseño Completo

✅ **Confirmado**: El diseño de infraestructura y runtime está completo con todas las secciones requeridas:
- Runtime del WAM (modelo conceptual)
- Componentes de infraestructura mínimos (abstractos)
- Modelo de datos (solo metadatos permitidos)
- Controles operativos obligatorios
- Observabilidad permitida y alertas mínimas
- Riesgos operativos residuales y mitigaciones
- Plan de despliegue controlado (sin proveedor)
- Checklist de preparación para implementación técnica

---

## 14. Frase Canónica del Diseño

**El WAM ejecuta handoffs autorizados. No decide, no explica, no aprende. Conecta una vez y desaparece. En GO CONTROLADO, opera con runtime request-driven, infraestructura mínima, controles estrictos, observabilidad mínima y riesgos documentados. El diseño de infraestructura y runtime está listo para implementación técnica en fase posterior.**

---

**Versión del Documento**: 1.0  
**Fecha**: 2024  
**Estado**: GO CONTROLADO — Diseño de Infraestructura y Runtime Definido  
**Próximos Pasos**: Validación de coherencia con documentación existente y preparación para implementación técnica

---

**FIN DEL DOCUMENTO**


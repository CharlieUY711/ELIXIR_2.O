# FASE 2.1 — Gate de Existencia Operativa

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 2 — Chat P2P Controlado  
**Fase**: FASE 2.1 — Gate de Existencia Operativa  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 2.1

### 1.1. Función Exacta del Gate de Existencia Operativa

El Gate de Existencia Operativa es el primer punto de evaluación obligatorio en el BLOQUE 2. Su función es determinar si el sistema puede y debe procesar una solicitud de operación de chat, evaluando simultáneamente la validez del usuario y la capacidad operativa del sistema.

El gate opera como un filtro binario que precede a todas las operaciones del BLOQUE 2. No procesa mensajes, no gestiona sesiones, no ejecuta comunicaciones. Su única responsabilidad es emitir una decisión binaria: ALLOW o DENY.

### 1.2. Necesidad del Gate Incluso con Usuarios Válidos

El gate es necesario incluso cuando un usuario ha completado exitosamente el BLOQUE 1 y posee una identidad válida en el sistema, porque:

1. **Separación de responsabilidades**: El BLOQUE 1 establece identidad y estados de cuenta. El BLOQUE 2 requiere verificación operativa independiente antes de iniciar operaciones de chat.

2. **Estado operativo dinámico**: El sistema puede estar operativo en un momento y no operativo en otro, independientemente de la validez de los usuarios. El gate evalúa el estado operativo actual, no histórico.

3. **Kill-switch global**: El kill-switch puede activarse en cualquier momento, requiriendo denegación inmediata de todas las operaciones, incluso para usuarios válidos.

4. **Principio de apagabilidad**: El sistema debe poder detenerse completamente sin dejar operaciones en curso inconsistentes. El gate garantiza que no se inicien nuevas operaciones cuando el sistema no está operativo.

5. **Fail-closed por defecto**: Ante cualquier ambigüedad o fallo en la evaluación, el gate debe denegar. Esta evaluación independiente garantiza que no se asume operatividad por defecto.

---

## 2. Alcance Explícito

### 2.1. Qué Evalúa Esta Fase

Esta fase evalúa exclusivamente:

1. **Existencia de usuario válido**: Verifica que el usuario referenciado en la solicitud existe en el sistema y posee un estado válido según los criterios del BLOQUE 1.

2. **Estado operativo global del sistema**: Verifica que el sistema está en condiciones de procesar operaciones de chat en el momento de la solicitud.

3. **Kill-switch global**: Verifica que el kill-switch global no está activo en modo que requiera denegación.

### 2.2. Qué NO Evalúa Bajo Ningún Concepto

Esta fase **NO** evalúa:

- ❌ **Contenido de mensajes**: No examina, valida ni procesa el contenido de los mensajes a enviar o recibir.
- ❌ **Disponibilidad de destinatarios**: No verifica si el destinatario está disponible, activo o accesible.
- ❌ **Límites de sesión**: No evalúa límites de tiempo, cantidad de mensajes o duración de conversaciones.
- ❌ **Capacidad de almacenamiento**: No verifica disponibilidad de almacenamiento para sesiones o mensajes.
- ❌ **Estado de servicios externos**: No verifica el estado de WAM, proveedores de WhatsApp u otros servicios externos.
- ❌ **Reglas de negocio específicas**: No aplica reglas de negocio sobre permisos, roles, restricciones de contenido o políticas de uso.
- ❌ **Autenticación o autorización detallada**: No realiza autenticación de credenciales ni autorización granular de operaciones.
- ❌ **Validación de formato de solicitud**: No valida el formato, estructura o integridad de la solicitud recibida.
- ❌ **Coherencia de contexto de sesión**: No verifica coherencia de sesiones existentes ni estado de conversaciones en curso.
- ❌ **Cualquier aspecto funcional del chat**: No evalúa funcionalidades, características o capacidades del sistema de chat.

---

## 3. Entradas Lógicas

### 3.1. Información Mínima Recibida

El gate recibe la siguiente información mínima:

1. **Identificador de usuario**: Referencia opaca al usuario que realiza la solicitud. Esta referencia debe ser válida según el modelo del BLOQUE 1.

2. **Tipo de operación solicitada**: Indicador del tipo de operación de chat que se solicita (inicio de conversación, envío de mensaje, etc.). El gate no procesa esta información, solo la recibe.

3. **Timestamp de solicitud**: Marca temporal de cuando se realiza la solicitud, necesaria para evaluar el estado operativo en el momento exacto de la solicitud.

### 3.2. Dependencias Explícitas del BLOQUE 1

El gate depende explícitamente del BLOQUE 1 para:

1. **Modelo de identidad**: Utiliza el modelo de identidad y estados definidos en FASE 1.1 para determinar qué constituye un "usuario válido".

2. **Estados de cuenta**: Consulta los estados de cuenta establecidos en el BLOQUE 1 (APPROVED, estados de gates, etc.) para determinar validez del usuario.

3. **Artefactos de registro**: Utiliza los artefactos creados durante el registro (identidad técnica provisional, estados de gates) para verificar existencia y validez.

4. **Invariantes fundamentales**: Respeta los invariantes establecidos en el BLOQUE 1 (D0, Default Deny, Apagabilidad) sin modificarlos ni reinterpretarlos.

**Regla explícita**: El gate NO modifica, extiende ni reinterpreta el modelo del BLOQUE 1. Solo consulta y utiliza la información establecida por el BLOQUE 1 para realizar su evaluación.

---

## 4. Evaluaciones Realizadas

### 4.1. Existencia de Usuario Válido

El gate verifica que:

1. **El usuario existe**: El identificador de usuario proporcionado corresponde a una identidad creada en el sistema según el modelo del BLOQUE 1.

2. **El usuario tiene estado válido**: El usuario posee un estado que permite operaciones según las reglas del BLOQUE 1. Un usuario en estado APPROVED del BLOQUE 1 es considerado válido para esta evaluación.

3. **El usuario no está en estado terminal negativo**: El usuario no está en estados terminales que impiden operación (DENIED, FAILED, ABANDONED según el modelo del BLOQUE 1).

**Criterio de validez**: Un usuario es válido si existe en el sistema y su estado permite operaciones según el modelo del BLOQUE 1. El gate no redefine qué significa "válido", solo consulta el modelo establecido.

**Comportamiento ante fallo**: Si el usuario no existe, no se puede determinar su estado, o su estado no permite operaciones, la evaluación de existencia de usuario válido falla.

### 4.2. Estado Operativo Global del Sistema

El gate verifica que:

1. **El sistema está operativo**: El sistema está en condiciones de procesar operaciones de chat. Esta evaluación es independiente de la validez de usuarios individuales.

2. **No hay condiciones que impidan operación**: No existen condiciones técnicas, operativas o de negocio que impidan el procesamiento de operaciones de chat en el momento de la solicitud.

3. **Los servicios críticos están disponibles**: Los servicios críticos necesarios para operaciones de chat están disponibles y respondiendo. Esta verificación es mínima y no implica validación exhaustiva de todos los servicios.

**Criterio de operatividad**: El sistema está operativo si no existen impedimentos conocidos para procesar operaciones de chat. La ausencia de impedimentos conocidos no garantiza éxito de operaciones posteriores, solo que el sistema puede intentar procesarlas.

**Comportamiento ante fallo**: Si el sistema no está operativo, hay condiciones que impiden operación, o los servicios críticos no están disponibles, la evaluación de estado operativo global falla.

### 4.3. Kill-Switch Global

El gate verifica que:

1. **El kill-switch no está activo en modo DROP**: El kill-switch global no está en estado ACTIVE_DROP, que requiere denegación inmediata de todas las operaciones.

2. **El kill-switch no está activo en modo SILENCIO (si aplica)**: Si el kill-switch está en estado ACTIVE_SILENCIO y la política requiere denegación de nuevas operaciones, el gate debe denegar.

**Prioridad absoluta**: El kill-switch global tiene prioridad absoluta sobre todas las demás evaluaciones. Si el kill-switch está activo en modo que requiere denegación, el gate debe emitir DENY independientemente del resultado de otras evaluaciones.

**Comportamiento ante fallo**: Si el kill-switch está activo en modo que requiere denegación, o si no se puede determinar el estado del kill-switch, la evaluación del kill-switch falla y el gate debe emitir DENY.

---

## 5. Decisiones Posibles

### 5.1. ALLOW

**Definición**: El gate emite ALLOW cuando todas las evaluaciones resultan favorables y no existen impedimentos para que el sistema procese la solicitud de operación de chat.

**Condiciones exactas para ALLOW**:

1. **Existencia de usuario válido**: La evaluación de existencia de usuario válido ha resultado exitosa. El usuario existe, tiene estado válido y no está en estado terminal negativo.

2. **Estado operativo global**: La evaluación de estado operativo global ha resultado exitosa. El sistema está operativo, no hay condiciones que impidan operación y los servicios críticos están disponibles.

3. **Kill-switch inactivo**: El kill-switch global no está activo en modo que requiera denegación, o está en estado INACTIVE.

**Regla explícita**: ALLOW solo puede emitirse si TODAS las condiciones se cumplen simultáneamente. La ausencia de fallo en una evaluación no implica éxito; cada evaluación debe resultar explícitamente exitosa.

**Impacto de ALLOW**: La emisión de ALLOW permite que la solicitud proceda a la FASE 2.2. No garantiza éxito de operaciones posteriores, solo que el gate no impide el avance.

### 5.2. DENY

**Definición**: El gate emite DENY cuando alguna evaluación resulta desfavorable o cuando existen impedimentos para que el sistema procese la solicitud.

**Condiciones exactas para DENY**:

1. **Usuario no válido**: El usuario no existe, no se puede determinar su estado, su estado no permite operaciones, o está en estado terminal negativo.

2. **Sistema no operativo**: El sistema no está operativo, hay condiciones que impiden operación, o los servicios críticos no están disponibles.

3. **Kill-switch activo**: El kill-switch global está activo en modo que requiere denegación (ACTIVE_DROP o ACTIVE_SILENCIO según política).

4. **Fallo en evaluación**: Cualquier error, excepción, timeout o condición no prevista durante las evaluaciones.

5. **Ambigüedad o incertidumbre**: Cualquier situación donde no se puede determinar con certeza que todas las condiciones para ALLOW se cumplen.

**Regla explícita**: DENY se emite si ALGUNA condición de denegación se cumple, o si existe cualquier duda sobre el cumplimiento de condiciones para ALLOW. El principio fail-closed requiere denegación ante ambigüedad.

**Impacto de DENY**: La emisión de DENY impide que la solicitud proceda a la FASE 2.2. La solicitud termina en esta fase sin ejecución de operaciones de chat.

---

## 6. Salidas

### 6.1. Forma Canónica de la Decisión

El gate emite una decisión en forma canónica que consiste únicamente en:

1. **Resultado binario**: ALLOW o DENY. No hay resultados intermedios, parciales o condicionales.

2. **Timestamp de decisión**: Marca temporal que indica cuándo se tomó la decisión, necesaria para auditoría y trazabilidad.

3. **Identificador de solicitud**: Referencia opaca a la solicitud evaluada, necesaria para correlación con operaciones posteriores.

**Formato canónico**: La decisión se representa como una estructura mínima que contiene únicamente estos tres elementos. No incluye razones, explicaciones, metadata adicional, scores, señales internas ni información sobre el proceso de evaluación.

**Regla explícita**: La decisión no expone información sobre por qué se tomó la decisión, qué evaluaciones fallaron, qué condiciones se cumplieron o cualquier detalle del proceso interno. Solo expone el resultado binario.

### 6.2. Aclaración: No Hay Side-Effects Ni Ejecución Posterior

El gate **NO** realiza:

- ❌ **Modificaciones de estado**: No modifica estados de usuarios, sesiones, cuentas ni ningún artefacto del sistema.
- ❌ **Creación de recursos**: No crea sesiones, conversaciones, mensajes ni ningún recurso del sistema.
- ❌ **Ejecución de operaciones**: No ejecuta operaciones de chat, comunicación, almacenamiento ni procesamiento.
- ❌ **Registro de eventos de negocio**: No registra eventos de negocio, transacciones ni operaciones realizadas.
- ❌ **Notificaciones o comunicaciones**: No envía notificaciones, mensajes ni comunicaciones a usuarios o sistemas externos.
- ❌ **Actualización de métricas de negocio**: No actualiza métricas de uso, actividad ni operaciones de negocio.
- ❌ **Cualquier acción que modifique el estado del sistema**: No realiza ninguna acción que altere el estado observable del sistema más allá de la emisión de la decisión.

**Única acción permitida**: El gate solo puede registrar la decisión emitida para propósitos de auditoría y trazabilidad técnica. Este registro no constituye un side-effect de negocio, solo un artefacto técnico necesario para operación y diagnóstico.

**Regla explícita**: El gate es puramente evaluativo. Su única responsabilidad es emitir una decisión binaria. Cualquier acción posterior a la decisión es responsabilidad de fases posteriores, no del gate.

---

## 7. Principios de Seguridad y Apagabilidad

### 7.1. Cómo Esta Fase Garantiza el Principio Rector del Sistema

El principio rector del sistema establece: **"El sistema debe poder apagarse antes de poder crecer."**

Esta fase garantiza este principio mediante:

1. **Evaluación independiente de operatividad**: El gate evalúa el estado operativo del sistema independientemente de la validez de usuarios. Esto permite que el sistema pueda detenerse sin afectar la validez de identidades establecidas.

2. **Prioridad absoluta del kill-switch**: El kill-switch tiene prioridad absoluta sobre todas las demás evaluaciones. Cuando el kill-switch está activo, el gate deniega todas las solicitudes, permitiendo detención inmediata del sistema.

3. **Fail-closed por defecto**: Ante cualquier fallo, error, ambigüedad o incertidumbre, el gate deniega. Esto garantiza que el sistema no continúe operando en condiciones inciertas o peligrosas.

4. **Separación de evaluación y ejecución**: El gate solo evalúa y decide. No ejecuta operaciones. Esta separación permite que el sistema pueda detenerse sin dejar operaciones en curso inconsistentes.

5. **Evaluación en tiempo real**: El gate evalúa el estado operativo en el momento exacto de la solicitud, no en base a estados históricos o asumidos. Esto permite que el sistema responda inmediatamente a cambios en su estado operativo.

### 7.2. Comportamiento por Defecto Ante Fallos

El gate implementa el principio fail-closed mediante el siguiente comportamiento:

1. **Fallo en evaluación de usuario**: Si no se puede determinar la existencia o validez del usuario, el gate deniega.

2. **Fallo en evaluación de estado operativo**: Si no se puede determinar el estado operativo del sistema, el gate deniega.

3. **Fallo en evaluación de kill-switch**: Si no se puede determinar el estado del kill-switch, el gate deniega.

4. **Errores técnicos**: Cualquier error técnico, excepción, timeout o condición no prevista durante las evaluaciones resulta en denegación.

5. **Timeouts o silencio**: Si alguna evaluación no responde dentro del tiempo esperado o permanece en silencio, el gate deniega.

6. **Datos faltantes o inválidos**: Si falta información necesaria para las evaluaciones o los datos recibidos son inválidos, el gate deniega.

**Regla explícita**: El principio fail-closed tiene prioridad absoluta sobre cualquier optimización, conveniencia o intento de continuidad de servicio. La seguridad y apagabilidad priman sobre la disponibilidad.

**Justificación**: Es preferible denegar una solicitud válida en condiciones inciertas que permitir una solicitud inválida o peligrosa. El sistema debe errar hacia la denegación, no hacia la permisividad.

---

## 8. Exclusiones Explícitas

### 8.1. Todo Lo Que Esta Fase NO Hace

Esta fase **NO** realiza las siguientes acciones, evaluaciones o responsabilidades:

- ❌ **NO procesa mensajes**: No examina, valida, transforma ni procesa el contenido de mensajes.
- ❌ **NO gestiona sesiones**: No crea, modifica, consulta ni gestiona sesiones de chat.
- ❌ **NO ejecuta comunicaciones**: No envía mensajes, no establece conexiones, no interactúa con WAM ni proveedores externos.
- ❌ **NO valida formato de solicitud**: No valida la estructura, formato, integridad ni coherencia de la solicitud recibida.
- ❌ **NO aplica reglas de negocio**: No evalúa permisos, roles, restricciones de contenido, políticas de uso ni reglas de negocio específicas.
- ❌ **NO realiza autenticación detallada**: No valida credenciales, tokens, firmas ni mecanismos de autenticación.
- ❌ **NO consulta servicios externos**: No consulta WAM, proveedores de WhatsApp, servicios de almacenamiento ni otros sistemas externos.
- ❌ **NO modifica estados**: No modifica estados de usuarios, cuentas, sesiones ni ningún artefacto del sistema.
- ❌ **NO genera recursos**: No genera identificadores, tokens, handoffs ni ningún recurso del sistema.
- ❌ **NO registra eventos de negocio**: No registra eventos de uso, actividad, transacciones ni operaciones de negocio.
- ❌ **NO actualiza métricas de negocio**: No actualiza contadores, estadísticas ni métricas de uso o actividad.
- ❌ **NO notifica a usuarios**: No envía notificaciones, mensajes ni comunicaciones a usuarios.
- ❌ **NO explica decisiones**: No proporciona razones, explicaciones ni detalles sobre por qué se tomó la decisión.
- ❌ **NO expone información interna**: No expone señales internas, scores, metadata ni información sobre el proceso de evaluación.

### 8.2. Todo Lo Que Esta Fase NO Debe Hacer

Esta fase **NO debe** realizar las siguientes acciones bajo ningún concepto:

- ❌ **NO debe asumir operatividad por defecto**: No debe permitir operaciones asumiendo que el sistema está operativo si no puede verificarlo.
- ❌ **NO debe continuar ante errores**: No debe intentar continuar o recuperarse ante errores en las evaluaciones.
- ❌ **NO debe optimizar para disponibilidad**: No debe priorizar permitir operaciones sobre garantizar seguridad y apagabilidad.
- ❌ **NO debe exponer información interna**: No debe revelar detalles sobre evaluaciones, razones de denegación ni estado interno del sistema.
- ❌ **NO debe realizar side-effects**: No debe modificar el estado del sistema más allá de la emisión de la decisión.
- ❌ **NO debe delegar responsabilidades**: No debe delegar evaluaciones críticas a otros componentes sin garantizar el resultado.
- ❌ **NO debe reinterpretar el modelo del BLOQUE 1**: No debe modificar, extender ni reinterpretar el modelo de identidad y estados establecido en el BLOQUE 1.

**Regla explícita**: Esta fase tiene un alcance estrictamente limitado a la evaluación de existencia operativa. Cualquier funcionalidad, evaluación o responsabilidad fuera de este alcance debe ser implementada en fases posteriores, no en esta fase.

---

## 9. Cierre del Documento

**Regla de transición**: Ingresar a la FASE 2.2 solo si esta fase emite ALLOW.

La FASE 2.2 no puede iniciarse si esta fase emite DENY. La decisión de esta fase es definitiva para determinar si una solicitud puede proceder al procesamiento de operaciones de chat. No hay mecanismo de apelación, bypass ni omisión de esta fase.

---

**Fin del documento**

# FASE 2.2 — Evaluación de Estado del Usuario

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 2 — Chat P2P Controlado  
**Fase**: FASE 2.2 — Evaluación de Estado del Usuario  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 2.2

### 1.1. Función Exacta de la Evaluación de Estado del Usuario

La FASE 2.2 es el segundo punto de evaluación obligatorio en el BLOQUE 2. Su función es determinar el estado operativo actual del usuario que ha superado el Gate de Existencia Operativa (FASE 2.1) y traducir ese estado operativo a una decisión canónica que permita o impida el avance de la solicitud de operación de chat.

Esta fase opera como un evaluador de estado que precede a las operaciones de chat. No procesa mensajes, no gestiona sesiones, no ejecuta comunicaciones. Su única responsabilidad es consultar el estado operativo del usuario y emitir una decisión canónica: ALLOW, HOLD o DENY.

### 1.2. Necesidad de Esta Fase Después del Gate de Existencia Operativa

Esta fase es necesaria incluso cuando el Gate de Existencia Operativa (FASE 2.1) ha emitido ALLOW, porque:

1. **Separación de responsabilidades**: La FASE 2.1 evalúa existencia y operatividad global. La FASE 2.2 evalúa el estado operativo específico del usuario, que puede diferir del estado de existencia.

2. **Estados operativos dinámicos**: El estado operativo de un usuario puede cambiar independientemente de su existencia en el sistema. Un usuario puede existir y estar válido, pero encontrarse en un estado operativo que requiera suspensión temporal (HOLD) o denegación (DENY).

3. **Control granular de operaciones**: El sistema requiere control granular sobre qué usuarios pueden realizar operaciones de chat en un momento dado, independientemente de su validez de identidad.

4. **Principio de apagabilidad**: El sistema debe poder suspender operaciones de usuarios específicos sin afectar su existencia en el sistema. Esta fase permite suspensión selectiva mediante estados operativos.

5. **Fail-closed por defecto**: Ante cualquier ambigüedad o fallo en la evaluación del estado operativo, la fase debe denegar. Esta evaluación independiente garantiza que no se asume operatividad por defecto.

---

## 2. Alcance Explícito

### 2.1. Qué Evalúa Esta Fase

Esta fase evalúa exclusivamente:

1. **Estado operativo del usuario**: Consulta el estado operativo actual del usuario referenciado en la solicitud. Los estados operativos son: PENDING, ACTIVE, FROZEN, DENIED.

2. **Traducción de estado a decisión**: Traduce el estado operativo consultado a una decisión canónica según las reglas de decisión establecidas.

### 2.2. Qué NO Evalúa Bajo Ningún Concepto

Esta fase **NO** evalúa:

- ❌ **Estados de registro**: No evalúa estados del BLOQUE 1 (INITIAL, PHONE_PENDING, OTP_PENDING, APPROVED, DENIED, FAILED, ABANDONED). Solo evalúa estados operativos del BLOQUE 2.

- ❌ **Estados de cuenta**: No evalúa estados de cuenta del BLOQUE 1 (provisional, whatsapp_verified, age_verified, payment_enabled, operational). Solo evalúa estados operativos.

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

- ❌ **Existencia del usuario**: No verifica si el usuario existe. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **Operatividad global del sistema**: No verifica el estado operativo global del sistema. Esta evaluación es responsabilidad de la FASE 2.1.

---

## 3. Dependencias Explícitas

### 3.1. Dependencia Directa de la FASE 2.1

Esta fase tiene una dependencia directa y obligatoria de la FASE 2.1:

1. **Condición de ejecución**: Esta fase solo se ejecuta si la FASE 2.1 ha emitido ALLOW. Si la FASE 2.1 emite DENY, esta fase no se ejecuta.

2. **Asunción de validez**: Esta fase asume que el usuario referenciado en la solicitud existe y es válido según los criterios de la FASE 2.1. No re-evalúa existencia ni validez de identidad.

3. **Asunción de operatividad global**: Esta fase asume que el sistema está operativo globalmente según los criterios de la FASE 2.1. No re-evalúa operatividad global ni kill-switch.

**Regla explícita**: Esta fase no puede ejecutarse si la FASE 2.1 no ha emitido ALLOW. La decisión de la FASE 2.1 es prerrequisito absoluto para esta fase.

### 3.2. Relación con BLOQUE 1 Sin Reinterpretarlo

Esta fase se relaciona con el BLOQUE 1 de la siguiente manera:

1. **Consulta de información establecida**: Esta fase puede consultar información establecida en el BLOQUE 1 (identidad del usuario, estados de cuenta) para determinar el estado operativo, pero no modifica ni reinterpreta esa información.

2. **Respeto de invariantes**: Esta fase respeta los invariantes establecidos en el BLOQUE 1 (D0, Default Deny, Apagabilidad) sin modificarlos ni reinterpretarlos.

3. **Separación de responsabilidades**: Esta fase no evalúa estados del BLOQUE 1. Solo evalúa estados operativos del BLOQUE 2. Los estados del BLOQUE 1 son responsabilidad del BLOQUE 1.

**Regla explícita**: Esta fase NO modifica, extiende ni reinterpreta el modelo del BLOQUE 1. Solo consulta y utiliza la información establecida por el BLOQUE 1 para determinar el estado operativo del usuario.

---

## 4. Estados Lógicos Evaluados

### 4.1. Definición Formal de Estados Operativos

Esta fase evalúa cuatro estados operativos canónicos:

1. **PENDING**
   - Estado operativo que indica que el usuario está pendiente de activación operativa.
   - El usuario existe y es válido, pero su estado operativo requiere activación antes de permitir operaciones de chat.
   - Este estado puede resultar de procesos de verificación en curso, activación pendiente o condiciones temporales.

2. **ACTIVE**
   - Estado operativo que indica que el usuario está activo y puede realizar operaciones de chat.
   - El usuario existe, es válido y su estado operativo permite operaciones de chat sin restricciones operativas.

3. **FROZEN**
   - Estado operativo que indica que el usuario está suspendido temporalmente.
   - El usuario existe y es válido, pero su estado operativo requiere suspensión temporal de operaciones de chat.
   - Este estado puede resultar de acciones administrativas, violaciones de políticas o condiciones temporales que requieren suspensión.

4. **DENIED**
   - Estado operativo que indica que el usuario está denegado operativamente.
   - El usuario existe y puede ser válido según identidad, pero su estado operativo impide operaciones de chat.
   - Este estado puede resultar de denegaciones administrativas, violaciones graves de políticas o condiciones que requieren denegación operativa.

### 4.2. Aclaración: Estados Operativos, No Identitarios

**Regla explícita**: Los estados evaluados en esta fase son estados operativos del BLOQUE 2, no estados identitarios del BLOQUE 1.

- Los estados identitarios del BLOQUE 1 (INITIAL, PHONE_PENDING, OTP_PENDING, APPROVED, DENIED, FAILED, ABANDONED) son responsabilidad del BLOQUE 1 y no se evalúan en esta fase.

- Los estados de cuenta del BLOQUE 1 (provisional, whatsapp_verified, age_verified, payment_enabled, operational) son responsabilidad del BLOQUE 1 y no se evalúan en esta fase.

- Los estados operativos del BLOQUE 2 (PENDING, ACTIVE, FROZEN, DENIED) son responsabilidad de esta fase y determinan si el usuario puede realizar operaciones de chat, independientemente de su estado identitario o de cuenta.

**Justificación**: Un usuario puede tener identidad válida y cuenta aprobada (BLOQUE 1) pero encontrarse en estado operativo FROZEN o DENIED (BLOQUE 2), lo que impide operaciones de chat sin afectar su identidad o cuenta.

---

## 5. Reglas de Decisión

### 5.1. Traducción Exacta de Estados a Decisiones Canónicas

Esta fase traduce cada estado operativo a una decisión canónica según las siguientes reglas:

1. **ACTIVE → ALLOW**
   - Si el estado operativo del usuario es ACTIVE, la fase emite ALLOW.
   - ALLOW permite que la solicitud proceda a la FASE 2.3.

2. **PENDING → HOLD**
   - Si el estado operativo del usuario es PENDING, la fase emite HOLD.
   - HOLD suspende temporalmente la solicitud. La solicitud no procede a la FASE 2.3, pero puede ser re-evaluada cuando el estado operativo cambie a ACTIVE.

3. **FROZEN → HOLD**
   - Si el estado operativo del usuario es FROZEN, la fase emite HOLD.
   - HOLD suspende temporalmente la solicitud. La solicitud no procede a la FASE 2.3, pero puede ser re-evaluada cuando el estado operativo cambie a ACTIVE.

4. **DENIED → DENY**
   - Si el estado operativo del usuario es DENIED, la fase emite DENY.
   - DENY impide que la solicitud proceda a la FASE 2.3. La solicitud termina en esta fase.

### 5.2. Reglas Explícitas de Decisión

**Regla explícita 1**: La traducción de estados a decisiones es determinista y no admite excepciones. Cada estado operativo se traduce exactamente a la decisión canónica correspondiente.

**Regla explícita 2**: No existe estado operativo que se traduzca a múltiples decisiones. Cada estado operativo tiene una única decisión canónica asociada.

**Regla explícita 3**: No existe decisión canónica que no corresponda a un estado operativo. Las únicas decisiones posibles son ALLOW (ACTIVE), HOLD (PENDING o FROZEN) y DENY (DENIED).

**Regla explícita 4**: Si no se puede determinar el estado operativo del usuario, la fase emite DENY (fail-closed). La ambigüedad o incertidumbre sobre el estado operativo resulta en denegación.

---

## 6. Salidas de la Fase

### 6.1. Forma Canónica de la Decisión Emitida

La fase emite una decisión en forma canónica que consiste únicamente en:

1. **Resultado canónico**: ALLOW, HOLD o DENY. No hay resultados intermedios, parciales o condicionales.

2. **Timestamp de decisión**: Marca temporal que indica cuándo se tomó la decisión, necesaria para auditoría y trazabilidad.

3. **Identificador de solicitud**: Referencia opaca a la solicitud evaluada, necesaria para correlación con operaciones posteriores.

**Formato canónico**: La decisión se representa como una estructura mínima que contiene únicamente estos tres elementos. No incluye razones, explicaciones, metadata adicional, scores, señales internas ni información sobre el proceso de evaluación.

**Regla explícita**: La decisión no expone información sobre por qué se tomó la decisión, qué estado operativo se consultó, qué condiciones se cumplieron o cualquier detalle del proceso interno. Solo expone el resultado canónico.

### 6.2. Prohibición Explícita de Side-Effects

La fase **NO** realiza:

- ❌ **Modificaciones de estado**: No modifica estados de usuarios, sesiones, cuentas ni ningún artefacto del sistema.

- ❌ **Creación de recursos**: No crea sesiones, conversaciones, mensajes ni ningún recurso del sistema.

- ❌ **Ejecución de operaciones**: No ejecuta operaciones de chat, comunicación, almacenamiento ni procesamiento.

- ❌ **Registro de eventos de negocio**: No registra eventos de negocio, transacciones ni operaciones realizadas.

- ❌ **Notificaciones o comunicaciones**: No envía notificaciones, mensajes ni comunicaciones a usuarios o sistemas externos.

- ❌ **Actualización de métricas de negocio**: No actualiza métricas de uso, actividad ni operaciones de negocio.

- ❌ **Cambio de estados operativos**: No modifica el estado operativo del usuario. Solo consulta el estado operativo actual.

- ❌ **Cualquier acción que modifique el estado del sistema**: No realiza ninguna acción que altere el estado observable del sistema más allá de la emisión de la decisión.

**Única acción permitida**: La fase solo puede registrar la decisión emitida para propósitos de auditoría y trazabilidad técnica. Este registro no constituye un side-effect de negocio, solo un artefacto técnico necesario para operación y diagnóstico.

**Regla explícita**: La fase es puramente evaluativa. Su única responsabilidad es consultar el estado operativo del usuario y emitir una decisión canónica. Cualquier acción posterior a la decisión es responsabilidad de fases posteriores, no de esta fase.

---

## 7. Principios de Seguridad y Apagabilidad

### 7.1. Cómo Esta Fase Refuerza el Principio Rector del Sistema

El principio rector del sistema establece: **"El sistema debe poder apagarse antes de poder crecer."**

Esta fase refuerza este principio mediante:

1. **Evaluación independiente de estado operativo**: La fase evalúa el estado operativo del usuario independientemente de su existencia o validez de identidad. Esto permite que el sistema pueda suspender operaciones de usuarios específicos sin afectar su identidad o cuenta.

2. **Suspensión selectiva mediante HOLD**: El estado operativo FROZEN permite suspensión selectiva de operaciones de usuarios específicos mediante HOLD, sin afectar la operatividad global del sistema ni la identidad de los usuarios.

3. **Denegación operativa mediante DENY**: El estado operativo DENIED permite denegación operativa de usuarios específicos mediante DENY, sin afectar la operatividad global del sistema ni la identidad de los usuarios.

4. **Fail-closed por defecto**: Ante cualquier fallo, error, ambigüedad o incertidumbre en la evaluación del estado operativo, la fase deniega. Esto garantiza que el sistema no continúe operando en condiciones inciertas o peligrosas.

5. **Separación de evaluación y ejecución**: La fase solo evalúa y decide. No ejecuta operaciones. Esta separación permite que el sistema pueda suspender o denegar operaciones sin dejar operaciones en curso inconsistentes.

6. **Evaluación en tiempo real**: La fase evalúa el estado operativo en el momento exacto de la solicitud, no en base a estados históricos o asumidos. Esto permite que el sistema responda inmediatamente a cambios en el estado operativo del usuario.

### 7.2. Comportamiento por Defecto Ante Errores o Estados Desconocidos

La fase implementa el principio fail-closed mediante el siguiente comportamiento:

1. **Fallo en consulta de estado operativo**: Si no se puede consultar el estado operativo del usuario, la fase deniega.

2. **Estado operativo desconocido**: Si el estado operativo consultado no corresponde a ninguno de los estados canónicos (PENDING, ACTIVE, FROZEN, DENIED), la fase deniega.

3. **Errores técnicos**: Cualquier error técnico, excepción, timeout o condición no prevista durante la evaluación del estado operativo resulta en denegación.

4. **Timeouts o silencio**: Si la consulta del estado operativo no responde dentro del tiempo esperado o permanece en silencio, la fase deniega.

5. **Datos faltantes o inválidos**: Si falta información necesaria para consultar el estado operativo o los datos recibidos son inválidos, la fase deniega.

6. **Ambigüedad o incertidumbre**: Cualquier situación donde no se puede determinar con certeza el estado operativo del usuario resulta en denegación.

**Regla explícita**: El principio fail-closed tiene prioridad absoluta sobre cualquier optimización, conveniencia o intento de continuidad de servicio. La seguridad y apagabilidad priman sobre la disponibilidad.

**Justificación**: Es preferible denegar una solicitud válida en condiciones inciertas que permitir una solicitud inválida o peligrosa. El sistema debe errar hacia la denegación, no hacia la permisividad.

---

## 8. Exclusiones Explícitas

### 8.1. Todo Lo Que Esta Fase NO Hace

Esta fase **NO** realiza las siguientes acciones, evaluaciones o responsabilidades:

- ❌ **NO evalúa existencia del usuario**: No verifica si el usuario existe. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **NO evalúa validez de identidad**: No verifica si el usuario es válido según identidad. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **NO evalúa operatividad global**: No verifica el estado operativo global del sistema. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **NO evalúa estados de registro**: No evalúa estados del BLOQUE 1 (INITIAL, PHONE_PENDING, OTP_PENDING, APPROVED, DENIED, FAILED, ABANDONED).

- ❌ **NO evalúa estados de cuenta**: No evalúa estados de cuenta del BLOQUE 1 (provisional, whatsapp_verified, age_verified, payment_enabled, operational).

- ❌ **NO procesa mensajes**: No examina, valida, transforma ni procesa el contenido de mensajes.

- ❌ **NO gestiona sesiones**: No crea, modifica, consulta ni gestiona sesiones de chat.

- ❌ **NO ejecuta comunicaciones**: No envía mensajes, no establece conexiones, no interactúa con WAM ni proveedores externos.

- ❌ **NO valida formato de solicitud**: No valida la estructura, formato, integridad ni coherencia de la solicitud recibida.

- ❌ **NO aplica reglas de negocio**: No evalúa permisos, roles, restricciones de contenido, políticas de uso ni reglas de negocio específicas.

- ❌ **NO realiza autenticación detallada**: No valida credenciales, tokens, firmas ni mecanismos de autenticación.

- ❌ **NO consulta servicios externos**: No consulta WAM, proveedores de WhatsApp, servicios de almacenamiento ni otros sistemas externos (excepto para consultar el estado operativo del usuario).

- ❌ **NO modifica estados**: No modifica estados de usuarios, cuentas, sesiones ni ningún artefacto del sistema.

- ❌ **NO genera recursos**: No genera identificadores, tokens, handoffs ni ningún recurso del sistema.

- ❌ **NO registra eventos de negocio**: No registra eventos de uso, actividad, transacciones ni operaciones de negocio.

- ❌ **NO actualiza métricas de negocio**: No actualiza contadores, estadísticas ni métricas de uso o actividad.

- ❌ **NO notifica a usuarios**: No envía notificaciones, mensajes ni comunicaciones a usuarios.

- ❌ **NO explica decisiones**: No proporciona razones, explicaciones ni detalles sobre por qué se tomó la decisión.

- ❌ **NO expone información interna**: No expone señales internas, scores, metadata ni información sobre el proceso de evaluación.

### 8.2. Todo Lo Que Esta Fase NO Debe Hacer

Esta fase **NO debe** realizar las siguientes acciones bajo ningún concepto:

- ❌ **NO debe asumir estado operativo por defecto**: No debe permitir operaciones asumiendo que el usuario está en estado ACTIVE si no puede verificarlo.

- ❌ **NO debe continuar ante errores**: No debe intentar continuar o recuperarse ante errores en la consulta del estado operativo.

- ❌ **NO debe optimizar para disponibilidad**: No debe priorizar permitir operaciones sobre garantizar seguridad y apagabilidad.

- ❌ **NO debe exponer información interna**: No debe revelar detalles sobre el estado operativo consultado, razones de decisión ni estado interno del sistema.

- ❌ **NO debe realizar side-effects**: No debe modificar el estado del sistema más allá de la emisión de la decisión.

- ❌ **NO debe delegar responsabilidades**: No debe delegar la consulta del estado operativo a otros componentes sin garantizar el resultado.

- ❌ **NO debe reinterpretar el modelo del BLOQUE 1**: No debe modificar, extender ni reinterpretar el modelo de identidad y estados establecido en el BLOQUE 1.

- ❌ **NO debe evaluar estados identitarios**: No debe evaluar estados del BLOQUE 1 como si fueran estados operativos del BLOQUE 2.

**Regla explícita**: Esta fase tiene un alcance estrictamente limitado a la evaluación del estado operativo del usuario. Cualquier funcionalidad, evaluación o responsabilidad fuera de este alcance debe ser implementada en fases posteriores, no en esta fase.

---

## 9. Cierre del Documento

**Regla de transición**: Ingresar a la FASE 2.3 solo si esta fase emite ALLOW o HOLD, según corresponda.

- Si esta fase emite **ALLOW** (usuario en estado ACTIVE), la solicitud procede a la FASE 2.3.

- Si esta fase emite **HOLD** (usuario en estado PENDING o FROZEN), la solicitud puede ser re-evaluada cuando el estado operativo cambie a ACTIVE, momento en el cual puede proceder a la FASE 2.3.

- Si esta fase emite **DENY** (usuario en estado DENIED o fallo en evaluación), la solicitud no puede proceder a la FASE 2.3. La decisión de esta fase es definitiva para determinar si una solicitud puede proceder al procesamiento de operaciones de chat cuando el usuario está en estado DENIED o cuando no se puede determinar el estado operativo.

La decisión de esta fase es definitiva para determinar el avance de la solicitud según el estado operativo del usuario. No hay mecanismo de apelación, bypass ni omisión de esta fase.

---

**Fin del documento**


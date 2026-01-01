# FASE 3.1 — Habilitación Operativa Controlada

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 3 — Media Mínima y Visibilidad  
**Fase**: FASE 3.1 — Habilitación Operativa Controlada  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 3.1

### 1.1. Función Exacta de la Habilitación Operativa Controlada

La FASE 3.1 es el punto de control obligatorio en el BLOQUE 3 que determina qué operaciones están habilitadas para un usuario en un momento dado, evaluando simultáneamente el estado de habilitación del usuario y las condiciones operativas del sistema que permiten o impiden la ejecución de operaciones específicas.

La habilitación operativa controlada opera como un evaluador de capacidades que precede a todas las operaciones del BLOQUE 3. No procesa contenido, no gestiona medios, no ejecuta visualizaciones. Su única responsabilidad es determinar qué operaciones están habilitadas y emitir una decisión canónica: ENABLED, DISABLED o SUSPENDED.

### 1.2. Necesidad de la Habilitación Operativa Controlada

La habilitación operativa controlada es necesaria incluso cuando un usuario ha completado exitosamente el BLOQUE 2 y posee una decisión canónica ALLOW, porque:

1. **Separación de responsabilidades**: El BLOQUE 2 establece si una solicitud puede proceder. El BLOQUE 3 requiere evaluación independiente de qué operaciones específicas están habilitadas para el usuario.

2. **Estados de habilitación dinámicos**: El estado de habilitación de un usuario puede cambiar independientemente de su capacidad de proceder en el BLOQUE 2. Un usuario puede tener ALLOW en el BLOQUE 2 pero encontrarse con operaciones DISABLED o SUSPENDED en el BLOQUE 3.

3. **Control granular de operaciones**: El sistema requiere control granular sobre qué operaciones específicas están habilitadas para cada usuario, independientemente de su estado en bloques anteriores.

4. **Principio de apagabilidad**: El sistema debe poder deshabilitar operaciones específicas sin afectar la identidad del usuario ni su capacidad de proceder en bloques anteriores. La habilitación operativa controlada permite deshabilitación selectiva mediante estados de habilitación.

5. **Fail-closed por defecto**: Ante cualquier ambigüedad o fallo en la evaluación de habilitación, el sistema debe deshabilitar. Esta evaluación independiente garantiza que no se asume habilitación por defecto.

---

## 2. Alcance Explícito

### 2.1. Qué Evalúa Esta Fase

Esta fase evalúa exclusivamente:

1. **Estado de habilitación del usuario**: Consulta el estado de habilitación actual del usuario referenciado en la solicitud. Los estados de habilitación son: ENABLED, DISABLED, SUSPENDED.

2. **Condiciones operativas de habilitación**: Verifica que las condiciones operativas del sistema permiten la habilitación de operaciones en el momento de la solicitud.

3. **Traducción de estado a decisión**: Traduce el estado de habilitación consultado a una decisión canónica según las reglas de decisión establecidas.

### 2.2. Qué NO Evalúa Bajo Ningún Concepto

Esta fase **NO** evalúa:

- ❌ **Estados de registro**: No evalúa estados del BLOQUE 1 (INITIAL, PHONE_PENDING, OTP_PENDING, APPROVED, DENIED, FAILED, ABANDONED). Solo evalúa estados de habilitación del BLOQUE 3.

- ❌ **Estados de cuenta**: No evalúa estados de cuenta del BLOQUE 1 (provisional, whatsapp_verified, age_verified, payment_enabled, operational). Solo evalúa estados de habilitación.

- ❌ **Decisiones del BLOQUE 2**: No evalúa decisiones del BLOQUE 2 (ALLOW, HOLD, DENY). Solo evalúa estados de habilitación del BLOQUE 3.

- ❌ **Contenido de medios**: No examina, valida ni procesa el contenido de medios, imágenes o referencias externas.

- ❌ **Disponibilidad de recursos externos**: No verifica si los recursos externos están disponibles, accesibles o respondiendo.

- ❌ **Límites de visualización**: No evalúa límites de tiempo, cantidad de visualizaciones o duración de acceso a medios.

- ❌ **Capacidad de almacenamiento**: No verifica disponibilidad de almacenamiento para referencias, metadatos o información de medios.

- ❌ **Estado de servicios externos**: No verifica el estado de servicios de almacenamiento externo, proveedores de medios u otros sistemas externos.

- ❌ **Reglas de negocio específicas**: No aplica reglas de negocio sobre permisos de contenido, restricciones de visualización o políticas de acceso a medios.

- ❌ **Autenticación o autorización detallada**: No realiza autenticación de credenciales ni autorización granular de operaciones específicas.

- ❌ **Validación de formato de solicitud**: No valida el formato, estructura o integridad de la solicitud recibida.

- ❌ **Coherencia de contexto de operación**: No verifica coherencia de operaciones existentes ni estado de visualizaciones en curso.

- ❌ **Cualquier aspecto funcional de medios**: No evalúa funcionalidades, características o capacidades del sistema de medios.

- ❌ **Existencia del usuario**: No verifica si el usuario existe. Esta evaluación es responsabilidad del BLOQUE 2.

- ❌ **Operatividad global del sistema**: No verifica el estado operativo global del sistema. Esta evaluación es responsabilidad del BLOQUE 2.

---

## 3. Dependencias Explícitas

### 3.1. Dependencia Directa del BLOQUE 2

Esta fase tiene una dependencia directa y obligatoria del BLOQUE 2:

1. **Condición de ejecución**: Esta fase solo se ejecuta si el BLOQUE 2 ha emitido ALLOW. Si el BLOQUE 2 emite HOLD o DENY, esta fase no se ejecuta.

2. **Asunción de validez**: Esta fase asume que el usuario referenciado en la solicitud existe, es válido y ha recibido ALLOW del BLOQUE 2. No re-evalúa existencia, validez ni decisiones del BLOQUE 2.

3. **Asunción de operatividad global**: Esta fase asume que el sistema está operativo globalmente según los criterios del BLOQUE 2. No re-evalúa operatividad global ni kill-switch.

**Regla explícita**: Esta fase no puede ejecutarse si el BLOQUE 2 no ha emitido ALLOW. La decisión del BLOQUE 2 es prerrequisito absoluto para esta fase.

### 3.2. Relación con BLOQUE 1 y BLOQUE 2 Sin Reinterpretarlos

Esta fase se relaciona con el BLOQUE 1 y el BLOQUE 2 de la siguiente manera:

1. **Consulta de información establecida**: Esta fase puede consultar información establecida en el BLOQUE 1 (identidad del usuario, estados de cuenta) y el BLOQUE 2 (decisiones canónicas) para determinar el estado de habilitación, pero no modifica ni reinterpreta esa información.

2. **Respeto de invariantes**: Esta fase respeta los invariantes establecidos en el BLOQUE 1 y el BLOQUE 2 (D0, Default Deny, Apagabilidad) sin modificarlos ni reinterpretarlos.

3. **Separación de responsabilidades**: Esta fase no evalúa estados del BLOQUE 1 ni decisiones del BLOQUE 2. Solo evalúa estados de habilitación del BLOQUE 3. Los estados del BLOQUE 1 y las decisiones del BLOQUE 2 son responsabilidad de sus respectivos bloques.

**Regla explícita**: Esta fase NO modifica, extiende ni reinterpreta el modelo del BLOQUE 1 ni las decisiones del BLOQUE 2. Solo consulta y utiliza la información establecida por bloques anteriores para determinar el estado de habilitación del usuario.

---

## 4. Modelo Lógico de Habilitación

### 4.1. Definición Formal de Estados de Habilitación

Esta fase evalúa tres estados de habilitación canónicos:

1. **ENABLED**
   - Estado de habilitación que indica que las operaciones del BLOQUE 3 están habilitadas para el usuario.
   - El usuario puede realizar operaciones de visualización, acceso a medios y funcionalidades del BLOQUE 3 sin restricciones operativas de habilitación.

2. **DISABLED**
   - Estado de habilitación que indica que las operaciones del BLOQUE 3 están deshabilitadas para el usuario.
   - El usuario no puede realizar operaciones del BLOQUE 3 debido a condiciones que requieren deshabilitación permanente o temporal.

3. **SUSPENDED**
   - Estado de habilitación que indica que las operaciones del BLOQUE 3 están suspendidas temporalmente para el usuario.
   - El usuario no puede realizar operaciones del BLOQUE 3 debido a condiciones temporales que requieren suspensión, pero el estado puede cambiar a ENABLED cuando las condiciones cambien.

### 4.2. Aclaración: Estados de Habilitación, No Identitarios Ni Operativos

**Regla explícita**: Los estados evaluados en esta fase son estados de habilitación del BLOQUE 3, no estados identitarios del BLOQUE 1 ni estados operativos del BLOQUE 2.

- Los estados identitarios del BLOQUE 1 (INITIAL, PHONE_PENDING, OTP_PENDING, APPROVED, DENIED, FAILED, ABANDONED) son responsabilidad del BLOQUE 1 y no se evalúan en esta fase.

- Los estados de cuenta del BLOQUE 1 (provisional, whatsapp_verified, age_verified, payment_enabled, operational) son responsabilidad del BLOQUE 1 y no se evalúan en esta fase.

- Las decisiones del BLOQUE 2 (ALLOW, HOLD, DENY) son responsabilidad del BLOQUE 2 y no se evalúan en esta fase.

- Los estados de habilitación del BLOQUE 3 (ENABLED, DISABLED, SUSPENDED) son responsabilidad de esta fase y determinan si el usuario puede realizar operaciones del BLOQUE 3, independientemente de su estado identitario, de cuenta o decisión del BLOQUE 2.

**Justificación**: Un usuario puede tener identidad válida, cuenta aprobada y ALLOW del BLOQUE 2, pero encontrarse en estado de habilitación DISABLED o SUSPENDED en el BLOQUE 3, lo que impide operaciones del BLOQUE 3 sin afectar su identidad, cuenta o capacidad de proceder en bloques anteriores.

---

## 5. Estados Posibles de Habilitación

### 5.1. ENABLED

**Definición**: Estado de habilitación que permite todas las operaciones del BLOQUE 3 sin restricciones operativas de habilitación.

**Condiciones para ENABLED**:

1. **Estado de habilitación del usuario es ENABLED**: El usuario posee un estado de habilitación ENABLED según el modelo de habilitación del BLOQUE 3.

2. **Condiciones operativas permiten habilitación**: Las condiciones operativas del sistema permiten la habilitación de operaciones en el momento de la solicitud.

3. **No existen impedimentos de habilitación**: No existen condiciones que requieran deshabilitación o suspensión de operaciones para el usuario.

**Regla explícita**: ENABLED solo puede alcanzarse si TODAS las condiciones se cumplen simultáneamente. La ausencia de impedimentos conocidos no implica habilitación; cada condición debe cumplirse explícitamente.

**Impacto de ENABLED**: La emisión de ENABLED permite que el usuario realice operaciones del BLOQUE 3. No garantiza éxito de operaciones posteriores, solo que la habilitación operativa no impide el avance.

### 5.2. DISABLED

**Definición**: Estado de habilitación que impide todas las operaciones del BLOQUE 3 debido a condiciones que requieren deshabilitación.

**Condiciones para DISABLED**:

1. **Estado de habilitación del usuario es DISABLED**: El usuario posee un estado de habilitación DISABLED según el modelo de habilitación del BLOQUE 3.

2. **Condiciones operativas requieren deshabilitación**: Las condiciones operativas del sistema requieren deshabilitación de operaciones en el momento de la solicitud.

3. **Existen impedimentos de habilitación permanentes**: Existen condiciones que requieren deshabilitación permanente de operaciones para el usuario.

4. **Fallo en evaluación de habilitación**: Cualquier error, excepción, timeout o condición no prevista durante la evaluación de habilitación.

5. **Ambigüedad o incertidumbre**: Cualquier situación donde no se puede determinar con certeza que todas las condiciones para ENABLED se cumplen.

**Regla explícita**: DISABLED se emite si ALGUNA condición de deshabilitación se cumple, o si existe cualquier duda sobre el cumplimiento de condiciones para ENABLED. El principio fail-closed requiere deshabilitación ante ambigüedad.

**Impacto de DISABLED**: La emisión de DISABLED impide que el usuario realice operaciones del BLOQUE 3. Las operaciones terminan en esta fase sin ejecución.

### 5.3. SUSPENDED

**Definición**: Estado de habilitación que suspende temporalmente todas las operaciones del BLOQUE 3 debido a condiciones temporales que requieren suspensión.

**Condiciones para SUSPENDED**:

1. **Estado de habilitación del usuario es SUSPENDED**: El usuario posee un estado de habilitación SUSPENDED según el modelo de habilitación del BLOQUE 3.

2. **Condiciones operativas requieren suspensión temporal**: Las condiciones operativas del sistema requieren suspensión temporal de operaciones en el momento de la solicitud.

3. **Existen impedimentos de habilitación temporales**: Existen condiciones que requieren suspensión temporal de operaciones para el usuario, pero el estado puede cambiar a ENABLED cuando las condiciones cambien.

**Regla explícita**: SUSPENDED se emite cuando el estado de habilitación del usuario es SUSPENDED y las condiciones operativas requieren suspensión temporal. La suspensión es temporal y puede ser re-evaluada cuando el estado de habilitación cambie a ENABLED.

**Impacto de SUSPENDED**: La emisión de SUSPENDED suspende temporalmente las operaciones del BLOQUE 3 para el usuario. Las operaciones pueden ser re-evaluadas cuando el estado de habilitación cambie a ENABLED.

---

## 6. Transiciones Permitidas

### 6.1. Transiciones Válidas Entre Estados de Habilitación

Las transiciones válidas entre estados de habilitación son:

1. **ENABLED → DISABLED**
   - Transición permitida cuando condiciones requieren deshabilitación permanente o temporal que se traduce en DISABLED.
   - Esta transición puede ser resultado de acciones administrativas, violaciones de políticas o condiciones que requieren deshabilitación.

2. **ENABLED → SUSPENDED**
   - Transición permitida cuando condiciones requieren suspensión temporal.
   - Esta transición puede ser resultado de acciones administrativas temporales, condiciones temporales o procesos que requieren suspensión.

3. **SUSPENDED → ENABLED**
   - Transición permitida cuando las condiciones que causaron la suspensión temporal se resuelven.
   - Esta transición restaura la habilitación completa de operaciones del BLOQUE 3.

4. **SUSPENDED → DISABLED**
   - Transición permitida cuando condiciones temporales se convierten en permanentes o requieren deshabilitación.
   - Esta transición convierte una suspensión temporal en deshabilitación.

5. **DISABLED → ENABLED**
   - Transición permitida cuando condiciones que causaron la deshabilitación se resuelven mediante acción administrativa explícita.
   - Esta transición requiere acción administrativa explícita y no es automática.

**Regla explícita**: Las transiciones son deterministas y requieren evaluación explícita de condiciones. No existen transiciones automáticas ni implícitas más allá de las definidas.

### 6.2. Condiciones para Transiciones

**Regla explícita**: Todas las transiciones requieren evaluación explícita de condiciones y no pueden ocurrir sin verificación de que las condiciones se cumplen.

- Las transiciones hacia DISABLED requieren verificación de condiciones que justifican deshabilitación.

- Las transiciones hacia SUSPENDED requieren verificación de condiciones que justifican suspensión temporal.

- Las transiciones hacia ENABLED requieren verificación de que todas las condiciones para habilitación se cumplen.

- Las transiciones desde DISABLED requieren acción administrativa explícita y verificación de que las condiciones que causaron deshabilitación se han resuelto.

---

## 7. Transiciones Prohibidas

### 7.1. Transiciones Inválidas Entre Estados de Habilitación

Las siguientes transiciones están explícitamente prohibidas:

1. **DISABLED → SUSPENDED**
   - Prohibida porque DISABLED representa deshabilitación que no puede convertirse en suspensión temporal sin pasar primero por evaluación de condiciones para ENABLED.

2. **Cualquier transición que omita evaluación de condiciones**
   - Prohibidas todas las transiciones que no requieren evaluación explícita de condiciones.

3. **Transiciones automáticas sin verificación**
   - Prohibidas todas las transiciones que ocurren automáticamente sin verificación de que las condiciones se cumplen.

4. **Transiciones que violan el principio fail-closed**
   - Prohibidas todas las transiciones que asumen habilitación por defecto sin verificación explícita.

**Regla explícita**: Las transiciones prohibidas no pueden ocurrir bajo ningún concepto. Cualquier intento de transición prohibida debe resultar en mantenimiento del estado actual o transición a DISABLED (fail-closed).

### 7.2. Justificación de Prohibiciones

**Justificación de prohibición DISABLED → SUSPENDED**: DISABLED representa deshabilitación que requiere resolución explícita de condiciones antes de permitir cualquier operación. Convertir DISABLED directamente en SUSPENDED omitiría la verificación de que las condiciones se han resuelto.

**Justificación de prohibición de transiciones sin evaluación**: Todas las transiciones requieren evaluación explícita para garantizar que el sistema no asume habilitación por defecto y mantiene el principio fail-closed.

---

## 8. Principio de Apagabilidad Aplicado

### 8.1. Cómo Esta Fase Garantiza el Principio Rector del Sistema

El principio rector del sistema establece: **"El sistema debe poder apagarse antes de poder crecer."**

Esta fase garantiza este principio mediante:

1. **Evaluación independiente de habilitación**: La fase evalúa el estado de habilitación del usuario independientemente de su existencia, validez de identidad o decisiones de bloques anteriores. Esto permite que el sistema pueda deshabilitar operaciones específicas sin afectar la identidad del usuario ni su capacidad de proceder en bloques anteriores.

2. **Deshabilitación selectiva mediante DISABLED**: El estado de habilitación DISABLED permite deshabilitación selectiva de operaciones del BLOQUE 3 para usuarios específicos mediante DISABLED, sin afectar la operatividad global del sistema ni la identidad de los usuarios.

3. **Suspensión selectiva mediante SUSPENDED**: El estado de habilitación SUSPENDED permite suspensión selectiva temporal de operaciones del BLOQUE 3 para usuarios específicos mediante SUSPENDED, sin afectar la operatividad global del sistema ni la identidad de los usuarios.

4. **Fail-closed por defecto**: Ante cualquier fallo, error, ambigüedad o incertidumbre en la evaluación de habilitación, la fase emite DISABLED. Esto garantiza que el sistema no continúe operando en condiciones inciertas o peligrosas.

5. **Separación de evaluación y ejecución**: La fase solo evalúa y decide. No ejecuta operaciones. Esta separación permite que el sistema pueda deshabilitar o suspender operaciones sin dejar operaciones en curso inconsistentes.

6. **Evaluación en tiempo real**: La fase evalúa el estado de habilitación en el momento exacto de la solicitud, no en base a estados históricos o asumidos. Esto permite que el sistema responda inmediatamente a cambios en el estado de habilitación.

### 8.2. Comportamiento por Defecto Ante Errores o Estados Desconocidos

La fase implementa el principio fail-closed mediante el siguiente comportamiento:

1. **Fallo en consulta de estado de habilitación**: Si no se puede consultar el estado de habilitación del usuario, la fase emite DISABLED.

2. **Estado de habilitación desconocido**: Si el estado de habilitación consultado no corresponde a ninguno de los estados canónicos (ENABLED, DISABLED, SUSPENDED), la fase emite DISABLED.

3. **Errores técnicos**: Cualquier error técnico, excepción, timeout o condición no prevista durante la evaluación de habilitación resulta en DISABLED.

4. **Timeouts o silencio**: Si la consulta del estado de habilitación no responde dentro del tiempo esperado o permanece en silencio, la fase emite DISABLED.

5. **Datos faltantes o inválidos**: Si falta información necesaria para consultar el estado de habilitación o los datos recibidos son inválidos, la fase emite DISABLED.

6. **Ambigüedad o incertidumbre**: Cualquier situación donde no se puede determinar con certeza el estado de habilitación del usuario resulta en DISABLED.

**Regla explícita**: El principio fail-closed tiene prioridad absoluta sobre cualquier optimización, conveniencia o intento de continuidad de servicio. La seguridad y apagabilidad priman sobre la disponibilidad.

**Justificación**: Es preferible deshabilitar operaciones para un usuario válido en condiciones inciertas que permitir operaciones para un usuario inválido o peligroso. El sistema debe errar hacia la deshabilitación, no hacia la permisividad.

---

## 9. Garantías Sistémicas

### 9.1. Garantías de Consistencia

Esta fase garantiza:

1. **Consistencia de estados**: El estado de habilitación consultado corresponde exactamente a uno de los estados canónicos (ENABLED, DISABLED, SUSPENDED). No existen estados intermedios, parciales o ambiguos.

2. **Consistencia de transiciones**: Las transiciones entre estados de habilitación siguen las reglas definidas y no violan las prohibiciones establecidas.

3. **Consistencia de decisiones**: La decisión emitida (ENABLED, DISABLED, SUSPENDED) corresponde exactamente al estado de habilitación consultado según las reglas de traducción establecidas.

### 9.2. Garantías de Seguridad

Esta fase garantiza:

1. **Fail-closed por defecto**: Ante cualquier fallo, error, ambigüedad o incertidumbre, la fase emite DISABLED, garantizando que el sistema no continúe operando en condiciones inciertas.

2. **Evaluación independiente**: La evaluación de habilitación es independiente de evaluaciones de bloques anteriores, garantizando que no se asume habilitación por defecto basada en resultados previos.

3. **Sin side-effects**: La fase no modifica estados, no crea recursos, no ejecuta operaciones. Solo consulta y decide, garantizando que no se introducen cambios de estado inconsistentes.

### 9.3. Garantías de Apagabilidad

Esta fase garantiza:

1. **Deshabilitación selectiva**: El sistema puede deshabilitar operaciones del BLOQUE 3 para usuarios específicos sin afectar la operatividad global del sistema ni la identidad de los usuarios.

2. **Suspensión selectiva**: El sistema puede suspender temporalmente operaciones del BLOQUE 3 para usuarios específicos sin afectar la operatividad global del sistema ni la identidad de los usuarios.

3. **Evaluación en tiempo real**: El sistema responde inmediatamente a cambios en el estado de habilitación, permitiendo deshabilitación o suspensión inmediata cuando sea necesario.

---

## 10. Riesgos Conocidos y Controles

### 10.1. Riesgos Identificados

1. **Riesgo de asunción de habilitación por defecto**
   - **Descripción**: El sistema podría asumir que un usuario está habilitado si no se puede determinar su estado de habilitación.
   - **Control**: El principio fail-closed garantiza que cualquier ambigüedad o incertidumbre resulta en DISABLED, no en ENABLED.

2. **Riesgo de transiciones no autorizadas**
   - **Descripción**: El sistema podría permitir transiciones entre estados de habilitación sin verificación explícita de condiciones.
   - **Control**: Las transiciones prohibidas están explícitamente definidas y cualquier intento de transición prohibida resulta en mantenimiento del estado actual o transición a DISABLED.

3. **Riesgo de inconsistencia entre bloques**
   - **Descripción**: El estado de habilitación del BLOQUE 3 podría ser inconsistente con estados o decisiones de bloques anteriores.
   - **Control**: La fase respeta los invariantes establecidos en bloques anteriores y no reinterpreta sus resultados, manteniendo separación de responsabilidades.

4. **Riesgo de evaluación en tiempo no real**
   - **Descripción**: El sistema podría evaluar el estado de habilitación basándose en estados históricos o asumidos en lugar del estado actual.
   - **Control**: La fase evalúa el estado de habilitación en el momento exacto de la solicitud, no en base a estados históricos.

### 10.2. Controles Implementados

1. **Control de fail-closed**: Cualquier fallo, error, ambigüedad o incertidumbre resulta en DISABLED.

2. **Control de transiciones**: Las transiciones están explícitamente definidas y prohibidas, con verificación obligatoria de condiciones.

3. **Control de separación de responsabilidades**: La fase no reinterpreta resultados de bloques anteriores y mantiene separación estricta de responsabilidades.

4. **Control de evaluación en tiempo real**: La fase evalúa el estado de habilitación en el momento exacto de la solicitud.

---

## 11. Criterios de Cierre de la FASE 3.1

### 11.1. Criterios de Cierre

La FASE 3.1 se considera cerrada cuando:

1. **Modelo de habilitación definido**: El modelo lógico de habilitación está completamente definido con estados canónicos (ENABLED, DISABLED, SUSPENDED) y reglas de traducción establecidas.

2. **Transiciones definidas**: Las transiciones permitidas y prohibidas están explícitamente definidas y documentadas.

3. **Garantías sistémicas establecidas**: Las garantías de consistencia, seguridad y apagabilidad están establecidas y documentadas.

4. **Riesgos y controles documentados**: Los riesgos conocidos y controles implementados están documentados.

5. **Principio de apagabilidad aplicado**: El principio de apagabilidad está aplicado mediante deshabilitación selectiva, suspensión selectiva y fail-closed por defecto.

6. **Separación de responsabilidades mantenida**: La fase mantiene separación estricta de responsabilidades con bloques anteriores y no reinterpreta sus resultados.

### 11.2. Condiciones para Avance a Fase Siguiente

La FASE 3.1 habilita el avance a la siguiente fase del BLOQUE 3 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre están satisfechos.

2. **Modelo de habilitación operativo**: El modelo de habilitación está operativo y puede evaluar estados de habilitación y emitir decisiones canónicas.

3. **Garantías sistémicas verificadas**: Las garantías sistémicas están verificadas y funcionando según lo documentado.

**Regla explícita**: El avance a la siguiente fase requiere cumplimiento explícito de todos los criterios de cierre. No existe avance automático ni implícito.

---

## 12. Exclusiones Explícitas

### 12.1. Todo Lo Que Esta Fase NO Hace

Esta fase **NO** realiza las siguientes acciones, evaluaciones o responsabilidades:

- ❌ **NO evalúa existencia del usuario**: No verifica si el usuario existe. Esta evaluación es responsabilidad del BLOQUE 2.

- ❌ **NO evalúa validez de identidad**: No verifica si el usuario es válido según identidad. Esta evaluación es responsabilidad del BLOQUE 2.

- ❌ **NO evalúa operatividad global**: No verifica el estado operativo global del sistema. Esta evaluación es responsabilidad del BLOQUE 2.

- ❌ **NO evalúa decisiones del BLOQUE 2**: No evalúa decisiones del BLOQUE 2 (ALLOW, HOLD, DENY). Solo asume que el BLOQUE 2 ha emitido ALLOW.

- ❌ **NO evalúa estados de registro**: No evalúa estados del BLOQUE 1 (INITIAL, PHONE_PENDING, OTP_PENDING, APPROVED, DENIED, FAILED, ABANDONED).

- ❌ **NO evalúa estados de cuenta**: No evalúa estados de cuenta del BLOQUE 1 (provisional, whatsapp_verified, age_verified, payment_enabled, operational).

- ❌ **NO procesa contenido de medios**: No examina, valida, transforma ni procesa el contenido de medios, imágenes o referencias externas.

- ❌ **NO gestiona recursos externos**: No crea, modifica, consulta ni gestiona recursos externos, referencias o metadatos de medios.

- ❌ **NO ejecuta visualizaciones**: No ejecuta operaciones de visualización, acceso a medios ni funcionalidades del BLOQUE 3.

- ❌ **NO valida formato de solicitud**: No valida la estructura, formato, integridad ni coherencia de la solicitud recibida.

- ❌ **NO aplica reglas de negocio**: No evalúa permisos de contenido, restricciones de visualización, políticas de acceso a medios ni reglas de negocio específicas.

- ❌ **NO realiza autenticación detallada**: No valida credenciales, tokens, firmas ni mecanismos de autenticación.

- ❌ **NO consulta servicios externos**: No consulta servicios de almacenamiento externo, proveedores de medios ni otros sistemas externos (excepto para consultar el estado de habilitación del usuario).

- ❌ **NO modifica estados**: No modifica estados de usuarios, cuentas, habilitación ni ningún artefacto del sistema.

- ❌ **NO genera recursos**: No genera identificadores, tokens, referencias ni ningún recurso del sistema.

- ❌ **NO registra eventos de negocio**: No registra eventos de uso, actividad, transacciones ni operaciones de negocio.

- ❌ **NO actualiza métricas de negocio**: No actualiza contadores, estadísticas ni métricas de uso o actividad.

- ❌ **NO notifica a usuarios**: No envía notificaciones, mensajes ni comunicaciones a usuarios.

- ❌ **NO explica decisiones**: No proporciona razones, explicaciones ni detalles sobre por qué se tomó la decisión.

- ❌ **NO expone información interna**: No expone señales internas, scores, metadata ni información sobre el proceso de evaluación.

### 12.2. Todo Lo Que Esta Fase NO Debe Hacer

Esta fase **NO debe** realizar las siguientes acciones bajo ningún concepto:

- ❌ **NO debe asumir estado de habilitación por defecto**: No debe permitir operaciones asumiendo que el usuario está en estado ENABLED si no puede verificarlo.

- ❌ **NO debe continuar ante errores**: No debe intentar continuar o recuperarse ante errores en la consulta del estado de habilitación.

- ❌ **NO debe optimizar para disponibilidad**: No debe priorizar permitir operaciones sobre garantizar seguridad y apagabilidad.

- ❌ **NO debe exponer información interna**: No debe revelar detalles sobre el estado de habilitación consultado, razones de decisión ni estado interno del sistema.

- ❌ **NO debe realizar side-effects**: No debe modificar el estado del sistema más allá de la emisión de la decisión.

- ❌ **NO debe delegar responsabilidades**: No debe delegar la consulta del estado de habilitación a otros componentes sin garantizar el resultado.

- ❌ **NO debe reinterpretar el modelo del BLOQUE 1**: No debe modificar, extender ni reinterpretar el modelo de identidad y estados establecido en el BLOQUE 1.

- ❌ **NO debe reinterpretar decisiones del BLOQUE 2**: No debe modificar, extender ni reinterpretar las decisiones canónicas establecidas en el BLOQUE 2.

- ❌ **NO debe evaluar aspectos ya evaluados**: No debe re-evaluar existencia, validez, operatividad ni decisiones que ya fueron evaluadas en bloques anteriores.

**Regla explícita**: Esta fase tiene un alcance estrictamente limitado a la evaluación del estado de habilitación del usuario. Cualquier funcionalidad, evaluación o responsabilidad fuera de este alcance debe ser implementada en fases posteriores, no en esta fase.

---

## 13. Cierre del Documento

**Regla de transición**: La decisión emitida por esta fase determina si el usuario puede realizar operaciones del BLOQUE 3.

- Si esta fase emite **ENABLED** (usuario en estado de habilitación ENABLED), el usuario puede realizar operaciones del BLOQUE 3.

- Si esta fase emite **SUSPENDED** (usuario en estado de habilitación SUSPENDED), las operaciones del BLOQUE 3 se suspenden temporalmente para el usuario. Las operaciones pueden ser re-evaluadas cuando el estado de habilitación cambie a ENABLED.

- Si esta fase emite **DISABLED** (usuario en estado de habilitación DISABLED o fallo en evaluación), el usuario no puede realizar operaciones del BLOQUE 3. Las operaciones terminan en esta fase.

La decisión de esta fase es definitiva para determinar si un usuario puede realizar operaciones del BLOQUE 3 según su estado de habilitación. No hay mecanismo de apelación, bypass ni omisión de esta fase.

La FASE 3.1 queda conceptualmente cerrada y habilita el avance a la siguiente fase del BLOQUE 3.

---

**Fin del documento**

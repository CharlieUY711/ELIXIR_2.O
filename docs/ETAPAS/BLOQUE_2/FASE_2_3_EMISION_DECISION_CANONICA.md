# FASE 2.3 — Emisión de Decisión Canónica

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 2 — Chat P2P Controlado  
**Fase**: FASE 2.3 — Emisión de Decisión Canónica  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 2.3

### 1.1. Función Exacta de la Emisión de Decisión Canónica

La FASE 2.3 es el punto final de consolidación y emisión de decisión en el BLOQUE 2. Su función es recibir los resultados de las fases previas (FASE 2.1 y FASE 2.2), consolidarlos mediante reglas deterministas y emitir una única decisión canónica que constituye la salida final del BLOQUE 2.

Esta fase opera como un consolidador puro que no realiza evaluaciones adicionales, no reinterpreta resultados previos y no introduce lógica de negocio. Su única responsabilidad es aplicar reglas de consolidación deterministas a los resultados recibidos y emitir una decisión canónica: ALLOW, HOLD o DENY.

### 1.2. Necesidad de Esta Fase como Cierre del BLOQUE 2

Esta fase es necesaria como cierre del BLOQUE 2 porque:

1. **Unificación de resultados**: Las fases previas (FASE 2.1 y FASE 2.2) emiten decisiones independientes que pueden diferir. Esta fase unifica estos resultados en una única decisión canónica que representa el resultado consolidado del BLOQUE 2.

2. **Contrato de salida único**: El BLOQUE 2 debe emitir una única decisión canónica hacia bloques posteriores. Esta fase garantiza que existe un único punto de salida con un formato canónico y determinista.

3. **Separación de responsabilidades**: Las fases previas evalúan aspectos específicos (existencia operativa, estado del usuario). Esta fase consolida sin evaluar, manteniendo la separación entre evaluación y consolidación.

4. **Principio de apagabilidad**: Esta fase garantiza que el sistema puede detenerse de manera controlada, consolidando resultados previos sin dejar operaciones en curso inconsistentes.

5. **Fail-closed por defecto**: Ante cualquier inconsistencia, error o ambigüedad en los resultados recibidos, esta fase emite DENY, garantizando que el sistema no continúe en condiciones inciertas.

---

## 2. Alcance Explícito

### 2.1. Qué Consolida Esta Fase

Esta fase consolida exclusivamente:

1. **Resultado de la FASE 2.1**: Recibe la decisión emitida por el Gate de Existencia Operativa (ALLOW o DENY) y la utiliza como entrada para la consolidación.

2. **Resultado de la FASE 2.2**: Recibe la decisión emitida por la Evaluación de Estado del Usuario (ALLOW, HOLD o DENY) y la utiliza como entrada para la consolidación.

3. **Aplicación de reglas de consolidación**: Aplica reglas deterministas para combinar los resultados recibidos y emitir una única decisión canónica.

### 2.2. Qué NO Evalúa Ni Decide Bajo Ningún Concepto

Esta fase **NO** evalúa ni decide:

- ❌ **Existencia de usuario**: No evalúa si el usuario existe. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **Validez de identidad**: No evalúa si el usuario es válido según identidad. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **Operatividad global del sistema**: No evalúa el estado operativo global del sistema. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **Estado operativo del usuario**: No evalúa el estado operativo del usuario. Esta evaluación es responsabilidad de la FASE 2.2.

- ❌ **Kill-switch global**: No evalúa el estado del kill-switch. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **Contenido de mensajes**: No examina, valida ni procesa el contenido de mensajes.

- ❌ **Disponibilidad de destinatarios**: No verifica si el destinatario está disponible, activo o accesible.

- ❌ **Límites de sesión**: No evalúa límites de tiempo, cantidad de mensajes o duración de conversaciones.

- ❌ **Capacidad de almacenamiento**: No verifica disponibilidad de almacenamiento para sesiones o mensajes.

- ❌ **Estado de servicios externos**: No verifica el estado de WAM, proveedores de WhatsApp u otros servicios externos.

- ❌ **Reglas de negocio específicas**: No aplica reglas de negocio sobre permisos, roles, restricciones de contenido o políticas de uso.

- ❌ **Autenticación o autorización detallada**: No realiza autenticación de credenciales ni autorización granular de operaciones.

- ❌ **Validación de formato de solicitud**: No valida el formato, estructura o integridad de la solicitud recibida.

- ❌ **Coherencia de contexto de sesión**: No verifica coherencia de sesiones existentes ni estado de conversaciones en curso.

- ❌ **Cualquier aspecto funcional del chat**: No evalúa funcionalidades, características o capacidades del sistema de chat.

- ❌ **Reinterpretación de resultados previos**: No reinterpreta, enriquece ni modifica los resultados recibidos de las fases previas.

---

## 3. Dependencias Explícitas

### 3.1. Dependencia Directa de la FASE 2.1 y FASE 2.2

Esta fase tiene dependencias directas y obligatorias de las fases previas:

1. **Dependencia de la FASE 2.1**: Esta fase requiere que la FASE 2.1 haya emitido una decisión (ALLOW o DENY). La decisión de la FASE 2.1 es entrada obligatoria para la consolidación.

2. **Dependencia de la FASE 2.2**: Esta fase requiere que la FASE 2.2 haya emitido una decisión (ALLOW, HOLD o DENY). La decisión de la FASE 2.2 es entrada obligatoria para la consolidación.

3. **Condición de ejecución**: Esta fase solo se ejecuta si ambas fases previas han emitido decisiones. Si alguna fase previa no ha emitido decisión, esta fase no puede ejecutarse y debe emitir DENY.

**Regla explícita**: Esta fase no puede ejecutarse si la FASE 2.1 o la FASE 2.2 no han emitido decisiones. La ausencia de resultados de fases previas resulta en DENY.

### 3.2. Aclaración: Esta Fase No Reevalúa Resultados Previos

**Regla explícita**: Esta fase no reevalúa los resultados previos. Toma los resultados recibidos como están, sin validar, verificar ni cuestionar las evaluaciones que los produjeron.

- Esta fase no consulta el estado del usuario para verificar si la FASE 2.2 evaluó correctamente.

- Esta fase no consulta la operatividad global para verificar si la FASE 2.1 evaluó correctamente.

- Esta fase no valida la coherencia lógica de los resultados recibidos más allá de aplicar las reglas de consolidación.

- Esta fase no introduce lógica adicional ni interpretación de los resultados previos.

**Justificación**: Las fases previas son responsables de sus evaluaciones. Esta fase es responsable únicamente de consolidar los resultados emitidos, no de validar las evaluaciones que los produjeron.

---

## 4. Decisiones Canónicas Posibles

### 4.1. Definición Formal y Cerrada de Decisiones

Esta fase emite únicamente tres decisiones canónicas, definidas de forma formal y cerrada:

1. **ALLOW**
   - Decisión canónica que permite que la solicitud proceda a bloques posteriores.
   - Se emite cuando todas las fases previas han emitido ALLOW.
   - Condición exacta: FASE 2.1 emitió ALLOW Y FASE 2.2 emitió ALLOW.
   - Impacto: La solicitud puede proceder a operaciones de chat en bloques posteriores.

2. **HOLD**
   - Decisión canónica que suspende temporalmente la solicitud sin denegarla.
   - Se emite cuando la FASE 2.2 ha emitido HOLD, independientemente del resultado de la FASE 2.1 (siempre que la FASE 2.1 haya emitido ALLOW).
   - Condición exacta: FASE 2.1 emitió ALLOW Y FASE 2.2 emitió HOLD.
   - Impacto: La solicitud se suspende temporalmente. Puede ser re-evaluada cuando el estado operativo del usuario cambie a ACTIVE.

3. **DENY**
   - Decisión canónica que impide que la solicitud proceda a bloques posteriores.
   - Se emite cuando alguna fase previa ha emitido DENY, o cuando existe error, inconsistencia o ambigüedad.
   - Condiciones exactas:
     - FASE 2.1 emitió DENY (independientemente del resultado de la FASE 2.2), O
     - FASE 2.2 emitió DENY (independientemente del resultado de la FASE 2.1), O
     - Error, inconsistencia o ambigüedad en los resultados recibidos.
   - Impacto: La solicitud termina en el BLOQUE 2 sin ejecución de operaciones de chat.

### 4.2. Aclaración: No Existen Decisiones Adicionales

**Regla explícita**: No existen decisiones adicionales más allá de ALLOW, HOLD y DENY.

- No existe decisión parcial, condicional o intermedia.

- No existe decisión que combine aspectos de múltiples decisiones canónicas.

- No existe decisión que dependa de condiciones externas no contempladas en las reglas de consolidación.

- No existe decisión que requiera evaluación adicional más allá de la consolidación de resultados previos.

**Justificación**: El conjunto de decisiones canónicas es cerrado y completo. Cualquier situación no contemplada por las reglas de consolidación resulta en DENY (fail-closed).

---

## 5. Reglas de Consolidación

### 5.1. Cómo Se Combinan los Resultados Previos

Las reglas de consolidación son deterministas y se aplican en el siguiente orden de prioridad:

1. **Prioridad absoluta de DENY**: Si alguna fase previa emitió DENY, la decisión canónica final es DENY, independientemente del resultado de la otra fase.
   - Si FASE 2.1 emitió DENY → DENY final (sin importar FASE 2.2).
   - Si FASE 2.2 emitió DENY → DENY final (sin importar FASE 2.1).

2. **Prioridad de HOLD sobre ALLOW**: Si la FASE 2.2 emitió HOLD y la FASE 2.1 emitió ALLOW, la decisión canónica final es HOLD.
   - Si FASE 2.1 emitió ALLOW Y FASE 2.2 emitió HOLD → HOLD final.

3. **Consenso para ALLOW**: La decisión canónica final es ALLOW solo si ambas fases previas emitieron ALLOW.
   - Si FASE 2.1 emitió ALLOW Y FASE 2.2 emitió ALLOW → ALLOW final.

**Regla explícita**: Las reglas de consolidación son deterministas y no admiten excepciones. Dados los mismos resultados de entrada, siempre se emite la misma decisión canónica.

### 5.2. Aclaración: No Hay Lógica Adicional Ni Interpretación

**Regla explícita**: Las reglas de consolidación son las únicas reglas aplicadas. No existe lógica adicional, interpretación, enriquecimiento ni evaluación complementaria.

- Esta fase no introduce condiciones adicionales para emitir decisiones.

- Esta fase no interpreta el contexto o significado de los resultados recibidos.

- Esta fase no enriquece los resultados previos con información adicional.

- Esta fase no realiza evaluaciones complementarias para validar o cuestionar los resultados recibidos.

- Esta fase no aplica reglas de negocio, políticas o criterios externos a las reglas de consolidación.

**Justificación**: Esta fase es un consolidador puro. Su única responsabilidad es aplicar reglas deterministas de consolidación, no introducir lógica adicional ni interpretación.

---

## 6. Salida del BLOQUE 2

### 6.1. Forma Canónica de la Decisión Emitida

La fase emite una decisión en forma canónica que consiste únicamente en:

1. **Resultado canónico**: ALLOW, HOLD o DENY. No hay resultados intermedios, parciales o condicionales.

2. **Timestamp de decisión**: Marca temporal que indica cuándo se tomó la decisión, necesaria para auditoría y trazabilidad.

3. **Identificador de solicitud**: Referencia opaca a la solicitud evaluada, necesaria para correlación con operaciones posteriores.

**Formato canónico**: La decisión se representa como una estructura mínima que contiene únicamente estos tres elementos. No incluye razones, explicaciones, metadata adicional, scores, señales internas ni información sobre el proceso de consolidación.

**Regla explícita**: La decisión no expone información sobre por qué se tomó la decisión, qué resultados previos se consolidaron, qué reglas se aplicaron o cualquier detalle del proceso interno. Solo expone el resultado canónico.

### 6.2. Contrato de Salida Hacia Bloques Posteriores

La decisión canónica emitida por esta fase constituye el contrato de salida del BLOQUE 2 hacia bloques posteriores:

1. **Formato único**: Los bloques posteriores reciben únicamente la decisión canónica (ALLOW, HOLD o DENY) en el formato canónico definido.

2. **Sin información adicional**: Los bloques posteriores no reciben información sobre las evaluaciones previas, las razones de la decisión ni el proceso de consolidación.

3. **Interpretación determinista**: Los bloques posteriores interpretan la decisión canónica de forma determinista:
   - ALLOW: La solicitud puede proceder a operaciones de chat.
   - HOLD: La solicitud se suspende temporalmente y puede ser re-evaluada.
   - DENY: La solicitud termina sin ejecución de operaciones de chat.

4. **Sin dependencias de implementación**: Los bloques posteriores no dependen de detalles de implementación del BLOQUE 2. Solo dependen del contrato de salida canónico.

**Regla explícita**: El contrato de salida es inmutable y no puede modificarse sin afectar los bloques posteriores. Cualquier cambio en el contrato de salida requiere coordinación explícita con bloques posteriores.

**Nota**: Este documento no describe los bloques posteriores ni sus responsabilidades. Solo define el contrato de salida del BLOQUE 2.

---

## 7. Principios de Seguridad y Apagabilidad

### 7.1. Cómo Esta Fase Garantiza que el Sistema Siga Siendo Apagable

El principio rector del sistema establece: **"El sistema debe poder apagarse antes de poder crecer."**

Esta fase garantiza este principio mediante:

1. **Consolidación determinista sin side-effects**: Esta fase consolida resultados sin modificar estado, crear recursos ni ejecutar operaciones. Esta separación permite que el sistema pueda detenerse sin dejar operaciones en curso inconsistentes.

2. **Prioridad absoluta de DENY**: DENY tiene prioridad absoluta sobre cualquier otra decisión. Cuando alguna fase previa emite DENY, esta fase emite DENY final, permitiendo detención inmediata de la solicitud.

3. **Fail-closed por defecto**: Ante cualquier error, inconsistencia o ambigüedad en los resultados recibidos, esta fase emite DENY. Esto garantiza que el sistema no continúe operando en condiciones inciertas o peligrosas.

4. **Suspensión controlada mediante HOLD**: HOLD permite suspensión temporal de solicitudes sin denegarlas, permitiendo que el sistema pueda detenerse de manera controlada sin afectar la identidad de los usuarios.

5. **Sin evaluación adicional**: Esta fase no realiza evaluaciones adicionales que puedan introducir condiciones de carrera o estados inconsistentes. Solo consolida resultados previos de forma determinista.

6. **Evaluación en tiempo real**: Esta fase consolida resultados en el momento exacto de la solicitud, no en base a estados históricos o asumidos. Esto permite que el sistema responda inmediatamente a cambios en las evaluaciones previas.

### 7.2. Comportamiento por Defecto Ante Inconsistencias

Esta fase implementa el principio fail-closed mediante el siguiente comportamiento:

1. **Resultados faltantes**: Si falta el resultado de la FASE 2.1 o la FASE 2.2, esta fase emite DENY.

2. **Resultados inválidos**: Si los resultados recibidos no corresponden a los formatos esperados (ALLOW/DENY para FASE 2.1, ALLOW/HOLD/DENY para FASE 2.2), esta fase emite DENY.

3. **Inconsistencias lógicas**: Si los resultados recibidos presentan inconsistencias lógicas no contempladas por las reglas de consolidación, esta fase emite DENY.

4. **Errores técnicos**: Cualquier error técnico, excepción, timeout o condición no prevista durante la consolidación resulta en DENY.

5. **Timeouts o silencio**: Si alguna fase previa no ha emitido resultado dentro del tiempo esperado o permanece en silencio, esta fase emite DENY.

6. **Ambigüedad o incertidumbre**: Cualquier situación donde no se puede determinar con certeza qué decisión canónica emitir resulta en DENY.

**Regla explícita**: El principio fail-closed tiene prioridad absoluta sobre cualquier optimización, conveniencia o intento de continuidad de servicio. La seguridad y apagabilidad priman sobre la disponibilidad.

**Justificación**: Es preferible denegar una solicitud válida en condiciones inciertas que permitir una solicitud inválida o peligrosa. El sistema debe errar hacia la denegación, no hacia la permisividad.

---

## 8. Exclusiones Explícitas

### 8.1. Todo Lo Que Esta Fase NO Hace

Esta fase **NO** realiza las siguientes acciones, evaluaciones o responsabilidades:

- ❌ **NO evalúa existencia del usuario**: No verifica si el usuario existe. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **NO evalúa validez de identidad**: No verifica si el usuario es válido según identidad. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **NO evalúa operatividad global**: No verifica el estado operativo global del sistema. Esta evaluación es responsabilidad de la FASE 2.1.

- ❌ **NO evalúa estado operativo del usuario**: No verifica el estado operativo del usuario. Esta evaluación es responsabilidad de la FASE 2.2.

- ❌ **NO evalúa kill-switch**: No verifica el estado del kill-switch. Esta evaluación es responsabilidad de la FASE 2.1.

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

- ❌ **NO expone información interna**: No expone señales internas, scores, metadata ni información sobre el proceso de consolidación.

- ❌ **NO reinterpreta resultados previos**: No reinterpreta, enriquece ni modifica los resultados recibidos de las fases previas.

- ❌ **NO introduce lógica adicional**: No introduce condiciones adicionales, interpretación ni evaluación complementaria.

### 8.2. Todo Lo Que Esta Fase NO Debe Hacer

Esta fase **NO debe** realizar las siguientes acciones bajo ningún concepto:

- ❌ **NO debe asumir resultados por defecto**: No debe permitir operaciones asumiendo que las fases previas emitieron ALLOW si no puede verificarlo.

- ❌ **NO debe continuar ante errores**: No debe intentar continuar o recuperarse ante errores en la consolidación.

- ❌ **NO debe optimizar para disponibilidad**: No debe priorizar permitir operaciones sobre garantizar seguridad y apagabilidad.

- ❌ **NO debe exponer información interna**: No debe revelar detalles sobre los resultados previos, razones de decisión ni estado interno del sistema.

- ❌ **NO debe realizar side-effects**: No debe modificar el estado del sistema más allá de la emisión de la decisión.

- ❌ **NO debe delegar responsabilidades**: No debe delegar la consolidación a otros componentes sin garantizar el resultado.

- ❌ **NO debe reinterpretar el modelo del BLOQUE 1**: No debe modificar, extender ni reinterpretar el modelo de identidad y estados establecido en el BLOQUE 1.

- ❌ **NO debe evaluar aspectos ya evaluados**: No debe re-evaluar existencia, validez, operatividad ni estado operativo que ya fueron evaluados en fases previas.

- ❌ **NO debe introducir decisiones adicionales**: No debe crear, proponer ni implementar decisiones canónicas adicionales más allá de ALLOW, HOLD y DENY.

**Regla explícita**: Esta fase tiene un alcance estrictamente limitado a la consolidación de resultados previos y emisión de decisión canónica. Cualquier funcionalidad, evaluación o responsabilidad fuera de este alcance debe ser implementada en fases previas o bloques posteriores, no en esta fase.

---

## 9. Cierre del Documento

**Regla de transición**: La decisión emitida por esta fase constituye la salida final del BLOQUE 2.

- Si esta fase emite **ALLOW**, la solicitud puede proceder a bloques posteriores para ejecución de operaciones de chat.

- Si esta fase emite **HOLD**, la solicitud se suspende temporalmente y puede ser re-evaluada cuando el estado operativo del usuario cambie a ACTIVE.

- Si esta fase emite **DENY**, la solicitud termina en el BLOQUE 2 sin ejecución de operaciones de chat.

La decisión de esta fase es definitiva para determinar si una solicitud puede proceder a bloques posteriores. No hay mecanismo de apelación, bypass ni omisión de esta fase.

La decisión emitida por esta fase constituye la salida final del BLOQUE 2.

---

**Fin del documento**


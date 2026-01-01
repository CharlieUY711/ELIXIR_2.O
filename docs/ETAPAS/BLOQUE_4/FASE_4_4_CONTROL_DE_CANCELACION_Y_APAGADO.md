# FASE 4.4 — Control de Cancelación y Apagado

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 4 — Ejecución Operativa Controlada  
**Fase**: FASE 4.4 — Control de Cancelación y Apagado  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 4.4

### 1.1. Función Exacta del Modelo de Cancelación y Apagado

La FASE 4.4 define el modelo conceptual canónico de cancelación y apagado en Elixir Platform. Establece qué significa cancelar una ejecución, qué significa apagar el sistema durante una ejecución, cuáles son los tipos de cancelación permitidos, qué garantías ofrece Elixir ante cancelación y apagado, y qué comportamientos son obligatorios y cuáles están prohibidos.

El modelo de cancelación y apagado opera como el marco normativo que rige todas las operaciones de interrupción y detención del BLOQUE 4. No implementa mecanismos de cancelación, no procesa señales de apagado, no gestiona timeouts ni watchdogs. Su única responsabilidad es definir el modelo conceptual que delimita qué es cancelación, qué es apagado, qué tipos de cancelación existen, y qué garantías y comportamientos rigen estas operaciones.

### 1.2. Necesidad del Modelo de Cancelación y Apagado

El modelo de cancelación y apagado es necesario incluso cuando las FASES 4.1, 4.2 y 4.3 han establecido el modelo de ejecución, los estados de ejecución y el contrato de acción, porque:

1. **Definición explícita de cancelación**: El sistema requiere definición explícita y no ambigua de qué significa cancelar una ejecución, qué tipos de cancelación existen, y qué garantías ofrece el sistema ante cancelación. El modelo de cancelación y apagado proporciona esta definición de forma canónica.

2. **Definición explícita de apagado**: El sistema requiere definición explícita y no ambigua de qué significa apagar el sistema durante ejecuciones en curso, qué comportamientos son obligatorios ante apagado, y qué garantías ofrece el sistema. El modelo de cancelación y apagado establece esta definición de forma normativa.

3. **Tipos de cancelación conceptuales**: El sistema requiere clasificación explícita de los tipos de cancelación permitidos, sus características distintivas, y sus comportamientos esperados. El modelo de cancelación y apagado establece esta clasificación de forma canónica.

4. **Garantías mínimas del sistema**: El sistema requiere definición explícita de qué garantiza y qué no garantiza ante cancelación y apagado. El modelo de cancelación y apagado establece estas garantías de forma normativa e inmodificable.

5. **Límites explícitos de responsabilidad**: El sistema requiere definición explícita de los límites de responsabilidad del sistema ante cancelación y apagado, estableciendo qué está garantizado y qué no está garantizado. El modelo de cancelación y apagado establece estos límites de forma canónica.

6. **Coherencia con FASES 4.1, 4.2 y 4.3**: El modelo de cancelación y apagado debe ser coherente con el modelo de ejecución (FASE 4.1), el modelo de estados (FASE 4.2), y el contrato de acción (FASE 4.3), sin modificar ni reinterpretar estos modelos ni invalidar las fases anteriores.

### 1.3. Riesgos que Mitiga

El modelo de cancelación y apagado mitiga los siguientes riesgos:

1. **Riesgo de ambigüedad sobre cancelación**: Sin definición explícita de cancelación, el sistema no puede determinar de forma no ambigua qué significa cancelar una ejecución, qué garantías ofrece, y qué comportamientos son esperados.

2. **Riesgo de ambigüedad sobre apagado**: Sin definición explícita de apagado, el sistema no puede determinar de forma no ambigua qué significa apagar el sistema durante ejecuciones, qué comportamientos son obligatorios, y qué garantías ofrece.

3. **Riesgo de garantías no explícitas**: Sin definición explícita de garantías, el sistema podría garantizar capacidades no declaradas o no garantizar capacidades que se asumen implícitamente, comprometiendo la confiabilidad y predecibilidad del sistema.

4. **Riesgo de comportamientos inconsistentes**: Sin modelo canónico de cancelación y apagado, diferentes componentes del sistema podrían tener interpretaciones diferentes de qué significa cancelar o apagar, generando comportamientos inconsistentes.

5. **Riesgo de pérdida de apagabilidad**: Sin modelo explícito de cancelación y apagado, el sistema podría perder capacidad de garantizar el principio de apagabilidad continua establecido en la FASE 4.1.

---

## 2. Principios del Modelo de Cancelación y Apagado

### 2.1. Declarativo y Normativo

El modelo de cancelación y apagado es declarativo y normativo. Define qué es cancelación, qué es apagado, qué tipos de cancelación existen, y qué comportamientos son obligatorios. No define cómo se implementa la cancelación, no especifica señales técnicas, no establece mecanismos de interrupción.

**Regla explícita**: El modelo de cancelación y apagado es puramente conceptual y normativo. No incluye detalles técnicos, señales, protocolos ni mecanismos de implementación.

### 2.2. No Ambigüedad

Cada concepto debe ser mutuamente excluyente y no ambiguo. La cancelación y el apagado deben estar claramente diferenciados. Los tipos de cancelación deben ser mutuamente excluyentes y no ambiguos. No existen conceptos parciales, conceptos superpuestos ni conceptos que dependan de interpretación.

**Regla explícita**: La cancelación y el apagado son conceptos distintos y mutuamente excluyentes. Los tipos de cancelación son mutuamente excluyentes y no ambiguos. No existe ambigüedad sobre qué significa cancelar, qué significa apagar, ni qué tipo de cancelación aplica.

### 2.3. Apagabilidad Continua

El modelo de cancelación y apagado debe garantizar que el sistema respeta el principio de apagabilidad continua establecido en la FASE 4.1: "El sistema debe seguir siendo apagable aunque ya esté ejecutando acciones." La apagabilidad tiene prioridad absoluta sobre cualquier optimización, conveniencia o intento de completitud de ejecuciones.

**Regla explícita**: El modelo de cancelación y apagado garantiza que el sistema puede apagarse en cualquier momento, incluso durante ejecuciones en curso. La apagabilidad priman sobre la completitud de ejecuciones.

### 2.4. Coherencia con Fases Anteriores

El modelo de cancelación y apagado debe ser completamente coherente con las FASES 4.1, 4.2 y 4.3. No puede modificar, extender ni reinterpretar los modelos establecidos en estas fases. Solo puede definir el modelo conceptual de cancelación y apagado que opera dentro de los límites establecidos por estas fases.

**Regla explícita**: El modelo de cancelación y apagado es coherente con el modelo de ejecución (FASE 4.1), el modelo de estados (FASE 4.2), y el contrato de acción (FASE 4.3). No modifica, extiende ni reinterpreta estos modelos.

---

## 3. Definición de Cancelación en Elixir

### 3.1. Qué es Cancelación

**Cancelación** en Elixir Platform es el acto normativo mediante el cual el sistema interrumpe una ejecución específica antes de que alcance un estado terminal natural (COMPLETED o FAILED), transicionándola al estado terminal CANCELLED.

Una cancelación es:

1. **Específica**: Afecta a una ejecución particular identificada. No afecta a otras ejecuciones ni al sistema globalmente.
2. **Normativa**: Es un acto de control del sistema, no un fallo ni un error. El sistema decide cancelar una ejecución según criterios normativos.
3. **Transitoria a estado terminal**: Resulta en transición de la ejecución al estado terminal CANCELLED según el modelo de estados de la FASE 4.2.
4. **Controlada**: El sistema mantiene control total sobre el proceso de cancelación y garantiza que la ejecución transiciona a CANCELLED de forma controlada.
5. **Auditable**: Genera eventos de auditoría que registran la cancelación y el estado resultante.

**Regla explícita**: La cancelación es un acto normativo de control del sistema que interrumpe una ejecución específica y la transiciona al estado terminal CANCELLED.

### 3.2. Qué NO es Cancelación

Las siguientes operaciones **NO** constituyen cancelación en el sentido del modelo de cancelación y apagado:

- ❌ **Apagado del sistema**: El apagado del sistema no es cancelación. El apagado afecta a todas las ejecuciones y resulta en transición a TERMINATED, no CANCELLED.
- ❌ **Fallos o errores**: Los fallos o errores durante la ejecución no son cancelación. Los fallos resultan en transición a FAILED, no CANCELLED.
- ❌ **Finalización exitosa**: La finalización exitosa de una ejecución no es cancelación. La finalización exitosa resulta en transición a COMPLETED, no CANCELLED.
- ❌ **Suspensión**: La suspensión temporal de una ejecución no es cancelación. La suspensión resulta en transición a SUSPENDED, no CANCELLED.
- ❌ **Cambio de condiciones previas**: El cambio de condiciones previas que impide el inicio de una ejecución no es cancelación. Una ejecución que no puede iniciar permanece en PENDING o transiciona a CANCELLED, pero el cambio de condiciones no es en sí mismo cancelación.

**Regla explícita**: Solo la interrupción normativa de una ejecución específica que resulta en transición a CANCELLED constituye cancelación. Todas las demás operaciones están fuera del alcance del modelo de cancelación.

### 3.3. Características de la Cancelación

La cancelación tiene las siguientes características:

1. **Selectividad**: La cancelación afecta solo a la ejecución específica identificada. No afecta a otras ejecuciones ni al sistema globalmente.

2. **Irreversibilidad**: Una vez que una ejecución es cancelada y transiciona a CANCELLED, no puede ser revertida. El estado CANCELLED es terminal y permanente según el modelo de estados de la FASE 4.2.

3. **Inmediatez relativa**: La cancelación debe iniciarse inmediatamente cuando es solicitada, aunque la transición completa a CANCELLED puede requerir tiempo para detener la acción ejecutable en progreso de forma controlada.

4. **Control del sistema**: El sistema mantiene control total sobre el proceso de cancelación. La ejecución no puede evitar la cancelación ni escapar del control del sistema.

5. **Respeto de límites estructurales**: La cancelación respeta los límites estructurales del modelo de ejecución (FASE 4.1) y las transiciones permitidas del modelo de estados (FASE 4.2).

**Regla explícita**: La cancelación es selectiva, irreversible, inmediata en su inicio, controlada por el sistema, y respeta los límites estructurales establecidos por las fases anteriores.

---

## 4. Tipos de Cancelación

### 4.1. Clasificación de Tipos de Cancelación

El modelo de cancelación y apagado define los siguientes tipos de cancelación conceptuales:

1. **CANCELACIÓN POR SOLICITUD**: Cancelación iniciada por solicitud explícita de un operador o componente del sistema.

2. **CANCELACIÓN POR CONDICIONES PREVIAS**: Cancelación iniciada cuando cambian las condiciones previas que habilitaron la ejecución, invalidando la elegibilidad de la ejecución.

3. **CANCELACIÓN POR VIOLACIÓN DE LÍMITES**: Cancelación iniciada cuando la ejecución intenta exceder los límites estructurales definidos en el modelo de ejecución (FASE 4.1) o el contrato de acción (FASE 4.3).

4. **CANCELACIÓN POR SEGURIDAD**: Cancelación iniciada cuando se detectan condiciones que comprometen la seguridad del sistema o la integridad de la ejecución.

Estos tipos de cancelación son mutuamente excluyentes y conceptuales. No definen mecanismos técnicos, señales ni protocolos. Solo clasifican conceptualmente las razones normativas por las cuales el sistema puede cancelar una ejecución.

**Regla explícita**: Estos cuatro tipos son los únicos tipos de cancelación permitidos. No existen otros tipos de cancelación. Los tipos son mutuamente excluyentes y puramente conceptuales.

### 4.2. Descripción Normativa de Cada Tipo

#### 4.2.1. CANCELACIÓN POR SOLICITUD

**Definición**: CANCELACIÓN POR SOLICITUD es el tipo de cancelación que ocurre cuando un operador o componente del sistema solicita explícitamente la cancelación de una ejecución específica.

**Características**:
- Es iniciada por solicitud explícita, no por condiciones automáticas del sistema
- Requiere identificación explícita de la ejecución a cancelar
- No requiere justificación adicional más allá de la solicitud explícita
- El sistema debe procesar la solicitud y transicionar la ejecución a CANCELLED

**Regla explícita**: CANCELACIÓN POR SOLICITUD es el tipo de cancelación más directo y explícito. El sistema debe procesar toda solicitud explícita de cancelación y transicionar la ejecución a CANCELLED.

#### 4.2.2. CANCELACIÓN POR CONDICIONES PREVIAS

**Definición**: CANCELACIÓN POR CONDICIONES PREVIAS es el tipo de cancelación que ocurre cuando las condiciones previas que habilitaron la ejecución cambian, invalidando la elegibilidad de la ejecución.

**Características**:
- Es iniciada automáticamente por el sistema cuando detecta cambio en condiciones previas
- Las condiciones previas incluyen: identidad válida (BLOQUE 1), decisión ALLOW (BLOQUE 2), habilitación ENABLED (BLOQUE 3), sistema operativo, acción ejecutable válida
- El cambio en cualquier condición previa puede resultar en cancelación
- El sistema debe detectar el cambio y transicionar la ejecución a CANCELLED

**Regla explícita**: CANCELACIÓN POR CONDICIONES PREVIAS es automática y obligatoria cuando cambian las condiciones previas. El sistema debe cancelar la ejecución si las condiciones previas dejan de cumplirse.

#### 4.2.3. CANCELACIÓN POR VIOLACIÓN DE LÍMITES

**Definición**: CANCELACIÓN POR VIOLACIÓN DE LÍMITES es el tipo de cancelación que ocurre cuando la ejecución intenta exceder los límites estructurales definidos en el modelo de ejecución (FASE 4.1) o el contrato de acción (FASE 4.3).

**Características**:
- Es iniciada automáticamente por el sistema cuando detecta intento de exceder límites
- Los límites incluyen: alcance de la acción ejecutable, alcance temporal, alcance de recursos, alcance de efectos
- El intento de exceder cualquier límite debe resultar en cancelación inmediata
- El sistema debe detectar la violación y transicionar la ejecución a CANCELLED

**Regla explícita**: CANCELACIÓN POR VIOLACIÓN DE LÍMITES es automática y obligatoria cuando se detecta intento de exceder límites. El sistema debe cancelar la ejecución inmediatamente si intenta exceder límites estructurales.

#### 4.2.4. CANCELACIÓN POR SEGURIDAD

**Definición**: CANCELACIÓN POR SEGURIDAD es el tipo de cancelación que ocurre cuando se detectan condiciones que comprometen la seguridad del sistema o la integridad de la ejecución.

**Características**:
- Es iniciada automáticamente por el sistema cuando detecta condiciones de seguridad
- Las condiciones de seguridad incluyen: amenazas detectadas, comportamientos sospechosos, violaciones de integridad, condiciones que comprometen el fail-closed
- La detección de cualquier condición de seguridad debe resultar en cancelación inmediata
- El sistema debe detectar la condición y transicionar la ejecución a CANCELLED

**Regla explícita**: CANCELACIÓN POR SEGURIDAD es automática y obligatoria cuando se detectan condiciones de seguridad. El sistema debe cancelar la ejecución inmediatamente si se detectan condiciones que comprometen la seguridad.

### 4.3. Prioridad entre Tipos de Cancelación

Cuando múltiples tipos de cancelación son aplicables simultáneamente, el sistema debe procesar todas las cancelaciones, pero la transición a CANCELLED es única e inmediata. No existe jerarquía entre tipos de cancelación: todos resultan en la misma transición a CANCELLED.

**Regla explícita**: Todos los tipos de cancelación tienen la misma prioridad y resultan en la misma transición a CANCELLED. No existe jerarquía ni orden de procesamiento entre tipos de cancelación.

---

## 5. Definición de Apagado en Elixir

### 5.1. Qué es Apagado

**Apagado** en Elixir Platform es el acto normativo mediante el cual el sistema detiene globalmente todas las operaciones ejecutables, transicionando todas las ejecuciones no terminales al estado terminal TERMINATED.

Un apagado es:

1. **Global**: Afecta a todas las ejecuciones del sistema, no solo a una ejecución específica.
2. **Normativo**: Es un acto de control del sistema, no un fallo ni un error. El sistema decide apagarse según criterios normativos.
3. **Transitoria a estado terminal**: Resulta en transición de todas las ejecuciones no terminales al estado terminal TERMINATED según el modelo de estados de la FASE 4.2.
4. **Controlada**: El sistema mantiene control total sobre el proceso de apagado y garantiza que todas las ejecuciones transicionan a TERMINATED de forma controlada.
5. **Auditable**: Genera eventos de auditoría que registran el apagado y los estados resultantes de todas las ejecuciones afectadas.
6. **Prevención de nuevas ejecuciones**: Impide el inicio de nuevas ejecuciones durante y después del apagado.

**Regla explícita**: El apagado es un acto normativo de control del sistema que detiene globalmente todas las operaciones ejecutables y transiciona todas las ejecuciones no terminales al estado terminal TERMINATED.

### 5.2. Qué NO es Apagado

Las siguientes operaciones **NO** constituyen apagado en el sentido del modelo de cancelación y apagado:

- ❌ **Cancelación de ejecución específica**: La cancelación de una ejecución específica no es apagado. La cancelación afecta solo a una ejecución y resulta en transición a CANCELLED, no TERMINATED.
- ❌ **Fallos o errores**: Los fallos o errores durante la ejecución no son apagado. Los fallos afectan a ejecuciones específicas y resultan en transición a FAILED, no TERMINATED.
- ❌ **Suspensión de ejecución**: La suspensión temporal de una ejecución no es apagado. La suspensión afecta solo a una ejecución y resulta en transición a SUSPENDED, no TERMINATED.
- ❌ **Mantenimiento programado**: El mantenimiento programado que detiene temporalmente el sistema no es apagado en el sentido normativo del modelo, aunque puede utilizar mecanismos similares.

**Regla explícita**: Solo la detención global de todas las operaciones ejecutables que resulta en transición a TERMINATED de todas las ejecuciones no terminales constituye apagado. Todas las demás operaciones están fuera del alcance del modelo de apagado.

### 5.3. Características del Apagado

El apagado tiene las siguientes características:

1. **Globalidad**: El apagado afecta a todas las ejecuciones del sistema simultáneamente. No existe apagado parcial ni selectivo.

2. **Irreversibilidad del estado**: Una vez que una ejecución es terminada por apagado y transiciona a TERMINATED, no puede ser revertida. El estado TERMINATED es terminal y permanente según el modelo de estados de la FASE 4.2.

3. **Inmediatez absoluta**: El apagado debe iniciarse inmediatamente cuando es solicitado, sin esperar completitud de ejecuciones en curso. La apagabilidad tiene prioridad absoluta sobre la completitud de ejecuciones.

4. **Control del sistema**: El sistema mantiene control total sobre el proceso de apagado. Las ejecuciones no pueden evitar el apagado ni escapar del control del sistema.

5. **Respeto de límites estructurales**: El apagado respeta los límites estructurales del modelo de ejecución (FASE 4.1) y las transiciones permitidas del modelo de estados (FASE 4.2).

6. **Prevención de nuevas ejecuciones**: El apagado impide el inicio de nuevas ejecuciones durante y después del proceso de apagado.

**Regla explícita**: El apagado es global, irreversible en su estado resultante, inmediato en su inicio, controlado por el sistema, respeta los límites estructurales, y previene nuevas ejecuciones.

---

## 6. Comportamiento Esperado ante Cancelación

### 6.1. Comportamiento por Estado de Ejecución

El comportamiento esperado ante cancelación varía según el estado actual de la ejecución:

#### 6.1.1. Cancelación desde PENDING

Cuando una ejecución en estado PENDING es cancelada:

1. **Transición inmediata**: La ejecución transiciona inmediatamente a CANCELLED, ya que no está realizando ninguna acción ejecutable.

2. **Sin efectos de ejecución**: El sistema garantiza que no se producen efectos de la ejecución, ya que la ejecución no había iniciado.

3. **Liberación de recursos**: El sistema libera cualquier recurso que había sido reservado para la ejecución.

4. **Registro de auditoría**: El sistema registra un evento de auditoría que documenta la cancelación y el estado resultante.

**Regla explícita**: La cancelación desde PENDING resulta en transición inmediata a CANCELLED sin efectos de ejecución. El sistema garantiza ausencia completa de efectos.

#### 6.1.2. Cancelación desde RUNNING

Cuando una ejecución en estado RUNNING es cancelada:

1. **Detención controlada**: El sistema detiene la acción ejecutable en progreso de forma controlada, respetando el contrato de acción (FASE 4.3).

2. **Transición a CANCELLED**: La ejecución transiciona a CANCELLED una vez que la acción ejecutable se detiene.

3. **Minimización de efectos parciales**: El sistema intenta minimizar los efectos parciales de la ejecución, pero no garantiza ausencia completa de efectos parciales según el contrato de acción.

4. **Liberación de recursos**: El sistema libera todos los recursos que había adquirido la ejecución.

5. **Registro de auditoría**: El sistema registra un evento de auditoría que documenta la cancelación, el estado previo (RUNNING), y el estado resultante (CANCELLED).

**Regla explícita**: La cancelación desde RUNNING resulta en detención controlada y transición a CANCELLED. El sistema intenta minimizar efectos parciales pero no garantiza ausencia completa de efectos parciales.

#### 6.1.3. Cancelación desde SUSPENDED

Cuando una ejecución en estado SUSPENDED es cancelada:

1. **Transición inmediata**: La ejecución transiciona inmediatamente a CANCELLED, ya que no está realizando ninguna acción ejecutable.

2. **Sin efectos adicionales**: El sistema garantiza que no se producen efectos adicionales de la ejecución, ya que la ejecución estaba suspendida.

3. **Liberación de recursos**: El sistema libera cualquier recurso que había sido reservado para la ejecución.

4. **Registro de auditoría**: El sistema registra un evento de auditoría que documenta la cancelación y el estado resultante.

**Regla explícita**: La cancelación desde SUSPENDED resulta en transición inmediata a CANCELLED sin efectos adicionales. El sistema garantiza ausencia completa de efectos adicionales.

### 6.2. Garantías del Sistema ante Cancelación

El sistema garantiza lo siguiente ante cancelación:

1. **Transición garantizada**: El sistema garantiza que toda ejecución cancelada transiciona a CANCELLED de forma controlada, sin excepción.

2. **No inicio de nuevas acciones**: El sistema garantiza que no se inician nuevas acciones ejecutables después de la cancelación.

3. **Detención controlada**: El sistema garantiza que las acciones ejecutables en progreso se detienen de forma controlada, respetando el contrato de acción.

4. **Estados consistentes**: El sistema garantiza que todas las ejecuciones canceladas alcanzan el estado terminal CANCELLED de forma consistente, sin dejar ejecuciones en estados inconsistentes.

5. **Auditabilidad**: El sistema garantiza que todas las cancelaciones son registradas en eventos de auditoría.

**Regla explícita**: El sistema garantiza transición controlada a CANCELLED, no inicio de nuevas acciones, detención controlada, estados consistentes y auditabilidad. El sistema no garantiza ausencia completa de efectos parciales de ejecuciones que estaban en RUNNING.

### 6.3. Límites de Garantías ante Cancelación

El sistema explícitamente NO garantiza lo siguiente ante cancelación:

- ❌ **Ausencia completa de efectos parciales**: El sistema no garantiza que no existan efectos parciales de ejecuciones que estaban en RUNNING cuando fueron canceladas. El sistema solo intenta minimizar estos efectos.

- ❌ **Reversibilidad de efectos**: El sistema no garantiza que todos los efectos de una ejecución cancelada puedan revertirse completamente.

- ❌ **Atomicidad de cancelación**: El sistema no garantiza que la cancelación sea atómica. La transición a CANCELLED puede requerir tiempo para detener la acción ejecutable de forma controlada.

- ❌ **Consistencia externa**: El sistema no garantiza consistencia con sistemas externos o recursos externos después de la cancelación.

**Regla explícita**: El sistema establece límites explícitos sobre qué garantiza y qué no garantiza ante cancelación. Cualquier garantía no explícitamente establecida está prohibida.

---

## 7. Comportamiento Esperado ante Apagado

### 7.1. Comportamiento por Estado de Ejecución

El comportamiento esperado ante apagado varía según el estado actual de cada ejecución:

#### 7.1.1. Apagado con Ejecuciones en PENDING

Cuando el sistema se apaga y existen ejecuciones en estado PENDING:

1. **Transición inmediata**: Todas las ejecuciones en PENDING transicionan inmediatamente a TERMINATED, ya que no están realizando ninguna acción ejecutable.

2. **Sin efectos de ejecución**: El sistema garantiza que no se producen efectos de ejecuciones que estaban en PENDING, ya que estas ejecuciones no habían iniciado.

3. **Prevención de nuevas ejecuciones**: El sistema impide el inicio de nuevas ejecuciones durante y después del apagado.

4. **Registro de auditoría**: El sistema registra eventos de auditoría que documentan el apagado y la transición de todas las ejecuciones en PENDING a TERMINATED.

**Regla explícita**: El apagado con ejecuciones en PENDING resulta en transición inmediata a TERMINATED sin efectos de ejecución. El sistema garantiza ausencia completa de efectos.

#### 7.1.2. Apagado con Ejecuciones en RUNNING

Cuando el sistema se apaga y existen ejecuciones en estado RUNNING:

1. **Detención controlada**: El sistema detiene todas las acciones ejecutables en progreso de forma controlada, respetando el contrato de acción (FASE 4.3).

2. **Transición a TERMINATED**: Todas las ejecuciones en RUNNING transicionan a TERMINATED una vez que las acciones ejecutables se detienen.

3. **Minimización de efectos parciales**: El sistema intenta minimizar los efectos parciales de las ejecuciones, pero no garantiza ausencia completa de efectos parciales según el contrato de acción.

4. **Prevención de nuevas ejecuciones**: El sistema impide el inicio de nuevas ejecuciones durante y después del apagado.

5. **Registro de auditoría**: El sistema registra eventos de auditoría que documentan el apagado, el estado previo (RUNNING), y la transición de todas las ejecuciones a TERMINATED.

**Regla explícita**: El apagado con ejecuciones en RUNNING resulta en detención controlada y transición a TERMINATED. El sistema intenta minimizar efectos parciales pero no garantiza ausencia completa de efectos parciales.

#### 7.1.3. Apagado con Ejecuciones en SUSPENDED

Cuando el sistema se apaga y existen ejecuciones en estado SUSPENDED:

1. **Transición inmediata**: Todas las ejecuciones en SUSPENDED transicionan inmediatamente a TERMINATED, ya que no están realizando ninguna acción ejecutable.

2. **Sin efectos adicionales**: El sistema garantiza que no se producen efectos adicionales de ejecuciones que estaban en SUSPENDED, ya que estas ejecuciones estaban suspendidas.

3. **No reanudación**: El sistema no reanuda ejecuciones suspendidas durante el apagado.

4. **Prevención de nuevas ejecuciones**: El sistema impide el inicio de nuevas ejecuciones durante y después del apagado.

5. **Registro de auditoría**: El sistema registra eventos de auditoría que documentan el apagado y la transición de todas las ejecuciones en SUSPENDED a TERMINATED.

**Regla explícita**: El apagado con ejecuciones en SUSPENDED resulta en transición inmediata a TERMINATED sin efectos adicionales. El sistema garantiza ausencia completa de efectos adicionales.

#### 7.1.4. Apagado con Ejecuciones en Estados Terminales

Cuando el sistema se apaga y existen ejecuciones en estados terminales (COMPLETED, CANCELLED, FAILED, TERMINATED):

1. **Sin modificación**: Las ejecuciones en estados terminales permanecen en su estado terminal. No se modifican.

2. **Registro de auditoría**: El sistema registra eventos de auditoría que documentan el apagado y confirman que las ejecuciones en estados terminales permanecen en su estado.

**Regla explícita**: El apagado no modifica ejecuciones en estados terminales. Estas ejecuciones permanecen en su estado terminal permanentemente.

### 7.2. Garantías del Sistema ante Apagado

El sistema garantiza lo siguiente ante apagado:

1. **Transición garantizada**: El sistema garantiza que todas las ejecuciones no terminales transicionan a TERMINATED de forma controlada, sin excepción.

2. **No inicio de nuevas ejecuciones**: El sistema garantiza que no se inician nuevas ejecuciones durante y después del apagado.

3. **Detención controlada**: El sistema garantiza que todas las acciones ejecutables en progreso se detienen de forma controlada, respetando el contrato de acción.

4. **Estados consistentes**: El sistema garantiza que todas las ejecuciones afectadas alcanzan estados terminales consistentes (TERMINATED para ejecuciones no terminales, estados terminales previos para ejecuciones ya terminales), sin dejar ejecuciones en estados inconsistentes.

5. **Apagabilidad inmediata**: El sistema garantiza que responde inmediatamente a señales de apagado, sin esperar completitud de ejecuciones en curso.

6. **Auditabilidad**: El sistema garantiza que el apagado y todas las transiciones resultantes son registradas en eventos de auditoría.

**Regla explícita**: El sistema garantiza transición controlada a TERMINATED, no inicio de nuevas ejecuciones, detención controlada, estados consistentes, apagabilidad inmediata y auditabilidad. El sistema no garantiza ausencia completa de efectos parciales de ejecuciones que estaban en RUNNING.

### 7.3. Límites de Garantías ante Apagado

El sistema explícitamente NO garantiza lo siguiente ante apagado:

- ❌ **Ausencia completa de efectos parciales**: El sistema no garantiza que no existan efectos parciales de ejecuciones que estaban en RUNNING cuando el sistema se apagó. El sistema solo intenta minimizar estos efectos.

- ❌ **Reversibilidad de efectos**: El sistema no garantiza que todos los efectos de ejecuciones terminadas por apagado puedan revertirse completamente.

- ❌ **Atomicidad de apagado**: El sistema no garantiza que el apagado sea atómico. La transición a TERMINATED de todas las ejecuciones puede requerir tiempo para detener las acciones ejecutables de forma controlada.

- ❌ **Consistencia externa**: El sistema no garantiza consistencia con sistemas externos o recursos externos después del apagado.

- ❌ **Recuperación automática**: El sistema no garantiza recuperación automática de ejecuciones después del apagado. Las ejecuciones en TERMINATED permanecen en ese estado permanentemente.

**Regla explícita**: El sistema establece límites explícitos sobre qué garantiza y qué no garantiza ante apagado. Cualquier garantía no explícitamente establecida está prohibida.

---

## 8. Diferenciación entre Cancelación y Apagado

### 8.1. Diferencias Fundamentales

La cancelación y el apagado son conceptos distintos y mutuamente excluyentes:

1. **Alcance**: La cancelación afecta a una ejecución específica. El apagado afecta a todas las ejecuciones del sistema.

2. **Estado terminal resultante**: La cancelación resulta en transición a CANCELLED. El apagado resulta en transición a TERMINATED.

3. **Selectividad**: La cancelación es selectiva y puede aplicarse a ejecuciones específicas. El apagado es global y afecta a todas las ejecuciones simultáneamente.

4. **Prevención de nuevas ejecuciones**: La cancelación no previene el inicio de nuevas ejecuciones. El apagado previene el inicio de nuevas ejecuciones durante y después del proceso.

5. **Razón normativa**: La cancelación puede ocurrir por múltiples razones (solicitud, condiciones previas, violación de límites, seguridad). El apagado ocurre por decisión de apagar el sistema globalmente.

**Regla explícita**: La cancelación y el apagado son conceptos distintos y mutuamente excluyentes. No existe cancelación que resulte en TERMINATED ni apagado que resulte en CANCELLED.

### 8.2. Cuándo Aplicar Cancelación vs. Apagado

La cancelación debe aplicarse cuando:

- Se requiere interrumpir una ejecución específica sin afectar otras ejecuciones.
- Se requiere transicionar una ejecución específica a CANCELLED.
- Las condiciones que justifican la interrupción afectan solo a una ejecución específica.

El apagado debe aplicarse cuando:

- Se requiere detener globalmente todas las operaciones ejecutables del sistema.
- Se requiere transicionar todas las ejecuciones no terminales a TERMINATED.
- Se requiere prevenir el inicio de nuevas ejecuciones durante y después del proceso.

**Regla explícita**: La cancelación se aplica a ejecuciones específicas. El apagado se aplica al sistema globalmente. No existe apagado selectivo ni cancelación global.

---

## 9. Alineación con el Principio de Apagabilidad Continua

### 9.1. Cómo el Modelo Asegura Apagabilidad Continua

El modelo de cancelación y apagado asegura el principio de apagabilidad continua establecido en la FASE 4.1 mediante:

1. **Apagado siempre posible**: El modelo garantiza que el sistema puede apagarse en cualquier momento, incluso durante ejecuciones en curso, transicionando todas las ejecuciones no terminales a TERMINATED.

2. **Cancelación siempre posible**: El modelo garantiza que cualquier ejecución puede ser cancelada en cualquier momento, incluso durante su ejecución, transicionándola a CANCELLED.

3. **Prioridad de apagabilidad**: El modelo establece que la apagabilidad tiene prioridad absoluta sobre cualquier optimización, conveniencia o intento de completitud de ejecuciones.

4. **Inmediatez de respuesta**: El modelo garantiza que el sistema responde inmediatamente a señales de cancelación y apagado, sin esperar completitud de ejecuciones en curso.

5. **Control total del sistema**: El modelo garantiza que el sistema mantiene control total sobre cancelación y apagado. Las ejecuciones no pueden evitar la cancelación ni el apagado.

**Regla explícita**: El modelo de cancelación y apagado garantiza que el sistema puede cancelar cualquier ejecución y apagarse en cualquier momento, respetando el principio de apagabilidad continua.

### 9.2. Prioridad de Apagabilidad sobre Completitud

El principio de apagabilidad tiene prioridad absoluta sobre la completitud de ejecuciones. El modelo de cancelación y apagado refleja esta prioridad mediante:

1. **Apagado inmediato**: El sistema puede apagarse inmediatamente, incluso si esto resulta en ejecuciones incompletas.

2. **Cancelación inmediata**: El sistema puede cancelar cualquier ejecución inmediatamente, incluso si esto resulta en ejecución incompleta.

3. **No espera de completitud**: El sistema no espera que las ejecuciones completen antes de procesar cancelación o apagado.

4. **Aceptación de efectos parciales**: El sistema acepta que pueden existir efectos parciales de ejecuciones canceladas o terminadas por apagado, priorizando la apagabilidad sobre la completitud.

**Regla explícita**: La apagabilidad tiene prioridad absoluta sobre la completitud de ejecuciones. El sistema puede cancelar o apagar en cualquier momento, incluso si esto resulta en ejecuciones incompletas o efectos parciales.

---

## 10. Exclusiones Explícitas

### 10.1. Qué NO Incluye el Modelo de Cancelación y Apagado

El modelo de cancelación y apagado explícitamente NO incluye:

- ❌ **Señales técnicas**: El modelo no define señales técnicas, eventos, protocolos ni mecanismos de comunicación para cancelación o apagado.

- ❌ **Mecanismos de interrupción**: El modelo no define cómo se interrumpen técnicamente las ejecuciones, cómo se detienen las acciones ejecutables, ni cómo se implementan los mecanismos de control.

- ❌ **Timeouts y watchdogs**: El modelo no define timeouts, watchdogs, retries ni mecanismos de monitoreo técnico.

- ❌ **Infraestructura operativa**: El modelo no define procesos operativos, procedimientos de mantenimiento, ni configuraciones de infraestructura.

- ❌ **Interfaces de usuario**: El modelo no define UX/UI para solicitar cancelación o apagado, ni interacciones con usuarios finales.

- ❌ **Estrategias de recuperación**: El modelo no define cómo se recuperan ejecuciones después de cancelación o apagado, ni estrategias de continuidad.

- ❌ **Optimizaciones de performance**: El modelo no define optimizaciones, cachés, ni estrategias de performance para cancelación o apagado.

- ❌ **Detalles de implementación**: El modelo no incluye detalles técnicos de cómo se implementa la cancelación o el apagado.

**Regla explícita**: El modelo de cancelación y apagado es puramente conceptual y normativo. No incluye detalles técnicos, señales, protocolos, mecanismos ni implementaciones.

### 10.2. Preparación para Fases Posteriores

El modelo de cancelación y apagado prepara el terreno para fases posteriores estableciendo:

- **Base normativa**: Un modelo conceptual claro que servirá como base para la implementación técnica de cancelación y apagado.

- **Criterios de validación**: Criterios que permitirán validar que las implementaciones cumplen con el modelo conceptual.

- **Límites de diseño**: Restricciones que guiarán las decisiones de diseño en fases posteriores.

- **Marco de garantías**: Un marco que establece qué garantiza y qué no garantiza el sistema, guiando las expectativas y responsabilidades.

Las fases posteriores utilizarán este modelo como referencia normativa para definir los mecanismos técnicos de implementación, señales, protocolos y procesos operativos de cancelación y apagado.

**Regla explícita**: El modelo de cancelación y apagado establece el marco conceptual y normativo. Las fases posteriores definirán los mecanismos técnicos e implementativos.

---

## 11. Criterios de Cierre de la FASE 4.4

### 11.1. Criterios de Cierre

La FASE 4.4 se considera cerrada cuando:

1. **Modelo de cancelación definido**: El modelo conceptual de cancelación está completamente definido con definición, características, tipos y comportamientos esperados establecidos.

2. **Modelo de apagado definido**: El modelo conceptual de apagado está completamente definido con definición, características y comportamientos esperados establecidos.

3. **Tipos de cancelación establecidos**: Los tipos de cancelación permitidos están explícitamente definidos y documentados con sus características distintivas.

4. **Comportamientos esperados establecidos**: Los comportamientos esperados ante cancelación y apagado están explícitamente definidos y documentados para cada estado de ejecución.

5. **Garantías del sistema establecidas**: Las garantías del sistema ante cancelación y apagado están explícitamente definidas y documentadas, incluyendo límites explícitos de garantías.

6. **Diferenciación establecida**: La diferenciación entre cancelación y apagado está explícitamente definida y documentada.

7. **Alineación con apagabilidad verificada**: La alineación del modelo con el principio de apagabilidad continua está verificada y documentada.

8. **Coherencia con FASES 4.1, 4.2 y 4.3 verificada**: El modelo de cancelación y apagado es coherente con el modelo de ejecución (FASE 4.1), el modelo de estados (FASE 4.2), y el contrato de acción (FASE 4.3).

9. **Exclusiones clarificadas**: Las exclusiones explícitas están documentadas y clarificadas.

### 11.2. Condiciones para Avance a Fase Siguiente

La FASE 4.4 habilita el avance a la siguiente fase del BLOQUE 4 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre están satisfechos.

2. **Modelo de cancelación y apagado operativo**: El modelo conceptual de cancelación y apagado está operativo y puede gobernar las operaciones de interrupción y detención del BLOQUE 4.

3. **Garantías de apagabilidad verificadas**: Las garantías de apagabilidad están verificadas y funcionando según lo documentado.

**Regla explícita**: El avance a la siguiente fase requiere cumplimiento explícito de todos los criterios de cierre. No existe avance automático ni implícito.

---

## 12. Cierre Canónico de la Fase

### 12.1. Declaración Explícita de Cierre

La FASE 4.4 queda conceptualmente cerrada y establece el modelo canónico de cancelación y apagado para el BLOQUE 4.

El modelo de cancelación y apagado definido por esta fase gobierna todas las operaciones de interrupción y detención del BLOQUE 4. Establece qué significa cancelar una ejecución, qué significa apagar el sistema, qué tipos de cancelación existen, qué comportamientos son esperados, y qué garantías ofrece el sistema.

El modelo de cancelación y apagado es definitivo para determinar cómo se interrumpen y detienen las ejecuciones en el BLOQUE 4. No hay mecanismo de apelación, bypass ni omisión de este modelo.

**Regla explícita**: El modelo de cancelación y apagado es canónico e inmodificable. Una vez aprobado, no admite reinterpretaciones ni extensiones.

### 12.2. Preparación para Fases Posteriores

La FASE 4.4 establece el modelo conceptual de cancelación y apagado necesario para fases posteriores. Las fases posteriores utilizarán este modelo para definir cómo se implementan técnicamente los mecanismos de cancelación y apagado, cómo se procesan las señales, cómo se gestionan los recursos, y cómo se garantiza la apagabilidad continua.

La FASE 4.4 no anticipa ni desarrolla las fases posteriores. Solo establece el modelo conceptual que las fases posteriores utilizarán como base.

**Regla explícita**: La FASE 4.4 establece el modelo conceptual de cancelación y apagado. Las fases posteriores utilizarán este modelo para definir la implementación técnica. No existe anticipación ni desarrollo de fases posteriores en este documento.

---

**Fin del documento**

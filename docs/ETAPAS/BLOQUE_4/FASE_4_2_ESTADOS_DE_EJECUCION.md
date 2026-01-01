# FASE 4.2 — Estados de Ejecución

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 4 — Ejecución Operativa Controlada  
**Fase**: FASE 4.2 — Estados de Ejecución  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 4.2

### 1.1. Función Exacta del Modelo de Estados

La FASE 4.2 define el modelo canónico de estados de ejecución en Elixir Platform. Establece qué estados puede tener una ejecución durante su ciclo de vida, qué transiciones son permitidas entre estados, qué transiciones están prohibidas, y cómo el sistema garantiza control y apagabilidad mediante la gestión explícita de estados.

El modelo de estados opera como el marco normativo que rige el ciclo de vida de todas las ejecuciones del BLOQUE 4. No implementa gestión de estados, no procesa transiciones, no almacena información de estado. Su única responsabilidad es definir el modelo conceptual que delimita qué estados existen, cómo se relacionan entre sí, y qué reglas gobiernan las transiciones entre estados.

### 1.2. Necesidad del Modelo de Estados

El modelo de estados es necesario incluso cuando la FASE 4.1 ha establecido el modelo de ejecución, porque:

1. **Trazabilidad del ciclo de vida**: El sistema requiere conocimiento explícito del estado actual de cada ejecución para garantizar control y apagabilidad. El modelo de estados proporciona esta trazabilidad mediante estados canónicos y explícitos.

2. **Prevención de ambigüedad**: Sin estados explícitos, el sistema no puede determinar de forma no ambigua si una ejecución está iniciada, en progreso, completada o detenida. El modelo de estados elimina esta ambigüedad mediante estados canónicos y mutuamente excluyentes.

3. **Garantía de apagabilidad**: El sistema requiere capacidad de determinar el estado de cada ejecución en cualquier momento para poder detenerla de forma controlada. El modelo de estados garantiza esta capacidad mediante estados explícitos y transiciones controladas.

4. **Prevención de transiciones inválidas**: El sistema requiere reglas explícitas sobre qué transiciones entre estados son válidas y cuáles están prohibidas. El modelo de estados establece estas reglas de forma canónica e inmodificable.

5. **Comportamiento ante cancelación y apagado**: El sistema requiere definición explícita de qué ocurre con los estados de ejecución cuando se cancela una ejecución o se apaga el sistema. El modelo de estados establece este comportamiento de forma normativa.

6. **Coherencia con FASE 4.1**: El modelo de estados extiende el modelo de ejecución de la FASE 4.1 agregando la dimensión de estados, sin modificar ni reinterpretar el modelo de ejecución ni invalidar la FASE 4.1.

### 1.3. Riesgos que Mitiga

El modelo de estados mitiga los siguientes riesgos:

1. **Riesgo de ambigüedad de estado**: Sin estados explícitos, el sistema no puede determinar de forma no ambigua el estado de una ejecución, comprometiendo el control y la apagabilidad.

2. **Riesgo de transiciones inválidas**: Sin reglas explícitas sobre transiciones, el sistema podría permitir transiciones que comprometan la integridad, el control o la apagabilidad.

3. **Riesgo de pérdida de control durante cancelación**: Sin definición explícita de comportamiento ante cancelación, el sistema podría perder control sobre ejecuciones canceladas o dejar estados inconsistentes.

4. **Riesgo de pérdida de apagabilidad**: Sin estados explícitos que permitan determinar el estado de ejecuciones en curso, el sistema podría perder capacidad de apagado controlado.

5. **Riesgo de estados inconsistentes**: Sin modelo canónico de estados, diferentes componentes del sistema podrían tener interpretaciones diferentes del estado de una ejecución, generando inconsistencias.

---

## 2. Principios del Modelo de Estados

### 2.1. Simplicidad

El modelo de estados debe ser simple y comprensible. No debe incluir estados innecesarios, estados redundantes ni estados que puedan expresarse como combinaciones de otros estados. Cada estado debe tener un propósito único y claramente definido.

**Regla explícita**: El modelo de estados contiene únicamente los estados estrictamente necesarios para garantizar control, apagabilidad y trazabilidad del ciclo de vida de las ejecuciones. Cualquier estado adicional está prohibido.

### 2.2. No Ambigüedad

Cada estado debe ser mutuamente excluyente y no ambiguo. En cualquier momento, una ejecución debe estar exactamente en un estado, y ese estado debe ser determinable de forma no ambigua. No existen estados parciales, estados superpuestos ni estados que dependan de interpretación.

**Regla explícita**: El estado de una ejecución es siempre único, explícito y determinable de forma no ambigua. No existe ambigüedad sobre el estado actual de una ejecución.

### 2.3. Apagabilidad

El modelo de estados debe garantizar que el sistema puede determinar el estado de cualquier ejecución en cualquier momento, y puede transicionar cualquier ejecución a un estado terminal de forma controlada, incluso durante ejecuciones en progreso. La apagabilidad tiene prioridad absoluta sobre cualquier optimización o conveniencia.

**Regla explícita**: El modelo de estados garantiza que el sistema puede transicionar cualquier ejecución a un estado terminal en cualquier momento, sin excepción. La apagabilidad priman sobre la completitud de ejecuciones.

### 2.4. Estados Explícitos

Todos los estados deben ser explícitos y canónicos. No existen estados implícitos, estados derivados ni estados que se infieran de otras propiedades. El estado de una ejecución es siempre una propiedad explícita y canónica del modelo.

**Regla explícita**: El estado de una ejecución es siempre una propiedad explícita y canónica. No existen estados implícitos ni estados derivados.

---

## 3. Estados de Ejecución Definidos

### 3.1. Listado Completo de Estados

El modelo de estados define los siguientes estados canónicos para ejecuciones:

1. **PENDING**: La ejecución ha sido solicitada pero aún no ha iniciado. Está esperando verificación de condiciones previas o autorización para iniciar.

2. **RUNNING**: La ejecución ha iniciado y está en progreso. Está realizando la acción ejecutable solicitada.

3. **SUSPENDED**: La ejecución ha sido suspendida temporalmente. Puede ser reanudada posteriormente.

4. **COMPLETED**: La ejecución ha finalizado exitosamente. La acción ejecutable se completó según lo esperado.

5. **CANCELLED**: La ejecución ha sido cancelada antes de completarse. La cancelación puede ocurrir por solicitud explícita o por cambio en condiciones previas.

6. **FAILED**: La ejecución ha finalizado de forma no exitosa debido a un error, fallo o condición no prevista.

7. **TERMINATED**: La ejecución ha sido terminada forzadamente debido a apagado del sistema o activación del kill-switch.

### 3.2. Descripción Normativa de Cada Estado

#### 3.2.1. PENDING

**Definición**: PENDING es el estado inicial de toda ejecución. Una ejecución en estado PENDING ha sido solicitada pero aún no ha iniciado. Está esperando verificación de condiciones previas, autorización para iniciar, o disponibilidad de recursos necesarios.

**Características**:
- Es el estado inicial canónico de todas las ejecuciones
- Una ejecución en PENDING no está realizando ninguna acción ejecutable
- Una ejecución en PENDING puede transicionar a RUNNING si se cumplen todas las condiciones previas
- Una ejecución en PENDING puede transicionar a CANCELLED si se cancela antes de iniciar
- Una ejecución en PENDING puede transicionar a TERMINATED si el sistema se apaga antes de iniciar

**Regla explícita**: Toda ejecución inicia en estado PENDING. No existe ejecución que inicie en otro estado.

#### 3.2.2. RUNNING

**Definición**: RUNNING es el estado de una ejecución que ha iniciado y está en progreso. Una ejecución en estado RUNNING está realizando la acción ejecutable solicitada dentro de los límites estructurales definidos en la FASE 4.1.

**Características**:
- Una ejecución en RUNNING está activamente realizando la acción ejecutable
- Una ejecución en RUNNING puede transicionar a COMPLETED si finaliza exitosamente
- Una ejecución en RUNNING puede transicionar a FAILED si ocurre un error o fallo
- Una ejecución en RUNNING puede transicionar a SUSPENDED si se suspende temporalmente
- Una ejecución en RUNNING puede transicionar a CANCELLED si se cancela durante la ejecución
- Una ejecución en RUNNING puede transicionar a TERMINATED si el sistema se apaga durante la ejecución

**Regla explícita**: Una ejecución en RUNNING está bajo control del sistema en todo momento y puede ser detenida, suspendida o cancelada en cualquier momento.

#### 3.2.3. SUSPENDED

**Definición**: SUSPENDED es el estado de una ejecución que ha sido suspendida temporalmente. Una ejecución en estado SUSPENDED no está realizando la acción ejecutable, pero puede ser reanudada posteriormente.

**Características**:
- Una ejecución en SUSPENDED no está realizando ninguna acción ejecutable
- Una ejecución en SUSPENDED puede transicionar a RUNNING si se reanuda
- Una ejecución en SUSPENDED puede transicionar a CANCELLED si se cancela durante la suspensión
- Una ejecución en SUSPENDED puede transicionar a TERMINATED si el sistema se apaga durante la suspensión
- Una ejecución en SUSPENDED no puede transicionar directamente a COMPLETED ni FAILED sin pasar por RUNNING

**Regla explícita**: Una ejecución en SUSPENDED puede ser reanudada, cancelada o terminada, pero no puede finalizar sin reanudarse primero.

#### 3.2.4. COMPLETED

**Definición**: COMPLETED es un estado terminal que indica que una ejecución ha finalizado exitosamente. Una ejecución en estado COMPLETED ha completado la acción ejecutable según lo esperado.

**Características**:
- COMPLETED es un estado terminal. Una ejecución en COMPLETED no puede transicionar a ningún otro estado
- Una ejecución en COMPLETED indica que la acción ejecutable se realizó exitosamente
- Una ejecución solo puede alcanzar COMPLETED desde RUNNING
- Una ejecución en COMPLETED no puede ser reanudada, cancelada ni modificada

**Regla explícita**: COMPLETED es un estado terminal. Una ejecución en COMPLETED permanece en ese estado permanentemente.

#### 3.2.5. CANCELLED

**Definición**: CANCELLED es un estado terminal que indica que una ejecución ha sido cancelada antes de completarse. Una ejecución en estado CANCELLED no completó la acción ejecutable debido a cancelación explícita o cambio en condiciones previas.

**Características**:
- CANCELLED es un estado terminal. Una ejecución en CANCELLED no puede transicionar a ningún otro estado
- Una ejecución puede alcanzar CANCELLED desde PENDING, RUNNING o SUSPENDED
- Una ejecución en CANCELLED indica que la acción ejecutable no se completó debido a cancelación
- Una ejecución en CANCELLED no puede ser reanudada ni modificada

**Regla explícita**: CANCELLED es un estado terminal. Una ejecución en CANCELLED permanece en ese estado permanentemente.

#### 3.2.6. FAILED

**Definición**: FAILED es un estado terminal que indica que una ejecución ha finalizado de forma no exitosa debido a un error, fallo o condición no prevista. Una ejecución en estado FAILED no completó la acción ejecutable debido a un fallo durante la ejecución.

**Características**:
- FAILED es un estado terminal. Una ejecución en FAILED no puede transicionar a ningún otro estado
- Una ejecución solo puede alcanzar FAILED desde RUNNING
- Una ejecución en FAILED indica que la acción ejecutable falló durante la ejecución
- Una ejecución en FAILED no puede ser reanudada ni modificada

**Regla explícita**: FAILED es un estado terminal. Una ejecución en FAILED permanece en ese estado permanentemente.

#### 3.2.7. TERMINATED

**Definición**: TERMINATED es un estado terminal que indica que una ejecución ha sido terminada forzadamente debido a apagado del sistema o activación del kill-switch. Una ejecución en estado TERMINATED no completó la acción ejecutable debido a terminación forzada por apagado.

**Características**:
- TERMINATED es un estado terminal. Una ejecución en TERMINATED no puede transicionar a ningún otro estado
- Una ejecución puede alcanzar TERMINATED desde PENDING, RUNNING o SUSPENDED
- Una ejecución en TERMINATED indica que la acción ejecutable fue terminada forzadamente por apagado
- Una ejecución en TERMINATED no puede ser reanudada ni modificada

**Regla explícita**: TERMINATED es un estado terminal. Una ejecución en TERMINATED permanece en ese estado permanentemente. El estado TERMINATED garantiza que el sistema puede apagarse en cualquier momento sin dejar ejecuciones en estados inconsistentes.

### 3.3. Identificación de Estado Inicial

**Estado inicial canónico**: PENDING

Toda ejecución inicia en estado PENDING. No existe ejecución que inicie en otro estado. El estado PENDING es el único estado inicial permitido.

**Regla explícita**: Toda ejecución inicia en estado PENDING. No existe excepción a esta regla.

---

## 4. Estados Terminales

### 4.1. Definición

Un **estado terminal** es un estado desde el cual una ejecución no puede transicionar a ningún otro estado. Una ejecución que alcanza un estado terminal permanece en ese estado permanentemente.

### 4.2. Estados Terminales Permitidos

El modelo de estados define los siguientes estados terminales:

1. **COMPLETED**: La ejecución finalizó exitosamente
2. **CANCELLED**: La ejecución fue cancelada antes de completarse
3. **FAILED**: La ejecución falló durante la ejecución
4. **TERMINATED**: La ejecución fue terminada forzadamente por apagado

**Regla explícita**: Estos cuatro estados son los únicos estados terminales permitidos. No existen otros estados terminales.

### 4.3. Estados Terminales Prohibidos

Cualquier estado que no sea COMPLETED, CANCELLED, FAILED o TERMINATED está prohibido como estado terminal.

Específicamente, los siguientes estados están prohibidos como terminales:

- **PENDING**: Una ejecución no puede permanecer permanentemente en PENDING. Debe transicionar a otro estado.
- **RUNNING**: Una ejecución no puede permanecer permanentemente en RUNNING. Debe transicionar a un estado terminal.
- **SUSPENDED**: Una ejecución no puede permanecer permanentemente en SUSPENDED. Debe transicionar a otro estado.

**Regla explícita**: PENDING, RUNNING y SUSPENDED están prohibidos como estados terminales. Toda ejecución debe eventualmente alcanzar uno de los estados terminales permitidos.

---

## 5. Transiciones Permitidas

### 5.1. Reglas Generales de Transición

Las transiciones entre estados están gobernadas por las siguientes reglas generales:

1. **Transiciones explícitas**: Solo las transiciones explícitamente definidas en este modelo están permitidas. No existen transiciones implícitas ni transiciones derivadas.

2. **Unicidad de estado**: En cualquier momento, una ejecución está exactamente en un estado. No existen estados múltiples simultáneos.

3. **Irreversibilidad de estados terminales**: Una vez que una ejecución alcanza un estado terminal, no puede transicionar a ningún otro estado. Los estados terminales son permanentes.

4. **Control del sistema**: Todas las transiciones están bajo control del sistema. El sistema determina cuándo y cómo ocurren las transiciones.

5. **Apagabilidad**: El sistema puede transicionar cualquier ejecución a TERMINATED en cualquier momento, incluso si la transición no está explícitamente listada en las transiciones normales.

**Regla explícita**: Solo las transiciones explícitamente definidas en este modelo están permitidas, con la excepción de la transición a TERMINATED desde cualquier estado, que está siempre permitida para garantizar apagabilidad.

### 5.2. Transiciones Válidas entre Estados

#### 5.2.1. Transiciones desde PENDING

Una ejecución en estado PENDING puede transicionar a:

- **RUNNING**: Si se cumplen todas las condiciones previas y la ejecución inicia
- **CANCELLED**: Si se cancela antes de iniciar
- **TERMINATED**: Si el sistema se apaga antes de iniciar

**Regla explícita**: Una ejecución en PENDING solo puede transicionar a RUNNING, CANCELLED o TERMINATED. No puede transicionar directamente a COMPLETED, FAILED ni SUSPENDED.

#### 5.2.2. Transiciones desde RUNNING

Una ejecución en estado RUNNING puede transicionar a:

- **COMPLETED**: Si la ejecución finaliza exitosamente
- **FAILED**: Si ocurre un error, fallo o condición no prevista
- **SUSPENDED**: Si se suspende temporalmente
- **CANCELLED**: Si se cancela durante la ejecución
- **TERMINATED**: Si el sistema se apaga durante la ejecución

**Regla explícita**: Una ejecución en RUNNING puede transicionar a cualquier estado terminal o a SUSPENDED. No puede transicionar a PENDING.

#### 5.2.3. Transiciones desde SUSPENDED

Una ejecución en estado SUSPENDED puede transicionar a:

- **RUNNING**: Si se reanuda la ejecución
- **CANCELLED**: Si se cancela durante la suspensión
- **TERMINATED**: Si el sistema se apaga durante la suspensión

**Regla explícita**: Una ejecución en SUSPENDED solo puede transicionar a RUNNING, CANCELLED o TERMINATED. No puede transicionar directamente a COMPLETED ni FAILED sin pasar por RUNNING.

#### 5.2.4. Transiciones desde Estados Terminales

Una ejecución en cualquier estado terminal (COMPLETED, CANCELLED, FAILED, TERMINATED) no puede transicionar a ningún otro estado.

**Regla explícita**: Los estados terminales son permanentes. No existen transiciones desde estados terminales.

---

## 6. Transiciones Prohibidas

### 6.1. Qué No Puede Ocurrir

Las siguientes transiciones están explícitamente prohibidas:

1. **Desde estados terminales a cualquier otro estado**: Una ejecución en COMPLETED, CANCELLED, FAILED o TERMINATED no puede transicionar a ningún otro estado.

2. **Desde PENDING directamente a estados terminales de finalización**: Una ejecución en PENDING no puede transicionar directamente a COMPLETED ni FAILED sin pasar por RUNNING.

3. **Desde SUSPENDED directamente a estados terminales de finalización**: Una ejecución en SUSPENDED no puede transicionar directamente a COMPLETED ni FAILED sin pasar por RUNNING.

4. **Desde RUNNING a PENDING**: Una ejecución en RUNNING no puede retroceder a PENDING.

5. **Desde COMPLETED, FAILED, CANCELLED o TERMINATED a cualquier estado**: Una ejecución en cualquier estado terminal no puede transicionar a ningún otro estado.

6. **Transiciones que omiten estados requeridos**: Cualquier transición que omita estados requeridos en el ciclo de vida está prohibida.

**Regla explícita**: Las transiciones prohibidas están explícitamente definidas. Cualquier transición no explícitamente permitida está prohibida.

### 6.2. Justificación Conceptual

Las transiciones están prohibidas por las siguientes razones conceptuales:

1. **Irreversibilidad de estados terminales**: Los estados terminales representan finalización definitiva del ciclo de vida de una ejecución. Permitir transiciones desde estados terminales comprometería la integridad del modelo y la trazabilidad del ciclo de vida.

2. **Integridad del ciclo de vida**: Las ejecuciones deben seguir un ciclo de vida coherente. Permitir transiciones que omitan estados requeridos (como transicionar de PENDING directamente a COMPLETED) comprometería la integridad del ciclo de vida y la capacidad de trazabilidad.

3. **Control y apagabilidad**: Las transiciones prohibidas están diseñadas para garantizar que el sistema mantenga control sobre el ciclo de vida de las ejecuciones y pueda garantizar apagabilidad en cualquier momento.

4. **No ambigüedad**: Las transiciones prohibidas eliminan ambigüedad sobre el estado y el ciclo de vida de las ejecuciones, garantizando que el estado de una ejecución sea siempre determinable de forma no ambigua.

**Regla explícita**: Las transiciones prohibidas están justificadas conceptualmente por la necesidad de garantizar integridad del ciclo de vida, control, apagabilidad y no ambigüedad.

---

## 7. Comportamiento ante Cancelación y Apagado

### 7.1. Comportamiento ante Cancelación

Cuando una ejecución es cancelada:

1. **Desde PENDING**: La ejecución transiciona a CANCELLED. No se realiza ninguna acción ejecutable. El sistema garantiza que no se producen efectos de la ejecución.

2. **Desde RUNNING**: La ejecución transiciona a CANCELLED. El sistema detiene la acción ejecutable en progreso de forma controlada. El sistema garantiza que se minimizan los efectos parciales de la ejecución, pero no garantiza que no existan efectos parciales.

3. **Desde SUSPENDED**: La ejecución transiciona a CANCELLED. No se realiza ninguna acción ejecutable adicional. El sistema garantiza que no se producen efectos adicionales de la ejecución.

**Regla explícita**: La cancelación de una ejecución siempre resulta en transición a CANCELLED. El sistema garantiza que no se inician nuevas acciones ejecutables después de la cancelación, pero no garantiza que no existan efectos parciales de acciones ejecutables ya iniciadas.

### 7.2. Comportamiento ante Apagado

Cuando el sistema se apaga o se activa el kill-switch:

1. **Ejecuciones en PENDING**: Todas las ejecuciones en PENDING transicionan a TERMINATED. No se inician nuevas ejecuciones. El sistema garantiza que no se producen efectos de ejecuciones que estaban en PENDING.

2. **Ejecuciones en RUNNING**: Todas las ejecuciones en RUNNING transicionan a TERMINATED. El sistema detiene todas las acciones ejecutables en progreso de forma controlada. El sistema garantiza que se minimizan los efectos parciales de las ejecuciones, pero no garantiza que no existan efectos parciales.

3. **Ejecuciones en SUSPENDED**: Todas las ejecuciones en SUSPENDED transicionan a TERMINATED. No se reanudan ejecuciones suspendidas. El sistema garantiza que no se producen efectos adicionales de ejecuciones que estaban en SUSPENDED.

4. **Ejecuciones en estados terminales**: Las ejecuciones en estados terminales permanecen en su estado terminal. No se modifican.

**Regla explícita**: El apagado del sistema resulta en transición a TERMINATED de todas las ejecuciones que no están en estados terminales. El sistema garantiza que no se inician nuevas ejecuciones y que se detienen todas las ejecuciones en progreso, pero no garantiza que no existan efectos parciales de ejecuciones que estaban en RUNNING.

### 7.3. Garantías del Sistema

El sistema garantiza lo siguiente ante cancelación y apagado:

1. **Transición garantizada**: El sistema garantiza que todas las ejecuciones afectadas por cancelación o apagado transicionan a un estado terminal (CANCELLED o TERMINATED) de forma controlada.

2. **No inicio de nuevas acciones**: El sistema garantiza que no se inician nuevas acciones ejecutables después de cancelación o apagado.

3. **Detención controlada**: El sistema garantiza que las acciones ejecutables en progreso se detienen de forma controlada, aunque no garantiza que no existan efectos parciales.

4. **Estados consistentes**: El sistema garantiza que todas las ejecuciones afectadas alcanzan estados terminales consistentes, sin dejar ejecuciones en estados inconsistentes o no determinables.

5. **Apagabilidad inmediata**: El sistema garantiza que responde inmediatamente a señales de apagado, sin esperar completitud de ejecuciones en curso.

**Regla explícita**: El sistema garantiza transición controlada a estados terminales, no inicio de nuevas acciones, detención controlada, estados consistentes y apagabilidad inmediata. El sistema no garantiza ausencia de efectos parciales de ejecuciones que estaban en RUNNING.

---

## 8. Alineación con el Principio de Apagabilidad

### 8.1. Cómo el Modelo Asegura Interrupción Segura

El modelo de estados asegura interrupción segura mediante los siguientes mecanismos:

1. **Estado TERMINATED siempre accesible**: El modelo garantiza que cualquier ejecución puede transicionar a TERMINATED desde cualquier estado no terminal (PENDING, RUNNING, SUSPENDED) en cualquier momento. Esta transición está siempre permitida, incluso si no está explícitamente listada en las transiciones normales.

2. **Estados terminales explícitos**: El modelo define estados terminales explícitos (COMPLETED, CANCELLED, FAILED, TERMINATED) que garantizan que toda ejecución eventualmente alcanza un estado terminal, eliminando la posibilidad de ejecuciones que permanezcan indefinidamente en estados no terminales.

3. **Transiciones controladas**: El modelo garantiza que todas las transiciones están bajo control del sistema, permitiendo que el sistema determine cuándo y cómo transicionar ejecuciones a estados terminales, incluso durante ejecuciones en progreso.

4. **No ambigüedad de estado**: El modelo garantiza que el estado de una ejecución es siempre determinable de forma no ambigua, permitiendo que el sistema determine el estado de cualquier ejecución en cualquier momento para poder transicionarla a un estado terminal.

5. **Comportamiento explícito ante apagado**: El modelo define explícitamente el comportamiento ante apagado, garantizando que todas las ejecuciones afectadas transicionan a TERMINATED de forma controlada.

**Regla explícita**: El modelo de estados garantiza que el sistema puede interrumpir cualquier ejecución de forma segura en cualquier momento, transicionándola a un estado terminal (específicamente TERMINATED) sin dejar estados inconsistentes.

### 8.2. Prioridad de Apagabilidad

El principio de apagabilidad tiene prioridad absoluta sobre cualquier optimización, conveniencia o intento de completitud de ejecuciones. El modelo de estados refleja esta prioridad mediante:

1. **Transición a TERMINATED siempre permitida**: La transición a TERMINATED desde cualquier estado no terminal está siempre permitida, incluso durante ejecuciones en progreso, sin excepción.

2. **Apagabilidad inmediata**: El modelo garantiza que el sistema puede responder inmediatamente a señales de apagado, sin esperar completitud de ejecuciones en curso.

3. **Estados terminales prioritarios**: Los estados terminales (especialmente TERMINATED) tienen prioridad sobre estados no terminales. El sistema puede transicionar ejecuciones a estados terminales en cualquier momento, incluso si esto resulta en ejecuciones incompletas.

**Regla explícita**: La apagabilidad tiene prioridad absoluta sobre la completitud de ejecuciones. El sistema puede terminar cualquier ejecución en cualquier momento para garantizar apagabilidad, incluso si esto resulta en ejecuciones incompletas.

---

## 9. Cierre Canónico de la Fase

### 9.1. Declaración Explícita de Cierre

La FASE 4.2 queda conceptualmente cerrada y establece el modelo canónico de estados de ejecución para el BLOQUE 4.

El modelo de estados definido por esta fase gobierna el ciclo de vida de todas las ejecuciones del BLOQUE 4. Establece qué estados existen, cómo se relacionan entre sí, qué transiciones son permitidas y cuáles están prohibidas, y cómo el sistema garantiza control y apagabilidad mediante la gestión explícita de estados.

El modelo de estados es definitivo para determinar el estado de una ejecución en cualquier momento y cómo puede transicionar entre estados. No hay mecanismo de apelación, bypass ni omisión de este modelo.

**Regla explícita**: El modelo de estados es canónico e inmodificable. Una vez aprobado, no admite reinterpretaciones ni extensiones.

### 9.2. Preparación para FASE 4.3

La FASE 4.2 establece el modelo de estados necesario para la FASE 4.3. La FASE 4.3 utilizará este modelo de estados para definir cómo se gestionan y procesan las transiciones entre estados, cómo se implementan los mecanismos de control y apagabilidad, y cómo se garantiza la trazabilidad del ciclo de vida de las ejecuciones.

La FASE 4.2 no anticipa ni desarrolla la FASE 4.3. Solo establece el modelo de estados que la FASE 4.3 utilizará como base.

**Regla explícita**: La FASE 4.2 establece el modelo de estados. La FASE 4.3 utilizará este modelo para definir la gestión y procesamiento de estados. No existe anticipación ni desarrollo de la FASE 4.3 en este documento.

---

## 10. Criterios de Cierre de la FASE 4.2

### 10.1. Criterios de Cierre

La FASE 4.2 se considera cerrada cuando:

1. **Modelo de estados definido**: El modelo conceptual de estados está completamente definido con todos los estados, descripciones normativas y estado inicial establecido.

2. **Estados terminales establecidos**: Los estados terminales permitidos y prohibidos están explícitamente definidos y documentados.

3. **Transiciones permitidas definidas**: Las transiciones permitidas entre estados están completamente definidas y documentadas.

4. **Transiciones prohibidas definidas**: Las transiciones prohibidas están explícitamente definidas y justificadas conceptualmente.

5. **Comportamiento ante cancelación y apagado establecido**: El comportamiento del sistema ante cancelación y apagado está explícitamente definido y documentado.

6. **Alineación con apagabilidad verificada**: La alineación del modelo con el principio de apagabilidad está verificada y documentada.

7. **Coherencia con FASE 4.1 verificada**: El modelo de estados es coherente con el modelo de ejecución de la FASE 4.1.

### 10.2. Condiciones para Avance a Fase Siguiente

La FASE 4.2 habilita el avance a la siguiente fase del BLOQUE 4 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre están satisfechos.

2. **Modelo de estados operativo**: El modelo de estados está operativo y puede gobernar el ciclo de vida de las ejecuciones del BLOQUE 4.

3. **Garantías de apagabilidad verificadas**: Las garantías de apagabilidad están verificadas y funcionando según lo documentado.

**Regla explícita**: El avance a la siguiente fase requiere cumplimiento explícito de todos los criterios de cierre. No existe avance automático ni implícito.

---

**Fin del documento**

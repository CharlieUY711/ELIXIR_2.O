# FASE 5.1 — Marco Canónico de Eventos Observables

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada  
**Fase**: FASE 5.1 — Marco Canónico de Eventos Observables  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 5.1

### 1.1. Función Exacta del Marco de Eventos Observables

La FASE 5.1 define el marco canónico de eventos observables en Elixir Platform. Establece qué es un "evento observable" en el sistema, qué eventos están permitidos, qué eventos están prohibidos, y cómo los eventos se alinean exclusivamente con estados y transiciones del BLOQUE 4 sin introducir nueva lógica de control ni decisión.

El marco de eventos observables opera como el conjunto normativo que rige toda observabilidad del BLOQUE 5. No implementa observabilidad, no procesa eventos, no almacena información. Su única responsabilidad es definir el modelo conceptual que delimita qué eventos existen, cómo se relacionan con el BLOQUE 4, y qué reglas gobiernan su observación.

### 1.2. Necesidad del Marco de Eventos Observables

El marco de eventos observables es necesario incluso cuando el BLOQUE 4 ha establecido estados y transiciones, porque:

1. **Delimitación de observabilidad**: El sistema requiere límites explícitos sobre qué puede observarse y qué no puede observarse. El marco de eventos observables establece estos límites de forma canónica e inmodificable.

2. **Alineación con BLOQUE 4**: El sistema requiere que la observabilidad se alinee exclusivamente con estados y transiciones del BLOQUE 4, sin introducir nuevos estados ni transiciones. El marco de eventos observables garantiza esta alineación.

3. **Preservación de apagabilidad**: El sistema requiere que la observabilidad preserve la apagabilidad total del sistema. El marco de eventos observables garantiza que los eventos no comprometan la capacidad de apagado.

4. **Cumplimiento de D0**: El sistema requiere que la observabilidad respete la política D0 (Elixir NO es custodio de datos). El marco de eventos observables garantiza que los eventos no contengan datos personales ni payloads.

5. **Prevención de inferencias de decisión**: El sistema requiere que la observabilidad no permita inferir razones de decisiones ni lógica de control. El marco de eventos observables garantiza que los eventos no habiliten estas inferencias.

6. **Separación de responsabilidades**: El sistema requiere separación clara entre observabilidad (BLOQUE 5) y control (BLOQUES 1-4). El marco de eventos observables establece esta separación de forma explícita.

### 1.3. Riesgos que Mitiga

El marco de eventos observables mitiga los siguientes riesgos:

1. **Riesgo de observabilidad no delimitada**: Sin límites explícitos, el sistema podría observar información que comprometa privacidad, seguridad o cumplimiento normativo.

2. **Riesgo de introducción de nuevos estados**: Sin alineación explícita con BLOQUE 4, la observabilidad podría introducir nuevos estados o transiciones que comprometan la integridad del modelo.

3. **Riesgo de compromiso de apagabilidad**: Sin preservación explícita de apagabilidad, los eventos podrían comprometer la capacidad de apagado del sistema.

4. **Riesgo de violación de D0**: Sin cumplimiento explícito de D0, los eventos podrían contener datos personales o payloads que comprometan la política de no custodia.

5. **Riesgo de inferencias de decisión**: Sin prevención explícita, los eventos podrían permitir inferir razones de decisiones o lógica de control.

6. **Riesgo de mezcla de responsabilidades**: Sin separación explícita, la observabilidad podría mezclarse con control o decisión, comprometiendo la arquitectura del sistema.

---

## 2. Contexto Normativo

### 2.1. Principios Fundamentales

Este documento define el marco lógico canónico de eventos observables en Elixir Platform. El marco es:

- **Declarativo**: Define qué eventos existen y qué no existen, no cómo se implementan
- **Normativo**: Establece reglas obligatorias que toda observabilidad debe respetar
- **Canónico**: Es la única fuente de verdad para el marco de eventos observables
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones
- **Alineado**: Se alinea exclusivamente con estados y transiciones del BLOQUE 4
- **Apagable**: Garantiza que la observabilidad respeta el principio de apagabilidad total

### 2.2. Relación con Bloques Previos

Este documento se basa en:

- **BLOQUE 1**: Modelo de identidad y estados que establece qué usuarios existen y en qué estados pueden estar
- **BLOQUE 2**: Modelo de decisiones (ALLOW/DENY/HOLD) que establece si una solicitud puede proceder
- **BLOQUE 3**: Modelo de habilitación (ENABLED/DISABLED/SUSPENDED) que establece qué operaciones están habilitadas
- **BLOQUE 4**: Modelo de ejecución y estados que establece qué ejecuciones existen, en qué estados pueden estar, y qué transiciones son permitidas

La FASE 5.1 extiende estos modelos agregando el marco de eventos observables, sin modificar ni reinterpretar los modelos base ni invalidar las fases anteriores.

### 2.3. Invariantes Globales

El marco de eventos observables respeta los mismos invariantes fundamentales definidos en bloques anteriores:

1. **D0 (Elixir no custodia datos)**: Los eventos no contienen datos personales, payloads ni información que comprometa la política de no custodia
2. **Default Deny**: La observabilidad no expone información por defecto. Solo eventos explícitamente permitidos son observables
3. **Apagabilidad**: La observabilidad puede ser desactivada completamente sin comprometer la apagabilidad del sistema
4. **Fail-closed**: Ante cualquier error, ambigüedad o condición no prevista en la observabilidad, el sistema no expone información adicional

### 2.4. Restricciones Inmutables

Esta fase opera bajo las siguientes restricciones inmutables:

- **Elixir Core está SELLADO e INMODIFICABLE**: El marco de eventos observables no puede modificar, extender ni reinterpretar Elixir Core
- **WAM existe solo como transporte**: El marco de eventos observables no puede modificar, extender ni reinterpretar WAM
- **Política D0 cerrada**: El marco de eventos observables debe cumplir estrictamente con la política D0
- **BLOQUES 1 a 4 están COMPLETAMENTE CERRADOS**: El marco de eventos observables no puede modificar, extender ni reinterpretar los BLOQUES 1 a 4
- **BLOQUE 5 solo OBSERVA**: El BLOQUE 5 no decide, no controla, no modifica. Solo observa

---

## 3. Definición de Evento Observable

### 3.1. Qué es un Evento Observable

Un **Evento Observable** en Elixir Platform es una señal temporal, inmutable y no decisional que registra la ocurrencia de un cambio de estado o transición en el BLOQUE 4, sin contener payloads, datos personales ni información que permita inferir razones de decisión o lógica de control.

Un evento observable es:

1. **Temporal**: Ocurre en un momento específico y no persiste más allá de su registro
2. **Inmutable**: Una vez registrado, no puede modificarse ni eliminarse
3. **No decisional**: No participa en decisiones, no influye en control, no modifica comportamiento
4. **Alineado con BLOQUE 4**: Se alinea exclusivamente con estados y transiciones definidos en el BLOQUE 4
5. **Sin payloads**: No contiene datos de request, datos de response, ni información de contenido
6. **Sin datos personales**: No contiene información que identifique usuarios, modelos ni entidades específicas
7. **Sin inferencias de decisión**: No contiene información que permita inferir razones de decisiones ni lógica de control
8. **Apagable**: Puede ser desactivado completamente sin comprometer la apagabilidad del sistema

**Regla explícita**: Un evento observable es una señal temporal, inmutable y no decisional que registra cambios de estado o transiciones del BLOQUE 4, sin contener información que comprometa privacidad, seguridad o cumplimiento normativo.

### 3.2. Qué NO es un Evento Observable

Las siguientes señales **NO** constituyen eventos observables en el sentido del marco:

- ❌ **Eventos de decisión**: Señales que registran razones de decisiones (BLOQUE 2) no son eventos observables
- ❌ **Eventos de habilitación**: Señales que registran razones de habilitación (BLOQUE 3) no son eventos observables
- ❌ **Eventos de identidad**: Señales que registran cambios de identidad (BLOQUE 1) no son eventos observables
- ❌ **Eventos con payloads**: Señales que contienen datos de request, response o contenido no son eventos observables
- ❌ **Eventos con datos personales**: Señales que contienen información que identifica usuarios, modelos o entidades específicas no son eventos observables
- ❌ **Eventos que habilitan inferencias**: Señales que permiten inferir razones de decisiones o lógica de control no son eventos observables
- ❌ **Eventos de infraestructura**: Señales de infraestructura técnica (red, almacenamiento, etc.) no son eventos observables del BLOQUE 5
- ❌ **Eventos de métricas agregadas**: Señales de métricas agregadas no son eventos observables (aunque pueden derivarse de eventos observables)

**Regla explícita**: Solo las señales que registran cambios de estado o transiciones del BLOQUE 4, sin contener payloads, datos personales ni información que permita inferir razones de decisión, constituyen eventos observables. Todas las demás señales están fuera del alcance del marco de eventos observables.

### 3.3. Características Obligatorias de un Evento Observable

Todo evento observable debe cumplir simultáneamente todas las siguientes características:

1. **Identificador canónico**: Tiene un identificador canónico único que lo distingue de otros eventos
2. **Timestamp**: Tiene un timestamp que indica cuándo ocurrió el evento
3. **TraceId**: Tiene un traceId que permite correlacionar eventos relacionados (opcional pero recomendado)
4. **Tipo de evento**: Tiene un tipo de evento que identifica la categoría del evento
5. **Estado o transición referenciada**: Hace referencia a un estado o transición del BLOQUE 4
6. **Sin payloads**: No contiene datos de request, response ni contenido
7. **Sin datos personales**: No contiene información que identifique usuarios, modelos ni entidades específicas
8. **Sin inferencias de decisión**: No contiene información que permita inferir razones de decisiones ni lógica de control

**Regla explícita**: Todo evento observable debe cumplir simultáneamente todas las características obligatorias. Cualquier evento que no cumpla todas las características está prohibido.

---

## 4. Tipos de Eventos Observables Permitidos

### 4.1. Principio de Alineación con BLOQUE 4

Los eventos observables se alinean exclusivamente con estados y transiciones definidos en el BLOQUE 4. No existen eventos observables que no correspondan a estados o transiciones del BLOQUE 4.

**Regla explícita**: Todo evento observable debe corresponder a un estado o transición del BLOQUE 4. No existen eventos observables que no correspondan al BLOQUE 4.

### 4.2. Eventos de Estado

Los eventos de estado registran que una ejecución alcanzó un estado específico del BLOQUE 4. Los siguientes eventos de estado están permitidos:

1. **EXECUTION_PENDING**: Una ejecución alcanzó el estado PENDING
2. **EXECUTION_RUNNING**: Una ejecución alcanzó el estado RUNNING
3. **EXECUTION_SUSPENDED**: Una ejecución alcanzó el estado SUSPENDED
4. **EXECUTION_COMPLETED**: Una ejecución alcanzó el estado COMPLETED
5. **EXECUTION_CANCELLED**: Una ejecución alcanzó el estado CANCELLED
6. **EXECUTION_FAILED**: Una ejecución alcanzó el estado FAILED
7. **EXECUTION_TERMINATED**: Una ejecución alcanzó el estado TERMINATED

**Regla explícita**: Estos siete eventos de estado son los únicos eventos de estado permitidos. No existen otros eventos de estado.

### 4.3. Eventos de Transición

Los eventos de transición registran que una ejecución transicionó de un estado a otro estado del BLOQUE 4. Los siguientes eventos de transición están permitidos:

1. **EXECUTION_TRANSITION_PENDING_TO_RUNNING**: Una ejecución transicionó de PENDING a RUNNING
2. **EXECUTION_TRANSITION_PENDING_TO_CANCELLED**: Una ejecución transicionó de PENDING a CANCELLED
3. **EXECUTION_TRANSITION_PENDING_TO_TERMINATED**: Una ejecución transicionó de PENDING a TERMINATED
4. **EXECUTION_TRANSITION_RUNNING_TO_COMPLETED**: Una ejecución transicionó de RUNNING a COMPLETED
5. **EXECUTION_TRANSITION_RUNNING_TO_FAILED**: Una ejecución transicionó de RUNNING a FAILED
6. **EXECUTION_TRANSITION_RUNNING_TO_SUSPENDED**: Una ejecución transicionó de RUNNING a SUSPENDED
7. **EXECUTION_TRANSITION_RUNNING_TO_CANCELLED**: Una ejecución transicionó de RUNNING a CANCELLED
8. **EXECUTION_TRANSITION_RUNNING_TO_TERMINATED**: Una ejecución transicionó de RUNNING a TERMINATED
9. **EXECUTION_TRANSITION_SUSPENDED_TO_RUNNING**: Una ejecución transicionó de SUSPENDED a RUNNING
10. **EXECUTION_TRANSITION_SUSPENDED_TO_CANCELLED**: Una ejecución transicionó de SUSPENDED a CANCELLED
11. **EXECUTION_TRANSITION_SUSPENDED_TO_TERMINATED**: Una ejecución transicionó de SUSPENDED a TERMINATED

**Regla explícita**: Estos once eventos de transición son los únicos eventos de transición permitidos. No existen otros eventos de transición. Los eventos de transición corresponden exclusivamente a transiciones permitidas definidas en el BLOQUE 4.

### 4.4. Eventos de Apagabilidad

Los eventos de apagabilidad registran que el sistema ejerció su capacidad de apagado. Los siguientes eventos de apagabilidad están permitidos:

1. **SYSTEM_SHUTDOWN_INITIATED**: El sistema inició un apagado controlado
2. **SYSTEM_SHUTDOWN_COMPLETED**: El sistema completó un apagado controlado
3. **KILL_SWITCH_ACTIVATED**: El kill-switch fue activado
4. **KILL_SWITCH_DEACTIVATED**: El kill-switch fue desactivado

**Regla explícita**: Estos cuatro eventos de apagabilidad son los únicos eventos de apagabilidad permitidos. No existen otros eventos de apagabilidad.

### 4.5. Lista Exhaustiva de Eventos Permitidos

La siguiente es la lista exhaustiva y completa de todos los eventos observables permitidos:

**Eventos de Estado (7 eventos)**:
- EXECUTION_PENDING
- EXECUTION_RUNNING
- EXECUTION_SUSPENDED
- EXECUTION_COMPLETED
- EXECUTION_CANCELLED
- EXECUTION_FAILED
- EXECUTION_TERMINATED

**Eventos de Transición (11 eventos)**:
- EXECUTION_TRANSITION_PENDING_TO_RUNNING
- EXECUTION_TRANSITION_PENDING_TO_CANCELLED
- EXECUTION_TRANSITION_PENDING_TO_TERMINATED
- EXECUTION_TRANSITION_RUNNING_TO_COMPLETED
- EXECUTION_TRANSITION_RUNNING_TO_FAILED
- EXECUTION_TRANSITION_RUNNING_TO_SUSPENDED
- EXECUTION_TRANSITION_RUNNING_TO_CANCELLED
- EXECUTION_TRANSITION_RUNNING_TO_TERMINATED
- EXECUTION_TRANSITION_SUSPENDED_TO_RUNNING
- EXECUTION_TRANSITION_SUSPENDED_TO_CANCELLED
- EXECUTION_TRANSITION_SUSPENDED_TO_TERMINATED

**Eventos de Apagabilidad (4 eventos)**:
- SYSTEM_SHUTDOWN_INITIATED
- SYSTEM_SHUTDOWN_COMPLETED
- KILL_SWITCH_ACTIVATED
- KILL_SWITCH_DEACTIVATED

**Total: 22 eventos observables permitidos**

**Regla explícita**: Esta lista es exhaustiva y completa. No existen otros eventos observables permitidos. Cualquier evento que no esté en esta lista está prohibido.

---

## 5. Eventos Observables Prohibidos

### 5.1. Principio de Prohibición Explícita

Cualquier evento que no esté explícitamente permitido en la lista exhaustiva de eventos permitidos está prohibido. No existen eventos observables implícitos, derivados ni no documentados.

**Regla explícita**: Solo los eventos explícitamente permitidos en la lista exhaustiva son eventos observables. Todos los demás eventos están prohibidos.

### 5.2. Categorías de Eventos Prohibidos

Las siguientes categorías de eventos están explícitamente prohibidas:

#### 5.2.1. Eventos con Payloads

Están prohibidos todos los eventos que contengan:
- Datos de request (campos, valores, parámetros)
- Datos de response (resultados, respuestas, contenido)
- Contenido de mensajes o comunicaciones
- Información de transacciones más allá de referencias abstractas
- Cualquier información que no sea estrictamente metadatos de estado o transición

**Regla explícita**: Los eventos observables no pueden contener payloads. Cualquier evento que contenga payloads está prohibido.

#### 5.2.2. Eventos con Datos Personales

Están prohibidos todos los eventos que contengan:
- Identificadores de usuario (números telefónicos, nombres, etc.)
- Identificadores de modelo (números telefónicos, nombres, etc.)
- Información de contacto
- Información de perfil
- Cualquier información que permita identificar usuarios, modelos o entidades específicas

**Regla explícita**: Los eventos observables no pueden contener datos personales. Cualquier evento que contenga datos personales está prohibido.

#### 5.2.3. Eventos que Habilitan Inferencias de Decisión

Están prohibidos todos los eventos que permitan inferir:
- Razones de decisiones (por qué se tomó una decisión ALLOW o DENY)
- Lógica de control (qué reglas se evaluaron, qué condiciones se cumplieron)
- Estados internos del Core (señales de Nectar, modos de estrés, etc.)
- Información sobre evaluación de reglas
- Información sobre evaluación de habilitaciones
- Cualquier información que revele el proceso de decisión o control

**Regla explícita**: Los eventos observables no pueden habilitar inferencias de decisión. Cualquier evento que permita inferir razones de decisiones o lógica de control está prohibido.

#### 5.2.4. Eventos de Bloques Anteriores

Están prohibidos todos los eventos que correspondan a:
- Cambios de estado del BLOQUE 1 (identidad)
- Decisiones del BLOQUE 2 (ALLOW/DENY/HOLD)
- Habilitaciones del BLOQUE 3 (ENABLED/DISABLED/SUSPENDED)
- Cualquier evento que no corresponda al BLOQUE 4

**Regla explícita**: Los eventos observables solo pueden corresponder al BLOQUE 4. Cualquier evento que corresponda a otros bloques está prohibido.

#### 5.2.5. Eventos de Nuevos Estados o Transiciones

Están prohibidos todos los eventos que correspondan a:
- Estados no definidos en el BLOQUE 4
- Transiciones no permitidas en el BLOQUE 4
- Estados o transiciones que no estén explícitamente definidos en la FASE 4.2

**Regla explícita**: Los eventos observables solo pueden corresponder a estados y transiciones explícitamente definidos en el BLOQUE 4. Cualquier evento que corresponda a estados o transiciones no definidos está prohibido.

#### 5.2.6. Eventos de Infraestructura

Están prohibidos todos los eventos que correspondan a:
- Operaciones de infraestructura técnica (red, almacenamiento, etc.)
- Métricas de infraestructura
- Señales técnicas de componentes
- Cualquier evento que no corresponda a estados o transiciones del BLOQUE 4

**Regla explícita**: Los eventos observables solo pueden corresponder a estados o transiciones del BLOQUE 4. Cualquier evento de infraestructura está prohibido.

### 5.3. Lista Explícita de Eventos Prohibidos (Ejemplos)

Los siguientes son ejemplos explícitos de eventos prohibidos (la lista no es exhaustiva, cualquier evento no permitido está prohibido):

- ❌ EXECUTION_REQUEST_RECEIVED (contiene información de request)
- ❌ EXECUTION_DECISION_ALLOW (corresponde a BLOQUE 2, no BLOQUE 4)
- ❌ EXECUTION_DECISION_DENY (corresponde a BLOQUE 2, no BLOQUE 4)
- ❌ EXECUTION_HABILITATION_ENABLED (corresponde a BLOQUE 3, no BLOQUE 4)
- ❌ EXECUTION_USER_IDENTIFIED (contiene datos personales)
- ❌ EXECUTION_PAYLOAD_PROCESSED (contiene payloads)
- ❌ EXECUTION_RULE_EVALUATED (habilita inferencias de decisión)
- ❌ EXECUTION_NECTAR_SIGNAL (corresponde a estado interno del Core, no BLOQUE 4)
- ❌ EXECUTION_STRESS_MODE (corresponde a estado interno del Core, no BLOQUE 4)
- ❌ EXECUTION_NETWORK_ERROR (corresponde a infraestructura, no BLOQUE 4)
- ❌ EXECUTION_STORAGE_ACCESSED (corresponde a infraestructura, no BLOQUE 4)
- ❌ EXECUTION_STATE_UNKNOWN (corresponde a estado no definido en BLOQUE 4)

**Regla explícita**: Esta lista de ejemplos no es exhaustiva. Cualquier evento que no esté en la lista exhaustiva de eventos permitidos está prohibido, independientemente de si aparece en esta lista de ejemplos.

---

## 6. Principios Normativos del Marco de Observación

### 6.1. Principio de Alineación Exclusiva

El marco de eventos observables se alinea exclusivamente con estados y transiciones del BLOQUE 4. No introduce nuevos estados, no introduce nuevas transiciones, no modifica el modelo del BLOQUE 4.

**Regla explícita**: El marco de eventos observables solo observa estados y transiciones del BLOQUE 4. No introduce, modifica ni extiende el modelo del BLOQUE 4.

### 6.2. Principio de No Decisión

El marco de eventos observables no participa en decisiones, no influye en control, no modifica comportamiento. Solo observa y registra.

**Regla explícita**: Los eventos observables son no decisionales. No pueden influir en decisiones, control ni comportamiento del sistema.

### 6.3. Principio de Minimización de Datos

El marco de eventos observables aplica minimización estricta de datos. Solo registra información estrictamente necesaria para identificar estados y transiciones, sin contener payloads, datos personales ni información adicional.

**Regla explícita**: Los eventos observables aplican minimización estricta de datos. Solo contienen información estrictamente necesaria para identificar estados y transiciones.

### 6.4. Principio de Cumplimiento de D0

El marco de eventos observables cumple estrictamente con la política D0 (Elixir NO es custodio de datos). Los eventos no contienen datos personales, payloads ni información que comprometa la política de no custodia.

**Regla explícita**: Los eventos observables cumplen estrictamente con la política D0. No contienen datos personales, payloads ni información que comprometa la política de no custodia.

### 6.5. Principio de Prevención de Inferencias

El marco de eventos observables previene explícitamente inferencias de razones de decisiones o lógica de control. Los eventos no contienen información que permita inferir cómo o por qué se tomaron decisiones.

**Regla explícita**: Los eventos observables previenen explícitamente inferencias de razones de decisiones o lógica de control. No contienen información que permita inferir cómo o por qué se tomaron decisiones.

### 6.6. Principio de Apagabilidad Total

El marco de eventos observables preserva la apagabilidad total del sistema. La observabilidad puede ser desactivada completamente sin comprometer la capacidad de apagado del sistema.

**Regla explícita**: La observabilidad puede ser desactivada completamente sin comprometer la apagabilidad del sistema. Los eventos observables no pueden comprometer la capacidad de apagado.

### 6.7. Principio de Separación de Responsabilidades

El marco de eventos observables mantiene separación estricta entre observabilidad (BLOQUE 5) y control (BLOQUES 1-4). La observabilidad no modifica, extiende ni reinterpreta modelos de bloques anteriores.

**Regla explícita**: La observabilidad mantiene separación estricta con el control. No modifica, extiende ni reinterpreta modelos de bloques anteriores.

### 6.8. Principio de Inmutabilidad

Los eventos observables son inmutables una vez registrados. No pueden modificarse ni eliminarse después de su registro.

**Regla explícita**: Los eventos observables son inmutables una vez registrados. No pueden modificarse ni eliminarse.

### 6.9. Principio de Temporalidad

Los eventos observables son temporales. Ocurren en un momento específico y no persisten más allá de su registro. No representan estados persistentes ni capacidades permanentes.

**Regla explícita**: Los eventos observables son temporales. No representan estados persistentes ni capacidades permanentes.

### 6.10. Principio de Exhaustividad de Lista

La lista de eventos permitidos es exhaustiva y completa. No existen eventos observables implícitos, derivados ni no documentados.

**Regla explícita**: La lista de eventos permitidos es exhaustiva y completa. No existen eventos observables fuera de esta lista.

---

## 7. Límites Explícitos de Observación

### 7.1. Límites de Contenido

Los eventos observables están limitados en contenido a:

1. **Identificador canónico**: Identificador único del evento
2. **Timestamp**: Momento en que ocurrió el evento
3. **TraceId**: Identificador de traza para correlación (opcional pero recomendado)
4. **Tipo de evento**: Tipo canónico del evento (de la lista exhaustiva)
5. **Referencia a estado o transición**: Referencia al estado o transición del BLOQUE 4 que originó el evento
6. **Referencia abstracta a ejecución**: Referencia abstracta a la ejecución (sin datos personales)

**Regla explícita**: Los eventos observables solo pueden contener estos elementos. Cualquier contenido adicional está prohibido.

### 7.2. Límites de Alcance

Los eventos observables están limitados en alcance a:

1. **Solo BLOQUE 4**: Los eventos solo pueden corresponder a estados o transiciones del BLOQUE 4
2. **Solo estados y transiciones permitidos**: Los eventos solo pueden corresponder a estados y transiciones explícitamente permitidos en el BLOQUE 4
3. **Solo eventos permitidos**: Los eventos solo pueden ser de tipos explícitamente permitidos en la lista exhaustiva

**Regla explícita**: Los eventos observables están limitados exclusivamente al BLOQUE 4 y a estados y transiciones permitidos. Cualquier alcance adicional está prohibido.

### 7.3. Límites de Uso

Los eventos observables están limitados en uso a:

1. **Solo observación**: Los eventos solo pueden usarse para observación, no para control, decisión ni modificación de comportamiento
2. **Solo auditoría**: Los eventos solo pueden usarse para auditoría y cumplimiento, no para lógica de negocio
3. **Solo métricas agregadas**: Los eventos solo pueden usarse para generar métricas agregadas, no para análisis individual

**Regla explícita**: Los eventos observables solo pueden usarse para observación, auditoría y métricas agregadas. Cualquier otro uso está prohibido.

### 7.4. Límites de Persistencia

Los eventos observables están limitados en persistencia a:

1. **Sin persistencia obligatoria**: Los eventos no requieren persistencia obligatoria. Pueden ser descartados después de su registro
2. **Sin retención indefinida**: Si se persisten, los eventos no pueden tener retención indefinida. Deben tener TTL definido
3. **Sin almacenamiento de contenido**: Los eventos no pueden almacenarse con contenido adicional más allá de lo permitido

**Regla explícita**: Los eventos observables no requieren persistencia obligatoria. Si se persisten, deben tener TTL definido y no pueden almacenarse con contenido adicional.

---

## 8. Preservación de Apagabilidad

### 8.1. Cómo el Marco Asegura Apagabilidad

El marco de eventos observables asegura apagabilidad mediante:

1. **Observabilidad desactivable**: La observabilidad puede ser desactivada completamente sin comprometer la apagabilidad del sistema
2. **Eventos no bloqueantes**: Los eventos observables no bloquean operaciones del sistema. El sistema puede apagarse incluso si la observabilidad falla
3. **Sin dependencias críticas**: La observabilidad no crea dependencias críticas que comprometan la apagabilidad
4. **Fail-closed en observabilidad**: Si la observabilidad falla, el sistema continúa operando normalmente. La observabilidad no puede impedir el apagado

**Regla explícita**: El marco de eventos observables garantiza que la observabilidad puede ser desactivada completamente sin comprometer la apagabilidad del sistema.

### 8.2. Prioridad de Apagabilidad

El principio de apagabilidad tiene prioridad absoluta sobre la observabilidad. El sistema puede desactivar la observabilidad en cualquier momento para garantizar apagabilidad.

**Regla explícita**: La apagabilidad tiene prioridad absoluta sobre la observabilidad. El sistema puede desactivar la observabilidad en cualquier momento.

### 8.3. Comportamiento Ante Apagado

Cuando el sistema se apaga:

1. **Observabilidad desactivada**: La observabilidad se desactiva inmediatamente
2. **Eventos pendientes descartados**: Los eventos observables pendientes pueden ser descartados sin comprometer la apagabilidad
3. **Sin bloqueo de apagado**: La observabilidad no puede bloquear ni retrasar el apagado del sistema

**Regla explícita**: Cuando el sistema se apaga, la observabilidad se desactiva inmediatamente y no puede bloquear ni retrasar el apagado.

---

## 9. Alineación con BLOQUE 4

### 9.1. Mapeo de Estados a Eventos

Los estados del BLOQUE 4 se mapean a eventos observables de la siguiente manera:

| Estado BLOQUE 4 | Evento Observable Permitido |
|----------------|----------------------------|
| PENDING | EXECUTION_PENDING |
| RUNNING | EXECUTION_RUNNING |
| SUSPENDED | EXECUTION_SUSPENDED |
| COMPLETED | EXECUTION_COMPLETED |
| CANCELLED | EXECUTION_CANCELLED |
| FAILED | EXECUTION_FAILED |
| TERMINATED | EXECUTION_TERMINATED |

**Regla explícita**: Este mapeo es exhaustivo y completo. No existen otros mapeos de estados a eventos.

### 9.2. Mapeo de Transiciones a Eventos

Las transiciones permitidas del BLOQUE 4 se mapean a eventos observables de la siguiente manera:

| Transición BLOQUE 4 | Evento Observable Permitido |
|---------------------|----------------------------|
| PENDING → RUNNING | EXECUTION_TRANSITION_PENDING_TO_RUNNING |
| PENDING → CANCELLED | EXECUTION_TRANSITION_PENDING_TO_CANCELLED |
| PENDING → TERMINATED | EXECUTION_TRANSITION_PENDING_TO_TERMINATED |
| RUNNING → COMPLETED | EXECUTION_TRANSITION_RUNNING_TO_COMPLETED |
| RUNNING → FAILED | EXECUTION_TRANSITION_RUNNING_TO_FAILED |
| RUNNING → SUSPENDED | EXECUTION_TRANSITION_RUNNING_TO_SUSPENDED |
| RUNNING → CANCELLED | EXECUTION_TRANSITION_RUNNING_TO_CANCELLED |
| RUNNING → TERMINATED | EXECUTION_TRANSITION_RUNNING_TO_TERMINATED |
| SUSPENDED → RUNNING | EXECUTION_TRANSITION_SUSPENDED_TO_RUNNING |
| SUSPENDED → CANCELLED | EXECUTION_TRANSITION_SUSPENDED_TO_CANCELLED |
| SUSPENDED → TERMINATED | EXECUTION_TRANSITION_SUSPENDED_TO_TERMINATED |

**Regla explícita**: Este mapeo es exhaustivo y completo. No existen otros mapeos de transiciones a eventos.

### 9.3. Coherencia con FASE 4.2

El marco de eventos observables es coherente con la FASE 4.2 (Estados de Ejecución) del BLOQUE 4:

1. **Estados canónicos**: Los eventos de estado corresponden exclusivamente a estados canónicos definidos en la FASE 4.2
2. **Transiciones permitidas**: Los eventos de transición corresponden exclusivamente a transiciones permitidas definidas en la FASE 4.2
3. **Sin nuevos estados**: El marco no introduce nuevos estados que no estén definidos en la FASE 4.2
4. **Sin nuevas transiciones**: El marco no introduce nuevas transiciones que no estén permitidas en la FASE 4.2

**Regla explícita**: El marco de eventos observables es coherente con la FASE 4.2. No introduce nuevos estados ni transiciones.

---

## 10. Criterios de Cierre de la FASE 5.1

### 10.1. Criterios de Cierre

La FASE 5.1 se considera cerrada cuando:

1. **Definición formal establecida**: La definición formal de "Evento Observable" está completamente establecida y documentada
2. **Lista exhaustiva de eventos permitidos definida**: La lista exhaustiva de todos los eventos observables permitidos está completamente definida y documentada
3. **Lista explícita de eventos prohibidos definida**: La lista explícita de eventos prohibidos está completamente definida y documentada
4. **Principios normativos establecidos**: Los principios normativos del marco de observación están completamente establecidos y documentados
5. **Límites explícitos de observación establecidos**: Los límites explícitos de observación están completamente establecidos y documentados
6. **Preservación de apagabilidad verificada**: La preservación de apagabilidad total está verificada y documentada
7. **Alineación con BLOQUE 4 verificada**: La alineación exclusiva con estados y transiciones del BLOQUE 4 está verificada y documentada
8. **Cumplimiento de D0 verificado**: El cumplimiento estricto de la política D0 está verificado y documentado
9. **Prevención de inferencias verificada**: La prevención explícita de inferencias de decisión está verificada y documentada
10. **Frase canónica de cierre establecida**: La frase canónica de cierre, declarativa y no técnica, está establecida y documentada

### 10.2. Condiciones para Avance a Fase Siguiente

La FASE 5.1 habilita el avance a la siguiente fase del BLOQUE 5 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre están satisfechos
2. **Marco de eventos observables operativo**: El marco de eventos observables está operativo y puede gobernar la observabilidad del BLOQUE 5
3. **Garantías normativas verificadas**: Las garantías normativas (apagabilidad, cumplimiento de D0, prevención de inferencias) están verificadas y funcionando según lo documentado

**Regla explícita**: El avance a la siguiente fase requiere cumplimiento explícito de todos los criterios de cierre. No existe avance automático ni implícito.

---

## 11. Cierre Canónico de la Fase

### 11.1. Declaración Explícita de Cierre

La FASE 5.1 queda conceptualmente cerrada y establece el marco canónico de eventos observables para el BLOQUE 5.

El marco de eventos observables definido por esta fase gobierna toda observabilidad del BLOQUE 5. Establece qué eventos existen, cómo se relacionan con el BLOQUE 4, qué eventos están permitidos y cuáles están prohibidos, y cómo el sistema garantiza cumplimiento de D0, preservación de apagabilidad y prevención de inferencias mediante la observabilidad controlada.

El marco de eventos observables es definitivo para determinar qué eventos son observables en el BLOQUE 5 y cómo deben comportarse. No hay mecanismo de apelación, bypass ni omisión de este marco.

**Regla explícita**: El marco de eventos observables es canónico e inmodificable. Una vez aprobado, no admite reinterpretaciones ni extensiones.

### 11.2. Preparación para Fases Siguientes

La FASE 5.1 establece el marco de eventos observables necesario para fases siguientes del BLOQUE 5. Las fases siguientes utilizarán este marco para definir cómo se implementan, procesan y almacenan los eventos observables, cómo se generan métricas agregadas, y cómo se garantiza la auditoría controlada.

La FASE 5.1 no anticipa ni desarrolla las fases siguientes. Solo establece el marco de eventos observables que las fases siguientes utilizarán como base.

**Regla explícita**: La FASE 5.1 establece el marco de eventos observables. Las fases siguientes utilizarán este marco para definir la implementación y procesamiento de eventos. No existe anticipación ni desarrollo de fases siguientes en este documento.

---

## 12. Frase Canónica de Cierre

**El BLOQUE 5 observa estados y transiciones del BLOQUE 4 mediante eventos temporales, inmutables y no decisionales que no contienen payloads, datos personales ni información que permita inferir razones de decisiones. La observabilidad preserva la apagabilidad total del sistema y cumple estrictamente con la política D0. El marco de eventos observables es canónico, exhaustivo e inmodificable.**

---

**Fin del documento**


# FASE 5.4 — Marco Canónico de Trazabilidad y Correlación Determinística

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada  
**Fase**: FASE 5.4 — Marco Canónico de Trazabilidad y Correlación Determinística  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 5.4

### 1.1. Función Exacta del Marco de Trazabilidad y Correlación

La FASE 5.4 define el marco canónico de trazabilidad determinística y correlación válida entre decisiones, habilitaciones, ejecuciones, eventos y evidencia en Elixir Platform. Establece qué significa "trazabilidad determinística" en Elixir, qué entidades conceptuales son trazables, qué relaciones de correlación son válidas, y qué invariantes obligatorios rigen la trazabilidad.

El marco de trazabilidad y correlación opera como el conjunto normativo que rige toda correlación entre entidades del sistema. No implementa mecanismos de linking, no define estructuras técnicas de correlación, no introduce identificadores sistémicos nuevos. Su única responsabilidad es definir el modelo conceptual que delimita qué entidades pueden correlacionarse, cómo pueden correlacionarse, y qué reglas estrictas gobiernan estas correlaciones.

### 1.2. Necesidad del Marco de Trazabilidad y Correlación

El marco de trazabilidad y correlación es necesario incluso cuando las FASES 5.1, 5.2 y 5.3 han establecido eventos observables, evidencia mínima y registro pasivo, porque:

1. **Delimitación de correlación válida**: El sistema requiere límites explícitos sobre qué entidades pueden correlacionarse y cuáles no. El marco establece estos límites de forma canónica e inmodificable.

2. **Prevención de inferencias de intención**: El sistema requiere reglas estrictas que prevengan inferencias de intención, razones de decisión o lógica de control mediante correlación. El marco garantiza que la correlación no habilite estas inferencias.

3. **Prevención de reconstrucción de flujos decisionales**: El sistema requiere que la correlación no permita reconstruir flujos decisionales completos ni secuencias de razonamiento. El marco garantiza que la correlación respete este límite.

4. **Alineación con bloques operativos**: El sistema requiere que la trazabilidad se alinee estrictamente con BLOQUE 2 (Decisión), BLOQUE 3 (Habilitación), BLOQUE 4 (Ejecución) y BLOQUE 5 (Observación), sin introducir nueva lógica ni reinterpretar modelos existentes.

5. **Correlación determinística**: El sistema requiere que la correlación sea determinística y no ambigua, sin permitir correlaciones heurísticas o probabilísticas que introduzcan incertidumbre o interpretación.

6. **Separación de responsabilidades**: El sistema requiere separación clara entre trazabilidad (BLOQUE 5) y operación (BLOQUES 1-4). El marco establece esta separación de forma explícita.

### 1.3. Riesgos que Mitiga

El marco de trazabilidad y correlación mitiga los siguientes riesgos:

1. **Riesgo de correlación no delimitada**: Sin límites explícitos, el sistema podría correlacionar entidades que comprometan privacidad, seguridad o cumplimiento normativo.

2. **Riesgo de inferencias de intención**: Sin reglas estrictas, la correlación podría permitir inferir razones de decisiones, intenciones de usuarios o lógica de control.

3. **Riesgo de reconstrucción de flujos decisionales**: Sin prevención explícita, la correlación podría permitir reconstruir flujos decisionales completos que expongan la lógica interna del sistema.

4. **Riesgo de introducción de nueva lógica**: Sin alineación estricta, la trazabilidad podría introducir nueva lógica de control o decisión que comprometa la arquitectura del sistema.

5. **Riesgo de correlación heurística**: Sin determinismo estricto, la correlación podría basarse en heurísticas o probabilidades que introduzcan incertidumbre o interpretación.

6. **Riesgo de mezcla de responsabilidades**: Sin separación explícita, la trazabilidad podría mezclarse con operación o decisión, comprometiendo la arquitectura del sistema.

---

## 2. Contexto Normativo

### 2.1. Principios Fundamentales

Este documento define el marco canónico de trazabilidad determinística y correlación válida en Elixir Platform. El marco es:

- **Declarativo**: Define qué entidades pueden correlacionarse y cómo, no cómo se implementa técnicamente
- **Normativo**: Establece reglas obligatorias que toda correlación debe respetar
- **Canónico**: Es la única fuente de verdad para el marco de trazabilidad y correlación
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones
- **Determinístico**: Establece que la correlación es determinística y no ambigua, sin heurísticas ni probabilidades
- **No interpretativo**: Garantiza que la correlación no permite inferencias de intención, razones de decisión ni reconstrucción de flujos

### 2.2. Relación con Bloques Previos

Este documento se basa en:

- **BLOQUE 2**: Modelo de decisiones (ALLOW/DENY/HOLD) que establece qué decisiones se emiten
- **BLOQUE 3**: Modelo de habilitación (ENABLED/DISABLED/SUSPENDED) que establece qué habilitaciones se emiten
- **BLOQUE 4**: Modelo de ejecución que establece qué acciones se ejecutan y qué estados alcanzan
- **BLOQUE 5 (FASE 5.1)**: Marco de eventos observables que establece qué eventos son observables
- **BLOQUE 5 (FASE 5.2)**: Modelo de evidencia mínima que establece qué evidencia se captura
- **BLOQUE 5 (FASE 5.3)**: Marco de registro pasivo y asincrónico que establece cómo se registra

La FASE 5.4 extiende estos modelos agregando el marco de trazabilidad y correlación, sin modificar ni reinterpretar los modelos base ni invalidar las fases anteriores.

### 2.3. Invariantes Globales

El marco de trazabilidad y correlación respeta los mismos invariantes fundamentales definidos en bloques anteriores:

1. **D0 (Elixir no custodia datos)**: La trazabilidad no contiene datos personales identificables más allá de referencias abstractas necesarias para correlación
2. **Default Deny**: La trazabilidad no expone información por defecto. Solo correlaciones explícitamente permitidas son válidas
3. **Apagabilidad**: La trazabilidad puede ser desactivada completamente sin comprometer la apagabilidad del sistema
4. **Pasividad absoluta**: La trazabilidad es pasiva y no operativa. No ejecuta, no modifica, no retroalimenta
5. **No interpretativa**: La trazabilidad no permite inferencias de intención, razones de decisión ni reconstrucción de flujos decisionales

### 2.4. Restricciones Inmutables

Esta fase opera bajo las siguientes restricciones inmutables:

- **Elixir Core está SELLADO e INMODIFICABLE**: El marco de trazabilidad no puede modificar, extender ni reinterpretar Elixir Core
- **BLOQUES 1 a 4 están COMPLETAMENTE CERRADOS**: El marco de trazabilidad no puede modificar, extender ni reinterpretar los BLOQUES 1 a 4
- **FASES 5.1, 5.2 y 5.3 están DEFINIDAS y CERRADAS**: El marco de trazabilidad no puede modificar, extender ni reinterpretar las FASES 5.1, 5.2 y 5.3
- **BLOQUE 5 solo OBSERVA**: El BLOQUE 5 no decide, no controla, no modifica. Solo observa y correlaciona
- **No nuevos identificadores sistémicos**: El marco no introduce nuevos identificadores sistémicos
- **No mecanismos técnicos de linking**: El marco no define mecanismos técnicos de linking
- **No grafos, timelines o visualizaciones**: El marco no introduce grafos, timelines o visualizaciones
- **No correlaciones heurísticas o probabilísticas**: El marco solo permite correlaciones determinísticas

---

## 3. Definición Formal de Trazabilidad Determinística

### 3.1. Qué es Trazabilidad Determinística

**Trazabilidad Determinística** en Elixir Platform es la capacidad de establecer relaciones unidireccionales, inmutables y no interpretativas entre entidades conceptuales del sistema (decisiones, habilitaciones, ejecuciones, eventos y evidencia) mediante reglas determinísticas que permiten correlacionar estas entidades sin introducir lógica, permitir inferencias de intención ni habilitar reconstrucción de flujos decisionales.

La trazabilidad determinística es:

1. **Unidireccional**: Las relaciones de trazabilidad van desde entidades operativas (decisiones, habilitaciones, ejecuciones) hacia entidades observables (eventos, evidencia), nunca en dirección inversa
2. **Inmutable**: Una vez establecida, una relación de trazabilidad no puede modificarse, corregirse ni eliminarse
3. **No interpretativa**: La trazabilidad no permite inferir razones, intenciones, causalidad ni dependencias
4. **Determinística**: Dadas dos entidades, es posible determinar de forma no ambigua si están correlacionadas mediante reglas explícitas
5. **No lógica**: La trazabilidad no introduce nueva lógica de control, decisión ni operación
6. **No reconstructiva**: La trazabilidad no permite reconstruir flujos decisionales completos ni secuencias de razonamiento
7. **Alineada**: La trazabilidad se alinea estrictamente con BLOQUE 2 (Decisión), BLOQUE 3 (Habilitación), BLOQUE 4 (Ejecución) y BLOQUE 5 (Observación)

**Regla explícita**: La trazabilidad determinística es la capacidad de correlacionar entidades mediante reglas determinísticas sin introducir lógica, permitir inferencias ni habilitar reconstrucción de flujos decisionales.

### 3.2. Qué NO es Trazabilidad Determinística

Las siguientes capacidades **NO** constituyen trazabilidad determinística en el sentido del marco:

- ❌ **Trazabilidad bidireccional**: Capacidad de navegar relaciones en ambas direcciones
- ❌ **Trazabilidad interpretativa**: Capacidad de inferir razones, intenciones o causalidad mediante correlación
- ❌ **Trazabilidad reconstructiva**: Capacidad de reconstruir flujos decisionales completos mediante correlación
- ❌ **Trazabilidad heurística**: Capacidad de correlacionar mediante heurísticas o probabilidades
- ❌ **Trazabilidad lógica**: Capacidad de introducir nueva lógica de control, decisión ni operación mediante correlación
- ❌ **Trazabilidad de flujos**: Capacidad de trazar flujos completos de operación mediante correlación
- ❌ **Trazabilidad de intención**: Capacidad de inferir intenciones o propósitos mediante correlación

**Regla explícita**: Solo la correlación unidireccional, inmutable, no interpretativa, determinística, no lógica y no reconstructiva constituye trazabilidad determinística. Cualquier capacidad que no cumpla todas estas características está prohibida.

### 3.3. Separación de Trazabilidad y Operación

La **trazabilidad** (BLOQUE 5) y la **operación** (BLOQUES 1-4) son conceptos distintos y separados:

1. **Operación**: Realiza decisiones, habilitaciones y ejecuciones. Es un acto que modifica estados y produce efectos
2. **Trazabilidad**: Correlaciona entidades operativas con entidades observables sin modificar estados ni producir efectos. Es un reflejo pasivo

**Regla explícita**: La trazabilidad es completamente independiente de la operación. La trazabilidad correlaciona entidades operativas con entidades observables, pero no ejecuta, modifica ni retroalimenta la operación.

---

## 4. Entidades Conceptuales Trazables

### 4.1. Principio de Alineación con Bloques Operativos

Las entidades trazables se alinean estrictamente con BLOQUE 2 (Decisión), BLOQUE 3 (Habilitación), BLOQUE 4 (Ejecución) y BLOQUE 5 (Observación). No existen entidades trazables que no correspondan a estos bloques.

**Regla explícita**: Solo las entidades que corresponden a BLOQUE 2, BLOQUE 3, BLOQUE 4 o BLOQUE 5 son trazables. No existen otras entidades trazables.

### 4.2. Entidades del BLOQUE 2 (Decisión)

Las siguientes entidades del BLOQUE 2 son trazables:

1. **Decisión ALLOW**: Decisión canónica de tipo ALLOW emitida por el BLOQUE 2
2. **Decisión DENY**: Decisión canónica de tipo DENY emitida por el BLOQUE 2
3. **Decisión HOLD**: Decisión canónica de tipo HOLD emitida por el BLOQUE 2

**Características de trazabilidad**:
- Cada decisión tiene un identificador único e inmutable
- Las decisiones no contienen razones, explicaciones ni contexto
- Las decisiones solo pueden correlacionarse con eventos observables y evidencia del BLOQUE 5
- Las decisiones no pueden correlacionarse entre sí mediante trazabilidad

**Regla explícita**: Las decisiones del BLOQUE 2 son trazables únicamente hacia eventos observables y evidencia del BLOQUE 5. No pueden correlacionarse entre sí ni con otras entidades operativas.

### 4.3. Entidades del BLOQUE 3 (Habilitación)

Las siguientes entidades del BLOQUE 3 son trazables:

1. **Habilitación ENABLED**: Habilitación de tipo ENABLED emitida por el BLOQUE 3
2. **Habilitación DISABLED**: Habilitación de tipo DISABLED emitida por el BLOQUE 3
3. **Habilitación SUSPENDED**: Habilitación de tipo SUSPENDED emitida por el BLOQUE 3

**Características de trazabilidad**:
- Cada habilitación tiene un identificador único e inmutable
- Las habilitaciones no contienen razones, explicaciones ni contexto
- Las habilitaciones solo pueden correlacionarse con eventos observables y evidencia del BLOQUE 5
- Las habilitaciones no pueden correlacionarse entre sí mediante trazabilidad

**Regla explícita**: Las habilitaciones del BLOQUE 3 son trazables únicamente hacia eventos observables y evidencia del BLOQUE 5. No pueden correlacionarse entre sí ni con otras entidades operativas.

### 4.4. Entidades del BLOQUE 4 (Ejecución)

Las siguientes entidades del BLOQUE 4 son trazables:

1. **Ejecución PENDING**: Ejecución en estado PENDING
2. **Ejecución RUNNING**: Ejecución en estado RUNNING
3. **Ejecución SUSPENDED**: Ejecución en estado SUSPENDED
4. **Ejecución COMPLETED**: Ejecución en estado COMPLETED
5. **Ejecución CANCELLED**: Ejecución en estado CANCELLED
6. **Ejecución FAILED**: Ejecución en estado FAILED
7. **Ejecución TERMINATED**: Ejecución en estado TERMINATED

**Características de trazabilidad**:
- Cada ejecución tiene un identificador único e inmutable
- Las ejecuciones no contienen payloads, datos personales ni información de contenido
- Las ejecuciones solo pueden correlacionarse con eventos observables y evidencia del BLOQUE 5
- Las ejecuciones no pueden correlacionarse entre sí mediante trazabilidad

**Regla explícita**: Las ejecuciones del BLOQUE 4 son trazables únicamente hacia eventos observables y evidencia del BLOQUE 5. No pueden correlacionarse entre sí ni con otras entidades operativas.

### 4.5. Entidades del BLOQUE 5 (Observación)

Las siguientes entidades del BLOQUE 5 son trazables:

1. **Evento Observable (FASE 5.1)**: Evento observable definido en FASE 5.1
2. **Evidencia Mínima (FASE 5.2)**: Evidencia mínima definida en FASE 5.2

**Características de trazabilidad**:
- Cada evento observable tiene un identificador único e inmutable
- Cada evidencia mínima tiene un identificador único e inmutable
- Los eventos observables pueden correlacionarse con evidencia mínima
- Los eventos observables y evidencia mínima pueden correlacionarse con entidades operativas (decisiones, habilitaciones, ejecuciones)

**Regla explícita**: Los eventos observables y evidencia mínima del BLOQUE 5 son trazables hacia y desde entidades operativas, y entre sí (evento observable ↔ evidencia mínima).

### 4.6. Lista Exhaustiva de Entidades Trazables

La siguiente es la lista exhaustiva y completa de todas las entidades trazables:

**Entidades del BLOQUE 2 (3 entidades)**:
- Decisión ALLOW
- Decisión DENY
- Decisión HOLD

**Entidades del BLOQUE 3 (3 entidades)**:
- Habilitación ENABLED
- Habilitación DISABLED
- Habilitación SUSPENDED

**Entidades del BLOQUE 4 (7 entidades)**:
- Ejecución PENDING
- Ejecución RUNNING
- Ejecución SUSPENDED
- Ejecución COMPLETED
- Ejecución CANCELLED
- Ejecución FAILED
- Ejecución TERMINATED

**Entidades del BLOQUE 5 (2 tipos)**:
- Evento Observable (todos los tipos definidos en FASE 5.1)
- Evidencia Mínima (todos los tipos definidos en FASE 5.2)

**Total: 15 tipos de entidades trazables (3 + 3 + 7 + 2 tipos)**

**Regla explícita**: Esta lista es exhaustiva y completa. No existen otras entidades trazables. Cualquier entidad que no esté en esta lista no es trazable.

---

## 5. Relaciones Válidas de Correlación

### 5.1. Principio de Correlación Unidireccional

Las relaciones de correlación son **unidireccionales**: van desde entidades operativas (BLOQUES 2, 3, 4) hacia entidades observables (BLOQUE 5), nunca en dirección inversa.

**Regla explícita**: Las correlaciones son unidireccionales desde operación hacia observación. No existen correlaciones bidireccionales ni desde observación hacia operación.

### 5.2. Correlación: Decisión → Evento Observable

**Relación permitida**: Una Decisión (BLOQUE 2) puede correlacionarse con uno o más Eventos Observables (BLOQUE 5).

**Reglas**:
- Una decisión puede correlacionarse con múltiples eventos observables
- Un evento observable puede correlacionarse con una única decisión
- La correlación es determinística: dados una decisión y un evento observable, es posible determinar de forma no ambigua si están correlacionados
- La correlación no permite inferir razones de la decisión
- La correlación no permite reconstruir el flujo decisional

**Regla explícita**: Las decisiones solo pueden correlacionarse con eventos observables. No pueden correlacionarse con otras decisiones, habilitaciones, ejecuciones ni evidencia mínima directamente.

### 5.3. Correlación: Habilitación → Evento Observable

**Relación permitida**: Una Habilitación (BLOQUE 3) puede correlacionarse con uno o más Eventos Observables (BLOQUE 5).

**Reglas**:
- Una habilitación puede correlacionarse con múltiples eventos observables
- Un evento observable puede correlacionarse con una única habilitación
- La correlación es determinística: dados una habilitación y un evento observable, es posible determinar de forma no ambigua si están correlacionados
- La correlación no permite inferir razones de la habilitación
- La correlación no permite reconstruir el flujo de habilitación

**Regla explícita**: Las habilitaciones solo pueden correlacionarse con eventos observables. No pueden correlacionarse con otras decisiones, habilitaciones, ejecuciones ni evidencia mínima directamente.

### 5.4. Correlación: Ejecución → Evento Observable

**Relación permitida**: Una Ejecución (BLOQUE 4) puede correlacionarse con uno o más Eventos Observables (BLOQUE 5).

**Reglas**:
- Una ejecución puede correlacionarse con múltiples eventos observables
- Un evento observable puede correlacionarse con una única ejecución
- La correlación es determinística: dados una ejecución y un evento observable, es posible determinar de forma no ambigua si están correlacionados
- La correlación no permite inferir razones de la ejecución
- La correlación no permite reconstruir el flujo de ejecución

**Regla explícita**: Las ejecuciones solo pueden correlacionarse con eventos observables. No pueden correlacionarse con otras decisiones, habilitaciones, ejecuciones ni evidencia mínima directamente.

### 5.5. Correlación: Evento Observable ↔ Evidencia Mínima

**Relación permitida**: Un Evento Observable (BLOQUE 5) puede correlacionarse con una Evidencia Mínima (BLOQUE 5), y viceversa.

**Reglas**:
- Un evento observable puede correlacionarse con una única evidencia mínima
- Una evidencia mínima puede correlacionarse con un único evento observable
- La correlación es bidireccional (única excepción al principio de unidireccionalidad)
- La correlación es determinística: dados un evento observable y una evidencia mínima, es posible determinar de forma no ambigua si están correlacionados
- La correlación no permite inferir información adicional sobre el evento o la evidencia

**Regla explícita**: Los eventos observables y evidencia mínima pueden correlacionarse entre sí bidireccionalmente. Esta es la única correlación bidireccional permitida.

### 5.6. Correlación Transitiva: Operación → Evento → Evidencia

**Relación permitida**: Una entidad operativa (Decisión, Habilitación, Ejecución) puede correlacionarse indirectamente con una Evidencia Mínima mediante un Evento Observable intermedio.

**Reglas**:
- La correlación transitiva es: Operación → Evento Observable → Evidencia Mínima
- La correlación transitiva es determinística: dados una entidad operativa y una evidencia mínima, es posible determinar de forma no ambigua si están correlacionadas transitivamente
- La correlación transitiva no permite inferir información adicional sobre la entidad operativa
- La correlación transitiva no permite reconstruir flujos decisionales

**Regla explícita**: Las correlaciones transitivas son permitidas únicamente mediante Evento Observable como entidad intermedia. No existen correlaciones transitivas directas entre entidades operativas.

### 5.7. Prohibición de Correlaciones No Permitidas

Están **prohibidas** las siguientes correlaciones:

- ❌ **Decisión ↔ Decisión**: Las decisiones no pueden correlacionarse entre sí
- ❌ **Habilitación ↔ Habilitación**: Las habilitaciones no pueden correlacionarse entre sí
- ❌ **Ejecución ↔ Ejecución**: Las ejecuciones no pueden correlacionarse entre sí
- ❌ **Decisión ↔ Habilitación**: Las decisiones y habilitaciones no pueden correlacionarse directamente
- ❌ **Decisión ↔ Ejecución**: Las decisiones y ejecuciones no pueden correlacionarse directamente
- ❌ **Habilitación ↔ Ejecución**: Las habilitaciones y ejecuciones no pueden correlacionarse directamente
- ❌ **Operación → Operación**: Las entidades operativas no pueden correlacionarse entre sí directamente
- ❌ **Evidencia → Operación**: La evidencia no puede correlacionarse con entidades operativas directamente (solo transitivamente)

**Regla explícita**: Solo las correlaciones explícitamente permitidas en las secciones 5.2 a 5.6 son válidas. Todas las demás correlaciones están prohibidas.

---

## 6. Reglas Estrictas de Correlación Válida

### 6.1. Regla de Determinismo

**Enunciado**: Toda correlación válida debe ser determinística y no ambigua.

**Aplicación**:
- Dadas dos entidades, es posible determinar de forma no ambigua si están correlacionadas
- No existen correlaciones probabilísticas, heurísticas ni basadas en similitud
- Las reglas de correlación son explícitas y verificables
- La correlación no depende de interpretación ni contexto

**Violación**: Cualquier correlación que no sea determinística o que sea ambigua viola esta regla.

### 6.2. Regla de No Interpretación

**Enunciado**: Toda correlación válida no debe permitir inferencias de intención, razones de decisión ni lógica de control.

**Aplicación**:
- La correlación no permite inferir por qué se tomó una decisión
- La correlación no permite inferir por qué se emitió una habilitación
- La correlación no permite inferir por qué se ejecutó una acción
- La correlación no permite inferir intenciones, propósitos ni contextos operativos

**Violación**: Cualquier correlación que permita inferir intención, razones de decisión o lógica de control viola esta regla.

### 6.3. Regla de No Reconstrucción

**Enunciado**: Toda correlación válida no debe permitir reconstrucción de flujos decisionales completos ni secuencias de razonamiento.

**Aplicación**:
- La correlación no permite reconstruir el flujo completo de una decisión
- La correlación no permite reconstruir el flujo completo de una habilitación
- La correlación no permite reconstruir el flujo completo de una ejecución
- La correlación no permite reconstruir secuencias de razonamiento o evaluación

**Violación**: Cualquier correlación que permita reconstruir flujos decisionales completos o secuencias de razonamiento viola esta regla.

### 6.4. Regla de No Lógica

**Enunciado**: Toda correlación válida no debe introducir nueva lógica de control, decisión ni operación.

**Aplicación**:
- La correlación no introduce reglas de negocio
- La correlación no introduce lógica condicional
- La correlación no introduce evaluación de condiciones
- La correlación no introduce toma de decisiones

**Violación**: Cualquier correlación que introduzca nueva lógica de control, decisión ni operación viola esta regla.

### 6.5. Regla de Inmutabilidad

**Enunciado**: Toda correlación válida es inmutable una vez establecida.

**Aplicación**:
- Una correlación no puede modificarse después de ser establecida
- Una correlación no puede corregirse ni actualizarse
- Una correlación no puede eliminarse (solo puede ser ignorada)
- Una correlación es definitiva una vez establecida

**Violación**: Cualquier modificación, corrección o eliminación de una correlación establecida viola esta regla.

### 6.6. Regla de Unidireccionalidad

**Enunciado**: Toda correlación válida es unidireccional desde operación hacia observación, excepto Evento Observable ↔ Evidencia Mínima.

**Aplicación**:
- Las correlaciones van desde entidades operativas (BLOQUES 2, 3, 4) hacia entidades observables (BLOQUE 5)
- No existen correlaciones desde observación hacia operación
- La única excepción es la correlación bidireccional Evento Observable ↔ Evidencia Mínima

**Violación**: Cualquier correlación bidireccional desde observación hacia operación (excepto Evento Observable ↔ Evidencia Mínima) viola esta regla.

### 6.7. Regla de Alineación

**Enunciado**: Toda correlación válida debe alinearse estrictamente con BLOQUE 2 (Decisión), BLOQUE 3 (Habilitación), BLOQUE 4 (Ejecución) y BLOQUE 5 (Observación).

**Aplicación**:
- Las correlaciones solo involucran entidades de estos bloques
- Las correlaciones no introducen nuevas entidades
- Las correlaciones no reinterpretan modelos de bloques anteriores
- Las correlaciones respetan los límites establecidos en cada bloque

**Violación**: Cualquier correlación que no se alinee estrictamente con estos bloques o que introduzca nuevas entidades viola esta regla.

### 6.8. Regla de Pasividad

**Enunciado**: Toda correlación válida es pasiva y no operativa.

**Aplicación**:
- La correlación no ejecuta acciones
- La correlación no modifica estados
- La correlación no genera efectos
- La correlación no retroalimenta al sistema

**Violación**: Cualquier correlación que ejecute acciones, modifique estados, genere efectos o retroalimente al sistema viola esta regla.

---

## 7. Invariantes Obligatorios de la Trazabilidad

### 7.1. Invariante de Determinismo

**Enunciado**: Toda correlación de trazabilidad es determinística y no ambigua.

**Aplicación en el modelo**:
- Dadas dos entidades, es posible determinar de forma no ambigua si están correlacionadas
- No existen correlaciones probabilísticas, heurísticas ni basadas en similitud
- Las reglas de correlación son explícitas y verificables

**Violación**: Cualquier correlación que no sea determinística o que sea ambigua viola este invariante.

### 7.2. Invariante de No Interpretación

**Enunciado**: La trazabilidad no permite inferencias de intención, razones de decisión ni lógica de control.

**Aplicación en el modelo**:
- La correlación no permite inferir por qué se tomó una decisión
- La correlación no permite inferir por qué se emitió una habilitación
- La correlación no permite inferir por qué se ejecutó una acción
- La correlación no permite inferir intenciones, propósitos ni contextos operativos

**Violación**: Cualquier correlación que permita inferir intención, razones de decisión o lógica de control viola este invariante.

### 7.3. Invariante de No Reconstrucción

**Enunciado**: La trazabilidad no permite reconstrucción de flujos decisionales completos ni secuencias de razonamiento.

**Aplicación en el modelo**:
- La correlación no permite reconstruir el flujo completo de una decisión
- La correlación no permite reconstruir el flujo completo de una habilitación
- La correlación no permite reconstruir el flujo completo de una ejecución
- La correlación no permite reconstruir secuencias de razonamiento o evaluación

**Violación**: Cualquier correlación que permita reconstruir flujos decisionales completos o secuencias de razonamiento viola este invariante.

### 7.4. Invariante de No Lógica

**Enunciado**: La trazabilidad no introduce nueva lógica de control, decisión ni operación.

**Aplicación en el modelo**:
- La correlación no introduce reglas de negocio
- La correlación no introduce lógica condicional
- La correlación no introduce evaluación de condiciones
- La correlación no introduce toma de decisiones

**Violación**: Cualquier correlación que introduzca nueva lógica de control, decisión ni operación viola este invariante.

### 7.5. Invariante de Inmutabilidad

**Enunciado**: Toda correlación de trazabilidad es inmutable una vez establecida.

**Aplicación en el modelo**:
- Una correlación no puede modificarse después de ser establecida
- Una correlación no puede corregirse ni actualizarse
- Una correlación no puede eliminarse (solo puede ser ignorada)
- Una correlación es definitiva una vez establecida

**Violación**: Cualquier modificación, corrección o eliminación de una correlación establecida viola este invariante.

### 7.6. Invariante de Unidireccionalidad

**Enunciado**: Toda correlación de trazabilidad es unidireccional desde operación hacia observación, excepto Evento Observable ↔ Evidencia Mínima.

**Aplicación en el modelo**:
- Las correlaciones van desde entidades operativas (BLOQUES 2, 3, 4) hacia entidades observables (BLOQUE 5)
- No existen correlaciones desde observación hacia operación
- La única excepción es la correlación bidireccional Evento Observable ↔ Evidencia Mínima

**Violación**: Cualquier correlación bidireccional desde observación hacia operación (excepto Evento Observable ↔ Evidencia Mínima) viola este invariante.

### 7.7. Invariante de Alineación

**Enunciado**: La trazabilidad se alinea estrictamente con BLOQUE 2 (Decisión), BLOQUE 3 (Habilitación), BLOQUE 4 (Ejecución) y BLOQUE 5 (Observación).

**Aplicación en el modelo**:
- Las correlaciones solo involucran entidades de estos bloques
- Las correlaciones no introducen nuevas entidades
- Las correlaciones no reinterpretan modelos de bloques anteriores
- Las correlaciones respetan los límites establecidos en cada bloque

**Violación**: Cualquier correlación que no se alinee estrictamente con estos bloques o que introduzca nuevas entidades viola este invariante.

### 7.8. Invariante de Pasividad

**Enunciado**: La trazabilidad es pasiva y no operativa.

**Aplicación en el modelo**:
- La correlación no ejecuta acciones
- La correlación no modifica estados
- La correlación no genera efectos
- La correlación no retroalimenta al sistema

**Violación**: Cualquier correlación que ejecute acciones, modifique estados, genere efectos o retroalimente al sistema viola este invariante.

### 7.9. Invariante D0 (Elixir no custodia datos)

**Enunciado**: La trazabilidad no contiene datos personales identificables más allá de referencias abstractas necesarias para correlación.

**Aplicación en el modelo**:
- Las correlaciones no contienen datos personales identificables
- Las referencias de entidad son abstractas y no contienen datos personales
- Los identificadores de correlación no contienen datos personales

**Violación**: Cualquier correlación que contenga datos personales identificables viola este invariante.

### 7.10. Invariante de Apagabilidad

**Enunciado**: La trazabilidad puede ser desactivada completamente sin comprometer la apagabilidad del sistema.

**Aplicación en el modelo**:
- El sistema debe poder dejar de generar correlaciones sin afectar funcionalidad
- La ausencia de correlaciones no puede romper contratos operativos
- Las correlaciones son opcionales por diseño
- Apagar la trazabilidad no puede causar errores, excepciones o fallos

**Violación**: Cualquier dependencia operativa de la trazabilidad viola este invariante.

---

## 8. Límites Explícitos de la Trazabilidad

### 8.1. Límites de Alcance

La trazabilidad está limitada en alcance a:

1. **Solo entidades permitidas**: La trazabilidad solo puede correlacionar entidades explícitamente permitidas en la lista exhaustiva de entidades trazables
2. **Solo relaciones permitidas**: La trazabilidad solo puede establecer relaciones explícitamente permitidas en las relaciones válidas de correlación
3. **Solo bloques permitidos**: La trazabilidad solo puede involucrar entidades de BLOQUE 2, BLOQUE 3, BLOQUE 4 y BLOQUE 5

**Regla explícita**: La trazabilidad está limitada exclusivamente a las entidades, relaciones y bloques explícitamente permitidos. Cualquier alcance adicional está prohibido.

### 8.2. Límites de Contenido

La trazabilidad está limitada en contenido a:

1. **Solo identificadores abstractos**: La trazabilidad solo puede usar identificadores abstractos que no contengan datos personales
2. **Solo referencias inmutables**: La trazabilidad solo puede usar referencias inmutables a entidades
3. **Sin payloads**: La trazabilidad no puede contener payloads, datos de request, datos de response ni información de contenido
4. **Sin datos personales**: La trazabilidad no puede contener información que identifique usuarios, modelos ni entidades específicas

**Regla explícita**: La trazabilidad solo puede contener identificadores abstractos y referencias inmutables. Cualquier contenido adicional está prohibido.

### 8.3. Límites de Uso

La trazabilidad está limitada en uso a:

1. **Solo observación**: La trazabilidad solo puede usarse para observación, no para control, decisión ni modificación de comportamiento
2. **Solo auditoría**: La trazabilidad solo puede usarse para auditoría y cumplimiento, no para lógica de negocio
3. **Sin análisis agregado**: La trazabilidad no puede usarse para análisis agregado, consultas complejas ni procesamiento de datos

**Regla explícita**: La trazabilidad solo puede usarse para observación y auditoría. Cualquier otro uso está prohibido.

### 8.4. Límites de Implementación

La trazabilidad está limitada en implementación a:

1. **Sin nuevos identificadores sistémicos**: La trazabilidad no puede introducir nuevos identificadores sistémicos
2. **Sin mecanismos técnicos de linking**: La trazabilidad no puede definir mecanismos técnicos de linking
3. **Sin grafos, timelines o visualizaciones**: La trazabilidad no puede introducir grafos, timelines o visualizaciones
4. **Sin consultas o análisis agregados**: La trazabilidad no puede definir consultas o análisis agregados

**Regla explícita**: La trazabilidad no puede introducir nuevos identificadores sistémicos, mecanismos técnicos de linking, grafos, timelines, visualizaciones, consultas ni análisis agregados. Cualquier implementación que viole estos límites está prohibida.

---

## 9. Coherencia con Bloques Anteriores

### 9.1. Coherencia con BLOQUE 2

El marco de trazabilidad y correlación es coherente con el BLOQUE 2:

- **Decisiones trazables**: Las decisiones (ALLOW, DENY, HOLD) son trazables hacia eventos observables y evidencia
- **Sin reinterpretación**: El marco no reinterpreta el modelo de decisiones del BLOQUE 2
- **Sin modificación**: El marco no modifica las decisiones ni introduce nueva lógica de decisión
- **Separación de responsabilidades**: El BLOQUE 2 es responsable de emitir decisiones. El BLOQUE 5 es responsable de correlacionar decisiones con observación

### 9.2. Coherencia con BLOQUE 3

El marco de trazabilidad y correlación es coherente con el BLOQUE 3:

- **Habilitaciones trazables**: Las habilitaciones (ENABLED, DISABLED, SUSPENDED) son trazables hacia eventos observables y evidencia
- **Sin reinterpretación**: El marco no reinterpreta el modelo de habilitación del BLOQUE 3
- **Sin modificación**: El marco no modifica las habilitaciones ni introduce nueva lógica de habilitación
- **Separación de responsabilidades**: El BLOQUE 3 es responsable de emitir habilitaciones. El BLOQUE 5 es responsable de correlacionar habilitaciones con observación

### 9.3. Coherencia con BLOQUE 4

El marco de trazabilidad y correlación es coherente con el BLOQUE 4:

- **Ejecuciones trazables**: Las ejecuciones (PENDING, RUNNING, SUSPENDED, COMPLETED, CANCELLED, FAILED, TERMINATED) son trazables hacia eventos observables y evidencia
- **Sin reinterpretación**: El marco no reinterpreta el modelo de ejecución del BLOQUE 4
- **Sin modificación**: El marco no modifica las ejecuciones ni introduce nueva lógica de ejecución
- **Separación de responsabilidades**: El BLOQUE 4 es responsable de ejecutar acciones. El BLOQUE 5 es responsable de correlacionar ejecuciones con observación

### 9.4. Coherencia con BLOQUE 5 (FASES 5.1, 5.2, 5.3)

El marco de trazabilidad y correlación es coherente con las FASES 5.1, 5.2 y 5.3:

- **Eventos observables correlacionables**: Los eventos observables definidos en FASE 5.1 son correlacionables con decisiones, habilitaciones, ejecuciones y evidencia
- **Evidencia mínima correlacionable**: La evidencia mínima definida en FASE 5.2 es correlacionable con eventos observables y, transitivamente, con decisiones, habilitaciones y ejecuciones
- **Registro pasivo respetado**: El marco respeta el principio de registro pasivo y asincrónico establecido en FASE 5.3
- **Sin modificación**: El marco no modifica los modelos de eventos observables, evidencia mínima ni registro pasivo

### 9.5. Separación de Responsabilidades

**Regla explícita**: El BLOQUE 5 es completamente pasivo y no operativo. La trazabilidad correlaciona entidades operativas con entidades observables sin ejecutar, modificar ni retroalimentar. Cada bloque mantiene su responsabilidad exclusiva sin mezclarse con otros bloques.

---

## 10. Criterios de Cierre de la FASE 5.4

### 10.1. Criterios de Cierre

La FASE 5.4 se considera cerrada cuando:

1. **Definición formal establecida**: La definición formal de "Trazabilidad Determinística" está completamente establecida y documentada
2. **Entidades trazables definidas**: La lista exhaustiva de todas las entidades trazables está completamente definida y documentada
3. **Relaciones válidas establecidas**: Las relaciones válidas de correlación están completamente establecidas y documentadas
4. **Reglas estrictas establecidas**: Las reglas estrictas de correlación válida están completamente establecidas y documentadas
5. **Invariantes obligatorios establecidos**: Los invariantes obligatorios de la trazabilidad están completamente establecidos y documentados
6. **Límites explícitos establecidos**: Los límites explícitos de la trazabilidad están completamente establecidos y documentados
7. **Coherencia con bloques anteriores verificada**: El marco de trazabilidad y correlación es coherente con los modelos establecidos en BLOQUES 2, 3, 4 y 5
8. **Frase canónica de cierre establecida**: La frase canónica de cierre, declarativa y no técnica, está establecida y documentada

### 10.2. Condiciones para Avance a Fase Siguiente

La FASE 5.4 habilita el avance a la siguiente fase del BLOQUE 5 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre están satisfechos
2. **Marco de trazabilidad operativo**: El marco de trazabilidad y correlación está operativo y puede gobernar la correlación del BLOQUE 5
3. **Garantías normativas verificadas**: Las garantías normativas (determinismo, no interpretación, no reconstrucción, no lógica) están verificadas y funcionando según lo documentado

**Regla explícita**: El avance a la siguiente fase requiere cumplimiento explícito de todos los criterios de cierre. No existe avance automático ni implícito.

---

## 11. Cierre Canónico de la Fase

### 11.1. Declaración Explícita de Cierre

La FASE 5.4 queda conceptualmente cerrada y establece el marco canónico de trazabilidad determinística y correlación válida para el BLOQUE 5.

El marco de trazabilidad y correlación definido por esta fase gobierna toda correlación entre entidades del sistema. Establece qué entidades son trazables, cómo pueden correlacionarse, qué reglas estrictas gobiernan estas correlaciones, y cómo el sistema garantiza determinismo, prevención de inferencias y prevención de reconstrucción mediante la trazabilidad controlada.

El marco de trazabilidad y correlación es definitivo para determinar qué correlaciones son válidas en el BLOQUE 5 y cómo deben comportarse. No hay mecanismo de apelación, bypass ni omisión de este marco.

**Regla explícita**: El marco de trazabilidad y correlación es canónico e inmodificable. Una vez aprobado, no admite reinterpretaciones ni extensiones.

### 11.2. Preparación para Fases Siguientes

La FASE 5.4 establece el marco de trazabilidad y correlación necesario para fases siguientes del BLOQUE 5. Las fases siguientes utilizarán este marco para definir cómo se implementan, procesan y almacenan las correlaciones, cómo se garantiza la trazabilidad determinística, y cómo se previene la inferencia y reconstrucción.

La FASE 5.4 no anticipa ni desarrolla las fases siguientes. Solo establece el marco de trazabilidad y correlación que las fases siguientes utilizarán como base.

**Regla explícita**: La FASE 5.4 establece el marco de trazabilidad y correlación. Las fases siguientes utilizarán este marco para definir la implementación y procesamiento de correlaciones. No existe anticipación ni desarrollo de fases siguientes en este documento.

---

## 12. Frase Canónica de Cierre

**El BLOQUE 5 establece trazabilidad determinística entre decisiones, habilitaciones, ejecuciones, eventos y evidencia mediante correlaciones unidireccionales, inmutables y no interpretativas que no introducen lógica, no permiten inferencias de intención y no habilitan reconstrucción de flujos decisionales. La trazabilidad se alinea estrictamente con BLOQUE 2 (Decisión), BLOQUE 3 (Habilitación), BLOQUE 4 (Ejecución) y BLOQUE 5 (Observación), preservando la apagabilidad total del sistema y cumpliendo estrictamente con la política D0. El marco de trazabilidad y correlación es canónico, exhaustivo e inmodificable.**

---

**Fin del documento**

**Versión**: 1.0  
**Estado**: Documentación canónica y normativa  
**Aprobación**: Pendiente de aprobación formal  
**Fecha**: 2025


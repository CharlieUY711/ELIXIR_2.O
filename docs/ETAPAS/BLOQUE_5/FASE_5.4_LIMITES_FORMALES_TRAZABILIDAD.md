# FASE 5.4 — Límites Formales de Trazabilidad y Casos de No-Correlación

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada  
**Fase**: FASE 5.4 — Límites Formales de Trazabilidad y Casos de No-Correlación  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 5.4

### 1.1. Función Exacta de los Límites de Trazabilidad

La FASE 5.4 define los límites formales de la trazabilidad en Elixir Platform, estableciendo hasta dónde puede extenderse la correlación entre eventos observables y evidencias, qué rupturas válidas de la cadena trazable están permitidas, qué correlaciones están explícitamente prohibidas, y qué ocurre cuando la trazabilidad es incompleta.

Esta fase opera bajo el principio canónico de que la trazabilidad existe exclusivamente para verificación posterior, sin que el sistema navegue su propia trazabilidad ni ningún componente decida a partir de la correlación.

### 1.2. Necesidad de Límites Formales de Trazabilidad

Los límites formales de trazabilidad son necesarios incluso cuando las FASES 5.1, 5.2 y 5.3 han establecido eventos observables, evidencia mínima y registro pasivo, porque:

1. **Delimitación de alcance**: El sistema requiere límites explícitos sobre hasta dónde puede extenderse la correlación entre eventos y evidencias. Sin límites formales, la trazabilidad podría extenderse indefinidamente, comprometiendo privacidad, seguridad y cumplimiento normativo.

2. **Rupturas válidas**: El sistema requiere definición explícita de qué rupturas de la cadena trazable son válidas y permitidas. Sin esta definición, cualquier ruptura podría interpretarse como error o inconsistencia, generando mecanismos de reparación no deseados.

3. **Correlaciones prohibidas**: El sistema requiere enumeración explícita de correlaciones que están prohibidas. Sin esta enumeración, correlaciones no deseadas podrían introducirse, comprometiendo la separación de responsabilidades y la pasividad del BLOQUE 5.

4. **Trazabilidad incompleta**: El sistema requiere definición explícita de qué ocurre cuando la trazabilidad es incompleta. Sin esta definición, la incompletitud podría interpretarse como error, generando mecanismos de reparación o estados implícitos no deseados.

5. **Preservación de apagabilidad**: El sistema requiere garantía explícita de que la falta de correlación no invalida ejecuciones, no dispara reevaluaciones y no genera estados implícitos. Sin esta garantía, la trazabilidad podría comprometer la apagabilidad del sistema.

6. **Prevención de control activo**: El sistema requiere prevención explícita de que la trazabilidad se interprete como control, reconciliación automática, auditoría activa o mecanismo de reparación. Sin esta prevención, la trazabilidad podría convertirse en un mecanismo de control no deseado.

### 1.3. Riesgos que Mitiga

Los límites formales de trazabilidad mitigan los siguientes riesgos:

1. **Riesgo de extensión indefinida**: Sin límites formales, la trazabilidad podría extenderse indefinidamente, correlacionando eventos y evidencias que no deberían correlacionarse, comprometiendo privacidad y seguridad.

2. **Riesgo de reparación automática**: Sin definición explícita de rupturas válidas, cualquier ruptura podría interpretarse como error, generando mecanismos de reparación automática no deseados.

3. **Riesgo de correlaciones no deseadas**: Sin enumeración explícita de correlaciones prohibidas, correlaciones no deseadas podrían introducirse, comprometiendo la separación de responsabilidades.

4. **Riesgo de estados implícitos**: Sin definición explícita de comportamiento ante trazabilidad incompleta, la incompletitud podría generar estados implícitos o mecanismos de reparación no deseados.

5. **Riesgo de compromiso de apagabilidad**: Sin garantía explícita de que la falta de correlación no invalida ejecuciones, la trazabilidad podría comprometer la apagabilidad del sistema.

6. **Riesgo de control activo**: Sin prevención explícita de interpretación de trazabilidad como control, la trazabilidad podría convertirse en un mecanismo de control no deseado.

---

## 2. Contexto Canónico

### 2.1. Principios Fundamentales

Este documento define los límites formales de trazabilidad en Elixir Platform. Los límites son:

- **Declarativos**: Definen hasta dónde puede extenderse la trazabilidad, no cómo se implementa
- **Normativos**: Establecen reglas obligatorias que toda trazabilidad debe respetar
- **Canónicos**: Son la única fuente de verdad para los límites de trazabilidad
- **Inmodificables**: Una vez aprobados, no admiten reinterpretaciones ni extensiones
- **Pasivos**: Establecen que la trazabilidad es exclusivamente para verificación posterior
- **No operativos**: Garantizan que la trazabilidad no participa en decisiones ni control

### 2.2. Relación con Fases Previas

Este documento se basa en:

- **FASE 5.1**: Marco Canónico de Eventos Observables y Modelo Lógico de Eventos Observables que establecen qué eventos son observables y cómo se relacionan
- **FASE 5.2**: Modelo Canónico de Evidencia Mínima que establece qué constituye evidencia válida de eventos observables
- **FASE 5.3**: Registro Pasivo y Asincrónico que establece cómo se registran eventos y evidencias sin interferir con la ejecución

La FASE 5.4 extiende estas fases agregando los límites formales de trazabilidad, sin modificar ni reinterpretar las fases anteriores.

### 2.3. Invariantes Globales

Los límites formales de trazabilidad respetan los mismos invariantes fundamentales definidos en fases anteriores:

1. **D0 (Elixir no custodia datos)**: La trazabilidad no puede contener datos personales identificables más allá de referencias abstractas necesarias para correlación
2. **Default Deny**: La trazabilidad no puede extenderse más allá de los límites formales establecidos
3. **Apagabilidad**: Los límites de trazabilidad no comprometen la apagabilidad del sistema. La trazabilidad puede ser incompleta sin afectar la operación
4. **Pasividad absoluta**: La trazabilidad es exclusivamente para verificación posterior. El sistema no navega su propia trazabilidad ni decide a partir de la correlación

### 2.4. Restricciones Inmutables

Esta fase opera bajo las siguientes restricciones inmutables:

- **Elixir Core está SELLADO e INMODIFICABLE**: Los límites de trazabilidad no pueden modificar, extender ni reinterpretar Elixir Core
- **WAM existe solo como transporte**: Los límites de trazabilidad no pueden modificar, extender ni reinterpretar WAM
- **Política D0 cerrada**: Los límites de trazabilidad deben cumplir estrictamente con la política D0
- **BLOQUES 1 a 4 están COMPLETAMENTE CERRADOS**: Los límites de trazabilidad no pueden modificar, extender ni reinterpretar los BLOQUES 1 a 4
- **BLOQUE 5 solo OBSERVA**: El BLOQUE 5 no decide, no controla, no modifica. Solo observa y documenta para verificación posterior

---

## 3. Definición Formal de Trazabilidad

### 3.1. Qué es Trazabilidad en Elixir

**Trazabilidad** en Elixir Platform es la capacidad de correlacionar eventos observables y evidencias mínimas mediante identificadores técnicos (trace_id, correlation_id, entity_reference) para permitir verificación posterior de hechos consumados, sin que esta correlación participe en decisiones, controle flujos, ni genere estados implícitos.

La trazabilidad es:

1. **Exclusivamente para verificación posterior**: La trazabilidad existe solo para permitir verificación de hechos consumados después de que ocurrieron. No existe para control, decisión ni operación en tiempo real.

2. **No navegable por el sistema**: El sistema no navega su propia trazabilidad. Los componentes no consultan la trazabilidad para tomar decisiones, evaluar estados ni modificar comportamiento.

3. **No decisional**: Ningún componente decide a partir de la correlación. La correlación no influye en decisiones, no modifica estados, no genera efectos operativos.

4. **Pasiva y diferida**: La trazabilidad es pasiva y diferida. Se documenta después de que los hechos ocurrieron, sin interferir con la ejecución.

5. **Opcional y apagable**: La trazabilidad es opcional y puede ser desactivada completamente sin afectar la operación del sistema.

6. **Incompleta por diseño**: La trazabilidad puede ser incompleta sin invalidar ejecuciones, disparar reevaluaciones ni generar estados implícitos.

**Regla explícita**: La trazabilidad es exclusivamente para verificación posterior. El sistema no navega su propia trazabilidad ni ningún componente decide a partir de la correlación.

### 3.2. Qué NO es Trazabilidad en Elixir

Las siguientes capacidades **NO** constituyen trazabilidad en el sentido del BLOQUE 5:

- ❌ **Control activo**: La trazabilidad no es un mecanismo de control que modifica comportamiento, toma decisiones ni genera efectos operativos
- ❌ **Auditoría activa**: La trazabilidad no es un sistema de auditoría activa que monitorea en tiempo real, genera alertas ni dispara acciones
- ❌ **Reconciliación automática**: La trazabilidad no es un mecanismo de reconciliación automática que detecta inconsistencias, corrige errores ni repara estados
- ❌ **Reparación de estados**: La trazabilidad no es un mecanismo de reparación que restaura estados, corrige inconsistencias ni genera estados implícitos
- ❌ **Navegación operativa**: La trazabilidad no es un mecanismo de navegación que el sistema consulta para tomar decisiones, evaluar estados ni modificar comportamiento
- ❌ **Fuente de verdad**: La trazabilidad no es una fuente de verdad que valida estados, verifica consistencia ni establece verdades absolutas
- ❌ **Mecanismo de decisión**: La trazabilidad no es un mecanismo de decisión que influye en decisiones, modifica estados ni genera efectos operativos

**Regla explícita**: La trazabilidad es exclusivamente para verificación posterior. Cualquier uso de la trazabilidad para control, decisión, auditoría activa, reconciliación automática o reparación está prohibido.

---

## 4. Límites Formales de Trazabilidad

### 4.1. Límite de Alcance Temporal

**Definición**: La trazabilidad solo puede correlacionar eventos y evidencias que ocurrieron en el pasado, dentro de un dominio temporal acotado.

**Límites formales**:

- **Dominio temporal**: `(-∞, t_actual]`
- **No futuro**: La trazabilidad no puede correlacionar eventos futuros o hipotéticos
- **No presente operativo**: La trazabilidad no puede correlacionar eventos que están ocurriendo en el momento de la correlación (la correlación es siempre diferida)
- **Acotación temporal**: La trazabilidad puede tener límites de retención temporal (TTL) que acotan el dominio temporal de correlación

**Regla explícita**: La trazabilidad solo puede correlacionar eventos y evidencias que ocurrieron en el pasado, dentro de un dominio temporal acotado. No puede correlacionar eventos futuros, hipotéticos ni presentes operativos.

### 4.2. Límite de Alcance de Correlación

**Definición**: La trazabilidad solo puede correlacionar eventos y evidencias mediante identificadores técnicos explícitos (trace_id, correlation_id, entity_reference).

**Límites formales**:

- **Identificadores explícitos**: La correlación solo puede ocurrir mediante identificadores técnicos explícitos definidos en FASE 5.1 y FASE 5.2
- **No inferencia**: La correlación no puede inferirse de patrones, secuencias temporales, contenido ni contexto
- **No interpretación**: La correlación no puede interpretarse de relaciones semánticas, lógicas ni causales
- **Unidireccional**: La correlación es unidireccional: evidencia → evento. Los eventos no conocen su evidencia

**Regla explícita**: La trazabilidad solo puede correlacionar eventos y evidencias mediante identificadores técnicos explícitos. No puede inferir, interpretar ni establecer correlaciones basadas en patrones, secuencias, contenido ni contexto.

### 4.3. Límite de Profundidad de Correlación

**Definición**: La trazabilidad solo puede correlacionar eventos y evidencias directamente relacionados mediante identificadores técnicos compartidos. No puede establecer cadenas de correlación transitivas ni profundas.

**Límites formales**:

- **Correlación directa**: La correlación solo puede establecerse entre eventos y evidencias que comparten identificadores técnicos explícitos
- **No transitividad**: La correlación no es transitiva. Si A está correlacionado con B y B está correlacionado con C, A no está necesariamente correlacionado con C
- **No profundidad**: La trazabilidad no puede establecer cadenas de correlación profundas que relacionen eventos y evidencias indirectamente relacionados
- **No reconstrucción de flujos**: La trazabilidad no puede reconstruir flujos completos de operaciones mediante correlación transitiva

**Regla explícita**: La trazabilidad solo puede correlacionar eventos y evidencias directamente relacionados mediante identificadores técnicos compartidos. No puede establecer cadenas de correlación transitivas ni profundas.

### 4.4. Límite de Alcance de Bloques

**Definición**: La trazabilidad solo puede correlacionar eventos y evidencias dentro del mismo bloque o entre bloques adyacentes, sin cruzar límites de responsabilidad.

**Límites formales**:

- **Dentro del mismo bloque**: La trazabilidad puede correlacionar eventos y evidencias dentro del mismo bloque (BLOQUE 1, 2, 3, 4 o 5)
- **Entre bloques adyacentes**: La trazabilidad puede correlacionar eventos y evidencias entre bloques adyacentes (BLOQUE 1 → BLOQUE 2, BLOQUE 2 → BLOQUE 3, BLOQUE 3 → BLOQUE 4, BLOQUE 4 → BLOQUE 5)
- **No cruce de límites**: La trazabilidad no puede cruzar límites de responsabilidad establecidos entre bloques no adyacentes
- **No mezcla de responsabilidades**: La trazabilidad no puede mezclar responsabilidades de bloques distintos

**Regla explícita**: La trazabilidad solo puede correlacionar eventos y evidencias dentro del mismo bloque o entre bloques adyacentes, sin cruzar límites de responsabilidad.

### 4.5. Límite de Complejidad de Correlación

**Definición**: La trazabilidad solo puede establecer correlaciones simples y directas. No puede establecer correlaciones complejas, múltiples ni condicionales.

**Límites formales**:

- **Correlación simple**: La correlación es simple: un evento puede estar correlacionado con una evidencia mediante un identificador técnico compartido
- **No múltiple**: La correlación no puede ser múltiple: un evento no puede estar correlacionado con múltiples evidencias simultáneamente mediante diferentes criterios
- **No condicional**: La correlación no puede ser condicional: no puede depender de condiciones, estados ni contextos
- **No compleja**: La correlación no puede ser compleja: no puede involucrar lógica, evaluación ni interpretación

**Regla explícita**: La trazabilidad solo puede establecer correlaciones simples y directas. No puede establecer correlaciones complejas, múltiples ni condicionales.

---

## 5. Rupturas Válidas de la Cadena Trazable

### 5.1. Definición de Ruptura Válida

**Ruptura válida** de la cadena trazable es la ausencia de correlación entre eventos y evidencias que deberían estar correlacionados según los límites formales establecidos, pero cuya ausencia es válida, permitida y no genera errores, estados implícitos ni mecanismos de reparación.

### 5.2. Rupturas Válidas por Apagabilidad

**Definición**: La trazabilidad puede ser incompleta o ausente cuando el sistema está apagado, cuando la observabilidad está desactivada, o cuando el registro está deshabilitado.

**Casos válidos**:

- **Sistema apagado**: Cuando el sistema está apagado, la trazabilidad puede ser incompleta o ausente sin invalidar ejecuciones previas
- **Observabilidad desactivada**: Cuando la observabilidad está desactivada, la trazabilidad puede ser incompleta o ausente sin afectar la operación
- **Registro deshabilitado**: Cuando el registro está deshabilitado, la trazabilidad puede ser incompleta o ausente sin comprometer la ejecución

**Regla explícita**: La trazabilidad puede ser incompleta o ausente cuando el sistema está apagado, cuando la observabilidad está desactivada, o cuando el registro está deshabilitado. Esta incompletitud es válida y no genera errores ni estados implícitos.

### 5.3. Rupturas Válidas por Fallo de Registro

**Definición**: La trazabilidad puede ser incompleta o ausente cuando el registro falla, cuando el almacenamiento no está disponible, o cuando el procesamiento asincrónico no completa.

**Casos válidos**:

- **Fallo de registro**: Cuando el registro falla, la trazabilidad puede ser incompleta o ausente sin invalidar la ejecución que generó el evento
- **Almacenamiento no disponible**: Cuando el almacenamiento no está disponible, la trazabilidad puede ser incompleta o ausente sin afectar la operación
- **Procesamiento asincrónico incompleto**: Cuando el procesamiento asincrónico no completa, la trazabilidad puede ser incompleta o ausente sin comprometer la ejecución

**Regla explícita**: La trazabilidad puede ser incompleta o ausente cuando el registro falla, cuando el almacenamiento no está disponible, o cuando el procesamiento asincrónico no completa. Esta incompletitud es válida y no genera errores ni estados implícitos.

### 5.4. Rupturas Válidas por Límites Temporales

**Definición**: La trazabilidad puede ser incompleta o ausente cuando los eventos o evidencias exceden los límites temporales de retención (TTL).

**Casos válidos**:

- **TTL excedido**: Cuando los eventos o evidencias exceden el TTL, la trazabilidad puede ser incompleta o ausente sin invalidar ejecuciones previas
- **Retención limitada**: Cuando la retención está limitada por políticas, la trazabilidad puede ser incompleta o ausente sin afectar la operación
- **Eliminación por políticas**: Cuando los eventos o evidencias son eliminados por políticas de retención, la trazabilidad puede ser incompleta o ausente sin comprometer la ejecución

**Regla explícita**: La trazabilidad puede ser incompleta o ausente cuando los eventos o evidencias exceden los límites temporales de retención. Esta incompletitud es válida y no genera errores ni estados implícitos.

### 5.5. Rupturas Válidas por Separación de Responsabilidades

**Definición**: La trazabilidad puede ser incompleta o ausente cuando los eventos o evidencias pertenecen a bloques distintos o cuando la correlación cruzaría límites de responsabilidad.

**Casos válidos**:

- **Bloques distintos**: Cuando los eventos o evidencias pertenecen a bloques distintos, la trazabilidad puede ser incompleta o ausente sin invalidar ejecuciones
- **Límites de responsabilidad**: Cuando la correlación cruzaría límites de responsabilidad, la trazabilidad puede ser incompleta o ausente sin afectar la operación
- **Separación de dominios**: Cuando los eventos o evidencias pertenecen a dominios distintos, la trazabilidad puede ser incompleta o ausente sin comprometer la ejecución

**Regla explícita**: La trazabilidad puede ser incompleta o ausente cuando los eventos o evidencias pertenecen a bloques distintos o cuando la correlación cruzaría límites de responsabilidad. Esta incompletitud es válida y no genera errores ni estados implícitos.

### 5.6. Principio de No-Reparación de Rupturas

**Regla explícita**: Las rupturas válidas de la cadena trazable no pueden ser reparadas automáticamente. No existe mecanismo de reconciliación, reparación ni reconstrucción de trazabilidad incompleta.

**Prohibiciones explícitas**:

- ❌ **Reconciliación automática**: No existe mecanismo de reconciliación automática que detecte y repare rupturas de trazabilidad
- ❌ **Reparación de estados**: No existe mecanismo de reparación que restaure estados o corrija inconsistencias basadas en trazabilidad incompleta
- ❌ **Reconstrucción de flujos**: No existe mecanismo de reconstrucción que restaure flujos completos de operaciones basados en trazabilidad incompleta
- ❌ **Generación de estados implícitos**: No existe mecanismo que genere estados implícitos basados en trazabilidad incompleta

**Regla explícita**: Las rupturas válidas de la cadena trazable no pueden ser reparadas automáticamente. No existe mecanismo de reconciliación, reparación ni reconstrucción de trazabilidad incompleta.

---

## 6. Correlaciones Explícitamente Prohibidas

### 6.1. Correlaciones Prohibidas por Inferencia

**Definición**: Están prohibidas todas las correlaciones que se establecen mediante inferencia de patrones, secuencias temporales, contenido ni contexto.

**Correlaciones prohibidas**:

- ❌ **Inferencia de patrones**: No se puede correlacionar eventos y evidencias basándose en patrones de ocurrencia, frecuencia ni regularidad
- ❌ **Inferencia temporal**: No se puede correlacionar eventos y evidencias basándose únicamente en proximidad temporal sin identificadores técnicos compartidos
- ❌ **Inferencia de contenido**: No se puede correlacionar eventos y evidencias basándose en contenido, payloads ni datos
- ❌ **Inferencia de contexto**: No se puede correlacionar eventos y evidencias basándose en contexto, estado del sistema ni condiciones operativas

**Regla explícita**: Están prohibidas todas las correlaciones que se establecen mediante inferencia de patrones, secuencias temporales, contenido ni contexto. Solo se permiten correlaciones mediante identificadores técnicos explícitos.

### 6.2. Correlaciones Prohibidas por Interpretación

**Definición**: Están prohibidas todas las correlaciones que se establecen mediante interpretación de relaciones semánticas, lógicas ni causales.

**Correlaciones prohibidas**:

- ❌ **Interpretación semántica**: No se puede correlacionar eventos y evidencias basándose en relaciones semánticas, significados ni intenciones
- ❌ **Interpretación lógica**: No se puede correlacionar eventos y evidencias basándose en relaciones lógicas, dependencias ni condiciones
- ❌ **Interpretación causal**: No se puede correlacionar eventos y evidencias basándose en relaciones causales, efectos ni consecuencias
- ❌ **Interpretación de intención**: No se puede correlacionar eventos y evidencias basándose en intenciones, propósitos ni objetivos

**Regla explícita**: Están prohibidas todas las correlaciones que se establecen mediante interpretación de relaciones semánticas, lógicas ni causales. Solo se permiten correlaciones mediante identificadores técnicos explícitos.

### 6.3. Correlaciones Prohibidas por Transitivdad

**Definición**: Están prohibidas todas las correlaciones que se establecen mediante transitividad o cadenas de correlación.

**Correlaciones prohibidas**:

- ❌ **Correlación transitiva**: No se puede correlacionar eventos y evidencias mediante transitividad (si A está correlacionado con B y B está correlacionado con C, A no está necesariamente correlacionado con C)
- ❌ **Cadenas de correlación**: No se pueden establecer cadenas de correlación que relacionen eventos y evidencias indirectamente relacionados
- ❌ **Reconstrucción de flujos**: No se pueden reconstruir flujos completos de operaciones mediante correlación transitiva
- ❌ **Correlación indirecta**: No se pueden establecer correlaciones indirectas que relacionen eventos y evidencias sin identificadores técnicos compartidos

**Regla explícita**: Están prohibidas todas las correlaciones que se establecen mediante transitividad o cadenas de correlación. Solo se permiten correlaciones directas mediante identificadores técnicos compartidos.

### 6.4. Correlaciones Prohibidas por Cruce de Límites

**Definición**: Están prohibidas todas las correlaciones que cruzan límites de responsabilidad entre bloques no adyacentes.

**Correlaciones prohibidas**:

- ❌ **Cruce de bloques no adyacentes**: No se puede correlacionar eventos y evidencias que pertenecen a bloques no adyacentes (BLOQUE 1 → BLOQUE 3, BLOQUE 2 → BLOQUE 4, etc.)
- ❌ **Mezcla de responsabilidades**: No se puede correlacionar eventos y evidencias que mezclan responsabilidades de bloques distintos
- ❌ **Violación de separación**: No se puede correlacionar eventos y evidencias que violan la separación de responsabilidades establecida entre bloques

**Regla explícita**: Están prohibidas todas las correlaciones que cruzan límites de responsabilidad entre bloques no adyacentes. Solo se permiten correlaciones dentro del mismo bloque o entre bloques adyacentes.

### 6.5. Correlaciones Prohibidas por Complejidad

**Definición**: Están prohibidas todas las correlaciones que son complejas, múltiples ni condicionales.

**Correlaciones prohibidas**:

- ❌ **Correlación múltiple**: No se puede correlacionar un evento con múltiples evidencias simultáneamente mediante diferentes criterios
- ❌ **Correlación condicional**: No se puede correlacionar eventos y evidencias basándose en condiciones, estados ni contextos
- ❌ **Correlación compleja**: No se puede establecer correlaciones que involucren lógica, evaluación ni interpretación
- ❌ **Correlación dinámica**: No se puede establecer correlaciones que cambien dinámicamente según condiciones, estados ni contextos

**Regla explícita**: Están prohibidas todas las correlaciones que son complejas, múltiples ni condicionales. Solo se permiten correlaciones simples y directas mediante identificadores técnicos compartidos.

### 6.6. Correlaciones Prohibidas por Uso Operativo

**Definición**: Están prohibidas todas las correlaciones que se usan para control, decisión, auditoría activa, reconciliación automática ni reparación.

**Correlaciones prohibidas**:

- ❌ **Correlación para control**: No se puede usar la correlación para controlar comportamiento, modificar estados ni generar efectos operativos
- ❌ **Correlación para decisión**: No se puede usar la correlación para tomar decisiones, evaluar estados ni modificar flujos
- ❌ **Correlación para auditoría activa**: No se puede usar la correlación para auditoría activa, monitoreo en tiempo real ni generación de alertas
- ❌ **Correlación para reconciliación**: No se puede usar la correlación para reconciliación automática, detección de inconsistencias ni corrección de errores
- ❌ **Correlación para reparación**: No se puede usar la correlación para reparación de estados, restauración de consistencia ni generación de estados implícitos

**Regla explícita**: Están prohibidas todas las correlaciones que se usan para control, decisión, auditoría activa, reconciliación automática ni reparación. La correlación solo puede usarse para verificación posterior.

---

## 7. Comportamiento ante Trazabilidad Incompleta

### 7.1. Principio de No-Invalidación

**Definición**: La falta de correlación no invalida ejecuciones, no dispara reevaluaciones ni genera estados implícitos.

**Comportamiento requerido**:

- **No invalidación de ejecuciones**: Las ejecuciones que no tienen trazabilidad completa o correlación válida no se invalidan. Las ejecuciones son válidas independientemente de su trazabilidad.
- **No reevaluación**: La falta de correlación no dispara reevaluaciones de decisiones, habilitaciones ni ejecuciones. Las decisiones, habilitaciones y ejecuciones son definitivas independientemente de su trazabilidad.
- **No estados implícitos**: La falta de correlación no genera estados implícitos, no asume estados hipotéticos ni no crea estados derivados. El sistema opera con estados explícitos independientemente de la trazabilidad.

**Regla explícita**: La falta de correlación no invalida ejecuciones, no dispara reevaluaciones ni genera estados implícitos. Las ejecuciones, decisiones y habilitaciones son válidas y definitivas independientemente de su trazabilidad.

### 7.2. Principio de No-Reparación

**Definición**: La trazabilidad incompleta no puede ser reparada automáticamente. No existe mecanismo de reconciliación, reparación ni reconstrucción.

**Comportamiento requerido**:

- **No reconciliación automática**: No existe mecanismo que detecte y repare automáticamente rupturas de trazabilidad
- **No reparación de estados**: No existe mecanismo que restaure estados o corrija inconsistencias basadas en trazabilidad incompleta
- **No reconstrucción de flujos**: No existe mecanismo que reconstruya flujos completos de operaciones basados en trazabilidad incompleta
- **No generación de estados implícitos**: No existe mecanismo que genere estados implícitos basados en trazabilidad incompleta

**Regla explícita**: La trazabilidad incompleta no puede ser reparada automáticamente. No existe mecanismo de reconciliación, reparación ni reconstrucción.

### 7.3. Principio de Apagabilidad con Trazabilidad Incompleta

**Definición**: El sistema debe ser apagable incluso con trazabilidad parcial o incompleta.

**Comportamiento requerido**:

- **Apagabilidad con trazabilidad parcial**: El sistema debe poder apagarse incluso cuando la trazabilidad es parcial o incompleta
- **No bloqueo por trazabilidad**: El apagado no puede ser bloqueado por trazabilidad incompleta, correlaciones faltantes ni evidencias ausentes
- **No espera de trazabilidad**: El apagado no puede esperar a que la trazabilidad se complete, las correlaciones se establezcan ni las evidencias se registren
- **Apagabilidad inmediata**: El apagado debe ser inmediato e incondicional, independientemente del estado de la trazabilidad

**Regla explícita**: El sistema debe ser apagable incluso con trazabilidad parcial o incompleta. El apagado no puede ser bloqueado ni retrasado por trazabilidad incompleta.

### 7.4. Principio de Operación Independiente

**Definición**: El sistema debe operar independientemente de la trazabilidad. La operación no depende de la trazabilidad completa ni de las correlaciones válidas.

**Comportamiento requerido**:

- **Operación sin trazabilidad**: El sistema debe poder operar normalmente incluso cuando la trazabilidad está desactivada, incompleta o ausente
- **No dependencia de correlación**: La operación no depende de correlaciones válidas, identificadores técnicos compartidos ni evidencias registradas
- **No validación de trazabilidad**: La operación no valida la trazabilidad, no verifica correlaciones ni no comprueba evidencias antes de ejecutar
- **Operación incondicional**: La operación es incondicional e independiente del estado de la trazabilidad

**Regla explícita**: El sistema debe operar independientemente de la trazabilidad. La operación no depende de la trazabilidad completa ni de las correlaciones válidas.

---

## 8. Garantías de No-Efecto de Falta de Correlación

### 8.1. Garantía de No-Invalidación de Ejecuciones

**Enunciado**: La falta de correlación no invalida ejecuciones. Las ejecuciones son válidas independientemente de su trazabilidad.

**Aplicación**:

- Las ejecuciones que no tienen trazabilidad completa o correlación válida no se invalidan
- Las ejecuciones que tienen evidencias ausentes o identificadores técnicos faltantes no se invalidan
- Las ejecuciones que tienen rupturas válidas de la cadena trazable no se invalidan
- Las ejecuciones son válidas y definitivas independientemente de su trazabilidad

**Violación**: Cualquier mecanismo que invalide ejecuciones basándose en falta de correlación, trazabilidad incompleta o evidencias ausentes viola esta garantía.

### 8.2. Garantía de No-Reevaluación

**Enunciado**: La falta de correlación no dispara reevaluaciones de decisiones, habilitaciones ni ejecuciones.

**Aplicación**:

- Las decisiones que no tienen trazabilidad completa o correlación válida no se reevalúan
- Las habilitaciones que no tienen trazabilidad completa o correlación válida no se reevalúan
- Las ejecuciones que no tienen trazabilidad completa o correlación válida no se reevalúan
- Las decisiones, habilitaciones y ejecuciones son definitivas independientemente de su trazabilidad

**Violación**: Cualquier mecanismo que dispare reevaluaciones basándose en falta de correlación, trazabilidad incompleta o evidencias ausentes viola esta garantía.

### 8.3. Garantía de No-Generación de Estados Implícitos

**Enunciado**: La falta de correlación no genera estados implícitos, no asume estados hipotéticos ni no crea estados derivados.

**Aplicación**:

- La falta de correlación no genera estados implícitos basados en trazabilidad incompleta
- La falta de correlación no asume estados hipotéticos basados en evidencias ausentes
- La falta de correlación no crea estados derivados basados en correlaciones faltantes
- El sistema opera con estados explícitos independientemente de la trazabilidad

**Violación**: Cualquier mecanismo que genere estados implícitos, asuma estados hipotéticos o cree estados derivados basándose en falta de correlación, trazabilidad incompleta o evidencias ausentes viola esta garantía.

### 8.4. Garantía de Apagabilidad con Trazabilidad Incompleta

**Enunciado**: El sistema debe ser apagable incluso con trazabilidad parcial o incompleta.

**Aplicación**:

- El sistema debe poder apagarse incluso cuando la trazabilidad es parcial o incompleta
- El apagado no puede ser bloqueado por trazabilidad incompleta, correlaciones faltantes ni evidencias ausentes
- El apagado no puede esperar a que la trazabilidad se complete, las correlaciones se establezcan ni las evidencias se registren
- El apagado debe ser inmediato e incondicional, independientemente del estado de la trazabilidad

**Violación**: Cualquier mecanismo que bloquee o retrase el apagado basándose en trazabilidad incompleta, correlaciones faltantes o evidencias ausentes viola esta garantía.

---

## 9. Coherencia con Fases Anteriores

### 9.1. Coherencia con FASE 5.1

Los límites formales de trazabilidad son coherentes con la FASE 5.1:

- **Eventos observables**: Los límites de trazabilidad operan sobre eventos observables definidos en FASE 5.1
- **Identificadores técnicos**: Los límites de trazabilidad usan identificadores técnicos (trace_id, correlation_id, entity_reference) definidos en FASE 5.1
- **Relaciones válidas**: Los límites de trazabilidad respetan las relaciones válidas entre eventos definidas en FASE 5.1
- **Reglas de correlación**: Los límites de trazabilidad respetan las reglas de correlación determinística definidas en FASE 5.1

### 9.2. Coherencia con FASE 5.2

Los límites formales de trazabilidad son coherentes con la FASE 5.2:

- **Evidencia mínima**: Los límites de trazabilidad operan sobre evidencia mínima definida en FASE 5.2
- **Componentes permitidos**: Los límites de trazabilidad respetan los componentes conceptuales permitidos definidos en FASE 5.2
- **Componentes prohibidos**: Los límites de trazabilidad respetan los componentes explícitamente prohibidos definidos en FASE 5.2
- **Principios normativos**: Los límites de trazabilidad respetan los principios normativos del modelo de evidencia definidos en FASE 5.2

### 9.3. Coherencia con FASE 5.3

Los límites formales de trazabilidad son coherentes con la FASE 5.3:

- **Registro pasivo**: Los límites de trazabilidad respetan el principio de registro pasivo definido en FASE 5.3
- **Registro asincrónico**: Los límites de trazabilidad respetan el principio de registro asincrónico definido en FASE 5.3
- **No-bloqueo**: Los límites de trazabilidad respetan el principio de no-bloqueo definido en FASE 5.3
- **Apagabilidad total**: Los límites de trazabilidad respetan el principio de apagabilidad total definido en FASE 5.3

---

## 10. Criterios de Cierre de la FASE 5.4

### 10.1. Criterios de Cierre

La FASE 5.4 se considera cerrada cuando:

1. **Límites formales establecidos**: Los límites formales de trazabilidad están completamente establecidos y documentados
2. **Rupturas válidas definidas**: Las rupturas válidas de la cadena trazable están completamente definidas y documentadas
3. **Correlaciones prohibidas enumeradas**: Las correlaciones explícitamente prohibidas están completamente enumeradas y documentadas
4. **Comportamiento ante incompletitud establecido**: El comportamiento ante trazabilidad incompleta está completamente establecido y documentado
5. **Garantías de no-efecto establecidas**: Las garantías de que la falta de correlación no invalida ejecuciones, no dispara reevaluaciones ni genera estados implícitos están completamente establecidas y documentadas
6. **Coherencia con fases anteriores verificada**: La coherencia con FASES 5.1, 5.2 y 5.3 está verificada y documentada
7. **Frase canónica de cierre establecida**: La frase canónica de cierre, declarativa y no técnica, está establecida y documentada

### 10.2. Condiciones para Avance a Fase Siguiente

La FASE 5.4 habilita el avance a la siguiente fase del BLOQUE 5 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre están satisfechos
2. **Límites formales operativos**: Los límites formales de trazabilidad están operativos y pueden gobernar la trazabilidad del BLOQUE 5
3. **Garantías verificadas**: Las garantías de no-efecto de falta de correlación están verificadas y funcionando según lo documentado

**Regla explícita**: El avance a la siguiente fase requiere cumplimiento explícito de todos los criterios de cierre. No existe avance automático ni implícito.

---

## 11. Cierre Canónico de la Fase

### 11.1. Declaración Explícita de Cierre

La FASE 5.4 queda conceptualmente cerrada y establece los límites formales de trazabilidad para el BLOQUE 5.

Los límites formales de trazabilidad definidos por esta fase gobiernan toda trazabilidad del BLOQUE 5. Establecen hasta dónde puede extenderse la correlación entre eventos observables y evidencias, qué rupturas válidas de la cadena trazable están permitidas, qué correlaciones están explícitamente prohibidas, y qué ocurre cuando la trazabilidad es incompleta.

Los límites formales de trazabilidad son definitivos para determinar qué correlaciones son válidas, qué rupturas son permitidas y qué comportamientos son requeridos ante trazabilidad incompleta. No hay mecanismo de apelación, bypass ni omisión de estos límites.

**Regla explícita**: Los límites formales de trazabilidad son canónicos e inmodificables. Una vez aprobados, no admiten reinterpretaciones ni extensiones.

### 11.2. Preparación para Fases Siguientes

La FASE 5.4 establece los límites formales de trazabilidad necesarios para fases siguientes del BLOQUE 5. Las fases siguientes utilizarán estos límites para definir cómo se implementan, procesan y almacenan las correlaciones, cómo se garantiza la apagabilidad con trazabilidad incompleta, y cómo se respetan las garantías de no-efecto de falta de correlación.

La FASE 5.4 no anticipa ni desarrolla las fases siguientes. Solo establece los límites formales de trazabilidad que las fases siguientes utilizarán como base.

**Regla explícita**: La FASE 5.4 establece los límites formales de trazabilidad. Las fases siguientes utilizarán estos límites para definir la implementación y procesamiento de correlaciones. No existe anticipación ni desarrollo de fases siguientes en este documento.

---

## 12. Frase Canónica de Cierre

**La trazabilidad en Elixir existe exclusivamente para verificación posterior. El sistema no navega su propia trazabilidad ni ningún componente decide a partir de la correlación. Los límites formales establecen hasta dónde puede extenderse la correlación, qué rupturas válidas están permitidas, qué correlaciones están explícitamente prohibidas, y qué ocurre cuando la trazabilidad es incompleta. La falta de correlación no invalida ejecuciones, no dispara reevaluaciones ni genera estados implícitos. La apagabilidad es obligatoria incluso con trazabilidad parcial. La trazabilidad es pasiva, diferida, opcional y prescindible por diseño.**

---

**Fin del documento**


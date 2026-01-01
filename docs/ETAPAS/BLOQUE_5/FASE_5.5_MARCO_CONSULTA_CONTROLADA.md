# FASE 5.5 — Marco de Consulta Controlada sobre Evidencia y Eventos Auditables

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada  
**Fase**: FASE 5.5 — Marco de Consulta Controlada sobre Evidencia y Eventos Auditables  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 5.5

### 1.1. Función Exacta del Marco de Consulta Controlada

La FASE 5.5 define el marco canónico de consulta controlada sobre evidencia y eventos auditables en Elixir Platform. Establece qué es una "consulta controlada", qué límites operativos y semánticos rigen las consultas, qué garantías de no-accionabilidad deben cumplirse, y cómo el sistema se comporta ante consultas largas, incompletas o interrumpidas.

El marco de consulta controlada opera como el conjunto normativo que rige toda capacidad de consulta del BLOQUE 5. No implementa consultas, no procesa resultados, no almacena información de consultas. Su única responsabilidad es definir el modelo conceptual que delimita qué consultas están permitidas, cómo se comportan, y qué garantías deben cumplirse.

### 1.2. Necesidad del Marco de Consulta Controlada

El marco de consulta controlada es necesario incluso cuando las FASES 5.1, 5.2, 5.3 y 5.4 han establecido eventos observables, evidencia mínima, registro pasivo y límites de trazabilidad, porque:

1. **Delimitación de consultabilidad**: El sistema requiere límites explícitos sobre qué puede consultarse y qué no puede consultarse. El marco de consulta controlada establece estos límites de forma canónica e inmodificable.

2. **Garantías de no-accionabilidad**: El sistema requiere garantías explícitas de que las consultas no pueden disparar acciones, modificar estados ni generar efectos colaterales. El marco de consulta controlada establece estas garantías.

3. **Preservación de apagabilidad**: El sistema requiere que las consultas preserven la apagabilidad total del sistema. El marco de consulta controlada garantiza que las consultas no comprometan la capacidad de apagado.

4. **Comportamiento ante interrupción**: El sistema requiere definición explícita de qué ocurre cuando una consulta es interrumpida, incompleta o el sistema se apaga durante la consulta. El marco de consulta controlada establece este comportamiento.

5. **Cumplimiento de D0**: El sistema requiere que las consultas respeten la política D0 (Elixir NO es custodio de datos). El marco de consulta controlada garantiza que las consultas no expongan datos personales ni payloads.

6. **Prevención de exploración interactiva**: El sistema requiere prevención explícita de consultas exploratorias, interactivas, encadenadas o recursivas. El marco de consulta controlada establece estas prohibiciones.

### 1.3. Riesgos que Mitiga

El marco de consulta controlada mitiga los siguientes riesgos:

1. **Riesgo de consultas no delimitadas**: Sin límites explícitos, las consultas podrían exponer información que comprometa privacidad, seguridad o cumplimiento normativo.

2. **Riesgo de efectos colaterales**: Sin garantías explícitas de no-accionabilidad, las consultas podrían disparar acciones, modificar estados o generar efectos no deseados.

3. **Riesgo de compromiso de apagabilidad**: Sin preservación explícita de apagabilidad, las consultas podrían comprometer la capacidad de apagado del sistema.

4. **Riesgo de consultas exploratorias**: Sin prevención explícita, las consultas podrían convertirse en mecanismos de exploración interactiva, comprometiendo la pasividad del BLOQUE 5.

5. **Riesgo de violación de D0**: Sin cumplimiento explícito de D0, las consultas podrían exponer datos personales o payloads que comprometan la política de no custodia.

6. **Riesgo de consultas encadenadas**: Sin prevención explícita, las consultas podrían encadenarse o hacerse recursivas, comprometiendo la simplicidad y controlabilidad del sistema.

---

## 2. Contexto Normativo

### 2.1. Principios Fundamentales

Este documento define el marco canónico de consulta controlada en Elixir Platform. El marco es:

- **Declarativo**: Define qué consultas están permitidas y qué no, no cómo se implementan
- **Normativo**: Establece reglas obligatorias que toda consulta debe respetar
- **Canónico**: Es la única fuente de verdad para el marco de consulta controlada
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones
- **Observacional**: Establece que las consultas son exclusivamente para observación, no para operación
- **No operativo**: Garantiza que las consultas no participan en decisiones ni control

### 2.2. Relación con Fases Previas

Este documento se basa en:

- **FASE 5.1**: Marco Canónico de Eventos Observables que establece qué eventos son observables y cómo se relacionan
- **FASE 5.2**: Modelo Canónico de Evidencia Mínima que establece qué constituye evidencia válida de eventos observables
- **FASE 5.3**: Comportamiento Canónico ante Fallos, Demoras o Ausencia de Registro que establece cómo el sistema se comporta cuando el registro falla
- **FASE 5.4**: Límites Formales de Trazabilidad que establece hasta dónde puede extenderse la correlación entre eventos y evidencias

La FASE 5.5 extiende estas fases agregando el marco de consulta controlada, sin modificar ni reinterpretar las fases anteriores.

### 2.3. Invariantes Globales

El marco de consulta controlada respeta los mismos invariantes fundamentales definidos en fases anteriores:

1. **D0 (Elixir no custodia datos)**: Las consultas no pueden exponer datos personales, payloads ni información que comprometa la política de no custodia
2. **Default Deny**: Las consultas no pueden exponer información por defecto. Solo consultas explícitamente permitidas son válidas
3. **Apagabilidad**: Las consultas pueden ser interrumpidas completamente sin comprometer la apagabilidad del sistema
4. **Pasividad absoluta**: Las consultas son exclusivamente para observación. El sistema no consulta su propia evidencia para tomar decisiones

### 2.4. Restricciones Inmutables

Esta fase opera bajo las siguientes restricciones inmutables:

- **Elixir Core está SELLADO e INMODIFICABLE**: El marco de consulta controlada no puede modificar, extender ni reinterpretar Elixir Core
- **WAM existe solo como transporte**: El marco de consulta controlada no puede modificar, extender ni reinterpretar WAM
- **Política D0 cerrada**: El marco de consulta controlada debe cumplir estrictamente con la política D0
- **BLOQUES 1 a 4 están COMPLETAMENTE CERRADOS**: El marco de consulta controlada no puede modificar, extender ni reinterpretar los BLOQUES 1 a 4
- **BLOQUE 5 solo OBSERVA**: El BLOQUE 5 no decide, no controla, no modifica. Solo observa y permite consulta de evidencia para verificación posterior

---

## 3. Definición Formal de Consulta Controlada

### 3.1. Qué es una Consulta Controlada

Una **Consulta Controlada** en Elixir Platform es una operación de lectura exclusiva, determinística y acotada que permite acceder a evidencia mínima y eventos observables registrados previamente, sin generar efectos colaterales, sin modificar estados, sin disparar acciones, y sin comprometer la apagabilidad del sistema.

Una consulta controlada es:

1. **Exclusivamente de lectura**: Solo lee información, nunca escribe, modifica ni elimina
2. **Determinística**: Dada la misma consulta sobre el mismo conjunto de evidencia, produce el mismo resultado
3. **Acotada**: Tiene límites explícitos de tiempo, recursos y alcance
4. **Sin efectos colaterales**: No modifica estados, no dispara acciones, no genera efectos operativos
5. **Observacional**: Existe exclusivamente para observación y verificación posterior
6. **No operativa**: No participa en decisiones, no influye en control, no modifica comportamiento
7. **Apagable**: Puede ser interrumpida en cualquier momento sin comprometer la apagabilidad del sistema
8. **Sin datos personales**: No expone datos personales, payloads ni información que comprometa D0

**Regla explícita**: Una consulta controlada es una operación de lectura exclusiva, determinística y acotada sobre evidencia y eventos auditables, sin efectos colaterales, sin modificación de estados, sin disparo de acciones, y sin compromiso de apagabilidad.

### 3.2. Qué NO es una Consulta Controlada

Las siguientes operaciones **NO** constituyen consultas controladas en el sentido del marco:

- ❌ **Exploración interactiva**: Operaciones que permiten navegar, explorar o descubrir información de forma interactiva no son consultas controladas
- ❌ **Filtros avanzados o agregaciones**: Operaciones que permiten filtros complejos, agregaciones dinámicas o transformaciones no son consultas controladas
- ❌ **Consultas encadenadas o recursivas**: Operaciones que permiten encadenar consultas o hacer consultas recursivas no son consultas controladas
- ❌ **Vistas, dashboards o exportaciones**: Operaciones que generan vistas, dashboards o exportaciones no son consultas controladas
- ❌ **Consultas con efectos colaterales**: Operaciones que modifican estados, disparan acciones o generan efectos operativos no son consultas controladas
- ❌ **Consultas operativas**: Operaciones que participan en decisiones, influyen en control o modifican comportamiento no son consultas controladas
- ❌ **Consultas que exponen datos personales**: Operaciones que exponen datos personales, payloads o información que compromete D0 no son consultas controladas
- ❌ **Consultas no acotadas**: Operaciones sin límites explícitos de tiempo, recursos o alcance no son consultas controladas

**Regla explícita**: Solo las operaciones de lectura exclusiva, determinística y acotada sobre evidencia y eventos auditables, sin efectos colaterales, constituyen consultas controladas. Todas las demás operaciones están fuera del alcance del marco de consulta controlada.

### 3.3. Características Obligatorias de una Consulta Controlada

Toda consulta controlada debe cumplir simultáneamente todas las siguientes características:

1. **Especificación explícita**: Tiene una especificación explícita y determinística de qué información se consulta
2. **Límites temporales**: Tiene límites explícitos de tiempo de ejecución (timeout)
3. **Límites de recursos**: Tiene límites explícitos de recursos (memoria, CPU, I/O)
4. **Límites de alcance**: Tiene límites explícitos de alcance (número de resultados, rango temporal)
5. **Sin efectos colaterales**: No modifica estados, no dispara acciones, no genera efectos operativos
6. **Sin datos personales**: No expone datos personales, payloads ni información que comprometa D0
7. **Apagable**: Puede ser interrumpida en cualquier momento sin comprometer la apagabilidad
8. **Determinística**: Dada la misma consulta sobre el mismo conjunto de evidencia, produce el mismo resultado

**Regla explícita**: Toda consulta controlada debe cumplir simultáneamente todas las características obligatorias. Cualquier consulta que no cumpla todas las características está prohibida.

---

## 4. Límites Operativos y Semánticos de Consulta

### 4.1. Límites Temporales

**Definición**: Toda consulta controlada tiene límites temporales explícitos que acotan su tiempo de ejecución.

**Límites formales**:

- **Timeout obligatorio**: Toda consulta debe tener un timeout explícito que limite su tiempo de ejecución
- **No consultas indefinidas**: No existen consultas que puedan ejecutarse indefinidamente
- **Interrupción inmediata**: El sistema puede interrumpir una consulta en cualquier momento, incluso antes de alcanzar el timeout
- **Sin espera de finalización**: El sistema no espera a que una consulta finalice antes de apagarse

**Regla explícita**: Toda consulta controlada tiene límites temporales explícitos. No existen consultas indefinidas ni consultas que puedan ejecutarse indefinidamente.

### 4.2. Límites de Recursos

**Definición**: Toda consulta controlada tiene límites explícitos de recursos que acotan su consumo de memoria, CPU e I/O.

**Límites formales**:

- **Límite de memoria**: Toda consulta debe tener un límite explícito de memoria que puede consumir
- **Límite de CPU**: Toda consulta debe tener un límite explícito de tiempo de CPU que puede consumir
- **Límite de I/O**: Toda consulta debe tener un límite explícito de operaciones de I/O que puede realizar
- **Sin consultas sin límites**: No existen consultas que puedan consumir recursos indefinidamente
- **Interrupción por recursos**: El sistema puede interrumpir una consulta si excede sus límites de recursos

**Regla explícita**: Toda consulta controlada tiene límites explícitos de recursos. No existen consultas que puedan consumir recursos indefinidamente.

### 4.3. Límites de Alcance

**Definición**: Toda consulta controlada tiene límites explícitos de alcance que acotan qué información puede consultar.

**Límites formales**:

- **Límite de resultados**: Toda consulta debe tener un límite explícito de número de resultados que puede retornar
- **Límite temporal**: Toda consulta debe tener un límite explícito de rango temporal que puede consultar
- **Límite de tipos de eventos**: Toda consulta debe especificar explícitamente qué tipos de eventos puede consultar
- **Sin consultas sin límites**: No existen consultas que puedan consultar información indefinidamente
- **Sin consultas exploratorias**: No existen consultas que permitan explorar o descubrir información de forma interactiva

**Regla explícita**: Toda consulta controlada tiene límites explícitos de alcance. No existen consultas que puedan consultar información indefinidamente ni consultas exploratorias.

### 4.4. Límites Semánticos

**Definición**: Toda consulta controlada tiene límites semánticos explícitos que acotan qué información puede exponer.

**Límites formales**:

- **Solo evidencia mínima**: Las consultas solo pueden exponer evidencia mínima definida en FASE 5.2
- **Solo eventos observables**: Las consultas solo pueden exponer eventos observables definidos en FASE 5.1
- **Sin datos personales**: Las consultas no pueden exponer datos personales, payloads ni información que comprometa D0
- **Sin inferencias de decisión**: Las consultas no pueden exponer información que permita inferir razones de decisiones o lógica de control
- **Sin reconstrucción de flujos**: Las consultas no pueden exponer información que permita reconstruir flujos completos de operaciones

**Regla explícita**: Toda consulta controlada tiene límites semánticos explícitos. Las consultas solo pueden exponer evidencia mínima y eventos observables, sin datos personales, sin inferencias de decisión, sin reconstrucción de flujos.

---

## 5. Garantías de No-Accionabilidad

### 5.1. Garantía de No-Modificación de Estados

**Garantía canónica**: Una consulta controlada **nunca** puede modificar estados del sistema.

**Asegura que**:

- Una consulta no puede modificar el estado de una ejecución
- Una consulta no puede modificar el estado de un usuario
- Una consulta no puede modificar el estado de una decisión
- Una consulta no puede modificar el estado de una acción
- Una consulta no puede modificar el estado de un componente
- Una consulta no puede modificar el estado del sistema

**Verificación**: `∀q ∈ ConsultaControlada, ∀s ∈ Estado : modificación(q, s) = ∅`

### 5.2. Garantía de No-Disparo de Acciones

**Garantía canónica**: Una consulta controlada **nunca** puede disparar acciones.

**Asegura que**:

- Una consulta no puede disparar ejecuciones
- Una consulta no puede disparar decisiones
- Una consulta no puede disparar habilitaciones
- Una consulta no puede disparar notificaciones
- Una consulta no puede disparar alertas
- Una consulta no puede disparar cualquier acción operativa

**Verificación**: `∀q ∈ ConsultaControlada, ∀a ∈ Acción : disparo(q, a) = ∅`

### 5.3. Garantía de No-Efectos Colaterales

**Garantía canónica**: Una consulta controlada **nunca** puede generar efectos colaterales.

**Asegura que**:

- Una consulta no puede generar logs operativos
- Una consulta no puede generar métricas operativas
- Una consulta no puede generar eventos operativos
- Una consulta no puede generar notificaciones
- Una consulta no puede generar cualquier efecto colateral

**Verificación**: `∀q ∈ ConsultaControlada : efectos_colaterales(q) = ∅`

### 5.4. Garantía de No-Participación en Decisiones

**Garantía canónica**: Una consulta controlada **nunca** puede participar en decisiones.

**Asegura que**:

- Una consulta no puede influir en decisiones del BLOQUE 2
- Una consulta no puede influir en habilitaciones del BLOQUE 3
- Una consulta no puede influir en ejecuciones del BLOQUE 4
- Una consulta no puede influir en cualquier decisión operativa

**Verificación**: `∀q ∈ ConsultaControlada, ∀d ∈ Decisión : influencia(q, d) = ∅`

### 5.5. Garantía de No-Exposición de Datos Personales

**Garantía canónica**: Una consulta controlada **nunca** puede exponer datos personales, payloads ni información que comprometa D0.

**Asegura que**:

- Una consulta no puede exponer números de teléfono
- Una consulta no puede exponer direcciones de correo electrónico
- Una consulta no puede exponer nombres reales o pseudónimos
- Una consulta no puede exponer payloads externos
- Una consulta no puede exponer contenido de mensajes
- Una consulta no puede exponer cualquier dato que comprometa D0

**Verificación**: `∀q ∈ ConsultaControlada : datos_personales(q) = ∅`

---

## 6. Comportamiento ante Consultas Largas o Incompletas

### 6.1. Comportamiento ante Timeout

**Situación**: Una consulta controlada alcanza su límite temporal (timeout).

**Comportamiento canónico**:

1. La consulta se interrumpe inmediatamente al alcanzar el timeout
2. La consulta retorna un resultado parcial o vacío, indicando que se alcanzó el timeout
3. El sistema no espera a que la consulta finalice
4. El estado del sistema no se modifica por el timeout
5. No se generan errores, excepciones ni notificaciones operativas
6. El sistema permanece completamente funcional

**Garantía**: `∀q ∈ ConsultaControlada, ∀t ∈ Timeout : impacto(q, sistema) = ∅`

### 6.2. Comportamiento ante Exceso de Recursos

**Situación**: Una consulta controlada excede sus límites de recursos (memoria, CPU, I/O).

**Comportamiento canónico**:

1. La consulta se interrumpe inmediatamente al exceder sus límites de recursos
2. La consulta retorna un resultado parcial o vacío, indicando que se excedieron los límites
3. El sistema no espera a que la consulta finalice
4. El estado del sistema no se modifica por el exceso de recursos
5. No se generan errores, excepciones ni notificaciones operativas
6. El sistema permanece completamente funcional

**Garantía**: `∀q ∈ ConsultaControlada, ∀r ∈ ExcesoRecursos : impacto(q, sistema) = ∅`

### 6.3. Comportamiento ante Consulta Incompleta

**Situación**: Una consulta controlada no puede completarse por cualquier razón (datos no disponibles, almacenamiento no accesible, etc.).

**Comportamiento canónico**:

1. La consulta retorna un resultado parcial o vacío, indicando que no pudo completarse
2. El sistema no espera a que la consulta finalice
3. El estado del sistema no se modifica por la incompletitud
4. No se generan errores, excepciones ni notificaciones operativas
5. El sistema permanece completamente funcional
6. La incompletitud no invalida ejecuciones, no dispara reevaluaciones ni genera estados implícitos

**Garantía**: `∀q ∈ ConsultaControlada, ∀i ∈ Incompletitud : impacto(q, sistema) = ∅`

### 6.4. Comportamiento ante Interrupción Manual

**Situación**: Una consulta controlada es interrumpida manualmente (por operador, por sistema, etc.).

**Comportamiento canónico**:

1. La consulta se interrumpe inmediatamente
2. La consulta retorna un resultado parcial o vacío, indicando que fue interrumpida
3. El sistema no espera a que la consulta finalice
4. El estado del sistema no se modifica por la interrupción
5. No se generan errores, excepciones ni notificaciones operativas
6. El sistema permanece completamente funcional

**Garantía**: `∀q ∈ ConsultaControlada, ∀m ∈ InterrupciónManual : impacto(q, sistema) = ∅`

---

## 7. Preservación de Apagabilidad durante y después de Consultas

### 7.1. Apagabilidad durante Consulta

**Garantía canónica**: El sistema puede apagarse **en cualquier momento**, incluso durante una consulta controlada activa.

**Asegura que**:

- El sistema puede iniciar un apagado mientras una consulta está ejecutándose
- El sistema no espera a que la consulta finalice antes de apagarse
- El sistema interrumpe la consulta inmediatamente al iniciar el apagado
- El sistema no bloquea el apagado por consultas activas
- El sistema no retrasa el apagado por consultas activas
- El sistema completa el apagado independientemente del estado de las consultas

**Verificación**: `∀s ∈ Sistema, ∀q ∈ ConsultaActiva : apagable(s) = verdadero`

### 7.2. Apagabilidad después de Consulta

**Garantía canónica**: El sistema puede apagarse **inmediatamente después** de que una consulta controlada finaliza, sin condiciones ni esperas.

**Asegura que**:

- El sistema puede apagarse inmediatamente después de que una consulta finaliza
- El sistema no requiere limpieza de consultas antes de apagarse
- El sistema no requiere finalización de consultas antes de apagarse
- El sistema no requiere procesamiento de resultados antes de apagarse
- El sistema completa el apagado independientemente del estado de consultas previas

**Verificación**: `∀s ∈ Sistema, ∀q ∈ ConsultaFinalizada : apagable(s) = verdadero`

### 7.3. Comportamiento de Consulta durante Apagado

**Situación**: El sistema inicia un apagado mientras una consulta controlada está ejecutándose.

**Comportamiento canónico**:

1. El sistema detecta el inicio del apagado (si es posible técnicamente)
2. El sistema interrumpe la consulta inmediatamente sin esperar su finalización
3. La consulta retorna un resultado parcial o vacío, indicando que el sistema se está apagando
4. El sistema no espera a que la consulta finalice
5. El sistema completa el apagado independientemente del estado de la consulta
6. No se generan errores, excepciones ni notificaciones operativas

**Garantía**: `∀s ∈ Sistema, ∀q ∈ ConsultaActiva, ∀a ∈ Apagado : impacto(q, a) = ∅`

### 7.4. Prioridad de Apagabilidad

**Principio canónico**: El principio de apagabilidad tiene **prioridad absoluta** sobre las consultas controladas.

**Establece que**:

- La apagabilidad tiene prioridad sobre cualquier consulta activa
- La apagabilidad tiene prioridad sobre cualquier consulta pendiente
- La apagabilidad tiene prioridad sobre cualquier procesamiento de resultados
- La apagabilidad tiene prioridad sobre cualquier limpieza de consultas
- El sistema puede desactivar las consultas en cualquier momento para garantizar apagabilidad

**Regla explícita**: La apagabilidad tiene prioridad absoluta sobre las consultas controladas. El sistema puede desactivar las consultas en cualquier momento para garantizar apagabilidad.

---

## 8. Alcance Prohibido

Este documento **NO define**:

- ❌ **Exploración interactiva**: No define mecanismos de exploración, navegación o descubrimiento interactivo de información
- ❌ **Filtros avanzados o agregaciones**: No define filtros complejos, agregaciones dinámicas o transformaciones de datos
- ❌ **Consultas encadenadas o recursivas**: No define mecanismos que permitan encadenar consultas o hacer consultas recursivas
- ❌ **Vistas, dashboards o exportaciones**: No define vistas, dashboards, reportes o exportaciones de datos
- ❌ **Responsabilidades humanas u organizativas**: No define quién puede consultar, cuándo puede consultar, ni qué responsabilidades tiene
- ❌ **Mecanismos de autenticación o autorización**: No define cómo se autentica o autoriza una consulta
- ❌ **Formatos técnicos de consulta**: No define si las consultas son SQL, GraphQL, REST, etc.
- ❌ **Mecanismos de almacenamiento o indexación**: No define cómo se almacena o indexa la evidencia para consulta

Este documento **SOLO define** el marco conceptual de consulta controlada, estableciendo límites operativos y semánticos, garantías de no-accionabilidad, y comportamiento ante consultas largas, incompletas o interrumpidas.

---

## 9. Coherencia con Fases Anteriores

### 9.1. Coherencia con FASE 5.1 (Eventos Observables)

El marco de consulta controlada es coherente con FASE 5.1 porque:

- **Respeta el marco de eventos observables**: Las consultas solo pueden acceder a eventos observables definidos en FASE 5.1
- **Preserva la apagabilidad**: La apagabilidad establecida en FASE 5.1 se preserva incluso durante consultas activas
- **Mantiene la independencia**: La independencia de eventos respecto a ejecución se mantiene respecto a consultas
- **No redefine eventos**: Este documento no redefine ni modifica eventos establecidos en FASE 5.1

### 9.2. Coherencia con FASE 5.2 (Evidencia Mínima)

El marco de consulta controlada es coherente con FASE 5.2 porque:

- **Respeta el modelo de evidencia mínima**: Las consultas solo pueden acceder a evidencia mínima definida en FASE 5.2
- **Preserva la pasividad**: La pasividad de la evidencia establecida en FASE 5.2 se preserva incluso durante consultas activas
- **Mantiene la independencia**: La independencia de evidencia respecto a ejecución se mantiene respecto a consultas
- **No redefine evidencia**: Este documento no redefine ni modifica evidencia establecida en FASE 5.2

### 9.3. Coherencia con FASE 5.3 (Comportamiento ante Fallos)

El marco de consulta controlada es coherente con FASE 5.3 porque:

- **Respeta el comportamiento ante fallos**: Las consultas respetan el principio de que los fallos de registro no afectan la ejecución
- **Preserva la apagabilidad con fallos**: La apagabilidad establecida en FASE 5.3 se preserva incluso durante consultas activas
- **Mantiene la independencia**: La independencia de registro respecto a ejecución se mantiene respecto a consultas
- **No redefine comportamiento**: Este documento no redefine ni modifica comportamiento establecido en FASE 5.3

### 9.4. Coherencia con FASE 5.4 (Límites de Trazabilidad)

El marco de consulta controlada es coherente con FASE 5.4 porque:

- **Respeta los límites de trazabilidad**: Las consultas respetan los límites formales de trazabilidad definidos en FASE 5.4
- **Preserva la pasividad de trazabilidad**: La pasividad de la trazabilidad establecida en FASE 5.4 se preserva incluso durante consultas activas
- **Mantiene la independencia**: La independencia de trazabilidad respecto a ejecución se mantiene respecto a consultas
- **No redefine límites**: Este documento no redefine ni modifica límites establecidos en FASE 5.4

---

## 10. Criterios de Cierre de la FASE 5.5

### 10.1. Criterios de Cierre

La FASE 5.5 se considera cerrada cuando:

1. **Definición formal establecida**: La definición formal de "Consulta Controlada" está completamente establecida y documentada
2. **Límites operativos y semánticos establecidos**: Los límites operativos y semánticos de consulta están completamente establecidos y documentados
3. **Garantías de no-accionabilidad establecidas**: Las garantías de no-accionabilidad están completamente establecidas y documentadas
4. **Comportamiento ante consultas largas o incompletas establecido**: El comportamiento ante consultas largas o incompletas está completamente establecido y documentado
5. **Preservación de apagabilidad verificada**: La preservación de apagabilidad durante y después de consultas está verificada y documentada
6. **Coherencia con fases anteriores verificada**: La coherencia con FASES 5.1, 5.2, 5.3 y 5.4 está verificada y documentada
7. **Frase canónica de cierre establecida**: La frase canónica de cierre, declarativa y no técnica, está establecida y documentada

### 10.2. Condiciones para Avance a Fase Siguiente

La FASE 5.5 habilita el avance a la siguiente fase del BLOQUE 5 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre están satisfechos
2. **Marco de consulta controlada operativo**: El marco de consulta controlada está operativo y puede gobernar la consulta del BLOQUE 5
3. **Garantías verificadas**: Las garantías de no-accionabilidad y preservación de apagabilidad están verificadas y funcionando según lo documentado

**Regla explícita**: El avance a la siguiente fase requiere cumplimiento explícito de todos los criterios de cierre. No existe avance automático ni implícito.

---

## 11. Cierre Canónico de la Fase

### 11.1. Declaración Explícita de Cierre

La FASE 5.5 queda conceptualmente cerrada y establece el marco canónico de consulta controlada para el BLOQUE 5.

El marco de consulta controlada definido por esta fase gobierna toda capacidad de consulta del BLOQUE 5. Establece qué consultas están permitidas, cómo se comportan, qué límites operativos y semánticos rigen las consultas, qué garantías de no-accionabilidad deben cumplirse, y cómo el sistema se comporta ante consultas largas, incompletas o interrumpidas.

El marco de consulta controlada es definitivo para determinar qué consultas son válidas, cómo deben comportarse, y qué garantías deben cumplirse. No hay mecanismo de apelación, bypass ni omisión de este marco.

**Regla explícita**: El marco de consulta controlada es canónico e inmodificable. Una vez aprobado, no admite reinterpretaciones ni extensiones.

### 11.2. Preparación para Fases Siguientes

La FASE 5.5 establece el marco de consulta controlada necesario para fases siguientes del BLOQUE 5. Las fases siguientes utilizarán este marco para definir cómo se implementan, procesan y ejecutan las consultas, cómo se garantiza la no-accionabilidad, y cómo se preserva la apagabilidad durante y después de las consultas.

La FASE 5.5 no anticipa ni desarrolla las fases siguientes. Solo establece el marco de consulta controlada que las fases siguientes utilizarán como base.

**Regla explícita**: La FASE 5.5 establece el marco de consulta controlada. Las fases siguientes utilizarán este marco para definir la implementación y procesamiento de consultas. No existe anticipación ni desarrollo de fases siguientes en este documento.

---

## 12. Frase Canónica de Cierre

**El BLOQUE 5 permite consulta controlada sobre evidencia mínima y eventos observables mediante operaciones de lectura exclusiva, determinísticas y acotadas que no generan efectos colaterales, no modifican estados, no disparan acciones y no comprometen la apagabilidad. Las consultas tienen límites explícitos de tiempo, recursos y alcance, y pueden ser interrumpidas en cualquier momento sin comprometer la operación del sistema. El sistema puede apagarse durante o después de cualquier consulta sin condiciones ni esperas. Las consultas son exclusivamente observacionales y no operativas, respetando estrictamente la política D0 y preservando la pasividad absoluta del BLOQUE 5. El marco de consulta controlada es canónico, exhaustivo e inmodificable.**

---

**Fin del documento**


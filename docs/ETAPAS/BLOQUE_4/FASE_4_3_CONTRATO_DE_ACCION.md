# FASE 4.3: Contrato de Acción

## 1. Propósito de la FASE 4.3

La FASE 4.3 establece el contrato canónico que toda acción ejecutable dentro del Modelo de Ejecución de Elixir debe cumplir. Este contrato define los límites, garantías y comportamientos esperados que permiten que las acciones sean ejecutadas de manera segura, predecible y abortable dentro del sistema.

### Por qué es necesario un contrato de acción

El contrato de acción es necesario porque:

- **Establece límites claros**: Define qué puede y qué no puede hacer una acción, evitando comportamientos no deseados o efectos secundarios inesperados.
- **Garantiza predecibilidad**: Permite que el sistema y sus operadores sepan exactamente qué esperar de cada acción en cualquier momento de su ejecución.
- **Habilita abortabilidad segura**: Asegura que toda acción puede ser interrumpida sin dejar el sistema en un estado inconsistente o corrupto.
- **Facilita la gobernanza**: Proporciona un marco normativo que permite auditar, validar y certificar acciones antes de su ejecución.

### Qué riesgos mitiga

El contrato de acción mitiga los siguientes riesgos:

- **Riesgo de estado inconsistente**: Acciones que modifican el estado del sistema de manera irreversible o parcial.
- **Riesgo de bloqueo**: Acciones que no pueden ser interrumpidas y bloquean recursos indefinidamente.
- **Riesgo de efectos secundarios no controlados**: Acciones que producen cambios fuera de su alcance declarado.
- **Riesgo de indeterminación**: Acciones cuyo resultado no puede ser determinado o validado.
- **Riesgo de dependencias ocultas**: Acciones que requieren condiciones o recursos no declarados explícitamente.

## 2. Definición del Contrato de Acción

### Qué es y para qué sirve

Un Contrato de Acción es la especificación normativa que define los términos bajo los cuales una acción puede ser ejecutada dentro del Modelo de Ejecución de Elixir. El contrato establece:

- La identidad única de la acción.
- Los requisitos mínimos para su inicio.
- Los inputs que requiere.
- El output que produce.
- Las condiciones bajo las cuales puede ser abortada.
- Las garantías que ofrece y las que no ofrece.

El contrato no describe cómo se implementa la acción, sino qué debe cumplir para ser considerada válida y ejecutable dentro del sistema.

### Relación con el Modelo de Ejecución

El Contrato de Acción es el elemento fundamental que permite que una acción sea aceptada por el Modelo de Ejecución. El modelo utiliza el contrato para:

- **Validar elegibilidad**: Determinar si una acción puede ser iniciada dadas las condiciones actuales del sistema.
- **Gestionar recursos**: Asignar y liberar recursos necesarios para la ejecución.
- **Monitorear cumplimiento**: Verificar que la acción se comporta según lo declarado en su contrato.
- **Gestionar interrupciones**: Aplicar políticas de aborto de manera segura y predecible.

El contrato actúa como el intermediario normativo entre la intención de ejecutar una acción y su ejecución efectiva dentro del modelo.

## 3. Componentes Mínimos del Contrato

Todo Contrato de Acción debe incluir, como mínimo, los siguientes componentes:

### Identidad de la acción

La identidad de la acción es un identificador único e inmutable que permite referenciar la acción de manera inequívoca dentro del sistema. Esta identidad debe ser:

- **Única**: No puede haber dos acciones con la misma identidad.
- **Inmutable**: Una vez establecida, no puede ser modificada.
- **Declarativa**: Debe expresar claramente la naturaleza de la acción sin ambigüedad.

La identidad no es un identificador técnico de implementación, sino una declaración conceptual de qué representa la acción.

### Inputs mínimos

El contrato debe declarar explícitamente todos los inputs que la acción requiere para su ejecución. Estos inputs son:

- **Necesarios**: Sin ellos, la acción no puede iniciarse.
- **Suficientes**: Con ellos, la acción puede ejecutarse completamente.
- **Declarados**: Todos los inputs deben estar explícitamente listados en el contrato.

Los inputs no incluyen dependencias implícitas, configuraciones globales no declaradas, o recursos que la acción asume pero no especifica.

### Output esperado

El contrato debe declarar el output que la acción produce al completarse exitosamente. Este output puede ser:

- **Output con contenido**: La acción produce datos, resultados, o modificaciones de estado que son parte del output declarado.
- **Output vacío**: La acción no produce contenido, pero su ejecución exitosa constituye el output en sí mismo.

En ambos casos, el contrato debe especificar claramente qué constituye el output y cómo puede ser validado.

### Condiciones de inicio

El contrato debe declarar las condiciones que deben cumplirse para que la acción pueda ser iniciada. Estas condiciones incluyen:

- **Precondiciones del sistema**: Estados, recursos, o configuraciones que el sistema debe tener.
- **Precondiciones de los inputs**: Validaciones que los inputs deben pasar.
- **Precondiciones de contexto**: Condiciones del entorno de ejecución que deben estar presentes.

Todas las condiciones deben ser verificables antes de iniciar la ejecución.

## 4. Límites y Garantías

### Alcance máximo permitido

El contrato debe declarar explícitamente el alcance máximo de lo que la acción puede hacer. Este alcance incluye:

- **Dominios que puede afectar**: Qué partes del sistema pueden ser modificadas o consultadas.
- **Recursos que puede utilizar**: Qué recursos del sistema están disponibles para la acción.
- **Tiempo máximo de ejecución**: Si aplica, el tiempo máximo que la acción puede tomar.

Cualquier efecto fuera del alcance declarado constituye una violación del contrato.

### Impacto esperado

El contrato debe declarar el impacto esperado de la acción, incluyendo:

- **Modificaciones de estado**: Qué cambios en el estado del sistema se esperan.
- **Efectos observables**: Qué efectos externos o internos son esperables.
- **Irreversibilidad**: Si algún efecto es irreversible, debe ser declarado explícitamente.

### Garantías que ofrece Elixir

Elixir garantiza que:

- **Cumplimiento del contrato**: Si una acción cumple su contrato, Elixir garantiza que será ejecutada según los términos del contrato.
- **Abortabilidad**: Toda acción puede ser abortada de manera segura en cualquier momento.
- **Aislamiento**: Las acciones no pueden interferir entre sí más allá de lo declarado en sus contratos.
- **Trazabilidad**: Toda ejecución de acción es registrada y puede ser auditada.

### Garantías que Elixir NO ofrece

Elixir explícitamente NO garantiza:

- **Éxito de la acción**: Elixir no garantiza que la acción completará exitosamente, solo que se ejecutará según su contrato.
- **Performance**: Elixir no garantiza tiempos de ejecución específicos más allá de los límites declarados.
- **Disponibilidad de recursos**: Elixir no garantiza que todos los recursos declarados estarán disponibles en todo momento.
- **Efectos fuera del contrato**: Cualquier efecto no declarado en el contrato no está garantizado ni protegido por Elixir.

## 5. Abortabilidad y Cancelación

### Condiciones obligatorias de abortado

Toda acción debe poder ser abortada bajo las siguientes condiciones obligatorias:

- **Solicitud explícita**: Cuando el sistema o un operador solicita explícitamente la cancelación.
- **Violación de límites**: Cuando la acción intenta exceder los límites declarados en su contrato.
- **Condiciones de seguridad**: Cuando se detectan condiciones que comprometen la seguridad del sistema.
- **Recursos insuficientes**: Cuando los recursos necesarios dejan de estar disponibles.

Estas condiciones son obligatorias y no pueden ser omitidas por ninguna acción.

### Comportamiento esperado ante cancelación

Cuando una acción es cancelada, debe:

- **Detenerse de manera segura**: Cesar toda actividad en un tiempo razonable.
- **Liberar recursos**: Liberar todos los recursos que había adquirido.
- **Reportar estado de cancelación**: Indicar claramente que fue cancelada y en qué estado quedó.
- **No dejar efectos parciales**: No dejar el sistema en un estado inconsistente debido a la cancelación.

El contrato debe declarar explícitamente cómo la acción maneja la cancelación y qué garantías ofrece en ese escenario.

### Relación con estados terminales

La cancelación de una acción debe resultar en un estado terminal válido según el Modelo de Ejecución. El contrato debe especificar:

- **Estado terminal resultante**: Qué estado terminal se alcanza tras la cancelación.
- **Transición válida**: Cómo la cancelación se alinea con las transiciones de estado permitidas.
- **Consistencia**: Cómo se asegura que el estado terminal es consistente con el estado previo a la cancelación.

## 6. Relación con los Estados de Ejecución

### Cómo el contrato se alinea con FASE 4.2

El Contrato de Acción debe estar completamente alineado con el Modelo de Estados de Ejecución definido en FASE 4.2. Esta alineación implica:

- **Estados declarados**: El contrato debe declarar explícitamente qué estados de ejecución puede alcanzar la acción.
- **Transiciones válidas**: El contrato debe especificar qué transiciones entre estados son válidas para la acción.
- **Estados terminales**: El contrato debe declarar qué estados terminales son posibles y bajo qué condiciones.

El contrato no redefine los estados, sino que declara cómo la acción se comporta dentro de ellos.

### Restricciones impuestas por el modelo de estados

El Modelo de Estados de Ejecución impone las siguientes restricciones al contrato:

- **No puede crear nuevos estados**: La acción solo puede utilizar los estados definidos en el modelo.
- **No puede saltar estados**: La acción debe seguir las transiciones válidas del modelo.
- **Debe alcanzar un estado terminal**: Toda acción debe eventualmente alcanzar un estado terminal válido.
- **Debe declarar su progreso**: El contrato debe permitir que el sistema determine en qué estado se encuentra la acción en cualquier momento.

Estas restricciones son inmutables y aplican a todas las acciones sin excepción.

## 7. Alineación con el Principio de Apagabilidad

### Cómo el contrato asegura interrupción segura

El Contrato de Acción asegura interrupción segura mediante:

- **Declaración explícita de puntos de interrupción**: El contrato debe declarar en qué puntos de su ejecución puede ser interrumpida de manera segura.
- **Tiempo máximo de interrupción**: El contrato debe especificar el tiempo máximo que puede tomar completar una interrupción segura.
- **Estado post-interrupción**: El contrato debe declarar en qué estado queda el sistema después de una interrupción.
- **Recuperación**: Si aplica, el contrato debe declarar cómo se puede recuperar o continuar después de una interrupción.

### Qué está explícitamente prohibido

El contrato explícitamente prohíbe:

- **Operaciones atómicas no interrumpibles**: Acciones que no pueden ser interrumpidas en ningún momento de su ejecución.
- **Bloqueos indefinidos**: Acciones que pueden bloquear recursos por tiempo indefinido sin posibilidad de interrupción.
- **Efectos irreversibles sin salvaguardas**: Efectos irreversibles que no pueden ser revertidos o compensados en caso de interrupción.
- **Dependencias de tiempo real crítico**: Dependencias que requieren respuesta en tiempo real y no pueden tolerar interrupciones.

Estas prohibiciones son absolutas y no pueden ser omitidas bajo ninguna circunstancia.

## 8. Exclusiones Explícitas

El Contrato de Acción explícitamente excluye:

### Qué NO puede formar parte de un contrato de acción

- **Lógica de negocio específica**: El contrato no especifica cómo se implementa la lógica de negocio, solo qué debe cumplir.
- **Detalles de implementación técnica**: El contrato no incluye detalles de cómo se implementa técnicamente la acción.
- **Configuraciones de infraestructura**: El contrato no especifica configuraciones de servidores, bases de datos, o infraestructura.
- **Señales o protocolos técnicos**: El contrato no define señales, eventos, o protocolos de comunicación técnicos.
- **Interfaces de usuario**: El contrato no incluye especificaciones de UI/UX o interacciones con usuarios finales.
- **Optimizaciones de performance**: El contrato no especifica optimizaciones, cachés, o estrategias de performance.
- **Mecanismos de persistencia**: El contrato no especifica cómo se persisten los datos, solo qué datos deben persistirse.
- **Estrategias de retry o recuperación de errores**: El contrato no especifica cómo se manejan reintentos o recuperación, solo qué debe garantizarse.

El contrato se mantiene en el nivel conceptual y normativo, dejando los detalles técnicos e implementativos para fases posteriores.

## 9. Cierre Canónico de la Fase

### Declaración explícita de cierre

La FASE 4.3 se considera cerrada cuando:

- **Contrato canónico establecido**: El Contrato de Acción ha sido definido de manera completa y normativa.
- **Alineación verificada**: El contrato está alineado con FASE 4.1 (Modelo de Ejecución) y FASE 4.2 (Estados de Ejecución).
- **Exclusiones clarificadas**: Las exclusiones y límites del contrato están explícitamente declarados.
- **Gobernanza definida**: Los mecanismos de validación y cumplimiento del contrato están establecidos.

Con el cierre de FASE 4.3, Elixir cuenta con un marco normativo completo que define cómo las acciones deben comportarse dentro del sistema, estableciendo los límites, garantías y restricciones que permiten una ejecución segura, predecible y gobernable.

### Preparación para FASE 4.4

La FASE 4.3 prepara el terreno para FASE 4.4 estableciendo:

- **Base normativa**: Un contrato claro que servirá como base para la implementación técnica.
- **Criterios de validación**: Criterios que permitirán validar que las implementaciones cumplen con el contrato.
- **Límites de diseño**: Restricciones que guiarán las decisiones de diseño en fases posteriores.
- **Marco de gobernanza**: Un marco que permitirá auditar y certificar acciones antes de su ejecución.

FASE 4.4 utilizará este contrato como referencia normativa para definir los mecanismos técnicos de implementación, validación y ejecución de acciones dentro del sistema Elixir.

---

**Estado del documento**: Canónico y normativo. Este documento define el Contrato de Acción como especificación final para FASE 4.3 del proyecto Elixir Platform.

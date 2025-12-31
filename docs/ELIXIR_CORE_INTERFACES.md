# ELIXIR CORE INTERFACES

## 1. Propósito

Este documento define los contratos formales de entrada y salida del Elixir Core. Establece los límites de interacción entre el Core y sus consumidores, garantizando que la superficie de contacto sea mínima, estable y predecible.

## 2. Principios de interfaz

Las interfaces del Elixir Core se rigen por los siguientes principios fundamentales:

- **Interfaces mínimas**: Solo se expone lo estrictamente necesario para la operación. Cualquier información adicional queda oculta.
- **Sin estado visible**: El Core no expone su estado interno. Los consumidores no pueden consultar balances, historiales o configuraciones.
- **Sin semántica de negocio expuesta**: Las reglas de negocio, los algoritmos de decisión y la lógica interna permanecen encapsulados.
- **Compatibles con evolución interna**: Las interfaces permiten que el Core evolucione sin afectar a los consumidores, manteniendo estabilidad en la superficie.

## 3. Interfaces de entrada (Inputs)

### 3.1. Desde Chat

El Chat envía al Core señales de intención mínima acompañadas de contexto de sesión efímero. El Core procesa estas señales sin requerir conocimiento del flujo conversacional ni del estado de la interfaz.

- **Señales de intención mínima**: Representaciones abstractas de acciones solicitadas, sin detalles de implementación ni contexto de UI.
- **Contexto de sesión efímero**: Información temporal necesaria para la evaluación, sin persistencia visible ni consulta posterior.

### 3.2. Desde Edge

El Edge solicita autorización de handoff cuando requiere transferir una conversación al Chat. Esta solicitud contiene únicamente los parámetros necesarios para la decisión de autorización.

- **Solicitud de autorización de handoff**: Petición formal que incluye identificadores y contexto mínimo requerido para evaluar la transferencia.

### 3.3. Desde el propio Core

El Core procesa señales internas acumuladas, conocidas como Nectar. Estas señales representan actividad interna que requiere procesamiento y ajuste de balances.

- **Señales internas acumuladas (Nectar)**: Representaciones de actividad interna que el Core procesa para mantener su estado y realizar ajustes necesarios.

## 4. Interfaces de salida (Outputs)

### 4.1. Hacia Chat

El Core responde al Chat con decisiones binarias de autorización. No se proporcionan explicaciones, razones ni detalles adicionales.

- **Autorizado / Denegado**: Respuesta binaria que indica si la acción solicitada puede proceder o no.
- **Sin explicación**: El Core no expone las razones de su decisión. La lógica de negocio permanece oculta.

### 4.2. Hacia Edge

El Core proporciona autorización de handoff con parámetros internos necesarios para la transferencia. Estos parámetros son opacos para el Edge y solo se utilizan para completar el handoff.

- **Autorización de handoff con parámetros internos**: Decisión positiva acompañada de datos técnicos requeridos para ejecutar la transferencia, sin exposición de lógica interna.

### 4.3. Internas

El Core realiza ajustes internos de consumo y balance de señales. Estas operaciones no son visibles externamente y forman parte del procesamiento interno del sistema.

- **Ajuste de consumo y balance de señales**: Operaciones internas que mantienen la coherencia del estado del Core sin exposición externa.

## 5. Invariantes del contrato

Los siguientes invariantes garantizan que el Core mantenga su encapsulación y no exponga detalles internos:

- **El Core no expone reglas**: Las reglas de negocio, políticas y algoritmos de decisión permanecen internos. Los consumidores no pueden consultarlas ni modificarlas.
- **El Core no expone estados**: Balances, historiales, configuraciones y cualquier representación del estado interno no son accesibles externamente.
- **El Core no expone señales**: Las señales internas, su procesamiento y acumulación no son visibles fuera del Core.
- **El Core no conoce UI ni copy**: El Core opera sin conocimiento de interfaces de usuario, textos, mensajes o cualquier elemento de presentación.

## 6. Manejo de errores

El manejo de errores en las interfaces del Core sigue un principio de simplicidad y ocultamiento:

- **Errores se expresan como denegación**: Cualquier condición de error, fallo o excepción se traduce en una respuesta de denegación. No se distinguen tipos de error externamente.
- **No se devuelven mensajes**: El Core no proporciona mensajes de error, códigos de estado detallados ni información diagnóstica a través de sus interfaces.
- **No hay retries automáticos visibles**: El Core no expone mecanismos de reintento. Los consumidores pueden implementar sus propias estrategias basándose únicamente en las respuestas de autorización o denegación.

## 7. Versionado del contrato

El versionado de las interfaces del Core sigue principios de estabilidad y compatibilidad:

- **Cambios solo por gobernanza**: Las modificaciones a las interfaces requieren proceso de gobernanza formal. No se realizan cambios arbitrarios ni experimentales.
- **Compatibilidad hacia atrás preferida**: Se prioriza mantener compatibilidad con versiones anteriores de las interfaces. Los cambios se realizan de forma aditiva cuando es posible.
- **Sin breaking changes visibles a capas superiores**: Las capas superiores no deben verse afectadas por cambios internos del Core. La estabilidad de la superficie de contacto es prioritaria.

## 8. Frase canónica de cierre

Las interfaces protegen al Core de la superficie.


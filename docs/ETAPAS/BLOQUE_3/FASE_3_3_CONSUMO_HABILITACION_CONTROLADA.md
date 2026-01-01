# FASE 3.3 — Consumo de Habilitación Controlada

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 3 — Habilitación Operativa Controlada  
**Fase**: FASE 3.3 — Consumo de Habilitación Controlada  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 3.3

### 1.1. Función Exacta del Consumo de Habilitación Controlada

La FASE 3.3 es el punto de consumo obligatorio en el BLOQUE 3 que permite a los sujetos consumidores acceder a la habilitación canónica emitida por la FASE 3.2, de manera pasiva, idempotente y desacoplada.

El consumo de habilitación controlada opera como un mecanismo de consulta pura que expone la habilitación canónica sin modificar estados, sin introducir efectos secundarios y sin requerir conocimiento de la lógica interna de evaluación o emisión. Su única responsabilidad es proporcionar acceso controlado a la habilitación canónica emitida: ENABLED, DISABLED o SUSPENDED.

### 1.2. Necesidad del Consumo de Habilitación Controlada

El consumo de habilitación controlada es necesario incluso cuando la FASE 3.2 ha emitido una habilitación canónica, porque:

1. **Separación de responsabilidades**: La FASE 3.1 evalúa, la FASE 3.2 emite y la FASE 3.3 consume. La separación entre emisión y consumo garantiza que el mecanismo de habilitación sea completo, controlable y desacoplado.

2. **Desacoplamiento de consumidores**: Los sujetos consumidores requieren acceso a la habilitación sin conocer la lógica de evaluación o emisión. El consumo controlado garantiza desacoplamiento mediante exposición canónica y limitada.

3. **Principio de apagabilidad transversal**: El sistema debe poder apagar el consumo de habilitación sin afectar la evaluación ni la emisión. El consumo controlado permite apagabilidad transversal mediante suspensión o revocación del acceso.

4. **Idempotencia y pasividad**: El consumo de habilitación debe ser idempotente y pasivo. Múltiples consultas de la misma habilitación deben producir el mismo resultado sin modificar estados ni introducir efectos secundarios.

5. **Límites de exposición**: El sistema requiere control explícito sobre qué información se expone a los consumidores. El consumo controlado garantiza límites de exposición mediante exposición canónica sin información interna.

6. **Garantía de no modificación**: Los consumidores no deben poder modificar, extender ni reinterpretar la habilitación emitida. El consumo controlado garantiza acceso de solo lectura a la habilitación canónica.

---

## 2. Relación con FASES 3.1 y 3.2

### 2.1. Dependencia Directa de la FASE 3.2

Esta fase tiene una dependencia directa y obligatoria de la FASE 3.2:

1. **Condición de consumo**: Esta fase solo puede consumir habilitación si la FASE 3.2 ha emitido una habilitación canónica (ENABLED, DISABLED o SUSPENDED). Si la FASE 3.2 no ha emitido habilitación, esta fase no puede proporcionar acceso a habilitación.

2. **Asunción de validez**: Esta fase asume que la habilitación emitida por la FASE 3.2 es válida, canónica y corresponde a una emisión completa. No re-evalúa estados, no consulta condiciones, no valida la habilitación emitida.

3. **Asunción de completitud**: Esta fase asume que la FASE 3.2 ha completado su emisión y ha emitido una habilitación canónica. No re-evalúa habilitación ni consulta estados de habilitación.

**Regla explícita**: Esta fase no puede proporcionar acceso a habilitación si la FASE 3.2 no ha emitido una habilitación canónica. La habilitación de la FASE 3.2 es prerrequisito absoluto para el consumo.

### 2.2. Separación de Responsabilidades con FASES 3.1 y 3.2

Esta fase se relaciona con las FASES 3.1 y 3.2 de la siguiente manera:

1. **División de responsabilidades**: La FASE 3.1 evalúa estados de habilitación y emite decisiones. La FASE 3.2 recibe decisiones y emite habilitaciones canónicas. La FASE 3.3 recibe habilitaciones y permite su consumo controlado. Cada fase tiene responsabilidades distintas y no se superponen.

2. **Respeto de invariantes**: Esta fase respeta los invariantes establecidos en las FASES 3.1 y 3.2 (fail-closed, apagabilidad, separación de responsabilidades, no exposición) sin modificarlos ni reinterpretarlos.

3. **No reinterpretación**: Esta fase no reinterpreta la habilitación recibida de la FASE 3.2. La habilitación se consume tal como fue emitida, sin modificación, extensión ni reinterpretación.

4. **Desacoplamiento**: Esta fase no requiere conocimiento de la lógica interna de evaluación (FASE 3.1) ni de emisión (FASE 3.2). Solo requiere acceso a la habilitación canónica emitida.

**Regla explícita**: Esta fase NO modifica, extiende ni reinterpreta la habilitación de la FASE 3.2. Solo permite su consumo controlado y desacoplado.

### 2.3. Independencia de la FASE 3.1

Esta fase es independiente de la FASE 3.1:

1. **Sin dependencia directa**: Esta fase no depende directamente de la FASE 3.1. Su dependencia es exclusivamente de la FASE 3.2, que ya consolidó la decisión de la FASE 3.1.

2. **Sin conocimiento de evaluación**: Esta fase no requiere conocimiento de cómo la FASE 3.1 evaluó estados de habilitación ni qué decisiones emitió. Solo requiere acceso a la habilitación canónica emitida por la FASE 3.2.

3. **Desacoplamiento completo**: El desacoplamiento entre consumo y evaluación garantiza que los consumidores no dependan de la lógica interna de evaluación.

**Regla explícita**: Esta fase NO depende de la FASE 3.1. Su única dependencia es de la FASE 3.2 y su habilitación canónica emitida.

---

## 3. Alcance Explícito

### 3.1. Qué Permite Esta Fase

Esta fase permite exclusivamente:

1. **Consumo de habilitación canónica**: Permite a los sujetos consumidores acceder a la habilitación canónica emitida por la FASE 3.2 (ENABLED, DISABLED o SUSPENDED).

2. **Consulta pasiva**: Permite consultas pasivas de la habilitación sin modificar estados, sin introducir efectos secundarios y sin requerir procesamiento activo.

3. **Acceso idempotente**: Permite múltiples consultas de la misma habilitación con resultados idénticos, garantizando idempotencia del consumo.

4. **Exposición controlada**: Expone la habilitación canónica con límites explícitos de exposición, sin revelar información interna sobre evaluación o emisión.

### 3.2. Qué NO Permite Bajo Ningún Concepto

Esta fase **NO** permite:

- ❌ **Modificación de habilitación**: No permite modificar, extender ni reinterpretar la habilitación emitida por la FASE 3.2. El consumo es de solo lectura.

- ❌ **Evaluación de estados de habilitación**: No evalúa estados de habilitación del usuario. Esta evaluación es responsabilidad de la FASE 3.1.

- ❌ **Emisión de habilitación**: No emite habilitaciones. La emisión es responsabilidad de la FASE 3.2.

- ❌ **Consulta de condiciones operativas**: No consulta condiciones operativas del sistema. Esta consulta es responsabilidad de la FASE 3.1.

- ❌ **Validación de habilitación**: No valida, verifica ni re-evalúa la habilitación recibida de la FASE 3.2. Asume que la habilitación es válida y canónica.

- ❌ **Evaluación de estados de registro**: No evalúa estados del BLOQUE 1 (INITIAL, PHONE_PENDING, OTP_PENDING, APPROVED, DENIED, FAILED, ABANDONED).

- ❌ **Evaluación de estados de cuenta**: No evalúa estados de cuenta del BLOQUE 1 (provisional, whatsapp_verified, age_verified, payment_enabled, operational).

- ❌ **Evaluación de decisiones del BLOQUE 2**: No evalúa decisiones del BLOQUE 2 (ALLOW, HOLD, DENY).

- ❌ **Procesamiento de contenido**: No procesa, examina, valida ni gestiona contenido de medios, imágenes o referencias externas.

- ❌ **Gestión de recursos**: No crea, modifica, consulta ni gestiona recursos externos, referencias o metadatos.

- ❌ **Ejecución de operaciones**: No ejecuta operaciones de visualización, acceso a medios ni funcionalidades del BLOQUE 3.

- ❌ **Aplicación de reglas de negocio**: No aplica reglas de negocio sobre permisos, restricciones o políticas de acceso.

- ❌ **Exposición de información interna**: No expone razones, estados internos, metadata ni información sobre el proceso de evaluación o emisión más allá de la habilitación canónica.

- ❌ **Persistencia de consultas**: No persiste, registra ni almacena consultas de habilitación más allá de lo necesario para el consumo inmediato.

**Regla explícita**: Esta fase tiene un alcance estrictamente limitado al consumo controlado de la habilitación canónica emitida por la FASE 3.2. Cualquier funcionalidad, evaluación o responsabilidad fuera de este alcance debe ser implementada en otras fases, no en esta fase.

---

## 4. Qué Permite y Qué NO Permite el Consumo

### 4.1. Qué Permite el Consumo

El consumo de habilitación permite exclusivamente:

1. **Acceso a habilitación canónica**: Permite a los sujetos consumidores acceder a la habilitación canónica emitida por la FASE 3.2 (ENABLED, DISABLED o SUSPENDED) para determinar si un usuario puede realizar operaciones del BLOQUE 3.

2. **Consulta idempotente**: Permite múltiples consultas de la misma habilitación con resultados idénticos, garantizando que el consumo no modifique estados ni introduzca efectos secundarios.

3. **Desacoplamiento de consumidores**: Permite que los consumidores accedan a la habilitación sin conocer la lógica de evaluación o emisión, garantizando desacoplamiento mediante exposición canónica.

4. **Apagabilidad del consumo**: Permite que el sistema pueda suspender o revocar el acceso a la habilitación sin afectar la evaluación ni la emisión, garantizando apagabilidad transversal.

### 4.2. Qué NO Permite el Consumo

El consumo de habilitación **NO** permite:

- ❌ **Modificación de habilitación**: No permite modificar, extender ni reinterpretar la habilitación emitida. El consumo es de solo lectura.

- ❌ **Evaluación de habilitación**: No permite evaluar estados de habilitación. La evaluación es responsabilidad de la FASE 3.1.

- ❌ **Emisión de habilitación**: No permite emitir habilitaciones. La emisión es responsabilidad de la FASE 3.2.

- ❌ **Operaciones del BLOQUE 3**: No permite ejecutar operaciones de visualización, acceso a medios ni funcionalidades del BLOQUE 3. Solo permite consultar la habilitación que determina si las operaciones pueden proceder.

- ❌ **Procesamiento de contenido**: No permite procesar, validar ni gestionar contenido de medios.

- ❌ **Gestión de recursos**: No permite crear, modificar ni gestionar recursos externos o metadatos.

- ❌ **Funcionalidades de negocio**: No permite aplicar funcionalidades de negocio, reglas de permisos ni políticas de acceso.

- ❌ **Operaciones de otros bloques**: No permite operaciones del BLOQUE 1, BLOQUE 2 ni bloques futuros.

- ❌ **Exposición de información interna**: No permite exponer razones, estados internos ni información sobre el proceso de evaluación o emisión más allá de la habilitación canónica.

- ❌ **Persistencia de consultas**: No permite persistir, registrar ni almacenar consultas de habilitación más allá de lo necesario para el consumo inmediato.

**Regla explícita**: El consumo solo permite acceso de solo lectura a la habilitación canónica. No permite modificación, evaluación, emisión ni operaciones fuera del alcance del consumo controlado.

---

## 5. Sujetos Consumidores de la Habilitación

### 5.1. Definición de Sujetos Consumidores

Los sujetos consumidores son componentes, sistemas o procesos que requieren acceso a la habilitación canónica emitida por la FASE 3.2 para determinar si un usuario puede realizar operaciones del BLOQUE 3.

### 5.2. Características de los Sujetos Consumidores

Los sujetos consumidores se caracterizan por:

1. **Desacoplamiento**: No requieren conocimiento de la lógica interna de evaluación (FASE 3.1) ni de emisión (FASE 3.2). Solo requieren acceso a la habilitación canónica.

2. **Pasividad**: Realizan consultas pasivas de la habilitación sin modificar estados ni introducir efectos secundarios.

3. **Idempotencia**: Pueden realizar múltiples consultas de la misma habilitación con resultados idénticos.

4. **Respeto de límites**: Respetan los límites de exposición establecidos y no requieren información interna más allá de la habilitación canónica.

### 5.3. Tipos de Sujetos Consumidores

Los sujetos consumidores pueden ser:

1. **Componentes del BLOQUE 3**: Componentes internos del BLOQUE 3 que requieren conocer la habilitación para determinar si pueden proceder con operaciones específicas.

2. **Sistemas externos**: Sistemas externos que requieren conocer la habilitación para coordinar operaciones o aplicar políticas de acceso.

3. **Procesos de orquestación**: Procesos de orquestación que requieren conocer la habilitación para determinar el flujo de operaciones.

4. **Mecanismos de control**: Mecanismos de control que requieren conocer la habilitación para aplicar restricciones o políticas.

**Regla explícita**: Todos los sujetos consumidores deben respetar el contrato de consumo establecido por esta fase. No pueden modificar, extender ni reinterpretar la habilitación. Solo pueden consumirla de manera pasiva e idempotente.

### 5.4. Restricciones para Sujetos Consumidores

Los sujetos consumidores están sujetos a las siguientes restricciones:

1. **Solo lectura**: El consumo es de solo lectura. No se permite modificación, extensión ni reinterpretación de la habilitación.

2. **Sin efectos secundarios**: El consumo no debe introducir efectos secundarios. Las consultas deben ser pasivas e idempotentes.

3. **Respeto de límites**: Los consumidores deben respetar los límites de exposición establecidos y no requerir información interna más allá de la habilitación canónica.

4. **Sin dependencias internas**: Los consumidores no deben depender de la lógica interna de evaluación o emisión. Solo deben depender de la habilitación canónica.

**Regla explícita**: Cualquier violación de estas restricciones invalida el consumo y puede resultar en suspensión o revocación del acceso a la habilitación.

---

## 6. Información Expuesta y Límites de Exposición

### 6.1. Información Expuesta

Esta fase expone exclusivamente:

1. **Habilitación canónica**: La habilitación canónica emitida por la FASE 3.2 (ENABLED, DISABLED o SUSPENDED). Esta es la única información expuesta a los sujetos consumidores.

2. **Identificación de usuario**: La identificación mínima necesaria para asociar la habilitación con el usuario correspondiente, sin exponer información personal ni estados internos.

### 6.2. Límites de Exposición

Esta fase establece límites explícitos de exposición:

1. **Sin información interna**: No expone razones, estados internos, metadata ni información sobre el proceso de evaluación (FASE 3.1) o emisión (FASE 3.2).

2. **Sin información de evaluación**: No expone cómo se evaluaron los estados de habilitación, qué condiciones se consultaron ni qué decisiones se emitieron durante la evaluación.

3. **Sin información de emisión**: No expone cómo se emitió la habilitación, qué decisiones se recibieron ni qué proceso se siguió durante la emisión.

4. **Sin información de estados**: No expone estados de registro (BLOQUE 1), estados de cuenta (BLOQUE 1) ni decisiones del BLOQUE 2.

5. **Sin información de transiciones**: No expone transiciones previas entre estados de habilitación, historial de cambios ni evolución temporal de la habilitación.

6. **Sin información de condiciones**: No expone condiciones operativas, límites de sistema ni restricciones que afectaron la evaluación o emisión.

**Regla explícita**: La exposición se limita estrictamente a la habilitación canónica y la identificación mínima necesaria. Cualquier información adicional está prohibida y no se expone bajo ningún concepto.

### 6.3. Garantías de No Exposición

Esta fase garantiza:

1. **Exposición canónica**: Solo se expone la habilitación canónica (ENABLED, DISABLED o SUSPENDED) sin información adicional.

2. **Exposición determinista**: La exposición es determinista. Dada la misma habilitación emitida por la FASE 3.2, la exposición es siempre la misma.

3. **Exposición sin metadata**: La exposición no incluye metadata, razones, estados internos ni información sobre el proceso de evaluación o emisión.

4. **Exposición controlada**: La exposición está controlada mediante límites explícitos que garantizan que no se revele información interna.

**Regla explícita**: La exposición está estrictamente limitada y controlada. No se expone información interna bajo ningún concepto, incluso si los consumidores la solicitan o la requieren.

---

## 7. Carácter Pasivo e Idempotente del Consumo

### 7.1. Carácter Pasivo del Consumo

El consumo de habilitación es pasivo:

1. **Sin modificación de estados**: El consumo no modifica estados de habilitación, estados de usuario ni estados del sistema. Las consultas son de solo lectura.

2. **Sin efectos secundarios**: El consumo no introduce efectos secundarios. Las consultas no afectan la evaluación, la emisión ni el estado del sistema.

3. **Sin procesamiento activo**: El consumo no requiere procesamiento activo. Las consultas son directas y no requieren evaluación, cálculo ni transformación.

4. **Sin persistencia**: El consumo no persiste, registra ni almacena consultas más allá de lo necesario para el consumo inmediato.

**Regla explícita**: El consumo es estrictamente pasivo. No modifica estados, no introduce efectos secundarios y no requiere procesamiento activo.

### 7.2. Carácter Idempotente del Consumo

El consumo de habilitación es idempotente:

1. **Resultados idénticos**: Múltiples consultas de la misma habilitación producen resultados idénticos. No hay variabilidad, aleatoriedad ni dependencia del orden de consultas.

2. **Sin estado de consulta**: El consumo no mantiene estado de consultas. Cada consulta es independiente y no afecta consultas futuras.

3. **Determinismo**: El consumo es determinista. Dada la misma habilitación emitida por la FASE 3.2, el resultado del consumo es siempre el mismo, independientemente del número de consultas o del momento en que se realizan.

4. **Reversibilidad de consultas**: Las consultas no modifican la habilitación ni el estado del sistema. El consumo puede realizarse múltiples veces sin consecuencias.

**Regla explícita**: El consumo es estrictamente idempotente. Múltiples consultas de la misma habilitación producen resultados idénticos sin modificar estados ni introducir efectos secundarios.

### 7.3. Garantías de Pasividad e Idempotencia

Esta fase garantiza:

1. **Pasividad garantizada**: El consumo no modifica estados ni introduce efectos secundarios, independientemente del número de consultas o de los sujetos consumidores.

2. **Idempotencia garantizada**: El consumo produce resultados idénticos para consultas idénticas, garantizando que múltiples consultas no afecten el estado del sistema.

3. **Aislamiento de consultas**: Las consultas están aisladas entre sí. Una consulta no afecta otras consultas, ni siquiera consultas simultáneas del mismo o diferentes consumidores.

4. **Consistencia de resultados**: Los resultados del consumo son consistentes. Dada la misma habilitación, todos los consumidores reciben el mismo resultado.

**Regla explícita**: La pasividad e idempotencia están garantizadas en todas las circunstancias. No existen excepciones ni casos especiales que permitan modificación de estados o efectos secundarios.

---

## 8. Garantías de Desacoplamiento

### 8.1. Desacoplamiento de la FASE 3.1

Esta fase garantiza desacoplamiento completo de la FASE 3.1:

1. **Sin dependencia directa**: Esta fase no depende directamente de la FASE 3.1. Su dependencia es exclusivamente de la FASE 3.2 y su habilitación canónica emitida.

2. **Sin conocimiento de evaluación**: Esta fase no requiere conocimiento de cómo la FASE 3.1 evaluó estados de habilitación, qué condiciones consultó ni qué decisiones emitió.

3. **Sin exposición de evaluación**: Esta fase no expone información sobre el proceso de evaluación de la FASE 3.1. Los consumidores no tienen acceso a información sobre evaluación.

4. **Independencia funcional**: El consumo puede funcionar independientemente de la lógica interna de evaluación. Cambios en la FASE 3.1 no afectan el consumo mientras la FASE 3.2 siga emitiendo habilitaciones canónicas.

**Regla explícita**: El consumo está completamente desacoplado de la FASE 3.1. No existe dependencia funcional, lógica ni informacional con la FASE 3.1.

### 8.2. Desacoplamiento de la FASE 3.2

Esta fase garantiza desacoplamiento controlado de la FASE 3.2:

1. **Dependencia única de habilitación**: Esta fase depende exclusivamente de la habilitación canónica emitida por la FASE 3.2, no de su lógica interna de emisión.

2. **Sin conocimiento de emisión**: Esta fase no requiere conocimiento de cómo la FASE 3.2 recibió decisiones, cómo las procesó ni cómo emitió habilitaciones.

3. **Sin exposición de emisión**: Esta fase no expone información sobre el proceso de emisión de la FASE 3.2. Los consumidores no tienen acceso a información sobre emisión.

4. **Independencia de implementación**: El consumo puede funcionar independientemente de la implementación interna de la FASE 3.2, siempre que se mantenga el contrato de emisión de habilitación canónica.

**Regla explícita**: El consumo está desacoplado de la lógica interna de la FASE 3.2. Solo depende del contrato de emisión de habilitación canónica, no de su implementación.

### 8.3. Desacoplamiento de Consumidores

Esta fase garantiza desacoplamiento de los sujetos consumidores:

1. **Interfaz canónica única**: Los consumidores acceden a la habilitación mediante una interfaz canónica única que no expone información interna.

2. **Sin dependencias internas**: Los consumidores no dependen de la lógica interna de evaluación, emisión ni consumo. Solo dependen de la habilitación canónica.

3. **Sin acoplamiento temporal**: Los consumidores no están acoplados temporalmente a la evaluación o emisión. Pueden consumir la habilitación en cualquier momento después de su emisión.

4. **Sin acoplamiento de implementación**: Los consumidores no están acoplados a la implementación interna del consumo. Pueden acceder a la habilitación mediante la interfaz canónica sin conocer detalles de implementación.

**Regla explícita**: Los consumidores están completamente desacoplados de la lógica interna del BLOQUE 3. Solo dependen de la habilitación canónica y la interfaz de consumo.

### 8.4. Garantías de Desacoplamiento Sistémico

Esta fase garantiza desacoplamiento sistémico:

1. **Separación de responsabilidades**: La evaluación (FASE 3.1), emisión (FASE 3.2) y consumo (FASE 3.3) están completamente separadas. Cada fase tiene responsabilidades distintas y no se superponen.

2. **Contratos explícitos**: Los contratos entre fases son explícitos y canónicos. No existen dependencias implícitas ni acoplamientos ocultos.

3. **Independencia de cambios**: Cambios en una fase no afectan otras fases mientras se mantengan los contratos establecidos.

4. **Modularidad**: El mecanismo de habilitación es modular. Cada fase puede evolucionar independientemente mientras respete los contratos establecidos.

**Regla explícita**: El desacoplamiento es un principio fundamental del BLOQUE 3. Todas las fases están desacopladas y solo se comunican mediante contratos explícitos y canónicos.

---

## 9. Garantías de Apagabilidad Transversal

### 9.1. Apagabilidad del Consumo

Esta fase garantiza apagabilidad del consumo:

1. **Suspensión de consumo**: El sistema puede suspender el consumo de habilitación sin afectar la evaluación (FASE 3.1) ni la emisión (FASE 3.2). Los consumidores pueden quedar sin acceso a la habilitación mientras la evaluación y emisión continúan funcionando.

2. **Revocación de consumo**: El sistema puede revocar el acceso a la habilitación sin afectar la evaluación ni la emisión. Los consumidores pueden quedar sin acceso permanente mientras la evaluación y emisión continúan funcionando.

3. **Apagabilidad selectiva**: El sistema puede suspender o revocar el acceso para consumidores específicos sin afectar otros consumidores ni la evaluación o emisión.

4. **Apagabilidad inmediata**: El sistema puede suspender o revocar el acceso inmediatamente, sin requerir procesamiento adicional ni esperar condiciones específicas.

**Regla explícita**: El consumo es apagable de forma independiente de la evaluación y emisión. La apagabilidad del consumo no afecta la operatividad de las fases anteriores.

### 9.2. Apagabilidad Transversal del BLOQUE 3

Esta fase garantiza apagabilidad transversal del BLOQUE 3:

1. **Apagabilidad independiente por fase**: Cada fase (FASE 3.1, FASE 3.2, FASE 3.3) puede apagarse independientemente sin afectar las otras fases. La evaluación puede apagarse sin afectar emisión o consumo. La emisión puede apagarse sin afectar evaluación o consumo. El consumo puede apagarse sin afectar evaluación o emisión.

2. **Apagabilidad completa del BLOQUE 3**: El BLOQUE 3 completo puede apagarse mediante apagado de todas sus fases, garantizando que no queden operaciones en curso ni estados inconsistentes.

3. **Apagabilidad sin pérdida de control**: El apagado de una fase no compromete el control del sistema. El sistema puede apagar y volver a encender fases según sea necesario, manteniendo control total sobre la operatividad.

4. **Apagabilidad continua**: El sistema sigue siendo apagable aunque ya existan usuarios válidos, habilitaciones emitidas y consumidores activos. La apagabilidad no se compromete por el estado operativo del sistema.

**Regla explícita**: La apagabilidad transversal es un principio fundamental del BLOQUE 3. Cada fase es apagable independientemente y el BLOQUE 3 completo es apagable como unidad.

### 9.3. Apagabilidad mediante Fail-Closed

Esta fase garantiza apagabilidad mediante fail-closed:

1. **Fallo en consumo resulta en apagado**: Ante cualquier fallo, error o condición que impida el consumo de habilitación, el acceso queda suspendido o revocado, garantizando apagabilidad mediante fail-closed.

2. **Fallo en acceso resulta en apagado**: Ante cualquier fallo en el acceso a la habilitación emitida por la FASE 3.2, el consumo queda suspendido, garantizando que los consumidores no accedan a información inconsistente o inválida.

3. **Fallo en exposición resulta en apagado**: Ante cualquier fallo en la exposición de habilitación, el consumo queda suspendido, garantizando que no se exponga información incorrecta o inconsistente.

4. **Prioridad de apagabilidad**: La apagabilidad tiene prioridad absoluta sobre la disponibilidad. Ante cualquier ambigüedad o incertidumbre, el consumo se apaga en lugar de asumir continuidad.

**Regla explícita**: El principio fail-closed garantiza apagabilidad del consumo. Cualquier fallo, error o ambigüedad resulta en suspensión o revocación del acceso, no en continuidad asumida.

### 9.4. Apagabilidad sin Afectación de Bloques Anteriores

Esta fase garantiza que la apagabilidad del consumo no afecta bloques anteriores:

1. **Sin afectación del BLOQUE 1**: El apagado del consumo no afecta el BLOQUE 1. Los estados de registro, estados de cuenta y operaciones del BLOQUE 1 continúan funcionando independientemente.

2. **Sin afectación del BLOQUE 2**: El apagado del consumo no afecta el BLOQUE 2. Las decisiones del BLOQUE 2 y su emisión continúan funcionando independientemente.

3. **Sin afectación de identidad**: El apagado del consumo no afecta la identidad del usuario ni su capacidad de proceder en bloques anteriores. El usuario mantiene su identidad y capacidad de proceder en BLOQUE 1 y BLOQUE 2.

4. **Separación de apagabilidad**: La apagabilidad del consumo está separada de la apagabilidad de bloques anteriores. Cada bloque puede apagarse independientemente sin afectar otros bloques.

**Regla explícita**: La apagabilidad del consumo es independiente de bloques anteriores. El apagado del consumo no afecta la operatividad de BLOQUE 1 ni BLOQUE 2.

---

## 10. Riesgos Conocidos y Controles

### 10.1. Riesgos Identificados

1. **Riesgo de modificación de habilitación por consumidores**
   - **Descripción**: Los consumidores podrían intentar modificar, extender o reinterpretar la habilitación emitida por la FASE 3.2.
   - **Control**: El consumo es de solo lectura. No se permite modificación, extensión ni reinterpretación. Cualquier intento de modificación resulta en suspensión o revocación del acceso.

2. **Riesgo de exposición de información interna**
   - **Descripción**: El consumo podría exponer información interna sobre evaluación, emisión o estados del sistema más allá de la habilitación canónica.
   - **Control**: Los límites de exposición están explícitamente definidos. Solo se expone la habilitación canónica y la identificación mínima necesaria. No se expone información interna bajo ningún concepto.

3. **Riesgo de efectos secundarios en el consumo**
   - **Descripción**: El consumo podría introducir efectos secundarios, modificar estados o requerir procesamiento activo que afecte el sistema.
   - **Control**: El consumo es estrictamente pasivo e idempotente. No modifica estados, no introduce efectos secundarios y no requiere procesamiento activo.

4. **Riesgo de acoplamiento entre fases**
   - **Descripción**: El consumo podría acoplarse a la lógica interna de evaluación (FASE 3.1) o emisión (FASE 3.2), comprometiendo el desacoplamiento.
   - **Control**: El consumo está completamente desacoplado. Solo depende de la habilitación canónica emitida por la FASE 3.2, no de su lógica interna.

5. **Riesgo de falta de apagabilidad transversal**
   - **Descripción**: El consumo podría no ser apagable de forma independiente, comprometiendo la apagabilidad transversal del BLOQUE 3.
   - **Control**: El consumo es apagable de forma independiente de la evaluación y emisión. La apagabilidad transversal está garantizada mediante suspensión o revocación del acceso.

6. **Riesgo de consumo no idempotente**
   - **Descripción**: Múltiples consultas de la misma habilitación podrían producir resultados diferentes o introducir efectos secundarios.
   - **Control**: El consumo es estrictamente idempotente. Múltiples consultas de la misma habilitación producen resultados idénticos sin modificar estados.

### 10.2. Controles Implementados

1. **Control de solo lectura**: El consumo es de solo lectura. No se permite modificación, extensión ni reinterpretación de la habilitación.

2. **Control de límites de exposición**: Los límites de exposición están explícitamente definidos y controlados. Solo se expone la habilitación canónica sin información interna.

3. **Control de pasividad e idempotencia**: El consumo es estrictamente pasivo e idempotente. No modifica estados, no introduce efectos secundarios y produce resultados idénticos para consultas idénticas.

4. **Control de desacoplamiento**: El consumo está completamente desacoplado de la lógica interna de evaluación y emisión. Solo depende de la habilitación canónica.

5. **Control de apagabilidad transversal**: El consumo es apagable de forma independiente. La apagabilidad transversal está garantizada mediante suspensión o revocación del acceso.

6. **Control de fail-closed**: Ante cualquier fallo, error o ambigüedad, el consumo se apaga en lugar de asumir continuidad, garantizando apagabilidad mediante fail-closed.

---

## 11. Criterios de Cierre de la FASE 3.3

### 11.1. Criterios de Cierre

La FASE 3.3 se considera cerrada cuando:

1. **Mecanismo de consumo definido**: El mecanismo de consumo de habilitación controlada está completamente definido con reglas de acceso, exposición y límites establecidas.

2. **Carácter pasivo e idempotente garantizado**: El carácter pasivo e idempotente del consumo está garantizado y documentado. No se permiten modificaciones de estado ni efectos secundarios.

3. **Garantías de desacoplamiento establecidas**: Las garantías de desacoplamiento de la FASE 3.1, FASE 3.2 y consumidores están establecidas y documentadas.

4. **Garantías de apagabilidad transversal establecidas**: Las garantías de apagabilidad del consumo y apagabilidad transversal del BLOQUE 3 están establecidas y documentadas.

5. **Límites de exposición definidos**: Los límites de exposición están explícitamente definidos y documentados. Solo se expone la habilitación canónica sin información interna.

6. **Sujetos consumidores identificados**: Los sujetos consumidores y sus restricciones están identificados y documentados.

7. **Riesgos y controles documentados**: Los riesgos conocidos y controles implementados están documentados.

8. **Contrato de consumo establecido**: El contrato de consumo hacia consumidores está establecido y documentado.

### 11.2. Condiciones para Cierre del BLOQUE 3

La FASE 3.3 completa el BLOQUE 3 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre de la FASE 3.3 están satisfechos.

2. **Mecanismo completo de habilitación operativo**: El mecanismo completo de habilitación operativa controlada (evaluación, emisión y consumo) está operativo y puede proporcionar acceso controlado a la habilitación canónica.

3. **Garantías sistémicas verificadas**: Las garantías de desacoplamiento, apagabilidad transversal y límites de exposición están verificadas y funcionando según lo documentado.

4. **Separación de responsabilidades mantenida**: La separación entre evaluación (FASE 3.1), emisión (FASE 3.2) y consumo (FASE 3.3) está establecida y funcionando correctamente.

**Regla explícita**: El cierre del BLOQUE 3 requiere cumplimiento explícito de todos los criterios de cierre de la FASE 3.3 y verificación de que el mecanismo completo de habilitación está operativo. No existe cierre automático ni implícito.

---

## 12. Cierre del Documento

**Regla de consumo**: La habilitación consumida por esta fase determina si los sujetos consumidores pueden proceder con operaciones del BLOQUE 3 basadas en la habilitación canónica emitida por la FASE 3.2.

- Si esta fase consume **ENABLED** (basada en habilitación ENABLED de la FASE 3.2), los consumidores pueden proceder con operaciones del BLOQUE 3 basadas en la habilitación.

- Si esta fase consume **SUSPENDED** (basada en habilitación SUSPENDED de la FASE 3.2), los consumidores no pueden proceder con operaciones del BLOQUE 3. Las operaciones quedan suspendidas hasta que la FASE 3.2 emita una nueva habilitación.

- Si esta fase consume **DISABLED** (basada en habilitación DISABLED de la FASE 3.2 o fallo que impide el consumo), los consumidores no pueden proceder con operaciones del BLOQUE 3. Las operaciones terminan en esta fase.

El consumo de habilitación por esta fase es definitivo para determinar si los consumidores pueden proceder con operaciones del BLOQUE 3 según el mecanismo de habilitación operativa controlada. No hay mecanismo de apelación, bypass ni omisión de esta fase.

La FASE 3.3 queda conceptualmente cerrada y completa el BLOQUE 3 de Habilitación Operativa Controlada.

---

**Fin del documento**

# FASE 5.6 — Marco Canónico de Apagabilidad Total y Retención Cero

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada  
**Fase**: FASE 5.6 — Marco Canónico de Apagabilidad Total y Retención Cero  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 5.6

### 1.1. Función Exacta del Marco de Apagabilidad Total y Retención Cero

La FASE 5.6 define el **marco canónico de apagabilidad total y retención cero** aplicable al BLOQUE 5. Establece qué significa "apagabilidad" en el contexto del BLOQUE 5, qué significa "retención cero" de eventos y evidencia, y qué reglas normativas rigen el apagado del sistema sin comprometer la operación ni generar estados intermedios.

Este marco opera bajo el principio rector de que **el sistema debe poder apagarse completamente en cualquier momento, sin condiciones, sin esperas, sin preservación de estado, y sin que ningún componente del BLOQUE 5 impida, retrase o condicione el apagado**.

### 1.2. Necesidad del Marco de Apagabilidad Total y Retención Cero

El marco de apagabilidad total y retención cero es necesario incluso cuando las FASES 5.1 a 5.5 han establecido eventos observables, evidencia mínima, registro pasivo, comportamiento ante fallos y límites de trazabilidad, porque:

1. **Definición formal de apagabilidad**: El sistema requiere una definición formal y canónica de qué significa "apagabilidad" en el contexto específico del BLOQUE 5, distinguiéndola de apagabilidad general del sistema.

2. **Definición formal de retención cero**: El sistema requiere una definición formal y canónica de qué significa "retención cero" de eventos y evidencia, estableciendo que no existe obligación de preservar información después del apagado.

3. **Reglas normativas de apagado**: El sistema requiere reglas normativas claras que establezcan cómo debe comportarse el BLOQUE 5 durante el apagado, sin ambigüedades ni interpretaciones.

4. **Invariantes obligatorios durante apagado**: El sistema requiere invariantes obligatorios que garanticen que el apagado no genere estados intermedios, no preserve buffers pendientes, ni requiera cierre limpio de registro.

5. **Prevención de impedimentos al apagado**: El sistema requiere garantías explícitas de que ningún componente del BLOQUE 5 puede impedir, retrasar o condicionar el apagado del sistema.

6. **Cumplimiento del principio rector**: El sistema requiere que el principio rector de apagabilidad sea aplicable de forma canónica y verificable al BLOQUE 5.

### 1.3. Riesgos que Mitiga

El marco de apagabilidad total y retención cero mitiga los siguientes riesgos:

1. **Riesgo de apagado condicionado**: Sin reglas normativas claras, el apagado podría estar condicionado a completar registro, preservar buffers o cerrar conexiones, comprometiendo la apagabilidad total.

2. **Riesgo de estados intermedios**: Sin invariantes obligatorios, el apagado podría generar estados intermedios que comprometan la integridad del sistema o requieran recuperación.

3. **Riesgo de retención implícita**: Sin definición formal de retención cero, el sistema podría retener eventos o evidencia implícitamente, comprometiendo la política de no custodia.

4. **Riesgo de impedimentos al apagado**: Sin garantías explícitas, componentes del BLOQUE 5 podrían impedir, retrasar o condicionar el apagado, comprometiendo la apagabilidad total.

5. **Riesgo de interpretaciones ambiguas**: Sin marco canónico, diferentes interpretaciones de apagabilidad y retención cero podrían introducir inconsistencias o compromisos.

6. **Riesgo de dependencias ocultas**: Sin marco explícito, podrían introducirse dependencias ocultas entre apagado y registro que comprometan la apagabilidad.

---

## 2. Contexto Canónico

### 2.1. Principios Fundamentales

Este documento define el marco canónico de apagabilidad total y retención cero en Elixir Platform. El marco es:

- **Declarativo**: Define qué significa apagabilidad y retención cero, no cómo se implementan técnicamente
- **Normativo**: Establece reglas obligatorias que todo apagado debe respetar
- **Canónico**: Es la única fuente de verdad para el marco de apagabilidad y retención cero
- **Inmodificable**: Una vez aprobado, no admite reinterpretaciones ni extensiones
- **Incondicional**: Establece que el apagado es incondicional e inmediato
- **Sin excepciones**: Garantiza que no existen excepciones ni condiciones al apagado

### 2.2. Relación con Fases Previas

Este documento se basa en:

- **FASE 5.1 (Marco de Eventos Observables)**: Establece qué eventos son observables y cómo se relacionan con el BLOQUE 4
- **FASE 5.2 (Modelo de Evidencia Mínima)**: Establece qué constituye evidencia válida de eventos observables
- **FASE 5.3 (Comportamiento ante Fallos de Registro)**: Establece que el registro es prescindible y no puede comprometer la apagabilidad
- **FASE 5.4 (Límites Formales de Trazabilidad)**: Establece que la trazabilidad es opcional y no puede bloquear el apagado
- **FASE 5.5**: (Si existe, se referencia aquí)

La FASE 5.6 extiende estas fases agregando el marco canónico de apagabilidad total y retención cero, sin modificar ni reinterpretar las fases anteriores.

### 2.3. Invariantes Globales

El marco de apagabilidad total y retención cero respeta los mismos invariantes fundamentales definidos en fases anteriores:

1. **D0 (Elixir no custodia datos)**: La retención cero garantiza que no existe custodia de datos después del apagado
2. **Default Deny**: El apagado es la negación por defecto de toda operación del BLOQUE 5
3. **Apagabilidad**: La apagabilidad es el principio rector obligatorio que rige todo el BLOQUE 5
4. **Pasividad absoluta**: El apagado es pasivo y no genera efectos operativos más allá de la cesación de observación

### 2.4. Restricciones Inmutables

Esta fase opera bajo las siguientes restricciones inmutables:

- **Elixir Core está SELLADO e INMODIFICABLE**: El marco de apagabilidad no puede modificar, extender ni reinterpretar Elixir Core
- **WAM existe solo como transporte**: El marco de apagabilidad no puede modificar, extender ni reinterpretar WAM
- **Política D0 cerrada**: El marco de apagabilidad debe cumplir estrictamente con la política D0 mediante retención cero
- **BLOQUES 1 a 4 están COMPLETAMENTE CERRADOS**: El marco de apagabilidad no puede modificar, extender ni reinterpretar los BLOQUES 1 a 4
- **BLOQUE 5 solo OBSERVA**: El BLOQUE 5 no decide, no controla, no modifica. Solo observa y, al apagarse, cesa de observar

---

## 3. Definición Formal de Apagabilidad en el BLOQUE 5

### 3.1. Qué es Apagabilidad en el BLOQUE 5

**Apagabilidad** en el BLOQUE 5 es la capacidad del sistema de cesar completamente toda observación, registro y trazabilidad en cualquier momento, sin condiciones, sin esperas, sin preservación de estado, y sin que ningún componente del BLOQUE 5 impida, retrase o condicione el apagado del sistema.

La apagabilidad en el BLOQUE 5 es:

1. **Total**: El apagado es completo e inmediato. No existe apagado parcial ni gradual.

2. **Incondicional**: El apagado no requiere condiciones previas, no espera completar operaciones, no requiere cierre limpio.

3. **Inmediato**: El apagado ocurre sin demora, sin tiempo de espera, sin período de transición.

4. **Sin preservación**: El apagado no preserva buffers pendientes, no guarda estado intermedio, no completa registro en curso.

5. **Sin efectos secundarios**: El apagado no genera estados intermedios, no requiere recuperación, no deja residuos operativos.

6. **Sin impedimentos**: Ningún componente del BLOQUE 5 puede impedir, retrasar o condicionar el apagado.

**Regla explícita**: La apagabilidad en el BLOQUE 5 es total, incondicional, inmediata, sin preservación, sin efectos secundarios y sin impedimentos. No existen excepciones ni condiciones.

### 3.2. Qué NO es Apagabilidad en el BLOQUE 5

Las siguientes capacidades **NO** constituyen apagabilidad en el sentido del BLOQUE 5:

- ❌ **Apagado gradual**: El apagado no es gradual ni parcial. No existe "apagado suave" ni "apagado controlado".

- ❌ **Apagado condicionado**: El apagado no está condicionado a completar registro, preservar buffers o cerrar conexiones.

- ❌ **Apagado con espera**: El apagado no espera a que operaciones en curso terminen, no espera a que buffers se vacíen, no espera a que registros se completen.

- ❌ **Apagado con preservación**: El apagado no preserva estado, no guarda buffers pendientes, no completa registro en curso.

- ❌ **Apagado con transición**: El apagado no tiene período de transición, no tiene estados intermedios, no tiene fases de cierre.

- ❌ **Apagado con recuperación**: El apagado no requiere recuperación posterior, no deja residuos operativos, no genera estados que requieran limpieza.

**Regla explícita**: La apagabilidad en el BLOQUE 5 no es gradual, condicionada, con espera, con preservación, con transición ni con recuperación. Es total, incondicional e inmediata.

### 3.3. Características Obligatorias de la Apagabilidad

La apagabilidad en el BLOQUE 5 debe cumplir simultáneamente todas las siguientes características:

1. **Cesación inmediata de observación**: Toda observación de eventos cesa inmediatamente al iniciarse el apagado.

2. **Cesación inmediata de registro**: Todo registro de evidencia cesa inmediatamente al iniciarse el apagado.

3. **Cesación inmediata de trazabilidad**: Toda correlación y trazabilidad cesa inmediatamente al iniciarse el apagado.

4. **Sin bloqueo de apagado**: Ningún componente del BLOQUE 5 puede bloquear el apagado del sistema.

5. **Sin retraso de apagado**: Ningún componente del BLOQUE 5 puede retrasar el apagado del sistema.

6. **Sin condicionamiento de apagado**: Ningún componente del BLOQUE 5 puede condicionar el apagado del sistema.

**Regla explícita**: La apagabilidad en el BLOQUE 5 debe cumplir simultáneamente todas las características obligatorias. Cualquier apagado que no cumpla todas las características está prohibido.

---

## 4. Definición Formal de Retención Cero

### 4.1. Qué es Retención Cero en el BLOQUE 5

**Retención Cero** en el BLOQUE 5 es la ausencia total de obligación de preservar, mantener o conservar eventos observables, evidencia mínima o trazabilidad después del apagado del sistema. La retención cero establece que el sistema no tiene responsabilidad de mantener información del BLOQUE 5 después de que el sistema se apaga.

La retención cero es:

1. **Ausencia de obligación**: El sistema no tiene obligación de preservar información del BLOQUE 5 después del apagado.

2. **Ausencia de responsabilidad**: El sistema no tiene responsabilidad de mantener eventos, evidencia o trazabilidad después del apagado.

3. **Ausencia de garantía**: El sistema no garantiza que información del BLOQUE 5 esté disponible después del apagado.

4. **Ausencia de persistencia**: El sistema no requiere que información del BLOQUE 5 persista después del apagado.

5. **Ausencia de recuperación**: El sistema no requiere que información del BLOQUE 5 sea recuperable después del apagado.

6. **Ausencia de custodia**: El sistema no custodia información del BLOQUE 5 después del apagado, cumpliendo estrictamente con la política D0.

**Regla explícita**: La retención cero establece que el sistema no tiene obligación, responsabilidad, garantía, persistencia, recuperación ni custodia de información del BLOQUE 5 después del apagado.

### 4.2. Qué NO es Retención Cero en el BLOQUE 5

Las siguientes capacidades **NO** constituyen retención cero en el sentido del BLOQUE 5:

- ❌ **Retención temporal**: La retención cero no es retención temporal limitada. No existe "retención cero después de X tiempo".

- ❌ **Retención condicional**: La retención cero no es retención condicional. No existe "retención cero excepto en caso Y".

- ❌ **Retención parcial**: La retención cero no es retención parcial. No existe "retención cero de algunos componentes pero no de otros".

- ❌ **Retención diferida**: La retención cero no es retención diferida. No existe "retención cero después de completar operaciones".

- ❌ **Retención con migración**: La retención cero no es retención con migración. No existe "retención cero después de migrar datos".

- ❌ **Retención con archivado**: La retención cero no es retención con archivado. No existe "retención cero después de archivar".

**Regla explícita**: La retención cero no es temporal, condicional, parcial, diferida, con migración ni con archivado. Es ausencia total de obligación de preservar información después del apagado.

### 4.3. Características Obligatorias de la Retención Cero

La retención cero en el BLOQUE 5 debe cumplir simultáneamente todas las siguientes características:

1. **Sin obligación de preservar eventos**: El sistema no tiene obligación de preservar eventos observables después del apagado.

2. **Sin obligación de preservar evidencia**: El sistema no tiene obligación de preservar evidencia mínima después del apagado.

3. **Sin obligación de preservar trazabilidad**: El sistema no tiene obligación de preservar correlaciones o trazabilidad después del apagado.

4. **Sin responsabilidad de mantenimiento**: El sistema no tiene responsabilidad de mantener información del BLOQUE 5 después del apagado.

5. **Sin garantía de disponibilidad**: El sistema no garantiza que información del BLOQUE 5 esté disponible después del apagado.

6. **Sin custodia de datos**: El sistema no custodia datos del BLOQUE 5 después del apagado, cumpliendo estrictamente con la política D0.

**Regla explícita**: La retención cero debe cumplir simultáneamente todas las características obligatorias. Cualquier retención que no cumpla todas las características está prohibida.

---

## 5. Reglas Normativas de Apagado

### 5.1. Regla de Inicio de Apagado

**Regla canónica**: El inicio del apagado es **inmediato e incondicional**. No requiere verificación, no requiere preparación, no requiere condiciones previas.

**Establece que**:

- El apagado puede iniciarse en cualquier momento, sin condiciones
- El apagado se inicia inmediatamente al recibir la señal de apagado
- El apagado no verifica estado de componentes antes de iniciarse
- El apagado no prepara componentes antes de iniciarse
- El apagado no espera condiciones previas antes de iniciarse
- El apagado no requiere autorización ni confirmación antes de iniciarse

**Formalización**: `∀t ∈ Tiempo : iniciar_apagado(t) → apagado_iniciado(t)` (sin condiciones)

**Regla explícita**: El inicio del apagado es inmediato e incondicional. No existen condiciones previas, verificaciones ni preparaciones requeridas.

### 5.2. Regla de Apagado en Curso

**Regla canónica**: Durante el apagado en curso, **toda observación, registro y trazabilidad cesa inmediatamente**. No se completa operaciones en curso, no se preservan buffers pendientes, no se cierran conexiones limpiamente.

**Establece que**:

- Toda observación de eventos cesa inmediatamente al iniciarse el apagado
- Todo registro de evidencia cesa inmediatamente al iniciarse el apagado
- Toda correlación y trazabilidad cesa inmediatamente al iniciarse el apagado
- No se completan operaciones de registro en curso
- No se preservan buffers pendientes de registro
- No se cierran conexiones de almacenamiento limpiamente
- No se finalizan procesos de correlación en curso

**Formalización**: `∀c ∈ ComponenteBLOQUE5, ∀t ∈ TiempoApagado : cesar_operación(c, t) → operación_cesada(c, t)` (inmediato)

**Regla explícita**: Durante el apagado en curso, toda operación del BLOQUE 5 cesa inmediatamente. No se completa, preserva ni cierra limpiamente ninguna operación.

### 5.3. Regla de Apagado Forzado

**Regla canónica**: El apagado forzado es **idéntico al apagado normal**. No existe diferencia entre apagado normal y apagado forzado en el BLOQUE 5.

**Establece que**:

- El apagado forzado no requiere pasos adicionales
- El apagado forzado no requiere terminación forzada de procesos
- El apagado forzado no requiere eliminación forzada de recursos
- El apagado forzado es idéntico al apagado normal: cesación inmediata de toda operación
- No existe concepto de "apagado forzado" distinto de "apagado normal" en el BLOQUE 5

**Formalización**: `∀t ∈ Tiempo : apagado_normal(t) = apagado_forzado(t)` (idénticos)

**Regla explícita**: El apagado forzado es idéntico al apagado normal. No existe diferencia entre ambos en el BLOQUE 5.

### 5.4. Regla de Sin Cierre Limpio de Registro

**Regla canónica**: El apagado **no requiere cierre limpio de registro**. El registro puede quedar incompleto, corrupto o ausente sin consecuencias.

**Establece que**:

- El apagado no requiere completar registro en curso
- El apagado no requiere finalizar procesos de registro
- El apagado no requiere cerrar conexiones de almacenamiento
- El apagado no requiere validar integridad de registro
- El apagado no requiere confirmar completitud de registro
- El registro puede quedar incompleto, corrupto o ausente sin consecuencias

**Formalización**: `∀r ∈ Registro, ∀t ∈ TiempoApagado : ¬requerido(cierre_limpio(r, t))`

**Regla explícita**: El apagado no requiere cierre limpio de registro. El registro puede quedar en cualquier estado sin consecuencias.

### 5.5. Regla de Sin Preservación de Buffers Pendientes

**Regla canónica**: El apagado **no preserva buffers pendientes**. Los buffers pendientes de registro se descartan inmediatamente.

**Establece que**:

- Los buffers pendientes de eventos se descartan inmediatamente al iniciarse el apagado
- Los buffers pendientes de evidencia se descartan inmediatamente al iniciarse el apagado
- Los buffers pendientes de correlación se descartan inmediatamente al iniciarse el apagado
- No se intenta vaciar buffers antes del apagado
- No se intenta preservar buffers durante el apagado
- No se intenta recuperar buffers después del apagado

**Formalización**: `∀b ∈ Buffer, ∀t ∈ TiempoApagado : descartar(b, t) → buffer_descartado(b, t)` (inmediato)

**Regla explícita**: El apagado no preserva buffers pendientes. Todos los buffers se descartan inmediatamente al iniciarse el apagado.

### 5.6. Regla de Sin Estados Intermedios

**Regla canónica**: El apagado **no genera estados intermedios**. El sistema transiciona directamente de operativo a apagado, sin estados intermedios.

**Establece que**:

- El apagado no genera estados intermedios como "apagando", "cerrando", "finalizando"
- El apagado no genera estados que requieran recuperación
- El apagado no genera estados que requieran limpieza
- El sistema transiciona directamente de operativo a apagado
- No existen estados intermedios durante el apagado

**Formalización**: `∀s ∈ Estado, ∀t ∈ TiempoApagado : estado(s, t) ∈ {operativo, apagado}` (sin intermedios)

**Regla explícita**: El apagado no genera estados intermedios. El sistema transiciona directamente de operativo a apagado.

---

## 6. Invariantes Obligatorios Durante Apagado

### 6.1. Invariante de Cesación Inmediata

**Invariante canónico**: Al iniciarse el apagado, toda observación, registro y trazabilidad cesa inmediatamente, sin excepciones.

**Asegura que**:

- `∀o ∈ Observación, ∀t ∈ TiempoApagado : cesar(o, t) → observación_cesada(o, t)` (inmediato)
- `∀r ∈ Registro, ∀t ∈ TiempoApagado : cesar(r, t) → registro_cesado(r, t)` (inmediato)
- `∀t ∈ Trazabilidad, ∀t ∈ TiempoApagado : cesar(t, t) → trazabilidad_cesada(t, t)` (inmediato)

**Verificación obligatoria**: Toda operación del BLOQUE 5 debe cesar inmediatamente al iniciarse el apagado. No existen excepciones.

### 6.2. Invariante de Sin Bloqueo

**Invariante canónico**: Ningún componente del BLOQUE 5 puede bloquear el apagado del sistema.

**Asegura que**:

- `∀c ∈ ComponenteBLOQUE5, ∀t ∈ TiempoApagado : ¬puede_bloquear(c, apagado, t)`
- `∀c ∈ ComponenteBLOQUE5, ∀t ∈ TiempoApagado : apagado_procede(c, t)` (siempre procede)

**Verificación obligatoria**: Ningún componente del BLOQUE 5 puede bloquear el apagado. El apagado siempre procede.

### 6.3. Invariante de Sin Retraso

**Invariante canónico**: Ningún componente del BLOQUE 5 puede retrasar el apagado del sistema.

**Asegura que**:

- `∀c ∈ ComponenteBLOQUE5, ∀t ∈ TiempoApagado : tiempo_apagado(c, t) = 0` (sin retraso)
- `∀c ∈ ComponenteBLOQUE5, ∀t ∈ TiempoApagado : ¬puede_retrasar(c, apagado, t)`

**Verificación obligatoria**: Ningún componente del BLOQUE 5 puede retrasar el apagado. El apagado es inmediato.

### 6.4. Invariante de Sin Condicionamiento

**Invariante canónico**: Ningún componente del BLOQUE 5 puede condicionar el apagado del sistema.

**Asegura que**:

- `∀c ∈ ComponenteBLOQUE5, ∀t ∈ TiempoApagado : ¬puede_condicionar(c, apagado, t)`
- `∀c ∈ ComponenteBLOQUE5, ∀t ∈ TiempoApagado : apagado_incondicional(c, t)` (siempre incondicional)

**Verificación obligatoria**: Ningún componente del BLOQUE 5 puede condicionar el apagado. El apagado es incondicional.

### 6.5. Invariante de Sin Preservación

**Invariante canónico**: El apagado no preserva buffers pendientes, estado intermedio ni información en curso.

**Asegura que**:

- `∀b ∈ Buffer, ∀t ∈ TiempoApagado : ¬preservar(b, t)` (no preservar)
- `∀s ∈ EstadoIntermedio, ∀t ∈ TiempoApagado : ¬preservar(s, t)` (no preservar)
- `∀i ∈ InformaciónEnCurso, ∀t ∈ TiempoApagado : ¬preservar(i, t)` (no preservar)

**Verificación obligatoria**: El apagado no preserva buffers, estado intermedio ni información en curso. Todo se descarta inmediatamente.

### 6.6. Invariante de Sin Estados Intermedios

**Invariante canónico**: El apagado no genera estados intermedios que requieran recuperación, limpieza ni manejo especial.

**Asegura que**:

- `∀s ∈ Estado, ∀t ∈ TiempoApagado : estado(s, t) ∈ {operativo, apagado}` (sin intermedios)
- `∀s ∈ EstadoIntermedio, ∀t ∈ TiempoApagado : ¬existe(s, t)` (no existen)

**Verificación obligatoria**: El apagado no genera estados intermedios. El sistema transiciona directamente de operativo a apagado.

### 6.7. Invariante de Retención Cero

**Invariante canónico**: Después del apagado, el sistema no tiene obligación, responsabilidad, garantía, persistencia, recuperación ni custodia de información del BLOQUE 5.

**Asegura que**:

- `∀i ∈ InformaciónBLOQUE5, ∀t ∈ TiempoDespuésApagado : ¬obligación_preservar(i, t)`
- `∀i ∈ InformaciónBLOQUE5, ∀t ∈ TiempoDespuésApagado : ¬responsabilidad_mantener(i, t)`
- `∀i ∈ InformaciónBLOQUE5, ∀t ∈ TiempoDespuésApagado : ¬garantía_disponibilidad(i, t)`
- `∀i ∈ InformaciónBLOQUE5, ∀t ∈ TiempoDespuésApagado : ¬custodia(i, t)` (cumple D0)

**Verificación obligatoria**: Después del apagado, el sistema no tiene obligación, responsabilidad, garantía ni custodia de información del BLOQUE 5. La retención es cero.

---

## 7. Garantías de Apagabilidad Total

### 7.1. Garantía de Apagado Incondicional

**Garantía canónica**: El apagado del BLOQUE 5 es incondicional. No requiere condiciones previas, no espera completar operaciones, no requiere cierre limpio.

**Asegura que**:

- El apagado puede iniciarse en cualquier momento, sin condiciones
- El apagado no espera a que operaciones en curso terminen
- El apagado no requiere cierre limpio de registro
- El apagado no requiere preservación de buffers
- El apagado no requiere estados intermedios
- El apagado es inmediato e incondicional

**Violación**: Cualquier condición, espera, cierre limpio, preservación o estado intermedio requerido para el apagado viola esta garantía.

### 7.2. Garantía de Sin Impedimentos

**Garantía canónica**: Ningún componente del BLOQUE 5 puede impedir, retrasar o condicionar el apagado del sistema.

**Asegura que**:

- Ningún componente puede bloquear el apagado
- Ningún componente puede retrasar el apagado
- Ningún componente puede condicionar el apagado
- El apagado siempre procede, independientemente del estado de los componentes
- El apagado es incondicional e inmediato

**Violación**: Cualquier componente que impida, retrase o condicione el apagado viola esta garantía.

### 7.3. Garantía de Retención Cero

**Garantía canónica**: Después del apagado, el sistema no tiene obligación, responsabilidad, garantía, persistencia, recuperación ni custodia de información del BLOQUE 5.

**Asegura que**:

- El sistema no tiene obligación de preservar información después del apagado
- El sistema no tiene responsabilidad de mantener información después del apagado
- El sistema no garantiza que información esté disponible después del apagado
- El sistema no custodia datos después del apagado, cumpliendo estrictamente con la política D0
- La retención es cero

**Violación**: Cualquier obligación, responsabilidad, garantía, persistencia, recuperación o custodia de información después del apagado viola esta garantía.

---

## 8. Alcance Prohibido

Este documento **NO define**:

- ❌ **Mecanismos técnicos de borrado**: No define cómo se borran técnicamente eventos, evidencia o trazabilidad
- ❌ **Políticas de retención temporal**: No define políticas de retención temporal antes del apagado
- ❌ **Backpressure o drenaje controlado**: No define mecanismos de backpressure o drenaje controlado antes del apagado
- ❌ **Responsabilidades operativas**: No define quién es responsable de iniciar, monitorear o verificar el apagado
- ❌ **Reapertura de decisiones de bloques anteriores**: No reabre decisiones de BLOQUES 1 a 4 ni modifica sus definiciones

Este documento **SOLO define** el marco canónico de apagabilidad total y retención cero, estableciendo qué significa apagabilidad, qué significa retención cero, qué reglas normativas rigen el apagado, y qué invariantes obligatorios deben cumplirse durante el apagado.

---

## 9. Coherencia con Fases Anteriores

### 9.1. Coherencia con FASE 5.1 (Eventos Observables)

Este documento es coherente con FASE 5.1 porque:

- **Respeta el marco de eventos observables**: Los eventos definidos en FASE 5.1 pueden cesar inmediatamente durante el apagado
- **Preserva la apagabilidad**: La apagabilidad establecida en FASE 5.1 se preserva mediante apagabilidad total e incondicional
- **No redefine eventos**: Este documento no redefine ni modifica eventos establecidos en FASE 5.1

### 9.2. Coherencia con FASE 5.2 (Evidencia Mínima)

Este documento es coherente con FASE 5.2 porque:

- **Respeta el modelo de evidencia mínima**: La evidencia definida en FASE 5.2 puede cesar inmediatamente durante el apagado
- **Preserva la pasividad**: La pasividad de la evidencia establecida en FASE 5.2 se preserva mediante retención cero
- **No redefine evidencia**: Este documento no redefine ni modifica evidencia establecida en FASE 5.2

### 9.3. Coherencia con FASE 5.3 (Comportamiento ante Fallos)

Este documento es coherente con FASE 5.3 porque:

- **Respeta el principio de prescindibilidad**: El registro prescindible establecido en FASE 5.3 se preserva mediante apagado sin cierre limpio
- **Preserva la apagabilidad incondicional**: La apagabilidad incondicional establecida en FASE 5.3 se preserva mediante apagabilidad total
- **No redefine comportamiento ante fallos**: Este documento no redefine ni modifica comportamiento establecido en FASE 5.3

### 9.4. Coherencia con FASE 5.4 (Límites de Trazabilidad)

Este documento es coherente con FASE 5.4 porque:

- **Respeta los límites de trazabilidad**: La trazabilidad opcional establecida en FASE 5.4 se preserva mediante cesación inmediata durante el apagado
- **Preserva la apagabilidad con trazabilidad incompleta**: La apagabilidad con trazabilidad incompleta establecida en FASE 5.4 se preserva mediante apagabilidad total
- **No redefine límites de trazabilidad**: Este documento no redefine ni modifica límites establecidos en FASE 5.4

### 9.5. Coherencia con Principios Fundamentales

Este documento es coherente con los principios fundamentales del BLOQUE 5:

- **D0 (Elixir no custodia datos)**: La retención cero garantiza que no existe custodia de datos después del apagado, cumpliendo estrictamente con D0
- **Default Deny**: El apagado es la negación por defecto de toda operación del BLOQUE 5
- **Apagabilidad**: La apagabilidad es el principio rector obligatorio que rige todo el BLOQUE 5, establecido canónicamente en este documento
- **Pasividad absoluta**: El apagado es pasivo y no genera efectos operativos más allá de la cesación de observación

---

## 10. Criterios de Cierre de la FASE 5.6

### 10.1. Criterios de Cierre

La FASE 5.6 se considera cerrada cuando:

1. **Definición formal de apagabilidad establecida**: La definición formal de apagabilidad en el BLOQUE 5 está completamente establecida y documentada
2. **Definición formal de retención cero establecida**: La definición formal de retención cero está completamente establecida y documentada
3. **Reglas normativas de apagado establecidas**: Las reglas normativas de inicio de apagado, apagado en curso y apagado forzado están completamente establecidas y documentadas
4. **Invariantes obligatorios durante apagado establecidos**: Los invariantes obligatorios durante apagado están completamente establecidos y documentados
5. **Garantías de apagabilidad total establecidas**: Las garantías de apagado incondicional, sin impedimentos y retención cero están completamente establecidas y documentadas
6. **Coherencia con fases anteriores verificada**: La coherencia con FASES 5.1 a 5.5 está verificada y documentada
7. **Frase canónica de cierre establecida**: La frase canónica de cierre, declarativa y no técnica, está establecida y documentada

### 10.2. Condiciones para Avance a Fase Siguiente

La FASE 5.6 habilita el avance a la siguiente fase del BLOQUE 5 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre están satisfechos
2. **Marco de apagabilidad operativo**: El marco de apagabilidad total y retención cero está operativo y puede gobernar el apagado del BLOQUE 5
3. **Garantías verificadas**: Las garantías de apagabilidad total están verificadas y funcionando según lo documentado

**Regla explícita**: El avance a la siguiente fase requiere cumplimiento explícito de todos los criterios de cierre. No existe avance automático ni implícito.

---

## 11. Cierre Canónico de la Fase

### 11.1. Declaración Explícita de Cierre

La FASE 5.6 queda conceptualmente cerrada y establece el marco canónico de apagabilidad total y retención cero para el BLOQUE 5.

El marco de apagabilidad total y retención cero definido por esta fase gobierna todo apagado del BLOQUE 5. Establece qué significa apagabilidad en el contexto del BLOQUE 5, qué significa retención cero de eventos y evidencia, qué reglas normativas rigen el apagado, y qué invariantes obligatorios deben cumplirse durante el apagado.

El marco de apagabilidad total y retención cero es definitivo para determinar cómo debe comportarse el BLOQUE 5 durante el apagado. No hay mecanismo de apelación, bypass ni omisión de este marco.

**Regla explícita**: El marco de apagabilidad total y retención cero es canónico e inmodificable. Una vez aprobado, no admite reinterpretaciones ni extensiones.

### 11.2. Preparación para Fases Siguientes

La FASE 5.6 establece el marco canónico de apagabilidad total y retención cero necesario para fases siguientes del BLOQUE 5. Las fases siguientes utilizarán este marco para definir cómo se implementa el apagado, cómo se verifica la apagabilidad, y cómo se garantiza la retención cero.

La FASE 5.6 no anticipa ni desarrolla las fases siguientes. Solo establece el marco canónico de apagabilidad total y retención cero que las fases siguientes utilizarán como base.

**Regla explícita**: La FASE 5.6 establece el marco canónico de apagabilidad total y retención cero. Las fases siguientes utilizarán este marco para definir la implementación y verificación del apagado. No existe anticipación ni desarrollo de fases siguientes en este documento.

---

## 12. Frase Canónica de Cierre

**El BLOQUE 5 debe poder apagarse completamente en cualquier momento, sin condiciones, sin esperas, sin preservación de estado, y sin que ningún componente impida, retrase o condicione el apagado del sistema. La apagabilidad en el BLOQUE 5 es total, incondicional, inmediata, sin preservación, sin efectos secundarios y sin impedimentos. La retención cero establece que el sistema no tiene obligación, responsabilidad, garantía, persistencia, recuperación ni custodia de información del BLOQUE 5 después del apagado. El apagado no requiere cierre limpio de registro, no preserva buffers pendientes, no genera estados intermedios. Ningún componente del BLOQUE 5 puede impedir, retrasar o condicionar el apagado. La apagabilidad total y la retención cero son canónicas, inmodificables y obligatorias.**

---

## 13. Estado y Registro

**Estado del documento**: CANÓNICO  
**Versión**: 1.0  
**Fecha de cierre**: 2025-01-XX  
**Registrado en**: Git (commit canónico)  
**Relación**: Coherente con FASE 5.1 (Marco de Eventos Observables), FASE 5.2 (Modelo de Evidencia Mínima), FASE 5.3 (Comportamiento ante Fallos de Registro) y FASE 5.4 (Límites Formales de Trazabilidad)  
**Alcance**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada

---

**Fin del documento**


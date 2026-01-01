# FASE 5.6 — Comportamiento Canónico del Kill-Switch

**Proyecto**: Elixir Platform  
**Etapa**: ETAPA 1 — Producto Vivo Sin Dinero  
**Bloque**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada  
**Fase**: FASE 5.6 — Comportamiento Canónico del Kill-Switch  
**Tipo**: Documentación Canónica y Normativa  
**Versión**: 1.0  
**Estado**: Canónico e Inmodificable

---

## 1. Propósito de la FASE 5.6

### 1.1. Función Exacta del Documento

La FASE 5.6 define el **comportamiento canónico del BLOQUE 5** frente a un kill-switch o interrupción inmediata del sistema. Establece qué ocurre con la observabilidad, el registro, la evidencia y la auditoría cuando el sistema se apaga mediante kill-switch, garantizando que el apagado sea absoluto, inmediato y sin obligaciones pendientes.

Este documento establece **reglas de no-persistencia absoluta** y **invariantes post-apagado** que aseguran que:

- No quede información retenida después del kill-switch
- No se reanude registro automáticamente
- No exista reconciliación posterior
- El apagado no genere obligaciones pendientes

### 1.2. Contexto Canónico

Este documento opera bajo los siguientes principios rectores:

- **El sistema debe poder apagarse en cualquier momento**: El kill-switch es un evento no negociable
- **El apagado no es un evento negociable**: El kill-switch no puede ser bloqueado, retrasado ni condicionado
- **El BLOQUE 5 no tiene estado crítico que preservar**: La observabilidad no requiere preservación de estado
- **La observabilidad no sobrevive al apagado**: La observabilidad se desactiva completamente con el kill-switch

### 1.3. Relación con Fases Anteriores

Este documento se fundamenta en:

- **FASE 5.1 (Marco de Eventos Observables)**: Define los eventos `KILL_SWITCH_ACTIVATED` y `KILL_SWITCH_DEACTIVATED` como eventos observables
- **FASE 5.2 (Modelo de Evidencia Mínima)**: Define qué constituye evidencia válida de eventos observables
- **FASE 5.3 (Comportamiento Canónico ante Fallos de Registro)**: Establece que el registro es prescindible y no afecta la ejecución
- **FASE 5.4 (Límites Formales de Trazabilidad)**: Establece que la trazabilidad es opcional y puede ser incompleta

La FASE 5.6 extiende estas fases definiendo **qué ocurre cuando el kill-switch se activa**, sin modificar ni reinterpretar las fases anteriores.

### 1.4. Necesidad de este Documento

Este documento es necesario porque:

1. **Definición formal de kill-switch**: El sistema requiere una definición formal de qué constituye un kill-switch en el contexto del BLOQUE 5
2. **Efectos inmediatos explícitos**: El sistema requiere definición explícita de los efectos inmediatos del kill-switch sobre observación, registro, evidencia y auditoría
3. **Reglas de no-persistencia**: El sistema requiere reglas explícitas que garanticen que no quede información retenida después del kill-switch
4. **Invariantes post-apagado**: El sistema requiere invariantes que aseguren que el apagado no genere obligaciones pendientes ni mecanismos de rehidratación
5. **Prevención de continuidad implícita**: El sistema requiere prevención explícita de mecanismos que permitan continuidad implícita tras el apagado

---

## 2. Definición Formal de Kill-Switch

### 2.1. Qué es un Kill-Switch en Elixir

Un **Kill-Switch** en Elixir Platform es un mecanismo de control que provoca la **interrupción inmediata e incondicional** de todas las operaciones del sistema, incluyendo la observabilidad, el registro, la evidencia y la auditoría del BLOQUE 5.

El kill-switch es:

1. **Inmediato**: El apagado ocurre sin demora, sin espera, sin condiciones
2. **Incondicional**: El apagado no puede ser bloqueado, retrasado ni condicionado
3. **Absoluto**: El apagado afecta todas las operaciones del sistema, incluyendo el BLOQUE 5
4. **No negociable**: El kill-switch no es un evento negociable. No puede ser cancelado, revertido ni modificado una vez activado
5. **Sin estado crítico**: El kill-switch no requiere preservación de estado. No hay información crítica que preservar
6. **Sin obligaciones pendientes**: El kill-switch no genera obligaciones pendientes, mecanismos de recuperación ni procesos de reconciliación

**Regla explícita**: Un kill-switch es un mecanismo de control que provoca la interrupción inmediata e incondicional de todas las operaciones del sistema, incluyendo la observabilidad del BLOQUE 5.

### 2.2. Qué NO es un Kill-Switch en Elixir

Las siguientes capacidades **NO** constituyen kill-switch en el sentido del BLOQUE 5:

- ❌ **Apagado parcial**: Un mecanismo que apaga solo algunas operaciones pero mantiene otras activas
- ❌ **Apagado diferido**: Un mecanismo que programa el apagado para un momento futuro
- ❌ **Apagado condicional**: Un mecanismo que apaga solo si se cumplen ciertas condiciones
- ❌ **Apagado negociable**: Un mecanismo que puede ser cancelado, revertido o modificado
- ❌ **Apagado con preservación**: Un mecanismo que preserva estado, información o contexto durante el apagado
- ❌ **Apagado con recuperación**: Un mecanismo que permite recuperación, rehidratación o reconciliación posterior

**Regla explícita**: Solo la interrupción inmediata e incondicional de todas las operaciones constituye kill-switch. Cualquier mecanismo que permita apagado parcial, diferido, condicional, negociable, con preservación o con recuperación no es kill-switch.

### 2.3. Activación del Kill-Switch

El kill-switch se activa mediante:

1. **Activación explícita**: Un operador o sistema externo activa explícitamente el kill-switch
2. **Activación automática**: El sistema activa automáticamente el kill-switch bajo condiciones predefinidas (no definidas en este documento)
3. **Activación por fallo crítico**: El sistema activa el kill-switch como respuesta a fallos críticos (no definidos en este documento)

**Regla explícita**: Este documento no define cómo se activa el kill-switch, solo define qué ocurre cuando se activa. La activación del kill-switch es responsabilidad de otros bloques o sistemas externos.

---

## 3. Efectos Inmediatos del Kill-Switch sobre el BLOQUE 5

### 3.1. Efecto sobre la Observación

**Efecto canónico**: La observación se **desactiva inmediatamente** cuando el kill-switch se activa.

**Comportamiento requerido**:

1. **Cese inmediato de observación**: La observación de eventos observables cesa inmediatamente
2. **Sin eventos observables nuevos**: No se generan nuevos eventos observables después de la activación del kill-switch
3. **Evento final opcional**: Se puede generar el evento observable `KILL_SWITCH_ACTIVATED` (FASE 5.1) como último evento, pero no es obligatorio
4. **Sin preservación de estado de observación**: El estado de observación no se preserva. No hay información que preservar

**Regla explícita**: La observación se desactiva inmediatamente cuando el kill-switch se activa. No se generan nuevos eventos observables después de la activación.

### 3.2. Efecto sobre el Registro

**Efecto canónico**: El registro se **desactiva inmediatamente** cuando el kill-switch se activa.

**Comportamiento requerido**:

1. **Cese inmediato de registro**: El registro de eventos observables y evidencia mínima cesa inmediatamente
2. **Sin registro nuevo**: No se registran nuevos eventos ni evidencias después de la activación del kill-switch
3. **Registro pendiente descartado**: Los eventos y evidencias pendientes de registro se descartan inmediatamente, sin intentar registro
4. **Sin preservación de estado de registro**: El estado de registro no se preserva. No hay información que preservar

**Regla explícita**: El registro se desactiva inmediatamente cuando el kill-switch se activa. Los eventos y evidencias pendientes se descartan sin intentar registro.

### 3.3. Efecto sobre la Evidencia

**Efecto canónico**: La generación de evidencia se **desactiva inmediatamente** cuando el kill-switch se activa.

**Comportamiento requerido**:

1. **Cese inmediato de generación de evidencia**: La generación de evidencia mínima cesa inmediatamente
2. **Sin evidencia nueva**: No se genera nueva evidencia después de la activación del kill-switch
3. **Evidencia pendiente descartada**: La evidencia pendiente de registro se descarta inmediatamente, sin intentar registro
4. **Sin preservación de evidencia**: La evidencia no se preserva. No hay información que preservar

**Regla explícita**: La generación de evidencia se desactiva inmediatamente cuando el kill-switch se activa. La evidencia pendiente se descarta sin intentar registro.

### 3.4. Efecto sobre la Auditoría

**Efecto canónico**: La auditoría se **desactiva inmediatamente** cuando el kill-switch se activa.

**Comportamiento requerido**:

1. **Cese inmediato de auditoría**: Los procesos de auditoría (si existen) cesan inmediatamente
2. **Sin auditoría nueva**: No se inician nuevos procesos de auditoría después de la activación del kill-switch
3. **Auditoría pendiente descartada**: Los procesos de auditoría pendientes se descartan inmediatamente, sin intentar completar
4. **Sin preservación de estado de auditoría**: El estado de auditoría no se preserva. No hay información que preservar

**Regla explícita**: La auditoría se desactiva inmediatamente cuando el kill-switch se activa. Los procesos de auditoría pendientes se descartan sin intentar completar.

### 3.5. Efecto sobre la Trazabilidad

**Efecto canónico**: La trazabilidad se **desactiva inmediatamente** cuando el kill-switch se activa.

**Comportamiento requerido**:

1. **Cese inmediato de trazabilidad**: Los procesos de correlación y trazabilidad (si existen) cesan inmediatamente
2. **Sin correlación nueva**: No se establecen nuevas correlaciones después de la activación del kill-switch
3. **Trazabilidad pendiente descartada**: Los procesos de trazabilidad pendientes se descartan inmediatamente, sin intentar completar
4. **Sin preservación de trazabilidad**: La trazabilidad no se preserva. No hay información que preservar

**Regla explícita**: La trazabilidad se desactiva inmediatamente cuando el kill-switch se activa. Los procesos de trazabilidad pendientes se descartan sin intentar completar.

---

## 4. Reglas de No-Persistencia Absoluta

### 4.1. Principio de No-Retención de Información

**Regla canónica**: Después del kill-switch, **no queda información retenida** del BLOQUE 5.

**Aplicación explícita**:

- ❌ **No retención de eventos observables**: Los eventos observables pendientes no se retienen. Se descartan inmediatamente
- ❌ **No retención de evidencia**: La evidencia pendiente no se retiene. Se descarta inmediatamente
- ❌ **No retención de estado de observación**: El estado de observación no se retiene. No hay estado que preservar
- ❌ **No retención de estado de registro**: El estado de registro no se retiene. No hay estado que preservar
- ❌ **No retención de correlaciones**: Las correlaciones pendientes no se retienen. Se descartan inmediatamente
- ❌ **No retención de procesos**: Los procesos de observación, registro, evidencia o auditoría pendientes no se retienen. Se descartan inmediatamente

**Regla explícita**: Después del kill-switch, no queda información retenida del BLOQUE 5. Toda información pendiente se descarta inmediatamente.

### 4.2. Principio de No-Reanudación Automática

**Regla canónica**: Después del kill-switch, **no se reanuda registro automáticamente**.

**Aplicación explícita**:

- ❌ **No reanudación automática de observación**: La observación no se reanuda automáticamente cuando el kill-switch se desactiva
- ❌ **No reanudación automática de registro**: El registro no se reanuda automáticamente cuando el kill-switch se desactiva
- ❌ **No reanudación automática de evidencia**: La generación de evidencia no se reanuda automáticamente cuando el kill-switch se desactiva
- ❌ **No reanudación automática de auditoría**: La auditoría no se reanuda automáticamente cuando el kill-switch se desactiva
- ❌ **No reanudación automática de trazabilidad**: La trazabilidad no se reanuda automáticamente cuando el kill-switch se desactiva

**Regla explícita**: Después del kill-switch, no se reanuda registro automáticamente. La reanudación (si ocurre) requiere activación explícita externa al BLOQUE 5.

### 4.3. Principio de No-Reconciliación Posterior

**Regla canónica**: Después del kill-switch, **no existe reconciliación posterior**.

**Aplicación explícita**:

- ❌ **No reconciliación de eventos perdidos**: No existe mecanismo que reconcilie eventos observables que no se registraron durante el kill-switch
- ❌ **No reconciliación de evidencia perdida**: No existe mecanismo que reconcilie evidencia que no se registró durante el kill-switch
- ❌ **No reconciliación de correlaciones perdidas**: No existe mecanismo que reconcilie correlaciones que no se establecieron durante el kill-switch
- ❌ **No reconstrucción de estado**: No existe mecanismo que reconstruya el estado de observación, registro, evidencia o auditoría después del kill-switch
- ❌ **No recuperación de información**: No existe mecanismo que recupere información descartada durante el kill-switch

**Regla explícita**: Después del kill-switch, no existe reconciliación posterior. La información descartada durante el kill-switch no se recupera ni se reconcilia.

### 4.4. Principio de No-Preservación de Estado

**Regla canónica**: El BLOQUE 5 **no tiene estado crítico que preservar** durante el kill-switch.

**Aplicación explícita**:

- ❌ **No preservación de estado de observación**: El estado de observación no se preserva. No hay estado crítico
- ❌ **No preservación de estado de registro**: El estado de registro no se preserva. No hay estado crítico
- ❌ **No preservación de estado de evidencia**: El estado de evidencia no se preserva. No hay estado crítico
- ❌ **No preservación de estado de auditoría**: El estado de auditoría no se preserva. No hay estado crítico
- ❌ **No preservación de estado de trazabilidad**: El estado de trazabilidad no se preserva. No hay estado crítico

**Regla explícita**: El BLOQUE 5 no tiene estado crítico que preservar durante el kill-switch. No se preserva ningún estado.

---

## 5. Invariantes Post-Apagado

### 5.1. Invariante de Apagado Absoluto

**Invariante canónico**: Después del kill-switch, el BLOQUE 5 está **completamente apagado**.

**Asegura que**:

- La observación está completamente desactivada
- El registro está completamente desactivado
- La generación de evidencia está completamente desactivada
- La auditoría está completamente desactivada
- La trazabilidad está completamente desactivada

**Verificación**: `∀b ∈ BLOQUE5, ∀ks ∈ KillSwitchActivado : apagado(b) = verdadero`

### 5.2. Invariante de No-Obligaciones Pendientes

**Invariante canónico**: Después del kill-switch, **no existen obligaciones pendientes** del BLOQUE 5.

**Asegura que**:

- No existen eventos observables pendientes de registro
- No existe evidencia pendiente de registro
- No existen procesos de auditoría pendientes
- No existen procesos de trazabilidad pendientes
- No existen mecanismos de recuperación pendientes
- No existen mecanismos de reconciliación pendientes

**Verificación**: `∀b ∈ BLOQUE5, ∀ks ∈ KillSwitchActivado : obligaciones_pendientes(b) = ∅`

### 5.3. Invariante de No-Rehidratación

**Invariante canónico**: Después del kill-switch, **no existe rehidratación** del BLOQUE 5.

**Asegura que**:

- No existe mecanismo que restaure el estado de observación
- No existe mecanismo que restaure el estado de registro
- No existe mecanismo que restaure el estado de evidencia
- No existe mecanismo que restaure el estado de auditoría
- No existe mecanismo que restaure el estado de trazabilidad
- No existe mecanismo que recupere información descartada

**Verificación**: `∀b ∈ BLOQUE5, ∀ks ∈ KillSwitchActivado : rehidratación(b) = ∅`

### 5.4. Invariante de No-Continuidad Implícita

**Invariante canónico**: Después del kill-switch, **no existe continuidad implícita** del BLOQUE 5.

**Asegura que**:

- No existe mecanismo que continúe observación automáticamente
- No existe mecanismo que continúe registro automáticamente
- No existe mecanismo que continúe generación de evidencia automáticamente
- No existe mecanismo que continúe auditoría automáticamente
- No existe mecanismo que continúe trazabilidad automáticamente
- No existe mecanismo que reanude operaciones automáticamente

**Verificación**: `∀b ∈ BLOQUE5, ∀ks ∈ KillSwitchActivado : continuidad_implícita(b) = falso`

### 5.5. Invariante de No-Estado Residual

**Invariante canónico**: Después del kill-switch, **no existe estado residual** del BLOQUE 5.

**Asegura que**:

- No existe estado de observación residual
- No existe estado de registro residual
- No existe estado de evidencia residual
- No existe estado de auditoría residual
- No existe estado de trazabilidad residual
- No existe información residual en memoria, almacenamiento ni buffers

**Verificación**: `∀b ∈ BLOQUE5, ∀ks ∈ KillSwitchActivado : estado_residual(b) = ∅`

---

## 6. Comportamiento Canónico ante Activación del Kill-Switch

### 6.1. Secuencia de Desactivación

**Secuencia canónica**: Cuando el kill-switch se activa, el BLOQUE 5 se desactiva en la siguiente secuencia:

1. **Detención inmediata de observación**: La observación de eventos observables se detiene inmediatamente
2. **Detención inmediata de registro**: El registro de eventos y evidencias se detiene inmediatamente
3. **Detención inmediata de generación de evidencia**: La generación de evidencia se detiene inmediatamente
4. **Detención inmediata de auditoría**: Los procesos de auditoría se detienen inmediatamente
5. **Detención inmediata de trazabilidad**: Los procesos de trazabilidad se detienen inmediatamente
6. **Descarte inmediato de información pendiente**: Toda información pendiente (eventos, evidencias, correlaciones, procesos) se descarta inmediatamente
7. **Limpieza inmediata de estado**: Todo estado residual se limpia inmediatamente
8. **Desactivación completa**: El BLOQUE 5 queda completamente desactivado

**Regla explícita**: La secuencia de desactivación es inmediata e incondicional. No hay esperas, condiciones ni preservación de estado.

### 6.2. Evento Observable Final (Opcional)

**Regla canónica**: Se puede generar el evento observable `KILL_SWITCH_ACTIVATED` (FASE 5.1) como último evento antes de la desactivación completa, pero **no es obligatorio**.

**Comportamiento**:

- **Opcional**: El evento `KILL_SWITCH_ACTIVATED` puede generarse, pero no es obligatorio
- **Último evento**: Si se genera, es el último evento observable antes de la desactivación completa
- **Sin garantía de registro**: No se garantiza que el evento se registre. Puede descartarse si el registro ya está desactivado
- **Sin evidencia obligatoria**: No se requiere generar evidencia del evento. Puede generarse sin evidencia

**Regla explícita**: El evento `KILL_SWITCH_ACTIVATED` es opcional. Si se genera, es el último evento antes de la desactivación completa, pero no se garantiza su registro ni evidencia.

### 6.3. Comportamiento ante Kill-Switch Durante Operación

**Situación**: El kill-switch se activa mientras el BLOQUE 5 está operando (observando, registrando, generando evidencia, etc.).

**Comportamiento canónico**:

1. **Interrupción inmediata**: Todas las operaciones en curso se interrumpen inmediatamente
2. **Sin finalización de operaciones**: Las operaciones en curso no se finalizan. Se interrumpen sin completar
3. **Descarte inmediato**: Toda información de operaciones interrumpidas se descarta inmediatamente
4. **Sin preservación de contexto**: El contexto de operaciones interrumpidas no se preserva
5. **Desactivación completa**: El BLOQUE 5 queda completamente desactivado

**Regla explícita**: Cuando el kill-switch se activa durante operación, todas las operaciones se interrumpen inmediatamente sin finalizar ni preservar contexto.

---

## 7. Alcance Prohibido

Este documento **NO define**:

- ❌ **Estados de "apagado parcial"**: No define mecanismos de apagado parcial que mantengan algunas operaciones activas
- ❌ **Rehidratación posterior**: No define mecanismos que restauren estado después del kill-switch
- ❌ **Mecanismos de recuperación**: No define cómo recuperar información descartada durante el kill-switch
- ❌ **Responsabilidades externas**: No define quién debe responder al kill-switch ni qué hacer después
- ❌ **Continuidad implícita tras el apagado**: No define mecanismos que permitan continuidad automática después del kill-switch
- ❌ **Preservación de información**: No define qué información preservar durante el kill-switch
- ❌ **Mecanismos de activación**: No define cómo se activa el kill-switch (responsabilidad de otros bloques)
- ❌ **Mecanismos de desactivación**: No define cómo se desactiva el kill-switch ni qué ocurre después (responsabilidad de otros bloques)

Este documento **SOLO define** el comportamiento canónico del BLOQUE 5 cuando el kill-switch se activa, estableciendo efectos inmediatos, reglas de no-persistencia e invariantes post-apagado.

---

## 8. Coherencia con FASES 5.1 a 5.4

### 8.1. Coherencia con FASE 5.1 (Eventos Observables)

Este documento es coherente con FASE 5.1 porque:

- **Respeta el evento KILL_SWITCH_ACTIVATED**: El evento `KILL_SWITCH_ACTIVATED` definido en FASE 5.1 puede generarse (opcionalmente) como último evento antes de la desactivación
- **Preserva la apagabilidad**: La apagabilidad establecida en FASE 5.1 se preserva mediante el kill-switch
- **Mantiene la pasividad**: La pasividad de los eventos observables se mantiene incluso durante el kill-switch
- **No redefine eventos**: Este documento no redefine ni modifica eventos establecidos en FASE 5.1

### 8.2. Coherencia con FASE 5.2 (Evidencia Mínima)

Este documento es coherente con FASE 5.2 porque:

- **Respeta el modelo de evidencia mínima**: La evidencia definida en FASE 5.2 puede no generarse durante el kill-switch sin consecuencias
- **Preserva la pasividad**: La pasividad de la evidencia establecida en FASE 5.2 se preserva incluso durante el kill-switch
- **Mantiene la independencia**: La independencia de evidencia respecto a ejecución se mantiene durante el kill-switch
- **No redefine evidencia**: Este documento no redefine ni modifica evidencia establecida en FASE 5.2

### 8.3. Coherencia con FASE 5.3 (Comportamiento ante Fallos de Registro)

Este documento es coherente con FASE 5.3 porque:

- **Respeta el principio de prescindibilidad**: El registro es prescindible, y el kill-switch lo desactiva completamente sin consecuencias
- **Preserva la independencia**: La independencia de ejecución respecto a registro se mantiene durante el kill-switch
- **Mantiene la no-propagación de errores**: Los errores de registro no se propagan, y el kill-switch descarta registro sin errores
- **No redefine comportamiento ante fallos**: Este documento no redefine ni modifica comportamiento establecido en FASE 5.3

### 8.4. Coherencia con FASE 5.4 (Límites Formales de Trazabilidad)

Este documento es coherente con FASE 5.4 porque:

- **Respeta la opcionalidad de trazabilidad**: La trazabilidad es opcional, y el kill-switch la desactiva completamente sin consecuencias
- **Preserva la no-invalidación**: La falta de correlación no invalida ejecuciones, y el kill-switch descarta trazabilidad sin invalidar
- **Mantiene la no-reparación**: No existe reconciliación, y el kill-switch descarta trazabilidad sin reconciliar
- **No redefine límites de trazabilidad**: Este documento no redefine ni modifica límites establecidos en FASE 5.4

### 8.5. Coherencia con Principios Fundamentales

Este documento es coherente con los principios fundamentales del BLOQUE 5:

- **D0 (Elixir no custodia datos)**: El kill-switch descarta información sin comprometer D0 porque no hay información que preservar
- **Default Deny**: El kill-switch desactiva observabilidad, preservando el principio de no-exposición por defecto
- **Apagabilidad**: La apagabilidad se preserva mediante el kill-switch, que es el mecanismo de apagado absoluto
- **Fail-closed**: El kill-switch desactiva observabilidad, preservando el principio de fail-closed

---

## 9. Criterios de Cierre de la FASE 5.6

### 9.1. Criterios de Cierre

La FASE 5.6 se considera cerrada cuando:

1. **Definición formal de kill-switch establecida**: La definición formal de kill-switch está completamente establecida y documentada
2. **Efectos inmediatos definidos**: Los efectos inmediatos del kill-switch sobre observación, registro, evidencia y auditoría están completamente definidos y documentados
3. **Reglas de no-persistencia establecidas**: Las reglas de no-persistencia absoluta están completamente establecidas y documentadas
4. **Invariantes post-apagado establecidos**: Los invariantes post-apagado están completamente establecidos y documentados
5. **Comportamiento canónico definido**: El comportamiento canónico ante activación del kill-switch está completamente definido y documentado
6. **Coherencia con fases anteriores verificada**: La coherencia con FASES 5.1 a 5.4 está verificada y documentada
7. **Frase canónica de cierre establecida**: La frase canónica de cierre, declarativa y no técnica, está establecida y documentada

### 9.2. Condiciones para Avance a Fase Siguiente

La FASE 5.6 habilita el avance a la siguiente fase del BLOQUE 5 cuando:

1. **Todos los criterios de cierre se cumplen**: Todos los criterios de cierre están satisfechos
2. **Comportamiento canónico operativo**: El comportamiento canónico del kill-switch está operativo y puede gobernar la desactivación del BLOQUE 5
3. **Garantías verificadas**: Las garantías de no-persistencia y no-obligaciones pendientes están verificadas y funcionando según lo documentado

**Regla explícita**: El avance a la siguiente fase requiere cumplimiento explícito de todos los criterios de cierre. No existe avance automático ni implícito.

---

## 10. Cierre Canónico de la Fase

### 10.1. Declaración Explícita de Cierre

La FASE 5.6 queda conceptualmente cerrada y establece el comportamiento canónico del kill-switch para el BLOQUE 5.

El comportamiento canónico del kill-switch definido por esta fase gobierna toda desactivación del BLOQUE 5 mediante kill-switch. Establece qué ocurre con la observabilidad, el registro, la evidencia y la auditoría cuando el sistema se apaga, garantizando que el apagado sea absoluto, inmediato y sin obligaciones pendientes.

El comportamiento canónico del kill-switch es definitivo para determinar cómo se desactiva el BLOQUE 5 cuando el kill-switch se activa. No hay mecanismo de apelación, bypass ni omisión de este comportamiento.

**Regla explícita**: El comportamiento canónico del kill-switch es canónico e inmodificable. Una vez aprobado, no admite reinterpretaciones ni extensiones.

### 10.2. Preparación para Fases Siguientes

La FASE 5.6 establece el comportamiento canónico del kill-switch necesario para fases siguientes del BLOQUE 5. Las fases siguientes utilizarán este comportamiento para definir cómo se implementa la desactivación, cómo se garantiza la no-persistencia, y cómo se respetan los invariantes post-apagado.

La FASE 5.6 no anticipa ni desarrolla las fases siguientes. Solo establece el comportamiento canónico del kill-switch que las fases siguientes utilizarán como base.

**Regla explícita**: La FASE 5.6 establece el comportamiento canónico del kill-switch. Las fases siguientes utilizarán este comportamiento para definir la implementación de la desactivación. No existe anticipación ni desarrollo de fases siguientes en este documento.

---

## 11. Frase Canónica de Cierre

**El kill-switch provoca la interrupción inmediata e incondicional de todas las operaciones del BLOQUE 5. La observabilidad, el registro, la evidencia y la auditoría se desactivan completamente sin preservación de estado, sin información retenida, sin obligaciones pendientes. Después del kill-switch, no existe reanudación automática, no existe reconciliación posterior, no existe rehidratación, no existe continuidad implícita. El apagado es absoluto, inmediato y sin estado residual. El BLOQUE 5 no tiene estado crítico que preservar, y la observabilidad no sobrevive al apagado. El kill-switch es el mecanismo canónico de apagado total del BLOQUE 5.**

---

## 12. Estado y Registro

**Estado del documento**: CANÓNICO  
**Versión**: 1.0  
**Fecha de cierre**: 2025-01-XX  
**Registrado en**: Git (commit canónico)  
**Relación**: Coherente con FASE 5.1 (Marco de Eventos Observables), FASE 5.2 (Modelo de Evidencia Mínima), FASE 5.3 (Comportamiento Canónico ante Fallos de Registro) y FASE 5.4 (Límites Formales de Trazabilidad)  
**Alcance**: BLOQUE 5 — Observabilidad, Evidencia y Auditoría Controlada

---

**Fin del documento**


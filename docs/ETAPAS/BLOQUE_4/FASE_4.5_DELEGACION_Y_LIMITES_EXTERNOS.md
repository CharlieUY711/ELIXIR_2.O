# FASE 4.5 — DELEGACIÓN Y LÍMITES EXTERNOS

**BLOQUE 4: Ejecución Operativa Controlada**  
**ETAPA 1: Fundación Operativa**

---

## ESTADO

**EN DEFINICIÓN**

---

## CONTEXTO CANÓNICO

Esta fase opera bajo las siguientes restricciones inmutables:

- **Elixir Core está SELLADO e INMODIFICABLE**
- **WAM (WhatsApp Enmascarado) existe solo como transporte**
- **Política D0 cerrada**: Elixir NO es custodio de datos
- **BLOQUES 1, 2 y 3 están COMPLETAMENTE CERRADOS**
- **FASES 4.1–4.4 están CERRADAS**:
  - FASE 4.1 — Modelo de Ejecución
  - FASE 4.2 — Estados de Ejecución
  - FASE 4.3 — Contrato de Acción
  - FASE 4.4 — Control de Cancelación y Apagado
- **BLOQUE 4 NO emite, NO evalúa, NO modifica habilitaciones**

---

## PRINCIPIO RECTOR

> **"El sistema debe seguir siendo apagable aunque ya esté ejecutando acciones."**

Este principio establece que la capacidad de control y apagado de Elixir debe preservarse incluso cuando las acciones se ejecutan fuera del sistema.

---

## 1. QUÉ ES DELEGACIÓN EN ELIXIR

### 1.1 Definición Canónica

**Delegación** es el acto mediante el cual Elixir transfiere la **ejecución material** de una acción a un sistema externo, conservando únicamente la **responsabilidad de control y supervisión** sobre el ciclo de vida de esa acción.

### 1.2 Características Esenciales

La delegación en Elixir se caracteriza por:

1. **Transferencia de Ejecución, No de Decisión**
   - Elixir decide QUÉ acción ejecutar y CUÁNDO
   - El sistema externo ejecuta CÓMO se materializa la acción
   - La decisión de delegar pertenece a Elixir

2. **Conservación del Control del Ciclo de Vida**
   - Elixir conserva la capacidad de iniciar, monitorear, cancelar y finalizar la acción
   - Elixir mantiene el estado de la acción delegada
   - Elixir puede revocar la delegación en cualquier momento

3. **Preservación de la Apagabilidad**
   - Elixir puede detener la ejecución externa
   - Elixir puede rechazar nuevas delegaciones
   - Elixir puede finalizar delegaciones en curso

4. **Desacoplamiento de la Materialización**
   - Elixir no conoce los detalles técnicos de la ejecución externa
   - Elixir no gestiona recursos externos
   - Elixir no garantiza el éxito de la ejecución externa

### 1.3 Alcance de la Delegación

La delegación abarca:

- **La ejecución material de la acción**
- **El uso de recursos externos necesarios para la ejecución**
- **La comunicación con sistemas externos requeridos**

La delegación NO abarca:

- **La decisión de ejecutar la acción** (pertenece a Elixir)
- **El control del ciclo de vida** (pertenece a Elixir)
- **La evaluación de resultados** (pertenece a Elixir)
- **La gestión de estados internos** (pertenece a Elixir)

---

## 2. QUÉ NO ES DELEGACIÓN

### 2.1 No es Transferencia de Responsabilidad

Delegar NO significa que Elixir se desentiende de la acción:

- Elixir sigue siendo responsable del control
- Elixir sigue siendo responsable de la apagabilidad
- Elixir sigue siendo responsable de la cancelación

### 2.2 No es Integración Técnica

Delegar NO implica:

- Definir protocolos de comunicación
- Establecer contratos de API
- Gestionar conexiones de red
- Manejar autenticación externa

### 2.3 No es Custodia de Datos

Delegar NO significa:

- Que Elixir almacene datos de la ejecución externa
- Que Elixir sea custodio de resultados externos
- Que Elixir retenga información más allá de lo necesario para el control

### 2.4 No es Garantía de Éxito

Delegar NO implica:

- Que Elixir garantice el éxito de la ejecución externa
- Que Elixir asuma responsabilidad por fallos externos
- Que Elixir compense errores del sistema externo

### 2.5 No es Evaluación de Habilitaciones

Delegar NO incluye:

- Evaluar si el usuario está habilitado (pertenece a BLOQUE 2)
- Modificar habilitaciones (pertenece a BLOQUE 2)
- Emitir decisiones de habilitación (pertenece a BLOQUE 2)

---

## 3. LÍMITES DE RESPONSABILIDAD DE ELIXIR

### 3.1 Responsabilidades que Elixir CONSERVA

Elixir es responsable de:

#### 3.1.1 Control del Ciclo de Vida
- **Iniciar** la delegación de la acción
- **Monitorear** el estado de la acción delegada
- **Cancelar** la acción delegada cuando sea necesario
- **Finalizar** la delegación (exitosamente o por cancelación)

#### 3.1.2 Preservación de la Apagabilidad
- **Rechazar nuevas delegaciones** cuando el sistema está en proceso de apagado
- **Cancelar delegaciones en curso** durante el apagado
- **Garantizar** que no queden acciones huérfanas tras el apagado

#### 3.1.3 Gestión del Estado Interno
- **Mantener** el estado de la acción según FASE 4.2
- **Actualizar** el estado según el progreso de la ejecución externa
- **Transicionar** el estado según FASE 4.2 cuando corresponda

#### 3.1.4 Coherencia con el Contrato de Acción
- **Respetar** el Contrato de Acción definido en FASE 4.3
- **Asegurar** que la delegación cumple con los términos del contrato
- **Finalizar** el contrato según sus términos

#### 3.1.5 Control de Cancelación
- **Aplicar** los mecanismos de cancelación de FASE 4.4
- **Garantizar** que las cancelaciones se propagan a la ejecución externa
- **Asegurar** que las cancelaciones se reflejan en el estado interno

### 3.2 Responsabilidades que Elixir NO ASUME

Elixir NO es responsable de:

#### 3.2.1 Ejecución Material
- **NO ejecuta** la acción materialmente
- **NO gestiona** recursos externos
- **NO controla** el proceso técnico de ejecución

#### 3.2.2 Éxito de la Ejecución Externa
- **NO garantiza** que la ejecución externa sea exitosa
- **NO asume** responsabilidad por fallos del sistema externo
- **NO compensa** errores técnicos externos

#### 3.2.3 Gestión de Recursos Externos
- **NO gestiona** conexiones, sesiones o recursos del sistema externo
- **NO mantiene** estado del sistema externo
- **NO optimiza** el uso de recursos externos

#### 3.2.4 Custodia de Datos de Ejecución
- **NO almacena** datos generados por la ejecución externa más allá de lo necesario para el control
- **NO retiene** información de ejecución una vez finalizada la delegación
- **NO es custodio** de resultados externos (Política D0)

#### 3.2.5 Garantías de Disponibilidad Externa
- **NO garantiza** que el sistema externo esté disponible
- **NO garantiza** tiempos de respuesta del sistema externo
- **NO garantiza** calidad del servicio externo

#### 3.2.6 Evaluación de Habilitaciones
- **NO evalúa** habilitaciones (pertenece a BLOQUE 2)
- **NO modifica** habilitaciones (pertenece a BLOQUE 2)
- **NO emite** decisiones de habilitación (pertenece a BLOQUE 2)

---

## 4. RIESGOS DE LA EJECUCIÓN EXTERNA

### 4.1 Riesgos de Control

#### 4.1.1 Pérdida de Control del Ciclo de Vida
**Riesgo**: El sistema externo puede no responder a solicitudes de cancelación o finalización.

**Mitigación**: Elixir debe poder marcar la acción como "no controlable" y aplicar mecanismos de fallback según FASE 4.4.

#### 4.1.2 Estados Huérfanos
**Riesgo**: La ejecución externa puede completarse sin notificar a Elixir, dejando estados internos inconsistentes.

**Mitigación**: Elixir debe definir timeouts y mecanismos de reconciliación de estados.

#### 4.1.3 Falta de Visibilidad
**Riesgo**: Elixir puede perder visibilidad del progreso de la ejecución externa.

**Mitigación**: Elixir debe definir mecanismos de monitoreo y actualización de estado, aceptando que la visibilidad puede ser limitada.

### 4.2 Riesgos de Apagabilidad

#### 4.2.1 Acciones No Cancelables
**Riesgo**: El sistema externo puede no soportar cancelación, dejando acciones ejecutándose tras el apagado.

**Mitigación**: Elixir debe poder marcar acciones como "no cancelables externamente" y aplicar estrategias de finalización forzada según FASE 4.4.

#### 4.2.2 Apagado Incompleto
**Riesgo**: El apagado puede quedar bloqueado esperando finalización de acciones externas.

**Mitigación**: Elixir debe definir timeouts de apagado y mecanismos de finalización forzada.

#### 4.2.3 Recuperación Post-Apagado
**Riesgo**: Acciones externas pueden completarse después del apagado, requiriendo reconciliación al reiniciar.

**Mitigación**: Elixir debe definir mecanismos de reconciliación de estado al reiniciar.

### 4.3 Riesgos de Coherencia

#### 4.3.1 Inconsistencia de Estado
**Riesgo**: El estado interno de Elixir puede desincronizarse con el estado real de la ejecución externa.

**Mitigación**: Elixir debe aceptar que el estado interno es una aproximación y definir mecanismos de reconciliación.

#### 4.3.2 Violación del Contrato de Acción
**Riesgo**: La ejecución externa puede violar los términos del Contrato de Acción (FASE 4.3).

**Mitigación**: Elixir debe poder detectar violaciones y aplicar mecanismos de finalización y compensación según el contrato.

#### 4.3.3 Duplicación de Acciones
**Risego**: Mecanismos de retry o reconciliación pueden causar ejecuciones duplicadas.

**Mitigación**: Elixir debe definir mecanismos de idempotencia y detección de duplicados.

### 4.4 Riesgos de Desacoplamiento

#### 4.4.1 Dependencia Encubierta
**Riesgo**: Elixir puede desarrollar dependencias implícitas del comportamiento del sistema externo.

**Mitigación**: Elixir debe mantener desacoplamiento estricto y no asumir comportamientos específicos del sistema externo.

#### 4.4.2 Acoplamiento de Estados
**Riesgo**: El estado interno puede acoplarse demasiado al estado del sistema externo.

**Mitigación**: Elixir debe mantener estados internos independientes y mapear solo lo necesario para el control.

#### 4.4.3 Propagación de Fallos
**Riesgo**: Fallos del sistema externo pueden propagarse y afectar la estabilidad de Elixir.

**Mitigación**: Elixir debe aislar fallos externos y no permitir que afecten su funcionamiento interno.

---

## 5. PRINCIPIOS DE DESACOPLAMIENTO

### 5.1 Principio de Independencia de Ejecución

Elixir debe poder funcionar correctamente independientemente de:
- La disponibilidad del sistema externo
- El éxito o fracaso de la ejecución externa
- Los detalles técnicos de la ejecución externa

### 5.2 Principio de Control Preservado

Elixir debe mantener control sobre:
- El ciclo de vida de la acción
- La capacidad de cancelación
- La capacidad de apagado

Incluso cuando el sistema externo no coopera.

### 5.3 Principio de Estado Aproximado

Elixir debe aceptar que:
- El estado interno es una aproximación del estado real
- Puede haber desincronización temporal
- La reconciliación puede ser necesaria

### 5.4 Principio de No Garantía Externa

Elixir NO debe:
- Garantizar el éxito de la ejecución externa
- Asumir disponibilidad del sistema externo
- Comprometer su estabilidad por fallos externos

### 5.5 Principio de Finalización Determinística

Elixir debe poder finalizar la delegación de forma determinística:
- Con éxito (ejecución externa completada)
- Por cancelación (cancelación aplicada)
- Por timeout (ejecución externa no responde)
- Por fallo (ejecución externa falló)

---

## 6. COHERENCIA CON FASES ANTERIORES

### 6.1 Coherencia con FASE 4.1 — Modelo de Ejecución

La delegación debe respetar el Modelo de Ejecución definido en FASE 4.1:
- La delegación es un mecanismo de ejecución
- La delegación no modifica el modelo de ejecución
- La delegación opera dentro del modelo de ejecución

### 6.2 Coherencia con FASE 4.2 — Estados de Ejecución

La delegación debe respetar los Estados de Ejecución definidos en FASE 4.2:
- La delegación transiciona estados según FASE 4.2
- La delegación no introduce nuevos estados
- La delegación mantiene coherencia de estados

### 6.3 Coherencia con FASE 4.3 — Contrato de Acción

La delegación debe respetar el Contrato de Acción definido en FASE 4.3:
- La delegación cumple con los términos del contrato
- La delegación no modifica el contrato
- La delegación finaliza el contrato según sus términos

### 6.4 Coherencia con FASE 4.4 — Control de Cancelación y Apagado

La delegación debe respetar el Control de Cancelación y Apagado definido en FASE 4.4:
- La delegación puede ser cancelada según FASE 4.4
- La delegación respeta los mecanismos de apagado
- La delegación no compromete la apagabilidad

---

## 7. GARANTÍAS Y NO GARANTÍAS

### 7.1 Garantías que Elixir PROPORCIONA

Elixir garantiza:

1. **Control del Ciclo de Vida**
   - Elixir iniciará, monitoreará y finalizará la delegación
   - Elixir mantendrá el estado de la acción

2. **Preservación de la Apagabilidad**
   - Elixir puede cancelar delegaciones en curso
   - Elixir puede rechazar nuevas delegaciones durante el apagado
   - Elixir no dejará acciones huérfanas tras el apagado

3. **Coherencia con el Contrato de Acción**
   - Elixir cumplirá con los términos del contrato
   - Elixir finalizará el contrato según sus términos

4. **Aplicación de Cancelación**
   - Elixir aplicará cancelaciones según FASE 4.4
   - Elixir propagará cancelaciones a la ejecución externa

### 7.2 Garantías que Elixir NO PROPORCIONA

Elixir NO garantiza:

1. **Éxito de la Ejecución Externa**
   - Elixir no garantiza que la ejecución externa sea exitosa
   - Elixir no garantiza que el sistema externo esté disponible
   - Elixir no garantiza tiempos de respuesta del sistema externo

2. **Cancelación Externa**
   - Elixir no garantiza que el sistema externo responda a cancelaciones
   - Elixir no garantiza que la cancelación se materialice externamente

3. **Visibilidad Completa**
   - Elixir no garantiza visibilidad completa del progreso externo
   - Elixir no garantiza actualizaciones en tiempo real

4. **Durabilidad de Resultados**
   - Elixir no garantiza que los resultados externos persistan
   - Elixir no es custodio de resultados externos (Política D0)

---

## 8. LÍMITES EXTERNOS DEL SISTEMA

### 8.1 Límite de Ejecución

**Límite**: Elixir NO ejecuta acciones materialmente fuera de su dominio.

**Implicación**: Toda acción que requiera ejecución material fuera de Elixir debe ser delegada.

### 8.2 Límite de Custodia

**Límite**: Elixir NO es custodio de datos según Política D0.

**Implicación**: Los datos generados por la ejecución externa no son custodiados por Elixir más allá de lo necesario para el control.

### 8.3 Límite de Garantía Externa

**Límite**: Elixir NO garantiza el éxito, disponibilidad o calidad de sistemas externos.

**Implicación**: Elixir debe operar correctamente incluso cuando los sistemas externos fallan.

### 8.4 Límite de Control Externo

**Límite**: Elixir NO controla directamente los recursos o procesos del sistema externo.

**Implicación**: Elixir controla la delegación, no la ejecución material externa.

### 8.5 Límite de Evaluación

**Límite**: Elixir NO evalúa, modifica ni emite decisiones sobre habilitaciones (pertenece a BLOQUE 2).

**Implicación**: La delegación opera sobre acciones ya autorizadas, no sobre habilitaciones.

---

## 9. MODELO CONCEPTUAL DE DELEGACIÓN

### 9.1 Fases de la Delegación

1. **Decisión de Delegar**
   - Elixir decide delegar una acción
   - Elixir identifica el sistema externo apropiado
   - Elixir prepara la delegación

2. **Inicio de la Delegación**
   - Elixir inicia la delegación
   - Elixir transfiere la ejecución al sistema externo
   - Elixir actualiza el estado interno

3. **Ejecución Externa**
   - El sistema externo ejecuta la acción materialmente
   - Elixir monitorea el estado (según disponibilidad)
   - Elixir puede cancelar en cualquier momento

4. **Finalización de la Delegación**
   - La delegación finaliza (éxito, cancelación, timeout o fallo)
   - Elixir actualiza el estado interno
   - Elixir finaliza el Contrato de Acción

### 9.2 Estados de la Delegación

La delegación puede estar en los siguientes estados (según FASE 4.2):

- **Pendiente**: Delegación iniciada pero ejecución externa no comenzada
- **En Ejecución**: Ejecución externa en curso
- **Completada**: Ejecución externa completada exitosamente
- **Cancelada**: Delegación cancelada por Elixir
- **Fallida**: Ejecución externa falló
- **Timeout**: Ejecución externa no respondió en tiempo esperado

### 9.3 Transiciones de Estado

Las transiciones de estado de la delegación deben respetar FASE 4.2 y ser coherentes con el Modelo de Ejecución de FASE 4.1.

---

## 10. CONCLUSIÓN

Este modelo conceptual define:

1. **Qué es Delegación**: Transferencia de ejecución material conservando control del ciclo de vida.

2. **Qué NO es Delegación**: No es transferencia de responsabilidad, integración técnica, custodia de datos, garantía de éxito ni evaluación de habilitaciones.

3. **Límites de Responsabilidad**: Elixir conserva control, apagabilidad y gestión de estado; NO asume ejecución material, éxito externo, gestión de recursos externos ni custodia de datos.

4. **Riesgos**: Control, apagabilidad, coherencia y desacoplamiento, cada uno con sus mitigaciones.

5. **Principios de Desacoplamiento**: Independencia, control preservado, estado aproximado, no garantía externa y finalización determinística.

6. **Coherencia**: Respeto a FASES 4.1–4.4 y BLOQUES anteriores.

7. **Garantías y No Garantías**: Claridad sobre qué garantiza Elixir y qué no.

8. **Límites Externos**: Definición explícita de los límites del sistema.

9. **Modelo Conceptual**: Fases, estados y transiciones de la delegación.

Este modelo proporciona la base conceptual para implementaciones futuras, manteniendo coherencia con el diseño canónico de Elixir y preservando el principio rector de apagabilidad.

---

## ESTADO FINAL

**PENDIENTE DE REVISIÓN Y CIERRE**

Este documento define el modelo conceptual de delegación y límites externos para FASE 4.5. Una vez revisado y aprobado, esta fase puede considerarse cerrada.


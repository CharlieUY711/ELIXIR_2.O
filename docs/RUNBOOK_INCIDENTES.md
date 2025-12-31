# Runbook de Incidentes — Elixir Platform

## Propósito
Definir cómo actuar ante incidentes sin violar el contrato de Elixir.
El objetivo no es "resolver rápido", sino **resolver sin degradar el sistema**.

## Principio rector
Ante un incidente, Elixir protege control, economía y silencio antes que continuidad total.

## Clasificación de incidentes

### Incidente Tipo I — Saturación / Pico
- Demanda excede capacidad
- Proveedores limitados
- Riesgo de USD saliente alto

Respuesta:
- Endurecer priorización de Clase A
- Favorecer Clase C
- No intervenir UX
- No comunicar saturación

Prohibido:
- Colas visibles
- Mensajes explicativos
- Derivaciones alternativas

---

### Incidente Tipo II — Falla de proveedor externo
- Modelo no disponible
- Servicio humano no responde
- Integración externa degradada

Respuesta:
- Cortar silenciosamente
- No reintentar automáticamente
- No redirigir a otro proveedor

Prohibido:
- "Estamos intentando reconectar"
- "Probá con otra opción"
- Justificaciones operativas

---

### Incidente Tipo III — Falla técnica interna
- Error del Core
- Fallo de decisión
- Edge inestable

Respuesta:
- Cerrar flujos afectados
- Preservar consistencia
- Priorizar integridad sobre disponibilidad

Prohibido:
- Hotfix visibles
- Mensajes técnicos
- Degradaciones explicativas

---

### Incidente Tipo IV — Abuso / Ataque
- Probing
- Reintentos masivos
- Uso anómalo

Respuesta:
- Endurecer cortes
- Reducir habilitación de Clase A y B
- Mantener silencio total

Prohibido:
- Advertencias
- Educación al usuario
- Señales de límite

---

### Incidente Tipo V — Error humano / Operativo
- Cambio indebido
- Ajuste mal aplicado
- Violación accidental del contrato

Respuesta:
- Revertir al último estado estable
- Documentar el error
- NO "compensar" con UX

Prohibido:
- Parches visibles
- Mensajes de disculpa explicativos
- Cambios rápidos de copy

---

## Regla de oro ante cualquier incidente

- Si requiere explicación → NO se hace
- Si requiere UX nueva → NO se hace
- Si requiere "tranquilizar" → NO se hace
- Si protege Core y Nectar → ES correcto

---

## Protocolo de comunicación

- No se comunica al usuario
- No se publica estado
- No se explican causas
- No se prometen soluciones

Elixir no informa incidentes: **los absorbe**.

---

## Post-mortem (interno)

Después de un incidente:
- Analizar impacto en USD saliente
- Analizar comportamiento de Nectar
- Ajustar reglas internas si hay tendencia
- Documentar aprendizaje sin cambiar UX

Nunca:
- cambiar pantallas
- cambiar textos
- cambiar flujos

---

## Señales de buena respuesta a incidentes

- El usuario no aprende nada nuevo
- El sistema sigue siendo impredecible
- El control se mantiene
- El impacto económico es contenido

## Señales de mala respuesta

- El usuario "entiende" qué pasó
- Se agregan mensajes
- Se pide paciencia
- Se explica el problema

---

## Frase canónica del Runbook

Cuando algo falla, Elixir se vuelve más silencioso, no más explicativo.


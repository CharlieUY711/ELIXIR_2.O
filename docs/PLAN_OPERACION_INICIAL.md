# Plan de Operación Inicial — Elixir Platform (30–60 días)

## Principio rector
Operar es observar y ajustar reglas internas, no tocar pantallas ni explicar decisiones.

## Condiciones de arranque (Día 0)
- Catálogo, Chat y Edge congelados
- Core con cortes silenciosos habilitados
- Nectar 100% interno e invisible
- Métricas solo internas
- Checklist técnico activo para PRs

## Ritmo operativo
- Días 1–14: observación pura
- Días 15–30: ajustes finos de reglas internas
- Días 31–60: estabilización y validación del mix de servicios

## Qué monitorear
### Salud económica
- USD entrante vs USD saliente
- Tendencia de USD saliente bajo picos
- Mix de servicios por Clase A/B/C
- Presión interna de Nectar

### Salud operativa
- Tasa de cortes por clase
- Latencia de decisión del Core
- Uso correcto del Edge (TTL, handoff único)
- Reintentos anómalos

### Salud de riesgo
- Patrones de probing
- Repetición de intentos
- Concentración de demanda
- Desviaciones por eventos

## Qué NO monitorear
- Conversión estética
- Funnel detallado
- Feedback para cambiar UX
- Comparativas visibles de valor o precio

## Intervenciones permitidas
- Ajuste de umbrales de priorización
- Ajuste de pesos internos de Nectar
- Ajuste de ventanas internas
- Endurecimiento o relajación de reglas de corte

## Intervenciones prohibidas
- Cambios de copy
- Nuevos mensajes
- Estados intermedios
- Explicaciones al usuario
- Optimizaciones de conversión

## Protocolo bajo picos
- Antes: endurecer Clase A, favorecer Clase C
- Durante: no intervenir manualmente
- Después: evaluar tendencias, no eventos aislados

## Manejo de feedback externo
- El feedback no modifica UX
- Las quejas no generan explicaciones
- Las sugerencias se evalúan contra NO_HACER

## Cadencia de revisión
- Semanal: USD neto, mix A/B/C, cortes
- Mensual: tendencias y ajustes de reglas internas

## Señales de éxito
- USD saliente estable o decreciente
- Crecimiento de servicios Clase C
- UX idéntica al día 1
- Menos intervención manual con el tiempo

## Señales de alarma
- USD saliente creciendo más rápido que el tráfico
- Dominancia prolongada de Clase A
- Necesidad recurrente de explicar decisiones
- Tentación de cambiar UX

## Frase canónica
Operar Elixir es resistir el impulso de mejorar la experiencia.


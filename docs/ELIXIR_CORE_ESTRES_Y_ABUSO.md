# Elixir Core: Estrés y Abuso

## 1. Propósito

Este documento define cómo responde el Core bajo estrés o abuso. El Core ajusta su comportamiento interno cuando detecta patrones que comprometen la estabilidad del sistema. Las respuestas del Core son automáticas, silenciosas y no negociables.

## 2. Tipos de estrés

### Volumen elevado

El Core detecta cuando el número de solicitudes por unidad de tiempo excede umbrales internos. El volumen elevado se mide por la frecuencia de consultas desde una misma fuente o desde múltiples fuentes simultáneas.

### Insistencia

El Core identifica patrones de solicitudes repetidas con variaciones mínimas. La insistencia se caracteriza por reintentos inmediatos tras denegaciones o consultas idénticas en intervalos cortos.

### Uso errático

El Core reconoce secuencias de solicitudes que no siguen patrones esperados. El uso errático incluye cambios abruptos en el tipo de operaciones, consultas sin contexto previo o saltos entre funcionalidades sin transición.

### Bypass de capas

El Core detecta intentos de acceder directamente a funcionalidades que requieren intermediación de otras capas. El bypass se identifica cuando las solicitudes omiten flujos establecidos o intentan ejecutar operaciones fuera de secuencia.

## 3. Tipos de abuso

### Lenguaje inapropiado

El Core identifica contenido que contiene lenguaje ofensivo, amenazante o que intenta manipular el sistema mediante instrucciones maliciosas. El Core no procesa ni responde a este tipo de contenido.

### Automatización

El Core detecta patrones que indican uso automatizado no autorizado. La automatización se identifica por regularidad mecánica en los tiempos de solicitud, ausencia de variación humana o secuencias predecibles.

### Reintentos forzados

El Core reconoce intentos sistemáticos de forzar respuestas mediante múltiples reintentos de solicitudes denegadas. Los reintentos forzados se caracterizan por persistencia inmediata tras denegaciones sin modificar los parámetros de la solicitud.

### Exploración sistemática

El Core detecta intentos de mapear funcionalidades mediante consultas secuenciales o exhaustivas. La exploración sistemática se identifica por patrones de consulta que buscan descubrir límites, parámetros válidos o comportamientos internos.

## 4. Respuestas del Core

### Aumento del consumo interno

El Core incrementa el costo interno de procesamiento para solicitudes que provienen de fuentes bajo estrés. El aumento del consumo se aplica automáticamente y no se comunica externamente. Las solicitudes se procesan, pero requieren mayor inversión de recursos internos.

### Denegación temporal

El Core deniega temporalmente solicitudes de fuentes que muestran patrones de estrés o abuso. La denegación temporal tiene duración variable según la severidad del patrón detectado. No se proporciona explicación ni tiempo estimado de restauración.

### Denegación definitiva

El Core deniega de forma permanente solicitudes de fuentes que muestran abuso sistemático o intentos de comprometer el sistema. La denegación definitiva no tiene reversión automática y no se comunica externamente.

### Cortes silenciosos

El Core interrumpe el procesamiento de solicitudes sin notificación. Los cortes silenciosos se aplican cuando el estrés o abuso alcanza niveles que comprometen la estabilidad del sistema. Las solicitudes se descartan sin respuesta.

## 5. Qué NO hace el Core bajo estrés

### No explica

El Core no proporciona explicaciones sobre denegaciones, aumentos de consumo o cortes. Las decisiones internas permanecen internas.

### No notifica

El Core no envía notificaciones sobre cambios en su comportamiento. Las respuestas se aplican sin comunicación externa.

### No negocia

El Core no acepta negociación sobre sus respuestas. Las decisiones son finales y no están sujetas a apelación o modificación mediante solicitudes externas.

### No rediseña UX

El Core no modifica interfaces de usuario ni flujos de interacción. Las respuestas del Core afectan únicamente el procesamiento interno, no la presentación externa.

## 6. Relación con otras capas

### Chat ejecuta cortes

El Chat recibe señales del Core que indican cortes o denegaciones. El Chat ejecuta estos cortes sin exponer la lógica interna del Core. El Chat puede presentar mensajes genéricos, pero no revela las razones del Core.

### Edge invalida handoff

El Edge recibe señales del Core que invalidan handoffs cuando se detecta estrés o abuso en la fuente. El Edge bloquea la transferencia de control sin explicar la razón interna.

### Catálogo permanece pasivo

El Catálogo no recibe señales directas del Core sobre estrés o abuso. El Catálogo mantiene su funcionamiento normal y no participa en las respuestas del Core a situaciones de estrés.

## 7. Métricas internas permitidas

### Saturación

El Core puede medir internamente el nivel de saturación del sistema. La saturación refleja la capacidad utilizada y los recursos disponibles. Esta métrica es exclusivamente interna y no se expone externamente.

### Ratio de denegación

El Core puede calcular internamente el porcentaje de solicitudes denegadas por fuente o por tipo de operación. El ratio de denegación se usa para ajustar respuestas automáticas. Esta métrica es exclusivamente interna.

### Consumo agregado

El Core puede medir internamente el consumo total de recursos por fuente o por operación. El consumo agregado incluye procesamiento, almacenamiento y comunicación. Esta métrica es exclusivamente interna.

## 8. Frase canónica

Bajo presión, el Core ajusta reglas; nunca expone el sistema.

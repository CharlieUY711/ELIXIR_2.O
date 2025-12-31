# Elixir Core: Secuencia de Decisiones

## 1. Propósito

Este documento define la secuencia mínima de decisiones del Elixir Core. La secuencia establece el orden obligatorio de evaluaciones y acciones que el Core ejecuta ante cada solicitud de autorización. La secuencia es invariable y no admite omisiones ni alteraciones.

## 2. Evento de inicio

La secuencia comienza ante una solicitud desde el Chat para autorizar derivación al Edge. El Core recibe el contexto mínimo necesario para evaluar la solicitud. No se inicia la secuencia por eventos internos, automáticos o programados. Solo las solicitudes explícitas del Chat activan el proceso de decisión.

## 3. Evaluaciones iniciales

### Validez del contexto de sesión

El Core verifica que el contexto de sesión recibido sea válido y coherente. La validez incluye la existencia de identificadores necesarios, la integridad de la información de contexto y la correspondencia con estados internos conocidos. Si el contexto no es válido, la secuencia termina con denegación.

### Coherencia básica de señales recibidas

El Core evalúa que las señales recibidas sean coherentes entre sí y con el estado esperado del sistema. La coherencia incluye la consistencia de tipos de datos, la correspondencia con patrones esperados y la ausencia de contradicciones evidentes. Si las señales no son coherentes, la secuencia termina con denegación.

### Aplicación de reglas de corte activas

El Core consulta las reglas de corte activas en el momento de la solicitud. Las reglas de corte definen condiciones que requieren denegación inmediata sin evaluación adicional. Si alguna regla de corte aplica, la secuencia termina con denegación sin proceder a evaluaciones posteriores.

## 4. Evaluación de señales internas

### Consulta de señales acumuladas

El Core consulta las señales acumuladas en Nectar que reflejan el estado histórico y actual del sistema. Las señales incluyen patrones de uso, restricciones activas, condiciones de estrés y cualquier información relevante para la decisión. El Core utiliza estas señales como base para evaluar la solicitud.

### Ajuste de consumo según contexto

El Core ajusta el consumo interno de señales según el contexto de la solicitud. El ajuste refleja el costo de procesamiento requerido, las condiciones de estrés detectadas y los patrones de uso observados. El ajuste se calcula internamente y no se comunica externamente.

### Determinación de umbrales internos

El Core determina los umbrales internos aplicables a la solicitud según el estado actual del sistema. Los umbrales definen los límites de operación permitidos y se calculan dinámicamente según las condiciones internas. Los umbrales no son fijos ni predefinidos, sino que se ajustan según el contexto.

## 5. Decisión primaria

### Autorizar derivación

El Core autoriza la derivación cuando todas las evaluaciones previas resultan favorables y no existen impedimentos para la operación. La autorización se emite con los parámetros necesarios para que el Edge proceda con la comunicación externa. La autorización es definitiva y no admite revocación posterior.

### Denegar derivación

El Core deniega la derivación cuando alguna evaluación previa resulta desfavorable o cuando existen impedimentos para la operación. La denegación es definitiva y no admite apelación. No se proporciona explicación ni detalle sobre las razones de la denegación.

## 6. Acciones posteriores a la decisión

### Si autoriza

El Core emite la autorización al Edge con los parámetros necesarios para la operación. La autorización incluye la información mínima requerida para establecer la comunicación externa y ejecutar la derivación solicitada.

El Core registra el consumo interno de señales según el ajuste calculado durante la evaluación. El registro actualiza el estado interno del sistema y se refleja en las señales acumuladas de Nectar para futuras evaluaciones.

### Si denega

El Core registra la denegación en el estado interno del sistema. El registro incluye la información necesaria para mantener coherencia en las señales acumuladas y para futuras evaluaciones de solicitudes similares.

El Core no emite explicación sobre la denegación. Las razones de la decisión permanecen internas y no se comunican a capas superiores ni al usuario final.

## 7. Manejo de excepciones

Cualquier error que ocurra durante la secuencia de decisiones se trata como denegación. Los errores incluyen fallos en la consulta de señales, errores en el cálculo de umbrales, fallos en la comunicación con Nectar o cualquier excepción no prevista durante el procesamiento.

No se propaga información de error a capas superiores. Las capas superiores reciben únicamente la denegación sin detalle sobre la causa técnica. El Core mantiene el registro interno del error para propósitos de diagnóstico, pero esta información no se expone externamente.

## 8. Invariantes

### La secuencia no depende de UI

La secuencia de decisiones del Core opera independientemente de cualquier interfaz de usuario. Las decisiones se toman según reglas internas y señales del sistema, sin influencia de presentación visual, interacciones del usuario o estados de interfaz.

### La secuencia no expone reglas

La secuencia de decisiones no revela las reglas aplicadas ni los criterios utilizados para tomar decisiones. Las reglas permanecen internas y no se comunican a otras capas ni al usuario final. Las decisiones se presentan como resultados binarios sin justificación expuesta.

### La secuencia no cambia por presión externa

La secuencia de decisiones no se modifica por solicitudes externas, condiciones de presión o intentos de influencia. Las reglas y el orden de evaluación son invariables y no admiten alteración mediante parámetros externos, configuración dinámica o solicitudes de modificación.

## 9. Frase canónica de cierre

El Core decide en silencio y las capas obedecen.


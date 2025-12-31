# Decision CLI - Arquitectura

## 1. Propósito

### Qué es Decision CLI

Decision CLI es una herramienta de línea de comandos diseñada para evaluar y probar decisiones de autorización de manera independiente. Permite a los desarrolladores y evaluadores de producto probar escenarios de decisión sin necesidad de ejecutar sistemas completos o interfaces de usuario.

### Qué problema resuelve

- **Evaluación rápida**: Permite probar decisiones de autorización de forma inmediata desde la terminal
- **Validación de experiencia humana**: Facilita la validación manual de cómo se comportan las decisiones en diferentes escenarios
- **Testing previo a publicación**: Permite verificar el comportamiento de las decisiones antes de integrarlas en sistemas productivos
- **Independencia de infraestructura**: No requiere servicios HTTP, bases de datos o interfaces gráficas para funcionar

### Qué NO es

- **No es un componente productivo**: Decision CLI es exclusivamente una herramienta de evaluación y testing
- **No es parte del Core**: No forma parte de Elixir Core ni depende de él directamente
- **No es una API**: No expone endpoints HTTP ni servicios web
- **No es una interfaz de usuario**: No proporciona interfaces gráficas o web
- **No es un sistema de persistencia**: No almacena ni gestiona datos de manera permanente

## 2. Principios

### Core-agnostic

Decision CLI está diseñado para ser independiente de cualquier implementación específica de motor de decisiones. No conoce los detalles internos de Elixir Core ni de ningún otro sistema.

### Adapter-based

La integración con sistemas de decisión (como Elixir) se realiza mediante adaptadores. Cada adaptador implementa una interfaz común que permite a Decision CLI interactuar con diferentes motores de decisión sin conocer sus detalles internos.

### Output mínimo

Decision CLI produce únicamente el resultado esencial de la decisión:
- `ALLOW`: La solicitud está autorizada
- `DENY`: La solicitud está denegada

No incluye:
- Razones de la decisión
- Metadata adicional
- Explicaciones detalladas
- Información de auditoría

### Herramienta de evaluación, no de producción

Decision CLI está diseñada exclusivamente para:
- Testing manual
- Evaluación de producto
- Validación de comportamiento
- Experimentación

No está diseñada para:
- Uso en producción
- Integración con sistemas productivos
- Procesamiento de alto volumen
- Operaciones críticas

## 3. Relación con Elixir

### Elixir es un adapter

Elixir Core se integra con Decision CLI a través de un adaptador ubicado en `/apps/decision-cli/src/adapters/elixir/`. Este adaptador:

- Implementa la interfaz común de Decision CLI
- Se comunica con Elixir Core como un cliente externo
- No modifica ni extiende Elixir Core
- Puede ser reemplazado o removido sin afectar Elixir Core

### El Core no depende del CLI

Elixir Core no tiene conocimiento de la existencia de Decision CLI. No hay:
- Dependencias del Core hacia el CLI
- Código específico del CLI en el Core
- Modificaciones al Core para soportar el CLI

### El CLI no modifica el Core

Decision CLI interactúa con Elixir Core de la misma manera que cualquier otro cliente:
- Utiliza las interfaces públicas del Core
- No requiere modificaciones al Core
- No introduce dependencias circulares
- Mantiene separación de responsabilidades

## 4. Casos de uso

### Evaluación interna de producto

Los equipos de producto pueden usar Decision CLI para:
- Probar rápidamente diferentes escenarios de autorización
- Validar que las decisiones se comportan como se espera
- Experimentar con diferentes configuraciones sin afectar sistemas productivos

### Validación de experiencia humana

Los evaluadores pueden usar Decision CLI para:
- Simular interacciones humanas con el sistema de decisiones
- Verificar el comportamiento en casos límite
- Validar la experiencia antes de publicar cambios

### Testing manual previo a publicación

Los desarrolladores pueden usar Decision CLI para:
- Verificar decisiones antes de desplegar cambios
- Probar reglas nuevas de forma aislada
- Validar que las modificaciones no rompen comportamientos esperados

## 5. No-alcance explícito

### No UI

Decision CLI no proporciona:
- Interfaces gráficas
- Interfaces web
- Dashboards
- Visualizaciones

### No HTTP

Decision CLI no expone:
- Servidores HTTP
- APIs REST
- WebSockets
- Endpoints de red

### No persistencia

Decision CLI no:
- Almacena resultados
- Mantiene historial
- Gestiona bases de datos
- Persiste configuraciones

### No configuración avanzada

Decision CLI no incluye:
- Sistemas de configuración complejos
- Gestión de perfiles
- Configuración persistente
- Herramientas de administración

---

## Congelamiento de alcance

Este documento congela el alcance inicial del Decision CLI. Cualquier modificación a estos principios, casos de uso o no-alcance debe ser documentada y justificada antes de su implementación.


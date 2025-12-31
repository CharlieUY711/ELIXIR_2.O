# FASE 4: Gobernanza y Orden

## 1. Propósito

Este documento establece la gobernanza y el orden de implementación del sistema Elixir. Define las reglas de autoridad, los límites de cambio y los protocolos de operación que garantizan la estabilidad y coherencia del sistema bajo condiciones normales y de estrés.

## 2. Autoridad de Cambio

Elixir Core es la autoridad única de decisión para todas las reglas de negocio, flujos de datos y comportamientos del sistema. Ninguna capa visual, interfaz de usuario o componente de presentación tiene autoridad para decidir reglas, modificar flujos o alterar comportamientos establecidos.

Las decisiones de gobernanza se toman exclusivamente en Elixir Core. Las capas superiores ejecutan y presentan, pero no deciden.

## 3. Orden Obligatorio de Implementación

El sistema Elixir se implementa siguiendo un orden estricto y secuencial. Este orden no puede ser alterado, omitido o invertido bajo ninguna circunstancia.

1. **Catálogo** — Cerrado. Base de presentación de productos y servicios.
2. **Chat** — Cerrado. Orquestación de conversaciones y decisiones de usuario.
3. **WhatsApp Edge** — Cerrado. Interfaz de comunicación externa.
4. **Core** — Reglas internas, lógica de negocio y gestión de estado.
5. **Nectar** — Optimización interna, caché y mejoras de rendimiento.

Cada fase debe estar completamente cerrada y validada antes de iniciar la siguiente. Está prohibido alterar este orden, implementar fases en paralelo o saltar etapas.

## 4. Cambios Permitidos

Se permiten únicamente los siguientes tipos de cambios:

- **Correcciones de bugs**: Reparación de comportamientos erróneos que no cumplen con la especificación documentada.
- **Ajustes internos sin exposición**: Modificaciones en implementación interna que no alteran interfaces, contratos o comportamientos visibles.
- **Optimización de performance sin cambio de comportamiento**: Mejoras en rendimiento, latencia o eficiencia que mantienen exactamente el mismo comportamiento funcional.

Todos los cambios permitidos deben ser documentados y validados antes de su implementación.

## 5. Cambios Prohibidos

Está estrictamente prohibido realizar los siguientes tipos de cambios:

- **Exponer reglas**: Hacer visibles o accesibles reglas de negocio, lógica de decisión o flujos internos a capas visuales o externas.
- **Exponer estados**: Revelar estados internos, transiciones o información de gestión que debe permanecer encapsulada.
- **Exponer Nectar**: Hacer accesible cualquier componente, métrica o funcionalidad de optimización interna a capas superiores.
- **Bypass del Chat o Edge**: Crear rutas directas que omitan las capas de orquestación o comunicación establecidas.
- **Features no documentadas**: Implementar funcionalidades, comportamientos o interfaces que no estén previamente documentadas y aprobadas.

La violación de estas prohibiciones compromete la integridad arquitectónica del sistema.

## 6. Gestión Bajo Estrés

Cuando el sistema opera bajo condiciones de estrés, alta carga o presión operacional, se aplican los siguientes protocolos:

- **Ajustar reglas internas**: Modificar parámetros, umbrales o lógica interna en Elixir Core para adaptarse a las condiciones sin alterar interfaces o contratos.
- **Reducir superficie**: Minimizar la exposición de funcionalidades, limitar endpoints activos y simplificar flujos para reducir puntos de fallo.
- **Priorizar cortes silenciosos**: Implementar mecanismos de degradación que fallen de forma silenciosa y controlada, sin exponer errores o estados internos.
- **Nunca rediseñar UX bajo presión**: Bajo ninguna circunstancia se modifica la experiencia de usuario, interfaces visuales o flujos de interacción durante períodos de estrés. Los ajustes se realizan exclusivamente en la capa interna.

La estabilidad del sistema durante el estrés depende del respeto a estos protocolos.

## 7. Métricas Internas Permitidas

Las siguientes métricas pueden ser monitoreadas y utilizadas internamente para la gestión del sistema:

- **Saturación**: Nivel de utilización de recursos y capacidad del sistema.
- **Tiempo de decisión**: Latencia en la toma de decisiones y procesamiento de reglas.
- **Ratio de corte**: Frecuencia y patrones de interrupciones o finalizaciones de flujos.
- **Errores de handoff**: Fallos en la transferencia de contexto entre capas o servicios.

Estas métricas son exclusivamente para uso interno y no deben ser expuestas a capas visuales o externas.

## 8. Frase Canónica de Cierre

**El orden protege al sistema cuando la presión aumenta.**


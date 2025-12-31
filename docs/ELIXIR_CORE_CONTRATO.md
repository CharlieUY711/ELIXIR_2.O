# Contrato del Elixir Core

## 1. Propósito del Elixir Core

El Elixir Core es la autoridad única de decisión del sistema. Su propósito es ejercer el control normativo sobre las operaciones que requieren autorización, limitación o ajuste de comportamiento interno.

El Core decide. Las capas ejecutan.

## 2. Qué es el Elixir Core

El Elixir Core es el núcleo de reglas del sistema. Opera como motor de decisiones y gestor de señales internas. Su función es evaluar condiciones, aplicar reglas y emitir autorizaciones o restricciones según el estado interno del sistema.

El Core mantiene la coherencia del sistema mediante la gestión de señales internas que reflejan el estado acumulado de operaciones y condiciones del entorno.

## 3. Qué NO es el Elixir Core

El Elixir Core no es interfaz de usuario. No presenta información visual ni recibe interacciones directas del usuario.

El Elixir Core no es Chat. No procesa mensajes, no mantiene conversaciones ni gestiona flujos de diálogo.

El Elixir Core no es Edge. No se comunica con servicios externos ni gestiona protocolos de comunicación externa.

El Elixir Core no es sistema de pagos. No procesa transacciones financieras ni gestiona medios de pago.

El Elixir Core no es catálogo. No almacena información de productos, servicios o modelos disponibles.

## 4. Inputs que recibe

El Elixir Core recibe señales del Chat cuando se requiere una decisión de autorización o limitación.

Recibe contexto mínimo del flujo necesario para evaluar la solicitud. Este contexto incluye información esencial para la decisión, sin detalles operativos innecesarios.

Recibe señales internas acumuladas que reflejan el estado histórico y actual del sistema, incluyendo patrones de uso, restricciones activas y condiciones internas relevantes.

## 5. Decisiones que toma

El Elixir Core autoriza derivación cuando las condiciones del sistema y las reglas aplicables permiten la operación solicitada.

El Elixir Core deniega derivación cuando las condiciones del sistema o las reglas aplicables no permiten la operación solicitada.

El Elixir Core limita acceso cuando es necesario restringir operaciones según el estado interno del sistema o condiciones de uso.

El Elixir Core ajusta consumo interno de señales según las decisiones tomadas y el estado resultante del sistema.

## 6. Outputs que emite

El Elixir Core emite autorización o rechazo como respuesta a las solicitudes recibidas. La autorización incluye los parámetros necesarios para que la capa solicitante proceda con la operación.

Emite parámetros internos para el Edge cuando la autorización requiere configuración específica para la comunicación externa.

Emite actualización de señales para reflejar el nuevo estado interno del sistema después de cada decisión tomada.

## 7. Relación con otras capas

Con el Catálogo: el Elixir Core no interactúa. El Catálogo opera de forma independiente y no requiere decisiones del Core.

Con el Chat: el Elixir Core responde decisiones. El Chat solicita autorizaciones y recibe respuestas del Core para proceder o detener operaciones.

Con el Edge: el Elixir Core autoriza handoff. El Edge requiere autorización del Core antes de establecer comunicación externa o realizar operaciones que afecten el estado del sistema.

Con Nectar: el Elixir Core consume y ajusta señales. Nectar proporciona información de estado y el Core utiliza y modifica estas señales según sus decisiones.

## 8. Prohibiciones explícitas

El Elixir Core no expone reglas. Las reglas internas son privadas y no deben ser accesibles fuera del Core.

El Elixir Core no expone estados. El estado interno del sistema es confidencial y no debe ser visible para otras capas.

El Elixir Core no expone señales. Las señales internas son privadas y su detalle no debe ser accesible fuera del Core.

El Elixir Core no interactúa con el usuario. Toda comunicación con el usuario debe ser gestionada por las capas correspondientes, no por el Core.

## 9. Frase canónica

El Core decide. Las capas ejecutan.

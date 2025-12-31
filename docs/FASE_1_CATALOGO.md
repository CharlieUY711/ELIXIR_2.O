# FASE 1 — CATÁLOGO

## Rol del Catálogo

El Catálogo es la capa visual de conversión de Elixir Platform. Su función única es presentar modelos disponibles y facilitar la transición del usuario hacia el sistema de orquestación transaccional. Opera como punto de entrada pasivo que no retiene estado ni procesa lógica de negocio.

## Qué es y qué no es

El Catálogo es una interfaz de presentación que convierte intención visual en acción de inicio de sesión transaccional. No es un marketplace, no es un directorio de servicios, no es un sistema de recomendaciones y no es una plataforma de comunicación.

El Catálogo no gestiona identidad de usuario, no maneja autenticación, no procesa pagos, no almacena preferencias y no mantiene historial de interacciones. El Catálogo no toma decisiones sobre disponibilidad, no valida saldo y no ejecuta reglas de negocio.

## Principios rectores

El Catálogo opera bajo el principio de mínima fricción. Cada elemento visual y cada interacción están diseñados para reducir la distancia entre la intención del usuario y el inicio de la transacción. La presentación es visual, la navegación es inmediata y la acción es única.

El Catálogo mantiene separación estricta de responsabilidades. No contiene lógica de negocio, no consulta sistemas externos para validación y no procesa respuestas del sistema de orquestación. El Catálogo es una capa de presentación pura que delega toda la inteligencia del sistema a las capas siguientes.

## Reglas de UX

La experiencia de usuario del Catálogo se rige por la simplicidad y la inmediatez. La interfaz presenta información mínima necesaria: identidad visual del modelo, descripción breve y acción única de inicio. No requiere registro, no solicita datos personales y no expone complejidad del sistema.

El feedback visual durante la conexión es obligatorio. El usuario debe recibir indicación clara del estado de su solicitud. Los errores se comunican de forma directa sin exponer detalles técnicos. El Catálogo no mantiene estado de sesión ni recupera contexto después de errores.

## Qué acciones permite

El Catálogo permite una única acción: iniciar el proceso de orquestación transaccional mediante la selección de un modelo. Esta acción genera una solicitud de inicio de sesión que se transmite al sistema de orquestación sin retención de estado en el Catálogo.

El Catálogo permite la presentación visual de modelos disponibles. Permite la navegación entre opciones y la visualización de información básica de cada modelo. Permite la interacción con el botón de inicio que desencadena el flujo transaccional.

## Qué acciones NO permite

El Catálogo no permite autenticación de usuario. No permite consulta de saldo. No permite visualización de historial de transacciones. No permite configuración de preferencias. No permite comunicación directa con modelos. No permite gestión de sesiones activas.

El Catálogo no permite lógica condicional basada en estado del usuario. No permite validaciones de negocio. No permite integración directa con sistemas de pago. No permite almacenamiento de datos de sesión. No permite recuperación de contexto después de errores.

## Criterios de cierre de la fase

La Fase 1 del Catálogo se considera completa cuando la capa visual presenta modelos disponibles, permite selección mediante acción única, transmite la solicitud de inicio al sistema de orquestación, proporciona feedback visual durante la conexión y maneja errores sin exponer complejidad técnica.

La fase se cierra cuando el Catálogo opera como capa pasiva que no retiene estado, no procesa lógica de negocio y mantiene separación estricta de responsabilidades con las capas siguientes del sistema.

## Frase canónica de la fase

El Catálogo convierte intención visual en acción transaccional sin retener estado ni procesar lógica de negocio.


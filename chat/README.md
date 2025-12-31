# Chat / WhatsApp Gateway

## Qué Hace el Módulo

El módulo **Chat/WhatsApp Gateway** gestiona la operación y ruteo de comunicación a través de WhatsApp. Es responsable de la interfaz principal de interacción con usuarios, manteniendo un BOT invisible que proporciona una experiencia natural y fluida.

- Gestión de conexiones con WhatsApp Business API
- Ruteo de mensajes y operaciones
- Procesamiento de mensajes entrantes y salientes
- Operación y coordinación de flujos de conversación
- Mantenimiento de BOT invisible para experiencia natural

## Qué NO Hace

- No almacena el catálogo de modelos (eso es responsabilidad del backend del Catálogo)
- No procesa transacciones financieras directamente (eso es Elixir)
- No gestiona la interfaz web (eso es el frontend del Catálogo)
- No gestiona saldo (eso es Elixir)
- No gestiona servicios, solo rutea y opera

## Módulos que Consume o Expone

### Consume
- Información del Catálogo para responder consultas de usuarios
- APIs de Elixir para consultas financieras o procesamiento de pagos
- Backend para obtener datos necesarios para las conversaciones

### Expone
- Gateway de WhatsApp para comunicación
- APIs de ruteo y operación de mensajes
- Interfaz de comunicación con usuarios

## Qué Tipo de Cambios son Aceptables

- Cambios en la lógica de ruteo de mensajes
- Mejoras en la integración con WhatsApp
- Optimizaciones de flujos de conversación
- Actualizaciones en la operación de mensajes
- Mejoras en la experiencia del BOT invisible
- **NO** cambios que gestionen datos del catálogo directamente
- **NO** cambios que procesen transacciones financieras
- **NO** cambios que gestionen saldo

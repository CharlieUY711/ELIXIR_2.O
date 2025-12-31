# Chat / WhatsApp Gateway

## Rol del Módulo

El módulo **Chat/WhatsApp Gateway** es el backend que gestiona la comunicación a través de WhatsApp y otros canales de chat, permitiendo interacción en tiempo real con los usuarios.

## Qué Hace

- Gestiona conexiones con WhatsApp Business API
- Procesa mensajes entrantes y salientes
- Enruta conversaciones y respuestas automatizadas
- Integra con otros módulos para proporcionar información contextual

## Qué NO Hace

- No almacena el catálogo de modelos (eso es responsabilidad del backend del Catálogo)
- No procesa transacciones financieras (eso es Elixir)
- No gestiona la interfaz web (eso es el frontend del Catálogo)
- No maneja autenticación de usuarios finales directamente

## Relación con Otros Módulos

- **Catálogo**: Puede consultar información de modelos para responder consultas de usuarios
- **Elixir**: Puede solicitar información financiera o procesar consultas relacionadas con pagos
- **Backend (futuro)**: Se integra con APIs del backend para obtener datos necesarios para las conversaciones


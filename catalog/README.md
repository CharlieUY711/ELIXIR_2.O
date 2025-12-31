# Catálogo de Modelos

## Rol del Módulo

El módulo **Catálogo** es la interfaz web frontend que permite a los usuarios explorar, buscar y visualizar el catálogo de modelos disponibles en la plataforma.

## Qué Hace

- Proporciona una interfaz web interactiva para navegar el catálogo
- Permite búsqueda y filtrado de modelos
- Muestra información detallada de cada modelo
- Facilita la interacción del usuario con el sistema

## Qué NO Hace

- No gestiona la lógica de negocio (eso corresponde al backend)
- No almacena datos directamente (consume APIs)
- No maneja autenticación/autorización directamente
- No procesa pagos o transacciones financieras (eso es Elixir)

## Relación con Otros Módulos

- **Chat/WhatsApp Gateway**: Puede integrarse para notificaciones o soporte en tiempo real
- **Elixir**: Puede consumir información financiera relacionada con modelos (precios, disponibilidad, etc.)
- **Backend (futuro)**: Consume APIs REST/GraphQL para obtener datos del catálogo


# Elixir - Módulo Financiero

## Rol del Módulo

El módulo **Elixir** es el sistema financiero interno que gestiona todas las operaciones relacionadas con transacciones, pagos, facturación y gestión financiera, integrado con Nectar.

## Qué Hace

- Gestiona transacciones financieras
- Procesa pagos y facturación
- Integra con Nectar para operaciones financieras
- Mantiene registros contables y financieros
- Proporciona APIs financieras para otros módulos

## Qué NO Hace

- No gestiona la interfaz de usuario (eso es el frontend del Catálogo)
- No maneja comunicación con usuarios (eso es el Chat Gateway)
- No almacena el catálogo de modelos (eso es responsabilidad del backend del Catálogo)
- No procesa mensajes de chat directamente

## Relación con Otros Módulos

- **Catálogo**: Proporciona información de precios, disponibilidad financiera y procesa pagos relacionados con modelos
- **Chat/WhatsApp Gateway**: Puede procesar pagos iniciados desde conversaciones de chat
- **Backend (futuro)**: Se integra con el backend principal para sincronizar operaciones financieras


# Elixir

## Qué Hace el Módulo

El módulo **Elixir** es la infraestructura financiera interna que gestiona saldo y transacciones. **Elixir NO gestiona servicios, gestiona saldo**. Su responsabilidad es exclusivamente financiera.

- Gestión de saldo y balance
- Procesamiento de transacciones financieras
- Manejo de pagos y facturación
- Registros contables y financieros
- APIs financieras para otros módulos
- **GESTIÓN DE SALDO, NO DE SERVICIOS**

## Qué NO Hace

- No gestiona servicios (solo gestiona saldo)
- No gestiona la interfaz de usuario (eso es el frontend del Catálogo)
- No maneja comunicación con usuarios (eso es el Chat Gateway)
- No almacena el catálogo de modelos (eso es responsabilidad del backend del Catálogo)
- No procesa mensajes de chat directamente
- No rutea operaciones (eso es Chat)

## Módulos que Consume o Expone

### Consume
- Solicitudes de transacciones desde Chat Gateway
- Información de operaciones desde otros módulos

### Expone
- APIs financieras para procesamiento de pagos
- Información de saldo y balance
- Servicios de transacciones financieras
- **NO expone gestión de servicios, solo saldo**

## Qué Tipo de Cambios son Aceptables

- Cambios en la lógica de gestión de saldo
- Mejoras en el procesamiento de transacciones
- Optimizaciones de operaciones financieras
- Actualizaciones en APIs financieras
- Mejoras en registros contables
- **NO** cambios que gestionen servicios
- **NO** cambios que gestionen interfaz de usuario
- **NO** cambios que gestionen comunicación con usuarios
- **NO** cambios que gestionen catálogo de modelos

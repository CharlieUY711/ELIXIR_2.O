# Catálogo

## Qué Hace el Módulo

El módulo **Catálogo** es la interfaz web frontend que proporciona atracción visual para explorar y visualizar contenido. Su enfoque principal es la presentación visual atractiva con mucha imagen y poco texto.

- Interfaz web interactiva para navegar el catálogo
- Presentación visual rica en imágenes
- Experiencia de usuario enfocada en atracción visual
- Exploración y visualización de contenido

## Qué NO Hace

- No gestiona lógica de negocio (eso corresponde al backend)
- No almacena datos directamente (consume APIs)
- No maneja comunicación con WhatsApp (eso es Chat)
- No procesa transacciones financieras (eso es Elixir)
- No gestiona saldo o pagos

## Módulos que Consume o Expone

### Consume
- APIs del backend para obtener datos del catálogo
- Información de Elixir relacionada con disponibilidad financiera (si aplica)

### Expone
- Interfaz web frontend para usuarios
- APIs de visualización (si aplica)

## Qué Tipo de Cambios son Aceptables

- Cambios en la interfaz visual y presentación
- Mejoras en la experiencia de usuario
- Optimizaciones de rendimiento frontend
- Actualizaciones de componentes visuales
- Integración con APIs del backend
- **NO** cambios que implementen lógica de negocio
- **NO** cambios que gestionen datos directamente
- **NO** cambios que procesen transacciones financieras

# Decisión D0 — Custodia de Datos

**Fecha**: 2025-01-27  
**Tipo**: Decisión Arquitectónica Global  
**Estado**: DECISIÓN CERRADA

---

## Qué es D0

D0 es la decisión arquitectónica fundamental sobre custodia de datos en Elixir Platform. Establece qué datos custodia Elixir y qué datos delega a sistemas externos.

Esta decisión rige todas las operaciones de la plataforma y establece los límites de responsabilidad de Elixir como orquestador transaccional.

---

## Principio Central

**Elixir es orquestador, no custodio.**

Elixir Platform coordina transacciones y autoriza operaciones. No actúa como custodio de datos sensibles ni como repositorio de información personal completa.

---

## Qué NO Custodia Elixir

Elixir Platform NO custodia los siguientes datos:

### Identidad Real

- Nombres reales
- Documentos de identidad
- Información de verificación de identidad completa
- Datos biométricos

**Justificación**: La identidad real se verifica mediante terceros especializados. Elixir solo mantiene estados de verificación y permisos resultantes.

### Edad

- Fechas de nacimiento
- Documentos de verificación de edad
- Información de verificación de edad completa

**Justificación**: La verificación de edad se delega a proveedores externos especializados. Elixir solo mantiene el estado binario de verificación (verificado / no verificado).

### Pagos

- Información de tarjetas de crédito
- Datos bancarios
- Historial completo de transacciones financieras
- Información de retiros

**Justificación**: Los pagos se procesan mediante proveedores de pago externos. Elixir solo mantiene estados de habilitación de pago y referencias a transacciones externas.

### Imágenes Originales

- Imágenes de perfil en resolución original
- Imágenes de catálogo en resolución original
- Contenido multimedia original

**Justificación**: Las imágenes originales se almacenan en servicios de almacenamiento externos. Elixir solo mantiene referencias y metadatos necesarios para orquestación.

### Historial Completo de Chats

- Contenido completo de mensajes
- Historial de conversaciones
- Archivos multimedia intercambiados

**Justificación**: El contenido de comunicación se maneja mediante WhatsApp. Elixir solo mantiene metadatos de auditoría y estados de conversación necesarios para orquestación.

---

## Qué SÍ Maneja Elixir

Elixir Platform SÍ maneja los siguientes datos:

### Estados

- Estados de cuenta (provisional, verificado, etc.)
- Estados de verificación (WhatsApp, edad, pago)
- Estados de permisos y autorizaciones
- Estados transaccionales

**Justificación**: Los estados son necesarios para orquestar transacciones y autorizar operaciones.

### Permisos

- Permisos de acceso a funcionalidades
- Permisos de visualización de contenido
- Permisos transaccionales
- Reglas de autorización

**Justificación**: Los permisos son el mecanismo de control de valor que Elixir orquesta.

### Enlaces Efímeros

- Referencias temporales a recursos externos
- Tokens de acceso temporales
- Enlaces de verificación con TTL

**Justificación**: Los enlaces efímeros permiten orquestar interacciones sin custodiar datos permanentes.

### Decisiones Binarias

- Resultados de verificaciones (sí / no)
- Autorizaciones (permitido / denegado)
- Estados de habilitación (habilitado / deshabilitado)

**Justificación**: Las decisiones binarias son el resultado de procesos de verificación externos y son necesarias para autorizar operaciones.

---

## Relación con Terceros

Elixir Platform delega la custodia de datos sensibles a terceros especializados:

### Verificación

- **Proveedores de verificación de edad**: Custodian documentos y procesos de verificación de edad
- **Proveedores de verificación de identidad**: Custodian procesos de verificación de identidad completa

**Rol de Elixir**: Recibe resultados binarios (verificado / no verificado) y mantiene estados de autorización resultantes.

### Pagos

- **Proveedores de pago**: Custodian información financiera y procesan transacciones
- **Procesadores de pago**: Gestionan autorizaciones y transferencias

**Rol de Elixir**: Recibe confirmaciones de transacciones y mantiene estados de habilitación de pago.

### Media

- **Servicios de almacenamiento**: Custodian imágenes y contenido multimedia en resolución original
- **CDNs**: Distribuyen contenido optimizado

**Rol de Elixir**: Mantiene referencias y metadatos necesarios para orquestar acceso a contenido.

---

## Estado

**DECISIÓN CERRADA**

Esta decisión queda formalmente cerrada. Establece los principios canónicos de custodia de datos en Elixir Platform y rige todas las operaciones de la plataforma.

Cualquier modificación a estos principios requerirá una nueva decisión arquitectónica formal.

---

## Relación con Documentación

Esta decisión se relaciona con:

- **docs/DATA_HANDLING/**: Políticas detalladas de manejo de datos
  - `00_OVERVIEW.md`: Visión general de políticas de datos
  - `01_PRINCIPIOS_DE_MINIMIZACION.md`: Principios de minimización, delegación y retención
  - `02_IDENTIDAD_Y_CONTACTO.md`: Reglas específicas de identidad y contacto
  - `03_IMAGENES_Y_MEDIA.md`: Reglas específicas de imágenes y media
  - `04_CHATS_Y_RETENCION.md`: Reglas específicas de chats y retención
  - `05_PAGOS_Y_VERIFICACIONES.md`: Reglas específicas de pagos y verificaciones

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Decisión arquitectónica cerrada


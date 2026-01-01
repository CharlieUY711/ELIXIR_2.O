# Imágenes y Media

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Custodia Externa de Imágenes

Elixir Platform delega la custodia de imágenes a sistemas externos especializados. Elixir no almacena imágenes localmente más allá de referencias opacas y metadatos mínimos necesarios para orquestación.

### 1.1. Custodia Externa Obligatoria

La custodia externa de imágenes es obligatoria. Elixir Platform no almacena imágenes en alta resolución ni contenido multimedia completo en sus sistemas internos.

**Regla**: Las imágenes se custodian externamente, no en Elixir.

### 1.2. Sistemas Externos Especializados

Las imágenes se delegan a sistemas externos especializados en almacenamiento y entrega de contenido multimedia. Elixir Platform no especifica proveedores, pero requiere que los sistemas externos cumplan con estándares de seguridad y privacidad.

**Regla**: Las imágenes se custodian en sistemas externos especializados.

### 1.3. Separación de Custodia y Control

Elixir Platform mantiene separación estricta entre custodia de imágenes y control de acceso. Elixir controla quién puede acceder a qué imágenes y cuándo, pero no custodia el contenido visual.

**Regla**: Elixir controla acceso, no custodia imágenes.

### 1.4. Responsabilidad Delegada

Al delegar custodia a sistemas externos, Elixir Platform también delega responsabilidad de protección de imágenes. Elixir mantiene responsabilidad de control de acceso, no de custodia de contenido.

**Regla**: La delegación de custodia implica delegación de responsabilidad de protección.

---

## 2. Opción de Custodia Delegada a la Modelo

Para ciertos tipos de imágenes, Elixir Platform ofrece la opción de custodia delegada directamente a la modelo. En estos casos, Elixir no mantiene copia local ni referencia persistente.

### 2.1. Custodia Delegada como Opción

La custodia delegada a la modelo es una opción disponible para imágenes asociadas a perfiles y catálogos. La modelo puede elegir custodiar sus propias imágenes en sistemas externos bajo su control.

**Regla**: La custodia delegada a la modelo es una opción disponible.

### 2.2. Preferencia sobre Custodia en Elixir

Cuando existe opción de custodia delegada a la modelo, esta es preferida sobre custodia en sistemas externos controlados por Elixir. La modelo tiene control directo sobre sus imágenes.

**Regla**: La custodia delegada a la modelo es preferida cuando está disponible.

### 2.3. Control de Acceso Mantenido

Aunque la custodia se delega a la modelo, Elixir Platform mantiene control de acceso mediante referencias opacas. Elixir autoriza o deniega acceso a imágenes sin custodiar el contenido.

**Regla**: Elixir mantiene control de acceso incluso con custodia delegada.

### 2.4. Referencias Opacas

Cuando la custodia se delega a la modelo, Elixir Platform mantiene únicamente referencias opacas que permiten acceso controlado. Las referencias no contienen información sensible ni exponen ubicación de imágenes.

**Regla**: Las referencias a imágenes con custodia delegada son opacas.

---

## 3. Control por Referencia Opaca

Elixir Platform controla acceso a imágenes mediante referencias opacas. Las referencias no contienen información sensible y solo permiten acceso controlado mediante autorización de Elixir Core.

### 3.1. Referencias Opacas Obligatorias

Todas las referencias a imágenes son opacas. Las referencias no exponen ubicación, contenido ni metadatos sensibles de las imágenes.

**Regla**: Todas las referencias a imágenes son opacas.

### 3.2. Autorización de Acceso

El acceso a imágenes se autoriza mediante Elixir Core. Elixir Core valida permisos y genera tokens de acceso temporales cuando corresponde.

**Regla**: El acceso a imágenes requiere autorización de Elixir Core.

### 3.3. Tokens Temporales

Los tokens de acceso a imágenes son temporales y tienen TTL definido. No se generan tokens permanentes ni con TTL indefinido.

**Regla**: Los tokens de acceso a imágenes son temporales con TTL definido.

### 3.4. No Exposición de Referencias

Las referencias opacas no se exponen en handoffs, tokens de sesión ni comunicaciones entre componentes. Solo se utilizan internamente para control de acceso.

**Regla**: Las referencias opacas no se exponen externamente.

---

## 4. Reglas de Visibilidad y Blur

Elixir Platform aplica reglas de visibilidad y blur para imágenes según contexto y configuración. Las reglas se aplican en tiempo de presentación, no mediante almacenamiento de versiones modificadas.

### 4.1. Visibilidad Contextual

La visibilidad de imágenes depende del contexto de acceso. Elixir Platform controla qué imágenes son visibles según:

- Estado de verificación del usuario
- Configuración de privacidad de la modelo
- Contexto de la transacción
- Reglas de contenido para adultos

**Regla**: La visibilidad de imágenes es contextual y controlada.

### 4.2. Blur en Tiempo de Presentación

El blur se aplica en tiempo de presentación mediante sistemas externos de entrega de contenido. Elixir Platform no almacena versiones con blur ni procesa imágenes localmente.

**Regla**: El blur se aplica en tiempo de presentación, no mediante almacenamiento.

### 4.3. Control de Blur

El control de blur se delega a sistemas externos especializados. Elixir Platform especifica reglas de blur mediante metadatos, pero no procesa imágenes directamente.

**Regla**: El control de blur se delega a sistemas externos.

### 4.4. Metadatos de Visibilidad

Elixir Platform almacena metadatos mínimos sobre reglas de visibilidad y blur. Los metadatos no contienen información de la imagen, solo reglas de presentación.

**Regla**: Los metadatos de visibilidad son mínimos y no contienen información de imágenes.

---

## 5. Prohibiciones Explícitas

Elixir Platform establece prohibiciones explícitas sobre qué imágenes no se almacenan ni se procesan.

### 5.1. Prohibición de Almacenamiento Local

Elixir Platform no almacena:

- Imágenes en alta resolución
- Contenido multimedia completo
- Versiones procesadas de imágenes
- Caché permanente de imágenes

**Regla**: Elixir no almacena imágenes localmente más allá de referencias opacas.

### 5.2. Prohibición de Procesamiento Local

Elixir Platform no procesa imágenes localmente. No realiza:

- Redimensionamiento
- Compresión
- Aplicación de filtros
- Análisis de contenido

**Regla**: Elixir no procesa imágenes localmente.

### 5.3. Prohibición de Exposición de Referencias

Elixir Platform no expone referencias a imágenes en:

- Handoffs entre componentes
- Tokens de sesión
- Comunicaciones externas
- Logs o auditoría detallada

**Regla**: Las referencias a imágenes no se exponen externamente.

### 5.4. Prohibición de Retención Indefinida

Elixir Platform no mantiene referencias a imágenes con retención indefinida. Todas las referencias tienen TTL definido.

**Regla**: Las referencias a imágenes tienen TTL obligatorio.

---

## 6. Metadatos Mínimos

Elixir Platform almacena únicamente metadatos mínimos necesarios para orquestación y control de acceso. Los metadatos no contienen información sensible de las imágenes.

### 6.1. Metadatos de Orquestación

Los metadatos almacenados incluyen únicamente:

- Referencias opacas a imágenes
- Reglas de visibilidad
- Estados de autorización
- TTL de referencias

**Regla**: Los metadatos son mínimos y no contienen información sensible.

### 6.2. No Metadatos Extensos

Elixir Platform no almacena:

- Dimensiones de imágenes
- Formatos de archivo
- Tamaños de archivo
- Información EXIF
- Análisis de contenido

**Regla**: Elixir no almacena metadatos extensos de imágenes.

### 6.3. TTL de Metadatos

Los metadatos de imágenes tienen TTL definido basado en necesidad funcional. No se mantienen indefinidamente.

**Regla**: Los metadatos de imágenes tienen TTL definido.

### 6.4. Eliminación Automática

Los metadatos expirados se eliminan automáticamente. La eliminación no requiere intervención manual.

**Regla**: La eliminación de metadatos expirados es automática.

---

## 7. Retención de Referencias

Las referencias opacas a imágenes se retienen según reglas específicas de TTL y necesidad funcional.

### 7.1. Referencias Activas

Las referencias activas se mantienen mientras sean necesarias para orquestación. Tienen TTL basado en necesidad funcional inmediata.

**Regla**: Las referencias activas tienen TTL basado en necesidad funcional.

### 7.2. Referencias de Catálogo

Las referencias de catálogo se mantienen mientras las imágenes estén asociadas a perfiles activos. Tienen TTL que se renueva mientras el perfil esté activo.

**Regla**: Las referencias de catálogo tienen TTL renovable mientras el perfil esté activo.

### 7.3. Referencias Transaccionales

Las referencias transaccionales se mantienen únicamente durante la transacción. Se eliminan automáticamente al completar o cancelar la transacción.

**Regla**: Las referencias transaccionales tienen TTL corto vinculado a la transacción.

### 7.4. Eliminación de Referencias

Las referencias expiradas se eliminan automáticamente. La eliminación no afecta las imágenes custodiadas externamente.

**Regla**: La eliminación de referencias es automática e independiente de custodia de imágenes.

---

## 8. Delegación de Responsabilidad

Al delegar custodia de imágenes a sistemas externos o a la modelo, Elixir Platform también delega responsabilidad de protección de contenido visual. Elixir mantiene responsabilidad de control de acceso mediante referencias opacas, no de custodia de imágenes.

**Regla**: La delegación de custodia implica delegación de responsabilidad de protección de imágenes.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


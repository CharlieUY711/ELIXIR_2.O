# Principios de Minimización de Datos

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Minimización de Datos

Elixir Platform aplica minimización de datos como principio fundamental de diseño. El sistema recopila y almacena únicamente los datos mínimos necesarios para cumplir su función de orquestación transaccional.

### 1.1. Definición de Minimización

La minimización de datos implica que Elixir Platform:

- Solicita únicamente información estrictamente necesaria para la funcionalidad inmediata
- Almacena únicamente datos requeridos para operación transaccional
- No recopila información que no tiene uso justificado e inmediato
- No mantiene datos históricos más allá de lo necesario para auditoría

**Regla**: Si un dato no es necesario para orquestar una transacción o mantener integridad contable, no se recopila ni se almacena.

### 1.2. Justificación Funcional

Cada dato recopilado debe tener una justificación funcional clara. Elixir Platform no solicita información "por si acaso" o para "uso futuro". Cada campo de datos debe estar vinculado a una necesidad transaccional específica.

**Regla**: Toda solicitud de datos debe poder justificarse mediante una necesidad funcional inmediata y específica.

### 1.3. Fricción Progresiva

El sistema aplica fricción progresiva en la recopilación de datos. La información se solicita solo cuando es estrictamente necesaria para habilitar una funcionalidad específica. No se solicita información completa al inicio si no es requerida para la operación inmediata.

**Regla**: Los datos se solicitan progresivamente según necesidad funcional, no de forma anticipada.

---

## 2. Delegación de Custodia

Elixir Platform delega la custodia de datos sensibles a sistemas externos especializados. Elixir actúa como controlador de acceso y orquestador, no como custodio de contenido sensible.

### 2.1. Separación entre Control y Custodia

Elixir Platform mantiene separación estricta entre control de acceso y custodia de datos. Elixir controla quién puede acceder a qué recursos y cuándo, pero no almacena el contenido sensible al que se accede.

**Regla**: Elixir controla acceso, no custodia contenido.

### 2.2. Custodia Externa Obligatoria

Para datos sensibles, la custodia externa es obligatoria. Elixir Platform no almacena localmente:

- Contenido de conversación completo
- Imágenes y multimedia en alta resolución
- Información de pago detallada
- Documentos de verificación

**Regla**: Los datos sensibles se delegan a sistemas externos especializados. Elixir mantiene únicamente referencias opacas y metadatos necesarios para orquestación.

### 2.3. Referencias Opacas

Cuando Elixir Platform necesita referenciar datos custodiados externamente, utiliza referencias opacas. Las referencias no contienen información sensible y solo permiten acceso controlado mediante autorización de Elixir Core.

**Regla**: Las referencias a datos externos son opacas y no exponen información sensible.

### 2.4. Opción de Custodia Delegada

Para ciertos tipos de datos, Elixir Platform ofrece la opción de custodia delegada directamente a la modelo. En estos casos, Elixir no mantiene copia local ni referencia persistente.

**Regla**: Cuando existe opción de custodia delegada, esta es la preferida sobre custodia en Elixir.

---

## 3. Retención Mínima

Elixir Platform aplica retención mínima para todos los datos almacenados. Los datos se mantienen únicamente durante el período necesario para cumplir la función transaccional o de auditoría.

### 3.1. Período de Retención Justificado

Cada dato almacenado debe tener un período de retención justificado. El período se determina según:

- Necesidad transaccional inmediata
- Requisitos de auditoría contable
- Obligaciones normativas mínimas
- Necesidad de integridad del sistema

**Regla**: No se mantienen datos más allá del período justificado por necesidad funcional o normativa.

### 3.2. Retención Cero como Opción

Para ciertos tipos de datos, Elixir Platform ofrece opción de retención cero. En estos casos, los datos se procesan en tiempo real y no se almacenan permanentemente.

**Regla**: Cuando existe opción de retención cero, esta es preferida sobre retención temporal.

### 3.3. Eliminación Automática

Los datos con TTL obligatorio se eliminan automáticamente al expirar. El sistema no requiere intervención manual para eliminar datos expirados.

**Regla**: La eliminación de datos expirados es automática e irreversible.

---

## 4. TTL Obligatorio

Todos los datos almacenados en Elixir Platform deben tener un TTL (Time To Live) obligatorio. No existen datos con retención indefinida.

### 4.1. TTL por Tipo de Dato

Cada tipo de dato tiene un TTL específico determinado por:

- Necesidad transaccional
- Requisitos de auditoría
- Obligaciones normativas
- Naturaleza del dato

**Regla**: Todo dato almacenado debe tener TTL definido y documentado.

### 4.2. TTL Mínimo

El TTL mínimo se establece según la necesidad funcional más corta. No se establecen TTL más largos de lo necesario "por precaución".

**Regla**: El TTL se establece en el mínimo necesario, no en el máximo permitido.

### 4.3. Renovación de TTL

El TTL puede renovarse solo si existe justificación funcional clara. La renovación no es automática y requiere validación de necesidad.

**Regla**: La renovación de TTL requiere justificación funcional, no es automática.

### 4.4. Expiración y Eliminación

Al expirar el TTL, los datos se eliminan automáticamente. No existe período de gracia ni retención adicional post-expiración.

**Regla**: La expiración de TTL resulta en eliminación inmediata e irreversible.

---

## 5. Separación Custodia / Control

Elixir Platform mantiene separación estricta entre custodia de datos y control de acceso. Esta separación permite que Elixir orqueste transacciones sin asumir responsabilidad de custodia de datos sensibles.

### 5.1. Control de Acceso sin Custodia

Elixir Platform controla acceso a recursos y datos sin custodiar el contenido. Elixir autoriza o deniega acceso, pero no almacena el contenido al que se accede.

**Regla**: Elixir controla quién accede, no qué se accede.

### 5.2. Metadatos vs Contenido

Elixir Platform almacena metadatos necesarios para orquestación y auditoría, pero no almacena contenido sensible. La distinción entre metadatos y contenido es explícita y estricta.

**Regla**: Metadatos sí, contenido sensible no.

### 5.3. Auditoría sin Almacenamiento de Contenido

Elixir Platform audita eventos transaccionales para mantener integridad contable. La auditoría registra qué ocurrió, cuándo y quién participó, pero no registra contenido de comunicación.

**Regla**: La auditoría registra eventos, no contenido.

### 5.4. Delegación de Responsabilidad

Al delegar custodia a sistemas externos, Elixir Platform también delega responsabilidad de protección de datos. Elixir mantiene responsabilidad de control de acceso, no de custodia de contenido.

**Regla**: La delegación de custodia implica delegación de responsabilidad de protección de contenido.

---

## 6. Prohibiciones Explícitas

Elixir Platform establece prohibiciones explícitas sobre qué datos no se almacenan ni se procesan.

### 6.1. Prohibición de Almacenamiento de Contenido Sensible

Elixir Platform no almacena:

- Contenido completo de conversaciones
- Imágenes en alta resolución sin justificación
- Información de pago detallada más allá de referencias
- Documentos de verificación completos

**Regla**: Los datos sensibles no se almacenan localmente en Elixir.

### 6.2. Prohibición de Retención Indefinida

Elixir Platform no mantiene datos con retención indefinida. Todos los datos deben tener TTL definido.

**Regla**: No existen datos sin TTL en Elixir Platform.

### 6.3. Prohibición de Recopilación Anticipada

Elixir Platform no recopila datos "por si acaso" o para "uso futuro". Solo se recopila información con justificación funcional inmediata.

**Regla**: No se recopilan datos sin necesidad funcional inmediata.

### 6.4. Prohibición de Exposición de Datos Sensibles

Elixir Platform no expone datos sensibles en handoffs, tokens o referencias. Las referencias son opacas y no contienen información sensible.

**Regla**: Los datos sensibles no se exponen en comunicaciones entre componentes.

---

## 7. Aplicación de Principios

Estos principios se aplican de forma consistente en todas las operaciones de Elixir Platform. No existen excepciones a los principios de minimización, delegación de custodia y retención controlada.

**Regla**: Los principios son innegociables y rigen todas las decisiones de manejo de datos.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


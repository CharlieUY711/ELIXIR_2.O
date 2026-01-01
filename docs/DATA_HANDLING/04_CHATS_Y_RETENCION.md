# Chats y Retención

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. No Historial Permanente

Elixir Platform no mantiene historial permanente de conversaciones. El sistema no almacena contenido de chat más allá del período necesario para orquestación transaccional.

### 1.1. Prohibición de Historial Permanente

Elixir Platform no almacena historial permanente de:

- Mensajes de conversación
- Contenido de chat
- Multimedia intercambiado
- Metadatos extensos de conversación

**Regla**: Elixir no mantiene historial permanente de conversaciones.

### 1.2. Comunicación Delegada

La comunicación entre usuarios y modelos se delega a sistemas externos especializados. Una vez que Elixir Platform autoriza el acceso y genera el handoff, la comunicación ocurre fuera del control de Elixir.

**Regla**: La comunicación se delega a sistemas externos. Elixir no intermedia conversaciones.

### 1.3. Separación de Orquestación y Comunicación

Elixir Platform mantiene separación estricta entre orquestación de acceso y comunicación directa. Elixir orquesta el acceso inicial, pero no participa en la comunicación posterior.

**Regla**: Elixir orquesta acceso, no intermedia comunicación.

### 1.4. No Almacenamiento de Contenido

Elixir Platform no almacena contenido de conversación. El sistema no intercepta, registra ni almacena mensajes intercambiados entre usuarios y modelos.

**Regla**: Elixir no almacena contenido de conversación.

---

## 2. Retención con TTL

Cuando Elixir Platform necesita retener información relacionada con chats, la retención se realiza con TTL obligatorio. No existen datos de chat con retención indefinida.

### 2.1. TTL Obligatorio

Todos los datos relacionados con chats tienen TTL obligatorio. El TTL se establece según necesidad funcional mínima.

**Regla**: Todos los datos de chat tienen TTL obligatorio.

### 2.2. TTL Mínimo

El TTL se establece en el mínimo necesario para orquestación transaccional. No se establecen TTL más largos de lo necesario.

**Regla**: El TTL de datos de chat es el mínimo necesario.

### 2.3. TTL por Tipo de Dato

Cada tipo de dato relacionado con chats tiene TTL específico:

- Metadatos de sesión: TTL corto vinculado a la sesión
- Referencias de handoff: TTL vinculado a validez del handoff
- Estados de autorización: TTL basado en necesidad de auditoría
- Eventos auditables: TTL basado en requisitos normativos mínimos

**Regla**: Cada tipo de dato tiene TTL específico justificado.

### 2.4. Eliminación Automática

Los datos de chat expirados se eliminan automáticamente. No existe período de gracia ni retención adicional post-expiración.

**Regla**: La eliminación de datos de chat expirados es automática e irreversible.

---

## 3. Metadatos vs Contenido

Elixir Platform distingue estrictamente entre metadatos necesarios para orquestación y contenido de conversación. Solo almacena metadatos, nunca contenido.

### 3.1. Metadatos Permitidos

Elixir Platform almacena únicamente metadatos necesarios para:

- Orquestación de acceso
- Control de autorización
- Auditoría de eventos transaccionales
- Integridad contable

**Regla**: Solo se almacenan metadatos necesarios para orquestación y auditoría.

### 3.2. Contenido Prohibido

Elixir Platform no almacena:

- Texto de mensajes
- Contenido multimedia
- Historial de conversación
- Análisis de contenido

**Regla**: El contenido de conversación está prohibido.

### 3.3. Separación Estricta

La separación entre metadatos y contenido es estricta e inviolable. No existen excepciones que permitan almacenamiento de contenido.

**Regla**: La separación entre metadatos y contenido es inviolable.

### 3.3. Metadatos Mínimos

Los metadatos almacenados son mínimos. Solo incluyen información estrictamente necesaria para cumplir función de orquestación.

**Regla**: Los metadatos son mínimos y no incluyen información sensible.

---

## 4. Eventos Auditables

Elixir Platform audita eventos transaccionales relacionados con chats para mantener integridad contable y cumplimiento normativo. La auditoría registra qué ocurrió, cuándo y quién participó, pero no registra contenido de comunicación.

### 4.1. Eventos Auditados

Elixir Platform audita únicamente eventos transaccionales:

- Autorización de acceso
- Generación de handoff
- Resolución de handoff
- Finalización de sesión
- Eventos de facturación

**Regla**: Solo se auditan eventos transaccionales, no contenido de comunicación.

### 4.2. Metadatos de Auditoría

Los eventos auditables incluyen únicamente metadatos:

- Identificadores de sesión
- Identificadores de usuario y modelo
- Timestamps de eventos
- Estados de autorización
- Referencias opacas a transacciones

**Regla**: Los eventos auditables incluyen solo metadatos, no contenido.

### 4.3. Retención de Auditoría

Los eventos auditables se retienen según requisitos normativos mínimos. Tienen TTL basado en obligaciones legales y necesidad de integridad contable.

**Regla**: Los eventos auditables tienen TTL basado en requisitos normativos.

### 4.4. No Análisis de Contenido

Elixir Platform no analiza contenido de conversación para auditoría. La auditoría se limita a eventos transaccionales y metadatos.

**Regla**: La auditoría no incluye análisis de contenido de conversación.

---

## 5. Opciones de Cero-Retención

Para ciertos tipos de datos relacionados con chats, Elixir Platform ofrece opción de cero-retención. En estos casos, los datos se procesan en tiempo real y no se almacenan permanentemente.

### 5.1. Cero-Retención como Opción

La opción de cero-retención está disponible para:

- Metadatos de sesión activa
- Referencias temporales de handoff
- Estados de autorización en tiempo real

**Regla**: La cero-retención es una opción disponible para datos temporales.

### 5.2. Preferencia sobre Retención Temporal

Cuando existe opción de cero-retención, esta es preferida sobre retención temporal. Los datos se procesan en tiempo real y se descartan inmediatamente.

**Regla**: La cero-retención es preferida cuando está disponible.

### 5.3. Procesamiento en Tiempo Real

Con cero-retención, los datos se procesan en tiempo real para orquestación y se descartan inmediatamente después de su uso. No se mantiene copia ni referencia persistente.

**Regla**: Con cero-retención, los datos se procesan y descartan en tiempo real.

### 5.4. Limitaciones de Cero-Retención

La cero-retención no aplica a:

- Eventos auditables requeridos por normativa
- Referencias necesarias para integridad contable
- Metadatos requeridos para resolución de disputas

**Regla**: La cero-retención tiene limitaciones basadas en requisitos normativos y de integridad.

---

## 6. Handoffs y Sesiones

Elixir Platform genera handoffs controlados que permiten acceso temporal a canales de comunicación externos. Los handoffs tienen TTL definido y no se almacenan permanentemente.

### 6.1. Handoffs Temporales

Los handoffs son temporales y tienen TTL definido. No se generan handoffs permanentes ni con TTL indefinido.

**Regla**: Los handoffs son temporales con TTL definido.

### 6.2. Metadatos de Handoff

Los handoffs incluyen únicamente metadatos mínimos necesarios:

- Identificador de handoff
- Identificadores de usuario y modelo
- Timestamp de creación
- TTL del handoff
- Estado del handoff

**Regla**: Los handoffs incluyen solo metadatos mínimos, no contenido sensible.

### 6.3. Retención de Handoffs

Los handoffs se retienen únicamente durante su validez. Se eliminan automáticamente al expirar o al ser consumidos.

**Regla**: Los handoffs se eliminan al expirar o consumirse.

### 6.4. No Reutilización

Los handoffs son de un solo uso. No se pueden reutilizar ni renovar después de ser consumidos.

**Regla**: Los handoffs son de un solo uso y no reutilizables.

---

## 7. Prohibiciones Explícitas

Elixir Platform establece prohibiciones explícitas sobre qué datos de chat no se almacenan ni se procesan.

### 7.1. Prohibición de Almacenamiento de Contenido

Elixir Platform no almacena:

- Texto de mensajes
- Contenido multimedia
- Historial de conversación
- Análisis de sentimiento o contenido

**Regla**: El contenido de conversación está prohibido.

### 7.2. Prohibición de Intermediación

Elixir Platform no intermedia conversaciones. No intercepta, registra ni procesa mensajes intercambiados entre usuarios y modelos.

**Regla**: Elixir no intermedia conversaciones.

### 7.3. Prohibición de Retención Indefinida

Elixir Platform no mantiene datos de chat con retención indefinida. Todos los datos tienen TTL obligatorio.

**Regla**: No existen datos de chat sin TTL.

### 7.4. Prohibición de Análisis de Contenido

Elixir Platform no analiza contenido de conversación para ningún propósito. No realiza análisis de sentimiento, detección de contenido ni procesamiento de lenguaje natural sobre mensajes.

**Regla**: El análisis de contenido de conversación está prohibido.

---

## 8. Delegación de Responsabilidad

Al delegar comunicación a sistemas externos, Elixir Platform también delega responsabilidad de protección de contenido de conversación. Elixir mantiene responsabilidad de control de acceso mediante handoffs, no de custodia de contenido de chat.

**Regla**: La delegación de comunicación implica delegación de responsabilidad de protección de contenido.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


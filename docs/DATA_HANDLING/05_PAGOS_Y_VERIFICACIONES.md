# Pagos y Verificaciones

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Verificación de Edad Delegada

La verificación de edad se delega a sistemas externos especializados. Elixir Platform no almacena documentos de verificación ni información detallada de verificación de edad.

### 1.1. Delegación Obligatoria

La verificación de edad se delega obligatoriamente a sistemas externos especializados. Elixir Platform no realiza verificación de edad internamente ni almacena documentos de verificación.

**Regla**: La verificación de edad se delega a sistemas externos. Elixir no la realiza internamente.

### 1.2. Sistemas Externos Especializados

Los sistemas externos de verificación de edad son especializados en validación de documentos de identidad y verificación de edad. Elixir Platform no especifica proveedores, pero requiere que los sistemas externos cumplan con estándares de seguridad y privacidad.

**Regla**: La verificación de edad se realiza mediante sistemas externos especializados.

### 1.3. Persistencia Solo de Estados

Elixir Platform persiste únicamente estados de verificación de edad:

- Estado de verificación (pendiente, aprobada, rechazada)
- Timestamp de verificación
- Referencia opaca al sistema externo
- TTL del estado de verificación

**Regla**: Elixir persiste solo estados de verificación, no documentos ni información detallada.

### 1.4. No Almacenamiento de Documentos

Elixir Platform no almacena:

- Documentos de identidad
- Imágenes de documentos
- Información personal extraída de documentos
- Metadatos extensos de verificación

**Regla**: Elixir no almacena documentos de verificación ni información detallada.

### 1.5. Referencias Opacas

Las referencias a sistemas externos de verificación son opacas. No contienen información sensible ni exponen detalles de la verificación.

**Regla**: Las referencias a sistemas de verificación son opacas.

---

## 2. Pagos Delegados

Los pagos se delegan a sistemas externos especializados en procesamiento de pagos. Elixir Platform no almacena información detallada de pagos ni procesa transacciones financieras directamente.

### 2.1. Delegación Obligatoria

Los pagos se delegan obligatoriamente a sistemas externos especializados. Elixir Platform no procesa pagos internamente ni almacena información detallada de métodos de pago.

**Regla**: Los pagos se delegan a sistemas externos. Elixir no los procesa internamente.

### 2.2. Sistemas Externos Especializados

Los sistemas externos de pagos son especializados en procesamiento de transacciones financieras. Elixir Platform no especifica proveedores, pero requiere que los sistemas externos cumplan con estándares de seguridad y cumplimiento financiero.

**Regla**: Los pagos se procesan mediante sistemas externos especializados.

### 2.3. Persistencia Solo de Estados y Referencias

Elixir Platform persiste únicamente:

- Estados de transacciones de pago
- Referencias opacas a transacciones externas
- Montos y timestamps de transacciones
- Estados de autorización de pago
- TTL de referencias de pago

**Regla**: Elixir persiste solo estados y referencias de pago, no información detallada de métodos de pago.

### 2.4. No Almacenamiento de Información de Pago

Elixir Platform no almacena:

- Números de tarjeta de crédito
- Información de cuentas bancarias
- Tokens de métodos de pago
- Historial detallado de transacciones
- Información de facturación completa

**Regla**: Elixir no almacena información detallada de métodos de pago.

### 2.5. Integración con Elixir Core

Elixir Platform integra estados de pago con Elixir Core para gestión de saldo. Elixir Core mantiene saldo y ledger, pero no almacena información detallada de métodos de pago.

**Regla**: La integración con Elixir Core es para gestión de saldo, no para almacenamiento de información de pago.

---

## 3. Retiros Delegados

Los retiros se delegan a sistemas externos especializados en procesamiento de retiros. Elixir Platform no almacena información detallada de retiros ni procesa solicitudes de retiro directamente.

### 3.1. Delegación Obligatoria

Los retiros se delegan obligatoriamente a sistemas externos especializados. Elixir Platform no procesa retiros internamente ni almacena información detallada de métodos de retiro.

**Regla**: Los retiros se delegan a sistemas externos. Elixir no los procesa internamente.

### 3.2. Sistemas Externos Especializados

Los sistemas externos de retiros son especializados en procesamiento de transferencias financieras. Elixir Platform no especifica proveedores, pero requiere que los sistemas externos cumplan con estándares de seguridad y cumplimiento financiero.

**Regla**: Los retiros se procesan mediante sistemas externos especializados.

### 3.3. Persistencia Solo de Estados y Referencias

Elixir Platform persiste únicamente:

- Estados de solicitudes de retiro
- Referencias opacas a retiros externos
- Montos y timestamps de retiros
- Estados de autorización de retiro
- TTL de referencias de retiro

**Regla**: Elixir persiste solo estados y referencias de retiro, no información detallada de métodos de retiro.

### 3.4. No Almacenamiento de Información de Retiro

Elixir Platform no almacena:

- Información de cuentas bancarias de destino
- Métodos de retiro detallados
- Tokens de métodos de retiro
- Historial detallado de retiros
- Información de identificación para retiros

**Regla**: Elixir no almacena información detallada de métodos de retiro.

### 3.5. Integración con Elixir Core

Elixir Platform integra estados de retiro con Elixir Core para gestión de saldo. Elixir Core mantiene saldo y ledger, pero no almacena información detallada de métodos de retiro.

**Regla**: La integración con Elixir Core es para gestión de saldo, no para almacenamiento de información de retiro.

---

## 4. Persistencia Solo de Estados y Referencias

Elixir Platform persiste únicamente estados y referencias opacas relacionadas con pagos, retiros y verificaciones. No almacena información detallada ni documentos completos.

### 4.1. Estados Transaccionales

Los estados transaccionales incluyen:

- Estados de verificación (pendiente, aprobada, rechazada)
- Estados de pago (pendiente, completado, fallido)
- Estados de retiro (pendiente, completado, fallido)
- Estados de autorización

**Regla**: Solo se persisten estados transaccionales, no información detallada.

### 4.2. Referencias Opacas

Las referencias opacas permiten:

- Vinculación con sistemas externos
- Auditoría de transacciones
- Integridad contable
- Resolución de disputas

**Regla**: Las referencias son opacas y no exponen información sensible.

### 4.3. Metadatos Mínimos

Los metadatos almacenados son mínimos:

- Timestamps de transacciones
- Montos de transacciones
- Identificadores de usuario y modelo
- TTL de referencias

**Regla**: Los metadatos son mínimos y no incluyen información sensible.

### 4.4. TTL de Referencias

Todas las referencias tienen TTL obligatorio basado en:

- Necesidad de auditoría
- Requisitos normativos
- Integridad contable
- Resolución de disputas

**Regla**: Todas las referencias tienen TTL obligatorio.

---

## 5. Integración con Elixir Core

Elixir Platform integra estados de pagos, retiros y verificaciones con Elixir Core para gestión de saldo y mantenimiento de integridad contable.

### 5.1. Gestión de Saldo

Elixir Core mantiene saldo de usuarios y modelos basado en estados de pagos y retiros. Elixir Core no almacena información detallada de métodos de pago o retiro.

**Regla**: Elixir Core gestiona saldo basado en estados, no en información detallada de métodos.

### 5.2. Ledger Inmutable

Elixir Core mantiene ledger inmutable de transacciones financieras. El ledger registra movimientos de saldo basados en estados de pagos y retiros, pero no incluye información detallada de métodos.

**Regla**: El ledger registra movimientos de saldo, no información detallada de métodos.

### 5.3. Integridad Contable

La integración con Elixir Core mantiene integridad contable mediante registro de estados transaccionales. La integridad se mantiene sin almacenar información sensible de métodos de pago o retiro.

**Regla**: La integridad contable se mantiene mediante estados, no mediante información detallada.

### 5.4. Separación de Responsabilidades

Elixir Core gestiona saldo y ledger. Los sistemas externos gestionan procesamiento de pagos y retiros. Elixir Platform orquesta la integración sin almacenar información sensible.

**Regla**: La separación de responsabilidades mantiene Elixir Core enfocado en gestión de saldo, no en procesamiento de pagos.

---

## 6. Prohibiciones Explícitas

Elixir Platform establece prohibiciones explícitas sobre qué datos de pagos, retiros y verificaciones no se almacenan.

### 6.1. Prohibición de Almacenamiento de Documentos

Elixir Platform no almacena:

- Documentos de identidad
- Documentos de verificación
- Imágenes de documentos
- Información extraída de documentos

**Regla**: Los documentos de verificación están prohibidos.

### 6.2. Prohibición de Almacenamiento de Información de Pago

Elixir Platform no almacena:

- Números de tarjeta de crédito
- Información de cuentas bancarias
- Tokens de métodos de pago
- Información de facturación completa

**Regla**: La información detallada de métodos de pago está prohibida.

### 6.3. Prohibición de Almacenamiento de Información de Retiro

Elixir Platform no almacena:

- Información de cuentas bancarias de destino
- Métodos de retiro detallados
- Tokens de métodos de retiro
- Información de identificación para retiros

**Regla**: La información detallada de métodos de retiro está prohibida.

### 6.4. Prohibición de Retención Indefinida

Elixir Platform no mantiene referencias con retención indefinida. Todas las referencias tienen TTL obligatorio.

**Regla**: No existen referencias sin TTL.

---

## 7. Retención de Estados y Referencias

Los estados y referencias se retienen según reglas específicas de TTL y necesidad funcional.

### 7.1. Estados de Verificación

Los estados de verificación se retienen según requisitos normativos mínimos. Tienen TTL basado en obligaciones legales y necesidad de auditoría.

**Regla**: Los estados de verificación tienen TTL basado en requisitos normativos.

### 7.2. Referencias de Pago

Las referencias de pago se retienen según necesidad de auditoría e integridad contable. Tienen TTL basado en requisitos normativos y necesidad de resolución de disputas.

**Regla**: Las referencias de pago tienen TTL basado en requisitos normativos y de integridad.

### 7.3. Referencias de Retiro

Las referencias de retiro se retienen según necesidad de auditoría e integridad contable. Tienen TTL basado en requisitos normativos y necesidad de resolución de disputas.

**Regla**: Las referencias de retiro tienen TTL basado en requisitos normativos y de integridad.

### 7.4. Eliminación Automática

Los estados y referencias expirados se eliminan automáticamente. La eliminación no afecta la integridad contable mantenida en Elixir Core.

**Regla**: La eliminación de estados y referencias expirados es automática.

---

## 8. Delegación de Responsabilidad

Al delegar verificación de edad, pagos y retiros a sistemas externos, Elixir Platform también delega responsabilidad de protección de datos sensibles. Elixir mantiene responsabilidad de control de acceso y gestión de saldo, no de custodia de información de verificación o métodos de pago.

**Regla**: La delegación de procesamiento implica delegación de responsabilidad de protección de datos sensibles.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


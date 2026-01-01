# Decisiones y Límites

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Decisiones Cerradas

### 1.1. Registro Único

**Decisión**: El sistema utiliza un registro unificado para usuarios y modelos.

**Justificación**:
- Simplifica la arquitectura del sistema
- Reduce duplicación de lógica
- Permite transición entre tipos de cuenta si es necesario en el futuro

**Estado**: Cerrado. No sujeto a revisión.

---

### 1.2. WhatsApp Primero

**Decisión**: WhatsApp es la identidad primaria del sistema. El registro requiere número de WhatsApp válido.

**Justificación**:
- WhatsApp proporciona verificación de número telefónico mediante OTP
- WhatsApp es el canal de comunicación principal del sistema
- WhatsApp permite identificación única sin requerir email o nombre real

**Estado**: Cerrado. No sujeto a revisión.

---

### 1.3. Alias Técnico Automático

**Decisión**: El sistema genera automáticamente un alias técnico único para cada cuenta.

**Formato**:
- Usuarios: `Elixir_U{numero_secuencial}`
- Modelos: `Elixir_M{numero_secuencial}`

**Características**:
- Autogenerado por el sistema
- Único e irrepetible
- No modificable por el usuario o modelo
- Formato canónico estricto

**Estado**: Cerrado. No sujeto a revisión.

---

### 1.4. Nick Postergado

**Decisión**: El nick o nombre de usuario personal no se solicita durante el registro. Se solicita solo cuando es necesario para funcionalidades específicas.

**Justificación**:
- Reduce fricción en el registro
- Permite que el usuario o modelo decida su nick cuando sea necesario
- Evita solicitar información que no tiene uso inmediato

**Estado**: Cerrado. No sujeto a revisión.

---

### 1.5. Identidad Provisional por Defecto

**Decisión**: Toda cuenta creada mediante registro queda en estado de identidad provisional.

**Características**:
- Alias técnico autogenerado
- Número de WhatsApp asociado
- Estado de verificación mínimo
- Acceso restringido a funcionalidades básicas

**Estado**: Cerrado. No sujeto a revisión.

---

### 1.6. Verificación Progresiva

**Decisión**: La verificación es un proceso progresivo que habilita funcionalidades incrementales.

**Niveles**:
1. Verificación de WhatsApp: Habilita acceso básico y comunicación
2. Verificación de edad: Habilita acceso a contenido para adultos
3. Verificación de pago: Habilita transacciones financieras

**Estado**: Cerrado. No sujeto a revisión.

---

### 1.7. Fricción Progresiva

**Decisión**: El sistema aplica fricción progresiva. La fricción aumenta solo cuando es estrictamente necesario para habilitar funcionalidades específicas.

**Regla fundamental**: Pedir solo cuando es necesario.

**Estado**: Cerrado. No sujeto a revisión.

---

## 2. Decisiones NO Tomadas Aún

### 2.1. Proveedor de Verificación de Edad

**Estado**: Pendiente de decisión.

**Alcance**: Se debe decidir qué proveedor o método se utilizará para verificación de edad.

**Impacto**: Esta decisión afecta la implementación del gate de verificación de edad pero no afecta el diseño del registro ni los estados de cuenta.

**Regla**: El diseño del registro y estados de cuenta es independiente del proveedor de verificación de edad.

---

### 2.2. Proveedor de Pagos

**Estado**: Pendiente de decisión.

**Alcance**: Se debe decidir qué proveedor o método se utilizará para procesamiento de pagos y retiros.

**Impacto**: Esta decisión afecta la implementación del gate de verificación de pago pero no afecta el diseño del registro ni los estados de cuenta.

**Regla**: El diseño del registro y estados de cuenta es independiente del proveedor de pagos.

---

### 2.3. Método de Verificación de Edad

**Estado**: Pendiente de decisión.

**Alcance**: Se debe decidir el método específico de verificación de edad (documentos, selfie, proveedor externo, etc.).

**Impacto**: Esta decisión afecta la implementación del gate de verificación de edad pero no afecta el diseño del registro ni los estados de cuenta.

**Regla**: El diseño del registro y estados de cuenta es independiente del método de verificación de edad.

---

### 2.4. Método de Verificación de Pago

**Estado**: Pendiente de decisión.

**Alcance**: Se debe decidir el método específico de verificación de capacidad de pago o retiro (tarjeta, cuenta bancaria, proveedor externo, etc.).

**Impacto**: Esta decisión afecta la implementación del gate de verificación de pago pero no afecta el diseño del registro ni los estados de cuenta.

**Regla**: El diseño del registro y estados de cuenta es independiente del método de verificación de pago.

---

## 3. Qué NO Debe Implementarse Todavía

### 3.1. Verificación de Edad

**Estado**: No debe implementarse todavía.

**Razón**: No se ha tomado decisión sobre proveedor o método de verificación de edad.

**Regla**: El gate de verificación de edad está definido pero no debe implementarse hasta que se tome la decisión correspondiente.

---

### 3.2. Verificación de Pago

**Estado**: No debe implementarse todavía.

**Razón**: No se ha tomado decisión sobre proveedor o método de verificación de pago.

**Regla**: El gate de verificación de pago está definido pero no debe implementarse hasta que se tome la decisión correspondiente.

---

### 3.3. Funcionalidades que Requieren Verificaciones

**Estado**: No deben implementarse todavía.

**Razón**: Las funcionalidades que requieren verificaciones no pueden implementarse hasta que se implementen las verificaciones correspondientes.

**Ejemplos**:
- Chat completo (requiere verificación de edad y pago)
- Visualización pública de perfil con contenido adulto (requiere verificación de edad)
- Retiros de fondos (requiere verificación de retiros)

**Regla**: Las funcionalidades que requieren verificaciones están definidas pero no deben implementarse hasta que se implementen las verificaciones correspondientes.

---

### 3.4. Nick Personal

**Estado**: No debe implementarse todavía.

**Razón**: El nick personal se solicita solo cuando es necesario para funcionalidades específicas. No se ha definido cuándo será necesario.

**Regla**: El nick personal está postergado hasta que se defina un gate real que lo requiera.

---

## 4. Límites del Diseño Actual

### 4.1. Alcance del Registro

El diseño del registro cubre únicamente:
- Proceso de registro inicial
- Estados de cuenta canónicos
- Gates definidos pero no implementados
- Flujos de usuario y modelo

**No cubre**:
- Implementación de verificaciones
- Implementación de funcionalidades avanzadas
- Integración con proveedores externos
- Detalles de UI o UX

**Regla**: El diseño del registro es normativo y no incluye detalles de implementación.

---

### 4.2. Separación de Fases

El diseño del registro aplica a fases futuras cuando se implemente el sistema de registro completo. No modifica la operación actual de Fase M (Modo 1).

**Regla**: El diseño documentado aquí es normativo para implementación futura, no descriptivo de implementación actual.

---

### 4.3. Decisiones Técnicas

El diseño del registro no incluye decisiones técnicas sobre:
- Base de datos
- APIs
- Infraestructura
- Arquitectura de software

**Regla**: El diseño del registro es funcional y no incluye decisiones técnicas de implementación.

---

## 5. Relación con Otras Decisiones

### 5.1. Core

El diseño del registro es independiente de las decisiones de Core. El registro establece identidad y estados, mientras que Core establece reglas de autorización.

**Regla**: El registro y Core son sistemas independientes que se integran mediante estados de cuenta.

---

### 5.2. WAM

El diseño del registro es independiente de las decisiones de WAM. El registro establece identidad, mientras que WAM establece comunicación mediante WhatsApp.

**Regla**: El registro y WAM son sistemas independientes que se integran mediante identidad de WhatsApp.

---

### 5.3. Catálogo

El diseño del registro es independiente de las decisiones de catálogo. El registro establece identidad, mientras que el catálogo establece visualización de contenido.

**Regla**: El registro y catálogo son sistemas independientes que se integran mediante estados de cuenta y visibilidad.

---

## 6. Principios de Decisión

### 6.1. Mínimo Necesario

Todas las decisiones de registro siguen el principio de mínimo necesario. Solo se solicita información o se requiere verificación cuando es estrictamente necesario.

**Regla**: Cualquier decisión futura debe seguir el principio de mínimo necesario.

---

### 6.2. Fricción Progresiva

Todas las decisiones de registro siguen el principio de fricción progresiva. La fricción aumenta solo cuando es necesario para habilitar funcionalidades específicas.

**Regla**: Cualquier decisión futura debe seguir el principio de fricción progresiva.

---

### 6.3. Separación de Responsabilidades

Todas las decisiones de registro mantienen separación estricta entre registro, verificación, acceso y monetización.

**Regla**: Cualquier decisión futura debe mantener separación de responsabilidades.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


# Principios de Registro e Identidad

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Principio de Fricción Progresiva

El sistema aplica fricción progresiva en el proceso de registro y verificación. La fricción aumenta solo cuando es estrictamente necesario para habilitar funcionalidades específicas.

**Regla fundamental**: Pedir solo cuando es necesario.

El sistema no solicita información que no es requerida para la funcionalidad inmediata que el usuario o modelo desea utilizar. Cada solicitud de información debe estar justificada por una necesidad funcional específica.

---

## 2. Separación de Responsabilidades

El sistema mantiene separación estricta entre cuatro procesos distintos:

### 2.1. Registro

Proceso de creación inicial de cuenta. Establece identidad mínima y genera alias técnico. No requiere información personal completa ni verificación extensa.

### 2.2. Verificación

Proceso de validación de información o capacidades. Incluye verificación de WhatsApp, verificación de edad y verificación de capacidad de pago. Cada verificación habilita funcionalidades específicas.

### 2.3. Acceso

Proceso de utilización de funcionalidades del sistema. Depende del estado de verificación del usuario o modelo. No todas las funcionalidades requieren el mismo nivel de verificación.

### 2.4. Monetización

Proceso de habilitación de transacciones financieras. Requiere verificación de capacidad de pago para usuarios y verificación de capacidad de retiro para modelos. Es independiente de otros procesos de verificación.

**Regla**: Estos procesos son independientes y pueden ejecutarse en diferentes momentos según necesidad.

---

## 3. WhatsApp como Identidad Primaria

WhatsApp es la identidad primaria del sistema. El número de WhatsApp es el identificador principal para usuarios y modelos.

**Justificación**:
- WhatsApp proporciona verificación de número telefónico mediante OTP
- WhatsApp es el canal de comunicación principal del sistema
- WhatsApp permite identificación única sin requerir email o nombre real

**Implicaciones**:
- El registro inicial requiere número de WhatsApp
- La verificación de WhatsApp es el primer paso de verificación
- El email es secundario y opcional
- El nombre real no es requerido para registro ni acceso básico

---

## 4. Identidad Provisional vs Identidad Consolidada

El sistema distingue entre dos tipos de identidad:

### 4.1. Identidad Provisional

Identidad mínima creada durante el registro inicial. Permite acceso limitado a funcionalidades básicas del sistema. No requiere verificación extensa ni información personal completa.

**Características**:
- Alias técnico autogenerado
- Número de WhatsApp asociado
- Estado de verificación mínimo
- Acceso restringido a funcionalidades básicas

### 4.2. Identidad Consolidada

Identidad con verificación completa que habilita todas las funcionalidades del sistema. Requiere verificación de WhatsApp, verificación de edad y verificación de capacidad de pago o retiro según corresponda.

**Características**:
- Alias técnico establecido
- Número de WhatsApp verificado
- Verificación de edad completada
- Verificación de capacidad de pago o retiro completada
- Acceso completo a funcionalidades del sistema

**Regla**: El sistema permite operación con identidad provisional. La consolidación es progresiva y opcional según las funcionalidades que el usuario o modelo desee utilizar.

---

## 5. Registro Unificado

El sistema utiliza un registro unificado para usuarios y modelos. El mismo proceso de registro aplica a ambos tipos de cuenta, diferenciándose solo en las funcionalidades habilitadas según el tipo.

**Justificación**:
- Simplifica la arquitectura del sistema
- Reduce duplicación de lógica
- Permite transición entre tipos de cuenta si es necesario en el futuro

**Implicaciones**:
- El proceso de registro es idéntico para usuarios y modelos
- La diferenciación ocurre después del registro mediante configuración de tipo de cuenta
- Los alias técnicos siguen el mismo formato independientemente del tipo

---

## 6. Verificación Progresiva

La verificación es un proceso progresivo que habilita funcionalidades incrementales. Cada nivel de verificación desbloquea funcionalidades específicas.

**Niveles de verificación**:
1. Verificación de WhatsApp: Habilita acceso básico y comunicación
2. Verificación de edad: Habilita acceso a contenido para adultos
3. Verificación de pago: Habilita transacciones financieras

**Regla**: Cada verificación es independiente y puede completarse en cualquier orden, excepto que la verificación de WhatsApp es prerrequisito para todas las demás.

---

## 7. Separación Estricta de Fases

El sistema mantiene separación estricta entre fases de desarrollo y operación. Las decisiones de registro e identidad aplican a fases futuras y no modifican fases ya completadas.

**Fases existentes**:
- Fase M (Modo 1): Operación controlada con límites estrictos
- Fase U (Futura): Operación sin límites operativos

**Regla**: Las decisiones de registro e identidad documentadas aquí no afectan la implementación de Fase M. Aplican a fases futuras cuando se implemente el sistema de registro completo.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


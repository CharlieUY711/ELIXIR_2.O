# Overview del Registro

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Qué es el Registro

El registro es el proceso de creación inicial de cuenta en Elixir Platform. Establece la identidad mínima necesaria para que un usuario o modelo pueda acceder al sistema.

El registro crea una cuenta con identidad provisional, utilizando WhatsApp como identidad primaria. No requiere información personal completa ni verificaciones extensas.

**Regla fundamental**: El registro es mínimo y solo solicita lo estrictamente necesario para establecer identidad provisional.

---

## 2. Qué NO es el Registro

El registro NO es:

- **Verificación de edad**: Proceso independiente que habilita acceso a contenido para adultos
- **Acceso adulto**: Funcionalidad que requiere verificación de edad previa
- **Pago**: Proceso de habilitación de transacciones financieras
- **Operación**: Funcionalidades avanzadas que requieren verificaciones adicionales
- **Configuración de perfil**: Proceso posterior al registro para personalizar la cuenta
- **Habilitación de funcionalidades**: Proceso que ocurre después del registro según necesidad

**Regla**: El registro solo establece la cuenta. Todos los demás procesos son independientes y opcionales.

---

## 3. Separación Explícita de Procesos

El sistema mantiene separación estricta entre cinco procesos distintos:

### 3.1. Registro

Proceso de creación inicial de cuenta. Establece identidad mínima mediante WhatsApp y genera alias técnico autogenerado. No requiere información personal completa ni verificación extensa.

**Alcance**: Creación de cuenta con identidad provisional.

### 3.2. Verificación de Edad

Proceso de validación de que el usuario o modelo cumple con los requisitos de edad para contenido para adultos. Habilita acceso a contenido etiquetado como adulto y funcionalidades relacionadas.

**Alcance**: Validación de requisitos de edad.

### 3.3. Acceso Adulto

Funcionalidad que permite visualizar y acceder a contenido etiquetado como adulto. Requiere verificación de edad previa.

**Alcance**: Habilitación de visualización de contenido para adultos.

### 3.4. Pago

Proceso de habilitación de transacciones financieras. Para usuarios, habilita carga de saldo y pagos. Para modelos, habilita recepción de pagos y retiros de fondos.

**Alcance**: Habilitación de capacidades financieras.

### 3.5. Operación

Funcionalidades avanzadas del sistema que requieren verificaciones completas. Incluye chat completo, visualización pública de perfiles, y todas las capacidades del sistema.

**Alcance**: Acceso completo a funcionalidades del sistema.

**Regla**: Estos procesos son independientes y pueden ejecutarse en diferentes momentos según necesidad. El registro es el único proceso obligatorio para acceder al sistema.

---

## 4. Principio de Fricción Progresiva

El sistema aplica fricción progresiva en todos los procesos. La fricción aumenta solo cuando es estrictamente necesario para habilitar funcionalidades específicas.

**Regla fundamental**: Pedir solo cuando es necesario.

El sistema no solicita información que no es requerida para la funcionalidad inmediata que el usuario o modelo desea utilizar. Cada solicitud de información debe estar justificada por una necesidad funcional específica.

**Implicaciones**:
- El registro solicita únicamente número de WhatsApp
- La verificación de edad se solicita solo cuando se intenta acceder a contenido para adultos
- La verificación de pago se solicita solo cuando se intenta realizar transacciones financieras
- No se solicita información que no tiene uso inmediato

---

## 5. Registro Unificado

El sistema utiliza un registro unificado para usuarios y modelos. El mismo proceso de registro aplica a ambos tipos de cuenta, diferenciándose solo en las funcionalidades habilitadas posteriormente según el tipo.

**Justificación**:
- Simplifica la arquitectura del sistema
- Reduce duplicación de lógica
- Permite transición entre tipos de cuenta si es necesario en el futuro

**Implicaciones**:
- El proceso de registro es idéntico para usuarios y modelos
- La diferenciación ocurre después del registro mediante elección de rol
- Los alias técnicos siguen el mismo formato independientemente del tipo

---

## 6. Identidad Provisional por Defecto

Toda cuenta creada mediante el registro queda en estado de identidad provisional. La identidad provisional permite acceso limitado a funcionalidades básicas del sistema.

**Características de identidad provisional**:
- Alias técnico autogenerado
- Número de WhatsApp asociado
- Estado de verificación mínimo
- Acceso restringido a funcionalidades básicas

**Regla**: El sistema permite operación con identidad provisional. La consolidación de identidad es progresiva y opcional según las funcionalidades que el usuario o modelo desee utilizar.

---

## 7. Verificación Progresiva

La verificación es un proceso progresivo que habilita funcionalidades incrementales. Cada nivel de verificación desbloquea funcionalidades específicas.

**Niveles de verificación**:
1. Verificación de WhatsApp: Habilita acceso básico y comunicación
2. Verificación de edad: Habilita acceso a contenido para adultos
3. Verificación de pago: Habilita transacciones financieras

**Regla**: Cada verificación es independiente y puede completarse en cualquier orden, excepto que la verificación de WhatsApp es prerrequisito para todas las demás.

---

## 8. Separación Estricta de Fases

El sistema mantiene separación estricta entre fases de desarrollo y operación. Las decisiones de registro documentadas aquí aplican a fases futuras y no modifican fases ya completadas.

**Fases existentes**:
- Fase M (Modo 1): Operación controlada con límites estrictos
- Fase U (Futura): Operación sin límites operativos

**Regla**: Las decisiones de registro documentadas aquí no afectan la implementación de Fase M. Aplican a fases futuras cuando se implemente el sistema de registro completo.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


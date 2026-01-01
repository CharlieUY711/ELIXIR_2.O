# Límites y No Decisiones

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Qué NO se Decidió Aún

Esta sección documenta explícitamente qué decisiones no se han tomado y qué aspectos quedan pendientes para implementación futura.

### 1.1. Proveedor de Verificación de Edad

**Estado**: No decidido

**Pendiente**:
- Selección del proveedor de verificación de edad
- Método específico de verificación (documentos, selfie, etc.)
- Integración técnica con el proveedor
- Flujo de usuario para verificación de edad
- Manejo de rechazos y apelaciones

**Regla**: La verificación de edad es requerida pero el método no está definido. Se documentará cuando se tome la decisión.

### 1.2. Proveedor de Pagos

**Estado**: No decidido

**Pendiente**:
- Selección del proveedor de pagos para usuarios
- Métodos de pago aceptados
- Integración técnica con el proveedor
- Flujo de usuario para carga de saldo
- Manejo de transacciones fallidas

**Regla**: Los pagos son requeridos pero el proveedor no está definido. Se documentará cuando se tome la decisión.

### 1.3. Proveedor de Retiros

**Estado**: No decidido

**Pendiente**:
- Selección del proveedor de retiros para modelos
- Métodos de retiro aceptados
- Integración técnica con el proveedor
- Flujo de modelo para retiros
- Manejo de retiros fallidos

**Regla**: Los retiros son requeridos pero el proveedor no está definido. Se documentará cuando se tome la decisión.

### 1.4. Método de Verificación de WhatsApp

**Estado**: Parcialmente decidido

**Decidido**:
- Verificación mediante OTP (One-Time Password)
- WhatsApp como identidad primaria

**Pendiente**:
- Proveedor específico de OTP (si aplica)
- Integración técnica con el proveedor
- Flujo detallado de verificación
- Manejo de errores y reintentos

**Regla**: El método general está decidido pero los detalles técnicos no están definidos. Se documentarán cuando se implemente.

### 1.5. Almacenamiento de Imágenes

**Estado**: No decidido

**Pendiente**:
- Proveedor de almacenamiento (S3, Cloud Storage, etc.)
- Estructura de almacenamiento
- Políticas de retención
- CDN para entrega de imágenes
- Optimización y compresión

**Regla**: Las imágenes deben almacenarse pero el método no está definido. Se documentará cuando se tome la decisión.

### 1.6. Base de Datos de Usuarios y Modelos

**Estado**: No decidido

**Pendiente**:
- Tipo de base de datos (SQL, NoSQL, etc.)
- Esquema de datos detallado
- Índices y optimizaciones
- Políticas de backup y recuperación
- Migraciones de esquema

**Regla**: Los datos deben persistirse pero el método no está definido. Se documentará cuando se tome la decisión.

---

## 2. Qué NO debe Implementarse Todavía

Esta sección documenta explícitamente qué funcionalidades no deben implementarse en este momento.

### 2.1. Sistema de Registro Completo

**Estado**: No implementar

**Razón**: El sistema de registro completo aplica a fases futuras. La Fase M (Modo 1) opera sin sistema de registro completo.

**Regla**: No se debe implementar el sistema de registro documentado en estos archivos hasta que se defina una fase que lo requiera.

### 2.2. Verificación de Edad

**Estado**: No implementar

**Razón**: El proveedor y método de verificación de edad no están decididos. No se debe implementar hasta que se tomen las decisiones correspondientes.

**Regla**: No se debe implementar verificación de edad hasta que se seleccione proveedor y se defina el método.

### 2.3. Verificación de Pagos

**Estado**: No implementar

**Razón**: El proveedor de pagos no está decidido. No se debe implementar hasta que se seleccione el proveedor y se defina la integración.

**Regla**: No se debe implementar verificación de pagos hasta que se seleccione proveedor y se defina la integración.

### 2.4. Verificación de Retiros

**Estado**: No implementar

**Razón**: El proveedor de retiros no está decidido. No se debe implementar hasta que se seleccione el proveedor y se defina la integración.

**Regla**: No se debe implementar verificación de retiros hasta que se seleccione proveedor y se defina la integración.

### 2.5. Sistema de Tags de Imágenes

**Estado**: No implementar

**Razón**: El sistema de tags de imágenes requiere el sistema de registro completo y almacenamiento de imágenes. No se debe implementar hasta que se implementen los prerrequisitos.

**Regla**: No se debe implementar sistema de tags hasta que se implementen registro completo y almacenamiento de imágenes.

### 2.6. Sistema de Blur de Imágenes

**Estado**: No implementar

**Razón**: El sistema de blur requiere el sistema de tags de imágenes y verificación de edad. No se debe implementar hasta que se implementen los prerrequisitos.

**Regla**: No se debe implementar sistema de blur hasta que se implementen tags de imágenes y verificación de edad.

---

## 3. Relación con Fases Anteriores

### 3.1. Core (Elixir Core)

**Estado**: Completado

**Relación**: El Core gestiona saldo y transacciones. Las decisiones de registro e identidad no modifican el Core. El Core opera independientemente del sistema de registro.

**Regla**: Las decisiones de registro e identidad no afectan el Core. El Core sigue operando según su documentación existente.

### 3.2. WAM (WhatsApp Edge)

**Estado**: Completado

**Relación**: El WAM gestiona handoffs hacia WhatsApp. Las decisiones de registro e identidad no modifican el WAM. El WAM opera independientemente del sistema de registro.

**Regla**: Las decisiones de registro e identidad no afectan el WAM. El WAM sigue operando según su documentación existente.

### 3.3. Modo 1 (Fase M)

**Estado**: Operativo

**Relación**: El Modo 1 opera sin sistema de registro completo. Las decisiones de registro e identidad documentadas aquí no aplican al Modo 1.

**Regla**: El Modo 1 no se modifica por estas decisiones. Sigue operando según su documentación existente.

---

## 4. Alcance de esta Documentación

### 4.1. Qué Documenta

Esta documentación establece:
- Principios de registro e identidad
- Estados de cuenta canónicos
- Flujos de usuario y modelo
- Reglas de visibilidad de imágenes
- Separación de procesos

### 4.2. Qué NO Documenta

Esta documentación NO establece:
- Implementación técnica específica
- Proveedores de servicios externos
- Detalles de integración
- Esquemas de base de datos
- APIs específicas
- Flujos de UI

**Regla**: Esta documentación es normativa sobre qué debe hacerse, no prescriptiva sobre cómo debe implementarse.

---

## 5. Dependencias para Implementación

### 5.1. Prerrequisitos

Antes de implementar el sistema de registro completo, se requiere:
1. Decisión sobre proveedor de verificación de edad
2. Decisión sobre proveedor de pagos
3. Decisión sobre proveedor de retiros
4. Decisión sobre almacenamiento de imágenes
5. Decisión sobre base de datos de usuarios y modelos
6. Definición de fase que requiera el sistema de registro

### 5.2. Orden de Implementación

El orden sugerido (no prescriptivo) sería:
1. Base de datos de usuarios y modelos
2. Sistema de registro básico (WhatsApp + OTP)
3. Almacenamiento de imágenes
4. Sistema de tags de imágenes
5. Verificación de edad
6. Sistema de blur
7. Verificación de pagos
8. Verificación de retiros

**Regla**: Este orden es sugerido, no prescriptivo. Se puede ajustar según necesidades específicas.

---

## 6. Separación Estricta de Fases

Las decisiones documentadas aquí aplican a fases futuras. No modifican fases ya completadas o en operación.

**Regla**: Las decisiones de registro e identidad son normativas para implementación futura. No afectan implementación actual.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


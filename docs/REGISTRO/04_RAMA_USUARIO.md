# Rama Usuario

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Descripción General

La rama usuario describe el estado inicial y las capacidades de un usuario después de completar el registro. El usuario queda en estado `provisional` con acceso limitado a funcionalidades básicas del sistema.

**Regla fundamental**: El usuario puede explorar el catálogo sin verificaciones adicionales. Las verificaciones se solicitan solo cuando el usuario intenta acceder a funcionalidades que las requieren.

---

## 2. Estado Inicial Post-Registro

### 2.1. Estados Establecidos

Después de completar el registro, el usuario queda con:
- `whatsapp_verified`: `true`
- `identity_status`: `provisional`
- `role`: `user`

### 2.2. Acceso Inmediato

El usuario puede acceder inmediatamente a funcionalidades básicas sin verificaciones adicionales.

---

## 3. Qué Puede Ver

### 3.1. Catálogo Teaser

El usuario puede acceder al catálogo completo y visualizar:
- Listado de modelos disponibles
- Información básica de perfiles
- Imágenes con tag `teaser` sin restricciones
- Imágenes con tag `adult` con blur aplicado

**Regla**: El catálogo teaser permite exploración sin verificaciones adicionales.

### 3.2. Navegación Básica

El usuario puede:
- Navegar por el catálogo
- Ver información básica de modelos
- Explorar contenido teaser
- Acceder a información general del sistema

**Regla**: La navegación básica no requiere verificaciones adicionales.

---

## 4. Qué NO Puede Hacer

### 4.1. Acceso a Contenido Adulto

El usuario NO puede:
- Visualizar imágenes con tag `adult` sin blur
- Acceder a contenido para adultos sin verificación de edad

**Regla**: El acceso a contenido adulto requiere verificación de edad.

### 4.2. Acceso a Chat

El usuario NO puede:
- Iniciar conversaciones con modelos
- Acceder a chat sin verificación de edad y pago
- Enviar mensajes a modelos

**Regla**: El acceso a chat requiere verificación de edad y verificación de pago.

### 4.3. Transacciones Financieras

El usuario NO puede:
- Cargar saldo
- Realizar pagos
- Acceder a funcionalidades que requieren capacidad de pago

**Regla**: Las transacciones financieras requieren verificación de pago.

---

## 5. Gates Definidos pero No Ejecutados

### 5.1. Gate de Verificación de Edad

El gate de verificación de edad está definido pero no se ejecuta hasta que el usuario intenta acceder a funcionalidades que lo requieren.

**Activación**:
- Intento de visualizar imágenes con tag `adult` sin blur
- Intento de acceder a chat con modelos
- Cualquier funcionalidad que requiera verificación de edad

**Regla**: El gate se activa solo cuando el usuario intenta acceder a funcionalidades que requieren verificación de edad.

### 5.2. Gate de Pago

El gate de pago está definido pero no se ejecuta hasta que el usuario intenta acceder a funcionalidades que lo requieren.

**Activación**:
- Intento de acceder a chat con modelos
- Intento de realizar transacciones financieras
- Cualquier funcionalidad que requiera capacidad de pago

**Regla**: El gate se activa solo cuando el usuario intenta acceder a funcionalidades que requieren verificación de pago.

---

## 6. Flujo de Verificaciones

### 6.1. Orden de Verificaciones

El usuario puede completar las verificaciones en cualquier orden después del registro, excepto que la verificación de WhatsApp es prerrequisito para todas las demás.

**Regla**: El sistema no fuerza un orden específico de verificaciones. Cada gate se activa cuando el usuario intenta acceder a funcionalidades que lo requieren.

### 6.2. Verificación de Edad

Cuando el usuario intenta acceder a contenido adulto:
1. El sistema activa el gate de verificación de edad
2. El usuario debe completar el proceso de verificación de edad
3. Al completar, la cuenta avanza a estado `age_verified`
4. Se habilita visualización de imágenes con tag `adult` sin blur

**Regla**: La verificación de edad habilita acceso a contenido adulto pero no habilita chat sin verificación de pago.

### 6.3. Verificación de Pago

Cuando el usuario intenta acceder a chat o realizar transacciones:
1. El sistema activa el gate de verificación de pago
2. El usuario debe completar el proceso de verificación de pago
3. Al completar, la cuenta avanza a estado `payment_enabled`
4. Se habilita carga de saldo y uso de saldo para servicios

**Regla**: La verificación de pago habilita transacciones financieras pero no habilita chat sin verificación de edad.

### 6.4. Acceso Completo

Cuando el usuario tiene `age_verified` y `payment_enabled`:
- La cuenta avanza automáticamente a estado `operational`
- Se habilita acceso completo a chat
- Se habilita acceso completo a todas las funcionalidades del sistema

**Regla**: El estado `operational` se alcanza automáticamente cuando se cumplen todas las condiciones requeridas.

---

## 7. Persistencia de Estado

El sistema mantiene el estado de verificación del usuario entre sesiones. Una vez completada una verificación, no se requiere repetirla en sesiones posteriores.

**Regla**: Las verificaciones son permanentes mientras la cuenta exista, salvo revocación explícita por el sistema.

---

## 8. Separación de Fases

Este flujo aplica a fases futuras cuando se implemente el sistema de registro completo. No modifica la operación actual de Fase M (Modo 1).

**Regla**: El flujo documentado aquí es normativo para implementación futura, no descriptivo de implementación actual.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


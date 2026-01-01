# Flujo de Usuario

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Visita Inicial (Visitante)

### 1.1. Estado

El usuario accede al sistema sin cuenta registrada. No tiene identidad en el sistema.

### 1.2. Capacidades

**Permite**:
- Visualización del catálogo
- Visualización de imágenes con tag `teaser`
- Navegación básica

**No permite**:
- Acceso a chat
- Visualización de imágenes con tag `adult`
- Interacción con modelos
- Registro automático

### 1.3. Transición

El visitante puede iniciar el proceso de registro en cualquier momento mediante acción explícita.

---

## 2. Registro

### 2.1. Inicio

El usuario inicia el proceso de registro proporcionando su número de WhatsApp.

### 2.2. Validación de WhatsApp

El sistema envía un código OTP al número de WhatsApp proporcionado. El usuario debe ingresar el código para completar la validación.

**Regla**: Sin validación de OTP, el registro no se completa.

### 2.3. Creación de Cuenta

Al completar la validación de WhatsApp:
- Se crea la cuenta con alias técnico `Elixir_U{numero_secuencial}`
- La cuenta queda en estado `provisional`
- Se establece WhatsApp como identidad primaria

### 2.4. Finalización

El registro se completa y el usuario queda en estado `provisional`. Puede acceder a funcionalidades básicas del sistema.

---

## 3. Acceso Teaser

### 3.1. Estado Requerido

Estado mínimo: `provisional`

### 3.2. Capacidades

**Permite**:
- Acceso completo al catálogo
- Visualización de imágenes con tag `teaser` sin restricciones
- Visualización de imágenes con tag `adult` con blur aplicado
- Navegación completa del catálogo

**No permite**:
- Acceso a chat
- Visualización de imágenes con tag `adult` sin blur
- Transacciones financieras

### 3.3. Propósito

El acceso teaser permite al usuario explorar el catálogo y decidir si desea continuar con verificaciones adicionales para acceder a más funcionalidades.

---

## 4. Gate de Verificación de Edad

### 4.1. Activación

El gate se activa cuando el usuario intenta:
- Acceder a chat con modelos
- Visualizar imágenes con tag `adult` sin blur
- Cualquier funcionalidad que requiera verificación de edad

### 4.2. Proceso de Verificación

El usuario debe completar el proceso de verificación de edad según el método implementado por el sistema.

**Regla**: El método de verificación de edad no está definido en esta documentación. Se documentará cuando se tome la decisión correspondiente.

### 4.3. Resultado

Al completar la verificación de edad:
- La cuenta avanza a estado `age_verified`
- Se habilita visualización de imágenes con tag `adult` sin blur
- Se habilita acceso a chat (si también tiene `payment_enabled`)

### 4.4. Bloqueo

Si el usuario no completa la verificación de edad, no puede acceder a funcionalidades que la requieren. El sistema mantiene el acceso teaser disponible.

---

## 5. Gate de Pago

### 5.1. Activación

El gate se activa cuando el usuario intenta:
- Acceder a chat con modelos
- Realizar transacciones financieras
- Cualquier funcionalidad que requiera capacidad de pago

### 5.2. Proceso de Verificación

El usuario debe completar el proceso de verificación de capacidad de pago según el método implementado por el sistema.

**Regla**: El método de verificación de pago no está definido en esta documentación. Se documentará cuando se tome la decisión correspondiente.

### 5.3. Resultado

Al completar la verificación de pago:
- La cuenta avanza a estado `payment_enabled`
- Se habilita carga de saldo
- Se habilita uso de saldo para servicios
- Se habilita acceso completo a chat (si también tiene `age_verified`)

### 5.4. Bloqueo

Si el usuario no completa la verificación de pago, no puede acceder a funcionalidades que la requieren. El sistema mantiene el acceso teaser disponible.

---

## 6. Acceso a Chat

### 6.1. Estado Requerido

Estados mínimos requeridos:
- `age_verified`: Verificado
- `payment_enabled`: Verificado

Esto resulta automáticamente en estado `operational`.

### 6.2. Capacidades

**Permite**:
- Acceso completo a chat con modelos
- Inicio de conversaciones
- Recepción de mensajes
- Uso de saldo para servicios de chat
- Handoff hacia WhatsApp (si está habilitado)

**No permite**:
- Funcionalidades que requieren verificaciones adicionales (si existen)

### 6.3. Flujo de Chat

El usuario puede:
1. Seleccionar un modelo del catálogo
2. Iniciar conversación
3. Interactuar mediante chat
4. Realizar handoff hacia WhatsApp si el modelo y el sistema lo permiten

---

## 7. Flujo Completo

### 7.1. Secuencia Típica

1. **Visitante**: Acceso al catálogo sin cuenta
2. **Registro**: Proporciona WhatsApp, valida OTP, cuenta creada en estado `provisional`
3. **Acceso Teaser**: Explora catálogo, ve imágenes teaser y adult con blur
4. **Gate de Edad**: Intenta acceder a chat, completa verificación de edad, avanza a `age_verified`
5. **Gate de Pago**: Intenta acceder a chat, completa verificación de pago, avanza a `payment_enabled` y `operational`
6. **Acceso a Chat**: Acceso completo a todas las funcionalidades

### 7.2. Variaciones

El usuario puede completar las verificaciones en cualquier orden después del registro, excepto que la verificación de WhatsApp es prerrequisito para todas las demás.

**Regla**: El sistema no fuerza un orden específico de verificaciones. Cada gate se activa cuando el usuario intenta acceder a funcionalidades que lo requieren.

---

## 8. Persistencia de Estado

El sistema mantiene el estado de verificación del usuario entre sesiones. Una vez completada una verificación, no se requiere repetirla en sesiones posteriores.

**Regla**: Las verificaciones son permanentes mientras la cuenta exista, salvo revocación explícita por el sistema.

---

## 9. Separación de Fases

Este flujo aplica a fases futuras cuando se implemente el sistema de registro completo. No modifica la operación actual de Fase M (Modo 1).

**Regla**: El flujo documentado aquí es normativo para implementación futura, no descriptivo de implementación actual.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


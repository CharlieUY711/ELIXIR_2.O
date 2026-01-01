# Flujo de Modelo

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Registro

### 1.1. Inicio

El modelo inicia el proceso de registro proporcionando su número de WhatsApp.

### 1.2. Validación de WhatsApp

El sistema envía un código OTP al número de WhatsApp proporcionado. El modelo debe ingresar el código para completar la validación.

**Regla**: Sin validación de OTP, el registro no se completa.

### 1.3. Creación de Cuenta

Al completar la validación de WhatsApp:
- Se crea la cuenta con alias técnico `Elixir_M{numero_secuencial}`
- La cuenta queda en estado `provisional`
- Se establece WhatsApp como identidad primaria
- Se configura el tipo de cuenta como modelo

### 1.4. Finalización

El registro se completa y el modelo queda en estado `provisional`. Puede acceder a funcionalidades básicas de configuración.

---

## 2. Preparación Privada de Perfil

### 2.1. Estado Requerido

Estado mínimo: `provisional`

### 2.2. Capacidades

**Permite**:
- Configuración de perfil en modo privado
- Edición de información básica
- Preparación de contenido
- Subida de imágenes en estado privado

**No permite**:
- Visualización pública del perfil
- Recepción de mensajes de usuarios
- Retiros de fondos

### 2.3. Propósito

La preparación privada permite al modelo configurar su perfil y contenido antes de hacerlo público. El modelo puede trabajar en su perfil sin presión de usuarios esperando acceso.

---

## 3. Subida de Imágenes (Privadas)

### 3.1. Estado Requerido

Estado mínimo: `provisional`

### 3.2. Capacidades

**Permite**:
- Subida de imágenes con tag `teaser`
- Subida de imágenes con tag `adult`
- Almacenamiento de imágenes en estado privado
- Edición y eliminación de imágenes privadas

**No permite**:
- Visualización pública de imágenes
- Visualización de imágenes por usuarios
- Publicación automática

### 3.3. Tags de Imágenes

Las imágenes deben ser etiquetadas correctamente:
- `teaser`: Imágenes que pueden mostrarse sin verificación de edad
- `adult`: Imágenes que requieren verificación de edad para visualización

**Regla**: El modelo es responsable de etiquetar correctamente las imágenes. El sistema aplica reglas de visibilidad según los tags.

---

## 4. Gate de Verificación de Edad

### 4.1. Activación

El gate se activa cuando el modelo intenta:
- Hacer público su perfil
- Permitir visualización de imágenes con tag `adult`
- Recibir mensajes de usuarios
- Cualquier funcionalidad que requiera verificación de edad

### 4.2. Proceso de Verificación

El modelo debe completar el proceso de verificación de edad según el método implementado por el sistema.

**Regla**: El método de verificación de edad no está definido en esta documentación. Se documentará cuando se tome la decisión correspondiente.

### 4.3. Resultado

Al completar la verificación de edad:
- La cuenta avanza a estado `age_verified`
- Se habilita visualización pública de perfil
- Se habilita visualización de imágenes con tag `adult` (si también tiene `payment_enabled`)
- Se habilita recepción de mensajes (si también tiene `payment_enabled`)

### 4.4. Bloqueo

Si el modelo no completa la verificación de edad, no puede acceder a funcionalidades que la requieren. El sistema mantiene el modo privado disponible.

---

## 5. Gate de Pagos y Retiros

### 5.1. Activación

El gate se activa cuando el modelo intenta:
- Habilitar recepción de mensajes de usuarios
- Configurar métodos de retiro
- Realizar retiros de fondos
- Cualquier funcionalidad que requiera capacidad de retiro

### 5.2. Proceso de Verificación

El modelo debe completar el proceso de verificación de capacidad de retiro según el método implementado por el sistema.

**Regla**: El método de verificación de retiros no está definido en esta documentación. Se documentará cuando se tome la decisión correspondiente.

### 5.3. Resultado

Al completar la verificación de retiros:
- La cuenta avanza a estado `payment_enabled`
- Se habilita recepción de pagos
- Se habilita configuración de métodos de retiro
- Se habilita realización de retiros
- Se habilita recepción completa de mensajes (si también tiene `age_verified`)

### 5.4. Bloqueo

Si el modelo no completa la verificación de retiros, no puede acceder a funcionalidades que la requieren. El sistema mantiene el modo privado disponible.

---

## 6. Habilitación para Recibir Mensajes

### 6.1. Estado Requerido

Estados mínimos requeridos:
- `age_verified`: Verificado
- `payment_enabled`: Verificado

Esto resulta automáticamente en estado `operational`.

### 6.2. Capacidades

**Permite**:
- Recepción completa de mensajes de usuarios
- Visualización pública completa del perfil
- Visualización pública de todas las imágenes (según tags y estado del usuario)
- Recepción de pagos
- Realización de retiros
- Handoff desde WhatsApp (si está habilitado)

**No permite**:
- Funcionalidades que requieren verificaciones adicionales (si existen)

### 6.3. Flujo de Recepción de Mensajes

El modelo puede:
1. Recibir solicitudes de chat de usuarios
2. Responder a mensajes
3. Interactuar mediante chat
4. Realizar handoff desde WhatsApp si el usuario y el sistema lo permiten
5. Recibir pagos por servicios

---

## 7. Flujo Completo

### 7.1. Secuencia Típica

1. **Registro**: Proporciona WhatsApp, valida OTP, cuenta creada en estado `provisional`
2. **Preparación Privada**: Configura perfil en modo privado, sube imágenes privadas
3. **Gate de Edad**: Intenta hacer público el perfil, completa verificación de edad, avanza a `age_verified`
4. **Gate de Retiros**: Intenta habilitar recepción de mensajes, completa verificación de retiros, avanza a `payment_enabled` y `operational`
5. **Habilitación para Mensajes**: Perfil público, recepción completa de mensajes, acceso completo a todas las funcionalidades

### 7.2. Variaciones

El modelo puede completar las verificaciones en cualquier orden después del registro, excepto que la verificación de WhatsApp es prerrequisito para todas las demás.

**Regla**: El sistema no fuerza un orden específico de verificaciones. Cada gate se activa cuando el modelo intenta acceder a funcionalidades que lo requieren.

---

## 8. Diferencias con Flujo de Usuario

### 8.1. Preparación Privada

Los modelos tienen una fase de preparación privada que los usuarios no tienen. Los modelos pueden configurar su perfil antes de hacerlo público.

### 8.2. Verificación de Retiros vs Verificación de Pagos

- **Modelos**: Verifican capacidad de retiro (recibir y retirar fondos)
- **Usuarios**: Verifican capacidad de pago (cargar saldo y pagar)

### 8.3. Recepción vs Inicio

- **Modelos**: Reciben mensajes de usuarios
- **Usuarios**: Inician mensajes con modelos

---

## 9. Persistencia de Estado

El sistema mantiene el estado de verificación del modelo entre sesiones. Una vez completada una verificación, no se requiere repetirla en sesiones posteriores.

**Regla**: Las verificaciones son permanentes mientras la cuenta exista, salvo revocación explícita por el sistema.

---

## 10. Separación de Fases

Este flujo aplica a fases futuras cuando se implemente el sistema de registro completo. No modifica la operación actual de Fase M (Modo 1).

**Regla**: El flujo documentado aquí es normativo para implementación futura, no descriptivo de implementación actual.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


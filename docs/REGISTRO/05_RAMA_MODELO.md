# Rama Modelo

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Descripción General

La rama modelo describe el estado inicial y las capacidades de un modelo después de completar el registro. El modelo queda en estado `provisional` con acceso a panel privado para configuración de perfil.

**Regla fundamental**: El modelo puede configurar su perfil en modo privado sin verificaciones adicionales. Las verificaciones se solicitan solo cuando el modelo intenta acceder a funcionalidades que las requieren.

---

## 2. Estado Inicial Post-Registro

### 2.1. Estados Establecidos

Después de completar el registro, el modelo queda con:
- `whatsapp_verified`: `true`
- `identity_status`: `provisional`
- `role`: `model`

### 2.2. Acceso Inmediato

El modelo puede acceder inmediatamente a panel privado para configuración de perfil sin verificaciones adicionales.

---

## 3. Panel Privado

### 3.1. Acceso

El modelo tiene acceso a un panel privado que no es visible para usuarios. El panel permite configuración de perfil y preparación de contenido.

**Regla**: El panel privado es accesible inmediatamente después del registro sin verificaciones adicionales.

### 3.2. Funcionalidades del Panel

El panel privado permite:
- Configuración de información básica del perfil
- Edición de información personal
- Preparación de contenido
- Gestión de imágenes privadas

**Regla**: El panel privado permite preparación completa del perfil antes de hacerlo público.

---

## 4. Preparación de Perfil

### 4.1. Configuración Básica

El modelo puede configurar:
- Información básica del perfil
- Descripción personal
- Preferencias de contenido
- Configuración de visibilidad

**Regla**: La configuración de perfil es privada hasta que el modelo complete verificaciones necesarias.

### 4.2. Edición Continua

El modelo puede editar su perfil en cualquier momento, incluso después de hacerlo público. Los cambios se reflejan según el estado de verificación y visibilidad del perfil.

**Regla**: El modelo tiene control completo sobre la edición de su perfil.

---

## 5. Subida de Imágenes Privadas

### 5.1. Estado de las Imágenes

El modelo puede subir imágenes que quedan en estado privado. Las imágenes privadas no son visibles para usuarios hasta que el modelo complete verificaciones necesarias y las haga públicas.

**Regla**: Las imágenes subidas quedan en estado privado por defecto.

### 5.2. Etiquetado

El modelo debe etiquetar las imágenes correctamente:
- `teaser`: Imágenes que pueden mostrarse sin verificación de edad
- `adult`: Imágenes que requieren verificación de edad para visualización

**Regla**: El modelo es responsable de etiquetar correctamente las imágenes. El sistema aplica reglas de visibilidad según los tags.

### 5.3. Gestión de Imágenes

El modelo puede:
- Subir imágenes privadas
- Editar etiquetas de imágenes
- Eliminar imágenes privadas
- Reorganizar imágenes

**Regla**: La gestión de imágenes privadas no requiere verificaciones adicionales.

---

## 6. Qué NO Puede Hacer hasta Verificar Edad

### 6.1. Visualización Pública

El modelo NO puede:
- Hacer público su perfil sin verificación de edad
- Permitir visualización de imágenes con tag `adult` sin verificación de edad
- Mostrar perfil a usuarios sin verificación de edad

**Regla**: La visualización pública de perfil con contenido adulto requiere verificación de edad.

### 6.2. Recepción de Mensajes

El modelo NO puede:
- Recibir mensajes de usuarios sin verificación de edad y pago
- Habilitar recepción de mensajes sin verificaciones necesarias

**Regla**: La recepción de mensajes requiere verificación de edad y verificación de retiros.

---

## 7. Gates Definidos

### 7.1. Gate de Verificación de Edad

El gate de verificación de edad está definido y se activa cuando el modelo intenta:
- Hacer público su perfil
- Permitir visualización de imágenes con tag `adult`
- Recibir mensajes de usuarios
- Cualquier funcionalidad que requiera verificación de edad

**Regla**: El gate se activa solo cuando el modelo intenta acceder a funcionalidades que requieren verificación de edad.

### 7.2. Gate de Pago y Retiros

El gate de pago y retiros está definido y se activa cuando el modelo intenta:
- Habilitar recepción de mensajes de usuarios
- Configurar métodos de retiro
- Realizar retiros de fondos
- Cualquier funcionalidad que requiera capacidad de retiro

**Regla**: El gate se activa solo cuando el modelo intenta acceder a funcionalidades que requieren verificación de retiros.

### 7.3. Gate de Habilitación para Recibir Mensajes

El gate de habilitación para recibir mensajes está definido y requiere:
- `age_verified`: Verificado
- `payment_enabled`: Verificado

**Regla**: La habilitación para recibir mensajes requiere ambas verificaciones. Esto resulta automáticamente en estado `operational`.

---

## 8. Flujo de Verificaciones

### 8.1. Orden de Verificaciones

El modelo puede completar las verificaciones en cualquier orden después del registro, excepto que la verificación de WhatsApp es prerrequisito para todas las demás.

**Regla**: El sistema no fuerza un orden específico de verificaciones. Cada gate se activa cuando el modelo intenta acceder a funcionalidades que lo requieren.

### 8.2. Verificación de Edad

Cuando el modelo intenta hacer público su perfil o permitir visualización de contenido adulto:
1. El sistema activa el gate de verificación de edad
2. El modelo debe completar el proceso de verificación de edad
3. Al completar, la cuenta avanza a estado `age_verified`
4. Se habilita visualización pública de perfil con imágenes para adultos

**Regla**: La verificación de edad habilita visualización pública pero no habilita recepción de mensajes sin verificación de retiros.

### 8.3. Verificación de Retiros

Cuando el modelo intenta habilitar recepción de mensajes o configurar retiros:
1. El sistema activa el gate de verificación de retiros
2. El modelo debe completar el proceso de verificación de capacidad de retiro
3. Al completar, la cuenta avanza a estado `payment_enabled`
4. Se habilita recepción de pagos y configuración de métodos de retiro

**Regla**: La verificación de retiros habilita recepción de pagos pero no habilita recepción de mensajes sin verificación de edad.

### 8.4. Habilitación para Recibir Mensajes

Cuando el modelo tiene `age_verified` y `payment_enabled`:
- La cuenta avanza automáticamente a estado `operational`
- Se habilita recepción completa de mensajes de usuarios
- Se habilita visualización pública completa del perfil
- Se habilita acceso completo a todas las funcionalidades del sistema

**Regla**: El estado `operational` se alcanza automáticamente cuando se cumplen todas las condiciones requeridas.

---

## 9. Diferencias con Rama Usuario

### 9.1. Preparación Privada

Los modelos tienen una fase de preparación privada que los usuarios no tienen. Los modelos pueden configurar su perfil antes de hacerlo público.

**Regla**: La preparación privada es exclusiva de modelos.

### 9.2. Verificación de Retiros vs Verificación de Pagos

- **Modelos**: Verifican capacidad de retiro (recibir y retirar fondos)
- **Usuarios**: Verifican capacidad de pago (cargar saldo y pagar)

**Regla**: La verificación financiera es diferente según el tipo de cuenta.

### 9.3. Recepción vs Inicio

- **Modelos**: Reciben mensajes de usuarios
- **Usuarios**: Inician mensajes con modelos

**Regla**: La dirección de comunicación es diferente según el tipo de cuenta.

---

## 10. Persistencia de Estado

El sistema mantiene el estado de verificación del modelo entre sesiones. Una vez completada una verificación, no se requiere repetirla en sesiones posteriores.

**Regla**: Las verificaciones son permanentes mientras la cuenta exista, salvo revocación explícita por el sistema.

---

## 11. Separación de Fases

Este flujo aplica a fases futuras cuando se implemente el sistema de registro completo. No modifica la operación actual de Fase M (Modo 1).

**Regla**: El flujo documentado aquí es normativo para implementación futura, no descriptivo de implementación actual.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


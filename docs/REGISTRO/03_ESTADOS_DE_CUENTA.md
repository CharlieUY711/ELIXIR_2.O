# Estados de Cuenta

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Estados Canónicos

El sistema define cinco estados canónicos para cuentas de usuarios y modelos. Los estados son progresivos y cada uno habilita funcionalidades adicionales.

**Estados definidos**:
1. `provisional`
2. `whatsapp_verified`
3. `age_verified`
4. `payment_enabled`
5. `operational`

**Regla**: Los estados son progresivos y solo pueden avanzar en el orden definido. No se puede saltar estados.

---

## 2. Estado: Provisional

### 2.1. Definición

Estado inicial de toda cuenta después del registro. La cuenta existe pero no ha completado ninguna verificación adicional más allá de la verificación de WhatsApp.

### 2.2. Para Usuarios

**Permite**:
- Acceso básico al catálogo
- Visualización de imágenes con tag `teaser` sin restricciones
- Visualización de imágenes con tag `adult` con blur aplicado
- Inicio de proceso de verificación de edad
- Inicio de proceso de verificación de pago

**No permite**:
- Acceso a chat con modelos
- Visualización de imágenes con tag `adult` sin blur
- Transacciones financieras
- Acceso a funcionalidades que requieren verificación adicional

### 2.3. Para Modelos

**Permite**:
- Acceso básico al sistema
- Configuración privada de perfil
- Subida de imágenes en estado privado
- Etiquetado de imágenes como `teaser` o `adult`
- Inicio de proceso de verificación de edad
- Inicio de proceso de verificación de retiros

**No permite**:
- Recepción de mensajes de usuarios
- Visualización pública de perfil
- Visualización pública de imágenes
- Retiros de fondos
- Acceso a funcionalidades que requieren verificación

---

## 3. Estado: WhatsApp Verified

### 3.1. Definición

Estado alcanzado después de completar la verificación de WhatsApp mediante OTP. Confirma que el número de WhatsApp es válido y accesible.

**Nota**: Este estado se alcanza automáticamente durante el registro. Toda cuenta registrada tiene `whatsapp_verified = true`.

### 3.2. Para Usuarios

**Permite**:
- Todo lo permitido en estado `provisional`
- Comunicación mediante WhatsApp
- Inicio de handoff hacia WhatsApp (si está habilitado)

**No permite**:
- Acceso a chat sin verificación de edad (si el contenido es para adultos)
- Visualización de imágenes con tag `adult` sin blur
- Transacciones financieras

### 3.3. Para Modelos

**Permite**:
- Todo lo permitido en estado `provisional`
- Comunicación mediante WhatsApp
- Recepción de handoffs desde WhatsApp (si está habilitado)

**No permite**:
- Recepción de mensajes sin verificación de edad (si el contenido es para adultos)
- Visualización pública de perfil sin verificación de edad
- Retiros de fondos

---

## 4. Estado: Age Verified

### 4.1. Definición

Estado alcanzado después de completar la verificación de edad. Confirma que el usuario o modelo cumple con los requisitos de edad para contenido para adultos.

### 4.2. Para Usuarios

**Permite**:
- Todo lo permitido en estado `whatsapp_verified`
- Visualización de imágenes con tag `adult` sin blur
- Acceso a chat con modelos (si también tiene `payment_enabled`)

**No permite**:
- Transacciones financieras sin `payment_enabled`
- Acceso completo a funcionalidades sin `payment_enabled`

### 4.3. Para Modelos

**Permite**:
- Todo lo permitido en estado `whatsapp_verified`
- Visualización pública de perfil con imágenes para adultos
- Recepción de mensajes de usuarios (si también tiene `payment_enabled`)

**No permite**:
- Retiros de fondos sin `payment_enabled`
- Acceso completo a funcionalidades sin `payment_enabled`

---

## 5. Estado: Payment Enabled

### 5.1. Definición

Estado alcanzado después de completar la verificación de capacidad de pago (para usuarios) o capacidad de retiro (para modelos). Habilita transacciones financieras.

### 5.2. Para Usuarios

**Permite**:
- Todo lo permitido en estado `age_verified`
- Transacciones financieras
- Carga de saldo
- Uso de saldo para servicios

**No permite**:
- Acceso a funcionalidades que requieren estado `operational`

### 5.3. Para Modelos

**Permite**:
- Todo lo permitido en estado `age_verified`
- Retiros de fondos
- Recepción de pagos
- Configuración de métodos de retiro

**No permite**:
- Acceso a funcionalidades que requieren estado `operational`

---

## 6. Estado: Operational

### 6.1. Definición

Estado final que habilita todas las funcionalidades del sistema. Requiere haber completado todas las verificaciones necesarias.

**Regla**: El estado `operational` se alcanza automáticamente cuando se cumplen todas las condiciones:
- `whatsapp_verified`: Verificado
- `age_verified`: Verificado
- `payment_enabled`: Verificado

### 6.2. Para Usuarios

**Permite**:
- Todo lo permitido en estado `payment_enabled`
- Acceso completo a chat
- Acceso completo a todas las funcionalidades del sistema
- Sin restricciones operativas (excepto límites de fase)

**No permite**:
- Funcionalidades que requieren verificaciones adicionales (si existen)

### 6.3. Para Modelos

**Permite**:
- Todo lo permitido en estado `payment_enabled`
- Recepción completa de mensajes
- Visualización pública completa de perfil
- Acceso completo a todas las funcionalidades del sistema
- Sin restricciones operativas (excepto límites de fase)

**No permite**:
- Funcionalidades que requieren verificaciones adicionales (si existen)

---

## 7. Transiciones de Estado

### 7.1. Reglas de Transición

Los estados son progresivos y solo pueden avanzar en el orden definido:
- `provisional` → `whatsapp_verified` → `age_verified` → `payment_enabled` → `operational`

**Regla**: No se puede saltar estados. Cada estado requiere completar la verificación correspondiente.

### 7.2. Estado Operational como Consecuencia

El estado `operational` no requiere verificación adicional. Es consecuencia automática de completar todas las verificaciones previas.

**Regla**: El estado `operational` se alcanza automáticamente cuando se cumplen todas las condiciones requeridas.

---

## 8. Diferencias entre Usuario y Modelo

### 8.1. Verificación de Pago

- **Usuarios**: Verificación de capacidad de pago (carga de saldo)
- **Modelos**: Verificación de capacidad de retiro (retiro de fondos)

### 8.2. Funcionalidades Habilitadas

- **Usuarios**: Acceso a chat, visualización de contenido, transacciones de pago
- **Modelos**: Recepción de mensajes, visualización pública de perfil, retiros de fondos

### 8.3. Restricciones por Estado

Las restricciones son idénticas en estructura pero diferentes en contenido según el tipo de cuenta. Los estados canónicos son los mismos para ambos tipos.

**Regla**: Los estados canónicos son universales. Las funcionalidades habilitadas varían según el tipo de cuenta.

---

## 9. Estados y Fases del Sistema

Los estados de cuenta son independientes de las fases de desarrollo del sistema (Fase M, Fase U). Los estados definen capacidades de la cuenta, mientras que las fases definen límites operativos del sistema.

**Regla**: Los estados de cuenta aplican en todas las fases. Las fases solo afectan límites operativos, no estados de cuenta.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


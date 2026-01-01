# Registro Unificado

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Alcance del Registro Unificado

El sistema implementa un registro unificado que aplica tanto a usuarios como a modelos. El mismo proceso de registro crea cuentas de cualquier tipo, diferenciándose solo en las funcionalidades habilitadas posteriormente.

**Regla fundamental**: Un solo proceso de registro para todos los tipos de cuenta.

---

## 2. Proceso de Registro

### 2.1. Información Requerida

El registro requiere únicamente:
- Número de WhatsApp válido

**Información NO requerida en el registro**:
- Nombre real
- Nick o nombre de usuario
- Email
- Información personal adicional
- Verificación de identidad

### 2.2. Validación Inicial

El registro valida el número de WhatsApp mediante OTP (One-Time Password). El sistema envía un código de verificación al número proporcionado y requiere su ingreso para completar el registro.

**Regla**: Sin verificación de WhatsApp mediante OTP, el registro no se completa.

### 2.3. Generación de Alias Técnico

Al completar el registro, el sistema genera automáticamente un alias técnico único siguiendo el formato:
- Usuarios: `Elixir_U{numero_secuencial}`
- Modelos: `Elixir_M{numero_secuencial}`

**Características del alias**:
- Autogenerado por el sistema
- Único e irrepetible
- No modificable por el usuario o modelo
- Formato canónico estricto

**Regla**: El alias técnico es el identificador interno del sistema. No es visible para otros usuarios o modelos en funcionalidades normales.

---

## 3. Email como Secundario y Opcional

El email no es requerido para el registro ni para el acceso básico al sistema. El email es un campo opcional que puede asociarse a la cuenta en cualquier momento después del registro.

**Casos de uso del email**:
- Recuperación de cuenta (si se implementa en el futuro)
- Notificaciones opcionales
- Comunicación alternativa

**Regla**: El sistema no requiere email para ninguna funcionalidad básica. El email es completamente opcional.

---

## 4. Diferenciación de Tipo de Cuenta

Después del registro, el sistema permite configurar el tipo de cuenta (usuario o modelo). Esta configuración determina las funcionalidades disponibles.

**Regla**: El tipo de cuenta se configura después del registro. El proceso de registro en sí es idéntico para ambos tipos.

---

## 5. Estado Inicial Post-Registro

Después de completar el registro exitosamente, la cuenta queda en estado `provisional`. Este estado permite:
- Acceso básico al sistema
- Visualización de contenido con restricciones
- Configuración inicial de perfil (para modelos)

**Restricciones del estado provisional**:
- No permite acceso a contenido para adultos sin verificación de edad
- No permite transacciones financieras sin verificación de pago
- No permite funcionalidades que requieren verificación adicional

---

## 6. Validación de WhatsApp

La validación de WhatsApp mediante OTP es el único paso de verificación requerido para completar el registro. Esta validación:
- Confirma que el número de WhatsApp es válido y accesible
- Establece la identidad primaria del usuario o modelo
- Habilita el estado `whatsapp_verified` después de completarse

**Regla**: Sin validación de WhatsApp, la cuenta permanece en estado `provisional` y no puede avanzar a estados de verificación superiores.

---

## 7. Prohibiciones del Registro

El proceso de registro NO permite:
- Solicitar nombre real
- Solicitar nick o nombre de usuario
- Solicitar email como campo obligatorio
- Solicitar información personal adicional
- Solicitar verificación de identidad
- Solicitar documentos
- Solicitar información de pago

**Regla**: El registro es mínimo y solo solicita lo estrictamente necesario para establecer identidad provisional mediante WhatsApp.

---

## 8. Relación con Otros Procesos

El registro es independiente de:
- Verificación de edad (proceso posterior)
- Verificación de pago (proceso posterior)
- Configuración de perfil (proceso posterior)
- Habilitación de funcionalidades específicas (proceso posterior)

**Regla**: El registro solo establece la cuenta. Todos los demás procesos son opcionales y se ejecutan según necesidad.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


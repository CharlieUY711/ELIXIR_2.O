# Flujo de Registro

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Descripción General

El flujo de registro es el proceso mediante el cual un usuario o modelo crea una cuenta en Elixir Platform. El registro es unificado para ambos tipos de cuenta y requiere únicamente número de WhatsApp válido.

**Regla fundamental**: El registro es mínimo y solo solicita número de WhatsApp.

---

## 2. R0 — Entrada

### 2.1. Estado Inicial

El usuario o modelo accede al sistema sin cuenta registrada. No tiene identidad en el sistema.

### 2.2. Capacidades como Visitante

**Permite**:
- Visualización del catálogo
- Visualización de imágenes con tag `teaser`
- Navegación básica

**No permite**:
- Acceso a chat
- Visualización de imágenes con tag `adult`
- Interacción con modelos
- Registro automático

### 2.3. Inicio del Registro

El visitante puede iniciar el proceso de registro en cualquier momento mediante acción explícita. El sistema presenta la opción de registro pero no fuerza su ejecución.

**Regla**: El registro es opcional. El visitante puede explorar el catálogo sin registrarse.

---

## 3. R1 — Ingreso de Número WhatsApp

### 3.1. Solicitud de Información

El sistema solicita únicamente el número de WhatsApp del usuario o modelo.

**Información NO solicitada**:
- Nombre real
- Nick o nombre de usuario
- Email
- Información personal adicional
- Verificación de identidad

### 3.2. Validación de Formato

El sistema valida que el número proporcionado tenga formato válido de número telefónico. No valida que el número sea accesible o pertenezca a WhatsApp en este momento.

**Regla**: Solo se valida formato. La verificación de accesibilidad ocurre en el siguiente paso.

### 3.3. Continuación

Si el formato es válido, el sistema procede al siguiente paso. Si el formato es inválido, el sistema solicita corrección.

---

## 4. R2 — OTP por WhatsApp

### 4.1. Envío de Código

El sistema envía un código OTP (One-Time Password) al número de WhatsApp proporcionado. El código se envía mediante WhatsApp.

**Regla**: Sin envío exitoso de OTP, el registro no puede continuar.

### 4.2. Ingreso de Código

El usuario o modelo debe ingresar el código OTP recibido en WhatsApp. El sistema valida que el código ingresado coincida con el código enviado.

**Regla**: Sin validación exitosa de OTP, el registro no se completa.

### 4.3. Reenvío de Código

Si el código no se recibe o expira, el sistema permite solicitar reenvío. El sistema puede limitar la cantidad de reenvíos para prevenir abuso.

**Regla**: El sistema puede limitar reenvíos pero debe permitir al menos un reenvío.

---

## 5. R3 — Creación Automática de Identidad Provisional

### 5.1. Generación de Alias Técnico

Al completar la validación de OTP, el sistema genera automáticamente un alias técnico único:
- Usuarios: `Elixir_U{numero_secuencial}`
- Modelos: `Elixir_M{numero_secuencial}`

**Características**:
- Autogenerado por el sistema
- Único e irrepetible
- No modificable por el usuario o modelo
- Formato canónico estricto

### 5.2. Asociación de WhatsApp

El sistema asocia el número de WhatsApp verificado a la cuenta creada. El número queda establecido como identidad primaria.

**Regla**: El número de WhatsApp nunca se expone a otros usuarios o modelos.

### 5.3. Establecimiento de Estados Iniciales

El sistema establece los siguientes estados iniciales:
- `whatsapp_verified`: `true`
- `identity_status`: `provisional`
- `role`: `undefined`

**Regla**: Toda cuenta creada mediante registro queda en estado provisional con WhatsApp verificado.

---

## 6. R4 — Elección de Rol

### 6.1. Selección de Tipo de Cuenta

Después de completar el registro, el sistema solicita al usuario o modelo que seleccione el tipo de cuenta:
- Usuario
- Modelo

**Regla**: La elección de rol es obligatoria después del registro. No se puede omitir este paso.

### 6.2. Establecimiento de Rol

Una vez seleccionado el tipo de cuenta, el sistema establece el rol:
- `role`: `user` (para usuarios)
- `role`: `model` (para modelos)

**Regla**: El rol determina las funcionalidades disponibles pero no afecta el proceso de registro en sí.

### 6.3. Finalización del Registro

Con el rol establecido, el registro se completa. El usuario o modelo queda en estado `provisional` con acceso a funcionalidades básicas según su rol.

---

## 7. Estados Creados Tras el Registro

### 7.1. whatsapp_verified

Estado que indica que el número de WhatsApp ha sido verificado mediante OTP.

**Valor**: `true`

**Establecido**: Automáticamente al completar validación de OTP en R2.

**Regla**: Sin `whatsapp_verified = true`, la cuenta no puede avanzar a estados de verificación superiores.

### 7.2. identity_status

Estado que indica el nivel de consolidación de la identidad.

**Valor inicial**: `provisional`

**Establecido**: Automáticamente al crear la cuenta en R3.

**Regla**: El estado `provisional` permite acceso básico. Estados superiores requieren verificaciones adicionales.

### 7.3. role

Tipo de cuenta seleccionado por el usuario o modelo.

**Valor inicial**: `undefined`

**Valor después de R4**: `user` o `model`

**Establecido**: Por selección explícita del usuario o modelo en R4.

**Regla**: El rol determina las funcionalidades disponibles pero no afecta el proceso de registro.

---

## 8. Finalización del Registro

### 8.1. Estado Final

Después de completar todos los pasos (R0 a R4), el usuario o modelo queda con:
- Cuenta creada
- Alias técnico autogenerado
- WhatsApp verificado
- Identidad provisional establecida
- Rol seleccionado

### 8.2. Acceso Inicial

El usuario o modelo puede acceder inmediatamente a funcionalidades básicas según su rol:
- **Usuarios**: Acceso al catálogo con restricciones
- **Modelos**: Acceso a panel privado para configuración de perfil

**Regla**: El registro habilita acceso básico. Funcionalidades avanzadas requieren verificaciones adicionales.

---

## 9. Prohibiciones del Registro

El proceso de registro NO permite:
- Solicitar nombre real
- Solicitar nick o nombre de usuario
- Solicitar email como campo obligatorio
- Solicitar información personal adicional
- Solicitar verificación de identidad
- Solicitar documentos
- Solicitar información de pago
- Solicitar verificación de edad

**Regla**: El registro es mínimo y solo solicita lo estrictamente necesario para establecer identidad provisional mediante WhatsApp.

---

## 10. Relación con Otros Procesos

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


# Principios de Identidad

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. WhatsApp como Identidad Primaria

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

**Regla**: Sin número de WhatsApp verificado, no se puede completar el registro.

---

## 2. El Número Nunca se Expone

El número de WhatsApp asociado a la cuenta nunca se expone a otros usuarios o modelos. El número es información privada que solo el sistema utiliza internamente para identificación y comunicación.

**Regla**: El número de WhatsApp es privado y no visible para otros usuarios o modelos en ninguna funcionalidad del sistema.

---

## 3. Alias Técnico Autogenerado

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

## 4. Identidad Provisional vs Identidad Consolidada

El sistema distingue entre dos tipos de identidad:

### 4.1. Identidad Provisional

Identidad mínima creada durante el registro inicial. Permite acceso limitado a funcionalidades básicas del sistema. No requiere verificación extensa ni información personal completa.

**Características**:
- Alias técnico autogenerado
- Número de WhatsApp asociado
- Estado de verificación mínimo
- Acceso restringido a funcionalidades básicas

**Estado inicial**: Toda cuenta creada mediante registro queda en identidad provisional.

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

## 5. Nick Personal Postergado hasta Gate Real

El nick o nombre de usuario personal no se solicita durante el registro. El nick se solicita solo cuando el usuario o modelo intenta acceder a funcionalidades que lo requieren.

**Justificación**:
- Reduce fricción en el registro
- Permite que el usuario o modelo decida su nick cuando sea necesario
- Evita solicitar información que no tiene uso inmediato

**Regla**: El nick personal no es requerido para el registro ni para acceso básico. Se solicita solo cuando es necesario para funcionalidades específicas.

---

## 6. Email como Secundario y Opcional

El email no es requerido para el registro ni para el acceso básico al sistema. El email es un campo opcional que puede asociarse a la cuenta en cualquier momento después del registro.

**Casos de uso del email**:
- Recuperación de cuenta (si se implementa en el futuro)
- Notificaciones opcionales
- Comunicación alternativa

**Regla**: El sistema no requiere email para ninguna funcionalidad básica. El email es completamente opcional.

---

## 7. Verificación de WhatsApp mediante OTP

La verificación de WhatsApp se realiza mediante OTP (One-Time Password). El sistema envía un código de verificación al número proporcionado y requiere su ingreso para completar la verificación.

**Proceso**:
1. Usuario o modelo proporciona número de WhatsApp
2. Sistema envía código OTP al número
3. Usuario o modelo ingresa código OTP
4. Sistema valida código y completa verificación

**Regla**: Sin verificación de WhatsApp mediante OTP, el registro no se completa.

---

## 8. Persistencia de Identidad

Una vez establecida la identidad mediante registro, esta persiste mientras la cuenta exista. La identidad no cambia salvo revocación explícita por el sistema.

**Regla**: La identidad establecida durante el registro es permanente mientras la cuenta exista.

---

## 9. Unicidad de Identidad

Cada número de WhatsApp puede asociarse a una sola cuenta en el sistema. No se permite registro múltiple con el mismo número.

**Regla**: Un número de WhatsApp, una cuenta. No se permite duplicación de cuentas con el mismo número.

---

## 10. Separación de Identidad y Funcionalidad

La identidad es independiente de las funcionalidades habilitadas. Una cuenta con identidad provisional puede acceder a funcionalidades básicas sin requerir identidad consolidada.

**Regla**: La identidad establece quién es el usuario o modelo. Las funcionalidades habilitadas dependen de verificaciones adicionales, no de la identidad en sí.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


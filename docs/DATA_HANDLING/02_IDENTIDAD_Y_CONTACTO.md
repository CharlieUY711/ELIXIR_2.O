# Identidad y Contacto

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. WhatsApp como Identidad Primaria

WhatsApp es la identidad primaria de Elixir Platform. El número de WhatsApp es el identificador principal para usuarios y modelos en el sistema.

### 1.1. Identidad Primaria Obligatoria

El número de WhatsApp es obligatorio para establecer identidad en Elixir Platform. Sin número de WhatsApp verificado, no se puede completar el registro ni acceder al sistema.

**Regla**: WhatsApp es la identidad primaria. Sin WhatsApp verificado, no hay identidad en Elixir.

### 1.2. Verificación de WhatsApp

La verificación de WhatsApp se realiza mediante OTP (One-Time Password). El sistema envía un código de verificación al número proporcionado y requiere su ingreso para completar la verificación.

**Regla**: La verificación de WhatsApp mediante OTP es obligatoria para establecer identidad.

### 1.3. Unicidad de Identidad

Cada número de WhatsApp puede asociarse a una sola cuenta en el sistema. No se permite registro múltiple con el mismo número.

**Regla**: Un número de WhatsApp, una cuenta. No se permite duplicación.

### 1.4. Privacidad del Número

El número de WhatsApp asociado a la cuenta nunca se expone a otros usuarios o modelos. El número es información privada que solo el sistema utiliza internamente para identificación y comunicación.

**Regla**: El número de WhatsApp es privado y no visible para otros usuarios o modelos.

---

## 2. Contacto Secundario Delegado

El contacto secundario, cuando existe, se delega a sistemas externos. Elixir Platform no almacena información de contacto secundario más allá de referencias opacas.

### 2.1. Contacto Secundario Opcional

El contacto secundario es completamente opcional. Elixir Platform no requiere email, dirección física ni ningún otro método de contacto secundario para operación básica.

**Regla**: El contacto secundario es opcional y no requerido para funcionalidades básicas.

### 2.2. Delegación de Custodia

Cuando se proporciona contacto secundario, la custodia se delega a sistemas externos especializados. Elixir Platform no almacena información de contacto secundario localmente.

**Regla**: El contacto secundario se custodia externamente, no en Elixir.

### 2.3. Referencias Opacas

Elixir Platform mantiene únicamente referencias opacas al contacto secundario cuando es necesario para orquestación. Las referencias no contienen información sensible y solo permiten acceso controlado.

**Regla**: Las referencias a contacto secundario son opacas y no exponen información.

### 2.4. Uso Limitado

El contacto secundario se utiliza únicamente para funcionalidades específicas que lo requieren. No se utiliza para comunicación general ni se expone en handoffs o tokens.

**Regla**: El contacto secundario tiene uso limitado y específico.

---

## 3. Repositorios Personales

Los repositorios personales son sistemas externos donde usuarios y modelos pueden almacenar información personal. Elixir Platform no custodia repositorios personales, solo referencia su existencia cuando es necesario.

### 3.1. Repositorios Personales como Concepto

Los repositorios personales son sistemas externos donde usuarios y modelos mantienen información personal fuera de Elixir Platform. Elixir Platform no custodia ni accede directamente a repositorios personales.

**Regla**: Los repositorios personales son externos a Elixir. Elixir no custodia ni accede directamente.

### 3.2. Referencia Conceptual

Elixir Platform puede referenciar conceptualmente la existencia de repositorios personales cuando es necesario para orquestación. La referencia es opaca y no contiene información del contenido del repositorio.

**Regla**: Las referencias a repositorios personales son conceptuales y opacas.

### 3.3. Acceso Controlado

Si Elixir Platform necesita acceder a información en repositorios personales, el acceso se realiza mediante autorización explícita y controlada. Elixir no mantiene acceso permanente ni almacena credenciales.

**Regla**: El acceso a repositorios personales es explícito, controlado y temporal.

### 3.4. Separación de Responsabilidades

La responsabilidad de custodia y protección de repositorios personales recae en el sistema externo que los mantiene. Elixir Platform no asume responsabilidad de protección de datos en repositorios personales.

**Regla**: La responsabilidad de repositorios personales es del sistema externo, no de Elixir.

---

## 4. Alias Técnico Autogenerado

Al completar el registro, el sistema genera automáticamente un alias técnico único siguiendo un formato canónico. El alias técnico es el identificador interno del sistema.

### 4.1. Generación Automática

El alias técnico se genera automáticamente por el sistema durante el registro. No es modificable por el usuario o modelo y sigue un formato estricto.

**Regla**: El alias técnico es autogenerado, único e inmodificable.

### 4.2. Formato Canónico

El alias técnico sigue un formato canónico estricto:
- Usuarios: Formato definido por el sistema
- Modelos: Formato definido por el sistema

**Regla**: El formato del alias técnico es canónico y no admite variaciones.

### 4.3. Uso Interno

El alias técnico es el identificador interno del sistema. No es visible para otros usuarios o modelos en funcionalidades normales.

**Regla**: El alias técnico es interno y no se expone públicamente.

### 4.4. Persistencia

El alias técnico persiste mientras la cuenta exista. No cambia salvo revocación explícita por el sistema.

**Regla**: El alias técnico es permanente mientras la cuenta exista.

---

## 5. Identidad Provisional vs Identidad Consolidada

El sistema distingue entre identidad provisional e identidad consolidada. La identidad provisional permite acceso limitado, mientras que la identidad consolidada habilita todas las funcionalidades.

### 5.1. Identidad Provisional

Identidad mínima creada durante el registro inicial. Permite acceso limitado a funcionalidades básicas del sistema. No requiere verificación extensa ni información personal completa.

**Características**:
- Alias técnico autogenerado
- Número de WhatsApp asociado
- Estado de verificación mínimo
- Acceso restringido a funcionalidades básicas

**Regla**: Toda cuenta creada mediante registro queda en identidad provisional.

### 5.2. Identidad Consolidada

Identidad con verificación completa que habilita todas las funcionalidades del sistema. Requiere verificación de WhatsApp, verificación de edad y verificación de capacidad de pago o retiro según corresponda.

**Características**:
- Alias técnico establecido
- Número de WhatsApp verificado
- Verificación de edad completada
- Verificación de capacidad de pago o retiro completada
- Acceso completo a funcionalidades del sistema

**Regla**: El sistema permite operación con identidad provisional. La consolidación es progresiva y opcional.

### 5.3. Progresión de Identidad

La consolidación de identidad es progresiva. Cada verificación adicional habilita funcionalidades incrementales. No se requiere consolidación completa para operación básica.

**Regla**: La consolidación de identidad es progresiva y opcional según funcionalidades deseadas.

---

## 6. Qué Datos NO Almacena Elixir

Elixir Platform establece prohibiciones explícitas sobre qué datos de identidad y contacto no se almacenan.

### 6.1. Información Personal Completa

Elixir Platform no almacena:

- Nombre real completo
- Dirección física
- Documentos de identidad
- Información biométrica
- Información de contacto secundario detallada

**Regla**: Elixir no almacena información personal completa más allá de lo mínimo necesario.

### 6.2. Historial de Cambios de Identidad

Elixir Platform no mantiene historial detallado de cambios de identidad. Solo mantiene estado actual y referencias necesarias para auditoría.

**Regla**: Elixir no mantiene historial completo de cambios de identidad.

### 6.3. Información de Verificación Detallada

Elixir Platform no almacena documentos completos de verificación. Solo mantiene estados de verificación y referencias opacas a sistemas externos.

**Regla**: Elixir no almacena documentos de verificación, solo estados y referencias.

### 6.4. Metadatos Extensos

Elixir Platform no almacena metadatos extensos sobre identidad más allá de lo necesario para orquestación. No mantiene perfiles detallados ni información adicional.

**Regla**: Elixir mantiene metadatos mínimos, no extensos.

---

## 7. Retención de Datos de Identidad

Los datos de identidad se retienen según reglas específicas de TTL y necesidad funcional.

### 7.1. Identidad Primaria

La identidad primaria (número de WhatsApp y alias técnico) se retiene mientras la cuenta exista. No tiene TTL mientras la cuenta esté activa.

**Regla**: La identidad primaria persiste mientras la cuenta exista.

### 7.2. Estados de Verificación

Los estados de verificación se retienen según necesidad de auditoría. Tienen TTL definido basado en requisitos normativos mínimos.

**Regla**: Los estados de verificación tienen TTL basado en requisitos normativos.

### 7.3. Referencias a Contacto Secundario

Las referencias a contacto secundario tienen TTL corto y se eliminan cuando ya no son necesarias para orquestación.

**Regla**: Las referencias a contacto secundario tienen TTL corto.

### 7.4. Metadatos de Identidad

Los metadatos de identidad tienen TTL basado en necesidad funcional. No se mantienen indefinidamente.

**Regla**: Los metadatos de identidad tienen TTL definido.

---

## 8. Delegación de Responsabilidad

Al delegar custodia de contacto secundario y repositorios personales, Elixir Platform también delega responsabilidad de protección de datos. Elixir mantiene responsabilidad de control de acceso a identidad primaria, no de custodia de información personal completa.

**Regla**: La delegación de custodia implica delegación de responsabilidad de protección.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


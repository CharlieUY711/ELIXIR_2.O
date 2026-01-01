# Wireflow Secuencial - Registro Unificado

**Fecha**: 2025  
**Tipo**: Artefacto de UX  
**Versión**: 1.0  
**Alcance**: Flujo lineal paso a paso, decisiones del usuario, resultados por rama (U1 / M1)

---

## 1. Flujo Lineal Paso a Paso

### Paso 0: Estado Inicial (R0)

**Pantalla**: Catálogo (visitante)

**Estado del usuario**: Visitante sin cuenta

**Acciones disponibles**:
- Explorar catálogo
- Ver imágenes con tag `teaser`
- Ver imágenes con tag `adult` con blur aplicado
- Iniciar registro (acción explícita)

**Decisión del usuario**:
- **Opción A**: Continuar explorando como visitante
- **Opción B**: Iniciar registro

**Resultado de Opción A**: Permanece en R0, continúa como visitante

**Resultado de Opción B**: Avanza a R1

---

### Paso 1: Ingreso de Número WhatsApp (R1)

**Pantalla**: Formulario de ingreso de número

**Estado del usuario**: Iniciando registro

**Acción requerida**: Ingresar número de WhatsApp

**Validación en tiempo real**:
- Formato de número telefónico
- Presencia de código de país

**Decisión del usuario**:
- **Opción A**: Ingresar número y hacer clic en "Continuar"
- **Opción B**: Cancelar y volver a R0

**Resultado de Opción A (formato válido)**: Avanza a R2

**Resultado de Opción A (formato inválido)**: Permanece en R1, muestra error de formato

**Resultado de Opción A (número ya registrado)**: Permanece en R1, muestra error, sugiere iniciar sesión

**Resultado de Opción B**: Vuelve a R0

---

### Paso 2: OTP por WhatsApp (R2)

**Pantalla**: Formulario de verificación OTP

**Estado del usuario**: Verificando WhatsApp

**Acción automática del sistema**: Envío de código OTP a WhatsApp

**Acción requerida del usuario**: Ingresar código OTP recibido

**Validación en tiempo real**:
- Solo números
- Longitud exacta (6 dígitos)

**Decisiones del usuario**:

**Decisión 1 - Ingreso de código**:
- **Opción A**: Ingresar código y hacer clic en "Verificar"
- **Opción B**: Solicitar reenvío de código
- **Opción C**: Cambiar número (volver a R1)
- **Opción D**: Cancelar registro

**Resultado de Opción A (código correcto)**: Avanza a R3

**Resultado de Opción A (código incorrecto)**: Permanece en R2, muestra error, incrementa contador de intentos

**Resultado de Opción A (código expirado)**: Permanece en R2, muestra error, requiere nuevo código

**Resultado de Opción A (límite de intentos)**: Permanece en R2, muestra error, requiere nuevo código

**Resultado de Opción B (reenvío disponible)**: Permanece en R2, recibe nuevo código

**Resultado de Opción B (límite de reenvíos)**: Permanece en R2, muestra error, muestra tiempo de espera

**Resultado de Opción C**: Vuelve a R1

**Resultado de Opción D**: Vuelve a R0

---

### Paso 3: Creación Automática de Identidad Provisional (R3)

**Pantalla**: Pantalla de procesamiento

**Estado del usuario**: Creando cuenta

**Acción automática del sistema**:
1. Generar alias técnico único (`Elixir_U{numero}` o `Elixir_M{numero}`)
2. Asociar número de WhatsApp verificado
3. Establecer `whatsapp_verified = true`
4. Establecer `identity_status = provisional`
5. Establecer `role = undefined`

**Acción requerida del usuario**: Ninguna (proceso automático)

**Validación automática**:
- WhatsApp verificado exitosamente
- Alias técnico generado correctamente
- Cuenta creada en base de datos

**Decisión del usuario**: No aplica (proceso automático)

**Resultado exitoso**: Avanza automáticamente a R4

**Resultado con error**: Permanece en R3, muestra error, permite retry o volver a R2

**Nota**: El usuario no ve el alias técnico en este paso. Solo se muestra indicador de carga.

---

### Paso 4: Elección de Rol (R4)

**Pantalla**: Selección de tipo de cuenta

**Estado del usuario**: Seleccionando rol

**Estado del sistema**:
- `whatsapp_verified = true`
- `identity_status = provisional`
- `role = undefined`

**Acción requerida del usuario**: Seleccionar tipo de cuenta (Usuario o Modelo)

**Decisiones del usuario**:

**Decisión 1 - Selección de rol**:
- **Opción A**: Seleccionar "Usuario" y confirmar
- **Opción B**: Seleccionar "Modelo" y confirmar

**Resultado de Opción A (Usuario)**: Avanza a U1 (Rama Usuario)

**Resultado de Opción B (Modelo)**: Avanza a M1 (Rama Modelo)

**Acción automática del sistema al confirmar**:
- Establecer `role = user` (si Opción A) o `role = model` (si Opción B)
- Finalizar proceso de registro

**Nota**: No se puede cancelar desde R4. El registro debe completarse.

---

## 2. Rama Usuario (U1)

### Paso 5: Finalización Usuario

**Pantalla**: Pantalla de éxito

**Estado del usuario**: Registrado como Usuario

**Estado del sistema**:
- `whatsapp_verified = true`
- `identity_status = provisional`
- `role = user`

**Información mostrada**:
- Confirmación de cuenta creada
- Estado "Modo provisional"
- Explicación de capacidades básicas

**Acciones disponibles**:
- Explorar catálogo (acción principal)
- Acceder a configuración (si disponible)

**Capacidades habilitadas**:
- Acceso al catálogo completo
- Visualización de imágenes con tag `teaser` sin restricciones
- Visualización de imágenes con tag `adult` con blur aplicado
- Navegación completa del catálogo

**Capacidades NO habilitadas** (requieren verificaciones adicionales):
- Acceso a chat con modelos (requiere `age_verified` y `payment_enabled`)
- Visualización de imágenes con tag `adult` sin blur (requiere `age_verified`)
- Transacciones financieras (requiere `payment_enabled`)

**Gates definidos pero no activados**:
- Gate de verificación de edad (se activa al intentar ver contenido adulto)
- Gate de verificación de pago (se activa al intentar acceder a chat)

**Decisión del usuario**:
- **Opción A**: Hacer clic en "Explorar catálogo"
- **Opción B**: Acceder a configuración (si disponible)

**Resultado de Opción A**: Navega al catálogo con acceso básico

**Resultado de Opción B**: Accede a panel de configuración

**Flujo posterior**:
- El usuario puede explorar el catálogo sin verificaciones adicionales
- Cuando intente acceder a funcionalidades que requieren verificaciones, se activarán los gates correspondientes
- Las verificaciones pueden completarse en cualquier orden (excepto que WhatsApp es prerrequisito)

---

## 3. Rama Modelo (M1)

### Paso 5: Finalización Modelo

**Pantalla**: Pantalla de éxito

**Estado del usuario**: Registrado como Modelo

**Estado del sistema**:
- `whatsapp_verified = true`
- `identity_status = provisional`
- `role = model`

**Información mostrada**:
- Confirmación de cuenta creada
- Estado "Modo provisional"
- Explicación de capacidades básicas

**Acciones disponibles**:
- Configurar perfil (acción principal)
- Acceder a configuración (si disponible)

**Capacidades habilitadas**:
- Acceso a panel privado de configuración
- Configuración de información básica del perfil
- Edición de información personal
- Preparación de contenido
- Subida de imágenes en estado privado
- Etiquetado de imágenes como `teaser` o `adult`
- Gestión de imágenes privadas

**Capacidades NO habilitadas** (requieren verificaciones adicionales):
- Visualización pública del perfil (requiere `age_verified`)
- Visualización pública de imágenes (requiere `age_verified`)
- Recepción de mensajes de usuarios (requiere `age_verified` y `payment_enabled`)
- Retiros de fondos (requiere `payment_enabled`)

**Gates definidos pero no activados**:
- Gate de verificación de edad (se activa al intentar hacer público el perfil)
- Gate de verificación de retiros (se activa al intentar habilitar recepción de mensajes)

**Decisión del usuario**:
- **Opción A**: Hacer clic en "Configurar perfil"
- **Opción B**: Acceder a configuración (si disponible)

**Resultado de Opción A**: Navega al panel privado de configuración de perfil

**Resultado de Opción B**: Accede a panel de configuración

**Flujo posterior**:
- El modelo puede configurar su perfil en modo privado sin verificaciones adicionales
- Cuando intente hacer público el perfil o habilitar recepción de mensajes, se activarán los gates correspondientes
- Las verificaciones pueden completarse en cualquier orden (excepto que WhatsApp es prerrequisito)

---

## 4. Diagrama de Flujo Simplificado

```
[R0: Visitante]
    |
    | (Usuario hace clic en "Registrarse")
    v
[R1: Ingreso de Número]
    |
    | (Número válido, clic en "Continuar")
    v
[R2: OTP por WhatsApp]
    |
    | (Código correcto)
    v
[R3: Creación Automática]
    |
    | (Cuenta creada exitosamente)
    v
[R4: Elección de Rol]
    |
    | (Usuario selecciona rol)
    |
    +---> [U1: Finalización Usuario] ---> Catálogo (acceso básico)
    |
    +---> [M1: Finalización Modelo] ---> Panel Privado (configuración)
```

---

## 5. Puntos de Decisión del Usuario

### Decisión 1: Iniciar Registro (R0 → R1)

**Contexto**: Usuario está explorando el catálogo como visitante

**Opciones**:
- Continuar explorando
- Iniciar registro

**Impacto**: Si inicia registro, comienza el proceso. Si no, continúa como visitante.

---

### Decisión 2: Continuar con Número (R1 → R2)

**Contexto**: Usuario ingresó número de WhatsApp

**Opciones**:
- Continuar (si formato válido)
- Corregir número (si formato inválido)
- Cancelar

**Impacto**: Si continúa, avanza a verificación OTP. Si cancela, vuelve a catálogo.

---

### Decisión 3: Verificar OTP (R2 → R3)

**Contexto**: Usuario recibió código OTP en WhatsApp

**Opciones**:
- Ingresar código y verificar
- Solicitar reenvío de código
- Cambiar número
- Cancelar

**Impacto**: Si verifica correctamente, avanza a creación. Si cancela, pierde progreso.

---

### Decisión 4: Seleccionar Rol (R4 → U1/M1)

**Contexto**: Cuenta creada, debe seleccionar tipo

**Opciones**:
- Seleccionar "Usuario"
- Seleccionar "Modelo"

**Impacto**: Determina capacidades y flujo posterior. No se puede cambiar fácilmente después.

---

## 6. Resultados por Rama

### Rama Usuario (U1)

**Estado final**:
- Cuenta creada
- Identidad provisional
- Rol: Usuario
- WhatsApp verificado

**Acceso inmediato**:
- Catálogo completo
- Contenido teaser sin restricciones
- Contenido adulto con blur

**Próximos pasos posibles** (no parte del registro):
- Verificación de edad (cuando intente ver contenido adulto)
- Verificación de pago (cuando intente acceder a chat)
- Acceso completo (cuando complete ambas verificaciones)

---

### Rama Modelo (M1)

**Estado final**:
- Cuenta creada
- Identidad provisional
- Rol: Modelo
- WhatsApp verificado

**Acceso inmediato**:
- Panel privado de configuración
- Preparación de perfil
- Subida de imágenes privadas

**Próximos pasos posibles** (no parte del registro):
- Verificación de edad (cuando intente hacer público el perfil)
- Verificación de retiros (cuando intente habilitar recepción de mensajes)
- Acceso completo (cuando complete ambas verificaciones)

---

## 7. Casos Especiales

### Caso: Usuario Abandona en R1

**Situación**: Usuario ingresa número pero no continúa

**Comportamiento**: Número no se persiste. Usuario puede volver a intentar desde R0.

---

### Caso: Usuario Abandona en R2

**Situación**: Usuario recibe código OTP pero no lo ingresa

**Comportamiento**: Código expira. Usuario puede solicitar nuevo código o cancelar.

---

### Caso: Error en R3

**Situación**: Error al crear cuenta después de verificación exitosa

**Comportamiento**: Usuario puede retry. Si persiste, puede volver a R2 para re-verificar.

---

### Caso: Usuario Cierra Navegador en R4

**Situación**: Usuario está en selección de rol y cierra navegador

**Comportamiento**: Cuenta existe pero sin rol. Usuario debe completar selección de rol en próximo acceso.

**Nota**: Este caso no está explícitamente documentado. Se incluye como caso límite.

---

## 8. Notas de Implementación

### Reglas del Flujo

1. **Linealidad**: El flujo debe seguir estrictamente R0 → R1 → R2 → R3 → R4 → U1/M1
2. **No se puede saltar pasos**: Cada paso es prerrequisito del siguiente
3. **Retroceso limitado**: Se puede retroceder desde R1 y R2, pero no desde R3 y R4
4. **Decisión final en R4**: La selección de rol determina el flujo posterior

### Variantes No Permitidas

- No agregar pasos intermedios de confirmación
- No agregar pasos de "preview" de cuenta
- No agregar pasos de configuración adicional durante registro
- No modificar el orden de los pasos
- No agregar validaciones adicionales más allá de las definidas

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Artefacto de UX listo para implementación


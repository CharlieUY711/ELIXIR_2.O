# Estados y Transiciones - Registro Unificado

**Fecha**: 2025  
**Tipo**: Artefacto de UX  
**Versión**: 1.0  
**Alcance**: Estados visibles por pantalla, transiciones permitidas, casos de error y retry

---

## 1. Estados Visibles por Pantalla

### R0 — Entrada (Visitante)

**Estado del sistema**:
- `user_state`: `visitor`
- `has_account`: `false`
- `whatsapp_verified`: `false`
- `identity_status`: `undefined`
- `role`: `undefined`

**Estados visibles en UI**:
- **Estado principal**: "Visitante"
- **Indicador de cuenta**: No visible (sin cuenta)
- **Acciones disponibles**: "Registrarse" visible

**Transiciones permitidas**:
- `visitor` → `R1` (al hacer clic en "Registrarse")

---

### R1 — Ingreso de Número WhatsApp

**Estado del sistema**:
- `user_state`: `registering`
- `registration_step`: `phone_input`
- `whatsapp_verified`: `false`
- `phone_number`: `undefined` o `entered`

**Estados visibles en UI**:
- **Estado principal**: "Ingresando número"
- **Campo de entrada**: Vacío o con valor ingresado
- **Botón "Continuar"**: Habilitado solo si formato válido

**Estados del campo de entrada**:
- `empty`: Campo vacío
- `typing`: Usuario escribiendo
- `valid`: Formato válido
- `invalid`: Formato inválido
- `error`: Error de validación

**Transiciones permitidas**:
- `phone_input` → `R2` (si formato válido y clic en "Continuar")
- `phone_input` → `phone_input` (si formato inválido, permanece en R1)
- `phone_input` → `R0` (si usuario cancela o cierra)

**Casos de error**:
- **Formato inválido**: Muestra error, permanece en R1
- **Número ya registrado**: Muestra error, sugiere iniciar sesión
- **Error de conexión**: Muestra error genérico, permite retry

---

### R2 — OTP por WhatsApp

**Estado del sistema**:
- `user_state`: `registering`
- `registration_step`: `otp_verification`
- `whatsapp_verified`: `false`
- `otp_sent`: `true`
- `otp_code`: `undefined` o `entered`
- `otp_attempts`: `0` a `max_attempts`

**Estados visibles en UI**:
- **Estado principal**: "Verificando código"
- **Campo de entrada**: Vacío o con valor ingresado
- **Botón "Verificar"**: Habilitado solo si código completo
- **Enlace "Reenviar código"**: Visible, con o sin cooldown

**Estados del campo de entrada**:
- `empty`: Campo vacío
- `typing`: Usuario escribiendo
- `complete`: Código completo (6 dígitos)
- `invalid`: Código incorrecto
- `expired`: Código expirado
- `error`: Error de validación

**Estados del reenvío**:
- `available`: Disponible para reenvío
- `cooldown`: En período de espera
- `limited`: Límite de reenvíos alcanzado

**Transiciones permitidas**:
- `otp_verification` → `R3` (si código correcto)
- `otp_verification` → `otp_verification` (si código incorrecto, permanece en R2)
- `otp_verification` → `R1` (si usuario cancela o solicita cambiar número)
- `otp_verification` → `otp_verification` (si solicita reenvío, permanece en R2)

**Casos de error**:
- **Código incorrecto**: Muestra error, incrementa intentos, permanece en R2
- **Código expirado**: Muestra error, permite solicitar nuevo código
- **Límite de intentos**: Muestra error, requiere nuevo código
- **Error de reenvío limitado**: Muestra error, muestra tiempo de espera
- **Error de conexión**: Muestra error genérico, permite retry

**Retry permitido**:
- Reenvío de código (con límites)
- Reintento de verificación (con límite de intentos)
- Cambio de número (volver a R1)

---

### R3 — Creación Automática de Identidad Provisional

**Estado del sistema**:
- `user_state`: `registering`
- `registration_step`: `creating_account`
- `whatsapp_verified`: `true` (en proceso)
- `identity_status`: `provisional` (en proceso)
- `alias_technical`: `generating`

**Estados visibles en UI**:
- **Estado principal**: "Creando cuenta"
- **Indicador de carga**: Visible, animado
- **Mensaje de progreso**: "Generando tu identidad única"

**Estados del proceso**:
- `processing`: Creando cuenta
- `success`: Cuenta creada exitosamente
- `error`: Error en creación

**Transiciones permitidas**:
- `creating_account` → `R4` (si creación exitosa)
- `creating_account` → `R2` (si error, volver a verificación)
- `creating_account` → `R0` (si error crítico)

**Casos de error**:
- **Error de creación**: Muestra error, permite retry o volver a R2
- **Error de conexión**: Muestra error genérico, permite retry
- **Error crítico**: Muestra error, sugiere contactar soporte

**Retry permitido**:
- Reintento de creación (automático o manual)
- Volver a R2 para re-verificar

---

### R4 — Elección de Rol

**Estado del sistema**:
- `user_state`: `registering`
- `registration_step`: `role_selection`
- `whatsapp_verified`: `true`
- `identity_status`: `provisional`
- `role`: `undefined`

**Estados visibles en UI**:
- **Estado principal**: "Seleccionando tipo de cuenta"
- **Opciones disponibles**: "Usuario" y "Modelo"
- **Botón de confirmación**: Habilitado solo si rol seleccionado

**Estados de selección**:
- `none`: Ningún rol seleccionado
- `user_selected`: Rol usuario seleccionado
- `model_selected`: Rol modelo seleccionado
- `processing`: Guardando selección
- `error`: Error al guardar

**Transiciones permitidas**:
- `role_selection` → `U1` (si selecciona Usuario y guarda exitosamente)
- `role_selection` → `M1` (si selecciona Modelo y guarda exitosamente)
- `role_selection` → `role_selection` (si error al guardar, permanece en R4)
- `role_selection` → `R3` (no permitido - no se puede retroceder)

**Casos de error**:
- **Error al guardar rol**: Muestra error, permanece en R4, permite retry
- **Error de conexión**: Muestra error genérico, permite retry
- **Error inesperado**: Muestra error, sugiere contactar soporte

**Retry permitido**:
- Reintento de guardado (automático o manual)
- Cambio de selección y nuevo intento

---

### U1 — Finalización Usuario

**Estado del sistema**:
- `user_state`: `registered`
- `whatsapp_verified`: `true`
- `identity_status`: `provisional`
- `role`: `user`

**Estados visibles en UI**:
- **Estado principal**: "Cuenta creada"
- **Indicador de cuenta**: "Modo provisional"
- **Acciones disponibles**: "Explorar catálogo"

**Transiciones permitidas**:
- `U1` → `catalog` (al hacer clic en "Explorar catálogo")
- `U1` → `settings` (acceso a configuración, si disponible)

**No hay transiciones de error** (registro completado exitosamente)

---

### M1 — Finalización Modelo

**Estado del sistema**:
- `user_state`: `registered`
- `whatsapp_verified`: `true`
- `identity_status`: `provisional`
- `role`: `model`

**Estados visibles en UI**:
- **Estado principal**: "Cuenta creada"
- **Indicador de cuenta**: "Modo provisional"
- **Acciones disponibles**: "Configurar perfil"

**Transiciones permitidas**:
- `M1` → `profile_setup` (al hacer clic en "Configurar perfil")
- `M1` → `settings` (acceso a configuración, si disponible)

**No hay transiciones de error** (registro completado exitosamente)

---

## 2. Transiciones Globales

### Flujo Normal

```
R0 (Visitante) 
  → R1 (Ingreso número) 
  → R2 (OTP) 
  → R3 (Creación) 
  → R4 (Rol) 
  → U1 (Usuario) o M1 (Modelo)
```

### Flujo con Errores

```
R0 → R1 → [Error formato] → R1 (retry)
R1 → R2 → [Error código] → R2 (retry)
R2 → R3 → [Error creación] → R2 (retry) o R0 (error crítico)
R3 → R4 → [Error guardado] → R4 (retry)
```

### Flujo con Cancelación

```
R0 → R1 → [Cancelar] → R0
R1 → R2 → [Cancelar] → R1
R2 → R3 → [Cancelar] → R2 (no recomendado, pero posible)
R3 → R4 → [Cancelar] → No permitido (proceso en curso)
```

---

## 3. Casos de Error y Retry

### Errores Recuperables

**Definición**: Errores que permiten al usuario corregir y continuar sin perder progreso.

**Ejemplos**:
- Formato de número inválido (R1)
- Código OTP incorrecto (R2)
- Error de conexión temporal (cualquier paso)

**Comportamiento**:
- Muestra mensaje de error claro
- Permite corrección inmediata
- Mantiene datos ingresados cuando es posible
- No requiere reiniciar el flujo completo

### Errores con Retry Limitado

**Definición**: Errores que permiten reintentos pero con límites.

**Ejemplos**:
- Código OTP incorrecto múltiples veces (R2)
- Reenvío de código OTP (R2)
- Error de creación de cuenta (R3)

**Comportamiento**:
- Muestra contador de intentos restantes
- Muestra tiempo de espera si aplica
- Permite retry hasta alcanzar límite
- Después del límite, requiere acción alternativa

### Errores No Recuperables

**Definición**: Errores que requieren reiniciar el proceso o contactar soporte.

**Ejemplos**:
- Número ya registrado (R1)
- Error crítico de servidor (cualquier paso)
- Violación de políticas (cualquier paso)

**Comportamiento**:
- Muestra mensaje de error claro
- Proporciona acción alternativa (iniciar sesión, contactar soporte)
- No permite continuar el flujo actual
- Puede requerir reiniciar desde R0

---

## 4. Estados de Persistencia

### Datos Persistidos por Paso

**R1 - Número ingresado**:
- No se persiste si usuario cancela
- Se persiste si hay error de formato (para corrección)
- Se limpia al avanzar a R2

**R2 - Código OTP**:
- No se persiste entre sesiones
- Se limpia después de verificación exitosa
- Se limpia después de expiración

**R3 - Proceso de creación**:
- No requiere persistencia (proceso automático)
- Si falla, se puede reintentar sin perder R2

**R4 - Selección de rol**:
- No se persiste si usuario cancela (no aplica, no se puede cancelar)
- Se persiste inmediatamente al seleccionar

---

## 5. Validaciones por Estado

### R1 - Validación de Número

**Validaciones en tiempo real**:
- Formato básico (números, espacios, guiones, paréntesis)
- Longitud mínima y máxima
- Presencia de código de país

**Validaciones al enviar**:
- Formato canónico válido
- Número no registrado previamente
- Número accesible para OTP

### R2 - Validación de OTP

**Validaciones en tiempo real**:
- Solo números
- Longitud exacta (6 dígitos)

**Validaciones al enviar**:
- Código coincide con enviado
- Código no expirado
- Intentos no excedidos

### R3 - Validación de Creación

**Validaciones automáticas**:
- WhatsApp verificado
- Datos completos
- Servicio disponible

### R4 - Validación de Rol

**Validaciones al enviar**:
- Rol seleccionado (user o model)
- Cuenta creada exitosamente
- Servicio disponible

---

## 6. Indicadores de Progreso

### Barra de Progreso (Opcional)

Si se implementa barra de progreso visual:

**R0**: 0% (no visible, usuario no inició registro)
**R1**: 20% (ingreso de número)
**R2**: 40% (verificación OTP)
**R3**: 60% (creación de cuenta)
**R4**: 80% (selección de rol)
**U1/M1**: 100% (completado)

**Nota**: La barra de progreso no está definida en la documentación. Se incluye como referencia opcional.

---

## 7. Timeouts y Expiración

### Timeouts por Paso

**R1 - Ingreso de número**:
- Sin timeout (usuario puede tomar su tiempo)

**R2 - OTP**:
- Código OTP expira después de X minutos (definido por backend)
- Tiempo de cooldown para reenvío: X segundos (definido por backend)

**R3 - Creación**:
- Timeout de proceso: X segundos (definido por backend)
- Si excede timeout, mostrar error y permitir retry

**R4 - Selección de rol**:
- Sin timeout (usuario puede tomar su tiempo)

---

## 8. Notas de Implementación

### Reglas de Estado

1. **No se puede saltar pasos**: El flujo debe seguir R0 → R1 → R2 → R3 → R4 → U1/M1
2. **No se puede retroceder desde R3**: Una vez iniciada la creación, no se puede cancelar
3. **No se puede cancelar desde R4**: Una vez en selección de rol, debe completarse
4. **Errores no bloquean completamente**: Siempre debe haber una ruta de recuperación

### Variantes No Permitidas

- No agregar pasos intermedios
- No agregar validaciones adicionales
- No agregar estados de "preview" o "confirmación"
- No modificar el orden de estados
- No agregar estados de "pausa" o "guardado temporal"

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Artefacto de UX listo para implementación


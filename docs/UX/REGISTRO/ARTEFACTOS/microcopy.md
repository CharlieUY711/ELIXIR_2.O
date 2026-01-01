# Microcopy - Registro Unificado

**Fecha**: 2025  
**Tipo**: Artefacto de UX  
**Versión**: 1.0  
**Alcance**: Textos exactos para implementación de wireflow R0-R4

---

## R0 — Entrada (Visitante)

### Pantalla Principal

**Título**: (Sin título específico - pantalla de catálogo)

**Mensaje de bienvenida**: (No aplica - el visitante accede directamente al catálogo)

**Call to Action para registro**:
- **Texto del botón**: "Registrarse"
- **Texto alternativo**: "Crear cuenta"
- **Ubicación**: Visible pero no intrusivo

**Mensaje de anonimato**:
- **Texto informativo**: "Puedes explorar el catálogo sin registrarte. Tu privacidad es importante."

---

## R1 — Ingreso de Número WhatsApp

### Pantalla de Solicitud

**Título**: "Registro"

**Instrucción principal**:
- **Texto**: "Ingresa tu número de WhatsApp"
- **Subtítulo**: "Solo necesitamos tu número para verificar tu identidad"

**Campo de entrada**:
- **Label**: "Número de WhatsApp"
- **Placeholder**: "+52 123 456 7890"
- **Ayuda contextual**: "Incluye código de país"

**Botón de acción**:
- **Texto**: "Continuar"
- **Estado deshabilitado**: "Ingresa un número válido"

**Mensaje de anonimato**:
- **Texto**: "Tu número de WhatsApp es privado. No será visible para otros usuarios."

**Mensajes de error**:

**Error de formato inválido**:
- **Texto**: "El formato del número no es válido. Por favor, verifica que incluya código de país."

**Error de número ya registrado**:
- **Texto**: "Este número ya está registrado. Si es tu cuenta, intenta iniciar sesión."

**Error genérico**:
- **Texto**: "Ocurrió un error. Por favor, intenta nuevamente."

---

## R2 — OTP por WhatsApp

### Pantalla de Envío de Código

**Título**: "Verificación"

**Mensaje principal**:
- **Texto**: "Hemos enviado un código de verificación a tu WhatsApp"
- **Subtítulo**: "Revisa tus mensajes de WhatsApp para encontrar el código"

**Campo de entrada**:
- **Label**: "Código de verificación"
- **Placeholder**: "123456"
- **Ayuda contextual**: "Ingresa el código de 6 dígitos"

**Botón de acción**:
- **Texto**: "Verificar"
- **Estado deshabilitado**: "Ingresa el código"

**Opción de reenvío**:
- **Texto**: "¿No recibiste el código?"
- **Enlace**: "Reenviar código"
- **Tiempo de espera**: "Puedes solicitar un nuevo código en {X} segundos"

**Mensaje de anonimato**:
- **Texto**: "Este código solo se usa para verificar tu número. No compartimos tu información."

**Mensajes de error**:

**Error de código incorrecto**:
- **Texto**: "El código ingresado no es correcto. Por favor, verifica e intenta nuevamente."

**Error de código expirado**:
- **Texto**: "El código ha expirado. Solicita un nuevo código."

**Error de límite de intentos**:
- **Texto**: "Has excedido el número máximo de intentos. Solicita un nuevo código."

**Error de reenvío limitado**:
- **Texto**: "Has alcanzado el límite de reenvíos. Por favor, espera unos minutos antes de intentar nuevamente."

**Error genérico**:
- **Texto**: "Ocurrió un error al verificar el código. Por favor, intenta nuevamente."

**Mensajes de éxito**:

**Código enviado**:
- **Texto**: "Código enviado. Revisa tu WhatsApp."

**Código reenviado**:
- **Texto**: "Nuevo código enviado. Revisa tu WhatsApp."

---

## R3 — Creación Automática de Identidad Provisional

### Pantalla de Procesamiento

**Título**: "Creando tu cuenta"

**Mensaje principal**:
- **Texto**: "Estamos creando tu cuenta..."
- **Subtítulo**: "Esto solo tomará unos segundos"

**Indicador de carga**:
- **Texto**: "Generando tu identidad única"

**Mensaje de anonimato**:
- **Texto**: "Tu cuenta se crea con identidad provisional. Tu privacidad está protegida."

**Nota técnica** (no visible para usuario):
- El sistema genera automáticamente el alias técnico
- No se muestra el alias técnico al usuario en este paso

---

## R4 — Elección de Rol

### Pantalla de Selección

**Título**: "Elige tu tipo de cuenta"

**Instrucción principal**:
- **Texto**: "Selecciona el tipo de cuenta que deseas crear"
- **Subtítulo**: "Puedes cambiar esta configuración más adelante"

**Opción Usuario**:
- **Título**: "Usuario"
- **Descripción**: "Explora el catálogo, visualiza contenido y chatea con modelos"
- **Características**:
  - "Acceso al catálogo completo"
  - "Visualización de contenido"
  - "Chat con modelos"
- **Botón**: "Soy Usuario"

**Opción Modelo**:
- **Título**: "Modelo"
- **Descripción**: "Crea tu perfil, sube contenido y recibe mensajes de usuarios"
- **Características**:
  - "Panel privado de configuración"
  - "Subida de imágenes"
  - "Recepción de mensajes"
- **Botón**: "Soy Modelo"

**Mensaje de anonimato**:
- **Texto**: "Tu elección es privada. Solo tú puedes ver tu tipo de cuenta."

**Mensajes de error**:

**Error si no se selecciona**:
- **Texto**: "Por favor, selecciona un tipo de cuenta para continuar."

**Error genérico**:
- **Texto**: "Ocurrió un error al guardar tu selección. Por favor, intenta nuevamente."

---

## Finalización del Registro

### Pantalla de Éxito - Rama Usuario (U1)

**Título**: "¡Bienvenido!"

**Mensaje principal**:
- **Texto**: "Tu cuenta ha sido creada exitosamente"
- **Subtítulo**: "Ya puedes explorar el catálogo"

**Información de cuenta**:
- **Texto**: "Tu cuenta está en modo provisional"
- **Explicación**: "Puedes explorar el catálogo y visualizar contenido teaser. Para acceder a más funcionalidades, completa las verificaciones cuando las necesites."

**Botón de acción**:
- **Texto**: "Explorar catálogo"

**Mensaje de anonimato**:
- **Texto**: "Tu identidad es privada. Tu número de WhatsApp no es visible para otros usuarios."

---

### Pantalla de Éxito - Rama Modelo (M1)

**Título**: "¡Bienvenido!"

**Mensaje principal**:
- **Texto**: "Tu cuenta ha sido creada exitosamente"
- **Subtítulo**: "Ya puedes configurar tu perfil"

**Información de cuenta**:
- **Texto**: "Tu cuenta está en modo provisional"
- **Explicación**: "Puedes configurar tu perfil en modo privado. Para hacerlo público y recibir mensajes, completa las verificaciones cuando las necesites."

**Botón de acción**:
- **Texto**: "Configurar perfil"

**Mensaje de anonimato**:
- **Texto**: "Tu identidad es privada. Tu número de WhatsApp no es visible para otros usuarios."

---

## Mensajes de Confianza y Anonimato (Recurrentes)

### Principio de Privacidad

**Mensaje estándar**:
- **Texto**: "Tu privacidad es importante. Tu número de WhatsApp nunca será visible para otros usuarios o modelos."

### Principio de Mínimo Necesario

**Mensaje estándar**:
- **Texto**: "Solo solicitamos la información necesaria. Puedes completar verificaciones adicionales cuando las necesites."

### Principio de Identidad Provisional

**Mensaje estándar**:
- **Texto**: "Tu cuenta está en modo provisional. Esto te permite acceder a funcionalidades básicas sin verificaciones adicionales."

---

## Mensajes de Error Genéricos

### Error de Conexión

**Texto**: "No se pudo conectar al servidor. Por favor, verifica tu conexión e intenta nuevamente."

### Error de Tiempo de Espera

**Texto**: "La operación está tomando más tiempo del esperado. Por favor, intenta nuevamente."

### Error Inesperado

**Texto**: "Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde."

---

## Notas de Implementación

### Reglas de Texto

1. **Tono**: Claro, directo, sin jerga técnica
2. **Longitud**: Mensajes concisos, máximo 2 líneas para mensajes principales
3. **Formalidad**: Neutral, profesional pero accesible
4. **Inclusividad**: Lenguaje neutro, sin asunciones de género

### Variantes No Permitidas

- No agregar mensajes de bienvenida adicionales
- No agregar explicaciones técnicas sobre alias
- No agregar mensajes promocionales
- No agregar llamados a acción adicionales
- No modificar el orden de los mensajes

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Artefacto de UX listo para implementación


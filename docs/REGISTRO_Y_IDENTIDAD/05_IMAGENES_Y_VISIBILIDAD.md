# Imágenes y Visibilidad

**Fecha**: 2025  
**Tipo**: Documentación Normativa  
**Versión**: 1.0

---

## 1. Tags de Imágenes

El sistema define dos tags canónicos para imágenes:

### 1.1. Tag: Teaser

**Definición**: Imágenes que pueden mostrarse sin verificación de edad.

**Características**:
- Contenido apropiado para todas las edades
- No requiere verificación de edad para visualización
- Visible para usuarios en estado `provisional` o superior
- No requiere blur

**Uso**: Imágenes de perfil, imágenes promocionales, contenido general.

### 1.2. Tag: Adult

**Definición**: Imágenes que requieren verificación de edad para visualización sin restricciones.

**Características**:
- Contenido para adultos
- Requiere verificación de edad para visualización sin blur
- Visible con blur para usuarios sin verificación de edad
- Requiere estado `age_verified` para visualización sin blur

**Uso**: Contenido para adultos, imágenes explícitas.

---

## 2. Reglas de Visibilidad según Estado del Usuario

### 2.1. Estado: Provisional

**Imágenes con tag `teaser`**:
- Visibles sin restricciones
- Sin blur aplicado
- Acceso completo

**Imágenes con tag `adult`**:
- Visibles con blur aplicado
- No visibles sin blur
- Acceso restringido

### 2.2. Estado: WhatsApp Verified

**Imágenes con tag `teaser`**:
- Visibles sin restricciones
- Sin blur aplicado
- Acceso completo

**Imágenes con tag `adult`**:
- Visibles con blur aplicado
- No visibles sin blur
- Acceso restringido (igual que `provisional`)

### 2.3. Estado: Age Verified

**Imágenes con tag `teaser`**:
- Visibles sin restricciones
- Sin blur aplicado
- Acceso completo

**Imágenes con tag `adult`**:
- Visibles sin blur aplicado
- Acceso completo
- Sin restricciones

### 2.4. Estados: Payment Enabled y Operational

**Imágenes con tag `teaser`**:
- Visibles sin restricciones
- Sin blur aplicado
- Acceso completo

**Imágenes con tag `adult`**:
- Visibles sin blur aplicado
- Acceso completo
- Sin restricciones (igual que `age_verified`)

---

## 3. Uso de Blur para Imágenes Adult

### 3.1. Aplicación de Blur

El sistema aplica blur automáticamente a imágenes con tag `adult` cuando el usuario no tiene estado `age_verified` o superior.

**Regla**: El blur se aplica automáticamente por el sistema. No es una decisión del usuario ni del modelo.

### 3.2. Propósito del Blur

El blur permite:
- Mostrar que existe contenido adicional
- Mantener privacidad del contenido para adultos
- Incentivar verificación de edad
- Cumplir con restricciones de contenido

### 3.3. Remoción de Blur

El blur se remueve automáticamente cuando el usuario alcanza estado `age_verified` o superior.

**Regla**: La remoción de blur es automática. No requiere acción adicional del usuario después de verificar edad.

---

## 4. Visibilidad de Perfiles de Modelos

### 4.1. Estado Provisional del Modelo

**Visibilidad**:
- Perfil no visible públicamente
- Imágenes privadas
- Solo el modelo puede ver su perfil

### 4.2. Estado Age Verified del Modelo

**Visibilidad**:
- Perfil visible públicamente
- Imágenes con tag `teaser` visibles para todos los usuarios
- Imágenes con tag `adult` visibles según estado del usuario (con o sin blur)

### 4.3. Estado Payment Enabled u Operational del Modelo

**Visibilidad**:
- Perfil visible públicamente
- Imágenes con tag `teaser` visibles para todos los usuarios
- Imágenes con tag `adult` visibles según estado del usuario (con o sin blur)
- Recepción de mensajes habilitada

---

## 5. Prohibiciones Explícitas

### 5.1. No Duplicar Imágenes

El sistema no permite duplicar imágenes. Cada imagen debe ser única y no puede existir en múltiples instancias.

**Regla**: Una imagen, una instancia. No se permiten duplicados.

### 5.2. No Lógica en Frontend

El frontend no debe contener lógica de decisión sobre visibilidad de imágenes. Todas las decisiones de visibilidad se toman en el backend.

**Regla**: El frontend solo muestra lo que el backend determina que debe mostrarse. No aplica lógica condicional de visibilidad.

### 5.3. No Modificación de Tags por Usuario

Los usuarios no pueden modificar los tags de las imágenes. Solo los modelos pueden etiquetar sus propias imágenes durante la subida.

**Regla**: Los tags son inmutables una vez asignados por el modelo. Los usuarios no pueden cambiarlos.

### 5.4. No Bypass de Blur

El sistema no permite bypass del blur mediante ningún método. El blur solo se remueve mediante verificación de edad.

**Regla**: No hay excepciones al blur para usuarios sin verificación de edad.

---

## 6. Responsabilidades del Modelo

### 6.1. Etiquetado Correcto

El modelo es responsable de etiquetar correctamente sus imágenes durante la subida. El sistema confía en el etiquetado del modelo.

**Regla**: El modelo debe etiquetar correctamente. El sistema no valida el contenido de las imágenes, solo aplica reglas según los tags.

### 6.2. Contenido Apropiado

El modelo es responsable de que el contenido de las imágenes sea apropiado para el tag asignado. El sistema no valida el contenido.

**Regla**: El modelo es responsable del contenido. El sistema aplica reglas de visibilidad según tags, no según contenido real.

---

## 7. Responsabilidades del Sistema

### 7.1. Aplicación de Blur

El sistema es responsable de aplicar blur automáticamente según el estado del usuario y el tag de la imagen.

**Regla**: El sistema aplica blur de forma consistente y automática. No hay excepciones manuales.

### 7.2. Decisión de Visibilidad

El sistema es responsable de decidir qué imágenes son visibles para cada usuario según su estado y los tags de las imágenes.

**Regla**: Todas las decisiones de visibilidad se toman en el backend. El frontend solo muestra lo determinado.

### 7.3. Prevención de Duplicados

El sistema es responsable de prevenir duplicados de imágenes.

**Regla**: El sistema no permite subir la misma imagen múltiples veces.

---

## 8. Separación de Fases

Estas reglas de imágenes y visibilidad aplican a fases futuras cuando se implemente el sistema de registro completo. No modifican la operación actual de Fase M (Modo 1).

**Regla**: Las reglas documentadas aquí son normativas para implementación futura, no descriptivas de implementación actual.

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Estado**: Documentación normativa canónica


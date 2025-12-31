# Elixir Core: Checklist de Implementación

## 1. Propósito

Este documento define el checklist mínimo para validar una implementación del Elixir Core antes de cualquier despliegue. El checklist establece los requisitos obligatorios que deben cumplirse para considerar una implementación válida y desplegable. El cumplimiento de todas las secciones es condición necesaria para autorizar el despliegue.

## 2. Checklist de aislamiento

- [ ] El Core no expone endpoints públicos.
- [ ] El Core no devuelve mensajes al usuario.
- [ ] El Core no conoce UI, copy ni diseño.
- [ ] El Core no depende de Catálogo ni Edge.

## 3. Checklist de decisiones

- [ ] Todas las decisiones terminan en autorizar o denegar.
- [ ] No existen estados intermedios visibles.
- [ ] Toda excepción se trata como denegación.
- [ ] No hay retries automáticos visibles.

## 4. Checklist de señales (Nectar)

- [ ] Nectar solo se usa internamente.
- [ ] No existe balance visible.
- [ ] No existe equivalencia monetaria.
- [ ] No se serializa hacia capas externas.

## 5. Checklist de seguridad

- [ ] No se loguea información sensible.
- [ ] No se exponen reglas internas.
- [ ] No se filtran razones de denegación.
- [ ] No se habilitan bypass manuales.

## 6. Checklist de estrés y abuso

- [ ] Bajo carga, el Core ajusta reglas internas.
- [ ] Bajo abuso, prioriza cortes silenciosos.
- [ ] Nunca rediseña UX bajo presión.
- [ ] Nunca relaja reglas por volumen.

## 7. Checklist de cambios

- [ ] Todo cambio pasa por gobernanza.
- [ ] No se aplican hotfixes conceptuales.
- [ ] No se agregan features no documentadas.

## 8. Señal de validación final

Si todas las secciones se cumplen, el Core es desplegable.

Si alguna falla, el despliegue se bloquea.

## 9. Frase canónica de cierre

El checklist protege al sistema cuando el código empieza a crecer.


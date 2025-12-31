# Decision CLI

## Qué es Decision CLI

Decision CLI es una herramienta de línea de comandos para evaluar y probar decisiones de autorización de manera independiente. Permite probar escenarios de decisión sin necesidad de ejecutar sistemas completos o interfaces de usuario.

## Cómo se usará (conceptualmente)

Decision CLI se utilizará desde la terminal para:

1. **Evaluar decisiones**: Probar rápidamente si una solicitud sería autorizada o denegada
2. **Validar comportamiento**: Verificar que las decisiones se comportan como se espera
3. **Testing manual**: Probar escenarios antes de integrarlos en sistemas productivos

Ejemplo conceptual de uso:
```bash
decision-cli --adapter elixir --request "..." --output ALLOW|DENY
```

## Qué garantiza

- **Output mínimo**: Solo produce `ALLOW` o `DENY`, sin metadata adicional
- **Independencia**: No depende de infraestructura (HTTP, bases de datos, etc.)
- **Modularidad**: Puede trabajar con diferentes motores de decisión mediante adaptadores
- **Simplicidad**: Interfaz de línea de comandos simple y directa

## Qué no garantiza

- **No garantiza razones**: No proporciona explicaciones de por qué se tomó una decisión
- **No garantiza persistencia**: No almacena resultados ni historial
- **No garantiza alto rendimiento**: No está optimizado para procesamiento de alto volumen
- **No garantiza uso productivo**: No está diseñado para uso en producción

## Nota importante

**Este proyecto es una herramienta de evaluación, no un componente productivo.**

Decision CLI está diseñado exclusivamente para:
- Testing manual
- Evaluación de producto
- Validación de comportamiento
- Experimentación

No debe ser utilizado en sistemas productivos ni como parte de la infraestructura de producción.


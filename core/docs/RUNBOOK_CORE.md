# Runbook Operativo - Elixir Core

## Principio Fundamental

**Fail-closed absoluto**: Bajo cualquier error, timeout o condición de estrés, el Core SIEMPRE DENIEGA.

## Manejo de Errores

### Errores de Validación
- Campo requerido faltante → DENY
- Tipo de dato inválido → DENY
- Tamaño de payload excedido → DENY
- Context excede límite → DENY

### Errores de Deadline
- Request expirado (deadline_at vencido) → DENY
- Request expirado (deadline_ms vencido) → DENY
- Deadline no especificado → DENY

### Errores Internos
- Excepción no prevista → DENY
- Error en pipeline de evaluación de reglas → DENY
- Excepción en etapa del pipeline → DENY
- Timeout de procesamiento → DENY

**Regla invariable**: Cualquier error se trata como DENY. No hay excepciones.

## Timeouts Configurables

El Core valida deadlines en cada solicitud:
- `deadline_at`: Timestamp absoluto de expiración
- `deadline_ms`: Milisegundos desde `issued_at`

Si el request está expirado al momento de procesamiento, se deniega inmediatamente.

## Señales de Estrés

### Métricas de Monitoreo
- `authorize_total`: Total de solicitudes procesadas
- `authorize_allow_total`: Total de autorizaciones
- `authorize_deny_total`: Total de denegaciones
- `authorize_error_total`: Total de errores
- `authorize_timeout_total`: Total de timeouts

### Indicadores de Estrés
- Alto ratio `authorize_error_total / authorize_total`
- Alto ratio `authorize_timeout_total / authorize_total`
- Latencia creciente en logs

## Acción Bajo Degradación

### Mantener DENY
- Bajo estrés, el Core mantiene el comportamiento fail-closed
- No se relajan reglas por volumen
- No se habilitan bypass manuales
- No se expone información sensible

### Logs Seguros
- Solo se registra: trace_id, result (ALLOW|DENY), latency_ms
- NO se registra: reglas, estados internos, contexto sensible, Nectar

### Sin Exposición
- No se exponen razones de decisión
- No se exponen estados internos
- No se exponen reglas aplicadas
- No se expone Nectar

## Operación Normal

1. Request recibido
2. Validación de schema
3. Validación de deadline
4. Pipeline interno deny-only de evaluación de reglas
5. Log seguro
6. Retorno de decisión (ALLOW | DENY)

### Pipeline Interno Deny-Only

El Core ejecuta un pipeline interno de evaluación de reglas que:
- Ejecuta etapas en orden secuencial
- Si alguna etapa devuelve DENY, retorna DENY inmediatamente (short-circuit)
- Si todas las etapas pasan, retorna DENY por defecto (default deny)
- Bajo degradación: mantiene DENY (fail-closed absoluto)

## Incidentes

En caso de incidente:
1. Verificar métricas de error y timeout
2. Revisar logs seguros (sin información sensible)
3. Mantener fail-closed (no relajar reglas)
4. No exponer información interna

## Frase Canónica

El Core decide en silencio y las capas obedecen.


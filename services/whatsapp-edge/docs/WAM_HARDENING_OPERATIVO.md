# Hardening Operativo del WAM

**Fecha**: 2024  
**Estado**: GO CONTROLADO - Hardening completado  
**Versión**: 1.0.0

## Resumen Ejecutivo

Este documento describe el hardening operativo aplicado al módulo WAM (WhatsApp Enmascarado) para reducir riesgos antes de exponerlo a un proveedor real, sin modificar comportamiento funcional ni agregar features.

**Principio inviolable**: Elixir Core v1.0 está SELLADO e INMODIFICABLE. El WAM NO consulta al Core, NO persiste decisiones, NO almacena PII.

## Controles Endurecidos

### 1. Seguridad del Endpoint Administrativo

**Endpoint**: `POST /admin/killswitch`

**Protecciones implementadas**:
- ✅ Autenticación mediante token (variable de entorno `ADMIN_TOKEN` o header `Authorization`)
- ✅ Comportamiento fail-closed: rechaza por defecto si no hay token válido
- ✅ Rate limiting: 5 solicitudes por minuto por IP
- ✅ Validación de token mediante comparación constante en tiempo

**Configuración**:
```bash
export ADMIN_TOKEN="token-secreto-aqui"
```

**Uso**:
```bash
curl -X POST http://localhost:3002/admin/killswitch \
  -H "Authorization: Bearer token-secreto-aqui" \
  -H "Content-Type: application/json" \
  -d '{"action": "activate", "mode": "DROP"}'
```

**Evidencia**: Ver `src/middleware/adminAuth.ts`

### 2. Kill-Switch Persistente

**Implementación**: `PersistentKillSwitch` reemplaza `InMemoryKillSwitch`

**Características**:
- ✅ Estado persistido en archivo local (`data/killswitch-state.json`)
- ✅ Estado sobrevive a restarts del servicio
- ✅ Modos soportados: `DROP` y `SILENCIO`
- ✅ Comportamiento fail-closed: inicia inactivo si hay error al cargar

**Configuración**:
```bash
export KILLSWITCH_STATE_DIR="./data"  # Opcional, default: ./data
```

**Evidencia**: Ver `src/killswitch/PersistentKillSwitch.ts` y `tests/killswitch_persistence.test.ts`

### 3. Observabilidad Operativa Real

**Mejoras implementadas**:
- ✅ Separación de logs: `info` (stdout) vs `error` (stderr)
- ✅ Métricas agregadas emitidas cada 1 minuto:
  - `handoffs_created_total`
  - `handoffs_resolved_total`
  - `handoffs_expired_total`
  - `handoffs_failed_total`
  - `killswitch_activations_total`
  - `provider_executions_success_total`
  - `provider_executions_failed_total`
  - `errors_by_category_total` (por tipo de error)

**Principios mantenidos**:
- ✅ NO registra contenido de mensajes
- ✅ NO registra PII
- ✅ NO registra números telefónicos
- ✅ NO registra decisiones del Core

**Evidencia**: Ver `src/observability/ConsoleObservability.ts`

### 4. Rate Limiting y Protección Básica

**Límites implementados**:
- ✅ Resoluciones de handoff: 10 por minuto por IP
- ✅ Creación de handoffs: 5 por minuto por `session_id`
- ✅ Endpoint admin: 5 por minuto por IP

**Comportamiento**:
- ✅ Ventana deslizante de 1 minuto
- ✅ Limpieza automática de entradas expiradas
- ✅ Respuesta genérica al exceder límite (no expone razón)

**Evidencia**: Ver `src/middleware/rateLimiter.ts`

## Invariantes Verificados

### ✅ No PII

**Verificación**:
- Revisión de código: ningún componente almacena o registra PII
- Logs estructurados: solo metadatos operativos (handoff_id, session_id)
- Tests: validación de que no se registra contenido

**Evidencia**: Ver `src/observability/ConsoleObservability.ts` y `src/resolver/HandoffResolverImpl.ts`

### ✅ No Persistencia de Decisiones

**Verificación**:
- El WAM NO consulta al Core
- El WAM recibe handoffs ya autorizados por el Core
- Solo se almacena metadata temporal (handoff_id, session_id, user_ref, model_ref)
- TTL estricto: 5 minutos, borrado automático

**Evidencia**: Ver `src/service/HandoffService.ts` y `src/storage/InMemoryTempStore.ts`

### ✅ Aislamiento del Core

**Verificación**:
- No hay imports del Core en el módulo WAM
- No hay llamadas HTTP al Core
- El WAM es ejecutor puro sin lógica decisional

**Evidencia**: Revisión de dependencias en `package.json` y estructura de `src/`

### ✅ Kill-Switch Efectivo

**Verificación**:
- Modo DROP: rechaza todas las solicitudes inmediatamente
- Modo SILENCIO: procesa pero no ejecuta proveedor
- Estado persistente: sobrevive a restarts
- Tests: `tests/killswitch.test.ts` y `tests/killswitch_persistence.test.ts`

**Evidencia**: Ver `src/killswitch/PersistentKillSwitch.ts` y tests

## Qué NO Cambió

### Comportamiento Funcional
- ✅ Misma lógica de resolución de handoffs
- ✅ Mismos timeouts y validaciones
- ✅ Mismo comportamiento fail-closed
- ✅ Mismos mensajes de error genéricos

### Contratos
- ✅ Interfaces de contratos no modificadas
- ✅ Endpoints públicos mantienen misma firma
- ✅ Respuestas HTTP mantienen mismo formato

### Arquitectura
- ✅ No se agregaron nuevas rutas públicas funcionales
- ✅ No se modificó Elixir Core
- ✅ No se integró proveedor real

## Riesgos Residuales Aceptados

1. **Pérdida de handoffs activos**: Si el servicio se reinicia, handoffs en memoria se pierden (comportamiento esperado)
2. **Rate limiting in-memory**: Si el servicio se reinicia, contadores se resetean (aceptable para GO CONTROLADO)
3. **Kill-switch en archivo local**: No hay replicación entre instancias (aceptable para GO CONTROLADO)
4. **Sin proveedor real**: El sender sigue siendo NoopSender (intencional, no es feature)

## Checklist de Readiness Post-Hardening

### Seguridad Operativa
- [x] Endpoint admin protegido con autenticación
- [x] Kill-switch persistente y efectivo
- [x] Rate limiting básico implementado
- [x] Fail-closed en todos los controles

### Observabilidad
- [x] Logs separados por nivel (info/error)
- [x] Métricas agregadas emitidas periódicamente
- [x] Sin PII en logs ni métricas

### Auditoría Técnica
- [x] Evidencia de no PII
- [x] Evidencia de no persistencia de decisiones
- [x] Evidencia de aislamiento del Core
- [x] Evidencia de kill-switch efectivo

### Tests
- [x] Tests de kill-switch actualizados
- [x] Tests de persistencia agregados
- [x] Todos los tests pasan

## Estado Final

**Estado**: GO CONTROLADO

**Sistema listo para**:
- ✅ Operación controlada con usuarios limitados
- ✅ Monitoreo básico de métricas
- ✅ Activación manual de kill-switch persistente
- ✅ Auditoría técnica de invariantes

**NO listo para**:
- ❌ Integración con proveedor real (requiere decisión explícita)
- ❌ Alto volumen (requiere escalabilidad adicional)
- ❌ Alta disponibilidad (requiere replicación de kill-switch)

## Próximos Pasos (Fuera del Alcance de Hardening)

Para avanzar a integración con proveedor real:
1. Decisión explícita de exponer a proveedor
2. Configuración de credenciales del proveedor
3. Reemplazo de `NoopSender` por implementación real
4. Tests de integración con proveedor
5. Validación de SLOs bajo carga real

---

**Documento generado como parte del hardening operativo del WAM v1.0.0**


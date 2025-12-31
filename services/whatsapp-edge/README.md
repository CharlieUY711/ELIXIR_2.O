# Canal WhatsApp Enmascarado (WAM)

## Descripción

El WAM es un servicio HTTP/HTTPS request-driven que ejecuta handoffs autorizados. No decide, no explica, no aprende. Conecta una vez y desaparece.

**Estado**: GO CONTROLADO - Implementación mínima para operación controlada con usuarios limitados y volumen bajo.

## Principios Inviolables

- ✅ **Elixir Core v1.0 está SELLADO e INMODIFICABLE**
- ✅ El WAM NO consulta al Core directamente
- ✅ El WAM recibe handoffs ya autorizados por el Core a través del Chat
- ✅ El WAM es ejecutor puro sin lógica decisional
- ✅ NO almacena contenido de mensajes ni PII
- ✅ NO expone números telefónicos ni información sensible
- ✅ Fail-closed en toda falla

## Arquitectura

### Componentes

1. **HandoffResolver**: Valida y resuelve handoffs con uso único atómico
2. **TempStore**: Almacenamiento temporal con TTL estricto (~5 minutos)
3. **Sender**: Adaptador abstracto al proveedor de WhatsApp (simulado en DEV)
4. **KillSwitch**: Mecanismo de detención inmediata persistente (modos DROP y SILENCIO)
5. **Observability**: Logs estructurados y métricas agregadas (sin PII)
6. **Rate Limiter**: Protección básica contra flood
7. **Admin Auth**: Autenticación para endpoints administrativos

### Contratos Internos

Todos los componentes implementan interfaces definidas en `src/contracts/`:
- `ITempStore`: Almacenamiento temporal con TTL y atomicidad
- `ISender`: Ejecución de conexión usuario-modelo
- `IKillSwitch`: Control de detención inmediata
- `IObservability`: Registro de eventos y métricas
- `IHandoffResolver`: Resolución de handoffs

## Estructura del Proyecto

```
services/whatsapp-edge/
├── src/
│   ├── contracts/          # Interfaces/contratos internos
│   ├── types/               # Tipos TypeScript
│   ├── storage/             # Implementación TempStore (in-memory)
│   ├── sender/              # Implementación Sender (noop para DEV)
│   ├── killswitch/          # Implementación KillSwitch (persistente)
│   ├── observability/       # Implementación Observability (console)
│   ├── resolver/            # Implementación HandoffResolver
│   ├── service/              # Servicio de creación de handoffs
│   ├── middleware/          # Middlewares (auth, rate limiting)
│   ├── docs/                # Documentación de hardening
│   └── index.ts              # Punto de entrada HTTP
├── tests/                    # Suite de tests
├── package.json
├── tsconfig.json
└── README.md
```

## Instalación

```bash
cd services/whatsapp-edge
npm install
```

## Desarrollo

### Compilar

```bash
npm run build
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

El servicio se inicia en `http://localhost:3002` (configurable con variable de entorno `PORT`).

### Ejecutar tests

```bash
npm test
```

## Endpoints HTTP

### POST /handoffs

Crea un nuevo handoff (llamado desde el Chat).

**Request:**
```json
{
  "session_id": "session-123",
  "user_ref": "user-456",
  "model_ref": "model-789"
}
```

**Response:**
```json
{
  "handoff_id": "550e8400-e29b-41d4-a716-446655440000",
  "handoff_url": "http://localhost:3002/resolve/550e8400-e29b-41d4-a716-446655440000"
}
```

### GET /resolve/:handoff_id

Resuelve un handoff (llamado cuando el usuario accede al enlace).

**Response (éxito):**
```json
{
  "message": "Redirigiendo a WhatsApp..."
}
```

**Response (error):**
```json
{
  "message": "Enlace inválido"
}
```

Mensajes de error genéricos (no exponen causa específica):
- `"Enlace inválido"` - Handoff no encontrado o formato inválido
- `"Este enlace ha expirado. Por favor, inicia nuevamente"` - TTL vencido
- `"Este enlace ya ha sido utilizado"` - Handoff ya REDEEMED
- `"Servicio temporalmente no disponible"` - Kill-switch activo
- `"No se pudo completar la conexión. Por favor, intenta nuevamente."` - Error interno

### GET /health

Health check básico.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /admin/killswitch

Activa/desactiva kill-switch. **Protegido con autenticación** (requiere token).

**Autenticación**: Requiere header `Authorization: Bearer <ADMIN_TOKEN>` o variable de entorno `ADMIN_TOKEN`.

**Request (activar):**
```bash
curl -X POST http://localhost:3002/admin/killswitch \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "activate", "mode": "DROP"}'
```

**Request (desactivar):**
```bash
curl -X POST http://localhost:3002/admin/killswitch \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "deactivate"}'
```

**Modos:**
- `DROP`: Todas las solicitudes se rechazan inmediatamente
- `SILENCIO`: Solicitudes se procesan pero no se ejecuta sender

**Rate Limiting**: 5 solicitudes por minuto por IP

## Invariantes Críticos

### Uso Único

Cada handoff se consume exactamente una vez. La transición `CREATED → REDEEMED` es atómica.

### TTL Estricto

Handoffs expiran automáticamente después de ~5 minutos. No hay extensión ni renovación.

### Fail-Closed

Cualquier falla resulta en rechazo de handoff, no en acceso no autorizado.

### Opacidad

Mensajes de error son genéricos e invariantes. No exponen información sensible ni detalles técnicos.

## Tests

Suite de tests cubre:

- ✅ Uso único del handoff
- ✅ TTL y expiración
- ✅ Idempotencia
- ✅ Kill-switch (modos DROP y SILENCIO)
- ✅ Fail-closed

Ejecutar tests:
```bash
npm test
```

## Observabilidad

### Eventos Registrados

- `handoff_created`: Handoff creado
- `handoff_redeemed`: Handoff resuelto exitosamente
- `handoff_expired`: Handoff expirado
- `handoff_revoked`: Handoff revocado
- `handoff_resolution_failed`: Falla en resolución
- `provider_execution_success`: Ejecución exitosa del proveedor
- `provider_execution_failed`: Falla en ejecución del proveedor
- `kill_switch_activated`: Kill-switch activado
- `kill_switch_deactivated`: Kill-switch desactivado

### Métricas Agregadas

Emitidas cada 1 minuto:
- `handoffs_created_total`: Total de handoffs creados
- `handoffs_resolved_total`: Total de handoffs resueltos
- `handoffs_expired_total`: Total de handoffs expirados
- `handoffs_failed_total`: Total de handoffs fallidos
- `killswitch_activations_total`: Total de activaciones del kill-switch
- `provider_executions_success_total`: Total de ejecuciones exitosas del proveedor
- `provider_executions_failed_total`: Total de ejecuciones fallidas del proveedor
- `errors_by_category_total`: Total de errores por categoría
- `handoff_resolution_duration_ms`: Tiempo de resolución de handoff (por request)

**NO se registra:**
- Contenido de mensajes
- Números telefónicos
- Datos personales
- Razones de decisiones del Core
- Estados internos del Core

## Implementación DEV vs Producción

### DEV (Actual - Hardened)

- **TempStore**: In-memory (pérdida de datos en reinicio)
- **Sender**: Noop (simulado, no envía nada real)
- **KillSwitch**: **Persistente** (archivo local, sobrevive a reinicios)
- **Observability**: Console logs estructurados con métricas agregadas
- **Rate Limiting**: Implementado (10 resoluciones/min, 5 creaciones/min)
- **Admin Auth**: Autenticación por token para endpoints administrativos

### Producción (Futuro)

- **TempStore**: Redis o base de datos efímera con TTL nativo
- **Sender**: Implementación real del proveedor de WhatsApp
- **KillSwitch**: Persistente (archivo, base de datos, feature flag)
- **Observability**: Sistema de observabilidad dedicado (logs, métricas, alertas)

## Variables de Entorno

### Variables Básicas
- `PORT`: Puerto del servicio (default: 3002)
- `BASE_URL`: URL base para generar handoff_url (default: http://localhost:3002)
- `ADMIN_TOKEN`: Token de autenticación para endpoints administrativos (requerido para `/admin/killswitch`)
- `KILLSWITCH_STATE_DIR`: Directorio para almacenar estado del kill-switch (default: `./data`)

### Twilio (GO CONTROLADO)
- `TWILIO_ACCOUNT_SID`: Account SID de Twilio (requerido si `WAM_SENDER_ENABLED=true`)
- `TWILIO_AUTH_TOKEN`: Auth Token de Twilio (requerido si `WAM_SENDER_ENABLED=true`)
- `TWILIO_WHATSAPP_FROM`: Número de WhatsApp Business de Twilio (formato: whatsapp:+1234567890)
- `WAM_SENDER_ENABLED`: Habilitar sender real (true/false, default: false)
- `WAM_PROVIDER`: Proveedor a usar (default: "noop", opciones: "noop", "twilio")
- `WAM_WEBHOOK_SECRET`: Secret para validar firmas de webhooks de Twilio (opcional)
- `PROVIDER_TIMEOUT_MS`: Timeout para llamadas al proveedor en ms (default: 10000)

**IMPORTANTE**: No hardcodear valores de credenciales en el código. Usar variables de entorno o vault.

## Límites Explícitos

### NO se Implementa en Esta Fase

- Persistencia de handoffs más allá de TTL
- Recuperación automática de estado tras fallas
- Reintentos automáticos de ejecución del proveedor
- Escalado automático
- Manejo de webhooks del proveedor
- Intermediación de conversación posterior al handoff

### Prohibido Absoluto

- ❌ Consultar al Core directamente
- ❌ Almacenar contenido de conversación
- ❌ Exponer números telefónicos o datos personales
- ❌ Modificar el Core
- ❌ Decidir, explicar o aprender
- ❌ Crear handoffs permanentes o reutilizables

## Validación de Invariantes

Antes de desplegar, validar:

- [ ] Tests de invariantes pasan (uso único, TTL, atomicidad)
- [ ] No hay dependencias al Core
- [ ] No se almacena información prohibida
- [ ] No se expone información sensible
- [ ] Kill-switch funciona inmediatamente
- [ ] Timeouts se aplican correctamente
- [ ] Fail-closed garantizado en todas las fallas

## Hardening Operativo

El módulo WAM ha sido endurecido operativamente para reducir riesgos antes de exponerlo a un proveedor real. Ver documentación completa en:

- `docs/WAM_HARDENING_OPERATIVO.md` - Documentación completa del hardening

**Controles endurecidos**:
- ✅ Endpoint admin protegido con autenticación
- ✅ Kill-switch persistente (sobrevive a reinicios)
- ✅ Observabilidad mejorada con métricas agregadas
- ✅ Rate limiting básico contra flood
- ✅ Evidencia técnica de invariantes

## Twilio (GO CONTROLADO)

**Estado**: Integración mínima con Twilio WhatsApp Business API activa en modo GO CONTROLADO.

### Configuración

1. Obtener credenciales de Twilio:
   - Account SID
   - Auth Token
   - Número de WhatsApp Business verificado

2. Configurar variables de entorno:
   ```bash
   export TWILIO_ACCOUNT_SID="AC..."
   export TWILIO_AUTH_TOKEN="..."
   export TWILIO_WHATSAPP_FROM="whatsapp:+1234567890"
   export WAM_SENDER_ENABLED="true"
   export WAM_PROVIDER="twilio"
   ```

3. Configurar webhook (opcional, para status callbacks):
   - En Twilio Console, configurar webhook URL: `https://tu-dominio.com/webhooks/twilio/status`
   - Configurar `WAM_WEBHOOK_SECRET` si se requiere validación de firma

### Modo Sandbox

Para pruebas en sandbox de Twilio:
1. Usar número de sandbox de Twilio
2. Enviar mensaje "join <codigo>" al número de sandbox desde WhatsApp
3. Usar `TWILIO_WHATSAPP_FROM` con el número de sandbox

### Límites Operativos Activos

- **100 handoffs/día**: Límite diario agregado (fail-closed si se excede)
- **10 usuarios simultáneos**: Límite de concurrencia
- **Kill-switch activo**: Debe estar operativo desde el primer mensaje real

### Rollback

Para desactivar Twilio y volver a modo simulado:

1. **Opción rápida (kill-switch)**:
   ```bash
   curl -X POST http://localhost:3002/admin/killswitch \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"action": "activate", "mode": "DROP"}'
   ```

2. **Opción completa (desactivar sender)**:
   ```bash
   export WAM_SENDER_ENABLED="false"
   # Reiniciar servicio
   ```

3. **Opción definitiva (eliminar credenciales)**:
   ```bash
   unset TWILIO_ACCOUNT_SID
   unset TWILIO_AUTH_TOKEN
   # Reiniciar servicio (fallará o usará NoopSender)
   ```

### Qué NO está Implementado

- ❌ Retries automáticos desde el WAM
- ❌ Colas de mensajes
- ❌ Inbound chat completo (solo status callbacks)
- ❌ Reconciliación conversacional
- ❌ Almacenamiento de contenido

Ver documentación completa en: `docs/INTEGRACION_PROVEEDOR_WAM_GO_CONTROLADO.md`

## Referencias

- `docs/ARQUITECTURA_MINIMA_CANAL_WAM.md`
- `docs/IMPLEMENTACION_MINIMA_WAM_GO_CONTROLADO.md`
- `docs/INFRA_Y_RUNTIME_WAM_GO_CONTROLADO.md`
- `docs/FASE_B_PREPARACION_IMPLEMENTACION_TECNICA_WAM.md`
- `docs/WAM_HARDENING_OPERATIVO.md` - Hardening operativo
- `docs/INTEGRACION_PROVEEDOR_WAM_GO_CONTROLADO.md` - Integración Twilio (GO CONTROLADO)

## Frase Canónica

**El WAM ejecuta handoffs autorizados. No decide, no explica, no aprende. Conecta una vez y desaparece.**

# Integración Proveedor WAM - GO CONTROLADO

**Fecha**: 2024  
**Estado**: GO CONTROLADO - Integración mínima con Twilio activa  
**Versión**: 1.0  
**Tipo**: Documentación de Integración

---

## Resumen Ejecutivo

Este documento describe la integración mínima del Canal WhatsApp Enmascarado (WAM) con Twilio WhatsApp Business API, implementada en modo GO CONTROLADO con límites operativos estrictos.

**Estado Actual**: ✅ **GO CONTROLADO — CON PROVEEDOR (SANDBOX)**

---

## Qué se Integró

### 1. TwilioSender (Outbound)

**Archivo**: `services/whatsapp-edge/src/sender/TwilioSender.ts`

**Funcionalidad**:
- Implementa interfaz `ISender` existente (sin modificar contrato)
- Envía mensajes WhatsApp vía Twilio Messages API
- Valida kill-switch antes de enviar (modos DROP/SILENCIO)
- Verifica `WAM_SENDER_ENABLED` antes de ejecutar
- Timeout estricto (10s configurable)
- Mapeo de errores de Twilio a categorías genéricas
- Idempotencia usando `handoff_id` (garantizado por uso único del handoff)

**Características**:
- ✅ Fail-closed en toda falla
- ✅ No almacena contenido ni PII
- ✅ Observabilidad agregada sin PII
- ✅ Respeta límites operativos

### 2. Webhook Inbound (Status Callbacks)

**Endpoint**: `POST /webhooks/twilio/status`

**Funcionalidad**:
- Recibe notificaciones de estado de mensajes de Twilio
- Valida firma HMAC (si está configurada) - fail-closed si inválida
- Valida formato básico del payload - fail-closed si inválido
- Registra métricas agregadas (sin PII ni contenido)
- Responde 200/ACK genérico

**Métricas Registradas**:
- `webhook_received_total`
- `webhook_invalid_signature_total`
- `webhook_parse_error_total`
- `status_delivered_total`
- `status_failed_total`

**NO se Persiste**:
- ❌ Contenido de mensajes
- ❌ Números telefónicos completos
- ❌ Metadata completa del proveedor

### 3. Guardrails Operativos

**Archivo**: `services/whatsapp-edge/src/guardrails/OperationalLimits.ts`

**Límites Implementados**:
- **100 handoffs/día**: Límite diario agregado (fail-closed si se excede)
- **10 usuarios simultáneos**: Límite de concurrencia (fail-closed si se excede)

**Abort Conditions**:
- **Tasa de fallas ≥ 20% en 1 hora**: Activa kill-switch automáticamente (modo DROP)
- Sin heurística: solo contador simple + ventana fija
- Registra evento `auto_killswitch_armed_total`
- NO intenta auto-recuperación

---

## Qué NO se Integró

### Explícitamente Prohibido

- ❌ **Retries automáticos**: No hay reintentos desde el WAM
- ❌ **Colas de mensajes**: No hay colas ni buffer
- ❌ **Inbound chat completo**: Solo status callbacks, no conversación
- ❌ **Reconciliación conversacional**: No hay reconciliación de estado
- ❌ **Almacenamiento de contenido**: No se almacena contenido de mensajes
- ❌ **Persistencia de decisiones**: No se almacenan decisiones ALLOW/DENY
- ❌ **Segundo proveedor**: Solo Twilio, no multi-proveedor

### No Requerido en GO CONTROLADO

- ❌ Escalado automático
- ❌ Alta disponibilidad distribuida
- ❌ Replicación de kill-switch entre instancias
- ❌ Dashboard administrativo
- ❌ Alertas automáticas (solo eventos registrados)

---

## Límites Activos

### Límites Operativos

1. **100 handoffs/día**:
   - Contador diario agregado
   - Reset automático a medianoche
   - Fail-closed si se excede
   - Métrica: `limit_exceeded_total`

2. **10 usuarios simultáneos**:
   - Contador de handoffs concurrentes
   - Fail-closed si se excede
   - Métrica: `limit_exceeded_total`

### Límites de Abort

1. **Tasa de fallas ≥ 20% en 1 hora**:
   - Ventana deslizante de 1 hora
   - Cálculo periódico cada 1 minuto
   - Activa kill-switch automáticamente (modo DROP)
   - Métrica: `auto_killswitch_armed_total`

---

## Cómo Activar/Desactivar

### Activar Twilio

1. Configurar variables de entorno:
   ```bash
   export TWILIO_ACCOUNT_SID="AC..."
   export TWILIO_AUTH_TOKEN="..."
   export TWILIO_WHATSAPP_FROM="whatsapp:+1234567890"
   export WAM_SENDER_ENABLED="true"
   export WAM_PROVIDER="twilio"
   ```

2. Reiniciar servicio:
   ```bash
   npm run dev
   # o
   npm run build && npm start
   ```

3. Verificar logs:
   ```
   [WAM] Provider: twilio (enabled: true)
   [WAM] Modo: GO CONTROLADO (Twilio)
   ```

### Desactivar Twilio (Rollback Rápido)

**Opción 1: Kill-Switch (Inmediato)**
```bash
curl -X POST http://localhost:3002/admin/killswitch \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "activate", "mode": "DROP"}'
```

**Opción 2: Desactivar Sender**
```bash
export WAM_SENDER_ENABLED="false"
# Reiniciar servicio
```

**Opción 3: Eliminar Credenciales**
```bash
unset TWILIO_ACCOUNT_SID
unset TWILIO_AUTH_TOKEN
# Reiniciar servicio (fallará o usará NoopSender)
```

---

## Cómo Hacer Rollback

### Rollback Inmediato (Kill-Switch)

1. Activar kill-switch en modo DROP:
   ```bash
   curl -X POST http://localhost:3002/admin/killswitch \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"action": "activate", "mode": "DROP"}'
   ```

2. Verificar que no se procesan handoffs:
   - Revisar logs: no debe haber `provider_execution_success`
   - Probar handoff: debe fallar con mensaje genérico

### Rollback Completo (Volver a NoopSender)

1. Activar kill-switch en modo DROP (paso anterior)

2. Desactivar sender:
   ```bash
   export WAM_SENDER_ENABLED="false"
   export WAM_PROVIDER="noop"
   ```

3. Reiniciar servicio:
   ```bash
   npm run build && npm start
   ```

4. Verificar logs:
   ```
   [WAM] Provider: noop (enabled: false)
   [WAM] Modo: DEV (in-memory, sender simulado)
   ```

5. Desactivar kill-switch si es necesario:
   ```bash
   curl -X POST http://localhost:3002/admin/killswitch \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"action": "deactivate"}'
   ```

**Tiempo Estimado**: < 5 minutos (si kill-switch activo) o < 15 minutos (si requiere deploy)

---

## Variables de Entorno

### Variables Básicas

- `PORT`: Puerto del servicio (default: 3002)
- `BASE_URL`: URL base para generar handoff_url (default: http://localhost:3002)
- `ADMIN_TOKEN`: Token de autenticación para endpoints administrativos
- `KILLSWITCH_STATE_DIR`: Directorio para almacenar estado del kill-switch (default: ./data)

### Twilio (GO CONTROLADO)

- `TWILIO_ACCOUNT_SID`: Account SID de Twilio (requerido si `WAM_SENDER_ENABLED=true`)
- `TWILIO_AUTH_TOKEN`: Auth Token de Twilio (requerido si `WAM_SENDER_ENABLED=true`)
- `TWILIO_WHATSAPP_FROM`: Número de WhatsApp Business de Twilio (formato: whatsapp:+1234567890)
- `WAM_SENDER_ENABLED`: Habilitar sender real (true/false, default: false)
- `WAM_PROVIDER`: Proveedor a usar (default: "noop", opciones: "noop", "twilio")
- `WAM_WEBHOOK_SECRET`: Secret para validar firmas de webhooks de Twilio (opcional)
- `PROVIDER_TIMEOUT_MS`: Timeout para llamadas al proveedor en ms (default: 10000)

### Guardrails Operativos

- `OPERATIONAL_MAX_HANDOFFS_PER_DAY`: Límite diario de handoffs (default: 100)
- `OPERATIONAL_MAX_CONCURRENT_USERS`: Límite de usuarios simultáneos (default: 10)
- `OPERATIONAL_FAILURE_THRESHOLD_PERCENT`: Umbral de tasa de fallas para abort (default: 20)
- `OPERATIONAL_FAILURE_WINDOW_MS`: Ventana de tiempo para calcular tasa de fallas (default: 3600000 = 1 hora)

**IMPORTANTE**: No hardcodear valores de credenciales en el código. Usar variables de entorno o vault.

---

## Cómo Ejecutar en DEV/GO CONTROLADO

### Modo DEV (NoopSender)

```bash
cd services/whatsapp-edge
npm install
npm run dev
```

### Modo GO CONTROLADO (Twilio Sandbox)

1. Obtener credenciales de Twilio Sandbox:
   - Account SID
   - Auth Token
   - Número de sandbox

2. Configurar variables de entorno:
   ```bash
   export TWILIO_ACCOUNT_SID="AC..."
   export TWILIO_AUTH_TOKEN="..."
   export TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"  # Ejemplo sandbox
   export WAM_SENDER_ENABLED="true"
   export WAM_PROVIDER="twilio"
   export ADMIN_TOKEN="tu-token-secreto"
   ```

3. Enviar mensaje "join <codigo>" al número de sandbox desde WhatsApp

4. Ejecutar servicio:
   ```bash
   npm run dev
   ```

5. Verificar logs:
   ```
   [WAM] Provider: twilio (enabled: true)
   [WAM] Modo: GO CONTROLADO (Twilio)
   ```

---

## Cómo Probar Webhooks Localmente

### Usando ngrok (Recomendado)

1. Iniciar servicio local:
   ```bash
   npm run dev
   ```

2. Exponer servicio con ngrok:
   ```bash
   ngrok http 3002
   ```

3. Configurar webhook en Twilio Console:
   - URL: `https://tu-dominio-ngrok.ngrok.io/webhooks/twilio/status`
   - Método: POST

4. Configurar variable de entorno (opcional, para validación de firma):
   ```bash
   export WAM_WEBHOOK_SECRET="tu-secret"
   ```

5. Probar webhook:
   - Twilio enviará webhooks automáticamente cuando cambie el estado de mensajes
   - Verificar logs del servicio para eventos `provider_webhook_received`

### Sin Exponer (Testing Manual)

1. Simular webhook con curl:
   ```bash
   curl -X POST http://localhost:3002/webhooks/twilio/status \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "MessageSid=SM123&MessageStatus=delivered&Timestamp=2024-01-01T00:00:00Z"
   ```

2. Verificar logs:
   - Debe aparecer evento `provider_webhook_received`
   - Debe responder 200 OK

**IMPORTANTE**: No exponer datos sensibles en pruebas. Usar datos de prueba.

---

## Cómo Correr Tests

```bash
cd services/whatsapp-edge
npm test
```

### Tests Específicos

```bash
# Tests de TwilioSender
npm test -- twilio_sender_timeout
npm test -- twilio_sender_error_mapping
npm test -- killswitch_blocks_outbound

# Tests de webhooks
npm test -- webhook_signature_failclosed
npm test -- webhook_payload_invalid_failclosed

# Tests de invariantes
npm test -- no_pii_in_logs

# Tests de límites
npm test -- limits_100_per_day
```

---

## Confirmación Explícita de Invariantes

### ✅ No PII

**Evidencia**:
- Revisión de código: `TwilioSender` no registra números telefónicos ni contenido
- Revisión de código: Webhook endpoint filtra PII antes de registrar eventos
- Tests: `no_pii_in_logs.test.ts` verifica que no se registra PII
- Logs estructurados: solo metadatos opacos (handoff_id, timestamps)

**Verificación**:
```bash
npm test -- no_pii_in_logs
```

### ✅ No Persistencia de Decisiones

**Evidencia**:
- Revisión de código: No se almacenan decisiones ALLOW/DENY
- Revisión de código: No se consulta al Core
- Revisión de código: Solo se almacena metadata temporal (handoff_id, session_id, user_ref, model_ref)
- TTL estricto: 5 minutos, borrado automático

**Verificación**:
- No hay código que persista decisiones
- No hay imports del Core

### ✅ Aislamiento del Core

**Evidencia**:
- Revisión de dependencias: `package.json` no incluye dependencias del Core
- Revisión de imports: No hay imports del Core en código
- Revisión de código: No hay llamadas HTTP al Core

**Verificación**:
```bash
grep -r "@elixir\|core" services/whatsapp-edge/src --exclude-dir=node_modules
# No debe haber resultados
```

### ✅ Kill-Switch Efectivo

**Evidencia**:
- Tests: `killswitch.test.ts` y `killswitch_blocks_outbound.test.ts` pasan
- Revisión de código: `TwilioSender` verifica kill-switch antes de enviar
- Revisión de código: Kill-switch bloquea outbound en modos DROP y SILENCIO

**Verificación**:
```bash
npm test -- killswitch
npm test -- killswitch_blocks_outbound
```

### ✅ Fail-Closed

**Evidencia**:
- Revisión de código: Todos los errores resultan en rechazo
- Revisión de código: Webhook endpoint rechaza si firma inválida o payload malformado
- Tests: `webhook_signature_failclosed.test.ts` y `webhook_payload_invalid_failclosed.test.ts` pasan

**Verificación**:
```bash
npm test -- webhook_signature_failclosed
npm test -- webhook_payload_invalid_failclosed
npm test -- fail_closed
```

---

## Estado Final

**Estado**: ✅ **GO CONTROLADO — CON PROVEEDOR (SANDBOX)**

**Componentes Implementados**:
- ✅ TwilioSender (outbound)
- ✅ Webhook endpoint (inbound status)
- ✅ Guardrails operativos (límites y abort conditions)
- ✅ Tests obligatorios
- ✅ Documentación completa

**Límites Activos**:
- ✅ 100 handoffs/día
- ✅ 10 usuarios simultáneos
- ✅ Kill-switch persistente operativo
- ✅ Abort condition: fail_rate >= 20% en 1 hora

**Invariantes Preservados**:
- ✅ No PII
- ✅ No persistencia de decisiones
- ✅ Aislamiento del Core
- ✅ Kill-switch efectivo
- ✅ Fail-closed

---

## Próximos Pasos (Fuera del Alcance de E3)

Para avanzar a GO completo:
1. Validación operativa durante 30 días consecutivos
2. Cumplimiento de criterios de validación (tasa de éxito ≥ 95%, no más de 3 incidentes críticos)
3. Revisión y aprobación explícita para escalado gradual
4. Negociación contractual de retención de logs ≤ 30 días

---

**Documento generado como parte de la integración E3 del WAM v1.0.0**


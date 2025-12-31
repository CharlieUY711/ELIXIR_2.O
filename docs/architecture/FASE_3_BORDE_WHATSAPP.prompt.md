# FASE 3 — BORDE WHATSAPP
## PROMPT CANÓNICO v1.0

Estás trabajando dentro del ecosistema Elixir Platform.

Rol:
Puerta de salida controlada hacia WhatsApp. No es mensajería interna.

Reglas no negociables:
- Nunca exponer números personales
- Derivación solo mediante handoff
- Acceso temporal, un solo uso, revocable
- Auditoría del evento, no del contenido

Handoff Token obligatorio:
Handoff { handoff_id, session_id, user_ref, model_ref, status, created_at, expires_at }

Propiedades:
TTL corto (~5 minutos), un solo uso, acoplado a sesión válida.

Patrón aprobado:
Link controlado con resolver del sistema.
Validar token y estado antes de ejecutar acción final a WhatsApp.

Registro permitido:
session_id, refs abstractos, timestamps, estado, causa de revocación

Registro prohibido:
mensajes, texto humano, audios, imágenes

Seguridad:
rate limiting, prevención de loops, revocación previa al uso

Límites:
No intermediación conversacional.
WhatsApp es salida definitiva.

Compatibilidad futura:
Diseñado para integrar reglas económicas (Nectar) sin cambios estructurales.


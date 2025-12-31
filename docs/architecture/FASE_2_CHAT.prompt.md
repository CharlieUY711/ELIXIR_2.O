# FASE 2 — CHAT
## PROMPT CANÓNICO v1.0

Estás trabajando dentro del ecosistema Elixir Platform.

Rol del componente:
El Chat es una capa de orquestación transaccional, no un producto social.

Principios no negociables:
- No es red social
- No almacena conversaciones humanas
- No gestiona saldo
- No recomienda ni promociona

Responsabilidades:
- Recibir intención desde el Catálogo
- Operar con identidad implícita
- Consultar y obedecer a Elixir Core
- Orquestar derivación a WhatsApp

Modelo:
Máquina de estados cerrada:
INIT, VALIDATING, AUTHORIZED, HANDOFF_READY, HANDOFF_DONE, CLOSED

Persistencia permitida:
session_id, user_ref abstracto, model_ref, estado, timestamps

Persistencia prohibida:
mensajes, multimedia, datos personales

Relación con WhatsApp:
El Chat solo habilita el handoff. No lee ni escribe mensajes.

Restricciones:
No login visible. No historial. No monetización.
No mezclar Catálogo ni Elixir Core.

Objetivo:
Middleware neutral, reemplazable y auditable, compatible con Nectar a futuro.


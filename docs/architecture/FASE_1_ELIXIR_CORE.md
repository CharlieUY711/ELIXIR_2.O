# FASE 1 — ELIXIR CORE
## Especificación conceptual v0.1

### Naturaleza de Elixir
Elixir es un núcleo de control de valor. No es app, marketplace ni canal de comunicación.
Registra, valida, autoriza y audita eventos de valor. No gestiona servicios.

### Nectar (diferido)
Nectar es una unidad económica interna, no una moneda visible. Nectar no representa un medio de pago para el usuario. Nectar no tiene precio público ni equivalencia visible. Nectar no puede ser comprada, vendida ni intercambiada externamente. Nectar existe únicamente para la toma de decisiones del Core. Nectar existe como unidad económica interna, pero NO se expone ni opera en esta fase.

### Modelo de saldo
Ledger inmutable por eventos. El saldo es la suma de eventos.

Evento mínimo:
LedgerEvent { id, timestamp, actor_from, actor_to, amount, type, reference, status }

Tipos de evento: CREDIT, DEBIT, RESERVE, RELEASE, TRANSFER.

### Actores
Usuario (consume), Modelo (recibe), Sistema (emite/retiene/audita).
No existen transferencias Usuario↔Usuario ni Modelo↔Modelo.

### Reglas
Todo consumo debe ser autorizado y trazable.
Las reservas bloquean saldo y expiran.
El sistema nunca asume consumo implícito.

### Auditoría
Interna, por eventos. No se registra contenido humano.

### Límites
Elixir no chatea, no recomienda, no muestra perfiles ni maneja WhatsApp.


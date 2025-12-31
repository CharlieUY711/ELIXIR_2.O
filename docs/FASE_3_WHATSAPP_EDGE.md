# FASE 3: WhatsApp Edge

## 1. Propósito del WhatsApp Edge

El WhatsApp Edge es el borde de salida controlado del sistema.

## 2. Qué es el Edge

El Edge es una puerta de salida. No es una capa de conversación. No es un servicio de mensajería propio.

## 3. Qué NO es el Edge

El Edge no es WhatsApp. No es una UI. No es un historial. No es un canal bidireccional controlado.

## 4. El handoff

El handoff es un traspaso controlado de contexto. Ocurre una sola vez.

## 5. Uso único

El enlace de handoff no es reutilizable. Los reintentos deben volver al Catálogo o Chat.

## 6. TTL (tiempo de vida)

El handoff tiene una ventana temporal limitada. Vencido el TTL, el acceso se invalida.

## 7. Qué ocurre antes del handoff

Antes del handoff ocurre:

- Decisión tomada por el Chat.
- Autorización del Core.
- Generación del enlace.

## 8. Qué ocurre después del handoff

Después del handoff:

- Elixir deja de controlar la conversación.
- No hay tracking fino.
- No hay intervención.

## 9. Qué Elixir NO hace en WhatsApp

Elixir no realiza las siguientes acciones en WhatsApp:

- No modera.
- No registra conversación.
- No muestra estados.
- No gestiona pagos visibles.

## 10. Riesgos y anti-patrones

Los siguientes son riesgos y anti-patrones:

- Enlaces permanentes.
- Reutilización.
- Bypass del Chat.
- Exposición de números.

## 11. Frase canónica de cierre

El Edge conecta una vez y luego desaparece.

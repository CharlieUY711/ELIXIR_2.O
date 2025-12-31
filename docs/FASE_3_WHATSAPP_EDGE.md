# FASE 3 — WHATSAPP EDGE

## Definición del Edge

El WhatsApp Edge es la puerta de salida controlada de Elixir Platform hacia WhatsApp. Su función es validar tokens de handoff, verificar condiciones de acceso y habilitar la conexión final del usuario con el modelo en el canal externo.

El Edge no es un sistema de mensajería interna. No almacena conversaciones, no procesa mensajes y no intermedia comunicación. El Edge es un punto de control que valida acceso temporal y delega la comunicación completa a WhatsApp.

## Qué es el handoff

El handoff es el mecanismo de transferencia controlada que permite al usuario acceder a WhatsApp para interactuar con un modelo específico. El handoff consiste en un token temporal que contiene referencias de sesión, identificación de usuario y modelo, y condiciones de validez.

El handoff no es un enlace permanente. No es reutilizable. No contiene información de conversación. El handoff es un permiso temporal y revocable que habilita una única conexión bajo condiciones estrictas de tiempo y uso.

## Principio de uso único

El handoff opera bajo el principio de uso único. Cada token de handoff puede ser utilizado una sola vez. Una vez que el handoff se resuelve exitosamente, el token se marca como consumido y no puede ser utilizado nuevamente.

El principio de uso único previene acceso no autorizado mediante reutilización de tokens, limita la exposición de referencias de sesión y garantiza que cada conexión a WhatsApp corresponda a una autorización específica y única de Elixir Core.

## Concepto de TTL

El TTL, tiempo de vida, define la validez temporal del handoff. Cada token de handoff tiene una fecha de expiración que limita el período durante el cual el acceso puede ser ejercido. Una vez que el TTL expira, el handoff se invalida automáticamente.

El TTL es corto por diseño. Los handoffs expiran rápidamente para minimizar la ventana de exposición, prevenir uso de tokens obsoletos y garantizar que cada conexión corresponda a condiciones transaccionales actuales. El TTL no es extensible ni renovable.

## Qué ocurre antes y después del handoff

Antes del handoff, el Edge valida la existencia del token, verifica que el estado sea válido, confirma que el TTL no haya expirado y asegura que el token no haya sido utilizado previamente. Solo cuando todas las condiciones se cumplen, el Edge permite la resolución del handoff.

Después del handoff, el usuario accede a WhatsApp directamente. El Edge no interviene en la comunicación posterior. El modelo recibe la referencia de sesión necesaria para identificar al usuario y generar su primer mensaje. El Edge registra el evento de resolución para auditoría pero no almacena contenido de conversación.

## Qué Elixir NO hace una vez en WhatsApp

Una vez que el handoff se completa y el usuario accede a WhatsApp, Elixir Platform no lee mensajes, no procesa contenido de conversación, no intermedia comunicación, no almacena texto de mensajes, no gestiona multimedia y no interviene en la interacción entre usuario y modelo.

Elixir Platform no monitorea conversaciones en tiempo real, no analiza sentimiento, no genera respuestas automáticas y no modifica el flujo de comunicación. WhatsApp es la salida definitiva donde Elixir Platform cede control completo al canal externo y al modelo.

## Riesgos de mal diseño del Edge

Un Edge mal diseñado puede permitir acceso no autorizado mediante reutilización de tokens, puede exponer referencias de sesión mediante handoffs permanentes, puede crear vulnerabilidades de seguridad mediante validación insuficiente y puede generar confusión mediante mensajes de error poco claros.

Un Edge mal diseñado puede intentar intermediar conversaciones, puede almacenar contenido que no debe retener, puede crear dependencias con WhatsApp que limiten la flexibilidad del sistema y puede violar el principio de separación de responsabilidades entre Elixir Platform y canales externos.

## Señales de correcta implementación conceptual

La implementación correcta del Edge se reconoce cuando los handoffs son de un solo uso, cuando el TTL se aplica estrictamente, cuando los tokens se invalidan después del uso, cuando los mensajes de error son claros y cuando el Edge no intenta procesar comunicación posterior al handoff.

La implementación correcta se reconoce cuando el Edge valida condiciones antes de permitir acceso, cuando registra eventos para auditoría sin almacenar contenido, cuando maneja estados de token de forma explícita y cuando mantiene separación estricta con la comunicación que ocurre en WhatsApp.

## Frase canónica de la fase

El Edge valida handoffs temporales de un solo uso y habilita acceso a WhatsApp, sin intermediar comunicación posterior ni almacenar contenido de conversación.


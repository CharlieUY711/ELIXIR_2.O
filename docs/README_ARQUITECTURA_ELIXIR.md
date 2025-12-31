# Arquitectura Elixir Platform

## Visión general de Elixir Platform

Elixir Platform es un sistema de control de valor y orquestación transaccional que intermedia entre usuarios y modelos mediante capas especializadas. La plataforma gestiona autorización de transacciones, coordina acceso a canales de comunicación y mantiene integridad contable sin participar en la comunicación directa entre usuarios y modelos.

Elixir Platform opera como infraestructura transaccional que habilita interacciones económicas controladas. La plataforma no es un producto de usuario final, no es un marketplace y no es un sistema de mensajería. Elixir Platform es el núcleo que valida, autoriza y audita movimientos de valor mientras delega la comunicación real a sistemas externos.

## Separación estricta de capas

Elixir Platform se estructura en capas con responsabilidades definidas y separación estricta. El Catálogo es la capa visual de conversión que presenta modelos y facilita el inicio de transacciones. El Chat es la capa de orquestación que consulta Elixir Core y coordina derivación a canales externos. El WhatsApp Edge es la puerta de salida controlada que valida acceso temporal. Elixir Core es el núcleo de control de valor que autoriza transacciones y gestiona saldo. Nectar es la unidad de valor interna que opera dentro de Elixir Core.

Cada capa mantiene responsabilidades exclusivas y no asume funciones de otras capas. El Catálogo no procesa lógica de negocio. El Chat no gestiona saldo. El Edge no almacena conversaciones. Elixir Core no presenta interfaces de usuario. La separación estricta garantiza que cada componente sea reemplazable, auditable y compatible con evolución futura del sistema.

## Flujo macro del usuario

El flujo del usuario inicia en el Catálogo, donde visualiza modelos disponibles y selecciona uno para iniciar interacción. El Catálogo transmite la solicitud al Chat, que consulta Elixir Core para validar capacidad transaccional del usuario. Si Elixir Core autoriza, el Chat genera un handoff controlado que se transmite al Edge.

El Edge valida el handoff, verifica condiciones de acceso y habilita la conexión del usuario a WhatsApp. Una vez en WhatsApp, el usuario interactúa directamente con el modelo fuera del control de Elixir Platform. El sistema registra eventos de autorización y handoff para auditoría pero no interviene en la comunicación posterior.

## Principios innegociables del sistema

Elixir Platform opera bajo principios innegociables que definen su naturaleza y limitan su alcance. El sistema intermedia valor, no relaciones. El sistema autoriza transacciones, no gestiona servicios. El sistema audita eventos, no almacena contenido de conversación. El sistema delega comunicación, no la intermedia.

El sistema mantiene separación estricta entre capas. El sistema no expone información sensible en handoffs. El sistema no crea dependencias permanentes con canales externos. El sistema no toma decisiones económicas sin consultar Elixir Core. El sistema no retiene estado de sesión más allá de lo necesario para completar la orquestación.

## Qué problemas resuelve Elixir

Elixir Platform resuelve el problema de autorización transaccional entre usuarios y modelos. Resuelve el problema de control de acceso temporal a canales de comunicación. Resuelve el problema de integridad contable mediante ledger inmutable. Resuelve el problema de auditoría de eventos transaccionales sin almacenar contenido de conversación.

Elixir Platform resuelve el problema de orquestación de flujos complejos mediante capas especializadas. Resuelve el problema de separación de responsabilidades entre presentación, orquestación, control de valor y acceso a canales externos. Resuelve el problema de flexibilidad arquitectónica mediante componentes reemplazables y contratos definidos.

## Qué problemas NO intenta resolver

Elixir Platform no intenta resolver el problema de comunicación directa entre usuarios y modelos. No intenta resolver el problema de recomendación de modelos. No intenta resolver el problema de gestión de relaciones sociales. No intenta resolver el problema de almacenamiento de conversaciones. No intenta resolver el problema de análisis de contenido de mensajes.

Elixir Platform no intenta resolver el problema de autenticación de usuario más allá de referencias abstractas. No intenta resolver el problema de gestión de preferencias de usuario. No intenta resolver el problema de personalización de experiencia más allá de la orquestación transaccional. No intenta resolver el problema de intermediación conversacional.

## Advertencias arquitectónicas (anti-patterns)

El anti-pattern más peligroso es mezclar responsabilidades entre capas. El Catálogo no debe procesar lógica de negocio. El Chat no debe gestionar saldo. El Edge no debe almacenar conversaciones. Elixir Core no debe presentar interfaces de usuario. Cada violación de separación de responsabilidades compromete la integridad arquitectónica del sistema.

Otro anti-pattern crítico es crear dependencias permanentes con canales externos. El sistema debe poder reemplazar WhatsApp por otro canal sin modificar capas internas. El sistema no debe asumir características específicas de WhatsApp en capas de orquestación o control de valor.

El anti-pattern de almacenar contenido de conversación compromete la privacidad y viola el principio de que Elixir Platform intermedia valor, no relaciones. El sistema debe registrar eventos transaccionales sin almacenar texto de mensajes, multimedia ni datos personales más allá de referencias abstractas.

El anti-pattern de tomar decisiones económicas sin consultar Elixir Core viola el principio de fuente única de verdad financiera. Ninguna capa debe validar saldo, autorizar transacciones o gestionar valor sin consultar explícitamente a Elixir Core.

El anti-pattern de crear handoffs permanentes o reutilizables compromete la seguridad y viola el principio de acceso temporal controlado. Los handoffs deben tener TTL corto, uso único y validación estricta de condiciones antes de permitir acceso.

## Gobernanza y Resiliencia

La gobernanza post-producción y la resiliencia bajo estrés forman parte del contrato operativo de Elixir Platform. Estos aspectos definen cómo el sistema mantiene su integridad arquitectónica en producción, cómo evoluciona de forma controlada y cómo resiste condiciones adversas.

La documentación de gobernanza y resiliencia establece normas vigentes que rigen la operación del sistema en producción. Estos documentos son parte integral del contrato arquitectónico y deben respetarse tanto como los principios innegociables del sistema.

### Documentos de gobernanza y resiliencia

- [Gobernanza Post-Producción](GOBERNANZA_POST_PRODUCCION.md): Define el proceso de cambio controlado, la autoridad única de Elixir Core, la clasificación de modificaciones permitidas y el ritual de mantenimiento arquitectónico.

- [Orden Recomendado Post-Producción](ORDEN_RECOMENDADO_POST_PRODUCCION.md): Establece la secuencia obligatoria de trabajo post-HITO 4, priorizando resistencia a estrés, luego evolución interna de Nectar, finalmente operación estable.

- [Estrés y Abuso](ESTRES_Y_ABUSO.md): Define la respuesta canónica del sistema bajo condiciones adversas, el mapa de absorción por capas, las respuestas específicas por escenario y el checklist de resistencia.

Estos documentos forman parte del contrato del sistema en producción y deben consultarse antes de cualquier modificación que afecte la arquitectura canónica de Elixir Platform.


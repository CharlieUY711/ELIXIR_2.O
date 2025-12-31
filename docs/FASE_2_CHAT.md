# FASE 2 — CHAT

## Rol del Chat como orquestador

El Chat es la capa de orquestación transaccional de Elixir Platform. Su función es recibir la intención del usuario desde el Catálogo, validar la capacidad transaccional mediante consulta a Elixir Core, y coordinar la derivación controlada hacia WhatsApp cuando las condiciones se cumplen.

El Chat no es un producto de comunicación social. No almacena conversaciones, no gestiona relaciones entre usuarios y no proporciona funcionalidades de mensajería. El Chat es un middleware transaccional que opera con identidad implícita y delega la comunicación real a sistemas externos.

## Diferencia entre Chat y WhatsApp

El Chat es el sistema interno de orquestación que valida, autoriza y coordina transacciones. WhatsApp es el canal externo de comunicación donde ocurre la interacción real entre usuario y modelo. El Chat habilita el acceso a WhatsApp pero no participa en la conversación.

El Chat opera antes de la derivación a WhatsApp. Una vez que el handoff se completa, el Chat no interviene en la comunicación. WhatsApp es la salida definitiva donde el usuario y el modelo interactúan directamente, fuera del control de Elixir Platform.

## Principio de decisión (derivar vs cortar)

El Chat toma decisiones binarias basadas en la autorización de Elixir Core. Si Elixir Core autoriza la transacción, el Chat deriva al usuario hacia WhatsApp mediante handoff controlado. Si Elixir Core rechaza la transacción, el Chat corta el flujo y comunica el resultado sin derivación.

La decisión de derivar requiere autorización explícita de Elixir Core. La decisión de cortar ocurre cuando falta autorización, cuando los recursos son insuficientes o cuando las condiciones transaccionales no se cumplen. El Chat no toma decisiones económicas ni valida reglas de negocio por sí mismo.

## Estructura conceptual del primer mensaje

El primer mensaje en WhatsApp es responsabilidad del modelo, no del Chat. El Chat no genera contenido, no redacta mensajes y no personaliza comunicaciones. El handoff proporciona contexto necesario para que el modelo inicie la conversación, pero el Chat no interviene en la creación del mensaje.

El Chat transmite referencias abstractas que permiten al modelo identificar la sesión y el usuario. Estas referencias son suficientes para que el modelo recupere contexto necesario y genere su primer mensaje de forma independiente.

## Qué inputs puede usar y cuáles no

El Chat puede usar referencias abstractas de usuario y modelo proporcionadas por el Catálogo. Puede usar identificadores de sesión generados internamente. Puede usar respuestas de autorización de Elixir Core. Puede usar estados de validación y timestamps de operación.

El Chat no puede usar mensajes de usuario. No puede usar contenido de conversaciones. No puede usar datos personales más allá de referencias abstractas. No puede usar información de saldo directamente sin consultar Elixir Core. No puede usar preferencias de usuario ni historial de interacciones.

## Qué significa cortar correctamente

Cortar correctamente significa terminar el flujo transaccional cuando las condiciones no se cumplen, comunicar el resultado de forma clara al usuario, liberar recursos asociados a la sesión y registrar el evento para auditoría sin almacenar contenido de conversación.

Cortar correctamente implica no generar handoff cuando la autorización falla, no crear tokens de acceso cuando las condiciones no se cumplen y no dejar sesiones en estado intermedio. El corte debe ser definitivo y el usuario debe recibir información suficiente para entender el resultado.

## Qué significa derivar correctamente

Derivar correctamente significa generar un handoff controlado cuando Elixir Core autoriza la transacción, crear un token de acceso con TTL limitado y uso único, proporcionar la referencia de sesión necesaria para el modelo y transferir el control al sistema de borde sin retener capacidad de intervención posterior.

Derivar correctamente implica no exponer información sensible en el handoff, no crear tokens reutilizables, no mantener sesiones activas después del handoff y no intervenir en la comunicación que ocurre en WhatsApp. La derivación es unidireccional y definitiva.

## Estados conceptuales del Chat

El Chat opera mediante una máquina de estados que representa el ciclo de vida de una sesión transaccional. Los estados son: inicialización, validación, autorización, preparación de handoff, handoff completado y cierre.

El estado de inicialización ocurre cuando el Chat recibe la solicitud desde el Catálogo. El estado de validación verifica que los parámetros sean correctos. El estado de autorización consulta Elixir Core y espera respuesta. El estado de preparación de handoff genera el token de acceso. El estado de handoff completado registra la derivación exitosa. El estado de cierre finaliza la sesión y libera recursos.

## Criterios de cierre de la fase

La Fase 2 del Chat se considera completa cuando el sistema recibe solicitudes desde el Catálogo, consulta Elixir Core para autorización, toma decisiones binarias de derivar o cortar, genera handoffs controlados cuando corresponde, maneja errores de forma adecuada y mantiene separación estricta con las capas de comunicación externa.

La fase se cierra cuando el Chat opera como orquestador transaccional puro que no almacena conversaciones, no gestiona saldo y no interviene en la comunicación que ocurre después del handoff.

## Frase canónica de la fase

El Chat orquesta transacciones consultando Elixir Core y derivando a WhatsApp cuando autoriza, sin almacenar conversaciones ni gestionar comunicación directa.


# NO HACER — Anti-patrones Elixir Platform

## Principio rector

Este documento establece exclusiones operativas que bloquean decisiones que degradan la integridad arquitectónica de Elixir Platform. Los anti-patrones aquí definidos previenen la erosión del modelo económico, la violación de separación de capas y la introducción de complejidad que compromete la naturaleza del sistema.

Este documento tiene el mismo peso normativo que la arquitectura. Cualquier propuesta que viole estos anti-patrones requiere rediseño del producto, no evolución incremental. Las exclusiones aquí establecidas son innegociables y forman parte del contrato operativo de la plataforma.

## NO hacer economía visible

Elixir Platform no expone unidades económicas internas al usuario. El sistema no muestra balances, no presenta transacciones internas, no revela mecanismos de conversión. El usuario siempre paga en moneda externa y nunca razona en términos de unidades internas. Cualquier interfaz que muestre economía interna viola el principio de abstracción económica.

## NO exponer Nectar

Nectar es una unidad económica interna utilizada exclusivamente por Elixir Core para toma de decisiones. Nectar no es visible, no es comprable, no es transaccionable, no es explicable. El sistema no menciona Nectar en interfaces de usuario, no lo incluye en respuestas de API públicas, no lo documenta en materiales de usuario. Cualquier exposición de Nectar degrada el modelo económico y viola la separación entre lógica interna y experiencia de usuario.

## NO usar wallets, créditos ni tokens visibles

Elixir Platform no implementa wallets de usuario, no gestiona créditos visibles, no emite tokens transaccionables. El sistema no presenta balances de usuario, no muestra historiales de transacciones internas, no ofrece recargas de unidades internas. El usuario paga en moneda externa por acceso temporal, sin intermediación de unidades económicas visibles. Cualquier implementación de wallet, crédito o token visible viola el modelo económico canónico.

## NO explicar decisiones del sistema

Elixir Platform no explica por qué autoriza o rechaza transacciones. El sistema no presenta razones de negación, no muestra lógica de decisión, no revela condiciones internas. Las respuestas del sistema son binarias: autorización o rechazo, sin justificación. Cualquier explicación de decisiones internas expone lógica económica y viola la abstracción del modelo.

## NO agregar pasos "amables"

Elixir Platform no agrega pasos de confirmación, no presenta mensajes de bienvenida extensos, no implementa flujos de onboarding. El sistema minimiza fricción entre selección de modelo y acceso a canal externo. Cualquier paso adicional que no sea estrictamente necesario para la orquestación transaccional viola el principio de minimalismo operativo.

## NO optimizar conversión a cualquier costo

Elixir Platform no optimiza métricas de conversión mediante compromisos arquitectónicos. El sistema no mezcla capas para mejorar conversión, no expone economía para aumentar transacciones, no viola separación de responsabilidades para reducir abandono. La integridad arquitectónica prevalece sobre métricas de conversión. Cualquier optimización que degrade la arquitectura está prohibida.

## NO usar métricas para cambiar UX

Elixir Platform no modifica la experiencia de usuario basándose en métricas de comportamiento. El sistema mantiene la UX canónica independientemente de tasas de conversión, tiempos de sesión o patrones de uso. Las métricas informan operación y resiliencia, no rediseño de flujos. Cualquier cambio de UX motivado por métricas viola el principio de estabilidad de experiencia.

## NO mezclar capas por conveniencia

Elixir Platform mantiene separación estricta de capas sin excepciones. El Catálogo no procesa lógica de negocio. El Chat no gestiona saldo. El Edge no almacena conversaciones. Elixir Core no presenta interfaces de usuario. Cualquier mezcla de responsabilidades por conveniencia operativa, urgencia de implementación o optimización local viola la integridad arquitectónica.

## NO copiar modelos de marketplaces o wallets

Elixir Platform no adopta patrones de marketplaces tradicionales, no implementa modelos de wallets existentes, no replica flujos de plataformas de pago. El sistema mantiene su naturaleza única como infraestructura transaccional que intermedia valor sin intermediar relaciones. Cualquier adopción de patrones externos que no sean compatibles con la arquitectura canónica está prohibida.

## NO modificar UX post-producción

Elixir Platform mantiene la experiencia de usuario establecida en producción. El sistema no evoluciona la UX mediante iteraciones incrementales, no introduce cambios de interfaz basados en feedback, no modifica flujos establecidos. La UX canónica es parte del contrato operativo. Cualquier modificación de UX post-producción requiere rediseño del producto, no evolución incremental.

## Test final de validación "NO HACER"

Antes de implementar cualquier cambio, validar que la propuesta no viola ningún anti-patrón definido en este documento. Si la propuesta requiere:
- Exponer economía interna → BLOQUEADA
- Mostrar Nectar o unidades internas → BLOQUEADA
- Implementar wallets, créditos o tokens visibles → BLOQUEADA
- Explicar decisiones del sistema → BLOQUEADA
- Agregar pasos no esenciales → BLOQUEADA
- Optimizar conversión degradando arquitectura → BLOQUEADA
- Cambiar UX basándose en métricas → BLOQUEADA
- Mezclar responsabilidades entre capas → BLOQUEADA
- Copiar modelos de marketplaces o wallets → BLOQUEADA
- Modificar UX post-producción → BLOQUEADA

Si alguna validación falla, la propuesta está bloqueada y requiere rediseño del producto.

## Frase canónica de cierre

Este documento bloquea decisiones que degradan Elixir Platform. Las exclusiones aquí establecidas son innegociables. Cualquier violación de estos anti-patrones compromete la integridad arquitectónica, el modelo económico y la naturaleza del sistema. Este documento es parte del contrato operativo de la plataforma y tiene el mismo peso normativo que la arquitectura.


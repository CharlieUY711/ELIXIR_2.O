# Estrés y Abuso

## Principio rector bajo estrés

El sistema mantiene integridad transaccional y respeta principios arquitectónicos bajo cualquier condición de estrés o intento de abuso. El sistema no degrada su arquitectura para resistir presión. El sistema absorbe estrés mediante mecanismos de capas sin violar separación de responsabilidades.

Bajo estrés el sistema prioriza integridad sobre disponibilidad. El sistema rechaza transacciones cuando no puede garantizar autorización correcta. El sistema mantiene capacidad de auditoría incluso cuando opera bajo carga extrema. El sistema no compromete principios innegociables para mantener operación.

## Tipología de estrés

El estrés por volumen ocurre cuando el sistema recibe solicitudes transaccionales en cantidad que excede capacidad operativa normal. El estrés por insistencia ocurre cuando actores intentan reutilizar tokens, acceder con handoffs expirados o repetir solicitudes rechazadas. El estrés por bypass ocurre cuando actores intentan acceder directamente a capas internas sin pasar por flujos autorizados. El estrés por exploración ocurre cuando actores intentan descubrir vulnerabilidades mediante solicitudes no estándar.

Cada tipo de estrés requiere respuesta específica que mantiene integridad arquitectónica. El sistema no distingue entre estrés legítimo y abuso intencional en términos de respuesta técnica, pero registra eventos para análisis posterior. El sistema responde de forma consistente independientemente del origen del estrés.

## Respuesta canónica del sistema

La respuesta canónica del sistema bajo estrés es rechazar transacciones que no pueden ser autorizadas correctamente, invalidar handoffs que violan condiciones de uso, registrar eventos de rechazo para auditoría y mantener separación estricta de capas incluso cuando opera bajo presión.

El sistema no almacena contenido de conversación bajo estrés. El sistema no toma decisiones económicas sin consultar Elixir Core bajo estrés. El sistema no expone información sensible en respuestas de error bajo estrés. El sistema mantiene capacidad de auditoría incluso cuando rechaza solicitudes.

## Mapa de absorción por capas

El Catálogo absorbe estrés visual mediante feedback inmediato que comunica estado sin exponer complejidad. El Catálogo rechaza nuevas solicitudes cuando no puede transmitir al Chat, pero no procesa lógica de negocio para manejar estrés. El Catálogo mantiene su naturaleza pasiva incluso bajo carga.

El Chat absorbe estrés orquestacional mediante cola de solicitudes y rechazo cuando no puede consultar Elixir Core. El Chat no almacena conversaciones para manejar estrés. El Chat mantiene su función de orquestación pura incluso cuando opera bajo presión extrema.

El Edge absorbe estrés de handoff mediante validación estricta y rechazo inmediato de tokens inválidos. El Edge no crea handoffs temporales para manejar carga. El Edge mantiene principios de TTL y uso único incluso cuando recibe intentos masivos de acceso.

Elixir Core absorbe estrés transaccional mediante rechazo de autorizaciones cuando no puede garantizar integridad contable. Elixir Core no degrada su modelo de saldo para manejar volumen. Elixir Core mantiene fuente única de verdad financiera incluso bajo carga extrema.

Nectar absorbe estrés de valor mediante rechazo de operaciones cuando no puede garantizar coherencia. Nectar no modifica reglas de valor para manejar presión. Nectar mantiene integridad de unidad de valor incluso cuando opera bajo estrés.

## Respuestas específicas por escenario

Bajo estrés por volumen, el sistema rechaza solicitudes que exceden capacidad operativa, mantiene cola de solicitudes válidas y prioriza integridad sobre throughput. El sistema no procesa transacciones que no pueden ser autorizadas correctamente.

Bajo estrés por insistencia, el sistema rechaza handoffs reutilizados, invalida tokens expirados y registra intentos de acceso no autorizado. El sistema no crea excepciones para manejar insistencia. El sistema mantiene principios de uso único y TTL estricto.

Bajo estrés por bypass, el sistema rechaza acceso directo a capas internas, valida que todas las solicitudes pasen por flujos autorizados y registra intentos de bypass para auditoría. El sistema no expone endpoints internos para facilitar acceso.

Bajo estrés por exploración, el sistema responde con mensajes de error genéricos que no revelan estructura interna, rechaza solicitudes no estándar y registra patrones de exploración para análisis. El sistema no proporciona información que facilite descubrimiento de vulnerabilidades.

## Qué NO hacer nunca bajo estrés

El sistema nunca almacena contenido de conversación para manejar estrés. El sistema nunca toma decisiones económicas sin consultar Elixir Core para acelerar procesamiento. El sistema nunca mezcla responsabilidades entre capas para distribuir carga. El sistema nunca crea handoffs permanentes para evitar validación. Bajo estrés económico o de carga, Elixir ajusta reglas internas y consumo de Nectar; nunca expone monedas, precios ni comisiones al usuario.

El sistema nunca degrada principios arquitectónicos para mantener disponibilidad. El sistema nunca expone información sensible en respuestas de error para facilitar debugging. El sistema nunca omite validación de autorización para mejorar rendimiento. El sistema nunca compromete capacidad de auditoría para manejar volumen.

## Métricas internas permitidas

El sistema puede medir volumen de solicitudes por capa, tasa de rechazo por tipo de error, tiempo de respuesta de consultas a Elixir Core y frecuencia de handoffs generados. Estas métricas operan dentro de cada capa sin exponer información entre capas.

El sistema puede medir eventos de autorización, rechazos por falta de saldo, handoffs expirados y tokens inválidos. Estas métricas no incluyen contenido de conversación, datos personales ni información que comprometa privacidad.

## Checklist de resistencia

El sistema resiste estrés cuando rechaza transacciones no autorizables sin degradar arquitectura, cuando mantiene separación estricta de capas bajo carga, cuando preserva principios de TTL y uso único en handoffs, cuando consulta Elixir Core para todas las decisiones económicas y cuando registra eventos sin almacenar contenido prohibido.

El sistema resiste estrés cuando el Catálogo mantiene naturaleza pasiva, cuando el Chat mantiene función de orquestación pura, cuando el Edge valida handoffs estrictamente, cuando Elixir Core mantiene fuente única de verdad y cuando Nectar preserva integridad de valor.

## Frase canónica de estrés y abuso

El sistema mantiene integridad arquitectónica y principios innegociables bajo cualquier condición de estrés, rechazando transacciones que no pueden ser autorizadas correctamente sin comprometer separación de capas ni capacidad de auditoría.


# Elixir

## Qué Hace el Módulo

El módulo **Elixir** es la infraestructura financiera interna que gestiona saldo y transacciones. **Elixir NO gestiona servicios, gestiona saldo**. Su responsabilidad es exclusivamente financiera.

- Gestión de saldo y balance
- Procesamiento de transacciones financieras
- Manejo de pagos y facturación
- Registros contables y financieros
- APIs financieras para otros módulos
- **GESTIÓN DE SALDO, NO DE SERVICIOS**

## Modelo de Datos

Elixir Core implementa el modelo de datos que es la **fuente única de verdad financiera** del sistema. El modelo define las estructuras fundamentales para la gestión de saldo:

- **Wallet**: Billeteras con saldo (USER, MODEL, SYSTEM)
- **LedgerEntry**: Registro inmutable (append-only) de movimientos financieros
- **PaymentLink**: Enlaces de pago para modelos
- **Reservation**: Reservas temporales de saldo entre wallets

Para documentación completa del modelo de datos, ver: [`/docs/elixir-data-model.md`](../docs/elixir-data-model.md)

**El modelo de datos es la fuente única de verdad financiera** - todas las operaciones financieras deben reflejarse en las entidades del modelo.

## Contrato de Uso

Elixir Core está regido por un **Contrato de Uso** que define las reglas, permisos y restricciones que rigen todas las operaciones financieras.

El contrato establece:
- Roles y permisos (Usuario, Modelo, Sistema)
- Reglas de PaymentLink (creación, pago, expiración)
- Reglas de Wallet (ACTIVE / SUSPENDED)
- Reglas de Reservation (escrow)
- Reglas del Ledger (append-only)
- Qué NO hace Elixir (explícito)
- Principios finales inmutables

**El Contrato de Uso rige cualquier implementación futura de Elixir Core.** Todas las implementaciones deben cumplir estrictamente con las reglas definidas en el contrato.

Para documentación completa del Contrato de Uso, ver: [`/docs/elixir-usage-contract.md`](../docs/elixir-usage-contract.md)

**Principio fundamental**: "Elixir intermedia valor, no relaciones."

## Qué NO Hace

- No gestiona servicios (solo gestiona saldo)
- No gestiona la interfaz de usuario (eso es el frontend del Catálogo)
- No maneja comunicación con usuarios (eso es el Chat Gateway)
- No almacena el catálogo de modelos (eso es responsabilidad del backend del Catálogo)
- No procesa mensajes de chat directamente
- No rutea operaciones (eso es Chat)

## Módulos que Consume o Expone

### Consume
- Solicitudes de transacciones desde Chat Gateway
- Información de operaciones desde otros módulos

### Expone
- APIs financieras para procesamiento de pagos
- Información de saldo y balance
- Servicios de transacciones financieras
- **NO expone gestión de servicios, solo saldo**

## Qué Tipo de Cambios son Aceptables

- Cambios en la lógica de gestión de saldo
- Mejoras en el procesamiento de transacciones
- Optimizaciones de operaciones financieras
- Actualizaciones en APIs financieras
- Mejoras en registros contables
- **NO** cambios que gestionen servicios
- **NO** cambios que gestionen interfaz de usuario
- **NO** cambios que gestionen comunicación con usuarios
- **NO** cambios que gestionen catálogo de modelos

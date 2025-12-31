# Modelo de Datos de Elixir Core (v1)

## Principios Rectores de Elixir

**Elixir no gestiona servicios, gestiona saldo.**

Este principio fundamental define el alcance y responsabilidad de Elixir:

- Elixir es la fuente única de verdad financiera
- Su responsabilidad es exclusivamente la gestión de saldo y transacciones
- No gestiona servicios, catálogos, usuarios o comunicaciones
- Proporciona infraestructura financiera para otros módulos
- Mantiene integridad contable mediante ledger inmutable

## Arquitectura del Modelo

El modelo de datos de Elixir está compuesto por cuatro entidades principales:

1. **Wallet**: Representa una billetera con saldo
2. **LedgerEntry**: Registro inmutable de movimientos financieros
3. **PaymentLink**: Enlace de pago generado para modelos
4. **Reservation**: Reserva temporal de saldo entre wallets

## Entidades

### Wallet

**Propósito**: Representa una billetera que contiene saldo en Elixir.

**Campos**:

- `id` (uuid): Identificador único de la wallet
- `owner_type` (enum: USER | MODEL | SYSTEM): Tipo de propietario de la wallet
  - `USER`: Wallet perteneciente a un usuario
  - `MODEL`: Wallet perteneciente a un modelo
  - `SYSTEM`: Wallet del sistema
- `owner_id` (uuid): Identificador del propietario (usuario, modelo o sistema)
- `balance` (integer): Saldo disponible en la wallet (en unidades mínimas, ej: centavos)
- `balance_reserved` (integer): Saldo reservado que no está disponible para uso inmediato
- `status` (enum: ACTIVE | SUSPENDED): Estado de la wallet
  - `ACTIVE`: Wallet operativa
  - `SUSPENDED`: Wallet suspendida, no puede realizar operaciones
- `created_at` (timestamp): Fecha y hora de creación
- `updated_at` (timestamp): Fecha y hora de última actualización

**Características**:

- Cada wallet pertenece a un único owner (USER, MODEL o SYSTEM)
- El balance total disponible es `balance - balance_reserved`
- Las wallets pueden estar activas o suspendidas

**Qué NO existe**:

- No hay campos de descripción, motivo o concepto
- No hay relación directa con servicios
- No hay información de pagos externos
- No hay campos de configuración adicional

### LedgerEntry

**Propósito**: Registro inmutable (append-only) de todos los movimientos financieros en Elixir.

**Campos**:

- `id` (uuid): Identificador único de la entrada
- `wallet_id` (uuid): Wallet afectada por esta entrada
- `direction` (enum: CREDIT | DEBIT): Dirección del movimiento
  - `CREDIT`: Aumenta el saldo de la wallet
  - `DEBIT`: Disminuye el saldo de la wallet
- `amount` (integer): Monto del movimiento (en unidades mínimas)
- `type` (enum: FUNDING | TRANSFER | RESERVE | RELEASE | EXPIRE): Tipo de operación
  - `FUNDING`: Carga de saldo a una wallet
  - `TRANSFER`: Transferencia entre wallets
  - `RESERVE`: Reserva de saldo
  - `RELEASE`: Liberación de reserva
  - `EXPIRE`: Expiración de reserva o enlace de pago
- `related_wallet_id` (uuid, nullable): Wallet relacionada en la operación (para transferencias, reservas, etc.)
- `reference_id` (uuid, nullable): Identificador de referencia externa (puede referenciar PaymentLink, Reservation, etc.)
- `created_at` (timestamp): Fecha y hora de creación (inmutable)

**Regla Append-Only**:

- Las entradas del ledger **NO se pueden modificar**
- Las entradas del ledger **NO se pueden eliminar**
- Cada movimiento financiero genera una entrada permanente
- El ledger es la fuente de verdad histórica

**Características**:

- Todas las operaciones financieras deben reflejarse en el ledger
- El ledger permite auditoría completa de movimientos
- Las entradas son inmutables para garantizar integridad contable

**Qué NO existe**:

- No hay campos de descripción o concepto
- No hay métodos de actualización o eliminación
- No hay campos de reversión o cancelación (se maneja con nuevas entradas)
- No hay información de servicios asociados

### PaymentLink

**Propósito**: Representa un enlace de pago generado para que un modelo reciba fondos.

**Campos**:

- `id` (uuid): Identificador único del enlace de pago
- `model_wallet_id` (uuid): Wallet del modelo que recibirá el pago
- `amount` (integer): Monto del pago esperado (en unidades mínimas)
- `status` (enum: PENDING | PAID | EXPIRED | CANCELLED): Estado del enlace
  - `PENDING`: Enlace activo, esperando pago
  - `PAID`: Pago completado
  - `EXPIRED`: Enlace expirado
  - `CANCELLED`: Enlace cancelado
- `expires_at` (timestamp, nullable): Fecha y hora de expiración (null si no expira)
- `created_at` (timestamp): Fecha y hora de creación

**Características**:

- Cada enlace está asociado a una wallet de modelo
- Los enlaces pueden tener expiración opcional
- El estado del enlace refleja su ciclo de vida

**Qué NO existe**:

- No hay campos de descripción o concepto del servicio
- No hay información de quién realiza el pago (se maneja externamente)
- No hay campos de método de pago
- No hay integración directa con sistemas de pago externos

### Reservation

**Propósito**: Representa una reserva temporal de saldo de una wallet hacia otra.

**Campos**:

- `id` (uuid): Identificador único de la reserva
- `from_wallet_id` (uuid): Wallet de origen (de donde se reserva el saldo)
- `to_wallet_id` (uuid): Wallet de destino (hacia donde se reserva)
- `amount` (integer): Monto reservado (en unidades mínimas)
- `status` (enum: ACTIVE | RELEASED | CANCELLED | EXPIRED): Estado de la reserva
  - `ACTIVE`: Reserva activa, saldo bloqueado
  - `RELEASED`: Reserva liberada, saldo transferido o devuelto
  - `CANCELLED`: Reserva cancelada, saldo devuelto
  - `EXPIRED`: Reserva expirada, saldo devuelto
- `created_at` (timestamp): Fecha y hora de creación
- `expires_at` (timestamp, nullable): Fecha y hora de expiración (null si no expira)

**Características**:

- Las reservas bloquean saldo de la wallet de origen
- El saldo reservado se refleja en `balance_reserved` de la wallet de origen
- Las reservas pueden expirar automáticamente
- El estado de la reserva determina el destino del saldo

**Qué NO existe**:

- No hay campos de descripción o motivo de la reserva
- No hay información del servicio asociado
- No hay campos de concepto o referencia de negocio
- No hay métodos de actualización directa (se maneja mediante cambios de estado)

## Eventos Permitidos

### Sobre Wallets

- Crear wallet para un owner (USER, MODEL o SYSTEM)
- Actualizar balance y balance_reserved
- Cambiar status (ACTIVE ↔ SUSPENDED)
- Actualizar timestamp updated_at

### Sobre LedgerEntry

- Crear nueva entrada (append-only)
- **NO** actualizar entradas existentes
- **NO** eliminar entradas existentes
- Consultar entradas históricas

### Sobre PaymentLink

- Crear enlace de pago
- Actualizar status (PENDING → PAID | EXPIRED | CANCELLED)
- Consultar estado del enlace

### Sobre Reservation

- Crear reserva
- Actualizar status (ACTIVE → RELEASED | CANCELLED | EXPIRED)
- Consultar estado de la reserva

## Qué NO Existe Explícitamente

El modelo de datos de Elixir **NO incluye**:

- **Servicios**: No hay entidad Service, Product, o similar
- **Usuarios**: No hay entidad User (se referencia por owner_id)
- **Modelos**: No hay entidad Model (se referencia por owner_id)
- **Transacciones de pago externo**: No hay integración directa con pasarelas de pago
- **Facturación**: No hay entidades Invoice, Bill, etc.
- **Conceptos o motivos**: No hay campos de descripción, motivo, concepto o servicio
- **Historial de servicios**: No hay relación con servicios prestados
- **Configuraciones de wallet**: No hay campos de configuración adicional
- **Métodos de pago**: No hay información de tarjetas, cuentas bancarias, etc.
- **Notificaciones**: No hay entidades de notificación o alertas

**Elixir gestiona saldo, no servicios.**

## Ejemplos Conceptuales

### Ejemplo 1: Creación de Wallet de Modelo

Un modelo se registra en el sistema y se crea su wallet:
- `owner_type`: MODEL
- `owner_id`: uuid del modelo
- `balance`: 0
- `balance_reserved`: 0
- `status`: ACTIVE

### Ejemplo 2: Generación de PaymentLink

Un modelo genera un enlace de pago por 100 unidades:
- Se crea un PaymentLink con `amount`: 100
- `model_wallet_id`: wallet del modelo
- `status`: PENDING
- `expires_at`: fecha futura (opcional)

Cuando se completa el pago:
- El PaymentLink cambia a `status`: PAID
- Se crea una LedgerEntry de tipo FUNDING con dirección CREDIT
- La wallet del modelo incrementa su `balance`

### Ejemplo 3: Reserva de Saldo

Se crea una reserva de 50 unidades de la wallet A hacia la wallet B:
- Se crea una Reservation con `amount`: 50
- `from_wallet_id`: wallet A
- `to_wallet_id`: wallet B
- `status`: ACTIVE
- La wallet A incrementa su `balance_reserved` en 50
- Se crea una LedgerEntry de tipo RESERVE con dirección DEBIT en wallet A

Cuando se libera la reserva:
- La Reservation cambia a `status`: RELEASED
- La wallet A disminuye su `balance_reserved` en 50
- La wallet B incrementa su `balance` en 50
- Se crean LedgerEntry correspondientes

### Ejemplo 4: Transferencia entre Wallets

Una wallet USER transfiere 200 unidades a una wallet MODEL:
- Se crea una LedgerEntry de tipo TRANSFER con dirección DEBIT en wallet USER
- Se crea una LedgerEntry de tipo TRANSFER con dirección CREDIT en wallet MODEL
- La wallet USER disminuye su `balance` en 200
- La wallet MODEL incrementa su `balance` en 200
- Ambas entradas tienen `related_wallet_id` apuntando a la otra wallet

## Integridad y Consistencia

- El balance de una wallet debe ser igual a la suma de entradas CREDIT menos la suma de entradas DEBIT en el ledger
- Las reservas activas deben reflejarse en `balance_reserved`
- Las entradas del ledger son inmutables (append-only)
- Cada operación financiera debe generar al menos una entrada en el ledger

## Notas de Implementación

- Los modelos son estructuras de datos puras, sin lógica de negocio
- No hay validaciones complejas en el modelo
- No hay persistencia real implementada
- Los tipos enum deben ser respetados estrictamente
- Los timestamps deben ser manejados como Date objects
- Los UUIDs deben ser strings válidos


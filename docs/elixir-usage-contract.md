# Contrato de Uso de Elixir Core (v1)

## Alcance del Contrato

Este contrato define las reglas, permisos y restricciones que rigen el uso de Elixir Core. **Elixir intermedia valor, no relaciones.**

El contrato aplica a:
- Todas las implementaciones de Elixir Core
- Todas las integraciones con Elixir
- Todas las operaciones financieras gestionadas por Elixir
- Todos los módulos que consumen APIs de Elixir

Este contrato es **normativo** y **inmutable** para la versión 1 de Elixir Core. Cualquier implementación futura debe cumplir estrictamente con estas reglas.

## Principio Fundamental

**Elixir intermedia valor, no relaciones.**

Este principio establece que:
- Elixir gestiona el movimiento de valor (saldo, transacciones)
- Elixir NO gestiona relaciones entre entidades de negocio
- Elixir NO interpreta el significado de las transacciones
- Elixir NO valida motivos, conceptos o servicios
- Elixir es un intermediario de valor puro

## Roles y Permisos

### Usuario (USER)

**Definición**: Entidad externa que posee una wallet de tipo USER.

**Permisos**:
- Crear wallet de tipo USER
- Consultar balance de su propia wallet
- Realizar transferencias desde su wallet hacia otras wallets
- Generar PaymentLinks para recibir pagos (si aplica)
- Consultar historial de transacciones de su wallet

**Restricciones**:
- No puede modificar entradas del ledger
- No puede crear wallets de otros tipos (MODEL, SYSTEM)
- No puede suspender o activar wallets
- No puede modificar balance directamente (solo mediante transacciones)

### Modelo (MODEL)

**Definición**: Entidad externa que posee una wallet de tipo MODEL.

**Permisos**:
- Crear wallet de tipo MODEL
- Consultar balance de su propia wallet
- Generar PaymentLinks para recibir pagos
- Consultar estado de sus PaymentLinks
- Consultar historial de transacciones de su wallet

**Restricciones**:
- No puede modificar entradas del ledger
- No puede crear wallets de otros tipos (USER, SYSTEM)
- No puede suspender o activar wallets
- No puede modificar balance directamente (solo mediante transacciones)
- No puede crear PaymentLinks para otros modelos

### Sistema (SYSTEM)

**Definición**: Entidad interna del sistema que posee una wallet de tipo SYSTEM.

**Permisos**:
- Crear wallet de tipo SYSTEM
- Consultar balance de wallets SYSTEM
- Realizar operaciones de sistema (funding, ajustes)
- Suspender y activar wallets (solo wallets SYSTEM o mediante procesos autorizados)
- Consultar historial completo del ledger

**Restricciones**:
- No puede modificar entradas del ledger existentes (append-only)
- No puede eliminar entradas del ledger
- No puede crear wallets de otros tipos sin autorización
- Debe seguir reglas estrictas de auditoría

## Reglas de PaymentLink

### Creación de PaymentLink

**Reglas**:
- Solo wallets de tipo MODEL pueden generar PaymentLinks
- El `amount` debe ser un entero positivo
- El `model_wallet_id` debe corresponder a una wallet MODEL existente y ACTIVE
- El `status` inicial es siempre PENDING
- El `expires_at` es opcional (nullable)
- Si `expires_at` es null, el PaymentLink no expira automáticamente

**Validaciones**:
- La wallet MODEL debe existir y estar ACTIVE
- El amount debe ser mayor que 0
- Si `expires_at` está presente, debe ser una fecha futura

**Restricciones**:
- No se puede crear PaymentLink con amount = 0
- No se puede crear PaymentLink para wallets SUSPENDED
- No se puede crear PaymentLink para wallets de tipo USER o SYSTEM

### Pago de PaymentLink

**Reglas**:
- Un PaymentLink en estado PENDING puede cambiar a PAID
- El cambio a PAID es irreversible
- Al cambiar a PAID, se debe crear una LedgerEntry de tipo FUNDING con dirección CREDIT
- La wallet MODEL asociada incrementa su `balance` en el `amount` del PaymentLink
- El PaymentLink debe referenciarse en el `reference_id` de la LedgerEntry

**Validaciones**:
- El PaymentLink debe estar en estado PENDING
- El PaymentLink no debe estar expirado (si tiene `expires_at`)
- La wallet MODEL debe existir y estar ACTIVE

**Restricciones**:
- No se puede pagar un PaymentLink que ya está PAID
- No se puede pagar un PaymentLink EXPIRED o CANCELLED
- No se puede revertir un pago (una vez PAID, permanece PAID)

### Expiración de PaymentLink

**Reglas**:
- Un PaymentLink en estado PENDING puede cambiar a EXPIRED
- La expiración puede ser automática (si `expires_at` está presente y se alcanza la fecha)
- La expiración puede ser manual (cambio de estado explícito)
- Un PaymentLink EXPIRED no puede volver a PENDING
- Un PaymentLink EXPIRED no puede ser pagado

**Validaciones**:
- Solo PaymentLinks en estado PENDING pueden expirar
- Si `expires_at` es null, la expiración debe ser manual

**Restricciones**:
- No se puede expirar un PaymentLink que ya está PAID
- No se puede expirar un PaymentLink que ya está CANCELLED
- No se puede revertir la expiración

### Cancelación de PaymentLink

**Reglas**:
- Un PaymentLink en estado PENDING puede cambiar a CANCELLED
- La cancelación es manual (no automática)
- Un PaymentLink CANCELLED no puede volver a PENDING
- Un PaymentLink CANCELLED no puede ser pagado

**Validaciones**:
- Solo PaymentLinks en estado PENDING pueden ser cancelados

**Restricciones**:
- No se puede cancelar un PaymentLink que ya está PAID
- No se puede cancelar un PaymentLink que ya está EXPIRED
- No se puede revertir la cancelación

## Reglas de Wallet

### Estado ACTIVE

**Definición**: Wallet operativa que puede realizar todas las operaciones permitidas.

**Permisos**:
- Realizar transferencias
- Generar PaymentLinks (si es MODEL)
- Crear reservas
- Recibir fondos
- Consultar balance

**Restricciones**:
- No hay restricciones operativas adicionales (solo las del rol)

### Estado SUSPENDED

**Definición**: Wallet suspendida que no puede realizar operaciones.

**Restricciones**:
- No puede realizar transferencias salientes
- No puede generar PaymentLinks
- No puede crear nuevas reservas
- Puede recibir fondos (para permitir reversiones)
- Puede consultar balance (solo lectura)

**Cambio de Estado**:
- Solo wallets SYSTEM o procesos autorizados pueden suspender wallets
- Una wallet SUSPENDED puede volver a ACTIVE mediante proceso autorizado
- El cambio de estado debe registrarse (pero no genera LedgerEntry)

**Validaciones**:
- No se puede realizar operaciones desde wallets SUSPENDED
- No se puede generar PaymentLink para wallets SUSPENDED

## Reglas de Reservation (Escrow)

### Creación de Reservation

**Reglas**:
- Una Reservation representa un escrow (depósito en garantía)
- El `from_wallet_id` es la wallet que reserva el saldo
- El `to_wallet_id` es la wallet destinataria del escrow
- El `amount` debe ser un entero positivo
- El `status` inicial es siempre ACTIVE
- Al crear una Reservation ACTIVE:
  - La wallet `from_wallet_id` incrementa su `balance_reserved` en `amount`
  - Se crea una LedgerEntry de tipo RESERVE con dirección DEBIT en `from_wallet_id`
  - El `balance` disponible de `from_wallet_id` disminuye efectivamente

**Validaciones**:
- Ambas wallets deben existir y estar ACTIVE
- El `amount` debe ser mayor que 0
- La wallet `from_wallet_id` debe tener `balance` suficiente (balance - balance_reserved >= amount)
- Si `expires_at` está presente, debe ser una fecha futura

**Restricciones**:
- No se puede crear Reservation con amount = 0
- No se puede crear Reservation desde wallets SUSPENDED
- No se puede crear Reservation hacia wallets SUSPENDED
- No se puede crear Reservation si no hay saldo disponible suficiente

### Liberación de Reservation (RELEASED)

**Reglas**:
- Una Reservation ACTIVE puede cambiar a RELEASED
- Al cambiar a RELEASED:
  - La wallet `from_wallet_id` disminuye su `balance_reserved` en `amount`
  - La wallet `to_wallet_id` incrementa su `balance` en `amount`
  - Se crea una LedgerEntry de tipo RELEASE con dirección DEBIT en `from_wallet_id`
  - Se crea una LedgerEntry de tipo RELEASE con dirección CREDIT en `to_wallet_id`
  - Ambas entradas deben tener `related_wallet_id` apuntando a la otra wallet

**Validaciones**:
- La Reservation debe estar en estado ACTIVE
- Ambas wallets deben existir y estar ACTIVE

**Restricciones**:
- No se puede liberar una Reservation que no está ACTIVE
- No se puede revertir una liberación (una vez RELEASED, permanece RELEASED)

### Cancelación de Reservation (CANCELLED)

**Reglas**:
- Una Reservation ACTIVE puede cambiar a CANCELLED
- Al cambiar a CANCELLED:
  - La wallet `from_wallet_id` disminuye su `balance_reserved` en `amount`
  - La wallet `from_wallet_id` recupera su `balance` disponible (balance_reserved disminuye)
  - Se crea una LedgerEntry de tipo RELEASE con dirección CREDIT en `from_wallet_id` (reversión)
  - El saldo vuelve a estar disponible en `from_wallet_id`

**Validaciones**:
- La Reservation debe estar en estado ACTIVE

**Restricciones**:
- No se puede cancelar una Reservation que no está ACTIVE
- No se puede revertir una cancelación

### Expiración de Reservation (EXPIRED)

**Reglas**:
- Una Reservation ACTIVE puede cambiar a EXPIRED
- La expiración puede ser automática (si `expires_at` está presente y se alcanza la fecha)
- La expiración puede ser manual (cambio de estado explícito)
- Al cambiar a EXPIRED, se aplican las mismas reglas que CANCELLED:
  - La wallet `from_wallet_id` disminuye su `balance_reserved` en `amount`
  - Se crea una LedgerEntry de tipo EXPIRE con dirección CREDIT en `from_wallet_id`
  - El saldo vuelve a estar disponible en `from_wallet_id`

**Validaciones**:
- La Reservation debe estar en estado ACTIVE
- Si `expires_at` es null, la expiración debe ser manual

**Restricciones**:
- No se puede expirar una Reservation que no está ACTIVE
- No se puede revertir la expiración

## Reglas del Ledger (Append-Only)

### Principio Append-Only

**Regla Fundamental**: El ledger es **inmutable** y **append-only**.

**Implicaciones**:
- Las entradas del ledger **NO se pueden modificar**
- Las entradas del ledger **NO se pueden eliminar**
- Solo se pueden **agregar** nuevas entradas
- Cada operación financiera genera una o más entradas nuevas

### Creación de LedgerEntry

**Reglas**:
- Cada movimiento financiero debe generar al menos una LedgerEntry
- Las LedgerEntry deben ser consistentes con el estado de las wallets
- El `created_at` es inmutable (se establece al crear)
- El `direction` debe ser consistente con el tipo de operación:
  - CREDIT aumenta el balance
  - DEBIT disminuye el balance

**Validaciones**:
- El `wallet_id` debe corresponder a una wallet existente
- El `amount` debe ser un entero positivo
- El `type` debe ser uno de los valores permitidos
- Si `related_wallet_id` está presente, debe corresponder a una wallet existente

**Restricciones**:
- No se puede crear LedgerEntry con amount = 0
- No se puede crear LedgerEntry para wallets que no existen
- No se puede modificar `created_at` después de la creación

### Integridad Contable

**Reglas**:
- El `balance` de una wallet debe ser igual a:
  - Suma de todas las entradas CREDIT
  - Menos la suma de todas las entradas DEBIT
  - Para esa wallet específica
- El `balance_reserved` debe reflejar todas las Reservation ACTIVE de la wallet
- Las operaciones deben mantener la integridad contable en todo momento

**Validaciones**:
- Cada operación debe verificar la integridad antes de completarse
- Las operaciones que rompan la integridad deben ser rechazadas

**Restricciones**:
- No se pueden realizar operaciones que rompan la integridad contable
- No se pueden crear LedgerEntry que no correspondan a operaciones válidas

## Qué NO Hace Elixir

Elixir **NO realiza** las siguientes acciones:

### Gestión de Servicios
- No gestiona catálogos de servicios
- No valida si un servicio existe
- No verifica disponibilidad de servicios
- No gestiona relaciones entre servicios y pagos

### Gestión de Relaciones
- No gestiona relaciones entre usuarios y modelos
- No valida permisos de acceso a servicios
- No gestiona contratos o acuerdos
- No interpreta el significado de las transacciones

### Validación de Motivos
- No valida el motivo de una transacción
- No requiere descripción o concepto
- No valida si una transacción corresponde a un servicio
- No asocia transacciones con servicios específicos

### Integración con Pasarelas de Pago
- No integra directamente con pasarelas de pago externas
- No procesa tarjetas de crédito
- No gestiona métodos de pago
- No valida autenticación de pagos externos

### Gestión de Usuarios
- No gestiona autenticación de usuarios
- No gestiona autorización de usuarios
- No valida identidad de usuarios
- No gestiona perfiles de usuarios

### Notificaciones
- No envía notificaciones a usuarios
- No gestiona alertas o recordatorios
- No notifica cambios de estado

### Reportes de Negocio
- No genera reportes de servicios prestados
- No calcula métricas de negocio
- No analiza patrones de uso de servicios

**Elixir intermedia valor, no relaciones.**

## Principios Finales Inmutables

### 1. Elixir Gestiona Saldo, No Servicios

**Inmutable**: Elixir gestiona exclusivamente saldo y transacciones financieras. No gestiona servicios, catálogos, usuarios o relaciones de negocio.

### 2. Elixir Intermedia Valor, No Relaciones

**Inmutable**: Elixir es un intermediario de valor puro. No interpreta, valida o gestiona relaciones entre entidades de negocio.

### 3. Ledger Append-Only

**Inmutable**: El ledger es inmutable y append-only. Las entradas no se pueden modificar ni eliminar. Esta regla es fundamental para la integridad contable.

### 4. Wallet como Fuente de Verdad

**Inmutable**: El balance de una wallet es la fuente de verdad financiera. Debe ser consistente con el ledger en todo momento.

### 5. Reservation como Escrow

**Inmutable**: Las Reservation representan escrow (depósito en garantía). El saldo reservado no está disponible hasta que se libera o cancela.

### 6. PaymentLink Solo para MODEL

**Inmutable**: Solo las wallets de tipo MODEL pueden generar PaymentLinks. Esta restricción es fundamental del modelo.

### 7. Estados Inmutables de Transición

**Inmutable**: Los estados de PaymentLink y Reservation tienen transiciones inmutables. Una vez que cambian a un estado final (PAID, EXPIRED, CANCELLED, RELEASED), no pueden revertirse.

### 8. Sin Validación de Motivo

**Inmutable**: Elixir no valida, requiere o almacena motivos, conceptos o descripciones de transacciones. Elixir intermedia valor puro.

## Cumplimiento del Contrato

Todas las implementaciones de Elixir Core deben:
- Cumplir estrictamente con todas las reglas definidas en este contrato
- Validar todas las operaciones según las reglas establecidas
- Mantener la integridad contable en todo momento
- Respetar los principios inmutables
- Documentar cualquier desviación o extensión del contrato

Este contrato es la **fuente única de verdad** para el uso de Elixir Core (v1).


# Estrategia de Particionamiento de Datos

## Objetivo
Implementar particionamiento horizontal de datos para mejorar el rendimiento y escalabilidad de las bases de datos.

## Estrategias por Tipo de Datos

### 1. Particionamiento por Usuario (User Sharding)
**Aplicación**: Tablas de sesiones, historial de chat, decisiones

**Método**: Hash del `userId` o `sessionId`
- **Shards**: 8 shards iniciales
- **Función**: `hash(userId) % 8`
- **Ventajas**: Distribución uniforme, fácil de escalar

**Implementación**:
```sql
-- Ejemplo de partición por hash
CREATE TABLE decisions_0 PARTITION OF decisions 
  FOR VALUES WITH (modulus 8, remainder 0);
CREATE TABLE decisions_1 PARTITION OF decisions 
  FOR VALUES WITH (modulus 8, remainder 1);
-- ... hasta decisions_7
```

### 2. Particionamiento por Tiempo (Time-based Partitioning)
**Aplicación**: Logs de auditoría, métricas, eventos

**Método**: Partición mensual o semanal
- **Retención**: 12 meses activos, archivo histórico
- **Ventajas**: Facilita limpieza, consultas más rápidas

**Implementación**:
```sql
-- Partición mensual
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 3. Particionamiento por Canal (Channel Sharding)
**Aplicación**: Mensajes de WhatsApp, datos de canal

**Método**: Sharding por `channelId`
- **Shards**: 4 shards por canal principal
- **Ventajas**: Aislamiento por canal, fácil mantenimiento

### 4. Particionamiento Geográfico (Geographic Sharding)
**Aplicación**: Datos de usuarios por región

**Método**: Sharding por código de país o región
- **Shards**: Por región (LATAM, NA, EU, etc.)
- **Ventajas**: Baja latencia, cumplimiento de datos

## Configuración de Sharding

### PostgreSQL con pg_shard (o Citus)
```sql
-- Habilitar extensión
CREATE EXTENSION citus;

-- Crear tabla distribuida
SELECT create_distributed_table('decisions', 'user_id');
SELECT create_distributed_table('sessions', 'user_id');
```

### MongoDB Sharding
```javascript
// Habilitar sharding en base de datos
sh.enableSharding("elixir");

// Crear índice de sharding
sh.shardCollection("elixir.decisions", { "userId": 1 });

// Configurar chunks
sh.setBalancerState(true);
```

## Plan de Migración

### Fase 1: Preparación (Semana 1-2)
- [ ] Análisis de datos y patrones de acceso
- [ ] Selección de estrategia de particionamiento
- [ ] Configuración de entorno de pruebas

### Fase 2: Implementación (Semana 3-4)
- [ ] Crear tablas particionadas
- [ ] Migrar datos existentes
- [ ] Actualizar aplicaciones para usar sharding

### Fase 3: Validación (Semana 5)
- [ ] Pruebas de rendimiento
- [ ] Verificación de integridad de datos
- [ ] Monitoreo de rendimiento

### Fase 4: Producción (Semana 6)
- [ ] Despliegue gradual
- [ ] Monitoreo continuo
- [ ] Ajustes de rendimiento

## Monitoreo

### Métricas Clave
- Distribución de datos por shard
- Latencia de consultas por shard
- Uso de recursos por shard
- Balanceo de carga entre shards

### Alertas
- Desbalance > 20% entre shards
- Latencia p95 > 500ms
- Uso de CPU > 80% en cualquier shard


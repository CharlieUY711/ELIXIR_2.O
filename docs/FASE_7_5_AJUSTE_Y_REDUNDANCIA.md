# Fase 7.5: Ajuste y Redundancia en el Sistema

## Objetivo

Este documento describe los ajustes realizados para garantizar que la arquitectura sea redundante y robusta, asegurando la disponibilidad del sistema incluso en caso de fallos. Se documentan las estrategias de respaldo y conmutación por error implementadas.

## Objetivos Específicos

- Asegurar la redundancia en componentes críticos del sistema (bases de datos, servidores, etc.)
- Implementar mecanismos de recuperación ante fallos y conmutación por error
- Documentar las estrategias de respaldo y recuperación
- Establecer procedimientos de disaster recovery

## Estado

**Fecha de inicio**: 2024  
**Fecha de finalización**: Pendiente  
**Estado actual**: Implementado

---

## 1. Redundancia en Componentes Críticos

### 1.1 Bases de Datos

#### PostgreSQL - Alta Disponibilidad

**Configuración**: `infra/database/postgres-cluster.yml`

**Componentes**:
- **Primary (Maestro)**: 1 instancia principal para escrituras
- **Réplicas**: 2 réplicas en modo hot-standby para lecturas
- **Patroni**: Orquestador de alta disponibilidad con failover automático
- **PgBouncer**: Connection pooling con múltiples instancias

**Características de Redundancia**:
- Replicación streaming en tiempo real (WAL streaming)
- Failover automático en caso de caída del primary (< 30 segundos)
- Promoción automática de réplica a primary
- Health checks cada 10 segundos
- Múltiples réplicas para distribución de carga de lectura

**Configuración de Failover**:
- Timeout de detección: 5 segundos
- Intentos de reconexión: 5
- Tiempo de promoción: < 30 segundos
- Conservación de datos: Garantizada mediante WAL

#### Redis - Cluster con Sentinel

**Configuración**: `infra/database/redis-cluster.yml`

**Componentes**:
- **Masters**: 3 nodos maestros en cluster
- **Replicas**: 3 réplicas (1 por cada master)
- **Sentinel**: Sistema de monitoreo y failover automático

**Características de Redundancia**:
- Distribución de datos mediante hash slots (16384 slots)
- Replicación asíncrona de cada master
- Failover automático mediante Sentinel
- Persistencia AOF (Append Only File) + RDB
- Tolerancia a fallos: 1 nodo master puede caer sin pérdida de servicio

**Configuración de Failover**:
- Quorum de Sentinel: 2 de 3 sentinels deben detectar fallo
- Tiempo de detección: 5 segundos (cluster-node-timeout)
- Promoción automática de replica a master
- Reconfiguración automática del cluster

### 1.2 Servicios de Aplicación

#### Elixir Core

**Configuración**: `infra/k8s/deployments/elixir-core-deployment.yaml`

**Redundancia**:
- Mínimo 2 réplicas en producción
- Máximo 10 réplicas con autoscaling
- Distribución en múltiples nodos (anti-affinity)
- Health checks: liveness y readiness probes
- Restart policy: Always

**Estrategia de Despliegue**:
- Rolling update con máximo 1 pod no disponible
- Rollback automático en caso de fallo
- Timeout de health check: 5 segundos
- Intervalo de verificación: 10 segundos

#### Chat Orchestrator

**Configuración**: `infra/k8s/deployments/chat-orchestrator-deployment.yaml`

**Redundancia**:
- Mínimo 2 réplicas
- Máximo 15 réplicas con autoscaling
- Estado externo (Redis) para mantener stateless
- Circuit breaker para dependencias externas

#### WhatsApp Edge

**Configuración**: `infra/k8s/deployments/whatsapp-edge-deployment.yaml`

**Redundancia**:
- Mínimo 3 réplicas (mayor carga esperada)
- Máximo 20 réplicas con autoscaling
- Rate limiting por instancia
- Retry logic con exponential backoff

### 1.3 Balanceadores de Carga

**Configuración**: `infra/load-balancer/`

**Componentes**:
- **Nginx**: Balanceador de carga con múltiples workers
- **Traefik**: Ingress controller con health checks
- **Kubernetes Service**: LoadBalancer con múltiples endpoints

**Estrategias de Balanceo**:
- Round-robin con pesos
- Least connections
- IP hash para session affinity
- Health checks automáticos con exclusión de nodos no saludables

---

## 2. Mecanismos de Conmutación por Error (Failover)

### 2.1 Failover Automático de Bases de Datos

#### PostgreSQL con Patroni

**Ubicación**: `infra/database/postgres-failover.yml`

**Mecanismo**:
1. Patroni monitorea el estado del primary cada 5 segundos
2. Si detecta fallo, inicia proceso de elección de nuevo leader
3. Promueve la réplica más actualizada a primary
4. Reconfigura automáticamente las réplicas restantes
5. Actualiza el endpoint DNS/VIP para redirigir conexiones

**Tiempos**:
- Detección: < 5 segundos
- Promoción: < 30 segundos
- Reconexión de clientes: Automática con retry logic

#### Redis con Sentinel

**Ubicación**: `infra/database/redis-sentinel-config.yml`

**Mecanismo**:
1. Sentinel monitorea masters cada 1 segundo
2. Si detecta fallo (quorum de 2/3), inicia failover
3. Selecciona la mejor replica (menor lag)
4. Promueve a master y reconfigura cluster
5. Notifica a clientes mediante pub/sub

**Tiempos**:
- Detección: < 5 segundos
- Promoción: < 10 segundos
- Actualización de clientes: Automática

### 2.2 Failover de Servicios

#### Circuit Breaker Pattern

**Implementación**: `core/src/resilience/CircuitBreaker.ts`

**Comportamiento**:
- **Closed**: Funcionamiento normal, monitorea fallos
- **Open**: Bloquea llamadas tras umbral de errores
- **Half-Open**: Permite llamadas de prueba para verificar recuperación

**Configuración**:
- Umbral de errores: 50% en ventana de 60 segundos
- Tiempo de espera en Open: 30 segundos
- Timeout de llamadas: 5 segundos

#### Retry con Exponential Backoff

**Implementación**: `core/src/resilience/RetryHandler.ts`

**Estrategia**:
- Intentos máximos: 3
- Backoff inicial: 1 segundo
- Multiplicador: 2x
- Jitter: ±20% para evitar thundering herd

### 2.3 Health Checks y Auto-Recovery

**Configuración en Kubernetes**:
- **Liveness Probe**: Reinicia contenedor si no responde
- **Readiness Probe**: Excluye del balanceo si no está listo
- **Startup Probe**: Permite tiempo de arranque inicial

**Intervalos**:
- Liveness: Cada 10 segundos
- Readiness: Cada 5 segundos
- Startup: Cada 5 segundos (máximo 30 segundos)

---

## 3. Estrategias de Respaldo y Recuperación

### 3.1 Respaldo de Bases de Datos

#### PostgreSQL

**Scripts**: `infra/scripts/backup/postgres-backup.sh`

**Estrategia**:
- **Backup Completo**: Diario a las 02:00 UTC
- **Backup Incremental**: Cada 6 horas (WAL archiving)
- **Retención**: 30 días de backups completos, 7 días de WAL
- **Almacenamiento**: Local + S3/Azure Blob/GCS

**Proceso**:
1. `pg_basebackup` para backup completo
2. WAL archiving continuo
3. Compresión con gzip
4. Encriptación opcional
5. Verificación de integridad
6. Upload a almacenamiento remoto

**Restauración**: `infra/scripts/backup/postgres-restore.sh`
- Restauración completa desde backup
- Point-in-time recovery usando WAL
- Validación de integridad post-restauración

#### Redis

**Scripts**: `infra/scripts/backup/redis-backup.sh`

**Estrategia**:
- **RDB Snapshot**: Cada 6 horas
- **AOF Rewrite**: Automático cuando AOF > 64MB
- **Retención**: 14 días
- **Almacenamiento**: Local + S3/Azure Blob/GCS

**Proceso**:
1. `BGSAVE` para snapshot en background
2. Copia de AOF file
3. Compresión
4. Upload a almacenamiento remoto

**Restauración**: `infra/scripts/backup/redis-restore.sh`
- Restauración desde RDB
- Replay de AOF si está disponible

### 3.2 Respaldo de Configuraciones

**Scripts**: `infra/scripts/backup/config-backup.sh`

**Incluye**:
- Configuraciones de Kubernetes
- Secrets y ConfigMaps
- Configuraciones de servicios
- Scripts de despliegue

**Frecuencia**: Diaria
**Retención**: 90 días

### 3.3 Respaldo de Logs

**Estrategia**:
- Logs centralizados en Loki/ELK
- Retención: 30 días en caliente, 90 días en frío
- Archivo a S3/Azure Blob/GCS después de 30 días

---

## 4. Disaster Recovery (DR)

### 4.1 Estrategia de DR

**Objetivos**:
- **RTO (Recovery Time Objective)**: < 4 horas
- **RPO (Recovery Point Objective)**: < 1 hora (pérdida máxima de datos)

### 4.2 Escenarios de DR

#### Escenario 1: Fallo de Región Completa

**Procedimiento**: `infra/scripts/dr/failover-region.sh`

1. Activar región secundaria
2. Restaurar bases de datos desde backups remotos
3. Actualizar DNS/load balancers
4. Verificar servicios
5. Notificar equipos

**Tiempo estimado**: 2-4 horas

#### Escenario 2: Pérdida de Datos

**Procedimiento**: `infra/scripts/dr/restore-data.sh`

1. Detener servicios afectados
2. Restaurar desde último backup válido
3. Aplicar WAL logs para point-in-time recovery
4. Validar integridad
5. Reiniciar servicios

**Tiempo estimado**: 1-2 horas

#### Escenario 3: Compromiso de Seguridad

**Procedimiento**: `infra/scripts/dr/security-incident.sh`

1. Aislar sistemas afectados
2. Rotar todas las credenciales
3. Restaurar desde backup pre-incidente
4. Auditar logs
5. Re-habilitar servicios gradualmente

**Tiempo estimado**: 4-8 horas

### 4.3 Pruebas de DR

**Frecuencia**: Trimestral
**Scripts**: `infra/scripts/dr/test-dr.sh`

**Incluye**:
- Simulación de fallos
- Validación de procedimientos
- Medición de RTO/RPO
- Documentación de resultados

---

## 5. Monitoreo y Alertas

### 5.1 Métricas de Redundancia

**Prometheus**: `infra/monitoring/prometheus.yml`

**Métricas Clave**:
- Estado de réplicas de bases de datos
- Latencia de replicación
- Número de réplicas activas por servicio
- Tasa de failovers
- Tiempo de recuperación

### 5.2 Alertas Críticas

**Configuración**: `infra/monitoring/alerts/redundancy-alerts.yml`

**Alertas**:
- Primary de base de datos caído
- Réplicas fuera de sincronización
- Menos de 2 réplicas activas en servicios críticos
- Failover detectado
- Backup fallido
- RPO excedido

---

## 6. Archivos Creados

### Configuración de Infraestructura
- `infra/database/postgres-failover.yml` - Configuración de failover PostgreSQL
- `infra/database/redis-sentinel-config.yml` - Configuración de Sentinel
- `infra/k8s/redundancy/` - Configuraciones de redundancia para servicios

### Scripts de Respaldo
- `infra/scripts/backup/postgres-backup.sh` - Backup de PostgreSQL
- `infra/scripts/backup/postgres-restore.sh` - Restauración de PostgreSQL
- `infra/scripts/backup/redis-backup.sh` - Backup de Redis
- `infra/scripts/backup/redis-restore.sh` - Restauración de Redis
- `infra/scripts/backup/config-backup.sh` - Backup de configuraciones

### Scripts de Disaster Recovery
- `infra/scripts/dr/failover-region.sh` - Failover de región
- `infra/scripts/dr/restore-data.sh` - Restauración de datos
- `infra/scripts/dr/security-incident.sh` - Procedimiento de seguridad
- `infra/scripts/dr/test-dr.sh` - Pruebas de DR

### Código de Resiliencia
- `core/src/resilience/CircuitBreaker.ts` - Implementación de circuit breaker
- `core/src/resilience/RetryHandler.ts` - Manejo de reintentos
- `core/src/resilience/HealthChecker.ts` - Verificación de salud

### Monitoreo
- `infra/monitoring/alerts/redundancy-alerts.yml` - Alertas de redundancia

---

## 7. Uso

### Configurar Redundancia

```bash
# Aplicar configuraciones de redundancia en Kubernetes
kubectl apply -f infra/k8s/redundancy/

# Verificar estado de réplicas
kubectl get pods -n elixir
```

### Ejecutar Backups

```bash
# Backup manual de PostgreSQL
./infra/scripts/backup/postgres-backup.sh

# Backup manual de Redis
./infra/scripts/backup/redis-backup.sh

# Configurar backups automáticos (cron)
crontab -e
# Agregar: 0 2 * * * /path/to/postgres-backup.sh
```

### Disaster Recovery

```bash
# Ejecutar failover de región
./infra/scripts/dr/failover-region.sh

# Restaurar datos
./infra/scripts/dr/restore-data.sh

# Probar procedimientos de DR
./infra/scripts/dr/test-dr.sh
```

---

## 8. Beneficios Implementados

1. **Alta Disponibilidad**: Sistema resistente a fallos individuales
2. **Recuperación Automática**: Failover automático sin intervención manual
3. **Protección de Datos**: Backups regulares y verificados
4. **Disaster Recovery**: Procedimientos documentados y probados
5. **Monitoreo Proactivo**: Alertas tempranas de problemas
6. **Redundancia Geográfica**: Capacidad de failover entre regiones

---

## 9. Próximos Pasos

1. **Pruebas de Carga con Fallos**: Simular fallos durante carga alta
2. **Optimización de RTO/RPO**: Reducir tiempos de recuperación
3. **Backup Automatizado Multi-Región**: Replicar backups en múltiples regiones
4. **Documentación de Runbooks**: Procedimientos detallados para operaciones
5. **Automatización de DR**: Reducir intervención manual en procedimientos de DR

---

## Referencias

- [Fase 7.2: Arquitectura Escalable](FASE_7_2_ARQUITECTURA_ESCALABLE.md)
- [Fase 7.3: Escalabilidad](FASE_7_3_ESCALABILIDAD.md)
- [Runbook de Incidentes](RUNBOOK_INCIDENTES.md)
- [Documentación de Patroni](https://patroni.readthedocs.io/)
- [Documentación de Redis Sentinel](https://redis.io/docs/management/sentinel/)


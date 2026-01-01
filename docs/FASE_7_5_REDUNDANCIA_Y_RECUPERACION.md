# Fase 7.5: Ajuste y Redundancia en el Sistema

## Objetivo

Garantizar que el sistema sea redundante y capaz de manejar fallos sin afectar su disponibilidad. Implementar soluciones de respaldo, recuperación y conmutación por error.

## Componentes Implementados

### 1. Sistemas de Respaldo y Recuperación

#### Backups Automatizados

**PostgreSQL:**
- Script: `infra/scripts/backup-postgres.sh`
- Backup completo diario a las 2:00 AM
- Backup incremental cada 6 horas (WAL)
- Retención configurable (por defecto 30 días)
- Compresión automática
- Verificación de integridad
- Soporte para almacenamiento remoto (S3, Azure Blob, GCP Storage)

**Redis:**
- Script: `infra/scripts/backup-redis.sh`
- Backup RDB diario a las 3:00 AM
- Backup AOF (si está habilitado)
- Retención configurable
- Compresión automática
- Soporte para almacenamiento remoto

**Configuración de Cron:**
- Script: `infra/scripts/setup-cron-backups.sh`
- Configuración automática de tareas programadas
- Limpieza semanal de backups antiguos

#### Restauración

**PostgreSQL:**
- Script: `infra/scripts/restore-postgres.sh`
- Listado de backups disponibles
- Restauración con confirmación
- Soporte para descarga desde almacenamiento remoto
- Validación de integridad antes de restaurar

### 2. Conmutación por Error Automática

#### Health Checks Mejorados

**Endpoints implementados:**
- `/health/live`: Liveness probe - Verifica que la aplicación esté viva
- `/health/ready`: Readiness probe - Verifica que esté lista para recibir tráfico
- `/health/startup`: Startup probe - Verifica que haya terminado de iniciar

**Verificaciones incluidas:**
- Estado del proceso
- Conexión a base de datos
- Conexión a Redis
- Uso de memoria
- Estado de métricas

**Ubicación:** `core/src/server/health.ts`

#### Circuit Breaker

**Implementación:**
- Estados: CLOSED, OPEN, HALF_OPEN
- Configuración por tipo de servicio
- Timeout automático
- Fallback opcional
- Estadísticas y monitoreo

**Configuraciones predefinidas:**
- Database: 5 fallos, 5s timeout, 30s reset
- Redis: 5 fallos, 3s timeout, 20s reset
- Servicios externos: 10 fallos, 10s timeout, 60s reset

**Ubicación:** `core/src/server/circuit-breaker.ts`

#### Kubernetes Failover

**Configuraciones:**
- Pod Disruption Budget: Mínimo 2 pods siempre disponibles
- Rolling Updates: maxUnavailable: 0 para garantizar disponibilidad
- Anti-affinity: Distribución de pods en diferentes nodos
- Health probes mejorados: liveness, readiness, startup

**Ubicación:** `infra/k8s/deployments/elixir-core-deployment.yaml`

#### Traefik Failover

**Configuración:**
- Health checks por servicio
- Circuit breaker middleware
- Retry middleware
- Sticky sessions para consistencia

**Ubicación:** `infra/k8s/failover/traefik-failover.yml`

### 3. Replicación Geográfica

#### AWS Multi-Región

**Configuración:** `infra/geo-replication/aws-multi-region.yml`

**Regiones:**
- Primaria: us-east-1 (N. Virginia)
- Secundaria 1: us-west-2 (Oregon) - Prioridad 1
- Secundaria 2: eu-west-1 (Irlanda) - Prioridad 2

**Recursos replicados:**
- RDS PostgreSQL con read replicas
- ElastiCache Redis con replicación
- ECS Services con capacidad mínima
- Route 53 con health checks y failover automático
- S3 Cross-Region Replication para backups

#### Azure Multi-Región

**Configuración:** `infra/geo-replication/azure-multi-region.yml`

**Regiones:**
- Primaria: East US
- Secundaria 1: West US 2 - Prioridad 1
- Secundaria 2: West Europe - Prioridad 2

**Recursos replicados:**
- Azure Database for PostgreSQL con geo-redundant backup
- Azure Cache for Redis con replicación
- Container Instances con auto-scaling
- Traffic Manager con routing por prioridad
- Azure Blob Storage con replicación de backups

#### GCP Multi-Región

**Configuración:** `infra/geo-replication/gcp-multi-region.yml`

**Regiones:**
- Primaria: us-central1 (Iowa)
- Secundaria 1: us-west1 (Oregon) - Prioridad 1
- Secundaria 2: europe-west1 (Bélgica) - Prioridad 2

**Recursos replicados:**
- Cloud SQL con read replicas
- Memorystore Redis con replicación
- Cloud Run con auto-scaling
- Cloud Load Balancing con failover geográfico
- Cloud Storage con replicación de backups

### 4. Monitoreo de Salud del Sistema

#### Alertas Mejoradas

**Nuevas alertas agregadas:**
- `InsufficientPods`: Número insuficiente de pods disponibles
- `DatabaseReplicaDown`: Réplica de base de datos caída
- `RedisMasterDown`: Redis master caído
- `CircuitBreakerOpen`: Circuit breaker abierto
- `HealthCheckFailing`: Health check fallando
- `BackupFailed`: Backup fallido
- `GeoReplicationLag`: Retraso en replicación geográfica

**Ubicación:** `infra/monitoring/alerts/critical-alerts.yml`

#### Health Checks Continuos

**Configuración:** `infra/monitoring/health-checks.yml`

**Monitoreo:**
- Aplicaciones: elixir-core, chat-orchestrator, whatsapp-edge
- Bases de datos: PostgreSQL (primary y replicas), Redis (masters)
- Infraestructura: Traefik, Prometheus, Grafana

**Intervalo:** 5 segundos para servicios críticos

## Uso

### Configurar Backups Automatizados

```bash
# Configurar cron jobs para backups
cd infra/scripts
chmod +x setup-cron-backups.sh
./setup-cron-backups.sh
```

### Ejecutar Backup Manual

```bash
# Backup completo de PostgreSQL
./backup-postgres.sh full

# Backup de Redis
./backup-redis.sh rdb

# Limpiar backups antiguos
./backup-postgres.sh cleanup
./backup-redis.sh cleanup
```

### Restaurar desde Backup

```bash
# Listar backups disponibles
./restore-postgres.sh list

# Restaurar desde backup local
./restore-postgres.sh restore /backups/postgres/postgres_full_20240101_020000.dump.gz

# Restaurar desde almacenamiento remoto
./restore-postgres.sh restore postgres_full_20240101_020000.dump.gz --from-remote
```

### Aplicar Configuraciones de Kubernetes

```bash
# Aplicar deployments con redundancia
kubectl apply -f infra/k8s/deployments/

# Aplicar circuit breaker config
kubectl apply -f infra/k8s/failover/circuit-breaker-config.yaml

# Verificar Pod Disruption Budget
kubectl get pdb -n elixir
```

### Configurar Replicación Geográfica

**AWS:**
```bash
# Aplicar configuración de Route 53
aws route53 create-health-check --cli-input-json file://infra/geo-replication/aws-route53-health-checks.json

# Configurar S3 replication
aws s3api put-bucket-replication --bucket elixir-backups-us-east-1 --replication-configuration file://infra/geo-replication/aws-s3-replication.json
```

**Azure:**
```bash
# Crear Traffic Manager profile
az network traffic-manager profile create --name elixir-global --resource-group elixir-rg --routing-method Priority

# Configurar endpoints
az network traffic-manager endpoint create --profile-name elixir-global --resource-group elixir-rg --name primary-eastus --type externalEndpoints --target api-primary.elixir.local --priority 1
```

**GCP:**
```bash
# Crear Cloud Load Balancer
gcloud compute backend-services create elixir-global-backend --global

# Configurar health checks
gcloud compute health-checks create http elixir-health-check --port 443 --request-path /health
```

## Métricas y Monitoreo

### Métricas de Circuit Breaker

- `circuit_breaker_state`: Estado actual (0=closed, 1=open, 2=half_open)
- `circuit_breaker_failures`: Número de fallos
- `circuit_breaker_successes`: Número de éxitos
- `circuit_breaker_total_requests`: Total de solicitudes

### Métricas de Health Checks

- `health_check_status`: Estado del health check (1=healthy, 0=unhealthy)
- `health_check_latency`: Latencia de cada verificación
- `health_check_database_latency`: Latencia de verificación de base de datos
- `health_check_redis_latency`: Latencia de verificación de Redis

### Métricas de Backup

- `backup_status`: Estado del último backup (1=success, 0=failed)
- `backup_duration_seconds`: Duración del backup
- `backup_size_bytes`: Tamaño del backup
- `backup_age_seconds`: Edad del backup más reciente

### Métricas de Replicación Geográfica

- `geo_replication_lag_seconds`: Retraso de replicación por región
- `geo_replication_status`: Estado de replicación (1=healthy, 0=unhealthy)
- `geo_replication_bytes_replicated`: Bytes replicados

## Próximos Pasos

1. **Implementar verificación real de base de datos y Redis en health checks**
   - Actualmente los health checks tienen implementaciones simuladas
   - Integrar con clientes reales de PostgreSQL y Redis

2. **Configurar alertas en Alertmanager**
   - Configurar notificaciones por email, Slack, PagerDuty
   - Definir runbooks para cada tipo de alerta

3. **Implementar pruebas de failover**
   - Scripts de prueba para simular fallos
   - Ejercicios de disaster recovery

4. **Optimizar configuración de backups**
   - Ajustar retención según necesidades
   - Implementar backups incrementales más frecuentes si es necesario

5. **Monitoreo de RPO/RTO**
   - Establecer objetivos de Recovery Point Objective (RPO)
   - Establecer objetivos de Recovery Time Objective (RTO)
   - Monitorear cumplimiento

## Referencias

- [Kubernetes Pod Disruption Budgets](https://kubernetes.io/docs/tasks/run-application/configure-pdb/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [PostgreSQL Backup and Restore](https://www.postgresql.org/docs/current/backup.html)
- [Redis Persistence](https://redis.io/docs/management/persistence/)
- [AWS Multi-Region Architecture](https://aws.amazon.com/architecture/multi-region-application/)
- [Azure Traffic Manager](https://docs.microsoft.com/azure/traffic-manager/)
- [GCP Cloud Load Balancing](https://cloud.google.com/load-balancing/docs)


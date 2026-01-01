# Infraestructura Escalable y Redundante - ELIXIR 2.0

Este directorio contiene toda la configuración de infraestructura para:
- Fase 7.2: Arquitectura Escalable
- Fase 7.5: Redundancia y Recuperación

## Estructura

```
infra/
├── load-balancer/          # Configuración de balanceadores de carga
│   ├── nginx.conf          # Configuración de Nginx
│   ├── traefik.yml         # Configuración de Traefik
│   └── traefik-dynamic.yml # Configuración dinámica de Traefik
├── k8s/                    # Configuración de Kubernetes
│   └── autoscaling/        # Horizontal Pod Autoscalers
├── aws/                    # Configuración para AWS
│   └── autoscaling/        # Auto Scaling Groups
├── gcp/                    # Configuración para GCP
│   └── autoscaling/        # Compute Engine Autoscaling
├── azure/                  # Configuración para Azure
│   └── autoscaling/        # VM Scale Sets
├── database/               # Configuración de bases de datos
│   ├── postgres-cluster.yml
│   └── redis-cluster.yml
├── monitoring/             # Configuración de monitoreo
│   ├── prometheus.yml
│   ├── alerts/
│   └── grafana/
├── scripts/                # Scripts de despliegue y backup
│   ├── deploy.sh
│   ├── setup-redis-cluster.sh
│   ├── backup-postgres.sh
│   ├── backup-redis.sh
│   ├── restore-postgres.sh
│   └── setup-cron-backups.sh
├── k8s/                    # Configuración de Kubernetes
│   ├── deployments/        # Deployments con redundancia
│   └── failover/           # Configuración de failover
│       ├── circuit-breaker-config.yaml
│       └── traefik-failover.yml
├── geo-replication/        # Configuración de replicación geográfica
│   ├── aws-multi-region.yml
│   ├── azure-multi-region.yml
│   └── gcp-multi-region.yml
└── docker-compose.scalable.yml
```

## Uso Rápido

### Desarrollo Local

```bash
# Desplegar con Docker Compose
cd infra
docker-compose -f docker-compose.scalable.yml up -d

# O usar el script de despliegue
./scripts/deploy.sh development
```

### Producción con Kubernetes

```bash
# Aplicar configuraciones de autoscaling
kubectl apply -f k8s/autoscaling/

# Verificar HPA
kubectl get hpa -n elixir
```

### Cloud Providers

#### AWS
```bash
# Crear Auto Scaling Group
aws autoscaling create-auto-scaling-group --cli-input-json file://aws/autoscaling/elixir-core-asg.json

# Crear política de escalado
aws autoscaling put-scaling-policy --cli-input-json file://aws/autoscaling/scaling-policy.json
```

#### GCP
```bash
# Crear autoscaler
gcloud compute instance-groups managed set-autoscaling elixir-core-igm \
  --max-num-replicas=10 \
  --min-num-replicas=2 \
  --target-cpu-utilization=0.7
```

#### Azure
```bash
# Crear VM Scale Set con autoscaling
az vmss create --resource-group elixir-rg \
  --name elixir-core-vmss \
  --image UbuntuLTS \
  --vm-sku Standard_D2s_v3 \
  --instance-count 2

# Configurar autoscaling
az monitor autoscale create \
  --resource-group elixir-rg \
  --resource /subscriptions/xxx/resourceGroups/elixir-rg/providers/Microsoft.Compute/virtualMachineScaleSets/elixir-core-vmss \
  --min-count 2 \
  --max-count 10 \
  --count 3
```

## Monitoreo

### Acceder a Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3003 (admin/password)
- **Traefik Dashboard**: http://localhost:8080

### Métricas Clave

- Latencia (P50, P95, P99)
- Throughput (requests/segundo)
- Error Rate (%)
- Uso de recursos (CPU, memoria)
- Métricas de base de datos

## Redundancia y Recuperación (Fase 7.5)

### Backups Automatizados

```bash
# Configurar backups automatizados
cd scripts
chmod +x setup-cron-backups.sh
./setup-cron-backups.sh

# Ejecutar backup manual
./backup-postgres.sh full
./backup-redis.sh rdb

# Restaurar desde backup
./restore-postgres.sh list
./restore-postgres.sh restore <backup_file>
```

### Failover y Circuit Breakers

```bash
# Aplicar configuraciones de failover
kubectl apply -f k8s/failover/

# Verificar circuit breakers
kubectl get configmap circuit-breaker-config -n elixir
```

### Replicación Geográfica

Ver documentación completa en `docs/FASE_7_5_REDUNDANCIA_Y_RECUPERACION.md`

**AWS:**
```bash
# Configurar Route 53 con failover
aws route53 create-health-check --cli-input-json file://geo-replication/aws-route53-health-checks.json
```

**Azure:**
```bash
# Configurar Traffic Manager
az network traffic-manager profile create --name elixir-global --resource-group elixir-rg
```

**GCP:**
```bash
# Configurar Cloud Load Balancer
gcloud compute backend-services create elixir-global-backend --global
```

## Próximos Pasos

1. Configurar certificados SSL/TLS
2. Ajustar thresholds de autoscaling según métricas reales
3. Configurar alertas en Alertmanager
4. ✅ Implementar backup automatizado de bases de datos (Completado)
5. ✅ Configurar disaster recovery (Completado)
6. Implementar pruebas de failover automatizadas
7. Optimizar configuración de backups según RPO/RTO


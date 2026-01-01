# Estrategias de Escalabilidad - ELIXIR 2.0

Este directorio contiene todas las configuraciones y herramientas necesarias para implementar estrategias de escalabilidad en ELIXIR 2.0.

## 📋 Contenido

### 1. Autoscaling (Kubernetes)
- **`kubernetes/autoscaling.yaml`**: Configuración de HorizontalPodAutoscaler (HPA) para escalado automático basado en CPU, memoria y métricas personalizadas.
- **`kubernetes/deployments.yaml`**: Deployments con recursos definidos para permitir autoscaling efectivo.

### 2. Balanceadores de Carga
- **`kubernetes/load-balancer.yaml`**: Configuración de servicios LoadBalancer e Ingress para distribución de tráfico.
- **`nginx/nginx.conf`**: Configuración de Nginx como balanceador de carga con múltiples estrategias (least_conn, round_robin).

### 3. Caching (Redis)
- **`redis/redis-deployment.yaml`**: Despliegue de Redis Cluster con alta disponibilidad.
- **`redis/redis-sentinel-config.yaml`**: Configuración de Redis Sentinel para monitoreo y failover automático.
- **`../core/src/cache/RedisCache.ts`**: Cliente Redis para integración en los servicios.
- **`../core/src/cache/CacheMiddleware.ts`**: Middleware de Express para caching automático de respuestas HTTP.

### 4. Bases de Datos Escalables
- **`database/postgres-ha.yaml`**: Configuración de PostgreSQL con replicación maestro-esclavo, failover automático y PgBouncer para connection pooling.

### 5. Monitoreo
- **`monitoring/prometheus.yml`**: Configuración de Prometheus para recolección de métricas.
- **`monitoring/alerts.yml`**: Reglas de alertas para CPU, memoria, servicios, Redis y latencia.

### 6. Docker Compose
- **`docker-compose.scalable.yml`**: Configuración de Docker Compose para desarrollo y pruebas de escalabilidad.

## 🚀 Implementación

### Prerrequisitos

1. **Kubernetes Cluster** (para producción)
   - Versión 1.24 o superior
   - Métricas server habilitado (Metrics Server)
   - CNI configurado

2. **Docker y Docker Compose** (para desarrollo)
   - Docker 20.10+
   - Docker Compose 2.0+

3. **Herramientas CLI**
   - `kubectl` configurado
   - `helm` (opcional, para algunos componentes)

### Pasos de Implementación

#### 1. Configurar Namespace de Kubernetes

```bash
kubectl create namespace elixir
```

#### 2. Desplegar Redis

```bash
# Aplicar configuración de Redis
kubectl apply -f redis/redis-deployment.yaml
kubectl apply -f redis/redis-sentinel-config.yaml

# Inicializar cluster de Redis (después de que los pods estén listos)
kubectl exec -it redis-0 -n elixir -- redis-cli --cluster create \
  $(kubectl get pods -l app=redis -n elixir -o jsonpath='{range.items[*]}{.status.podIP}:6379 {end}') \
  --cluster-replicas 1
```

#### 3. Desplegar Bases de Datos

```bash
# Crear secretos de PostgreSQL primero
kubectl create secret generic postgres-secret \
  --from-literal=username=elixir \
  --from-literal=password=<tu-password-seguro> \
  -n elixir

# Aplicar configuración de PostgreSQL
kubectl apply -f database/postgres-ha.yaml
```

#### 4. Desplegar Servicios con Autoscaling

```bash
# Aplicar deployments
kubectl apply -f kubernetes/deployments.yaml

# Aplicar autoscaling
kubectl apply -f kubernetes/autoscaling.yaml

# Aplicar balanceadores de carga
kubectl apply -f kubernetes/load-balancer.yaml
```

#### 5. Configurar Monitoreo

```bash
# Desplegar Prometheus
kubectl apply -f monitoring/prometheus.yml

# Verificar que las métricas se están recolectando
kubectl port-forward -n elixir svc/prometheus 9090:9090
# Abrir http://localhost:9090 en el navegador
```

#### 6. Desarrollo Local con Docker Compose

```bash
# Iniciar todos los servicios
docker-compose -f docker-compose.scalable.yml up -d

# Escalar servicios manualmente
docker-compose -f docker-compose.scalable.yml up -d --scale elixir-core=3
docker-compose -f docker-compose.scalable.yml up -d --scale whatsapp-edge=5

# Ver logs
docker-compose -f docker-compose.scalable.yml logs -f
```

## 📊 Métricas y Monitoreo

### Métricas Clave a Monitorear

1. **CPU y Memoria**
   - Uso promedio por servicio
   - Picos de uso
   - Tendencias a lo largo del tiempo

2. **Rendimiento de Aplicación**
   - Latencia de peticiones (p50, p95, p99)
   - Tasa de errores (4xx, 5xx)
   - Throughput (requests/segundo)

3. **Autoscaling**
   - Número de réplicas actuales
   - Eventos de escalado (up/down)
   - Tiempo de respuesta del autoscaling

4. **Redis**
   - Uso de memoria
   - Hit rate del cache
   - Latencia de operaciones

5. **Bases de Datos**
   - Conexiones activas
   - Tiempo de respuesta de queries
   - Replicación lag

### Acceso a Dashboards

- **Prometheus**: `http://localhost:9090` (port-forward)
- **Grafana**: `http://localhost:3003` (usuario: admin, password: admin)

## 🔧 Configuración de Autoscaling

### Parámetros Ajustables

En `kubernetes/autoscaling.yaml`, puedes ajustar:

- **minReplicas**: Número mínimo de réplicas
- **maxReplicas**: Número máximo de réplicas
- **targetCPUUtilization**: Porcentaje objetivo de CPU (default: 70%)
- **targetMemoryUtilization**: Porcentaje objetivo de memoria (default: 80%)
- **stabilizationWindowSeconds**: Ventana de estabilización antes de escalar

### Ejemplo de Ajuste

```yaml
spec:
  minReplicas: 3  # Aumentar mínimo para mayor disponibilidad
  maxReplicas: 20  # Aumentar máximo para picos de tráfico
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60  # Escalar más temprano
```

## 🎯 Estrategias de Caching

### Uso del Cliente Redis

```typescript
import { getCache } from './cache/RedisCache';

const cache = getCache();

// Cachear una respuesta
await cache.set('user:123', userData, { ttl: 3600, prefix: 'api' });

// Obtener del cache
const user = await cache.get('user:123', 'api');

// Invalidar cache
await cache.delete('user:123', 'api');
```

### Uso del Middleware de Cache

```typescript
import { cacheMiddleware } from './cache/CacheMiddleware';

// Cachear todas las respuestas GET por 5 minutos
app.get('/api/users', cacheMiddleware({ ttl: 300 }), getUsers);

// Cachear con opciones personalizadas
app.get('/api/products', cacheMiddleware({
  ttl: 600,
  includeQuery: true,
  skipCache: (req) => req.query.nocache === 'true'
}), getProducts);
```

## 🔄 Balanceo de Carga

### Estrategias Disponibles

1. **Least Connections** (default): Distribuye a la instancia con menos conexiones activas
2. **Round Robin**: Distribuye de manera circular
3. **IP Hash**: Mantiene sesiones basadas en IP del cliente

### Configuración de Sesiones

Para mantener sesiones de usuario, se utiliza `sessionAffinity: ClientIP` en los servicios de Kubernetes, lo que garantiza que un cliente siempre se conecte a la misma instancia.

## 📈 Escalabilidad Horizontal vs Vertical

### Escalabilidad Horizontal (Recomendada)
- ✅ Aumentar número de instancias
- ✅ Mejor para alta disponibilidad
- ✅ Implementado con HPA

### Escalabilidad Vertical
- ⚠️ Aumentar recursos de instancias existentes
- ⚠️ Limitado por hardware
- ⚠️ Requiere downtime

## 🛠️ Troubleshooting

### Problemas Comunes

1. **Pods no escalan**
   - Verificar que Metrics Server esté funcionando: `kubectl top nodes`
   - Revisar eventos del HPA: `kubectl describe hpa -n elixir`

2. **Redis no conecta**
   - Verificar que Redis esté corriendo: `kubectl get pods -n elixir -l app=redis`
   - Revisar logs: `kubectl logs -n elixir redis-0`

3. **Balanceador no distribuye tráfico**
   - Verificar servicios: `kubectl get svc -n elixir`
   - Revisar endpoints: `kubectl get endpoints -n elixir`

## 📚 Referencias

- [Kubernetes Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Redis Cluster](https://redis.io/docs/manual/scaling/)
- [PostgreSQL High Availability](https://www.postgresql.org/docs/current/high-availability.html)
- [Nginx Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)

## 🔐 Seguridad

⚠️ **Importante**: Antes de desplegar en producción:

1. Cambiar todas las contraseñas por defecto
2. Configurar TLS/SSL correctamente
3. Implementar políticas de red (Network Policies)
4. Configurar RBAC apropiado
5. Habilitar auditoría y logging

## 📝 Notas

- Las configuraciones están optimizadas para un entorno de producción medio
- Ajustar recursos según necesidades específicas
- Monitorear constantemente y ajustar parámetros basándose en métricas reales
- Realizar pruebas de carga antes de producción

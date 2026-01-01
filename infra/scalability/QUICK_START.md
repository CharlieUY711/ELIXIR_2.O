# Guía Rápida de Escalabilidad - ELIXIR 2.0

Esta guía te ayudará a implementar rápidamente las estrategias de escalabilidad en tu entorno.

## 🚀 Inicio Rápido (5 minutos)

### Opción 1: Desarrollo Local con Docker Compose

```bash
# 1. Ir al directorio de escalabilidad
cd infra/scalability

# 2. Iniciar todos los servicios
docker-compose -f docker-compose.scalable.yml up -d

# 3. Verificar que todo esté corriendo
docker-compose -f docker-compose.scalable.yml ps

# 4. Ver logs
docker-compose -f docker-compose.scalable.yml logs -f
```

### Opción 2: Kubernetes (Producción)

```bash
# 1. Ejecutar script de despliegue
cd infra/scalability
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 2. Monitorear el despliegue
./scripts/monitor.sh
```

## 📝 Integración de Redis en tu Código

### Paso 1: Instalar dependencias

```bash
cd core
npm install redis
```

### Paso 2: Usar el cliente de cache

```typescript
import { getCache } from './cache';

const cache = getCache();

// Conectar (se hace automáticamente en la primera operación)
await cache.connect();

// Cachear datos
await cache.set('user:123', { name: 'Juan', email: 'juan@example.com' }, {
  ttl: 3600, // 1 hora
  prefix: 'api'
});

// Obtener datos
const user = await cache.get('user:123', 'api');

// Eliminar del cache
await cache.delete('user:123', 'api');
```

### Paso 3: Usar middleware de cache en Express

```typescript
import express from 'express';
import { cacheMiddleware } from './cache';

const app = express();

// Cachear todas las respuestas GET por 5 minutos
app.get('/api/users', cacheMiddleware({ ttl: 300 }), async (req, res) => {
  const users = await getUsersFromDatabase();
  res.json(users);
});

// Cachear con opciones personalizadas
app.get('/api/products', cacheMiddleware({
  ttl: 600, // 10 minutos
  includeQuery: true, // Incluir query params en la clave
  skipCache: (req) => req.query.nocache === 'true' // Saltar cache si se solicita
}), async (req, res) => {
  const products = await getProductsFromDatabase(req.query);
  res.json(products);
});
```

## ⚙️ Configurar Variables de Entorno

Crea un archivo `.env` en cada servicio:

```bash
# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=  # Opcional, solo si Redis tiene contraseña

# Node
NODE_ENV=production
PORT=3000
```

## 📊 Monitorear el Sistema

### Ver métricas en tiempo real

```bash
# Con Docker Compose
docker stats

# Con Kubernetes
kubectl top pods -n elixir
kubectl top nodes
```

### Ver estado de autoscaling

```bash
# Kubernetes
kubectl get hpa -n elixir
kubectl describe hpa elixir-core-hpa -n elixir
```

### Acceder a Prometheus

```bash
# Port-forward
kubectl port-forward -n elixir svc/prometheus 9090:9090

# Abrir en navegador
# http://localhost:9090
```

### Acceder a Grafana

```bash
# Port-forward
kubectl port-forward -n elixir svc/grafana 3003:3000

# Abrir en navegador
# http://localhost:3003
# Usuario: admin
# Password: admin (cambiar en producción)
```

## 🔧 Ajustar Autoscaling

### Ver configuración actual

```bash
kubectl get hpa -n elixir -o yaml
```

### Modificar configuración

```bash
# Editar directamente
kubectl edit hpa elixir-core-hpa -n elixir

# O aplicar desde archivo
kubectl apply -f kubernetes/autoscaling.yaml
```

### Escalar manualmente (para pruebas)

```bash
# Escalar a 5 réplicas
kubectl scale deployment elixir-core --replicas=5 -n elixir

# O usar el script
./scripts/scale-services.sh elixir-core 5
```

## 🎯 Casos de Uso Comunes

### Cachear respuestas de API

```typescript
// Cachear por 1 hora
app.get('/api/data', cacheMiddleware({ ttl: 3600 }), handler);

// Invalidar cache después de actualizar
app.post('/api/data', async (req, res) => {
  await updateData(req.body);
  await cache.deletePattern('api:data:*'); // Invalidar todo el cache relacionado
  res.json({ success: true });
});
```

### Cachear sesiones de usuario

```typescript
import { getCache } from './cache';

const cache = getCache();

// Guardar sesión
await cache.set(`session:${sessionId}`, sessionData, {
  ttl: 86400, // 24 horas
  prefix: 'sessions'
});

// Obtener sesión
const session = await cache.get(`session:${sessionId}`, 'sessions');
```

### Rate Limiting con Redis

```typescript
import { getCache } from './cache';

async function rateLimit(userId: string, limit: number = 100): Promise<boolean> {
  const cache = getCache();
  const key = `ratelimit:${userId}`;
  
  const count = await cache.increment(key, undefined, 1);
  
  if (count === 1) {
    // Primera petición, establecer TTL
    await cache.set(key, count, { ttl: 60 }); // 60 segundos
  }
  
  return count <= limit;
}
```

## 🐛 Troubleshooting Rápido

### Redis no conecta

```bash
# Verificar que Redis esté corriendo
docker ps | grep redis
# o
kubectl get pods -n elixir -l app=redis

# Ver logs
docker logs elixir-redis
# o
kubectl logs -n elixir redis-0

# Probar conexión
docker exec -it elixir-redis redis-cli ping
```

### Servicios no escalan

```bash
# Verificar Metrics Server
kubectl top nodes

# Ver eventos del HPA
kubectl describe hpa elixir-core-hpa -n elixir

# Ver métricas disponibles
kubectl get --raw /apis/metrics.k8s.io/v1beta1/namespaces/elixir/pods
```

### Balanceador no distribuye tráfico

```bash
# Verificar servicios
kubectl get svc -n elixir

# Ver endpoints
kubectl get endpoints -n elixir

# Verificar que los pods estén listos
kubectl get pods -n elixir
```

## 📚 Recursos Adicionales

- [README completo](./README.md) - Documentación detallada
- [Kubernetes HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Redis Documentation](https://redis.io/docs/)
- [Nginx Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)

## 💡 Tips

1. **Empezar pequeño**: Comienza con 2-3 réplicas y ajusta según necesidad
2. **Monitorear siempre**: Configura alertas y revisa métricas regularmente
3. **Probar bajo carga**: Realiza pruebas de carga antes de producción
4. **Ajustar gradualmente**: Cambia un parámetro a la vez y observa el impacto
5. **Documentar cambios**: Mantén un registro de los ajustes realizados

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `kubectl logs -n elixir <pod-name>`
2. Verifica eventos: `kubectl get events -n elixir`
3. Consulta la documentación completa en [README.md](./README.md)


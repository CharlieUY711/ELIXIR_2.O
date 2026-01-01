# Fase 7.2: Diagramas de Arquitectura Escalable

## Estado: DISEÑO PROPUESTO

Este documento contiene diagramas detallados que complementan el diseño de arquitectura escalable.

---

## 1. Diagrama de Flujo de Request Completo

```
Usuario
  │
  ▼
┌─────────────────┐
│   CDN / Edge    │  ← Caché estático (HTML, CSS, JS)
└─────────────────┘
  │
  ▼
┌─────────────────┐
│  API Gateway    │  ← Autenticación, Rate Limiting, Routing
│  (Kong/Envoy)   │
└─────────────────┘
  │
  ├─ GET /models ──────────────────┐
  │                                  │
  ├─ POST /handoff ────────────────┤
  │                                  │
  └─ POST /authorize ───────────────┤
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  Load Balancer       │
                          │  (Layer 7)           │
                          │  - Health Checks     │
                          │  - Circuit Breaking  │
                          └──────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │ Chat Service │  │ Chat Service │  │ Chat Service │
          │ (Instancia 1)│  │ (Instancia 2)│  │ (Instancia N)│
          └──────────────┘  └──────────────┘  └──────────────┘
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  Elixir Core Service │
                          │  (Pool de instancias)│
                          └──────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │  Redis Cache │  │  Ledger DB   │  │  Kafka       │
          │  (Cluster)   │  │  (Sharded)   │  │  (Events)    │
          └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 2. Diagrama de Escalado Horizontal

```
Estado Inicial (2 instancias)
┌──────────────┐  ┌──────────────┐
│ Elixir Core  │  │ Elixir Core  │
│  Instancia 1 │  │  Instancia 2 │
└──────────────┘  └──────────────┘
      │                  │
      └──────────────────┘
              │
         Load Balancer
              │
         [Métricas: CPU 45%, Latencia 120ms]

─────────────────────────────────────────────

Aumento de Carga (CPU 75%, Latencia 250ms)
┌──────────────┐  ┌──────────────┐
│ Elixir Core  │  │ Elixir Core  │
│  Instancia 1 │  │  Instancia 2 │
└──────────────┘  └──────────────┘
      │                  │
      └──────────────────┘
              │
         Load Balancer
              │
    [HPA detecta: CPU > 70%]
              │
              ▼
    ┌─────────────────────┐
    │  Autoscaling        │
    │  +2 instancias      │
    └─────────────────────┘
              │
              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Core 1  │  │ Core 2   │  │ Core 3   │  │ Core 4   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
      │            │            │            │
      └────────────┴────────────┴────────────┘
                    │
               Load Balancer
                    │
         [Métricas: CPU 50%, Latencia 150ms]
```

---

## 3. Diagrama de Partición de Base de Datos (Sharding)

```
Ledger Database - Sharding por user_id

                    ┌─────────────────┐
                    │  Shard Router   │
                    │  (Consistent    │
                    │   Hashing)      │
                    └─────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Shard 1     │  │  Shard 2     │  │  Shard 3     │
│  (Hash 0-33) │  │  (Hash 34-66)│  │  (Hash 67-99)│
│              │  │              │  │              │
│  Primary     │  │  Primary     │  │  Primary     │
│  Replica 1   │  │  Replica 1   │  │  Replica 1   │
│  Replica 2   │  │  Replica 2   │  │  Replica 2   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                    ┌──────────────┐
                    │  Backup      │
                    │  (Diario)    │
                    └──────────────┘

Ejemplo de Routing:
user_id = "user_12345"
hash(user_id) = 42
→ Shard 2 (Hash 34-66)
```

---

## 4. Diagrama de Alta Disponibilidad Multi-Zona

```
Región: us-east-1

┌─────────────────────────────────────────────────────────┐
│                    Availability Zone A                   │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Elixir Core  │  │ Elixir Core  │  │ Load Balancer│  │
│  │  (Pod 1)     │  │  (Pod 2)     │  │  (Active)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                           │                              │
│                    ┌──────────────┐                      │
│                    │  DB Primary  │                      │
│                    │  (Shard 1)   │                      │
│                    └──────────────┘                      │
│                           │                              │
└───────────────────────────┼──────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │  Replicación    │
                    │  (Async)        │
                    └────────┴────────┘
                             │
┌────────────────────────────┼──────────────────────────────┐
│                    Availability Zone B                   │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Elixir Core  │  │ Elixir Core  │  │ Load Balancer│  │
│  │  (Pod 3)     │  │  (Pod 4)     │  │  (Standby)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                           │                              │
│                    ┌──────────────┐                      │
│                    │  DB Replica  │                      │
│                    │  (Shard 1)   │                      │
│                    └──────────────┘                      │
│                                                           │
└───────────────────────────────────────────────────────────┘

Failover Automático:
1. Health check falla en AZ-A
2. Load Balancer redirige tráfico a AZ-B (< 30 seg)
3. DB Replica promovida a Primary
4. Nuevos pods iniciados en AZ-A
```

---

## 5. Diagrama de Caché Distribuido (Redis Cluster)

```
Redis Cluster - 6 Nodos (3 Primarios + 3 Réplicas)

                    ┌──────────────┐
                    │   Client     │
                    │  (Elixir     │
                    │   Core)      │
                    └──────────────┘
                           │
                    ┌──────┴──────┐
                    │   Cluster   │
                    │   Client    │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Node 1      │  │  Node 2      │  │  Node 3      │
│  (Primary)   │  │  (Primary)   │  │  (Primary)   │
│  Slots:      │  │  Slots:      │  │  Slots:      │
│  0-5460      │  │  5461-10922  │  │  10923-16383 │
│              │  │              │  │              │
│  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
│  │Replica │  │  │  │Replica │  │  │  │Replica │  │
│  │Node 4  │  │  │  │Node 5  │  │  │  │Node 6  │  │
│  └────────┘  │  │  └────────┘  │  │  └────────┘  │
└──────────────┘  └──────────────┘  └──────────────┘

Ejemplo de Operación:
SET key:user:123 "value"
→ Hash slot = CRC16("key:user:123") % 16384 = 7892
→ Enrutado a Node 1 (slots 0-5460)
→ Replicado a Node 4

Si Node 1 falla:
→ Node 4 promovido a Primary automáticamente
→ Cluster reconfigurado (< 1 segundo)
```

---

## 6. Diagrama de Event-Driven Architecture

```
Event Flow: Autorización → Ledger → Auditoría

┌──────────────┐
│ Elixir Core  │
│  Service     │
└──────────────┘
       │
       │ authorize(request)
       │
       ▼
┌──────────────┐
│  Decision    │
│  ALLOW/DENY  │
└──────────────┘
       │
       ├─ ALLOW ──────────────────┐
       │                          │
       └─ DENY ───────────────────┤
                                  │
                                  ▼
                    ┌─────────────────────┐
                    │   Kafka Topic       │
                    │ authorization.events│
                    └─────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
          │  Consumer 1  │ │  Consumer 2  │ │  Consumer 3  │
          │  (Ledger)    │ │  (Audit)     │ │  (Metrics)   │
          └──────────────┘ └──────────────┘ └──────────────┘
                    │             │             │
                    ▼             ▼             ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
          │  Ledger DB   │ │  Audit DB    │ │  Prometheus  │
          │  (Write)     │ │  (Write)     │ │  (Metrics)   │
          └──────────────┘ └──────────────┘ └──────────────┘

Ventajas:
- Desacoplamiento: Core no espera procesamiento de eventos
- Escalabilidad: Múltiples consumidores procesan en paralelo
- Resiliencia: Eventos persisten en Kafka si consumidor falla
- Trazabilidad: Todos los eventos auditables
```

---

## 7. Diagrama de Service Mesh (Istio)

```
Service Mesh - Comunicación Segura Entre Servicios

┌─────────────────────────────────────────────────────────────┐
│                    Service Mesh Layer                        │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  │  Envoy      │      │  Envoy       │      │  Envoy       │
│  │  Sidecar    │◄────►│  Sidecar     │◄────►│  Sidecar     │
│  │  (Core)     │      │  (Chat)      │      │  (Edge)      │
│  └──────────────┘      └──────────────┘      └──────────────┘
│         │                    │                    │          │
│         └────────────────────┴────────────────────┘          │
│                           │                                  │
│                    ┌──────────────┐                         │
│                    │  Istio       │                         │
│                    │  Control     │                         │
│                    │  Plane       │                         │
│                    └──────────────┘                         │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐                │
│         │                 │                 │                │
│         ▼                 ▼                 ▼                │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐          │
│  │  Pilot   │      │  Citadel │      │  Galley  │          │
│  │(Routing) │      │  (mTLS)  │      │  (Config)│          │
│  └──────────┘      └──────────┘      └──────────┘          │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Elixir Core  │      │ Chat Service │      │ Edge Service │
│  Service     │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘

Funciones del Service Mesh:
- mTLS: Encriptación automática entre servicios
- Service Discovery: Enrutamiento automático
- Circuit Breaking: Protección contra fallos en cascada
- Observability: Tracing distribuido automático
- Rate Limiting: Control de tráfico entre servicios
```

---

## 8. Diagrama de Autoscaling (HPA + VPA + Cluster)

```
Kubernetes Autoscaling Stack

┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Elixir Core  │  │ Elixir Core  │  │ Elixir Core  │      │
│  │    Pod 1     │  │    Pod 2     │  │    Pod 3     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                    ┌──────────────┐                         │
│                    │  Deployment  │                         │
│                    └──────────────┘                         │
└────────────────────────────┬─────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  HPA             │  │  VPA             │
        │  (Horizontal)    │  │  (Vertical)      │
        │                  │  │                  │
        │  Métricas:       │  │  Recomendaciones:│
        │  - CPU > 70%    │  │  - CPU: 500m    │
        │  - Memory > 80%  │  │  - Memory: 1Gi  │
        │  - Latency >200ms│  │                  │
        └──────────────────┘  └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Metrics Server  │
                    │  (Prometheus)    │
                    └──────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────┐
        │  Cluster Autoscaler              │
        │                                  │
        │  Si pods no pueden programarse:  │
        │  → Añadir nodo al cluster        │
        │                                  │
        │  Si nodo subutilizado:           │
        │  → Remover nodo del cluster      │
        └──────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Node Pool 1     │  │  Node Pool 2     │
        │  (3-10 nodos)    │  │  (0-5 nodos)     │
        │  (On-demand)     │  │  (Spot)          │
        └──────────────────┘  └──────────────────┘
```

---

## 9. Diagrama de Disaster Recovery

```
Disaster Recovery - Failover a Región Secundaria

Estado Normal (Región Primaria: us-east-1)
┌─────────────────────────────────────────────┐
│  us-east-1 (Región Primaria)                │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Elixir Core  │  │  Load        │       │
│  │  (Active)    │  │  Balancer    │       │
│  └──────────────┘  └──────────────┘       │
│         │                  │                │
│         └──────────┬───────┘                │
│                    │                        │
│              ┌──────────────┐              │
│              │  DB Primary  │              │
│              └──────────────┘              │
│                    │                        │
│              [Replicación Async]            │
│                    │                        │
└────────────────────┼────────────────────────┘
                     │
                     │ (Backup cada 6 horas)
                     │
┌────────────────────┼────────────────────────┐
│  us-west-2 (Región Secundaria)              │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Elixir Core  │  │  Load        │       │
│  │  (Standby)   │  │  Balancer    │       │
│  └──────────────┘  └──────────────┘       │
│         │                  │                │
│         └──────────┬───────┘                │
│                    │                        │
│              ┌──────────────┐              │
│              │  DB Replica  │              │
│              └──────────────┘              │
└─────────────────────────────────────────────┘

─────────────────────────────────────────────

Disaster Detectado (Región Primaria caída)
┌─────────────────────────────────────────────┐
│  us-east-1 (Región Primaria)                │
│  ❌ CAÍDA                                    │
└─────────────────────────────────────────────┘

Proceso de Failover:
1. Detección automática (< 30 seg)
2. Promoción de DB Replica a Primary
3. Activación de servicios en us-west-2
4. DNS failover (Route 53)
5. Validación de integridad

┌─────────────────────────────────────────────┐
│  us-west-2 (Región Secundaria)               │
│  ✅ ACTIVA (Nueva Primaria)                  │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Elixir Core  │  │  Load        │       │
│  │  (Active)    │  │  Balancer    │       │
│  └──────────────┘  └──────────────┘       │
│         │                  │                │
│         └──────────┬───────┘                │
│                    │                        │
│              ┌──────────────┐              │
│              │  DB Primary  │              │
│              │  (Promovida) │              │
│              └──────────────┘              │
└─────────────────────────────────────────────┘

RTO: < 1 hora
RPO: < 15 minutos (último backup)
```

---

## 10. Diagrama de Observabilidad Completa

```
Observability Stack - Métricas, Logs y Traces

┌─────────────────────────────────────────────────────────────┐
│                    Application Services                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Elixir Core  │  │ Chat Service │  │ Edge Service │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         ├─ Métricas        ├─ Métricas        ├─ Métricas    │
│         ├─ Logs            ├─ Logs            ├─ Logs        │
│         └─ Traces          └─ Traces          └─ Traces      │
└─────────┼──────────────────┼──────────────────┼───────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Prometheus  │  │  Loki/ELK    │  │  Jaeger      │
│  (Métricas)  │  │  (Logs)      │  │  (Traces)    │
└──────────────┘  └──────────────┘  └──────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌──────────────┐
                    │   Grafana    │
                    │  (Dashboards)│
                    └──────────────┘
                             │
                    ┌──────────────┐
                    │  Alertmanager│
                    │  (Alertas)   │
                    └──────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PagerDuty    │  │  Slack       │  │  Email       │
│  (Críticas)   │  │  (Advertencia)│  │  (Info)      │
└──────────────┘  └──────────────┘  └──────────────┘

Métricas Clave:
- CPU, Memoria, Disco, Red
- Latencia p50, p95, p99
- Tasa de errores
- Throughput (req/s)

Logs:
- Estructurados (JSON)
- Niveles: ERROR, WARN, INFO, DEBUG
- Retención: 30 días

Traces:
- Distributed tracing completo
- Sampling: 100% errores, 10% éxito
- Retención: 7 días
```

---

## 11. Diagrama de Seguridad en Capas

```
Security Layers - Defense in Depth

┌─────────────────────────────────────────────────────────────┐
│                    Layer 1: Network Security                 │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  │  WAF         │      │  DDoS        │      │  Firewall    │
│  │  (Web App    │      │  Protection  │      │  Rules       │
│  │   Firewall)  │      │              │      │              │
│  └──────────────┘      └──────────────┘      └──────────────┘
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Layer 2: API Security                     │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  │  API Gateway │      │  Rate        │      │  Auth/        │
│  │  (Kong)      │      │  Limiting    │      │  AuthZ        │
│  └──────────────┘      └──────────────┘      └──────────────┘
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Layer 3: Service Security                 │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  │  mTLS        │      │  Service     │      │  Secret      │
│  │  (Istio)     │      │  Mesh        │      │  Management  │
│  └──────────────┘      └──────────────┘      └──────────────┘
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Layer 4: Data Security                    │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  │  Encryption  │      │  Encryption  │      │  Access      │
│  │  in Transit │      │  at Rest     │      │  Control     │
│  │  (TLS 1.3)  │      │  (AES-256)   │      │  (RBAC)      │
│  └──────────────┘      └──────────────┘      └──────────────┘
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Layer 5: Monitoring & Audit               │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  │  Security    │      │  Audit       │      │  Compliance  │
│  │  Monitoring  │      │  Logs        │      │  Checks      │
│  └──────────────┘      └──────────────┘      └──────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Diagrama de Costo y Optimización

```
Cost Optimization Strategy

┌─────────────────────────────────────────────────────────────┐
│                    Resource Allocation                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Reserved    │  │  On-Demand   │  │  Spot        │      │
│  │  Instances   │  │  Instances   │  │  Instances   │      │
│  │  (Base Load) │  │  (Variable)  │  │  (Batch)     │      │
│  │  60% costo   │  │  100% costo  │  │  30% costo   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │  Right-Sizing   │
                    │  (Basado en     │
                    │   métricas)     │
                    └────────┴────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Auto-       │  │  Scheduled   │  │  Cost        │
│  Scaling     │  │  Scaling     │  │  Alerts      │
│  (HPA)       │  │  (Predictive)│  │  (Threshold) │
└──────────────┘  └──────────────┘  └──────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌──────────────┐
                    │  Cost        │
                    │  Dashboard   │
                    │  (Grafana)   │
                    └──────────────┘

Objetivos:
- Reducir costo por request 20% anualmente
- Utilización de recursos > 60% promedio
- Auto-shutdown de recursos no utilizados
```

---

**Documento creado**: Fase 7.2 - Diagramas de Arquitectura Escalable
**Estado**: DISEÑO PROPUESTO
**Última actualización**: [Fecha de creación]


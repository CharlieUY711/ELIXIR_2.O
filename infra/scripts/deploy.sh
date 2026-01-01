#!/bin/bash
# Script de despliegue para Arquitectura Escalable
# Para ELIXIR 2.0 - Fase 7.2

set -e

ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.scalable.yml"

echo "Desplegando ELIXIR 2.0 en modo: $ENVIRONMENT"

# Crear red si no existe
echo "Creando red Docker..."
docker network create elixir-network 2>/dev/null || true

# Cargar variables de entorno
if [ -f ".env.$ENVIRONMENT" ]; then
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
fi

# Desplegar servicios
echo "Desplegando servicios..."
docker-compose -f $COMPOSE_FILE up -d

# Esperar a que los servicios estén listos
echo "Esperando a que los servicios estén listos..."
sleep 30

# Configurar Redis Cluster
if [ "$ENVIRONMENT" != "development" ]; then
    echo "Configurando Redis Cluster..."
    bash scripts/setup-redis-cluster.sh
fi

# Verificar salud de los servicios
echo "Verificando salud de los servicios..."
docker-compose -f $COMPOSE_FILE ps

echo "Despliegue completado!"
echo "Accede a:"
echo "  - Traefik Dashboard: http://localhost:8080"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3003"


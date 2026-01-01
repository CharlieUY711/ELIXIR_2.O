#!/bin/bash
# Script para configurar Redis Cluster
# Para ELIXIR 2.0 - Arquitectura Escalable

set -e

echo "Configurando Redis Cluster..."

# Esperar a que los contenedores estén listos
echo "Esperando a que los nodos de Redis estén listos..."
sleep 10

# Obtener las IPs de los contenedores
REDIS_MASTER_1_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis-master-1)
REDIS_MASTER_2_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis-master-2)
REDIS_MASTER_3_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis-master-3)
REDIS_REPLICA_1_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis-replica-1)
REDIS_REPLICA_2_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis-replica-2)
REDIS_REPLICA_3_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis-replica-3)

# Crear el cluster
echo "Creando cluster de Redis..."
docker exec -it redis-master-1 redis-cli --cluster create \
  ${REDIS_MASTER_1_IP}:6379 \
  ${REDIS_MASTER_2_IP}:6379 \
  ${REDIS_MASTER_3_IP}:6379 \
  ${REDIS_REPLICA_1_IP}:6379 \
  ${REDIS_REPLICA_2_IP}:6379 \
  ${REDIS_REPLICA_3_IP}:6379 \
  --cluster-replicas 1 \
  --cluster-yes

echo "Redis Cluster configurado exitosamente!"

# Verificar el estado del cluster
echo "Verificando estado del cluster..."
docker exec -it redis-master-1 redis-cli cluster nodes


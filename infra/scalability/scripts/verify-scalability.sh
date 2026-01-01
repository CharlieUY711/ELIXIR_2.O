#!/bin/bash

# Script de verificación de estrategias de escalabilidad
# Verifica que todos los componentes estén correctamente configurados

set -e

echo "=== Verificación de Estrategias de Escalabilidad ==="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Función para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 está instalado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 no está instalado"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
        return 0
    else
        echo -e "${RED}✗${NC} $1 no existe"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Función para verificar servicio
check_service() {
    if curl -s -f "$1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $2 está respondiendo"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $2 no está respondiendo (puede no estar desplegado)"
        return 1
    fi
}

echo "1. Verificando herramientas necesarias..."
check_command "kubectl" || echo "  (Opcional si no usas Kubernetes)"
check_command "docker" || echo "  (Opcional si no usas Docker)"
check_command "nginx" || echo "  (Opcional si no usas Nginx directamente)"
check_command "redis-cli" || echo "  (Opcional si no tienes Redis local)"
echo ""

echo "2. Verificando archivos de configuración..."
check_file "infra/scalability/autoscaling/kubernetes-hpa.yaml"
check_file "infra/scalability/autoscaling/docker-compose.scale.yml"
check_file "infra/scalability/load-balancer/nginx.conf"
check_file "infra/scalability/cache/redis-config.conf"
check_file "core/src/cache/CacheManager.ts"
check_file "core/src/cluster/ClusterManager.ts"
check_file "infra/scalability/database/partitioning-strategy.md"
echo ""

echo "3. Verificando servicios (si están desplegados)..."
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}

if command -v redis-cli &> /dev/null; then
    if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Redis está disponible en $REDIS_HOST:$REDIS_PORT"
        
        # Verificar configuración de cluster
        CLUSTER_INFO=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT CLUSTER INFO 2>/dev/null || echo "")
        if [ -n "$CLUSTER_INFO" ]; then
            echo -e "${GREEN}✓${NC} Redis está en modo cluster"
        else
            echo -e "${YELLOW}⚠${NC} Redis no está en modo cluster (puede ser standalone)"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Redis no está disponible en $REDIS_HOST:$REDIS_PORT"
    fi
else
    echo -e "${YELLOW}⚠${NC} redis-cli no disponible, saltando verificación de Redis"
fi

check_service "http://localhost/api/core/health" "Elixir Core API"
check_service "http://localhost/api/whatsapp/health" "WhatsApp Edge API"
check_service "http://localhost/api/chat/health" "Chat Orchestrator API"
echo ""

echo "4. Verificando configuración de Kubernetes (si aplica)..."
if command -v kubectl &> /dev/null; then
    if kubectl cluster-info &> /dev/null; then
        echo -e "${GREEN}✓${NC} Kubernetes cluster está accesible"
        
        # Verificar HPA
        HPA_COUNT=$(kubectl get hpa -n elixir-production 2>/dev/null | wc -l || echo "0")
        if [ "$HPA_COUNT" -gt "1" ]; then
            echo -e "${GREEN}✓${NC} HPAs configurados: $((HPA_COUNT - 1))"
        else
            echo -e "${YELLOW}⚠${NC} No se encontraron HPAs en el namespace elixir-production"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Kubernetes cluster no está accesible"
    fi
else
    echo -e "${YELLOW}⚠${NC} kubectl no disponible, saltando verificación de Kubernetes"
fi
echo ""

echo "5. Verificando configuración de Docker Swarm (si aplica)..."
if command -v docker &> /dev/null; then
    if docker info | grep -q "Swarm: active"; then
        echo -e "${GREEN}✓${NC} Docker Swarm está activo"
        
        SERVICE_COUNT=$(docker service ls 2>/dev/null | wc -l || echo "0")
        if [ "$SERVICE_COUNT" -gt "1" ]; then
            echo -e "${GREEN}✓${NC} Servicios en Swarm: $((SERVICE_COUNT - 1))"
        else
            echo -e "${YELLOW}⚠${NC} No se encontraron servicios en Swarm"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Docker Swarm no está activo"
    fi
else
    echo -e "${YELLOW}⚠${NC} docker no disponible, saltando verificación de Docker Swarm"
fi
echo ""

echo "=== Resumen ==="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Todas las verificaciones críticas pasaron${NC}"
    exit 0
else
    echo -e "${RED}✗ Se encontraron $ERRORS errores${NC}"
    exit 1
fi


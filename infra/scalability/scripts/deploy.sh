#!/bin/bash
# Script de despliegue para estrategias de escalabilidad
# Facilita el despliegue de todos los componentes de escalabilidad

set -e

NAMESPACE="elixir"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Iniciando despliegue de estrategias de escalabilidad para ELIXIR 2.0"
echo ""

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar prerrequisitos
echo "📋 Verificando prerrequisitos..."
if ! command_exists kubectl; then
    echo "❌ Error: kubectl no está instalado"
    exit 1
fi

if ! kubectl cluster-info &>/dev/null; then
    echo "❌ Error: No se puede conectar al cluster de Kubernetes"
    exit 1
fi

echo "✅ Prerrequisitos verificados"
echo ""

# Crear namespace si no existe
echo "📦 Creando namespace '$NAMESPACE'..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
echo "✅ Namespace creado/verificado"
echo ""

# Desplegar Redis
echo "🔴 Desplegando Redis..."
kubectl apply -f "$BASE_DIR/redis/redis-deployment.yaml"
kubectl apply -f "$BASE_DIR/redis/redis-sentinel-config.yaml"
echo "⏳ Esperando que Redis esté listo..."
kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=300s
echo "✅ Redis desplegado"
echo ""

# Desplegar PostgreSQL (si se requiere)
read -p "¿Deseas desplegar PostgreSQL con alta disponibilidad? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🐘 Desplegando PostgreSQL..."
    
    # Verificar si existe el secreto
    if ! kubectl get secret postgres-secret -n "$NAMESPACE" &>/dev/null; then
        echo "⚠️  Secret 'postgres-secret' no encontrado. Creando..."
        read -sp "Ingresa la contraseña de PostgreSQL: " POSTGRES_PASSWORD
        echo
        kubectl create secret generic postgres-secret \
            --from-literal=username=elixir \
            --from-literal=password="$POSTGRES_PASSWORD" \
            -n "$NAMESPACE"
    fi
    
    kubectl apply -f "$BASE_DIR/database/postgres-ha.yaml"
    echo "⏳ Esperando que PostgreSQL esté listo..."
    kubectl wait --for=condition=ready pod -l app=postgres,role=primary -n "$NAMESPACE" --timeout=300s
    echo "✅ PostgreSQL desplegado"
    echo ""
fi

# Desplegar servicios
echo "⚙️  Desplegando servicios con autoscaling..."
kubectl apply -f "$BASE_DIR/kubernetes/deployments.yaml"
echo "⏳ Esperando que los servicios estén listos..."
kubectl wait --for=condition=available deployment -l app=elixir-core -n "$NAMESPACE" --timeout=300s || true
kubectl wait --for=condition=available deployment -l app=whatsapp-edge -n "$NAMESPACE" --timeout=300s || true
kubectl wait --for=condition=available deployment -l app=chat-orchestrator -n "$NAMESPACE" --timeout=300s || true
echo "✅ Servicios desplegados"
echo ""

# Aplicar autoscaling
echo "📈 Aplicando configuración de autoscaling..."
kubectl apply -f "$BASE_DIR/kubernetes/autoscaling.yaml"
echo "✅ Autoscaling configurado"
echo ""

# Aplicar balanceadores de carga
echo "⚖️  Aplicando balanceadores de carga..."
kubectl apply -f "$BASE_DIR/kubernetes/load-balancer.yaml"
echo "✅ Balanceadores de carga configurados"
echo ""

# Desplegar monitoreo
read -p "¿Deseas desplegar Prometheus para monitoreo? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📊 Desplegando Prometheus..."
    kubectl apply -f "$BASE_DIR/monitoring/prometheus.yml"
    echo "✅ Prometheus desplegado"
    echo ""
fi

# Mostrar estado
echo "📊 Estado del despliegue:"
echo ""
echo "Pods:"
kubectl get pods -n "$NAMESPACE"
echo ""
echo "Servicios:"
kubectl get svc -n "$NAMESPACE"
echo ""
echo "HPA (Autoscaling):"
kubectl get hpa -n "$NAMESPACE"
echo ""

echo "✅ Despliegue completado exitosamente!"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Verificar que todos los pods estén en estado 'Running'"
echo "  2. Revisar los logs: kubectl logs -n $NAMESPACE <pod-name>"
echo "  3. Monitorear métricas: kubectl top pods -n $NAMESPACE"
echo "  4. Acceder a Prometheus (si se desplegó): kubectl port-forward -n $NAMESPACE svc/prometheus 9090:9090"


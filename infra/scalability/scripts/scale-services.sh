#!/bin/bash
# Script para escalar servicios manualmente
# Útil para pruebas o ajustes manuales

set -e

NAMESPACE="elixir"

if [ $# -lt 2 ]; then
    echo "Uso: $0 <servicio> <réplicas>"
    echo ""
    echo "Servicios disponibles:"
    echo "  - elixir-core"
    echo "  - whatsapp-edge"
    echo "  - chat-orchestrator"
    echo ""
    echo "Ejemplo: $0 elixir-core 5"
    exit 1
fi

SERVICE=$1
REPLICAS=$2

# Validar servicio
case $SERVICE in
    elixir-core|whatsapp-edge|chat-orchestrator)
        ;;
    *)
        echo "❌ Error: Servicio '$SERVICE' no válido"
        echo "Servicios válidos: elixir-core, whatsapp-edge, chat-orchestrator"
        exit 1
        ;;
esac

# Validar número de réplicas
if ! [[ "$REPLICAS" =~ ^[0-9]+$ ]] || [ "$REPLICAS" -lt 1 ]; then
    echo "❌ Error: Número de réplicas debe ser un entero positivo"
    exit 1
fi

echo "📈 Escalando servicio '$SERVICE' a $REPLICAS réplicas..."

kubectl scale deployment "$SERVICE" --replicas="$REPLICAS" -n "$NAMESPACE"

echo "⏳ Esperando que las réplicas estén listas..."
kubectl wait --for=condition=available deployment "$SERVICE" -n "$NAMESPACE" --timeout=300s

echo "✅ Servicio '$SERVICE' escalado a $REPLICAS réplicas"
echo ""
echo "Estado actual:"
kubectl get deployment "$SERVICE" -n "$NAMESPACE"
kubectl get pods -l app="$SERVICE" -n "$NAMESPACE"


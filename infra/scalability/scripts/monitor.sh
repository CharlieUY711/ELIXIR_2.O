#!/bin/bash
# Script para monitorear el estado de los servicios y métricas de escalabilidad

NAMESPACE="elixir"

echo "📊 Monitoreo de Escalabilidad - ELIXIR 2.0"
echo "=========================================="
echo ""

# Estado de pods
echo "🔵 Estado de Pods:"
echo "------------------"
kubectl get pods -n "$NAMESPACE" -o wide
echo ""

# Uso de recursos
echo "💻 Uso de Recursos (CPU/Memoria):"
echo "-----------------------------------"
kubectl top pods -n "$NAMESPACE" 2>/dev/null || echo "⚠️  Metrics Server no disponible"
echo ""

# Estado de HPA
echo "📈 Estado de Autoscaling (HPA):"
echo "--------------------------------"
kubectl get hpa -n "$NAMESPACE"
echo ""

# Detalles de HPA
for hpa in $(kubectl get hpa -n "$NAMESPACE" -o name); do
    echo "Detalles de $hpa:"
    kubectl describe "$hpa" -n "$NAMESPACE" | grep -A 10 "Metrics:"
    echo ""
done

# Estado de servicios
echo "⚖️  Estado de Servicios:"
echo "------------------------"
kubectl get svc -n "$NAMESPACE"
echo ""

# Estado de Redis
echo "🔴 Estado de Redis:"
echo "-------------------"
kubectl get pods -l app=redis -n "$NAMESPACE"
echo ""

# Estado de bases de datos (si existe)
if kubectl get pods -l app=postgres -n "$NAMESPACE" &>/dev/null; then
    echo "🐘 Estado de PostgreSQL:"
    echo "------------------------"
    kubectl get pods -l app=postgres -n "$NAMESPACE"
    echo ""
fi

# Eventos recientes
echo "📝 Eventos Recientes (últimos 10):"
echo "-----------------------------------"
kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -10
echo ""

# Resumen de réplicas
echo "📊 Resumen de Réplicas:"
echo "-----------------------"
for deployment in elixir-core whatsapp-edge chat-orchestrator; do
    if kubectl get deployment "$deployment" -n "$NAMESPACE" &>/dev/null; then
        desired=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
        ready=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
        echo "  $deployment: $ready/$desired réplicas listas"
    fi
done
echo ""

echo "✅ Monitoreo completado"
echo ""
echo "💡 Comandos útiles:"
echo "  - Ver logs: kubectl logs -n $NAMESPACE <pod-name>"
echo "  - Describir pod: kubectl describe pod -n $NAMESPACE <pod-name>"
echo "  - Ver métricas detalladas: kubectl top pod -n $NAMESPACE <pod-name>"


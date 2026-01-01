#!/bin/bash
# Script de Backup de Configuraciones
# Para ELIXIR 2.0 - Fase 7.5: Redundancia

set -euo pipefail

# Configuración
BACKUP_DIR="${BACKUP_DIR:-/backups/config}"
RETENTION_DAYS="${RETENTION_DAYS:-90}"
K8S_NAMESPACE="${K8S_NAMESPACE:-elixir}"
S3_BUCKET="${S3_BUCKET:-}"
AZURE_CONTAINER="${AZURE_CONTAINER:-}"
GCS_BUCKET="${GCS_BUCKET:-}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Crear directorio de backup si no existe
mkdir -p "$BACKUP_DIR"

# Nombre del archivo de backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR_TIMESTAMP="$BACKUP_DIR/config_${TIMESTAMP}"

log "Iniciando backup de configuraciones"
log "Destino: $BACKUP_DIR_TIMESTAMP"

mkdir -p "$BACKUP_DIR_TIMESTAMP"

# Backup de Kubernetes si kubectl está disponible
if command -v kubectl &> /dev/null; then
    log "Backing up configuraciones de Kubernetes..."
    
    # Backup de ConfigMaps
    mkdir -p "$BACKUP_DIR_TIMESTAMP/k8s/configmaps"
    for cm in $(kubectl get configmaps -n "$K8S_NAMESPACE" -o name 2>/dev/null | cut -d/ -f2); do
        kubectl get configmap "$cm" -n "$K8S_NAMESPACE" -o yaml > "$BACKUP_DIR_TIMESTAMP/k8s/configmaps/$cm.yaml" 2>/dev/null || true
    done
    
    # Backup de Secrets (sin valores sensibles en output)
    mkdir -p "$BACKUP_DIR_TIMESTAMP/k8s/secrets"
    for secret in $(kubectl get secrets -n "$K8S_NAMESPACE" -o name 2>/dev/null | cut -d/ -f2); do
        kubectl get secret "$secret" -n "$K8S_NAMESPACE" -o yaml > "$BACKUP_DIR_TIMESTAMP/k8s/secrets/$secret.yaml" 2>/dev/null || true
    done
    
    # Backup de Deployments
    mkdir -p "$BACKUP_DIR_TIMESTAMP/k8s/deployments"
    for deploy in $(kubectl get deployments -n "$K8S_NAMESPACE" -o name 2>/dev/null | cut -d/ -f2); do
        kubectl get deployment "$deploy" -n "$K8S_NAMESPACE" -o yaml > "$BACKUP_DIR_TIMESTAMP/k8s/deployments/$deploy.yaml" 2>/dev/null || true
    done
    
    # Backup de Services
    mkdir -p "$BACKUP_DIR_TIMESTAMP/k8s/services"
    for svc in $(kubectl get services -n "$K8S_NAMESPACE" -o name 2>/dev/null | cut -d/ -f2); do
        kubectl get service "$svc" -n "$K8S_NAMESPACE" -o yaml > "$BACKUP_DIR_TIMESTAMP/k8s/services/$svc.yaml" 2>/dev/null || true
    done
    
    log "Backup de Kubernetes completado"
fi

# Backup de archivos de configuración locales
log "Backing up archivos de configuración locales..."

# Backup de infra/
if [ -d "infra" ]; then
    mkdir -p "$BACKUP_DIR_TIMESTAMP/infra"
    cp -r infra/* "$BACKUP_DIR_TIMESTAMP/infra/" 2>/dev/null || true
    log "Backup de infra/ completado"
fi

# Backup de scripts
if [ -d "infra/scripts" ]; then
    mkdir -p "$BACKUP_DIR_TIMESTAMP/scripts"
    cp -r infra/scripts/* "$BACKUP_DIR_TIMESTAMP/scripts/" 2>/dev/null || true
    log "Backup de scripts/ completado"
fi

# Backup de configuraciones de servicios
if [ -d "services" ]; then
    mkdir -p "$BACKUP_DIR_TIMESTAMP/services"
    find services -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.env*" | \
        while read file; do
            mkdir -p "$BACKUP_DIR_TIMESTAMP/$(dirname "$file")"
            cp "$file" "$BACKUP_DIR_TIMESTAMP/$file" 2>/dev/null || true
        done
    log "Backup de servicios/ completado"
fi

# Comprimir backup
log "Comprimiendo backup..."
BACKUP_ARCHIVE="$BACKUP_DIR/config_${TIMESTAMP}.tar.gz"
if tar -czf "$BACKUP_ARCHIVE" -C "$BACKUP_DIR" "config_${TIMESTAMP}"; then
    rm -rf "$BACKUP_DIR_TIMESTAMP"
    log "Compresión completada: $BACKUP_ARCHIVE"
else
    error "Error al comprimir backup"
    exit 1
fi

# Verificar integridad
log "Verificando integridad del backup..."
BACKUP_SIZE=$(stat -f%z "$BACKUP_ARCHIVE" 2>/dev/null || stat -c%s "$BACKUP_ARCHIVE" 2>/dev/null)
if [ "$BACKUP_SIZE" -gt 0 ]; then
    log "Backup válido. Tamaño: $(numfmt --to=iec-i --suffix=B $BACKUP_SIZE 2>/dev/null || echo "${BACKUP_SIZE} bytes")"
else
    error "Backup inválido o vacío"
    exit 1
fi

# Upload a S3 si está configurado
if [ -n "$S3_BUCKET" ]; then
    log "Subiendo backup a S3: s3://$S3_BUCKET/"
    if aws s3 cp "$BACKUP_ARCHIVE" "s3://$S3_BUCKET/config/" --storage-class STANDARD_IA; then
        log "Upload a S3 completado"
    else
        warn "Error al subir a S3, continuando..."
    fi
fi

# Upload a Azure Blob si está configurado
if [ -n "$AZURE_CONTAINER" ] && [ -n "${AZURE_STORAGE_ACCOUNT:-}" ]; then
    log "Subiendo backup a Azure Blob: $AZURE_CONTAINER"
    if az storage blob upload \
        --account-name "$AZURE_STORAGE_ACCOUNT" \
        --container-name "$AZURE_CONTAINER" \
        --name "config/$(basename $BACKUP_ARCHIVE)" \
        --file "$BACKUP_ARCHIVE" \
        --tier Cool; then
        log "Upload a Azure completado"
    else
        warn "Error al subir a Azure, continuando..."
    fi
fi

# Upload a GCS si está configurado
if [ -n "$GCS_BUCKET" ]; then
    log "Subiendo backup a GCS: gs://$GCS_BUCKET/"
    if gsutil -m cp "$BACKUP_ARCHIVE" "gs://$GCS_BUCKET/config/"; then
        log "Upload a GCS completado"
    else
        warn "Error al subir a GCS, continuando..."
    fi
fi

# Limpiar backups antiguos
log "Limpiando backups antiguos (retención: $RETENTION_DAYS días)..."
find "$BACKUP_DIR" -name "config_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
log "Limpieza completada"

log "Backup finalizado exitosamente: $BACKUP_ARCHIVE"
exit 0


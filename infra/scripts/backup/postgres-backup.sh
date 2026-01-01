#!/bin/bash
# Script de Backup de PostgreSQL
# Para ELIXIR 2.0 - Fase 7.5: Redundancia

set -euo pipefail

# Configuración
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-elixir}"
DB_USER="${DB_USER:-elixir_user}"
COMPRESS="${COMPRESS:-true}"
ENCRYPT="${ENCRYPT:-false}"
S3_BUCKET="${S3_BUCKET:-}"
AZURE_CONTAINER="${AZURE_CONTAINER:-}"
GCS_BUCKET="${GCS_BUCKET:-}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
BACKUP_FILE="$BACKUP_DIR/postgres_${DB_NAME}_${TIMESTAMP}.sql"
FINAL_BACKUP_FILE="$BACKUP_FILE"

log "Iniciando backup de PostgreSQL"
log "Base de datos: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"
log "Destino: $BACKUP_FILE"

# Realizar backup
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-privileges \
    --verbose \
    > "$BACKUP_FILE" 2>&1; then
    log "Backup completado exitosamente"
else
    error "Error al realizar backup"
    exit 1
fi

# Comprimir si está habilitado
if [ "$COMPRESS" = "true" ]; then
    log "Comprimiendo backup..."
    if gzip "$BACKUP_FILE"; then
        FINAL_BACKUP_FILE="${BACKUP_FILE}.gz"
        log "Compresión completada: $FINAL_BACKUP_FILE"
    else
        error "Error al comprimir backup"
        exit 1
    fi
fi

# Encriptar si está habilitado
if [ "$ENCRYPT" = "true" ] && [ -n "${ENCRYPTION_KEY:-}" ]; then
    log "Encriptando backup..."
    if openssl enc -aes-256-cbc -salt -in "$FINAL_BACKUP_FILE" \
        -out "${FINAL_BACKUP_FILE}.enc" -pass pass:"$ENCRYPTION_KEY"; then
        rm "$FINAL_BACKUP_FILE"
        FINAL_BACKUP_FILE="${FINAL_BACKUP_FILE}.enc"
        log "Encriptación completada: $FINAL_BACKUP_FILE"
    else
        error "Error al encriptar backup"
        exit 1
    fi
fi

# Verificar integridad
log "Verificando integridad del backup..."
BACKUP_SIZE=$(stat -f%z "$FINAL_BACKUP_FILE" 2>/dev/null || stat -c%s "$FINAL_BACKUP_FILE" 2>/dev/null)
if [ "$BACKUP_SIZE" -gt 0 ]; then
    log "Backup válido. Tamaño: $(numfmt --to=iec-i --suffix=B $BACKUP_SIZE 2>/dev/null || echo "${BACKUP_SIZE} bytes")"
else
    error "Backup inválido o vacío"
    exit 1
fi

# Upload a S3 si está configurado
if [ -n "$S3_BUCKET" ]; then
    log "Subiendo backup a S3: s3://$S3_BUCKET/"
    if aws s3 cp "$FINAL_BACKUP_FILE" "s3://$S3_BUCKET/postgres/" --storage-class STANDARD_IA; then
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
        --name "postgres/$(basename $FINAL_BACKUP_FILE)" \
        --file "$FINAL_BACKUP_FILE" \
        --tier Cool; then
        log "Upload a Azure completado"
    else
        warn "Error al subir a Azure, continuando..."
    fi
fi

# Upload a GCS si está configurado
if [ -n "$GCS_BUCKET" ]; then
    log "Subiendo backup a GCS: gs://$GCS_BUCKET/"
    if gsutil -m cp "$FINAL_BACKUP_FILE" "gs://$GCS_BUCKET/postgres/"; then
        log "Upload a GCS completado"
    else
        warn "Error al subir a GCS, continuando..."
    fi
fi

# Limpiar backups antiguos
log "Limpiando backups antiguos (retención: $RETENTION_DAYS días)..."
find "$BACKUP_DIR" -name "postgres_${DB_NAME}_*.sql*" -type f -mtime +$RETENTION_DAYS -delete
log "Limpieza completada"

log "Backup finalizado exitosamente: $FINAL_BACKUP_FILE"
exit 0


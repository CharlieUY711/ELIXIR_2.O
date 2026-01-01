#!/bin/bash
# Script de Backup de Redis
# Para ELIXIR 2.0 - Fase 7.5: Redundancia

set -euo pipefail

# Configuración
BACKUP_DIR="${BACKUP_DIR:-/backups/redis}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"
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
BACKUP_FILE="$BACKUP_DIR/redis_${TIMESTAMP}.rdb"
AOF_FILE="$BACKUP_DIR/redis_${TIMESTAMP}.aof"

log "Iniciando backup de Redis"
log "Host: $REDIS_HOST:$REDIS_PORT"
log "Destino: $BACKUP_DIR"

# Construir comando redis-cli
REDIS_CMD="redis-cli -h $REDIS_HOST -p $REDIS_PORT"
if [ -n "$REDIS_PASSWORD" ]; then
    REDIS_CMD="$REDIS_CMD -a $REDIS_PASSWORD"
fi

# Verificar conexión
if ! $REDIS_CMD ping > /dev/null 2>&1; then
    error "No se puede conectar a Redis"
    exit 1
fi

# Obtener directorio de datos de Redis
REDIS_DATA_DIR=$($REDIS_CMD CONFIG GET dir | tail -n 1)
REDIS_DBFILENAME=$($REDIS_CMD CONFIG GET dbfilename | tail -n 1)

log "Directorio de datos: $REDIS_DATA_DIR"
log "Archivo RDB: $REDIS_DBFILENAME"

# Trigger BGSAVE para crear snapshot
log "Iniciando BGSAVE..."
if $REDIS_CMD BGSAVE > /dev/null 2>&1; then
    # Esperar a que BGSAVE complete
    while [ "$($REDIS_CMD LASTSAVE)" = "$($REDIS_CMD LASTSAVE)" ]; do
        sleep 1
    done
    log "BGSAVE completado"
else
    error "Error al ejecutar BGSAVE"
    exit 1
fi

# Copiar archivo RDB
RDB_SOURCE="$REDIS_DATA_DIR/$REDIS_DBFILENAME"
if [ -f "$RDB_SOURCE" ]; then
    if cp "$RDB_SOURCE" "$BACKUP_FILE"; then
        log "RDB copiado: $BACKUP_FILE"
    else
        error "Error al copiar RDB"
        exit 1
    fi
else
    error "Archivo RDB no encontrado: $RDB_SOURCE"
    exit 1
fi

# Copiar AOF si está habilitado
AOF_ENABLED=$($REDIS_CMD CONFIG GET appendonly | tail -n 1)
if [ "$AOF_ENABLED" = "yes" ]; then
    AOF_FILENAME=$($REDIS_CMD CONFIG GET appendfilename | tail -n 1)
    AOF_SOURCE="$REDIS_DATA_DIR/$AOF_FILENAME"
    if [ -f "$AOF_SOURCE" ]; then
        if cp "$AOF_SOURCE" "$AOF_FILE"; then
            log "AOF copiado: $AOF_FILE"
        else
            warn "Error al copiar AOF, continuando..."
        fi
    fi
fi

# Comprimir backups
log "Comprimiendo backups..."
if gzip "$BACKUP_FILE"; then
    BACKUP_FILE="${BACKUP_FILE}.gz"
    log "RDB comprimido: $BACKUP_FILE"
fi

if [ -f "$AOF_FILE" ]; then
    if gzip "$AOF_FILE"; then
        AOF_FILE="${AOF_FILE}.gz"
        log "AOF comprimido: $AOF_FILE"
    fi
fi

# Verificar integridad
log "Verificando integridad del backup..."
BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
if [ "$BACKUP_SIZE" -gt 0 ]; then
    log "Backup válido. Tamaño: $(numfmt --to=iec-i --suffix=B $BACKUP_SIZE 2>/dev/null || echo "${BACKUP_SIZE} bytes")"
else
    error "Backup inválido o vacío"
    exit 1
fi

# Upload a S3 si está configurado
if [ -n "$S3_BUCKET" ]; then
    log "Subiendo backup a S3: s3://$S3_BUCKET/"
    if aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/redis/" --storage-class STANDARD_IA; then
        log "Upload a S3 completado"
        if [ -f "$AOF_FILE" ]; then
            aws s3 cp "$AOF_FILE" "s3://$S3_BUCKET/redis/" --storage-class STANDARD_IA || true
        fi
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
        --name "redis/$(basename $BACKUP_FILE)" \
        --file "$BACKUP_FILE" \
        --tier Cool; then
        log "Upload a Azure completado"
        if [ -f "$AOF_FILE" ]; then
            az storage blob upload \
                --account-name "$AZURE_STORAGE_ACCOUNT" \
                --container-name "$AZURE_CONTAINER" \
                --name "redis/$(basename $AOF_FILE)" \
                --file "$AOF_FILE" \
                --tier Cool || true
        fi
    else
        warn "Error al subir a Azure, continuando..."
    fi
fi

# Upload a GCS si está configurado
if [ -n "$GCS_BUCKET" ]; then
    log "Subiendo backup a GCS: gs://$GCS_BUCKET/"
    if gsutil -m cp "$BACKUP_FILE" "gs://$GCS_BUCKET/redis/"; then
        log "Upload a GCS completado"
        if [ -f "$AOF_FILE" ]; then
            gsutil -m cp "$AOF_FILE" "gs://$GCS_BUCKET/redis/" || true
        fi
    else
        warn "Error al subir a GCS, continuando..."
    fi
fi

# Limpiar backups antiguos
log "Limpiando backups antiguos (retención: $RETENTION_DAYS días)..."
find "$BACKUP_DIR" -name "redis_*.rdb*" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "redis_*.aof*" -type f -mtime +$RETENTION_DAYS -delete
log "Limpieza completada"

log "Backup finalizado exitosamente: $BACKUP_FILE"
exit 0


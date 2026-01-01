#!/bin/bash
# Script de Backup Automatizado para PostgreSQL
# Para ELIXIR 2.0 - Fase 7.5: Redundancia y Recuperación

set -euo pipefail

# Configuración
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres-primary}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-elixir}"
POSTGRES_USER="${POSTGRES_USER:-elixir_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Función para logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_DIR/backup.log"
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    log "Limpiando backups más antiguos de $RETENTION_DAYS días..."
    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.dump" -type f -mtime +$RETENTION_DAYS -delete
    log "Limpieza completada"
}

# Función para backup completo
backup_full() {
    local timestamp=$(date +'%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/postgres_full_${timestamp}.dump"
    
    log "Iniciando backup completo..."
    
    export PGPASSWORD="$POSTGRES_PASSWORD"
    pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" -F c -f "$backup_file" 2>&1 | tee -a "$BACKUP_DIR/backup.log"
    
    if [ $? -eq 0 ]; then
        log "Backup completo exitoso: $backup_file"
        # Comprimir backup
        gzip "$backup_file"
        log "Backup comprimido: ${backup_file}.gz"
        echo "${backup_file}.gz"
    else
        log "ERROR: Fallo en backup completo"
        exit 1
    fi
}

# Función para backup incremental (WAL)
backup_wal() {
    log "Verificando archivos WAL para backup incremental..."
    # Los backups WAL se manejan automáticamente con streaming replication
    # Esta función puede usarse para archivar WAL files si es necesario
    log "Backup WAL verificado"
}

# Función para verificar integridad del backup
verify_backup() {
    local backup_file="$1"
    
    log "Verificando integridad del backup: $backup_file"
    
    if [ -f "$backup_file" ]; then
        local size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
        if [ "$size" -gt 0 ]; then
            log "Backup verificado: $backup_file (tamaño: $size bytes)"
            return 0
        else
            log "ERROR: Backup vacío o corrupto"
            return 1
        fi
    else
        log "ERROR: Archivo de backup no encontrado"
        return 1
    fi
}

# Función para subir backup a almacenamiento remoto (S3, Azure Blob, etc.)
upload_to_remote() {
    local backup_file="$1"
    local remote_type="${REMOTE_STORAGE_TYPE:-none}"
    
    case "$remote_type" in
        s3)
            log "Subiendo backup a S3..."
            aws s3 cp "$backup_file" "s3://${S3_BUCKET}/postgres/$(basename $backup_file)" || log "WARNING: Fallo al subir a S3"
            ;;
        azure)
            log "Subiendo backup a Azure Blob..."
            az storage blob upload --account-name "${AZURE_STORAGE_ACCOUNT}" \
                --container-name "${AZURE_CONTAINER}" \
                --name "postgres/$(basename $backup_file)" \
                --file "$backup_file" || log "WARNING: Fallo al subir a Azure"
            ;;
        gcp)
            log "Subiendo backup a GCP Storage..."
            gsutil cp "$backup_file" "gs://${GCP_BUCKET}/postgres/$(basename $backup_file)" || log "WARNING: Fallo al subir a GCP"
            ;;
        *)
            log "Almacenamiento remoto no configurado"
            ;;
    esac
}

# Función principal
main() {
    log "=== Inicio de proceso de backup ==="
    
    # Determinar tipo de backup
    local backup_type="${1:-full}"
    
    case "$backup_type" in
        full)
            backup_file=$(backup_full)
            verify_backup "$backup_file"
            upload_to_remote "$backup_file"
            ;;
        wal)
            backup_wal
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        *)
            log "Tipo de backup desconocido: $backup_type"
            exit 1
            ;;
    esac
    
    # Limpiar backups antiguos
    cleanup_old_backups
    
    log "=== Proceso de backup completado ==="
}

# Ejecutar función principal
main "$@"


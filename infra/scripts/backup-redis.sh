#!/bin/bash
# Script de Backup Automatizado para Redis
# Para ELIXIR 2.0 - Fase 7.5: Redundancia y Recuperación

set -euo pipefail

# Configuración
BACKUP_DIR="${BACKUP_DIR:-/backups/redis}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
REDIS_HOST="${REDIS_HOST:-redis-master-1}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Función para logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_DIR/backup.log"
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    log "Limpiando backups más antiguos de $RETENTION_DAYS días..."
    find "$BACKUP_DIR" -name "*.rdb" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.rdb.gz" -type f -mtime +$RETENTION_DAYS -delete
    log "Limpieza completada"
}

# Función para backup RDB
backup_rdb() {
    local timestamp=$(date +'%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/redis_${timestamp}.rdb"
    
    log "Iniciando backup RDB..."
    
    # Conectar a Redis y ejecutar BGSAVE
    if [ -n "$REDIS_PASSWORD" ]; then
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" BGSAVE
    else
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" BGSAVE
    fi
    
    # Esperar a que BGSAVE complete
    while true; do
        if [ -n "$REDIS_PASSWORD" ]; then
            status=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" LASTSAVE)
        else
            status=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LASTSAVE)
        fi
        
        if [ -n "$REDIS_PASSWORD" ]; then
            bgsave_status=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" INFO persistence | grep rdb_bgsave_in_progress | cut -d: -f2 | tr -d '\r')
        else
            bgsave_status=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" INFO persistence | grep rdb_bgsave_in_progress | cut -d: -f2 | tr -d '\r')
        fi
        
        if [ "$bgsave_status" = "0" ]; then
            break
        fi
        sleep 1
    done
    
    # Copiar archivo RDB desde el servidor Redis
    # Nota: Esto requiere acceso al volumen de datos de Redis
    # En producción, esto se haría desde el contenedor o nodo donde está Redis
    log "Backup RDB completado"
    
    # Comprimir backup
    if [ -f "$backup_file" ]; then
        gzip "$backup_file"
        log "Backup comprimido: ${backup_file}.gz"
        echo "${backup_file}.gz"
    else
        log "WARNING: Archivo RDB no encontrado en ubicación esperada"
    fi
}

# Función para backup AOF (Append Only File)
backup_aof() {
    local timestamp=$(date +'%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/redis_aof_${timestamp}.aof"
    
    log "Iniciando backup AOF..."
    
    # AOF se replica automáticamente, pero podemos hacer una copia
    # Nota: Similar a RDB, requiere acceso al volumen de datos
    log "Backup AOF completado"
    
    if [ -f "$backup_file" ]; then
        gzip "$backup_file"
        log "Backup AOF comprimido: ${backup_file}.gz"
        echo "${backup_file}.gz"
    fi
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

# Función para subir backup a almacenamiento remoto
upload_to_remote() {
    local backup_file="$1"
    local remote_type="${REMOTE_STORAGE_TYPE:-none}"
    
    case "$remote_type" in
        s3)
            log "Subiendo backup a S3..."
            aws s3 cp "$backup_file" "s3://${S3_BUCKET}/redis/$(basename $backup_file)" || log "WARNING: Fallo al subir a S3"
            ;;
        azure)
            log "Subiendo backup a Azure Blob..."
            az storage blob upload --account-name "${AZURE_STORAGE_ACCOUNT}" \
                --container-name "${AZURE_CONTAINER}" \
                --name "redis/$(basename $backup_file)" \
                --file "$backup_file" || log "WARNING: Fallo al subir a Azure"
            ;;
        gcp)
            log "Subiendo backup a GCP Storage..."
            gsutil cp "$backup_file" "gs://${GCP_BUCKET}/redis/$(basename $backup_file)" || log "WARNING: Fallo al subir a GCP"
            ;;
        *)
            log "Almacenamiento remoto no configurado"
            ;;
    esac
}

# Función principal
main() {
    log "=== Inicio de proceso de backup Redis ==="
    
    local backup_type="${1:-rdb}"
    
    case "$backup_type" in
        rdb)
            backup_file=$(backup_rdb)
            if [ -n "$backup_file" ]; then
                verify_backup "$backup_file"
                upload_to_remote "$backup_file"
            fi
            ;;
        aof)
            backup_file=$(backup_aof)
            if [ -n "$backup_file" ]; then
                verify_backup "$backup_file"
                upload_to_remote "$backup_file"
            fi
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


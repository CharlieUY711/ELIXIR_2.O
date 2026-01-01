#!/bin/bash
# Script de Restauración para PostgreSQL
# Para ELIXIR 2.0 - Fase 7.5: Redundancia y Recuperación

set -euo pipefail

# Configuración
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres-primary}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-elixir}"
POSTGRES_USER="${POSTGRES_USER:-elixir_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"

# Función para logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_DIR/restore.log"
}

# Función para listar backups disponibles
list_backups() {
    log "Backups disponibles:"
    ls -lh "$BACKUP_DIR"/*.dump.gz 2>/dev/null | awk '{print $9, $5}' || log "No se encontraron backups"
}

# Función para restaurar desde backup
restore_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log "ERROR: Archivo de backup no encontrado: $backup_file"
        exit 1
    fi
    
    log "Iniciando restauración desde: $backup_file"
    
    # Descomprimir si es necesario
    local temp_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        temp_file="${backup_file%.gz}"
        log "Descomprimiendo backup..."
        gunzip -c "$backup_file" > "$temp_file"
    fi
    
    # Confirmar antes de restaurar
    read -p "¿Está seguro de que desea restaurar? Esto sobrescribirá la base de datos actual. (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log "Restauración cancelada por el usuario"
        [ -f "$temp_file" ] && [ "$temp_file" != "$backup_file" ] && rm -f "$temp_file"
        exit 0
    fi
    
    # Detener conexiones activas (en producción, esto debe hacerse con más cuidado)
    log "Cerrando conexiones activas..."
    export PGPASSWORD="$POSTGRES_PASSWORD"
    psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" || true
    
    # Eliminar base de datos existente y recrear
    log "Eliminando base de datos existente..."
    psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        -d postgres -c "DROP DATABASE IF EXISTS $POSTGRES_DB;" || log "WARNING: No se pudo eliminar la base de datos"
    
    log "Creando nueva base de datos..."
    psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        -d postgres -c "CREATE DATABASE $POSTGRES_DB;" || {
        log "ERROR: No se pudo crear la base de datos"
        exit 1
    }
    
    # Restaurar backup
    log "Restaurando datos..."
    pg_restore -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" -v "$temp_file" 2>&1 | tee -a "$BACKUP_DIR/restore.log"
    
    if [ $? -eq 0 ]; then
        log "Restauración completada exitosamente"
    else
        log "ERROR: Fallo en la restauración"
        exit 1
    fi
    
    # Limpiar archivo temporal
    [ -f "$temp_file" ] && [ "$temp_file" != "$backup_file" ] && rm -f "$temp_file"
    
    log "=== Restauración completada ==="
}

# Función para descargar backup desde almacenamiento remoto
download_from_remote() {
    local backup_file="$1"
    local remote_type="${REMOTE_STORAGE_TYPE:-none}"
    
    case "$remote_type" in
        s3)
            log "Descargando backup desde S3..."
            aws s3 cp "s3://${S3_BUCKET}/postgres/$(basename $backup_file)" "$BACKUP_DIR/$(basename $backup_file)" || {
                log "ERROR: Fallo al descargar desde S3"
                exit 1
            }
            ;;
        azure)
            log "Descargando backup desde Azure Blob..."
            az storage blob download --account-name "${AZURE_STORAGE_ACCOUNT}" \
                --container-name "${AZURE_CONTAINER}" \
                --name "postgres/$(basename $backup_file)" \
                --file "$BACKUP_DIR/$(basename $backup_file)" || {
                log "ERROR: Fallo al descargar desde Azure"
                exit 1
            }
            ;;
        gcp)
            log "Descargando backup desde GCP Storage..."
            gsutil cp "gs://${GCP_BUCKET}/postgres/$(basename $backup_file)" "$BACKUP_DIR/$(basename $backup_file)" || {
                log "ERROR: Fallo al descargar desde GCP"
                exit 1
            }
            ;;
        *)
            log "Almacenamiento remoto no configurado, usando backup local"
            ;;
    esac
}

# Función principal
main() {
    local action="${1:-list}"
    
    case "$action" in
        list)
            list_backups
            ;;
        restore)
            if [ -z "${2:-}" ]; then
                log "ERROR: Debe especificar el archivo de backup"
                log "Uso: $0 restore <backup_file> [--from-remote]"
                exit 1
            fi
            
            local backup_file="$2"
            
            # Si se especifica --from-remote, descargar primero
            if [ "${3:-}" = "--from-remote" ]; then
                download_from_remote "$backup_file"
                backup_file="$BACKUP_DIR/$(basename $backup_file)"
            fi
            
            restore_backup "$backup_file"
            ;;
        *)
            log "Acción desconocida: $action"
            log "Uso: $0 [list|restore <backup_file> [--from-remote]]"
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"


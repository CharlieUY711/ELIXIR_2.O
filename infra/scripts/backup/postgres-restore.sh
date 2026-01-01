#!/bin/bash
# Script de Restauración de PostgreSQL
# Para ELIXIR 2.0 - Fase 7.5: Redundancia

set -euo pipefail

# Configuración
BACKUP_FILE="${1:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-elixir}"
DB_USER="${DB_USER:-elixir_user}"
POINT_IN_TIME="${POINT_IN_TIME:-}"

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

# Validar archivo de backup
if [ -z "$BACKUP_FILE" ]; then
    error "Uso: $0 <archivo_backup> [point_in_time]"
    error "Ejemplo: $0 /backups/postgres/postgres_elixir_20240101_020000.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    error "Archivo de backup no encontrado: $BACKUP_FILE"
    exit 1
fi

log "Iniciando restauración de PostgreSQL"
log "Archivo: $BACKUP_FILE"
log "Base de datos: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"

# Confirmar restauración
warn "ADVERTENCIA: Esta operación eliminará todos los datos existentes en la base de datos $DB_NAME"
read -p "¿Continuar? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    log "Restauración cancelada"
    exit 0
fi

# Preparar archivo de backup
RESTORE_FILE="$BACKUP_FILE"

# Desencriptar si es necesario
if [[ "$BACKUP_FILE" == *.enc ]]; then
    log "Desencriptando backup..."
    if [ -z "${ENCRYPTION_KEY:-}" ]; then
        error "Se requiere ENCRYPTION_KEY para desencriptar"
        exit 1
    fi
    RESTORE_FILE="${BACKUP_FILE%.enc}"
    if ! openssl enc -aes-256-cbc -d -in "$BACKUP_FILE" \
        -out "$RESTORE_FILE" -pass pass:"$ENCRYPTION_KEY"; then
        error "Error al desencriptar backup"
        exit 1
    fi
    log "Desencriptación completada"
fi

# Descomprimir si es necesario
if [[ "$RESTORE_FILE" == *.gz ]]; then
    log "Descomprimiendo backup..."
    DECOMPRESSED_FILE="${RESTORE_FILE%.gz}"
    if ! gunzip -c "$RESTORE_FILE" > "$DECOMPRESSED_FILE"; then
        error "Error al descomprimir backup"
        exit 1
    fi
    RESTORE_FILE="$DECOMPRESSED_FILE"
    log "Descompresión completada"
fi

# Crear base de datos si no existe
log "Verificando existencia de base de datos..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    log "Creando base de datos $DB_NAME..."
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" || true
fi

# Restaurar backup
log "Restaurando backup..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -f "$RESTORE_FILE" > /dev/null 2>&1; then
    log "Restauración completada exitosamente"
else
    error "Error al restaurar backup"
    exit 1
fi

# Point-in-time recovery si se especifica
if [ -n "$POINT_IN_TIME" ]; then
    warn "Point-in-time recovery no implementado en este script"
    warn "Use pg_basebackup y WAL archiving para PITR"
fi

# Limpiar archivos temporales
if [ "$RESTORE_FILE" != "$BACKUP_FILE" ]; then
    rm -f "$RESTORE_FILE"
fi

log "Restauración finalizada exitosamente"
exit 0


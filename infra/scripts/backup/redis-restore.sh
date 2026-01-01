#!/bin/bash
# Script de Restauración de Redis
# Para ELIXIR 2.0 - Fase 7.5: Redundancia

set -euo pipefail

# Configuración
BACKUP_FILE="${1:-}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"

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
    error "Uso: $0 <archivo_backup>"
    error "Ejemplo: $0 /backups/redis/redis_20240101_020000.rdb.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    error "Archivo de backup no encontrado: $BACKUP_FILE"
    exit 1
fi

log "Iniciando restauración de Redis"
log "Archivo: $BACKUP_FILE"
log "Host: $REDIS_HOST:$REDIS_PORT"

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

# Confirmar restauración
warn "ADVERTENCIA: Esta operación eliminará todos los datos existentes en Redis"
read -p "¿Continuar? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    log "Restauración cancelada"
    exit 0
fi

# Preparar archivo de backup
RESTORE_FILE="$BACKUP_FILE"

# Descomprimir si es necesario
if [[ "$BACKUP_FILE" == *.gz ]]; then
    log "Descomprimiendo backup..."
    DECOMPRESSED_FILE="${BACKUP_FILE%.gz}"
    if ! gunzip -c "$BACKUP_FILE" > "$DECOMPRESSED_FILE"; then
        error "Error al descomprimir backup"
        exit 1
    fi
    RESTORE_FILE="$DECOMPRESSED_FILE"
    log "Descompresión completada"
fi

# Obtener directorio de datos de Redis
REDIS_DATA_DIR=$($REDIS_CMD CONFIG GET dir | tail -n 1)
REDIS_DBFILENAME=$($REDIS_CMD CONFIG GET dbfilename | tail -n 1)
RESTORE_DEST="$REDIS_DATA_DIR/$REDIS_DBFILENAME"

log "Directorio de datos: $REDIS_DATA_DIR"
log "Archivo destino: $RESTORE_DEST"

# Detener Redis o deshabilitar escrituras
log "Deshabilitando escrituras en Redis..."
$REDIS_CMD CONFIG SET save "" > /dev/null 2>&1 || true
$REDIS_CMD CONFIG SET appendonly no > /dev/null 2>&1 || true

# Copiar archivo de backup
log "Copiando archivo de backup..."
if cp "$RESTORE_FILE" "$RESTORE_DEST"; then
    log "Archivo copiado exitosamente"
else
    error "Error al copiar archivo de backup"
    exit 1
fi

# Ajustar permisos
chmod 644 "$RESTORE_DEST" || true

# Reiniciar Redis o habilitar escrituras
log "Habilitando escrituras en Redis..."
$REDIS_CMD CONFIG SET save "900 1 300 10 60 10000" > /dev/null 2>&1 || true
$REDIS_CMD CONFIG SET appendonly yes > /dev/null 2>&1 || true

# Verificar restauración
log "Verificando restauración..."
DB_SIZE=$($REDIS_CMD DBSIZE)
log "Base de datos restaurada. Claves: $DB_SIZE"

# Limpiar archivos temporales
if [ "$RESTORE_FILE" != "$BACKUP_FILE" ]; then
    rm -f "$RESTORE_FILE"
fi

log "Restauración finalizada exitosamente"
exit 0


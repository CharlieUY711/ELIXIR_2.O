#!/bin/bash
# Script para configurar backups automatizados con Cron
# Para ELIXIR 2.0 - Fase 7.5: Redundancia y Recuperación

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Crear directorios de backup
mkdir -p "$BACKUP_DIR/postgres"
mkdir -p "$BACKUP_DIR/redis"
mkdir -p "$BACKUP_DIR/config"

log "Configurando backups automatizados..."

# Backup completo de PostgreSQL diario a las 2 AM
(crontab -l 2>/dev/null | grep -v "backup-postgres.sh full" || true; \
 echo "0 2 * * * $SCRIPT_DIR/backup-postgres.sh full >> $BACKUP_DIR/postgres/cron.log 2>&1") | crontab -

# Backup incremental de PostgreSQL cada 6 horas
(crontab -l 2>/dev/null | grep -v "backup-postgres.sh wal" || true; \
 echo "0 */6 * * * $SCRIPT_DIR/backup-postgres.sh wal >> $BACKUP_DIR/postgres/cron.log 2>&1") | crontab -

# Backup de Redis diario a las 3 AM
(crontab -l 2>/dev/null | grep -v "backup-redis.sh rdb" || true; \
 echo "0 3 * * * $SCRIPT_DIR/backup-redis.sh rdb >> $BACKUP_DIR/redis/cron.log 2>&1") | crontab -

# Limpieza de backups antiguos semanalmente (domingos a las 4 AM)
(crontab -l 2>/dev/null | grep -v "backup-postgres.sh cleanup" || true; \
 echo "0 4 * * 0 $SCRIPT_DIR/backup-postgres.sh cleanup >> $BACKUP_DIR/postgres/cron.log 2>&1") | crontab -

(crontab -l 2>/dev/null | grep -v "backup-redis.sh cleanup" || true; \
 echo "0 4 * * 0 $SCRIPT_DIR/backup-redis.sh cleanup >> $BACKUP_DIR/redis/cron.log 2>&1") | crontab -

log "Backups automatizados configurados:"
log "- PostgreSQL completo: Diario a las 2:00 AM"
log "- PostgreSQL incremental: Cada 6 horas"
log "- Redis: Diario a las 3:00 AM"
log "- Limpieza: Semanal (domingos a las 4:00 AM)"

# Mostrar crontab configurado
log "Crontab configurado:"
crontab -l


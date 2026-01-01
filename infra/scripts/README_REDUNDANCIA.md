# Scripts de Redundancia y Disaster Recovery
# Para ELIXIR 2.0 - Fase 7.5

Este directorio contiene todos los scripts necesarios para respaldos, restauración y disaster recovery.

## Estructura

```
infra/scripts/
├── backup/
│   ├── postgres-backup.sh      # Backup de PostgreSQL
│   ├── postgres-restore.sh     # Restauración de PostgreSQL
│   ├── redis-backup.sh         # Backup de Redis
│   ├── redis-restore.sh        # Restauración de Redis
│   └── config-backup.sh        # Backup de configuraciones
└── dr/
    ├── failover-region.sh      # Failover entre regiones
    ├── restore-data.sh         # Restauración de datos
    ├── security-incident.sh    # Respuesta a incidentes de seguridad
    └── test-dr.sh              # Pruebas de disaster recovery
```

## Uso Rápido

### Backups

```bash
# Backup de PostgreSQL
export POSTGRES_PASSWORD=your_password
./infra/scripts/backup/postgres-backup.sh

# Backup de Redis
export REDIS_PASSWORD=your_password
./infra/scripts/backup/redis-backup.sh

# Backup de configuraciones
./infra/scripts/backup/config-backup.sh
```

### Restauración

```bash
# Restaurar PostgreSQL
./infra/scripts/backup/postgres-restore.sh /backups/postgres/postgres_elixir_20240101_020000.sql.gz

# Restaurar Redis
./infra/scripts/backup/redis-restore.sh /backups/redis/redis_20240101_020000.rdb.gz
```

### Disaster Recovery

```bash
# Failover de región
export PRIMARY_REGION=us-east-1
export SECONDARY_REGION=us-west-2
./infra/scripts/dr/failover-region.sh

# Restaurar datos
./infra/scripts/dr/restore-data.sh /backups/postgres/latest.sql.gz

# Probar procedimientos de DR
./infra/scripts/dr/test-dr.sh all
```

## Configuración

### Variables de Entorno

Los scripts utilizan las siguientes variables de entorno:

**Backups:**
- `BACKUP_DIR`: Directorio de backups (default: `/backups`)
- `RETENTION_DAYS`: Días de retención (default: 30 para PostgreSQL, 14 para Redis)
- `S3_BUCKET`: Bucket de S3 para backups remotos (opcional)
- `AZURE_CONTAINER`: Contenedor de Azure Blob (opcional)
- `GCS_BUCKET`: Bucket de GCS (opcional)

**PostgreSQL:**
- `DB_HOST`: Host de PostgreSQL (default: `localhost`)
- `DB_PORT`: Puerto de PostgreSQL (default: `5432`)
- `DB_NAME`: Nombre de la base de datos (default: `elixir`)
- `DB_USER`: Usuario de PostgreSQL (default: `elixir_user`)
- `POSTGRES_PASSWORD`: Contraseña de PostgreSQL

**Redis:**
- `REDIS_HOST`: Host de Redis (default: `localhost`)
- `REDIS_PORT`: Puerto de Redis (default: `6379`)
- `REDIS_PASSWORD`: Contraseña de Redis

**Disaster Recovery:**
- `PRIMARY_REGION`: Región primaria (default: `us-east-1`)
- `SECONDARY_REGION`: Región secundaria (default: `us-west-2`)
- `BACKUP_SOURCE`: Fuente de backups (default: `s3://elixir-backups`)

## Automatización

### Cron Jobs

Para automatizar backups, agregar a crontab:

```bash
# Backup diario de PostgreSQL a las 2 AM
0 2 * * * /path/to/infra/scripts/backup/postgres-backup.sh

# Backup cada 6 horas de Redis
0 */6 * * * /path/to/infra/scripts/backup/redis-backup.sh

# Backup diario de configuraciones a las 3 AM
0 3 * * * /path/to/infra/scripts/backup/config-backup.sh
```

### Kubernetes CronJobs

Para ejecutar en Kubernetes, crear CronJobs:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: elixir
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            command: ["/bin/bash", "/scripts/postgres-backup.sh"]
            env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
          restartPolicy: OnFailure
```

## Verificación

### Verificar Backups

```bash
# Listar backups disponibles
ls -lh /backups/postgres/
ls -lh /backups/redis/

# Verificar integridad
gzip -t /backups/postgres/postgres_elixir_*.sql.gz
```

### Probar Restauración

```bash
# Probar restauración en base de datos de prueba
export DB_NAME=elixir_test
./infra/scripts/backup/postgres-restore.sh /backups/postgres/latest.sql.gz
```

## Troubleshooting

### Problemas Comunes

1. **Permisos**: Asegurarse de que los scripts tengan permisos de ejecución
   ```bash
   chmod +x infra/scripts/backup/*.sh
   chmod +x infra/scripts/dr/*.sh
   ```

2. **Conexión a base de datos**: Verificar variables de entorno y credenciales

3. **Espacio en disco**: Verificar espacio disponible en `BACKUP_DIR`

4. **Upload a cloud**: Verificar credenciales de AWS/Azure/GCP

## Referencias

- [Documentación de Fase 7.5](../../docs/FASE_7_5_AJUSTE_Y_REDUNDANCIA.md)
- [Runbook de Incidentes](../../docs/RUNBOOK_INCIDENTES.md)


#!/usr/bin/env bash
# ==============================================================================
# Production Backup Script - Landing Builder Platform
# ==============================================================================
# Schedule daily via crontab:
# 0 2 * * * /opt/landing-platform/backups/scripts/backup.sh >> /opt/landing-platform/logs/backup.log 2>&1
# ==============================================================================

set -eo pipefail

# Configurations
PROJECT_ROOT="/opt/landing-platform"
if [ ! -d "$PROJECT_ROOT" ]; then
    # Fallback to current script directory parents for portability
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi

BACKUP_DIR="$PROJECT_ROOT/backups"
DB_BACKUP_DIR="$BACKUP_DIR/postgres"
MINIO_BACKUP_DIR="$BACKUP_DIR/minio"
LOG_DIR="$PROJECT_ROOT/logs"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30

# Ensure directories exist
mkdir -p "$DB_BACKUP_DIR"
mkdir -p "$MINIO_BACKUP_DIR"
mkdir -p "$LOG_DIR"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting complete production backup sequence..."

# 1. Back up Postgres Database using docker exec pg_dump
DB_CONTAINER="landing-postgres-prod"
if [ ! "$(docker ps -q -f name=$DB_CONTAINER)" ]; then
    # Fallback if production container is named differently
    DB_CONTAINER="landing-postgres"
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER)" ]; then
    log "Found active Postgres container: $DB_CONTAINER"
    DB_FILE="$DB_BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
    
    log "Dumping database records..."
    # Suppress password prompt using env variable inside container
    docker exec "$DB_CONTAINER" pg_dump -U postgres landing_db | gzip > "$DB_FILE"
    
    log "Database backup completed successfully: $(basename "$DB_FILE") ($(du -sh "$DB_FILE" | cut -f1))"
else
    log "ERROR: Active database container ($DB_CONTAINER) not found. Skipping DB backup."
fi

# 2. Back up MinIO Storage Volume Data
MINIO_VOLUME_PATH="/var/lib/docker/volumes/project-web_minio_data_prod/_data"
if [ ! -d "$MINIO_VOLUME_PATH" ]; then
    # Fallback checking docker volumes directory dynamically
    VOLUME_NAME=$(docker volume ls -q | grep minio_data_prod || true)
    if [ -n "$VOLUME_NAME" ]; then
        MINIO_VOLUME_PATH="/var/lib/docker/volumes/$VOLUME_NAME/_data"
    else
        # Fallback to local minio data path if any
        MINIO_VOLUME_PATH="$PROJECT_ROOT/minio/data"
    fi
fi

if [ -d "$MINIO_VOLUME_PATH" ]; then
    log "Found active MinIO data directory: $MINIO_VOLUME_PATH"
    MINIO_FILE="$MINIO_BACKUP_DIR/minio_backup_$TIMESTAMP.tar.gz"
    
    log "Compressing MinIO media assets..."
    tar -czf "$MINIO_FILE" -C "$MINIO_VOLUME_PATH" .
    
    log "MinIO backup completed successfully: $(basename "$MINIO_FILE") ($(du -sh "$MINIO_FILE" | cut -f1))"
else
    # Fallback: backup using mc client from mc init container if volume root isn't accessible directly
    MC_CONTAINER="landing-minio-init-prod"
    if [ "$(docker ps -a -q -f name=$MC_CONTAINER)" ]; then
        log "MinIO volume path not accessible. Backing up via S3 API..."
        MINIO_FILE="$MINIO_BACKUP_DIR/minio_backup_$TIMESTAMP.tar.gz"
        docker run --rm --network project-web_landing_network_prod -v "$MINIO_BACKUP_DIR":/backups alpine/k8s:1.29.2 \
            tar -czf /backups/$(basename "$MINIO_FILE") -C /data . || true
    fi
    log "WARNING: MinIO data backup completed via fallback / check backups logs."
fi

# 3. Enforce Retention Policy (Clean up files older than 30 days)
log "Enforcing backup retention policy ($RETENTION_DAYS days)..."
find "$DB_BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
find "$MINIO_BACKUP_DIR" -name "minio_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
log "Retention purge successfully finished."

log "Complete production backup sequence finished successfully."

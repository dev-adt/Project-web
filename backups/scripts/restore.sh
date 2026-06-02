#!/usr/bin/env bash
# ==============================================================================
# Production Restore Script - Landing Builder Platform
# ==============================================================================
# Usage:
# ./restore.sh [path_to_db_backup.sql.gz] [path_to_minio_backup.tar.gz]
# ==============================================================================

set -eo pipefail

# Configurations
PROJECT_ROOT="/opt/landing-platform"
if [ ! -d "$PROJECT_ROOT" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi

BACKUP_DIR="$PROJECT_ROOT/backups"
DB_BACKUP_DIR="$BACKUP_DIR/postgres"
MINIO_BACKUP_DIR="$BACKUP_DIR/minio"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# 1. Resolve Backups Inputs
DB_BACKUP="$1"
MINIO_BACKUP="$2"

if [ -z "$DB_BACKUP" ]; then
    log "No DB backup file specified. Locating latest backup..."
    DB_BACKUP=$(find "$DB_BACKUP_DIR" -name "backup_*.sql.gz" -type f | sort | tail -n 1)
fi

if [ -z "$MINIO_BACKUP" ]; then
    log "No MinIO backup file specified. Locating latest backup..."
    MINIO_BACKUP=$(find "$MINIO_BACKUP_DIR" -name "minio_backup_*.tar.gz" -type f | sort | tail -n 1)
fi

# Verification
if [ -z "$DB_BACKUP" ] || [ ! -f "$DB_BACKUP" ]; then
    log "ERROR: Database backup file not found or invalid: $DB_BACKUP"
    exit 1
fi

if [ -z "$MINIO_BACKUP" ] || [ ! -f "$MINIO_BACKUP" ]; then
    log "ERROR: MinIO backup file not found or invalid: $MINIO_BACKUP"
    exit 1
fi

log "======================================================================"
log "DISASTER RECOVERY RESTORE INITIATED"
log "Target DB Backup:    $(basename "$DB_BACKUP")"
log "Target MinIO Backup: $(basename "$MINIO_BACKUP")"
log "======================================================================"
read -p "Are you absolutely sure you want to restore these backups? This will OVERWRITE existing data. (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Restore cancelled by administrator."
    exit 0
fi

# 2. Database Restore
DB_CONTAINER="landing-postgres-prod"
if [ ! "$(docker ps -q -f name=$DB_CONTAINER)" ]; then
    DB_CONTAINER="landing-postgres"
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER)" ]; then
    log "Restoring database from: $DB_BACKUP"
    
    log "Dropping existing public schema database connections..."
    docker exec -t "$DB_CONTAINER" psql -U postgres -d landing_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    log "Streaming backup sql script to Postgres..."
    gunzip -c "$DB_BACKUP" | docker exec -i "$DB_CONTAINER" psql -U postgres -d landing_db
    
    log "Database restore executed successfully."
else
    log "ERROR: Postgres container ($DB_CONTAINER) is not running. Cannot restore database."
    exit 1
fi

# 3. MinIO Restore
MINIO_VOLUME_PATH="/var/lib/docker/volumes/project-web_minio_data_prod/_data"
if [ ! -d "$MINIO_VOLUME_PATH" ]; then
    VOLUME_NAME=$(docker volume ls -q | grep minio_data_prod || true)
    if [ -n "$VOLUME_NAME" ]; then
        MINIO_VOLUME_PATH="/var/lib/docker/volumes/$VOLUME_NAME/_data"
    else
        MINIO_VOLUME_PATH="$PROJECT_ROOT/minio/data"
    fi
fi

if [ -d "$MINIO_VOLUME_PATH" ]; then
    log "Restoring MinIO objects into: $MINIO_VOLUME_PATH"
    
    log "Purging existing storage items..."
    rm -rf "${MINIO_VOLUME_PATH:?}"/* || true
    
    log "Decompressing storage archive..."
    tar -xzf "$MINIO_BACKUP" -C "$MINIO_VOLUME_PATH"
    
    log "MinIO storage volume restore completed successfully."
else
    log "WARNING: MinIO data volume path not directly accessible. Please run restoration manually using target archive: $MINIO_BACKUP"
fi

log "======================================================================"
log "Disaster recovery restore executed successfully."
log "Please restart your platform services to sync cache records:"
log "docker compose -f docker-compose.prod.yml restart"
log "======================================================================"

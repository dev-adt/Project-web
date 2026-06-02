# Disaster Recovery & Restore Guide - Landing Builder Platform

This guide outlines step-by-step instructions to recover files and execute database/S3 storage restorations using the platform restore scripts.

---

## 1. Safety Checklist Before Restoring

> [!CAUTION]
> Performing a restore operation is highly destructive. It will completely overwrite all existing database tables, dynamic configurations, sitemaps, and MinIO S3 media assets. 
> Ensure you make an on-demand backup first.

```bash
# Generate emergency backup before starting restore
/opt/landing-platform/backups/scripts/backup.sh
```

---

## 2. Dynamic Restore Automation

Restoration is managed via the utility script `/opt/landing-platform/backups/scripts/restore.sh`.

### A. Make the Restore Script Executable
```bash
chmod +x /opt/landing-platform/backups/scripts/restore.sh
```

### B. Execution Options

#### Option 1: Auto-Restore the Latest Backups
If you omit the parameters, the script automatically parses backup directories and restores the latest available SQL and MinIO gzipped packages:
```bash
/opt/landing-platform/backups/scripts/restore.sh
```

#### Option 2: Restore Specific Timestamps
Pass explicit file targets to restore a specific historical snapshot:
```bash
/opt/landing-platform/backups/scripts/restore.sh \
  /opt/landing-platform/backups/postgres/backup_20260601_020000.sql.gz \
  /opt/landing-platform/backups/minio/minio_backup_20260601_020000.tar.gz
```

---

## 3. How the Restore Script Works Behind the Scenes

1. **Database Schema Wipe**:
   - Establishes connection to the running PostgreSQL container.
   - Cleans the public schema: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`.
2. **Database Reconstruction**:
   - Streams the decompressed `.sql.gz` dump script straight to `psql` to rebuild schemas, views, forms, CMS pages, logs, and SEO settings.
3. **Stateless Volume Sync**:
   - Purges current media directories inside `/var/lib/docker/volumes/project-web_minio_data_prod/_data`.
   - Extracts the S3 storage tarball package directly to synchronize files.

---

## 4. Post-Recovery Verification Checklist

After the restore script completes, finalize the sync:

### Step A: Restart Platform Services
Purge local Redis memory states and sync cache buffers:
```bash
docker compose -f /opt/landing-platform/docker-compose.prod.yml restart
```

### Step B: Validate Public Routes
Confirm all core modules are responsive:
* Main landing website: `http://localhost/`
* CMS Admin Console: `http://localhost/swagger`
* Storage health checks: `http://localhost:9000/minio/health/live`

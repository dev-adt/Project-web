# Production Backup Operations Guide - Landing Builder Platform

This guide outlines configurations, directories, retention policies, and crontab automation instructions for system backups.

---

## 1. Automated Backups Core

Backups are executed by a unified shell script at `/opt/landing-platform/backups/scripts/backup.sh` which performs the following tasks:
1. **PostgreSQL Database Dump**: Streams a gzipped, raw SQL backup of the target database (`landing_db_prod`) using `pg_dump` via docker commands, bypassing interactive passwords dynamically.
2. **MinIO Media Backup**: Collects S3 storage object assets inside persistent Docker volumes using `tar` compression.
3. **Automated Purge Retention**: Deletes backup files older than `30 days` to conserve disk space.

---

## 2. Setting Up Crontab Automation

To automate daily backups at **02:00 AM** and route outputs into a centralized logging pipeline:

### A. Make the Backup Script Executable
```bash
chmod +x /opt/landing-platform/backups/scripts/backup.sh
```

### B. Edit Crontab
Open the system crontab editor for the deploy administrator:
```bash
crontab -e
```

### C. Append the Cron Entry
Add the following line to the crontab:
```cron
0 2 * * * /opt/landing-platform/backups/scripts/backup.sh >> /opt/landing-platform/logs/backup.log 2>&1
```

---

## 3. Directory Layout & Storage Mappings

Backups are securely persisted outside ephemeral docker containers and mapped locally:
* **Database Target Dir**: `/opt/landing-platform/backups/postgres/`
  * Format: `backup_YYYYMMDD_HHMMSS.sql.gz`
* **Storage Target Dir**: `/opt/landing-platform/backups/minio/`
  * Format: `minio_backup_YYYYMMDD_HHMMSS.tar.gz`
* **Backup Activity Log File**: `/opt/landing-platform/logs/backup.log`

---

## 4. Executing Manual Backups

If you need to perform an immediate snapshot before upgrades, hotfixes, or content updates:
```bash
/opt/landing-platform/backups/scripts/backup.sh
```

The script will outputs status logs in real-time:
```text
[2026-06-02 14:15:00] Starting complete production backup sequence...
[2026-06-02 14:15:00] Found active Postgres container: landing-postgres-prod
[2026-06-02 14:15:00] Dumping database records...
[2026-06-02 14:15:02] Database backup completed successfully: backup_20260602_141500.sql.gz (1.2M)
[2026-06-02 14:15:02] Found active MinIO data directory: /var/lib/docker/volumes/...
[2026-06-02 14:15:02] Compressing MinIO media assets...
[2026-06-02 14:15:05] MinIO backup completed successfully: minio_backup_20260602_141500.tar.gz (45M)
[2026-06-02 14:15:05] Enforcing backup retention policy (30 days)...
[2026-06-02 14:15:05] Retention purge successfully finished.
[2026-06-02 14:15:05] Complete production backup sequence finished successfully.
```

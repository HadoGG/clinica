#!/bin/bash

# Backup script for MySQL database inside Docker
# Runs automatically as a container and keeps running

set -e

DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-clinica}
DB_PASSWORD=${DB_PASSWORD:-Inacap2025&}
DB_NAME=${DB_NAME:-clinica_db}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Create backups directory if it doesn't exist
mkdir -p /app/backups
mkdir -p /app/media_backups

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup service started"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Database: $DB_NAME"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Retention: $BACKUP_RETENTION_DAYS days"

while true; do
  BACKUP_TIME=$(date '+%Y%m%d_%H%M%S')
  BACKUP_FILE="/app/backups/clinica_db_${BACKUP_TIME}.sql"
  
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ====== Starting database backup ======"
  
  # Export database
  if mysqldump \
    -h $DB_HOST \
    -u $DB_USER \
    -p$DB_PASSWORD \
    -P $DB_PORT \
    $DB_NAME > $BACKUP_FILE 2>/dev/null; then
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Database backup completed: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_FILE
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup compressed to: ${BACKUP_FILE}.gz"
    
    # Cleanup old backups (older than BACKUP_RETENTION_DAYS)
    find /app/backups -name "clinica_db_*.sql.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleanup: removed backups older than $BACKUP_RETENTION_DAYS days"
    
    # Backup media files (optional)
    if [ -d /app/media ]; then
      MEDIA_BACKUP="/app/media_backups/media_${BACKUP_TIME}.tar.gz"
      tar -czf $MEDIA_BACKUP /app/media 2>/dev/null || true
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Media backup completed: $MEDIA_BACKUP"
      
      # Cleanup old media backups
      find /app/media_backups -name "media_*.tar.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
    fi
    
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Database backup failed"
  fi
  
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ====== Backup complete. Next backup in 24 hours ======"
  
  # Wait 24 hours before next backup
  sleep 86400
done
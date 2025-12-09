# BACKUP AND RECOVERY PLAN
## Sourcing Supply Chain Net (SSCN)

**Version:** 1.0  
**Last Updated:** October 27, 2025  
**Owner:** Infrastructure Team  
**Review Cycle:** Quarterly

---

## 1. OVERVIEW

### Purpose
This document defines backup and recovery procedures for SSCN to ensure business continuity and data integrity in case of system failures, data corruption, or disasters.

### Recovery Objectives

#### Recovery Time Objective (RTO)
- **Critical Services:** 4 hours
- **Standard Services:** 24 hours
- **Non-Critical Services:** 72 hours

#### Recovery Point Objective (RPO)
- **Database:** 1 hour (maximum acceptable data loss)
- **File Storage:** 24 hours
- **Configuration:** 1 hour

---

## 2. BACKUP STRATEGY

### Database Backups (PostgreSQL on Railway)

#### Automated Backups:
Railway provides automatic daily backups with 7-day retention.

**Backup Schedule:**
- **Frequency:** Every 24 hours (automated by Railway)
- **Retention:** 7 days (Railway standard)
- **Type:** Full database dump
- **Location:** Railway's backup storage

**What's Backed Up:**
- All database tables and data
- Database schema and structure
- User accounts and permissions
- Indexes and constraints

#### Manual Backups:

**When to Perform:**
- Before major deployments
- Before database migrations
- Before bulk data operations
- Monthly archival backups

**How to Create Manual Backup:**

```powershell
# Using Railway CLI
railway run pg_dump $DATABASE_URL > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Or using direct connection
$env:PGPASSWORD="[password]"
pg_dump -h [host] -U [user] -d [database] -F c -b -v -f "sscn_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').backup"
```

**Manual Backup Storage:**
- **Primary:** AWS S3 bucket (encrypted)
- **Secondary:** Local encrypted storage (90-day retention)
- **Archive:** Quarterly backups retained for 7 years

---

### File Storage Backups (AWS S3)

**What's Stored:**
- RFQ documents (PDFs, specifications)
- Company logos and images
- User profile pictures
- Export files

**Backup Strategy:**
- **S3 Versioning:** Enabled (30-day version retention)
- **Cross-Region Replication:** Enabled to us-west-2 (if primary in us-east-1)
- **Lifecycle Policy:** Move to Glacier after 90 days

**AWS S3 Configuration:**
```json
{
  "Rules": [
    {
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "NoncurrentVersionTransitions": [
        {
          "NoncurrentDays": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

---

### Configuration Backups

**What to Backup:**
- Environment variables
- Railway service configurations
- GitHub repository (code)
- API keys and credentials (encrypted)

**Backup Method:**
- **Code:** GitHub with daily commits (automatic)
- **Environment Variables:** Exported monthly and stored encrypted
- **Credentials:** Password manager (1Password/LastPass) with team vault

**Export Railway Configuration:**
```powershell
railway variables > railway_env_$(Get-Date -Format "yyyyMMdd").txt
# Encrypt the file before storing
gpg --symmetric --cipher-algo AES256 railway_env_$(Get-Date -Format "yyyyMMdd").txt
```

---

## 3. BACKUP MONITORING

### Automated Verification

**Railway Database Backups:**
- Check Railway dashboard daily for backup status
- Verify backup size is reasonable (not 0 bytes)
- Set up monitoring alert if backup fails

**S3 File Backups:**
- Enable S3 event notifications
- Monitor S3 metrics in CloudWatch
- Alert on replication lag > 24 hours

### Monthly Backup Tests

**Test Schedule:**
- First Monday of each month
- Alternating between database and file restores
- Document results in backup log

**Test Procedure:**
1. Select random backup from previous month
2. Restore to isolated test environment
3. Verify data integrity
4. Document results
5. Update procedures if issues found

---

## 4. RECOVERY PROCEDURES

### Database Recovery

#### Scenario 1: Full Database Loss

**Steps:**
1. **Access Railway Dashboard**
   - Log in to railway.app
   - Navigate to your project
   - Go to PostgreSQL service

2. **Restore from Automated Backup**
   ```
   Railway Dashboard > PostgreSQL Service > Backups Tab > Select backup > Restore
   ```

3. **Or Restore from Manual Backup**
   ```powershell
   # Connect to new database
   railway link [project-id]
   
   # Restore from backup file
   railway run psql $DATABASE_URL < backup_20241027_120000.sql
   ```

4. **Verify Data Integrity**
   ```sql
   -- Check record counts
   SELECT 'users' as table_name, COUNT(*) as count FROM users
   UNION ALL
   SELECT 'companies', COUNT(*) FROM companies
   UNION ALL
   SELECT 'rfqs', COUNT(*) FROM rfqs
   UNION ALL
   SELECT 'audit_logs', COUNT(*) FROM audit_logs;
   
   -- Check latest timestamps
   SELECT MAX(created_at) as latest_user FROM users;
   SELECT MAX(created_at) as latest_rfq FROM rfqs;
   ```

5. **Update Application Connection**
   - If restored to new database, update DATABASE_URL
   - Restart backend service
   - Test critical functions

**Estimated Time:** 2-4 hours

---

#### Scenario 2: Partial Data Corruption

**Steps:**
1. **Identify Corrupted Data**
   - Review error logs
   - Query affected tables
   - Determine time range

2. **Create Current Backup Before Restoration**
   ```powershell
   railway run pg_dump $DATABASE_URL > pre_restore_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
   ```

3. **Extract Specific Data from Backup**
   ```sql
   -- Restore to temporary database
   CREATE DATABASE temp_restore;
   
   -- Restore backup to temp
   psql temp_restore < backup_20241027_120000.sql
   
   -- Copy specific records
   INSERT INTO production.users
   SELECT * FROM temp_restore.users
   WHERE id IN (SELECT id FROM corrupted_users);
   ```

4. **Verify Restoration**
   - Compare record counts
   - Test affected functionality
   - Review audit logs

**Estimated Time:** 1-2 hours

---

### File Storage Recovery

#### Scenario 1: Accidental File Deletion

**Steps:**
1. **Check S3 Versioning**
   ```bash
   aws s3api list-object-versions \
     --bucket sscn-documents \
     --prefix "rfqs/RFQ-123/"
   ```

2. **Restore Previous Version**
   ```bash
   aws s3api copy-object \
     --copy-source sscn-documents/rfqs/RFQ-123/document.pdf?versionId=[version-id] \
     --bucket sscn-documents \
     --key rfqs/RFQ-123/document.pdf
   ```

**Estimated Time:** 15-30 minutes

---

#### Scenario 2: S3 Bucket Corruption

**Steps:**
1. **Verify Cross-Region Replica**
   - Check replica bucket in secondary region
   - Verify file count and sizes match

2. **Restore from Replica**
   ```bash
   aws s3 sync s3://sscn-documents-replica/ s3://sscn-documents/ \
     --source-region us-west-2 \
     --region us-east-1
   ```

3. **Update Application Configuration if Needed**
   - Point to replica bucket temporarily
   - Update S3_BUCKET_NAME environment variable

**Estimated Time:** 2-4 hours (depending on data size)

---

### Application Recovery

#### Scenario 1: Backend Service Failure

**Steps:**
1. **Check Railway Service Status**
   - Railway Dashboard > Deployments
   - Review logs for errors

2. **Rollback to Previous Deployment**
   ```
   Railway Dashboard > Deployments > [Previous successful deployment] > Redeploy
   ```

3. **Or Deploy from GitHub**
   ```powershell
   git checkout [last-known-good-commit]
   git push railway main --force
   ```

4. **Verify Service Recovery**
   - Check /api/health endpoint
   - Test authentication
   - Review error logs

**Estimated Time:** 30 minutes - 1 hour

---

#### Scenario 2: Frontend Service Failure

**Steps:**
1. **Rollback Deployment**
   ```
   Railway Dashboard > Frontend Service > Deployments > Rollback
   ```

2. **Clear CDN Cache if Applicable**
   - Cloudflare or other CDN purge

3. **Verify Frontend**
   - Load homepage
   - Test login flow
   - Check browser console for errors

**Estimated Time:** 15-30 minutes

---

## 5. DISASTER RECOVERY

### Complete Platform Failure

**Scenario:** Railway experiences major outage or company data center failure

**Recovery Plan:**

#### Phase 1: Assessment (0-1 hour)
- Confirm extent of failure
- Check Railway status page
- Activate disaster recovery team
- Communicate with stakeholders

#### Phase 2: Alternative Hosting (1-4 hours)
- Deploy to backup cloud provider (e.g., Heroku, AWS)
- Use Infrastructure as Code (if available)
- Restore database from latest S3 backup

**Quick Deploy to Heroku:**
```powershell
# Create new app
heroku create sscn-backup

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Deploy code
git push heroku main

# Restore database
heroku pg:backups:restore '[S3_BACKUP_URL]' DATABASE_URL --app sscn-backup

# Set environment variables
heroku config:set SECRET_KEY="..." DATABASE_URL="..." --app sscn-backup
```

#### Phase 3: DNS Update (4-6 hours)
- Update DNS records to point to new hosting
- Configure SSL certificates
- Test all functionality

**Estimated Full Recovery Time:** 6-8 hours

---

## 6. BACKUP VERIFICATION LOG

### Template for Monthly Tests:

| Date | Type | Backup Date | Result | Data Integrity | Issues | Tester |
|------|------|-------------|--------|----------------|--------|--------|
| 2024-10-01 | Database | 2024-09-30 | ✅ Success | 100% verified | None | [Name] |
| 2024-11-01 | Files | 2024-10-31 | ✅ Success | Sample verified | None | [Name] |
| 2024-12-01 | Database | 2024-11-30 | | | | |

### Verification Checklist:
- [ ] Backup file exists and is not corrupted
- [ ] Backup size is reasonable (not 0 bytes, not unusually small)
- [ ] Restore completes without errors
- [ ] Sample data queries return expected results
- [ ] Record counts match expectations
- [ ] Latest timestamps are from backup date
- [ ] Application can connect to restored database
- [ ] Critical functions work (login, create RFQ, etc.)
- [ ] No data loss detected in sample checks

---

## 7. BACKUP RETENTION POLICY

### Database Backups:
- **Daily automated backups:** 7 days (Railway default)
- **Weekly manual backups:** 4 weeks
- **Monthly archive backups:** 1 year
- **Quarterly backups:** 7 years (compliance requirement)

### File Storage:
- **Active files:** Indefinite (S3 standard)
- **File versions:** 30 days (S3 versioning)
- **Archived files:** 7 years (S3 Glacier)

### Configuration Backups:
- **Environment variables:** Last 12 months
- **Code repository:** Indefinite (GitHub)

---

## 8. BACKUP SECURITY

### Encryption:
- **Database backups:** Encrypted at rest (Railway)
- **S3 files:** SSE-S3 encryption enabled
- **Manual backups:** GPG encrypted before storage
- **Backup transport:** SSL/TLS for all transfers

### Access Control:
- **Railway backups:** Admin access only
- **S3 buckets:** IAM roles with least privilege
- **Manual backups:** Encrypted with team GPG keys
- **Backup storage:** Multi-factor authentication required

### Audit:
- All backup restorations logged
- Quarterly access review
- Annual security audit of backup procedures

---

## 9. RESPONSIBILITIES

### Daily:
- **On-Call Engineer:** Monitor backup success notifications
- **Automated Systems:** Create Railway daily backups

### Weekly:
- **DevOps Lead:** Review backup logs and alerts

### Monthly:
- **Infrastructure Team:** Perform backup restoration test
- **Security Team:** Create manual backup archive

### Quarterly:
- **CTO:** Review disaster recovery plan
- **All Teams:** Participate in disaster recovery drill

---

## 10. EMERGENCY CONTACTS

### Railway Support:
- **Email:** support@railway.app
- **Discord:** railway.app/discord
- **Status:** status.railway.app

### AWS Support:
- **Phone:** 1-800-xxx-xxxx (if Enterprise support)
- **Console:** console.aws.amazon.com/support

### Team:
- **Infrastructure Lead:** [Name] - [Phone] - [Email]
- **CTO:** [Name] - [Phone] - [Email]
- **On-Call Engineer:** See PagerDuty schedule

---

## APPENDIX A: BACKUP SCRIPTS

### Automated Backup Script (PowerShell)

```powershell
# SSCN-Backup-Database.ps1
# Run this script weekly for manual backups

$ErrorActionPreference = "Stop"
$BackupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "sscn_backup_$BackupDate.sql"
$EncryptedFile = "$BackupFile.gpg"

Write-Host "Starting SSCN database backup..." -ForegroundColor Green

# Create backup using Railway CLI
Write-Host "Creating database dump..."
railway run pg_dump `$DATABASE_URL > $BackupFile

# Verify backup file exists and has content
if ((Test-Path $BackupFile) -and ((Get-Item $BackupFile).Length -gt 0)) {
    Write-Host "Backup created successfully: $BackupFile" -ForegroundColor Green
    
    # Encrypt backup
    Write-Host "Encrypting backup..."
    gpg --symmetric --cipher-algo AES256 $BackupFile
    
    # Upload to S3
    Write-Host "Uploading to S3..."
    aws s3 cp $EncryptedFile s3://sscn-backups/database/$EncryptedFile
    
    # Cleanup local files
    Remove-Item $BackupFile
    Write-Host "Backup complete and uploaded to S3" -ForegroundColor Green
} else {
    Write-Host "ERROR: Backup failed or file is empty" -ForegroundColor Red
    exit 1
}
```

### Restore Script (PowerShell)

```powershell
# SSCN-Restore-Database.ps1
# Usage: .\SSCN-Restore-Database.ps1 -BackupFile "sscn_backup_20241027_120000.sql.gpg"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"
$DecryptedFile = $BackupFile -replace ".gpg", ""

Write-Host "Starting SSCN database restore..." -ForegroundColor Yellow
Write-Host "WARNING: This will overwrite current database!" -ForegroundColor Red
$confirmation = Read-Host "Type 'RESTORE' to continue"

if ($confirmation -ne "RESTORE") {
    Write-Host "Restore cancelled" -ForegroundColor Yellow
    exit 0
}

# Download from S3 if not local
if (-not (Test-Path $BackupFile)) {
    Write-Host "Downloading backup from S3..."
    aws s3 cp s3://sscn-backups/database/$BackupFile $BackupFile
}

# Decrypt backup
Write-Host "Decrypting backup..."
gpg --decrypt $BackupFile > $DecryptedFile

# Create safety backup of current database
Write-Host "Creating safety backup of current database..."
$SafetyBackup = "pre_restore_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
railway run pg_dump `$DATABASE_URL > $SafetyBackup

# Restore database
Write-Host "Restoring database..."
railway run psql `$DATABASE_URL < $DecryptedFile

# Verify restoration
Write-Host "Verifying restoration..."
$recordCount = railway run psql `$DATABASE_URL -t -c "SELECT COUNT(*) FROM users;"

if ($recordCount -gt 0) {
    Write-Host "Restore completed successfully!" -ForegroundColor Green
    Write-Host "User count: $recordCount" -ForegroundColor Green
} else {
    Write-Host "ERROR: Restore may have failed - no users found" -ForegroundColor Red
}

# Cleanup
Remove-Item $DecryptedFile
Write-Host "Cleanup complete" -ForegroundColor Green
```

---

## APPENDIX B: RECOVERY TESTING CHECKLIST

### Quarterly Disaster Recovery Drill:

- [ ] **Pre-Drill Planning**
  - [ ] Schedule drill with all team members
  - [ ] Prepare test environment
  - [ ] Document current system state
  - [ ] Notify stakeholders

- [ ] **Drill Execution**
  - [ ] Simulate failure scenario
  - [ ] Start timer
  - [ ] Follow recovery procedures
  - [ ] Document each step
  - [ ] Note any issues or blockers

- [ ] **Verification**
  - [ ] Database fully restored
  - [ ] Files accessible
  - [ ] Application functional
  - [ ] Authentication working
  - [ ] Critical features tested
  - [ ] Performance acceptable

- [ ] **Post-Drill Review**
  - [ ] Calculate actual RTO/RPO
  - [ ] Document lessons learned
  - [ ] Update procedures
  - [ ] Implement improvements
  - [ ] Schedule next drill

---

**Last Updated:** October 27, 2025  
**Next Review:** January 27, 2026  
**Next Drill:** [Schedule quarterly]  
**Document Owner:** Infrastructure Team

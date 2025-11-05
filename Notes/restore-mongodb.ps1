# MongoDB Data Restore Script
# Run this script as Administrator

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MongoDB Data Restore Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$backupPath = "D:\mongo-backups\mongo-data-backup-20251006-172426"
$mongoDataPath = "C:\Program Files\MongoDB\Server\8.0\data"
$backupCurrentEmpty = "C:\Program Files\MongoDB\Server\8.0\data-empty-backup"

Write-Host "Step 1: Stopping MongoDB..." -ForegroundColor Yellow
try {
    # Try to stop as a service first
    net stop MongoDB
    Write-Host "  ✓ MongoDB service stopped" -ForegroundColor Green
} catch {
    # If not a service, try to stop the process
    Stop-Process -Name mongod -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  ✓ MongoDB process stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Backing up current (empty) data directory..." -ForegroundColor Yellow
if (Test-Path $backupCurrentEmpty) {
    Remove-Item -Path $backupCurrentEmpty -Recurse -Force
}
Copy-Item -Path $mongoDataPath -Destination $backupCurrentEmpty -Recurse -Force
Write-Host "  ✓ Current data backed up to: $backupCurrentEmpty" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Removing current (empty) data directory..." -ForegroundColor Yellow
Remove-Item -Path "$mongoDataPath\*" -Recurse -Force
Write-Host "  ✓ Current data removed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Restoring backup data..." -ForegroundColor Yellow
Copy-Item -Path "$backupPath\*" -Destination $mongoDataPath -Recurse -Force
Write-Host "  ✓ Backup data restored from: $backupPath" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Starting MongoDB..." -ForegroundColor Yellow
try {
    net start MongoDB
    Write-Host "  ✓ MongoDB service started" -ForegroundColor Green
} catch {
    Write-Host "  ! Could not start MongoDB as a service" -ForegroundColor Red
    Write-Host "    Please start MongoDB manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "RESTORE COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test your database by connecting to localhost:27017"
Write-Host "2. Check that your collections are restored"
Write-Host "3. Start your API server and test your application"
Write-Host ""
Read-Host "Press Enter to exit"

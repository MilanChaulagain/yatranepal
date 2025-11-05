# MongoDB Migration Script - Localhost to Atlas
# This script exports all collections from localhost and imports them to MongoDB Atlas

param(
    [Parameter(Mandatory=$true)]
    [string]$AtlasUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$AtlasPassword,
    
    [string]$AtlasCluster = "cluster0.gbx3m.mongodb.net",
    [string]$DatabaseName = "yatranepal",
    [string]$LocalHost = "localhost:27017",
    [string]$ExportPath = "D:\yatranepal-migration"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MongoDB Migration Tool" -ForegroundColor Cyan
Write-Host "From Localhost to MongoDB Atlas" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# MongoDB tools path
$mongoToolsPath = "C:\Program Files\MongoDB\Server\8.0\bin"
$mongodump = "$mongoToolsPath\mongodump.exe"
$mongorestore = "$mongoToolsPath\mongorestore.exe"

# Check if tools exist
if (-not (Test-Path $mongodump)) {
    Write-Host "ERROR: mongodump.exe not found at $mongodump" -ForegroundColor Red
    Write-Host "Please install MongoDB Database Tools or update the path" -ForegroundColor Yellow
    exit 1
}

# Create export directory
if (-not (Test-Path $ExportPath)) {
    New-Item -ItemType Directory -Path $ExportPath -Force | Out-Null
    Write-Host "Created export directory: $ExportPath" -ForegroundColor Green
}

# Step 1: Export from Localhost
Write-Host ""
Write-Host "Step 1: Exporting from localhost..." -ForegroundColor Yellow
Write-Host "  Database: $DatabaseName" -ForegroundColor Gray
Write-Host "  Export to: $ExportPath" -ForegroundColor Gray

$dumpPath = Join-Path $ExportPath "dump"
& $mongodump --host $LocalHost --db $DatabaseName --out $dumpPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to export from localhost" -ForegroundColor Red
    Write-Host "Make sure MongoDB is running on $LocalHost" -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✓ Export completed successfully!" -ForegroundColor Green

# Step 2: Import to Atlas
Write-Host ""
Write-Host "Step 2: Importing to MongoDB Atlas..." -ForegroundColor Yellow
Write-Host "  Cluster: $AtlasCluster" -ForegroundColor Gray
Write-Host "  Database: $DatabaseName" -ForegroundColor Gray

$atlasUri = "mongodb+srv://${AtlasUsername}:${AtlasPassword}@${AtlasCluster}/${DatabaseName}"
$dbDumpPath = Join-Path $dumpPath $DatabaseName

& $mongorestore --uri $atlasUri $dbDumpPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to import to Atlas" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  - Username and password are correct" -ForegroundColor Yellow
    Write-Host "  - IP is whitelisted in Atlas Network Access" -ForegroundColor Yellow
    Write-Host "  - Internet connection is stable" -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✓ Import completed successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MIGRATION COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your data has been successfully migrated from localhost to Atlas!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify data in MongoDB Atlas dashboard" -ForegroundColor White
Write-Host "2. Update your .env file to use Atlas connection string" -ForegroundColor White
Write-Host "3. Test your application with the new connection" -ForegroundColor White
Write-Host ""
Write-Host "Exported data is saved at: $ExportPath" -ForegroundColor Gray
Write-Host "You can delete this folder after verifying the migration" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"

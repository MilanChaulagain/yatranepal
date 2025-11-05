# Verify MongoDB Restoration
# This script checks if your data was restored successfully

Write-Host "Checking MongoDB restoration..." -ForegroundColor Cyan
Write-Host ""

# Connect to MongoDB and list databases
mongo --eval "db.adminCommand('listDatabases')" --quiet

Write-Host ""
Write-Host "Checking yatranepal database collections..." -ForegroundColor Cyan
mongo yatranepal --eval "db.getCollectionNames()" --quiet

Write-Host ""
Write-Host "Counting documents in main collections..." -ForegroundColor Cyan
mongo yatranepal --eval "print('Hotels: ' + db.hotels.countDocuments()); print('Users: ' + db.users.countDocuments()); print('Places: ' + db.places.countDocuments()); print('Rooms: ' + db.rooms.countDocuments());" --quiet

Write-Host ""
Read-Host "Press Enter to exit"

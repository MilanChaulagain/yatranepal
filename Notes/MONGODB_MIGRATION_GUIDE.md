# MongoDB Data Migration Guide
# From Localhost to MongoDB Atlas

## 📦 Method 1: Using mongodump and mongorestore

### Prerequisites
- MongoDB Database Tools installed
- Download from: https://www.mongodb.com/try/download/database-tools
- Or use the tools that came with your MongoDB installation

### Step 1: Export from Localhost (mongodump)

Open PowerShell and run:

```powershell
# Navigate to MongoDB tools directory (adjust path if different)
cd "C:\Program Files\MongoDB\Server\8.0\bin"

# Dump the entire yatranepal database
.\mongodump.exe --host localhost:27017 --db yatranepal --out D:\mongo-dump-yatranepal

# OR dump a specific collection
.\mongodump.exe --host localhost:27017 --db yatranepal --collection hotels --out D:\mongo-dump-yatranepal
```

**Expected Output:**
```
2025-10-21T... writing yatranepal.hotels to D:\mongo-dump-yatranepal\yatranepal\hotels.bson
2025-10-21T... done dumping yatranepal.hotels (50 documents)
```

### Step 2: Import to MongoDB Atlas (mongorestore)

```powershell
# Restore entire database to Atlas
.\mongorestore.exe --uri "mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/yatranepal" D:\mongo-dump-yatranepal\yatranepal

# OR restore a specific collection
.\mongorestore.exe --uri "mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/yatranepal" --collection hotels D:\mongo-dump-yatranepal\yatranepal\hotels.bson
```

**Replace:**
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password

---

## 📦 Method 2: Using MongoDB Compass (GUI - Easiest!)

### Step 1: Install MongoDB Compass
Download from: https://www.mongodb.com/try/download/compass

### Step 2: Connect to Source (Localhost)
1. Open Compass
2. Connection String: `mongodb://localhost:27017`
3. Click "Connect"

### Step 3: Export Collections
1. Select database: `yatranepal`
2. Select collection (e.g., `hotels`)
3. Click "Collection" menu → "Export Collection"
4. Format: **JSON**
5. Save file (e.g., `hotels.json`)
6. Repeat for each collection

### Step 4: Connect to MongoDB Atlas
1. Click "New Connection"
2. Enter connection string: 
   ```
   mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/
   ```
3. Click "Connect"

### Step 5: Import to Atlas
1. Select database `yatranepal` (create if needed)
2. Create/Select collection (e.g., `hotels`)
3. Click "ADD DATA" → "Import JSON or CSV file"
4. Select your exported file
5. Click "Import"
6. Repeat for all collections

---

## 📦 Method 3: Using mongoexport and mongoimport (For Individual Collections)

### Export from Localhost

```powershell
cd "C:\Program Files\MongoDB\Server\8.0\bin"

# Export hotels collection
.\mongoexport.exe --db yatranepal --collection hotels --out D:\yatranepal-data\hotels.json

# Export users collection
.\mongoexport.exe --db yatranepal --collection users --out D:\yatranepal-data\users.json

# Export all other collections
.\mongoexport.exe --db yatranepal --collection rooms --out D:\yatranepal-data\rooms.json
.\mongoexport.exe --db yatranepal --collection places --out D:\yatranepal-data\places.json
.\mongoexport.exe --db yatranepal --collection reservations --out D:\yatranepal-data\reservations.json
```

### Import to MongoDB Atlas

```powershell
# Import hotels collection
.\mongoimport.exe --uri "mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/yatranepal" --collection hotels --file D:\yatranepal-data\hotels.json

# Import users collection
.\mongoimport.exe --uri "mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/yatranepal" --collection users --file D:\yatranepal-data\users.json

# Import other collections
.\mongoimport.exe --uri "mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/yatranepal" --collection rooms --file D:\yatranepal-data\rooms.json
.\mongoimport.exe --uri "mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/yatranepal" --collection places --file D:\yatranepal-data\places.json
.\mongoimport.exe --uri "mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/yatranepal" --collection reservations --file D:\yatranepal-data\reservations.json
```

---

## 📦 Method 4: From Your Backup Directory

If you want to restore from your backup at `D:\mongo-backups\mongo-data-backup-20251006-172426`:

### Option A: Point MongoDB to the Backup (Temporary)

1. Stop MongoDB service
2. Temporarily change MongoDB data directory to backup location
3. Start MongoDB
4. Export data using methods above
5. Restore original data directory

### Option B: Use mongorestore with backup directory

```powershell
cd "C:\Program Files\MongoDB\Server\8.0\bin"

# This might work if the backup is in the right format
.\mongorestore.exe --uri "mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/" D:\mongo-backups\mongo-data-backup-20251006-172426
```

**Note:** This may not work if the backup is raw WiredTiger files. In that case, you need to:
1. Restore the backup to a local MongoDB instance first
2. Then export from local and import to Atlas

---

## 🔍 Quick Check - What Collections Do You Have?

### On Localhost:
```powershell
mongo yatranepal --eval "db.getCollectionNames()"
```

### On Atlas (using mongosh):
```powershell
mongosh "mongodb+srv://username:password@cluster0.gbx3m.mongodb.net/yatranepal" --eval "db.getCollectionNames()"
```

---

## ⚡ Automated Script for All Collections

Want to export/import all collections at once? Let me know and I'll create a script!

---

## 🆘 Troubleshooting

### "mongodump not found"
- MongoDB tools not in PATH
- Navigate to MongoDB bin directory first
- Or download MongoDB Database Tools separately

### "Authentication failed"
- Check Atlas username and password
- Ensure IP is whitelisted in Atlas Network Access
- URL-encode special characters in password

### "Connection timeout"
- Check internet connection
- Verify Atlas cluster is running
- Check Network Access whitelist

---

## ✅ Recommended Method

**For beginners:** Use MongoDB Compass (Method 2) - it's visual and easy
**For advanced users:** Use mongodump/mongorestore (Method 1) - faster for large datasets
**For specific collections:** Use mongoexport/mongoimport (Method 3)

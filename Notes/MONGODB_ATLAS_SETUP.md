# MongoDB Atlas Setup Guide

## 📋 Prerequisites

You need your MongoDB Atlas credentials to complete this setup.

## 🔧 Step-by-Step Setup

### **Step 1: Get Your MongoDB Atlas Connection String**

1. Go to https://cloud.mongodb.com/
2. Log in to your account
3. Select your project
4. Click on "Connect" button for your cluster (cluster0)
5. Choose "Connect your application"
6. Copy the connection string (should look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.gbx3m.mongodb.net/?retryWrites=true&w=majority
   ```

### **Step 2: Update Your .env File**

Open `D:\MERN\yatranepalv2\api\.env` and update the MONGO variable:

```env
MONGO=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.gbx3m.mongodb.net/yatranepal?retryWrites=true&w=majority
```

**Replace:**
- `YOUR_USERNAME` with your MongoDB Atlas username
- `YOUR_PASSWORD` with your MongoDB Atlas password
- Make sure the database name is `yatranepal` at the end

**Example:**
```env
MONGO=mongodb+srv://milanUser:MySecurePass123@cluster0.gbx3m.mongodb.net/yatranepal?retryWrites=true&w=majority
```

### **Step 3: Whitelist Your IP Address**

1. In MongoDB Atlas dashboard
2. Go to "Network Access" (left sidebar)
3. Click "Add IP Address"
4. Either:
   - Click "Add Current IP Address" (recommended for development)
   - Or click "Allow Access from Anywhere" (0.0.0.0/0) for testing

### **Step 4: Test the Connection**

Restart your API server:

```powershell
cd D:\MERN\yatranepalv2\api
npm run dev
```

You should see:
```
Connected to MongoDB.
Backend running at http://localhost:8800
```

### **Step 5: Verify Data**

After connecting, your app will start with an empty database. You can:

1. **Import your backup (if you have one)**
2. **Recreate data manually through your admin panel**
3. **Use seed data if you have any**

## ⚠️ Important Notes

- MongoDB Atlas free tier has limits (512MB storage)
- Keep your credentials secure - never commit .env file
- The connection string includes your password - be careful!
- Make sure to add `.env` to your `.gitignore`

## 🔒 Security Tip

Consider using environment-specific connection strings:
- Development: Your local MongoDB or Atlas
- Production: Separate Atlas cluster

## ✅ Advantages of MongoDB Atlas

- ✅ No data loss from local crashes
- ✅ Automatic backups
- ✅ Access from anywhere
- ✅ Better security
- ✅ Scalability

## 🆘 Troubleshooting

**Error: "Authentication failed"**
- Check username and password are correct
- Password should be URL-encoded if it contains special characters

**Error: "Connection timeout"**
- Check your IP is whitelisted in Network Access
- Check your internet connection

**Error: "Database not found"**
- MongoDB will create the database automatically on first write
- Just start using your app and it will be created

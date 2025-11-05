# 🚀 Quick Start - MongoDB Atlas Connection

## ⚡ Fast Track (5 Minutes)

### 1️⃣ **Go to MongoDB Atlas**
🔗 https://cloud.mongodb.com/

### 2️⃣ **Get Your Credentials**

**If you have an account:**
- Click "Database Access" (left sidebar)
- See your username there
- If you forgot password: Edit → Edit Password → Set new password

**If you DON'T have an account:**
- Sign up at: https://www.mongodb.com/cloud/atlas/register
- Create FREE cluster (M0)
- Create database user (save username & password!)

### 3️⃣ **Whitelist Your IP**
- Click "Network Access" (left sidebar)
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0)

### 4️⃣ **Get Connection String**
- Go to "Database"
- Click "Connect" on your cluster
- Select "Connect your application"
- Copy the connection string

### 5️⃣ **Update Your .env**

Open: `D:\MERN\yatranepalv2\api\.env`

Update this line:
```env
MONGO=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.gbx3m.mongodb.net/yatranepal?retryWrites=true&w=majority
```

Replace:
- `YOUR_USERNAME` → your MongoDB username
- `YOUR_PASSWORD` → your MongoDB password

### 6️⃣ **Test Connection**
```powershell
cd D:\MERN\yatranepalv2\api
npm run dev
```

Should see: ✅ "Connected to MongoDB."

---

## 🎯 **Example**

If your credentials are:
- Username: `adminUser`
- Password: `SecurePass123`

Your `.env` should have:
```env
MONGO=mongodb+srv://adminUser:SecurePass123@cluster0.gbx3m.mongodb.net/yatranepal?retryWrites=true&w=majority
```

---

## ⚠️ **Special Characters in Password?**

If your password has `@`, `#`, `$`, etc., URL-encode them:
- `@` → `%40`
- `#` → `%23`  
- `$` → `%24`

Example password: `Pass@123` becomes `Pass%40123`

---

## 📚 **More Help?**

See complete guide: `MONGODB_ATLAS_CREDENTIALS.md`

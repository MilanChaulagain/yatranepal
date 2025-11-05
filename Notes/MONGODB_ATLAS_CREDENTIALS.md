# MongoDB Atlas Account Setup - Complete Guide

## 🆕 **Creating a New MongoDB Atlas Account**

### **Step 1: Sign Up**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Fill in:
   - Email address
   - Password
   - First Name / Last Name
3. Click "Sign Up"
4. Verify your email

### **Step 2: Create Your First Cluster**

1. After login, click "Build a Database"
2. Choose **FREE** tier (M0)
3. Cloud Provider: Choose any (AWS recommended)
4. Region: Choose closest to you or your users
5. Cluster Name: Keep as `Cluster0` or rename it
6. Click "Create Cluster" (takes 1-3 minutes)

### **Step 3: Create Database User**

1. Click "Database Access" (left sidebar under SECURITY)
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: Enter a username (e.g., `yatranepalAdmin`)
5. Password: 
   - Click "Autogenerate Secure Password" 
   - OR enter your own secure password
   - **⚠️ COPY THIS PASSWORD NOW!** You won't see it again
6. Database User Privileges: Select "Read and write to any database"
7. Click "Add User"

### **Step 4: Whitelist IP Address**

1. Click "Network Access" (left sidebar under SECURITY)
2. Click "Add IP Address"
3. For Development:
   - Option A: Click "Add Current IP Address" (recommended)
   - Option B: Click "Allow Access from Anywhere" (enter `0.0.0.0/0`)
4. Click "Confirm"

### **Step 5: Get Connection String**

1. Go back to "Database" (left sidebar)
2. Click "Connect" button on your cluster
3. Select "Connect your application"
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.gbx3m.mongodb.net/?retryWrites=true&w=majority
   ```

### **Step 6: Update Your .env File**

Replace the connection string in `D:\MERN\yatranepalv2\api\.env`:

```env
MONGO=mongodb+srv://yatranepalAdmin:YourCopiedPassword123@cluster0.gbx3m.mongodb.net/yatranepal?retryWrites=true&w=majority
```

**Important Notes:**
- Replace `<username>` with the username you created (e.g., `yatranepalAdmin`)
- Replace `<password>` with the password you copied
- Add `/yatranepal` before the `?` to specify your database name
- If password has special characters, URL-encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`

### **Example:**

If your credentials are:
- Username: `milanUser`
- Password: `MyPass@123`
- Cluster: `cluster0.gbx3m.mongodb.net`

Your connection string would be:
```env
MONGO=mongodb+srv://milanUser:MyPass%40123@cluster0.gbx3m.mongodb.net/yatranepal?retryWrites=true&w=majority
```
(Note: `@` was replaced with `%40`)

---

## 🔐 **Security Best Practices**

1. ✅ Use strong passwords (mix of letters, numbers, symbols)
2. ✅ Never commit `.env` file to GitHub (already in .gitignore)
3. ✅ Use different credentials for development and production
4. ✅ Regularly rotate passwords
5. ✅ Limit IP whitelist when possible

---

## 🆘 **Troubleshooting**

### "Authentication failed"
- Double-check username and password
- Make sure password is URL-encoded if it contains special characters
- Verify the database user was created in Database Access

### "Connection timeout"
- Check your IP is whitelisted in Network Access
- Check your internet connection
- Try whitelisting `0.0.0.0/0` temporarily for testing

### "MongoServerError: bad auth"
- The username or password is incorrect
- Reset the password in Database Access → Edit User

---

## 📞 **Need Help?**

If you're stuck, you can:
1. Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
2. Ask for help with the specific error message you're getting

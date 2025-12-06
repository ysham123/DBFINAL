# 🎯 START HERE - Simple 4-Step Setup

## What I Need You To Do:

### 1️⃣ Turn On XAMPP MySQL Server
- Open XAMPP Control Panel
- Click **Start** button next to **MySQL**
- Wait until it shows "Running" ✅

### 2️⃣ Install Everything (First Time Only)
Open Terminal in this folder and run:
```bash
cd backend && npm install && cd ../frontend && npm install && cd ..
```

### 3️⃣ Verify XAMPP is Running
```bash
node check-xampp.js
```
This checks if MySQL is accessible. If you see ✅ SUCCESS, continue!

### 4️⃣ Setup Database (First Time Only)
```bash
node setup-database.js
```

You'll see default login credentials printed!

### 5️⃣ Start the Servers

**Open TWO Terminal Windows:**

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```
Wait for: ✅ Database connected successfully

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```
Browser opens automatically to http://localhost:3000

---

## ✅ Everything Is Already Configured:

✅ Database connection configured for XAMPP (no password)  
✅ JWT secret token set  
✅ File upload path configured  
✅ All environment variables ready  
✅ Admin account will be created automatically  
✅ Test client account will be created automatically  

## 🔐 Default Login Credentials:

**Anna (Admin):**
- Email: `anna@cleaningservices.com`
- Password: `anna123`

**Test Client:**
- Email: `john@example.com`
- Password: `test123`

---

## 🎬 That's It!

Just turn on XAMPP MySQL and run the commands above. Everything else is automated!

## 📍 Quick Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

**Any questions? Just turn on MySQL in XAMPP and run the setup!** 🚀

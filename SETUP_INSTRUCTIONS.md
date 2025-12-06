# 🚀 Quick Setup Instructions for XAMPP

## Step 1: Start XAMPP Servers ⚡

1. Open XAMPP Control Panel
2. Click **Start** next to **MySQL** (Apache not needed for this project)
3. Wait until it shows "Running" in green

## Step 2: Install Dependencies 📦

Open Terminal and run:

```bash
cd /Users/yosefshammout/Desktop/dbfinalproject

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 3: Setup Database 🗄️

From the project root directory:

```bash
cd /Users/yosefshammout/Desktop/dbfinalproject
node setup-database.js
```

This will automatically:
- ✅ Create the database
- ✅ Create all tables
- ✅ Setup Anna's admin account
- ✅ Create a test client account

## Step 4: Start the Application 🎯

### Terminal 1 - Backend Server:
```bash
cd /Users/yosefshammout/Desktop/dbfinalproject/backend
npm start
```

Wait for: `✅ Database connected successfully` and `🚀 Server running on port 5000`

### Terminal 2 - Frontend Application:
```bash
cd /Users/yosefshammout/Desktop/dbfinalproject/frontend
npm start
```

Your browser will automatically open to `http://localhost:3000`

## Step 5: Login 🔐

### Anna (Admin) Account:
- **Email:** anna@cleaningservices.com
- **Password:** anna123

### Test Client Account:
- **Email:** john@example.com
- **Password:** test123

## Troubleshooting 🔧

### "Cannot connect to database"
- Make sure XAMPP MySQL is running (green status)
- Check port 3306 is not blocked
- Restart XAMPP MySQL

### "Module not found"
- Run `npm install` in both backend and frontend directories

### Port 3000 or 5000 already in use
- Kill the process: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in backend/.env

## Testing the System ✅

1. **Register a new client:**
   - Go to http://localhost:3000/register
   - Fill in details and register

2. **Submit a service request:**
   - Login as client
   - Click "New Service Request"
   - Fill form and upload photos
   - Submit

3. **Login as Anna:**
   - Logout current user
   - Login with anna@cleaningservices.com / anna123
   - Go to "Requests" tab
   - Send a quote for the request

4. **Accept quote as client:**
   - Logout and login as client
   - View request details
   - Accept the quote

5. **Complete the workflow:**
   - Login as Anna
   - Mark order as completed
   - Generate a bill
   - Login as client and pay the bill

6. **View Analytics:**
   - Login as Anna
   - Go to Dashboard
   - Switch between all 8 report tabs

## 🎥 Ready for Demo!

All setup is complete. You can now:
- Record your demo video
- Show all functionality
- Demonstrate the 8 dashboard queries
- Update database and show query results change

## Need Help? 🆘

If something doesn't work:
1. Check XAMPP MySQL is running
2. Check both terminals show no errors
3. Clear browser cache and reload
4. Restart both servers

---

**Everything is configured and ready to go!** 🎉

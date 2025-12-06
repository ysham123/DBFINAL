# Home Cleaning Services Management System

A comprehensive database-driven web application for managing home cleaning services for contractor Anna Johnson.

## Project Overview

This system allows clients to:
- Register and create service requests
- Upload photos of their homes
- Receive and negotiate quotes
- Manage orders and payments

Anna Johnson (contractor) can:
- Review service requests
- Send quotes or reject requests
- Manage orders and mark them as complete
- Generate and revise bills
- View analytics dashboards

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React 18**
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- Custom CSS with modern gradients

## Database Schema

The database consists of 8 main tables:
1. **Clients** - User information
2. **ServiceRequests** - Client service requests
3. **RequestPhotos** - Photos uploaded with requests (max 5)
4. **Quotes** - Quote responses and negotiation history
5. **Orders** - Accepted service agreements
6. **Bills** - Bills generated for completed orders
7. **BillRevisions** - Bill revision history for disputes

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Step 1: Clone and Setup

```bash
# Navigate to the project directory
cd dbfinalproject

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE cleaning_services_db;

# Use the database
USE cleaning_services_db;

# Import schema
SOURCE /path/to/dbfinalproject/database/schema.sql;
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cleaning_services_db

JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Step 4: Create Anna's Account

After setting up the database, update Anna's password:

```sql
-- Generate a bcrypt hash for your password (use online tool or Node.js)
-- Then update Anna's account:
UPDATE Clients 
SET password_hash = '$2a$10$your_bcrypt_hashed_password_here' 
WHERE email = 'anna@cleaningservices.com';
```

Or register a new admin account and manually update the email to `anna@cleaningservices.com`.

## Running the Application

### Start Backend Server

```bash
cd backend
npm start

# Or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend Application

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

### Access the Application

- **Client Portal**: `http://localhost:3000`
- **Admin Portal**: Login with Anna's credentials (`anna@cleaningservices.com`)

## Features Implemented

### Client Features
- ✅ User registration and login
- ✅ Submit service requests with photos (max 5)
- ✅ View request status and history
- ✅ Receive quotes from Anna
- ✅ Negotiate quotes (accept or counter)
- ✅ View orders and track completion
- ✅ Pay bills or dispute them
- ✅ View bill revision history

### Anna (Admin) Features
- ✅ View all service requests
- ✅ Send quotes or reject requests
- ✅ Manage quotes during negotiation
- ✅ Update order status (scheduled, in progress, completed, cancelled)
- ✅ Generate bills for completed orders
- ✅ Revise bills in case of disputes
- ✅ View comprehensive analytics dashboard with 8 queries:
  1. Frequent clients (most completed orders)
  2. Uncommitted clients (3+ requests, no completed orders)
  3. This month's accepted quotes
  4. Prospective clients (registered but no requests)
  5. Largest jobs (most rooms)
  6. Overdue bills (unpaid > 1 week)
  7. Bad clients (never paid overdue bills)
  8. Good clients (always paid within 24 hours)

## Dashboard Queries

All SQL queries are available in `sql.txt`. The dashboard provides real-time analytics for business insights.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new client
- `POST /api/auth/login` - Login

### Clients
- `GET /api/clients/profile` - Get client profile
- `PUT /api/clients/profile` - Update profile

### Service Requests
- `POST /api/requests` - Submit new request (with photos)
- `GET /api/requests/my-requests` - Get client's requests
- `GET /api/requests/all` - Get all requests (Anna only)
- `GET /api/requests/:id` - Get request details
- `PATCH /api/requests/:id/cancel` - Cancel request

### Quotes
- `POST /api/quotes` - Create quote (Anna only)
- `GET /api/quotes/request/:request_id` - Get quotes for request
- `PATCH /api/quotes/:id/respond` - Respond to quote (accept/counter)

### Orders
- `GET /api/orders/all` - Get all orders (Anna only)
- `GET /api/orders/my-orders` - Get client's orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status (Anna only)

### Bills
- `POST /api/bills` - Generate bill (Anna only)
- `GET /api/bills/all` - Get all bills (Anna only)
- `GET /api/bills/my-bills` - Get client's bills
- `GET /api/bills/:id` - Get bill details
- `PATCH /api/bills/:id/pay` - Pay bill
- `PATCH /api/bills/:id/dispute` - Dispute bill
- `PATCH /api/bills/:id/revise` - Revise bill (Anna only)

### Dashboard (Anna only)
- `GET /api/dashboard/frequent-clients`
- `GET /api/dashboard/uncommitted-clients`
- `GET /api/dashboard/accepted-quotes?year=2024&month=12`
- `GET /api/dashboard/prospective-clients`
- `GET /api/dashboard/largest-jobs`
- `GET /api/dashboard/overdue-bills`
- `GET /api/dashboard/bad-clients`
- `GET /api/dashboard/good-clients`

## Project Structure

```
dbfinalproject/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── requests.js
│   │   ├── quotes.js
│   │   ├── orders.js
│   │   ├── bills.js
│   │   └── dashboard.js
│   ├── uploads/ (created automatically)
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ClientDashboard.js
│   │   │   ├── NewRequest.js
│   │   │   ├── MyRequests.js
│   │   │   ├── RequestDetails.js
│   │   │   ├── MyOrders.js
│   │   │   ├── OrderDetails.js
│   │   │   ├── MyBills.js
│   │   │   ├── BillDetails.js
│   │   │   ├── AnnaDashboard.js
│   │   │   ├── AnnaRequests.js
│   │   │   ├── AnnaOrders.js
│   │   │   └── AnnaBills.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── database/
│   └── schema.sql
├── sql.txt
└── README.md
```

## Testing Workflow

### 1. Register a Client
- Go to `/register`
- Fill in all required fields
- Login with credentials

### 2. Submit a Service Request
- Navigate to "New Request"
- Fill in service details
- Upload up to 5 photos
- Submit request

### 3. Anna Reviews Request (Login as Anna)
- View request in "Requests" page
- Click "Quote" button
- Enter quoted price and schedule
- Submit quote

### 4. Client Responds to Quote
- View request details
- Accept quote or send counter offer
- If accepted, order is created

### 5. Anna Manages Order
- Update order status to "in progress"
- Update to "completed" when done
- Generate bill for completed order

### 6. Client Pays or Disputes Bill
- View bill details
- Pay bill immediately, or
- Dispute with a note

### 7. Anna Handles Dispute
- Review dispute
- Revise bill with new amount
- Add revision note

### 8. View Analytics
- Anna can view dashboard
- Switch between 8 different reports
- Filter accepted quotes by month/year

## Database Constraints

- Email must be unique
- Positive values for: num_rooms, budgets, prices
- Max 5 photos per request
- Enum constraints for statuses and types
- Foreign key relationships with CASCADE delete
- Timestamps for audit trail

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation
- SQL injection prevention (parameterized queries)
- File upload restrictions (type and size)
- CORS enabled

## Known Limitations

- Stores only last 4 digits of credit card (for security)
- File uploads stored locally (not cloud storage)
- No email notifications implemented
- Dispute resolution requires manual intervention

## Future Enhancements

- Email/SMS notifications for quotes and bills
- Cloud storage for photos (AWS S3)
- Payment gateway integration
- Mobile responsive improvements
- Calendar view for scheduled services
- Client reviews and ratings
- Recurring service subscriptions

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

### Cannot Upload Photos
- Check `uploads` folder exists in backend
- Verify file size < 5MB
- Check file type is image

### Token Expired Error
- Login again
- Check JWT_SECRET in `.env`

## Contributors

This project was completed as a course assignment for CSC 6710 Database Systems.

**Total Development Time**: [Insert hours]

**Division of Work**:
- Database Design: [Partner names]
- Backend Development: [Partner names]
- Frontend Development: [Partner names]
- Testing & Documentation: [Partner names]

## License

This project is for educational purposes only.

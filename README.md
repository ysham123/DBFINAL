# Anna’s Cleaning Services

A client portal and workspace for a home cleaning business. Clients request services, review quotes, and track bookings and bills. Anna manages requests, schedules, billing, and client reports.

Built with React 18, Express, and MySQL. The existing request → quote → order → bill workflow and database schema are preserved.

## Local setup

Use Node.js 20 or newer and a running MySQL 8 server. XAMPP also works if its database supports the schema.

```sh
git clone https://github.com/ysham123/DBFINAL.git
cd DBFINAL
npm run install-all
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your database credentials. Set `ADMIN_PASSWORD` to a password of at least 12 characters and `JWT_SECRET` to a random secret of at least 32 characters. Generate a secret locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Initialize an empty database:

```sh
npm run setup
```

Setup creates seven tables and the admin account. It refuses to run against a database that already contains tables. It does not reset existing accounts or create shared test passwords.

Start the servers in separate terminals:

```sh
npm run start-backend
npm run start-frontend
```

Open http://localhost:3000. Sign in as `anna@cleaningservices.com` using your configured admin password, or register a client account.

## Configuration

Backend configuration lives in `backend/.env`. See [the example](backend/.env.example) for database, server, upload, and authentication settings.

The frontend uses `/api` by default. The development server proxies API and upload requests to port 5000. If the backend runs elsewhere, set `REACT_APP_API_URL` in `frontend/.env` to its full API URL and set `CLIENT_ORIGIN` on the backend to the frontend origin.

Uploads default to `backend/uploads`; custom relative upload paths resolve from the backend directory. The app accepts up to five JPG, PNG, or GIF images, with a default limit of 5 MB each.

## Build and checks

```sh
npm --prefix frontend run build
npm --prefix backend test
```

After a frontend build, the backend serves the compiled app and supports direct links to client and admin pages. Run `npm run start-backend` with the configured database available.

The API health endpoint, `GET /api/health`, checks database connectivity and returns 503 if the database is unavailable.

Backend tests exercise validation, authorization, upload errors, and transaction failures through HTTP using a database stub. A live MySQL instance is still required to verify SQL and the complete workflow.

## Application structure

- `frontend/src/components`: navigation, auth layout, dialogs, tables, and shared UI.
- `frontend/src/pages`: client and admin workflows.
- `frontend/src/services/api.js`: API configuration and session-expiry handling.
- `backend/routes`: authentication, requests, quotes, orders, bills, and reports.
- `backend/middleware`: authentication, upload handling, and validation.
- `database/schema.sql`: schema for a fresh database.
- `sql.txt`: reference queries for the eight reports.

## Scope

The app records payments made outside the system; it does not process cards or transfer money. Uploads are stored locally and served through public asset URLs. There are no email notifications or password-reset flows.

The admin account uses the existing reserved email address. Changing to multiple staff roles would require a separate authorization change.

Originally developed for CSC 6710 Database Systems.

# Database setup

Configuration comes from `backend/.env`. Start MySQL, set your credentials, and run `node check-xampp.js` to check connectivity. This command also works with a standalone MySQL server.

Run `npm run setup` once against an empty database. Existing tables cause setup to stop without replacing them. The admin password comes from `ADMIN_PASSWORD`; no default password is supplied.

See [the README](README.md#local-setup) for the complete installation steps.

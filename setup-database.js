const mysql = require("./backend/node_modules/mysql2/promise");
const fs = require("node:fs/promises");
const path = require("node:path");
const bcrypt = require("./backend/node_modules/bcryptjs");
require("./backend/config/env");

async function setupDatabase() {
  const name = process.env.DB_NAME || "cleaning_services_db";
  if (!/^[a-zA-Z0-9_]+$/.test(name))
    throw new Error(
      "DB_NAME must contain only letters, numbers, or underscores.",
    );
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
    throw new Error(
      "Set ADMIN_PASSWORD to at least 12 characters in backend/.env.",
    );
  }
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });
  try {
    await connection.query(
      "CREATE DATABASE IF NOT EXISTS " + mysql.escapeId(name),
    );
    await connection.query("USE " + mysql.escapeId(name));
    const [tables] = await connection.query("SHOW TABLES");
    if (tables.length)
      throw new Error(
        "Database is not empty. Setup stopped without changing existing tables. Use a new DB_NAME.",
      );
    const schema = await fs.readFile(
      path.join(__dirname, "database", "schema.sql"),
      "utf8",
    );
    await connection.query(schema);
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await connection.query(
      "UPDATE Clients SET password_hash = ? WHERE email = ?",
      [passwordHash, "anna@cleaningservices.com"],
    );
    console.log(
      "Database initialized. Sign in as anna@cleaningservices.com with your configured admin password.",
    );
    console.log("Create client accounts through the registration page.");
  } finally {
    await connection.end();
  }
}

setupDatabase().catch((error) => {
  console.error("Setup failed:", error.message);
  process.exitCode = 1;
});

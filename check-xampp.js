const mysql = require("./backend/node_modules/mysql2/promise");
require("./backend/config/env");

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    connectTimeout: 5000,
  });
  await connection.ping();
  await connection.end();
  console.log("MySQL is reachable using backend/.env.");
}

checkDatabase().catch((error) => {
  console.error("Cannot connect to MySQL:", error.message);
  console.error(
    "Check that the server is running and that backend/.env contains the correct connection details.",
  );
  process.exitCode = 1;
});

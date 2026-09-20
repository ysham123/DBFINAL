const express = require("express");
const cors = require("cors");
const path = require("node:path");
const fs = require("node:fs");
const multer = require("multer");
const { uploadDir, clientOrigin, adminEmail } = require("./config/env");
const { isEmail } = require("validator");
const db = require("./config/database");

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: clientOrigin }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  next();
});
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use("/uploads", express.static(uploadDir));

for (const name of [
  "auth",
  "clients",
  "requests",
  "quotes",
  "orders",
  "bills",
  "dashboard",
]) {
  app.use("/api/" + name, require("./routes/" + name));
}

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res
      .status(503)
      .json({ status: "unavailable", error: "Database unavailable" });
  }
});
app.use("/api", (req, res) =>
  res.status(404).json({ error: "Endpoint not found" }),
);

const buildDir = path.join(__dirname, "..", "frontend", "build");
if (fs.existsSync(path.join(buildDir, "index.html"))) {
  app.use(express.static(buildDir));
  app.get("*", (req, res) => res.sendFile(path.join(buildDir, "index.html")));
}

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error:
        err.code === "LIMIT_FILE_SIZE"
          ? "An image exceeds the upload size limit."
          : "Upload up to five images using the photos field.",
    });
  }
  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error("Request failed:", err.message);
  res.status(status).json({
    error:
      err.type === "entity.parse.failed"
        ? "Invalid JSON body."
        : status === 500
          ? "Unable to complete this request. Please try again."
          : err.message,
  });
});

async function start() {
  if (!isEmail(adminEmail))
    throw new Error(
      "Set ADMIN_EMAIL to your administrator's email address in backend/.env.",
    );
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
      "Set JWT_SECRET to a random value of at least 32 characters in backend/.env.",
    );
  }
  await db.query("SELECT 1");
  const server = app.listen(process.env.PORT || 5000, () => {
    console.log(
      "Cleaning services API listening on port " + (process.env.PORT || 5000),
    );
  });
  const stop = () => server.close(() => db.end().then(() => process.exit(0)));
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
  return server;
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Unable to start:", error.message);
    db.end().finally(() => {
      process.exitCode = 1;
    });
  });
}
module.exports = { app, start };

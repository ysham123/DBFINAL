const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { normalizeEmail } = require("validator");
const adminEmail = normalizeEmail((process.env.ADMIN_EMAIL || "").trim()) || "";
const isAdminEmail = (email) =>
  Boolean(adminEmail) &&
  normalizeEmail(String(email || "").trim()) === adminEmail;

module.exports = {
  adminEmail,
  isAdminEmail,
  uploadDir: path.resolve(
    __dirname,
    "..",
    process.env.UPLOAD_PATH || "uploads",
  ),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
};

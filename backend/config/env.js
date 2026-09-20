const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

module.exports = {
  uploadDir: path.resolve(
    __dirname,
    "..",
    process.env.UPLOAD_PATH || "uploads",
  ),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
};

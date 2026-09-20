const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("node:crypto");
const { uploadDir } = require("../config/env");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      "photo-" + randomUUID() + path.extname(file.originalname).toLowerCase(),
    );
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
  };
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes[extname] === file.mimetype;

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const error = new Error("Choose JPG, PNG, or GIF images.");
    error.status = 400;
    cb(error);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5,
    fields: 10,
    fieldSize: 16384,
    parts: 15,
  },
  fileFilter: fileFilter,
});

module.exports = upload;

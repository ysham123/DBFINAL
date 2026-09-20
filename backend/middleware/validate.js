const { validationResult } = require("express-validator");
const fs = require("node:fs/promises");

async function removeUploads(files = []) {
  await Promise.all(
    files.map((file) =>
      fs.unlink(file.path).catch((error) => {
        if (error.code !== "ENOENT")
          console.error("Could not remove unused upload:", error.message);
      }),
    ),
  );
}

async function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  await removeUploads(req.files);
  return res
    .status(400)
    .json({ error: errors.array()[0].msg, errors: errors.array() });
}

module.exports = { validate, removeUploads };

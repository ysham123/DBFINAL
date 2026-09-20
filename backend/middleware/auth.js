const jwt = require("jsonwebtoken");
require("../config/env");

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = /^Bearer (\S+)$/i.exec(authHeader || "")?.[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "Your session has expired. Please sign in again." });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is Anna (admin)
const isAnna = (req, res, next) => {
  if (req.user.email !== "anna@cleaningservices.com") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = { authenticateToken, isAnna };

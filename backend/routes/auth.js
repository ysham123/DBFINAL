const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../config/database");

const router = express.Router();

// Register new client
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Enter a valid email address.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6, max: 72 })
      .withMessage("Use a password between 6 and 72 characters."),
    body("first_name")
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage("Enter a valid first name."),
    body("last_name")
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage("Enter a valid last name."),
    body("phone_number")
      .trim()
      .notEmpty()
      .isLength({ max: 20 })
      .withMessage("Enter a valid phone number."),
    body("address")
      .trim()
      .notEmpty()
      .isLength({ max: 255 })
      .withMessage("Enter a valid address."),
    body("credit_card_last4")
      .optional({ values: "falsy" })
      .matches(/^\d{4}$/)
      .withMessage("Enter the last four card digits."),
    body("credit_card_type")
      .optional({ values: "falsy" })
      .isIn(["Visa", "Mastercard", "Amex", "Discover"])
      .withMessage("Choose a supported card type."),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ error: errors.array()[0].msg, errors: errors.array() });
      }

      const {
        email,
        password,
        first_name,
        last_name,
        phone_number,
        address,
        credit_card_last4,
        credit_card_type,
      } = req.body;

      if (email === "anna@cleaningservices.com") {
        return res
          .status(403)
          .json({ error: "This email is reserved for the administrator." });
      }

      // Check if user already exists
      const [existingUsers] = await db.query(
        "SELECT * FROM Clients WHERE email = ?",
        [email],
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Insert new client
      const [result] = await db.query(
        `INSERT INTO Clients (first_name, last_name, address, phone_number, email, password_hash, credit_card_last4, credit_card_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name,
          last_name,
          address,
          phone_number,
          email,
          password_hash,
          credit_card_last4 || null,
          credit_card_type || null,
        ],
      );

      // Generate JWT token
      const token = jwt.sign(
        { client_id: result.insertId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" },
      );

      res.status(201).json({
        message: "Registration successful",
        token,
        client: {
          client_id: result.insertId,
          first_name,
          last_name,
          email,
        },
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        return res.status(409).json({ error: "Email already registered" });
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  },
);

// Login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ error: errors.array()[0].msg, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const [users] = await db.query("SELECT * FROM Clients WHERE email = ?", [
        email,
      ]);
      if (users.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { client_id: user.client_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" },
      );

      res.json({
        message: "Login successful",
        token,
        client: {
          client_id: user.client_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          isAnna: user.email === "anna@cleaningservices.com",
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  },
);

module.exports = router;

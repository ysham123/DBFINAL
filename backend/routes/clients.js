const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticateToken } = require("../middleware/auth");
const db = require("../config/database");

const router = express.Router();

// Get current client profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [clients] = await db.query(
      "SELECT client_id, first_name, last_name, address, phone_number, email, credit_card_last4, credit_card_type, created_at FROM Clients WHERE client_id = ?",
      [req.user.client_id],
    );

    if (clients.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(clients[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update client profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("first_name")
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage("Enter your first name."),
    body("last_name")
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage("Enter your last name."),
    body("address")
      .trim()
      .notEmpty()
      .isLength({ max: 255 })
      .withMessage("Enter your address."),
    body("phone_number")
      .trim()
      .notEmpty()
      .isLength({ max: 20 })
      .withMessage("Enter your phone number."),
    body("credit_card_last4")
      .optional({ values: "falsy" })
      .matches(/^\d{4}$/)
      .withMessage("Enter four card digits."),
    body("credit_card_type")
      .optional({ values: "falsy" })
      .isIn(["Visa", "Mastercard", "Amex", "Discover"])
      .withMessage("Choose a supported card type."),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        first_name,
        last_name,
        address,
        phone_number,
        credit_card_last4,
        credit_card_type,
      } = req.body;

      await db.query(
        `UPDATE Clients
       SET first_name = ?, last_name = ?, address = ?, phone_number = ?, credit_card_last4 = ?, credit_card_type = ?
       WHERE client_id = ?`,
        [
          first_name,
          last_name,
          address,
          phone_number,
          credit_card_last4 || null,
          credit_card_type || null,
          req.user.client_id,
        ],
      );

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

module.exports = router;

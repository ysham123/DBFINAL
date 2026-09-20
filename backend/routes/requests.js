const express = require("express");
const { body } = require("express-validator");
const { validate, removeUploads } = require("../middleware/validate");
const { authenticateToken, isAnna } = require("../middleware/auth");
const upload = require("../middleware/upload");
const db = require("../config/database");

const router = express.Router();

// Submit a new service request (with photos)
router.post(
  "/",
  authenticateToken,
  upload.array("photos", 5),
  [
    body("service_address")
      .trim()
      .notEmpty()
      .isLength({ max: 255 })
      .withMessage("Enter a service address."),
    body("cleaning_type")
      .isIn(["basic", "deep cleaning", "move-out"])
      .withMessage("Choose a cleaning type."),
    body("num_rooms")
      .isInt({ min: 1, max: 1000 })
      .withMessage("Enter a valid number of rooms."),
    body("proposed_budget")
      .isFloat({ min: 0, max: 99999999.99 })
      .withMessage("Enter a valid budget."),
    body("preferred_datetime")
      .isISO8601()
      .withMessage("Choose a valid date and time."),
    body("special_notes")
      .optional()
      .isLength({ max: 5000 })
      .withMessage("Keep notes under 5,000 characters."),
  ],
  validate,
  async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      const {
        service_address,
        cleaning_type,
        num_rooms,
        preferred_datetime,
        proposed_budget,
        special_notes,
      } = req.body;

      // Insert service request
      const [result] = await connection.query(
        `INSERT INTO ServiceRequests (client_id, service_address, cleaning_type, num_rooms, preferred_datetime, proposed_budget, special_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.client_id,
          service_address,
          cleaning_type,
          num_rooms,
          preferred_datetime,
          proposed_budget,
          special_notes || null,
        ],
      );

      const request_id = result.insertId;

      // Insert photos if any were uploaded
      if (req.files && req.files.length > 0) {
        const photoPromises = req.files.map((file) => {
          const photo_url = `/uploads/${file.filename}`;
          return connection.query(
            "INSERT INTO RequestPhotos (request_id, photo_url) VALUES (?, ?)",
            [request_id, photo_url],
          );
        });
        await Promise.all(photoPromises);
      }

      await connection.commit();

      res.status(201).json({
        message: "Service request submitted successfully",
        request_id,
        photos_uploaded: req.files ? req.files.length : 0,
      });
    } catch (error) {
      if (connection) await connection.rollback().catch(() => {});
      await removeUploads(req.files);
      console.error("Error submitting request:", error);
      res.status(500).json({ error: "Failed to submit request" });
    } finally {
      connection?.release();
    }
  },
);

// Get all requests for current client
router.get("/my-requests", authenticateToken, async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT sr.*, 
              (SELECT COUNT(*) FROM RequestPhotos WHERE request_id = sr.request_id) as photo_count,
              (SELECT COUNT(*) FROM Quotes WHERE request_id = sr.request_id) as quote_count
       FROM ServiceRequests sr
       WHERE sr.client_id = ?
       ORDER BY sr.created_at DESC`,
      [req.user.client_id],
    );

    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// Get all requests (Anna only)
router.get("/all", authenticateToken, isAnna, async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT sr.*, 
              c.first_name, c.last_name, c.email, c.phone_number,
              (SELECT COUNT(*) FROM RequestPhotos WHERE request_id = sr.request_id) as photo_count,
              (SELECT COUNT(*) FROM Quotes WHERE request_id = sr.request_id) as quote_count
       FROM ServiceRequests sr
       JOIN Clients c ON sr.client_id = c.client_id
       ORDER BY sr.created_at DESC`,
    );

    res.json(requests);
  } catch (error) {
    console.error("Error fetching all requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// Get specific request details with photos
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT sr.*, c.first_name, c.last_name, c.email, c.phone_number
       FROM ServiceRequests sr
       JOIN Clients c ON sr.client_id = c.client_id
       WHERE sr.request_id = ?`,
      [req.params.id],
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const request = requests[0];

    // Check access rights
    if (
      req.user.email !== "anna@cleaningservices.com" &&
      request.client_id !== req.user.client_id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get photos
    const [photos] = await db.query(
      "SELECT * FROM RequestPhotos WHERE request_id = ? ORDER BY uploaded_at",
      [req.params.id],
    );

    request.photos = photos;

    res.json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ error: "Failed to fetch request" });
  }
});

// Cancel a request (client only)
router.patch("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const [requests] = await db.query(
      "SELECT * FROM ServiceRequests WHERE request_id = ? AND client_id = ?",
      [req.params.id, req.user.client_id],
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (requests[0].status === "accepted") {
      return res.status(400).json({ error: "Cannot cancel accepted request" });
    }

    await db.query(
      "UPDATE ServiceRequests SET status = ? WHERE request_id = ?",
      ["cancelled", req.params.id],
    );

    res.json({ message: "Request cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling request:", error);
    res.status(500).json({ error: "Failed to cancel request" });
  }
});

module.exports = router;

const express = require("express");
const { authenticateToken, isAnna } = require("../middleware/auth");
const db = require("../config/database");

const router = express.Router();

// Get all orders (Anna only)
router.get("/all", authenticateToken, isAnna, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, 
              c.first_name, c.last_name, c.email, c.phone_number,
              sr.service_address, sr.cleaning_type, sr.num_rooms,
              (SELECT COUNT(*) FROM Bills WHERE order_id = o.order_id) as has_bill
       FROM Orders o
       JOIN Clients c ON o.client_id = c.client_id
       JOIN ServiceRequests sr ON o.request_id = sr.request_id
       ORDER BY o.scheduled_datetime DESC`,
    );

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get orders for current client
router.get("/my-orders", authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, 
              sr.service_address, sr.cleaning_type, sr.num_rooms, sr.special_notes,
              (SELECT COUNT(*) FROM Bills WHERE order_id = o.order_id) as has_bill
       FROM Orders o
       JOIN ServiceRequests sr ON o.request_id = sr.request_id
       WHERE o.client_id = ?
       ORDER BY o.scheduled_datetime DESC`,
      [req.user.client_id],
    );

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get specific order details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, 
              c.first_name, c.last_name, c.email, c.phone_number,
              sr.service_address, sr.cleaning_type, sr.num_rooms, sr.special_notes, sr.preferred_datetime,
              q.quoted_price, q.scheduled_datetime as quote_scheduled_datetime, q.anna_notes
       FROM Orders o
       JOIN Clients c ON o.client_id = c.client_id
       JOIN ServiceRequests sr ON o.request_id = sr.request_id
       JOIN Quotes q ON o.quote_id = q.quote_id
       WHERE o.order_id = ?`,
      [req.params.id],
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    // Check access rights
    if (
      req.user.email !== "anna@cleaningservices.com" &&
      order.client_id !== req.user.client_id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get photos
    const [photos] = await db.query(
      `SELECT rp.* FROM RequestPhotos rp
       WHERE rp.request_id = ?`,
      [order.request_id],
    );

    order.photos = photos;

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Update order status (Anna only)
router.patch("/:id/status", authenticateToken, isAnna, async (req, res) => {
  try {
    const { completion_status } = req.body;

    const validStatuses = [
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(completion_status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const completed_at = completion_status === "completed" ? new Date() : null;

    const [result] = await db.query(
      "UPDATE Orders SET completion_status = ?, completed_at = ? WHERE order_id = ?",
      [completion_status, completed_at, req.params.id],
    );

    if (!result.affectedRows)
      return res.status(404).json({ error: "Order not found" });

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

module.exports = router;

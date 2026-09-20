const express = require("express");
const { authenticateToken, isAnna } = require("../middleware/auth");
const db = require("../config/database");

const router = express.Router();

// All dashboard routes require Anna authentication
router.use(authenticateToken, isAnna);

// Query 1: Frequent clients
router.get("/frequent-clients", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        c.client_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone_number,
        COUNT(o.order_id) as completed_orders
      FROM Clients c
      JOIN Orders o ON c.client_id = o.client_id
      WHERE o.completion_status = 'completed'
      GROUP BY c.client_id, c.first_name, c.last_name, c.email, c.phone_number
      ORDER BY completed_orders DESC, c.last_name ASC
    `);

    res.json(results);
  } catch (error) {
    console.error("Error fetching frequent clients:", error);
    res.status(500).json({ error: "Failed to fetch frequent clients" });
  }
});

// Query 2: Uncommitted clients
router.get("/uncommitted-clients", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        c.client_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone_number,
        COUNT(sr.request_id) as total_requests,
        COUNT(DISTINCT o.order_id) as completed_orders
      FROM Clients c
      JOIN ServiceRequests sr ON c.client_id = sr.client_id
      LEFT JOIN Orders o ON c.client_id = o.client_id AND o.completion_status = 'completed'
      GROUP BY c.client_id, c.first_name, c.last_name, c.email, c.phone_number
      HAVING COUNT(sr.request_id) >= 3 AND COUNT(DISTINCT o.order_id) = 0
      ORDER BY total_requests DESC, c.last_name ASC
    `);

    res.json(results);
  } catch (error) {
    console.error("Error fetching uncommitted clients:", error);
    res.status(500).json({ error: "Failed to fetch uncommitted clients" });
  }
});

// Query 3: This month's accepted quotes
router.get("/accepted-quotes", async (req, res) => {
  try {
    const { year, month } = req.query;
    const queryYear = year || new Date().getFullYear();
    const queryMonth = month || new Date().getMonth() + 1;

    if (
      !Number.isInteger(Number(queryYear)) ||
      Number(queryYear) < 2000 ||
      Number(queryYear) > 2100 ||
      !Number.isInteger(Number(queryMonth)) ||
      Number(queryMonth) < 1 ||
      Number(queryMonth) > 12
    ) {
      return res.status(400).json({ error: "Choose a valid year and month." });
    }

    const [results] = await db.query(
      `
      SELECT 
        q.quote_id,
        c.client_id,
        c.first_name,
        c.last_name,
        sr.service_address,
        sr.cleaning_type,
        sr.num_rooms,
        q.quoted_price,
        q.scheduled_datetime,
        q.created_at as quote_accepted_date
      FROM Quotes q
      JOIN ServiceRequests sr ON q.request_id = sr.request_id
      JOIN Clients c ON sr.client_id = c.client_id
      WHERE q.is_final_accepted = TRUE
        AND YEAR(q.created_at) = ?
        AND MONTH(q.created_at) = ?
      ORDER BY q.created_at DESC
    `,
      [queryYear, queryMonth],
    );

    res.json(results);
  } catch (error) {
    console.error("Error fetching accepted quotes:", error);
    res.status(500).json({ error: "Failed to fetch accepted quotes" });
  }
});

// Query 4: Prospective clients
router.get("/prospective-clients", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        c.client_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone_number,
        c.created_at as registration_date
      FROM Clients c
      LEFT JOIN ServiceRequests sr ON c.client_id = sr.client_id
      WHERE sr.request_id IS NULL
        AND c.email != 'anna@cleaningservices.com'
      ORDER BY c.created_at DESC
    `);

    res.json(results);
  } catch (error) {
    console.error("Error fetching prospective clients:", error);
    res.status(500).json({ error: "Failed to fetch prospective clients" });
  }
});

// Query 5: Largest jobs
router.get("/largest-jobs", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        sr.request_id,
        c.client_id,
        c.first_name,
        c.last_name,
        sr.service_address,
        sr.cleaning_type,
        sr.num_rooms,
        o.final_price,
        o.completed_at
      FROM ServiceRequests sr
      JOIN Orders o ON sr.request_id = o.request_id
      JOIN Clients c ON sr.client_id = c.client_id
      WHERE o.completion_status = 'completed'
        AND sr.num_rooms = (
          SELECT MAX(sr2.num_rooms)
          FROM ServiceRequests sr2
          JOIN Orders o2 ON sr2.request_id = o2.request_id
          WHERE o2.completion_status = 'completed'
        )
      ORDER BY o.completed_at DESC
    `);

    res.json(results);
  } catch (error) {
    console.error("Error fetching largest jobs:", error);
    res.status(500).json({ error: "Failed to fetch largest jobs" });
  }
});

// Query 6: Overdue bills
router.get("/overdue-bills", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        b.bill_id,
        b.order_id,
        c.client_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone_number,
        b.amount,
        b.bill_status,
        b.created_at as bill_date,
        DATEDIFF(NOW(), b.created_at) as days_overdue
      FROM Bills b
      JOIN Orders o ON b.order_id = o.order_id
      JOIN Clients c ON o.client_id = c.client_id
      WHERE b.bill_status IN ('pending', 'disputed', 'revised')
        AND b.payment_datetime IS NULL
        AND DATEDIFF(NOW(), b.created_at) > 7
      ORDER BY days_overdue DESC
    `);

    res.json(results);
  } catch (error) {
    console.error("Error fetching overdue bills:", error);
    res.status(500).json({ error: "Failed to fetch overdue bills" });
  }
});

// Query 7: Bad clients
router.get("/bad-clients", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT DISTINCT
        c.client_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone_number,
        COUNT(DISTINCT b.bill_id) as overdue_bills,
        SUM(b.amount) as total_unpaid
      FROM Clients c
      JOIN Orders o ON c.client_id = o.client_id
      JOIN Bills b ON o.order_id = b.order_id
      WHERE b.bill_status IN ('pending', 'disputed', 'revised')
        AND b.payment_datetime IS NULL
        AND DATEDIFF(NOW(), b.created_at) > 7
        AND NOT EXISTS (
          SELECT 1
          FROM Bills b2
          JOIN Orders o2 ON b2.order_id = o2.order_id
          WHERE o2.client_id = c.client_id
            AND b2.bill_status = 'paid'
            AND b2.payment_datetime IS NOT NULL
            AND DATEDIFF(b2.payment_datetime, b2.created_at) > 7
        )
      GROUP BY c.client_id, c.first_name, c.last_name, c.email, c.phone_number
      ORDER BY total_unpaid DESC
    `);

    res.json(results);
  } catch (error) {
    console.error("Error fetching bad clients:", error);
    res.status(500).json({ error: "Failed to fetch bad clients" });
  }
});

// Query 8: Good clients
router.get("/good-clients", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        c.client_id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone_number,
        COUNT(b.bill_id) as total_bills_paid
      FROM Clients c
      JOIN Orders o ON c.client_id = o.client_id
      JOIN Bills b ON o.order_id = b.order_id
      WHERE b.bill_status = 'paid'
        AND b.payment_datetime IS NOT NULL
        AND c.client_id NOT IN (
          SELECT DISTINCT o2.client_id
          FROM Orders o2
          JOIN Bills b2 ON o2.order_id = b2.order_id
          WHERE b2.bill_status = 'paid'
            AND b2.payment_datetime IS NOT NULL
            AND TIMESTAMPDIFF(HOUR, b2.created_at, b2.payment_datetime) > 24
        )
        AND c.client_id NOT IN (
          SELECT DISTINCT o3.client_id
          FROM Orders o3
          JOIN Bills b3 ON o3.order_id = b3.order_id
          WHERE b3.bill_status IN ('pending', 'disputed', 'revised')
            AND b3.payment_datetime IS NULL
        )
      GROUP BY c.client_id, c.first_name, c.last_name, c.email, c.phone_number
      HAVING total_bills_paid > 0
      ORDER BY total_bills_paid DESC, c.last_name ASC
    `);

    res.json(results);
  } catch (error) {
    console.error("Error fetching good clients:", error);
    res.status(500).json({ error: "Failed to fetch good clients" });
  }
});

module.exports = router;

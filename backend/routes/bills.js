const express = require('express');
const { authenticateToken, isAnna } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Anna generates a bill for completed order
router.post('/', authenticateToken, isAnna, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { order_id, amount } = req.body;

    // Check if order exists and is completed
    const [orders] = await connection.query(
      'SELECT * FROM Orders WHERE order_id = ? AND completion_status = ?',
      [order_id, 'completed']
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Order not found or not completed' });
    }

    // Check if bill already exists
    const [existingBills] = await connection.query(
      'SELECT * FROM Bills WHERE order_id = ?',
      [order_id]
    );

    if (existingBills.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Bill already exists for this order' });
    }

    // Create bill
    const [result] = await connection.query(
      'INSERT INTO Bills (order_id, amount) VALUES (?, ?)',
      [order_id, amount]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Bill generated successfully',
      bill_id: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error generating bill:', error);
    res.status(500).json({ error: 'Failed to generate bill' });
  } finally {
    connection.release();
  }
});

// Get all bills (Anna only)
router.get('/all', authenticateToken, isAnna, async (req, res) => {
  try {
    const [bills] = await db.query(
      `SELECT b.*, 
              o.order_id, o.final_price,
              c.first_name, c.last_name, c.email, c.phone_number,
              sr.service_address, sr.cleaning_type,
              DATEDIFF(NOW(), b.created_at) as days_since_generated
       FROM Bills b
       JOIN Orders o ON b.order_id = o.order_id
       JOIN Clients c ON o.client_id = c.client_id
       JOIN ServiceRequests sr ON o.request_id = sr.request_id
       ORDER BY b.created_at DESC`
    );

    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Get bills for current client
router.get('/my-bills', authenticateToken, async (req, res) => {
  try {
    const [bills] = await db.query(
      `SELECT b.*, 
              o.order_id, o.final_price,
              sr.service_address, sr.cleaning_type, sr.num_rooms,
              DATEDIFF(NOW(), b.created_at) as days_since_generated
       FROM Bills b
       JOIN Orders o ON b.order_id = o.order_id
       JOIN ServiceRequests sr ON o.request_id = sr.request_id
       WHERE o.client_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.client_id]
    );

    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Get specific bill with revision history
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [bills] = await db.query(
      `SELECT b.*, 
              o.order_id, o.client_id, o.final_price,
              c.first_name, c.last_name, c.email,
              sr.service_address, sr.cleaning_type, sr.num_rooms
       FROM Bills b
       JOIN Orders o ON b.order_id = o.order_id
       JOIN Clients c ON o.client_id = c.client_id
       JOIN ServiceRequests sr ON o.request_id = sr.request_id
       WHERE b.bill_id = ?`,
      [req.params.id]
    );

    if (bills.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = bills[0];

    // Check access rights
    if (req.user.email !== 'anna@cleaningservices.com' && bill.client_id !== req.user.client_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get revision history
    const [revisions] = await db.query(
      'SELECT * FROM BillRevisions WHERE bill_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    bill.revisions = revisions;

    res.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

// Client pays a bill
router.patch('/:id/pay', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get bill and verify ownership
    const [bills] = await connection.query(
      `SELECT b.*, o.client_id
       FROM Bills b
       JOIN Orders o ON b.order_id = o.order_id
       WHERE b.bill_id = ?`,
      [req.params.id]
    );

    if (bills.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = bills[0];

    if (bill.client_id !== req.user.client_id) {
      await connection.rollback();
      return res.status(403).json({ error: 'Access denied' });
    }

    if (bill.bill_status === 'paid') {
      await connection.rollback();
      return res.status(400).json({ error: 'Bill already paid' });
    }

    // Update bill as paid
    await connection.query(
      'UPDATE Bills SET bill_status = ?, payment_datetime = NOW() WHERE bill_id = ?',
      ['paid', req.params.id]
    );

    await connection.commit();

    res.json({ message: 'Bill paid successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error paying bill:', error);
    res.status(500).json({ error: 'Failed to pay bill' });
  } finally {
    connection.release();
  }
});

// Client disputes a bill
router.patch('/:id/dispute', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { dispute_note } = req.body;

    // Get bill and verify ownership
    const [bills] = await connection.query(
      `SELECT b.*, o.client_id
       FROM Bills b
       JOIN Orders o ON b.order_id = o.order_id
       WHERE b.bill_id = ?`,
      [req.params.id]
    );

    if (bills.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = bills[0];

    if (bill.client_id !== req.user.client_id) {
      await connection.rollback();
      return res.status(403).json({ error: 'Access denied' });
    }

    if (bill.bill_status === 'paid') {
      await connection.rollback();
      return res.status(400).json({ error: 'Cannot dispute paid bill' });
    }

    // Update bill as disputed
    await connection.query(
      'UPDATE Bills SET bill_status = ?, dispute_note = ? WHERE bill_id = ?',
      ['disputed', dispute_note, req.params.id]
    );

    // Record dispute in revisions
    await connection.query(
      'INSERT INTO BillRevisions (bill_id, revised_amount, revision_note, revised_by) VALUES (?, ?, ?, ?)',
      [req.params.id, bill.amount, dispute_note, 'client']
    );

    await connection.commit();

    res.json({ message: 'Bill disputed successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error disputing bill:', error);
    res.status(500).json({ error: 'Failed to dispute bill' });
  } finally {
    connection.release();
  }
});

// Anna revises a bill
router.patch('/:id/revise', authenticateToken, isAnna, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { revised_amount, revision_note } = req.body;

    const [bills] = await connection.query(
      'SELECT * FROM Bills WHERE bill_id = ?',
      [req.params.id]
    );

    if (bills.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Update bill
    await connection.query(
      'UPDATE Bills SET amount = ?, bill_status = ? WHERE bill_id = ?',
      [revised_amount, 'revised', req.params.id]
    );

    // Record revision
    await connection.query(
      'INSERT INTO BillRevisions (bill_id, revised_amount, revision_note, revised_by) VALUES (?, ?, ?, ?)',
      [req.params.id, revised_amount, revision_note, 'anna']
    );

    await connection.commit();

    res.json({ message: 'Bill revised successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error revising bill:', error);
    res.status(500).json({ error: 'Failed to revise bill' });
  } finally {
    connection.release();
  }
});

module.exports = router;

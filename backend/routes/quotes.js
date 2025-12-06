const express = require('express');
const { authenticateToken, isAnna } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Anna creates a quote or rejects request
router.post('/', authenticateToken, isAnna, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { request_id, action, quoted_price, scheduled_datetime, anna_notes } = req.body;

    // Check if request exists and is in valid state
    const [requests] = await connection.query(
      'SELECT * FROM ServiceRequests WHERE request_id = ?',
      [request_id]
    );

    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Request not found' });
    }

    if (action === 'reject') {
      // Reject the request
      await connection.query(
        'UPDATE ServiceRequests SET status = ? WHERE request_id = ?',
        ['rejected', request_id]
      );

      // Store rejection as a quote record
      await connection.query(
        `INSERT INTO Quotes (request_id, quoted_price, scheduled_datetime, anna_notes, client_response)
         VALUES (?, 0, NOW(), ?, 'rejected')`,
        [request_id, anna_notes || 'Request rejected']
      );

      await connection.commit();
      return res.json({ message: 'Request rejected successfully' });
    }

    // Create a quote
    const [result] = await connection.query(
      `INSERT INTO Quotes (request_id, quoted_price, scheduled_datetime, anna_notes)
       VALUES (?, ?, ?, ?)`,
      [request_id, quoted_price, scheduled_datetime, anna_notes]
    );

    // Update request status
    await connection.query(
      'UPDATE ServiceRequests SET status = ? WHERE request_id = ?',
      ['quoted', request_id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Quote created successfully',
      quote_id: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  } finally {
    connection.release();
  }
});

// Get quotes for a specific request
router.get('/request/:request_id', authenticateToken, async (req, res) => {
  try {
    const [quotes] = await db.query(
      `SELECT q.*, sr.client_id
       FROM Quotes q
       JOIN ServiceRequests sr ON q.request_id = sr.request_id
       WHERE q.request_id = ?
       ORDER BY q.created_at DESC`,
      [req.params.request_id]
    );

    if (quotes.length === 0) {
      return res.json([]);
    }

    // Check access rights
    if (req.user.email !== 'anna@cleaningservices.com' && quotes[0].client_id !== req.user.client_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Client responds to quote (accept or counter)
router.patch('/:quote_id/respond', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { response, counter_note } = req.body; // response: 'accepted' or 'countered'

    // Get quote and verify ownership
    const [quotes] = await connection.query(
      `SELECT q.*, sr.client_id, sr.request_id
       FROM Quotes q
       JOIN ServiceRequests sr ON q.request_id = sr.request_id
       WHERE q.quote_id = ?`,
      [req.params.quote_id]
    );

    if (quotes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Quote not found' });
    }

    const quote = quotes[0];

    if (quote.client_id !== req.user.client_id) {
      await connection.rollback();
      return res.status(403).json({ error: 'Access denied' });
    }

    if (response === 'accepted') {
      // Update quote as accepted
      await connection.query(
        'UPDATE Quotes SET client_response = ?, is_final_accepted = TRUE WHERE quote_id = ?',
        ['accepted', req.params.quote_id]
      );

      // Update request status
      await connection.query(
        'UPDATE ServiceRequests SET status = ? WHERE request_id = ?',
        ['accepted', quote.request_id]
      );

      // Create an order
      await connection.query(
        `INSERT INTO Orders (quote_id, request_id, client_id, final_price, scheduled_datetime)
         VALUES (?, ?, ?, ?, ?)`,
        [req.params.quote_id, quote.request_id, quote.client_id, quote.quoted_price, quote.scheduled_datetime]
      );

      await connection.commit();
      return res.json({ message: 'Quote accepted, order created' });
    }

    if (response === 'countered') {
      // Update quote with counter
      await connection.query(
        'UPDATE Quotes SET client_response = ?, client_counter_note = ? WHERE quote_id = ?',
        ['countered', counter_note, req.params.quote_id]
      );

      // Update request status to negotiating
      await connection.query(
        'UPDATE ServiceRequests SET status = ? WHERE request_id = ?',
        ['negotiating', quote.request_id]
      );

      await connection.commit();
      return res.json({ message: 'Counter offer submitted' });
    }

    await connection.rollback();
    res.status(400).json({ error: 'Invalid response type' });
  } catch (error) {
    await connection.rollback();
    console.error('Error responding to quote:', error);
    res.status(500).json({ error: 'Failed to respond to quote' });
  } finally {
    connection.release();
  }
});

module.exports = router;

import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// GET /api/bills - Fetch all bills
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const bills = await db.getBills(userId);
    res.json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bills - Create new bill
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const { name, amount, due_date } = req.body;

    if (!name || amount === undefined || !due_date) {
      return res.status(400).json({ success: false, error: 'Name, amount, and due date are required.' });
    }

    const bill = await db.createBill(req.body, userId);
    res.status(201).json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/bills/:id - Update existing bill
router.put('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const updated = await db.updateBill(req.params.id, req.body, userId);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/bills/:id - Delete bill
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    await db.deleteBill(req.params.id, userId);
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bills/:id/pay - Mark bill as paid & handle recurring occurrence
router.post('/:id/pay', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const result = await db.payBill(req.params.id, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

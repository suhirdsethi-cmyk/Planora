import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// GET /api/reminders - Fetch all reminders
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const reminders = await db.getReminders(userId);
    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reminders - Create reminder
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const { title, reminder_date } = req.body;

    if (!title || !reminder_date) {
      return res.status(400).json({ success: false, error: 'Title and reminder date are required.' });
    }

    const reminder = await db.createReminder(req.body, userId);
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/reminders/:id - Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    await db.deleteReminder(req.params.id, userId);
    res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

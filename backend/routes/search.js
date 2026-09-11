import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// GET /api/search?q=query
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const query = (req.query.q || '').trim().toLowerCase();

    if (!query) {
      return res.json({ success: true, data: { bills: [], tasks: [], checklists: [], reminders: [] } });
    }

    const [bills, checklists, tasks, reminders] = await Promise.all([
      db.getBills(userId),
      db.getChecklists(userId),
      db.getTasks(userId),
      db.getReminders(userId)
    ]);

    const matchingBills = bills.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query) ||
        (b.notes && b.notes.toLowerCase().includes(query))
    );

    const matchingTasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        t.category.toLowerCase().includes(query)
    );

    const matchingChecklists = checklists.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query)) ||
        (c.items && c.items.some((i) => i.title.toLowerCase().includes(query)))
    );

    const matchingReminders = reminders.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        (r.notes && r.notes.toLowerCase().includes(query))
    );

    res.json({
      success: true,
      query,
      data: {
        bills: matchingBills,
        tasks: matchingTasks,
        checklists: matchingChecklists,
        reminders: matchingReminders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

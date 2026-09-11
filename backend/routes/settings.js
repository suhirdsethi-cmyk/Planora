import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// GET /api/settings - Fetch user settings
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const settings = await db.getSettings(userId);
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/settings - Update settings
router.put('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const settings = await db.updateSettings(req.body, userId);
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/settings/reset-demo - Reset demo dataset
router.post('/reset-demo', async (req, res) => {
  try {
    const result = await db.resetDemoData();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

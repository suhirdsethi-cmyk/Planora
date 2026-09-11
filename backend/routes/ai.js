import express from 'express';
import { aiService } from '../services/aiService.js';

const router = express.Router();

// POST /api/ai/parse-natural - Parse user text like "I pay ₹825 for Wi-Fi every month on the 15th"
router.post('/parse-natural', (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, error: 'Input text is required.' });
    }

    const parsed = aiService.parseInput(input);
    res.json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

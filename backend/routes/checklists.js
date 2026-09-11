import express from 'express';
import { db } from '../services/dbService.js';
import { aiService } from '../services/aiService.js';

const router = express.Router();

// GET /api/checklists - Get all checklists with items
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const lists = await db.getChecklists(userId);
    res.json({ success: true, data: lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/checklists - Create new manual checklist
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const { title, items, description, category, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Checklist title is required.' });
    }

    const checklist = await db.createChecklist(
      { title, description, category, deadline },
      items || [],
      userId
    );
    res.status(201).json({ success: true, data: checklist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/checklists/ai-generate - Generate checklist using AI prompt
router.post('/ai-generate', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required for AI generation.' });
    }

    // Call AI Service
    const aiResult = await aiService.generateChecklist(prompt);

    // Flatten items with categories
    const items = [];
    if (aiResult.categories && Array.isArray(aiResult.categories)) {
      aiResult.categories.forEach((cat) => {
        cat.items.forEach((itemTitle) => {
          items.push({
            category: cat.name,
            title: itemTitle,
            is_completed: false
          });
        });
      });
    }

    // Save to Database
    const createdChecklist = await db.createChecklist(
      {
        title: aiResult.title || prompt,
        description: aiResult.description || `AI generated checklist for "${prompt}"`,
        category: aiResult.category || 'AI General',
        is_ai_generated: true
      },
      items,
      userId
    );

    res.status(201).json({
      success: true,
      data: createdChecklist,
      rawAi: aiResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/checklists/items/:itemId/toggle - Toggle item completion
router.put('/items/:itemId/toggle', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const { is_completed } = req.body;
    const updatedItem = await db.toggleChecklistItem(req.params.itemId, is_completed, userId);
    res.json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/checklists/:id/items - Add item to existing checklist
router.post('/:id/items', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const { title, category } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Item title required' });

    const newItem = await db.addChecklistItem(req.params.id, title, category || 'General', userId);
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/checklists/items/:itemId - Delete item
router.delete('/items/:itemId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    await db.deleteChecklistItem(req.params.itemId, userId);
    res.json({ success: true, message: 'Checklist item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/checklists/:id - Delete checklist
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    await db.deleteChecklist(req.params.id, userId);
    res.json({ success: true, message: 'Checklist deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

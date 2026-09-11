import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// GET /api/tasks - Fetch all tasks
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const tasks = await db.getTasks(userId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tasks - Create task
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    const task = await db.createTask(req.body, userId);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/tasks/:id/toggle - Toggle task completion
router.put('/:id/toggle', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    const { is_completed } = req.body;
    const updated = await db.toggleTask(req.params.id, is_completed, userId);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';
    await db.deleteTask(req.params.id, userId);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

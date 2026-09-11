import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import billsRouter from './routes/bills.js';
import checklistsRouter from './routes/checklists.js';
import tasksRouter from './routes/tasks.js';
import remindersRouter from './routes/reminders.js';
import dashboardRouter from './routes/dashboard.js';
import searchRouter from './routes/search.js';
import aiRouter from './routes/ai.js';
import settingsRouter from './routes/settings.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Planora Backend API',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/bills', billsRouter);
app.use('/api/checklists', checklistsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/search', searchRouter);
app.use('/api/ai', aiRouter);
app.use('/api/settings', settingsRouter);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Planora Backend Server running at http://localhost:${PORT}`);
});

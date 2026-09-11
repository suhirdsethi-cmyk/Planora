import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// GET /api/dashboard - Aggregated stats and Today's unified timeline
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'demo-user-123';

    const [bills, checklists, tasks, reminders] = await Promise.all([
      db.getBills(userId),
      db.getChecklists(userId),
      db.getTasks(userId),
      db.getReminders(userId)
    ]);

    const todayStr = new Date().toISOString().split('T')[0];

    // Filter Today's items
    const todayBills = bills.filter((b) => b.due_date === todayStr || b.status === 'due_today' || b.status === 'overdue');

    const todayTasks = tasks.filter((t) => !t.is_completed && (t.due_date === todayStr || (t.due_date && t.due_date <= todayStr)));

    const todayReminders = reminders.filter((r) => r.reminder_date === todayStr && !r.is_dismissed);

    const activeChecklists = checklists
      .filter((c) => !c.is_archived)
      .map((c) => {
        const total = (c.items || []).length;
        const completed = (c.items || []).filter((i) => i.is_completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          ...c,
          total_items: total,
          completed_items: completed,
          progress_percentage: percentage
        };
      });

    // Upcoming timeline (Next 30 days)
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const maxDateStr = thirtyDaysLater.toISOString().split('T')[0];

    const upcomingBills = bills.filter((b) => b.due_date > todayStr && b.due_date <= maxDateStr && b.status !== 'paid');
    const upcomingTasks = tasks.filter((t) => !t.is_completed && t.due_date > todayStr && t.due_date <= maxDateStr);
    const upcomingReminders = reminders.filter((r) => r.reminder_date > todayStr && r.reminder_date <= maxDateStr);

    // Calculate Summary Stats
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthBills = bills.filter((b) => b.due_date.startsWith(currentMonthPrefix));
    const totalBillsThisMonthAmount = thisMonthBills.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
    const upcomingPaymentsCount = bills.filter((b) => b.status === 'upcoming' || b.status === 'due_today').length;
    const completedTasksCount = tasks.filter((t) => t.is_completed).length;

    res.json({
      success: true,
      data: {
        today: {
          bills: todayBills,
          tasks: todayTasks,
          reminders: todayReminders,
          checklists: activeChecklists.slice(0, 3)
        },
        upcoming: {
          bills: upcomingBills,
          tasks: upcomingTasks,
          reminders: upcomingReminders
        },
        stats: {
          total_bills_this_month: totalBillsThisMonthAmount,
          upcoming_payments_count: upcomingPaymentsCount,
          completed_tasks_count: completedTasksCount,
          active_checklists_count: activeChecklists.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

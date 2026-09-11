import React from 'react';
import { 
  CreditCard, 
  CheckSquare, 
  ClipboardList, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function SmartToday({ todayData, upcomingData, onNavigate, onRefresh }) {
  const { formatAmount, showToast, openQuickCreate, openAIChecklist } = useApp();

  const handlePayBill = async (billId) => {
    try {
      await api.payBill(billId);
      showToast('Bill marked as paid! Next occurrence scheduled.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      await api.toggleTask(taskId, !currentStatus);
      showToast(!currentStatus ? 'Task completed!' : 'Task uncompleted', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleItem = async (itemId, currentStatus) => {
    try {
      await api.toggleChecklistItem(itemId, !currentStatus);
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const bills = todayData?.bills || [];
  const tasks = todayData?.tasks || [];
  const reminders = todayData?.reminders || [];
  const checklists = todayData?.checklists || [];

  const hasItemsToday = bills.length > 0 || tasks.length > 0 || reminders.length > 0 || checklists.length > 0;

  return (
    <div className="space-y-8">
      {/* TODAY SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">TODAY</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Everything requiring your attention</span>
        </div>

        {!hasItemsToday ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">You're all caught up for today! 🎉</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No urgent bills or tasks due right now. Enjoy your day or add new items to stay ahead.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={openQuickCreate}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
              >
                + Add Item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bills Due Today / Overdue */}
            {bills.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-red-500" />
                    <h3 className="font-bold text-slate-900 text-sm">💰 Payments & Bills</h3>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                    {bills.length} Action Needed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {bills.map((bill) => (
                    <div
                      key={bill.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                          🔴
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-snug">{bill.name}</p>
                          <p className="text-xs font-bold text-red-600">{formatAmount(bill.amount)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                          {bill.status === 'overdue' ? 'Overdue' : 'Due Today'}
                        </span>
                        <button
                          onClick={() => handlePayBill(bill.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Due Today */}
            {tasks.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-brand-600" />
                    <h3 className="font-bold text-slate-900 text-sm">✅ Today's Tasks</h3>
                  </div>
                  <button onClick={() => onNavigate('tasks')} className="text-xs text-brand-600 font-semibold hover:underline">
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.is_completed)}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center space-x-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-slate-900 truncate ${task.is_completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-slate-400 truncate">{task.description}</p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'medium'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Checklists */}
            {checklists.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="w-4 h-4 text-purple-600" />
                    <h3 className="font-bold text-slate-900 text-sm">📋 Active Checklists</h3>
                  </div>
                  <button onClick={() => onNavigate('checklists')} className="text-xs text-brand-600 font-semibold hover:underline">
                    Manage Lists
                  </button>
                </div>

                <div className="space-y-4">
                  {checklists.map((list) => (
                    <div key={list.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{list.title}</h4>
                        <span className="text-xs font-semibold text-purple-600">
                          {list.completed_items} / {list.total_items} completed ({list.progress_percentage}%)
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${list.progress_percentage}%` }}
                        ></div>
                      </div>

                      {/* Top Checklist items preview */}
                      <div className="space-y-1.5 pt-1">
                        {(list.items || []).slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleToggleItem(item.id, item.is_completed)}
                            className="flex items-center space-x-2.5 text-xs cursor-pointer hover:text-slate-900"
                          >
                            <input
                              type="checkbox"
                              checked={item.is_completed}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className={item.is_completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reminders Due Today */}
            {reminders.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <h3 className="font-bold text-slate-900 text-sm">🔔 Reminders</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {reminders.map((rem) => (
                    <div key={rem.id} className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{rem.title}</p>
                          {rem.notes && <p className="text-xs text-slate-500">{rem.notes}</p>}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-orange-700 bg-white px-2 py-1 rounded-lg border border-orange-200">
                        {rem.reminder_time || '09:00'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* UPCOMING TIMELINE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">UPCOMING (Next 7–30 Days)</h2>
          <button onClick={() => onNavigate('calendar')} className="text-xs text-brand-600 font-semibold hover:underline flex items-center space-x-1">
            <span>View Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle divide-y divide-slate-100">
          {(upcomingData?.bills || []).length === 0 && (upcomingData?.tasks || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No upcoming bills or tasks scheduled for the next 30 days.</p>
          ) : (
            <>
              {(upcomingData?.bills || []).map((bill) => (
                <div key={bill.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-semibold text-xs">
                      💰
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{bill.name}</p>
                      <p className="text-xs text-slate-400">Due {bill.due_date} ({bill.category})</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{formatAmount(bill.amount)}</span>
                </div>
              ))}

              {(upcomingData?.tasks || []).map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-semibold text-xs">
                      ✅
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-400">Due {task.due_date}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    {task.priority}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* QUICK CREATE BUTTONS BAR */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={openQuickCreate}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 shadow-subtle hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Bill</span>
          </button>

          <button
            onClick={openAIChecklist}
            className="p-4 rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-200/80 hover:border-purple-300 shadow-subtle hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-900">✨ Create with AI</span>
          </button>

          <button
            onClick={openQuickCreate}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-subtle hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Task</span>
          </button>

          <button
            onClick={openQuickCreate}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-orange-300 shadow-subtle hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Reminder</span>
          </button>
        </div>
      </section>
    </div>
  );
}

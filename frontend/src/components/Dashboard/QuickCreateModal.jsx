import React, { useState } from 'react';
import { Sparkles, CreditCard, CheckSquare, Bell, ClipboardList, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function QuickCreateModal({ isOpen, onClose, onRefresh }) {
  const { showToast, currencySymbol } = useApp();
  const [mode, setMode] = useState('natural'); // 'natural' | 'bill' | 'task' | 'reminder' | 'checklist'
  const [naturalInput, setNaturalInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Bill Form State
  const [billForm, setBillForm] = useState({
    name: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    category: 'Electricity bill',
    is_recurring: true,
    recurrence_frequency: 'monthly',
    payment_method: 'UPI / Card',
    notes: ''
  });

  // Task Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    category: 'General'
  });

  // Reminder Form State
  const [reminderForm, setReminderForm] = useState({
    title: '',
    reminder_date: new Date().toISOString().split('T')[0],
    reminder_time: '09:00',
    repeat_frequency: 'none',
    notes: ''
  });

  // Checklist Form State
  const [checklistForm, setChecklistForm] = useState({
    title: '',
    description: '',
    category: 'Travel',
    rawItems: ''
  });

  if (!isOpen) return null;

  const handleNaturalSubmit = async (e) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;

    setLoading(true);
    try {
      const res = await api.parseNaturalPrompt(naturalInput);
      const parsed = res.data;

      if (parsed.type === 'bill') {
        await api.createBill(parsed.data);
        showToast(`Created Bill: ${parsed.data.name} (${currencySymbol}${parsed.data.amount})`, 'success');
      } else if (parsed.type === 'task') {
        await api.createTask(parsed.data);
        showToast(`Created Task: ${parsed.data.title}`, 'success');
      } else if (parsed.type === 'reminder') {
        await api.createReminder(parsed.data);
        showToast(`Created Reminder: ${parsed.data.title}`, 'success');
      } else {
        // Generates checklist
        const aiRes = await api.generateAIChecklist(naturalInput);
        showToast(`Generated AI Checklist: "${aiRes.data.title}"`, 'success');
      }

      setNaturalInput('');
      onRefresh();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to parse prompt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createBill({
        ...billForm,
        amount: parseFloat(billForm.amount)
      });
      showToast(`Bill "${billForm.name}" created!`, 'success');
      onRefresh();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createTask(taskForm);
      showToast(`Task "${taskForm.title}" added!`, 'success');
      onRefresh();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createReminder(reminderForm);
      showToast(`Reminder "${reminderForm.title}" set!`, 'success');
      onRefresh();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChecklist = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = checklistForm.rawItems
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean)
        .map((title) => ({ title, category: 'General' }));

      await api.createChecklist({
        title: checklistForm.title,
        description: checklistForm.description,
        category: checklistForm.category,
        items
      });
      showToast(`Checklist "${checklistForm.title}" created!`, 'success');
      onRefresh();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Quick Create</h3>
            <p className="text-xs text-slate-400">Tell Planora what to organize or add manually</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 flex space-x-1 border-b border-slate-100 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setMode('natural')}
            className={`px-3 py-2 rounded-t-xl border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              mode === 'natural'
                ? 'border-purple-600 text-purple-700 bg-purple-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>✨ Smart AI Assistant</span>
          </button>

          <button
            onClick={() => setMode('bill')}
            className={`px-3 py-2 rounded-t-xl border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              mode === 'bill'
                ? 'border-brand-600 text-brand-600 bg-brand-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Bill</span>
          </button>

          <button
            onClick={() => setMode('task')}
            className={`px-3 py-2 rounded-t-xl border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              mode === 'task'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>

          <button
            onClick={() => setMode('reminder')}
            className={`px-3 py-2 rounded-t-xl border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              mode === 'reminder'
                ? 'border-orange-600 text-orange-600 bg-orange-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Reminder</span>
          </button>

          <button
            onClick={() => setMode('checklist')}
            className={`px-3 py-2 rounded-t-xl border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              mode === 'checklist'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Checklist</span>
          </button>
        </div>

        {/* Modal Body Forms */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Mode 1: Natural Language AI Assistant */}
          {mode === 'natural' && (
            <form onSubmit={handleNaturalSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 space-y-3">
                <label className="block text-xs font-bold text-purple-900">
                  ✨ Tell Planora what you need to do:
                </label>
                <textarea
                  rows={3}
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  placeholder='e.g. "I pay ₹825 for Wi-Fi every month on the 15th" or "I am going to Shimla for 3 days with my family"'
                  className="w-full p-3 rounded-xl border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
                ></textarea>
                <div className="flex items-center justify-between text-[11px] text-purple-700">
                  <span>Supports bills, tasks, reminders & checklists</span>
                  <button
                    type="submit"
                    disabled={loading || !naturalInput.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
                  >
                    <span>{loading ? 'Processing...' : 'Organize'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Try typing prompts like:</p>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  <li>"I pay 15000 for Rent every month on 1st"</li>
                  <li>"Remind me to renew car insurance tomorrow"</li>
                  <li>"I'm going to the gym"</li>
                </ul>
              </div>
            </form>
          )}

          {/* Mode 2: Bill Form */}
          {mode === 'bill' && (
            <form onSubmit={handleCreateBill} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wi-Fi Broadband"
                  value={billForm.name}
                  onChange={(e) => setBillForm({ ...billForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    step="any"
                    placeholder="825"
                    value={billForm.amount}
                    onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={billForm.due_date}
                    onChange={(e) => setBillForm({ ...billForm, due_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={billForm.category}
                    onChange={(e) => setBillForm({ ...billForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
                  >
                    <option value="Electricity bill">Electricity bill</option>
                    <option value="Wi-Fi">Wi-Fi Broadband</option>
                    <option value="Mobile recharge">Mobile recharge</option>
                    <option value="Credit card">Credit card</option>
                    <option value="Rent">House Rent</option>
                    <option value="Subscription">Subscription</option>
                    <option value="EMI">EMI</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Custom">Custom bill</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recurrence</label>
                  <select
                    value={billForm.recurrence_frequency}
                    onChange={(e) => setBillForm({ ...billForm, recurrence_frequency: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
                  >
                    <option value="monthly">Every Month</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="none">One-time</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors mt-2"
              >
                {loading ? 'Adding Bill...' : 'Add Bill'}
              </button>
            </form>
          )}

          {/* Mode 3: Task Form */}
          {mode === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buy medicines from pharmacy"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟠 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors mt-2"
              >
                {loading ? 'Adding Task...' : 'Add Task'}
              </button>
            </form>
          )}

          {/* Mode 4: Reminder Form */}
          {mode === 'reminder' && (
            <form onSubmit={handleCreateReminder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Renew car insurance"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={reminderForm.reminder_date}
                    onChange={(e) => setReminderForm({ ...reminderForm, reminder_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={reminderForm.reminder_time}
                    onChange={(e) => setReminderForm({ ...reminderForm, reminder_time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors mt-2"
              >
                {loading ? 'Setting Reminder...' : 'Set Reminder'}
              </button>
            </form>
          )}

          {/* Mode 5: Manual Checklist Form */}
          {mode === 'checklist' && (
            <form onSubmit={handleCreateChecklist} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Checklist Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend House Cleaning"
                  value={checklistForm.title}
                  onChange={(e) => setChecklistForm({ ...checklistForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Checklist Items (One per line)</label>
                <textarea
                  rows={4}
                  placeholder={`Clothes\nJacket\nCharger\nMedicines`}
                  value={checklistForm.rawItems}
                  onChange={(e) => setChecklistForm({ ...checklistForm, rawItems: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors mt-2"
              >
                {loading ? 'Creating Checklist...' : 'Create Checklist'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

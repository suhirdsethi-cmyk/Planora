import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Clock, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function TasksView({ tasks = [], onRefresh }) {
  const { showToast, openQuickCreate } = useApp();
  const [filter, setFilter] = useState('all'); // 'all' | 'today' | 'upcoming' | 'high' | 'completed'

  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggleTask = async (id, currentStatus) => {
    try {
      await api.toggleTask(id, !currentStatus);
      showToast(!currentStatus ? 'Task completed!' : 'Task reopened', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id);
      showToast('Task deleted.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'today') return !task.is_completed && task.due_date === todayStr;
    if (filter === 'upcoming') return !task.is_completed && task.due_date > todayStr;
    if (filter === 'high') return task.priority === 'high';
    if (filter === 'completed') return task.is_completed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            ✅
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Tasks & Priorities</h2>
            <p className="text-xs text-slate-400 font-medium">Keep track of daily to-dos and priorities</p>
          </div>
        </div>

        <button
          onClick={openQuickCreate}
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-white p-3 rounded-2xl border border-slate-200/80 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'today', label: 'Due Today' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'high', label: '🔴 High Priority' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              filter === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No tasks in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create tasks to keep your schedule organized and complete goals on time.
          </p>
          <button
            onClick={openQuickCreate}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-2xs mt-2"
          >
            + Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between transition-all hover:shadow-md ${
                task.is_completed ? 'opacity-60 bg-slate-50/70' : ''
              }`}
            >
              <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={task.is_completed}
                  onChange={() => handleToggleTask(task.id, task.is_completed)}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm text-slate-900 ${task.is_completed ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
                  )}
                  {task.due_date && (
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Due {task.due_date}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 ml-3">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    task.priority === 'high'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : task.priority === 'medium'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟠 Medium' : '🟢 Low'}
                </span>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

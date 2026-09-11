import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  CreditCard, 
  CheckSquare, 
  ClipboardList, 
  Bell,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BillCalendar({ bills = [], tasks = [], checklists = [], reminders = [], onRefresh }) {
  const { formatAmount, openQuickCreate } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format date YYYY-MM-DD
  const formatDateKey = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Map events to date keys
  const getEventsForDate = (dateKey) => {
    const dayBills = bills.filter((b) => b.due_date === dateKey);
    const dayTasks = tasks.filter((t) => t.due_date === dateKey);
    const dayLists = checklists.filter((c) => c.deadline === dateKey);
    const dayReminders = reminders.filter((r) => r.reminder_date === dateKey);

    return {
      bills: dayBills,
      tasks: dayTasks,
      checklists: dayLists,
      reminders: dayReminders,
      totalCount: dayBills.length + dayTasks.length + dayLists.length + dayReminders.length
    };
  };

  // Generate Month Grid cells
  const calendarCells = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatDateKey(year, month, d);
    calendarCells.push({ dayNumber: d, dateKey });
  }

  const todayKey = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-400 font-medium">Bill & Payment Calendar</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Week
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              Today
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarCells.map((cell, index) => {
          if (!cell) {
            return (
              <div key={index} className="min-h-[90px] sm:min-h-[110px] p-2 rounded-2xl bg-slate-50/50 border border-transparent"></div>
            );
          }

          const { dayNumber, dateKey } = cell;
          const events = getEventsForDate(dateKey);
          const isToday = dateKey === todayKey;

          return (
            <div
              key={dateKey}
              onClick={() => setSelectedDateEvents({ dateKey, dayNumber, events })}
              className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md hover:border-brand-300 ${
                isToday
                  ? 'bg-brand-50/50 border-brand-300 font-bold'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-brand-600 text-white shadow-2xs' : 'text-slate-700'
                  }`}
                >
                  {dayNumber}
                </span>

                {events.totalCount > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                    {events.totalCount}
                  </span>
                )}
              </div>

              {/* Event Markers Badges */}
              <div className="space-y-1 mt-1 overflow-hidden">
                {events.bills.slice(0, 2).map((bill) => (
                  <div
                    key={bill.id}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold truncate flex items-center justify-between ${
                      bill.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : bill.due_date === todayKey
                        ? 'bg-red-50 text-red-700 border border-red-200/60'
                        : 'bg-orange-50 text-orange-700 border border-orange-200/60'
                    }`}
                  >
                    <span className="truncate">💰 {bill.name}</span>
                  </div>
                ))}

                {events.tasks.slice(0, 1).map((task) => (
                  <div
                    key={task.id}
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-50 text-blue-700 border border-blue-200/60 truncate"
                  >
                    ✅ {task.title}
                  </div>
                ))}

                {events.reminders.slice(0, 1).map((rem) => (
                  <div
                    key={rem.id}
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-50 text-purple-700 border border-purple-200/60 truncate"
                  >
                    🔔 {rem.title}
                  </div>
                ))}

                {events.totalCount > 3 && (
                  <p className="text-[9px] text-slate-400 font-medium text-center">
                    +{events.totalCount - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Date Details Drawer / Modal */}
      {selectedDateEvents && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Events for {monthNames[month]} {selectedDateEvents.dayNumber}, {year}
                </h3>
                <p className="text-xs text-slate-400">Date breakdown</p>
              </div>
              <button
                onClick={() => setSelectedDateEvents(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedDateEvents.events.totalCount === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No events scheduled for this day.</p>
              ) : (
                <>
                  {/* Bills on Date */}
                  {selectedDateEvents.events.bills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">💰 Bills</h4>
                      {selectedDateEvents.events.bills.map((bill) => (
                        <div
                          key={bill.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{bill.name}</p>
                            <p className="text-xs text-slate-500">{bill.category}</p>
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{formatAmount(bill.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tasks on Date */}
                  {selectedDateEvents.events.tasks.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">✅ Tasks</h4>
                      {selectedDateEvents.events.tasks.map((task) => (
                        <div key={task.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                          <p className="font-semibold text-slate-900 text-sm">{task.title}</p>
                          {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reminders on Date */}
                  {selectedDateEvents.events.reminders.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">🔔 Reminders</h4>
                      {selectedDateEvents.events.reminders.map((rem) => (
                        <div key={rem.id} className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/60">
                          <p className="font-semibold text-slate-900 text-sm">{rem.title}</p>
                          <p className="text-xs text-orange-700 font-medium">{rem.reminder_time}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedDateEvents(null);
                  openQuickCreate();
                }}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item to this Date</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

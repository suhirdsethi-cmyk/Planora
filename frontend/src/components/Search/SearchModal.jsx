import React, { useState, useEffect } from 'react';
import { Search, X, CreditCard, CheckSquare, ClipboardList, Bell, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function SearchModal({ isOpen, onClose, onSelectResult }) {
  const { formatAmount } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ bills: [], tasks: [], checklists: [], reminders: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ bills: [], tasks: [], checklists: [], reminders: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query);
        setResults(res.data || { bills: [], tasks: [], checklists: [], reminders: [] });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.bills.length + results.tasks.length + results.checklists.length + results.reminders.length;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bills (e.g. Wi-Fi), tasks, checklists, reminders..."
            className="w-full bg-transparent text-sm sm:text-base font-medium focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1">
            Esc
          </button>
        </div>

        {/* Search Results Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-1">
              <p>Type to search across everything in Planora</p>
              <p className="text-[11px] text-slate-400">Try searching for "Wi-Fi", "Medicines", or "Shimla"</p>
            </div>
          ) : loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Searching...</div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching bills, tasks, checklists, or reminders found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bills Results */}
              {results.bills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">💰 Bills</h4>
                  <div className="space-y-1.5">
                    {results.bills.map((bill) => (
                      <div
                        key={bill.id}
                        onClick={() => { onSelectResult('bills'); onClose(); }}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-4 h-4 text-brand-600" />
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{bill.name}</p>
                            <p className="text-xs text-slate-400">Due {bill.due_date} • {bill.category}</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{formatAmount(bill.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Results */}
              {results.tasks.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">✅ Tasks</h4>
                  <div className="space-y-1.5">
                    {results.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => { onSelectResult('tasks'); onClose(); }}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                          <p className="font-semibold text-slate-900 text-sm">{task.title}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklists Results */}
              {results.checklists.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">📋 Checklists</h4>
                  <div className="space-y-1.5">
                    {results.checklists.map((list) => (
                      <div
                        key={list.id}
                        onClick={() => { onSelectResult('checklists'); onClose(); }}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <ClipboardList className="w-4 h-4 text-purple-600" />
                          <p className="font-semibold text-slate-900 text-sm">{list.title}</p>
                        </div>
                        <span className="text-xs text-purple-600 font-semibold">
                          {(list.items || []).length} items
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminders Results */}
              {results.reminders.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">🔔 Reminders</h4>
                  <div className="space-y-1.5">
                    {results.reminders.map((rem) => (
                      <div
                        key={rem.id}
                        onClick={() => { onSelectResult('reminders'); onClose(); }}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <Bell className="w-4 h-4 text-orange-600" />
                          <p className="font-semibold text-slate-900 text-sm">{rem.title}</p>
                        </div>
                        <span className="text-xs text-orange-600 font-medium">{rem.reminder_date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  ClipboardList, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Folder
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function ChecklistsView({ checklists = [], onRefresh }) {
  const { showToast, openAIChecklist, openQuickCreate } = useApp();
  const [selectedListId, setSelectedListId] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');

  const activeChecklist = checklists.find((c) => c.id === selectedListId) || checklists[0];

  const handleToggleItem = async (itemId, currentStatus) => {
    try {
      await api.toggleChecklistItem(itemId, !currentStatus);
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !activeChecklist) return;

    try {
      await api.addChecklistItem(activeChecklist.id, newItemTitle, selectedCategory);
      setNewItemTitle('');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.deleteChecklistItem(itemId);
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteChecklist = async (id) => {
    if (!window.confirm('Delete this checklist and all its items?')) return;
    try {
      await api.deleteChecklist(id);
      showToast('Checklist deleted.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Group items by category
  const getGroupedItems = (items = []) => {
    const groups = {};
    items.forEach((item) => {
      const cat = item.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            📋
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Smart Checklists</h2>
            <p className="text-xs text-slate-400 font-medium">Plan trips, moving, workouts & events</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={openAIChecklist}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>✨ Create with AI</span>
          </button>

          <button
            onClick={openQuickCreate}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            + Manual List
          </button>
        </div>
      </div>

      {checklists.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Nothing planned yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tell us what you're planning and Planora will build your customized checklist.
          </p>
          <button
            onClick={openAIChecklist}
            className="px-5 py-2.5 bg-purple-600 text-white font-semibold text-xs rounded-xl shadow-2xs mt-2 inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>✨ Create with AI</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List Selector Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Your Lists</h3>
            <div className="space-y-2">
              {checklists.map((list) => {
                const total = (list.items || []).length;
                const completed = (list.items || []).filter((i) => i.is_completed).length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const isSelected = activeChecklist?.id === list.id;

                return (
                  <div
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-300 shadow-2xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{list.title}</h4>
                      {list.is_ai_generated && (
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{completed} / {total} items ({pct}%)</span>
                    </div>

                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Checklist Detail & Items */}
          {activeChecklist && (
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-6">
              {/* Checklist Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-900 text-xl">{activeChecklist.title}</h3>
                    {activeChecklist.is_ai_generated && (
                      <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">
                        ✨ AI Generated
                      </span>
                    )}
                  </div>
                  {activeChecklist.description && (
                    <p className="text-xs text-slate-400 mt-1">{activeChecklist.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteChecklist(activeChecklist.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                  title="Delete Checklist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Summary */}
              {(() => {
                const total = (activeChecklist.items || []).length;
                const completed = (activeChecklist.items || []).filter((i) => i.is_completed).length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                      <span>Progress Status</span>
                      <span>{completed} / {total} items completed ({pct}%)</span>
                    </div>
                    <div className="w-full bg-purple-200/60 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })()}

              {/* Add New Item Form */}
              <form onSubmit={handleAddItem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new checklist item..."
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
                >
                  <option value="🧳 Packing">🧳 Packing</option>
                  <option value="📄 Documents">📄 Documents</option>
                  <option value="🔌 Electronics">🔌 Electronics</option>
                  <option value="💊 Personal">💊 Personal</option>
                  <option value="🚗 Vehicle">🚗 Vehicle</option>
                  <option value="General">General</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
                >
                  Add
                </button>
              </form>

              {/* Categorized Checklist Items Grouping */}
              <div className="space-y-6">
                {Object.entries(getGroupedItems(activeChecklist.items)).map(([catName, catItems]) => (
                  <div key={catName} className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center justify-between">
                      <span>{catName}</span>
                      <span className="text-slate-400 font-normal">
                        ({catItems.filter((i) => i.is_completed).length}/{catItems.length})
                      </span>
                    </h4>

                    <div className="space-y-1.5">
                      {catItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between hover:bg-slate-100/70 transition-colors group"
                        >
                          <label className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={item.is_completed}
                              onChange={() => handleToggleItem(item.id, item.is_completed)}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className={`text-sm font-medium ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {item.title}
                            </span>
                          </label>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

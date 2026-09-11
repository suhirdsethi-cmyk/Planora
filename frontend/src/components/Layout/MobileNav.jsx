import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  CreditCard, 
  ClipboardList, 
  MoreHorizontal, 
  Plus, 
  CheckSquare, 
  Bell, 
  Settings,
  Sparkles,
  X,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MobileNav({ activeTab, setActiveTab }) {
  const { openQuickCreate, openAIChecklist, openSearch } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'bills', label: 'Bills', icon: CreditCard },
    { id: 'checklists', label: 'Lists', icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile More Slide-Up Action Sheet */}
      {isMoreOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 lg:hidden flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 space-y-5 animate-fade-in border-t border-slate-200 shadow-2xl">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                  P
                </div>
                <h3 className="font-bold text-slate-900 text-base">Planora Menu</h3>
              </div>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of Navigation Items */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { setActiveTab('tasks'); setIsMoreOpen(false); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80 active:scale-95 transition-transform"
              >
                <CheckSquare className="w-6 h-6 text-brand-600 mb-1.5" />
                <span className="text-xs font-semibold text-slate-800">Tasks</span>
              </button>

              <button
                onClick={() => { setActiveTab('reminders'); setIsMoreOpen(false); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80 active:scale-95 transition-transform"
              >
                <Bell className="w-6 h-6 text-orange-500 mb-1.5" />
                <span className="text-xs font-semibold text-slate-800">Reminders</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setIsMoreOpen(false); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80 active:scale-95 transition-transform"
              >
                <Settings className="w-6 h-6 text-slate-600 mb-1.5" />
                <span className="text-xs font-semibold text-slate-800">Settings</span>
              </button>
            </div>

            {/* Search Trigger */}
            <button
              onClick={() => { openSearch(); setIsMoreOpen(false); }}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200/70 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 border border-slate-200"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Search Bills, Tasks & Checklists</span>
            </button>

            {/* AI Generator Button */}
            <button
              onClick={() => { openAIChecklist(); setIsMoreOpen(false); }}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm rounded-2xl flex items-center justify-center space-x-2 shadow-md shadow-purple-500/20 active:scale-98 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Create Checklist with AI</span>
            </button>
          </div>
        </div>
      )}

      {/* Native Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 lg:hidden px-3 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] shadow-lg">
        <div className="flex items-center justify-around relative">
          {/* Home & Calendar Tabs */}
          {mainTabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all active:scale-95 ${
                  isActive
                    ? 'text-brand-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${isActive ? 'bg-brand-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}

          {/* Prominent Center Floating Create Button */}
          <button
            onClick={openQuickCreate}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/35 active:scale-90 transition-transform -mt-6 border-4 border-white"
            aria-label="Create New"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Bills & Lists Tabs */}
          {mainTabs.slice(2, 4).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all active:scale-95 ${
                  isActive
                    ? 'text-brand-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${isActive ? 'bg-brand-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}

          {/* More Menu Tab */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all active:scale-95 ${
              ['tasks', 'reminders', 'settings'].includes(activeTab) || isMoreOpen
                ? 'text-brand-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl ${['tasks', 'reminders', 'settings'].includes(activeTab) || isMoreOpen ? 'bg-brand-50' : ''}`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

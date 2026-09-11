import React from 'react';
import { 
  Home, 
  Calendar, 
  CreditCard, 
  ClipboardList, 
  CheckSquare, 
  Bell, 
  Settings, 
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { openQuickCreate, openAIChecklist } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'bills', label: 'Bills & Payments', icon: CreditCard },
    { id: 'checklists', label: 'Smart Checklists', icon: ClipboardList },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen sticky top-0 h-screen z-30 select-none transition-colors">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-brand-500/20">
            P
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-lg leading-tight tracking-tight">Planora</h1>
            <p className="text-xs text-slate-400 font-medium">Life Management</p>
          </div>
        </div>
      </div>

      {/* Prominent "+ Create" & "✨ Create with AI" Buttons */}
      <div className="p-4 space-y-2">
        <button
          onClick={openQuickCreate}
          className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New</span>
        </button>

        <button
          onClick={openAIChecklist}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 font-medium text-sm rounded-xl border border-purple-200/60 shadow-2xs transition-all duration-150 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Create with AI</span>
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Quote */}
      <div className="p-4 m-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          "Everything you need to pay, plan and remember."
        </p>
      </div>
    </aside>
  );
}

import React, { useState } from 'react';
import { Search, Plus, Sparkles, User, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function Header({ activeTab, setActiveTab }) {
  const { user, isDemoMode, logout } = useAuth();
  const { openSearch, openQuickCreate, openAIChecklist } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 z-20 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Search Input Trigger */}
      <div className="flex-1 max-w-md">
        <button
          onClick={openSearch}
          className="w-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-2.5 transition-colors border border-slate-200/60 dark:border-slate-700/60"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="truncate">Search bills, tasks, checklists, reminders...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 ml-3">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Demo Mode</span>
          </div>
        )}

        {/* Quick AI Trigger */}
        <button
          onClick={openAIChecklist}
          className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors border border-purple-100"
          title="Create with AI"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Quick Add Button */}
        <button
          onClick={openQuickCreate}
          className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs hover:ring-2 hover:ring-brand-500/20 transition-all"
          >
            {user?.user_metadata?.full_name ? (
              user.user_metadata.full_name.charAt(0).toUpperCase()
            ) : (
              <User className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.user_metadata?.full_name || 'Alex Morgan'}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Account Settings
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => { logout(); setIsProfileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isDemoMode ? 'Reset Demo Session' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

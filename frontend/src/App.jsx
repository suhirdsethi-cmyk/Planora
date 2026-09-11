import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

import Sidebar from './components/Layout/Sidebar';
import MobileNav from './components/Layout/MobileNav';
import Header from './components/Layout/Header';

import LandingPage from './components/Landing/LandingPage';
import SmartToday from './components/Dashboard/SmartToday';
import QuickStats from './components/Dashboard/QuickStats';
import BillCalendar from './components/Calendar/BillCalendar';
import BillsView from './components/Bills/BillsView';
import ChecklistsView from './components/Checklists/ChecklistsView';
import TasksView from './components/Tasks/TasksView';
import RemindersView from './components/Reminders/RemindersView';
import SettingsView from './components/Settings/SettingsView';

import QuickCreateModal from './components/Dashboard/QuickCreateModal';
import AIChecklistModal from './components/Checklists/AIChecklistModal';
import SearchModal from './components/Search/SearchModal';

import { api } from './services/api';

function MainAppContent() {
  const { user, isAuthenticated } = useAuth();
  const { 
    refreshKey, 
    triggerRefresh, 
    isQuickCreateOpen, 
    closeQuickCreate,
    isSearchOpen,
    closeSearch,
    isAIChecklistOpen,
    closeAIChecklist
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [bills, setBills] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all core data
  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [dashRes, billsRes, listsRes, tasksRes, remRes] = await Promise.all([
        api.getDashboard(),
        api.getBills(),
        api.getChecklists(),
        api.getTasks(),
        api.getReminders()
      ]);

      setDashboardData(dashRes.data);
      setBills(billsRes.data || []);
      setChecklists(listsRes.data || []);
      setTasks(tasksRes.data || []);
      setReminders(remRes.data || []);
    } catch (err) {
      console.error('[App Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, refreshKey]);

  // Require Real Login (No demo mode bypass)
  if (!isAuthenticated) {
    return <LandingPage onEnterApp={() => loadData()} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Top Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Screen View Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-400">Loading Planora...</p>
            </div>
          ) : (
            <>
              {/* DASHBOARD VIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Good morning 👋
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                        Here is your personal life summary for today.
                      </p>
                    </div>
                  </div>

                  {/* Quick Summary Metric Cards */}
                  <QuickStats stats={dashboardData?.stats} />

                  {/* Unified Smart Today Section */}
                  <SmartToday
                    todayData={dashboardData?.today}
                    upcomingData={dashboardData?.upcoming}
                    onNavigate={setActiveTab}
                    onRefresh={triggerRefresh}
                  />
                </div>
              )}

              {/* CALENDAR VIEW */}
              {activeTab === 'calendar' && (
                <div className="animate-fade-in">
                  <BillCalendar
                    bills={bills}
                    tasks={tasks}
                    checklists={checklists}
                    reminders={reminders}
                    onRefresh={triggerRefresh}
                  />
                </div>
              )}

              {/* BILLS VIEW */}
              {activeTab === 'bills' && (
                <div className="animate-fade-in">
                  <BillsView bills={bills} onRefresh={triggerRefresh} />
                </div>
              )}

              {/* CHECKLISTS VIEW */}
              {activeTab === 'checklists' && (
                <div className="animate-fade-in">
                  <ChecklistsView checklists={checklists} onRefresh={triggerRefresh} />
                </div>
              )}

              {/* TASKS VIEW */}
              {activeTab === 'tasks' && (
                <div className="animate-fade-in">
                  <TasksView tasks={tasks} onRefresh={triggerRefresh} />
                </div>
              )}

              {/* REMINDERS VIEW */}
              {activeTab === 'reminders' && (
                <div className="animate-fade-in">
                  <RemindersView reminders={reminders} onRefresh={triggerRefresh} />
                </div>
              )}

              {/* SETTINGS VIEW */}
              {activeTab === 'settings' && (
                <div className="animate-fade-in">
                  <SettingsView onRefresh={triggerRefresh} />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Modals */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={closeQuickCreate}
        onRefresh={triggerRefresh}
      />

      <AIChecklistModal
        isOpen={isAIChecklistOpen}
        onClose={closeAIChecklist}
        onRefresh={triggerRefresh}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onSelectResult={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}

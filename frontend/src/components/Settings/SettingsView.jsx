import React, { useState } from 'react';
import { Settings, User, Bell, Sun, Moon, DollarSign, Download, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function SettingsView({ onRefresh }) {
  const { user, isDemoMode, logout } = useAuth();
  const { currency, setCurrency, theme, setTheme, showToast } = useApp();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTiming, setReminderTiming] = useState('1'); // '1' day before
  const [appearance, setAppearance] = useState('light');

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo data back to the default sample dataset?')) return;
    try {
      await api.resetDemoData();
      showToast('Demo dataset reset to initial state!', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleExportData = async () => {
    try {
      const [billsRes, listsRes, tasksRes, remRes] = await Promise.all([
        api.getBills(),
        api.getChecklists(),
        api.getTasks(),
        api.getReminders()
      ]);

      const exportObj = {
        app: 'Planora',
        exportedAt: new Date().toISOString(),
        bills: billsRes.data || [],
        checklists: listsRes.data || [],
        tasks: tasksRes.data || [],
        reminders: remRes.data || []
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `planora-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Data exported successfully!', 'success');
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg">
          ⚙️
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Settings</h2>
          <p className="text-xs text-slate-400 font-medium">Manage preferences, currency, and data export</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-base">Profile Details</h3>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user?.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-base">
                {user?.user_metadata?.full_name || 'Alex Morgan'}
              </p>
              <p className="text-xs text-slate-400">{user?.email || 'alex.morgan@planora.app'}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {isDemoMode ? 'Demo Mode User' : 'Authenticated User'}
              </span>
            </div>
          </div>
        </section>

        {/* Currency Preferences Section */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Currency & Display</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  showToast(`Currency updated to ${e.target.value}`, 'success');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
              >
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Theme Appearance</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setTheme('light');
                    showToast('Light theme enabled', 'info');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                    theme === 'light'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    showToast('Dark theme enabled', 'info');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                    theme === 'dark'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('system');
                    showToast('System theme enabled', 'info');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                    theme === 'system'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Auto</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Timing Section */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-slate-900 text-base">Notifications & Timing</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Enable Reminders</p>
                <p className="text-xs text-slate-400">Receive alerts for bills and tasks</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Bill Reminder Timing</label>
              <select
                value={reminderTiming}
                onChange={(e) => setReminderTiming(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
              >
                <option value="0">On Due Date</option>
                <option value="1">1 Day Before</option>
                <option value="3">3 Days Before</option>
                <option value="7">7 Days Before</option>
              </select>
            </div>
          </div>
        </section>

        {/* Data & Backup Section */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Download className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-base">Data & Reset</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Backup (JSON)</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="flex-1 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4 text-red-600" />
              <span>Reset Demo Dataset</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

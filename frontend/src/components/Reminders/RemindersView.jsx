import React, { useState } from 'react';
import { Bell, Plus, Trash2, Clock, Repeat, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function RemindersView({ reminders = [], onRefresh }) {
  const { showToast, openQuickCreate } = useApp();
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const requestBrowserNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        showToast('Browser notifications enabled!', 'success');
        new Notification('Planora Reminders', {
          body: 'Browser notifications are now active for your Planora account!'
        });
      } else {
        showToast('Notification permission denied.', 'warning');
      }
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.deleteReminder(id);
      showToast('Reminder deleted.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg">
            🔔
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Smart Reminders</h2>
            <p className="text-xs text-slate-400 font-medium">Never forget important life events or insurance renewals</p>
          </div>
        </div>

        <button
          onClick={openQuickCreate}
          className="w-full sm:w-auto px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Notification Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-orange-600" />
          <div>
            <p className="font-bold text-slate-900 text-xs">Browser Push Notifications</p>
            <p className="text-[11px] text-slate-500">
              Status: {notificationPermission === 'granted' ? '✅ Active' : '⚠️ Not Granted'}
            </p>
          </div>
        </div>

        {notificationPermission !== 'granted' && (
          <button
            onClick={requestBrowserNotifications}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
          >
            Enable Alerts
          </button>
        )}
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No reminders set</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add reminders for car insurance, doctor appointments, or bill pay dates.
          </p>
          <button
            onClick={openQuickCreate}
            className="px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-2xs mt-2"
          >
            + Set Reminder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                    {rem.reminder_date}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{rem.reminder_time || '09:00'}</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{rem.title}</h3>
                {rem.notes && <p className="text-xs text-slate-500">{rem.notes}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {rem.repeat_frequency && rem.repeat_frequency !== 'none' ? (
                  <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <Repeat className="w-3 h-3 text-slate-400" />
                    <span>Repeats {rem.repeat_frequency}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">One-time reminder</span>
                )}

                <button
                  onClick={() => handleDeleteReminder(rem.id)}
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

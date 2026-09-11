import React from 'react';
import { CreditCard, Calendar, CheckSquare, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function QuickStats({ stats }) {
  const { formatAmount } = useApp();

  const cards = [
    {
      title: 'Total Bills This Month',
      value: formatAmount(stats?.total_bills_this_month || 0),
      icon: CreditCard,
      color: 'bg-brand-50 text-brand-600 border-brand-200/60'
    },
    {
      title: 'Upcoming Payments',
      value: stats?.upcoming_payments_count || 0,
      icon: Calendar,
      color: 'bg-orange-50 text-orange-600 border-orange-200/60'
    },
    {
      title: 'Completed Tasks',
      value: stats?.completed_tasks_count || 0,
      icon: CheckSquare,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
    },
    {
      title: 'Active Checklists',
      value: stats?.active_checklists_count || 0,
      icon: ClipboardList,
      color: 'bg-purple-50 text-purple-600 border-purple-200/60'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 truncate">{card.title}</span>
              <div className={`p-2 rounded-xl border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

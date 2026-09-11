import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Repeat, 
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function BillsView({ bills = [], onRefresh }) {
  const { formatAmount, showToast, openQuickCreate } = useApp();
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'upcoming' | 'duesoon' | 'overdue' | 'paid'
  const [selectedCategory, setSelectedCategory] = useState('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const handlePayBill = async (id) => {
    try {
      const res = await api.payBill(id);
      showToast('Bill marked as paid! Next occurrence auto-generated.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      await api.deleteBill(id);
      showToast('Bill deleted successfully.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtering
  const filteredBills = bills.filter((bill) => {
    if (statusFilter === 'upcoming' && bill.status !== 'upcoming') return false;
    if (statusFilter === 'duesoon' && bill.due_date !== todayStr && bill.status !== 'due_today') return false;
    if (statusFilter === 'overdue' && bill.status !== 'overdue') return false;
    if (statusFilter === 'paid' && bill.status !== 'paid') return false;

    if (selectedCategory !== 'all' && bill.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
            💰
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Bills & Recurring Payments</h2>
            <p className="text-xs text-slate-400 font-medium">Never miss a due date with automated tracking</p>
          </div>
        </div>

        <button
          onClick={openQuickCreate}
          className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bill</span>
        </button>
      </div>

      {/* Filter Tabs & Category Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'All Bills' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'duesoon', label: 'Due Soon / Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'paid', label: 'Paid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="Electricity bill">Electricity</option>
            <option value="Wi-Fi">Wi-Fi</option>
            <option value="Mobile recharge">Mobile</option>
            <option value="Credit card">Credit Card</option>
            <option value="Rent">Rent</option>
            <option value="Subscription">Subscription</option>
            <option value="EMI">EMI</option>
            <option value="Insurance">Insurance</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredBills.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No bills found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your first recurring payment and Planora will remind you before it's due.
          </p>
          <button
            onClick={openQuickCreate}
            className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl shadow-2xs mt-2"
          >
            + Add Bill
          </button>
        </div>
      ) : (
        /* Bill Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((bill) => {
            const isPaid = bill.status === 'paid';
            const isDueToday = bill.due_date === todayStr || bill.status === 'due_today';
            const isOverdue = bill.status === 'overdue';

            return (
              <div
                key={bill.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Status Indicator Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isPaid
                      ? 'bg-emerald-500'
                      : isOverdue
                      ? 'bg-red-500'
                      : isDueToday
                      ? 'bg-orange-500'
                      : 'bg-brand-500'
                  }`}
                ></div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {bill.category}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOverdue
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isDueToday
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }`}
                    >
                      {isPaid ? 'Paid' : isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : 'Upcoming'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{bill.name}</h3>
                    <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                      {formatAmount(bill.amount)}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 pt-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: <strong className="text-slate-800">{bill.due_date}</strong></span>
                    </div>

                    {bill.is_recurring && (
                      <div className="flex items-center space-x-2">
                        <Repeat className="w-3.5 h-3.5 text-slate-400" />
                        <span>Repeats: <strong className="text-slate-800">{bill.recurrence_frequency}</strong></span>
                      </div>
                    )}

                    {bill.payment_method && (
                      <p className="text-[11px] text-slate-400">Via {bill.payment_method}</p>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDeleteBill(bill.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Bill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {!isPaid && (
                    <button
                      onClick={() => handlePayBill(bill.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Paid</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

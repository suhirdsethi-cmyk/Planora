import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, Compass, Dumbbell, Home, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function AIChecklistModal({ isOpen, onClose, onRefresh }) {
  const { showToast } = useApp();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await api.generateAIChecklist(prompt);
      showToast(`Generated AI Checklist: "${res.data.title}"`, 'success');
      setPrompt('');
      onRefresh();
      onClose();
    } catch (err) {
      showToast(err.message || 'AI Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { title: "Shimla Family Trip", icon: Compass, text: "I'm going to Shimla for 3 days with my family." },
    { title: "Gym Workout", icon: Dumbbell, text: "I'm going to the gym for a workout." },
    { title: "House Relocation", icon: Home, text: "I'm moving to a new house next week." },
    { title: "Wedding Event", icon: Heart, text: "I'm going to a wedding for two days." }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-fade-in space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI Checklist Generator</h3>
              <p className="text-xs text-slate-400">Tell Planora what you are planning</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ✨ What are you planning?
            </label>
            <textarea
              rows={3}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "I&apos;m going to Shimla for 3 days with my family."'
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            ></textarea>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Or try these smart examples:</p>
            <div className="grid grid-cols-2 gap-2">
              {samplePrompts.map((ex, idx) => {
                const Icon = ex.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(ex.text)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-purple-50 hover:border-purple-200 text-left transition-colors flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate">{ex.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Building Smart Checklist...' : 'Generate Checklist with AI'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

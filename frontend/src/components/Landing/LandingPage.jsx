import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { 
  Calendar, 
  ClipboardList, 
  Bell, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  Lock,
  CloudSun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function LandingPage({ onEnterApp }) {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const { showToast } = useApp();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      showToast('Signed in successfully with Google!', 'success');
      onEnterApp();
    } catch (err) {
      setErrorMsg('Google Sign-In failed: ' + err.message);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
      showToast('Signed in successfully!', 'success');
      onEnterApp();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header Bar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-brand-500/20">
            P
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">Planora</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
          >
            Sign In / Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 lg:px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Smart Life Management App with Live Weather AI</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Your life, <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">organized.</span>
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Everything you need to pay, plan and remember — in one place.
        </p>

        {/* Google OAuth Quick Login Container */}
        <div className="mt-8 flex flex-col items-center justify-center space-y-3">
          <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Google Sign-In was cancelled or failed.')}
              useOneTap
              shape="pill"
              size="large"
              text="continue_with"
            />
          </div>
          <p className="text-xs text-slate-400">Secure 1-Click Login via Google OAuth 2.0</p>
        </div>

        {/* Product Dashboard Interactive Mockup Preview */}
        <div className="mt-14 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden p-2 sm:p-4 text-left">
          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 sm:p-6 text-white space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">PLANORA DASHBOARD PREVIEW</p>
                <h3 className="text-xl font-bold text-white">Good morning 👋</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full font-medium flex items-center space-x-1">
                <CloudSun className="w-3.5 h-3.5" />
                <span>Shimla: 14°C & Rainy</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>URGENT BILL</span>
                  <span className="text-red-400 font-semibold">Due Today</span>
                </div>
                <p className="text-base font-bold text-white">Credit Card</p>
                <p className="text-xl font-extrabold text-red-400 mt-1">₹12,450</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>RECURRING BILL</span>
                  <span className="text-orange-400 font-semibold">Due Tomorrow</span>
                </div>
                <p className="text-base font-bold text-white">Wi-Fi Broadband</p>
                <p className="text-xl font-extrabold text-orange-400 mt-1">₹825</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>AI WEATHER TRIP</span>
                  <span className="text-emerald-400 font-semibold">67% Complete</span>
                </div>
                <p className="text-base font-bold text-white">Shimla Family Trip</p>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                  <div className="bg-emerald-500 h-2 rounded-full w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Four Core Pillars of Personal Management</h2>
            <p className="text-slate-500 text-sm mt-2">Designed for high productivity and zero mental fatigue.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">📅 Never Miss a Bill</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Track monthly recurring payments, Wi-Fi, Rent & Credit cards with auto occurrence generation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">🌦️ Weather-Aware AI</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Fetches live destination weather forecasts (e.g. Shimla 14°C & Rain) to recommend gear dynamically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">✅ Tasks & Priorities</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Prioritize tasks (High 🔴, Medium 🟠, Low 🟢) and mark completions effortlessly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">🔔 Smart Reminders</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Set custom browser notification alerts for vehicle insurance, medical refills, and meetings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Planora — Everything you need to pay, plan and remember.</p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-3">
                P
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Sign in to Planora
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Access your personal dashboard & AI features
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-center py-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMsg('Google Sign-In failed.')}
                  shape="pill"
                  size="large"
                />
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-medium">Or email</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors"
                >
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

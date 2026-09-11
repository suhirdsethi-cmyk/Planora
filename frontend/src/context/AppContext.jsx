import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const AppProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('planora_currency') || 'INR');
  const [theme, setThemeState] = useState(() => localStorage.getItem('planora_theme') || 'light');

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIChecklistOpen, setIsAIChecklistOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  // Apply Theme class to <html> element
  useEffect(() => {
    localStorage.setItem('planora_theme', theme);
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  useEffect(() => {
    localStorage.setItem('planora_currency', currency);
  }, [currency]);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount) || 0;
    const symbol = CURRENCY_SYMBOLS[currency] || '₹';
    return `${symbol}${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency,
        currencySymbol: CURRENCY_SYMBOLS[currency] || '₹',
        formatAmount,
        theme,
        setTheme,
        isQuickCreateOpen,
        openQuickCreate: () => setIsQuickCreateOpen(true),
        closeQuickCreate: () => setIsQuickCreateOpen(false),
        isSearchOpen,
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        isAIChecklistOpen,
        openAIChecklist: () => setIsAIChecklistOpen(true),
        closeAIChecklist: () => setIsAIChecklistOpen(false),
        refreshKey,
        triggerRefresh,
        showToast
      }}
    >
      {children}

      {/* Floating Toast Component */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center space-x-3 text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800'
                : toast.type === 'warning'
                ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

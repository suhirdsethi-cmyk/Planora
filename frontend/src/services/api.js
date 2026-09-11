const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Fetch wrapper with standardized JSON handling & user-id headers
 */
const request = async (endpoint, options = {}) => {
  const userId = localStorage.getItem('planora_user_id') || 'demo-user-123';
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || `API Error (${res.status})`);
    }
    return data;
  } catch (err) {
    console.error(`[API Call Error] ${endpoint}:`, err);
    throw err;
  }
};

export const api = {
  // Auth
  loginWithGoogle: (credential) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Bills
  getBills: () => request('/bills'),
  createBill: (billData) => request('/bills', { method: 'POST', body: JSON.stringify(billData) }),
  updateBill: (id, billData) => request(`/bills/${id}`, { method: 'PUT', body: JSON.stringify(billData) }),
  deleteBill: (id) => request(`/bills/${id}`, { method: 'DELETE' }),
  payBill: (id) => request(`/bills/${id}/pay`, { method: 'POST' }),

  // Checklists
  getChecklists: () => request('/checklists'),
  createChecklist: (data) => request('/checklists', { method: 'POST', body: JSON.stringify(data) }),
  generateAIChecklist: (prompt) => request('/checklists/ai-generate', { method: 'POST', body: JSON.stringify({ prompt }) }),
  toggleChecklistItem: (itemId, isCompleted) => request(`/checklists/items/${itemId}/toggle`, { method: 'PUT', body: JSON.stringify({ is_completed: isCompleted }) }),
  addChecklistItem: (checklistId, title, category) => request(`/checklists/${checklistId}/items`, { method: 'POST', body: JSON.stringify({ title, category }) }),
  deleteChecklistItem: (itemId) => request(`/checklists/items/${itemId}`, { method: 'DELETE' }),
  deleteChecklist: (id) => request(`/checklists/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request('/tasks'),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  toggleTask: (id, isCompleted) => request(`/tasks/${id}/toggle`, { method: 'PUT', body: JSON.stringify({ is_completed: isCompleted }) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Reminders
  getReminders: () => request('/reminders'),
  createReminder: (data) => request('/reminders', { method: 'POST', body: JSON.stringify(data) }),
  deleteReminder: (id) => request(`/reminders/${id}`, { method: 'DELETE' }),

  // Search & AI Natural Prompt
  search: (query) => request(`/search?q=${encodeURIComponent(query)}`),
  parseNaturalPrompt: (input) => request('/ai/parse-natural', { method: 'POST', body: JSON.stringify({ input }) }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetDemoData: () => request('/settings/reset-demo', { method: 'POST' })
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('planora_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('planora_token') || null);
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    try {
      const res = await api.loginWithGoogle(credential);
      const { user: userData, token: jwtToken } = res.data;

      setUser(userData);
      setToken(jwtToken);

      localStorage.setItem('planora_user', JSON.stringify(userData));
      localStorage.setItem('planora_token', jwtToken);
      localStorage.setItem('planora_user_id', userData.id);

      return userData;
    } catch (err) {
      console.error('Google OAuth Login Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    // Custom Email Auth session
    const userData = {
      id: `user-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      email,
      full_name: email.split('@')[0],
      currency: 'INR'
    };

    setUser(userData);
    localStorage.setItem('planora_user', JSON.stringify(userData));
    localStorage.setItem('planora_user_id', userData.id);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('planora_user');
    localStorage.removeItem('planora_token');
    localStorage.removeItem('planora_user_id');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        loading,
        loginWithGoogle,
        loginWithEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

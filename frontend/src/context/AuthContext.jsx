// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rsmani_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('rsmani_token'));
  const [loading, setLoading] = useState(false);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('rsmani_user', JSON.stringify(userData));
    localStorage.setItem('rsmani_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rsmani_user');
    localStorage.removeItem('rsmani_token');
  };

  const isAdmin = user?.role === 'admin';
  const isDelivery = user?.role === 'delivery';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isDelivery, isCustomer, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

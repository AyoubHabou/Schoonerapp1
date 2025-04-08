import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await authService.register(userData);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isManager: currentUser?.role === 'manager',
    isEmployee: currentUser?.role === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
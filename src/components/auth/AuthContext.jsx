import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const backendUrl = import.meta.env.VITE_Backend_URL || 'http://localhost:3000';
      const response = await axios.post(`${backendUrl}/api/auth/login`, { username, password });
      
      if (response.data.success) {
        const { token, division, role } = response.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        
        const userData = {
          role,
          ...(division && { 
            divisionId: division.id,
            divisionName: division.name,
            divisionCode: division.code
          })
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setCurrentUser(userData);
        return { success: true };
      } else {
        setError(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  // Check if user is main admin
  const isMainAdmin = () => {
    return currentUser?.role === 'main_admin';
  };

  // Check if user is division admin
  const isDivisionAdmin = () => {
    return currentUser?.role === 'division_admin';
  };

  // Get division ID of current user
  const getDivisionId = () => {
    return currentUser?.divisionId || null;
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isMainAdmin,
    isDivisionAdmin,
    getDivisionId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
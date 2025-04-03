import axios from 'axios';

// For Vite, use import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || '';

// Store auth token in local storage
const setToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Retrieve auth token from local storage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getToken();
};

// Login user (division admin or main admin)
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, { 
      username, 
      password 
    });
    
    if (response.data.success) {
      setToken(response.data.token);
      
      // Store user data
      const userData = {
        role: response.data.role,
        ...(response.data.division && {
          divisionId: response.data.division.id,
          divisionName: response.data.division.name,
          divisionCode: response.data.division.code
        })
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout user
const logout = () => {
  setToken(null);
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('divisionId');
  localStorage.removeItem('divisionName');
  localStorage.removeItem('username');
};

// Get current user data
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Request password reset for division admin
const requestPasswordReset = async (divisionCode) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/request-reset`, { divisionCode });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reset password with token
const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/reset-password`, { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  login,
  logout,
  getCurrentUser,
  getToken,
  setToken,
  isAuthenticated,
  requestPasswordReset,
  resetPassword
};
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, usersAPI, investigationsAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data.data;
      
      // Store the JWT token in localStorage
      localStorage.setItem('token', token);
      
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { token, user } = response.data.data;
      
      // Store the JWT token in localStorage
      localStorage.setItem('token', token);
      
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const toggleRole = async () => {
    try {
      setError(null);
      const response = await authAPI.toggleRole();
      const { token, activeRole } = response.data.data;
      
      // Update the JWT token in localStorage
      localStorage.setItem('token', token);
      
      // Fetch the appropriate profile based on the new role
      let profileResponse;
      if (activeRole === 'investigator') {
        // Get the investigator ID from the current user object
        const investigatorId = user.investigator_id;
        if (!investigatorId) {
          throw new Error('Investigator ID not found');
        }
        profileResponse = await investigationsAPI.getById(investigatorId);
      } else {
        profileResponse = await usersAPI.getProfile();
      }
      
      // Update user with the new profile data and active role
      setUser({
        ...profileResponse.data,
        activeRole
      });
      
      return activeRole;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle role');
      throw error;
    }
  };

  const logout = () => {
    // Remove the token from local storage first
    localStorage.removeItem('token'); 
    
    // Optionally call backend logout endpoint (if it exists and is needed)
    authAPI.logout().catch(err => console.error("Backend logout failed:", err)); // Optional: Call backend logout, handle potential errors

    // Clear local state
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    toggleRole,
    isClient: user?.roles?.includes('client'),
    isInvestigator: user?.roles?.includes('investigator'),
    activeRole: user?.activeRole || (user?.roles?.includes('client') ? 'client' : 'investigator')
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  toggleRole: () => api.post('/auth/toggle-role'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  rateInvestigator: (id, rating) => api.post(`/users/${id}/rate`, { rating }),
};

// Investigations API
export const investigationsAPI = {
  getAll: (params) => api.get('/investigations', { params }),
  getById: (id) => api.get(`/investigations/${id}`),
  create: (investigationData) => api.post('/investigations', investigationData),
  update: (id, investigationData) => api.put(`/investigations/${id}`, investigationData),
  delete: (id) => api.delete(`/investigations/${id}`),
  accept: (id, data) => api.patch(`/investigations/${id}/accept`, data, { 
    params: { role: 'investigator' } 
  }),
  decline: (id) => api.post(`/investigations/${id}/decline`),
  submitReport: (id, reportData) => api.post(`/investigations/${id}/report`, reportData),
  
  // Get investigations for the current investigator
  getMyInvestigations: (params) => api.get('/investigations', { 
    params: { 
      ...params,
      role: 'investigator',
      investigator: true
    } 
  }),
  
  // Get available investigations for investigators
  getAvailableInvestigations: (params) => api.get('/investigations', { 
    params: { 
      ...params,
      role: 'investigator',
      status: 'submitted'
    } 
  }),
  
  // Complete an investigation
  completeInvestigation: (id, data) => api.patch(`/investigations/${id}/complete`, data, {
    params: { role: 'investigator' }
  })
};

// Reports API
export const reportsAPI = {
  getByInvestigationId: (investigationId) => api.get(`/reports/investigation/${investigationId}`), // Assuming this route exists for fetching
  // Updated create function to match the route: POST /reports/:investigationId
  createReport: (investigationId, reportData) => api.post(`/reports/${investigationId}`, reportData, {
    // Axios should automatically set Content-Type to multipart/form-data when sending FormData
    // headers: { 'Content-Type': 'multipart/form-data' } // Usually not needed with Axios + FormData
  }),
  update: (id, reportData) => api.put(`/reports/${id}`, reportData),
  delete: (id) => api.delete(`/reports/${id}`),
  // Add functions for rating and getting specific report if needed, based on routes.js
  getReport: (investigationId) => api.get(`/reports/${investigationId}`),
  rateReport: (investigationId, ratingData) => api.post(`/reports/${investigationId}/rate`, ratingData),
};

export default api;

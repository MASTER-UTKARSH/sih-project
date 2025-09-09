import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dpis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('dpis_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  createAnonymousSession: () => api.post('/auth/anonymous'),
};

// Screening API
export const screeningAPI = {
  create: (screeningData) => api.post('/screening', screeningData),
  getHistory: () => api.get('/screening'),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (messageData) => api.post('/chatbot/chat', messageData),
  getConversation: (conversationId) => api.get(`/chatbot/conversations/${conversationId}`),
  endConversation: (conversationId, feedback) => 
    api.post(`/chatbot/conversations/${conversationId}/end`, { feedback }),
};

// Booking API
export const bookingAPI = {
  create: (bookingData) => api.post('/booking', bookingData),
  getBookings: () => api.get('/booking'),
  getCounselors: () => api.get('/booking/counselors'),
};

// Resources API
export const resourcesAPI = {
  getResources: (params) => api.get('/resources', { params }),
};

// Forum API
export const forumAPI = {
  getPosts: (params) => api.get('/forum', { params }),
  createPost: (postData) => api.post('/forum', postData),
};

// Admin API
export const adminAPI = {
  getDashboard: (timeRange) => api.get('/admin/dashboard', { params: { timeRange } }),
  getAlerts: () => api.get('/admin/alerts'),
  getModeration: () => api.get('/admin/moderation'),
};

// Health API
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;

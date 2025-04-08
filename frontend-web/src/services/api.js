import axios from 'axios';

// Production hardcoded URL as a fallback (with /v1 path)
const PROD_API_URL = 'https://schooner-backend.onrender.com/api/v1';

// Determine API URL with explicit fallbacks for both production and development
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? PROD_API_URL : 'http://localhost:5000/api/v1');

console.log('API URL being used:', API_URL);

const TOKEN_KEY = 'timetracker_token';

// Create axios instance with improved CORS handling
const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add withCredentials for CORS requests with credentials
  withCredentials: false
});

// Add token to requests if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  
    
    // Log the request for debugging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for token expiration
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    return API.post('/auth/register', userData);
  },
  
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  forgotPassword: async (email) => {
    return API.post('/auth/forgot-password', { email });
  },
  
  resetPassword: async (token, password) => {
    return API.post('/auth/reset-password', { token, password });
  },
  
  verifyInvitation: async (token) => {
    return API.get(`/auth/verify-invitation/${token}`);
  },
  
  completeInvitation: async (data) => {
    return API.post('/auth/complete-invitation', data);
  },
  
  getCurrentUser: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    
    try {
      // Decode token to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }
};

// Time entry services
export const timeEntryService = {
  clockIn: () => API.post('/time-entries/clock-in'),
  startBreak: () => API.post('/time-entries/start-break'),
  endBreak: () => API.post('/time-entries/end-break'),
  clockOut: () => API.post('/time-entries/clock-out'),
  getUserEntries: () => API.get('/time-entries/my-entries'),
  getAllEntries: () => API.get('/time-entries/all'),
  getActiveEmployees: () => API.get('/time-entries/active')
};

// Invitation services
export const invitationService = {
  inviteEmployee: (invitationData) => {
    return API.post('/invitations', invitationData);
  }
};

// Notification services
export const notificationService = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (notificationId) => API.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  getUnreadCount: () => API.get('/notifications/unread-count')
};

export default API;

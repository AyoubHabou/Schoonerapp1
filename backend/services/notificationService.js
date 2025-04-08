import axios from 'axios';

// Create a proper axios instance with base URL and auth
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
API.interceptors.request.use(config => {
  const token = localStorage.getItem('timetracker_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Notification types
export const NotificationType = {
  MISSED_SHIFT: 'missed-shift',
  OVERTIME: 'overtime',
  LATE_CLOCK_IN: 'late-clock-in',
  SCHEDULE_CHANGE: 'schedule-change',
  NEW_EMPLOYEE: 'new-employee'
};

// Get all notifications
export const getNotifications = async () => {
  try {
    const response = await API.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    const response = await API.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  try {
    const response = await API.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadCount = async () => {
  try {
    const response = await API.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

// Invite employee 
export const inviteEmployee = async (data) => {
  try {
    const response = await API.post('/invitations', data);
    return response.data;
  } catch (error) {
    console.error('Error inviting employee:', error);
    throw error;
  }
};

// Export the service as an object
const notificationService = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  inviteEmployee,
  NotificationType
};

export default notificationService;

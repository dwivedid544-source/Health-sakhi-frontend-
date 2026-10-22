// src/api/memberApi.js
import axiosClient from './axiosClient';

const memberApi = {
  // Fetch current member profile
  getProfile: async () => {
    const response = await axiosClient.get('/members/profile');
    return response.data;
  },
  // Update member profile
  updateProfile: async (payload) => {
    const response = await axiosClient.put('/members/profile', payload);
    return response.data;
  },
  // Fetch member onboarding status
  getOnboardingInfo: async () => {
    const response = await axiosClient.get('/members/onboarding');
    return response.data;
  },
  // Fetch member's subscription plan
  getPlan: async () => {
    const response = await axiosClient.get('/members/plan');
    return response.data;
  },
  // Switch plan (used by plan screen)
  switchPlan: async (planId) => {
    const response = await axiosClient.post('/members/plan', { planId });
    return response.data;
  },
  // Get dashboard metrics
  getDashboard: async () => {
    const response = await axiosClient.get('/members/dashboard');
    return response.data;
  },
  // Get mood logs
  getMoodLogs: async () => {
    const response = await axiosClient.get('/members/mood');
    return response.data;
  },
  // Log mood
  logMood: async (payload) => {
    const response = await axiosClient.post('/members/mood', payload);
    return response.data;
  },
  // Get todos
  getTodos: async (params = {}) => {
    const response = await axiosClient.get('/members/todo', { params });
    return response.data;
  },
  // Create todo
  createTodo: async (payload) => {
    const response = await axiosClient.post('/members/todo', payload);
    return response.data;
  },
  // Update todo completion
  updateTodo: async (id, isCompleted) => {
    const response = await axiosClient.put(`/members/todo/${id}`, { is_completed: isCompleted });
    return response.data;
  },
  // Get transactions
  getTransactions: async () => {
    const response = await axiosClient.get('/members/finance');
    return response.data;
  },
  // Create transaction
  createTransaction: async (payload) => {
    const response = await axiosClient.post('/members/finance', payload);
    return response.data;
  },
  // Update transaction
  updateTransaction: async (id, payload) => {
    const response = await axiosClient.put(`/members/finance/${id}`, payload);
    return response.data;
  },
  // Delete transaction
  deleteTransaction: async (id) => {
    const response = await axiosClient.delete(`/members/finance/${id}`);
    return response.data;
  },
  // Export finance PDF
  exportFinanceReport: async () => {
    const response = await axiosClient.get('/members/finance/export');
    return response.data;
  },
  // Get affirmations
  getAffirmations: async (params = {}) => {
    const response = await axiosClient.get('/members/affirmations', { params });
    return response.data;
  },
  // Submit daily AI check-in
  dailyCheckIn: async (text) => {
    const response = await axiosClient.post('/members/daily-checkin', { text });
    return response.data;
  },
  // Fetch system/admin notifications
  getNotifications: async () => {
    const response = await axiosClient.get('/notifications');
    return response.data;
  },
  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    const response = await axiosClient.patch('/notifications/read-all');
    return response.data;
  },
  // Mark a single notification as read
  markNotificationRead: async (id) => {
    const response = await axiosClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
  // Get sender member ID for an admin notification
  getNotificationSender: async (id) => {
    const response = await axiosClient.get(`/notifications/${id}/sender`);
    return response.data;
  },
  // Reply to admin notification
  sendNotificationReply: async (message, title) => {
    const response = await axiosClient.post('/notifications/reply', { message, title });
    return response.data;
  },
  // Delete a specific notification/chat message
  deleteNotification: async (id) => {
    const response = await axiosClient.delete(`/notifications/${id}`);
    return response.data;
  },
  // Get all user certificates
  getCertificates: async () => {
    const response = await axiosClient.get('/certificates');
    return response.data;
  },
  // Evaluate user certificates
  checkCertificates: async () => {
    const response = await axiosClient.post('/certificates/check');
    return response.data;
  }
};

export default memberApi;

import axiosClient from './axiosClient';

const adminApi = {
  // Dashboard Metrics
  getDashboardStats: async () => {
    const response = await axiosClient.get('/admin/dashboard');
    return response.data;
  },

  // User Management
  getUsers: async (params = {}) => {
    const response = await axiosClient.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await axiosClient.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await axiosClient.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await axiosClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  suspendUser: async (id, suspend, reason = 'Administrative action') => {
    const response = await axiosClient.put(`/admin/users/${id}/suspend`, { suspend, reason });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  sendDirectNotification: async (data) => {
    const response = await axiosClient.post('/notifications/direct', data);
    return response.data;
  },

  getUserChatThread: async (userId) => {
    const response = await axiosClient.get(`/notifications/user/${userId}/chat`);
    return response.data;
  },

  getUnreadReplies: async () => {
    const response = await axiosClient.get('/notifications/unread-replies');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await axiosClient.delete(`/notifications/${id}`);
    return response.data;
  },

  getAdvisorPayouts: async () => {
    const response = await axiosClient.get('/admin/payouts');
    return response.data;
  },

  releaseAdvisorPayout: async (id) => {
    const response = await axiosClient.put(`/admin/payouts/${id}/release`);
    return response.data;
  },

  getReferrals: async () => {
    const response = await axiosClient.get('/admin/referrals');
    return response.data;
  },

  // Member Approval Manual Queue
  getQueue: async () => {
    const response = await axiosClient.get('/admin/users/queue');
    return response.data;
  },

  approveMember: async (id, notes = '') => {
    const response = await axiosClient.put(`/admin/users/${id}/approve`, { approve: true, notes });
    return response.data;
  },

  rejectMember: async (id, notes = '') => {
    const response = await axiosClient.put(`/admin/users/${id}/reject`, { reject: true, notes });
    return response.data;
  },

  // Advisor Management
  getAdvisors: async (params = {}) => {
    const response = await axiosClient.get('/admin/advisors', { params });
    return response.data;
  },

  createAdvisor: async (data) => {
    const response = await axiosClient.post('/admin/advisors', data);
    return response.data;
  },

  updateAdvisorStatus: async (id, status) => {
    const response = await axiosClient.put(`/admin/advisors/${id}/status`, { status });
    return response.data;
  },

  updateAdvisor: async (id, data) => {
    const response = await axiosClient.put(`/admin/advisors/${id}`, data);
    return response.data;
  },

  // Plan Management
  getPlans: async () => {
    const response = await axiosClient.get('/admin/plans');
    return response.data;
  },

  createPlan: async (data) => {
    const response = await axiosClient.post('/admin/plans', data);
    return response.data;
  },

  updatePlan: async (id, data) => {
    const response = await axiosClient.put(`/admin/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await axiosClient.delete(`/admin/plans/${id}`);
    return response.data;
  },

  // Business Intelligence / Analytics (prefix /analytics)
  getDashboardAnalytics: async () => {
    const response = await axiosClient.get('/analytics/dashboard');
    return response.data;
  },

  getRevenueAnalytics: async (params = {}) => {
    const response = await axiosClient.get('/analytics/revenue', { params });
    return response.data;
  },

  getUserAnalytics: async () => {
    const response = await axiosClient.get('/analytics/users');
    return response.data;
  },

  getContentAnalytics: async () => {
    const response = await axiosClient.get('/analytics/content');
    return response.data;
  },

  // Campaigns & Broadcasts (prefix /notifications)
  getCampaigns: async () => {
    const response = await axiosClient.get('/notifications/campaigns');
    return response.data;
  },

  createCampaign: async (data) => {
    const response = await axiosClient.post('/notifications/campaigns', data);
    return response.data;
  },

  triggerCampaign: async (id) => {
    const response = await axiosClient.post(`/notifications/campaigns/${id}/trigger`);
    return response.data;
  },

  // Invoices Management
  getInvoices: async () => {
    const response = await axiosClient.get('/admin/invoices');
    return response.data;
  },

  createInvoice: async (data) => {
    const response = await axiosClient.post('/admin/invoices', data);
    return response.data;
  },

  // Sakhi CMS Management
  getSakhiContent: async (params = {}) => {
    const response = await axiosClient.get('/admin/sakhi-content', { params });
    return response.data;
  },
  createSakhiContent: async (data) => {
    const response = await axiosClient.post('/admin/sakhi-content', data);
    return response.data;
  },
  updateSakhiContent: async (id, data) => {
    const response = await axiosClient.put(`/admin/sakhi-content/${id}`, data);
    return response.data;
  },
  deleteSakhiContent: async (id) => {
    const response = await axiosClient.delete(`/admin/sakhi-content/${id}`);
    return response.data;
  },
  getUserNotifications: async (userId) => {
    const response = await axiosClient.get(`/notifications/user/${userId}`);
    return response.data;
  },

  // Community Management
  getCommunityCircles: async () => {
    const response = await axiosClient.get('/admin/community/circles');
    return response.data;
  },
  createCommunityCircle: async (data) => {
    const response = await axiosClient.post('/admin/community/circles', data);
    return response.data;
  },
  updateCommunityCircle: async (id, data) => {
    const response = await axiosClient.put(`/admin/community/circles/${id}`, data);
    return response.data;
  },
  deleteCommunityCircle: async (id) => {
    const response = await axiosClient.delete(`/admin/community/circles/${id}`);
    return response.data;
  },
  getCommunityCircleMessages: async (id) => {
    const response = await axiosClient.get(`/admin/community/circles/${id}/messages`);
    return response.data;
  },
  toggleBlockCommunityMember: async (id, userId, isBlocked) => {
    const response = await axiosClient.post(`/admin/community/circles/${id}/block-user`, { userId, isBlocked });
    return response.data;
  }
};

export default adminApi;

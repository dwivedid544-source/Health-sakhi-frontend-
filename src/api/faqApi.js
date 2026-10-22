// src/api/faqApi.js
import axiosClient from './axiosClient';

const faqApi = {
  // Public Client Endpoints
  getFaqs: async (params = {}) => {
    const response = await axiosClient.get('/faqs', { params });
    return response.data;
  },

  submitFeedback: async (id, type) => {
    const response = await axiosClient.post(`/faqs/${id}/feedback`, { type });
    return response.data;
  },

  // Admin Client Endpoints (Requires Admin Auth Cookie/Token)
  getAdminFaqs: async (params = {}) => {
    const response = await axiosClient.get('/admin/faqs', { params });
    return response.data;
  },

  createFaq: async (data) => {
    const response = await axiosClient.post('/admin/faqs', data);
    return response.data;
  },

  updateFaq: async (id, data) => {
    const response = await axiosClient.put(`/admin/faqs/${id}`, data);
    return response.data;
  },

  deleteFaq: async (id) => {
    const response = await axiosClient.delete(`/admin/faqs/${id}`);
    return response.data;
  }
};

export default faqApi;

// src/api/contactApi.js
import axiosClient from './axiosClient';

const contactApi = {
  submitContact: async (name, email, message, type = 'inquiry', role = '', rating = 5) => {
    const response = await axiosClient.post('/public/contact', { name, email, message, type, role, rating });
    return response.data;
  },
  getMessages: async () => {
    const response = await axiosClient.get('/admin/contact-messages');
    return response.data;
  },
  getApprovedFeedbacks: async () => {
    const response = await axiosClient.get('/public/feedbacks');
    return response.data;
  },
  approveFeedback: async (id) => {
    const response = await axiosClient.put(`/admin/contact-messages/${id}/approve`);
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await axiosClient.put(`/admin/contact-messages/${id}/read`);
    return response.data;
  },
  deleteMessage: async (id) => {
    const response = await axiosClient.delete(`/admin/contact-messages/${id}`);
    return response.data;
  }
};

export default contactApi;

import axiosClient from './axiosClient';

const blogApi = {
  // Public/Member endpoints
  getPublicBlogs: async (params = {}) => {
    const response = await axiosClient.get('/public/blogs', { params });
    return response.data;
  },

  getBlogById: async (id) => {
    const response = await axiosClient.get(`/public/blogs/${id}`);
    return response.data;
  },

  getBlogFeedbacks: async (blogId) => {
    const response = await axiosClient.get(`/public/blogs/${blogId}/feedbacks`);
    return response.data;
  },

  submitBlogFeedback: async (blogId, payload) => {
    const response = await axiosClient.post(`/public/blogs/${blogId}/feedbacks`, payload);
    return response.data;
  },

  // Admin endpoints
  getAdminBlogs: async (params = {}) => {
    const response = await axiosClient.get('/admin/blogs', { params });
    return response.data;
  },

  createBlog: async (data) => {
    const response = await axiosClient.post('/admin/blogs', data);
    return response.data;
  },

  updateBlog: async (id, data) => {
    const response = await axiosClient.put(`/admin/blogs/${id}`, data);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await axiosClient.delete(`/admin/blogs/${id}`);
    return response.data;
  },

  deleteBlogFeedback: async (feedbackId) => {
    const response = await axiosClient.delete(`/admin/blogs/feedbacks/${feedbackId}`);
    return response.data;
  }
};

export default blogApi;

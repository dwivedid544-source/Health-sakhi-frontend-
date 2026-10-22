import axiosClient from './axiosClient';

const diaryApi = {
  getEntries: async (page = 1, limit = 10) => {
    const response = await axiosClient.get('/diary', {
      params: { page, limit }
    });
    return response.data;
  },

  getEntryByDate: async (dateStr) => {
    const response = await axiosClient.get(`/diary/by-date/${dateStr}`);
    return response.data;
  },

  createOrUpdateEntry: async (formData) => {
    // Uses FormData for potential file attachment uploads
    const response = await axiosClient.post('/diary', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteEntry: async (id) => {
    const response = await axiosClient.delete(`/diary/${id}`);
    return response.data;
  },

  deleteReport: async (reportId) => {
    const response = await axiosClient.delete(`/diary/report/${reportId}`);
    return response.data;
  },

  downloadReport: async (params = {}) => {
    const response = await axiosClient.get('/diary/report/download', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default diaryApi;

// src/api/contentAssetApi.js
import axiosClient from './axiosClient';

const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:5000';

/**
 * Resolve relative /uploads/... paths to full backend URL
 */
export const resolveMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE}${url}`;
};

const contentAssetApi = {
  // ── Public / Member ─────────────────────────────────────────────────────────

  getPublicAssets: async (params = {}) => {
    const response = await axiosClient.get('/content-assets', { params });
    return response.data;
  },

  getAssetById: async (id) => {
    const response = await axiosClient.get(`/content-assets/${id}`);
    return response.data;
  },

  // ── Progress Tracking ────────────────────────────────────────────────────────

  /**
   * Save progress for a content item
   * @param {string} id - content asset ID
   * @param {number} position - seconds (video) or page number (book)
   * @param {boolean} completed
   * @param {string} contentType - 'Video' | 'Book'
   */
  saveProgress: async (id, position, completed = false, contentType = 'Video') => {
    try {
      const response = await axiosClient.post(`/content-assets/${id}/progress`, {
        position,
        completed,
        contentType
      });
      return response.data;
    } catch (err) {
      // Non-blocking — progress save failure should not crash the UI
      console.warn('Progress save failed:', err?.response?.data || err.message);
      return null;
    }
  },

  getProgress: async (id) => {
    try {
      const response = await axiosClient.get(`/content-assets/${id}/progress`);
      return response.data?.data || { position: 0, completed: false };
    } catch (err) {
      console.warn('Progress load failed:', err?.response?.data || err.message);
      return { position: 0, completed: false };
    }
  },

  /**
   * Load all saved progress records for the user
   */
  getUserAllProgress: async () => {
    try {
      const response = await axiosClient.get('/content-progress/all');
      return response.data;
    } catch (err) {
      console.warn('All progress load failed:', err?.response?.data || err.message);
      return { success: false, data: [] };
    }
  },

  submitFeedback: async (id, rating, comment) => {
    try {
      const response = await axiosClient.post(`/content-assets/${id}/feedback`, {
        rating,
        comment
      });
      return response.data;
    } catch (err) {
      console.error('Feedback submission failed:', err?.response?.data || err.message);
      throw err;
    }
  },

  getBookFeedbacks: async (id) => {
    try {
      const response = await axiosClient.get(`/content-assets/${id}/feedbacks`);
      return response.data;
    } catch (err) {
      console.error('Loading book feedbacks failed:', err?.response?.data || err.message);
      return { success: false, data: [] };
    }
  },

  // ── Admin ────────────────────────────────────────────────────────────────────

  getAdminAssets: async (params = {}) => {
    const response = await axiosClient.get('/admin/content-assets', { params });
    return response.data;
  },

  createAsset: async (data) => {
    const response = await axiosClient.post('/admin/content-assets', data);
    return response.data;
  },

  updateAsset: async (id, data) => {
    const response = await axiosClient.put(`/admin/content-assets/${id}`, data);
    return response.data;
  },

  deleteAsset: async (id) => {
    const response = await axiosClient.delete(`/admin/content-assets/${id}`);
    return response.data;
  },

  uploadMediaFile: async (file) => {
    const formData = new FormData();
    formData.append('mediaFile', file);
    const response = await axiosClient.post(`/admin/content-assets/upload?t=${Date.now()}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default contentAssetApi;

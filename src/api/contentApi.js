// src/api/contentApi.js
import axiosClient from './axiosClient';

const contentApi = {
  getBooks: async (search = '') => {
    const response = await axiosClient.get('/content/books', { params: { search } });
    return response.data;
  },
  getBook: async (id) => {
    const response = await axiosClient.get(`/content/books/${id}`);
    return response.data;
  },
  getChapter: async (bookId, chapterId, lang = 'en') => {
    const response = await axiosClient.get(`/content/books/${bookId}/chapters/${chapterId}`, { params: { lang } });
    return response.data;
  },
  saveBookProgress: async (bookId, payload) => {
    const response = await axiosClient.post(`/content/books/${bookId}/progress`, payload);
    return response.data;
  },
  getVideos: async (playlist = '') => {
    const response = await axiosClient.get('/content/videos', { params: { playlist } });
    return response.data;
  },
  saveVideoProgress: async (videoId, payload) => {
    const response = await axiosClient.post(`/content/videos/${videoId}/progress`, payload);
    return response.data;
  },
  getMeditationSessions: async (category = '') => {
    const response = await axiosClient.get('/content/meditations', { params: { category } });
    return response.data;
  },
  getAffirmations: async (category = '', mood = '') => {
    const response = await axiosClient.get('/content/affirmations', { params: { category, mood } });
    return response.data;
  },
  getSakhiContent: async (tab = '') => {
    const response = await axiosClient.get('/content/sakhi-content', { params: { tab } });
    return response.data;
  },
  // YouTube meditation videos — auto-fetched from YouTube Data API v3
  getYoutubeVideos: async (keyword = '', page = 1, limit = 20, videoType = '') => {
    const response = await axiosClient.get('/content/meditations/youtube', {
      params: { keyword, page, limit, videoType },
    });
    return response.data;
  },
};

export default contentApi;

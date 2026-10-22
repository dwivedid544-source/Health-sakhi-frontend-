// src/api/aiApi.js
import axiosClient from './axiosClient';

const aiApi = {
  // Create a new AI chat session
  createSession: async (title) => {
    const response = await axiosClient.post('/ai/chat', {
      message: "Hello Sakhi"
    });
    return response.data;
  },

  // Get all AI chat sessions
  getSessions: async () => {
    const response = await axiosClient.get('/ai/history');
    return response.data;
  },

  // Delete a specific AI chat session
  deleteSession: async (sessionId) => {
    const response = await axiosClient.delete(`/ai/history/${sessionId}`);
    return response.data;
  },

  // Get messages for a specific session
  getMessages: async (sessionId) => {
    const response = await axiosClient.get('/ai/history', {
      params: { session_id: sessionId }
    });
    return response.data;
  },

  // Send a message to the AI chat session
  sendMessage: async (sessionId, messageText, mode) => {
    const response = await axiosClient.post('/ai/chat', {
      session_id: sessionId,
      message: messageText,
      mode: mode
    });
    return response.data;
  },

  // Execute a pending parsed action
  executeAction: async (actionId) => {
    const response = await axiosClient.post('/ai/action', {
      action_id: actionId
    });
    return response.data;
  },

  // Get user long-term memories
  getMemories: async (category) => {
    const response = await axiosClient.get('/ai/memories', {
      params: { category }
    });
    return response.data;
  },

  generateAffirmation: async (category) => {
    const response = await axiosClient.post('/ai/affirmation', { category });
    return response.data;
  },

  generateSpiritualQuote: async (scripture, category, subcategory, recentQuotes = [], language = 'English', translateFromQuote = null) => {
    const response = await axiosClient.post('/ai/spiritual-quote', { scripture, category, subcategory, recentQuotes, language, translateFromQuote });
    return response.data;
  }
};

export default aiApi;

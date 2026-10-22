// src/api/i18nApi.js
import axiosClient from './axiosClient';

const i18nApi = {
  // Fetch current user's language preference
  getLanguagePreference: async () => {
    const response = await axiosClient.get('/user/language');
    return response.data;
  },

  // Save current user's language preference
  setLanguagePreference: async (languageCode, voiceEnabled) => {
    const response = await axiosClient.post('/user/language', {
      languageCode,
      voiceEnabled
    });
    return response.data;
  },

  // Generate TTS for text
  generateTts: async (text, language) => {
    const response = await axiosClient.post('/i18n/tts', {
      text,
      language
    });
    return response.data;
  },

  // Translate array of texts
  translateTexts: async (texts, targetLanguage) => {
    const response = await axiosClient.post('/i18n/translate', {
      texts,
      targetLanguage
    });
    return response.data;
  }
};

export default i18nApi;

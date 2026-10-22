/** App-wide language config — books, reels, TTS, UI */
export const languageMap = [
  { code: 'en', label: 'English', native: 'English', voice: 'en-US' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', voice: 'hi-IN' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', voice: 'mr-IN' }
];

export const DEFAULT_LANGUAGE = languageMap[0];

export const getLanguageByCode = (code) =>
  languageMap.find((l) => l.code === code) || DEFAULT_LANGUAGE;

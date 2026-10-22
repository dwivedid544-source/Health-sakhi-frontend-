import React, { createContext, useContext, useMemo } from 'react';
import { useWellnessStore } from '../store/wellnessStore';
import { t as translate } from '../data/i18n';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const language = useWellnessStore((s) => s.language);
  const setLanguage = useWellnessStore((s) => s.setLanguage);

  const value = useMemo(
    () => ({
      language,
      langCode: language?.code || 'en',
      setLanguage,
      t: (key, fallback) => {
        const result = translate(language?.code || 'en', key);
        // If result is the key itself (not found), return the fallback if provided
        return (result === key && fallback !== undefined) ? fallback : result;
      }
    }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

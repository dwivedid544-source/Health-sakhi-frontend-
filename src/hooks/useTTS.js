import { useState, useCallback, useEffect, useRef } from 'react';
import i18nApi from '../api/i18nApi';

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingTts, setIsLoadingTts] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [voices, setVoices] = useState([]);

  const audioRef = useRef(null);
  const currentTextRef = useRef('');
  const ttsCacheRef = useRef({}); // cache map: textKey -> audioUrl

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const availVoices = window.speechSynthesis.getVoices() || [];
      setVoices(availVoices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const isFemaleVoice = (voice) => {
    if (!voice || !voice.name) return false;
    const nameLower = voice.name.toLowerCase();
    const femaleKeywords = [
      'zira', 'female', 'heera', 'swara', 'kalpana', 'samantha', 'victoria',
      'karen', 'aria', 'jenny', 'hazel', 'susan', 'google us english',
      'google uk english female', 'google हिन्दी', 'anjali', 'veena', 'neerja', 'kyoko'
    ];
    const maleKeywords = [
      'david', 'mark', 'george', 'ravi', 'guy', 'stefan', 'male',
      'google uk english male', 'richard', 'james'
    ];

    const hasFemaleKw = femaleKeywords.some(kw => nameLower.includes(kw));
    const hasMaleKw = maleKeywords.some(kw => nameLower.includes(kw));

    if (hasFemaleKw) return true;
    if (!hasMaleKw) return true;
    return false;
  };

  const findBestVoice = useCallback((langCode, text = '') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return { voice: null, code: langCode || 'en-US' };

    const available = voices.length > 0 ? voices : (window.speechSynthesis.getVoices() || []);
    const target = (langCode || 'en-US').toLowerCase();
    const targetPrefix = target.split('-')[0];
    const isMarathi = target.includes('mr') || /[\u0900-\u097F]/.test(text);

    const matchingLangVoices = available.filter(v => {
      const vLang = (v.lang || '').toLowerCase();
      return vLang === target || vLang.replace('_', '-').startsWith(targetPrefix);
    });

    if (matchingLangVoices.length > 0) {
      const femaleMatch = matchingLangVoices.find(v => isFemaleVoice(v));
      if (femaleMatch) {
        return { voice: femaleMatch, code: femaleMatch.lang };
      }
      return { voice: matchingLangVoices[0], code: matchingLangVoices[0].lang };
    }

    if (isMarathi || target.includes('mr')) {
      const hindiVoices = available.filter(v => {
        const vLang = (v.lang || '').toLowerCase();
        return vLang.includes('hi') || v.name.toLowerCase().includes('hindi');
      });
      if (hindiVoices.length > 0) {
        const femaleHindi = hindiVoices.find(v => isFemaleVoice(v)) || hindiVoices[0];
        return { voice: femaleHindi, code: femaleHindi.lang };
      }
    }

    const indianVoices = available.filter(v => (v.lang || '').toLowerCase().includes('in'));
    if (indianVoices.length > 0) {
      const femaleIndian = indianVoices.find(v => isFemaleVoice(v)) || indianVoices[0];
      return { voice: femaleIndian, code: femaleIndian.lang };
    }

    const englishVoices = available.filter(v => (v.lang || '').toLowerCase().startsWith('en'));
    if (englishVoices.length > 0) {
      const femaleEng = englishVoices.find(v => isFemaleVoice(v)) || englishVoices[0];
      return { voice: femaleEng, code: femaleEng.lang };
    }

    return { voice: null, code: langCode || 'en-US' };
  }, [voices]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const speak = useCallback(async (text, langCode = 'en') => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) return;
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return;

    const normalizedLang = (langCode || 'en').toLowerCase().split('-')[0];

    // Case 1: Same text and we have loaded audio -> Play or Resume it
    if (currentTextRef.current === cleanText && audioRef.current) {
      setIsPlaying(true);
      setIsPaused(false);
      audioRef.current.play().catch(err => {
        console.error('Audio resume failed:', err);
        setIsPlaying(false);
        setIsPaused(true);
      });
      return;
    }

    // Case 2: New text -> stop current and load/fetch new TTS
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    currentTextRef.current = cleanText;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    setDuration(0);

    const cacheKey = `${normalizedLang}_${cleanText}`;
    let cachedUrl = ttsCacheRef.current[cacheKey];

    if (cachedUrl) {
      playAudioUrl(cachedUrl, cleanText, normalizedLang);
      return;
    }

    try {
      setIsLoadingTts(true);
      const res = await i18nApi.generateTts(cleanText, normalizedLang);
      setIsLoadingTts(false);
      if (res && res.audioUrl) {
        ttsCacheRef.current[cacheKey] = res.audioUrl;
        playAudioUrl(res.audioUrl, cleanText, normalizedLang);
        return;
      }
    } catch (err) {
      setIsLoadingTts(false);
      console.warn('Backend ElevenLabs TTS generation error, using browser TTS fallback:', err);
    }

    // Fallback to Browser SpeechSynthesis
    fallbackBrowserSpeak(cleanText, normalizedLang);
  }, [stop, findBestVoice]);

  const playAudioUrl = (audioUrl, cleanText, normalizedLang) => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      fallbackBrowserSpeak(cleanText, normalizedLang);
    };

    setIsPlaying(true);
    setIsPaused(false);
    audio.play().catch(err => {
      console.error('Audio play failed:', err);
      setIsPlaying(false);
      setIsPaused(true);
    });
  };

  const fallbackBrowserSpeak = (cleanText, langCode) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const { voice, code } = findBestVoice(langCode, cleanText);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = code || langCode || 'en-US';
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisError:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return { 
    speak, 
    stop, 
    pause,
    seek,
    isPlaying, 
    isPaused, 
    isLoadingTts, 
    currentTime, 
    duration 
  };
};

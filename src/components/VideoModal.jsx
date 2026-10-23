import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const VIDEO_URLS = {
  en: "https://ik.imagekit.io/1udyzgff6/health-sakhi-english%20.mp4",
  hi: "https://ik.imagekit.io/jcohpdmi8/health-sakhi%20(1).mp4",
  mr: "https://ik.imagekit.io/xzmohzonk/WhatsApp%20Video%202026-07-08%20at%205.32.19%20PM.mp4"
};

const VideoModal = ({ isOpen, onClose, videoSrc }) => {
  const { langCode } = useLanguage();
  const getInitialLang = (code) => {
    if (code === 'hi') return 'hi';
    if (code === 'mr') return 'mr';
    return 'en';
  };
  const [selectedLang, setSelectedLang] = useState(getInitialLang(langCode));
  const videoRef = useRef(null);
  const [restoreTime, setRestoreTime] = useState(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  // Sync state with global language when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLang(getInitialLang(langCode));
    }
  }, [isOpen, langCode]);

  const handleLanguageChange = (lang) => {
    if (lang === selectedLang) return;

    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      const paused = videoRef.current.paused;

      setRestoreTime(time);
      setShouldPlay(!paused);
    }

    setSelectedLang(lang);
  };

  const handleLoadedMetadata = () => {
    if (restoreTime !== null && videoRef.current) {
      videoRef.current.currentTime = restoreTime;
      setRestoreTime(null);

      if (shouldPlay) {
        videoRef.current.play().catch(err => {
          console.log("Auto-play interrupted after switch", err);
        });
      }
    }
  };

  const activeVideoSrc = VIDEO_URLS[selectedLang] || videoSrc;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-[#2D1B3D]/95 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(233,30,99,0.3)] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Watermark/Branding Badge */}
            <div className="absolute top-6 left-6 z-20 hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#E91E63] animate-pulse"></span>
              <span className="text-white/90 font-serif italic text-xs tracking-wider font-extrabold uppercase">
                HealthSakhi Demo
              </span>
            </div>

            {/* Header Controls Overlay */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${selectedLang === 'en'
                    ? 'bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] text-white shadow-[0_0_15px_rgba(233,30,99,0.5)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${selectedLang === 'hi'
                    ? 'bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] text-white shadow-[0_0_15px_rgba(233,30,99,0.5)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => handleLanguageChange('mr')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${selectedLang === 'mr'
                    ? 'bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] text-white shadow-[0_0_15px_rgba(233,30,99,0.5)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  मराठी
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#E91E63] transition-all border border-white/10 group shadow-lg"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {activeVideoSrc ? (
              <video
                ref={videoRef}
                src={activeVideoSrc}
                controls
                autoPlay
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full object-contain"
              />
            ) : (
              /* Coming Soon Content */
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#4B1E5A] to-[#2D1B3D] text-center p-8">
                <div className="w-20 h-20 rounded-full bg-[#E91E63]/10 flex items-center justify-center mb-6 animate-pulse">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E91E63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-white mb-4">
                  Video is <span className="text-[#E91E63]">Coming Soon</span>
                </h2>
                <p className="text-white/60 text-lg max-w-md font-medium leading-relaxed">
                  We are currently crafting a special experience for you. Stay tuned as we prepare to unveil our wellness journey!
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;

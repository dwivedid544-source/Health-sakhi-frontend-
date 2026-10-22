import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Send, ArrowUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const CHIPS = [
  { text: '🌸 Track my period', prompt: 'I want to track my period or check my cycle details.' },
  { text: '🥗 Healthy diet', prompt: 'Tell me about a healthy diet plan for women wellness.' },
  { text: '🧘 Reduce stress', prompt: 'What are some good meditation and breathing exercises to reduce stress?' },
  { text: '💖 Relationship advice', prompt: 'I need some advice on nurturing family and relationships.' },
  { text: '💰 Home budget', prompt: 'How do I organize and save on my home budget?' },
  { text: '📖 Spiritual guidance', prompt: 'Guide me with some mindfulness and spiritual guidance.' },
  { text: '💄 Grooming', prompt: 'What are some natural and home-based grooming and beauty tips?' },
  { text: '📚 Book recommendation', prompt: 'Recommend some inspiring books from the Sakhi library.' }
];

const FloatingAIBar = () => {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { t, langCode } = useLanguage();
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  // Speech Recognition integration
  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langCode === 'hi' ? 'hi-IN' : langCode === 'mr' ? 'mr-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Submit action: Navigate to AI Sakhi screen with initial message state
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const finalPrompt = prompt.trim();
    if (!finalPrompt) return;

    navigate('/app/ai-sakhi', {
      state: { initialMessage: finalPrompt }
    });
    setPrompt('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-grow textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  // Gentle glow animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2500);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed bottom-6 left-0 right-0 z-[999] flex flex-col items-center gap-3 w-full max-w-[720px] mx-auto px-4 md:px-6"
    >
      {/* Horizontal Suggested Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar w-full px-2 py-1 scroll-smooth justify-start md:justify-center mask-image">
        {CHIPS.map((chip, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setPrompt(chip.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-rose-100/50 shadow-sm text-[10px] font-black text-[#5C4550] hover:text-[#ff69b4] hover:bg-rose-50/50 hover:border-pink-200/50 transition-all shrink-0 select-none cursor-pointer"
          >
            {chip.text}
          </motion.button>
        ))}
      </div>

      {/* Pill AI Command Bar Container */}
      <div 
        className="w-full bg-white/85 backdrop-blur-[18px] border border-pink-200/35 shadow-[0_20px_60px_rgba(236,72,153,0.12)] rounded-3xl md:rounded-full px-4 md:px-5 py-2.5 flex items-center gap-3 transition-all hover:scale-[1.008] hover:shadow-[0_25px_70px_rgba(236,72,153,0.18)]"
        style={{
          boxShadow: '0 20px 60px rgba(236,72,153,0.12), inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        {/* Left Side: Animated AI Orb */}
        <div className="relative flex items-center justify-center shrink-0">
          <motion.div
            animate={{ 
              scale: isListening ? [1, 1.25, 1] : [1, 1.12, 1], 
              opacity: isListening ? [0.4, 0.8, 0.4] : [0.25, 0.5, 0.25] 
            }}
            transition={{ duration: isListening ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute inset-0 rounded-full blur-md ${isListening ? 'bg-red-400' : 'bg-gradient-to-r from-[#ff69b4] to-[#8b5cf6]'}`}
          />
          <div 
            className={`relative w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 transition-all ${isListening ? 'bg-red-500 scale-105' : ''}`}
            style={{ 
              background: isListening ? undefined : 'linear-gradient(135deg, #ff69b4, #8b5cf6)' 
            }}
          >
            {isListening ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Sparkles size={16} className="animate-pulse" />
            )}
          </div>
        </div>

        {/* Center: Autogrow Textarea prompt input */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening... Speak now 🎙️" : "Ask AI Sakhi anything about health, wellness, periods..."}
            className="w-full bg-transparent text-slate-800 text-xs md:text-sm font-semibold focus:outline-none placeholder:text-[#C4A0AC] resize-none overflow-y-auto no-scrollbar py-1"
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mic Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={handleMicClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-50 text-red-500 shadow-md shadow-red-200' 
                : 'bg-rose-50 text-[#ff69b4] hover:bg-rose-100/70 hover:shadow-md hover:shadow-pink-100'
            }`}
          >
            <Mic size={16} className={isListening ? "animate-pulse" : ""} />
          </motion.button>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md transition-all ${
              prompt.trim() 
                ? 'bg-gradient-to-r from-[#ff69b4] to-[#ff8da1] opacity-100 hover:shadow-lg hover:shadow-pink-200 cursor-pointer' 
                : 'bg-slate-100 text-slate-300 opacity-60 cursor-not-allowed'
            }`}
          >
            <ArrowUp size={16} strokeWidth={3} />
          </motion.button>
        </div>
      </div>

      {/* Tiny Personality / Status Footer */}
      <div className="flex items-center gap-1.5 select-none mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
        <span className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]/80">
          {showNotification ? "💖 Your wellness companion" : "✨ AI Sakhi is online"}
        </span>
      </div>
    </motion.div>
  );
};

export default FloatingAIBar;

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Mic, Sparkles, Loader2, Play, BookOpen, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useWellnessStore } from '../store/wellnessStore';
import aiApi from '../api/aiApi';

const AIChatPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const { t, langCode } = useLanguage();
  const sakhiMode = useWellnessStore((s) => s.sakhiMode || 'women');

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLoading && !isTyping && !isListening) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [messages.length, isLoading, isTyping, isListening]);

  // Parse markdown links inside messages to clickable routes
  const parseMessageText = (text) => {
    if (typeof text !== 'string') return text;
    const regex = /\[([^\]]+)\]\s*\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const linkText = match[1];
      const linkUrl = match[2];
      const isVideoLink = linkUrl.includes('reels') || linkUrl.includes('video') || linkUrl.includes('youtube') || linkUrl.includes('meditation');
      
      parts.push(
        <button
          key={match.index}
          onClick={() => {
            navigate(linkUrl);
            if (onClose) onClose();
          }}
          className="text-[#ff69b4] hover:underline font-black inline-flex items-center gap-1 mx-1 px-2 py-0.5 bg-rose-50/70 rounded-lg border border-rose-100/50 cursor-pointer align-baseline text-left font-sans text-xs transition-all hover:bg-rose-100 active:scale-95"
        >
          {linkText}{' '}
          {isVideoLink ? (
            <Play size={10} className="inline text-[#ff69b4] fill-current" />
          ) : (
            <BookOpen size={10} className="inline text-[#ff69b4]" />
          )}
        </button>
      );
      
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Initialize and load chat session
  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch user's previous sessions
      const res = await aiApi.getSessions();
      if (res.success && res.sessions && res.sessions.length > 0) {
        // Load the most recent session
        const activeSessionId = res.sessions[0].id;
        setSessionId(activeSessionId);
        await loadMessages(activeSessionId);
      } else {
        // Create new session if none exists
        await handleNewSession();
      }
    } catch (err) {
      console.error('Error initializing floating chat:', err);
      setError('Could not load chat companion');
    } finally {
      setIsLoading(false);
    }
  };

  // Load message history for a specific session
  const loadMessages = async (sId) => {
    try {
      const msgRes = await aiApi.getMessages(sId);
      if (msgRes.success && msgRes.messages) {
        const mapped = msgRes.messages.map((m) => ({
          id: m.id,
          role: m.role === 'assistant' ? 'sakhi' : 'user',
          text: m.message,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(mapped);
      }
    } catch (err) {
      console.error('Error loading session messages:', err);
      setError('Failed to fetch conversation history');
    }
  };

  // Start new session
  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const title = `Sakhi Session ${new Date().toLocaleDateString()}`;
      const res = await aiApi.createSession(title);
      if (res.success && res.session_id) {
        setSessionId(res.session_id);
        setMessages([
          {
            id: 'init',
            role: 'sakhi',
            text: t('aiSakhi.initialMessage', "Namaste, Meri Sakhi🌸 I'm here to listen to your heart. Tell me, how are you feeling today?"),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setError('Failed to create new conversation');
      }
    } catch (err) {
      console.error('Error starting new chat session:', err);
      setError('Network error starting conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const handleSend = async (text = null) => {
    const msgText = text || input.trim();
    if (!msgText || !sessionId) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const res = await aiApi.sendMessage(sessionId, msgText, sakhiMode);
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'sakhi',
            text: res.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Error sending floating message:', err);
      setError('Failed to send message. Please try again.');
      // Remove the last unsent message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  // Speech Recognition using Web Speech API
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
      setInput(transcript);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full w-full bg-white/85 backdrop-blur-xl border border-pink-200/40 rounded-[24px] shadow-[0_20px_50px_rgba(249,92,156,0.15)] overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between border-b border-rose-100/60 bg-gradient-to-r from-rose-50/90 via-pink-50/70 to-white backdrop-blur-md shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#F95C9C] to-[#D946EF] flex items-center justify-center text-white shadow-md shrink-0">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-black text-slate-800">💖 AI Sakhi</h2>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('aiSakhi.wellnessCompanion', 'Your Wellness Companion')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleNewSession}
            title={t('aiSakhi.startNewChat', 'New Conversation')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-[#ff69b4] hover:bg-rose-100/50 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
          <button 
            onClick={onClose}
            title={t('common.close', 'Close')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 bg-rose-100/80 hover:bg-rose-200 hover:text-rose-900 transition-all cursor-pointer shadow-2xs font-bold"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0 bg-[#FFFDFE]/40 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 className="animate-spin text-[#ff69b4]" size={28} />
            <p className="text-xs font-bold text-slate-400 animate-pulse">{t('aiSakhi.connecting', 'Connecting with Sakhi...')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-xs font-bold text-rose-500 mb-3">{error}</p>
            <button 
              onClick={initializeChat}
              className="px-4 py-2 bg-[#ff69b4] hover:bg-[#ff69b4]/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {t('aiSakhi.retry', 'Retry')}
            </button>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              >
                {msg.role === 'sakhi' && (
                  <div className="w-6 h-6 rounded-lg bg-white border border-rose-100 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Sparkles size={11} className="text-[#ff69b4]" />
                  </div>
                )}
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className={`px-4 py-2.5 text-xs font-semibold leading-relaxed shadow-sm text-left ${
                    msg.role === 'user'
                      ? 'bg-[#15192c] text-white rounded-2xl rounded-br-none'
                      : 'bg-white text-slate-800 rounded-2xl rounded-bl-none border border-rose-100/50'
                  }`}>
                    {parseMessageText(msg.text)}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#C4A0AC] mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white border border-rose-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={11} className="text-[#ff69b4]" />
                </div>
                <div className="px-4 py-2.5 bg-white/70 backdrop-blur-md rounded-2xl rounded-bl-none border border-rose-50 flex gap-1 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#ff69b4] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#ff69b4] rounded-full animate-bounce [animation-delay:0.12s]" />
                  <div className="w-1.5 h-1.5 bg-[#ff69b4] rounded-full animate-bounce [animation-delay:0.24s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Footer / Input Bar */}
      <div className="p-4 border-t border-rose-50/50 bg-white/50 backdrop-blur-md">
        <div className="relative flex items-center bg-white border border-rose-100 rounded-2xl shadow-sm pl-4 pr-2.5 py-1.5 group focus-within:border-[#ff69b4] transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening... Speak now 🎙️" : t('aiSakhi.inputPlaceholderFloating', 'Type your message...')}
            disabled={isLoading || isTyping || isListening}
            className="flex-1 bg-transparent focus:outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400 py-1"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading || isTyping}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-rose-50/50 text-[#ff69b4] hover:bg-rose-100 transition-colors'
              }`}
            >
              <Mic size={14} className={isListening ? "animate-pulse" : ""} />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || isTyping || !input.trim() || isListening}
              className="w-8 h-8 rounded-xl bg-[#ff69b4] text-white flex items-center justify-center shadow-md hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;

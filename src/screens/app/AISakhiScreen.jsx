import React, { useState, useRef, useEffect } from 'react';
import useFeatureAccess from '../../hooks/useFeatureAccess';
import LockedFeature from '../../components/subscription/LockedFeature';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  ChevronLeft,
  Mic,
  Play,
  MoreVertical,
  Plus,
  MessageSquare,
  Heart,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  BookOpen,
  UserCheck,
  RefreshCw,
  Clock,
  Trash2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWellnessStore } from '../../store/wellnessStore';
import { SAKHI_MODES } from '../../data/sakhiModes';
import aiApi from '../../api/aiApi';
import { useLanguage } from '../../context/LanguageContext';
import { getLanguageByCode } from '../../data/languages';
import i18nApi from '../../api/i18nApi';

const AISakhiScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sakhiMode = useWellnessStore((s) => s.sakhiMode);
  const setSakhiMode = useWellnessStore((s) => s.setSakhiMode);

  const parseMessageText = (text) => {
    if (typeof text !== 'string') return text;
    // Look for markdown links like [Book Title](/app/books/1) or [Video Title](/app/reels?reel=123)
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
          onClick={() => navigate(linkUrl)}
          className="text-[#ff69b4] hover:underline font-black inline-flex items-center gap-1 mx-1 px-2.5 py-1 bg-rose-50/50 rounded-xl border border-rose-100/50 cursor-pointer align-baseline text-left font-sans text-xs md:text-[13px] transition-all hover:bg-rose-100/80 active:scale-95 animate-in fade-in zoom-in-95 duration-200"
        >
          {linkText}{' '}
          {isVideoLink ? (
            <Play size={12} className="inline text-[#ff69b4] fill-current" />
          ) : (
            <BookOpen size={12} className="inline text-[#ff69b4]" />
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
  
  // Tab layout state for mobile devices: 'chat', 'history', 'insights'
  const [activeTab, setActiveTab] = useState('chat');

  // Input and Chat States
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [memories, setMemories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [escalation, setEscalation] = useState(null);
  
  // Voice & TTS states
  const { t, langCode, setLanguage } = useLanguage();
  
  const translateContentTitle = (title) => {
    const keyMap = {
      'Womens Monthly Wellness': 'content.womensMonthlyWellness',
      'Beauty Without Parlour': 'content.beautyWithoutParlour',
      'Healing Loneliness': 'content.healingLoneliness',
      'The PCOD Protocol': 'content.thePcodProtocol',
      'Science of Desire': 'content.scienceOfDesire',
      'Woman Like A Poem': 'content.womanLikeAPoem',
      'The Mystery of Hunger': 'content.mysteryOfHunger',
      'Inner Healing Guide': 'content.innerHealingGuide',
      "Potter's Secret to Parenting": 'content.pottersSecretToParenting',
      'Husbands Heart Health': 'content.husbandsHeartHealth',
      'Child Development': 'content.childDevelopment',
      'Loneliness Blessing in Disguise': 'content.lonelinessBlessingInDisguise',
      'WHEN SOUL TALK TO MIND': 'content.whenSoulTalkToMind',
      'Heart To Heart': 'content.heartToHeart',
      'Life After Shadi': 'content.lifeAfterShadi',
      'ceo of the family': 'content.ceoOfTheFamily'
    };
    const key = keyMap[title];
    return key ? t(key) : t(title, title);
  };

  const [voiceAutoplay, setVoiceAutoplay] = useState(() => localStorage.getItem('hs_voice_enabled') === 'true');
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleVoiceAutoplay = async () => {
    const nextVal = !voiceAutoplay;
    setVoiceAutoplay(nextVal);
    localStorage.setItem('hs_voice_enabled', nextVal ? 'true' : 'false');
    try {
      await i18nApi.setLanguagePreference(langCode, nextVal);
    } catch (err) {
      console.error('Failed to update voice setting:', err);
    }
  };

  const handlePlayVoice = async (msgId, text, msgLanguageCode = null) => {
    if (playingMessageId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingMessageId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      setPlayingMessageId(msgId);
      let url = null;
      const msgObj = messages.find(m => m.id === msgId);
      if (msgObj && msgObj.audioUrl) {
        url = msgObj.audioUrl;
      } else {
        const reqLang = msgLanguageCode || langCode || 'en';
        const res = await i18nApi.generateTts(text, reqLang);
        if (res && res.success && res.audioUrl) {
          url = res.audioUrl;
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, audioUrl: res.audioUrl } : m));
        }
      }

      if (url) {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => {
          setPlayingMessageId(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setPlayingMessageId(null);
          audioRef.current = null;
        };
      } else {
        setPlayingMessageId(null);
      }
    } catch (err) {
      console.error('Failed to play voice:', err);
      setPlayingMessageId(null);
    }
  };

  // Loading States
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  // Error States
  const [historyError, setHistoryError] = useState(null);
  const [memoriesError, setMemoriesError] = useState(null);
  const [chatError, setChatError] = useState(null);

  // Limit States
  const [showLimitExceeded, setShowLimitExceeded] = useState(false);

  // Collapsible panel state
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Delete confirmation state: stores the sessionId pending confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteSession = async (sid) => {
    try {
      await aiApi.deleteSession(sid);
      // If we deleted the active session, clear it
      if (sid === sessionId) {
        setSessionId(null);
        setMessages([]);
        setRecommendations([]);
        setEscalation(null);
      }
      // Refresh session list
      const sessions = await fetchHistory();
      // If sessions remain, load the first one; otherwise create new
      if (sessions && sessions.length > 0) {
        if (sid === sessionId) loadSession(sessions[0].id);
      } else if (sid === sessionId) {
        handleStartNewSession();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!loadingChat && !isTyping) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [messages.length, loadingChat, isTyping]);

  // Fetch all chat history / sessions
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      const res = await aiApi.getSessions();
      if (res.success && res.sessions) {
        setChatSessions(res.sessions);
        return res.sessions;
      } else {
        setHistoryError('Failed to fetch chat history');
        return [];
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setHistoryError('Network error while loading history');
      return [];
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch memories timeline
  const fetchMemories = async () => {
    try {
      setLoadingMemories(true);
      setMemoriesError(null);
      const res = await aiApi.getMemories();
      if (res.success && res.memories) {
        setMemories(res.memories);
      } else {
        setMemoriesError('Failed to load memories timeline');
      }
    } catch (err) {
      console.error('Error fetching memories:', err);
      setMemoriesError('Network error while loading memories');
    } finally {
      setLoadingMemories(false);
    }
  };

  // Load a specific session's messages
  const loadSession = async (sId) => {
    try {
      setLoadingChat(true);
      setChatError(null);
      setSessionId(sId);
      // Reset recommendations and escalation context for new session
      setRecommendations([]);
      setEscalation(null);

      const msgRes = await aiApi.getMessages(sId);
      if (msgRes.success && msgRes.messages) {
        const mapped = msgRes.messages.map((m) => ({
          id: m.id,
          role: m.role === 'assistant' ? 'sakhi' : 'user',
          text: m.message,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(mapped);
      } else {
        setChatError('Could not load chat messages');
      }
    } catch (err) {
      console.error('Error loading session messages:', err);
      setChatError('Network error while loading messages');
    } finally {
      setLoadingChat(false);
    }
  };

  // Start a completely new session
  const handleStartNewSession = async () => {
    try {
      setLoadingChat(true);
      const title = `Sakhi Session ${new Date().toLocaleDateString()}`;
      const res = await aiApi.createSession(title);
      if (res.success && res.session_id) {
        // Refresh session list
        await fetchHistory();
        // Set and load new session
        setSessionId(res.session_id);
        setMessages([
          {
            id: 'init',
            role: 'sakhi',
            text: t('aiSakhi.initialMessage', "Namaste, Meri Sakhi🌸 I'm here to listen to your heart. Tell me, how are you feeling today?"),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setRecommendations([]);
        setEscalation(null);
        setActiveTab('chat');
        return res.session_id;
      }
    } catch (err) {
      console.error('Error creating new session:', err);
      setChatError('Failed to create new conversation');
    } finally {
      setLoadingChat(false);
    }
  };

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      const sessions = await fetchHistory();
      fetchMemories();

      if (sessions && sessions.length > 0) {
        // Load the most recent session
        loadSession(sessions[0].id);
      } else {
        // Create a new session if none exist
        handleStartNewSession();
      }
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const initialMessage = location.state?.initialMessage || new URLSearchParams(location.search).get('msg');
    if (initialMessage && sessionId) {
      handleSend(initialMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [sessionId, location.state, location.search]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, loadingChat]);

  // Send message
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
    setChatError(null);

    try {
      const res = await aiApi.sendMessage(sessionId, msgText, sakhiMode);
      if (res.success) {
        const newMsgId = (Date.now() + 1).toString();
        // Add AI response message
        setMessages((prev) => [
          ...prev,
          {
            id: newMsgId,
            role: 'sakhi',
            text: res.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            audioUrl: res.audioUrl,
            suggestions: res.suggestions || []
          }
        ]);

        // Auto-play voice if setting is enabled and audioUrl is returned
        const isVoiceAutoplayEnabled = localStorage.getItem('hs_voice_enabled') === 'true';
        if (isVoiceAutoplayEnabled && res.audioUrl) {
          setTimeout(() => {
            handlePlayVoice(newMsgId, res.reply, res.languageCode);
          }, 300);
        }

        // Dynamically update recommendations, escalation alerts, and memories timeline live!
        if (res.recommendations) {
          setRecommendations(res.recommendations);
        }
        if (res.escalation) {
          setEscalation(res.escalation);
        } else {
          setEscalation(null);
        }
        if (res.memories_extracted && res.memories_extracted.length > 0) {
          // Refresh memories panel to display newly extracted entries
          fetchMemories();
        }
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
      if (err.response?.status === 403 || err.response?.data?.code === 'CHAT_LIMIT_EXCEEDED') {
        setShowLimitExceeded(true);
      } else {
        setChatError(err.response?.data?.message || 'Failed to send message. Please retry.');
      }
      // Remove the last message from screen if sending failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (location.state?.initialMessage && sessionId) {
      handleSend(location.state.initialMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, sessionId]);

  // Helper mapping category codes to display text and icons
  const getMemoryMeta = (category) => {
    switch (category) {
      case 'PREFERENCE':
        return { label: 'Preference', color: 'text-pink-500 bg-pink-50 border-pink-100', icon: Heart };
      case 'FAMILY':
        return { label: 'Family', color: 'text-indigo-500 bg-indigo-50 border-indigo-100', icon: Users };
      case 'RELATIONSHIP':
        return { label: 'Relationship', color: 'text-amber-500 bg-amber-50 border-amber-100', icon: SmileIconPlaceholder };
      case 'WELLNESS_GOAL':
        return { label: 'Wellness Goal', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', icon: Activity };
      case 'MEDICAL_CONDITION':
        return { label: 'Condition', color: 'text-rose-500 bg-rose-50 border-rose-100', icon: AlertTriangle };
      case 'FINANCIAL_GOAL':
        return { label: 'Financial Goal', color: 'text-teal-500 bg-teal-50 border-teal-100', icon: DollarSign };
      default:
        return { label: 'Memory', color: 'text-slate-500 bg-slate-50 border-slate-100', icon: Sparkles };
    }
  };

  const SmileIconPlaceholder = (props) => (
    <span {...props} role="img" aria-label="smile" className="text-xs font-semibold select-none leading-none">🌸</span>
  );

  // ── Feature Gate: AI Chat requires Basic or Premium ─────────────────────
  const { isLocked: aiChatLocked } = useFeatureAccess('aiChat');

  if (aiChatLocked) {
    return (
      <LockedFeature
        featureName="AI Chat Bot"
        requiredPlan="Basic Sakhi"
        description="Get 24/7 AI-powered wellness support. Upgrade to Basic or Premium plan to unlock your personal AI Sakhi chatbot."
        fullPage
      />
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] w-full flex flex-col lg:flex-row relative font-sans text-[#15192c] bg-transparent overflow-hidden">
      
      {/* ── SIDEBAR Panel: Chat History ── */}
      <div
        className={`flex-shrink-0 flex-col overflow-hidden relative z-30 border-r border-rose-50 bg-white/75 backdrop-blur-md
          ${ activeTab === 'history' ? 'flex absolute inset-0' : 'hidden' } lg:flex`}
        style={{ width: leftCollapsed ? '0px' : '288px', transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)', minWidth: 0 }}
      >
        <div className="p-4 md:p-6 border-b border-rose-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#ff69b4]" />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#15192c]">{t('aiSakhi.previousChats', 'Previous Chats')}</h3>
          </div>
          <button
            onClick={handleStartNewSession}
            title={t('aiSakhi.startNewChat', 'Start New Chat')}
            className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-[#ff69b4] flex items-center justify-center hover:bg-[#ff69b4] hover:text-white transition-all shadow-sm"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loadingHistory ? (
            // History skeletons (Task 8)
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-rose-50/50 rounded-xl animate-pulse border border-rose-50/20" />
            ))
          ) : historyError ? (
            <div className="p-4 text-center">
              <p className="text-[10px] font-black uppercase text-rose-500 tracking-wider mb-2">{historyError}</p>
              <button onClick={fetchHistory} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-[8px] font-black uppercase text-[#ff69b4] tracking-widest flex items-center gap-1.5 mx-auto">
                <RefreshCw size={10} /> Retry
              </button>
            </div>
          ) : chatSessions.length === 0 ? (
            <p className="text-center text-[10px] font-bold text-[#C4A0AC] py-8">{t('aiSakhi.noPreviousChats', 'No previous chats yet.')}</p>
          ) : (
            chatSessions.map((session) => (
              <div key={session.id} className="relative group">
                <button
                  onClick={() => {
                    loadSession(session.id);
                    setActiveTab('chat');
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all pr-9 ${
                    sessionId === session.id
                      ? 'bg-[#ff69b4] text-white border-[#ff69b4] shadow-md shadow-rose-200/50'
                      : 'bg-white/80 hover:bg-rose-50/30 text-[#15192c] border-rose-50/50'
                  }`}
                >
                  <MessageSquare size={16} className={`shrink-0 mt-0.5 ${sessionId === session.id ? 'text-white' : 'text-[#ff69b4]'}`} />
                  <div className="overflow-hidden">
                    <h4 className="text-[11px] font-black uppercase tracking-wider truncate mb-1">
                      {session.title || t('aiSakhi.defaultSessionTitle', 'Conversation')}
                    </h4>
                    <p className={`text-[8px] font-bold ${sessionId === session.id ? 'text-rose-100' : 'text-[#C4A0AC]'}`}>
                      {new Date(session.updated_at || session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>

                {/* Delete button — appears on hover */}
                {confirmDeleteId === session.id ? (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-white rounded-lg border border-rose-200 shadow-md px-1.5 py-1 z-10">
                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-wider">Delete?</span>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="px-1.5 py-0.5 bg-rose-500 text-white rounded text-[8px] font-black hover:bg-rose-600 transition-all"
                    >Yes</button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[8px] font-black hover:bg-gray-200 transition-all"
                    >No</button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(session.id); }}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg text-rose-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete conversation"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── LEFT ↔ MIDDLE Divider Handle ── */}
      <div className="hidden lg:flex flex-col items-center justify-center w-4 flex-shrink-0 z-40 relative group">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-px h-full bg-rose-100/60" />
        </div>
        <button
          onClick={() => setLeftCollapsed(v => !v)}
          title={leftCollapsed ? 'Expand History Panel' : 'Collapse History Panel'}
          className="relative z-10 w-5 h-10 rounded-full bg-white border border-rose-200 shadow-md flex items-center justify-center text-rose-400 hover:text-[#ff69b4] hover:border-[#ff69b4] hover:shadow-rose-200/60 transition-all group-hover:scale-110"
          style={{ transform: 'none' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            {leftCollapsed
              ? <polygon points="2,1 8,5 2,9" />
              : <polygon points="8,1 2,5 8,9" />}
          </svg>
        </button>
      </div>

      {/* ── MIDDLE PANEL: Active Chat (Task 3) ── */}
      <div className={`flex-1 h-full flex flex-col relative overflow-hidden ${
        activeTab === 'chat' ? 'flex' : 'hidden lg:flex'
      }`}>
        {/* Chat Header */}
        <div className="px-4 md:px-8 py-4 flex items-center justify-between border-b border-rose-50 bg-white/40 backdrop-blur-sm flex-shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="w-9 h-9 rounded-xl border border-rose-100 flex items-center justify-center text-[#15192c] bg-white shadow-sm hover:bg-rose-50 transition-all shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h2 className="text-sm font-black tracking-tight uppercase tracking-[0.1em] text-[#15192c]">{t('aiSakhi.aiSakhiChat', 'AI Sakhi Chat')}</h2>
              <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-[#ff69b4] mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#ff69b4] rounded-full animate-ping" />
                {t('aiSakhi.empatheticListening', 'Empathetic Listening')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* New Chat Button */}
            <button
              onClick={handleStartNewSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white text-[#ff69b4] border-rose-100 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-[#ff69b4] hover:text-white hover:border-[#ff69b4] transition-all"
            >
              <Plus size={12} />
              <span>{t('aiSakhi.newChat', 'New Chat')}</span>
            </button>

            {/* Desktop Autoplay Toggle Switch */}
            <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-rose-50/80">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('aiSakhi.voiceAutoplay', 'Voice Autoplay')}</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={voiceAutoplay}
                  onChange={handleToggleVoiceAutoplay}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-rose-100 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#ff69b4]/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-rose-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#ff69b4]" />
              </label>
            </div>

            {/* Quick Toggle for Mobile Panels */}
            <div className="flex lg:hidden gap-1.5">
              <button
                onClick={() => setActiveTab('history')}
                className="px-3 py-1.5 bg-white border border-rose-100 rounded-lg text-[8px] font-black uppercase tracking-wider"
              >
                {t('aiSakhi.history', 'History')}
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className="px-3 py-1.5 bg-white border border-rose-100 rounded-lg text-[8px] font-black uppercase tracking-wider"
              >
                {t('aiSakhi.insights', 'Insights')}
              </button>
            </div>
          </div>
        </div>


        {/* Chat Error Banner */}
        {chatError && (
          <div className="mx-4 md:mx-8 mt-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl text-xs font-bold flex justify-between items-center relative z-25">
            <span>{chatError}</span>
            <button onClick={() => handleSend()} className="text-[9px] font-black uppercase tracking-widest text-[#ff69b4] hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-hide custom-scrollbar relative z-0">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {loadingChat ? (
              // Chat loading state (Task 8)
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className="w-[50%] h-14 bg-rose-50/40 border border-rose-50/20 rounded-2xl animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
                >
                  {msg.role === 'sakhi' && (
                    <div className="w-8 h-8 rounded-xl bg-white border border-rose-100 flex items-center justify-center shadow-sm flex-shrink-0">
                      <Sparkles size={14} className="text-[#ff69b4]" />
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                    <div className={`px-4.5 py-3 md:py-3.5 text-xs md:text-[13px] font-semibold leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#15192c] text-white rounded-2xl rounded-br-none'
                        : 'bg-white text-[#15192c] rounded-2xl rounded-bl-none border border-rose-50'
                    }`}>
                      {parseMessageText(msg.text)}
                      {msg.role === 'sakhi' && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-rose-50/50">
                          {msg.suggestions.map((sug, sIdx) => {
                            const isBook = sug.type === 'book';
                            return (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  if (isBook) {
                                    navigate(sug.action);
                                  } else {
                                    handleSend(sug.action);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${
                                  isBook
                                    ? 'bg-[#ff69b4] text-white hover:brightness-110 shadow-sm'
                                    : 'bg-rose-50 text-[#ff69b4] border border-rose-100/50 hover:bg-rose-100/85'
                                }`}
                              >
                                {isBook ? <BookOpen size={10} /> : <span>❓</span>}
                                {sug.title}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 px-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#C4A0AC]">
                        {msg.time}
                      </span>
                      {msg.role === 'sakhi' && (
                        <button
                          onClick={() => handlePlayVoice(msg.id, msg.text)}
                          className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#ff69b4] hover:opacity-80 transition-opacity"
                        >
                          {playingMessageId === msg.id ? (
                            <>
                              <span className="w-1 h-1.5 bg-[#ff69b4] inline-block animate-pulse [animation-duration:0.5s]" />
                              <span className="w-1 h-2.5 bg-[#ff69b4] inline-block animate-pulse [animation-duration:0.3s]" />
                              <span className="w-1 h-1 bg-[#ff69b4] inline-block animate-pulse [animation-duration:0.4s]" />
                              <span className="ml-1">{t('aiSakhi.playing', 'Playing...')}</span>
                            </>
                          ) : (
                            <>
                              <span>🎧</span>
                              <span>{t('aiSakhi.playVoice', 'Play Voice')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              // Real typing indicator (Task 3 & 8)
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-rose-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-[#ff69b4]" />
                </div>
                <div className="px-5 py-3 bg-white/70 backdrop-blur-md rounded-2xl rounded-bl-none border border-rose-50 flex gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#ff69b4] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#ff69b4] rounded-full animate-bounce [animation-delay:0.12s]" />
                  <div className="w-1.5 h-1.5 bg-[#ff69b4] rounded-full animate-bounce [animation-delay:0.24s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input Floating Footer */}
        <div className="px-4 md:px-8 py-5 flex-shrink-0 border-t border-rose-50 bg-white/40 backdrop-blur-sm z-10">
          <div className="max-w-3xl mx-auto w-full space-y-4">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('aiSakhi.inputPlaceholder', 'Share your thoughts with Sakhi...')}
                disabled={loadingChat || isTyping}
                className="w-full h-14 pl-6 pr-24 bg-white border border-rose-100 rounded-2xl shadow-xl shadow-rose-100/10 focus:border-[#ff69b4] outline-none transition-all text-xs font-semibold text-[#15192c] placeholder:text-[#C4A0AC]"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  title="Voice Input"
                  className="w-9 h-9 rounded-xl bg-rose-50 text-[#ff69b4] flex items-center justify-center hover:bg-[#ff69b4] hover:text-white transition-all shrink-0"
                >
                  <Mic size={14} />
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={loadingChat || isTyping || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-[#ff69b4] text-white flex items-center justify-center shadow-lg shadow-rose-200/50 hover:scale-[1.03] active:scale-95 transition-transform shrink-0 disabled:opacity-40 disabled:scale-100"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
            <p className="text-center text-[8px] font-black uppercase tracking-[0.25em] text-[#C4A0AC]">
              🔒 {t('aiSakhi.privateCompanion', 'Private Health Companion. All chats are confidential.')}
            </p>
          </div>
        </div>
      </div>

      {/* Premium Chat Warning Modal */}
      <AnimatePresence>
        {showLimitExceeded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15192c]/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full border border-rose-100 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-rose-100/50 rounded-full blur-xl -z-10" />
              <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-pink-50 rounded-full blur-lg -z-10" />

              <div className="w-16 h-16 rounded-[1.5rem] bg-[#ff69b4]/10 border border-[#ff69b4]/20 flex items-center justify-center mx-auto mb-6 text-[#ff69b4]">
                <Sparkles size={28} className="animate-pulse" />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">
                {t('aiSakhi.dailyLimitReached', 'Daily Limit Reached')} 🌸
              </p>
              <h3 className="text-xl font-black text-[#15192c] mb-4">
                {t('aiSakhi.chatLimitExhausted', 'Chat Limit Exhausted!')}
              </h3>
              <p className="text-xs font-bold text-[#6B5E63] leading-relaxed mb-8">
                {t('aiSakhi.limitExceededDesc', 'You have used all free AI chats for today. upgrade to a premium plan for unlimited, personalized interactions with AI Sakhi!')}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLimitExceeded(false);
                    navigate('/app/plans');
                  }}
                  className="w-full py-4 bg-[#ff69b4] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-rose-200"
                >
                  {t('aiSakhi.upgradeToPremium', 'Upgrade to Premium')} ✨
                </button>
                <button
                  onClick={() => setShowLimitExceeded(false)}
                  className="w-full py-3.5 bg-rose-50 text-[#ff69b4] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 active:scale-95 transition-all"
                >
                  {t('aiSakhi.close', 'Close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F5E6EA; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes bounceShort {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-short {
          animation: bounceShort 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AISakhiScreen;

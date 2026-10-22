import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Play, BookOpen, Clock, ChevronRight, Heart, 
  Calendar, Star, ArrowRight, Activity, Smile, Frown, 
  Moon, Zap, Battery, Home, User, PlusCircle, MessageCircle,
  Apple, Droplets, Wind, ChevronLeft, CheckCircle2 as CheckIcon,
  Users, Trophy, X, Send, GraduationCap, Bell, Award
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import WellnessFlowBar from '../../components/home/WellnessFlowBar';
import EmotionalCheckInModal from '../../components/home/EmotionalCheckInModal';

import { useWellnessStore } from '../../store/wellnessStore';
import memberApi from '../../api/memberApi';
import contentAssetApi, { resolveMediaUrl } from '../../api/contentAssetApi';
import axiosClient from '../../api/axiosClient';
import i18nApi from '../../api/i18nApi';
import dailyMessagesEn from '../../data/daily_messages_100.json';
import dailyMessagesHi from '../../data/daily_messages_100_hi.json';
import dailyMessagesMr from '../../data/daily_messages_100_mr.json';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { t, langCode } = useLanguage();

  const getTranslatedAffirmation = (title, message, currentLang, dayNum) => {
    if (!message) return { title: 'Daily Affirmation', message: 'Believe in yourself, Sakhi. You are stronger than you think.' };
    if (currentLang === 'en') return { title, message };

    const targetList = currentLang === 'hi' ? dailyMessagesHi : (currentLang === 'mr' ? dailyMessagesMr : dailyMessagesEn);

    let found = dayNum ? targetList.find(m => m.day === dayNum) : null;
    if (!found && title) {
      const enMatch = dailyMessagesEn.find(m => m.title.toLowerCase() === title.toLowerCase());
      if (enMatch) {
        found = targetList.find(m => m.day === enMatch.day);
      }
    }

    if (found) {
      return { title: found.title, message: found.message };
    }

    if (currentLang === 'hi') {
      let hiTitle = title;
      let hiMessage = message;

      if (title === 'Your Peace Is Sacred' || message.includes('protect your peace')) {
        hiTitle = 'आपकी शांति पवित्र है';
        hiMessage = 'प्रिय बहन, अपनी मानसिक शांति की रक्षा वैसे ही करें जैसे आप अपने अपनों की करती हैं। आज किसी भी बहस, ज़्यादा सोचने और नकारात्मकता को पूरी तरह अलविदा कहें। ढेर सारे प्यार और स्नेह के साथ, आपकी हेल्थसखी ❤️';
      } else if (title === 'Your Pain Is Real' || message.includes('hide your pain')) {
        hiTitle = 'आपका दर्द सच्चा है';
        hiMessage = 'प्रिय बहन, आपको कभी भी अपना दर्द छुपाने या सब कुछ ठीक होने का नाटक करने की ज़रूरत नहीं है। जो आप महसूस करती हैं वह सच्चा है, और आपका दिल आराम, समझ और कोमल उपचार का हकदार है। ढेर सारे प्यार और स्नेह के साथ, आपकी हेल्थसखी ❤️';
      } else {
        hiMessage = hiMessage
          .replace(/^Dear Sister,/i, 'प्रिय बहन,')
          .replace(/With lots of love and affection, Your HealthSakhi ❤️/i, 'ढेर सारे प्यार और स्नेह के साथ, आपकी हेल्थसखी ❤️');
      }

      return { title: hiTitle, message: hiMessage };
    }

    if (currentLang === 'mr') {
      let mrTitle = title;
      let mrMessage = message;

      if (title === 'Your Peace Is Sacred' || message.includes('protect your peace')) {
        mrTitle = 'तुमची शांतता पवित्र आहे';
        mrMessage = 'प्रिय बहिणी, जशी तू तुझ्या प्रियजनांची काळजी घेतेस, तशीच आज तुझ्या मनाच्या शांततेचेही रक्षण कर. आज कोणत्याही प्रकारचा ताण, अतिविचार आणि नकारात्मकतेला पूर्णपणे नकार दे. खूप खूप प्रेम आणि आपुलकीसह, तुझी हेल्थसखी ❤️';
      } else if (title === 'Your Pain Is Real' || message.includes('hide your pain')) {
        mrTitle = 'तुमचे दुःखाचे भाव खरे आहेत';
        mrMessage = 'प्रिय बहिणी, तुला कधीही तुझे दुःख लपवण्याची किंवा सर्व काही ठीक असल्याचे भासवण्याची गरज नाही. तुला जे जाणवते ते खरे आहे, आणि तुझे हृदय आराम, समज आणि हळूवार उपचारास पात्र आहे. खूप खूप प्रेम आणि आपुलकीसह, तुझी हेल्थसखी ❤️';
      } else {
        mrMessage = mrMessage
          .replace(/^Dear Sister,/i, 'प्रिय बहिणी,')
          .replace(/With lots of love and affection, Your HealthSakhi ❤️/i, 'खूप खूप प्रेम आणि आपुलकीसह, तुझी हेल्थसखी ❤️');
      }

      return { title: mrTitle, message: mrMessage };
    }
    return { title, message };
  };

  const formatGreetingName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return t('home.sakhi', 'Sakhi');
    if (fullName.toLowerCase() === 'member' || fullName.toLowerCase() === 'user') {
      return t('login.member', 'Member');
    }
    return fullName;
  };
  
  const cleanTranslatedText = (str, fallback) => {
    if (!str || typeof str !== 'string') return fallback;
    let text = str.trim();
    if (text.includes('विचार') || text.includes('भाषांतर') || text.includes('हवे आहे') || text.includes('आवश्यक आहे')) {
      const match = text.match(/["'«»](.*?)["'«»]/);
      if (match && match[1] && match[1].trim().length > 0 && match[1].trim().length <= 50) {
        return match[1].trim();
      }
      return fallback;
    }
    if (text.length > 80) {
      return text.substring(0, 77) + '...';
    }
    return text;
  };

  const translateContentTitle = (title) => {
    if (!title || typeof title !== 'string') return '';
    let cleaned = title;
    if (cleaned.includes('विचार') || cleaned.includes('भाषांतर') || cleaned.includes('हवे आहे')) {
      const match = cleaned.match(/["'«»](.*?)["'«»]/);
      if (match && match[1] && match[1].trim().length > 0 && match[1].trim().length <= 50) {
        cleaned = match[1].trim();
      }
    }
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
    const key = keyMap[cleaned];
    const val = key ? t(key) : t(cleaned, cleaned);
    if (val && typeof val === 'string' && (val.includes('विचार') || val.includes('भाषांतर'))) {
      const match = val.match(/["'«»](.*?)["'«»]/);
      if (match && match[1]) return match[1].trim();
    }
    return val;
  };

  const setLastMood = useWellnessStore((s) => s.setLastMood);
  const lastCheckInDate = useWellnessStore((s) => s.lastCheckInDate);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic state integrations
  const [advisors, setAdvisors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const notificationsDropdownRef = useRef(null);
  const booksScrollRef = useRef(null);

  const scrollBooks = (direction) => {
    if (booksScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      booksScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await memberApi.markAllNotificationsRead();
      if (res && (res.success || res.message)) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadNotificationsCount(0);
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profRes, dashRes, advisorsRes, apptsRes, notifsRes] = await Promise.all([
          memberApi.getProfile(),
          memberApi.getDashboard(),
          axiosClient.get('/advisors').catch(err => { console.error('Failed to load advisors:', err); return { data: { advisors: [] } }; }),
          axiosClient.get('/appointments').catch(() => ({ data: { appointments: [] } })),
          memberApi.getNotifications().catch(() => ({ success: false, notifications: [] }))
        ]);
        if (profRes.success) setProfile(profRes.profile);
        if (dashRes.success) setDashboardData(dashRes.dashboard);
        
        const advs = advisorsRes.data?.advisors || advisorsRes.data || [];
        setAdvisors(advs);
        
        const appts = apptsRes.data?.appointments || apptsRes.data || [];
        setAppointments(appts);

        const notifs = notifsRes.notifications || notifsRes.data || [];
        setNotifications(notifs);
        setUnreadNotificationsCount(notifs.filter(n => !n.isRead).length);
      } catch (err) {
        console.error("Error fetching home screen data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch dynamic books list
  useEffect(() => {
    const loadBooks = async () => {
      let booksData = [];
      try {
        const res = await contentAssetApi.getPublicAssets({ type: 'Book', status: 'Published' });
        if (res && res.success && res.data && res.data.length > 0) {
          const rawAssets = res.data;
          const normalizeKey = (str) => {
            if (!str) return '';
            const slug = str.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '');
            return slug || 'book-asset';
          };

          // Group assets by groupKey to eliminate duplicate cards for multi-language versions
          const groups = {};
          rawAssets.forEach(b => {
            const key = (b.groupKey && b.groupKey.trim() !== '') ? b.groupKey.trim() : normalizeKey(b.title);
            if (!groups[key]) groups[key] = [];
            groups[key].push(b);
          });

          // Pick 1 best representative variant per groupKey matching langCode & collect all available languages
          const uniqueAssets = Object.values(groups).map(groupVariants => {
            const matchedLang = groupVariants.find(v => 
              (v.languageCode && langCode && v.languageCode.toLowerCase() === langCode.toLowerCase()) || 
              (v.language && v.language.toLowerCase().includes(langCode.toLowerCase()))
            );
            const englishLang = groupVariants.find(v => 
              v.languageCode === 'en' || (v.language && v.language.toLowerCase().includes('english'))
            );
            return matchedLang || englishLang || groupVariants[0];
          });

          booksData = uniqueAssets.map(b => {
            const desc = b.description || '';
            const parts = desc.split('[hs_cover]');
            const cleanDesc = parts[0] ? parts[0].trim() : '';
            const coverUrl = parts[1] ? parts[1].split('[hs_chapters]')[0].trim() : null;
            return {
              id: b.id,
              groupKey: b.groupKey,
              title: b.title,
              category: b.category,
              description: cleanDesc,
              coverUrl: coverUrl,
              mediaUrl: resolveMediaUrl(b.mediaUrl),
              isAdminBook: true
            };
          });

          if (booksData.length > 0 && langCode !== 'en') {
            try {
              const textsToTranslate = [];
              booksData.forEach(b => {
                textsToTranslate.push(b.title);
                textsToTranslate.push(b.description || '');
              });
              const transRes = await i18nApi.translateTexts(textsToTranslate, langCode);
              if (transRes && transRes.success && transRes.translations) {
                let tIdx = 0;
                booksData = booksData.map(b => {
                  const translatedTitle = transRes.translations[tIdx++];
                  const translatedDesc = transRes.translations[tIdx++];
                  return {
                    ...b,
                    title: cleanTranslatedText(translatedTitle, b.title),
                    description: cleanTranslatedText(translatedDesc, b.description)
                  };
                });
              }
            } catch (transErr) {
              console.error('Failed to translate admin books on HomeScreen:', transErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load admin books:', err);
      }

      // Fetch dynamic baseline books list
      let baselineBooks = [];
      try {
        const res = await fetch('/books/books_list.json');
        if (res.ok) {
          baselineBooks = await res.json();
        }
      } catch (err) {
        console.error('Failed to load baseline books list:', err);
      }

      // Load custom books from localStorage
      let customBooks = [];
      try {
        const saved = localStorage.getItem('hs_custom_books');
        if (saved) {
          customBooks = JSON.parse(saved).filter(cb => cb.title && (cb.image || cb.coverUrl) && cb.status === 'Published');
        }
      } catch (err) {
        console.error('Failed to load custom books:', err);
      }

      const combined = [...booksData, ...customBooks, ...baselineBooks];
      
      // Deduplicate by title to prevent duplicate cards
      const unique = [];
      const seen = new Set();
      combined.forEach(b => {
        if (!seen.has(b.title)) {
          seen.add(b.title);
          unique.push(b);
        }
      });
      setLibraryBooks(unique);
    };
    loadBooks();
  }, [t, langCode]);

  // Automatic check-in popup disabled on login
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodNotes, setMoodNotes] = useState('');
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [catStartIndex, setCatStartIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStep, setBridgeStep] = useState(0);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const moods = [
    { icon: Smile, label: 'Happy',      color: '#CCAA3D', bg: '#FFF9EE', question: "What made you smile today, Meri Sakhi? ✨", suggestions: ['Achievement', 'Good Food', 'Nature', 'Friends'] },
    { icon: Frown, label: 'Sad',        color: '#9079C1', bg: '#F5F1FE', question: "I'm here for you. Want to talk about what's bothering you? 🌸", suggestions: ['Loneliness', 'Conflict', 'Unknown', 'Health'] },
    { icon: Moon,  label: 'Tired',      color: '#64748B', bg: '#F1F5F9', question: "You've worked hard. What drained your energy today? 🌙", suggestions: ['Work', 'Lack of Sleep', 'Socializing', 'Physical'] },
    { icon: Zap,   label: 'Stressed',   color: '#D17B88', bg: '#FDEEF1', question: "Let's breathe together. What's weighing on your mind? 🌿", suggestions: ['Deadlines', 'Family', 'Finance', 'Overthinking'] },
    { icon: Heart, label: 'Grateful',   color: '#059669', bg: '#ECFDF5', question: "The universe is kind. What are you thankful for? 🙏", suggestions: ['Support', 'Small Wins', 'Self Love', 'Life'] },
    { icon: Battery, label: 'Low Energy', color: '#D97706', bg: '#FFF7ED', question: "Your light is just dim, not gone. How are you feeling? 🔋", suggestions: ['Body Pain', 'Emotional', 'Recovery', 'Hunger'] },
  ];

  const categories = [
    { name: 'Women Health', icon: User, color: '#ff69b4', bg: '#FFF1F2' },
    { name: 'Heart Care', icon: Heart, color: '#ef4444', bg: '#FEF2F2' },
    { name: 'Mental Healing', icon: Sparkles, color: '#8b5cf6', bg: '#F5F3FF' },
    { name: 'Relationships', icon: MessageCircle, color: '#ec4899', bg: '#FDF2F8' },
    { name: 'Cravings', icon: Apple, color: '#10b981', bg: '#ECFDF5' },
  ];

  const [continueItems, setContinueItems] = useState([
    { title: 'The Mystery of Hunger', type: 'Video', progress: 65, duration: '15 min' },
    { title: 'Inner Healing Guide',   type: 'Book',  progress: 30, duration: '45 pgs' },
  ]);

  React.useEffect(() => {
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const completedBooks = JSON.parse(localStorage.getItem('completedBooks') || '[]');
    
    // Book titles mapping
    const bookTitles = {
      1: 'Womens Monthly Wellness',
      2: 'Beauty Without Parlour',
      3: 'Healing Loneliness',
      4: 'The PCOD Protocol',
      5: 'Science of Desire',
      6: 'Woman Like A Poem'
    };

    const dynamicItems = [];
    
    // Add real book progress
    Object.entries(userProgress).forEach(([id, data]) => {
      if (bookTitles[id]) {
        const progress = parseInt(data.percent);
        dynamicItems.push({
          title: bookTitles[id],
          type: 'Book',
          progress: isNaN(progress) ? 0 : progress,
          duration: 'Interactive'
        });
      }
    });

    // If no progress found, keep some defaults but marked appropriately
    if (dynamicItems.length > 0) {
      // Add a default video if no real video progress tracking yet
      dynamicItems.push({ title: 'The Mystery of Hunger', type: 'Video', progress: 65, duration: '15 min' });
      setContinueItems(dynamicItems.slice(0, 3)); // Show top 3
    }
  }, []);

  const [mySessions, setMySessions] = useState([]);

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('hs_booked_sessions') || '[]');
    setMySessions(saved);
  }, []);

  const [customVideos, setCustomVideos] = useState([]);

  React.useEffect(() => {
    const loadApiVideos = async () => {
      try {
        const res = await contentAssetApi.getPublicAssets({ type: 'Video', status: 'Published' });
        if (res && res.success && res.data && res.data.length > 0) {
          setCustomVideos(res.data.map(v => ({
            title: v.title,
            duration: 'Custom',
            tag: v.category,
            views: 'New',
            mediaUrl: v.mediaUrl,
            isCustom: true
          })));
          return;
        }
      } catch (err) {
        console.error('HomeScreen: Failed to load videos from API', err);
      }
      // Fallback to localStorage
      const saved = localStorage.getItem('hs_custom_content');
      if (saved) {
        const custom = JSON.parse(saved).filter(item => item.type === 'Video' && item.status === 'Published');
        setCustomVideos(custom.map(v => ({
          title: v.title,
          duration: 'Custom',
          tag: v.cat,
          views: 'New',
          mediaUrl: v.mediaUrl,
          isCustom: true
        })));
      }
    };
    loadApiVideos();
  }, []);

  const allVideos = [
    ...customVideos,
    { title: 'PCOD & Hormones: Understanding Your Cycle', duration: '18 min', tag: 'Women Health', views: '12.4k' },
    { title: 'Heart Health: Daily Habits for a Stronger You', duration: '25 min', tag: 'Heart Care', views: '5.1k' },
    { title: 'Anxiety Relief: 10 Min Meditation', duration: '10 min', tag: 'Mental Healing', views: '20.2k' },
    { title: 'Building Healthy Boundaries in Love', duration: '15 min', tag: 'Relationships', views: '9.3k' },
    { title: 'Emotional Eating — Heal From Within', duration: '22 min', tag: 'Cravings', views: '8.2k' },
    { title: 'Pregnancy Care: First Trimester Guide', duration: '30 min', tag: 'Women Health', views: '14.8k' },
    { title: 'Stress Management: The Breathing Technique', duration: '12 min', tag: 'Mental Healing', views: '15.1k' },
  ];

  const featuredVideos = selectedCategory 
    ? allVideos.filter(v => v.tag === selectedCategory)
    : allVideos;

  const handleMoodClick = (mood) => {
    setSelectedMood(mood);
    setShowMoodModal(true);
  };

  const submitMoodPulse = async () => {
    if (!selectedMood) return;
    setIsSubmittingMood(true);
    try {
      await memberApi.logMood({
        mood_type: selectedMood.label,
        intensity: 5,
        notes: moodNotes
      });
      setLastMood(selectedMood.label);
      setShowMoodModal(false);
      setMoodNotes('');
      // Refetch dashboard to get updated recent mood / affirmation
      const dashRes = await memberApi.getDashboard();
      if (dashRes.success) setDashboardData(dashRes.dashboard);
      
      navigate(`/app/mood/${selectedMood.label.toLowerCase()}`);
    } catch (err) {
      console.error("Error logging mood:", err);
    } finally {
      setIsSubmittingMood(false);
    }
  };

  const handleOpenBridge = () => {
    setIsBridging(true);
    setBridgeStep(0);
    
    setTimeout(() => setBridgeStep(1), 1000); // Syncing Wellness Nodes...
    setTimeout(() => setBridgeStep(2), 2200); // Establishing Neural Link...
    setTimeout(() => setBridgeStep(3), 3200); // Bridge Connected 🌸
    setTimeout(() => {
      setIsBridging(false);
      navigate('/app/ai-sakhi');
    }, 4200);
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
    
    // Sync with Deep Processing (Continue Journey)
    const newItem = { 
      title: video.title, 
      type: 'Video', 
      progress: 5, // Start with 5%
      duration: video.duration 
    };

    setContinueItems(prev => {
      const exists = prev.find(p => p.title === video.title);
      if (exists) return prev;
      return [newItem, ...prev].slice(0, 3);
    });

    // Save to localStorage
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    userProgress[video.title] = { percent: 5, type: 'Video' };
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  };

  const upcomingAppt = appointments
    .filter(a => a.status === 'scheduled' || a.status === 'pending')
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const getUpcomingCardDetails = () => {
    if (upcomingAppt) {
      const advName = upcomingAppt.advisor || upcomingAppt.participantName || 'Sakhi Advisor';
      const formattedDate = new Date(upcomingAppt.date).toLocaleDateString(langCode === 'hi' ? 'hi-IN' : langCode === 'mr' ? 'mr-IN' : 'en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        timeZone: 'UTC'
      });
      return {
        title: `Consultation with ${advName}`,
        time: `${formattedDate}, ${upcomingAppt.start_time}`
      };
    }
    
    // Fallback advisor
    if (advisors && advisors.length > 0) {
      return {
        title: `Book with ${advisors[0].name}`,
        time: t('home.noActiveSessions', 'No active sessions. Click to book! ✨')
      };
    }

    return {
      title: t('home.bookSupportSession', 'Book Support Session'),
      time: t('home.noActiveSessions', 'No active sessions. Click to book! ✨')
    };
  };

  const upcomingCard = getUpcomingCardDetails();

  const displayBooks = libraryBooks.map((book, idx) => {
    // Dynamically assign style options
    const styles = [
      { icon: BookOpen, color: '#ff69b4', bg: '#FDEEF1', gradient: 'from-[#ff69b4] to-[#ff8da1]' },
      { icon: Activity, color: '#8b5cf6', bg: '#F5F3FF', gradient: 'from-[#8b5cf6] to-[#a78bfa]' },
      { icon: Sparkles, color: '#10b981', bg: '#ECFDF5', gradient: 'from-[#10b981] to-[#34d399]' },
      { icon: Heart, color: '#ef4444', bg: '#FEF2F2', gradient: 'from-[#ef4444] to-[#f87171]' },
      { icon: Battery, color: '#3b82f6', bg: '#EFF6FF', gradient: 'from-[#3b82f6] to-[#60a5fa]' }
    ];
    const style = styles[idx % styles.length];
    
    // Resolve cover image
    let coverUrl = book.image || book.coverUrl;
    if (!coverUrl) {
      // Fallback defaults for standard book covers
      if (book.id === 1 || book.title.includes('Wellness') || book.title.includes('women')) {
        coverUrl = '/Images/final cover - womens monthly wellness guide.png';
      } else if (book.id === 2 || book.title.includes('Beauty') || book.title.includes('parlour')) {
        coverUrl = '/Images/final cover beauty without parlour.png';
      } else if (book.id === 3 || book.title.includes('Loneliness') || book.title.includes('lonely')) {
        coverUrl = '/Images/final cover loneliness.png';
      } else if (book.id === 4 || book.title.includes('PCOD') || book.title.includes('pcod')) {
        coverUrl = '/Images/final pcod book cover.png';
      } else if (book.id === 5 || book.title.includes('Desire') || book.title.includes('desire')) {
        coverUrl = '/Images/final science of desire.png';
      } else {
        coverUrl = '/Images/logo.png'; // default fallback
      }
    }
    
    return {
      ...book,
      icon: style.icon,
      color: style.color,
      bg: style.bg,
      gradient: style.gradient,
      image: coverUrl
    };
  });

  const handleBookClick = (book) => {
    if (typeof book.id === 'number' && book.id <= 6) {
      navigate(`/app/books/${book.id}`);
    } else {
      navigate('/app/books');
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-[#F0F7FF] pb-12 w-full max-w-7xl mx-auto"
    >
      {/* Header */}
      {/* Header with Stats Cards */}
      <header className="pt-8 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-[#15192c] tracking-tight">
              {t('home.hello', 'Hello')}, {formatGreetingName(profile?.full_name)} <span className="text-[#ff69b4]">🌸</span>
            </h1>
            {(() => {
              const planName = profile?.subscription?.plan_name || profile?.plan_badge || 'Free Sakhi';
              const planLower = planName.toLowerCase();
              const isBasic = planLower.includes('basic');
              const isPremium = (planLower.includes('premium') || planLower.includes('pro') || planLower.includes('elite') || planLower.includes('partner')) && !planLower.includes('free');
              return (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isPremium
                    ? 'bg-gradient-to-r from-amber-100 via-pink-100 to-rose-100 text-pink-700 border-pink-200 shadow-xs'
                    : isBasic
                    ? 'bg-gradient-to-r from-rose-50 to-pink-100 text-[#ff69b4] border-rose-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200' 
                }`}>
                  {isPremium ? '👑 Premium Sakhi' : isBasic ? '⚡ Basic Sakhi' : '🌸 Free Sakhi'}
                </span>
              );
            })()}
          </div>
          <p className="text-xs font-bold text-[#C4A0AC] uppercase tracking-widest mt-1">{t('home.subtitle', 'FAMILY WELLNESS JOURNEY')}</p>
        </div>

        {/* Stats Cards: Streak, Badges, Master Status & Notifications */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Streak Card */}
          <div 
            onClick={() => navigate('/app/rewards')}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-rose-100/60 shadow-xs flex items-center gap-2.5 cursor-pointer hover:border-rose-300 hover:shadow-md transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 font-black text-sm">
              🔥
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('home.streak', 'Streak')}</p>
              <p className="text-xs font-black text-[#15192c]">{dashboardData?.streak_count ?? 0} {t('home.days', 'Days')} 🔥</p>
            </div>
          </div>

          {/* Badges Card */}
          <div 
            onClick={() => navigate('/app/rewards')}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-rose-100/60 shadow-xs flex items-center gap-2.5 cursor-pointer hover:border-rose-300 hover:shadow-md transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Award size={16} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('home.badges', 'Badges')}</p>
              <p className="text-xs font-black text-[#15192c]">{dashboardData?.badges?.formatted || '00 / 4'}</p>
            </div>
          </div>

          {/* Master Status Card */}
          <div 
            onClick={() => navigate('/app/rewards')}
            className="bg-gradient-to-r from-purple-900 to-[#15192c] text-white px-4 py-2 rounded-2xl shadow-xs flex items-center gap-2.5 cursor-pointer hover:brightness-110 transition-all border border-purple-800/40"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-purple-200">{t('home.level', 'Level')}</p>
              <p className="text-xs font-black text-white">{dashboardData?.badges?.is_master ? t('home.masterAchieved', 'Master Achieved 🎉') : `${t('home.statusAt', 'Status at')} ${dashboardData?.badges?.unlocked || 0}/${dashboardData?.badges?.master_status_target || 4}`}</p>
            </div>
          </div>

          {/* Notification bell removed */}
        </div>
      </header>

      {/* Missed Days Alert Banner */}
      {dashboardData?.missed_days > 0 && (
        <motion.div variants={item} className="px-6 mb-6">
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 font-bold text-lg">
                🔥
              </div>
              <div>
                <p className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  Sakhi, you missed {dashboardData.missed_days} {dashboardData.missed_days === 1 ? 'day' : 'days'}!
                </p>
                <p className="text-[10px] font-semibold text-amber-800/80">
                  Let's get back on track and keep your streak alive today!
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/app/rewards')}
              className="px-3.5 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-amber-600 transition-all shadow-xs"
            >
              View Streak
            </button>
          </div>
        </motion.div>
      )}

      {/* Top Section: Daily Affirmation */}
      <div className="px-6 mb-8">
        <motion.div variants={item} className="w-full">
          <div className="bg-gradient-to-r from-[#15192c] to-[#2a3052] rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-lg flex flex-col justify-center group hover:shadow-xl transition-all min-h-[140px]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-rose-500/20 transition-all duration-500" />
            <div className="relative z-10 flex flex-col gap-2.5">
               {(() => {
                 const currentTitle = dashboardData?.daily_affirmation_title || 'Your Pain Is Real';
                 const currentMsg = dashboardData?.daily_affirmation || 'Dear Sister, you never need to hide your pain or pretend everything is fine. What you feel is real, and your heart deserves comfort, understanding, and gentle healing. With lots of love and affection, Your HealthSakhi ❤️';
                 const dayNum = dashboardData?.daily_affirmation_day || 12;
                 const { title: displayTitle, message: displayMsg } = getTranslatedAffirmation(currentTitle, currentMsg, langCode, dayNum);
                 const dayBadge = langCode === 'hi' ? `दिन ${dayNum} / 100 🌸` : langCode === 'mr' ? `दिवस ${dayNum} / 100 🌸` : `DAY ${dayNum} OF 100 🌸`;
                 return (
                   <>
                     <div className="flex items-center justify-between flex-wrap gap-2">
                       <div className="flex items-center gap-2 text-[#ff69b4]">
                         <Sparkles size={16} className="animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest">
                           {displayTitle}
                         </span>
                       </div>
                     </div>
                     <p className="text-white font-serif italic text-base md:text-lg lg:text-xl leading-relaxed mt-1">
                       "{displayMsg}"
                     </p>
                   </>
                 );
               })()}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Explore Wellness Library - Smooth Horizontal Carousel */}
      <motion.div variants={item} className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-[#15192c] uppercase tracking-widest">{t('home.exploreWellnessLibrary', 'Explore Wellness Library')}</h3>
            {dashboardData?.completed_books_count > 0 && (
              <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-100 text-[#ff69b4] text-[9px] font-black uppercase rounded-full tracking-wider">
                📖 {dashboardData.completed_books_count} Book Read
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => scrollBooks('left')}
                title="Scroll Left"
                className="w-8 h-8 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-[#15192c] hover:bg-rose-50 transition-colors shadow-xs"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollBooks('right')}
                title="Scroll Right"
                className="w-8 h-8 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-[#15192c] hover:bg-rose-50 transition-colors shadow-xs"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button onClick={() => navigate('/app/books')} className="text-[10px] font-black text-[#ff69b4] uppercase tracking-widest hover:underline transition-all ml-2">{t('home.viewLibrary', 'View Library')}</button>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marqueeBooksHome {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .home-books-marquee-container {
            display: flex;
            gap: 1.25rem;
            width: max-content;
            animation: marqueeBooksHome 40s linear infinite;
          }
          .home-books-marquee-container:hover {
            animation-play-state: paused;
          }
        `}} />

        <div 
          ref={booksScrollRef}
          className="w-full overflow-x-auto no-scrollbar pb-6 relative"
        >
          {displayBooks.length === 0 ? (
            <div className="flex gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[260px] md:min-w-[300px] bg-white rounded-[2.5rem] p-6 border border-rose-50 h-72 animate-pulse flex flex-col justify-between shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl" />
                    <div className="w-16 h-20 bg-rose-50 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-rose-50 rounded w-3/4" />
                    <div className="h-3 bg-rose-50 rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-rose-50 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="home-books-marquee-container py-2">
              {[...displayBooks, ...displayBooks].map((book, idx) => {
                const userProgress = (dashboardData?.user_book_progress || []).find(p => p.content_id === book.id) ||
                  JSON.parse(localStorage.getItem('hs_book_rewards') || '[]').find(r => r.bookId === book.id);
                const isCompleted = userProgress?.completed || !!userProgress?.earnedAt;

                return (
                  <motion.div
                    key={`${book.id}-${idx}`}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBookClick(book)}
                    className="min-w-[260px] md:min-w-[300px] bg-white rounded-[2.5rem] shadow-sm border border-rose-50 cursor-pointer group relative overflow-hidden flex flex-col h-72 transition-all hover:shadow-xl hover:shadow-rose-100/50 shrink-0"
                  >
                    {/* Cover Image Background */}
                    <div className="absolute inset-0 z-0">
                      <img src={book.image} alt="" className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                    </div>
                    
                    <div className="relative z-10 p-6 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-sm`} style={{ background: book.bg }}>
                          <book.icon size={22} style={{ color: book.color }} />
                        </div>
                        <div className="relative">
                          <div className="w-16 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white rotate-6 group-hover:rotate-0 transition-transform duration-500 bg-slate-50 flex items-center justify-center">
                            <img src={book.image} alt={t('dashboard.books.' + book.title, book.title)} className="max-w-full max-h-full object-contain rounded-lg" />
                          </div>
                          <span className={`absolute -bottom-2 -left-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border shadow-xs ${
                            isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {isCompleted ? '✓ Read' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="text-[#15192c] font-black text-base md:text-lg leading-tight group-hover:text-[#ff69b4] transition-colors mb-2 pr-4 line-clamp-2 max-h-12 overflow-hidden break-words">{translateContentTitle(book.title)}</h4>
                      <p className="text-[10px] font-bold text-[#9A8A8E] uppercase tracking-wider">{t('content.expertGuidedReads', 'Expert Guided Reads')}</p>

                      <div className="flex items-center justify-between mt-auto pt-4 relative z-10 border-t border-rose-50/50">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[1,2].map(i => (
                              <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-rose-50 overflow-hidden">
                                <img src={`https://i.pravatar.cc/150?u=${(typeof book.id === 'string' ? 3 : book.id) + i}`} alt="user" className="w-full h-full object-cover grayscale opacity-70" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[9px] font-bold text-[#C4A0AC]">{isCompleted ? '1 Book Read' : '120+ Read'}</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full bg-[#15192c] text-[#ffffff] flex items-center justify-center group-hover:bg-[#ff69b4] group-hover:translate-x-1 transition-all duration-300`}>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Buttons Section - Quick Access */}
      <motion.div variants={item} className="px-6 mb-8">
        <h3 className="text-sm font-black text-[#15192c] uppercase tracking-widest mb-4">
          {t('home.quickAccess', 'Quick Access')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: t('nav.aiChatBot', 'AI Sakhi Chat'), icon: Sparkles, color: '#ff69b4', bg: '#FFF1F2', path: '/app/ai-sakhi' },
            { name: t('nav.homeBudgetSakhi', 'Home Budget'), icon: Activity, color: '#3b82f6', bg: '#EFF6FF', path: '/app/budget' },
            { name: t('nav.todoList', 'To-Do List'), icon: CheckIcon, color: '#f59e0b', bg: '#FEF3C7', path: '/app/todo' },
            { name: t('nav.conversationSakhi', 'Community Sakhis'), icon: MessageCircle, color: '#ec4899', bg: '#FDF2F8', path: '/app/community' },
          ].map((btn, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(btn.path)}
              className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-rose-50 flex flex-col items-center justify-center text-center gap-3 group hover:shadow-md hover:border-rose-100 transition-all cursor-pointer min-h-[110px]"
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm"
                style={{ background: btn.bg }}
              >
                <btn.icon size={22} style={{ color: btn.color }} />
              </div>
              <span className="text-[11px] font-black text-[#2D1520] tracking-tight leading-tight group-hover:text-[#ff69b4] transition-colors">
                {btn.name}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <EmotionalCheckInModal open={showCheckIn} onClose={() => setShowCheckIn(false)} />



      {/* ── Mood Interaction Modal ── */}
      <AnimatePresence>
        {showMoodModal && selectedMood && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMoodModal(false)} className="absolute inset-0 bg-[#15192c]/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="w-full max-w-lg bg-white rounded-[3rem] p-10 relative z-10 shadow-2xl overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <button onClick={() => setShowMoodModal(false)} className="absolute top-8 right-8 text-[#C4A0AC] hover:text-[#15192c] transition-colors"><X size={20} /></button>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner"
                    style={{ background: selectedMood.bg }}
                  >
                    <selectedMood.icon size={40} style={{ color: selectedMood.color }} />
                  </div>
                  <h3 className="text-2xl font-black text-[#15192c] tracking-tight">{t('home.mood.question.' + selectedMood.label, selectedMood.question)}</h3>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {selectedMood.suggestions.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setMoodNotes(prev => prev ? prev + ', ' + t('home.mood.suggestion.' + s, s) : t('home.mood.suggestion.' + s, s))}
                      className="px-6 py-3 bg-rose-50/50 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#15192c] hover:bg-[#ff69b4] hover:text-white transition-all shadow-sm"
                    >
                      {t('home.mood.suggestion.' + s, s)}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea 
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    placeholder={t('home.tellSakhiMore', 'Tell Sakhi more...')} 
                    className="w-full h-32 p-6 bg-rose-50/30 border border-rose-100 rounded-3xl text-sm font-medium outline-none focus:border-[#ff69b4] transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={submitMoodPulse}
                  disabled={isSubmittingMood}
                  className="w-full py-5 bg-[#ff69b4] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-100/50 flex items-center justify-center gap-2"
                >
                  {isSubmittingMood ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>{t('home.logMoodPulse', 'Log Mood Pulse')} <Send size={14} /></>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* ── AI Bridge Modal ── */}
      <AnimatePresence>
        {isBridging && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#15192c]/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }} 
              className="relative z-10 flex flex-col items-center justify-center text-center max-w-md w-full"
            >
              <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
                 {/* Outer rings */}
                 <motion.div 
                   animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 rounded-full border border-[#ff69b4]/30 border-t-[#ff69b4] border-b-[#ff69b4]" 
                 />
                 <motion.div 
                   animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-4 rounded-full border border-white/20 border-l-white border-r-white" 
                 />
                 
                 {/* Core glow */}
                 <motion.div 
                   animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }} 
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-10 bg-[#ff69b4] rounded-full blur-xl" 
                 />
                 
                 {/* Icon */}
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(255,105,180,0.8)]">
                    <Sparkles size={32} className="text-[#ff69b4]" />
                 </div>
              </div>

              <div className="h-20 flex items-center justify-center">
                 <AnimatePresence mode="wait">
                    {bridgeStep === 0 && (
                      <motion.h2 key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg">{t('home.initiatingAiBridge', 'Initiating AI Bridge...')}</motion.h2>
                    )}
                    {bridgeStep === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg">{t('home.syncingWellnessNodes', 'Syncing Wellness Nodes')}</h2>
                        <span className="text-[#ff69b4] animate-pulse block text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mt-3 drop-shadow-md">{t('home.connectingToHealthCore', 'Connecting to Health Core')}</span>
                      </motion.div>
                    )}
                    {bridgeStep === 2 && (
                      <motion.h2 key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-2xl md:text-3xl font-black text-[#ff69b4] tracking-tight drop-shadow-lg">{t('home.establishingNeuralLink', 'Establishing Neural Link...')}</motion.h2>
                    )}
                    {bridgeStep === 3 && (
                      <motion.h2 key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{t('home.bridgeConnected', 'Bridge Connected')} 🌸</motion.h2>
                    )}
                 </AnimatePresence>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-[240px] h-1 bg-white/10 rounded-full mt-12 overflow-hidden mx-auto relative">
                 <motion.div 
                   initial={{ width: '0%' }}
                   animate={{ width: bridgeStep === 0 ? '25%' : bridgeStep === 1 ? '50%' : bridgeStep === 2 ? '85%' : '100%' }}
                   transition={{ duration: 0.8, ease: "easeInOut" }}
                   className="absolute top-0 left-0 h-full bg-[#ff69b4] rounded-full shadow-[0_0_10px_#ff69b4]"
                 />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* ── Video Player Modal ── */}
      <AnimatePresence>
        {showVideoModal && selectedVideo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVideoModal(false)} className="absolute inset-0 bg-[#15192c]/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-5xl bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
              
              {/* Video Player Area */}
              <div className="flex-[1.5] bg-black relative group min-h-[300px] md:min-h-0">
                <video 
                  key={selectedVideo.title}
                  className="w-full h-full object-cover"
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  controls
                >
                  <source src={selectedVideo.mediaUrl || "https://vjs.zencdn.net/v/oceans.mp4"} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-8 left-8 text-white z-10">
                   <span className="px-3 py-1 bg-[#ff69b4] rounded-lg text-[9px] font-black uppercase tracking-widest mb-2 inline-block shadow-lg">{t('books.categories.' + selectedVideo.tag, selectedVideo.tag)}</span>
                   <h3 className="text-xl md:text-2xl font-black drop-shadow-md">{t('dashboard.books.' + selectedVideo.title, selectedVideo.title)}</h3>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="w-full md:w-96 bg-white p-6 md:p-10 flex flex-col justify-between border-l border-rose-50 overflow-y-auto custom-scrollbar">
                 <div className="space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('home.contentDetail', 'Content Detail')}</h4>
                       <button onClick={() => setShowVideoModal(false)} className="text-[#C4A0AC] hover:text-[#15192c] transition-colors"><X size={20} /></button>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-xs font-bold text-[#15192c] leading-relaxed italic">"{t('home.videoSessionPrompt', "Sakhi, this session is designed to help you align with your body's natural rhythm.")}"</p>
                       <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3 text-[#C4A0AC]">
                             <Clock size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">{selectedVideo.duration} {t('home.sessionLabel', 'Session')}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[#ff69b4]">
                             <Sparkles size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">+{t('home.potentialCoins', 'Potential Coins')}</span>
                          </div>
                       </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                       <p className="text-[10px] font-bold text-[#15192c] mb-2 uppercase tracking-widest">{t('home.keyTakeaways', 'Key Takeaways')}</p>
                       <ul className="space-y-2">
                          {['Mindful Breathing', 'Hormonal Balance', 'Self-Awareness'].map(tKey => (
                            <li key={tKey} className="flex items-center gap-2 text-[9px] font-bold text-[#9A8A8E]">
                               <div className="w-1 h-1 rounded-full bg-[#ff69b4]" /> {t('home.takeaway.' + tKey.replace(/ /g, '_').toLowerCase(), tKey)}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>

                 <button 
                   onClick={() => setShowVideoModal(false)}
                   className="w-full py-4 bg-[#15192c] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff69b4] transition-all shadow-xl mt-8"
                 >
                    {t('home.markAsCompleted', 'Mark as Completed')}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default HomeScreen;

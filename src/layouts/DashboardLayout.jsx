import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Heart, LogOut, Menu, X, Bell, ChevronRight, Search,
  Home, PlayCircle, BookOpen, MessageSquare, Calendar, User, Sparkles,
  LayoutDashboard, Clock, DollarSign, Users, Video, UserPlus, CreditCard,
  BarChart2, ShieldCheck, Zap, Info as InfoIcon, CheckCircle2 as CheckIcon, AlertCircle,
  Link as LinkIcon, Image as ImageIcon, ChevronDown, GraduationCap, Award, Film, Lightbulb, Shield, Eye, Share2,
  Play, Activity, Trophy, Star, Moon, Lock, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getLanguageByCode } from '../data/languages';
import { useAuth } from '../context/AuthContext';
import i18nApi from '../api/i18nApi';
import { getPlanTierFromBadge } from '../hooks/useFeatureAccess';
import memberApi from '../api/memberApi';

const ROLE_CONFIG = {
  member: {
    label: 'My Wellness',
    i18nLabelKey: 'nav.memberLabel',
    basePath: '/app',
    navItems: [
      { name: 'Home', icon: Home, path: '/app', i18nKey: 'nav.home' },
      { name: 'Books', icon: BookOpen, path: '/app/books', i18nKey: 'nav.books' },
      { name: 'Community Sakhis', icon: Users, path: '/app/community', i18nKey: 'nav.community' },
      { name: 'Wellness Certificate', icon: Award, path: '/app/wellness-certificate', i18nKey: 'nav.wellnessCertificate' },
      { name: 'Partner Sakhi', icon: Share2, path: '/app/partner-sakhi', i18nKey: 'nav.partnerSakhi' },
      { name: 'Ask Health Sakhi', icon: MessageSquare, path: '/app/ask-health-sakhi', i18nKey: 'nav.askHealthSakhi' },
      { name: 'FAQ & Help', icon: HelpCircle, path: '/app/faq', i18nKey: 'nav.faq' },
    ],
    subNavItems: [
      { name: 'Sakhi Diary', icon: BookOpen, path: '/app/diary', i18nKey: 'nav.sakhiDiary' },
      { name: 'AI Chat Bot', icon: Sparkles, path: '/app/ai-sakhi', i18nKey: 'nav.aiChatBot' },
      { name: 'To-Do List', icon: CheckIcon, path: '/app/todo', i18nKey: 'nav.todoList' },
      { name: 'Home Budget Sakhi', icon: DollarSign, path: '/app/finance', i18nKey: 'nav.homeBudgetSakhi' },
      { name: 'Mental Health', icon: Heart, path: '/app/mental-health', i18nKey: 'nav.mentalHealth' },
      { name: 'Period Tracker', icon: Calendar, path: '/app/period', i18nKey: 'nav.period' },
    ],

    userName: ' HealthSakhi Priya',
    sidebarBg: 'bg-[#15192c]',
    sidebarActive: 'bg-[#ff69b4]',
    avatarBg: 'FDEEF1',
    userSubtitle: 'Wellness Member',
    i18nSubtitleKey: 'nav.memberSubtitle',
  },
  admin: {
    label: 'Admin Console',
    i18nLabelKey: 'nav.adminLabel',
    basePath: '/admin',
    userName: 'Admin User',
    userSubtitle: 'System Administrator',
    i18nSubtitleKey: 'nav.adminSubtitle',
    avatarBg: 'FDEEF1',
    accentClass: 'bg-[#15192c]',
    sidebarBg: 'bg-slate-900',
    sidebarActive: 'bg-[#15192c]',
    navItems: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin', i18nKey: 'nav.dashboard' },
      { name: 'Member Management', icon: Users, path: '/admin/users', i18nKey: 'nav.memberMgmt' },
      { name: 'Books Management', icon: BookOpen, path: '/admin/content', i18nKey: 'nav.contentMgmt' },
      { name: 'Plan Management', icon: ShieldCheck, path: '/admin/plans', i18nKey: 'nav.planMgmt' },
      { name: 'Community Management', icon: MessageSquare, path: '/admin/community', i18nKey: 'nav.communityMgmt' },
      { name: 'Payments', icon: CreditCard, path: '/admin/payments', i18nKey: 'nav.payments' },
      { name: 'Analytics', icon: BarChart2, path: '/admin/analytics', i18nKey: 'nav.analytics' },
      { name: 'Messages', icon: MessageSquare, path: '/admin/messages', i18nKey: 'nav.messages' },
      // { name: 'Landing Page CMS', icon: ImageIcon, path: '/admin/landing-page', i18nKey: 'nav.landingPageCms' },
    ],
  },
  partner: {
    label: 'Partner Dashboard',
    i18nLabelKey: 'nav.partnerLabel',
    basePath: '/affiliate',
    userName: 'Sakhi Partner',
    userSubtitle: 'Growth Affiliate',
    i18nSubtitleKey: 'nav.partnerSubtitle',
    avatarBg: 'FDEEF1',
    navItems: [
      { name: 'Home', icon: LayoutDashboard, path: '/affiliate', i18nKey: 'nav.home' },
      { name: 'Get Links', icon: LinkIcon, path: '/affiliate/links', i18nKey: 'nav.getLinks' },
      { name: 'My Earnings', icon: DollarSign, path: '/affiliate/earnings', i18nKey: 'nav.myEarnings' },
    ],
  },
};

// ─── Website Navbar (for Members) ─────────────────────────────────────────────
const NAV_I18N = {
  '/app': 'nav.home',
  '/app/books': 'nav.books',
  '/app/period': 'nav.period',
  '/app/todo': 'nav.todoList',
  '/app/mental-health': 'nav.mentalHealth',
  '/app/wellness': 'nav.wellnessSimple',
  '/app/community': 'nav.conversationSakhi',
  '/app/ai-sakhi': 'nav.aiChatBot',
  '/app/meditation': 'nav.meditationSakhi',
  '/app/affirmation': 'nav.affirmations',
  '/app/sessions': 'nav.bookSession',
  '/app/budget': 'nav.homeBudgetSakhi',
  '/app/wealth': 'nav.wealthSakhi',
  '/app/love': 'nav.loveSakhi',
  '/app/grooming': 'nav.groomingSakhi',
  '/app/spiritual': 'nav.spiritualSakhi',
  '/app/ask-health-sakhi': 'nav.askHealthSakhi'
};

const MemberNavbar = ({ config, isActive }) => {
  const { user, logout } = useAuth();
  const displayName = user?.fullName || config.userName;
  const userEmail = (user?.email || '').toLowerCase();
  const userBadge = (user?.planBadge || '').toLowerCase();
  
  let storedPlan = '';
  try {
    const stored = sessionStorage.getItem('hs_current_member');
    if (stored) {
      const parsed = JSON.parse(stored);
      storedPlan = (parsed?.plan || '').toLowerCase();
    }
  } catch (e) {}

  // Use the central plan tier utility
  const planBadgeFull = userBadge || storedPlan;
  const planTier = getPlanTierFromBadge(planBadgeFull);
  const isFreePlan = planTier === 'free';
  const isBasicPlan = planTier === 'basic';
  const isPremiumUser = planTier === 'premium';

  // Items that are always visible but with a lock indicator if locked
  // Partner Sakhi: Premium only — show to all but with lock badge for non-premium
  const visibleNavItems = config.navItems; // Show all nav items (locked ones show with lock badge)

  // Which items are locked per tier?
  const isNavItemLocked = (itemPath) => {
    if (itemPath === '/app/partner-sakhi' || itemPath === '/affiliate') {
      return !isPremiumUser; // locked for free and basic
    }
    if (itemPath === '/app/wellness-certificate' || itemPath === '/app/ask-health-sakhi') {
      return isFreePlan; // locked for free only, unlocked for basic & premium
    }
    return false;
  };

  const { t, langCode, setLanguage } = useLanguage();
  const handleLanguageChange = async (code) => {
    setLanguage(getLanguageByCode(code));
    try {
      const isVoiceEnabled = localStorage.getItem('hs_voice_enabled') === 'true';
      await i18nApi.setLanguagePreference(code, isVoiceEnabled);
    } catch (err) {
      console.error('Failed to sync language preference with backend:', err);
    }
  };
  const navLabel = (item) => (item.i18nKey ? t(item.i18nKey) : (NAV_I18N[item.path] ? t(NAV_I18N[item.path]) : item.name));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWellnessDropdown, setShowWellnessDropdown] = useState(false);
  const [isMobileWellnessOpen, setIsMobileWellnessOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);

  const handleLogout = async () => {
    // Dispatch custom event so BookScreen can intercept if feedback is pending
    window.dispatchEvent(new Event('hs_logout_requested'));
    // Short delay to allow BookScreen to set hs_feedback_pending if needed
    await new Promise(res => setTimeout(res, 80));
    if (sessionStorage.getItem('hs_feedback_pending') === 'true') {
      // BookScreen will handle navigation after feedback
      return;
    }
    if (location.pathname.startsWith('/affiliate')) {
      navigate('/app');
      return;
    }
    await logout();
    navigate('/login');
  };

  // Calculate dynamic balance
  const calculateBalance = () => {
    const saved = localStorage.getItem('hs_reward_balance');
    const bookRewards = JSON.parse(localStorage.getItem('hs_book_rewards') || '[]');
    const bookRewardPoints = bookRewards.reduce((sum, r) => sum + (r.points || 0), 0);
    const redemptions = JSON.parse(localStorage.getItem('hs_redemptions') || '[]');
    const spent = redemptions.reduce((sum, r) => sum + (r.points || 0), 0);
    const calculated = Math.max(0, bookRewardPoints - spent);

    if (saved !== null && !isNaN(parseInt(saved, 10))) {
      return Math.max(parseInt(saved, 10), calculated);
    }
    return calculated;
  };

  const [headerStreak, setHeaderStreak] = useState(35);
  const [headerStages, setHeaderStages] = useState('02 / 4');

  useEffect(() => {
    // Initial load
    setCoins(calculateBalance());

    const fetchHeaderMetrics = async () => {
      try {
        const res = await memberApi.getDashboard();
        if (res && res.success && res.dashboard) {
          const streakVal = res.dashboard.streak_count || 0;
          const badgesCount = res.dashboard.badges?.unlocked || 0;

          setHeaderStreak(streakVal);
          setHeaderStages(`${String(badgesCount).padStart(2, '0')} / 4`);
        }
      } catch (e) {
        console.error("Failed to fetch header metrics:", e);
      }
    };
    if (config.basePath === '/app') fetchHeaderMetrics();

    // Listen for custom balance update event (same tab)
    const handleBalanceUpdate = () => {
      setCoins(calculateBalance());
      if (config.basePath === '/app') fetchHeaderMetrics();
    };

    // Listen for storage changes (other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'hs_book_rewards' || e.key === 'hs_reward_balance') setCoins(calculateBalance());
    };

    window.addEventListener('hs_balance_update', handleBalanceUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('hs_balance_update', handleBalanceUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await memberApi.getNotifications();
      if (res && res.success && res.notifications) {
        const alerts = res.notifications.filter(n => n.type !== 'member_reply');
        setNotifications(alerts);
        setUnreadCount(alerts.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await memberApi.markAllNotificationsRead();
      if (res && res.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await memberApi.markNotificationRead(notif.id);
        fetchNotifications();
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    setShowNotifications(false);

    const titleLower = (notif.title || '').toLowerCase();
    const msgLower = (notif.message || '').toLowerCase();

    // 1. Community Messages -> Go to Community Forum
    if (
      titleLower.includes('community') || titleLower.includes('message in') || titleLower.includes('anonymous') || titleLower.includes('room') ||
      msgLower.includes('community') || msgLower.includes('message in') || msgLower.includes('anonymous') || msgLower.includes('room')
    ) {
      navigate('/app/community');
      return;
    }

    // 2. New Book Uploaded -> Go to Books library
    if (
      titleLower.includes('book') || titleLower.includes('पुस्तक') ||
      msgLower.includes('book') || msgLower.includes('पुस्तक')
    ) {
      navigate('/app/books');
      return;
    }

    // 3. FAQ / Help -> Go to FAQ screen
    if (
      titleLower.includes('faq') || titleLower.includes('help') || titleLower.includes('प्रश्न') ||
      msgLower.includes('faq') || msgLower.includes('help') || msgLower.includes('प्रश्न')
    ) {
      navigate('/app/faq');
      return;
    }

    // 4. Default Fallback -> Ask HealthSakhi (Support Chat)
    navigate('/app/ask-health-sakhi');
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return t('dashboard.justNow', 'Just now');
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWellnessDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <style>{`
        @keyframes hover-shimmer {
          0% {
            transform: translateX(-150%) skewX(-25deg);
          }
          100% {
            transform: translateX(150%) skewX(-25deg);
          }
        }
        .shiny-btn {
          position: relative;
          overflow: hidden;
        }
        .shiny-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-150%) skewX(-25deg);
          pointer-events: none;
        }
        .shiny-btn:hover::after {
          animation: hover-shimmer 1.2s ease-in-out infinite;
        }
      `}</style>
      <nav className="h-20 bg-white/80 backdrop-blur-md border-b w-full relative z-[100]" style={{ borderColor: '#F5E6EA' }}>
        <div className="w-full h-full flex items-center justify-between px-3 sm:px-4 lg:px-5 xl:px-8">
          <Link to={config.basePath} className="flex items-center gap-2 xl:gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-xs bg-white border border-rose-100 shrink-0">
              <img src="/Images/logo.png" alt="HealthSakhi Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-base xl:text-lg hidden min-[1480px]:block" style={{ color: '#15192c' }}>HealthSakhi</span>
          </Link>

          <div className="hidden lg:flex items-center justify-center flex-1 mx-1 lg:mx-2 xl:mx-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-center gap-1 min-[1250px]:gap-1.5 min-[1440px]:gap-2 min-w-max py-1 px-1">
              {visibleNavItems.map((item) => {
                if (item.isDropdown) {
                  const isDropdownActive = showWellnessDropdown || item.items.some(sub => isActive(sub.path));
                  return (
                    <div key={item.name} className="relative group" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowWellnessDropdown(!showWellnessDropdown)}
                        className={`flex items-center gap-1.5 px-2 min-[1250px]:px-2.5 min-[1440px]:px-3 py-1.5 rounded-xl text-[11px] min-[1350px]:text-[11.5px] min-[1480px]:text-[12px] font-bold transition-all duration-200 relative whitespace-nowrap shrink-0 hover:bg-pink-50/70 hover:text-[#E91E63] ${
                          isDropdownActive
                            ? 'text-[#E91E63] bg-pink-50/90 border border-pink-200/90 shadow-xs'
                            : 'text-[#4A3B43] border border-transparent'
                        }`}
                      >
                        {item.icon && (
                          <item.icon
                            size={15}
                            strokeWidth={isDropdownActive ? 2.3 : 1.9}
                            className={`shrink-0 transition-colors ${isDropdownActive ? 'text-[#E91E63]' : 'text-[#7A6872]'}`}
                          />
                        )}
                        <span>{t(item.i18nKey, item.name)}</span>
                        <ChevronDown size={13} className={`transition-transform duration-200 ${showWellnessDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showWellnessDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-rose-50 p-2 z-[200]"
                          >
                            {item.items.map(sub => {
                              const isSubActive = isActive(sub.path);
                              return (
                                <button
                                  key={sub.path}
                                  onClick={() => {
                                    navigate(sub.path);
                                    setShowWellnessDropdown(false);
                                  }}
                                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[12px] xl:text-[13px] font-bold transition-all duration-200 hover:bg-rose-50 text-left hover:scale-[1.02] ${
                                    isSubActive ? 'text-[#E91E63]' : 'text-[#7A6872] hover:text-[#E91E63]'
                                  }`}
                                >
                                  <sub.icon size={16} />
                                  {navLabel(sub)}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                const isItemActive = isActive(item.path);
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-1.5 px-2 min-[1250px]:px-2.5 min-[1440px]:px-3 py-1.5 rounded-xl text-[11px] min-[1350px]:text-[11.5px] min-[1480px]:text-[12px] font-bold transition-all duration-200 relative whitespace-nowrap shrink-0 hover:bg-pink-50/70 hover:text-[#E91E63] ${
                      isItemActive
                        ? 'text-[#E91E63] bg-pink-50/90 border border-pink-200/90 shadow-xs'
                        : 'text-[#4A3B43] border border-transparent'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={15}
                        strokeWidth={isItemActive ? 2.3 : 1.9}
                        className={`shrink-0 transition-colors ${isItemActive ? 'text-[#E91E63]' : 'text-[#7A6872]'}`}
                      />
                    )}
                    <span className="tracking-tight">{navLabel(item)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0">
            {/* Single Unified Compact Milestone Pill */}
            {config.basePath === '/app' && (
              <Link 
                to="/app/rewards" 
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white border border-rose-200 hover:border-[#ff69b4] rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer select-none shrink-0"
                title="View Milestone Rewards"
              >
                <div className="flex items-center gap-1 font-black text-slate-800 text-[11px] sm:text-xs">
                  <span className="text-xs">🔥</span>
                  <span>{headerStreak}d</span>
                </div>
                <div className="w-px h-3.5 bg-rose-200" />
                <div className="flex items-center gap-1 font-black text-slate-800 text-[11px] sm:text-xs">
                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Award size={10} />
                  </div>
                  <span>{headerStages}</span>
                </div>
              </Link>
            )}

            {/* Desktop Language Selector Dropdown */}
            <div className="hidden md:block relative shrink-0" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50/80 border border-pink-100/50 text-[#4B1E5A] hover:text-[#ff69b4] text-[11px] font-black transition-all shadow-sm cursor-pointer select-none"
              >
                <span>🌐</span>
                <span className="uppercase">{langCode === 'en' ? 'EN' : langCode === 'hi' ? 'HI' : 'MR'}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showLangDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl border border-rose-50 p-1.5 z-[200]"
                  >
                    {[
                      { code: 'en', native: 'EN / English' },
                      { code: 'hi', native: 'HI / हिन्दी' },
                      { code: 'mr', native: 'MR / मराठी' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          handleLanguageChange(lang.code);
                          setShowLangDropdown(false);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-rose-50 text-left ${
                          langCode === lang.code ? 'text-[#ff69b4] bg-rose-50/30' : 'text-[#9A8A8E]'
                        }`}
                      >
                        <span>{lang.native}</span>
                        {langCode === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-[#ff69b4]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative z-[110]">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 rounded-xl hover:bg-rose-50 relative transition-all" style={{ color: '#C4A0AC' }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white animate-pulse" style={{ background: '#ff69b4' }} />
                )}
              </button>
              {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border p-4 z-[200] animate-in fade-in zoom-in duration-200" style={{ borderColor: '#F5E6EA' }}>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: '#15192c' }}>{t('dashboard.notifications', 'Notifications')}</h3>
                    {unreadCount > 0 && (
                      <span onClick={handleMarkAllAsRead} className="text-[10px] font-black uppercase text-[#ff69b4] cursor-pointer hover:opacity-70 transition-opacity">{t('dashboard.markAllRead', 'Mark all as read')}</span>
                    )}
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 font-bold text-center py-4">{t('dashboard.noNotifications', 'No new notifications')}</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${!n.is_read ? 'bg-[#FFF7F8]/80 border-pink-100 font-semibold' : 'bg-slate-50/50 border-slate-100'}`}
                          style={{ borderColor: !n.is_read ? '#F5E6EA' : undefined }}
                        >
                          <p className="text-[12px] leading-snug mb-1" style={{ color: '#15192c' }}>{n.title || n.message}</p>
                          {n.title && n.message && <p className="text-[11px] text-slate-500 font-medium leading-snug mb-1">{n.message}</p>}
                          <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: '#C4A0AC' }}>{formatRelativeTime(n.created_at)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative shrink-0 border-l pl-2 sm:pl-4" style={{ borderColor: '#F5E6EA' }} ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-1.5 group hover:opacity-80 transition-opacity cursor-pointer select-none focus:outline-none"
                aria-label="User Profile Menu"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-sm border border-rose-100 relative">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FDEEF1&color=C4607A&bold=true`} alt={displayName} className="w-full h-full object-cover" />
                </div>
                <ChevronDown size={14} className={`text-[#9A8A8E] transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-rose-100 p-2.5 z-[250]"
                  >
                    <div className="px-3 py-2 border-b border-rose-50 mb-1">
                      <p className="text-xs font-black text-[#15192c] truncate">{displayName}</p>
                      <p className="text-[10px] font-bold text-[#C4A0AC] uppercase tracking-wider">
                        {t(config.i18nSubtitleKey, config.userSubtitle)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate(`${config.basePath}/profile`);
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[#5C4A52] hover:text-[#ff69b4] hover:bg-rose-50 transition-all text-left cursor-pointer"
                    >
                      <User size={15} />
                      <span>{t('nav.profile', 'My Profile')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-extrabold text-rose-500 hover:bg-rose-50 transition-all text-left cursor-pointer mt-1 border-t border-rose-50 pt-2.5"
                    >
                      <LogOut size={15} />
                      <span>{t('nav.signOut', 'Sign Out')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-xl" style={{ color: '#15192c' }}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Secondary Sub-Header Navigation Bar (Row 2 - Smaller Text + | Dividers matching 2nd SS) ── */}
      {config.subNavItems && config.subNavItems.length > 0 && (
        <div className="w-full bg-[#FFF7F8]/95 backdrop-blur-md border-b shadow-2xs" style={{ borderColor: '#FCE7F3' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4 px-4 md:px-10 py-2 overflow-x-auto no-scrollbar">
            {config.subNavItems.map((subItem, index) => {
              const isSubActive = isActive(subItem.path);
              const SubIcon = subItem.icon;
              return (
                <React.Fragment key={subItem.path}>
                  <button
                    type="button"
                    onClick={() => navigate(subItem.path)}
                    className={`flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-200 hover:text-[#ff69b4] cursor-pointer whitespace-nowrap ${
                      isSubActive ? 'text-[#ff69b4] font-black border-b-2 border-[#ff69b4] pb-0.5' : 'text-[#C4A0AC] hover:text-[#ff69b4]'
                    }`}
                  >
                    {SubIcon && <SubIcon size={12} className={isSubActive ? 'text-[#ff69b4]' : 'text-[#C4A0AC]'} />}
                    <span>{t(subItem.i18nKey, subItem.name)}</span>
                  </button>
                  {index < config.subNavItems.length - 1 && (
                    <span className="text-[#F5E6EA] text-[10px] select-none font-light">|</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b shadow-2xl p-6 space-y-2 max-h-[80vh] overflow-y-auto" style={{ borderColor: '#F5E6EA' }}>
          {visibleNavItems.map((item) => {
            const locked = isNavItemLocked(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(item.path);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl font-bold bg-rose-50/50 w-full text-left relative"
                style={{ color: isActive(item.path) ? '#ff69b4' : locked ? '#9A8A8E' : '#15192c' }}
              >
                <item.icon size={20} />
                <span className="flex-1">{navLabel(item)}</span>
                {locked && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-100 rounded-full text-[8px] font-black uppercase tracking-wider text-rose-400">
                    <Lock size={8} /> Pro
                  </span>
                )}
              </button>
            );
          })}

          {config.subNavItems && config.subNavItems.length > 0 && (
            <div className="pt-2 border-t border-rose-100 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] px-2 pt-2">Wellness Tools</p>
              {config.subNavItems.map((sub) => (
                <button
                  key={sub.path}
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(sub.path);
                  }}
                  className="flex items-center gap-4 p-3 px-4 rounded-xl font-bold text-[13px] bg-rose-50/30 border border-rose-100 w-full text-left"
                  style={{ color: isActive(sub.path) ? '#ff69b4' : '#15192c' }}
                >
                  <sub.icon size={18} /> {t(sub.i18nKey, sub.name)}
                </button>
              ))}
            </div>
          )}



          {/* Mobile Language Toggle */}
          <div className="p-4 rounded-2xl bg-rose-50/50 flex items-center justify-between border border-pink-100/10">
            <span className="font-bold text-[#15192c] text-sm">Language / भाषा</span>
            <div className="flex items-center bg-white p-0.5 rounded-full border border-pink-100/50 shadow-sm relative">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`relative px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-300 z-10 ${
                  langCode === 'en' ? 'text-white' : 'text-[#4B1E5A]'
                }`}
              >
                {langCode === 'en' && (
                  <motion.span
                    layoutId="activeLangIndicatorMobileDashboard"
                    className="absolute inset-0 bg-[#ff69b4] rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('hi')}
                className={`relative px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-300 z-10 ${
                  langCode === 'hi' ? 'text-white' : 'text-[#4B1E5A]'
                }`}
              >
                {langCode === 'hi' && (
                  <motion.span
                    layoutId="activeLangIndicatorMobileDashboard"
                    className="absolute inset-0 bg-[#ff69b4] rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('mr')}
                className={`relative px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-300 z-10 ${
                  langCode === 'mr' ? 'text-white' : 'text-[#4B1E5A]'
                }`}
              >
                {langCode === 'mr' && (
                  <motion.span
                    layoutId="activeLangIndicatorMobileDashboard"
                    className="absolute inset-0 bg-[#ff69b4] rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                मराठी
              </button>
            </div>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-2xl font-bold text-rose-500 w-full mt-4">
            <LogOut size={20} /> {t('nav.signOut', 'Sign Out')}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Shared Dashboard Navbar (for Advisor/Admin) ─────────────────────────────
const DashboardNavbar = ({ config, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, langCode, setLanguage } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const langDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const displayName = user?.fullName || config.userName;

  const handleLanguageChange = async (code) => {
    setLanguage(getLanguageByCode(code));
    try {
      const isVoiceEnabled = localStorage.getItem('hs_voice_enabled') === 'true';
      await i18nApi.setLanguagePreference(code, isVoiceEnabled);
    } catch (err) {
      console.error('Failed to sync language preference with backend:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await memberApi.getNotifications();
      if (res && res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await memberApi.markAllNotificationsRead();
      if (res && res.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await memberApi.markNotificationRead(notif.id);
        fetchNotifications();
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    setShowNotifications(false);
    const isMemberReply = 
      (notif.type && notif.type.startsWith('member_reply')) || 
      (notif.title && notif.title.toLowerCase().startsWith('reply from'));
    if (isMemberReply) {
      try {
        const res = await memberApi.getNotificationSender(notif.id);
        if (res && res.success && res.userId) {
          navigate(`/admin/users?chatUserId=${res.userId}`);
        }
      } catch (err) {
        console.error('Failed to resolve notification sender:', err);
      }
      return;
    }
    const isBilling = 
      (notif.type && notif.type.toLowerCase().startsWith('billing')) || 
      (notif.title && (notif.title.toLowerCase().startsWith('plan subscribed') || notif.title.toLowerCase().startsWith('plan activated')));
    if (isBilling) {
      navigate('/admin/payments');
      return;
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return t('dashboard.justNow', 'Just now');
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Translate page title via i18nKey if available
  const translatedPageTitle = (() => {
    const currentPath = window.location.pathname;
    const sortedNavItems = [...(config.navItems || [])].sort((a, b) => (b.path || '').length - (a.path || '').length);
    const activeItem = sortedNavItems.find(i => {
      if (!i.path) return false;
      if (i.path === currentPath) return true;
      return i.path !== '/admin' && i.path !== '/app' && i.path !== '/advisor' && i.path !== '/affiliate' && currentPath.startsWith(i.path);
    });
    if (activeItem?.i18nKey) return t(activeItem.i18nKey, activeItem.name);
    return pageTitle;
  })();

  return (
    <header className="h-16 bg-white border-b px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40" style={{ borderColor: '#F5E6EA' }}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => config.toggleSidebar?.()}
          className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-50"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-bold" style={{ color: '#15192c' }}>{translatedPageTitle}</h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Language Dropdown */}
        <div className="relative shrink-0" ref={langDropdownRef}>
          <button
            type="button"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/80 border border-pink-100/50 text-[#4B1E5A] hover:text-[#ff69b4] text-[11px] font-black transition-all shadow-sm cursor-pointer select-none"
          >
            <span>🌐</span>
            <span className="uppercase">{langCode === 'en' ? 'EN' : langCode === 'hi' ? 'HI' : 'MR'}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showLangDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-2xl border border-rose-50 p-1.5 z-[200]"
              >
                {[
                  { code: 'en', native: 'EN / English' },
                  { code: 'hi', native: 'HI / हिन्दी' },
                  { code: 'mr', native: 'MR / मराठी' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-rose-50 text-left ${
                      langCode === lang.code ? 'text-[#ff69b4] bg-rose-50/30' : 'text-[#9A8A8E]'
                    }`}
                  >
                    <span>{lang.native}</span>
                    {langCode === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-[#ff69b4]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-xl hover:bg-slate-50 transition-all text-slate-400">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white bg-[#ff69b4] animate-pulse" />
            )}
          </button>
          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border p-4 z-[100] animate-in fade-in zoom-in duration-200" style={{ borderColor: '#F5E6EA' }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: '#15192c' }}>{t('nav.alerts', 'Alerts')}</h3>
                {unreadCount > 0 && (
                  <span onClick={handleMarkAllAsRead} className="text-[10px] font-black uppercase text-[#ff69b4] cursor-pointer hover:opacity-70 transition-opacity">{t('nav.clearAll', 'Clear all')}</span>
                )}
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold text-center py-4">{t('dashboard.noNotifications', 'No new notifications')}</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${!n.is_read ? 'bg-[#FFF7F8]/80 border-pink-100 font-semibold' : 'bg-slate-50/50 border-slate-100'}`}
                    >
                      <p className="text-[12px] leading-snug mb-1 text-slate-800">{n.title || n.message}</p>
                      {n.title && n.message && <p className="text-[11px] text-slate-500 font-medium leading-snug mb-1">{n.message}</p>}
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{formatRelativeTime(n.created_at)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative shrink-0 border-l pl-5" style={{ borderColor: '#F5E6EA' }} ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
            aria-label="User Profile Menu"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold leading-none" style={{ color: '#15192c' }}>{displayName}</p>
              <p className="text-[10px] font-medium mt-1 uppercase tracking-widest text-slate-400">{config.i18nSubtitleKey ? t(config.i18nSubtitleKey) : config.userSubtitle}</p>
            </div>
            <div className="w-9 h-9 rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: '#F5E6EA' }}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${config.avatarBg || 'slate-100'}&color=C4607A&bold=true`} alt="User" />
            </div>
            <ChevronDown size={14} className={`text-[#9A8A8E] transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-rose-100 p-2.5 z-[250]"
              >
                <div className="px-3 py-2 border-b border-rose-50 mb-1">
                  <p className="text-xs font-black text-[#15192c] truncate">{displayName}</p>
                  <p className="text-[10px] font-bold text-[#C4A0AC] uppercase tracking-wider">
                    {config.i18nSubtitleKey ? t(config.i18nSubtitleKey) : config.userSubtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate(`${config.basePath}/profile`);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[#5C4A52] hover:text-[#ff69b4] hover:bg-rose-50 transition-all text-left cursor-pointer"
                >
                  <User size={15} />
                  <span>{t('nav.profile', 'My Profile')}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setShowProfileDropdown(false);
                    if (location.pathname.startsWith('/affiliate')) {
                      navigate('/app');
                    } else {
                      await logout();
                      navigate('/login');
                    }
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-extrabold text-rose-500 hover:bg-rose-50 transition-all text-left cursor-pointer mt-1 border-t border-rose-50 pt-2.5"
                >
                  <LogOut size={15} />
                  <span>{t('nav.signOut', 'Sign Out')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

// ─── Standard Sidebar ─────────────────────────────────────────────────────────
const Sidebar = ({ config, isActive, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useLanguage();
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-64 z-50 lg:relative lg:z-0
        ${config.sidebarBg} border-r flex flex-col shrink-0
        transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="p-8 pb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 overflow-hidden flex items-center justify-center shadow-lg`}>
              <img src="/Images/logo.png" alt="HealthSakhi Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-white">HealthSakhi</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {config.navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.path) ? `${config.sidebarActive} text-white` : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.i18nKey ? t(item.i18nKey, item.name) : item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={() => {
            if (location.pathname.startsWith('/affiliate')) {
              navigate('/app');
            } else {
              logout().then(() => navigate('/login'));
            }
          }} className="flex items-center gap-3 px-4 py-3 w-full text-white/40 hover:text-white font-bold text-sm">
            <LogOut size={18} />
            {t('nav.signOut', 'Sign Out')}
          </button>
        </div>
      </aside>
    </>
  );
};

// ─── Final Dashboard Layout ───────────────────────────────────────────────────
const DashboardLayout = ({ role: propRole }) => {
  const { logout, isAuthenticated, loading, role: userRole } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setLanguage, t } = useLanguage();

  // Determine role based on URL path first, then fallback to prop or auth context
  let effectiveRole = 'member';
  if (location.pathname.startsWith('/admin')) {
    effectiveRole = 'admin';
  } else if (location.pathname.startsWith('/advisor')) {
    effectiveRole = 'advisor';
  } else if (location.pathname.startsWith('/affiliate')) {
    effectiveRole = 'partner';
  } else if (propRole) {
    effectiveRole = propRole.toLowerCase();
  } else if (userRole) {
    effectiveRole = userRole.toLowerCase();
  }

  const [isTrialExpired, setIsTrialExpired] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading && effectiveRole === 'member') {
      const fetchLangPref = async () => {
        try {
          const res = await i18nApi.getLanguagePreference();
          if (res && res.success && res.preference) {
            setLanguage(getLanguageByCode(res.preference.languageCode));
            localStorage.setItem('hs_voice_enabled', res.preference.voiceEnabled ? 'true' : 'false');
          }
        } catch (err) {
          console.error('Error fetching language preference:', err);
        }
      };
      const checkTrial = async () => {
        try {
          const res = await memberApi.getProfile();
          if (res && res.success && res.profile?.subscription?.is_trial_expired) {
            setIsTrialExpired(true);
          }
        } catch (err) {
          console.error('Error checking trial status:', err);
        }
      };
      fetchLangPref();
      checkTrial();
    }
  }, [isAuthenticated, loading, effectiveRole]);

  const config = ROLE_CONFIG[effectiveRole] || ROLE_CONFIG.member;
  const isActive = (path) => {
    if (path === config.basePath) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  const isTopNav = effectiveRole === 'member' || effectiveRole === 'partner';
  const activeItem = config.navItems.find(i => isActive(i.path));
  const pageTitle = activeItem 
    ? (activeItem.i18nKey ? t(activeItem.i18nKey) : activeItem.name) 
    : (config.i18nLabelKey ? t(config.i18nLabelKey) : config.label);

  // Add toggle function to config so DashboardNavbar can access it
  const configWithToggle = {
    ...config,
    toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen)
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-md">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#ff69b4]/10 border-t-[#ff69b4] animate-spin"></div>
          <div className="w-8 h-8 rounded-full bg-[#ff69b4]/20 animate-ping"></div>
        </div>
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#ff69b4] animate-pulse">Authenticating...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isLockedRoute = isTrialExpired && (
    location.pathname.startsWith('/app/books') ||
    location.pathname.startsWith('/app/ai-sakhi') ||
    location.pathname.startsWith('/app/community')
  );

  if (isTopNav) {
    return (
      <div className="min-h-screen flex flex-col font-sans" style={{ background: '#FFF7F8' }}>
        <MemberNavbar config={config} isActive={isActive} />
        <main className="flex-1 w-full transition-all duration-300 pt-24 xl:pt-28 pb-10">
          <div className="w-full px-4 md:px-6 lg:px-10">
            {isLockedRoute ? (
              <div className="max-w-2xl mx-auto my-12 bg-white rounded-[2.5rem] p-8 md:p-12 border border-rose-100 shadow-2xl text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                  <Lock size={36} />
                </div>
                <div className="space-y-2">
                  <span className="px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                    {t('lockScreen.expired', '1-Month Free Sakhi Plan Expired 🌸')}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-[#15192c]">
                    {t('lockScreen.upgradeTitle', 'Upgrade to Premium Plan 💎')}
                  </h2>
                  <p className="text-sm text-[#9A8A8E] font-medium max-w-md mx-auto leading-relaxed">
                    {t('lockScreen.upgradeDesc', 'Your 30-day Free Sakhi trial period has ended. Please upgrade to a Premium plan to continue accessing Books, AI Sakhi Chat Bot, and Community Sakhis!')}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/app/plans')}
                  className="px-8 py-4 bg-gradient-to-r from-[#ff69b4] to-[#ff4797] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-pink-200 cursor-pointer"
                >
                  {t('lockScreen.upgradeBtn', 'UPGRADE TO PREMIUM PLAN 💎')}
                </button>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex w-full font-sans bg-slate-50 overflow-hidden">
      <Sidebar
        config={config}
        isActive={isActive}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardNavbar config={configWithToggle} pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;


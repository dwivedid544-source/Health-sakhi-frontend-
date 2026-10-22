import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, HelpCircle, ChevronDown, Check, ThumbsUp, ThumbsDown, 
  MessageSquare, User, Activity, Calendar, CreditCard, Shield, Settings, Info,
  Send, Mail, Sparkles, RefreshCw, Trash2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import faqApi from '../../api/faqApi';
import memberApi from '../../api/memberApi';
import useFeatureAccess from '../../hooks/useFeatureAccess';
import LockedFeature from '../../components/subscription/LockedFeature';

const CATEGORY_ICONS = {
  'Account': User,
  'Health Tracking': Activity,
  'Consultation': Calendar,
  'Payments': CreditCard,
  'Privacy': Shield,
  'Technical Support': Settings
};

const FAQScreen = () => {
  const { t, langCode } = useLanguage();
  const { isLocked: askLocked } = useFeatureAccess('askSakhi');
  const [showChat, setShowChat] = useState(false);
  
  // ── FAQ State ──
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [votedFaqIds, setVotedFaqIds] = useState(() => {
    try {
      const saved = localStorage.getItem('hs_voted_faqs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // ── Ask HealthSakhi (Admin Chat) State ──
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [memberReplyText, setMemberReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('hs_faq_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ['All', ...parsed];
        }
      } catch (e) {}
    }
    return [
      'All',
      'Account',
      'Health Tracking',
      'Consultation',
      'Payments',
      'Privacy',
      'Technical Support'
    ];
  });

  // Helper to capitalize words
  const capitalizeWords = (str) => {
    if (!str) return '';
    return str.trim().split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  // ── Fetch FAQs ──
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const res = await faqApi.getFaqs();
        if (res && res.success && res.data) {
          setFaqs(res.data);

          // Extract unique categories from DB and capitalize them
          const uniqueCategories = Array.from(
            new Set(res.data.map(faq => capitalizeWords(faq.category)).filter(Boolean))
          );

          const defaultCategories = ['Account', 'Health Tracking', 'Consultation', 'Payments', 'Privacy', 'Technical Support'];
          const merged = Array.from(new Set([...defaultCategories, ...uniqueCategories]));
          setCategories(['All', ...merged]);
          localStorage.setItem('hs_faq_categories', JSON.stringify(merged));
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [langCode]);

  // ── Fetch Admin Notifications / Replies ──
  const fetchNotifications = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingNotifications(true);
      const res = await memberApi.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        if (res.notifications.some(n => !n.is_read)) {
          await memberApi.markAllNotificationsRead();
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (showLoading) setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteMessage = async (msgId) => {
    try {
      await memberApi.deleteNotification(msgId);
      setNotifications(prev => prev.filter(n => n.id !== msgId));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!memberReplyText.trim()) return;
    setSendingReply(true);
    try {
      await memberApi.sendNotificationReply(memberReplyText.trim());
      setMemberReplyText('');
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 3000);
      await fetchNotifications(false);
    } catch (err) {
      console.error('Failed to send reply to admin:', err);
      alert('Failed to send message: ' + (err.response?.data?.error || err.message));
    } finally {
      setSendingReply(false);
    }
  };

  // ── FAQ Voting ──
  const handleVote = async (faqId, type) => {
    if (votedFaqIds[faqId]) return;
    try {
      const res = await faqApi.submitFeedback(faqId, type);
      if (res && res.success) {
        setFaqs(prevFaqs =>
          prevFaqs.map(faq => {
            if (faq.id === faqId) {
              return {
                ...faq,
                helpfulCount: type === 'helpful' ? faq.helpfulCount + 1 : faq.helpfulCount,
                notHelpfulCount: type !== 'helpful' ? faq.notHelpfulCount + 1 : faq.notHelpfulCount
              };
            }
            return faq;
          })
        );
        const newVotes = { ...votedFaqIds, [faqId]: type };
        setVotedFaqIds(newVotes);
        localStorage.setItem('hs_voted_faqs', JSON.stringify(newVotes));
      }
    } catch (err) {
      console.error('Failed to submit FAQ feedback:', err);
    }
  };

  // ── Filter FAQs ──
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || capitalizeWords(faq.category) === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFaqs = faqs.filter(faq => faq.isPopular);

  return (
    <div className="w-full bg-[#FFF7F8] min-h-screen font-sans pb-20">
      {/* ── Hero Header ── */}
      <section className="relative py-14 overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-[#FFF5F6] via-[#FFEBEF] to-[#FFE0E5] shadow-sm mb-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent pointer-events-none"></div>
        <div className="w-full px-4 sm:px-[6%] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur-md rounded-full mb-5 border border-white/30"
          >
            <HelpCircle size={12} className="text-[#ff69b4]" />
            <span className="text-[10px] font-black text-[#D17B88] uppercase tracking-[0.2em]">{t('faq.badge', 'Help Center')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-[#15192c] mb-6 tracking-tight leading-tight"
          >
            FAQ & <span className="text-[#ff69b4]">{t('faq.title', 'Help Centre')}</span>
          </motion.h1>

          {/* Search Box + Ask HealthSakhi Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative group mt-2 flex items-center gap-3"
          >
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-pink-200/40 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-5 text-slate-400 group-hover:text-pink-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder={t('faq.searchPlaceholder', 'Search your question...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-4 pl-14 pr-6 rounded-2xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all font-medium text-slate-700 placeholder:text-slate-400 text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => setShowChat(prev => !prev)}
              className={`shrink-0 flex items-center gap-2 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 shadow-lg ${
                showChat
                  ? 'bg-[#ff69b4] text-white shadow-pink-300/40'
                  : 'bg-[#15192c] text-white hover:bg-[#ff69b4] shadow-slate-900/20'
              }`}
            >
              <MessageSquare size={15} />
              <span className="hidden sm:inline">{t('faq.askBtn', 'Ask HealthSakhi')}</span>
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">

        {/* ── Ask HealthSakhi (Admin Consultation) Section ── */}
        <AnimatePresence>
        {showChat && <motion.section
          key="ask-chat"
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 48 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('faq.askBtn', 'Ask HealthSakhi')}</span>
            <div className="h-px bg-slate-200 flex-1 ml-2"></div>
          </div>

          {askLocked ? (
            <LockedFeature
              featureName="Ask Health Sakhi"
              requiredPlan="Basic Sakhi"
              description="Personal HealthSakhi consultation is an exclusive feature for Basic & Premium members. Upgrade to get direct support."
            />
          ) : (
            <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm space-y-4" style={{ borderColor: '#F5E6EA' }}>
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#F5E6EA' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#ff69b4]">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#15192c]">Personal Doctor Consultation</h2>
                    <p className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-wider">Live Consultation Thread</p>
                  </div>
                </div>
                <button
                  onClick={() => fetchNotifications(true)}
                  className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-[#ff69b4] hover:bg-rose-50 transition-all text-[10px] font-bold flex items-center gap-1 shrink-0"
                  title="Refresh"
                >
                  <RefreshCw size={12} className={loadingNotifications ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Chat Thread */}
              <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200/80 rounded-2xl max-h-[200px] overflow-y-auto space-y-3.5 shadow-inner custom-cms-scrollbar">
                {loadingNotifications && notifications.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-[#ff69b4] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mx-auto text-[#ff69b4]">
                      <Mail size={18} />
                    </div>
                    <p className="text-sm font-black text-[#15192c]">No messages yet</p>
                    <p className="text-[11px] font-semibold text-[#C4A0AC] max-w-xs mx-auto">
                      Send your question below and your Personal Consultation Doctor will reply soon.
                    </p>
                  </div>
                ) : (
                  [...notifications].reverse().map((notif) => {
                    const isMemberReply = notif.type === 'member_reply';
                    return (
                      <div key={notif.id} className={`flex flex-col group/msg ${isMemberReply ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[8px] font-black uppercase tracking-wider ${isMemberReply ? 'text-rose-500' : 'text-[#4B1E5A]'}`}>
                            {isMemberReply ? '🌸 YOU (MEMBER)' : '🩺 PERSONAL DOCTOR'}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="relative max-w-[85%] group">
                          <div className={`p-3 rounded-xl text-xs font-semibold shadow-sm leading-relaxed ${
                            isMemberReply
                              ? 'bg-rose-50 text-rose-950 border border-rose-100 rounded-tr-none'
                              : 'bg-[#15192c] text-white rounded-tl-none'
                          }`}>
                            {notif.title && !isMemberReply && (
                              <div className="font-bold text-[#ff69b4] text-[9px] uppercase tracking-wider mb-0.5">{notif.title}</div>
                            )}
                            <div className="whitespace-pre-wrap">{notif.message}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(notif.id)}
                            className={`absolute top-1.5 ${isMemberReply ? '-left-6' : '-right-6'} p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100`}
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Message Form */}
              <form onSubmit={handleSendReply} className="space-y-2 pt-1 font-sans">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">
                    MESSAGE / REPLY BODY
                  </label>
                  {replySuccess && (
                    <span className="text-[9px] font-black text-emerald-600 animate-in fade-in">
                      ✓ Message Sent to Doctor!
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <textarea
                    required
                    rows="2"
                    placeholder="Type your question to your doctor..."
                    value={memberReplyText}
                    onChange={e => setMemberReplyText(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-slate-200 focus:border-[#ff69b4] outline-none text-xs font-semibold bg-white text-[#15192c] shadow-inner resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !memberReplyText.trim()}
                    className="px-5 py-2.5 h-10 bg-[#ff69b4] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200/50 self-end sm:self-center shrink-0 font-sans"
                  >
                    <Send size={12} />
                    {sendingReply ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.section>}
        </AnimatePresence>

        {/* ── Category Filter Pills ── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('faq.browseByCategory', 'Browse by Category')}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || HelpCircle;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setExpandedFaqId(null); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-[#15192c] text-white shadow-md shadow-slate-900/10'
                      : 'bg-white text-slate-600 border border-slate-100/80 hover:bg-slate-50'
                  }`}
                >
                  {cat !== 'All' && <Icon size={13} className={isActive ? 'text-[#ff69b4]' : 'text-slate-400'} />}
                  {t('faq.category.' + cat.toLowerCase().replace(' ', ''), cat)}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Popular Questions ── */}
        {!searchQuery && activeCategory === 'All' && popularFaqs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('faq.popularQuestions', 'Popular Questions')}</span>
              <div className="h-px bg-slate-200 flex-1 ml-2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularFaqs.map((faq) => (
                <motion.div
                  key={faq.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)}
                  className="p-5 rounded-2xl bg-white border border-slate-100/70 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-500 rounded-md text-[8px] font-black uppercase tracking-wider mb-3">
                      {t('faq.category.' + faq.category.toLowerCase().replace(' ', ''), faq.category)}
                    </span>
                    <h4 className="text-sm font-black text-slate-800 leading-snug mb-2">{faq.question}</h4>
                  </div>

                  <AnimatePresence>
                    {expandedFaqId === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden mt-3"
                      >
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold pt-2 border-t border-slate-100">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── All FAQs Accordion ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {searchQuery || activeCategory !== 'All'
                ? `${t('faq.searchResults', 'Search Results')} (${filteredFaqs.length})`
                : t('faq.allQuestions', 'All Questions')}
            </span>
            <div className="h-px bg-slate-200 flex-1 ml-2"></div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff69b4]"></div>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Info size={24} />
              </div>
              <h4 className="text-sm font-black text-slate-800 mb-1">{t('faq.noResultsTitle', 'No FAQs Found')}</h4>
              <p className="text-xs text-slate-400 font-semibold">{t('faq.noResultsDesc', "We couldn't find any questions matching your query.")}</p>
              <p className="text-xs text-[#ff69b4] font-black mt-3 cursor-pointer" onClick={() => document.querySelector('textarea')?.focus()}>
                Ask HealthSakhi team directly ↑
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = expandedFaqId === faq.id;
                const isVoted = votedFaqIds[faq.id];
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 pr-4">
                        <span className="p-1.5 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                          <HelpCircle size={14} />
                        </span>
                        <span className="text-sm font-black text-slate-800 leading-tight">{faq.question}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-pink-500' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-slate-50/80">
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4 whitespace-pre-line">
                              {faq.answer}
                            </p>

                            {/* Helpfulness Feedback */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                {t('faq.categoryLabel', 'Category')}: {t('faq.category.' + faq.category.toLowerCase().replace(' ', ''), faq.category)}
                              </span>

                              <div className="flex items-center gap-3">
                                <span>{t('faq.wasHelpful', 'Was this helpful?')}</span>
                                {isVoted ? (
                                  <span className="flex items-center gap-1 text-emerald-500 font-black text-[9px]">
                                    <Check size={12} /> {t('faq.feedbackThankYou', 'Thank you!')}
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleVote(faq.id, 'helpful')}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center gap-1 border border-slate-100"
                                      title="Helpful"
                                    >
                                      <ThumbsUp size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleVote(faq.id, 'not_helpful')}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center gap-1 border border-slate-100"
                                      title="Not Helpful"
                                    >
                                      <ThumbsDown size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FAQScreen;

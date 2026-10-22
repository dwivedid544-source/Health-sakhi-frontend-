import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, MessageSquare, ShieldCheck, Shield, Sparkles, ArrowRight, Star, Clock, X, Calendar, MapPin, ChevronLeft, ChevronRight, Brain, CheckCircle, Search, Plus, Trash2, CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import communityApi from '../../api/communityApi';

const iconMap = {
  Heart: Heart,
  Users: Users,
  Shield: Shield,
  Star: Star
};

// ── Event Detail Modal ───────────────────────────────────────────────────────
const EventModal = ({ event, onClose, onRegister }) => {
  const { t } = useLanguage();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#15192c]/70 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl relative text-left">
        <button onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#C4A0AC] hover:bg-rose-100 transition-all">
          <X size={18} />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff69b4] mb-6">
          <Calendar size={26} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">{t('relationship.upcomingEvent', 'Upcoming Event')}</p>
        <h3 className="text-2xl font-black text-[#15192c] mb-4 leading-tight">{event.title}</h3>
        <p className="text-sm text-[#9A8A8E] leading-relaxed mb-6">{event.desc}</p>
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <Clock size={14} className="text-[#ff69b4]" />
            <span className="text-xs font-bold text-[#15192c]">{event.time}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={14} className="text-[#ff69b4]" />
            <span className="text-xs font-bold text-[#15192c]">{t('relationship.eventLocationDesc', 'Online • Zoom Link Sent After Registration')}</span>
          </div>
        </div>
        <button onClick={onRegister}
          className="w-full py-4 bg-[#ff69b4] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg">
          {t('relationship.registerFree', 'Register for Free ✨')}
        </button>
      </motion.div>
    </motion.div>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────
const RelationshipScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Local Event State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  // Database Community State
  const [circles, setCircles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Toast
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Circle Chat State
  const [activeChatCircle, setActiveChatCircle] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatAnonymous, setChatAnonymous] = useState(true);
  const [isCircleChatLoading, setIsCircleChatLoading] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatMessagesEndRef = useRef(null);

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostData, setNewPostData] = useState({ title: '', tag: 'Health', content: '', anonymous: true });

  // Post Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReplyText, setNewReplyText] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(true);
  const [isRepliesLoading, setIsRepliesLoading] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Fetch initial data
  useEffect(() => {
    loadCommunityData();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      const [circlesRes, postsRes] = await Promise.all([
        communityApi.getCircles(),
        communityApi.getPosts()
      ]);
      if (circlesRes.success) setCircles(circlesRes.circles);
      if (postsRes.success) setPosts(postsRes.posts);
    } catch (err) {
      console.error('Failed to load community details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom helper
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatCircle]);

  // Periodic polling for chat messages
  useEffect(() => {
    if (!activeChatCircle) return;
    const interval = setInterval(async () => {
      try {
        const res = await communityApi.getCircleMessages(activeChatCircle.id);
        if (res.success) {
          setChatMessages(res.messages);
        }
      } catch (err) {
        console.error('Failed to poll chat messages:', err);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeChatCircle]);

  // Join a Circle
  const handleJoinCircle = async (circleId) => {
    try {
      const res = await communityApi.joinCircle(circleId);
      if (res.success) {
        triggerToast('Joined the sisterhood! 💖');
        const circlesRes = await communityApi.getCircles();
        if (circlesRes.success) setCircles(circlesRes.circles);
      }
    } catch (err) {
      console.error('Join circle failed:', err);
    }
  };

  // Leave a Circle
  const handleLeaveCircle = async () => {
    if (!activeChatCircle) return;
    if (window.confirm(`Are you sure you want to leave ${activeChatCircle.name}?`)) {
      try {
        const res = await communityApi.leaveCircle(activeChatCircle.id);
        if (res.success) {
          triggerToast('Left the circle');
          setActiveChatCircle(null);
          const circlesRes = await communityApi.getCircles();
          if (circlesRes.success) setCircles(circlesRes.circles);
        }
      } catch (err) {
        console.error('Leave circle failed:', err);
      }
    }
  };

  // Enter Chat Room
  const handleEnterChat = async (circle) => {
    try {
      setActiveChatCircle(circle);
      setIsCircleChatLoading(true);
      setChatMessages([]);
      const res = await communityApi.getCircleMessages(circle.id);
      if (res.success) {
        setChatMessages(res.messages);
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
      triggerToast('Join this circle first to view chats!');
      setActiveChatCircle(null);
    } finally {
      setIsCircleChatLoading(false);
    }
  };

  // Send message
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !activeChatCircle) return;
    try {
      setIsSendingChat(true);
      const res = await communityApi.sendCircleMessage(activeChatCircle.id, newChatMessage, chatAnonymous);
      if (res.success && res.chatMessage) {
        setChatMessages(prev => [...prev, res.chatMessage]);
        setNewChatMessage('');
      }
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Create post
  const handleCreatePost = async () => {
    if (!newPostData.title.trim() || !newPostData.content.trim()) return;
    try {
      const res = await communityApi.createPost({
        title: newPostData.title,
        tag: newPostData.tag,
        content: newPostData.content,
        anonymous: newPostData.anonymous
      });
      if (res.success && res.post) {
        setPosts(prev => [res.post, ...prev]);
        setShowCreateModal(false);
        setNewPostData({ title: '', tag: 'Health', content: '', anonymous: true });
        triggerToast('Conversation started! 🌟');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  // Delete post
  const handleDeletePost = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        const res = await communityApi.deletePost(id);
        if (res.success) {
          setPosts(prev => prev.filter(p => p.id !== id));
          triggerToast('Conversation deleted');
        }
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  // Open details
  const openPostDetail = async (post) => {
    try {
      setSelectedPost(post);
      setShowDetailModal(true);
      setIsRepliesLoading(true);
      setReplies([]);
      const res = await communityApi.getPostReplies(post.id);
      if (res.success) {
        setReplies(res.replies);
      }
    } catch (err) {
      console.error('Failed to load replies:', err);
    } finally {
      setIsRepliesLoading(false);
    }
  };

  // Create reply
  const handleCreateReply = async (e) => {
    e.preventDefault();
    if (!newReplyText.trim() || !selectedPost) return;
    try {
      setIsSubmittingReply(true);
      const res = await communityApi.createPostReply(selectedPost.id, newReplyText, replyAnonymous);
      if (res.success && res.reply) {
        setReplies(prev => [...prev, res.reply]);
        setNewReplyText('');
        setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, replies: p.replies + 1 } : p));
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const localizeTrack = (str) => {
    if (!str) return '';
    const cleanKey = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t('relationship.pathways.db.' + cleanKey, str);
  };

  const localizeEvent = (str) => {
    if (!str) return '';
    const cleanKey = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t('relationship.events.db.' + cleanKey, str);
  };

  const handleRegister = (eventTitle) => {
    setRegisteredEvents(prev => [...prev, eventTitle]);
    setSelectedEvent(null);
  };

  const learningTracks = [
    { title: t('relationship.tracks.boundaries.title', 'The Art of Boundaries'), desc: t('relationship.tracks.boundaries.desc', 'How to say no without guilt and maintain your energy.'), icon: ShieldCheck, color: '#FDEEF1', text: '#D17B88' },
    { title: t('relationship.tracks.healing.title', 'Healing from Heartbreak'), desc: t('relationship.tracks.healing.desc', 'A gentle 21-day program to reclaim your joy.'), icon: Heart, color: '#F5F1FE', text: '#9079C1' },
    { title: t('relationship.tracks.communication.title', 'Conscious Communication'), desc: t('relationship.tracks.communication.desc', 'Techniques for deeper connection and less conflict.'), icon: MessageSquare, color: '#FFF9EE', text: '#CCAA3D' },
    { title: t('relationship.tracks.selfLove.title', 'Radiant Self-Love'), desc: t('relationship.tracks.selfLove.desc', 'The foundation for all other healthy relationships.'), icon: Sparkles, color: '#FDEEF1', text: '#D17B88' },
  ];

  const upcomingEvents = [
    { title: t('relationship.events.vulnerability.title', 'The Power of Vulnerability'), time: t('relationship.events.vulnerability.time', 'Tomorrow, 5 PM'), desc: t('relationship.events.vulnerability.desc', 'A live session on how opening up builds deeper, more meaningful connections with the people you love.'), icon: <Heart size={14} /> },
    { title: t('relationship.events.parenting.title', 'Parenting Pod Workshop'), time: t('relationship.events.parenting.time', 'Sunday, 11 AM'), desc: t('relationship.events.parenting.desc', 'A safe circle for mothers navigating the joys and challenges of raising children while maintaining their own identity.'), icon: <Users size={14} /> },
    { title: t('relationship.events.attachment.title', 'Healing Your Attachment Style'), time: t('relationship.events.attachment.time', 'Next Monday, 7 PM'), desc: t('relationship.events.attachment.desc', 'Understand anxious, avoidant, and secure attachment patterns and learn how to rewire them for healthier bonds.'), icon: <Brain size={14} /> },
  ];

  const filteredGroups = circles.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  if (loading && circles.length === 0) {
    return (
      <div className="min-h-screen w-full bg-[#FFF7F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#ff69b4]"></div>
          <p className="text-xs font-bold text-[#C4A0AC] uppercase tracking-widest animate-pulse">Entering Safe Haven...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full pb-20 px-4 pt-10 text-left">

      <AnimatePresence>
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onRegister={() => handleRegister(selectedEvent.title)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4 md:gap-5">
          <button 
            onClick={() => navigate('/app')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-rose-100 flex items-center justify-center text-[#15192c] hover:bg-rose-50 transition-all shadow-sm shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
             <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#15192c]">{t('relationship.relationshipSakhi', 'Relationship Sakhi')} 💞</h2>
             <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A0AC]">{t('relationship.nurturingBonds', 'Nurturing Beautiful Bonds')}</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4A0AC]" size={14} />
              <input 
                type="text" 
                placeholder="Search circles or posts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-11 md:h-12 bg-white/80 backdrop-blur-md border border-rose-50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#ff69b4] transition-all w-full sm:w-64 shadow-sm"
              />
           </div>
           <button 
             onClick={() => setShowCreateModal(true)}
             className="w-11 h-11 md:w-12 md:h-12 bg-[#15192c] text-white rounded-2xl flex items-center justify-center hover:bg-[#ff69b4] transition-all shadow-lg shrink-0"
           >
              <Plus size={20} />
           </button>
        </div>
      </motion.header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-12">

          {/* Support Circles Grid (Merged directly from CommunityScreen) */}
          <motion.section variants={item} className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C4A0AC]">{t('community.supportCircles', 'Support Circles')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {filteredGroups.map((group) => {
                 const IconComponent = iconMap[group.icon] || Heart;
                 return (
                   <motion.div 
                     key={group.id} 
                     whileHover={{ y: -5 }}
                     className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-rose-50 shadow-sm flex flex-col items-center text-center group transition-all"
                   >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-transform group-hover:scale-105" style={{ background: `${group.color || '#ff69b4'}10` }}>
                         <IconComponent size={28} style={{ color: group.color || '#ff69b4' }} />
                      </div>
                      <h3 className="text-base md:text-lg font-black text-[#15192c] mb-2">{group.name}</h3>
                      <p className="text-[10px] md:text-[11px] font-medium text-[#C4A0AC] leading-relaxed mb-4 md:mb-6">{group.description}</p>
                      <button 
                        onClick={() => {
                          if (group.joined) {
                            handleEnterChat(group);
                          } else {
                            handleJoinCircle(group.id);
                          }
                        }}
                        className={`w-full py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                          group.joined 
                          ? 'bg-[#15192c] text-white hover:bg-[#ff69b4] shadow-md hover:scale-[1.02]' 
                          : 'bg-rose-50 text-[#ff69b4] hover:bg-rose-100'
                        }`}
                      >
                        {group.joined ? 'Enter Chat' : 'Join Circle'}
                      </button>
                   </motion.div>
                 );
               })}
            </div>
          </motion.section>

          {/* Learning Tracks */}
          <motion.section variants={item}>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-[#C4A0AC]">{t('relationship.growthPathways', 'Growth Pathways')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {learningTracks.map((track, i) => (
                <motion.div key={i} whileHover={{ y: -6 }}
                  onClick={() => navigate('/app/learning')}
                  className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6EA] shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: track.color, color: track.text }}>
                    <track.icon size={22} />
                  </div>
                  <h4 className="text-lg font-black mb-2 text-[#15192c]">{localizeTrack(track.title)}</h4>
                  <p className="text-xs font-bold leading-relaxed opacity-60 mb-6">{localizeTrack(track.desc)}</p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t('relationship.startLearning', 'Start Learning')} <ArrowRight size={12} />
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Trending Conversations (Merged directly from CommunityScreen) */}
          <motion.section variants={item} className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C4A0AC]">{t('community.trendingConversations', 'Trending Conversations')}</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPosts.map((post) => (
                  <motion.div 
                    key={post.id} 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => openPostDetail(post)}
                    className="bg-white/60 p-6 rounded-2xl border border-rose-50 hover:border-[#ff69b4] transition-all flex flex-col gap-4 group cursor-pointer shadow-sm relative text-left min-h-[140px]"
                  >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                           <div className="w-9 h-9 bg-rose-50 rounded-full flex items-center justify-center text-[#ff69b4] group-hover:bg-[#ff69b4] group-hover:text-white transition-all"><MessageCircle size={16} /></div>
                           <div>
                              <h4 className="text-xs font-black text-[#15192c] leading-snug">{post.title}</h4>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-[#C4A0AC] mt-1 block">{post.tag}</span>
                           </div>
                        </div>
                        {post.isUserPost && (
                          <div className="flex gap-1 absolute top-4 right-4 z-10">
                             <button 
                               onClick={(e) => handleDeletePost(post.id, e)} 
                               className="p-1.5 text-[#C4A0AC] hover:text-rose-600 transition-colors"
                             >
                               <Trash2 size={14}/>
                             </button>
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] font-bold text-[#ff69b4] uppercase tracking-widest flex items-center justify-between mt-auto">
                         <span>{post.replies} Replies</span>
                         {post.isUserPost && <span className="text-[7px] bg-rose-50 px-2 py-0.5 rounded-full">My Post</span>}
                      </div>
                  </motion.div>
                ))}
             </div>
          </motion.section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-36 self-start">

          {/* Upcoming Sessions */}
          <motion.div variants={item} className="bg-white rounded-[3rem] p-8 border border-[#F5E6EA] shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C4A0AC] mb-6">{t('relationship.upcomingEvents', 'Upcoming Events')}</h3>
            <div className="space-y-5">
              {upcomingEvents.map((event, i) => (
                <motion.div key={i} whileHover={{ x: 4 }}
                  onClick={() => setSelectedEvent(event)}
                  className="flex gap-4 group cursor-pointer text-left">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#ff69b4] shrink-0">
                    {event.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[13px] font-black text-[#15192c] group-hover:text-[#ff69b4] transition-colors leading-tight">
                      {localizeEvent(event.title)}
                    </h4>
                    <span className="text-[10px] font-bold text-[#C4A0AC]">{localizeEvent(event.time)}</span>
                    {registeredEvents.includes(event.title) && (
                      <span className="ml-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">✓ {t('relationship.registered', 'Registered')}</span>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-[#C4A0AC] group-hover:text-[#ff69b4] transition-colors shrink-0 mt-1" />
                </motion.div>
              ))}
            </div>
            <button onClick={() => navigate('/app/sessions')}
              className="w-full mt-6 py-3 rounded-2xl border border-rose-100 text-[10px] font-black uppercase tracking-widest text-[#ff69b4] hover:bg-rose-50 transition-all">
              {t('relationship.viewAllSessions', 'View All Sessions →')}
            </button>
          </motion.div>

          {/* Quick Tip */}
          <motion.div variants={item}
            className="p-6 bg-gradient-to-br from-rose-50 to-purple-50 rounded-[2.5rem] border border-rose-100 text-left">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">💡 {t('relationship.dailyTipHeader', "Sakhi's Daily Tip")}</p>
            <p className="text-sm font-bold text-[#15192c] leading-relaxed">
              "{t('relationship.dailyTipDesc', 'Healthy relationships start with the one you have with yourself. Protect your peace first.')}"
            </p>
          </motion.div>

        </div>
      </main>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-[#15192c] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
            <CheckCircle2 size={16} className="text-[#ff69b4]" />
            <span className="text-[10px] font-bold uppercase tracking-widest tracking-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Group Chat Room Modal ── */}
      <AnimatePresence>
        {activeChatCircle && (
          <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveChatCircle(null)} className="absolute inset-0 bg-[#15192c]/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-lg bg-white rounded-[2.5rem] p-0 relative z-10 shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[600px] text-left">
               {/* Chat Header */}
               <div className="p-8 pb-4 flex items-start justify-between relative border-b border-rose-50 bg-[#FFF7F8]">
                  <div className="space-y-1">
                     <span className="px-3 py-1 bg-rose-50 text-[#ff69b4] text-[8px] font-black uppercase tracking-widest rounded-lg">Support Group Chat</span>
                     <h2 className="text-xl font-black text-[#15192c] tracking-tight">{activeChatCircle.name}</h2>
                     <p className="text-[10px] font-medium text-[#C4A0AC] leading-relaxed mt-1">{activeChatCircle.description}</p>
                  </div>
                  <button onClick={() => setActiveChatCircle(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#C4A0AC] hover:bg-rose-50 transition-all shrink-0"><X size={18}/></button>
               </div>

               {/* Messages List Container */}
               <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50 flex flex-col font-sans">
                  {isCircleChatLoading ? (
                     <div className="flex h-full items-center justify-center my-auto">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff69b4]"></div>
                     </div>
                  ) : chatMessages.length === 0 ? (
                     <div className="text-center text-[#C4A0AC] text-xs py-8 font-medium my-auto">
                        No messages yet in this support group. Be the first to spread the light! 💖
                     </div>
                  ) : (
                     <div className="space-y-4">
                       {chatMessages.map((msg) => {
                         const isOwn = msg.isOwnMessage;
                         return (
                           <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                             <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-left ${isOwn ? 'bg-[#ff69b4] text-white rounded-tr-none' : 'bg-white text-[#15192c] border border-rose-50 rounded-tl-none'}`}>
                               <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                             </div>
                             <span className="text-[8px] font-black uppercase tracking-widest text-[#C4A0AC] mt-1 px-1">
                               {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                           </div>
                         );
                       })}
                       <div ref={chatMessagesEndRef} />
                     </div>
                  )}
               </div>

               {/* Chat Input Bar */}
               <div className="p-6 bg-white border-t border-rose-50 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                     <button
                       onClick={() => setChatAnonymous(!chatAnonymous)}
                       className={`px-3 py-1.5 border rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${chatAnonymous ? 'bg-[#ff69b4] border-[#ff69b4] text-white' : 'bg-white border-rose-50 text-[#C4A0AC]'}`}
                     >
                       {chatAnonymous ? 'Posting Anonymously' : 'Posting Publicly'}
                     </button>
                     <button
                       onClick={handleLeaveCircle}
                       className="text-[8px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors animate-pulse"
                     >
                       Leave Circle
                     </button>
                  </div>
                  <form onSubmit={handleSendChatMessage} className="flex gap-3">
                     <input 
                       type="text" 
                       value={newChatMessage}
                       onChange={(e) => setNewChatMessage(e.target.value)}
                       placeholder="Share your thoughts with sisters..."
                       className="flex-1 px-5 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl text-[12px] font-semibold outline-none focus:border-[#ff69b4] transition-all"
                     />
                     <button type="submit" disabled={isSendingChat} className="w-12 h-12 bg-[#ff69b4] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shrink-0">
                        <Send size={18}/>
                     </button>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create Post Modal (Start Conversation) ── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[10050] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-[#15192c]/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl space-y-6 overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex items-center justify-between relative z-10">
                 <h2 className="text-xl md:text-2xl font-black text-[#15192c]">Start Conversation</h2>
                 <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#C4A0AC] hover:bg-rose-50 transition-all"><X size={18}/></button>
              </div>

              <div className="space-y-4 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Topic Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g., How to handle mood swings?"
                      value={newPostData.title}
                      onChange={(e) => setNewPostData({...newPostData, title: e.target.value})}
                      className="w-full px-5 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl text-sm font-semibold outline-none focus:border-[#ff69b4] transition-all"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Category</label>
                       <select 
                         value={newPostData.tag}
                         onChange={(e) => setNewPostData({...newPostData, tag: e.target.value})}
                         className="w-full px-5 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#ff69b4] transition-all appearance-none cursor-pointer"
                       >
                          {['Health', 'Food', 'Goals', 'Support', 'Lifestyle'].map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Identity</label>
                       <button 
                         onClick={() => setNewPostData({...newPostData, anonymous: !newPostData.anonymous})}
                         className={`w-full h-full px-5 py-4 border rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${newPostData.anonymous ? 'bg-[#ff69b4] border-[#ff69b4] text-white shadow-lg' : 'bg-white border-rose-100 text-[#C4A0AC]'}`}
                       >
                          {newPostData.anonymous ? 'Posting Anonymously' : 'Posting Publicly'}
                       </button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Details</label>
                    <textarea 
                      placeholder="Share your heart here..."
                      value={newPostData.content}
                      onChange={(e) => setNewPostData({...newPostData, content: e.target.value})}
                      className="w-full h-32 px-5 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl text-sm font-medium outline-none focus:border-[#ff69b4] transition-all resize-none"
                    />
                 </div>
              </div>

              <button 
                onClick={handleCreatePost}
                className="w-full py-5 bg-[#ff69b4] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3"
              >
                 Spread the Light <Send size={16}/>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Post Detail Modal ── */}
      <AnimatePresence>
        {showDetailModal && selectedPost && (
          <div className="fixed inset-0 z-[10050] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} className="absolute inset-0 bg-[#15192c]/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-lg bg-white rounded-[2.5rem] p-0 relative z-10 shadow-2xl overflow-hidden flex flex-col h-[85vh] text-left">
               {/* Detail Header */}
               <div className="p-8 pb-4 flex items-start justify-between relative bg-[#FFF7F8] border-b border-rose-50">
                  <div className="space-y-1">
                     <span className="px-3 py-1 bg-rose-50 text-[#ff69b4] text-[8px] font-black uppercase tracking-widest rounded-lg">{selectedPost.tag}</span>
                     <h2 className="text-xl md:text-2xl font-black text-[#15192c] tracking-tight pr-8">{selectedPost.title}</h2>
                     <p className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-widest">Post by {selectedPost.author}</p>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#C4A0AC] hover:bg-rose-50 transition-all shrink-0"><X size={18}/></button>
               </div>

               {/* Detail Content */}
               <div className="p-8 pt-0 flex-1 overflow-y-auto custom-scrollbar space-y-8 bg-slate-50">
                  <p className="text-[13px] md:text-sm font-medium text-[#15192c] leading-relaxed italic border-l-4 border-rose-100 pl-4 py-2 mt-4 bg-white p-4 rounded-2xl shadow-sm border border-rose-50">
                    "{selectedPost.content}"
                  </p>

                  <div className="space-y-6">
                     <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C4A0AC] flex items-center gap-2">
                        <MessageCircle size={12} /> {replies.length} Replies from Sisters
                     </h4>

                     <div className="space-y-4">
                        {isRepliesLoading ? (
                           <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff69b4]"></div>
                           </div>
                        ) : replies.length === 0 ? (
                           <p className="text-center text-[#C4A0AC] text-xs py-4 font-medium">No replies yet. Be the first to reply!</p>
                        ) : (
                           replies.map(reply => (
                             <div key={reply.id} className="p-4 rounded-2xl bg-white border border-rose-50 flex gap-4 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#ff69b4] shrink-0 border border-rose-100 shadow-sm"><Users size={14}/></div>
                                <div>
                                   <p className="text-xs font-semibold text-[#15192c] mb-1">{reply.content}</p>
                                   <span className="text-[8px] font-black uppercase tracking-widest text-[#C4A0AC]">{reply.senderName} • {new Date(reply.createdAt).toLocaleDateString()}</span>
                                </div>
                             </div>
                           ))
                        )}
                     </div>
                  </div>
               </div>

               {/* Quick Reply Bar */}
               <form onSubmit={handleCreateReply} className="p-6 bg-white border-t border-rose-50 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                     <button
                       type="button"
                       onClick={() => setReplyAnonymous(!replyAnonymous)}
                       className={`px-3 py-1.5 border rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${replyAnonymous ? 'bg-[#ff69b4] border-[#ff69b4] text-white' : 'bg-white border-rose-50 text-[#C4A0AC]'}`}
                     >
                       {replyAnonymous ? 'Replying Anonymously' : 'Replying Publicly'}
                     </button>
                  </div>
                  <div className="flex gap-3">
                     <input 
                       type="text" 
                       value={newReplyText}
                       onChange={(e) => setNewReplyText(e.target.value)}
                       placeholder="Add a heartful reply..."
                       className="flex-1 px-5 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl text-[12px] font-semibold outline-none focus:border-[#ff69b4] transition-all"
                     />
                     <button type="submit" disabled={isSubmittingReply} className="w-12 h-12 bg-[#ff69b4] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100 hover:scale-105 transition-all shrink-0">
                        <Send size={18}/>
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F5E6EA; border-radius: 10px; }
      `}</style>
    </motion.div>
  );
};

export default RelationshipScreen;

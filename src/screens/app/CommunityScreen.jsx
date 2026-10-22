import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, MessageCircle, Heart, Star, ChevronLeft, Search, Plus, CheckCircle2, X, Send, Trash2,
  Smile, Baby, Activity, Sparkles, BookOpen, Sun, Award, Zap, Target, Globe, Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import communityApi from '../../api/communityApi';

const iconMap = {
  Heart,
  Users,
  Shield,
  Star,
  Baby,
  Smile,
  Activity,
  Sparkles,
  BookOpen,
  MessageCircle,
  Sun,
  Award,
  Zap,
  Target,
  Globe,
  Brain
};

const CommunityScreen = () => {
  const navigate = useNavigate();
  const { t, langCode } = useLanguage();

  const getTranslatedCircleDetails = (group, currentLang) => {
    if (currentLang === 'en') return { name: group.name, description: group.description };

    const keyMap = {
      'Confidence': {
        hi: { name: t('community.confidence', 'आत्मविश्वास'), desc: t('community.confidenceDesc', 'महिलाओं को आंतरिक शक्ति के साथ आगे बढ़ने के लिए प्रेरित करना।') },
        mr: { name: t('community.confidence', 'आत्मविश्वास'), desc: t('community.confidenceDesc', 'महिलांना अंतर्गत शक्तीने पुढे जाण्यासाठी सक्षम करणे.') }
      },
      'Moms Circle': {
        hi: { name: t('community.momsCircle', 'मॉम्स सर्कल'), desc: t('community.momsCircleDesc', 'भावात्मक और शारीरिक स्वास्थ्य के लिए माताओं को जोड़ना।') },
        mr: { name: t('community.momsCircle', 'मॉम्स सर्कल'), desc: t('community.momsCircleDesc', 'भावनिक आणि शारीरिक आरोग्यासाठी मातांना जोडणे.') }
      },
      'PCOD Support': {
        hi: { name: t('community.pcodSupport', 'PCOD सहायता'), desc: t('community.pcodSupportDesc', 'सुरक्षित जगह में PCOD प्रबंधन और उपचार पर चर्चा करें।') },
        mr: { name: t('community.pcodSupport', 'PCOD मदत'), desc: t('community.pcodSupportDesc', 'सुरक्षित जागेत PCOD व्यवस्थापन आणि उपचारांवर चर्चा करा.') }
      },
      'Stress Support': {
        hi: { name: t('community.stressSupport', 'तनाव सहायता'), desc: t('community.stressSupportDesc', 'दैनिक जीवन में शांति पाने के लिए एक-दूसरे की मदद करना।') },
        mr: { name: t('community.stressSupport', 'तणाव मदत'), desc: t('community.stressSupportDesc', 'दैनंदिन जीवनात शांतता शोधण्यासाठी एकमेकांना मदत करणे.') }
      }
    };

    const found = keyMap[group.name];
    if (found && found[currentLang]) {
      return { name: found[currentLang].name, description: found[currentLang].desc };
    }

    return { name: group.name, description: group.description };
  };

  // State Lists
  const [circles, setCircles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Group Chat Room State
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

  // Post Detail Modal State (Forum Conversation & Replies)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReplyText, setNewReplyText] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(true);
  const [isRepliesLoading, setIsRepliesLoading] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Fetch initial database info on mount
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

  // Auto-scroll chat to bottom when messages list changes
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatCircle]);

  // Periodic polling for active chat room messages
  useEffect(() => {
    if (!activeChatCircle) return;
    
    // Poll every 4 seconds to fetch new messages
    const interval = setInterval(async () => {
      try {
        const res = await communityApi.getCircleMessages(activeChatCircle.id);
        if (res.success) {
          setChatMessages(res.messages);
        }
      } catch (err) {
        console.error('Failed to poll circle chat messages:', err);
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
        // Refresh circles list
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
          // Refresh circles list
          const circlesRes = await communityApi.getCircles();
          if (circlesRes.success) setCircles(circlesRes.circles);
        }
      } catch (err) {
        console.error('Leave circle failed:', err);
      }
    }
  };

  // Enter a Chat Room
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
      console.error('Failed to load chat messages:', err);
      triggerToast('Join this circle first to view chats!');
      setActiveChatCircle(null);
    } finally {
      setIsCircleChatLoading(false);
    }
  };

  // Send message in Chat Room
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !activeChatCircle) return;

    try {
      setIsSendingChat(true);
      const res = await communityApi.sendCircleMessage(
        activeChatCircle.id,
        newChatMessage,
        chatAnonymous
      );
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

  // Create a new forum conversation
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

  // Delete forum conversation
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

  // Open conversation details to read and reply
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

  // Create a reply to a conversation
  const handleCreateReply = async (e) => {
    e.preventDefault();
    if (!newReplyText.trim() || !selectedPost) return;

    try {
      setIsSubmittingReply(true);
      const res = await communityApi.createPostReply(
        selectedPost.id,
        newReplyText,
        replyAnonymous
      );
      if (res.success && res.reply) {
        setReplies(prev => [...prev, res.reply]);
        setNewReplyText('');
        // Update reply count locally in posts list
        setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, replies: p.replies + 1 } : p));
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const filteredGroups = circles.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

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
    <div className="min-h-screen w-full bg-[#FFF7F8] relative overflow-x-hidden font-sans text-[#15192c]">
      
      {/* ── Subtle Mesh Background ── */}
      <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full px-4 md:px-10 py-6 md:py-10"
      >
        <div className="space-y-10">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-5">
              <button 
                onClick={() => navigate('/app')}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-rose-100 flex items-center justify-center text-[#15192c] hover:bg-rose-50 transition-all shadow-sm shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                 <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#15192c]">{t('community.title', 'Women Community')}</h1>
                 <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A0AC]">{t('community.subtitle', 'Your anonymous safe space')}</p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
               <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4A0AC]" size={14} />
                  <input 
                    type="text" 
                    placeholder={t('community.searchPlaceholder', 'Search circles...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 h-11 md:h-12 bg-white/80 backdrop-blur-md border border-rose-50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#ff69b4] transition-all w-full sm:w-64 shadow-sm"
                  />
               </div>
            </div>
          </header>

          {/* Privacy Banner */}
          <motion.div variants={item} className="bg-white/50 backdrop-blur-md rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-white flex flex-col sm:flex-row items-center gap-4 md:gap-6 shadow-sm text-center sm:text-left">
             <div className="w-12 h-12 md:w-14 md:h-14 bg-[#ff69b4] rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Shield size={24} />
             </div>
             <div>
                <h3 className="text-lg md:text-xl font-black text-[#15192c]">{t('community.privacyPromise', 'Privacy Promise')}</h3>
                <p className="text-[11px] md:text-xs font-medium text-[#9A8A8E] leading-relaxed mt-1">{t('community.privacyDesc', 'Your identity remains private. Support others without judgment in our safe haven.')}</p>
             </div>
          </motion.div>

          {/* Circles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
             {filteredGroups.map((group) => {
               const IconComponent = iconMap[group.icon] || Heart;
               const { name: displayCircleName, description: displayCircleDesc } = getTranslatedCircleDetails(group, langCode);
               return (
                 <motion.div 
                   key={group.id} 
                   variants={item}
                   whileHover={{ y: -5 }}
                   className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-rose-50 shadow-sm flex flex-col items-center text-center group transition-all"
                 >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-transform group-hover:scale-105" style={{ background: `${group.color || '#ff69b4'}10` }}>
                       <IconComponent size={28} style={{ color: group.color || '#ff69b4' }} />
                    </div>
                    <h3 className="text-base md:text-lg font-black text-[#15192c] mb-2">{displayCircleName}</h3>
                    <p className="text-[10px] md:text-[11px] font-medium text-[#C4A0AC] leading-relaxed mb-4 md:mb-6">{displayCircleDesc}</p>
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
                      {group.joined ? t('community.enterChat', 'Enter Chat') : t('community.joinCircle', 'Join Circle')}
                    </button>
                 </motion.div>
               );
             })}
          </div>

        </div>
      </motion.div>

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
               <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50 flex flex-col">
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
    </div>
  );
};

export default CommunityScreen;

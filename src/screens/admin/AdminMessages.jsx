import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Trash2, Calendar, Search, Star, MessageSquare, Check, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import contactApi from '../../api/contactApi';

const AdminMessages = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('inquiries'); // 'inquiries' | 'feedbacks'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await contactApi.getMessages();
      if (res && res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await contactApi.markAsRead(id);
      if (res && res.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === id ? { ...msg, read: true } : msg
        ));
      }
    } catch (err) {
      console.error('Failed to mark message as read', err);
    }
  };

  const approveFeedback = async (id) => {
    try {
      const res = await contactApi.approveFeedback(id);
      if (res && res.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === id ? { ...msg, status: 'approved', read: true } : msg
        ));
        alert('Feedback approved! It will now appear under "Words from Our Sakhis" on the homepage.');
      }
    } catch (err) {
      console.error('Failed to approve feedback', err);
      alert('Failed to approve feedback. Please try again.');
    }
  };

  const deleteMessage = async (id, isFeedback = false) => {
    const confirmMsg = isFeedback
      ? 'Are you sure you want to reject & delete this feedback?'
      : 'Are you sure you want to delete this message?';
    if (window.confirm(confirmMsg)) {
      try {
        const res = await contactApi.deleteMessage(id);
        if (res && res.success) {
          setMessages(prev => prev.filter(msg => msg.id !== id));
        }
      } catch (err) {
        console.error('Failed to delete message', err);
      }
    }
  };

  // Filter by tab: inquiries (type !== 'feedback') vs feedbacks (type === 'feedback')
  const tabMessages = messages.filter(msg => {
    if (activeTab === 'feedbacks') return msg.type === 'feedback';
    return msg.type !== 'feedback';
  });

  const filteredMessages = tabMessages.filter(msg =>
    (msg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (msg.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (msg.message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (msg.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inquiryCount = messages.filter(m => m.type !== 'feedback').length;
  const feedbackCount = messages.filter(m => m.type === 'feedback').length;
  const pendingFeedbackCount = messages.filter(m => m.type === 'feedback' && m.status !== 'approved').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#15192c]">{t('adminMessages.title', 'User Messages & Feedbacks')}</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A0AC] mt-1">{t('adminMessages.desc', 'Manage inquiries & review user testimonials from landing page')}</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4A0AC]" />
          <input
            type="text"
            placeholder={t('adminMessages.searchPlaceholder', 'Search messages...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border rounded-2xl text-[13px] font-bold outline-none focus:border-[#ff69b4] transition-all shadow-sm"
            style={{ borderColor: '#F5E6EA' }}
          />
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-[#F5E6EA] pb-2">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'inquiries'
              ? 'bg-[#15192c] text-white shadow-md'
              : 'bg-white text-slate-600 border border-[#F5E6EA] hover:bg-slate-50'
          }`}
        >
          <MessageSquare size={16} />
          User Inquiries ({inquiryCount})
        </button>

        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all relative ${
            activeTab === 'feedbacks'
              ? 'bg-[#E91E63] text-white shadow-md'
              : 'bg-white text-slate-600 border border-[#F5E6EA] hover:bg-slate-50'
          }`}
        >
          <Star size={16} />
          Feedbacks & Testimonials ({feedbackCount})
          {pendingFeedbackCount > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse ml-1">
              {pendingFeedbackCount} Pending
            </span>
          )}
        </button>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="bg-white p-12 rounded-[3rem] border border-[#F5E6EA] shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-[#ff69b4] mb-4">
            {activeTab === 'feedbacks' ? <Star size={32} /> : <Mail size={32} />}
          </div>
          <h3 className="text-xl font-black text-[#15192c] mb-2">
            {activeTab === 'feedbacks' ? 'No feedbacks submitted yet' : t('adminMessages.noMessages', 'No messages yet')}
          </h3>
          <p className="text-sm font-bold text-[#C4A0AC]">
            {activeTab === 'feedbacks'
              ? 'When users share feedback via the landing page, it will appear here for your approval.'
              : t('adminMessages.noMessagesDesc', 'When users contact you via the landing page, their messages will appear here.')}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-[#F5E6EA] shadow-sm overflow-hidden">
          <div className="divide-y divide-[#F5E6EA]">
            <AnimatePresence>
              {filteredMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-6 md:p-8 flex flex-col md:flex-row gap-6 transition-all ${
                    msg.status === 'approved'
                      ? 'bg-emerald-50/30'
                      : !msg.read
                      ? 'bg-rose-50/30'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Avatar / Status */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#F5E6EA] shadow-sm">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=FDEEF1&color=C4607A&bold=true`} alt={msg.name} />
                    </div>
                    {msg.type === 'feedback' ? (
                      msg.status === 'approved' ? (
                        <span className="bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                          ✓ Approved
                        </span>
                      ) : (
                        <span className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                          Pending
                        </span>
                      )
                    ) : (
                      !msg.read && (
                        <span className="bg-[#ff69b4] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                          {t('adminMessages.newBadge', 'New')}
                        </span>
                      )
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-black text-[#15192c]">{msg.name}</h4>
                          {msg.role && (
                            <span className="text-[10px] font-bold text-[#E91E63] bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full">
                              {msg.role}
                            </span>
                          )}
                          {msg.type === 'feedback' && msg.rating && (
                            <div className="flex items-center gap-0.5 ml-2 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={10}
                                  fill={msg.rating >= s ? '#F59E0B' : 'none'}
                                  stroke={msg.rating >= s ? '#F59E0B' : '#CBD5E1'}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <a href={`mailto:${msg.email}`} className="text-sm font-bold text-[#ff69b4] hover:underline">{msg.email}</a>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#C4A0AC] bg-slate-50 px-3 py-1.5 rounded-full w-fit">
                        <Calendar size={12} />
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-[#F5E6EA] relative">
                      <div className="absolute top-0 left-6 -mt-1.5 w-3 h-3 bg-slate-50 border-t border-l border-[#F5E6EA] rotate-45" />
                      <p className="text-[#4B1E5A] text-sm leading-relaxed whitespace-pre-wrap relative z-10 font-medium">
                        "{msg.message}"
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center justify-center gap-3 md:pl-4 md:border-l border-[#F5E6EA]">
                    {msg.type === 'feedback' ? (
                      <>
                        {msg.status !== 'approved' && (
                          <button
                            onClick={() => approveFeedback(msg.id)}
                            className="h-10 px-4 flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md"
                            title="Accept Feedback (Show on Landing Page)"
                          >
                            <Check size={14} /> Accept
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(msg.id, true)}
                          className="h-10 px-4 flex items-center gap-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-wider transition-all shadow-sm"
                          title="Reject Feedback (Delete)"
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <>
                        {!msg.read && (
                          <button
                            onClick={() => markAsRead(msg.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            title="Mark as Read"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Delete Message"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
              {filteredMessages.length === 0 && (
                <div className="p-10 text-center text-[#C4A0AC] font-bold text-sm">
                  {t('adminMessages.noSearchResults', 'No messages match your search.')}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, Trash2, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import memberApi from '../../api/memberApi';
import { useLanguage } from '../../context/LanguageContext';
import useFeatureAccess from '../../hooks/useFeatureAccess';
import LockedFeature from '../../components/subscription/LockedFeature';

const AskHealthSakhiScreen = () => {
  const { t } = useLanguage();

  // ── Feature Gate: Ask Health Sakhi requires Premium only ──────────────
  const { isLocked: askLocked } = useFeatureAccess('askSakhi');

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [memberReplyText, setMemberReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
    const timer = setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [notifications, loadingNotifications]);

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
      console.error("Error fetching messages:", err);
    } finally {
      if (showLoading) setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDeleteMessage = async (msgId) => {
    try {
      await memberApi.deleteNotification(msgId);
      setNotifications(prev => prev.filter(n => n.id !== msgId));
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message: " + (err.response?.data?.error || err.message));
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
      console.error("Failed to send reply to admin:", err);
      alert("Failed to send message: " + (err.response?.data?.error || err.message));
    } finally {
      setSendingReply(false);
    }
  };

  // ── Feature Gate Early Return ──────────────────────────────────────────────
  if (askLocked) {
    return (
      <LockedFeature
        featureName="Ask Health Sakhi"
        requiredPlan="Basic Sakhi"
        description="Send direct messages to your Personal Consultation Doctor. Get personalized health guidance and answers. Upgrade to Basic Sakhi or Premium Sakhi plan to unlock!"
        fullPage
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#15192c] via-[#2a1b3d] to-[#4B1E5A] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff69b4]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-[#ff69b4]">
            <Sparkles size={10} /> Personal Doctor Chat
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Ask HealthSakhi</h1>
          <p className="text-[11px] font-semibold text-rose-200/80 max-w-lg leading-normal">
            Have questions or need personal guidance? Message your Personal Consultation Doctor here. Your messages are confidential and safe.
          </p>
        </div>
      </div>

      {/* Main Chat Card Box */}
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
            className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-[#ff69b4] hover:bg-rose-50 transition-all text-[11px] font-bold flex items-center gap-1"
            title="Refresh Conversation"
          >
            <RefreshCw size={12} className={loadingNotifications ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loadingNotifications && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#ff69b4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mx-auto text-[#ff69b4]">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-[#15192c]">No messages yet</p>
              <p className="text-[11px] font-semibold text-[#C4A0AC] mt-0.5 max-w-xs mx-auto">
                Type your message below to connect with your Personal Consultation Doctor.
              </p>
            </div>
          </div>
        ) : (
          /* Chat Thread Box Container */
          <div ref={chatEndRef} className="p-3 sm:p-4 bg-slate-50 border border-slate-200/80 rounded-2xl max-h-[250px] overflow-y-auto space-y-3.5 shadow-inner custom-cms-scrollbar">
            {[...notifications].reverse().map((notif) => {
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
                  <div className="relative max-w-[85%]">
                    <div className={`p-3 rounded-xl text-xs font-semibold shadow-sm leading-relaxed ${
                      isMemberReply
                        ? 'bg-rose-50 text-rose-950 border border-rose-100 rounded-tr-none'
                        : 'bg-[#15192c] text-white rounded-tl-none'
                    }`}>
                      {notif.title && !isMemberReply && (
                        <div className="font-bold text-[#ff69b4] text-[9px] uppercase tracking-wider mb-0.5">
                          {notif.title}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{notif.message}</div>
                    </div>
                    {/* Message Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(notif.id)}
                      className={`absolute top-1.5 ${isMemberReply ? '-left-6' : '-right-6'} p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover/msg:opacity-100`}
                      title="Delete Message"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Message / Reply Body Form */}
        <form onSubmit={handleSendReply} className="space-y-2 pt-1">
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
              placeholder="Type your message to your doctor..."
              value={memberReplyText}
              onChange={e => setMemberReplyText(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-slate-200 focus:border-[#ff69b4] outline-none text-xs font-semibold bg-white text-[#15192c] shadow-inner resize-none"
            />
            <button
              type="submit"
              disabled={sendingReply || !memberReplyText.trim()}
              className="px-5 py-2.5 h-10 bg-[#ff69b4] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200/50 self-end sm:self-center shrink-0"
            >
              <Send size={12} />
              {sendingReply ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskHealthSakhiScreen;

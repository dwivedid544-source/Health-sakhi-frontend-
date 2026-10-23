import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, UserMinus, Mail, Edit2, X, Plus, Trash2, Send, CheckCircle, ChevronDown, DownloadCloud, Clock, Tag, UserPlus, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { useLanguage } from '../../context/LanguageContext';
import { ReaderInsights } from './BookCMS';

const planStyle = (plan) => {
  const lower = (plan || '').toLowerCase();
  if (lower.includes('premium') || lower.includes('gold') || lower.includes('elite') || lower.includes('pro')) return 'bg-amber-100 text-amber-600 border-amber-200';
  if (lower.includes('free')) return 'bg-gray-100 text-gray-500 border-gray-200';
  return 'bg-slate-200 text-slate-600 border-slate-300';
};

const planLabel = (plan) => plan || 'Free';

// ── Premium Form Dropdown ─────────────────────────────────────────────────────
const FormDropdown = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative space-y-2" ref={dropdownRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full h-12 px-4 flex items-center justify-between bg-rose-50/20 border rounded-xl transition-all font-bold text-sm ${isOpen ? 'border-[#ff69b4] ring-2 ring-[#ff69b4]/5' : 'border-[#F5E6EA] hover:border-slate-200'}`}>
        <span className="text-slate-700">{value}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-[82px] left-0 w-full bg-white border border-[#F5E6EA] rounded-xl shadow-xl z-[60] p-1.5 animate-in fade-in duration-200 max-h-48 overflow-y-auto">
          {options.map(opt => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${value === opt ? 'bg-[#ff69b4] text-white' : 'text-slate-600 hover:bg-rose-50'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Reusable Modal Shell (Fixed Scrollbar & Inset) ──────────────────────────────
const Modal = ({ open, onClose, title, subtitle, icon: Icon, iconBg, maxWidth = "sm:max-w-xl", children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <style>{`
          .custom-user-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-user-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-user-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 1px solid transparent; background-clip: content-box; }
      `}</style>
      <div className={`bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full ${maxWidth} shadow-2xl border border-black/5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 max-h-[92vh] flex flex-col overflow-hidden relative`}>
        <div className="p-6 sm:p-8 border-b border-black/5 flex items-center justify-between flex-shrink-0 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${iconBg} text-white transition-transform hover:scale-110`}>
              <Icon size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight leading-none">{title}</h2>
              {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 truncate max-w-[180px] sm:max-w-none">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all active:scale-90"><X size={24} /></button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1 custom-user-scrollbar pr-[18px]">{children}</div>
      </div>
    </div>
  );
};

// ── EDIT MODAL ─────────────────────────────────────────────────────────────────
const EditModal = ({ user, onClose, onSave, availablePlans }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', plan: 'Free Sakhi', planSlug: 'free-sakhi', status: 'Active' });
  const [planChanged, setPlanChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    if (user) {
      const currentStatus = user.isSuspended ? 'Inactive' : 'Active';
      const userActivePlan = user.activePlan || 'Free Sakhi';
      const found = (availablePlans || []).find(p => p.name.toLowerCase() === userActivePlan.toLowerCase() || p.slug === userActivePlan);
      setForm({ 
        name: user.fullName || user.name || '', 
        email: user.email || '', 
        phone: user.phone || '', 
        plan: found ? found.name : userActivePlan,
        planSlug: found ? found.slug : '', 
        status: currentStatus
      });
      setPlanChanged(false);
    } 
  }, [user, availablePlans]);

  const handlePlanChange = (planName) => {
    const found = (availablePlans || []).find(p => p.name.toLowerCase() === planName.toLowerCase() || p.slug === planName);
    setPlanChanged(true);
    setForm(prev => ({ ...prev, plan: planName, planSlug: found ? found.slug : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fullName: form.name.trim(),
        phone: form.phone ? form.phone.trim() : '',
        status: form.status,
      };
      // Only include planSlug if admin actually changed or selected a valid plan
      if (planChanged && form.planSlug && form.planSlug.trim()) {
        payload.planSlug = form.planSlug.trim();
      }
      await onSave(payload);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert("Failed to update user profile: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const planNames = availablePlans && availablePlans.length > 0
    ? [...new Set(availablePlans.map(p => p.name))]
    : ['Free Sakhi', 'Basic Sakhi', 'Premium Sakhi'];

  return (
    <Modal open={!!user} onClose={onClose} title="Edit User Account" subtitle={user?.email} icon={Edit2} iconBg="bg-[#ff69b4]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] focus:bg-white transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98XXX XXXXX" className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] focus:bg-white transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
          <input disabled type="email" value={form.email} className="w-full h-12 px-4 bg-slate-100 border rounded-xl text-sm font-bold cursor-not-allowed text-slate-500" style={{ borderColor: '#F5E6EA' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormDropdown
            label="Subscription Plan"
            value={form.plan}
            options={planNames}
            onChange={handlePlanChange}
          />
          <FormDropdown
            label="Account Status"
            value={form.status}
            options={['Active', 'Inactive']}
            onChange={val => setForm(prev => ({ ...prev, status: val }))}
          />
        </div>
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">⚠️ Plan Change Notice</p>
          <p className="text-[10px] text-amber-700 font-semibold">Changing the plan will cancel the existing subscription and create a new 30-day subscription for the selected plan.</p>
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: '#F5E6EA' }}>
          <button type="button" disabled={loading} onClick={onClose} className="px-5 py-2.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-8 py-3 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#ff69b4]/20 flex items-center gap-2" style={{ background: '#ff69b4' }}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </Modal>
  );
};


// ── ADD MEMBER MODAL ───────────────────────────────────────────────────────────
const AddMemberModal = ({ open, onClose, onAdd, availablePlans }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', plan: 'Free Sakhi', planSlug: 'free-sakhi' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (availablePlans && availablePlans.length > 0) {
      setForm(prev => ({
        ...prev,
        plan: availablePlans[0].name,
        planSlug: availablePlans[0].slug
      }));
    }
  }, [availablePlans, open]);

  const handlePlanChange = (planName) => {
    const found = (availablePlans || []).find(p => p.name === planName);
    setForm(prev => ({ ...prev, plan: planName, planSlug: found ? found.slug : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        fullName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone ? form.phone.trim() : '',
        password: form.password,
        planSlug: form.planSlug || 'free-sakhi'
      });
      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        plan: availablePlans?.[0]?.name || 'Free Sakhi',
        planSlug: availablePlans?.[0]?.slug || 'free-sakhi'
      });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert("Failed to add member: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const planNames = availablePlans && availablePlans.length > 0
    ? availablePlans.map(p => p.name)
    : ['Free Sakhi', 'Premium Sakhi'];

  return (
    <Modal open={open} onClose={onClose} title="Add New Member" subtitle="Onboard a new sister" icon={UserPlus} iconBg="bg-slate-900">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Megha Iyer" className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 91XXX XXXXX" className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="sister@healthsakhi.com" className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
            <input required type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
        </div>
        <div className="grid grid-cols-1">
          <FormDropdown label="Initial Subscription Plan" value={form.plan} options={planNames} onChange={handlePlanChange} />
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: '#F5E6EA' }}>
          <button type="button" disabled={loading} onClick={onClose} className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-colors">Abort</button>
          <button type="submit" disabled={loading} className="px-10 py-3 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#ff69b4]/20" style={{ background: '#ff69b4' }}>
            {loading ? "Creating..." : "Commit Member"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── DELETE CONFIRMATION MODAL ───────────────────────────────────────────────────
const DeleteModal = ({ user, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (err) {
      alert("Failed to delete user: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title="Permanent Account Deletion" subtitle="Irreversible Action" icon={Trash2} iconBg="bg-red-500">
      <div className="space-y-6">
        <div className="p-5 bg-red-50 border border-red-100 rounded-[2rem] space-y-2">
          <p className="text-sm font-black text-red-700">Are you absolutely sure?</p>
          <p className="text-xs text-red-500 leading-relaxed font-bold">
            Deleting the account of {user?.fullName || user?.email} will permanently remove them from the active database. All associated session files, booking profiles, and access history will be deleted. This action is irreversible.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
          <button disabled={loading} onClick={onClose} className="px-8 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors">Abort</button>
          <button disabled={loading} onClick={handleConfirm} className="px-10 py-3 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20">
            {loading ? "Processing..." : "Yes, Delete Permanently"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── MESSAGE MODAL ─────────────────────────────────────────────────────────────────
const MailModal = ({ user, onClose, onRefreshUnread }) => {
  const [form, setForm] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
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
  }, [chatMessages, loadingChat]);

  const fetchChatThread = async () => {
    if (!user) return;
    try {
      setLoadingChat(true);
      const res = await adminApi.getUserChatThread(user.id);
      if (res.success && res.messages) {
        setChatMessages(res.messages);
      }
      if (onRefreshUnread) onRefreshUnread();
    } catch (err) {
      console.error("Failed to load chat thread for user:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleDeleteMsg = async (msgId) => {
    try {
      await adminApi.deleteNotification(msgId);
      setChatMessages(prev => prev.filter(m => m.id !== msgId));
      if (onRefreshUnread) onRefreshUnread();
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message: " + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    if (user) {
      setForm({ subject: '', body: '' });
      fetchChatThread();
    }
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.body.trim()) return;
    setLoading(true);
    try {
      await adminApi.sendDirectNotification({
        userId: user.id,
        title: form.subject || 'Admin Support Note',
        message: form.body.trim()
      });
      setForm({ subject: '', body: '' });
      await fetchChatThread();
      if (onRefreshUnread) onRefreshUnread();
    } catch (err) {
      alert("Failed to dispatch message: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title="Member Conversation & Notes" subtitle={user?.fullName || user?.email} icon={Mail} iconBg="bg-[#15192c]">
      <div className="space-y-4">
        {/* Chat History Container */}
        <div ref={chatEndRef} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl max-h-[300px] overflow-y-auto space-y-3 custom-cms-scrollbar">
          {loadingChat ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <div className="w-5 h-5 border-2 border-[#15192c] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest">Loading Conversation...</p>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-xs font-bold">No previous messages in this conversation thread.</p>
              <p className="text-[10px] uppercase font-semibold mt-1">Send a message below to start communicating with this sister.</p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isMember = msg.is_member || msg.type === 'member_reply';
              return (
                <div key={msg.id} className={`flex flex-col group/msg ${isMember ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isMember ? 'text-rose-500' : 'text-indigo-600'}`}>
                      {isMember ? `🌸 ${user?.fullName || user?.email || 'Member'}` : '🛡️ Admin Team'}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="relative max-w-[85%]">
                    <div className={`p-3.5 rounded-2xl text-xs font-semibold shadow-sm leading-relaxed ${
                      isMember
                        ? 'bg-rose-50 text-rose-950 border border-rose-100 rounded-tl-none'
                        : 'bg-[#15192c] text-white rounded-tr-none'
                    }`}>
                      {msg.title && !isMember && <div className="font-bold text-indigo-300 text-[10px] uppercase tracking-wider mb-1">{msg.title}</div>}
                      <div className="whitespace-pre-wrap">{msg.message}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMsg(msg.id)}
                      className={`absolute top-2 ${isMember ? '-right-7' : '-left-7'} p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover/msg:opacity-100`}
                      title="Delete Message"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Form */}
        <form onSubmit={handleSend} className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Message / Reply Body</label>
            <textarea required value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Type your message to sister..." className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#15192c] text-xs font-bold resize-none shadow-inner" />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" disabled={loading} onClick={onClose} className="px-6 py-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors">Close</button>
            <button type="submit" disabled={loading || !form.body.trim()} className="px-8 py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50">
              <Send size={14} /> {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
const UserManagement = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const chatUserId = searchParams.get('chatUserId');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [mailUser, setMailUser] = useState(null);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ status: 'All', plan: 'All' });
  const [unreadReplyMap, setUnreadReplyMap] = useState({});
  const [insightsUser, setInsightsUser] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);

  useEffect(() => {
    adminApi.getPlans().then(res => {
      const plans = res.plans || [];
      setAvailablePlans(plans);
    }).catch(err => {
      console.error("Failed to load plans in UserManagement:", err);
      setAvailablePlans([
        { id: 'free', name: 'Free Sakhi', slug: 'free-sakhi' },
        { id: 'premium', name: 'Premium Sakhi', slug: 'premium-sakhi' },
      ]);
    });
  }, []);

  const fetchUnreadReplies = async () => {
    try {
      const res = await adminApi.getUnreadReplies();
      if (res.success && res.userReplyMap) {
        setUnreadReplyMap(res.userReplyMap);
      }
    } catch (err) {
      console.error("Failed to fetch unread replies map:", err);
    }
  };

  useEffect(() => {
    fetchUnreadReplies();
    const interval = setInterval(fetchUnreadReplies, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleUrlChatUser = async () => {
      if (chatUserId) {
        let foundUser = users.find(u => u.id === chatUserId);
        if (!foundUser) {
          try {
            const res = await adminApi.getUser(chatUserId);
            if (res && res.success && res.user) {
              foundUser = res.user;
            }
          } catch (err) {
            console.error("Failed to fetch user for auto-chat:", err);
          }
        }
        if (foundUser) {
          setMailUser(foundUser);
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('chatUserId');
          setSearchParams(newParams, { replace: true });
        }
      }
    };
    handleUrlChatUser();
  }, [chatUserId, users, searchParams, setSearchParams]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        role: 'member'
      };
      if (search) params.search = search;
      if (filters.status !== 'All') params.status = filters.status.toLowerCase();
      
      const res = await adminApi.getUsers(params);
      
      let filteredList = res.users || [];

      // Client-side status filtering fallback
      if (filters.status !== 'All') {
        const isWantInactive = filters.status.toLowerCase() === 'inactive';
        filteredList = filteredList.filter(u => isWantInactive ? !!u.isSuspended : !u.isSuspended);
      }

      // Client-side plan filtering if specified
      if (filters.plan !== 'All') {
        filteredList = filteredList.filter(u => {
          const uPlan = (u.activePlan || '').toLowerCase();
          const filterPlan = filters.plan.toLowerCase();
          return uPlan.includes(filterPlan) || filterPlan.includes(uPlan) || uPlan.replace('sakhi', '').trim().includes(filterPlan.replace('sakhi', '').trim());
        });
      }
      
      setUsers(filteredList);
    } catch (err) {
      console.error("Failed to load user list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters.status, filters.plan]);

  const handleSaveEdit = async (data) => {
    await adminApi.updateUser(editUser.id, data);
    fetchUsers();
  };

  const handlePermanentDelete = async (id) => {
    await adminApi.deleteUser(id);
    fetchUsers();
  };

  const handleAdd = async (data) => {
    await adminApi.createUser(data);
    fetchUsers();
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Plan', 'Status', 'Role', 'Activity'];
    const rows = users.map(u => [u.id, u.fullName || u.name, u.email, u.phone, u.activePlan, u.status, u.role, u.createdAt]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Member_Database_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ActionBtns = ({ user }) => {
    const hasUnreadReply = unreadReplyMap && unreadReplyMap[user.id] && unreadReplyMap[user.id].count > 0;
    return (
      <div className="flex items-center gap-1.5 justify-end transition-opacity duration-300">
        <button onClick={() => setEditUser(user)} className="p-1.5 text-slate-400 hover:text-[#15192c] hover:bg-indigo-50 rounded-lg transition-all" title="View / Edit Profile"><Edit2 size={16} /></button>
        <button onClick={() => setMailUser(user)} className="relative p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1.5" title="Send Message / Chat Thread">
          <Mail size={16} className={hasUnreadReply ? 'text-rose-500' : ''} />
          {hasUnreadReply && (
            <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 animate-in zoom-in-95">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              💬 New Reply
            </span>
          )}
        </button>
        <button onClick={() => setInsightsUser(user)} className="p-1.5 text-slate-400 hover:text-[#ff69b4] hover:bg-pink-50 rounded-lg transition-all" title="Member Reader Insights"><BookOpen size={16} /></button>
        <button onClick={() => setDeleteUser(user)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Permanent Delete"><Trash2 size={16} /></button>
      </div>
    );
  };

  return (
    <div className="space-y-8 font-sans pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#15192c] tracking-tight leading-none mb-2">{t('adminUsers.title', 'Member Portal Management')}</h1>
          <p className="text-[#C4A0AC] font-medium tracking-tight">{t('adminUsers.desc', 'Active Database: {count} registered sisters.').replace('{count}', users.length)}</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="px-5 py-3 bg-slate-900 text-white font-black rounded-xl text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"><Plus size={16} /> {t('adminUsers.addNewMember', 'Add New Member')}</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { l: t('adminUsers.totalSisters', 'Total Sisters'), v: users.length.toString(), c: 'text-slate-800' },
          { 
            l: t('adminUsers.premiumTier', 'Premium Tier'), 
            v: users.filter(u => u.activePlan && u.activePlan.toLowerCase() !== 'no active plan' && !u.activePlan.toLowerCase().includes('free')).length.toString(), 
            c: 'text-[#15192c]' 
          },
          { l: t('adminUsers.suspendedPool', 'Inactive Members'), v: users.filter(u => u.isSuspended).length.toString(), c: 'text-red-500' },
          { 
            l: t('adminUsers.activeFree', 'Free Plan Members'), 
            v: users.filter(u => !u.activePlan || u.activePlan.toLowerCase() === 'no active plan' || u.activePlan.toLowerCase().includes('free')).length.toString(), 
            c: 'text-amber-500' 
          }
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-[1.5rem] border border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black tracking-tight ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-2 rounded-[2.5rem] border border-black/5 shadow-inner">
        <div className="flex-1 relative w-full ml-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('adminUsers.searchPlaceholder', 'Search member database...')} className="w-full h-14 pl-12 pr-4 bg-transparent outline-none font-bold text-sm" />
        </div>
        <div className="flex gap-2 pr-2">
          <button onClick={() => setShowFilter(!showFilter)} className={`px-4 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 ${showFilter ? 'bg-[#15192c] text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Filter size={16} /> {t('adminUsers.filters', 'Filters')}</button>
          <button onClick={exportCSV} className="px-4 h-10 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"><DownloadCloud size={16} /> {t('adminUsers.exportDb', 'Export DB')}</button>
        </div>
      </div>

      {showFilter && (
        <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 animate-in slide-in-from-top-4 duration-300 grid grid-cols-1 sm:grid-cols-3 gap-8 shadow-xl">
          {['status', 'plan'].map(key => (
            <div key={key} className="space-y-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{key}</p>
              <div className="flex flex-wrap gap-2">
                {(key === 'status' 
                  ? ['All', 'Active', 'Inactive'] 
                  : ['All', ...(availablePlans.length > 0 ? availablePlans.map(p => p.name) : ['Free Sakhi', 'Premium Sakhi'])]
                ).map(o => (
                  <button key={o} onClick={() => setFilters(f => ({ ...f, [key]: o }))} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filters[key] === o ? 'bg-[#ff69b4] text-white shadow-lg' : 'bg-rose-50/50 text-[#C4A0AC] hover:bg-rose-50'}`}>{o}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#ff69b4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-black/5">
                <tr><th className="px-6 py-4">{t('adminUsers.sisterDetails', 'Sister Details')}</th><th className="px-6 py-4">{t('adminUsers.accessTier', 'Access Tier')}</th><th className="px-6 py-4">{t('adminUsers.contact', 'Contact')}</th><th className="px-6 py-4">{t('adminUsers.status', 'Status')}</th><th className="px-6 py-4 text-right">{t('adminUsers.console', 'Console')}</th></tr>
              </thead>
              <tbody className="text-sm divide-y divide-black/5">
                {users.map(user => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shadow-lg">
                          {(user.fullName || 'User').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 tracking-tight leading-none mb-1 text-sm">{user.fullName || 'Standard User'}</p>
                          <p className="text-[9px] text-slate-400 font-bold tracking-widest">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border whitespace-nowrap ${planStyle(user.activePlan)}`}>
                        {planLabel(user.activePlan)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-600 text-xs">{user.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${user.isSuspended ? 'text-red-500' : 'text-emerald-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isSuspended ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        {user.isSuspended ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4"><ActionBtns user={user} /></td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase">
                      {t('adminUsers.noMatching', 'No matching records found.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddMemberModal open={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} availablePlans={availablePlans} />
      <EditModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSaveEdit} availablePlans={availablePlans} />
      <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handlePermanentDelete} />
      <MailModal user={mailUser} onClose={() => setMailUser(null)} onRefreshUnread={fetchUnreadReplies} />
      {insightsUser && (
        <Modal
          open={!!insightsUser}
          onClose={() => setInsightsUser(null)}
          title={`${insightsUser.fullName || insightsUser.name || 'Member'}'s Reader Insights`}
          subtitle="Member Reading Analytics & Engagement"
          icon={BookOpen}
          iconBg="bg-[#ff69b4]"
          maxWidth="sm:max-w-5xl"
        >
          <ReaderInsights targetUserId={insightsUser.id} showSidebar={false} />
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;

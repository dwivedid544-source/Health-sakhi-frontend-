import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Mail, Edit2, X, Plus, Trash2, Send, CheckCircle, ChevronDown, DownloadCloud, Share2 } from 'lucide-react';
import adminApi from '../../api/adminApi';

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
        <div className="absolute top-[74px] left-0 w-full bg-white border border-black/5 rounded-xl shadow-xl z-[60] p-1.5 animate-in slide-in-from-top-2 duration-200">
          {options.map((opt) => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${value === opt ? 'bg-[#ff69b4] text-white' : 'text-slate-600 hover:bg-rose-50'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Reusable Modal Shell ────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, subtitle, icon: Icon, iconBg, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <style>{`
          .custom-user-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-user-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-user-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 1px solid transparent; background-clip: content-box; }
      `}</style>
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full sm:max-w-xl shadow-2xl border border-black/5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 max-h-[92vh] flex flex-col overflow-hidden relative">
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

// ── EDIT PARTNER MODAL ─────────────────────────────────────────────────────────
const EditPartnerModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'Active' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    if (user) {
      const currentStatus = user.isSuspended ? 'Suspended' : (user.isApproved ? 'Active' : 'Pending');
      setForm({ 
        name: user.fullName || user.name || '', 
        email: user.email || '', 
        phone: user.phone || '', 
        status: currentStatus
      }); 
    } 
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fullName: form.name,
        phone: form.phone,
        status: form.status,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      alert("Failed to update partner profile: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title="Edit Partner Account" subtitle={user?.email} icon={Edit2} iconBg="bg-[#ff69b4]">
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
        <div className="grid grid-cols-1">
          <FormDropdown
            label="Account Status"
            value={form.status}
            options={['Active', 'Pending', 'Suspended']}
            onChange={val => setForm(prev => ({ ...prev, status: val }))}
          />
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: '#F5E6EA' }}>
          <button type="button" disabled={loading} onClick={onClose} className="px-5 py-2.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-8 py-3 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#ff69b4]/20 flex items-center gap-2" style={{ background: '#ff69b4' }}>
            {loading ? "Updating..." : "Update Partner"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── ADD PARTNER MODAL ───────────────────────────────────────────────────────────
const AddPartnerModal = ({ open, onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'Affiliate'
      });
      setForm({ name: '', email: '', phone: '', password: '' });
      onClose();
    } catch (err) {
      alert("Failed to add partner: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Partner" subtitle="Onboard a growth affiliate" icon={Share2} iconBg="bg-slate-900">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Karan Shah" className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 91XXX XXXXX" className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="partner@healthsakhi.com" className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
            <input required type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" className="w-full h-12 px-4 bg-rose-50/20 border rounded-xl outline-none focus:border-[#ff69b4] transition-all text-sm font-bold shadow-inner" style={{ borderColor: '#F5E6EA' }} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: '#F5E6EA' }}>
          <button type="button" disabled={loading} onClick={onClose} className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-colors">Abort</button>
          <button type="submit" disabled={loading} className="px-10 py-3 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20" style={{ background: '#15192c' }}>
            {loading ? "Creating..." : "Commit Partner"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── DELETE PARTNER MODAL ────────────────────────────────────────────────────────
const DeletePartnerModal = ({ user, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (err) {
      alert("Failed to delete partner: " + (err.response?.data?.error || err.message));
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
            Deleting the account of {user?.fullName || user?.email} will permanently remove them from the active database. All associated referral campaigns, earnings record, and payout logs will be deleted.
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

// ── MAIL PARTNER MODAL ───────────────────────────────────────────────────────────
const MailPartnerModal = ({ user, onClose }) => {
  const [form, setForm] = useState({ subject: '', body: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ subject: '', body: '' });
      setSent(false);
      
      const fetchLastMessage = async () => {
        try {
          const res = await adminApi.getUserNotifications(user.id);
          if (res.success && res.notifications && res.notifications.length > 0) {
            const lastMsg = res.notifications[0];
            setForm({
              subject: lastMsg.title || '',
              body: lastMsg.message || ''
            });
          }
        } catch (err) {
          console.error("Failed to fetch last notification for partner:", err);
        }
      };

      fetchLastMessage();
    }
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.sendDirectNotification({
        userId: user.id,
        title: form.subject,
        message: form.body
      });
      setSent(true);
      setForm({ subject: '', body: '' });
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 1800);
    } catch (err) {
      alert("Failed to dispatch message: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title="Send Notification to Partner" subtitle={user?.fullName || user?.email} icon={Mail} iconBg="bg-[#15192c]">
      {sent ? (
        <div className="flex flex-col items-center justify-center py-10 gap-4 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center shadow-inner">
            <CheckCircle size={40} style={{ color: '#ff69b4' }} />
          </div>
          <p className="text-xl font-black text-slate-800">Notification Sent!</p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-5">
          <div className="space-y-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Title</label>
              <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full h-12 px-4 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold shadow-inner" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Body</label>
              <textarea required value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="w-full h-32 p-4 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold resize-none shadow-inner" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-black/5">
            <button type="button" disabled={loading} onClick={onClose} className="px-8 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors">Discard</button>
            <button type="submit" disabled={loading} className="px-10 py-3 bg-[#ff69b4] text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-pink-500/20 flex items-center gap-2">
              <Send size={15} /> {loading ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [deletePartner, setDeletePartner] = useState(null);
  const [mailPartner, setMailPartner] = useState(null);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ status: 'All' });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = {
        role: 'affiliate'
      };
      if (search) params.search = search;
      if (filters.status !== 'All') params.status = filters.status.toLowerCase();
      
      const res = await adminApi.getUsers(params);
      setPartners(res.users || []);
    } catch (err) {
      console.error("Failed to load partner list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters.status]);

  const handleSaveEdit = async (data) => {
    await adminApi.updateUser(editPartner.id, data);
    fetchPartners();
  };

  const handlePermanentDelete = async (id) => {
    await adminApi.deleteUser(id);
    fetchPartners();
  };

  const handleAdd = async (data) => {
    await adminApi.createUser(data);
    fetchPartners();
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Referral Code', 'Total Earnings (INR)', 'Status', 'Registered At'];
    const rows = partners.map(p => [p.id, p.fullName || p.name, p.email, p.phone, p.referralCode || 'N/A', p.totalEarnings || 0, p.status, p.createdAt]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Partner_Database_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#15192c] tracking-tight leading-none mb-2">Partner Network Management</h1>
          <p className="text-[#C4A0AC] font-medium tracking-tight">Active Growth Partners: <span className="text-[#ff69b4] font-black">{partners.length} registered affiliates.</span></p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="px-5 py-3 bg-slate-900 text-white font-black rounded-xl text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"><Plus size={16} /> Add New Partner</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { l: 'Total Partners', v: partners.length.toString(), c: 'text-slate-800' },
          { l: 'Total Network Earnings', v: `₹${partners.reduce((sum, p) => sum + (p.totalEarnings || 0), 0).toLocaleString('en-IN')}`, c: 'text-[#ff69b4]' },
          { l: 'Suspended Pool', v: partners.filter(p => p.isSuspended).length.toString(), c: 'text-red-500' },
          { l: 'Pending Approval', v: partners.filter(p => !p.isApproved).length.toString(), c: 'text-amber-500' }
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
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partner network..." className="w-full h-14 pl-12 pr-4 bg-transparent outline-none font-bold text-sm" />
        </div>
        <div className="flex gap-2 pr-2">
          <button onClick={() => setShowFilter(!showFilter)} className={`px-4 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 ${showFilter ? 'bg-[#15192c] text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Filter size={16} /> Filters</button>
          <button onClick={exportCSV} className="px-4 h-10 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"><DownloadCloud size={16} /> Export DB</button>
        </div>
      </div>

      {showFilter && (
        <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 animate-in slide-in-from-top-4 duration-300 grid grid-cols-1 gap-8 shadow-xl">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Status Filter</p>
            <div className="flex flex-wrap gap-2">
              {['All', 'Active', 'Pending', 'Suspended'].map(o => (
                <button key={o} onClick={() => setFilters(f => ({ ...f, status: o }))} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filters.status === o ? 'bg-[#ff69b4] text-white shadow-lg' : 'bg-rose-50/50 text-[#C4A0AC] hover:bg-rose-50'}`}>{o}</button>
              ))}
            </div>
          </div>
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
                <tr>
                  <th className="px-6 py-4">Partner Details</th>
                  <th className="px-6 py-4">Referral Code</th>
                  <th className="px-6 py-4">Contact No</th>
                  <th className="px-6 py-4">Earnings Generated</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Console</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-black/5">
                {partners.map(partner => (
                  <tr key={partner.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shadow-lg">
                          {(partner.fullName || 'Partner').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 tracking-tight leading-none mb-1 text-sm">{partner.fullName || 'Affiliate Partner'}</p>
                          <p className="text-[9px] text-slate-400 font-bold tracking-widest">{partner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      <span className="px-2.5 py-1.5 rounded-lg bg-pink-50 text-[#ff69b4] border border-pink-100 font-mono tracking-wider text-xs">
                        {partner.referralCode || 'NOT_ONBOARDED'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-600 text-xs">{partner.phone || 'No Phone'}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ₹{Number(partner.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${partner.isSuspended ? 'text-red-500' : (!partner.isApproved ? 'text-amber-500' : 'text-emerald-500')}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${partner.isSuspended ? 'bg-red-500' : (!partner.isApproved ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')}`}></div>
                        {partner.isSuspended ? 'Suspended' : (!partner.isApproved ? 'Pending' : 'Active')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setEditPartner(partner)} className="p-1.5 text-slate-400 hover:text-[#15192c] hover:bg-indigo-50 rounded-lg transition-all" title="Edit Partner"><Edit2 size={16} /></button>
                        <button onClick={() => setMailPartner(partner)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Message"><Mail size={16} /></button>
                        <button onClick={() => setDeletePartner(partner)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Permanent"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase">
                      No partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddPartnerModal open={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
      <EditPartnerModal user={editPartner} onClose={() => setEditPartner(null)} onSave={handleSaveEdit} />
      <DeletePartnerModal user={deletePartner} onClose={() => setDeletePartner(null)} onConfirm={handlePermanentDelete} />
      <MailPartnerModal user={mailPartner} onClose={() => setMailPartner(null)} />
    </div>
  );
};

export default PartnerManagement;

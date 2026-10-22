import React, { useState, useRef, useEffect } from 'react';
import { Send, Bell, Mail, Smartphone, Plus, Search, Calendar, CheckCircle2, MoreVertical, Edit2, ShieldCheck, X, ChevronDown, Clock, Users, Target, Info, Trash2, TrendingUp } from 'lucide-react';
import adminApi from '../../api/adminApi';

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
      <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: '#C4A0AC' }}>{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full h-12 px-5 flex items-center justify-between bg-rose-50/20 border rounded-xl transition-all font-bold text-sm ${isOpen ? 'border-[#ff69b4] ring-4 ring-[#ff69b4]/5' : 'border-[#F5E6EA] hover:border-slate-200'}`}>
        <span className="text-slate-700">{value}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-[78px] left-0 w-full bg-white border rounded-xl shadow-xl z-[60] p-1.5 animate-in slide-in-from-top-2 duration-200" style={{ borderColor: '#F5E6EA' }}>
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

const CMSModal = ({ open, onClose, title, icon: Icon, iconBg, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#15192c]/60 backdrop-blur-md animate-in fade-in duration-200">
      <style>{`
          .custom-cmp-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-cmp-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-cmp-scrollbar::-webkit-scrollbar-thumb { background: #FDEEF1; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
      `}</style>
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full sm:max-w-2xl shadow-2xl border animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 max-h-[92vh] flex flex-col overflow-hidden relative" style={{ borderColor: '#F5E6EA' }}>
        <div className="p-6 sm:p-8 border-b flex items-center justify-between flex-shrink-0 bg-rose-50/30" style={{ borderColor: '#F5E6EA' }}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${iconBg} text-white`}>
              <Icon size={20} />
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-none" style={{ color: '#15192c' }}>{title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-[#C4A0AC] hover:bg-rose-50 rounded-full transition-all active:scale-90"><X size={24} /></button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1 custom-cmp-scrollbar pr-[18px]">{children}</div>
      </div>
    </div>
  );
};

const CampaignCenter = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [formData, setFormData] = useState({ id: null, name: '', audience: 'All App Users', type: 'Email + Push', body: '', date: '', time: '' });
  const [quickMessage, setQuickMessage] = useState('');
  const [quickChannel, setQuickChannel] = useState('Push');
  const [isSendingFlash, setIsSendingFlash] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [purgeCmp, setPurgeCmp] = useState(null);
  const [resendCmp, setResendCmp] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (err) {
      console.error("Failed to load campaigns catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filtered = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'All' || c.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSendingFlash(true);
    try {
      let targetRole = 'all';
      const aud = formData.audience.toLowerCase();
      if (aud.includes('member') || aud.includes('sister')) targetRole = 'member';
      else if (aud.includes('pro') || aud.includes('advisor')) targetRole = 'advisor';
      else if (aud.includes('affiliate')) targetRole = 'affiliate';

      let channel = 'push';
      if (formData.type.toLowerCase().includes('email')) channel = 'email';

      const payload = {
        name: formData.name,
        targetRole,
        channel,
        subject: formData.name,
        content: formData.body
      };

      const res = await adminApi.createCampaign(payload);
      
      // Auto-trigger immediate dispatch (as requested: support immediate execution only)
      await adminApi.triggerCampaign(res.campaign.id);

      alert("Campaign created and immediately broadcasted successfully!");
      setIsModalOpen(false);
      setFormData({ id: null, name: '', audience: 'All App Users', type: 'Email + Push', body: '', date: '', time: '' });
      fetchCampaigns();
    } catch (err) {
      alert("Failed to trigger broadcast: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSendingFlash(false);
    }
  };

  const handleResend = async () => {
    setIsSendingFlash(true);
    try {
      await adminApi.triggerCampaign(resendCmp.id);
      alert(`Re-dispatch of "${resendCmp.name}" complete!`);
      setResendCmp(null);
      setActiveMenu(null);
      fetchCampaigns();
    } catch (err) {
      alert("Failed to trigger broadcast resend: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSendingFlash(false);
    }
  };

  const handleQuickSend = async () => {
    if (!quickMessage.trim()) return;
    setIsSendingFlash(true);
    try {
      const payload = {
        name: `Flash Broadcast - ${new Date().toLocaleDateString()}`,
        targetRole: 'all',
        channel: quickChannel.toLowerCase(),
        subject: `Platform Announcement`,
        content: quickMessage
      };

      const res = await adminApi.createCampaign(payload);
      await adminApi.triggerCampaign(res.campaign.id);

      alert(`Flash Broadcast dispatched via ${quickChannel}! All nodes verified.`);
      setQuickMessage('');
      fetchCampaigns();
    } catch (err) {
      alert("Failed to send flash broadcast: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSendingFlash(false);
    }
  };

  const mapAudience = (role) => {
    if (role === 'all') return 'All App Users';
    if (role === 'member') return 'Standard Members';
    if (role === 'advisor') return 'Verified Advisors';
    if (role === 'affiliate') return 'Affiliate Partners';
    return role;
  };

  return (
    <div className="space-y-10 font-sans pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight leading-none mb-2" style={{ color: '#15192c' }}>Campaign Center</h1>
          <p className="text-sm font-medium" style={{ color: '#C4A0AC' }}>Broadcast health reminders, offer codes, and <span className="font-black" style={{ color: '#ff69b4' }}>content updates.</span></p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#15192c] text-white font-black rounded-2xl text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-[#15192c]/20"
        >
          <Plus size={18} /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campaigns Table */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-3 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-rose-50/20 px-2 lg:px-5">
              <div className="flex flex-wrap gap-2">
                {['All', 'Sent', 'Draft'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-[#15192c] text-white shadow-lg' : 'bg-white text-[#C4A0AC] border border-[#F5E6EA] hover:bg-rose-50'}`}>{t}</button>
                ))}
              </div>
              <div className="relative w-full lg:max-w-xs px-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4A0AC]" size={16} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find campaign..." className="w-full h-11 pl-10 pr-4 bg-white border rounded-xl text-xs font-bold outline-none focus:border-[#ff69b4] transition-all shadow-sm" style={{ borderColor: '#F5E6EA' }} />
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#ff69b4] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-rose-50/30 text-[#C4A0AC] text-[10px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-4 py-4">Campaign Info</th>
                      <th className="px-4 py-4">Channel</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filtered.map((cmp) => (
                      <tr key={cmp.id} className="hover:bg-rose-50/10 transition-colors group">
                        <td className="px-4 py-4">
                          <p className="font-extrabold text-[#15192c] tracking-tight leading-none mb-1">{cmp.name}</p>
                          <div className="flex items-center gap-2"><span className="text-[9px] text-[#C4A0AC] font-bold uppercase tracking-widest">Target: {mapAudience(cmp.target_role)}</span></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-slate-400">
                            {cmp.channel === 'email' ? <Mail size={14} className="text-blue-500" /> : <Smartphone size={14} style={{ color: '#ff69b4' }} />}
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9A8A8E' }}>{cmp.channel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest ${cmp.status === 'sent' ? 'text-emerald-500' : 'text-[#C4A0AC]'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${cmp.status === 'sent' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-[#C4A0AC]'}`}></div>
                            {cmp.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right relative">
                          <button onClick={() => setActiveMenu(activeMenu === cmp.id ? null : cmp.id)} className={`p-2 bg-white border rounded-lg hover:shadow-sm transition-all shadow-sm ${activeMenu === cmp.id ? 'border-[#ff69b4] ring-4 ring-[#ff69b4]/5 text-[#ff69b4]' : 'text-[#C4A0AC] border-[#F5E6EA] hover:text-[#15192c] hover:border-[#C4A0AC]'}`}>
                            <MoreVertical size={16} />
                          </button>
                          {activeMenu === cmp.id && (
                            <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-white border rounded-2xl shadow-2xl z-20 p-2 min-w-[160px] animate-in slide-in-from-right-2 duration-300" style={{ borderColor: '#F5E6EA' }}>
                              <button onClick={() => setResendCmp(cmp)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-rose-50 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"><Send size={14} /> Resend Now</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-10 text-center text-[9px] font-black text-[#C4A0AC] uppercase tracking-widest">No matching broadcasts</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Quick Compose Tooling */}
        <div className="space-y-5 animate-in slide-in-from-right-6 duration-500">
          <h2 className="text-lg font-bold tracking-tight px-2 leading-none" style={{ color: '#15192c' }}>Flash Broadcast</h2>
          <div className="bg-white rounded-[2.5rem] p-6 border shadow-2xl space-y-5 relative overflow-hidden" style={{ borderColor: '#F5E6EA' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-10" style={{ background: '#ff69b4' }}></div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-[#C4A0AC] uppercase tracking-[0.2em] ml-2">Primary Channel</label>
              <div className="flex gap-2 p-1.5 bg-rose-50/20 rounded-2xl border shadow-inner" style={{ borderColor: '#F5E6EA' }}>
                <button onClick={() => setQuickChannel('Push')} className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${quickChannel === 'Push' ? 'bg-white shadow-xl text-[#ff69b4] scale-[1.02] border border-[#F5E6EA]' : 'text-[#C4A0AC] hover:bg-white/50'}`}>
                  <Smartphone size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Push App</span>
                </button>
                <button onClick={() => setQuickChannel('Email')} className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${quickChannel === 'Email' ? 'bg-white shadow-xl text-blue-500 scale-[1.02] border border-[#F5E6EA]' : 'text-[#C4A0AC] hover:bg-white/50'}`}>
                  <Mail size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-[0.2em] ml-2">Express Message</label>
              <textarea value={quickMessage} onChange={e => setQuickMessage(e.target.value)} placeholder="Type a high-priority health alert..." className="w-full h-28 p-4 bg-rose-50/20 border rounded-[2rem] outline-none focus:border-[#ff69b4] focus:bg-white transition-all text-sm font-bold leading-relaxed resize-none shadow-inner" style={{ borderColor: '#F5E6EA' }}></textarea>
            </div>
            <button onClick={handleQuickSend} disabled={isSendingFlash || !quickMessage.trim()} className="w-full py-3 text-white rounded-[2rem] font-bold text-[9px] uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-[#15192c]/20" style={{ background: '#15192c' }}>
              {isSendingFlash ? <><Clock size={14} className="animate-spin" /> Distributing...</> : <>Launch Broadcast <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
            </button>
            <div className="flex items-center justify-center gap-2 p-4 bg-rose-50/20 rounded-2xl border" style={{ borderColor: '#F5E6EA' }}>
              <ShieldCheck size={14} style={{ color: '#ff69b4' }} />
              <span className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-widest">Authorized Multi-Node Send</span>
            </div>
          </div>
        </div>
      </div>

      <CMSModal open={isModalOpen} onClose={() => { setIsModalOpen(false); setFormData({ id: null, name: '', audience: 'All App Users', type: 'Email + Push', body: '', date: '', time: '' }); }} title="New Broadcast Campaign" icon={Bell} iconBg="bg-[#15192c]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-widest ml-1">Internal Campaign Title</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-11 px-4 bg-rose-50/20 border rounded-2xl outline-none focus:bg-white focus:border-[#ff69b4] text-sm font-bold shadow-inner" placeholder="e.g. Diwali Wellness Mega Sale 2026" style={{ borderColor: '#F5E6EA' }} />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <FormDropdown label="Target Segment" value={formData.audience} options={['All App Users', 'Sisters Pool (Members)', 'Verified Advisors', 'Affiliate Partners']} onChange={val => setFormData({ ...formData, audience: val })} />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <FormDropdown label="Delivery Core" value={formData.type} options={['Push Only', 'Email Only']} onChange={val => setFormData({ ...formData, type: val })} />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-widest ml-1">Marketing Copy / Body Content</label>
              <textarea required value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })} className="w-full h-32 p-4 bg-rose-50/20 border rounded-[2rem] outline-none focus:bg-white focus:border-[#ff69b4] text-sm font-bold resize-none shadow-inner leading-relaxed" placeholder="Draft the actual message..." style={{ borderColor: '#F5E6EA' }}></textarea>
            </div>

            <div className="col-span-2 p-5 bg-rose-50/20 border rounded-2xl flex items-start gap-4" style={{ borderColor: '#F5E6EA' }}>
              <Info size={20} className="text-[#ff69b4] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-[#C4A0AC] leading-relaxed uppercase tracking-widest">Heads up: Campaign execution is immediate. Broadcasts may take up to 30 seconds.</p>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row justify-end gap-3 mt-4" style={{ borderColor: '#F5E6EA' }}>
            <button type="button" disabled={isSendingFlash} onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-[#C4A0AC] font-bold text-[9px] uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all">Cancel</button>
            <button type="submit" disabled={isSendingFlash} className="px-6 py-2 text-white font-bold text-[9px] uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#15192c]/20" style={{ background: '#15192c' }}>
              {isSendingFlash ? "Broadcasting..." : "Launch Immediate Broadcast"}
            </button>
          </div>
        </form>
      </CMSModal>

      {/* Resend Intelligence Modal */}
      <CMSModal open={!!resendCmp} onClose={() => setResendCmp(null)} title="Dispatch Intelligence" icon={Send} iconBg="bg-[#ff69b4]">
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="p-6 bg-rose-50/30 rounded-[2.5rem] border flex items-center justify-between relative overflow-hidden" style={{ borderColor: '#F5E6EA' }}>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-[#C4A0AC] uppercase tracking-widest mb-1">Impact Analysis</p>
              <h4 className="text-2xl font-bold tracking-tight leading-none" style={{ color: '#15192c' }}>Ready to Re-dispatch</h4>
            </div>
            <div className="w-14 h-14 bg-white text-[#ff69b4] border rounded-2xl flex items-center justify-center shadow-xl" style={{ borderColor: '#F5E6EA' }}><TrendingUp size={28} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-rose-50/20 border rounded-3xl space-y-3" style={{ borderColor: '#F5E6EA' }}>
              <p className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-widest">Target Audience</p>
              <p className="text-sm font-bold" style={{ color: '#15192c' }}>{mapAudience(resendCmp?.target_role)}</p>
            </div>
            <div className="p-6 bg-rose-50/20 border rounded-3xl space-y-3" style={{ borderColor: '#F5E6EA' }}>
              <p className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-widest">Est. Channel Core</p>
              <p className="text-sm font-bold" style={{ color: '#15192c' }}>{resendCmp?.channel.toUpperCase()}</p>
            </div>
          </div>

          <p className="px-4 text-xs font-medium text-[#9A8A8E] leading-relaxed text-center italic">Confirming this action will re-broadcast the exact same copy immediately.</p>

          <div className="flex gap-4">
            <button onClick={handleResend} disabled={isSendingFlash} className="flex-1 py-3 text-white font-bold text-[9px] uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#15192c]/20" style={{ background: '#15192c' }}>
              {isSendingFlash ? 'Re-Dispatching...' : 'Confirm Resend'}
            </button>
            <button onClick={() => setResendCmp(null)} className="px-4 py-3 bg-rose-50 text-[#C4A0AC] font-bold text-[9px] uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all">Abort</button>
          </div>
        </div>
      </CMSModal>
    </div>
  );
};

export default CampaignCenter;

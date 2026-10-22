import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Video, User, ShieldCheck, Search, Filter, ArrowRight, Activity, X, ChevronDown, CheckCircle, Trash2, Edit2, Eye, ExternalLink, Mail, Phone, Info, FileText } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

// ── Sample Appointments Data ──────────────────────────────────────────────────
const INITIAL_APPOINTMENTS = [
  { id: 'APT-901', time: '10:00 AM', user: 'Ananya Iyer', advisor: 'Dr. Sakshi', status: 'Live', type: 'Video', email: 'ananya@live.com', duration: '45 min' },
  { id: 'APT-902', time: '11:30 AM', user: 'Ritu Verma', advisor: 'Dr. Ramesh', status: 'Scheduled', type: 'Audio', email: 'ritu@verma.com', duration: '30 min' },
  { id: 'APT-903', time: '02:00 PM', user: 'Sneha Patel', advisor: 'Nutritionist Priya', status: 'Scheduled', type: 'Video', email: 'sneha.p@gmail.com', duration: '1 hour' },
  { id: 'APT-904', time: '04:30 PM', user: 'Kavita Singh', advisor: 'Dr. Sakshi', status: 'Review', type: 'Video', email: 'kavita@healthsakhi.com', duration: '45 min' },
];

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
      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C4A0AC' }}>{label}</label>
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

// ── Reusable Modal Shell ──────────────────────────────────────────────────────
const CMSModal = ({ open, onClose, title, icon: Icon, iconBg, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#15192c]/60 backdrop-blur-md animate-in fade-in duration-200">
      <style>{`
          .custom-apt-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-apt-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-apt-scrollbar::-webkit-scrollbar-thumb { background: #FDEEF1; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
      `}</style>
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full sm:max-w-xl shadow-2xl border animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 max-h-[92vh] flex flex-col overflow-hidden relative" style={{ borderColor: '#F5E6EA' }}>
        <div className="p-6 sm:p-8 border-b flex items-center justify-between flex-shrink-0 bg-rose-50/30" style={{ borderColor: '#F5E6EA' }}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${iconBg} text-white`}>
              <Icon size={20} />
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-none" style={{ color: '#15192c' }}>{title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-[#C4A0AC] hover:bg-rose-50 rounded-full transition-all active:scale-90"><X size={24} /></button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1 custom-apt-scrollbar pr-[18px]">{children}</div>
      </div>
    </div>
  );
};

import { useLanguage } from '../../context/LanguageContext';

const GlobalAppointments = () => {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('All Mode');
  const [viewApt, setViewApt] = useState(null);
  const [activeView, setActiveView] = useState('Grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/appointments');
      const rawAppts = res.data?.appointments || res.data || [];
      const mapped = rawAppts.map(appt => {
        let displayStatus = appt.status || 'scheduled';
        displayStatus = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);
        return {
          ...appt,
          status: displayStatus
        };
      });
      setAppointments(mapped);
    } catch (err) {
      console.error("Error loading appointments:", err);
      setError("Failed to fetch appointments from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleGenerateLog = () => {
      setIsGenerating(true);
      setTimeout(() => {
          setIsGenerating(false);
          const headers = ['Apt ID', 'Time', 'Patient', 'Expert', 'Status', 'Mode', 'Duration', 'Contact'];
          const rows = appointments.map(a => [a.id, a.time, a.user, a.advisor, a.status, a.type, a.duration, a.email]);
          const csvContent = [headers, ...rows].map(e => e.join(',')).join("\n");
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `Operation_Log_${new Date().toLocaleDateString()}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }, 2000);
  };

  const handleJoinSession = () => {
      setIsJoining(true);
      setTimeout(() => {
          setIsJoining(false);
          alert(`Secure connection established with ${viewApt?.advisor}. Opening session node...`);
          const meetingLink = `https://meet.jit.si/health-sakhi-${viewApt?.id}`;
          window.open(meetingLink, '_blank');
      }, 1500);
  };

  const filtered = appointments.filter(apt => {
      const matchesSearch = (apt.user || '').toLowerCase().includes(search.toLowerCase()) || 
                            (apt.id || '').toLowerCase().includes(search.toLowerCase()) || 
                            (apt.advisor || '').toLowerCase().includes(search.toLowerCase());
      const matchesMode = filterMode === 'All Mode' || (filterMode === 'Live' && apt.status === 'Live') || (filterMode === 'Scheduled' && apt.status === 'Scheduled');
      const matchesView = activeView === 'Grid' 
        ? (apt.status === 'Scheduled' || apt.status === 'Pending' || apt.status === 'Live') 
        : (apt.status === 'Completed' || apt.status === 'Cancelled' || apt.status === 'Review');
      return matchesSearch && matchesMode && matchesView;
  });

  // Calculate dynamic stats
  const liveCount = appointments.filter(a => a.status === 'Live' || a.status === 'Pending').length;
  const pendingCount = appointments.filter(a => a.status === 'Scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const totalCount = appointments.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-10 font-sans pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight leading-none mb-2" style={{ color: '#15192c' }}>{t('adminGlobalAppointments.title', 'Consultation Master-View')}</h1>
          <p className="text-sm font-medium" style={{ color: '#C4A0AC' }}>{t('adminGlobalAppointments.desc', 'Monitoring all active wellness sessions across the platform.')}</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border shadow-sm" style={{ borderColor: '#F5E6EA' }}>
           <button onClick={() => setActiveView('Grid')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${activeView === 'Grid' ? 'bg-[#15192c] text-white' : 'bg-transparent text-[#C4A0AC] hover:text-[#15192c] hover:bg-rose-50'}`}>{t('adminGlobalAppointments.realtimeGrid', 'Real-time Grid')}</button>
           <button onClick={() => setActiveView('History')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${activeView === 'History' ? 'bg-[#15192c] text-white' : 'bg-transparent text-[#C4A0AC] hover:text-[#15192c] hover:bg-rose-50'}`}>{t('adminGlobalAppointments.historyLog', 'History Log')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col lg:flex-row items-center gap-4">
               <div className="relative w-full lg:flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('adminGlobalAppointments.searchPlaceholder', 'Search by patient name, advisor or appointment ID...')} className="w-full h-11 pl-10 pr-5 bg-white border rounded-2xl outline-none focus:ring-4 focus:ring-[#ff69b4]/5 focus:border-[#ff69b4] transition-all text-sm font-bold shadow-sm" style={{ borderColor: '#F5E6EA' }} />
               </div>
               <div className="flex w-full lg:w-auto gap-2">
                   {['All Mode', 'Live', 'Scheduled'].map(mode => (
                       <button key={mode} onClick={() => setFilterMode(mode)} className={`flex-1 lg:flex-none h-11 px-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${filterMode === mode ? 'bg-[#15192c] text-white shadow-lg' : 'bg-white border text-[#C4A0AC] hover:bg-rose-50'}`} style={{ borderColor: '#F5E6EA' }}>
                           {t(`adminGlobalAppointments.mode.${mode.toLowerCase().replace(' ', '')}`, mode)}
                       </button>
                   ))}
               </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-black/5 shadow-sm overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-black/5">
                        <tr>
                           <th className="px-4 py-4">{t('adminGlobalAppointments.idSchedule', 'ID & Schedule')}</th>
                           <th className="px-4 py-4">{t('adminGlobalAppointments.participants', 'Participants')}</th>
                           <th className="px-4 py-4">{t('adminGlobalAppointments.platformMode', 'Platform Mode')}</th>
                           <th className="px-4 py-4">{t('adminGlobalAppointments.liveStatus', 'Live Status')}</th>
                           <th className="px-4 py-4 text-right">{t('adminGlobalAppointments.console', 'Console')}</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-black/5 text-[13px]">
                        {filtered.map((apt, index) => (
                           <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-4 py-4">
                                 <p className="font-extrabold text-[#15192c] tracking-tight leading-none mb-1">AP-{index + 1}</p>
                                 <div className="flex items-center gap-2 text-[9px] text-[#C4A0AC] font-black uppercase tracking-widest">
                                    <Clock size={12} style={{ color: '#ff69b4' }} /> {apt.time} • Today
                                 </div>
                              </td>
                              <td className="px-4 py-4">
                                 <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[9px] font-bold uppercase tracking-widest w-12" style={{ color: '#C4A0AC' }}>User:</span>
                                       <span className="font-bold tracking-tight leading-none" style={{ color: '#15192c' }}>{apt.user}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[9px] font-bold uppercase tracking-widest w-12" style={{ color: '#C4A0AC' }}>Expert:</span>
                                       <span className="font-bold tracking-tight leading-none flex items-center gap-1.5" style={{ color: '#15192c' }}><ShieldCheck size={12} style={{ color: '#ff69b4' }}/> {apt.advisor}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 py-4">
                                 <div className="flex items-center gap-2 px-2 py-1 bg-rose-50/30 rounded-xl font-bold text-[8px] uppercase tracking-widest w-fit border" style={{ borderColor: '#F5E6EA', color: '#9A8A8E' }}>
                                    {apt.type === 'Video' ? <Video size={14} className="text-blue-500" /> : <Activity size={14} style={{ color: '#ff69b4' }} />}
                                    {apt.type} Interaction
                                 </div>
                              </td>
                              <td className="px-4 py-4">
                                 <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
                                    apt.status === 'Live' ? 'text-[#ff69b4]' : 
                                    apt.status === 'Scheduled' ? 'text-blue-500' : 'text-[#C4A0AC]'
                                 }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${apt.status === 'Live' ? 'bg-[#ff69b4] animate-pulse shadow-[0_0_8px_rgba(196,96,122,0.6)]' : apt.status === 'Scheduled' ? 'bg-blue-500' : 'bg-[#C4A0AC]'}`}></div>
                                    {apt.status}
                                 </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                 <button onClick={() => setViewApt(apt)} className="p-2 bg-white border rounded-lg text-slate-300 group-hover:text-[#15192c] group-hover:border-[#ff69b4] transition-all hover:shadow-sm" style={{ borderColor: '#F5E6EA' }}>
                                    <Eye size={18} />
                                 </button>
                              </td>
                           </tr>
                        ))}
                        {loading && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center font-black text-[#C4A0AC] uppercase tracking-[0.4em]">Loading platform sessions...</td></tr>
                        )}
                        {error && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center font-black text-rose-500 uppercase tracking-[0.2em]">{error}</td></tr>
                        )}
                        {!loading && !error && filtered.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center font-black text-[#C4A0AC] uppercase tracking-[0.4em]">No consultations matched</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6 animate-in slide-in-from-right-6 duration-500">
            <h3 className="text-lg font-bold tracking-tight px-2 leading-none" style={{ color: '#15192c' }}>{t('adminGlobalAppointments.operationCenter', 'Operation Center')}</h3>
            <div className="bg-[#15192c] text-white rounded-[2rem] p-5 shadow-2xl space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl opacity-10" style={{ background: '#ff69b4' }}></div>
               {[
                 { label: t('adminGlobalAppointments.liveSessions', 'Live Sessions'), val: '12', color: '#ff69b4' },
                 { label: t('adminGlobalAppointments.pendingSlots', 'Pending Slots'), val: '48', color: '#C4A0AC' },
                 { label: t('adminGlobalAppointments.dailyCompletion', 'Daily Completion'), val: '86%', color: '#FDEEF1' },
                 { label: 'Live Sessions', val: String(liveCount), color: '#ff69b4' },
                 { label: 'Pending Slots', val: String(pendingCount), color: '#C4A0AC' },
                 { label: 'Daily Completion', val: `${completionPercentage}%`, color: '#FDEEF1' },
               ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-4 last:border-0 last:pb-0">
                     <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-2xl font-black tracking-tight">{item.val}</p>
                     </div>
                     <div className={`w-10 h-1.5 rounded-full`} style={{ background: item.color }}></div>
                  </div>
               ))}
               <div className="pt-4">
                  <button onClick={handleGenerateLog} disabled={isGenerating} className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2">
                     {isGenerating ? t('adminGlobalAppointments.compilingLogs', 'Compiling Logs...') : <><FileText size={14}/> {t('adminGlobalAppointments.generateLog', 'Generate Full Log')} <ArrowRight size={14}/></>}
                  </button>
               </div>
            </div>
            <div className="p-4 bg-rose-50/20 border rounded-3xl space-y-3" style={{ borderColor: '#F5E6EA' }}>
               <div className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-widest" style={{ color: '#ff69b4' }}>
                   <Info size={14}/> Node Latency
               </div>
               <p className="text-[10px] font-medium leading-relaxed italic" style={{ color: '#9A8A8E' }}>Global server sync is operating at <span className="underline" style={{ color: '#ff69b4' }}>24ms</span>. Real-time session monitoring is nominal.</p>
            </div>
         </div>
      </div>

      {/* ── VIEW APPOINTMENT MODAL ── */}
      <CMSModal open={!!viewApt} title="Consultation Details" icon={Eye} iconBg="bg-[#15192c]" onClose={() => setViewApt(null)}>
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-[#15192c] flex items-center justify-center text-white font-black text-xl shadow-xl">{viewApt?.user.charAt(0)}</div>
                  <div className="space-y-1">
                      <h3 className="text-2xl font-bold tracking-tight leading-none" style={{ color: '#15192c' }}>{viewApt?.user}</h3>
                      <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest mt-1.5" style={{ color: '#C4A0AC' }}>{viewApt?.email}</p>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-rose-50/20 border rounded-[1.75rem] space-y-1.5" style={{ borderColor: '#F5E6EA' }}>
                       <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#C4A0AC' }}>Wellness Expert</p>
                       <p className="text-sm font-bold flex items-center gap-2" style={{ color: '#15192c' }}><ShieldCheck size={16} style={{ color: '#ff69b4' }}/> {viewApt?.advisor}</p>
                  </div>
                  <div className="p-4 bg-rose-50/20 border rounded-[1.75rem] space-y-1.5" style={{ borderColor: '#F5E6EA' }}>
                       <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#C4A0AC' }}>Scheduled Slot</p>
                       <p className="text-sm font-bold flex items-center gap-2" style={{ color: '#15192c' }}><Clock size={16} className="text-blue-500"/> {viewApt?.time}</p>
                  </div>
              </div>
              <div className="p-5 bg-rose-50/20 border rounded-[2rem] space-y-4" style={{ borderColor: '#F5E6EA' }}>
                  <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#C4A0AC' }}>Platform & Meta</span>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${viewApt?.status === 'Live' ? 'bg-[#ff69b4] text-white animate-pulse' : 'bg-blue-500 text-white'}`}>{viewApt?.status} Session</span>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                       <div className="flex items-center gap-2"><Video size={16} className="text-[#C4A0AC]"/><span className="text-[10px] font-bold" style={{ color: '#9A8A8E' }}>{viewApt?.type} Call</span></div>
                       <div className="flex items-center gap-2"><Clock size={16} className="text-[#C4A0AC]"/><span className="text-[10px] font-bold" style={{ color: '#9A8A8E' }}>Allocated: {viewApt?.duration}</span></div>
                  </div>
              </div>
              <div className="flex gap-3 pt-4">
                  <button onClick={handleJoinSession} disabled={isJoining} className="flex-1 py-3 text-white font-bold text-[9px] uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#15192c]/10" style={{ background: '#15192c' }}>
                      {isJoining ? 'Connecting Node...' : <>Jump into Session <ExternalLink size={14}/></>}
                  </button>
                  <button onClick={() => setViewApt(null)} className="px-5 py-3 bg-rose-50 text-[#C4A0AC] font-bold text-[9px] uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all">Close</button>
              </div>
          </div>
      </CMSModal>
    </div>
  );
};

export default GlobalAppointments;


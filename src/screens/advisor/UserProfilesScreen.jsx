import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MessageSquare, Calendar, ChevronRight, UserCheck, Activity, CheckCircle, X } from 'lucide-react';
import { getAssignedMembersForAdvisor, upsertAdvisorThread } from '../../data/advisorFlow';
import { useLanguage } from '../../context/LanguageContext';
import axiosClient from '../../api/axiosClient';

const UserProfilesScreen = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [toast, setToast] = React.useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
  
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [sisters, setSisters] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchSisters = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/appointments');
      const appts = res.data?.appointments || res.data || [];
      
      const uniqueSisters = [];
      const emailsSeen = new Set();
      
      appts.forEach(apt => {
        const email = apt.memberEmail || `${apt.participantName.toLowerCase().replace(/\s+/g, '.')}@member.healthsakhi`;
        if (apt.participantUserId && !emailsSeen.has(email)) {
          emailsSeen.add(email);
          uniqueSisters.push({
            id: apt.participantUserId,
            name: apt.participantName,
            email: email,
            age: 26,
            condition: apt.topic || 'Wellness Consultation',
            adherence: 88,
            status: apt.status === 'completed' ? 'Follow-up' : 'Active'
          });
        }
      });
      setSisters(uniqueSisters);
    } catch (err) {
      console.error("Error fetching assigned sisters:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSisters();
  }, []);

  const filteredSisters = sisters.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.id.toLowerCase().includes(search.toLowerCase()) ||
                          s.condition.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="animate-in slide-in-from-left duration-500">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none" dangerouslySetInnerHTML={{ __html: t('advisorUsers.title', 'Sisters under<br/>your care') }}></h1>
          <p className="text-slate-500 text-xs font-medium mt-2">{t('advisorUsers.desc', 'Review health history and engagement metrics for your assigned users.')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 relative">
         <div className="relative flex-1 min-w-[220px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-health-green transition-colors" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('advisorUsers.searchPlaceholder', 'Search by name, ID or health condition...')} 
              className="w-full h-10 pl-10 pr-4 bg-white border border-black/5 rounded-[1.5rem] outline-none focus:border-health-green focus:ring-4 focus:ring-health-green/5 transition-all text-sm font-medium shadow-sm" 
            />
         </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredSisters.length > 0 ? filteredSisters.map((sister) => (
          <div key={sister.id} className="bg-white p-3 rounded-[1.5rem] border border-black/5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
             <div className="flex flex-col md:flex-row items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-black/5 group-hover:bg-health-green group-hover:text-white transition-all group-hover:scale-105 duration-500">
                   <UserCheck size={18} />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-center">
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{sister.id}</p>
                      <h3 className="text-sm font-black text-slate-800 tracking-tight hover:text-health-green transition-colors cursor-pointer">{sister.name}</h3>
                      <p className="text-[9px] font-bold text-slate-500 mt-1">{sister.age} {sister.condition === 'General Wellness' ? t('advisorUsers.yearsGeneralWellness', 'Years • General Wellness') : sister.condition === 'Consultation Follow up' ? t('advisorUsers.yearsConsultationFollowUp', 'Years • Consultation Follow up') : `Years • ${sister.condition}`}</p>
                   </div>
                   
                   <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <span>{t('advisorUsers.adherence', 'ADHERENCE')}</span>
                        <span className="text-slate-800">{sister.adherence}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${sister.adherence > 80 ? 'bg-health-green' : sister.adherence > 50 ? 'bg-orange-400' : 'bg-red-400'}`} style={{ width: `${sister.adherence}%` }}></div>
                      </div>
                   </div>

                   <div className="text-center md:text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('advisorUsers.status', 'STATUS')}</p>
                      <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                         sister.status === 'Active' ? 'bg-green-100 text-green-600' : 
                         sister.status === 'Follow-up' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                         {sister.status === 'Active' ? t('advisorUsers.active', 'ACTIVE') : sister.status}
                      </span>
                   </div>

                   <div className="flex items-center justify-center md:justify-end gap-2">
                      <button onClick={() => {
                        navigate('/advisor/chat', { state: { user: sister } });
                      }} className="p-2.5 bg-health-soft text-health-dark rounded-xl hover:bg-health-green hover:text-white transition-all shadow-sm">
                         <MessageSquare size={16} />
                      </button>
                      <button onClick={() => navigate('/advisor/appointments')} className="p-2.5 bg-health-soft text-health-dark rounded-xl hover:bg-health-green hover:text-white transition-all shadow-sm">
                         <Calendar size={16} />
                      </button>
                      {/* <button onClick={() => showToast(`Opening Clinical History for ${sister.id}...`)} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 ml-2">
                         <ChevronRight size={18} />
                      </button> */}
                   </div>
                </div>
             </div>
             
             {/* Decorative Background Icon */}
             <Activity size={56} className="absolute -bottom-4 -right-4 text-slate-500/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        )) : (
            <div className="py-14 text-center space-y-3 bg-white rounded-[2rem] border border-dashed border-slate-200">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-slate-300" />
                </div>
                <h3 className="text-base font-black text-slate-800">No Sisters Matching "{search}"</h3>
                <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto">Try adjusting your filters or search terms for the {statusFilter} rotation.</p>
                <button onClick={() => { setSearch(''); setStatusFilter('All'); }} className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest">Clear Everything</button>
            </div>
        )}
      </div>
      
      <div className="bg-slate-50 p-4 rounded-[2rem] border border-dashed border-slate-200 text-center">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('advisorUsers.endOfRotation', 'End of assigned rotation • Check global list for new requests')}</p>
      </div>
      
      {/* Premium Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[200] animate-in slide-in-from-right-10 duration-500">
           <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-[1.75rem] shadow-2xl flex items-center gap-3 min-w-[280px]">
              <div className="w-10 h-10 bg-health-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-health-green/20">
                 <CheckCircle size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-health-green uppercase tracking-widest mb-1">Clinical Engine Active</p>
                 <p className="text-white text-[11px] font-bold leading-tight">{toast}</p>
              </div>
              <button onClick={() => setToast(null)} className="ml-auto text-white/20 hover:text-white transition-colors"><X size={16}/></button>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilesScreen;

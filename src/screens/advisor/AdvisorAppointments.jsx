import React from 'react';
import { Calendar as CalendarIcon, Clock, Video, Phone, CheckCircle, XCircle, Search, X, ShieldCheck, MapPin } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useLanguage } from '../../context/LanguageContext';

const AdvisorAppointments = () => {
  const { t } = useLanguage();
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('Upcoming');
  const [showConfirmModal, setShowConfirmModal] = React.useState(null);
  const [tempSchedule, setTempSchedule] = React.useState({ date: '', time: '' });
  const [toast, setToast] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [appointments, setAppointments] = React.useState([]);
  const [joiningId, setJoiningId] = React.useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/appointments');
      const data = res.data?.appointments || res.data || [];
      const mapped = data.map(apt => {
        const formattedDate = new Date(apt.date).toISOString().split('T')[0];
        
        let duration = '15m';
        if (apt.start_time && apt.end_time) {
          try {
            const [sh, sm] = apt.start_time.split(':').map(Number);
            const [eh, em] = apt.end_time.split(':').map(Number);
            const diffMin = (eh * 60 + em) - (sh * 60 + sm);
            if (diffMin > 0) duration = `${diffMin}m`;
          } catch (e) {
            duration = '15m';
          }
        }

        return {
          id: apt.id,
          name: apt.participantName || 'Member User',
          date: formattedDate,
          time: apt.start_time,
          duration,
          type: 'Video',
          topic: 'Wellness Consultation',
          status: apt.status === 'completed' ? 'Completed' : (apt.status === 'scheduled' ? 'Confirmed' : (apt.status === 'cancelled' ? 'Cancelled' : 'Pending')),
          meeting_link: apt.meeting_link
        };
      });
      setAppointments(mapped);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments registry.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAppointments();
  }, []);

  const initiateConfirm = (apt) => {
    setTempSchedule({ date: apt.date, time: apt.time });
    setShowConfirmModal(apt);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const finalizeConfirm = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.patch(`/appointments/${showConfirmModal.id}/confirm`, {
        date: tempSchedule.date,
        time: tempSchedule.time
      });
      if (res.data?.success) {
        showToast(`Confirmed for ${tempSchedule.date} at ${tempSchedule.time}`);
        setShowConfirmModal(null);
        fetchAppointments(); // refresh list
      }
    } catch (err) {
      console.error("Error confirming slot:", err);
      alert(err.response?.data?.message || "Failed to confirm slot.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this appointment?")) return;
    try {
      setLoading(true);
      const res = await axiosClient.patch(`/appointments/${id}/cancel`);
      if (res.data?.success) {
        showToast("Appointment rejected successfully.");
        fetchAppointments(); // refresh list
      }
    } catch (err) {
      console.error("Error rejecting appointment:", err);
      alert(err.response?.data?.message || "Failed to reject appointment.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCall = (apt) => {
    setJoiningId(apt.id);
    setTimeout(() => {
      setJoiningId(null);
      alert(`Secure connection established with ${apt.name}. Opening session node...`);
      const meetingLink = `https://meet.jit.si/health-sakhi-${apt.id}`;
      window.open(meetingLink, '_blank');
    }, 1500);
  };

  const filtered = appointments.filter(apt => {
    const matchesSearch = apt.name.toLowerCase().includes(search.toLowerCase()) || 
                          apt.topic.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'Upcoming' ? (apt.status !== 'Completed' && apt.status !== 'Cancelled') : apt.status === 'Completed';
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-10 font-sans pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="animate-in slide-in-from-left duration-500">
           <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none" dangerouslySetInnerHTML={{ __html: t('advisorAppointments.title', 'Schedule<br/>Registry') }}></h1>
           <p className="text-slate-500 font-medium mt-2 text-sm">{t('advisorAppointments.desc', 'Manage your consultation pipeline and connect with sisters.')}</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-black/5 shadow-sm self-start">
           {['Upcoming', 'Completed'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-600'}`}>{t('advisorAppointments.' + tab.toLowerCase(), tab)}</button>
           ))}
        </div>
      </div>

      <div className="relative group">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-health-green transition-colors" size={18} />
         <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('advisorAppointments.searchPlaceholder', 'Search patient or topic...')}
          className="w-full h-12 pl-10 pr-5 bg-white border border-black/5 rounded-2xl shadow-sm outline-none focus:border-health-green focus:ring-4 focus:ring-health-green/5 transition-all text-sm font-medium"
         />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] w-full col-span-full">
          <div className="w-8 h-8 rounded-full border-4 border-slate-900/10 border-t-slate-900 animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center font-bold w-full col-span-full">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-black/5 p-12 text-center shadow-sm max-w-md mx-auto space-y-4 w-full col-span-full">
           <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <CalendarIcon size={32} />
           </div>
           <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">{t('advisorAppointments.noAppointmentsFound', 'No Appointments Found')}</h3>
              <p className="text-slate-400 text-xs font-medium mt-1">{t('advisorAppointments.noAppointmentsDesc', 'There are no {type} appointments matching your criteria.').replace('{type}', t('advisorAppointments.' + activeTab.toLowerCase(), activeTab))}</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((apt) => (
            <div key={apt.id} className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group animate-in zoom-in-95">
               <div className="flex items-center justify-between mb-5">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                    apt.type === 'Video' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                     {apt.type === 'Video' ? <Video size={14} /> : <Phone size={14} />}
                     {apt.type === 'Video' ? t('advisorAppointments.videoCall', 'Video CALL') : t('advisorAppointments.phoneCall', 'Phone CALL')}
                  </div>
                  {apt.status === 'Confirmed' && <CheckCircle size={18} className="text-health-green" />}
                  {apt.status === 'Completed' && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{t('advisorAppointments.archive', 'Archive')}</span>}
               </div>
               
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-slate-50 flex items-center justify-center font-black text-slate-400 italic shadow-inner text-sm">
                     {apt.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-slate-800 tracking-tight">{apt.name}</h3>
                     <p className="text-[10px] text-health-green font-black uppercase tracking-[0.2em] mt-1">{apt.topic}</p>
                  </div>
               </div>

               <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                     <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><CalendarIcon size={14} /></div>
                     {apt.date} at {apt.time}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                     <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Clock size={14} /></div>
                     {t('advisorAppointments.duration', 'Duration:')} {apt.duration}
                  </div>
               </div>

               {apt.status !== 'Completed' && (
                  <button 
                    onClick={() => initiateConfirm(apt)}
                    disabled={apt.status === 'Confirmed'}
                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      apt.status === 'Confirmed' 
                      ? 'bg-emerald-50 text-health-green shadow-none border border-emerald-100' 
                      : 'bg-slate-900 text-white hover:bg-black active:scale-95 shadow-slate-900/10'
                    }`}
                  >
                    {apt.status === 'Confirmed' ? t('advisorAppointments.confirmedSynced', 'Confirmed & Synced') : t('advisorAppointments.reviewConfirm', 'Review & Confirm')}
                  </button>
               )}
               {apt.status === 'Pending' && (
                  <div className="flex gap-2 w-full mt-4">
                    <button 
                      onClick={() => initiateConfirm(apt)}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black active:scale-95 shadow-slate-900/10"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => handleReject(apt.id)}
                      className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 active:scale-95 border border-rose-100"
                    >
                      Reject
                    </button>
                  </div>
               )}
                {apt.status === 'Confirmed' && (
                   <button 
                     onClick={() => handleJoinCall(apt)}
                     disabled={joiningId === apt.id}
                     className="w-full py-3 mt-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-health-green text-white hover:bg-health-dark active:scale-95 transition-all shadow-md shadow-health-green/20"
                   >
                     {joiningId === apt.id ? 'Connecting Node...' : 'Join Room'}
                   </button>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation & Rescheduling Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 relative shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
             <button onClick={() => setShowConfirmModal(null)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"><X size={22}/></button>
             
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20"><CalendarIcon size={20}/></div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{t('advisorAppointments.confirmSlot', 'Confirm Slot')}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('advisorAppointments.verifyTime', 'Verify time before calendar sync')}</p>
                </div>
             </div>

             <div className="space-y-5">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('advisorAppointments.consultationDate', 'Consultation Date')}</label>
                   <div className="relative group">
                      <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-health-green transition-colors" />
                      <input type="text" value={tempSchedule.date} onChange={e => setTempSchedule({...tempSchedule, date: e.target.value})} className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-black/5 rounded-2xl font-bold text-sm text-black outline-none focus:bg-white focus:border-health-green appearance-none" style={{ color: 'black' }} />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('advisorAppointments.proposedTime', 'Proposed Time')}</label>
                   <div className="relative group">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-health-green transition-colors" />
                      <input type="time" value={tempSchedule.time} onChange={e => setTempSchedule({...tempSchedule, time: e.target.value})} className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-black/5 rounded-2xl font-bold text-sm text-black outline-none focus:bg-white focus:border-health-green appearance-none" style={{ color: 'black' }} />
                   </div>
                </div>

                <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-start gap-3">
                   <ShieldCheck size={20} className="text-health-green flex-shrink-0 mt-1" />
                   <p className="text-[10px] font-bold text-health-green leading-relaxed uppercase tracking-widest">{t('advisorAppointments.confirmationNotice', 'Upon confirmation, the sister will be notified via WhatsApp and the slot will be locked in your clinical calendar.')}</p>
                </div>
             </div>

             <div className="flex gap-3 mt-7">
                <button onClick={finalizeConfirm} className="flex-1 py-3.5 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10">{t('advisorAppointments.confirmSync', 'Confirm & Sync')}</button>
                <button onClick={() => setShowConfirmModal(null)} className="px-6 py-3.5 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">{t('advisorAppointments.cancel', 'Cancel')}</button>
             </div>
          </div>
        </div>
      )}
      {/* Premium Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[200] animate-in slide-in-from-right-10 duration-500">
           <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-[1.75rem] shadow-2xl flex items-center gap-3 min-w-[280px]">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
                 <CheckCircle size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">{t('advisorAppointments.sessionSynchronized', 'Session Synchronized')}</p>
                 <p className="text-white text-[11px] font-bold leading-tight">{toast}</p>
              </div>
              <button onClick={() => setToast(null)} className="ml-auto text-white/20 hover:text-white transition-colors"><X size={16}/></button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorAppointments;

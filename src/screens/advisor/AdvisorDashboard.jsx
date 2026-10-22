import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axiosClient from '../../api/axiosClient';
import { 
  Calendar, ChevronRight, Users, DollarSign, Clock, TrendingUp, 
  CheckCircle, Video, Phone, Mic, MicOff, VideoOff, PhoneOff, 
  Maximize2, MessageSquare, Signal, Settings, X, Shield, Sparkles,
  Activity, Droplets, Heart, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCallEvents } from '../../data/advisorFlow';

const AdvisorDashboard = () => {
   const navigate = useNavigate();
   const { t } = useLanguage();
   const { user } = useAuth();
   const [activeTab, setActiveTab] = React.useState('today');
   const [activeCall, setActiveCall] = React.useState(null);
   const [callTimer, setCallTimer] = React.useState('00:00');
   const [isMuted, setIsMuted] = React.useState(false);
   const [isVideoOff, setIsVideoOff] = React.useState(false);

   const [dashboardData, setDashboardData] = React.useState(null);
   const [loading, setLoading] = React.useState(true);
   const [error, setError] = React.useState(null);

   const fetchDashboardData = async () => {
      try {
         setLoading(true);
         const res = await axiosClient.get('/advisors/dashboard');
         if (res.data) {
            setDashboardData(res.data);
         }
      } catch (err) {
         console.error("Error fetching advisor dashboard:", err);
         setError("Failed to load dashboard statistics.");
      } finally {
         setLoading(false);
      }
   };

   React.useEffect(() => {
      fetchDashboardData();
   }, []);


   const stats = React.useMemo(() => {
      if (dashboardData?.stats?.[activeTab]) {
         const iconMap = { CheckCircle, Calendar, DollarSign, TrendingUp, Sparkles };
         return dashboardData.stats[activeTab].map(s => ({
            ...s,
            icon: iconMap[s.icon] || CheckCircle
         }));
      }
      return [
         { nameKey: 'sessionsTodayStat', name: 'Sessions Today', value: '0', icon: CheckCircle, color: '#ff69b4' },
         { nameKey: 'upcomingCallsStat', name: 'Upcoming Calls', value: '0', icon: Calendar, color: '#3b82f6' },
         { nameKey: 'todayEarningsStat', name: 'Today Earnings', value: '₹0', icon: DollarSign, color: '#f59e0b' },
         { nameKey: 'adherenceStat', name: 'Adherence', value: '100%', icon: TrendingUp, color: '#10b981' },
      ];
   }, [dashboardData, activeTab]);

   const appointments = React.useMemo(() => {
      const tabKey = activeTab;
      if (dashboardData?.appointments?.[tabKey]) {
         return dashboardData.appointments[tabKey];
      }
      return [];
   }, [dashboardData, activeTab]);

   const clinicalExcellence = React.useMemo(() => {
      return dashboardData?.clinicalExcellence || {
         patientSatisfaction: '98%',
         completionRate: '92%',
         avgRating: '4.9/5',
         totalConsultations: 0
      };
   }, [dashboardData]);

   const handleJoinCall = (name) => {
      setActiveCall(name);
      let seconds = 0;
      const interval = setInterval(() => {
         seconds++;
         const mins = Math.floor(seconds / 60);
         const secs = seconds % 60;
         setCallTimer(`${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }, 1000);
      window.callInterval = interval;
   };

   const handleEndCall = () => {
      clearInterval(window.callInterval);
      setActiveCall(null);
      setCallTimer('00:00');
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-500">
         
         {/* Advisor Welcome Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-[#15192c]">
                  {t('advisorDash.namaste', 'Namaste')}, {(() => {
                    const displayName = user?.fullName || 'Dr. Sakhi';
                    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                    return formattedName.startsWith('Dr.') ? formattedName : `Dr. ${formattedName}`;
                  })()}.
                </h1>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A0AC] mt-1">{t('advisorDash.clinicalCenter', 'Your clinical command center for')} <span className="text-[#ff69b4]">{activeTab === 'today' ? t('advisorDash.today', 'Today') : t('advisorDash.thisWeek', 'This Week')}</span></p>
            </div>
            <div className="flex bg-white p-1 rounded-2xl border border-[#F5E6EA] shadow-sm self-start">
               {[{ key: 'today', label: t('advisorDash.today', 'Today') }, { key: 'thisWeek', label: t('advisorDash.thisWeek', 'This Week') }].map(tab => (
                  <button 
                    key={tab.key} 
                    onClick={() => setActiveTab(tab.key)} 
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.key ? 'bg-[#15192c] text-white shadow-xl shadow-[#15192c]/20' : 'text-[#C4A0AC] hover:text-[#15192c]'}`}
                  >
                    {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
               <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#F5E6EA] relative overflow-hidden group"
               >
                  <div className="flex items-start justify-between mb-4">
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
                        <stat.icon size={18} />
                     </div>
                     <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500">
                        <TrendingUp size={10} /> 12%
                     </div>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-1">{stat.nameKey ? t(`advisorDash.${stat.nameKey}`, stat.name) : stat.name}</p>
                  <h3 className="text-2xl font-black text-[#15192c] tracking-tight">{stat.value}</h3>
               </motion.div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Live Queue with Health Insights */}
            <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-sm border border-[#F5E6EA] overflow-hidden">
               <div className="p-8 flex items-center justify-between border-b border-[#F5E6EA]">
                  <div>
                     <h2 className="text-xl font-black tracking-tight text-[#15192c]">{t('advisorDash.upcomingSessions', 'Upcoming Sessions')}</h2>
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mt-1">{t('advisorDash.liveQueue', 'Live Tele-Health Queue')}</p>
                  </div>
                  <button onClick={() => navigate('/advisor/appointments')} className="px-6 py-3 bg-rose-50 text-[9px] font-black uppercase tracking-widest text-[#ff69b4] rounded-xl hover:bg-[#ff69b4] hover:text-white transition-all">{t('advisorDash.viewCalendar', 'View Full Calendar')}</button>
               </div>
                <div className="divide-y divide-[#F5E6EA]">
                   {loading ? (
                      <div className="p-8 text-center text-slate-400 font-bold">{t('advisorDash.loadingSessions', 'Loading upcoming sessions...')}</div>
                   ) : error ? (
                      <div className="p-8 text-center text-red-500 font-bold">{error}</div>
                   ) : appointments.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-bold">{t('advisorDash.noSessions', 'No sessions scheduled for')} {activeTab === 'today' ? t('advisorDash.today', 'Today') : t('advisorDash.thisWeek', 'This Week')}.</div>
                   ) : appointments.map((apt, i) => (
                     <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-rose-50/20 transition-all group">
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner bg-rose-50 text-[#F5B4BC]">
                              {apt.name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div className="space-y-1">
                              <p className="text-base font-black text-[#15192c]">{apt.name}</p>
                              <div className="flex flex-wrap items-center gap-3">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">{apt.topic}</span>
                                 <div className="w-1 h-1 rounded-full bg-rose-200" />
                                 <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#F5E6EA] rounded-lg text-[8px] font-black uppercase text-[#ff69b4]">
                                    <Droplets size={10} /> {apt.healthStatus}
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-6 self-end md:self-auto">
                           <div className="text-right">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">{apt.type ? `${apt.type} ${t('advisorDash.videoCall', 'Call')}` : t('advisorDash.videoCall', 'Video Call')}</p>
                              <p className="text-sm font-black text-[#15192c]">{apt.time}</p>
                           </div>
                           <button 
                             onClick={() => handleJoinCall(apt.name)} 
                             className="px-8 py-4 bg-[#ff69b4] text-white text-[9px] font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-rose-100 hover:scale-105 transition-all"
                           >
                              {t('advisorDash.joinSession', 'Join Session')}
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Advisory Snapshot */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-[#15192c] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff69b4]/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="flex items-center gap-3 mb-8">
                     <Sparkles size={18} className="text-[#ff69b4]" />
                     <h2 className="text-[10px] font-black uppercase tracking-widest">{t('advisorDash.clinicalExcellence', 'Clinical Excellence')}</h2>
                  </div>
                   <div className="space-y-8 relative z-10">
                      {[
                         { label: t('advisorDash.patientSatisfaction', 'Patient Satisfaction'), val: clinicalExcellence.patientSatisfaction, color: '#ff69b4' },
                         { label: t('advisorDash.completionRate', 'Completion Rate'), val: clinicalExcellence.completionRate, color: '#F5B4BC' },
                         { label: t('advisorDash.avgRating', 'Avg. Rating'), val: clinicalExcellence.avgRating, color: '#F5E6EA' }
                      ].map((bar, i) => (
                         <div key={i} className="space-y-2.5">
                            <div className="flex justify-between items-end">
                               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{bar.label}</span>
                               <span className="text-xs font-black text-white">{bar.val}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: bar.val.includes('%') ? bar.val : '95%' }} className="h-full rounded-full" style={{ background: bar.color }} />
                            </div>
                         </div>
                      ))}
                   </div>
                   <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">{t('advisorDash.totalConsultations', 'Total Consultations')}</p>
                      <p className="text-3xl font-black text-white">{clinicalExcellence.totalConsultations}</p>
                   </div>
               </div>
            </div>
         </div>

         {/* Navigation Hub */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div onClick={() => navigate('/advisor/chat')} className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#F5E6EA] flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff69b4] shadow-inner group-hover:scale-110 transition-transform">
                     <MessageSquare size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-[#15192c]">{t('advisorDash.commHub', 'Communication Hub')}</h3>
                     <p className="text-xs font-medium text-[#C4A0AC]">{t('advisorDash.commHubDesc', 'Live patient consultations & chat')}</p>
                  </div>
               </div>
               <ArrowRight size={20} className="text-[#F5E6EA] group-hover:text-[#ff69b4] group-hover:translate-x-2 transition-all" />
            </div>

            <div onClick={() => navigate('/advisor/users')} className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#F5E6EA] flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-[#15192c] shadow-inner group-hover:scale-110 transition-transform">
                     <Users size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-[#15192c]">{t('advisorDash.patientRegistry', 'Patient Registry')}</h3>
                     <p className="text-xs font-medium text-[#C4A0AC]">{t('advisorDash.patientRegistryDesc', 'Review clinical health cards')}</p>
                  </div>
               </div>
               <ArrowRight size={20} className="text-[#F5E6EA] group-hover:text-[#15192c] group-hover:translate-x-2 transition-all" />
            </div>
         </div>

         {/* Call Overlay */}
         <AnimatePresence>
            {activeCall && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#15192c] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#15192c] via-black to-[#15192c] flex items-center justify-center overflow-hidden">
                     <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff69b4]/5 rounded-full blur-[120px] -mr-64 -mt-64" />
                     <div className="text-center space-y-8 relative z-10">
                        <div className="w-48 h-48 rounded-[3.5rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto relative group">
                           <Users size={80} className="text-[#ff69b4] opacity-20 group-hover:scale-110 transition-transform" />
                           <div className="absolute top-2 right-2 w-12 h-12 bg-[#ff69b4] rounded-2xl border-4 border-[#15192c] flex items-center justify-center">
                              <Signal size={16} className="text-white" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <h2 className="text-4xl font-black text-white tracking-tight">{activeCall}</h2>
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff69b4] animate-pulse">{t('advisorDash.encryptedSession', 'Encrypted Clinical Session')}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-8 p-6 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-2xl">
                     <button onClick={() => setIsMuted(!isMuted)} className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                     </button>
                     <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                     </button>
                     <button onClick={handleEndCall} className="w-24 h-16 bg-rose-600 text-white rounded-[1.75rem] flex items-center justify-center hover:bg-rose-700 hover:scale-105 transition-all shadow-2xl shadow-rose-900/50">
                        <PhoneOff size={32} />
                     </button>
                  </div>

                  <div className="absolute top-10 left-10 flex items-center gap-4">
                     <div className="px-8 py-3 bg-rose-600 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-xl shadow-rose-900/40">
                        <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                        {t('advisorDash.liveSession', 'Live Session')}: {callTimer}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default AdvisorDashboard;

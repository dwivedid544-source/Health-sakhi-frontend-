import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar,
  Clock,
  Video,
  Star,
  Shield,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  X,
  CheckCircle,
  User,
  MessageSquare,
  Clipboard,
  RefreshCw,
  AlertCircle,
  Paperclip,
  Image
} from 'lucide-react';
import { appendAdvisorMessage, logCallEvent, markThreadRead, upsertAdvisorThread } from '../../data/advisorFlow';
import axiosClient from '../../api/axiosClient';

const getNext7Days = (t) => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateVal = String(d.getDate()).padStart(2, '0');
    const rawDate = `${year}-${month}-${dateVal}`;
    days.push({
      idx: i,
      label: i === 0 ? t('sessions.today', 'Today') : i === 1 ? t('sessions.tomorrow', 'Tomorrow') : dayNames[d.getDay()],
      date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      rawDate
    });
  }
  return days;
};

const durations = [
  { label: '15 min', price: 'Included', sub: 'Quick consult' }
];

const topics = [
  'Hormonal Health',
  'Nutrition & Diet',
  'Emotional Wellness',
  'Fitness & Movement',
  'Period Health',
  'Sleep & Stress',
  'General Consultation'
];

const translateDayLabel = (label, t) => {
  if (label === 'Today') return t('days.Today', 'Today');
  if (label === 'Tomorrow') return t('days.Tomorrow', 'Tomorrow');
  return t(`days.${label}`, label);
};

const translateDateStr = (dateStr, t) => {
  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    const month = parts[0];
    const day = parts[1];
    return `${t(`months.${month}`, month)} ${day}`;
  }
  return dateStr;
};

const SuccessScreen = ({ booking, onReset }) => {
  const { t } = useLanguage();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center py-10">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-8">
        <CheckCircle size={48} className="text-emerald-500" />
      </motion.div>
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">{t('sessions.bookingConfirmed', 'Booking Confirmed!')}</p>
      <h2 className="text-3xl font-black text-[#15192c] mb-2">{t('sessions.successHeader', 'See you soon! 🎉')}</h2>
      <p className="text-sm text-[#9A8A8E] mb-8">{t('sessions.successDesc', 'Your session has been booked. A confirmation will be sent to your registered email.')}</p>
      <div className="bg-white rounded-[2.5rem] p-8 border border-rose-50 shadow-sm text-left space-y-4 mb-8">
        {[
          { label: t('academy.advisorLabel', 'Advisor'), value: booking.advisor },
          { label: t('sessions.dateLabel', 'Date'), value: booking.date },
          { label: t('sessions.timeLabel', 'Time'), value: booking.slot },
          { label: t('academy.durationLabel', 'Duration'), value: booking.duration },
          { label: t('academy.topicLabel', 'Topic'), value: booking.topic },
          { label: t('academy.sessionIdLabel', 'Session ID'), value: booking.id },
        ].map((r, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-rose-50 last:border-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{r.label}</span>
            <span className="text-xs font-bold text-[#15192c]">{r.value}</span>
          </div>
        ))}
      </div>
      <button onClick={onReset}
        className="w-full py-4 bg-[#ff69b4] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg">
        {t('sessions.bookAnother', 'Book Another Session')}
      </button>
    </motion.div>
  );
};

const SessionBookingScreen = () => {
  const { t, langCode } = useLanguage();
  const navigate = useNavigate();

  const durations = [
    { label: '15 min', price: t('login.locked') === 'Locked' ? 'Included' : 'Included', sub: t('sessions.durations.quick') },
    { label: '30 min', price: '₹299', sub: t('sessions.durations.detailed') },
    { label: '60 min', price: '₹499', sub: t('sessions.durations.deep') },
  ];

  const topics = [
    'hormonal',
    'nutrition',
    'emotional',
    'fitness',
    'period',
    'sleep',
    'general',
  ];

  const currentMember = React.useMemo(() => {
    try {
      const sessionUser = JSON.parse(sessionStorage.getItem('hs_current_member') || '{}');
      return {
        name: sessionUser.name || 'Member User',
        email: sessionUser.email || 'member@gmail.com',
        plan: sessionUser.plan || 'Free Sakhi'
      };
    } catch {
      return { name: 'Member User', email: 'member@gmail.com', plan: 'Free Sakhi' };
    }
  }, []);

  // API Lists
  const [advisors, setAdvisors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // Reschedule & Cancel states
  const [reschedulingAppt, setReschedulingAppt] = useState(null);
  const [rescheduleDay, setRescheduleDay] = useState(0);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
  const [viewingNotes, setViewingNotes] = useState(null);

  // General Booking workflow states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [topic, setTopic] = useState('');
  const [name, setName] = useState(currentMember.name);
  const [step, setStep] = useState('list'); // list | success
  const [booking, setBooking] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  // Chat/Avail loading
  const [chatModalSession, setChatModalSession] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatThreadId, setChatThreadId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [advisorSlots, setAdvisorSlots] = useState([]);

  const memberFileRef = React.useRef(null);
  const memberImageRef = React.useRef(null);

  const handleMemberUploadAndSend = async (file, isImage) => {
    if (!chatModalSession) return;
    try {
      const formData = new FormData();
      formData.append('chatFile', file);

      // Upload file to backend
      const uploadRes = await axiosClient.post('/chats/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data?.success) {
        const fileUrl = uploadRes.data.url;
        const contentType = isImage ? 'image' : 'file';
        const text = file.name;

        const res = await axiosClient.post('/chats/messages', {
          receiverId: chatModalSession.participantUserId,
          text,
          contentType,
          fileUrl
        });

        if (res.data?.success) {
          fetchChatMessages();
        }
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      window.alert("Failed to upload file. Please try again.");
    }
  };

  const handleMemberFileUpload = (files) => {
    if (!files?.length) return;
    handleMemberUploadAndSend(files[0], false);
  };

  const handleMemberImageUpload = (files) => {
    if (!files?.length) return;
    handleMemberUploadAndSend(files[0], true);
  };

  // Page level loaders
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const days = getNext7Days(t);

  // Load advisors and user appointments from backend API
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [advisorsRes, appointmentsRes] = await Promise.all([
        axiosClient.get('/advisors'),
        axiosClient.get('/appointments')
      ]);
      setAdvisors(advisorsRes.data?.advisors || advisorsRes.data || []);
      setAppointments(appointmentsRes.data?.appointments || appointmentsRes.data || []);
    } catch (err) {
      console.error('Error loading booking data:', err);
      setError(t('sessions.loadError', 'Unable to load advisors or appointments history.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch slots for direct booking
  useEffect(() => {
    if (!selectedAdvisor) return;
    const fetchSlots = async () => {
      try {
        const dateStr = days[selectedDay].rawDate;
        const res = await axiosClient.get(`/advisors/${selectedAdvisor.id}/availability?date=${dateStr}`);
        setAdvisorSlots(res.data?.slots || res.data || []);
      } catch (err) {
        console.error('Error fetching advisor slots:', err);
      }
    };
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAdvisor, selectedDay]);

  // Fetch slots for reschedule workflow
  useEffect(() => {
    if (!reschedulingAppt) return;
    const fetchRescheduleSlots = async () => {
      try {
        const dateStr = days[rescheduleDay].rawDate;
        const res = await axiosClient.get(`/advisors/${reschedulingAppt.advisorId}/availability?date=${dateStr}`);
        setRescheduleSlots(res.data?.slots || res.data || []);
      } catch (err) {
        console.error('Error fetching reschedule slots:', err);
      }
    };
    fetchRescheduleSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reschedulingAppt, rescheduleDay]);

  const visibleAdvisors = showAll ? advisors : advisors.slice(0, 2);

  const handleSelectAdvisor = (adv) => {
    setSelectedAdvisor(adv);
    setSelectedSlot(null);
    setTimeout(() => {
      document.getElementById('slot-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Confirm booking
  const handleConfirm = async () => {
    if (!selectedSlot || !topic || !name) return;
    try {
      setActionLoading(true);
      const res = await axiosClient.post('/appointments', {
        advisor_id: selectedAdvisor.id,
        availability_id: selectedSlot.id
      });
      if (res.data?.success || res.status === 201) {
        const appt = res.data?.appointment;
        const newBooking = {
          id: appt?.id || `HS-${Math.floor(100000 + Math.random() * 900000)}`,
          memberName: name || currentMember.name,
          memberEmail: currentMember.email,
          advisor: selectedAdvisor.name,
          date: translateDayLabel(days[selectedDay].label, t) + ', ' + translateDateStr(days[selectedDay].date, t),
          slot: selectedSlot.start_time,
          duration: t('sessions.duration_15min', '15 min'),
          topic
        };

        upsertAdvisorThread({
          memberName: newBooking.memberName,
          memberEmail: newBooking.memberEmail,
          advisor: newBooking.advisor
        });

        setBooking(newBooking);
        setStep('success');
        
        // Refresh local listings
        loadData();
      }
    } catch (err) {
      console.error('Failed to book appointment:', err);
      alert(err.response?.data?.message || 'Booking failed. Please check if the slot is still available.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Appointment (Task 4: Cancel API Integration)
  const handleCancelSession = async (apptId) => {
    if (!window.confirm(t('sessions.cancelConfirm', 'Are you sure you want to cancel this scheduled appointment?'))) return;
    try {
      setActionLoading(true);
      const res = await axiosClient.patch(`/appointments/${apptId}/cancel`);
      if (res.data?.success) {
        alert(t('sessions.cancelSuccess', 'Appointment cancelled successfully.'));
        loadData(); // refresh
      }
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      alert(err.response?.data?.message || 'Cancellation failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reschedule Appointment (Task 3: Reschedule API Integration)
  const handleRescheduleConfirm = async () => {
    if (!reschedulingAppt || !selectedRescheduleSlot) return;
    try {
      setActionLoading(true);
      const res = await axiosClient.patch(`/appointments/${reschedulingAppt.id}/reschedule`, {
        new_availability_id: selectedRescheduleSlot.id
      });

      if (res.data?.success) {
        alert(t('sessions.rescheduleSuccess', 'Appointment rescheduled successfully!'));
        setReschedulingAppt(null);
        setSelectedRescheduleSlot(null);
        loadData(); // refresh
      }
    } catch (err) {
      console.error('Failed to reschedule:', err);
      alert(err.response?.data?.message || 'Rescheduling failed. Please select another slot.');
    } finally {
      setActionLoading(false);
    }
  };

  // Chat thread setup
  const handleMemberChat = (appt) => {
    setChatModalSession(appt);
    setChatInput('');
  };

  const fetchChatMessages = async () => {
    if (!chatModalSession) return;
    try {
      const res = await axiosClient.get(`/chats/messages?partnerId=${chatModalSession.participantUserId}`);
      if (res.data?.messages) {
        setChatMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Error fetching member messages:", err);
    }
  };

  useEffect(() => {
    fetchChatMessages();
    let interval;
    if (chatModalSession) {
      interval = setInterval(fetchChatMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [chatModalSession]);

  const handleSendModalChat = async () => {
    if (!chatModalSession || !chatInput.trim()) return;
    try {
      const res = await axiosClient.post('/chats/messages', {
        receiverId: chatModalSession.participantUserId,
        text: chatInput.trim()
      });
      if (res.data?.success) {
        setChatInput('');
        fetchChatMessages();
      }
    } catch (err) {
      console.error("Error sending member message:", err);
    }
  };

  const handleJoinCall = (appt) => {
    logCallEvent({
      memberName: currentMember.name,
      advisor: appt.participantName || appt.advisor,
      source: 'member-session-card'
    });
    setJoiningId(appt.id);
    setTimeout(() => {
      setJoiningId(null);
      alert(t('sessions.connectionEstablished', 'Secure connection established with') + ' ' + (appt.participantName || appt.advisor) + '. ' + t('sessions.openingNode', 'Opening session node...'));
      const meetingLink = `https://meet.jit.si/health-sakhi-${appt.id}`;
      window.open(meetingLink, '_blank');
    }, 1500);
  };

  const handleReset = () => {
    setSelectedAdvisor(null);
    setSelectedDay(0);
    setSelectedSlot(null);
    setSelectedDuration(0);
    setTopic('');
    setName(currentMember.name);
    setStep('list');
    setBooking(null);
  };

  // Group appointments into active upcoming and past completed
  const upcomingAppts = appointments.filter((a) => a.status === 'scheduled' || a.status === 'pending');
  const pastAppts = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled');

  if (step === 'success') return <SuccessScreen booking={booking} onReset={handleReset} t={t} />;

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12 text-[#15192c]">
      
      {/* Header Banner */}
      <section className="px-2 lg:px-0">
        <div className="rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 border shadow-sm" style={{ background: '#FFF7F8', borderColor: '#F5E6EA' }}>
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border rounded-full text-[10px] font-bold uppercase tracking-widest text-[#ff69b4]" style={{ borderColor: '#F5E6EA' }}>
              <Sparkles size={12} /> {t('sessions.expertWellnessCare', 'Expert Wellness Care')}
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              {t('sessions.bookSessionHeader', 'Book Session')} <span className="text-[#ff69b4]">{t('sessions.bookYourExpertSession', 'Book your expert Sakhi session.')}</span>
            </h1>
            <p className="text-sm font-semibold leading-relaxed max-w-lg text-[#9A8A8E]">
              {t('sessions.telehealthRoomDesc', 'Consult qualified obstetricians, gynecologists, counselors, and wellness coaches in a 100% secure, private telehealth room.')}
            </p>
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">
              <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> {t('sessions.oneHundredSecure', '100% Secure')}</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> {t('sessions.professional', 'Professional')}</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> {t('sessions.videoChat', 'Video & Chat')}</div>
            </div>
          </div>
          <div className="w-56 h-56 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center p-8 border border-rose-50 shrink-0">
            <div className="text-center">
              <Video size={40} className="mx-auto mb-4 text-[#ff69b4]/60 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#15192c]">{t('sessions.videoSession', 'Video Session')}</p>
              <p className="text-[9px] font-bold mt-2 text-[#ff69b4] bg-rose-50 px-3 py-1 rounded-full">{t('sessions.proMemberBenefit', 'Pro Member Benefit')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Loader Overlay */}
      {actionLoading && (
        <div className="fixed inset-0 z-[100] bg-[#15192c]/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl border border-rose-50 flex items-center gap-3 shadow-xl">
            <RefreshCw className="animate-spin text-[#ff69b4]" size={20} />
            <span className="text-xs font-black uppercase tracking-wider">{t('sessions.processing', 'Processing...')}</span>
          </div>
        </div>
      )}

      {/* Upcoming / History Sections */}
      {loading ? (
        <div className="h-40 bg-white border border-rose-50 rounded-[2.5rem] flex items-center justify-center animate-pulse">
          <RefreshCw size={24} className="animate-spin text-[#ff69b4]/60" />
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl text-center space-y-4">
          <AlertCircle className="mx-auto text-rose-500" size={32} />
          <p className="text-xs font-bold text-rose-600">{error}</p>
          <button onClick={loadData} className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider">
            {t('sessions.reloadPage', 'Reload Page')}
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Appointments */}
          {upcomingAppts.length > 0 && (
            <section className="space-y-6 px-2 lg:px-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight">{t('sessions.upcomingSessions', 'Upcoming Consultation Sessions')}</h2>
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {upcomingAppts.length} {t('sessions.scheduled', 'Scheduled')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingAppts.map((appt) => (
                  <div key={appt.id} className="bg-white rounded-[2.5rem] p-7 border border-rose-50 shadow-sm relative overflow-hidden flex flex-col justify-between h-72">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-full blur-2xl -mr-12 -mt-12" />
                    <div>
                      <div className="flex items-start gap-4 mb-4 relative z-10">
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 text-[#ff69b4] flex items-center justify-center font-black text-sm shrink-0 border border-rose-100">
                          {appt.participantName?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[8px] font-black uppercase tracking-widest text-[#ff69b4] mb-0.5">{t('sessions.apptId', 'Appt ID')}: {appt.id.substring(0, 8)}</p>
                          <h3 className="text-sm font-black truncate">{appt.participantName}</h3>
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            appt.status === 'scheduled' 
                              ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' 
                              : 'bg-amber-50 border border-amber-100 text-amber-600'
                          }`}>
                            {appt.status === 'scheduled' ? t('sessions.scheduledStatus', 'Scheduled') : t('sessions.pendingAdvisor', 'Pending Advisor')}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 mb-6 text-xs font-bold">
                        <div className="flex items-center gap-2.5">
                          <Calendar size={14} className="text-[#ff69b4]" />
                          <span>{new Date(appt.date).toLocaleDateString(langCode === 'en' ? 'en-US' : langCode === 'hi' ? 'hi-IN' : 'mr-IN', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock size={14} className="text-[#ff69b4]" />
                          <span>{appt.start_time} - {appt.end_time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 relative z-10">
                      <button onClick={() => handleJoinCall(appt)} disabled={joiningId === appt.id} className="flex-1 py-3 bg-[#15192c] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md">
                        {joiningId === appt.id ? t('sessions.connectingNode', 'Connecting Node...') : t('sessions.joinRoom', 'Join Room')}
                      </button>
                      <button onClick={() => handleMemberChat(appt)} className="px-4 py-3 bg-white border border-[#F5E6EA] text-[#ff69b4] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 active:scale-95 transition-all">
                        {t('sessions.chat', 'Chat')}
                      </button>
                      <button
                        onClick={() => setReschedulingAppt(appt)}
                        title={t('sessions.reschedule', 'Reschedule')}
                        className="p-3 bg-rose-50 border border-rose-100 text-[#ff69b4] rounded-xl hover:bg-rose-100 active:scale-95 transition-all shrink-0"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => handleCancelSession(appt.id)}
                        title={t('sessions.cancel', 'Cancel')}
                        className="p-3 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-100 active:scale-95 transition-all shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Past Consultation History (Task 6: Appointment History) */}
          {pastAppts.length > 0 && (
            <section className="space-y-6 px-2 lg:px-0">
              <h2 className="text-xl font-black tracking-tight">{t('sessions.historyTitle', 'Appointment History & Consultation Notes')}</h2>
              <div className="bg-white rounded-[2.5rem] border border-rose-50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-rose-50 bg-rose-50/20 text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">
                        <th className="p-5">{t('academy.advisorLabel', 'Advisor')}</th>
                        <th className="p-5">{t('sessions.dateLabel', 'Date')} & {t('sessions.timeLabel', 'Time')}</th>
                        <th className="p-5">{t('sessions.charged', 'Charged')}</th>
                        <th className="p-5">{t('todo.priorityStatus', 'Status')}</th>
                        <th className="p-5 text-right">{t('sessions.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50/50 text-xs font-semibold">
                      {pastAppts.map((appt) => (
                        <tr key={appt.id} className="hover:bg-rose-50/10">
                          <td className="p-5 font-black">{appt.participantName}</td>
                          <td className="p-5">
                            {new Date(appt.date).toLocaleDateString(langCode === 'en' ? 'en-US' : langCode === 'hi' ? 'hi-IN' : 'mr-IN', { timeZone: 'UTC' })} at {appt.start_time}
                          </td>
                          <td className="p-5 text-slate-500">₹{appt.amount_paid || '299'}</td>
                          <td className="p-5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              appt.status === 'completed'
                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                : 'bg-slate-50 text-slate-500 border border-slate-100'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            {appt.notes ? (
                              <button
                                onClick={() => setViewingNotes(appt.notes)}
                                className="px-3 py-1.5 bg-[#ff69b4] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 flex items-center gap-1.5 ml-auto"
                              >
                                <Clipboard size={12} /> {t('sessions.viewNotes', 'View Notes')}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">{t('sessions.noNotes', 'No notes uploaded')}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Advisor Grid */}
      <section className="space-y-8 px-2 lg:px-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">{t('sessions.expertGridTitle', 'Select a Certified Wellness Expert')}</h2>
          <button onClick={() => setShowAll(v => !v)} className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] hover:underline">
            {showAll ? t('sessions.showLess', 'Show Less') : t('sessions.seeAll', 'See All Experts')}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {visibleAdvisors.map((adv) => (
            <motion.div key={adv.id} whileHover={{ y: -4 }}
              className={`bg-white rounded-[2.5rem] p-8 border shadow-sm transition-all cursor-pointer ${selectedAdvisor?.id === adv.id ? 'border-[#ff69b4] shadow-rose-100 shadow-lg ring-2 ring-[#ff69b4]/20' : 'border-[#F5E6EA] hover:shadow-md'}`}>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 border-4 border-white shadow-sm bg-rose-50 flex items-center justify-center text-rose-300 font-bold text-3xl">
                  {adv.photo_url ? (
                    <img src={adv.photo_url} alt={adv.name} className="w-full h-full object-cover" />
                  ) : (
                    adv.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black text-[#15192c]">{adv.name}</h3>
                      <Shield size={14} className="text-blue-400" />
                      {selectedAdvisor?.id === adv.id && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{t('sessions.selected', 'Selected ✓')}</span>}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">{adv.qualification}</p>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-[#9A8A8E]">{adv.bio || t('sessions.defaultBio', 'Qualified medical practitioner specializing in women health guidance.')}</p>
                  <div className="flex flex-wrap gap-2">
                    {(adv.specializations || []).map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-rose-50 border border-rose-100/50 rounded-lg text-[9px] font-black text-[#ff69b4] uppercase tracking-wider">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-1.5 font-black text-xs text-[#15192c]">
                      <Star size={16} fill="#FFD700" className="text-transparent" />
                      {adv.rating} <span className="font-semibold text-[#C4A0AC]">({adv.reviews_count || 12})</span>
                    </div>
                    <button
                      onClick={() => handleSelectAdvisor(adv)}
                      className="flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-95"
                      style={{ background: selectedAdvisor?.id === adv.id ? '#15192c' : '#ff69b4' }}>
                      {selectedAdvisor?.id === adv.id ? t('sessions.selected', 'Selected ✓') : t('sessions.selectExpert', 'Select Expert')} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Slot Selection */}
      <section id="slot-section" className="px-2 lg:px-0">
        <AnimatePresence mode="wait">
          {!selectedAdvisor ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-[3rem] p-10 text-center space-y-6 border shadow-sm border-[#F5E6EA]">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-[#FFF7F8] border border-[#F5E6EA]">
                <Calendar size={28} className="text-[#F5B4BC]" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-xl font-black text-[#15192c]">{t('sessions.emptySlotTitle', 'Select Availability Slot')}</h2>
                <p className="text-xs font-semibold text-[#9A8A8E]">{t('sessions.emptySlotDesc', 'Choose an advisor above to display their available schedule slots.')}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="slots" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 border shadow-sm border-[#F5E6EA] space-y-10">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff69b4]/10 text-[#ff69b4] flex items-center justify-center font-black">
                    {selectedAdvisor.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#ff69b4]">{t('sessions.scheduleWith', 'Schedule Slot with')}</p>
                    <h3 className="text-base font-black text-[#15192c]">{selectedAdvisor.name}</h3>
                  </div>
                </div>
                <button onClick={() => setSelectedAdvisor(null)} className="w-9 h-9 rounded-full bg-rose-50 text-[#C4A0AC] flex items-center justify-center hover:bg-rose-100 transition-all">
                  <X size={14} />
                </button>
              </div>

              {/* Date selection */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-4">{t('sessions.selectDateTitle', 'Select Consultation Date')}</p>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {days.map((d) => (
                    <button key={d.idx}
                      onClick={() => { setSelectedDay(d.idx); setSelectedSlot(null); }}
                      className={`flex-shrink-0 px-5 py-3.5 rounded-2xl border-2 transition-all text-center min-w-[90px] ${selectedDay === d.idx ? 'bg-[#15192c] border-[#15192c] text-white' : 'border-[#F5E6EA] hover:border-rose-200'}`}>
                      <p className={`text-[9px] font-black uppercase tracking-wide ${selectedDay === d.idx ? 'text-white/60' : 'text-[#C4A0AC]'}`}>{translateDayLabel(d.label, t)}</p>
                      <p className={`text-xs font-black mt-0.5 ${selectedDay === d.idx ? 'text-white' : 'text-[#15192c]'}`}>{translateDateStr(d.date, t)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slots */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-4">{t('sessions.availableTimes', 'Available Times')}</p>
                {advisorSlots.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400">{t('sessions.noSlots', 'No active slots available for this date.')}</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {advisorSlots.map((slot) => (
                      <button key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 rounded-2xl border-2 text-[11px] font-black transition-all ${selectedSlot?.id === slot.id ? 'bg-[#ff69b4] border-[#ff69b4] text-white shadow-lg shadow-rose-200/50' : 'border-[#F5E6EA] text-[#15192c] hover:border-[#ff69b4]'}`}>
                        {slot.start_time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm details form */}
              <AnimatePresence>
                {selectedSlot && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="h-px bg-rose-50" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('sessions.consultationPurpose', 'Consultation Purpose')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4A0AC]" />
                        <input type="text" placeholder={t('sessions.patientName', 'Patient Name')}
                          value={name} onChange={e => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-xs font-bold text-[#15192c]" />
                      </div>
                      <div className="relative">
                        <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4A0AC]" />
                        <select value={topic} onChange={e => setTopic(e.target.value)}
                          className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-xs font-bold text-[#15192c] bg-white appearance-none">
                          <option value="">{t('sessions.selectConcern', 'Select Concern/Topic')}</option>
                          {topics.map(topicKey => <option key={topicKey} value={topicKey}>{t(`sessions.topics.${topicKey}`)}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="bg-rose-50/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-rose-100/50">
                      <div className="space-y-1 text-xs">
                        <p className="font-black text-[#15192c]">{selectedAdvisor.name} • {translateDayLabel(days[selectedDay].label, t)}, {translateDateStr(days[selectedDay].date, t)}</p>
                        <p className="text-[#C4A0AC] font-bold">{selectedSlot?.start_time} • {t('sessions.duration_15min', '15 min')} • {t('sessions.freeIncluded', 'Free (Included in Plan)')}</p>
                      </div>
                      <button
                        onClick={handleConfirm}
                        disabled={!name || !topic}
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-md ${name && topic ? 'bg-[#ff69b4] hover:brightness-110 shadow-rose-200/50' : 'bg-slate-300 cursor-not-allowed'}`}
                      >
                        {t('sessions.bookConsultation', 'Book Consultation')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Reschedule Dialog (Task 3: Reschedule UI) */}
      <AnimatePresence>
        {reschedulingAppt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#15192c]/50 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full border border-rose-50 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-rose-50 pb-4 mb-6">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#ff69b4]">{t('sessions.reschedule', 'Reschedule')}</span>
                  <h3 className="text-base font-black">{t('sessions.changeSchedule', 'Change Session Schedule')}</h3>
                </div>
                <button onClick={() => setReschedulingAppt(null)} className="w-8 h-8 rounded-full bg-rose-50 text-[#C4A0AC] flex items-center justify-center hover:bg-rose-100 transition-all">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto pr-1">
                {/* Dates */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-3">{t('sessions.selectNewDate', 'Select New Date')}</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {days.map((d) => (
                      <button key={d.idx}
                        onClick={() => { setRescheduleDay(d.idx); setSelectedRescheduleSlot(null); }}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all text-center min-w-[80px] ${rescheduleDay === d.idx ? 'bg-[#ff69b4] text-white border-[#ff69b4] shadow-sm' : 'border-[#F5E6EA] hover:border-rose-200'}`}>
                        <p className={`text-[8px] font-black uppercase ${rescheduleDay === d.idx ? 'text-white' : 'text-[#C4A0AC]'}`}>{translateDayLabel(d.label, t)}</p>
                        <p className="text-[11px] font-black mt-0.5">{translateDateStr(d.date, t)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slots */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-3">{t('sessions.availableTimes', 'Available Times')}</p>
                  {rescheduleSlots.length === 0 ? (
                    <p className="text-xs font-bold text-slate-400">{t('sessions.noSlots', 'No active slots available for this date.')}</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {rescheduleSlots.map((slot) => (
                        <button key={slot.id}
                          onClick={() => setSelectedRescheduleSlot(slot)}
                          className={`py-2.5 rounded-xl border text-[10px] font-black transition-all ${selectedRescheduleSlot?.id === slot.id ? 'bg-[#15192c] border-[#15192c] text-white' : 'border-[#F5E6EA] text-[#15192c] hover:border-[#ff69b4]'}`}>
                          {slot.start_time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-rose-50 flex gap-3">
                <button onClick={() => setReschedulingAppt(null)} className="flex-1 py-3 bg-rose-50 text-[#ff69b4] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100">
                  {t('sessions.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleRescheduleConfirm}
                  disabled={!selectedRescheduleSlot}
                  className={`flex-1 py-3 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md ${selectedRescheduleSlot ? 'bg-[#ff69b4] hover:brightness-110 shadow-rose-100' : 'bg-slate-300 cursor-not-allowed'}`}
                >
                  {t('sessions.rescheduleSave', 'Save Schedule')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consultation Notes Modal (Task 5: Consultation Notes) */}
      <AnimatePresence>
        {viewingNotes && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#15192c]/50 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full border border-rose-50 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-rose-50 pb-4 mb-6">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#ff69b4]">{t('sessions.notesLabel', 'Consultation notes')}</span>
                  <h3 className="text-base font-black">{t('sessions.notesSubtitle', 'Medical Prescription & Diagnosis')}</h3>
                </div>
                <button onClick={() => setViewingNotes(null)} className="w-8 h-8 rounded-full bg-rose-50 text-[#C4A0AC] flex items-center justify-center hover:bg-rose-100 transition-all">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-5 text-xs font-semibold leading-relaxed text-[#6B5E63]">
                {viewingNotes.symptoms && (
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-1">{t('sessions.symptomsReported', 'Symptoms Reported')}</h4>
                    <p className="bg-rose-50/30 p-3.5 rounded-xl border border-rose-100/20 text-[#15192c]">{viewingNotes.symptoms}</p>
                  </div>
                )}
                {viewingNotes.diagnosis && (
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-1">{t('sessions.clinicalDiagnosis', 'Clinical Diagnosis')}</h4>
                    <p className="bg-rose-50/30 p-3.5 rounded-xl border border-rose-100/20 text-[#15192c]">{viewingNotes.diagnosis}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-1">{t('sessions.treatmentPlan', 'Treatment Plan')}</h4>
                  <p className="bg-rose-50/30 p-3.5 rounded-xl border border-rose-100/20 text-[#15192c]">{viewingNotes.treatment_plan}</p>
                </div>
                {viewingNotes.prescriptions && (
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-1">{t('sessions.prescribedMedicines', 'Prescribed Medicines')}</h4>
                    <p className="bg-rose-50/30 p-3.5 rounded-xl border border-rose-100/20 font-mono text-[#ff69b4] whitespace-pre-wrap">{viewingNotes.prescriptions}</p>
                  </div>
                )}
              </div>

              <button onClick={() => setViewingNotes(null)} className="w-full mt-8 py-3.5 bg-[#15192c] text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                {t('sessions.closeNotes', 'Close Notes')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat popup window */}
      <AnimatePresence>
        {chatModalSession && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-screen h-screen z-[80] bg-[#15192c]/80 backdrop-blur-md flex items-start justify-center px-4 pt-36 pb-0 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
              className="w-full max-w-md bg-white rounded-[3rem] border border-[#F5E6EA] shadow-2xl overflow-hidden flex flex-col h-[620px]">
              <div className="p-6 border-b border-[#F5E6EA] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#ff69b4] font-black text-xl">
                    {chatModalSession.participantName?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#15192c]">{chatModalSession.participantName}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{t('sessions.chatConnected', 'Connected')}</p>
                  </div>
                </div>
                <button onClick={() => setChatModalSession(null)} className="w-10 h-10 rounded-full bg-rose-50 text-[#C4A0AC] hover:bg-rose-100 transition-all">
                  <X size={16} className="mx-auto" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#FFF7F8]/30">
                {chatMessages.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white border border-[#F5E6EA] text-xs font-bold text-[#9A8A8E]">
                    {t('sessions.start_chat', 'Send a message to start the consultation chat.')}
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isMine = msg.senderType === 'member' || msg.isMine;
                    const isSystem = msg.senderType === 'system';
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-[1.75rem] text-sm font-bold leading-relaxed ${
                          isSystem ? 'bg-amber-50 border border-amber-100 text-[#7a5a1f]' : isMine ? 'bg-[#15192c] text-white rounded-tr-none' : 'bg-white border border-[#F5E6EA] text-[#15192c] rounded-tl-none'
                        }`}>
                          {msg.contentType === 'image' ? (
                            <div className="space-y-2">
                              <img 
                                src={msg.fileUrl} 
                                alt={msg.text || "Image attachment"} 
                                className="rounded-2xl max-w-full max-h-48 object-cover border border-[#F5E6EA]"
                              />
                              {msg.text && <p className="text-xs mt-1 font-semibold">{msg.text}</p>}
                            </div>
                          ) : msg.contentType === 'file' || msg.contentType === 'document' ? (
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-xs font-black truncate text-slate-800">{msg.text || t('sessions.document', 'Document')}</p>
                              <a 
                                href={msg.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] font-black text-rose-500 hover:underline uppercase tracking-wider"
                              >
                                {t('sessions.download', 'Download')}
                              </a>
                            </div>
                          ) : (
                            <p>{msg.text}</p>
                          )}
                          <p className={`text-[9px] mt-2 uppercase tracking-widest ${isMine ? 'text-white/40' : 'text-[#C4A0AC]'}`}>{msg.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-6 border-t border-[#F5E6EA] bg-white flex flex-col gap-3">
                <div className="flex gap-2">
                  <button 
                    onClick={() => memberFileRef.current?.click()}
                    type="button"
                    title={t('sessions.uploadDocument', 'Upload document')}
                    className="w-10 h-10 rounded-xl bg-rose-50 text-[#ff69b4] hover:bg-rose-100 flex items-center justify-center transition-all border border-[#F5E6EA]"
                  >
                    <Paperclip size={16} />
                  </button>
                  <button 
                    onClick={() => memberImageRef.current?.click()}
                    type="button"
                    title={t('sessions.uploadImage', 'Upload image')}
                    className="w-10 h-10 rounded-xl bg-rose-50 text-[#ff69b4] hover:bg-rose-100 flex items-center justify-center transition-all border border-[#F5E6EA]"
                  >
                    <Image size={16} />
                  </button>
                </div>
                <div className="flex gap-3">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendModalChat()}
                    placeholder={t('sessions.typeMessage', 'Type your message...')}
                    className="flex-1 h-12 px-4 rounded-2xl border-2 border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-sm font-bold bg-rose-50/30" />
                  <button onClick={handleSendModalChat} disabled={!chatInput.trim()}
                    className={`w-12 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${chatInput.trim() ? 'bg-[#ff69b4] text-white hover:brightness-110' : 'bg-rose-100 text-[#C4A0AC] cursor-not-allowed'}`}>
                    →
                  </button>
                </div>
                <input ref={memberFileRef} type="file" className="hidden" onChange={(e) => handleMemberFileUpload(e.target.files)} />
                <input ref={memberImageRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleMemberImageUpload(e.target.files)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade membership modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15192c]/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full border border-rose-100 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-rose-100/50 rounded-full blur-xl -z-10" />
              <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-pink-50 rounded-full blur-lg -z-10" />

              <div className="w-16 h-16 rounded-[1.5rem] bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-6 text-[#ff69b4]">
                <Shield size={28} className="animate-pulse" />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">
                {t('sessions.advisorLocked', 'Advisor Access Locked 🔒')}
              </p>
              <h3 className="text-xl font-black text-[#15192c] mb-4">
                {t('sessions.notAvailableFree', 'Not Available on Free Plan')}
              </h3>
              <p className="text-xs font-bold text-[#6B5E63] leading-relaxed mb-8">
                {t('sessions.upgradeDesc', 'Advisor consultations are not included in your Free Sakhi plan. 🌿 Upgrade to a premium plan to book 1-on-1 sessions with certified wellness experts and doctors.')}
              </p>

              <div className="space-y-3">
                <button onClick={() => { setShowUpgradeModal(false); navigate('/app/plans'); }}
                  className="w-full py-4 bg-[#ff69b4] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-rose-200">
                  {t('sessions.upgradeButton', 'Upgrade Membership Now 💎')}
                </button>
                <button onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3.5 bg-rose-50 text-[#ff69b4] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 active:scale-95 transition-all">
                  {t('sessions.close', 'Close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
};

export default SessionBookingScreen;

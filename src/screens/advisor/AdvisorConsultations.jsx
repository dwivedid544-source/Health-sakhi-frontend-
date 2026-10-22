import React, { useState } from 'react';
import { 
  Users, Heart, MessageSquare, Clipboard, Send, 
  Search, Filter, ExternalLink, Calendar, CheckCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import axiosClient from '../../api/axiosClient';
import { useLanguage } from '../../context/LanguageContext';

const AdvisorConsultations = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [adviceText, setAdviceText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchConsultations = async (selectFirst = false) => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/appointments');
      const data = res.data?.appointments || res.data || [];
      
      const grouped = {};
      data.forEach(apt => {
        const memberId = apt.participantUserId || apt.userId || 'unknown-member';
        const memberName = apt.participantName || 'Member User';
        if (!grouped[memberId]) {
          grouped[memberId] = {
            memberId,
            memberName,
            email: apt.email || '',
            appointments: []
          };
        }
        grouped[memberId].appointments.push({
          id: apt.id,
          type: 'Wellness Consultation',
          status: apt.status === 'completed' ? 'Completed' : (apt.status === 'cancelled' ? 'Cancelled' : (apt.status === 'scheduled' ? 'Scheduled' : 'Pending')),
          date: new Date(apt.date).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }),
          time: apt.start_time,
          duration: apt.duration || '30 min',
          notes: apt.notes
        });
      });
      
      const mapped = Object.values(grouped);
      setConsultations(mapped);
      
      if (mapped.length > 0) {
        if (selectFirst) {
          setSelectedId(mapped[0].memberId);
          if (mapped[0].appointments.length > 0) {
            setSelectedApptId(mapped[0].appointments[0].id);
          }
        } else {
          // If not first load, check if currently selected still exists
          const stillExists = mapped.find(m => m.memberId === selectedId);
          if (stillExists) {
            const apptExists = stillExists.appointments.find(a => a.id === selectedApptId);
            if (!apptExists && stillExists.appointments.length > 0) {
              setSelectedApptId(stillExists.appointments[0].id);
            }
          } else {
            setSelectedId(mapped[0].memberId);
            if (mapped[0].appointments.length > 0) {
              setSelectedApptId(mapped[0].appointments[0].id);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching consultations:", err);
      setError("Failed to load consultations list.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchConsultations(true);
  }, []);

  const filteredConsultations = consultations.filter(c => 
    c.memberName.toLowerCase().includes(searchText.toLowerCase()) ||
    c.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const selectedMember = filteredConsultations.find((m) => m.memberId === selectedId) || filteredConsultations[0];
  const selectedConsultation = selectedMember?.appointments.find(a => a.id === selectedApptId) || selectedMember?.appointments[0];

  React.useEffect(() => {
    if (selectedConsultation) {
      setAdviceText(selectedConsultation.notes?.treatment_plan || '');
    } else {
      setAdviceText('');
    }
  }, [selectedId, selectedApptId, consultations]);

  const handleUpdateAdvice = async () => {
    if (!selectedConsultation || !adviceText.trim()) return;
    try {
      setSubmitting(true);
      await axiosClient.post(`/appointments/${selectedConsultation.id}/notes`, {
        treatment_plan: adviceText.trim()
      });
      alert("Wellness recommendations successfully sent to the sister! ✨");
      await fetchConsultations(false);
    } catch (err) {
      console.error("Error submitting advice notes:", err);
      alert(err.response?.data?.message || "Failed to update clinical advice.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && consultations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-[#ff69b4]/10 border-t-[#ff69b4] animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#15192c]">{t('advisorConsultations.title', 'Consultation Center')}</h1>
        <p className="text-[#C4A0AC] font-bold">{t('advisorConsultations.desc', 'Manage wellness advice for your assigned Sakhis')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4A0AC]" size={18} />
            <input 
              type="text" 
              placeholder={t('advisorConsultations.searchMembers', 'Search members...')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-rose-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff69b4]/20 font-bold text-[#15192c]"
            />
          </div>

          <div className="space-y-4">
            {filteredConsultations.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[#C4A0AC] bg-white rounded-[2rem] border border-rose-100">
                {t('advisorConsultations.noConsultationsFound', 'No consultations found.')}
              </div>
            ) : (
              filteredConsultations.map((c) => {
                const hasActive = c.appointments.some(a => a.status === 'Scheduled' || a.status === 'Pending');
                const latestApt = c.appointments[0];
                return (
                  <div 
                    key={c.memberId} 
                    onClick={() => {
                      setSelectedId(c.memberId);
                      if (c.appointments.length > 0) {
                        setSelectedApptId(c.appointments[0].id);
                      }
                    }}
                    className={`p-5 bg-white border rounded-[2rem] hover:ring-2 hover:ring-[#ff69b4]/20 transition-all cursor-pointer group ${
                      selectedMember?.memberId === c.memberId ? 'border-[#ff69b4] ring-2 ring-[#ff69b4]/20' : 'border-rose-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#ff69b4] font-black">
                          {c.memberName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#15192c]">{c.memberName}</h4>
                          <div className="flex items-center gap-2">
                            <Heart size={10} className="text-pink-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">
                              {c.appointments.length} Session{c.appointments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        hasActive ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {hasActive ? 'Active' : 'Completed'}
                      </span>
                    </div>
                    <p className="text-[12px] font-bold text-[#9A8A8E] line-clamp-1">
                      {latestApt ? `Latest: ${latestApt.date} at ${latestApt.time}` : 'No sessions'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Advice Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!selectedMember ? (
             <div className="p-8 bg-white border border-rose-100 rounded-[3rem] shadow-sm flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <Users className="text-[#C4A0AC]" size={48} />
                <h3 className="text-lg font-black text-[#15192c]">{t('advisorConsultations.noConsultationSelected', 'No Consultation Selected')}</h3>
                <p className="text-[#9A8A8E] text-xs font-medium max-w-xs">{t('advisorConsultations.selectConsultationDesc', "Select a sister's consultation case from the sidebar to review and add your advice.")}</p>
             </div>
          ) : (
             <div className="p-8 bg-white border border-rose-100 rounded-[3rem] shadow-sm flex-1 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl overflow-hidden bg-rose-50 flex items-center justify-center text-xl font-bold text-[#ff69b4]">
                       {selectedMember.memberName.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <h3 className="text-xl font-black text-[#15192c]">{selectedMember.memberName}</h3>
                       <p className="text-[11px] font-black uppercase tracking-widest text-[#ff69b4]">Member consultations history</p>
                     </div>
                   </div>
                   <button className="p-4 bg-rose-50 rounded-2xl text-[#ff69b4] hover:bg-[#ff69b4] hover:text-white transition-all">
                     <ExternalLink size={20} />
                   </button>
                </div>

                {/* Session Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-rose-50/20 border border-rose-100 rounded-[2rem]">
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">Select Consultation Session</h4>
                      <p className="text-[11px] font-bold text-[#9A8A8E]">Choose which booking to view or add recommendations for</p>
                   </div>
                   <select
                     value={selectedApptId || ''}
                     onChange={(e) => setSelectedApptId(e.target.value)}
                     className="px-4 py-3 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff69b4]/20 font-bold text-[#15192c] text-xs shadow-sm min-w-[220px]"
                   >
                     {selectedMember.appointments.map(apt => (
                       <option key={apt.id} value={apt.id}>
                         {apt.date} at {apt.time} ({apt.status})
                       </option>
                     ))}
                   </select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('advisorConsultations.addClinicalNote', 'Your Wellness Recommendations')}</h3>
                  <textarea 
                     rows="6"
                     value={adviceText}
                     onChange={(e) => setAdviceText(e.target.value)}
                     disabled={selectedConsultation.status === 'Completed' || submitting}
                     placeholder={selectedConsultation.status === 'Completed' ? t('advisorConsultations.prescribePlaceholder', "Advice notes have already been submitted and finalized.") : t('advisorConsultations.prescribePlaceholder', "Write your advice here for the Relationship/Mental Health module...")}
                     className="w-full p-6 bg-rose-50/20 border border-rose-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#ff69b4]/20 transition-all font-bold text-[#15192c] leading-relaxed disabled:opacity-50"
                  ></textarea>
                  {selectedConsultation.status !== 'Completed' && (
                    <button 
                      onClick={handleUpdateAdvice}
                      disabled={submitting || !adviceText.trim()}
                      className="w-full py-5 bg-[#ff69b4] text-white rounded-3xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-rose-200 flex items-center justify-center gap-3 hover:brightness-110 transition-all disabled:opacity-50"
                    >
                       <Send size={18} /> {submitting ? t('advisorConsultations.submitting', 'Updating...') : t('advisorConsultations.submitAdvice', 'Update Sakhi Advice')}
                    </button>
                  )}
                </div>
                {selectedConsultation ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {[
                         { label: 'Case Type', value: selectedConsultation.type, icon: Heart },
                         { label: 'Session Status', value: selectedConsultation.status, icon: CheckCircle },
                         { label: 'Session Date', value: selectedConsultation.date, icon: Calendar },
                         { label: 'History', value: selectedConsultation.status === 'Completed' ? 'Advice logged' : 'Awaiting notes', icon: Clipboard },
                       ].map((stat, i) => (
                        <div key={i} className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100">
                           <stat.icon size={14} className="mb-2 text-[#ff69b4]" />
                           <p className="text-[12px] font-black text-[#15192c] truncate">{stat.value}</p>
                           <p className="text-[8px] font-black uppercase tracking-widest text-[#C4A0AC] mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">Your Wellness Recommendations</h3>
                      <textarea 
                         rows="6"
                         value={adviceText}
                         onChange={(e) => setAdviceText(e.target.value)}
                         disabled={submitting}
                         placeholder="Write your advice here for the Relationship/Mental Health module..."
                         className="w-full p-6 bg-rose-50/20 border border-rose-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#ff69b4]/20 transition-all font-bold text-[#15192c] leading-relaxed disabled:opacity-50"
                      ></textarea>
                      <button 
                        onClick={handleUpdateAdvice}
                        disabled={submitting || !adviceText.trim() || adviceText.trim() === (selectedConsultation.notes?.treatment_plan || '')}
                        className="w-full py-5 bg-[#ff69b4] text-white rounded-3xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-rose-200 flex items-center justify-center gap-3 hover:brightness-110 transition-all disabled:opacity-50"
                      >
                         <Send size={18} /> {submitting ? 'Updating...' : selectedConsultation.notes ? 'Update Sakhi Advice' : 'Submit Sakhi Advice'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-slate-50 border rounded-2xl text-center text-xs font-bold text-[#C4A0AC]">
                    No appointments found for this member.
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorConsultations;

import React, { useState } from 'react';
import { Calendar, Clock, Save, RefreshCw, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useLanguage } from '../../context/LanguageContext';

const SlotManagementScreen = () => {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [slots, setSlots] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/advisors/me/availability');
      const backendSlots = res.data?.slots || [];
      
      const newSlots = {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
      };
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      backendSlots.forEach(s => {
        const dateStr = typeof s.date === 'string' ? s.date.split('T')[0] : new Date(s.date).toISOString().split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day));
        const dayName = dayNames[utcDate.getUTCDay()];

        const [h, m] = s.start_time.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        const time12 = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
        
        if (newSlots[dayName] && !newSlots[dayName].includes(time12)) {
          newSlots[dayName].push(time12);
        }
      });
      
      Object.keys(newSlots).forEach(day => {
        newSlots[day].sort((a, b) => {
          const toMinutes = (t) => {
            const [time, modifier] = t.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          return toMinutes(a) - toMinutes(b);
        });
      });
      
      setSlots(newSlots);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setError(err.response?.data?.message || err.message || "Failed to load availability schedule.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAvailability();
  }, []);

  const allSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  const toggleSlot = (time) => {
    const currentDaySlots = slots[selectedDay];
    if (currentDaySlots.includes(time)) {
      setSlots({ ...slots, [selectedDay]: currentDaySlots.filter(t => t !== time) });
    } else {
      setSlots({ ...slots, [selectedDay]: [...currentDaySlots, time].sort() });
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      const today = new Date();
      const dayIndexMap = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
      };
      
      const payloadSlots = [];
      
      for (const [dayName, times] of Object.entries(slots)) {
        const targetDayIndex = dayIndexMap[dayName];
        const currentDayIndex = today.getDay();
        let daysToAdd = targetDayIndex - currentDayIndex;
        if (daysToAdd < 0) daysToAdd += 7;
        
        const slotDate = new Date();
        slotDate.setDate(today.getDate() + daysToAdd);
        
        const year = slotDate.getFullYear();
        const month = String(slotDate.getMonth() + 1).padStart(2, '0');
        const dateVal = String(slotDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${dateVal}`;
        
        for (const timeStr of times) {
          const [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':');
          if (modifier === 'PM' && hours !== '12') {
            hours = parseInt(hours, 10) + 12;
          }
          if (modifier === 'AM' && hours === '12') {
            hours = '00';
          }
          const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          
          let endHours = parseInt(hours, 10);
          let endMinutes = parseInt(minutes, 10) + 30;
          if (endMinutes >= 60) {
            endHours += 1;
            endMinutes -= 60;
          }
          const formattedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
          
          payloadSlots.push({
            date: formattedDate,
            startTime: formattedTime,
            endTime: formattedEndTime
          });
        }
      }
      
      await axiosClient.post('/advisors/availability/bulk', { slots: payloadSlots });
      alert("Master schedule saved successfully! ✨");
    } catch (err) {
      console.error("Error saving slots:", err);
      alert(err.response?.data?.message || "Failed to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 font-sans pb-14">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('advisorSlots.title', 'Availability Master')}</h1>
          <p className="text-slate-500 text-xs font-medium">{t('advisorSlots.desc', 'Configure your active consultation hours for the upcoming week.')}</p>
        </div>
        <button 
          onClick={handleSaveSchedule}
          disabled={saving}
          className="px-4 py-2 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm hover:bg-black transition-all disabled:opacity-55"
        >
           <Save size={16} /> {saving ? t('advisorSlots.saving', 'Saving...') : t('advisorSlots.saveMasterSchedule', 'Save Master Schedule')}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-[1.5rem] border border-rose-100 text-xs font-bold flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchAvailability} 
            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-[1.5rem] border border-black/5 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[440px] relative">
        {/* Sidebar: Day Selector */}
        <div className="w-full lg:w-64 border-r border-black/5 bg-slate-50/50 p-4 space-y-2">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('advisorSlots.weeklyRotation', 'Weekly Rotation')}</p>
           {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                  selectedDay === day 
                    ? 'bg-health-green text-white shadow-lg shadow-health-green/15' 
                    : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }`}
              >
                <span className="text-sm">{day}</span>
                <span className="text-[9px] opacity-70">{slots[day].length}</span>
              </button>
           ))}
           <div className="mt-5 p-4 bg-slate-900 text-white rounded-[1.5rem] space-y-2">
              <RefreshCw size={18} className="text-health-green mb-1" />
              <p className="text-[11px] font-bold leading-relaxed">{t('advisorSlots.quickSync', 'Quick Sync with Google Calendar is coming in Phase 2.')}</p>
           </div>
        </div>

        {/* Main: Slot Grid */}
        <div className="flex-1 p-4 space-y-5 relative">
           {loading && (
             <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-r-[1.5rem]">
               <div className="flex flex-col items-center gap-3">
                 <div className="w-8 h-8 rounded-full border-4 border-slate-900/10 border-t-slate-900 animate-spin"></div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading slots...</p>
               </div>
             </div>
           )}
           <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-health-soft rounded-2xl flex items-center justify-center text-health-dark">
                    <Calendar size={16} />
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">{selectedDay} {t('advisorSlots.slots', 'Slots')}</h2>
                    <p className="text-[11px] font-bold text-slate-500">{slots[selectedDay].length} {t('advisorSlots.workingSlots', 'working slots')}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-800 transition-colors"><ChevronLeft size={16} /></button>
                 <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-800 transition-colors"><ChevronRight size={16} /></button>
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
              {allSlots.map(time => {
                const isActive = slots[selectedDay].includes(time);
                return (
                  <button
                    key={time}
                    onClick={() => toggleSlot(time)}
                    className={`group relative p-3 rounded-[1.5rem] border transition-all flex flex-col items-center gap-1.5 ${
                      isActive 
                        ? 'bg-white border-health-green shadow-sm shadow-health-green/10' 
                        : 'bg-slate-50/50 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <Clock size={14} className={isActive ? 'text-health-green' : 'text-slate-300'} />
                    <span className={`text-[12px] font-black ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{time}</span>
                    {isActive && (
                       <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-health-green rounded-full"></div>
                    )}
                  </button>
                );
              })}
               <button className="p-3 rounded-[1.5rem] border-2 border-dashed border-slate-200 hover:border-health-green hover:bg-health-green/5 transition-all flex flex-col items-center justify-center gap-1.5 group">
                 <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-health-green group-hover:text-white flex items-center justify-center transition-all">
                    <Plus size={14} />
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-health-green">{t('advisorSlots.quickAdd', 'Quick Add')}</span>
               </button>
           </div>

           <div className="p-4 bg-slate-50 rounded-[1.75rem] border border-black/5 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-health-dark">
                    <RefreshCw size={14} />
                 </div>
                 <p className="text-sm font-bold text-slate-600">{t('advisorSlots.needToBlock', 'Need to block vacation dates?')}</p>
              </div>
              <button className="px-4 py-2 bg-white border border-black/10 text-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                 {t('advisorSlots.configureExceptions', 'Configure Exceptions')}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SlotManagementScreen;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Droplets, Heart, Sparkles, Activity, Plus, X, CheckCircle2, Shield, Zap, Settings, RefreshCw, BarChart2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import periodApi from '../../api/periodApi';

const PeriodTrackerScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const monthNames = [
    t('period.month.january', 'January'),
    t('period.month.february', 'February'),
    t('period.month.march', 'March'),
    t('period.month.april', 'April'),
    t('period.month.may', 'May'),
    t('period.month.june', 'June'),
    t('period.month.july', 'July'),
    t('period.month.august', 'August'),
    t('period.month.september', 'September'),
    t('period.month.october', 'October'),
    t('period.month.november', 'November'),
    t('period.month.december', 'December')
  ];

  // Core Real State
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Setup / Onboarding state
  const [setupLastPeriodDate, setSetupLastPeriodDate] = useState('');
  const [setupCycleLength, setSetupCycleLength] = useState(28);
  const [setupPeriodLength, setSetupPeriodLength] = useState(5);

  // Settings Modal states
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [tempCycleLength, setTempCycleLength] = useState(28);
  const [tempPeriodLength, setTempPeriodLength] = useState(5);

  // Log Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectionType, setSelectionType] = useState('start');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Reset Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Calendar view state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [daysInMonth, setDaysInMonth] = useState(30);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [overlappingLogId, setOverlappingLogId] = useState(null);
  const [sameMonthWarningLogId, setSameMonthWarningLogId] = useState(null);
  const [maxMonthlyLogs, setMaxMonthlyLogs] = useState(null);

  // Fetch complete payload in one go
  const fetchCompleteState = async (month, year) => {
    try {
      const targetMonth = month || currentMonth;
      const targetYear = year || currentYear;
      
      // We load profile to check if user has finished setup
      const profData = await periodApi.getProfile();
      if (!profData.profile) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profData.profile);
      
      const dashData = await periodApi.getDashboard();
      setDashboard(dashData);

      const calData = await periodApi.getCalendar(targetMonth, targetYear);
      setCalendar(calData);

      const histData = await periodApi.getLogs();
      setHistory(histData.logs || []);

      setDaysInMonth(new Date(targetYear, targetMonth, 0).getDate());
      setLoading(false);
    } catch (err) {
      console.error('Failed to load period tracker state', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompleteState(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  // Navigate calendar month
  const navigateMonth = (offset) => {
    let nextMonth = currentMonth + offset;
    let nextYear = currentYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  const handlePrevMonth = () => navigateMonth(-1);
  const handleNextMonth = () => navigateMonth(1);

  // Setup / Onboarding handler
  const handleSetupOnboarding = async (e) => {
    e.preventDefault();
    if (!setupLastPeriodDate) {
      setErrorMessage(t('period.pleaseSelectDate', 'Please select a last period date.'));
      return;
    }
    setIsSaving(true);
    setErrorMessage('');
    try {
      const res = await periodApi.setupProfile({
        lastPeriodDate: new Date(setupLastPeriodDate).toISOString(),
        cycleLength: parseInt(setupCycleLength, 10),
        periodLength: parseInt(setupPeriodLength, 10)
      });
      if (res.success) {
        // Reset states completely and apply setup payload
        setProfile(null);
        setDashboard(null);
        setCalendar(null);
        setHistory([]);
        
        setProfile(res.profile);
        setDashboard(res.dashboard);
        setCalendar(res.calendar);
        setHistory(res.history || []);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || t('period.setupError', 'Failed to save setup.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Open settings
  const openSettingsModal = () => {
    if (profile) {
      setTempCycleLength(profile.cycleLength || 28);
      setTempPeriodLength(profile.periodLength || 5);
      setIsSettingsModalOpen(true);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      // Clear prediction state from the frontend before rendering new data
      setDashboard(null);
      setCalendar(null);

      const res = await periodApi.updateProfile({
        cycleLength: parseInt(tempCycleLength, 10),
        periodLength: parseInt(tempPeriodLength, 10)
      }, currentMonth, currentYear);

      if (res.success) {
        setProfile(res.profile);
        setDashboard(res.dashboard);
        setCalendar(res.calendar);
        setHistory(res.history || []);
        setIsSettingsModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || t('period.settingsError', 'Failed to save settings.'));
      // Fallback reload state
      fetchCompleteState();
    } finally {
      setIsSaving(false);
    }
  };

  // Open Log Period modal
  const openLogModal = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectionType('start');
    setErrorMessage('');
    setOverlappingLogId(null);
    setSameMonthWarningLogId(null);
    setMaxMonthlyLogs(null);
    setIsModalOpen(true);
  };

  // Log a new Period Cycle
  const handleLogPeriod = async (forceOverwrite = false, keepBoth = false, specificDeleteId = null) => {
    if (!startDate) return;
    setIsSaving(true);
    setErrorMessage('');
    const deleteLogId = specificDeleteId || (forceOverwrite ? (overlappingLogId || sameMonthWarningLogId) : null);
    try {
      // Build date strings timezone-safely
      const sd = new Date(Date.UTC(currentYear, currentMonth - 1, startDate, 12, 0, 0));
      const isoDate = sd.toISOString();

      let endIsoDate = null;
      if (endDate) {
        const ed = new Date(Date.UTC(currentYear, currentMonth - 1, endDate, 12, 0, 0));
        endIsoDate = ed.toISOString();
      } else {
        // Default end date if none selected is start date + profile length
        const ed = new Date(sd);
        ed.setUTCDate(ed.getUTCDate() + (profile?.periodLength || 5) - 1);
        endIsoDate = ed.toISOString();
      }

      // Reset predictions and calendar on UI before response
      setDashboard(null);
      setCalendar(null);

      const res = await periodApi.startPeriod(isoDate, endIsoDate, currentMonth, currentYear, deleteLogId, keepBoth);
      if (res.success) {
        setProfile(res.profile);
        setDashboard(res.dashboard);
        setCalendar(res.calendar);
        setHistory(res.history || []);
        setOverlappingLogId(null);
        setSameMonthWarningLogId(null);
        setMaxMonthlyLogs(null);
        setIsModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData && responseData.error === 'OVERLAP_ERROR') {
        setOverlappingLogId(responseData.details?.overlappingLogId || true);
        setErrorMessage(responseData.message || t('period.overlapError', 'The selected dates overlap with an existing period log.'));
      } else if (responseData && responseData.error === 'SAME_MONTH_WARNING') {
        setSameMonthWarningLogId(responseData.details?.existingLogId || true);
        setErrorMessage(responseData.message || t('period.sameMonthWarning', 'You already have a logged period in this month. Do you want to replace it?'));
      } else if (responseData && responseData.error === 'MAX_MONTHLY_LOGS_REACHED') {
        setMaxMonthlyLogs(responseData.details?.existingLogs || []);
        setErrorMessage(responseData.message || t('period.maxMonthlyLogs', 'A month can have a maximum of 2 logged periods. Please select which existing period to replace.'));
      } else {
        setErrorMessage(responseData?.message || t('period.logError', 'Failed to log period.'));
      }
      // Fallback reload state
      fetchCompleteState();
    } finally {
      setIsSaving(false);
    }
  };

  // Reset all logs in current month
  const handleResetMonth = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      setDashboard(null);
      setCalendar(null);
      const res = await periodApi.resetMonth(currentMonth, currentYear);
      if (res.success) {
        setProfile(res.profile);
        setDashboard(res.dashboard);
        setCalendar(res.calendar);
        setHistory(res.history || []);
        setIsResetModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || t('period.resetError', 'Failed to reset month logs.'));
      fetchCompleteState();
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate dynamic stats for preview inside log modal
  const getLogModalPreview = () => {
    if (!startDate) return null;
    const duration = endDate ? (endDate - startDate + 1) : (profile?.periodLength || 5);
    const cycleLen = profile?.cycleLength || 28;
    
    const sd = new Date(Date.UTC(currentYear, currentMonth - 1, startDate, 12, 0, 0));
    
    // Predicted next period = startDate + cycleLen
    const nextPeriod = new Date(sd);
    nextPeriod.setUTCDate(nextPeriod.getUTCDate() + cycleLen);

    // Predicted ovulation = nextPeriod - 14 days
    const nextOvulation = new Date(nextPeriod);
    nextOvulation.setUTCDate(nextOvulation.getUTCDate() - 14);

    return {
      duration,
      nextPeriod: nextPeriod.getUTCDate() + ' ' + monthNames[nextPeriod.getUTCMonth()] + ' ' + nextPeriod.getUTCFullYear(),
      nextOvulation: nextOvulation.getUTCDate() + ' ' + monthNames[nextOvulation.getUTCMonth()] + ' ' + nextOvulation.getUTCFullYear()
    };
  };

  // Calculate Dynamic Cycle Insights
  const getCycleInsights = () => {
    // Filter history with valid start and end dates
    const validCycles = history.filter(h => h.startDate && h.endDate);
    if (validCycles.length === 0) {
      return {
        avgCycle: '--',
        avgPeriod: '--',
        longestCycle: '--',
        shortestCycle: '--'
      };
    }

    const periods = validCycles.map(h => {
      const diff = new Date(h.endDate).getTime() - new Date(h.startDate).getTime();
      return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
    });

    const cycleLengths = [];
    for (let i = 0; i < validCycles.length - 1; i++) {
      const diff = new Date(validCycles[i].startDate).getTime() - new Date(validCycles[i + 1].startDate).getTime();
      const length = Math.round(diff / (1000 * 60 * 60 * 24));
      if (length >= 21 && length <= 45) {
        cycleLengths.push(length);
      }
    }

    const avgPeriod = Math.round(periods.reduce((a, b) => a + b, 0) / periods.length);
    const avgCycle = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : (profile?.cycleLength || 28);

    const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : (profile?.cycleLength || 28);
    const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : (profile?.cycleLength || 28);

    return {
      avgCycle,
      avgPeriod,
      longestCycle,
      shortestCycle
    };
  };

  const insights = getCycleInsights();

  // Rendering Loader State
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FFF7F8]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[#ff69b4]" size={36} />
          <span className="text-xs font-black uppercase tracking-widest text-[#ff69b4]">{t('period.loading', 'Loading Rhythm...')}</span>
        </div>
      </div>
    );
  }

  // Rendering Onboarding Setup screen if profile doesn't exist
  if (!profile) {
    return (
      <div className="min-h-screen w-full bg-[#FFF7F8] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-white rounded-[3rem] p-8 sm:p-10 shadow-xl border border-rose-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-[#ff69b4] mx-auto shadow-inner"><Droplets size={28} /></div>
              <h2 className="text-2xl font-black text-[#15192c]">{t('period.setupTitle', 'Welcome to Period Sakhi 🌸')}</h2>
              <p className="text-xs font-bold text-[#C4A0AC] uppercase tracking-wider">{t('period.setupDesc', 'Setup your tracking parameters below')}</p>
            </div>

            <form onSubmit={handleSetupOnboarding} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('period.lastPeriodDate', 'Last Period Date')}</label>
                <input 
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={setupLastPeriodDate}
                  onChange={(e) => setSetupLastPeriodDate(e.target.value)}
                  className="w-full px-5 py-4 bg-rose-50/50 border border-rose-100 text-[#15192c] rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ff69b4] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-[#C4A0AC]">{t('period.cycleLength', 'Cycle Length')}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="21"
                      max="45"
                      value={setupCycleLength}
                      onChange={(e) => setSetupCycleLength(Math.max(21, Math.min(45, parseInt(e.target.value, 10) || 28)))}
                      className="w-12 py-1 text-center bg-rose-50 border border-rose-100 rounded-lg text-xs font-bold text-[#ff69b4]"
                    />
                    <span className="text-[#ff69b4]">{t('period.days', 'Days')}</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min="21"
                  max="45"
                  value={setupCycleLength}
                  onChange={(e) => setSetupCycleLength(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-[#ff69b4]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-[#C4A0AC]">{t('period.periodLength', 'Period Length')}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="2"
                      max="10"
                      value={setupPeriodLength}
                      onChange={(e) => setSetupPeriodLength(Math.max(2, Math.min(10, parseInt(e.target.value, 10) || 5)))}
                      className="w-12 py-1 text-center bg-rose-50 border border-rose-100 rounded-lg text-xs font-bold text-[#ff69b4]"
                    />
                    <span className="text-[#ff69b4]">{t('period.days', 'Days')}</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min="2"
                  max="10"
                  value={setupPeriodLength}
                  onChange={(e) => setSetupPeriodLength(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-[#ff69b4]"
                />
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-wide border border-red-100">
                  ⚠️ {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-5 bg-[#ff69b4] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-100/50 hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('period.beginTracking', 'Begin Tracking 🌸')}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard calculations
  const cycleDay = dashboard?.cycleDay;
  const nextPeriodIn = dashboard?.nextPeriodIn;
  const currentPhase = dashboard?.currentPhase;
  const wellnessMessage = dashboard?.wellnessMessage;

  // Calendar dates
  const loggedPeriodDays = calendar?.loggedPeriodDays || [];
  const predictedPeriodDays = calendar?.predictedPeriodDays || [];
  const fertilityDays = calendar?.fertileDays || [];
  const ovulationDays = calendar?.ovulationDays || [];

  return (
    <div className="min-h-screen w-full bg-[#FFF7F8] relative overflow-x-hidden font-sans text-[#15192c]">

      {/* Subtle Mesh Background */}
      <style>
        {`
          @keyframes meshFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .mesh-bg {
            background: linear-gradient(-45deg, #FFF7F8, #FFE4E8, #FFD1D9, #F5B4BC);
            background-size: 400% 400%;
            animation: meshFlow 25s ease infinite;
          }
        `}
      </style>
      <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full px-6 md:px-12 py-8 space-y-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-5">
            <button
              onClick={() => navigate('/app')}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-rose-100 flex items-center justify-center text-[#15192c] hover:bg-[#ff69b4] hover:text-white transition-all shadow-sm shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#15192c]">{t('period.periodTracker', 'Period Tracker')}</h1>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A0AC]">{t('period.wellnessSanctuary', 'Wellness Sanctuary')}</p>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={openSettingsModal}
              className="flex-1 sm:flex-initial px-5 py-3 md:py-4 bg-white border border-rose-100 text-[#15192c] rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
            >
              <Settings size={16} className="text-[#ff69b4]" /> {t('period.settings', 'Settings')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={openLogModal}
              className="flex-1 sm:flex-initial px-6 md:px-8 py-3 md:py-4 bg-[#ff69b4] text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100/50 hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> {t('period.logPeriod', 'Log Period')}
            </motion.button>
          </div>
        </header>

        {/* Dashboard Real-time Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white/85 backdrop-blur-md p-5 md:p-6 rounded-2xl md:rounded-3xl border border-rose-100/30 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#ff69b4] shrink-0"><CalendarIcon size={18} /></div>
            <div>
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('period.cycleDay', 'Cycle Day')}</p>
              <h3 className="text-lg md:text-xl font-black text-[#15192c]">
                {cycleDay ? `${t('period.day', 'Day')} ${cycleDay}` : '-'}
              </h3>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-md p-5 md:p-6 rounded-2xl md:rounded-3xl border border-rose-100/30 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#ff69b4] shrink-0"><Zap size={18} /></div>
            <div>
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('period.nextPeriod', 'Next Period')}</p>
              <h3 className="text-lg md:text-xl font-black text-[#15192c]">
                {nextPeriodIn === null || nextPeriodIn === undefined ? '-' :
                  nextPeriodIn === 0 ? t('period.startsToday', 'Expected Today 🌸') :
                    nextPeriodIn > 0 ? `${t('period.in', 'in')} ${nextPeriodIn} ${t('period.days', 'Days')}` :
                      `${Math.abs(nextPeriodIn)} ${t('period.daysLate', 'Days Late ⚠️')}`}
              </h3>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-md p-5 md:p-6 rounded-2xl md:rounded-3xl border border-rose-100/30 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#ff69b4] shrink-0"><Sparkles size={18} /></div>
            <div>
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('period.currentPhase', 'Current Phase')}</p>
              <h3 className={`text-lg md:text-xl font-black ${
                currentPhase === 'Period' ? 'text-[#ff69b4]' :
                currentPhase === 'Fertile Window' ? 'text-[#00b0ff]' :
                currentPhase === 'Ovulation' ? 'text-[#4caf50]' :
                currentPhase === 'Follicular' ? 'text-[#ec4899]' :
                'text-[#8b5cf6]'
              }`}>
                {currentPhase === 'Period' ? t('period.phase.period', 'Period 🩸') :
                  currentPhase === 'Follicular' ? t('period.phase.follicular', 'Follicular 🌱') :
                  currentPhase === 'Fertile Window' ? t('period.phase.fertile', 'Fertile Window 🎯') :
                  currentPhase === 'Ovulation' ? t('period.phase.ovulation', 'Ovulation Day 🥚') :
                  currentPhase === 'Luteal' ? t('period.phase.luteal', 'Luteal Phase 🍂') :
                  currentPhase || '-'}
              </h3>
            </div>
          </div>

          <div className="bg-[#15192c] p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-lg flex items-center gap-4 text-white">
            <div className="w-10 h-10 bg-[#ff69b4]/20 rounded-xl flex items-center justify-center text-[#ff69b4] shrink-0"><Heart size={18} /></div>
            <p className="text-[9px] md:text-[10px] font-bold text-white/95 leading-normal">
              {wellnessMessage || t('periodTracker.healthyCycle', 'Your cycle is healthy, Sakhi! 💖')}
            </p>
          </div>
        </div>

        {/* Phase Progress Indicator */}
        <div className="bg-white/85 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-rose-100/30 shadow-sm space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('period.cycleProgress', 'Cycle Phase Progress')}</p>
          <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-black uppercase tracking-wider">
            <div className={`p-2.5 rounded-xl border ${currentPhase === 'Period' ? 'bg-[#ff69b4] text-white border-transparent' : 'bg-rose-50/50 text-[#C4A0AC] border-rose-100/50'}`}>🩸 {t('period.phase.period', 'Period')}</div>
            <div className={`p-2.5 rounded-xl border ${currentPhase === 'Follicular' ? 'bg-[#ec4899] text-white border-transparent' : 'bg-rose-50/50 text-[#C4A0AC] border-rose-100/50'}`}>🌱 {t('period.phase.follicular', 'Follicular')}</div>
            <div className={`p-2.5 rounded-xl border ${currentPhase === 'Fertile Window' || currentPhase === 'Ovulation' ? 'bg-[#4caf50] text-white border-transparent' : 'bg-rose-50/50 text-[#C4A0AC] border-rose-100/50'}`}>🥚 {t('period.phase.ovulation', 'Ovulation')}</div>
            <div className={`p-2.5 rounded-xl border ${currentPhase === 'Luteal' ? 'bg-[#8b5cf6] text-white border-transparent' : 'bg-rose-50/50 text-[#C4A0AC] border-rose-100/50'}`}>🍂 {t('period.phase.luteal', 'Luteal')}</div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-10 border border-white shadow-xl shadow-rose-100/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-[#15192c]">{monthNames[currentMonth - 1]} {currentYear}</h3>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('period.rhythmSubtitle', 'Track your natural rhythm')}</p>
            </div>
            <div className="flex gap-2 items-center self-end sm:self-auto">
              <button
                onClick={() => {
                  setErrorMessage('');
                  setIsResetModalOpen(true);
                }}
                title="Reset this month's logs"
                className="px-3 h-8 rounded-xl bg-rose-50 border border-rose-100 text-[#ff69b4] text-[9px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-rose-100 transition-all shadow-sm"
              >
                <RotateCcw size={13} /> {t('period.reset', 'Reset')}
              </button>
              <button onClick={handlePrevMonth} className="w-8 h-8 rounded-xl bg-white border border-rose-50 flex items-center justify-center text-[#C4A0AC] hover:text-[#ff69b4] transition-all shadow-sm"><ChevronLeft size={18} /></button>
              <button onClick={handleNextMonth} className="w-8 h-8 rounded-xl bg-white border border-rose-50 flex items-center justify-center text-[#C4A0AC] hover:text-[#ff69b4] transition-all shadow-sm"><ChevronRight size={18} /></button>
            </div>
          </div>

          {/* Visual Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 bg-rose-50/30 p-4 rounded-2xl border border-rose-100/30 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">
            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-[#ff69b4] rounded-lg shadow-sm" /> <span>Logged Period</span></div>
            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-pink-50/30 border border-dashed border-[#ff69b4] rounded-lg" /> <span>Predicted Period</span></div>
            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-[#e0f7fa] border border-[#b2ebf2] rounded-lg" /> <span>Fertile Window</span></div>
            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-[#4caf50] rounded-full" /> <span>Ovulation Day</span></div>
            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-[#15192c] rounded-lg shadow-sm" /> <span>Today</span></div>
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {[t('periodTracker.sun', 'SUN'), t('periodTracker.mon', 'MON'), t('periodTracker.tue', 'TUE'), t('periodTracker.wed', 'WED'), t('periodTracker.thu', 'THU'), t('periodTracker.fri', 'FRI'), t('periodTracker.sat', 'SAT')].map(d => (
              <div key={d} className="text-center text-[8px] md:text-[9px] font-black text-[#C4A0AC] tracking-widest py-2">{d}</div>
            ))}

            {Array.from({ length: new Date(currentYear, currentMonth - 1, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isLoggedPeriod = loggedPeriodDays.includes(dateStr);
              const isPredictedPeriod = predictedPeriodDays.includes(dateStr);
              const isFertile = fertilityDays.includes(dateStr);
              const isOvulation = ovulationDays.includes(dateStr);
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth - 1, day).toDateString();

              let cellClass = 'bg-white/40 hover:bg-white text-[#15192c] border border-transparent hover:border-rose-50 rounded-xl md:rounded-2xl';
              let dotColor = null;

              if (isOvulation) {
                cellClass = 'bg-[#4caf50] text-white rounded-full scale-105 shadow-md';
                dotColor = 'bg-white';
              } else if (isLoggedPeriod) {
                cellClass = 'bg-[#ff69b4] text-white rounded-xl md:rounded-2xl';
                dotColor = 'bg-white';
              } else if (isPredictedPeriod) {
                cellClass = 'bg-pink-50/50 text-[#ff69b4] border border-dashed border-[#ff69b4] rounded-xl md:rounded-2xl';
                dotColor = 'bg-[#ff69b4]';
              } else if (isFertile) {
                cellClass = 'bg-[#e0f7fa] text-[#006064] border border-[#b2ebf2] rounded-xl md:rounded-2xl';
                dotColor = 'bg-[#006064]';
              } else if (isToday) {
                cellClass = 'bg-[#15192c] text-white shadow-2xl z-10 rounded-xl md:rounded-2xl';
                dotColor = 'bg-white';
              }

              return (
                <button
                  key={i}
                  className={`h-11 sm:h-14 md:h-18 flex flex-col items-center justify-center transition-all relative ${cellClass}`}
                >
                  <span className="text-[10px] sm:text-xs md:text-sm font-black">{day}</span>
                  {dotColor && <div className={`w-1 h-1 rounded-full ${dotColor} mt-0.5`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Cycle Insights Cards */}
        <div className="bg-white/90 rounded-[2.5rem] p-6 sm:p-8 border border-white shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#ff69b4]"><BarChart2 size={20} /></div>
            <div>
              <h3 className="text-lg font-black text-[#15192c]">{t('period.insightsTitle', 'Cycle Insights 📊')}</h3>
              <p className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-wider">{t('period.insightsDesc', 'Personalized dynamic bio-stats')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/30 text-center">
              <span className="block text-[8px] font-black uppercase text-[#C4A0AC] tracking-widest">Avg Cycle</span>
              <span className="text-xl font-black text-[#ff69b4]">{typeof insights.avgCycle === 'number' ? `${insights.avgCycle} Days` : (insights.avgCycle || '--')}</span>
            </div>
            <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/30 text-center">
              <span className="block text-[8px] font-black uppercase text-[#C4A0AC] tracking-widest">Avg Period</span>
              <span className="text-xl font-black text-[#ff69b4]">{typeof insights.avgPeriod === 'number' ? `${insights.avgPeriod} Days` : (insights.avgPeriod || '--')}</span>
            </div>
            <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/30 text-center">
              <span className="block text-[8px] font-black uppercase text-[#C4A0AC] tracking-widest">Longest Cycle</span>
              <span className="text-xl font-black text-[#ff69b4]">{typeof insights.longestCycle === 'number' ? `${insights.longestCycle} Days` : (insights.longestCycle || '--')}</span>
            </div>
            <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/30 text-center">
              <span className="block text-[8px] font-black uppercase text-[#C4A0AC] tracking-widest">Shortest Cycle</span>
              <span className="text-xl font-black text-[#ff69b4]">{typeof insights.shortestCycle === 'number' ? `${insights.shortestCycle} Days` : (insights.shortestCycle || '--')}</span>
            </div>
          </div>
        </div>

        {/* Cycle History Section */}
        <div className="bg-white/90 rounded-[2.5rem] p-6 sm:p-8 border border-white shadow-xl space-y-4">
          <h3 className="text-base font-black text-[#15192c] uppercase tracking-wider">{t('period.cycleHistory', 'Cycle History')}</h3>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-xs text-[#C4A0AC] font-bold py-4">{t('period.noHistory', 'No logs found. Start logging to build history.')}</p>
            ) : (
              history.map((log) => {
                const start = new Date(log.startDate);
                const end = log.endDate ? new Date(log.endDate) : start;
                const total = log.periodLength || 1;
                return (
                  <div key={log.id} className="flex justify-between items-center p-4 bg-rose-50/20 border border-rose-100/20 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-[#15192c]">
                        {start.getUTCDate()} {monthNames[start.getUTCMonth()]} {start.getUTCFullYear()} - {end.getUTCDate()} {monthNames[end.getUTCMonth()]} {end.getUTCFullYear()}
                      </span>
                      <span className="block text-[9px] font-bold text-[#C4A0AC] uppercase mt-0.5">Flow: {log.flow || 'Medium'}</span>
                    </div>
                    <div className="px-4 py-2 bg-rose-50 border border-rose-100/30 text-[#ff69b4] text-xs font-black rounded-xl">
                      {total} Days
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Log Period Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#15192c]/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 relative z-10 shadow-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-[#C4A0AC] hover:text-[#15192c] transition-colors"><X size={20} /></button>

              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#ff69b4] mx-auto shadow-inner"><Droplets size={24} /></div>
                  <h3 className="text-xl font-black text-[#15192c]">{t('period.logCycle', 'Log Cycle 🌸')}</h3>
                  <p className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-widest">{monthNames[currentMonth - 1]} {currentYear}</p>
                </div>

                <div className="flex bg-rose-50/50 p-0.5 rounded-2xl">
                  <button onClick={() => setSelectionType('start')} className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${selectionType === 'start' ? 'bg-white text-[#ff69b4] shadow-sm' : 'text-[#C4A0AC]'}`}>{t('period.startDateLabel', 'Start Date')} ({startDate ? `${monthNames[currentMonth - 1]} ${startDate}` : '-'})</button>
                  <button onClick={() => setSelectionType('end')} className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${selectionType === 'end' ? 'bg-white text-[#ff69b4] shadow-sm' : 'text-[#C4A0AC]'}`}>{t('period.endDateLabel', 'End Date')} ({endDate ? `${monthNames[currentMonth - 1]} ${endDate}` : '-'})</button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {[t('periodTracker.s1', 'S'), t('periodTracker.m', 'M'), t('periodTracker.t1', 'T'), t('periodTracker.w', 'W'), t('periodTracker.t2', 'T'), t('periodTracker.f', 'F'), t('periodTracker.s2', 'S')].map((d, idx) => (
                    <div key={idx} className="text-center text-[8px] font-black text-[#C4A0AC]">{d}</div>
                  ))}

                  {Array.from({ length: new Date(currentYear, currentMonth - 1, 1).getDay() }).map((_, i) => (
                    <div key={`modal-empty-${i}`} />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    const isStart = d === startDate;
                    const isEnd = d === endDate;
                    const inRange = startDate !== null && endDate !== null && d > startDate && d < endDate;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (selectionType === 'start') {
                            setStartDate(d);
                            setEndDate(null);
                            setSelectionType('end');
                          } else {
                            if (startDate !== null && d < startDate) {
                              setEndDate(startDate);
                              setStartDate(d);
                            } else {
                              setEndDate(d);
                            }
                          }
                        }}
                        className={`h-9 rounded-xl text-[10px] font-black transition-all ${isStart || isEnd ? 'bg-[#ff69b4] text-white shadow-lg' :
                          inRange ? 'bg-rose-50 text-[#ff69b4]' :
                          'hover:bg-rose-50 text-[#15192c]'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>

                {/* On-the-fly Prediction Preview Inside Log Period Modal */}
                {startDate && (
                  <div className="p-4 bg-rose-50/30 border border-rose-100/30 rounded-2xl space-y-2 text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">
                    <span className="block text-[#ff69b4] text-center mb-1">Prediction Preview</span>
                    <div className="flex justify-between"><span>Duration:</span><span className="text-[#15192c]">{getLogModalPreview()?.duration} Days</span></div>
                    <div className="flex justify-between"><span>Next Period:</span><span className="text-[#15192c]">{getLogModalPreview()?.nextPeriod}</span></div>
                    <div className="flex justify-between"><span>Ovulation:</span><span className="text-[#15192c]">{getLogModalPreview()?.nextOvulation}</span></div>
                  </div>
                )}

                {errorMessage && !overlappingLogId && !sameMonthWarningLogId && !maxMonthlyLogs && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-wide border border-red-100">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {maxMonthlyLogs ? (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-[#ff69b4]/20 space-y-3">
                    <p className="text-[10px] font-black text-[#15192c] text-center uppercase tracking-wider leading-relaxed">
                      ⚠️ {errorMessage}
                    </p>
                    <div className="space-y-2">
                      {maxMonthlyLogs.map((logItem, idx) => (
                        <button
                          key={logItem.id || idx}
                          onClick={() => handleLogPeriod(true, false, logItem.id)}
                          className="w-full py-3 bg-[#ff69b4] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-105 transition-all shadow-md shadow-rose-100 flex items-center justify-center gap-1"
                        >
                          Replace Log {idx + 1} ({logItem.formattedDates})
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setMaxMonthlyLogs(null);
                          setErrorMessage('');
                        }}
                        className="w-full py-2.5 bg-white border border-rose-100 text-[#C4A0AC] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : overlappingLogId ? (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-[#ff69b4]/20 space-y-3">
                    <p className="text-[10px] font-black text-[#15192c] text-center uppercase tracking-wider leading-relaxed">
                      ⚠️ Selected dates overlap with an existing period log. Do you want to clear/overwrite it?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLogPeriod(true)}
                        className="flex-1 py-3 bg-[#ff69b4] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-105 transition-all shadow-md shadow-rose-100"
                      >
                        Yes, Overwrite
                      </button>
                      <button
                        onClick={() => {
                          setOverlappingLogId(null);
                          setErrorMessage('');
                        }}
                        className="flex-1 py-3 bg-white border border-rose-100 text-[#C4A0AC] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : sameMonthWarningLogId ? (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-[#ff69b4]/20 space-y-3">
                    <p className="text-[10px] font-black text-[#15192c] text-center uppercase tracking-wider leading-relaxed">
                      ⚠️ {errorMessage}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLogPeriod(true, false)}
                        className="flex-1 py-3 bg-[#ff69b4] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-105 transition-all shadow-md shadow-rose-100"
                      >
                        Yes, Replace
                      </button>
                      <button
                        onClick={() => handleLogPeriod(false, true)}
                        className="flex-1 py-3 bg-[#ff69b4]/85 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-105 transition-all shadow-md shadow-rose-100"
                      >
                        No, Keep Both
                      </button>
                      <button
                        onClick={() => {
                          setSameMonthWarningLogId(null);
                          setErrorMessage('');
                        }}
                        className="py-3 px-4 bg-white border border-rose-100 text-[#C4A0AC] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => handleLogPeriod(false)}
                      disabled={isSaving || startDate === null}
                      className="w-full py-4 bg-[#ff69b4] text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-rose-100/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('period.saveToCard', 'Save to Health Card')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsModalOpen(false)} className="absolute inset-0 bg-[#15192c]/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 relative z-10 shadow-2xl max-h-[92vh] overflow-y-auto">
              <button onClick={() => setIsSettingsModalOpen(false)} className="absolute top-8 right-8 text-[#C4A0AC] hover:text-[#15192c] transition-colors"><X size={20} /></button>

              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#ff69b4] mx-auto shadow-inner"><Activity size={24} /></div>
                  <h3 className="text-xl font-black text-[#15192c]">{t('period.cycleSettings', 'Cycle Settings ⚙️')}</h3>
                  <p className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-widest">{t('period.customizeAlgorithm', 'Customize Prediction Algorithm')}</p>
                </div>

                <div className="space-y-6">
                  {/* Cycle Length Slider + Manual Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-[#C4A0AC]">{t('period.cycleLengthLabel', 'Cycle Length')}</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min="21"
                          max="45"
                          value={tempCycleLength}
                          onChange={(e) => setTempCycleLength(Math.max(21, Math.min(45, parseInt(e.target.value, 10) || 28)))}
                          className="w-12 py-1 text-center bg-rose-50 border border-rose-100 rounded-lg text-xs font-bold text-[#ff69b4]"
                        />
                        <span className="text-[#ff69b4]">{t('period.days', 'Days')}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="21"
                      max="45"
                      value={tempCycleLength}
                      onChange={(e) => setTempCycleLength(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-[#ff69b4]"
                    />
                  </div>

                  {/* Period Length Slider + Manual Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-[#C4A0AC]">{t('period.periodLengthLabel', 'Period Length')}</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min="2"
                          max="10"
                          value={tempPeriodLength}
                          onChange={(e) => setTempPeriodLength(Math.max(2, Math.min(10, parseInt(e.target.value, 10) || 5)))}
                          className="w-12 py-1 text-center bg-rose-50 border border-rose-100 rounded-lg text-xs font-bold text-[#ff69b4]"
                        />
                        <span className="text-[#ff69b4]">{t('period.days', 'Days')}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={tempPeriodLength}
                      onChange={(e) => setTempPeriodLength(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-[#ff69b4]"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-wide border border-red-100">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full py-5 bg-[#ff69b4] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-100/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('period.saveSettings', 'Save Settings')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Month Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsResetModalOpen(false)} className="absolute inset-0 bg-[#15192c]/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm bg-white rounded-[2.5rem] p-6 sm:p-8 relative z-10 shadow-2xl space-y-6">
              <button onClick={() => setIsResetModalOpen(false)} className="absolute top-6 right-6 text-[#C4A0AC] hover:text-[#15192c] transition-colors"><X size={20} /></button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-[#ff69b4] mx-auto shadow-inner">
                  <RotateCcw size={26} />
                </div>
                <h3 className="text-xl font-black text-[#15192c]">{t('period.resetTitle', `Reset ${monthNames[currentMonth - 1]}?`)}</h3>
                <p className="text-xs font-bold text-[#C4A0AC] leading-relaxed">
                  {t('period.resetConfirmDesc', `Are you sure you want to clear all logged periods in ${monthNames[currentMonth - 1]} ${currentYear}? This action cannot be undone.`)}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-wide border border-red-100">
                  ⚠️ {errorMessage}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleResetMonth}
                  disabled={isSaving}
                  className="flex-1 py-3.5 bg-[#ff69b4] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-105 transition-all shadow-md shadow-rose-100 flex items-center justify-center gap-2"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('period.yesReset', 'Yes, Reset Month')}
                </button>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="py-3.5 px-4 bg-white border border-rose-100 text-[#C4A0AC] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
                >
                  {t('period.cancel', 'Cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-[#15192c] text-white px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 border border-white/10">
            <CheckCircle2 size={20} className="text-[#ff69b4]" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('period.updatedSuccess', 'Digital Health Card Updated! ✨')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PeriodTrackerScreen;

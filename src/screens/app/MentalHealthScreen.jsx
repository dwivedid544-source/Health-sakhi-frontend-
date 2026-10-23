import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Moon, Sun, Activity, Sparkles, ArrowRight, ChevronLeft,
  ShieldCheck, Heart, Star, MessageCircle, X, Wind, CheckCircle,
  AlertTriangle, Smile, TrendingUp, BookOpen, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

import axiosClient from '../../api/axiosClient';
import memberApi from '../../api/memberApi';
import confetti from 'canvas-confetti';



// ── Self-Check Quiz Data ─────────────────────────────────────────────────────
const quizQuestions = [
  { q: 'How often have you felt nervous, anxious, or on edge?', opts: ['Not at all','Several days','More than half the days','Nearly every day'] },
  { q: 'How often have you been unable to stop or control worrying?', opts: ['Not at all','Several days','More than half the days','Nearly every day'] },
  { q: 'How often have you felt little interest or pleasure in doing things?', opts: ['Not at all','Several days','More than half the days','Nearly every day'] },
  { q: 'How often have you felt down, depressed, or hopeless?', opts: ['Not at all','Several days','More than half the days','Nearly every day'] },
  { q: 'Overall, how would you rate your emotional wellbeing today?', opts: ['Excellent','Good','Fair','Poor'] },
];
const getResultFromScore = (score, t) => {
  if (score <= 3) return { label: t('mentalHealth.results.balanced.label', 'Balanced & Calm'), color: 'emerald', icon: Smile, msg: t('mentalHealth.results.balanced.msg', "You're doing beautifully! Keep nurturing your peace."), badgeColor: 'bg-emerald-50 border-emerald-100 text-emerald-700' };
  if (score <= 6) return { label: t('mentalHealth.results.stressed.label', 'Mildly Stressed'), color: 'amber', icon: TrendingUp, msg: t('mentalHealth.results.stressed.msg', "Some tension is building. Small self-care acts can make a big difference."), badgeColor: 'bg-amber-50 border-amber-100 text-amber-700' };
  return { label: t('mentalHealth.results.needsSupport.label', 'Needs Support'), color: 'rose', icon: AlertTriangle, msg: t('mentalHealth.results.needsSupport.msg', "It's okay to struggle. Please talk to someone you trust or use our Expert Chat."), badgeColor: 'bg-rose-50 border-rose-100 text-rose-700' };
};

// ── Box Breathing Component (Anxiety SOS) ───────────────────────────────────
const BreathingModal = ({ onClose }) => {
  const { t } = useLanguage();
  const phases = [
    { label: t('mentalHealth.inhale', 'Inhale'), sub: 'Deep breath in through nose', duration: 4, color: '#EC4899', scale: 1.35 },
    { label: t('mentalHealth.hold', 'Hold'), sub: 'Gently hold your breath', duration: 4, color: '#8B5CF6', scale: 1.35 },
    { label: t('mentalHealth.exhale', 'Exhale'), sub: 'Slow exhale through mouth', duration: 4, color: '#0EA5E9', scale: 0.75 },
    { label: t('mentalHealth.hold', 'Hold'), sub: 'Rest empty & relaxed', duration: 4, color: '#10B981', scale: 0.75 },
  ];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(phases[0].duration);
  const [cycles, setCycles] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhaseIdx(p => {
            const next = (p + 1) % phases.length;
            if (next === 0) setCycles(cy => cy + 1);
            setCount(phases[next].duration);
            return next;
          });
          return phases[(phaseIdx + 1) % phases.length].duration;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phaseIdx]);

  const current = phases[phaseIdx];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#15192c]/85 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.92, y: 15 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.92, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[3rem] p-6 sm:p-8 md:p-10 w-full max-w-md text-center shadow-2xl relative border border-rose-100 my-auto"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#C4A0AC] hover:bg-rose-100 hover:text-[#15192c] transition-all cursor-pointer shadow-sm z-20"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-[#ff69b4] text-[10px] font-black uppercase tracking-wider mb-2">
          <Wind size={13} />
          <span>{t('mentalHealth.anxietySos', 'Anxiety SOS')}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#15192c] mb-1">
          {t('mentalHealth.boxBreathing', 'Box Breathing')} 🫁
        </h2>
        <p className="text-xs text-[#9A8A8E] max-w-xs mx-auto mb-6">
          {t('mentalHealth.breathingDesc', '4-4-4-4 clinically proven pattern to calm your nervous system and relieve acute anxiety.')}
        </p>

        {/* Dynamic Pulsing Breathing Visualizer */}
        <div className="relative flex items-center justify-center mb-6 h-52">
          {/* Outer Pulsing Aura */}
          <motion.div 
            animate={{ 
              scale: running ? current.scale : 1, 
              backgroundColor: running ? current.color + '15' : '#FFF1F2' 
            }}
            transition={{ duration: current.duration * 0.95, ease: 'easeInOut' }}
            className="absolute w-44 h-44 rounded-full border-2"
            style={{ borderColor: running ? current.color : '#f9a8d4' }} 
          />
          
          {/* Inner Breathing Core */}
          <motion.div 
            animate={{ 
              scale: running ? current.scale * 0.72 : 0.72 
            }}
            transition={{ duration: current.duration * 0.95, ease: 'easeInOut' }}
            className="absolute w-28 h-28 rounded-full shadow-inner"
            style={{ backgroundColor: running ? current.color + '35' : '#fce7f3' }} 
          />

          <div className="relative z-10 flex flex-col items-center">
            <span className="text-5xl font-black text-[#15192c] tracking-tight">
              {running ? count : '4'}
            </span>
            <span className="text-base font-black mt-1" style={{ color: running ? current.color : '#EC4899' }}>
              {running ? current.label : t('mentalHealth.ready', 'Ready')}
            </span>
            {running && (
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                {current.sub}
              </span>
            )}
          </div>
        </div>

        {cycles > 0 && (
          <p className="text-xs text-[#ff69b4] font-black mb-4 animate-bounce">
            ✓ {cycles} {cycles > 1 ? t('mentalHealth.cyclesCompletes', 'cycles complete') : t('mentalHealth.cyclesComplete', 'cycle complete')} 🌸
          </p>
        )}

        <div className="space-y-3">
          <button 
            onClick={() => setRunning(r => !r)}
            className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-98 shadow-lg shadow-pink-200 cursor-pointer"
            style={{ backgroundColor: running ? '#8B5CF6' : '#EC4899' }}
          >
            {running ? t('mentalHealth.pause', 'Pause Breathing') : cycles > 0 ? t('mentalHealth.continue', 'Continue Breathing') : t('mentalHealth.startBreathing', 'Start Breathing 🌸')}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-xs font-bold text-slate-500 hover:text-[#15192c] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {t('mentalHealth.close', 'Close')}
          </button>
        </div>

        {running && (
          <p className="text-[10px] text-[#C4A0AC] mt-3 font-medium">
            {t('mentalHealth.breatheNaturally', 'Breathe naturally and gently follow the circle...')}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

// ── Self-Check Quiz Modal ────────────────────────────────────────────────────
const QuizModal = ({ onClose, onComplete }) => {
  const { t } = useLanguage();
  const questionsList = t('mentalHealth.quizQuestions', quizQuestions);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAnswer = (optIdx) => {
    const newAnswers = [...answers, optIdx];
    setAnswers(newAnswers);
    if (step < questionsList.length - 1) {
      setStep(step + 1);
    } else {
      const score = newAnswers.reduce((a, b) => a + b, 0);
      const res = getResultFromScore(score, t);
      setResult(res);
      onComplete(res);
    }
  };

  const ResultIcon = result?.icon;

  const getOptTranslationKey = (opt) => {
    const norm = opt.toLowerCase();
    if (norm.includes('not at all')) return 'not_at_all';
    if (norm.includes('several')) return 'several_days';
    if (norm.includes('half')) return 'half_days';
    if (norm.includes('every')) return 'every_day';
    return norm;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#15192c]/85 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.92, y: 15 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.92, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[3rem] p-6 sm:p-8 md:p-10 w-full max-w-md shadow-2xl relative border border-rose-100 my-auto"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#C4A0AC] hover:bg-rose-100 hover:text-[#15192c] transition-all cursor-pointer shadow-sm z-20"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {!result ? (
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">{t('mentalHealth.selfCheck', 'Self-Check')} • {step + 1}/{questionsList.length}</p>
              <div className="w-full h-1 bg-rose-50 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-[#ff69b4] rounded-full transition-all duration-500" style={{ width: `${((step) / questionsList.length) * 100}%` }} />
              </div>
              <h3 className="text-lg font-black text-[#15192c] mb-6 leading-snug">{questionsList[step].q}</h3>
              <div className="space-y-3">
                {questionsList[step].opts.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className="w-full p-4 rounded-2xl border border-rose-50 text-left text-sm font-bold text-[#15192c] hover:border-[#ff69b4] hover:bg-rose-50/30 transition-all cursor-pointer">
                    {t('mental.quiz.opt.' + getOptTranslationKey(opt), opt)}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${result.badgeColor} border`}>
              {ResultIcon && <ResultIcon size={36} />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-1">{t('mentalHealth.yourResult', 'Your Result')}</p>
            <h3 className="text-2xl font-black text-[#15192c] mb-3">{result.label}</h3>
            <p className="text-sm text-[#9A8A8E] leading-relaxed mb-8">{result.msg}</p>
            <button onClick={onClose}
              className="w-full py-4 bg-[#ff69b4] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg cursor-pointer">
              {t('mentalHealth.done', 'Done ✨')}
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ── Mood Options & In-Page Mood Logger ─────────────────────────────────────
const MOOD_OPTIONS = [
  { type: 'Happy', emoji: '😊', score: 95, color: '#EC4899', desc: 'Joyful, peaceful & content' },
  { type: 'Grateful', emoji: '🌸', score: 90, color: '#8B5CF6', desc: 'Thankful, blessed & grounded' },
  { type: 'Low Energy', emoji: '🔋', score: 50, color: '#0EA5E9', desc: 'Resting, mellow & slow' },
  { type: 'Tired', emoji: '🥱', score: 40, color: '#F59E0B', desc: 'Exhausted, needing deep sleep' },
  { type: 'Stressed', emoji: '😰', score: 25, color: '#F43F5E', desc: 'Overwhelmed, tense & anxious' },
  { type: 'Sad', emoji: '😔', score: 20, color: '#64748B', desc: 'Feeling low, tender or heavy' },
];

const MOOD_MAP = MOOD_OPTIONS.reduce((acc, m) => {
  acc[m.type.toLowerCase()] = m;
  return acc;
}, {});

const MoodModal = ({ onClose, onMoodSaved, initialMood }) => {
  const { t } = useLanguage();
  const [selectedMood, setSelectedMood] = useState(
    initialMood ? (MOOD_OPTIONS.find(m => m.type.toLowerCase() === initialMood.toLowerCase()) || MOOD_OPTIONS[0]) : MOOD_OPTIONS[0]
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedMood) return;
    try {
      setSaving(true);
      await memberApi.logMood({
        mood_type: selectedMood.type,
        intensity: 5,
        notes: notes.trim()
      });
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      onMoodSaved(selectedMood, notes.trim());
      onClose();
    } catch (err) {
      console.error("Failed to log mood pulse:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#15192c]/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.92, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[3rem] p-6 sm:p-8 md:p-10 w-full max-w-lg shadow-2xl relative border border-rose-100 my-auto"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#C4A0AC] hover:bg-rose-100 hover:text-[#15192c] transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#ff69b4]">
            <Heart size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">
              {t('mentalHealth.emotionalCheckIn', 'Daily Emotional Pulse')}
            </p>
            <h2 className="text-2xl font-black text-[#15192c]">
              {t('mentalHealth.howFeeling', 'How are you feeling today?')}
            </h2>
          </div>
        </div>
        <p className="text-xs text-[#9A8A8E] mb-6">
          {t('mentalHealth.moodPrompt', 'Select your state to dynamically update your Weekly Pulse and Joy Index.')}
        </p>

        {/* 6 Mood Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {MOOD_OPTIONS.map((m) => {
            const isSelected = selectedMood.type === m.type;
            return (
              <motion.button
                key={m.type}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedMood(m)}
                className={`p-3.5 rounded-2xl border-2 text-center flex flex-col items-center justify-between transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-[#ff69b4] bg-pink-50/50 shadow-md shadow-pink-100' 
                    : 'border-rose-50 bg-white hover:border-pink-200'
                }`}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className="text-xs font-black text-[#15192c]">{m.type}</span>
                <span className="text-[10px] font-bold text-[#ff69b4] mt-0.5">{m.score}% Joy</span>
              </motion.button>
            );
          })}
        </div>

        {/* Optional Notes */}
        <div className="space-y-2 mb-6">
          <label className="text-[11px] font-black uppercase text-[#C4A0AC] tracking-wider block">
            {t('mentalHealth.notesLabel', 'Reflections / Triggers (Optional)')}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Slept peacefully, gentle morning walk..."
            className="w-full px-4 py-3 rounded-2xl bg-rose-50/40 border border-rose-100 text-xs font-medium text-[#15192c] focus:outline-none focus:border-[#ff69b4] transition-all"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-[#ff69b4] hover:bg-pink-600 transition-all shadow-lg shadow-pink-200 hover:scale-[1.01] active:scale-98 cursor-pointer disabled:bg-slate-300 flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          <span>{saving ? 'Recording Pulse...' : 'Record Mood Pulse 🌸'}</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────
const MentalHealthScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showSOS, setShowSOS] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [emotionalState, setEmotionalState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hs_emotional_state')) || { label: 'Balanced & Calm', badgeColor: 'bg-emerald-50 border-emerald-100', textColor: 'text-emerald-700', iconColor: 'text-emerald-600', bgIcon: 'bg-emerald-100' }; }
    catch { return { label: 'Balanced & Calm', badgeColor: 'bg-emerald-50 border-emerald-100', textColor: 'text-emerald-700', iconColor: 'text-emerald-600', bgIcon: 'bg-emerald-100' }; }
  });
  const [chartData, setChartData] = useState([]);
  const [rawLogs, setRawLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const localizeLearn = (str) => {
    if (!str) return '';
    const cleanKey = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t('mental.learning.db.' + cleanKey, str);
  };

  // Helper: dynamically build current week's Sunday-Saturday array from actual logs
  const buildDynamicWeeklyChart = (logs) => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 for Sun, 1 for Mon, ..., 6 for Sat
    
    // Find Sunday of the current week
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currentDayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const daysShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return daysShort.map((dayName, idx) => {
      const dayDate = new Date(sunday);
      dayDate.setDate(sunday.getDate() + idx);
      const dateStr = dayDate.toDateString();
      const isToday = dateStr === now.toDateString();
      const isFuture = dayDate > now && !isToday;

      // Filter logs belonging to this calendar date
      const matchingLogs = (logs || []).filter(l => {
        const logDate = new Date(l.loggedAt || l.logged_at || l.createdAt);
        return logDate.toDateString() === dateStr;
      });

      if (matchingLogs.length > 0) {
        // Take the latest log of the day
        const latest = matchingLogs[0];
        const moodKey = (latest.moodType || latest.mood_type || '').toLowerCase();
        const meta = MOOD_MAP[moodKey] || MOOD_OPTIONS[0];

        return {
          day: dayName,
          date: dayDate,
          dateFormatted: dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          value: meta.score,
          hasLog: true,
          moodType: meta.type,
          emoji: meta.emoji,
          color: meta.color,
          notes: latest.notes,
          intensity: latest.intensity || 5,
          logTime: new Date(latest.loggedAt || latest.logged_at || latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isToday,
          isFuture: false
        };
      }

      // No log recorded for this day
      return {
        day: dayName,
        date: dayDate,
        dateFormatted: dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        value: 0,
        hasLog: false,
        moodType: null,
        emoji: null,
        color: '#ff69b4',
        notes: null,
        isToday,
        isFuture
      };
    });
  };

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      const res = await memberApi.getMoodLogs().catch(() => ({ moods: [] }));
      const logs = res?.moods || res?.data?.moods || res?.data || [];
      setRawLogs(logs);
      const mapped = buildDynamicWeeklyChart(logs);
      setChartData(mapped);

      // Auto update emotional state badge based on latest log if present
      if (logs.length > 0) {
        const latestMood = (logs[0].moodType || logs[0].mood_type || '').toLowerCase();
        if (latestMood.includes('happy') || latestMood.includes('grateful')) {
          setEmotionalState({
            label: 'Balanced & Calm',
            badgeColor: 'bg-emerald-50 border-emerald-100',
            textColor: 'text-emerald-700',
            iconColor: 'text-emerald-600',
            bgIcon: 'bg-emerald-100'
          });
        } else if (latestMood.includes('energy') || latestMood.includes('tired')) {
          setEmotionalState({
            label: 'Mildly Stressed',
            badgeColor: 'bg-amber-50 border-amber-100',
            textColor: 'text-amber-700',
            iconColor: 'text-amber-600',
            bgIcon: 'bg-amber-100'
          });
        } else if (latestMood.includes('stress') || latestMood.includes('sad')) {
          setEmotionalState({
            label: 'Needs Support',
            badgeColor: 'bg-rose-50 border-rose-100',
            textColor: 'text-rose-700',
            iconColor: 'text-rose-600',
            bgIcon: 'bg-rose-100'
          });
        }
      }
    } catch (err) {
      console.error("Error loading mood data:", err);
      setError("Unable to load mood history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodData();
  }, []);

  const handleMoodSaved = (savedMood, savedNotes) => {
    // Immediately prepend to local raw logs and recompute chart
    const newLog = {
      moodType: savedMood.type,
      intensity: 5,
      notes: savedNotes,
      loggedAt: new Date().toISOString()
    };
    const updated = [newLog, ...rawLogs];
    setRawLogs(updated);
    setChartData(buildDynamicWeeklyChart(updated));

    // Update emotional state banner
    if (savedMood.type === 'Happy' || savedMood.type === 'Grateful') {
      const state = { label: 'Balanced & Calm', badgeColor: 'bg-emerald-50 border-emerald-100', textColor: 'text-emerald-700', iconColor: 'text-emerald-600', bgIcon: 'bg-emerald-100' };
      setEmotionalState(state);
      localStorage.setItem('hs_emotional_state', JSON.stringify(state));
    } else if (savedMood.type === 'Low Energy' || savedMood.type === 'Tired') {
      const state = { label: 'Mildly Stressed', badgeColor: 'bg-amber-50 border-amber-100', textColor: 'text-amber-700', iconColor: 'text-amber-600', bgIcon: 'bg-amber-100' };
      setEmotionalState(state);
      localStorage.setItem('hs_emotional_state', JSON.stringify(state));
    } else {
      const state = { label: 'Needs Support', badgeColor: 'bg-rose-50 border-rose-100', textColor: 'text-rose-700', iconColor: 'text-rose-600', bgIcon: 'bg-rose-100' };
      setEmotionalState(state);
      localStorage.setItem('hs_emotional_state', JSON.stringify(state));
    }

    // Also trigger refetch to sync with server
    fetchMoodData();
  };

  const handleQuizComplete = (result) => {
    const colorMap = {
      emerald: { textColor: 'text-emerald-700', iconColor: 'text-emerald-600', bgIcon: 'bg-emerald-100', badgeColor: 'bg-emerald-50 border-emerald-100' },
      amber: { textColor: 'text-amber-700', iconColor: 'text-amber-600', bgIcon: 'bg-amber-100', badgeColor: 'bg-amber-50 border-amber-100' },
      rose: { textColor: 'text-rose-700', iconColor: 'text-rose-600', bgIcon: 'bg-rose-100', badgeColor: 'bg-rose-50 border-rose-100' },
    };
    const state = { label: result.label, ...colorMap[result.color] };
    setEmotionalState(state);
    localStorage.setItem('hs_emotional_state', JSON.stringify(state));
  };

  const getTranslatedLabel = (label) => {
    if (label === 'Balanced & Calm') return t('mentalHealth.results.balanced.label', 'Balanced & Calm');
    if (label === 'Mildly Stressed') return t('mentalHealth.results.stressed.label', 'Mildly Stressed');
    if (label === 'Needs Support') return t('mentalHealth.results.needsSupport.label', 'Needs Support');
    return label;
  };

  const tools = [
    {
      title: t('mentalHealth.tools.anxietySos.title', 'Anxiety SOS'),
      desc: t('mentalHealth.tools.anxietySos.desc', 'Quick relief techniques for overwhelming moments.'),
      icon: Wind, color: '#ff69b4', bg: 'bg-rose-50',
      action: () => setShowSOS(true)
    },
    {
      title: t('mentalHealth.tools.morningFocus.title', 'Morning Focus'),
      desc: t('mentalHealth.tools.morningFocus.desc', 'Setting healthy mental boundaries for the day.'),
      icon: Sun, color: '#CCAA3D', bg: 'bg-amber-50',
      action: () => navigate('/app/todo')
    },
    {
      title: t('mentalHealth.tools.expertChat.title', 'Expert Chat'),
      desc: t('mentalHealth.tools.expertChat.desc', 'Secure space to talk about your deeper struggles.'),
      icon: MessageCircle, color: '#D17B88', bg: 'bg-rose-50',
      action: () => navigate('/app/ai-sakhi')
    },
  ];

  const learningItems = [
    { title: t('mentalHealth.learning.item1.title', 'Healing from Trauma'), views: t('mentalHealth.learning.item1.views', '2.4k views'), tag: t('mentalHealth.learning.item1.tag', 'Expert'), icon: Heart },
    { title: t('mentalHealth.learning.item2.title', 'The Science of Joy'), views: t('mentalHealth.learning.item2.views', '1.8k views'), tag: t('mentalHealth.learning.item2.tag', 'Course'), icon: Sparkles },
    { title: t('mentalHealth.learning.item3.title', 'Overcoming PCOD Stress'), views: t('mentalHealth.learning.item3.views', '5.1k views'), tag: t('mentalHealth.learning.item3.tag', 'Wellness'), icon: Activity },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };

  return (
    <div className="relative min-h-screen pb-24 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#ff69b4]/5 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FFF1F2] blur-[120px]" />
      </div>

      <AnimatePresence>
        {showSOS && <BreathingModal onClose={() => setShowSOS(false)} />}
        {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} onComplete={handleQuizComplete} />}
        {showMoodModal && <MoodModal onClose={() => setShowMoodModal(false)} onMoodSaved={handleMoodSaved} />}
      </AnimatePresence>

      <motion.div variants={container} initial="hidden" animate="show"
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-12 space-y-12">

        {/* Header */}
        <motion.section variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate('/app')}
              className="w-14 h-14 rounded-3xl bg-white border border-rose-100 flex items-center justify-center text-[#15192c] shadow-sm hover:shadow-md transition-all">
              <ChevronLeft size={24} />
            </motion.button>
            <div className="space-y-1">
              <h1 className="text-5xl font-black tracking-tighter text-[#15192c]">{t('mentalHealth.mentalHealthHeader', 'Mental Health')} 🧠</h1>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C4A0AC]">{t('mentalHealth.emotionalWellness', 'Emotional Wellness Sanctuary')}</p>
            </div>
          </div>
          <div className={`px-8 py-5 backdrop-blur-md border rounded-[2.5rem] shadow-sm flex items-center gap-4 ${emotionalState.badgeColor}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${emotionalState.bgIcon} ${emotionalState.iconColor}`}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${emotionalState.iconColor}`}>{t('mentalHealth.emotionalState', 'Emotional State')}</p>
              <p className={`text-xl font-black ${emotionalState.textColor}`}>{getTranslatedLabel(emotionalState.label)}</p>
            </div>
          </div>
        </motion.section>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-12">

            {/* Weekly Chart */}
            {(() => {
              const loggedDays = chartData.filter(d => d.hasLog);
              const avgJoyIndex = loggedDays.length > 0
                ? Math.round(loggedDays.reduce((sum, d) => sum + d.value, 0) / loggedDays.length)
                : null;
              const todayObj = chartData.find(d => d.isToday);

              return (
                <motion.div variants={item}
                  className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] p-8 md:p-12 border border-white/60 shadow-xl shadow-rose-100/30 relative overflow-hidden">
                  
                  {/* Chart Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ff69b4]" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C4A0AC]">{t('mentalHealth.emotionalFrequency', 'Emotional Frequency')}</h3>
                      </div>
                      <p className="text-2xl md:text-3xl font-black text-[#15192c] mt-1">{t('mentalHealth.weeklyPulseOverview', 'Weekly Pulse Overview')}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-full bg-pink-50 border border-pink-100 flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#ff69b4] animate-pulse" />
                        <span className="text-xs font-black text-[#15192c]">
                          {t('mentalHealth.joyIndex', 'Joy Index')}: <strong className="text-[#ff69b4]">{avgJoyIndex !== null ? `${avgJoyIndex}%` : '--'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div className="flex items-end gap-3 md:gap-5 px-1 md:px-3" style={{ height: '210px' }}>
                    {chartData.map((d, i) => {
                      const barH = d.hasLog ? Math.max(24, Math.round((d.value / 100) * 155)) : 0;
                      return (
                        <div 
                          key={i} 
                          onClick={() => setShowMoodModal(true)}
                          className="flex-1 flex flex-col items-center justify-end gap-2.5 group relative cursor-pointer" 
                          style={{ height: '210px' }}
                        >
                          {/* Tooltip on Hover */}
                          <div className="absolute -top-12 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-[#15192c] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-2xl whitespace-nowrap flex items-center gap-1.5 border border-white/10 scale-95 group-hover:scale-100">
                            <span>{d.emoji || '📅'}</span>
                            <span>{d.day}: {d.hasLog ? `${d.moodType} (${d.value}% Joy)` : (d.isFuture ? 'Upcoming' : 'No log (Tap to log)')}</span>
                          </div>

                          <div className="w-full relative" style={{ height: '160px', display: 'flex', alignItems: 'flex-end' }}>
                            {/* Bar Column Container */}
                            <div className={`w-full rounded-t-2xl overflow-hidden relative transition-all duration-300 ${
                              d.isToday 
                                ? 'bg-pink-100/70 ring-2 ring-[#ff69b4]/50 shadow-sm' 
                                : 'bg-rose-50/60 hover:bg-rose-100/50'
                            }`} style={{ height: '160px' }}>
                              
                              {d.hasLog ? (
                                /* Actual Dynamic Bar */
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: barH }}
                                  transition={{ duration: 0.9, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                  style={{ 
                                    position: 'absolute', 
                                    bottom: 0, 
                                    left: 0, 
                                    right: 0, 
                                    borderRadius: '14px 14px 0 0',
                                    backgroundColor: d.color || '#ff69b4'
                                  }}
                                  className="shadow-md group-hover:brightness-110 transition-all flex flex-col items-center justify-start pt-2"
                                >
                                  <span className="text-xs">{d.emoji}</span>
                                </motion.div>
                              ) : (
                                /* Empty Unlogged Slot */
                                <div className="w-full h-full flex flex-col items-center justify-end pb-2">
                                  {d.isToday && (
                                    <div className="flex flex-col items-center gap-1 mb-2 animate-bounce">
                                      <span className="text-[9px] font-black uppercase text-[#ff69b4] bg-white px-2 py-0.5 rounded-full shadow-sm border border-rose-100">
                                        + Log
                                      </span>
                                    </div>
                                  )}
                                  <div className={`w-full h-1.5 rounded-full ${d.isToday ? 'bg-[#ff69b4]/60' : 'bg-rose-200/50'}`} />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Day Label with Today indicator */}
                          <div className="flex flex-col items-center">
                            <span className={`text-[10px] font-black tracking-wider transition-colors ${
                              d.isToday 
                                ? 'text-[#ff69b4] font-black scale-105' 
                                : d.hasLog 
                                  ? 'text-[#15192c]' 
                                  : 'text-[#C4A0AC] group-hover:text-[#ff69b4]'
                            }`}>
                              {t('mentalHealth.days.' + d.day, d.day)}
                            </span>
                            {d.isToday && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff69b4] mt-0.5" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary & In-Page Action Footer */}
                  <div className="mt-8 pt-6 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-bold text-[#15192c]">
                        {loggedDays.length > 0 ? (
                          <span>
                            ✨ <strong className="text-[#ff69b4]">{loggedDays.length} of 7 days</strong> logged this week • Weekly Average Joy: <strong className="text-[#ff69b4]">{avgJoyIndex}%</strong>
                          </span>
                        ) : (
                          <span className="text-[#9A8A8E]">
                            ✨ No mood logged for this week yet. Log your daily pulse to see your real emotional patterns!
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-[#C4A0AC] font-semibold mt-0.5">
                        {todayObj?.hasLog 
                          ? `✓ Today's pulse recorded: ${todayObj.moodType} ${todayObj.emoji} (${todayObj.value}% Joy)` 
                          : "Tap any day or 'Log Mood Pulse' to record today's state"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMoodModal(true)}
                      className="px-5 py-2.5 bg-[#ff69b4] hover:bg-pink-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-pink-200 hover:scale-[1.02] flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Zap size={14} />
                      <span>{todayObj?.hasLog ? "Update Today's Mood 🌸" : "Log Mood Pulse 🌸"}</span>
                    </button>
                  </div>

                </motion.div>
              );
            })()}

            {/* Resilience Tools */}
            <motion.section variants={item} className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#15192c] flex items-center justify-center text-white shadow-xl shadow-[#15192c]/20">
                  <Activity size={22} />
                </div>
                <h3 className="text-2xl font-black text-[#15192c] tracking-tight">{t('mentalHealth.dailyResilienceTools', 'Daily Resilience Tools')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tools.map((tool, i) => (
                  <motion.div whileHover={{ y: -8 }} key={i} onClick={tool.action}
                    className="p-10 rounded-[3rem] bg-white border border-rose-50 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                    <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform ${tool.bg}`} style={{ color: tool.color }}>
                      <tool.icon size={28} />
                    </div>
                    <h4 className="text-2xl font-black text-[#15192c] mb-3 leading-tight">{t('mental.tools.' + tool.title.toLowerCase().replace(/\s+/g, '_') + '.title', tool.title)}</h4>
                    <p className="text-sm font-medium text-[#9A8A8E] leading-relaxed mb-6">{t('mental.tools.' + tool.title.toLowerCase().replace(/\s+/g, '_') + '.desc', tool.desc)}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] flex items-center gap-2 group-hover:gap-3 transition-all">
                      {t('mentalHealth.openTool', 'Open Tool')} <ArrowRight size={14} />
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-10">

            {/* Self-Check Card */}
            <motion.div variants={item}
              className="p-12 rounded-[4rem] bg-[#15192c] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-[#ff69b4]/10 rounded-full blur-[80px] group-hover:bg-[#ff69b4]/20 transition-all duration-700" />
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-10 text-[#ff69b4]">
                <Brain size={32} />
              </div>
              <h3 className="text-3xl font-black mb-6 tracking-tight leading-[1.1]">{t('mentalHealth.priorityHeader', 'Your mental health is a priority.')}</h3>
              <p className="text-[15px] text-white/40 mb-10 leading-relaxed font-medium">
                {t('mentalHealth.priorityDesc', 'Complete a 2-minute clinical self-check to understand your current emotional frequency.')}
              </p>
              <button onClick={() => setShowQuiz(true)}
                className="w-full py-5 bg-[#ff69b4] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-rose-900/40 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all">
                {t('mentalHealth.takeSelfCheck', 'Take Self-Check')}
              </button>
            </motion.div>

            {/* Learning Bridge */}
            <motion.div variants={item}
              className="p-10 bg-white/80 backdrop-blur-md rounded-[3.5rem] border border-rose-50 shadow-sm space-y-8">
              <div className="flex items-center gap-3 text-[#C4A0AC]">
                <Star size={18} />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">{t('mentalHealth.learningBridge', 'Learning Bridge')}</h3>
              </div>
              <div className="space-y-8">
                {learningItems.map((mod, i) => (
                  <div key={i} onClick={() => navigate('/app/learning')}
                    className="flex items-center gap-5 group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff69b4] group-hover:bg-[#ff69b4] group-hover:text-white transition-all">
                      <mod.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-black uppercase text-[#ff69b4] mb-1 block tracking-widest">{localizeLearn(mod.tag)}</span>
                      <h4 className="text-sm font-black text-[#15192c] group-hover:text-[#ff69b4] transition-colors">{localizeLearn(mod.title)}</h4>
                      <span className="text-[10px] font-bold text-[#C4A0AC] mt-1 block">{localizeLearn(mod.views)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/app/learning')}
                className="w-full py-3 rounded-2xl border border-rose-100 text-[10px] font-black uppercase tracking-widest text-[#ff69b4] hover:bg-rose-50 transition-all">
                {t('mentalHealth.viewAllCourses', 'View All Courses →')}
              </button>
            </motion.div>

            {/* Mood Log Shortcut */}
            <motion.div variants={item} onClick={() => setShowMoodModal(true)}
              className="p-8 bg-gradient-to-br from-[#ff69b4]/10 to-purple-50 rounded-[3rem] border border-rose-100 cursor-pointer group hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ff69b4] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-rose-200">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">{t('mentalHealth.dailyLog', 'Daily Log')}</p>
                  <p className="text-sm font-black text-[#15192c]">{t('mentalHealth.logMood', "Log Today's Mood")}</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-[#C4A0AC] group-hover:text-[#ff69b4] group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>

          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default MentalHealthScreen;

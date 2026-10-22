import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Play, MoveLeft, Music, Pause, 
  CheckCircle2 as CheckIcon, Wind, ChevronRight, Quote,
  Activity, BookOpen, MessageCircle, Droplets, Trophy, Heart, CheckCircle2
} from 'lucide-react';
import { moodData } from '../../data/moodData';
import memberApi from '../../api/memberApi';

const MoodScreen = () => {
  const { moodType } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [journalEntry, setJournalEntry] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isPlayingMeditation, setIsPlayingMeditation] = useState(false);
  const [answers, setAnswers] = useState({ reason: '', reflection: '', future: '', selfCare: '' });

  const mood = Object.keys(moodData).find(m => m.toLowerCase() === moodType?.toLowerCase()) || 'Happy';
  const currentMood = moodData[mood];

  const IconMap = {
    Activity, BookOpen, MessageCircle, Droplets, Trophy, Heart, CheckCircle2, Sparkles, Music, Wind
  };

  // Mood-Specific 5-Step Questions
  const moodSpecificFlows = {
    'Happy': {
      s3: "How can you radiate this beautiful energy to someone else today?",
      s3Options: ["Compliment a stranger", "Call a loved one", "Savor the moment solo", "Write a gratitude note"],
      s4: "What's a tiny 'victory treat' you'll give yourself?",
      s4Acts: ["Favorite snack", "A short dance break", "Buying that flower", "Listening to a upbeat song"],
      s5: "What's a 'Happy Secret' you want your future self to remember about today?"
    },
    'Sad': {
      s3: "What is one thing your heart is quietly asking for right now?",
      s3Options: ["Permission to cry", "A safe space to talk", "Complete silence", "A comforting meal"],
      s4: "What's a gentle way to soothe your soul in the next hour?",
      s4Acts: ["A warm blanket hug", "Soft music", "Dimming the lights", "A glass of warm tea"],
      s5: "Write a message of love to the part of you that is hurting."
    },
    'Tired': {
      s3: "What's one thing you can 'delete' from tomorrow's list to protect your peace?",
      s3Options: ["An optional meeting", "Social media scrolling", "House chores", "Early morning alarm"],
      s4: "What's a 'rest ritual' you'll commit to right now?",
      s4Acts: ["Eye mask on", "Power nap (15m)", "Unplugging phone", "Feet up for 10 min"],
      s5: "Tell yourself why it's okay to do 'nothing' tonight."
    },
    'Stressed': {
      s3: "Of everything on your mind, what is the ONE thing you can actually control?",
      s3Options: ["My reaction", "My next breath", "One small task", "Asking for help"],
      s4: "What's a 'pressure release' action you can do in 60 seconds?",
      s4Acts: ["Scream into a pillow", "Drink cold water", "Box breathing", "Quick stretching"],
      s5: "List one thing that will still be okay even if everything isn't perfect."
    },
    'Grateful': {
      s3: "How has this feeling of abundance changed your perspective today?",
      s3Options: ["Feel more at peace", "See beauty everywhere", "Stopped worrying", "Feel connected"],
      s4: "What's a small way to 'pay it forward' in gratitude?",
      s4Acts: ["A small prayer", "Texting 'thank you'", "Feeding a bird/stray", "A genuine smile"],
      s5: "Identify one thing you used to pray for that you have now."
    },
    'Low Energy': {
      s3: "Where can you simplify your expectations for the rest of the day?",
      s3Options: ["Order in food", "Cancel late plans", "Wear comfy clothes", "Work from bed"],
      s4: "What's a 'micro-spark' that might feel nice right now?",
      s4Acts: ["Deep stretch", "Sunlight for 2m", "Washing face", "A piece of fruit"],
      s5: "What is your body trying to tell you through this low energy?"
    }
  };

  const flow = moodSpecificFlows[mood] || moodSpecificFlows['Happy'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const combinedNotes = `Reason: ${answers.reason}. Reflection: ${answers.reflection}. Goal: ${answers.future}. Self-care: ${answers.selfCare}. Journal: ${journalEntry}`;
      await memberApi.logMood({
        mood_type: mood,
        intensity: 5,
        notes: combinedNotes
      });
      setSaveStatus('saved');
      setTimeout(() => navigate('/app'), 1000);
    } catch (err) {
      console.error("Error preserving mood space:", err);
      setSaveStatus('idle');
    }
  };

  const stepVariants = {
    initial: { opacity: 0, scale: 0.9, y: 10 },
    enter: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FFF7F8] relative overflow-hidden flex flex-col items-center justify-center font-sans px-4 py-10"
    >
      <div 
        className="absolute inset-0 opacity-10 blur-[100px] pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${currentMood.accent}, transparent)` }}
      />
      
      <div className="w-full max-w-xl relative z-10">
        {/* Compact Progress Header (Inside Card Area) */}
        <div className="flex items-center justify-between mb-8 px-4">
          <button onClick={() => navigate('/app')} className="p-3 bg-white rounded-2xl shadow-sm border border-rose-50 text-gray-400 hover:text-[#15192c] transition-colors">
            <MoveLeft size={20} />
          </button>
          <div className="flex-1 mx-8 h-1.5 bg-white/50 rounded-full overflow-hidden">
             <motion.div 
               animate={{ width: `${(step / 6) * 100}%` }}
               className="h-full bg-[#ff69b4]" 
             />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-rose-50">
             <currentMood.icon size={24} style={{ color: currentMood.accent }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Initial Trigger */}
          {step === 1 && (
            <motion.div key="s1" variants={stepVariants} initial="initial" animate="enter" exit="exit" className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-rose-100/50 border border-white space-y-8">
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">Soul Pulse • 1/5</p>
                  <h2 className="text-2xl md:text-3xl font-black text-[#15192c] leading-tight">{currentMood.question}</h2>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {currentMood.reasons.map(r => (
                    <button key={r} onClick={() => { setAnswers({...answers, reason: r}); setStep(2); }} className="flex items-center justify-between p-5 rounded-2xl border border-rose-50 hover:border-[#ff69b4] hover:bg-rose-50/30 transition-all text-left group">
                       <span className="font-bold text-[#15192c] group-hover:text-[#ff69b4]">{r}</span>
                       <ChevronRight size={16} className="text-gray-300 group-hover:text-[#ff69b4]" />
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {/* Step 2: Contextual Prompt (The Real Question) */}
          {step === 2 && (
            <motion.div key="s2" variants={stepVariants} initial="initial" animate="enter" exit="exit" className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white space-y-8 text-center">
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">Deep Reflection • 2/5</p>
                  <h3 className="text-2xl md:text-3xl font-black text-[#15192c]">{currentMood.prompt}</h3>
               </div>
               <textarea 
                  value={answers.reflection} 
                  onChange={(e) => setAnswers({...answers, reflection: e.target.value})}
                  placeholder="Tell Sakhi more..."
                  className="w-full h-32 p-6 rounded-2xl bg-rose-50/30 border-none outline-none text-md font-medium resize-none shadow-inner"
               />
               <button onClick={() => setStep(3)} className="w-full py-4 bg-[#15192c] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:brightness-110 active:scale-95 transition-all">Next Reflection</button>
            </motion.div>
          )}

          {/* Step 3: Future Projection (Mood Specific) */}
          {step === 3 && (
            <motion.div key="s3" variants={stepVariants} initial="initial" animate="enter" exit="exit" className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white space-y-8 text-center">
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">Emotional Pivot • 3/5</p>
                  <h3 className="text-2xl md:text-3xl font-black text-[#15192c]">{flow.s3}</h3>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {flow.s3Options.map(opt => (
                    <button key={opt} onClick={() => { setAnswers({...answers, future: opt}); setStep(4); }} className="p-5 rounded-2xl border border-rose-50 hover:border-[#ff69b4] text-sm font-bold text-[#15192c] transition-all">
                       {opt}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {/* Step 4: Tiny Act of Self-Care (Mood Specific) */}
          {step === 4 && (
            <motion.div key="s4" variants={stepVariants} initial="initial" animate="enter" exit="exit" className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white space-y-8 text-center">
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">Nurture Act • 4/5</p>
                  <h3 className="text-2xl md:text-3xl font-black text-[#15192c]">{flow.s4}</h3>
               </div>
               <div className="flex flex-wrap justify-center gap-3">
                  {flow.s4Acts.map(act => (
                    <button key={act} onClick={() => { setAnswers({...answers, selfCare: act}); setStep(5); }} className="px-6 py-3 rounded-full bg-rose-50 text-[#ff69b4] text-xs font-black uppercase tracking-widest hover:bg-[#ff69b4] hover:text-white transition-all shadow-sm">
                       {act}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {/* Step 5: Final Summary/Preservation (Mood Specific) */}
          {step === 5 && (
            <motion.div key="s5" variants={stepVariants} initial="initial" animate="enter" exit="exit" className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white space-y-8 text-center">
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">Soul Archive • 5/5</p>
                  <h3 className="text-2xl md:text-3xl font-black text-[#15192c]">{flow.s5}</h3>
               </div>
               <textarea 
                  value={journalEntry} 
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Speak your truth..."
                  className="w-full h-32 p-6 rounded-2xl bg-gray-50 border-none outline-none text-md font-medium resize-none italic"
               />
               <button onClick={() => setStep(6)} className="w-full py-5 bg-[#ff69b4] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-100 hover:brightness-110 active:scale-95 transition-all">Finish Soul Space</button>
               <button onClick={() => setStep(6)} className="text-[9px] font-black uppercase tracking-widest text-gray-300">Skip and Done</button>
            </motion.div>
          )}

          {/* Step 6: Guidance/Result */}
          {step === 6 && (
            <motion.div key="s6" variants={stepVariants} initial="initial" animate="enter" exit="exit" className="space-y-6">
               <div className="bg-[#15192c] p-8 md:p-10 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden transition-all shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff69b4]">Sakhi's Guidance</p>
                  <h2 className="text-xl md:text-2xl font-bold leading-snug italic">"{currentMood.message}"</h2>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-rose-50 shadow-lg group hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-6">
                     <Quote size={20} className="text-[#ff69b4]" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Anchor</p>
                  </div>
                  <p className="text-lg md:text-xl font-black text-[#15192c] leading-tight">"{currentMood.affirmations[0]}"</p>
               </div>

               <div className="p-2 bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white">
                  <button onClick={() => setIsPlayingMeditation(!isPlayingMeditation)} className="w-full bg-[#15192c] p-6 rounded-[2rem] text-white flex items-center justify-between group overflow-hidden relative">
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-[#ff69b4] flex items-center justify-center group-hover:scale-110 transition-transform">
                           {isPlayingMeditation ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                        </div>
                        <div className="text-left">
                           <p className="text-[8px] font-black uppercase tracking-widest text-[#ff69b4]">Soundscape</p>
                           <h4 className="text-[12px] font-black">{currentMood.meditation}</h4>
                        </div>
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-40 relative z-10">10:00 Min</span>
                     <motion.div animate={{ x: isPlayingMeditation ? '100%' : '-100%' }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-white/5 pointer-events-none" />
                  </button>
               </div>

               {currentMood.quickActions && (
                 <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] px-2 text-center">Instant Relief Actions</p>
                   <div className="grid grid-cols-3 gap-3">
                     {currentMood.quickActions.map((action, idx) => {
                       const ActionIcon = IconMap[action.icon];
                       return (
                         <button key={idx} onClick={() => navigate(action.action)} className="p-4 bg-white rounded-2xl border border-rose-50 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:border-[#ff69b4] transition-all group">
                           <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#ff69b4] group-hover:scale-110 transition-transform">
                             {ActionIcon && <ActionIcon size={20} />}
                           </div>
                           <span className="text-[10px] font-bold text-[#15192c] text-center leading-tight">{action.label}</span>
                         </button>
                       );
                     })}
                   </div>
                 </div>
               )}

               <button onClick={handleSave} disabled={saveStatus !== 'idle'} className="w-full py-5 bg-[#ff69b4] text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:brightness-110 transition-all">
                  {saveStatus === 'idle' ? 'Preserve Energy ✨' : 'Soul Synchronized...'}
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

export default MoodScreen;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Heart, Moon, Zap, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const [focus, setFocus] = useState([]);
  const navigate = useNavigate();

  const toggleFocus = (id) => {
    setFocus(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      localStorage.setItem('hs_onboarding_done', 'true');
      localStorage.setItem('hs_wellness_focus', JSON.stringify(focus));
      navigate('/app');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const stepImages = {
    1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800", // Welcoming Sakhi
    2: "https://images.unsplash.com/photo-1490138139357-fc819d02e344?auto=format&fit=crop&q=80&w=800" // Peaceful Choice
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#FFF7F8] flex flex-col overflow-x-hidden overflow-y-auto lg:overflow-hidden font-sans relative text-[#15192c]">
      
      {/* ── Premium Animated Background ── */}
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
            animation: meshFlow 20s ease infinite;
          }
        `}
      </style>
      <div className="absolute inset-0 mesh-bg opacity-70" />

      {/* ── Fixed Professional Header ── */}
      <header className="relative z-30 w-full px-4 md:px-10 py-6 md:py-8 flex items-center justify-between">
        <button 
          onClick={prevStep}
          className={`group flex items-center gap-2 md:gap-3 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-[#F5E6EA] flex items-center justify-center bg-white/50 group-hover:bg-[#ff69b4] group-hover:text-white transition-all">
            <ArrowLeft size={16} md:size={18} />
          </div>
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex-1 max-w-md mx-4 md:mx-10">
          <div className="h-[2px] w-full bg-[#F5E6EA] rounded-full relative overflow-hidden">
            <motion.div 
              animate={{ width: `${(step / 2) * 100}%` }}
              className="absolute top-0 left-0 h-full bg-[#ff69b4]"
            />
          </div>
          <div className="flex justify-between mt-2">
            {[1, 2].map(s => (
              <span key={s} className={`text-[8px] md:text-[9px] font-black uppercase tracking-tighter ${step >= s ? 'text-[#ff69b4]' : 'text-[#C4A0AC]'}`}>Step 0{s}</span>
            ))}
          </div>
        </div>

        <div className="w-20 md:w-24 text-right">
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">HealthSakhi</span>
        </div>
      </header>

      {/* ── Main Content Grid ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 relative z-20 overflow-y-auto lg:overflow-hidden">
        
        {/* Left Section: Interaction */}
        <section className="flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-32 py-8 lg:py-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="space-y-8 md:space-y-10"
              >
                <div className="space-y-4 md:space-y-6">
                  <div className="inline-flex items-center gap-2 text-[#ff69b4] font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em]">
                    <Sparkles size={14} /> <span>Personalized Wellness</span>
                  </div>
                  <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1] lg:leading-[0.9] tracking-tighter">
                    Ready to heal, <br />
                    <span className="text-[#ff69b4]">Sakhi?</span>
                  </h1>
                  <p className="text-base md:text-xl text-[#9A8A8E] font-medium leading-relaxed max-w-md">
                    Welcome to your private sanctuary. I am your digital sister, here to guide you toward emotional and physical harmony.
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  className="w-full md:w-fit px-10 md:px-16 py-5 md:py-6 bg-[#15192c] text-white rounded-full font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 text-[10px] md:text-xs"
                >
                  Start Journey <ArrowRight size={18} md:size={20} />
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="space-y-6 md:space-y-10"
              >
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-none">Your Focus</h2>
                  <p className="text-base md:text-lg text-[#9A8A8E] font-medium italic">"Tell me what we should work on today."</p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {[
                    { id: 'stress', label: 'Stress', icon: Zap, color: '#8b5cf6' },
                    { id: 'hormonal', label: 'Hormones', icon: Activity, color: '#ff69b4' },
                    { id: 'sleep', label: 'Sleep', icon: Moon, color: '#6366f1' },
                    { id: 'weight', label: 'Wellness', icon: Heart, color: '#ef4444' }
                  ].map((item) => {
                    const isSelected = focus.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleFocus(item.id)}
                        className={`p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 text-left transition-all flex flex-col gap-3 md:gap-4 relative overflow-hidden ${
                          isSelected ? 'bg-white border-[#ff69b4] shadow-xl ring-4 ring-[#ff69b4]/5' : 'bg-white/40 border-white hover:border-rose-200'
                        }`}
                      >
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-[#ff69b4] text-white' : 'bg-white text-[#C4A0AC] shadow-sm'}`}>
                          <item.icon size={20} md:size={22} />
                        </div>
                        <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] block ${isSelected ? 'text-[#ff69b4]' : 'text-[#15192c]'}`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={nextStep}
                  disabled={focus.length === 0}
                  className={`w-full py-5 md:py-6 rounded-full font-black uppercase tracking-[0.2em] transition-all shadow-xl text-[10px] md:text-xs ${
                    focus.length > 0 ? 'bg-[#ff69b4] text-white' : 'bg-[#F5E6EA] text-[#C4A0AC] cursor-not-allowed'
                  }`}
                >
                  Continue Journey
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </section>

        {/* Right Section: Visuals */}
        <section className="hidden lg:flex flex-col items-center justify-center relative p-12 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white relative group"
            >
              <img 
                src={stepImages[step]} 
                alt="Sakhi Wellness" 
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#15192c]/60 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 right-12 text-white">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-2">HealthSakhi Philosophy</p>
                 <h3 className="text-3xl font-bold leading-tight">
                    {step === 1 ? "Your healing is a journey, not a destination." : "Balance is the key to every kingdom."}
                 </h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

      </main>
    </div>
  );
};

export default OnboardingScreen;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star, ArrowRight, Gift, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Confetti particle shapes and colors
const CONFETTI_COLORS = ['#ff69b4', '#10B981', '#FCD34D', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
const SHAPES = ['circle', 'square', 'star'];

const ConfettiParticle = ({ index }) => {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const shape = SHAPES[index % SHAPES.length];
  const startX = 50 + (Math.random() - 0.5) * 20;
  const endX = Math.random() * 100;
  const endY = Math.random() * 100;
  const size = 4 + Math.random() * 8;
  const delay = Math.random() * 0.8;
  const duration = 1.5 + Math.random() * 2;

  return (
    <motion.div
      initial={{ 
        x: `${startX}vw`, 
        y: '40vh', 
        scale: 0,
        rotate: 0,
        opacity: 0
      }}
      animate={{ 
        x: `${endX}vw`, 
        y: `${endY}vh`, 
        scale: [0, 1.5, 1, 0.5],
        rotate: [0, 180, 360, 540],
        opacity: [0, 1, 1, 0]
      }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeOut",
      }}
      className="absolute pointer-events-none"
      style={{ 
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'star' ? '2px' : '2px',
        transform: shape === 'star' ? 'rotate(45deg)' : 'none',
      }}
    />
  );
};

// Animated counter component
const AnimatedCounter = ({ target, duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
};

const RewardModal = ({ isOpen, onClose, points = 50, bookTitle = '' }) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0); // 0=hidden, 1=backdrop, 2=trophy, 3=card, 4=confetti
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStage(0);
      const t1 = setTimeout(() => setStage(1), 100);
      const t2 = setTimeout(() => setStage(2), 400);
      const t3 = setTimeout(() => setStage(3), 900);
      const t4 = setTimeout(() => { setStage(4); setShowConfetti(true); }, 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    } else {
      setStage(0);
      setShowConfetti(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const confettiParticles = Array.from({ length: 60 });

  const handleViewRewards = () => {
    navigate('/app/rewards');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-900/85 backdrop-blur-xl"
        />

        {/* Screen Flash */}
        {stage >= 4 && (
          <motion.div 
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-white pointer-events-none z-[5]"
          />
        )}

        {/* Confetti Burst */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[10]">
            {confettiParticles.map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>
        )}

        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, y: 80 }}
          animate={stage >= 3 ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.3, opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="relative z-[20] w-full max-w-[420px]"
        >
          {/* Glow behind card */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -inset-8 bg-gradient-to-r from-health-green/30 via-amber-400/20 to-[#ff69b4]/30 rounded-[4rem] blur-3xl pointer-events-none"
          />

          <div className="relative bg-gradient-to-b from-white to-slate-50 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border border-white/50">
            
            {/* Top decorative bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#ff69b4] via-health-green to-amber-400" />

            {/* Rotating ring decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-[0.02]"
              >
                <div className="w-full h-full border-[60px] border-dashed border-health-green rounded-full" />
              </motion.div>
            </div>

            <div className="px-8 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
              
              {/* Trophy Section */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-6 sm:mb-8">
                {/* Pulsing aura */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-health-green/40 to-emerald-400/40 blur-3xl rounded-full"
                />
                {/* Second aura layer */}
                <motion.div
                  animate={{ 
                    scale: [1.1, 0.9, 1.1],
                    opacity: [0.15, 0.3, 0.15]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 bg-amber-400/30 blur-2xl rounded-full"
                />

                {/* Trophy icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={stage >= 2 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -20 }}
                  transition={{ type: "spring", damping: 10, stiffness: 200 }}
                  className="relative w-full h-full bg-gradient-to-br from-health-green via-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white shadow-2xl shadow-health-green/50"
                >
                  <Trophy size={44} className="sm:w-14 sm:h-14 drop-shadow-lg" />
                  
                  {/* Crown on top */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={stage >= 3 ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="absolute -top-3 sm:-top-4"
                  >
                    <Crown size={28} className="sm:w-8 sm:h-8 text-amber-400 drop-shadow-lg" fill="currentColor" />
                  </motion.div>
                </motion.div>

                {/* Orbiting stars */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <Star size={16} fill="currentColor" className="absolute -top-1 left-1/2 text-amber-400 drop-shadow-md" />
                  <Sparkles size={14} className="absolute top-1/2 -right-2 text-[#ff69b4] drop-shadow-md" />
                  <Star size={12} fill="currentColor" className="absolute -bottom-1 left-1/4 text-amber-300 drop-shadow-md" />
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={stage >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6 sm:mb-8"
              >
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight mb-1.5">
                  Excellent, Sakhi! 🎉
                </h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">
                  Volume Completed Successfully
                </p>
                {bookTitle && (
                  <p className="text-[#ff69b4] font-black text-[10px] sm:text-xs mt-2 uppercase tracking-widest">
                    📖 {bookTitle}
                  </p>
                )}
              </motion.div>

              {/* Points Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={stage >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-4 sm:mb-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-health-green/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="relative z-10 text-center">
                  <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-2">
                    Wellness Points Earned
                  </p>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-2xl sm:text-3xl"
                    >
                      🪙
                    </motion.div>
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      +<AnimatedCounter target={points} />
                    </span>
                  </div>
                  <p className="text-health-green font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-2">
                    Added to your balance
                  </p>
                </div>
              </motion.div>

              {/* Motivational Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={stage >= 4 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 text-xs sm:text-sm font-medium text-center px-2 sm:px-4 mb-6 sm:mb-8 leading-relaxed"
              >
                Every book you complete makes you stronger. Keep learning, keep growing! 💪
              </motion.p>

              {/* Two Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={stage >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                {/* Primary: View My Rewards */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleViewRewards}
                  className="w-full h-14 sm:h-16 bg-gradient-to-r from-health-green to-emerald-600 text-white font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs rounded-xl sm:rounded-2xl shadow-xl shadow-health-green/30 flex items-center justify-center gap-2 sm:gap-3 group transition-all"
                >
                  <Gift size={18} /> View My Rewards <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Secondary: Continue Reading */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="w-full h-12 sm:h-14 bg-slate-100 text-slate-500 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px] rounded-xl sm:rounded-2xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-all"
                >
                  Back to Library
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RewardModal;

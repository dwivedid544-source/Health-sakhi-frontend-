import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AIChatPanel from './AIChatPanel';
import memberApi from '../api/memberApi';

const PARTICLES = [
  { top: '-15%', left: '20%', size: '7px', delay: 0 },
  { top: '15%', left: '-18%', size: '9px', delay: 0.7 },
  { top: '85%', left: '5%', size: '6px', delay: 1.4 },
  { top: '10%', left: '92%', size: '8px', delay: 0.4 },
  { top: '80%', left: '88%', size: '7px', delay: 2.1 }
];

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Check trial status for members
  useEffect(() => {
    if (!isAuthenticated || role !== 'member') return;
    const check = async () => {
      try {
        const res = await memberApi.getProfile();
        if (res?.success && res.profile?.subscription?.is_trial_expired) {
          setIsTrialExpired(true);
        }
      } catch (_) {}
    };
    check();
  }, [isAuthenticated, role]);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleButtonClick = () => {
    if (isTrialExpired) {
      navigate('/app/plans');
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-[20px] right-[20px] md:bottom-[28px] md:right-[28px] z-[10000] flex items-center justify-center"
    >
      {/* Sparkle Particles around the button */}
      <AnimatePresence>
        {!isOpen && PARTICLES.map((p, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.9, 0],
              scale: [0.6, 1.25, 0.6],
              y: [0, -12, 0]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
            className="absolute bg-white rounded-full pointer-events-none shadow-[0_0_10px_#ffffff]"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Floating Chat Panel — rendered fixed on screen when open */}
      <AnimatePresence>
        {isOpen && !isTrialExpired && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-3 sm:right-6 top-[125px] sm:top-[132px] bottom-[90px] sm:bottom-[96px] w-[calc(100vw-24px)] max-w-[390px] sm:w-[390px] z-[10000] flex flex-col pointer-events-auto shadow-2xl"
          >
            <AIChatPanel onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular Floating Action Button */}
      <motion.button
        onClick={handleButtonClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? {} : { y: [0, -8, 0] }}
        transition={isOpen ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[60px] h-[60px] md:w-[76px] md:h-[76px] rounded-full flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(249,92,156,0.45)] hover:shadow-[0_0_40px_rgba(249,92,156,0.65)] bg-gradient-to-tr from-[#F95C9C] via-[#D946EF] to-[#FCE7F3] cursor-pointer group overflow-visible transition-shadow duration-300"
        title={isTrialExpired ? t('lockScreen.upgradeBtn', 'Upgrade to Premium Plan 💎') : t('aiSakhi.chatWithSakhi', 'Chat with AI Sakhi')}
      >
        {/* Pulsing Backglow Ring */}
        {!isOpen && (
          <motion.div 
            animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0, 0.55] }} 
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-[#F95C9C] to-[#D946EF] rounded-full blur-sm -z-10" 
          />
        )}

        {/* AI / Sparkles Icon */}
        <Sparkles 
          className="text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] group-hover:scale-110 transition-transform duration-300" 
          size={22} 
          style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }}
        />

        {/* Bouncing Notification Badge */}
        {!isOpen && (
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-rose-100 flex items-center justify-center shadow-md text-xs"
          >
            {isTrialExpired ? '🔒' : '✨'}
          </motion.div>
        )}
      </motion.button>

      {/* Responsive button properties style */}
      <style>{`
        :root {
          --icon-size: 22px;
        }
        @media (min-width: 768px) {
          :root {
            --icon-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingAIButton;

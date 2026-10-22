import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Sparkles, Play, Award, ArrowRight, Share2, DollarSign, ChevronLeft, X, CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import memberApi from '../../api/memberApi';
import useFeatureAccess from '../../hooks/useFeatureAccess';
import LockedFeature from '../../components/subscription/LockedFeature';

const PartnerSakhiScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const res = await memberApi.getProfile().catch(() => null);
      if (res && res.success && res.profile) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Error loading profile for Partner Sakhi:', err);
    }
  };

  const userName = profile?.full_name || user?.fullName || (user?.email ? user.email.split('@')[0] : 'Sakhi');

  const handlePlayVideo = () => {
    setShowVideoModal(true);
  };

  const handleOpenPartnerDashboard = () => {
    navigate('/affiliate');
  };

  // ── Feature Gate: Partner Sakhi requires Premium only ──────────────────
  const { isLocked: partnerLocked } = useFeatureAccess('partnerSakhi');

  if (partnerLocked) {
    return (
      <LockedFeature
        featureName="Partner Sakhi"
        requiredPlan="Premium Sakhi"
        description="Earn money by referring friends to HealthSakhi! Access the Partner Sakhi program to generate referral links and track your commissions."
        fullPage
      />
    );
  }

  return (
    <div className="w-full bg-[#FFF7F8] font-sans text-[#15192c] py-2 relative">
      
      {/* Top Bar Header */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="w-10 h-10 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-[#15192c] hover:bg-rose-50 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-[#15192c]">{t('partnerSakhi.pageTitle', 'Partner Sakhi')}</h1>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">

        {/* ── Congratulatory Hero Banner ── */}
        <div className="bg-[#0F172A] text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden w-full">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#EC4899]/15 border border-[#EC4899]/30 mb-4">
            <Sparkles size={16} className="text-[#EC4899]" />
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-[#EC4899]">
              {t('partnerSakhi.congratulations', 'CONGRATULATIONS {{name}}!', { name: userName.toUpperCase() })}
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl md:text-4xl font-black leading-tight mb-3">
            {t('partnerSakhi.officialTitle', 'You are now an Official Partner Sakhi! 🎉')}
          </h2>

          {/* Subtitle */}
          <p className="text-xs md:text-base font-semibold text-slate-400 leading-relaxed max-w-2xl">
            {t('partnerSakhi.heroSubtitle', 'Welcome to the Health Sakhi Earnings Program! Share clinical health guides and family wellness plans with sisters and earn 15% instant commission on every referral.')}
          </p>

          {/* Background Decorative Mesh */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#EC4899]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* ── Full Partner Training Video Card ── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-rose-100 shadow-sm space-y-5 w-full">
          
          <div>
            <div className="inline-block px-3 py-1 rounded-md bg-pink-50 text-[#ff69b4] text-[9px] md:text-[10px] font-black uppercase tracking-wider mb-2">
              {t('partnerSakhi.trainingVideoTag', 'TRAINING VIDEO 🎬')}
            </div>
            <h3 className="text-lg md:text-2xl font-black text-[#15192c]">
              {t('partnerSakhi.trainingVideoTitle', 'How to Earn as Partner Sakhi')}
            </h3>
            <p className="text-xs md:text-sm text-[#9A8A8E] font-semibold mt-1">
              {t('partnerSakhi.trainingVideoDesc', 'Watch this 3-minute video guide to learn referral link sharing, tracking sakhis, and withdrawing your payouts.')}
            </p>
          </div>

          {/* Video Thumbnail Box */}
          <div 
            onClick={handlePlayVideo}
            className="w-full aspect-[16/9] md:aspect-[21/9] max-h-[420px] bg-[#1E1B4B] rounded-2xl flex items-center justify-center relative overflow-hidden cursor-pointer group shadow-inner"
          >
            {/* Play Circle Icon */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#EC4899] flex items-center justify-center text-white shadow-[0_0_30px_rgba(236,72,153,0.7)] group-hover:scale-110 transition-transform">
              <Play size={32} className="fill-current ml-1" />
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-sm px-3.5 py-1.5 rounded-xl text-[10px] md:text-xs font-extrabold text-white">
              {t('partnerSakhi.durationBadge', '3:24 mins • HD Training')}
            </div>
          </div>

          {/* Watch Video Button */}
          <button
            onClick={handlePlayVideo}
            className="w-full py-4 bg-[#EC4899] hover:bg-[#db2777] text-white rounded-2xl text-xs md:text-sm font-black tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <Play size={18} className="fill-current" />
            <span>{t('partnerSakhi.watchVideoBtn', 'WATCH TRAINING VIDEO NOW')}</span>
          </button>
        </div>

        {/* ── Why Become a Partner Sakhi? Section ── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-rose-100 shadow-sm space-y-6 w-full">
          <h3 className="text-lg md:text-2xl font-black text-[#15192c]">
            {t('partnerSakhi.whyTitle', 'Why Become a Partner Sakhi?')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Item 1 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50/30 border border-rose-100/50">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <DollarSign size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-[#15192c]">{t('partnerSakhi.card1Title', '15% Instant Commission')}</h4>
                <p className="text-xs font-semibold text-[#9A8A8E] mt-1">{t('partnerSakhi.card1Desc', 'Earn directly on every subscription referral.')}</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50/30 border border-rose-100/50">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#ff69b4] shrink-0">
                <Share2 size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-[#15192c]">{t('partnerSakhi.card2Title', 'Custom Referral Links')}</h4>
                <p className="text-xs font-semibold text-[#9A8A8E] mt-1">{t('partnerSakhi.card2Desc', 'Share via WhatsApp, Instagram or SMS.')}</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50/30 border border-rose-100/50">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-[#15192c]">{t('partnerSakhi.card3Title', 'Sisterhood Financial Freedom')}</h4>
                <p className="text-xs font-semibold text-[#9A8A8E] mt-1">{t('partnerSakhi.card3Desc', 'Empower yourself while helping other sakhis.')}</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Direct Partner Login / Dashboard Section ── */}
        <div className="bg-[#FAF5FF] rounded-3xl p-6 md:p-8 border border-[#E9D5FF] text-center space-y-4 w-full">
          <p className="text-base md:text-lg font-extrabold text-[#15192c]">
            {t('partnerSakhi.readyText', 'Ready to view your referral stats & earnings?')}
          </p>

          <button
            onClick={handleOpenPartnerDashboard}
            className="w-full py-4.5 bg-[#ff69b4] hover:bg-[#e05297] text-white rounded-2xl text-xs md:text-sm font-black tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <Briefcase size={20} />
            <span>{t('partnerSakhi.loginDashboardBtn', 'LOGIN TO PARTNER DASHBOARD')}</span>
            <ArrowRight size={20} />
          </button>
        </div>

      </div>

      {/* ── Training Video Modal ── */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0F172A] text-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative border border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Play size={20} className="text-[#EC4899] fill-current" />
                  <h3 className="text-lg font-black">{t('partnerSakhi.modalTitle', 'Partner Sakhi Training Video 🎬')}</h3>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Simulated HD Video Player Frame */}
              <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative border border-slate-800 p-6 text-center">
                <div className="w-18 h-18 rounded-full bg-[#EC4899] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(236,72,153,0.7)] animate-pulse">
                  <Play size={32} className="fill-current text-white ml-1" />
                </div>
                <h4 className="text-xl font-black mb-2 text-white">{t('partnerSakhi.modalVideoHeading', '"How to share referral links & earn 15% commissions"')}</h4>
                <p className="text-xs md:text-sm text-slate-400 max-w-lg leading-relaxed">
                  {t('partnerSakhi.modalVideoDesc', 'Official Partner Sakhi orientation guide. Learn how to generate custom referral links, track earnings, and request payouts.')}
                </p>
                <div className="mt-5 px-5 py-2 rounded-full bg-slate-800 text-xs font-mono text-[#EC4899]">
                  00:45 / 03:24 • 1080p HD Streaming
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {t('partnerSakhi.closeVideo', 'Close Video')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-[#15192c] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <CheckCircle2 size={18} className="text-[#ff69b4]" />
            <span className="text-xs font-bold uppercase tracking-wider">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PartnerSakhiScreen;

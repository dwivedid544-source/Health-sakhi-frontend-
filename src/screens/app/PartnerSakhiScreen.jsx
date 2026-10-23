import React, { useState, useEffect, useRef } from 'react';
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

const TRAINING_VIDEOS = {
  en: "https://ik.imagekit.io/1udyzgff6/health-sakhi-english%20.mp4",
  hi: "https://ik.imagekit.io/jcohpdmi8/health-sakhi%20(1).mp4",
  mr: "https://ik.imagekit.io/xzmohzonk/WhatsApp%20Video%202026-07-08%20at%205.32.19%20PM.mp4"
};

const PartnerSakhiScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, langCode } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const getInitialLang = (code) => {
    if (code === 'hi') return 'hi';
    if (code === 'mr') return 'mr';
    return 'en';
  };
  const [selectedVideoLang, setSelectedVideoLang] = useState(getInitialLang(langCode));
  const videoRef = useRef(null);
  const [restoreTime, setRestoreTime] = useState(null);

  // Sync selected video language when modal opens or app language changes
  useEffect(() => {
    if (showVideoModal) {
      setSelectedVideoLang(getInitialLang(langCode));
    }
  }, [showVideoModal, langCode]);

  // Handle switching video language dynamically
  const handleVideoLangChange = (newLang) => {
    if (newLang === selectedVideoLang) return;
    if (videoRef.current) {
      setRestoreTime(videoRef.current.currentTime);
    }
    setSelectedVideoLang(newLang);
  };

  const handleVideoLoadedMetadata = () => {
    if (restoreTime !== null && videoRef.current) {
      videoRef.current.currentTime = restoreTime;
      setRestoreTime(null);
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleCloseVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showVideoModal) {
        handleCloseVideoModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVideoModal]);

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
            className="w-full aspect-[16/9] md:aspect-[21/9] max-h-[420px] bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#2D1B3D] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group shadow-xl border border-slate-800"
          >
            {/* Background glowing aura */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#EC4899]/20 rounded-full blur-3xl pointer-events-none group-hover:bg-[#EC4899]/30 transition-all duration-700" />
            
            {/* Play Circle Icon */}
            <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-[#EC4899] to-pink-500 flex items-center justify-center text-white shadow-[0_0_35px_rgba(236,72,153,0.8)] group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(236,72,153,1)] transition-all duration-300">
              <Play size={32} className="fill-current ml-1" />
            </div>
            <span className="relative z-10 text-xs md:text-sm font-bold text-pink-200 mt-3 tracking-wide group-hover:text-white transition-colors">
              Click to Play Orientation Guide
            </span>

            {/* Top Left HD Badge */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase text-pink-300 border border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              1080p HD
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-4 right-4 z-10 bg-black/75 backdrop-blur-sm px-3.5 py-1.5 rounded-xl text-[10px] md:text-xs font-extrabold text-white border border-white/10">
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
          <div 
            className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
            onClick={handleCloseVideoModal}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F172A] text-white rounded-3xl p-5 md:p-7 max-w-4xl w-full shadow-[0_0_60px_rgba(236,72,153,0.3)] relative border border-slate-700/80 my-auto flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EC4899] to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                    <Play size={18} className="fill-current ml-0.5" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                      {t('partnerSakhi.modalTitle', 'Partner Sakhi Training Video 🎬')}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {t('partnerSakhi.durationBadge', '3:24 mins • 1080p HD')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Language Selector Pills */}
                  <div className="flex bg-slate-900/90 rounded-full p-1 border border-slate-700 shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleVideoLangChange('en')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        selectedVideoLang === 'en'
                          ? 'bg-gradient-to-r from-[#EC4899] to-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVideoLangChange('hi')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        selectedVideoLang === 'hi'
                          ? 'bg-gradient-to-r from-[#EC4899] to-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      हिंदी
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVideoLangChange('mr')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        selectedVideoLang === 'mr'
                          ? 'bg-gradient-to-r from-[#EC4899] to-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      मराठी
                    </button>
                  </div>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={handleCloseVideoModal}
                    className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#EC4899] transition-all cursor-pointer shadow-sm"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Real HD Video Player with Native HTML5 Controls */}
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative border border-slate-800 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={TRAINING_VIDEOS[selectedVideoLang] || TRAINING_VIDEOS.en}
                  controls
                  autoPlay
                  playsInline
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Video Info & Description strip */}
              <div className="mt-4 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm md:text-base font-black text-white">
                    {t('partnerSakhi.modalVideoHeading', '"How to share referral links & earn 15% commissions"')}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    {t('partnerSakhi.modalVideoDesc', 'Official Partner Sakhi orientation guide. Learn how to generate custom referral links, track earnings, and request payouts.')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-pink-300">
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/20 border border-pink-500/30">💸 15% Commission</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30">🔗 Custom Referral Links</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30">⚡ Instant Bank Payouts</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseVideoModal}
                  className="self-end md:self-center px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border border-slate-700 hover:border-slate-600"
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

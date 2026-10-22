import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Download, Lock, CheckCircle2, BookOpen, Star, Sparkles, ShieldCheck, ChevronLeft, X, RefreshCw, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import memberApi from '../../api/memberApi';
import axiosClient from '../../api/axiosClient';
import confetti from 'canvas-confetti';

const WellnessCertificateScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, langCode } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [unlockedCertificates, setUnlockedCertificates] = useState([]);
  const [checking, setChecking] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(null); // stores certificate level to display in modal
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadCertificate = async (cert, defaultTitle) => {
    if (!cert || !cert.certificateId) return;
    const certId = cert.certificateId;
    try {
      setDownloadingId(certId);
      const res = await axiosClient.get(`/certificates/${certId}/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${cert.title || defaultTitle || 'HealthSakhi-Certificate'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download certificate via blob:', err);
      const token = localStorage.getItem('hs_auth_token') || sessionStorage.getItem('hs_auth_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      const fallbackUrl = `${baseUrl}/certificates/${certId}/download${token ? '?token=' + token : ''}`;
      window.open(fallbackUrl, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [profileRes, certRes] = await Promise.all([
        memberApi.getProfile().catch(() => null),
        memberApi.getCertificates().catch(() => null)
      ]);
      if (profileRes && profileRes.success && profileRes.profile) {
        setProfile(profileRes.profile);
      }
      if (certRes && certRes.success && certRes.certificates) {
        setUnlockedCertificates(certRes.certificates);
      }
    } catch (err) {
      console.error('Error loading certificate data:', err);
    }
  };

  const currentPlan = useMemo(() => {
    const badge = (profile?.subscription?.plan_name || user?.plan_badge || user?.planBadge || '').toLowerCase();
    let sessionPlan = '';
    try {
      const stored = sessionStorage.getItem('hs_current_member');
      if (stored) {
        const parsed = JSON.parse(stored);
        sessionPlan = (parsed?.plan || '').toLowerCase();
      }
    } catch (e) {}

    const fullStr = `${badge} ${sessionPlan}`;
    if (fullStr.includes('premium') || fullStr.includes('pro')) return 'premium-sakhi';
    if (fullStr.includes('basic')) return 'basic-sakhi';
    return 'free-sakhi';
  }, [profile, user]);

  const isPaidUser = currentPlan !== 'free-sakhi';

  const metrics = useMemo(() => ({
    books: profile?.booksCompleted || 0,
    logins: profile?.loginDays || 0,
    referrals: profile?.referralCount || 0
  }), [profile]);

  // Evaluate & Trigger Confetti if new certificates are unlocked
  const handleCheckEligibility = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await memberApi.checkCertificates();
      if (res && res.success && res.certificates) {
        const newlyUnlocked = res.certificates.filter(
          c => !unlockedCertificates.some(uc => uc.level === c.level)
        );

        setUnlockedCertificates(res.certificates);

        if (newlyUnlocked.length > 0) {
          // Trigger confetti!
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
          // Show modal for the highest unlocked level
          setShowUnlockModal(newlyUnlocked[newlyUnlocked.length - 1]);
        }
      }
    } catch (err) {
      console.error('Failed to evaluate certificates:', err);
    } finally {
      setChecking(false);
    }
  };

  // Certificate specifications
  const certificateTiers = [
    {
      level: 'basic',
      title: t('wellnessCertificate.basicTitle', 'Basic Wellness Certificate'),
      desc: t('wellnessCertificate.basicDesc', 'Starter module of Health Sakhi wellness curriculum.'),
      reqBooks: 5,
      reqLogins: 15,
      reqReferrals: 0,
      reqPlan: 'basic-sakhi', // Basic or Premium (hierarchy check handled dynamically)
      bgColor: 'from-amber-50/60 to-rose-50/60 border-amber-200/70',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      level: 'advance',
      title: t('wellnessCertificate.advanceTitle', 'Advance Wellness Certificate'),
      desc: t('wellnessCertificate.advanceDesc', 'Consistent personal health and active habit log maintenance.'),
      reqBooks: 15,
      reqLogins: 30,
      reqReferrals: 0,
      reqPlan: 'basic-sakhi',
      bgColor: 'from-slate-100 to-indigo-50/70 border-slate-300/80',
      badgeColor: 'bg-slate-200 text-slate-800'
    },
    {
      level: 'gold',
      title: t('wellnessCertificate.goldTitle', 'Gold Ambassador Certificate'),
      desc: t('wellnessCertificate.goldDesc', 'Elite wellness standards and community contribution.'),
      reqBooks: 25,
      reqLogins: 30,
      reqReferrals: 10,
      reqPlan: 'premium-sakhi', // Pro only
      bgColor: 'from-yellow-50/90 via-amber-50/50 to-orange-50/60 border-yellow-300 shadow-yellow-100/50',
      badgeColor: 'bg-yellow-200 text-amber-900 font-extrabold',
      highlighted: true
    },
    {
      level: 'platinum',
      title: t('wellnessCertificate.platinumTitle', 'Platinum Health Leader Certificate'),
      desc: t('wellnessCertificate.platinumDesc', 'Supreme wellness execution and community mentorship.'),
      reqBooks: 40,
      reqLogins: 60,
      reqReferrals: 25,
      reqPlan: 'premium-sakhi', // Pro only
      bgColor: 'from-purple-50/90 via-pink-50/40 to-indigo-50/80 border-purple-300 shadow-purple-100/50',
      badgeColor: 'bg-purple-200 text-purple-900 font-extrabold',
      highlighted: true
    }
  ];

  return (
    <div className="w-full bg-[#FFF7F8] font-sans text-[#15192c] py-2 relative min-h-screen px-4 md:px-8">
      
      {/* Top Header */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="w-10 h-10 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-[#15192c] hover:bg-rose-50 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#4B1E5A]">{t('wellnessCertificate.pageTitle', 'Wellness Certificates')}</h1>
            <p className="text-xs font-bold text-[#6B5E63] mt-0.5">{t('wellnessCertificate.subtitle', 'Track your progress and claim verified clinical wellness credentials')}</p>
          </div>
        </div>

        <button
          onClick={handleCheckEligibility}
          disabled={checking}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-pink-200 shrink-0 cursor-pointer disabled:bg-slate-400"
        >
          <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
          <span>{checking ? t('wellnessCertificate.evaluating', 'Checking...') : t('wellnessCertificate.checkBtn', 'Check Eligibility')}</span>
        </button>
      </div>

      {/* Stats Summary Banner */}
      <div className="w-full max-w-7xl mx-auto bg-white rounded-3xl p-6 border border-rose-100/80 shadow-sm flex flex-col md:flex-row items-center justify-around gap-6 text-center mb-8">
        <div className="flex flex-col items-center">
          <BookOpen size={24} className="text-[#ff69b4] mb-1.5" />
          <span className="text-xl md:text-2xl font-black text-[#4B1E5A]">{metrics.books}</span>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-[#9A8A8E] mt-0.5">{t('wellnessCertificate.booksCompleted', 'BOOKS COMPLETED')}</span>
        </div>

        <div className="hidden md:block w-[1px] h-12 bg-rose-100" />

        <div className="flex flex-col items-center">
          <Star size={24} className="text-amber-500 mb-1.5" />
          <span className="text-xl md:text-2xl font-black text-[#4B1E5A]">{metrics.logins} Days</span>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-[#9A8A8E] mt-0.5">{t('wellnessCertificate.loginStreak', 'LOGIN STREAK / DAYS')}</span>
        </div>

        <div className="hidden md:block w-[1px] h-12 bg-rose-100" />

        <div className="flex flex-col items-center">
          <Award size={24} className="text-purple-600 mb-1.5" />
          <span className="text-xl md:text-2xl font-black text-[#4B1E5A]">{metrics.referrals}</span>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-[#9A8A8E] mt-0.5">{t('wellnessCertificate.referrals', 'SUCCESSFUL REFERRALS')}</span>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
        {certificateTiers.map((tier) => {
          const unlocked = unlockedCertificates.find(c => c.level === tier.level);
          const isGoldOrPlat = tier.level === 'gold' || tier.level === 'platinum';

          // Plan check
          let hasPlan = false;
          if (currentPlan === 'premium-sakhi') {
            hasPlan = true;
          } else if (currentPlan === 'basic-sakhi') {
            hasPlan = tier.reqPlan === 'basic-sakhi';
          }

          // Calculate progress percentage
          const bookProgressVal = Math.min(100, (metrics.books / tier.reqBooks) * 100);
          const loginProgressVal = Math.min(100, (metrics.logins / tier.reqLogins) * 100);
          
          let totalTasks = 3;
          let completedTasksCount = 0;
          if (metrics.books >= tier.reqBooks) completedTasksCount++;
          if (metrics.logins >= tier.reqLogins) completedTasksCount++;
          if (hasPlan) completedTasksCount++;

          let referralProgressVal = 100;
          if (tier.reqReferrals > 0) {
            totalTasks = 4;
            referralProgressVal = Math.min(100, (metrics.referrals / tier.reqReferrals) * 100);
            if (metrics.referrals >= tier.reqReferrals) completedTasksCount++;
          }

          const overallPercent = Math.floor((completedTasksCount / totalTasks) * 100);

          return (
            <motion.div
              key={tier.level}
              whileHover={{ y: -4 }}
              className={`relative rounded-[2.5rem] p-6 border-2 transition-all duration-300 flex flex-col justify-between bg-gradient-to-b ${tier.bgColor} ${
                tier.highlighted ? 'shadow-lg border-opacity-100' : 'shadow-sm border-opacity-60'
              }`}
            >
              {/* Gold/Platinum highlights */}
              {tier.highlighted && (
                <span className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                  {tier.level === 'platinum' ? 'DIAMOND TIER 💎' : 'ELITE AMBASSADOR 👑'}
                </span>
              )}

              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${tier.badgeColor}`}>
                      Level {tier.level.toUpperCase()}
                    </span>
                    <h3 className="text-lg md:text-xl font-black mt-2 text-[#4B1E5A]">{tier.title}</h3>
                    <p className="text-xs font-semibold text-[#6B5E63] mt-1">{tier.desc}</p>
                  </div>
                  {unlocked ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={22} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Lock size={18} />
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-200/60 my-4" />

                {/* Progress Indicators & Checklists */}
                <div className="space-y-4 mb-6">
                  {/* Books Progress */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="flex items-center gap-1.5 text-[#15192c]">
                        <BookOpen size={13} className="text-[#ff69b4]" />
                        {t('wellnessCertificate.booksReq', 'Books Completed')}
                      </span>
                      <span>{metrics.books} / {tier.reqBooks}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#ff69b4] to-pink-500 rounded-full" style={{ width: `${bookProgressVal}%` }} />
                    </div>
                  </div>

                  {/* Logins Progress */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="flex items-center gap-1.5 text-[#15192c]">
                        <Star size={13} className="text-amber-500" />
                        {t('wellnessCertificate.loginsReq', 'Active Days')}
                      </span>
                      <span>{metrics.logins} / {tier.reqLogins}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${loginProgressVal}%` }} />
                    </div>
                  </div>

                  {/* Referrals (if applicable) */}
                  {tier.reqReferrals > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="flex items-center gap-1.5 text-[#15192c]">
                          <Award size={13} className="text-purple-500" />
                          {t('wellnessCertificate.referralsReq', 'Referrals')}
                        </span>
                        <span>{metrics.referrals} / {tier.reqReferrals}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full" style={{ width: `${referralProgressVal}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Plan validation */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#15192c]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-500" />
                      {t('wellnessCertificate.planLabel', 'Plan')}: {tier.reqPlan === 'premium-sakhi' ? t('wellnessCertificate.premiumSakhiPro', 'Premium Sakhi (Pro)') : t('wellnessCertificate.basicOrPremium', 'Basic or Premium')}
                    </span>
                    <span className={hasPlan ? 'text-emerald-600' : 'text-rose-500'}>
                      {hasPlan ? t('wellnessCertificate.valid', '✓ Valid') : t('wellnessCertificate.upgradeRequired', '✗ Upgrade Required')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button / Locked Overlay */}
              <div className="mt-4">
                {unlocked ? (
                  <button
                    type="button"
                    disabled={downloadingId === unlocked.certificateId}
                    onClick={() => handleDownloadCertificate(unlocked, tier.title)}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={15} className={downloadingId === unlocked.certificateId ? 'animate-bounce' : ''} />
                    <span>
                      {downloadingId === unlocked.certificateId 
                        ? 'Downloading...' 
                        : t('wellnessCertificate.downloadCert', 'Download Certificate (PDF)')}
                    </span>
                  </button>
                ) : (
                  <div className="relative">
                    {/* Free Plan Lock Overlays on Cards */}
                    {!isPaidUser ? (
                      <div className="w-full p-4 bg-slate-950/5 rounded-2xl border border-dashed border-rose-200 text-center flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-[#E91E63] tracking-widest mb-2">
                          {t('wellnessCertificate.upgradeToUnlock', 'Upgrade to unlock your certificate 🎓')}
                        </span>
                        <button
                          onClick={() => navigate('/app/plans')}
                          className="w-full py-2 bg-[#E91E63] hover:bg-[#D81B60] text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                        >
                          {t('wellnessCertificate.upgradeCTA', 'UPGRADE PLAN 🌸')}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full p-3 bg-slate-100 rounded-2xl text-center">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          {t('wellnessCertificate.lockedPercent', 'Locked: Completed')} {overallPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Unlock Success Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-rose-100 text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-pink-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-pink-200">
                <Trophy size={40} />
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-[#4B1E5A] mb-2">
                {t('wellnessCertificate.unlockedTitle', '🎉 Congratulations!')}
              </h2>
              <p className="text-sm font-semibold text-[#6B5E63] mb-6">
                You’ve successfully unlocked the <strong className="text-[#E91E63]">{showUnlockModal.title}</strong>! Your dedication to wellness and daily consistency is truly inspiring.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowUnlockModal(null)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#15192c] rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  {t('wellnessCertificate.close', 'Close')}
                </button>
                <button
                  type="button"
                  disabled={downloadingId === showUnlockModal.certificateId}
                  onClick={() => handleDownloadCertificate(showUnlockModal, showUnlockModal.title)}
                  className="flex-1 py-3.5 bg-[#E91E63] hover:bg-[#D81B60] disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-pink-200 cursor-pointer"
                >
                  <Download size={14} className={downloadingId === showUnlockModal.certificateId ? 'animate-bounce' : ''} />
                  <span>{downloadingId === showUnlockModal.certificateId ? 'Downloading...' : t('wellnessCertificate.download', 'Download')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default WellnessCertificateScreen;

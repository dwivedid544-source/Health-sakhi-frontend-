/**
 * LockedFeature — Reusable Feature Lock Overlay Component
 *
 * Usage:
 *   <LockedFeature
 *     featureName="AI Chat Bot"
 *     requiredPlan="Basic or Premium"
 *     description="Upgrade to unlock AI-powered wellness support"
 *   />
 *
 * Or wrap existing content:
 *   <LockedFeature featureName="Certificate" overlay>
 *     <ExistingContent />
 *   </LockedFeature>
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, Crown, X, Check, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

// ── Plan comparison data for upgrade modal ────────────────────────────────────
const PLAN_COMPARE = [
  {
    name: 'Free Sakhi',
    tier: 'free',
    price: '₹0',
    duration: 'Lifetime Free',
    color: '#9A8A8E',
    gradient: 'from-slate-100 to-slate-200',
    features: ['5 Books Only 📚', 'Community Sakhis', 'FAQ & Help', 'To-Do & Budget', 'Mental & Period'],
    locked: ['AI Chat Bot 🔒', 'All Books 🔒', 'Wellness Certificate 🔒', 'Partner Sakhi 🔒', 'Ask Health Sakhi 🔒'],
  },
  {
    name: 'Basic Sakhi',
    tier: 'basic',
    price: '₹699',
    duration: '1 Month',
    color: '#E91E63',
    gradient: 'from-pink-500 to-rose-500',
    badge: 'RECOMMENDED',
    features: ['All Books Unlimited 📚', 'AI Chat Bot 24/7 🤖', 'Wellness Certificate 🏆', 'Community & FAQ'],
    locked: ['Partner Sakhi 🔒', 'Ask Health Sakhi 🔒'],
  },
  {
    name: 'Premium Sakhi',
    tier: 'premium',
    price: '₹1,299',
    duration: '1 Month Unlimited',
    color: '#7C3AED',
    gradient: 'from-violet-600 to-purple-700',
    badge: 'MOST POPULAR',
    features: ['All Unlimited 🌸', 'Ask Health Sakhi 💬', 'Partner Sakhi 💰', 'Advisor Sessions', 'All Features Unlocked'],
    locked: [],
  },
];

// ── Main LockedFeature Component ──────────────────────────────────────────────
const LockedFeature = ({
  featureName = 'This Feature',
  requiredPlan = 'Basic or Premium',
  description = 'Upgrade your plan to unlock this feature.',
  children,
  overlay = false,       // If true, blurs children and shows lock on top
  fullPage = false,      // If true, takes full page height
  compact = false,       // If true, shows a smaller inline locked card
  className = '',
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const handleUpgradeClick = () => {
    setShowModal(true);
  };

  const handleGoToPlans = () => {
    setShowModal(false);
    navigate('/app/plans');
  };

  const displayFeatureName = featureName === 'Ask Health Sakhi' ? t('nav.askHealthSakhi', featureName)
    : featureName === 'Partner Sakhi' ? t('nav.partnerSakhi', featureName)
    : featureName === 'AI Chat Bot' ? t('nav.aiChatBot', featureName)
    : t(featureName, featureName);

  const displayRequiredPlan = requiredPlan.toLowerCase().includes('basic') 
    ? t('locked.basicSakhiPlan', 'BASIC SAKHI PLAN')
    : t('locked.premiumSakhiPlan', 'PREMIUM SAKHI PLAN');

  let displayDesc = description;
  if (description.includes('referring friends') || description.includes('Partner Sakhi') || description.includes('commissions')) {
    displayDesc = t('locked.partnerSakhiDesc', description);
  } else if (description.includes('Ask Health Sakhi') || description.includes('messages') || description.includes('Support & Admin')) {
    displayDesc = t('locked.askSakhiDesc', description);
  } else if (description.includes('24/7') || description.includes('AI-powered') || description.includes('chatbot')) {
    displayDesc = t('locked.aiSakhiDesc', description);
  } else if (description.includes('Certificate') || description.includes('certificate')) {
    displayDesc = t('locked.certificateDesc', description);
  }

  // ── Compact inline version ──────────────────────────────────────────────────
  if (compact) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50/40 cursor-pointer group hover:border-[#ff69b4]/40 transition-all duration-300 ${className}`}
          onClick={handleUpgradeClick}
        >
          <div className="w-9 h-9 rounded-xl bg-[#ff69b4]/15 flex items-center justify-center flex-shrink-0">
            <Lock size={16} className="text-[#ff69b4]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-[#15192c] truncate">{displayFeatureName}</p>
            <p className="text-[10px] font-semibold text-[#9A8A8E] truncate">{t('locked.requires', 'Requires')} {displayRequiredPlan}</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#ff69b4] text-white text-[10px] font-black uppercase tracking-wider group-hover:bg-[#E91E63] transition-colors flex-shrink-0">
            <Sparkles size={10} />
            <span>{t('locked.upgrade', 'Upgrade')}</span>
          </div>
        </motion.div>

        <UpgradeModal show={showModal} onClose={() => setShowModal(false)} onGoToPlans={handleGoToPlans} featureName={displayFeatureName} />
      </>
    );
  }

  // ── Overlay version (blur children + lock on top) ───────────────────────────
  if (overlay && children) {
    return (
      <>
        <div className={`relative overflow-hidden rounded-3xl ${className}`}>
          <div className="blur-sm pointer-events-none select-none">{children}</div>
          <div className="absolute inset-0 bg-[#0F172A]/75 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
            <LockContent
              featureName={displayFeatureName}
              requiredPlan={displayRequiredPlan}
              description={displayDesc}
              onUpgrade={handleUpgradeClick}
            />
          </div>
        </div>

        <UpgradeModal show={showModal} onClose={() => setShowModal(false)} onGoToPlans={handleGoToPlans} featureName={displayFeatureName} />
      </>
    );
  }

  // ── Full page / standalone lock screen ─────────────────────────────────────
  return (
    <>
      <div className={`w-full ${fullPage ? 'min-h-[70vh]' : 'py-16'} flex items-center justify-center px-4 ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-pink-100/50 border border-rose-100 p-8 md:p-10 text-center"
        >
          {/* Lock Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#ff69b4]/20 to-rose-100 flex items-center justify-center relative">
            <Lock size={34} className="text-[#ff69b4]" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#ff69b4] rounded-full flex items-center justify-center">
              <Crown size={12} className="text-white" />
            </div>
          </div>

          {/* Content */}
          <LockContent
            featureName={displayFeatureName}
            requiredPlan={displayRequiredPlan}
            description={displayDesc}
            onUpgrade={handleUpgradeClick}
            lightMode
          />
        </motion.div>
      </div>

      <UpgradeModal show={showModal} onClose={() => setShowModal(false)} onGoToPlans={handleGoToPlans} featureName={displayFeatureName} />
    </>
  );
};

// ── Shared lock content (used in both standalone and overlay modes) ───────────
const LockContent = ({ featureName, requiredPlan, description, onUpgrade, lightMode = false }) => {
  const { t } = useLanguage();
  const textColor = lightMode ? 'text-[#15192c]' : 'text-white';
  const subColor = lightMode ? 'text-[#6B5E63]' : 'text-slate-300';

  return (
    <>
      {lightMode && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 mb-4">
          <Lock size={10} className="text-[#ff69b4]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">{t('locked.premiumFeature', 'PREMIUM FEATURE')}</span>
        </div>
      )}

      <h3 className={`text-xl md:text-2xl font-black mb-2 ${textColor}`}>
        {featureName} <span className="text-[#ff69b4]">🔒</span>
      </h3>

      <p className={`text-sm font-semibold leading-relaxed mb-6 ${subColor}`}>
        {description}
      </p>

      <div className={`text-[10px] font-bold uppercase tracking-widest mb-5 ${lightMode ? 'text-[#9A8A8E]' : 'text-slate-400'}`}>
        {t('locked.unlockWith', 'UNLOCK WITH')} <span className={lightMode ? 'text-[#ff69b4]' : 'text-pink-300'}>{requiredPlan}</span>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onUpgrade}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ff69b4] hover:bg-[#E91E63] text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-pink-200/50 cursor-pointer"
      >
        <Sparkles size={16} />
        {t('locked.upgradeNow', 'UPGRADE NOW')}
      </motion.button>
    </>
  );
};

// ── Upgrade Comparison Modal ──────────────────────────────────────────────────
const UpgradeModal = ({ show, onClose, onGoToPlans, featureName }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-rose-50 bg-gradient-to-r from-rose-50 to-white flex-shrink-0">
              <div>
                <h3 className="text-lg font-black text-[#15192c]">Unlock {featureName} 🌸</h3>
                <p className="text-[11px] font-bold text-[#9A8A8E] tracking-widest uppercase mt-0.5">Choose your plan to continue</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Plan Cards */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLAN_COMPARE.map((plan) => (
                  <div
                    key={plan.tier}
                    className={`relative rounded-2xl p-5 border-2 ${plan.badge ? 'border-[#ff69b4]' : 'border-rose-100'} bg-white shadow-sm`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#ff69b4] text-white text-[8px] font-black uppercase tracking-widest rounded-full whitespace-nowrap">
                        {plan.badge}
                      </span>
                    )}

                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: plan.color }}>
                      {plan.duration}
                    </p>
                    <h4 className="text-sm font-black text-[#15192c] mb-1">{plan.name}</h4>
                    <p className="text-2xl font-black text-[#15192c] mb-4">{plan.price}</p>

                    <ul className="space-y-1.5 mb-3">
                      {plan.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[11px] font-semibold text-[#15192c]">
                          <Check size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {plan.locked?.length > 0 && (
                      <ul className="space-y-1 mb-3">
                        {plan.locked.slice(0, 2).map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-[11px] font-semibold text-[#9A8A8E]">
                            <Lock size={10} className="mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-rose-50 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoToPlans}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#ff69b4] hover:bg-[#E91E63] text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-lg shadow-pink-200/50 cursor-pointer"
              >
                <Zap size={16} />
                View All Plans & Upgrade
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LockedFeature;

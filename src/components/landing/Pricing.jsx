import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const Pricing = ({ data = {}, activePlans = [], handleSubscribePlan }) => {
  const { t } = useLanguage();

  const title = t('landingPage.plansTitle');
  const subtitle = t('landingPage.plansBadge');
  const description = t('landingPage.plansSubtitle');

  const isLockedFeature = (feat) => {
    const f = (feat || '').toLowerCase();
    if (f.includes('unlocked')) return false;
    return f.includes('locked') || f.includes('hidden') || f.includes('🔒');
  };

  return (
    <section
      id="plans"
      className="relative w-full py-[50px] md:py-[70px] px-4 md:px-8 lg:px-12 overflow-hidden flex flex-col items-center"
    >
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-pink-100/30 blur-[130px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-rose-50/40 blur-[150px] rounded-full -z-10"></div>

      {/* Section Header */}
      <div className="w-full max-w-[900px] mx-auto text-center mb-8 md:mb-10 relative z-10">
        <p className="text-xs font-black text-[#E91E63] uppercase tracking-[0.3em] mb-2">{subtitle}</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#4B1E5A] tracking-tight mb-3">{title}</h2>
        <p className="text-sm lg:text-base text-[#6B5E63] font-medium max-w-xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {/* Plan Cards — 3 cols on desktop (1 line!), stacked on mobile */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 relative z-10 items-stretch">
        {activePlans.map((plan) => {
          const isFree = plan.price === 'Free' || plan.price === 'मुफ्त' || plan.price === 'मोफत' || plan.price === '0' || Number(plan.price || 0) === 0 || isNaN(Number(plan.price));
          const priceNum = isFree ? 0 : Number(plan.price || 0);
          const isPremium = plan.slug?.includes('premium') || plan.name?.toLowerCase().includes('premium');
          const isBasic = plan.slug?.includes('basic') || plan.name?.toLowerCase().includes('basic');

          return (
            <motion.div
              key={plan.id || plan.slug}
              whileHover={{ y: -6, scale: 1.005 }}
              className={`relative rounded-[2rem] p-5 lg:p-6 border transition-all duration-300 flex flex-col justify-between backdrop-blur-xl text-[#4B1E5A] shadow-xl ${
                isPremium
                  ? 'bg-gradient-to-b from-purple-50/90 via-white to-pink-50/90 border-purple-200/80 shadow-purple-100/40'
                  : isBasic
                  ? 'bg-gradient-to-b from-rose-50/90 via-white to-pink-50/60 border-pink-200/80 shadow-pink-100/40'
                  : 'bg-white/95 border-[#F5E6EA] shadow-pink-100/20'
              }`}
            >
              {/* Highlight badge */}
              {plan.highlightTag && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap ${
                  isPremium ? 'bg-gradient-to-r from-purple-600 to-pink-600' : isBasic ? 'bg-[#E91E63]' : 'bg-slate-700'
                }`}>
                  {plan.highlightTag}
                </span>
              )}

              <div>
                {/* Plan name & duration */}
                <div className="mb-3 mt-1">
                  <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-wider mt-0.5 text-[#E91E63]">
                    {plan.duration || (isFree ? 'Free 🌸' : '1 Month Subscription')}
                  </p>
                </div>

                {/* Short description */}
                <p className="text-xs font-semibold mb-4 leading-snug text-[#6B5E63] min-h-[32px]">
                  {plan.shortDescription}
                </p>

                {/* Price */}
                <div className="flex flex-col mb-4">
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs line-through font-bold text-[#4B1E5A]/40">
                        ₹{Number(plan.originalPrice).toLocaleString()}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-[#E91E63]/10 text-[#E91E63]">
                        Save 30%
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="text-3xl lg:text-4xl font-black">
                      {isFree ? (plan.price === '0' ? 'Free' : plan.price) : `₹${priceNum.toLocaleString()}`}
                    </span>
                    {!isFree && (
                      <span className="text-[11px] font-bold text-[#C4A0AC]">
                        /month
                      </span>
                    )}
                  </div>
                  {plan.priceSubtext && (
                    <span className="text-[9px] font-black mt-2 tracking-wider uppercase text-[#E91E63]">
                      {plan.priceSubtext}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px w-full mb-4 bg-[#F5E6EA]"></div>

                {/* Features list */}
                <div className="space-y-2 mb-6">
                  {(plan.features || []).map((feat, index) => {
                    const locked = isLockedFeature(feat);
                    return (
                      <div key={index} className="flex items-start gap-2">
                        {locked ? (
                          <span className="text-rose-400 mt-0.5 flex-shrink-0 text-xs select-none">🔒</span>
                        ) : (
                          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                        <span className={`text-xs font-semibold leading-tight ${
                          locked ? 'text-slate-400/85' : 'text-[#4B1E5A]/90'
                        }`}>
                          {feat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribePlan(plan)}
                className={`w-full py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 group hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                  isPremium
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:brightness-110'
                    : 'bg-[#E91E63] text-white hover:bg-[#D81B60]'
                }`}
              >
                {t('landingPage.choosePlan', 'Choose Plan')}
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                </svg>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Pricing;

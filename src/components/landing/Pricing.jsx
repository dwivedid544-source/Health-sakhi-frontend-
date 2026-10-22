import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Sparkles, ShieldCheck, Check, ArrowRight, Gift, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Pricing = ({ data = {}, activePlans = [], handleSubscribePlan }) => {
  const { t } = useLanguage();
  const [selectedContribution, setSelectedContribution] = useState('fair-value-sakhi');

  // Humanity Tiers specification
  const tiers = [
    {
      slug: 'access-sakhi',
      name: 'Access',
      price: 999,
      formattedPrice: '₹999',
      period: '/year',
      tag: 'Access',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderAccent: 'border-emerald-200 hover:border-emerald-400',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      whatItSays: '“HealthSakhi helps me, but I need affordable access.”',
      description: 'The essential HealthSakhi experience should remain genuinely useful at the affordable level.',
      features: [
        'Complete Core HealthSakhi Experience',
        'Full Audio & Multilingual Education',
        'AI Health Companion 24/7',
        'Period & Family Health Tracking',
        'Sisterhood Community & FAQs'
      ]
    },
    {
      slug: 'fair-value-sakhi',
      name: 'Fair Value',
      price: 2999,
      formattedPrice: '₹2,999',
      period: '/year',
      tag: 'Fair Value ⭐',
      isPopular: true,
      tagColor: 'bg-rose-100 text-rose-700 border-rose-300',
      borderAccent: 'border-rose-400 shadow-rose-100 ring-2 ring-rose-400/30',
      buttonBg: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md shadow-rose-200',
      whatItSays: '“I received real value and this feels like a fair contribution.”',
      description: 'Supports continuous platform improvements and content additions.',
      features: [
        'Complete Core HealthSakhi Experience',
        'Full Audio & Multilingual Education',
        'AI Health Companion 24/7',
        'Wellness Certificate of Completion',
        'Special Educational Sessions'
      ]
    },
    {
      slug: 'supporter-sakhi',
      name: 'Supporter',
      price: 4999,
      formattedPrice: '₹4,999',
      period: '/year',
      tag: 'Supporter',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      borderAccent: 'border-purple-200 hover:border-purple-400',
      buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white',
      whatItSays: '“I value HealthSakhi and want to support its growth.”',
      description: 'Helps create new health education in more regional languages.',
      features: [
        'Complete Core HealthSakhi Experience',
        'Advanced Learning Resources',
        'Early Access to Selected Features',
        'Wellness Certificate & Priority AI',
        'Direct Support Sisterhood Circle'
      ]
    },
    {
      slug: 'patron-sakhi',
      name: 'Patron / Pay It Forward',
      price: 9999,
      formattedPrice: '₹9,999',
      period: '/year',
      tag: 'Pay It Forward ❤️',
      isPatron: true,
      tagColor: 'bg-amber-50 text-amber-800 border-amber-300',
      borderAccent: 'border-amber-300 hover:border-amber-400',
      buttonBg: 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-md shadow-amber-200',
      whatItSays: '“I can contribute more and help HealthSakhi reach women who may not be able to.”',
      description: 'Your contribution keeps HealthSakhi accessible to women who cannot afford it.',
      features: [
        'Complete Core HealthSakhi Experience',
        'Sponsors Free Access for Another Woman',
        'Opportunities in HealthSakhi Initiatives',
        'Advanced Resources & Early Feature Access',
        'Special Educational Sessions & Direct Support'
      ]
    }
  ];

  // Match with backend plans if available, else use fallback tiers
  const displayTiers = tiers.map(tier => {
    const backendPlan = activePlans.find(p => p.slug === tier.slug);
    return {
      ...tier,
      id: backendPlan?.id || tier.slug,
      backendPlan: backendPlan || null
    };
  });

  const freePlan = activePlans.find(p => p.slug === 'free-sakhi') || {
    id: 'free-sakhi',
    slug: 'free-sakhi',
    name: 'Free 30-Day Trial',
    price: 0
  };

  const handleSelectTier = (tier) => {
    if (tier.backendPlan) {
      handleSubscribePlan(tier.backendPlan);
    } else {
      handleSubscribePlan({
        id: tier.id,
        slug: tier.slug,
        name: tier.name,
        price: tier.price
      });
    }
  };

  return (
    <section
      id="plans"
      className="relative w-full py-16 md:py-24 px-4 md:px-8 lg:px-12 overflow-hidden flex flex-col items-center bg-gradient-to-b from-[#FFF7F9] via-white to-[#FDF5F8]"
    >
      {/* Decorative Aura background blurs */}
      <div className="absolute top-[10%] left-[-10%] w-[550px] h-[550px] bg-pink-200/30 blur-[140px] rounded-full -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/35 blur-[150px] rounded-full -z-10 pointer-events-none"></div>

      {/* ─── SECTION HEADER ──────────────────────────────────────────────── */}
      <div className="w-full max-w-4xl mx-auto text-center mb-10 md:mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 shadow-sm mb-4">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E91E63]">
            HealthSakhi Humanity Pricing
          </span>
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-[#4B1E5A] tracking-tight leading-tight mb-4">
          Use it first. Feel the value. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#E91E63] to-[#8E24AA] bg-clip-text text-transparent">
            Then decide what it is worth to you.
          </span>
        </h2>

        {/* 30 Days Free Trial Callout */}
        <div className="mt-6 max-w-2xl mx-auto p-5 md:p-6 rounded-3xl bg-gradient-to-r from-rose-50/90 via-pink-50/70 to-purple-50/90 border border-rose-200 shadow-lg text-center backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5" /> First 30 Days Free
          </div>
          <p className="text-base md:text-lg font-bold text-[#4B1E5A] mb-2">
            For the first 30 days, HealthSakhi is completely free.
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            No payment is required to discover whether HealthSakhi is useful in your life. Explore it. Listen. Learn. Use it for yourself and your family. At the end of your free month, you decide the value you received.
          </p>
          <button
            onClick={() => handleSubscribePlan(freePlan)}
            className="mt-4 px-6 py-2.5 rounded-full bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            Start Your 30 Days Free
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── PHILOSOPHY INTRO ────────────────────────────────────────────── */}
      <div className="w-full max-w-3xl mx-auto text-center mb-10 text-slate-600 text-xs md:text-sm leading-relaxed">
        <p className="font-medium">
          We believe health knowledge should not become unavailable simply because one woman can afford more than another. At the same time, creating trustworthy health education, multiple languages, audio content and new features requires continued support.
        </p>
        <p className="font-bold text-[#4B1E5A] mt-2 text-sm md:text-base">
          Same meaningful core HealthSakhi experience. Different contributions according to your circumstances and the value you feel you received.
        </p>
      </div>

      {/* ─── CHOOSE WHAT FEELS RIGHT: 4 TIERS GRID ──────────────────────── */}
      <div className="w-full max-w-7xl mx-auto mb-14">
        <div className="text-center mb-6">
          <h3 className="text-xl md:text-2xl font-black text-[#4B1E5A]">
            Choose what feels right
          </h3>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-1">
            Annual Contribution • Transparent & Compassionate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {displayTiers.map((tier) => {
            const isSelected = selectedContribution === tier.slug;
            return (
              <motion.div
                key={tier.slug}
                whileHover={{ y: -6, scale: 1.01 }}
                onClick={() => setSelectedContribution(tier.slug)}
                className={`relative rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between bg-white/95 backdrop-blur-xl shadow-lg cursor-pointer ${
                  tier.borderAccent
                } ${isSelected ? 'ring-2 ring-[#E91E63]' : ''}`}
              >
                {/* Highlight Badge */}
                {tier.tag && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-3.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${tier.tagColor}`}>
                      {tier.tag}
                    </span>
                  </div>
                )}

                <div>
                  {/* Tier Name */}
                  <div className="mt-2 mb-2 text-center">
                    <h4 className="text-2xl font-black text-[#4B1E5A] tracking-tight">{tier.name}</h4>
                  </div>

                  {/* Price */}
                  <div className="text-center my-3 pb-3 border-b border-slate-100">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl lg:text-4xl font-black text-[#4B1E5A]">
                        {tier.formattedPrice}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{tier.period}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#E91E63] uppercase tracking-wider block mt-1">
                      Annual Contribution
                    </span>
                  </div>

                  {/* What your choice says */}
                  <div className="my-4 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-1">
                      What your choice says
                    </p>
                    <p className="text-xs font-semibold text-[#4B1E5A] italic leading-snug">
                      {tier.whatItSays}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 my-4">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 leading-tight">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contribution Action */}
                <div className="mt-6 pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTier(tier);
                    }}
                    className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${tier.buttonBg}`}
                  >
                    <span>Contribute {tier.formattedPrice}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── DIGNITY & EQUALITY STATEMENT ─────────────────────────────────── */}
      <div className="w-full max-w-4xl mx-auto mb-14 p-6 md:p-8 rounded-3xl bg-white border border-rose-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#E91E63] to-[#8E24AA]"></div>
        
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h4 className="text-lg md:text-xl font-black text-[#4B1E5A]">
            One woman should never feel “less” because she pays less.
          </h4>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Choosing <strong>₹999</strong> does not make you a lesser member. Choosing <strong>₹9,999</strong> does not buy you greater dignity. Your financial circumstances are personal. We respect them.
          </p>
          <p className="text-xs text-slate-500">
            There are no uncomfortable questions. No need to explain your choice. No pressure to select a higher contribution.
          </p>
          <div className="pt-2 text-[11px] font-medium text-[#4B1E5A]/80 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
            Higher contributions may support additional optional benefits such as special educational sessions, advanced learning resources, early access to selected features or opportunities to participate in HealthSakhi initiatives. But the essential HealthSakhi experience remains genuinely useful at every level.
          </div>
        </div>
      </div>

      {/* ─── OUR PROMISE TO YOU ─────────────────────────────────────────── */}
      <div className="w-full max-w-4xl mx-auto mb-12">
        <div className="text-center mb-6">
          <h4 className="text-xl md:text-2xl font-black text-[#4B1E5A]">Our promise to you</h4>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-1">
            We would rather earn your trust before asking for your money.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[
            { title: 'No fake countdowns', desc: 'No false urgency timers.' },
            { title: 'No "buy now or lose it"', desc: 'You decide on your time.' },
            { title: 'No endless discount tricks', desc: 'Pure transparent contributions.' },
            { title: 'No guilt', desc: 'Contribute what feels right for you.' },
            { title: 'No judgment', desc: 'Every sister is respected equally.' },
            { title: 'No humiliation', desc: 'Full dignity at every contribution level.' }
          ].map((promise, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:border-rose-200 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-rose-100 text-[#E91E63] flex items-center justify-center font-black text-xs mb-2">
                ✓
              </div>
              <h5 className="text-xs font-bold text-[#4B1E5A]">{promise.title}</h5>
              <p className="text-[10px] text-slate-500 mt-0.5">{promise.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CLOSING MANIFESTO ───────────────────────────────────────────── */}
      <div className="w-full max-w-2xl mx-auto text-center p-6 rounded-3xl bg-gradient-to-r from-[#4B1E5A] to-[#6A1B9A] text-white shadow-xl">
        <p className="text-xs md:text-sm font-medium leading-relaxed opacity-95">
          “If HealthSakhi has helped you understand your body better, make a healthier decision, worry a little less, communicate better with your family, or simply feel that someone finally explained things in a language you could understand, choose the contribution that feels right.”
        </p>
        <p className="text-xs text-rose-200 font-bold mt-3">
          Pay according to the value you received — not according to pressure.
        </p>
        <div className="mt-4 pt-3 border-t border-white/20 text-xs font-black tracking-widest uppercase text-pink-200">
          HealthSakhi™ — Knowledge first. Trust first. Humanity first.
        </div>
      </div>
    </section>
  );
};

export default Pricing;

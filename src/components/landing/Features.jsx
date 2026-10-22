import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const getAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
      : 'http://localhost:5000';
    return `${backendUrl}${url}`;
  }
  return url;
};

const Features = ({ data = {} }) => {
  const { t, langCode } = useLanguage();
  const [isDocExpanded, setIsDocExpanded] = useState(false);
  const extra = data.extraJson || {};

  const name = t('landingPage.aboutUsDocName');
  const qualification = 'MBBS, MSc, PGDip';
  const role = t('landingPage.aboutUsDocRole', 'Lifestyle & Wellness Coach | Author | Founder, HealthSakhi');
  const docPhoto = getAssetUrl(data.imageUrl || '/Images/dr-pratap-portrait.png');
  const experienceText = t('landingPage.experience');
  const helpingText = t('landingPage.helpingFamilies');
  const liveHealthierText = t('landingPage.liveHealthier');
  
  const bioText1 = t('landingPage.bioText1');
  const bioText2 = t('landingPage.bioText2');
  const bioPhilosophy = t('landingPage.bioPhilosophy');
  const statsText = t('landingPage.statsText', '20+ Wellness Books');

  return (
    <section id="about" className="relative w-full py-[80px] px-6 lg:px-10 flex flex-col items-center overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] w-80 h-80 bg-[#ff69b4]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-96 h-96 bg-[#C69214]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[1360px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 lg:items-stretch items-center relative z-10">
        
        {/* LEFT: Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative group order-2 lg:order-1 lg:col-span-7 w-full lg:h-full min-h-[400px] sm:min-h-[580px] lg:min-h-0"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#ff69b4]/10 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(233,30,99,0.12)] border-4 border-white group-hover:scale-[1.02] transition-transform duration-700">
            <img
              src={docPhoto}
              alt={name}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center top' }}
            />
          </div>
          <div className="absolute -bottom-5 -right-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(233,30,99,0.12)] border border-pink-50 px-5 py-3 flex items-center gap-3">
            <span className="text-2xl font-black text-[#E91E63]">20+</span>
            <div>
              <p className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest leading-none">Wellness</p>
              <p className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest leading-none opacity-60">Books</p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-6 lg:gap-8 order-1 lg:order-2 lg:col-span-5 lg:h-full"
        >
          <div className="flex flex-col gap-6 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-5 rounded-[2rem] bg-gradient-to-br from-white/90 via-pink-50/20 to-white/80 backdrop-blur-xl border border-pink-200/80 shadow-[0_15px_40px_rgba(233,30,99,0.06)] flex flex-col items-center text-center justify-center w-full"
            >
              <h3 className="font-serif font-black text-[#4B1E5A] text-xl tracking-tight mb-1 drop-shadow-sm">
                {name}
              </h3>
              <p className="text-[11px] font-black text-[#E91E63] uppercase tracking-[0.12em] mb-0.5">
                {qualification}
              </p>
              <p className="text-[9px] font-black text-[#4B1E5A]/60 uppercase tracking-[0.1em] mb-3">
                {role}
              </p>

              <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] text-white font-black text-[10px] uppercase tracking-widest shadow-[0_2px_8px_rgba(233,30,99,0.15)] mb-3">
                {experienceText}
              </div>

              <div className="w-2/3 h-[1px] bg-gradient-to-r from-transparent via-pink-200/50 to-transparent my-2"></div>

              <div className="space-y-0.5 py-1 font-serif text-[#4B1E5A]/90">
                <p className="text-[10px] font-bold leading-none tracking-wider uppercase opacity-60">{helpingText}</p>
                <p className="text-sm font-black text-[#E91E63] leading-tight italic drop-shadow-sm">{liveHealthierText}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/90 via-pink-50/20 to-white/80 backdrop-blur-xl border border-pink-200/80 shadow-[0_15px_40px_rgba(233,30,99,0.06)] flex flex-col w-full h-[400px] relative shrink-0"
            >
              <h4 className="text-lg font-serif font-black text-[#4B1E5A] mb-3 shrink-0">
                {t('landingPage.bioTitle')}
              </h4>

              <div
                className={`pr-2 space-y-4 custom-scrollbar ${isDocExpanded ? 'h-[240px] overflow-y-auto' : 'h-[240px] overflow-hidden'}`}
                style={{ scrollbarWidth: 'thin' }}
              >
                <p className="text-[#4B1E5A]/80 text-sm font-semibold leading-relaxed">
                  {bioText1}
                </p>

                {isDocExpanded && (
                  <div className="pt-3 border-t border-[#E91E63]/10 space-y-4">
                    <p className="text-[#4B1E5A]/60 text-xs font-bold uppercase tracking-widest leading-none">{t('landingPage.philosophy')}</p>
                    <blockquote className="pl-4 border-l-4 border-[#E91E63] font-serif italic text-sm text-[#4B1E5A] my-3">
                      {bioPhilosophy}
                    </blockquote>

                    <p className="text-[#4B1E5A]/80 text-sm font-semibold leading-relaxed">
                      {bioText2}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        { text: experienceText, icon: "⭐" },
                        { text: helpingText, icon: "🤝" },
                        { text: statsText, icon: "📚" },
                        { text: "Founder – HealthSakhi", icon: "🌸" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-pink-100/50 shadow-sm">
                          <span className="text-base">{item.icon}</span>
                          <span className="text-[#4B1E5A] font-black text-[10px] uppercase tracking-wider">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-auto pt-2 shrink-0">
                <button
                  onClick={() => setIsDocExpanded(!isDocExpanded)}
                  className="px-5 py-2.5 rounded-full border border-[#E91E63]/30 bg-white/50 text-[#E91E63] font-black text-[10px] uppercase tracking-widest hover:bg-[#E91E63] hover:text-white hover:border-[#E91E63] transition-all duration-300 shadow-sm flex items-center gap-1.5"
                >
                  {isDocExpanded ? (
                    <>
                      {t('landingPage.readLess')}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </>
                  ) : (
                    <>
                      {t('landingPage.readMore')}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;

import React from 'react';
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

const heroCategories = [
  { key: 'hero.categories.personal', fallback: 'Personal' },
  { key: 'hero.categories.womenHealth', fallback: 'Women Health' },
  { key: 'hero.categories.parenting', fallback: 'Parenting' },
  { key: 'hero.categories.wealth', fallback: 'Wealth' },
  { key: 'hero.categories.relationships', fallback: 'Relationships' },
  { key: 'hero.categories.stress', fallback: 'Stress' },
];

const Hero = ({ data = {}, setIsVideoModalOpen }) => {
  const { t, langCode } = useLanguage();
  const extra = data.extraJson || {};

  const title = t('brand');
  const subtitle = t('tagline');
  const groupPhoto = getAssetUrl(data.imageUrl || '/Images/group-photo edited 3.png');
  const mobileCard = getAssetUrl(extra.mobileCardImage || '/Images/mobilecard.png');
  const exploreBtnText = t('landingPage.exploreServices');
  const exploreBtnLink = data.buttonLink || 'wellness-books';
  const watchBtnText = t('landingPage.watchDemo');

  const handleExploreClick = () => {
    const targetId = exploreBtnLink.startsWith('#') ? exploreBtnLink.substring(1) : exploreBtnLink;
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative w-full lg:h-[82vh] lg:min-h-[640px] flex flex-col pt-20 lg:pt-16 overflow-hidden">
      <div className="relative flex-1 w-full max-w-[1280px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:block">
        
        {/* BRAND COLUMN - Vertically centered with text-center alignment */}
        <div className="flex flex-col items-center text-center lg:absolute lg:left-2 xl:left-6 lg:top-[50%] lg:-translate-y-1/2 w-full lg:w-[300px] xl:w-[330px] z-20 mt-4 lg:mt-0 px-2 sm:px-0">
          <h1
            className="font-serif font-black text-[#4B1E5A] uppercase leading-tight mb-1 tracking-wider break-words text-center w-full"
            style={{ fontSize: 'clamp(1.3rem, 2.1vw, 2.0rem)' }}
          >
            {title}
          </h1>

          <p className="text-[10px] sm:text-[11px] lg:text-[11.5px] font-black uppercase tracking-wider text-[#E91E63] text-center w-full mt-0.5 mb-1.5 leading-tight">
            {t('hero.ecosystemTagline', 'COMPLETE FAMILY MANAGEMENT ECOSYSTEM')}
          </p>

          {/* HERO CATEGORIES BADGES */}
          <div className="my-1.5 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 w-full max-w-[280px] sm:max-w-[310px] text-center px-1">
            <span className="text-[#4B1E5A]/70 font-bold text-xs sm:text-sm mr-0.5">(</span>
            {heroCategories.map((cat, idx) => (
              <React.Fragment key={cat.key}>
                <span className="inline-block text-[10px] sm:text-[11px] font-bold text-[#4B1E5A] bg-[#4B1E5A]/5 hover:bg-[#E91E63] hover:text-white px-2 py-0.5 rounded-full border border-[#4B1E5A]/15 transition-all duration-200 cursor-default shadow-2xs">
                  {t(cat.key, cat.fallback)}
                </span>
                {idx < heroCategories.length - 1 && (
                  <span className="text-[#E91E63]/60 text-[10px] font-bold mx-0.5">•</span>
                )}
              </React.Fragment>
            ))}
            <span className="text-[#4B1E5A]/70 font-bold text-xs sm:text-sm ml-0.5">)</span>
          </div>

          {/* GYAN BADHAO, DHAN KAMAO, LEARN TO EARN TEXT BLOCK */}
          <div className="my-1.5 flex flex-col items-center text-center w-full">
            <div className="font-serif font-black uppercase tracking-tight leading-[1.2] text-center w-full" style={{ fontSize: 'clamp(1.1rem, 1.65vw, 1.5rem)' }}>
              <div className="text-[#3B1548] text-center">{t('hero.gyanBadhao', 'GYAN BADHAO,')}</div>
              <div className="text-[#3B1548] text-center">{t('hero.dhanKamao', 'DHAN KAMAO,')}</div>
              <div className="text-[#E91E63] font-extrabold tracking-wider mt-0.5 text-center">{t('hero.learnToEarn', 'LEARN TO EARN')}</div>
            </div>

            {/* Heart & Line Divider */}
            <div className="flex items-center justify-center gap-2.5 w-full max-w-[200px] sm:max-w-[230px] my-2 opacity-85">
              <div className="h-[1.5px] bg-gradient-to-r from-transparent via-[#C4AA3D]/60 to-[#C4AA3D] flex-1" />
              <span className="text-[#C4AA3D] text-xs font-bold transform hover:scale-125 transition-transform">♥</span>
              <div className="h-[1.5px] bg-gradient-to-r from-[#C4AA3D] via-[#C4AA3D]/60 to-transparent flex-1" />
            </div>

            {/* Description Text */}
            <p className="text-[#4B1E5A]/90 font-serif text-[11px] sm:text-[12px] leading-relaxed font-semibold max-w-[250px] sm:max-w-[275px] xl:max-w-[285px] text-center">
              {t('hero.affiliateTagline', 'Join our unique HealthSakhi Program and become a Wellness Champion to become our Affiliate.')}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 justify-center w-full mt-3">
            <button
              onClick={handleExploreClick}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#E91E63] text-white font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-[0_4px_15px_rgba(233,30,99,0.3)] hover:scale-105 transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              {exploreBtnText}
            </button>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border-2 border-[#4B1E5A] bg-white/60 backdrop-blur-sm text-[#4B1E5A] font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-[#4B1E5A] hover:text-white transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              {watchBtnText}
            </button>
          </div>
        </div>

        {/* PHOTO COLUMN */}
        <div className="relative lg:absolute lg:left-[51%] lg:-translate-x-1/2 lg:top-10 lg:bottom-0 w-full lg:w-[62%] xl:w-[68%] z-10 flex items-end justify-center mt-8 lg:mt-0 pointer-events-none min-h-[260px] sm:min-h-[300px] lg:min-h-0">
          <img
            src={groupPhoto}
            alt="HealthSakhi Community Women"
            className="w-full h-full max-h-[360px] sm:max-h-[400px] lg:max-h-none object-contain drop-shadow-2xl scale-100 sm:scale-105 lg:scale-100 xl:scale-105 origin-bottom"
            style={{ objectPosition: 'center bottom' }}
          />
        </div>

        {/* APP COLUMN */}
        <div className="relative lg:absolute lg:right-2 xl:right-6 lg:top-10 lg:bottom-0 w-full lg:w-[22%] flex justify-center lg:justify-end items-end z-20 mt-10 lg:mt-0 pb-8 lg:pb-0">
          <div className="relative w-[180px] sm:w-[200px] md:w-[220px] xl:w-[250px]">
            <img
              src={mobileCard}
              alt="HealthSakhi App Mockup"
              className="w-full h-auto drop-shadow-[0_20px_50px_rgba(233,30,99,0.2)] hover:-translate-y-2 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

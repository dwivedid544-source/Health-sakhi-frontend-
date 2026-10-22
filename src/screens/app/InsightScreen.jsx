import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import InsightChain from '../../components/insights/InsightChain';
import { useInsightEngine } from '../../hooks/useInsightEngine';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedInsight } from '../../data/insightChains';

const InsightScreen = () => {
  const { langCode, t } = useLanguage();
  const { activeChain, hasPersonalData, familyStress, lastMood } = useInsightEngine();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[#ff69b4] mb-2">
          <Sparkles size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('insights.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15192c] mb-2">{t('insights.title')}</h1>
        <p className="text-sm text-[#9A8A8E] font-medium">{t('insights.subtitle')}</p>
      </header>

      {!hasPersonalData && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-900 font-medium">
          {t('insights.noData')}
          <Link to="/app" className="block mt-2 text-[#ff69b4] font-black text-[10px] uppercase tracking-widest">
            {t('insights.goHome')} →
          </Link>
        </div>
      )}

      {(familyStress || lastMood) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {familyStress && (
            <span className="px-3 py-1 rounded-full bg-rose-50 text-[10px] font-black uppercase text-[#ff69b4]">
              {t('insights.family')}: {familyStress}
            </span>
          )}
          {lastMood && (
            <span className="px-3 py-1 rounded-full bg-purple-50 text-[10px] font-black uppercase text-purple-600">
              {t('insights.mood')}: {lastMood}
            </span>
          )}
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-rose-50 shadow-sm mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#C4A0AC] mb-4">
          {t('insights.chainTitle')}
        </h2>
        <InsightChain chain={activeChain} langCode={langCode} />
        <p className="mt-6 text-sm sm:text-base text-[#4a3f55] leading-relaxed font-medium border-t border-rose-50 pt-6">
          {getLocalizedInsight(activeChain.insight, langCode)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/app/awareness"
          className="flex items-center justify-between p-5 rounded-2xl bg-violet-600 text-white hover:brightness-110 transition-all group"
        >
          <span className="font-black text-sm">{t('nav.awareness')}</span>
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to="/app/guidance"
          className="flex items-center justify-between p-5 rounded-2xl bg-[#15192c] text-white hover:brightness-110 transition-all group"
        >
          <span className="font-black text-sm">{t('guidance.shortDesc')}</span>
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to="/app/family"
          className="flex items-center justify-between p-5 rounded-2xl bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all group"
        >
          <span className="font-black text-sm text-[#15192c]">{t('familyHub.title')}</span>
          <ChevronRight size={18} className="text-[#ff69b4] group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to="/app/reels"
          className="flex items-center justify-between p-5 rounded-2xl bg-white border border-rose-100 hover:border-[#ff69b4] transition-all group sm:col-span-2"
        >
          <span className="font-black text-sm text-[#15192c]">{t('reels.title')}</span>
          <ChevronRight size={18} className="text-[#ff69b4] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default InsightScreen;

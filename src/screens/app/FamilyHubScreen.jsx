import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Users } from 'lucide-react';
import { familyModules, getLocalized } from '../../data/familyModulesData';
import { useLanguage } from '../../context/LanguageContext';

const FamilyHubScreen = () => {
  const { langCode, t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-12 max-w-5xl mx-auto"
    >
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[#ff69b4] mb-2">
          <Users size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('familyHub.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15192c] tracking-tight mb-2">
          {t('familyHub.title')}
        </h1>
        <p className="text-sm text-[#9A8A8E] font-medium max-w-xl leading-relaxed">
          {t('familyHub.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {familyModules.map((mod, idx) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Link
              to={`/app/family/${mod.slug}`}
              className={`block rounded-[2rem] p-6 sm:p-8 bg-gradient-to-br ${mod.gradient} border border-white/80 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all group h-full`}
            >
              <span className="text-4xl sm:text-5xl mb-4 block">{mod.emoji}</span>
              <h2 className="text-lg sm:text-xl font-black text-[#15192c] mb-1 group-hover:text-[#ff69b4] transition-colors">
                {getLocalized(mod.title, langCode)}
              </h2>
              <p className="text-xs sm:text-sm text-[#6b5b63] font-medium mb-4">
                {getLocalized(mod.subtitle, langCode)}
              </p>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                style={{ color: mod.accent }}
              >
                {t('familyHub.explore')}
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/app/insights"
          className="p-5 rounded-2xl bg-[#15192c] text-white hover:brightness-110 transition-all"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-1">
            {t('insights.badge')}
          </p>
          <p className="font-black text-sm">{t('insights.shortDesc')}</p>
        </Link>
        <Link
          to="/app/guidance"
          className="p-5 rounded-2xl bg-rose-50 border border-rose-100 hover:bg-rose-100/80 transition-all"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-1">
            {t('guidance.badge')}
          </p>
          <p className="font-black text-sm text-[#15192c]">{t('guidance.shortDesc')}</p>
        </Link>
      </div>
    </motion.div>
  );
};

export default FamilyHubScreen;

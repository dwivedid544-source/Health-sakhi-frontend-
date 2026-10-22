import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import GuidanceWizard from '../../components/guidance/GuidanceWizard';
import { useLanguage } from '../../context/LanguageContext';

const GuidanceScreen = () => {
  const { t } = useLanguage();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[#ff69b4] mb-2">
          <Shield size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('guidance.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15192c] mb-2">{t('guidance.title')}</h1>
        <p className="text-sm text-[#9A8A8E] font-medium leading-relaxed">{t('guidance.subtitle')}</p>
      </header>
      <GuidanceWizard />
    </motion.div>
  );
};

export default GuidanceScreen;

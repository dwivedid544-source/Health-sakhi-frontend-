import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Moon, Smile, Activity, Brain, Users, Flame, BookOpen, Sparkles, Shield
} from 'lucide-react';
import { useWellnessStore } from '../../store/wellnessStore';
import { FAMILY_PROFILE_TYPES } from '../../data/familyTypes';
import { useLanguage } from '../../context/LanguageContext';

const WellnessHubScreen = () => {
  const navigate = useNavigate();
  const { familyProfileType, setFamilyProfileType, lastMood, familyStress } = useWellnessStore();
  const { t } = useLanguage();

  const MODULES = [
    { titleKey: 'womenWellness', descKey: 'womenWellnessDesc', icon: Heart, path: '/app/wellness/women' },
    { titleKey: 'emotionalHealth', descKey: 'emotionalHealthDesc', icon: Brain, path: '/app/wellness/emotional' },
    { titleKey: 'familyRelationships', descKey: 'familyRelationshipsDesc', icon: Users, path: '/app/wellness/relationships' },
    { titleKey: 'caregiverBurnout', descKey: 'caregiverBurnoutDesc', icon: Flame, path: '/app/family/burnout' },
    { titleKey: 'wellnessJournal', descKey: 'wellnessJournalDesc', icon: BookOpen, path: '/app/wellness/journal' },
    { titleKey: 'familyGoals', descKey: 'familyGoalsDesc', icon: Activity, path: '/app/wellness/goals' },
    { titleKey: 'aiInsights', descKey: 'aiInsightsDesc', icon: Sparkles, path: '/app/insights' },
    { titleKey: 'safetySupport', descKey: 'safetySupportDesc', icon: Shield, path: '/app/safety' },
  ];

  const BOTTOM_LINKS = [
    { labelKey: 'familyConnect', path: '/app/family-connect' },
    { labelKey: 'wellnessCenter', path: '/app/wellness-center' },
    { labelKey: 'awareness', path: '/app/awareness' },
    { labelKey: 'aiSakhi', path: '/app/ai-sakhi' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-16 px-1">
      <header className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">{t('wellnessHub.tagline', 'Family Wellness Hub')}</p>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15192c] mb-2">{t('wellnessHub.heading', 'Your healing dashboard')}</h1>
        <p className="text-sm text-[#9A8A8E] font-medium max-w-lg">
          {t('wellnessHub.subheading', 'Track body, heart, and home — gently, without judgment.')}
        </p>
        {(lastMood || familyStress) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {lastMood && (
              <span className="px-3 py-1 rounded-full bg-purple-50 text-[10px] font-black uppercase text-purple-600">
                {t('wellnessHub.mood', 'Mood')}: {lastMood}
              </span>
            )}
            {familyStress && (
              <span className="px-3 py-1 rounded-full bg-rose-50 text-[10px] font-black uppercase text-[#ff69b4]">
                {t('wellnessHub.home', 'Home')}: {familyStress}
              </span>
            )}
          </div>
        )}
      </header>

      <section className="mb-8 p-5 rounded-[2rem] bg-white border border-rose-50 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] mb-3">{t('wellnessHub.lifeSeason', 'Your life season')}</p>
        <div className="flex flex-wrap gap-2">
          {FAMILY_PROFILE_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setFamilyProfileType(type.id)}
              className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-wide border transition-all ${
                familyProfileType === type.id
                  ? 'bg-[#ff69b4] text-white border-[#ff69b4]'
                  : 'bg-rose-50/50 text-[#15192c] border-rose-100 hover:border-[#ff69b4]'
              }`}
            >
              {type.emoji} {type.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULES.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.button
              key={m.path}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(m.path)}
              className="text-left p-5 sm:p-6 rounded-[1.75rem] bg-white border border-rose-50 shadow-sm hover:border-[#ff69b4]/40 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff69b4] mb-4 group-hover:scale-110 transition-transform">
                <Icon size={22} />
              </div>
              <h2 className="font-black text-[#15192c] text-sm sm:text-base mb-1">{t(`wellnessHub.${m.titleKey}`, m.titleKey)}</h2>
              <p className="text-xs text-[#9A8A8E] font-medium">{t(`wellnessHub.${m.descKey}`, m.descKey)}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BOTTOM_LINKS.map((link) => (
          <button
            key={link.path}
            type="button"
            onClick={() => navigate(link.path)}
            className="py-3 rounded-2xl bg-[#15192c] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#ff69b4] transition-colors"
          >
            {t(`wellnessHub.${link.labelKey}`, link.labelKey)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default WellnessHubScreen;

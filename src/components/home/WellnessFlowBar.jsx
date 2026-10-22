import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Heart, Lightbulb, Shield, Eye, Film, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const STEPS = [
  { key: 'home', path: '/app', icon: Home, labelKey: 'nav.home' },
  { key: 'sakhi', path: '/app/ai-sakhi', icon: Sparkles, labelKey: 'nav.aiChatBot' }
];

const WellnessFlowBar = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="px-6 mb-6">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] mb-3">
        {t('dashboard.familyWellnessJourney', 'Family Wellness Journey')}
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => navigate(step.path)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-rose-100 shadow-sm hover:border-[#ff69b4] hover:text-[#ff69b4] transition-all shrink-0"
            >
              <Icon size={14} className="text-[#ff69b4]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#15192c]">
                {t(step.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WellnessFlowBar;

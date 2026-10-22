import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, ChevronRight } from 'lucide-react';
import { useWellnessStore } from '../../store/wellnessStore';
import { useLanguage } from '../../context/LanguageContext';

const LEVELS = [
  { id: 'calm', emoji: '🌿', color: '#059669', bg: '#ECFDF5' },
  { id: 'some', emoji: '🌤️', color: '#D97706', bg: '#FFF7ED' },
  { id: 'high', emoji: '🌧️', color: '#DC2626', bg: '#FEF2F2' }
];

const FamilyPulseCard = () => {
  const familyStress = useWellnessStore((s) => s.familyStress);
  const setFamilyStress = useWellnessStore((s) => s.setFamilyStress);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const labelFor = (id) => {
    if (id === 'calm') return t('family.calm');
    if (id === 'some') return t('family.someStress');
    return t('family.highStress');
  };

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-rose-50/80 h-full">
      <div className="flex items-center gap-2 mb-1">
        <Home size={16} className="text-[#ff69b4]" />
        <h3 className="text-sm font-black text-[#15192c] uppercase tracking-widest">
          {t('home.familyPulse')}
        </h3>
      </div>
      <p className="text-xs text-[#9A8A8E] font-medium mb-4">{t('home.familyPulseDesc')}</p>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {LEVELS.map((level) => {
          const active = familyStress === level.id;
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => setFamilyStress(level.id)}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                active
                  ? 'border-[#ff69b4] shadow-md scale-[1.02]'
                  : 'border-transparent hover:border-rose-100'
              }`}
              style={{ background: level.bg }}
            >
              <span className="text-2xl sm:text-3xl">{level.emoji}</span>
              <span
                className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-center leading-tight"
                style={{ color: level.color }}
              >
                {labelFor(level.id)}
              </span>
            </button>
          );
        })}
      </div>

      {!familyStress && (
        <p className="text-[10px] text-[#C4A0AC] font-bold mt-3 flex items-center gap-1">
          <Heart size={10} /> {t('family.notShared')}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-rose-50">
        <button
          type="button"
          onClick={() => navigate('/app/family')}
          className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] hover:underline flex items-center gap-1"
        >
          {t('home.openFamily')} <ChevronRight size={12} />
        </button>
        {familyStress && (
          <button
            type="button"
            onClick={() => navigate('/app/insights')}
            className="text-[10px] font-black uppercase tracking-widest text-[#15192c]/70 hover:text-[#ff69b4] flex items-center gap-1"
          >
            {t('home.viewInsight')} <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FamilyPulseCard;

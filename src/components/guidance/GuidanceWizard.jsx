import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Shield, Sparkles, Heart, AlertCircle } from 'lucide-react';
import {
  guidanceTopics,
  severityLevels,
  computeGuidance,
  getGuidanceLocalized
} from '../../data/guidanceRules';
import { useWellnessStore } from '../../store/wellnessStore';
import { useLanguage } from '../../context/LanguageContext';

const LEVEL_STYLES = {
  self: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Heart, color: '#059669' },
  sakhi: { bg: 'bg-rose-50', border: 'border-rose-200', icon: Sparkles, color: '#ff69b4' },
  professional: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: Shield, color: '#4f46e5' },
  emergency: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, color: '#dc2626' }
};

const GuidanceWizard = () => {
  const { langCode, t } = useLanguage();
  const familyStress = useWellnessStore((s) => s.familyStress);
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState(null);
  const [severity, setSeverity] = useState(null);

  const result = useMemo(() => {
    if (!topic || !severity) return null;
    return computeGuidance({ topic, severity, familyStress });
  }, [topic, severity, familyStress]);

  const loc = (obj) => getGuidanceLocalized(obj, langCode);

  const reset = () => {
    setStep(0);
    setTopic(null);
    setSeverity(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="topic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-sm font-black text-[#15192c] uppercase tracking-widest">
              {t('guidance.step1')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guidanceTopics.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTopic(opt.id);
                    setStep(1);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-rose-50 bg-white hover:border-[#ff69b4] hover:shadow-md transition-all text-left"
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="font-bold text-[#15192c] text-sm">{loc(opt.label)}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="severity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-[10px] font-black uppercase text-[#ff69b4] tracking-widest"
            >
              ← {t('guidance.back')}
            </button>
            <p className="text-sm font-black text-[#15192c] uppercase tracking-widest">
              {t('guidance.step2')}
            </p>
            <div className="space-y-3">
              {severityLevels.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSeverity(opt.id);
                    setStep(2);
                  }}
                  className="flex items-center gap-4 p-4 w-full rounded-2xl border-2 border-rose-50 bg-white hover:border-[#ff69b4] hover:shadow-md transition-all text-left"
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-bold text-[#15192c] text-sm">{loc(opt.label)}</span>
                  <ChevronRight size={18} className="ml-auto text-[#C4A0AC]" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <button
              type="button"
              onClick={reset}
              className="text-[10px] font-black uppercase text-[#ff69b4] tracking-widest"
            >
              ← {t('guidance.startOver')}
            </button>

            {(() => {
              const style = LEVEL_STYLES[result.level] || LEVEL_STYLES.self;
              const Icon = style.icon;
              return (
                <div className={`rounded-[2rem] p-6 sm:p-8 border-2 ${style.bg} ${style.border}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                      style={{ background: style.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">
                        {t(`guidance.level.${result.level}`)}
                      </p>
                      <h3 className="text-xl font-black text-[#15192c]">{loc(result.title)}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-[#4a3f55] leading-relaxed font-medium mb-6">
                    {loc(result.message)}
                  </p>
                  {result.disclaimer && (
                    <p className="text-xs text-red-600 font-bold mb-4 flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      {loc(result.disclaimer)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {result.routes?.map((r) => (
                      <Link
                        key={r.path}
                        to={r.path}
                        className="px-4 py-2.5 rounded-full bg-[#15192c] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff69b4] transition-colors"
                      >
                        {loc(r.label)}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuidanceWizard;



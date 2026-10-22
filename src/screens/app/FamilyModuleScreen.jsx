import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Play, BookOpen, MessageCircle, Calendar } from 'lucide-react';
import { getModuleBySlug, getLocalized } from '../../data/familyModulesData';
import { useLanguage } from '../../context/LanguageContext';
const ACTION_ICONS = { reels: Play, book: BookOpen, sakhi: MessageCircle, session: Calendar, meditation: Play };

const FamilyModuleScreen = () => {
  const { slug } = useParams();
  const { langCode, t } = useLanguage();
  const module = getModuleBySlug(slug);
  const [donePrompts, setDonePrompts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`hs_family_prompts_${slug}`) || '[]');
    } catch {
      return [];
    }
  });

  if (!module) return <Navigate to="/app/family" replace />;

  const togglePrompt = (idx) => {
    const next = donePrompts.includes(idx)
      ? donePrompts.filter((i) => i !== idx)
      : [...donePrompts, idx];
    setDonePrompts(next);
    localStorage.setItem(`hs_family_prompts_${slug}`, JSON.stringify(next));
  };

  const handleSakhi = (action) => {
    const prompt =
      langCode === 'hi'
        ? 'मुझे परिवार के तनाव में मदद चाहिए।'
        : 'I need help with family stress at home.';
    sessionStorage.setItem('hs_sakhi_pending_prompt', prompt);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12">
      <Link
        to="/app/family"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-6 hover:opacity-80"
      >
        <ChevronLeft size={16} />
        {t('familyHub.back')}
      </Link>

      <div className={`rounded-[2.5rem] p-6 sm:p-10 bg-gradient-to-br ${module.gradient} border border-white/80 shadow-sm mb-8`}>
        <span className="text-5xl mb-4 block">{module.emoji}</span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15192c] mb-2">
          {getLocalized(module.title, langCode)}
        </h1>
        <p className="text-sm font-bold text-[#6b5b63] mb-4">{getLocalized(module.subtitle, langCode)}</p>
        <p className="text-sm text-[#4a3f55] leading-relaxed">{getLocalized(module.description, langCode)}</p>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-black text-[#15192c] uppercase tracking-widest mb-4">
          {t('familyHub.dailyPrompts')}
        </h2>
        <div className="space-y-3">
          {module.dailyPrompts.map((prompt, idx) => {
            const done = donePrompts.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => togglePrompt(idx)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  done ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-50 bg-white hover:border-[#ff69b4]/40'
                }`}
              >
                <CheckCircle2
                  size={22}
                  className={done ? 'text-emerald-500 shrink-0' : 'text-[#C4A0AC] shrink-0'}
                />
                <span className={`text-sm font-medium ${done ? 'text-emerald-800 line-through opacity-70' : 'text-[#15192c]'}`}>
                  {getLocalized(prompt, langCode)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-black text-[#15192c] uppercase tracking-widest mb-4">
          {t('familyHub.tips')}
        </h2>
        <ul className="space-y-2">
          {module.tips.map((tip, i) => (
            <li key={i} className="flex gap-3 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
              <span className="text-[#ff69b4]">♥</span>
              <span className="text-sm text-[#15192c] font-medium">{getLocalized(tip, langCode)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-black text-[#15192c] uppercase tracking-widest mb-4">
          {t('familyHub.actions')}
        </h2>
        <div className="flex flex-wrap gap-3">
          {module.actions.map((action, i) => {
            const Icon = ACTION_ICONS[action.type] || Play;
            const label = getLocalized(action.label, langCode);
            if (action.type === 'sakhi') {
              return (
                <Link
                  key={i}
                  to={action.route}
                  onClick={() => handleSakhi(action)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#ff69b4] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            }
            return (
              <Link
                key={i}
                to={action.route}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#15192c] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff69b4] transition-all"
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
        {module.relatedReels?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {module.relatedReels.map((reelId) => (
              <Link
                key={reelId}
                to={`/app/reels?reel=${reelId}`}
                className="px-3 py-1.5 rounded-full bg-white border border-rose-100 text-[10px] font-bold text-[#ff69b4] uppercase tracking-wider hover:bg-rose-50"
              >
                ▶ Reel
              </Link>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default FamilyModuleScreen;

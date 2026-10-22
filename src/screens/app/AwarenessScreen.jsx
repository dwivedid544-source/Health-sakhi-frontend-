import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Eye, Stethoscope, Home } from 'lucide-react';
import { awarenessTopics, getAwarenessLocalized } from '../../data/awarenessData';
import { useLanguage } from '../../context/LanguageContext';
import InsightChain from '../../components/insights/InsightChain';

const ICONS = { 'stress-health': Eye, 'care-guidance': Stethoscope, 'domestic-understanding': Home };

const AwarenessScreen = () => {
  const { langCode, t } = useLanguage();
  const [openId, setOpenId] = useState(awarenessTopics[0]?.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12">
      <header className="mb-8">
        <motion.div className="flex items-center gap-2 text-[#ff69b4] mb-2">
          <Eye size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('awareness.badge')}</span>
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15192c] mb-2">{t('awareness.title')}</h1>
        <p className="text-sm text-[#9A8A8E] font-medium leading-relaxed">{t('awareness.subtitle')}</p>
      </header>

      <motion.div className="flex flex-wrap gap-2 mb-6">
        {awarenessTopics.map((topic) => {
          const Icon = ICONS[topic.id] || Eye;
          const active = openId === topic.id;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => setOpenId(topic.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                active ? 'bg-[#ff69b4] text-white border-[#ff69b4]' : 'bg-white border-rose-100 text-[#15192c]'
              }`}
            >
              <Icon size={14} />
              {getAwarenessLocalized(topic.title, langCode).split('→')[0].trim().slice(0, 22)}
            </button>
          );
        })}
      </motion.div>

      {awarenessTopics.map((topic) => {
        if (topic.id !== openId) return null;
        const Icon = ICONS[topic.id] || Eye;

        return (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[2rem] p-6 sm:p-8 border border-white/80 bg-gradient-to-br ${topic.gradient} shadow-sm mb-6`}
          >
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl">{topic.emoji}</span>
              <div>
                <h2 className="text-xl font-black text-[#15192c] mb-1">
                  {getAwarenessLocalized(topic.title, langCode)}
                </h2>
                <p className="text-sm text-[#4a3f55] leading-relaxed font-medium">
                  {getAwarenessLocalized(topic.summary, langCode)}
                </p>
              </div>
            </div>

            {topic.chain && (
              <div className="bg-white/70 rounded-2xl p-4 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] mb-3">
                  {t('awareness.connectionChain')}
                </p>
                <InsightChain
                  chain={{
                    nodes: topic.chain.map((n, i) => ({
                      id: `n${i}`,
                      emoji: n.emoji,
                      label: n.label
                    }))
                  }}
                  langCode={langCode}
                />
              </div>
            )}

            {topic.learnMore && (
              <ul className="space-y-2 mb-4">
                {topic.learnMore.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#15192c] font-medium">
                    <span className="text-[#ff69b4]">♥</span>
                    {getAwarenessLocalized(item, langCode)}
                  </li>
                ))}
              </ul>
            )}

            {topic.careTypes && (
              <div className="space-y-3 mb-4">
                {topic.careTypes.map((care) => (
                  <div key={care.id} className="bg-white rounded-2xl p-4 border border-rose-50">
                    <h3 className="font-black text-[#15192c] text-sm mb-1">{getAwarenessLocalized(care.title, langCode)}</h3>
                    <p className="text-xs text-[#6b5b63] mb-1">
                      <span className="font-bold">{t('awareness.when')}:</span>{' '}
                      {getAwarenessLocalized(care.when, langCode)}
                    </p>
                    <p className="text-xs text-[#6b5b63] mb-3">
                      <span className="font-bold">{t('awareness.examples')}:</span>{' '}
                      {getAwarenessLocalized(care.examples, langCode)}
                    </p>
                    <Link
                      to={care.path}
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#ff69b4] hover:underline"
                    >
                      {t('awareness.explore')} <ChevronRight size={12} />
                    </Link>
                  </div>
                ))}
                {topic.warningSigns && (
                  <p className="text-xs text-red-700 font-bold bg-red-50 border border-red-100 rounded-xl p-3">
                    {getAwarenessLocalized(topic.warningSigns, langCode)}
                  </p>
                )}
              </div>
            )}

            {topic.patterns && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {topic.patterns.map((p, i) => (
                  <li key={i} className="text-xs font-bold text-[#15192c] bg-white/80 rounded-xl px-3 py-2 border border-rose-50">
                    {getAwarenessLocalized(p, langCode)}
                  </li>
                ))}
              </ul>
            )}

            {topic.supportSteps && (
              <ol className="list-decimal list-inside space-y-2 mb-4 text-sm text-[#15192c] font-medium">
                {topic.supportSteps.map((s, i) => (
                  <li key={i}>{getAwarenessLocalized(s, langCode)}</li>
                ))}
              </ol>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {topic.actions?.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="px-4 py-2 rounded-full bg-[#15192c] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff69b4] transition-colors"
                >
                  {getAwarenessLocalized(action.label, langCode)}
                </Link>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AwarenessScreen;

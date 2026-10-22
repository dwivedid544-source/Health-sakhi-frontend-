import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, Sparkles } from 'lucide-react';
import { useWellnessStore } from '../../store/wellnessStore';
import { useLanguage } from '../../context/LanguageContext';

const SCALE = [1, 2, 3, 4, 5];

const WellnessModuleScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const store = useWellnessStore();
  const { t } = useLanguage();
  const [journalText, setJournalText] = useState('');
  const [goalText, setGoalText] = useState('');
  const [moodTag, setMoodTag] = useState('');
  const [recommendationData, setRecommendationData] = useState(null);

  const renderScale = (label, value, onChange) => (
    <div className="mb-6" key={label}>
      <p className="text-xs font-black text-[#15192c] mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
              value === n ? 'bg-[#ff69b4] text-white' : 'bg-rose-50 text-[#15192c] hover:bg-rose-100'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  const content = {
    women: {
      title: t('wellnessHub.womenTrackerTitle', 'Women wellness tracker'),
      body: (
        <>
          <p className="text-sm text-[#9A8A8E] mb-6">{t('wellnessHub.womenTrackerDesc', 'Connect your daily signals — mood and cycle tools are already in the app.')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/app/period" className="p-4 rounded-2xl bg-rose-50 border border-rose-100 font-black text-sm text-[#ff69b4] hover:bg-rose-100">
              {t('wellnessHub.periodTracker', 'Period tracker →')}
            </Link>
            <Link to="/app" className="p-4 rounded-2xl bg-purple-50 border border-purple-100 font-black text-sm text-purple-600 hover:bg-purple-100">
              {t('wellnessHub.logMoodHome', 'Log mood on Home →')}
            </Link>
            <Link to="/app/books" className="p-4 rounded-2xl bg-teal-50 border border-teal-100 font-black text-sm text-teal-700 hover:bg-teal-100">
              {t('wellnessHub.sleepCalm', 'Sleep & calm →')}
            </Link>
            <Link to="/app/awareness" className="p-4 rounded-2xl bg-violet-50 border border-violet-100 font-black text-sm text-violet-700 hover:bg-violet-100">
              {t('wellnessHub.stressHealth', 'Stress → health →')}
            </Link>
          </div>
        </>
      )
    },
    emotional: {
      title: t('wellnessHub.emotionalTrackerTitle', 'Emotional health tracker'),
      body: (
        <>
          <p className="text-sm text-[#9A8A8E] mb-4">{t('wellnessHub.emotionalTrackerDesc', 'Rate today honestly — 1 is light, 5 is very heavy.')}</p>
          {renderScale(t('wellnessHub.stressLevel', 'Stress level'), store.dailyEmotional.stress, (v) => store.setDailyEmotional({ stress: v }))}
          {renderScale(t('wellnessHub.burnout', 'Burnout'), store.dailyEmotional.burnout, (v) => store.setDailyEmotional({ burnout: v }))}
          {renderScale(t('wellnessHub.anxiety', 'Anxiety'), store.dailyEmotional.anxiety, (v) => store.setDailyEmotional({ anxiety: v }))}
          
          <button
            type="button"
            disabled={!store.dailyEmotional.stress && !store.dailyEmotional.burnout && !store.dailyEmotional.anxiety}
            onClick={() => {
              const stress = store.dailyEmotional.stress || 1;
              const burnout = store.dailyEmotional.burnout || 1;
              const anxiety = store.dailyEmotional.anxiety || 1;

              const avg = (stress + burnout + anxiety) / 3;
              let statusLabel = t('wellnessHub.emotionalBalanced', 'Emotional Balance');
              let message = t('wellnessHub.emotionalBalancedDesc', 'Your emotional levels are light and steady today. Keep up this beautiful state, Sakhi!');
              let chatPrompt = `Hi AI Sakhi, I just tracked my emotional levels: Stress is ${stress}/5, Burnout is ${burnout}/5, and Anxiety is ${anxiety}/5. Can you suggest some positive daily habits for emotional wellness?`;

              if (avg >= 4) {
                statusLabel = t('wellnessHub.emotionalHigh', 'High Stress Detected ⚠️');
                message = t('wellnessHub.emotionalHighDesc', 'Your emotional tracker shows elevated stress and anxiety. Let\'s try a relaxing meditation to calm your nervous system.');
                chatPrompt = `Hi AI Sakhi, I logged high emotional ratings: Stress is ${stress}/5, Burnout is ${burnout}/5, and Anxiety is ${anxiety}/5. I am feeling overwhelmed. Can you guide me right now?`;
              } else if (avg >= 2.5) {
                statusLabel = t('wellnessHub.emotionalModerate', 'Moderate Tension 🌿');
                message = t('wellnessHub.emotionalModerateDesc', 'You are experiencing moderate stress today. Taking a short break and breathing deeply will help restore balance.');
                chatPrompt = `Hi AI Sakhi, I logged moderate emotional ratings: Stress is ${stress}/5, Burnout is ${burnout}/5, and Anxiety is ${anxiety}/5. What are some small steps I can take to relax?`;
              }

              setRecommendationData({
                type: 'emotional',
                statusLabel,
                message,
                chatPrompt
              });
            }}
            className="w-full mt-4 py-4 bg-[#ff69b4] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-100/50 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            📊 {t('wellnessHub.saveAndAnalyze', 'Save & Analyze Health')}
          </button>
        </>
      )
    },
    relationships: {
      title: t('wellnessHub.relationshipsTitle', 'Family relationship health'),
      body: (
        <>
          <p className="text-sm text-[#9A8A8E] mb-4">{t('wellnessHub.relationshipsDesc', 'How did home feel this week? 1 = difficult, 5 = warm.')}</p>
          {renderScale(t('wellnessHub.communication', 'Communication'), store.relationshipHealth.communication, (v) =>
            store.setRelationshipHealth({ communication: v })
          )}
          {renderScale(t('wellnessHub.emotionalConnection', 'Emotional connection'), store.relationshipHealth.connection, (v) =>
            store.setRelationshipHealth({ connection: v })
          )}
          {renderScale(t('wellnessHub.conflictLevel', 'Conflict level'), store.relationshipHealth.conflict, (v) =>
            store.setRelationshipHealth({ conflict: v })
          )}
          {renderScale(t('wellnessHub.supportReceived', 'Support received'), store.relationshipHealth.support, (v) =>
            store.setRelationshipHealth({ support: v })
          )}
          <Link to="/app/family-connect" className="inline-block mt-4 text-[10px] font-black uppercase text-[#ff69b4]">
            {t('wellnessHub.familyConnectTools', 'Family connect tools →')}
          </Link>
        </>
      )
    },
    journal: {
      title: t('wellnessHub.journalTitle', 'Mental wellness journal'),
      body: (
        <>
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder={t('wellnessHub.journalPlaceholder', 'What is on your heart today?')}
            className="w-full min-h-[120px] p-4 rounded-2xl border border-rose-100 text-sm resize-y mb-3"
          />
          <input
            value={moodTag}
            onChange={(e) => setMoodTag(e.target.value)}
            placeholder={t('wellnessHub.moodTagPlaceholder', 'Mood tag (optional)')}
            className="w-full p-3 rounded-xl border border-rose-100 text-sm mb-3"
          />
          <button
            type="button"
            disabled={!journalText.trim()}
            onClick={() => {
              if (!journalText.trim()) return;
              store.addJournalEntry(journalText, moodTag);

              const textLower = journalText.toLowerCase();
              let statusLabel = t('wellnessHub.welldone', 'Mindful Reflection');
              let message = t('wellnessHub.journalSuccessDesc', 'Logging your thoughts helps clear your mind. Let\'s continue this positive practice with some calming mindfulness.');
              let chatPrompt = `Hi AI Sakhi, I just logged a journal entry: "${journalText}". I want to talk about this and understand how I can practice self-care today.`;

              if (textLower.includes('stress') || textLower.includes('anxious') || textLower.includes('sad') || textLower.includes('worry') || textLower.includes('depress') || textLower.includes('burnout')) {
                statusLabel = t('wellnessHub.supportNeeded', 'Gentle Support Recommended');
                message = t('wellnessHub.journalAnxiousDesc', 'It sounds like you have some heavy thoughts on your mind today, Sakhi. You don\'t have to go through this alone.');
                chatPrompt = `Hi AI Sakhi, I logged a journal entry because I am feeling stressed/anxious: "${journalText}". Can you guide me with some self-care tips or breathing exercises to calm down?`;
              }

              setRecommendationData({
                type: 'journal',
                statusLabel,
                message,
                chatPrompt
              });

              setJournalText('');
              setMoodTag('');
            }}
            className="px-6 py-2.5 rounded-full bg-[#ff69b4] text-white text-[10px] font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('wellnessHub.saveEntry', 'Save entry')}
          </button>
          <div className="mt-6 space-y-3 max-h-[320px] overflow-y-auto">
            {store.journalEntries.map((e) => (
              <div key={e.id} className="p-4 rounded-2xl bg-rose-50/80 border border-rose-50">
                <p className="text-xs text-[#9A8A8E] mb-1">{new Date(e.date).toLocaleDateString()}</p>
                <p className="text-sm text-[#15192c]">{e.text}</p>
                {e.moodTag && <p className="text-[10px] font-black text-[#ff69b4] mt-1">#{e.moodTag}</p>}
              </div>
            ))}
          </div>
        </>
      )
    },
    goals: {
      title: t('wellnessHub.goalsTitle', 'Family goals'),
      body: (
        <>
          <div className="flex gap-2 mb-4">
            <input
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder={t('wellnessHub.goalPlaceholder', 'One small goal for the family...')}
              className="flex-1 p-3 rounded-xl border border-rose-100 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                store.addFamilyGoal(goalText);
                setGoalText('');
              }}
              className="px-4 py-2 rounded-xl bg-[#15192c] text-white text-[10px] font-black uppercase shrink-0"
            >
              {t('wellnessHub.add', 'Add')}
            </button>
          </div>
          <ul className="space-y-2">
            {store.familyGoals.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => store.toggleFamilyGoal(g.id)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-medium ${
                    g.done ? 'bg-emerald-50 border-emerald-100 line-through opacity-70' : 'bg-white border-rose-50'
                  }`}
                >
                  {g.title}
                </button>
              </li>
            ))}
          </ul>
        </>
      )
    }
  };

  const mod = content[slug];
  if (!mod) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-[#9A8A8E]">{t('wellnessHub.moduleNotFound', 'Module not found.')}</p>
        <button type="button" onClick={() => navigate('/app/wellness')} className="mt-4 text-[#ff69b4] font-black text-xs uppercase">
          {t('wellnessHub.backToHub', 'Back to hub')}
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto pb-12">
      <button
        type="button"
        onClick={() => navigate('/app/wellness')}
        className="flex items-center gap-1 text-[10px] font-black uppercase text-[#ff69b4] mb-6"
      >
        <ChevronLeft size={14} /> {t('wellnessHub.backBtn', 'Wellness Hub')}
      </button>
      <h1 className="text-xl sm:text-2xl font-black text-[#15192c] mb-6">{mod.title}</h1>
      <div className="p-5 sm:p-6 rounded-[2rem] bg-white border border-rose-50 shadow-sm">{mod.body}</div>

      {/* ── Recommendation Modal ── */}
      <AnimatePresence>
        {recommendationData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRecommendationData(null)}
              className="absolute inset-0 bg-[#15192c]/40 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white rounded-[3rem] p-8 relative z-10 shadow-2xl overflow-hidden border border-rose-50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <button
                type="button"
                onClick={() => setRecommendationData(null)}
                className="absolute top-6 right-6 text-[#C4A0AC] hover:text-[#15192c] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="relative z-10 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#ff69b4] mx-auto shadow-inner mb-2">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl font-black text-[#15192c]">
                    {recommendationData.type === 'journal' 
                      ? t('wellnessHub.journalSavedTitle', 'Journal Entry Saved! ✨')
                      : t('wellnessHub.analysisSavedTitle', 'Analysis Complete! 📊')
                    }
                  </h3>
                  <p className="text-[10px] font-bold text-[#C4A0AC] uppercase tracking-widest">
                    {t('wellnessHub.sakhiCare', "AI Sakhi's Recommendation")}
                  </p>
                </div>

                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100/50 text-center space-y-2">
                  <p className="text-xs font-bold text-[#ff69b4] uppercase tracking-wider">
                    {recommendationData.statusLabel}
                  </p>
                  <p className="text-xs text-[#15192c]/80 leading-relaxed font-medium">
                    {recommendationData.message}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRecommendationData(null);
                      navigate('/app/ai-sakhi', { state: { initialMessage: recommendationData.chatPrompt } });
                    }}
                    className="w-full py-4 bg-[#ff69b4] text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-rose-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    💬 {t('wellnessHub.chatPromptBtn', 'Consult AI Sakhi')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRecommendationData(null);
                      navigate('/app/books');
                    }}
                    className="w-full py-4 bg-white border border-rose-100 text-[#ff69b4] hover:bg-rose-50 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    📖 {t('wellnessHub.booksPromptBtn', 'Explore Wellness Books')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WellnessModuleScreen;

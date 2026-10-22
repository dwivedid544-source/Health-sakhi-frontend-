import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, PlayCircle, Headphones, Sparkles, Heart, ExternalLink } from 'lucide-react';
import { useWellnessStore } from '../../store/wellnessStore';
import { useLanguage } from '../../context/LanguageContext';
import memberApi from '../../api/memberApi';
import { resolveMediaUrl } from '../../api/contentAssetApi';

const EmotionalCheckInModal = ({ open, onClose }) => {
  const { t } = useLanguage();
  const [feeling, setFeeling] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const { addGratitude, markCheckInToday } = useWellnessStore();

  if (!open) return null;

  const handleSubmit = async () => {
    if (!feeling.trim()) return;

    try {
      setLoading(true);
      // 1. Submit check-in to AI backend
      const res = await memberApi.dailyCheckIn(feeling.trim());
      
      if (res && res.success) {
        setAiResponse(res.ai_response);
        setRecommendations(res.recommendations || []);
        setShowResult(true);

        // 2. Update local state
        addGratitude(`Feeling: ${feeling.trim()}`);
        markCheckInToday();
      }
    } catch (err) {
      console.error('Daily check-in failed:', err);
      // Fallback
      setAiResponse("I hear you, Sakhi. I'm here to support you on your health and wellness journey. Let's work on this together.");
      setRecommendations([]);
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFeeling('');
    setAiResponse('');
    setRecommendations([]);
    setShowResult(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-[2rem] p-6 shadow-2xl border border-rose-50"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase text-[#ff69b4] tracking-widest">{t('checkIn.badge', 'Daily check-in')}</p>
              <h2 className="text-lg font-black text-[#15192c]">
                {showResult ? "Sakhi Support Panel" : t('checkIn.title', 'How are you really feeling?')}
              </h2>
            </div>
            <button type="button" onClick={handleClose} className="p-2 rounded-full hover:bg-rose-50" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          {loading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#ff69b4]"
              >
                <Heart size={32} fill="currentColor" />
              </motion.div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">
                AI Sakhi is listening...
              </p>
            </div>
          ) : showResult ? (
            /* AI Results & Recommendations */
            <div className="space-y-6">
              {/* Compassionate AI Bubble */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border-l-4 border-[#ff69b4] text-xs font-bold text-slate-700 leading-relaxed">
                <div className="flex items-center gap-1 mb-2 text-[#ff69b4]">
                  <Sparkles size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">AI Sakhi Response</span>
                </div>
                "{aiResponse}"
              </div>

              {/* Recommendations */}
              {recommendations && recommendations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Heart size={12} className="text-[#ff69b4]" />
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      Relaxation Resources for You
                    </p>
                  </div>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-rose-100 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-[#ff69b4]">
                            {rec.type === 'book' ? (
                              <BookOpen size={16} />
                            ) : rec.type === 'video' || rec.type === 'interactive' ? (
                              <PlayCircle size={16} />
                            ) : (
                              <Headphones size={16} />
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{rec.title}</h4>
                            <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">
                              {rec.category || 'Wellness'} · {rec.type}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (rec.mediaUrl) {
                              window.open(resolveMediaUrl(rec.mediaUrl), '_blank');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#ff69b4] hover:border-rose-200 transition-all cursor-pointer"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3.5 rounded-full bg-[#ff69b4] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200/50 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Acknowledge with Love
              </button>
            </div>
          ) : (
            /* Form View */
            <div className="space-y-4">
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder={t('checkIn.placeholder', 'No judgment — just honesty...')}
                className="w-full min-h-[100px] p-4 rounded-2xl border border-rose-100 text-sm resize-none outline-none focus:border-[#ff69b4] transition-colors shadow-inner"
              />
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3.5 rounded-full bg-[#ff69b4] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200/50 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t('checkIn.save', 'Save with kindness')}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmotionalCheckInModal;

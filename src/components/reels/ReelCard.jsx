import React from 'react';
import { Volume2, VolumeX, Bookmark, MessageCircle, ChevronUp } from 'lucide-react';
import { getReelField } from '../../data/reelsData';

const ReelCard = ({
  reel,
  langCode,
  isPlaying,
  isSaved,
  onListen,
  onStop,
  onSave,
  onAskSakhi,
  swipeHint,
  mySceneLabel,
  askSakhiLabel
}) => {
  const title = getReelField(reel, 'title', langCode);
  const caption = getReelField(reel, 'caption', langCode);

  return (
    <section
      className={`relative w-full h-full min-h-[100dvh] snap-start snap-always flex flex-col justify-end overflow-hidden bg-gradient-to-br ${reel.gradient}`}
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-8 w-32 h-32 bg-[#ff69b4]/20 rounded-full blur-2xl" />
      </div>

      <div className="absolute top-20 sm:top-24 left-0 right-0 flex justify-center pointer-events-none z-10 px-4">
        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2">
          <ChevronUp size={14} className="animate-bounce" />
          {swipeHint}
        </p>
      </div>

      <div className="relative z-20 flex-1 flex items-center justify-center px-6 sm:px-10">
        <span className="text-7xl sm:text-8xl drop-shadow-2xl" role="img" aria-hidden>
          {reel.emoji}
        </span>
      </div>

      <div className="relative z-20 px-5 sm:px-8 pb-8 sm:pb-12 pt-16 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
        <div className="flex gap-3 sm:gap-4 max-w-2xl mx-auto w-full">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ffb3d1] mb-2">
              health sakhi • Family Wellness
            </p>
            <h2 className="text-white font-black text-xl sm:text-2xl md:text-3xl leading-tight mb-3">
              {title}
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed font-medium">
              {caption}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:gap-5 shrink-0 pb-2">
            <button
              type="button"
              onClick={isPlaying ? onStop : onListen}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
              aria-label={isPlaying ? 'Stop audio' : 'Listen'}
            >
              {isPlaying ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
            <button
              type="button"
              onClick={onSave}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${isSaved
                ? 'bg-[#ff69b4] border-[#ff69b4] text-white'
                : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                }`}
              aria-label="Save reel"
            >
              <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              onClick={onAskSakhi}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ff69b4] border border-[#ff69b4] flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all"
              aria-label="Ask AI Sakhi"
            >
              <MessageCircle size={22} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-full bg-white/15 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-white/25 transition-all"
          >
            {mySceneLabel}
          </button>
          <button
            type="button"
            onClick={onAskSakhi}
            className="px-4 py-2 rounded-full bg-white text-[#ff69b4] text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all"
          >
            {askSakhiLabel}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReelCard;

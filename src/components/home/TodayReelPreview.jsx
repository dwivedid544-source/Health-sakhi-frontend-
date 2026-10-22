import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { getTodayReel, getReelField } from '../../data/reelsData';
import { useLanguage } from '../../context/LanguageContext';
import { useTTS } from '../../hooks/useTTS';

const TodayReelPreview = () => {
  const { langCode, language, t } = useLanguage();
  const reel = getTodayReel();
  const { speak, stop, isPlaying } = useTTS();

  if (!reel) return null;

  const title = getReelField(reel, 'title', langCode);
  const caption = getReelField(reel, 'caption', langCode);

  const handleListen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlaying) {
      stop();
    } else {
      speak(`${title}. ${caption}`, language?.voice || 'en-US');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#4a1942] via-[#7b2d5e] to-[#2d1b3d] rounded-[2rem] p-5 sm:p-6 shadow-lg relative overflow-hidden h-full min-h-[180px] flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#ffb3d1] mb-2 flex items-center gap-2">
          <span className="text-lg">{reel.emoji}</span>
          {t('home.todayReel')}
        </p>
        <h4 className="text-white font-black text-base sm:text-lg leading-snug line-clamp-2 mb-2">
          {title}
        </h4>
        <p className="text-white/75 text-xs sm:text-sm line-clamp-2 leading-relaxed">{caption}</p>
      </div>
      <div className="flex items-center gap-2 mt-4 relative z-10">
        <button
          type="button"
          onClick={handleListen}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest border border-white/25 hover:bg-white/30 transition-all"
        >
          <Play size={14} fill="currentColor" />
          {t('home.listenReel')}
        </button>
        <Link
          to={`/app/reels?reel=${reel.id}`}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full bg-white text-[#ff69b4] text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all"
        >
          {t('home.watchAll')}
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default TodayReelPreview;

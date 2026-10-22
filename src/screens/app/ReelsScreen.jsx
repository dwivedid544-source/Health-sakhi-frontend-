import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ReelFeed from '../../components/reels/ReelFeed';
import { useLanguage } from '../../context/LanguageContext';

const ReelsScreen = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const reelId = searchParams.get('reel');

  return (
    <div className="fixed inset-0 z-[50] bg-black">
      <Link
        to="/app"
        className="absolute top-[4.5rem] sm:top-24 left-4 z-[60] flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black/60 transition-all"
      >
        <ChevronLeft size={16} />
        {t('nav.home')}
      </Link>
      <div className="absolute top-[4.5rem] sm:top-24 right-4 z-[60] pointer-events-none">
        <p className="text-white/80 text-[10px] font-black uppercase tracking-widest text-right">
          {t('reels.title')}
        </p>
        <p className="text-white/50 text-[9px] font-bold">{t('reels.subtitle')}</p>
      </div>
      <ReelFeed initialReelId={reelId || undefined} />
    </div>
  );
};

export default ReelsScreen;

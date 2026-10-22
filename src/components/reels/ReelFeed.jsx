import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reelsList, getReelField } from '../../data/reelsData';
import { useWellnessStore } from '../../store/wellnessStore';
import { useLanguage } from '../../context/LanguageContext';
import { useTTS } from '../../hooks/useTTS';
import contentApi from '../../api/contentApi';
import ReelCard from './ReelCard';
import VideoReelCard from './VideoReelCard';

// Build an infinitely-extendable pool of video reels by cycling
const getVideoPool = (shortsList, extraCount = 0) => {
  if (!shortsList || shortsList.length === 0) return [];
  const pool = [...shortsList];
  // If more are needed (infinite scroll), cycle through with new IDs
  for (let i = 0; i < extraCount; i++) {
    const src = shortsList[i % shortsList.length];
    pool.push({ ...src, id: `${src.id}_ext${i}` });
  }
  return pool;
};

// Merge text reels + video reels: pattern = 2 text → 1 video → 2 text → 1 video
const buildFeed = (textReels, videoPool) => {
  const merged = [];
  let vi = 0;
  for (let ti = 0; ti < textReels.length; ti++) {
    merged.push({ ...textReels[ti], type: 'text' });
    if ((ti + 1) % 2 === 0 && vi < videoPool.length) {
      merged.push(videoPool[vi++]);
    }
  }
  while (vi < videoPool.length) merged.push(videoPool[vi++]);
  return merged;
};

// ── ReelFeed Component ─────────────────────────────────────────────────────────
const ReelFeed = ({ initialReelId = null, compact = false }) => {
  const navigate = useNavigate();
  const { langCode, language, t } = useLanguage();
  const { speak, stop, isPlaying } = useTTS();
  const markWatched = useWellnessStore((s) => s.markReelWatched);
  const toggleSave = useWellnessStore((s) => s.toggleSaveReel);
  const isReelSaved = useWellnessStore((s) => s.isReelSaved);

  const [dbShorts, setDbShorts] = useState([]);
  const [extraVideoCount, setExtraVideoCount] = useState(0);
  const [activeId, setActiveId] = useState(initialReelId || '');
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch YouTube Shorts from Database on Mount
  useEffect(() => {
    let cancelled = false;
    const fetchShorts = async () => {
      try {
        const data = await contentApi.getYoutubeVideos('', 1, 100, 'short');
        if (!cancelled && data.videos && data.videos.length > 0) {
          const mapped = data.videos.map(video => ({
            id: video.youtubeId,
            type: 'video',
            youtubeId: video.youtubeId,
            label: video.title,
            category: video.keyword ? video.keyword.split(' ')[0] : 'Motivation'
          }));
          setDbShorts(mapped);
          
          const hasInitial = mapped.some(item => item.id === initialReelId);
          if (hasInitial) {
            setActiveId(initialReelId);
          } else {
            setActiveId(mapped[0].id);
          }
        }
      } catch (err) {
        console.error('[Reels] Failed to fetch live shorts from DB:', err);
      }
    };
    fetchShorts();
    return () => { cancelled = true; };
  }, [initialReelId]);

  const videoPool = getVideoPool(dbShorts, extraVideoCount);
  const feed = videoPool;

  const handleScroll = useCallback(
    (e) => {
      const el = e.target;
      const idx = Math.round(el.scrollTop / el.clientHeight);
      const item = feed[idx];
      if (item && item.id !== activeId) {
        setActiveId(item.id);
        if (item.type === 'text') markWatched(item.id);
      }
      // Infinite scroll: trigger when within 3 cards from the bottom
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - el.clientHeight * 3;
      if (nearBottom && !loadingMore) {
        setLoadingMore(true);
        setTimeout(() => {
          setExtraVideoCount((prev) => prev + (dbShorts.length || 10));
          setLoadingMore(false);
        }, 800); // brief simulated delay
      }
    },
    [feed, activeId, markWatched, loadingMore]
  );

  const handleListen = (reel) => {
    const text = `${getReelField(reel, 'title', langCode)}. ${getReelField(reel, 'caption', langCode)}`;
    speak(text, language?.voice || 'en-US');
  };

  const handleAskSakhi = (reel) => {
    stop();
    const prompt =
      getReelField(reel, 'sakhiPrompt', langCode) || getReelField(reel, 'sakhiPrompt', 'en');
    sessionStorage.setItem('hs_sakhi_pending_prompt', prompt);
    navigate('/app/ai-sakhi');
  };
  if (dbShorts.length === 0) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-black text-white gap-3">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Loading Reels...</p>
      </div>
    );
  }

  // Compact mode
  if (compact) {
    const reel = feed[0];
    if (!reel) return null;
    if (reel.type === 'video') {
      return <VideoReelCard key={reel.id} video={reel} isActive />;
    }
    return (
      <ReelCard
        reel={reel}
        langCode={langCode}
        isPlaying={isPlaying && activeId === reel.id}
        isSaved={isReelSaved(reel.id)}
        onListen={() => handleListen(reel)}
        onStop={stop}
        onSave={() => toggleSave(reel.id)}
        onAskSakhi={() => handleAskSakhi(reel)}
        swipeHint={t('reels.swipeHint')}
        mySceneLabel={t('reels.myScene')}
        askSakhiLabel={t('reels.askSakhi')}
      />
    );
  }

  return (
    <div
      className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory overscroll-y-contain"
      onScroll={handleScroll}
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {feed.map((item) =>
        item.type === 'video' ? (
          <VideoReelCard key={item.id} video={item} isActive={activeId === item.id} />
        ) : (
          <ReelCard
            key={item.id}
            reel={item}
            langCode={langCode}
            isPlaying={isPlaying && activeId === item.id}
            isSaved={isReelSaved(item.id)}
            onListen={() => { setActiveId(item.id); handleListen(item); }}
            onStop={stop}
            onSave={() => toggleSave(item.id)}
            onAskSakhi={() => handleAskSakhi(item)}
            swipeHint={t('reels.swipeHint')}
            mySceneLabel={t('reels.myScene')}
            askSakhiLabel={t('reels.askSakhi')}
          />
        )
      )}

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="snap-start h-[100dvh] flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#ff69b4] animate-spin" />
            </div>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest animate-pulse">
              Loading more...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelFeed;

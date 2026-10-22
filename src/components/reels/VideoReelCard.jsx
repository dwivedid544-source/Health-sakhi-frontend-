import React, { useState } from 'react';
import { Bookmark, ExternalLink, ChevronUp, Volume2, VolumeX } from 'lucide-react';

/**
 * VideoReelCard
 * Full-screen reel card that embeds a YouTube video via iframe.
 * Shorts-style: no YouTube controls, no progress bar, custom mute toggle.
 * Overlay divs cover YouTube's native bottom bar (share, clock, logo).
 */
const VideoReelCard = ({ video, isActive }) => {
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(true);

  // controls=0 → hides red seek bar
  // modestbranding=1 → reduces YouTube branding
  // rel=0, fs=0, iv_load_policy=3 → no related videos, no fullscreen btn, no annotations
  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=${isActive ? 1 : 0}&mute=${muted ? 1 : 0}&loop=1&playlist=${video.youtubeId}&controls=0&rel=0&playsinline=1&modestbranding=1&fs=0&iv_load_policy=3&disablekb=1`;

  const thumbnailUrl = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <section className="relative w-full h-[100dvh] snap-start snap-always overflow-hidden bg-black">

      {/* ── YouTube iframe / Thumbnail ── */}
      {isActive ? (
        <iframe
          key={`${video.youtubeId}-${muted}`}
          src={embedUrl}
          title={video.label}
          className="absolute inset-0 w-full h-full border-0 z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <img
          src={thumbnailUrl}
          alt={video.label}
          className="absolute inset-0 w-full h-full object-cover z-10 opacity-60 filter blur-[2px]"
        />
      )}

      {/* ── MASK: covers YouTube's bottom bar (share icon, clock, logo, progress line) ── */}
      {/* Bottom strip — covers share/clock/logo/progress completely */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{ height: '56px', background: '#000' }}
      />
      {/* Right side strip — covers YouTube logo watermark on right */}
      <div
        className="absolute bottom-0 right-0 z-20 pointer-events-none"
        style={{ width: '140px', height: '80px', background: '#000' }}
      />

      {/* ── Top gradient ── */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-30" />

      {/* ── Swipe hint ── */}
      <div className="absolute top-20 sm:top-24 left-0 right-0 flex justify-center pointer-events-none z-30 px-4">
        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2">
          <ChevronUp size={14} className="animate-bounce" />
          Swipe up for next
        </p>
      </div>

      {/* ── Bottom overlay: info + action buttons ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent">

        {/* Info + action buttons */}
        <div className="flex gap-3 max-w-2xl mx-auto w-full items-end px-5 pb-8 pt-20">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ffb3d1] mb-1">
              health sakhi • {video.category}
            </p>
            <h3 className="text-white font-black text-base sm:text-lg leading-tight drop-shadow-lg">
              {video.label}
            </h3>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-4 shrink-0 pb-1">
            {/* Mute / Unmute */}
            <button
              onClick={() => setMuted((m) => !m)}
              className="w-11 h-11 rounded-full backdrop-blur-md border border-white/30 bg-black/50 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Save */}
            <button
              onClick={() => setSaved((s) => !s)}
              className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${saved
                ? 'bg-[#ff69b4] border-[#ff69b4] text-white'
                : 'bg-black/50 border-white/30 text-white hover:bg-white/20'
                }`}
              aria-label="Save reel"
            >
              <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
            </button>

            {/* Open in YouTube */}
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              aria-label="Open in YouTube"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoReelCard;

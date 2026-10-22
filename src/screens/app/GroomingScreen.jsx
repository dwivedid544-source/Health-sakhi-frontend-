import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Star, Heart, Sparkles, ArrowRight, Play, CheckCircle2, ShoppingBag, X, Clock, ShieldCheck, Zap, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const GROOMING_TUTORIAL_VIDEO_URL = 'https://vjs.zencdn.net/v/oceans.mp4';

const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('embed/')) return url;
  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const GROOMING_VIDEOS = [
  {
    title: 'Daily Skincare & Hygiene Routine',
    description: 'A simple and effective daily skincare and hygiene guide for healthy, glowing skin.',
    videoUrl: 'https://www.youtube.com/embed/K7JSenLDgQ0',
    thumbnail: 'https://img.youtube.com/vi/K7JSenLDgQ0/hqdefault.jpg',
    points: 20
  },
  {
    title: 'Healthy Hair Care Rituals',
    description: 'Learn how to keep your hair healthy, shiny, and strong with proper daily care.',
    videoUrl: 'https://www.youtube.com/embed/4iX9xVy9MxE',
    thumbnail: 'https://img.youtube.com/vi/4iX9xVy9MxE/hqdefault.jpg',
    points: 25
  },
  {
    title: 'Posture & Confidence Body Language',
    description: 'Command respect and express confidence through proper posture and natural movement.',
    videoUrl: 'https://www.youtube.com/embed/pyk_nLiaZhs',
    thumbnail: 'https://img.youtube.com/vi/pyk_nLiaZhs/hqdefault.jpg',
    points: 20
  }
];

const getTodayVideo = () => {
  const today = new Date();
  const dayIndex = (today.getDate() + today.getMonth() * 31) % GROOMING_VIDEOS.length;
  return GROOMING_VIDEOS[dayIndex];
};

// ── Video Player Modal ──────────────────────────────────────────────────────
const VideoModal = ({ video, onClose }) => {
  const { t } = useLanguage();
  const videoRef = useRef(null);

  const localizeDb = (keyPath, str) => {
    if (!str) return '';
    const cleanKey = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t(`${keyPath}.${cleanKey}`, str);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const videoUrl = video.videoUrl || video.video || GROOMING_TUTORIAL_VIDEO_URL;
  const isYt = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('youtube-nocookie.com');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-start justify-center bg-[#15192c]/90 backdrop-blur-xl px-3 pb-6 pt-32 md:px-8 md:pb-10 md:pt-36 overflow-y-auto">
      <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}
        className="relative w-full max-w-6xl bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row lg:gap-3 max-h-[calc(100vh-7.5rem)]">
        <button onClick={onClose} aria-label="Close video modal"
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/85 border border-rose-100 flex items-center justify-center text-[#15192c] hover:bg-white transition-all shadow-md">
          <X size={20} />
        </button>
        <div className="flex-1 bg-black relative flex items-center justify-center min-h-[260px] md:min-h-[420px]">
          {isYt ? (
            <iframe 
              src={getEmbedUrl(videoUrl)} 
              className="w-full h-full border-none rounded-2xl" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              title={video.title}
            />
          ) : (
            <video 
              ref={videoRef} 
              key={video.title || "featured"}
              autoPlay 
              muted 
              playsInline
              controls 
              className="w-full h-full object-contain" 
              src={videoUrl} 
            />
          )}
        </div>
        <div className="w-full lg:w-80 p-6 pt-9 md:p-8 md:pt-12 flex flex-col border-t lg:border-t-0 lg:border-l-0 gap-6">
          <div className="space-y-6 mt-2 md:mt-4">
            <span className="px-3 py-1 bg-rose-50 text-[#ff69b4] rounded-lg text-[9px] font-black uppercase tracking-widest">{video.type || t('grooming.tutorial', 'Tutorial')}</span>
            <h3 className="text-2xl font-black text-[#15192c] leading-tight">{video.title}</h3>
            <p className="text-xs font-medium text-[#9A8A8E] leading-relaxed">
              {t('grooming.minimalistRoutineDesc', 'Sakhi, this minimalist routine is perfect for busy mornings. Focus on fresh skin and confident vibes.')}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-bold text-[#C4A0AC] uppercase tracking-widest">
                <Clock size={14} /> {t('grooming.fiveMinSession', '5 Minute Session')}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-[#ff69b4] uppercase tracking-widest">
                <Sparkles size={14} /> +20 {t('grooming.glowPoints', 'Glow Points')}
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-auto pb-2 md:pb-3">
            <button onClick={handleFullscreen} className="w-full py-3 border border-rose-200 text-[#15192c] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">
              {t('grooming.openFullscreen', 'Open Fullscreen')}
            </button>
            <button onClick={onClose} className="w-full py-4 bg-[#15192c] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
              {t('grooming.completeTutorial', 'Complete Tutorial')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Routine Detail Modal ────────────────────────────────────────────────────
const RoutineModal = ({ routine, onClose, onComplete }) => {
  const { t } = useLanguage();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#15192c]/80 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16" />
        <button onClick={onClose} className="absolute top-6 right-6 text-[#C4A0AC] hover:text-[#15192c] transition-colors">
          <X size={20} />
        </button>
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff69b4]">
              <Scissors size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">{t('grooming.dailyRitual', 'Daily Ritual')}</p>
              <h3 className="text-2xl font-black text-[#15192c]">{routine.name}</h3>
            </div>
          </div>
          <div className="space-y-4">
             {routine.steps.map((step, idx) => (
               <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl border border-rose-50 bg-rose-50/20">
                  <div className="w-6 h-6 rounded-full bg-white border border-rose-100 flex items-center justify-center text-[10px] font-black text-[#ff69b4] flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-bold text-[#15192c] leading-relaxed">{step}</p>
               </div>
             ))}
          </div>
          <button onClick={() => { onComplete(routine.id); onClose(); }}
            className="w-full py-5 bg-[#ff69b4] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-rose-100">
            {t('grooming.markAsCompleted', 'Mark as Completed ✨')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Guide Content Modal ─────────────────────────────────────────────────────
const GuideModal = ({ guide, onClose }) => {
  const { t } = useLanguage();
  const guideVideoRef = useRef(null);

  const localizeDb = (keyPath, str) => {
    if (!str) return '';
    const cleanKey = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t(`${keyPath}.${cleanKey}`, str);
  };

  const handleGuideFullscreen = () => {
    if (!guideVideoRef.current) return;
    if (guideVideoRef.current.requestFullscreen) {
      guideVideoRef.current.requestFullscreen();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-start justify-center bg-[#15192c]/90 backdrop-blur-md px-3 pb-6 pt-28 md:px-6 md:pb-10 md:pt-32 overflow-y-auto">
      <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}
        className="w-full max-w-3xl bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[calc(100vh-7.5rem)]">
        <button onClick={onClose} aria-label="Close guide modal"
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white border border-rose-100 text-[#C4A0AC] hover:text-[#ff69b4] transition-colors shadow-md flex items-center justify-center">
          <X size={20} />
        </button>
        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-4 block">{t('grooming.type.' + guide.type, guide.type)}</span>
          <h3 className="text-3xl font-black text-[#15192c] mb-8 leading-tight pr-10">{guide.title}</h3>
          
          {guide.video ? (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-3xl overflow-hidden mb-2">
                {(() => {
                  const guideVideoUrl = guide.video || GROOMING_TUTORIAL_VIDEO_URL;
                  const isGuideYt = guideVideoUrl.includes('youtube.com') || guideVideoUrl.includes('youtu.be') || guideVideoUrl.includes('youtube-nocookie.com');
                  return isGuideYt ? (
                    <iframe 
                      src={getEmbedUrl(guideVideoUrl)} 
                      className="w-full h-full border-none rounded-3xl" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      title={guide.title}
                    />
                  ) : (
                    <video 
                      ref={guideVideoRef} 
                      key={guide.title || "guide"}
                      autoPlay 
                      muted 
                      playsInline
                      controls 
                      className="w-full h-full object-contain" 
                      src={guideVideoUrl} 
                    />
                  );
                })()}
              </div>
              <button onClick={handleGuideFullscreen} className="px-5 py-2.5 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#15192c] hover:bg-rose-50 transition-all">
                {t('grooming.openFullscreen', 'Open Fullscreen')}
              </button>
            </div>
          ) : (
            <div className="space-y-6 text-[#6B5E63] text-sm font-medium leading-relaxed">
              <p>{t('grooming.scentDesc', "Choosing a signature scent is like finding your second skin, Sakhi. It's an extension of your personality that lingers long after you leave the room.")}</p>
              <h4 className="font-black text-[#15192c] text-lg mt-8">{t('grooming.baseNotes', 'The Base Notes')}</h4>
              <p>{t('grooming.fragranceDesc', 'Start by understanding the fragrance families. Floral, Woody, Oriental, or Fresh? Your mood often dictates what works best.')}</p>
              <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 italic">
                {t('grooming.fragranceQuote', '"Fragrance is the first garment we put on our skin." — Dr. Aditi Rao')}
              </div>
              <p>{t('grooming.testPulseDesc', 'Always test on your pulse points and wait for 20 minutes to let the heart notes emerge before making a decision.')}</p>
            </div>
          )}
        </div>
        <div className="p-6 md:p-8 bg-rose-50/50 border-t border-rose-100 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-[#C4A0AC] uppercase">
            <BookOpen size={14} /> {t('grooming.fourMinRead', '4 Min Read')}
          </div>
          <button onClick={onClose} className="px-8 py-3 bg-[#15192c] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
            {t('grooming.closeGuide', 'Close Guide')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Kit Recommendation Modal ───────────────────────────────────────────────
const KitModal = ({ onClose, onOrder }) => {
  const { t } = useLanguage();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#15192c]/80 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#CCAA3D]/10 rounded-full blur-3xl -mr-24 -mt-24" />
        <button onClick={onClose} className="absolute top-8 right-8 text-[#C4A0AC] hover:text-[#CCAA3D] transition-colors">
          <X size={24} />
        </button>
        
        <div className="text-center mb-10">
           <div className="w-16 h-16 rounded-[2rem] bg-[#CCAA3D]/10 text-[#CCAA3D] flex items-center justify-center shadow-sm mx-auto mb-6">
              <ShoppingBag size={32} />
           </div>
           <h3 className="text-2xl font-black text-[#15192c]">{t('grooming.tailoredKit', 'Your Tailored Kit')}</h3>
           <p className="text-xs font-bold text-[#C4A0AC] uppercase tracking-widest mt-2">{t('grooming.recommendedEssentials', 'Recommended Essentials')}</p>
        </div>

        <div className="space-y-4 mb-10">
           {[
             { name: t('grooming.kit.item1.name', 'Hydrating Glow Serum'), brand: t('grooming.kit.item1.brand', 'Sakhi Essentials'), price: '₹850' },
             { name: t('grooming.kit.item2.name', 'Mineral Sunscreen SPF 50'), brand: t('grooming.kit.item2.brand', 'Skin Shield'), price: '₹1,200' },
             { name: t('grooming.kit.item3.name', 'Rosewater Facial Mist'), brand: t('grooming.kit.item3.brand', 'Natural Glow'), price: '₹450' }
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between p-5 bg-stone-50 rounded-3xl border border-stone-100 hover:border-[#CCAA3D]/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#CCAA3D] font-black text-xs">#{i+1}</div>
                   <div>
                      <h4 className="text-[13px] font-black text-[#15192c]">{item.name}</h4>
                      <p className="text-[10px] font-bold text-[#C4A0AC] uppercase tracking-widest">{item.brand}</p>
                   </div>
                </div>
                <span className="text-[12px] font-black text-[#CCAA3D]">{item.price}</span>
             </div>
           ))}
        </div>

        <button onClick={onOrder} className="w-full py-5 bg-[#CCAA3D] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#CCAA3D]/20 hover:scale-[1.02] transition-all">
           {t('grooming.orderEntireKit', 'Order Entire Kit')}
        </button>
      </motion.div>
    </motion.div>
  );
};

const GroomingScreen = () => {
  const { t } = useLanguage();
  const todayVideo = getTodayVideo();
  const [showVideo, setShowVideo] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showKitModal, setShowKitModal] = useState(false);
  const [glowScore, setGlowScore] = useState(74);
  const [customTutorials, setCustomTutorials] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleOrderKit = () => {
    setShowKitModal(false);
    setToastMsg(t('grooming.orderSuccess', 'Tailored Beauty Kit Ordered Successfully! 🛍️'));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  const [routines, setRoutines] = useState([
    { id: 1, name: 'Morning Glow Routine', duration: '15 min', intensity: 'Gentle', progress: 100, steps: ['Cleanse with lukewarm water', 'Apply Vitamin C serum', 'Moisturize & SPF 50', 'Quick lip tint'] },
    { id: 2, name: 'Hair Care Ritual', duration: '45 min', intensity: 'Deep', progress: 40, steps: ['Detangle gently', 'Scalp massage (3 mins)', 'Leave-in conditioner', 'Natural air dry'] },
    { id: 3, name: 'Evening Recovery', duration: '20 min', intensity: 'Calm', progress: 0, steps: ['Double cleanse', 'Hydrating face mask', 'Night repair cream', 'Hand & foot cream'] },
  ]);

  const localizeDb = (keyPath, str) => {
    if (!str) return '';
    const cleanKey = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t(`${keyPath}.${cleanKey}`, str);
  };

  // --- Real-time Sync with Backend ---
  const fetchCustomContent = React.useCallback(async () => {
    try {
      const res = await contentApi.getSakhiContent('grooming');
      if (res.success && res.content) {
        const groomingContent = res.content.map(item => {
          const fullMediaUrl = resolveMediaUrl(item.mediaUrl);
          const isVideo = fullMediaUrl?.match(/\.(mp4|webm)$/i);
          return {
            ...item,
            id: `custom-${item.id}`,
            image: isVideo ? null : fullMediaUrl,
            fallbackImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=2000',
            video: isVideo ? fullMediaUrl : null,
            type: item.category || 'Tutorial'
          };
        });
        setCustomTutorials(groomingContent);
      }
    } catch (err) {
      console.error('Error fetching grooming content:', err);
    }
  }, []);

  useEffect(() => {
    fetchCustomContent();
  }, [fetchCustomContent]);

  const handleComplete = (id) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, progress: 100 } : r));
    setGlowScore(prev => Math.min(100, prev + 8));
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full pb-20 px-4 pt-10">

      <AnimatePresence>
        {showVideo && (
          <VideoModal 
            video={todayVideo} 
            onClose={() => { setShowVideo(false); setGlowScore(prev => Math.min(100, prev + (todayVideo.points || 5))); }} 
          />
        )}
        {selectedRoutine && (
          <RoutineModal 
            routine={selectedRoutine} 
            onClose={() => setSelectedRoutine(null)} 
            onComplete={handleComplete} 
          />
        )}
        {selectedGuide && (
          <GuideModal 
            guide={selectedGuide} 
            onClose={() => setSelectedGuide(null)} 
          />
        )}
        {showKitModal && (
          <KitModal 
            onClose={() => setShowKitModal(false)} 
            onOrder={handleOrderKit}
          />
        )}
      </AnimatePresence>

      <motion.section variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight text-[#15192c]">{t('grooming.groomingSakhi', 'Grooming Sakhi ✨')}</h2>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C4A0AC]">{t('grooming.selfCareConfidence', 'Self-Care & Confidence')}</span>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-4 bg-white border border-[#F5E6EA] rounded-3xl shadow-sm text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-1">{t('grooming.glowScore', 'Glow Score')}</p>
              <p className="text-xl font-black text-[#ff69b4]">{glowScore}%</p>
           </div>
        </div>
      </motion.section>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
           {/* Admin Curated Tutorials */}
           {customTutorials.length > 0 && (
             <motion.section variants={item}>
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8" style={{ color: '#C4A0AC' }}>{t('grooming.adminCuratedTutorials', 'Admin Curated Tutorials')}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {customTutorials.map((tutorial) => (
                   <div key={tutorial.id} onClick={() => { setSelectedGuide(tutorial); }}
                     className="bg-white p-6 rounded-[2.5rem] border border-[#F5E6EA] shadow-sm flex flex-col gap-4 group hover:shadow-xl transition-all cursor-pointer">
                      <div className="h-40 rounded-2xl overflow-hidden relative">
                         <img src={tutorial.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                         <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/90 text-[#15192c] flex items-center justify-center shadow-lg">
                               <Play size={16} fill="currentColor" />
                            </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
             </motion.section>
           )}

           {/* Featured Tutorial */}
           <motion.div variants={item} className="bg-[#15192c] rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff69b4]/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff69b4] mb-4 block">{t('grooming.newTutorial', 'New Tutorial')}</span>
                    <h3 className="text-3xl font-black mb-6 tracking-tight">{todayVideo.title}</h3>
                    <p className="text-sm text-white/50 mb-8 leading-relaxed font-medium">
                       {todayVideo.description}
                    </p>
                    <button onClick={() => setShowVideo(true)}
                      className="px-8 py-4 bg-[#ff69b4] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-3 hover:scale-105 transition-all">
                       <Play size={18} fill="currentColor" /> {t('grooming.watchVideo', 'Watch Video')}
                    </button>
                 </div>
                 <div onClick={() => setShowVideo(true)}
                   className="aspect-video rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <img src={todayVideo.thumbnail} alt="Grooming" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-16 h-16 rounded-full bg-white text-[#15192c] flex items-center justify-center shadow-2xl">
                          <Play size={24} fill="currentColor" className="ml-1" />
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* Self-Care Routines */}
           <motion.section variants={item}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8" style={{ color: '#C4A0AC' }}>{t('grooming.yourDailyRoutines', 'Your Daily Routines')}</h3>
               <div className="space-y-4">
                  {routines.map((routine, i) => {
                    const translatedName = t(`grooming.routines.routine${routine.id}.name`, routine.name);
                    const translatedDuration = t(`grooming.routines.routine${routine.id}.duration`, routine.duration);
                    const translatedIntensity = t(`grooming.routines.routine${routine.id}.intensity`, routine.intensity);
                    return (
                      <div key={i} onClick={() => setSelectedRoutine({ ...routine, name: translatedName, steps: t(`grooming.routines.routine${routine.id}.steps`, routine.steps) })}
                        className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6EA] shadow-sm flex items-center justify-between group hover:shadow-xl transition-all cursor-pointer">
                         <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${routine.progress === 100 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-[#ff69b4]'}`}>
                               {routine.progress === 100 ? <CheckCircle2 size={24} /> : <Scissors size={24} />}
                            </div>
                            <div>
                               <h4 className="text-lg font-black text-[#15192c]">{translatedName}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className="text-[9px] font-black uppercase text-[#C4A0AC]">{translatedDuration}</span>
                                 <span className="w-1 h-1 rounded-full bg-[#F5E6EA]"></span>
                                 <span className="text-[9px] font-black uppercase text-[#ff69b4]">{translatedIntensity}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <div className="h-1.5 w-32 bg-rose-50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${routine.progress}%` }}
                                className="h-full rounded-full" 
                                style={{ backgroundColor: routine.progress === 100 ? '#10b981' : '#ff69b4' }} 
                              />
                           </div>
                           <span className="text-[9px] font-black uppercase text-[#C4A0AC]">{routine.progress}% {t('grooming.completePercent', 'Complete')}</span>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </motion.section>
        </div>

        <div className="lg:col-span-4 space-y-10">
           {/* Glow Guide */}
           <motion.div variants={item} className="p-8 bg-white rounded-[3rem] border border-[#F5E6EA] shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C4A0AC] mb-6">{t('grooming.expertGlowGuides', 'Expert Glow Guides')}</h3>
              <div className="space-y-6">
                 {[
                   { title: t('grooming.guides.guide1.title', 'Choosing Your Signature Scent'), type: t('grooming.type.Article', 'Article') },
                   { title: t('grooming.guides.guide2.title', 'The Science of Hydration'), type: t('grooming.type.Video', 'Video'), video: 'https://vjs.zencdn.net/v/oceans.mp4' },
                   { title: t('grooming.guides.guide3.title', 'Confident Body Language'), type: t('grooming.type.Course', 'Course') },
                 ].map((guide, i) => (
                   <div key={i} onClick={() => setSelectedGuide(guide)}
                     className="flex flex-col group cursor-pointer">
                      <span className="text-[8px] font-black uppercase text-[#ff69b4] mb-1">{localizeDb('grooming.guides.db', guide.type)}</span>
                      <h4 className="text-[13px] font-bold text-[#15192c] group-hover:text-[#ff69b4] transition-colors">{localizeDb('grooming.guides.db', guide.title)}</h4>
                      <div className="flex items-center gap-2 mt-2 text-[#C4A0AC]">
                         <Star size={10} fill="currentColor" />
                         <span className="text-[9px] font-bold uppercase tracking-widest underline">{t('grooming.readGuide', 'Read Guide')}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </motion.div>

           {/* Beauty Kit Card */}
           <motion.div variants={item} className="p-10 rounded-[3.5rem] bg-gradient-to-br from-[#FFF9EE] to-[#FEF9E3] border border-[#F5E6EA] shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[2rem] bg-white text-[#CCAA3D] flex items-center justify-center shadow-sm mb-6">
                 <ShoppingBag size={28} />
              </div>
              <h3 className="text-xl font-black mb-3" style={{ color: '#15192c' }}>{t('grooming.buildYourKit', 'Build Your Kit')}</h3>
              <p className="text-xs font-bold leading-relaxed opacity-60 mb-8 italic font-medium">
                 {t('grooming.buildYourKitQuote', '"Invest in yourself. It pays the best interest."')}
              </p>
              <button onClick={() => setShowKitModal(true)}
                className="w-full py-4 bg-[#CCAA3D] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                 {t('grooming.tailoredRecommendations', 'Tailored Recommendations')}
              </button>
           </motion.div>
        </div>
      </main>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-[#15192c] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
            <CheckCircle2 size={16} className="text-[#ff69b4]" />
            <span className="text-[10px] font-bold uppercase tracking-widest tracking-tight">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GroomingScreen;

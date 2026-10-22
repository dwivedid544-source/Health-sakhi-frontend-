import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, PlayCircle, Clock, Sparkles, ChevronLeft, Heart, Shield, Star, Users, Utensils, X, Play, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import contentAssetApi, { resolveMediaUrl } from '../../api/contentAssetApi';
import contentApi from '../../api/contentApi';
import i18nApi from '../../api/i18nApi';

// Helper functions for batch translation traversal
const collectTexts = (mods) => {
  const texts = [];
  mods.forEach(m => {
    texts.push(m.title);
    texts.push(m.description || '');
    m.subcategories.forEach(sub => {
      texts.push(sub.title);
      sub.playlists.forEach(pl => {
        texts.push(pl.title);
        pl.videos.forEach(v => {
          texts.push(v.title);
          texts.push(v.description || '');
        });
      });
    });
  });
  return texts;
};

const applyTranslations = (mods, translations) => {
  let idx = 0;
  return mods.map(m => {
    const title = translations[idx++] || m.title;
    const description = translations[idx++] || m.description;
    const subcategories = m.subcategories.map(sub => {
      const subTitle = translations[idx++] || sub.title;
      const playlists = sub.playlists.map(pl => {
        const plTitle = translations[idx++] || pl.title;
        const videos = pl.videos.map(v => {
          const vTitle = translations[idx++] || v.title;
          const vDesc = translations[idx++] || v.description;
          return { ...v, title: vTitle, description: vDesc };
        });
        return { ...pl, title: plTitle, videos };
      });
      return { ...sub, title: subTitle, playlists };
    });
    return { ...m, title, description, subcategories };
  });
};

const ContentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, langCode } = useLanguage();
  const [expandedModule, setExpandedModule] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [customContent, setCustomContent] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [displayModules, setDisplayModules] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [subtitlesList, setSubtitlesList] = useState([]);
  // Related YouTube Videos State
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);
  const [ytPlayer, setYtPlayer] = useState(null);

  const videoRef = useRef(null);
  const initialSeekRef = useRef(0);

  const localize = (str) => {
    if (!str) return '';
    const key = 'explore.db.' + str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t(key, str);
  };

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setApiLoading(true);
        const res = await contentAssetApi.getPublicAssets({ status: 'Published' });
        if (res && res.success && res.data) {
          const filtered = res.data.filter(item => item.type === 'Video' || item.type === 'Interactive');
          setCustomContent(filtered.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            cat: item.category,
            status: item.status,
            mediaUrl: resolveMediaUrl(item.mediaUrl),
            description: item.description
          })));
        }
      } catch (err) {
        console.error('ContentScreen: Failed to load assets from API', err);
        // Fallback to localStorage
        const saved = localStorage.getItem('hs_custom_content');
        if (saved) setCustomContent(JSON.parse(saved).filter(item => item.type === 'Video' && item.status === 'Published'));
      } finally {
        setApiLoading(false);
      }
    };
    loadAssets();
  }, []);

  useEffect(() => {
    // Load completed videos from localStorage
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const completed = Object.entries(userProgress)
      .filter(([_, data]) => data.percent >= 100)
      .map(([title, _]) => title);
    setCompletedVideos(completed);

    // Deep link from Home screen category
    if (location.state?.category) {
      const match = modules.find(m => m.title.toLowerCase().includes(location.state.category.toLowerCase()));
      if (match) setExpandedModule(match.id);
    }
  }, [location.state]);

  // ── Realistic Content Data ──────────────────────────────────────────────────
  const modules = React.useMemo(() => {
    const baseModules = [
      {
        id: 0,
        title: 'Women Health Foundations',
        titleKey: 'library.mod.womenHealth',
        description: 'Understanding hormones, cycles, and biological transitions.',
        descKey: 'library.mod.womenHealthDesc',
        icon: Heart,
        color: '#ff69b4',
        bg: 'bg-rose-50/50',
        cat: 'Women Health',
        subcategories: [
          {
            title: 'Hormonal Mastery',
            titleKey: 'library.sub.hormonalMastery',
            playlists: [
              {
                title: 'The Endocrine System',
                titleKey: 'library.pl.endocrineSystem',
                videos: [
                  { title: 'Estrogen & Progesterone 101', titleKey: 'library.v.estrogen', duration: '15:20' },
                  { title: 'Thyroid Health in Women', titleKey: 'library.v.thyroid', duration: '12:45' },
                ]
              }
            ]
          },
          {
            title: 'Menstrual Wellness',
            titleKey: 'library.sub.menstrualWellness',
            playlists: [
              {
                title: 'Cycle Tracking',
                titleKey: 'library.pl.cycleTracking',
                videos: [
                  { title: 'The Four Phases Explained', titleKey: 'library.v.fourPhases', duration: '18:10' },
                  { title: 'Natural PMS Relief', titleKey: 'library.v.pmsRelief', duration: '10:30' },
                ]
              }
            ]
          }
        ]
      },
      {
        id: 1,
        title: 'Heart & Lifestyle',
        titleKey: 'library.mod.heartLifestyle',
        description: 'Strengthening your cardiovascular health through daily habits.',
        descKey: 'library.mod.heartLifestyleDesc',
        icon: Shield,
        color: '#f59e0b',
        bg: 'bg-orange-50/50',
        cat: 'Heart Care',
        subcategories: [
          {
            title: 'Cardio Vitality',
            titleKey: 'library.sub.cardioVitality',
            playlists: [
              {
                title: 'Heart Healthy Living',
                titleKey: 'library.pl.heartHealthy',
                videos: [
                  { title: 'Managing BP Naturally', titleKey: 'library.v.managingBP', duration: '14:20' },
                  { title: 'The Heart-Brain Connection', titleKey: 'library.v.heartBrain', duration: '09:15' },
                ]
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Mental Healing & Peace',
        titleKey: 'library.mod.mentalHealing',
        description: 'Techniques for emotional resilience and inner resonance.',
        descKey: 'library.mod.mentalHealingDesc',
        icon: Star,
        color: '#8b5cf6',
        bg: 'bg-purple-50/50',
        cat: 'Mental Healing',
        subcategories: [
          {
            title: 'Anxiety & Focus',
            titleKey: 'library.sub.anxietyFocus',
            playlists: [
              {
                title: 'Calming the Mind',
                titleKey: 'library.pl.calmingMind',
                videos: [
                  { title: '5-Minute SOS Breathwork', titleKey: 'library.v.breathwork', duration: '05:00' },
                  { title: 'Overcoming Overthinking', titleKey: 'library.v.overthinking', duration: '22:30' },
                ]
              }
            ]
          }
        ]
      },
      {
        id: 3,
        title: 'Relationship Resonance',
        titleKey: 'library.mod.relationships',
        description: 'Building healthy boundaries and emotional connections.',
        descKey: 'library.mod.relationshipsDesc',
        icon: Users,
        color: '#10b981',
        bg: 'bg-emerald-50/50',
        cat: 'Relationships',
        subcategories: [
          {
            title: 'Social Wellness',
            titleKey: 'library.sub.socialWellness',
            playlists: [
              {
                title: 'Healthy Boundaries',
                titleKey: 'library.pl.healthyBoundaries',
                videos: [
                  { title: 'How to Say No', titleKey: 'library.v.sayNo', duration: '12:00' },
                  { title: 'Navigating Conflict', titleKey: 'library.v.conflict', duration: '25:45' },
                ]
              }
            ]
          }
        ]
      },
      {
        id: 4,
        title: 'Cravings & Nutrition',
        titleKey: 'library.mod.cravings',
        description: 'Healing your relationship with food and emotional eating.',
        descKey: 'library.mod.cravingsDesc',
        icon: Utensils,
        color: '#ef4444',
        bg: 'bg-red-50/50',
        cat: 'Cravings',
        subcategories: [
          {
            title: 'Mindful Eating',
            titleKey: 'library.sub.mindfulEating',
            playlists: [
              {
                title: 'Understanding Cravings',
                titleKey: 'library.pl.understandingCravings',
                videos: [
                  { title: 'Hormonal Hunger vs Emotional Hunger', titleKey: 'library.v.hormonalHunger', duration: '16:20' },
                  { title: 'The Sugar Cycle', titleKey: 'library.v.sugarCycle', duration: '14:10' },
                ]
              }
            ]
          }
        ]
      }
    ];

    const BASELINE_TITLES = [
      'Estrogen & Progesterone 101',
      'Thyroid Health in Women',
      'The Four Phases Explained',
      'Natural PMS Relief',
      'Managing BP Naturally',
      'The Heart-Brain Connection',
      '5-Minute SOS Breathwork',
      'Overcoming Overthinking',
      'How to Say No',
      'Navigating Conflict',
      'Hormonal Hunger vs Emotional Hunger',
      'The Sugar Cycle'
    ];

    const dbLibraryVideos = customContent.filter(c => BASELINE_TITLES.includes(c.title));
    const customCuratedVideos = customContent.filter(c => !BASELINE_TITLES.includes(c.title));

    // Map dynamic database properties (id, mediaUrl, description) onto the baseline static videos
    const resolvedBaseModules = baseModules.map(module => ({
      ...module,
      subcategories: module.subcategories.map(sub => ({
        ...sub,
        playlists: sub.playlists.map(pl => ({
          ...pl,
          videos: pl.videos.map(v => {
            const matchedDb = dbLibraryVideos.find(db => db.title.toLowerCase() === v.title.toLowerCase());
            return {
              ...v,
              id: matchedDb ? matchedDb.id : null,
              mediaUrl: matchedDb ? matchedDb.mediaUrl : null,
              description: matchedDb ? matchedDb.description : v.description || '',
              type: 'Video'
            };
          })
        }))
      }))
    }));

    // Inject Curated Custom Content (Admin Curated Assets)
    return resolvedBaseModules.map(module => {
      const matchingCustom = customCuratedVideos.filter(c => c.cat === module.cat);
      if (matchingCustom.length > 0) {
        return {
          ...module,
          subcategories: [
            {
              title: t('library.adminCurated', 'Admin Curated Assets'),
              titleKey: 'library.adminCurated',
              playlists: [
                {
                  title: t('library.recentUploads', 'Recent Uploads'),
                  titleKey: 'library.recentUploads',
                  videos: matchingCustom.map(c => ({
                    id: c.id,
                    title: c.title,
                    duration: c.type === 'Interactive' ? 'Interactive' : 'Custom',
                    mediaUrl: c.mediaUrl,
                    isCustom: true,
                    type: c.type
                  }))
                }
              ]
            },
            ...module.subcategories
          ]
        };
      }
      return module;
    });
  }, [customContent, t]);

  // Keyword map for each module index → youtube DB keyword
  const MODULE_KEYWORD_MAP = {
    0: 'women health',
    1: 'heart care',
    2: 'mental healing',
    3: 'relationships',
    4: 'cravings',
  };

  // Fetch related YouTube videos when a module is expanded
  useEffect(() => {
    if (expandedModule === -1) {
      setRelatedVideos([]);
      return;
    }
    const keyword = MODULE_KEYWORD_MAP[expandedModule];
    if (!keyword) { setRelatedVideos([]); return; }
    let cancelled = false;
    const load = async () => {
      setRelatedLoading(true);
      setRelatedError(null);
      try {
        const data = await contentApi.getYoutubeVideos(keyword, 1, 12, 'full');
        if (!cancelled) setRelatedVideos(data.videos || []);
      } catch (err) {
        if (!cancelled) {
          console.error('[Explore] Failed to fetch related videos:', err);
          setRelatedError('Could not load related videos.');
        }
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [expandedModule]);

  useEffect(() => {
    const translateAll = async () => {
      // First apply local i18n key translations
      const locallyTranslated = modules.map(m => ({
        ...m,
        title: m.titleKey ? t(m.titleKey, m.title) : m.title,
        description: m.descKey ? t(m.descKey, m.description) : m.description,
        subcategories: m.subcategories.map(sub => ({
          ...sub,
          title: sub.titleKey ? t(sub.titleKey, sub.title) : sub.title,
          playlists: sub.playlists.map(pl => ({
            ...pl,
            title: pl.titleKey ? t(pl.titleKey, pl.title) : pl.title,
            videos: pl.videos.map(v => ({
              ...v,
              title: v.titleKey ? t(v.titleKey, v.title) : v.title,
            }))
          }))
        }))
      }));

      // If non-English and backend available, try API translation for custom content
      if (langCode !== 'en' && modules.length > 0) {
        try {
          const texts = collectTexts(modules);
          const res = await i18nApi.translateTexts(texts, langCode);
          if (res && res.success && res.translations) {
            const translated = applyTranslations(locallyTranslated, res.translations);
            setDisplayModules(translated);
            return;
          }
        } catch (err) {
          console.error('Failed to translate library modules:', err);
        }
      }
      setDisplayModules(locallyTranslated);
    };
    translateAll();
  }, [modules, langCode, t]);

  // Handle autoplay deep link from Learning Screen
  useEffect(() => {
    if (location.state?.autoplayVideoTitle && displayModules.length > 0) {
      let foundVideo = null;
      let foundModuleId = -1;

      for (const module of displayModules) {
        for (const sub of module.subcategories) {
          for (const pl of sub.playlists) {
            const v = pl.videos.find(item => item.title.toLowerCase() === location.state.autoplayVideoTitle.toLowerCase());
            if (v) {
              foundVideo = v;
              foundModuleId = module.id;
              break;
            }
          }
          if (foundVideo) break;
        }
        if (foundVideo) break;
      }

      if (foundVideo) {
        setExpandedModule(foundModuleId);
        handleVideoClick(foundVideo);
      }

      // Clear the location state so it doesn't open the modal again on subsequent route changes
      window.history.replaceState({}, document.title);
    }
  }, [location.state, displayModules]);

  useEffect(() => {
    if (selectedVideo && selectedVideo.description) {
      const text = selectedVideo.description;
      const sentences = text.split(/(?<=[.!?])\s+/);
      const finalChunks = [];
      sentences.forEach(s => {
        if (s.length > 80) {
          const parts = s.split(/,\s+/);
          parts.forEach(p => {
            if (p.trim()) finalChunks.push(p.trim());
          });
        } else if (s.trim()) {
          finalChunks.push(s.trim());
        }
      });
      setSubtitlesList(finalChunks);
      setCurrentSubtitle('');
    } else {
      setSubtitlesList([]);
      setCurrentSubtitle('');
    }
  }, [selectedVideo]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || subtitlesList.length === 0) return;
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    const chunkDuration = duration / subtitlesList.length;
    const currentChunkIndex = Math.floor(currentTime / chunkDuration);
    if (currentChunkIndex >= 0 && currentChunkIndex < subtitlesList.length) {
      setCurrentSubtitle(subtitlesList[currentChunkIndex]);
    } else {
      setCurrentSubtitle('');
    }
  };

  const filteredModules = displayModules.filter(module => {
    const searchLower = searchQuery.toLowerCase();
    const hasMatchInModule = module.title.toLowerCase().includes(searchLower) ||
      (module.description || '').toLowerCase().includes(searchLower);

    const hasMatchInVideos = module.subcategories.some(sub =>
      sub.title.toLowerCase().includes(searchLower) ||
      sub.playlists.some(pl =>
        pl.title.toLowerCase().includes(searchLower) ||
        pl.videos.some(v => v.title.toLowerCase().includes(searchLower))
      )
    );

    return hasMatchInModule || hasMatchInVideos;
  });

  // Auto-seek to saved position once video metadata is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current && initialSeekRef.current > 0) {
      videoRef.current.currentTime = initialSeekRef.current;
      initialSeekRef.current = 0; // Reset after seeking
    }
  };

  const isYoutubeVideo = selectedVideo && selectedVideo.mediaUrl && (selectedVideo.mediaUrl.includes('youtube.com') || selectedVideo.mediaUrl.includes('youtu.be'));

  const getSelectedVideoWatchUrl = () => {
    if (!selectedVideo || !selectedVideo.mediaUrl) return '';
    const url = selectedVideo.mediaUrl;
    let videoId = '';
    if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  };

  // 1. YouTube Iframe Player API Progress Saving Effect
  useEffect(() => {
    let intervalId;
    let ytPlayer;

    if (showVideoModal && selectedVideo && isYoutubeVideo) {
      // Load YouTube Player API script if not loaded yet
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      const initPlayer = () => {
        try {
          ytPlayer = new window.YT.Player('youtube-video-player', {
            events: {
              onReady: () => {
                if (initialSeekRef.current > 0) {
                  ytPlayer.seekTo(initialSeekRef.current, true);
                }
              }
            }
          });
        } catch (e) {
          console.warn('Failed to initialize YouTube player:', e);
        }
      };

      if (window.YT && window.YT.Player) {
        setTimeout(initPlayer, 500); // Allow DOM to update first
      } else {
        const prevAPIReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevAPIReady) prevAPIReady();
          initPlayer();
        };
      }

      // Check and save progress every 3 seconds
      intervalId = setInterval(async () => {
        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function' && typeof ytPlayer.getDuration === 'function') {
          const currentTime = ytPlayer.getCurrentTime();
          const duration = ytPlayer.getDuration() || 1;

          if (duration > 1) {
            const percent = Math.round((currentTime / duration) * 100);
            const completed = currentTime >= duration - 5;

            if (selectedVideo.id) {
              await contentAssetApi.saveProgress(selectedVideo.id, currentTime, completed, 'Video');
            }

            const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            userProgress[selectedVideo.title] = {
              percent: Math.min(100, percent),
              type: 'Video',
              position: currentTime,
              duration: duration
            };
            localStorage.setItem('userProgress', JSON.stringify(userProgress));
          }
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        try {
          ytPlayer.destroy();
        } catch (e) { }
      }
    };
  }, [showVideoModal, selectedVideo, isYoutubeVideo]);

  // 2. HTML5 Video Progress Saving Effect (every 3 seconds)
  useEffect(() => {
    let intervalId;
    if (showVideoModal && selectedVideo?.id && !isYoutubeVideo && selectedVideo.type !== 'Interactive') {
      intervalId = setInterval(async () => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration || 1;
          const percent = Math.round((currentTime / duration) * 100);
          const completed = currentTime >= duration - 5;

          await contentAssetApi.saveProgress(selectedVideo.id, currentTime, completed, 'Video');

          const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
          userProgress[selectedVideo.title] = {
            percent: Math.min(100, percent),
            type: 'Video',
            position: currentTime,
            duration: duration
          };
          localStorage.setItem('userProgress', JSON.stringify(userProgress));
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showVideoModal, selectedVideo, isYoutubeVideo]);

  // Click handler: opens modal and asynchronously fetches resume position
  const handleVideoClick = async (video) => {
    setSelectedVideo({ ...video, tag: video.type === 'Interactive' ? 'Interactive' : 'Knowledge' });
    setShowVideoModal(true);
    initialSeekRef.current = 0;

    let initialPercent = 5;

    if (video.id) {
      try {
        const prog = await contentAssetApi.getProgress(video.id);
        if (prog && prog.position > 0) {
          initialSeekRef.current = prog.position;
          // Calculate initial percentage from position if possible
          if (video.duration && video.duration.includes(':')) {
            const parts = video.duration.split(':');
            const totalSec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
            if (totalSec > 0) {
              initialPercent = Math.min(99, Math.round((prog.position / totalSec) * 100));
            }
          }
          if (prog.completed) {
            initialPercent = 100;
          }
          // In case the ref is already set and video has loaded
          if (videoRef.current) {
            videoRef.current.currentTime = prog.position;
          }
        }
      } catch (err) {
        console.warn('Failed to load video progress:', err);
      }
    }

    // Sync with LocalStorage for default/mock tracking
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    if (!userProgress[video.title]) {
      userProgress[video.title] = { percent: initialPercent, type: 'Video' };
      localStorage.setItem('userProgress', JSON.stringify(userProgress));
    }
  };

  // Close player handler: saves final progress on exit
  const closeVideoPlayer = async () => {
    if (selectedVideo?.id && videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      const completed = currentTime >= duration - 5;
      await contentAssetApi.saveProgress(selectedVideo.id, currentTime, completed, 'Video');

      const percent = Math.round((currentTime / duration) * 100);
      const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
      userProgress[selectedVideo.title] = {
        percent: Math.min(100, percent),
        type: 'Video',
        position: currentTime,
        duration: duration
      };
      localStorage.setItem('userProgress', JSON.stringify(userProgress));
    }
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const markAsCompleted = async () => {
    if (!selectedVideo) return;
    if (selectedVideo.id) {
      const duration = videoRef.current ? videoRef.current.duration : 600;
      await contentAssetApi.saveProgress(selectedVideo.id, duration, true, 'Video');
    }
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    userProgress[selectedVideo.title] = { percent: 100, type: 'Video' };
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
    setCompletedVideos([...completedVideos, selectedVideo.title]);
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  return (
    <div className="relative min-h-screen pb-20 overflow-x-hidden">
      {/* ── Background Mesh ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#ff69b4]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#FFF1F2] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 space-y-12">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/app')}
              className="w-12 h-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-[#15192c] shadow-sm hover:shadow-md transition-all"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[#15192c]">{t('library.title', 'Wellness Library')}</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A0AC] mt-1">{t('library.subtitle', 'Specific knowledge for your needs')}</p>
            </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C4A0AC] group-focus-within:text-[#ff69b4] transition-colors" size={18} />
            <input
              type="text"
              placeholder={t('library.searchPlaceholder', 'Search topics...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white/60 backdrop-blur-md border border-rose-100 outline-none focus:ring-2 focus:ring-rose-200 transition-all text-sm font-bold placeholder:text-[#C4A0AC]"
            />
          </div>
        </header>

        {/* ── Filtered Modules Grid ── */}
        <div className="grid grid-cols-1 gap-8">
          {filteredModules.map((module, idx) => (
            <motion.div
              key={module.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`group bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl shadow-rose-100/20 overflow-hidden transition-all duration-500 ${expandedModule === module.id ? 'ring-2 ring-[#ff69b4]/20' : ''}`}
            >
              <button
                onClick={() => setExpandedModule(expandedModule === module.id ? -1 : module.id)}
                className="w-full text-left p-8 md:p-10 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ${module.bg}`}>
                    <module.icon size={28} style={{ color: module.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles size={12} className="text-[#ff69b4]" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#C4A0AC]">{t('library.verifiedContent', 'Verified Content')}</span>
                    </div>
                    <h3 className="text-2xl font-black text-[#15192c] tracking-tight">{module.title}</h3>
                    <p className="text-xs font-medium text-[#9A8A8E] mt-1 max-w-md leading-relaxed">{module.description}</p>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${expandedModule === module.id ? 'bg-[#15192c] text-white rotate-180' : 'bg-rose-50 text-[#C4A0AC]'}`}>
                  <ChevronDown size={20} />
                </div>
              </button>

              <AnimatePresence>
                {expandedModule === module.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="px-8 md:px-10 pb-10"
                  >
                    <div className="h-px w-full bg-rose-50 mb-8" />

                    <div className="space-y-10">
                      {module.subcategories.map((sub, sIdx) => (
                        <div key={sIdx} className="space-y-6">
                          <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ff69b4] flex items-center gap-3">
                            <div className="w-6 h-px bg-rose-200" />
                            {localize(sub.title)}
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sub.playlists.map((playlist, pIdx) => (
                              <div key={pIdx} className="bg-white/80 rounded-[2.25rem] p-6 border border-rose-50 shadow-sm hover:shadow-md transition-all group/card">
                                <div className="flex items-center justify-between mb-6">
                                  <h5 className="text-base font-black text-[#15192c]">{playlist.title}</h5>
                                  <span className="px-2.5 py-1 bg-rose-50 text-[8px] font-black uppercase text-[#ff69b4] rounded-lg tracking-widest">{playlist.videos.length} {t('library.units', 'Units')}</span>
                                </div>
                                <div className="space-y-2">
                                  {playlist.videos.map((video, vIdx) => {
                                    const isDone = completedVideos.includes(video.title);
                                    return (
                                      <motion.button
                                        whileHover={{ x: 5 }}
                                        key={vIdx}
                                        onClick={() => handleVideoClick(video)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all group/item shadow-sm ${isDone ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-rose-50 hover:border-[#ff69b4]'}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDone ? 'bg-[#ff69b4] text-white' : 'bg-rose-50 text-[#ff69b4] group-hover/item:bg-[#ff69b4] group-hover/item:text-white'}`}>
                                            {isDone ? <Sparkles size={16} fill="white" /> : <PlayCircle size={16} fill="transparent" />}
                                          </div>
                                          <span className={`text-xs font-bold ${isDone ? 'text-[#ff69b4]' : 'text-[#15192c]'}`}>{localize(video.title)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[8px] font-black text-[#C4A0AC]">
                                          {isDone ? (
                                            <span className="text-[#ff69b4] uppercase tracking-widest">{t('library.completed', 'Completed')}</span>
                                          ) : (
                                            <><Clock size={10} /> {video.duration === 'Custom' ? t('explore.custom', 'Custom') : video.duration}</>
                                          )}
                                        </div>
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Related YouTube Videos ── */}
                    <div className="mt-10 pt-8 border-t border-rose-50">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Play size={16} className="text-white fill-white" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-[#15192c] leading-none">{t('explore.relatedVideos', 'health sakhi sions')}</h4>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C4A0AC] mt-0.5">{t('explore.relatedVideosSubtitle', 'Related Motivation & Wellness Videos')}</p>
                        </div>
                      </div>

                      {relatedLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-[24px] border border-[#F5E6EA] overflow-hidden animate-pulse">
                              <div className="h-40 bg-rose-50" />
                              <div className="p-4 space-y-2">
                                <div className="h-3 bg-rose-50 rounded-full w-3/4" />
                                <div className="h-3 bg-rose-50 rounded-full w-1/2" />
                                <div className="h-2 bg-rose-50 rounded-full w-1/3 mt-3" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!relatedLoading && relatedError && (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-60">
                          <Activity size={28} className="text-rose-400" />
                          <p className="text-xs font-bold text-[#15192c]">{relatedError}</p>
                        </div>
                      )}

                      {!relatedLoading && !relatedError && relatedVideos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-40">
                          <Sparkles size={28} className="text-rose-400" />
                          <p className="text-xs font-bold text-[#15192c]">{t('explore.noRelatedVideos', 'No related videos found.')}</p>
                        </div>
                      )}

                      {!relatedLoading && relatedVideos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {relatedVideos.map((video) => (
                            <motion.div
                              key={video.id}
                              whileHover={{ y: -5, scale: 1.01 }}
                              onClick={() => setYtPlayer(video)}
                              className="bg-white rounded-[24px] border border-[#F5E6EA] cursor-pointer shadow-sm group overflow-hidden hover:shadow-lg transition-all duration-300"
                            >
                              <div className="relative h-40 overflow-hidden">
                                <img
                                  src={video.thumbnailUrl}
                                  alt={video.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400'; }}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-12 h-12 bg-rose-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl">
                                    <Play size={18} className="text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                                <div className="absolute top-3 right-3 bg-[#FF0000] text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg tracking-wider shadow">
                                  YouTube
                                </div>
                              </div>
                              <div className="p-4">
                                <h5 className="text-xs font-black text-[#15192c] leading-snug line-clamp-2 mb-1.5 group-hover:text-rose-500 transition-colors">
                                  {video.title}
                                </h5>
                                <p className="text-[9px] font-bold text-[#C4A0AC] uppercase tracking-widest mb-0.5 truncate">
                                  {video.channelTitle}
                                </p>
                                <p className="text-[9px] text-[#C4A0AC] font-bold">
                                  {new Date(video.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Video Player Modal ── */}
      <AnimatePresence>
        {showVideoModal && selectedVideo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeVideoPlayer} className="absolute inset-0 bg-[#15192c]/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-5xl bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row max-h-[90vh]">

              {/* Video Player Area */}
              <div className="flex-[1.5] bg-black relative group min-h-[300px] md:min-h-0">
                {isYoutubeVideo ? (
                  <iframe
                    id="youtube-video-player"
                    src={`${selectedVideo.mediaUrl}${selectedVideo.mediaUrl.includes('?') ? '&' : '?'}enablejsapi=1&autoplay=1&mute=1`}
                    className="w-full h-full border-none"
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedVideo.type === 'Interactive' ? (
                  <iframe
                    src={selectedVideo.mediaUrl}
                    className="w-full h-full border-none bg-white"
                    title={selectedVideo.title}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    key={selectedVideo.title}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop={false}
                    playsInline
                    controls
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                  >
                    <source src={selectedVideo.mediaUrl || "https://vjs.zencdn.net/v/oceans.mp4"} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                {/* Subtitle Overlay */}
                {selectedVideo.type !== 'Interactive' && currentSubtitle && (
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/75 px-4 py-2 rounded-xl text-center max-w-[85%] z-20 pointer-events-none transition-all duration-300">
                    <p className="text-white text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md">
                      {currentSubtitle}
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-8 left-8 text-white z-10">
                  <span className="px-3 py-1 bg-[#ff69b4] rounded-lg text-[9px] font-black uppercase tracking-widest mb-2 inline-block shadow-lg">{selectedVideo.tag === 'Knowledge' ? t('explore.knowledgeUnit', 'Knowledge Unit') : selectedVideo.tag}</span>
                  <h3 className="text-xl md:text-2xl font-black drop-shadow-md">{localize(selectedVideo.title)}</h3>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="w-full md:w-96 bg-white p-6 md:p-10 flex flex-col justify-between border-l border-rose-50 overflow-y-auto custom-scrollbar">
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('library.knowledgeUnit', 'Knowledge Unit')}</h4>
                    <button onClick={closeVideoPlayer} className="text-[#C4A0AC] hover:text-[#15192c] transition-colors"><X size={20} /></button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold text-[#15192c] leading-relaxed italic">{t('library.quote', '"Sakhi, understanding this will empower you to take better care of your unique body."')}</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-[#C4A0AC]">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{selectedVideo.duration === 'Custom' ? t('explore.custom', 'Custom') : selectedVideo.duration || 'Full Session'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#ff69b4]">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">+{t('library.potentialCoins', '100 Potential Coins')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {isYoutubeVideo && (
                  <a
                    href={getSelectedVideoWatchUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-[#FF0000] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#cc0000] transition-all shadow-xl mt-4 flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={14} className="fill-white" />
                    {t('library.watchOnYoutube', 'Watch on YouTube')}
                  </a>
                )}

                <button
                  onClick={markAsCompleted}
                  className="w-full py-4 bg-[#15192c] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff69b4] transition-all shadow-xl mt-8"
                >
                  {t('library.markCompleted', 'Mark as Completed')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── YouTube Player Modal (Related Videos) ── */}
      <AnimatePresence>
        {ytPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setYtPlayer(null); }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 40 }}
              className="bg-[#0f1117] rounded-[2.5rem] overflow-hidden w-full max-w-4xl shadow-2xl border border-white/5 flex flex-col"
            >
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex-1 pr-4">
                  <h3 className="text-white font-black text-base leading-snug line-clamp-2">{ytPlayer.title}</h3>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">
                    {ytPlayer.channelTitle} &nbsp;·&nbsp; {new Date(ytPlayer.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={ytPlayer.watchUrl || `https://www.youtube.com/watch?v=${ytPlayer.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Watch on YouTube"
                  >
                    <Play size={16} className="fill-white" />
                  </a>
                  <button
                    onClick={() => setYtPlayer(null)}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={ytPlayer.embedUrl}
                  title={ytPlayer.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentScreen;

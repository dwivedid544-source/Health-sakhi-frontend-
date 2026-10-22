import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookOpen, PlayCircle, Star, Users, Volume2, VolumeX, Globe } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import contentAssetApi from '../../api/contentAssetApi';
import i18nApi from '../../api/i18nApi';

const BOOKS_CHAPTER_MAPPING = {
  1: ['Phase 1: Menstrual Flow & Rest', 'Phase 2: Follicular Energy & Bloom', 'Phase 3: Ovulatory Vitality', 'Phase 4: Luteal Balance', 'The HealthSakhi Way to Total Health'],
  2: ['Morning Self-Care & Natural Radiance', 'Holistic Hair & Scalp Care Rituals', 'Skin Nutrition & Herbal Remedies', 'Evening Rejuvenation & Detox', 'Timeless Wellness Practices'],
  3: ['Understanding Solitude & Inner Peace', 'The Power of Self-Dialogue & Awareness', 'Building Emotional Anchors', 'Connecting Outward with Confidence', 'Sustained Mental Well-being'],
  4: ['Understanding PCOD & Hormonal Health', 'The Insulin & Metabolic Connection', 'Dietary Protocols for Balance', 'Movement & Lifestyle as Medicine', 'Long-term Wellness & Vitality'],
  5: ['The Neuroscience of Human Connection', 'Understanding Attraction & Chemistry', 'Building Deep Emotional Intimacy', 'Biological Anchors & Relationship Health', 'Sustaining Mutual Bonds'],
  6: ['The Verse of Self-Discovery', 'Emotional Nuances & Inner Harmony', 'Strength in Softness & Resilience', 'The Narrative of Womanhood', 'Living with Grace & Purpose']
};

export const generateDynamicChapters = (title = '', category = '', rawChapters = [], bookId = null) => {
  if (bookId && BOOKS_CHAPTER_MAPPING[bookId]) {
    return BOOKS_CHAPTER_MAPPING[bookId];
  }

  if (Array.isArray(rawChapters) && rawChapters.length > 0 && typeof rawChapters[0] === 'string' && !rawChapters[0].toLowerCase().includes('chapter 1: introduction')) {
    return rawChapters;
  }

  const t = (title || '').toLowerCase();

  if (t.includes('child development') || t.includes('parenting') || t.includes('beyond parenting') || t.includes('child')) {
    return [
      'Understanding Child Development (Ages 2-10)',
      'Building Emotional Intelligence & Resilience',
      'Physical Health & Nutritional Guidance',
      'Positive Communication & Daily Habits',
      'Nurturing Growth & Future Potential'
    ];
  }

  if (t.includes('beauty') || t.includes('parlour') || t.includes('skin') || t.includes('hair')) {
    return [
      'Morning Self-Care & Natural Radiance',
      'Holistic Hair & Scalp Care Rituals',
      'Skin Nutrition & Herbal Remedies',
      'Evening Rejuvenation & Detox',
      'Timeless Wellness Practices'
    ];
  }

  if (t.includes('loneliness') || t.includes('mind') || t.includes('peace') || t.includes('mental')) {
    return [
      'Understanding Solitude & Inner Peace',
      'The Power of Self-Dialogue & Awareness',
      'Building Emotional Anchors',
      'Connecting Outward with Confidence',
      'Sustained Mental Well-being'
    ];
  }

  if (t.includes('pcod') || t.includes('pcos') || t.includes('hormon')) {
    return [
      'Understanding PCOD & Hormonal Health',
      'The Insulin & Metabolic Connection',
      'Dietary Protocols for Balance',
      'Movement & Lifestyle as Medicine',
      'Long-term Wellness & Vitality'
    ];
  }

  if (t.includes('desire') || t.includes('relation') || t.includes('intimacy') || t.includes('love')) {
    return [
      'The Neuroscience of Human Connection',
      'Understanding Attraction & Chemistry',
      'Building Deep Emotional Intimacy',
      'Biological Anchors & Relationship Health',
      'Sustaining Mutual Bonds'
    ];
  }

  if (t.includes('poem') || t.includes('woman') || t.includes('grace')) {
    return [
      'The Verse of Self-Discovery',
      'Emotional Nuances & Inner Harmony',
      'Strength in Softness & Resilience',
      'The Narrative of Womanhood',
      'Living with Grace & Purpose'
    ];
  }

  if (t.includes('monthly') || t.includes('wellness') || t.includes('cycle')) {
    return [
      'Phase 1: Menstrual Flow & Rest',
      'Phase 2: Follicular Energy & Bloom',
      'Phase 3: Ovulatory Vitality',
      'Phase 4: Luteal Balance',
      'The HealthSakhi Way to Total Health'
    ];
  }

  const cleanTitle = title || 'HealthSakhi Guide';
  return [
    `Introduction to ${cleanTitle}`,
    `Core Foundations & Health Insights`,
    `Practical Strategies for ${category || 'Well-being'}`,
    `Daily Rituals & Lifestyle Integration`,
    `Summary & Long-term Growth`
  ];
};

const STATIC_COVERS = {
  1: '/Images/heart to heart.png',
  2: '/Images/final wt loss book cover.png',
  3: '/Images/final cover fountain of family.png',
  4: '/Images/HS LIFE AFTRE SHAADI COVER.png',
  5: '/Images/HS MENOPAUSE.png',
  6: '/Images/final cover beauty without parlour.png',
  7: '/Images/HS HOW TO READ HUSBAND COVE R.png',
  8: '/Images/HOW TO READ WOMAN LIKE A POEM.png',
  9: '/Images/100 operations.png',
  10: '/Images/final pcod book cover.png',
};

const getStaticCoverUrl = (id) => {
  return STATIC_COVERS[id] || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400';
};

// ── Main Book Detail Screen ────────────────────────────────────────────────────
const BookDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, langCode } = useLanguage();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTtsId, setActiveTtsId] = useState(null);
  const [isNotAvailable, setIsNotAvailable] = useState(false);
  const [notAvailableLang, setNotAvailableLang] = useState('');
  // Initialize immediately from localStorage so Premium members are never locked out on first render
  const [userPlanName, setUserPlanName] = useState(() => {
    return localStorage.getItem('hs_user_plan_name') || 'Free Sakhi';
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [bypassFallback, setBypassFallback] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await memberApi.getProfile();
        if (res && res.success && res.profile?.subscription) {
          const planName = res.profile.subscription.plan_name || res.profile.subscription.badge || 'Free Sakhi';
          setUserPlanName(planName);
          localStorage.setItem('hs_user_plan_name', planName);
        }
      } catch (err) {}
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    // Reset availability states when book ID or selected language changes
    setIsNotAvailable(false);
    setBypassFallback(false);
  }, [id, langCode]);

  useEffect(() => {
    const loadAdminBook = async () => {
      try {
        setLoading(true);
        let asset = null;
        let showWarning = false;

        // Try DB first if it is UUID
        const isUuid = id && id.length > 5;
        if (isUuid) {
          try {
            const res = await contentAssetApi.getAssetById(id);
            if (res && res.success && res.data) {
              asset = res.data;
            }
          } catch (dbErr) {
            console.warn('[BookDetailScreen] Failed to load book from DB, checking static...', dbErr);
          }
        }

        // Fallback: Fetch local static book JSON
        if (!asset) {
          try {
            const currentLang = (langCode || 'en').toLowerCase();
            let staticUrl = `/books/book_${id}_${currentLang}.json`;
            let staticRes = await fetch(staticUrl);
            if (!staticRes.ok && currentLang !== 'en') {
              staticUrl = `/books/book_${id}_en.json`;
              staticRes = await fetch(staticUrl);
            }

            if (staticRes.ok) {
              const staticData = await staticRes.json();
              if (staticData && staticData.title) {
                asset = {
                  id: String(id),
                  title: staticData.title,
                  category: staticData.category || 'Women Health',
                  languageCode: currentLang,
                  description: staticData.desc || staticData.description || '',
                  coverUrl: staticData.image || staticData.coverUrl || getStaticCoverUrl(id),
                  chapters: Array.isArray(staticData.chapters)
                    ? staticData.chapters.map(c => typeof c === 'string' ? c : c.title).filter(Boolean)
                    : [],
                  isStaticJson: true
                };
              }
            }
          } catch (staticErr) {
            console.error('[BookDetailScreen] Static book loading failed:', staticErr);
          }
        }

        if (asset) {
          // Try resolving matching language variant asset from public library for current langCode (only for DB assets)
          if (!asset.isStaticJson && langCode && langCode.toLowerCase() !== 'en') {
            try {
              const allRes = await contentAssetApi.getPublicAssets({ type: 'Book', status: 'Published' });
              if (allRes && allRes.success && Array.isArray(allRes.data)) {
                const normalizeKey = (str) => str ? str.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') : '';
                const targetGroupKey = (asset.groupKey && asset.groupKey.trim() !== '') ? asset.groupKey.trim() : normalizeKey(asset.title);

                const variantMatch = allRes.data.find(a => {
                  const aKey = (a.groupKey && a.groupKey.trim() !== '') ? a.groupKey.trim() : normalizeKey(a.title);
                  const isGroupMatch = (aKey && targetGroupKey && aKey === targetGroupKey) || (a.title && asset.title && a.title.trim().toLowerCase() === asset.title.trim().toLowerCase());
                  const isLangMatch = (a.languageCode && langCode && a.languageCode.toLowerCase() === langCode.toLowerCase()) || (a.language && a.language.toLowerCase().includes(langCode.toLowerCase()));
                  return isGroupMatch && isLangMatch;
                });

                if (variantMatch) {
                  asset = variantMatch;
                  setIsNotAvailable(false);
                } else {
                  // No native language variant exists for this book in selected language
                  if (!bypassFallback) {
                    showWarning = true;
                    setIsNotAvailable(true);
                    const langMap = { hi: 'Hindi', mr: 'Marathi', en: 'English' };
                    setNotAvailableLang(langMap[langCode.toLowerCase()] || langCode.toUpperCase());
                  } else {
                    setIsNotAvailable(false);
                  }
                }
              }
            } catch (variantErr) {
              console.warn('[BookDetailScreen] Variant resolution error:', variantErr);
            }
          } else {
            setIsNotAvailable(false);
          }

          let rawDescStr = asset.description || '';
          let isPaidBook = rawDescStr.includes('[hs_access] Paid');

          let coverUrl = asset.coverUrl || asset.image || getStaticCoverUrl(asset.id);
          if (rawDescStr.includes('[hs_cover]')) {
            const coverPart = rawDescStr.split('[hs_cover]')[1];
            if (coverPart) {
              const extractedCover = coverPart.split('[hs_chapters]')[0].split('[hs_access]')[0].trim();
              if (extractedCover && extractedCover.startsWith('http')) {
                coverUrl = extractedCover;
              }
            }
          }
          if (!coverUrl) {
            coverUrl = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400';
          }

          let customChapters = null;
          if (rawDescStr.includes('[hs_chapters]')) {
            const chapPart = rawDescStr.split('[hs_chapters]')[1];
            if (chapPart) {
              const jsonStr = chapPart.split('[hs_access]')[0].trim();
              try {
                const parsedChap = JSON.parse(jsonStr);
                if (Array.isArray(parsedChap) && parsedChap.length > 0) customChapters = parsedChap;
              } catch (e) {}
            }
          }

          let cleanDesc = rawDescStr
            .split('[hs_cover]')[0]
            .split('[hs_chapters]')[0]
            .split('[hs_access]')[0]
            .trim();
          if (!cleanDesc) cleanDesc = 'A handpicked health and wellness guide curated for you by the HealthSakhi team.';

          const dynamicChapters = customChapters || generateDynamicChapters(asset.title, asset.category, asset.chapters, asset.id);

          const initialBook = {
            id: asset.id,
            title: asset.title,
            author: 'HealthSakhi Expert',
            category: asset.category || 'Women Health',
            reads: '1.2k',
            desc: cleanDesc,
            image: coverUrl,
            chapters: dynamicChapters,
            isAdminBook: true,
            isPaid: isPaidBook,
            mediaUrl: asset.mediaUrl,
            languageCode: asset.languageCode
          };

          // Translate text if book language does not match selected langCode or if title has non-ASCII characters when langCode is 'en'
          const bookLangCode = (asset.languageCode || 'en').toLowerCase();
          const currentLangCode = (langCode || 'en').toLowerCase();

          if (!showWarning && !bypassFallback && (bookLangCode !== currentLangCode || (/[^\x00-\x7F]/.test(initialBook.title) && currentLangCode === 'en'))) {
            const texts = [
              initialBook.title,
              initialBook.desc,
              ...initialBook.chapters
            ];
            const transRes = await i18nApi.translateTexts(texts, langCode);
            if (transRes && transRes.success && Array.isArray(transRes.translations)) {
              initialBook.title = transRes.translations[0] || initialBook.title;
              initialBook.desc = transRes.translations[1] || initialBook.desc;
              if (transRes.translations.length > 2) {
                initialBook.chapters = transRes.translations.slice(2);
              }
            }
          }
          setBook(initialBook);
        } else {
          setBook(null);
        }
      } catch (err) {
        console.error('Failed to load book details:', err);
        setBook(null);
      } finally {
        setLoading(false);
      }
    };
    loadAdminBook();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [id, langCode, bypassFallback]);

  const handlePlayBookTts = async (bookId, title, description) => {
    if (activeTtsId === bookId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setActiveTtsId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      setActiveTtsId(bookId);
      const chaptersText = book.chapters && book.chapters.length > 0
        ? `. Chapters: ${book.chapters.map((ch, idx) => `Chapter ${idx + 1}: ${typeof ch === 'string' ? ch : ch.title}`).join(', ')}`
        : '';
      const textToSpeak = `Title: ${title}. Summary: ${description}${chaptersText}`;
      const res = await i18nApi.generateTts(textToSpeak, langCode);
      if (res && res.success && res.audioUrl) {
        const audio = new Audio(res.audioUrl);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => {
          setActiveTtsId(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setActiveTtsId(null);
          audioRef.current = null;
        };
      } else {
        setActiveTtsId(null);
      }
    } catch (err) {
      console.error('Failed to play book summary TTS:', err);
      setActiveTtsId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-health-green"></div>
      </div>
    );
  }

  if (isNotAvailable) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
        {/* Back Button */}
        <button
          onClick={() => navigate('/app/books')}
          className="flex items-center gap-2 text-slate-400 hover:text-health-green transition-colors font-black text-[10px] uppercase tracking-widest mb-8"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="w-full min-h-[45vh] bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center p-8 sm:p-12 text-center shadow-lg">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mb-5 sm:mb-6 shadow-md">
            <Globe size={36} className="sm:w-10 sm:h-10" />
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight mb-2.5 max-w-md">
            This book is not available in {notAvailableLang}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold max-w-sm leading-relaxed">
            Admin has not uploaded the {notAvailableLang} version of this book yet.
          </p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 font-black uppercase tracking-widest">Book not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/books')}
        className="flex items-center gap-2 text-slate-400 hover:text-health-green transition-colors font-black text-[10px] uppercase tracking-widest mb-8"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start text-center md:text-left">
        {/* Book Cover */}
        <div className="flex-shrink-0 w-full max-w-[260px] sm:max-w-[280px] md:w-72">
          <div className="aspect-[3/4] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-rose-200 border-4 border-white bg-rose-50/20 flex items-center justify-center">
            <img
              src={book.image}
              alt={book.title}
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-health-green/10 text-health-green">
                <BookOpen size={10} /> {book.category}
              </div>
              {book.isPaid ? (
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-600 text-white shadow-sm">
                  PREMIUM 🔒
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-sm">
                  FREE 🌸
                </span>
              )}
              <button
                onClick={() => handlePlayBookTts(book.id, book.title, book.desc)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeTtsId === book.id
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
              >
                {activeTtsId === book.id ? (
                  <>
                    <VolumeX size={10} /> {t('books.stopTts', 'Stop Summary')}
                  </>
                ) : (
                  <>
                    <Volume2 size={10} /> {t('books.playTts', 'Listen Summary')}
                  </>
                )}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 leading-tight tracking-tight mb-2 px-2 md:px-0">
              {book.title}
            </h1>
            <p className="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-widest">
              {t('books.byAuthor', 'By')} {book.author}
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 py-4 border-y border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-600">4.8</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500">
              <Users size={14} className="text-health-green" />
              {book.reads} {t('books.readsText', 'reads')}
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500">
              <BookOpen size={14} className="text-health-green" />
              {book.chapters.length} {t('books.chaptersLabel', 'chapters')}
            </div>
          </div>

          {/* Progress Bar for Member */}
          {(() => {
            const savedProgress = JSON.parse(localStorage.getItem(`progress_book_${id}`) || 'null');
            const isCompleted = JSON.parse(localStorage.getItem('completedBooks') || '[]').includes(id) || JSON.parse(localStorage.getItem('completedBooks') || '[]').includes(parseInt(id));

            let progressPercent = 0;
            let progressLabel = t('books.notStarted', 'Not Started');

            if (isCompleted) {
              progressPercent = 100;
              progressLabel = t('books.completedText', 'Completed');
            } else if (savedProgress) {
              const total = parseInt(savedProgress.total) || 30;
              const page = parseInt(savedProgress.page) || 0;
              progressPercent = Math.round((page / total) * 100);
              if (isNaN(progressPercent)) progressPercent = 0;
              progressLabel = `${page} / ${total} ${t('books.pagesCompletedSuffix', 'Pages Completed')}`;
            }

            if (progressPercent > 0) {
              return (
                <div className="bg-[#FDEEF1] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-[#F5E6EA] animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-[9px] sm:text-[10px] font-black text-[#ff69b4] uppercase tracking-widest">{progressLabel}</p>
                    <span className="text-[9px] sm:text-[10px] font-black text-[#ff69b4]">{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-white rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-[#ff69b4] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Summary */}
          <div className="bg-slate-50 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8">
            <h3 className="text-[9px] sm:text-[10px] font-black text-health-green uppercase tracking-widest mb-3 sm:mb-4">{t('books.bookSummary', 'Book Summary')}</h3>
            <p className="text-slate-600 text-[13px] sm:text-sm leading-relaxed font-medium">
              {book.desc}
            </p>
          </div>

          {/* Chapters List */}
          <div className="space-y-3">
            <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('books.chapters', 'Chapters')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {book.chapters.map((ch, i) => {
                const titleStr = typeof ch === 'string' ? ch : (ch.title || `Chapter ${i + 1}`);
                const pageNum = (typeof ch === 'object' && ch.page !== undefined)
                  ? ch.page
                  : (typeof ch === 'object' && ch.startPage !== undefined)
                  ? ch.startPage + 1
                  : Math.floor((i / Math.max(1, book.chapters.length)) * 30) + 1;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      const activePlan = userPlanName || localStorage.getItem('hs_user_plan_name') || 'Free Sakhi';
                      const isFreeUser = !activePlan || activePlan.toLowerCase().includes('free');
                      if (isFreeUser && book?.isPaid) {
                        setShowUpgradeModal(true);
                        return;
                      }
                      navigate(`/app/books/${id}/read?chapter=${i + 1}&page=${pageNum - 1}`);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white hover:border-health-green/30 hover:bg-health-green/[0.04] cursor-pointer transition-all group shadow-sm"
                    title={`Click to jump to ${titleStr}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="w-7 h-7 rounded-xl bg-health-green/10 text-health-green text-[10px] font-black flex items-center justify-center flex-shrink-0 group-hover:bg-health-green group-hover:text-white transition-colors">
                        {i + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-health-green transition-colors truncate">
                        {titleStr}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {typeof ch === 'object' && (ch.page !== undefined || ch.startPage !== undefined) && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Pg {ch.page !== undefined ? ch.page : ch.startPage + 1}
                        </span>
                      )}
                      <PlayCircle size={14} className="text-health-green opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              const activePlan = userPlanName || localStorage.getItem('hs_user_plan_name') || 'Free Sakhi';
              const isFreeUser = !activePlan || activePlan.toLowerCase().includes('free');
              if (isFreeUser && book?.isPaid) {
                setShowUpgradeModal(true);
                return;
              }
              navigate(`/app/books/${id}/read`);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 sm:px-12 py-4 sm:py-5 bg-slate-900 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            <PlayCircle size={20} className="text-health-green" />
            {localStorage.getItem(`progress_book_${id}`) ? t('books.resumeJourney', 'Resume Journey') : t('books.startReading', 'Start Reading')}
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (() => {
        const lockI18n = {
          en: {
            title: 'Premium Book Locked',
            desc: 'This book is reserved for Basic Sakhi & Premium Sakhi members. Upgrade your plan to unlock full wellness library access! 🌸',
            upgradeBtn: 'UPGRADE PLAN 🌸',
            closeBtn: 'CLOSE'
          },
          hi: {
            title: 'प्रीमियम पुस्तक लॉक है',
            desc: 'यह पुस्तक बेसिक सखी और प्रीमियम सखी सदस्यों के लिए आरक्षित है। संपूर्ण वेलनेस लाइब्रेरी एक्सेस अनलॉक करने के लिए अपना प्लान अपग्रेड करें! 🌸',
            upgradeBtn: 'प्लान अपग्रेड करें 🌸',
            closeBtn: 'बंद करें'
          },
          mr: {
            title: 'प्रीमियम पुस्तक लॉक आहे',
            desc: 'हे पुस्तक बेसिक सखी आणि प्रीमियम सखी सदस्यांसाठी राखीव आहे. संपूर्ण वेलनेस लायब्ररी अ‍ॅक्सेस अनलॉक करण्यासाठी तुमचा प्लॅन अपग्रेड करा! 🌸',
            upgradeBtn: 'प्लॅन अपग्रेड करा 🌸',
            closeBtn: 'बंद करा'
          }
        };
        const currentLockText = lockI18n[langCode?.toLowerCase()] || lockI18n.en;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full text-center shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔒
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{currentLockText.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                {currentLockText.desc}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/app/plans')}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:scale-105 transition-all"
                >
                  {currentLockText.upgradeBtn}
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200"
                >
                  {currentLockText.closeBtn}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BookDetailScreen;

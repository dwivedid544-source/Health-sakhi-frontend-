import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Search, Sparkles, ChevronRight, PlayCircle, Clock, CheckCircle, Headphones, Trophy, FileText, X, ExternalLink, Volume2, VolumeX, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookReaderModal from '../../components/BookReaderModal';
import { useLanguage } from '../../context/LanguageContext';
import contentAssetApi, { resolveMediaUrl } from '../../api/contentAssetApi';
import memberApi from '../../api/memberApi';
import i18nApi from '../../api/i18nApi';

const getStoredCategories = () => {
  const saved = localStorage.getItem('hs_custom_categories');
  let base = ['Women Health', 'Heart Care', 'Mental Healing', 'Relationships', 'Cravings'];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        base = Array.from(new Set([...base, ...parsed]));
      }
    } catch (e) {}
  }
  return ['All', ...base];
};


const BookLibraryScreen = () => {
  const { t, langCode } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [customBooks, setCustomBooks] = useState([]);
  const [readBook, setReadBook] = useState(null);
  const [booksList, setBooksList] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [adminBooks, setAdminBooks] = useState([]);
  const [activeTtsId, setActiveTtsId] = useState(null);
  const [backendProgress, setBackendProgress] = useState([]);
  const [profile, setProfile] = useState(null);
  const [userPlanName, setUserPlanName] = useState(() => {
    return localStorage.getItem('hs_user_plan_name') || 'Free Sakhi';
  });
  const [showLimitModal, setShowLimitModal] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Get progress from localStorage
  const completedBooks = JSON.parse(localStorage.getItem('completedBooks') || '[]');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedPlan = localStorage.getItem('hs_user_plan_name');
        if (storedPlan) setUserPlanName(storedPlan);
        const res = await memberApi.getProfile();
        if (res && res.success && res.profile) {
          setProfile(res.profile);
          const activePlan = res.profile.subscription?.plan_name || res.profile.subscription?.badge || 'Free Sakhi';
          setUserPlanName(activePlan);
          localStorage.setItem('hs_user_plan_name', activePlan);
        }
      } catch (err) {
        console.error('Failed to load profile in BookLibraryScreen:', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchDashboardProgress = async () => {
      try {
        const res = await memberApi.getDashboard();
        if (res && res.success && res.dashboard && res.dashboard.user_book_progress) {
          setBackendProgress(res.dashboard.user_book_progress);
        }
      } catch (err) {
        console.error('BookLibraryScreen: Failed to fetch dashboard progress', err);
      }
    };
    fetchDashboardProgress();
  }, []);

  useEffect(() => {
    // Fetch admin-uploaded books from API
    const loadAdminBooks = async () => {
      let booksData = [];
      try {
        const res = await contentAssetApi.getPublicAssets({ type: 'Book', status: 'Published' });
        if (res && res.success && res.data && res.data.length > 0) {
          const rawAssets = res.data;
          const normalizeKey = (str) => {
            if (!str) return '';
            const slug = str.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '');
            return slug || 'book-asset';
          };

          // Group assets by groupKey to eliminate duplicate cards for multi-language versions
          const groups = {};
          rawAssets.forEach(b => {
            const key = (b.groupKey && b.groupKey.trim() !== '') ? b.groupKey.trim() : normalizeKey(b.title);
            if (!groups[key]) groups[key] = [];
            groups[key].push(b);
          });

          // Pick 1 best representative variant per groupKey matching langCode & collect all available languages
          const uniqueAssets = Object.values(groups).map(groupVariants => {
            const matchedLang = groupVariants.find(v => 
              (v.languageCode && langCode && v.languageCode.toLowerCase() === langCode.toLowerCase()) || 
              (v.language && v.language.toLowerCase().includes(langCode.toLowerCase()))
            );
            const englishLang = groupVariants.find(v => 
              v.languageCode === 'en' || (v.language && v.language.toLowerCase().includes('english'))
            );

            const langSet = new Set();
            groupVariants.forEach(v => {
              if (v.language) {
                v.language.split(',').forEach(l => {
                  const trimmed = l.trim();
                  if (trimmed) langSet.add(trimmed);
                });
              }
            });

            const rep = matchedLang || englishLang || groupVariants[0];
            return {
              ...rep,
              availableLangs: Array.from(langSet)
            };
          });

          booksData = uniqueAssets.map(b => {
            const desc = b.description || '';
            const isPaid = desc.includes('[hs_access] Paid');
            
            let coverUrl = b.coverUrl || b.image || null;
            if (desc.includes('[hs_cover]')) {
              const coverPart = desc.split('[hs_cover]')[1];
              if (coverPart) {
                const extractedCover = coverPart.split('[hs_chapters]')[0].split('[hs_access]')[0].trim();
                if (extractedCover && extractedCover.startsWith('http')) {
                  coverUrl = extractedCover;
                }
              }
            }

            const cleanDesc = desc
              .split('[hs_cover]')[0]
              .split('[hs_chapters]')[0]
              .split('[hs_access]')[0]
              .trim();

            return {
              id: b.id,
              groupKey: b.groupKey,
              title: b.title,
              category: b.category,
              language: b.language,
              languageCode: b.languageCode,
              availableLangs: b.availableLangs || [b.language || 'English'],
              description: cleanDesc,
              coverUrl: coverUrl,
              mediaUrl: resolveMediaUrl(b.mediaUrl),
              isAdminBook: true,
              isPaid: isPaid
            };
          });
        }
      } catch (err) {
        console.error('BookLibraryScreen: Failed to load admin books from API', err);
      }

      if (booksData.length === 0) {
        // Fallback: localStorage
        const saved = localStorage.getItem('hs_custom_books');
        if (saved) {
          const parsed = JSON.parse(saved).filter(b => b.status === 'Published');
          booksData = parsed.map(b => {
            const desc = b.description || '';
            let coverUrl = b.coverUrl || b.image || null;
            if (desc.includes('[hs_cover]')) {
              const coverPart = desc.split('[hs_cover]')[1];
              if (coverPart) {
                const extractedCover = coverPart.split('[hs_chapters]')[0].split('[hs_access]')[0].trim();
                if (extractedCover && extractedCover.startsWith('http')) {
                  coverUrl = extractedCover;
                }
              }
            }

            const cleanDesc = desc
              .split('[hs_cover]')[0]
              .split('[hs_chapters]')[0]
              .split('[hs_access]')[0]
              .trim();

            return {
              ...b,
              description: cleanDesc,
              coverUrl: coverUrl,
              isAdminBook: true
            };
          });
        }
      }

      if (booksData.length > 0 && langCode !== 'en') {
        try {
          const textsToTranslate = [];
          booksData.forEach(b => {
            textsToTranslate.push(b.title);
            textsToTranslate.push(b.description || '');
          });

          const transRes = await i18nApi.translateTexts(textsToTranslate, langCode);
          if (transRes && transRes.success && transRes.translations) {
            let tIdx = 0;
            booksData = booksData.map(b => {
              const translatedTitle = transRes.translations[tIdx++];
              const translatedDesc = transRes.translations[tIdx++];
              return {
                ...b,
                title: translatedTitle,
                description: translatedDesc
              };
            });
          }
        } catch (transErr) {
          console.error('Failed to translate admin books:', transErr);
        }
      }

      setAdminBooks(booksData);
      setLoadingBooks(false);
    };
    loadAdminBooks();

    const saved = localStorage.getItem('hs_custom_books');
    if (saved) setCustomBooks(JSON.parse(saved));
    const handleStorage = () => {
      const updated = localStorage.getItem('hs_custom_books');
      if (updated) setCustomBooks(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorage);

    const hasVisited = localStorage.getItem('hasVisitedBooks');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedBooks', 'true');
    }

    // Seed Demo Progress for "The Hormonal Roadmap" (ID 2)
    if (!localStorage.getItem('progress_book_2')) {
      localStorage.setItem('progress_book_2', JSON.stringify({ page: 12, total: 20 }));

      const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
      if (!userProgress[2]) {
        userProgress[2] = {
          percent: 60,
          lastRead: new Date().toISOString(),
          time: 300
        };
        localStorage.setItem('userProgress', JSON.stringify(userProgress));
      }
    }
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [langCode]);

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
      const textToSpeak = `Title: ${title}. Description: ${description}`;
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

  const validCustom = customBooks.filter(cb => cb.title && (cb.image || cb.coverUrl) && cb.status === 'Published');
  const rawCombined = [...validCustom, ...adminBooks];
  const seenTitles = new Set();
  const allBooks = rawCombined.filter(b => {
    const key = (b.title || '').trim().toLowerCase();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  }).map(b => ({
    ...b,
    author: b.author || 'HealthSakhi Expert',
    image: b.coverUrl || b.image
  }));

  // Dynamic Progress Calculations
  const userBooksCompleted = profile?.booksCompleted || 0;
  const bookRewards = JSON.parse(localStorage.getItem('hs_book_rewards') || '[]');
  const rewardCompletedIds = bookRewards.map(r => String(r.bookId));
  const rewardCompletedTitles = bookRewards.map(r => (r.bookTitle || '').toLowerCase().trim());
  const completedFromBackend = (backendProgress || []).filter(p => p.completed).map(p => String(p.content_id));
  const allCompletedIds = Array.from(new Set([...completedBooks.map(String), ...completedFromBackend, ...rewardCompletedIds]));
  
  const completedCount = Math.max(userBooksCompleted, allCompletedIds.length);
  const readCount = Math.max(userBooksCompleted, completedCount, (backendProgress || []).filter(p => p.position > 0).length);
  const totalVolumes = allBooks.length;

  let academyRank = t('books.rankSeeker', 'Seeker');
  if (completedCount >= 15) academyRank = t('books.rankMaster', 'Master Sakhi');
  else if (completedCount >= 5) academyRank = t('books.rankWarrior', 'Wellness Warrior');
  else if (completedCount >= 1) academyRank = t('books.rankSeeker', 'Seeker');

  const filteredBooks = allBooks.filter(book => {
    const matchesCategory = activeCategory === 'All' ||
      (book.category || '').trim().toLowerCase() === activeCategory.trim().toLowerCase();
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredAdminBooks = []; // Empty out admin section since they are in main grid now

  const handleBookClick = (book) => {
    if (book.isNew && book.bookFile) {
      setReadBook(book);
      return;
    }

    const currentPlan = userPlanName || localStorage.getItem('hs_user_plan_name') || 'Free Sakhi';
    const isFreeUser = !currentPlan || currentPlan.toLowerCase().includes('free');

    if (isFreeUser && book.isPaid) {
      setShowLimitModal(true);
      return;
    }

    navigate(`/app/books/${book.id}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 relative text-left">

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border border-black/5 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-health-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-health-green">
              <Sparkles size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">{t('books.welcomeTitle', 'Welcome, Sakhi!')}</h2>
            <p className="text-slate-500 font-medium mb-8">{t('books.welcomeSubtitle', 'Ready to start your healing journey through knowledge?')}</p>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full h-14 bg-health-green text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-health-green/20 transition-all hover:scale-105 active:scale-95"
            >
              {t('books.letsStart', "Let's Start")}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] bg-health-green/10 text-health-green">
            <Sparkles size={10} className="sm:w-3 sm:h-3" /> {t('books.memberExclusive', 'Member Exclusive')}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">{t('books.libraryTitle', 'The Sakhi Library')}</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-md">{t('books.librarySubtitle', 'Curated knowledge for your wellness journey.')}</p>
        </div>
      </div>

      {/* Progress Dashboard - 100% Dynamic from Backend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-1">
        <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400"><BookOpen size={16} className="sm:w-5 sm:h-5" /></div>
          <div>
            <p className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('books.totalVolumes', 'Total Volumes')}</p>
            <p className="text-base sm:text-xl font-black text-slate-800">{totalVolumes}</p>
          </div>
        </div>
        <div className="bg-health-green/[0.03] p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-health-green/10 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-health-green/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-health-green"><CheckCircle size={16} className="sm:w-5 sm:h-5" /></div>
          <div>
            <p className="text-[7px] sm:text-[9px] font-black text-health-green uppercase tracking-widest">{t('books.completed', 'Completed')}</p>
            <p className="text-base sm:text-xl font-black text-health-green">{completedCount}</p>
          </div>
        </div>
        <div className="bg-rose-50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-rose-500"><Headphones size={16} className="sm:w-5 sm:h-5" /></div>
          <div>
            <p className="text-[7px] sm:text-[9px] font-black text-rose-400 uppercase tracking-widest">{t('books.booksRead', 'Books Read')}</p>
            <p className="text-base sm:text-xl font-black text-rose-500">{readCount}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-health-green"><Trophy size={16} className="sm:w-5 sm:h-5" /></div>
          <div>
            <p className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('books.academyRank', 'Academy Rank')}</p>
            <p className="text-sm sm:text-lg font-black text-white truncate">{academyRank}</p>
          </div>
        </div>
      </div>

      {/* Repositioned Search Bar */}
      <div className="relative group w-full px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-health-green transition-colors" size={18} />
        <input
          type="text"
          placeholder={t('books.searchPlaceholder', 'Search titles, authors...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 sm:h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-health-green focus:ring-4 focus:ring-health-green/5 transition-all font-bold text-xs sm:text-sm shadow-sm"
        />
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 px-1 -mx-1">
        {getStoredCategories().map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
              : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
          >
            {t('books.categories.' + cat, cat)}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1">
        {filteredBooks.map((book) => {
          const bProg = (backendProgress || []).find(p => String(p.content_id) === String(book.id));
          const isCompletedByTitle = rewardCompletedTitles.includes((book.title || '').toLowerCase().trim());
          const isCompleted = allCompletedIds.includes(book.id) || allCompletedIds.includes(String(book.id)) || bProg?.completed || isCompletedByTitle;

          // Calculate Progress from localStorage
          const savedProgress = JSON.parse(localStorage.getItem(`progress_book_${book.id}`) || 'null');
          const audioProgress = parseFloat(localStorage.getItem(`audio_progress_${book.id}`) || '0');

          let progressPercent = 0;
          let progressText = t('books.notStarted', 'Pending');

          if (isCompleted) {
            progressPercent = 100;
            progressText = t('books.completedText', 'Completed');
          } else if (savedProgress) {
            const total = parseInt(savedProgress.total) || 30;
            const page = parseInt(savedProgress.page) || 0;
            progressPercent = Math.round((page / total) * 100);
            if (isNaN(progressPercent)) progressPercent = 0;
            progressText = `${page} ${t('books.pagesRead', 'Pages Read')}`;
          } else if (bProg && bProg.position > 0) {
            progressPercent = Math.min(95, bProg.position);
            progressText = `In Progress (${progressPercent}%)`;
          } else if (audioProgress > 0) {
            progressPercent = 15;
            progressText = t('books.audioStarted', 'Audio Started');
          }

          return (
            <div
              key={book.id}
              onClick={() => handleBookClick(book)}
              className={`group bg-white rounded-3xl sm:rounded-[2.5rem] border p-3 sm:p-4 transition-all cursor-pointer flex flex-col ${isCompleted ? 'border-health-green/30 bg-health-green/[0.02]' : 'border-slate-100 hover:border-health-green/20 hover:shadow-2xl'}`}
            >
              {/* Cover Image */}
              <div className="relative aspect-[3/4] w-[74%] mx-auto rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 bg-rose-50/20 border border-rose-100/10 flex items-center justify-center p-3">
                <img
                  src={book.image || book.coverUrl || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400'}
                  alt={t(`books.list.${book.id}.title`, book.title)}
                  className="max-w-full max-h-full object-contain rounded-lg sm:rounded-xl shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg"
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[7px] sm:text-[8px] font-black text-white uppercase tracking-widest z-10 flex items-center gap-1">
                  {t(`books.categories.${book.category}`, book.category)}
                </div>
                {book.isPaid ? (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 z-10">
                    PREMIUM 🔒
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 text-white rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 z-10">
                    FREE 🌸
                  </div>
                )}
                {/* Progress Overlay */}
                {!isCompleted && progressPercent > 0 && (
                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
                    <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                      <span className="text-[7px] sm:text-[8px] font-black text-white uppercase tracking-widest">{progressText}</span>
                      <span className="text-[7px] sm:text-[8px] font-black text-health-green uppercase tracking-widest">{progressPercent}%</span>
                    </div>
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-health-green transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-1 flex-1 space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <PlayCircle size={10} className="text-health-green" /> {book.reads} {t('books.readsText', 'Reads')}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const translatedTitle = t(`books.list.${book.id}.title`, book.title);
                        const translatedDesc = t(`books.list.${book.id}.desc`, book.description || book.desc || '');
                        handlePlayBookTts(book.id, translatedTitle, translatedDesc);
                      }}
                      className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${activeTtsId === book.id
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                        }`}
                    >
                      {activeTtsId === book.id ? <VolumeX size={10} /> : <Volume2 size={10} />}
                    </button>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Sparkles key={i} size={8} className="text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight group-hover:text-[#ff69b4] transition-colors line-clamp-1 text-left">
                  {t(`books.list.${book.id}.title`, book.title)}
                </h3>
                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left">{t('books.byAuthor', 'By')} {t(`books.list.${book.id}.author`, book.author)}</p>

                {/* Multi-Language Indicator Badges */}
                {(() => {
                  const rawLangs = book.availableLangs || (book.language ? book.language.split(',').map(s => s.trim()) : ['English']);
                  const langSet = new Set();
                  rawLangs.forEach(l => {
                    const lower = l.toLowerCase();
                    if (lower.includes('english') || lower === 'en') langSet.add('EN');
                    else if (lower.includes('hindi') || lower.includes('हिन्दी') || lower === 'hi') langSet.add('हिन्दी');
                    else if (lower.includes('marathi') || lower.includes('मराठी') || lower === 'mr') langSet.add('मराठी');
                    else if (lower.includes('gujarati') || lower.includes('ગુજરાતી') || lower === 'gu') langSet.add('ગુજરાતી');
                    else if (lower.includes('bengali') || lower.includes('বাংলা') || lower === 'bn') langSet.add('বাংলা');
                    else if (lower.includes('tamil') || lower.includes('தமிழ்') || lower === 'ta') langSet.add('தமிழ்');
                    else if (lower.includes('telugu') || lower.includes('తెలుగు') || lower === 'te') langSet.add('తెలుగు');
                    else if (lower.includes('kannada') || lower.includes('ಕನ್ನಡ') || lower === 'kn') langSet.add('ಕನ್ನಡ');
                    else langSet.add(l.substring(0, 5).toUpperCase());
                  });
                  const list = Array.from(langSet);
                  const visible = list.slice(0, 2);
                  const extra = list.length > 2 ? list.length - 2 : 0;

                  return (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 pb-0.5 text-left">
                      {visible.map((lang, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs"
                        >
                          <Globe size={9} className="text-emerald-600" />
                          {lang}
                        </span>
                      ))}
                      {extra > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                          +{extra}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex-1 mr-3 sm:mr-4">
                  {!isCompleted && progressPercent > 0 && (
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff69b4]" style={{ width: `${progressPercent}%` }} />
                    </div>
                  )}
                </div>
                <button className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1 group-hover:gap-2 transition-all ${isCompleted ? 'text-slate-400' : 'text-[#ff69b4]'}`}>
                  {isCompleted ? t('books.done', 'Done') : progressPercent > 0 ? t('books.resume', 'Resume') : t('books.read', 'Read')} <ChevronRight size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
            <BookOpen size={48} />
          </div>
          <p className="text-xl font-black text-slate-400 uppercase tracking-widest">{t('books.noBooksFound', 'No books found')}</p>
        </div>
      )}

      {/* Book Reader Modal */}
      {readBook && (
        <BookReaderModal
          isOpen={!!readBook}
          onClose={() => setReadBook(null)}
          book={readBook}
        />
      )}

      {/* Premium Book Lock Modal (3-Language i18n) */}
      {showLimitModal && (() => {
        const lockI18n = {
          en: {
            badge: 'Premium Book 🔒',
            title: 'Premium Book Locked',
            desc: 'This book is reserved for Basic Sakhi & Premium Sakhi members. Upgrade your plan to unlock full wellness library access! 🌸',
            upgradeBtn: 'UPGRADE PLAN 🌸',
            closeBtn: 'CLOSE'
          },
          hi: {
            badge: 'प्रीमियम पुस्तक 🔒',
            title: 'प्रीमियम पुस्तक लॉक है',
            desc: 'यह पुस्तक बेसिक सखी और प्रीमियम सखी सदस्यों के लिए आरक्षित है। संपूर्ण वेलनेस लाइब्रेरी एक्सेस अनलॉक करने के लिए अपना प्लान अपग्रेड करें! 🌸',
            upgradeBtn: 'प्लान अपग्रेड करें 🌸',
            closeBtn: 'बंद करें'
          },
          mr: {
            badge: 'प्रीमियम पुस्तक 🔒',
            title: 'प्रीमियम पुस्तक लॉक आहे',
            desc: 'हे पुस्तक बेसिक सखी आणि प्रीमियम सखी सदस्यांसाठी राखीव आहे. संपूर्ण वेलनेस लायब्ररी अ‍ॅक्सेस अनलॉक करण्यासाठी तुमचा प्लॅन अपग्रेड करा! 🌸',
            upgradeBtn: 'प्लॅन अपग्रेड करा 🌸',
            closeBtn: 'बंद करा'
          }
        };
        const currentLockText = lockI18n[langCode?.toLowerCase()] || lockI18n.en;

        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full text-center shadow-2xl border border-black/5 animate-in zoom-in-95 duration-400 relative">
              <button
                onClick={() => setShowLimitModal(false)}
                className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-purple-600 shadow-inner">
                <BookOpen size={38} />
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-3">
                {currentLockText.badge}
              </span>
              <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">{currentLockText.title}</h2>
              <p className="text-slate-500 font-medium text-xs leading-relaxed mb-8">
                {currentLockText.desc}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => { setShowLimitModal(false); navigate('/app/plans'); }}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> {currentLockText.upgradeBtn}
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-3 bg-slate-100 text-slate-500 font-extrabold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
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

export default BookLibraryScreen;

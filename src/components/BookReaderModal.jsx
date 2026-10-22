import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight, BookOpen, Headphones, Square, Trophy, Bookmark, Clock, Sparkles } from 'lucide-react';

import { languageMap, bookTranslations } from '../data/bookTranslations';
import { useTTS } from '../hooks/useTTS';
import { bookHtmlCache } from '../utils/bookHtmlCache';
import {
  getReaderCopy,
  getSakhiTip,
  getSakhiReflection,
  getWellnessLevel,
  estimateMinutesLeft
} from '../data/bookReaderTips';

const ScaleFitContent = ({ children, html, pageIndex, selectedLang, loading }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (loading || !html) return;

    const el = containerRef.current;
    if (!el) return;
    el.style.fontSize = '100%';

    const timeoutId = setTimeout(() => {
      const parent = el.closest('.overflow-hidden');
      if (!parent) return;

      let currentScale = 1.0;
      const maxAttempts = 15;
      let attempt = 0;

      while (parent.scrollHeight > parent.clientHeight && attempt < maxAttempts && currentScale > 0.45) {
        currentScale -= 0.05;
        el.style.fontSize = `${currentScale * 100}%`;
        attempt++;
      }
    }, 40);

    return () => clearTimeout(timeoutId);
  }, [html, pageIndex, selectedLang?.code, loading]);

  return (
    <div ref={containerRef} className="flex-1 max-w-none text-justify book-content flex flex-col justify-between h-full min-h-0">
      <div>
        {children}
      </div>
    </div>
  );
};

const BookReaderModal = ({ isOpen, onClose, book, initialMode }) => {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarkPage, setBookmarkPage] = useState(null);
  const [selectedLang, setSelectedLang] = useState(languageMap[0]);
  const { speak, stop, isPlaying } = useTTS();

  const availableLanguages = useMemo(() => {
    if (!book) return languageMap;
    const langSet = new Set();

    if (Array.isArray(book.availableLangs) && book.availableLangs.length > 0) {
      book.availableLangs.forEach(l => {
        const lower = String(l).toLowerCase();
        if (lower.includes('english') || lower.includes('en')) langSet.add('en');
        if (lower.includes('hindi') || lower.includes('hi') || lower.includes('हिन्दी')) langSet.add('hi');
        if (lower.includes('marathi') || lower.includes('mr') || lower.includes('मराठी')) langSet.add('mr');
      });
    }

    if (book.languageCode) {
      langSet.add(book.languageCode.toLowerCase());
    }
    if (book.language) {
      const lower = String(book.language).toLowerCase();
      if (lower.includes('english') || lower.includes('en')) langSet.add('en');
      if (lower.includes('hindi') || lower.includes('hi') || lower.includes('हिन्दी')) langSet.add('hi');
      if (lower.includes('marathi') || lower.includes('mr') || lower.includes('मराठी')) langSet.add('mr');
    }

    if (langSet.size === 0) return languageMap;

    const filtered = languageMap.filter(l => l && l.code && langSet.has(l.code.toLowerCase()));
    return filtered.length > 0 ? filtered : languageMap;
  }, [book]);

  useEffect(() => {
    if (availableLanguages.length > 0 && !availableLanguages.some(l => l.code === selectedLang.code)) {
      setSelectedLang(availableLanguages[0]);
    }
  }, [availableLanguages, selectedLang.code]);

  const [isMobile, setIsMobile] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [currentPage, selectedLang.code, isOpen]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        // Aligns currentPage to even index when switching to desktop spread
        setCurrentPage(prev => (prev % 2 === 0 ? prev : Math.max(0, prev - 1)));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const readerCopy = getReaderCopy(selectedLang.code);

  const getTranslatedTitle = () => bookData?.title || book?.title || 'Heart to Heart';
  const getTranslatedDesc = () => bookData?.desc || book?.desc || 'Learn essential wellness habits...';

  const getTranslatedChapter = (index) => {
    if (bookData?.chapters?.[index]?.title) {
      return bookData.chapters[index].title;
    }
    return `Chapter ${index + 1}`;
  };

  // Reset spread when opening, switching book, or switching language (page counts differ)
  useEffect(() => {
    if (!isOpen || !book) return;
    setCurrentPage(0);
    setIsFlipping(false);
    setFlipDirection(null);
  }, [isOpen, book?.id, selectedLang.code]);

  // Load book metadata and content from compiled static JSONs
  useEffect(() => {
    if (!isOpen || !book) return;

    setLoading(true);
    const langCode = selectedLang.code;

    fetch(`/books/book_${book.id}_${langCode}.json`)
      .then(res => res.json())
      .then(data => {
        setBookData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load book data for modal:', err);
        // Fallback to English
        if (langCode !== 'en') {
          fetch(`/books/book_${book.id}_en.json`)
            .then(res => res.json())
            .then(data2 => {
              setBookData(data2);
              setLoading(false);
            })
            .catch(err2 => {
              console.error('Failed to load fallback book data in modal:', err2);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  }, [isOpen, book?.id, selectedLang.code]);

  useEffect(() => {
    if (!book?.id) return;
    try {
      const saved = localStorage.getItem(`bookmark_book_${book.id}`);
      setBookmarkPage(saved != null ? parseInt(saved, 10) : null);
    } catch {
      setBookmarkPage(null);
    }
  }, [book?.id]);

  const pages = bookData?.pages || [];

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const chapterCount = useMemo(() => {
    return bookData?.chapters?.length || 0;
  }, [bookData]);

  const readPercent = pages.length
    ? Math.min(100, Math.round(((currentPage + (isMobile ? 1 : 2)) / pages.length) * 100))
    : 0;

  const displayPageEnd = pages.length ? Math.min(currentPage + (isMobile ? 1 : 2), pages.length) : 0;
  const minsLeft = estimateMinutesLeft(pages, currentPage);
  const wellnessKey = getWellnessLevel(readPercent);
  const wellnessLabel = readerCopy.levels[wellnessKey];

  const activeChapterIndex = useMemo(() => {
    if (!bookData?.chapters || !bookData.chapters.length) return 0;
    const idx = bookData.chapters.findIndex(ch => currentPage >= ch.startPage && currentPage <= ch.endPage);
    return idx !== -1 ? idx : 0;
  }, [currentPage, bookData?.chapters]);

  const tipIndex = Math.floor(currentPage / 2) + (book?.id || 0);

  const isShortPage = (html) => {
    if (!html) return false;
    const len = stripHtml(html).trim().length;
    return len > 0 && len < 380;
  };

  const jumpToChapter = (chapterIndex) => {
    if (!bookData?.chapters?.[chapterIndex]) return;
    const start = bookData.chapters[chapterIndex].startPage;
    if (isMobile) {
      setCurrentPage(start);
    } else {
      const aligned = start % 2 === 0 ? start : Math.max(0, start - 1);
      setCurrentPage(aligned);
    }
  };

  const toggleBookmark = () => {
    if (!book?.id) return;
    const next = bookmarkPage === currentPage ? null : currentPage;
    setBookmarkPage(next);
    try {
      if (next == null) localStorage.removeItem(`bookmark_book_${book.id}`);
      else localStorage.setItem(`bookmark_book_${book.id}`, String(next));
    } catch {
      /* ignore */
    }
  };

  const goToBookmark = () => {
    if (bookmarkPage != null && bookmarkPage < pages.length) {
      if (isMobile) {
        setCurrentPage(bookmarkPage);
      } else {
        setCurrentPage(bookmarkPage % 2 === 0 ? bookmarkPage : Math.max(0, bookmarkPage - 1));
      }
    }
  };

  const SakhiNote = ({ pageHtml, index }) => {
    if (loading || !isShortPage(pageHtml)) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 sm:mt-4 bg-[#FFF0F5] border border-[#FCE4EC] rounded-xl p-3 sm:p-4 shadow-sm"
      >
        <p className="text-[9px] font-black text-[#E91E63] uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Sparkles size={11} /> Sakhi Reflection
        </p>
        <p className="text-[11px] sm:text-xs font-serif italic font-bold text-[#E91E63]/85 leading-relaxed">
          &ldquo;{getSakhiReflection(selectedLang.code, index)}&rdquo;
        </p>
      </motion.div>
    );
  };

  const handleListen = () => {
    if (isPlaying) {
      stop();
    } else {
      const textToSpeak = isMobile
        ? (pages[currentPage] || '')
        : (pages[currentPage] || '') + ' ' + (pages[currentPage + 1] || '');
      const cleanStr = (textToSpeak || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      speak(cleanStr, selectedLang.code || selectedLang.voice);
    }
  };

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const nextPage = () => {
    if (isFlipping) return;
    if (isMobile) {
      if (currentPage + 1 < pages.length) {
        setFlipDirection('next');
        setIsFlipping(true);
      }
    } else {
      if (currentPage + 2 < pages.length) {
        setFlipDirection('next');
        setIsFlipping(true);
      }
    }
  };

  const prevPage = () => {
    if (isFlipping) return;
    if (currentPage > 0) {
      setFlipDirection('prev');
      setIsFlipping(true);
    }
  };

  const handleFlipComplete = () => {
    if (flipDirection === 'next') {
      setCurrentPage(prev => prev + (isMobile ? 1 : 2));
    } else if (flipDirection === 'prev') {
      setCurrentPage(prev => Math.max(0, prev - (isMobile ? 1 : 2)));
    }
    setIsFlipping(false);
    setFlipDirection(null);
  };

  // Calculations for static and flipping pages
  // Desktop
  const desktopLeftStaticIdx = isFlipping
    ? (flipDirection === 'next' ? currentPage : currentPage - 2)
    : currentPage;
  const desktopRightStaticIdx = isFlipping
    ? (flipDirection === 'next' ? currentPage + 3 : currentPage + 1)
    : currentPage + 1;
  const desktopFlipFrontIdx = flipDirection === 'next' ? currentPage + 1 : currentPage;
  const desktopFlipBackIdx = flipDirection === 'next' ? currentPage + 2 : currentPage - 1;

  // Mobile
  const mobileStaticPageIdx = isFlipping
    ? (flipDirection === 'next' ? currentPage + 1 : currentPage - 1)
    : currentPage;
  const mobileFlipFrontPageIdx = currentPage;
  const mobileFlipBackPageIdx = flipDirection === 'next' ? currentPage + 1 : currentPage - 1;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#F7F9F9] flex flex-col font-['Poppins']"
      >
        {/* Top Header */}
        <div className="shrink-0 bg-white border-b border-gray-200 shadow-sm z-10 px-3 sm:px-6 py-2.5 sm:py-0 sm:h-[70px] flex items-center min-h-[52px]">
          <div className="flex w-full items-center gap-2">
            <div className="flex flex-1 justify-start min-w-0">
              <button
                onClick={() => { stop(); onClose(); }}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-gray-800 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-colors shrink-0"
              >
                <ArrowLeft size={16} className="shrink-0" />
                <span className="hidden sm:inline">Back to Library</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
            <div className="flex min-w-0 max-w-[55vw] sm:max-w-[min(50vw,20rem)] items-center justify-center gap-2 shrink">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E91E63] flex items-center justify-center text-white shadow-md shrink-0">
                <BookOpen size={14} className="sm:w-4 sm:h-4" />
              </div>
              <h1 className="font-black text-[10px] sm:text-sm text-[#2D1B3D] uppercase tracking-widest truncate">
                {getTranslatedTitle().toUpperCase()}
              </h1>
            </div>
            <div className="flex flex-1 justify-end min-w-[2.5rem] items-center">
              <button
                onClick={() => setShowMobileMenu(prev => !prev)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-[#E91E63] bg-white font-black text-[10px] uppercase tracking-wider transition-all hover:bg-rose-50 hover:border-[#E91E63]/30"
              >
                <BookOpen size={13} />
                <span>{showMobileMenu ? 'Close' : 'Menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 pb-[140px] sm:pb-[100px] lg:pb-[88px]">

          {/* Sidebar Drawer Backdrop for Mobile */}
          {isMobile && showMobileMenu && (
            <div
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs"
              onClick={() => setShowMobileMenu(false)}
            />
          )}

          {/* Sidebar */}
          <AnimatePresence>
            {(showMobileMenu || !isMobile) && (
              <motion.div
                initial={isMobile ? { x: '-100%' } : { x: 0 }}
                animate={{ x: 0 }}
                exit={isMobile ? { x: '-100%' } : undefined}
                transition={{ type: 'tween', duration: 0.25 }}
                className={`
                  ${isMobile
                    ? 'fixed top-[52px] sm:top-[70px] bottom-[140px] sm:bottom-[100px] left-0 z-40 w-[290px] border-r border-gray-200 shadow-2xl bg-white flex flex-col pt-6 pb-6 px-4'
                    : 'w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0 h-full min-h-0 pt-8 px-6 pb-6 lg:max-h-none'
                  }
                  overflow-y-auto no-scrollbar
                `}
              >
                {/* Book Cover */}
                <div className="w-28 sm:w-36 lg:w-40 aspect-[3/4] mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-xl mb-4 sm:mb-6 border border-gray-50 shrink-0 bg-slate-50 flex items-center justify-center">
                  <img src={book?.img || book?.image} alt="" className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl" />
                </div>

                {/* Language Selector Strip */}
                <div className="mb-4 sm:mb-8 text-left">
                  <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 sm:mb-3 px-1">Select Language</h3>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 snap-x snap-mandatory">
                    {availableLanguages.filter(l => l && l.code).map((lang, langIdx) => (
                      <button
                        key={`lang-${lang.code}-${langIdx}`}
                        onClick={() => setSelectedLang(lang)}
                        className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedLang.code === lang.code
                          ? 'bg-[#E91E63] border-[#E91E63] text-white shadow-lg shadow-[#E91E63]/20 scale-105'
                          : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                          }`}
                      >
                        {lang.native}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Insight Summary */}
                <div className="bg-[#FFF5F7] border border-[#FFE4E9] rounded-2xl p-4 sm:p-5 mb-4 sm:mb-8 text-left">
                  <div className="flex items-center gap-2 text-[#E91E63] font-black text-[10px] uppercase tracking-widest mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#E91E63]/20 flex items-center justify-center text-[10px]">✨</span>
                    Insight Summary
                  </div>
                  <p className="text-xs font-medium text-[#4B1E5A] leading-relaxed">
                    {getTranslatedDesc()}
                  </p>
                </div>

                {/* Table of Contents */}
                <div className="flex-1 min-h-0 text-left">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Table of Contents</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {Array.from({ length: chapterCount }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => jumpToChapter(i)}
                        className={`w-full flex items-center gap-3 sm:gap-4 text-left rounded-xl px-2 py-2 sm:py-2.5 transition-all ${activeChapterIndex === i
                          ? 'bg-[#FFF0F5] border border-[#FCE4EC]'
                          : 'hover:bg-gray-50 border border-transparent'
                          }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${activeChapterIndex === i
                            ? 'bg-[#E91E63] text-white'
                            : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                          {i + 1}
                        </div>
                        <span
                          className={`text-[11px] font-bold leading-tight line-clamp-2 ${activeChapterIndex === i ? 'text-[#E91E63]' : 'text-[#4B1E5A]/70'
                            }`}
                        >
                          {getTranslatedChapter(i)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4 sm:pt-6 space-y-3 sm:space-y-4 shrink-0 text-left">
                  <motion.div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{readerCopy.readingProgress}</p>
                      <span className="text-[10px] font-black text-[#E91E63] tabular-nums">{readPercent}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] rounded-full"
                        animate={{ width: `${readPercent}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-[#4B1E5A]/70">
                      <span>
                        {readerCopy.pageOf} {isMobile ? `${currentPage + 1}` : `${currentPage + 1}–${displayPageEnd}`} {readerCopy.of} {pages.length || '—'}
                      </span>
                      {pages.length > 0 && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock size={11} className="shrink-0" />
                          ~{minsLeft} {readerCopy.minsLeft}
                        </span>
                      )}
                    </div>
                  </motion.div>

                  <div className="bg-[#FDF8FF] border border-[#EDE4F5] rounded-2xl p-4">
                    <p className="text-[9px] font-black text-[#6A1B9A] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} /> {readerCopy.sakhiTip}
                    </p>
                    <p className="text-[11px] font-medium text-[#4B1E5A]/80 leading-relaxed">{getSakhiTip(selectedLang.code, tipIndex)}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={toggleBookmark}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${bookmarkPage === currentPage
                        ? 'bg-[#E91E63] border-[#E91E63] text-white'
                        : 'bg-white border-gray-100 text-[#4B1E5A]/70 hover:border-[#E91E63]/30'
                        }`}
                    >
                      <Bookmark size={14} className={bookmarkPage === currentPage ? 'fill-current' : ''} />
                      {bookmarkPage === currentPage ? readerCopy.bookmarked : readerCopy.bookmark}
                    </button>
                    {bookmarkPage != null && bookmarkPage !== currentPage && (
                      <button
                        type="button"
                        onClick={goToBookmark}
                        className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#E91E63]/30 text-[#E91E63] bg-[#FFF0F5] hover:bg-[#FFE4EC] transition-colors"
                      >
                        {readerCopy.pageOf} {bookmarkPage + 1}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reading Area */}
          <div className="flex-1 bg-[#F7F9F9] relative flex flex-col items-stretch justify-center min-h-0 px-2 py-3 sm:p-4 lg:p-8 overflow-hidden select-none">

            <button
              onClick={prevPage}
              disabled={currentPage === 0 || isFlipping}
              className="absolute z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-gray-400 flex items-center justify-center hover:scale-105 hover:text-[#E91E63] transition-all border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed left-1 top-1/2 -translate-y-1/2 lg:left-4 xl:left-8"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Book Layout: Fixed size with 3D perspective wrapper */}
            <div
              className="relative w-full max-w-sm sm:max-w-lg lg:max-w-5xl h-[60vh] sm:h-[65vh] lg:h-[75vh] max-h-[600px] mx-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-150 flex my-auto select-none overflow-hidden"
              style={{ perspective: '2000px' }}
            >
              {loading && (
                <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <motion.div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E91E63]" />
                  <p className="text-[11px] font-black text-[#E91E63] uppercase tracking-widest animate-pulse">
                    Loading Wellness Guide...
                  </p>
                </div>
              )}

              {isMobile ? (
                // Mobile View: Single Page Flip
                <div className="relative w-full h-full bg-white flex flex-col justify-between p-5 sm:p-6 overflow-hidden">
                  {/* Static revealed page */}
                  <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
                    {pages[mobileStaticPageIdx] && (
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-wider mb-2">
                        Page {mobileStaticPageIdx + 1}
                      </div>
                    )}
                    <ScaleFitContent
                      html={pages[mobileStaticPageIdx] || 'End of Book.'}
                      pageIndex={mobileStaticPageIdx}
                      selectedLang={selectedLang}
                      loading={loading}
                    >
                      <div dangerouslySetInnerHTML={{ __html: pages[mobileStaticPageIdx] || 'End of Book.' }} />
                      <SakhiNote pageHtml={pages[mobileStaticPageIdx]} index={mobileStaticPageIdx} />
                    </ScaleFitContent>
                  </div>

                  {/* Flipping page overlay */}
                  {isFlipping && (
                    <motion.div
                      className="absolute inset-0 bg-white z-20 preserve-3d"
                      style={{
                        transformOrigin: 'left center',
                        transformStyle: 'preserve-3d',
                      }}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: flipDirection === 'next' ? -180 : 180 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      onAnimationComplete={handleFlipComplete}
                    >
                      {/* Front of turning page */}
                      <div
                        className="absolute inset-0 bg-white p-5 sm:p-6 border-l border-gray-100 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        {pages[mobileFlipFrontPageIdx] && (
                          <div className="text-[10px] font-black text-gray-300 uppercase tracking-wider mb-2">
                            Page {mobileFlipFrontPageIdx + 1}
                          </div>
                        )}
                        <ScaleFitContent
                          html={pages[mobileFlipFrontPageIdx] || ''}
                          pageIndex={mobileFlipFrontPageIdx}
                          selectedLang={selectedLang}
                          loading={loading}
                        >
                          <div dangerouslySetInnerHTML={{ __html: pages[mobileFlipFrontPageIdx] || '' }} />
                          <SakhiNote pageHtml={pages[mobileFlipFrontPageIdx]} index={mobileFlipFrontPageIdx} />
                        </ScaleFitContent>
                      </div>

                      {/* Back of turning page */}
                      <div
                        className="absolute inset-0 bg-white p-5 sm:p-6 border-r border-gray-100 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        {pages[mobileFlipBackPageIdx] && (
                          <div className="text-[10px] font-black text-gray-300 uppercase tracking-wider mb-2">
                            Page {mobileFlipBackPageIdx + 1}
                          </div>
                        )}
                        <ScaleFitContent
                          html={pages[mobileFlipBackPageIdx] || ''}
                          pageIndex={mobileFlipBackPageIdx}
                          selectedLang={selectedLang}
                          loading={loading}
                        >
                          <div dangerouslySetInnerHTML={{ __html: pages[mobileFlipBackPageIdx] || '' }} />
                          <SakhiNote pageHtml={pages[mobileFlipBackPageIdx]} index={mobileFlipBackPageIdx} />
                        </ScaleFitContent>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                // Desktop View: Double Page Flip Spread
                <div className="relative w-full h-full flex overflow-visible">
                  {/* Left Static Page */}
                  <div className="w-1/2 h-full bg-gradient-to-r from-gray-50/10 to-white rounded-l-2xl border-r border-gray-100/50 p-5 sm:p-6 lg:p-8 overflow-hidden flex flex-col justify-between relative">
                    {pages[desktopLeftStaticIdx] && (
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">
                        Page {desktopLeftStaticIdx + 1}
                      </div>
                    )}
                    <ScaleFitContent
                      html={pages[desktopLeftStaticIdx] || 'End of Book.'}
                      pageIndex={desktopLeftStaticIdx}
                      selectedLang={selectedLang}
                      loading={loading}
                    >
                      <div dangerouslySetInnerHTML={{ __html: pages[desktopLeftStaticIdx] || 'End of Book.' }} />
                      <SakhiNote pageHtml={pages[desktopLeftStaticIdx]} index={desktopLeftStaticIdx} />
                    </ScaleFitContent>
                  </div>

                  {/* Right Static Page */}
                  <div className="w-1/2 h-full bg-gradient-to-l from-gray-50/10 to-white rounded-r-2xl p-5 sm:p-6 lg:p-8 overflow-hidden flex flex-col justify-between relative">
                    {pages[desktopRightStaticIdx] && (
                      <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 text-right">
                        Page {desktopRightStaticIdx + 1}
                      </div>
                    )}
                    <ScaleFitContent
                      html={pages[desktopRightStaticIdx] || ''}
                      pageIndex={desktopRightStaticIdx}
                      selectedLang={selectedLang}
                      loading={loading}
                    >
                      <div dangerouslySetInnerHTML={{ __html: pages[desktopRightStaticIdx] || '' }} />
                      <SakhiNote pageHtml={pages[desktopRightStaticIdx]} index={desktopRightStaticIdx} />
                    </ScaleFitContent>
                  </div>

                  {/* Middle Center Spine shadow overlay */}
                  <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[30px] -translate-x-1/2 bg-gradient-to-r from-black/5 via-transparent to-black/5 z-10" />
                  <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-200 z-30" />

                  {/* Turning page overlay */}
                  {isFlipping && (
                    <motion.div
                      className="absolute top-0 bottom-0 w-1/2 z-20 preserve-3d"
                      style={{
                        left: flipDirection === 'next' ? '50%' : '0%',
                        transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
                        transformStyle: 'preserve-3d',
                      }}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: flipDirection === 'next' ? -180 : 180 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      onAnimationComplete={handleFlipComplete}
                    >
                      {/* Front face of turning page */}
                      <div
                        className="absolute inset-0 bg-white p-5 sm:p-6 lg:p-8 border-l border-gray-150 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        {pages[desktopFlipFrontIdx] && (
                          <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">
                            Page {desktopFlipFrontIdx + 1}
                          </div>
                        )}
                        <ScaleFitContent
                          html={pages[desktopFlipFrontIdx] || ''}
                          pageIndex={desktopFlipFrontIdx}
                          selectedLang={selectedLang}
                          loading={loading}
                        >
                          <div dangerouslySetInnerHTML={{ __html: pages[desktopFlipFrontIdx] || '' }} />
                          <SakhiNote pageHtml={pages[desktopFlipFrontIdx]} index={desktopFlipFrontIdx} />
                        </ScaleFitContent>
                      </div>

                      {/* Back face of turning page */}
                      <div
                        className="absolute inset-0 bg-white p-5 sm:p-6 lg:p-8 border-r border-gray-150 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        {pages[desktopFlipBackIdx] && (
                          <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">
                            Page {desktopFlipBackIdx + 1}
                          </div>
                        )}
                        <ScaleFitContent
                          html={pages[desktopFlipBackIdx] || ''}
                          pageIndex={desktopFlipBackIdx}
                          selectedLang={selectedLang}
                          loading={loading}
                        >
                          <div dangerouslySetInnerHTML={{ __html: pages[desktopFlipBackIdx] || '' }} />
                          <SakhiNote pageHtml={pages[desktopFlipBackIdx]} index={desktopFlipBackIdx} />
                        </ScaleFitContent>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage + (isMobile ? 1 : 2) >= pages.length || isFlipping}
              className="absolute z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-gray-400 flex items-center justify-center hover:scale-105 hover:text-[#E91E63] transition-all border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed right-1 top-1/2 -translate-y-1/2 lg:right-4 xl:right-8"
              aria-label="Next page"
            >
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Audio Player Bar */}
        <div className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] px-3 py-3 sm:px-6 sm:py-0 sm:h-[80px] sm:flex sm:items-center sm:justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-0">

          <div className="flex items-center gap-3 min-w-0 sm:w-auto sm:max-w-[280px] shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF0F5] text-[#E91E63] flex items-center justify-center shrink-0">
              <Headphones size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-[10px] sm:text-xs text-[#2D1B3D] uppercase tracking-widest truncate">{getTranslatedTitle()}</h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 truncate">Listening in {selectedLang.native}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center gap-2 sm:gap-4 sm:px-4 min-w-0 w-full sm:w-auto">
            <button
              onClick={handleListen}
              className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${isPlaying
                ? 'bg-rose-500 text-white shadow-lg animate-pulse'
                : 'bg-[#E91E63] text-white shadow-lg active:scale-[0.98] sm:hover:scale-105'
                }`}
            >
              {isPlaying ? <Square size={16} fill="currentColor" /> : <Volume2 size={16} />}
              <span className="truncate">{isPlaying ? 'Stop' : `Listen — ${selectedLang.label}`}</span>
            </button>

            <p className="hidden md:block text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0 tabular-nums">
              {readerCopy.pagesLabel} {isMobile ? `${currentPage + 1}` : `${currentPage + 1}–${displayPageEnd}`}/{pages.length || 0}
            </p>
            <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0 w-full">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full relative overflow-hidden min-w-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pages.length ? Math.min(100, ((currentPage + (isMobile ? 1 : 2)) / pages.length) * 100) : 0}%` }}
                  className="h-full bg-[#E91E63] rounded-full"
                />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0 tabular-nums text-right min-w-[3.25rem] sm:min-w-20">
                {loading
                  ? `Loading...`
                  : `${pages.length ? Math.min(100, Math.round(((currentPage + (isMobile ? 1 : 2)) / pages.length) * 100)) : 0}% Read`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:border-l border-gray-100 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100/80 shrink-0">
            <div className="text-left sm:text-right min-w-0">
              <p className="text-[9px] font-black text-[#E91E63] uppercase tracking-widest">{readerCopy.wellnessLevel}</p>
              <p className="text-[8px] font-bold text-[#E91E63] uppercase hidden sm:block">{wellnessLabel}</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase hidden md:block">{readerCopy.keepReading}</p>
            </div>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${readPercent >= 75 ? 'bg-[#E91E63] text-white' : readPercent >= 50 ? 'bg-amber-100 text-amber-600' : readPercent >= 25 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-300'}`}>
              <Trophy size={16} />
            </div>
          </div>

        </div>

      </motion.div>
      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .preserve-3d {
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(233, 30, 99, 0.25);
          border-radius: 10px;
        }
        .book-content {
          font-size: clamp(10.5px, 2vh, 14.5px);
          line-height: 1.45;
          color: #4B1E5A;
        }
        .book-content h1 {
          font-size: clamp(13.5px, 2.7vh, 19.5px);
          font-weight: 800;
          color: #E91E63;
          margin-bottom: 0.4rem;
          margin-top: 0.1rem;
          line-height: 1.25;
        }
        .book-content h2 {
          font-size: clamp(12.5px, 2.4vh, 17.5px);
          font-weight: 800;
          color: #E91E63;
          margin-bottom: 0.4rem;
          margin-top: 0.1rem;
          line-height: 1.25;
        }
        .book-content h3 {
          font-size: clamp(11.5px, 2.2vh, 15.5px);
          font-weight: 700;
          color: #6A1B9A;
          margin-bottom: 0.3rem;
          margin-top: 0.1rem;
          line-height: 1.25;
        }
        .book-content p {
          margin-bottom: 0.45rem;
          line-height: 1.4;
        }
        .book-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.6rem;
          background: #FFF9FB;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #FCE4EC;
        }
        .book-content td {
          padding: 0.5rem 0.75rem;
          color: #4B1E5A;
          font-size: clamp(9.5px, 1.8vh, 12.5px);
          line-height: 1.35;
        }
        .book-content strong {
          color: #E91E63;
          font-weight: 800;
        }
        .book-content em {
          color: #6A1B9A;
          font-style: italic;
        }
      `}</style>
    </AnimatePresence>
  );
};

export default BookReaderModal;

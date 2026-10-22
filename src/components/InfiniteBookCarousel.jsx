import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationFrame, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


const books = [
  {
    title: 'The PCOD Solution',
    subtitle: 'Hormonal Balance',
    description: 'A holistic guide to managing PCOD through Ayurveda and lifestyle changes.',
    bgColor: 'bg-[#FFF9F5]',
    accentColor: 'text-turmeric-amber',
    image: '/Images/hunger ChatGPT Image Feb 6, 2026, 10_53_00 PM.png'
  },
  {
    title: "Women's Wellness",
    subtitle: 'Daily Rituals',
    description: 'Timeless wisdom for the modern woman to stay balanced and energetic.',
    bgColor: 'bg-[#FDF5FF]',
    accentColor: 'text-sindoor-rose',
    image: '/Images/heart  ChatGPT Image Feb 7, 2026, 09_46_44 PM.png'
  },
  {
    title: 'Ayurveda Today',
    subtitle: 'Ancient Wisdom',
    description: 'Integrating ancient Ayurvedic principles into your contemporary lifestyle.',
    bgColor: 'bg-[#F5FFF9]',
    accentColor: 'text-green-600',
    image: '/Images/HS HOW TO READ HUSBAND COVE R.png'
  },
  {
    title: 'Cycle Balance',
    subtitle: 'Period Health',
    description: 'Understand your monthly rhythm and achieve pain-free cycles.',
    bgColor: 'bg-[#FFF5F5]',
    accentColor: 'text-red-500',
    image: '/Images/HS MENOPAUSE.png'
  },
  {
    title: 'Motherhood',
    subtitle: 'Pre & Post Natal',
    description: 'Supporting you through the most beautiful transition of life.',
    bgColor: 'bg-[#F5FFFF]',
    accentColor: 'text-lotus-deep',
    image: '/Images/Gemini_Generated_Image_uw8kj4uw8kj4uw8k.png',
    bookFile: '/books/Beyond_Parenting_HealthSakhi (1)_compressed.pdf'
  },
  {
    title: 'Hormone Harmony',
    subtitle: 'Endocrine Care',
    description: 'Natural ways to regulate and revitalize your system.',
    bgColor: 'bg-[#FFF5FF]',
    accentColor: 'text-sindoor-rose',
    image: '/Images/Gemini_Generated_Image_rr6333rr6333rr63.png',
    bookFile: '/books/HealthSakhi_Complete_ThreeParts (2).pdf'
  }
];

const CARD_WIDTH = 240;
const CARD_GAP = 40;
const TOTAL_WIDTH = CARD_WIDTH + CARD_GAP;

const InfiniteBookCarousel = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [customBooks, setCustomBooks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('hs_custom_books');
    if (saved) {
      setCustomBooks(JSON.parse(saved));
    }
    
    // Listen for storage changes if same window
    const handleStorage = () => {
      const updated = localStorage.getItem('hs_custom_books');
      if (updated) setCustomBooks(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const containerRef = useRef(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setDirection(0);
  }

  const turnNext = () => {
    if (pageNumber + 1 >= numPages) return;
    setDirection(1);
    setPageNumber(p => Math.min(numPages || p, p + 2));
  };

  const turnPrev = () => {
    if (pageNumber <= 1) return;
    setDirection(-1);
    setPageNumber(p => Math.max(1, p - 2));
  };

  // Motion values for high performance
  const x = useMotionValue(0);
  const baseVelocity = -2.0; // Increased speed

  const combinedBooks = useMemo(() => {
    // Filter out invalid or incomplete custom books (broken uploads)
    const validCustom = customBooks.filter(cb => cb.title && (cb.image || cb.coverUrl));
    
    // If there are custom books, replace the corresponding number of default books
    // so the total count remains the same, fulfilling "1 card kam hojaye or naya card dikhe"
    const countToKeep = Math.max(0, books.length - validCustom.length);
    return [...validCustom.map(cb => ({...cb, bgColor: 'bg-[#FFF9F5]', accentColor: 'text-turmeric-amber'})), ...books.slice(0, countToKeep)];
  }, [customBooks]);

  // Infinite looping logic
  // We triple the books to make sure we always have enough to cover the screen
  const items = useMemo(() => [...combinedBooks, ...combinedBooks, ...combinedBooks], [combinedBooks]);
  const loopWidth = combinedBooks.length * TOTAL_WIDTH;

  useAnimationFrame((t, delta) => {
    if (isHovered) return;

    let moveBy = baseVelocity * (delta / 16); // Normalize by frame rate
    let nextX = x.get() + moveBy;

    // Seamless loop reset
    if (nextX <= -loopWidth) {
      nextX = 0;
    }

    x.set(nextX);

    // Dynamic center detection
    const containerCenter = 0; // Relative to the motion div's start (due to px-[50%] centering)
    let closestId = null;
    let minDistance = Infinity;

    // Offset detection point slightly to the right so it triggers earlier
    const detectionOffset = 80;

    items.forEach((_, i) => {
      const itemPos = x.get() + (i * TOTAL_WIDTH);
      const distance = Math.abs(itemPos - detectionOffset);
      if (distance < minDistance) {
        minDistance = distance;
        closestId = i % combinedBooks.length;
      }
    });

    if (closestId !== activeId) {
      setActiveId(closestId);
    }
  });

  const handleHover = (id) => {
    setIsHovered(true);
    setActiveId(id);
  };

  return (
    <div className="w-full relative py-12 overflow-visible select-none" ref={containerRef}>
      <div className="relative flex items-center justify-center h-[350px]">
        {/* The Ticker Container */}
        <motion.div
          className="flex gap-10 px-[50%]"
          style={{ x }}
        >
          {items.map((book, idx) => {
            const originalIndex = idx % combinedBooks.length;
            const isActive = originalIndex === activeId;

            return (
              <motion.div
                key={`${book.title}-${idx}`}
                className={`relative min-w-[240px] h-[300px] rounded-2xl ${book.bgColor} border border-earth-dark/5 shadow-sm p-5 flex flex-col items-center justify-center text-center transition-all duration-500`}
                animate={{
                  scale: isActive ? 1.15 : 0.9,
                  y: isActive ? -25 : 10,
                  opacity: isActive ? 1 : 0.7,
                  boxShadow: isActive
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                    : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                  zIndex: isActive ? 50 : 1
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                onMouseEnter={() => handleHover(originalIndex)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* NEW Badge */}
                {book.isNew && (
                  <div className="absolute -top-3 -right-3 z-50 bg-turmeric-amber text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border-2 border-white animate-pulse">
                    NEW ✨
                  </div>
                )}

                {/* Book Image Cover */}
                {(book.image || book.coverUrl) && (
                  <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden bg-rose-50/20 flex items-center justify-center">
                    <img
                      src={book.image || book.coverUrl}
                      alt={book.title}
                      className="max-w-full max-h-full object-contain transition-opacity duration-500 opacity-100"
                    />
                    {/* Gradient Overlay for text readability if no popup */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60"></div>
                  </div>
                )}

                {/* Book Title (Hidden when active to let popup take over) */}
                {!isActive && (
                  <span className={`relative z-10 text-[11px] font-black uppercase leading-tight tracking-widest ${(book.image || book.coverUrl) ? 'text-white drop-shadow-md' : book.accentColor} mb-2`}>
                    {book.title}
                  </span>
                )}

                {/* Aesthetic Detail Dots */}
                <div className="flex gap-1.5 mt-auto">
                  {[1, 2, 3].map(dot => (
                    <div key={dot} className={`w-1 h-1 rounded-full ${book.accentColor} opacity-20`}></div>
                  ))}
                </div>

                {/* "Read more" button - Shows only when zoomed/active */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-4 left-0 right-0 z-50 flex justify-center"
                    >
                      <button
                        className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-turmeric-amber/20 text-[10px] font-black uppercase tracking-widest text-turmeric-amber hover:bg-turmeric-amber hover:text-white transition-all scale-110"
                        onClick={() => setSelectedBook(book)}
                      >
                        Read more →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Indicators (Visual Only for Loop) */}
      <div className="flex justify-center gap-2 mt-8">
        {combinedBooks.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${i === activeId ? 'w-8 bg-turmeric-amber' : 'w-2 bg-turmeric-amber/20'
              }`}
          />
        ))}
      </div>

      {/* Book Reader Modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedBook(null)}
          >
            <motion.div
              initial={{ scaleX: 0, opacity: 0, transformOrigin: 'center' }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="relative max-w-7xl w-full flex justify-center items-center h-[85vh] sm:h-[90vh] lg:h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedBook.bookFile ? (
                /* Pure Realistic E-Book Reader with 3D Flip */
                <div 
                  className="relative flex shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-md transition-transform duration-300" 
                  style={{ 
                    perspective: '2500px',
                    transform: windowWidth < 1200 ? `scale(${Math.min(1.2, (windowWidth - 20) / (windowWidth < 768 ? 800 : 1200))})` : 'none'
                  }}
                >
                  
                  {/* Floating Close Button */}
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 hover:bg-red-600 border-2 border-white shadow-xl rounded-full flex items-center justify-center text-white text-xl font-bold transition-all z-50"
                  >
                    ×
                  </button>

                  <Document 
                    file={selectedBook.bookFile} 
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex relative"
                    loading={
                      <div className="flex flex-col items-center justify-center text-white/50 animate-pulse w-[800px] h-[500px]">
                        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Opening Book...</p>
                      </div>
                    }
                  >
                    <div className="flex w-full bg-white shadow-xl rounded-md overflow-hidden relative">
                      {/* Left Page Container */}
                      <div 
                        className="relative w-1/2 cursor-pointer group border-r border-black/10"
                        onClick={turnPrev}
                        style={{ perspective: '2000px' }}
                      >
                        <AnimatePresence initial={false} custom={direction} mode="popLayout">
                          <motion.div
                            key={pageNumber}
                            custom={direction}
                            initial={{ 
                              rotateY: direction === -1 ? -90 : 0, 
                              opacity: direction === -1 ? 0 : 1,
                              transformOrigin: 'right center'
                            }}
                            animate={{ 
                              rotateY: 0, 
                              opacity: 1,
                              zIndex: direction === -1 ? 10 : 1
                            }}
                            exit={{ 
                              rotateY: direction === 1 ? 90 : 0, 
                              opacity: direction === 1 ? 0 : 1,
                              transformOrigin: 'right center',
                              zIndex: direction === 1 ? 10 : 1
                            }}
                            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.8 }}
                            className="bg-white rounded-l-md"
                          >
                            <Page 
                              pageNumber={pageNumber} 
                              width={550} 
                              renderTextLayer={false} 
                              renderAnnotationLayer={false} 
                            />
                          </motion.div>
                        </AnimatePresence>
                        {/* Left Page Hover Hint */}
                        {pageNumber > 1 && (
                          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-4 z-20 pointer-events-none">
                            <span className="text-black/40 text-3xl font-bold">‹</span>
                          </div>
                        )}
                      </div>

                      {/* Spine Shadow */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-gradient-to-r from-black/5 via-black/20 to-black/5 z-30 pointer-events-none"></div>

                      {/* Right Page Container */}
                      <div 
                        className="relative w-1/2 cursor-pointer group"
                        onClick={turnNext}
                        style={{ perspective: '2000px' }}
                      >
                        {pageNumber < numPages && (
                          <AnimatePresence initial={false} custom={direction} mode="popLayout">
                            <motion.div
                              key={pageNumber + 1}
                              custom={direction}
                              initial={{ 
                                rotateY: direction === 1 ? 90 : 0, 
                                opacity: direction === 1 ? 0 : 1,
                                transformOrigin: 'left center'
                              }}
                              animate={{ 
                                rotateY: 0, 
                                opacity: 1,
                                zIndex: direction === 1 ? 10 : 1
                              }}
                              exit={{ 
                                rotateY: direction === -1 ? -90 : 0, 
                                opacity: direction === -1 ? 0 : 1,
                                transformOrigin: 'left center',
                                zIndex: direction === -1 ? 10 : 1
                              }}
                              transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.8 }}
                              className="bg-white rounded-r-md"
                            >
                              <Page 
                                pageNumber={pageNumber + 1} 
                                width={550} 
                                renderTextLayer={false} 
                                renderAnnotationLayer={false}
                              />
                            </motion.div>
                          </AnimatePresence>
                        )}
                        {/* Right Page Hover Hint */}
                        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-4 z-20 pointer-events-none">
                          <span className="text-black/40 text-3xl font-bold">›</span>
                        </div>
                      </div>
                    </div>

                  </Document>
                </div>
              ) : (
                /* No Book File - Show Description & Placeholder */
                <div className="flex bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
                  <button onClick={() => setSelectedBook(null)} className="absolute top-4 right-4 text-2xl text-earth-muted hover:text-earth-dark transition-colors z-10">×</button>
                  <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/3 bg-cream-deep/30 flex items-center justify-center p-6 border-r border-earth-dark/5 relative">
                      {(selectedBook.image || selectedBook.coverUrl) ? (
                        <img src={selectedBook.image || selectedBook.coverUrl} alt={selectedBook.title} className="max-w-full max-h-full rounded-xl shadow-lg object-contain bg-white" />
                      ) : (
                        <div className={`w-full h-[200px] rounded-xl ${selectedBook.bgColor} flex items-center justify-center`}>
                          <span className={`text-xs font-black uppercase ${selectedBook.accentColor}`}>{selectedBook.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-2/3 p-8 overflow-y-auto flex flex-col justify-between">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-turmeric-amber">{selectedBook.subtitle}</p>
                        <h3 className="text-xl font-black text-earth-dark">{selectedBook.title}</h3>
                        <p className="text-base text-earth-muted font-medium leading-relaxed">{selectedBook.description}</p>
                        <div className="mt-6 p-5 rounded-2xl bg-turmeric-amber/5 border border-turmeric-amber/20 text-center">
                          <p className="text-[11px] font-black uppercase tracking-widest text-turmeric-amber mb-2">Digital Edition Coming Soon</p>
                          <p className="text-xs text-earth-muted">The interactive reader will be available here.</p>
                        </div>
                      </div>
                      <button className="w-full py-4 mt-6 rounded-xl border border-earth-dark/20 text-[11px] font-black uppercase tracking-widest text-earth-muted hover:border-earth-dark hover:text-earth-dark transition-colors" onClick={() => setSelectedBook(null)}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfiniteBookCarousel;

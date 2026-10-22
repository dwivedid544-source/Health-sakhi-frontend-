import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import contentAssetApi, { resolveMediaUrl } from '../../api/contentAssetApi';
import i18nApi from '../../api/i18nApi';

const getAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
      : 'http://localhost:5000';
    return `${backendUrl}${url}`;
  }
  return url;
};

const Books = ({ data = {}, setSelectedBook, setBookMode, showOnly }) => {
  const { t, langCode } = useLanguage();
  const extra = data.extraJson || {};

  const title = langCode === 'en' ? (data.title || t('landingPage.learningListening')) : t('landingPage.learningListening');
  const subtitle = langCode === 'en' ? (data.subtitle || t('landingPage.learningSubtitle')) : t('landingPage.learningSubtitle');
  const description = langCode === 'en' ? (data.description || t('landingPage.learningSubtitle')) : t('landingPage.learningSubtitle');

  const marqueeBooks = extra.marqueeBooks || [
    { title: "Heart to Heart", img: "/Images/heart to heart.png" },
    { title: "Fountain of Family", img: "/Images/final cover fountain of family.png" },
    { title: "PCOD Wellness", img: "/Images/final pcod book cover.png" },
    { title: "Weight Loss", img: "/Images/final wt loss book cover.png" },
    { title: "Life After Shaadi", img: "/Images/HS LIFE AFTRE SHAADI COVER.png" },
    { title: "Menopause", img: "/Images/HS MENOPAUSE.png" },
    { title: "Beauty Without Parlour", img: "/Images/final cover beauty without parlour.png" },
    { title: "How to Read Husband", img: "/Images/HS HOW TO READ HUSBAND COVE R.png" },
    { title: "How to Read Woman", img: "/Images/HOW TO READ WOMAN LIKE A POEM.png" },
    { title: "100 Operations", img: "/Images/100 operations.png" }
  ];

  const defaultResourcesBooks = [
    {
      id: 1,
      title: t('landingPage.book1Title', 'Heart to Heart'),
      desc: t('landingPage.book1Desc', 'A warm, compassionate conversation on the emotional, physical, and invisible burdens women carry, and how true healing begins.'),
      img: '/Images/heart to heart.png',
      gradient: 'from-rose-50 to-pink-50'
    },
    {
      id: 2,
      title: t('landingPage.book2Title', 'Secret Mind Game'),
      desc: t('landingPage.book2Desc', '100 Letters for the Woman Ready to Heal.'),
      img: '/Images/final wt loss book cover.png',
      gradient: 'from-purple-50 to-blue-50',
      pdfUrl: '/books/HealthSakhi_Complete_ThreeParts (2).pdf',
      fileUrl: '/files/HealthSakhi_Complete_ThreeParts.txt'
    },
    {
      id: 3,
      title: t('landingPage.book3Title', 'Fountain of Family'),
      desc: t('landingPage.book3Desc', 'The great skill every woman must know for a harmonious home.'),
      img: '/Images/final cover fountain of family.png',
      gradient: 'from-amber-50 to-orange-50',
      dummyContent: '<h2>Fountain of Family</h2><p>Sakhi means your best friend. This book teaches you the great skill of family harmony - knowledge is power.</p>'
    }
  ];

  const [dynamicBooks, setDynamicBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await contentAssetApi.getPublicAssets({ type: 'Book', status: 'Published' });
        if (res && res.success && res.data && res.data.length > 0) {
          const normalizeKey = (str) => str ? str.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') : '';
          const uniqueAssets = [];
          const seenKeys = new Set();

          res.data.forEach(item => {
            const key = (item.groupKey && item.groupKey.trim() !== '') ? item.groupKey.trim() : normalizeKey(item.title);
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              uniqueAssets.push(item);
            }
          });

          const selectedLandingBooks = uniqueAssets.filter(b => b.showOnLanding === true);
          const finalLandingList = selectedLandingBooks.length > 0 ? selectedLandingBooks : uniqueAssets.slice(0, 3);

          let booksData = finalLandingList.map((b, i) => {
            const desc = b.description || '';
            const parts = desc.split('[hs_cover]');
            const cleanDesc = parts[0] ? parts[0].trim() : '';
            const coverUrl = parts[1] ? parts[1].split('[hs_chapters]')[0].trim() : null;
            return {
              id: b.id,
              title: b.title,
              desc: cleanDesc,
              description: cleanDesc,
              img: coverUrl ? resolveMediaUrl(coverUrl) : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
              gradient: i === 0 ? 'from-rose-50 to-pink-50' : i === 1 ? 'from-purple-50 to-blue-50' : 'from-amber-50 to-orange-50',
              isAdminBook: true
            };
          });

          if (langCode !== 'en' && booksData.length > 0) {
            try {
              const texts = [];
              booksData.forEach(b => {
                texts.push(b.title);
                texts.push(b.desc || '');
              });
              const transRes = await i18nApi.translateTexts(texts, langCode);
              if (transRes?.success && transRes.translations) {
                let tIdx = 0;
                booksData = booksData.map(b => ({
                  ...b,
                  title: transRes.translations[tIdx++],
                  desc: transRes.translations[tIdx++],
                  description: transRes.translations[tIdx - 1]
                }));
              }
            } catch (err) {
              console.error('Failed to translate landing books:', err);
            }
          }
          setDynamicBooks(booksData);
        }
      } catch (err) {
        console.error('Failed to load dynamic books on landing page:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [langCode]);

  const resourcesBooks = dynamicBooks.length > 0 ? dynamicBooks : (langCode === 'en' ? (extra.resourcesBooks || defaultResourcesBooks) : defaultResourcesBooks);

  // Concatenate marquee list for infinite loop
  const doubleMarquee = marqueeBooks.concat(marqueeBooks);

  const showMarquee = !showOnly || showOnly === 'marquee';
  const showResources = !showOnly || showOnly === 'resources';

  return (
    <>
      {/* ── Marquee Section ── */}
      {showMarquee && (
        <section id="wellness-books" className="relative w-full pt-0 pb-16 px-4 sm:px-6 lg:px-10 flex flex-col items-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] bg-[#E91E63]/5 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-[-10%] w-[450px] h-[450px] bg-[#C69214]/5 rounded-full blur-[80px]"></div>
          </div>

          <div className="w-full max-w-[1280px] flex flex-col items-center relative z-10">
            <div className="flex flex-col items-center mb-6 w-full">
              <div className="mb-2">
                <img src="/Images/lotus-floral-top.svg" className="w-20 h-20 object-contain filter hue-rotate-[320deg] saturate-150" alt="Lotus" />
              </div>
              <div className="flex items-center gap-4 w-full max-w-4xl justify-center">
                <div className="hidden sm:block h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#4B1E5A]/30"></div>
                <span className="text-[#E91E63] text-sm sm:text-base">✿</span>
                <h2 className="font-serif font-black text-[#4B1E5A] text-xl sm:text-3xl md:text-4xl tracking-[0.1em] uppercase text-center break-words">
                  {t('landingPage.wellnessBooks')}
                </h2>
                <span className="text-[#E91E63] text-sm sm:text-base">✿</span>
                <div className="hidden sm:block h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#4B1E5A]/30"></div>
              </div>
            </div>

            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes marqueeBooks {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .books-marquee-container {
                display: flex;
                width: max-content;
                animation: marqueeBooks 35s linear infinite;
              }
              .books-marquee-container:hover {
                animation-play-state: paused;
              }
            `}} />

            <div className="w-full overflow-hidden pb-6 relative">
              <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-white/30 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-white/30 to-transparent z-20 pointer-events-none"></div>

              <div className="books-marquee-container flex gap-6 sm:gap-8 py-4">
                {doubleMarquee.map((book, idx) => (
                  <motion.div
                    key={idx}
                    className="relative w-[130px] sm:w-[160px] aspect-[1/1.5] group cursor-pointer shrink-0"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (idx % 10) * 0.05 }}
                    whileHover={{ y: -8, scale: 1.03 }}
                  >
                    <div className="relative w-full h-full rounded-r-lg overflow-hidden shadow-[0_10px_25px_rgba(75,30,99,0.12)] group-hover:shadow-[0_20px_45px_rgba(75,30,99,0.22)] transition-all duration-300 border border-[#4B1E5A]/10 bg-[#FFFDFE] flex items-center justify-center">
                      <img
                        src={getAssetUrl(book.img)}
                        alt={book.title}
                        className="max-w-full max-h-full object-contain rounded-r-lg"
                        loading="lazy"
                      />
                      <div className="absolute top-0 left-0 bottom-0 w-3.5 bg-gradient-to-r from-black/25 via-black/5 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Resources Section ── */}
      {showResources && (
        <section id="resources" className="relative w-full py-[70px] px-6 lg:px-10 flex flex-col items-center">
          <div className="w-full max-w-[1280px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 space-y-3"
            >
              <span className="text-xs font-black text-[#E91E63] uppercase tracking-[0.3em] opacity-80">
                {t('landingPage.learningListening').toUpperCase()}
              </span>
              <h2 className="text-[#4B1E5A] font-serif font-black text-4xl lg:text-5xl leading-tight">
                {t('landingPage.learningListening')}
              </h2>
              <h3 className="text-[#C69214] font-serif font-bold text-xl opacity-80">
                {t('landingPage.learningSubtitleSub', 'Knowledge that transforms lives')}
              </h3>
              <p className="text-base text-[#4B1E5A]/60 font-medium max-w-2xl mx-auto pt-2 leading-relaxed">
                {t('landingPage.learningSubtitle')}
              </p>
            </motion.div>

            {/* CSS Marquee — same 35s speed as Testimonials & Blog */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes resourceBooksMarquee {
                0%   { transform: translateX(0%); }
                100% { transform: translateX(-33.333%); }
              }
              .res-books-marquee-track {
                display: flex;
                width: max-content;
                animation: resourceBooksMarquee 35s linear infinite;
              }
              .res-books-marquee-track:hover {
                animation-play-state: paused;
              }
            `}} />

            <div className="w-full overflow-hidden relative py-2">
              {/* Side fade overlays */}
              <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white/40 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/40 to-transparent z-20 pointer-events-none"></div>

              <div className="res-books-marquee-track">
                {[...resourcesBooks, ...resourcesBooks, ...resourcesBooks].map((book, i) => (
                  <div
                    key={`${book.id || i}-${i}`}
                    className="group relative flex flex-col shrink-0 w-[280px] sm:w-[320px] md:w-[340px] mx-4"
                  >
                    <div className="flex-1 rounded-[2rem] p-5 bg-white/65 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-[0_20px_50px_rgba(233,30,99,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col overflow-hidden">

                      <div className={`relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-br ${book.gradient || 'from-rose-50 to-pink-50'} border border-white/20 flex items-center justify-center mb-4`} style={{ aspectRatio: '3/3.8' }}>
                        <img
                          src={getAssetUrl(book.img)}
                          alt={`${book.title}`}
                          className="max-w-full max-h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>

                      <div className="space-y-0.5 mb-3 flex-1">
                        <h4 className="text-[#4B1E5A] font-serif font-black text-lg group-hover:text-[#E91E63] transition-colors leading-tight h-12 overflow-hidden line-clamp-2">
                          {book.isAdminBook ? book.title : t('landingPage.book' + book.id + 'Title', book.title)}
                        </h4>
                        <p className="text-[#4B1E5A]/60 text-[11px] font-medium leading-relaxed h-14 overflow-hidden line-clamp-3 pt-0.5">
                          {book.isAdminBook ? book.desc : t('landingPage.book' + book.id + 'Desc', book.desc)}
                        </p>
                      </div>

                      <div className="mb-4 flex items-center justify-between border-y border-[#4B1E5A]/5 py-2">
                        <span className="text-[8px] font-black text-[#E91E63] uppercase tracking-[0.15em] flex items-center gap-1 whitespace-nowrap">
                          🌐 {t('landingPage.sevenLanguages', '7 Languages')}
                        </span>
                        <span className="text-[8.5px] font-bold text-[#4B1E5A]/50 tracking-wider truncate ml-2">
                          EN • HI • MR
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (book.isAdminBook) {
                              window.location.href = `/public/books/${book.id}`;
                            } else {
                              setSelectedBook(book);
                              setBookMode('read');
                            }
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-[#4B1E5A] text-white font-black text-[9px] uppercase tracking-widest hover:bg-[#E91E63] transition-all shadow-sm">
                          📖 {t('landingPage.read')}
                        </button>
                        <button
                          onClick={() => {
                            if (book.isAdminBook) {
                              window.location.href = `/public/books/${book.id}`;
                            } else {
                              setSelectedBook(book);
                              setBookMode('listen');
                            }
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-[#4B1E5A] text-white font-black text-[9px] uppercase tracking-widest hover:bg-[#E91E63] transition-all shadow-sm">
                          🎧 {t('landingPage.listen')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Books;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { booksData } from '../data/booksData';
import BookReaderModal from '../components/BookReaderModal';

const LibraryPage = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [customBooks, setCustomBooks] = useState([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('hs_custom_books');
    if (saved) setCustomBooks(JSON.parse(saved));
    
    const handleStorage = () => {
      const updated = localStorage.getItem('hs_custom_books');
      if (updated) setCustomBooks(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const validCustom = customBooks.filter(cb => cb.title && (cb.image || cb.coverUrl));
  const allBooks = [...validCustom, ...booksData];

  // Derive unique categories
  const categories = ['All', ...new Set(allBooks.map(book => book.category))];

  // Filter books based on active category
  const filteredBooks = activeCategory === 'All' 
    ? allBooks 
    : allBooks.filter(book => book.category === activeCategory);

  // Duplicate books a bit to make the grid look full (Netflix style) if there are too few
  const displayBooks = [...filteredBooks, ...filteredBooks, ...filteredBooks].slice(0, 12);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-cream-bg text-earth-dark pt-24 pb-20">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-[6%] lg:px-[8%] mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-turmeric-amber mb-3">HealthSakhi Library</p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-earth-dark">
              Knowledge is <span className="text-transparent bg-clip-text bg-gradient-to-r from-sindoor-rose to-turmeric-amber">Power.</span>
            </h1>
          </div>
          <Link to="/" className="group flex items-center text-sm font-bold uppercase tracking-widest text-earth-muted hover:text-earth-dark transition-colors">
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
            Back to Home
          </Link>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === category 
                  ? 'bg-earth-dark text-white shadow-lg scale-105' 
                  : 'bg-white text-earth-muted hover:bg-earth-dark/5 border border-earth-dark/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Netflix Style Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-[6%] lg:px-[8%]">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {displayBooks.map((book, index) => (
            <motion.div
              key={`${book.id}-${index}`}
              variants={cardVariants}
              onClick={() => setSelectedBook(book)}
              className="group cursor-pointer"
            >
              {/* NEW Badge */}
              {book.isNew && (
                <div className="absolute -top-2 -right-2 z-50 bg-turmeric-amber text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border-2 border-white animate-pulse">
                  NEW ✨
                </div>
              )}

              {/* Book Cover */}
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 mb-4 bg-rose-50/20 border border-black/5 flex items-center justify-center">
                {(book.image || book.coverUrl) ? (
                  <img src={book.image || book.coverUrl} alt={book.title} className="max-w-full max-h-full object-contain rounded-2xl" />
                ) : (
                  <div className={`w-full h-full ${book.bgColor || 'bg-slate-100'} flex items-center justify-center p-4 text-center`}>
                    <h3 className={`font-black text-xl ${book.accentColor}`}>{book.title}</h3>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-10 h-10 rounded-full bg-white text-earth-dark flex items-center justify-center shadow-lg hover:scale-110 transition-transform mb-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </button>
                    <p className="text-white text-xs font-bold uppercase tracking-wider">Read Now</p>
                  </div>
                </div>
              </div>

              {/* Book Info */}
              <div>
                <h3 className="font-bold text-earth-dark truncate">{book.title}</h3>
                <p className="text-xs text-earth-muted font-medium mt-1 uppercase tracking-widest">{book.category}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Reusable 3D Book Reader Modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookReaderModal 
            selectedBook={selectedBook} 
            onClose={() => setSelectedBook(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default LibraryPage;

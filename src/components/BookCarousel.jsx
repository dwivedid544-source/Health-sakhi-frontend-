import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const books = [
  { 
    title: 'The PCOD Solution', 
    description: 'Ancient Ayurvedic wisdom for modern hormonal balance.', 
    bgColor: 'bg-[#FFF5F5]', 
    accentColor: 'text-sindoor-rose' 
  },
  { 
    title: 'Women’s Wellness', 
    description: 'A complete guide to holistic health at every stage.', 
    bgColor: 'bg-[#F5FFF5]', 
    accentColor: 'text-tulsi-teal' 
  },
  { 
    title: 'Ayurveda Today', 
    description: 'Adapting timeless principles for the digital age.', 
    bgColor: 'bg-[#F5F5FF]', 
    accentColor: 'text-earth-dark' 
  },
  { 
    title: 'Cycle Balance', 
    description: 'Understanding your rhythm for better mental health.', 
    bgColor: 'bg-[#FFFFF5]', 
    accentColor: 'text-turmeric-amber' 
  },
  { 
    title: 'Motherhood', 
    description: 'Supporting you through the most beautiful transition.', 
    bgColor: 'bg-[#F5FFFF]', 
    accentColor: 'text-lotus-deep' 
  },
  { 
    title: 'Hormone Harmony', 
    description: 'Natural ways to regulate and revitalize your system.', 
    bgColor: 'bg-[#FFF5FF]', 
    accentColor: 'text-sindoor-rose' 
  }
];

const totalItems = books.length;
// Tripling items to handle infinite scroll look
const items = [...books, ...books, ...books];
const middleStart = totalItems;

const BookCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(middleStart);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const timerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => prev - 1);
  }, []);

  // Handle infinite loop snap
  useEffect(() => {
    if (activeIndex >= totalItems * 2) {
      // Snap back to middle set without animation is tricky with animate prop
      // For now, we keep it simple, but a real infinite loop would use a more complex logic
      // We'll just reset to middle if it goes too far
      const timer = setTimeout(() => {
        setActiveIndex(totalItems + (activeIndex % totalItems));
      }, 500); // Wait for animation to finish
      return () => clearTimeout(timer);
    }
    if (activeIndex < totalItems) {
      const timer = setTimeout(() => {
        setActiveIndex(totalItems + (activeIndex % totalItems));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(nextSlide, 3000);
    }
    return () => clearInterval(timerRef.current);
  }, [isAutoPlaying, nextSlide]);

  const handleDragEnd = (event, info) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      nextSlide();
    } else if (info.offset.x > threshold) {
      prevSlide();
    }
    setDragOffset(0);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Longer pause after interaction
  };

  return (
    <div className="w-full relative overflow-hidden py-2">
      <div className="relative flex items-center justify-center h-[280px]">
        <motion.div
          className="flex gap-6 cursor-grab active:cursor-grabbing px-[50%]"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{
            x: -(activeIndex * (194)) + 85, // 170 + 24 = 194
          }}
          transition={{ type: "spring", damping: 30, stiffness: 150 }}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {items.map((book, idx) => {
            const isActive = idx === activeIndex;
            return (
              <motion.div
                key={`${book.title}-${idx}`}
                className={`relative min-w-[170px] h-[220px] rounded-2xl ${book.bgColor} border border-earth-dark/5 shadow-sm p-4 flex flex-col items-center justify-center text-center transition-shadow duration-500 hover:shadow-xl group`}
                animate={{
                  scale: isActive ? 1.15 : 0.95,
                  opacity: isActive ? 1 : 0.8,
                  y: isActive ? -15 : 10,
                }}
                whileHover={{ y: -8 }}
              >
                {/* Book Title */}
                <span className={`text-xs font-black uppercase leading-tight tracking-tight ${book.accentColor}`}>
                  {book.title}
                </span>

                {/* Popup Overlay */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-x-0 -bottom-16 bg-white rounded-2xl p-4 shadow-2xl border border-cream-border z-20 pointer-events-none group-hover:pointer-events-auto"
                    >
                      <p className="text-xs font-bold text-earth-dark mb-1 line-clamp-1">{book.title}</p>
                      <p className="text-[10px] text-earth-muted mb-2 line-clamp-2">{book.description}</p>
                      <button className="text-[10px] font-black text-turmeric-amber flex items-center gap-1 uppercase tracking-wider group/btn">
                        Read more <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subtle Decorative Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-turmeric-amber/20"></div>
                <div className="absolute bottom-4 left-4 w-12 h-[1px] bg-earth-dark/5"></div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {books.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i + totalItems)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              (activeIndex % totalItems) === i ? 'w-8 bg-turmeric-amber' : 'bg-turmeric-amber/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BookCarousel;

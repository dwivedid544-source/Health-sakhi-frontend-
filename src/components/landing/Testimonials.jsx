import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import contactApi from '../../api/contactApi';

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

// Helper to strip any existing leading/trailing double quotes so we never render ""double quotes""
const formatQuote = (quote) => {
  if (!quote) return '';
  let str = quote.trim();
  // Remove leading and trailing double quotes or curly quotes if present
  while (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith('“') && str.endsWith('”')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }
  return str;
};const getGradientForName = (name) => {
  const hash = [...(name || '')].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    ['from-pink-100 to-rose-200', 'text-[#E91E63]'],
    ['from-purple-100 to-indigo-200', 'text-[#4B1E5A]'],
    ['from-amber-100 to-orange-200', 'text-[#C69214]'],
    ['from-teal-100 to-emerald-200', 'text-[#0D9488]'],
    ['from-sky-100 to-blue-200', 'text-[#0284C7]']
  ];
  return gradients[hash % gradients.length];
};

const Testimonials = ({ data = {} }) => {
  const { t, langCode } = useLanguage();
  const [approvedFeedbacks, setApprovedFeedbacks] = useState([]);
  const extra = data.extraJson || {};

  const title = t('landingPage.testimonialsTitle');
  const subtitle = t('landingPage.testimonialsBadge');
  const description = t('landingPage.testimonialsSubtitle');

  const defaultAvatarImages = ['/Images/image10.png', '/Images/image11.png', '/Images/image9.png'];

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await contactApi.getApprovedFeedbacks();
        if (res && res.success && Array.isArray(res.data)) {
          const dynamicTestimonials = res.data.map((item, idx) => ({
            name: item.name,
            role: item.role || 'Community Sakhi',
            quote: item.message,
            rating: Number(item.rating) || 5,
            img: defaultAvatarImages[idx % defaultAvatarImages.length]
          }));
          setApprovedFeedbacks(dynamicTestimonials);
        }
      } catch (err) {
        console.warn('Failed to fetch approved feedbacks for testimonials:', err);
      }
    };
    fetchFeedbacks();
  }, []);

  const defaultTestimonialsList = [
    {
      name: t('landingPage.testimonial1Name'),
      role: t('landingPage.testimonial1Role'),
      quote: t('landingPage.testimonial1Quote'),
      rating: 5,
      img: '/Images/image10.png'
    },
    {
      name: t('landingPage.testimonial2Name'),
      role: t('landingPage.testimonial2Role'),
      quote: t('landingPage.testimonial2Quote'),
      rating: 5,
      img: '/Images/image11.png'
    },
    {
      name: t('landingPage.testimonial3Name'),
      role: t('landingPage.testimonial3Role'),
      quote: t('landingPage.testimonial3Quote'),
      rating: 5,
      img: '/Images/image9.png'
    }
  ];

  const baseList = langCode === 'en' ? (extra.testimonialsList || defaultTestimonialsList) : defaultTestimonialsList;
  const testimonialsList = [...approvedFeedbacks, ...baseList];
  // Duplicate list to allow seamless infinite horizontal loop
  const doubleTestimonialsList = [...testimonialsList, ...testimonialsList, ...testimonialsList];

  return (
    <section id="testimonials" className="relative w-full py-[70px] px-6 lg:px-10 flex flex-col items-center overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes testimonialsMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        .testimonials-marquee-track {
          display: flex;
          width: max-content;
          animation: testimonialsMarquee 35s linear infinite;
        }
        .testimonials-marquee-track:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="w-full max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-3"
        >
          <span className="text-xs font-black text-[#E91E63] uppercase tracking-[0.3em] opacity-80">{subtitle}</span>
          <h2 className="text-[#4B1E5A] font-serif font-black text-4xl lg:text-5xl leading-tight">{title}</h2>
          <p className="text-lg text-[#C69214] font-serif font-bold italic opacity-70">
            "{formatQuote(description)}"
          </p>
        </motion.div>

        {/* 1 Single Line Cards Track with Continuous Right-to-Left Scroll & Pause on Hover */}
        <div className="w-full overflow-hidden relative py-2">
          {/* Subtle side fade overlays */}
          <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white/40 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/40 to-transparent z-20 pointer-events-none"></div>

          <div className="testimonials-marquee-track flex gap-6">
            {doubleTestimonialsList.map((review, i) => {
              const cleanQuote = formatQuote(review.quote);
              const initials = (review.name || 'S')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              const starRating = Number(review.rating) || 5;
              const [bgGradient, textColor] = getGradientForName(review.name);

              return (
                <div
                  key={i}
                  className="w-[320px] sm:w-[360px] md:w-[385px] shrink-0 group relative p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-md border border-white/50 shadow-sm hover:bg-white hover:shadow-[0_20px_50px_rgba(233,30,99,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-6 right-8 text-[#E91E63]/10">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM2.01697 21L2.01697 18C2.01697 16.8954 2.9124 16 4.01697 16H7.01697C7.56925 16 8.01697 15.5523 8.01697 15V9C8.01697 8.44772 7.56925 8 7.01697 8H3.01697C2.46468 8 2.01697 8.44772 2.01697 9V11C2.01697 11.5523 1.56925 12 1.01697 12H0.0169678V5H10.017V15C10.017 18.3137 7.33068 21 4.01697 21H2.01697Z" />
                    </svg>
                  </div>

                  <div className="flex-1 mb-8">
                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1 mb-3 relative z-10">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={starRating >= star ? '#F59E0B' : 'none'}
                          stroke={starRating >= star ? '#F59E0B' : '#CBD5E1'}
                          strokeWidth="2"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>

                    <p className="text-[#4B1E5A] font-serif text-lg leading-relaxed relative z-10 italic">
                      "{cleanQuote}"
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-4 relative z-10 pt-4 border-t border-[#4B1E5A]/5">
                    <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-500 shrink-0 bg-gradient-to-br ${bgGradient} flex items-center justify-center font-black text-[13px] ${textColor}`}>
                      <span>{initials}</span>
                    </div>
                    <div>
                      <h4 className="text-[#4B1E5A] font-black text-xs uppercase tracking-widest">{review.name}</h4>
                      <p className="text-[#E91E63] font-bold text-[9px] uppercase tracking-widest opacity-70 mt-0.5">
                        {review.role && review.role.startsWith('Blog Review:') 
                          ? t('testimonials.defaultRole', 'Sakhi Member') 
                          : (review.role || t('testimonials.defaultRole', 'Sakhi Member'))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

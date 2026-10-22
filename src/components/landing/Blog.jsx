import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import BlogReaderModal from '../BlogReaderModal';
import blogApi from '../../api/blogApi';

const getAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
      : 'http://localhost:5000';
    return `${backendUrl}${url}`;
  }
  return url;
};

const Blog = ({ data = {} }) => {
  const { t, langCode } = useLanguage();
  const navigate = useNavigate();
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const extra = data.extraJson || {};

  const title = t('landingPage.blogTitle');
  const subtitle = t('landingPage.blogBadge');
  const description = t('landingPage.blogSubtitle');

  const defaultBlogPosts = [
    {
      id: 'default-1',
      title: t('landingPage.blog1Title'),
      desc: t('landingPage.blog1Desc'),
      date: 'April 2026',
      img: '/Images/ayurvedic.png',
      tag: 'Wellness',
      author: 'Dr. Sakshi',
      content: 'Ayurvedic habits bring lasting vitality. Start your morning with a glass of warm water, gentle breathing exercises, and mindful reflections to harmonize your inner energy.'
    },
    {
      id: 'default-2',
      title: t('landingPage.blog2Title'),
      desc: t('landingPage.blog2Desc'),
      date: 'April 2026',
      img: '/Images/silent.png',
      tag: 'Health',
      author: 'Dr. Pratap',
      content: 'Stress affects cortisol levels and hormonal harmony. Practicing short meditation breaks and evening digital detox helps maintain emotional and physical balance.'
    }
  ];

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogApi.getPublicBlogs();
      if (res && res.success && res.data && res.data.length > 0) {
        setBlogs(res.data);
      } else {
        setBlogs(defaultBlogPosts);
      }
    } catch (e) {
      console.warn('Failed to fetch blogs from database, using defaults:', e);
      setBlogs(defaultBlogPosts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [langCode]);

  const getTranslatedBlog = (post) => {
    if (!post) return post;
    if (post.title === 'Ayurvedic Habits for Morning Energy') {
      return {
        ...post,
        title: t('landingPage.blog1Title'),
        desc: t('landingPage.blog1Desc')
      };
    }
    if (post.title === 'The Silent Impact of Stress on Hormones') {
      return {
        ...post,
        title: t('landingPage.blog2Title'),
        desc: t('landingPage.blog2Desc')
      };
    }
    return post;
  };

  const blogPosts = blogs.map(getTranslatedBlog);
  // Triple the list for seamless infinite marquee (same as Testimonials)
  const marqueeList = [...blogPosts, ...blogPosts, ...blogPosts];

  return (
    <>
      <section id="blog" className="relative w-full py-[70px] px-6 lg:px-10 flex flex-col items-center">
        <div className="w-full max-w-[1280px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12 space-y-3"
          >
            <span className="text-xs font-black text-[#E91E63] uppercase tracking-[0.3em] opacity-80">{subtitle}</span>
            <h2 className="text-[#4B1E5A] font-serif font-black text-4xl lg:text-5xl leading-tight">{title}</h2>
            <p className="text-[#C69214] font-serif font-bold text-xl opacity-80">{description}</p>
            <div className="flex justify-center mt-6">
              <div className="h-[1px] w-24 bg-[#C69214]/20 rounded-full"></div>
            </div>
          </motion.div>
        </div>

        {/* CSS Marquee — exactly same technique as Testimonials (35s linear infinite) */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes blogMarquee {
            0%   { transform: translateX(0%); }
            100% { transform: translateX(-33.333%); }
          }
          .blog-marquee-track {
            display: flex;
            width: max-content;
            animation: blogMarquee 35s linear infinite;
          }
          .blog-marquee-track:hover {
            animation-play-state: paused;
          }
        `}} />

        <div className="w-full overflow-hidden relative py-2">
          {/* Side fade overlays */}
          <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white/40 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/40 to-transparent z-20 pointer-events-none"></div>

          <div className="blog-marquee-track">
            {marqueeList.map((post, i) => (
              <div
                key={`${post.id || i}-${i}`}
                onClick={() => setSelectedBlog(post)}
                className="group flex flex-col bg-white/65 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white/40 hover:bg-white hover:shadow-[0_20px_50px_rgba(233,30,99,0.15)] hover:-translate-y-2 transition-all duration-500 cursor-pointer relative shadow-sm shrink-0 w-[290px] sm:w-[350px] md:w-[380px] mx-4"
              >
                <div className="w-full aspect-video overflow-hidden relative">
                  <img
                    src={getAssetUrl(post.img || post.coverUrl)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-[#E91E63] uppercase tracking-widest shadow-sm">
                    {post.tag || post.category || 'Wellness'}
                  </div>
                </div>

                <div className="p-7 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-[#C69214] uppercase tracking-widest">{post.date || 'April 2026'}</p>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E91E63]/20 group-hover:bg-[#E91E63] transition-colors"></div>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-[#4B1E5A] font-serif font-black text-lg sm:text-xl leading-tight group-hover:text-[#E91E63] transition-colors">{post.title}</h4>
                      <p className="text-[#4B1E5A]/60 text-xs font-medium leading-relaxed line-clamp-2">{post.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#E91E63] font-black text-[10px] uppercase tracking-widest pt-4 border-t border-[#4B1E5A]/5 group-hover:gap-3 transition-all">
                    {t('landingPage.readMore', 'Read Article & Review')} <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Reader Modal with Star Ratings & Feedback */}
      <BlogReaderModal
        blog={selectedBlog}
        isOpen={Boolean(selectedBlog)}
        onClose={() => setSelectedBlog(null)}
        onFeedbackSubmitted={fetchBlogs}
      />
    </>
  );
};

export default Blog;

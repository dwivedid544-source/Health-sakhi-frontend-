import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, User, Tag, Sparkles, CheckCircle2, MessageSquare, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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

import contactApi from '../api/contactApi';
import blogApi from '../api/blogApi';

const BlogReaderModal = ({ blog, isOpen, onClose, onFeedbackSubmitted }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchFeedbacks = async () => {
    if (!blog || !blog.id) return;
    if (String(blog.id).startsWith('default-')) {
      const allFeedbacks = JSON.parse(localStorage.getItem('hs_blog_feedbacks') || '[]');
      const blogSpecific = allFeedbacks.filter(f => f.blogId === blog.id || f.blogTitle === blog.title);
      setFeedbacks(blogSpecific);
      return;
    }
    try {
      const res = await blogApi.getBlogFeedbacks(blog.id);
      if (res && res.success && res.data) {
        setFeedbacks(res.data);
      }
    } catch (err) {
      console.warn('Failed to load feedbacks from DB:', err);
    }
  };

  useEffect(() => {
    if (blog) {
      setSubmitted(false);
      setFeedbackText('');
      setRating(5);
      fetchFeedbacks();
    }
  }, [blog]);

  if (!isOpen || !blog) return null;

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim() && rating === 0) return;

    const payload = {
      userName: reviewerName.trim() || 'Wellness Sakhi',
      rating: rating,
      comment: feedbackText.trim()
    };

    if (String(blog.id).startsWith('default-')) {
      const newFeedback = {
        id: 'fb-' + Date.now(),
        blogId: blog.id,
        blogTitle: blog.title,
        userName: payload.userName,
        rating: payload.rating,
        comment: payload.comment,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      const allFeedbacks = JSON.parse(localStorage.getItem('hs_blog_feedbacks') || '[]');
      const updated = [newFeedback, ...allFeedbacks];
      localStorage.setItem('hs_blog_feedbacks', JSON.stringify(updated));
      setFeedbacks(prev => [newFeedback, ...prev]);
      setSubmitted(true);
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      return;
    }

    try {
      const res = await blogApi.submitBlogFeedback(blog.id, payload);
      if (res && res.success && res.data) {
        setFeedbacks(prev => [res.data, ...prev]);
        setSubmitted(true);
        if (onFeedbackSubmitted) onFeedbackSubmitted();
      }
    } catch (err) {
      console.error('Failed to submit feedback to backend:', err);
    }
  };

  const rawImg = blog.img || blog.coverUrl;
  const blogImage = rawImg ? getAssetUrl(rawImg) : '/Images/ayurvedic.png';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-pink-100 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Top Bar Header */}
          <div className="px-6 py-4 border-b border-pink-100 bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#E91E63] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                {blog.tag || blog.category || 'Wellness'}
              </span>
              <span className="text-xs font-black text-[#4B1E5A] truncate max-w-[250px] sm:max-w-md">
                {blog.title}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white text-slate-500 hover:text-slate-800 hover:bg-rose-100/60 flex items-center justify-center transition-all shadow-sm cursor-pointer border border-pink-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content Body - Pure Blog Content Only */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 custom-scrollbar">
            {/* Download PDF Option Pill (If PDF attached) */}
            {(blog.pdfUrl || blog.pdf) && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/70 border border-pink-200/70 shadow-sm">
                <span className="text-xs font-black text-[#4B1E5A] flex items-center gap-2">
                  <FileText size={16} className="text-[#E91E63]" /> 📄 Document Article Available
                </span>
                <a
                  href={getAssetUrl(blog.pdfUrl || blog.pdf)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#E91E63] text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#D81B60] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  📥 Download PDF File
                </a>
              </div>
            )}

            {/* Main Article Body Text */}
            <div className="space-y-4 text-[#4B1E5A]/90 text-sm sm:text-base leading-relaxed font-sans">
              {blog.content ? (
                <div className="space-y-4 font-medium leading-relaxed tracking-normal break-words whitespace-pre-line text-slate-800">
                  {blog.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium break-words">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">
                  {blog.desc || 'No additional article content provided.'}
                </p>
              )}
            </div>

            {/* ── FEEDBACK & RATING SECTION ── */}
            <div className="pt-8 border-t-2 border-pink-100 space-y-6">
              <div className="bg-gradient-to-br from-rose-50/80 via-pink-50/40 to-white rounded-3xl p-6 sm:p-8 border border-pink-200/60 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E91E63] text-white flex items-center justify-center shadow-md">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#4B1E5A]">
                      {t('blog.feedbackTitle', 'How did you like this blog?')}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {t('blog.feedbackSub', 'Share your rating and opinion so we can provide better content.')}
                    </p>
                  </div>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3"
                  >
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black">{t('blog.thankYouTitle', 'Thank you! Your feedback has been submitted!')}</h4>
                      <p className="text-xs font-medium opacity-90">{t('blog.thankYouDesc', 'Your valuable thoughts are very useful for our community.')}</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    {/* Star Rating Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest">
                        {t('blog.ratingLabel', 'Your Rating')}
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                          >
                            <Star
                              size={28}
                              fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
                              stroke={(hoverRating || rating) >= star ? '#F59E0B' : '#CBD5E1'}
                              strokeWidth={2}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-black text-amber-600 ml-2">
                          {rating} / 5 {t('blog.starsText', 'Stars')}
                        </span>
                      </div>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest">
                        {t('blog.nameLabel', 'Your Name (Optional)')}
                      </label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder={t('blog.namePlaceholder', 'e.g. Priya Sharma')}
                        className="w-full h-11 px-4 rounded-xl bg-white border border-pink-200 text-xs font-bold text-[#4B1E5A] outline-none focus:border-[#E91E63]"
                      />
                    </div>

                    {/* Feedback Text Area */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest">
                        {t('blog.feedbackLabel', 'Your Experience or Suggestion')}
                      </label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={3}
                        required
                        placeholder={t('blog.feedbackPlaceholder', 'What new thing did you learn from this blog? Write here...')}
                        className="w-full p-4 rounded-xl bg-white border border-pink-200 text-xs font-bold text-[#4B1E5A] outline-none focus:border-[#E91E63] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-[#E91E63] text-white font-black text-xs uppercase tracking-widest hover:bg-[#D81B60] transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles size={14} /> {t('blog.submitFeedback', 'Submit Feedback')}
                    </button>
                  </form>
                )}
              </div>

              {/* Feedbacks Display List */}
              {feedbacks.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-black text-[#4B1E5A] uppercase tracking-wider flex items-center gap-2">
                    💬 {t('blog.communityThoughts', 'Community Thoughts')} ({feedbacks.length})
                  </h4>
                  <div className="space-y-3">
                    {feedbacks.map((fb) => (
                      <div key={fb.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#4B1E5A]">{fb.userName}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                fill={fb.rating >= s ? '#F59E0B' : 'none'}
                                stroke={fb.rating >= s ? '#F59E0B' : '#CBD5E1'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed">
                          "{fb.comment}"
                        </p>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-right">
                          {fb.date || (fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BlogReaderModal;

import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../context/LanguageContext';
import contactApi from '../../api/contactApi';

const CTA = ({ data = {} }) => {
  const { t, langCode } = useLanguage();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [formType, setFormType] = React.useState('inquiry'); // 'inquiry' | 'feedback'
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const extra = data.extraJson || {};

  const title = t('landingPage.contactTitle');
  const subtitle = t('landingPage.contactSubtitle');
  const description = t('landingPage.contactDesc');

  const onSubmit = async (formData) => {
    try {
      await contactApi.submitContact(formData.fullName, formData.email, formData.message, formType, formData.role || '', rating);
      if (formType === 'feedback') {
        alert(t('landingPage.feedbackSuccess', 'Thank you for sharing your feedback! Once approved by Admin, it will appear in Community Voices on the homepage.'));
      } else {
        alert(t('landingPage.contactSuccess', 'Thank you for contacting us! Your message has been sent successfully.'));
      }
      reset();
      setRating(5);
    } catch (error) {
      console.error('Error saving message:', error);
      alert(t('landingPage.contactError', 'Something went wrong. Please try again.'));
    }
  };

  return (
    <section id="contact" className="relative w-full py-[70px] px-6 lg:px-10 flex flex-col items-center">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ff69b4]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C69214]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 px-4">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="text-xs font-black text-[#E91E63] uppercase tracking-[0.3em] opacity-80">{subtitle}</span>
            <h2 className="text-[#4B1E5A] font-serif font-black text-4xl lg:text-5xl leading-tight">{title}</h2>
            <p className="text-[#4B1E5A]/70 text-lg font-medium leading-relaxed max-w-md opacity-80">
              {description}
            </p>
          </div>

          <div className="p-6 rounded-[2rem] bg-white/50 backdrop-blur-md border border-white shadow-sm space-y-3 max-w-xs">
            <div className="flex items-center gap-3 text-[#E91E63]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <span className="font-black text-[10px] uppercase tracking-widest">{t('landingPage.safeSecure')}</span>
            </div>
            <p className="text-[#4B1E5A]/80 text-xs font-bold leading-relaxed">
              {t('landingPage.safeSecureDesc')}
            </p>
          </div>
        </motion.div>

        {/* Right Side Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/70 backdrop-blur-xl p-5 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white shadow-[0_20px_60px_rgba(233,30,99,0.06)] w-full"
        >
          {/* Form Type Selection Tabs */}
          <div className="flex p-1 bg-white/80 rounded-2xl border border-[#4B1E5A]/10 mb-6 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setFormType('inquiry')}
              className={`flex-1 py-2.5 sm:py-3 px-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap text-center ${
                formType === 'inquiry' ? 'bg-[#4B1E5A] text-white shadow-md' : 'text-[#4B1E5A]/70 hover:bg-slate-100'
              }`}
            >
              💬 {t('landingPage.generalInquiry')}
            </button>
            <button
              type="button"
              onClick={() => setFormType('feedback')}
              className={`flex-1 py-2.5 sm:py-3 px-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap text-center ${
                formType === 'feedback' ? 'bg-[#E91E63] text-white shadow-md' : 'text-[#4B1E5A]/70 hover:bg-slate-100'
              }`}
            >
              ⭐ {t('landingPage.shareFeedback')}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1 opacity-70">{t('landingPage.fullName')}</label>
              <input
                {...register('fullName', { required: true })}
                type="text"
                className="w-full h-14 px-6 bg-white rounded-2xl border-2 border-[#4B1E5A]/20 focus:border-[#4B1E5A] outline-none transition-all font-bold text-sm text-[#4B1E5A]"
                placeholder={t('landingPage.testimonial1Name')}
              />
              {errors.fullName && <span className="text-red-500 text-[10px] ml-1 font-bold">{t('landingPage.requiredField')}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1 opacity-70">{t('landingPage.email')}</label>
              <input
                {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                type="email"
                className="w-full h-14 px-6 bg-white rounded-2xl border-2 border-[#4B1E5A]/20 focus:border-[#4B1E5A] outline-none transition-all font-bold text-sm text-[#4B1E5A]"
                placeholder="priya@example.com"
              />
              {errors.email && <span className="text-red-500 text-[10px] ml-1 font-bold">{t('landingPage.emailRequired')}</span>}
            </div>

            {formType === 'feedback' && (
              <>
                <div className="space-y-2 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1 opacity-70">{t('landingPage.starRating')}</label>
                  <div className="flex items-center gap-2 px-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
                          stroke={(hoverRating || rating) >= star ? '#F59E0B' : '#CBD5E1'}
                          strokeWidth="2"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    ))}
                    <span className="text-xs font-black text-[#E91E63] ml-2 uppercase tracking-wider">
                      {rating} / 5 {t('landingPage.stars')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1 opacity-70">{t('landingPage.roleLabel')}</label>
                  <input
                    {...register('role')}
                    type="text"
                    className="w-full h-14 px-6 bg-white rounded-2xl border-2 border-[#4B1E5A]/20 focus:border-[#4B1E5A] outline-none transition-all font-bold text-sm text-[#4B1E5A]"
                    placeholder={t('landingPage.rolePlaceholder')}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1 opacity-70">
                {formType === 'feedback' ? t('landingPage.feedbackLabel') : t('landingPage.message')}
              </label>
              <textarea
                {...register('message', { required: true })}
                className="w-full h-32 p-6 bg-white rounded-2xl border-2 border-[#4B1E5A]/20 focus:border-[#4B1E5A] outline-none transition-all font-bold text-sm text-[#4B1E5A] resize-none"
                placeholder={formType === 'feedback' ? t('landingPage.feedbackPlaceholder') : t('landingPage.messagePlaceholder')}
              ></textarea>
              {errors.message && <span className="text-red-500 text-[10px] ml-1 font-bold">{t('landingPage.messageRequired')}</span>}
            </div>

            <button
              type="submit"
              className={`w-full py-5 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 group ${
                formType === 'feedback' ? 'bg-[#E91E63] shadow-pink-100' : 'bg-[#4B1E5A] shadow-purple-100'
              }`}
            >
              {formType === 'feedback' ? t('landingPage.submitFeedback') : t('landingPage.sendMessage')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;

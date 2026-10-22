import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Quote, ChevronLeft, ChevronRight, Library,
  Brain, DollarSign, Anchor, Sparkles, Heart, Sun,
  HeartPulse, Flower2, BookOpen, HandHelping,
  Search, Moon, Share2, Copy, Volume2, Bookmark,
  Scale, Globe, User, Lightbulb, CheckCircle2, Star
} from 'lucide-react';
import { SPIRITUAL_DATA } from '../../data/spiritualData';
import { useLanguage } from '../../context/LanguageContext';
import aiApi from '../../api/aiApi';

import gita from '../../assets/spiritual/gita.png';
import quran from '../../assets/spiritual/quran.png';
import bible from '../../assets/spiritual/bible.png';
import buddha from '../../assets/spiritual/buddha.png';
import jain from '../../assets/spiritual/jain.png';
import allImg from '../../assets/spiritual/all.png';

const SPIRITUAL_IMAGES = {
  'Bhagavad Gita': gita,
  'Quran': quran,
  'Bible': bible,
  'Sikhism': allImg,
  'Jainism': jain,
  'Buddhism': buddha,
  'All': allImg
};

const CATEGORIES = {
  'Wealth': {
    icon: '💰',
    subcategories: ['Saving Money', 'Earning Ethically', 'Financial Discipline', 'Greed vs Contentment', 'Charity & Donation', 'Detachment from Wealth'],
    accent: '#311021',
    text: 'white'
  },
  'Health': {
    icon: '💪',
    subcategories: ['Mind-Body Connection', 'Healing Energy', 'Wholesome Food', 'Sacred Sleep', 'Vitality', 'Inner Strength'],
    accent: '#311021',
    text: 'white'
  },
  'Mind': {
    icon: '🧠',
    subcategories: ['Control of Senses', 'Conquering Ego', 'Overcoming Anger', 'Anxiety & Worry', 'Clarity of Thought'],
    accent: '#311021',
    text: 'white'
  },
  'Success': {
    icon: '🚀',
    subcategories: ['Noble Ambition', 'Handling Failure', 'Strategic Planning', 'Honest Hardwork', 'Leadership'],
    accent: '#311021',
    text: 'white'
  },
  'Relations': {
    icon: '❤️',
    subcategories: ['Parents & Family', 'Noble Friendship', 'Compassion', 'Divine Love', 'Trust', 'Forgiveness'],
    accent: '#311021',
    text: 'white'
  },
  'Spirituality': {
    icon: '🧘',
    subcategories: ['Self Realization', 'Law of Karma', 'Path of Devotion', 'Meditation', 'Eternal Soul'],
    accent: '#311021',
    text: 'white'
  },
  'Ethics': {
    icon: '⚖️',
    subcategories: ['Truth & Sincerity', 'Non-violence', 'Right Conduct', 'Justice', 'Purity'],
    accent: '#311021',
    text: 'white'
  },
  'Life Wisdom': {
    icon: '🌍',
    subcategories: ['Universal Peace', 'Harmony', 'Service to Humanity', 'Nature & Environment'],
    accent: '#311021',
    text: 'white'
  }
};

const RELIGION_CONFIG = {
  'Bhagavad Gita': { icon: () => <Sun size={20} />, color: '#D97706' },
  'Quran': { icon: () => <Moon size={20} />, color: '#6366F1' },
  'Bible': { icon: () => <Library size={20} />, color: '#A855F7' },
  'Jainism': { icon: () => <HandHelping size={20} />, color: '#EF4444' },
  'Sikhism': { icon: () => <Anchor size={20} />, color: '#D946EF' },
  'Buddhism': { icon: () => <Flower2 size={20} />, color: '#10B981' },
  'All': { icon: () => <Globe size={20} />, color: '#64748B' }
};

const RELIGIONS = ['All', 'Bhagavad Gita', 'Quran', 'Bible', 'Sikhism', 'Jainism', 'Buddhism'];

const SpiritualScreen = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [askMsg, setAskMsg] = useState('');
  const [activeCat, setActiveCat] = useState('Wealth');
  const [activeSubCat, setActiveSubCat] = useState('Saving Money');
  const [religionFilter, setReligionFilter] = useState('Bhagavad Gita');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [customSpiritual, setCustomSpiritual] = useState([]);

  const [aiQuote, setAiQuote] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [quoteLanguage, setQuoteLanguage] = useState('English');
  const recentQuotesRef = useRef([]);
  const prevFiltersRef = useRef({ religionFilter, activeCat, activeSubCat, quoteLanguage });

  const fetchQuote = useCallback(async () => {
    setLoadingAi(true);
    setAiError(null);

    const prev = prevFiltersRef.current;
    const isLanguageSwitch = 
      aiQuote &&
      prev.religionFilter === religionFilter &&
      prev.activeCat === activeCat &&
      prev.activeSubCat === activeSubCat &&
      prev.quoteLanguage !== quoteLanguage;

    prevFiltersRef.current = { religionFilter, activeCat, activeSubCat, quoteLanguage };

    try {
      const translationSource = isLanguageSwitch ? aiQuote.quote : null;
      const res = await aiApi.generateSpiritualQuote(
        religionFilter, 
        activeCat, 
        activeSubCat, 
        recentQuotesRef.current, 
        quoteLanguage,
        translationSource
      );
      if (res && res.success) {
        const newQuote = {
          id: `ai-${Date.now()}`,
          quote: res.quote,
          source: res.source,
          reference: res.reference,
          insight: res.meaning,
          meaning: res.meaning,
          example: res.application,
          application: res.application,
          takeaway: res.application,
          image: SPIRITUAL_IMAGES[res.source] || SPIRITUAL_IMAGES[religionFilter] || SPIRITUAL_IMAGES['All']
        };
        setAiQuote(newQuote);
        if (!isLanguageSwitch) {
          recentQuotesRef.current = [res.quote, ...recentQuotesRef.current.slice(0, 9)];
        }
      } else {
        setAiError("Unable to load quote. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setAiError("Unable to load quote. Please try again.");
    } finally {
      setLoadingAi(false);
      setIsFlipping(false);
    }
  }, [religionFilter, activeCat, activeSubCat, quoteLanguage, aiQuote]);

  useEffect(() => {
    fetchQuote();
  }, [religionFilter, activeCat, activeSubCat, quoteLanguage]);

  const localizeDb = (keyPath, str) => {
    if (!str) return '';
    const cleanKey = str.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);
    return t(`${keyPath}.${cleanKey}`, str);
  };

  const localizeReligion = (name) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t(`spiritual.religions.${key}`, name);
  };

  const localizeCategory = (name) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t(`spiritual.categories.${key}`, name);
  };

  const localizeSubcategory = (name) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t(`spiritual.subcategories.${key}`, name);
  };

  // --- Real-time Sync with Backend ---
  const fetchCustomContent = useCallback(async () => {
    try {
      const res = await contentApi.getSakhiContent('spiritual');
      if (res.success && res.content) {
        const spiritualContent = res.content.map(item => {
          let parsedDesc = { insight: item.description, example: '', takeaway: '', description: '' };
          if (item.description && item.description.startsWith('{')) {
             try {
                parsedDesc = JSON.parse(item.description);
                if (!parsedDesc.insight && parsedDesc.description) {
                   parsedDesc.insight = parsedDesc.description;
                }
             } catch(e) {}
          }
          
          const fullMediaUrl = resolveMediaUrl(item.mediaUrl);
          return {
            ...item,
            id: `custom-${item.id}`,
            quote: item.title,
            source: item.scripture || 'All',
            reference: item.topic || 'General',
            insight: parsedDesc.insight || '',
            example: parsedDesc.example || "Shared by Sakhi Admin",
            takeaway: parsedDesc.takeaway || "Apply this wisdom today.",
            description: parsedDesc.description || '',
            focus: item.focus || 'Wealth',
            topic: item.topic || 'Saving Money',
            image: fullMediaUrl || SPIRITUAL_IMAGES[item.scripture] || SPIRITUAL_IMAGES['All']
          };
        });
        setCustomSpiritual(spiritualContent);
      }
    } catch (err) {
      console.error('Error fetching spiritual content:', err);
    }
  }, []);

  useEffect(() => {
    fetchCustomContent();
  }, [fetchCustomContent]);

  const getFilteredContent = () => {
    const matchedCustom = customSpiritual.filter(item => 
      item.focus === activeCat && item.topic === activeSubCat
    );

    if (religionFilter === 'All') return matchedCustom;
    return matchedCustom.filter(item => item.source === religionFilter);
  };

  const filteredItems = getFilteredContent();

  // Compute all subcategories for the current category
  const staticSubs = CATEGORIES[activeCat].subcategories || [];
  const customSubs = [...new Set(customSpiritual.filter(item => item.focus === activeCat).map(item => item.topic))];
  const allSubs = [...new Set([...staticSubs, ...customSubs])];

  const handleNext = () => {
    if (isFlipping || loadingAi) return;
    setIsFlipping(true);
    fetchQuote();
  };

  const handlePrev = () => {
    if (isFlipping || loadingAi) return;
    setIsFlipping(true);
    fetchQuote();
  };

  const currentItem = aiQuote || filteredItems[currentIndex];

  const handleCopy = () => {
    if (currentItem) {
      navigator.clipboard.writeText(`"${currentItem.quote}" - ${currentItem.source}`);
      alert('Copied to clipboard!');
    }
  };

  const handleShare = async () => {
    if (currentItem && navigator.share) {
      try {
        await navigator.share({
          title: 'Spiritual Sakhi',
          text: `"${currentItem.quote}" - ${currentItem.source}`
        });
      } catch (err) {}
    }
  };

  const handleListen = () => {
    if (currentItem && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${currentItem.quote}. This is from ${currentItem.source}.`);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSave = () => {
    alert('Saved to favorites!');
  };

  return (
    <div className="min-h-screen pb-24 bg-[#FDFBF7] relative font-serif w-full overflow-x-hidden">
      
      {/* Header & Religion Selection */}
      <div className="pt-8 w-full flex flex-col lg:flex-row items-center justify-between gap-6 px-4 md:px-12 lg:px-20">
        
        {/* Logo Section */}
        <div className="flex flex-col items-start translate-y-[-10px] lg:flex-1">
           <h1 className="text-[26px] font-black text-[#15192c] flex items-center gap-2 font-serif tracking-tight">
              {t('spiritual.spiritualSakhi', 'Spiritual Sakhi')} <span className="text-[#6D28D9] text-3xl">🕉️</span>
           </h1>
           <p className="text-[9px] text-[#A8A29E] uppercase tracking-[0.4em] font-black mt-1">
              {t('spiritual.sacredWisdom', 'Divine Wisdom for the Soul')}
           </p>
        </div>

        {/* Religion Pill Navigation */}
        <div className="bg-white px-2 py-2 rounded-full shadow-[0_10px_30px_rgba(45,21,32,0.05)] border border-rose-100/50 flex items-center max-w-full overflow-x-auto no-scrollbar flex-shrink-0">
           <div className="flex items-center">
              {Object.entries(RELIGION_CONFIG).map(([name, config], idx) => (
                <React.Fragment key={name}>
                  <button
                     onClick={() => { setReligionFilter(name); setCurrentIndex(0); }}
                     className={`flex items-center gap-3 px-6 py-3.5 rounded-full transition-all duration-500 whitespace-nowrap ${religionFilter === name 
                       ? 'bg-[#CC8E1F] text-white shadow-lg' 
                       : 'text-[#57534E] hover:bg-stone-50'}`}
                  >
                     <div className={religionFilter === name ? 'text-white' : 'text-stone-400'}>
                        {config.icon()}
                     </div>
                     <span className={`text-[13px] font-bold ${religionFilter === name ? 'tracking-normal' : 'tracking-tight'}`}>
                        {t('spiritual.religions.' + name, name)}
                     </span>
                  </button>
                  {idx < Object.entries(RELIGION_CONFIG).length - 1 && (
                    <div className="w-[1px] h-6 bg-stone-100 mx-1" />
                  )}
                </React.Fragment>
              ))}
           </div>
        </div>


        {/* Spacer to keep the Religion selector centered */}
        <div className="hidden lg:block lg:flex-1 pointer-events-none" />
      </div>

      {/* Category Ribbon */}
      <div className="mt-8 flex justify-center px-4 md:px-6 lg:px-10">
        <div className="bg-[#FAF9F6] p-2.5 rounded-[3rem] shadow-[0_10px_40px_rgba(45,21,32,0.03)] border border-stone-100 flex gap-2 overflow-x-auto no-scrollbar max-w-full">
          {Object.entries(CATEGORIES).map(([name, cat]) => (
            <button
              key={name}
              onClick={() => { setActiveCat(name); setActiveSubCat(cat.subcategories[0]); setCurrentIndex(0); }}
              className={`flex items-center gap-3 px-8 py-4 rounded-[2.5rem] transition-all duration-500 whitespace-nowrap ${activeCat === name 
                ? 'bg-[#311021] text-white shadow-xl scale-105' 
                : 'text-[#15192c] hover:bg-white hover:shadow-sm font-medium'}`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[15px] font-black tracking-tight uppercase">
                 {t('spiritual.categories.' + name, name)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Pill Style */}
      <div className="mt-6 flex justify-center px-4 md:px-6 lg:px-10">
        <div className="bg-[#F3F0EC] p-2 rounded-full border border-stone-200/40 flex gap-2 overflow-x-auto no-scrollbar max-w-full">
          {(() => {
            return allSubs.map(sub => (
              <button
                key={sub}
                onClick={() => { setActiveSubCat(sub); setCurrentIndex(0); }}
                className={`px-7 py-3 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${activeSubCat === sub 
                  ? 'bg-[#CC8E1F] text-white shadow-lg' 
                  : 'text-[#57534E]/60 hover:text-[#57534E] hover:bg-white/50'}`}
              >
                {t('spiritual.subcategories.' + sub, sub)}
              </button>
            ));
          })()}
          <button className="px-7 py-3 rounded-full text-[13px] font-black uppercase tracking-widest text-[#57534E]/40 hover:text-[#57534E] flex items-center gap-2">
             {t('spiritual.more', 'More')} <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* The Book View */}
      <div className="mt-10 w-full flex justify-center px-4 md:px-10">
        <div className="relative bg-[#15192c] rounded-[3.5rem] p-5 shadow-[0_50px_120px_-20px_rgba(45,21,32,0.5)] max-w-7xl w-full">
          
          <div className="relative aspect-[16/10] md:aspect-[16/9.5] bg-[#FDFBF7] rounded-[2.5rem] overflow-hidden flex shadow-inner border border-rose-900/10">
            
            {/* Spine Hinges */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[20px] -translate-x-1/2 z-30 flex flex-col justify-around py-20 pointer-events-none">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-[30px] h-[4px] bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 rounded-full shadow-sm -ml-[5px] border border-amber-900/10" />
               ))}
            </div>

            {/* Left Page */}
            <div className="flex-1 relative overflow-hidden flex flex-col p-8 md:p-12 border-r border-[#E7E5E4] shadow-[inset_-20px_0_30px_rgba(0,0,0,0.05)] bg-[#1a1a1a]">
               <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentItem?.id || religionFilter} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={currentItem?.image || SPIRITUAL_IMAGES[religionFilter] || SPIRITUAL_IMAGES['All']} 
                      className="w-full h-full object-cover object-center" 
                      alt=""
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </motion.div>
               </AnimatePresence>
            </div>

            {/* Right Page */}
            <div className="flex-1 bg-white p-8 md:p-12 flex flex-col relative overflow-hidden shadow-[inset_20px_0_30px_rgba(0,0,0,0.02)]">
               <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50/20 rounded-bl-full -z-0 pointer-events-none" />
               
               <AnimatePresence mode="wait">
                   {loadingAi ? (
                      <div className="h-full flex flex-col justify-between py-6 space-y-6 animate-pulse">
                         <div className="space-y-4">
                            <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                            <div className="h-16 bg-stone-200 rounded"></div>
                         </div>
                         <div className="space-y-4">
                            <div className="h-4 bg-stone-200 rounded w-1/4"></div>
                            <div className="h-16 bg-stone-200 rounded"></div>
                         </div>
                         <div className="space-y-4">
                            <div className="h-4 bg-stone-200 rounded w-1/2"></div>
                            <div className="h-16 bg-stone-200 rounded"></div>
                         </div>
                      </div>
                   ) : aiError ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                         <p className="text-red-500 font-medium font-serif mb-4">{aiError}</p>
                         <button onClick={fetchQuote} className="px-6 py-2 bg-[#CC8E1F] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#b07a1a] transition-all">
                            Retry
                         </button>
                      </div>
                   ) : currentItem ? (
                      <motion.div key={currentItem.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center items-center relative z-10 pr-4 pb-4">
                         
                         {/* Quote Header Card */}
                         <div className="p-8 bg-[#FAF9F6] rounded-3xl border border-stone-100/80 relative overflow-hidden shadow-sm w-full">
                            <div className="text-amber-500/10 absolute -top-4 -left-2 pointer-events-none">
                               <Quote size={80} fill="currentColor" strokeWidth={0} />
                            </div>
                            <p className="text-lg md:text-xl font-bold text-stone-800 leading-relaxed font-serif relative z-10 text-center">
                               "{currentItem.quote}"
                            </p>
                            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-200/60 pt-4">
                               <span className="text-amber-600 font-bold text-[14px]">
                                  — {localizeReligion(currentItem.source)}
                               </span>
                               <span className="text-stone-400 text-[11px] font-medium tracking-wider uppercase">
                                  {localizeSubcategory(currentItem.reference)}
                               </span>
                            </div>
                         </div>
                      </motion.div>
                   ) : (
                      <div className="h-full flex items-center justify-center">
                         <Library size={48} className="text-stone-200 animate-pulse" />
                      </div>
                   )}
                </AnimatePresence>
            </div>
          </div>

          {/* Nav Arrows */}
          <button onClick={handlePrev} className="absolute left-[-28px] top-1/2 -translate-y-1/2 w-16 h-16 bg-[#1a0a13] text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-4 border-white group transition-all hover:scale-110 active:scale-95">
             <ChevronLeft size={28} />
          </button>
          <button onClick={handleNext} className="absolute right-[-28px] top-1/2 -translate-y-1/2 w-16 h-16 bg-[#1a0a13] text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-4 border-white group transition-all hover:scale-110 active:scale-95">
             <ChevronRight size={28} />
          </button>
        </div>
      </div>

      {/* Bottom Actions replaced by Language Selector */}
      <div className="mt-8 w-full flex justify-center gap-4 px-4 md:px-12 lg:px-20">
         <div className="bg-white p-2 rounded-full border border-stone-100 shadow-md flex gap-2">
            {[
              { code: 'English', label: 'English' },
              { code: 'Hindi', label: 'Hindi / हिंदी' },
              { code: 'Marathi', label: 'Marathi / मराठी' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setQuoteLanguage(lang.code)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${quoteLanguage === lang.code 
                  ? 'bg-[#CC8E1F] text-white shadow-md' 
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}
              >
                {lang.label}
              </button>
            ))}
         </div>
      </div>

      {/* AI Ask Wisdom Section */}
      <div className="mt-20 w-full px-4 md:px-12 lg:px-20">
        <div className="relative overflow-hidden bg-white rounded-[3rem] p-10 md:p-14 border border-rose-100 shadow-[0_40px_80px_-20px_rgba(45,21,32,0.08)]">
           {/* Background Accents */}
           <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50/40 rounded-full blur-3xl -mr-40 -mt-20" />
           <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-50/40 rounded-full blur-3xl -ml-30 -mb-10" />

           <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#311021]/5 text-[#311021] text-[10px] font-black uppercase tracking-widest mb-4">
                 <Sparkles size={12} className="text-amber-500" /> {t('spiritual.aiSpiritualGuide', 'AI Spiritual Guide')}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-[#15192c] tracking-tight leading-tight">
                 {t('spiritual.seekDivineGuidance', 'Seek Divine Guidance')} <br/> 
                 <span className="text-[#CC8E1F]">{t('spiritual.askSpiritualSakhi', 'Ask Spiritual Sakhi')}</span>
              </h2>
              
              <p className="text-stone-500 text-lg max-w-2xl mx-auto font-medium">
                 {t('spiritual.seekDivineGuidanceDesc', 'Type any situation, worry, or question, and let the timeless wisdom of sacred texts light your path.')}
              </p>

              <div className="mt-10 relative max-w-3xl mx-auto group">
                 <input 
                   type="text" 
                   value={askMsg}
                   onChange={(e) => setAskMsg(e.target.value)}
                   placeholder={t('spiritual.inputPlaceholder', 'How can I find peace in difficult times?')}
                   className="w-full bg-[#FDFBF7] border-2 border-stone-100 rounded-[2.5rem] px-10 py-8 pr-32 text-xl font-medium focus:outline-none focus:border-[#CC8E1F]/30 transition-all shadow-inner placeholder:text-stone-300"
                 />
                 <button 
                   onClick={() => navigate('/app/ai-sakhi', { state: { initialMessage: askMsg || 'How can I find peace in difficult times?' } })}
                   className="absolute right-3 top-3 bottom-3 px-8 rounded-[2rem] bg-[#15192c] text-white font-bold flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg group"
                 >
                    <span>{t('spiritual.btnAskSakhi', 'Ask Sakhi')}</span>
                    <Search size={20} />
                 </button>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-6">
                 {["Overcoming anxiety", "Handling loss", "Finding purpose", "Ethical wealth", "Silent mind"].map((tag) => {
                   const tagKey = tag === "Overcoming anxiety" ? "overcomingAnxiety" :
                                  tag === "Handling loss" ? "handlingLoss" :
                                  tag === "Finding purpose" ? "findingPurpose" :
                                  tag === "Ethical wealth" ? "ethicalWealth" : "silentMind";
                   const localizedTag = t('spiritual.tags.' + tagKey, tag);
                   return (
                     <button 
                       key={tag} 
                       onClick={() => navigate('/app/ai-sakhi', { state: { initialMessage: localizedTag } })}
                       className="px-5 py-2.5 rounded-full bg-stone-50 text-stone-600 border border-stone-100 text-[13px] font-bold hover:bg-white hover:shadow-md transition-all"
                     >
                        # {localizedTag}
                     </button>
                   );
                 })}
              </div>
           </div>
        </div>
      </div>

      {/* Feature Footer */}
      <div className="mt-20 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-12 lg:px-20 pb-12">
        {[
          { icon: BookOpen, title: t('spiritual.features.feat1.title', 'Authentic Quotes'), desc: t('spiritual.features.feat1.desc', 'Sourced directly from sacred texts.'), color: 'bg-orange-50 text-orange-600' },
          { icon: User, title: t('spiritual.features.feat2.title', 'Practical Examples'), desc: t('spiritual.features.feat2.desc', 'Real-life applications for daily life.'), color: 'bg-amber-50 text-amber-600' },
          { icon: Heart, title: t('spiritual.features.feat3.title', 'Inner Peace'), desc: t('spiritual.features.feat3.desc', 'Positive living and mental wellness.'), color: 'bg-rose-50 text-rose-600' },
          { icon: CheckCircle2, title: t('spiritual.features.feat4.title', 'Universal Wisdom'), desc: t('spiritual.features.feat4.desc', 'Timeless guidance for everyone.'), color: 'bg-emerald-50 text-emerald-600' }
        ].map((feat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-6 group hover:shadow-md transition-all">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${feat.color}`}>
                <feat.icon size={28} />
             </div>
             <div>
                <h5 className="text-[13px] font-black text-[#1C1917] uppercase tracking-wide mb-1">
                   {t('spiritual.features.title' + (idx+1), feat.title)}
                </h5>
                <p className="text-xs text-[#78716C] leading-relaxed font-medium">
                   {t('spiritual.features.desc' + (idx+1), feat.desc)}
                </p>
             </div>
          </div>
        ))}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ff69b4; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SpiritualScreen;

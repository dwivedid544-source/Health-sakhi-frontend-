import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Heart, RefreshCw, Share2, Star, Quote,
  BookOpen, Volume2, Bookmark,
  Users, User, ChevronLeft,
  ChevronRight, X, Maximize2, Wand2,
  PenLine, PlusCircle, CheckCircle2,
  Wind, Shield
} from 'lucide-react';
import memberApi from '../../api/memberApi';
import { useLanguage } from '../../context/LanguageContext';
import contentApi from '../../api/contentApi';
import adminApi from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { resolveMediaUrl } from '../../api/contentAssetApi';
import aiApi from '../../api/aiApi';

const AffirmationScreen = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Self Love');
  const [isCoupleMode, setIsCoupleMode] = useState(false);
  const [isMeditationMode, setIsMeditationMode] = useState(false);
  const [history, setHistory] = useState({
    'Self Love': [],
    'Relationship': [],
    'Couples': [],
    'Meditation': [],
    'Confidence': [],
    'Healing': []
  });
  const [currentIndexes, setCurrentIndexes] = useState({
    'Self Love': -1,
    'Relationship': -1,
    'Couples': -1,
    'Meditation': -1,
    'Confidence': -1,
    'Healing': -1
  });
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showManualWrite, setShowManualWrite] = useState(false);
  const [customAffirmations, setCustomAffirmations] = useState([]);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [newAffirmationCat, setNewAffirmationCat] = useState('Self Love');
  const [newPartnerA, setNewPartnerA] = useState('');
  const [newPartnerB, setNewPartnerB] = useState('');
  const [attendedCount, setAttendedCount] = useState(0);
  const storageKey = 'hs_custom_affirmations';

  const categoryImages = {
    'Self Love': '/assets/affirmation_bg.png',
    'Relationship': '/assets/love_book.png',
    'Couples': '/assets/love_book.png',
    'Meditation': '/assets/sacred_gita.png',
    'Confidence': '/assets/confidence_book.png',
    'Healing': '/assets/healing_book.png'
  };

  // Library Books
  const books = [
    { title: 'Love & Relationship', image: '/assets/love_book.png', category: 'Couples' },
    { title: 'Self Healing', image: '/assets/healing_book.png', category: 'Healing' },
    { title: 'Confidence Boost', image: '/assets/confidence_book.png', category: 'Confidence' }
  ];

  // --- AI-powered Generation ---
  const fetchNewAffirmation = async (category) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await aiApi.generateAffirmation(category);
      if (res && res.success) {
        let textObj;
        if (category === 'Couples' && res.affirmation.includes('|')) {
          const parts = res.affirmation.split('|');
          textObj = {
            left: parts[0].trim(),
            right: parts[1].trim(),
            mediaUrl: res.mediaUrl,
            imagePrompt: res.imagePrompt,
            category: category
          };
        } else {
          textObj = {
            text: res.affirmation,
            mediaUrl: res.mediaUrl,
            imagePrompt: res.imagePrompt,
            category: category
          };
        }

        setHistory(prev => {
          const catHistory = prev[category] || [];
          const isDuplicate = catHistory.some(item => {
            const textA = (item.text || (item.left ? `${item.left} | ${item.right}` : '') || (typeof item === 'string' ? item : '')).trim().toLowerCase();
            const textB = (textObj.text || (textObj.left ? `${textObj.left} | ${textObj.right}` : '')).trim().toLowerCase();
            return textA === textB;
          });

          if (isDuplicate) {
            return prev;
          }

          const newCatHistory = [...catHistory, textObj];
          setCurrentIndexes(prevIdx => ({
            ...prevIdx,
            [category]: newCatHistory.length - 1
          }));

          return {
            ...prev,
            [category]: newCatHistory
          };
        });
      }
    } catch (err) {
      console.error("Failed to generate affirmation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const catHistory = history[activeTab] || [];
    if (catHistory.length === 0) {
      fetchNewAffirmation(activeTab);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'Self Love', icon: Heart, color: '#FDEEF1', text: '#D17B88' },
    { id: 'Relationship', icon: User, color: '#F5F1FE', text: '#9079C1' },
    { id: 'Couples', icon: Users, color: '#FFF9EE', text: '#CCAA3D' },
    { id: 'Meditation', icon: Wind, color: '#FDF0F3', text: '#D17B88' },
    { id: 'Confidence', icon: Star, color: '#F5F1FE', text: '#9079C1' },
    { id: 'Healing', icon: Shield, color: '#FFF9EE', text: '#CCAA3D' },
  ];
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setCustomAffirmations(JSON.parse(saved));
    } else {
      setCustomAffirmations([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isMeditationMode) {
      setAttendedCount(0);
    }
  }, [isMeditationMode]);

  useEffect(() => {
    if (!isFullScreen) return undefined;
    const onEsc = (event) => {
      if (event.key === 'Escape') setIsFullScreen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isFullScreen]);

  const nextAffirmation = async () => {
    if (isFlipping || loading) return;
    const catHistory = history[activeTab] || [];
    const activeIdx = currentIndexes[activeTab] ?? -1;
    if (activeIdx < catHistory.length - 1) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndexes(prev => ({
          ...prev,
          [activeTab]: activeIdx + 1
        }));
        setIsFlipping(false);
      }, 500);
    } else {
      await fetchNewAffirmation(activeTab);
    }
  };

  const prevAffirmation = () => {
    if (isFlipping || loading) return;
    const activeIdx = currentIndexes[activeTab] ?? -1;
    if (activeIdx > 0) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndexes(prev => ({
          ...prev,
          [activeTab]: activeIdx - 1
        }));
        setIsFlipping(false);
      }, 500);
    }
  };

  const localizeAffirmation = (str) => {
    if (!str || typeof str !== 'string') return str;
    const cleanKey = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t('affirmation.db.' + cleanKey, str);
  };

  const getCurrentAffirmationObj = () => {
    const catHistory = history[activeTab] || [];
    const activeIdx = currentIndexes[activeTab] ?? -1;
    if (activeIdx < 0 || activeIdx >= catHistory.length) return null;
    return catHistory[activeIdx];
  };

  const getCurrentAffirmation = () => {
    const item = getCurrentAffirmationObj();
    if (!item) return t('affirmation.empty', 'No affirmations available yet.');
    if (isCoupleMode && item.left) {
      return {
        left: localizeAffirmation(item.left),
        right: localizeAffirmation(item.right)
      };
    }
    return localizeAffirmation(item.text || item);
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-10 bg-gradient-to-br from-[#FAF7F8] via-white to-[#FDF0F3] relative overflow-hidden font-sans">
      
      {/* --- FLOATING PARTICLES --- */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-rose-200/30 blur-sm"
            animate={{
              y: [0, -1000],
              x: [0, Math.sin(i) * 200],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: i * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-20px',
            }}
          />
        ))}
      </div>

      {/* --- SECTION 1: HEADER --- */}
      <div className="pt-10 text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tighter text-[#15192c] drop-shadow-[0_0_25px_rgba(209,123,136,0.3)]"
        >
          {t('affirmation.affirmations', 'Affirmation Sakhi')} <span className="text-[#D17B88]">✨</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] font-black uppercase tracking-[0.6em] text-[#A98DA4] mt-2"
        >
          {t('affirmation.tagline', 'Speak Your Truth • Heal Your Soul')}
        </motion.p>
      </div>

      {/* --- SECTION 2: CATEGORY TABS --- */}
      <div className="mt-12 flex justify-center sticky top-4 z-40 px-4 w-full">
        <div className="bg-white/60 backdrop-blur-2xl border border-white p-1.5 rounded-[2rem] shadow-2xl shadow-rose-100/50 flex gap-1.5 max-w-full overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { 
                setActiveTab(tab.id); 
                setIsCoupleMode(tab.id === 'Couples');
                setIsMeditationMode(tab.id === 'Meditation');
              }}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.8rem] transition-all duration-500 whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gradient-to-r from-[#15192c] to-[#452433] text-white shadow-xl scale-105'
                : 'hover:bg-rose-50 text-[#6B5E63] font-bold'}`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'text-rose-300' : ''} />
              <span className="text-[11px] font-black uppercase tracking-widest">{t('affirmation.tabs.' + tab.id, tab.id)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- SECTION 3: BOOK STYLE CARD --- */}
      <div className="mt-16 max-w-7xl mx-auto relative z-10 px-4">
        <div className="relative w-full aspect-[16/10] md:aspect-[16/8] perspective-2000">
          
          <div className="absolute inset-0 bg-[#2C1520]/5 blur-3xl transform translate-y-8 scale-95" />

          {/* Book Wrapper */}
          <div className="absolute inset-0 bg-[#15192c] rounded-[3rem] shadow-[0_30px_100px_rgba(45,21,32,0.2)] border-r-[12px] border-[#3D2530] flex">
             
             {/* Spine */}
             <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-black/10 z-30" />

             {/* Book Inner */}
             <div className="absolute inset-[15px] bg-[#FFF9F9] rounded-[2.5rem] overflow-hidden flex shadow-inner border border-rose-50/50">
                
                {/* Left Page (DYNAMIC IMAGE) */}
                <div className="flex-1 border-r border-rose-50/50 relative overflow-hidden group">
                   <AnimatePresence mode="wait">
                      <motion.img 
                        key={activeTab + (getCurrentAffirmationObj()?.mediaUrl || '')}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.9, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                        src={getCurrentAffirmationObj()?.mediaUrl ? resolveMediaUrl(getCurrentAffirmationObj()?.mediaUrl) : (categoryImages[activeTab] || '/assets/affirmation_bg.png')} 
                        alt={activeTab} 
                        className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                      />
                   </AnimatePresence>
                   <div className="absolute inset-0 bg-gradient-to-r from-rose-900/40 to-transparent" />
                   <div className="absolute bottom-6 left-6 text-white text-left z-10">
                      <Quote size={20} className="mb-2 opacity-50" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('affirmation.tabs.' + activeTab, activeTab)} • {t('affirmation.library', 'Sakhi Library')}</p>
                      <p className="text-sm font-bold italic">{t('affirmation.visualizingHealing', 'Visualizing your healing.')}</p>
                   </div>
                </div>

                {/* Right Page (Content) */}
                <div className="flex-1 bg-white p-10 flex flex-col justify-center items-center text-center relative overflow-hidden">
                   <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center justify-center space-y-4"
                        >
                          <RefreshCw className="animate-spin text-[#D17B88]" size={36} />
                          <p className="text-xs font-black text-[#A98DA4] uppercase tracking-widest animate-pulse">
                            Sakhi is channelizing a new truth...
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={(currentIndexes[activeTab] ?? -1) + activeTab + isCoupleMode}
                          initial={{ rotateY: -80, opacity: 0, originX: 0 }}
                          animate={{ rotateY: 0, opacity: 1, originX: 0 }}
                          exit={{ rotateY: 80, opacity: 0, originX: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="w-full flex flex-col items-center"
                        >
                           <div className="mb-6 px-4 py-1.5 bg-rose-50 rounded-full border border-rose-100">
                              <span className="text-[8px] font-black text-[#D17B88] uppercase tracking-[0.2em]">{t('affirmation.tabs.' + activeTab, activeTab)}</span>
                           </div>

                             {(() => {
                                const aff = getCurrentAffirmation();
                                if (isCoupleMode && typeof aff === 'object' && aff.left) {
                                  return (
                                    <div className="space-y-8 max-w-sm">
                                      <div className="p-4 rounded-2xl bg-rose-50/30">
                                        <p className="text-sm font-black text-[#6B5E63] mb-2 uppercase tracking-widest text-rose-300">{t('affirmation.partner_a', 'Partner A')}</p>
                                        <p className="text-lg md:text-xl font-black text-[#15192c] italic">"{aff.left}"</p>
                                      </div>
                                      <div className="flex items-center gap-4 justify-center">
                                         <div className="h-px w-8 bg-rose-100" />
                                         <Heart size={16} className="text-rose-200" />
                                         <div className="h-px w-8 bg-rose-100" />
                                      </div>
                                      <div className="p-4 rounded-2xl bg-[#F5F1FE]/30">
                                        <p className="text-sm font-black text-[#6B5E63] mb-2 uppercase tracking-widest text-purple-300">{t('affirmation.partner_b', 'Partner B')}</p>
                                        <p className="text-lg md:text-xl font-black text-[#15192c] italic">"{aff.right}"</p>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <p className="text-2xl md:text-3xl lg:text-4xl font-black text-[#15192c] leading-tight tracking-tight italic px-6 font-serif">
                                      "{typeof aff === 'string' ? aff : (aff.text || aff.left)}"
                                    </p>
                                  );
                                }
                             })()}
                          </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </div>
          </div>

          {/* Page Flip Overlay */}
          {isFlipping && (
            <motion.div
              initial={{ rotateY: 0, originX: 0 }}
              animate={{ rotateY: -180, originX: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute top-[15px] bottom-[15px] right-[15px] w-1/2 bg-white rounded-r-[2.5rem] z-20 border-l border-rose-50 shadow-2xl overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-rose-50/30" />
            </motion.div>
          )}

          {/* Nav Controls */}
          <button onClick={prevAffirmation} className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#15192c] hover:scale-110 active:scale-95 transition-all z-40 border border-rose-50">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextAffirmation} className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#15192c] hover:scale-110 active:scale-95 transition-all z-40 border border-rose-50">
            <ChevronRight size={24} />
          </button>
        </div>

      </div>


      {/* --- MEDITATION BREATHING ANIMATION --- */}

      {/* --- MEDITATION BREATHING ANIMATION --- */}
      <AnimatePresence>
         {isMeditationMode && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="mt-12 max-w-4xl mx-auto px-4 overflow-hidden"
           >
              <div className="bg-[#15192c] p-10 md:p-16 rounded-[3.5rem] text-center relative overflow-hidden">
                 <div className="relative flex items-center justify-center h-64 mb-10">
                    <motion.div 
                       animate={{ 
                         scale: [1, 1.4, 1],
                         opacity: [0.3, 1, 0.3]
                       }}
                       transition={{ 
                         duration: 6,
                         repeat: Infinity,
                         ease: "easeInOut"
                       }}
                       className="absolute w-44 h-44 rounded-full border-[10px] border-rose-300/30"
                    />
                    <motion.div 
                       animate={{ 
                         scale: [1, 1.4, 1]
                       }}
                       transition={{ 
                         duration: 6,
                         repeat: Infinity,
                         ease: "easeInOut"
                       }}
                       className="w-40 h-40 rounded-full bg-gradient-to-br from-rose-200 to-rose-400 shadow-[0_0_50px_rgba(251,191,191,0.5)] flex items-center justify-center text-white"
                    >
                       <span className="text-xl font-black uppercase tracking-widest drop-shadow-md">{t('affirmation.breathe', 'Breathe')}</span>
                    </motion.div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <h3 className="text-2xl font-black text-rose-100">{t('affirmation.syncHealing', 'Synchronized Healing')}</h3>
                    <p className="text-rose-100/50 text-sm italic">{t('affirmation.meditationInstruction', 'Auto-play removed. Tap attend when you complete one mindful breath cycle.')}</p>
                    
                    <div className="pt-6 flex justify-center gap-6">
                       <button 
                        onClick={() => {
                          setAttendedCount((prev) => prev + 1);
                          nextAffirmation();
                        }}
                         className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10"
                       >
                          <CheckCircle2 size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{t('affirmation.markAttended', 'Mark as Attended')}</span>
                       </button>
                       <div className="flex items-center px-5 py-3 rounded-2xl bg-white/5 text-rose-100/90 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                          {t('affirmation.cyclesAttended', 'Cycles Attended')}: {attendedCount}
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* --- SECTION: YOUR PERSONAL SANCTUARY (MANUAL ENTRY) --- */}
      <div className="mt-24 max-w-6xl mx-auto px-4 pb-12">
         <div className="relative overflow-hidden bg-[#15192c] rounded-[3rem] p-10 md:p-20 shadow-[0_40px_80px_-20px_rgba(45,21,32,0.3)]">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] -mr-48 -mt-24" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] -ml-40 -mb-20" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-rose-200 text-[10px] font-black uppercase tracking-widest">
                     <PenLine size={12} className="text-rose-400" /> {t('affirmation.privateSanctuary', 'Private Sanctuary')}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                     {t('affirmation.writeOwn', 'Write Your Own')} <br/> 
                     <span className="text-rose-300">{t('affirmation.divineTruths', 'Divine Truths')}</span>
                  </h2>
                  <p className="text-rose-100/60 text-lg font-medium leading-relaxed">
                     {t('affirmation.customDesc', "Your words have power. Create personalized affirmations that speak directly to your soul's current journey.")}
                  </p>
                  
                  <div className="space-y-4">
                     <div className="relative group">
                        <textarea 
                          value={newAffirmation}
                          onChange={(e) => setNewAffirmation(e.target.value)}
                          placeholder={t('affirmation.customPlaceholder', "I am manifesting my highest potential today...")}
                          className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-white text-lg font-medium focus:outline-none focus:border-rose-400/50 transition-all min-h-[140px] placeholder:text-white/20"
                        />
                     </div>
                     <button 
                        onClick={async () => {
                          if (!newAffirmation.trim()) return;
                          const newEntry = { category: activeTab, text: newAffirmation, mediaUrl: '' };
                          const payloadTitle = newAffirmation;

                          // 1. Save to Private Confidential List
                          const updated = [newEntry, ...customAffirmations];
                          setCustomAffirmations(updated);
                          localStorage.setItem(storageKey, JSON.stringify(updated));

                          // 2. Publish to Public Carousel (Backend)
                          try {
                            await adminApi.createSakhiContent({
                              title: payloadTitle,
                              description: '',
                              duration: '',
                              category: activeTab,
                              scripture: '',
                              focus: '',
                              tab: 'affirmations',
                              author: user?.full_name || 'Member',
                              status: 'Published',
                              mediaUrl: '',
                              type: 'Text Module'
                            });
                          } catch (err) {
                            console.error("Failed to publish to public carousel", err);
                          }

                          // 3. Append to history & set index
                          setHistory(prev => {
                            const catHistory = prev[activeTab] || [];
                            const updatedHistory = [...catHistory, newEntry];
                            setCurrentIndexes(prevIdx => ({
                              ...prevIdx,
                              [activeTab]: updatedHistory.length - 1
                            }));
                            return {
                              ...prev,
                              [activeTab]: updatedHistory
                            };
                          });

                          // 4. Clear inputs
                          setNewAffirmation('');
                        }}
                       className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-rose-400 to-rose-500 text-white font-black uppercase tracking-widest shadow-xl shadow-rose-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                     >
                        {t('affirmation.saveAffirmation', 'Save Your Affirmation')} <PlusCircle size={20} />
                     </button>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-sm font-black text-rose-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <BookOpen size={16} /> {t('affirmation.savedTruths', 'Your Saved Truths')}
                  </h4>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">
                     <AnimatePresence initial={false}>
                        {customAffirmations.length === 0 ? (
                           <div className="p-8 rounded-3xl border border-white/5 bg-white/5 text-center">
                              <p className="text-rose-100/30 text-sm italic">{t('affirmation.emptyCustomList', 'Your private list is empty. Begin writing your journey today.')}</p>
                           </div>
                        ) : (
                           customAffirmations.map((text, idx) => (
                               <motion.div 
                                 key={idx}
                                 initial={{ opacity: 0, x: 20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, scale: 0.95 }}
                                 className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between gap-4"
                              >
                                 <div className="flex gap-4 items-start">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                                    <div>
                                      <p className="text-[9px] font-black uppercase tracking-widest text-rose-300 mb-1">
                                        {typeof text === 'string' ? 'Self Love' : text.category}
                                      </p>
                                      {typeof text === 'object' && text.category === 'Couples' ? (
                                        <div className="space-y-1">
                                          <p className="text-rose-50 font-medium italic"><span className="text-rose-300/50">A:</span> "{text.left}"</p>
                                          <p className="text-rose-50 font-medium italic"><span className="text-rose-300/50">B:</span> "{text.right}"</p>
                                        </div>
                                      ) : (
                                        <p className="text-rose-50 font-medium italic">"{typeof text === 'string' ? text : text.text}"</p>
                                      )}
                                    </div>
                                 </div>
                                 <button 
                                   onClick={() => {
                                      const updated = customAffirmations.filter((_, i) => i !== idx);
                                      setCustomAffirmations(updated);
                                      localStorage.setItem(storageKey, JSON.stringify(updated));
                                   }}
                                  className="p-2 text-rose-300/70 hover:text-rose-300 transition-all"
                                 >
                                    <X size={18} />
                                 </button>
                              </motion.div>
                           ))
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </div>
         </div>
      </div>


      {/* --- FULL SCREEN READING MODE --- */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[10050] bg-[#12080D] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0">
               <img src={getCurrentAffirmationObj()?.mediaUrl ? resolveMediaUrl(getCurrentAffirmationObj()?.mediaUrl) : (categoryImages[activeTab] || '/assets/affirmation_bg.png')} alt="Focus" className="w-full h-full object-cover blur-[3px] scale-110 opacity-65" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#12080D]/70 via-[#12080D]/80 to-[#12080D]/85 pointer-events-none" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_20%,#D17B88_0%,transparent_55%)] pointer-events-none" />
            
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-5 right-5 md:top-8 md:right-8 h-12 md:h-14 px-4 md:px-5 rounded-2xl bg-white/10 border border-white/25 text-white flex items-center justify-center gap-2 backdrop-blur-xl hover:bg-white/20 transition-all shadow-lg"
              aria-label="Close full screen"
            >
              <X size={20} />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">{t('affirmation.close', 'Close')}</span>
            </button>

            <div className="w-full max-w-6xl text-center relative z-10">
               <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="space-y-8 md:space-y-10 rounded-[2.2rem] md:rounded-[2.8rem] border border-white/20 bg-black/20 backdrop-blur-md p-6 md:p-10 lg:p-14 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
               >
                  <Quote size={52} className="text-[#F5C7D0] mx-auto opacity-60" />
                  <span className="inline-flex px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.25em] text-rose-100/90">
                    {t('affirmation.section', 'Section')}: {t('affirmation.tabs.' + activeTab, activeTab)}
                  </span>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-rose-50 leading-[1.15] italic tracking-tight font-serif drop-shadow-2xl max-w-5xl mx-auto">
                    {(() => {
                      const aff = getCurrentAffirmation();
                      if (isCoupleMode && typeof aff === 'object' && aff.left) {
                        return `"${aff.left}"`;
                      } else {
                        return `"${typeof aff === 'string' ? aff : (aff.text || aff.left)}"`;
                      }
                    })()}
                  </h2>

                  {isCoupleMode && typeof getCurrentAffirmation() === 'object' && getCurrentAffirmation().left && (
                    <div className="pt-3">
                       <p className="text-2xl md:text-3xl lg:text-4xl font-black text-rose-100/85 leading-tight italic tracking-tight font-serif max-w-4xl mx-auto">
                          "{getCurrentAffirmation().right}"
                       </p>
                    </div>
                  )}

                  <div className="pt-6 flex flex-col items-center gap-4">
                     <div className="flex gap-3">
                        <button onClick={prevAffirmation} className="w-12 h-12 rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"><ChevronLeft size={22} /></button>
                        <button onClick={nextAffirmation} className="w-12 h-12 rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"><ChevronRight size={22} /></button>
                     </div>
                     <p className="text-[10px] uppercase tracking-[0.25em] text-rose-100/60">{t('affirmation.pressEsc', 'Press ESC to close')}</p>
                  </div>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .perspective-2000 { perspective: 2000px; }
      `}</style>
    </div>
  );
};

export default AffirmationScreen;

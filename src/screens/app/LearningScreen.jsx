import React, { useState, useEffect } from 'react';
import { PlayCircle, BookOpen, Clock, ChevronRight, Award, Flame, Sparkles, X, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import contentAssetApi from '../../api/contentAssetApi';

const LearningScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const translateContentTitle = (title) => {
    const keyMap = {
      'The Hormonal Roadmap': 'content.theHormonalRoadmap',
      'PCOD & You: Volume 1': 'content.pcodAndYouVolume1',
      'Womens Monthly Wellness': 'content.womensMonthlyWellness',
      'Beauty Without Parlour': 'content.beautyWithoutParlour',
      'Healing Loneliness': 'content.healingLoneliness',
      'The PCOD Protocol': 'content.thePcodProtocol',
      'Science of Desire': 'content.scienceOfDesire',
      'Woman Like A Poem': 'content.womanLikeAPoem',
      'The Mystery of Hunger': 'content.mysteryOfHunger',
      'Inner Healing Guide': 'content.innerHealingGuide',
      "Potter's Secret to Parenting": 'content.pottersSecretToParenting',
      'Husbands Heart Health': 'content.husbandsHeartHealth',
      'Child Development': 'content.childDevelopment',
      'Loneliness Blessing in Disguise': 'content.lonelinessBlessingInDisguise',
      'WHEN SOUL TALK TO MIND': 'content.whenSoulTalkToMind',
      'Heart To Heart': 'content.heartToHeart',
      'Life After Shadi': 'content.lifeAfterShadi',
      'ceo of the family': 'content.ceoOfTheFamily'
    };
    const key = keyMap[title];
    return key ? t(key) : t(title, title);
  };

  const displayDurationAndLeft = (item) => {
    const dur = item.duration;
    if (dur === 'Remaining') return t('learning.remaining', 'Remaining');
    if (dur === 'Pages Left') return t('learning.pagesLeft', 'Pages Left');
    
    let translatedDur = dur;
    if (dur.endsWith('m')) {
      translatedDur = dur.replace('m', '') + ' ' + t('learning.minsLabel', 'min');
    } else if (dur.includes('pages')) {
      translatedDur = dur.replace('pages', '') + ' ' + t('learning.pagesLabel', 'pages');
    }
    return `${translatedDur} ${t('learning.leftLabel', 'Left')}`;
  };

  const [continueWatching, setContinueWatching] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const localize = (str) => {
    if (!str) return '';
    const key = 'explore.db.' + str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return t(key, str);
  };

  useEffect(() => {
    const syncProgress = async () => {
      let finalProgress = {};
      try {
        const res = await contentAssetApi.getUserAllProgress();
        if (res && res.success && res.data) {
          const localProg = JSON.parse(localStorage.getItem('userProgress') || '{}');
          res.data.forEach(item => {
            const title = item.content?.title;
            if (title) {
              const position = item.position;
              // Default video duration is 600 seconds, book default is 10 pages
              const totalSec = item.contentType === 'Video' ? 600 : 10;
              const percent = item.completed ? 100 : Math.round((position / totalSec) * 100);

              // Update local progress if backend has a higher or newer progress percentage
              if (!localProg[title] || localProg[title].percent < percent) {
                localProg[title] = {
                  percent: Math.min(100, Math.max(5, percent)),
                  type: item.contentType,
                  position: position
                };
              }
            }
          });
          localStorage.setItem('userProgress', JSON.stringify(localProg));
          finalProgress = localProg;
        } else {
          finalProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        }
      } catch (err) {
        console.warn('Failed to load backend user progress, using localStorage fallback:', err);
        finalProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
      }

      const watching = [];
      const reading = [];
      let completed = 0;

      Object.entries(finalProgress).forEach(([title, data]) => {
        const item = { 
          title, 
          progress: data.percent, 
          type: data.type,
          instructor: data.type === 'Video' ? 'Dr. Sakshi' : 'HealthSakhi Team',
          duration: data.type === 'Video' ? 'Remaining' : 'Pages Left'
        };

        if (data.percent >= 100) {
          completed++;
        } else if (data.percent > 0) {
          if (data.type === 'Video') watching.push(item);
          else reading.push(item);
        }
      });

      // Fallback if empty to keep UI populated for demo
      if (watching.length === 0) {
        watching.push({ title: 'The Hormonal Roadmap', instructor: 'Dr. Sakshi', progress: 85, duration: '45m', type: 'Video' });
      }
      if (reading.length === 0) {
        reading.push({ title: 'PCOD & You: Volume 1', author: 'HealthSakhi Team', progress: 25, duration: '120 pages', type: 'Book' });
      }

      setContinueWatching(watching);
      setContinueReading(reading);
      setCompletedCount(completed);
    };

    syncProgress();
  }, []);

  const handleVideoClick = (video) => {
    // Navigate directly to Wellness Library explore screen and autoplay this video
    navigate('/app/explore', { state: { autoplayVideoTitle: video.title } });
  };

  const markAsCompleted = () => {
    if (!selectedVideo) return;
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    userProgress[selectedVideo.title] = { percent: 100, type: 'Video' };
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
    
    // Refresh lists
    setContinueWatching(prev => prev.filter(v => v.title !== selectedVideo.title));
    setCompletedCount(prev => prev + 1);
    setShowVideoModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12">
      
      {/* ── Learning Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 lg:px-0">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#15192c' }}>{t('learning.title', 'My Learning Journey')} 📚</h1>
          <p className="text-sm font-semibold" style={{ color: '#C4A0AC' }}>{t('learning.subtitle', "Keep going! You're making amazing progress this week.")}</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border bg-white shadow-sm" style={{ borderColor: '#F5E6EA' }}>
          <Flame className="text-orange-500" size={20} fill="currentColor" />
          <span className="text-sm font-bold" style={{ color: '#15192c' }}>12 {t('learning.streakSuffix', 'Day Streak')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-2 lg:px-0">
        
        {/* Videos Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#15192c' }}>
              <PlayCircle style={{ color: '#ff69b4' }} /> {t('learning.watching', 'Watching')}
            </h2>
            <button className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C4A0AC' }}>{t('learning.viewHistory', 'View History')}</button>
          </div>
          <div className="space-y-4">
            {continueWatching.map((item) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={item.title} 
                onClick={() => handleVideoClick(item)}
                className="bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group cursor-pointer" 
                style={{ borderColor: '#F5E6EA' }}
              >
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden" style={{ background: '#FDEEF1', color: '#ff69b4' }}>
                    <PlayCircle size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#C4A0AC' }}>{item.instructor === 'Dr. Sakshi' ? t('learning.drSakhi', 'Dr. Sakshi') : t('learning.healthSakhiTeam', 'HealthSakhi Team')}</p>
                    <h3 className="font-bold text-[#15192c] text-base truncate group-hover:text-[#ff69b4] transition-colors">{translateContentTitle(item.title)}</h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-[9px] font-bold uppercase" style={{ color: '#C4A0AC' }}>
                        <span>{item.progress}% {t('learning.doneLabel', 'Done')}</span>
                        <span>{displayDurationAndLeft(item)}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: '#FDEEF1' }}>
                        <div className="h-full transition-all duration-1000" style={{ width: `${item.progress}%`, background: '#ff69b4' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Books Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#15192c' }}>
              <BookOpen style={{ color: '#ff69b4' }} /> {t('learning.readingList', 'Reading List')}
            </h2>
            <button className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C4A0AC' }}>{t('learning.myLibrary', 'My Library')}</button>
          </div>
          <div className="space-y-4">
            {continueReading.map((item) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={item.title} 
                onClick={() => navigate('/app/books')}
                className="bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group cursor-pointer" 
                style={{ borderColor: '#F5E6EA' }}
              >
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#FDEEF1', color: '#ff69b4' }}>
                    <BookOpen size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#C4A0AC' }}>{item.author === 'HealthSakhi Team' ? t('learning.healthSakhiTeam', 'HealthSakhi Team') : item.author}</p>
                    <h3 className="font-bold text-[#15192c] text-base truncate group-hover:text-[#ff69b4] transition-colors">{translateContentTitle(item.title)}</h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-[9px] font-bold uppercase" style={{ color: '#C4A0AC' }}>
                        <span>{item.progress}% {t('learning.readLabel', 'Read')}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {displayDurationAndLeft(item)}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: '#FDEEF1' }}>
                        <div className="h-full transition-all duration-1000" style={{ width: `${item.progress}%`, background: '#ff69b4' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Rewards Section ── */}
      <section className="rounded-[3rem] p-10 relative overflow-hidden shadow-sm" style={{ background: '#FFF7F8', border: '1px solid #F5E6EA' }}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: '#fff', border: '1px solid #F5E6EA', color: '#ff69b4' }}>
              <Award size={14} />
              {t('learning.wellnessMilestones', 'Wellness Milestones')}
            </div>
             <h2 className="text-3xl font-bold" style={{ color: '#15192c' }}>{t('learning.milestoneHeadline', 'Your knowledge is your power.')}</h2>
            <p className="max-w-md text-sm font-medium leading-relaxed" style={{ color: '#9A8A8E' }}>
               {t('learning.milestoneProgressPrefix', 'Complete')} {Math.max(0, 5 - completedCount)} {t('learning.milestoneProgressSuffix', 'more modules this week to unlock the "Hormonal Sage" digital badge and a free 1-min insight session.')}
            </p>
            <button 
              onClick={() => navigate('/app/rewards')}
              className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all hover:brightness-105 shadow-md flex items-center gap-2" style={{ background: '#ff69b4' }}>
              <Sparkles size={14} />
              {t('learning.exploreRewards', 'Explore Rewards')}
            </button>
          </div>
          <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center relative shadow-sm border" style={{ borderColor: '#F5E6EA' }}>
             <Award size={64} style={{ color: '#F5B4BC' }} />
             <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#ff69b4] flex items-center justify-center text-white shadow-lg">
                <Sparkles size={20} />
             </div>
          </div>
        </div>
      </section>

      {/* ── Video Player Modal ── */}
      <AnimatePresence>
        {showVideoModal && selectedVideo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVideoModal(false)} className="absolute inset-0 bg-[#15192c]/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-5xl bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
              
              {/* Video Player Area */}
              <div className="flex-[1.5] bg-black relative group min-h-[300px] md:min-h-0">
                <video 
                  key={selectedVideo.title}
                  className="w-full h-full object-cover"
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  controls
                >
                  <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-8 left-8 text-white z-10">
                   <span className="px-3 py-1 bg-[#ff69b4] rounded-lg text-[9px] font-black uppercase tracking-widest mb-2 inline-block shadow-lg">{selectedVideo.tag || 'Knowledge'}</span>
                   <h3 className="text-xl md:text-2xl font-black drop-shadow-md">{translateContentTitle(selectedVideo.title)}</h3>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="w-full md:w-96 bg-white p-6 md:p-10 flex flex-col justify-between border-l border-rose-50 overflow-y-auto custom-scrollbar">
                 <div className="space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('learning.resumeLearning', 'Resume Learning')}</h4>
                       <button onClick={() => setShowVideoModal(false)} className="text-[#C4A0AC] hover:text-[#15192c] transition-colors"><X size={20} /></button>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-xs font-bold text-[#15192c] leading-relaxed italic">"{t('learning.welcomeBackPrompt', "Welcome back, Sakhi. You're doing great. Let's finish this session together.")}"</p>
                       <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3 text-[#C4A0AC]">
                             <Clock size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">{t('learning.resumingFrom', 'Resuming from')} {selectedVideo.progress}%</span>
                          </div>
                          <div className="flex items-center gap-3 text-[#ff69b4]">
                             <Sparkles size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">+{100} {t('home.potentialCoins', 'Potential Coins')}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={markAsCompleted}
                   className="w-full py-4 bg-[#15192c] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff69b4] transition-all shadow-xl mt-8"
                 >
                    {t('home.markAsCompleted', 'Mark as Completed')}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningScreen;

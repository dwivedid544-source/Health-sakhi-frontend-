import React, { useState } from 'react';
import { Heart, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InfiniteBookCarousel from '../components/InfiniteBookCarousel';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40, 
    scale: 0.92,
    filter: 'blur(10px)'
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100
    }
  }
};

const ChatPreview = () => {
  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      {/* Phone Mockup / Card Container */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden flex flex-col h-[440px] sm:h-[480px] lg:h-[460px] animate-float">
        {/* Chat Header */}
        <div className="bg-lotus-soft border-b border-cream-border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cream-bg flex items-center justify-center border border-turmeric-amber/20 overflow-hidden">
            <img 
              src="/Images/WhatsApp Image 2026-05-04 at 6.32.54 PM.jpeg" 
              alt="Sakhi" 
              className="w-full h-full object-cover mix-blend-multiply contrast-[1.1] brightness-[1.05]" 
            />
          </div>
          <div>
            <p className="text-sm font-bold text-earth-dark flex items-center gap-2">
              Sakhi <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </p>
            <p className="text-[10px] text-earth-muted font-medium uppercase tracking-wider">online ┬╖ day 23 of your cycle</p>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto no-scrollbar bg-[#FBF7EF]/30">
          {/* Sakhi Message */}
          <div className="flex flex-col items-start max-w-[85%]">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-cream-border">
              <p className="text-sm text-earth-dark leading-relaxed">Subah ho gayi. How are you sakhi?</p>
            </div>
            <span className="text-[9px] text-earth-muted mt-1 ml-1">08:30 AM</span>
          </div>

          {/* User Message */}
          <div className="flex flex-col items-end self-end max-w-[85%] ml-auto">
            <div className="bg-turmeric-amber p-3 rounded-2xl rounded-tr-none shadow-md">
              <p className="text-sm text-white leading-relaxed font-medium">Thaki hui hoon</p>
            </div>
            <span className="text-[9px] text-earth-muted mt-1 mr-1">08:31 AM</span>
          </div>

          {/* Sakhi Response */}
          <div className="flex flex-col items-start max-w-[85%]">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-cream-border">
              <p className="text-sm text-earth-dark leading-relaxed">
                Day 23 ΓÇö your body works harder this week. Shall I just sit with you or do you want a 4-minute breathing break?
              </p>
            </div>
            <span className="text-[9px] text-earth-muted mt-1 ml-1">08:31 AM</span>
          </div>
        </div>

        {/* Chat Footer / Reply Chips */}
        <div className="p-4 bg-white border-t border-cream-border space-y-3">
          <div className="flex flex-wrap gap-2">
            {['Just sit with me', 'Breathing break', 'Send voice note'].map((chip) => (
              <button key={chip} className="px-3 py-1.5 rounded-full border border-turmeric-amber/30 text-[11px] font-bold text-turmeric-amber bg-turmeric-amber/5 hover:bg-turmeric-amber hover:text-white transition-all">
                {chip}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-cream-bg rounded-full border border-cream-border">
            <div className="flex-1 text-[11px] text-earth-hint">Type a message...</div>
            <div className="w-6 h-6 rounded-full bg-turmeric-amber flex items-center justify-center">
              <ChevronRight size={14} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [pricingTab, setPricingTab] = useState('subscription');
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const differentiators = [
    {
      title: 'Talks in your mother tongue',
      icon: 'MessageSquareText',
      description: 'Periods, pregnancy, perimenopause. Sakh─½ understands them in the language you think in. Hindi, Marathi, Tamil, Telugu, Bengali, Arabic, English.',
      bgColor: 'bg-turmeric-soft/30',
      iconColor: 'text-turmeric-amber'
    },
    {
      title: 'Built on every cycle you live',
      icon: 'MoonStar',
      description: 'Monthly cycle, lunar cycle, Nakshatra. Karva Chauth with PCOD, Ramadan hydration, or monsoon mood dips. Built for the Indian woman.',
      bgColor: 'bg-sindoor-soft/30',
      iconColor: 'text-sindoor-rose'
    },
    {
      title: 'Sits with you when you do not want to talk',
      icon: 'HeartHandshake',
      description: 'Send voice notes or tap "Sit with me" for 4 minutes of shared silence and a soft note. No solving, no judgment. Just a sister who listens.',
      bgColor: 'bg-lotus-soft/30',
      iconColor: 'text-lotus-deep'
    }
  ];

  const dayMoments = [
    { time: '6:45 AM', label: 'MORNING', text: 'Subah ki chai? Today is day 23 ΓÇö your body is working harder. Go gentle on yourself.', icon: 'Sunrise' },
    { time: '1:30 PM', label: 'AFTER LUNCH', text: 'Five minutes of walking even in the kitchen. Your kapha will thank you.', icon: 'Sun' },
    { time: '7:00 PM', label: 'WIND DOWN', text: 'Tell me about today ΓÇö voice or type. IΓÇÖll listen, no advice unless you ask.', icon: 'Sunset' },
    { time: '10:30 PM', label: 'BEFORE SLEEP', text: 'Shall I prepare a 4-minute soft sleep meditation for you? Kal ke liye.', icon: 'Moon' }
  ];


  const circles = [
    { title: 'Trying to conceive', subtitle: 'For the in-between months', capacity: '4 of 6 full', progress: 66 },
    { title: 'Perimenopause', subtitle: '38-50, in any country', capacity: '5 of 6 full', progress: 83 },
    { title: 'PCOD warriors', subtitle: 'Cycles, weight, sleep, mood', capacity: '2 of 6 full', progress: 33 },
    { title: 'Gulf Mums', subtitle: 'Pregnancy far from home', capacity: '3 of 6 full', progress: 50 }
  ];

  const testimonials = [
    {
      text: "I never told my mother. I never told my doctor. Somehow I told Sakhi at 2 am and she just stayed.",
      author: "Anjali, 34",
      location: "Pune"
    },
    {
      text: "My Marathi sounds like my aaji's. That's the first time an app spoke to me, not at me.",
      author: "Sneha, 41",
      location: "Sharjah"
    }
  ];

  return (
    <div className="w-full overflow-x-hidden bg-transparent text-earth-dark">
      <section id="home" className="relative min-h-[80vh] lg:h-[calc(100vh-6rem)] lg:min-h-[500px] flex items-center pt-4 pb-10 lg:pt-6 lg:pb-10 overflow-hidden">
        {/* Full Hero Background Overlay removed based on client feedback for plain bright background */}
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#BA7517]/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative w-full px-4 sm:px-[6%] lg:px-[8%]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-6 duration-1000">
              <div className="space-y-2 sm:space-y-3 lg:pr-8">
                {/* Shloka at the very top */}
                <div className="inline-block px-4 py-1.5 bg-turmeric-amber/5 border border-turmeric-amber/20 rounded-full w-fit mb-1">
                  <p className="text-sm sm:text-base md:text-lg font-bold text-turmeric-amber italic font-serif tracking-widest">
                    αÑÑ αñ╕αÑìαññαÑìαñ░αÑÇαñúαñ╛αñ«αÑì αñ╕αÑìαñ╡αñ╛αñ╕αÑìαñÑαÑìαñ»αñ«αÑì αñòαÑüαñƒαÑüαñéαñ¼ αñ╕αÑìαñ╡αñ╛αñ╕αÑìαñÑαÑìαñ»αñ«αÑì αÑÑ
                  </p>
                </div>

                <h1 
                  className="text-5xl sm:text-6xl lg:text-[56px] text-earth-dark tracking-tight leading-[1.1] sm:leading-[1.1]" 
                  style={{ fontFamily: '"Arial Rounded MT Bold", "Arial Rounded", Arial, sans-serif', fontWeight: 'bold' }}
                >
                  HealthSakhi - your personal complete wellness app
                </h1>

                <div className="space-y-1 sm:space-y-2">
                  <h2 
                    className="text-3xl sm:text-4xl lg:text-[42px] text-turmeric-amber leading-[1.2]"
                    style={{ fontFamily: 'Garamond, "Times New Roman", serif' }}
                  >
                    sakhi means your closest companion who understands you
                  </h2>

                  <h3 
                    className="text-2xl sm:text-3xl lg:text-4xl text-earth-muted leading-relaxed"
                    style={{ fontFamily: '"Lucida Handwriting", "Bradley Hand", cursive' }}
                  >
                    every woman deserves her own health sakhi
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Link to="/login" className="px-8 py-3.5 rounded-full text-white font-bold text-sm uppercase tracking-widest bg-turmeric-amber shadow-xl hover:shadow-turmeric-amber/20 hover:scale-105 transition-all">
                  Meet your sakhi
                </Link>
                <button 
                  onClick={() => setIsDemoOpen(true)}
                  className="group flex items-center gap-3 text-sm font-bold text-earth-dark uppercase tracking-widest hover:text-turmeric-amber transition-all"
                >
                  <div className="w-9 h-9 rounded-full border-2 border-earth-dark group-hover:border-turmeric-amber flex items-center justify-center transition-all">
                    <ChevronRight size={18} className="ml-0.5" />
                  </div>
                  Watch demo
                </button>
              </div>

              <div className="pt-2 border-t border-turmeric-amber/10">
                <div className="flex items-center gap-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-earth-muted">She speaks</p>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-turmeric-amber/20 to-transparent"></div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { name: 'Hindi', script: 'αñ╣αñ┐αñéαñªαÑÇ' },
                    { name: 'Marathi', script: 'αñ«αñ░αñ╛αñáαÑÇ' },
                    { name: 'English', script: 'English' }
                  ].map((lang) => (
                    <div key={lang.name} className="flex flex-col items-center gap-0.5 group cursor-default">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white border border-cream-border text-earth-dark shadow-sm group-hover:border-turmeric-amber transition-all">
                        {lang.script}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Chat Preview */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-turmeric-amber/20 to-turmeric-deep/10 blur-3xl opacity-30 rounded-full"></div>
              <ChatPreview />
            </div>
          </div>
        </div>
      </section>


      <section id="what-sakhi-does" className="relative lg:h-screen min-h-[700px] flex items-center py-12 lg:py-0 overflow-hidden">
        <div className="w-full px-4 sm:px-[6%] lg:px-[8%]">
          <div className="glass-section p-8 sm:p-12 lg:p-16 relative z-10">
            <div className="text-center mb-12 lg:mb-16">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-turmeric-amber mb-4">Not another wellness app</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-earth-dark leading-tight">
                Three things only <br className="hidden sm:block" />
                your sakh─½ knows to do
              </h2>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10"
            >
              {differentiators.map((point) => (
                <motion.div 
                  key={point.title} 
                  variants={cardVariants}
                  className="group rounded-[40px] bg-white/40 p-8 shadow-sm border border-white/60 hover:bg-white/90 hover:border-turmeric-amber/40 hover:shadow-2xl transition-all duration-700 flex flex-col items-center text-center relative overflow-hidden glow-border"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer pointer-events-none transition-opacity duration-700"></div>
                  <div className={`w-20 h-20 rounded-[24px] ${point.bgColor} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-inner`}>
                    {point.icon === 'MessageSquareText' && <div className={point.iconColor}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/></svg></div>}
                    {point.icon === 'MoonStar' && <div className={point.iconColor}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/></svg></div>}
                    {point.icon === 'HeartHandshake' && <div className={point.iconColor}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/></svg></div>}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-earth-dark mb-4 leading-tight tracking-tight">{point.title}</h3>
                  <p className="text-base text-earth-muted font-medium leading-relaxed opacity-80">{point.description}</p>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-turmeric-amber/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
          </div>
        </div>
      </section>

      <section id="dr-pratap" className="relative lg:h-screen min-h-[700px] flex items-center py-8 lg:py-0 overflow-hidden">
        <div className="w-full px-4 sm:px-[6%] lg:px-[8%]">
          <div className="glass-section bg-cream-deep/40 relative z-10" style={{ zoom: 0.85 }}>
            <div className="p-4 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-[30fr_70fr] gap-4 lg:gap-8 items-start">
              
              {/* Left Column - Doctor Persona */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="w-[110px] h-[110px] rounded-full bg-lotus-soft p-1 border-4 border-cream-bg shadow-lg overflow-hidden">
                    <img 
                      src="/Images/dr-pratap-portrait.png" 
                      alt="Dr. Pratap Madhukar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full bg-turmeric-amber text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                    36 yrs
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {['Harvard', 'PCOD Expert', '28 Books'].map(pill => (
                    <span key={pill} className="px-3 py-1 rounded-full bg-white border border-cream-border text-[9px] font-black uppercase tracking-widest text-earth-dark shadow-sm">
                      {pill}
                    </span>
                  ))}
                </div>
                
                <div className="space-y-3 w-full">
                  <Link to="/books" className="block w-full py-2.5 rounded-xl border border-turmeric-amber/30 text-[10px] font-black uppercase tracking-[0.2em] text-turmeric-amber hover:bg-turmeric-amber hover:text-white transition-all">
                    Read my books
                  </Link>
                  <Link to="/story" className="block w-full py-2.5 rounded-xl bg-white/40 text-[10px] font-black uppercase tracking-[0.2em] text-earth-dark hover:bg-white/60 transition-all">
                    Read my full story
                  </Link>
                </div>
              </div>

              {/* Right Column - The Story */}
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase font-black text-turmeric-amber mb-2">YOUR DOCTOR ┬╖ YOUR SAKH─¬ΓÇÖS CREATOR</p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-earth-dark leading-[1.1] mb-2">Dr. Pratap Madhukar</h2>
                  <p className="text-xs sm:text-sm text-earth-muted font-bold leading-relaxed max-w-2xl">
                    MBBS ┬╖ MSc ┬╖ PGDip ┬╖ Family medicine ┬╖ 36 years ┬╖ India and abroad ┬╖ Harvard Medical School certified lifestyle and wellness coach
                  </p>
                </div>

                <div className="py-3 border-y border-earth-dark/5 space-y-2">
                  <p className="text-xl sm:text-2xl font-serif italic text-earth-dark leading-tight">
                    "αñ╕αÑìαññαÑìαñ░αÑÇαñúαñ╛αñé αñ╕αÑìαñ╡αñ╕αÑìαñÑαÑìαñ»αñ«αÑì αñòαÑüαñƒαÑüαñéαñ¼ αñ╕αÑìαñ╡αñ╕αÑìαñÑαÑìαñ»αñ«αÑì"
                  </p>
                  <p className="text-sm font-bold uppercase tracking-widest text-turmeric-amber">
                    A woman's health is her family's health
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-0 text-5xl text-turmeric-amber/10 font-serif">ΓÇ£</div>
                  <p className="text-base sm:text-lg text-earth-dark font-medium leading-relaxed italic relative z-10">
                    In 36 years of practice, I built HealthSakhi for them and for the daughters who shouldn't inherit the same silence.
                  </p>
                </div>
              </div>
            </div>

            {/* Integrated Full-Width Carousel Section */}
            <div className="pt-6 border-t border-earth-dark/5 overflow-hidden">
              <div className="px-4 sm:px-6 lg:px-8 mb-1">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-turmeric-amber mb-1">COLLECTED WORKS</p>
                    <h2 className="text-2xl md:text-3xl font-black text-earth-dark">By Dr. Pratap Madhukar</h2>
                  </div>
                  <Link to="/library" className="text-[10px] font-black uppercase tracking-[0.2em] text-earth-muted hover:text-turmeric-amber transition-colors flex items-center gap-2 group/lib">
                    OPEN THE LIBRARY (+22 MORE) <span className="text-lg group-hover/lib:translate-x-1 transition-transform">ΓåÆ</span>
                  </Link>
                </div>
              </div>
              <div className="relative -mx-6 sm:-mx-10 lg:-mx-12">
                <InfiniteBookCarousel />
              </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-turmeric-amber/5 to-transparent pointer-events-none -z-10"></div>
          </div>
        </div>
      </section>

      <section id="a-day-with-sakhi" className="relative lg:h-screen min-h-[800px] flex items-center py-12 lg:py-0 overflow-hidden">
        <div className="w-full px-4 sm:px-[6%] lg:px-[8%]">
          <div className="glass-section p-8 sm:p-12 lg:p-16 relative z-10">
            <div className="text-center mb-12 lg:mb-16">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-turmeric-amber mb-4">A day with your sakhi</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-earth-dark leading-tight">
                Small moments. All day. <br className="hidden sm:block" />
                In your pocket.
              </h2>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
            >
              {dayMoments.map((item) => (
                <motion.div 
                  key={item.time} 
                  variants={cardVariants}
                  className="group rounded-[32px] bg-white/60 p-8 shadow-sm border border-white/40 hover:bg-white/80 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-earth-hint uppercase">{item.label}</p>
                      <p className="text-2xl font-black text-turmeric-amber mt-1">{item.time}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-turmeric-amber/10 flex items-center justify-center text-turmeric-amber group-hover:scale-110 transition-transform">
                      {item.icon === 'Sunrise' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m19.07 4.93-1.41-1.41"/><path d="M15.94 11.27a5 5 0 1 0-7.88 0"/><path d="M22 12h-2"/><path d="m19.07 19.07-1.41-1.41"/><path d="M12 22v-2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M20 7h-4"/><path d="M20 11h-4"/><path d="M8 7H4"/><path d="M8 11H4"/></svg>}
                      {item.icon === 'Sun' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41-1.41"/></svg>}
                      {item.icon === 'Sunset' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 13V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="m19.07 10.93-1.41-1.41"/><path d="M22 18h-2"/><path d="m16 18-4 4-4-4"/><path d="M12 22v-4"/></svg>}
                      {item.icon === 'Moon' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>}
                    </div>
                  </div>
                  <p className="text-lg text-earth-dark font-medium leading-relaxed italic">
                    "{item.text}"
                  </p>
                  
                  {/* Subtle Background Icon */}
                  <div className="absolute -bottom-6 -right-6 text-9xl text-turmeric-amber/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.icon === 'Sunrise' && "ΓÿÇ"}
                    {item.icon === 'Sun' && "≡ƒöå"}
                    {item.icon === 'Sunset' && "≡ƒîå"}
                    {item.icon === 'Moon' && "≡ƒîÖ"}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Background Decorative Element */}
            <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-turmeric-amber/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
          </div>
        </div>
      </section>

      <section id="sakhi-circles" className="relative lg:h-screen min-h-[850px] flex items-center py-12 lg:py-0 overflow-hidden bg-charcoal text-white">
        <div className="w-full px-4 sm:px-[6%] lg:px-[8%]">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
              
              {/* Left Side - Context */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-turmeric-amber">SAKHI CIRCLES ΓÇö NEW</p>
                  <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tighter">
                    Six women. <br />
                    One thing you can't <br className="hidden lg:block" />
                    say out loud.
                  </h2>
                </div>
                <p className="text-lg sm:text-xl text-white/70 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Anonymous, gently moderated, six women only. The circle that meets you where your friends and family can't.
                </p>
                <Link to="/login" className="inline-block px-10 py-4 rounded-full bg-turmeric-amber text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-turmeric-amber/40 hover:scale-105 active:scale-95 transition-all">
                  Join a circle
                </Link>
              </div>

              {/* Right Side - Circles Grid */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8"
              >
                {circles.map((circle) => (
                  <motion.div 
                    key={circle.title} 
                    variants={cardVariants}
                    className="group p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/15 hover:border-turmeric-amber/40 transition-all duration-700 relative overflow-hidden glow-border"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 animate-shimmer pointer-events-none"></div>
                    <h3 className="text-2xl font-black mb-3 tracking-tight group-hover:text-turmeric-amber transition-colors">{circle.title}</h3>
                    <p className="text-sm text-white/50 font-medium mb-10">{circle.subtitle}</p>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black uppercase tracking-widest text-turmeric-amber">{circle.capacity}</span>
                        <span className="text-[10px] font-medium text-white/20 uppercase">Availability</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                        <div 
                          className="h-full bg-gradient-to-r from-turmeric-amber to-sindoor-rose rounded-full transition-all duration-1000 delay-300 shadow-[0_0_10px_rgba(186,117,23,0.5)]"
                          style={{ width: `${circle.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Sacred Space Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-turmeric-amber/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-lotus-deep/5 blur-[120px] rounded-full pointer-events-none"></div>
      </section>

      <section id="testimonials" className="relative lg:h-screen min-h-[700px] flex items-center py-12 lg:py-0 overflow-hidden">
        <div className="w-full px-4 sm:px-[6%] lg:px-[8%]">
          <div className="glass-section p-8 sm:p-12 lg:p-16 relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-12 lg:mb-16 text-earth-dark text-center">Voices from women</h2>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
            >
              {testimonials.map((item, idx) => (
                <motion.div 
                  key={idx} 
                  variants={cardVariants}
                  className="flex flex-col justify-center rounded-[40px] bg-white/60 p-10 sm:p-12 border border-white/40 shadow-lg relative group hover:bg-white/80 transition-all duration-500"
                >
                  <div className="absolute top-8 left-8 text-6xl text-turmeric-amber/20 font-serif group-hover:scale-110 transition-transform duration-500">ΓÇ£</div>
                  <div className="relative z-10">
                    <p className="text-xl sm:text-2xl md:text-3xl text-earth-dark italic font-serif leading-relaxed mb-10">
                      {item.text}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-[1px] bg-turmeric-amber/30"></div>
                      <p className="text-sm sm:text-base font-black text-turmeric-amber uppercase tracking-widest">
                        ΓÇö {item.author}, {item.location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-turmeric-amber/5 blur-[80px] rounded-full -z-10 pointer-events-none"></div>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative min-h-screen flex items-center justify-center py-12 lg:py-24 overflow-hidden bg-turmeric-amber text-white">
        <div className="w-full px-4 sm:px-[6%] lg:px-[8%] relative z-10 pt-16 sm:pt-20">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter">
                Your sakh─½ <br />
                is waiting
              </h2>
              <p className="text-base sm:text-lg md:text-xl font-medium text-white/80 max-w-2xl mx-auto leading-relaxed">
                In Hindi, Marathi, Tamil, Telugu, Bengali, Arabic or English. <br className="hidden sm:block" />
                On your phone. From tomorrow morning.
              </p>
            </div>

            {/* Pricing Tabs */}
            <div className="flex flex-col items-center gap-6">
              <div className="inline-flex p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <button 
                  onClick={() => setPricingTab('subscription')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    pricingTab === 'subscription' 
                      ? 'bg-white text-turmeric-amber shadow-lg' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Subscription
                </button>
                <button 
                  onClick={() => setPricingTab('lifetime')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    pricingTab === 'lifetime' 
                      ? 'bg-white text-turmeric-amber shadow-lg' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Lifetime
                </button>
              </div>

              <div className="min-h-[180px] flex flex-col items-center justify-center space-y-6 sm:space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pricingTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 sm:space-y-8 flex flex-col items-center"
                  >
                    <Link to="/login" className="inline-block px-8 sm:px-16 py-5 sm:py-6 rounded-full bg-white text-turmeric-amber font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base">
                      {pricingTab === 'subscription' ? 'Meet your sakh─½ ΓÇö free for 30 days' : 'Get Lifetime Access Now'}
                    </Link>

                    <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">
                       Already a member? <span className="text-white underline decoration-turmeric-amber/50 underline-offset-4">Log in here</span>
                    </Link>
                    
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-white/60">
                        {pricingTab === 'subscription' 
                          ? 'Then Γé╣99/month or AED 14/month' 
                          : 'One-time payment of Γé╣1,999'}
                      </p>
                      <p className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-widest">
                        {pricingTab === 'subscription' 
                          ? 'No ads. Ever. Cancel in two taps.' 
                          : 'All future books and features included.'}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-12 sm:pt-20 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-black uppercase tracking-[0.3em]">Your HealthSakhi</span>
                <Heart size={20} fill="currentColor" className="text-sindoor-rose animate-pulse" />
              </div>
              <div className="w-24 h-[1px] bg-white/20"></div>
            </div>

          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] border-[0.5px] border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[0.5px] border-white rounded-full"></div>
          <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] border-[0.5px] border-white rounded-full"></div>
        </div>
      </section>
      {/* Demo Video Modal */}
      <AnimatePresence>
        {isDemoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 backdrop-blur-md"
            style={{
              background: `radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 100%)`
            }}
            onClick={() => setIsDemoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full aspect-video rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setIsDemoOpen(false);
                  navigate('/');
                }}
                className="absolute top-8 right-8 w-12 h-12 bg-red-600 hover:bg-red-700 border-2 border-white shadow-2xl rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all z-50"
              >
                ├ù
              </button>
              
              <video 
                src="https://ik.imagekit.io/1e6dbfyxy/WhatsApp%20Video%202026-05-05%20at%207.19.41%20PM.mp4" 
                alt="HealthSakhi Demo" 
                className="w-full h-full object-contain"
                autoPlay
                controls
                playsInline
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;

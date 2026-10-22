import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { getLanguageByCode } from '../data/languages';

const LandingLayout = () => {
  const { langCode, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    // Intersection Observer to track sections
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the upper part of view
      threshold: 0
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const sections = ['home', 'about', 'resources', 'blog', 'contact', 'plans'];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setActiveSection(sectionId);

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `#${sectionId}`);
    }
  };

  const handleLanguageChange = (code) => {
    setLanguage(getLanguageByCode(code));
  };

  const navLinks = [
    { name: t('landingNav.home'), id: 'home' },
    { name: t('landingNav.about'), id: 'about' },
    { name: t('landingNav.resources'), id: 'resources' },
    { name: t('landingNav.blog'), id: 'blog' },
    { name: t('landingNav.contact'), id: 'contact' },
    { name: t('landingNav.plans'), id: 'plans' }
  ];

  return (
    <div className="min-h-screen flex flex-col w-full bg-transparent overflow-x-hidden font-['Poppins'] text-[#4B1E5A]">
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'h-[72px] bg-white/85 backdrop-blur-lg border-b border-pink-100/50 shadow-[0_2px_15px_rgba(233,30,99,0.05)]' : 'h-24 bg-transparent'
          }`}
      >
        <div className="w-full max-w-[1440px] mx-auto h-full flex items-center justify-between px-4 sm:px-8 lg:px-12">
          {/* Logo with clean margin on the right */}
          <Link to="/" onClick={(e) => handleNavClick(e, 'home')} className="flex items-center group shrink-0 relative mr-4 lg:mr-8 xl:mr-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 flex items-center justify-center overflow-hidden transition-all duration-500">
              <img
                src="/Images/WhatsApp Image 2026-05-04 at 6.32.54 PM.jpeg"
                alt="HealthSakhi Logo"
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
              />
            </div>
          </Link>

          {/* Navigation Tabs - Centered Horizontally with balanced distance */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-9 justify-center">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="text-base font-bold text-[#4B1E5A] hover:text-[#E91E63] transition-colors relative group py-2 tracking-wide whitespace-nowrap"
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#E91E63] transition-all duration-300 origin-left ${activeSection === link.id ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'}`}></span>
              </a>
            ))}
          </div>

          {/* Right Side - Language Toggle & Get Started Button with clear distance from tabs */}
          <div className="flex items-center gap-4 sm:gap-7 justify-end shrink-0 ml-4 lg:ml-8 xl:ml-12">
            {/* Language Toggle (Visible on both Mobile and Desktop) */}
            <div className="flex items-center bg-rose-50/80 p-0.5 sm:p-1 rounded-full border border-pink-100/50 shadow-sm relative shrink-0">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`relative px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black transition-all duration-300 z-10 ${
                  langCode === 'en' ? 'text-white' : 'text-[#4B1E5A] hover:text-[#E91E63]'
                }`}
              >
                {langCode === 'en' && (
                  <motion.span
                    layoutId="activeLangIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] rounded-full -z-10 shadow-[0_2px_8px_rgba(233,30,99,0.2)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="hidden sm:inline">English</span>
                <span className="inline sm:hidden">EN</span>
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('hi')}
                className={`relative px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black transition-all duration-300 z-10 ${
                  langCode === 'hi' ? 'text-white' : 'text-[#4B1E5A] hover:text-[#E91E63]'
                }`}
              >
                {langCode === 'hi' && (
                  <motion.span
                    layoutId="activeLangIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] rounded-full -z-10 shadow-[0_2px_8px_rgba(233,30,99,0.2)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="hidden sm:inline">हिन्दी</span>
                <span className="inline sm:hidden">HI</span>
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('mr')}
                className={`relative px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black transition-all duration-300 z-10 ${
                  langCode === 'mr' ? 'text-white' : 'text-[#4B1E5A] hover:text-[#E91E63]'
                }`}
              >
                {langCode === 'mr' && (
                  <motion.span
                    layoutId="activeLangIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] rounded-full -z-10 shadow-[0_2px_8px_rgba(233,30,99,0.2)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="hidden sm:inline">मराठी</span>
                <span className="inline sm:hidden">MR</span>
              </button>
            </div>

            <Link
              to="/login"
              onClick={() => localStorage.removeItem('hs_member_plan')}
              className="hidden md:flex items-center justify-center px-7 py-3 rounded-full bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] text-white text-sm font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(233,30,99,0.2)] hover:shadow-[0_6px_20px_rgba(233,30,99,0.3)] hover:scale-105 transition-all duration-300 shrink-0"
            >
              {t('landingNav.getStarted')}
            </Link>

            {/* Mobile/Tablet Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#4B1E5A] hover:opacity-70 transition-opacity ml-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Responsive Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-16 sm:top-20 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-xl lg:hidden"
            >
              <div className="w-full px-4 sm:px-[5%] lg:px-[8%] py-4 sm:py-6 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.id}
                    to={`/#${link.id}`}
                    onClick={(e) => handleNavClick(e, link.sectionId || link.id)}
                    className="block px-4 py-3 sm:py-4 bg-gradient-to-r from-[#E91E63]/5 to-[#FF5E9B]/5 border border-pink-100/30 rounded-xl text-sm sm:text-base font-medium text-[#4B1E5A] hover:bg-rose-50 transition-all active:scale-95"
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile login button */}
                <Link
                  to="/login"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    localStorage.removeItem('hs_member_plan');
                  }}
                  className="block px-4 py-3 sm:py-4 bg-gradient-to-r from-[#E91E63] to-[#FF5E9B] rounded-xl text-sm sm:text-base font-bold text-white text-center hover:opacity-90 transition-all active:scale-95 shadow-md"
                >
                  {t('landingNav.login')}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <Outlet />
      </main>

    </div>
  );
};

export default LandingLayout;


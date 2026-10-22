import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const Footer = ({ data = {} }) => {
  const { t, langCode } = useLanguage();
  const extra = data.extraJson || {};

  const copyrightText = t('footer.copyright', '© 2026 HEALTHSAKHI WELLNESS. ALL RIGHTS RESERVED.');
  const footerLinks = extra.links || [
    { name: 'Privacy', path: '/privacy' },
    { name: 'Terms', path: '/terms' },
    { name: 'Contact', path: '#contact' }
  ];

  return (
    <footer className="relative w-full py-12 px-6 lg:px-10 overflow-hidden bg-white/50 backdrop-blur-md">
      <div className="w-full max-w-[1280px] mx-auto relative z-10">
        <div className="w-full h-[1px] bg-[#4B1E5A] opacity-10 rounded-full mb-10"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-[#4B1E5A] font-black text-xs">
            <a href="mailto:myhealthsakhi@gmail.com" className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#E91E63]/10 flex items-center justify-center text-[#E91E63]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <span>myhealthsakhifamily@gmail.com</span>
            </a>
            <div className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#E91E63]/10 flex items-center justify-center text-[#E91E63]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </div>
              <span>+91 800-123-4567</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {footerLinks.map(link => {
              const label = link.path.toLowerCase().includes('privacy') ? t('landingNav.privacy', 'Privacy') : link.path.toLowerCase().includes('terms') ? t('landingNav.terms', 'Terms') : t('landingNav.contact', 'Contact');
              if (link.path.startsWith('#')) {
                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      const targetId = link.path.substring(1);
                      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-[#E91E63] transition-all"
                  >
                    {label}
                  </button>
                );
              }
              return (
                <Link key={link.name} to={link.path} className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-[#E91E63] transition-all">
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[9px] font-black text-[#4B1E5A] opacity-30 uppercase tracking-[0.3em]">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

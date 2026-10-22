import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { languageMap } from '../../data/languages';
import { useWellnessStore } from '../../store/wellnessStore';

const LanguagePicker = ({ compact = false, className = '' }) => {
  const language = useWellnessStore((s) => s.language);
  const setLanguage = useWellnessStore((s) => s.setLanguage);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-xl border transition-all hover:bg-rose-50/80 ${
          compact ? 'px-2 py-1.5 text-[10px]' : 'px-3 py-2 text-[11px]'
        }`}
        style={{ borderColor: '#F5E6EA', color: '#15192c' }}
        aria-label="Change language"
      >
        <Globe size={compact ? 14 : 16} className="text-[#ff69b4] shrink-0" />
        <span className="font-black uppercase tracking-wider max-w-[4rem] truncate">
          {language?.native || 'EN'}
        </span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-44 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-2xl border z-[300] py-2"
          style={{ borderColor: '#F5E6EA' }}
        >
          {languageMap.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors hover:bg-rose-50 ${
                language?.code === lang.code ? 'text-[#ff69b4] bg-rose-50/50' : 'text-[#15192c]'
              }`}
            >
              <span className="block">{lang.native}</span>
              <span className="text-[10px] font-medium text-[#C4A0AC]">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguagePicker;

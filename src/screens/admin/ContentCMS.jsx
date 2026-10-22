import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, MoreVertical, BookOpen, Share2, Eye, Edit3, Trash2, X, UploadCloud, CheckCircle, Clock, Tag, FileText, ChevronDown, Rocket, Ghost, Star, Globe, ListOrdered, Zap, ClipboardList, RefreshCw, FileCode, HelpCircle, Home } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import contentAssetApi from '../../api/contentAssetApi';
import faqApi from '../../api/faqApi';
import blogApi from '../../api/blogApi';
import BookCMS, { ReaderInsights } from './BookCMS';
import JSZip from 'jszip';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi (हिन्दी)',
  'Marathi (मराठी)',
  'Gujarati (ગુજરાતી)',
  'Bengali (বাংলা)',
  'Tamil (தமிழ்)',
  'Telugu (తెలుగు)',
  'Kannada (ಕನ್ನಡ)',
  'Malayalam (മലയാളം)',
  'Punjabi (ਪੰਜਾਬੀ)',
  'Odia (ଓଡ଼ିਆ)',
  'Urdu (اردو)',
  'Sanskrit (संस्कृतम्)',
  'Spanish',
  'French',
  'German',
  'Arabic'
];

const LANG_CODE_MAP = {
  'English': 'en',
  'Hindi (हिन्दी)': 'hi',
  'Marathi (मराठी)': 'mr',
  'Gujarati (ગુજરાતી)': 'gu',
  'Bengali (বাংলা)': 'bn',
  'Tamil (தமிழ்)': 'ta',
  'Telugu (తెలుగు)': 'te',
  'Kannada (ಕನ್ನಡ)': 'kn',
  'Malayalam (മലയാളം)': 'ml',
  'Punjabi (ਪੰਜਾਬੀ)': 'pa',
  'Odia (ଓଡ଼ିਆ)': 'or',
  'Urdu (اردو)': 'ur',
  'Sanskrit (संस्कृतम्)': 'sa',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Arabic': 'ar'
};

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

// ── Sample Content Data ───────────────────────────────────────────────────────
const INITIAL_CONTENT = [
  { id: 3, title: 'Inner Healing Guide', type: 'Book', cat: 'Mental Health', status: 'Published', date: '1 week ago', desc: 'Reflective practices and meditations for inner peace and mental clarity.', mediaUrl: null },
  { id: 4, title: 'Decoding Hunger', type: 'Book', cat: 'Food & Lifestyle', status: 'Published', date: '10 days ago', desc: 'Understanding biological vs emotional hunger signals.', mediaUrl: null },
];

// ── Color Mappings ───────────────────────────────────────────────────────────
const CAT_COLORS = {
  'Women Health': 'bg-purple-50 text-purple-600 border-purple-100',
  'Mental Healing': 'bg-blue-50 text-blue-600 border-blue-100',
  'Heart Care': 'bg-rose-50 text-rose-600 border-rose-100',
  'Relationships': 'bg-rose-50 text-rose-600 border-rose-100',
  'Cravings': 'bg-amber-50 text-amber-600 border-amber-100',
  'Food & Lifestyle': 'bg-amber-50 text-amber-600 border-amber-100',
  'Default': 'bg-slate-50 text-slate-600 border-slate-100'
};

const TYPE_COLORS = {
  'Book': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'Default': 'bg-slate-50 text-slate-600 border-slate-100'
};

// ── Premium Form Dropdown ─────────────────────────────────────────────────────
const FormDropdown = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-2" ref={dropdownRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 flex items-center justify-between bg-slate-50 border rounded-xl transition-all font-bold text-sm ${isOpen ? 'border-[#15192c] ring-2 ring-indigo-900/5' : 'border-black/5 hover:border-slate-200'}`}
      >
        <span className="text-slate-700 truncate">{value}</span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-[74px] left-0 w-full bg-white border border-black/5 rounded-xl shadow-xl z-50 p-1.5 animate-in slide-in-from-top-2 duration-200 overflow-hidden max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all truncate ${value === opt ? 'bg-[#15192c] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Custom Filter Dropdown Component ──────────────────────────────────────────
const StyledDropdown = ({ label, value, options, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={`h-10 px-4 rounded-2xl border transition-all flex items-center gap-3 font-black text-[9px] uppercase tracking-widest min-w-[150px] justify-between ${isOpen ? 'bg-white border-[#15192c] ring-4 ring-indigo-900/5' : 'bg-white border-black/5 hover:border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isOpen ? 'bg-[#15192c] text-white' : 'bg-slate-50 text-slate-400'}`}><Icon size={14} /></div>
          <span className={isOpen ? 'text-[#15192c]' : 'text-slate-500'}>{value}</span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-300 text-slate-300 ${isOpen ? 'rotate-180 text-[#15192c]' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-16 left-0 w-full min-w-[180px] bg-white rounded-2xl shadow-2xl border border-black/5 p-2 z-30 animate-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
          <p className="px-4 py-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all truncate ${value === opt ? 'bg-indigo-50 text-[#15192c]' : 'text-slate-500 hover:bg-slate-50'}`}>{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Multi Language Resolution Helpers ─────────────────────────────────────────
const normalizeKey = (str) => {
  if (!str) return '';
  const slug = str.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '');
  return slug || 'book-asset';
};

const getLangCode = (langStr) => {
  if (!langStr) return 'en';
  if (LANG_CODE_MAP[langStr]) return LANG_CODE_MAP[langStr];
  const str = langStr.toLowerCase();
  if (str.includes('marathi') || str.includes('मराठी') || str === 'mr') return 'mr';
  if (str.includes('hindi') || str.includes('हिन्दी') || str === 'hi') return 'hi';
  if (str.includes('gujarati') || str.includes('ગુજરાતી') || str === 'gu') return 'gu';
  if (str.includes('bengali') || str.includes('বাংলা') || str === 'bn') return 'bn';
  if (str.includes('tamil') || str.includes('தமிழ்') || str === 'ta') return 'ta';
  if (str.includes('telugu') || str.includes('తెలుగు') || str === 'te') return 'te';
  if (str.includes('kannada') || str.includes('ಕನ್ನಡ') || str === 'kn') return 'kn';
  if (str.includes('malayalam') || str.includes('മലയാളം') || str === 'ml') return 'ml';
  if (str.includes('punjabi') || str.includes('ਪੰਜਾਬੀ') || str === 'pa') return 'pa';
  if (str.includes('spanish') || str === 'es') return 'es';
  if (str.includes('french') || str === 'fr') return 'fr';
  if (str.includes('german') || str === 'de') return 'de';
  if (str.includes('arabic') || str === 'ar') return 'ar';
  return 'en';
};

const getBookLanguages = (item, allContent = []) => {
  if (!item) return ['English'];
  
  const itemKey = item.groupKey || normalizeKey(item.title);

  // Find all assets in allContent that belong to the same group or title
  const matchingAssets = allContent.filter(c => {
    if (!c) return false;
    const cKey = c.groupKey || normalizeKey(c.title);
    return (
      (cKey && itemKey && cKey === itemKey) ||
      (c.title && item.title && c.title.trim().toLowerCase() === item.title.trim().toLowerCase())
    );
  });

  const langSet = new Set();

  const addLang = (val) => {
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach(l => l && typeof l === 'string' && langSet.add(l.trim()));
    } else if (typeof val === 'string') {
      val.split(',').forEach(l => {
        const trimmed = l.trim();
        if (trimmed) langSet.add(trimmed);
      });
    }
  };

  matchingAssets.forEach(asset => {
    addLang(asset.language);
    if (asset.languages) addLang(asset.languages);
  });

  addLang(item.language);
  if (item.languages) addLang(item.languages);

  const result = Array.from(langSet);
  return result.length > 0 ? result : [item.language || 'English'];
};

const getItemDisplayTitle = (item, allContent = [], langCode = 'en') => {
  if (!item || !item.title) return '';
  const itemKey = item.groupKey || normalizeKey(item.title);
  
  const matchingVariant = allContent.find(c => {
    if (!c || c.type !== item.type) return false;
    const cKey = c.groupKey || normalizeKey(c.title);
    const isGroupMatch = (cKey && itemKey && cKey === itemKey) || (c.title && item.title && c.title.trim().toLowerCase() === item.title.trim().toLowerCase());
    const isLangMatch = (c.languageCode && langCode && c.languageCode.toLowerCase() === langCode.toLowerCase()) || (c.language && c.language.toLowerCase().includes(langCode.toLowerCase()));
    return isGroupMatch && isLangMatch;
  });

  if (matchingVariant && matchingVariant.title) {
    return matchingVariant.title;
  }
  return item.title;
};

// ── Multi-Language Dropdown / Selector Component ─────────────────────────────
const MultiLanguageDropdown = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLangs = typeof value === 'string'
    ? value.split(',').map(s => s.trim()).filter(Boolean)
    : (Array.isArray(value) ? value : ['English']);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = (lang) => {
    let updated;
    if (selectedLangs.includes(lang)) {
      if (selectedLangs.length === 1) return; // Keep at least one language
      updated = selectedLangs.filter(l => l !== lang);
    } else {
      updated = [...selectedLangs, lang];
    }
    onChange(updated.join(', '));
  };

  return (
    <div className="relative space-y-2 col-span-2 sm:col-span-1" ref={dropdownRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>

      {/* Selected Language Badges */}
      <div className="flex flex-wrap gap-1.5 mb-1">
        {selectedLangs.map((lang) => (
          <span
            key={lang}
            className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#15192c] text-white flex items-center gap-1.5 shadow-sm"
          >
            <Globe size={11} />
            {lang}
            {selectedLangs.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleLanguage(lang); }}
                className="hover:text-red-300 ml-0.5 text-xs font-bold"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 flex items-center justify-between bg-slate-50 border rounded-xl transition-all font-bold text-sm ${isOpen ? 'border-[#15192c] ring-2 ring-indigo-900/5' : 'border-black/5 hover:border-slate-200'}`}
      >
        <span className="text-slate-600 text-xs font-semibold truncate">
          + Add / Change Languages
        </span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[88px] left-0 w-full bg-white border border-black/5 rounded-xl shadow-xl z-50 p-1.5 animate-in slide-in-from-top-2 duration-200 overflow-hidden max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = selectedLangs.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleLanguage(opt)}
                className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold transition-all truncate flex items-center justify-between ${isSelected ? 'bg-indigo-50 text-[#15192c]' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>{opt}</span>
                {isSelected && <span className="text-indigo-600 font-extrabold text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Reusable Modal Shell (Premium) ─────────────────────────────────────────────
const CMSModal = ({ open, onClose, title, icon: Icon, iconBg, maxWidth = 'sm:max-w-2xl', children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <style>{`
          .custom-cms-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-cms-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-cms-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
      `}</style>
      <div className={`bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full ${maxWidth} shadow-2xl border border-black/5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 max-h-[92vh] flex flex-col overflow-hidden relative`}>
        <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${iconBg} text-white transition-transform hover:scale-110`}><Icon size={24} /></div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none">{title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all active:scale-90"><X size={24} /></button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1 custom-cms-scrollbar pr-[14px]">{children}</div>
      </div>
    </div>
  );
};

import { useLanguage } from '../../context/LanguageContext';

// Resolve relative /uploads/... URLs to full backend URL
const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:5000';

const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;  // already absolute
  return `${BACKEND_BASE}${url}`;           // e.g. /uploads/xyz.mp4 → http://localhost:5000/uploads/xyz.mp4
};

const parseDocxToPagesForAdmin = async (fileUrl) => {
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXmlFile = zip.file("word/document.xml");
    if (!docXmlFile) return null;
    const xmlText = await docXmlFile.async("text");

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const rawPages = [];
    let currentPageHtml = '';

    const paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p'));
    paragraphs.forEach((p) => {
      let pContentHtml = '';
      let plainText = '';

      const children = Array.from(p.childNodes);
      children.forEach((child) => {
        if (child.nodeName === 'w:r') {
          const rPr = child.getElementsByTagName('w:rPr')[0];
          let isBold = rPr && rPr.getElementsByTagName('w:b').length > 0;
          let isItalic = rPr && rPr.getElementsByTagName('w:i').length > 0;
          const tEls = child.getElementsByTagName('w:t');
          let runText = '';
          for (let t of Array.from(tEls)) runText += t.textContent;

          if (runText) {
            plainText += runText;
            let styleStr = '';
            if (isBold) styleStr += 'font-weight: bold;';
            if (isItalic) styleStr += 'font-style: italic;';
            pContentHtml += `<span style="${styleStr}">${runText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
          }
        }
      });

      let breakAfter = false;
      const brs = Array.from(p.getElementsByTagName('w:br'));
      for (let b of brs) {
        if (b.getAttribute('w:type') === 'page') breakAfter = true;
      }
      if (p.getElementsByTagName('w:lastRenderedPageBreak').length > 0) breakAfter = true;

      if (pContentHtml.trim()) {
        currentPageHtml += `<p style="margin-bottom: 0.75rem; line-height: 1.8; color: #334155;">${pContentHtml}</p>`;
      }

      if (breakAfter && currentPageHtml.trim()) {
        rawPages.push(currentPageHtml);
        currentPageHtml = '';
      }
    });

    if (currentPageHtml.trim()) {
      rawPages.push(currentPageHtml);
    }

    return rawPages.length > 0 ? rawPages : null;
  } catch (err) {
    console.error('Failed to parse docx for admin preview:', err);
    return null;
  }
};

const AdminBookPreview = ({ item, allContent = [] }) => {
  const targetKey = item?.groupKey || (item?.title ? normalizeKey(item.title) : '');
  const variants = useMemo(() => {
    if (!item) return [];
    return allContent.filter(c => {
      const cKey = c.groupKey || normalizeKey(c.title);
      return (cKey && targetKey && cKey === targetKey) || (c.title && item.title && c.title.trim().toLowerCase() === item.title.trim().toLowerCase());
    });
  }, [allContent, item, targetKey]);

  const [activeVariantId, setActiveVariantId] = useState(item?.id || (variants[0] ? variants[0].id : null));

  useEffect(() => {
    if (item?.id) {
      setActiveVariantId(item.id);
    }
  }, [item?.id]);

  const activeVariant = variants.find(v => v.id === activeVariantId) || item || variants[0];
  const rawUrl = activeVariant?.mediaUrl || item?.mediaUrl;
  const url = rawUrl ? getMediaUrl(rawUrl) : null;
  const title = activeVariant?.title || item?.title;

  const [docPages, setDocPages] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [numPdfPages, setNumPdfPages] = useState(null);

  const isDoc = url && (url.toLowerCase().includes('.doc') || url.toLowerCase().includes('.docx'));

  useEffect(() => {
    if (!url || !isDoc) return;
    let isCancelled = false;
    setLoadingDoc(true);
    parseDocxToPagesForAdmin(url).then(pages => {
      if (!isCancelled) {
        setDocPages(pages || []);
        setPageIndex(0);
        setLoadingDoc(false);
      }
    });
    return () => { isCancelled = true; };
  }, [url, isDoc]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPdfPages(numPages);
    setPageIndex(0);
  }

  const totalPages = isDoc ? (docPages ? docPages.length : 0) : (numPdfPages || 0);

  const turnNext = () => {
    if (pageIndex + 2 < totalPages) {
      setPageIndex(prev => prev + 2);
    }
  };

  const turnPrev = () => {
    if (pageIndex > 0) {
      setPageIndex(prev => Math.max(0, prev - 2));
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none space-y-4">
      {/* Language Switcher Tabs */}
      {variants.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner w-full justify-start overflow-x-auto">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 shrink-0">Available Languages:</span>
          {variants.map((v) => {
            const isSelected = v.id === activeVariantId;
            const langName = v.language || 'English';
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => { setActiveVariantId(v.id); setPageIndex(0); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-[#15192c] text-white shadow-md scale-105'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
                }`}
              >
                <Globe size={13} className={isSelected ? 'text-emerald-400' : 'text-slate-400'} />
                <span>{langName}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white rounded-2xl w-full">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-400" />
          <span className="text-xs font-black uppercase tracking-wider">{title || 'Interactive Book Viewer'}</span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Page {pageIndex + 1} - {Math.min(pageIndex + 2, totalPages)} of {totalPages}
        </div>
      </div>

      {isDoc ? (
        loadingDoc ? (
          <div className="flex flex-col items-center justify-center p-16 bg-slate-50 rounded-[2.5rem] border border-slate-200 gap-3 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Opening Book Reader Preview...</p>
          </div>
        ) : (
          <div className="relative w-full bg-slate-100 p-4 sm:p-6 rounded-[2.5rem] border border-slate-200/80 shadow-inner flex items-center justify-center min-h-[460px]">
            <button
              type="button"
              onClick={turnPrev}
              disabled={pageIndex === 0}
              className="absolute left-2 sm:left-4 z-20 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-200 font-bold text-lg"
            >
              ‹
            </button>

            <div className="grid grid-cols-2 gap-0 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 min-h-[440px] relative">
              <div className="p-6 sm:p-8 border-r border-slate-200/80 bg-white flex flex-col justify-between overflow-y-auto max-h-[480px] text-left">
                <div>
                  <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Page {pageIndex + 1}</div>
                  <div dangerouslySetInnerHTML={{ __html: docPages && docPages[pageIndex] ? docPages[pageIndex] : '<p class="text-slate-400 text-xs italic">End of Book</p>' }} />
                </div>
              </div>

              <div className="absolute left-1/2 top-0 bottom-0 w-6 -ml-3 bg-gradient-to-r from-black/5 via-black/15 to-black/5 z-10 pointer-events-none" />

              <div className="p-6 sm:p-8 bg-white flex flex-col justify-between overflow-y-auto max-h-[480px] text-left">
                <div>
                  <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Page {pageIndex + 2}</div>
                  <div dangerouslySetInnerHTML={{ __html: docPages && docPages[pageIndex + 1] ? docPages[pageIndex + 1] : '<p class="text-slate-400 text-xs italic">End of Book</p>' }} />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={turnNext}
              disabled={pageIndex + 2 >= totalPages}
              className="absolute right-2 sm:right-4 z-20 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-200 font-bold text-lg"
            >
              ›
            </button>
          </div>
        )
      ) : (
        <div className="relative w-full bg-slate-100 p-4 sm:p-6 rounded-[2.5rem] border border-slate-200/80 shadow-inner flex items-center justify-center min-h-[460px]">
          <button
            type="button"
            onClick={turnPrev}
            disabled={pageIndex === 0}
            className="absolute left-2 sm:left-4 z-20 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-200 font-bold text-lg"
          >
            ‹
          </button>

          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center p-12 text-indigo-400 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Book PDF...</p>
              </div>
            }
            className="flex w-full justify-center"
          >
            <div className="grid grid-cols-2 gap-0 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 relative">
              <div className="p-4 border-r border-slate-200/80 flex justify-center items-center bg-white">
                <Page pageNumber={pageIndex + 1} width={360} renderTextLayer={false} renderAnnotationLayer={false} />
              </div>

              <div className="absolute left-1/2 top-0 bottom-0 w-6 -ml-3 bg-gradient-to-r from-black/5 via-black/15 to-black/5 z-10 pointer-events-none" />

              <div className="p-4 flex justify-center items-center bg-white">
                {pageIndex + 2 <= (numPdfPages || 0) ? (
                  <Page pageNumber={pageIndex + 2} width={360} renderTextLayer={false} renderAnnotationLayer={false} />
                ) : (
                  <div className="w-[360px] h-[480px] flex items-center justify-center bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">End of Book</div>
                )}
              </div>
            </div>
          </Document>

          <button
            type="button"
            onClick={turnNext}
            disabled={pageIndex + 2 >= (numPdfPages || 0)}
            className="absolute right-2 sm:right-4 z-20 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-200 font-bold text-lg"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

const mapItem = (item) => ({
  id: item.id,
  title: item.title,
  type: item.type,
  cat: item.category,
  language: item.language || 'English',
  languageCode: item.languageCode || 'en',
  status: item.status,
  date: new Date(item.updatedAt || item.createdAt).toLocaleDateString(),
  desc: item.description,
  mediaUrl: getMediaUrl(item.mediaUrl)
});

const ContentCMS = () => {
  const { t, langCode } = useLanguage();
  const [content, setContent] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    return new URLSearchParams(window.location.search).get('tab') || 'media';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [ratingBook, setRatingBook] = useState(null); // Book item whose ratings to show
  const [bookFeedbackList, setBookFeedbackList] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // ── Blog Management States ──
  const [blogsList, setBlogsList] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [blogFeedbackList, setBlogFeedbackList] = useState([]);
  const [loadingBlogFeedbacks, setLoadingBlogFeedbacks] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [viewBlogFeedback, setViewBlogFeedback] = useState(null);

  const loadBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const res = await blogApi.getAdminBlogs();
      if (res && res.success && res.data) {
        setBlogsList(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin blogs:', err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const fetchBlogFeedbacks = async () => {
    if (!viewBlogFeedback) return;
    try {
      setLoadingBlogFeedbacks(true);
      const res = await blogApi.getBlogFeedbacks(viewBlogFeedback.id);
      if (res && res.success && res.data) {
        setBlogFeedbackList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch blog feedbacks:', err);
    } finally {
      setLoadingBlogFeedbacks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'blogs') {
      loadBlogs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (viewBlogFeedback) {
      fetchBlogFeedbacks();
    } else {
      setBlogFeedbackList([]);
    }
  }, [viewBlogFeedback]);

  const handleDeleteBlogFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await blogApi.deleteBlogFeedback(feedbackId);
        fetchBlogFeedbacks();
        loadBlogs();
      } catch (err) {
        console.error('Failed to delete blog feedback:', err);
        alert('Failed to delete feedback: ' + (err.response?.data?.error || err.message));
      }
    }
  };
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    category: 'Wellness',
    tag: 'Wellness',
    author: 'Dr. Pratap',
    desc: '',
    content: '',
    img: '',
    pdfUrl: '',
    date: 'April 2026'
  });
  const [isUploadingBlogImage, setIsUploadingBlogImage] = useState(false);
  const [isUploadingBlogPdf, setIsUploadingBlogPdf] = useState(false);

  const blogImageInputRef = useRef(null);
  const blogPdfInputRef = useRef(null);

  // ── FAQ Management States & Effects ──
  const [faqsList, setFaqsList] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editFaq, setEditFaq] = useState(null);
  const [deleteFaqId, setDeleteFaqId] = useState(null);
  const [faqCategories, setFaqCategories] = useState(() => {
    const saved = localStorage.getItem('hs_faq_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return ['Account', 'Health Tracking', 'Consultation', 'Payments', 'Privacy', 'Technical Support'];
  });
  const [showAddFaqCat, setShowAddFaqCat] = useState(false);
  const [newFaqCatName, setNewFaqCatName] = useState('');

  const handleAddFaqCategory = () => {
    if (!newFaqCatName.trim()) return;
    const cat = newFaqCatName.trim();
    if (!faqCategories.includes(cat)) {
      const updated = [...faqCategories, cat];
      setFaqCategories(updated);
      localStorage.setItem('hs_faq_categories', JSON.stringify(updated));
    }
    setFaqFormData(prev => ({ ...prev, category: cat }));
    setNewFaqCatName('');
    setShowAddFaqCat(false);
  };

  const handleDeleteFaqCategory = (catToDelete) => {
    if (faqCategories.length <= 1) {
      alert('At least one category must remain.');
      return;
    }
    const updated = faqCategories.filter(c => c !== catToDelete);
    setFaqCategories(updated);
    localStorage.setItem('hs_faq_categories', JSON.stringify(updated));
    if (faqFormData.category === catToDelete) {
      setFaqFormData(prev => ({ ...prev, category: updated[0] || '' }));
    }
  };
  const [faqFormData, setFaqFormData] = useState({
    question: '',
    answer: '',
    category: faqCategories && faqCategories.length > 0 ? faqCategories[0] : 'Account',
    displayOrder: 0,
    status: 'Published',
    isPopular: false
  });
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('All');

  const loadFaqs = async () => {
    try {
      setLoadingFaqs(true);
      const params = {};
      if (faqCategoryFilter !== 'All') params.category = faqCategoryFilter;
      if (faqSearchQuery) params.search = faqSearchQuery;
      const res = await faqApi.getAdminFaqs(params);
      if (res && res.success && res.data) {
        setFaqsList(res.data);
      }
    } catch (err) {
      console.error('Failed to load FAQs in CMS:', err);
    } finally {
      setLoadingFaqs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'faq') {
      loadFaqs();
    }
  }, [activeTab, faqCategoryFilter, faqSearchQuery]);

  const handleOpenFaqModal = (faq = null) => {
    if (faq) {
      setEditFaq(faq);
      setFaqFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        displayOrder: faq.displayOrder,
        status: faq.status,
        isPopular: faq.isPopular
      });
    } else {
      setEditFaq(null);
      setFaqFormData({
        question: '',
        answer: '',
        category: faqCategories[0] || 'Account',
        displayOrder: faqsList.length + 1,
        status: 'Published',
        isPopular: false
      });
    }
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqFormData.question.trim() || !faqFormData.answer.trim()) return;

    try {
      if (editFaq) {
        const res = await faqApi.updateFaq(editFaq.id, faqFormData);
        if (res && res.success) {
          setIsFaqModalOpen(false);
          loadFaqs();
          alert('FAQ updated successfully! 🌸');
        }
      } else {
        const res = await faqApi.createFaq(faqFormData);
        if (res && res.success) {
          setIsFaqModalOpen(false);
          loadFaqs();
          alert('FAQ created successfully! 🌸');
        }
      }
    } catch (err) {
      console.error('Failed to save FAQ:', err);
      alert('Failed to save FAQ: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteFaq = async () => {
    if (!deleteFaqId) return;
    try {
      const res = await faqApi.deleteFaq(deleteFaqId);
      if (res && res.success) {
        setDeleteFaqId(null);
        loadFaqs();
        alert('FAQ deleted successfully! 🗑️');
      }
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
      alert('Failed to delete FAQ: ' + (err.response?.data?.error || err.message));
    }
  };

  const DEFAULT_FAQ_CATEGORIES = ['Account', 'Health Tracking', 'Consultation', 'Payments', 'Privacy', 'Technical Support'];

  const DEFAULT_BLOG_CATEGORIES = ['Wellness', 'Health', 'Ayurvedic', 'Parenting', 'Relationships', 'Stress', 'Women Health'];

  const [blogCategories, setBlogCategories] = useState(() => {
    const saved = localStorage.getItem('hs_blog_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_BLOG_CATEGORIES;
  });

  const [showAddBlogCat, setShowAddBlogCat] = useState(false);
  const [newBlogCatName, setNewBlogCatName] = useState('');

  const handleAddBlogCategory = () => {
    if (!newBlogCatName.trim()) return;
    const cat = newBlogCatName.trim();
    if (!blogCategories.includes(cat)) {
      const updated = [...blogCategories, cat];
      setBlogCategories(updated);
      localStorage.setItem('hs_blog_categories', JSON.stringify(updated));
    }
    setBlogFormData(prev => ({ ...prev, category: cat, tag: cat }));
    setNewBlogCatName('');
    setShowAddBlogCat(false);
  };

  const handleDeleteBlogCategory = (catToDelete) => {
    if (blogCategories.length <= 1) {
      alert('At least one category must remain.');
      return;
    }
    const updated = blogCategories.filter(c => c !== catToDelete);
    setBlogCategories(updated);
    localStorage.setItem('hs_blog_categories', JSON.stringify(updated));
    if (blogFormData.category === catToDelete) {
      setBlogFormData(prev => ({ ...prev, category: updated[0], tag: updated[0] }));
    }
  };

  const handleBlogImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBlogImage(true);
      const res = await contentAssetApi.uploadMediaFile(file);
      if (res && (res.imageUrl || res.url)) {
        setBlogFormData(prev => ({ ...prev, img: res.imageUrl || res.url }));
      }
    } catch (err) {
      console.error('Uploading cover image to ImageKit failed:', err);
      alert('Failed to upload cover image. Please try again.');
    } finally {
      setIsUploadingBlogImage(false);
    }
  };

  const handleBlogPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBlogPdf(true);
      const res = await contentAssetApi.uploadMediaFile(file);
      const uploadedUrl = res?.imageUrl || res?.url || '';
      if (uploadedUrl) {
        setBlogFormData(prev => ({
          ...prev,
          pdfUrl: uploadedUrl,
          content: prev.content || `Article Content extracted from uploaded PDF document (${file.name}):\n\nThis article is attached as an interactive PDF document. Visitors can read the complete PDF, zoom, and download it inside the reader modal.`
        }));
      }
    } catch (err) {
      console.error('Uploading PDF document to ImageKit failed:', err);
      alert('Failed to upload PDF document. Please try again.');
    } finally {
      setIsUploadingBlogPdf(false);
    }
  };

  useEffect(() => {
    if (!ratingBook) {
      setBookFeedbackList([]);
      return;
    }
    const fetchFeedbacks = async () => {
      setLoadingFeedbacks(true);
      try {
        const res = await contentAssetApi.getBookFeedbacks(ratingBook.id);
        if (res && res.success && res.data) {
          setBookFeedbackList(res.data);
        } else {
          // Fallback to local storage
          const allFeedback = JSON.parse(localStorage.getItem('hs_book_feedback') || '[]');
          const localFb = allFeedback.filter(f => f.bookId === ratingBook.id);
          setBookFeedbackList(localFb);
        }
      } catch (err) {
        console.warn('Failed to load feedbacks from DB, using localStorage fallback', err);
        const allFeedback = JSON.parse(localStorage.getItem('hs_book_feedback') || '[]');
        const localFb = allFeedback.filter(f => f.bookId === ratingBook.id);
        setBookFeedbackList(localFb);
      } finally {
        setLoadingFeedbacks(false);
      }
    };
    fetchFeedbacks();
  }, [ratingBook]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [activeLanguage, setActiveLanguage] = useState('All Languages');


  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState('');
  const [formData, setFormData] = useState({ title: '', type: 'Interactive Book', cat: 'Women Health', language: 'English', parentBookId: '', desc: '', status: 'Published' });

  // Custom Categories State & Sync
  const DEFAULT_CATEGORIES = ['Women Health', 'Heart Care', 'Mental Healing', 'Relationships', 'Cravings'];
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('hs_custom_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    localStorage.setItem('hs_custom_categories', JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  });
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (!customCategories.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      localStorage.setItem('hs_custom_categories', JSON.stringify(updated));
      setFormData(prev => ({ ...prev, cat: trimmed }));
    }
    setNewCatName('');
    setShowAddCat(false);
  };

  const handleDeleteCategory = (catToDelete) => {
    if (!window.confirm(`Are you sure you want to delete the category "${catToDelete}"?`)) {
      return;
    }
    const updated = customCategories.filter(c => c !== catToDelete);
    setCustomCategories(updated);
    localStorage.setItem('hs_custom_categories', JSON.stringify(updated));
    if (formData.cat === catToDelete) {
      setFormData(prev => ({ ...prev, cat: updated[0] || '' }));
    }
  };

  // Index / Chapters State & Handlers
  const [chaptersList, setChaptersList] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfExtractStatus, setPdfExtractStatus] = useState(null);

  const handleAddChapter = () => {
    setChaptersList(prev => [...prev, { id: 'ch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7), title: '', page: prev.length + 1 }]);
  };

  const handleUpdateChapter = (index, field, value) => {
    setChaptersList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveChapter = (index) => {
    setChaptersList(prev => prev.filter((_, i) => i !== index));
  };

  // Smart Helper: Parse chapter titles & page numbers from raw text
  const parseRawIndexText = (rawText) => {
    if (!rawText || !rawText.trim()) return [];

    let activePage = 1;
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed = [];

    for (let rawLine of lines) {
      // Check for page markers from PDF text scan e.g. "--- PAGE 5 ---"
      const pageHeaderMatch = rawLine.match(/---\s*PAGE\s*(\d+)\s*---/i);
      if (pageHeaderMatch) {
        activePage = parseInt(pageHeaderMatch[1], 10);
        continue;
      }

      if (/^(TABLE OF CONTENTS|CONTENTS|INDEX|BOOK SUMMARY|HOW TO BECOME CEO OF THE FAMILY)$/i.test(rawLine)) continue;

      let line = rawLine;
      let pageNum = null;

      // Extract explicit page numbers like "PG 12", "Page 12", "p. 12", "- 12" or trailing numbers
      const pageMatch = line.match(/(?:pg|page|p\.?)\s*(\d+)/i) || line.match(/[\s\-–—]+(\d+)\s*$/);
      if (pageMatch) {
        pageNum = parseInt(pageMatch[1], 10);
        line = line.replace(/(?:pg|page|p\.?)\s*\d+/i, '').replace(/[\s\-–—]+\d+\s*$/, '').trim();
      }

      // Clean up markdown headers, numbers, bullets (e.g. "1. ", "1)", "1 -", "PART 1 —", "### ")
      let cleanTitle = line
        .replace(/^[\*\•\-\#\>]+\s*/, '')
        .replace(/^\d+[\.\)\:]\s*/, '')
        .trim();

      if (cleanTitle && cleanTitle.length > 2) {
        parsed.push({
          id: 'ch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          title: cleanTitle,
          page: pageNum !== null ? pageNum : activePage
        });
        if (pageNum !== null) {
          activePage = pageNum;
        }
      }
    }

    return parsed;
  };

  // Option 1: Automatic PDF Bookmark / Outline Extractor & Text Page Scanner
  const handleExtractBookmarksFromPdf = async (targetFileOrUrl) => {
    let source = targetFileOrUrl;
    if (!source) {
      const payloadFile = Object.values(langPayloads).find(p => p && p.file)?.file;
      const payloadUrl = Object.values(langPayloads).find(p => p && p.mediaUrl)?.mediaUrl;
      source = selectedFile || payloadFile || payloadUrl;
    }
    if (!source) {
      setPdfExtractStatus({ type: 'error', msg: 'Please select or upload a PDF file first.' });
      return;
    }

    setIsExtractingPdf(true);
    setPdfExtractStatus({ type: 'info', msg: 'Analyzing PDF bookmarks & scanning index pages...' });

    try {
      let loadingTask;
      if (source instanceof File || source instanceof Blob) {
        const arrayBuffer = await source.arrayBuffer();
        loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      } else if (typeof source === 'string') {
        const fetchUrl = getMediaUrl(source) || source;
        const res = await fetch(fetchUrl);
        const arrayBuffer = await res.arrayBuffer();
        loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      } else {
        throw new Error("Invalid PDF source");
      }

      const pdfDoc = await loadingTask.promise;
      let extracted = [];

      // Stage 1: Try PDF embedded outline metadata
      try {
        const outline = await pdfDoc.getOutline();
        if (outline && outline.length > 0) {
          const processItems = async (items) => {
            for (const item of items) {
              if (item.title) {
                let pageNum = 1;
                try {
                  let dest = item.dest;
                  if (typeof dest === 'string') {
                    dest = await pdfDoc.getDestination(dest);
                  }
                  if (Array.isArray(dest) && dest[0]) {
                    const pageIndex = await pdfDoc.getPageIndex(dest[0]);
                    pageNum = pageIndex + 1;
                  }
                } catch (e) {
                  console.warn('Destination page lookup warning:', e);
                }
                extracted.push({
                  id: 'ch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
                  title: item.title.replace(/\s+/g, ' ').trim(),
                  page: pageNum
                });
              }
              if (item.items && item.items.length > 0) {
                await processItems(item.items);
              }
            }
          };
          await processItems(outline);
        }
      } catch (outlineErr) {
        console.warn('PDF outline read failed, falling back to page text scan:', outlineErr);
      }

      // Stage 2: If Stage 1 found no bookmarks, scan text of pages 1 to 15 automatically
      if (extracted.length === 0) {
        setPdfExtractStatus({ type: 'info', msg: 'Scanning PDF pages 1–15 for Table of Contents / Index text...' });
        const scanMaxPages = Math.min(pdfDoc.numPages, 15);
        let accumulatedText = '';

        for (let p = 1; p <= scanMaxPages; p++) {
          try {
            const page = await pdfDoc.getPage(p);
            const textContent = await page.getTextContent();
            const pageLines = textContent.items
              .map(item => item.str)
              .join(' ')
              .replace(/\s+/g, ' ');
            accumulatedText += `\n--- PAGE ${p} ---\n` + pageLines;
          } catch (pErr) {
            console.warn(`Error reading text from PDF page ${p}:`, pErr);
          }
        }

        if (accumulatedText.trim()) {
          const parsed = parseRawIndexText(accumulatedText);
          if (parsed && parsed.length > 0) {
            extracted = parsed;
          }
        }
      }

      if (extracted.length > 0) {
        setChaptersList(extracted);
        setPdfExtractStatus({
          type: 'success',
          msg: `🎉 Success! Auto-extracted ${extracted.length} chapter points from PDF!`
        });
      } else {
        setPdfExtractStatus({
          type: 'warning',
          msg: 'No index text detected automatically. Please click "📋 Bulk Paste Index" to paste chapter text!'
        });
      }
    } catch (err) {
      console.error('[ContentCMS] Bookmark extraction error:', err);
      setPdfExtractStatus({
        type: 'error',
        msg: 'Failed to read PDF file. You can use "📋 Bulk Paste Index" to paste chapter text.'
      });
    } finally {
      setIsExtractingPdf(false);
    }
  };

  // Option 2: Bulk Copy-Paste / Text Parser
  const handleParseBulkText = () => {
    if (!bulkText || !bulkText.trim()) {
      alert('Please paste some chapter index text first.');
      return;
    }

    const parsed = parseRawIndexText(bulkText);

    if (parsed.length > 0) {
      setChaptersList(parsed);
      setShowBulkModal(false);
      setBulkText('');
      setPdfExtractStatus({
        type: 'success',
        msg: `🎉 Parsed & imported ${parsed.length} chapter points successfully!`
      });
    } else {
      alert('Could not parse any valid chapters from the text. Please check the text format.');
    }
  };

  // Dedicated Language Payload State: { [langCode]: { id, file, cover, mediaUrl, coverUrl, title } }
  const [langPayloads, setLangPayloads] = useState({});

  const updateLangPayload = (code, field, value) => {
    setLangPayloads(prev => ({
      ...prev,
      [code]: {
        ...(prev[code] || {}),
        [field]: value
      }
    }));
  };

  const resetForm = () => {
    setFormData({ title: '', type: 'Interactive Book', cat: 'Women Health', language: 'English', parentBookId: '', desc: '', status: 'Published', accessLevel: 'Free' });
    setSelectedFile(null);
    setSelectedCover(null);
    setExistingCoverUrl('');
    setLangPayloads({});
    setChaptersList([]);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    let rawDesc = item.desc || item.description || '';
    let parsedChapters = [];
    let detectedAccessLevel = 'Free';

    if (rawDesc.includes('[hs_access]')) {
      const accParts = rawDesc.split('[hs_access]');
      rawDesc = accParts[0];
      const accStr = accParts[1] ? accParts[1].split('[')[0].trim() : 'Free';
      if (accStr.toLowerCase().includes('paid') || accStr.toLowerCase().includes('premium')) {
        detectedAccessLevel = 'Paid';
      }
    }

    if (rawDesc.includes('[hs_chapters]')) {
      const cParts = rawDesc.split('[hs_chapters]');
      rawDesc = cParts[0];
      try {
        const parsed = JSON.parse(cParts[1].trim());
        if (Array.isArray(parsed)) {
          parsedChapters = parsed.map((ch, idx) => ({
            ...ch,
            id: ch.id || 'ch-' + idx + '-' + Date.now() + '-' + Math.random()
          }));
        }
      } catch (e) {}
    }

    const parts = rawDesc.split('[hs_cover]');
    const cleanDesc = parts[0] ? parts[0].trim() : '';
    const coverUrl = parts[1] ? parts[1].trim() : '';

    setChaptersList(parsedChapters);

    const allGroupLangs = getBookLanguages(item, content);
    const langStr = allGroupLangs.join(', ');

    setFormData({
      title: item.title,
      cat: item.cat || item.category || 'Women Health',
      language: langStr,
      parentBookId: item.groupKey ? item.title : '',
      desc: cleanDesc,
      status: item.status || 'Published',
      type: item.type === 'Video' ? 'Video Module' : 'Interactive Book',
      accessLevel: detectedAccessLevel
    });

    // Populate existing variants for all languages sharing this groupKey
    const targetKey = item.groupKey || normalizeKey(item.title);
    const groupVariants = content.filter(c => {
      const cKey = c.groupKey || normalizeKey(c.title);
      return (cKey && targetKey && cKey === targetKey) || (c.title && item.title && c.title.trim().toLowerCase() === item.title.trim().toLowerCase());
    });

    const initialPayloads = {};
    groupVariants.forEach(variant => {
      const code = variant.languageCode || getLangCode(variant.language) || 'en';
      let vDesc = variant.description || variant.desc || '';
      if (vDesc.includes('[hs_chapters]')) {
        vDesc = vDesc.split('[hs_chapters]')[0];
      }
      const vParts = vDesc.split('[hs_cover]');
      const vCover = vParts[1] ? vParts[1].trim() : '';
      initialPayloads[code] = {
        id: variant.id,
        title: variant.title,
        mediaUrl: getMediaUrl(variant.mediaUrl),
        coverUrl: vCover,
        file: null,
        cover: null
      };
    });

    const currentCode = item.languageCode || getLangCode(item.language) || 'en';
    if (!initialPayloads[currentCode]) {
      initialPayloads[currentCode] = {
        id: item.id,
        title: item.title,
        mediaUrl: getMediaUrl(item.mediaUrl),
        coverUrl: coverUrl,
        file: null,
        cover: null
      };
    }

    setLangPayloads(initialPayloads);
  };

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await contentAssetApi.getAdminAssets();
      if (res && res.success && res.data) {
        setContent(res.data.map(item => ({
          ...item,
          cat: item.category,
          date: new Date(item.createdAt).toLocaleDateString(),
          language: item.language || 'English',
          groupKey: item.groupKey || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        })));
      }
    } catch (err) {
      console.error('Failed to load assets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const computedGroupKey = (formData.parentBookId && formData.parentBookId !== 'None' && formData.parentBookId !== 'Independent Book (Main)')
        ? normalizeKey(formData.parentBookId)
        : normalizeKey(formData.title);

      const selectedLangList = (formData.language || 'English').split(',').map(s => s.trim()).filter(Boolean);

      for (const langName of selectedLangList) {
        const code = getLangCode(langName);
        const langData = langPayloads[code] || {};

        let mediaUrl = langData.mediaUrl || (editItem && code === (editItem.languageCode || 'en') ? editItem.mediaUrl : null);
        if (langData.file) {
          const uploadRes = await contentAssetApi.uploadMediaFile(langData.file);
          if (uploadRes && uploadRes.success) {
            mediaUrl = uploadRes.url;
          }
        }

        let coverUrl = langData.coverUrl || null;
        if (langData.cover) {
          const coverUploadRes = await contentAssetApi.uploadMediaFile(langData.cover);
          if (coverUploadRes && coverUploadRes.success) {
            coverUrl = coverUploadRes.url;
          }
        }

        let finalDescription = formData.desc || '';
        if (formData.accessLevel === 'Paid') {
          finalDescription += ` [hs_access] Paid`;
        } else {
          finalDescription += ` [hs_access] Free`;
        }
        if (coverUrl) {
          finalDescription += ` [hs_cover] ${coverUrl}`;
        }
        if (chaptersList && chaptersList.length > 0) {
          finalDescription += ` [hs_chapters] ${JSON.stringify(chaptersList)}`;
        }

        const targetTitle = (langData.title && editItem && langData.title !== editItem.title)
          ? langData.title
          : formData.title;

        const payload = {
          title: targetTitle,
          type: 'Book',
          category: formData.cat,
          language: langName,
          languageCode: code,
          groupKey: computedGroupKey,
          status: formData.status,
          mediaUrl,
          description: finalDescription
        };

        if (langData.id) {
          await contentAssetApi.updateAsset(langData.id, payload);
        } else {
          await contentAssetApi.createAsset(payload);
        }
      }

      const wasEdit = !!editItem;
      setEditItem(null);
      setIsModalOpen(false);
      resetForm();
      loadAssets();
      alert(wasEdit ? 'Book content updated successfully! 📚' : 'New Book/Content created successfully! 📚');
    } catch (err) {
      console.error('Failed to commit assets', err);
      alert('Error updating content: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!deleteId) return;
      const targetItem = content.find(c => c.id === deleteId);
      if (targetItem) {
        const targetKey = targetItem.groupKey || normalizeKey(targetItem.title);
        const variants = content.filter(c => {
          const cKey = c.groupKey || normalizeKey(c.title);
          return (cKey && targetKey && cKey === targetKey) || (c.title && targetItem.title && c.title.trim().toLowerCase() === targetItem.title.trim().toLowerCase());
        });

        for (const v of variants) {
          await contentAssetApi.deleteAsset(v.id);
        }
      } else {
        await contentAssetApi.deleteAsset(deleteId);
      }
      setDeleteId(null);
      loadAssets();
      alert('Content deleted successfully! 🗑️');
    } catch (err) {
      console.error('Failed to delete asset', err);
      alert('Failed to delete asset: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleLanding = async (item) => {
    try {
      setLoading(true);
      const newStatus = !item.showOnLanding;
      const itemKey = item.groupKey || normalizeKey(item.title);

      // Filter all variants in full content that match the group key/title
      const variants = content.filter(c => {
        if (!c) return false;
        const cKey = c.groupKey || normalizeKey(c.title);
        return (cKey && itemKey && cKey === itemKey) || 
               (c.title && item.title && c.title.trim().toLowerCase() === item.title.trim().toLowerCase());
      });

      for (const v of variants) {
        await contentAssetApi.updateAsset(v.id, {
          showOnLanding: newStatus
        });
      }

      loadAssets();
      alert(`Landing page display updated for "${item.title}"! 🚀`);
    } catch (err) {
      console.error('Failed to update landing page selection', err);
      alert('Failed to update landing page selection: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const groupedContent = useMemo(() => {
    const groups = {};
    content.forEach(item => {
      const key = item.groupKey || normalizeKey(item.title);
      if (!groups[key]) {
        groups[key] = item;
      }
    });
    return Object.values(groups);
  }, [content]);

  const filteredContent = groupedContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All Categories' || item.cat === activeCategory;
    const itemLangs = getBookLanguages(item, content);
    const matchesLanguage = activeLanguage === 'All Languages' || 
      itemLangs.includes(activeLanguage) || 
      itemLangs.some(l => l.toLowerCase().includes(activeLanguage.toLowerCase()));
    const isBook = item.type === 'Book';
    return matchesSearch && matchesCategory && matchesLanguage && isBook;
  });

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogFormData.title.trim()) return;

    const wasEdit = !!editBlog;
    try {
      const payload = {
        ...blogFormData,
        img: blogFormData.img || '/Images/ayurvedic.png',
        date: blogFormData.date || 'April 2026'
      };

      if (editBlog) {
        await blogApi.updateBlog(editBlog.id, payload);
        setEditBlog(null);
      } else {
        await blogApi.createBlog(payload);
      }
      setIsBlogModalOpen(false);
      setBlogFormData({ title: '', category: 'Wellness', tag: 'Wellness', author: 'Dr. Pratap', desc: '', content: '', img: '', pdfUrl: '', date: 'April 2026' });
      loadBlogs();
      alert(wasEdit ? 'Blog article updated successfully! ✍️' : 'New Blog article created successfully! ✍️');
    } catch (err) {
      console.error('Failed to save blog:', err);
      alert('Failed to save blog: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog article?')) {
      try {
        await blogApi.deleteBlog(blogId);
        loadBlogs();
        alert('Blog article deleted successfully! 🗑️');
      } catch (err) {
        console.error('Failed to delete blog:', err);
        alert('Failed to delete blog: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="space-y-8 font-sans pb-20 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 bg-[#15192c] rounded-full shadow-lg shadow-[#15192c]/20"></div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
              {activeTab === 'blogs'
                ? (langCode === 'hi' ? 'ब्लॉग प्रबंधन' : langCode === 'mr' ? 'ब्लॉग व्यवस्थापन' : 'Blogs Management')
                : activeTab === 'insights'
                ? (langCode === 'hi' ? 'सदस्य पठन अंतर्दृष्टि' : langCode === 'mr' ? 'सदस्य वाचन माहिती' : 'Member Reading Insights')
                : t('adminContent.title', 'Books Management')
              }
            </h1>
          </div>
          <p className="text-slate-400 font-medium ml-4 tracking-tight leading-none">
            {activeTab === 'blogs'
              ? (langCode === 'hi' ? 'लैंडिंग पेज पर प्रदर्शित ब्लॉग्स बनाएं, संपादित करें और प्रबंधित करें' : langCode === 'mr' ? 'लँडिंग पृष्ठावर प्रदर्शित ब्लॉग तयार करा, संपादित करा आणि व्यवस्थापित करा' : 'Create, edit & manage wellness blogs shown on the landing page & view user ratings.')
              : t('adminContent.subtitle', 'Upload and oversee your wellness book library.')
            }
          </p>
        </div>

        {/* Action Button */}
        {activeTab === 'media' && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="px-4 py-3 bg-slate-900 text-[#fff] font-black rounded-xl text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> {t('adminContent.uploadNewBook', 'Upload New Book')}
          </button>
        )}

        {activeTab === 'blogs' && (
          <button
            onClick={() => {
              setEditBlog(null);
              setBlogFormData({ title: '', category: 'Wellness', tag: 'Wellness', author: 'Dr. Pratap', desc: '', content: '', img: '', pdfUrl: '', date: 'April 2026' });
              setIsBlogModalOpen(true);
            }}
            className="px-4 py-3 bg-[#E91E63] text-white font-black rounded-xl text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-pink-200 hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> {langCode === 'hi' ? 'नया ब्लॉग जोड़ें' : langCode === 'mr' ? 'नवीन ब्लॉग जोडा' : 'Add New Blog'}
          </button>
        )}

        {activeTab === 'faq' && (
          <button
            onClick={() => handleOpenFaqModal()}
            className="px-4 py-3 bg-[#9C27B0] text-white font-black rounded-xl text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-purple-200 hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> {langCode === 'hi' ? 'नया एफएक्यू जोड़ें' : langCode === 'mr' ? 'नवीन एफएक्यू जोडा' : 'Add New FAQ'}
          </button>
        )}
      </div>

      {/* Top Sub-Navigation Tabs */}
      <div className="flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 max-w-2xl gap-1">
        <button
          onClick={() => handleTabChange('media')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'media' ? 'bg-[#15192c] text-white shadow-md' : 'text-slate-500 hover:bg-white/60'
          }`}
        >
          <BookOpen size={14} /> {langCode === 'hi' ? '📚 इंटरैक्टिव पुस्तकें' : langCode === 'mr' ? '📚 परस्परसंवादी पुस्तके' : '📚 Interactive Books'}
        </button>
        <button
          onClick={() => handleTabChange('blogs')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'blogs' ? 'bg-[#E91E63] text-white shadow-md' : 'text-slate-500 hover:bg-white/60'
          }`}
        >
          <FileText size={14} /> {langCode === 'hi' ? '📰 ब्लॉग प्रबंधन' : langCode === 'mr' ? '📰 ब्लॉग व्यवस्थापन' : '📰 Blog Management'}
        </button>
        <button
          onClick={() => handleTabChange('faq')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'faq' ? 'bg-[#9C27B0] text-white shadow-md' : 'text-slate-500 hover:bg-white/60'
          }`}
        >
          <HelpCircle size={14} /> {langCode === 'hi' ? '❓ एफएक्यू प्रबंधन' : langCode === 'mr' ? '❓ एफएक्यू व्यवस्थापन' : '❓ FAQ Management'}
        </button>
        <button
          onClick={() => handleTabChange('insights')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'insights' ? 'bg-[#15192c] text-white shadow-md' : 'text-slate-500 hover:bg-white/60'
          }`}
        >
          <Zap size={14} /> {langCode === 'hi' ? '📊 पठन आंकड़े' : langCode === 'mr' ? '📊 वाचन आकडेवारी' : '📊 Member Insights'}
        </button>
      </div>

      {/* ── 1. BLOGS MANAGEMENT SECTION ── */}
      {activeTab === 'blogs' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogsList.map((blogItem) => {
              const blogFeedbacks = blogItem.feedbacks || [];
              const avgRating = blogFeedbacks.length > 0 
                ? (blogFeedbacks.reduce((s, f) => s + Number(f.rating || 5), 0) / blogFeedbacks.length).toFixed(1)
                : '5.0';

              return (
                <div key={blogItem.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="aspect-video relative overflow-hidden bg-slate-100">
                      <img src={blogItem.img || blogItem.coverUrl || '/Images/ayurvedic.png'} alt={blogItem.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black text-[#E91E63] uppercase tracking-widest shadow-sm">
                        {blogItem.tag || blogItem.category || 'Wellness'}
                      </span>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-[#C69214] uppercase tracking-widest">{blogItem.date || 'April 2026'}</span>
                        <span className="text-[9px] font-black text-[#E91E63] bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ⭐ {avgRating} ({blogFeedbacks.length})
                        </span>
                      </div>
                      <h3 className="font-serif font-black text-slate-800 text-lg leading-tight">{blogItem.title}</h3>
                      <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed">{blogItem.desc}</p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewBlogFeedback(blogItem)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider hover:bg-amber-100 transition-all flex items-center gap-1"
                      title="View Ratings & Feedbacks"
                    >
                      <Star size={12} fill="#F59E0B" stroke="#F59E0B" /> Feedbacks ({blogFeedbacks.length})
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditBlog(blogItem);
                          setBlogFormData({
                            title: blogItem.title || '',
                            category: blogItem.category || blogItem.tag || 'Wellness',
                            tag: blogItem.tag || blogItem.category || 'Wellness',
                            author: blogItem.author || 'Dr. Pratap',
                            desc: blogItem.desc || '',
                            content: blogItem.content || '',
                            img: blogItem.img || blogItem.coverUrl || '',
                            date: blogItem.date || 'April 2026'
                          });
                          setIsBlogModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title="Edit Blog"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blogItem.id)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete Blog"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. MEMBER INSIGHTS SECTION ── */}
      {activeTab === 'insights' && (
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm animate-in fade-in duration-300">
          <ReaderInsights booksCount={groupedContent.length} />
        </div>
      )}

      {/* ── 2.5 FAQ MANAGEMENT SECTION ── */}
      {activeTab === 'faq' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* FAQ Filters & Actions Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={e => setFaqSearchQuery(e.target.value)}
                placeholder="Search FAQs by question or answer..."
                className="w-full h-10 pl-12 pr-4 rounded-xl border border-black/5 bg-white shadow-sm focus:border-[#9C27B0] outline-none font-bold text-sm tracking-tight"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="flex flex-col relative w-full md:w-48">
                <select
                  value={faqCategoryFilter}
                  onChange={e => setFaqCategoryFilter(e.target.value)}
                  className="w-full h-10 px-4 py-2 bg-white rounded-xl border border-black/5 shadow-sm outline-none font-bold text-xs"
                >
                  <option value="All">All Categories</option>
                  {faqCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FAQs List Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            {loadingFaqs ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#9C27B0]"></div>
              </div>
            ) : faqsList.length === 0 ? (
              <div className="text-center py-16">
                <HelpCircle size={40} className="text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-black text-slate-800">No FAQs Found</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Try expanding your search query or add a new FAQ.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Question & Category</th>
                      <th className="px-6 py-4">Answer Snippet</th>
                      <th className="px-6 py-4 text-center">Order</th>
                      <th className="px-6 py-4 text-center">Popular</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Feedback</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 text-xs font-semibold text-slate-600">
                    {faqsList.map((faq) => (
                      <tr key={faq.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-black text-slate-800 truncate mb-1" title={faq.question}>
                            {faq.question}
                          </div>
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase tracking-wider">
                            {faq.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-sm">
                          <div className="line-clamp-2 text-slate-500" title={faq.answer}>
                            {faq.answer}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-800">
                          {faq.displayOrder}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {faq.isPopular ? (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black">POPULAR</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${
                            faq.status === 'Published' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {faq.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-emerald-500 text-[10px] font-bold">👍 {faq.helpfulCount}</span>
                            <span className="text-rose-400 text-[10px] font-bold mt-0.5">👎 {faq.notHelpfulCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenFaqModal(faq)}
                              className="p-2 bg-slate-50 hover:bg-[#9C27B0]/10 text-slate-600 hover:text-[#9C27B0] rounded-xl transition-colors cursor-pointer"
                              title="Edit FAQ"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteFaqId(faq.id)}
                              className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                              title="Delete FAQ"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. BOOKS SECTION (Original) ── */}
      {activeTab === 'media' && (
        <>
          {/* Filters & Dropdowns */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('adminContent.searchPlaceholder', 'Search by title, category or author...')}
                className="w-full h-10 pl-12 pr-4 rounded-xl border border-black/5 bg-white shadow-sm focus:border-[#15192c] outline-none font-bold text-sm tracking-tight"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <StyledDropdown
                label={t('adminContent.filterCategory', 'Filter Category')}
                value={activeCategory}
                options={['All Categories', ...customCategories]}
                onChange={setActiveCategory}
                icon={Tag}
              />
              <StyledDropdown
                label="Filter Language"
                value={activeLanguage}
                options={['All Languages', ...SUPPORTED_LANGUAGES]}
                onChange={setActiveLanguage}
                icon={Globe}
              />
            </div>
          </div>

      {/* Content Table */}
      <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-bold tracking-widest border-b border-black/5">
              <tr>
                <th className="px-4 py-3">{t('adminContent.contentAsset', 'Content Asset')}</th>
                <th className="px-4 py-3">{t('adminContent.category', 'Category')}</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Access Plan</th>
                <th className="px-4 py-3">{t('adminContent.status', 'Status')}</th>
                <th className="px-4 py-3 text-right">{t('adminContent.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-black/5">
              {filteredContent.map((item) => {
                const itemDesc = item.desc || item.description || '';
                const isPaidAccess = itemDesc.includes('[hs_access] Paid');
                return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-transparent ${TYPE_COLORS[item.type] || TYPE_COLORS.Default}`}>
                        {item.type === 'Video' ? <Video size={18} /> : <BookOpen size={18} />}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 tracking-tight leading-none mb-1 text-sm">{getItemDisplayTitle(item, content, langCode)}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Modified {item.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${CAT_COLORS[item.cat] || CAT_COLORS.Default}`}>
                      {item.cat}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                      {getBookLanguages(item, content).map((lang, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-100 flex items-center gap-1 w-fit"
                        >
                          <Globe size={10} />
                          {lang}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isPaidAccess ? (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 border border-purple-200">
                        PAID 🔒
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
                        FREE 🌸
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest ${item.status === 'Published' ? 'text-green-500' : item.status === 'Draft' ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Published' ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400'}`}></div>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 transition-all duration-300">
                      <button onClick={() => setViewItem(item)} className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all shadow-sm border border-black/5"><Eye size={14} /></button>
                      {item.type === 'Book' && (
                        <>
                          <button
                            onClick={() => handleToggleLanding(item)}
                            title={item.showOnLanding ? "Remove from Landing Page" : "Show on Landing Page"}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm border ${
                              item.showOnLanding 
                                ? 'bg-rose-50 text-[#E91E63] border-rose-200' 
                                : 'bg-white text-slate-400 hover:text-[#E91E63] hover:bg-rose-50 border-black/5'
                            }`}
                          >
                            <Home size={14} fill={item.showOnLanding ? "#E91E63" : "none"} />
                          </button>
                          <button
                            onClick={() => setRatingBook(item)}
                            title="View Member Ratings"
                            className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all shadow-sm border border-black/5"
                          >
                            <Star size={14} />
                          </button>
                        </>
                      )}
                      <button onClick={() => openEditModal(item)} className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-[#15192c] hover:bg-[#15192c]/10 rounded-lg transition-all shadow-sm border border-black/5"><Edit3 size={14} /></button>
                      <button onClick={() => setDeleteId(item.id)} className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shadow-sm border border-black/5"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
               ); })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ────────────────────────────────────────────────── */}
      {(isModalOpen || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <style>{`
              .fix-scrollbar::-webkit-scrollbar { width: 4px; }
              .fix-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .fix-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 1px solid transparent; background-clip: content-box; }
              .fix-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
           `}</style>
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-8 border-b border-black/5 flex items-center justify-between flex-shrink-0 bg-white z-10">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{editItem ? t('adminContent.editContent', 'Edit Content') : t('adminContent.uploadNew', 'Upload New Content')}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditItem(null); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto fix-scrollbar pr-[14px]">
              <form className="p-8 space-y-6" onSubmit={handleUpdate}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      if (!file.name.toLowerCase().endsWith('.pdf')) {
                        alert("Please upload a valid PDF file (.pdf only). DOCX files are not supported.");
                        e.target.value = '';
                        return;
                      }
                      setSelectedFile(file);
                    }
                  }}
                  className="hidden"
                  accept=".pdf,application/pdf"
                />
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={e => setSelectedCover(e.target.files[0])}
                  className="hidden"
                  accept="image/*"
                />
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminContent.contentTitle', 'Content Title')}</label>
                    <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full h-12 px-4 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold shadow-inner" placeholder="e.g. Understanding PCOS" />
                  </div>



                  <div className="col-span-2 sm:col-span-1 space-y-2">
                    <FormDropdown
                      label={t('adminContent.category', 'Category')}
                      value={formData.cat}
                      options={customCategories}
                      onChange={val => setFormData({ ...formData, cat: val })}
                    />
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddCat(!showAddCat)}
                        className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                      >
                        <Plus size={10} /> Add / Manage Categories
                      </button>
                      {formData.cat && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(formData.cat)}
                          className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={10} /> Delete Category
                        </button>
                      )}
                    </div>
                    {showAddCat && (
                      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            placeholder="New category name..."
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-600 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700"
                          >
                            Add
                          </button>
                        </div>
                        {customCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {customCategories.map(c => (
                              <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 rounded-md text-[9px] font-bold">
                                {c}
                                <button type="button" onClick={() => handleDeleteCategory(c)} className="hover:text-red-600"><X size={10} /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <MultiLanguageDropdown
                    label="Language(s)"
                    value={formData.language || 'English'}
                    options={SUPPORTED_LANGUAGES}
                    onChange={val => setFormData({ ...formData, language: val })}
                  />

                  <div className="col-span-2 sm:col-span-1">
                    <FormDropdown
                      label="Language Variant Of (Optional)"
                      value={formData.parentBookId || 'Independent Book (Main)'}
                      options={['Independent Book (Main)', ...content.map(c => c.title)]}
                      onChange={val => setFormData({ ...formData, parentBookId: val === 'Independent Book (Main)' ? '' : val })}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <FormDropdown
                      label={t('adminContent.publishingStatus', 'Publishing Status')}
                      value={formData.status}
                      options={['Published', 'Draft']}
                      onChange={val => setFormData({ ...formData, status: val })}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <FormDropdown
                      label="Plan Access Type"
                      value={formData.accessLevel === 'Paid' ? 'Paid / Premium (Basic & Premium Plan)' : 'Free (All Members)'}
                      options={['Free (All Members)', 'Paid / Premium (Basic & Premium Plan)']}
                      onChange={val => setFormData({ ...formData, accessLevel: val.includes('Paid') ? 'Paid' : 'Free' })}
                    />
                  </div>

                  {/* Dynamic Language Variant Upload Sections */}
                  {(() => {
                    const selectedLangList = (formData.language || 'English').split(',').map(s => s.trim()).filter(Boolean);
                    return selectedLangList.map(langName => {
                      const code = getLangCode(langName);
                      const langData = langPayloads[code] || {};

                      return (
                        <div key={code} className="col-span-2 p-6 bg-slate-50 border border-slate-200/80 rounded-[2rem] space-y-4 shadow-sm text-left">
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                            <div className="flex items-center gap-2">
                              <Globe size={18} className="text-indigo-600" />
                              <span className="text-xs font-black uppercase tracking-wider text-slate-800">{langName} Version Payload</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg">
                              Lang Code: {code}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {langName} Book Title (Optional)
                            </label>
                            <input
                              value={langData.title || ''}
                              onChange={e => updateLangPayload(code, 'title', e.target.value)}
                              placeholder={`e.g. ${formData.title} (${langName})`}
                              className="w-full h-10 px-3 bg-white border border-black/5 rounded-xl outline-none text-xs font-bold shadow-inner"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Document File Box */}
                            <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                {langName} Book File (.pdf)
                              </label>
                              <label className={`w-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                langData.file ? 'border-emerald-500 bg-emerald-50/40' : langData.mediaUrl ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-300 hover:border-indigo-500'
                              }`}>
                                <input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      if (!file.name.toLowerCase().endsWith('.pdf')) {
                                        alert("Please upload a valid PDF file (.pdf only). DOCX files are not supported.");
                                        e.target.value = '';
                                        return;
                                      }
                                      updateLangPayload(code, 'file', file);
                                    }
                                  }}
                                />
                                {langData.file ? (
                                  <CheckCircle size={20} className="text-emerald-600" />
                                ) : langData.mediaUrl ? (
                                  <CheckCircle size={20} className="text-indigo-600" />
                                ) : (
                                  <UploadCloud size={20} className="text-slate-400" />
                                )}
                                <div className="text-center text-[10px] font-bold text-slate-600 truncate max-w-[180px]">
                                  {langData.file ? langData.file.name : langData.mediaUrl ? 'File uploaded (Click to replace)' : `Upload ${langName} Book File`}
                                </div>
                              </label>
                            </div>

                            {/* Cover Image Box */}
                            <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                {langName} Cover Image
                              </label>
                              <label className={`w-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                langData.cover ? 'border-emerald-500 bg-emerald-50/40' : langData.coverUrl ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-300 hover:border-indigo-500'
                              }`}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => updateLangPayload(code, 'cover', e.target.files[0])}
                                />
                                {langData.cover ? (
                                  <CheckCircle size={20} className="text-emerald-600" />
                                ) : langData.coverUrl ? (
                                  <CheckCircle size={20} className="text-indigo-600" />
                                ) : (
                                  <UploadCloud size={20} className="text-slate-400" />
                                )}
                                <div className="text-center text-[10px] font-bold text-slate-600 truncate max-w-[180px]">
                                  {langData.cover ? langData.cover.name : langData.coverUrl ? 'Cover uploaded (Click to replace)' : `Upload ${langName} Cover`}
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}

                  {/* Index / Chapters (Table of Contents) Editor */}
                  <div className="space-y-4 col-span-2 p-5 bg-slate-50 border border-slate-200/80 rounded-[2rem] text-left">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/60 pb-3 gap-3">
                      <div className="flex items-center gap-2">
                        <ListOrdered size={18} className="text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Index / Chapters ({chaptersList.length} Points)
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleExtractBookmarksFromPdf()}
                          disabled={isExtractingPdf}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                          title="Extract embedded bookmarks from uploaded PDF file automatically"
                        >
                          {isExtractingPdf ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                          {isExtractingPdf ? 'Reading PDF...' : '⚡ Auto-Extract PDF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBulkModal(!showBulkModal)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm"
                          title="Copy-paste raw text to auto-parse all chapters"
                        >
                          <ClipboardList size={12} /> 📋 Bulk Paste Index
                        </button>
                        <button
                          type="button"
                          onClick={handleAddChapter}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus size={12} /> Add Point
                        </button>
                      </div>
                    </div>

                    {/* PDF Bookmark Extraction Alert Status */}
                    {pdfExtractStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 ${
                        pdfExtractStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        pdfExtractStatus.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        pdfExtractStatus.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        <span>{pdfExtractStatus.msg}</span>
                        <button type="button" onClick={() => setPdfExtractStatus(null)} className="text-slate-400 hover:text-slate-700 font-black">×</button>
                      </div>
                    )}

                    {/* Option 2: Bulk Copy-Paste Drawer / Textarea */}
                    {showBulkModal && (
                      <div className="p-4 bg-white border border-indigo-200 rounded-2xl shadow-lg space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                            <ClipboardList size={14} /> Paste Index Text (Bulk Import 70+ Points)
                          </span>
                          <button type="button" onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">×</button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold">
                          Copy all chapter points from PDF or Word doc and paste below. The system will parse titles and page numbers automatically!
                        </p>
                        <textarea
                          rows={8}
                          value={bulkText}
                          onChange={e => setBulkText(e.target.value)}
                          placeholder={`Example:\n1. What Does It Mean to Be CEO of Your Family? PG 1\n2. The 5 Roles Every Family CEO Must Master PG 10\n3. Know Yourself Before You Lead Others PG 13`}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium outline-none focus:border-indigo-600 focus:bg-white shadow-inner resize-y"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => { setShowBulkModal(false); setBulkText(''); }}
                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleParseBulkText}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-transform hover:scale-105 shadow-md flex items-center gap-1.5"
                          >
                            <Zap size={12} /> Parse & Import Chapters
                          </button>
                        </div>
                      </div>
                    )}

                    {chaptersList.length === 0 ? (
                      <p className="text-[10px] font-bold text-slate-400 italic py-2">
                        No index chapters added yet. Click <strong>"⚡ Auto-Extract PDF"</strong> to read PDF bookmarks, or <strong>"📋 Bulk Paste Index"</strong> to paste text!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {chaptersList.map((ch, idx) => (
                          <div key={ch.id || idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={ch.title}
                              onChange={e => handleUpdateChapter(idx, 'title', e.target.value)}
                              placeholder="Chapter Title (e.g. Understanding Child Development)"
                              className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 shadow-inner"
                            />
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Pg</span>
                              <input
                                type="number"
                                min="1"
                                value={ch.page || 1}
                                onChange={e => handleUpdateChapter(idx, 'page', parseInt(e.target.value) || 1)}
                                className="w-16 h-9 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 text-center shadow-inner"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveChapter(idx)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete point"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminContent.descriptionSummary', 'Description Summary')}</label>
                    <textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full h-32 p-4 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold resize-none shadow-inner" placeholder="Provide a brief summary for the sisters..."></textarea>
                  </div>
                </div>
                <div className="pt-6 border-t border-black/5 flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditItem(null); }} className="px-6 py-2 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">{t('adminContent.cancel', 'Cancel')}</button>
                  <button type="submit" className="w-full py-4 bg-[#15192c] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200/50 hover:scale-[1.02] active:scale-95 transition-all">{editItem ? t('adminContent.updateAsset', 'Update Asset') : t('adminContent.commitAsset', 'Commit Asset')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ────────────────────────────────────────────────────────── */}
      <CMSModal open={!!viewItem} onClose={() => setViewItem(null)} title={t('adminContent.assetPreview', 'Asset Preview')} icon={Eye} iconBg={viewItem?.type === 'Book' ? 'bg-indigo-500' : 'bg-blue-500'} maxWidth={viewItem?.type === 'Book' ? 'sm:max-w-4xl' : 'sm:max-w-2xl'}>
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{viewItem?.title}</h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Clock size={12} /> {viewItem?.date}  <span className="mx-1 opacity-30">|</span> <span className="font-black text-indigo-600">{viewItem?.status}</span>
            </div>
          </div>



          {/* ── BOOK / PDF VIEWER ── */}
          {viewItem?.type === 'Book' && (
            <div className="w-full">
              {viewItem?.mediaUrl ? (
                <AdminBookPreview item={viewItem} allContent={content} />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 bg-indigo-50 text-indigo-300 gap-3 rounded-[2rem]">
                  <BookOpen size={48} />
                  <p className="text-[10px] uppercase tracking-[0.4em] font-black">No Book PDF Uploaded</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-6 border rounded-[2rem] ${CAT_COLORS[viewItem?.cat] || CAT_COLORS.Default}`}><p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 flex items-center gap-2"><Tag size={12} /> {t('adminContent.category', 'Category')}</p><p className="text-sm font-black uppercase tracking-tight leading-none">{viewItem?.cat}</p></div>
            <div className={`p-6 border rounded-[2rem] ${TYPE_COLORS[viewItem?.type] || TYPE_COLORS.Default}`}><p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 flex items-center gap-2"><FileText size={12} /> {t('adminContent.assetFormat', 'Asset Format')}</p><p className="text-sm font-black uppercase tracking-tight leading-none">{viewItem?.type}</p></div>
          </div>
          <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-inner text-sm font-bold text-slate-500 leading-relaxed shadow-slate-100">{viewItem?.desc || 'A premium library module curated for health sakhi munity.'}</div>
          <div className="flex justify-end pt-2"><button onClick={() => setViewItem(null)} className="px-6 py-2 bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all">{t('adminContent.dismissView', 'Dismiss View')}</button></div>
        </div>
      </CMSModal>

      {/* ── DELETE MODAL ──────────────────────────────────────────────────────── */}
      <CMSModal open={!!deleteId} onClose={() => setDeleteId(null)} title={t('adminContent.deleteContent', 'Delete Content')} icon={Trash2} iconBg="bg-rose-500">
        <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] text-rose-800 font-bold mb-8 space-y-2">
          <p className="text-xl font-black">{t('adminContent.confirmDeletion', 'Confirm Deletion?')}</p>
          <p className="text-sm opacity-80 leading-relaxed">{t('adminContent.deletionWarning', 'This action is permanent and will remove the module for all sisters across the network.')}</p>
        </div>
        <div className="flex justify-end gap-3"><button onClick={() => setDeleteId(null)} className="px-6 py-2 bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">{t('adminContent.keepAsset', 'Keep Asset')}</button><button onClick={handleDelete} className="px-8 py-2 bg-rose-500 text-white font-black text-[9px] uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/20 active:scale-95 transition-all">{t('adminContent.removePermanently', 'Remove Permanently')}</button></div>
      </CMSModal>

      {/* ── BOOK RATINGS MODAL ──────────────────────────────────────────────── */}
      {ratingBook && (() => {
        const avgRating = bookFeedbackList.length
          ? (bookFeedbackList.reduce((s, f) => s + (f.rating || 0), 0) / bookFeedbackList.length).toFixed(1)
          : null;
        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-400 overflow-hidden text-left">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <Star size={18} className="text-amber-500 fill-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800 leading-none">{ratingBook.title}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Member Ratings & Feedback</p>
                  </div>
                </div>
                <button onClick={() => setRatingBook(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Summary Stats */}
              {!loadingFeedbacks && bookFeedbackList.length > 0 && (
                <div className="flex items-center gap-6 px-8 py-4 bg-amber-50/60 border-b border-amber-100 shrink-0">
                  <div className="text-center">
                    <p className="text-3xl font-black text-amber-500">{avgRating}</p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={parseFloat(avgRating) >= s ? '#F59E0B' : 'none'} stroke={parseFloat(avgRating) >= s ? '#F59E0B' : '#CBD5E1'} strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mt-0.5">Avg Rating</p>
                  </div>
                  <div className="h-12 w-px bg-amber-200" />
                  <div className="text-center">
                    <p className="text-3xl font-black text-slate-700">{bookFeedbackList.length}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Total Reviews</p>
                  </div>
                  <div className="h-12 w-px bg-amber-200" />
                  <div className="flex gap-1 flex-wrap">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = bookFeedbackList.filter(f => f.rating === star).length;
                      return count > 0 ? (
                        <span key={star} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black ${star >= 4 ? 'bg-green-100 text-green-600' : star === 3 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-500'
                          }`}>
                          {star}★ ×{count}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Feedback List */}
              <div className="overflow-y-auto flex-1 px-8 py-6 space-y-4">
                {loadingFeedbacks ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-505"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading feedbacks...</p>
                  </div>
                ) : bookFeedbackList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300 gap-3">
                    <Star size={40} />
                    <p className="text-[11px] font-black uppercase tracking-widest">No ratings yet for this book</p>
                    <p className="text-[10px] text-slate-300">Members will rate after reading 2+ pages</p>
                  </div>
                ) : (
                  bookFeedbackList.map((fb, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-black text-[11px] shrink-0">
                            {(fb.memberName || 'M').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-slate-700">{fb.memberName || 'Member'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {fb.submittedAt ? new Date(fb.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map(s => (
                            <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={fb.rating >= s ? '#F59E0B' : 'none'} stroke={fb.rating >= s ? '#F59E0B' : '#CBD5E1'} strokeWidth="1.5">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {fb.comment && (
                        <p className="mt-3 text-[12px] text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                          "{fb.comment}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-8 pb-6 shrink-0">
                <button onClick={() => setRatingBook(null)} className="w-full py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
        </>
      )}

      {/* ── CREATE / EDIT BLOG MODAL ── */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-black/5 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E91E63] text-white flex items-center justify-center font-black shadow-md">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {editBlog
                      ? (langCode === 'hi' ? 'ब्लॉग लेख संपादित करें' : langCode === 'mr' ? 'ब्लॉग लेख संपादित करा' : 'Edit Blog Article')
                      : (langCode === 'hi' ? 'नया ब्लॉग लेख जोड़ें' : langCode === 'mr' ? 'नवीन ब्लॉग लेख जोडा' : 'Create New Blog Article')
                    }
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {langCode === 'hi' ? 'लैंडिंग पेज ब्लॉग प्रबंधन' : langCode === 'mr' ? 'लँडिंग पेज ब्लॉग व्यवस्थापन' : 'Landing Page Blog Management'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsBlogModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="p-6 sm:p-8 overflow-y-auto space-y-5 custom-book-scrollbar flex-1">
              {/* Blog Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  {langCode === 'hi' ? 'ब्लॉग शीर्षक *' : langCode === 'mr' ? 'ब्लॉगचे शीर्षक *' : 'Blog Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={blogFormData.title}
                  onChange={e => setBlogFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={langCode === 'hi' ? 'जैसे: सुबह की ऊर्जा के लिए आयुर्वेदिक आदतें' : langCode === 'mr' ? 'उदा: सकाळच्या ऊर्जेसाठी आयुर्वेदिक सवयी' : 'e.g. Ayurvedic Habits for Morning Energy'}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#E91E63]"
                />
              </div>

              {/* Category Dropdown & Management */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                    {langCode === 'hi' ? 'श्रेणी / टैग *' : langCode === 'mr' ? 'श्रेणी / टॅग *' : 'Category / Tag *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddBlogCat(!showAddBlogCat)}
                    className="text-[9px] font-black text-[#E91E63] uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={10} /> {showAddBlogCat ? 'Close' : '+ Add / Manage Blog Categories'}
                  </button>
                </div>

                <select
                  value={blogFormData.category}
                  onChange={e => setBlogFormData(prev => ({ ...prev, category: e.target.value, tag: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#E91E63]"
                >
                  {blogCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {showAddBlogCat && (
                  <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBlogCatName}
                        onChange={e => setNewBlogCatName(e.target.value)}
                        placeholder="New blog category..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#E91E63] shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddBlogCategory}
                        className="px-4 py-2 bg-[#E91E63] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#D81B60]"
                      >
                        Add Category
                      </button>
                    </div>
                    {blogCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {blogCategories.map(c => (
                          <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-rose-200 text-[#E91E63] rounded-lg text-[9px] font-extrabold shadow-sm">
                            {c}
                            <button type="button" onClick={() => handleDeleteBlogCategory(c)} className="hover:text-red-700 ml-1 cursor-pointer"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cover Image Upload (No Raw Link displayed) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">
                  {langCode === 'hi' ? 'कवर / कार्ड इमेज (ImageKit CDN) *' : langCode === 'mr' ? 'कव्हर / कार्ड इमेज (ImageKit CDN) *' : 'Cover / Card Image (ImageKit CDN) *'}
                </label>

                {blogFormData.img ? (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                      <img src={getAssetUrl(blogFormData.img)} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-emerald-700 flex items-center gap-1">
                        <CheckCircle size={14} /> Image Loaded
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold">ImageKit CDN Connected</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => blogImageInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-rose-50 hover:text-[#E91E63] transition-all"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => blogImageInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50/30 hover:bg-rose-50/70 transition-all text-center cursor-pointer space-y-2"
                  >
                    <UploadCloud size={28} className="mx-auto text-[#E91E63]" />
                    <p className="text-xs font-black text-slate-700">
                      {isUploadingBlogImage ? 'Uploading Image to ImageKit...' : '📁 Click to Upload Cover Image'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">PNG, JPG, WEBP formats supported</p>
                  </div>
                )}
                <input
                  ref={blogImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBlogImageUpload}
                  className="hidden"
                />
              </div>

              {/* Blog PDF Document OR Text Article Option */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center justify-between">
                  <span>{langCode === 'hi' ? 'ब्लॉग कंटेंट (PDF / Text)' : langCode === 'mr' ? 'ब्लॉग मजकूर (PDF / Text)' : 'Blog Content Mode (PDF / Text)'}</span>
                </label>

                {/* PDF File Upload Box */}
                <div className="space-y-2">
                  {blogFormData.pdfUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <FileText size={20} className="text-emerald-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-black text-emerald-800 flex items-center gap-1">
                          <CheckCircle size={13} /> PDF Article Document Attached
                        </p>
                        <p className="text-[9px] text-emerald-600 font-bold">Will open in interactive PDF reader on landing page</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => blogPdfInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-all"
                      >
                        Change PDF
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => blogPdfInputRef.current?.click()}
                      className="p-5 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:border-[#E91E63] hover:bg-rose-50/40 transition-all text-center cursor-pointer space-y-1.5"
                    >
                      <FileText size={24} className="mx-auto text-slate-400" />
                      <p className="text-xs font-black text-slate-700">
                        {isUploadingBlogPdf ? 'Uploading PDF Document...' : '📄 Click to Upload Blog PDF Article'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">PDF document will be read inside the reader modal</p>
                    </div>
                  )}
                  <input
                    ref={blogPdfInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleBlogPdfUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Short Summary / Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  {langCode === 'hi' ? 'संक्षिप्त विवरण (Short Summary) *' : langCode === 'mr' ? 'थोडक्यात विवरण (Short Summary) *' : 'Short Summary / Description *'}
                </label>
                <input
                  type="text"
                  required
                  value={blogFormData.desc}
                  onChange={e => setBlogFormData(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder={langCode === 'hi' ? 'कार्ड पर दिखने वाली छोटी टैगलाइन...' : langCode === 'mr' ? 'कार्डवर दिसणारी छोटी टॅगलाइन...' : 'Short tagline shown on landing page card...'}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#E91E63]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  {langCode === 'hi' ? 'पूरा ब्लॉग लेख विषय *' : langCode === 'mr' ? 'संपूर्ण ब्लॉग लेख मजकूर *' : 'Full Blog Article Content *'}
                </label>
                <textarea
                  rows={6}
                  required
                  value={blogFormData.content}
                  onChange={e => setBlogFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={langCode === 'hi' ? 'यहाँ पूरा ब्लॉग लेख लिखें...' : langCode === 'mr' ? 'येथे संपूर्ण ब्लॉग लेख लिहा...' : 'Write full blog article here...'}
                  className="w-full p-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#E91E63] resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all cursor-pointer"
                >
                  {langCode === 'hi' ? 'रद्द करें' : langCode === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#E91E63] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#D81B60] transition-all shadow-md cursor-pointer"
                >
                  {editBlog
                    ? (langCode === 'hi' ? 'ब्लॉग अपडेट करें' : langCode === 'mr' ? 'ब्लॉग अद्यतन करा' : 'Update Blog')
                    : (langCode === 'hi' ? 'ब्लॉग प्रकाशित करें' : langCode === 'mr' ? 'ब्लॉग प्रकाशित करा' : 'Publish Blog')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BLOG FEEDBACKS MODAL ── */}
      {viewBlogFeedback && (() => {
        const avgScore = blogFeedbackList.length > 0
          ? (blogFeedbackList.reduce((s, f) => s + Number(f.rating || 5), 0) / blogFeedbackList.length).toFixed(1)
          : '5.0';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-left">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md">
                    <Star size={20} fill="white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight truncate max-w-xs sm:max-w-md">
                      Ratings & Feedback: {viewBlogFeedback.title}
                    </h2>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                      Average Rating: ⭐ {avgScore} / 5.0 ({blogFeedbackList.length} reviews)
                    </p>
                  </div>
                </div>
                <button onClick={() => setViewBlogFeedback(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3 flex-1 custom-book-scrollbar">
                {loadingBlogFeedbacks ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                    <RefreshCw size={24} className="animate-spin" />
                    <p className="text-xs font-black uppercase">Loading feedbacks...</p>
                  </div>
                ) : blogFeedbackList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Star size={36} className="mx-auto text-slate-300" />
                    <p className="text-xs font-black uppercase tracking-wider">No feedbacks submitted yet</p>
                    <p className="text-[10px] text-slate-400">Readers can submit ratings and feedback at the end of this blog article on the Landing Page.</p>
                  </div>
                ) : (
                  blogFeedbackList.map((fb) => (
                    <div key={fb.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">{fb.userName || 'Wellness Sakhi'}</span>
                        <div className="flex items-center gap-2">
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
                          <button
                            onClick={() => handleDeleteBlogFeedback(fb.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Delete this feedback"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        "{fb.comment}"
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-right">
                        {fb.date || (fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button onClick={() => setViewBlogFeedback(null)} className="w-full py-2.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-all cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 4. ADD/EDIT FAQ MODAL ── */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle size={18} className="text-[#9C27B0]" />
                {editFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </h3>
              <button 
                onClick={() => setIsFaqModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFaq}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Question */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Question *</label>
                  <input
                    type="text"
                    required
                    value={faqFormData.question}
                    onChange={e => setFaqFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter FAQ question..."
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#9C27B0]"
                  />
                </div>

                {/* Answer */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Answer *</label>
                  <textarea
                    required
                    rows={4}
                    value={faqFormData.answer}
                    onChange={e => setFaqFormData(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Enter FAQ detailed answer..."
                    className="w-full p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#9C27B0] resize-none leading-relaxed"
                  />
                </div>

                {/* Category Dropdown & Management */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddFaqCat(!showAddFaqCat)}
                      className="text-[9px] font-black text-[#9C27B0] uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={10} /> {showAddFaqCat ? 'Close' : '+ Add / Manage FAQ Categories'}
                    </button>
                  </div>

                  <select
                    value={faqFormData.category}
                    onChange={e => setFaqFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#9C27B0]"
                  >
                    {faqCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {showAddFaqCat && (
                    <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFaqCatName}
                          onChange={e => setNewFaqCatName(e.target.value)}
                          placeholder="New FAQ category..."
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#9C27B0] shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddFaqCategory}
                          className="px-4 py-2 bg-[#9C27B0] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#7B1FA2]"
                        >
                          Add Category
                        </button>
                      </div>
                      {faqCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {faqCategories.map(c => (
                            <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-purple-200 text-[#9C27B0] rounded-lg text-[9px] font-extrabold shadow-sm">
                              {c}
                              <button type="button" onClick={() => handleDeleteFaqCategory(c)} className="hover:text-purple-900 ml-1 cursor-pointer"><X size={10} /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Display Order & Status Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Display Order</label>
                    <input
                      type="number"
                      value={faqFormData.displayOrder}
                      onChange={e => setFaqFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                      placeholder="e.g. 1"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#9C27B0]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Status</label>
                    <select
                      value={faqFormData.status}
                      onChange={e => setFaqFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#9C27B0]"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Popular checkbox in full row */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={faqFormData.isPopular}
                    onChange={e => setFaqFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#9C27B0] focus:ring-[#9C27B0] cursor-pointer"
                  />
                  <label htmlFor="isPopular" className="text-[10px] font-black text-slate-700 uppercase tracking-widest cursor-pointer select-none">
                    Mark as Popular
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-200 cursor-pointer"
                >
                  {editFaq ? 'Save Changes' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. DELETE FAQ CONFIRMATION DIALOG ── */}
      {deleteFaqId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Delete FAQ Item?</h4>
            <p className="text-xs text-slate-400 font-semibold mt-2">
              Are you sure you want to permanently delete this FAQ item? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteFaqId(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFaq}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContentCMS;

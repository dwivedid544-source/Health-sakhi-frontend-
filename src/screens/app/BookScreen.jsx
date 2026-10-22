import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Trophy,
  CheckCircle, XCircle, Clock, Sparkles,
  PlayCircle, Volume2, Square, Headphones, BookOpen, Bookmark, Maximize2, Minimize2, FileText, Globe,
  ZoomIn, ZoomOut
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import RewardModal from '../../components/RewardModal';

const parseDocxXmlToPages = (xmlText) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const rawPages = [];
    let currentPageHtml = '';

    const paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p'));

    paragraphs.forEach((p) => {
      // Alignment and borders
      const pPr = p.getElementsByTagName('w:pPr')[0];
      let pAlign = 'left';
      let borderStyle = '';

      if (pPr) {
        const jc = pPr.getElementsByTagName('w:jc')[0];
        if (jc) pAlign = jc.getAttribute('w:val') || 'left';

        const pBdr = pPr.getElementsByTagName('w:pBdr')[0];
        if (pBdr) {
          const bottom = pBdr.getElementsByTagName('w:bottom')[0];
          if (bottom) {
            const bColor = bottom.getAttribute('w:color') || 'A82E4E';
            const hexColor = bColor === 'auto' ? '#A82E4E' : `#${bColor}`;
            borderStyle += `border-bottom: 1.5px solid ${hexColor}; padding-bottom: 0.5rem; margin-bottom: 0.75rem;`;
          }
          const top = pBdr.getElementsByTagName('w:top')[0];
          if (top) {
            const tColor = top.getAttribute('w:color') || 'A82E4E';
            const hexColor = tColor === 'auto' ? '#A82E4E' : `#${tColor}`;
            borderStyle += `border-top: 1.5px solid ${hexColor}; padding-top: 0.5rem; margin-top: 0.75rem;`;
          }
        }
      }

      let breakAfter = false;
      const brs = Array.from(p.getElementsByTagName('w:br'));
      for (let b of brs) {
        if (b.getAttribute('w:type') === 'page') {
          breakAfter = true;
        }
      }
      if (p.getElementsByTagName('w:lastRenderedPageBreak').length > 0) {
        breakAfter = true;
      }

      let pContentHtml = '';
      let plainText = '';

      const children = Array.from(p.childNodes);
      children.forEach((child) => {
        if (child.nodeName === 'w:r') {
          const rPr = child.getElementsByTagName('w:rPr')[0];
          let color = null;
          let fontSize = null;
          let font = null;
          let isBold = false;
          let isItalic = false;

          if (rPr) {
            const colorEl = rPr.getElementsByTagName('w:color')[0];
            if (colorEl) color = colorEl.getAttribute('w:val');

            const szEl = rPr.getElementsByTagName('w:sz')[0];
            if (szEl) {
              const val = parseInt(szEl.getAttribute('w:val'));
              if (!isNaN(val)) fontSize = (val / 2).toFixed(1);
            }

            const fontEl = rPr.getElementsByTagName('w:rFonts')[0];
            if (fontEl) font = fontEl.getAttribute('w:ascii') || fontEl.getAttribute('w:hAnsi');

            if (rPr.getElementsByTagName('w:b').length > 0) isBold = true;
            if (rPr.getElementsByTagName('w:i').length > 0) isItalic = true;
          }

          const tEls = child.getElementsByTagName('w:t');
          let runText = '';
          for (let t of Array.from(tEls)) {
            runText += t.textContent;
          }

          if (runText) {
            plainText += runText;
            let styleStr = '';
            if (color && color !== 'auto') styleStr += `color: #${color};`;
            if (fontSize) styleStr += `font-size: ${fontSize}pt;`;
            if (font) styleStr += `font-family: "${font}", Georgia, serif;`;
            if (isBold) styleStr += `font-weight: bold;`;
            if (isItalic) styleStr += `font-style: italic;`;

            pContentHtml += `<span style="${styleStr}">${runText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
          }
        }
      });

      const trimmedPlain = plainText.trim();
      const isDedication = trimmedPlain.toLowerCase() === 'dedication' || trimmedPlain.toLowerCase().startsWith('dedication');

      // Dedication heading starts Page 2 — flush previous Page 1 text (2025)
      if (isDedication && currentPageHtml.trim()) {
        rawPages.push(currentPageHtml);
        currentPageHtml = '';
      }

      if (pContentHtml.trim()) {
        let alignStyle = pAlign === 'center' ? 'text-align: center;' : pAlign === 'right' ? 'text-align: right;' : pAlign === 'justify' ? 'text-align: justify;' : 'text-align: left;';

        let extraLine = '';
        if (isDedication) {
          extraLine = `<hr style="border: 0; border-top: 1.5px solid #A82E4E; margin: 0.75rem auto 1.25rem auto; width: 90%; opacity: 0.85;" />`;
        } else if (trimmedPlain.includes('www.HealthSakhi.com')) {
          borderStyle = 'border-top: 1px solid #fecdd3; border-bottom: 1px solid #fecdd3; padding: 0.35rem 0; margin: 0.75rem 0;';
        }

        currentPageHtml += `<p style="${alignStyle} ${borderStyle} margin-bottom: 0.75rem; line-height: 1.8;">${pContentHtml}</p>${extraLine}`;
      }

      // Do NOT trigger page break on Dedication heading itself — let Dedication and its quote text stay together on Page 2
      if (breakAfter && !isDedication && currentPageHtml.trim()) {
        rawPages.push(currentPageHtml);
        currentPageHtml = '';
      }
    });

    if (currentPageHtml.trim()) {
      rawPages.push(currentPageHtml);
    }

    // Add top header bar (Heart to Heart ✦ HealthSakhi) to each page
    const finalPages = rawPages.map(pageHtml => {
      const topHeader = `<div style="display: flex; align-items: center; justify-content: center; font-size: 9.5pt; color: #A82E4E; font-family: Georgia, serif; border-bottom: 1px solid #fecdd3; padding-bottom: 0.35rem; margin-bottom: 1.25rem; letter-spacing: 0.05em;">Heart to Heart ✦ HealthSakhi</div>`;
      return `${topHeader}${pageHtml}`;
    });

    return finalPages;
  } catch (err) {
    console.error('[BookScreen] XML parse error:', err);
    return [];
  }
};

const parseDocxToPages = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();

    // Try XML parsing via JSZip first for 100% exact styling & page breaks
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXmlFile = zip.file("word/document.xml");
      if (docXmlFile) {
        const xmlText = await docXmlFile.async("text");
        const xmlPages = parseDocxXmlToPages(xmlText);
        if (xmlPages && xmlPages.length > 0) {
          return xmlPages;
        }
      }
    } catch (zipErr) {
      console.warn('[BookScreen] XML parsing fallback to mammoth:', zipErr);
    }

    // Mammoth fallback if XML parsing fails
    const options = {
      convertImage: mammoth.images.inline((element) => {
        return element.read("base64").then((imageBuffer) => {
          return {
            src: "data:" + element.contentType + ";base64," + imageBuffer
          };
        });
      })
    };

    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    const fullHtml = result.value;

    if (!fullHtml || !fullHtml.trim()) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHtml, 'text/html');
    const childNodes = Array.from(doc.body.childNodes);

    const pages = [];
    let currentPageHtml = '';
    let currentLen = 0;

    childNodes.forEach((node) => {
      let outer = node.outerHTML || node.textContent || '';
      const textLen = (node.textContent || '').length;
      const isHeading = node.nodeName && ['H1', 'H2', 'H3', 'H4'].includes(node.nodeName.toUpperCase());

      if (node.nodeName === 'IMG') {
        const src = node.getAttribute('src');
        if (src) {
          outer = `<img src="${src}" class="max-w-full rounded-xl shadow-md mx-auto my-3 block max-h-[260px] object-contain" />`;
        }
      }

      if ((currentLen > 500 && isHeading) || currentLen > 900) {
        if (currentPageHtml.trim()) {
          pages.push(currentPageHtml);
        }
        currentPageHtml = outer;
        currentLen = textLen;
      } else {
        currentPageHtml += outer;
        currentLen += textLen;
      }
    });

    if (currentPageHtml.trim()) {
      pages.push(currentPageHtml);
    }

    return pages.length > 0 ? pages : [fullHtml];
  } catch (err) {
    console.error('[BookScreen] DOCX to pages parsing failed:', err);
    return null;
  }
};
import { useAuth } from '../../context/AuthContext';
import memberApi from '../../api/memberApi';

import { languageMap } from '../../data/bookTranslations';
import { useTTS } from '../../hooks/useTTS';
import { useLanguage } from '../../context/LanguageContext';
import {
  getReaderCopy,
  getSakhiTip,
  getSakhiReflection,
  getWellnessLevel,
  estimateMinutesLeft
} from '../../data/bookReaderTips';
import contentAssetApi from '../../api/contentAssetApi';
import i18nApi from '../../api/i18nApi';
import { generateDynamicChapters } from './BookDetailScreen';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── Scale Content Helper ──────────────────────────────────────────────────
const ScaleFitContent = ({ children, html, pageIndex, selectedLang, loading, zoomScale = 1.0 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (loading || !html) return;

    const el = containerRef.current;
    if (!el) return;
    el.style.fontSize = `${100 * zoomScale}%`;

    if (zoomScale === 1.0) {
      const timeoutId = setTimeout(() => {
        const parent = el.closest('.overflow-hidden, .overflow-y-auto');
        if (!parent) return;

        let currentScale = 1.0;
        const maxAttempts = 15;
        let attempt = 0;

        while (parent.scrollHeight > parent.clientHeight && attempt < maxAttempts && currentScale > 0.5) {
          currentScale -= 0.05;
          el.style.fontSize = `${currentScale * 100}%`;
          attempt++;
        }
      }, 40);

      return () => clearTimeout(timeoutId);
    }
  }, [html, pageIndex, selectedLang?.code, loading, zoomScale]);

  return (
    <div ref={containerRef} className="flex-1 max-w-none text-justify book-content flex flex-col justify-between h-full min-h-0 overflow-y-auto pr-1">
      <style>{`
        .book-content h1 { font-size: 1.4rem; font-weight: 900; color: #0f172a; margin-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.35rem; tracking: -0.02em; }
        .book-content h2 { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin-top: 0.85rem; margin-bottom: 0.5rem; }
        .book-content h3 { font-size: 1.05rem; font-weight: 700; color: #334155; margin-top: 0.75rem; margin-bottom: 0.35rem; }
        .book-content p { font-size: 0.92rem; line-height: 1.8; color: #334155; margin-bottom: 0.65rem; text-align: justify; word-break: break-word; }
        .book-content ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.65rem; }
        .book-content ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 0.65rem; }
        .book-content li { font-size: 0.92rem; line-height: 1.7; color: #334155; margin-bottom: 0.2rem; }
        .book-content img { max-width: 100%; height: auto; max-height: 250px; object-fit: contain; border-radius: 0.75rem; margin: 0.75rem auto; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .book-content table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.82rem; }
        .book-content th, .book-content td { border: 1px solid #cbd5e1; padding: 0.4rem 0.65rem; text-align: left; }
        .book-content th { background-color: #f8fafc; font-weight: 700; color: #0f172a; }
        .book-content blockquote { border-left: 4px solid #10b981; padding-left: 1rem; font-style: italic; color: #475569; margin: 0.65rem 0; background: #f0fdf4; padding-top: 0.4rem; padding-bottom: 0.4rem; border-radius: 0 0.5rem 0.5rem 0; }
      `}</style>
      <div>
        {children}
      </div>
    </div>
  );
};

// ── Mock Data ────────────────────────────────────────────────────────────────
const BOOKS_DATA = {
  1: {
    id: 1,
    title: 'Womens Monthly Wellness',
    subtitle: 'Cycle Sync & Hormones',
    description: "Your monthly guide to cycle sync, hormones, and total body wellness.",
    author: 'Dr. Sakshi',
    image: '/Images/final cover - womens monthly wellness guide.png',
    category: 'Women Health',
    reads: '1.2k',
    desc: 'Understand your body\'s natural rhythms and optimize your health throughout your monthly cycle.',
    chapters: ['Phase 1: Flow', 'Phase 2: Bloom', 'Phase 3: Vitality', 'Phase 4: Balance', 'The Sakhi Way'],
    pdfUrl: '/books/Beyond_Parenting_HealthSakhi (1)_compressed.pdf',
    questions: [
      { question: 'What is the first phase of the cycle?', options: ['Luteal', 'Follicular', 'Flow', 'Ovulation'], correct: 2 },
      { question: 'Which hormone peaks during ovulation?', options: ['Progesterone', 'Estrogen', 'LH', 'FSH'], correct: 1 }
    ]
  },
  2: {
    id: 2,
    title: 'Beauty Without Parlour',
    subtitle: 'Natural Self-Care',
    description: "Natural beauty secrets and self-care rituals you can do right at home.",
    author: 'Dr. Meera',
    image: '/Images/final cover beauty without parlour.png',
    category: 'Lifestyle',
    reads: '2.5k',
    desc: 'Ancient wisdom and modern science combined for your daily beauty ritual.',
    chapters: ['Morning Glow', 'Hair Care Rituals', 'Skin Nutrition', 'Evening Detox', 'Natural Radiance'],
    pdfUrl: '/books/HealthSakhi_Complete_ThreeParts (2).pdf',
    questions: [
      { question: 'Which natural ingredient is best for glow?', options: ['Sugar', 'Turmeric', 'Salt', 'Lemon'], correct: 1 }
    ]
  },
  3: {
    id: 3,
    title: 'Healing Loneliness',
    subtitle: 'Internal Connection',
    description: "Finding peace and connection within yourself in a busy world.",
    author: 'Ananya Rao',
    image: '/Images/final cover loneliness.png',
    category: 'Mental Wellness',
    reads: '980',
    desc: 'A guide to emotional self-sufficiency and deep internal peace.',
    chapters: ['Solitude vs Loneliness', 'The Inner Dialogue', 'Emotional Resilience', 'Reconnecting with Self', 'Peace Within'],
    pdfUrl: '/books/Beyond_Parenting_HealthSakhi (1)_compressed.pdf',
    questions: [
      { question: 'Solitude is...', options: ['Sad', 'A choice', 'Boring', 'scary'], correct: 1 }
    ]
  },
  4: {
    id: 4,
    title: 'The PCOD Protocol',
    subtitle: 'Hormonal Mastery',
    description: "Reclaim your health and balance your hormones with the PCOD masterguide.",
    author: 'Sana Khan',
    image: '/Images/final pcod book cover.png',
    category: 'Women Health',
    reads: '1.5k',
    desc: 'Comprehensive protocols for managing PCOD naturally through diet and lifestyle.',
    chapters: ['Understanding PCOD', 'The Insulin Connection', 'Dietary Protocols', 'Movement as Medicine', 'Living Balanced'],
    pdfUrl: '/books/HealthSakhi_Complete_ThreeParts (2).pdf',
    questions: [
      { question: 'PCOD affects which system?', options: ['Digestive', 'Endocrine', 'Nervous', 'Skeletal'], correct: 1 }
    ]
  },
  5: {
    id: 5,
    title: 'Science of Desire',
    subtitle: 'Biological Connection',
    description: "Understanding the psychology and biology of connection and intimacy.",
    author: 'Dr. Pratap',
    image: '/Images/final science of desire.png',
    category: 'Relationships',
    reads: '3.2k',
    desc: 'The neuroscience of relationships and the biology of attraction.',
    chapters: ['The Brain in Love', 'Chemistry of Connection', 'Emotional Intimacy', 'Biological Anchors', 'Sustainable Bonds'],
    pdfUrl: '/books/Beyond_Parenting_HealthSakhi (1)_compressed.pdf',
    questions: [
      { question: 'Which hormone is the "cuddle hormone"?', options: ['Dopamine', 'Oxytocin', 'Adrenaline', 'Cortisol'], correct: 1 }
    ]
  },
  6: {
    id: 6,
    title: 'Woman Like A Poem',
    subtitle: 'Emotional Nuances',
    description: "Learning the deep emotional language and nuances of womanhood.",
    author: 'Dr. Sakshi',
    image: '/Images/HOW TO READ WOMAN LIKE A POEM.png',
    category: 'Mindset',
    reads: '1.8k',
    desc: 'A poetic exploration of the feminine psyche and emotional strength.',
    chapters: ['The Verse of Self', 'Emotional Rhymes', 'Strength in Softness', 'The Narrative Within', 'Feminine Grace'],
    pdfUrl: '/books/HealthSakhi_Complete_ThreeParts (2).pdf',
    questions: [
      { question: 'Strength is found in...', options: ['Aggression', 'Softness/Resilience', 'Silence', 'Control'], correct: 1 }
    ]
  },
};

const getBook = (id) => BOOKS_DATA[id] || BOOKS_DATA[1];

const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:5000';

const STATIC_COVERS = {
  1: '/Images/heart to heart.png',
  2: '/Images/final wt loss book cover.png',
  3: '/Images/final cover fountain of family.png',
  4: '/Images/HS LIFE AFTRE SHAADI COVER.png',
  5: '/Images/HS MENOPAUSE.png',
  6: '/Images/final cover beauty without parlour.png',
  7: '/Images/HS HOW TO READ HUSBAND COVE R.png',
  8: '/Images/HOW TO READ WOMAN LIKE A POEM.png',
  9: '/Images/100 operations.png',
  10: '/Images/final pcod book cover.png',
};

const getStaticCoverUrl = (id) => {
  return STATIC_COVERS[id] || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400';
};

const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ── BookScreen Component ────────────────────────────────────────────────────
const BookScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef(null);
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [pdfNumPages, setPdfNumPages] = useState(null);
  const [baseBookAsset, setBaseBookAsset] = useState(null);
  const [availableLangCodes, setAvailableLangCodes] = useState(new Set(['en', 'hi', 'mr']));
  const [isNotAvailable, setIsNotAvailable] = useState(false);
  const [notAvailableLang, setNotAvailableLang] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);

  const getInitialPage = () => {
    const params = new URLSearchParams(location.search);
    const p = params.get('page');
    if (p !== null) {
      const parsed = parseInt(p, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return 0;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const p = params.get('page');
    if (p !== null) {
      const parsed = parseInt(p, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        setCurrentPage(parsed);
      }
    }
  }, [location.search]);
  const [isAudioComplete, setIsAudioComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);

  const handleZoomIn = () => setZoomScale(prev => Math.min(Number((prev + 0.15).toFixed(2)), 2.0));
  const handleZoomOut = () => setZoomScale(prev => Math.max(Number((prev - 0.15).toFixed(2)), 0.6));
  const handleZoomReset = () => setZoomScale(1.0);

  const renderZoomControls = (extraClasses = "") => (
    <div className={`flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-1 ${extraClasses}`}>
      <button
        onClick={handleZoomOut}
        disabled={zoomScale <= 0.6}
        className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 disabled:opacity-30 transition-all cursor-pointer"
        title="Zoom Out (-)"
      >
        <ZoomOut size={15} />
      </button>
      <button
        onClick={handleZoomReset}
        className="px-2 text-[10px] font-black text-slate-700 hover:text-health-green transition-all cursor-pointer min-w-[40px] text-center select-none"
        title="Reset Zoom (100%)"
      >
        {Math.round(zoomScale * 100)}%
      </button>
      <button
        onClick={handleZoomIn}
        disabled={zoomScale >= 2.0}
        className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 disabled:opacity-30 transition-all cursor-pointer"
        title="Zoom In (+)"
      >
        <ZoomIn size={15} />
      </button>
    </div>
  );
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);
  const [loading, setLoading] = useState(true);

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [pendingNavOnFeedback, setPendingNavOnFeedback] = useState(null);
  const [showFreeLimitModal, setShowFreeLimitModal] = useState(false);

  useEffect(() => {
    const checkFreeLimit = async () => {
      // Only run after book is loaded and isPaid is definitely set
      if (!id || !book || typeof book.isPaid === 'undefined') return;
      // If book is NOT paid, no check needed
      if (!book.isPaid) return;

      try {
        // Use localStorage first for immediate check (no async delay)
        const storedPlan = localStorage.getItem('hs_user_plan_name') || '';
        const isPaidMember = storedPlan && !storedPlan.toLowerCase().includes('free');
        // If already known to be a paid member, skip API call
        if (isPaidMember) return;

        // Confirm with API
        const res = await memberApi.getProfile();
        const planName = res?.profile?.subscription?.plan_name || res?.profile?.subscription?.badge || storedPlan || 'Free Sakhi';
        // Save to localStorage for next time
        if (planName) localStorage.setItem('hs_user_plan_name', planName);
        const isFreeUser = !planName || planName.toLowerCase().includes('free');

        if (isFreeUser) {
          setShowFreeLimitModal(true);
        }
      } catch (err) {
        console.error('Error checking free book limit in BookScreen:', err);
      }
    };
    checkFreeLimit();
  }, [id, book]);

  // Translation state — Gemini se description translate karne ke liye
  const [translatedDesc, setTranslatedDesc] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // PDF page content translation cache: key = `${pageNum}_${langCode}` -> translated text
  const [translatedPageCache, setTranslatedPageCache] = useState({});
  const translatedPageCacheRef = useRef({}); // Mirror ref for stale-closure-free reads inside async loops
  const [isTranslatingPage, setIsTranslatingPage] = useState(false);
  const pdfDocRef = useRef(null); // pdfjs document reference for text extraction

  const { t, langCode, setLanguage } = useLanguage();

  // New State for Multi-language support
  const [selectedLang, setSelectedLang] = useState(languageMap[0]);

  const availableLanguages = useMemo(() => {
    if (!availableLangCodes || availableLangCodes.size === 0) return languageMap;
    const filtered = languageMap.filter(lang => availableLangCodes.has(lang.code.toLowerCase()));
    return filtered.length > 0 ? filtered : languageMap;
  }, [availableLangCodes]);

  useEffect(() => {
    if (availableLanguages.length > 0 && !availableLanguages.some(l => l.code === selectedLang.code)) {
      setSelectedLang(availableLanguages[0]);
    }
  }, [availableLanguages, selectedLang.code]);

  const prevLangPagingRef = useRef(selectedLang.code);
  const { speak, stop, pause, seek, isPlaying, isPaused, isLoadingTts, currentTime, duration } = useTTS();

  const currentGlobalLang = useMemo(() => {
    return languageMap.find(lang => lang.code === langCode) || languageMap[0];
  }, [langCode]);

  useEffect(() => {
    if (currentGlobalLang) {
      setSelectedLang(currentGlobalLang);
    }
  }, [currentGlobalLang]);

  const [isMobile, setIsMobile] = useState(false);
  const [pageWidth, setPageWidth] = useState(420);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      const windowWidth = window.innerWidth;
      if (mobile) {
        // Mobile layout: single page
        const availableWidth = Math.min(windowWidth - 48, 480);
        setPageWidth(availableWidth);
      } else {
        // Desktop layout: double page spread
        const availableMainWidth = windowWidth - 380 - 120; // Sidebar (380) + padding & controls buffer
        let maxContainerWidth = 896; // lg:max-w-4xl
        if (windowWidth >= 1536) maxContainerWidth = 1280; // 2xl:max-w-7xl
        else if (windowWidth >= 1280) maxContainerWidth = 1152; // xl:max-w-6xl
        else if (windowWidth >= 1024) maxContainerWidth = 1024; // lg:max-w-5xl

        const containerWidth = Math.min(availableMainWidth, maxContainerWidth);
        const singlePageWidth = Math.floor(containerWidth / 2) - 24; // 24px padding buffer
        setPageWidth(singlePageWidth);
      }

      if (!mobile) {
        setCurrentPage(prev => (prev % 2 === 0 ? prev : Math.max(0, prev - 1)));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [currentPage, selectedLang.code, id]);

  // Keep ref in sync with state for stale-closure-free reads inside async loops
  useEffect(() => {
    translatedPageCacheRef.current = translatedPageCache;
  }, [translatedPageCache]);

  // ── PDF Page Content Translation via pdfjs + MyMemory/Gemini ──
  // Visible pages + prefetch aage ke pages translate karo (skipped if language-specific PDF exists)
  useEffect(() => {
    if (!book?.isPdf || !book?.pdfUrl || book?.isLanguageSpecificPdf) return;

    let isCancelled = false;

    const translatePages = async () => {
      const maxPages = pdfNumPages || 0;
      if (maxPages === 0) return;

      // Build priority list: current visible pages first, then prefetch next 6
      const priorityPages = [];

      // Current spread (left + right pages)
      if (currentPage + 1 <= maxPages) priorityPages.push(currentPage + 1);
      if (!isMobile && currentPage + 2 <= maxPages) priorityPages.push(currentPage + 2);

      // Pre-fetch next 6 pages so navigation feels instant
      const prefetchStart = isMobile ? currentPage + 2 : currentPage + 3;
      for (let i = 0; i < 6; i++) {
        const p = prefetchStart + i;
        if (p <= maxPages) priorityPages.push(p);
      }

      // Load PDF document once
      if (!pdfDocRef.current) {
        try {
          pdfDocRef.current = await pdfjs.getDocument(book.pdfUrl).promise;
        } catch (err) {
          console.error('[BookScreen] Failed to load PDF doc for translation:', err);
          return;
        }
      }

      setIsTranslatingPage(true);

      for (const pageNum of priorityPages) {
        if (isCancelled) break;

        const cacheKey = `${pageNum}_${selectedLang.code}`;
        // Use ref (not state) to avoid stale closure cache-miss bug
        if (translatedPageCacheRef.current[cacheKey]) continue;

        try {
          if (isCancelled) break;
          const pdfPage = await pdfDocRef.current.getPage(pageNum);

          if (isCancelled) break;
          const textContent = await pdfPage.getTextContent();

          if (isCancelled) break;
          const rawText = textContent.items
            .map(item => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (!rawText || rawText.length < 20) {
            // Mark as done so we don't retry empty pages
            translatedPageCacheRef.current[cacheKey] = ' ';
            setTranslatedPageCache(prev => ({ ...prev, [cacheKey]: ' ' }));
            continue;
          }

          if (isCancelled) break;

          let translatedText = rawText;
          if (selectedLang.code !== 'en') {
            const res = await i18nApi.translateTexts([rawText], selectedLang.code);
            if (res?.success && res.translations?.[0]) {
              translatedText = res.translations[0];
            }
          }

          // Update both ref and state immediately
          translatedPageCacheRef.current[cacheKey] = translatedText;
          setTranslatedPageCache(prev => ({ ...prev, [cacheKey]: translatedText }));

        } catch (err) {
          console.error(`[BookScreen] Page ${pageNum} translation failed:`, err);
          // Mark failed pages with original text so we don't retry infinitely
          translatedPageCacheRef.current[cacheKey] = `[Translation error — page ${pageNum}]`;
        }
      }

      if (!isCancelled) setIsTranslatingPage(false);
    };

    translatePages();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedLang.code, book?.pdfUrl, pdfNumPages, isMobile, book?.isLanguageSpecificPdf]);

  // ── DOCX / Word Page Content Translation via MyMemory/Gemini ──
  useEffect(() => {
    if (!book?.isDoc || !book?.pages || book?.pages.length === 0 || book?.isLanguageSpecificPdf) return;

    // Smart bidirectional source language detection from actual content text
    const sampleText = (book.pages[0] || '').replace(/<[^>]*>/g, '').trim();
    const isDevanagari = /[\u0900-\u097F]/.test(sampleText) || /[\u0900-\u097F]/.test(book.title || '');
    
    let srcLang = isDevanagari ? 'hi' : 'en';
    const tgtLang = (selectedLang.code || 'en').toLowerCase();
    if (srcLang === tgtLang) return;

    let isCancelled = false;

    const translateDocxPages = async () => {
      const maxPages = book.pages.length;
      const priorityPages = [];
      if (currentPage < maxPages) priorityPages.push(currentPage);
      if (!isMobile && currentPage + 1 < maxPages) priorityPages.push(currentPage + 1);

      for (let i = 0; i < 4; i++) {
        const p = (isMobile ? currentPage + 1 : currentPage + 2) + i;
        if (p < maxPages) priorityPages.push(p);
      }

      setIsTranslatingPage(true);

      for (const pageIdx of priorityPages) {
        if (isCancelled) break;
        const cacheKey = `doc_${pageIdx}_${selectedLang.code}`;
        if (translatedPageCacheRef.current[cacheKey]) continue;

        const rawHtml = book.pages[pageIdx];
        if (!rawHtml || !rawHtml.trim()) continue;

        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(rawHtml, 'text/html');
          const textNodes = [];
          const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
              textNodes.push(node);
            } else {
              node.childNodes.forEach(walk);
            }
          };
          walk(doc.body);

          const textsToTranslate = textNodes.map(n => n.textContent);
          if (textsToTranslate.length === 0) continue;

          const res = await i18nApi.translateTexts(textsToTranslate, selectedLang.code);
          if (!isCancelled && res?.success && Array.isArray(res.translations)) {
            textNodes.forEach((node, idx) => {
              if (res.translations[idx]) {
                node.textContent = res.translations[idx];
              }
            });
            const translatedHtml = doc.body.innerHTML;
            translatedPageCacheRef.current[cacheKey] = translatedHtml;
            setTranslatedPageCache(prev => ({ ...prev, [cacheKey]: translatedHtml }));
          }
        } catch (err) {
          console.error(`[BookScreen] DOCX page ${pageIdx} translation error:`, err);
        }
      }

      if (!isCancelled) setIsTranslatingPage(false);
    };

    translateDocxPages();
    return () => { isCancelled = true; };
  }, [book?.isDoc, book?.pages, selectedLang.code, currentPage, isMobile, book?.languageCode, book?.isLanguageSpecificPdf, book?.title]);

  const cleanSakhiReflectionHtml = (html) => {
    if (!html) return '';
    if (typeof html !== 'string') return html;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const allElements = Array.from(doc.body.querySelectorAll('*'));
      allElements.forEach(el => {
        const text = (el.textContent || '').trim().toLowerCase();
        if (
          text.includes('sakhi reflection') || 
          text.includes('sakhi-reflection') || 
          text.includes('सखी रिफ्लेक्शन') ||
          (text.includes('reflection') && text.includes('sakhi'))
        ) {
          el.remove();
        }
      });
      return doc.body.innerHTML;
    } catch (err) {
      return html;
    }
  };

  const getDocPageHtml = (pageIdx) => {
    if (pageIdx === undefined || pageIdx === null) return '';
    const cacheKey = `doc_${pageIdx}_${selectedLang.code}`;
    const rawHtml = translatedPageCache[cacheKey] || pages[pageIdx] || '';
    return cleanSakhiReflectionHtml(rawHtml);
  };

  // Reset to first spread when language changes and clear all cached translations
  useEffect(() => {
    if (prevLangPagingRef.current !== selectedLang.code) {
      prevLangPagingRef.current = selectedLang.code;
      setCurrentPage(0);
      // Clear page translation cache so new language re-translates all pages
      translatedPageCacheRef.current = {};
      setTranslatedPageCache({});
      // Reset PDF doc ref so translation loop re-acquires it for the new session
      pdfDocRef.current = null;
    }
  }, [selectedLang.code]);


  useEffect(() => {
    if (!book) return;
    // English mein koi translation nahi chahiye
    if (selectedLang.code === 'en') {
      setTranslatedDesc(null);
      return;
    }
    const rawDesc = book.desc || book.description || '';
    if (!rawDesc) return;

    let cancelled = false;
    const translateDescription = async () => {
      setIsTranslating(true);
      try {
        const res = await i18nApi.translateTexts([rawDesc], selectedLang.code);
        if (!cancelled && res?.success && res.translations?.[0]) {
          setTranslatedDesc(res.translations[0]);
        }
      } catch (err) {
        console.error('[BookScreen] Description translation failed:', err);
        if (!cancelled) setTranslatedDesc(null);
      } finally {
        if (!cancelled) setIsTranslating(false);
      }
    };
    translateDescription();
    return () => { cancelled = true; };
  }, [book?.id, selectedLang.code, book?.desc, book?.description]);

  useEffect(() => {
    prevLangPagingRef.current = selectedLang.code;
    setCurrentPage(0);
  }, [id]);

  // Load book metadata and content
  useEffect(() => {
    setLoading(true);
    translatedPageCacheRef.current = {};
    setTranslatedPageCache({});
    setTranslatedDesc(null);
    const loadAdminBook = async () => {
      try {
        let asset = null;

        // Try DB first if it is UUID
        const isUuid = id && id.length > 5;
        if (isUuid) {
          try {
            const res = await contentAssetApi.getAssetById(id);
            if (res && res.success && res.data) {
              asset = res.data;
            }
          } catch (dbErr) {
            console.warn('[BookScreen] Failed to load book from DB, checking static...', dbErr);
          }
        }

        // Fallback: Fetch local static book JSON
        if (!asset) {
          try {
            const currentLang = (selectedLang.code || 'en').toLowerCase();
            let staticUrl = `/books/book_${id}_${currentLang}.json`;
            let staticRes = await fetch(staticUrl);
            if (!staticRes.ok && currentLang !== 'en') {
              staticUrl = `/books/book_${id}_en.json`;
              staticRes = await fetch(staticUrl);
            }

            if (staticRes.ok) {
              const staticData = await staticRes.json();
              if (staticData && staticData.title) {
                asset = {
                  id: String(id),
                  title: staticData.title,
                  category: staticData.category || 'Women Health',
                  languageCode: currentLang,
                  language: currentLang === 'hi' ? 'Hindi' : (currentLang === 'mr' ? 'Marathi' : 'English'),
                  description: staticData.desc || staticData.description || '',
                  coverUrl: staticData.image || staticData.coverUrl || getStaticCoverUrl(id),
                  chapters: staticData.chapters || [],
                  pages: staticData.pages || [],
                  isStaticJson: true
                };
              }
            }
          } catch (staticErr) {
            console.error('[BookScreen] Static book loading failed:', staticErr);
          }
        }

        if (asset) {
          setBaseBookAsset(asset);

          if (asset.isStaticJson) {
            setBook({
              id: asset.id,
              title: asset.title,
              author: 'HealthSakhi Expert',
              category: asset.category || 'Women Health',
              reads: '1.2k',
              desc: asset.description,
              description: asset.description,
              image: asset.coverUrl,
              isPdf: false,
              isDoc: false,
              pages: asset.pages || [],
              pdfUrl: null,
              languageCode: asset.languageCode || 'en',
              language: asset.language || 'English',
              chapters: asset.chapters || [],
              questions: [
                { question: 'Did you find the wellness strategies discussed in this book helpful?', options: ['Very helpful', 'Somewhat helpful', 'Not sure', 'Need more guidance'], correct: 0 },
                { question: 'How do you plan to implement these insights?', options: ['Integrate into daily habits', 'Share with family', 'Read again', 'No specific plan'], correct: 0 }
              ]
            });
            setLoading(false);
            return;
          }

          // Parse [hs_cover] tag to extract real cover image
          const rawDesc = asset.description || '';
          const isPaidAsset = rawDesc.includes('[hs_access] Paid');
          const parts = rawDesc.split('[hs_cover]');
          const cleanDesc = parts[0] ? parts[0].trim() : 'A handpicked health and wellness guide curated for you by the health sakhi m.';
          const coverUrl = parts[1] ? parts[1].split('[hs_chapters]')[0].trim() : null;
          const resolvedPdf = getMediaUrl(asset.mediaUrl) || '/books/HealthSakhi_Complete_ThreeParts (2).pdf';
          const isDoc = resolvedPdf && (resolvedPdf.toLowerCase().includes('.doc') || resolvedPdf.toLowerCase().includes('.docx'));

          let docPages = null;
          if (isDoc) {
            docPages = await parseDocxToPages(resolvedPdf);
          }

          setBook({
            id: asset.id,
            title: asset.title,
            author: 'HealthSakhi Expert',
            category: asset.category || 'Women Health',
            reads: '1.2k',
            desc: cleanDesc,
            description: cleanDesc,
            image: coverUrl || getStaticCoverUrl(asset.id),
            isPdf: !isDoc,
            isDoc: isDoc,
            isPaid: isPaidAsset,
            pages: docPages || [],
            pdfUrl: resolvedPdf,
            languageCode: asset.languageCode || 'en',
            language: asset.language || 'English',
            questions: [
              { question: 'Did you find the wellness strategies discussed in this book helpful?', options: ['Very helpful', 'Somewhat helpful', 'Not sure', 'Need more guidance'], correct: 0 },
              { question: 'How do you plan to implement these insights?', options: ['Integrate into daily habits', 'Share with family', 'Read again', 'No specific plan'], correct: 0 }
            ]
          });
        }
      } catch (err) {
        console.error('Failed to load book:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAdminBook();
    // Only reload when book ID changes — language change must NOT reload the book
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Dynamic language PDF resolution: If an admin uploaded a specific PDF for the selected language, switch to it directly!
  useEffect(() => {
    if (!baseBookAsset || baseBookAsset.isStaticJson) return;
    const findLanguagePdf = async () => {
      try {
        const res = await contentAssetApi.getPublicAssets({ type: 'Book', status: 'Published' });
        if (res && res.success && Array.isArray(res.data)) {
          const normalizeKey = (str) => {
            if (!str) return '';
            const slug = str.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '');
            return slug || 'book-asset';
          };

          const targetGroupKey = (baseBookAsset.groupKey && baseBookAsset.groupKey.trim() !== '')
            ? baseBookAsset.groupKey.trim()
            : normalizeKey(baseBookAsset.title);

          const groupVariants = res.data.filter(a => {
            const aGroupKey = (a.groupKey && a.groupKey.trim() !== '') ? a.groupKey.trim() : normalizeKey(a.title);
            return (aGroupKey && targetGroupKey && aGroupKey === targetGroupKey) ||
                   (a.title && baseBookAsset.title && a.title.trim().toLowerCase() === baseBookAsset.title.trim().toLowerCase()) ||
                   (a.id === baseBookAsset.id);
          });

          const langCodes = new Set();
          if (baseBookAsset.languageCode) langCodes.add(baseBookAsset.languageCode.toLowerCase());
          if (baseBookAsset.language) {
            const l = baseBookAsset.language.toLowerCase();
            if (l.includes('english') || l.includes('en')) langCodes.add('en');
            if (l.includes('hindi') || l.includes('hi') || l.includes('हिन्दी')) langCodes.add('hi');
            if (l.includes('marathi') || l.includes('mr') || l.includes('मराठी')) langCodes.add('mr');
          }

          groupVariants.forEach(v => {
            if (v.languageCode) langCodes.add(v.languageCode.toLowerCase());
            if (v.language) {
              const l = v.language.toLowerCase();
              if (l.includes('english') || l.includes('en')) langCodes.add('en');
              if (l.includes('hindi') || l.includes('hi') || l.includes('हिन्दी')) langCodes.add('hi');
              if (l.includes('marathi') || l.includes('mr') || l.includes('मराठी')) langCodes.add('mr');
            }
          });

          if (langCodes.size === 0) langCodes.add('en');
          setAvailableLangCodes(langCodes);

          const match = groupVariants.find(a => {
            const isLangMatch =
              (a.languageCode && selectedLang.code && a.languageCode.toLowerCase() === selectedLang.code.toLowerCase()) ||
              (a.language && selectedLang.label && a.language.toLowerCase().includes(selectedLang.label.toLowerCase())) ||
              (a.language && selectedLang.native && a.language.toLowerCase().includes(selectedLang.native.toLowerCase())) ||
              (a.language && selectedLang.code && (a.language.toLowerCase() === selectedLang.code.toLowerCase() || a.language.toLowerCase().startsWith(selectedLang.code.toLowerCase() + '-')));

            return isLangMatch;
          });

          if (match && match.mediaUrl) {
            setIsNotAvailable(false);
            const matchResolved = getMediaUrl(match.mediaUrl);
            const isMatchDoc = matchResolved && (matchResolved.toLowerCase().includes('.doc') || matchResolved.toLowerCase().includes('.docx'));
            let matchDocPages = null;
            if (isMatchDoc) {
              matchDocPages = await parseDocxToPages(matchResolved);
            }
            setBook(prev => prev ? {
              ...prev,
              id: match.id,
              title: match.title,
              pdfUrl: matchResolved,
              isPdf: !isMatchDoc,
              isDoc: isMatchDoc,
              pages: matchDocPages || prev.pages || [],
              isLanguageSpecificPdf: true
            } : null);
            return;
          } else {
            // Check if baseBookAsset itself matches selectedLang or lists the selected language
            const isBaseMatch = (baseBookAsset.languageCode && selectedLang.code && baseBookAsset.languageCode.toLowerCase() === selectedLang.code.toLowerCase()) ||
              (selectedLang.code === 'en' && (baseBookAsset.languageCode === 'en' || (baseBookAsset.language && baseBookAsset.language.toLowerCase().includes('english')))) ||
              (baseBookAsset.language && selectedLang.label && baseBookAsset.language.toLowerCase().includes(selectedLang.label.toLowerCase())) ||
              (baseBookAsset.language && selectedLang.native && baseBookAsset.language.toLowerCase().includes(selectedLang.native.toLowerCase())) ||
              (baseBookAsset.language && selectedLang.code && baseBookAsset.language.toLowerCase() === selectedLang.code.toLowerCase());

            if (isBaseMatch) {
              setIsNotAvailable(false);
              const baseResolved = getMediaUrl(baseBookAsset.mediaUrl) || '/books/HealthSakhi_Complete_ThreeParts (2).pdf';
              const isBaseDoc = baseResolved && (baseResolved.toLowerCase().includes('.doc') || baseResolved.toLowerCase().includes('.docx'));
              let baseDocPages = null;
              if (isBaseDoc) {
                baseDocPages = await parseDocxToPages(baseResolved);
              }
              setBook(prev => prev ? {
                ...prev,
                pdfUrl: baseResolved,
                isPdf: !isBaseDoc,
                isDoc: isBaseDoc,
                pages: baseDocPages || prev.pages || [],
                isLanguageSpecificPdf: false
              } : null);
              return;
            } else {
              // Not available in this language!
              setIsNotAvailable(true);
              setNotAvailableLang(selectedLang.label || selectedLang.native || selectedLang.code);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to resolve language-specific PDF asset:', err);
      }
    };
    findLanguagePdf();
  }, [selectedLang.code, baseBookAsset]);

  const pages = useMemo(() => {
    if (book?.isPdf) {
      return Array.from({ length: pdfNumPages || 0 });
    }
    return book?.pages || [];
  }, [book, pdfNumPages]);

  const totalPages = pages.length;
  const passingScore = Math.ceil((book?.questions?.length || 2) * 0.6);

  const chapters = useMemo(() => {
    if (!book) return [];
    if (!book.isPdf && Array.isArray(book.chapters) && book.chapters.length > 0 && typeof book.chapters[0] === 'object' && 'startPage' in book.chapters[0]) {
      return book.chapters.map(c => ({
        title: c.title,
        startPage: c.startPage,
        endPage: c.endPage
      }));
    }
    const totalP = book.isPdf ? pdfNumPages : pages.length;
    const rawChapters = book.chapters || BOOKS_DATA[id]?.chapters || [];
    const dynTitles = generateDynamicChapters(book.title, book.category, rawChapters, book.id);

    if (!totalP) {
      return dynTitles.map((t, idx) => ({ title: typeof t === 'string' ? t : (t.title || `Chapter ${idx + 1}`), startPage: 0, endPage: 0 }));
    }

    const pSize = Math.max(1, Math.floor(totalP / dynTitles.length));
    return dynTitles.map((t, idx) => {
      const explicitStart = (typeof t === 'object' && t.page) ? Math.max(0, t.page - 1) : (idx * pSize);
      return {
        title: typeof t === 'string' ? t : (t.title || `Chapter ${idx + 1}`),
        startPage: explicitStart,
        endPage: idx === dynTitles.length - 1 ? totalP - 1 : ((idx + 1) * pSize) - 1
      };
    });
  }, [book, pdfNumPages, pages.length, id]);

  const getTranslatedChapter = (chapterIdx) => {
    const ch = chapters[chapterIdx];
    if (!ch) return "Healing Wisdom";
    return typeof ch === 'string' ? ch : ch.title;
  };

  const getTranslatedDesc = () => {
    // Gemini se translated version available hai to use karo
    if (translatedDesc) return translatedDesc;
    return book?.desc || book?.description || 'A premium wellness guide...';
  };

  const getTranslatedText = (pageIdx) => {
    const pageHtml = pages[pageIdx];
    if (!pageHtml) return "";
    return pageHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const getPdfPageTextForSpeech = () => {
    const leftPageNum = currentPage + 1;
    const rightPageNum = currentPage + 2;
    const lang = selectedLang.code;

    let leftText = translatedPageCache[`${leftPageNum}_${lang}`] || translatedPageCache[`${leftPageNum}_en`] || "";
    let rightText = "";
    if (!isMobile && rightPageNum <= (pdfNumPages || 0)) {
      rightText = translatedPageCache[`${rightPageNum}_${lang}`] || translatedPageCache[`${rightPageNum}_en`] || "";
    }

    const combined = (leftText + " " + rightText).trim();
    if (combined && combined.length > 5 && !combined.startsWith('[Translation error')) {
      return combined;
    }

    // Fallback: extract plain text from visible DOM content if cache is pending
    try {
      // 1. Try react-pdf text layer (for PDF books)
      const pdfTextLayers = document.querySelectorAll('.react-pdf__Page__textContent');
      if (pdfTextLayers && pdfTextLayers.length > 0) {
        const pdfTexts = Array.from(pdfTextLayers).map(el => el.textContent || '').join(' ').replace(/\s+/g, ' ').trim();
        if (pdfTexts && pdfTexts.length > 10) return pdfTexts;
      }
      // 2. Try DOCX book-content (for DOCX books)
      const activeContainers = document.querySelectorAll('.book-content');
      if (activeContainers && activeContainers.length > 0) {
        const domTexts = Array.from(activeContainers).map(el => el.textContent || '').join(' ').trim();
        if (domTexts && domTexts.length > 10) return domTexts;
      }
    } catch { /* ignore DOM errors */ }

    return combined;
  };

  // Persistence & Deep Linking: Load progress or jump to requested page/chapter on mount
  useEffect(() => {
    if (!id || !totalPages) return;

    // Check URL query parameters first (e.g. ?page=5 or ?chapter=2)
    const searchParams = new URLSearchParams(location.search);
    const pageParam = searchParams.get('page');
    const chapterParam = searchParams.get('chapter');

    if (pageParam !== null) {
      const p = parseInt(pageParam);
      if (!isNaN(p)) {
        setCurrentPage(Math.max(0, Math.min(p, totalPages - 1)));
        setIsReading(true);
        return;
      }
    }

    if (chapterParam !== null && chapters && chapters.length > 0) {
      const chIdx = parseInt(chapterParam) - 1;
      if (!isNaN(chIdx) && chapters[chIdx]) {
        const start = chapters[chIdx].startPage || 0;
        setCurrentPage(Math.max(0, Math.min(start, totalPages - 1)));
        setIsReading(true);
        return;
      }
    }

    const saved = localStorage.getItem(`progress_book_${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const page = parseInt(parsed.page);
        const time = parseFloat(parsed.time);
        if (!isNaN(page)) {
          setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
        }
        if (audioRef.current && !isNaN(time)) audioRef.current.currentTime = time;
        setIsReading(true);
      } catch (e) { /* ignore parse errors */ }
    }
  }, [id, totalPages, location.search, chapters]);

  // Stop TTS when page changes or language changes
  useEffect(() => {
    stop();
  }, [currentPage, selectedLang, stop]);

  // Persistence: Save progress on change + Time Tracking
  useEffect(() => {
    if (!id || !totalPages) return;
    let startTime = Date.now();

    const saveProgress = () => {
      if (isReading) {
        const timeSpentThisSession = Math.floor((Date.now() - startTime) / 1000);

        const progress = {
          page: currentPage,
          total: totalPages,
          time: audioRef.current ? audioRef.current.currentTime : 0
        };
        localStorage.setItem(`progress_book_${id}`, JSON.stringify(progress));

        const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        const existingData = userProgress[id] || { percent: 0, time: 0 };

        userProgress[id] = {
          percent: Math.min(100, Math.round(((currentPage + (isMobile ? 1 : 2)) / totalPages) * 100)),
          lastRead: new Date().toISOString(),
          time: (existingData.time || 0) + timeSpentThisSession
        };
        localStorage.setItem('userProgress', JSON.stringify(userProgress));

        startTime = Date.now();
      }
    };

    const interval = setInterval(saveProgress, 10000); // Auto-save every 10 seconds

    return () => {
      saveProgress(); // Final save on unmount
      clearInterval(interval);
    };
  }, [currentPage, isReading, id, totalPages, isMobile]);

  const handleAudioUpdate = (e) => {
    const progress = (e.target.currentTime / e.target.duration) * 100;
    if (progress >= 98) setIsAudioComplete(true);

    if (Math.floor(e.target.currentTime) % 5 === 0 && id) {
      const saved = JSON.parse(localStorage.getItem(`progress_book_${id}`) || '{}');
      localStorage.setItem(`progress_book_${id}`, JSON.stringify({ ...saved, time: e.target.currentTime }));
    }
  };

  const handleAnswer = (qIndex, oIndex) => {
    if (quizScore === null) setUserAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const calculateScore = () => {
    if (!book) return;
    let score = 0;
    (book.questions || []).forEach((q, i) => {
      if (userAnswers[i] === q.correct) score++;
    });
    setQuizScore(score);

    if (score >= passingScore) {
      const completedBooks = JSON.parse(localStorage.getItem('completedBooks') || '[]');
      if (!completedBooks.includes(book.id)) {
        completedBooks.push(book.id);
        localStorage.setItem('completedBooks', JSON.stringify(completedBooks));
      }

      const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
      userProgress[book.id] = {
        ...(userProgress[book.id] || {}),
        percent: 100,
        lastRead: new Date().toISOString()
      };
      localStorage.setItem('userProgress', JSON.stringify(userProgress));

      const bookRewards = JSON.parse(localStorage.getItem('hs_book_rewards') || '[]');
      const alreadyRewarded = bookRewards.some(r => r.bookId === book.id);
      if (!alreadyRewarded) {
        bookRewards.push({
          bookId: book.id,
          bookTitle: book.title,
          points: 50,
          earnedAt: new Date().toISOString()
        });
        localStorage.setItem('hs_book_rewards', JSON.stringify(bookRewards));
        window.dispatchEvent(new Event('hs_balance_update'));
      }

      setTimeout(() => {
        setShowReward(true);
      }, 800);
    }
  };

  // 3D Flipping Calculations
  const desktopLeftStaticIdx = isFlipping
    ? (flipDirection === 'next' ? currentPage : currentPage - 2)
    : currentPage;
  const desktopRightStaticIdx = isFlipping
    ? (flipDirection === 'next' ? currentPage + 3 : currentPage + 1)
    : currentPage + 1;
  const desktopFlipFrontIdx = flipDirection === 'next' ? currentPage + 1 : currentPage;
  const desktopFlipBackIdx = flipDirection === 'next' ? currentPage + 2 : currentPage - 1;

  const mobileStaticPageIdx = isFlipping
    ? (flipDirection === 'next' ? currentPage + 1 : currentPage - 1)
    : currentPage;
  const mobileFlipFrontPageIdx = currentPage;
  const mobileFlipBackPageIdx = flipDirection === 'next' ? currentPage + 1 : currentPage - 1;

  const readerCopy = getReaderCopy(selectedLang.code);
  const readPercent = pages.length
    ? Math.min(100, Math.round(((currentPage + (isMobile ? 1 : 2)) / pages.length) * 100))
    : 0;

  const displayPageEnd = pages.length ? Math.min(currentPage + (isMobile ? 1 : 2), pages.length) : 0;
  const minsLeft = estimateMinutesLeft(pages, currentPage);
  const wellnessKey = getWellnessLevel(readPercent);
  const wellnessLabel = readerCopy.levels[wellnessKey];

  const activeChapterIndex = useMemo(() => {
    if (!chapters || !chapters.length) return 0;
    const idx = chapters.findIndex(ch => currentPage >= ch.startPage && currentPage <= ch.endPage);
    return idx !== -1 ? idx : 0;
  }, [currentPage, chapters]);

  const tipIndex = Math.floor(currentPage / 2) + (book?.id || 0);

  const isShortPage = (html) => {
    if (!html) return false;
    const len = stripHtml(html).trim().length;
    return len > 0 && len < 380;
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const SakhiNote = () => null;

  // ── renderBookPage: PDF book ke page ko translate ke saath render karo ──
  // - English: PDF <Page> dikhao (normal)
  // - Non-English + translated: Translated text DIRECTLY page container mein (PDF ki jagah)
  // - Non-English + translating: Faded PDF + center loading spinner
  const renderBookPage = (pageNum, width) => {
    const isDocFile = book?.pdfUrl && (book.pdfUrl.toLowerCase().includes('.doc') || book.pdfUrl.toLowerCase().includes('.docx'));
    if (isDocFile) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl overflow-hidden" style={{ minHeight: '350px' }}>
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(book.pdfUrl)}&embedded=true`}
            className="w-full h-full min-h-[350px] rounded-lg border border-slate-200 bg-white"
            title="Word Document Viewer"
          />
        </div>
      );
    }

    const scaledWidth = width ? width * zoomScale : undefined;

    if (selectedLang.code !== 'en' && !book?.isLanguageSpecificPdf) {
      const cacheKey = `${pageNum}_${selectedLang.code}`;
      const translated = translatedPageCache[cacheKey];
      if (translated) {
        // Translation ready — PDF page blurred background + translated text overlay
        return (
          <div
            className="relative overflow-y-auto w-full h-full"
            style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', minHeight: 0 }}
          >
            {/* Blurred PDF as background — layout preserved */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ filter: 'blur(3px)', opacity: 0.08 }}>
              <Page
                pageNumber={pageNum}
                width={scaledWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="mx-auto"
              />
            </div>
            {/* Translated text overlay */}
            <div
              className="absolute inset-0 overflow-y-auto px-5 py-5"
              style={{
                direction: ['ar', 'ur'].includes(selectedLang.code) ? 'rtl' : 'ltr',
                fontSize: `${zoomScale * 100}%`
              }}
            >
              <p
                className="text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] text-slate-700 leading-[2.0] font-medium whitespace-pre-wrap text-justify"
                style={{ fontFamily: selectedLang.code === 'hi' || selectedLang.code === 'mr' ? "'Noto Sans Devanagari', 'Mangal', sans-serif" : 'inherit' }}
              >
                {translated}
              </p>
            </div>
          </div>
        );
      }
      // Still translating — show PDF with loading overlay
      return (
        <div
          className="relative flex items-center justify-center overflow-hidden w-full h-full"
          style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', minHeight: 0 }}
        >
          <Page
            pageNumber={pageNum}
            width={scaledWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mx-auto opacity-25"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
            <span className="w-8 h-8 border-[3px] border-health-green/25 border-t-health-green rounded-full animate-spin" />
            <span className="text-[9px] font-black text-health-green uppercase tracking-widest text-center px-6">
              {selectedLang.native} mein translate ho raha hai...
            </span>
          </div>
        </div>
      );
    }
    // English — normal PDF rendering
    return (
      <div
        className="flex items-center justify-center overflow-auto w-full h-full"
        style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', minHeight: 0 }}
      >
        <Page
          pageNumber={pageNum}
          width={scaledWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="mx-auto"
        />
      </div>
    );
  };


  const jumpToChapter = (chapterIndex) => {
    if (!chapters?.[chapterIndex]) return;
    const start = chapters[chapterIndex].startPage;
    if (isMobile) {
      setCurrentPage(start);
    } else {
      const aligned = start % 2 === 0 ? start : Math.max(0, start - 1);
      setCurrentPage(aligned);
    }
  };

  const nextPage = () => {
    if (isFlipping) return;
    if (isMobile) {
      if (currentPage + 1 < pages.length) {
        setFlipDirection('next');
        setIsFlipping(true);
      }
    } else {
      if (currentPage + 2 < pages.length) {
        setFlipDirection('next');
        setIsFlipping(true);
      }
    }
  };

  const prevPage = () => {
    if (isFlipping) return;
    if (currentPage > 0) {
      setFlipDirection('prev');
      setIsFlipping(true);
    }
  };

  const handleFlipComplete = () => {
    if (flipDirection === 'next') {
      setCurrentPage(prev => prev + (isMobile ? 1 : 2));
    } else if (flipDirection === 'prev') {
      setCurrentPage(prev => Math.max(0, prev - (isMobile ? 1 : 2)));
    }
    setIsFlipping(false);
    setFlipDirection(null);
  };

  const isQuizUnlocked = isAudioComplete || currentPage + (isMobile ? 1 : 2) >= totalPages;

  const handleClaimBookReward = async () => {
    try {
      const bId = book?.id || book?._id || 'book_1';
      const bTitle = book?.title || 'Wellness Guide';

      const rewards = JSON.parse(localStorage.getItem('hs_book_rewards') || '[]');
      if (!rewards.some(r => String(r.bookId) === String(bId) || (r.bookTitle && r.bookTitle.toLowerCase().trim() === bTitle.toLowerCase().trim()))) {
        rewards.push({
          bookId: bId,
          bookTitle: bTitle,
          points: 100,
          earnedAt: new Date().toISOString()
        });
        localStorage.setItem('hs_book_rewards', JSON.stringify(rewards));
      }

      // Save to completedBooks array
      const completedList = JSON.parse(localStorage.getItem('completedBooks') || '[]');
      if (!completedList.includes(bId) && !completedList.includes(String(bId))) {
        completedList.push(bId);
        completedList.push(String(bId));
        localStorage.setItem('completedBooks', JSON.stringify(completedList));
      }

      // Save to userProgress array
      const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
      userProgress[bId] = { percent: 100, lastRead: new Date().toISOString() };
      localStorage.setItem('userProgress', JSON.stringify(userProgress));

      window.dispatchEvent(new Event('hs_balance_update'));

      try {
        await contentAssetApi.updateProgress(bId, { completed: true });
      } catch (e) {}

      alert('🎉 Congratulations! You completed this book and earned +100 Reward Coins! 🪙');
      navigate('/app/books');
    } catch (err) {
      console.error("Error claiming book reward:", err);
      navigate('/app/books');
    }
  };

  const chapterCount = useMemo(() => {
    return book?.chapters?.length || 0;
  }, [book]);

  // Returns true if user has read 2 or more pages
  const hasPagesRead = currentPage >= 2;

  // Handle Back to Library — show feedback if 2+ pages read
  const handleBackToLibrary = (destination) => {
    const dest = destination || (sessionStorage.getItem('hs_current_member') ? '/app/books' : '/');
    if (hasPagesRead && !feedbackSubmitted) {
      setPendingNavOnFeedback(dest);
      setShowFeedbackModal(true);
    } else {
      navigate(dest);
    }
  };

  const handleFeedbackSubmit = async () => {
    // Save feedback locally (backup fallback)
    const feedbackData = {
      bookId: id,
      bookTitle: book?.title || '',
      rating: feedbackRating,
      comment: feedbackText,
      memberName: user?.fullName || 'HealthSakhi Member',
      submittedAt: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('hs_book_feedback') || '[]');
    existing.push(feedbackData);
    localStorage.setItem('hs_book_feedback', JSON.stringify(existing));

    // Save to permanent Database via backend API
    try {
      await contentAssetApi.submitFeedback(id, feedbackRating, feedbackText);
    } catch (err) {
      console.warn('Could not save feedback to backend DB:', err);
    }

    setFeedbackSubmitted(true);
    setShowFeedbackModal(false);
    sessionStorage.removeItem('hs_feedback_pending');
    if (pendingNavOnFeedback === '/login') {
      // Complete the logout flow
      import('../../context/AuthContext').then(({ useAuth: _useAuth }) => { }).catch(() => { });
      // Navigate to login — the logout was already triggered by DashboardLayout
      navigate('/login');
    } else if (pendingNavOnFeedback) {
      navigate(pendingNavOnFeedback);
    }
  };

  const handleFeedbackSkip = () => {
    setShowFeedbackModal(false);
    sessionStorage.removeItem('hs_feedback_pending');
    if (pendingNavOnFeedback === '/login') {
      navigate('/login');
    } else if (pendingNavOnFeedback) {
      navigate(pendingNavOnFeedback);
    }
  };

  // Logout interception — agar user book par hai aur logout kare,
  // pehle feedback dikhao (logout event via sessionStorage flag)
  useEffect(() => {
    const handleLogoutIntercept = () => {
      if (hasPagesRead && !feedbackSubmitted) {
        // Logout ko hold karo — feedback pehle
        setPendingNavOnFeedback('/login');
        setShowFeedbackModal(true);
        // Logout session ko cancel karo by preventing default via event return
        sessionStorage.setItem('hs_feedback_pending', 'true');
      }
    };
    window.addEventListener('hs_logout_requested', handleLogoutIntercept);
    return () => window.removeEventListener('hs_logout_requested', handleLogoutIntercept);
  }, [hasPagesRead, feedbackSubmitted]);

  if (loading || !book) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-health-green"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">{t('books.loadingWellnessGuide', 'Loading wellness guide...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-left font-['Poppins']">

      {/* Top Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <button
          onClick={() => handleBackToLibrary()}
          className="flex items-center gap-2 text-slate-400 hover:text-health-green transition-colors font-black text-[10px] uppercase tracking-widest group"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-health-green/10 transition-all"><ArrowLeft size={16} /></div>
          {t('books.backToLibrary', 'Back to Library')}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-health-green to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-health-green/20">
            <BookOpen size={14} />
          </div>
          <span className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none truncate max-w-[40vw] sm:max-w-none">{book.title}</span>
        </div>
        <div className="flex justify-end min-w-[2.5rem] items-center">
          <button
            onClick={() => setShowMobileMenu(prev => !prev)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-health-green bg-white font-black text-[10px] uppercase tracking-wider transition-all hover:bg-emerald-50 hover:border-health-green/30"
          >
            <BookOpen size={13} />
            <span>{showMobileMenu ? t('books.close', 'Close') : t('books.menu', 'Menu')}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative pb-[80px]">

        {/* Sidebar Drawer Backdrop for Mobile */}
        {isMobile && showMobileMenu && (
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* Left Side: Book Details (Collapsible Sidebar Drawer on Mobile) */}
        <AnimatePresence>
          {(showMobileMenu || !isMobile) && (
            <motion.div
              initial={isMobile ? { x: '-100%' } : { x: 0 }}
              animate={{ x: 0 }}
              exit={isMobile ? { x: '-100%' } : undefined}
              transition={{ type: 'tween', duration: 0.25 }}
              className={`
                ${isMobile
                  ? 'fixed top-0 bottom-0 left-0 z-40 w-[290px] border-r border-slate-200 shadow-2xl bg-white flex flex-col pt-6 pb-6 px-4'
                  : 'w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0 lg:h-full min-h-0 pt-8 px-6 pb-6 lg:max-h-none'
                }
                overflow-y-auto no-scrollbar
              `}
            >
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="aspect-[3/4] w-36 mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-rose-200/50 border-4 border-white bg-slate-50 flex items-center justify-center">
                    <img src={book.image} alt={book.title} className="max-w-full max-h-full object-contain rounded-2xl" />
                  </div>
                  <div className="text-center">
                    <h1 className="text-sm font-black text-slate-800 leading-tight">{book.title}</h1>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('books.by', 'by')} {book.author}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[9px] font-black text-health-green uppercase tracking-widest">{book.category}</span>
                    </div>
                  </div>
                </div>

                {/* Language Selector Strip */}
                <div className="space-y-3 text-left">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t('books.selectLanguage', 'Select Language')}</h3>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLang(lang)}
                        className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedLang.code === lang.code
                          ? 'bg-health-green border-health-green text-white shadow-lg shadow-health-green/20 scale-105'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                          }`}
                      >
                        {lang.native}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 text-left">
                  <h3 className="text-[9px] font-black text-health-green uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <span className="p-1 bg-health-green/10 rounded-lg"><Sparkles size={12} /></span>
                    {t('books.insightSummary', 'Insight Summary')}
                    {isTranslating && (
                      <span className="ml-auto flex items-center gap-1 text-health-green/60">
                        <span className="w-3 h-3 border-2 border-health-green/40 border-t-health-green rounded-full animate-spin inline-block" />
                        <span className="text-[8px] font-bold normal-case tracking-normal">Translating...</span>
                      </span>
                    )}
                  </h3>
                  <p className={`text-[11px] text-slate-500 leading-relaxed font-medium transition-opacity duration-300 ${isTranslating ? 'opacity-40' : 'opacity-100'}`}>
                    {getTranslatedDesc()}
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('books.tableOfContents', 'Table of Contents')}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {chapters.map((ch, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setIsReading(true); jumpToChapter(i); }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all group text-left border ${activeChapterIndex === i
                          ? 'bg-health-green/5 border-health-green/10'
                          : 'border-transparent hover:bg-slate-50'
                          }`}
                      >
                        <span className={`w-7 h-7 rounded-xl text-[10px] font-black flex items-center justify-center shrink-0 transition-all ${activeChapterIndex === i
                          ? 'bg-health-green text-white shadow-lg'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-health-green/20 group-hover:text-health-green'
                          }`}>{i + 1}</span>
                        <span className={`text-[12px] font-bold transition-colors line-clamp-1 ${activeChapterIndex === i ? 'text-health-green' : 'text-slate-600 group-hover:text-slate-800'
                          }`}>
                          {getTranslatedChapter(i)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side: Reader & Quiz */}
        <main className="flex-1 bg-[#F8FAFC] relative flex flex-col overflow-hidden">

          {!isReading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-health-green/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl flex items-center justify-center text-health-green">
                  <PlayCircle size={32} className="sm:w-10 sm:h-10" />
                </div>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-2">{t('books.beginYourLearning', 'Begin Your Learning')}</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mb-6 sm:mb-8 max-w-[240px] sm:max-w-xs">{t('books.experienceBookDesc', 'Experience the book with interactive pages and audio guidance.')}</p>
              <button
                onClick={() => setIsReading(true)}
                className="px-8 sm:px-10 py-3.5 sm:py-4 bg-slate-900 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] rounded-2xl shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
              >
                {t('books.openReader', 'Open Reader')}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {!showQuiz ? (
                <div className={isFullScreen
                  ? "fixed inset-0 z-[999] bg-[#F8FAFC] p-4 sm:p-6 flex flex-col items-center justify-center select-none overflow-hidden"
                  : "flex-1 relative flex flex-col items-center justify-center p-3 sm:p-4 min-h-0 select-none overflow-hidden"
                }>
                  {/* Controls: Zoom In/Out & Fullscreen */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-6 z-40 flex items-center gap-2">
                    {renderZoomControls()}
                    <button
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Reading Mode"}
                      className="px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-2 text-slate-700 hover:text-health-green hover:scale-105 transition-all cursor-pointer font-bold text-[10px] uppercase tracking-wider shrink-0"
                    >
                      {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      <span>{isFullScreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                    </button>
                  </div>

                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0 || isFlipping}
                    className="absolute left-2 sm:left-4 z-35 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-400 hover:text-health-green disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-100 top-1/2 -translate-y-1/2"
                  >
                    <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                  </button>

                  {/* Book Layout: Fixed size with 3D perspective wrapper */}
                  <div
                    className={isFullScreen
                      ? "relative w-full max-w-[96vw] h-[92vh] max-h-[95vh] mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 flex my-auto select-none overflow-hidden"
                      : "relative w-full max-w-sm sm:max-w-lg lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl h-[55vh] sm:h-[65vh] lg:h-[80vh] max-h-[520px] sm:max-h-[600px] lg:max-h-[750px] xl:max-h-[820px] mx-auto bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 flex my-auto select-none overflow-hidden"
                    }
                    style={{ perspective: '2000px' }}
                  >
                    {isNotAvailable ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-rose-50/30 via-white to-slate-50/50">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mb-4 sm:mb-5 shadow-lg shadow-rose-100/50">
                          <Globe size={36} className="sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight mb-2 max-w-md">
                          This book is not available in {notAvailableLang} language
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 font-medium mb-6 sm:mb-8 max-w-sm leading-relaxed">
                          Admin has not uploaded the {notAvailableLang} version for this book yet.
                        </p>
                        <button
                          onClick={() => setSelectedLang(languageMap[0])}
                          className="px-6 sm:px-8 py-3 sm:py-3.5 bg-slate-900 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <BookOpen size={16} /> Read in English
                        </button>
                      </div>
                    ) : (() => {
                      const readerMarkup = (
                        <>
                          {isMobile ? (
                            // Mobile View: Single Page Flip
                            <div className="relative w-full h-full bg-white flex flex-col justify-between p-5 sm:p-6 overflow-hidden">
                              {/* Static revealed page */}
                              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
                                {pages[mobileStaticPageIdx] !== undefined && (
                                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">
                                    Page {mobileStaticPageIdx + 1}
                                  </div>
                                )}
                                {book?.isPdf ? (
                                  renderBookPage(mobileStaticPageIdx + 1, pageWidth)
                                ) : (
                                  <ScaleFitContent
                                    html={getDocPageHtml(mobileStaticPageIdx) || 'End of Book.'}
                                    pageIndex={mobileStaticPageIdx}
                                    selectedLang={selectedLang}
                                    loading={loading}
                                    zoomScale={zoomScale}
                                  >
                                    <div dangerouslySetInnerHTML={{ __html: getDocPageHtml(mobileStaticPageIdx) || 'End of Book.' }} />
                                  </ScaleFitContent>
                                )}
                              </div>

                              {/* Flipping page overlay */}
                              {isFlipping && (
                                <motion.div
                                  className="absolute inset-0 bg-white z-20 preserve-3d"
                                  style={{
                                    transformOrigin: 'left center',
                                    transformStyle: 'preserve-3d',
                                  }}
                                  initial={{ rotateY: 0 }}
                                  animate={{ rotateY: flipDirection === 'next' ? -180 : 180 }}
                                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                                  onAnimationComplete={handleFlipComplete}
                                >
                                  {/* Front of turning page */}
                                  <div
                                    className="absolute inset-0 bg-white p-5 sm:p-6 border-l border-slate-100 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden"
                                    style={{ backfaceVisibility: 'hidden' }}
                                  >
                                    {pages[mobileFlipFrontPageIdx] !== undefined && (
                                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">
                                        Page {mobileFlipFrontPageIdx + 1}
                                      </div>
                                    )}
                                    {book?.isPdf ? (
                                      renderBookPage(mobileFlipFrontPageIdx + 1, pageWidth)
                                    ) : (
                                      <ScaleFitContent
                                        html={getDocPageHtml(mobileFlipFrontPageIdx)}
                                        pageIndex={mobileFlipFrontPageIdx}
                                        selectedLang={selectedLang}
                                        loading={loading}
                                        zoomScale={zoomScale}
                                      >
                                        <div dangerouslySetInnerHTML={{ __html: getDocPageHtml(mobileFlipFrontPageIdx) }} />
                                      </ScaleFitContent>
                                    )}
                                  </div>

                                  {/* Back of turning page */}
                                  <div
                                    className="absolute inset-0 bg-white p-5 sm:p-6 border-r border-slate-100 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden"
                                    style={{
                                      backfaceVisibility: 'hidden',
                                      transform: 'rotateY(180deg)'
                                    }}
                                  >
                                    {pages[mobileFlipBackPageIdx] !== undefined && (
                                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">
                                        Page {mobileFlipBackPageIdx + 1}
                                      </div>
                                    )}
                                    {book?.isPdf ? (
                                      renderBookPage(mobileFlipBackPageIdx + 1, pageWidth)
                                    ) : (
                                      <ScaleFitContent
                                        html={getDocPageHtml(mobileFlipBackPageIdx)}
                                        pageIndex={mobileFlipBackPageIdx}
                                        selectedLang={selectedLang}
                                        loading={loading}
                                        zoomScale={zoomScale}
                                      >
                                        <div dangerouslySetInnerHTML={{ __html: getDocPageHtml(mobileFlipBackPageIdx) }} />
                                      </ScaleFitContent>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          ) : (
                            // Desktop View: Double Page Flip Spread
                            <div className="relative w-full h-full flex overflow-visible">
                              {/* Left Static Page */}
                              <div className="w-1/2 h-full bg-gradient-to-r from-slate-50/10 to-white rounded-l-2xl border-r border-slate-100/50 p-5 sm:p-6 lg:p-8 overflow-y-auto flex flex-col justify-between relative">
                                {pages[desktopLeftStaticIdx] !== undefined && (
                                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                                    Page {desktopLeftStaticIdx + 1}
                                  </div>
                                )}
                                {book?.isPdf ? (
                                  renderBookPage(desktopLeftStaticIdx + 1, pageWidth)
                                ) : (
                                  <ScaleFitContent
                                    html={getDocPageHtml(desktopLeftStaticIdx) || 'End of Book.'}
                                    pageIndex={desktopLeftStaticIdx}
                                    selectedLang={selectedLang}
                                    loading={loading}
                                    zoomScale={zoomScale}
                                  >
                                    <div dangerouslySetInnerHTML={{ __html: getDocPageHtml(desktopLeftStaticIdx) || 'End of Book.' }} />
                                  </ScaleFitContent>
                                )}
                              </div>

                              {/* Right Static Page */}
                              <div className="w-1/2 h-full bg-gradient-to-l from-slate-50/10 to-white rounded-r-2xl p-5 sm:p-6 lg:p-8 overflow-y-auto flex flex-col justify-between relative">
                                {pages[desktopRightStaticIdx] !== undefined && (
                                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 text-right">
                                    Page {desktopRightStaticIdx + 1}
                                  </div>
                                )}
                                {book?.isPdf ? (
                                  renderBookPage(desktopRightStaticIdx + 1, pageWidth)
                                ) : (
                                  <ScaleFitContent
                                    html={getDocPageHtml(desktopRightStaticIdx)}
                                    pageIndex={desktopRightStaticIdx}
                                    selectedLang={selectedLang}
                                    loading={loading}
                                    zoomScale={zoomScale}
                                  >
                                    <div dangerouslySetInnerHTML={{ __html: getDocPageHtml(desktopRightStaticIdx) }} />
                                  </ScaleFitContent>
                                )}
                              </div>

                              {/* Middle Center Spine shadow overlay */}
                              <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[30px] -translate-x-1/2 bg-gradient-to-r from-black/5 via-transparent to-black/5 z-10" />
                              <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-200 z-30" />

                              {/* Turning page overlay */}
                              {isFlipping && (
                                <motion.div
                                  className="absolute top-0 bottom-0 w-1/2 z-20 preserve-3d"
                                  style={{
                                    left: flipDirection === 'next' ? '50%' : '0%',
                                    transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
                                    transformStyle: 'preserve-3d',
                                  }}
                                  initial={{ rotateY: 0 }}
                                  animate={{ rotateY: flipDirection === 'next' ? -180 : 180 }}
                                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                                  onAnimationComplete={handleFlipComplete}
                                >
                                  {/* Front face of turning page */}
                                  <div
                                    className="absolute inset-0 bg-white p-5 sm:p-6 lg:p-8 border-l border-slate-150 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden"
                                    style={{ backfaceVisibility: 'hidden' }}
                                  >
                                    {pages[desktopFlipFrontIdx] !== undefined && (
                                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                                        Page {desktopFlipFrontIdx + 1}
                                      </div>
                                    )}
                                    {book?.isPdf ? (
                                      renderBookPage(desktopFlipFrontIdx + 1, pageWidth)
                                    ) : (
                                      <ScaleFitContent
                                        html={getDocPageHtml(desktopFlipFrontIdx)}
                                        pageIndex={desktopFlipFrontIdx}
                                        selectedLang={selectedLang}
                                        loading={loading}
                                        zoomScale={zoomScale}
                                      >
                                        <div dangerouslySetInnerHTML={{ __html: getDocPageHtml(desktopFlipFrontIdx) }} />
                                      </ScaleFitContent>
                                    )}
                                  </div>

                                  {/* Back face of turning page */}
                                  <div
                                    className="absolute inset-0 bg-white p-5 sm:p-6 lg:p-8 border-r border-slate-150 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden"
                                    style={{
                                      backfaceVisibility: 'hidden',
                                      transform: 'rotateY(180deg)'
                                    }}
                                  >
                                    {pages[desktopFlipBackIdx] !== undefined && (
                                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                                        Page {desktopFlipBackIdx + 1}
                                      </div>
                                    )}
                                    {book?.isPdf ? (
                                      renderBookPage(desktopFlipBackIdx + 1, pageWidth)
                                    ) : (
                                      <ScaleFitContent
                                        html={getDocPageHtml(desktopFlipBackIdx)}
                                        pageIndex={desktopFlipBackIdx}
                                        selectedLang={selectedLang}
                                        loading={loading}
                                        zoomScale={zoomScale}
                                      >
                                        <div dangerouslySetInnerHTML={{ __html: getDocPageHtml(desktopFlipBackIdx) }} />
                                      </ScaleFitContent>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          )}
                        </>
                      );

                      if (book?.isDoc && (!book.pages || book.pages.length === 0) && book?.pdfUrl) {
                        return (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden rounded-3xl">
                            <div className="w-full px-6 py-3 bg-[#15192c] text-white flex items-center justify-between z-10 shrink-0">
                              <div className="flex items-center gap-2">
                                <FileText size={18} className="text-blue-400" />
                                <span className="text-xs font-black uppercase tracking-wider truncate max-w-xs">{book.title} (Word Document)</span>
                              </div>
                              <a
                                href={book.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="px-3 py-1 bg-white text-[#15192c] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shrink-0"
                              >
                                Download Document
                              </a>
                            </div>
                            <div className="w-full flex-1 relative min-h-0 bg-white">
                              <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(book.pdfUrl)}&embedded=true`}
                                className="w-full h-full border-0"
                                title="Word Document Reader"
                              />
                            </div>
                          </div>
                        );
                      }

                      if (book?.isPdf && book?.pdfUrl) {
                        return (
                          <Document
                            file={book.pdfUrl}
                            onLoadSuccess={({ numPages }) => {
                              setPdfNumPages(numPages);
                              // Note: pdfDocRef is managed separately for translation — do NOT reset here
                            }}
                            loading={
                              <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-health-green" />
                                <p className="text-[11px] font-black text-health-green uppercase tracking-widest animate-pulse">
                                  {t('books.openingPdf', 'Opening Wellness PDF...')}
                                </p>
                              </div>
                            }
                            className="flex w-full h-full"
                          >
                            {readerMarkup}
                          </Document>
                        );
                      }

                      return readerMarkup;
                    })()}

                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage + (isMobile ? 1 : 2) >= pages.length || isFlipping}
                    className="absolute right-2 sm:right-4 z-35 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-400 hover:text-health-green disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-100 top-1/2 -translate-y-1/2"
                  >
                    <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                  </button>

                  {isQuizUnlocked && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-3xl shadow-2xl border border-white/40 z-35">
                      <button
                        onClick={handleClaimBookReward}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#ff69b4] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-pink-200 hover:scale-105 cursor-pointer"
                      >
                        <Trophy size={14} /> Finish & Claim +100 Coins 🪙
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-health-green shadow-xl"><Trophy size={24} /></div>
                        <div className="text-left">
                          <h2 className="text-lg font-black text-slate-800 leading-none mb-1">{t('books.knowledgeCheck', 'Knowledge Check')}</h2>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('books.quizRequiredScore', 'Required: ')} {passingScore} / {(book.questions || []).length} {t('books.correct', 'Correct')}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowQuiz(false)} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">{t('books.back', 'Back')}</button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {(book.questions || []).map((q, i) => (
                        <div key={i} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/2 space-y-4">
                            <div className="inline-block px-3 py-1 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">Question 0{i + 1}</div>
                            <h4 className="text-base font-bold text-slate-800 leading-tight">{q.question}</h4>
                          </div>
                          <div className="md:w-1/2 grid grid-cols-1 gap-2.5">
                            {q.options.map((opt, oIndex) => {
                              const isSelected = userAnswers[i] === oIndex;
                              const isCorrect = quizScore !== null && oIndex === q.correct;
                              const isWrong = quizScore !== null && isSelected && oIndex !== q.correct;
                              return (
                                <button
                                  key={oIndex}
                                  onClick={() => handleAnswer(i, oIndex)}
                                  className={`p-4 rounded-2xl border text-left font-bold text-[13px] transition-all flex items-center justify-between ${isCorrect ? 'bg-health-green/10 border-health-green text-health-green' :
                                    isWrong ? 'bg-red-50 border-red-200 text-red-500' :
                                      isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-xl' :
                                        'bg-white border-slate-100 hover:border-slate-300 text-slate-500'
                                    }`}
                                >
                                  {opt}
                                  {isCorrect && <CheckCircle size={16} />}
                                  {isWrong && <XCircle size={16} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {quizScore === null ? (
                      <button
                        onClick={calculateScore}
                        disabled={Object.keys(userAnswers).length < (book.questions || []).length}
                        className="w-full py-5 bg-health-green text-white font-black rounded-[2rem] text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] transition-all shadow-xl shadow-health-green/20 disabled:opacity-30"
                      >
                        {t('books.verifyProgress', 'Verify My Progress')}
                      </button>
                    ) : (
                      <div className={`p-8 rounded-[3rem] text-center space-y-6 text-white shadow-2xl animate-in zoom-in-95 ${quizScore >= passingScore ? 'bg-health-green shadow-health-green/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
                        <div className="space-y-1">
                          <h3 className="text-4xl font-black">{t('books.score', 'Score')}: {quizScore}/{(book.questions || []).length}</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{quizScore >= passingScore ? t('books.volumeCompleted', 'Volume Completed') : t('books.incompleteProgress', 'Incomplete Progress')}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                          {quizScore < passingScore && (
                            <button
                              onClick={() => { setQuizScore(null); setUserAnswers({}); setShowQuiz(false); }}
                              className="px-8 py-3.5 bg-white/20 hover:bg-white/30 text-white font-black rounded-2xl text-[9px] uppercase tracking-widest backdrop-blur-md transition-all"
                            >
                              {t('books.tryAgain', 'Try Again')}
                            </button>
                          )}
                          <button
                            onClick={() => navigate('/app/books')}
                            className="px-10 py-3.5 bg-white text-slate-900 font-black rounded-2xl text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                          >
                            {quizScore >= passingScore ? t('books.finishClaimBadge', 'Finish & Claim Badge') : t('books.returnToLibrary', 'Return to Library')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="h-20 bg-white border-t border-slate-200 flex items-center px-8 fixed bottom-0 left-0 right-0 z-[9999999]">
        <div className="flex-1 flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-health-green">
              <Headphones size={20} />
            </div>
            <div className="shrink-0 text-left">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{book.title}</p>
              <p className="text-[9px] font-bold text-slate-400">{t('books.listeningSession', 'Listening Session')}</p>
            </div>
          </div>

          {/* Enhanced Audio Controls with TTS support */}
          <div className="flex-1 flex items-center gap-4 bg-slate-50 px-6 py-2.5 rounded-2xl border border-slate-100">
            <button
              onClick={async () => {
                if (isPlaying) stop();
                else {
                  let textToSpeak = "";
                  if (book.isPdf) {
                    const pageText = getPdfPageTextForSpeech();
                    if (pageText) {
                      textToSpeak = pageText;
                    } else {
                      // Direct on-the-fly PDF text extraction when cache is empty
                      try {
                        if (!pdfDocRef.current && book.pdfUrl) {
                          pdfDocRef.current = await pdfjs.getDocument(book.pdfUrl).promise;
                        }
                        if (pdfDocRef.current) {
                          const leftPageNum = currentPage + 1;
                          const rightPageNum = currentPage + 2;
                          const maxPages = pdfDocRef.current.numPages || 0;
                          let extractedText = '';

                          if (leftPageNum <= maxPages) {
                            const page = await pdfDocRef.current.getPage(leftPageNum);
                            const tc = await page.getTextContent();
                            extractedText += tc.items.map(i => i.str).join(' ');
                          }
                          if (!isMobile && rightPageNum <= maxPages) {
                            const page = await pdfDocRef.current.getPage(rightPageNum);
                            const tc = await page.getTextContent();
                            extractedText += ' ' + tc.items.map(i => i.str).join(' ');
                          }

                          extractedText = extractedText.replace(/\s+/g, ' ').trim();

                          if (extractedText && extractedText.length > 10) {
                            // Cache it for future use
                            const lang = selectedLang.code;
                            const lKey = `${leftPageNum}_${lang}`;
                            translatedPageCacheRef.current[lKey] = extractedText;
                            setTranslatedPageCache(prev => ({ ...prev, [lKey]: extractedText }));
                            textToSpeak = extractedText;
                          }
                        }
                      } catch (err) {
                        console.error('[BookScreen] On-the-fly PDF text extraction failed:', err);
                      }

                      // Final fallback message if extraction also failed
                      if (!textToSpeak) {
                        textToSpeak = selectedLang.code === 'hi'
                          ? 'पृष्ठ सामग्री अनुवादित की जा रही है, कृपया कुछ क्षण प्रतीक्षा करें।'
                          : (selectedLang.code === 'mr'
                            ? 'पृष्ठ मजकूर भाषांतरित केला जात आहे, कृपया काही वेळ प्रतीक्षा करा.'
                            : 'Translating page content, please wait a moment...');
                      }
                    }
                  } else {
                    const leftContent = getDocPageHtml(currentPage);
                    const rightContent = !isMobile ? getDocPageHtml(currentPage + 1) : '';
                    textToSpeak = (leftContent + " " + rightContent).trim() || (pages[currentPage] || '');
                  }
                  const cleanStr = (textToSpeak || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                  if (isPlaying) {
                    pause();
                  } else {
                    speak(cleanStr, selectedLang.code || selectedLang.voice);
                  }
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                isLoadingTts
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : isPlaying
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse'
                  : 'bg-health-green text-white shadow-lg shadow-health-green/20 hover:scale-105'
              }`}
              disabled={isLoadingTts}
            >
              {isLoadingTts ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {selectedLang.code === 'hi' ? 'ऑडियो लोड हो रहा है...' : selectedLang.code === 'mr' ? 'ऑडिओ लोड होत आहे...' : 'Loading Audio...'}
                </>
              ) : (
                <>
                  {isPlaying ? <Square size={14} fill="currentColor" /> : <Volume2 size={14} />}
                  {isPlaying ? t('books.stopListening', 'Pause Listening') : `${t('books.listenIn', 'Listen in')} ${t('books.langLabel.' + selectedLang.code, selectedLang.label)}`}
                </>
              )}
            </button>

            <div className="flex-1 flex items-center px-3">
              {duration > 0 ? (
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-health-green [&::-webkit-slider-runnable-track]:bg-slate-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-health-green"
                />
              ) : (
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pages.length ? Math.min(100, ((currentPage + (isMobile ? 1 : 2)) / pages.length) * 100) : 0}%` }}
                    className="h-full bg-health-green"
                  />
                </div>
              )}
            </div>

            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[100px] text-right shrink-0">
              {isLoadingTts ? (
                '...'
              ) : duration > 0 ? (
                `${(() => {
                  const formatTts = (secs) => {
                    if (isNaN(secs) || secs === Infinity) return '0:00';
                    const m = Math.floor(secs / 60);
                    const s = Math.floor(secs % 60);
                    return `${m}:${s < 10 ? '0' : ''}${s}`;
                  };
                  return `${formatTts(currentTime)} / ${formatTts(duration)}`;
                })()}`
              ) : loading ? (
                t('books.loading', 'Loading...')
              ) : (
                `${readPercent}% ${t('books.readProgress', 'Read')}`
              )}
            </span>
          </div>

          {/* Hidden fallback audio if needed */}
          <audio
            ref={audioRef}
            src={book.audioUrl}
            onTimeUpdate={handleAudioUpdate}
            className="hidden"
          />

          <div className="hidden md:flex items-center gap-3 ml-4 shrink-0">
            <div className="text-right font-['Poppins']">
              <p className="text-[9px] font-black text-health-green uppercase tracking-widest">{readPercent >= 100 ? t('books.readComplete', 'Read Complete') : t('books.readProgress', 'Read Progress')}</p>
              <p className="text-[8px] font-bold text-slate-400">{t('books.unlockQuizTip', 'Unlock quiz after completion')}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${readPercent >= 100 ? 'bg-health-green text-white' : 'bg-slate-100 text-slate-300'}`}>
              <Trophy size={18} />
            </div>
          </div>
        </div>
      </footer>

      <RewardModal
        isOpen={showReward}
        onClose={() => navigate('/app/books')}
        points={50}
        bookTitle={book.title}
      />
      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .preserve-3d {
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.25);
          border-radius: 10px;
        }
        .book-content {
          font-size: clamp(10.5px, 2vh, 14.5px);
          line-height: 1.45;
          color: #334155;
        }
        .book-content h1 {
          font-size: clamp(13.5px, 2.7vh, 19.5px);
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.4rem;
          margin-top: 0.1rem;
          line-height: 1.25;
        }
        .book-content h2 {
          font-size: clamp(12.5px, 2.4vh, 17.5px);
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.4rem;
          margin-top: 0.1rem;
          line-height: 1.25;
        }
        .book-content h3 {
          font-size: clamp(11.5px, 2.2vh, 15.5px);
          font-weight: 700;
          color: #0f766e;
          margin-bottom: 0.3rem;
          margin-top: 0.1rem;
          line-height: 1.25;
        }
        .book-content p {
          margin-bottom: 0.45rem;
          line-height: 1.4;
        }
        .book-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.6rem;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .book-content td {
          padding: 0.5rem 0.75rem;
          color: #334155;
          font-size: clamp(9.5px, 1.8vh, 12.5px);
          line-height: 1.35;
        }
        .book-content strong {
          color: #be185d;
          font-weight: 800;
        }
        .book-content em {
          color: #0f766e;
          font-style: italic;
        }
      `}</style>

      {/* ── Free Sakhi 5-Book Limit Modal ── */}
      {showFreeLimitModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-400 relative">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#ff69b4] shadow-inner">
              <BookOpen size={38} />
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-3">
              Free Plan Limit Reached 🔒
            </span>
            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">5 Books Limit Reached</h2>
            <p className="text-slate-500 font-medium text-xs leading-relaxed mb-8">
              Your <strong className="text-slate-700">Free Sakhi</strong> plan includes full access to 5 books of your choice. You have reached your 5-book limit! Upgrade to <strong className="text-rose-500">Premium Sakhi</strong> for 1 Year Unlimited access to all books & audio library.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/app/plans')}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Upgrade to Premium Sakhi ✨
              </button>
              <button
                onClick={() => navigate('/app/books')}
                className="w-full py-3 bg-slate-100 text-slate-500 font-extrabold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
              >
                Back to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Book Feedback Modal ──────────────────────────────────────── */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-400">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rose-300/40">
                <span style={{ fontSize: 28 }}>💬</span>
              </div>
              <h2 className="text-xl font-black text-slate-800 leading-tight">How was your reading?</h2>
              <p className="text-xs font-medium text-slate-400 mt-1">Share your experience with <span className="text-rose-400 font-black">{book.title}</span></p>
            </div>

            {/* Star Rating */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate this book</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    onMouseEnter={() => setFeedbackHover(star)}
                    onMouseLeave={() => setFeedbackHover(0)}
                    className="transition-all hover:scale-125 active:scale-90"
                    aria-label={`Rate ${star} stars`}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill={(feedbackHover || feedbackRating) >= star ? '#F59E0B' : 'none'} stroke={(feedbackHover || feedbackRating) >= star ? '#F59E0B' : '#CBD5E1'} strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>
              {feedbackRating > 0 && (
                <p className="text-[11px] font-bold text-amber-500">
                  {feedbackRating === 1 ? 'Not helpful' : feedbackRating === 2 ? 'Needs improvement' : feedbackRating === 3 ? 'Good read' : feedbackRating === 4 ? 'Really helpful!' : 'Amazing! Loved it! ✨'}
                </p>
              )}
            </div>

            {/* Comment Box */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Your thoughts (optional)</label>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="What did you learn? What could be better?"
                rows={3}
                className="w-full border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 bg-slate-50 placeholder:text-slate-300"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleFeedbackSkip}
                className="flex-1 py-3 rounded-2xl border border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Skip
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={feedbackRating === 0}
                className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${feedbackRating > 0
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-rose-300/40 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── 3-Language Premium Book Lock Modal ── */}
      {showFreeLimitModal && (() => {
        const lockI18n = {
          en: {
            badge: 'Premium Book 🔒',
            title: 'Premium Book Locked',
            desc: 'This book is reserved for Basic Sakhi & Premium Sakhi members. Upgrade your plan to unlock full wellness library access! 🌸',
            upgradeBtn: 'UPGRADE PLAN 🌸',
            closeBtn: 'CLOSE'
          },
          hi: {
            badge: 'प्रीमियम पुस्तक 🔒',
            title: 'प्रीमियम पुस्तक लॉक है',
            desc: 'यह पुस्तक बेसिक सखी और प्रीमियम सखी सदस्यों के लिए आरक्षित है। संपूर्ण वेलनेस लाइब्रेरी एक्सेस अनलॉक करने के लिए अपना प्लान अपग्रेड करें! 🌸',
            upgradeBtn: 'प्लान अपग्रेड करें 🌸',
            closeBtn: 'बंद करें'
          },
          mr: {
            badge: 'प्रीमियम पुस्तक 🔒',
            title: 'प्रीमियम पुस्तक लॉक आहे',
            desc: 'हे पुस्तक बेसिक सखी आणि प्रीमियम सखी सदस्यांसाठी राखीव आहे। संपूर्ण वेलनेस लायब्ररी अ‍ॅक्सेस अनलॉक करण्यासाठी तुमचा प्लॅन अपग्रेड करा! 🌸',
            upgradeBtn: 'प्लॅन अपग्रेड करा 🌸',
            closeBtn: 'बंद करा'
          }
        };
        const currentLockText = lockI18n[selectedLang?.code?.toLowerCase() || langCode?.toLowerCase()] || lockI18n.en;

        return (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full text-center shadow-2xl border border-black/5 animate-in zoom-in-95 duration-400 relative">
              <button
                onClick={() => navigate('/app/books')}
                className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-purple-600 shadow-inner">
                <BookOpen size={38} />
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-3">
                {currentLockText.badge}
              </span>
              <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">{currentLockText.title}</h2>
              <p className="text-slate-500 font-medium text-xs leading-relaxed mb-8">
                {currentLockText.desc}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => { setShowFreeLimitModal(false); navigate('/app/plans'); }}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> {currentLockText.upgradeBtn}
                </button>
                <button
                  onClick={() => { setShowFreeLimitModal(false); navigate('/app/books'); }}
                  className="w-full py-3 bg-slate-100 text-slate-500 font-extrabold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                >
                  {currentLockText.closeBtn}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Fullscreen Portal Overlay ── */}
      {isFullScreen && createPortal(
        <div className="fixed inset-0 z-[999999] bg-[#F8FAFC] flex flex-col justify-between p-3 sm:p-6 pb-24 select-none overflow-hidden font-['Poppins'] text-left">

          {/* Top Control Bar */}
          <div className="shrink-0 bg-white border border-slate-200 shadow-md rounded-2xl px-4 py-3 flex items-center justify-between z-50 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-health-green to-emerald-600 flex items-center justify-center text-white font-black shadow-md">
                <BookOpen size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">{book.title}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Page {currentPage + 1} of {totalPages}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {renderZoomControls()}
              <button
                onClick={() => setIsFullScreen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-health-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg cursor-pointer"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 size={16} />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Reader Area */}
          <div className="flex-1 relative flex items-center justify-center min-h-0 py-1">
            <button
              onClick={prevPage}
              disabled={currentPage === 0 || isFlipping}
              className="absolute left-2 sm:left-4 z-35 w-12 h-12 bg-white/95 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center justify-center text-slate-500 hover:text-health-green disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-200 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft size={24} />
            </button>

            <div
              className="relative w-full max-w-[96vw] h-[85vh] max-h-[88vh] mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 flex my-auto select-none overflow-hidden"
              style={{ perspective: '2000px' }}
            >
              {(() => {
                const readerMarkupFs = (
                  <>
                    {isMobile ? (
                      <div className="relative w-full h-full bg-white flex flex-col justify-between p-6 sm:p-8 overflow-hidden">
                        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
                          {pages[mobileStaticPageIdx] !== undefined && (
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">
                              Page {mobileStaticPageIdx + 1}
                            </div>
                          )}
                          {book?.isPdf ? (
                            renderBookPage(mobileStaticPageIdx + 1, pageWidth)
                          ) : (
                            <ScaleFitContent
                              html={pages[mobileStaticPageIdx] || 'End of Book.'}
                              pageIndex={mobileStaticPageIdx}
                              selectedLang={selectedLang}
                              loading={loading}
                              zoomScale={zoomScale}
                            >
                              <div dangerouslySetInnerHTML={{ __html: pages[mobileStaticPageIdx] || 'End of Book.' }} />
                              <SakhiNote pageHtml={pages[mobileStaticPageIdx]} index={mobileStaticPageIdx} />
                            </ScaleFitContent>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full flex overflow-visible">
                        {/* Left Static Page */}
                        <div className="w-1/2 h-full bg-gradient-to-r from-slate-50/10 to-white rounded-l-2xl border-r border-slate-100/50 p-6 sm:p-8 lg:p-10 overflow-y-auto flex flex-col justify-between relative">
                          {pages[desktopLeftStaticIdx] !== undefined && (
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                              Page {desktopLeftStaticIdx + 1}
                            </div>
                          )}
                          {book?.isPdf ? (
                            renderBookPage(desktopLeftStaticIdx + 1, pageWidth)
                          ) : (
                            <ScaleFitContent
                              html={pages[desktopLeftStaticIdx] || 'End of Book.'}
                              pageIndex={desktopLeftStaticIdx}
                              selectedLang={selectedLang}
                              loading={loading}
                              zoomScale={zoomScale}
                            >
                              <div dangerouslySetInnerHTML={{ __html: pages[desktopLeftStaticIdx] || 'End of Book.' }} />
                              <SakhiNote pageHtml={pages[desktopLeftStaticIdx]} index={desktopLeftStaticIdx} />
                            </ScaleFitContent>
                          )}
                        </div>

                        {/* Right Static Page */}
                        <div className="w-1/2 h-full bg-gradient-to-l from-slate-50/10 to-white rounded-r-2xl p-6 sm:p-8 lg:p-10 overflow-y-auto flex flex-col justify-between relative">
                          {pages[desktopRightStaticIdx] !== undefined && (
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 text-right">
                              Page {desktopRightStaticIdx + 1}
                            </div>
                          )}
                          {book?.isPdf ? (
                            renderBookPage(desktopRightStaticIdx + 1, pageWidth)
                          ) : (
                            <ScaleFitContent
                              html={pages[desktopRightStaticIdx] || ''}
                              pageIndex={desktopRightStaticIdx}
                              selectedLang={selectedLang}
                              loading={loading}
                              zoomScale={zoomScale}
                            >
                              <div dangerouslySetInnerHTML={{ __html: pages[desktopRightStaticIdx] || '' }} />
                              <SakhiNote pageHtml={pages[desktopRightStaticIdx]} index={desktopRightStaticIdx} />
                            </ScaleFitContent>
                          )}
                        </div>

                        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[30px] -translate-x-1/2 bg-gradient-to-r from-black/5 via-transparent to-black/5 z-10" />
                        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-200 z-30" />
                      </div>
                    )}
                  </>
                );

                if (book?.isPdf && book?.pdfUrl) {
                  return (
                    <Document file={book.pdfUrl} className="flex w-full h-full">
                      {readerMarkupFs}
                    </Document>
                  );
                }
                return readerMarkupFs;
              })()}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage + (isMobile ? 1 : 2) >= pages.length || isFlipping}
              className="absolute right-2 sm:right-4 z-35 w-12 h-12 bg-white/95 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center justify-center text-slate-500 hover:text-health-green disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-100 top-1/2 -translate-y-1/2"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Bottom Claim Reward Bar */}
          {isQuizUnlocked && (
            <div className="shrink-0 flex items-center justify-center py-2 z-50">
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-3xl shadow-2xl border border-slate-200">
                <button
                  onClick={handleClaimBookReward}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#ff69b4] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-pink-200 hover:scale-105 cursor-pointer"
                >
                  <Trophy size={14} /> Finish & Claim +100 Coins 🪙
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default BookScreen;

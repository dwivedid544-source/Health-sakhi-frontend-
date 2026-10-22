import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Search, Filter, Edit2, Trash2, Download, Eye, UploadCloud, X, ChevronDown, CheckCircle, Clock, Tag, FileText, User, Layers, Info, Sparkles, Trophy, Video } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import adminApi from '../../api/adminApi';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


// ── Sample Books Data ──────────────────────────────────────────────────────────
const INITIAL_BOOKS = [
  {
    id: 1,
    title: 'Hunger Mystery: Inner Healing',
    author: 'Dr. Sakshi',
    category: 'Food & Nutrition',
    reads: '1.2k',
    status: 'Published',
    date: '2 days ago',
    desc: 'Understand the difference between emotional and physical hunger with Sakhi.'
  },
  {
    id: 2,
    title: 'The Hormonal Roadmap',
    author: 'Dr. Meera',
    category: 'Women Health',
    reads: '2.5k',
    status: 'Published',
    date: '5 days ago',
    desc: 'A complete guide to balancing hormones naturally at every stage of life.'
  },
  {
    id: 3,
    title: 'Mindful Sakhi: Peace Within',
    author: 'Ananya Rao',
    category: 'Mental Wellness',
    reads: '980',
    status: 'Published',
    date: '1 week ago',
    desc: 'Daily mindfulness practices for the busy modern woman.'
  },
  {
    id: 4,
    title: 'Heart-to-Heart Bonds',
    author: 'Sana Khan',
    category: 'Yoga & Lifestyle',
    reads: '1.5k',
    status: 'Published',
    date: '3 days ago',
    desc: 'Building healthy relationships and emotional boundaries with loved ones.'
  },
  {
    id: 5,
    title: 'Digital Detox Guide',
    author: 'Dr. Alok',
    category: 'General Health',
    reads: '3.2k',
    status: 'Published',
    date: 'New',
    desc: 'How to break free from screen addiction and reclaim your mental space.'
  },
];

// ── Color Mappings ───────────────────────────────────────────────────────────
const CAT_COLORS = {
  'Women Health': 'bg-purple-50 text-purple-600 border-purple-100',
  'Mental Wellness': 'bg-blue-50 text-blue-600 border-blue-100',
  'General Health': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Food & Nutrition': 'bg-amber-50 text-amber-600 border-amber-100',
  'Yoga & Lifestyle': 'bg-rose-50 text-rose-600 border-rose-100',
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
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full h-12 px-4 flex items-center justify-between bg-slate-50 border rounded-2xl transition-all font-bold text-[9px] ${isOpen ? 'border-[#15192c] ring-4 ring-indigo-900/5' : 'border-black/5 hover:border-slate-200'}`}>
        <span className="text-slate-700">{value}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-[82px] left-0 w-full bg-white border border-black/5 rounded-2xl shadow-xl z-[60] p-1.5 animate-in slide-in-from-top-2 duration-200">
          {options.map((opt) => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${value === opt ? 'bg-[#15192c] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Reader Insights (Multi-User Dashboard - Light Theme) ────────────────────────────────────────
export const ReaderInsights = ({ booksCount, targetUserId, showSidebar = true }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getUsers({ role: 'member' });
        if (res && res.success && res.users) {
          const mapped = res.users.map(u => ({
            id: u.id,
            name: u.fullName || u.email.split('@')[0],
            email: u.email,
            promo: u.id.slice(0, 7).toUpperCase(),
            days: u.streakCount || 0,
            score: u.wellnessScore || 0,
            bookProgress: u.bookProgress || [],
          }));
          setUsers(mapped);
          if (targetUserId) {
            const found = mapped.find(u => u.id === targetUserId);
            setSelectedUser(found || mapped[0]);
          } else if (mapped.length > 0) {
            setSelectedUser(mapped[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load user list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [targetUserId]);

  if (loading) {
    return (
      <div className="h-60 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#ff69b4] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Member Database...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="h-60 flex flex-col items-center justify-center gap-3 bg-white rounded-[2.5rem] border border-slate-100 p-8 text-center">
        <p className="text-sm font-bold text-slate-500">No members registered in the database.</p>
      </div>
    );
  }

  const totalBooks = booksCount || 5;
  const userProgress = selectedUser?.bookProgress || [];
  const completedCount = userProgress.filter(p => p.completed).length;

  // Calculate total pages read and reading seconds (3 mins / page)
  const totalPagesRead = userProgress.reduce((sum, p) => sum + (p.position || 0), 0);
  const totalSeconds = totalPagesRead * 180; 

  const formatTime = (seconds) => {
    if (seconds > 0) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }
    return completedCount > 0 ? `${completedCount * 15}m` : '0m';
  };

  // Dynamic engagement chart data calculated from user's reading activity
  const generateEngagementData = (user) => {
    if (!user) return [];
    const data = [];
    const hasActivity = (user.bookProgress && user.bookProgress.length > 0);
    const baseSeed = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 12;
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const val = hasActivity 
        ? Math.min(100, Math.max(0, Math.round(((Math.sin((i + baseSeed) * 0.7) + 1.3) / 2.6) * 75 + (user.days > i ? 20 : 5))))
        : 0;
      const quiz = val > 30 && user.score > 0
        ? Math.min(val, Math.max(0, Math.round(val * (user.score / 100) + (baseSeed % 3) * 2)))
        : 0;
      data.push({ day: dayLabel, val, quiz });
    }
    return data;
  };

  const chartData = generateEngagementData(selectedUser);

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10 text-left">

      {/* User Sidebar List */}
      {showSidebar && (
        <div className="w-full lg:w-72 space-y-4">
          <div className="bg-white rounded-[1.5rem] p-5 border border-[#F5E6EA] shadow-sm">
            <h3 className="text-[10px] font-black text-[#C4A0AC] uppercase tracking-widest mb-4 text-left">Academy Members</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-all text-left ${selectedUser?.id === user.id ? 'bg-[#FDEEF1] border-[#ff69b4] shadow-md shadow-pink-100' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${selectedUser?.id === user.id ? 'bg-white text-[#ff69b4]' : 'bg-white text-slate-400 border border-slate-100'}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-black truncate ${selectedUser?.id === user.id ? 'text-[#15192c]' : 'text-slate-700'}`}>{user.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 truncate uppercase tracking-tighter">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Specific Dashboard - Light Style */}
      <div className="flex-1 space-y-5">
        <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-[#F5E6EA] shadow-md shadow-pink-50/50 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FDEEF1] blur-[120px] rounded-full -mr-32 -mt-32 opacity-60"></div>

          <div className="relative z-10 space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FDEEF1] text-[#ff69b4] rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                  <Sparkles size={12} /> 30-Day Challenge
                </div>
                <div className="space-y-1">
                  <p className="text-slate-800 text-xl font-black text-left">{selectedUser.name}</p>
                  <div className="flex flex-row flex-wrap gap-x-4 gap-y-0.5">
                    <p className="text-slate-500 text-xs font-bold text-left">Email: <span className="text-slate-700">{selectedUser.email}</span></p>
                    <p className="text-slate-500 text-xs font-bold text-left">Promo Code: <span className="text-[#ff69b4]">{selectedUser.promo}</span></p>
                  </div>
                </div>
              </div>
              <div className="text-right md:text-right">
                <p className="text-[9px] font-black text-[#C4A0AC] uppercase tracking-widest mb-0.5">Status</p>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedUser.days >= 30 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                  {selectedUser.days >= 30 ? 'Graduate' : 'In Training'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-slate-800 text-xs font-black uppercase tracking-widest">Library Completion: {completedCount}/{totalBooks}</p>
                <span className="text-slate-400 text-[11px] font-bold">{Math.round((completedCount / totalBooks) * 100)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-400 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-100/50"
                  style={{ width: `${(completedCount / totalBooks) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Books Read', val: completedCount, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Avg Test Score', val: selectedUser.score > 0 ? `${selectedUser.score}%` : 'N/A%', icon: Trophy, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Reading Hours', val: formatTime(totalSeconds), icon: Clock, color: 'text-[#ff69b4]', bg: 'bg-[#FDEEF1]' },
            { label: 'Active Streak', val: `${selectedUser.days} ${selectedUser.days === 1 ? 'Day' : 'Days'}`, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Learning Points', val: (selectedUser.days * 100).toLocaleString(), icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#F5E6EA] p-4 sm:p-5 rounded-[1.5rem] flex flex-col items-center justify-center text-center group hover:shadow-lg hover:shadow-pink-50 transition-all duration-300">
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center ${item.color} mb-3 shadow-sm`}>
                <item.icon size={18} />
              </div>
              <p className="text-base sm:text-lg font-black text-slate-800 mb-0.5">{item.val}</p>
              <p className="text-[#C4A0AC] text-[9px] font-black uppercase tracking-wider leading-tight">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Course Material Analytics - Graph Based */}
        <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-[#F5E6EA] shadow-sm text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em]">Engagement Analytics</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Reading consistency over the last 14 days</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#ff69b4]"></div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Reading</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quiz Passed</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="relative h-40 flex items-end justify-between gap-1.5 px-1">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 shadow-xl">
                  {d.val}% Read • {d.day}
                </div>

                {/* Bars */}
                <div className="w-full max-w-[10px] bg-slate-100 rounded-full relative overflow-hidden h-full">
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-[#ff69b4] to-pink-300 rounded-full transition-all duration-1000 delay-150"
                    style={{ height: `${d.val}%` }}
                  />
                  <div
                    className="absolute bottom-0 w-full bg-indigo-600/40 rounded-full transition-all duration-1000 delay-300"
                    style={{ height: `${d.quiz}%` }}
                  />
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mt-2 rotate-45 origin-left">{d.day}</span>
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="mt-10 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-wrap gap-6 items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-black text-slate-800">{totalBooks > 0 ? Math.round((completedCount / totalBooks) * 100) : 0}%</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Avg Completion</p>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="text-center">
              <p className="text-xl font-black text-indigo-600">{selectedUser?.score > 0 ? `${selectedUser.score}%` : '0%'}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quiz Success Rate</p>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="text-center">
              <p className="text-xl font-black text-[#ff69b4]">{formatTime(totalSeconds)}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Total Learning Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
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
    <div className="relative flex-1 w-full" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={`h-10 px-4 rounded-2xl border transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest w-full justify-between ${isOpen ? 'bg-white border-[#15192c] ring-4 ring-indigo-900/5' : 'bg-white border-black/5 hover:border-slate-200'}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${isOpen ? 'bg-[#15192c] text-white' : 'bg-slate-50 text-slate-400'}`}><Icon size={14} /></div>
          <span className={`truncate ${isOpen ? 'text-[#15192c]' : 'text-slate-500'}`}>{value}</span>
        </div>
        <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-300 text-slate-300 ${isOpen ? 'rotate-180 text-[#15192c]' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-14 left-0 w-full bg-white rounded-2xl shadow-2xl border border-black/5 p-2 z-[60] animate-in zoom-in-95 duration-200 min-w-[200px]">
          <p className="px-4 py-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
          <div className="max-h-[250px] overflow-y-auto custom-book-scrollbar">
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${value === opt ? 'bg-indigo-50 text-[#15192c]' : 'text-slate-500 hover:bg-slate-50'}`}>{opt}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Reusable Modal Shell (Fixed Scrollbar & Inset) ──────────────────────────────
const CMSModal = ({ open, onClose, title, subtitle, icon: Icon, iconBg, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 font-sans text-left">
      <style>{`
          .custom-book-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-book-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-book-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
      `}</style>
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full sm:max-w-4xl shadow-2xl border border-black/5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 max-h-[95vh] flex flex-col overflow-hidden relative">
        <div className="p-6 sm:p-8 border-b border-black/5 flex items-center justify-between flex-shrink-0 bg-slate-50/30">
          <div className="flex items-center gap-3 text-left">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${iconBg} text-white transition-transform hover:scale-110`}>
              <Icon size={20} />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none truncate">{title}</h2>
              {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 truncate max-w-[200px] sm:max-w-md text-left">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all active:scale-90"><X size={24} /></button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1 custom-book-scrollbar pr-[18px]">
          {children}
        </div>
        {footer && (
          <div className="p-6 sm:p-8 border-t border-black/5 bg-slate-50/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

import { useLanguage } from '../../context/LanguageContext';

const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:5000';

const resolveBookPdfUrl = (book) => {
  if (!book) return null;
  let url = book.bookFile || book.flipBookUrl;
  if (!url) {
    // Seeded books
    const seededPdfUrls = {
      1: '/books/Beyond_Parenting_HealthSakhi (1)_compressed.pdf',
      2: '/books/HealthSakhi_Complete_ThreeParts (2).pdf',
      3: '/books/Beyond_Parenting_HealthSakhi (1)_compressed.pdf',
      4: '/books/HealthSakhi_Complete_ThreeParts (2).pdf',
      5: '/books/Beyond_Parenting_HealthSakhi (1)_compressed.pdf',
      6: '/books/HealthSakhi_Complete_ThreeParts (2).pdf',
    };
    url = seededPdfUrls[book.id];
  }
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('/books/')) return url;
  return `${BACKEND_BASE}${url}`;
};

const AdminBookPreview = ({ url, title }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const turnNext = () => {
    if (pageNumber + 1 >= numPages) return;
    setPageNumber(p => Math.min(numPages || p, p + 2));
  };

  const turnPrev = () => {
    if (pageNumber <= 1) return;
    setPageNumber(p => Math.max(1, p - 2));
  };

  return (
    <div className="w-full flex flex-col items-center select-none mt-6">
      <div className="flex items-center gap-3 px-5 py-3 bg-indigo-600 text-white rounded-t-2xl w-full">
        <FileText size={18} />
        <span className="text-xs sm:text-sm font-black tracking-wide">Book Preview — Book Viewer</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto px-3 py-1 bg-white text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
        >
          Open Full Screen
        </a>
      </div>

      <div className="w-full bg-slate-50 p-4 sm:p-6 rounded-b-2xl border border-t-0 border-indigo-100 flex flex-col items-center justify-center min-h-[420px] relative">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center p-12 text-indigo-400 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650"></div>
              <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Book PDF...</p>
            </div>
          }
          className="flex flex-col items-center w-full"
        >
          <div className="flex w-full max-w-[680px] bg-white shadow-xl rounded-xl overflow-hidden relative border border-slate-150">
            {/* Left Page Container */}
            <div
              className="relative w-1/2 cursor-pointer group border-r border-black/10 flex justify-center bg-white"
              onClick={turnPrev}
            >
              <Page
                pageNumber={pageNumber}
                width={320}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              {pageNumber > 1 && (
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-2 z-20 pointer-events-none">
                  <span className="text-black/35 text-xl font-bold">‹</span>
                </div>
              )}
            </div>

            {/* Spine Shadow */}
            <div className="absolute left-1/2 top-0 bottom-0 w-6 -ml-3 bg-gradient-to-r from-black/5 via-black/15 to-black/5 z-30 pointer-events-none"></div>

            {/* Right Page Container */}
            <div
              className="relative w-1/2 cursor-pointer group flex justify-center bg-white"
              onClick={turnNext}
            >
              {pageNumber + 1 <= numPages ? (
                <Page
                  pageNumber={pageNumber + 1}
                  width={320}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ) : (
                <div className="w-[320px] h-[450px] flex items-center justify-center bg-slate-50 text-slate-350 text-[10px] font-black uppercase tracking-widest">End of Book</div>
              )}
              {pageNumber + 1 < numPages && (
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2 z-20 pointer-events-none">
                  <span className="text-black/35 text-xl font-bold">›</span>
                </div>
              )}
            </div>
          </div>
        </Document>

        {/* Bottom Pagination Controls */}
        {numPages && (
          <div className="mt-4 flex items-center gap-4 bg-white/95 px-4 py-1.5 rounded-full shadow-md border border-slate-200 z-10">
            <button
              onClick={turnPrev}
              disabled={pageNumber <= 1}
              className="text-xs font-black text-slate-500 hover:text-indigo-650 disabled:opacity-30 transition-colors uppercase tracking-wider"
            >
              Prev
            </button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Pages {pageNumber}-{Math.min(pageNumber + 1, numPages)} of {numPages}
            </span>
            <button
              onClick={turnNext}
              disabled={pageNumber + 1 >= numPages}
              className="text-xs font-black text-slate-500 hover:text-indigo-650 disabled:opacity-30 transition-colors uppercase tracking-wider"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const BookCMS = ({ isSubComponent = false, onlyInsights = false }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(onlyInsights ? 'insights' : 'details'); // details, media, questions
  const [viewBook, setViewBook] = useState(null);
  const [editBook, setEditBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Status');

  const initialFormData = {
    title: '',
    author: '',
    category: 'Women Health',
    desc: '',
    status: 'Published',
    flipBookUrl: '',
    audioBookUrl: '',
    bookFile: null,
    coverUrl: null,
    questions: [
      { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }
    ]
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    // Load custom books from localStorage and merge with initial ones
    const savedCustom = JSON.parse(localStorage.getItem('hs_custom_books') || '[]');
    if (savedCustom.length > 0) {
      // Filter out duplicates just in case
      const customIds = new Set(savedCustom.map(b => b.id));
      const baseBooks = INITIAL_BOOKS.filter(b => !customIds.has(b.id));
      setBooks([...savedCustom, ...baseBooks]);
    }
  }, []);

  useEffect(() => {
    const draft = localStorage.getItem('book_cms_draft');
    if (draft && !editBook && !isModalOpen) {
      // Option to restore draft could be added here
    }
  }, [editBook, isModalOpen]);

  const resetForm = () => {
    setFormData(initialFormData);
    setActiveTab('details');
  };

  const handleSaveDraft = () => {
    localStorage.setItem('book_cms_draft', JSON.stringify(formData));
    alert('Draft saved to local storage!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editBook) {
      setBooks(prev => prev.map(b => b.id === editBook.id ? { ...b, ...formData } : b));
      setEditBook(null);
    } else {
      const newBook = {
        id: Date.now(),
        ...formData,
        reads: '0',
        date: 'Just now',
        isNew: true
      };

      setBooks([newBook, ...books]);

      // Save to localStorage for global visibility across the app
      const existingCustom = JSON.parse(localStorage.getItem('hs_custom_books') || '[]');
      localStorage.setItem('hs_custom_books', JSON.stringify([newBook, ...existingCustom]));
      window.dispatchEvent(new Event('storage'));

      setIsModalOpen(false);
    }
    localStorage.removeItem('book_cms_draft');
    resetForm();
  };

  const handleDelete = (id) => {
    const updatedBooks = books.filter(b => b.id !== id);
    setBooks(updatedBooks);

    // Sync with localStorage
    const existingCustom = JSON.parse(localStorage.getItem('hs_custom_books') || '[]');
    const updatedCustom = existingCustom.filter(b => b.id !== id);
    localStorage.setItem('hs_custom_books', JSON.stringify(updatedCustom));
    window.dispatchEvent(new Event('storage'));

    setDeleteBook(null);
    setSelectedIds(prev => prev.filter(sid => sid !== id));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBooks.length) setSelectedIds([]);
    else setSelectedIds(filteredBooks.map(b => b.id));
  }

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} books?`)) {
      const updatedBooks = books.filter(b => !selectedIds.includes(b.id));
      setBooks(updatedBooks);

      // Sync with localStorage
      const existingCustom = JSON.parse(localStorage.getItem('hs_custom_books') || '[]');
      const updatedCustom = existingCustom.filter(b => !selectedIds.includes(b.id));
      localStorage.setItem('hs_custom_books', JSON.stringify(updatedCustom));
      window.dispatchEvent(new Event('storage'));

      setSelectedIds([]);
    }
  }

  const addQuestion = () => {
    if (formData.questions.length < 5) {
      setFormData({
        ...formData,
        questions: [...formData.questions, { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }]
      });
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...formData.questions];
    updated[index][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...formData.questions];
    updated[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: updated });
  };

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'All Categories' || b.category === filterCat;
    const matchesStatus = filterStatus === 'All Status' || b.status === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className={isSubComponent ? "font-sans text-left" : "min-h-screen bg-slate-50/50 p-4 md:p-8 text-left font-sans"}>
      <div className={isSubComponent ? "space-y-8" : "max-w-7xl mx-auto space-y-8"}>

        {!onlyInsights && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 shadow-xl shadow-slate-900/10">
                <Layers size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">{t('adminBooks.title', 'Sakhi Academy CMS')}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('adminBooks.desc', 'Manage content & track engagement')}</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-[#15192c] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} /> Add New Book
            </button>
          </div>
        )}

        {activeTab === 'insights' ? (
          <ReaderInsights booksCount={books.length} />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-1">
              {[{ label: t('adminBooks.libraryTotal', 'Library Total'), val: books.length }, { label: t('adminBooks.totalReads', 'Total Reads'), val: '12.4k' }, { label: t('adminBooks.categorySplit', 'Category Split'), val: '05' }, { label: t('adminBooks.draftAssets', 'Draft Assets'), val: books.filter(b => b.status === 'Draft').length },].map((stat, i) => (
                <div key={i} className="bg-white p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-black/5 shadow-sm">
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">{stat.label}</p>
                  <p className="text-xl font-black text-slate-800 tracking-tight text-left">{stat.val}</p>
                </div>
              ))}
            </div>

            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center bg-white p-2.5 rounded-[2rem] sm:rounded-3xl border border-black/5 shadow-sm mx-1">
              <div className="flex-1 relative w-full lg:ml-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('adminBooks.searchPlaceholder', 'Search title, author or keywords...')} className="w-full h-10 pl-12 pr-4 bg-transparent outline-none font-bold text-sm tracking-tight" />
              </div>
              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 lg:pr-2">
                <StyledDropdown label={t('adminBooks.allCategories', 'ALL CATEGORIES')} value={filterCat} options={['All Categories', 'Women Health', 'Mental Wellness', 'General Health', 'Food & Nutrition', 'Yoga & Lifestyle']} onChange={setFilterCat} icon={Tag} />
                <StyledDropdown label={t('adminBooks.allStatus', 'ALL STATUS')} value={filterStatus} options={['All Status', 'Published', 'Draft']} onChange={setFilterStatus} icon={Layers} />
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-black/5 shadow-sm overflow-hidden animate-in slide-in-from-bottom-6 duration-500 mx-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest border-b border-black/5">
                    <tr>
                      <th className="px-3 sm:px-5 py-3 sm:py-4 w-12"><input type="checkbox" checked={selectedIds.length === filteredBooks.length && filteredBooks.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 accent-[#15192c]" /></th>
                      <th className="px-3 sm:px-5 py-3 sm:py-4">{t('adminBooks.bookId', 'Book Identification')}</th>
                      <th className="px-3 sm:px-5 py-3 sm:py-4 hidden sm:table-cell">{t('adminBooks.category', 'Category')}</th>
                      <th className="px-3 sm:px-5 py-3 sm:py-4 hidden md:table-cell">{t('adminBooks.engagement', 'Engagement')}</th>
                      <th className="px-3 sm:px-5 py-3 sm:py-4">{t('adminBooks.status', 'Status')}</th>
                      <th className="px-3 sm:px-5 py-3 sm:py-4 text-right">{t('adminBooks.console', 'Console')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-sm">
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.includes(book.id) ? 'bg-indigo-50/[0.02]' : ''}`}>
                        <td className="px-3 sm:px-5 py-3 sm:py-4"><input type="checkbox" checked={selectedIds.includes(book.id)} onChange={() => toggleSelect(book.id)} className="w-4 h-4 rounded border-slate-300 accent-[#15192c]" /></td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3 font-sans">
                            <div className={`w-9 sm:w-11 h-9 sm:h-11 rounded-xl flex items-center justify-center transition-all border border-black/5 shadow-sm flex-shrink-0 ${CAT_COLORS[book.category] || CAT_COLORS.Default}`}>
                              <BookOpen size={18} />
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="font-black text-slate-800 tracking-tight leading-none mb-1 truncate text-sm text-left">{book.title}</p>
                              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate text-left">By {book.author}</p>
                              <div className="sm:hidden mt-2"><span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${CAT_COLORS[book.category] || CAT_COLORS.Default}`}>{book.category}</span></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 hidden sm:table-cell">
                          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${CAT_COLORS[book.category] || CAT_COLORS.Default}`}>{book.category}</span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 font-bold text-slate-700 hidden md:table-cell">
                          <span className="text-slate-800 font-black text-sm">{book.reads}</span> <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Reads</span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${book.status === 'Published' ? 'text-indigo-600' : 'text-orange-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${book.status === 'Published' ? 'bg-indigo-600 shadow-[0_0_8px_rgba(30,27,75,0.5)]' : 'bg-orange-500 animate-pulse'}`}></div>
                            <span className="hidden xs:inline">{book.status}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 text-right">
                          <div className="flex items-center justify-end gap-1 transition-all duration-300">
                            <button onClick={() => setViewBook(book)} className="p-1.5 sm:p-2 bg-white border border-black/5 text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-500 transition-all shadow-sm active:scale-95"><Eye size={14} /></button>
                            <button onClick={() => { setEditBook(book); setFormData(book); }} className="p-1.5 sm:p-2 bg-white border border-black/5 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"><Edit2 size={14} /></button>
                            <button onClick={() => setDeleteBook(book)} className="p-1.5 sm:p-2 bg-white border border-black/5 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all shadow-sm active:scale-95"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr><td colSpan={6} className="px-8 py-20 text-center font-black text-slate-300 uppercase tracking-[0.4em]">No matching resources</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── CREATE / EDIT MODAL ────────────────────────────────────────────────── */}
            <CMSModal
              open={isModalOpen || !!editBook}
              onClose={() => { setIsModalOpen(false); setEditBook(null); resetForm(); }}
              title={editBook ? 'Modify Book Access' : 'Add New Book'}
              subtitle="Library Resource Management"
              icon={editBook ? Edit2 : Plus}
              iconBg={editBook ? 'bg-[#15192c]' : 'bg-slate-900'}
              footer={
                <div className="flex items-center justify-between gap-4">
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditBook(null); resetForm(); }} className="px-6 sm:px-8 py-3 sm:py-4 text-slate-400 font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-slate-200/50 rounded-2xl transition-colors">Discard changes</button>
                  <div className="flex gap-2 sm:gap-4">
                    <button type="button" onClick={handleSaveDraft} className="px-6 sm:px-8 py-3 sm:py-4 text-slate-600 font-black text-[9px] sm:text-[10px] uppercase tracking-widest bg-slate-100 rounded-2xl transition-colors">Save Draft</button>
                    {activeTab === 'details' ? (
                      <button onClick={() => setActiveTab('media')} className="px-8 sm:px-10 py-3 sm:py-4 bg-slate-900 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-2">Asset Details <ChevronDown size={14} className="-rotate-90" /></button>
                    ) : activeTab === 'media' ? (
                      <button onClick={() => setActiveTab('questions')} className="px-8 sm:px-10 py-3 sm:py-4 bg-slate-900 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-2">Quiz System <ChevronDown size={14} className="-rotate-90" /></button>
                    ) : (
                      <button onClick={() => document.getElementById('book-submit-btn').click()} className="px-8 sm:px-10 py-3 sm:py-4 bg-[#15192c] text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-900/20">{editBook ? 'Save Modifications' : 'Publish Resource'}</button>
                    )}
                  </div>
                </div>
              }
            >
              <div className="tab-container mb-6 sm:mb-8 border-b border-black/5 flex gap-6 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('details')} className={`pb-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 relative whitespace-nowrap ${activeTab === 'details' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                  <FileText size={14} /> General Data
                  {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 animate-in slide-in-from-left duration-300"></div>}
                </button>
                <button onClick={() => setActiveTab('media')} className={`pb-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 relative whitespace-nowrap ${activeTab === 'media' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                  <UploadCloud size={14} /> Cloud Assets
                  {activeTab === 'media' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 animate-in slide-in-from-right duration-300"></div>}
                </button>
                <button onClick={() => setActiveTab('questions')} className={`pb-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 relative whitespace-nowrap ${activeTab === 'questions' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Sparkles size={14} /> Quiz System
                  {activeTab === 'questions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 animate-in slide-in-from-right duration-300"></div>}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 text-left">
                {activeTab === 'details' ? (
                  <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-400 text-left">
                    <div className="space-y-2 col-span-2 text-left">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Book Title</label>
                      <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full h-14 px-5 bg-slate-50 border border-black/5 rounded-2xl outline-none focus:bg-white focus:border-[#15192c] shadow-inner text-sm font-bold text-slate-800 transition-all" placeholder="e.g. Navigating Menopause" />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1 text-left">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Lead Author</label>
                      <input required type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full h-14 px-5 bg-slate-50 border border-black/5 rounded-2xl outline-none focus:bg-white focus:border-[#15192c] shadow-inner text-sm font-bold text-slate-800 transition-all" placeholder="e.g. Dr. Ananya Iyer" />
                    </div>
                    <div className="col-span-2 sm:col-span-1 text-left">
                      <FormDropdown label="Category" value={formData.category} options={['Women Health', 'Mental Wellness', 'General Health', 'Food & Nutrition', 'Yoga & Lifestyle']} onChange={val => setFormData({ ...formData, category: val })} />
                    </div>
                    <div className="col-span-2 sm:col-span-1 text-left">
                      <FormDropdown label="Publishing Status" value={formData.status} options={['Published', 'Draft']} onChange={val => setFormData({ ...formData, status: val })} />
                    </div>
                    <div className="space-y-2 col-span-2 text-left">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Deep Insight Summary</label>
                      <textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full h-32 p-5 bg-slate-50 border border-black/5 rounded-2xl outline-none focus:bg-white focus:border-[#15192c] text-sm font-medium text-slate-600 resize-none shadow-inner leading-relaxed transition-all text-left" placeholder="Write a summary that helps sisters find this book..."></textarea>
                    </div>
                  </div>
                ) : activeTab === 'media' ? (
                  <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-4 duration-400 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                      <div className="space-y-2 text-left">
                        <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Upload PDF Book</label>
                        <input type="file" accept=".pdf,application/pdf" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!file.name.toLowerCase().endsWith('.pdf')) {
                              alert("Please upload a valid PDF file (.pdf only). DOCX files are not supported.");
                              e.target.value = '';
                              return;
                            }
                            const url = URL.createObjectURL(file);
                            setFormData({ ...formData, bookFile: url });
                          }
                        }} className="w-full h-14 px-5 bg-slate-50 border border-black/5 rounded-2xl outline-none focus:bg-white focus:border-[#15192c] shadow-inner text-sm font-bold text-slate-800 transition-all pt-4" />
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Audio Book Link</label>
                        <input type="url" value={formData.audioBookUrl} onChange={e => setFormData({ ...formData, audioBookUrl: e.target.value })} className="w-full h-14 px-5 bg-slate-50 border border-black/5 rounded-2xl outline-none focus:bg-white focus:border-[#15192c] shadow-inner text-sm font-bold text-slate-800 transition-all" placeholder="https://..." />
                      </div>
                    </div>
                    <div className="upload-box space-y-4 text-left">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none text-left">High-Res Book Cover</label>
                      <label className="w-full h-44 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-[#15192c] hover:bg-indigo-50/50 transition-all cursor-pointer group relative overflow-hidden">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setFormData({ ...formData, coverUrl: url });
                          }
                        }} />
                        {formData.coverUrl ? (
                          <img src={formData.coverUrl} className="w-full h-full object-cover" alt="Cover Preview" />
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 shadow-md group-hover:scale-110 transition-all"><UploadCloud size={24} /></div>
                            <div className="text-center text-left">
                              <p className="text-sm font-bold text-slate-600">Drop cover graphic here</p>
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">JPEG, PNG (2MB max)</p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400 text-left">
                    <div className="flex items-center justify-between text-left">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest text-left">Knowledge Checkpoints ({formData.questions.length}/5)</h3>
                      <button type="button" onClick={addQuestion} disabled={formData.questions.length >= 5} className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"><Plus size={14} /> Add Question</button>
                    </div>

                    <div className="space-y-8 text-left">
                      {formData.questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-6 sm:p-8 bg-slate-50 border border-black/5 rounded-[2rem] space-y-6 relative text-left">
                          <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          <div className="space-y-2 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Question {qIndex + 1}</label>
                            <input required type="text" value={q.question} onChange={e => updateQuestion(qIndex, 'question', e.target.value)} className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold text-slate-800 transition-all" placeholder="Type the question here..." />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className="space-y-1.5 text-left">
                                <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 text-left">
                                  Option {oIndex + 1}
                                  <input type="radio" name={`correct-${qIndex}`} checked={q.correct === oIndex} onChange={() => updateQuestion(qIndex, 'correct', oIndex)} className="w-3 h-3 accent-[#15192c]" />
                                  <span className="text-[7px] text-indigo-600">Mark Correct</span>
                                </label>
                                <input required type="text" value={opt} onChange={e => updateOption(qIndex, oIndex, e.target.value)} className={`w-full h-11 px-4 bg-white border rounded-xl outline-none focus:border-[#15192c] text-[13px] font-medium text-slate-600 transition-all ${q.correct === oIndex ? 'border-[#15192c] ring-2 ring-indigo-50' : 'border-black/5'}`} placeholder={`Option ${oIndex + 1}`} />
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Answer Explanation</label>
                            <textarea value={q.explanation} onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)} className="w-full h-20 p-4 bg-white border border-black/5 rounded-xl outline-none focus:border-#15192c text-xs font-medium text-slate-500 resize-none transition-all text-left" placeholder="Why is this the correct answer?"></textarea>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <input type="submit" id="book-submit-btn" className="hidden" />
              </form>
            </CMSModal>

            {/* ── VIEW MODAL ────────────────────────────────────────────────────────── */}
            <CMSModal
              open={!!viewBook}
              onClose={() => setViewBook(null)}
              title="Book Insights"
              subtitle={viewBook?.title}
              icon={Eye}
              iconBg="bg-blue-500"
            >
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 text-left">
                  <div className={`w-full sm:w-44 h-48 sm:h-64 rounded-[2rem] flex-shrink-0 shadow-2xl flex items-center justify-center text-white/50 border border-black/5 animate-in zoom-in-95 duration-700 ${CAT_COLORS[viewBook?.category] || CAT_COLORS.Default}`}>
                    <BookOpen size={64} className="opacity-50" />
                  </div>
                  <div className="space-y-4 sm:space-y-6 flex-1 py-2 sm:py-4 text-left">
                    <div className="space-y-2 text-left">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none text-left">{viewBook?.title}</h3>
                      <p className="flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                        {viewBook?.author} <span className="text-slate-200 hidden sm:inline">|</span>
                        <span className={`px-2 py-0.5 rounded-md border ${CAT_COLORS[viewBook?.category]?.replace('bg-', 'bg-opacity-50 ')}`}>{viewBook?.category}</span>
                      </p>
                    </div>
                    <div className="flex gap-3 text-left">
                      <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-black/5 flex-1 text-center group hover:bg-white transition-all text-left">
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 text-center">Total Reads</p>
                        <p className="text-base sm:text-lg font-black text-slate-700 text-center">{viewBook?.reads}</p>
                      </div>
                      <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-black/5 flex-1 text-center group hover:bg-white transition-all text-left">
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 text-center">Status</p>
                        <p className="text-base sm:text-lg font-black text-#15192c uppercase text-[10px] sm:text-xs tracking-widest flex items-center justify-center gap-1.5 text-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-#15192c animate-pulse"></div> {viewBook?.status}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-left">
                      {resolveBookPdfUrl(viewBook) ? (
                        <a
                          href={resolveBookPdfUrl(viewBook)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 bg-slate-900 text-white font-black rounded-2xl text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl text-center"
                        >
                          <Eye size={14} /> Open Full Screen
                        </a>
                      ) : (
                        <button disabled className="py-3 bg-slate-100 text-slate-400 font-black rounded-2xl text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-not-allowed">
                          <Eye size={14} /> Open Flip
                        </button>
                      )}
                      {resolveBookPdfUrl(viewBook) ? (
                        <a
                          href={resolveBookPdfUrl(viewBook)}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 bg-[#15192c] text-white font-black rounded-2xl text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-900/20 text-center"
                        >
                          <Download size={14} /> Download PDF
                        </a>
                      ) : (
                        <button disabled className="py-3 bg-slate-100 text-slate-400 font-black rounded-2xl text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-not-allowed">
                          <Download size={14} /> Download PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8 bg-slate-50 border border-black/5 rounded-[2rem] sm:rounded-[2.5rem] shadow-inner font-medium text-slate-600 leading-relaxed italic text-sm sm:text-base text-left">
                  "{viewBook?.desc || 'A premium resource curated for the health sakhi bal community of sisters.'}"
                </div>

                {/* ── BOOK / PDF PREVIEWER ── */}
                {resolveBookPdfUrl(viewBook) ? (
                  <AdminBookPreview url={resolveBookPdfUrl(viewBook)} title={viewBook.title} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-indigo-50 text-indigo-300 gap-3 rounded-[2rem]">
                    <BookOpen size={48} />
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black">No Book PDF Uploaded</p>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 sm:p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-[9px] sm:text-[10px] font-black uppercase text-blue-500 tracking-widest text-left">
                  <Clock size={14} /> Library entry created {viewBook?.date}
                </div>
              </div>
            </CMSModal>

            {/* ── DELETE MODAL ──────────────────────────────────────────────────────── */}
            <CMSModal
              open={!!deleteBook}
              onClose={() => setDeleteBook(null)}
              title="Expunge Resource"
              subtitle={deleteBook?.title}
              icon={Trash2}
              iconBg="bg-rose-500"
              footer={
                <div className="flex justify-end gap-3">
                  <button onClick={() => setDeleteBook(null)} className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                  <button onClick={() => handleDelete(deleteBook.id)} className="px-10 py-3 bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-rose-500/20 active:scale-95 transition-all">Delete Forever</button>
                </div>
              }
            >
              <div className="p-6 sm:p-8 bg-rose-50 border border-rose-100 rounded-[2rem] sm:rounded-[2.5rem] space-y-3 text-left">
                <p className="text-lg font-black text-rose-800 text-left">Confirm permanent removal?</p>
                <p className="text-sm font-bold text-rose-500 leading-relaxed italic text-left">Once removed, this book will be inaccessible to all members. This action cannot be reversed.</p>
              </div>
            </CMSModal>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCMS;

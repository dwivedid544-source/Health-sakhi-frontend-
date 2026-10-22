import React, { useState, useEffect } from 'react';
import {
  Play, Sparkles, User, Zap, Plus, Search,
  Filter, MoreVertical, Edit, Trash2, CheckCircle, X, UploadCloud, Video, BookOpen, Clock, Tag, MessageCircle, ChevronDown, Eye, PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import adminApi from '../../api/adminApi';
import contentAssetApi from '../../api/contentAssetApi';

const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:5000';

const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE}${url}`;
};

const SakhiCMS = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('meditation');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    duration: '',
    category: 'All', // Sub-category (e.g. Health, Sleep)
    scripture: 'Bhagavad Gita', // Level 1 (Spiritual)
    focus: 'Wealth', // Level 2 (Spiritual)
    topic: 'Saving Money', // Level 3 (Spiritual)
    author: 'Admin',
    status: 'Published',
    mediaUrl: '',
    type: 'Video Module', // Video, Audio, Text
    partnerA: '',
    partnerB: ''
  });

  const tabs = [
    { id: 'meditation', name: t('adminSakhiCms.meditation', 'Meditation'), icon: Play },
    { id: 'affirmations', name: t('adminSakhiCms.affirmations', 'Affirmations'), icon: Sparkles },
    { id: 'grooming', name: t('adminSakhiCms.grooming', 'Grooming'), icon: User },
    { id: 'spiritual', name: t('adminSakhiCms.gitaWisdom', 'Gita Wisdom'), icon: Zap },
  ];

  const subCategories = {
    meditation: ['All', 'Health', 'Relax', 'Sleep', 'Focus', 'Stress'],
    affirmations: ['Self Love', 'Relationship', 'Couples', 'Meditation', 'Confidence', 'Healing'],
    grooming: ['Skincare', 'Haircare', 'Body', 'Makeup', 'Confidence', 'Routine'],
    spiritual: {
      scriptures: ['Bhagavad Gita', 'Quran', 'Bible', 'Jainism', 'Sikhism', 'Buddhism', 'All'],
      focusAreas: ['Wealth', 'Health', 'Mind', 'Success', 'Relations', 'Spirituality', 'Ethics', 'Life Wisdom'],
      topics: {
        'Wealth': ['Saving Money', 'Earning Ethically', 'Financial Discipline', 'Greed vs Contentment', 'Charity & Donation', 'Detachment from Wealth'],
        'Health': ['Mind-Body Connection', 'Healing Energy', 'Wholesome Food', 'Sacred Sleep', 'Vitality', 'Inner Strength'],
        'Mind': ['Control of Senses', 'Conquering Ego', 'Overcoming Anger', 'Anxiety & Worry', 'Clarity of Thought'],
        'Success': ['Noble Ambition', 'Handling Failure', 'Strategic Planning', 'Honest Hardwork', 'Leadership'],
        'Relations': ['Parents & Family', 'Noble Friendship', 'Compassion', 'Divine Love', 'Trust', 'Forgiveness'],
        'Spirituality': ['Self Realization', 'Law of Karma', 'Path of Devotion', 'Meditation', 'Eternal Soul'],
        'Ethics': ['Truth & Sincerity', 'Non-violence', 'Right Conduct', 'Justice', 'Purity'],
        'Life Wisdom': ['Universal Peace', 'Harmony', 'Service to Humanity', 'Nature & Environment']
      }
    }
  };

  const fetchContent = async () => {
    try {
      const res = await adminApi.getSakhiContent();
      if (res.success) {
        setContentList(res.content);
      }
    } catch (err) {
      console.error("Failed to load Sakhi content:", err);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let finalMediaUrl = formData.mediaUrl;
      
      if (selectedFile) {
        const uploadRes = await contentAssetApi.uploadMediaFile(selectedFile);
        if (uploadRes && uploadRes.success) {
          finalMediaUrl = uploadRes.url;
        }
      }

      let finalDescription = formData.description;
      if (activeTab === 'spiritual') {
        finalDescription = JSON.stringify({
          insight: formData.insight || '',
          example: formData.example || '',
          takeaway: formData.takeaway || '',
          description: formData.description || ''
        });
      }

      const payload = {
        title: (activeTab === 'affirmations' && formData.category === 'Couples') ? `${formData.partnerA || ''} | ${formData.partnerB || ''}` : formData.title,
        description: finalDescription,
        duration: formData.duration,
        category: formData.category,
        scripture: formData.scripture,
        focus: formData.focus,
        topic: formData.topic,
        author: formData.author,
        status: formData.status,
        mediaUrl: finalMediaUrl,
        tab: activeTab
      };

      if (formData.id) {
        await adminApi.updateSakhiContent(formData.id, payload);
      } else {
        await adminApi.createSakhiContent(payload);
      }

      setIsModalOpen(false);
      resetForm();
      fetchContent();
    } catch (err) {
      console.error(err);
      alert("Failed to save content");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await adminApi.deleteSakhiContent(id);
        fetchContent();
      } catch (err) {
        console.error(err);
        alert("Failed to delete content");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      duration: '',
      category: 'All',
      scripture: 'Bhagavad Gita',
      focus: 'Wealth',
      topic: 'Saving Money',
      author: 'Admin',
      status: 'Published',
      mediaUrl: '',
      type: 'Video Module',
      partnerA: '',
      partnerB: '',
      insight: '',
      example: '',
      takeaway: ''
    });
    setSelectedFile(null);
  };

  const filteredList = contentList.filter(item => 
    item.tab === activeTab && 
    (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCounts = (tabId) => contentList.filter(item => item.tab === tabId).length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#15192c]">{t('adminSakhiCms.title', 'Sakhi Content Hub')}</h1>
          <p className="text-[#C4A0AC] font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{t('adminSakhiCms.desc', 'Unified Wellness Management')}</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-[#ff69b4] text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-95 transition-all"
        >
          <Plus size={18} /> {t('adminSakhiCms.addMeditation', 'Add New Meditation Content')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-rose-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-5 flex items-center gap-3 font-black text-[11px] uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === tab.id
                ? 'border-[#ff69b4] text-[#ff69b4]'
                : 'border-transparent text-[#9A8A8E] hover:text-[#15192c]'
              }`}
          >
            <tab.icon size={18} />
            {tab.name}
            <span className={`text-[10px] px-2.5 py-1 rounded-lg ${activeTab === tab.id ? 'bg-[#ff69b4] text-white' : 'bg-rose-50 text-[#ff69b4]'}`}>
              {getCounts(tab.id)}
            </span>
          </button>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C4A0AC] group-focus-within:text-[#ff69b4] transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('adminSakhiCms.searchPlaceholder', 'Search meditation content...')}
            className="w-full pl-14 pr-6 py-4 bg-white border border-rose-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff69b4]/5 focus:border-[#ff69b4] transition-all font-bold text-[#15192c]"
          />
        </div>
        <button className="px-8 py-4 bg-white border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#15192c] flex items-center gap-2 hover:bg-rose-50 transition-all">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-[2.5rem] border border-rose-100 overflow-hidden shadow-2xl shadow-rose-900/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-rose-50/30 border-b border-rose-100">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('adminSakhiCms.titleAuthor', 'Title / Author')}</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('adminSakhiCms.mapping', 'Mapping')}</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('adminSakhiCms.status', 'Status')}</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-50/50">
            {filteredList.length > 0 ? filteredList.map((item) => (
              <tr key={item.id} className="hover:bg-rose-50/20 transition-all group">
                <td className="px-8 py-6">
                  <p className="font-black text-[#15192c] text-sm">{item.title}</p>
                  <p className="text-[10px] font-bold text-[#C4A0AC] uppercase tracking-widest mt-0.5">{item.author} • {item.duration || 'N/A'}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-rose-50 text-[#ff69b4] rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {item.tab === 'spiritual' ? `${item.scripture} > ${item.focus}` : item.category}
                    </span>
                    {item.topic && (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {item.topic}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <CheckCircle size={12} /> {item.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setViewItem(item)}
                      className="p-2.5 hover:bg-blue-100 hover:text-blue-500 rounded-xl transition-all text-[#C4A0AC]"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => { 
                         let pA = '';
                         let pB = '';
                         let insight = '';
                         let example = '';
                         let takeaway = '';
                         let description = item.description || '';
                         
                         if (item.tab === 'affirmations' && item.category === 'Couples' && item.title.includes('|')) {
                           const parts = item.title.split('|');
                           pA = parts[0].trim();
                           pB = parts[1].trim();
                         }
                         
                         if (item.tab === 'spiritual' && item.description && item.description.startsWith('{')) {
                           try {
                             const parsed = JSON.parse(item.description);
                             insight = parsed.insight || '';
                             example = parsed.example || '';
                             takeaway = parsed.takeaway || '';
                             description = parsed.description || '';
                           } catch (e) {}
                         }
                         
                         setFormData({ ...item, partnerA: pA, partnerB: pB, insight, example, takeaway, description }); 
                         setIsModalOpen(true); 
                      }}
                      className="p-2.5 hover:bg-[#15192c] hover:text-white rounded-xl transition-all text-[#C4A0AC]"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 hover:bg-rose-100 rounded-xl transition-all text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <BookOpen size={48} className="text-[#C4A0AC]" />
                    <p className="font-black text-[12px] uppercase tracking-widest text-[#C4A0AC]">No content found in {activeTab}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15192c]/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-rose-50 flex items-center justify-between bg-rose-50/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-xl">
                    <Eye size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#15192c] tracking-tight">
                      Asset Preview
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={() => setViewItem(null)}
                  className="w-10 h-10 flex items-center justify-center text-[#C4A0AC] hover:bg-rose-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto no-scrollbar space-y-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{viewItem?.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Clock size={12} /> {viewItem?.duration || 'N/A'} <span className="mx-1 opacity-30">|</span> <span className="font-black text-indigo-600">{viewItem?.status}</span>
                  </div>
                </div>

                {viewItem?.mediaUrl ? (
                  <div className="w-full rounded-[2rem] overflow-hidden shadow-2xl relative bg-slate-100">
                    {viewItem.mediaUrl.match(/\.(mp4|webm|mov|m4v|avi)(\?.*)?$/i) ? (
                      <video controls playsInline className="w-full max-h-96 object-cover bg-black">
                        <source src={getMediaUrl(viewItem.mediaUrl)} type="video/mp4" />
                      </video>
                    ) : viewItem.mediaUrl.match(/\.(mp3|wav|ogg)(\?.*)?$/i) ? (
                      <div className="p-8 flex flex-col items-center justify-center bg-rose-50 gap-4">
                         <PlayCircle size={48} className="text-[#ff69b4]" />
                         <audio controls className="w-full max-w-md">
                           <source src={getMediaUrl(viewItem.mediaUrl)} type="audio/mpeg" />
                         </audio>
                      </div>
                    ) : (
                      <img src={getMediaUrl(viewItem.mediaUrl)} alt="Asset Preview" className="w-full max-h-96 object-contain" />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-slate-50 text-slate-300 gap-3 rounded-[2rem]">
                    <Eye size={48} />
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black">No Media Uploaded</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 border border-rose-100 rounded-[2rem] bg-rose-50/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] mb-1 flex items-center gap-2"><Tag size={12}/> Category</p>
                    <p className="text-sm font-black uppercase tracking-tight text-[#15192c] leading-none">{viewItem?.tab === 'spiritual' ? `${viewItem?.scripture} > ${viewItem?.focus}` : viewItem?.category}</p>
                  </div>
                  <div className="p-6 border border-rose-100 rounded-[2rem] bg-rose-50/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] mb-1 flex items-center gap-2"><User size={12}/> Author</p>
                    <p className="text-sm font-black uppercase tracking-tight text-[#15192c] leading-none">{viewItem?.author || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-8 bg-white border border-rose-100 rounded-[2.5rem] shadow-sm text-sm font-bold text-slate-500 leading-relaxed">
                  {viewItem?.tab === 'spiritual' ? (
                    <div className="space-y-4">
                       <div><strong className="text-[#15192c]">Meaning / Insight:</strong> {
                         (viewItem?.description?.startsWith('{') ? JSON.parse(viewItem.description).insight : viewItem?.description) || 'N/A'
                       }</div>
                       <div><strong className="text-[#15192c]">Real Life Example:</strong> {
                         (viewItem?.description?.startsWith('{') ? JSON.parse(viewItem.description).example : '') || 'N/A'
                       }</div>
                       <div><strong className="text-[#15192c]">Practical Takeaway:</strong> {
                         (viewItem?.description?.startsWith('{') ? JSON.parse(viewItem.description).takeaway : '') || 'N/A'
                       }</div>
                    </div>
                  ) : (
                    viewItem?.description || 'No description provided.'
                  )}
                </div>
                
                <div className="flex justify-end pt-2">
                  <button onClick={() => setViewItem(null)} className="px-6 py-2 bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all">Dismiss View</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Content Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15192c]/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-rose-50 flex items-center justify-between bg-rose-50/20">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#ff69b4] flex items-center justify-center text-white shadow-xl shadow-rose-200">
                    {formData.id ? <Edit size={24} /> : <Plus size={24} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#15192c] tracking-tight">
                      {formData.id ? 'Edit' : 'Add New'} Sakhi Content
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C4A0AC] mt-1 italic">
                      Publishing to {activeTab.toUpperCase()} module
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-12 h-12 flex items-center justify-center text-[#C4A0AC] hover:bg-rose-100 rounded-full transition-all"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 overflow-y-auto no-scrollbar">
                <form onSubmit={handleAddContent} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Common Header Field */}
                    <div className="col-span-2 space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">
                        {activeTab === 'spiritual' ? 'Content Title (Quote / Shloka)' : 'Content Title'}
                      </label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Deep Breathing 101"
                        className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff69b4]/5 focus:border-[#ff69b4] transition-all font-bold text-[#15192c] placeholder:text-slate-300"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>

                    {/* DYNAMIC SUB-CATEGORY FIELDS */}
                    {activeTab !== 'spiritual' ? (
                      <>
                        <div className="col-span-2 space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">
                            {activeTab === 'affirmations' ? 'Focus Area' : 'Tag / Category'}
                          </label>
                          <select 
                            className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl font-bold text-[#15192c] focus:ring-4 focus:ring-[#ff69b4]/5 outline-none appearance-none"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                            {subCategories[activeTab]?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        
                        {activeTab === 'affirmations' && formData.category === 'Couples' && (
                          <>
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Partner A</label>
                              <input 
                                type="text" placeholder="e.g. I respect your emotions"
                                className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl font-bold text-[#15192c]"
                                value={formData.partnerA || ''}
                                onChange={(e) => setFormData({...formData, partnerA: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Partner B</label>
                              <input 
                                type="text" placeholder="e.g. I feel safe with you"
                                className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl font-bold text-[#15192c]"
                                value={formData.partnerB || ''}
                                onChange={(e) => setFormData({...formData, partnerB: e.target.value})}
                              />
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Holy Scripture</label>
                          <select 
                            className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl font-bold text-[#15192c]"
                            value={formData.scripture}
                            onChange={(e) => setFormData({...formData, scripture: e.target.value})}
                          >
                            {subCategories.spiritual.scriptures.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Wellness Focus</label>
                          <select 
                            className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl font-bold text-[#15192c]"
                            value={formData.focus}
                            onChange={(e) => {
                              const newFocus = e.target.value;
                              const newTopic = subCategories.spiritual.topics[newFocus][0];
                              setFormData({...formData, focus: newFocus, topic: newTopic});
                            }}
                          >
                            {subCategories.spiritual.focusAreas.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        {subCategories.spiritual.topics[formData.focus] && (
                           <div className="col-span-2 space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Specific Topic</label>
                            <select 
                              className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl font-bold text-[#15192c]"
                              value={formData.topic}
                              onChange={(e) => setFormData({...formData, topic: e.target.value})}
                            >
                              {subCategories.spiritual.topics[formData.focus].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        )}
                      </>
                    )}

                    <div className="col-span-2 space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Media URL (YouTube link, MP4 stream link, etc.)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                        className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff69b4]/5 focus:border-[#ff69b4] transition-all font-bold text-[#15192c] placeholder:text-slate-300"
                        value={formData.mediaUrl}
                        onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                      />
                      <p className="text-[10px] text-[#C4A0AC] font-bold mt-1 italic ml-1">
                        Pasting external links (YouTube, MP4 URLs) is highly recommended for persistence.
                      </p>
                    </div>

                    <div className="col-span-2 space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] block mb-3 ml-1">
                        Asset Upload (Audio/Video/Image)
                      </label>
                      <div className={`w-full border-4 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-5 transition-all cursor-pointer group relative ${selectedFile || formData.mediaUrl ? 'border-[#15192c] bg-indigo-50/30' : 'border-rose-50 hover:bg-rose-50/50 hover:border-[#ff69b4]/20'}`}>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                          }
                        }} />
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-transform shadow-inner ${selectedFile || formData.mediaUrl ? 'bg-[#15192c] text-white' : 'bg-rose-100 text-[#ff69b4] group-hover:scale-110'}`}>
                          {selectedFile || formData.mediaUrl ? <CheckCircle size={36} /> : <UploadCloud size={36} />}
                        </div>
                        <div className="text-center">
                          <p className="text-base font-black text-[#15192c]">
                            {selectedFile ? selectedFile.name : formData.mediaUrl ? "Asset already uploaded (Select new to replace)" : `Click to upload ${activeTab} asset`}
                          </p>
                          <p className="text-[11px] font-bold text-[#C4A0AC] mt-1 uppercase tracking-widest">MP3, MP4 or High-Res Image (Max 50MB)</p>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'spiritual' ? (
                      <>
                        <div className="col-span-2 space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Meaning / Insight (Optional)</label>
                          <textarea 
                            rows="3"
                            placeholder="Explain the meaning..."
                            className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff69b4]/5 focus:border-[#ff69b4] transition-all font-bold text-[#15192c] resize-none"
                            value={formData.insight || ''}
                            onChange={(e) => setFormData({...formData, insight: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Real Life Example (Optional)</label>
                          <textarea 
                            rows="2"
                            placeholder="Share a real life example..."
                            className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff69b4]/5 focus:border-[#ff69b4] transition-all font-bold text-[#15192c] resize-none"
                            value={formData.example || ''}
                            onChange={(e) => setFormData({...formData, example: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Practical Takeaway (Optional)</label>
                          <textarea 
                            rows="2"
                            placeholder="What can we learn today..."
                            className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff69b4]/5 focus:border-[#ff69b4] transition-all font-bold text-[#15192c] resize-none"
                            value={formData.takeaway || ''}
                            onChange={(e) => setFormData({...formData, takeaway: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Full Description (Optional)</label>
                          <textarea 
                            rows="4"
                            placeholder="Provide detailed context for the sisters..."
                            className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff69b4]/5 focus:border-[#ff69b4] transition-all font-bold text-[#15192c] resize-none"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] ml-1">Full Description (Optional)</label>
                        <textarea 
                          rows="4"
                          placeholder="Provide detailed context for the sisters..."
                          className="w-full px-6 py-5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#ff69b4]/5 focus:border-[#ff69b4] transition-all font-bold text-[#15192c] resize-none"
                          value={formData.description || ''}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-5 pt-8 border-t border-rose-50">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-10 py-5 text-[#C4A0AC] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isUploading}
                      className={`px-12 py-5 bg-[#15192c] text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-900/40 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                      {isUploading ? 'Uploading & Saving...' : formData.id ? 'Save Changes' : `Publish ${activeTab}`}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SakhiCMS;

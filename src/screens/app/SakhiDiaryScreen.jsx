import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Trash2, Calendar, Heart, Activity, 
  Sparkles, Smile, Droplet, User, Check, Edit2, Download, 
  Trash, ArrowLeft, PlusCircle, Clipboard, FileText, AlertCircle, File
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import diaryApi from '../../api/diaryApi';

const SakhiDiaryScreen = () => {
  const { t, langCode } = useLanguage();
  const { user } = useAuth();
  
  // State variables
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('clinical'); // 'clinical' | 'medicines' | 'nutrition' | 'harmony' | 'notes'
  
  // Report Options Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    patientName: '',
    dateScope: 'selected' // 'selected' | 'all'
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    symptoms: '',
    doctorNotes: '',
    diagnosis: '',
    meals: '',
    waterIntake: 2.0,
    dietType: 'General',
    mood: '😊 Happy',
    harmonyNotes: '',
    gratitude: '',
    personalNotes: '',
    medicines: [],
    reports: []
  });
  
  // File attachments state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Safe Date Formatters to prevent "Invalid Date" crashes
  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString(langCode === 'en' ? 'en-IN' : langCode === 'hi' ? 'hi-IN' : 'mr-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatDateLong = (dateVal) => {
    if (!dateVal) return 'N/A';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString(langCode === 'en' ? 'en-IN' : langCode === 'hi' ? 'hi-IN' : 'mr-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const formatDateShort = (dateVal) => {
    if (!dateVal) return 'N/A';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString(langCode === 'en' ? 'en-IN' : langCode === 'hi' ? 'hi-IN' : 'mr-IN');
  };

  useEffect(() => {
    loadDiaryEntries(page);
  }, [page, langCode]);

  const loadDiaryEntries = async (pageNum) => {
    try {
      setLoading(true);
      const res = await diaryApi.getEntries(pageNum, 5);
      if (res && res.success && res.data) {
        setEntries(res.data.entries);
        setTotalPages(res.data.totalPages);
        
        // Select first entry as default if available
        if (res.data.entries.length > 0 && !selectedEntry) {
          setSelectedEntry(res.data.entries[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load diary entries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open form modal for creating a new entry
  const handleOpenCreateModal = () => {
    setFormData({
      entryDate: new Date().toISOString().split('T')[0],
      symptoms: '',
      doctorNotes: '',
      diagnosis: '',
      meals: '',
      waterIntake: 2.0,
      dietType: 'General',
      mood: '😊 Happy',
      harmonyNotes: '',
      gratitude: '',
      personalNotes: '',
      medicines: [],
      reports: []
    });
    setSelectedFiles([]);
    setActiveFormTab('clinical');
    setIsModalOpen(true);
  };

  // Open form modal for editing an existing entry
  const handleOpenEditModal = (entry) => {
    setFormData({
      id: entry.id,
      entryDate: new Date(entry.entryDate).toISOString().split('T')[0],
      symptoms: entry.symptoms || '',
      doctorNotes: entry.doctorNotes || '',
      diagnosis: entry.diagnosis || '',
      meals: entry.meals || '',
      waterIntake: entry.waterIntake || 0,
      dietType: entry.dietType || 'General',
      mood: entry.mood || '😊 Happy',
      harmonyNotes: entry.harmonyNotes || '',
      gratitude: entry.gratitude || '',
      personalNotes: entry.personalNotes || '',
      medicines: entry.medicines || [],
      reports: entry.reports || []
    });
    setSelectedFiles([]);
    setActiveFormTab('clinical');
    setIsModalOpen(true);
  };

  // Handles adding another medicine row in form
  const handleAddMedicineRow = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          name: '',
          dosage: '1-0-1 (Morning & Night)',
          schedule: 'After Food',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          memberName: ''
        }
      ]
    }));
  };

  // Handles updating fields in dynamic medicine rows
  const handleUpdateMedicineRow = (index, field, value) => {
    setFormData(prev => {
      const updatedMeds = [...prev.medicines];
      updatedMeds[index] = { ...updatedMeds[index], [field]: value };
      return { ...prev, medicines: updatedMeds };
    });
  };

  // Handles removing a medicine row
  const handleRemoveMedicineRow = (index) => {
    setFormData(prev => {
      const updatedMeds = prev.medicines.filter((_, idx) => idx !== index);
      return { ...prev, medicines: updatedMeds };
    });
  };

  // Handle report file selection
  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Handle diary entry deletion
  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this diary entry? 🗑️')) {
      try {
        await diaryApi.deleteEntry(id);
        alert('Entry deleted successfully.');
        setSelectedEntry(null);
        loadDiaryEntries(page);
      } catch (err) {
        console.error('Failed to delete entry:', err);
      }
    }
  };

  // Handle deleting single report file
  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report file? 🗑️')) {
      try {
        await diaryApi.deleteReport(reportId);
        // Remove locally from state
        setFormData(prev => ({
          ...prev,
          reports: prev.reports.filter(r => r.id !== reportId)
        }));
        if (selectedEntry) {
          const updatedReports = selectedEntry.reports.filter(r => r.id !== reportId);
          setSelectedEntry({ ...selectedEntry, reports: updatedReports });
        }
        alert('Report file deleted successfully.');
      } catch (err) {
        console.error('Failed to delete report:', err);
      }
    }
  };

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Handle save diary log submission
  const handleSaveEntry = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const postData = new FormData();
      
      if (formData.id) {
        postData.append('id', formData.id);
      }
      postData.append('entryDate', formData.entryDate);
      postData.append('symptoms', formData.symptoms);
      postData.append('doctorNotes', formData.doctorNotes);
      postData.append('diagnosis', formData.diagnosis);
      postData.append('meals', formData.meals);
      postData.append('waterIntake', formData.waterIntake);
      postData.append('dietType', formData.dietType);
      postData.append('mood', formData.mood);
      postData.append('harmonyNotes', formData.harmonyNotes);
      postData.append('gratitude', formData.gratitude);
      postData.append('personalNotes', formData.personalNotes);
      
      // Append complex object states as stringified arrays
      postData.append('medicines', JSON.stringify(formData.medicines));
      
      // Attach files
      selectedFiles.forEach((file) => {
        postData.append('reports', file);
      });

      const res = await diaryApi.createOrUpdateEntry(postData);
      if (res && res.success) {
        alert(t('diary.savedSuccess', 'Diary entry saved successfully! 📔'));
        setIsModalOpen(false);
        // Update selected entry immediately if returned
        if (res.data) {
          setSelectedEntry(res.data);
        }
        // Reload entries list
        loadDiaryEntries(page);
      }
    } catch (err) {
      console.error('Failed to save entry:', err);
      alert(t('diary.savedError', 'Error saving diary entry. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Open report options modal
  const handleOpenReportModal = () => {
    const defaultName = user?.fullName || user?.name || (selectedEntry ? selectedEntry.memberName : '') || 'Health Sakhi Member';
    setReportOptions({
      patientName: defaultName,
      dateScope: 'selected'
    });
    setIsReportModalOpen(true);
  };

  // Confirm download PDF report with options
  const handleConfirmDownloadPDF = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsGeneratingPdf(true);
      const targetDate = selectedEntry ? new Date(selectedEntry.entryDate).toISOString().split('T')[0] : '';
      const params = {
        patientName: reportOptions.patientName,
        dateScope: reportOptions.dateScope,
        targetDate: reportOptions.dateScope === 'selected' ? targetDate : ''
      };
      const blob = await diaryApi.downloadReport(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      const cleanName = reportOptions.patientName ? reportOptions.patientName.replace(/\s+/g, '_') : 'member';
      link.setAttribute('download', `health_sakhi_report_${cleanName}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsReportModalOpen(false);
    } catch (err) {
      console.error('Failed to download report:', err);
      alert(t('diary.reportError', 'Failed to generate PDF report. Please try again.'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Filter entries based on search query and date
  const filteredEntries = entries.filter((entry) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      (entry.symptoms && entry.symptoms.toLowerCase().includes(q)) ||
      (entry.diagnosis && entry.diagnosis.toLowerCase().includes(q)) ||
      (entry.personalNotes && entry.personalNotes.toLowerCase().includes(q)) ||
      (entry.medicines && entry.medicines.some(m => m.name && m.name.toLowerCase().includes(q)));

    const matchesDate = !filterDate || 
      (entry.entryDate && new Date(entry.entryDate).toISOString().split('T')[0] === filterDate);

    return matchesQuery && matchesDate;
  });

  // Helper asset url resolver
  const getFullAssetUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
      : 'http://localhost:5000';
    return `${base}${url}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-2 sm:p-6 text-left">
      
      {/* ── HEADER BANNER ── */}
      <section className="p-8 rounded-[2.5rem] bg-gradient-to-r from-[#4B1E5A] to-[#ff69b4] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
          <BookOpen size={240} />
        </div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">{t('diary.wellnessDiary', 'Wellness Diary')}</span>
          </div>
          <h1 className="text-3xl font-serif font-black tracking-tight">📔 {t('nav.sakhiDiary', 'Sakhi Diary')}</h1>
          <p className="text-[11px] font-semibold text-pink-100 uppercase tracking-wider max-w-xl">
            {t('diary.diarySubtitle', 'Track daily health metrics, family medicines, water nutrition, and emotional gratitude.')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
          <button 
            onClick={handleOpenReportModal}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Download size={14} /> {t('diary.generateReportPdf', 'GENERATE REPORT PDF')}
          </button>
          <button 
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-white text-[#4B1E5A] hover:bg-pink-50 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus size={16} /> {t('diary.writeHealthLog', '+ Write Health Log')}
          </button>
        </div>
      </section>

      {/* ── CORE GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Timeline Navigation & Filter */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-[#4B1E5A] text-lg">{t('diary.timelineLogs', 'Timeline Logs')}</h3>
              {(searchQuery || filterDate) && (
                <button
                  onClick={() => { setSearchQuery(''); setFilterDate(''); }}
                  className="text-[10px] font-bold text-[#ff69b4] hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder={t('diary.searchLogsPlaceholder', '🔍 Search symptoms, medicines, notes...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-[#ff69b4] transition-all"
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#ff69b4]"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-8 h-8 rounded-full border-4 border-pink-100 border-t-[#ff69b4] animate-spin mx-auto mb-2"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{t('diary.loadingEntries', 'Loading entries...')}</span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-100 rounded-2xl">
                <Clipboard size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-black uppercase">{t('diary.noLogsTitle', 'No logs found')}</p>
                <p className="text-[10px]">{t('diary.noLogsDesc', "No diary logs matching your search filter.")}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredEntries.map((entry) => {
                  const formattedDate = formatDate(entry.entryDate);
                  const isSelected = selectedEntry?.id === entry.id;
                  
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'border-[#ff69b4] bg-pink-50/50 shadow-sm'
                          : 'border-slate-100 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#ff69b4]" />
                          <span className="text-xs font-black text-slate-800">{formattedDate}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                          {entry.symptoms ? `${t('diary.symptoms', 'Symptoms')}: ${entry.symptoms}` : entry.personalNotes ? entry.personalNotes : '...'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {entry.mood && (
                          <span className="text-xs bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                            {entry.mood.split(' ')[0]}
                          </span>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(entry.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(prev => prev - 1)}
                  className="px-3 py-1.5 bg-slate-50 border rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-[10px] font-bold text-slate-500">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-3 py-1.5 bg-slate-50 border rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side: Log Details */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedEntry ? (
              <motion.div
                key={selectedEntry.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-serif font-black text-[#4B1E5A]">
                      {t('diary.logDetails', 'Log Details')}: {formatDateLong(selectedEntry.entryDate)}
                    </h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{t('diary.loggedDatabase', 'Logged in Sakhi database')}</p>
                  </div>
                  <button
                    onClick={() => handleOpenEditModal(selectedEntry)}
                    className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#ff69b4] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 size={13} /> {t('diary.updateLog', 'Update log')}
                  </button>
                </div>
                
                {/* Content Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* 🏥 SECTION 1: Health (Clinical) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <h4 className="text-xs font-black text-[#4B1E5A] uppercase tracking-widest flex items-center gap-2">
                      🏥 {t('diary.clinicalProfile', 'Clinical Profile')}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[9px]">{t('diary.symptomsLogged', 'Symptoms Logged')}</span>
                        <p className="font-semibold text-slate-800">{selectedEntry.symptoms || 'None'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[9px]">{t('diary.diagnosis', 'Diagnosis')}</span>
                        <p className="font-semibold text-slate-800">{selectedEntry.diagnosis || 'None'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[9px]">{t('diary.doctorNotes', 'Doctor visit notes')}</span>
                        <p className="font-semibold text-slate-800">{selectedEntry.doctorNotes || 'None'}</p>
                      </div>
                      {/* Attached PDF/Image reports */}
                      {selectedEntry.reports && selectedEntry.reports.length > 0 && (
                        <div className="pt-2">
                          <span className="font-bold text-slate-400 block uppercase text-[9px] mb-1">{t('diary.attachedReports', 'Attached Reports')} ({selectedEntry.reports.length})</span>
                          <div className="space-y-1.5">
                            {selectedEntry.reports.map(r => (
                              <a
                                key={r.id}
                                href={getFullAssetUrl(r.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-bold hover:underline"
                              >
                                <File size={12} /> {r.fileName || 'View file'}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 🍲 SECTION 2: Nutrition */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <h4 className="text-xs font-black text-[#4B1E5A] uppercase tracking-widest flex items-center gap-2">
                      🍲 {t('diary.dietHydration', 'Diet & Hydration')}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[9px]">{t('diary.dietType', 'Diet Type')}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-black text-[9px] uppercase">
                          {selectedEntry.dietType || 'General'}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[9px]">{t('diary.dailyMeals', 'Daily meals details')}</span>
                        <p className="font-semibold text-slate-800 whitespace-pre-wrap">{selectedEntry.meals || 'Not logged'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[9px] mb-1">{t('diary.waterIntakeGoal', 'Water Intake Goal')}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-sky-400 rounded-full" 
                              style={{ width: `${Math.min((selectedEntry.waterIntake / 4.0) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="font-black text-sky-500 shrink-0 text-[10px]">{selectedEntry.waterIntake || 0}L / 4.0L</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 💊 SECTION 3: Medicines (Span full width) */}
                  <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <h4 className="text-xs font-black text-[#4B1E5A] uppercase tracking-widest flex items-center gap-2">
                      💊 {t('diary.medicationList', 'Medication Track List')} ({selectedEntry.medicines?.length || 0})
                    </h4>
                    
                    {(!selectedEntry.medicines || selectedEntry.medicines.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">{t('diary.noMedicines', 'No medicines logged for this date.')}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                              <th className="py-2 pr-2">{t('diary.medicineName', 'Name')}</th>
                              <th className="py-2 pr-2">{t('diary.dosageSchedule', 'Dosage')}</th>
                              <th className="py-2 pr-2">{t('diary.mealTiming', 'Schedule')}</th>
                              <th className="py-2 pr-2">{t('diary.familyMemberTag', 'Family Tag')}</th>
                              <th className="py-2 text-right">{t('diary.startDate', 'Dates')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEntry.medicines.map((med) => {
                              const startStr = med.startDate ? formatDateShort(med.startDate) : 'N/A';
                              const endStr = med.endDate ? formatDateShort(med.endDate) : t('diary.ongoing', 'Ongoing');
                              
                              return (
                                <tr key={med.id} className="border-b border-slate-100 last:border-0 text-slate-700 font-semibold">
                                  <td className="py-2.5 pr-2 font-bold text-slate-900">{med.name}</td>
                                  <td className="py-2.5 pr-2">{med.dosage}</td>
                                  <td className="py-2.5 pr-2">
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[9px]">
                                      {med.schedule || 'After Food'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 pr-2 text-[#ff69b4]">{med.memberName || 'Myself'}</td>
                                  <td className="py-2.5 text-right text-[10px] text-slate-500 font-mono">{startStr} - {endStr}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* ❤️ SECTION 4: Family Harmony */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <h4 className="text-xs font-black text-[#4B1E5A] uppercase tracking-widest flex items-center gap-2">
                      ❤️ {t('diary.familyHarmonyMood', 'Family Harmony & Mood')}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[9px]">{t('diary.dailyMood', 'Daily Mood')}</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedEntry.mood || 'Not logged'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[9px]">{t('diary.familyInteractions', 'Family Interactions')}</span>
                        <p className="font-semibold text-slate-800">{selectedEntry.harmonyNotes || 'None'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[9px]">{t('diary.gratitudeEntry', 'Gratitude Entry')}</span>
                        <p className="font-semibold text-slate-800 italic">"{selectedEntry.gratitude || 'None'}"</p>
                      </div>
                    </div>
                  </div>

                  {/* 📓 SECTION 5: Personal Diary notes */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <h4 className="text-xs font-black text-[#4B1E5A] uppercase tracking-widest flex items-center gap-2">
                      📓 {t('diary.dailyReflections', 'Daily Reflections')}
                    </h4>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap italic">
                      {selectedEntry.personalNotes ? `"${selectedEntry.personalNotes}"` : t('diary.noReflections', 'No thoughts or reflections logged for this day.')}
                    </p>
                  </div>

                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 text-center text-slate-400 space-y-3">
                <BookOpen size={48} className="mx-auto text-slate-200" />
                <h3 className="text-lg font-serif font-black text-slate-700">No Log Selected</h3>
                <p className="text-xs max-w-sm mx-auto">Select an entry from the left Timeline list or click "Add Today's Log" to log health metrics!</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── CREATE / EDIT DIARY MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-24 pb-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-left overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300 max-h-[82vh] flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  {formData.id ? `✏️ ${t('diary.updateDiaryLog', 'Update Diary Log')}` : `📔 ${t('diary.addDailyLog', 'Add Daily Diary Log')}`}
                </h2>
                <p className="text-[10px] font-bold text-[#ff69b4] uppercase tracking-widest mt-0.5">
                  {t('diary.secureIntegration', 'Secure family health records integration')}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
            
            {/* Form Section Tabs */}
            <div className="flex border-b border-slate-100 overflow-x-auto text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/20 shrink-0">
              {[
                { id: 'clinical', label: `🏥 ${t('diary.clinicalTab', 'Clinical')}` },
                { id: 'medicines', label: `💊 ${t('diary.medicinesTab', 'Medicines')}` },
                { id: 'nutrition', label: `🍲 ${t('diary.dietWaterTab', 'Diet & Water')}` },
                { id: 'harmony', label: `❤️ ${t('diary.harmonyTab', 'Harmony')}` },
                { id: 'notes', label: `📓 ${t('diary.reflectionsTab', 'Reflections')}` }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveFormTab(t.id)}
                  className={`px-5 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeFormTab === t.id 
                      ? 'border-[#ff69b4] text-[#ff69b4]'
                      : 'border-transparent hover:text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEntry} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* DATE PICKER (Visible on all tabs) */}
              <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#ff69b4] block">{t('diary.diaryLogDate', 'Diary Log Date')}</span>
                  <p className="text-[11px] text-slate-500">{t('diary.logAttachedDate', 'Log will be attached to the chosen date.')}</p>
                </div>
                <input
                  type="date"
                  required
                  value={formData.entryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
                  className="px-4 py-2 border rounded-xl outline-none font-bold text-xs bg-white text-slate-800"
                />
              </div>

              {/* 🏥 TAB 1: CLINICAL */}
              {activeFormTab === 'clinical' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.symptoms', 'Symptoms')}</label>
                      <input
                        type="text"
                        placeholder={t('diary.symptomsPlaceholder', 'e.g. fever, headache, bodyache...')}
                        value={formData.symptoms}
                        onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4] transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.diagnosis', 'Diagnosis')}</label>
                      <input
                        type="text"
                        placeholder={t('diary.diagnosisPlaceholder', 'e.g. general viral, migraine...')}
                        value={formData.diagnosis}
                        onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4] transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.doctorNotes', 'Doctor visit notes')}</label>
                    <textarea
                      placeholder={t('diary.doctorNotesPlaceholder', 'Write advice given by doctor or next visit date...')}
                      value={formData.doctorNotes}
                      rows={3}
                      onChange={(e) => setFormData(prev => ({ ...prev, doctorNotes: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4] transition-all resize-none"
                    />
                  </div>

                  {/* Reports Upload */}
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">{t('diary.attachedMedicalReports', 'Attached Medical Reports')}</label>
                    
                    {/* Render already attached backend reports */}
                    {formData.reports && formData.reports.length > 0 && (
                      <div className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        {formData.reports.map(r => (
                          <div key={r.id} className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5"><File size={12} /> {r.fileName}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteReport(r.id)}
                              className="text-red-500 hover:text-red-600 transition-colors p-1"
                              title="Delete file"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Select new files */}
                    <div className="border-2 border-dashed border-slate-200 hover:border-pink-300 p-6 rounded-[2rem] text-center cursor-pointer relative bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FileText size={28} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-black text-slate-600 uppercase">{t('diary.clickUploadReports', 'Click to upload reports')}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{t('diary.uploadFormats', 'Accept PDF, JPG, PNG up to 10MB each')}</p>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="text-[10px] font-bold text-[#ff69b4] flex items-center gap-1">
                        <Check size={12} /> Selected {selectedFiles.length} files to upload: {selectedFiles.map(f => f.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 💊 TAB 2: MEDICINES */}
              {activeFormTab === 'medicines' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.activePrescriptions', 'Active Prescriptions')}</label>
                    <button
                      type="button"
                      onClick={handleAddMedicineRow}
                      className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#ff69b4] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <PlusCircle size={12} /> {t('diary.addMedicine', 'Add Medicine')}
                    </button>
                  </div>
                  
                  {formData.medicines.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 border border-slate-100 rounded-2xl bg-slate-50/50">
                      <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold">{t('diary.noMedicinesToday', 'No medicines registered for today')}</p>
                      <button 
                        type="button"
                        onClick={handleAddMedicineRow}
                        className="text-[10px] font-black uppercase text-[#ff69b4] mt-1 hover:underline"
                      >
                        {t('diary.clickAddMedicine', 'Click here to add first medicine entry')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.medicines.map((med, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1"
                            title="Remove medicine"
                          >
                            <Trash size={14} />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">{t('diary.medicineName', 'Medicine Name')}</label>
                              <input
                                type="text"
                                placeholder={t('diary.medicineNamePlaceholder', 'e.g. Paracetamol 650mg')}
                                value={med.name}
                                onChange={(e) => handleUpdateMedicineRow(idx, 'name', e.target.value)}
                                className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">{t('diary.dosageSchedule', 'Dosage Schedule')}</label>
                              <select
                                value={med.dosage}
                                onChange={(e) => handleUpdateMedicineRow(idx, 'dosage', e.target.value)}
                                className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                              >
                                <option value="1-0-1 (Morning & Night)">1-0-1 (Morning & Night)</option>
                                <option value="1-1-1 (Morning, Afternoon & Night)">1-1-1 (Morning, Afternoon & Night)</option>
                                <option value="1-0-0 (Morning only)">1-0-0 (Morning only)</option>
                                <option value="0-0-1 (Night only)">0-0-1 (Night only)</option>
                                <option value="As needed (SOS)">As needed (SOS)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">{t('diary.mealTiming', 'Meal timing')}</label>
                              <select
                                value={med.schedule || 'After Food'}
                                onChange={(e) => handleUpdateMedicineRow(idx, 'schedule', e.target.value)}
                                className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                              >
                                <option value="After Food">After Food</option>
                                <option value="Before Food">Before Food</option>
                                <option value="With Food">With Food</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">{t('diary.startDate', 'Start Date')}</label>
                              <input
                                type="date"
                                value={med.startDate ? new Date(med.startDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleUpdateMedicineRow(idx, 'startDate', e.target.value)}
                                className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">{t('diary.endDate', 'End Date (Optional)')}</label>
                              <input
                                type="date"
                                value={med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleUpdateMedicineRow(idx, 'endDate', e.target.value)}
                                className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">{t('diary.familyMemberTag', 'Family Member Tag')}</label>
                              <input
                                type="text"
                                placeholder={t('diary.familyMemberPlaceholder', 'e.g. Mother, Father, Myself')}
                                value={med.memberName || ''}
                                onChange={(e) => handleUpdateMedicineRow(idx, 'memberName', e.target.value)}
                                className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 🍲 TAB 3: DIET & WATER */}
              {activeFormTab === 'nutrition' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.dietTypePlan', 'Diet Type Plan')}</label>
                      <select
                        value={formData.dietType}
                        onChange={(e) => setFormData(prev => ({ ...prev, dietType: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                      >
                        <option value="General">General / Standard Diet</option>
                        <option value="Diabetes">Diabetes / Low Sugar</option>
                        <option value="BP (Hypertension)">BP / Low Sodium</option>
                        <option value="Weight Loss">Weight Loss / Low Carb</option>
                        <option value="PCOS">PCOS / High Protein</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.waterConsumption', 'Water Consumption (Litres)')}</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="8"
                        value={formData.waterIntake}
                        onChange={(e) => setFormData(prev => ({ ...prev, waterIntake: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.dailyMealsLogged', 'Daily meals logged')}</label>
                    <textarea
                      placeholder="Breakfast: oats & apple
Lunch: dal, brown rice, green salad
Dinner: roti, dry sabzi, glass of buttermilk..."
                      value={formData.meals}
                      rows={5}
                      onChange={(e) => setFormData(prev => ({ ...prev, meals: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4] transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ❤️ TAB 4: HARMONY */}
              {activeFormTab === 'harmony' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">{t('diary.selectMoodStatus', 'Select Mood Status')}</label>
                    <div className="flex flex-wrap gap-2">
                      {['😊 Happy', '😌 Calm', '😰 Stressed', '🥱 Tired', '😢 Sad', '😡 Angry'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, mood: m }))}
                          className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            formData.mood === m
                              ? 'border-[#ff69b4] bg-pink-50 text-[#ff69b4] shadow-sm'
                              : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.familyInteractionNotes', 'Family Interaction Notes')}</label>
                    <textarea
                      placeholder={t('diary.familyInteractionPlaceholder', 'e.g. Shared a happy breakfast talk with children. Advised mother on BP control.')}
                      value={formData.harmonyNotes}
                      rows={3}
                      onChange={(e) => setFormData(prev => ({ ...prev, harmonyNotes: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4] transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.todayGratitudeLine', "Today's Gratitude Line")}</label>
                    <input
                      type="text"
                      placeholder={t('diary.gratitudePlaceholder', 'I am grateful for...')}
                      value={formData.gratitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, gratitude: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* 📓 TAB 5: NOTES */}
              {activeFormTab === 'notes' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">{t('diary.personalReflections', 'Personal reflections & daily thoughts')}</label>
                    <textarea
                      placeholder={t('diary.reflectionsPlaceholder', 'Write down your thoughts, personal worries, reflection comments...')}
                      value={formData.personalNotes}
                      rows={6}
                      onChange={(e) => setFormData(prev => ({ ...prev, personalNotes: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4] transition-all resize-none"
                    />
                  </div>
                </div>
              )}

            </form>
            
            {/* Modal Action Buttons */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveEntry}
                disabled={isSaving}
                className="px-5 py-2 bg-gradient-to-r from-[#4B1E5A] to-[#ff69b4] hover:opacity-90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>{t('common.saving', 'Saving...')}</>
                ) : (
                  <>
                    <Check size={14} /> {t('common.saveLog', 'Save Log')}
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ── REPORT GENERATION OPTIONS MODAL ── */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-pink-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#ff69b4]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-black text-[#4B1E5A]">
                      {t('diary.generateReportTitle', 'Generate Health Report (PDF)')}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('diary.customReportSubtitle', 'Customize patient name & date range for report export')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmDownloadPDF} className="space-y-5">
                {/* 1. Patient / Member Name Input */}
                <div>
                  <label className="block text-xs font-black uppercase text-[#4B1E5A] mb-1.5">
                    👤 {t('diary.patientNameLabel', 'Patient / Member Name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={reportOptions.patientName}
                    onChange={(e) => setReportOptions({ ...reportOptions, patientName: e.target.value })}
                    placeholder={t('diary.patientNamePlaceholder', 'Enter patient or family member name...')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-[#ff69b4] focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {t('diary.patientNameHint', 'You can leave your logged-in name or enter any custom family member name for this report.')}
                  </p>
                </div>

                {/* 2. Date Scope Option */}
                <div>
                  <label className="block text-xs font-black uppercase text-[#4B1E5A] mb-1.5">
                    📅 {t('diary.dateScopeLabel', 'Select Log Export Scope')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReportOptions({ ...reportOptions, dateScope: 'selected' })}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        reportOptions.dateScope === 'selected'
                          ? 'border-[#ff69b4] bg-pink-50/60 ring-2 ring-pink-200'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs font-black text-[#4B1E5A] mb-0.5">
                        🗓️ {t('diary.singleDateOption', 'Selected Date Only')}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-500">
                        {selectedEntry ? formatDateLong(selectedEntry.entryDate) : 'Current selected log date'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportOptions({ ...reportOptions, dateScope: 'all' })}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        reportOptions.dateScope === 'all'
                          ? 'border-[#ff69b4] bg-pink-50/60 ring-2 ring-pink-200'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs font-black text-[#4B1E5A] mb-0.5">
                        📚 {t('diary.allDatesOption', 'All Logged Dates')}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-500">
                        {t('diary.allDatesDesc', 'Full medical summary of all past entries')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isGeneratingPdf}
                    className="px-6 py-3 bg-[#ff69b4] hover:bg-pink-600 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-pink-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Download size={14} className={isGeneratingPdf ? 'animate-bounce' : ''} />
                    <span>{isGeneratingPdf ? t('diary.generating', 'Generating PDF...') : t('diary.downloadPDF', 'Download Report (PDF)')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SakhiDiaryScreen;

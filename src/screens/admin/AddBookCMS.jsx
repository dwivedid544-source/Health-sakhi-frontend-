import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, UploadCloud, Plus, X, Sparkles, BookOpen, 
  Trash2, Save, RotateCcw, ChevronDown, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Women Health', 'Mental Wellness', 'Nutrition', 'Yoga & Lifestyle'];

const AddBookCMS = () => {
  const navigate = useNavigate();
  const initialFormData = {
    title: '',
    author: '',
    category: 'Women Health',
    desc: '',
    flipBookUrl: '',
    audioBookUrl: '',
    status: 'Published',
    coverImage: null,
    audioFile: null,
    questions: [
      { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }
    ]
  };

  const [formData, setFormData] = useState(initialFormData);

  // Draft restoration
  useEffect(() => {
    const draft = localStorage.getItem('book_cms_draft');
    if (draft) {
      setFormData(JSON.parse(draft));
    }
  }, []);

  const handleSaveDraft = () => {
    localStorage.setItem('book_cms_draft', JSON.stringify(formData));
    alert('Draft saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form?')) {
      setFormData(initialFormData);
      localStorage.removeItem('book_cms_draft');
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }]
    });
  };

  const removeQuestion = (index) => {
    const updated = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updated });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...formData.questions];
    updated[index][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...formData.questions];
    updated[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newBook = {
      id: 'custom-' + Date.now(),
      title: formData.title || 'Untitled Book',
      author: formData.author || 'Dr. Sakhi',
      category: formData.category || 'Wellness',
      desc: formData.desc,
      flipBookUrl: formData.flipBookUrl,
      audioBookUrl: formData.audioBookUrl,
      status: formData.status,
      // If a cover image was uploaded, create an object URL for it, otherwise null
      coverUrl: formData.coverImage ? URL.createObjectURL(formData.coverImage) : null,
      isNew: true,
      pages: 0,
      reads: '0',
    };

    const existing = JSON.parse(localStorage.getItem('hs_custom_books') || '[]');
    localStorage.setItem('hs_custom_books', JSON.stringify([newBook, ...existing]));

    alert('Book added successfully to HealthSakhi Library!');
    localStorage.removeItem('book_cms_draft');
    navigate('/admin/content?tab=books');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="space-y-1">
          <button 
            onClick={() => navigate('/admin/content?tab=books')}
            className="flex items-center gap-2 text-slate-400 hover:text-[#15192c] transition-colors font-black text-[10px] uppercase tracking-widest mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Add New Book</h1>
          <p className="text-slate-500 font-medium text-sm">Create a new wellness resource for the Sakhi community.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all">
            <RotateCcw size={14} /> Reset Form
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#15192c] flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Book Identification</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Book Name</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Hunger Mystery: Inner Healing"
                className="w-full h-14 px-6 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#15192c] transition-all font-bold text-sm text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author</label>
              <input 
                required
                type="text" 
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
                placeholder="e.g. Dr. Sakshi"
                className="w-full h-14 px-6 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#15192c] transition-all font-bold text-sm text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full h-14 px-6 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#15192c] transition-all font-bold text-sm text-slate-800 appearance-none cursor-pointer"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full h-14 px-6 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#15192c] transition-all font-bold text-sm text-slate-800 appearance-none cursor-pointer"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                value={formData.desc}
                onChange={e => setFormData({...formData, desc: e.target.value})}
                placeholder="Provide a brief summary of the book's content..."
                className="w-full h-32 p-6 bg-slate-50 border border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-[#15192c] transition-all font-medium text-sm text-slate-600 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Media Assets */}
        <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <UploadCloud size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Media Assets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Flip Book URL</label>
              <input 
                type="text" 
                value={formData.flipBookUrl}
                onChange={e => setFormData({...formData, flipBookUrl: e.target.value})}
                placeholder="Link to digital flipbook (HTML/PDF)"
                className="w-full h-14 px-6 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#15192c] transition-all font-bold text-sm text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Audio Book</label>
              <div className="relative h-14 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center px-6 group hover:border-[#15192c] transition-all cursor-pointer">
                <input type="file" accept="audio/*" onChange={e => setFormData({...formData, audioFile: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-[#15192c]">
                  <UploadCloud size={18} />
                  <span className="text-xs font-bold truncate">{formData.audioFile ? formData.audioFile.name : 'Choose MP3 file...'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Book Image</label>
              <div className="relative h-32 bg-slate-50 border border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center justify-center group hover:border-[#15192c] transition-all cursor-pointer">
                <input type="file" accept="image/*" onChange={e => setFormData({...formData, coverImage: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                <UploadCloud size={32} className="text-slate-300 group-hover:text-#15192c mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#15192c] transition-colors">
                  {formData.coverImage ? formData.coverImage.name : 'Click to upload cover image (PNG, JPG)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Quiz Section */}
        <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Knowledge Quiz</h2>
            </div>
            <button type="button" onClick={addQuestion} className="h-10 px-4 bg-[#15192c] text-white font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <Plus size={14} /> Add Question
            </button>
          </div>

          <div className="space-y-8">
            {formData.questions.map((q, qIdx) => (
              <div key={qIdx} className="p-6 sm:p-8 bg-slate-50 rounded-[2rem] border border-black/5 space-y-6 relative animate-in zoom-in-95 duration-300">
                <button type="button" onClick={() => removeQuestion(qIdx)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
                
                <div className="space-y-2 pr-10">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Question {qIdx + 1}</label>
                  <input 
                    required
                    type="text" 
                    value={q.question}
                    onChange={e => handleQuestionChange(qIdx, 'question', e.target.value)}
                    placeholder="Enter the assessment question..."
                    className="w-full h-14 px-6 bg-white border border-black/5 rounded-2xl outline-none focus:border-[#15192c] transition-all font-bold text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="space-y-1">
                      <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1 text-left block">Option {oIdx + 1}</label>
                      <input 
                        required
                        type="text" 
                        value={opt}
                        onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                        placeholder={`Choice ${oIdx + 1}`}
                        className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl outline-none focus:border-[#15192c] transition-all font-bold text-xs text-slate-700"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Correct Option</label>
                    <select 
                      value={q.correct}
                      onChange={e => handleQuestionChange(qIdx, 'correct', parseInt(e.target.value))}
                      className="w-full h-14 px-6 bg-white border border-black/5 rounded-2xl outline-none focus:border-[#15192c] transition-all font-bold text-sm text-slate-800 cursor-pointer appearance-none"
                    >
                      {q.options.map((_, i) => <option key={i} value={i}>Option {i + 1}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Explanation Box</label>
                    <input 
                      type="text" 
                      value={q.explanation}
                      onChange={e => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                      placeholder="Why is this the correct answer?"
                      className="w-full h-14 px-6 bg-white border border-black/5 rounded-2xl outline-none focus:border-[#15192c] transition-all font-bold text-sm text-slate-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-8 z-40 bg-white/80 backdrop-blur-md border border-black/5 rounded-3xl p-4 sm:p-6 shadow-2xl flex items-center justify-between gap-4">
           <button type="button" onClick={() => navigate('/admin/content?tab=books')} className="px-6 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-colors">
              Cancel
           </button>
           <div className="flex gap-3">
              <button type="button" onClick={handleSaveDraft} className="px-8 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20">
                <Save size={16} /> Save Draft
              </button>
              <button type="submit" className="px-10 py-4 bg-[#15192c] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-900/40">
                <CheckCircle size={16} /> Add Book
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default AddBookCMS;

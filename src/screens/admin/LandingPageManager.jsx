import React, { useState, useEffect } from 'react';
import { 
  Save, Upload, AlertCircle, CheckCircle, RefreshCw, RotateCcw,
  Layers, Edit3, Code, Eye, EyeOff, Layout, FileText, Image as ImageIcon
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const getAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
      : 'http://localhost:5000';
    return `${backendUrl}${url}`;
  }
  return url;
};

const LandingPageManager = () => {
  const [sections, setSections] = useState([]);
  const [selectedKey, setSelectedKey] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // Notification states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [extraJsonStr, setExtraJsonStr] = useState('{}');
  const [isActive, setIsActive] = useState(true);

  // Editor mode: 'basic' or 'advanced' (JSON raw view)
  const [editorMode, setEditorMode] = useState('basic');

  const fetchSections = async (silently = false) => {
    if (!silently) setLoading(true);
    try {
      const res = await axiosClient.get('/admin/landing-page');
      if (res.data && res.data.success) {
        setSections(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load landing page sections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Update form fields when active section changes
  useEffect(() => {
    if (sections.length > 0) {
      const current = sections.find(s => s.sectionKey === selectedKey);
      if (current) {
        setTitle(current.title || '');
        setSubtitle(current.subtitle || '');
        setDescription(current.description || '');
        setImageUrl(current.imageUrl || '');
        setButtonText(current.buttonText || '');
        setButtonLink(current.buttonLink || '');
        setExtraJsonStr(JSON.stringify(current.extraJson || {}, null, 2));
        setIsActive(current.isActive);
      } else {
        // Clear forms if key not found
        setTitle('');
        setSubtitle('');
        setDescription('');
        setImageUrl('');
        setButtonText('');
        setButtonLink('');
        setExtraJsonStr('{}');
        setIsActive(true);
      }
    }
  }, [selectedKey, sections]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axiosClient.post('/admin/landing-page/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setImageUrl(res.data.imageUrl);
        setSuccessMsg('Image uploaded successfully!');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to upload image. Max limit 5MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Parse extraJson
    let parsedExtra = {};
    try {
      parsedExtra = JSON.parse(extraJsonStr);
    } catch (e) {
      setErrorMsg('Invalid JSON in advanced configuration settings.');
      setSaving(false);
      return;
    }

    try {
      const res = await axiosClient.put(`/admin/landing-page/section/${selectedKey}`, {
        title,
        subtitle,
        description,
        imageUrl,
        buttonText,
        buttonLink,
        extraJson: parsedExtra,
        isActive
      });

      if (res.data && res.data.success) {
        setSuccessMsg(`Section "${selectedKey.toUpperCase()}" updated successfully!`);
        // Refresh local cache silently
        await fetchSections(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update the landing page section.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Are you sure you want to reset the "${selectedKey.toUpperCase()}" section to its default configuration? All your custom changes will be lost.`)) {
      return;
    }

    setResetting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axiosClient.post(`/admin/landing-page/reset/${selectedKey}`);
      if (res.data && res.data.success) {
        setSuccessMsg(`Section "${selectedKey.toUpperCase()}" has been reset to defaults.`);
        // Refresh local cache silently - this will trigger the useEffect to reload form fields
        await fetchSections(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to reset the landing page section.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff69b4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#15192c]">Landing Page Manager</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A0AC] mt-1">Configure live SaaS landing page content</p>
        </div>
        <button
          onClick={() => fetchSections()}
          className="p-3 bg-white border border-[#F5E6EA] rounded-2xl hover:border-[#ff69b4] transition-all"
        >
          <RefreshCw size={18} className="text-[#C4A0AC] hover:text-[#ff69b4]" />
        </button>
      </section>

      {/* NOTIFICATIONS */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <AlertCircle className="text-rose-500 flex-shrink-0" size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR: Sections list */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-[#F5E6EA] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#C4A0AC] px-2 mb-2">Sections</h3>
          <div className="flex flex-col gap-2">
            {sections.map(sec => {
              const isActiveSec = sec.sectionKey === selectedKey;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setSelectedKey(sec.sectionKey);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all text-left ${
                    isActiveSec 
                      ? 'bg-[#15192c] text-white shadow-lg shadow-slate-900/10' 
                      : 'bg-rose-50/10 hover:bg-rose-50/40 text-[#4B1E5A] border border-transparent hover:border-pink-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layout size={16} className={isActiveSec ? 'text-[#ff69b4]' : 'text-[#C4A0AC]'} />
                    <span className="text-xs uppercase tracking-wider">{sec.sectionKey}</span>
                  </div>
                  {sec.isActive ? (
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isActiveSec ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>Active</span>
                  ) : (
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isActiveSec ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-600'}`}>Inactive</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* EDITOR PANELS */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-[#F5E6EA] p-8 lg:p-10 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-[#F5E6EA] pb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#15192c] capitalize">{selectedKey} Config</h2>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#C4A0AC] mt-0.5">Customize fields for {selectedKey} module</p>
            </div>
            
            <div className="flex items-center bg-rose-50/50 p-1 rounded-xl border border-pink-100/30">
              <button
                onClick={() => setEditorMode('basic')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  editorMode === 'basic' ? 'bg-[#ff69b4] text-white' : 'text-[#4B1E5A] hover:bg-rose-100/40'
                }`}
              >
                <Edit3 size={12} /> Basic
              </button>
              <button
                onClick={() => setEditorMode('advanced')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  editorMode === 'advanced' ? 'bg-[#ff69b4] text-white' : 'text-[#4B1E5A] hover:bg-rose-100/40'
                }`}
              >
                <Code size={12} /> JSON (Advanced)
              </button>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* TOGGLE ACTIVE STATUS */}
            <div className="p-5 bg-rose-50/10 rounded-2xl border border-dashed border-[#F5E6EA] flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-[#15192c] uppercase tracking-wider">Section Visibility</p>
                <p className="text-[10px] font-bold text-[#C4A0AC] mt-0.5">Show or hide this section on marketing website</p>
              </div>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}
              >
                <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
              </button>
            </div>

            {editorMode === 'basic' ? (
              <div className="space-y-6">
                
                {/* TITLE & SUBTITLE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1">Section Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full h-12 px-5 bg-rose-50/10 rounded-xl border border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-xs font-bold text-[#4B1E5A]"
                      placeholder="Enter title text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1">Section Subtitle</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={e => setSubtitle(e.target.value)}
                      className="w-full h-12 px-5 bg-rose-50/10 rounded-xl border border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-xs font-bold text-[#4B1E5A]"
                      placeholder="Enter subtitle text"
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full h-28 p-5 bg-rose-50/10 rounded-xl border border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-xs font-bold text-[#4B1E5A] resize-none"
                    placeholder="Enter description text"
                  />
                </div>

                {/* IMAGE URL WITH UPLOAD */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1">Section Image</label>
                  <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        className="flex-1 h-12 px-5 bg-rose-50/10 rounded-xl border border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-xs font-bold text-[#4B1E5A]"
                        placeholder="Image URL or local path"
                      />
                      <label className="h-12 px-5 bg-[#15192c] text-white hover:bg-[#ff69b4] rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer select-none transition-all">
                        <Upload size={14} />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {imageUrl && (
                      <div className="w-16 h-16 rounded-xl border border-[#F5E6EA] overflow-hidden flex-shrink-0 flex items-center justify-center bg-rose-50/20">
                        <img
                          src={getAssetUrl(imageUrl)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* BUTTON TEXT & LINK */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1">Button Text</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={e => setButtonText(e.target.value)}
                      className="w-full h-12 px-5 bg-rose-50/10 rounded-xl border border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-xs font-bold text-[#4B1E5A]"
                      placeholder="e.g. Explore Services"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest ml-1">Button Target Link</label>
                    <input
                      type="text"
                      value={buttonLink}
                      onChange={e => setButtonLink(e.target.value)}
                      className="w-full h-12 px-5 bg-rose-50/10 rounded-xl border border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-xs font-bold text-[#4B1E5A]"
                      placeholder="e.g. #wellness-books"
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-[#4B1E5A] uppercase tracking-widest flex items-center gap-1.5">
                    <Code size={14} className="text-[#ff69b4]" />
                    Advanced JSON configuration
                  </label>
                  <span className="text-[8px] font-black uppercase text-[#C4A0AC] tracking-wider bg-rose-50 px-2 py-0.5 rounded">Raw Editor</span>
                </div>
                
                {/* Advanced Textarea JSON input */}
                <textarea
                  value={extraJsonStr}
                  onChange={e => setExtraJsonStr(e.target.value)}
                  className="w-full h-80 p-5 bg-[#1e1e24] text-[#a9b1d6] font-mono text-xs rounded-2xl border border-slate-700 outline-none focus:border-[#ff69b4] resize-none"
                  style={{ tabSize: 2 }}
                />
                <p className="text-[9px] font-bold text-[#C4A0AC] tracking-wider leading-relaxed">
                  ⚠️ Modify structured arrays (like marquee books, testimonials, pricing features, blogs) by editing this JSON config block directly. Format must be valid JSON syntax.
                </p>
              </div>
            )}
            
            {/* SAVE & RESET ACTIONS */}
            <div className="pt-4 border-t border-[#F5E6EA] flex justify-end gap-4">
              <button
                onClick={handleReset}
                disabled={saving || uploading || resetting}
                className="px-6 py-4 border border-[#F5E6EA] hover:border-[#ff69b4] text-[#4B1E5A] disabled:opacity-50 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                {resetting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    Reset to Default
                  </>
                )}
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving || uploading || resetting}
                className="px-8 py-4 bg-[#ff69b4] hover:bg-[#e05297] disabled:bg-pink-300 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-100 flex items-center gap-2 hover:scale-[1.02] transition-all"
              >
                {saving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Configuration
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default LandingPageManager;

import React from 'react';
import { Image as ImageIcon, Video, Download, Search, Filter, Share2, Play, FileText, ChevronRight, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const MarketingAssets = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = React.useState('All');
  const [copied, setCopied] = React.useState(null);

  const assets = [
    { 
       title: t('marketingAssets.assets.identityPackage.title', 'Identity Package 2024'), 
       type: 'Zip', 
       size: '5.2 MB', 
       category: 'Brand', 
       color: 'bg-slate-100 text-slate-500', 
       desc: t('marketingAssets.assets.identityPackage.desc', 'Logos, SVGs, and brand guidelines for official use.') 
    },
    { 
       title: t('marketingAssets.assets.socialKit.title', 'Women Health Social Kit'), 
       type: 'Image', 
       size: '2.4 MB', 
       category: 'Graphics', 
       color: 'bg-emerald-100 text-emerald-500', 
       desc: t('marketingAssets.assets.socialKit.desc', '5 square banners optimized for WhatsApp & Instagram.') 
    },
    { 
       title: t('marketingAssets.assets.explainer.title', 'AI Sakhi Explainer'), 
       type: 'Video', 
       size: '14.8 MB', 
       category: 'Graphics', 
       color: 'bg-pink-100 text-pink-500', 
       desc: t('marketingAssets.assets.explainer.desc', 'Short video explaining AI-driven PCOD/PCOS guidance.') 
    },
    { 
       title: t('marketingAssets.assets.webinar.title', 'Diabetes Care Webinar'), 
       type: 'Video', 
       size: '22.1 MB', 
       category: 'Graphics', 
       color: 'bg-blue-100 text-blue-500', 
       desc: t('marketingAssets.assets.webinar.desc', 'Teaser clip for professional medical advisor sessions.') 
    },
    { 
       title: t('marketingAssets.assets.badge.title', 'Verified Partner Badge'), 
       type: 'Image', 
       size: '0.8 MB', 
       category: 'Brand', 
       color: 'bg-health-green/10 text-health-green', 
       desc: t('marketingAssets.assets.badge.desc', 'Seal of trust to display on your personal blog/site.' ) 
    },
  ];

  const adCopies = [
    { 
       id: 1, 
       title: t('marketingAssets.copies.script.title', 'Health Alert Script'), 
       text: t('marketingAssets.copies.script.text', 'Hey sisters! I found this amazing platform called HealthSakhi... join me for better wellness! 🌸') 
    },
    { 
       id: 2, 
       title: t('marketingAssets.copies.promotion.title', 'Advisor Promotion'), 
       text: t('marketingAssets.copies.promotion.text', 'Connect with Indias top doctors on HealthSakhi. My personal link for a free first check: [LINK]') 
    }
  ];

  const filtered = filter === 'All' ? assets : assets.filter(a => a.category === filter);

  const handleCopyText = (text, id) => {
      navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-10 font-sans pb-20">
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{t('marketingAssets.title', 'Media Assets')}</h1>
            <p className="text-slate-500 text-sm font-medium">{t('marketingAssets.descPrefix', 'Download high-conversion creative ')}<span className="text-health-green font-black underline decoration-4 underline-offset-4 decoration-health-green/20">{t('marketingAssets.descUnderline', 'identity packs.')}</span></p>
         </div>
         <div className="flex bg-white p-1.5 rounded-2xl border border-black/5 shadow-sm">
            {['All', 'Brand', 'Graphics', 'Copy'].map(cat => {
                const label = t(`marketingAssets.filter${cat}`, cat);
                return (
                    <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}>{label}</button>
                );
            })}
         </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filter === 'Copy' ? (
            adCopies.map(copy => (
              <div key={copy.id} className="bg-white rounded-[1.5rem] p-5 border border-black/5 shadow-sm space-y-3 animate-in zoom-in-95">
                 <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center"><FileText size={14}/></div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">{copy.title}</h3>
                 </div>
                 <div className="p-3.5 bg-slate-50 rounded-xl border border-black/5 relative group">
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic pr-10">"{copy.text}"</p>
                    <button onClick={() => handleCopyText(copy.text, copy.id)} className="absolute top-2 right-2 w-7 h-7 bg-white border border-black/5 rounded-lg flex items-center justify-center text-slate-400 hover:text-health-green transition-all shadow-sm">
                       {copied === copy.id ? <Check size={12} className="text-health-green" /> : <Share2 size={12} />}
                    </button>
                 </div>
                 <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">{t('marketingAssets.optimizedSocial', 'Optimized for Social Conversions')}</p>
              </div>
            ))
          ) : (
             filtered.map((asset, i) => (
                <div key={i} className="bg-white rounded-[1.5rem] border border-black/5 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-in zoom-in-95">
                   <div className={`aspect-video ${asset.color} p-4 flex items-center justify-center relative overflow-hidden`}>
                     <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] transition-opacity"></div>
                      {asset.type === 'Image' && <ImageIcon size={36} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-700 relative z-10" />}
                      {asset.type === 'Video' && <Video size={36} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-700 relative z-10" />}
                      {asset.type === 'Zip' && <FileText size={36} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-700 relative z-10" />}
                      
                      {asset.type === 'Video' && (
                         <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center transition-all duration-500 shadow-xl">
                               <Play size={12} fill="currentColor" className="text-slate-900 ml-0.5" />
                            </div>
                         </div>
                      )}
                      
                      <div className="absolute top-3 left-3 relative z-30">
                         <span className="px-2 py-1 bg-white/80 backdrop-blur shadow-sm text-[7px] font-black uppercase tracking-[0.2em] text-slate-900 rounded-md">
                            {t(`marketingAssets.filter${asset.category}`, asset.category)}
                         </span>
                      </div>
                   </div>
                   
                   <div className="p-4 space-y-3">
                      <div className="space-y-1">
                         <h3 className="text-lg font-black text-slate-900 tracking-tighter leading-none">{asset.title}</h3>
                         <p className="text-[10px] font-medium text-slate-400 leading-relaxed">{asset.desc}</p>
                      </div>
                      <div className="pt-1 flex items-center gap-3">
                         <button className="flex-1 h-9 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group/btn shadow-md shadow-slate-900/10">
                            <Download size={12} className="group-hover/btn:-translate-y-0.5 transition-transform" /> {t('marketingAssets.download', 'Download')} <span className="opacity-30">({asset.size})</span>
                         </button>
                      </div>
                   </div>
                </div>
             ))
          )}
       </div>

      <div className="bg-slate-50 border border-black/5 rounded-[2rem] p-8 flex flex-col items-center text-center space-y-4">
         <div className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center text-health-dark shadow-sm">
            <Share2 size={24} />
         </div>
         <div className="max-w-md space-y-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('marketingAssets.needCustom', 'Need Custom Creatives?')}</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{t('marketingAssets.needCustomDesc', 'Our design team can help you build co-branded banners for your specific audience or website layout.')}</p>
         </div>
         <button className="px-6 py-3 bg-white border border-black/10 text-slate-900 font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 mt-2">
            {t('marketingAssets.requestCustom', 'Request Custom Assets')} <ChevronRight size={14} />
         </button>
      </div>
    </div>
  );
};

export default MarketingAssets;

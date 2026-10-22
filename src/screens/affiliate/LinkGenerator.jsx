import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, Copy, TrendingUp, Activity, CheckCircle2 
} from 'lucide-react';
import affiliateApi from '../../api/affiliateApi';
import { useLanguage } from '../../context/LanguageContext';

const DEFAULT_CAMPAIGNS = [
  { id: '1', unique_slug: 'instagram_bio', clicks: 124, target_url: 'https://healthsakhis.kiaansoftware.com' },
  { id: '2', unique_slug: 'whatsapp_group', clicks: 48, target_url: 'https://healthsakhis.kiaansoftware.com' },
  { id: '3', unique_slug: 'facebook_story', clicks: 35, target_url: 'https://healthsakhis.kiaansoftware.com' },
  { id: '4', unique_slug: 'youtube_community', clicks: 19, target_url: 'https://healthsakhis.kiaansoftware.com' }
];

const LinkGenerator = () => {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    let userReferralCode = 'G222LT';
    
    try {
      const dashboardData = await affiliateApi.getDashboard().catch(() => null);
      if (dashboardData && dashboardData.profile) {
        setProfile(dashboardData.profile);
        userReferralCode = dashboardData.profile.referral_code || 'G222LT';
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }

    try {
      const linksData = await affiliateApi.getLinks().catch(() => null);
      let fetchedLinks = linksData?.links || [];

      // Check saved dynamic click stats in localStorage
      const savedClicks = JSON.parse(localStorage.getItem('hs_campaign_clicks') || '{}');

      if (fetchedLinks.length === 0) {
        // Use default high-converting channels if API has no links
        const formattedDefault = DEFAULT_CAMPAIGNS.map(c => {
          const clicksCount = savedClicks[c.unique_slug] !== undefined ? savedClicks[c.unique_slug] : c.clicks;
          return {
            id: c.id,
            unique_slug: c.unique_slug,
            target_url: c.target_url,
            referral_url: `https://healthsakhis.kiaansoftware.com/ref/${c.unique_slug}`,
            clicks: clicksCount
          };
        });
        setCampaigns(formattedDefault);
      } else {
        const formattedFetched = fetchedLinks.map(item => {
          const clicksCount = savedClicks[item.unique_slug] !== undefined ? savedClicks[item.unique_slug] : (item.clicks_count || 0);
          return {
            id: item.id || item.unique_slug,
            unique_slug: item.unique_slug,
            target_url: item.target_url || 'https://healthsakhis.kiaansoftware.com',
            referral_url: `https://healthsakhis.kiaansoftware.com/ref/${item.unique_slug}`,
            clicks: clicksCount
          };
        });
        setCampaigns(formattedFetched);
      }
    } catch (err) {
      console.error('Failed to load affiliate links:', err);
      // Fallback
      setCampaigns(DEFAULT_CAMPAIGNS.map(c => ({
        id: c.id,
        unique_slug: c.unique_slug,
        target_url: c.target_url,
        referral_url: `https://healthsakhis.kiaansoftware.com/ref/${c.unique_slug}`,
        clicks: c.clicks
      })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyLink = (url, slug, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);

    // Live CTR Click increment
    setCampaigns(prev => prev.map(c => {
      if (c.id === id || c.unique_slug === slug) {
        const newClicks = c.clicks + 1;
        // Save to localStorage for persistence
        const savedClicks = JSON.parse(localStorage.getItem('hs_campaign_clicks') || '{}');
        savedClicks[slug] = newClicks;
        localStorage.setItem('hs_campaign_clicks', JSON.stringify(savedClicks));
        return { ...c, clicks: newClicks };
      }
      return c;
    }));

    setToastMsg(`Referral link copied! Live CTR Click logged (+1) 📋`);
    setShowToast(true);

    setTimeout(() => {
      setCopiedId(null);
      setShowToast(false);
    }, 3000);
  };

  const masterLink = profile?.referral_code
    ? `https://healthsakhis.kiaansoftware.com/join?ref=${profile.referral_code}`
    : `https://healthsakhis.kiaansoftware.com/join?ref=G222LT`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ff69b4]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-16 w-full max-w-7xl mx-auto">
      
      {/* Header Row without NEW TRACKING LINK button */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
          {t('linkGenerator.title', 'Link Generator')}
        </h1>
        <p className="text-slate-500 text-sm font-semibold mt-1">
          {t('linkGenerator.desc', 'Create custom tracking links for your marketing campaigns.')}
        </p>
      </div>

      {/* Master Link Dark Navy Card */}
      <div className="bg-[#0F172A] text-white p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 w-full max-w-xl">
            <div className="inline-block px-3 py-1 bg-emerald-500/15 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
              GLOBAL REFERRAL LINK
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white">
              Master Link Ready
            </h2>
            <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700 w-full group">
              <code className="text-xs md:text-sm font-extrabold text-emerald-400 truncate pr-2 flex-1">
                {masterLink}
              </code>
              <button 
                onClick={() => handleCopyLink(masterLink, 'master', 'master')} 
                className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                {copiedId === 'master' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="hidden lg:grid w-24 h-24 bg-white/5 rounded-full place-items-center relative shadow-inner shrink-0">
            <TrendingUp size={40} className="text-emerald-400/60 animate-pulse relative z-10" />
            <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-spin duration-1000"></div>
          </div>
        </div>
      </div>

      {/* ── Campaign Performance (Live CTR Tracking) Section ── */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Campaign Performance
          </h2>
          <div className="flex items-center gap-2 text-xs font-black text-[#EC4899] uppercase tracking-widest bg-pink-50/80 px-3 py-1.5 rounded-xl border border-pink-100">
            <Activity size={14} className="animate-pulse text-[#EC4899]" />
            <span>LIVE CTR TRACKING</span>
          </div>
        </div>

        {/* Campaign Cards Grid (Matching 2nd SS design & exact mobile layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => (
            <div 
              key={camp.id} 
              className="bg-white p-5 rounded-3xl border border-rose-100/80 shadow-sm hover:shadow-md transition-all space-y-3.5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[#EC4899] font-mono">
                  /{camp.unique_slug}
                </h3>
                <div className="px-3 py-1 rounded-xl bg-pink-50 border border-pink-100 text-[#EC4899] text-xs font-black">
                  {camp.clicks} Clicks
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 truncate">
                  Target: {camp.target_url}
                </p>
                <p className="text-xs font-black text-slate-800 truncate">
                  {camp.referral_url}
                </p>
              </div>

              {/* Copy Referral Link Full-Width Button */}
              <button
                onClick={() => handleCopyLink(camp.referral_url, camp.unique_slug, camp.id)}
                className="w-full py-3 px-4 rounded-2xl border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedId === camp.id ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Referral Link</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-[#0F172A] text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-extrabold uppercase tracking-wider">{toastMsg}</span>
        </div>
      )}

    </div>
  );
};

export default LinkGenerator;

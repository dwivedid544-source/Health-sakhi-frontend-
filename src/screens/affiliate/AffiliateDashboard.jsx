import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, CheckCircle, TrendingUp, Link as LinkIcon, DollarSign, ArrowRight, X, Info, Copy, Check, FileText } from 'lucide-react';
import affiliateApi from '../../api/affiliateApi';
import { useLanguage } from '../../context/LanguageContext';

const AffiliateDashboard = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = React.useState(null);
  const [stats, setStats] = React.useState(null);
  const [commissions, setCommissions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRegistered, setIsRegistered] = React.useState(true);
  const [regWebsite, setRegWebsite] = React.useState('');
  const [regPayment, setRegPayment] = React.useState('');
  const [regLoading, setRegLoading] = React.useState(false);
  const [regError, setRegError] = React.useState('');

  const [showLinkModal, setShowLinkModal] = React.useState(false);
  const [showRulesModal, setShowRulesModal] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await affiliateApi.getDashboard();
      setProfile(data.profile);
      setStats(data.stats);
      setIsRegistered(true);

      const commData = await affiliateApi.getCommissions();
      setCommissions(commData.commissions || []);
    } catch (error) {
      if (error.response?.status === 404 || error.response?.data?.code === 'AFFILIATE_NOT_FOUND') {
        setIsRegistered(false);
      } else {
        console.error('Failed to load dashboard:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadDashboard();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regPayment.trim()) {
      setRegError('Payment details are required.');
      return;
    }
    setRegLoading(true);
    setRegError('');
    try {
      await affiliateApi.register(regWebsite.trim() || undefined, regPayment.trim());
      await loadDashboard();
    } catch (error) {
      setRegError(error.response?.data?.message || 'Onboarding failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const referralLink = profile
    ? `${import.meta.env.VITE_APP_URL || window.location.origin}/register?ref=${profile.referral_code}`
    : '';

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ff69b4]"></div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="space-y-10 font-sans max-w-xl mx-auto pt-10">
        <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2rem] relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex py-1 px-2.5 bg-[#ff69b4]/10 text-[#ff69b4] rounded-md text-[9px] font-black uppercase tracking-widest border border-[#ff69b4]/20">
              {t('affiliate.programName', 'health sakhi tner Program')}
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-none text-white">
              {t('affiliate.joinAs', 'Join as an')} <span className="text-[#ff69b4]">{t('affiliate.affiliate', 'Affiliate.')}</span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed">
              {t('affiliate.description', 'Recommend health sakhi your community. Earn a 20% commission on every premium subscription converted through your link.')}
            </p>

            <form onSubmit={handleRegister} className="space-y-4 pt-4 text-slate-800">
              {regError && (
                <div className="p-3.5 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100">
                  {regError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/50 uppercase tracking-widest ml-1">{t('affiliate.websiteUrl', 'Website URL (Optional)')}</label>
                <input
                  type="url"
                  value={regWebsite}
                  onChange={(e) => setRegWebsite(e.target.value)}
                  className="w-full h-11 px-4 bg-white/10 text-white border border-white/10 rounded-xl outline-none focus:bg-white/20 focus:border-[#ff69b4] text-xs font-bold transition-all"
                  placeholder={t('affiliate.websitePlaceholder', 'https://yourblog.com')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/50 uppercase tracking-widest ml-1">{t('affiliate.paymentDetails', 'Payment Details (Required)')}</label>
                <textarea
                  required
                  rows={3}
                  value={regPayment}
                  onChange={(e) => setRegPayment(e.target.value)}
                  className="w-full p-4 bg-white/10 text-white border border-white/10 rounded-xl outline-none focus:bg-white/20 focus:border-[#ff69b4] text-xs font-bold transition-all font-sans"
                  placeholder={t('affiliate.paymentPlaceholder', 'Provide Bank Details (Account No, IFSC, Holder Name) or UPI ID for payout transfers')}
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-4 bg-[#ff69b4] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#ff69b4]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {regLoading ? t('affiliate.registering', 'Registering...') : t('affiliate.submitApplication', 'Submit Partnership Application')}
              </button>
            </form>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff69b4]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        </div>
      </div>
    );
  }

  // Calculate dynamic stats safely
  const totalEarned = stats?.total_earned ? `₹${Number(stats.total_earned).toLocaleString('en-IN')}` : '₹0';
  const totalReferrals = stats?.total_referrals || 0;
  const currentBalance = stats?.available_balance ? `₹${Number(stats.available_balance).toLocaleString('en-IN')}` : '₹0';
  const conversionRate = stats?.conversion_rate || '0.0%';

  return (
    <div className="space-y-10 font-sans">
      <div className="bg-slate-900 text-white p-6 md:p-10 rounded-[2rem] relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex py-1 px-2.5 bg-[#ff69b4]/10 text-[#ff69b4] rounded-md text-[9px] font-black uppercase tracking-widest border border-[#ff69b4]/20">
              {t('affiliate.performance', 'Direct Partner Performance')}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
              {t('affiliate.impactIs', 'Your impact is')} <span className="text-[#ff69b4]">{t('affiliate.growing', 'Growing.')}</span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-md">
              {t('affiliate.impactDesc', 'Shared HealthSakhi with our sisters and track your commission growth in real-time.')}
            </p>
            <div className="flex gap-4 pt-2">
              <button onClick={() => setShowLinkModal(true)} className="px-6 py-3 bg-[#ff69b4] text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#ff69b4]/20 transition-all">
                {t('affiliate.getLink', 'Get Referral Link')}
              </button>
              <button onClick={() => setShowRulesModal(true)} className="px-6 py-3 bg-white/5 text-white border border-white/10 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                {t('affiliate.viewRules', 'View Rules')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t('affiliate.totalEarnings', 'Total Earnings'), val: totalEarned, change: '+₹0' },
              { label: t('affiliate.totalReferrals', 'Total Referrals'), val: String(totalReferrals), change: '+0' },
              { label: t('affiliate.walletBalance', 'Wallet Balance'), val: currentBalance, change: 'Available' },
              { label: t('affiliate.conversionRate', 'Conversion Rate'), val: conversionRate, change: 'Paid / Total' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-white">{stat.val}</p>
                <p className="text-[#ff69b4] text-[9px] font-bold mt-1.5">{stat.change} {t('affiliate.today', 'today')}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff69b4]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">{t('affiliate.recentConversions', 'Recent Conversions')}</h2>
            <Link to="/affiliate/earnings" className="text-[10px] font-black text-[#ff69b4] uppercase tracking-[0.1em]">{t('affiliate.seeHistory', 'See Detailed History')}</Link>
          </div>
          <div className="bg-white rounded-[1.5rem] border border-black/5 shadow-sm overflow-hidden">
            <div className="divide-y divide-black/5">
              {commissions.length > 0 ? (
                commissions.slice(0, 5).map((comm) => (
                  <div key={comm.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">
                        {comm.referred_user?.full_name ? comm.referred_user.full_name.substring(0, 2).toUpperCase() : 'US'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{comm.referred_user?.full_name || comm.referred_user?.email || 'Anonymous'}</p>
                        <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                          {comm.status === 'paid' ? 'Paid' : 'Commission Approved'} - {new Date(comm.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-[11px]">₹{Number(comm.amount).toFixed(2)}</p>
                      <p className="text-[9px] text-[#ff69b4] font-black uppercase tracking-widest">{comm.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {t('affiliate.noConversions', 'No conversions recorded yet')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800 tracking-tight px-1">{t('affiliate.topAssets', 'Top Performing Assets')}</h2>
          <div className="bg-white rounded-[1.5rem] p-6 border border-black/5 shadow-sm space-y-5">
            {[
              { title: 'Banner - Women Health', usage: '48%' },
              { title: 'Video - PCOD Intro', usage: '32%' },
              { title: 'Coupon - SAKHI20', usage: '20%' }
            ].map((asset, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-700">{asset.title}</span>
                  <span className="text-[9px] font-black text-[#ff69b4]">{asset.usage}</span>
                </div>
                <div className="h-1.5 w-full bg-rose-50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff69b4]" style={{ width: asset.usage }}></div>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-black/5 mt-auto">
              <Link to="/affiliate/assets" className="flex items-center justify-center gap-2 w-full py-3 text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] hover:text-[#ff69b4] hover:bg-rose-50 rounded-xl transition-all">
                {t('affiliate.goToAssets', 'Go to Marketing Assets')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Referral Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 md:p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowLinkModal(false)} className="absolute top-5 right-5 text-[#C4A0AC] hover:text-slate-900 transition-colors"><X size={20} /></button>
            <div className="w-12 h-12 bg-rose-50 text-[#ff69b4] rounded-2xl flex items-center justify-center mb-4">
              <LinkIcon size={24} />
            </div>
            <h3 className="text-2xl font-black text-[#15192c] tracking-tight mb-2">{t('affiliate.referralCode', 'Referral Code')}</h3>
            <p className="text-[#C4A0AC] text-sm font-medium mb-6">{t('affiliate.shareLinkDesc', 'Share this unique link with sisters in your community to track your growth.')}</p>

            <div className="relative group mb-6">
              <input readOnly value={referralLink} className="w-full h-12 pl-4 pr-12 bg-rose-50/20 border rounded-xl font-bold text-slate-700 text-sm outline-none focus:border-[#ff69b4] transition-all" style={{ borderColor: '#F5E6EA' }} />
              <button onClick={handleCopy} className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-white border border-[#F5E6EA] rounded-lg flex items-center justify-center text-slate-400 hover:text-[#ff69b4] hover:shadow-sm transition-all">
                {copied ? <Check size={16} className="text-[#ff69b4] animate-in zoom-in" /> : <Copy size={16} />}
              </button>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
              <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[9px] font-black text-blue-600 leading-relaxed uppercase tracking-widest font-sans">{t('affiliate.commissionInfo', 'Commission is automatically tracked for every pro subscription converted via this link.')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 relative shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden" style={{ border: '1px solid #F5E6EA' }}>
            <button onClick={() => setShowRulesModal(false)} className="absolute top-6 right-6 text-[#C4A0AC] hover:text-slate-900 transition-colors"><X size={20} /></button>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff69b4]/5 rounded-full -mr-12 -mt-12"></div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center"><FileText size={20} /></div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('affiliate.partnerRules', 'Partner Rules')}</h3>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {[
                { title: t('affiliate.ruleTier', 'Commission Tier'), desc: t('affiliate.ruleTierDesc', 'Earn 20% on every direct referral subscription.') },
                { title: t('affiliate.rulePayout', 'Payout Cycle'), desc: t('affiliate.rulePayoutDesc', 'Earnings are disbursed on standard requests or clearing cycles.') },
                { title: t('affiliate.ruleLink', 'Active Link'), desc: t('affiliate.ruleLinkDesc', 'Clicks are valid from the initial interaction via cookie tracking.') },
                { title: t('affiliate.ruleCompliance', 'Compliance'), desc: t('affiliate.ruleComplianceDesc', 'Spamming or misleading sisters through fake claims is strictly prohibited.') }
              ].map((rule, idx) => (
                <div key={idx} className="p-4 bg-rose-50/20 border rounded-2xl space-y-1.5" style={{ borderColor: '#F5E6EA' }}>
                  <p className="text-[9px] font-black text-[#ff69b4] uppercase tracking-[0.2em]">{rule.title}</p>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setShowRulesModal(false)} className="w-full mt-6 py-3.5 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-black transition-all">{t('affiliate.agree', 'I Agree to the Terms')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateDashboard;



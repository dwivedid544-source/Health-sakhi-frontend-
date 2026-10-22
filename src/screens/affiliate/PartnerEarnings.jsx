import React from 'react';
import { DollarSign, Wallet, ArrowUpRight, Calendar, Download, TrendingUp, CheckCircle2, Clock, X, ShieldCheck, Building, Smartphone, Info, Share2, FileText, Check, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import affiliateApi from '../../api/affiliateApi';
import { useLanguage } from '../../context/LanguageContext';

const PartnerEarnings = () => {
   const { t } = useLanguage();
   const [showPayoutModal, setShowPayoutModal] = React.useState(false);
   const [isExporting, setIsExporting] = React.useState(false);
   const [payoutMethod, setPayoutMethod] = React.useState('Bank');
   const [dateRange, setDateRange] = React.useState({ from: '', to: '' });
   const [activeTab, setActiveTab] = React.useState('Commissions');

   const [stats, setStats] = React.useState(null);
   const [commissions, setCommissions] = React.useState([
      {
         id: 'PAY-901',
         created_at: '2024-01-05T00:00:00.000Z',
         amount: 18200,
         allocation_type: 'MONTHLY COMMISSION',
         status: 'processing'
      },
      {
         id: 'PAY-821',
         created_at: '2023-10-01T00:00:00.000Z',
         amount: 14800,
         allocation_type: 'MONTHLY COMMISSION',
         status: 'paid'
      },
      {
         id: 'PAY-742',
         created_at: '2023-09-01T00:00:00.000Z',
         amount: 12400,
         allocation_type: 'MONTHLY COMMISSION',
         status: 'paid'
      },
      {
         id: 'PAY-200',
         created_at: '2023-08-15T00:00:00.000Z',
         amount: 4200,
         allocation_type: 'BONUS INCENTIVE',
         status: 'paid'
      }
   ]);
   const [payouts, setPayouts] = React.useState([]);
   const [isLoading, setIsLoading] = React.useState(true);
   const [isRegistered, setIsRegistered] = React.useState(true);
   const [error, setError] = React.useState('');

   // Form states
   const [holderName, setHolderName] = React.useState('');
   const [accNum, setAccNum] = React.useState('');
   const [ifsc, setIfsc] = React.useState('');
   const [upiId, setUpiId] = React.useState('');
   const [payoutAmount, setPayoutAmount] = React.useState('');
   const [payoutError, setPayoutError] = React.useState('');
   const [isSubmitting, setIsSubmitting] = React.useState(false);

   const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
         const dashboardData = await affiliateApi.getDashboard();
         setStats(dashboardData.stats);
         setIsRegistered(true);
      } catch (err) {
         if (err.response?.status === 404 || err.response?.data?.code === 'AFFILIATE_NOT_FOUND') {
            setIsRegistered(false);
            setIsLoading(false);
            return;
         }
         console.error('Failed to load dashboard:', err);
         setError(t('partnerEarnings.errorProfileInactive', 'Failed to retrieve earnings details. Make sure your profile is active.'));
      }

      try {
         const commissionsData = await affiliateApi.getCommissions();
         if (commissionsData.commissions && commissionsData.commissions.length > 0) {
            setCommissions(commissionsData.commissions);
         }
         
         const payoutsData = await affiliateApi.getPayouts();
         if (payoutsData.payouts && payoutsData.payouts.length > 0) {
            setPayouts(payoutsData.payouts);
         }
      } catch (err) {
         console.error('Failed to load transaction data:', err);
      } finally {
         setIsLoading(false);
      }
   };

   React.useEffect(() => {
      loadData();
   }, []);

   const filteredCommissions = commissions.filter(c => {
      if (!dateRange.from && !dateRange.to) return true;
      const targetDate = new Date(c.created_at);
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;
      if (from && targetDate < from) return false;
      if (to && targetDate > to) return false;
      return true;
   });

   const handleExport = () => {
      setIsExporting(true);

      setTimeout(() => {
         const headers = ["Reference ID", "Date", "Amount", "Status", "Referred User"];
         const rows = filteredCommissions.map(c => [
            c.id, 
            new Date(c.created_at).toISOString().split('T')[0], 
            c.amount, 
            c.status, 
            c.referred_user?.email || 'Anonymous'
         ]);
         const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");

         const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
         const url = URL.createObjectURL(blob);
         const link = document.createElement("a");
         const date = new Date().toISOString().split('T')[0];

         link.setAttribute("href", url);
         link.setAttribute("download", `HS_Statement_${date}.csv`);
         link.style.visibility = 'hidden';
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);

         setIsExporting(false);
      }, 1500);
   };

   const handleRequestPayout = async (e) => {
      e.preventDefault();
      setPayoutError('');

      const amt = parseFloat(payoutAmount);
      const availableBalance = stats?.available_balance || 0;

      if (isNaN(amt) || amt < 1.0) {
         setPayoutError('Payout amount must be a positive number of at least ₹1.0');
         return;
      }

      if (amt > availableBalance) {
         setPayoutError(`Insufficient balance. Maximum available: ₹${availableBalance.toLocaleString('en-IN')}`);
         return;
      }

      setIsSubmitting(true);

      try {
         const paymentDetails = payoutMethod === 'Bank'
            ? `Bank (Name: ${holderName.trim()}, Account: ${accNum.trim()}, IFSC: ${ifsc.trim()})`
            : `UPI ID: ${upiId.trim()}`;

         await affiliateApi.requestPayout(amt, paymentDetails);
         
         // Clear fields
         setPayoutAmount('');
         setShowPayoutModal(false);
         await loadData();
      } catch (err) {
         console.error('Failed to request payout:', err);
         setPayoutError(err.response?.data?.message || 'Failed to submit payout request.');
      } finally {
         setIsSubmitting(false);
      }
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-health-green"></div>
         </div>
      );
   }

    const availableBalanceVal = stats?.available_balance !== undefined ? stats.available_balance : 8420;
    const totalEarnedVal = stats?.total_earned !== undefined ? stats.total_earned : 142800;
    const bonusRewardsVal = 12000;

    const availableBalance = stats?.available_balance || 0;

    const statCards = [
       { 
          label: t('partnerEarnings.availableBalance'), 
          val: `₹${availableBalanceVal.toLocaleString('en-IN')}`, 
          icon: Clock, 
          color: 'text-orange-500', 
          bg: 'bg-orange-50',
          trend: t('partnerEarnings.trendUp')
       },
       { 
          label: t('partnerEarnings.totalCommission'), 
          val: `₹${totalEarnedVal.toLocaleString('en-IN')}`, 
          icon: DollarSign, 
          color: 'text-health-green', 
          bg: 'bg-green-50',
          trend: t('partnerEarnings.trendDown')
       },
       { 
          label: t('partnerEarnings.totalPayouts'), 
          val: `₹${bonusRewardsVal.toLocaleString('en-IN')}`, 
          icon: TrendingUp, 
          color: 'text-blue-500', 
          bg: 'bg-blue-50',
          trend: t('partnerEarnings.trendDown')
       },
    ];

    return (
       <div className="space-y-10 font-sans pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('partnerEarnings.title')}</h1>
                <p className="text-sm text-slate-500 font-medium">{t('partnerEarnings.desc')}</p>
             </div>
             <button onClick={handleExport} disabled={isExporting || filteredCommissions.length === 0} className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl shadow-slate-900/20 hover:bg-black transition-all disabled:opacity-50">
                {isExporting ? <Clock size={16} className="animate-spin" /> : <Download size={16} />}
                {isExporting ? t('partnerEarnings.generatingStatement') : t('partnerEarnings.exportStatement')}
             </button>
          </div>

          {error && (
             <div className="p-4 bg-rose-50 text-rose-500 text-xs font-bold rounded-2xl border border-rose-100">
                {error}
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {statCards.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm relative overflow-hidden group">
                   <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center mb-4`}>
                      <stat.icon size={20} />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-xl font-black text-slate-900 tracking-tight">{stat.val}</p>
                   <div className="mt-3 flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase tracking-widest">
                      <ArrowUpRight size={14} /> {stat.trend}
                   </div>
                </div>
             ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden min-h-[300px]">
             <div className="p-6 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/20">
                <div className="space-y-1.5">
                   <h2 className="text-lg font-black text-slate-800 tracking-tight">{t('partnerEarnings.financialLedgers')}</h2>
                   <div className="flex items-center gap-1.5 text-health-green text-[10px] font-black uppercase tracking-widest">
                      <span className="text-xs">⚡</span>
                      <span>{t('partnerEarnings.liveLedgerVerification')}</span>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="relative group">
                      <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} className="h-9 pr-9 pl-3 bg-white border border-black/5 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none focus:border-health-green transition-all w-36 text-slate-400" />
                      <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-350 pointer-events-none" />
                   </div>
                   <span className="text-[10px] font-black text-slate-300">{t('partnerEarnings.to')}</span>
                   <div className="relative group">
                      <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} className="h-9 pr-9 pl-3 bg-white border border-black/5 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none focus:border-health-green transition-all w-36 text-slate-400" />
                      <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-350 pointer-events-none" />
                   </div>
                   {(dateRange.from || dateRange.to) && (
                      <button onClick={() => setDateRange({ from: '', to: '' })} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title={t('partnerEarnings.resetFilters')}><X size={16} /></button>
                   )}
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-[#fdfdfd] text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-black/5">
                      <tr>
                         <th className="px-6 py-4">{t('partnerEarnings.referenceId')}</th>
                         <th className="px-6 py-4">{t('partnerEarnings.executionDate')}</th>
                         <th className="px-6 py-4">{t('partnerEarnings.revenueNode')}</th>
                         <th className="px-6 py-4">{t('partnerEarnings.referredUser')}</th>
                         <th className="px-6 py-4">{t('partnerEarnings.transmissionStatus')}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-black/5 text-sm">
                      {filteredCommissions.length > 0 ? filteredCommissions.map(comm => {
                         const isMock = comm.id.startsWith('PAY-');
                         const allocationType = comm.allocation_type || (comm.amount < 5000 ? 'BONUS INCENTIVE' : 'MONTHLY COMMISSION');
                         const refIdText = comm.id;
                         const refIdTag = isMock ? comm.id.replace('PAY-', '') : comm.id.substring(0, 3);
                         
                         return (
                            <tr key={comm.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                     <div className="px-2 h-6 bg-slate-100 rounded-md flex items-center justify-center font-black text-slate-400 text-[9px] group-hover:bg-slate-900 group-hover:text-white transition-colors">{refIdTag}</div>
                                     <span className="text-sm font-black text-slate-800 tracking-tight font-mono">{refIdText}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-4 text-sm font-bold text-slate-500">
                                  {new Date(comm.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                               </td>
                               <td className="px-6 py-4 font-black text-slate-900 text-base">
                                  ₹{Number(comm.amount).toLocaleString('en-IN')}
                               </td>
                               <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                     allocationType === 'BONUS INCENTIVE' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'
                                  }`}>
                                     {t(`partnerEarnings.${allocationType === 'BONUS INCENTIVE' ? 'bonusIncentive' : 'monthlyCommission'}`, allocationType)}
                                  </span>
                               </td>
                               <td className="px-6 py-4">
                                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                     comm.status === 'paid' || comm.status === 'approved' || comm.status === 'completed'
                                        ? 'bg-emerald-50 text-health-green border-emerald-100'
                                        : 'bg-orange-50 text-orange-500 border-orange-100'
                                  }`}>
                                     <div className={`w-1 h-1 rounded-full ${
                                        comm.status === 'paid' || comm.status === 'approved' || comm.status === 'completed'
                                           ? 'bg-health-green'
                                           : 'bg-orange-500 animate-pulse'
                                     }`}></div>
                                     {t(`partnerEarnings.${comm.status}`, comm.status)}
                                  </div>
                               </td>
                            </tr>
                         );
                      }) : (
                         <tr><td colSpan={5} className="px-6 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest font-sans">{t('partnerEarnings.noCommissions')}</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>

         <div className="bg-health-dark text-white p-8 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-black/20">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
               <div className="space-y-4">
                  <h2 className="text-2xl font-black tracking-tight leading-tight">{t('partnerEarnings.fundsFasterTitle')}</h2>
                  <p className="text-sm text-white/60 font-medium leading-relaxed max-w-sm font-sans font-medium">
                     {t('partnerEarnings.fundsFasterDesc')}
                  </p>
                  <button onClick={() => {
                     setPayoutError('');
                     setPayoutAmount('');
                     setShowPayoutModal(true);
                  }} className="px-6 py-3 bg-health-green text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-health-green/20 hover:brightness-110 active:scale-95 transition-all">
                     {t('partnerEarnings.requestWithdrawal')}
                  </button>
               </div>
               <div className="flex justify-center md:justify-end">
                  <div className="w-40 h-28 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md relative group">
                     <Wallet size={48} className="text-health-green opacity-40 group-hover:scale-110 transition-transform duration-700" />
                     <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-health-green animate-pulse"></div>
                  </div>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-health-green/5 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
         </div>

         {showPayoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden text-slate-800">
                  <button onClick={() => setShowPayoutModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"><X size={20} /></button>

                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-12 h-12 bg-health-green text-white rounded-xl flex items-center justify-center shadow-lg shadow-health-green/20"><Wallet size={20} /></div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{t('partnerEarnings.withdrawalRequest')}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('partnerEarnings.configureTransfer')}</p>
                     </div>
                  </div>

                  <form onSubmit={handleRequestPayout} className="space-y-5">
                     {payoutError && (
                        <div className="p-3.5 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100 font-sans">
                           {payoutError}
                        </div>
                     )}

                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans">{t('partnerEarnings.withdrawalAmount')}</label>
                        <input 
                           required 
                           type="number" 
                           step="0.01"
                           min="1.0"
                           max={availableBalance}
                           value={payoutAmount} 
                           onChange={e => setPayoutAmount(e.target.value)} 
                           className="w-full h-11 px-4 bg-slate-50 border border-black/5 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-health-green font-mono" 
                           placeholder={t('partnerEarnings.availablePlaceholder').replace('{amount}', availableBalance.toLocaleString('en-IN'))} 
                        />
                     </div>

                     <div className="flex gap-2 p-1.5 bg-slate-50 border border-black/5 rounded-2xl">
                        {['Bank', 'UPI'].map(m => (
                           <button type="button" key={m} onClick={() => setPayoutMethod(m)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${payoutMethod === m ? 'bg-white text-slate-900 shadow-md border border-black/5' : 'text-slate-400 hover:text-slate-600'}`}>
                              {m === 'Bank' ? <Building size={14} /> : <Smartphone size={14} />} {m}
                           </button>
                        ))}
                     </div>

                     {payoutMethod === 'Bank' ? (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans">{t('partnerEarnings.holderName')}</label>
                              <input required type="text" value={holderName} onChange={e => setHolderName(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-black/5 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-health-green" placeholder="e.g. Priya" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans">{t('partnerEarnings.accountNumber')}</label>
                                 <input required type="text" value={accNum} onChange={e => setAccNum(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-black/5 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-health-green" placeholder="Account Number" />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans">{t('partnerEarnings.ifscCode')}</label>
                                 <input required type="text" value={ifsc} onChange={e => setIfsc(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-black/5 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-health-green font-mono" placeholder="HDFC000123" />
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-sans">{t('partnerEarnings.upiId')}</label>
                              <input required type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-black/5 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-health-green font-mono" placeholder="upi@address" />
                           </div>
                        </div>
                     )}

                     <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <ShieldCheck size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[9px] font-bold text-blue-600 leading-relaxed uppercase tracking-widest font-sans">{t('partnerEarnings.securePayoutInfo')}</p>
                     </div>

                     <div className="flex gap-4 mt-6">
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 font-sans">
                           {isSubmitting ? t('partnerEarnings.requesting') : t('partnerEarnings.requestPayout')}
                        </button>
                        <button type="button" onClick={() => setShowPayoutModal(false)} className="px-6 py-3.5 bg-slate-100 text-slate-400 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all font-sans">{t('partnerEarnings.abort')}</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default PartnerEarnings;

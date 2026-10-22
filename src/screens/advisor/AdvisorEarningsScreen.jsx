import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, TrendingUp, Calendar, ArrowRight, CreditCard, Download, Activity, X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useLanguage } from '../../context/LanguageContext';

const AdvisorEarningsScreen = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    net_earnings: 0,
    total_commission: 0,
    payout_pending: 0,
    payout_paid: 0
  });
  const [ledger, setLedger] = useState([]);
  
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ method: 'UPI', details: '' });
  const [requesting, setRequesting] = useState(false);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/advisors/earnings');
      if (res.data) {
        setSummary(res.data.summary || {
          net_earnings: 0,
          total_commission: 0,
          payout_pending: 0,
          payout_paid: 0
        });
        setLedger(res.data.ledger || []);
      }
    } catch (err) {
      console.error("Error fetching advisor earnings:", err);
      setError("Failed to load earnings metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (!requestForm.details.trim()) {
      alert("Please enter your payout details.");
      return;
    }
    setRequesting(true);
    try {
      const res = await axiosClient.post('/advisors/payouts', {
        payoutMethod: requestForm.method,
        payoutDetails: requestForm.details
      });
      if (res.data && res.data.success) {
        alert(res.data.message || 'Payout requested successfully!');
        setIsRequestOpen(false);
        setRequestForm({ method: 'UPI', details: '' });
        fetchEarnings();
      }
    } catch (err) {
      alert('Failed to request payout: ' + (err.response?.data?.message || err.message));
    } finally {
      setRequesting(false);
    }
  };

  const thisMonthEarnings = ledger.reduce((acc, curr) => {
    const date = new Date(curr.session_date);
    const now = new Date();
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      return acc + curr.net_credited;
    }
    return acc;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-900/10 border-t-slate-900 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('advisorEarnings.title', 'Earnings & Analytics')}</h1>
          <p className="text-slate-500 text-sm font-medium">{t('advisorEarnings.desc', 'Tracking your impact and consultation rewards.')}</p>
        </div>
        <div className="flex gap-2">
           <button className="px-5 py-2.5 bg-white border border-black/5 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm">
             <Download size={16} /> {t('advisorEarnings.statements', 'Statements')}
           </button>
           <button
             onClick={() => setIsRequestOpen(true)}
             disabled={summary.payout_pending <= 0}
             className={`px-5 py-2.5 font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all ${
               summary.payout_pending > 0 
                 ? 'bg-slate-900 text-white shadow-slate-900/20 hover:scale-105 active:scale-95' 
                 : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
             }`}
           >
             Request Payout
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('advisorEarnings.unpaidBalance', 'Unpaid Balance'), val: `₹${summary.payout_pending.toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: t('advisorEarnings.totalEarned', 'Total Earned'), val: `₹${summary.net_earnings.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-health-green', bg: 'bg-green-50' },
          { label: t('advisorEarnings.thisMonth', 'This Month'), val: `₹${thisMonthEarnings.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Unpaid Balance', val: `₹${summary.payout_pending.toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Paid / Settled', val: `₹${summary.payout_paid.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-health-green', bg: 'bg-green-50' },
          { label: 'This Month', val: `₹${thisMonthEarnings.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[1.75rem] border border-black/5 shadow-sm relative overflow-hidden group">
            <div className={`w-11 h-11 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500`}>
               <stat.icon size={22} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.val}</p>
            <div className="mt-3 flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest">
               <ArrowUpRight size={14} /> +15.5% growth
            </div>
            {/* Background pattern */}
            <Activity className="absolute -bottom-4 -right-4 size-24 opacity-[0.03] -rotate-12" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">{t('advisorEarnings.recentTransactions', 'Recent Sessions')}</h2>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <Calendar size={14} /> {t('advisorEarnings.last30Days', 'Last 30 Days')}
              </div>
           </div>
           
           <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-black/5">
                       <tr>
                          <th className="px-4 py-4">{t('advisorEarnings.sessionDetails', 'Session Details')}</th>
                          <th className="px-4 py-4">{t('advisorEarnings.user', 'User')}</th>
                          <th className="px-4 py-4">{t('advisorEarnings.amount', 'Amount')}</th>
                          <th className="px-4 py-4">{t('advisorEarnings.status', 'Status')}</th>
                          <th className="px-4 py-4"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-sm">
                       {ledger.length === 0 ? (
                          <tr>
                             <td colSpan="5" className="px-4 py-8 text-center text-slate-400 font-bold">
                                No recent transactions recorded.
                             </td>
                          </tr>
                       ) : (
                          ledger.map(txn => {
                             const txnDate = new Date(txn.session_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                             });
                             return (
                                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                                   <td className="px-4 py-4">
                                      <p className="font-bold text-slate-800">{txn.id.slice(0, 8).toUpperCase()}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{txnDate}</p>
                                   </td>
                                   <td className="px-4 py-4">
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                            {txn.patient_name.split(' ').map(n => n[0]).join('')}
                                         </div>
                                         <span className="font-bold text-slate-600 tracking-tight">{txn.patient_name}</span>
                                      </div>
                                   </td>
                                   <td className="px-4 py-4">
                                      <span className="font-black text-slate-900">₹{txn.net_credited}</span>
                                   </td>
                                   <td className="px-4 py-4">
                                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                         txn.payout_status === 'paid' 
                                           ? 'bg-green-100 text-green-600' 
                                           : txn.payout_status === 'processing'
                                             ? 'bg-blue-100 text-blue-600 animate-pulse'
                                             : 'bg-orange-100 text-orange-600'
                                      }`}>
                                         {txn.payout_status === 'paid' ? t('advisorEarnings.statusCompleted', 'PAID') : t('advisorEarnings.statusPending', 'PENDING')}
                                      </span>
                                   </td>
                                   <td className="px-4 py-4 text-right">
                                      <button className="p-2 text-slate-300 group-hover:text-health-green transition-colors">
                                         <ArrowRight size={18} />
                                      </button>
                                   </td>
                                </tr>
                             );
                          })
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Sidebar Goal Tracking */}
        <div className="space-y-4">
           <h2 className="text-base font-black text-slate-800 tracking-tight px-2">{t('advisorEarnings.rewardsProgress', 'Rewards Progress')}</h2>
           <div className="bg-slate-900 text-white rounded-[1.75rem] p-5 relative overflow-hidden shadow-2xl shadow-slate-900/40">
              <div className="relative z-10 space-y-4">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-health-green uppercase tracking-widest">{t('advisorEarnings.monthlyBonusGoal', 'Monthly Bonus Goal')}</p>
                    <h3 className="text-lg font-black tracking-tight leading-tight">₹{thisMonthEarnings.toLocaleString('en-IN')} <span className="text-white/40 text-sm font-bold">/ ₹20,000</span></h3>
                 </div>
                 <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-health-green shadow-[0_0_15px_rgba(107,203,119,0.5)]" style={{ width: `${Math.min(100, (thisMonthEarnings / 20000) * 100)}%` }}></div>
                 </div>
                 <p className="text-xs text-white/50 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: t('advisorEarnings.milestoneText', 'You are working towards your <span class="text-health-green font-bold">Performance Milestone Bonus</span>. Keep it up!') }}></p>
                 <button className="w-full py-3 bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                    {t('advisorEarnings.viewBonusRules', 'View Bonus Rules')}
                 </button>
              </div>
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-health-green/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>
           </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-black/5 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 leading-none">Request Payout</h3>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Release Pending Balance</span>
                </div>
              </div>
              <button onClick={() => setIsRequestOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all active:scale-90">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRequestPayout} className="p-6 space-y-4">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Amount to Withdraw</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">₹{summary.payout_pending.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">All Earnings</div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payout Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['UPI', 'Bank Transfer'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRequestForm({ ...requestForm, method: m })}
                      className={`h-12 rounded-xl text-xs font-bold transition-all border ${
                        requestForm.method === m 
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {requestForm.method === 'UPI' ? 'UPI ID (e.g. name@upi)' : 'Account No. & IFSC Code'}
                </label>
                <input
                  required
                  type="text"
                  placeholder={requestForm.method === 'UPI' ? 'sister@upi' : 'Account: 9198765432, IFSC: SBIN0001234'}
                  value={requestForm.details}
                  onChange={e => setRequestForm({ ...requestForm, details: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-xs font-bold transition-all shadow-inner"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsRequestOpen(false)}
                  disabled={requesting}
                  className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  {requesting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorEarningsScreen;

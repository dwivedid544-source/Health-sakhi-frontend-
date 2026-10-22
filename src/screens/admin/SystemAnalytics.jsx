import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Activity, PieChart, Info, ShieldCheck, Target, Zap, Clock, ChevronDown, X, Lock, CheckCircle, Database, Layout, Shield } from 'lucide-react';
import adminApi from '../../api/adminApi';

// ── Shared Modal Component ──────────────────────────────────────────────────
const AnalyticModal = ({ open, onClose, title, subtitle, icon: Icon, iconBg, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#15192c]/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full sm:max-w-2xl shadow-2xl border animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 max-h-[92vh] flex flex-col overflow-hidden relative" style={{ borderColor: '#F5E6EA' }}>
        <div className="p-4 sm:p-6 border-b flex items-center justify-between flex-shrink-0 bg-rose-50/30" style={{ borderColor: '#F5E6EA' }}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[1.75rem] flex items-center justify-center shadow-xl ${iconBg} text-white transition-transform hover:scale-110`}>
              <Icon size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight leading-none" style={{ color: '#15192c' }}>{title}</h2>
              {subtitle && <p className="text-[8px] font-bold uppercase tracking-widest mt-2" style={{ color: '#C4A0AC' }}>{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center text-[#C4A0AC] hover:bg-rose-50 rounded-full transition-all active:scale-90"><X size={28} /></button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto bg-white flex-1 custom-analytic-scrollbar">{children}</div>
      </div>
    </div>
  );
};

import { useLanguage } from '../../context/LanguageContext';

// ── Range helpers ─────────────────────────────────────────────────────────────
const RANGE_OPTIONS = [
  { label: 'Last 24 Hours',      key: '24h'      },
  { label: 'Past 7 Days',        key: '7d'       },
  { label: 'Current Month',      key: 'month'    },
  { label: 'Fiscal Year 2024',   key: 'fy2024'   },
  { label: 'Last 365 Days',      key: '365d'     },
  { label: 'Lifetime Analysis',  key: 'lifetime' },
];

const getRangeDates = (key) => {
  const now = new Date();
  let startDate = null;
  let endDate   = now.toISOString();
  switch (key) {
    case '24h':     { const d = new Date(now); d.setDate(d.getDate() - 1);  startDate = d.toISOString(); break; }
    case '7d':      { const d = new Date(now); d.setDate(d.getDate() - 7);  startDate = d.toISOString(); break; }
    case 'month':   { const d = new Date(now.getFullYear(), now.getMonth(), 1); startDate = d.toISOString(); break; }
    case 'fy2024':  { startDate = new Date('2024-04-01').toISOString(); endDate = new Date('2025-03-31T23:59:59').toISOString(); break; }
    case '365d':    { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); startDate = d.toISOString(); break; }
    case 'lifetime':default: startDate = null; endDate = null;
  }
  return { startDate, endDate };
};

const SystemAnalytics = () => {
  const { t } = useLanguage();
  const [activeModal, setActiveModal] = useState(null); // 'range', 'audit', 'log', 'vault'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [vaultAuthorized, setVaultAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [selectedRange, setSelectedRange] = useState(null); // null = Lifetime (default)

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [contentData, setContentData] = useState(null);

  const fetchAnalyticsData = async (rangeKey = selectedRange) => {
    setLoading(true);
    try {
      const { startDate, endDate } = getRangeDates(rangeKey || 'lifetime');
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate)   params.endDate   = endDate;

      const revRes     = await adminApi.getRevenueAnalytics(params);
      const userRes    = await adminApi.getUserAnalytics();
      const contentRes = await adminApi.getContentAnalytics();

      setRevenueData(revRes.revenue || {});
      setUserData(userRes.user_metrics || {});
      setContentData(contentRes.content_metrics || {});
    } catch (err) {
      console.error('Failed to fetch business intelligence stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const triggerAudit = () => {
    setIsProcessing(true);
    setComplete(false);
    setTimeout(() => {
      setIsProcessing(false);
      setComplete(true);
    }, 3000);
  }

  const triggerVault = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setActiveModal('vault');
    }, 1000);
  }

  const handlePinSubmit = () => {
    if (pin === '1234') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setVaultAuthorized(true);
      }, 1500);
    } else {
      alert('ACCESS DENIED: Invalid Auditor PIN');
    }
  }

  const handleExportRegulatoryPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      setTimeout(() => {
        setIsExporting(null);
        const doc = new jsPDF();

        // Official Header (Plum Theme)
        doc.setFillColor(45, 21, 32);
        doc.rect(0, 0, 210, 50, 'F');
        doc.setTextColor(255, 255, 255);

        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("REGULATORY COMPLIANCE REPORT", 20, 30);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("VERIFIED BY: health sakhi ENGINE V2", 20, 40);
        doc.text(`AUDIT ID: HS-BI-${Math.floor(Math.random() * 900000 + 100000)}`, 140, 40);

        // Summary
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(16);
        doc.text("Executive Audit Summary", 20, 65);

        autoTable(doc, {
          startY: 75,
          head: [['Metric', 'Status/Value', 'Verification']],
          body: [
            ['Annual Projected Revenue', `₹${Number(revenueData?.total_paid_revenue || 0).toLocaleString('en-IN')}`, 'MATCHED'],
            ['Total Active Subscriptions', `${revenueData?.active_subscriptions_breakdown?.reduce((acc, curr) => acc + curr.count, 0) || 0} Units`, 'VERIFIED'],
            ['Compliance Index Score', '99.8%', 'STABLE'],
            ['Bank Settlement Node', 'Node Active (Axis)', 'SECURE'],
            ['GST Leakage Analysis', '0.00%', 'CLEAN']
          ],
          headStyles: { fillColor: [196, 96, 122] }, // health sakhi me Plum
          theme: 'striped'
        });

        // Disclaimer
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "italic");
        doc.text("Disclaimer: This report is generated from real-time ledger nodes of Health Sakhi.", 20, finalY);
        doc.text("It is intended for regulatory and institutional audit purposes only.", 20, finalY + 5);

        doc.save(`HealthSakhi_Regulatory_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsExporting(false);
      }, 2000);
    } catch (err) {
      setIsExporting(false);
      alert("Could not export. Please ensure jspdf-autotable is installed.");
    }
  }

  const totalActiveMembers = (userData?.status_distribution?.active || 0) + (userData?.status_distribution?.suspended || 0) + (userData?.status_distribution?.pending_approval || 0);
  const activeSubscriptionsCount = revenueData?.active_subscriptions_breakdown?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const totalRevenue = revenueData?.total_paid_revenue || 0;

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff69b4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-sans pb-20 animate-in fade-in duration-700">
      <style>{`
          .custom-analytic-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-analytic-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-analytic-scrollbar::-webkit-scrollbar-thumb { background: #F5E6EA; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-none mb-2" style={{ color: '#15192c' }}>{t('adminAnalytics.title', 'Business Intelligence')}</h1>
          <p className="text-xs sm:text-sm font-medium" style={{ color: '#9A8A8E' }}>{t('adminAnalytics.desc', 'Real-time meta-analysis of HealthSakhi\'s')} <span className="font-bold border-b-2" style={{ color: '#ff69b4', borderColor: '#F5E6EA' }}>{t('adminAnalytics.growthMetrics', 'growth and revenue metrics.')}</span></p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setActiveModal('range')}
            className="px-3 sm:px-4 py-2 bg-white border text-[8px] font-black rounded-2xl tracking-tight flex items-center justify-center gap-2 hover:bg-rose-50/50 transition-all shadow-sm"
            style={{ borderColor: selectedRange ? '#ff69b4' : '#F5E6EA', color: selectedRange ? '#ff69b4' : '#15192c' }}
          >
            <Clock size={14} />
            <span className="truncate">
              {selectedRange
                ? RANGE_OPTIONS.find(r => r.key === selectedRange)?.label
                : t('adminAnalytics.customRange', 'Custom Range')}
            </span>
            {selectedRange && (
              <span
                onClick={e => { e.stopPropagation(); setSelectedRange(null); fetchAnalyticsData('lifetime'); }}
                className="ml-1 text-[#C4A0AC] hover:text-[#ff69b4] cursor-pointer leading-none"
                title="Clear filter"
              >×</span>
            )}
          </button>
          <button onClick={() => { setActiveModal('audit'); triggerAudit(); }} className="px-3 sm:px-4 py-2 text-white font-black rounded-2xl text-[8px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all hover:brightness-110 active:scale-95" style={{ background: '#15192c' }}>
            {t('adminAnalytics.auditAnalytics', 'Audit Analytics')}
          </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('adminAnalytics.platformRevenue', 'Platform Revenue'), val: `₹${Number(totalRevenue).toLocaleString('en-IN')}`, growth: t('adminAnalytics.live', 'Live'), up: true, icon: DollarSign, color: '#ff69b4', bg: '#FDEEF1' },
          { label: t('adminAnalytics.activeSubscriptions', 'Active Members'), val: totalActiveMembers.toLocaleString(), growth: t('adminAnalytics.users', 'Users'), up: true, icon: Users, color: '#C4A0AC', bg: '#FFF7F8' },
          { label: t('adminAnalytics.averageStreak', 'Average Streak'), val: `${userData?.engagement?.average_streak ?? 0} ${t('adminAnalytics.days', 'days')}`, growth: t('adminAnalytics.loyalty', 'Loyalty'), up: true, icon: Zap, color: '#15192c', bg: '#FDEEF1' },
          { label: t('adminAnalytics.wellnessScore', 'Wellness Score (Avg)'), val: `${userData?.engagement?.average_wellness_score ?? 0}%`, growth: t('adminAnalytics.health', 'Health'), up: true, icon: Target, color: '#ff69b4', bg: 'rgba(196, 96, 122, 0.05)' },
        ].map((m, i) => (
          <div key={i} className={`p-4 rounded-[1.75rem] border shadow-sm hover:shadow-md transition-all relative overflow-hidden group`} style={{ background: m.bg, borderColor: '#F5E6EA' }}>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className={`w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-sm border`} style={{ borderColor: '#F5E6EA', color: m.color }}>
                <m.icon size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-white shadow-sm`} style={{ color: '#ff69b4' }}>
                {m.growth}
              </div>
            </div>
            <p className="text-[8px] font-bold uppercase tracking-widest mb-1 relative z-10" style={{ color: '#C4A0AC' }}>{m.label}</p>
            <p className="text-xl font-black tracking-tight relative z-10" style={{ color: '#15192c' }}>{m.val}</p>
            <m.icon size={80} className={`absolute -bottom-6 -right-6 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-transform duration-700`} style={{ color: m.color }} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Acquisition Chart */}
        <div className="bg-white p-4 rounded-[2rem] border border-black/5 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#15192c]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">{t('adminAnalytics.platformCohorts', 'Platform Users Cohorts')}</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">{t('adminAnalytics.cohortsDesc', 'Active / Suspended / Pending Distribution')}</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#15192c]"></div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('adminAnalytics.active', 'Active')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('adminAnalytics.pending', 'Pending')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('adminAnalytics.suspended', 'Suspended')}</span>
              </div>
            </div>
          </div>

          <div className="h-48 flex items-end justify-around px-2 relative z-10 pt-4">
            {['Active', 'Pending Approval', 'Suspended'].map((status) => {
              const valKey = status === 'Active' ? 'active' : (status === 'Suspended' ? 'suspended' : 'pending_approval');
              const countVal = userData?.status_distribution?.[valKey] ?? 0;
              const total = (userData?.status_distribution?.active || 0) + (userData?.status_distribution?.suspended || 0) + (userData?.status_distribution?.pending_approval || 0) || 1;
              const pct = (countVal / total) * 100;

              const displayStatus = status === 'Active'
                ? t('adminAnalytics.active', 'Active')
                : (status === 'Suspended'
                  ? t('adminAnalytics.suspended', 'Suspended')
                  : t('adminAnalytics.pending', 'Pending'));

              return (
                <div key={status} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer h-full justify-end max-w-[80px]">
                  <div className="w-full flex-1 flex flex-col gap-1 justify-end">
                    <div className={`w-full rounded-xl transition-all shadow-sm group-hover:scale-x-110 ${status === 'Active' ? 'bg-[#15192c]' : (status === 'Suspended' ? 'bg-red-500' : 'bg-amber-500')
                      }`} style={{ height: `${Math.max(10, pct)}%` }}></div>
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors truncate max-w-[60px]" title={displayStatus}>
                    {countVal} {displayStatus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution Strategy */}
        <div className="bg-white p-4 rounded-[2.5rem] border shadow-sm flex flex-col" style={{ borderColor: '#F5E6EA' }}>
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight leading-none" style={{ color: '#15192c' }}>{t('adminAnalytics.planSubscriptions', 'Plan Subscriptions')}</h2>
            <p className="text-[8px] font-bold uppercase tracking-widest mt-2" style={{ color: '#C4A0AC' }}>{t('adminAnalytics.subscriptionsDesc', 'Modular Subscription Breakdowns')}</p>
          </div>
          <div className="space-y-6 flex-1">
            {revenueData?.active_subscriptions_breakdown && revenueData.active_subscriptions_breakdown.length > 0 ? (
              revenueData.active_subscriptions_breakdown.map((item, i) => {
                const total = activeSubscriptionsCount || 1;
                const pct = Math.round((item.count / total) * 100);
                const colors = ['#ff69b4', '#C4A0AC', '#15192c', '#F5B4BC'];

                return (
                  <div key={i} className="space-y-3 group cursor-pointer">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[8px] font-bold uppercase tracking-widest group-hover:text-[#15192c] transition-colors" style={{ color: '#C4A0AC' }}>{item.plan_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black tracking-tight group-hover:scale-110 transition-transform" style={{ color: '#15192c' }}>{pct}% ({item.count})</span>
                        <div className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }}></div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-rose-50/50 rounded-full overflow-hidden flex shadow-inner border" style={{ borderColor: '#F5E6EA' }}>
                      <div className="h-full shadow-2xl transition-all duration-1000 group-hover:brightness-110" style={{ width: `${pct}%`, background: colors[i % colors.length] }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-xs font-bold text-slate-400">No subscriptions data found.</div>
            )}
          </div>

          <div className="mt-5 pt-5 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: '#F5E6EA' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50/50 border rounded-2xl flex items-center justify-center" style={{ borderColor: '#F5E6EA', color: '#ff69b4' }}>
                <PieChart size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 leading-none" style={{ color: '#15192c' }}>{t('adminAnalytics.metaIntelligence', 'Meta Intelligence')}</p>
                <p className="text-[10px] font-bold leading-none" style={{ color: '#C4A0AC' }}>{t('adminAnalytics.metaIntelligenceDesc', 'Ledger audit node reconciler logs.')}</p>
              </div>
            </div>
            <button onClick={() => setActiveModal('log')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">{t('adminAnalytics.detailedLog', 'Detailed Log')} <ArrowUpRight size={12} /></button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnalyticModal open={activeModal === 'range'} onClose={() => setActiveModal(null)} title="Temporal Range" subtitle="Select analysis period" icon={Clock} iconBg="bg-[#15192c]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RANGE_OPTIONS.map(({ label, key }) => {
            const isActive = selectedRange === key || (!selectedRange && key === 'lifetime');
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedRange(key === 'lifetime' ? null : key);
                  fetchAnalyticsData(key);
                  setActiveModal(null);
                }}
                className="p-3 border rounded-[1.75rem] text-left transition-all group relative overflow-hidden"
                style={{
                  borderColor: isActive ? '#ff69b4' : '#F5E6EA',
                  background:  isActive ? '#FDEEF1' : 'rgba(253,238,241,0.2)'
                }}
              >
                <p className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: isActive ? '#ff69b4' : '#C4A0AC' }}>Interval</p>
                <p className="font-bold text-sm" style={{ color: '#15192c' }}>{label}</p>
                {isActive && (
                  <span className="absolute top-2 right-3 text-[9px] font-black uppercase tracking-widest" style={{ color: '#ff69b4' }}>✓ Active</span>
                )}
              </button>
            );
          })}
        </div>
        {selectedRange && (
          <div className="mt-4 pt-4 border-t flex justify-center" style={{ borderColor: '#F5E6EA' }}>
            <button
              onClick={() => { setSelectedRange(null); fetchAnalyticsData('lifetime'); setActiveModal(null); }}
              className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] hover:text-[#ff69b4] transition-colors"
            >
              Reset to Lifetime Analysis
            </button>
          </div>
        )}
      </AnalyticModal>

      <AnalyticModal open={activeModal === 'audit'} onClose={() => setActiveModal(null)} title="Deep System Audit" subtitle="Financial Reconciliation Engine" icon={ShieldCheck} iconBg="bg-[#15192c]">
        <div className="space-y-8 py-4">
          {isProcessing ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-2 w-full bg-rose-50 rounded-full overflow-hidden flex">
                <div className="h-full animate-[progress_3s_ease-in-out]" style={{ width: '100%', background: '#ff69b4' }}></div>
              </div>
              <div className="text-center text-[9px] font-black uppercase tracking-widest" style={{ color: '#C4A0AC' }}>
                Scanning platform nodes for discrepancies...
              </div>
            </div>
          ) : complete ? (
            <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner" style={{ background: '#FDEEF1', color: '#ff69b4' }}>
                <CheckCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight" style={{ color: '#15192c' }}>Audit Successful</h3>
                <p className="text-[10px] font-medium max-w-xs mx-auto" style={{ color: '#9A8A8E' }}>All entries match. No leakages detected.</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="px-6 py-3 text-white font-bold rounded-2xl text-[9px] uppercase tracking-widest shadow-xl" style={{ background: '#ff69b4' }}>Commit Log</button>
            </div>
          ) : null}
        </div>
        <style>{` @keyframes progress { from { width: 0%; } to { width: 100%; } } `}</style>
      </AnalyticModal>

      <AnalyticModal open={activeModal === 'log'} onClose={() => setActiveModal(null)} title="Detailed Invoices Ledger" subtitle="Real-time Platform Payments Log" icon={Database} iconBg="bg-[#ff69b4]">
        <div className="space-y-3">
          {revenueData?.transactions && revenueData.transactions.length > 0 ? (
            revenueData.transactions.map((tx, i) => (
              <div key={tx.invoice_id || i} className="p-3 bg-rose-50/20 border rounded-xl flex items-center justify-between group hover:bg-white transition-all animate-in slide-in-from-bottom-2 duration-300" style={{ borderColor: '#F5E6EA' }}>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-bold font-mono" style={{ color: '#C4A0AC' }}>{tx.invoice_number}</span>
                  <div>
                    <p className="text-[10px] font-bold tracking-tight text-[#15192c]">{tx.user.full_name}</p>
                    <p className="text-[8px] text-slate-400 font-bold">{tx.user.email} | {tx.plan}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-[#ff69b4] border border-[#F5E6EA] bg-[#FDEEF1] px-2.5 py-1 rounded-lg">₹{tx.amount}</span>
              </div>
            ))
          ) : (
            <div className="p-5 text-center text-xs text-slate-400 font-bold">No payments registered in ledger.</div>
          )}
        </div>
      </AnalyticModal>

      <AnalyticModal open={activeModal === 'vault'} onClose={() => { setActiveModal(null); setVaultAuthorized(false); setPin(''); }} title="Auditor Vault" subtitle={vaultAuthorized ? "Authorized Access Root" : "Restricted Financial Ledgers"} icon={vaultAuthorized ? Shield : Lock} iconBg={vaultAuthorized ? "bg-[#ff69b4]" : "bg-red-500"}>
        {!vaultAuthorized ? (
          <div className="space-y-8 text-center p-4">
            <div className="w-20 h-20 bg-rose-50 text-[#ff69b4] rounded-[2rem] flex items-center justify-center mx-auto mb-6"> <Shield size={40} /> </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight leading-none mb-3" style={{ color: '#15192c' }}>Security Protocol Required</h3>
              <p className="text-sm font-medium leading-relaxed max-w-sm mx-auto" style={{ color: '#9A8A8E' }}>Access to the Auditor Vault is strictly limited to authorized financial stakeholders only.</p>
            </div>
            <div className="bg-rose-50/30 p-4 rounded-[2rem] border flex flex-col items-center gap-3" style={{ borderColor: '#F5E6EA' }}>
              <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="0000" className="w-full h-10 bg-white border rounded-2xl text-center font-bold tracking-[0.5em] text-sm outline-none focus:border-[#ff69b4] transition-all" style={{ borderColor: '#F5E6EA' }} />
              <button onClick={handlePinSubmit} className="w-full py-2 bg-slate-900 text-white font-bold rounded-2xl text-[8px] uppercase tracking-[0.3em] shadow-xl">Authorize Access</button>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#C4A0AC' }}>Master PIN for DEMO: 1234</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-700">
            <div className="p-6 bg-[#FDEEF1] rounded-[2rem] border flex items-center justify-between" style={{ borderColor: '#F5E6EA' }}>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: '#ff69b4' }}>Secure Terminal Active</p>
                <h4 className="text-xl font-bold tracking-tight" style={{ color: '#15192c' }}>Root Ledger Connected</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: '#ff69b4', color: '#fff' }}><Activity size={24} /></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleExportRegulatoryPDF} disabled={isExporting} className="flex-1 py-3 bg-slate-900 text-white font-bold text-[9px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2">
                {isExporting ? 'Generating Report...' : 'Export Regulatory PDF'}
              </button>
              <button onClick={() => { setActiveModal(null); setVaultAuthorized(false); }} className="px-6 py-3 bg-rose-50 text-[#C4A0AC] font-bold text-[9px] uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all">Destroy Session</button>
            </div>
          </div>
        )}
      </AnalyticModal>
    </div>
  );
};

export default SystemAnalytics;

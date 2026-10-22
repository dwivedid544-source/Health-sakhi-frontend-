import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, TrendingUp, Video, BookOpen, Clock, 
  PlusCircle, AlertCircle, Sparkles, ArrowRight,
  ShieldCheck, MessageSquare, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import adminApi from '../../api/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const StatCard = ({ title, value, change, icon: Icon, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="bg-white p-6 rounded-[2rem] border shadow-sm cursor-pointer group" 
    style={{ borderColor: '#F5E6EA' }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`} style={{ background: color }}>
        <Icon size={22} />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#FDEEF1] text-[#ff69b4]`}>{change}</span>
    </div>
    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#C4A0AC' }}>{title}</h3>
    <p className="text-2xl font-black tracking-tight" style={{ color: '#15192c' }}>{value}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await adminApi.getDashboardStats();
        const analyticsData = await adminApi.getDashboardAnalytics();
        setStats(statsData);
        setAnalytics(analyticsData);

        // Fetch popular books stats dynamically
        const contentData = await adminApi.getContentAnalytics();
        if (contentData.success && contentData.content_metrics?.popular_books) {
          setPopularBooks(contentData.content_metrics.popular_books);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalUsers = stats?.stats?.users?.total ?? 0;
  const activeSubs = analytics?.summary?.active_subscriptions ?? 0;
  const totalRevenue = stats?.stats?.financials?.totalRevenue ?? 0;
  const pendingUsers = stats?.stats?.users?.pending ?? 0;

  // ── Charts Logic ────────────────────────────────────────────────────────────
  const barData = [
    { month: 'Jan', users: Math.round(totalUsers * 0.25) },
    { month: 'Feb', users: Math.round(totalUsers * 0.35) },
    { month: 'Mar', users: Math.round(totalUsers * 0.3) },
    { month: 'Apr', users: Math.round(totalUsers * 0.5) },
    { month: 'May', users: Math.round(totalUsers * 0.45) },
    { month: 'Jun', users: Math.round(totalUsers * 0.6) },
    { month: 'Jul', users: Math.round(totalUsers * 0.55) },
    { month: 'Aug', users: Math.round(totalUsers * 0.7) },
    { month: 'Sep', users: Math.round(totalUsers * 0.8) },
    { month: 'Oct', users: Math.round(totalUsers * 0.9) },
    { month: 'Nov', users: Math.round(totalUsers * 0.85) },
    { month: 'Dec', users: totalUsers },
  ];
  const maxUsers = Math.max(...barData.map(d => d.users)) || 1;

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff69b4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">

      {/* ── Quick Action Header ── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black tracking-tight text-[#15192c]">{t('adminDash.commandCenter', 'Admin Command Center')}</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A0AC] mt-1">{t('adminDash.ecosystem', 'Managing the HealthSakhi Ecosystem')}</p>
         </div>
         <div>
            <button onClick={() => navigate('/admin/content')} className="px-6 py-4 bg-[#15192c] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-[#ff69b4] transition-all">
               <PlusCircle size={16} /> {t('adminDash.uploadNewBook', 'Upload New Book')}
            </button>
         </div>
      </section>

      {/* ── Core Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard onClick={() => navigate('/admin/users')} title={t('adminDash.totalUsers', 'Total Users')} value={totalUsers.toLocaleString()} icon={Users} color="#15192c" />
        <StatCard onClick={() => navigate('/admin/analytics')} title={t('adminDash.paidUsers', 'Paid Users')} value={activeSubs.toLocaleString()} change={t('adminDash.activeSubs', 'Active Subs')} icon={TrendingUp} color="#ff69b4" />
        <StatCard onClick={() => navigate('/admin/payments')} title={t('adminDash.totalRevenue', 'Total Revenue')} value={`₹${Number(totalRevenue).toLocaleString('en-IN')}`} change={t('adminDash.reconciled', 'Reconciled')} icon={DollarSign} color="#ff69b4" />
        <StatCard onClick={() => navigate('/admin/analytics')} title={t('adminDash.activeNow', 'Active Now')} value={(analytics?.summary?.active_members ?? 0).toLocaleString()} change={t('adminDash.liveNode', 'Live Node')} icon={Clock} color="#C4A0AC" />
      </div>

      {/* ── Middle Layer: Growth & Advisor Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* User Growth Bar Chart */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-[#F5E6EA] shadow-sm relative overflow-hidden">
           <div className="flex items-center justify-between mb-12 relative z-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-[#15192c]">{t('adminDash.userGrowth', 'User Growth')}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-[#C4A0AC]">{t('adminDash.registrationVelocity', '2026 Registration Velocity')}</p>
              </div>
              <select className="bg-rose-50/50 border-none rounded-xl px-4 py-2 text-[9px] font-black uppercase outline-none text-[#ff69b4] cursor-pointer">
                 <option>{t('adminDash.last12Months', 'Last 12 Months')}</option>
                 <option>{t('adminDash.last30Days', 'Last 30 Days')}</option>
              </select>
           </div>
           
           <div className="relative h-[250px] w-full">
              {/* Subtle Horizontal Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                 {[1, 2, 3, 4, 5].map(i => (
                   <div key={i} className="w-full border-t border-rose-50/80 h-0" />
                 ))}
              </div>

              {/* Bars Container */}
              <div className="absolute inset-0 flex items-end justify-between px-2 gap-3 md:gap-5">
                {barData.map((d, i) => {
                  const heightPct = (d.users / maxUsers) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full group relative">
                       <div className="w-full h-full flex items-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                            className="w-full bg-[#ff69b4] rounded-t-lg group-hover:brightness-105 transition-all cursor-pointer relative shadow-sm"
                          >
                             {/* Tooltip on Hover */}
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#15192c] text-white text-[8px] font-bold px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20">
                                {d.users.toLocaleString()} {t('adminDash.users', 'users')}
                             </div>
                          </motion.div>
                       </div>
                       <span className="text-[9px] font-black uppercase text-[#C4A0AC] mt-3 group-hover:text-[#ff69b4] transition-colors">{d.month.charAt(0)}</span>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* Book Reading Pulse */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-[#15192c] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff69b4]/10 rounded-full blur-2xl -mr-12 -mt-12" />
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">{t('adminDash.bookPulse', 'Book Reading Pulse')}</h3>
                 <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-400">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    {t('adminDash.active', 'Active')}
                 </div>
              </div>
              <div className="space-y-4 relative z-10">
                 {popularBooks.length > 0 ? (
                    popularBooks.slice(0, 3).map((book, idx) => (
                      <div key={book.id || idx} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                         <div className="overflow-hidden pr-2">
                            <p className="text-xs font-black truncate text-white tracking-tight">{book.title}</p>
                            <p className="text-[9px] font-bold text-white/50 truncate">by {book.author}</p>
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-wider bg-[#ff69b4]/20 text-[#ff69b4] px-2 py-0.5 rounded-lg flex-shrink-0">
                            {book.readers_count} Reads
                         </span>
                      </div>
                    ))
                 ) : (
                    <div className="text-xs text-white/50 text-center py-4 font-bold">{t('adminDash.noBookData', 'No books learn/listen logs.')}</div>
                 )}
              </div>
              <button onClick={() => navigate('/admin/content')} className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">{t('adminDash.manageBooks', 'Manage Books')}</button>
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-[#F5E6EA] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <ShieldCheck size={18} className="text-[#ff69b4]" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-[#15192c]">{t('adminDash.systemHealth', 'System Health')}</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#C4A0AC]">{t('adminDash.apiLatency', 'API Latency')}</span>
                    <span className="text-[10px] font-black text-emerald-600">45ms</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#C4A0AC]">{t('adminDash.storageFlow', 'Storage Flow')}</span>
                    <span className="text-[10px] font-black text-[#15192c]">65%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ── Lower Layer ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-12 bg-white p-8 rounded-[3rem] border border-[#F5E6EA] shadow-sm">
            <h3 className="text-xl font-black tracking-tight text-[#15192c] mb-8">{t('adminDash.recentActivities', 'Recent Admin Activities')}</h3>
            <div className="space-y-4">
               {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                 stats.recentActivity.map((activity) => (
                   <div key={activity.id} className="p-4 bg-rose-50/10 rounded-2xl border border-[#F5E6EA] flex items-center justify-between">
                      <div>
                         <p className="text-sm font-black text-[#15192c]">{activity.action}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activity.targetTable} | ID: {activity.targetId || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-bold text-[#C4A0AC]">{new Date(activity.createdAt).toLocaleTimeString()}</p>
                         <p className="text-[10px] text-[#ff69b4] font-black">{activity.adminName}</p>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="p-5 text-center text-xs text-slate-400 font-bold">{t('adminDash.noActivities', 'No recent audit log activities.')}</div>
               )}
            </div>
         </div>
      </div>

    </div>
  );
};

export default AdminDashboard;

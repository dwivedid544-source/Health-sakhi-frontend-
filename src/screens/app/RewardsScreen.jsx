import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Gift, ChevronLeft, ChevronRight, Award, Sparkles, CheckCircle2, Clock, Lock, Loader2, Copy, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import memberApi from '../../api/memberApi';
import affiliateApi from '../../api/affiliateApi';

const RewardsScreen = () => {
  const navigate = useNavigate();
  const [unlockedGifts, setUnlockedGifts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('Reward Unlocked! ✨');
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [streak, setStreak] = useState(12); // Fallback to 12 if not fetched
  const [coins, setCoins] = useState(0);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [referredUsers, setReferredUsers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [dashboardBadgesUnlocked, setDashboardBadgesUnlocked] = useState(0);

  // Load dynamic stats and build balance
  const loadData = async () => {
    try {
      setLoading(true);
      const profRes = await memberApi.getProfile().catch(e => null);
      if (profRes && profRes.success) setProfile(profRes.profile);

      // Fetch dashboard metrics
      const dashRes = await memberApi.getDashboard();
      const streakVal = dashRes?.dashboard?.streak_count || 0;
      setStreak(streakVal || 12); // Fallback to 12 if 0

      const unlockedCount = dashRes?.dashboard?.badges?.unlocked || 0;
      setDashboardBadgesUnlocked(unlockedCount);

      // Fetch checklists (todos)
      const todosRes = await memberApi.getTodos();
      const todos = todosRes?.todos || [];
      const completedTodosCount = todos.filter(t => t.is_completed).length;

      // Fetch logged transactions
      const transRes = await memberApi.getTransactions();
      const transactionsCount = transRes?.transactions?.length || 0;

      // Fetch logged moods
      const moodRes = await memberApi.getMoodLogs();
      const moodsCount = moodRes?.moodLogs?.length || 0;

      // Load book rewards
      const bookRewards = JSON.parse(localStorage.getItem('hs_book_rewards') || '[]');
      const bookRewardPoints = bookRewards.reduce((sum, r) => sum + (r.points || 0), 0);

      // Load redemptions
      const redemptions = JSON.parse(localStorage.getItem('hs_redemptions') || '[]');
      const spent = redemptions.reduce((sum, r) => sum + (r.points || 0), 0);

      // Fetch referral link and referred users
      let referralPoints = 0;
      let referredUsersList = [];
      try {
        let affiliateData;
        try {
          affiliateData = await affiliateApi.getDashboard();
        } catch (dashErr) {
          // If profile not found, generate one using getReferralLink
          await affiliateApi.getReferralLink();
          // Retry fetching dashboard
          affiliateData = await affiliateApi.getDashboard();
        }

        referredUsersList = affiliateData.referrals || [];
        setReferredUsers(referredUsersList);
        referralPoints = referredUsersList.length * 100;

        if (affiliateData?.profile?.referral_code) {
          const link = `${window.location.origin}/register?ref=${affiliateData.profile.referral_code}`;
          setReferralLink(link);
        }
      } catch (err) {
        console.error("Error fetching referral dashboard data:", err);
      }

      // Calculate total coins dynamically
      // Base: Book Rewards (+100 each) + 30-Day Streak (+100) - spent
      const streakBonusPoints = (streakVal >= 30 || streak >= 30) ? 100 : 0;
      const totalCoins = Math.max(0, bookRewardPoints + streakBonusPoints - spent);

      setCoins(totalCoins);
      localStorage.setItem('hs_reward_balance', totalCoins);
      window.dispatchEvent(new Event('hs_balance_update'));

      // Unlocked badges based on actual statistics
      const earnedBadges = [];
      if (streakVal >= 5 || streak >= 5) earnedBadges.push(1); // Early Bird
      if (streakVal >= 10 || streak >= 10) earnedBadges.push(2); // Consistent
      if (bookRewards.length >= 1) earnedBadges.push(3); // Seeker
      if (transactionsCount + completedTodosCount >= 5) earnedBadges.push(4); // Pillar
      setUnlockedBadges(earnedBadges);

      // Unlocked gifts
      const savedGifts = JSON.parse(localStorage.getItem('hs_unlocked_gifts') || '[]');
      setUnlockedGifts(savedGifts);

      // Generate dynamic activity feed entries
      const feed = [];

      if (streakBonusPoints > 0) {
        feed.push({
          id: `streak_30_bonus`,
          text: `🔥 30-Day Streak Milestone Reached`,
          amount: `+100`,
          time: 'Achieved',
          timestamp: Date.now()
        });
      }

      // Book rewards
      bookRewards.forEach(r => {
        feed.push({
          id: `book_${r.bookId || Math.random()}`,
          text: `📖 Completed Book: ${r.bookTitle}`,
          amount: `+${r.points}`,
          time: new Date(r.earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          timestamp: new Date(r.earnedAt).getTime()
        });
      });

      // Todo completions
      todos.filter(t => t.is_completed).forEach(t => {
        feed.push({
          id: `todo_${t.id}`,
          text: `✅ Completed Task: ${t.title}`,
          amount: `+20`,
          time: t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent',
          timestamp: t.due_date ? new Date(t.due_date).getTime() : 0
        });
      });

      // Transaction entries
      if (transRes?.transactions) {
        transRes.transactions.forEach(t => {
          feed.push({
            id: `tx_${t.id}`,
            text: `💸 Recorded Transaction: ${t.description || t.category}`,
            amount: `+10`,
            time: t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent',
            timestamp: t.date ? new Date(t.date).getTime() : 0
          });
        });
      }

      // Mood logs
      if (moodRes?.moodLogs) {
        moodRes.moodLogs.forEach(m => {
          feed.push({
            id: `mood_${m.id || Math.random()}`,
            text: `🎭 Checked In Mood: ${m.mood_type || m.moodType}`,
            amount: `+10`,
            time: m.logged_at || m.loggedAt ? new Date(m.logged_at || m.loggedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent',
            timestamp: m.logged_at || m.loggedAt ? new Date(m.logged_at || m.loggedAt).getTime() : 0
          });
        });
      }

      // Referral entries
      referredUsersList.forEach(ref => {
        feed.push({
          id: `ref_${ref.id}`,
          text: `👥 Referred: ${ref.fullName || ref.email}`,
          amount: `+100`,
          time: new Date(ref.signupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          timestamp: new Date(ref.signupDate).getTime()
        });
      });

      // Redemptions
      redemptions.forEach(r => {
        feed.push({
          id: `red_${r.id}`,
          text: `🎁 Redeemed: ${r.name}`,
          amount: `-${r.points}`,
          time: new Date(r.redeemedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          timestamp: new Date(r.redeemedAt).getTime()
        });
      });

      // Sort feed by time (newest first)
      feed.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(feed.slice(0, 5));

    } catch (err) {
      console.error("Failed to load rewards data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const booksCompleted = profile?.booksCompleted || 0;
  const activeDays = streak || profile?.loginDays || 0;
  const referralCount = profile?.referralCount || 0;
  const earnedStagesCount = dashboardBadgesUnlocked || 0;

  const certificateStages = [
    {
      id: 1,
      name: 'Basic Certificate',
      stageLabel: 'Stage 1',
      icon: Award,
      color: '#ff69b4',
      description: 'Complete 5 Books & 15 Active Days',
      isEarned: earnedStagesCount >= 1
    },
    {
      id: 2,
      name: 'Advance Certificate',
      stageLabel: 'Stage 2',
      icon: Trophy,
      color: '#8b5cf6',
      description: 'Complete 15 Books & 30 Active Days',
      isEarned: earnedStagesCount >= 2
    },
    {
      id: 3,
      name: 'Gold Ambassador',
      stageLabel: 'Stage 3',
      icon: Star,
      color: '#f59e0b',
      description: 'Complete 25 Books & 10 Referrals',
      isEarned: earnedStagesCount >= 3
    },
    {
      id: 4,
      name: 'Platinum Leader',
      stageLabel: 'Stage 4',
      icon: Crown,
      color: '#0ea5e9',
      description: 'Complete 40 Books & 25 Referrals',
      isEarned: earnedStagesCount >= 4
    }
  ];

  const handleUnlock = (gift) => {
    const price = parseInt(gift.price);
    if (coins < price) return;

    const newCoins = coins - price;

    // Deduct coins & add redemption record
    const redemptions = JSON.parse(localStorage.getItem('hs_redemptions') || '[]');
    const newRedemption = {
      id: Date.now(),
      name: gift.name,
      points: price,
      redeemedAt: new Date().toISOString()
    };
    redemptions.push(newRedemption);
    localStorage.setItem('hs_redemptions', JSON.stringify(redemptions));

    // Update unlocked gifts
    const gifts = [...unlockedGifts, gift.name];
    setUnlockedGifts(gifts);
    localStorage.setItem('hs_unlocked_gifts', JSON.stringify(gifts));

    // Update local coins state and global localstorage key
    setCoins(newCoins);
    localStorage.setItem('hs_reward_balance', newCoins);

    // Add activity to feed
    setActivities(prev => [
      {
        id: `red_${newRedemption.id}`,
        text: `🎁 Redeemed: ${gift.name}`,
        amount: `-${price}`,
        time: 'Just now',
        timestamp: Date.now()
      },
      ...prev
    ].slice(0, 5));

    // Notify header to sync
    window.dispatchEvent(new Event('hs_balance_update'));

    setToastMsg('Reward Unlocked! ✨');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShareInvite = async () => {
    let linkToCopy = referralLink;
    if (!linkToCopy) {
      try {
        const refRes = await affiliateApi.getReferralLink();
        if (refRes?.referral_code) {
          linkToCopy = `${window.location.origin}/register?ref=${refRes.referral_code}`;
          setReferralLink(linkToCopy);
        }
      } catch (err) {
        console.error("Error generating referral link:", err);
      }
    }
    if (linkToCopy) {
      navigator.clipboard.writeText(linkToCopy);
      setCopiedInvite(true);
      setToastMsg('Invite Link Copied! 📋');
      setShowToast(true);
      setTimeout(() => {
        setCopiedInvite(false);
        setShowToast(false);
      }, 3000);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#FFF7F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#ff69b4]">
          <Loader2 size={32} className="animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Loading Rewards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FFF7F8] relative overflow-x-hidden font-sans text-[#15192c]">

      {/* ── Subtle Mesh Background ── */}
      <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full px-4 md:px-10 py-6 md:py-10"
      >
        <div className="space-y-10">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-5">
              <button
                onClick={() => navigate('/app')}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-rose-100 flex items-center justify-center text-[#15192c] hover:bg-rose-50 transition-all shadow-sm shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#15192c]">Your Rewards</h1>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A0AC]">Celebrate every small win</p>
              </div>
            </div>

            {/* Professional Main Balance Card */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="relative group self-start sm:self-auto min-w-[180px] md:min-w-[220px]"
            >
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ff69b4] to-[#8b5cf6] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

              <div className="relative bg-[#15192c] text-white px-6 md:px-10 py-4 md:py-6 rounded-[1.8rem] flex items-center gap-5 md:gap-8 shadow-2xl overflow-hidden border border-white/55">
                {/* Decorative Rotating Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -right-8 -top-8 w-32 h-32 border-[20px] border-dashed border-white/5 rounded-full pointer-events-none"
                />

                {/* Icon Section with Aura */}
                <div className="relative shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-[#ff69b4] blur-xl rounded-full"
                  />
                  <div className="relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#ff69b4] to-[#e05297] rounded-2xl flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(255,105,180,0.5)] border border-white/20">
                    <Award size={24} />
                  </div>
                </div>

                {/* Text Content */}
                <div className="relative z-10">
                  <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-[#ff69b4] mb-1">SAVINGS STATUS</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg md:text-2xl font-black tracking-tight text-white">OFFERS ACTIVE</p>
                    <span className="text-base md:text-xl">✨</span>
                  </div>
                </div>

                {/* Subtle Mesh Background Overlay */}
                <div className="absolute inset-0 mesh-bg opacity-10 pointer-events-none" />
              </div>
            </motion.div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <motion.div variants={item} className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-rose-50 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#ff69b4] shadow-inner shrink-0"><Zap size={18} /></div>
                <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#C4A0AC]">Active Streak</h4>
              </div>
              <h3 className="text-3xl md:text-4xl font-black">{activeDays} Days 🔥</h3>
              <div className="mt-4 md:mt-6 h-1.5 w-full bg-rose-50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: activeDays >= 30 ? '100%' : `${(activeDays / 30) * 100}%` }} className="h-full bg-[#ff69b4] rounded-full" />
              </div>
            </motion.div>

            <motion.div variants={item} className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-rose-50 shadow-sm">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#ff69b4] shadow-inner shrink-0"><Trophy size={18} /></div>
                <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#C4A0AC]">Certificate Stages</h4>
              </div>
              <h3 className="text-3xl md:text-4xl font-black">{earnedStagesCount.toString().padStart(2, '0')} <span className="text-base md:text-lg text-[#C4A0AC]">/ {certificateStages.length}</span></h3>
              <p className="text-[9px] md:text-[10px] font-bold text-[#ff69b4] mt-2 uppercase tracking-widest">Master Status at {certificateStages.length} Stages</p>
            </motion.div>

            <motion.div variants={item} className="bg-[#15192c] rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-[#ff69b4] rounded-xl flex items-center justify-center shadow-lg shrink-0"><Star size={18} /></div>
                <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#ff69b4]">Current Rank</h4>
              </div>
              <h3 className="text-xl md:text-2xl font-black relative z-10">
                {earnedStagesCount === 4 ? 'Platinum Health Leader 👑' : earnedStagesCount === 3 ? 'Gold Ambassador 🌟' : earnedStagesCount >= 1 ? 'Wellness Master 🌸' : 'Rising Sakhi 🌿'}
              </h3>
              <div className="h-1 w-full bg-white/10 rounded-full mt-4 relative z-10">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(earnedStagesCount / certificateStages.length) * 100}%` }} className="h-full bg-[#ff69b4] rounded-full" />
              </div>
            </motion.div>
          </div>

          {/* Certificate Stages Grid */}
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#C4A0AC]">Certificate Milestone Stages</h3>
              <span className="text-[9px] font-bold text-[#ff69b4] uppercase tracking-widest">{earnedStagesCount} / {certificateStages.length} Earned</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {certificateStages.map((stage) => {
                const IconComp = stage.icon;
                return (
                  <motion.div
                    key={stage.id}
                    whileHover={{ scale: stage.isEarned ? 1.02 : 1 }}
                    className={`bg-white rounded-[2rem] p-6 border border-rose-50 text-center flex flex-col items-center group shadow-sm transition-all relative ${!stage.isEarned ? 'opacity-70 bg-slate-50/50' : ''}`}
                  >
                    <div className="absolute top-4 left-4">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-[#ff69b4] border border-rose-100">
                        {stage.stageLabel}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      {stage.isEarned ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <Lock size={14} className="text-slate-400" />
                      )}
                    </div>

                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mt-4 mb-5 shadow-inner transition-transform group-hover:rotate-6" style={{ background: stage.isEarned ? `${stage.color}15` : '#F5F5F5' }}>
                      <IconComp size={32} style={{ color: stage.isEarned ? stage.color : '#9A8A8E' }} />
                    </div>

                    <h4 className={`text-sm font-black mb-1 ${stage.isEarned ? 'text-[#15192c]' : 'text-slate-600'}`}>{stage.name}</h4>
                    <p className="text-[10px] font-semibold text-[#C4A0AC] leading-tight mt-1">{stage.description}</p>
                    
                    <div className="mt-4 pt-3 border-t border-rose-50/60 w-full flex items-center justify-center">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${stage.isEarned ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {stage.isEarned ? '✓ STAGE COMPLETED' : '🔒 STAGE LOCKED'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>



          {/* ── Certificate Milestone Discount & Special Subscription Pricing ── */}
          <motion.section variants={item} className="bg-gradient-to-br from-[#15192c] via-[#1a1f38] to-[#251b34] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Outer Glow & Decorative elements */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff69b4]/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-purple-500/15 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#ff69b4] rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                    <Crown size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white">Wellness Certificate Special Subscription Discount 🌸</h3>
                    <p className="text-xs font-bold text-pink-200 uppercase tracking-widest mt-0.5">Complete Certificate Milestones to Unlock Exclusive Plan Discounts!</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2">
                  <span className="text-xs font-black text-pink-300">Milestone Offers:</span>
                  <span className="text-xs font-bold text-white">Basic Cert = ₹50 OFF | Advance Cert = ₹100 OFF</span>
                </div>
              </div>

              {/* Discount Calculator & Offers Grid */}
              {(() => {
                const booksCompleted = profile?.booksCompleted || 0;
                const activeDays = profile?.loginDays || streak || 0;
                const hasBasicCert = booksCompleted >= 5 && activeDays >= 15;
                const hasAdvanceCert = booksCompleted >= 15 && activeDays >= 30;

                const basicDiscount = hasBasicCert ? 50 : 0;
                const premiumDiscount = hasAdvanceCert ? 100 : (hasBasicCert ? 50 : 0);

                const basicPrice = 499 - basicDiscount;
                const premiumPrice = 999 - premiumDiscount;

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Sakhi Discount Card */}
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-6 relative overflow-hidden">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                              Basic Sakhi Plan
                            </span>
                            {hasBasicCert && (
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={14} /> ₹50 OFF Unlocked!
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xl font-black text-white">1 Month Unlimited Access</h4>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                              Unlocks AI Chat Bot 24/7, All Books Unlimited & Basic Wellness Certificate Download.
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-baseline gap-3">
                            <span className="text-3xl font-black text-[#ff69b4]">₹{basicPrice}</span>
                            {basicDiscount > 0 && <span className="text-sm font-bold text-slate-400 line-through">₹499</span>}
                            <span className="text-xs text-slate-400 font-semibold">/month</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            localStorage.setItem('hs_applied_discount', JSON.stringify({ plan: 'basic', discount: basicDiscount }));
                            navigate('/app/plans');
                          }}
                          className="w-full py-3.5 bg-[#ff69b4] hover:bg-pink-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg cursor-pointer"
                        >
                          {hasBasicCert ? `GET BASIC PLAN FOR ₹${basicPrice} ⚡` : 'UPGRADE BASIC FOR ₹499'}
                        </button>
                      </div>

                      {/* Premium Sakhi Discount Card */}
                      <div className="bg-gradient-to-br from-[#ff69b4]/20 via-purple-600/20 to-indigo-600/20 backdrop-blur-md rounded-2xl p-6 border border-[#ff69b4]/40 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-xl">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-pink-500/30 text-pink-200 border border-pink-500/40 rounded-full">
                              Premium Sakhi Plan 👑
                            </span>
                            {premiumDiscount > 0 && (
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={14} /> ₹{premiumDiscount} OFF Unlocked!
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xl font-black text-white">Full Unlimited Year Access</h4>
                            <p className="text-xs text-pink-100 font-medium leading-relaxed">
                              Full access to AI Sakhi Bot, Partner Sakhi, Ask Health Sakhi, and ALL Wellness Certificates!
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-baseline gap-3">
                            <span className="text-3xl font-black text-[#ff69b4]">₹{premiumPrice}</span>
                            {premiumDiscount > 0 && <span className="text-sm font-bold text-slate-400 line-through">₹999</span>}
                            <span className="text-xs text-slate-400 font-semibold">/year</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            localStorage.setItem('hs_applied_discount', JSON.stringify({ plan: 'premium', discount: premiumDiscount }));
                            navigate('/app/plans');
                          }}
                          className="w-full py-3.5 bg-gradient-to-r from-[#ff69b4] to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl cursor-pointer"
                        >
                          {premiumDiscount > 0 ? `GET PREMIUM PLAN FOR ₹${premiumPrice} 👑` : 'UPGRADE PREMIUM FOR ₹999'}
                        </button>
                      </div>
                    </div>

                    {/* How Certificate Discounts Work Guide */}
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff69b4] mb-4">How Certificate Milestone Discounts Work</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                          <div className="w-11 h-11 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-300 text-xl font-black shrink-0">📜</div>
                          <div>
                            <p className="text-sm font-bold text-white">Basic Wellness Certificate Milestone</p>
                            <p className="text-xs font-bold text-pink-300 mt-0.5">Complete 5 Books & 15 Active Days → Get ₹50 OFF (Basic ₹449 / Premium ₹949)</p>
                          </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                          <div className="w-11 h-11 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-300 text-xl font-black shrink-0">🎓</div>
                          <div>
                            <p className="text-sm font-bold text-white">Advance Wellness Certificate Milestone</p>
                            <p className="text-xs font-bold text-pink-300 mt-0.5">Complete 15 Books & 30 Active Days → Get ₹100 OFF (Premium ₹899)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.section>

        </div>
      </motion.div>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-[#15192c] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10">
            <CheckCircle2 size={16} className="text-[#ff69b4]" />
            <span className="text-[10px] font-bold uppercase tracking-widest tracking-tight">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardsScreen;

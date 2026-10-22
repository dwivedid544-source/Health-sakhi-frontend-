import React, { useState, useMemo, useEffect } from 'react';
import {
  Settings, CreditCard, History, Bookmark, LogOut, ChevronRight,
  Shield, Award, Star, Flame, User, Users, ShieldCheck, DollarSign,
  Zap, Bell, Calendar, Camera, ChevronDown, Mail, Send, MessageSquare, Trash2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import memberApi from '../../api/memberApi';
import affiliateApi from '../../api/affiliateApi';
import adminApi from '../../api/adminApi';
import { useLanguage } from '../../context/LanguageContext';
import { getLanguageByCode } from '../../data/languages';
import i18nApi from '../../api/i18nApi';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, langCode, setLanguage } = useLanguage();
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('hs_voice_enabled') === 'true');
  const [isEditing, setIsEditing] = useState(false);

  const [memberReplyText, setMemberReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  const handleDeleteMessage = async (msgId) => {
    try {
      await memberApi.deleteNotification(msgId);
      setNotifications(prev => prev.filter(n => n.id !== msgId));
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message: " + (err.response?.data?.error || err.message));
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!memberReplyText.trim()) return;
    setSendingReply(true);
    try {
      await memberApi.sendNotificationReply(memberReplyText.trim());
      setMemberReplyText('');
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 3000);
      const res = await memberApi.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error("Failed to send reply to admin:", err);
      alert("Failed to send reply: " + (err.response?.data?.error || err.message));
    } finally {
      setSendingReply(false);
    }
  };

  useEffect(() => {
    setVoiceEnabled(localStorage.getItem('hs_voice_enabled') === 'true');
  }, [langCode]);

  const handleLangChange = async (code) => {
    setLanguage(getLanguageByCode(code));
    try {
      await i18nApi.setLanguagePreference(code, voiceEnabled);
    } catch (err) {
      console.error('Failed to update language preference:', err);
    }
  };

  const handleVoiceToggle = async () => {
    const nextVal = !voiceEnabled;
    setVoiceEnabled(nextVal);
    localStorage.setItem('hs_voice_enabled', nextVal ? 'true' : 'false');
    try {
      await i18nApi.setLanguagePreference(langCode, nextVal);
    } catch (err) {
      console.error('Failed to update voice setting:', err);
    }
  };
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = React.useRef(null);

  // Detect role from URL
  const role = useMemo(() => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/advisor')) return 'advisor';
    if (location.pathname.startsWith('/affiliate')) return 'partner';
    return 'member';
  }, [location.pathname]);

  const currentMember = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('hs_current_member') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [memberPlan, setMemberPlan] = useState(() => {
    const memberData = JSON.parse(sessionStorage.getItem('hs_current_member') || '{}');
    return memberData.plan || 'Free Sakhi';
  });

  const [profileData, setProfileData] = useState(() => {
    const memberData = JSON.parse(sessionStorage.getItem('hs_current_member') || '{}');
    return {
      name: memberData.name || (role === 'admin' ? 'Admin User' : (role === 'advisor' ? 'Dr. Sakshi Sharma' : 'Sakhi Partner')),
      email: memberData.email || (role === 'admin' ? 'admin@healthsakhi.in' : (role === 'advisor' ? 'dr.sakshi@healthsakhi.in' : 'partner@healthsakhi.in')),
      phone: '+91 98765 43210',
      bio: role === 'member' ? 'Wellness enthusiast.' : (role === 'admin' ? 'System Administrator for HealthSakhi platform.' : 'Dedicated wellness advisor specializing in holistic health.')
    };
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await memberApi.getProfile();
        if (res.success && res.profile) {
          setProfileData({
            name: res.profile.full_name || '',
            email: res.profile.email || '',
            phone: res.profile.phone || '',
            bio: res.profile.bio || ''
          });
          if (res.profile.avatar_url) {
            setProfileImage(res.profile.avatar_url);
          }
          if (res.profile.subscription && res.profile.subscription.plan_name) {
            setMemberPlan(res.profile.subscription.plan_name);
            const memberData = JSON.parse(sessionStorage.getItem('hs_current_member') || '{}');
            sessionStorage.setItem('hs_current_member', JSON.stringify({
              ...memberData,
              plan: res.profile.subscription.plan_name
            }));
          } else {
            setMemberPlan('Free Sakhi');
            const memberData = JSON.parse(sessionStorage.getItem('hs_current_member') || '{}');
            if (memberData.plan !== 'Free Sakhi') {
              sessionStorage.setItem('hs_current_member', JSON.stringify({
                ...memberData,
                plan: 'Free Sakhi'
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile from API:", err);
      }
    };
    fetchProfile();
  }, [role]);

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    if (role !== 'member') return;

    const fetchNotifications = async (showLoading = true) => {
      try {
        if (showLoading) setLoadingNotifications(true);
        const res = await memberApi.getNotifications();
        if (res.success && res.notifications) {
          setNotifications(res.notifications);
          if (res.notifications.some(n => !n.is_read)) {
            await memberApi.markAllNotificationsRead();
          }
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        if (showLoading) setLoadingNotifications(false);
      }
    };

    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [role]);

  const [partnerStats, setPartnerStats] = useState({
    totalReferrals: '0',
    walletBalance: '₹0',
    conversionRate: '0.0%'
  });

  useEffect(() => {
    if (role === 'partner') {
      const fetchAffiliateData = async () => {
        try {
          const dashRes = await affiliateApi.getDashboard().catch(() => null);
          if (dashRes && dashRes.stats) {
            setPartnerStats({
              totalReferrals: String(dashRes.stats.total_referrals || 0),
              walletBalance: `₹${(dashRes.stats.available_balance || dashRes.stats.total_earned || 0).toLocaleString('en-IN')}`,
              conversionRate: dashRes.stats.conversion_rate || '0.0%'
            });
          }
          if (dashRes && dashRes.profile) {
            setProfileData(prev => ({
              ...prev,
              name: dashRes.profile.name || prev.name,
              email: dashRes.profile.email || prev.email,
              phone: dashRes.profile.phone || prev.phone
            }));
          }
        } catch (err) {
          console.error("Error fetching affiliate dashboard data for profile:", err);
        }
      };
      fetchAffiliateData();
    }
  }, [role]);

  const [memberStats, setMemberStats] = useState({
    wellnessJourney: '0%',
    totalSessions: '0',
    modulesDone: '0',
    savedModulesCount: '0',
    journeyHistoryCount: '0 days',
    badgesCount: '0 Badges'
  });

  useEffect(() => {
    if (role === 'member') {
      const fetchMemberDash = async () => {
        try {
          const dashRes = await memberApi.getDashboard().catch(() => null);
          if (dashRes && dashRes.success && dashRes.dashboard) {
            const dash = dashRes.dashboard;
            const streak = dash.streak_count || 0;
            const wellness = dash.wellness_score || 0;
            const completedBooks = dash.completed_books_count || 0;
            const totalTodosCompleted = dash.todos?.completed || 0;
            const unlockedBadges = dash.badges?.unlocked || 0;
            setMemberStats({
              wellnessJourney: `${wellness}%`,
              totalSessions: String(completedBooks),
              modulesDone: String(totalTodosCompleted),
              savedModulesCount: String(completedBooks),
              journeyHistoryCount: `${streak} days`,
              badgesCount: `${unlockedBadges} Badges`
            });
          }
        } catch (err) {
          console.error("Error fetching member dashboard:", err);
        }
      };
      fetchMemberDash();
    }
  }, [role]);

  const [adminProfileStats, setAdminProfileStats] = useState({
    activeUsers: '3',
    platformUptime: '99.9%',
    dailyTokens: '0'
  });

  useEffect(() => {
    if (role === 'admin') {
      const fetchAdminStats = async () => {
        try {
          const res = await adminApi.getDashboardStats();
          if (res && res.success && res.stats) {
            const uCount = res.stats.users?.total ?? res.stats.users?.active ?? 3;
            const uptime = res.stats.system?.platformUptime || '99.9%';
            const tokens = res.stats.system?.dailyTokens || '0';
            setAdminProfileStats({
              activeUsers: String(uCount),
              platformUptime: uptime,
              dailyTokens: tokens
            });
          }
        } catch (err) {
          console.warn("Failed to fetch admin profile stats:", err);
        }
      };
      fetchAdminStats();
    }
  }, [role]);

  const config = useMemo(() => {
    const configs = {
      member: {
        badge: memberPlan.toLowerCase().includes('basic') 
          ? '⚡ Basic Sakhi Member'
          : (!memberPlan.toLowerCase().includes('free') && (memberPlan.toLowerCase().includes('premium') || memberPlan.toLowerCase().includes('pro') || memberPlan.toLowerCase().includes('elite') || memberPlan.toLowerCase().includes('partner')))
          ? `👑 ${memberPlan} Member`
          : '🌸 Free Sakhi Member',
        stats: [
          { label: t('profile.stats.wellnessJourney', 'Wellness Journey'), value: memberStats.wellnessJourney, icon: Flame },
          { label: t('profile.stats.totalSessions', 'Total Sessions'), value: memberStats.totalSessions, icon: Star },
          { label: t('profile.stats.modulesDone', 'Modules Done'), value: memberStats.modulesDone, icon: Bookmark },
        ],
        menuItems: [
          { title: t('profile.menu.savedModules', 'Saved Wellness Modules'), icon: Bookmark, count: memberStats.savedModulesCount },
          { title: t('profile.menu.journeyHistory', 'Journey History'), icon: History, count: memberStats.journeyHistoryCount },
          { title: t('profile.menu.rewardsBadges', 'Rewards & Badges'), icon: Award, count: memberStats.badgesCount },
          { title: t('profile.menu.notifications', 'Notification Preferences'), icon: Bell },
        ],
        heading: t('profile.heading.member', 'Account Settings'),
        showMembership: true
      },
      admin: {
        badge: t('profile.roles.admin', 'System Admin'),
        stats: [
          { label: t('profile.stats.activeUsers', 'Active Users'), value: adminProfileStats.activeUsers, icon: Users },
          { label: t('profile.stats.platformUptime', 'Platform Uptime'), value: adminProfileStats.platformUptime, icon: ShieldCheck },
          { label: t('profile.stats.dailyTokens', 'Daily Tokens'), value: adminProfileStats.dailyTokens, icon: Zap },
        ],
        menuItems: [
          { title: t('profile.menu.systemLogs', 'System Logs'), icon: Shield },
          { title: t('profile.menu.rolePermissions', 'Role Permissions'), icon: Settings },
          { title: t('profile.menu.platformConfig', 'Platform Config'), icon: Settings },
        ],
        heading: t('profile.heading.admin', 'Administrative Controls'),
        showMembership: false
      },
      advisor: {
        badge: t('profile.roles.advisor', 'Wellness Advisor'),
        stats: [
          { label: t('profile.stats.myPatients', 'My Patients'), value: '42', icon: Users },
          { label: t('profile.stats.totalSessions', 'Total Sessions'), value: '156', icon: Calendar },
          { label: t('profile.stats.expertRating', 'Expert Rating'), value: '4.9', icon: Star },
        ],
        menuItems: [
          { title: t('profile.menu.professionalBio', 'Professional Bio'), icon: Award },
          { title: t('profile.menu.consultationRates', 'Consultation Rates'), icon: DollarSign },
          { title: t('profile.menu.workAvailability', 'Work Availability'), icon: Calendar },
          { title: t('profile.menu.paymentsPayouts', 'Payments & Payouts'), icon: CreditCard },
        ],
        heading: t('profile.heading.advisor', 'Advisor Settings'),
        showMembership: false
      },
      partner: {
        badge: t('profile.roles.affiliate', 'Growth Affiliate'),
        stats: [
          { label: t('profile.stats.totalReferrals', 'Total Referrals'), value: partnerStats.totalReferrals, icon: Users },
          { label: t('profile.stats.walletBalance', 'Wallet Balance'), value: partnerStats.walletBalance, icon: DollarSign },
          { label: t('profile.stats.conversionRate', 'Conversion Rate'), value: partnerStats.conversionRate, icon: Flame },
        ],
        menuItems: [
          { title: t('profile.menu.payoutSettings', 'Payout Settings'), icon: CreditCard },
          { title: t('profile.menu.referralReports', 'Referral Reports'), icon: History },
          { title: t('profile.menu.marketingKit', 'Marketing Kit'), icon: Star },
          { title: t('profile.menu.legalTax', 'Legal & Tax'), icon: Shield },
        ],
        heading: t('profile.heading.partner', 'Partner Preferences'),
        showMembership: false
      }
    };
    return configs[role] || configs.member;
  }, [role, memberPlan, partnerStats, t]);

  const handleLogout = () => {
    if (location.pathname.startsWith('/affiliate')) {
      navigate('/app');
      return;
    }
    sessionStorage.clear();
    navigate('/');
  };

  const handleSave = async () => {
    setIsEditing(false);
    try {
      await memberApi.updateProfile({
        full_name: profileData.name,
        bio: profileData.bio,
        phone: profileData.phone,
        avatar_url: profileImage
      });
      // Update session storage details
      const memberData = JSON.parse(sessionStorage.getItem('hs_current_member') || '{}');
      sessionStorage.setItem('hs_current_member', JSON.stringify({
        ...memberData,
        name: profileData.name,
        email: profileData.email
      }));
    } catch (err) {
      console.error("Error updating profile settings:", err);
    }
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-2 lg:px-0 mt-4">

      {/* ── Profile Header ── */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-sm border relative" style={{ borderColor: '#F5E6EA' }}>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="absolute top-8 right-8 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
          style={{
            background: isEditing ? '#15192c' : '#FFF7F8',
            color: isEditing ? '#FFF' : '#ff69b4',
            border: isEditing ? 'none' : '1px solid #F5E6EA'
          }}
        >
          {isEditing ? t('profile.saveChanges', 'Save Changes') : t('profile.editProfile', 'Edit Profile')}
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="relative shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <div 
              className={`w-28 h-28 lg:w-32 lg:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative z-10 mx-auto ${isEditing ? 'cursor-pointer group' : ''}`}
              onClick={handleImageClick}
            >
              <img
                src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=FDEEF1&color=C4607A&bold=true&size=128`}
                alt={profileData.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center z-20 border border-rose-50">
              < Award size={20} style={{ color: '#ff69b4' }} />
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            {!isEditing ? (
              <>
                <div>
                  <h1 className="text-3xl font-black mb-1 tracking-tight" style={{ color: '#15192c' }}>{profileData.name} 🌸</h1>
                  <p className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: '#C4A0AC' }}>{config.badge}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold flex items-center gap-3" style={{ color: '#6B5E63' }}><User size={16} className="text-[#C4A0AC]" /> {profileData.email}</p>
                  <p className="text-sm font-bold flex items-center gap-3" style={{ color: '#6B5E63' }}><Settings size={16} className="text-[#C4A0AC]" /> {profileData.phone}</p>
                </div>
                <p className="text-sm font-medium leading-relaxed mt-4 max-w-lg" style={{ color: '#9A8A8E' }}>
                  {profileData.bio}
                </p>
              </>
            ) : (
              <div className="space-y-4 w-full max-w-lg mt-2">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: '#C4A0AC' }}>{t('profile.form.fullName', 'Full Name')}</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border focus:border-[#ff69b4] focus:ring-2 focus:ring-[#ff69b4]/20 outline-none transition-all font-bold text-sm bg-rose-50/20"
                    style={{ borderColor: '#F5E6EA', color: '#15192c' }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: '#C4A0AC' }}>{t('profile.form.email', 'Email')}</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border focus:border-[#ff69b4] focus:ring-2 focus:ring-[#ff69b4]/20 outline-none transition-all font-bold text-sm bg-rose-50/20"
                      style={{ borderColor: '#F5E6EA', color: '#15192c' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: '#C4A0AC' }}>{t('profile.form.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border focus:border-[#ff69b4] focus:ring-2 focus:ring-[#ff69b4]/20 outline-none transition-all font-bold text-sm bg-rose-50/20"
                      style={{ borderColor: '#F5E6EA', color: '#15192c' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: '#C4A0AC' }}>{t('profile.form.bio', 'Bio')}</label>
                  <textarea
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full p-4 rounded-xl border focus:border-[#ff69b4] focus:ring-2 focus:ring-[#ff69b4]/20 outline-none transition-all font-medium text-sm bg-rose-50/20 resize-none"
                    rows="3"
                    style={{ borderColor: '#F5E6EA', color: '#6B5E63' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Membership Card (Member Role Only) */}
        {config.showMembership && (
          <div className="lg:col-span-12">
            <div className="rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border shadow-sm" style={{ background: '#FFF7F8', borderColor: '#F5E6EA' }}>
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: '#fff', color: '#ff69b4', border: '1px solid #F5E6EA' }}>
                  <Star size={12} fill="#ff69b4" />
                  {memberPlan.toLowerCase().includes('free') ? t('profile.plan.freeAccess', 'Free Access Active') : memberPlan.toLowerCase().includes('basic') ? 'Basic Subscription Active' : t('profile.plan.premiumActive', 'Premium Active')}
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#15192c' }}>
                  {memberPlan} {t('profile.plan.plan', 'Plan')} 🌸
                </h2>
                <p className="text-sm font-medium leading-relaxed" style={{ color: '#9A8A8E' }}>
                  {memberPlan.toLowerCase().includes('free') ? (
                    <>{t('profile.plan.freeDesc', 'You are currently on the Free Sakhi plan. 🌿 Upgrade to Basic or Premium plan to unlock unlimited AI chat, wellness certificates, and partner features.')}</>
                  ) : memberPlan.toLowerCase().includes('basic') ? (
                    <>You are on the Basic Sakhi plan. ⚡ Enjoy unlimited books, AI chat bot, and Wellness Certificate. Upgrade to Premium for Partner Sakhi & Ask Health Sakhi.</>
                  ) : (
                    <>{t('profile.plan.premiumDesc', 'Your Premium Sakhi subscription is active. 👑 You have full unlimited access to all features, AI Chat Bot, Partner Sakhi, and Ask Health Sakhi.')}</>
                  )}
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/app/plans')}
                  className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all hover:brightness-105 active:scale-95 shadow-md" 
                  style={{ background: '#ff69b4' }}
                >
                  {memberPlan === 'Free Sakhi' ? 'UPGRADE PLAN 💎' : t('profile.plan.managePlan', 'Manage Plan')}
                </button>
                <button 
                  onClick={() => navigate('/app/receipts')}
                  className="px-6 py-3 bg-white border rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-rose-50 active:scale-95" 
                  style={{ borderColor: '#F5E6EA', color: '#ff69b4' }}
                >
                  {t('profile.plan.receipts', 'Receipts')}
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Menu Items (Member Role Only) Removed as per request */}

        {/* Sign Out (12 cols) */}
        <div className="lg:col-span-12 pt-12 pb-6">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all bg-rose-50 hover:bg-rose-100 hover:shadow-sm active:scale-95 group border border-rose-100"
            style={{ color: '#d04f8f' }}
          >
            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
            {t('profile.signOut', 'Sign Out of Dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;


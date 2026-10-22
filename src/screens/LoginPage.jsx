import React, { useEffect, useMemo, useState } from 'react';
import { Heart, ArrowRight, User, ShieldCheck, Share2, Stethoscope, Eye, EyeOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { defaultPlans, MEMBER_PLAN_KEY, PLAN_STORAGE_KEY } from '../data/planCatalog';
import { APPROVED_MEMBERS_KEY, PENDING_SIGNUPS_KEY, getApprovedMembers, readJsonArray, writeJsonArray } from '../data/memberOnboarding';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import authApi from '../api/authApi';

const LoginPage = () => {
  const { t, langCode, setLanguage } = useLanguage();
  const getRoleName = (roleId) => {
    if (roleId === 'user') return t('login.member', 'Member');
    if (roleId === 'advisor') return t('login.advisor', 'Advisor');
    if (roleId === 'admin') return t('login.admin', 'Admin');
    if (roleId === 'affiliate') return t('login.partner', 'Partner');
    return roleId;
  };
  const [authMode, setAuthMode] = useState(() => {
    if (window.location.pathname === '/register') return 'signup';
    return localStorage.getItem(MEMBER_PLAN_KEY) ? 'signup' : 'login';
  });
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    plan: 'Free Sakhi',
    specialty: 'Hormonal Health',
    isAgreed: false
  });
  const [signupRole, setSignupRole] = useState('user');

  // Terms Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsText, setTermsText] = useState('');

  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth();

  const mapRoleForApi = (uiRole) => {
    if (uiRole === 'user') return 'member';
    if (uiRole === 'affiliate') return 'affiliate';
    return uiRole.toLowerCase();
  };

  const [planOptions, setPlanOptions] = useState(() => defaultPlans.filter(p => p.status === 'Active').map(p => p.name));
  const [allPlans, setAllPlans] = useState(defaultPlans);

  useEffect(() => {
    // Fetch plans from backend
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    fetch(`${API_BASE_URL}/subscriptions/plans`, {
      headers: {
        'Accept-Language': langCode || 'en'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.plans) {
          const activePlans = data.plans
            .filter(p => p.status === 'ACTIVE' || !p.status)
            .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
            .map(p => ({
              ...p,
              features: (p.features || []).map(f => typeof f === 'string' ? f : (f.value || f.featureValue || f.name || ''))
            }));
          setPlanOptions(activePlans.map(p => p.name));
          setAllPlans(activePlans);
        }
      })
      .catch(err => {
        console.error('Failed to fetch plans:', err);
      });
  }, [langCode]);

  useEffect(() => {
    const selectedPlanId = localStorage.getItem(MEMBER_PLAN_KEY);
    const plan = allPlans.find((p) => p.id === selectedPlanId);
    if (plan) {
      setSelectedPlan(plan);
      setSignupForm((prev) => ({ ...prev, plan: plan.name }));
    } else if (planOptions[0]) {
      setSignupForm((prev) => ({ ...prev, plan: planOptions[0] }));
    }
  }, [allPlans, planOptions]);

  const [disclaimerLang, setDisclaimerLang] = useState(langCode || 'en');

  // Fetch Disclaimer Text & parse referral code
  useEffect(() => {
    let filename = '/disclaimer_text.txt';
    if (disclaimerLang === 'hi') filename = '/disclaimer_text_hi.txt';
    else if (disclaimerLang === 'mr') filename = '/disclaimer_text_mr.txt';

    fetch(filename)
      .then(res => res.ok ? res.text() : 'Failed to load terms.')
      .then(text => setTermsText(text))
      .catch(() => setTermsText('Error loading terms.'));
  }, [disclaimerLang]);

  useEffect(() => {
    if (langCode) {
      setDisclaimerLang(langCode);
    }
  }, [langCode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('hs_referral_code', ref);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback('');

    if (!email.includes('@')) {
      setFeedback('Valid email is required.');
      return;
    }

    try {
      const apiRole = mapRoleForApi(role);
      const res = await login(email, apiRole, password);

      if (res.success) {
        if (res.directLogin) {
          if (apiRole === 'admin') navigate('/admin');
          else if (apiRole === 'advisor') navigate('/advisor');
          else if (apiRole === 'affiliate') navigate('/affiliate');
          else navigate('/app');
        } else {
          // Bypassing the OTP screen: automatically verify with default passkey '123456'
          try {
            const verifyRes = await verifyOtp(email, '123456');
            if (verifyRes.success) {
              const userRole = verifyRes.role || apiRole;
              if (userRole === 'admin') navigate('/admin');
              else if (userRole === 'advisor') navigate('/advisor');
              else if (userRole === 'affiliate') navigate('/affiliate');
              else navigate('/app');
            } else if (verifyRes.code === 'PENDING_APPROVAL') {
              setFeedback(verifyRes.message || 'Your registration request is pending admin approval.');
            } else {
              setFeedback(verifyRes.message || 'Verification failed.');
            }
          } catch (verifyErr) {
            setFeedback(verifyErr.response?.data?.message || verifyErr.message || 'OTP verification failed.');
          }
        }
      } else {
        setFeedback(res.message || 'Failed to authenticate.');
      }
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || 'An error occurred during login.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setFeedback('');

    const { name, phone, email: signupEmail, password: signupPassword, plan, specialty, isAgreed } = signupForm;
    if (!name || !phone || !signupEmail.includes('@')) {
      setFeedback('Please fill all signup fields with valid values.');
      return;
    }

    if (signupRole === 'user' && !plan) {
      setFeedback('Please select a subscription plan.');
      return;
    }

    if (!isAgreed) {
      setFeedback('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    try {
      const referral_code = localStorage.getItem('hs_referral_code') || undefined;
      const apiRole = signupRole === 'advisor' ? 'advisor' : (signupRole === 'affiliate' ? 'affiliate' : 'member');
      const res = await authApi.register(
        signupEmail.toLowerCase(),
        name,
        phone,
        referral_code,
        apiRole,
        signupRole === 'advisor' ? (specialty || 'Hormonal Health') : undefined,
        signupPassword
      );
      if (res.success) {
        if (signupRole === 'user') {
          // Members are auto-approved, store as Active (not Pending)
          const pending = readJsonArray(PENDING_SIGNUPS_KEY);
          const request = {
            id: `REQ-${Date.now()}`,
            user: name,
            email: signupEmail.toLowerCase(),
            phone,
            password: signupPassword,
            plan,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            status: 'Active'
          };
          writeJsonArray(PENDING_SIGNUPS_KEY, [request, ...pending]);
        }

        localStorage.removeItem(MEMBER_PLAN_KEY);
        localStorage.removeItem('hs_referral_code');
        setSelectedPlan(null);
        setJustSignedUp(true);
        setFeedback(signupRole === 'advisor'
          ? 'Advisor registration submitted. You will be notified once admin approves your account.'
          : (signupRole === 'affiliate'
            ? 'Partner registration submitted. You will be notified once admin approves your account.'
            : 'Registration successful! Your credentials are pre-filled below. You can log in now.')
        );
        setEmail(signupEmail.toLowerCase());
        setPassword(signupPassword);
        setRole(signupRole === 'affiliate' ? 'affiliate' : signupRole);
        setAuthMode('login');
      } else {
        setFeedback(res.message || 'Failed to submit signup request.');
      }
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || 'Failed to submit signup request.');
    }
  };

  const roles = [
    { id: 'user', name: 'Member', icon: User, color: '#ff69b4' },
    { id: 'admin', name: 'Admin', icon: ShieldCheck, color: '#15192c' },
  ];

  const demoCredentials = {
    user: { email: 'member@gmail.com', password: 'member123' },
    admin: { email: 'admin@healthsakhi.in', password: 'admin123' }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans" style={{ background: '#FFF7F8' }}>
      {/* Background Gradients */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] blur-[140px] rounded-full opacity-20"
        style={{ background: '#ff69b4' }}
      ></motion.div>
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] blur-[120px] rounded-full opacity-30"
        style={{ background: '#F5B4BC' }}
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-sm w-full mx-4 relative z-10"
      >
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-[#ff69b4]/5 border relative" style={{ borderColor: '#F5E6EA' }}>
          {/* Close Button */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 hover:bg-[#ff69b4] text-[#ff69b4] hover:text-white transition-all shadow-sm border border-rose-100/50 hover:border-[#ff69b4]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-16 h-16 rounded-[1.5rem] overflow-hidden flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#ff69b4]/20 transition-all"
            >
              <img 
                src="/Images/WhatsApp Image 2026-05-04 at 6.32.54 PM.jpeg" 
                alt="HealthSakhi Logo" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#15192c' }}>{t('brand', 'HealthSakhi')}</h1>
            <p className="font-bold text-[10px] mt-1 uppercase tracking-widest" style={{ color: '#C4A0AC' }}>{t('login.tagline', 'Trusted Wellness Companion')}</p>
          </div>




          {/* Signup Success Alert */}
          {justSignedUp && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl border text-left"
              style={{
                borderColor: '#10B981',
                background: '#ECFDF5',
              }}
            >
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                <div>
                  <h4 className="text-xs font-black text-[#065F46] uppercase tracking-wide">
                    {signupRole === 'user'
                      ? t('login.registrationComplete', 'Registration Complete! 🎉')
                      : t('login.requestSubmitted', 'Request Submitted!')}
                  </h4>
                  <p className="text-[10px] font-bold text-[#047857] mt-1 leading-normal">
                    {t('login.requestSubmittedDesc', 'Your registration is complete. Your credentials are pre-filled below — you can log in now.')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex bg-rose-50/50 p-1 rounded-2xl mb-5 border" style={{ borderColor: '#F5E6EA' }}>
            {['login', 'signup'].map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setAuthMode(mode);
                  if (mode === 'signup') {
                    setJustSignedUp(false);
                  }
                }}
                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === mode ? 'bg-white text-[#15192c] shadow-sm border' : 'text-[#C4A0AC]'}`}
                style={{ borderColor: '#F5E6EA' }}
              >
                {mode === 'login' ? t('login.loginTab', 'Login') : t('login.signupTab', 'Signup')}
              </button>
            ))}
          </div>



          {authMode === 'login' && (
            <div className="flex bg-rose-50/50 p-1 rounded-2xl mb-8 border" style={{ borderColor: '#F5E6EA' }}>
              {roles.map((r) => {
                const isActive = role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id);
                      setFeedback('');
                      const creds = demoCredentials[r.id];
                      if (creds) {
                        setEmail(creds.email);
                        setPassword(creds.password);
                      }
                    }}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all relative ${isActive ? 'text-[#15192c]' : 'text-[#C4A0AC]'}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeRole"
                        className="absolute inset-0 bg-white rounded-xl shadow-md border"
                        style={{ borderColor: '#F5E6EA' }}
                      />
                    )}
                    <span className="relative z-10"><r.icon size={16} style={{ color: isActive ? r.color : undefined }} /></span>
                    <span className="relative z-10 text-[8px] font-black uppercase tracking-widest">{getRoleName(r.id)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder', 'Email Address')}
                className="w-full h-14 px-5 rounded-2xl border bg-rose-50/20 focus:bg-white focus:shadow-xl outline-none transition-all text-xs font-bold shadow-inner"
                style={{ borderColor: '#F5E6EA' }}
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder', 'Password')}
                  className="w-full h-14 px-5 pr-12 rounded-2xl border bg-rose-50/20 focus:bg-white focus:shadow-xl outline-none transition-all text-xs font-bold shadow-inner"
                  style={{ borderColor: '#F5E6EA' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C4A0AC] hover:text-[#ff69b4] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-3"
                style={{ background: '#ff69b4' }}
              >
                {t('login.accessPortal', 'Access Portal')}
                <ArrowRight size={18} />
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <input type="text" required value={signupForm.name} onChange={(e) => setSignupForm((p) => ({ ...p, name: e.target.value }))} placeholder={t('login.fullName', 'Full Name')} className="w-full h-12 px-4 rounded-xl border bg-rose-50/20 text-xs font-bold" style={{ borderColor: '#F5E6EA' }} />
              <input type="text" required value={signupForm.phone} onChange={(e) => setSignupForm((p) => ({ ...p, phone: e.target.value }))} placeholder={t('login.phonePlaceholder', 'Phone Number')} className="w-full h-12 px-4 rounded-xl border bg-rose-50/20 text-xs font-bold" style={{ borderColor: '#F5E6EA' }} />
              <input type="email" required value={signupForm.email} onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value.toLowerCase() }))} placeholder={t('login.emailPlaceholder', 'Email Address')} className="w-full h-12 px-4 rounded-xl border bg-rose-50/20 text-xs font-bold" style={{ borderColor: '#F5E6EA' }} />
              <div className="relative">
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupForm.password}
                  onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder={t('login.passwordPlaceholder', 'Password')}
                  className="w-full h-12 px-4 pr-10 rounded-xl border bg-rose-50/20 text-xs font-bold"
                  style={{ borderColor: '#F5E6EA' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C4A0AC] hover:text-[#ff69b4] transition-colors"
                  aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignupPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {signupRole === 'user' && (
                <div className="relative w-full">
                  {selectedPlan && (
                    <div className="text-[8px] font-bold uppercase tracking-wider text-[#ff69b4] mb-1 pl-1 flex items-center justify-between">
                      <span>{t('login.preSelectedPlan', 'Pre-selected Subscription Plan')}</span>
                      <span className="text-rose-400">{t('login.locked', 'Locked')}</span>
                    </div>
                  )}
                  <select
                    value={signupForm.plan}
                    onChange={(e) => setSignupForm((p) => ({ ...p, plan: e.target.value }))}
                    className={`w-full h-12 px-4 rounded-xl border bg-rose-50/20 text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-[#ff69b4] ${selectedPlan ? 'border-[#ff69b4] bg-[#FFF0F2]/40 text-[#ff69b4]' : 'border-[#F5E6EA]'}`}
                  >
                    {planOptions.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
                  </select>
                </div>
              )}



              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3 py-2 px-1">
                <div className="relative flex items-center h-5">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={signupForm.isAgreed}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setShowTermsModal(true); // Open modal instead of ticking
                      } else {
                        setSignupForm(p => ({ ...p, isAgreed: false })); // Allow unticking directly
                      }
                    }}
                    className="w-4 h-4 rounded border-[#F5E6EA] text-[#ff69b4] focus:ring-[#ff69b4] cursor-pointer"
                  />
                </div>
                <label htmlFor="terms-checkbox" className="text-[10px] font-bold text-[#C4A0AC] leading-tight cursor-pointer" onClick={(e) => {
                  e.preventDefault(); // Prevent double trigger with checkbox
                  if (!signupForm.isAgreed) setShowTermsModal(true);
                  else setSignupForm(p => ({ ...p, isAgreed: false }));
                }}>
                  {t('login.agreeText', 'I have read and agree to the')}{' '}
                  <button type="button" onClick={() => navigate('/terms')} className="text-[#ff69b4] hover:underline">{t('login.termsOfService', 'Terms of Service')}</button>
                  {' '}{t('login.and', 'and')}{' '}
                  <button type="button" onClick={() => navigate('/privacy')} className="text-[#ff69b4] hover:underline">{t('login.privacyPolicy', 'Privacy Policy')}</button>
                </label>
              </div>

              <motion.button
                whileHover={signupForm.isAgreed ? { scale: 1.02 } : {}}
                whileTap={signupForm.isAgreed ? { scale: 0.98 } : {}}
                type="submit"
                disabled={!signupForm.isAgreed}
                className={`w-full py-4 text-[11px] font-black uppercase tracking-[0.3em] text-white rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-3 ${!signupForm.isAgreed ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                style={{ background: '#15192c' }}
              >
                {t('login.createSignup', 'Create Signup Request')}
              </motion.button>
            </form>
          )}

          {feedback && (
            <p className="text-[10px] font-bold mt-4 text-center" style={{ color: '#D17B88' }}>{feedback}</p>
          )}
        </div>
      </motion.div>


      {/* Terms & Privacy Policy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white w-full max-w-2xl md:max-w-3xl rounded-2xl md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden h-[85vh] max-h-[680px] relative mx-4 sm:mx-0"
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-white flex justify-between items-center">
              <div>
                <h3 className="font-serif font-black text-[#4B1E5A] text-xl md:text-2xl">{t('login.termsTitle', 'Terms & Privacy Policy')}</h3>
                <p className="text-[10px] md:text-xs font-bold text-[#C4A0AC] tracking-widest uppercase mt-1">{t('login.readCarefully', 'Please read carefully')}</p>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Scrollable Text */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 flex flex-col">
              <div className="flex gap-2 mb-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setDisclaimerLang('en')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${disclaimerLang === 'en' ? 'bg-[#ff69b4] text-white shadow-sm' : 'bg-white border border-rose-100 text-[#4B1E5A]/70 hover:bg-rose-50/50'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setDisclaimerLang('hi')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${disclaimerLang === 'hi' ? 'bg-[#ff69b4] text-white shadow-sm' : 'bg-white border border-rose-100 text-[#4B1E5A]/70 hover:bg-rose-50/50'}`}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setDisclaimerLang('mr')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${disclaimerLang === 'mr' ? 'bg-[#ff69b4] text-white shadow-sm' : 'bg-white border border-rose-100 text-[#4B1E5A]/70 hover:bg-rose-50/50'}`}
                >
                  मराठी
                </button>
              </div>

              <div className="prose prose-sm max-w-none text-[#4B1E5A]/80 whitespace-pre-wrap font-medium leading-relaxed flex-grow">
                {termsText || 'Loading...'}
              </div>
            </div>

            {/* Modal Footer / Accept Button */}
            <div className="flex-shrink-0 p-4 md:p-6 border-t border-gray-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-[10px] font-bold text-gray-400">{t('login.acceptNote', 'By accepting, you agree to all the terms listed above.')}</p>
              <button
                onClick={() => {
                  setSignupForm(p => ({ ...p, isAgreed: true }));
                  setShowTermsModal(false);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#E91E63] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#D81B60] hover:shadow-lg transition-all"
              >
                {t('login.acceptAgree', 'I Accept & Agree')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;


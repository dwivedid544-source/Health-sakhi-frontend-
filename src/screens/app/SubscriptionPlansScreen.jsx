import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, CreditCard, Shield, Sparkles, Crown, X, Tag, ChevronRight,
  RefreshCw, AlertCircle, FileText, Calendar, Clock, Zap, Users,
  Heart, Star, ArrowRight, Loader2, CheckCircle, XCircle, Download,
  Gift, Lock
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useLanguage } from '../../context/LanguageContext';

// ── Razorpay Key (set VITE_RAZORPAY_KEY_ID in .env for live mode; falls back to test key) ──
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_HEALTHSAKHI';

// ─── SUBSCRIPTION PLANS SCREEN ────────────────────────────────────────────────
const PLAN_TRANSLATIONS = {
  hi: {
    'Free Sakhi': 'निःशुल्क सखी',
    'Basic Sakhi': 'बेसिक सखी',
    'Premium Sakhi': 'प्रीमियम सखी',
    'FREE 🌸': 'मुफ़्त 🌸',
    'RECOMMENDED ⚡': 'अनुशंसित ⚡',
    'MOST POPULAR 🔥': 'सबसे लोकप्रिय 🔥',
    'Free 🌸': 'मुफ़्त 🌸',
    '1 Month': '1 महीना',
    '1 Month Subscription': '1 महीने की सदस्यता',
    'FREE FOREVER': 'हमेशा के लिए मुफ़्त',
    '1 MONTH UNLIMITED BOOKS & AI': '1 महीना असीमित पुस्तकें और एआई',
    'ALL FEATURES UNLIMITED ACCESS': 'सभी फीचर्स तक असीमित पहुंच',
    'Free — Explore core HealthSakhi features with no cost!': 'मुफ़्त — बिना किसी शुल्क के मुख्य हेल्थसखी सुविधाओं का पता लगाएं!',
    'Unlock AI Chat Bot 24/7, All Books Unlimited & Wellness Certificate for 1 month.': '1 महीने के लिए एआई चैट बॉट 24/7, सभी पुस्तकें असीमित और वेलनेस प्रमाणपत्र अनलॉक करें।',
    'All features, Partner Sakhi referral earnings & Ask Health Sakhi unlocked!': 'सभी सुविधाएं, पार्टनर सखी रेफ़रल कमाई और आस्क हेल्थ सखी अनलॉक!',
    'Books: Access limited to 5 books only (Limit enforced) 📚': 'पुस्तकें: केवल 5 पुस्तकों तक सीमित पहुंच (सीमा लागू) 📚',
    'Community Sakhis: Available ✅': 'कम्युनिटी सखियाँ: उपलब्ध ✅',
    'FAQ & Help: Available ✅': 'एफएक्यू और सहायता: उपलब्ध ✅',
    'To-Do List: Available ✅': 'टू-डू लिस्ट: उपलब्ध ✅',
    'Home Budget Sakhi: Available ✅': 'होम बजट सखी: उपलब्ध ✅',
    'Mental Health: Available ✅': 'मानसिक स्वास्थ्य: उपलब्ध ✅',
    'Period Tracker: Available ✅': 'पीरियड ट्रैकर: उपलब्ध ✅',
    'Ask Health Sakhi: LOCKED 🔒 (Shows lock screen + Upgrade CTA)': 'आस्क हेल्थ सखी: लॉक 🔒 (अपग्रेड स्क्रीन)',
    'AI Chat Bot: LOCKED 🔒 (Shows lock screen + Upgrade CTA)': 'एआई चैट बॉट: लॉक 🔒 (अपग्रेड स्क्रीन)',
    'Wellness Certificate: LOCKED 🔒 (Shows blurred lock screen + Upgrade CTA)': 'वेलनेस प्रमाणपत्र: लॉक 🔒 (अपग्रेड स्क्रीन)',
    'Partner Sakhi: LOCKED 🔒 (Shows lock screen + Upgrade CTA)': 'पार्टनर सखी: लॉक 🔒 (अपग्रेड स्क्रीन)',
    'Books: UNLIMITED ALL BOOKS 📚': 'पुस्तकें: असीमित सभी पुस्तकें 📚',
    'Wellness Certificate: UNLOCKED & DOWNLOADABLE 🏆': 'वेलनेस प्रमाणपत्र: अनलॉक और डाउनलोड योग्य 🏆',
    'AI Chat Bot: UNLOCKED 24/7 🤖': 'एआई चैट बॉट: अनलॉक 24/7 🤖',
    'Partner Sakhi: LOCKED 🔒 (Requires Premium)': 'पार्टनर सखी: लॉक 🔒 (प्रीमियम आवश्यक)',
    'Books Unlimited ✅': 'असीमित पुस्तकें ✅',
    'Community Sakhis ✅': 'कम्युनिटी सखियाँ ✅',
    'Wellness Certificate Download ✅': 'वेलनेस प्रमाणपत्र डाउनलोड ✅',
    'Partner Sakhi / Referral Earnings UNLOCKED 💰 ✅': 'पार्टनर सखी / रेफ़रल कमाई अनलॉक 💰 ✅',
    'Ask Health Sakhi Direct Support Chat UNLOCKED 💬 ✅': 'आस्क हेल्थ सखी डायरेक्ट सपोर्ट चैट अनलॉक 💬 ✅',
    'AI Chat Bot Unlimited ✅': 'एआई चैट बॉट असीमित ✅',
    'To-Do List ✅': 'टू-डू लिस्ट ✅',
    'Home Budget Sakhi ✅': 'होम बजट सखी ✅',
    'Mental Health ✅': 'मानसिक स्वास्थ्य ✅',
    'Period Tracker ✅': 'पीरियड ट्रैकर ✅'
  },
  mr: {
    'Free Sakhi': 'मोफत सखी',
    'Basic Sakhi': 'बेसिक सखी',
    'Premium Sakhi': 'प्रीमियम सखी',
    'FREE 🌸': 'मोफत 🌸',
    'RECOMMENDED ⚡': 'शिफारस केलेले ⚡',
    'MOST POPULAR 🔥': 'सर्वात लोकप्रिय 🔥',
    'Free 🌸': 'मोफत 🌸',
    '1 Month': '१ महिना',
    '1 Month Subscription': '१ महिन्याचे सबस्क्रिप्शन',
    'FREE FOREVER': 'कायमचे मोफत',
    '1 MONTH UNLIMITED BOOKS & AI': '१ महिना अमर्यादित पुस्तके आणि एआय',
    'ALL FEATURES UNLIMITED ACCESS': 'सर्व वैशिष्ट्यांमध्ये अमर्यादित प्रवेश',
    'Free — Explore core HealthSakhi features with no cost!': 'मोफत — कोणत्याही खर्चाशिवाय मुख्य हेल्थसखी वैशिष्ट्ये एक्सप्लोर करा!',
    'Unlock AI Chat Bot 24/7, All Books Unlimited & Wellness Certificate for 1 month.': '१ महिन्यासाठी एआय चॅट बॉट २४/७, सर्व पुस्तके अमर्यादित आणि वेलनेस प्रमाणपत्र अनलॉक करा.',
    'All features, Partner Sakhi referral earnings & Ask Health Sakhi unlocked!': 'सर्व वैशिष्ट्ये, पार्टनर सखी रेफरल कमाई आणि आस्क हेल्थ सखी अनलॉक!',
    'Books: Access limited to 5 books only (Limit enforced) 📚': 'पुस्तके: केवळ ५ पुस्तकांपर्यंत मर्यादित प्रवेश (मर्यादा लागू) 📚',
    'Community Sakhis: Available ✅': 'कम्युनिटी सखी: उपलब्ध ✅',
    'FAQ & Help: Available ✅': 'एफएक्यू आणि मदत: उपलब्ध ✅',
    'To-Do List: Available ✅': 'टू-डू लिस्ट: उपलब्ध ✅',
    'Home Budget Sakhi: Available ✅': 'होम बजेट सखी: उपलब्ध ✅',
    'Mental Health: Available ✅': 'मानसिक आरोग्य: उपलब्ध ✅',
    'Period Tracker: Available ✅': 'मासिक पाळी ट्रॅकर: उपलब्ध ✅',
    'Ask Health Sakhi: LOCKED 🔒 (Shows lock screen + Upgrade CTA)': 'आस्क हेल्थ सखी: लॉक 🔒 (अपग्रेड स्क्रीन)',
    'AI Chat Bot: LOCKED 🔒 (Shows lock screen + Upgrade CTA)': 'एआय चॅट बॉट: लॉक 🔒 (अपग्रेड स्क्रीन)',
    'Wellness Certificate: LOCKED 🔒 (Shows blurred lock screen + Upgrade CTA)': 'वेलनेस प्रमाणपत्र: लॉक 🔒 (अपग्रेड स्क्रीन)',
    'Partner Sakhi: LOCKED 🔒 (Shows lock screen + Upgrade CTA)': 'पार्टनर सखी: लॉक 🔒 (अपग्रेड स्क्रीन)',
    'Books: UNLIMITED ALL BOOKS 📚': 'पुस्तके: अमर्यादित सर्व पुस्तके 📚',
    'Wellness Certificate: UNLOCKED & DOWNLOADABLE 🏆': 'वेलनेस प्रमाणपत्र: अनलॉक केलेले आणि डाउनलोड करण्यायोग्य 🏆',
    'AI Chat Bot: UNLOCKED 24/7 🤖': 'एआय चॅट बॉट: अनलॉक केलेले २४/७ 🤖',
    'Partner Sakhi: LOCKED 🔒 (Requires Premium)': 'पार्टनर सखी: लॉक 🔒 (प्रीमियम आवश्यक)',
    'Books Unlimited ✅': 'पुस्तके अमर्यादित ✅',
    'Community Sakhis ✅': 'कम्युनिटी सखी ✅',
    'Wellness Certificate Download ✅': 'वेलनेस प्रमाणपत्र डाउनलोड ✅',
    'Partner Sakhi / Referral Earnings UNLOCKED 💰 ✅': 'पार्टनर सखी / रेफरल कमाई अनलॉक 💰 ✅',
    'Ask Health Sakhi Direct Support Chat UNLOCKED 💬 ✅': 'आस्क हेल्थ सखी डायरेक्ट सपोर्ट चॅट अनलॉक 💬 ✅',
    'AI Chat Bot Unlimited ✅': 'एआय चॅट बॉट अमर्यादित ✅',
    'To-Do List ✅': 'टू-डू लिस्ट ✅',
    'Home Budget Sakhi ✅': 'होम बजेट सखी ✅',
    'Mental Health ✅': 'मानसिक आरोग्य ✅',
    'Period Tracker ✅': 'मासिक पाळी ट्रॅकर ✅'
  }
};

const translatePlanLocal = (plan, lang) => {
  if (!lang || lang === 'en') return plan;
  const dict = PLAN_TRANSLATIONS[lang];
  if (!dict) return plan;

  const translateStr = (str) => {
    if (!str) return str;
    const trimmed = str.trim();
    return dict[trimmed] || dict[str] || str;
  };

  const translateFeature = (f) => {
    if (typeof f === 'string') return translateStr(f);
    if (f && typeof f === 'object') {
      return {
        ...f,
        name: translateStr(f.name),
        value: translateStr(f.value),
        featureValue: translateStr(f.featureValue)
      };
    }
    return f;
  };

  return {
    ...plan,
    name: translateStr(plan.name),
    shortDescription: translateStr(plan.shortDescription),
    priceSubtext: translateStr(plan.priceSubtext),
    highlightTag: translateStr(plan.highlightTag),
    duration: translateStr(plan.duration),
    features: (plan.features || []).map(translateFeature)
  };
};

const SubscriptionPlansScreen = () => {
  const { t, langCode } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [subscription, setSub] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('plans'); // plans | checkout | processing | success | failure
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [viewInvoice, setViewInvoice] = useState(null);
  const rzpRef = useRef(null); // Razorpay instance ref

  // ─── LOAD DATA ────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.all([
        axiosClient.get('/subscriptions/plans'),
        axiosClient.get('/subscriptions/my')
      ]);
      let fetchedPlans = plansRes.data?.plans || [];
      if (langCode !== 'en') {
        fetchedPlans = fetchedPlans.map(plan => translatePlanLocal(plan, langCode));
      }
      setPlans(fetchedPlans);
      
      let fetchedSub = subRes.data?.subscription || null;
      if (fetchedSub && fetchedSub.plan && langCode !== 'en') {
        fetchedSub = {
          ...fetchedSub,
          plan: translatePlanLocal(fetchedSub.plan, langCode)
        };
      }
      setSub(fetchedSub);
      setInvoices(subRes.data?.invoices || []);
    } catch (err) {
      console.error('Error loading subscription data:', err);
    } finally {
      setLoading(false);
    }
  }, [langCode]);

  useEffect(() => { loadData(); }, [loadData, langCode]);

  // ─── APPLY COUPON ─────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponResult(null);
    try {
      const res = await axiosClient.post('/subscriptions/coupon/validate', {
        code: couponCode.trim().toUpperCase(),
        planSlug: selectedPlan.slug,
        amount: selectedPlan.price
      });
      setCouponResult(res.data?.coupon);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponResult(null);
    setCouponError('');
  };

  // ─── CREATE ORDER ─────────────────────────────────────────────────────
  const handleProceedToCheckout = (plan) => {
    setSelectedPlan(plan);
    removeCoupon();
    setStep('checkout');
  };

  // ─── REAL RAZORPAY PAYMENT HANDLER ──────────────────────────────────────
  const handlePayNow = async () => {
    if (!selectedPlan) return;
    setActionLoading(true);
    try {
      // Step 1: Create order on backend
      const res = await axiosClient.post('/subscriptions/order', {
        planSlug: selectedPlan.slug,
        couponCode: couponResult ? couponCode.toUpperCase() : undefined
      });

      // Free plan — no payment needed
      if (res.data?.free) {
        setStep('success');
        setToast('Free plan activated successfully!');
        loadData();
        setActionLoading(false);
        return;
      }

      const order = res.data?.order;
      setPaymentOrder(order);
      setActionLoading(false);

      // Step 2: Open Razorpay Checkout popup
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,              // amount in paise from backend
        currency: order.currency || 'INR',
        name: 'Health Sakhi',
        description: `${order.planName} Subscription`,
        order_id: order.orderId,
        image: '/Images/logo.png',
        prefill: {},
        theme: { color: '#ff69b4' },
        modal: {
          ondismiss: async () => {
            // User closed popup without paying
            try {
              await axiosClient.post('/subscriptions/failure', {
                orderId: order.orderId,
                reason: 'User dismissed payment modal'
              });
            } catch (_) {}
            setStep('failure');
          }
        },
        handler: async (response) => {
          // Step 3: Payment successful — verify on backend
          setStep('processing');
          try {
            await axiosClient.post('/subscriptions/verify', {
              orderId: order.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            // Redeem reward coins if applied
            if (useRewardCoins && rewardDiscountRupees > 0) {
              const redemptions = JSON.parse(localStorage.getItem('hs_redemptions') || '[]');
              redemptions.push({
                id: Date.now(),
                name: 'Premium Subscription Discount',
                points: rewardDiscountRupees * 20,
                redeemedAt: new Date().toISOString()
              });
              localStorage.setItem('hs_redemptions', JSON.stringify(redemptions));
              const remaining = Math.max(0, rewardCoins - (rewardDiscountRupees * 20));
              localStorage.setItem('hs_reward_balance', String(remaining));
              window.dispatchEvent(new Event('hs_balance_update'));
            }

            setStep('success');
            setToast('Payment successful! Subscription activated.');
            loadData();
          } catch (verifyErr) {
            // Verification failed
            try {
              await axiosClient.post('/subscriptions/failure', {
                orderId: order.orderId,
                reason: 'Payment verification failed'
              });
            } catch (_) {}
            setStep('failure');
          }
        }
      };

      // Destroy any previous instance
      if (rzpRef.current) rzpRef.current.close();
      const rzp = new window.Razorpay(options);
      rzpRef.current = rzp;
      rzp.on('payment.failed', async (resp) => {
        try {
          await axiosClient.post('/subscriptions/failure', {
            orderId: order.orderId,
            reason: resp?.error?.description || 'Payment failed'
          });
        } catch (_) {}
        setStep('failure');
      });
      rzp.open();

    } catch (err) {
      setToast(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStep('failure');
      setActionLoading(false);
    }
  };

  // ─── CANCEL SUBSCRIPTION ──────────────────────────────────────────────
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Free plan.')) return;
    setActionLoading(true);
    try {
      await axiosClient.post('/subscriptions/cancel');
      setToast('Subscription cancelled. Free plan activated.');
      loadData();
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── RENEW SUBSCRIPTION ───────────────────────────────────────────────
  const handleRenew = async () => {
    setActionLoading(true);
    try {
      await axiosClient.post('/subscriptions/renew');
      setToast('Subscription renewed successfully!');
      loadData();
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to renew.');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── DOWNLOAD INVOICE PDF ─────────────────────────────────────────────
  const handleViewInvoice = async (invoiceId) => {
    try {
      const res = await axiosClient.get(`/subscriptions/invoice/${invoiceId}`);
      const inv = res.data?.invoice;
      if (!inv) { setToast('Invoice not found.'); return; }

      setViewInvoice(inv); // also set for modal preview

      // Generate PDF
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header
      doc.setFillColor(255, 105, 180);
      doc.rect(0, 0, 210, 42, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Health Sakhi', 15, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Payment Receipt', 15, 27);
      doc.text(`Receipt No: ${inv.invoiceNumber || inv.id}`, 15, 35);

      // Body rows
      const rows = [
        ['Invoice Number', inv.invoiceNumber || inv.id],
        ['Plan', inv.plan?.name || 'Subscription'],
        ['Base Amount', `\u20b9 ${Number(inv.amount || 0).toLocaleString('en-IN')}`],
        ['Discount', `\u20b9 ${Number(inv.discountAmount || 0).toLocaleString('en-IN')}`],
        ['GST (18%)', `\u20b9 ${Number(inv.tax || 0).toLocaleString('en-IN')}`],
        ['Status', inv.status || 'PAID'],
        ['Paid On', inv.paidAt ? new Date(inv.paidAt).toLocaleString('en-IN') : 'N/A'],
      ];

      let y = 58;
      rows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(110, 110, 110);
        doc.text(label, 15, y);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
        doc.text(String(value), 85, y);
        y += 9;
      });

      // Divider
      doc.setDrawColor(255, 105, 180); doc.setLineWidth(0.4); doc.line(15, y + 2, 195, y + 2);

      // Total
      const total = Number(inv.amount || 0) - Number(inv.discountAmount || 0) + Number(inv.tax || 0);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(255, 20, 147);
      doc.text('Total Paid', 15, y + 12);
      doc.text(`\u20b9 ${total.toLocaleString('en-IN')}`, 85, y + 12);

      // Footer
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
      doc.text('This is a computer-generated receipt. For support: support@healthsakhi.com', 15, 270);

      doc.save(`HealthSakhi_Invoice_${inv.invoiceNumber || inv.id}.pdf`);
    } catch (err) {
      setToast('Failed to generate invoice PDF.');
    }
  };

  const [useRewardCoins, setUseRewardCoins] = useState(true);
  const rewardCoins = parseInt(localStorage.getItem('hs_reward_balance') || '0', 10);
  const rewardDiscountRupees = Math.floor(rewardCoins / 20); // 1000 Coins = ₹50 OFF

  const getAmount = () => {
    if (!selectedPlan) return 0;
    const base = couponResult ? couponResult.finalAmount : selectedPlan.price;
    const discount = (useRewardCoins && rewardDiscountRupees > 0) ? rewardDiscountRupees : 0;
    return Math.max(0, base - discount);
  };

  const getDiscount = () => couponResult ? couponResult.discountAmount : 0;

  // Plan icon mapping
  const planIcon = (slug) => {
    if (slug?.includes('free')) return <Heart size={24} className="text-emerald-500" />;
    if (slug?.includes('premium')) return <Crown size={24} className="text-amber-500" />;
    if (slug?.includes('basic')) return <Zap size={24} className="text-[#ff69b4]" />;
    return <Users size={24} className="text-purple-500" />;
  };

  const planGradient = (slug, isActive) => {
    if (isActive) return 'from-[#1A0B13] to-[#2E1220]';
    if (slug?.includes('premium')) return 'from-amber-50 to-orange-50';
    if (slug?.includes('basic')) return 'from-rose-50 to-pink-50';
    if (slug?.includes('family') || slug?.includes('elite')) return 'from-purple-50 to-indigo-50';
    return 'from-emerald-50 to-teal-50';
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: PROCESSING SCREEN
  // ═══════════════════════════════════════════════════════════════════════
  if (step === 'processing') return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center py-20">
      <div className="w-24 h-24 rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center mx-auto mb-8">
        <Loader2 size={48} className="text-[#ff69b4] animate-spin" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">Verifying Payment</p>
      <h2 className="text-2xl font-black text-[#15192c] mb-2">{t('plans.pleaseWait', 'Please wait...')}</h2>
      <p className="text-sm text-[#9A8A8E] font-medium">Confirming your payment and activating your subscription...</p>
      {paymentOrder && (
        <div className="mt-6 bg-white rounded-2xl p-4 border border-rose-50 text-left text-xs font-semibold text-[#6B5E63]">
          <p><span className="text-[#15192c] font-black">Order ID:</span> {paymentOrder.orderId}</p>
          <p className="mt-1"><span className="text-[#15192c] font-black">Amount:</span> ₹{paymentOrder.finalAmount}</p>
        </div>
      )}
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: SUCCESS SCREEN
  // ═══════════════════════════════════════════════════════════════════════
  if (step === 'success') return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-16">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-8">
        <CheckCircle size={48} className="text-emerald-500" />
      </motion.div>
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Payment Successful!</p>
      <h2 className="text-3xl font-black text-[#15192c] mb-2">{t('plans.welcomeAboard', 'Welcome aboard! 🎉')}</h2>
      <p className="text-sm text-[#9A8A8E] font-medium mb-8">Your subscription has been activated. Enjoy all premium features!</p>
      <button onClick={() => { setStep('plans'); loadData(); }}
        className="w-full py-4 bg-[#ff69b4] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg">
        View My Subscription
      </button>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: FAILURE SCREEN
  // ═══════════════════════════════════════════════════════════════════════
  if (step === 'failure') return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-16">
      <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mx-auto mb-8">
        <XCircle size={48} className="text-red-500" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Payment Failed</p>
      <h2 className="text-3xl font-black text-[#15192c] mb-2">{t('plans.errorTitle', 'Something went wrong')}</h2>
      <p className="text-sm text-[#9A8A8E] font-medium mb-8">Your payment could not be processed. No amount has been deducted.</p>
      <div className="space-y-3">
        <button onClick={() => setStep('checkout')}
          className="w-full py-4 bg-[#ff69b4] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg">
          Try Again
        </button>
        <button onClick={() => setStep('plans')}
          className="w-full py-3.5 bg-rose-50 text-[#ff69b4] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-100 transition-all">
          Back to Plans
        </button>
      </div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: CHECKOUT SCREEN
  // ═══════════════════════════════════════════════════════════════════════
  if (step === 'checkout' && selectedPlan) return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl mx-auto pb-20">
      {/* Header */}
      <button onClick={() => setStep('plans')} className="flex items-center gap-2 text-xs font-bold text-[#9A8A8E] mb-6 hover:text-[#ff69b4] transition-colors">
        ← Back to Plans
      </button>

      <h1 className="text-3xl font-black tracking-tight text-[#15192c] mb-1">{t('plans.completePurchase', 'Complete Your Purchase')}</h1>
      <p className="text-sm font-medium text-[#9A8A8E] mb-8">Review your order and complete payment securely.</p>

      {/* Selected Plan */}
      <div className="bg-white rounded-[2rem] border border-[#F5E6EA] p-7 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
              {planIcon(selectedPlan.slug)}
            </div>
            <div>
              <h3 className="text-lg font-black text-[#15192c]">{selectedPlan.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">{selectedPlan.interval} Plan</p>
            </div>
          </div>
          <p className="text-2xl font-black text-[#15192c]">₹{selectedPlan.price}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedPlan.features?.slice(0, 4).map((f, i) => (
            <span key={i} className="px-2.5 py-1 bg-rose-50 rounded-lg text-[9px] font-bold text-[#D17B88] border border-rose-100/50">
              {typeof f === 'string' ? f : (f.name && f.value ? `${f.name}: ${f.value}` : (f.value || f.featureValue || f.name || ''))}
            </span>
          ))}
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-white rounded-[2rem] border border-[#F5E6EA] p-7 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={16} className="text-[#ff69b4]" />
          <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">Apply Coupon Code</p>
        </div>

        {couponResult ? (
          <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-emerald-600" />
              <div>
                <p className="text-xs font-black text-emerald-700">{couponResult.code} Applied</p>
                <p className="text-[10px] font-bold text-emerald-600">
                  {couponResult.discountType === 'PERCENTAGE' ? `${couponResult.discountValue}% off` : `₹${couponResult.discountValue} off`}
                  {' · '}You save ₹{couponResult.discountAmount}
                </p>
              </div>
            </div>
            <button onClick={removeCoupon} className="w-7 h-7 rounded-full bg-white text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="WELCOME50"
              className="flex-1 h-12 px-4 rounded-xl border-2 border-[#F5E6EA] focus:border-[#ff69b4] outline-none text-sm font-bold text-[#15192c] uppercase tracking-wider"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              className={`px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                couponCode.trim() ? 'bg-[#15192c] text-white hover:brightness-125' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}>
              {couponLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Apply'}
            </button>
          </div>
        )}
        {couponError && <p className="text-[10px] font-bold text-red-500 mt-2">{couponError}</p>}
      </div>

      {/* Reward Coins Discount Section */}
      {rewardCoins > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[2rem] border border-amber-200/60 p-6 mb-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg">
              🪙
            </div>
            <div>
              <p className="text-xs font-black text-amber-900">Redeem Reward Coins ({rewardCoins} Coins)</p>
              <p className="text-[10px] font-bold text-amber-700 mt-0.5">
                Save ₹{rewardDiscountRupees} on your Plan (20 Coins = ₹1 OFF)
              </p>
            </div>
          </div>
          <button
            onClick={() => setUseRewardCoins(!useRewardCoins)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              useRewardCoins ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-amber-800 border border-amber-300'
            }`}
          >
            {useRewardCoins ? 'Applied ✓' : 'Apply Coins'}
          </button>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white rounded-[2rem] border border-[#F5E6EA] p-7 mb-6 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC] mb-4">Order Summary</p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold text-[#6B5E63]">
            <span>{selectedPlan.name} ({selectedPlan.interval})</span>
            <span>₹{selectedPlan.price}</span>
          </div>
          {getDiscount() > 0 && (
            <div className="flex justify-between text-sm font-bold text-emerald-600">
              <span>Coupon Discount</span>
              <span>- ₹{getDiscount()}</span>
            </div>
          )}
          {useRewardCoins && rewardDiscountRupees > 0 && (
            <div className="flex justify-between text-sm font-bold text-amber-600">
              <span>Reward Coins Discount ({rewardDiscountRupees * 20} Coins)</span>
              <span>- ₹{rewardDiscountRupees}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-[#6B5E63]">
            <span>GST (18%)</span>
            <span>₹{(getAmount() * 0.18).toFixed(2)}</span>
          </div>
          <div className="h-px bg-rose-50" />
          <div className="flex justify-between text-lg font-black text-[#15192c]">
            <span>Total Payable</span>
            <span>₹{(getAmount() * 1.18).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayNow}
        disabled={actionLoading}
        className="w-full py-4 bg-gradient-to-r from-[#ff69b4] to-[#ff1493] text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-rose-200/50 flex items-center justify-center gap-3"
      >
        {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
        {actionLoading ? 'Opening Payment Gateway...' : `Pay ₹${(getAmount() * 1.18).toFixed(2)} via Razorpay`}
      </button>

      <p className="text-center text-[9px] font-bold text-[#C4A0AC] mt-4 uppercase tracking-wider">
        🔒 256-bit SSL Secured · Powered by Razorpay
      </p>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: MAIN PLANS SCREEN
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto px-2 lg:px-0 mt-4 pb-20 space-y-10">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-white rounded-2xl border border-rose-100 shadow-xl px-5 py-4 flex items-center gap-3 max-w-sm">
            <CheckCircle size={18} className="text-emerald-500 shrink-0" />
            <p className="text-xs font-bold text-[#15192c]">{toast}</p>
            <button onClick={() => setToast('')} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Loader */}
      {actionLoading && (
        <div className="fixed inset-0 z-[100] bg-[#15192c]/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl border border-rose-50 flex items-center gap-3 shadow-xl">
            <RefreshCw className="animate-spin text-[#ff69b4]" size={20} />
            <span className="text-xs font-black uppercase tracking-wider">Processing...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#15192c]">{t('plans.billingTitle', 'Subscription & Billing')}</h1>
        <p className="text-sm font-medium text-[#9A8A8E] mt-1">{t('plans.billingSubtitle', 'Choose your plan, manage billing, and view invoices.')}</p>
      </div>

      {loading ? (
        <div className="h-40 bg-white border border-rose-50 rounded-[2.5rem] flex items-center justify-center animate-pulse">
          <RefreshCw size={24} className="animate-spin text-[#ff69b4]/60" />
        </div>
      ) : (
        <>
          {/* ── CURRENT SUBSCRIPTION ─────────────────────────────────────── */}
          {subscription && (
            <section className="bg-white rounded-[2.5rem] border border-[#F5E6EA] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff69b4] to-[#ff1493] flex items-center justify-center text-white">
                    <Crown size={22} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">Active Subscription</p>
                    <h2 className="text-xl font-black text-[#15192c]">{subscription.plan.name}</h2>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                  {subscription.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Plan', value: subscription.plan.name, icon: Shield },
                  { label: 'Price', value: `₹${subscription.plan.price}/${subscription.plan.interval === 'YEARLY' ? 'yr' : 'mo'}`, icon: CreditCard },
                  { label: 'Started', value: new Date(subscription.startsAt).toLocaleDateString(), icon: Calendar },
                  { label: 'Expires', value: new Date(subscription.endsAt).toLocaleDateString(), icon: Clock }
                ].map((item, i) => (
                  <div key={i} className="bg-rose-50/30 rounded-2xl p-4 border border-rose-100/30">
                    <item.icon size={14} className="text-[#ff69b4] mb-1.5" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#C4A0AC] mb-0.5">{item.label}</p>
                    <p className="text-sm font-black text-[#15192c]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {subscription.plan.slug !== 'free-sakhi' && (
                  <>
                    <button onClick={handleRenew}
                      className="flex-1 py-3 bg-[#ff69b4] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2">
                      <RefreshCw size={14} /> Renew Subscription
                    </button>
                    <button onClick={handleCancel}
                      className="px-6 py-3 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </section>
          )}

          {/* ── PLAN CARDS ───────────────────────────────────────────────── */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-[#15192c]">
                {subscription ? t('plans.upgradePlan', 'Upgrade / Change Plan') : t('plans.choosePlan', 'Choose Your Plan')}
              </h2>
              <span className="px-3 py-1 bg-rose-50 text-[#ff69b4] rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100">
                {plans.length} {t('plans.plansAvailable', 'Plans Available')}
              </span>
            </div>

            <div className={`grid grid-cols-1 ${plans.length >= 3 ? 'lg:grid-cols-3' : plans.length === 2 ? 'lg:grid-cols-2' : 'max-w-md mx-auto'} gap-8`}>
              {plans.map((plan) => {
                const isActive = subscription?.plan?.slug === plan.slug;
                const isPremium = plan.slug?.includes('premium');

                return (
                  <motion.div key={plan.id} whileHover={{ y: -6 }}
                    className={`relative rounded-[2.5rem] p-8 border flex flex-col justify-between transition-all duration-300 overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-br from-[#1A0B13] to-[#2E1220] text-white border-[#1A0B13] shadow-2xl shadow-pink-950/20'
                        : isPremium
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 shadow-lg hover:shadow-xl'
                        : 'bg-white border-[#F5E6EA] shadow-sm hover:shadow-lg'
                    }`}>
                    {/* Glow effect for premium */}
                    {isPremium && !isActive && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl -mr-12 -mt-12" />
                    )}

                    {/* Popular tag */}
                    {isPremium && (
                      <span className={`absolute -top-0 left-1/2 -translate-x-1/2 translate-y-4 px-4 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg ${
                        isActive ? 'bg-pink-500 text-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      }`}>
                        {t('plans.mostPopular', 'Most Popular 🔥')}
                      </span>
                    )}

                    <div className="relative z-10">
                      {/* Icon + Name */}
                      <div className="flex items-center gap-3 mb-4 mt-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isActive ? 'bg-white/10' : isPremium ? 'bg-amber-100' : 'bg-emerald-50'
                        }`}>
                          {planIcon(plan.slug)}
                        </div>
                        <div>
                          <h3 className="text-lg font-black">{plan.name}</h3>
                          <p className={`text-[9px] font-extrabold uppercase tracking-widest ${
                            isActive ? 'text-pink-300' : 'text-[#ff69b4]'
                          }`}>{plan.interval} Plan</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-black ${isActive ? 'text-white' : 'text-[#15192c]'}`}>
                            {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                          </span>
                          {plan.price > 0 && (
                            <span className={`text-[11px] font-bold ${isActive ? 'text-white/60' : 'text-[#C4A0AC]'}`}>
                              /{plan.interval === 'YEARLY' ? 'year' : 'month'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`h-px w-full mb-5 ${isActive ? 'bg-white/10' : 'bg-rose-100'}`} />

                      {/* Features */}
                      <div className="space-y-3 mb-7">
                        {[...(plan.features || [])].sort((a, b) => {
                          const nameA = typeof a === 'string' ? a : (a.name || a.featureName || '');
                          const nameB = typeof b === 'string' ? b : (b.name || b.featureName || '');
                          const idxA = nameA.toLowerCase().includes('feature') ? parseInt(nameA.replace(/\D/g, '') || '0', 10) : 0;
                          const idxB = nameB.toLowerCase().includes('feature') ? parseInt(nameB.replace(/\D/g, '') || '0', 10) : 0;
                          return idxA - idxB;
                        }).filter(f => {
                          const n = (typeof f === 'string' ? f : (f.name || f.featureName || '')).toLowerCase();
                          return n !== 'duration' && n !== 'short description' && n !== 'highlight tag' && n !== 'price subtext';
                        }).map((f, i) => (
                          <div key={i} className={`flex items-center gap-2.5 text-xs font-bold ${isActive ? 'text-white/85' : 'text-[#6B5E63]'}`}>
                            <Check size={12} className={isActive ? 'text-pink-300' : 'text-[#D17B88]'} />
                            {typeof f === 'string' ? f : (f.value || f.featureValue || f.name || '')}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => isActive ? null : handleProceedToCheckout(plan)}
                      disabled={isActive}
                      className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 ${
                        isActive
                          ? 'bg-white/20 text-white/60 cursor-default'
                          : isPremium
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110 shadow-md shadow-amber-200/50'
                          : 'bg-[#ff69b4] text-white hover:brightness-110 shadow-md shadow-pink-200'
                      }`}
                    >
                      {isActive ? '✓ Current Plan' : plan.price === 0 ? 'Activate Free Plan' : 'Subscribe Now'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── INVOICES / BILLING HISTORY ────────────────────────────────── */}
          {invoices.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight text-[#15192c]">{t('plans.billingHistory', 'Billing History')}</h2>
              <div className="bg-white rounded-[2.5rem] border border-rose-50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-rose-50 bg-rose-50/20 text-[9px] font-black uppercase tracking-widest text-[#C4A0AC]">
                        <th className="p-5">Invoice</th>
                        <th className="p-5">Amount</th>
                        <th className="p-5">Discount</th>
                        <th className="p-5">Status</th>
                        <th className="p-5">Date</th>
                        <th className="p-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50/50 text-xs font-semibold">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-rose-50/10">
                          <td className="p-5 font-black text-[#15192c]">{inv.invoiceNumber}</td>
                          <td className="p-5">₹{inv.amount}</td>
                          <td className="p-5 text-emerald-600">{inv.discountAmount > 0 ? `-₹${inv.discountAmount}` : '-'}</td>
                          <td className="p-5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>{inv.status}</span>
                          </td>
                          <td className="p-5 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                          <td className="p-5 text-right">
                            <button onClick={() => handleViewInvoice(inv.id)}
                              className="px-3 py-1.5 bg-[#ff69b4] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 flex items-center gap-1.5 ml-auto">
                              <Download size={12} /> PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ── FEATURE COMPARISON TABLE ──────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                <Zap size={16} className="text-[#ff69b4]" />
              </div>
              <h2 className="text-xl font-black text-[#15192c]">{t('plans.featureCompare', 'Feature Comparison')}</h2>
            </div>

            <div className="bg-white rounded-[2rem] border border-rose-50 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-rose-50/60 to-pink-50/40 border-b border-rose-100/50">
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-[#15192c]">Feature</th>
                      <th className="p-5 text-center">
                        <div className="text-[9px] font-black uppercase tracking-widest text-[#9A8A8E]">Free Sakhi</div>
                        <div className="text-sm font-black text-[#15192c] mt-0.5">₹0</div>
                      </th>
                      <th className="p-5 text-center bg-rose-50/40 border-x border-rose-100/50">
                        <div className="text-[9px] font-black uppercase tracking-widest text-[#ff69b4]">Basic Sakhi</div>
                        <div className="text-sm font-black text-[#15192c] mt-0.5">₹699<span className="text-[9px] font-bold text-[#9A8A8E]">/mo</span></div>
                      </th>
                      <th className="p-5 text-center bg-gradient-to-b from-violet-50/40 to-purple-50/20">
                        <div className="text-[9px] font-black uppercase tracking-widest text-violet-500">Premium Sakhi</div>
                        <div className="text-sm font-black text-[#15192c] mt-0.5">₹1,299<span className="text-[9px] font-bold text-[#9A8A8E]">/mo</span></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50/60 text-xs font-semibold text-[#6B5E63]">
                    {[
                      { feature: '🏠 Home Dashboard',    free: true,   basic: true,   premium: true },
                      { feature: '📚 Books Access',       free: '5 only', basic: 'All ∞', premium: 'All ∞' },
                      { feature: '👭 Community Sakhis',   free: true,   basic: true,   premium: true },
                      { feature: '🤖 AI Chat Bot',         free: false,  basic: true,   premium: true },
                      { feature: '🏆 Wellness Certificate',free: false, basic: true,   premium: true },
                      { feature: '💰 Partner Sakhi',      free: false,  basic: false,  premium: true },
                      { feature: '❓ FAQ & Help',          free: true,   basic: true,   premium: true },
                      { feature: '💬 Ask Health Sakhi',   free: false,  basic: false,  premium: true },
                      { feature: '🪙 Rewards & Balance',   free: true,   basic: true,   premium: true },
                      { feature: '✅ To-Do List',          free: true,   basic: true,   premium: true },
                      { feature: '💸 Home Budget Sakhi',  free: true,   basic: true,   premium: true },
                      { feature: '🧠 Mental Health',      free: true,   basic: true,   premium: true },
                      { feature: '🌸 Period Tracker',     free: true,   basic: true,   premium: true },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-rose-50/20 transition-colors">
                        <td className="p-4 font-bold text-[#15192c] text-xs">{row.feature}</td>
                        <td className="p-4 text-center">
                          {row.free === true ? (
                            <Check size={16} className="text-emerald-500 mx-auto" />
                          ) : row.free === false ? (
                            <Lock size={14} className="text-rose-300 mx-auto" />
                          ) : (
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{row.free}</span>
                          )}
                        </td>
                        <td className="p-4 text-center bg-rose-50/20">
                          {row.basic === true ? (
                            <Check size={16} className="text-emerald-500 mx-auto" />
                          ) : row.basic === false ? (
                            <Lock size={14} className="text-rose-300 mx-auto" />
                          ) : (
                            <span className="text-[10px] font-black text-[#ff69b4] bg-rose-50 px-2 py-0.5 rounded-full">{row.basic}</span>
                          )}
                        </td>
                        <td className="p-4 text-center bg-violet-50/10">
                          {row.premium === true ? (
                            <Check size={16} className="text-emerald-500 mx-auto" />
                          ) : row.premium === false ? (
                            <Lock size={14} className="text-rose-300 mx-auto" />
                          ) : (
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{row.premium}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── AUTO-BILLING FOOTER ────────────────────────────────────────── */}
          <div className="rounded-[2rem] bg-white border border-[#F5E6EA] p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-[#ff69b4]">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-sm font-black text-[#15192c]">
                {import.meta.env.VITE_RAZORPAY_KEY_ID && !import.meta.env.VITE_RAZORPAY_KEY_ID.includes('HEALTHSAKHI')
                  ? '🔒 Secured by Razorpay — Live Mode'
                  : '🧪 Razorpay Test Mode — No real charges'}
              </p>
              <p className="text-xs font-bold text-[#9A8A8E]">
                256-bit SSL encrypted. Your payment details are never stored on our servers.
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── INVOICE DETAIL MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {viewInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#15192c]/50 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border border-rose-50 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-rose-50 pb-4 mb-6">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#ff69b4]">Invoice</span>
                  <h3 className="text-base font-black">{viewInvoice.invoiceNumber}</h3>
                </div>
                <button onClick={() => setViewInvoice(null)} className="w-8 h-8 rounded-full bg-rose-50 text-[#C4A0AC] flex items-center justify-center hover:bg-rose-100 transition-all">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-[#6B5E63]">
                {[
                  { label: 'Customer', value: viewInvoice.user?.name },
                  { label: 'Email', value: viewInvoice.user?.email },
                  { label: 'Plan', value: viewInvoice.plan?.name },
                  { label: 'Amount', value: `₹${viewInvoice.amount}` },
                  { label: 'Discount', value: viewInvoice.discountAmount > 0 ? `-₹${viewInvoice.discountAmount}` : 'None' },
                  { label: 'Tax (GST 18%)', value: `₹${viewInvoice.tax}` },
                  { label: 'Total Payable', value: `₹${viewInvoice.totalPayable?.toFixed(2)}` },
                  { label: 'Status', value: viewInvoice.status },
                  { label: 'Paid On', value: viewInvoice.paidAt ? new Date(viewInvoice.paidAt).toLocaleDateString() : 'N/A' }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-rose-50 last:border-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{row.label}</span>
                    <span className="text-xs font-bold text-[#15192c]">{row.value}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setViewInvoice(null)} className="w-full mt-6 py-3.5 bg-[#15192c] text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                Close Invoice
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionPlansScreen;

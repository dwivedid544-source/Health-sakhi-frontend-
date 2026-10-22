import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookReaderModal from '../components/BookReaderModal';
import VideoModal from '../components/VideoModal';
import { defaultPlans, PLAN_STORAGE_KEY, MEMBER_PLAN_KEY } from '../data/planCatalog';
import { useLanguage } from '../context/LanguageContext';
import i18nApi from '../api/i18nApi';

// Import new modular landing components
import Hero from '../components/landing/Hero';
import Books from '../components/landing/Books';
import Features from '../components/landing/Features';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import Blog from '../components/landing/Blog';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';
import LandingChatBot from '../components/landing/LandingChatBot';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

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

  return {
    ...plan,
    name: translateStr(plan.name),
    shortDescription: translateStr(plan.shortDescription),
    priceSubtext: translateStr(plan.priceSubtext),
    highlightTag: translateStr(plan.highlightTag),
    duration: translateStr(plan.duration),
    features: (plan.features || []).map(feat => translateStr(feat))
  };
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, langCode } = useLanguage();
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookMode, setBookMode] = useState('read');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Dynamic CMS sections state with local defaults
  const [sections, setSections] = useState({
    hero: { isActive: true },
    books: { isActive: true },
    features: { isActive: true },
    testimonials: { isActive: true },
    pricing: { isActive: true },
    blog: { isActive: true },
    cta: { isActive: true },
    footer: { isActive: true }
  });

  const [dbPlans, setDbPlans] = useState([]);

  // Fetch sections and plans from caching public API
  useEffect(() => {
    axios.get(`${API_BASE_URL}/public/landing-page`, {
      headers: {
        'Accept-Language': langCode || 'en'
      }
    })
      .then(res => {
        if (res.data && res.data.success && res.data.data) {
          setSections(res.data.data);
        }
      })
      .catch(err => {
        console.error('Failed to load landing page CMS:', err);
      });
  }, [langCode]);

  const [activePlans, setActivePlans] = useState([]);

  useEffect(() => {
    // Fetch plans from backend with Accept-Language for server-side translation
    axios.get(`${API_BASE_URL}/subscriptions/plans`, {
      headers: { 'Accept-Language': langCode || 'en' }
    })
      .then(async (res) => {
        let rawPlans = [];
        if (res.data && res.data.success && res.data.plans && res.data.plans.length > 0) {
          rawPlans = res.data.plans.map(p => {
            const durationFeat = p.features.find(f => (f.name || f.featureName) === 'Duration')?.value 
              || p.features.find(f => (f.name || f.featureName) === 'Duration')?.featureValue;
            
            const descFeat = p.features.find(f => (f.name || f.featureName) === 'Short Description')?.value 
              || p.features.find(f => (f.name || f.featureName) === 'Short Description')?.featureValue;

            const highlightFeat = p.features.find(f => (f.name || f.featureName) === 'Highlight Tag')?.value 
              || p.features.find(f => (f.name || f.featureName) === 'Highlight Tag')?.featureValue;

            const subtextFeat = p.features.find(f => (f.name || f.featureName) === 'Price Subtext')?.value 
              || p.features.find(f => (f.name || f.featureName) === 'Price Subtext')?.featureValue;

            const highlightTag = highlightFeat || (
              p.slug === 'free-sakhi' ? t('plans.freeBadge', 'FREE 🌸') :
              p.slug === 'basic-sakhi' ? t('plans.recommendedBadge', 'RECOMMENDED ⚡') :
              p.slug === 'premium-sakhi' ? t('plans.popularBadge', 'MOST POPULAR 🔥') : null
            );

            const priceSubtext = subtextFeat || (
              p.slug === 'free-sakhi' ? t('plans.freeSubtext', 'FREE FOREVER') :
              p.slug === 'basic-sakhi' ? t('plans.basicSubtext', '1 MONTH UNLIMITED BOOKS & AI') :
              p.slug === 'premium-sakhi' ? t('plans.premiumSubtext', 'ALL FEATURES UNLIMITED ACCESS') : ''
            );

            const sortedRawFeatures = [...(p.features || [])].sort((a, b) => {
              const nameA = a.name || a.featureName || '';
              const nameB = b.name || b.featureName || '';
              const idxA = nameA.toLowerCase().includes('feature') ? parseInt(nameA.replace(/\D/g, '') || '0', 10) : 0;
              const idxB = nameB.toLowerCase().includes('feature') ? parseInt(nameB.replace(/\D/g, '') || '0', 10) : 0;
              return idxA - idxB;
            });

            const filteredFeatures = sortedRawFeatures
              .filter(f => {
                const n = (f.name || f.featureName || '').toLowerCase();
                return n !== 'duration' && n !== 'short description' && n !== 'highlight tag' && n !== 'price subtext';
              })
              .map(f => f.value || f.featureValue || '')
              .filter(Boolean);

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
              price: p.slug === 'free-sakhi' ? t('plans.freePrice', 'Free') : String(p.price),
              priceSubtext,
              highlightTag,
              duration: durationFeat || (p.interval === 'MONTHLY' ? '1 Month' : p.interval === 'YEARLY' ? '12 Months' : '1 Month'),
              shortDescription: descFeat || p.description || '',
              features: filteredFeatures,
              status: p.status ? (p.status === 'ACTIVE' ? 'Active' : 'Inactive') : 'Active'
            };
          });
        } else {
          // Fallback to defaultPlans but cloned so we can mutate safely
          rawPlans = JSON.parse(JSON.stringify(defaultPlans));
        }

        let filteredPlans = rawPlans.filter(p => p.status === 'Active');

        // 1. Translate using local dictionary first
        if (langCode !== 'en') {
          filteredPlans = filteredPlans.map(plan => translatePlanLocal(plan, langCode));
        }

        // 2. Collect leftover English texts for dynamic translate
        const englishTexts = [];
        if (langCode !== 'en') {
          filteredPlans.forEach(plan => {
            const isEnglish = (str) => str && /[a-zA-Z]/.test(str);
            if (isEnglish(plan.name)) englishTexts.push(plan.name);
            if (isEnglish(plan.shortDescription)) englishTexts.push(plan.shortDescription);
            if (isEnglish(plan.priceSubtext)) englishTexts.push(plan.priceSubtext);
            if (isEnglish(plan.highlightTag)) englishTexts.push(plan.highlightTag);
            if (isEnglish(plan.duration)) englishTexts.push(plan.duration);
            (plan.features || []).forEach(feat => {
              if (isEnglish(feat)) englishTexts.push(feat);
            });
          });
        }

        // 3. Call translation API only for the leftover custom entries
        if (englishTexts.length > 0) {
          try {
            const transRes = await i18nApi.translateTexts(englishTexts, langCode);
            if (transRes?.success && transRes.translations) {
              let tIdx = 0;
              const translationMap = {};
              englishTexts.forEach(txt => {
                translationMap[txt] = transRes.translations[tIdx++];
              });

              const applyApiTranslation = (str) => {
                if (!str) return str;
                return translationMap[str] || str;
              };

              filteredPlans = filteredPlans.map(plan => ({
                ...plan,
                name: applyApiTranslation(plan.name),
                shortDescription: applyApiTranslation(plan.shortDescription),
                priceSubtext: applyApiTranslation(plan.priceSubtext),
                highlightTag: applyApiTranslation(plan.highlightTag),
                duration: applyApiTranslation(plan.duration),
                features: (plan.features || []).map(feat => applyApiTranslation(feat))
              }));
            }
          } catch (err) {
            console.error('Failed to translate subscription plans via API:', err);
          }
        }

        setActivePlans(filteredPlans.sort((a, b) => {
          const pA = a.slug === 'free-sakhi' ? 0 : Number(a.price || 0);
          const pB = b.slug === 'free-sakhi' ? 0 : Number(b.price || 0);
          return pA - pB;
        }));
      })
      .catch(async (err) => {
        console.error('Failed to load plans:', err);
        // Fallback translation using dictionary
        let filteredPlans = JSON.parse(JSON.stringify(defaultPlans)).filter(p => p.status === 'Active');
        if (langCode !== 'en') {
          filteredPlans = filteredPlans.map(plan => translatePlanLocal(plan, langCode));
        }
        setActivePlans(filteredPlans.sort((a, b) => {
          const pA = a.slug === 'free-sakhi' ? 0 : Number(a.price || 0);
          const pB = b.slug === 'free-sakhi' ? 0 : Number(b.price || 0);
          return pA - pB;
        }));
      });
  }, [langCode]);

  const handleSubscribePlan = (plan) => {
    const isLoggedIn = sessionStorage.getItem('hs_current_member');
    if (isLoggedIn) {
      try {
        const member = JSON.parse(isLoggedIn);
        if (member && member.email) {
          localStorage.setItem(MEMBER_PLAN_KEY, plan.id);
          navigate('/app/plans');
          return;
        }
      } catch (error) {
        console.error('Error parsing hs_current_member:', error);
      }
    }
    localStorage.setItem(MEMBER_PLAN_KEY, plan.id);
    navigate('/login');
  };

  const videoSourceUrl = "https://ik.imagekit.io/jcohpdmi8/health-sakhi%20(1).mp4";

  return (
    <div
      className="w-full min-h-screen relative overflow-hidden font-['Poppins']"
      style={{
        backgroundImage: "url('/Images/WhatsApp Image 2026-05-07 at 2.49.24 PM.jpeg')",
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 1. Hero Section */}
      {sections.hero && sections.hero.isActive && (
        <Hero data={sections.hero} setIsVideoModalOpen={setIsVideoModalOpen} />
      )}

      {/* 2. Books Marquee */}
      {sections.books && sections.books.isActive && (
        <Books data={sections.books} showOnly="marquee" />
      )}

      {/* 3. About Us / Doctor Bio features */}
      {sections.features && sections.features.isActive && (
        <Features data={sections.features} />
      )}

      {/* 4. Books Resources / Learning & Listening list */}
      {sections.books && sections.books.isActive && (
        <Books data={sections.books} showOnly="resources" setSelectedBook={setSelectedBook} setBookMode={setBookMode} />
      )}

      {/* 5. Testimonials */}
      {sections.testimonials && sections.testimonials.isActive && (
        <Testimonials data={sections.testimonials} />
      )}

      {/* 6. Blog Posts */}
      {sections.blog && sections.blog.isActive && (
        <Blog data={sections.blog} />
      )}

      {/* 7. Contact CTA Form */}
      {sections.cta && sections.cta.isActive && (
        <CTA data={sections.cta} />
      )}

      {/* 8. Pricing Plans */}
      {sections.pricing && sections.pricing.isActive && (
        <Pricing data={sections.pricing} activePlans={activePlans} handleSubscribePlan={handleSubscribePlan} />
      )}

      {/* 9. Footer Section */}
      {sections.footer && sections.footer.isActive && (
        <Footer data={sections.footer} />
      )}

      {/* Modals & CSS overlays */}
      <BookReaderModal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        book={selectedBook}
        initialMode={bookMode}
      />
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc={videoSourceUrl}
      />

      <LandingChatBot />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default LandingPage;

